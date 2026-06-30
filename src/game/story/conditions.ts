// ============================================================
// 条件解释器：按声明式 Condition 查询玩家+世界状态
// 默认值约定（手册 3.4）：world 无条目时，NPC 默认 alive/recruited=false，
// faction 默认 attitude=0，arc beat 默认未完成。
// ============================================================
import type { Player } from "../../types"
import type { WorldState, Condition } from "../../data/story/schema"
import { getNpcState, getFactionState, getBeatResult } from "./state"

export function checkCondition(player: Player, world: WorldState, cond?: Condition): boolean {
  if (!cond) return true
  switch (cond.kind) {
    case "reputation":
      return inRange(player.reputation, cond.gte, cond.lte)
    case "karma":
      return inRange(player.karma, cond.gte, cond.lte)
    case "relation":
      return inRange(player.relations[cond.npcId] ?? 0, cond.gte, cond.lte)
    case "npcAlive":
      return getNpcState(world, cond.npcId).alive === (cond.alive ?? true)
    case "npcRecruited":
      return getNpcState(world, cond.npcId).recruited
    case "npcHasTag":
      return getNpcState(world, cond.npcId).fateTags.includes(cond.tag)
    case "factionAttitude":
      return inRange(getFactionState(world, cond.factionId).attitude, cond.gte, cond.lte)
    case "arcBeat": {
      const r = getBeatResult(world, cond.arcId, cond.beat)
      if (r === undefined) return false                 // 未完成
      return cond.result === undefined ? true : r === cond.result
    }
    case "flag":
      return cond.eq !== undefined ? world.flags[cond.name] === cond.eq : world.flags[cond.name] !== undefined
    case "hasItem":
      return (player.inventory[cond.id] ?? 0) > 0
    case "hasSkill":
      return player.skills.some((s) => s.id === cond.id)
    case "and":
      return cond.items.every((c) => checkCondition(player, world, c))
    case "or":
      return cond.items.some((c) => checkCondition(player, world, c))
    case "not":
      return !checkCondition(player, world, cond.item)
  }
}

function inRange(v: number, gte?: number, lte?: number): boolean {
  if (gte !== undefined && v < gte) return false
  if (lte !== undefined && v > lte) return false
  return true
}
