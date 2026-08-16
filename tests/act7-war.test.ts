import { describe, expect, it } from "vitest"
import type { Player } from "../src/types"
import type { StoryEvent, Transition, WorldState } from "../src/data/story/schema"
import { STORY_VOLUMES } from "../src/data/story"
import { getLocationById } from "../src/data/map"
import { getNpcById } from "../src/data/npcs"
import { createPlayer } from "../src/game/player"
import { createWorld } from "../src/game/story/state"
import {
  enterNode,
  resolveBattleOutcome,
  resolveBranch,
  resolveChoice,
  visibleChoices,
} from "../src/game/story/engine"
import { getStoryEventByLocation, getStoryProgress } from "../src/game/story/query"

function makeP4Player(variants: Record<string, string> = {}): Player {
  const player = createPlayer("第七幕战争")
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
      "act5.wumu-destination": "song-command",
      "act6.aftermath": "return-damos",
      "act7.recall": "cleared",
      "act7.camp": "cleared",
      "act7.scout": "cleared",
      "act7.role": "scout",
      "act7.brothers": "reconciled",
      "act7.prisoners": "verified",
      "act7.scout-method": "cavalry",
      "act7.intel": "complete",
      ...variants,
    },
  }
  return { ...player, world }
}

function getEvent(eventId: string): StoryEvent {
  const event = STORY_VOLUMES.find((candidate) => candidate.id === eventId)
  if (!event) throw new Error(`Missing event: ${eventId}`)
  return event
}

function resolveVisibleChoice(
  player: Player,
  world: WorldState,
  event: StoryEvent,
  nodeId: string,
  choiceId: string,
) {
  expect(visibleChoices(player, world, event.nodes[nodeId]).map((choice) => choice.id)).toContain(choiceId)
  return resolveChoice(player, world, event, nodeId, choiceId)!
}

function resolveBattleChoice(
  player: Player,
  event: StoryEvent,
  choiceId: string,
): {
  player: Player
  world: WorldState
  battle: Extract<Transition, { type: "battle" }>
} {
  const choice = resolveVisibleChoice(player, player.world, event, "siege-orders", choiceId)
  const battle = resolveBranch(choice.player, choice.world, choice.transition)
  expect(battle.type).toBe("battle")
  if (battle.type !== "battle") throw new Error(`${choiceId} did not resolve to battle`)
  return { player: choice.player, world: choice.world, battle }
}

describe("act seven P4 event priority", () => {
  it("moves from scouting to siege, city aftermath and then damos", () => {
    const player = makeP4Player()
    const samarkand = getLocationById("samarkand")!

    expect(getStoryEventByLocation(player, samarkand.events).id).toBe("shendiao-samarkand-siege-act7")

    player.world.arcs.shendiao.variants["act7.siege"] = "cleared"
    player.world.arcs.shendiao.variants["act7.siege-outcome"] = "clean"
    expect(getStoryEventByLocation(player, samarkand.events).id).toBe("shendiao-samarkand-aftermath-act7")

    player.world.arcs.shendiao.variants["act7.city"] = "cleared"
    expect(getStoryProgress(player)).toMatchObject({
      recommendedLocationId: "damos",
      primaryAction: "返回草原接南征军令",
    })
  })

  it("registers the two local evacuation allies", () => {
    expect(getNpcById("samarkand-healer")?.locationId).toBe("samarkand")
    expect(getNpcById("samarkand-guide")?.locationId).toBe("samarkand")
  })
})

describe("act seven siege plans", () => {
  const cases = [
    ["order-feint", { "act7.scout-method": "cavalry" }, 2, 3, "feint"],
    ["order-blockade", { "act7.scout-method": "supply", "act7.role": "logistics" }, 2, 3, "blockade"],
    ["order-corridor", { "act7.scout-method": "civilian", "act7.prisoners": "released" }, 2, 3, "corridor"],
    ["order-assault", { "act7.scout-method": "cavalry" }, 3, 4, "assault"],
  ] as const

  it.each(cases)(
    "%s changes enemy composition when intelligence is verified",
    (choiceId, variants, verifiedCount, uncertainCount, plan) => {
      const siege = getEvent("shendiao-samarkand-siege-act7")
      const verified = makeP4Player({ ...variants, "act7.intel": "complete" })
      const verifiedBattle = resolveBattleChoice(verified, siege, choiceId)
      expect(verifiedBattle.battle.enemyIds).toHaveLength(verifiedCount)
      expect(verifiedBattle.world.arcs.shendiao.variants["act7.siege-plan"]).toBe(plan)

      const uncertain = makeP4Player({ ...variants, "act7.intel": "partial" })
      const uncertainBattle = resolveBattleChoice(uncertain, siege, choiceId)
      expect(uncertainBattle.battle.enemyIds).toHaveLength(uncertainCount)
      expect(uncertainBattle.world.arcs.shendiao.variants["act7.siege-plan"]).toBe(plan)
    },
  )

  it.each([
    ["won", "clean"],
    ["partial", "costly"],
    ["lost", "stalled"],
    ["fled", "stalled"],
  ] as const)("maps verified assault outcome %s to %s", (outcome, expected) => {
    const siege = getEvent("shendiao-samarkand-siege-act7")
    const player = makeP4Player({ "act7.intel": "complete" })
    const { battle, world, player: battlePlayer } = resolveBattleChoice(player, siege, "order-assault")
    const resolved = resolveBattleOutcome(battlePlayer, world, battle, outcome)!

    expect(resolved.world.arcs.shendiao.variants["act7.siege-outcome"]).toBe(expected)
    expect(resolved.then).toMatchObject({ type: "goto", nodeId: "siege-plan-router" })
  })

  it("writes act7.siege only at the final siege node", () => {
    const siege = getEvent("shendiao-samarkand-siege-act7")
    const player = makeP4Player({
      "act7.siege-plan": "corridor",
      "act7.siege-outcome": "costly",
    })
    const planRoute = resolveBranch(player, player.world, siege.nodes["siege-plan-router"].autoNext!)
    const outcomeRoute = resolveBranch(player, player.world, siege.nodes["siege-outcome-router"].autoNext!)

    expect(planRoute).toMatchObject({ type: "goto", nodeId: "report-corridor" })
    expect(outcomeRoute).toMatchObject({ type: "goto", nodeId: "siege-costly" })
    expect(player.world.arcs.shendiao.variants["act7.siege"]).toBeUndefined()

    const closed = enterNode(player, player.world, siege, "siege-close")!
    expect(closed.world.arcs.shendiao.variants["act7.siege"]).toBe("cleared")
    expect(closed.player.world).toBe(closed.world)
  })
})

describe("act seven city discipline and evacuation", () => {
  it.each([
    ["hold-one-quarter", "limited"],
    ["allow-plunder", "permissive"],
    ["quietly-secure-route", "limited"],
  ] as const)("records discipline choice %s as %s", (choiceId, expected) => {
    const city = getEvent("shendiao-samarkand-aftermath-act7")
    const player = makeP4Player({
      "act7.siege": "cleared",
      "act7.siege-outcome": "clean",
      "act7.role": "independent",
    })
    const resolved = resolveVisibleChoice(player, player.world, city, "discipline-scene", choiceId)
    expect(resolved.world.arcs.shendiao.variants["act7.discipline"]).toBe(expected)
  })

  it("maps public enforcement battle outcomes to discipline strength", () => {
    const city = getEvent("shendiao-samarkand-aftermath-act7")
    const player = makeP4Player({
      "act7.siege": "cleared",
      "act7.siege-outcome": "costly",
    })
    const choice = resolveVisibleChoice(player, player.world, city, "discipline-scene", "enforce-discipline")
    expect(choice.transition).toMatchObject({
      type: "battle",
      enemyIds: ["mongol-plunderer", "mongol-plunderer"],
      allyIds: ["guojing"],
    })
    if (choice.transition.type !== "battle") return

    expect(resolveBattleOutcome(player, player.world, choice.transition, "won")!
      .world.arcs.shendiao.variants["act7.discipline"]).toBe("enforced")
    expect(resolveBattleOutcome(player, player.world, choice.transition, "lost")!
      .world.arcs.shendiao.variants["act7.discipline"]).toBe("limited")
    expect(resolveBattleOutcome(player, player.world, choice.transition, "fled")!
      .world.arcs.shendiao.variants["act7.discipline"]).toBe("permissive")
  })

  it("uses verified routes to reduce evacuation enemies and allow full success", () => {
    const city = getEvent("shendiao-samarkand-aftermath-act7")
    const verified = makeP4Player({
      "act7.siege": "cleared",
      "act7.siege-outcome": "clean",
      "act7.discipline": "enforced",
      "act7.scout-method": "civilian",
      "act7.intel": "complete",
    })
    const choice = resolveVisibleChoice(
      verified,
      verified.world,
      city,
      "evacuation-choice",
      "open-evacuation-corridor",
    )
    const battle = resolveBranch(choice.player, choice.world, choice.transition)
    expect(battle).toMatchObject({
      type: "battle",
      enemyIds: ["western-pursuer", "mongol-plunderer"],
      objective: {
        protectAllyIds: ["samarkand-healer", "samarkand-guide"],
        minProtectedSurvivors: 1,
      },
    })
    if (battle.type !== "battle") return

    expect(resolveBattleOutcome(choice.player, choice.world, battle, "won")!
      .world.arcs.shendiao.variants["act7.evacuation"]).toBe("full")
    expect(resolveBattleOutcome(choice.player, choice.world, battle, "partial")!
      .world.arcs.shendiao.variants["act7.evacuation"]).toBe("partial")
    expect(resolveBattleOutcome(choice.player, choice.world, battle, "lost")!
      .world.arcs.shendiao.variants["act7.evacuation"]).toBe("failed")
  })

  it("adds another pursuer when the evacuation route is not verified", () => {
    const city = getEvent("shendiao-samarkand-aftermath-act7")
    const player = makeP4Player({
      "act7.siege": "cleared",
      "act7.siege-outcome": "stalled",
      "act7.discipline": "limited",
      "act7.scout-method": "cavalry",
      "act7.intel": "partial",
      "act7.prisoners": "executed",
    })
    const choice = resolveVisibleChoice(
      player,
      player.world,
      city,
      "evacuation-choice",
      "open-evacuation-corridor",
    )
    const battle = resolveBranch(choice.player, choice.world, choice.transition)
    expect(battle.type).toBe("battle")
    if (battle.type !== "battle") return
    expect(battle.enemyIds).toHaveLength(3)
    expect(resolveBattleOutcome(choice.player, choice.world, battle, "won")!
      .world.arcs.shendiao.variants["act7.evacuation"]).toBe("partial")
  })
})

describe("act seven slaughter order", () => {
  it.each([
    ["obey-order", "obeyed"],
    ["delay-order", "delayed"],
    ["defy-with-guojing", "defied"],
    ["warn-inner-city", "betrayed"],
  ] as const)("records %s as %s", (choiceId, expected) => {
    const city = getEvent("shendiao-samarkand-aftermath-act7")
    const player = makeP4Player({
      "act7.siege": "cleared",
      "act7.siege-outcome": "clean",
      "act7.discipline": "enforced",
      "act7.evacuation": "full",
      "act7.role": "independent",
    })
    const resolved = resolveVisibleChoice(player, player.world, city, "slaughter-order", choiceId)
    expect(resolved.world.arcs.shendiao.variants["act7.order"]).toBe(expected)
  })

  it("routes order results and writes act7.city only at the final node", () => {
    const city = getEvent("shendiao-samarkand-aftermath-act7")
    const player = makeP4Player({
      "act7.siege": "cleared",
      "act7.siege-outcome": "clean",
      "act7.discipline": "enforced",
      "act7.evacuation": "full",
      "act7.order": "defied",
    })
    const route = resolveBranch(player, player.world, city.nodes["order-router"].autoNext!)
    expect(route).toMatchObject({ type: "goto", nodeId: "order-defied" })
    expect(player.world.arcs.shendiao.variants["act7.city"]).toBeUndefined()

    const closed = enterNode(player, player.world, city, "city-close")!
    expect(closed.world.arcs.shendiao.variants["act7.city"]).toBe("cleared")
    expect(closed.player.world).toBe(closed.world)
    expect(closed.world.arcs.shendiao.beats["act7-western-campaign"]).toBeUndefined()
  })
})
