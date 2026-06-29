// 本次修复的针对性回归验证：内功催动、眩晕跳过、飘字 targetUid
// 运行：npx tsx scripts/verify-fixes.ts
import { type Combatant, type BattleState } from "../src/game/battle/types"
import { performAction, findCombatant } from "../src/game/battle/engine"

function mk(uid: string, side: "player" | "enemy", opts: Partial<Combatant> = {}): Combatant {
  return {
    uid, side, name: uid,
    hp: 100, hpMax: 100, mp: 50, mpMax: 50,
    attack: 10, defense: 8, speed: 30,
    statuses: [], atb: 0,
    skills: [{ id: "atk", name: "普攻", category: "外功", damageType: "拳掌", power: 10, mpCost: 0 }],
    ...opts,
  }
}
function st(a: Combatant[], b: Combatant[]): BattleState {
  return { playerSide: a, enemySide: b, atbThreshold: 100 }
}

let pass = 0, fail = 0
function check(label: string, cond: boolean, detail = "") {
  if (cond) { pass++; console.log(`  ✓ ${label}`) }
  else { fail++; console.log(`  ✗ ${label} ${detail}`) }
}

console.log("\n=== 修复验证 1：内功催动（innerPower × innerScale）提升伤害 ===")
{
  const innerSkill = { id: "atk", name: "降龙", category: "外功" as const, damageType: "拳掌" as const, power: 10, mpCost: 0, innerScale: 1.0 }
  const withInner = mk("p1", "player", { innerPower: 20, skills: [innerSkill] }) // 期望多 20 点攻击力
  const noInner = mk("p2", "player", { skills: [innerSkill] })                    // innerPower 未填 → 不加成
  let sumA = 0, sumB = 0
  const N = 300
  for (let i = 0; i < N; i++) {
    const ra = performAction(st([withInner], [mk("e1", "enemy")]), { actorUid: "p1", skill: innerSkill, targetUids: ["e1"] })
    sumA += ra.results.reduce((s, x) => s + x.damage, 0)
    const rb = performAction(st([noInner], [mk("e2", "enemy")]), { actorUid: "p2", skill: innerSkill, targetUids: ["e2"] })
    sumB += rb.results.reduce((s, x) => s + x.damage, 0)
  }
  const avgA = sumA / N, avgB = sumB / N
  console.log(`  有催动平均伤害: ${avgA.toFixed(1)}，无催动: ${avgB.toFixed(1)}（理论差 ≈20）`)
  check("内功催动显著提升伤害", avgA > avgB + 15, `差值仅 ${avgA - avgB}`)
}

console.log("\n=== 修复验证 2：眩晕（stun）跳过行动、不扣内力 ===")
{
  const p = mk("p1", "player", { statuses: [{ kind: "stun", name: "眩晕", duration: 1, potency: 0 }] })
  const e = mk("e1", "enemy")
  const r = performAction(st([p], [e]), { actorUid: "p1", skill: p.skills[0], targetUids: ["e1"] })
  check("眩晕时不出招（无伤害结果）", r.results.length === 0, `results: ${r.results.length}`)
  check("眩晕有提示日志", r.logs.some((l) => l.text.includes("动弹不得")), `logs: ${r.logs.map((l) => l.text).join("|")}`)
  const after = findCombatant(r.state, "p1")
  check("眩晕不扣内力", !!after && after.mp === 50, `mp: ${after?.mp}`)
  check("敌人未被波及", findCombatant(r.state, "e1")!.hp === 100, `hp: ${findCombatant(r.state, "e1")!.hp}`)
}

console.log("\n=== 修复验证 3：结算结果带 targetUid（飘字精确定位）===")
{
  const sweep = { id: "sweep", name: "横扫", category: "外功" as const, power: 20, mpCost: 0, targeting: "all-enemy" as const }
  const p = mk("p1", "player", { skills: [sweep] })
  const r = performAction(st([p], [mk("e1", "enemy"), mk("e2", "enemy"), mk("e3", "enemy")]), { actorUid: "p1", skill: sweep, targetUids: [] })
  const uids = r.results.map((x) => x.targetUid).sort()
  check("每个结果都带 targetUid", r.results.every((x) => !!x.targetUid), `uids: ${uids.join(",")}`)
  check("三个目标都被命中（按 uid 精确）", JSON.stringify(uids) === JSON.stringify(["e1", "e2", "e3"]), `实际: ${JSON.stringify(uids)}`)
}

console.log(`\n========================================`)
console.log(`通过 ${pass} / 失败 ${fail}`)
console.log(`========================================`)
process.exit(fail > 0 ? 1 : 0)
