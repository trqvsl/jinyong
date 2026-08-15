import { useEffect, useMemo, useState, type KeyboardEvent } from "react"
import { ArrowRight, ScrollText, Swords } from "lucide-react"
import type { Player } from "../types"
import type { StoryEvent, Transition } from "../data/events"
import type { StoryCheckpoint, StoryCheckpointPhase } from "../data/story/schema"
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
  initialPageIndex?: number
  initialResult?: { text: string; transition: Transition; title?: string; consumedDay: boolean }
  onCheckpoint: (player: Player, checkpoint: StoryCheckpoint) => void
  onResolve: (r: { player: Player; transition: Transition; consumedDay: boolean }) => void
}

function getEventSceneClass(event: StoryEvent): string {
  if (event.presentation === "letter") return "event-scene-letter"
  return `event-scene-${event.locationId ?? "jianghu"}`
}

export function EventScreen({ player, event, nodeId, initialPageIndex = 0, initialResult, onCheckpoint, onResolve }: Props) {
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
    initialResult ? { player, transition: initialResult.transition, consumedDay: initialResult.consumedDay } : null
  )
  const [resultMeta, setResultMeta] = useState<string[]>([])
  const [pageIndex, setPageIndex] = useState(initialPageIndex)
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
  const activeTitle = phase === "result" ? initialResult?.title ?? node?.title ?? "事后" : node?.title ?? "事后"
  const letterMeta = getLetterMeta(event, node?.title)
  const letterIntro = phase === "result" ? "" : node?.letterIntro?.trim() ?? ""
  const letterSignature = phase === "result" ? "" : node?.letterSignature?.trim() ?? ""
  const mergedLetterText = mergeLetterPageText(currentPage)
  const eventSceneClass = getEventSceneClass(event)

  function createCheckpoint(
    nextPhase: StoryCheckpointPhase,
    nextPageIndex: number,
    result?: { text: string; transition: Transition; consumedDay: boolean; title?: string },
  ): StoryCheckpoint {
    const previous = player.world.currentStory
    return {
      eventId: event.id,
      nodeId,
      phase: nextPhase,
      pageIndex: nextPageIndex,
      locationId: previous?.eventId === event.id ? previous.locationId : null,
      resultText: result?.text,
      resultTitle: result?.title,
      transition: result?.transition,
      consumedDay: result?.consumedDay,
    }
  }

  useEffect(() => {
    if (!entered || initialResult) return
    onCheckpoint(
      entered.player,
      createCheckpoint(isAutoNextNode ? "autoNext" : "choosing", initialPageIndex),
    )
    // 只在进入新节点时落一次 onEnter 与初始阅读位置。
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event.id, nodeId])

  function advancePage() {
    const nextPageIndex = Math.min(pageIndex + 1, pages.length - 1)
    setPageIndex(nextPageIndex)
    const checkpointPlayer = pending?.player ?? entered?.player ?? player
    const result = phase === "result" && pending
      ? {
          text: resultText,
          transition: pending.transition,
          consumedDay: pending.consumedDay,
          title: activeTitle,
        }
      : undefined
    onCheckpoint(checkpointPlayer, createCheckpoint(phase, nextPageIndex, result))
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
    onCheckpoint(
      r.player,
      createCheckpoint("result", 0, {
        text: r.resultText ?? "",
        transition: r.transition,
        consumedDay: choice.consumeDay ?? false,
        title: node?.title,
      }),
    )
  }

  // 纯叙事节点的"继续"：onEnter 已在 enterNode 时结算，直接走 autoNext transition
  function handleAutoNext() {
    if (!entered || !node?.autoNext) return
    onResolve({ player: entered.player, transition: node.autoNext, consumedDay: false })
  }

  function getTapHint() {
    if (phase === "autoNext" && isReadingFinished) return "轻触进入下一段"
    return "轻触继续看下去"
  }

  function getContinueLabel() {
    if (!pending) return "返回江湖"
    if (!isReadingFinished) return "继续看下去"

    switch (pending.transition.type) {
      case "battle":
        return "进入战斗"
      case "goto":
      case "gotoEvent":
        return "进入下一段"
      case "end":
        return "返回江湖"
      case "gameOver":
        return "迎来结局"
      default:
        return "继续"
    }
  }

  function handleContinue() {
    if (!isReadingFinished) {
      advancePage()
      return
    }
    if (pending) onResolve({ player: pending.player, transition: pending.transition, consumedDay: pending.consumedDay })
  }

  return (
    <div className={`event-screen ${eventSceneClass}`}>
      <header className="top-bar event-topbar">
        <span className="player-name"><ScrollText size={18} /> 江湖纪事</span>
        <span className="day-info">第 {player.day} 日</span>
      </header>

      <main className="event-stage">
        <div className="event-stage-art" aria-hidden="true" />
        <div className="event-stage-shade" aria-hidden="true" />
        <div className="event-stage-content">
          <div className="event-heading">
            <div className="event-tag">{getEventTag(event, activeTitle)}</div>
            <h1 className="event-title">{activeTitle}</h1>
          </div>

          <section
            className={`event-script-panel${canTapScript ? " is-tappable" : ""}${isLetterPresentation ? ` is-letter ${letterMeta.className}` : ""}`}
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
                  <blockquote
                    key={`dialogue-${pageIndex}-${index}-${segment.speaker ?? "anon"}`}
                    className="event-dialogue-box"
                  >
                    <div className="event-dialogue-name">{segment.speaker ?? "来人"}</div>
                    <div className="event-dialogue-text">{segment.text}</div>
                  </blockquote>
                ) : (
                  <div key={`narration-${pageIndex}-${index}`} className="event-narration-box">
                    <div className="event-intro">{segment.text}</div>
                  </div>
                )
              ))}

            {(pages.length > 1 || canTapScript) && (
              <div className="event-script-meta">
                {pages.length > 1 && (
                  <div className="event-page-indicator">{pageIndex + 1} / {pages.length}</div>
                )}

                {canTapScript && (
                  <div className="event-tap-hint">{getTapHint()} <ArrowRight size={14} /></div>
                )}
              </div>
            )}
          </section>
        </div>
      </main>

      {showChoices && node && (
        <section className="event-decision-panel">
          <div className="event-decision-heading"><Swords size={17} /> 你要如何应对</div>
          {hasNoVisibleChoices ? (
            <>
              <div className="event-result-text">此时此地，你已没有可作出的选择。</div>
              <button className="menu-btn primary" onClick={() => onResolve({ player: entered!.player, transition: { type: "end" }, consumedDay: false })}>
                返回江湖
              </button>
            </>
          ) : (
            <div className="event-choice-list">
              {choices.map((c, index) => (
                <button key={c.id} className="event-choice-card" onClick={() => handleChoose(c.id)}>
                  <span className="event-choice-index">{index + 1}</span>
                  <span className="event-choice-copy">
                    <span className="event-choice-title">{c.text}</span>
                    <span className="event-choice-desc">{c.description}</span>
                  </span>
                  <ArrowRight className="event-choice-arrow" size={18} />
                </button>
              ))}
            </div>
          )}
        </section>
      )}

      {phase === "result" && (
        <section className="event-outcome-panel">
          {resultMeta.length > 0 && (
            <div className="event-result-meta">
              {resultMeta.map((item) => <span key={item} className="event-effect-chip">{item}</span>)}
            </div>
          )}
          <button className="event-continue-btn" onClick={handleContinue}>
            {getContinueLabel()} <ArrowRight size={18} />
          </button>
        </section>
      )}
    </div>
  )
}
