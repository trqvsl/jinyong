import { useState, useEffect, useRef } from "react"
import type { Player, Enemy, Skill, BattleLogEntry, StatusEffect } from "../types"
import {
  usePlayerSkill, useEnemySkill, enemyChooseSkill,
  settleVictory, checkBattleEnd,
  tickStatuses, isStunned,
} from "../game/battle"

// ============================================================
// 战斗界面（四类武功 + 状态系统版）
// 用 ref 保存最新的玩家/敌人状态，避免闭包陷阱导致的时序 bug。
// ============================================================

interface FloatText {
  id: number
  side: "player" | "enemy"
  text: string
  kind: "damage" | "crit" | "dodge" | "heal" | "poison" | "status"
}

interface Props {
  player: Player
  enemy: Enemy
  onEnd: (result: { player: Player; outcome: "won" | "lost"; rewards?: { exp: number; gold: number; leveledUp: boolean } }) => void
}

let floatId = 0

export function BattleScreen({ player, enemy, onEnd }: Props) {
  const [p, setP] = useState<Player>(() => structuredClone(player))
  const [e, setE] = useState<Enemy>(() => structuredClone(enemy))
  const [log, setLog] = useState<BattleLogEntry[]>([
    { text: `遭遇 ${enemy.name}！${enemy.description}`, type: "system" },
  ])
  const [phase, setPhase] = useState<"playerTurn" | "busy" | "ended">("playerTurn")
  const [outcome, setOutcome] = useState<"won" | "lost" | null>(null)

  const [skillFlash, setSkillFlash] = useState<{ name: string; from: "player" | "enemy"; isCrit: boolean } | null>(null)
  const [floats, setFloats] = useState<FloatText[]>([])
  const [shakeEnemy, setShakeEnemy] = useState(false)
  const [shakePlayer, setShakePlayer] = useState(false)
  const [screenShake, setScreenShake] = useState(false)

  // ref 持有最新状态，避免 setTimeout 闭包读到旧值
  const pRef = useRef(p)
  const eRef = useRef(e)
  pRef.current = p
  eRef.current = e

  const logEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [log])

  function pushLog(entries: BattleLogEntry[]) {
    setLog((prev) => [...prev, ...entries])
  }

  function addFloat(side: "player" | "enemy", text: string, kind: FloatText["kind"]) {
    const id = ++floatId
    setFloats((prev) => [...prev, { id, side, text, kind }])
    setTimeout(() => setFloats((prev) => prev.filter((f) => f.id !== id)), 1100)
  }

  function triggerShake(side: "player" | "enemy") {
    if (side === "enemy") {
      setShakeEnemy(true)
      setTimeout(() => setShakeEnemy(false), 450)
    } else {
      setShakePlayer(true)
      setTimeout(() => setShakePlayer(false), 450)
    }
  }

  function playSkillFlash(from: "player" | "enemy", name: string, isCrit: boolean) {
    setSkillFlash({ name, from, isCrit })
    setTimeout(() => setSkillFlash(null), 700)
    if (isCrit) {
      setScreenShake(true)
      setTimeout(() => setScreenShake(false), 500)
    }
  }

  // ---- 玩家使用武功 ----
  function handlePlayerSkill(skill: Skill) {
    if (phase !== "playerTurn") return
    const curP = pRef.current
    const curE = eRef.current
    if (curP.mp < skill.mpCost) {
      pushLog([{ text: "内力不足，无法施展此招！", type: "system" }])
      return
    }
    setPhase("busy")

    const { player: np, enemy: ne, logs, result } = usePlayerSkill(curP, curE, skill)
    setP(np)
    setE(ne)
    pushLog(logs)
    playSkillFlash("player", skill.name, result.isCrit)

    if (result.isDodge) {
      addFloat("enemy", "闪避", "dodge")
    } else if (result.damage > 0) {
      setTimeout(() => {
        addFloat("enemy", `-${result.damage}`, result.isCrit ? "crit" : "damage")
        triggerShake("enemy")
      }, 250)
    }
    if (result.statusApplied) {
      setTimeout(() => addFloat("enemy", result.statusApplied!, "status"), 400)
    }

    setTimeout(() => {
      const status = checkBattleEnd(np, ne)
      if (status === "won") finishBattle("won")
      else if (status === "lost") finishBattle("lost")
      else startEnemyTurn(np, ne)
    }, 900)
  }

  // ---- 敌人回合 ----
  function startEnemyTurn(curPlayer: Player, curEnemy: Enemy) {
    // 先结算双方身上的持续状态
    const { unit: enemyAfterTick, logs: enemyTickLogs } = tickStatuses(curEnemy)
    const { unit: playerAfterTick, logs: playerTickLogs } = tickStatuses(curPlayer)

    setTimeout(() => {
      if (enemyTickLogs.length > 0 || playerTickLogs.length > 0) {
        setE(enemyAfterTick)
        setP(playerAfterTick)
        pushLog([...enemyTickLogs, ...playerTickLogs])
        enemyTickLogs.forEach((l) => {
          if (l.type === "poison") addFloat("enemy", "中毒", "poison")
        })
        playerTickLogs.forEach((l) => {
          if (l.type === "poison") addFloat("player", "中毒", "poison")
          if (l.type === "status" && l.text.includes("回复")) addFloat("player", "回血", "heal")
        })
      }

      // 状态结算后判胜负
      const tickEnd = checkBattleEnd(playerAfterTick, enemyAfterTick)
      if (tickEnd === "won") { finishBattle("won"); return }
      if (tickEnd === "lost") { finishBattle("lost"); return }

      // 敌人被眩晕则跳过
      if (isStunned(enemyAfterTick)) {
        pushLog([{ text: `${enemyAfterTick.name}被眩晕，无法行动！`, type: "status" }])
        const cleared = { ...enemyAfterTick, statuses: enemyAfterTick.statuses.filter((s) => s.kind !== "stun") }
        setE(cleared)
        setTimeout(() => setPhase("playerTurn"), 900)
        return
      }

      // 敌人正常出招
      const skill = enemyChooseSkill(enemyAfterTick)
      const { player: np, enemy: ne, logs, result } = useEnemySkill(playerAfterTick, enemyAfterTick, skill)
      setP(np)
      setE(ne)
      pushLog(logs)
      playSkillFlash("enemy", skill.name, result.isCrit)

      if (result.isDodge) {
        addFloat("player", "闪避", "dodge")
      } else if (result.damage > 0) {
        setTimeout(() => {
          addFloat("player", `-${result.damage}`, result.isCrit ? "crit" : "damage")
          triggerShake("player")
        }, 250)
      }
      if (result.statusApplied) {
        setTimeout(() => addFloat("player", result.statusApplied!, "status"), 400)
      }

      setTimeout(() => {
        const status = checkBattleEnd(np, ne)
        if (status === "won") finishBattle("won")
        else if (status === "lost") finishBattle("lost")
        else setPhase("playerTurn")
      }, 900)
    }, 700)
  }

  function finishBattle(result: "won" | "lost") {
    if (result === "won") {
      const { player: finalPlayer, rewards } = settleVictory(player, enemy)
      pushLog([
        { text: `你击败了 ${enemy.name}！`, type: "system" },
        { text: `获得经验 ${rewards.exp} 点，银两 ${rewards.gold} 两`, type: "system" },
        ...(rewards.leveledUp ? [{ text: `境界突破！升到 ${finalPlayer.level} 级！`, type: "crit" as const }] : []),
      ])
      setScreenShake(true)
      setTimeout(() => setScreenShake(false), 500)
    } else {
      pushLog([{ text: `你被 ${enemy.name} 击败了……`, type: "system" }])
    }
    setOutcome(result)
    setPhase("ended")
  }

  function handleEnd() {
    if (outcome === "won") {
      const { player: finalPlayer, rewards } = settleVictory(player, enemy)
      onEnd({ player: { ...finalPlayer, hp: p.hp, mp: p.mp }, outcome: "won", rewards })
    } else {
      onEnd({ player: { ...p }, outcome: "lost" })
    }
  }

  return (
    <div className={`battle-screen ${screenShake ? "screen-shake" : ""}`}>
      <div className="battle-header">第 {player.day} 日 · 闯荡江湖</div>

      {skillFlash && (
        <div key={skillFlash.name + Date.now()} className={`skill-flash ${skillFlash.from} ${skillFlash.isCrit ? "crit" : ""}`}>
          {skillFlash.name}
        </div>
      )}

      <div className={`battle-enemy ${shakeEnemy ? "shake" : ""}`}>
        <div className="combatant-name">{e.name}</div>
        <Bar value={e.hp} max={e.hpMax} color="#c0392b" />
        <div className="combatant-stats">
          <span>气血 {e.hp}/{e.hpMax}</span>
          <span>内力 {e.mp}/{e.mpMax}</span>
        </div>
        <StatusBadges statuses={e.statuses} />
        <div className="float-layer">
          {floats.filter((f) => f.side === "enemy").map((f) => (
            <span key={f.id} className={`float-text float-${f.kind}`}>{f.text}</span>
          ))}
        </div>
      </div>

      <div className="battle-log">
        {log.map((entry, i) => (
          <div key={i} className={`log-entry log-${entry.type}`}>{entry.text}</div>
        ))}
        <div ref={logEndRef} />
      </div>

      <div className={`battle-player ${shakePlayer ? "shake" : ""}`}>
        <div className="combatant-name">{p.name}</div>
        <Bar value={p.hp} max={p.hpMax} color="#c0392b" />
        <Bar value={p.mp} max={p.mpMax} color="#2980b9" />
        <div className="combatant-stats">
          <span>气血 {p.hp}/{p.hpMax}</span>
          <span>内力 {p.mp}/{p.mpMax}</span>
        </div>
        <StatusBadges statuses={p.statuses} />
        <div className="float-layer">
          {floats.filter((f) => f.side === "player").map((f) => (
            <span key={f.id} className={`float-text float-${f.kind}`}>{f.text}</span>
          ))}
        </div>
      </div>

      <div className="battle-actions">
        {phase === "playerTurn" && (
          <>
            <div className="action-hint">选择招式</div>
            <div className="skill-buttons">
              {p.skills.map((skill) => {
                const disabled = p.mp < skill.mpCost
                return (
                  <button
                    key={skill.id}
                    className={`skill-btn cat-${skill.category} ${disabled ? "disabled" : ""}`}
                    disabled={disabled}
                    onClick={() => handlePlayerSkill(skill)}
                  >
                    <span className="skill-btn-cat">{skill.category}</span>
                    <span className="skill-btn-name">{skill.name}</span>
                    <span className="skill-btn-info">
                      {skill.mpCost > 0 ? `内${skill.mpCost}` : "无消耗"}
                      {skill.power > 0 ? ` · 威力${skill.power}` : ""}
                    </span>
                  </button>
                )
              })}
            </div>
          </>
        )}
        {phase === "busy" && (
          <div className="action-hint waiting">对方出招中…</div>
        )}
        {phase === "ended" && (
          <button className="menu-btn primary end-btn" onClick={handleEnd}>
            {outcome === "won" ? "得胜而归" : "败北离场"}
          </button>
        )}
      </div>
    </div>
  )
}

function Bar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100))
  return (
    <div className="combat-bar-track">
      <div className="combat-bar-fill" style={{ width: pct + "%", background: color }} />
    </div>
  )
}

function StatusBadges({ statuses }: { statuses: StatusEffect[] }) {
  if (!statuses || statuses.length === 0) return null
  return (
    <div className="status-badges">
      {statuses.map((s, i) => (
        <span key={i} className={`status-badge status-${s.kind}`} title={s.name}>
          {s.name} {s.duration}
        </span>
      ))}
    </div>
  )
}