import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react"
import {
  ArrowLeft,
  Backpack,
  Dumbbell,
  Eye,
  Footprints,
  LoaderCircle,
  Map,
  MapPin,
  MessageCircle,
  ShoppingBag,
  Signpost,
  Swords,
  Trees,
} from "lucide-react"
import type { Player } from "../types"
import {
  STORY_AREA_MAPS,
  type StoryAreaAction,
  type StoryAreaSpot,
} from "../data/story/areaMaps"
import { getNpcById, npcToEnemy } from "../data/npcs"
import { getStoryEventById } from "../game/story/query"
import {
  getDialoguePortrait,
  getDialoguePortraitFallback,
} from "./dialoguePortrait"
import {
  isImagePreloaded,
  preloadImage,
  preloadImages,
} from "./imagePreloader"
import { SceneTransition } from "./SceneTransition"

interface Props {
  player: Player
  initialSpotId?: string | null
  onResume: () => void
  onOpenShop: (spotId: string) => void
  onOpenInventory: (spotId: string) => void
  onChallenge: (
    enemy: ReturnType<typeof npcToEnemy>,
    npcId: string,
    spotId: string,
  ) => void
  onExit: () => void
}

interface SpaceTransitionState {
  spot: StoryAreaSpot
  phase: "cover" | "reveal"
}

function SpotIcon({ spot }: { spot: StoryAreaSpot }) {
  if (spot.kind === "story") return <Footprints size={18} />
  if (spot.kind === "training") return <Dumbbell size={18} />
  if (spot.kind === "exit") return <Signpost size={18} />
  return <Trees size={17} />
}

function ActionIcon({ action }: { action: StoryAreaAction }) {
  if (action.kind === "talk") return <MessageCircle size={18} />
  if (action.kind === "inspect") return <Eye size={18} />
  if (action.kind === "shop") return <ShoppingBag size={18} />
  if (action.kind === "inventory") return <Backpack size={18} />
  if (action.kind === "spar") return <Swords size={18} />
  return <Signpost size={18} />
}

export function AreaScreen({
  player,
  initialSpotId,
  onResume,
  onOpenShop,
  onOpenInventory,
  onChallenge,
  onExit,
}: Props) {
  const checkpoint = player.world.currentStory
  const area = useMemo(
    () => STORY_AREA_MAPS.find((item) => item.locationId === checkpoint?.locationId),
    [checkpoint?.locationId],
  )
  const activeStorySpot = area?.spots.find((spot) =>
    spot.kind === "story" && spot.storyTargets?.some((target) =>
      target.eventId === checkpoint?.eventId && target.nodeId === checkpoint?.nodeId
    )
  )
  const [view, setView] = useState<"map" | "space">(
    initialSpotId ? "space" : "map",
  )
  const [currentSpotId, setCurrentSpotId] = useState(
    initialSpotId ?? activeStorySpot?.id ?? "",
  )
  const [spaceMessage, setSpaceMessage] = useState("")
  const [readyMapBackground, setReadyMapBackground] = useState("")
  const [readySpaceId, setReadySpaceId] = useState("")
  const [transition, setTransition] = useState<SpaceTransitionState | null>(null)
  const timers = useRef<number[]>([])

  const currentSpot = area?.spots.find((spot) => spot.id === currentSpotId)
    ?? activeStorySpot
    ?? area?.spots[0]
  const isAreaEntry = checkpoint?.areaEntry === true
  const mapReady = !!area && readyMapBackground === area.background
  const spaceReady = !!currentSpot && readySpaceId === currentSpot.id
  const activeEvent = checkpoint ? getStoryEventById(checkpoint.eventId) : undefined
  const activeNodeTitle = checkpoint
    ? activeEvent?.nodes[checkpoint.nodeId]?.title
    : undefined

  useEffect(() => {
    const activeTimers = timers.current
    return () => {
      for (const timer of activeTimers) window.clearTimeout(timer)
    }
  }, [])

  useEffect(() => {
    if (!area) return
    let cancelled = false
    setReadyMapBackground(isImagePreloaded(area.background) ? area.background : "")
    preloadImage(area.background).then(() => {
      if (!cancelled) setReadyMapBackground(area.background)
    })
    return () => {
      cancelled = true
    }
  }, [area])

  useEffect(() => {
    if (!currentSpot || view !== "space") return
    let cancelled = false
    const portraitUrls = currentSpot.space.residents
      .map((resident) => getDialoguePortrait(resident.name)?.src)
      .filter((src): src is string => !!src)
    preloadImages([currentSpot.space.background, ...portraitUrls]).then(() => {
      if (!cancelled) setReadySpaceId(currentSpot.id)
    })
    return () => {
      cancelled = true
    }
  }, [currentSpot, view])

  if (!area || !checkpoint?.paused) {
    return (
      <div className="story-area-screen is-empty">
        <p>此处没有可用的村中路引。</p>
        <button className="menu-btn" onClick={onExit}>返回客舍</button>
      </div>
    )
  }

  function schedule(callback: () => void, delay: number) {
    const timer = window.setTimeout(callback, delay)
    timers.current.push(timer)
  }

  function enterSpot(spot: StoryAreaSpot) {
    setSpaceMessage("")
    setTransition({ spot, phase: "cover" })
    const startedAt = window.performance.now()
    const portraitUrls = spot.space.residents
      .map((resident) => getDialoguePortrait(resident.name)?.src)
      .filter((src): src is string => !!src)

    preloadImages([spot.space.background, ...portraitUrls]).then(() => {
      const remaining = Math.max(0, 320 - (window.performance.now() - startedAt))
      schedule(() => {
        setCurrentSpotId(spot.id)
        setReadySpaceId(spot.id)
        setView("space")
        setTransition({ spot, phase: "reveal" })
        schedule(() => setTransition(null), 520)
      }, remaining)
    })
  }

  function returnToMap() {
    if (!currentSpot) {
      setView("map")
      return
    }
    setTransition({ spot: currentSpot, phase: "cover" })
    schedule(() => {
      setView("map")
      setTransition({ spot: currentSpot, phase: "reveal" })
      schedule(() => setTransition(null), 520)
    }, 320)
  }

  function handleAction(action: StoryAreaAction) {
    if (!currentSpot) return
    if (action.kind === "shop") {
      onOpenShop(currentSpot.id)
      return
    }
    if (action.kind === "inventory") {
      onOpenInventory(currentSpot.id)
      return
    }
    if (action.kind === "spar" && action.npcId) {
      const npc = getNpcById(action.npcId)
      if (npc) onChallenge(npcToEnemy(npc), npc.id, currentSpot.id)
      return
    }
    if (action.kind === "exit") {
      onExit()
      return
    }
    setSpaceMessage(action.resultText ?? action.description)
  }

  const transitionView = transition && (
    <SceneTransition
      key={`${transition.spot.id}:${transition.phase}`}
      phase={transition.phase}
      transition={{
        title: transition.phase === "cover"
          ? transition.spot.name
          : transition.spot.space.sceneLabel,
        subtitle: transition.spot.space.kicker,
        timeLabel: `第 ${player.day} 日`,
        tone: transition.spot.id === "west-grove" ? "night" : "ink",
      }}
    />
  )

  if (view === "map") {
    return (
      <div className="story-area-screen">
        {transitionView}
        <header className="story-area-topbar">
          <button className="back-btn" onClick={onExit} title="离开当前地点">
            <ArrowLeft size={18} /> 返回客舍
          </button>
          <span>{area.subtitle}</span>
          <span>第 {player.day} 日</span>
        </header>

        <section className="story-area-heading">
          <div>
            <span className="story-area-kicker"><MapPin size={14} /> 当前地点</span>
            <h1>{area.name}</h1>
            <p>选择村中地点，直接进入对应空间。</p>
          </div>
          <div className="story-area-progress">
            <span>{isAreaEntry ? "主线起点" : "未完之事"}</span>
            <strong>{activeStorySpot?.name ?? "村中游历"}</strong>
          </div>
        </section>

        <section
          className={`story-area-map${mapReady ? " is-ready" : " is-loading"}`}
          style={{
            "--story-area-background": mapReady ? `url("${area.background}")` : "none",
          } as CSSProperties}
          aria-label={`${area.name}局部地图`}
          aria-busy={!mapReady}
        >
          <div className="story-area-map-shade" aria-hidden="true" />
          {!mapReady && (
            <div className="story-area-map-loading" role="status">
              <LoaderCircle size={22} />
              <span>铺开牛家村路引</span>
            </div>
          )}
          {area.spots.map((spot) => {
            const isActive = spot.id === activeStorySpot?.id
            const style = {
              "--spot-x": `${spot.x}%`,
              "--spot-y": `${spot.y}%`,
            } as CSSProperties

            return (
              <button
                key={spot.id}
                className={[
                  "story-area-spot",
                  "is-action",
                  `kind-${spot.kind}`,
                  isActive ? "is-active" : "",
                ].filter(Boolean).join(" ")}
                style={style}
                onClick={() => enterSpot(spot)}
                title={spot.description}
              >
                <SpotIcon spot={spot} />
                <span>{spot.name}</span>
                <small>
                  {isActive
                    ? isAreaEntry ? "主线起点" : "剧情续接"
                    : spot.kind === "training"
                      ? "教头在场"
                      : spot.kind === "exit"
                        ? "通往官道"
                        : "进入地点"}
                </small>
              </button>
            )
          })}
        </section>
      </div>
    )
  }

  if (!currentSpot) return null

  const isActiveSpace = currentSpot.id === activeStorySpot?.id
  const storyActionLabel = isAreaEntry
    ? currentSpot.id === "riverbank" ? "入席听书" : "开始主线"
    : `继续 · ${activeNodeTitle ?? "未完之事"}`

  return (
    <div className="story-area-screen area-place-screen">
      {transitionView}
      <header className="story-area-topbar">
        <button className="back-btn" onClick={returnToMap} title="返回牛家村地图">
          <Map size={18} /> 牛家村地图
        </button>
        <span>{currentSpot.space.sceneLabel}</span>
        <span>第 {player.day} 日</span>
      </header>

      <main
        className={`area-place-stage${spaceReady ? " is-ready" : " is-loading"}`}
        style={{
          "--area-place-background": spaceReady
            ? `url("${currentSpot.space.background}")`
            : "none",
        } as CSSProperties}
        aria-busy={!spaceReady}
      >
        {!spaceReady && (
          <div className="area-place-loading" role="status">
            <LoaderCircle size={24} />
            <span>进入{currentSpot.name}</span>
          </div>
        )}
        <div className="area-place-backdrop" aria-hidden="true" />
        <section className="area-place-heading">
          <span>{currentSpot.space.kicker}</span>
          <h1>{currentSpot.name}</h1>
          <p>{currentSpot.space.description}</p>
          <small>{currentSpot.space.ambience}</small>
        </section>

        <section className="area-place-residents" aria-label="在场人物">
          {currentSpot.space.residents.length === 0 ? (
            <div className="area-place-empty-resident">
              <Trees size={22} />
              <span>此处暂时无人，只有环境痕迹可查。</span>
            </div>
          ) : currentSpot.space.residents.map((resident) => {
            const portrait = getDialoguePortrait(resident.name)
            return (
              <article key={resident.name} className="area-resident-card">
                <div className="area-resident-portrait">
                  <span>{getDialoguePortraitFallback(resident.name)}</span>
                  {portrait && <img src={portrait.src} alt="" aria-hidden="true" />}
                </div>
                <div>
                  <small>{resident.title}</small>
                  <strong>{resident.name}</strong>
                  <p>{resident.line}</p>
                </div>
              </article>
            )
          })}
        </section>

        <section className="area-place-command-deck">
          <div className="area-place-message">
            <span>此处见闻</span>
            <p>{spaceMessage || currentSpot.space.ambience}</p>
          </div>
          <div className="area-place-actions">
            {isActiveSpace && (
              <button className="area-place-action primary" onClick={onResume}>
                <Footprints size={19} />
                <span>
                  <strong>{storyActionLabel}</strong>
                  <small>进入当前主线场景</small>
                </span>
              </button>
            )}
            {currentSpot.space.actions.map((action) => (
              <button
                key={action.id}
                className={`area-place-action kind-${action.kind}`}
                onClick={() => handleAction(action)}
              >
                <ActionIcon action={action} />
                <span>
                  <strong>{action.label}</strong>
                  <small>{action.description}</small>
                </span>
              </button>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
