import { describe, expect, it } from "vitest"
import type { Player } from "../src/types"
import type { WorldState } from "../src/data/story/schema"
import { STORY_VOLUMES } from "../src/data/story"
import { getLocationById } from "../src/data/map"
import { createPlayer } from "../src/game/player"
import { createWorld } from "../src/game/story/state"
import {
  enterNode,
  resolveBattleOutcome,
  resolveBranch,
  resolveChoice,
  visibleChoices,
} from "../src/game/story/engine"
import { getStoryEventByLocation } from "../src/game/story/query"

function makeAct7Player(args: {
  variants?: Record<string, string>
  flags?: Record<string, boolean | number | string>
  relations?: Record<string, number>
  inventory?: Record<string, number>
  mongolAttitude?: number
} = {}): Player {
  const player = createPlayer("第七幕路线")
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
    variants: {
      "act5.wumu-destination": "beggar-network",
      "act6.aftermath": "return-damos",
      ...(args.variants ?? {}),
    },
  }
  world.flags = {
    "shendiao.damos.reworked": true,
    ...(args.flags ?? {}),
  }
  world.factions.mongol = {
    attitude: args.mongolAttitude ?? 0,
    power: 80,
  }
  return {
    ...player,
    world,
    relations: { ...(args.relations ?? {}) },
    inventory: { ...player.inventory, ...(args.inventory ?? {}) },
  }
}

function getAct7Event(eventId: string) {
  const event = STORY_VOLUMES.find((candidate) => candidate.id === eventId)
  if (!event) throw new Error(`Missing event: ${eventId}`)
  return event
}

function resolveVisibleChoice(
  player: Player,
  world: WorldState,
  eventId: string,
  nodeId: string,
  choiceId: string,
) {
  const event = getAct7Event(eventId)
  expect(visibleChoices(player, world, event.nodes[nodeId]).map((choice) => choice.id)).toContain(choiceId)
  return resolveChoice(player, world, event, nodeId, choiceId)!
}

describe("act seven event priority", () => {
  it("moves through damos, western camp and samarkand in order", () => {
    const player = makeAct7Player({
      flags: { "shendiao.damos.growth": "riding" },
      inventory: { "mongol-wolf-tally": 1 },
    })
    const recall = getAct7Event("shendiao-damos-act7")

    expect(getStoryEventByLocation(player, getLocationById("damos")!.events).id).toBe(recall.id)
    expect(visibleChoices(player, player.world, recall.nodes["role-table"]).map((choice) => choice.id)).toEqual([
      "join-command",
      "lead-scouts",
      "manage-rear",
      "remain-independent",
    ])

    const role = resolveVisibleChoice(player, player.world, recall.id, "role-table", "lead-scouts")
    const recallClosed = enterNode(role.player, role.world, recall, "recall-close")!
    expect(recallClosed.world.arcs.shendiao.variants).toMatchObject({
      "act7.role": "scout",
      "act7.recall": "cleared",
    })
    expect(getStoryEventByLocation(
      recallClosed.player,
      getLocationById("western-camp")!.events,
    ).id).toBe("shendiao-western-camp-act7")

    recallClosed.world.arcs.shendiao.variants["act7.camp"] = "cleared"
    expect(getStoryEventByLocation(
      recallClosed.player,
      getLocationById("samarkand")!.events,
    ).id).toBe("shendiao-samarkand-scout-act7")
  })
})

describe("act seven recall roles", () => {
  it.each([
    ["join-command", "command"],
    ["lead-scouts", "scout"],
    ["manage-rear", "logistics"],
    ["remain-independent", "independent"],
  ] as const)("writes %s as the %s role", (choiceId, role) => {
    const player = makeAct7Player({
      flags: { "shendiao.damos.growth": "riding" },
      inventory: { "mongol-wolf-tally": 1 },
    })
    const result = resolveVisibleChoice(
      player,
      player.world,
      "shendiao-damos-act7",
      "role-table",
      choiceId,
    )
    expect(result.world.arcs.shendiao.variants["act7.role"]).toBe(role)
  })
})

describe("act seven camp choices", () => {
  it("uses the multi-enemy partial-capable contract for nonlethal disarmament", () => {
    const player = makeAct7Player({
      variants: {
        "act7.recall": "cleared",
        "act7.role": "command",
      },
    })
    const camp = getAct7Event("shendiao-western-camp-act7")
    const choice = visibleChoices(player, player.world, camp.nodes["orders-break"])
      .find((candidate) => candidate.id === "disarm-both-sides")!

    expect(choice.transition).toMatchObject({
      type: "battle",
      enemyIds: ["mongol-camp-soldier", "mongol-camp-soldier"],
      allyIds: ["guojing", "tuolei"],
      objective: {
        kind: "surviveRounds",
        rounds: 2,
        protectAllyIds: ["guojing", "tuolei"],
        minProtectedSurvivors: 1,
      },
    })

    const partial = resolveBattleOutcome(
      player,
      player.world,
      choice.transition,
      "partial",
    )!
    expect(partial.world.arcs.shendiao.variants["act7.brothers"]).toBe("disarmed")
    expect(partial.then).toMatchObject({ type: "goto", nodeId: "prisoner-yard" })
  })

  it.each([
    ["cross-check-statements", "verified"],
    ["exchange-wounded", "exchanged"],
    ["release-interpreter", "released"],
    ["execute-as-spies", "executed"],
  ] as const)("records prisoner choice %s as %s", (choiceId, result) => {
    const player = makeAct7Player({
      variants: {
        "act7.recall": "cleared",
        "act7.role": "logistics",
      },
    })
    const resolved = resolveVisibleChoice(
      player,
      player.world,
      "shendiao-western-camp-act7",
      "prisoner-yard",
      choiceId,
    )
    expect(resolved.world.arcs.shendiao.variants["act7.prisoners"]).toBe(result)
  })
})

describe("act seven scouting", () => {
  it("turns cavalry reconnaissance into complete, partial or exposed intelligence", () => {
    const player = makeAct7Player({
      variants: {
        "act7.recall": "cleared",
        "act7.camp": "cleared",
        "act7.role": "scout",
        "act7.brothers": "reconciled",
      },
      flags: { "shendiao.damos.growth": "riding" },
      relations: { zhebie: 10 },
    })
    const scout = getAct7Event("shendiao-samarkand-scout-act7")
    const choice = visibleChoices(player, player.world, scout.nodes["gate-method"])
      .find((candidate) => candidate.id === "ride-close-with-jebe")!

    expect(choice.transition).toMatchObject({
      type: "battle",
      enemyIds: ["western-pursuer", "western-pursuer"],
      allyIds: ["zhebie"],
    })

    for (const [outcome, intel] of [
      ["won", "complete"],
      ["lost", "exposed"],
      ["fled", "partial"],
    ] as const) {
      const resolved = resolveBattleOutcome(player, player.world, choice.transition, outcome)!
      expect(resolved.world.arcs.shendiao.variants).toMatchObject({
        "act7.scout-method": "cavalry",
        "act7.intel": intel,
      })
    }
  })

  it("reads logistics, prisoner and independent-route preparation", () => {
    const logistics = makeAct7Player({
      variants: {
        "act7.camp": "cleared",
        "act7.role": "logistics",
        "act7.prisoners": "released",
      },
      flags: { "shendiao.damos.growth": "survival" },
    })

    const supply = resolveVisibleChoice(
      logistics,
      logistics.world,
      "shendiao-samarkand-scout-act7",
      "supply-method",
      "follow-old-water-eye",
    )
    expect(supply.world.arcs.shendiao.variants).toMatchObject({
      "act7.scout-method": "supply",
      "act7.intel": "complete",
    })

    const civilian = resolveVisibleChoice(
      logistics,
      logistics.world,
      "shendiao-samarkand-scout-act7",
      "civilian-method",
      "use-relief-network",
    )
    expect(civilian.world.arcs.shendiao.variants).toMatchObject({
      "act7.scout-method": "civilian",
      "act7.intel": "complete",
    })

    const independent = makeAct7Player({
      variants: {
        "act7.camp": "cleared",
        "act7.role": "independent",
      },
      flags: { "shendiao.damos.growth": "free" },
    })
    const infiltration = resolveVisibleChoice(
      independent,
      independent.world,
      "shendiao-samarkand-scout-act7",
      "infiltration-method",
      "travel-as-merchant",
    )
    expect(infiltration.world.arcs.shendiao.variants).toMatchObject({
      "act7.scout-method": "infiltration",
      "act7.intel": "complete",
    })
  })

  it("writes act7.scout only at the final report node", () => {
    const player = makeAct7Player({
      variants: {
        "act7.camp": "cleared",
        "act7.role": "logistics",
        "act7.scout-method": "supply",
        "act7.intel": "complete",
      },
    })
    const scout = getAct7Event("shendiao-samarkand-scout-act7")
    const reportRoute = resolveBranch(player, player.world, scout.nodes["scout-report-router"].autoNext!)
    expect(reportRoute).toMatchObject({ type: "goto", nodeId: "report-supply" })

    const intelRoute = resolveBranch(player, player.world, scout.nodes["intel-strength-router"].autoNext!)
    expect(intelRoute).toMatchObject({ type: "goto", nodeId: "intel-complete" })
    expect(player.world.arcs.shendiao.variants["act7.scout"]).toBeUndefined()

    const closed = enterNode(player, player.world, scout, "scout-close")!
    expect(closed.world.arcs.shendiao.variants["act7.scout"]).toBe("cleared")
    expect(closed.player.world).toBe(closed.world)
  })
})
