// 2v2 多对多专项验证
import { type Combatant, type BattleState } from "../src/game/battle/types"
import { performAction, advanceAtb, nextActor, checkBattleEndBySide, previewTurnOrder, tickUnitStatuses, enemyDecideAction, findCombatant } from "../src/game/battle/engine"

function mk(uid: string, side: "player"|"enemy", name: string, spd: number, atk: number, hp: number): Combatant {
  return { uid, side, name, hp, hpMax: hp, mp: 50, mpMax: 50, attack: atk, defense: 8, speed: spd, statuses: [], atb: 0,
    skills: [{ id: "atk", name: "普攻", category: "外功", damageType: "拳掌", power: 18, mpCost: 0 }] }
}

console.log("\n=== 2v2 多对多验证 ===")
const p1 = mk("p1", "player", "我方甲", 45, 20, 120)
const p2 = mk("p2", "player", "我方乙", 35, 18, 100)
const e1 = mk("e1", "enemy", "敌方甲", 40, 17, 110)
const e2 = mk("e2", "enemy", "敌方乙", 50, 19, 95)
let state: BattleState = { playerSide: [p1, p2], enemySide: [e1, e2], atbThreshold: 100 }

const order = previewTurnOrder(state, 8)
console.log("行动顺序预览:", order.map(o => `${o.side==="player"?"我":"敌"}${o.name.slice(2)}`).join(" → "))

let turns = 0
while (checkBattleEndBySide(state) === "ongoing" && turns < 60) {
  state = advanceAtb(state)
  const actor = nextActor(state)
  if (!actor) { turns++; continue }
  const t = tickUnitStatuses(state, actor.uid); state = t.state
  if (checkBattleEndBySide(state) !== "ongoing") break
  const cur = findCombatant(state, actor.uid)!
  if (cur.hp <= 0) continue
  if (actor.side === "player") {
    const enemies = state.enemySide.filter(x => x.hp > 0).sort((a,b)=>a.hp-b.hp)
    const r = performAction(state, { actorUid: actor.uid, skill: cur.skills[0], targetUids: [enemies[0].uid] })
    state = r.state
  } else {
    const cmd = enemyDecideAction(state, cur)
    if (cmd) { const r = performAction(state, cmd); state = r.state }
  }
  const consume = (c: Combatant) => c.uid === actor.uid ? { ...c, atb: Math.max(0, c.atb - 100) } : c
  state = { ...state, playerSide: state.playerSide.map(consume), enemySide: state.enemySide.map(consume) }
  turns++
}
const result = checkBattleEndBySide(state)
const aliveP = state.playerSide.filter(x => x.hp > 0).length
const aliveE = state.enemySide.filter(x => x.hp > 0).length
console.log(`跑了 ${turns} 回合，结局: ${result}，存活 我方${aliveP}/敌方${aliveE}`)
console.log(result === "won" || result === "lost" ? "✓ 2v2 多对多完整跑通" : "✗ 异常")