import { useMemo } from "react"
import type { Player } from "../types"
import { getAllLocationsWithStatus } from "../data/map"

interface Props {
  player: Player
  onSelect: (locationId: string) => void
  onBack: () => void
}

// 简化的中国地图轮廓（SVG path，viewBox 0~100）
// 这是示意性轮廓，不求精确，只求一眼能认出"这是中国地图"
const CHINA_OUTLINE = "M 18,30 Q 22,22 30,20 L 45,18 Q 55,17 62,20 L 72,22 Q 80,24 86,30 L 90,38 Q 92,46 90,54 L 88,60 Q 86,66 82,70 L 78,74 Q 72,78 66,80 L 58,82 Q 48,84 40,82 L 32,80 Q 26,76 22,70 L 18,62 Q 14,52 14,44 L 16,36 Z"

export function MapScreen({ player, onSelect, onBack }: Props) {
  const locations = useMemo(() => getAllLocationsWithStatus(player), [player])

  return (
    <div className="map-screen">
      <header className="top-bar">
        <button className="back-btn" onClick={onBack}>← 返回</button>
        <span className="player-name">江湖游历</span>
        <span className="day-info">第 {player.day} 日</span>
      </header>

      <div className="map-canvas-wrap">
        <svg className="map-canvas" viewBox="0 0 100 90" preserveAspectRatio="xMidYMid meet">
          {/* 地图轮廓 */}
          <path d={CHINA_OUTLINE} className="map-outline" />
          {/* 装饰：山川纹理 */}
          <path d={CHINA_OUTLINE} className="map-outline-glow" />

          {/* 地名标点 */}
          {locations.map((loc) => {
            const { x, y } = loc.coordinates
            return (
              <g
                key={loc.id}
                className={`map-marker ${loc.unlocked ? "" : "locked"}`}
                transform={`translate(${x}, ${y})`}
                onClick={() => loc.unlocked && onSelect(loc.id)}
              >
                <circle r="1.4" className="marker-dot" />
                <circle r="2.8" className="marker-ring" />
                <text x="0" y="-2.6" textAnchor="middle" className="marker-label">{loc.name}</text>
                {!loc.unlocked && <text x="0" y="3.4" textAnchor="middle" className="marker-lock">🔒</text>}
              </g>
            )
          })}
        </svg>
      </div>

      <section className="stat-panel">
        <h2>地名一览</h2>
        <p className="hint">点击地图标点或下方地名前往。带🔒者为险地，需扬名江湖方可踏足。</p>
        <div className="location-list">
          {locations.map((loc) => (
            <button
              key={loc.id}
              className={`location-card ${loc.unlocked ? "" : "locked"}`}
              onClick={() => loc.unlocked && onSelect(loc.id)}
              disabled={!loc.unlocked}
            >
              <span className="location-name">{loc.name}{!loc.unlocked && " 🔒"}</span>
              <span className="location-desc">{loc.description}</span>
              <span className="location-region">{loc.region}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="stat-panel">
        <button className="menu-btn" onClick={onBack}>返回</button>
      </section>
    </div>
  )
}