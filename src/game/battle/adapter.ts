// ============================================================
// 战斗适配层：连接"游戏世界"（Player/Enemy/根基属性/存档）与"战斗引擎"（Combatant）
// 引擎是纯函数、自包含；适配层负责：
//   1. 把 Player/Enemy 转成引擎认识的 Combatant（含内功催动等推导）
//   2. 把引擎结算结果转回游戏世界的状态
//   3. 处理升级/成长（引擎不管的事）
// 这样引擎保持纯净，所有"耦合游戏系统"的逻辑集中在这一个文件。
// ============================================================

import type { Player, Enemy, Skill } from "../../types"
import type { Combatant, BattleSkill, BattleState, BattleLogEntry, ActionResult } from "./types"
import { recomputePlayerStats, effectiveAttack } from "../attributes"
import { performPlayerSkill as enginePerformPlayer, performEnemySkill as enginePerformEnemy, enemyChooseSkill as engineEnemyChoose } from "./engine"

// 把全局 Skill 转成引擎需要的 BattleSkill（字段是兼容子集）
export function toBattleSkill(skill: Skill): BattleSkill {
  return {
    id: skill.id,
    name: skill.name,
    category: skill.category,
    damageType: skill.damageType,
    power: skill.power,
    mpCost: skill.mpCost,
    effect: skill.effect,
    targeting: (skill as any).targeting,
  }
}

// 把 Player 转成 Combatant。
// 关键：攻击力在此算好（含内功催动），引擎不再关心它怎么来的。
export function playerToCombatant(player: Player): Combatant {
  return {
    uid: "player",
    side: "player",
    atb: 0,
    name: player.name,
    hp: player.hp,
    hpMax: player.hpMax,
    mp: player.mp,
    mpMax: player.mpMax,
    attack: effectiveAttack(player), // 无招式上下文 → 纯外功物理攻击
    defense: player.defense,
    speed: player.speed,
    statuses: player.statuses.map((s) => ({ ...s })),
    skills: player.skills.map(toBattleSkill),
  }
}

// 把 Enemy 转成 Combatant（敌人不走根基体系，直接用其数值）
export function enemyToCombatant(enemy: Enemy): Combatant {
  return {
    uid: enemy.id,
    side: "enemy",
    atb: 0,
    name: enemy.name,
    hp: enemy.hp,
    hpMax: enemy.hpMax,
    mp: enemy.mp,
    mpMax: enemy.mpMax,
    attack: enemy.attack,
    defense: enemy.defense,
    speed: enemy.speed,
    statuses: enemy.statuses.map((s) => ({ ...s })),
    skills: enemy.skills.map(toBattleSkill),
  }
}

// 把多个 Player（主角+队友）转成我方队伍。每个单位分配唯一 uid。
export function playersToSide(players: Player[]): Combatant[] {
  return players.map((p, idx) => ({ ...playerToCombatant(p), uid: `player-${idx}`, side: "player" }))
}

// 把多个 Enemy 转成敌方队伍。同 id 的敌人用序号区分 uid。
export function enemiesToSide(enemies: Enemy[]): Combatant[] {
  return enemies.map((e, idx) => ({ ...enemyToCombatant(e), uid: `enemy-${idx}-${e.id}`, side: "enemy" }))
}

// 构造一场战斗的初始状态
export function createBattleState(players: Player[], enemies: Enemy[]): BattleState {
  return {
    playerSide: playersToSide(players),
    enemySide: enemiesToSide(enemies),
    atbThreshold: 100,
  }
}

// 从 BattleState 把我方某单位的状态写回对应 Player（战斗结束时同步血/蓝/状态）
// 约定：playerSide 的第 idx 个单位对应 players[idx]。
export function syncPlayersFromState(players: Player[], state: BattleState): Player[] {
  return players.map((p, idx) => {
    const c = state.playerSide[idx]
    if (!c) return p
    return { ...p, hp: c.hp, mp: c.mp, statuses: c.statuses }
  })
}

// 计算玩家对某招式的最终攻击力（含内功催动）
export function computeAttackForSkill(player: Player, skill: Skill): number {
  return effectiveAttack(player, skill)
}

// 把引擎结算后的 Combatant 写回 Player（保留成长/经济等字段）
export function combatantBackToPlayer(player: Player, combatant: Combatant): Player {
  return {
    ...player,
    hp: combatant.hp,
    mp: combatant.mp,
    statuses: combatant.statuses,
  }
}

// ---- 兼容包装：让旧式调用（Player/Enemy）平滑工作 ----
export function performPlayerSkillCompat(
  player: Player, enemy: Enemy, skill: Skill
): { player: Player; enemy: Enemy; logs: BattleLogEntry[]; result: ActionResult } {
  const pc = playerToCombatant(player)
  const ec = enemyToCombatant(enemy)
  const bs = toBattleSkill(skill)
  pc.attack = computeAttackForSkill(player, skill)
  const { player: npc, enemy: nec, logs, result } = enginePerformPlayer(pc, ec, bs)
  return {
    player: { ...player, hp: npc.hp, mp: npc.mp, statuses: npc.statuses },
    enemy: { ...enemy, hp: nec.hp, mp: nec.mp, statuses: nec.statuses },
    logs, result,
  }
}

export function performEnemySkillCompat(
  player: Player, enemy: Enemy, skill: Skill
): { player: Player; enemy: Enemy; logs: BattleLogEntry[]; result: ActionResult } {
  const pc = playerToCombatant(player)
  const ec = enemyToCombatant(enemy)
  const bs = toBattleSkill(skill)
  const { player: npc, enemy: nec, logs, result } = enginePerformEnemy(pc, ec, bs)
  return {
    player: { ...player, hp: npc.hp, mp: npc.mp, statuses: npc.statuses },
    enemy: { ...enemy, hp: nec.hp, mp: nec.mp, statuses: nec.statuses },
    logs, result,
  }
}

export function enemyChooseSkillCompat(enemy: Enemy): Skill {
  const ec = enemyToCombatant(enemy)
  const chosen = engineEnemyChoose(ec)
  return enemy.skills.find((s) => s.id === chosen.id) ?? enemy.skills[0]
}

// settleVictory 兼容包装：接受 (player, enemy)
export function settleVictoryCompat(player: Player, enemy: Enemy) {
  return applyVictoryGrowth(player, enemy.expReward, enemy.goldReward)
}

// 战斗胜利后的成长结算（升级）——与存档耦合，从引擎移到这里。
export function applyVictoryGrowth(player: Player, enemyExp: number, enemyGold: number): {
  player: Player
  rewards: { exp: number; gold: number; leveledUp: boolean }
} {
  const p: Player = {
    ...player,
    exp: player.exp + enemyExp,
    gold: player.gold + enemyGold,
  }
  let leveledUp = false
  while (p.exp >= p.expMax) {
    p.exp -= p.expMax
    p.level += 1
    leveledUp = true
    p.attributePoints = (p.attributePoints ?? 0) + 5
    p.expMax = Math.round(p.expMax * 1.3)
  }
  let final = p
  if (leveledUp) {
    final = recomputePlayerStats(p)
    final.hp = final.hpMax
    final.mp = final.mpMax
  }
  return { player: final, rewards: { exp: enemyExp, gold: enemyGold, leveledUp } }
}