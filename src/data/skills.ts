import type { Skill } from "../types"

// ============================================================
// 武功数据（四类体系）
// 外功：直接造成伤害
// 内功：自身增益 / 治疗
// 轻功：提升闪避与身法
// 奇门：毒术、控制（眩晕）、削弱
// 每个武功按 category 分流到不同的战斗结算逻辑。
// ============================================================

export const SKILLS: Skill[] = [
  // ---------- 外功（攻击招式） ----------
  {
    id: "changquan",
    name: "长拳",
    category: "外功",
    damageType: "拳掌",
    power: 10,
    mpCost: 0,
    description: "江湖最常见的入门拳法，朴实无华。",
  },
  {
    id: "xianglong18",
    name: "降龙十八掌",
    category: "外功",
    damageType: "拳掌",
    power: 48,
    mpCost: 20,
    description: "丐帮绝学，至刚至阳的掌法，威力惊人。",
  },
  {
    id: "dugu9",
    name: "独孤九剑",
    category: "外功",
    damageType: "剑法",
    power: 50,
    mpCost: 18,
    description: "独孤求败所创，破尽天下武学的剑法。",
  },
  {
    id: "liumai",
    name: "六脉神剑",
    category: "外功",
    damageType: "暗器",
    power: 52,
    mpCost: 22,
    description: "大理段氏绝学，以指力发出无形剑气。",
  },
  {
    id: "taijiquan",
    name: "太极拳",
    category: "外功",
    damageType: "拳掌",
    power: 30,
    mpCost: 8,
    description: "武当绝学，以柔克刚，四两拨千斤。",
  },
  {
    id: "dagou",
    name: "打狗棒法",
    category: "外功",
    damageType: "拳掌",
    power: 36,
    mpCost: 14,
    description: "丐帮帮主代代相传的棒法，精妙绝伦。",
  },
  {
    id: "yiyangzhi",
    name: "一阳指",
    category: "外功",
    damageType: "指法",
    power: 40,
    mpCost: 15,
    description: "大理段氏家传指法，点穴制敌。",
  },

  // ---------- 内功（自身增益 / 治疗） ----------
  {
    id: "jiuyang",
    name: "九阳神功",
    category: "内功",
    power: 0,
    mpCost: 12,
    description: "少林至高内功。回春4回合，攻击与防御大增。",
    effect: {
      target: "self",
      kind: "heal",
      potency: 18,
      duration: 4,
      applyChance: 1,
    },
  },
  {
    id: "yijin",
    name: "易筋经",
    category: "内功",
    power: 0,
    mpCost: 18,
    description: "少林秘传心法。攻击、防御大幅提升3回合。",
    effect: {
      target: "self",
      kind: "buff-def",
      potency: 12,
      duration: 3,
      applyChance: 1,
    },
  },
  {
    id: "qiankun",
    name: "乾坤大挪移",
    category: "内功",
    power: 0,
    mpCost: 25,
    description: "明教神功。全方位强化：攻击、防御、身法3回合。",
    effect: {
      target: "self",
      kind: "buff-spd",
      potency: 10,
      duration: 3,
      applyChance: 1,
    },
  },
  {
    id: "beiming",
    name: "北冥神功",
    category: "内功",
    power: 0,
    mpCost: 20,
    description: "逍遥派绝学。护盾3回合，减免所受伤害。",
    effect: {
      target: "self",
      kind: "shield",
      potency: 12,
      duration: 3,
      applyChance: 1,
    },
  },

  // ---------- 轻功（闪避 / 身法） ----------
  {
    id: "lingbo",
    name: "凌波微步",
    category: "轻功",
    power: 0,
    mpCost: 8,
    description: "身法如鬼魅。3回合内身法大增，敌人难以命中。",
    effect: {
      target: "self",
      kind: "buff-spd",
      potency: 20,
      duration: 3,
      applyChance: 1,
    },
  },
  {
    id: "tiyun",
    name: "梯云纵",
    category: "轻功",
    power: 0,
    mpCost: 6,
    description: "武当轻功。2回合内身法提升，闪避大增。",
    effect: {
      target: "self",
      kind: "buff-spd",
      potency: 14,
      duration: 2,
      applyChance: 1,
    },
  },

  // ---------- 奇门（毒术 / 控制） ----------
  {
    id: "qianzhu",
    name: "千蛛万毒手",
    category: "奇门",
    damageType: "拳掌",
    power: 12,
    mpCost: 10,
    description: "星宿海毒功。造成伤害并令敌中毒，3回合持续掉血。",
    effect: {
      target: "enemy",
      kind: "poison",
      potency: 14,
      duration: 3,
      applyChance: 0.85,
    },
  },
  {
    id: "huagu",
    name: "化骨绵掌",
    category: "奇门",
    damageType: "拳掌",
    power: 15,
    mpCost: 12,
    description: "阴毒掌法。造成伤害并削弱敌攻击3回合。",
    effect: {
      target: "enemy",
      kind: "buff-atk",
      potency: -8,
      duration: 3,
      applyChance: 0.9,
    },
  },
  {
    id: "shehun",
    name: "摄魂大法",
    category: "奇门",
    power: 0,
    mpCost: 16,
    description: "邪派秘术。令敌眩晕，跳过下一回合。命中率一般。",
    effect: {
      target: "enemy",
      kind: "stun",
      potency: 0,
      duration: 1,
      applyChance: 0.6,
    },
  },
  {
    id: "lanhua",
    name: "兰花拂穴手",
    category: "奇门",
    power: 0,
    mpCost: 14,
    description: "桃花岛绝学。令敌眩晕，跳过下一回合。",
    effect: {
      target: "enemy",
      kind: "stun",
      potency: 0,
      duration: 1,
      applyChance: 0.75,
    },
  },
]

// 按 id 查找武功
export function getSkillById(id: string): Skill | undefined {
  return SKILLS.find((s) => s.id === id)
}