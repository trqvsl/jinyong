import { describe, expect, it } from "vitest"
import type { Player } from "../src/types"
import {
  STORY_DEBUG_ACT_PRESETS,
  STORY_DEBUG_EVIDENCE_IDS,
  STORY_DEBUG_ROUTE_GROUPS,
  STORY_DEBUG_ROUTE_PRESETS,
  STORY_DEBUG_VARIANT_FIELDS,
  STORY_DEBUG_VARIANT_GROUPS,
} from "../src/data/story/debugPresets"
import { STORY_VOLUMES } from "../src/data/story"
import { getLocationById } from "../src/data/map"
import { applyStoryDebugPreset, setStoryDebugVariant } from "../src/game/debug"
import { checkCondition } from "../src/game/story/conditions"
import { getStoryEventByLocation, getStoryProgress } from "../src/game/story/query"
import { createWorld } from "../src/game/story/state"
import {
  enterNode,
  resolveBranch,
  visibleChoices,
} from "../src/game/story/engine"

const TEMPLE_ROUTE_PRESETS = STORY_DEBUG_ROUTE_PRESETS.filter(
  (preset) => preset.routeGroupId === "temple",
)
const ACT7_ENDING_PRESETS = STORY_DEBUG_ROUTE_PRESETS.filter(
  (preset) => preset.routeGroupId === "act7-ending",
)
const ACT8_ENDING_PRESETS = STORY_DEBUG_ROUTE_PRESETS.filter(
  (preset) => preset.routeGroupId === "act8-ending",
)

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
    "loads $title at its intended act and location",
    (preset) => {
      const next = applyStoryDebugPreset(makePlayer(), preset)
      const progress = getStoryProgress(next)
      const location = getLocationById(preset.targetLocationId)

      expect(progress.act.id).toBe(preset.expectedActId)
      expect(progress.recommendedLocationId).toBe(preset.targetLocationId)
      expect(location).toBeDefined()
      if (preset.targetEventId) {
        expect(getStoryEventByLocation(next, location!.events).id).toBe(preset.targetEventId)
      }
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
  it.each(TEMPLE_ROUTE_PRESETS)(
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

  it.each(ACT7_ENDING_PRESETS)(
    "loads $title at its intended departure choice",
    (preset) => {
      const next = applyStoryDebugPreset(makePlayer(), preset)
      const progress = getStoryProgress(next)
      const location = getLocationById(preset.targetLocationId)!
      const event = STORY_VOLUMES.find((candidate) => candidate.id === preset.targetEventId)!
      const node = event.nodes[preset.targetNodeId!]
      const choiceIds = visibleChoices(next, next.world, node).map((choice) => choice.id)

      expect(progress.act.id).toBe("act7-western-campaign")
      expect(progress.recommendedLocationId).toBe("damos")
      expect(getStoryEventByLocation(next, location.events).id).toBe("shendiao-damos-departure-act7")
      expect(next.world.arcs.shendiao.variants["act7.home-order"]).toBe("cleared")
      expect(next.world.arcs.shendiao.beats["act7-western-campaign"]).toBeUndefined()
      expect(choiceIds).toContain(preset.targetChoiceId)
      expect(next.world.completedEvents).toContain("shendiao-damos-home-order-act7")
    },
  )

  it("covers five departures, four Hua Zheng outcomes and three Li Ping outcomes", () => {
    expect(ACT7_ENDING_PRESETS.map((preset) => preset.targetChoiceId).sort()).toEqual([
      "choose-grassland-ending",
      "escort-refugees",
      "keep-mongol-command",
      "leave-with-guojing",
      "remain-double-agent",
    ])
    expect(new Set(ACT7_ENDING_PRESETS.map(
      (preset) => preset.variants?.["act7.huazheng"],
    ))).toEqual(new Set(["helped-escape", "broke-ties", "stayed-loyal", "led-pursuit"]))
    expect(new Set(ACT7_ENDING_PRESETS.map(
      (preset) => preset.variants?.["act7.liping"],
    ))).toEqual(new Set(["survived-prepared", "died-covering-retreat", "died-testimony"]))
  })

  it.each(ACT8_ENDING_PRESETS)(
    "loads $title before its act-eight fact and final pages",
    (preset) => {
      const next = applyStoryDebugPreset(makePlayer(), preset)
      const progress = getStoryProgress(next)
      const huashan = getLocationById(preset.targetLocationId)!
      const epilogue = STORY_VOLUMES.find(
        (candidate) => candidate.id === preset.targetEventId,
      )!
      const legacyHuashan = STORY_VOLUMES.find(
        (candidate) => candidate.id === "shendiao-huashan",
      )!
      const expectedEnding = preset.id.replace("act8-ending-", "")

      expect(progress.act.id).toBe("act8-huashan")
      expect(progress.recommendedLocationId).toBe("huashan")
      expect(progress.primaryAction).toBe("确认射雕卷最终去向")
      expect(getStoryEventByLocation(next, huashan.events).id)
        .toBe("shendiao-huashan-epilogue-act8")
      expect(next.world.arcs.shendiao.variants["act8.contest"]).toBe("cleared")
      expect(next.world.arcs.shendiao.variants["act8.ending"]).toBeUndefined()
      expect(next.world.arcs.shendiao.beats["act8-huashan"]).toBeUndefined()
      expect(next.world.completedEvents).toContain("shendiao-huashan-contest-act8")
      expect(checkCondition(next, next.world, legacyHuashan.condition)).toBe(false)

      const route = resolveBranch(
        next,
        next.world,
        epilogue.nodes["ending-router"].autoNext!,
      )
      expect(route).toMatchObject({
        type: "goto",
        nodeId: preset.targetNodeId,
      })
      if (route.type !== "goto") return

      const factTransition = resolveBranch(
        next,
        next.world,
        epilogue.nodes[route.nodeId].autoNext!,
      )
      expect(factTransition).toMatchObject({
        type: "goto",
        nodeId: `ending-${expectedEnding}`,
      })
      if (factTransition.type !== "goto") return

      const ended = enterNode(
        next,
        next.world,
        epilogue,
        factTransition.nodeId,
      )!
      expect(ended.world.arcs.shendiao.variants["act8.ending"]).toBe(expectedEnding)
      expect(ended.world.arcs.shendiao.ending).toBe(expectedEnding)
      expect(ended.world.arcs.shendiao.beats["act8-huashan"]).toBe("done")
      expect(ended.player.world).toBe(ended.world)
      expect(checkCondition(ended.player, ended.world, legacyHuashan.condition))
        .toBe(false)
    },
  )

  it("covers all eight act-eight endings exactly once", () => {
    expect(ACT8_ENDING_PRESETS.map(
      (preset) => preset.id.replace("act8-ending-", ""),
    ).sort()).toEqual([
      "commander",
      "grassland",
      "hermit",
      "hero",
      "keeper",
      "outcast",
      "taohua",
      "wanderer",
    ])
    expect(new Set(ACT8_ENDING_PRESETS.map(
      (preset) => preset.targetNodeId,
    )).size).toBe(8)
  })

  it("keeps every route group non-empty and every preset assigned once", () => {
    expect(STORY_DEBUG_ROUTE_GROUPS.map((group) => group.id).sort()).toEqual([
      "act7-ending",
      "act8-ending",
      "temple",
    ])
    for (const group of STORY_DEBUG_ROUTE_GROUPS) {
      expect(STORY_DEBUG_ROUTE_PRESETS.some(
        (preset) => preset.routeGroupId === group.id,
      )).toBe(true)
    }
    expect(STORY_DEBUG_ROUTE_PRESETS.every((preset) => !!preset.routeGroupId)).toBe(true)
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

  it("exposes ordered act-six and act-seven variant groups", () => {
    expect(STORY_DEBUG_VARIANT_GROUPS).toEqual([
      "第六幕·阶段",
      "第六幕·人物与会局",
      "第六幕·四轮证据",
      "第六幕·裁决",
      "第七幕·阶段",
      "第七幕·战争",
      "第七幕·终局",
    ])
    expect(STORY_DEBUG_VARIANT_FIELDS.filter(
      (field) => field.group === "第七幕·终局",
    ).map((field) => field.key)).toEqual([
      "act7.huazheng",
      "act7.liping",
      "act7.departure",
    ])
  })
})
