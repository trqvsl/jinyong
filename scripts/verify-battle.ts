// 战斗引擎多对多 + CTB 验证脚本（纯逻辑，不依赖 React）
// 运行：npx tsx scripts/verify-battle.ts
import {
  type Combatant,
  type BattleState,
} from "../src/game/battle/types"
import { advanceBattleToNextActor } from "../src/game/battle/flow"
import {
  performAction,
  advanceAtb,
  nextActor,
  checkBattleEndBySide,
  completeBattleTurn,
  createBattleObjective,
  previewTurnOrder,
  tickUnitStatuses,
  enemyDecideAction,
  findCombatant,
} from "../src/game/battle/engine"

// —— 造几个测试用的 Combatant（不走适配层，直接构造，验证引擎本身）——
function mkUnit(uid: string, side: "player" | "enemy", name: string, speed: number, attack: number, hp = 100): Combatant {
  return {
    uid, side, name,
    hp, hpMax: hp, mp: 50, mpMax: 50,
    attack, defense: 8, speed,
    statuses: [],
    atb: 0,
    skills: [
      { id: "atk", name: "普攻", category: "外功", damageType: "拳掌", power: 20, mpCost: 0 },
    ],
  }
}

// 一个带群攻招式的单位
function mkAoeUnit(uid: string, side: "player" | "enemy", name: string, speed: number, attack: number, hp = 100): Combatant {
  return {
    ...mkUnit(uid, side, name, speed, attack, hp),
    skills: [
      { id: "sweep", name: "横扫千军", category: "外功", damageType: "拳掌", power: 15, mpCost: 10, targeting: "all-enemy" },
      { id: "atk", name: "普攻", category: "外功", damageType: "拳掌", power: 20, mpCost: 0 },
    ],
  }
}

function mkState(players: Combatant[], enemies: Combatant[]): BattleState {
  return { playerSide: players, enemySide: enemies, atbThreshold: 100 }
}

let pass = 0, fail = 0
function check(label: string, cond: boolean, detail = "") {
  if (cond) { pass++; console.log(`  ✓ ${label}`) }
  else { fail++; console.log(`  ✗ ${label} ${detail}`) }
}

console.log("\n=== 验证 1：CTB 行动顺序——速度高的先动 ===")
{
  const slow = mkUnit("p1", "player", "慢侠", 25, 20)
  const fast = mkUnit("e1", "enemy", "快敌", 50, 18)
  let state = mkState([slow], [fast])
  state = advanceAtb(state)
  const actor = nextActor(state)
  check("快敌先达到行动值", !!actor && actor.uid === "e1", `实际: ${actor?.uid}`)
  check("行动值已达到阈值(100)", !!actor && actor.atb >= 100, `实际 atb: ${actor?.atb}`)
}

console.log("\n=== 验证 2：行动顺序预览（previewTurnOrder） ===")
{
  const p = mkUnit("p1", "player", "我方", 30, 20)
  const e1 = mkUnit("e1", "enemy", "敌甲", 30, 15)
  const e2 = mkUnit("e2", "enemy", "敌乙", 30, 15)
  let state = mkState([p], [e1, e2])
  const order = previewTurnOrder(state, 6)
  console.log("  预览顺序:", order.map(o => o.name).join(" → "))
  check("预览能给出若干步", order.length > 0, `长度: ${order.length}`)
}

console.log("\n=== 验证 3：单体攻击——只打选中的目标 ===")
{
  const p = mkUnit("p1", "player", "我方", 50, 25)
  const e1 = mkUnit("e1", "enemy", "敌甲", 20, 10, 80)
  const e2 = mkUnit("e2", "enemy", "敌乙", 20, 10, 80)
  let state = mkState([p], [e1, e2])
  const skill = p.skills[0]
  const beforeHp2 = findCombatant(state, "e2")!.hp
  const r = performAction(state, { actorUid: "p1", skill, targetUids: ["e1"] })
  const afterHp1 = findCombatant(r.state, "e1")!.hp
  const afterHp2 = findCombatant(r.state, "e2")!.hp
  check("敌甲被打掉血", afterHp1 < 80, `hp: ${afterHp1}`)
  check("敌乙未受波及（单体）", afterHp2 === beforeHp2, `hp: ${afterHp2}`)
}

console.log("\n=== 验证 4：群攻（all-enemy）——打敌方全体 ===")
{
  const p = mkAoeUnit("p1", "player", "群攻侠", 50, 25)
  const e1 = mkUnit("e1", "enemy", "敌甲", 20, 10, 60)
  const e2 = mkUnit("e2", "enemy", "敌乙", 20, 10, 60)
  const e3 = mkUnit("e3", "enemy", "敌丙", 20, 10, 60)
  let state = mkState([p], [e1, e2, e3])
  const sweep = p.skills[0] // 横扫千军 all-enemy
  const r = performAction(state, { actorUid: "p1", skill: sweep, targetUids: [] })
  const allHit = ["e1", "e2", "e3"].every(uid => findCombatant(r.state, uid)!.hp < 60)
  check("三个敌人全部掉血", allHit)
  check("产生3条伤害结果", r.results.length === 3, `实际: ${r.results.length}`)
}

console.log("\n=== 验证 5：胜负判定——敌方全灭=胜 ===")
{
  const p = mkUnit("p1", "player", "我方", 50, 25, 50)
  const e1 = mkUnit("e1", "enemy", "敌甲", 20, 10, 1)
  const e2 = mkUnit("e2", "enemy", "敌乙", 20, 10, 1)
  let state = mkState([p], [e1, e2])
  check("初始进行中", checkBattleEndBySide(state) === "ongoing")
  // 一发横扫清场
  const sweep: any = { id: "s", name: "横扫", category: "外功", power: 50, mpCost: 0, targeting: "all-enemy" }
  const r = performAction(state, { actorUid: "p1", skill: sweep, targetUids: [] })
  check("清场后判胜", checkBattleEndBySide(r.state) === "won")
}

console.log("\n=== 验证 6：完整回合模拟（含状态结算、敌人AI、CTB轮转） ===")
{
  const p = mkUnit("p1", "player", "我方", 40, 22, 240)
  const e1 = mkUnit("e1", "enemy", "敌甲", 30, 16, 70)
  const e2 = mkUnit("e2", "enemy", "敌乙", 30, 16, 70)
  let state = mkState([p], [e1, e2])
  let turns = 0
  const log: string[] = []
  while (checkBattleEndBySide(state) === "ongoing" && turns < 50) {
    state = advanceAtb(state)
    const actor = nextActor(state)
    if (!actor) { turns++; continue }
    // 行动前结算自身状态
    const ticked = tickUnitStatuses(state, actor.uid)
    state = ticked.state
    if (checkBattleEndBySide(state) !== "ongoing") break

    const cur = findCombatant(state, actor.uid)!
    if (cur.hp <= 0) { continue }

    if (actor.side === "player") {
      // 我方：总是普攻血最少的敌人
      const enemies = state.enemySide.filter(c => c.hp > 0).sort((a, b) => a.hp - b.hp)
      const target = enemies[0]
      const r = performAction(state, { actorUid: actor.uid, skill: cur.skills[0], targetUids: [target.uid] })
      state = r.state
      log.push(`回合${turns + 1}: ${actor.name} 普攻 ${target.name}，造成 ${r.results[0]?.damage ?? 0} 伤害`)
    } else {
      // 敌方：用 AI 决策
      const cmd = enemyDecideAction(state, cur)
      if (cmd) {
        const r = performAction(state, cmd)
        state = r.state
        log.push(`回合${turns + 1}: ${actor.name} 出手，造成 ${r.results.reduce((s, x) => s + x.damage, 0)} 总伤害`)
      }
    }
    // 消耗行动值
    state = { ...state, playerSide: state.playerSide.map(c => c.uid === actor.uid ? { ...c, atb: Math.max(0, c.atb - 100) } : c), enemySide: state.enemySide.map(c => c.uid === actor.uid ? { ...c, atb: Math.max(0, c.atb - 100) } : c) }
    turns++
  }
  const result = checkBattleEndBySide(state)
  console.log(log.slice(0, 8).map(l => "    " + l).join("\n"))
  check("模拟在50回合内结束", turns < 50, `跑了 ${turns} 回合`)
  check("战斗有明确结局", result === "won" || result === "lost", `结局: ${result}`)
  check("我方获胜（1打2应能赢）", result === "won", `结局: ${result}`)
}

console.log("\n=== 验证 7：ATB 消耗后，再次行动需重新累积 ===")
{
  const p = mkUnit("p1", "player", "我方", 50, 20)
  const e = mkUnit("e1", "enemy", "敌人", 50, 20)
  let state = mkState([p], [e])
  state = advanceAtb(state)
  const actor1 = nextActor(state)
  // 消耗
  state = { ...state, playerSide: state.playerSide.map(c => c.uid === actor1!.uid ? { ...c, atb: c.atb - 100 } : c) }
  const immediatelyAfter = nextActor(state)
  check("消耗后不应立即再次行动", immediatelyAfter?.uid !== actor1?.uid || (immediatelyAfter && immediatelyAfter.atb < 100), `atb: ${immediatelyAfter?.atb}`)
}

console.log("\n=== 验证 8：守回合目标按完整行动轮推进 ===")
{
  const p = mkUnit("p1", "player", "快侠", 80, 20)
  const ally = mkUnit("ally", "player", "证人", 20, 10)
  const enemy = mkUnit("e1", "enemy", "追兵", 40, 18)
  let state: BattleState = {
    ...mkState([p, ally], [enemy]),
    objective: createBattleObjective({ kind: "surviveRounds", rounds: 2, protectUid: "ally" }),
  }

  let completed = completeBattleTurn(state, "p1")
  state = completed.state
  check("快侠首次行动不完成整轮", !completed.roundCompleted && state.objective?.completedRounds === 0)

  completed = completeBattleTurn(state, "p1")
  state = completed.state
  check("高速单位重复行动不重复计轮", !completed.roundCompleted && state.objective?.completedRounds === 0)

  completed = completeBattleTurn(state, "e1")
  state = completed.state
  check("仍有存活友方未行动时不计轮", !completed.roundCompleted && state.objective?.completedRounds === 0)

  completed = completeBattleTurn(state, "ally")
  state = completed.state
  check("所有存活单位行动后完成第一轮", completed.roundCompleted && state.objective?.completedRounds === 1)
  check("第一轮后战斗继续", checkBattleEndBySide(state) === "ongoing")

  for (const uid of ["p1", "e1", "ally"]) state = completeBattleTurn(state, uid).state
  check("守满目标轮数判胜", state.objective?.completedRounds === 2 && checkBattleEndBySide(state) === "won")
}

console.log("\n=== 验证 9：保护目标与提前清场 ===")
{
  const p = mkUnit("p1", "player", "护卫", 40, 20)
  const protectedAlly = mkUnit("ally", "player", "证人", 25, 10)
  const otherAlly = mkUnit("other", "player", "同伴", 30, 10)
  const enemy = mkUnit("e1", "enemy", "追兵", 35, 18)
  const base: BattleState = {
    ...mkState([p, protectedAlly, otherAlly], [enemy]),
    objective: createBattleObjective({ kind: "surviveRounds", rounds: 3, protectUid: "ally" }),
  }

  const otherDown: BattleState = {
    ...base,
    playerSide: base.playerSide.map((unit) => unit.uid === "other" ? { ...unit, hp: 0 } : unit),
  }
  check("非保护友方倒下不立即失败", checkBattleEndBySide(otherDown) === "ongoing")

  const protectedDown: BattleState = {
    ...base,
    playerSide: base.playerSide.map((unit) => unit.uid === "ally" ? { ...unit, hp: 0 } : unit),
  }
  check("指定保护友方倒下立即失败", checkBattleEndBySide(protectedDown) === "lost")

  const enemyDown: BattleState = {
    ...base,
    enemySide: base.enemySide.map((unit) => ({ ...unit, hp: 0 })),
  }
  check("守回合目标提前清场仍判胜", checkBattleEndBySide(enemyDown) === "won")

  const protectOnly: BattleState = {
    ...mkState([p, protectedAlly], [enemy]),
    objective: createBattleObjective({ kind: "defeatAll", protectUid: "ally" }),
  }
  check("歼灭目标可附加保护条件", checkBattleEndBySide(protectOnly) === "ongoing")
}

console.log("\n=== 验证 10：眩晕跳过仍计入完整轮 ===")
{
  const stunned = mkUnit("p1", "player", "被点穴者", 60, 20)
  stunned.statuses = [{ kind: "stun", name: "眩晕", duration: 1, potency: 0 }]
  const enemy = mkUnit("e1", "enemy", "追兵", 50, 18)
  const state: BattleState = {
    ...mkState([stunned], [enemy]),
    objective: createBattleObjective({ kind: "surviveRounds", rounds: 1 }),
  }
  const advanced = advanceBattleToNextActor(state)
  check("眩晕单位本次行动被跳过", advanced.actor?.uid === "e1")
  check("眩晕单位已记入本轮参与者", advanced.state.objective?.actedUids.includes("p1") === true)
  const completed = completeBattleTurn(advanced.state, "e1")
  check("其他存活单位行动后该轮完成", completed.roundCompleted && completed.state.objective?.completedRounds === 1)
}

console.log("\n=== 验证 11：多人保护、最低幸存人数与部分达成 ===")
{
  const p = mkUnit("p1", "player", "护卫", 45, 22)
  const allyA = mkUnit("ally-a", "player", "百姓甲", 20, 8)
  const allyB = mkUnit("ally-b", "player", "百姓乙", 20, 8)
  const allyC = mkUnit("ally-c", "player", "百姓丙", 20, 8)
  const enemy = mkUnit("e1", "enemy", "追兵", 35, 18)
  const objective = createBattleObjective({
    kind: "defeatAll",
    protectUids: ["ally-a", "ally-b", "ally-c"],
    minProtectedSurvivors: 2,
  })!
  const base: BattleState = {
    ...mkState([p, allyA, allyB, allyC], [enemy]),
    objective,
  }

  check("保护组保留三个唯一目标", objective.protectUids.length === 3)
  check("最低幸存人数写入运行时", objective.minProtectedSurvivors === 2)

  const cleanWin: BattleState = {
    ...base,
    enemySide: base.enemySide.map((unit) => ({ ...unit, hp: 0 })),
  }
  check("保护组全员存活时无损达成", checkBattleEndBySide(cleanWin) === "won")

  const oneCasualty: BattleState = {
    ...base,
    playerSide: base.playerSide.map((unit) => unit.uid === "ally-a" ? { ...unit, hp: 0 } : unit),
  }
  check("允许范围内伤亡不会提前结束", checkBattleEndBySide(oneCasualty) === "ongoing")
  const costlyWin: BattleState = {
    ...oneCasualty,
    enemySide: oneCasualty.enemySide.map((unit) => ({ ...unit, hp: 0 })),
  }
  check("达到最低幸存数时部分达成", checkBattleEndBySide(costlyWin) === "partial")

  const belowMinimum: BattleState = {
    ...oneCasualty,
    playerSide: oneCasualty.playerSide.map((unit) => unit.uid === "ally-b" ? { ...unit, hp: 0 } : unit),
  }
  check("低于最低幸存数立即失败", checkBattleEndBySide(belowMinimum) === "lost")

  const legacy = createBattleObjective({ kind: "surviveRounds", rounds: 2, protectUid: "ally-a" })!
  check(
    "旧单人保护契约归一化为全员必活",
    legacy.protectUid === "ally-a"
      && legacy.protectUids.length === 1
      && legacy.minProtectedSurvivors === 1,
  )
}

console.log(`\n========================================`)
console.log(`通过 ${pass} / 失败 ${fail}`)
console.log(`========================================`)
process.exit(fail > 0 ? 1 : 0)
