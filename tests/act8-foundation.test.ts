import { describe, expect, it } from "vitest"
import {
  getAllLocationsWithStatus,
  getLocationById,
} from "../src/data/map"
import { STORY_VOLUMES } from "../src/data/story"
import { STORY_DEBUG_ACT_PRESETS } from "../src/data/story/debugPresets"
import {
  SHENDIAO_ACT8_EVENT_IDS,
  SHENDIAO_ACT8_LOCATION_EVENT_ORDER,
  SHENDIAO_ACT8_STORY,
} from "../src/data/story/shendiaoAct8"
import { applyStoryDebugPreset } from "../src/game/debug"
import { createPlayer } from "../src/game/player"
import {
  getStoryEventByLocation,
  getStoryProgress,
} from "../src/game/story/query"

const ACT8_EVENT_IDS = [
  "shendiao-huashan-arrival-act8",
  "shendiao-huashan-testimony-act8",
  "shendiao-huashan-crisis-act8",
  "shendiao-huashan-contest-act8",
  "shendiao-huashan-epilogue-act8",
] as const

function makeAct8Player() {
  const player = createPlayer("第八幕底座")
  player.reputation = 0
  player.world.arcs.shendiao = {
    beats: {
      "act1-wind": "done",
      "act2-damos": "done",
      "act3-zhongdu": "done",
      "act4-taohua": "done",
      "act5-old-debts": "done",
      "act6-truth": "done",
      "act7-western-campaign": "done",
    },
    variants: {
      "act7.departure": "with-guojing",
    },
  }
  return player
}

function locationUnlocked(
  player: ReturnType<typeof makeAct8Player>,
  locationId: string,
): boolean {
  return getAllLocationsWithStatus(player)
    .find((location) => location.id === locationId)?.unlocked ?? false
}

describe("act eight data foundation", () => {
  it("defines five stable event ids in reverse location priority", () => {
    expect(Object.values(SHENDIAO_ACT8_EVENT_IDS)).toEqual(ACT8_EVENT_IDS)
    expect(SHENDIAO_ACT8_LOCATION_EVENT_ORDER).toEqual([...ACT8_EVENT_IDS].reverse())
    expect(new Set(ACT8_EVENT_IDS).size).toBe(ACT8_EVENT_IDS.length)
  })

  it("registers all five modern act eight events", () => {
    expect(SHENDIAO_ACT8_STORY.map((event) => event.id)).toEqual(ACT8_EVENT_IDS)
    expect(STORY_VOLUMES.filter(
      (event) => ACT8_EVENT_IDS.includes(event.id as typeof ACT8_EVENT_IDS[number]),
    ).map((event) => event.id)).toEqual(ACT8_EVENT_IDS)
  })

  it("places modern events before the legacy Huashan chain", () => {
    expect(getLocationById("huashan")!.events).toEqual([
      ...SHENDIAO_ACT8_LOCATION_EVENT_ORDER,
      "shendiao-huashan",
      "shendiao-huashan-snow",
      "shendiao-huashan-stone",
      "huashan-cliff",
    ])
  })
})

describe("act eight Huashan access and isolation", () => {
  it("unlocks Huashan after act seven even when reputation is below the old threshold", () => {
    const player = makeAct8Player()
    player.world.arcs.shendiao.beats["act7-western-campaign"] = undefined
    expect(locationUnlocked(player, "huashan")).toBe(false)

    player.world.arcs.shendiao.beats["act7-western-campaign"] = "done"
    expect(locationUnlocked(player, "huashan")).toBe(true)

    player.world.arcs.shendiao.beats["act7-western-campaign"] = undefined
    player.reputation = 20
    expect(locationUnlocked(player, "huashan")).toBe(true)
  })

  it("blocks the old sample for modern saves but preserves skipped legacy saves", () => {
    const huashan = getLocationById("huashan")!
    const modern = makeAct8Player()
    modern.world.arcs.shendiao.beats.yangkang = "done"
    expect(getStoryEventByLocation(modern, huashan.events).id).not.toBe("shendiao-huashan")

    const legacy = makeAct8Player()
    legacy.world.arcs.shendiao.beats.yangkang = "done"
    legacy.world.arcs.shendiao.beats["act7-western-campaign"] = "skipped"
    expect(getStoryEventByLocation(legacy, huashan.events).id).toBe("shendiao-huashan")
  })
})

describe("act eight guidance", () => {
  it("starts at Huashan after all seven modern acts complete", () => {
    expect(getStoryProgress(makeAct8Player())).toMatchObject({
      act: { id: "act8-huashan" },
      recommendedLocationId: "huashan",
      primaryAction: "启程赴华山",
      next: "下一关键节点：群雄上山与见证席。",
      guidanceSource: { kind: "act", id: "act8-huashan" },
    })
  })

  it.each([
    ["act8.arrival", "act8.testimony", "参加山腰华山公议"],
    ["act8.testimony", "act8.value-stage", "处理最后军报"],
    ["act8.value-stage", "act8.contest", "登绝顶完成论剑"],
    ["act8.contest", "act8-huashan", "确认射雕卷最终去向"],
  ] as const)(
    "routes %s completion to %s",
    (afterKey, beforeKey, primaryAction) => {
      const player = makeAct8Player()
      player.world.arcs.shendiao.variants[afterKey] = "cleared"

      expect(getStoryProgress(player)).toMatchObject({
        act: { id: "act8-huashan" },
        recommendedLocationId: "huashan",
        primaryAction,
        guidanceSource: {
          kind: "override",
          after: `variant:${afterKey}=cleared`,
          before: beforeKey === "act8-huashan"
            ? `beat:${beforeKey}`
            : `variant:${beforeKey}=cleared`,
        },
      })
    },
  )
})

describe("act eight debug entry", () => {
  it("loads a modern Huashan baseline at the arrival event", () => {
    const preset = STORY_DEBUG_ACT_PRESETS.find(
      (candidate) => candidate.id === "act8-start",
    )!
    const loaded = applyStoryDebugPreset(createPlayer("第八幕调试"), preset)
    const huashan = getLocationById("huashan")!

    expect(preset.targetEventId).toBe(SHENDIAO_ACT8_EVENT_IDS.arrival)
    expect(getStoryProgress(loaded)).toMatchObject({
      act: { id: "act8-huashan" },
      recommendedLocationId: "huashan",
      primaryAction: "启程赴华山",
    })
    expect(locationUnlocked(loaded, "huashan")).toBe(true)
    expect(loaded.world.arcs.shendiao.beats["act7-western-campaign"]).toBe("done")
    expect(loaded.world.arcs.shendiao.variants).toMatchObject({
      "act6.yangkang-verdict": "captured",
      "act7.departure": "with-guojing",
    })
    expect(loaded.world.completedEvents).toContain("shendiao-damos-departure-act7")
    expect(getStoryEventByLocation(loaded, huashan.events).id)
      .toBe(SHENDIAO_ACT8_EVENT_IDS.arrival)
  })
})
