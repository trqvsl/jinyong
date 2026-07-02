// ============================================================
// NPC 逻辑模块：纯函数，桥接 NPC 数据与游戏状态
// ============================================================
import type { Player } from "../types"
import type { WorldState } from "../data/story/schema"
import type { Npc } from "../data/npcs"
import type { Combatant } from "./battle/types"
import { checkCondition } from "./story/conditions"
import { getNpcState } from "./story/state"
import { enemyToCombatant } from "./battle/adapter"
import { npcToEnemy } from "../data/npcs"

/**
 * 获取 NPC 当前对话文本
 * 遍历 dialogueVariants，返回第一个条件匹配的文本；无匹配则回退到 dialogue
 */
export function getNpcDialogue(npc: Npc, player: Player, world: WorldState): string {
  if (npc.dialogueVariants && npc.dialogueVariants.length > 0) {
    for (const variant of npc.dialogueVariants) {
      if (checkCondition(player, world, variant.when)) {
        return variant.text
      }
    }
  }
  return npc.dialogue ?? ""
}

/**
 * 判断 NPC 是否可被招募入队
 * 条件：有 recruitCondition + checkCondition 通过 + 尚未 recruited
 */
export function canRecruit(npc: Npc, player: Player, world: WorldState): boolean {
  if (!npc.recruitCondition) return false
  if (getNpcState(world, npc.id).recruited) return false
  if (getNpcState(world, npc.id).alive === false) return false
  return checkCondition(player, world, npc.recruitCondition)
}

/**
 * 把 NPC 转为我方战斗单位（队友参战用）
 * 复用 enemyToCombatant(npcToEnemy) 再覆写 side/uid，零重复逻辑
 */
export function npcToPlayerSideCombatant(npc: Npc): Combatant {
  const base = enemyToCombatant(npcToEnemy(npc))
  return {
    ...base,
    uid: `npc-${npc.id}`,
    side: "player",
  }
}
