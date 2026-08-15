import type { Player } from "../types"
import type { StoryDebugPreset } from "../data/story/debugPresets"
import type { WorldNpcState } from "../data/story/schema"
import { createWorld, deriveAlignment } from "./story/state"

const DEFAULT_NPC_STATE: WorldNpcState = {
  alive: true,
  recruited: false,
  faction: "",
  fateTags: [],
}

export function applyStoryDebugPreset(
  player: Player,
  preset: StoryDebugPreset,
): Player {
  const world = createWorld()
  world.arcs[preset.arcId] = {
    beats: { ...preset.beats },
    variants: { ...(preset.variants ?? {}) },
  }
  world.flags = { ...(preset.flags ?? {}) }
  world.factions = Object.fromEntries(
    Object.entries(preset.factions ?? {}).map(([id, state]) => [id, { ...state }]),
  )
  world.npcs = Object.fromEntries(
    Object.entries(preset.npcs ?? {}).map(([id, patch]) => [
      id,
      {
        ...DEFAULT_NPC_STATE,
        ...patch,
        fateTags: [...(patch.fateTags ?? [])],
      },
    ]),
  )
  world.completedEvents = [...(preset.completedEvents ?? [])]

  const inventory = { ...player.inventory }
  for (const itemId of preset.resetItemIds ?? []) delete inventory[itemId]
  for (const [itemId, count] of Object.entries(preset.items ?? {})) {
    if (count > 0) inventory[itemId] = count
  }

  const karma = preset.karma ?? 0
  return {
    ...player,
    karma,
    alignment: deriveAlignment(karma),
    relations: { ...(preset.relations ?? {}) },
    inventory,
    world,
  }
}

export function setStoryDebugVariant(
  player: Player,
  arcId: string,
  key: string,
  value: string,
): Player {
  const currentArc = player.world.arcs[arcId] ?? { beats: {}, variants: {} }
  const variants = { ...currentArc.variants }
  if (value) variants[key] = value
  else delete variants[key]

  const world = {
    ...player.world,
    arcs: {
      ...player.world.arcs,
      [arcId]: {
        ...currentArc,
        beats: { ...currentArc.beats },
        variants,
      },
    },
    currentStory: null,
  }

  return { ...player, world }
}
