import { describe, expect, it } from "vitest"
import type { Player } from "../src/types"
import type { StoryDebugPreset } from "../src/data/story/debugPresets"
import { STORY_DEBUG_ROUTE_PRESETS } from "../src/data/story/debugPresets"
import { STORY_VOLUMES } from "../src/data/story"
import {
  SHENDIAO_ENDING_DEFINITIONS,
  SHENDIAO_ENDING_IDS,
} from "../src/data/story/shendiaoEndingRecords"
import {
  SHENDIAO_ACT6_AFTERMATH_WORLD_EVENT,
  SHENDIAO_ENDING_WORLD_EVENTS,
} from "../src/data/story/shendiaoWorldEvents"
import { applyStoryDebugPreset } from "../src/game/debug"
import { createPlayer } from "../src/game/player"
import { normalizeMainPlayer } from "../src/game/appFlow"
import { checkCondition } from "../src/game/story/conditions"
import { getShendiaoEndingRecord } from "../src/game/story/endingRecord"
import {
  enterNode,
  resolveBranch,
  resolveChoice,
} from "../src/game/story/engine"
import { createWorld } from "../src/game/story/state"
import { pollWorldEvent } from "../src/game/story/worldScheduler"
import { getLetterMeta } from "../src/screens/eventPresenter"

const ENDING_PRESETS = STORY_DEBUG_ROUTE_PRESETS.filter(
  (preset) => preset.routeGroupId === "act8-ending",
)

function finalizeEnding(preset: StoryDebugPreset): Player {
  const player = applyStoryDebugPreset(createPlayer("卷末纪事"), preset)
  const event = STORY_VOLUMES.find(
    (candidate) => candidate.id === preset.targetEventId,
  )!
  const route = resolveBranch(
    player,
    player.world,
    event.nodes["ending-router"].autoNext!,
  )
  if (route.type !== "goto") throw new Error(`Unexpected route: ${route.type}`)

  const finalRoute = resolveBranch(
    player,
    player.world,
    event.nodes[route.nodeId].autoNext!,
  )
  if (finalRoute.type !== "goto") {
    throw new Error(`Unexpected final route: ${finalRoute.type}`)
  }

  return enterNode(
    player,
    player.world,
    event,
    finalRoute.nodeId,
  )!.player
}

function makeAct6Player(variants: Record<string, string>): Player {
  const player = createPlayer("第六幕余波")
  const world = createWorld()
  world.arcs.shendiao = {
    beats: {
      "act1-wind": "done",
      "act2-damos": "done",
      "act3-zhongdu": "done",
      "act4-taohua": "done",
      "act5-old-debts": "done",
      "act6-truth": "done",
    },
    variants,
  }
  return { ...player, world }
}

describe("act-eight ending record", () => {
  it("stays unavailable before the final beat", () => {
    const preset = ENDING_PRESETS[0]
    const player = applyStoryDebugPreset(createPlayer("未落笔"), preset)
    expect(getShendiaoEndingRecord(player)).toBeNull()
  })

  it.each(ENDING_PRESETS)(
    "derives five immutable record sections for $title",
    (preset) => {
      const player = finalizeEnding(preset)
      const before = structuredClone(player)
      const expectedEnding = preset.id.replace("act8-ending-", "")
      const record = getShendiaoEndingRecord(player)!

      expect(record.endingId).toBe(expectedEnding)
      expect(record.endingTitle).toBe(
        SHENDIAO_ENDING_DEFINITIONS[record.endingId].title,
      )
      expect(record.sections.map((section) => section.id)).toEqual([
        "departure",
        "council",
        "value",
        "martial",
        "ending",
      ])
      expect(record.sections.every((section) => section.facts.length >= 2))
        .toBe(true)
      expect(record.sections.flatMap((section) => section.facts)
        .every((fact) => fact.value !== "未留记录")).toBe(true)
      expect(player).toEqual(before)
    },
  )

  it("covers all eight stable ending definitions", () => {
    expect(ENDING_PRESETS).toHaveLength(8)
    expect(ENDING_PRESETS.map(
      (preset) => preset.id.replace("act8-ending-", ""),
    ).sort()).toEqual([...SHENDIAO_ENDING_IDS].sort())
  })
})

describe("act-eight ending echoes", () => {
  it("uses ending-specific letter tags and seals", () => {
    const byId = (id: string) => SHENDIAO_ENDING_WORLD_EVENTS.find(
      (worldEvent) => worldEvent.id === id,
    )!.event
    expect(getLetterMeta(
      byId("act8-echo-commander"),
      "江湖回响·北路新令",
    )).toMatchObject({ tag: "军令", seal: "中军印" })
    expect(getLetterMeta(
      byId("act8-echo-keeper"),
      "江湖回响·三路回执",
    )).toMatchObject({ tag: "回执", seal: "验封印" })
    expect(getLetterMeta(
      byId("act8-echo-outcast"),
      "江湖回响·撤名副本",
    )).toMatchObject({ tag: "退件", seal: "验封孔" })
  })

  it.each(ENDING_PRESETS)(
    "queues only the $title echo and leaves its ending unchanged",
    (preset) => {
      const player = finalizeEnding(preset)
      const ending = player.world.arcs.shendiao.ending
      const matches = SHENDIAO_ENDING_WORLD_EVENTS.filter((worldEvent) =>
        checkCondition(player, player.world, worldEvent.trigger)
      )

      expect(matches).toHaveLength(1)
      expect(matches[0].event.id).toBe(
        SHENDIAO_ENDING_DEFINITIONS[ending as keyof typeof SHENDIAO_ENDING_DEFINITIONS]
          .worldEventId,
      )

      player.world.pendingWorldEvents = ["world-guojing-medicine"]
      const normalized = normalizeMainPlayer(player)
      expect(normalized.world.pendingWorldEvents[0]).toBe(matches[0].event.id)
      expect(normalized.world.pendingWorldEvents[1]).toBe("world-guojing-medicine")
      expect(normalized.world.triggeredEvents).toContain(matches[0].id)

      const entered = enterNode(
        normalized,
        normalized.world,
        matches[0].event,
        matches[0].event.entryNode,
      )!
      const choice = matches[0].event.nodes[matches[0].event.entryNode]
        .choices![0]
      const resolved = resolveChoice(
        entered.player,
        entered.world,
        matches[0].event,
        matches[0].event.entryNode,
        choice.id,
      )!
      expect(resolved.world.arcs.shendiao.ending).toBe(ending)
      expect(resolved.world.arcs.shendiao.variants["act8.ending"]).toBe(ending)
      expect(resolved.world.arcs.shendiao.beats["act8-huashan"]).toBe("done")
    },
  )
})

describe("act-six aftermath echo", () => {
  const event = SHENDIAO_ACT6_AFTERMATH_WORLD_EVENT.event

  it("triggers after act six but never backfills after act seven", () => {
    const player = makeAct6Player({
      "act6.munianci-outcome": "broken",
      "act6.island-outcome": "xiaoying-saved",
      "act6.yangkang-verdict": "captured",
    })
    const polled = pollWorldEvent(player, player.world)
    expect(polled.event?.id).toBe(event.id)

    player.world.arcs.shendiao.beats["act7-western-campaign"] = "done"
    expect(checkCondition(
      player,
      player.world,
      SHENDIAO_ACT6_AFTERMATH_WORLD_EVENT.trigger,
    )).toBe(false)
  })

  it.each([
    ["broken", "munianci-broken"],
    ["informed-unresolved", "munianci-questioned"],
    ["hidden", "munianci-hidden"],
  ])("routes Munianci %s to %s", (variant, expectedNode) => {
    const player = makeAct6Player({ "act6.munianci-outcome": variant })
    expect(resolveBranch(
      player,
      player.world,
      event.nodes["aftermath-arrives"].autoNext!,
    )).toMatchObject({ type: "goto", nodeId: expectedNode })
  })

  it.each([
    ["ke-survived", "island-limited-survivors"],
    ["ke-wounded", "island-ke-wounded"],
    ["xiaoying-saved", "island-xiaoying-saved"],
    ["ke-only", "island-limited-survivors"],
    ["evidence-preserved", "island-evidence-preserved"],
    ["evidence-fragment", "island-limited-survivors"],
    ["killer-traced", "island-killer-traced"],
    ["killer-lost", "island-limited-survivors"],
  ])("routes island outcome %s to %s", (variant, expectedNode) => {
    const player = makeAct6Player({ "act6.island-outcome": variant })
    expect(resolveBranch(
      player,
      player.world,
      event.nodes["munianci-broken"].autoNext!,
    )).toMatchObject({ type: "goto", nodeId: expectedNode })
  })

  it.each([
    ["dead", "verdict-dead"],
    ["escaped", "verdict-escaped"],
    ["captured", "verdict-captured"],
    ["confessed", "verdict-confessed"],
    ["aided", "verdict-aided"],
  ])("routes Yang Kang verdict %s to %s", (variant, expectedNode) => {
    const player = makeAct6Player({ "act6.yangkang-verdict": variant })
    expect(resolveBranch(
      player,
      player.world,
      event.nodes["island-xiaoying-saved"].autoNext!,
    )).toMatchObject({ type: "goto", nodeId: expectedNode })
  })
})
