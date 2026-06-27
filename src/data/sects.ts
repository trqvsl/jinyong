import type { Skill } from "../types"
import { getSkillById } from "./skills"

// ============================================================
// 门派数据
// 每个门派有招牌武功，涵盖四类体系，让玩家能学到不同战斗风格。
// ============================================================

export interface SectSkill {
  skill: Skill
  cost: number
  reqLevel: number
}

export interface Sect {
  id: string
  name: string
  master: string
  description: string
  skills: SectSkill[]
}

export const SECTS: Sect[] = [
  {
    id: "shaolin",
    name: "少林寺",
    master: "玄慈方丈",
    description: "天下武功出少林，藏经阁武学浩如烟海。内功根基最为深厚。",
    skills: [
      { skill: getSkillById("jiuyang")!, cost: 0, reqLevel: 1 },
      { skill: getSkillById("yijin")!, cost: 300, reqLevel: 5 },
    ],
  },
  {
    id: "wudang",
    name: "武当派",
    master: "张三丰",
    description: "以太极之道立派，以柔克刚。外功与轻功皆有独到之处。",
    skills: [
      { skill: getSkillById("taijiquan")!, cost: 0, reqLevel: 1 },
      { skill: getSkillById("tiyun")!, cost: 120, reqLevel: 2 },
    ],
  },
  {
    id: "gaibang",
    name: "丐帮",
    master: "洪七公",
    description: "天下第一大帮，降龙十八掌威震武林，至刚外功。",
    skills: [
      { skill: getSkillById("dagou")!, cost: 0, reqLevel: 1 },
      { skill: getSkillById("xianglong18")!, cost: 500, reqLevel: 6 },
    ],
  },
  {
    id: "mingjiao",
    name: "明教",
    master: "张无忌",
    description: "源自波斯，被称为魔教。乾坤大挪移与北冥神功皆是顶级内功。",
    skills: [
      { skill: getSkillById("qiankun")!, cost: 0, reqLevel: 3 },
      { skill: getSkillById("beiming")!, cost: 400, reqLevel: 5 },
    ],
  },
  {
    id: "dali",
    name: "大理段氏",
    master: "段誉",
    description: "皇族武学，一阳指与六脉神剑名震天下。",
    skills: [
      { skill: getSkillById("yiyangzhi")!, cost: 0, reqLevel: 2 },
      { skill: getSkillById("liumai")!, cost: 600, reqLevel: 7 },
    ],
  },
  {
    id: "xingxiu",
    name: "星宿海",
    master: "丁春秋",
    description: "邪派毒功之源。以毒伤敌，阴狠毒辣，独步江湖。",
    skills: [
      { skill: getSkillById("qianzhu")!, cost: 0, reqLevel: 2 },
      { skill: getSkillById("huagu")!, cost: 200, reqLevel: 4 },
    ],
  },
  {
    id: "taohuadao",
    name: "桃花岛",
    master: "黄药师",
    description: "东邪所创，奇门遁甲、点穴制敌。兰花拂穴手令人防不胜防。",
    skills: [
      { skill: getSkillById("lanhua")!, cost: 0, reqLevel: 3 },
      { skill: getSkillById("shehun")!, cost: 250, reqLevel: 5 },
    ],
  },
  {
    id: "xiaoyao",
    name: "逍遥派",
    master: "无崖子",
    description: "神秘门派，轻功冠绝天下。凌波微步可令敌人望尘莫及。",
    skills: [
      { skill: getSkillById("lingbo")!, cost: 0, reqLevel: 3 },
    ],
  },
]

export function getSectById(id: string): Sect | undefined {
  return SECTS.find((s) => s.id === id)
}