// ============================================================
// 游戏核心类型定义
// 四类武功体系 + 状态效果系统是这次重构的核心。
// ============================================================

// 武功分类：外功(攻击) / 内功(增益治疗) / 轻功(闪避身法) / 奇门(毒术控制)
export type SkillCategory = "外功" | "内功" | "轻功" | "奇门"

// 攻击类型：用于外功和奇门的伤害结算
export type DamageType = "拳掌" | "刀法" | "剑法" | "内功" | "暗器" | "指法"

// 状态效果的种类
export type StatusKind =
  | "poison"    // 中毒：每回合掉血
  | "buff-atk"  // 攻击增益
  | "buff-def"  // 防御增益
  | "buff-spd"  // 身法增益
  | "heal"      // 回春：每回合回血
  | "stun"      // 眩晕：跳过回合
  | "shield"    // 护盾：减伤

// 一个挂在战斗单位身上的状态
export interface StatusEffect {
  kind: StatusKind
  name: string       // 显示名，如"九阳真气"
  duration: number   // 剩余回合数
  potency: number    // 强度：增益的数值 / 毒每回合掉血 / 护盾减伤
}

// 武功能产生的效果（内功/奇门/轻功用）
export interface SkillEffect {
  target: "self" | "enemy"
  kind: StatusKind
  potency: number      // 状态强度
  duration: number     // 持续回合
  applyChance: number  // 施加成功率 0~1（外功暴击是另一回事，这里指毒/眩晕等命中）
}

// 武功（招式）—— 现在按 category 分流
export interface Skill {
  id: string
  name: string
  category: SkillCategory     // 分类：决定战斗中的作用
  damageType?: DamageType      // 外功/部分奇门的伤害类型
  power: number                // 外功：伤害威力；内功：治疗量；奇门：毒威力
  mpCost: number
  description: string
  effect?: SkillEffect         // 内功/奇门/轻功附带的状态效果
}

// 战斗单位共有的战斗属性
export interface Stats {
  hp: number
  hpMax: number
  mp: number
  mpMax: number
  attack: number
  defense: number
  speed: number
  statuses: StatusEffect[]     // 当前身上的状态
}

// 角色立场
export type Alignment = "正" | "邪" | "中"

// 玩家角色
export interface Player extends Stats {
  name: string
  level: number
  exp: number
  expMax: number
  gold: number
  aptitude: number
  alignment: Alignment
  reputation: number
  day: number
  skills: Skill[]
}

// 敌人（NPC）
export interface Enemy extends Stats {
  id: string
  name: string
  skills: Skill[]
  expReward: number
  goldReward: number
  description: string
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
  statusApplied?: string  // 如果施加了状态，写描述
}