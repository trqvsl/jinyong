import { useEffect, useState } from "react"
import type { StorySceneTransition } from "../data/story/schema"

interface Props {
  transition: StorySceneTransition
  phase?: "auto" | "cover" | "reveal"
  onComplete?: () => void
}

export function SceneTransition({
  transition,
  phase = "auto",
  onComplete,
}: Props) {
  const [finished, setFinished] = useState(false)

  useEffect(() => {
    if (phase !== "auto") {
      setFinished(false)
      return
    }
    setFinished(false)
    const timer = window.setTimeout(() => {
      setFinished(true)
      onComplete?.()
    }, transition.durationMs ?? 1300)
    return () => window.clearTimeout(timer)
  }, [onComplete, phase, transition])

  if (finished) return null

  return (
    <div
      className={`scene-transition-overlay phase-${phase} tone-${transition.tone ?? "ink"}`}
      aria-label={`${transition.timeLabel ?? ""} ${transition.title}`.trim()}
    >
      <div className="scene-transition-rule" aria-hidden="true" />
      {transition.timeLabel && (
        <span className="scene-transition-time">{transition.timeLabel}</span>
      )}
      <strong>{transition.title}</strong>
      {transition.subtitle && <small>{transition.subtitle}</small>}
    </div>
  )
}
