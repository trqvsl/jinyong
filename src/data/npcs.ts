import type { Enemy, Alignment } from "../types"
import { getSkillById } from "./skills"

// ============================================================
// NPC 系统：金庸原著角色，战斗 + 剧情双用
// 设计见《世界观设定.md》：原著角色承担四重作用——
//   对手(战斗) / 队友(入队) / 关键NPC(剧情/传功) / 情节枢纽(名场面)
// 一套 NPC 数据既支持战斗（复用 Enemy 结构），也支持剧情交互。
// ============================================================

// NPC 在剧情中的角色定位（可叠加多种）
export type NpcRole = "对手" | "队友" | "师父" | "剧情" | "商人"

export interface Npc {
  id: string
  name: string
  title: string               // 称号，如"北侠"、"东邪"
  work: string                // 所属作品，如"射雕英雄传"
  alignment: Alignment        // 正/邪/中
  roles: NpcRole[]            // 可承担的作用
  description: string         // 一句话人设（性格+标志武功+立场）

  // 战斗数据：复用 Enemy 结构，使 NPC 可直接作对手/队友参战
  combat: Omit<Enemy, "id" | "name" | "description">

  // 剧情/交互数据
  locationId?: string         // 常驻地点（玩家可去此地寻访）
  dialogue?: string           // 寻访时的对话
  teaches?: string[]          // 可传授的武功 id（作师父时）
  questEventId?: string       // 关联的剧情事件 id
  recruitCondition?: (player: { reputation: number; alignment: Alignment }) => boolean  // 入队条件
}

// 把 NPC 转成 Enemy（战斗时用）
export function npcToEnemy(npc: Npc): Enemy {
  return {
    id: npc.id,
    name: npc.name,
    description: npc.description,
    ...npc.combat,
  }
}

export const NPCS: Npc[] = [
  // ===== 射雕英雄传 =====
  {
    id: "guojing",
    name: "郭靖",
    title: "北侠",
    work: "射雕英雄传",
    alignment: "正",
    roles: ["队友", "剧情"],
    description: "资质鲁钝却勤修不辍，一套降龙十八掌刚猛无俦，心系家国苍生，是当之无愧的侠之大者。",
    combat: {
      hp: 240, hpMax: 240, mp: 90, mpMax: 90,
      attack: 32, defense: 22, speed: 14, statuses: [],
      skills: [getSkillById("xianglong18")!, getSkillById("jiuyang")!],
      expReward: 200, goldReward: 220,
    },
    locationId: "damos",
    dialogue: "郭靖抱拳道：\"兄台豪气干云，靖佩服。若有意，可与我同行闯荡江湖。\"",
    roles_note: undefined,
    recruitCondition: (p) => p.reputation >= 20 && p.alignment !== "邪",
  } as Npc,
  {
    id: "huangrong",
    name: "黄蓉",
    title: "女中诸葛",
    work: "射雕英雄传",
    alignment: "正",
    roles: ["队友", "剧情", "师父"],
    description: "桃花岛主之女，聪慧无双，厨艺无双，一手打狗棒法与兰花拂穴手出神入化。",
    combat: {
      hp: 180, hpMax: 180, mp: 110, mpMax: 110,
      attack: 24, defense: 16, speed: 26, statuses: [],
      skills: [getSkillById("dagou")!, getSkillById("lanhua")!],
      expReward: 180, goldReward: 200,
    },
    locationId: "taohuadao",
    dialogue: "黄蓉狡黠一笑：\"你这人倒有趣。蓉儿看你顺眼，便指点你两手如何？\"",
    teaches: ["dagou", "lanhua"],
    recruitCondition: (p) => p.reputation >= 15 && p.alignment !== "邪",
  } as Npc,
  {
    id: "hongqigong",
    name: "洪七公",
    title: "北丐",
    work: "射雕英雄传",
    alignment: "正",
    roles: ["师父", "剧情"],
    description: "丐帮帮主，天下五绝之一。贪吃美食，却侠肝义胆，降龙十八掌威震武林。",
    combat: {
      hp: 300, hpMax: 300, mp: 120, mpMax: 120,
      attack: 38, defense: 24, speed: 18, statuses: [],
      skills: [getSkillById("xianglong18")!, getSkillById("dagou")!],
      expReward: 300, goldReward: 100,
    },
    locationId: "linan",
    dialogue: "洪七公啃着鸡腿大笑：\"小子，你想学俺的降龙十八掌？先给俺弄只叫花鸡来！\"",
    teaches: ["xianglong18", "dagou"],
    recruitCondition: () => false, // 洪七公只传功不入队
  } as Npc,
  {
    id: "huangyaoshi-npc",
    name: "黄药师",
    title: "东邪",
    work: "射雕英雄传",
    alignment: "中",
    roles: ["对手", "师父", "剧情"],
    description: "桃花岛主，天下五绝之一。琴棋书画、奇门遁甲无一不精，性情孤傲，亦正亦邪。",
    combat: {
      hp: 280, hpMax: 280, mp: 140, mpMax: 140,
      attack: 34, defense: 26, speed: 30, statuses: [],
      skills: [getSkillById("lanhua")!, getSkillById("tiyun")!],
      expReward: 260, goldReward: 300,
    },
    locationId: "taohuadao",
    dialogue: "黄药师冷冷瞥你一眼：\"能闯过老夫的桃花阵，倒也有几分本事。说吧，所来为何？\"",
    teaches: ["lanhua", "tiyun"],
    recruitCondition: (p) => p.reputation >= 30,
  } as Npc,
  {
    id: "ouyangfeng-npc",
    name: "欧阳锋",
    title: "西毒",
    work: "射雕英雄传",
    alignment: "邪",
    roles: ["对手", "剧情"],
    description: "白驼山主，天下五绝之一。武学阴毒诡谲，蛤蟆功蓄势一击可碎石裂碑，为达目的不择手段。",
    combat: {
      hp: 260, hpMax: 260, mp: 130, mpMax: 130,
      attack: 36, defense: 22, speed: 24, statuses: [],
      skills: [getSkillById("hamagong")!, getSkillById("lingshiquan")!],
      expReward: 280, goldReward: 350,
    },
    locationId: "baituo",
    dialogue: "欧阳锋阴阴一笑：\"嘿嘿，小子，你想学老夫的蛤蟆功？先接我一掌再说！\"",
    recruitCondition: () => false, // 西毒不可入队
  } as Npc,
  {
    id: "yangkang",
    name: "杨康",
    title: "小王爷",
    work: "射雕英雄传",
    alignment: "邪",
    roles: ["对手", "剧情"],
    description: "杨铁心之子，却认贼作父为完颜康。聪明机变却贪图富贵，九阴白骨爪阴狠毒辣。",
    combat: {
      hp: 170, hpMax: 170, mp: 70, mpMax: 70,
      attack: 26, defense: 16, speed: 22, statuses: [],
      skills: [getSkillById("huagu")!, getSkillById("changquan")!],
      expReward: 160, goldReward: 180,
    },
    locationId: "linan",
    dialogue: "杨康冷笑：\"哼，你这乡野村夫，也配与本王爷说话？\"",
    recruitCondition: () => false,
  } as Npc,
  {
    id: "qiuchuji",
    name: "丘处机",
    title: "全真七子",
    work: "射雕英雄传",
    alignment: "正",
    roles: ["师父", "剧情"],
    description: "全真教长春子，性如烈火，仗剑行侠。全真剑法与先天功皆有所成。",
    combat: {
      hp: 200, hpMax: 200, mp: 100, mpMax: 100,
      attack: 28, defense: 20, speed: 18, statuses: [],
      skills: [getSkillById("changquan")!, getSkillById("jiuyang")!],
      expReward: 150, goldReward: 80,
    },
    locationId: "shaolin",
    dialogue: "丘处机抱拳道：\"阁下仗义，贫道佩服。全真门下若有可传之处，不妨切磋一二。\"",
    teaches: ["changquan"],
    recruitCondition: () => false,
  } as Npc,
]

// 按 id 取 NPC
export function getNpcById(id: string): Npc | undefined {
  return NPCS.find((n) => n.id === id)
}

// 取某地点的常驻 NPC
export function getNpcsAtLocation(locationId: string): Npc[] {
  return NPCS.filter((n) => n.locationId === locationId)
}

// 取可作师父的 NPC（可传功）
export function getMasters(): Npc[] {
  return NPCS.filter((n) => n.roles.includes("师父") && n.teaches && n.teaches.length > 0)
}
