import { describe, expect, it } from "vitest"
import type { Player } from "../src/types"
import type {
  StoryEvent,
  StoryBattleObjective,
  Transition,
} from "../src/data/story/schema"
import type {
  BattleObjectiveConfig,
  BattleState,
  Combatant,
} from "../src/game/battle"
import { STORY_VOLUMES } from "../src/data/story"
import { getLocationById } from "../src/data/map"
import { createPlayer } from "../src/game/player"
import { createWorld } from "../src/game/story/state"
import {
  checkBattleEndBySide,
  createBattleObjective,
} from "../src/game/battle"
import { checkCondition } from "../src/game/story/conditions"
import {
  resolveBranch,
  visibleChoices,
} from "../src/game/story/engine"
import {
  getStoryEventByLocation,
  getStoryProgress,
} from "../src/game/story/query"

const ACT7_EVENT_IDS = [
  "shendiao-damos-act7",
  "shendiao-western-camp-act7",
  "shendiao-samarkand-scout-act7",
  "shendiao-samarkand-siege-act7",
  "shendiao-samarkand-aftermath-act7",
  "shendiao-damos-home-order-act7",
  "shendiao-damos-departure-act7",
] as const

const WUMU_ROUTES = [
  ["song-command", "wumu-song-command"],
  ["beggar-network", "wumu-beggar-network"],
  ["player-kept", "wumu-player-kept"],
  ["mongol-copy", "wumu-mongol-copy"],
] as const

const GROWTH_ROUTES = [
  ["martial", "command", "cavalry"],
  ["riding", "scout", "cavalry"],
  ["survival", "logistics", "supply"],
  ["free", "independent", "infiltration"],
] as const

function getEvent(eventId: string): StoryEvent {
  const event = STORY_VOLUMES.find((candidate) => candidate.id === eventId)
  if (!event) throw new Error(`Missing event: ${eventId}`)
  return event
}

function makeAuditPlayer(args: {
  variants?: Record<string, string>
  flags?: Record<string, boolean | number | string>
  relations?: Record<string, number>
} = {}): Player {
  const player = createPlayer("第七幕审计")
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
      "act6.aftermath": "return-damos",
      "act7.recall": "cleared",
      "act7.camp": "cleared",
      "act7.scout": "cleared",
      "act7.brothers": "reconciled",
      "act7.prisoners": "verified",
      "act7.intel": "complete",
      ...(args.variants ?? {}),
    },
  }
  world.flags = {
    "shendiao.niujia.saved_liping": true,
    ...(args.flags ?? {}),
  }
  return {
    ...player,
    world,
    relations: {
      zhebie: 15,
      liping: 20,
      huazheng: 20,
      ...(args.relations ?? {}),
    },
  }
}

interface StoryBattleRef {
  event: StoryEvent
  battle: Extract<Transition, { type: "battle" }>
}

function collectBattles(
  event: StoryEvent,
  transition: Transition | undefined,
  battles: StoryBattleRef[],
) {
  if (!transition) return
  switch (transition.type) {
    case "branch":
      transition.cases.forEach((item) => collectBattles(event, item.then, battles))
      collectBattles(event, transition.else, battles)
      break
    case "random":
      transition.cases.forEach((item) => collectBattles(event, item.then, battles))
      break
    case "battle":
      battles.push({ event, battle: transition })
      collectBattles(event, transition.onWin?.then, battles)
      collectBattles(event, transition.onPartial?.then, battles)
      collectBattles(event, transition.onLose?.then, battles)
      collectBattles(event, transition.onFlee?.then, battles)
      break
  }
}

function allAct7Battles(): StoryBattleRef[] {
  const battles: StoryBattleRef[] = []
  for (const eventId of ACT7_EVENT_IDS) {
    const event = getEvent(eventId)
    for (const node of Object.values(event.nodes)) {
      collectBattles(event, node.autoNext, battles)
      node.choices?.forEach((choice) => collectBattles(event, choice.transition, battles))
    }
  }
  return battles
}

function protectedIds(objective?: StoryBattleObjective): string[] {
  if (!objective) return []
  return Array.from(new Set([
    ...(objective.protectAllyIds ?? []),
    ...(objective.protectAllyId ? [objective.protectAllyId] : []),
  ]))
}

function makeUnit(uid: string, side: "player" | "enemy", hp = 100): Combatant {
  return {
    uid,
    side,
    name: uid,
    hp,
    hpMax: 100,
    mp: 0,
    mpMax: 0,
    attack: 10,
    defense: 5,
    speed: 10,
    statuses: [],
    skills: [],
    atb: 0,
  }
}

function runtimeObjective(objective: StoryBattleObjective): BattleState["objective"] {
  const ids = protectedIds(objective)
  const protection = {
    protectUids: ids,
    minProtectedSurvivors: objective.minProtectedSurvivors,
  }
  const config: BattleObjectiveConfig = objective.kind === "surviveRounds"
    ? { kind: "surviveRounds", rounds: objective.rounds, ...protection }
    : { kind: "defeatAll", ...protection }
  const runtime = createBattleObjective(config)!
  if (runtime.kind === "surviveRounds") runtime.completedRounds = runtime.targetRounds
  return runtime
}

describe("act seven 16-way input matrix", () => {
  it("keeps all Wumu destinations and Damos growth routes playable", () => {
    const recall = getEvent("shendiao-damos-act7")
    const camp = getEvent("shendiao-western-camp-act7")
    const scout = getEvent("shendiao-samarkand-scout-act7")
    const siege = getEvent("shendiao-samarkand-siege-act7")

    for (const [wumu, expectedWumuNode] of WUMU_ROUTES) {
      for (const [growth, role, scoutMethod] of GROWTH_ROUTES) {
        const player = makeAuditPlayer({
          variants: {
            "act5.wumu-destination": wumu,
            "act7.role": role,
            "act7.scout-method": scoutMethod,
          },
          flags: { "shendiao.damos.growth": growth },
        })
        const label = `${wumu} × ${growth}`

        expect(
          resolveBranch(player, player.world, recall.nodes["wumu-route"].autoNext!),
          `${label}: Wumu branch`,
        ).toMatchObject({ type: "goto", nodeId: expectedWumuNode })

        const roleChoices = visibleChoices(player, player.world, recall.nodes["role-table"])
          .map((choice) => choice.id)
        expect(roleChoices, `${label}: role fallback`).toEqual(expect.arrayContaining([
          "manage-rear",
          "remain-independent",
        ]))

        if (growth === "martial") {
          expect(visibleChoices(player, player.world, camp.nodes["orders-break"])
            .map((choice) => choice.id)).toContain("disarm-both-sides")
        } else if (growth === "riding") {
          expect(roleChoices).toContain("lead-scouts")
          expect(visibleChoices(player, player.world, scout.nodes["gate-method"])
            .map((choice) => choice.id)).toContain("ride-close-with-jebe")
        } else if (growth === "survival") {
          expect(visibleChoices(player, player.world, scout.nodes["supply-method"])
            .map((choice) => choice.id)).toContain("follow-old-water-eye")
        } else {
          expect(visibleChoices(player, player.world, scout.nodes["scout-priority"])
            .map((choice) => choice.id)).toContain("enter-with-caravan")
          expect(visibleChoices(player, player.world, scout.nodes["infiltration-method"])
            .map((choice) => choice.id)).toContain("travel-as-merchant")
        }

        expect(
          visibleChoices(player, player.world, siege.nodes["siege-orders"]).length,
          `${label}: siege plan`,
        ).toBeGreaterThan(0)
      }
    }
  })
})

describe("act seven battle and casualty audit", () => {
  it("keeps every battle result connected to a valid local node", () => {
    const battles = allAct7Battles()
    expect(battles.length).toBeGreaterThanOrEqual(10)

    for (const { event, battle } of battles) {
      for (const [label, outcome] of [
        ["won", battle.onWin],
        ["partial", battle.onPartial],
        ["lost", battle.onLose],
        ["fled", battle.onFlee],
      ] as const) {
        if (!outcome) continue
        expect(outcome.then, `${event.id} ${label} transition`).toBeDefined()
        if (outcome.then?.type === "goto") {
          expect(event.nodes[outcome.then.nodeId], `${event.id} ${label} target`).toBeDefined()
        }
      }

      expect(battle.onWin, `${event.id} missing onWin`).toBeDefined()
      expect(battle.onLose, `${event.id} missing onLose`).toBeDefined()
      expect(battle.onFlee, `${event.id} missing onFlee`).toBeDefined()
      const protectedTargets = protectedIds(battle.objective)
      if (
        protectedTargets.length > 1
        && (battle.objective?.minProtectedSurvivors ?? protectedTargets.length) < protectedTargets.length
      ) {
        expect(battle.onPartial, `${event.id} missing onPartial`).toBeDefined()
      }
    }
  })

  it("classifies all multi-protection story battles as clean, partial and failed", () => {
    const objectives = allAct7Battles()
      .map(({ battle }) => battle.objective)
      .filter((objective): objective is StoryBattleObjective =>
        !!objective
        && protectedIds(objective).length === 2
        && objective.minProtectedSurvivors === 1
      )
    expect(objectives.length).toBeGreaterThanOrEqual(6)

    for (const objective of objectives) {
      const ids = protectedIds(objective)
      const enemyHp = objective.kind === "defeatAll" ? 0 : 100
      const base = (): BattleState => ({
        playerSide: [
          makeUnit("player", "player"),
          ...ids.map((id) => makeUnit(id, "player")),
        ],
        enemySide: [makeUnit("enemy", "enemy", enemyHp)],
        atbThreshold: 100,
        objective: runtimeObjective(objective),
      })

      const clean = base()
      expect(checkBattleEndBySide(clean)).toBe("won")

      const partial = base()
      partial.playerSide[1].hp = 0
      expect(checkBattleEndBySide(partial)).toBe("partial")

      const failed = base()
      failed.playerSide[1].hp = 0
      failed.playerSide[2].hp = 0
      expect(checkBattleEndBySide(failed)).toBe("lost")
    }
  })
})

describe("modern and legacy Huashan isolation", () => {
  it("blocks the old sample after modern act seven done but preserves skipped compatibility", () => {
    const oldHuashan = getEvent("shendiao-huashan")

    const modern = makeAuditPlayer()
    modern.reputation = 30
    modern.world.arcs.shendiao.beats.yangkang = "done"
    modern.world.arcs.shendiao.beats["act7-western-campaign"] = "done"
    expect(checkCondition(modern, modern.world, oldHuashan.condition)).toBe(false)
    expect(getStoryEventByLocation(modern, getLocationById("huashan")!.events).id)
      .not.toBe("shendiao-huashan")
    expect(getStoryProgress(modern).act.id).toBe("act8-huashan")

    const legacy = makeAuditPlayer()
    legacy.world.arcs.shendiao.beats.yangkang = "done"
    legacy.world.arcs.shendiao.beats["act7-western-campaign"] = "skipped"
    expect(checkCondition(legacy, legacy.world, oldHuashan.condition)).toBe(true)
  })
})
