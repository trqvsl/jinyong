import { describe, expect, it } from "vitest"
import type { Player } from "../src/types"
import type { StoryEvent } from "../src/data/story/schema"
import { createWorld } from "../src/game/story/state"
import { enterNode } from "../src/game/story/engine"

function makePlayer(): Player {
  const world = createWorld()
  return {
    name: "幂等探测",
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
    world,
    statuses: [],
  }
}

describe("enterNode regressions", () => {
  it("synchronizes the final seenNodes world back to player", () => {
    const player = makePlayer()
    const event: StoryEvent = {
      id: "seen-node-sync-probe",
      entryNode: "reward",
      nodes: {
        reward: {
          id: "reward",
          text: "首次进入只应结算一次。",
          onEnter: [{ kind: "gold", delta: 10 }],
          autoNext: { type: "end" },
        },
      },
    }

    const entered = enterNode(player, player.world, event, "reward")!

    expect(entered.player.world).toBe(entered.world)
    expect(entered.player.world.seenNodes).toContain("seen-node-sync-probe:reward")

    const repeated = enterNode(
      entered.player,
      entered.player.world,
      event,
      "reward",
    )!
    expect(repeated.player.gold).toBe(110)
  })
})
