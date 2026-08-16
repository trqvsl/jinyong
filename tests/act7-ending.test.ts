import { describe, expect, it } from "vitest"
import type { Player } from "../src/types"
import type { StoryEvent, WorldState } from "../src/data/story/schema"
import { STORY_VOLUMES } from "../src/data/story"
import { getLocationById } from "../src/data/map"
import { createPlayer } from "../src/game/player"
import { createWorld } from "../src/game/story/state"
import {
  enterNode,
  resolveBranch,
  resolveChoice,
  visibleChoices,
} from "../src/game/story/engine"
import { getStoryEventByLocation, getStoryProgress } from "../src/game/story/query"

function makeP5Player(args: {
  variants?: Record<string, string>
  flags?: Record<string, boolean | number | string>
  relations?: Record<string, number>
  inventory?: Record<string, number>
} = {}): Player {
  const player = createPlayer("第七幕终局")
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
      "act7.recall": "cleared",
      "act7.camp": "cleared",
      "act7.scout": "cleared",
      "act7.siege": "cleared",
      "act7.city": "cleared",
      "act7.role": "command",
      "act7.discipline": "enforced",
      "act7.evacuation": "full",
      "act7.order": "defied",
      ...(args.variants ?? {}),
    },
  }
  world.flags = {
    "shendiao.niujia.saved_liping": true,
    "shendiao.damos.growth": "survival",
    ...(args.flags ?? {}),
  }
  return {
    ...player,
    world,
    relations: {
      huazheng: 25,
      liping: 20,
      guojing: 30,
      ...(args.relations ?? {}),
    },
    inventory: { ...player.inventory, ...(args.inventory ?? {}) },
  }
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

function enterChoiceTarget(
  player: Player,
  event: StoryEvent,
  nodeId: string,
  choiceId: string,
) {
  const resolved = resolveVisibleChoice(player, player.world, event, nodeId, choiceId)
  const transition = resolveBranch(resolved.player, resolved.world, resolved.transition)
  expect(transition.type).toBe("goto")
  if (transition.type !== "goto") throw new Error(`${choiceId} did not resolve to goto`)
  return enterNode(resolved.player, resolved.world, event, transition.nodeId)!
}

describe("act seven P5 event priority", () => {
  it("moves from home order to departure and then act eight", () => {
    const player = makeP5Player()
    const damos = getLocationById("damos")!

    expect(getStoryEventByLocation(player, damos.events).id).toBe("shendiao-damos-home-order-act7")
    player.world.arcs.shendiao.variants["act7.home-order"] = "cleared"
    expect(getStoryEventByLocation(player, damos.events).id).toBe("shendiao-damos-departure-act7")

    player.world.arcs.shendiao.beats["act7-western-campaign"] = "done"
    expect(getStoryProgress(player).act.id).toBe("act8-huashan")
  })
})

describe("Hua Zheng autonomous outcomes", () => {
  it.each([
    ["tell-huazheng-truth", { "act7.order": "defied" }, { huazheng: 20 }, "helped-escape"],
    ["tell-huazheng-truth", { "act7.order": "obeyed" }, { huazheng: 20 }, "broke-ties"],
    ["leave-huazheng-out", { "act7.order": "delayed" }, { huazheng: 20 }, "stayed-loyal"],
    ["deceive-huazheng", { "act7.order": "betrayed" }, { huazheng: 5 }, "led-pursuit"],
  ] as const)("maps %s to %s", (choiceId, variants, relations, expected) => {
    const home = getEvent("shendiao-damos-home-order-act7")
    const player = makeP5Player({ variants, relations })
    const entered = enterChoiceTarget(player, home, "huazheng-choice", choiceId)

    expect(entered.world.arcs.shendiao.variants["act7.huazheng"]).toBe(expected)
  })

  it("requires both trust and a non-obedience route when asking for help", () => {
    const home = getEvent("shendiao-damos-home-order-act7")
    const trusted = makeP5Player({
      variants: { "act7.order": "delayed" },
      relations: { huazheng: 20 },
    })
    const helped = enterChoiceTarget(trusted, home, "huazheng-choice", "ask-huazheng-help")
    expect(helped.world.arcs.shendiao.variants["act7.huazheng"]).toBe("helped-escape")

    const obeyed = makeP5Player({
      variants: { "act7.order": "obeyed" },
      relations: { huazheng: 30 },
    })
    const broken = enterChoiceTarget(obeyed, home, "huazheng-choice", "ask-huazheng-help")
    expect(broken.world.arcs.shendiao.variants["act7.huazheng"]).toBe("broke-ties")
  })
})

describe("Li Ping ending threshold", () => {
  const preparedChoice = "offer-prepared-route"

  it("shows the survival option only when all four requirement groups pass", () => {
    const home = getEvent("shendiao-damos-home-order-act7")
    const player = makeP5Player({
      variants: { "act7.huazheng": "helped-escape" },
    })
    expect(visibleChoices(player, player.world, home.nodes["liping-tent"]).map((choice) => choice.id))
      .toContain(preparedChoice)
  })

  it.each([
    ["no full evacuation", { "act7.evacuation": "partial" }, {}, { "shendiao.niujia.saved_liping": true }],
    ["no explicit defiance", { "act7.order": "delayed" }, {}, { "shendiao.niujia.saved_liping": true }],
    ["no trusted support", { "act5.wumu-destination": "player-kept", "act7.huazheng": "stayed-loyal" }, {}, { "shendiao.niujia.saved_liping": true }],
    ["no long-term trust", { "act7.huazheng": "helped-escape" }, { liping: 0 }, { "shendiao.niujia.saved_liping": false, "shendiao.damos.growth": "riding" }],
  ] as const)("hides survival with %s", (_label, variants, relations, flags) => {
    const home = getEvent("shendiao-damos-home-order-act7")
    const player = makeP5Player({ variants, relations, flags })
    expect(visibleChoices(player, player.world, home.nodes["liping-tent"]).map((choice) => choice.id))
      .not.toContain(preparedChoice)
  })

  it.each([
    ["offer-prepared-route", "liping-survives", "survived-prepared", true],
    ["guard-rear-exit", "liping-covers-retreat", "died-covering-retreat", false],
    ["let-liping-answer", "liping-testimony", "died-testimony", false],
  ] as const)("records %s as %s", (choiceId, targetNode, expected, alive) => {
    const home = getEvent("shendiao-damos-home-order-act7")
    const player = makeP5Player({
      variants: { "act7.huazheng": "helped-escape" },
    })
    const choice = resolveVisibleChoice(player, player.world, home, "liping-tent", choiceId)
    expect(choice.transition).toMatchObject({ type: "goto", nodeId: targetNode })
    const entered = enterNode(choice.player, choice.world, home, targetNode)!

    expect(entered.world.arcs.shendiao.variants["act7.liping"]).toBe(expected)
    expect(entered.world.npcs.liping.alive).toBe(alive)
  })
})

describe("act seven departures", () => {
  it.each([
    ["leave-with-guojing", { "act7.order": "defied", "act7.huazheng": "helped-escape" }, {}, "with-guojing"],
    ["escort-refugees", { "act7.order": "betrayed", "act7.evacuation": "full" }, {}, "escort-refugees"],
    ["remain-double-agent", { "act7.order": "delayed", "act7.role": "command" }, {}, "double-agent"],
    ["keep-mongol-command", { "act7.order": "obeyed" }, {}, "mongol-command"],
    ["choose-grassland-ending", { "act7.order": "delayed", "act7.huazheng": "stayed-loyal" }, {}, "grassland-ending"],
  ] as const)("records %s as %s", (choiceId, variants, inventory, expected) => {
    const departure = getEvent("shendiao-damos-departure-act7")
    const player = makeP5Player({
      variants: { "act7.home-order": "cleared", ...variants },
      inventory,
    })
    const resolved = resolveVisibleChoice(player, player.world, departure, "departure-choice", choiceId)
    expect(resolved.world.arcs.shendiao.variants["act7.departure"]).toBe(expected)
  })

  it("permanently closes Guo Jing companionship after obeying the massacre order", () => {
    const departure = getEvent("shendiao-damos-departure-act7")
    const player = makeP5Player({
      variants: {
        "act7.home-order": "cleared",
        "act7.order": "obeyed",
        "act7.evacuation": "failed",
        "act7.huazheng": "broke-ties",
      },
    })
    const choices = visibleChoices(player, player.world, departure.nodes["departure-choice"])
      .map((choice) => choice.id)
    expect(choices).not.toContain("leave-with-guojing")
    expect(choices).toContain("keep-mongol-command")
  })

  it("uses Li Ping survival to choose the family departure version", () => {
    const departure = getEvent("shendiao-damos-departure-act7")
    const player = makeP5Player({
      variants: {
        "act7.home-order": "cleared",
        "act7.departure": "with-guojing",
        "act7.liping": "survived-prepared",
      },
    })
    const route = resolveBranch(player, player.world, departure.nodes["with-guojing-router"].autoNext!)
    expect(route).toMatchObject({ type: "goto", nodeId: "departure-with-family" })
  })

  it("writes the act beat only at the final completion node", () => {
    const departure = getEvent("shendiao-damos-departure-act7")
    const player = makeP5Player({
      variants: {
        "act7.home-order": "cleared",
        "act7.departure": "with-guojing",
        "act7.liping": "died-testimony",
      },
    })
    expect(player.world.arcs.shendiao.beats["act7-western-campaign"]).toBeUndefined()

    const completed = enterNode(player, player.world, departure, "act7-complete")!
    expect(completed.world.arcs.shendiao.beats["act7-western-campaign"]).toBe("done")
    expect(completed.player.world).toBe(completed.world)
    expect(getStoryProgress(completed.player).act.id).toBe("act8-huashan")
  })
})
