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

  function getSectListHint(sect: Sect): { label: string; tone: "ready" | "locked" | "owned" | "partial"; detail: string } {
    const unlearned = sect.skills.filter((entry) => !hasSkill(entry.skill.id))

    if (unlearned.length === 0) {
      return { label: "已学全", tone: "owned", detail: "这派绝学已全部掌握。" }
    }

    const learnableNow = unlearned.find((entry) => player.level >= entry.reqLevel && player.gold >= entry.cost)
    if (learnableNow) {
      return {
        label: "可学",
        tone: "ready",
        detail: `当前可直接学 ${learnableNow.skill.name}。`,
      }
    }

    const affordableSoon = unlearned.find((entry) => player.gold >= entry.cost)
    if (affordableSoon) {
      return {
        label: "等级不足",
        tone: "locked",
        detail: `${affordableSoon.skill.name} 需 Lv${affordableSoon.reqLevel}。`,
      }
    }

    const cheapest = [...unlearned].sort((a, b) => a.cost - b.cost)[0]
    if (cheapest) {
      return {
        label: "银两不足",
        tone: "locked",
        detail: `${cheapest.skill.name} 需 ${cheapest.cost} 两。`,
      }
    }

    return { label: "待解锁", tone: "partial", detail: "仍有绝学可回头补齐。" }
  }

  function getSelectedSectRecommendation(sect: Sect): { title: string; detail: string; focusSkillId?: string } {
    const unlearned = sect.skills.filter((entry) => !hasSkill(entry.skill.id))

    if (unlearned.length === 0) {
      return {
        title: "这派已学完",
        detail: "这派绝学已经补齐，当前更适合去别派看看还能补什么。",
      }
    }

    const learnable = unlearned.find((entry) => player.level >= entry.reqLevel && player.gold >= entry.cost)
    if (learnable) {
      return {
        title: `当前先学 ${learnable.skill.name}`,
        detail: `你现在就能学这门武功，先把这一步落下最划算。`,
        focusSkillId: learnable.skill.id,
      }
    }

    const byLevel = [...unlearned].sort((a, b) => a.reqLevel - b.reqLevel || a.cost - b.cost)[0]
    if (player.level < byLevel.reqLevel) {
      return {
        title: `先补等级到 Lv${byLevel.reqLevel}`,
        detail: `${byLevel.skill.name} 是这派下一门关键武功，当前主要卡在等级。`,
        focusSkillId: byLevel.skill.id,
      }
    }

    const byGold = [...unlearned].sort((a, b) => a.cost - b.cost)[0]
    return {
      title: `先攒够 ${byGold.cost} 两`,
      detail: `${byGold.skill.name} 已到可学阶段，当前只差银两。`,
      focusSkillId: byGold.skill.id,
    }
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
            const hint = getSectListHint(sect)
            return (
              <div key={sect.id} className="sect-card" onClick={() => setSelected(sect)}>
                <div className="sect-card-header">
                  <span className="sect-name">{sect.name}</span>
                  <span className="sect-master">师父 · {sect.master}</span>
                </div>
                <p className="sect-desc">{sect.description}</p>
                <div className="sect-card-hint-row">
                  <span className={`sect-card-hint ${hint.tone}`}>{hint.label}</span>
                  <span className="sect-card-hint-detail">{hint.detail}</span>
                </div>
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

  const sectRecommendation = getSelectedSectRecommendation(selected)

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

      <section className="stat-panel sect-recommend-panel">
        <div className="sect-recommend-head">
          <div className="sect-card-hint ready">当前建议</div>
        </div>
        <div className="sect-recommend-title">{sectRecommendation.title}</div>
        <p className="sect-recommend-copy">{sectRecommendation.detail}</p>
      </section>

      <section className="stat-panel">
        <h2>本派绝学</h2>
        <ul className="skill-list sect-skill-list">
          {selected.skills.map(({ skill, cost, reqLevel }) => {
            const learned = hasSkill(skill.id)
            const noGold = player.gold < cost
            const noLevel = player.level < reqLevel
            const blocked = !learned && (noGold || noLevel)
            const isRecommended = sectRecommendation.focusSkillId === skill.id
            return (
              <li key={skill.id} className={`${learned ? "learned" : ""}${isRecommended ? " recommended" : ""}`}>
                <div className="sect-skill-info">
                  <span className={`skill-cat-tag cat-${skill.category}`}>{skill.category}</span>
                  <span className="skill-name">{skill.name}</span>
                  {isRecommended && <span className="sect-skill-recommend">推荐先学</span>}
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