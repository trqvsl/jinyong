// ============================================================
// 战斗引擎核心（纯函数，自包含）
// 输入：战斗状态（Combatant + BattleSkill）→ 输出：新战斗状态
// 不依赖 React、不依赖 Player/存档/根基属性。
// 攻击力等"含根基推导的值"由外部适配层算好后传入，引擎不关心来源。
// ============================================================

import type {
  BattleSkill, Combatant, ActionResult, BattleLogEntry,
  StatusEffect, StatusKind, SkillEffect,
} from "./types"

// ============================================================
// 工具
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

// ============================================================
// 属性 / 状态结算
// ============================================================

// 计算某单位当前的实际属性（含增益/削弱状态）
export function effectiveStats(unit: Combatant) {
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

// 护盾减伤：返回当前护盾值
function getShield(unit: Combatant): number {
  const shield = unit.statuses.find((s) => s.kind === "shield")
  return shield ? shield.potency : 0
}

// 对一个单位施加伤害（考虑护盾）
function dealDamage(unit: Combatant, raw: number): { unit: Combatant; logged: number; absorbed: number } {
  const u = clone(unit)
  const shield = getShield(u)
  const absorbed = Math.min(shield, raw)
  const logged = Math.max(0, raw - absorbed)
  u.hp = Math.max(0, u.hp - logged)
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
function applyStatus(unit: Combatant, effect: SkillEffect | undefined): { unit: Combatant; applied: boolean; name: string } {
  if (!effect) return { unit, applied: false, name: "" }
  const u = clone(unit)
  const existing = u.statuses.findIndex((s) => s.kind === effect.kind)
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

// 回合开始时结算所有状态
export function tickStatuses<T extends Combatant>(unit: T): { unit: T; logs: BattleLogEntry[] } {
  const u = clone(unit)
  const logs: BattleLogEntry[] = []
  const remaining: StatusEffect[] = []

  for (const s of u.statuses) {
    let dur = s.duration - 1

    if (s.kind === "poison") {
      u.hp = Math.max(0, u.hp - s.potency)
      logs.push({ text: `${u.name}身中剧毒，损失${s.potency}点气血`, type: "poison" })
    } else if (s.kind === "heal") {
      const healed = Math.min(s.potency, u.hpMax - u.hp)
      if (healed > 0) {
        u.hp += healed
        logs.push({ text: `${u.name}运功疗伤，回复${healed}点气血`, type: "status" })
      }
    }

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
export function isStunned(unit: Combatant): boolean {
  return unit.statuses.some((s) => s.kind === "stun")
}

// ============================================================
// 伤害公式
// ============================================================

// 外功攻击结算（含闪避/暴击）
export function resolveExternalAttack(
  attacker: Combatant,
  defender: Combatant,
  skill: BattleSkill
): ActionResult {
  const atk = effectiveStats(attacker)
  const def = effectiveStats(defender)

  // 内功催动：按当前招式的 innerScale，把攻击者的内功根基临时叠加到攻击力
  // （innerPower 由适配层从 roots.internal 填入；敌人/未填则为 0）
  const innerBoost = skill.innerScale && attacker.innerPower
    ? Math.round(attacker.innerPower * skill.innerScale)
    : 0
  const atkValue = atk.attack + innerBoost

  // 闪避：根基闪避率（身法/福缘推导，适配层填入）+ 小幅速度差修正
  const speedDiff = def.speed - atk.speed
  const dodgeChance = Math.max(0, Math.min(0.5, (defender.dodgeRate ?? 0.05) + (speedDiff / 10) * 0.04))
  if (Math.random() < dodgeChance) {
    return { damage: 0, isCrit: false, isDodge: true, mpUsed: skill.mpCost, skillName: skill.name }
  }

  // 基础伤害
  const raw = skill.power + atkValue - def.defense
  const fluct = randInt(-15, 15) / 100
  let damage = Math.max(1, Math.round(raw * (1 + fluct)))

  // 暴击：根基暴击率（身法推导，适配层填入）
  const critChance = Math.min(0.6, attacker.critRate ?? 0.1)
  const isCrit = Math.random() < critChance
  if (isCrit) damage = Math.round(damage * 1.5)

  return { damage, isCrit, isDodge: false, mpUsed: skill.mpCost, skillName: skill.name }
}

// ============================================================
// 出招结算（统一入口，按 category 分流）
// ============================================================

// 一方对另一方出招的通用结算（攻方 vs 守方）
// 注意：这里不区分"玩家/敌人"，由调用方决定谁攻谁守。
function performSkill(
  attacker: Combatant,
  defender: Combatant,
  skill: BattleSkill,
  logs: BattleLogEntry[],
  labels: { attackerName: string; isPlayer: boolean }
): { attacker: Combatant; defender: Combatant; result: ActionResult } {
  let a = clone(attacker)
  let d = clone(defender)
  a.mp = Math.max(0, a.mp - skill.mpCost)

  const result: ActionResult = {
    damage: 0, isCrit: false, isDodge: false,
    mpUsed: skill.mpCost, skillName: skill.name,
  }

  const cat = skill.category ?? "外功"
  const you = labels.isPlayer ? "你" : a.name
  const foe = labels.isPlayer ? d.name : "你"

  if (cat === "外功") {
    // 外功：直接造成伤害
    const r = resolveExternalAttack(a, d, skill)
    result.isCrit = r.isCrit
    result.isDodge = r.isDodge
    if (r.isDodge) {
      logs.push({ text: `${foe}身法灵动，闪开了${you}的${skill.name}！`, type: "dodge" })
    } else {
      const dd = dealDamage(d, r.damage)
      d = dd.unit
      result.damage = r.damage
      logs.push({
        text: `${you}施展${skill.name}，${r.isCrit ? "暴击！" : ""}对${foe}造成${dd.logged}点伤害${dd.absorbed > 0 ? `（护盾抵消${dd.absorbed}）` : ""}`,
        type: r.isCrit ? "crit" : (labels.isPlayer ? "player" : "enemy"),
      })
    }
    // 外功可能附带效果（奇门类的外功）
    if (skill.effect && !r.isDodge) {
      const apply = applyStatus(d, skill.effect)
      if (apply.applied && Math.random() < skill.effect.applyChance) {
        d = apply.unit
        result.statusApplied = apply.name
        logs.push({ text: `${foe}${apply.name}！`, type: "status" })
      }
    }
  } else if (cat === "奇门") {
    if (skill.power > 0 && skill.damageType) {
      const r = resolveExternalAttack(a, d, skill)
      if (!r.isDodge) {
        const dd = dealDamage(d, r.damage)
        d = dd.unit
        result.damage = r.damage
        logs.push({ text: `${you}以${skill.name}伤敌，造成${dd.logged}点伤害`, type: labels.isPlayer ? "player" : "enemy" })
      }
    }
    if (skill.effect) {
      if (Math.random() < skill.effect.applyChance) {
        const apply = applyStatus(d, skill.effect)
        d = apply.unit
        result.statusApplied = apply.name
        if (skill.effect.kind === "stun") {
          logs.push({ text: `${you}施展${skill.name}！${foe}被${apply.name}，将跳过下一回合`, type: "status" })
        } else if (skill.effect.potency < 0) {
          logs.push({ text: `${you}施展${skill.name}！${foe}攻击被削弱`, type: "status" })
        } else {
          logs.push({ text: `${you}施展${skill.name}！${foe}${apply.name}，将持续掉血`, type: "poison" })
        }
      } else {
        logs.push({ text: `${you}施展${skill.name}，但被${foe}抗住了！`, type: "system" })
      }
    }
  } else if (cat === "内功" || cat === "轻功") {
    if (skill.effect) {
      const apply = applyStatus(a, skill.effect)
      a = apply.unit
      result.statusApplied = apply.name
      logs.push({ text: `${you}运起${skill.name}，${apply.name}！`, type: "status" })
    }
  }

  return { attacker: a, defender: d, result }
}

// 玩家（我方）出招：玩家为攻方
export function performPlayerSkill(
  player: Combatant, enemy: Combatant, skill: BattleSkill
): { player: Combatant; enemy: Combatant; logs: BattleLogEntry[]; result: ActionResult } {
  const logs: BattleLogEntry[] = []
  const { attacker, defender, result } = performSkill(player, enemy, skill, logs, { attackerName: player.name, isPlayer: true })
  return { player: attacker, enemy: defender, logs, result }
}

// 敌人出招：敌人为攻方
export function performEnemySkill(
  player: Combatant, enemy: Combatant, skill: BattleSkill
): { player: Combatant; enemy: Combatant; logs: BattleLogEntry[]; result: ActionResult } {
  const logs: BattleLogEntry[] = []
  const { attacker, defender, result } = performSkill(enemy, player, skill, logs, { attackerName: enemy.name, isPlayer: false })
  return { player: defender, enemy: attacker, logs, result }
}

// ============================================================
// 敌人 AI
// ============================================================

export function enemyChooseSkill(enemy: Combatant): BattleSkill {
  const skills = enemy.skills
  const lowHp = enemy.hp < enemy.hpMax * 0.4
  const neigong = skills.find((s) => s.category === "内功")
  if (lowHp && neigong && enemy.mp >= neigong.mpCost) {
    return neigong
  }
  const usable = skills.filter((s) => enemy.mp >= s.mpCost)
  const pool = usable.length > 0 ? usable : skills
  const offensive = pool.filter((s) => s.category === "外功" || s.category === "奇门")
  if (offensive.length > 0) {
    return offensive.sort((a, b) => b.power - a.power)[0]
  }
  return pool[0]
}

// ============================================================
// 战斗状态判定
// ============================================================

export function checkBattleEnd(player: Combatant, enemy: Combatant): "ongoing" | "won" | "lost" {
  if (enemy.hp <= 0) return "won"
  if (player.hp <= 0) return "lost"
  return "ongoing"
}


// ============================================================
// 多对多战斗（队伍 + 目标选择 + CTB 行动轴）
// 一对一是其退化情形（双方各 1 人）。以下函数纯函数，自包含。
// ============================================================

import type { BattleState, ActionCommand, SkillTargeting, TurnOrderEntry } from "./types"

// 默认 ATB 阈值
const DEFAULT_ATB_THRESHOLD = 100

// 找单位（在 BattleState 里按 uid）
export function findCombatant(state: BattleState, uid: string): Combatant | undefined {
  return [...state.playerSide, ...state.enemySide].find((c) => c.uid === uid)
}

// 某方是否全灭
export function sideDefeated(side: Combatant[]): boolean {
  return side.every((c) => c.hp <= 0)
}

// 按队伍判胜负（替代旧的单体 checkBattleEnd）
export function checkBattleEndBySide(state: BattleState): "ongoing" | "won" | "lost" {
  if (sideDefeated(state.enemySide)) return "won"
  if (sideDefeated(state.playerSide)) return "lost"
  return "ongoing"
}

// CTB：给所有单位推进行动值。返回新 state（不修改原）。
// 推进量 = 最小时间步，直到至少有一个单位达到阈值。
export function advanceAtb(state: BattleState): BattleState {
  const threshold = state.atbThreshold || DEFAULT_ATB_THRESHOLD
  const all = [...state.playerSide, ...state.enemySide].filter((c) => c.hp > 0)
  if (all.length === 0) return state

  // 找到最快达到阈值所需的步数
  let steps = Infinity
  for (const c of all) {
    if (c.speed <= 0) continue
    const need = Math.max(0, threshold - c.atb)
    const s = Math.ceil(need / c.speed)
    if (s < steps) steps = s
  }
  if (steps === Infinity || steps <= 0) steps = 1

  const bump = (c: Combatant): Combatant => (c.hp > 0 ? { ...c, atb: c.atb + c.speed * steps } : c)
  return {
    ...state,
    playerSide: state.playerSide.map(bump),
    enemySide: state.enemySide.map(bump),
  }
}

// 取下一个获得行动权的单位（ATB 达到阈值）。未达到则返回 undefined（需先 advanceAtb）。
export function nextActor(state: BattleState): Combatant | undefined {
  const threshold = state.atbThreshold || DEFAULT_ATB_THRESHOLD
  const all = [...state.playerSide, ...state.enemySide].filter((c) => c.hp > 0 && c.atb >= threshold)
  if (all.length === 0) return undefined
  // ATB 最高的优先；同值则速度高者优先
  all.sort((a, b) => b.atb - a.atb || b.speed - a.speed)
  return all[0]
}

// 预览未来若干步行动顺序（供界面画时间轴）
export function previewTurnOrder(state: BattleState, lookAhead = 6): TurnOrderEntry[] {
  let sim = structuredClone(state)
  // 归一化：把所有 atb 调到基准（相对进度）
  const order: TurnOrderEntry[] = []
  for (let i = 0; i < lookAhead * 3 && order.length < lookAhead; i++) {
    sim = advanceAtb(sim)
    const actor = nextActor(sim)
    if (!actor) break
    sim = applyAtbConsume(sim, actor.uid)
    order.push({ uid: actor.uid, name: actor.name, side: actor.side })
  }
  return order
}

// 某单位行动后消耗 ATB（-= 阈值，保留余量）
export function applyAtbConsume(state: BattleState, uid: string): BattleState {
  const threshold = state.atbThreshold || DEFAULT_ATB_THRESHOLD
  const map = (c: Combatant): Combatant => (c.uid === uid ? { ...c, atb: Math.max(0, c.atb - threshold) } : c)
  return { ...state, playerSide: state.playerSide.map(map), enemySide: state.enemySide.map(map) }
}

// 根据招式目标模式，把"已选目标"解析为实际受击单位 uid 列表
// actorSide: 出手者阵营；chosenUids: 玩家手动选的（单体时）；state 用于取全体
export function resolveTargets(
  state: BattleState, actor: Combatant, targeting: SkillTargeting, chosenUids: string[]
): Combatant[] {
  const enemies = actor.side === "player" ? state.enemySide : state.playerSide
  const allies = actor.side === "player" ? state.playerSide : state.enemySide
  const aliveEnemies = enemies.filter((c) => c.hp > 0)
  const aliveAllies = allies.filter((c) => c.hp > 0)

  switch (targeting) {
    case "single":
      return chosenUids.map((uid) => findCombatant(state, uid)).filter((c): c is Combatant => !!c && c.hp > 0)
    case "all-enemy":
      return aliveEnemies
    case "spread2":
      return aliveEnemies.slice(0, 2)
    case "random3": {
      // Fisher-Yates 洗牌（sort + Math.random 有统计偏差），取前 3 个
      const shuffled = [...aliveEnemies]
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
      }
      return shuffled.slice(0, 3)
    }
    case "self-side":
      return aliveAllies
    default:
      return chosenUids.map((uid) => findCombatant(state, uid)).filter((c): c is Combatant => !!c && c.hp > 0)
  }
}

// 执行一次行动指令：actor 用 skill 打 targets。
// 返回新的 BattleState + 日志 + 每个目标的结算结果。
export function performAction(
  state: BattleState, command: ActionCommand
): { state: BattleState; logs: BattleLogEntry[]; results: ActionResult[] } {
  const logs: BattleLogEntry[] = []
  const results: ActionResult[] = []
  const actor = findCombatant(state, command.actorUid)
  if (!actor || actor.hp <= 0) return { state, logs, results }

  // 眩晕：被点穴等控制时无法出招（界面流程层也会跳过，这里再兜底防御，避免被眩晕者仍扣内力/出招）
  if (isStunned(actor)) {
    const you = actor.side === "player" ? "你" : actor.name
    logs.push({ text: `${you}被点穴封住经脉，动弹不得！`, type: "system" })
    return { state, logs, results }
  }

  const targeting = command.skill.targeting ?? "single"
  // 自身/我方增益（内功、轻功）：目标是自己或全队
  const isSelfBuff = command.skill.category === "内功" || command.skill.category === "轻功"
  const targets = isSelfBuff
    ? (targeting === "self-side" ? resolveTargets(state, actor, "self-side", []) : [actor])
    : resolveTargets(state, actor, targeting, command.targetUids)

  // 扣内力
  const spentActor: Combatant = { ...actor, mp: Math.max(0, actor.mp - command.skill.mpCost) }

  // 写回 actor（mp 变化）
  const updateUnit = (c: Combatant): Combatant => (c.uid === actor.uid ? spentActor : c)
  let nextState: BattleState = {
    ...state,
    playerSide: state.playerSide.map(updateUnit),
    enemySide: state.enemySide.map(updateUnit),
  }

  const isPlayer = actor.side === "player"
  const you = isPlayer ? "你" : actor.name

  // 自身增益：只对自己/我方挂状态
  if (isSelfBuff) {
    for (const t of targets) {
      const skill = command.skill
      const apply = applyStatusToUnit(t, skill.effect)
      if (apply.applied) results.push({ damage: 0, isCrit: false, isDodge: false, mpUsed: skill.mpCost, skillName: skill.name, statusApplied: apply.name, targetUid: t.uid })
      nextState = replaceUnit(nextState, apply.unit)
      logs.push({ text: `${targetLabel(t, isPlayer)}运起${skill.name}，${apply.name}！`, type: "status" })
    }
    return { state: nextState, logs, results }
  }

  // 攻击类：对每个目标结算伤害/状态
  for (const target of targets) {
    const skill = command.skill
    const r = resolveExternalAttack(spentActor, target, skill)
    results.push({ ...r, targetUid: target.uid })
    if (r.isDodge) {
      logs.push({ text: `${targetLabel(target, !isPlayer)}身法灵动，闪开了${you}的${skill.name}！`, type: "dodge" })
      continue
    }
    const dd = dealDamage(target, r.damage)
    nextState = replaceUnit(nextState, dd.unit)
    logs.push({
      text: `${you}施展${skill.name}，${r.isCrit ? "暴击！" : ""}对${targetLabel(target, !isPlayer)}造成${dd.logged}点伤害${dd.absorbed > 0 ? `（护盾抵消${dd.absorbed}）` : ""}`,
      type: r.isCrit ? "crit" : isPlayer ? "player" : "enemy",
    })
    // 附带状态
    if (skill.effect && !r.isDodge) {
      const apply = applyStatusToUnit(target, skill.effect)
      if (apply.applied && Math.random() < skill.effect.applyChance) {
        nextState = replaceUnit(nextState, apply.unit)
        logs.push({ text: `${targetLabel(target, !isPlayer)}${apply.name}！`, type: "status" })
      }
    }
  }

  return { state: nextState, logs, results }
}

// —— performAction 用到的内部小工具 ——
function replaceUnit(state: BattleState, unit: Combatant): BattleState {
  const map = (c: Combatant): Combatant => (c.uid === unit.uid ? unit : c)
  return { ...state, playerSide: state.playerSide.map(map), enemySide: state.enemySide.map(map) }
}
function applyStatusToUnit(unit: Combatant, effect: SkillEffect | undefined) {
  if (!effect) return { unit, applied: false as const, name: "" }
  const u = structuredClone(unit)
  const existing = u.statuses.findIndex((s) => s.kind === effect.kind)
  const ns: StatusEffect = { kind: effect.kind, name: STATUS_NAMES[effect.kind], duration: effect.duration, potency: effect.potency }
  if (existing >= 0) u.statuses[existing] = ns
  else u.statuses.push(ns)
  return { unit: u, applied: true as const, name: STATUS_NAMES[effect.kind] }
}
// 第二/第三人称的目标称谓：isPlayerSide=true 表示该目标是玩家阵营
function targetLabel(c: Combatant, isPlayerSide: boolean): string {
  return isPlayerSide ? `你方${c.name}` : c.name
}

// 回合开始：结算某单位的身上状态（多对多版，按 uid 定位）
export function tickUnitStatuses(state: BattleState, uid: string): { state: BattleState; logs: BattleLogEntry[] } {
  const unit = findCombatant(state, uid)
  if (!unit) return { state, logs: [] }
  const { unit: ticked, logs } = tickStatuses(unit)
  const map = (c: Combatant): Combatant => (c.uid === uid ? ticked : c)
  return { state: { ...state, playerSide: state.playerSide.map(map), enemySide: state.enemySide.map(map) }, logs }
}

// 敌方 AI：某个敌人选招 + 选目标（单体时挑我方血最少的，群攻时全体）
export function enemyDecideAction(state: BattleState, enemy: Combatant): ActionCommand | null {
  if (enemy.hp <= 0) return null
  const skill = enemyChooseSkill(enemy)
  const targeting = skill.targeting ?? "single"
  // 单体招式：敌人需自己挑目标（挑我方血最少的，便于收割）
  if (targeting === "single") {
    // 敌人打对立阵营：enemy 打 playerSide，player(队友AI) 打 enemySide
    const candidates = (enemy.side === "player" ? state.enemySide : state.playerSide).filter((c) => c.hp > 0)
    if (candidates.length === 0) return null
    const pick = [...candidates].sort((a, b) => a.hp - b.hp)[0]
    return { actorUid: enemy.uid, skill, targetUids: [pick.uid] }
  }
  // 群攻/我方全体：由 resolveTargets 自动展开
  const targets = resolveTargets(state, enemy, targeting, [])
  const targetUids = targets.map((t) => t.uid)
  return { actorUid: enemy.uid, skill, targetUids }
}