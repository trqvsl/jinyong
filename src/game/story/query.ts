import type { Player } from "../../types"
import type { BeatResult, StoryEvent } from "../../data/story/schema"
import { STORY_EVENTS } from "../../data/events"
import {
  STORY_PROGRESS_DEFINITIONS,
  STORY_VOLUMES,
  type StoryActDefinition,
  type StoryProgressDefinition,
  type StorySystemPriorities,
} from "../../data/story"
import { WORLD_EVENTS } from "../../data/story/worldEvents"
import { getEnemyById, getRandomEnemy, getRandomEnemyFromPool } from "../../data/enemies"
import { checkCondition } from "./conditions"

export interface StoryProgressView {
  volumeId: string
  volumeName: string
  act: StoryActDefinition
  completed: number
  total: number
  isComplete: boolean
  primaryAction: string
  guidance: string
  next: string
  hubName: string
  hubMood: string
  recommendedLocationId: string
  relatedNpcIds: string[]
  priorities: StorySystemPriorities
}

function notCompleted(player: Player, event: StoryEvent): boolean {
  return !(player.world.completedEvents ?? []).includes(event.id)
}

function pickWeightedEvent(events: StoryEvent[]): StoryEvent {
  const weighted = events.flatMap((event) => Array(event.weight ?? 1).fill(event))
  return weighted[Math.floor(Math.random() * weighted.length)]
}

function getProgressDefinition(volumeId: string): StoryProgressDefinition {
  const definition = STORY_PROGRESS_DEFINITIONS.find((item) => item.id === volumeId)
  if (!definition) throw new Error(`Unknown story progress definition: ${volumeId}`)
  return definition
}

function getRawBeatResult(player: Player, definition: StoryProgressDefinition, beat: string): BeatResult | undefined {
  return player.world.arcs[definition.arcId]?.beats[beat]
}

function getRawVariant(player: Player, definition: StoryProgressDefinition, key: string): string | undefined {
  return player.world.arcs[definition.arcId]?.variants?.[key]
}

function getActResult(
  player: Player,
  definition: StoryProgressDefinition,
  act: StoryActDefinition,
): BeatResult | undefined {
  const direct = getRawBeatResult(player, definition, act.beat)
  if (direct) return direct

  const hasExplicitActProgress = definition.acts.some((candidate) =>
    getRawBeatResult(player, definition, candidate.beat) !== undefined
  )
  if (hasExplicitActProgress) return undefined

  for (const migration of definition.legacyBeatMigrations) {
    if (!getRawBeatResult(player, definition, migration.legacyBeat)) continue
    const target = migration.targets.find((item) => item.beat === act.beat)
    if (target) return target.result
  }
  return undefined
}

export function getStoryProgress(player: Player, volumeId = "shendiao"): StoryProgressView {
  const definition = getProgressDefinition(volumeId)
  const acts = [...definition.acts].sort((a, b) => a.order - b.order)
  const results = acts.map((act) => getActResult(player, definition, act))
  const completed = results.filter(Boolean).length
  const firstIncompleteIndex = results.findIndex((result) => !result)
  const isComplete = firstIncompleteIndex === -1
  const act = acts[isComplete ? acts.length - 1 : firstIncompleteIndex]

  let primaryAction = act.primaryAction
  let guidance = act.guidance
  let next = act.next
  let hubName = act.hubName
  let hubMood = act.hubMood
  let recommendedLocationId = act.recommendedLocationId
  let relatedNpcIds = act.relatedNpcIds

  for (const override of definition.legacyGuidance) {
    const afterReached = override.afterBeat
      ? !!getRawBeatResult(player, definition, override.afterBeat)
      : override.afterVariant
        ? getRawVariant(player, definition, override.afterVariant.key) === override.afterVariant.value
        : true
    const beforeReached = override.beforeBeat
      ? !!getRawBeatResult(player, definition, override.beforeBeat)
      : override.beforeVariant
        ? getRawVariant(player, definition, override.beforeVariant.key) === override.beforeVariant.value
        : false
    if (!afterReached || beforeReached) continue
    recommendedLocationId = override.recommendedLocationId ?? recommendedLocationId
    primaryAction = override.primaryAction ?? primaryAction
    guidance = override.guidance ?? guidance
    next = override.next ?? next
    hubName = override.hubName ?? hubName
    hubMood = override.hubMood ?? hubMood
    relatedNpcIds = override.relatedNpcIds ?? relatedNpcIds
  }

  if (isComplete) {
    primaryAction = definition.complete.primaryAction
    guidance = definition.complete.guidance
    next = definition.complete.next
    hubName = definition.complete.hubName
    hubMood = definition.complete.hubMood
    relatedNpcIds = definition.complete.relatedNpcIds
  }

  return {
    volumeId: definition.id,
    volumeName: definition.name,
    act,
    completed,
    total: acts.length,
    isComplete,
    primaryAction,
    guidance,
    next,
    hubName,
    hubMood,
    recommendedLocationId,
    relatedNpcIds,
    priorities: act.priorities,
  }
}

export function isNpcRelevantToCurrentStory(player: Player, npcId: string, volumeId = "shendiao"): boolean {
  return getStoryProgress(player, volumeId).relatedNpcIds.includes(npcId)
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
