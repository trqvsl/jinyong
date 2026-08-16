import { describe, expect, it } from "vitest"
import type { Player } from "../src/types"
import type {
  StoryEvent,
  Transition,
} from "../src/data/story/schema"
import { STORY_VOLUMES } from "../src/data/story"
import {
  SHENDIAO_ACT8_EVENT_IDS,
} from "../src/data/story/shendiaoAct8"
import { getSkillById } from "../src/data/skills"
import { createPlayer } from "../src/game/player"
import { createWorld } from "../src/game/story/state"
import {
  enterNode,
  resolveBattleOutcome,
  resolveBranch,
  resolveChoice,
  visibleChoices,
} from "../src/game/story/engine"
import { getStoryProgress } from "../src/game/story/query"

type BattleTransition = Extract<Transition, { type: "battle" }>

function getAct8Event(eventId: string): StoryEvent {
  const event = STORY_VOLUMES.find((candidate) => candidate.id === eventId)
  if (!event) throw new Error(`Missing event: ${eventId}`)
  return event
}

function makeP4Player(args: {
  variants?: Record<string, string>
  relations?: Record<string, number>
  reputation?: number
  karma?: number
  mongolAttitude?: number
  skillIds?: string[]
} = {}): Player {
  const player = createPlayer("第八幕论剑")
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
      "act4.taohua-route": "independent",
      "act7.order": "obeyed",
      "act7.departure": "double-agent",
      "act7.huazheng": "broke-cleanly",
      "act8.entry": "covert-messenger",
      "act8.witnesses": "divided",
      "act8.record": "contested",
      "act8.value": "pursue-raiders",
      "act8.value-cost": "record-damaged",
      "act8.arrival": "cleared",
      "act8.testimony": "cleared",
      "act8.value-stage": "cleared",
      ...(args.variants ?? {}),
    },
  }
  world.factions.mongol = {
    attitude: args.mongolAttitude ?? 0,
    power: 80,
  }
  return {
    ...player,
    reputation: args.reputation ?? 30,
    karma: args.karma ?? 0,
    skills: (args.skillIds ?? ["xianglong18"])
      .map((id) => getSkillById(id)!)
      .filter(Boolean),
    relations: {
      guojing: 10,
      huangrong: 10,
      "huangyaoshi-npc": 10,
      hongqigong: 10,
      yideng: 10,
      huazheng: 10,
      munianci: 10,
      ...(args.relations ?? {}),
    },
    world,
  }
}

function battleFor(
  player: Player,
  choiceId: "duel" | "hold-platform" | "protect-descent",
): BattleTransition {
  const event = getAct8Event(SHENDIAO_ACT8_EVENT_IDS.contest)
  const choice = visibleChoices(
    player,
    player.world,
    event.nodes["martial-choice"],
  ).find((candidate) => candidate.id === choiceId)
  if (!choice) throw new Error(`Missing martial choice: ${choiceId}`)
  const transition = resolveBranch(player, player.world, choice.transition)
  if (transition.type !== "battle") {
    throw new Error(`Expected battle for ${choiceId}, got ${transition.type}`)
  }
  return transition
}

function endingRoute(player: Player): string {
  const event = getAct8Event(SHENDIAO_ACT8_EVENT_IDS.epilogue)
  const transition = resolveBranch(
    player,
    player.world,
    event.nodes["ending-router"].autoNext!,
  )
  if (transition.type !== "goto") {
    throw new Error(`Unexpected ending transition: ${transition.type}`)
  }
  return transition.nodeId
}

describe("act eight contest choices", () => {
  it("shows all five paths to a qualified player", () => {
    const event = getAct8Event(SHENDIAO_ACT8_EVENT_IDS.contest)
    const player = makeP4Player({ reputation: 30 })
    expect(visibleChoices(
      player,
      player.world,
      event.nodes["martial-choice"],
    ).map((choice) => choice.id)).toEqual([
      "duel",
      "hold-platform",
      "protect-descent",
      "observe",
      "decline",
    ])
  })

  it("keeps protect, observe, and decline available without combat prestige", () => {
    const event = getAct8Event(SHENDIAO_ACT8_EVENT_IDS.contest)
    const player = makeP4Player({ reputation: 0, skillIds: [] })
    expect(visibleChoices(
      player,
      player.world,
      event.nodes["martial-choice"],
    ).map((choice) => choice.id)).toEqual([
      "protect-descent",
      "observe",
      "decline",
    ])
  })
})

describe("duel opponent injection", () => {
  it.each([
    [
      {
        relations: { "ouyangfeng-npc": 20 },
      },
      "ouyangfeng",
    ],
    [
      {
        variants: { "act4.taohua-route": "guo-huang" },
        relations: { "huangyaoshi-npc": 20 },
      },
      "huangyaoshi",
    ],
    [
      {
        variants: { "act4.taohua-route": "independent" },
        relations: {
          "ouyangfeng-npc": 0,
          "huangyaoshi-npc": 0,
        },
      },
      "guojing",
    ],
  ] as const)("selects the expected duel opponent", (args, enemyId) => {
    expect(battleFor(makeP4Player(args), "duel").enemyId).toBe(enemyId)
  })

  it.each([
    ["won", "won"],
    ["lost", "lost"],
    ["fled", "lost"],
  ] as const)("writes duel %s as %s", (outcome, martial) => {
    const player = makeP4Player({
      relations: {
        "ouyangfeng-npc": 0,
        "huangyaoshi-npc": 0,
      },
    })
    const resolved = resolveBattleOutcome(
      player,
      player.world,
      battleFor(player, "duel"),
      outcome,
    )!
    expect(resolved.world.arcs.shendiao.variants).toMatchObject({
      "act8.martial-path": "duel",
      "act8.martial": martial,
    })
    expect(resolved.then).toMatchObject({ type: "goto", nodeId: "title-router" })
  })
})

describe("hold platform and protect descent", () => {
  it("uses four rounds, three challengers, and a two-master partial objective", () => {
    const battle = battleFor(makeP4Player(), "hold-platform")
    expect(battle.enemyIds).toHaveLength(3)
    expect(battle.objective).toMatchObject({
      kind: "surviveRounds",
      rounds: 4,
      protectAllyIds: ["hongqigong", "huangyaoshi-npc"],
      minProtectedSurvivors: 1,
    })
    expect(battle.onPartial).toBeDefined()
  })

  it.each([
    ["won", "held"],
    ["partial", "partial"],
    ["lost", "lost"],
    ["fled", "lost"],
  ] as const)("writes hold-platform %s as %s", (outcome, martial) => {
    const player = makeP4Player()
    const resolved = resolveBattleOutcome(
      player,
      player.world,
      battleFor(player, "hold-platform"),
      outcome,
    )!
    expect(resolved.world.arcs.shendiao.variants).toMatchObject({
      "act8.martial-path": "hold-platform",
      "act8.martial": martial,
    })
  })

  it("reduces protect-descent enemies when record and value preparation align", () => {
    const prepared = battleFor(makeP4Player({
      variants: {
        "act8.record": "full",
        "act8.value": "guard-record",
      },
    }), "protect-descent")
    const exposed = battleFor(makeP4Player({
      variants: {
        "act8.record": "contested",
        "act8.value": "pursue-raiders",
      },
    }), "protect-descent")

    expect(prepared.enemyIds).toHaveLength(2)
    expect(prepared.objective).toMatchObject({
      protectAllyIds: ["huangrong", "kezhene", "samarkand-guide"],
      minProtectedSurvivors: 2,
    })
    expect(exposed.enemyIds).toHaveLength(3)
    expect(exposed.objective).toMatchObject({
      protectAllyIds: ["huangrong", "samarkand-guide"],
      minProtectedSurvivors: 1,
    })
  })

  it.each([
    ["won", "won"],
    ["partial", "partial"],
    ["lost", "lost"],
    ["fled", "lost"],
  ] as const)("writes protect-descent %s as %s", (outcome, martial) => {
    const player = makeP4Player({
      variants: {
        "act8.record": "full",
        "act8.value": "save-crowd",
      },
    })
    const resolved = resolveBattleOutcome(
      player,
      player.world,
      battleFor(player, "protect-descent"),
      outcome,
    )!
    expect(resolved.world.arcs.shendiao.variants).toMatchObject({
      "act8.martial-path": "protect-descent",
      "act8.martial": martial,
    })
  })
})

describe("observe and decline", () => {
  it.each([
    [["hamagong"], {}, "observe-reversed-meridians"],
    [["xianglong18"], {}, "observe-hard-soft"],
    [["changquan"], { "huangyaoshi-npc": 25 }, "observe-changing-steps"],
    [["changquan"], {}, "observe-breathing"],
  ] as const)("routes learned skills to an observation result", (skillIds, relations, nodeId) => {
    const event = getAct8Event(SHENDIAO_ACT8_EVENT_IDS.contest)
    const player = makeP4Player({ skillIds: [...skillIds], relations })
    const chosen = resolveChoice(
      player,
      player.world,
      event,
      "martial-choice",
      "observe",
    )!
    const route = resolveBranch(
      chosen.player,
      chosen.world,
      event.nodes["observe-router"].autoNext!,
    )
    expect(route).toMatchObject({ type: "goto", nodeId })
    if (route.type !== "goto") return

    const entered = enterNode(
      chosen.player,
      chosen.world,
      event,
      route.nodeId,
    )!
    expect(entered.world.arcs.shendiao.variants).toMatchObject({
      "act8.martial-path": "observe",
      "act8.martial": "understood",
    })
  })

  it("records an explicit decline without treating it as a loss", () => {
    const event = getAct8Event(SHENDIAO_ACT8_EVENT_IDS.contest)
    const player = makeP4Player()
    const resolved = resolveChoice(
      player,
      player.world,
      event,
      "martial-choice",
      "decline",
    )!
    expect(resolved.world.arcs.shendiao.variants).toMatchObject({
      "act8.martial-path": "decline",
      "act8.martial": "refused",
    })
  })
})

describe("hidden martial title", () => {
  it.each([
    ["duel", "won"],
    ["hold-platform", "held"],
  ] as const)("recognizes a qualified %s result", (path, martial) => {
    const event = getAct8Event(SHENDIAO_ACT8_EVENT_IDS.contest)
    const player = makeP4Player({
      reputation: 50,
      skillIds: ["xianglong18"],
      relations: { hongqigong: 25 },
      variants: {
        "act8.witnesses": "broad",
        "act8.martial-path": path,
        "act8.martial": martial,
      },
    })
    const route = resolveBranch(
      player,
      player.world,
      event.nodes["title-router"].autoNext!,
    )
    expect(route).toMatchObject({ type: "goto", nodeId: "title-recognized" })
    if (route.type !== "goto") return
    const entered = enterNode(player, player.world, event, route.nodeId)!
    expect(entered.world.arcs.shendiao.variants["act8.title"])
      .toBe("recognized")
  })

  it.each([
    ["duel", "won", 30, "title-contender"],
    ["protect-descent", "won", 60, "title-contender"],
    ["observe", "understood", 60, "title-none"],
    ["hold-platform", "partial", 60, "title-none"],
  ] as const)("routes %s / %s at reputation %d to %s", (path, martial, reputation, nodeId) => {
    const event = getAct8Event(SHENDIAO_ACT8_EVENT_IDS.contest)
    const player = makeP4Player({
      reputation,
      variants: {
        "act8.martial-path": path,
        "act8.martial": martial,
      },
    })
    expect(resolveBranch(
      player,
      player.world,
      event.nodes["title-router"].autoNext!,
    )).toMatchObject({ type: "goto", nodeId })
  })
})

describe("contest stage boundary", () => {
  it("closes contest without writing the final act beat", () => {
    const event = getAct8Event(SHENDIAO_ACT8_EVENT_IDS.contest)
    const player = makeP4Player({
      variants: {
        "act8.martial-path": "observe",
        "act8.martial": "understood",
        "act8.title": "none",
      },
    })
    const closed = enterNode(
      player,
      player.world,
      event,
      "contest-close",
    )!
    expect(closed.world.arcs.shendiao.variants["act8.contest"]).toBe("cleared")
    expect(closed.world.arcs.shendiao.variants["act8.ending"]).toBeUndefined()
    expect(closed.world.arcs.shendiao.beats["act8-huashan"]).toBeUndefined()
    expect(getStoryProgress(closed.player)).toMatchObject({
      primaryAction: "确认射雕卷最终去向",
      recommendedLocationId: "huashan",
    })
  })
})

const ENDING_FIXTURES = [
  {
    ending: "commander",
    variants: {
      "act7.departure": "mongol-command",
      "act8.value": "claim-seat",
      "act8.martial-path": "duel",
      "act8.record": "falsified",
    },
    relations: { guojing: -20, huangrong: -20 },
    mongolAttitude: 30,
  },
  {
    ending: "grassland",
    variants: {
      "act7.departure": "grassland-ending",
      "act8.record": "contested",
      "act8.value": "save-crowd",
      "act8.martial-path": "decline",
    },
  },
  {
    ending: "taohua",
    variants: {
      "act4.taohua-route": "guo-huang",
      "act7.departure": "with-guojing",
      "act7.order": "defied",
      "act8.record": "full",
      "act8.value": "guard-record",
      "act8.martial-path": "observe",
    },
    relations: {
      huangrong: 40,
      "huangyaoshi-npc": 30,
      guojing: 30,
    },
  },
  {
    ending: "hero",
    variants: {
      "act7.departure": "escort-refugees",
      "act7.order": "defied",
      "act8.record": "full",
      "act8.value": "guard-record",
      "act8.martial-path": "protect-descent",
    },
    relations: { guojing: 30 },
  },
  {
    ending: "keeper",
    variants: {
      "act7.departure": "double-agent",
      "act7.order": "obeyed",
      "act8.record": "full",
      "act8.value": "guard-record",
      "act8.martial-path": "protect-descent",
    },
    relations: { guojing: 5 },
  },
  {
    ending: "hermit",
    variants: {
      "act7.departure": "double-agent",
      "act8.record": "contested",
      "act8.value": "save-crowd",
      "act8.martial-path": "observe",
    },
    relations: { munianci: 40 },
  },
  {
    ending: "outcast",
    variants: {
      "act7.departure": "double-agent",
      "act8.record": "falsified",
      "act8.value": "save-crowd",
      "act8.martial-path": "duel",
    },
  },
  {
    ending: "wanderer",
    variants: {
      "act7.departure": "double-agent",
      "act8.record": "contested",
      "act8.value": "pursue-raiders",
      "act8.martial-path": "observe",
    },
  },
] as const

describe("explicit ending priority", () => {
  it.each(ENDING_FIXTURES)("routes the $ending fixture", (fixture) => {
    const event = getAct8Event(SHENDIAO_ACT8_EVENT_IDS.epilogue)
    const player = makeP4Player({
      variants: {
        ...fixture.variants,
        "act8.contest": "cleared",
      },
      relations: "relations" in fixture ? fixture.relations : {},
      mongolAttitude: "mongolAttitude" in fixture
        ? fixture.mongolAttitude
        : 0,
    })
    const route = endingRoute(player)
    expect(route).toBe(`facts-${fixture.ending}`)

    const factTransition = resolveBranch(
      player,
      player.world,
      event.nodes[route].autoNext!,
    )
    expect(factTransition).toMatchObject({
      type: "goto",
      nodeId: `ending-${fixture.ending}`,
    })
    if (factTransition.type !== "goto") return

    const ended = enterNode(
      player,
      player.world,
      event,
      factTransition.nodeId,
    )!
    expect(ended.world.arcs.shendiao.variants["act8.ending"])
      .toBe(fixture.ending)
    expect(ended.world.arcs.shendiao.ending).toBe(fixture.ending)
    expect(ended.world.arcs.shendiao.beats["act8-huashan"]).toBe("done")
    expect(ended.player.world).toBe(ended.world)
  })

  it("keeps commander above falsified outcast", () => {
    const fixture = ENDING_FIXTURES[0]
    const player = makeP4Player({
      variants: {
        ...fixture.variants,
        "act8.contest": "cleared",
      },
      relations: fixture.relations,
      mongolAttitude: fixture.mongolAttitude,
    })
    expect(endingRoute(player)).toBe("facts-commander")
  })

  it("keeps grassland above Taohua and hero overlaps", () => {
    const player = makeP4Player({
      variants: {
        "act4.taohua-route": "guo-huang",
        "act7.departure": "grassland-ending",
        "act7.huazheng": "stayed-loyal",
        "act7.order": "defied",
        "act8.record": "full",
        "act8.value": "guard-record",
        "act8.martial-path": "observe",
        "act8.contest": "cleared",
      },
      relations: {
        huazheng: 40,
        huangrong: 40,
        "huangyaoshi-npc": 30,
        guojing: 30,
      },
    })
    expect(endingRoute(player)).toBe("facts-grassland")
  })

  it("keeps Taohua above hero when both conditions hold", () => {
    const fixture = ENDING_FIXTURES[2]
    const player = makeP4Player({
      variants: {
        ...fixture.variants,
        "act8.contest": "cleared",
      },
      relations: fixture.relations,
    })
    expect(endingRoute(player)).toBe("facts-taohua")
  })

  it("keeps hero above keeper when both conditions hold", () => {
    const fixture = ENDING_FIXTURES[3]
    const player = makeP4Player({
      variants: {
        ...fixture.variants,
        "act8.contest": "cleared",
      },
      relations: fixture.relations,
    })
    expect(endingRoute(player)).toBe("facts-hero")
  })

  it("does not let the hidden title override an ending", () => {
    const fixture = ENDING_FIXTURES[7]
    const none = makeP4Player({
      variants: {
        ...fixture.variants,
        "act8.title": "none",
        "act8.contest": "cleared",
      },
    })
    const recognized = makeP4Player({
      variants: {
        ...fixture.variants,
        "act8.title": "recognized",
        "act8.contest": "cleared",
      },
    })
    expect(endingRoute(none)).toBe("facts-wanderer")
    expect(endingRoute(recognized)).toBe("facts-wanderer")
  })

  it("does not let karma alone decide an ending", () => {
    const fixture = ENDING_FIXTURES[7]
    const righteous = makeP4Player({
      karma: 100,
      variants: {
        ...fixture.variants,
        "act8.contest": "cleared",
      },
    })
    const wicked = makeP4Player({
      karma: -100,
      variants: {
        ...fixture.variants,
        "act8.contest": "cleared",
      },
    })
    expect(endingRoute(righteous)).toBe("facts-wanderer")
    expect(endingRoute(wicked)).toBe("facts-wanderer")
  })
})

describe("final beat ownership", () => {
  it("writes act8-huashan only in the eight ending nodes", () => {
    const event = getAct8Event(SHENDIAO_ACT8_EVENT_IDS.epilogue)
    const endingNodeIds = Object.keys(event.nodes)
      .filter((nodeId) =>
        nodeId.startsWith("ending-")
        && nodeId !== "ending-facts"
        && nodeId !== "ending-router"
      )
    expect(endingNodeIds).toHaveLength(8)

    for (const [nodeId, node] of Object.entries(event.nodes)) {
      const writesBeat = (node.onEnter ?? []).some(
        (consequence) => consequence.kind === "arcBeat"
          && consequence.arcId === "shendiao"
          && consequence.beat === "act8-huashan",
      )
      expect(writesBeat, nodeId).toBe(endingNodeIds.includes(nodeId))
    }
  })

  it("shows the completed modern eight-act guidance after an ending", () => {
    const event = getAct8Event(SHENDIAO_ACT8_EVENT_IDS.epilogue)
    const player = makeP4Player({
      variants: {
        "act8.contest": "cleared",
        "act8.martial-path": "observe",
      },
    })
    const ended = enterNode(
      player,
      player.world,
      event,
      "ending-wanderer",
    )!
    expect(getStoryProgress(ended.player)).toMatchObject({
      completed: 8,
      total: 8,
      primaryAction: "重访华山旧地",
      next: "射雕卷现代八幕已完整收束，可继续游历并查看人物与世界回响。",
    })
  })
})
