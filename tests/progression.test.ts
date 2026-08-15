import { describe, expect, it } from "vitest"
import type { Enemy, Player } from "../src/types"
import { getSkillById } from "../src/data/skills"
import { createPlayer } from "../src/game/player"
import {
  applyExperience,
  applyMasteryToSkill,
  applySkillPractice,
  getPracticeGainPerUse,
  getSkillMasteryLabel,
} from "../src/game/progression"
import { applyConsequences } from "../src/game/story/consequences"
import {
  applyVictoryGrowth,
  createBattleState,
  createBattleSupportRuntimeState,
  finalizeBattleResult,
  playerToCombatant,
} from "../src/game/battle"

function makePlayer(comprehension = 50): Player {
  const player = createPlayer("成长测试")
  return {
    ...player,
    roots: { ...player.roots, comprehension },
    aptitude: comprehension,
  }
}

function makeEnemy(): Enemy {
  return {
    id: "growth-dummy",
    name: "木人",
    hp: 30,
    hpMax: 30,
    mp: 0,
    mpMax: 0,
    attack: 1,
    defense: 0,
    speed: 1,
    statuses: [],
    skills: [getSkillById("changquan")!],
    expReward: 25,
    goldReward: 8,
    description: "用于验证成长结算。",
  }
}

describe("experience progression", () => {
  it("supports consecutive level-ups and restores hp and mp", () => {
    const player = {
      ...makePlayer(),
      exp: 90,
      hp: 1,
      mp: 0,
    }

    const result = applyExperience(player, 250)

    expect(result.levelsGained).toBe(2)
    expect(result.attributePointsGained).toBe(10)
    expect(result.player).toMatchObject({
      level: 3,
      exp: 110,
      expMax: 169,
      attributePoints: 10,
    })
    expect(result.player.hp).toBe(result.player.hpMax)
    expect(result.player.mp).toBe(result.player.mpMax)
  })

  it("uses the same level-up contract for story and battle experience", () => {
    const player = { ...makePlayer(), exp: 95 }
    const story = applyConsequences(player, player.world, [
      { kind: "exp", delta: 140 },
    ]).player
    const battle = applyVictoryGrowth(player, 140, 0).player

    expect(story).toMatchObject({
      level: battle.level,
      exp: battle.exp,
      expMax: battle.expMax,
      attributePoints: battle.attributePoints,
      hp: battle.hp,
      mp: battle.mp,
    })
  })
})

describe("skill practice", () => {
  it.each([
    [59, 1],
    [60, 2],
    [84, 2],
    [85, 3],
  ])("grants %i comprehension the expected per-use gain", (comprehension, gain) => {
    expect(getPracticeGainPerUse(comprehension)).toBe(gain)
  })

  it("caps practice at five uses per skill and mastery at 100", () => {
    const player = {
      ...makePlayer(85),
      mastery: { changquan: 90 },
    }

    const result = applySkillPractice(player, {
      changquan: 99,
      "not-learned": 5,
    })

    expect(result.player.mastery.changquan).toBe(100)
    expect(result.player.mastery["not-learned"]).toBeUndefined()
    expect(result.gains).toEqual([
      expect.objectContaining({
        skillId: "changquan",
        before: 90,
        after: 100,
        gained: 10,
        uses: 5,
      }),
    ])
  })

  it.each(["won", "lost", "fled"] as const)(
    "keeps practice gains when battle result is %s",
    (result) => {
      const player = makePlayer(60)
      const enemy = makeEnemy()
      const finalState = createBattleState([player], [enemy])
      if (result === "won") finalState.enemySide[0].hp = 0
      if (result === "lost") finalState.playerSide[0].hp = 0

      const finalized = finalizeBattleResult({
        result,
        finalState,
        player,
        combatPlayer: player,
        enemies: [enemy],
        inventoryPatch: {},
        runtime: createBattleSupportRuntimeState(),
        skillUses: { changquan: 2 },
      })

      expect(finalized.player.mastery.changquan).toBe(4)
      expect(finalized.masteryGains).toEqual([
        expect.objectContaining({ skillId: "changquan", gained: 4, uses: 2 }),
      ])
      expect(finalized.logs.some((entry) => entry.text.includes("长拳熟练度 +4"))).toBe(true)
    },
  )
})

describe("mastery combat modifiers", () => {
  it("labels each mastery stage at its boundary", () => {
    expect([0, 25, 50, 75, 100].map(getSkillMasteryLabel)).toEqual([
      "初习",
      "入门",
      "熟练",
      "精通",
      "圆满",
    ])
  })

  it("improves power, effect potency and hostile effect chance", () => {
    const poison = getSkillById("qianzhu")!
    const debuff = getSkillById("huagu")!
    const stun = getSkillById("shehun")!

    expect(applyMasteryToSkill(poison, 100)).toEqual({
      power: 13,
      effectPotency: 18,
      effectApplyChance: 0.95,
    })
    expect(applyMasteryToSkill(debuff, 100).effectPotency).toBe(-12)
    expect(applyMasteryToSkill(stun, 100)).toMatchObject({
      effectPotency: 0,
      effectApplyChance: 0.7,
    })
  })

  it("applies player mastery only at the battle adapter boundary", () => {
    const player = {
      ...makePlayer(),
      mastery: { changquan: 100 },
    }

    const combatant = playerToCombatant(player)

    expect(combatant.skills.find((skill) => skill.id === "changquan")?.power).toBe(11)
    expect(getSkillById("changquan")?.power).toBe(10)
  })
})
