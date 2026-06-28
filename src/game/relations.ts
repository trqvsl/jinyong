import type { Player } from "../types"

// ============================================================
// NPC 关系系统
// relations: { npcId: -100~100 }，0 为中立
// 正数：相识(>0) → 友好(>20) → 知己(>50) → 挚友(>80)
// 负数：不睦(<0) → 敌视(<-20) → 仇敌(<-50)
// ============================================================

export interface RelationLevel {
  label: string        // 档位名称
  tone: "enemy" | "neutral" | "friend"  // 用于着色/语气
  value: number        // 原始数值
}

// 取某 NPC 的关系档位
export function getRelationLevel(player: Player, npcId: string): RelationLevel {
  const value = player.relations?.[npcId] ?? 0
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