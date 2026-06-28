import type { Player, Enemy, RootAttributes, Skill } from "../types"

// ============================================================
// 根基属性 → 战斗属性 推导系统
// 战斗属性不再凭空给定，而由八大根基属性经公式推导。
// 设计见《战斗系统手册.md》第三节。
// ============================================================

// 默认内功催动系数（未在 Skill 上显式声明时）
export const DEFAULT_INNER_SCALE = 0.3

// 取招式的内功催动系数
export function innerScaleOf(skill: Skill): number {
  return skill.innerScale ?? DEFAULT_INNER_SCALE
}

// 外功物理攻击 = 力量×1.2 + 外功×1.5 + 等级×2
function derivePhysicalAttack(roots: RootAttributes, level: number): number {
  return Math.round(roots.strength * 1.2 + roots.external * 1.5 + level * 2)
}

// 内功催动加成 = 内功×1.0 × innerScale
function deriveInnerBoost(roots: RootAttributes, skill: Skill): number {
  return Math.round(roots.internal * 1.0 * innerScaleOf(skill))
}

// 防御 = 身体×0.8 + 等级×1
function deriveDefense(roots: RootAttributes, level: number): number {
  return Math.round(roots.constitution * 0.8 + level * 1)
}

// 气血上限 = 身体×20 + 等级×15 + 50
function deriveHpMax(roots: RootAttributes, level: number): number {
  return Math.round(roots.constitution * 20 + level * 15 + 50)
}

// 内力上限 = 吐纳×8 + 等级×5 + 20
function deriveMpMax(roots: RootAttributes, level: number): number {
  return Math.round(roots.breath * 8 + level * 5 + 20)
}

// 速度 = 身法×1.0 + 等级×0.5
function deriveSpeed(roots: RootAttributes, level: number): number {
  return Math.round(roots.agility * 1.0 + level * 0.5)
}

// 命中 = 身法×0.6 + 等级×1
function deriveHit(roots: RootAttributes, level: number): number {
  return Math.round(roots.agility * 0.6 + level * 1)
}

// 暴击率 = 身法×0.2%（身法 50 → 10%）
export function critRateOf(roots: RootAttributes): number {
  return roots.agility * 0.002
}

// 闪避率（基础，身法部分）= 身法×0.15%
export function dodgeRateOf(roots: RootAttributes): number {
  return roots.agility * 0.0015
}

// 福缘修正：闪避/命中 = 福缘×0.1%
export function luckHitBonus(roots: RootAttributes): number {
  return roots.luck * 0.001
}
export function luckDodgeBonus(roots: RootAttributes): number {
  return roots.luck * 0.001
}

// 逃跑成功率 = 基础率 + 福缘×0.3%
export function fleeChanceOf(roots: RootAttributes, base = 0.5): number {
  return Math.min(0.95, base + roots.luck * 0.003)
}

// 熟练度成长倍率 = 1 + 悟性/200
export function masteryGrowthRate(comprehension: number): number {
  return 1 + comprehension / 200
}

// 由根基属性完整推导出"面板战斗属性"（不含装备、状态）
export function deriveStats(roots: RootAttributes, level: number) {
  return {
    attack: derivePhysicalAttack(roots, level), // 注意：这是"外功物理攻击"，内功催动按招式临时叠加
    defense: deriveDefense(roots, level),
    hpMax: deriveHpMax(roots, level),
    mpMax: deriveMpMax(roots, level),
    speed: deriveSpeed(roots, level),
    hit: deriveHit(roots, level),
    critRate: critRateOf(roots),
    dodgeRate: dodgeRateOf(roots) + luckDodgeBonus(roots),
  }
}

// 计算玩家对某招式的"最终攻击力"（外功物理 + 内功催动加成）
export function effectiveAttack(player: Player, skill?: Skill): number {
  const physical = derivePhysicalAttack(player.roots, player.level)
  const inner = skill ? deriveInnerBoost(player.roots, skill) : 0
  return physical + inner
}

// 同步刷新玩家面板属性到推导值（升级/分配属性点后调用）
// 注意：hp/mp 保持当前值不回满（除非升级时另行处理），只刷新上限
export function recomputePlayerStats(player: Player): Player {
  const derived = deriveStats(player.roots, player.level)
  return {
    ...player,
    attack: derived.attack,
    defense: derived.defense,
    hpMax: derived.hpMax,
    mpMax: derived.mpMax,
    speed: derived.speed,
  }
}

// 敌人不走根基体系（直接给定战斗属性），直接使用 Stats 里的 attack/defense/speed。
export function enemyStats(enemy: Enemy) {
  return {
    attack: enemy.attack,
    defense: enemy.defense,
    speed: enemy.speed,
  }
}
