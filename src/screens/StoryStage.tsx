import { useEffect, useMemo, useState, type CSSProperties } from "react"
import { LoaderCircle } from "lucide-react"
import type { StoryStage as StoryStageData } from "../data/story/schema"
import {
  STORY_STAGE_BACKGROUNDS,
  STORY_STAGE_PROP_ASSETS,
} from "../data/story/stageAssets"
import {
  getDialoguePortrait,
  getDialoguePortraitFallback,
} from "./dialoguePortrait"
import { isImagePreloaded, preloadImages } from "./imagePreloader"

interface Props {
  stage: StoryStageData
  activeSpeaker?: string
}

export function StoryStage({ stage, activeSpeaker }: Props) {
  const background = STORY_STAGE_BACKGROUNDS[stage.sceneId]
  const activePortrait = getDialoguePortrait(activeSpeaker)
  const assetUrls = useMemo(() => [
    ...(background ? [background] : []),
    ...(stage.actors ?? [])
      .map((actor) => getDialoguePortrait(actor.name)?.src)
      .filter((src): src is string => !!src),
    ...(stage.props ?? [])
      .map((prop) => STORY_STAGE_PROP_ASSETS[prop.id]?.src)
      .filter((src): src is string => !!src),
  ], [background, stage.actors, stage.props])
  const assetKey = assetUrls.join("|")
  const [readyAssetKey, setReadyAssetKey] = useState(() =>
    assetUrls.every((src) => isImagePreloaded(src)) ? assetKey : ""
  )
  const ready = readyAssetKey === assetKey

  useEffect(() => {
    let cancelled = false
    const alreadyReady = assetUrls.every((src) => isImagePreloaded(src))
    setReadyAssetKey(alreadyReady ? assetKey : "")
    if (!alreadyReady) {
      preloadImages(assetUrls).then(() => {
        if (!cancelled) setReadyAssetKey(assetKey)
      })
    }
    return () => {
      cancelled = true
    }
  }, [assetKey, assetUrls])

  return (
    <div
      className={`story-stage${ready ? " is-ready" : " is-loading"}`}
      data-scene={stage.sceneId}
      style={{
        "--story-stage-background": ready && background ? `url("${background}")` : "none",
      } as CSSProperties}
      aria-label={`场景：${stage.sceneLabel}`}
      aria-busy={!ready}
    >
      <div className="story-stage-backdrop" aria-hidden="true" />
      <div className="story-stage-location">{stage.sceneLabel}</div>
      {!ready && (
        <div className="story-stage-loading" role="status">
          <LoaderCircle size={22} />
          <span>布置场景</span>
        </div>
      )}

      <div className="story-stage-cast" aria-label="在场人物">
        {(stage.actors ?? []).map((actor) => {
          const portrait = getDialoguePortrait(actor.name)
          const isActive = !!activeSpeaker && (
            actor.name === activeSpeaker
            || !!portrait && portrait.name === activePortrait?.name
          )
          return (
            <div
              key={`${actor.name}-${actor.slot}`}
              className={[
                "story-stage-actor",
                `slot-${actor.slot}`,
                `motion-${actor.motion ?? "idle"}`,
                `scale-${actor.scale ?? "normal"}`,
                actor.focus || isActive ? "is-focused" : "",
                activeSpeaker && !isActive ? "is-muted" : "",
              ].filter(Boolean).join(" ")}
            >
              <div className="story-stage-actor-frame">
                <span className="story-stage-actor-fallback" aria-hidden="true">
                  {getDialoguePortraitFallback(actor.name)}
                </span>
                {portrait && (
                  <img src={portrait.src} alt="" aria-hidden="true" />
                )}
              </div>
              <span className="story-stage-actor-name">{actor.name}</span>
            </div>
          )
        })}
      </div>

      <div className="story-stage-props" aria-label="场景动态">
        {(stage.props ?? []).map((prop) => {
          const asset = STORY_STAGE_PROP_ASSETS[prop.id]
          if (!asset) return null
          return (
            <div
              key={`${prop.id}-${prop.slot}`}
              className={`story-stage-prop slot-${prop.slot} motion-${prop.motion ?? "idle"}`}
              title={prop.label ?? asset.alt}
            >
              <img src={asset.src} alt={asset.alt} />
            </div>
          )
        })}
      </div>
    </div>
  )
}
