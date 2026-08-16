import { describe, expect, it } from "vitest"
import type { Player } from "../src/types"
import type {
  StoryEvent,
  Transition,
} from "../src/data/story/schema"
import { STORY_VOLUMES } from "../src/data/story"
import { getLocationById } from "../src/data/map"
import { getEnemyById } from "../src/data/enemies"
import {
  SHENDIAO_ACT8_EVENT_IDS,
} from "../src/data/story/shendiaoAct8"
import { createPlayer } from "../src/game/player"
import { createWorld } from "../src/game/story/state"
import {
  enterNode,
  resolveBattleOutcome,
  resolveBranch,
  resolveChoice,
  visibleChoices,
} from "../src/game/story/engine"
import {
  getStoryEventByLocation,
  getStoryProgress,
} from "../src/game/story/query"

type ValueChoice = "save-crowd" | "guard-record" | "pursue-raiders"
type BattleTransition = Extract<Transition, { type: "battle" }>

const OUTCOMES = ["won", "partial", "lost", "fled"] as const

function getCrisisEvent(): StoryEvent {
  const event = STORY_VOLUMES.find(
    (candidate) => candidate.id === SHENDIAO_ACT8_EVENT_IDS.crisis,
  )
  if (!event) throw new Error("Missing act eight crisis event")
  return event
}

function makeP3Player(args: {
  variants?: Record<string, string>
  relations?: Record<string, number>
  reputation?: number
  mongolAttitude?: number
} = {}): Player {
  const player = createPlayer("第八幕价值行动")
  const world = createWorld()
  world.arcs.shendiao = {
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
      "act7.role": "independent",
      "act7.scout-method": "civilian",
      "act7.evacuation": "full",
      "act7.departure": "with-guojing",
      "act8.entry": "guo-company",
      "act8.witnesses": "broad",
      "act8.record": "full",
      "act8.arrival": "cleared",
      "act8.testimony": "cleared",
      ...(args.variants ?? {}),
    },
  }
  world.factions.mongol = {
    attitude: args.mongolAttitude ?? 10,
    power: 80,
  }
  return {
    ...player,
    reputation: args.reputation ?? 0,
    relations: {
      guojing: 25,
      huangrong: 25,
      "samarkand-guide": 10,
      ...(args.relations ?? {}),
    },
    world,
  }
}

function getBattle(player: Player, choiceId: ValueChoice): BattleTransition {
  const event = getCrisisEvent()
  const choice = visibleChoices(
    player,
    player.world,
    event.nodes["value-choice"],
  ).find((candidate) => candidate.id === choiceId)
  if (!choice) throw new Error(`Missing value choice: ${choiceId}`)
  const transition = resolveBranch(player, player.world, choice.transition)
  if (transition.type !== "battle") {
    throw new Error(`Expected battle for ${choiceId}, got ${transition.type}`)
  }
  return transition
}

function expectedCost(choiceId: ValueChoice, outcome: typeof OUTCOMES[number]): string {
  if (choiceId === "save-crowd") {
    return outcome === "won" || outcome === "fled"
      ? "culprit-escaped"
      : "record-damaged"
  }
  if (choiceId === "guard-record") {
    return outcome === "fled" ? "record-damaged" : "people-hurt"
  }
  return outcome === "won" || outcome === "lost"
    ? "people-hurt"
    : "record-damaged"
}

describe("act eight P3 foundation", () => {
  it("registers the Huashan pursuit enemies", () => {
    expect(getEnemyById("huashan-military-pursuer").name).toBe("军令追缉使")
    expect(getEnemyById("huashan-record-raider").name).toBe("夺卷死士")
  })

  it("moves from testimony through crisis, contest, and epilogue", () => {
    const player = makeP3Player()
    const huashan = getLocationById("huashan")!

    expect(getStoryEventByLocation(player, huashan.events).id)
      .toBe(SHENDIAO_ACT8_EVENT_IDS.crisis)

    player.world.arcs.shendiao.variants["act8.value-stage"] = "cleared"
    expect(getStoryEventByLocation(player, huashan.events).id)
      .toBe(SHENDIAO_ACT8_EVENT_IDS.contest)

    player.world.arcs.shendiao.variants["act8.contest"] = "cleared"
    expect(getStoryEventByLocation(player, huashan.events).id)
      .toBe(SHENDIAO_ACT8_EVENT_IDS.epilogue)
    expect(getStoryEventByLocation(player, huashan.events).id)
      .not.toBe("shendiao-huashan")
  })
})

describe("last report read side", () => {
  it.each([
    ["full", "crisis-record-full"],
    ["contested", "crisis-record-contested"],
    ["concealed", "crisis-record-concealed"],
    ["falsified", "crisis-record-falsified"],
  ] as const)("routes %s records to %s", (record, nodeId) => {
    const event = getCrisisEvent()
    const player = makeP3Player({ variants: { "act8.record": record } })
    expect(resolveBranch(
      player,
      player.world,
      event.nodes["last-report-arrival"].autoNext!,
    )).toMatchObject({ type: "goto", nodeId })
  })

  it.each([
    ["mongol-envoy", "demand-envoy-seat"],
    ["covert-messenger", "demand-covert-source"],
    ["refugee-witness", "demand-witness-cart"],
    ["guo-company", "demand-mountain-gate"],
    ["grassland-visitor", "demand-mountain-gate"],
  ] as const)("routes %s entry to %s", (entry, nodeId) => {
    const event = getCrisisEvent()
    const player = makeP3Player({ variants: { "act8.entry": entry } })
    expect(resolveBranch(
      player,
      player.world,
      event.nodes["pursuit-demand"].autoNext!,
    )).toMatchObject({ type: "goto", nodeId })
  })
})

describe("value choice visibility", () => {
  it("shows three physical interventions on an ordinary route", () => {
    const event = getCrisisEvent()
    const player = makeP3Player({
      reputation: 0,
      mongolAttitude: 10,
      variants: { "act8.entry": "guo-company" },
    })
    expect(visibleChoices(
      player,
      player.world,
      event.nodes["value-choice"],
    ).map((choice) => choice.id)).toEqual([
      "save-crowd",
      "guard-record",
      "pursue-raiders",
    ])
  })

  it.each([
    [{ "act8.entry": "mongol-envoy" }, 0, 10],
    [{ "act8.entry": "guo-company" }, 40, 10],
    [{ "act8.entry": "guo-company" }, 0, 20],
  ] as const)(
    "unlocks claim-seat through identity, reputation, or faction support",
    (variants, reputation, mongolAttitude) => {
      const event = getCrisisEvent()
      const player = makeP3Player({ variants, reputation, mongolAttitude })
      expect(visibleChoices(
        player,
        player.world,
        event.nodes["value-choice"],
      ).map((choice) => choice.id)).toContain("claim-seat")
    },
  )
})

describe("prepared battle composition", () => {
  it.each([
    [
      "save-crowd",
      {
        variants: { "act8.entry": "refugee-witness" },
      },
      {
        variants: {
          "act8.entry": "guo-company",
          "act7.evacuation": "failed",
        },
        relations: { guojing: 0 },
      },
      ["samarkand-healer", "samarkand-guide"],
    ],
    [
      "guard-record",
      {
        variants: {
          "act8.record": "full",
          "act8.witnesses": "broad",
        },
      },
      {
        variants: {
          "act8.record": "contested",
          "act8.witnesses": "sparse",
        },
        relations: { huangrong: 0 },
      },
      ["huangrong", "kezhene"],
    ],
    [
      "pursue-raiders",
      {
        variants: { "act7.role": "scout" },
      },
      {
        variants: {
          "act7.role": "independent",
          "act7.scout-method": "civilian",
        },
      },
      ["guojing", "samarkand-guide"],
    ],
  ] as const)(
    "%s reduces the enemy group but keeps a multi-protect objective",
    (choiceId, preparedArgs, exposedArgs, protectedIds) => {
      const prepared = getBattle(
        makeP3Player(preparedArgs),
        choiceId,
      )
      const exposed = getBattle(
        makeP3Player(exposedArgs),
        choiceId,
      )

      expect(prepared.enemyIds).toHaveLength(2)
      expect(exposed.enemyIds).toHaveLength(3)
      expect(prepared.objective?.protectAllyIds).toEqual(protectedIds)
      expect(prepared.objective?.minProtectedSurvivors).toBe(1)
      expect(prepared.onPartial).toBeDefined()
    },
  )
})

describe("mandatory value costs", () => {
  it.each([
    ["save-crowd", { variants: { "act8.entry": "refugee-witness" } }],
    [
      "save-crowd",
      {
        variants: {
          "act8.entry": "guo-company",
          "act7.evacuation": "failed",
        },
        relations: { guojing: 0 },
      },
    ],
    ["guard-record", { variants: { "act8.record": "full" } }],
    [
      "guard-record",
      {
        variants: {
          "act8.record": "contested",
          "act8.witnesses": "sparse",
        },
        relations: { huangrong: 0 },
      },
    ],
    ["pursue-raiders", { variants: { "act7.role": "scout" } }],
    [
      "pursue-raiders",
      {
        variants: {
          "act7.role": "independent",
          "act7.scout-method": "civilian",
        },
      },
    ],
  ] as const)(
    "%s writes a nonempty cost from all four battle outcomes",
    (choiceId, args) => {
      for (const outcome of OUTCOMES) {
        const player = makeP3Player(args)
        const battle = getBattle(player, choiceId)
        const resolved = resolveBattleOutcome(
          player,
          player.world,
          battle,
          outcome,
        )!

        expect(resolved.world.arcs.shendiao.variants["act8.value"])
          .toBe(choiceId)
        expect(resolved.world.arcs.shendiao.variants["act8.value-cost"])
          .toBe(expectedCost(choiceId, outcome))
        expect(resolved.world.arcs.shendiao.variants["act8.value-cost"])
          .not.toBe("")
        expect(resolved.then).toMatchObject({
          type: "goto",
          nodeId: "value-result-router",
        })
        expect(resolved.player.world).toBe(resolved.world)
      }
    },
  )

  it("claim-seat preserves the military route but always costs trust", () => {
    const event = getCrisisEvent()
    const player = makeP3Player({
      variants: {
        "act8.entry": "mongol-envoy",
        "act7.departure": "mongol-command",
      },
      relations: { guojing: 10, huangrong: 10 },
      mongolAttitude: 30,
    })
    const resolved = resolveChoice(
      player,
      player.world,
      event,
      "value-choice",
      "claim-seat",
    )!

    expect(resolved.world.arcs.shendiao.variants).toMatchObject({
      "act7.departure": "mongol-command",
      "act8.entry": "mongol-envoy",
      "act8.value": "claim-seat",
      "act8.value-cost": "trust-lost",
    })
    expect(resolved.world.factions.mongol.attitude).toBe(36)
    expect(resolved.player.relations).toMatchObject({
      guojing: 0,
      huangrong: 2,
    })
    expect(resolved.transition).toMatchObject({
      type: "goto",
      nodeId: "value-result-router",
    })
  })
})

describe("value result routing and stage boundary", () => {
  it.each([
    ["save-crowd", "culprit-escaped", "result-crowd-culprit"],
    ["save-crowd", "record-damaged", "result-crowd-record"],
    ["guard-record", "people-hurt", "result-record-people"],
    ["guard-record", "record-damaged", "result-record-damaged"],
    ["pursue-raiders", "people-hurt", "result-pursuit-people"],
    ["pursue-raiders", "record-damaged", "result-pursuit-record"],
    ["claim-seat", "trust-lost", "result-claimed-seat"],
  ] as const)("routes %s / %s to %s", (value, cost, nodeId) => {
    const event = getCrisisEvent()
    const player = makeP3Player({
      variants: {
        "act8.value": value,
        "act8.value-cost": cost,
      },
    })
    expect(resolveBranch(
      player,
      player.world,
      event.nodes["value-result-router"].autoNext!,
    )).toMatchObject({ type: "goto", nodeId })
  })

  it("closes P3 without writing contest or the final act beat", () => {
    const event = getCrisisEvent()
    const player = makeP3Player({
      variants: {
        "act8.value": "save-crowd",
        "act8.value-cost": "culprit-escaped",
      },
    })
    const closed = enterNode(
      player,
      player.world,
      event,
      "crisis-close",
    )!

    expect(closed.world.arcs.shendiao.variants["act8.value-stage"]).toBe("cleared")
    expect(closed.world.arcs.shendiao.variants["act8.contest"]).toBeUndefined()
    expect(closed.world.arcs.shendiao.beats["act8-huashan"]).toBeUndefined()
    expect(closed.player.world).toBe(closed.world)
    expect(getStoryProgress(closed.player)).toMatchObject({
      act: { id: "act8-huashan" },
      recommendedLocationId: "huashan",
      primaryAction: "登绝顶完成论剑",
    })
  })
})
