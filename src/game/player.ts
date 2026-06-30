import type { Player, Skill } from "../types"
import { getSkillById } from "../data/skills"
import { deriveStats } from "./attributes"
import { createWorld, migrateWorld } from "./story/state"

// ============================================================
// 玩家角色相关逻辑
// ============================================================

const SAVE_KEY = "jinyong-save"

export function createPlayer(name: string): Player {
  // 八大根基属性：力量/外功/内功/悟性/身体/吐纳/身法/福缘
  // 初始值偏低，留给玩家升级分配属性点成长；悟性随机（原 aptitude）
  const roots = {
    strength: 5,
    external: 5,
    internal: 3,
    comprehension: Math.floor(Math.random() * 60) + 40, // 悟性随机 40~100（原 aptitude）
    constitution: 5,
    breath: 5,
    agility: 5,
    luck: Math.floor(Math.random() * 30) + 20, // 福缘随机 20~50
  }
  const derived = deriveStats(roots, 1)
  return {
    name,
    level: 1,
    exp: 0,
    expMax: 100,
    hp: derived.hpMax,
    hpMax: derived.hpMax,
    mp: derived.mpMax,
    mpMax: derived.mpMax,
    attack: derived.attack,
    defense: derived.defense,
    speed: derived.speed,
    roots,
    attributePoints: 5, // 初始 5 点属性点供分配
    mastery: {},
    relations: {},
    gold: 100,
    aptitude: roots.comprehension, // 向后兼容：aptitude 指向悟性
    alignment: "中",
    karma: 0,                       // 善恶值（alignment 由其派生）
    reputation: 0,
    day: 1,
    skills: [getSkillById("changquan")!],
    inventory: {},
    world: createWorld(),           // 剧情世界状态（江湖记忆）
    statuses: [],
  }
}

// ---- 旧存档武功迁移 ----
// 旧版本武功没有 category 字段（只有 type），加载时按 id 对照新数据补全。
// 找不到 id 的武功，按旧字段推断分类（type 存在 → 外功）。
function migrateSkill(old: any): Skill {
  // 优先用新数据源覆盖：保证 category/effect 都是最新的
  const fresh = getSkillById(old.id)
  if (fresh) return fresh
  // 数据源里找不到（自定义武功等），手动补 category
  return {
    id: old.id ?? "unknown",
    name: old.name ?? "未知招式",
    category: old.category ?? "外功",
    damageType: old.damageType ?? old.type,
    power: old.power ?? 0,
    mpCost: old.mpCost ?? 0,
    description: old.description ?? "",
    effect: old.effect,
  }
}

function migratePlayer(p: any): Player {
  // 补 statuses
  if (!p.statuses) p.statuses = []
  if (!p.inventory) p.inventory = {}
  // 迁移到根基属性体系：旧存档没有 roots，按旧战斗属性反推一个合理的根基值
  if (!p.roots) {
    p.roots = {
      strength: 5,
      external: 5,
      internal: 3,
      comprehension: p.aptitude ?? Math.floor(Math.random() * 60) + 40,
      constitution: 5,
      breath: 5,
      agility: 5,
      luck: Math.floor(Math.random() * 30) + 20,
    }
    p.attributePoints = 0
    p.mastery = {}
  }
  if (p.attributePoints === undefined) p.attributePoints = 0
  if (!p.mastery) p.mastery = {}
  if (!p.relations) p.relations = {}
  // 迁移到世界状态体系：补 karma（由旧 alignment 反推）与 world
  if (p.karma === undefined) p.karma = p.alignment === "正" ? 30 : p.alignment === "邪" ? -30 : 0
  p.world = migrateWorld(p.world)   // 总是迁移：补全缺失字段（completedEvents 等），兼容开发期旧存档
  // 迁移武功：确保每个武功都有 category
  if (Array.isArray(p.skills)) {
    p.skills = p.skills.map(migrateSkill)
  } else {
    p.skills = [getSkillById("changquan")!]
  }
  return p as Player
}

// ---- 存档系统 ----

export function savePlayer(player: Player): void {
  localStorage.setItem(SAVE_KEY, JSON.stringify(player))
}

export function loadPlayer(): Player | null {
  const raw = localStorage.getItem(SAVE_KEY)
  if (!raw) return null
  try {
    const p = JSON.parse(raw)
    return migratePlayer(p)
  } catch {
    return null
  }
}

export function hasSave(): boolean {
  return localStorage.getItem(SAVE_KEY) !== null
}

export function deleteSave(): void {
  localStorage.removeItem(SAVE_KEY)
}

// ---- 导出/导入存档码 ----

// UTF-8 安全的 Base64 编解码（替代已废弃的 escape/unescape，后者对 emoji 等字符不稳定）
function utf8ToBase64(str: string): string {
  const bytes = new TextEncoder().encode(str)
  let bin = ""
  for (const b of bytes) bin += String.fromCharCode(b)
  return btoa(bin)
}
function base64ToUtf8(b64: string): string {
  const bin = atob(b64)
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
  return new TextDecoder().decode(bytes)
}

export function exportSaveCode(player: Player): string {
  return utf8ToBase64(JSON.stringify(player))
}

export function importSaveCode(code: string): Player | null {
  try {
    const json = base64ToUtf8(code.trim())
    return migratePlayer(JSON.parse(json))
  } catch {
    return null
  }
}
