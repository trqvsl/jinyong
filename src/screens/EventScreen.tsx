import { useEffect, useMemo, useState, type KeyboardEvent } from "react"
import { ArrowRight, MapPin, ScrollText } from "lucide-react"
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
import {
  getDialoguePortrait,
  getDialoguePortraitFallback,
} from "./dialoguePortrait"
import { StoryStage } from "./StoryStage"
import { isImagePreloaded, preloadImage } from "./imagePreloader"
import { SceneTransition } from "./SceneTransition"

interface Props {
  player: Player
  event: StoryEvent
  nodeId: string
  initialPageIndex?: number
  initialResult?: { text: string; transition: Transition; title?: string; consumedDay: boolean }
  onCheckpoint: (player: Player, checkpoint: StoryCheckpoint) => void
  onResolve: (r: { player: Player; transition: Transition; consumedDay: boolean }) => void
}

const introducedDialogueCharacters = new Set<string>()

function getEventSceneClass(event: StoryEvent): string {
  if (event.presentation === "letter") return "event-scene-letter"
  return `event-scene-${event.locationId ?? "jianghu"}`
}

function DialoguePortraitView({ speaker }: { speaker?: string }) {
  const portrait = getDialoguePortrait(speaker)
  const portraitSrc = portrait?.src
  const [failed, setFailed] = useState(false)
  const [loadedPortraitSrc, setLoadedPortraitSrc] = useState(() =>
    portraitSrc && isImagePreloaded(portraitSrc) ? portraitSrc : ""
  )
  const loaded = !!portraitSrc && loadedPortraitSrc === portraitSrc

  useEffect(() => {
    setFailed(false)
    if (!portraitSrc) {
      setLoadedPortraitSrc("")
      return
    }
    setLoadedPortraitSrc(isImagePreloaded(portraitSrc) ? portraitSrc : "")
    preloadImage(portraitSrc).then(() => setLoadedPortraitSrc(portraitSrc))
  }, [portraitSrc])

  return (
    <div className={`event-rpg-portrait${portrait && loaded && !failed ? " has-image" : ""}`}>
      <span className="event-rpg-portrait-fallback" aria-hidden="true">
        {getDialoguePortraitFallback(speaker)}
      </span>
      {portrait && !failed ? (
        <img
          src={portrait.src}
          alt=""
          aria-hidden="true"
          className={loaded ? "is-loaded" : ""}
          onLoad={() => setLoadedPortraitSrc(portrait.src)}
          onError={() => setFailed(true)}
        />
      ) : null}
    </div>
  )
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
  const dialogueSegment = currentPage.find((segment) => segment.type === "dialogue")
  const narrationSegments = currentPage.filter((segment) => segment.type === "narration")
  const activePortrait = getDialoguePortrait(dialogueSegment?.speaker)
  const [characterEntrance, setCharacterEntrance] = useState<{
    name: string
    title: string
  } | null>(null)
  const isReadingFinished = pageIndex >= pages.length - 1
  const showChoices = phase === "choosing" && !!node && isReadingFinished
  const canTapScript = !isReadingFinished
    || phase === "autoNext"
    || (phase === "result" && !!pending)
  const isLetterPresentation = event.presentation === "letter" && phase !== "result"
  const activeTitle = phase === "result" ? initialResult?.title ?? node?.title ?? "事后" : node?.title ?? "事后"
  const letterMeta = getLetterMeta(event, node?.title)
  const letterIntro = phase === "result" ? "" : node?.letterIntro?.trim() ?? ""
  const letterSignature = phase === "result" ? "" : node?.letterSignature?.trim() ?? ""
  const mergedLetterText = mergeLetterPageText(currentPage)
  const eventSceneClass = getEventSceneClass(event)

  useEffect(() => {
    const speaker = dialogueSegment?.speaker
    const entranceKey = activePortrait?.name ?? speaker
    if (!speaker || !entranceKey || introducedDialogueCharacters.has(entranceKey)) return
    introducedDialogueCharacters.add(entranceKey)
    setCharacterEntrance({
      name: activePortrait?.name ?? speaker,
      title: activePortrait?.title ?? "江湖人物",
    })
    const timer = window.setTimeout(() => setCharacterEntrance(null), 1800)
    return () => window.clearTimeout(timer)
  }, [activePortrait, dialogueSegment?.speaker])

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
    if (phase === "result") handleContinue()
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
    if (choice.kind === "travel" && !r.resultText?.trim()) {
      onResolve({
        player: r.player,
        transition: r.transition,
        consumedDay: choice.consumeDay ?? false,
      })
      return
    }
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

  function handleContinue() {
    if (!isReadingFinished) {
      advancePage()
      return
    }
    if (pending) onResolve({ player: pending.player, transition: pending.transition, consumedDay: pending.consumedDay })
  }

  return (
    <div className={`event-screen ${eventSceneClass}`}>
      {node?.sceneTransition && (
        <SceneTransition transition={node.sceneTransition} />
      )}
      <header className="top-bar event-topbar">
        <span className="player-name"><ScrollText size={18} /> 江湖纪事</span>
        <span className="day-info">第 {player.day} 日</span>
      </header>

      <main className="event-stage">
        {node?.stage ? (
          <StoryStage
            stage={node.stage}
            activeSpeaker={dialogueSegment?.speaker}
          />
        ) : (
          <>
            <div className="event-stage-art" aria-hidden="true" />
            <div className="event-stage-shade" aria-hidden="true" />
          </>
        )}
        {characterEntrance && (
          <div className="event-character-entrance" aria-live="polite">
            <span>人物入场</span>
            <strong>{characterEntrance.name}</strong>
            <small>{characterEntrance.title}</small>
          </div>
        )}
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
            aria-label={canTapScript ? "继续对话" : undefined}
            aria-live="polite"
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
              ) : dialogueSegment ? (
                <div key={`${nodeId}:${phase}:${pageIndex}`} className="event-rpg-dialogue">
                  {narrationSegments.length > 0 && (
                    <div className="event-rpg-dialogue-context">
                      {narrationSegments.map((segment, index) => (
                        <span key={`context-${pageIndex}-${index}`}>{segment.text}</span>
                      ))}
                    </div>
                  )}
                  <div className="event-rpg-dialogue-layout">
                    <DialoguePortraitView speaker={dialogueSegment.speaker} />
                    <blockquote className="event-rpg-dialogue-copy">
                      <div className="event-dialogue-name">{dialogueSegment.speaker ?? "来人"}</div>
                      <div className="event-dialogue-text">{dialogueSegment.text}</div>
                    </blockquote>
                  </div>
                </div>
              ) : (
                <div key={`${nodeId}:${phase}:${pageIndex}`} className="event-rpg-narration">
                  <span className="event-rpg-narration-mark" aria-hidden="true" />
                  <div>
                    {narrationSegments.map((segment, index) => (
                      <p key={`narration-${pageIndex}-${index}`}>{segment.text}</p>
                    ))}
                  </div>
                </div>
              )}

            {canTapScript && (
              <span className="event-continue-caret" aria-hidden="true" />
            )}
          </section>
        </div>
      </main>

      {showChoices && node && (
        <section className="event-decision-panel">
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
                <button
                  key={c.id}
                  className={`event-choice-card${c.kind === "travel" ? " is-travel" : ""}`}
                  onClick={() => handleChoose(c.id)}
                >
                  <span className="event-choice-index">
                    {c.kind === "travel" ? <MapPin size={16} /> : index + 1}
                  </span>
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

      {phase === "result" && resultMeta.length > 0 && (
        <section className="event-outcome-panel">
          <div className="event-result-meta">
            {resultMeta.map((item) => <span key={item} className="event-effect-chip">{item}</span>)}
          </div>
        </section>
      )}
    </div>
  )
}
