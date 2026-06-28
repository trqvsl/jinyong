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
]

// 随机选一个敌人（外出闯荡时调用）
export function getRandomEnemy(player?: Player): Enemy {
  if (!player) {
    const idx = Math.floor(Math.random() * ENEMIES.length)
    return structuredClone(ENEMIES[idx])
  }

  const progression = player.level + Math.floor(player.day / 3)
  let pool: Enemy[]

  if (progression <= 2) {
    pool = ENEMIES.filter((enemy) => enemy.id === "xialiubang" || enemy.id === "shanzei")
  } else if (progression <= 4) {
    pool = ENEMIES.filter((enemy) => enemy.id !== "xiejiaoshi")
  } else {
    pool = ENEMIES
  }

  if (pool.length === 0) pool = ENEMIES
  const idx = Math.floor(Math.random() * pool.length)
  return structuredClone(pool[idx])
}
