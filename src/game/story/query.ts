import type { Player } from "../../types"
import type { StoryEvent } from "../../data/story/schema"
import { STORY_EVENTS } from "../../data/events"
import { STORY_VOLUMES } from "../../data/story"
import { WORLD_EVENTS } from "../../data/story/worldEvents"
import { getEnemyById, getRandomEnemy, getRandomEnemyFromPool } from "../../data/enemies"
import { checkCondition } from "./conditions"

function notCompleted(player: Player, event: StoryEvent): boolean {
  return !(player.world.completedEvents ?? []).includes(event.id)
}

function pickWeightedEvent(events: StoryEvent[]): StoryEvent {
  const weighted = events.flatMap((event) => Array(event.weight ?? 1).fill(event))
  return weighted[Math.floor(Math.random() * weighted.length)]
}

export function getRandomStoryEvent(player: Player): StoryEvent {
  const allEvents = [...STORY_EVENTS, ...STORY_VOLUMES].filter((event) => notCompleted(player, event))
  const available = allEvents.filter((event) => checkCondition(player, player.world, event.condition))
  const pool = available.length > 0 ? available : allEvents
  return pickWeightedEvent(pool)
}

export function getRandomGenericStoryEvent(player: Player): StoryEvent {
  const allEvents = STORY_EVENTS.filter((event) => notCompleted(player, event))
  const available = allEvents.filter((event) => checkCondition(player, player.world, event.condition))
  const pool = available.length > 0 ? available : allEvents
  return pickWeightedEvent(pool)
}

export function getStoryEventById(id: string): StoryEvent | undefined {
  return [...STORY_EVENTS, ...STORY_VOLUMES, ...WORLD_EVENTS.map((worldEvent) => worldEvent.event)].find((event) => event.id === id)
}

export function getStoryEventByLocation(player: Player, locationEvents: string[]): StoryEvent {
  for (const id of locationEvents) {
    const event = getStoryEventById(id)
    if (event && notCompleted(player, event) && checkCondition(player, player.world, event.condition)) return event
  }
  return getRandomGenericStoryEvent(player)
}

export function getAdventureEnemy(player: Player, enemyId?: string, locationPool?: string[]) {
  if (enemyId) return getEnemyById(enemyId)
  if (locationPool && locationPool.length > 0) return getRandomEnemyFromPool(player, locationPool)
  return getRandomEnemy(player)
}
