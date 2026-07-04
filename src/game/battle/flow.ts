import type { Player, Enemy } from "../../types"
import type {
  BattleLogEntry,
  BattleState,
  Combatant,
  StatusEffect,
  StatusKind,
} from "./types"
import {
  advanceAtb,
  applyAtbConsume,
  applyStatusToCombatant,
  checkBattleEndBySide,
  findCombatant,
  healCombatant,
  isStunned,
  nextActor,
  restoreMpCombatant,
  tickUnitStatuses,
} from "./engine"
import { applyVictoryGrowth, syncPlayersFromState } from "./adapter"
import {
  getBattleTriggeredSupportEffects,
  getBattleTriggeredSupportEvents,
  type BattleSupportMechanicEffect,
  type BattleSupportTrigger,
} from "../party"

export interface BattleFlowFloat {
  uid: string
  text: string
  kind: "heal" | "status"
}

export interface BattleSupportRuntimeState {
  triggered: Partial<Record<BattleSupportTrigger, boolean>>
  statusRestore: Partial<Record<StatusKind, StatusEffect | null>>
}

export interface BattleSupportApplicationResult {
  state: BattleState
  logs: BattleLogEntry[]
  floats: BattleFlowFloat[]
  highlightNpcIds: string[]
  highlightBondIds: string[]
  runtime: BattleSupportRuntimeState
}

export interface BattleAdvanceResult {
  state: BattleState
  logs: BattleLogEntry[]
  actor: Combatant | null
  actorMode: "player" | "enemy" | "teammate" | null
  ended: "ongoing" | "won" | "lost"
}

export interface FinalizeBattleResult {
  player: Player
  rewards?: { exp: number; gold: number; leveledUp: boolean }
  logs: BattleLogEntry[]
}

export function createBattleSupportRuntimeState(): BattleSupportRuntimeState {
  return { triggered: {}, statusRestore: {} }
}

function rememberSupportStatusBaseline(runtime: BattleSupportRuntimeState, curState: BattleState, kind: StatusKind): BattleSupportRuntimeState {
  if (Object.prototype.hasOwnProperty.call(runtime.statusRestore, kind)) return runtime
  const mainPlayer = curState.playerSide[0]
  return {
    ...runtime,
    statusRestore: {
      ...runtime.statusRestore,
      [kind]: mainPlayer?.statuses.find((status) => status.kind === kind) ?? null,
    },
  }
}

export function cleanupSupportStatuses(curState: BattleState, runtime: BattleSupportRuntimeState): BattleState {
  const entries = Object.entries(runtime.statusRestore) as [StatusKind, StatusEffect | null][]
  if (entries.length === 0) return curState
  const mainPlayer = curState.playerSide[0]
  if (!mainPlayer) return curState
  const restoredKinds = new Set(entries.map(([kind]) => kind))
  const restoredStatuses = mainPlayer.statuses.filter((status) => !restoredKinds.has(status.kind))
  for (const [, previous] of entries) {
    if (previous) restoredStatuses.push(previous)
  }
  return {
    ...curState,
    playerSide: curState.playerSide.map((unit, index) => index === 0 ? { ...unit, statuses: restoredStatuses } : unit),
  }
}

export function applySupportMechanicEffect(args: {
  state: BattleState
  effect: BattleSupportMechanicEffect
  runtime: BattleSupportRuntimeState
}): { state: BattleState; logs: BattleLogEntry[]; floats: BattleFlowFloat[]; runtime: BattleSupportRuntimeState } {
  const mainPlayerUid = args.state.playerSide[0]?.uid
  if (!mainPlayerUid) return { state: args.state, logs: [], floats: [], runtime: args.runtime }

  if (args.effect.kind === "heal") {
    const healed = healCombatant(args.state, mainPlayerUid, args.effect.potency)
    return {
      state: healed.state,
      logs: [{ text: args.effect.text.replace(`${args.effect.potency}`, `${healed.healed}`), type: "status" }],
      floats: healed.healed > 0 ? [{ uid: mainPlayerUid, text: `+${healed.healed}`, kind: "heal" }] : [],
      runtime: args.runtime,
    }
  }

  if (args.effect.kind === "restore-mp") {
    const restored = restoreMpCombatant(args.state, mainPlayerUid, args.effect.potency)
    return {
      state: restored.state,
      logs: [{ text: args.effect.text.replace(`${args.effect.potency}`, `${restored.restored}`), type: "status" }],
      floats: restored.restored > 0 ? [{ uid: mainPlayerUid, text: `气+${restored.restored}`, kind: "status" }] : [],
      runtime: args.runtime,
    }
  }

  const nextRuntime = rememberSupportStatusBaseline(args.runtime, args.state, args.effect.kind)
  const applied = applyStatusToCombatant(args.state, mainPlayerUid, {
    target: "self",
    kind: args.effect.kind,
    potency: args.effect.potency,
    duration: args.effect.duration ?? 1,
    applyChance: 1,
  })
  const floatText = args.effect.kind === "shield"
    ? `护盾+${args.effect.potency}`
    : args.effect.kind === "buff-def"
      ? `防↑${args.effect.potency}`
      : args.effect.kind === "buff-spd"
        ? `速↑${args.effect.potency}`
        : args.effect.kind === "buff-chase"
          ? "追击势"
          : `攻↑${args.effect.potency}`
  return {
    state: applied.state,
    logs: [{ text: args.effect.text, type: "status" }],
    floats: applied.applied ? [{ uid: mainPlayerUid, text: floatText, kind: "status" }] : [],
    runtime: nextRuntime,
  }
}

export function applyTriggeredSupport(args: {
  player: Player
  trigger: BattleSupportTrigger
  state: BattleState
  runtime: BattleSupportRuntimeState
}): BattleSupportApplicationResult {
  if (args.runtime.triggered[args.trigger]) {
    return {
      state: args.state,
      logs: [],
      floats: [],
      highlightNpcIds: [],
      highlightBondIds: [],
      runtime: args.runtime,
    }
  }

  const events = getBattleTriggeredSupportEvents(args.player, args.trigger)
  const effects = getBattleTriggeredSupportEffects(args.player, args.trigger)
  if (events.length === 0 && effects.length === 0) {
    return {
      state: args.state,
      logs: [],
      floats: [],
      highlightNpcIds: [],
      highlightBondIds: [],
      runtime: args.runtime,
    }
  }

  let nextState = args.state
  let nextRuntime: BattleSupportRuntimeState = {
    ...args.runtime,
    triggered: { ...args.runtime.triggered, [args.trigger]: true },
  }
  const logs: BattleLogEntry[] = events.map((event) => ({ text: event.text, type: "status" }))
  const floats: BattleFlowFloat[] = []

  for (const effect of effects) {
    const applied = applySupportMechanicEffect({ state: nextState, effect, runtime: nextRuntime })
    nextState = applied.state
    nextRuntime = applied.runtime
    logs.push(...applied.logs)
    floats.push(...applied.floats)
  }

  return {
    state: nextState,
    logs,
    floats,
    highlightNpcIds: Array.from(new Set([...events.flatMap((event) => event.npcIds), ...effects.flatMap((effect) => effect.npcIds)])),
    highlightBondIds: Array.from(new Set([...events.flatMap((event) => event.bondIds), ...effects.flatMap((effect) => effect.bondIds)])),
    runtime: nextRuntime,
  }
}

export function advanceBattleToNextActor(start: BattleState): BattleAdvanceResult {
  let state = start
  const logs: BattleLogEntry[] = []

  while (true) {
    state = advanceAtb(state)
    const ended = checkBattleEndBySide(state)
    if (ended !== "ongoing") return { state, logs, actor: null, actorMode: null, ended }

    const actor = nextActor(state)
    if (!actor) return { state, logs, actor: null, actorMode: null, ended: "ongoing" }

    const ticked = tickUnitStatuses(state, actor.uid)
    state = ticked.state
    logs.push(...ticked.logs)
    const currentActor = findCombatant(state, actor.uid)

    if (!currentActor || currentActor.hp <= 0) continue

    if (isStunned(currentActor)) {
      logs.push({ text: `${currentActor.name}被点穴封住经脉，动弹不得！`, type: "system" })
      state = applyAtbConsume(state, currentActor.uid)
      continue
    }

    return {
      state,
      logs,
      actor: currentActor,
      actorMode: currentActor.side === "enemy" ? "enemy" : currentActor.uid.startsWith("npc-") ? "teammate" : "player",
      ended: "ongoing",
    }
  }
}

export function finalizeBattleResult(args: {
  result: "won" | "lost" | "fled"
  finalState: BattleState
  player: Player
  combatPlayer: Player
  enemies: Enemy[]
  inventoryPatch: Record<string, number>
  runtime: BattleSupportRuntimeState
}): FinalizeBattleResult {
  const syncedCombatPlayer = syncPlayersFromState([args.combatPlayer], cleanupSupportStatuses(args.finalState, args.runtime))[0]
  const syncedPlayer: Player = {
    ...args.player,
    hp: syncedCombatPlayer.hp,
    mp: syncedCombatPlayer.mp,
    statuses: syncedCombatPlayer.statuses,
  }
  const withItems: Player = { ...syncedPlayer, inventory: { ...syncedPlayer.inventory, ...args.inventoryPatch } }

  if (args.result === "won") {
    const totalExp = args.enemies.reduce((sum, enemy) => sum + enemy.expReward, 0)
    const totalGold = args.enemies.reduce((sum, enemy) => sum + enemy.goldReward, 0)
    const { player, rewards } = applyVictoryGrowth(withItems, totalExp, totalGold)
    return {
      player: { ...player, hp: player.hp, mp: player.mp },
      rewards,
      logs: [
        { text: "得胜！", type: "system" },
        { text: `获得经验 ${rewards.exp} 点，银两 ${rewards.gold} 两`, type: "system" },
        ...(rewards.leveledUp ? [{ text: `境界突破！升到 ${player.level} 级！`, type: "crit" as const }] : []),
      ],
    }
  }

  if (args.result === "fled") {
    return { player: withItems, logs: [] }
  }

  return {
    player: { ...withItems, hp: Math.max(1, Math.round(withItems.hpMax * 0.3)) },
    logs: [{ text: "你被击败了……", type: "system" }],
  }
}
