import { useMemo } from "react"
import { ArrowLeft, Compass, LockKeyhole, MapPin, Route } from "lucide-react"
import type { Player } from "../types"
import { getAllLocationsWithStatus, type Location } from "../data/map"
import { getNpcState } from "../game/story/state"
import {
  getStoryEventById,
  getStoryProgress,
  type StoryProgressView,
} from "../game/story/query"
import { getNpcById } from "../data/npcs"

interface Props {
  player: Player
  onSelect: (locationId: string) => void
  onBack: () => void
}

// 简化的中国地图轮廓（SVG path，viewBox 0~100）
// 这是示意性轮廓，不求精确，只求一眼能认出"这是中国地图"
const CHINA_OUTLINE = "M 18,30 Q 22,22 30,20 L 45,18 Q 55,17 62,20 L 72,22 Q 80,24 86,30 L 90,38 Q 92,46 90,54 L 88,60 Q 86,66 82,70 L 78,74 Q 72,78 66,80 L 58,82 Q 48,84 40,82 L 32,80 Q 26,76 22,70 L 18,62 Q 14,52 14,44 L 16,36 Z"

function getLocationPreview(
  location: Location,
  progress: StoryProgressView,
  recommendedLocationId: string,
  resumeTitle?: string,
): { tag: string; preview: string; rhythm: string; risk: string } {
  if (location.id === recommendedLocationId) {
    return {
      tag: resumeTitle ? "续接" : "主线",
      preview: resumeTitle ? `未完剧情：${resumeTitle}` : progress.next,
      rhythm: location.rhythm,
      risk: resumeTitle ? "剧情未完" : "当前推荐",
    }
  }
  return {
    tag: location.contentTag,
    preview: location.contentPreview,
    rhythm: location.rhythm,
    risk: location.risk,
  }
}

export function MapScreen({ player, onSelect, onBack }: Props) {
  const locations = useMemo(() => getAllLocationsWithStatus(player), [player])
  const storyProgress = getStoryProgress(player)
  const pausedCheckpoint = player.world.currentStory?.paused
    ? player.world.currentStory
    : null
  const pausedEvent = pausedCheckpoint
    ? getStoryEventById(pausedCheckpoint.eventId)
    : undefined
  const resumeTitle = pausedCheckpoint
    ? pausedEvent?.nodes[pausedCheckpoint.nodeId]?.title
    : undefined
  const recommendedLocationId = pausedCheckpoint?.locationId
    ?? storyProgress.recommendedLocationId
  const recommendedLocation = locations.find((loc) => loc.id === recommendedLocationId) ?? locations[0]

  return (
    <div className="map-screen">
      <header className="top-bar map-topbar">
        <button className="back-btn" onClick={onBack} title="返回据点"><ArrowLeft size={18} /> 返回</button>
        <span className="player-name"><Compass size={19} /> 江湖游历</span>
        <span className="day-info">第 {player.day} 日</span>
      </header>

      <section className="map-route-banner">
        <div className="map-hero-copy">
          <div className="main-hub-scene-tag"><Route size={14} /> 当前路引</div>
          <h1 className="map-hero-title">{resumeTitle ? "续接" : "下一站"} · {recommendedLocation?.name}</h1>
          <p className="map-hero-desc">
            {resumeTitle
              ? `未完的「${resumeTitle}」仍留在${recommendedLocation?.name ?? "原地"}。`
              : storyProgress.guidance}
          </p>
          <div className="map-hero-advance">{resumeTitle ? `未完剧情：${resumeTitle}` : storyProgress.next}</div>
        </div>
        {recommendedLocation && (
          <button
            className={`map-recommend-card ${recommendedLocation.unlocked ? "" : "locked"}`}
            onClick={() => recommendedLocation.unlocked && onSelect(recommendedLocation.id)}
            disabled={!recommendedLocation.unlocked}
          >
            <span className="map-recommend-tag">{resumeTitle ? "剧情续接" : "主线推荐"}</span>
            <span className="map-recommend-name"><MapPin size={20} /> {recommendedLocation.name}{!recommendedLocation.unlocked && " · 未解锁"}</span>
            <span className="map-recommend-desc">{recommendedLocation.description}</span>
            <div className="map-recommend-signal-row">
              <span className="location-signal-chip rhythm">{recommendedLocation.rhythm}</span>
              <span className="location-signal-chip risk recommended">{resumeTitle ? "剧情未完" : "当前推荐"}</span>
            </div>
            <span className="map-recommend-advance">启程</span>
          </button>
        )}
      </section>

      <section className="map-atlas">
        <div className="map-canvas-wrap recommended-layout">
          <div className="map-canvas-caption">
            <span>江湖路引图</span>
            <small>方位为行程示意，以路引册为准</small>
          </div>
          <svg className="map-canvas" viewBox="0 0 100 90" preserveAspectRatio="xMidYMid meet">
            <path d={CHINA_OUTLINE} className="map-outline" />
            <path d={CHINA_OUTLINE} className="map-outline-glow" />

            {locations.map((loc) => {
              const { x, y } = loc.coordinates
              const isRecommended = loc.id === recommendedLocationId
              return (
                <g
                  key={loc.id}
                  className={`map-marker ${loc.unlocked ? "" : "locked"}${isRecommended ? " recommended" : ""}`}
                  transform={`translate(${x}, ${y})`}
                  onClick={() => loc.unlocked && onSelect(loc.id)}
                  onKeyDown={(event) => {
                    if (loc.unlocked && (event.key === "Enter" || event.key === " ")) onSelect(loc.id)
                  }}
                  role="button"
                  tabIndex={loc.unlocked ? 0 : -1}
                  aria-label={`${loc.name}${loc.unlocked ? "" : "，未解锁"}`}
                >
                  <circle r="1.4" className="marker-dot" />
                  <circle r="2.8" className="marker-ring" />
                  {isRecommended && <circle r="4.2" className="marker-recommend-ring" />}
                  <text x="0" y="-2.6" textAnchor="middle" className="marker-label">{loc.name}</text>
                  {isRecommended && <text x="0" y="-5.2" textAnchor="middle" className="marker-recommend-label">主线</text>}
                </g>
              )
            })}
          </svg>
        </div>

        <aside className="map-location-ledger">
          <div className="map-location-ledger-head">
            <span>{locations.length} 路引</span>
            <small>{locations.filter((location) => location.unlocked).length} 处可去</small>
          </div>
          <div className="location-list">
          {locations.map((loc) => {
            const isRecommended = loc.id === recommendedLocationId
            const preview = getLocationPreview(
              loc,
              storyProgress,
              recommendedLocationId,
              isRecommended ? resumeTitle : undefined,
            )
            const visibleNpcNames = loc.npcIds
              ?.filter(id => getNpcState(player.world, id).alive !== false)
              .map(id => getNpcById(id)?.name)
              .filter(Boolean) ?? []

            return (
              <button
                key={loc.id}
                className={`location-card ${loc.unlocked ? "" : "locked"}${isRecommended ? " recommended" : ""}`}
                onClick={() => loc.unlocked && onSelect(loc.id)}
                disabled={!loc.unlocked}
              >
                <span className="location-name">
                  {loc.name}
                  {!loc.unlocked && <LockKeyhole size={13} />}
                  {isRecommended && <span className="location-recommend-badge">{resumeTitle ? "剧情续接" : "主线推荐"}</span>}
                </span>
                <span className="location-desc">{loc.description}</span>
                <div className="location-preview-row">
                  <span className="location-preview-tag">{preview.tag}</span>
                  <span className="location-preview-text">{preview.preview}</span>
                </div>
                <div className="location-signal-row">
                  <span className="location-signal-chip rhythm">{preview.rhythm}</span>
                  <span className={`location-signal-chip risk${isRecommended ? " recommended" : ""}`}>{preview.risk}</span>
                </div>
                <span className="location-region">
                  {loc.region}
                  {visibleNpcNames.length > 0 && ` · ${visibleNpcNames.join("、")}`}
                </span>
              </button>
            )
          })}
          </div>
        </aside>
      </section>
    </div>
  )
}
