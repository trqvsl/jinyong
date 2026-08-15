import { useState, useEffect, useRef, useMemo } from "react"
import {
  Backpack,
  Crosshair,
  Footprints,
  HeartPulse,
  Shield,
  Sparkles,
  Swords,
  Wind,
  Zap,
} from "lucide-react"
import type { Player, Enemy, Skill } from "../types"
import type {
  Combatant as EngineCombatant,
  BattleState as EngineBattleState,
  BattleSkill as EngineBattleSkill,
  BattleLogEntry as EngineBattleLogEntry,
} from "../game/battle"
import type { PortraitSpec } from "../assets/portraits"
import type { Npc } from "../data/npcs"
import { PLAYER_PORTRAIT, ENEMY_PORTRAITS } from "../assets/portraits"
import { getItemById } from "../data/items"
import { getSkillById } from "../data/skills"
import {
  performAction, enemyDecideAction, findCombatant, isStunned,
  createBattleState, applyAtbConsume, previewTurnOrder,
  createBattleSupportRuntimeState, applyTriggeredSupport, advanceBattleToNextActor, finalizeBattleResult,
} from "../game/battle"
import { npcToPlayerSideCombatant } from "../game/npc"
import { fleeChanceOf } from "../game/attributes"
import { getBattleSupportMechanicRules, type PartyBondBonus, type PartySupportBonus, type PartySupportTotals } from "../game/party"

interface FloatText {
  id: number
  uid: string
  text: string
  kind: "damage" | "crit" | "dodge" | "heal" | "poison" | "status"
}

interface ActionMotion {
  id: number
  actorUid: string
  targetUids: string[]
  category: EngineBattleSkill["category"]
  skillId: string
  side: "player" | "enemy"
  isCrit: boolean
}

interface Props {
  player: Player
  battlePlayer?: Player
  enemies: Enemy[]
  teammates?: Npc[]    // 已入队 NPC 队友，AI 自动操控
  partySupportBonuses?: PartySupportBonus[]
  partyBondBonuses?: PartyBondBonus[]
  partySupportTotals?: PartySupportTotals
  openingSupportLines?: string[]
  onEnd: (result: { player: Player; outcome: "won" | "lost" | "fled"; rewards?: { exp: number; gold: number; leveledUp: boolean } }) => void
}

let floatId = 0
let motionId = 0

function uidToPortraitId(uid: string): string {
  const enemy = uid.match(/^enemy-\d+-(.+)$/)
  if (enemy) return enemy[1]
  const npc = uid.match(/^npc-(.+)$/)
  if (npc) return npc[1]
  return "default"
}

function portraitForUnit(unit: EngineCombatant, isMainPlayer = false): PortraitSpec {
  if (isMainPlayer) return PLAYER_PORTRAIT
  return ENEMY_PORTRAITS[uidToPortraitId(unit.uid)] ?? ENEMY_PORTRAITS.default
}

function targetingLabel(skill: EngineBattleSkill): string {
  switch (skill.targeting) {
    case "all-enemy": return "敌方全体"
    case "spread2": return "至多二人"
    case "random3": return "随机三击"
    case "self-side": return "我方全体"
    default:
      return skill.category === "内功" || skill.category === "轻功" ? "自身" : "单体"
  }
}

function SkillGlyph({ category }: { category: EngineBattleSkill["category"] }) {
  const Icon = category === "外功"
    ? Swords
    : category === "内功"
      ? HeartPulse
      : category === "轻功"
        ? Wind
        : Sparkles
  return <Icon size={20} aria-hidden="true" />
}

export function BattleScreen({ player, battlePlayer, enemies, teammates, partySupportBonuses = [], partyBondBonuses = [], partySupportTotals = { attack: 0, defense: 0, speed: 0 }, openingSupportLines = [], onEnd }: Props) {
  const combatPlayer = battlePlayer ?? player
  const supportMechanicRules = useMemo(() => getBattleSupportMechanicRules(player), [player])
  const [state, setState] = useState<EngineBattleState>(() => {
    const base = createBattleState([combatPlayer], enemies)
    // 将 NPC 队友追加到玩家侧
    if (teammates && teammates.length > 0) {
      base.playerSide = [...base.playerSide, ...teammates.map(npcToPlayerSideCombatant)]
    }
    return base
  })
  const [log, setLog] = useState<{ text: string; type: string }[]>([
    { text: enemies.length > 1 ? "遭遇 " + enemies.map(function(e: Enemy){return e.name}).join("、") + " 等" + enemies.length + "人！" : ("遭遇 " + (enemies[0] ? enemies[0].name : "") + "！" + (enemies[0] ? enemies[0].description : "")), type: "system" },
    ...openingSupportLines.map((text) => ({ text, type: "status" })),
  ])
  const [phase, setPhase] = useState<"acting" | "busy" | "ended">("acting")
  const [outcome, setOutcome] = useState<"won" | "lost" | "fled" | null>(null)
  const [currentActorUid, setCurrentActorUid] = useState<string | null>(null)
  // 玩家待选目标时，记下要发的招；选好目标后释放
  const [pendingSkill, setPendingSkill] = useState<EngineBattleSkill | null>(null)
  const [floats, setFloats] = useState<FloatText[]>([])
  const [shakenUid, setShakenUid] = useState<string | null>(null)
  const [screenShake, setScreenShake] = useState(false)
  const [skillFlash, setSkillFlash] = useState<{
    name: string
    isCrit: boolean
    side: "player" | "enemy"
    category: EngineBattleSkill["category"]
  } | null>(null)
  const [actionMotion, setActionMotion] = useState<ActionMotion | null>(null)
  const [showItems, setShowItems] = useState(false)
  const [supportHighlightNpcIds, setSupportHighlightNpcIds] = useState<string[]>([])
  const [supportHighlightBondIds, setSupportHighlightBondIds] = useState<string[]>([])

  const stateRef = useRef(state)
  stateRef.current = state
  // 战斗中对背包的修改（用道具扣库存），结束时合并回传给父组件
  const inventoryPatch = useRef<Record<string, number>>({})
  const supportRuntimeRef = useRef(createBattleSupportRuntimeState())
  const logEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => { logEndRef.current?.scrollIntoView({ behavior: "smooth" }) }, [log])

  // 开局：推进 ATB，调度第一个行动者（含状态结算/眩晕跳过）
  useEffect(() => {
    scheduleNext(stateRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function pushLog(entries: { text: string; type: string }[]) { setLog((prev) => [...prev, ...entries]) }
  function addFloat(uid: string, text: string, kind: FloatText["kind"]) {
    const id = ++floatId
    setFloats((prev) => [...prev, { id, uid, text, kind }])
    setTimeout(() => setFloats((prev) => prev.filter((f) => f.id !== id)), 1100)
  }
  function triggerShake(uid: string) { setShakenUid(uid); setTimeout(() => setShakenUid(null), 400) }
  function flashSkill(
    name: string,
    isCrit: boolean,
    side: "player" | "enemy",
    category: EngineBattleSkill["category"]
  ) {
    setSkillFlash({ name, isCrit, side, category })
    if (isCrit) { setScreenShake(true); setTimeout(() => setScreenShake(false), 450) }
    setTimeout(() => setSkillFlash(null), 650)
  }

  function triggerActionMotion(
    actor: EngineCombatant,
    skill: EngineBattleSkill,
    results: { targetUid?: string; isCrit?: boolean }[]
  ) {
    const id = ++motionId
    const resultTargets = results.flatMap((result) => result.targetUid ? [result.targetUid] : [])
    const targetUids = Array.from(new Set(
      resultTargets.length > 0
        ? resultTargets
        : skill.effect?.target === "self" || skill.category === "内功" || skill.category === "轻功"
          ? [actor.uid]
          : []
    ))
    setActionMotion({
      id,
      actorUid: actor.uid,
      targetUids,
      category: skill.category,
      skillId: skill.id,
      side: actor.side,
      isCrit: results.some((result) => result.isCrit),
    })
    setTimeout(() => {
      setActionMotion((current) => current?.id === id ? null : current)
    }, 820)
  }

  function highlightSupport(sourceNpcIds: string[], sourceBondIds: string[]) {
    if (sourceNpcIds.length > 0) {
      setSupportHighlightNpcIds(sourceNpcIds)
      setTimeout(() => setSupportHighlightNpcIds([]), 1600)
    }
    if (sourceBondIds.length > 0) {
      setSupportHighlightBondIds(sourceBondIds)
      setTimeout(() => setSupportHighlightBondIds([]), 1600)
    }
  }

  function emitTriggeredSupport(curState: EngineBattleState, trigger: "crit" | "guard" | "victory"): { state: EngineBattleState; logs: EngineBattleLogEntry[] } {
    const support = applyTriggeredSupport({
      player,
      trigger,
      state: curState,
      runtime: supportRuntimeRef.current,
    })
    supportRuntimeRef.current = support.runtime
    support.floats.forEach((float) => {
      setTimeout(() => addFloat(float.uid, float.text, float.kind), 180)
    })
    highlightSupport(support.highlightNpcIds, support.highlightBondIds)
    return { state: support.state, logs: support.logs }
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
    let nextState = r.state
    const nextLogs = [...r.logs]
    if (actor.uid === stateRef.current.playerSide[0]?.uid && r.results.some((x) => x.isCrit)) {
      const support = emitTriggeredSupport(nextState, "crit")
      nextState = support.state
      nextLogs.push(...support.logs)
    }
    triggerActionMotion(actor, skill, r.results)
    flashSkill(skill.name, r.results.some((x) => x.isCrit), actor.side, skill.category)
    setTimeout(() => {
      setState(nextState)
      pushLog(nextLogs)
    }, 180)
    attachFloats(r, actor.side === "player" ? "enemy" : "player")
    setTimeout(() => afterAction(nextState, actor.uid), 850)
  }

  // 把结算结果里的伤害/闪避/状态挂到对应受击单位的飘字层。
  // 按 result.targetUid 精确定位受击单位（多目标时不再靠索引猜，避免飘字挂错人）。
  function attachFloats(r: { state: EngineBattleState; results: { damage: number; isCrit: boolean; isDodge: boolean; statusApplied?: string; targetUid?: string }[] }, _victimSide: "player" | "enemy") {
    for (const res of r.results) {
      if (!res.targetUid) continue
      const v = findCombatant(r.state, res.targetUid)
      if (!v) continue
      if (res.isDodge) setTimeout(() => addFloat(v.uid, "闪避", "dodge"), 200)
      else if (res.damage > 0) setTimeout(() => { addFloat(v.uid, `-${res.damage}`, res.isCrit ? "crit" : "damage"); triggerShake(v.uid) }, 220)
      if (res.statusApplied) setTimeout(() => addFloat(v.uid, res.statusApplied!, "status"), 380)
    }
  }

  // 敌方单位自动行动（状态已由 scheduleNext 结算，此处直接出手）
  function doEnemyAction(curState: EngineBattleState, actor: EngineCombatant) {
    setPhase("busy")
    const cur = findCombatant(curState, actor.uid)
    if (!cur || cur.hp <= 0 || isStunned(cur)) { afterAction(curState, actor.uid); return }
    setTimeout(() => {
      const cmd = enemyDecideAction(curState, cur)
      if (!cmd) { afterAction(curState, actor.uid); return }
      const r = performAction(curState, cmd)
      let nextState = r.state
      const nextLogs = [...r.logs]
      const mainPlayer = r.state.playerSide[0]
      if (mainPlayer && mainPlayer.hp > 0 && mainPlayer.hp / Math.max(1, mainPlayer.hpMax) <= 0.35) {
        const support = emitTriggeredSupport(nextState, "guard")
        nextState = support.state
        nextLogs.push(...support.logs)
      }
      triggerActionMotion(cur, cmd.skill, r.results)
      flashSkill(cmd.skill.name, r.results.some((x) => x.isCrit), cur.side, cmd.skill.category)
      setTimeout(() => {
        setState(nextState)
        pushLog(nextLogs)
      }, 180)
      attachFloats(r, "player")
      setTimeout(() => afterAction(nextState, actor.uid), 850)
    }, 500)
  }

  // NPC 队友自动行动（复用敌方 AI 决策，但目标是敌方）
  function doNpcTeammateAction(curState: EngineBattleState, actor: EngineCombatant) {
    setPhase("busy")
    const cur = findCombatant(curState, actor.uid)
    if (!cur || cur.hp <= 0 || isStunned(cur)) { afterAction(curState, actor.uid); return }
    setTimeout(() => {
      const cmd = enemyDecideAction(curState, cur)
      if (!cmd) { afterAction(curState, actor.uid); return }
      const r = performAction(curState, cmd)
      triggerActionMotion(cur, cmd.skill, r.results)
      flashSkill(cmd.skill.name, r.results.some((x) => x.isCrit), cur.side, cmd.skill.category)
      setTimeout(() => {
        setState(r.state)
        pushLog(r.logs)
      }, 180)
      attachFloats(r, "enemy")
      setTimeout(() => afterAction(r.state, actor.uid), 850)
    }, 500)
  }

  // 一次行动后：消耗该行动者的 ATB，调度下一个能行动的单位
  function afterAction(curState: EngineBattleState, actorUid: string) {
    scheduleNext(applyAtbConsume(curState, actorUid))
  }

  // 调度下一个行动者：推进 ATB → 结算其身上状态 → 跳过死亡/眩晕者 → 让其出手。
  // 用 while 连续跳过所有"轮到却无法行动"的单位（中毒致死、被点穴），直到找到能动的或战斗结束。
  // （这也修复了：首动者的持续状态原本不被结算的问题——现在统一在此 tick。）
  function scheduleNext(start: EngineBattleState) {
    const step = advanceBattleToNextActor(start)
    if (step.logs.length) pushLog(step.logs)
    setState(step.state)

    if (step.ended !== "ongoing") {
      finishBattle(step.ended === "won" ? "won" : "lost", step.state)
      return
    }

    if (!step.actor || !step.actorMode) {
      setPhase("acting")
      return
    }

    const actor = step.actor
    setCurrentActorUid(actor.uid)
    if (step.actorMode === "enemy") {
      setTimeout(() => doEnemyAction(step.state, actor), 700)
    } else if (step.actorMode === "teammate") {
      setTimeout(() => doNpcTeammateAction(step.state, actor), 600)
    } else {
      setPhase("acting")
    }
  }

  function finishBattle(result: "won" | "lost" | "fled", finalState: EngineBattleState) {
    let resolvedState = finalState
    const finalLogs: EngineBattleLogEntry[] = []
    if (result === "won") {
      const support = emitTriggeredSupport(resolvedState, "victory")
      resolvedState = support.state
      finalLogs.push(...support.logs)
    }

    const finalized = finalizeBattleResult({
      result,
      finalState: resolvedState,
      player,
      combatPlayer,
      enemies,
      inventoryPatch: inventoryPatch.current,
      runtime: supportRuntimeRef.current,
    })

    if (result === "won") {
      pushLog([...finalLogs, ...finalized.logs])
      setScreenShake(true)
      setTimeout(() => setScreenShake(false), 500)
      setOutcome("won"); setPhase("ended")
      onEnd({ player: finalized.player, outcome: "won", rewards: finalized.rewards })
    } else if (result === "fled") {
      setOutcome("fled"); setPhase("ended")
      onEnd({ player: finalized.player, outcome: "fled" })
    } else {
      pushLog(finalized.logs)
      setOutcome("lost"); setPhase("ended")
      onEnd({ player: finalized.player, outcome: "lost" })
    }
  }

  const turnOrder = useMemo(() => previewTurnOrder(state, 6), [state])
  const currentActor = currentActorUid ? findCombatant(state, currentActorUid) : null
  const isPlayerTurn = currentActor?.side === "player" && !currentActor?.uid.startsWith("npc-") && phase === "acting"

  const ownedItems = Object.entries({ ...player.inventory, ...inventoryPatch.current }).filter(([, count]) => count > 0)
  function handleUseItem(itemId: string) {
    const item = getItemById(itemId)
    if (!item?.usable || !item.apply || !currentActorUid) return
    // 基于战斗中当前的血/内力施加效果（连续服用不会基于过期数值）
    const me = stateRef.current.playerSide[0]
    if (!me) return
    const np = item.apply({ ...player, hp: me.hp, mp: me.mp })
    // 扣库存（记入 patch，战斗结束时合并回传）
    inventoryPatch.current = { ...inventoryPatch.current, [itemId]: Math.max(0, (inventoryPatch.current[itemId] ?? player.inventory[itemId] ?? 0) - 1) }
    const next: EngineBattleState = { ...stateRef.current, playerSide: stateRef.current.playerSide.map((c, i) => i === 0 ? { ...c, hp: np.hp, mp: np.mp } : c) }
    setPhase("busy")
    setState(next)
    setShowItems(false)
    pushLog([{ text: `你服用 ${item.name}，${item.effectText}。`, type: "status" }])
    const itemMotionSkill: EngineBattleSkill = {
      id: item.id,
      name: item.name,
      category: "内功",
      power: 0,
      mpCost: 0,
    }
    triggerActionMotion(me, itemMotionSkill, [{ targetUid: me.uid }])
    flashSkill(item.name, false, "player", "内功")
    setTimeout(() => addFloat(me.uid, item.effectText.includes("气血") ? "回血" : "回气", "heal"), 180)
    // 使用道具消耗本回合行动权
    setTimeout(() => afterAction(next, currentActorUid), 650)
  }

  // 逃跑：成功率由福缘根基推导（fleeChanceOf）；成功则保留当前血量脱战，失败消耗一回合
  function handleFlee() {
    if (phase !== "acting" || !isPlayerTurn || !currentActorUid) return
    if (Math.random() < fleeChanceOf(player.roots)) {
      pushLog([{ text: "你虚晃一招，趁隙脱身而去！", type: "system" }])
      finishBattle("fled", stateRef.current)
    } else {
      pushLog([{ text: "对方缠斗不休，未能脱身！", type: "system" }])
      afterAction(stateRef.current, currentActorUid)
    }
  }

  return (
    <div className={`battle-screen battle-screen-v2 ${screenShake ? "screen-shake" : ""}`}>
      <div className="battle-header-row">
        <div className="battle-header">
          <span className="battle-header-kicker">江湖交锋</span>
          <strong>第 {player.day} 日 · {enemies.length > 1 ? `以一敌${enemies.length}` : `对阵${enemies[0]?.name ?? "强敌"}`}</strong>
        </div>
        <div className={`turn-banner phase-${phase}`}>
          <Zap size={16} aria-hidden="true" />
          <span>{phase === "ended" ? (outcome === "won" ? "得胜" : outcome === "fled" ? "脱身" : "败北") : currentActor ? `${currentActor.name} 出手` : "交锋中"}</span>
        </div>
      </div>

      {skillFlash && (
        <div className={`skill-flash skill-flash-v2 ${skillFlash.side} cat-${skillFlash.category} ${skillFlash.isCrit ? "crit" : ""}`}>
          <span className="skill-flash-kicker">{skillFlash.isCrit ? "会心一击" : skillFlash.side === "player" ? "武学施展" : "敌招来袭"}</span>
          <strong>{skillFlash.name}</strong>
        </div>
      )}

      <div className="turn-order-bar">
        {turnOrder.map((entry, i) => (
          <span key={`${entry.uid}-${i}`} className={`turn-order-chip ${entry.side} ${i === 0 ? "current" : ""}`}>
            <span className="turn-order-dot" />
            {entry.name}
          </span>
        ))}
      </div>

      {(partySupportBonuses.length > 0 || partyBondBonuses.length > 0 || (teammates?.length ?? 0) > 0) && (
        <div className="battle-support-panel">
          <div className="battle-support-head">
            <span className="battle-support-title">随行支援</span>
            <span className="battle-support-total">攻+{partySupportTotals.attack} / 防+{partySupportTotals.defense} / 速+{partySupportTotals.speed}</span>
          </div>
          <div className="battle-support-list">
            {partySupportBonuses.map((bonus) => (
              <span key={bonus.npcId} className={`battle-support-chip ${supportHighlightNpcIds.includes(bonus.npcId) ? "active" : ""}`}>{bonus.npcName}：攻+{bonus.attack} 防+{bonus.defense} 速+{bonus.speed}</span>
            ))}
            {partyBondBonuses.map((bond) => (
              <span key={bond.id} className={`battle-support-chip bond ${supportHighlightBondIds.includes(bond.id) ? "active" : ""}`}>{bond.name}：攻+{bond.attack} 防+{bond.defense} 速+{bond.speed}</span>
            ))}
          </div>
          {partyBondBonuses.length > 0 && (
            <div className="battle-bond-lines">
              {partyBondBonuses.map((bond) => <div key={bond.id} className={`battle-bond-line ${supportHighlightBondIds.includes(bond.id) ? "active" : ""}`}>{bond.name}：{bond.battleLine}</div>)}
            </div>
          )}
          {supportMechanicRules.length > 0 && (
            <div className="battle-support-rules">
              {supportMechanicRules.map((rule) => (
                <div key={rule.trigger} className="battle-support-rule">
                  <div className="battle-support-rule-headline">
                    <span className="battle-support-rule-name">{rule.title}</span>
                    <span className="battle-support-rule-trigger">{rule.triggerLabel}</span>
                    <span className="battle-support-rule-effect">{rule.focusTags.join(" / ")}</span>
                  </div>
                  <div className="battle-support-rule-sources">
                    {rule.sourceEntries.map((entry) => (
                      <div key={entry.key} className={`battle-support-rule-source ${entry.type}`}>
                        <span className="battle-support-rule-source-name">{entry.label}</span>
                        <span className="battle-support-rule-source-effect">{entry.details.join(" · ")}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className={`battle-stage-shell battle-stage-v2 phase-${phase}`}>
        <div className="battle-stage-bg-v2" aria-hidden="true" />
        <div className="battle-stage-mist mist-one" aria-hidden="true" />
        <div className="battle-stage-mist mist-two" aria-hidden="true" />
        <div className="battle-side-caption enemy-caption">
          <span>敌阵</span>
          <small>{state.enemySide.filter((unit) => unit.hp > 0).length} 人仍可战</small>
        </div>
        <div className="battle-row enemy-row">
          {state.enemySide.map((c) => (
            <BattleFighter
              key={c.uid}
              unit={c}
              portrait={portraitForUnit(c)}
              shaken={shakenUid === c.uid}
              floats={floats.filter((f) => f.uid === c.uid)}
              selectable={!!pendingSkill && isPlayerTurn}
              onSelect={() => handleSelectTarget(c.uid)}
              highlight={currentActorUid === c.uid}
              isAttacking={actionMotion?.actorUid === c.uid}
              isTargeted={actionMotion?.targetUids.includes(c.uid)}
              actionCategory={actionMotion?.actorUid === c.uid || actionMotion?.targetUids.includes(c.uid) ? actionMotion?.category : undefined}
            />
          ))}
        </div>
        <div className="battle-stage-center">
          <div className="battle-clash-mark">
            <Swords size={22} aria-hidden="true" />
            <span>交锋</span>
          </div>
        </div>
        <div className="battle-row player-row">
          {state.playerSide.map((c, index) => (
            <BattleFighter
              key={c.uid}
              unit={c}
              portrait={portraitForUnit(c, index === 0)}
              shaken={shakenUid === c.uid}
              floats={floats.filter((f) => f.uid === c.uid)}
              highlight={currentActorUid === c.uid}
              supportActive={!!teammates?.[index - 1] && supportHighlightNpcIds.includes(teammates[index - 1].id)}
              tagText={index === 0 ? "主角" : "同伴"}
              isAttacking={actionMotion?.actorUid === c.uid}
              isTargeted={actionMotion?.targetUids.includes(c.uid)}
              actionCategory={actionMotion?.actorUid === c.uid || actionMotion?.targetUids.includes(c.uid) ? actionMotion?.category : undefined}
            />
          ))}
        </div>
        <div className="battle-side-caption player-caption">
          <span>我方</span>
          <small>{state.playerSide.filter((unit) => unit.hp > 0).length} 人仍可战</small>
        </div>
        {actionMotion && (
          <div
            key={actionMotion.id}
            className={`battle-technique-fx side-${actionMotion.side} cat-${actionMotion.category} skill-${actionMotion.skillId} ${actionMotion.isCrit ? "crit" : ""}`}
            aria-hidden="true"
          >
            <span className="technique-trail trail-one" />
            <span className="technique-trail trail-two" />
            <span className="technique-core" />
            <span className="technique-ring" />
          </div>
        )}
      </div>

      <div className="battle-lower">
        <div className="battle-log-panel">
          <div className="panel-title battle-panel-title">
            <Crosshair size={16} aria-hidden="true" />
            <span>战况</span>
          </div>
          <div className="battle-log">
            {log.map((entry, index) => <div key={index} className={`log-entry log-${entry.type}`}>{entry.text}</div>)}
            <div ref={logEndRef} />
          </div>
        </div>

        <div className="battle-actions-panel">
          {phase === "ended" ? (
            <div className="action-hint">{outcome === "won" ? "得胜而归" : outcome === "fled" ? "脱身而去" : "败北离场"}</div>
          ) : isPlayerTurn && currentActor && !showItems ? (
            <>
              <div className="panel-title battle-panel-title command-title">
                <Swords size={17} aria-hidden="true" />
                <span>{currentActor.name} · 择招</span>
                {pendingSkill && <small>请选择敌方目标</small>}
              </div>
              <div className="skill-buttons cinematic battle-skill-grid">
                {currentActor.skills.map((s) => {
                  const disabled = currentActor.mp < s.mpCost
                  const definition = getSkillById(s.id)
                  return (
                    <button key={s.id} className={`skill-btn battle-skill-btn cat-${s.category} ${disabled ? "disabled" : ""}`} disabled={disabled} onClick={() => handlePlayerSkill(s)}>
                      <span className="skill-btn-icon"><SkillGlyph category={s.category} /></span>
                      <span className="skill-btn-copy">
                        <span className="skill-btn-cat">{s.category}</span>
                        <span className="skill-btn-name">{s.name}</span>
                        <span className="skill-btn-desc">{definition?.description ?? "江湖武学"}</span>
                      </span>
                      <span className="skill-btn-info">
                        <b>{s.mpCost > 0 ? `${s.mpCost} 内力` : "无消耗"}</b>
                        <small>{targetingLabel(s)}</small>
                      </span>
                    </button>
                  )
                })}
              </div>
              <div className="battle-tactical-actions">
                <button className="battle-tactical-btn" onClick={() => setShowItems(true)}>
                  <Backpack size={18} aria-hidden="true" />
                  <span>行囊</span>
                </button>
                <button className="battle-tactical-btn flee" onClick={handleFlee}>
                  <Footprints size={18} aria-hidden="true" />
                  <span>脱身</span>
                </button>
              </div>
            </>
          ) : isPlayerTurn && showItems ? (
            <>
              <div className="panel-title battle-panel-title command-title">
                <Backpack size={17} aria-hidden="true" />
                <span>行囊道具</span>
              </div>
              <div className="skill-buttons cinematic battle-skill-grid item-grid">
                {ownedItems.length === 0 ? <div className="action-hint waiting">行囊中无可使用道具。</div> : ownedItems.map(([itemId, count]) => {
                  const item = getItemById(itemId)
                  return (
                    <button key={itemId} className="skill-btn battle-skill-btn item-btn" disabled={!item?.usable} onClick={() => handleUseItem(itemId)}>
                      <span className="skill-btn-icon"><Shield size={20} aria-hidden="true" /></span>
                      <span className="skill-btn-copy">
                        <span className="skill-btn-cat">{item?.category ?? "物品"}</span>
                        <span className="skill-btn-name">{item?.name ?? itemId}</span>
                        <span className="skill-btn-desc">{item?.description ?? ""}</span>
                      </span>
                      <span className="skill-btn-info">
                        <b>余 {count}</b>
                        <small>{item?.effectText ?? ""}</small>
                      </span>
                    </button>
                  )
                })}
              </div>
              <button className="battle-tactical-btn back-to-skills" onClick={() => setShowItems(false)}>
                <Swords size={18} aria-hidden="true" />
                <span>返回招式</span>
              </button>
            </>
          ) : (
            <div className="action-hint waiting battle-waiting">
              <Swords size={28} aria-hidden="true" />
              <span>双方正在拆招换式</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function BattleFighter({
  unit,
  portrait,
  shaken,
  floats,
  highlight,
  selectable,
  onSelect,
  tagText,
  supportActive,
  isAttacking,
  isTargeted,
  actionCategory,
}: {
  unit: EngineCombatant
  portrait: PortraitSpec
  shaken: boolean
  floats: FloatText[]
  highlight?: boolean
  supportActive?: boolean
  selectable?: boolean
  onSelect?: () => void
  tagText?: string
  isAttacking?: boolean
  isTargeted?: boolean
  actionCategory?: EngineBattleSkill["category"]
}) {
  const [imageReady, setImageReady] = useState(false)
  const hpPercent = unit.hpMax <= 0 ? 0 : Math.max(0, Math.min(100, (unit.hp / unit.hpMax) * 100))

  return (
    <div
      className={[
        "battle-fighter",
        unit.side,
        `role-${portrait.role}`,
        shaken ? "shake" : "",
        highlight ? "active" : "",
        supportActive ? "support-active" : "",
        selectable ? "selectable" : "",
        unit.hp <= 0 ? "down" : "",
        isAttacking ? "is-attacking" : "",
        isTargeted ? "is-targeted" : "",
        actionCategory ? `motion-${actionCategory}` : "",
      ].filter(Boolean).join(" ")}
      onClick={selectable ? onSelect : undefined}
      onKeyDown={selectable ? (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault()
          onSelect?.()
        }
      } : undefined}
      role={selectable ? "button" : undefined}
      tabIndex={selectable ? 0 : undefined}
      aria-label={`${unit.name}，气血 ${unit.hp}/${unit.hpMax}${selectable ? "，选择为目标" : ""}`}
      style={{
        ["--fighter-primary" as string]: portrait.palette.primary,
        ["--fighter-secondary" as string]: portrait.palette.secondary,
        ["--fighter-glow" as string]: portrait.palette.glow,
        ["--fighter-hp" as string]: `${hpPercent}%`,
      }}
    >
      {highlight && (
        <div className="fighter-turn-marker">
          <Zap size={13} aria-hidden="true" />
          <span>行动</span>
        </div>
      )}
      {selectable && (
        <div className="fighter-target-marker">
          <Crosshair size={16} aria-hidden="true" />
          <span>选择目标</span>
        </div>
      )}
      <div className="fighter-art">
        <div className="fighter-aura" aria-hidden="true" />
        {portrait.image && (
          <img
            src={portrait.image}
            alt=""
            className={`fighter-portrait ${imageReady ? "ready" : ""}`}
            onLoad={(event) => {
              const image = event.currentTarget
              setImageReady(image.naturalWidth !== image.naturalHeight)
            }}
            onError={() => setImageReady(false)}
          />
        )}
        <div className={`fighter-fallback ${imageReady ? "behind-image" : ""}`} aria-hidden="true">
          <span className="fighter-hair" />
          <span className="fighter-head" />
          <span className="fighter-torso" />
          <span className="fighter-arm arm-front" />
          <span className="fighter-arm arm-back" />
          <span className="fighter-leg leg-front" />
          <span className="fighter-leg leg-back" />
          <span className="fighter-weapon" />
          <span className="fighter-sash" />
        </div>
        <div className="fighter-ground-shadow" aria-hidden="true" />
        <div className="float-layer">{floats.map((f) => <span key={f.id} className={`float-text float-${f.kind}`}>{f.text}</span>)}</div>
      </div>
      <div className="fighter-hud">
        <div className="fighter-name-row">
          <span className="fighter-side-tag">{tagText ?? (unit.side === "player" ? "我方" : "敌方")}</span>
          <strong>{unit.name}</strong>
          <small>{portrait.title}</small>
        </div>
        <FighterBar label="气血" value={unit.hp} max={unit.hpMax} tone="hp" />
        <FighterBar label="内力" value={unit.mp} max={unit.mpMax} tone="mp" />
        <div className="fighter-stat-row">
          <span>攻 {unit.attack}</span>
          <span>防 {unit.defense}</span>
          <span>速 {unit.speed}</span>
        </div>
        {unit.statuses.length > 0 && (
          <div className="fighter-statuses">
            {unit.statuses.map((s, i) => <span key={i} className={`status-badge status-${s.kind}`}>{s.name}{s.duration}</span>)}
          </div>
        )}
      </div>
    </div>
  )
}

function FighterBar({ label, value, max, tone }: { label: string; value: number; max: number; tone: "hp" | "mp" }) {
  const pct = max <= 0 ? 0 : Math.max(0, Math.min(100, (value / max) * 100))
  return (
    <div className={`fighter-bar ${tone}`}>
      <span className="fighter-bar-label">{label}</span>
      <div className="fighter-bar-track">
        <div className="fighter-bar-fill" style={{ width: `${pct}%` }} />
      </div>
      <span className="fighter-bar-value">{value}/{max}</span>
    </div>
  )
}

// 保留 Skill 类型的引用以兼容外部导入（player.skills 是 Skill[]，引擎内部转成 BattleSkill）
export type { Skill }
