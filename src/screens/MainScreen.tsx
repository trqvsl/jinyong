import type { Player } from "../types"
import { savePlayer } from "../game/player"

interface Props {
  player: Player; onUpdate: (player: Player) => void; onAdventure: () => void; onSect: () => void; onCharacter: () => void; onShop: () => void; onDebug?: () => void
}

export function MainScreen({ player, onUpdate, onAdventure, onSect, onCharacter, onShop, onDebug }: Props) {
  // onDebug 可选；调试入口，正式游玩可隐藏
  function train() {
    const gain = 1 + Math.floor(player.aptitude / 30)
    const updated: Player = { ...player, day: player.day + 1, attack: player.attack + gain,
      defense: player.defense + Math.floor(gain / 2), hp: player.hpMax, mp: player.mpMax }
    savePlayer(updated); onUpdate(updated)
  }
  const catCounts = player.skills.reduce((acc, s) => { acc[s.category] = (acc[s.category] || 0) + 1; return acc }, {} as Record<string, number>)
  return (
    <div className="main-screen">
      <header className="top-bar"><span className="player-name">{player.name}</span><span className="day-info">第 {player.day} 日</span></header>
      <section className="stat-panel">
        <h2>江湖名号</h2>
        <div className="stat-grid">
          <div>等级 <b>{player.level}</b></div><div>资质 <b>{player.aptitude}</b></div>
          <div>立场 <b>{player.alignment}</b></div><div>名声 <b>{player.reputation}</b></div>
          <div>银两 <b>{player.gold}</b></div>
        </div>
        <div className="stat-bars">
          <Bar label="气血" value={player.hp} max={player.hpMax} color="#c0392b" />
          <Bar label="内力" value={player.mp} max={player.mpMax} color="#2980b9" />
          <Bar label="经验" value={player.exp} max={player.expMax} color="#27ae60" />
        </div>
      </section>
      <section className="stat-panel">
        <h2>武功绝学 <span className="panel-count">{player.skills.length}</span></h2>
        {player.skills.length === 0 ? <p className="hint">尚未习得任何武功。</p> : (
          <>
            <div className="cat-summary">
              {(["外功","内功","轻功","奇门"] as const).map(c => (
                <span key={c} className={`cat-chip cat-${c}`}>{c} {catCounts[c]||0}</span>
              ))}
            </div>
            <ul className="skill-list">{player.skills.map(s => (
              <li key={s.id}><span className={`skill-cat-tag cat-${s.category}`}>{s.category}</span><span className="skill-name">{s.name}</span>{s.power>0 && <span className="skill-power">威力 {s.power}</span>}</li>
            ))}</ul>
          </>
        )}
      </section>
      <section className="stat-panel">
        <h2>行动</h2>
        <div className="action-buttons">
          <button className="menu-btn" onClick={train}>闭关修炼</button>
          <button className="menu-btn primary" onClick={onAdventure}>江湖游历</button>
          <button className="menu-btn" onClick={onShop}>江湖商铺</button>
          <button className="menu-btn" onClick={onSect}>游历门派</button>
          <button className="menu-btn" onClick={onCharacter}>个人属性</button>
          {onDebug && <button className="menu-btn" onClick={onDebug}>调试炼丹房</button>}
        </div>
      </section>
    </div>
  )
}
function Bar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100))
  return (<div className="bar-row"><span className="bar-label">{label}</span><div className="bar-track"><div className="bar-fill" style={{ width: pct + "%", background: color }} /></div><span className="bar-value">{value}/{max}</span></div>)
}
