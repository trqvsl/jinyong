import type { Player } from "../types"
import type { WorldState, NpcRelationType } from "../data/story/schema"
import { getNpcState } from "./story/state"

// ============================================================
// NPC 关系系统
// relations: { npcId: -100~100 }，0 为中立
// 正数：相识(>0) → 友好(>20) → 知己(>50) → 挚友(>80)
// 负数：不睦(<0) → 敌视(<-20) → 仇敌(<-50)
// relationType: 语义化关系类型（师徒/恋人/仇敌等），优先显示
// ============================================================

// 关系类型 → 显示色调
const RELATION_TONE: Record<NpcRelationType, "enemy" | "neutral" | "friend"> = {
  "仇敌": "enemy",
  "主从": "neutral",
  "初识": "neutral",
  "朋友": "friend",
  "知己": "friend",
  "挚友": "friend",
  "师徒": "friend",
  "同门": "friend",
  "恋人": "friend",
}

export interface RelationLevel {
  label: string        // 档位名称
  tone: "enemy" | "neutral" | "friend"  // 用于着色/语气
  value: number        // 原始数值
  relationType?: NpcRelationType  // 语义关系类型
}

// 取某 NPC 的关系档位
// 传入 world 时优先使用语义关系类型，否则按数值档位
export function getRelationLevel(player: Player, npcId: string, world?: WorldState): RelationLevel {
  const value = player.relations?.[npcId] ?? 0
  const relationType = world ? (getNpcState(world, npcId).relationType) : undefined

  // 有语义关系类型时优先显示
  if (relationType) {
    return { label: relationType, tone: RELATION_TONE[relationType], value, relationType }
  }

  // 无语义类型，按数值档位
  if (value <= -50) return { label: "仇敌", tone: "enemy", value }
  if (value <= -20) return { label: "敌视", tone: "enemy", value }
  if (value < 0) return { label: "不睦", tone: "enemy", value }
  if (value === 0) return { label: "陌生", tone: "neutral", value }
  if (value < 20) return { label: "相识", tone: "friend", value }
  if (value < 50) return { label: "友好", tone: "friend", value }
  if (value < 80) return { label: "知己", tone: "friend", value }
  return { label: "挚友", tone: "friend", value }
}

// 应用一组关系变化（夹在 -100~100）
export function applyRelationChanges(player: Player, changes?: { npcId: string; delta: number }[]): Player {
  if (!changes || changes.length === 0) return player
  const relations = { ...(player.relations ?? {}) }
  for (const c of changes) {
    const cur = relations[c.npcId] ?? 0
    relations[c.npcId] = Math.max(-100, Math.min(100, cur + c.delta))
  }
  return { ...player, relations }
}
