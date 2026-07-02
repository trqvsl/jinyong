import { useMemo, useState } from "react"
import type { Player } from "../types"
import type { StoryEvent, Transition } from "../data/events"
import { enterNode, visibleChoices, resolveChoice } from "../game/story/engine"

// ============================================================
// 剧情事件界面：纯展示，所有结算/流转交给引擎 + App 路由
// - choosing：显示当前节点正文 + 可见选项（condition 过滤）
// - autoNext：纯叙事节点（无 choices，有 autoNext），显示正文 + "继续"
// - result：显示选项/战后结果文字，点"继续"把 transition 交回 App
// - initialResult：进入时直接显示结果（用于战后衔接），跳过节点选项
// ============================================================

interface Props {
  player: Player
  event: StoryEvent
  nodeId: string
  initialResult?: { text: string; transition: Transition }
  onResolve: (r: { player: Player; transition: Transition; consumedDay: boolean }) => void
}

const PAGE_CHAR_LIMIT = 72

interface ScriptSegment {
  type: "narration" | "dialogue"
  text: string
  speaker?: string
}

function splitTextChunks(text: string): string[] {
  const normalized = text.trim()
  if (!normalized) return [""]

  const paragraphs = normalized
    .split(/\n{2,}/)
    .map((part) => part.trim())
    .filter(Boolean)

  const chunks: string[] = []

  for (const paragraph of paragraphs.length > 0 ? paragraphs : [normalized]) {
    const sentences = paragraph
      .split(/(?<=[。！？；])/)
      .map((part) => part.trim())
      .filter(Boolean)

    let current = ""
    for (const sentence of sentences.length > 0 ? sentences : [paragraph]) {
      if (!current) {
        current = sentence
        continue
      }
      if ((current + sentence).length > PAGE_CHAR_LIMIT) {
        chunks.push(current)
        current = sentence
      } else {
        current += sentence
      }
    }
    if (current) chunks.push(current)
  }

  return chunks.length > 0 ? chunks : [normalized]
}

function inferSpeaker(context: string, fallbackSpeaker?: string): string | undefined {
  const compact = context.replace(/\s+/g, "").slice(-40)
  const match = compact.match(/([一-龥A-Za-z0-9·]{2,12})(?:[一-龥，、；：]{0,8})?(?:道|说道|笑道|冷笑道|低声道|轻声道|高声道|喝道|问道|答道|叹道|叫道|喃喃道|缓缓道|淡淡道|沉声道|大笑道|开口道|回头道)[:：]?$/)
  return match?.[1] ?? fallbackSpeaker
}

function parseStorySegments(text: string, fallbackSpeaker?: string): ScriptSegment[] {
  const normalized = text.trim()
  if (!normalized) return [{ type: "narration", text: "" }]

  const quoteRegex = /“([^”]+)”/g
  const segments: ScriptSegment[] = []
  let cursor = 0
  let matched = false

  for (const match of normalized.matchAll(quoteRegex)) {
    matched = true
    const full = match[0]
    const quote = match[1]?.trim() ?? ""
    const index = match.index ?? 0
    const before = normalized.slice(cursor, index).trim()
    if (before) segments.push({ type: "narration", text: before })
    if (quote) {
      segments.push({ type: "dialogue", text: quote, speaker: inferSpeaker(before, fallbackSpeaker) })
    }
    cursor = index + full.length
  }

  const after = normalized.slice(cursor).trim()
  if (after) segments.push({ type: "narration", text: after })

  if (!matched) {
    return [{ type: fallbackSpeaker ? "dialogue" : "narration", text: normalized, speaker: fallbackSpeaker }]
  }

  return segments.length > 0 ? segments : [{ type: "narration", text: normalized }]
}

function buildScriptPages(text: string, fallbackSpeaker?: string): ScriptSegment[][] {
  const segments = parseStorySegments(text, fallbackSpeaker)
  const pages: ScriptSegment[][] = []
  let currentPage: ScriptSegment[] = []
  let currentChars = 0

  for (const segment of segments) {
    const chunks = splitTextChunks(segment.text)
    for (const chunk of chunks) {
      if (currentPage.length > 0 && currentChars + chunk.length > PAGE_CHAR_LIMIT) {
        pages.push(currentPage)
        currentPage = []
        currentChars = 0
      }
      currentPage.push({ ...segment, text: chunk })
      currentChars += chunk.length
    }
  }

  if (currentPage.length > 0) pages.push(currentPage)
  return pages.length > 0 ? pages : [[{ type: "narration", text: text.trim() }]]
}

export function EventScreen({ player, event, nodeId, initialResult, onResolve }: Props) {
  // 进入节点：onEnter 幂等结算。initialResult 模式不进入节点（只显示结果）
  const entered = initialResult ? null : enterNode(player, player.world, event, nodeId)
  const node = entered?.node
  const choices = entered ? visibleChoices(entered.player, entered.world, entered.node) : []
  const isAutoNextNode = !!(node && !node.choices && node.autoNext)
  const hasNoVisibleChoices = !!(node && (node.choices?.length ?? 0) > 0 && choices.length === 0)

  const [phase, setPhase] = useState<"choosing" | "autoNext" | "result">(
    initialResult ? "result" : isAutoNextNode ? "autoNext" : "choosing"
  )
  const [resultText, setResultText] = useState<string>(initialResult?.text ?? "")
  const [pending, setPending] = useState<{ player: Player; transition: Transition; consumedDay: boolean } | null>(
    initialResult ? { player, transition: initialResult.transition, consumedDay: false } : null
  )
  const [pageIndex, setPageIndex] = useState(0)

  const activeText = phase === "result" ? resultText : node?.text ?? ""
  const pages = useMemo(
    () => buildScriptPages(activeText, phase === "result" ? undefined : node?.speaker),
    [activeText, node?.speaker, phase]
  )
  const currentPage = pages[Math.min(pageIndex, pages.length - 1)] ?? []
  const isReadingFinished = pageIndex >= pages.length - 1

  function advancePage() {
    setPageIndex((prev) => Math.min(prev + 1, pages.length - 1))
  }

  function handleChoose(choiceId: string) {
    if (!entered) return
    const choice = choices.find((c) => c.id === choiceId)
    if (!choice) return
    const r = resolveChoice(entered.player, entered.world, event, nodeId, choiceId)
    if (!r) return
    setResultText(r.resultText ?? "")
    setPending({ player: r.player, transition: r.transition, consumedDay: choice.consumeDay ?? false })
    setPageIndex(0)
    setPhase("result")
  }

  // 纯叙事节点的"继续"：onEnter 已在 enterNode 时结算，直接走 autoNext transition
  function handleAutoNext() {
    if (!entered || !node?.autoNext) return
    onResolve({ player: entered.player, transition: node.autoNext, consumedDay: false })
  }

  function handleContinue() {
    if (!isReadingFinished) {
      advancePage()
      return
    }
    if (pending) onResolve({ player: pending.player, transition: pending.transition, consumedDay: pending.consumedDay })
  }

  return (
    <div className="event-screen">
      <header className="top-bar">
        <span className="player-name">江湖奇遇</span>
        <span className="day-info">第 {player.day} 日</span>
      </header>

      <section className="event-hero stat-panel">
        <div className="event-tag">见闻</div>
        <h1 className="event-title">{node?.title ?? "事后"}</h1>
      </section>

      <section className="stat-panel event-script-panel">
        {currentPage.map((segment, index) => (
          segment.type === "dialogue" ? (
            <div key={`dialogue-${index}-${segment.speaker ?? "anon"}`} className="event-dialogue-box">
              <div className="event-portrait-frame">{(segment.speaker ?? "人").slice(0, 1)}</div>
              <div className="event-dialogue-main">
                <div className="event-dialogue-name">{segment.speaker ?? "人物"}</div>
                <div className="event-dialogue-text">{segment.text}</div>
              </div>
            </div>
          ) : (
            <div key={`narration-${index}`} className="event-narration-box">
              <div className="event-intro">{segment.text}</div>
            </div>
          )
        ))}

        {pages.length > 1 && (
          <div className="event-page-indicator">{pageIndex + 1} / {pages.length}</div>
        )}
      </section>

      {phase === "choosing" && node && (
        <section className="stat-panel">
          <h2>你的选择</h2>
          {!isReadingFinished ? (
            <button className="menu-btn primary" onClick={advancePage}>继续阅读</button>
          ) : hasNoVisibleChoices ? (
            <>
              <div className="event-result-text">此时此地，你已没有可作出的选择。</div>
              <button className="menu-btn primary" onClick={() => onResolve({ player: entered!.player, transition: { type: "end" }, consumedDay: false })}>
                继续
              </button>
            </>
          ) : (
            <div className="event-choice-list">
              {choices.map((c) => (
                <button key={c.id} className="event-choice-card" onClick={() => handleChoose(c.id)}>
                  <span className="event-choice-title">{c.text}</span>
                  <span className="event-choice-desc">{c.description}</span>
                </button>
              ))}
            </div>
          )}
        </section>
      )}

      {phase === "autoNext" && (
        <section className="stat-panel">
          <button className="menu-btn primary" onClick={isReadingFinished ? handleAutoNext : advancePage}>{isReadingFinished ? "继续" : "继续阅读"}</button>
        </section>
      )}

      {phase === "result" && (
        <section className="stat-panel">
          <button className="menu-btn primary" onClick={handleContinue}>继续</button>
        </section>
      )}
    </div>
  )
}
