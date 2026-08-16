import { describe, expect, it } from "vitest"
import type { Player } from "../src/types"
import type { StoryEvent } from "../src/data/story/schema"
import { STORY_VOLUMES } from "../src/data/story"
import {
  SHENDIAO_ACT8_EVENT_IDS,
} from "../src/data/story/shendiaoAct8"
import { createPlayer } from "../src/game/player"
import { createWorld } from "../src/game/story/state"
import {
  enterNode,
  resolveBranch,
} from "../src/game/story/engine"

const RECORDS = ["full", "contested", "concealed", "falsified"] as const
const VALUES = [
  "save-crowd",
  "guard-record",
  "pursue-raiders",
  "claim-seat",
] as const
const MARTIAL_PATHS = [
  "duel",
  "hold-platform",
  "protect-descent",
  "observe",
  "decline",
] as const

type RecordState = typeof RECORDS[number]
type ValueState = typeof VALUES[number]
type MartialPath = typeof MARTIAL_PATHS[number]
type AuditEnding = "keeper" | "hermit" | "outcast" | "wanderer"

interface EndingCase {
  id: string
  record: RecordState
  value: ValueState
  martialPath: MartialPath
  expected: AuditEnding
}

function expectedEnding(
  record: RecordState,
  value: ValueState,
  martialPath: MartialPath,
): AuditEnding {
  if (
    record === "full"
    && value === "guard-record"
    && ["protect-descent", "observe", "decline"].includes(martialPath)
  ) {
    return "keeper"
  }
  if (
    value === "save-crowd"
    && (martialPath === "observe" || martialPath === "decline")
  ) {
    return "hermit"
  }
  if (record === "falsified") return "outcast"
  return "wanderer"
}

const MATRIX: EndingCase[] = RECORDS.flatMap((record) =>
  VALUES.flatMap((value) =>
    MARTIAL_PATHS.map((martialPath) => ({
      id: `${record}/${value}/${martialPath}`,
      record,
      value,
      martialPath,
      expected: expectedEnding(record, value, martialPath),
    }))
  )
)

function getEpilogue(): StoryEvent {
  const event = STORY_VOLUMES.find(
    (candidate) => candidate.id === SHENDIAO_ACT8_EVENT_IDS.epilogue,
  )
  if (!event) throw new Error("Missing act eight epilogue")
  return event
}

function makeMatrixPlayer(
  testCase: EndingCase,
  args: {
    title?: "recognized" | "contender" | "none"
    karma?: number
  } = {},
): Player {
  const player = createPlayer("第八幕结局审计")
  const world = createWorld()
  const martial = testCase.martialPath === "duel"
    ? "won"
    : testCase.martialPath === "hold-platform"
      ? "held"
      : testCase.martialPath === "protect-descent"
        ? "won"
        : testCase.martialPath === "observe"
          ? "understood"
          : "refused"
  const valueCost = testCase.value === "save-crowd"
    ? "culprit-escaped"
    : testCase.value === "guard-record"
      ? "people-hurt"
      : testCase.value === "pursue-raiders"
        ? "record-damaged"
        : "trust-lost"

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
      "act4.taohua-route": "independent",
      "act7.order": "obeyed",
      "act7.departure": "double-agent",
      "act7.huazheng": "broke-cleanly",
      "act8.entry": "covert-messenger",
      "act8.witnesses": "divided",
      "act8.record": testCase.record,
      "act8.value": testCase.value,
      "act8.value-cost": valueCost,
      "act8.martial-path": testCase.martialPath,
      "act8.martial": martial,
      "act8.title": args.title ?? "none",
      "act8.arrival": "cleared",
      "act8.testimony": "cleared",
      "act8.value-stage": "cleared",
      "act8.contest": "cleared",
    },
  }
  world.factions.mongol = { attitude: 0, power: 80 }

  return {
    ...player,
    karma: args.karma ?? 0,
    relations: {
      guojing: 10,
      huangrong: 10,
      "huangyaoshi-npc": 10,
      hongqigong: 10,
      yideng: 10,
      huazheng: 10,
      munianci: 40,
    },
    world,
  }
}

function resolveEndingNode(player: Player): string {
  const epilogue = getEpilogue()
  const transition = resolveBranch(
    player,
    player.world,
    epilogue.nodes["ending-router"].autoNext!,
  )
  if (transition.type !== "goto") {
    throw new Error(`Unexpected ending transition: ${transition.type}`)
  }
  return transition.nodeId
}

describe("act eight 80-way ending matrix", () => {
  it.each(MATRIX)("$id resolves deterministically to $expected", (testCase) => {
    const epilogue = getEpilogue()
    const player = makeMatrixPlayer(testCase)
    const expectedFactNode = `facts-${testCase.expected}`

    expect(resolveEndingNode(player)).toBe(expectedFactNode)
    expect(resolveEndingNode(player)).toBe(expectedFactNode)

    for (const title of ["recognized", "contender", "none"] as const) {
      expect(resolveEndingNode(makeMatrixPlayer(testCase, { title })))
        .toBe(expectedFactNode)
    }
    for (const karma of [-100, 100]) {
      expect(resolveEndingNode(makeMatrixPlayer(testCase, { karma })))
        .toBe(expectedFactNode)
    }

    const factTransition = resolveBranch(
      player,
      player.world,
      epilogue.nodes[expectedFactNode].autoNext!,
    )
    expect(factTransition).toMatchObject({
      type: "goto",
      nodeId: `ending-${testCase.expected}`,
    })
    if (factTransition.type !== "goto") return

    const ended = enterNode(
      player,
      player.world,
      epilogue,
      factTransition.nodeId,
    )!
    expect(ended.world.arcs.shendiao.variants["act8.ending"])
      .toBe(testCase.expected)
    expect(ended.world.arcs.shendiao.ending).toBe(testCase.expected)
    expect(ended.world.arcs.shendiao.beats["act8-huashan"]).toBe("done")
    expect(ended.player.world).toBe(ended.world)
  })

  it("contains exactly 80 unique combinations", () => {
    expect(MATRIX).toHaveLength(80)
    expect(new Set(MATRIX.map((testCase) => testCase.id)).size).toBe(80)
  })

  it("keeps the neutral audit distribution stable", () => {
    const distribution = MATRIX.reduce<Record<AuditEnding, number>>(
      (result, testCase) => {
        const ending = resolveEndingNode(makeMatrixPlayer(testCase))
          .replace("facts-", "") as AuditEnding
        result[ending]++
        return result
      },
      {
        keeper: 0,
        hermit: 0,
        outcast: 0,
        wanderer: 0,
      },
    )

    expect(distribution).toEqual({
      keeper: 3,
      hermit: 8,
      outcast: 18,
      wanderer: 51,
    })
  })
})
