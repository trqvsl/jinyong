// ============================================================
// 世界状态：定义、初始化、派生、迁移、按默认值读取
// 引擎与数据都不认识具体 NPC/阵营 id；这里只提供"按 key 取，缺省给默认"的能力。
// ============================================================
import type {
  WorldState, WorldNpcState, WorldFactionState, BeatResult,
} from "../../data/story/schema"
import { ALIGNMENT_THRESHOLDS } from "../../data/story/schema"
import type { Alignment } from "../../types"

export const WORLD_VERSION = 4

// 空世界：所有 Record 初始为空，字段渐进生长
export function createWorld(): WorldState {
  return {
    version: WORLD_VERSION,
    npcs: {},
    factions: {},
    arcs: {},
    flags: {},
    party: { activeNpcIds: [], reserveNpcIds: [] },
    pendingWorldEvents: [],
    triggeredEvents: [],
    seenNodes: [],
    completedEvents: [],
  }
}

// ---- 默认值约定（见手册 3.4）：world 无条目时返回默认，不写入 ----
const DEFAULT_NPC: WorldNpcState = { alive: true, recruited: false, faction: "", fateTags: [] }
const DEFAULT_FACTION: WorldFactionState = { attitude: 0, power: 0 }

export function getNpcState(world: WorldState, npcId: string): WorldNpcState {
  return world.npcs[npcId] ?? DEFAULT_NPC
}
export function getFactionState(world: WorldState, factionId: string): WorldFactionState {
  return world.factions[factionId] ?? DEFAULT_FACTION
}
export function getBeatResult(world: WorldState, arcId: string, beat: string): BeatResult | undefined {
  return world.arcs[arcId]?.beats[beat]
}

// 取某 NPC 的"可变副本"用于写入：返回 prev 的浅拷贝并写回 world.npcs。
// 调用方须保证传入的 world.npcs 已是拷贝（applyConsequences 会先浅拷贝），以免污染原状态。
export function ensureNpc(world: WorldState, npcId: string): WorldNpcState {
  const prev = world.npcs[npcId] ?? DEFAULT_NPC
  const next = { ...prev }
  world.npcs[npcId] = next
  return next
}
export function ensureFaction(world: WorldState, factionId: string): WorldFactionState {
  const prev = world.factions[factionId] ?? DEFAULT_FACTION
  const next = { ...prev }
  world.factions[factionId] = next
  return next
}

// ---- 善恶值 → 阵营枚举（派生）----
export function deriveAlignment(karma: number): Alignment {
  if (karma >= ALIGNMENT_THRESHOLDS.positive) return "正"
  if (karma <= ALIGNMENT_THRESHOLDS.negative) return "邪"
  return "中"
}

// ---- 旧存档迁移：按 version 升级，补全字段 ----
export function migrateWorld(raw: unknown): WorldState {
  const w = createWorld()
  if (!raw || typeof raw !== "object") return w
  const r = raw as Record<string, unknown>
  w.npcs = (r.npcs as WorldState["npcs"]) ?? {}
  w.factions = (r.factions as WorldState["factions"]) ?? {}
  w.arcs = (r.arcs as WorldState["arcs"]) ?? {}
  w.flags = (r.flags as WorldState["flags"]) ?? {}
  w.party = (r.party as WorldState["party"]) ?? { activeNpcIds: [], reserveNpcIds: [] }
  w.pendingWorldEvents = (r.pendingWorldEvents as string[]) ?? []
  w.triggeredEvents = (r.triggeredEvents as string[]) ?? []
  w.seenNodes = (r.seenNodes as string[]) ?? []
  w.completedEvents = (r.completedEvents as string[]) ?? []

  // 旧存档里的 seenNodes 可能仍是裸 nodeId；本轮起只新增 `${eventId}:${nodeId}` 形式的新键，旧值保留兼容即可。

  const legacyPending = typeof w.flags.pendingWorldEventId === "string" ? w.flags.pendingWorldEventId : undefined
  if (legacyPending && !w.pendingWorldEvents.includes(legacyPending)) w.pendingWorldEvents.push(legacyPending)
  if (legacyPending) delete w.flags.pendingWorldEventId

  // 迁移 v0 → v1：旧存档 completedEvents 含射雕事件但无对应 arcBeat
  if (w.completedEvents.includes("shendiao-niujia") && !w.arcs.shendiao?.beats.niujia) {
    if (!w.arcs.shendiao) w.arcs.shendiao = { beats: {} }
    w.arcs.shendiao.beats.niujia = "won"
  }

  // 迁移 v1 → v2：WorldNpcState 新增 relationType（optional，无需数据迁移）
  // 迁移 v2 → v3：pendingWorldEventId 改为 pendingWorldEvents 队列（上方已兼容导入）
  // 迁移 v3 → v4：新增 party 状态（上方已补默认值）
  // 迁移 v4：WorldArcState 可选增加 ending（兼容旧档时保持 undefined 即可）
  w.version = WORLD_VERSION
  return w
}
