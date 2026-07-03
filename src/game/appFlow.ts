import type { Player, Enemy } from "../types"
import type { Transition, StoryEvent } from "../data/events"
import type { Consequence } from "../data/story/schema"
import type { Npc } from "../data/npcs"
import { getLocationById } from "../data/map"
import { applyConsequences } from "./story/consequences"
import { getActivePartyNpcs, normalizePlayerParty } from "./party"
import { resolveBranch, pickRandom, resolveBattleOutcome } from "./story/engine"
import { pollWorldEvent } from "./story/worldScheduler"
import { getAdventureEnemy, getStoryEventById } from "./story/query"

type BattleTransition = Extract<Transition, { type: "battle" }>

export type StoryFlowCommand =
  | { type: "return-main" }
  | { type: "goto-node"; nodeId: string }
  | { type: "start-battle"; enemies: Enemy[]; transition: BattleTransition }
  | { type: "goto-event"; event: StoryEvent }

export type BattleFlowCommand =
  | { type: "return-main" }
  | { type: "show-event-result"; text: string; transition: Transition }

export function getPendingWorldEventIds(player: Player): string[] {
  return player.world.pendingWorldEvents ?? []
}

export function enqueuePendingWorldEvent(player: Player, eventId: string): Player {
  const queue = getPendingWorldEventIds(player)
  if (queue.includes(eventId)) return player
  return { ...player, world: { ...player.world, pendingWorldEvents: [...queue, eventId] } }
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

export function normalizeMainPlayer(player: Player): Player {
  let finalPlayer = normalizePlayerParty(player)
  const validQueue = getPendingWorldEventIds(finalPlayer).filter((eventId) => !!getStoryEventById(eventId))
  if (validQueue.length !== getPendingWorldEventIds(finalPlayer).length) {
    finalPlayer = { ...finalPlayer, world: { ...finalPlayer.world, pendingWorldEvents: validQueue } }
  }

  const polled = pollWorldEvent(finalPlayer, finalPlayer.world)
  finalPlayer = polled.player
  if (polled.event) finalPlayer = enqueuePendingWorldEvent(finalPlayer, polled.event.id)
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
      return { player, command: { type: "return-main" } }
    case "goto":
      return { player, command: { type: "goto-node", nodeId: transition.nodeId } }
    case "battle": {
      const location = args.locationId ? getLocationById(args.locationId) : undefined
      return {
        player,
        command: {
          type: "start-battle",
          enemies: [getAdventureEnemy(player, transition.enemyId, transition.useLocationPool ? location?.enemyPool : undefined)],
          transition,
        },
      }
    }
    case "gotoEvent": {
      const event = getStoryEventById(transition.eventId)
      return event
        ? { player, command: { type: "goto-event", event } }
        : { player, command: { type: "return-main" } }
    }
    case "gameOver":
      return { player, command: { type: "return-main" } }
    default:
      return { player, command: { type: "return-main" } }
  }
}

export function resolveBattleFlow(args: {
  player: Player
  outcome: "won" | "lost" | "fled"
  pendingBattleTransition: Transition | null
  challengeNpcId?: string | null
}): { player: Player; command: BattleFlowCommand } {
  if (!args.pendingBattleTransition) {
    let finalPlayer = args.outcome === "won" ? { ...args.player, day: args.player.day + 1 } : args.player
    if (args.challengeNpcId) {
      const delta = args.outcome === "won" ? 5 : args.outcome === "lost" ? -3 : 0
      if (delta !== 0) {
        const consequences: Consequence[] = [
          { kind: "relation", npcId: args.challengeNpcId, delta },
          ...(args.outcome === "won" ? [{ kind: "reputation" as const, delta: 2 }] : []),
        ]
        finalPlayer = applyConsequences(finalPlayer, finalPlayer.world, consequences).player
      }
    }
    return { player: finalPlayer, command: { type: "return-main" } }
  }

  if (args.outcome === "lost" && args.pendingBattleTransition.type === "battle" && args.pendingBattleTransition.lethal) {
    return {
      player: args.player,
      command: {
        type: "show-event-result",
        text: "你力战不敌，命丧于此……这一遭，江湖路竟走到了尽头。",
        transition: { type: "gameOver" },
      },
    }
  }

  const outcomeResult = resolveBattleOutcome(args.player, args.player.world, args.pendingBattleTransition, args.outcome)
  if (!outcomeResult) return { player: args.player, command: { type: "return-main" } }

  return {
    player: outcomeResult.player,
    command: {
      type: "show-event-result",
      text: outcomeResult.text,
      transition: outcomeResult.then,
    },
  }
}
