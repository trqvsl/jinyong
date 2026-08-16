import type { Player, Enemy } from "../types"
import type { Transition, StoryEvent } from "../data/events"
import type { Consequence, StoryCheckpoint, StoryCheckpointPhase } from "../data/story/schema"
import type { Npc } from "../data/npcs"
import type { BattleObjectiveConfig, BattleOutcome } from "./battle"
import { getLocationById } from "../data/map"
import { getEnemyById } from "../data/enemies"
import { getNpcById } from "../data/npcs"
import { applyConsequences } from "./story/consequences"
import { getActivePartyNpcs, normalizePlayerParty } from "./party"
import { resolveBranch, pickRandom, resolveBattleOutcome } from "./story/engine"
import { pollWorldEvent } from "./story/worldScheduler"
import { getAdventureEnemy, getStoryEventById, getStoryEventByLocation } from "./story/query"

export type AppViewCommand =
  | { type: "show-main" }
  | {
      type: "show-event-entry"
      event: StoryEvent
      nodeId: string
      locationId: string | null
      pageIndex: number
      initialResult?: { text: string; transition: Transition; title?: string; consumedDay: boolean }
    }
  | { type: "show-event-result"; text: string; transition: Transition }
  | {
      type: "show-battle"
      enemies: Enemy[]
      pendingBattleTransition: Transition | null
      challengeNpcId: string | null
      allyIds: string[]
      battleObjective?: BattleObjectiveConfig
      storyContext?: { event: StoryEvent; nodeId: string; locationId: string | null }
    }

export type StoryFlowCommand =
  | { type: "goto-node"; nodeId: string }
  | AppViewCommand

export type BattleFlowCommand = Extract<AppViewCommand, { type: "show-main" | "show-event-result" }>

export function getPendingWorldEventIds(player: Player): string[] {
  return player.world.pendingWorldEvents ?? []
}

export function enqueuePendingWorldEvent(
  player: Player,
  eventId: string,
  placement: "front" | "back" = "back",
): Player {
  const queue = getPendingWorldEventIds(player)
  if (queue.includes(eventId)) return player
  const pendingWorldEvents = placement === "front"
    ? [eventId, ...queue]
    : [...queue, eventId]
  return { ...player, world: { ...player.world, pendingWorldEvents } }
}

export function dequeuePendingWorldEvent(player: Player, eventId: string): Player {
  return {
    ...player,
    world: { ...player.world, pendingWorldEvents: getPendingWorldEventIds(player).filter((id) => id !== eventId) },
  }
}

export function getPendingWorldEvents(player: Player): StoryEvent[] {
  return getPendingWorldEventIds(player)
    .map((eventId) => getStoryEventById(eventId))
    .filter((event): event is StoryEvent => !!event)
}

export function getRecruitedTeammates(player: Player): Npc[] {
  return getActivePartyNpcs(player)
}

export function getBattleTeammates(player: Player, allyIds: string[] = []): Npc[] {
  const teammates = [
    ...getActivePartyNpcs(player),
    ...allyIds.map((npcId) => getNpcById(npcId)).filter((npc): npc is Npc => !!npc),
  ]
  return Array.from(new Map(teammates.map((npc) => [npc.id, npc])).values())
}

function toBattleObjectiveConfig(transition: Transition | null | undefined): BattleObjectiveConfig | undefined {
  if (transition?.type !== "battle" || !transition.objective) return undefined
  const protectAllyIds = Array.from(new Set([
    ...(transition.objective.protectAllyIds ?? []),
    ...(transition.objective.protectAllyId ? [transition.objective.protectAllyId] : []),
  ]))
  const protectUid = transition.objective.protectAllyId
    ? `npc-${transition.objective.protectAllyId}`
    : undefined
  const protectUids = protectAllyIds.map((allyId) => `npc-${allyId}`)
  const protection = {
    protectUid,
    protectUids,
    minProtectedSurvivors: transition.objective.minProtectedSurvivors,
  }
  return transition.objective.kind === "surviveRounds"
    ? {
        kind: "surviveRounds",
        rounds: transition.objective.rounds,
        ...protection,
        title: transition.objective.title,
      }
    : {
        kind: "defeatAll",
        ...protection,
        title: transition.objective.title,
      }
}

function getStoryBattleEnemies(
  player: Player,
  transition: Extract<Transition, { type: "battle" }>,
  locationEnemyPool?: string[],
): Enemy[] {
  if (transition.enemyIds && transition.enemyIds.length > 0) {
    return transition.enemyIds.map((enemyId) => getEnemyById(enemyId))
  }
  return [getAdventureEnemy(
    player,
    transition.enemyId,
    transition.useLocationPool ? locationEnemyPool : undefined,
  )]
}

export function createMainViewCommand(): Extract<AppViewCommand, { type: "show-main" }> {
  return { type: "show-main" }
}

function getNodePhase(event: StoryEvent, nodeId: string): StoryCheckpointPhase {
  const node = event.nodes[nodeId]
  return node && !node.choices && node.autoNext ? "autoNext" : "choosing"
}

export function setStoryCheckpoint(player: Player, checkpoint: StoryCheckpoint | null): Player {
  return {
    ...player,
    world: {
      ...player.world,
      currentStory: checkpoint,
    },
  }
}

function createNodeCheckpoint(args: {
  event: StoryEvent
  nodeId: string
  locationId?: string | null
  pageIndex?: number
}): StoryCheckpoint {
  return {
    eventId: args.event.id,
    nodeId: args.nodeId,
    phase: getNodePhase(args.event, args.nodeId),
    pageIndex: args.pageIndex ?? 0,
    locationId: args.locationId ?? null,
  }
}

export function createStoryEntryCommand(args: {
  event: StoryEvent
  locationId?: string | null
  nodeId?: string
  pageIndex?: number
  initialResult?: { text: string; transition: Transition; title?: string; consumedDay: boolean }
}): Extract<AppViewCommand, { type: "show-event-entry" }> {
  return {
    type: "show-event-entry",
    event: args.event,
    nodeId: args.nodeId ?? args.event.entryNode,
    locationId: args.locationId ?? null,
    pageIndex: args.pageIndex ?? 0,
    initialResult: args.initialResult,
  }
}

function beginStoryEvent(args: {
  player: Player
  event: StoryEvent
  locationId?: string | null
}): { player: Player; command: Extract<AppViewCommand, { type: "show-event-entry" }> } {
  const checkpoint = createNodeCheckpoint({
    event: args.event,
    nodeId: args.event.entryNode,
    locationId: args.locationId,
  })
  return {
    player: setStoryCheckpoint(args.player, checkpoint),
    command: createStoryEntryCommand({
      event: args.event,
      locationId: args.locationId,
    }),
  }
}

export function openPendingWorldEvent(args: {
  player: Player
  eventId: string
}): { player: Player; command: AppViewCommand } {
  const event = getStoryEventById(args.eventId)
  const player = dequeuePendingWorldEvent(args.player, args.eventId)
  return event
    ? beginStoryEvent({ player, event })
    : { player: setStoryCheckpoint(player, null), command: createMainViewCommand() }
}

export function openLocationStory(args: {
  player: Player
  locationId: string
}): { player: Player; command: AppViewCommand } | null {
  const location = getLocationById(args.locationId)
  if (!location) return null
  return beginStoryEvent({
    player: args.player,
    event: getStoryEventByLocation(args.player, location.events),
    locationId: args.locationId,
  })
}

export function restoreStoryCheckpoint(player: Player): { player: Player; command: AppViewCommand | null } {
  const checkpoint = player.world.currentStory
  if (!checkpoint) return { player, command: null }

  const event = getStoryEventById(checkpoint.eventId)
  if (!event || !event.nodes[checkpoint.nodeId]) {
    return { player: setStoryCheckpoint(player, null), command: null }
  }

  if (checkpoint.phase === "battle") {
    if (checkpoint.transition?.type !== "battle") {
      return { player: setStoryCheckpoint(player, null), command: null }
    }
    const enemies = (checkpoint.battleEnemyIds ?? [])
      .map((enemyId) => getEnemyById(enemyId))
    if (enemies.length === 0) {
      const location = checkpoint.locationId ? getLocationById(checkpoint.locationId) : undefined
      enemies.push(...getStoryBattleEnemies(
        player,
        checkpoint.transition,
        location?.enemyPool,
      ))
    }
    return {
      player,
      command: createBattleEntryCommand({
        enemies,
        pendingBattleTransition: checkpoint.transition,
        storyContext: {
          event,
          nodeId: checkpoint.nodeId,
          locationId: checkpoint.locationId,
        },
      }),
    }
  }

  const initialResult = checkpoint.phase === "result" && checkpoint.transition
    ? {
        text: checkpoint.resultText ?? "",
        transition: checkpoint.transition,
        title: checkpoint.resultTitle ?? event.nodes[checkpoint.nodeId]?.title,
        consumedDay: checkpoint.consumedDay ?? false,
      }
    : undefined

  return {
    player,
    command: createStoryEntryCommand({
      event,
      nodeId: checkpoint.nodeId,
      locationId: checkpoint.locationId,
      pageIndex: checkpoint.pageIndex,
      initialResult,
    }),
  }
}

export function createBattleEntryCommand(args: {
  enemies: Enemy[]
  pendingBattleTransition?: Transition | null
  challengeNpcId?: string | null
  allyIds?: string[]
  battleObjective?: BattleObjectiveConfig
  storyContext?: { event: StoryEvent; nodeId: string; locationId: string | null }
}): Extract<AppViewCommand, { type: "show-battle" }> {
  const pendingBattleTransition = args.pendingBattleTransition ?? null
  return {
    type: "show-battle",
    enemies: args.enemies,
    pendingBattleTransition,
    challengeNpcId: args.challengeNpcId ?? null,
    allyIds: args.allyIds
      ?? (pendingBattleTransition?.type === "battle" ? pendingBattleTransition.allyIds ?? [] : []),
    battleObjective: args.battleObjective ?? toBattleObjectiveConfig(pendingBattleTransition),
    storyContext: args.storyContext,
  }
}

export function normalizeMainPlayer(player: Player): Player {
  let finalPlayer = normalizePlayerParty(player)
  const validQueue = getPendingWorldEventIds(finalPlayer).filter((eventId) => !!getStoryEventById(eventId))
  if (validQueue.length !== getPendingWorldEventIds(finalPlayer).length) {
    finalPlayer = { ...finalPlayer, world: { ...finalPlayer.world, pendingWorldEvents: validQueue } }
  }

  const currentStory = finalPlayer.world.currentStory
  if (currentStory && !getStoryEventById(currentStory.eventId)) {
    finalPlayer = setStoryCheckpoint(finalPlayer, null)
  }

  const polled = pollWorldEvent(finalPlayer, finalPlayer.world)
  finalPlayer = polled.player
  if (polled.event) {
    finalPlayer = enqueuePendingWorldEvent(
      finalPlayer,
      polled.event.id,
      polled.priority === "urgent" ? "front" : "back",
    )
  }
  return finalPlayer
}

export function resolveStoryFlow(args: {
  player: Player
  transition: Transition
  consumedDay: boolean
  currentStoryEvent?: StoryEvent | null
  locationId?: string | null
}): { player: Player; command: StoryFlowCommand } {
  let player = args.player
  if (args.consumedDay) player = { ...player, day: player.day + 1 }

  let transition = resolveBranch(player, player.world, args.transition)
  while (transition.type === "random") transition = resolveBranch(player, player.world, pickRandom(transition.cases))

  if (transition.type === "end" && args.currentStoryEvent?.once && !player.world.completedEvents.includes(args.currentStoryEvent.id)) {
    player = { ...player, world: { ...player.world, completedEvents: [...player.world.completedEvents, args.currentStoryEvent.id] } }
  }

  switch (transition.type) {
    case "end":
      return { player: setStoryCheckpoint(player, null), command: createMainViewCommand() }
    case "goto": {
      if (!args.currentStoryEvent) {
        return { player: setStoryCheckpoint(player, null), command: createMainViewCommand() }
      }
      const checkpoint = createNodeCheckpoint({
        event: args.currentStoryEvent,
        nodeId: transition.nodeId,
        locationId: args.locationId,
      })
      return {
        player: setStoryCheckpoint(player, checkpoint),
        command: { type: "goto-node", nodeId: transition.nodeId },
      }
    }
    case "battle": {
      const location = args.locationId ? getLocationById(args.locationId) : undefined
      const enemies = getStoryBattleEnemies(player, transition, location?.enemyPool)
      const currentCheckpoint = player.world.currentStory
      if (args.currentStoryEvent && currentCheckpoint) {
        player = setStoryCheckpoint(player, {
          ...currentCheckpoint,
          phase: "battle",
          pageIndex: 0,
          transition,
          consumedDay: false,
          resultText: undefined,
          resultTitle: undefined,
          battleEnemyIds: enemies.map((enemy) => enemy.id),
        })
      }
      return {
        player,
        command: createBattleEntryCommand({
          enemies,
          pendingBattleTransition: transition,
          storyContext: args.currentStoryEvent
            ? {
                event: args.currentStoryEvent,
                nodeId: currentCheckpoint?.nodeId ?? args.currentStoryEvent.entryNode,
                locationId: args.locationId ?? null,
              }
            : undefined,
        }),
      }
    }
    case "gotoEvent": {
      const event = getStoryEventById(transition.eventId)
      return event
        ? beginStoryEvent({ player, event })
        : { player: setStoryCheckpoint(player, null), command: createMainViewCommand() }
    }
    case "gameOver":
      return { player: setStoryCheckpoint(player, null), command: createMainViewCommand() }
    default:
      return { player: setStoryCheckpoint(player, null), command: createMainViewCommand() }
  }
}

export function resolveBattleFlow(args: {
  player: Player
  outcome: BattleOutcome
  pendingBattleTransition: Transition | null
  challengeNpcId?: string | null
}): { player: Player; command: BattleFlowCommand } {
  if (!args.pendingBattleTransition) {
    const objectiveMet = args.outcome === "won" || args.outcome === "partial"
    let finalPlayer = objectiveMet ? { ...args.player, day: args.player.day + 1 } : args.player
    if (args.challengeNpcId) {
      const delta = objectiveMet ? 5 : args.outcome === "lost" ? -3 : 0
      if (delta !== 0) {
        const consequences: Consequence[] = [
          { kind: "relation", npcId: args.challengeNpcId, delta },
          ...(objectiveMet ? [{ kind: "reputation" as const, delta: 2 }] : []),
        ]
        finalPlayer = applyConsequences(finalPlayer, finalPlayer.world, consequences).player
      }
    }
    return { player: finalPlayer, command: createMainViewCommand() }
  }

  if (args.outcome === "lost" && args.pendingBattleTransition.type === "battle" && args.pendingBattleTransition.lethal) {
    const text = "你力战不敌，命丧于此……这一遭，江湖路竟走到了尽头。"
    const transition: Transition = { type: "gameOver" }
    const checkpoint = args.player.world.currentStory
    const player = checkpoint
      ? setStoryCheckpoint(args.player, {
          ...checkpoint,
          phase: "result",
          pageIndex: 0,
          resultText: text,
          transition,
          battleEnemyIds: undefined,
        })
      : args.player
    return {
      player,
      command: {
        type: "show-event-result",
        text,
        transition,
      },
    }
  }

  const outcomeResult = resolveBattleOutcome(args.player, args.player.world, args.pendingBattleTransition, args.outcome)
  if (!outcomeResult) return { player: setStoryCheckpoint(args.player, null), command: createMainViewCommand() }

  const currentCheckpoint = outcomeResult.player.world.currentStory
  const player = currentCheckpoint
    ? setStoryCheckpoint(outcomeResult.player, {
        ...currentCheckpoint,
        phase: "result",
        pageIndex: 0,
        resultText: outcomeResult.text,
        transition: outcomeResult.then,
        consumedDay: false,
        battleEnemyIds: undefined,
      })
    : outcomeResult.player

  return {
    player,
    command: {
      type: "show-event-result",
      text: outcomeResult.text,
      transition: outcomeResult.then,
    },
  }
}
