import { getItemById } from "../data/items"
import type { Player, SkillCategory } from "../types"
import { savePlayer } from "../game/player"
import { recomputePlayerStats } from "../game/attributes"

interface Props {
  player: Player
  onUpdate: (player: Player) => void
  onBack: () => void
}

const CAT_ORDER: SkillCategory[] = ["外功", "内功", "轻功", "奇门"]
const CAT_COLOR: Record<SkillCategory, string> = {
  "外功": "#c0392b", "内功": "#d4a017", "轻功": "#16a085", "奇门": "#8e44ad"
}

// 八大根基属性：键名 → 显示名 + 武侠意涵
const ROOT_ATTRS: { key: keyof Player["roots"]; label: string; note: string }[] = [
  { key: "strength", label: "力量", note: "外力根基，参与共构攻击力" },
  { key: "external", label: "外功", note: "外家修为，与力量共构物理攻击" },
  { key: "internal", label: "内功", note: "内家真气，催动外功招式" },
  { key: "comprehension", label: "悟性", note: "修炼速度、武学门槛" },
  { key: "constitution", label: "身体", note: "气血上限、防御" },
  { key: "breath", label: "吐纳", note: "内力上限" },
  { key: "agility", label: "身法", note: "速度、命中、暴击、闪避" },
  { key: "luck", label: "福缘", note: "奇遇、剧情检定、逃跑" },
]

export function CharacterScreen({ player, onUpdate, onBack }: Props) {
  const catGroups = CAT_ORDER.map(cat => ({
    cat,
    skills: player.skills.filter(s => s.category === cat)
  })).filter(g => g.skills.length > 0)

  const maxStats = { hpMax: 500, mpMax: 300, attack: 100, defense: 60, speed: 60 }

  function pct(cur: number, max: number) {
    return Math.min(100, Math.round((cur / max) * 100))
  }

  function handleResetName() {
    const name = prompt("请输入新名字（8字以内）：", player.name)
    if (name && name.trim()) {
      const updated = { ...player, name: name.trim().slice(0, 8) }
      savePlayer(updated)
      onUpdate(updated)
    }
  }
  // 给某根基属性 +1，消耗 1 属性点，然后重新推导面板
  function investRoot(key: keyof Player["roots"]) {
    if ((player.attributePoints ?? 0) <= 0) return
    const invested: Player = {
      ...player,
      roots: { ...player.roots, [key]: player.roots[key] + 1 },
      attributePoints: (player.attributePoints ?? 0) - 1,
    }
    const recomputed = recomputePlayerStats(invested)
    savePlayer(recomputed)
    onUpdate(recomputed)
  }


  function consumeItem(itemId: string) {
    const item = getItemById(itemId)
    if (!item?.usable || !item.apply) {
      alert("此物暂不可直接使用。")
      return
    }
    const updated = item.apply({
      ...player,
      inventory: {
        ...player.inventory,
        [itemId]: Math.max(0, (player.inventory[itemId] ?? 0) - 1),
      },
    })
    const cleaned = { ...updated.inventory }
    if (cleaned[itemId] <= 0) delete cleaned[itemId]
    const finalPlayer = { ...updated, inventory: cleaned }
    savePlayer(finalPlayer)
    onUpdate(finalPlayer)
    alert(`使用了 ${item.name}：${item.effectText}`)
  }

  return (
    <div className="char-screen">
      <header className="top-bar">
        <button className="back-btn" onClick={onBack}>← 返回</button>
        <span className="player-name">个人属性</span>
        <span className="day-info">第 {player.day} 日</span>
      </header>

      <section className="stat-panel">
        <h2>基础信息</h2>
        <div className="char-basic">
          <div className="char-avatar">{player.name.slice(0, 1)}</div>
          <div className="char-name-row">
            <span className="char-name">{player.name}</span>
            <button className="char-rename" onClick={handleResetName}>改名</button>
          </div>
          <div className="char-tags">
            <span className="char-tag">等级 {player.level}</span>
            <span className="char-tag">{player.alignment}道</span>
            <span className="char-tag">名声 {player.reputation}</span>
            <span className="char-tag">银两 {player.gold}</span>
          </div>
        </div>
      </section>

      <section className="stat-panel">
        <h2>根基属性 {(player.attributePoints ?? 0) > 0 && <span className="panel-count highlight">待分配 {player.attributePoints}</span>}</h2>
        <p className="hint">修炼根基，战斗属性由根基推导而来。{(player.attributePoints ?? 0) > 0 ? "点击 + 投入属性点。" : "升级或修炼秘籍可获得属性点。"}</p>
        <div className="root-attr-grid">
          {ROOT_ATTRS.map(attr => (
            <div key={attr.key} className="root-attr-item">
              <div className="root-attr-head">
                <span className="root-attr-label">{attr.label}</span>
                <span className="root-attr-value">{player.roots[attr.key]}</span>
                {(player.attributePoints ?? 0) > 0 && (
                  <button className="root-invest-btn" onClick={() => investRoot(attr.key)}>+</button>
                )}
              </div>
              <span className="root-attr-note">{attr.note}</span>
            </div>
          ))}
        </div>
        <div className="char-stat-bars">
          {[
            { label: "气血", cur: player.hp, max: player.hpMax, limit: maxStats.hpMax, color: "#c0392b" },
            { label: "内力", cur: player.mp, max: player.mpMax, limit: maxStats.mpMax, color: "#2980b9" },
            { label: "攻击", cur: player.attack, max: maxStats.attack, limit: maxStats.attack, color: "#e17055" },
            { label: "防御", cur: player.defense, max: maxStats.defense, limit: maxStats.defense, color: "#0984e3" },
            { label: "身法", cur: player.speed, max: maxStats.speed, limit: maxStats.speed, color: "#00b894" },
            { label: "经验", cur: player.exp, max: player.expMax, limit: player.expMax, color: "#27ae60" },
          ].map(b => (
            <div key={b.label} className="char-bar-row">
              <span className="char-bar-label">{b.label}</span>
              <div className="char-bar-track">
                <div className="char-bar-fill" style={{ width: pct(b.cur, b.limit) + "%", background: b.color }} />
              </div>
              <span className="char-bar-value">{b.cur}/{b.max}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="stat-panel">
        <h2>武功谱 <span className="panel-count">{player.skills.length}</span></h2>
        {catGroups.map(group => (
          <div key={group.cat} className="char-skill-group">
            <div className="char-cat-header">
              <span className="skill-cat-tag" style={{ background: CAT_COLOR[group.cat] }}>{group.cat}</span>
              <span className="char-cat-count">{group.skills.length} 门</span>
            </div>
            {group.skills.map(s => (
              <div key={s.id} className="char-skill-item">
                <span className="char-skill-name">{s.name}</span>
                <span className="char-skill-desc">{s.description}</span>
              </div>
            ))}
          </div>
        ))}
        {player.skills.length === 0 && <p className="hint">尚未习得任何武功。</p>}
      </section>

      <section className="stat-panel">
        <h2>行囊 <span className="panel-count">{Object.values(player.inventory).reduce((sum, count) => sum + count, 0)}</span></h2>
        {Object.keys(player.inventory).filter((id) => (player.inventory[id] ?? 0) > 0).length === 0 ? <p className="hint">行囊空空，还没有收集到任何道具。</p> : (
          <div className="char-bag-list">
            {Object.entries(player.inventory).filter(([, count]) => count > 0).map(([itemId, count]) => {
              const item = getItemById(itemId)
              return (
                <div key={itemId} className="char-skill-item char-bag-row">
                  <div className="char-bag-info">
                    <span className="char-skill-name">{item?.name ?? itemId} × {count}</span>
                    <span className="char-skill-desc">{item?.effectText ?? "未知物品"}</span>
                  </div>
                  <button
                    className="menu-btn char-use-btn"
                    disabled={!item?.usable || count <= 0}
                    onClick={() => consumeItem(itemId)}
                  >
                    {item?.usable ? "使用" : "留存"}
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
