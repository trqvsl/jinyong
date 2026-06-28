import type { Player } from "../types"

export interface ShopItem {
  id: string
  name: string
  category: "丹药" | "补给"
  price: number
  description: string
  effectText: string
  grantItemId: string
  apply: (player: Player) => Player
}

export const SHOP_ITEMS: ShopItem[] = [
  {
    id: "small-hp-pill",
    name: "金疮药",
    category: "丹药",
    price: 25,
    description: "江湖行走常备伤药，适合战后调息疗伤。",
    effectText: "回复 35 点气血",
    grantItemId: "small-hp-pill",
    apply: (player) => ({
      ...player,
      inventory: {
        ...player.inventory,
        "small-hp-pill": (player.inventory["small-hp-pill"] ?? 0) + 1,
      },
    }),
  },
  {
    id: "small-mp-pill",
    name: "养气散",
    category: "丹药",
    price: 28,
    description: "温补真气，帮助你更快恢复内力。",
    effectText: "回复 25 点内力",
    grantItemId: "small-mp-pill",
    apply: (player) => ({
      ...player,
      inventory: {
        ...player.inventory,
        "small-mp-pill": (player.inventory["small-mp-pill"] ?? 0) + 1,
      },
    }),
  },
  {
    id: "field-ration",
    name: "干粮包",
    category: "补给",
    price: 40,
    description: "补充体力与精神，适合赶路前整备。",
    effectText: "回复 20 气血与 20 内力",
    grantItemId: "field-ration",
    apply: (player) => ({
      ...player,
      inventory: {
        ...player.inventory,
        "field-ration": (player.inventory["field-ration"] ?? 0) + 1,
      },
    }),
  },
]
