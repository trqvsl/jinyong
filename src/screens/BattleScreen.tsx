import { useState, useEffect, useRef } from "react"
import type { Player, Enemy, Skill } from "../types"
import type { Combatant as EngineCombatant, BattleState as EngineBattleState, BattleSkill as EngineBattleSkill } from "../game/battle/types"
import type { PortraitSpec } from "../assets/portraits"
import { PLAYER_PORTRAIT, ENEMY_PORTRAITS } from "../assets/portraits"
import { getItemById } from "../data/items"
import {
  performAction, advanceAtb, nextActor, checkBattleEndBySide, previewTurnOrder,
  tickUnitStatuses, enemyDecideAction, findCombatant,
} from "../game/battle/engine"
import { createBattleState, syncPlayersFromState, applyVictoryGrowth } from "../game/battle/adapter"

interface FloatText {
  id: number
  uid: string
  text: string
  kind: "damage" | "crit" | "dodge" | "heal" | "poison" | "status"
}

interface Props {
  player: Player
  enemies: Enemy[]
  onEnd: (result: { player: Player; outcome: "won" | "lost"; rewards?: { exp: number; gold: number; leveledUp: boolean } }) => void
}

let floatId = 0

function uidToPortraitId(uid: string): string {
  // enemy-{idx}-{id} → id；player-* → 默认
  const m = uid.match(/^enemy-\d+-(.+)$/)
  return m ? m[1] : "default"
}

export function BattleScreen({ player, enemies, onEnd }: Props) {
  const [state, setState] = useState<EngineBattleState>(() => createBattleState([player], enemies))
  const [log, setLog] = useState<{ text: string; type: string }[]>([
    { text: enemies.length > 1 ? "遭遇 " + enemies.map(function(e: Enemy){return e.name}).join("、") + " 等" + enemies.length + "人！" : ("遭遇 " + (enemies[0] ? enemies[0].name : "") + "！" + (enemies[0] ? enemies[0].description : "")), type: "system" },
  ])
  const [phase, setPhase] = useState<"acting" | "busy" | "ended">("acting")
  const [outcome, setOutcome] = useState<"won" | "lost" | null>(null)
  const [currentActorUid, setCurrentActorUid] = useState<string | null>(null)
  // 玩家待选目标时，记下要发的招；选好目标后释放
  const [pendingSkill, setPendingSkill] = useState<EngineBattleSkill | null>(null)
  const [floats, setFloats] = useState<FloatText[]>([])
  const [shakenUid, setShakenUid] = useState<string | null>(null)
  const [screenShake, setScreenShake] = useState(false)
  const [skillFlash, setSkillFlash] = useState<{ name: string; isCrit: boolean } | null>(null)
  const [showItems, setShowItems] = useState(false)

  const stateRef = useRef(state)
  stateRef.current = state
  const logEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => { logEndRef.current?.scrollIntoView({ behavior: "smooth" }) }, [log])

  // 开局推进 ATB，确定首动者
  useEffect(() => {
    const advanced = advanceAtb(stateRef.current)
    setState(advanced)
    const actor = nextActor(advanced)
    if (actor) {
      setCurrentActorUid(actor.uid)
      if (actor.side === "enemy") setTimeout(() => doEnemyAction(advanced, actor), 800)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function pushLog(entries: { text: string; type: string }[]) { setLog((prev) => [...prev, ...entries]) }
  function addFloat(uid: string, text: string, kind: FloatText["kind"]) {
    const id = ++floatId
    setFloats((prev) => [...prev, { id, uid, text, kind }])
    setTimeout(() => setFloats((prev) => prev.filter((f) => f.id !== id)), 1100)
  }
  function triggerShake(uid: string) { setShakenUid(uid); setTimeout(() => setShakenUid(null), 400) }
  function flashSkill(name: string, isCrit: boolean) {
    setSkillFlash({ name, isCrit })
    if (isCrit) { setScreenShake(true); setTimeout(() => setScreenShake(false), 450) }
    setTimeout(() => setSkillFlash(null), 650)
  }

  // 玩家点招式按钮（skill 来自 currentActor.skills，是 BattleSkill）
  function handlePlayerSkill(skill: EngineBattleSkill) {
    if (phase !== "acting" || !currentActorUid) return
    const actor = findCombatant(stateRef.current, currentActorUid)
    if (!actor || actor.side !== "player") return
    if (actor.mp < skill.mpCost) { pushLog([{ text: "内力不足，无法施展此招！", type: "system" }]); return }

    // 自身增益 / 群攻：无需选目标
    const needTarget = skill.category !== "内功" && skill.category !== "轻功" && (skill.targeting ?? "single") === "single"
    if (!needTarget) { resolvePlayerAction(actor, skill, []); return }

    const aliveEnemies = stateRef.current.enemySide.filter((e) => e.hp > 0)
    if (aliveEnemies.length <= 1) {
      resolvePlayerAction(actor, skill, aliveEnemies[0] ? [aliveEnemies[0].uid] : [])
    } else {
      setPendingSkill(skill)
      pushLog([{ text: `选择 ${skill.name} 的目标（点击敌方）`, type: "system" }])
    }
  }

  // 选定单体目标后释放
  function handleSelectTarget(targetUid: string) {
    if (!pendingSkill || !currentActorUid) return
    const actor = findCombatant(stateRef.current, currentActorUid)
    if (!actor) return
    const skill = pendingSkill
    setPendingSkill(null)
    resolvePlayerAction(actor, skill, [targetUid])
  }

  // 执行玩家行动
  function resolvePlayerAction(actor: EngineCombatant, skill: EngineBattleSkill, targetUids: string[]) {
    setPhase("busy")
    const r = performAction(stateRef.current, { actorUid: actor.uid, skill, targetUids })
    setState(r.state)
    pushLog(r.logs)
    flashSkill(skill.name, r.results.some((x) => x.isCrit))
    attachFloats(r, actor.side === "player" ? "enemy" : "player")
    setTimeout(() => afterAction(r.state, actor.uid), 850)
  }

  // 把结算结果里的伤害/闪避/状态挂到对应受击单位的飘字层
  function attachFloats(r: { state: EngineBattleState; results: { damage: number; isCrit: boolean; isDodge: boolean; statusApplied?: string }[] }, victimSide: "player" | "enemy") {
    const victims = victimSide === "enemy" ? r.state.enemySide : r.state.playerSide
    // 取受击过的单位（hp 减少或刚被结算）
    const hit = victims.filter((c) => c.hp < c.hpMax || c.hp <= 0)
    r.results.forEach((res, i) => {
      const v = hit[i]
      if (!v) return
      if (res.isDodge) setTimeout(() => addFloat(v.uid, "闪避", "dodge"), 200)
      else if (res.damage > 0) setTimeout(() => { addFloat(v.uid, `-${res.damage}`, res.isCrit ? "crit" : "damage"); triggerShake(v.uid) }, 220)
      if (res.statusApplied) setTimeout(() => addFloat(v.uid, res.statusApplied!, "status"), 380)
    })
  }

  // 敌方单位自动行动
  function doEnemyAction(curState: EngineBattleState, actor: EngineCombatant) {
    setPhase("busy")
    const ticked = tickUnitStatuses(curState, actor.uid)
    setState(ticked.state)
    if (ticked.logs.length) pushLog(ticked.logs)
    const cur = findCombatant(ticked.state, actor.uid)
    if (!cur || cur.hp <= 0) { afterAction(ticked.state, actor.uid); return }
    setTimeout(() => {
      const cmd = enemyDecideAction(ticked.state, cur)
      if (!cmd) { afterAction(ticked.state, actor.uid); return }
      const r = performAction(ticked.state, cmd)
      setState(r.state)
      pushLog(r.logs)
      flashSkill(cmd.skill.name, r.results.some((x) => x.isCrit))
      attachFloats(r, "player")
      setTimeout(() => afterAction(r.state, actor.uid), 850)
    }, 500)
  }

  // 一次行动后：判胜负 → 消耗 ATB → 推进 → 找下一个行动者
  function afterAction(curState: EngineBattleState, actorUid: string) {
    const th = curState.atbThreshold || 100
    const consume = (c: EngineCombatant) => c.uid === actorUid ? { ...c, atb: Math.max(0, c.atb - th) } : c
    let next: EngineBattleState = { ...curState, playerSide: curState.playerSide.map(consume), enemySide: curState.enemySide.map(consume) }
    const end = checkBattleEndBySide(next)
    if (end !== "ongoing") { finishBattle(end, next); return }

    next = advanceAtb(next)
    const actor = nextActor(next)
    setState(next)
    if (!actor) { setPhase("acting"); return }
    setCurrentActorUid(actor.uid)
    if (actor.side === "enemy") {
      setTimeout(() => doEnemyAction(next, actor), 700)
    } else {
      // 玩家单位：结算自身状态
      const ticked = tickUnitStatuses(next, actor.uid)
      if (ticked.logs.length) { pushLog(ticked.logs); setState(ticked.state) }
      const ta = findCombatant(ticked.state, actor.uid)
      if (!ta || ta.hp <= 0) { afterAction(ticked.state, actor.uid); return }
      setPhase("acting")
    }
  }

  function finishBattle(result: "won" | "lost", finalState: EngineBattleState) {
    const synced = syncPlayersFromState([player], finalState)[0]
    if (result === "won") {
      const totalExp = enemies.reduce(function(s: number, e: Enemy){return s+e.expReward},0)
      const totalGold = enemies.reduce(function(s: number, e: Enemy){return s+e.goldReward},0)
      const { player: grown, rewards } = applyVictoryGrowth(synced, totalExp, totalGold)
      pushLog([
        { text: "得胜！", type: "system" },
        { text: `获得经验 ${rewards.exp} 点，银两 ${rewards.gold} 两`, type: "system" },
        ...(rewards.leveledUp ? [{ text: `境界突破！升到 ${grown.level} 级！`, type: "crit" }] : []),
      ])
      setScreenShake(true)
      setTimeout(() => setScreenShake(false), 500)
      setOutcome("won"); setPhase("ended")
      onEnd({ player: { ...grown, hp: grown.hp, mp: grown.mp }, outcome: "won", rewards })
    } else {
      pushLog([{ text: "你被击败了……", type: "system" }])
      setOutcome("lost"); setPhase("ended")
      onEnd({ player: { ...synced, hp: Math.max(1, Math.round(synced.hpMax * 0.3)) }, outcome: "lost" })
    }
  }

  const turnOrder = previewTurnOrder(state, 6)
  const currentActor = currentActorUid ? findCombatant(state, currentActorUid) : null
  const isPlayerTurn = currentActor?.side === "player" && phase === "acting"

  const ownedItems = Object.entries(player.inventory).filter(([, count]) => count > 0)
  function handleUseItem(itemId: string) {
    const item = getItemById(itemId)
    if (!item?.usable || !item.apply) return
    const np = item.apply(player)
    setState((prev) => ({ ...prev, playerSide: prev.playerSide.map((c, i) => i === 0 ? { ...c, hp: np.hp, mp: np.mp } : c) }))
    setShowItems(false)
    pushLog([{ text: `你服用 ${item.name}，${item.effectText}。`, type: "status" }])
    addFloat(state.playerSide[0]?.uid ?? "player-0", item.effectText.includes("气血") ? "回血" : "回气", "heal")
  }

  return (
    <div className={`battle-screen ${screenShake ? "screen-shake" : ""}`}>
      <div className="battle-header-row">
        <div className="battle-header">第 {player.day} 日 · 闯荡江湖</div>
        <div className={`turn-banner phase-${phase}`}>
          {phase === "ended" ? (outcome === "won" ? "得胜" : "败北") : currentActor ? `${currentActor.name} 出手` : "交锋中"}
        </div>
      </div>

      {skillFlash && <div className={`skill-flash ${skillFlash.isCrit ? "crit" : ""}`}>{skillFlash.name}</div>}

      <div className="turn-order-bar">
        {turnOrder.map((entry, i) => (
          <span key={i} className={`turn-order-chip ${entry.side} ${i === 0 ? "current" : ""}`}>{entry.name}</span>
        ))}
      </div>

      <div className="battle-stage-shell battle-stage-multi">
        <div className="battle-row enemy-row">
          {state.enemySide.map((c) => (
            <CombatantCardMini key={c.uid} unit={c} portrait={ENEMY_PORTRAITS[uidToPortraitId(c.uid)] ?? ENEMY_PORTRAITS.default} shaken={shakenUid === c.uid} floats={floats.filter((f) => f.uid === c.uid)} selectable={!!pendingSkill && isPlayerTurn} onSelect={() => handleSelectTarget(c.uid)} highlight={currentActorUid === c.uid} />
          ))}
        </div>
        <div className="battle-stage-center"><div className="versus-mark">对 决</div></div>
        <div className="battle-row player-row">
          {state.playerSide.map((c) => (
            <CombatantCardMini key={c.uid} unit={c} portrait={PLAYER_PORTRAIT} shaken={shakenUid === c.uid} floats={floats.filter((f) => f.uid === c.uid)} highlight={currentActorUid === c.uid} />
          ))}
        </div>
      </div>

      <div className="battle-lower">
        <div className="battle-log-panel">
          <div className="panel-title">战况</div>
          <div className="battle-log">
            {log.map((entry, index) => <div key={index} className={`log-entry log-${entry.type}`}>{entry.text}</div>)}
            <div ref={logEndRef} />
          </div>
        </div>

        <div className="battle-actions-panel">
          {phase === "ended" ? (
            <div className="action-hint">{outcome === "won" ? "得胜而归" : "败北离场"}</div>
          ) : isPlayerTurn && currentActor && !showItems ? (
            <>
              <div className="panel-title">{currentActor.name} · 招式</div>
              <div className="skill-buttons cinematic">
                {currentActor.skills.map((s) => {
                  const disabled = currentActor.mp < s.mpCost
                  const tg = s.targeting
                  return (
                    <button key={s.id} className={`skill-btn cat-${s.category} ${disabled ? "disabled" : ""}`} disabled={disabled} onClick={() => handlePlayerSkill(s)}>
                      <span className="skill-btn-cat">{s.category}</span>
                      <span className="skill-btn-name">{s.name}</span>
                      <span className="skill-btn-info">{s.mpCost > 0 ? `内力 ${s.mpCost}` : "无消耗"}{tg && tg !== "single" ? ` · ${tg === "all-enemy" ? "群攻" : tg}` : ""}</span>
                    </button>
                  )
                })}
              </div>
              <button className="menu-btn battle-items-btn" onClick={() => setShowItems(true)}>使用道具</button>
            </>
          ) : isPlayerTurn && showItems ? (
            <>
              <div className="panel-title">行囊道具</div>
              <div className="skill-buttons cinematic">
                {ownedItems.length === 0 ? <div className="action-hint waiting">行囊中无可使用道具。</div> : ownedItems.map(([itemId, count]) => {
                  const item = getItemById(itemId)
                  return (
                    <button key={itemId} className="skill-btn item-btn" disabled={!item?.usable} onClick={() => handleUseItem(itemId)}>
                      <span className="skill-btn-cat">{item?.category ?? "物品"}</span>
                      <span className="skill-btn-name">{item?.name ?? itemId} ×{count}</span>
                      <span className="skill-btn-info">{item?.effectText ?? ""}</span>
                    </button>
                  )
                })}
              </div>
              <button className="menu-btn battle-items-btn" onClick={() => setShowItems(false)}>返回招式</button>
            </>
          ) : (
            <div className="action-hint waiting">双方正在拆招换式…</div>
          )}
        </div>
      </div>
    </div>
  )
}

function CombatantCardMini({
  unit, portrait, shaken, floats, highlight, selectable, onSelect,
}: {
  unit: EngineCombatant
  portrait: PortraitSpec
  shaken: boolean
  floats: FloatText[]
  highlight?: boolean
  selectable?: boolean
  onSelect?: () => void
}) {
  return (
    <div
      className={`combatant-card-mini ${unit.side} ${shaken ? "shake" : ""} ${highlight ? "active" : ""} ${selectable ? "selectable" : ""} ${unit.hp <= 0 ? "down" : ""}`}
      onClick={selectable ? onSelect : undefined}
    >
      <div className="combatant-tag-mini">{unit.side === "player" ? "我方" : "敌方"}</div>
      <div className="combatant-figure-wrap-mini">
        <div className="combatant-figure-mini" style={{ ["--figure-primary" as string]: portrait.palette.primary, ["--figure-secondary" as string]: portrait.palette.secondary }}>
          <div className="figure-emblem">{portrait.emblem}</div>
        </div>
        <div className="float-layer">{floats.map((f) => <span key={f.id} className={`float-text float-${f.kind}`}>{f.text}</span>)}</div>
      </div>
      <div className="combatant-panel-mini">
        <div className="combatant-name">{unit.name}</div>
        <MiniBar value={unit.hp} max={unit.hpMax} color="#c0392b" />
        <MiniBar value={unit.mp} max={unit.mpMax} color="#2980b9" />
        <div className="combatant-stats-mini"><span>攻{unit.attack}</span><span>速{unit.speed}</span></div>
        {unit.statuses.length > 0 && (
          <div className="status-badges-mini">
            {unit.statuses.map((s, i) => <span key={i} className={`status-badge status-${s.kind}`}>{s.name}{s.duration}</span>)}
          </div>
        )}
      </div>
    </div>
  )
}

function MiniBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max <= 0 ? 0 : Math.max(0, Math.min(100, (value / max) * 100))
  return (
    <div className="combat-bar-block">
      <div className="combat-bar-track cinematic">
        <div className="combat-bar-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  )
}

// 保留 Skill 类型的引用以兼容外部导入（player.skills 是 Skill[]，引擎内部转成 BattleSkill）
export type { Skill }
