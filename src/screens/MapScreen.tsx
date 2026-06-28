import { useMemo } from "react"
import type { Player } from "../types"
import { getAllLocationsWithStatus } from "../data/map"

interface Props {
  player: Player
  onSelect: (locationId: string) => void
  onBack: () => void
}

export function MapScreen({ player, onSelect, onBack }: Props) {
  // 按区域分组
  const grouped = useMemo(() => {
    const all = getAllLocationsWithStatus(player)
    const map = new Map<string, typeof all>()
    for (const loc of all) {
      const arr = map.get(loc.region) ?? []
      arr.push(loc)
      map.set(loc.region, arr)
    }
    return Array.from(map.entries())
  }, [player])

  return (
    <div className="map-screen">
      <header className="top-bar">
        <span className="player-name">江湖行脚</span>
        <span className="day-info">第 {player.day} 日</span>
      </header>

      <section className="stat-panel">
        <h2>江湖总图</h2>
        <p className="hint">择一处前往，每处都有自己的故事与风波。部分险地需扬名江湖方可踏足。</p>
      </section>

      {grouped.map(([region, locs]) => (
        <section key={region} className="stat-panel">
          <h2>{region}</h2>
          <div className="location-list">
            {locs.map((loc) => (
              <button
                key={loc.id}
                className={`location-card ${loc.unlocked ? "" : "locked"}`}
                onClick={() => loc.unlocked && onSelect(loc.id)}
                disabled={!loc.unlocked}
              >
                <span className="location-name">{loc.name}</span>
                <span className="location-desc">{loc.description}</span>
                {!loc.unlocked && <span className="location-lock">未解锁</span>}
              </button>
            ))}
          </div>
        </section>
      ))}

      <section className="stat-panel">
        <button className="menu-btn" onClick={onBack}>返回</button>
      </section>
    </div>
  )
}
