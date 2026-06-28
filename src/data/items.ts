import type { Player } from "../types"

export interface ItemDef {
  id: string
  name: string
  category: "丹药" | "补给" | "特殊"
  description: string
  effectText: string
  usable: boolean
  apply?: (player: Player) => Player
}

export const ITEMS: ItemDef[] = [
  {
    id: "small-hp-pill",
    name: "金疮药",
    category: "丹药",
    description: "江湖行走常备伤药，适合战后调息疗伤。",
    effectText: "回复 35 点气血",
    usable: true,
    apply: (player) => ({ ...player, hp: Math.min(player.hpMax, player.hp + 35) }),
  },
  {
    id: "small-mp-pill",
    name: "养气散",
    category: "丹药",
    description: "温补真气，帮助你更快恢复内力。",
    effectText: "回复 25 点内力",
    usable: true,
    apply: (player) => ({ ...player, mp: Math.min(player.mpMax, player.mp + 25) }),
  },
  {
    id: "field-ration",
    name: "干粮包",
    category: "补给",
    description: "补充体力与精神，适合赶路前整备。",
    effectText: "回复 20 气血与 20 内力",
    usable: true,
    apply: (player) => ({
      ...player,
      hp: Math.min(player.hpMax, player.hp + 20),
      mp: Math.min(player.mpMax, player.mp + 20),
    }),
  },
]

export function getItemById(id: string) {
  return ITEMS.find((item) => item.id === id)
}
