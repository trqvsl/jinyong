// ============================================================
// 战斗引擎内部类型（自包含，不依赖外部 types/index.ts）
// 引擎只认 Combatant / BattleSkill / 状态等概念，
// 不认识 Player / 存档 / 根基属性——这些由外部适配层转换进来。
// 这样战斗模块可独立迭代、甚至复用到别的项目。
// ============================================================

// 战斗中的属性类型（外功/部分奇门的伤害分类，用于克制系统）
export type DamageType = "拳掌" | "刀法" | "剑法" | "内功" | "暗器" | "指法"

// 武功分类：决定引擎里的分流逻辑
export type SkillCategory = "外功" | "内功" | "轻功" | "奇门"

// 状态种类
export type StatusKind =
  | "poison"
  | "buff-atk"
  | "buff-def"
  | "buff-spd"
  | "heal"
  | "stun"
  | "shield"

// 一个挂在战斗单位身上的状态
export interface StatusEffect {
  kind: StatusKind
  name: string
  duration: number
  potency: number
}

// 武功能产生的效果
export interface SkillEffect {
  target: "self" | "enemy"
  kind: StatusKind
  potency: number
  duration: number
  applyChance: number
}

// 引擎认识的武功（比全局 Skill 更窄：只要引擎结算需要的字段）
export interface BattleSkill {
  id: string
  name: string
  category: SkillCategory
  damageType?: DamageType
  power: number
  mpCost: number
  effect?: SkillEffect
  targeting?: SkillTargeting   // 目标模式（默认 single 单体）
  innerScale?: number          // 内功催动系数（由适配层从 Skill.innerScale 透传；0 表示该招不吃内功催动）
}

// 招式的目标模式：决定一次出招打几个目标、打谁
export type SkillTargeting =
  | "single"     // 单体：手动选一个目标
  | "all-enemy"  // 横扫：打敌方全体
  | "spread2"    // 双击：打至多2个目标
  | "random3"    // 乱打：随机打3个目标
  | "self-side"  // 我方全体（用于群体增益内功）

// 阵营归属（多对多的基础）
export type Side = "player" | "enemy"

// 战斗单位（引擎只认这个，不认 Player/Enemy 的其他字段）
export interface Combatant {
  uid: string            // 战斗内唯一标识（多单位时区分谁是谁）
  side: Side             // 阵营
  name: string
  hp: number
  hpMax: number
  mp: number
  mpMax: number
  attack: number        // 最终攻击力（含内功催动等，由适配层算好）
  defense: number
  speed: number
  statuses: StatusEffect[]
  skills: BattleSkill[]
  atb: number            // 行动值（CTB 累积用），达到阈值获得行动权
  // —— 以下可选：由适配层按根基属性推导后填入，让暴击/闪避/内功催动参与结算。
  //    手写 Combatant（如 verify 脚本）可不填，engine 用兜底默认值，保持向后兼容。
  critRate?: number      // 暴击率 0~1（身法根基推导）
  dodgeRate?: number     // 闪避率 0~1（身法/福缘根基推导）
  innerPower?: number    // 内功催动基础值（内功根基），按 skill.innerScale 临时叠加到攻击
}

// 一场战斗的状态：我方队伍 + 敌方队伍 + 行动轴
export interface BattleState {
  playerSide: Combatant[]
  enemySide: Combatant[]
  atbThreshold: number   // 行动值阈值，达到则可行动（默认 100）
}

// 一次行动指令：谁、用什么招、打谁（目标 uid 列表）
export interface ActionCommand {
  actorUid: string
  skill: BattleSkill
  targetUids: string[]   // 空表示无目标（如自身增益）/ 全体由 skill.targeting 决定
}

// 行动顺序轴的一项
export interface TurnOrderEntry {
  uid: string
  name: string
  side: Side
}

// 战斗日志的一条记录
export interface BattleLogEntry {
  text: string
  type: "player" | "enemy" | "crit" | "dodge" | "system" | "poison" | "status"
}

// 一次攻击的结算结果
export interface ActionResult {
  damage: number
  isCrit: boolean
  isDodge: boolean
  mpUsed: number
  skillName: string
  statusApplied?: string
  targetUid?: string      // 该结果对应的受击单位 uid（供界面精确挂飘字）
}
