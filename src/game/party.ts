import type { Player } from "../types"
import { NPCS, getNpcById, type Npc } from "../data/npcs"
import type { WorldPartyState, WorldState } from "../data/story/schema"
import { getRelationLevel } from "./relations"
import { getNpcState } from "./story/state"

export const MAX_ACTIVE_TEAMMATES = 2

export interface PartySupportBonus {
  npcId: string
  npcName: string
  role: string
  attack: number
  defense: number
  speed: number
  description: string
}

export interface PartySupportTotals {
  attack: number
  defense: number
  speed: number
}

export interface PartyBondBonus {
  id: string
  name: string
  members: string[]
  attack: number
  defense: number
  speed: number
  description: string
  battleLine: string
}

export type BattleSupportTrigger = "crit" | "guard" | "victory"

export interface BattleSupportEvent {
  id: string
  text: string
  npcIds: string[]
  bondIds: string[]
}

export interface BattleSupportMechanicEffect {
  id: string
  kind: "shield" | "buff-atk" | "buff-def" | "buff-spd" | "buff-chase" | "heal" | "restore-mp"
  potency: number
  duration?: number
  text: string
  npcIds: string[]
  bondIds: string[]
}

export interface BattleSupportMechanicRule {
  trigger: BattleSupportTrigger
  title: string
  triggerLabel: string
  summary: string
  focusTags: string[]
  details: string[]
  sourceEntries: {
    key: string
    label: string
    type: "npc" | "bond"
    details: string[]
  }[]
  npcIds: string[]
  bondIds: string[]
}

const EMPTY_PARTY: WorldPartyState = { activeNpcIds: [], reserveNpcIds: [] }

function unique(ids: string[]): string[] {
  return Array.from(new Set(ids))
}

function getRecruitableNpcIds(): string[] {
  return NPCS.filter((npc) => npc.roles.includes("队友")).map((npc) => npc.id)
}

export function getPartyState(world: WorldState): WorldPartyState {
  return world.party ?? EMPTY_PARTY
}

export function normalizePartyState(world: WorldState): WorldPartyState {
  const recruitableIds = getRecruitableNpcIds()
  const availableIds = recruitableIds.filter((npcId) => {
    const npcState = getNpcState(world, npcId)
    return npcState.recruited && npcState.alive !== false
  })
  const availableSet = new Set(availableIds)
  const currentParty = getPartyState(world)

  const activeNpcIds = unique(currentParty.activeNpcIds).filter((npcId) => availableSet.has(npcId))
  const reserveNpcIds = unique(currentParty.reserveNpcIds).filter((npcId) => availableSet.has(npcId) && !activeNpcIds.includes(npcId))

  const normalizedActive = activeNpcIds.slice(0, MAX_ACTIVE_TEAMMATES)
  const overflow = activeNpcIds.slice(MAX_ACTIVE_TEAMMATES)
  const normalizedReserve = [...overflow, ...reserveNpcIds]

  for (const npcId of availableIds) {
    if (normalizedActive.includes(npcId) || normalizedReserve.includes(npcId)) continue
    if (normalizedActive.length < MAX_ACTIVE_TEAMMATES) normalizedActive.push(npcId)
    else normalizedReserve.push(npcId)
  }

  return {
    activeNpcIds: normalizedActive,
    reserveNpcIds: unique(normalizedReserve).filter((npcId) => !normalizedActive.includes(npcId)),
  }
}

export function normalizePlayerParty(player: Player): Player {
  const party = normalizePartyState(player.world)
  return { ...player, world: { ...player.world, party } }
}

function toNpcList(ids: string[]): Npc[] {
  return ids
    .map((npcId) => getNpcById(npcId))
    .filter((npc): npc is Npc => !!npc)
}

export function getActivePartyNpcs(player: Player): Npc[] {
  return toNpcList(normalizePartyState(player.world).activeNpcIds)
}

export function getReservePartyNpcs(player: Player): Npc[] {
  return toNpcList(normalizePartyState(player.world).reserveNpcIds)
}

export function getNpcBattleRole(npc: Npc): string {
  const hasSupportSkill = npc.combat.skills.some((skill) => skill.category === "内功")
  const hasQimenSkill = npc.combat.skills.some((skill) => skill.category === "奇门")
  const hasLightSkill = npc.combat.skills.some((skill) => skill.category === "轻功")

  if (hasSupportSkill && npc.combat.mpMax >= 100) return "内劲策应"
  if (hasQimenSkill) return "奇门牵制"
  if (npc.combat.attack >= 30 && npc.combat.hpMax >= 220) return "前排强攻"
  if (npc.combat.speed >= 24 || hasLightSkill) return "游走快攻"
  if (npc.combat.hpMax >= 220 || npc.combat.defense >= 22) return "稳阵护卫"
  return "均衡助战"
}

export function getPartyPower(player: Player): number {
  return getActivePartyNpcs(player).reduce((sum, npc) => sum + npc.combat.attack + npc.combat.defense + npc.combat.speed, 0)
}

function buildBonus(npc: Npc, attack: number, defense: number, speed: number, description: string): PartySupportBonus {
  return {
    npcId: npc.id,
    npcName: npc.name,
    role: getNpcBattleRole(npc),
    attack,
    defense,
    speed,
    description,
  }
}

function getRoleBonus(npc: Npc): PartySupportBonus {
  const role = getNpcBattleRole(npc)
  switch (role) {
    case "内劲策应":
      return buildBonus(npc, 2, 1, 0, "以内劲呼应你的招式运转，帮你稳住攻守节奏。")
    case "奇门牵制":
      return buildBonus(npc, 0, 0, 2, "以奇门手段扰敌，让你更易抢得先机。")
    case "前排强攻":
      return buildBonus(npc, 3, 0, 0, "替你分担正面压力，逼出更凶猛的攻势。")
    case "游走快攻":
      return buildBonus(npc, 0, 0, 3, "在侧翼牵扯对手，为你制造出手机会。")
    case "稳阵护卫":
      return buildBonus(npc, 0, 3, 0, "替你稳住阵脚，使正面应敌更从容。")
    default:
      return buildBonus(npc, 1, 1, 1, "与你呼应出手，让整体节奏更稳。")
  }
}

function mergeBonuses(base: PartySupportBonus, extra: Partial<Pick<PartySupportBonus, "attack" | "defense" | "speed">> & { description?: string }): PartySupportBonus {
  return {
    ...base,
    attack: base.attack + (extra.attack ?? 0),
    defense: base.defense + (extra.defense ?? 0),
    speed: base.speed + (extra.speed ?? 0),
    description: extra.description ?? base.description,
  }
}

export function getPartySupportBonuses(player: Player): PartySupportBonus[] {
  return getActivePartyNpcs(player).map((npc) => {
    const base = getRoleBonus(npc)
    const relation = getRelationLevel(player, npc.id, player.world)

    if (relation.relationType && ["师徒", "知己", "挚友", "恋人", "同门"].includes(relation.relationType)) {
      return mergeBonuses(base, {
        attack: 1,
        defense: 1,
        speed: 1,
        description: `${base.description} 你们已有深厚默契，出手配合更见火候。`,
      })
    }
    if (relation.value >= 20) {
      return mergeBonuses(base, {
        attack: 1,
        description: `${base.description} 关系融洽，配合时更敢放手抢攻。`,
      })
    }
    return base
  })
}

export function getPartyBondBonuses(player: Player): PartyBondBonus[] {
  const activeNpcs = getActivePartyNpcs(player)
  const activeIds = new Set(activeNpcs.map((npc) => npc.id))
  const bonds: PartyBondBonus[] = []

  if (activeIds.has("guojing") && activeIds.has("huangrong")) {
    bonds.push({
      id: "bond-jing-rong",
      name: "靖蓉同心",
      members: ["guojing", "huangrong"],
      attack: 2,
      defense: 2,
      speed: 1,
      description: "郭靖正面稳阵，黄蓉旁敲侧击，一刚一柔间把阵脚与攻势都抬了起来。",
      battleLine: "郭靖沉肩护在前方，黄蓉已绕到侧翼低声提醒：" + "“这一路，我来替你看破敌势。”",
    })
  }

  if (activeNpcs.length >= 2) {
    const allFriendly = activeNpcs.every((npc) => {
      const relation = getRelationLevel(player, npc.id, player.world)
      return relation.tone === "friend"
    })
    if (allFriendly) {
      bonds.push({
        id: "bond-travel-trust",
        name: "并肩默契",
        members: activeNpcs.map((npc) => npc.id),
        attack: 1,
        defense: 0,
        speed: 1,
        description: "随行众人心气相通，拆招换位都更利落，整队节奏更加顺手。",
        battleLine: "众人对了个眼色，脚步已自然而然错开，各自占住最顺手的出手位置。",
      })
    }
  }

  return bonds
}

function sumBonuses(items: { attack: number; defense: number; speed: number }[]): PartySupportTotals {
  return items.reduce<PartySupportTotals>((totals, bonus) => ({
    attack: totals.attack + bonus.attack,
    defense: totals.defense + bonus.defense,
    speed: totals.speed + bonus.speed,
  }), { attack: 0, defense: 0, speed: 0 })
}

export function getPartySupportTotals(player: Player): PartySupportTotals {
  return sumBonuses([...getPartySupportBonuses(player), ...getPartyBondBonuses(player)])
}

export function getBattleSupportOpeningLines(player: Player): string[] {
  const supportLines = getPartySupportBonuses(player).map((bonus) => `${bonus.npcName}在旁策应：${bonus.description}`)
  const bondLines = getPartyBondBonuses(player).map((bond) => `${bond.name}发动：${bond.battleLine}`)
  return [...bondLines, ...supportLines]
}

export function getBattleTriggeredSupportEvents(player: Player, trigger: BattleSupportTrigger): BattleSupportEvent[] {
  const activeNpcs = getActivePartyNpcs(player)
  const bonds = getPartyBondBonuses(player)
  const events: BattleSupportEvent[] = []

  for (const bond of bonds) {
    if (bond.id === "bond-jing-rong") {
      if (trigger === "crit") events.push({ id: `${bond.id}-crit`, text: "靖蓉同心发动：郭靖踏前震住敌势，黄蓉扬声提醒：‘就照这个势头，别让他缓过气！’", npcIds: bond.members, bondIds: [bond.id] })
      if (trigger === "guard") events.push({ id: `${bond.id}-guard`, text: "靖蓉同心发动：郭靖横身护在前面，黄蓉急声点破敌招：‘先稳住呼吸，我替你看着后手！’", npcIds: bond.members, bondIds: [bond.id] })
      if (trigger === "victory") events.push({ id: `${bond.id}-victory`, text: "靖蓉同心发动：郭靖长出一口气，黄蓉已笑着收势——这一战众人配合得天衣无缝。", npcIds: bond.members, bondIds: [bond.id] })
    } else if (bond.id === "bond-travel-trust") {
      if (trigger === "crit") events.push({ id: `${bond.id}-crit`, text: "并肩默契发动：众人顺着你的攻势同时压上，对手一时竟找不到喘息的空隙。", npcIds: bond.members, bondIds: [bond.id] })
      if (trigger === "guard") events.push({ id: `${bond.id}-guard`, text: "并肩默契发动：众人默契换位，将最危险的一轮攻势硬生生卸了下来。", npcIds: bond.members, bondIds: [bond.id] })
      if (trigger === "victory") events.push({ id: `${bond.id}-victory`, text: "并肩默契发动：众人互望一眼便知彼此心意，这一场胜得格外痛快。", npcIds: bond.members, bondIds: [bond.id] })
    }
  }

  for (const npc of activeNpcs) {
    switch (npc.id) {
      case "guojing":
        if (trigger === "crit") events.push({ id: `${npc.id}-crit`, text: "郭靖沉声喝彩：‘好！这一招打得扎实，再压一步！’", npcIds: [npc.id], bondIds: [] })
        if (trigger === "guard") events.push({ id: `${npc.id}-guard`, text: "郭靖抢上半步：‘先稳住，我替你挡这一轮！’", npcIds: [npc.id], bondIds: [] })
        if (trigger === "victory") events.push({ id: `${npc.id}-victory`, text: "郭靖收掌抱拳：‘这一战打得漂亮，咱们总算把场子稳下来了。’", npcIds: [npc.id], bondIds: [] })
        break
      case "huangrong":
        if (trigger === "crit") events.push({ id: `${npc.id}-crit`, text: "黄蓉眼睛一亮：‘就是现在，顺着破绽追进去！’", npcIds: [npc.id], bondIds: [] })
        if (trigger === "guard") events.push({ id: `${npc.id}-guard`, text: "黄蓉低声提醒：‘别和他硬拼，我替你盯着侧路。’", npcIds: [npc.id], bondIds: [] })
        if (trigger === "victory") events.push({ id: `${npc.id}-victory`, text: "黄蓉轻轻一笑：‘我就知道，这局面一旦被你拿住，他们就翻不了身。’", npcIds: [npc.id], bondIds: [] })
        break
      default:
        if (trigger === "crit") events.push({ id: `${npc.id}-crit`, text: `${npc.name}在旁策应：‘好机会，继续追击！’`, npcIds: [npc.id], bondIds: [] })
        if (trigger === "guard") events.push({ id: `${npc.id}-guard`, text: `${npc.name}立刻换位掩护：‘先收住架势，我来替你顶一下！’`, npcIds: [npc.id], bondIds: [] })
        if (trigger === "victory") events.push({ id: `${npc.id}-victory`, text: `${npc.name}长出一口气：‘这一阵总算稳稳拿下了。’`, npcIds: [npc.id], bondIds: [] })
        break
    }
  }

  const deduped = new Map<string, BattleSupportEvent>()
  for (const event of events) {
    if (!deduped.has(event.id)) deduped.set(event.id, event)
  }
  return Array.from(deduped.values())
}

export function getBattleTriggeredSupportLines(player: Player, trigger: BattleSupportTrigger): string[] {
  return getBattleTriggeredSupportEvents(player, trigger).map((event) => event.text)
}

function createMechanicEffect(effect: BattleSupportMechanicEffect): BattleSupportMechanicEffect {
  return effect
}

function getNpcTriggeredSupportEffects(npc: Npc, trigger: BattleSupportTrigger): BattleSupportMechanicEffect[] {
  switch (npc.id) {
    case "guojing":
      if (trigger === "crit") {
        return [createMechanicEffect({
          id: `${npc.id}-${trigger}-atk`,
          kind: "buff-atk",
          potency: 3,
          duration: 2,
          text: "郭靖踏前稳住敌势：你的攻击提升 3 点，持续 2 回合。",
          npcIds: [npc.id],
          bondIds: [],
        })]
      }
      if (trigger === "guard") {
        return [
          createMechanicEffect({
            id: `${npc.id}-${trigger}-shield`,
            kind: "shield",
            potency: 14,
            duration: 2,
            text: "郭靖横身护在前面：你获得 14 点护盾，持续 2 回合。",
            npcIds: [npc.id],
            bondIds: [],
          }),
          createMechanicEffect({
            id: `${npc.id}-${trigger}-def`,
            kind: "buff-def",
            potency: 6,
            duration: 1,
            text: "郭靖替你收紧门户：你的防御提升 6 点，持续 1 回合。",
            npcIds: [npc.id],
            bondIds: [],
          }),
        ]
      }
      return [createMechanicEffect({
        id: `${npc.id}-${trigger}-heal`,
        kind: "heal",
        potency: 16,
        text: "郭靖替你稳住气息：你回复 16 点气血。",
        npcIds: [npc.id],
        bondIds: [],
      })]
    case "huangrong":
      if (trigger === "crit") {
        return [
          createMechanicEffect({
            id: `${npc.id}-${trigger}-chase`,
            kind: "buff-chase",
            potency: 14,
            duration: 2,
            text: "黄蓉点破敌人后手：你获得追击势，下一次命中追加 14 点伤害。",
            npcIds: [npc.id],
            bondIds: [],
          }),
          createMechanicEffect({
            id: `${npc.id}-${trigger}-spd`,
            kind: "buff-spd",
            potency: 3,
            duration: 2,
            text: "黄蓉顺势提醒换步：你的身法提升 3 点，持续 2 回合。",
            npcIds: [npc.id],
            bondIds: [],
          }),
        ]
      }
      if (trigger === "guard") {
        return [createMechanicEffect({
          id: `${npc.id}-${trigger}-spd`,
          kind: "buff-spd",
          potency: 5,
          duration: 1,
          text: "黄蓉看破来路：你的身法提升 5 点，持续 1 回合。",
          npcIds: [npc.id],
          bondIds: [],
        })]
      }
      return [createMechanicEffect({
        id: `${npc.id}-${trigger}-mp`,
        kind: "restore-mp",
        potency: 12,
        text: "黄蓉替你理顺真气：你回复 12 点内力。",
        npcIds: [npc.id],
        bondIds: [],
      })]
    default:
      if (trigger === "crit") {
        return [createMechanicEffect({
          id: `${npc.id}-${trigger}-atk`,
          kind: "buff-atk",
          potency: 2,
          duration: 2,
          text: `${npc.name}顺着你的破口继续压上：你的攻击提升 2 点，持续 2 回合。`,
          npcIds: [npc.id],
          bondIds: [],
        })]
      }
      if (trigger === "guard") {
        return [createMechanicEffect({
          id: `${npc.id}-${trigger}-shield`,
          kind: "shield",
          potency: 8,
          duration: 1,
          text: `${npc.name}立刻换位掩护：你获得 8 点护盾，持续 1 回合。`,
          npcIds: [npc.id],
          bondIds: [],
        })]
      }
      return [createMechanicEffect({
        id: `${npc.id}-${trigger}-heal`,
        kind: "heal",
        potency: 10,
        text: `${npc.name}替你压住气息：你回复 10 点气血。`,
        npcIds: [npc.id],
        bondIds: [],
      })]
  }
}

function getBondTriggeredSupportEffects(bond: PartyBondBonus, trigger: BattleSupportTrigger): BattleSupportMechanicEffect[] {
  if (bond.id === "bond-jing-rong") {
    if (trigger === "crit") {
      return [createMechanicEffect({
        id: `${bond.id}-${trigger}-chase`,
        kind: "buff-chase",
        potency: 10,
        duration: 2,
        text: "靖蓉同心一并压上：你额外获得追击势，下一次命中追加 10 点伤害。",
        npcIds: bond.members,
        bondIds: [bond.id],
      })]
    }
    if (trigger === "guard") {
      return [
        createMechanicEffect({
          id: `${bond.id}-${trigger}-shield`,
          kind: "shield",
          potency: 12,
          duration: 2,
          text: "靖蓉同心替你硬接锋头：你额外获得 12 点护盾，持续 2 回合。",
          npcIds: bond.members,
          bondIds: [bond.id],
        }),
        createMechanicEffect({
          id: `${bond.id}-${trigger}-def`,
          kind: "buff-def",
          potency: 4,
          duration: 1,
          text: "靖蓉同心稳住阵门：你的防御额外提升 4 点，持续 1 回合。",
          npcIds: bond.members,
          bondIds: [bond.id],
        }),
      ]
    }
    return [
      createMechanicEffect({
        id: `${bond.id}-${trigger}-heal`,
        kind: "heal",
        potency: 12,
        text: "靖蓉同心替你收束气息：你额外回复 12 点气血。",
        npcIds: bond.members,
        bondIds: [bond.id],
      }),
      createMechanicEffect({
        id: `${bond.id}-${trigger}-mp`,
        kind: "restore-mp",
        potency: 10,
        text: "靖蓉同心替你回拢真气：你额外回复 10 点内力。",
        npcIds: bond.members,
        bondIds: [bond.id],
      }),
    ]
  }

  if (trigger === "crit") {
    return [createMechanicEffect({
      id: `${bond.id}-${trigger}-atk`,
      kind: "buff-atk",
      potency: 2,
      duration: 1,
      text: `${bond.name}发动：众人顺势抢攻，你的攻击额外提升 2 点，持续 1 回合。`,
      npcIds: bond.members,
      bondIds: [bond.id],
    })]
  }
  if (trigger === "guard") {
    return [createMechanicEffect({
      id: `${bond.id}-${trigger}-def`,
      kind: "buff-def",
      potency: 3,
      duration: 1,
      text: `${bond.name}发动：众人换位补缝，你的防御额外提升 3 点，持续 1 回合。`,
      npcIds: bond.members,
      bondIds: [bond.id],
    })]
  }
  return [createMechanicEffect({
    id: `${bond.id}-${trigger}-heal`,
    kind: "heal",
    potency: 8,
    text: `${bond.name}发动：众人替你调匀呼吸，你额外回复 8 点气血。`,
    npcIds: bond.members,
    bondIds: [bond.id],
  })]
}

export function getBattleTriggeredSupportEffects(player: Player, trigger: BattleSupportTrigger): BattleSupportMechanicEffect[] {
  const activeNpcs = getActivePartyNpcs(player)
  if (activeNpcs.length === 0) return []

  const bonds = getPartyBondBonuses(player)
  return [
    ...activeNpcs.flatMap((npc) => getNpcTriggeredSupportEffects(npc, trigger)),
    ...bonds.flatMap((bond) => getBondTriggeredSupportEffects(bond, trigger)),
  ]
}

function describeMechanicEffect(effect: BattleSupportMechanicEffect): string {
  if (effect.kind === "shield") return `获得 ${effect.potency} 点护盾${effect.duration ? `，持续 ${effect.duration} 回合` : ""}`
  if (effect.kind === "buff-atk") return `攻击提升 ${effect.potency} 点${effect.duration ? `，持续 ${effect.duration} 回合` : ""}`
  if (effect.kind === "buff-def") return `防御提升 ${effect.potency} 点${effect.duration ? `，持续 ${effect.duration} 回合` : ""}`
  if (effect.kind === "buff-spd") return `身法提升 ${effect.potency} 点${effect.duration ? `，持续 ${effect.duration} 回合` : ""}`
  if (effect.kind === "buff-chase") return `获得追击势，下一次命中追加 ${effect.potency} 点伤害`
  if (effect.kind === "restore-mp") return `回复 ${effect.potency} 点内力`
  return `回复 ${effect.potency} 点气血`
}

function getMechanicFocusTag(kind: BattleSupportMechanicEffect["kind"]): string {
  switch (kind) {
    case "shield":
      return "护阵"
    case "buff-def":
      return "稳阵"
    case "buff-spd":
      return "机变"
    case "buff-chase":
      return "追击"
    case "buff-atk":
      return "压攻"
    case "restore-mp":
      return "回气"
    default:
      return "调息"
  }
}

function describeMechanicEffectSource(effect: BattleSupportMechanicEffect, bonds: PartyBondBonus[]): string {
  if (effect.bondIds.length > 0) {
    return effect.bondIds
      .map((bondId) => bonds.find((bond) => bond.id === bondId)?.name ?? bondId)
      .join(" / ")
  }
  return effect.npcIds
    .map((npcId) => getNpcById(npcId)?.name ?? npcId)
    .join(" / ")
}

export function getBattleSupportMechanicRules(player: Player): BattleSupportMechanicRule[] {
  const activeNpcs = getActivePartyNpcs(player)
  if (activeNpcs.length === 0) return []

  const rules: BattleSupportMechanicRule[] = []
  const bonds = getPartyBondBonuses(player)
  const triggerMeta: Record<BattleSupportTrigger, { title: string; triggerLabel: string; summary: string }> = {
    crit: {
      title: "乘胜追击",
      triggerLabel: "主角打出暴击时",
      summary: "队友会把你打出的破口继续撕开，不只抬高攻势，还会压出一记真正落地的后续追击。",
    },
    guard: {
      title: "危局护阵",
      triggerLabel: "主角气血跌到 35% 以下时",
      summary: "队友会立刻换位护阵，不只替你垫住伤害，还会短暂帮你把门户收紧，稳住残局。",
    },
    victory: {
      title: "战后调息",
      triggerLabel: "战斗获胜时",
      summary: "收势之后，众人会替你护住气息与真气，让你不只是少掉血，还能更顺地接下一场战斗。",
    },
  }

  ;(["crit", "guard", "victory"] as BattleSupportTrigger[]).forEach((trigger) => {
    const effects = getBattleTriggeredSupportEffects(player, trigger)
    if (effects.length === 0) return
    const meta = triggerMeta[trigger]
    const sourceMap = new Map<string, { key: string; label: string; type: "npc" | "bond"; details: string[] }>()
    for (const effect of effects) {
      const isBond = effect.bondIds.length > 0
      const key = isBond ? `bond:${effect.bondIds.join("+")}` : `npc:${effect.npcIds.join("+")}`
      const label = describeMechanicEffectSource(effect, bonds)
      const detail = describeMechanicEffect(effect)
      const current = sourceMap.get(key)
      if (current) current.details.push(detail)
      else sourceMap.set(key, { key, label, type: isBond ? "bond" : "npc", details: [detail] })
    }
    rules.push({
      trigger,
      title: meta.title,
      triggerLabel: meta.triggerLabel,
      summary: meta.summary,
      focusTags: Array.from(new Set(effects.map((effect) => getMechanicFocusTag(effect.kind)))),
      details: effects.map((effect) => `${describeMechanicEffectSource(effect, bonds)}：${describeMechanicEffect(effect)}`),
      sourceEntries: Array.from(sourceMap.values()),
      npcIds: Array.from(new Set(effects.flatMap((effect) => effect.npcIds))),
      bondIds: Array.from(new Set(effects.flatMap((effect) => effect.bondIds))),
    })
  })

  return rules
}

export function applyPartySupportToPlayer(player: Player): Player {
  const totals = getPartySupportTotals(player)
  if (totals.attack === 0 && totals.defense === 0 && totals.speed === 0) return player
  return {
    ...player,
    attack: player.attack + totals.attack,
    defense: player.defense + totals.defense,
    speed: player.speed + totals.speed,
  }
}

export function setNpcPartyActive(player: Player, npcId: string, active: boolean): Player {
  const party = normalizePartyState(player.world)
  const npcState = getNpcState(player.world, npcId)
  if (!npcState.recruited || npcState.alive === false) return normalizePlayerParty(player)

  const nextActive = party.activeNpcIds.filter((id) => id !== npcId)
  const nextReserve = party.reserveNpcIds.filter((id) => id !== npcId)

  if (active) {
    if (nextActive.length >= MAX_ACTIVE_TEAMMATES) {
      const displacedNpcId = nextActive.pop()
      if (displacedNpcId) nextReserve.unshift(displacedNpcId)
    }
    nextActive.push(npcId)
  } else {
    nextReserve.unshift(npcId)
  }

  return normalizePlayerParty({
    ...player,
    world: {
      ...player.world,
      party: {
        activeNpcIds: nextActive,
        reserveNpcIds: nextReserve,
      },
    },
  })
}

export function moveActiveNpc(player: Player, npcId: string, direction: "forward" | "backward"): Player {
  const party = normalizePartyState(player.world)
  const index = party.activeNpcIds.indexOf(npcId)
  if (index < 0) return normalizePlayerParty(player)

  const targetIndex = direction === "forward" ? index - 1 : index + 1
  if (targetIndex < 0 || targetIndex >= party.activeNpcIds.length) return normalizePlayerParty(player)

  const nextActive = [...party.activeNpcIds]
  ;[nextActive[index], nextActive[targetIndex]] = [nextActive[targetIndex], nextActive[index]]

  return normalizePlayerParty({
    ...player,
    world: {
      ...player.world,
      party: {
        activeNpcIds: nextActive,
        reserveNpcIds: party.reserveNpcIds,
      },
    },
  })
}
