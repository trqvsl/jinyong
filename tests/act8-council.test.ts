import { describe, expect, it } from "vitest"
import type { Player } from "../src/types"
import type {
  StoryEvent,
  WorldState,
} from "../src/data/story/schema"
import { STORY_VOLUMES } from "../src/data/story"
import { getLocationById } from "../src/data/map"
import {
  SHENDIAO_ACT8_EVENT_IDS,
} from "../src/data/story/shendiaoAct8"
import { createPlayer } from "../src/game/player"
import { createWorld } from "../src/game/story/state"
import {
  enterNode,
  resolveBranch,
  resolveChoice,
  visibleChoices,
} from "../src/game/story/engine"
import {
  getStoryEventByLocation,
  getStoryProgress,
} from "../src/game/story/query"

type Departure =
  | "with-guojing"
  | "escort-refugees"
  | "double-agent"
  | "mongol-command"
  | "grassland-ending"

const RECORD_VALUES = [
  "disclosed",
  "qualified",
  "withheld",
  "distorted",
] as const

function getAct8Event(eventId: string): StoryEvent {
  const event = STORY_VOLUMES.find((candidate) => candidate.id === eventId)
  if (!event) throw new Error(`Missing event: ${eventId}`)
  return event
}

function makeP2Player(args: {
  departure?: Departure
  variants?: Record<string, string>
  relations?: Record<string, number>
  mongolAttitude?: number
} = {}): Player {
  const player = createPlayer("第八幕公议")
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
      "act6.truth-strength": "complete",
      "act6.misunderstanding": "questioning",
      "act6.yangkang-verdict": "captured",
      "act7.discipline": "enforced",
      "act7.evacuation": "full",
      "act7.order": "defied",
      "act7.huazheng": "stayed-loyal",
      "act7.liping": "survived-prepared",
      "act7.departure": args.departure ?? "with-guojing",
      ...(args.variants ?? {}),
    },
  }
  world.npcs.hanxiaoying = {
    alive: true,
    recruited: false,
    faction: "",
    fateTags: [],
  }
  world.npcs.liping = {
    alive: true,
    recruited: false,
    faction: "",
    fateTags: [],
  }
  world.factions.mongol = {
    attitude: args.mongolAttitude ?? 10,
    power: 80,
  }
  return {
    ...player,
    reputation: 0,
    relations: {
      guojing: 30,
      huangrong: 25,
      huazheng: 20,
      liping: 20,
      ...(args.relations ?? {}),
    },
    world,
  }
}

function followAuto(
  player: Player,
  event: StoryEvent,
  startNodeId: string,
): {
  player: Player
  world: WorldState
  path: string[]
} {
  let entered = enterNode(player, player.world, event, startNodeId)
  if (!entered) throw new Error(`Missing node: ${startNodeId}`)
  const path = [entered.node.id]

  for (let index = 0; index < 20 && entered.node.autoNext; index++) {
    const transition = resolveBranch(
      entered.player,
      entered.world,
      entered.node.autoNext,
    )
    if (transition.type === "end") break
    if (transition.type !== "goto") {
      throw new Error(`Unexpected transition from ${entered.node.id}: ${transition.type}`)
    }
    const next = enterNode(
      entered.player,
      entered.world,
      event,
      transition.nodeId,
    )
    if (!next) throw new Error(`Missing node: ${transition.nodeId}`)
    entered = next
    path.push(entered.node.id)
  }

  return {
    player: entered.player,
    world: entered.world,
    path,
  }
}

describe("act eight P2 event priority", () => {
  it("moves from arrival through testimony into the P3 crisis", () => {
    const player = makeP2Player()
    const huashan = getLocationById("huashan")!

    expect(getStoryEventByLocation(player, huashan.events).id)
      .toBe(SHENDIAO_ACT8_EVENT_IDS.arrival)

    player.world.arcs.shendiao.variants["act8.arrival"] = "cleared"
    expect(getStoryEventByLocation(player, huashan.events).id)
      .toBe(SHENDIAO_ACT8_EVENT_IDS.testimony)

    player.world.arcs.shendiao.variants["act8.testimony"] = "cleared"
    expect(getStoryEventByLocation(player, huashan.events).id)
      .toBe(SHENDIAO_ACT8_EVENT_IDS.crisis)

    player.world.arcs.shendiao.variants["act8.value-stage"] = "cleared"
    expect(getStoryEventByLocation(player, huashan.events).id)
      .not.toBe("shendiao-huashan")
  })
})

describe("five Huashan arrivals", () => {
  it.each([
    [
      "with-guojing",
      "arrival-guo-family",
      "guo-company",
      "witness-broad",
      "broad",
    ],
    [
      "escort-refugees",
      "arrival-refugee-witness",
      "refugee-witness",
      "witness-broad",
      "broad",
    ],
    [
      "double-agent",
      "arrival-covert-messenger",
      "covert-messenger",
      "witness-divided",
      "divided",
    ],
    [
      "mongol-command",
      "arrival-mongol-envoy",
      "mongol-envoy",
      "witness-divided",
      "divided",
    ],
    [
      "grassland-ending",
      "arrival-grassland-with-huazheng",
      "grassland-visitor",
      "witness-broad",
      "broad",
    ],
  ] as const)(
    "maps %s to %s with a %s witness roll",
    (departure, arrivalNodeId, entry, witnessNodeId, witnesses) => {
      const event = getAct8Event(SHENDIAO_ACT8_EVENT_IDS.arrival)
      const result = followAuto(
        makeP2Player({ departure }),
        event,
        event.entryNode,
      )

      expect(result.path).toContain(arrivalNodeId)
      expect(result.path).toContain(witnessNodeId)
      expect(result.world.arcs.shendiao.variants).toMatchObject({
        "act8.entry": entry,
        "act8.witnesses": witnesses,
        "act8.arrival": "cleared",
      })
      expect(result.player.world).toBe(result.world)
    },
  )

  it("uses sparse written evidence when a grassland visitor arrives without support", () => {
    const event = getAct8Event(SHENDIAO_ACT8_EVENT_IDS.arrival)
    const result = followAuto(
      makeP2Player({
        departure: "grassland-ending",
        variants: { "act7.huazheng": "led-pursuit" },
        relations: { huazheng: -10 },
      }),
      event,
      event.entryNode,
    )

    expect(result.path).toContain("arrival-grassland-alone")
    expect(result.path).toContain("witness-sparse")
    expect(result.world.arcs.shendiao.variants["act8.witnesses"]).toBe("sparse")
  })
})

describe("Huashan council record order", () => {
  it.each([
    ["old-record-first", "old-record-source"],
    ["war-record-first", "war-record-source"],
  ] as const)("starts with %s but keeps both records reachable", (choiceId, target) => {
    const event = getAct8Event(SHENDIAO_ACT8_EVENT_IDS.testimony)
    const player = makeP2Player({
      variants: {
        "act8.arrival": "cleared",
        "act8.witnesses": "broad",
      },
    })
    const choices = visibleChoices(
      player,
      player.world,
      event.nodes["record-order"],
    )
    expect(choices.map((choice) => choice.id)).toEqual([
      "old-record-first",
      "war-record-first",
    ])

    const resolved = resolveChoice(
      player,
      player.world,
      event,
      "record-order",
      choiceId,
    )!
    expect(resolved.transition).toMatchObject({ type: "goto", nodeId: target })
  })

  it("routes the second record after the first one is written", () => {
    const event = getAct8Event(SHENDIAO_ACT8_EVENT_IDS.testimony)
    const oldFirst = makeP2Player({
      variants: {
        "act8.arrival": "cleared",
        "act8.old-record": "qualified",
      },
    })
    expect(resolveBranch(
      oldFirst,
      oldFirst.world,
      event.nodes["after-old-record"].autoNext!,
    )).toMatchObject({ type: "goto", nodeId: "war-record-source" })

    const warFirst = makeP2Player({
      variants: {
        "act8.arrival": "cleared",
        "act8.war-record": "qualified",
      },
    })
    expect(resolveBranch(
      warFirst,
      warFirst.world,
      event.nodes["after-war-record"].autoNext!,
    )).toMatchObject({ type: "goto", nodeId: "old-record-source" })
  })
})

describe("old case and war record choices", () => {
  it.each([
    ["disclose-old-record", "disclosed"],
    ["qualify-old-record", "qualified"],
    ["withhold-old-record", "withheld"],
    ["distort-old-record", "distorted"],
  ] as const)("writes %s as %s", (choiceId, expected) => {
    const event = getAct8Event(SHENDIAO_ACT8_EVENT_IDS.testimony)
    const player = makeP2Player({ variants: { "act8.arrival": "cleared" } })
    const resolved = resolveChoice(
      player,
      player.world,
      event,
      "old-record-choice",
      choiceId,
    )!

    expect(resolved.world.arcs.shendiao.variants["act8.old-record"]).toBe(expected)
  })

  it.each([
    ["disclose-war-record", "disclosed"],
    ["qualify-war-record", "qualified"],
    ["withhold-war-record", "withheld"],
    ["distort-war-record", "distorted"],
  ] as const)("writes %s as %s", (choiceId, expected) => {
    const event = getAct8Event(SHENDIAO_ACT8_EVENT_IDS.testimony)
    const player = makeP2Player({ variants: { "act8.arrival": "cleared" } })
    const resolved = resolveChoice(
      player,
      player.world,
      event,
      "war-record-choice",
      choiceId,
    )!

    expect(resolved.world.arcs.shendiao.variants["act8.war-record"]).toBe(expected)
  })

  it("makes public responsibility immediately visible in relations and faction attitude", () => {
    const event = getAct8Event(SHENDIAO_ACT8_EVENT_IDS.testimony)
    const player = makeP2Player({
      variants: {
        "act8.arrival": "cleared",
        "act7.departure": "mongol-command",
        "act7.order": "obeyed",
      },
      mongolAttitude: 30,
      relations: { guojing: -10 },
    })
    const resolved = resolveChoice(
      player,
      player.world,
      event,
      "war-record-choice",
      "disclose-war-record",
    )!

    expect(resolved.world.factions.mongol.attitude).toBe(18)
    expect(resolved.player.relations.guojing).toBe(-4)
    expect(resolved.world.arcs.shendiao.variants["act8.entry"]).toBeUndefined()
    expect(resolved.world.arcs.shendiao.variants["act7.departure"])
      .toBe("mongol-command")
  })
})

describe("explicit council record matrix", () => {
  it.each(RECORD_VALUES.flatMap((oldRecord) =>
    RECORD_VALUES.map((warRecord) => [oldRecord, warRecord] as const)
  ))("maps %s x %s deterministically", (oldRecord, warRecord) => {
    const event = getAct8Event(SHENDIAO_ACT8_EVENT_IDS.testimony)
    const player = makeP2Player({
      variants: {
        "act8.arrival": "cleared",
        "act8.old-record": oldRecord,
        "act8.war-record": warRecord,
      },
    })
    const expected = oldRecord === "distorted" || warRecord === "distorted"
      ? "falsified"
      : oldRecord === "withheld" || warRecord === "withheld"
        ? "concealed"
        : oldRecord === "disclosed" && warRecord === "disclosed"
          ? "full"
          : "contested"
    const transition = resolveBranch(
      player,
      player.world,
      event.nodes["record-tally"].autoNext!,
    )
    expect(transition).toMatchObject({
      type: "goto",
      nodeId: `record-${expected}`,
    })
    if (transition.type !== "goto") return

    const entered = enterNode(
      player,
      player.world,
      event,
      transition.nodeId,
    )!
    expect(entered.world.arcs.shendiao.variants["act8.record"]).toBe(expected)
  })

  it("never upgrades corrupted old evidence to a full record", () => {
    const event = getAct8Event(SHENDIAO_ACT8_EVENT_IDS.testimony)
    const player = makeP2Player({
      variants: {
        "act6.truth-strength": "corrupted",
        "act8.arrival": "cleared",
        "act8.old-record": "disclosed",
        "act8.war-record": "disclosed",
      },
    })
    const transition = resolveBranch(
      player,
      player.world,
      event.nodes["record-tally"].autoNext!,
    )

    expect(transition).toMatchObject({
      type: "goto",
      nodeId: "record-contested",
    })
  })
})

describe("P2 stage boundaries", () => {
  it("closes testimony without writing later stages or the act beat", () => {
    const event = getAct8Event(SHENDIAO_ACT8_EVENT_IDS.testimony)
    const player = makeP2Player({
      variants: {
        "act8.arrival": "cleared",
        "act8.old-record": "disclosed",
        "act8.war-record": "disclosed",
        "act8.record": "full",
      },
    })
    const closed = enterNode(
      player,
      player.world,
      event,
      "council-close",
    )!

    expect(closed.world.arcs.shendiao.variants["act8.testimony"]).toBe("cleared")
    expect(closed.world.arcs.shendiao.variants["act8.value-stage"]).toBeUndefined()
    expect(closed.world.arcs.shendiao.variants["act8.contest"]).toBeUndefined()
    expect(closed.world.arcs.shendiao.beats["act8-huashan"]).toBeUndefined()
    expect(closed.player.world).toBe(closed.world)
    expect(getStoryProgress(closed.player)).toMatchObject({
      act: { id: "act8-huashan" },
      recommendedLocationId: "huashan",
      primaryAction: "处理最后军报",
    })
  })
})
