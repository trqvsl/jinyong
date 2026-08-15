import { describe, expect, it } from "vitest"
import type { Player } from "../src/types"
import {
  STORY_DEBUG_ACT_PRESETS,
  STORY_DEBUG_EVIDENCE_IDS,
  STORY_DEBUG_ROUTE_PRESETS,
} from "../src/data/story/debugPresets"
import { getLocationById } from "../src/data/map"
import { applyStoryDebugPreset, setStoryDebugVariant } from "../src/game/debug"
import { getStoryEventByLocation, getStoryProgress } from "../src/game/story/query"
import { createWorld } from "../src/game/story/state"

function makePlayer(): Player {
  return {
    name: "调试夹具",
    level: 20,
    exp: 0,
    expMax: 100,
    hp: 300,
    hpMax: 300,
    mp: 180,
    mpMax: 180,
    attack: 40,
    defense: 30,
    speed: 25,
    roots: {
      strength: 20,
      external: 20,
      internal: 20,
      comprehension: 50,
      constitution: 20,
      breath: 20,
      agility: 20,
      luck: 30,
    },
    attributePoints: 0,
    mastery: {},
    relations: { yangkang: 99 },
    gold: 1000,
    aptitude: 50,
    alignment: "邪",
    karma: -80,
    reputation: 20,
    day: 30,
    skills: [],
    inventory: {
      "small-hp-pill": 4,
      ...Object.fromEntries(STORY_DEBUG_EVIDENCE_IDS.map((id) => [id, 9])),
    },
    world: createWorld(),
    statuses: [],
  }
}

describe("story debug act presets", () => {
  it.each(STORY_DEBUG_ACT_PRESETS)(
    "loads $title at its intended act, location and primary event",
    (preset) => {
      const next = applyStoryDebugPreset(makePlayer(), preset)
      const progress = getStoryProgress(next)
      const location = getLocationById(preset.targetLocationId)

      expect(progress.act.id).toBe(preset.expectedActId)
      expect(progress.recommendedLocationId).toBe(preset.targetLocationId)
      expect(location).toBeDefined()
      expect(getStoryEventByLocation(next, location!.events).id).toBe(preset.targetEventId)
      expect(next.world.currentStory).toBeNull()
      expect(next.world.pendingWorldEvents).toEqual([])
      expect(next.world.triggeredEvents).toEqual([])
      expect(next.world.seenNodes).toEqual([])
      expect(next.relations).toEqual(preset.relations ?? {})
      expect(next.karma).toBe(preset.karma ?? 0)
      expect(next.inventory["small-hp-pill"]).toBe(4)
    },
  )
})

describe("story debug route presets", () => {
  it.each(STORY_DEBUG_ROUTE_PRESETS)(
    "loads $title directly before the Iron Spear Temple event",
    (preset) => {
      const next = applyStoryDebugPreset(makePlayer(), preset)
      const progress = getStoryProgress(next)
      const location = getLocationById(preset.targetLocationId)!

      expect(progress.act.id).toBe("act6-truth")
      expect(progress.recommendedLocationId).toBe("tieqiangmiao")
      expect(progress.guidanceSource).toMatchObject({
        kind: "override",
        after: "variant:act6.yanyu=cleared",
        before: "beat:act6-truth",
      })
      expect(getStoryEventByLocation(next, location.events).id).toBe(
        "shendiao-tieqiangmiao-act6",
      )
      expect(next.world.arcs.shendiao.variants["act6.yanyu"]).toBe("cleared")
      expect(next.world.completedEvents).toContain("shendiao-yanyulou-act6")
    },
  )

  it("keeps the complete-evidence and player-cover fixtures mutually distinct", () => {
    const complete = applyStoryDebugPreset(
      makePlayer(),
      STORY_DEBUG_ROUTE_PRESETS.find((preset) => preset.id === "temple-complete-evidence")!,
    )
    const covered = applyStoryDebugPreset(
      makePlayer(),
      STORY_DEBUG_ROUTE_PRESETS.find((preset) => preset.id === "temple-player-cover")!,
    )

    expect(complete.world.arcs.shendiao.variants["act6.yanyu-outcome"]).toBe("exits-sealed")
    expect(complete.relations.yangkang ?? 0).toBe(0)
    expect(complete.karma).toBe(0)
    expect(complete.inventory["ouyangke-jade-shard"]).toBe(1)

    expect(covered.world.arcs.shendiao.variants["act6.yanyu-outcome"]).toBe("yangkang-covered")
    expect(covered.world.arcs.shendiao.variants["act5.ouyangke"]).toBe("killed-concealed")
    expect(covered.relations.yangkang).toBeGreaterThanOrEqual(20)
    expect(covered.karma).toBeLessThanOrEqual(-20)
    expect(covered.inventory["ouyangke-jade-shard"] ?? 0).toBe(0)
  })
})

describe("story debug variant editor", () => {
  it("updates or clears one variant without desynchronizing player.world", () => {
    const preset = STORY_DEBUG_ROUTE_PRESETS[0]
    const loaded = applyStoryDebugPreset(makePlayer(), preset)
    loaded.world.currentStory = {
      eventId: "probe",
      nodeId: "main",
      phase: "choosing",
      pageIndex: 0,
      locationId: "tieqiangmiao",
    }

    const updated = setStoryDebugVariant(
      loaded,
      "shendiao",
      "act6.truth-entry",
      "proven",
    )
    expect(updated.world.arcs.shendiao.variants["act6.truth-entry"]).toBe("proven")
    expect(updated.world.currentStory).toBeNull()

    const cleared = setStoryDebugVariant(
      updated,
      "shendiao",
      "act6.truth-entry",
      "",
    )
    expect(cleared.world.arcs.shendiao.variants["act6.truth-entry"]).toBeUndefined()
    expect(cleared.world.arcs.shendiao.beats).toEqual(loaded.world.arcs.shendiao.beats)
    expect(cleared.world).not.toBe(updated.world)
    expect(updated.world.arcs.shendiao.variants["act6.truth-entry"]).toBe("proven")
  })
})
