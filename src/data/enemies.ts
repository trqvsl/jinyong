import type { Enemy, Player } from "../types"
import { getSkillById } from "./skills"

// ============================================================
// 敌人数据
// 不同敌人有不同战斗风格：有的会下毒，有的会给自己加增益。
// enemies.ts 引用的是 skills.ts 里定义的武功，复用同一套数据。
// ============================================================

export const ENEMIES: Enemy[] = [
  {
    id: "xialiubang",
    name: "市井流氓",
    hp: 60, hpMax: 60,
    mp: 20, mpMax: 20,
    attack: 12, defense: 5, speed: 8,
    statuses: [],
    skills: [getSkillById("changquan")!],
    expReward: 25,
    goldReward: 30,
    description: "街头为非作歹的小混混，弱不禁风。",
  },
  {
    id: "shanzei",
    name: "山贼头目",
    hp: 100, hpMax: 100,
    mp: 30, mpMax: 30,
    attack: 18, defense: 10, speed: 12,
    statuses: [],
    skills: [getSkillById("changquan")!],
    expReward: 45,
    goldReward: 60,
    description: "盘踞山林的草寇头领，比小喽啰硬朗。",
  },
  {
    id: "duyaozi",
    name: "毒药贩子",
    hp: 90, hpMax: 90,
    mp: 40, mpMax: 40,
    attack: 14, defense: 8, speed: 14,
    statuses: [],
    skills: [getSkillById("changquan")!, getSkillById("qianzhu")!],
    expReward: 70,
    goldReward: 90,
    description: "行走江湖的毒贩，擅长用毒，中了毒后持续掉血。",
  },
  {
    id: "emingke",
    name: "恶名剑客",
    hp: 130, hpMax: 130,
    mp: 40, mpMax: 40,
    attack: 24, defense: 14, speed: 16,
    statuses: [],
    skills: [getSkillById("dugu9")!],
    expReward: 80,
    goldReward: 100,
    description: "声名狼藉的剑客，独孤九剑凌厉无比。",
  },
  {
    id: "xiejiaoshi",
    name: "邪教护法",
    hp: 160, hpMax: 160,
    mp: 60, mpMax: 60,
    attack: 22, defense: 16, speed: 14,
    statuses: [],
    skills: [getSkillById("huagu")!, getSkillById("jiuyang")!],
    expReward: 120,
    goldReward: 150,
   description: "邪教高手。会削弱你的攻击，还会用九阳神功给自己回血。",
 },
  // ===== 金庸原著角色（首批练手：正/邪/中立各一） =====
  // 设计说明见《世界观设定.md》。这三者既是数据模板，也用作后续铺量的参照。
  {
    id: "guojing",
    name: "郭靖",
    hp: 220, hpMax: 220,
    mp: 80, mpMax: 80,
    attack: 30, defense: 20, speed: 14,
    statuses: [],
    skills: [getSkillById("xianglong18")!, getSkillById("jiuyang")!],
    expReward: 180,
    goldReward: 200,
    description: "北侠郭靖。资质鲁钝却勤修不辍，一套降龙十八掌刚猛无俦，心系家国苍生。",
  },
  {
    id: "ouyangfeng",
    name: "欧阳锋",
    hp: 200, hpMax: 200,
    mp: 90, mpMax: 90,
    attack: 28, defense: 16, speed: 20,
    statuses: [],
    skills: [getSkillById("hamagong")!, getSkillById("lingshiquan")!],
    expReward: 200,
    goldReward: 240,
    description: "西毒欧阳锋。白驼山庄主，武学阴毒诡谲，蛤蟆功蓄势一击可碎石裂碑。",
  },
  {
    id: "huangyaoshi",
    name: "黄药师",
    hp: 180, hpMax: 180,
    mp: 100, mpMax: 100,
    attack: 26, defense: 18, speed: 24,
    statuses: [],
    skills: [getSkillById("lanhua")!, getSkillById("tiyun")!],
    expReward: 220,
    goldReward: 260,
   description: "东邪黄药师。桃花岛主，琴棋书画、奇门遁甲无一不精，性情孤傲，亦正亦邪。",
 },
  // ===== 剧情专用敌人（由事件指定，不参与随机池） =====
  {
    id: "guanjun",
    name: "官军小队",
    hp: 110, hpMax: 110,
    mp: 20, mpMax: 20,
    attack: 16, defense: 12, speed: 10,
    statuses: [],
    skills: [getSkillById("changquan")!],
    expReward: 50,
    goldReward: 40,
    description: "奉命缉拿的官府差役，刀枪齐备，人多势众。",
  },
]

// 剧情专用敌人 id：这些敌人只由事件指定出现，不参与随机遇敌池
const PLOT_ENEMY_IDS = new Set(["guanjun"])

// 按 id 取敌人（剧情事件指定敌人时用）
export function getEnemyById(id: string): Enemy {
  return structuredClone(ENEMIES.find((enemy) => enemy.id === id)!)
}

// 按地点敌人池随机抽一个（池为空则回退到全局随机池）
export function getRandomEnemyFromPool(player: Player, poolIds: string[]): Enemy {
  if (poolIds.length === 0) return getRandomEnemy(player)
  const id = poolIds[Math.floor(Math.random() * poolIds.length)]
  const found = ENEMIES.find((enemy) => enemy.id === id)
  return structuredClone(found ?? ENEMIES[0])
}

// 随机选一个敌人（外出闯荡时调用）
export function getRandomEnemy(player?: Player): Enemy {
  if (!player) {
    const pool = ENEMIES.filter((enemy) => !PLOT_ENEMY_IDS.has(enemy.id))
    const idx = Math.floor(Math.random() * pool.length)
    return structuredClone(pool[idx])
  }

  const progression = player.level + Math.floor(player.day / 3)
  let pool: Enemy[]

  if (progression <= 2) {
    pool = ENEMIES.filter((enemy) => enemy.id === "xialiubang" || enemy.id === "shanzei")
  } else if (progression <= 4) {
    pool = ENEMIES.filter((enemy) => enemy.id !== "xiejiaoshi" && !PLOT_ENEMY_IDS.has(enemy.id))
  } else {
    pool = ENEMIES.filter((enemy) => !PLOT_ENEMY_IDS.has(enemy.id))
  }

 if (pool.length === 0) pool = ENEMIES
 const idx = Math.floor(Math.random() * pool.length)
 return structuredClone(pool[idx])
}
