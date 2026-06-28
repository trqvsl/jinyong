// ============================================================
// 战斗模块门面（对外统一入口）
// 外部只从这里 import，不直接碰 engine/adapter 内部。
//
// 设计：
//   - 引擎（engine.ts）是纯函数，只认 Combatant/BattleSkill，与游戏世界解耦
//   - 适配层（adapter.ts）处理 Player↔Combatant 转换、内功催动、成长结算
//   - 这里对外暴露"兼容包装"，让 BattleScreen 用 Player/Enemy 调用，内部自动转 Combatant
//     因此 performPlayerSkill / settleVictory 等导出名与旧 battle.ts 兼容，界面层无需大改
// ============================================================

// 状态/伤害结算纯函数（不涉及单位类型转换的，直接来自引擎）
export {
  statusDisplayName,
  effectiveStats,
  tickStatuses,
  isStunned,
  resolveExternalAttack,
  checkBattleEnd,
} from "./engine"

// 适配层：Player↔Combatant 转换 + 成长结算
export {
  playerToCombatant,
  enemyToCombatant,
  computeAttackForSkill,
  combatantBackToPlayer,
  applyVictoryGrowth,
} from "./adapter"

// 兼容包装（对外保留旧导出名，签名兼容 Player/Enemy）
export {
  performPlayerSkillCompat as performPlayerSkill,
  performEnemySkillCompat as performEnemySkill,
  enemyChooseSkillCompat as enemyChooseSkill,
  settleVictoryCompat as settleVictory,
} from "./adapter"

// 类型
export type { Combatant, BattleSkill, BattleLogEntry, ActionResult, StatusEffect, StatusKind } from "./types"
