import { useState } from "react"
import type { Player, Skill } from "../types"
import { SECTS } from "../data/sects"
import type { Sect } from "../data/sects"

// ============================================================
// 拜师界面
// ============================================================

interface Props {
  player: Player
  onLearn: (player: Player, skill: Skill) => void
  onBack: () => void
}

export function SectScreen({ player, onLearn, onBack }: Props) {
  const [selected, setSelected] = useState<Sect | null>(null)

  function hasSkill(skillId: string): boolean {
    return player.skills.some((s) => s.id === skillId)
  }

  function handleLearn(skill: Skill, cost: number) {
    if (player.gold < cost) return
    if (player.level < (selected?.skills.find((s) => s.skill.id === skill.id)?.reqLevel ?? 0)) return
    const updated: Player = {
      ...player,
      gold: player.gold - cost,
      skills: [...player.skills, skill],
    }
    onLearn(updated, skill)
  }

  if (!selected) {
    return (
      <div className="sect-screen">
        <header className="top-bar">
          <button className="back-btn" onClick={onBack}>← 返回</button>
          <span className="player-name">拜师学艺</span>
          <span className="day-info">银两 {player.gold}</span>
        </header>

        <p className="sect-intro">各门各派广纳贤才，择一入门，习其绝学。</p>

        <div className="sect-list">
          {SECTS.map((sect) => {
            const learned = sect.skills.filter((s) => hasSkill(s.skill.id)).length
            return (
              <div key={sect.id} className="sect-card" onClick={() => setSelected(sect)}>
                <div className="sect-card-header">
                  <span className="sect-name">{sect.name}</span>
                  <span className="sect-master">师父 · {sect.master}</span>
                </div>
                <p className="sect-desc">{sect.description}</p>
                <div className="sect-card-footer">
                  <span>{sect.skills.length} 门绝学</span>
                  <span className={learned === sect.skills.length ? "fully-learned" : "partial-learned"}>
                    已学 {learned}/{sect.skills.length}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="sect-screen">
      <header className="top-bar">
        <button className="back-btn" onClick={() => setSelected(null)}>← 返回</button>
        <span className="player-name">{selected.name}</span>
        <span className="day-info">银两 {player.gold}</span>
      </header>

      <section className="master-panel">
        <div className="master-name">{selected.master}</div>
        <p className="sect-desc">{selected.description}</p>
      </section>

      <section className="stat-panel">
        <h2>本派绝学</h2>
        <ul className="skill-list sect-skill-list">
          {selected.skills.map(({ skill, cost, reqLevel }) => {
            const learned = hasSkill(skill.id)
            const noGold = player.gold < cost
            const noLevel = player.level < reqLevel
            const blocked = !learned && (noGold || noLevel)
            return (
              <li key={skill.id} className={learned ? "learned" : ""}>
                <div className="sect-skill-info">
                  <span className={`skill-cat-tag cat-${skill.category}`}>{skill.category}</span>
                  <span className="skill-name">{skill.name}</span>
                  {skill.power > 0 && <span className="skill-power">威力 {skill.power}</span>}
                </div>
                <div className="sect-skill-desc">{skill.description}</div>
                <div className="sect-skill-meta">
                  {learned ? (
                    <span className="tag tag-learned">已习得</span>
                  ) : (
                    <>
                      <span className="skill-req">需 {reqLevel} 级 · {cost} 两</span>
                      <button
                        className={`menu-btn small ${blocked ? "disabled" : "primary"}`}
                        disabled={blocked}
                        onClick={() => handleLearn(skill, cost)}
                      >
                        {noLevel ? "等级不足" : noGold ? "银两不足" : "学习"}
                      </button>
                    </>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      </section>
    </div>
  )
}