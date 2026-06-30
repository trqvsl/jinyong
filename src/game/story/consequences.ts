// ============================================================
// 后果解释器：把声明式 Consequence[] 结算到玩家+世界状态
// - 数值类：{delta} 增减 或 {set} 设绝对值
// - 有界字段夹断（karma/attitude/relation 夹到 ±100，hp/mp 夹到 [0,max]）
// - karma 变化后自动重算 alignment 写回（派生一致性）
// 纯函数：返回新 {player, world}，不修改入参。
// ============================================================
import type { Player } from "../../types"
import type { WorldState, Consequence } from "../../data/story/schema"
import { deriveAlignment, ensureNpc, ensureFaction } from "./state"
import { getSkillById } from "../../data/skills"

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v))

// 数值类：delta 增减 或 set 绝对值（二选一）
function applyNum(current: number, c: { delta?: number; set?: number }): number {
  if (c.set !== undefined) return c.set
  return current + (c.delta ?? 0)
}

export function applyConsequences(
  player: Player, world: WorldState, cs?: Consequence[]
): { player: Player; world: WorldState } {
  if (!cs || cs.length === 0) return { player, world }

  let p: Player = { ...player }
  // 浅拷贝 world 各 Record，使后续 ensure* 写入不污染原 world
  let w: WorldState = {
    ...world,
    npcs: { ...world.npcs },
    factions: { ...world.factions },
    arcs: { ...world.arcs },
    flags: { ...world.flags },
    triggeredEvents: [...world.triggeredEvents],
    seenNodes: [...world.seenNodes],
  }
  let karmaChanged = false

  for (const c of cs) {
    switch (c.kind) {
      case "reputation": p.reputation = applyNum(p.reputation, c); break
      case "karma": p.karma = clamp(applyNum(p.karma, c), -100, 100); karmaChanged = true; break
      case "gold": p.gold = Math.max(0, applyNum(p.gold, c)); break
      case "exp": p.exp = Math.max(0, p.exp + (c.delta ?? 0)); break
      case "hp": p.hp = clamp(p.hp + (c.delta ?? 0), 0, p.hpMax); break
      case "mp": p.mp = clamp(p.mp + (c.delta ?? 0), 0, p.mpMax); break
      case "aptitude": p.aptitude = clamp(p.aptitude + (c.delta ?? 0), 0, 99); break
      case "attack": p.attack = Math.max(0, p.attack + (c.delta ?? 0)); break
      case "speed": p.speed = Math.max(0, p.speed + (c.delta ?? 0)); break
      case "item": {
        const count = c.count ?? 1
        p.inventory = { ...p.inventory, [c.id]: Math.max(0, (p.inventory[c.id] ?? 0) + count) }
        break
      }
      case "skill": {
        if (!p.skills.some((s) => s.id === c.id)) {
          const sk = getSkillById(c.id)
          if (sk) p.skills = [...p.skills, sk]
        }
        break
      }
      case "relation": {
        const cur = p.relations[c.npcId] ?? 0
        p.relations = { ...p.relations, [c.npcId]: clamp(cur + c.delta, -100, 100) }
        break
      }
      case "npcAlive": ensureNpc(w, c.npcId).alive = c.alive; break
      case "npcRecruit": ensureNpc(w, c.npcId).recruited = c.recruited; break
      case "npcFaction": ensureNpc(w, c.npcId).faction = c.faction; break
      case "npcTag": {
        const n = ensureNpc(w, c.npcId)
        const add = c.add ?? true
        n.fateTags = add
          ? (n.fateTags.includes(c.tag) ? n.fateTags : [...n.fateTags, c.tag])
          : n.fateTags.filter((t) => t !== c.tag)
        break
      }
      case "factionAttitude":
        ensureFaction(w, c.factionId).attitude = clamp(applyNum(getFactionAttitude(w, c.factionId), c), -100, 100)
        break
      case "factionPower":
        ensureFaction(w, c.factionId).power = applyNum(getFactionPower(w, c.factionId), c)
        break
      case "arcBeat": {
        if (!w.arcs[c.arcId]) w.arcs[c.arcId] = { beats: {} }
        w.arcs[c.arcId].beats[c.beat] = c.result
        break
      }
      case "flag": w.flags = { ...w.flags, [c.name]: c.value }; break
    }
  }

  if (karmaChanged) p.alignment = deriveAlignment(p.karma)
  return { player: p, world: w }
}

// 取当前态度/势力（用于 set 模式的基准值；ensureFaction 已在上面建好可变副本）
function getFactionAttitude(w: WorldState, id: string): number {
  return w.factions[id]?.attitude ?? 0
}
function getFactionPower(w: WorldState, id: string): number {
  return w.factions[id]?.power ?? 0
}
