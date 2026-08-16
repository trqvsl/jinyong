import { describe, expect, it } from "vitest"
import { ENEMIES } from "../src/data/enemies"
import {
  getAllLocationsWithStatus,
  getLocationById,
  LOCATIONS,
} from "../src/data/map"
import { getNpcById, NPCS } from "../src/data/npcs"
import { STORY_DEBUG_ACT_PRESETS } from "../src/data/story/debugPresets"
import { applyStoryDebugPreset } from "../src/game/debug"
import { createPlayer } from "../src/game/player"
import { getStoryEventByLocation, getStoryProgress } from "../src/game/story/query"

const ACT7_NPC_IDS = [
  "liping",
  "huazheng",
  "zhebie",
  "tuolei",
  "temujin",
  "juchi",
  "chagatai",
  "samarkand-healer",
  "samarkand-guide",
] as const

const ACT7_ENEMY_IDS = [
  "mongol-camp-soldier",
  "samarkand-defender",
  "mongol-plunderer",
  "western-pursuer",
] as const

function makeAct7Player() {
  const player = createPlayer("第七幕底座")
  player.world.arcs.shendiao = {
    beats: {
      "act1-wind": "done",
      "act2-damos": "done",
      "act3-zhongdu": "done",
      "act4-taohua": "done",
      "act5-old-debts": "done",
      "act6-truth": "done",
    },
    variants: {},
  }
  return player
}

function locationUnlocked(player: ReturnType<typeof makeAct7Player>, locationId: string): boolean {
  return getAllLocationsWithStatus(player).find((location) => location.id === locationId)?.unlocked ?? false
}

describe("act seven data foundation", () => {
  it("keeps location NPC and enemy references valid", () => {
    const npcIds = new Set(NPCS.map((npc) => npc.id))
    const enemyIds = new Set(ENEMIES.map((enemy) => enemy.id))
    const missingNpcs = LOCATIONS.flatMap((location) =>
      (location.npcIds ?? [])
        .filter((npcId) => !npcIds.has(npcId))
        .map((npcId) => `${location.id}:${npcId}`)
    )
    const missingEnemies = LOCATIONS.flatMap((location) =>
      location.enemyPool
        .filter((enemyId) => !enemyIds.has(enemyId))
        .map((enemyId) => `${location.id}:${enemyId}`)
    )

    expect(new Set(LOCATIONS.map((location) => location.id)).size).toBe(LOCATIONS.length)
    expect(new Set(NPCS.map((npc) => npc.id)).size).toBe(NPCS.length)
    expect(new Set(ENEMIES.map((enemy) => enemy.id)).size).toBe(ENEMIES.length)
    expect(missingNpcs).toEqual([])
    expect(missingEnemies).toEqual([])
  })

  it("registers the campaign locations, characters and enemies", () => {
    const damos = getLocationById("damos")!
    const camp = getLocationById("western-camp")!
    const samarkand = getLocationById("samarkand")!

    expect(damos.events.slice(0, 3)).toEqual([
      "shendiao-damos-departure-act7",
      "shendiao-damos-home-order-act7",
      "shendiao-damos-act7",
    ])
    expect(camp.events).toEqual(["shendiao-western-camp-act7"])
    expect(samarkand.events).toEqual([
      "shendiao-samarkand-aftermath-act7",
      "shendiao-samarkand-siege-act7",
      "shendiao-samarkand-scout-act7",
    ])
    expect(ACT7_NPC_IDS.every((npcId) => !!getNpcById(npcId))).toBe(true)
    expect(ACT7_ENEMY_IDS.every((enemyId) => ENEMIES.some((enemy) => enemy.id === enemyId))).toBe(true)
  })
})

describe("act seven guidance", () => {
  it("unlocks locations and advances guidance by campaign stage", () => {
    const player = makeAct7Player()

    expect(getStoryProgress(player)).toMatchObject({
      act: { id: "act7-western-campaign" },
      recommendedLocationId: "damos",
    })
    expect(locationUnlocked(player, "western-camp")).toBe(false)
    expect(locationUnlocked(player, "samarkand")).toBe(false)

    player.world.arcs.shendiao.variants["act7.recall"] = "cleared"
    expect(getStoryProgress(player)).toMatchObject({
      recommendedLocationId: "western-camp",
      guidanceSource: {
        kind: "override",
        after: "variant:act7.recall=cleared",
        before: "variant:act7.camp=cleared",
      },
    })
    expect(locationUnlocked(player, "western-camp")).toBe(true)
    expect(locationUnlocked(player, "samarkand")).toBe(false)

    player.world.arcs.shendiao.variants["act7.camp"] = "cleared"
    expect(getStoryProgress(player)).toMatchObject({
      recommendedLocationId: "samarkand",
      primaryAction: "先行侦察撒马尔罕",
    })
    expect(locationUnlocked(player, "samarkand")).toBe(true)

    player.world.arcs.shendiao.variants["act7.scout"] = "cleared"
    expect(getStoryProgress(player)).toMatchObject({
      recommendedLocationId: "samarkand",
      primaryAction: "携侦察结果赴城下军议",
    })

    player.world.arcs.shendiao.variants["act7.siege"] = "cleared"
    expect(getStoryProgress(player)).toMatchObject({
      recommendedLocationId: "samarkand",
      primaryAction: "进城约束军纪",
    })

    player.world.arcs.shendiao.variants["act7.city"] = "cleared"
    expect(getStoryProgress(player)).toMatchObject({
      recommendedLocationId: "damos",
      primaryAction: "返回草原接南征军令",
    })

    player.world.arcs.shendiao.variants["act7.home-order"] = "cleared"
    expect(getStoryProgress(player)).toMatchObject({
      recommendedLocationId: "damos",
      primaryAction: "决定离营与南归路线",
    })
  })
})

describe("act seven debug entry", () => {
  it("loads the campaign baseline at the registered recall event", () => {
    const preset = STORY_DEBUG_ACT_PRESETS.find((candidate) => candidate.id === "act7-start")!
    const loaded = applyStoryDebugPreset(createPlayer("第七幕调试"), preset)

    expect(preset.targetEventId).toBe("shendiao-damos-act7")
    expect(getStoryProgress(loaded)).toMatchObject({
      act: { id: "act7-western-campaign" },
      recommendedLocationId: "damos",
    })
    expect(loaded.inventory["mongol-wolf-tally"]).toBe(1)
    expect(loaded.world.arcs.shendiao.variants).toMatchObject({
      "act5.wumu-destination": "beggar-network",
      "act6.aftermath": "return-damos",
    })
    expect(loaded.world.factions.mongol).toEqual({ attitude: 20, power: 80 })
    expect(loaded.world.completedEvents).toContain("shendiao-tieqiangmiao-act6")
    expect(locationUnlocked(loaded, "western-camp")).toBe(false)
    expect(locationUnlocked(loaded, "samarkand")).toBe(false)
    expect(getStoryEventByLocation(loaded, getLocationById("damos")!.events).id).toBe("shendiao-damos-act7")
  })
})
