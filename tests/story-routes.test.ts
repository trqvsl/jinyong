import { describe, expect, it } from "vitest"
import type { Player } from "../src/types"
import type { StoryEvent, Transition, WorldState } from "../src/data/story/schema"
import { STORY_EVENTS } from "../src/data/events"
import { STORY_VOLUMES } from "../src/data/story"
import { WORLD_EVENTS } from "../src/data/story/worldEvents"
import { getLocationById } from "../src/data/map"
import { createWorld } from "../src/game/story/state"
import { checkCondition } from "../src/game/story/conditions"
import {
  resolveBranch,
  resolveChoice,
  visibleChoices,
} from "../src/game/story/engine"
import { getStoryProgress } from "../src/game/story/query"
import { openLocationStory } from "../src/game/appFlow"

const ALL_STORY_EVENTS: StoryEvent[] = [
  ...STORY_EVENTS,
  ...STORY_VOLUMES,
  ...WORLD_EVENTS.map((worldEvent) => worldEvent.event),
]

const LEGACY_UNREACHABLE_ALLOWLIST: Record<string, string[]> = {
  "shendiao-wangfu": ["alarm", "approach"],
}

const ACT6_EVENT_IDS = [
  "shendiao-niujia-act6",
  "shendiao-taohua-blood-act6",
  "shendiao-yanyulou-act6",
  "shendiao-tieqiangmiao-act6",
] as const

const ISLAND_EVIDENCE_IDS = [
  "yangkang-jade-shoe",
  "han-xiaoying-blood-writing",
  "taohua-snake-venom",
  "yellow-robe-fiber",
  "taohua-route-scratch",
] as const

const TEMPLE_EVIDENCE_IDS = [
  ...ISLAND_EVIDENCE_IDS,
  "ouyangke-jade-shard",
] as const

function makePlayer(overrides: Partial<Player> = {}): Player {
  return {
    name: "路线审计",
    level: 1,
    exp: 0,
    expMax: 100,
    hp: 100,
    hpMax: 100,
    mp: 50,
    mpMax: 50,
    attack: 10,
    defense: 5,
    speed: 10,
    roots: {
      strength: 5,
      external: 5,
      internal: 3,
      comprehension: 50,
      constitution: 5,
      breath: 5,
      agility: 5,
      luck: 30,
    },
    attributePoints: 0,
    mastery: {},
    relations: {},
    gold: 100,
    aptitude: 50,
    alignment: "中",
    karma: 0,
    reputation: 0,
    day: 1,
    skills: [],
    inventory: {},
    world: createWorld(),
    statuses: [],
    ...overrides,
  }
}

function makeAct6World(variants: Record<string, string> = {}): WorldState {
  const world = createWorld()
  world.arcs.shendiao = {
    beats: {
      "act1-wind": "done",
      "act2-damos": "done",
      "act3-zhongdu": "done",
      "act4-taohua": "done",
      "act5-old-debts": "done",
    },
    variants: { ...variants },
  }
  return world
}

function inventoryFromMask(ids: readonly string[], mask: number): Record<string, number> {
  return Object.fromEntries(
    ids.map((id, index) => [id, mask & (1 << index) ? 1 : 0]),
  )
}

function inventoryLabel(ids: readonly string[], mask: number): string {
  const present = ids.filter((_, index) => mask & (1 << index))
  return present.length > 0 ? present.join(",") : "empty"
}

function transitionNodeTargets(transition?: Transition): string[] {
  if (!transition) return []
  switch (transition.type) {
    case "goto":
      return [transition.nodeId]
    case "branch":
      return [
        ...transition.cases.flatMap((item) => transitionNodeTargets(item.then)),
        ...transitionNodeTargets(transition.else),
      ]
    case "random":
      return transition.cases.flatMap((item) => transitionNodeTargets(item.then))
    case "battle":
      return [
        ...transitionNodeTargets(transition.onWin?.then),
        ...transitionNodeTargets(transition.onPartial?.then),
        ...transitionNodeTargets(transition.onLose?.then),
        ...transitionNodeTargets(transition.onFlee?.then),
      ]
    default:
      return []
  }
}

function reachableNodeIds(event: StoryEvent): Set<string> {
  const reached = new Set<string>()
  const queue = [event.entryNode]

  while (queue.length > 0) {
    const nodeId = queue.shift()!
    if (reached.has(nodeId)) continue
    const node = event.nodes[nodeId]
    if (!node) continue
    reached.add(nodeId)

    const targets = [
      ...transitionNodeTargets(node.autoNext),
      ...(node.choices ?? []).flatMap((choice) => transitionNodeTargets(choice.transition)),
    ]
    for (const target of targets) {
      if (!reached.has(target)) queue.push(target)
    }
  }

  return reached
}

function transitionHasTerminal(transition?: Transition): boolean {
  if (!transition) return true
  switch (transition.type) {
    case "end":
    case "gameOver":
    case "gotoEvent":
      return true
    case "goto":
      return false
    case "branch":
      return transition.cases.some((item) => transitionHasTerminal(item.then))
        || transitionHasTerminal(transition.else)
    case "random":
      return transition.cases.some((item) => transitionHasTerminal(item.then))
    case "battle":
      return [transition.onWin, transition.onPartial, transition.onLose, transition.onFlee].some((outcome) =>
        transitionHasTerminal(outcome?.then)
      )
  }
}

function nodesWithoutTerminalPath(event: StoryEvent): string[] {
  const reachable = reachableNodeIds(event)
  const edges = new Map<string, string[]>()
  const canReachTerminal = new Set<string>()

  for (const nodeId of reachable) {
    const node = event.nodes[nodeId]
    const transitions = [
      ...(node.autoNext ? [node.autoNext] : []),
      ...(node.choices ?? []).map((choice) => choice.transition),
    ]
    edges.set(
      nodeId,
      transitions.flatMap((transition) => transitionNodeTargets(transition)),
    )
    if (transitions.length === 0 || transitions.some(transitionHasTerminal)) {
      canReachTerminal.add(nodeId)
    }
  }

  let changed = true
  while (changed) {
    changed = false
    for (const [nodeId, targets] of edges.entries()) {
      if (canReachTerminal.has(nodeId)) continue
      if (targets.some((target) => canReachTerminal.has(target))) {
        canReachTerminal.add(nodeId)
        changed = true
      }
    }
  }

  return [...reachable].filter((nodeId) => !canReachTerminal.has(nodeId))
}

function getEvent(id: string): StoryEvent {
  const event = STORY_VOLUMES.find((candidate) => candidate.id === id)
  if (!event) throw new Error(`Missing story event: ${id}`)
  return event
}

function resolveVisibleChoice(
  player: Player,
  world: WorldState,
  event: StoryEvent,
  nodeId: string,
  choiceId: string,
) {
  const node = event.nodes[nodeId]
  const visibleIds = visibleChoices(player, world, node).map((choice) => choice.id)
  expect(visibleIds, `${event.id}.${nodeId} should expose ${choiceId}`).toContain(choiceId)
  const result = resolveChoice(player, world, event, nodeId, choiceId)
  expect(result, `${event.id}.${nodeId}.${choiceId} should resolve`).not.toBeNull()
  return result!
}

describe("story route reachability audit", () => {
  it("keeps every non-allowlisted story node reachable from its event entry", () => {
    const unexpected: Array<{ eventId: string; nodeId: string }> = []

    for (const event of ALL_STORY_EVENTS) {
      const reached = reachableNodeIds(event)
      const allowed = new Set(LEGACY_UNREACHABLE_ALLOWLIST[event.id] ?? [])
      for (const nodeId of Object.keys(event.nodes)) {
        if (!reached.has(nodeId) && !allowed.has(nodeId)) {
          unexpected.push({ eventId: event.id, nodeId })
        }
      }
    }

    expect(unexpected).toEqual([])
  })

  it("keeps every reachable node connected to at least one terminal transition", () => {
    const nonTerminating: Array<{ eventId: string; nodeId: string }> = []

    for (const event of ALL_STORY_EVENTS) {
      for (const nodeId of nodesWithoutTerminalPath(event)) {
        nonTerminating.push({ eventId: event.id, nodeId })
      }
    }

    expect(nonTerminating).toEqual([])
  })

  it("keeps all four modern act-six events reachable in map priority order", () => {
    const stages = [
      {
        locationId: "niujia",
        variants: {},
        expectedEventId: "shendiao-niujia-act6",
      },
      {
        locationId: "taohuadao",
        variants: { "act6.munianci": "cleared" },
        expectedEventId: "shendiao-taohua-blood-act6",
      },
      {
        locationId: "yanyulou",
        variants: { "act6.munianci": "cleared", "act6.island": "cleared" },
        expectedEventId: "shendiao-yanyulou-act6",
      },
      {
        locationId: "tieqiangmiao",
        variants: {
          "act6.munianci": "cleared",
          "act6.island": "cleared",
          "act6.yanyu": "cleared",
        },
        expectedEventId: "shendiao-tieqiangmiao-act6",
      },
    ]

    for (const stage of stages) {
      const world = makeAct6World(stage.variants)
      const player = makePlayer({ world })
      const location = getLocationById(stage.locationId)!
      const opened = openLocationStory({ player, locationId: stage.locationId })
      expect(location.events[0], `${stage.locationId} primary event`).toBe(stage.expectedEventId)
      expect(opened?.command.type, `${stage.locationId} command type`).toBe("show-event-entry")
      if (opened?.command.type === "show-event-entry") {
        expect(opened.command.event.id, `${stage.locationId} opened event`).toBe(stage.expectedEventId)
      }
    }
  })

  it("isolates the old Yang Kang sample after the modern act-six flow starts", () => {
    const oldYangkang = getEvent("shendiao-yangkang")
    const world = makeAct6World({ "act6.munianci": "cleared" })
    world.arcs.shendiao.beats.taohua = "done"
    const player = makePlayer({ world })

    expect(checkCondition(player, world, oldYangkang.condition)).toBe(false)
  })

  it("moves the progress guide to act seven only after act6-truth is written", () => {
    const beforeWorld = makeAct6World({
      "act6.munianci": "cleared",
      "act6.island": "cleared",
      "act6.yanyu": "cleared",
    })
    const before = getStoryProgress(makePlayer({ world: beforeWorld }))
    expect(before.act.id).toBe("act6-truth")
    expect(before.recommendedLocationId).toBe("tieqiangmiao")

    beforeWorld.arcs.shendiao.beats["act6-truth"] = "done"
    const after = getStoryProgress(makePlayer({ world: beforeWorld }))
    expect(after.act.id).toBe("act7-western-campaign")
    expect(after.recommendedLocationId).toBe("damos")
  })
})

describe("act-six evidence combination matrix", () => {
  it("classifies all 32 island evidence combinations without a dead branch", () => {
    const island = getEvent("shendiao-taohua-blood-act6")
    const counts = { questioning: 0, partial: 0, weak: 0 }

    for (let mask = 0; mask < 1 << ISLAND_EVIDENCE_IDS.length; mask++) {
      const inventory = inventoryFromMask(ISLAND_EVIDENCE_IDS, mask)
      const player = makePlayer({ inventory })
      const transition = resolveBranch(
        player,
        player.world,
        island.nodes["evidence-review"].autoNext!,
      )
      const hasShoe = inventory["yangkang-jade-shoe"] > 0
      const hasBlood = inventory["han-xiaoying-blood-writing"] > 0
      const hasCorroboration = [
        "taohua-snake-venom",
        "yellow-robe-fiber",
        "taohua-route-scratch",
      ].some((id) => inventory[id] > 0)
      const hasAny = Object.values(inventory).some((count) => count > 0)
      const expectedNode = hasShoe && hasBlood && hasCorroboration
        ? "misunderstanding-questioning"
        : hasAny
          ? "misunderstanding-partial"
          : "misunderstanding-weak"

      expect(
        transition,
        `island evidence: ${inventoryLabel(ISLAND_EVIDENCE_IDS, mask)}`,
      ).toMatchObject({ type: "goto", nodeId: expectedNode })
      counts[expectedNode.replace("misunderstanding-", "") as keyof typeof counts]++
    }

    expect(counts).toEqual({ questioning: 7, partial: 24, weak: 1 })
  })

  it("classifies all 64 honest temple evidence combinations", () => {
    const temple = getEvent("shendiao-tieqiangmiao-act6")
    const counts = { complete: 0, partial: 0 }

    for (let mask = 0; mask < 1 << TEMPLE_EVIDENCE_IDS.length; mask++) {
      const inventory = inventoryFromMask(TEMPLE_EVIDENCE_IDS, mask)
      const world = makeAct6World({
        "act5.ouyangke": "killed-witnessed",
        "act6.munianci-outcome": "informed-unresolved",
        "act6.island": "cleared",
        "act6.island-outcome": "ke-saved",
        "act6.yanyu": "cleared",
        "act6.yanyu-focus": "oral-only",
        "act6.yanyu-outcome": "meeting-broken",
      })
      world.npcs.ouyangke = { alive: false, recruited: false, faction: "", fateTags: [] }
      world.npcs.hanxiaoying = { alive: false, recruited: false, faction: "", fateTags: [] }
      let player = makePlayer({ inventory, world })
      let currentWorld = world

      const choices = [
        [
          "truth-entry-question",
          inventory["taohua-route-scratch"] > 0
            ? "submit-route-scratch"
            : "record-entry-doubt",
        ],
        [
          "truth-martial-question",
          inventory["han-xiaoying-blood-writing"] > 0
            && (
              inventory["taohua-snake-venom"] > 0
              || inventory["yellow-robe-fiber"] > 0
            )
            ? "match-blood-and-venom"
            : "separate-sound-and-wound",
        ],
        [
          "truth-token-question",
          inventory["yangkang-jade-shoe"] > 0
            ? "present-jade-shoe-again"
            : "reconstruct-zhucong-hand",
        ],
        [
          "truth-motive-question",
          inventory["ouyangke-jade-shard"] > 0
            ? "present-ouyangke-shard"
            : "record-motive-doubt",
        ],
      ] as const

      for (const [nodeId, choiceId] of choices) {
        const resolved = resolveVisibleChoice(
          player,
          currentWorld,
          temple,
          nodeId,
          choiceId,
        )
        player = resolved.player
        currentWorld = resolved.world
      }

      const transition = resolveBranch(
        player,
        currentWorld,
        temple.nodes["truth-tally"].autoNext!,
      )
      const expectedComplete = inventory["taohua-route-scratch"] > 0
        && inventory["han-xiaoying-blood-writing"] > 0
        && (
          inventory["taohua-snake-venom"] > 0
          || inventory["yellow-robe-fiber"] > 0
        )
        && inventory["yangkang-jade-shoe"] > 0
        && inventory["ouyangke-jade-shard"] > 0
      const expectedNode = expectedComplete ? "truth-complete" : "truth-partial"

      expect(
        transition,
        `temple evidence: ${inventoryLabel(TEMPLE_EVIDENCE_IDS, mask)}`,
      ).toMatchObject({ type: "goto", nodeId: expectedNode })
      counts[expectedComplete ? "complete" : "partial"]++
    }

    expect(counts).toEqual({ complete: 3, partial: 61 })
  })

  it("routes a deliberate lie in any of the four rounds to corrupted", () => {
    const temple = getEvent("shendiao-tieqiangmiao-act6")
    const misleadingChoices = [
      ["truth-entry-question", "blame-taohua-gate", "act6.truth-entry"],
      ["truth-martial-question", "reuse-flute-accusation", "act6.truth-martial"],
      ["truth-token-question", "hide-jade-shoe", "act6.truth-token"],
      ["truth-motive-question", "blame-old-taohua-feud", "act6.truth-motive"],
    ] as const

    for (const [nodeId, choiceId, variantKey] of misleadingChoices) {
      const world = makeAct6World({
        "act6.truth-entry": "proven",
        "act6.truth-martial": "proven",
        "act6.truth-token": "proven",
        "act6.truth-motive": "proven",
      })
      world.npcs.ouyangke = { alive: false, recruited: false, faction: "", fateTags: [] }
      const inventory = Object.fromEntries(TEMPLE_EVIDENCE_IDS.map((id) => [id, 1]))
      const player = makePlayer({ inventory, world })
      const resolved = resolveVisibleChoice(player, world, temple, nodeId, choiceId)

      expect(resolved.world.arcs.shendiao.variants[variantKey]).toBe("misled")
      expect(resolveBranch(
        resolved.player,
        resolved.world,
        temple.nodes["truth-tally"].autoNext!,
      )).toMatchObject({ type: "goto", nodeId: "truth-corrupted" })
    }
  })

  it("keeps every act-six choice node usable in representative route states", () => {
    const fullyEquipped = Object.fromEntries(TEMPLE_EVIDENCE_IDS.map((id) => [id, 1]))
    const world = makeAct6World({
      "act4.taohua-route": "guo-huang",
      "act5.beggar": "rong-recognized",
      "act5.ouyangke": "killed-witnessed",
      "act5.wumu-destination": "beggar-network",
      "act6.munianci": "cleared",
      "act6.munianci-evidence": "material",
      "act6.munianci-outcome": "broken",
      "act6.island": "cleared",
      "act6.island-outcome": "xiaoying-saved",
      "act6.misunderstanding": "questioning",
      "act6.yanyu": "cleared",
      "act6.yanyu-focus": "oral-only",
      "act6.yanyu-outcome": "exits-sealed",
      "act6.truth-strength": "complete",
    })
    world.npcs.ouyangke = { alive: false, recruited: false, faction: "", fateTags: [] }
    world.npcs.hanxiaoying = { alive: true, recruited: false, faction: "", fateTags: [] }
    const player = makePlayer({
      inventory: fullyEquipped,
      relations: { yangkang: 20 },
      world,
    })

    for (const eventId of ACT6_EVENT_IDS) {
      const event = getEvent(eventId)
      for (const node of Object.values(event.nodes)) {
        if (!node.choices || node.choices.length === 0) continue
        expect(
          visibleChoices(player, world, node).length,
          `${event.id}.${node.id} should expose at least one choice`,
        ).toBeGreaterThan(0)
      }
    }
  })
})
