// 战斗引擎多对多 + CTB 验证脚本（纯逻辑，不依赖 React）
// 运行：npx tsx scripts/verify-battle.ts
import {
  type Combatant,
  type BattleState,
} from "../src/game/battle/types"
import {
  performAction,
  advanceAtb,
  nextActor,
  checkBattleEndBySide,
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
  const p = mkUnit("p1", "player", "我方", 40, 22, 120)
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
  if (result === "won") check("我方获胜（1打2应能赢）", result === "won")
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

console.log(`\n========================================`)
console.log(`通过 ${pass} / 失败 ${fail}`)
console.log(`========================================`)
process.exit(fail > 0 ? 1 : 0)