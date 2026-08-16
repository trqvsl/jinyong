import { describe, expect, it } from "vitest"
import {
  type Combatant,
  type BattleState,
  checkBattleEndBySide,
  createBattleObjective,
  createBattleState,
  createBattleSupportRuntimeState,
  finalizeBattleResult,
} from "../src/game/battle"
import type { Transition } from "../src/data/story/schema"
import { getEnemyById } from "../src/data/enemies"
import { STORY_VOLUMES } from "../src/data/story"
import {
  resolveStoryFlow,
  restoreStoryCheckpoint,
  setStoryCheckpoint,
} from "../src/game/appFlow"
import { createPlayer } from "../src/game/player"
import { resolveBattleOutcome } from "../src/game/story/engine"

function makeUnit(uid: string, side: "player" | "enemy"): Combatant {
  return {
    uid,
    side,
    name: uid,
    hp: 100,
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

function makeObjectiveState(): BattleState {
  return {
    playerSide: [
      makeUnit("player", "player"),
      makeUnit("ally-a", "player"),
      makeUnit("ally-b", "player"),
      makeUnit("ally-c", "player"),
    ],
    enemySide: [makeUnit("enemy", "enemy")],
    atbThreshold: 100,
    objective: createBattleObjective({
      kind: "defeatAll",
      protectUids: ["ally-a", "ally-b", "ally-c"],
      minProtectedSurvivors: 2,
    }),
  }
}

describe("battle objective outcomes", () => {
  it("normalizes the legacy single protected target", () => {
    expect(createBattleObjective({
      kind: "surviveRounds",
      rounds: 2,
      protectUid: "ally-a",
    })).toMatchObject({
      protectUid: "ally-a",
      protectUids: ["ally-a"],
      minProtectedSurvivors: 1,
    })
  })

  it("distinguishes clean, partial and failed protection outcomes", () => {
    const clean = makeObjectiveState()
    clean.enemySide[0].hp = 0
    expect(checkBattleEndBySide(clean)).toBe("won")

    const partial = makeObjectiveState()
    partial.playerSide[1].hp = 0
    expect(checkBattleEndBySide(partial)).toBe("ongoing")
    partial.enemySide[0].hp = 0
    expect(checkBattleEndBySide(partial)).toBe("partial")

    const failed = makeObjectiveState()
    failed.playerSide[1].hp = 0
    failed.playerSide[2].hp = 0
    expect(checkBattleEndBySide(failed)).toBe("lost")
  })

  it("grants defeated-enemy growth for a partial success", () => {
    const player = createPlayer("代价胜利")
    const enemy = getEnemyById("guanjun")
    const finalState = createBattleState([player], [enemy])
    finalState.enemySide[0].hp = 0

    const finalized = finalizeBattleResult({
      result: "partial",
      finalState,
      player,
      combatPlayer: player,
      enemies: [enemy],
      inventoryPatch: {},
      runtime: createBattleSupportRuntimeState(),
    })

    expect(finalized.rewards).toMatchObject({
      exp: enemy.expReward,
      gold: enemy.goldReward,
    })
    expect(finalized.logs[0].text).toContain("已有伤亡")
  })
})

describe("story battle contract", () => {
  it("builds and restores an explicit multi-enemy battle with a protected group", () => {
    const event = STORY_VOLUMES.find((item) => item.id === "shendiao-niujia-opening")!
    const player = setStoryCheckpoint(createPlayer("剧情战契约"), {
      eventId: event.id,
      nodeId: event.entryNode,
      phase: "choosing",
      pageIndex: 0,
      locationId: "niujia",
    })
    const transition: Transition = {
      type: "battle",
      enemyIds: ["guanjun", "sangkun-guard", "guanjun"],
      allyIds: ["guojing", "huangrong"],
      objective: {
        kind: "surviveRounds",
        rounds: 2,
        protectAllyIds: ["guojing", "huangrong"],
        minProtectedSurvivors: 1,
        title: "护住接应者",
      },
      onWin: { text: "全员撤出。" },
      onPartial: { text: "有人负伤，接应仍然完成。" },
      onLose: { text: "接应失败。" },
    }

    const started = resolveStoryFlow({
      player,
      transition,
      consumedDay: false,
      currentStoryEvent: event,
      locationId: "niujia",
    })

    expect(started.command.type).toBe("show-battle")
    if (started.command.type !== "show-battle") return
    expect(started.command.enemies.map((enemy) => enemy.id)).toEqual([
      "guanjun",
      "sangkun-guard",
      "guanjun",
    ])
    expect(started.command.battleObjective).toMatchObject({
      protectUids: ["npc-guojing", "npc-huangrong"],
      minProtectedSurvivors: 1,
    })
    expect(started.player.world.currentStory?.battleEnemyIds).toEqual([
      "guanjun",
      "sangkun-guard",
      "guanjun",
    ])

    const restored = restoreStoryCheckpoint(started.player)
    expect(restored.command?.type).toBe("show-battle")
    if (restored.command?.type !== "show-battle") return
    expect(restored.command.enemies.map((enemy) => enemy.id)).toEqual([
      "guanjun",
      "sangkun-guard",
      "guanjun",
    ])
    expect(restored.command.battleObjective?.protectUids).toEqual([
      "npc-guojing",
      "npc-huangrong",
    ])
  })

  it("uses onPartial consequences instead of onWin consequences", () => {
    const player = createPlayer("部分达成")
    const transition: Transition = {
      type: "battle",
      enemyId: "guanjun",
      onWin: {
        text: "无损完成。",
        consequences: [{ kind: "gold", delta: 20 }],
      },
      onPartial: {
        text: "付出代价后完成。",
        consequences: [{ kind: "gold", delta: 5 }],
      },
    }

    const result = resolveBattleOutcome(
      player,
      player.world,
      transition,
      "partial",
    )!

    expect(result.text).toBe("付出代价后完成。")
    expect(result.player.gold).toBe(player.gold + 5)
  })
})
