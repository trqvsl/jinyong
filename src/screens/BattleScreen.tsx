import { useState, useEffect, useRef } from "react"
import type { Player, Enemy, Skill, SkillCategory, BattleLogEntry, StatusEffect } from "../types"
import type { PortraitSpec } from "../assets/portraits"
import { PLAYER_PORTRAIT, ENEMY_PORTRAITS } from "../assets/portraits"
import { getItemById } from "../data/items"
import {
  performPlayerSkill, performEnemySkill, enemyChooseSkill,
  settleVictory, checkBattleEnd,
  tickStatuses, isStunned,
} from "../game/battle"

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

interface PortraitImageState {
  [key: string]: boolean
}

type ActorMotion = "idle" | "advance" | "hit" | "cast" | "stagger"
type MotionStyle = "neutral" | "palm" | "sword" | "finger" | "inner" | "swift" | "poison"
type EffectPulse = {
  id: number
  from: "player" | "enemy"
  category: SkillCategory
  skillId: string
  isCrit: boolean
}

let floatId = 0
let effectId = 0

export function BattleScreen({ player, enemy, onEnd }: Props) {
  const [p, setP] = useState<Player>(() => structuredClone(player))
  const [e, setE] = useState<Enemy>(() => structuredClone(enemy))
  const [log, setLog] = useState<BattleLogEntry[]>([
    { text: `遭遇 ${enemy.name}！${enemy.description}`, type: "system" },
  ])
  const [phase, setPhase] = useState<"playerTurn" | "busy" | "ended">("playerTurn")
  const [outcome, setOutcome] = useState<"won" | "lost" | null>(null)
  const [turnBanner, setTurnBanner] = useState("战斗开始")

  const [skillFlash, setSkillFlash] = useState<{ name: string; from: "player" | "enemy"; isCrit: boolean } | null>(null)
  const [effectPulses, setEffectPulses] = useState<EffectPulse[]>([])
  const [floats, setFloats] = useState<FloatText[]>([])
  const [loadedPortraits, setLoadedPortraits] = useState<PortraitImageState>({})
  const [shakeEnemy, setShakeEnemy] = useState(false)
  const [shakePlayer, setShakePlayer] = useState(false)
  const [screenShake, setScreenShake] = useState(false)
  const [playerMotion, setPlayerMotion] = useState<ActorMotion>("idle")
  const [enemyMotion, setEnemyMotion] = useState<ActorMotion>("idle")
  const [playerMotionStyle, setPlayerMotionStyle] = useState<MotionStyle>("neutral")
  const [enemyMotionStyle, setEnemyMotionStyle] = useState<MotionStyle>("neutral")
  const [impactSide, setImpactSide] = useState<"player" | "enemy" | null>(null)
  const [showItems, setShowItems] = useState(false)

  const pRef = useRef(p)
  const eRef = useRef(e)
  const currentSkillIdRef = useRef("")
  pRef.current = p
  eRef.current = e

  const ownedItems = Object.entries(p.inventory).filter(([, count]) => count > 0)

  function handleUseItem(itemId: string) {
    if (phase !== "playerTurn") return
    const item = getItemById(itemId)
    if (!item?.usable || !item.apply) return
    const curP = pRef.current
    if ((curP.inventory[itemId] ?? 0) <= 0) return

    const applied = item.apply(curP)
    const nextInventory = { ...applied.inventory, [itemId]: applied.inventory[itemId] - 1 }
    if (nextInventory[itemId] <= 0) delete nextInventory[itemId]
    const np: Player = { ...applied, inventory: nextInventory }

    setP(np)
    setShowItems(false)
    pushLog([{ text: `你服用 ${item.name}，${item.effectText}。`, type: "status" }])
    addFloat("player", item.effectText.includes("气血") ? "回血" : "回气", "heal")

    setPhase("busy")
    setTimeout(() => {
      const status = checkBattleEnd(np, eRef.current)
      if (status === "won") finishBattle("won")
      else if (status === "lost") finishBattle("lost")
      else startEnemyTurn(np, eRef.current)
    }, 900)
  }

  const logEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [log])

  useEffect(() => {
    if (phase === "playerTurn") setTurnBanner("你的回合")
    if (phase === "busy") setTurnBanner("招式交锋中")
    if (phase === "ended") setTurnBanner(outcome === "won" ? "得胜" : "败北")
  }, [phase, outcome])

  function pushLog(entries: BattleLogEntry[]) {
    setLog((prev) => [...prev, ...entries])
  }

  function addFloat(side: "player" | "enemy", text: string, kind: FloatText["kind"]) {
    const id = ++floatId
    setFloats((prev) => [...prev, { id, side, text, kind }])
    setTimeout(() => setFloats((prev) => prev.filter((f) => f.id !== id)), 1100)
  }

  function pulseImpact(side: "player" | "enemy") {
    setImpactSide(side)
    setTimeout(() => setImpactSide(null), 280)
  }

  function triggerShake(side: "player" | "enemy") {
    pulseImpact(side)
    if (side === "enemy") {
      setShakeEnemy(true)
      setEnemyMotion("stagger")
      setTimeout(() => {
        setShakeEnemy(false)
        setEnemyMotion("idle")
      }, 450)
    } else {
      setShakePlayer(true)
      setPlayerMotion("stagger")
      setTimeout(() => {
        setShakePlayer(false)
        setPlayerMotion("idle")
      }, 450)
    }
  }

  function spawnEffectPulse(from: "player" | "enemy", category: SkillCategory, isCrit: boolean) {
    const id = ++effectId
    setEffectPulses((prev) => [...prev, { id, from, category, skillId: currentSkillIdRef.current, isCrit }])
    setTimeout(() => setEffectPulses((prev) => prev.filter((pulse) => pulse.id !== id)), 760)
  }

  function playSkillFlash(from: "player" | "enemy", skill: Skill, isCrit: boolean) {
    currentSkillIdRef.current = skill.id
    setSkillFlash({ name: skill.name, from, isCrit })
    spawnEffectPulse(from, skill.category, isCrit)
    const style = motionStyleForSkill(skill)
    setTimeout(() => setSkillFlash(null), 700)
    if (from === "player") {
      setPlayerMotionStyle(style)
      setPlayerMotion(isCrit ? "cast" : "advance")
      setTimeout(() => {
        setPlayerMotion("idle")
        setPlayerMotionStyle("neutral")
      }, 520)
    } else {
      setEnemyMotionStyle(style)
      setEnemyMotion(isCrit ? "cast" : "advance")
      setTimeout(() => {
        setEnemyMotion("idle")
        setEnemyMotionStyle("neutral")
      }, 520)
    }
    if (isCrit) {
      setScreenShake(true)
      setTimeout(() => setScreenShake(false), 500)
    }
  }

  function handlePlayerSkill(skill: Skill) {
    if (phase !== "playerTurn") return
    const curP = pRef.current
    const curE = eRef.current
    if (curP.mp < skill.mpCost) {
      pushLog([{ text: "内力不足，无法施展此招！", type: "system" }])
      return
    }
    setPhase("busy")

    const { player: np, enemy: ne, logs, result } = performPlayerSkill(curP, curE, skill)
    setP(np)
    setE(ne)
    pushLog(logs)
    playSkillFlash("player", skill, result.isCrit)

    if (result.isDodge) {
      addFloat("enemy", "闪避", "dodge")
    } else if (result.damage > 0) {
      setTimeout(() => {
        addFloat("enemy", `-${result.damage}`, result.isCrit ? "crit" : "damage")
        triggerShake("enemy")
      }, 250)
    }
    if (result.statusApplied) {
      const appliedStatus = result.statusApplied
      setTimeout(() => addFloat("enemy", appliedStatus, "status"), 400)
    }

    setTimeout(() => {
      const status = checkBattleEnd(np, ne)
      if (status === "won") finishBattle("won")
      else if (status === "lost") finishBattle("lost")
      else startEnemyTurn(np, ne)
    }, 900)
  }

  function startEnemyTurn(curPlayer: Player, curEnemy: Enemy) {
    const { unit: enemyAfterTick, logs: enemyTickLogs } = tickStatuses(curEnemy)
    const { unit: playerAfterTick, logs: playerTickLogs } = tickStatuses(curPlayer)

    setTimeout(() => {
      if (enemyTickLogs.length > 0 || playerTickLogs.length > 0) {
        setE(enemyAfterTick)
        setP(playerAfterTick)
        pushLog([...enemyTickLogs, ...playerTickLogs])
        enemyTickLogs.forEach((entry) => {
          if (entry.type === "poison") addFloat("enemy", "中毒", "poison")
        })
        playerTickLogs.forEach((entry) => {
          if (entry.type === "poison") addFloat("player", "中毒", "poison")
          if (entry.type === "status" && entry.text.includes("回复")) addFloat("player", "回血", "heal")
        })
      }

      const tickEnd = checkBattleEnd(playerAfterTick, enemyAfterTick)
      if (tickEnd === "won") { finishBattle("won"); return }
      if (tickEnd === "lost") { finishBattle("lost"); return }

      if (isStunned(enemyAfterTick)) {
        pushLog([{ text: `${enemyAfterTick.name}被眩晕，无法行动！`, type: "status" }])
        const cleared = { ...enemyAfterTick, statuses: enemyAfterTick.statuses.filter((status) => status.kind !== "stun") }
        setE(cleared)
        setEnemyMotion("stagger")
        setTimeout(() => {
          setEnemyMotion("idle")
          setPhase("playerTurn")
        }, 900)
        return
      }

      const skill = enemyChooseSkill(enemyAfterTick)
      const { player: np, enemy: ne, logs, result } = performEnemySkill(playerAfterTick, enemyAfterTick, skill)
      setP(np)
      setE(ne)
      pushLog(logs)
      playSkillFlash("enemy", skill, result.isCrit)

      if (result.isDodge) {
        addFloat("player", "闪避", "dodge")
      } else if (result.damage > 0) {
        setTimeout(() => {
          addFloat("player", `-${result.damage}`, result.isCrit ? "crit" : "damage")
          triggerShake("player")
        }, 250)
      }
      if (result.statusApplied) {
        const appliedStatus = result.statusApplied
        setTimeout(() => addFloat("player", appliedStatus, "status"), 400)
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
      <div className="battle-header-row">
        <div className="battle-header">第 {player.day} 日 · 闯荡江湖</div>
        <div className={`turn-banner phase-${phase}`}>{turnBanner}</div>
      </div>

      {skillFlash && (
        <div className={`skill-flash ${skillFlash.from} ${skillFlash.isCrit ? "crit" : ""}`}>
          {skillFlash.name}
        </div>
      )}

      <div className="battle-stage-shell">
        <div className="battle-stage-bg" />
        <div className={`battle-impact battle-impact-${impactSide ?? "none"}`} />
        <div className="battle-effects-layer">
          {effectPulses.map((pulse) => (
            <div key={pulse.id} className={`battle-effect effect-${pulse.category} skill-${pulse.skillId} from-${pulse.from} ${pulse.isCrit ? "crit" : ""}`}>
              <div className="effect-core" />
              <div className="effect-trail" />
              <div className="effect-ring" />
            </div>
          ))}
        </div>

        <CombatantCard side="enemy" unit={e} portrait={ENEMY_PORTRAITS[e.id] ?? ENEMY_PORTRAITS.default} loadedPortraits={loadedPortraits} onPortraitReady={setLoadedPortraits} motion={enemyMotion} motionStyle={enemyMotionStyle} shaken={shakeEnemy} impact={impactSide === "enemy"}>
          {floats.filter((floatText) => floatText.side === "enemy").map((floatText) => (
            <span key={floatText.id} className={`float-text float-${floatText.kind}`}>{floatText.text}</span>
          ))}
        </CombatantCard>

        <div className="battle-stage-center">
          <div className="versus-mark">对 决</div>
          <div className="battle-stage-caption">剑气纵横，真气激荡</div>
        </div>

        <CombatantCard side="player" unit={p} portrait={PLAYER_PORTRAIT} loadedPortraits={loadedPortraits} onPortraitReady={setLoadedPortraits} motion={playerMotion} motionStyle={playerMotionStyle} shaken={shakePlayer} impact={impactSide === "player"}>
          {floats.filter((floatText) => floatText.side === "player").map((floatText) => (
            <span key={floatText.id} className={`float-text float-${floatText.kind}`}>{floatText.text}</span>
          ))}
        </CombatantCard>
      </div>

      <div className="battle-lower">
        <div className="battle-log-panel">
          <div className="panel-title">战况</div>
          <div className="battle-log">
            {log.map((entry, index) => (
              <div key={index} className={`log-entry log-${entry.type}`}>{entry.text}</div>
            ))}
            <div ref={logEndRef} />
          </div>
        </div>

        <div className="battle-actions-panel">
          {phase === "playerTurn" && !showItems && (
            <>
              <div className="panel-title">招式选择</div>
              <div className="skill-buttons cinematic">
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
                      <span className="skill-btn-info">{describeSkill(skill)}</span>
                    </button>
                  )
                })}
              </div>
              <button className="menu-btn battle-items-btn" onClick={() => setShowItems(true)}>使用道具</button>
            </>
          )}
          {phase === "playerTurn" && showItems && (
            <>
              <div className="panel-title">行囊道具</div>
              <div className="skill-buttons cinematic">
                {ownedItems.length === 0 ? (
                  <div className="action-hint waiting">行囊中无可使用道具。</div>
                ) : ownedItems.map(([itemId, count]) => {
                  const item = getItemById(itemId)
                  return (
                    <button
                      key={itemId}
                      className="skill-btn item-btn"
                      disabled={!item?.usable}
                      onClick={() => handleUseItem(itemId)}
                    >
                      <span className="skill-btn-cat">{item?.category ?? "物品"}</span>
                      <span className="skill-btn-name">{item?.name ?? itemId} ×{count}</span>
                      <span className="skill-btn-info">{item?.effectText ?? ""}</span>
                    </button>
                  )
                })}
              </div>
              <button className="menu-btn battle-items-btn" onClick={() => setShowItems(false)}>返回招式</button>
            </>
          )}
          {phase === "busy" && <div className="action-hint waiting">双方正在拆招换式…</div>}
          {phase === "ended" && (
            <button className="menu-btn primary end-btn" onClick={handleEnd}>
              {outcome === "won" ? "得胜而归" : "败北离场"}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function CombatantCard(
  {
    side,
    unit,
    portrait,
    loadedPortraits,
    onPortraitReady,
    motion,
    motionStyle,
    shaken,
    impact,
    children,
  }: {
    side: "player" | "enemy"
    unit: Player | Enemy
    portrait: PortraitSpec
    loadedPortraits: PortraitImageState
    onPortraitReady: React.Dispatch<React.SetStateAction<PortraitImageState>>
    motion: ActorMotion
    motionStyle: MotionStyle
    shaken: boolean
    impact: boolean
    children: React.ReactNode
  }
) {
  const isPlayer = side === "player"
  const title = isPlayer ? "少侠" : "对手"
  const aura = isPlayer ? "侠气" : "杀气"
  const poseLabel = isPlayer ? `${unit.name} · 蓄势待发` : `${unit.name} · 杀机暗藏`
  const hasPortrait = Boolean(portrait.image && loadedPortraits[portrait.id])

  return (
    <div className={`combatant-card ${side} motion-${motion} style-${motionStyle} ${shaken ? "shake" : ""} ${impact ? "impact" : ""}`}>
      <div className="combatant-tag">{title}</div>
      <div className="combatant-figure-wrap">
        <div className={`combatant-aura ${side}`} />
        <div className={`combatant-figure ${side} role-${portrait.role}`} style={{ ["--figure-primary" as string]: portrait.palette.primary, ["--figure-secondary" as string]: portrait.palette.secondary, ["--figure-glow" as string]: portrait.palette.glow }}>
          {portrait.image && (
            <img
              className={`figure-portrait-img ${hasPortrait ? "ready" : ""}`}
              src={portrait.image}
              alt={portrait.title}
              onLoad={() => onPortraitReady((prev) => ({ ...prev, [portrait.id]: true }))}
              onError={() => onPortraitReady((prev) => ({ ...prev, [portrait.id]: false }))}
            />
          )}
          <div className="figure-emblem">{portrait.emblem}</div>
          {!hasPortrait && <div className="figure-hair" />}
          {!hasPortrait && <div className="figure-cloak" />}
          {!hasPortrait && <div className="figure-ornament" />}
          {!hasPortrait && <div className="figure-silhouette" />}
          {!hasPortrait && <div className="figure-weapon" />}
          <div className="figure-shadow" />
        </div>
        <div className="float-layer">{children}</div>
      </div>
      <div className="combatant-panel">
        <div className="combatant-name-row">
          <div className="combatant-name">{unit.name}</div>
          <div className="combatant-aura-label">{aura}</div>
        </div>
        <div className="combatant-pose">{poseLabel}</div>
        <Bar value={unit.hp} max={unit.hpMax} color="#c0392b" label="气血" />
        <Bar value={unit.mp} max={unit.mpMax} color="#2980b9" label="内力" />
        <div className="combatant-stats cinematic">
          <span>攻 {unit.attack}</span>
          <span>防 {unit.defense}</span>
          <span>速 {unit.speed}</span>
        </div>
        <StatusBadges statuses={unit.statuses} />
      </div>
    </div>
  )
}

function motionStyleForSkill(skill: Skill): MotionStyle {
  if (skill.id === "dugu9" || skill.id === "dagou") return "sword"
  if (skill.id === "liumai" || skill.id === "yiyangzhi") return "finger"
  if (skill.category === "内功") return "inner"
  if (skill.category === "轻功") return "swift"
  if (skill.category === "奇门") return "poison"
  if (skill.damageType === "拳掌") return "palm"
  return "neutral"
}

function Bar({ value, max, color, label }: { value: number; max: number; color: string; label: string }) {
  const pct = max <= 0 ? 0 : Math.max(0, Math.min(100, (value / max) * 100))
  return (
    <div className="combat-bar-block">
      <div className="combat-bar-label-row">
        <span>{label}</span>
        <span>{value}/{max}</span>
      </div>
      <div className="combat-bar-track cinematic">
        <div className="combat-bar-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  )
}

function StatusBadges({ statuses }: { statuses: StatusEffect[] }) {
  if (!statuses || statuses.length === 0) return <div className="status-empty">暂无状态</div>
  return (
    <div className="status-badges cinematic">
      {statuses.map((status, index) => (
        <span key={index} className={`status-badge status-${status.kind}`} title={status.name}>
          {status.name} {status.duration}
        </span>
      ))}
    </div>
  )
}

function describeSkill(skill: Skill) {
  const bits: string[] = []
  bits.push(skill.mpCost > 0 ? `内力 ${skill.mpCost}` : "无消耗")
  if (skill.power > 0) bits.push(`威力 ${skill.power}`)
  if (skill.effect) bits.push(effectLabel(skill.effect.kind))
  return bits.join(" · ")
}

function effectLabel(kind: StatusEffect["kind"]) {
  if (kind === "poison") return "附中毒"
  if (kind === "buff-atk") return "攻势变化"
  if (kind === "buff-def") return "护体强化"
  if (kind === "buff-spd") return "身法提升"
  if (kind === "heal") return "持续回复"
  if (kind === "stun") return "附眩晕"
  if (kind === "shield") return "真气护盾"
  return "状态效果"
}
