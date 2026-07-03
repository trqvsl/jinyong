import { useMemo, useState, type KeyboardEvent } from "react"
import type { Player } from "../types"
import type { StoryEvent, Transition } from "../data/events"
import { enterNode, visibleChoices, resolveChoice } from "../game/story/engine"
import {
  buildScriptPages,
  getEventTag,
  getLetterMeta,
  mergeLetterPageText,
  summarizeConsequences,
} from "./eventPresenter"

interface Props {
  player: Player
  event: StoryEvent
  nodeId: string
  initialResult?: { text: string; transition: Transition }
  onResolve: (r: { player: Player; transition: Transition; consumedDay: boolean }) => void
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
  const [resultMeta, setResultMeta] = useState<string[]>([])
  const [pageIndex, setPageIndex] = useState(0)

  const activeText = phase === "result" ? resultText : node?.text ?? ""
  const pages = useMemo(
    () => buildScriptPages(activeText, phase === "result" ? undefined : node?.speaker),
    [activeText, node?.speaker, phase]
  )
  const currentPage = pages[Math.min(pageIndex, pages.length - 1)] ?? []
  const isReadingFinished = pageIndex >= pages.length - 1
  const showChoices = phase === "choosing" && !!node && isReadingFinished
  const canTapScript = !isReadingFinished || phase === "autoNext"
  const isLetterPresentation = event.presentation === "letter" && phase !== "result"
  const letterMeta = getLetterMeta(event, node?.title)
  const letterIntro = phase === "result" ? "" : node?.letterIntro?.trim() ?? ""
  const letterSignature = phase === "result" ? "" : node?.letterSignature?.trim() ?? ""
  const mergedLetterText = mergeLetterPageText(currentPage)

  function advancePage() {
    setPageIndex((prev) => Math.min(prev + 1, pages.length - 1))
  }

  function handleScriptTap() {
    if (!isReadingFinished) {
      advancePage()
      return
    }
    if (phase === "autoNext") handleAutoNext()
  }

  function handleScriptKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (!canTapScript) return
    if (event.key !== "Enter" && event.key !== " ") return
    event.preventDefault()
    handleScriptTap()
  }

  function handleChoose(choiceId: string) {
    if (!entered) return
    const choice = choices.find((c) => c.id === choiceId)
    if (!choice) return
    const r = resolveChoice(entered.player, entered.world, event, nodeId, choiceId)
    if (!r) return
    setResultText(r.resultText ?? "")
    setResultMeta(summarizeConsequences(choice.consequences))
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
        <div className="event-tag">{getEventTag(event, node?.title)}</div>
        <h1 className="event-title">{node?.title ?? "事后"}</h1>
      </section>

      <section
        className={`stat-panel event-script-panel${canTapScript ? " is-tappable" : ""}${isLetterPresentation ? ` is-letter ${letterMeta.className}` : ""}`}
        onClick={canTapScript ? handleScriptTap : undefined}
        onKeyDown={handleScriptKeyDown}
        role={canTapScript ? "button" : undefined}
        tabIndex={canTapScript ? 0 : undefined}
      >
        {isLetterPresentation ? (
          <>
            {letterIntro && (
              <div className="event-narration-box">
                <div className="event-intro">{letterIntro}</div>
              </div>
            )}
            <div className={`event-letter-paper ${letterMeta.className}`}>
              <div className={`event-letter-seal ${letterMeta.className}`}>{letterMeta.seal}</div>
              <div className={`event-letter-sheet ${letterMeta.className}`}>
                <div className="event-letter-heading">{node?.title ?? "书信"}</div>
                <div className="event-letter-body">{mergedLetterText}</div>
                {letterSignature && isReadingFinished && (
                  <div className="event-letter-signature">{letterSignature}</div>
                )}
              </div>
            </div>
          </>
        ) : currentPage.map((segment, index) => (
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

        {(pages.length > 1 || canTapScript) && (
          <div className="event-script-meta">
            {pages.length > 1 && (
              <div className="event-page-indicator">第 {pageIndex + 1} 页 / 共 {pages.length} 页</div>
            )}

            {canTapScript && (
              <div className="event-tap-hint">{isReadingFinished && phase === "autoNext" ? "轻触继续" : "轻触翻页"}</div>
            )}
          </div>
        )}
      </section>

      {showChoices && node && (
        <section className="stat-panel">
          <h2>可选行动</h2>
          {hasNoVisibleChoices ? (
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

      {phase === "result" && (
        <section className="stat-panel">
          {resultMeta.length > 0 && (
            <div className="event-result-meta">
              {resultMeta.map((item) => <span key={item} className="event-effect-chip">{item}</span>)}
            </div>
          )}
          <button className="menu-btn primary" onClick={handleContinue}>继续</button>
        </section>
      )}
    </div>
  )
}
