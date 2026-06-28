import type {
  Skill, Player, Enemy, ActionResult, BattleLogEntry,
  StatusEffect, StatusKind,
} from "../types"

// ============================================================
// 战斗核心逻辑（四类武功体系版）
// 四类武功各有不同的结算逻辑：
//   外功：造成伤害
//   内功：给自己挂增益/治疗状态
//   轻功：给自己挂身法增益
//   奇门：给敌人挂毒/削弱/眩晕
// 每回合开始时结算所有状态（中毒掉血、增益加成、回春回血、眩晕跳过）。
// ============================================================

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function clone<T>(obj: T): T {
  return structuredClone(obj)
}

// 状态的中文名（用于日志）
const STATUS_NAMES: Record<StatusKind, string> = {
  "poison": "中毒",
  "buff-atk": "攻击强化",
  "buff-def": "防御强化",
  "buff-spd": "身法提升",
  "heal": "回春",
  "stun": "眩晕",
  "shield": "护盾",
}

export function statusDisplayName(kind: StatusKind): string {
  return STATUS_NAMES[kind]
}

// 计算某单位当前的实际属性（含增益/削弱状态）
export function effectiveStats(unit: Player | Enemy) {
  let atk = unit.attack
  let def = unit.defense
  let spd = unit.speed
  for (const s of unit.statuses) {
    if (s.kind === "buff-atk") atk += s.potency
    if (s.kind === "buff-def") def += s.potency
    if (s.kind === "buff-spd") spd += s.potency
  }
  return { attack: atk, defense: def, speed: spd }
}

// 护盾减伤：返回应扣减的护盾值
function getShield(unit: Player | Enemy): number {
  const shield = unit.statuses.find((s) => s.kind === "shield")
  return shield ? shield.potency : 0
}

// 对一个单位施加伤害（考虑护盾）
function dealDamage(unit: Player | Enemy, raw: number): { unit: Player | Enemy; logged: number; absorbed: number } {
  const u = clone(unit)
  const shield = getShield(u)
  const absorbed = Math.min(shield, raw)
  const logged = Math.max(0, raw - absorbed)
  u.hp = Math.max(0, u.hp - logged)
  // 若有护盾，扣减护盾值
  if (absorbed > 0) {
    const sIdx = u.statuses.findIndex((s) => s.kind === "shield")
    if (sIdx >= 0) {
      u.statuses[sIdx].potency -= absorbed
      if (u.statuses[sIdx].potency <= 0) u.statuses.splice(sIdx, 1)
    }
  }
  return { unit: u, logged, absorbed }
}

// 施加状态到单位身上
function applyStatus(unit: Player | Enemy, effect: Skill["effect"]): { unit: Player | Enemy; applied: boolean; name: string } {
  if (!effect) return { unit, applied: false, name: "" }
  const u = clone(unit)
  // 同类状态覆盖（不叠加），刷新持续时间和强度
  const existing = u.statuses.findIndex((s) => s.kind === effect.kind && s.potency >= 0 === effect.potency >= 0)
  const newStatus: StatusEffect = {
    kind: effect.kind,
    name: STATUS_NAMES[effect.kind],
    duration: effect.duration,
    potency: effect.potency,
  }
  if (existing >= 0) {
    u.statuses[existing] = newStatus
  } else {
    u.statuses.push(newStatus)
  }
  return { unit: u, applied: true, name: STATUS_NAMES[effect.kind] }
}

// ---- 回合开始时结算所有状态 ----
// 返回结算后的新状态 + 这一回合状态产生的日志
export function tickStatuses<T extends Player | Enemy>(unit: T): { unit: T; logs: BattleLogEntry[] } {
  const u = clone(unit)
  const logs: BattleLogEntry[] = []
  const remaining: StatusEffect[] = []

  for (const s of u.statuses) {
    let dur = s.duration - 1

    if (s.kind === "poison") {
      // 中毒：每回合开始掉血
      u.hp = Math.max(0, u.hp - s.potency)
      logs.push({ text: `${u.name}身中剧毒，损失${s.potency}点气血`, type: "poison" })
    } else if (s.kind === "heal") {
      // 回春：每回合回血
      const healed = Math.min(s.potency, u.hpMax - u.hp)
      if (healed > 0) {
        u.hp += healed
        logs.push({ text: `${u.name}运功疗伤，回复${healed}点气血`, type: "status" })
      }
    }
    // 其他状态（增益/眩晕/护盾）不在 tick 时产生数值，只递减持续时间

    if (dur > 0) {
      remaining.push({ ...s, duration: dur })
    } else {
      logs.push({ text: `${u.name}的${s.name}效果消退`, type: "status" })
    }
  }
  u.statuses = remaining
  return { unit: u as T, logs }
}

// 检查单位是否被眩晕（跳过回合）
export function isStunned(unit: Player | Enemy): boolean {
  return unit.statuses.some((s) => s.kind === "stun")
}

// ---- 外功攻击结算 ----
export function resolveExternalAttack(
  attacker: Player | Enemy,
  defender: Player | Enemy,
  skill: Skill
): ActionResult {
  const atk = effectiveStats(attacker)
  const def = effectiveStats(defender)

  // 闪避判定（基于身法差）
  const speedDiff = def.speed - atk.speed
  const dodgeChance = Math.max(0, Math.min(0.4, (speedDiff / 10) * 0.12))
  if (Math.random() < dodgeChance) {
    return { damage: 0, isCrit: false, isDodge: true, mpUsed: skill.mpCost, skillName: skill.name }
  }

  // 基础伤害
  const raw = skill.power + atk.attack - def.defense
  const fluct = randInt(-15, 15) / 100
  let damage = Math.max(1, Math.round(raw * (1 + fluct)))

  // 暴击
  const isCrit = Math.random() < 0.1
  if (isCrit) damage = Math.round(damage * 1.5)

  return { damage, isCrit, isDodge: false, mpUsed: skill.mpCost, skillName: skill.name }
}

// ---- 玩家使用武功（统一入口，按 category 分流） ----
export function performPlayerSkill(
  player: Player, enemy: Enemy, skill: Skill
): { player: Player; enemy: Enemy; logs: BattleLogEntry[]; result: ActionResult } {
  const logs: BattleLogEntry[] = []
  let p = clone(player)
  let e = clone(enemy)
  p.mp = Math.max(0, p.mp - skill.mpCost)

  const result: ActionResult = {
    damage: 0, isCrit: false, isDodge: false,
    mpUsed: skill.mpCost, skillName: skill.name,
  }

  // 兜底：缺 category 的武功（理论上迁移后不会出现）按外功处理，避免 0 伤害
  const cat = skill.category ?? "外功"
  if (cat === "外功") {
    // 外功：直接造成伤害
    const r = resolveExternalAttack(p, e, skill)
    result.isCrit = r.isCrit
    result.isDodge = r.isDodge
    if (r.isDodge) {
      logs.push({ text: `${e.name}身法灵动，闪开了你的${skill.name}！`, type: "dodge" })
    } else {
      const dd = dealDamage(e, r.damage)
      e = dd.unit as Enemy
      result.damage = r.damage
      logs.push({
        text: `你施展${skill.name}，${r.isCrit ? "暴击！" : ""}对${e.name}造成${dd.logged}点伤害${dd.absorbed > 0 ? `（护盾抵消${dd.absorbed}）` : ""}`,
        type: r.isCrit ? "crit" : "player",
      })
    }
    // 外功可能附带效果（奇门类的外功，如化骨绵掌）
    if (skill.effect && !r.isDodge) {
      const apply = applyStatus(e, skill.effect)
      if (apply.applied && Math.random() < skill.effect.applyChance) {
        e = apply.unit as Enemy
        result.statusApplied = apply.name
        logs.push({ text: `${e.name}${apply.name}！`, type: "status" })
      }
    }
  } else if (skill.category === "奇门") {
    // 奇门：可能附带少量伤害 + 施加状态
    if (skill.power > 0 && skill.damageType) {
      const r = resolveExternalAttack(p, e, skill)
      if (!r.isDodge) {
        const dd = dealDamage(e, r.damage)
        e = dd.unit as Enemy
        result.damage = r.damage
        logs.push({ text: `你以${skill.name}伤敌，造成${dd.logged}点伤害`, type: "player" })
      }
    }
    // 施加状态
    if (skill.effect) {
      if (Math.random() < skill.effect.applyChance) {
        const apply = applyStatus(e, skill.effect)
        e = apply.unit as Enemy
        result.statusApplied = apply.name
        if (skill.effect.kind === "stun") {
          logs.push({ text: `你施展${skill.name}！${e.name}被${apply.name}，将跳过下一回合`, type: "status" })
        } else if (skill.effect.potency < 0) {
          logs.push({ text: `你施展${skill.name}！${e.name}攻击被削弱`, type: "status" })
        } else {
          logs.push({ text: `你施展${skill.name}！${e.name}${apply.name}，将持续掉血`, type: "poison" })
        }
      } else {
        logs.push({ text: `你施展${skill.name}，但被${e.name}抗住了！`, type: "system" })
      }
    }
  } else if (skill.category === "内功" || skill.category === "轻功") {
    // 内功/轻功：给自己施加增益/治疗状态
    if (skill.effect) {
      const apply = applyStatus(p, skill.effect)
      p = apply.unit as Player
      result.statusApplied = apply.name
      logs.push({ text: `你运起${skill.name}，${apply.name}！`, type: "status" })
    }
  }

  return { player: p, enemy: e, logs, result }
}

// ---- 敌人使用武功（AI 入口） ----
export function performEnemySkill(
  player: Player, enemy: Enemy, skill: Skill
): { player: Player; enemy: Enemy; logs: BattleLogEntry[]; result: ActionResult } {
  const logs: BattleLogEntry[] = []
  let p = clone(player)
  let e = clone(enemy)
  e.mp = Math.max(0, e.mp - skill.mpCost)

  const result: ActionResult = {
    damage: 0, isCrit: false, isDodge: false,
    mpUsed: skill.mpCost, skillName: skill.name,
  }

  // 兜底：缺 category 的武功（理论上迁移后不会出现）按外功处理，避免 0 伤害
  const cat = skill.category ?? "外功"
  if (cat === "外功") {
    const r = resolveExternalAttack(e, p, skill)
    result.isCrit = r.isCrit
    result.isDodge = r.isDodge
    if (r.isDodge) {
      logs.push({ text: `你身法如风，闪开了${e.name}的${skill.name}！`, type: "dodge" })
    } else {
      const dd = dealDamage(p, r.damage)
      p = dd.unit as Player
      result.damage = r.damage
      logs.push({
        text: `${e.name}使出${skill.name}，${r.isCrit ? "暴击！" : ""}对你造成${dd.logged}点伤害${dd.absorbed > 0 ? `（护盾抵消${dd.absorbed}）` : ""}`,
        type: r.isCrit ? "crit" : "enemy",
      })
    }
    if (skill.effect && !r.isDodge) {
      const apply = applyStatus(p, skill.effect)
      if (apply.applied && Math.random() < skill.effect.applyChance) {
        p = apply.unit as Player
        result.statusApplied = apply.name
        logs.push({ text: `你${apply.name}！`, type: "status" })
      }
    }
  } else if (skill.category === "奇门") {
    if (skill.power > 0 && skill.damageType) {
      const r = resolveExternalAttack(e, p, skill)
      if (!r.isDodge) {
        const dd = dealDamage(p, r.damage)
        p = dd.unit as Player
        result.damage = r.damage
        logs.push({ text: `${e.name}以${skill.name}伤你，造成${dd.logged}点伤害`, type: "enemy" })
      }
    }
    if (skill.effect && Math.random() < skill.effect.applyChance) {
      const apply = applyStatus(p, skill.effect)
      p = apply.unit as Player
      result.statusApplied = apply.name
      logs.push({ text: `${e.name}施展${skill.name}！你${apply.name}`, type: "poison" })
    }
  } else if (skill.category === "内功" || skill.category === "轻功") {
    if (skill.effect) {
      const apply = applyStatus(e, skill.effect)
      e = apply.unit as Enemy
      result.statusApplied = apply.name
      logs.push({ text: `${e.name}运起${skill.name}，${apply.name}！`, type: "status" })
    }
  }

  return { player: p, enemy: e, logs, result }
}

// ---- 敌人 AI：根据自身状态和内力选招 ----
export function enemyChooseSkill(enemy: Enemy): Skill {
  const skills = enemy.skills
  // 优先级：低血量且会内功 → 先回血；否则用最强招式
  // 若内力不够放绝学，退回第一招
  const lowHp = enemy.hp < enemy.hpMax * 0.4
  const neigong = skills.find((s) => s.category === "内功")
  if (lowHp && neigong && enemy.mp >= neigong.mpCost) {
    return neigong
  }
  // 优先用能放的、威力高的外功/奇门
  const usable = skills.filter((s) => enemy.mp >= s.mpCost)
  const pool = usable.length > 0 ? usable : skills
  // 在外功/奇门里选威力最高的
  const offensive = pool.filter((s) => s.category === "外功" || s.category === "奇门")
  if (offensive.length > 0) {
    return offensive.sort((a, b) => b.power - a.power)[0]
  }
  return pool[0]
}

// ---- 战斗胜利结算 ----
export function settleVictory(player: Player, enemy: Enemy): {
  player: Player
  rewards: { exp: number; gold: number; leveledUp: boolean }
} {
  const p = clone(player)
  p.exp += enemy.expReward
  p.gold += enemy.goldReward
  let leveledUp = false
  while (p.exp >= p.expMax) {
    p.exp -= p.expMax
    p.level += 1
    leveledUp = true
    p.hpMax += 20
    p.mpMax += 10
    p.attack += 4
    p.defense += 2
    p.speed += 2
    p.expMax = Math.round(p.expMax * 1.3)
    p.hp = p.hpMax
    p.mp = p.mpMax
  }
  return { player: p, rewards: { exp: enemy.expReward, gold: enemy.goldReward, leveledUp } }
}

export function checkBattleEnd(player: Player, enemy: Enemy): "ongoing" | "won" | "lost" {
  if (enemy.hp <= 0) return "won"
  if (player.hp <= 0) return "lost"
  return "ongoing"
}
