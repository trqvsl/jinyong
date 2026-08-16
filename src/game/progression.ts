import type { Player, Skill } from "../types"
import { recomputePlayerStats } from "./attributes"

export const MAX_SKILL_MASTERY = 100
export const MAX_PRACTICE_USES_PER_BATTLE = 5

export interface ExperienceResult {
  player: Player
  gainedExp: number
  levelsGained: number
  attributePointsGained: number
}

export interface SkillMasteryGain {
  skillId: string
  skillName: string
  before: number
  after: number
  gained: number
  uses: number
}

export interface SkillPracticeResult {
  player: Player
  gains: SkillMasteryGain[]
}

export interface MasteryCombatModifiers {
  power: number
  effectPotency: number
  effectApplyChance: number
}

function clampMastery(value: number): number {
  if (!Number.isFinite(value)) return 0
  return Math.max(0, Math.min(MAX_SKILL_MASTERY, Math.floor(value)))
}

export function getSkillMastery(player: Player, skillId: string): number {
  return clampMastery(player.mastery[skillId] ?? 0)
}

export function getSkillMasteryLabel(mastery: number): string {
  const value = clampMastery(mastery)
  if (value >= 100) return "圆满"
  if (value >= 75) return "精通"
  if (value >= 50) return "熟练"
  if (value >= 25) return "入门"
  return "初习"
}

export function getPracticeGainPerUse(comprehension: number): number {
  return 1 + (comprehension >= 60 ? 1 : 0) + (comprehension >= 85 ? 1 : 0)
}

export function applyExperience(player: Player, delta: number): ExperienceResult {
  const normalizedDelta = Number.isFinite(delta) ? Math.floor(delta) : 0
  const p: Player = {
    ...player,
    exp: Math.max(0, player.exp + normalizedDelta),
  }
  let levelsGained = 0

  while (p.exp >= Math.max(1, p.expMax)) {
    const threshold = Math.max(1, p.expMax)
    p.exp -= threshold
    p.level += 1
    p.attributePoints = (p.attributePoints ?? 0) + 5
    p.expMax = Math.round(threshold * 1.3)
    levelsGained += 1
  }

  let final = p
  if (levelsGained > 0) {
    final = recomputePlayerStats(p)
    final.hp = final.hpMax
    final.mp = final.mpMax
  }

  return {
    player: final,
    gainedExp: normalizedDelta,
    levelsGained,
    attributePointsGained: levelsGained * 5,
  }
}

export function trainForDay(player: Player): Player {
  const gain = 1 + Math.floor(player.aptitude / 30)
  const cultivated: Player = {
    ...player,
    day: player.day + 1,
    roots: {
      ...player.roots,
      external: player.roots.external + gain,
      internal: player.roots.internal + 1,
      constitution: player.roots.constitution + Math.max(1, Math.floor(gain / 2)),
    },
  }
  const recomputed = recomputePlayerStats(cultivated)
  return {
    ...recomputed,
    hp: recomputed.hpMax,
    mp: recomputed.mpMax,
  }
}

export function applySkillPractice(
  player: Player,
  skillUses: Record<string, number>,
): SkillPracticeResult {
  const learnedSkills = new Map(player.skills.map((skill) => [skill.id, skill]))
  const mastery = { ...player.mastery }
  const gains: SkillMasteryGain[] = []
  const gainPerUse = getPracticeGainPerUse(player.roots.comprehension)

  for (const [skillId, rawUses] of Object.entries(skillUses)) {
    const skill = learnedSkills.get(skillId)
    if (!skill) continue

    const uses = Math.max(
      0,
      Math.min(MAX_PRACTICE_USES_PER_BATTLE, Math.floor(rawUses)),
    )
    if (uses === 0) continue

    const before = getSkillMastery(player, skillId)
    const after = Math.min(MAX_SKILL_MASTERY, before + uses * gainPerUse)
    mastery[skillId] = after
    if (after > before) {
      gains.push({
        skillId,
        skillName: skill.name,
        before,
        after,
        gained: after - before,
        uses,
      })
    }
  }

  return {
    player: gains.length > 0 ? { ...player, mastery } : player,
    gains,
  }
}

export function applyMasteryToSkill(
  skill: Skill,
  mastery: number,
): MasteryCombatModifiers {
  const value = clampMastery(mastery)
  const effect = skill.effect
  const potencyStep = effect?.potency
    ? Math.sign(effect.potency) * Math.floor(value / 25)
    : 0

  return {
    power: Math.round(skill.power * (1 + value / 1000)),
    effectPotency: effect
      ? effect.potency + potencyStep
      : 0,
    effectApplyChance: effect
      ? Math.min(1, effect.applyChance + value / 1000)
      : 0,
  }
}
