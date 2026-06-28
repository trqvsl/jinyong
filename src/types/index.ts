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
 innerScale?: number          // 内功催动系数 0~1：内功根基对该外功的加持比例（默认 0.3）
  targeting?: SkillTargeting  // 目标模式：单体(single)/横扫(all-enemy)/双击(spread2)/乱打(random3)/我方全体(self-side)
}

// 招式目标模式（与引擎 types 对齐）
export type SkillTargeting = "single" | "all-enemy" | "spread2" | "random3" | "self-side"

// ============================================================
// 根基属性体系（武侠 RPG 灵魂）
// 战斗属性由八大根基属性经公式推导而来。玩家修炼根基，战斗力是根基长出的枝叶。
// 推导公式见 src/game/attributes.ts。
// ============================================================
export interface RootAttributes {
  strength: number     // 力量：外力根基，参与共构攻击力
  external: number     // 外功：外家修为，与力量共构物理攻击力
  internal: number     // 内功：内家真气，经"内功催动"叠加到攻击力
  comprehension: number // 悟性：修炼速度（熟练度成长）+ 武学门槛
  constitution: number // 身体：气血上限、防御
  breath: number       // 吐纳：内力上限
  agility: number      // 身法：速度、命中、暴击、闪避（四用）
  luck: number         // 福缘：奇遇、剧情检定、闪避/命中修正、逃跑
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
  roots: RootAttributes   // 八大根基属性（战斗属性由此推导）
  attributePoints: number // 待分配的属性点
  mastery: Record<string, number>  // 招式熟练度 { skillId: 0~100 }
  alignment: Alignment
  reputation: number
  day: number
  skills: Skill[]
  inventory: Record<string, number>
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
