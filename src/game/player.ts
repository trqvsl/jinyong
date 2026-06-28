import type { Player, Skill } from "../types"
import { getSkillById } from "../data/skills"

// ============================================================
// 玩家角色相关逻辑
// ============================================================

const SAVE_KEY = "jinyong-save"

export function createPlayer(name: string): Player {
  return {
    name,
    level: 1,
    exp: 0,
    expMax: 100,
    hp: 100,
    hpMax: 100,
    mp: 50,
    mpMax: 50,
    attack: 15,
    defense: 8,
    speed: 12,
    gold: 100,
    aptitude: Math.floor(Math.random() * 60) + 40,
    alignment: "中",
    reputation: 0,
    day: 1,
    skills: [getSkillById("changquan")!],
    inventory: {},
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

export function exportSaveCode(player: Player): string {
  return btoa(unescape(encodeURIComponent(JSON.stringify(player))))
}

export function importSaveCode(code: string): Player | null {
  try {
    const json = decodeURIComponent(escape(atob(code.trim())))
    return migratePlayer(JSON.parse(json))
  } catch {
    return null
  }
}
