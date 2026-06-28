import type { Player } from "../types"

// ============================================================
// 地点式江湖地图
// 不做棋盘式大地图（网页端移动/碰撞成本高），改用"地点式"：
// 一张江湖总图，玩家选一个地点前往，每个地点绑定自己的剧情事件与敌人池。
// 这样"地图"与"剧情"天然衔接：去牛家村 → 风雪惊变；去桃花岛 → 东邪剧情。
// ============================================================

export interface Location {
  id: string
  name: string
  region: string                 // 所属区域：江南 / 中原 / 西域 / 塞北 / 岭南
  description: string            // 一句话介绍（去之前看的）
  arrival: string                // 到达时的场景描述
  coordinates: { x: number; y: number }  // 在总图上的相对坐标（0~100），供将来画图
  // 该地点专属事件 id 列表（前往此地优先触发这些事件）
  events: string[]
  // 该地点的随机敌人池（闯荡时从池里抽，空则用全局随机池）
  enemyPool: string[]
  // 解锁条件：不满足则显示但不可前往
  unlock?: (player: Player) => boolean
}

export const LOCATIONS: Location[] = [
  {
    id: "niujia",
    name: "牛家村",
    region: "江南",
    description: "临安城外的一座小村，雪夜听书之处，江湖风波由此而起。",
    arrival:
      "你踏雪走进牛家村。炊烟袅袅，鸡犬相闻，看似宁静的村落里，却隐隐涌动着一股不安的气息。",
    coordinates: { x: 72, y: 62 },
    events: ["shendiao-niujia"],
    enemyPool: ["xialiubang", "shanzei"],
  },
  {
    id: "shaolin",
    name: "少林寺",
    region: "中原",
    description: "天下武功出少林，嵩山深处古刹钟声不绝。",
    arrival:
      "嵩山深处，古刹巍峨。山门庄严肃穆，钟声悠悠回荡在林间，似在诵念千年的武学传承。",
    coordinates: { x: 50, y: 45 },
    events: [],
    enemyPool: ["shanzei", "emingke"],
    unlock: (player) => player.reputation >= 5,
  },
  {
 id: "taohuadao",
 name: "桃花岛",
 region: "东海",
 description: "东海之上的桃花秘境，东邪黄药师隐居之所。",
 arrival:
 "渡海登岛，满目桃花灼灼，奇门阵法暗藏其中，令人方向莫辨。",
 coordinates: { x: 88, y: 58 },
 events: [],
 enemyPool: ["emingke"],
 unlock: (player) => player.reputation >= 15,
  },
  {
 id: "huashan",
 name: "华山",
 region: "中原",
 description: "五岳之首，华山论剑之地，绝顶高手论武所在。",
 arrival:
 "华山险峻，苍松迎客。你攀登而上，山风猎猎，仿佛能听见当年群雄论剑的余响。",
 coordinates: { x: 42, y: 38 },
 events: [],
 enemyPool: ["emingke", "xiejiaoshi"],
 unlock: (player) => player.reputation >= 20,
  },
  {
 id: "damos",
 name: "大漠",
 region: "塞北",
 description: "蒙古大漠，郭靖生长之地，草原辽阔，铁骑纵横。",
 arrival:
 "黄沙漫天，草原无垠。远处传来悠扬的马头琴声，你置身大漠，感受着天地的苍茫。",
 coordinates: { x: 25, y: 22 },
 events: [],
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

// 取所有地点，并标注是否已解锁（用于地图界面显示锁定状态）
export function getAllLocationsWithStatus(player: Player) {
  return LOCATIONS.map((loc) => ({
    ...loc,
    unlocked: loc.unlock ? loc.unlock(player) : true,
  }))
}
