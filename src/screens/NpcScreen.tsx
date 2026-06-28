import { useState } from "react"
import type { Player, Skill } from "../types"
import { savePlayer } from "../game/player"
import { getRelationLevel } from "../game/relations"
import { NPCS, npcToEnemy, type Npc } from "../data/npcs"
import { getSkillById } from "../data/skills"

// ============================================================
// 江湖人物（NPC）界面
// 列出可寻访的金庸角色，可对话 / 拜师学艺 / 切磋挑战
// 设计见《世界观设定.md》：原著角色承担四重作用
// ============================================================

interface Props {
  player: Player
  onUpdate: (player: Player) => void
  onChallenge: (enemy: ReturnType<typeof npcToEnemy>) => void
  onBack: () => void
}

// 拜师学一门武功的代价（银两 + 等级要求，按武功威力粗分）
function skillCost(skill: Skill): { gold: number; reqLevel: number } {
  if (skill.power >= 45) return { gold: 600, reqLevel: 7 }
  if (skill.power >= 35) return { gold: 350, reqLevel: 5 }
  if (skill.power >= 20) return { gold: 150, reqLevel: 3 }
  return { gold: 60, reqLevel: 1 }
}

export function NpcScreen({ player, onUpdate, onChallenge, onBack }: Props) {
  const [selected, setSelected] = useState<Npc | null>(null)

  function hasSkill(skillId: string): boolean {
    return player.skills.some((s) => s.id === skillId)
  }

  function handleLearn(skill: Skill) {
    const cost = skillCost(skill)
    if (player.gold < cost.gold) { alert("银两不足！"); return }
    if (player.level < cost.reqLevel) { alert(`需等级 ${cost.reqLevel} 方可修习此功！`); return }
    if (hasSkill(skill.id)) { alert("你已习得此功。"); return }
    const updated: Player = { ...player, gold: player.gold - cost.gold, skills: [...player.skills, skill] }
    savePlayer(updated)
    onUpdate(updated)
    alert(`习得《${skill.name}》！耗银 ${cost.gold} 两。`)
  }

  // NPC 列表
  if (!selected) {
    return (
      <div className="npc-screen">
        <header className="top-bar">
          <button className="back-btn" onClick={onBack}>← 返回</button>
          <span className="player-name">江湖人物</span>
          <span className="day-info">银两 {player.gold}</span>
        </header>
        <section className="stat-panel">
          <p className="hint">行走江湖，结识各方人物。可与之对话、拜师学艺，或切磋一番。</p>
        </section>
        <section className="stat-panel">
          <h2>名册</h2>
          <div className="location-list">
            {NPCS.map((npc) => (
              <button key={npc.id} className="location-card" onClick={() => setSelected(npc)}>
                <span className="location-name">{npc.title}·{npc.name}</span>
                <span className="location-desc">{npc.description}</span>
                <span className="location-region">{npc.work} · {npc.alignment}道</span>
                <span className={`relation-badge rel-${getRelationLevel(player, npc.id).tone}`}>{getRelationLevel(player, npc.id).label}</span>
              </button>
            ))}
          </div>
        </section>
      </div>
    )
  }

  // NPC 详情
  const npc = selected
  const canChallenge = npc.roles.includes("对手") || npc.roles.includes("剧情")
  const canTeach = npc.roles.includes("师父") && npc.teaches && npc.teaches.length > 0

  return (
    <div className="npc-screen">
      <header className="top-bar">
        <button className="back-btn" onClick={() => setSelected(null)}>← 名册</button>
        <span className="player-name">{npc.title}·{npc.name}</span>
        <span className="day-info">{npc.alignment}道</span>
      </header>

      <section className="stat-panel">
        <div className="char-basic">
          <div className="char-avatar">{npc.name.slice(0, 1)}</div>
          <div>
            <div className="char-name-row"><span className="char-name">{npc.name}</span></div>
            <div className="char-tags">
              <span className="char-tag">{npc.title}</span>
              <span className="char-tag">{npc.work}</span>
              <span className="char-tag">{npc.alignment}道</span>
              <span className={`relation-badge rel-${getRelationLevel(player, npc.id).tone}`}>关系：{getRelationLevel(player, npc.id).label}（{getRelationLevel(player, npc.id).value}）</span>
            </div>
          </div>
        </div>
        <p className="char-skill-desc" style={{ marginTop: 8, color: "#b8a98a" }}>{npc.description}</p>
      </section>

      {npc.dialogue && (
        <section className="stat-panel">
          <h2>对话</h2>
          <div className="event-intro">{npc.dialogue}</div>
        </section>
      )}

      {canTeach && (
        <section className="stat-panel">
          <h2>拜师学艺</h2>
          <div className="debug-skill-pool">
            {npc.teaches!.map((sid) => {
              const skill = getSkillById(sid)
              if (!skill) return null
              const cost = skillCost(skill)
              const learned = hasSkill(skill.id)
              const canAfford = player.gold >= cost.gold && player.level >= cost.reqLevel
              return (
                <button
                  key={sid}
                  className={`menu-btn small ${learned ? "disabled" : ""}`}
                  disabled={learned}
                  onClick={() => handleLearn(skill)}
                  style={!canAfford && !learned ? { opacity: 0.5 } : undefined}
                >
                  <span className={`skill-cat-tag cat-${skill.category}`}>{skill.category}</span> {skill.name}
                  {!learned && <span style={{ fontSize: 11, color: "#998a6a" }}> · {cost.gold}两 · 需Lv{cost.reqLevel}</span>}
                  {learned && <span style={{ fontSize: 11, color: "#27ae60" }}> 已习</span>}
                </button>
              )
            })}
          </div>
        </section>
      )}

      {canChallenge && (
        <section className="stat-panel">
          <h2>切磋挑战</h2>
          <p className="hint">与此人过招，胜则扬名，败亦无碍（仅耗气血）。</p>
          <div className="combatant-stats cinematic" style={{ marginBottom: 8 }}>
            <span>气血 {npc.combat.hpMax}</span><span>攻 {npc.combat.attack}</span><span>速 {npc.combat.speed}</span>
          </div>
          <button className="menu-btn primary" onClick={() => onChallenge(npcToEnemy(npc))}>挑战 {npc.name}</button>
        </section>
      )}

      <section className="stat-panel">
        <button className="menu-btn" onClick={() => setSelected(null)}>返回名册</button>
      </section>
    </div>
  )
}