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
  {
    id: "meichaofeng",
    name: "梅超风",
    hp: 160, hpMax: 160,
    mp: 70, mpMax: 70,
    attack: 26, defense: 12, speed: 20,
    statuses: [],
    skills: [getSkillById("huagu")!, getSkillById("qianzhu")!],
    expReward: 120,
    goldReward: 80,
    description: "叛出桃花岛的黑风双煞之一，九阴白骨爪阴毒无比，双目虽盲却能听风辨形。",
  },
  {
    id: "sangkun-guard",
    name: "桑昆亲兵",
    hp: 145, hpMax: 145,
    mp: 35, mpMax: 35,
    attack: 22, defense: 15, speed: 17,
    statuses: [],
    skills: [getSkillById("changquan")!, getSkillById("tiyun")!],
    expReward: 90,
    goldReward: 70,
    description: "桑昆麾下的草原亲兵，擅长骑战合围与近身缠斗。",
  },
  {
    id: "wangfu-guard",
    name: "赵王府亲兵",
    hp: 155, hpMax: 155,
    mp: 35, mpMax: 35,
    attack: 23, defense: 16, speed: 16,
    statuses: [],
    skills: [getSkillById("changquan")!, getSkillById("tiyun")!],
    expReward: 95,
    goldReward: 65,
    description: "赵王府西院亲兵，熟悉府内巷道，擅长持刀合围与封锁退路。",
  },
  {
    id: "yangkang",
    name: "杨康",
    hp: 170, hpMax: 170,
    mp: 70, mpMax: 70,
    attack: 26, defense: 16, speed: 22,
    statuses: [],
    skills: [getSkillById("huagu")!, getSkillById("changquan")!],
    expReward: 130,
    goldReward: 100,
    description: "金国小王爷，杨铁心之子却认贼作父。九阴白骨爪阴狠毒辣。",
  },
  {
    id: "palace-guard",
    name: "禁宫带御器械",
    hp: 175, hpMax: 175,
    mp: 45, mpMax: 45,
    attack: 25, defense: 19, speed: 18,
    statuses: [],
    skills: [getSkillById("changquan")!, getSkillById("tiyun")!],
    expReward: 110,
    goldReward: 80,
    description: "临安禁宫巡夜精锐，熟悉宫墙门禁与地道出口，擅长合围截路。",
  },
  {
    id: "qiuqianren",
    name: "裘千仞",
    hp: 285, hpMax: 285,
    mp: 105, mpMax: 105,
    attack: 37, defense: 24, speed: 23,
    statuses: [],
    skills: [getSkillById("tiezhang")!, getSkillById("tiyun")!],
    expReward: 270,
    goldReward: 260,
    description: "铁掌帮主，掌力沉雄狠辣，轻功亦是一流，与归云庄冒名行骗的裘千丈不可同日而语。",
  },
  {
    id: "yideng-disciple",
    name: "一灯座下弟子",
    hp: 205, hpMax: 205,
    mp: 85, mpMax: 85,
    attack: 29, defense: 23, speed: 17,
    statuses: [],
    skills: [getSkillById("yiyangzhi")!, getSkillById("changquan")!],
    expReward: 145,
    goldReward: 30,
    description: "一灯大师座下弟子，守关只为验明来意，招式留有分寸却不容强闯。",
  },
  {
    id: "iron-palm-disciple",
    name: "铁掌追兵",
    hp: 185, hpMax: 185,
    mp: 60, mpMax: 60,
    attack: 28, defense: 19, speed: 20,
    statuses: [],
    skills: [getSkillById("tiezhang")!, getSkillById("tiyun")!],
    expReward: 125,
    goldReward: 85,
    description: "奉命追索君山证人与铁掌峰文书的帮中好手，擅长封路与近身沉掌。",
  },
  {
    id: "yanyu-assassins",
    name: "王府白驼死士",
    hp: 225, hpMax: 225,
    mp: 85, mpMax: 85,
    attack: 31, defense: 20, speed: 23,
    statuses: [],
    skills: [getSkillById("lingshiquan")!, getSkillById("qianzhu")!],
    expReward: 155,
    goldReward: 110,
    description: "混在烟雨楼各派船工中的王府与白驼死士，目标是灭口、毁匣并替杨康打开退路。",
  },
  {
    id: "quanzhen-blockade",
    name: "全真剑阵",
    hp: 245, hpMax: 245,
    mp: 95, mpMax: 95,
    attack: 32, defense: 23, speed: 20,
    statuses: [],
    skills: [getSkillById("dugu9")!, getSkillById("jiuyang")!],
    expReward: 170,
    goldReward: 20,
    description: "全真门人结成的封门剑阵，只为截住杨康与王府亲兵，并非寻常江湖仇杀。",
  },
  {
    id: "mongol-camp-soldier",
    name: "争令骑兵",
    hp: 180, hpMax: 180,
    mp: 55, mpMax: 55,
    attack: 28, defense: 19, speed: 22,
    statuses: [],
    skills: [getSkillById("changquan")!, getSkillById("tiyun")!],
    expReward: 125,
    goldReward: 55,
    description: "分属不同王子的军中骑兵，因前锋次序与粮道调令拔刀相向，仍保留军阵配合。",
  },
  {
    id: "samarkand-defender",
    name: "撒马尔罕守军",
    hp: 205, hpMax: 205,
    mp: 65, mpMax: 65,
    attack: 30, defense: 23, speed: 18,
    statuses: [],
    skills: [getSkillById("changquan")!, getSkillById("tiyun")!],
    expReward: 145,
    goldReward: 70,
    description: "守卫多重城门的花剌子模军士，熟悉壕沟、换防号令与城内狭道。",
  },
  {
    id: "mongol-plunderer",
    name: "破城乱兵",
    hp: 190, hpMax: 190,
    mp: 45, mpMax: 45,
    attack: 31, defense: 19, speed: 20,
    statuses: [],
    skills: [getSkillById("changquan")!, getSkillById("tiyun")!],
    expReward: 135,
    goldReward: 95,
    description: "破城后脱离本队约束的军士，正沿街搜掠财物并截断平民退路。",
  },
  {
    id: "western-pursuer",
    name: "西征追骑",
    hp: 200, hpMax: 200,
    mp: 60, mpMax: 60,
    attack: 30, defense: 20, speed: 25,
    statuses: [],
    skills: [getSkillById("changquan")!, getSkillById("tiyun")!],
    expReward: 140,
    goldReward: 75,
    description: "奉军令追截斥候、逃兵与出城百姓的轻骑，速度快，擅长分路包抄。",
  },
  {
    id: "huashan-military-pursuer",
    name: "军令追缉使",
    hp: 250, hpMax: 250,
    mp: 80, mpMax: 80,
    attack: 34, defense: 23, speed: 22,
    statuses: [],
    skills: [getSkillById("changquan")!, getSkillById("tiyun")!],
    expReward: 175,
    goldReward: 90,
    description: "持追缉文书赶到华山的军中精锐，目标是带走送报人、战争见证与相关军册。",
  },
  {
    id: "huashan-record-raider",
    name: "夺卷死士",
    hp: 225, hpMax: 225,
    mp: 85, mpMax: 85,
    attack: 33, defense: 21, speed: 25,
    statuses: [],
    skills: [getSkillById("changquan")!, getSkillById("huagu")!],
    expReward: 165,
    goldReward: 105,
    description: "蒙面混入山道的夺卷者，只抢公议原卷、证人名册与封存副本，不与普通香客纠缠。",
  },
]

// 剧情专用敌人 id：这些敌人只由事件指定出现，不参与随机遇敌池
const PLOT_ENEMY_IDS = new Set([
  "guanjun", "meichaofeng", "sangkun-guard", "wangfu-guard", "yangkang",
  "palace-guard", "qiuqianren", "yideng-disciple", "iron-palm-disciple",
  "yanyu-assassins", "quanzhen-blockade", "mongol-camp-soldier",
  "samarkand-defender", "mongol-plunderer", "western-pursuer",
  "huashan-military-pursuer", "huashan-record-raider",
])

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
