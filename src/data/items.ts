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
  {
    id: "qusan-palace-rubbing",
    name: "宫物纹记",
    category: "特殊",
    description: "你从曲三散落的包裹旁拓下的宫物纹样，边角还留着半枚桃花暗记。",
    effectText: "牛家村与桃花岛旧事的证物",
    usable: false,
  },
  {
    id: "jin-command-token",
    name: "金兵腰牌",
    category: "特殊",
    description: "丘处机雪夜击退追兵后留下的腰牌，女真文字与临安官府公文同时出现。",
    effectText: "证明金兵曾与临安官差同行",
    usable: false,
  },
  {
    id: "zhaowang-clasp-rubbing",
    name: "王府铜扣拓纹",
    category: "特殊",
    description: "从雪地伤者破损铜扣上拓下的纹样，形制绝非寻常军士所有。",
    effectText: "追查雪地伤者身份的线索",
    usable: false,
  },
  {
    id: "duan-bribe-slip",
    name: "调兵银契",
    category: "特殊",
    description: "段天德亲随收下银封时遗落的契纸，记着调兵数目与一枚赵王府侧印。",
    effectText: "牛家村围捕并非普通缉拿的证物",
    usable: false,
  },
  {
    id: "jiuyin-fragment-rubbing",
    name: "九阴残图拓片",
    category: "特殊",
    description: "黑风夜后从破损人皮边角拓下的运劲图式，只有残缺经脉与数句倒乱口诀。",
    effectText: "梅超风、周伯通与桃花岛路线的危险线索",
    usable: false,
  },
  {
    id: "mongol-wolf-tally",
    name: "苍狼铜符",
    category: "特殊",
    description: "铁木真赐给协力功臣的铜符，可在蒙古营帐与驿骑间证明身份。",
    effectText: "蒙古军政线的身份凭证",
    usable: false,
  },
]

export function getItemById(id: string) {
  return ITEMS.find((item) => item.id === id)
}
