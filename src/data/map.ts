import type { Player } from "../types"

// ============================================================
// 地点式江湖地图
// 「游历」入口：一张可视化中国地图，地名标在对应坐标，点击前往。
// 每个地点绑定专属奇遇事件 + 敌人池 + 解锁条件。
// coordinates 是 0~100 的相对坐标（x=经度方向，y=纬度方向），供地图界面标点。
// ============================================================

export interface Location {
  id: string
  name: string
  region: string                 // 所属区域
  description: string            // 一句话介绍（去之前看的）
  arrival: string                // 到达时的场景描述
  coordinates: { x: number; y: number }  // 在总图上的相对坐标（0~100）
  events: string[]               // 该地点专属奇遇事件 id
  enemyPool: string[]            // 该地点的随机敌人池
  npcIds?: string[]              // 常驻该地点的 NPC id（双向参考，用于地图/NPC界面显示）
  unlock?: (player: Player) => boolean   // 解锁条件
}

export const LOCATIONS: Location[] = [
  // ===== 江南 =====
  {
    id: "niujia",
    name: "牛家村",
    region: "江南",
    description: "临安城外的一座小村，雪夜听书之处，江湖风波由此而起。",
    arrival: "你踏雪走进牛家村。炊烟袅袅，鸡犬相闻，看似宁静的村落里，却隐隐涌动着一股不安的气息。",
    coordinates: { x: 76, y: 66 },
    events: ["shendiao-niujia", "shendiao-yangkang"],
    enemyPool: ["xialiubang", "shanzei"],
  },
  {
    id: "linan",
    name: "临安府",
    region: "江南",
    description: "南宋都城，繁华甲于天下，也是江湖人物云集之地。",
    arrival: "你走进临安城，街市繁华，人声鼎沸。茶楼酒肆间，似有江湖人物在低声密语。",
    coordinates: { x: 74, y: 70 },
    events: ["shendiao-meet-rong", "shendiao-qigong", "shendiao-wangfu", "linan-teahouse", "linan-nightmarket"],
    enemyPool: ["xialiubang", "shanzei"],
    npcIds: ["hongqigong", "yangkang"],
  },

  // ===== 中原 =====
  {
    id: "shaolin",
    name: "少林寺",
    region: "中原",
    description: "天下武功出少林，嵩山深处古刹钟声不绝。",
    arrival: "嵩山深处，古刹巍峨。山门庄严肃穆，钟声悠悠回荡在林间，似在诵念千年的武学传承。",
    coordinates: { x: 55, y: 50 },
    events: ["shaolin-scripture"],
    enemyPool: ["shanzei", "emingke"],
    npcIds: ["qiuchuji"],
    unlock: (player) => player.reputation >= 5,
  },
  {
    id: "huashan",
    name: "华山",
    region: "中原",
    description: "五岳之首，华山论剑之地，绝顶高手论武所在。",
    arrival: "华山险峻，苍松迎客。你攀登而上，山风猎猎，仿佛能听见当年群雄论剑的余响。",
    coordinates: { x: 50, y: 45 },
    events: ["shendiao-huashan", "huashan-cliff"],
    enemyPool: ["emingke", "xiejiaoshi"],
    unlock: (player) => player.reputation >= 20,
  },

  // ===== 巴蜀 =====
  {
    id: "emei",
    name: "峨眉山",
    region: "巴蜀",
    description: "峨眉天下秀，山中隐有女侠剑派，剑法灵动。",
    arrival: "云雾缭绕的峨眉山中，古木参天。远处似有剑光闪动，山中修行之人剑法轻灵飘逸。",
    coordinates: { x: 40, y: 55 },
    events: ["emei-hermit"],
    enemyPool: ["shanzei", "emingke"],
  },
  {
    id: "xingxiu",
    name: "星宿海",
    region: "巴蜀",
    description: "荒漠毒沼之地，星宿派丁春秋盘踞之所，毒功阴狠。",
    arrival: "你踏入一片荒凉沼泽，空气里弥漫着腥臭。远处飘来几缕诡异的绿烟，毒虫毒蛇随处可见。",
    coordinates: { x: 33, y: 48 },
    events: ["xingxiu-poison"],
    enemyPool: ["duyaozi", "xiejiaoshi"],
    unlock: (player) => player.reputation >= 10,
  },

  // ===== 塞北 =====
  {
    id: "damos",
    name: "蒙古大漠",
    region: "塞北",
    description: "蒙古大漠，郭靖生长之地，草原辽阔，铁骑纵横。",
    arrival: "黄沙漫天，草原无垠。远处传来悠扬的马头琴声，你置身大漠，感受着天地的苍茫。",
    coordinates: { x: 30, y: 22 },
    events: ["shendiao-damos", "damos-eagle"],
    enemyPool: ["shanzei", "emingke"],
    npcIds: ["guojing"],
  },
  {
    id: "xiling",
    name: "西夏",
    region: "塞北",
    description: "西夏国境，灵鹫宫近在咫尺，天山童姥传闻不绝。",
    arrival: "你来到西夏边陲，戈壁苍凉。远处雪山之巅云雾缭绕，传闻那便是神秘的灵鹫宫所在。",
    coordinates: { x: 28, y: 32 },
    events: ["xiling-palace"],
    enemyPool: ["emingke", "xiejiaoshi"],
    unlock: (player) => player.reputation >= 25,
  },

  // ===== 西域 =====
  {
    id: "baituo",
    name: "白驼山",
    region: "西域",
    description: "西毒欧阳锋的老巢，白驼山庄隐于大漠深处。",
    arrival: "你深入西域大漠，找到白驼山庄。庄门紧闭，隐约能听见蛇群游动的窸窣声，令人毛骨悚然。",
    coordinates: { x: 18, y: 38 },
    events: ["baituo-snake"],
    enemyPool: ["duyaozi", "ouyangfeng"],
    npcIds: ["ouyangfeng-npc"],
    unlock: (player) => player.reputation >= 15,
  },
  {
    id: "mingjiao",
    name: "光明顶",
    region: "西域",
    description: "明教总坛所在，乾坤大挪移与圣火令的传承之地。",
    arrival: "你登上昆仑山光明顶，圣火熊熊。明教群豪齐聚，空气中弥漫着一触即发的紧张气氛。",
    coordinates: { x: 22, y: 42 },
    events: ["mingjiao-fire"],
    enemyPool: ["xiejiaoshi", "huangyaoshi"],
    unlock: (player) => player.reputation >= 30,
  },

  // ===== 东海 =====
  {
    id: "taohuadao",
    name: "桃花岛",
    region: "东海",
    description: "东海之上的桃花秘境，东邪黄药师隐居之所。",
    arrival: "渡海登岛，满目桃花灼灼，奇门阵法暗藏其中，令人方向莫辨。",
    coordinates: { x: 88, y: 60 },
    events: ["shendiao-taohua", "taohua-array"],
    enemyPool: ["emingke", "huangyaoshi"],
    npcIds: ["huangrong", "huangyaoshi-npc"],
    unlock: (player) => player.reputation >= 15,
  },

  // ===== 岭南 =====
  {
    id: "dali",
    name: "大理",
    region: "岭南",
    description: "大理段氏皇族故地，一阳指与六脉神剑的发源。",
    arrival: "你来到苍山洱海之间的大理。段氏皇族武学名震天下，街上行人举手投足间似皆暗含指法。",
    coordinates: { x: 38, y: 75 },
    events: ["dali-temple"],
    enemyPool: ["shanzei", "emingke"],
  },
]

// 按 id 取地点
export function getLocationById(id: string): Location | undefined {
  return LOCATIONS.find((loc) => loc.id === id)
}

// 取该玩家当前可前往的地点（解锁的）
export function getAvailableLocations(player: Player): Location[] {
  return LOCATIONS.filter((loc) => (loc.unlock ? loc.unlock(player) : true))
}

// 取所有地点，并标注是否已解锁
export function getAllLocationsWithStatus(player: Player) {
  return LOCATIONS.map((loc) => ({
    ...loc,
    unlocked: loc.unlock ? loc.unlock(player) : true,
  }))
}