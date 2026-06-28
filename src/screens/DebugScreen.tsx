import { useState } from "react"
import type { Player, Skill } from "../types"
import { savePlayer } from "../game/player"
import { recomputePlayerStats } from "../game/attributes"
import { getSkillById } from "../data/skills"
import { getEnemyById } from "../data/enemies"

interface Props {
  player: Player
  onUpdate: (player: Player) => void
  onBack: () => void
  onTestBattle: (enemyIds: string[]) => void
}

// 可分配/学习的武功候选（全部 SKILLS 的子集，用于加减）
const SKILL_IDS = [
  "changquan", "xianglong18", "dugu9", "liumai", "taijiquan", "dagou", "yiyangzhi",
  "jiuyang", "yijin", "qiankun", "beiming", "lingbo", "tiyun",
  "qianzhu", "huagu", "shehun", "lanhua", "hamagong", "lingshiquan",
]

const TEST_ENEMY_IDS = [
  "xialiubang", "shanzei", "duyaozi", "emingke", "xiejiaoshi",
  "guojing", "ouyangfeng", "huangyaoshi", "guanjun",
]

export function DebugScreen({ player, onUpdate, onBack, onTestBattle }: Props) {
  const [, force] = useState(0)
  const refresh = () => force((n) => n + 1)
  const [selectedEnemies, setSelectedEnemies] = useState<string[]>([])

  function commit(next: Player) {
    savePlayer(next)
    onUpdate(next)
    refresh()
  }

  // 调整等级：直接设等级，重新推导面板，回满血蓝，补对应属性点（不补偿历史，纯调试）
  function setLevel(level: number) {
    const clamped = Math.max(1, Math.min(99, level))
    const next: Player = { ...player, level: clamped, exp: 0 }
    const recomputed = recomputePlayerStats(next)
    recomputed.hp = recomputed.hpMax
    recomputed.mp = recomputed.mpMax
    commit(recomputed)
  }

  // 给某根基属性 ±delta（不受属性点限制，纯调试自由调）
  function adjustRoot(key: keyof Player["roots"], delta: number) {
    const next: Player = {
      ...player,
      roots: { ...player.roots, [key]: Math.max(1, player.roots[key] + delta) },
    }
    const recomputed = recomputePlayerStats(next)
    commit(recomputed)
  }

  // 学习/遗忘武功
  function addSkill(id: string) {
    const skill = getSkillById(id)
    if (!skill || player.skills.some((s) => s.id === id)) return
    commit({ ...player, skills: [...player.skills, skill] })
  }
  function removeSkill(id: string) {
    commit({ ...player, skills: player.skills.filter((s) => s.id !== id) })
  }

  // 刷满血蓝、给银两、重置状态
  function fullHeal() {
    commit({ ...player, hp: player.hpMax, mp: player.mpMax, statuses: [] })
  }
  function addGold() {
    commit({ ...player, gold: player.gold + 500 })
  }
  function grantPoints() {
    commit({ ...player, attributePoints: (player.attributePoints ?? 0) + 10 })
  }

  const rootKeys = ["strength", "external", "internal", "comprehension", "constitution", "breath", "agility", "luck"] as const
  const rootLabels: Record<string, string> = {
    strength: "力量", external: "外功", internal: "内功", comprehension: "悟性",
    constitution: "身体", breath: "吐纳", agility: "身法", luck: "福缘",
  }

  return (
    <div className="debug-screen">
      <header className="top-bar">
        <button className="back-btn" onClick={onBack}>← 返回</button>
        <span className="player-name">调试炼丹房</span>
        <span className="day-info">第 {player.day} 日</span>
      </header>

      <section className="stat-panel">
        <h2>角色调试</h2>
        <p className="hint">此处可自由调整角色配置，便于快速验证战斗手感。正式游玩不必使用。</p>
        <div className="debug-actions">
          <button className="menu-btn" onClick={fullHeal}>刷满气血内力</button>
          <button className="menu-btn" onClick={addGold}>+500 银两</button>
          <button className="menu-btn" onClick={grantPoints}>+10 属性点</button>
        </div>
        <div className="debug-row">
          <span className="debug-label">等级</span>
          <button className="debug-step" onClick={() => setLevel(player.level - 1)}>−</button>
          <span className="debug-value">{player.level}</span>
          <button className="debug-step" onClick={() => setLevel(player.level + 1)}>+</button>
        </div>
        <div className="debug-row">
          <span className="debug-label">待分配属性点</span>
          <span className="debug-value">{player.attributePoints ?? 0}</span>
        </div>
      </section>

      <section className="stat-panel">
        <h2>根基属性（自由调整）</h2>
        <div className="root-attr-grid">
          {rootKeys.map((key) => (
            <div key={key} className="root-attr-item">
              <div className="root-attr-head">
                <span className="root-attr-label">{rootLabels[key]}</span>
                <span className="root-attr-value">{player.roots[key]}</span>
              </div>
              <div className="debug-step-row">
                <button className="debug-step" onClick={() => adjustRoot(key, -1)}>−</button>
                <button className="debug-step" onClick={() => adjustRoot(key, -5)}>-5</button>
                <button className="debug-step" onClick={() => adjustRoot(key, +5)}>+5</button>
                <button className="debug-step" onClick={() => adjustRoot(key, +1)}>+</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="stat-panel">
        <h2>已学武功</h2>
        {player.skills.length === 0 ? (
          <p className="hint">尚未习得武功。</p>
        ) : (
          <div className="debug-skill-list">
            {player.skills.map((s: Skill) => (
              <div key={s.id} className="debug-skill-item">
                <span className={`skill-cat-tag cat-${s.category}`}>{s.category}</span>
                <span className="char-skill-name">{s.name}</span>
                <button className="debug-remove" onClick={() => removeSkill(s.id)}>遗忘</button>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="stat-panel">
        <h2>添加武功</h2>
        <div className="debug-skill-pool">
          {SKILL_IDS.filter((id) => !player.skills.some((s) => s.id === id)).map((id) => {
            const skill = getSkillById(id)
            return skill ? (
              <button key={id} className="menu-btn small" onClick={() => addSkill(id)}>
                <span className={`skill-cat-tag cat-${skill.category}`}>{skill.category}</span> {skill.name}
              </button>
            ) : null
          })}
        </div>
      </section>

      <section className="stat-panel">
        <h2>测试战斗 <span className="panel-count">已选 {selectedEnemies.length}</span></h2>
        <p className="hint">勾选1~3个对手，验证单体/群攻/多对多手感。点"开战"进入。</p>
        <div className="debug-enemy-grid">
          {TEST_ENEMY_IDS.map((id) => {
            const enemy = getEnemyById(id)
            const checked = selectedEnemies.includes(id)
            return (
              <button key={id} className={`location-card ${checked ? "selected" : ""}`} onClick={() => {
                setSelectedEnemies(checked ? selectedEnemies.filter((x) => x !== id) : [...selectedEnemies, id].slice(-3))
              }}>
                <span className="location-name">{enemy.name}{checked ? " ✓" : ""}</span>
                <span className="location-desc">气血 {enemy.hp} · 攻 {enemy.attack}</span>
              </button>
            )
          })}
        </div>
        <button
          className="menu-btn primary"
          disabled={selectedEnemies.length === 0}
          onClick={() => onTestBattle(selectedEnemies)}
        >开战（{selectedEnemies.length || 0} 个对手）</button>
      </section>
    </div>
  )
}
