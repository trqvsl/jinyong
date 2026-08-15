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
  {
    id: "palace-route-rubbing",
    name: "禁宫地道拓图",
    category: "特殊",
    description: "从临安禁宫旧砖上的刻线拓下的地道图，曲灵风留下的桃花暗记仍在出口处。",
    effectText: "连接禁宫、牛家村密室与武穆遗书的路线证物",
    usable: false,
  },
  {
    id: "ouyangke-jade-shard",
    name: "白驼玉饰残片",
    category: "特殊",
    description: "欧阳克遇害处留下的断裂玉饰，裂口沾着短枪铁锈与一丝蛇毒。",
    effectText: "追查欧阳克死因与杨康嫁祸的证物",
    usable: false,
  },
  {
    id: "wumu-original",
    name: "武穆遗书原本",
    category: "特殊",
    description: "岳武穆遗下的兵法原卷，记载行军、布阵、军纪与守城之法。",
    effectText: "足以改变一场战争归属的军略原本",
    usable: false,
  },
  {
    id: "wumu-copy",
    name: "武穆遗书节要",
    category: "特殊",
    description: "从原卷中抄录的阵图与军纪节要，不含完整兵书，却保留最关键的数篇。",
    effectText: "可供后续军政与守城路线读取",
    usable: false,
  },
  {
    id: "yinggu-token",
    name: "黑沼算筹",
    category: "特殊",
    description: "瑛姑交出的乌木算筹，背面刻着通往一灯居的水路与一句未写完的旧问。",
    effectText: "求见一灯并回收周伯通旧债的信物",
    usable: false,
  },
  {
    id: "yangkang-jade-shoe",
    name: "翡翠鞋",
    category: "特殊",
    description: "朱聪临死前从凶手身上扯下的翡翠鞋，鞋边还夹着桃花岛泥沙。",
    effectText: "证明杨康曾到过桃花岛血案现场",
    usable: false,
  },
  {
    id: "han-xiaoying-blood-writing",
    name: "未完血字",
    category: "特殊",
    description: "韩小莹以剑尖蘸血留下的未完字迹，末笔指向白驼蛇毒与九阴爪痕。",
    effectText: "桃花岛血案的临终证言",
    usable: false,
  },
  {
    id: "taohua-snake-venom",
    name: "蛇毒残痕",
    category: "特殊",
    description: "从尸身伤口与礁石缝中封存的白驼蛇毒，配方与欧阳克案残毒相近。",
    effectText: "指向白驼山一系的毒物证据",
    usable: false,
  },
  {
    id: "yellow-robe-fiber",
    name: "黄袍丝缕",
    category: "特殊",
    description: "凶手伪装黄药师时遗落的衣袍丝缕，织法与桃花岛衣物并不相同。",
    effectText: "揭穿嫁祸黄药师的伪装证据",
    usable: false,
  },
  {
    id: "taohua-route-scratch",
    name: "岛图使用痕",
    category: "特殊",
    description: "桃花阵外圈被外人按图改动的石记拓片，路线来自曾经登岛者。",
    effectText: "追查凶手如何进入桃花岛的路线证据",
    usable: false,
  },
]

export function getItemById(id: string) {
  return ITEMS.find((item) => item.id === id)
}
