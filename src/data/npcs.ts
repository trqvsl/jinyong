import type { Enemy, Alignment } from "../types"
import type { Condition } from "./story/schema"
import { getSkillById } from "./skills"

// ============================================================
// NPC 系统：金庸原著角色，战斗 + 剧情双用
// 设计见《世界观设定.md》：原著角色承担四重作用——
//   对手(战斗) / 队友(入队) / 关键NPC(剧情/传功) / 情节枢纽(名场面)
// 一套 NPC 数据既支持战斗（复用 Enemy 结构），也支持剧情交互。
// 所有字段均为声明式数据（无函数）， recruitCondition 使用 Condition 类型。
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
  dialogue?: string           // 默认对话（无变体匹配时使用）
  dialogueVariants?: { when: Condition; text: string }[]  // 条件对话变体，按序匹配首个
  teaches?: string[]          // 可传授的武功 id（作师父时）
  recruitCondition?: Condition  // 入队条件（声明式，与 recruitDialogue 配合）
  recruitDialogue?: string    // 入队成功时的风味文字
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
    dialogueVariants: [
      { when: { kind: "arcBeat", arcId: "shendiao", beat: "huashan" }, text: "郭靖肃然道：\"华山一别，你我已是生死之交。襄阳若有难，望兄来援。\"他目光坚毅，手中降龙十八掌蓄势待发。" },
      { when: { kind: "npcRelationType", npcId: "guojing", eq: "知己" }, text: "郭靖紧紧握住你的手：\"兄弟！你我肝胆相照，靖此生不换！\"他眼眶微红，那份憨直中的真情令人动容。" },
      { when: { kind: "npcRelationType", npcId: "guojing", eq: "朋友" }, text: "郭靖大笑道：\"兄弟！又见面了，靖甚是想念！\"他拍了拍你的肩膀，力道之大险些把你拍个趔趄。" },
      { when: { kind: "relation", npcId: "guojing", gte: 20 }, text: "郭靖憨厚一笑：\"兄台，咱们虽非旧识，靖却觉得与你十分投缘。\"他挠了挠头，目光诚恳。" },
    ],
    recruitCondition: { kind: "and", items: [{ kind: "reputation", gte: 20 }, { kind: "karma", gte: 0 }] },
    recruitDialogue: "郭靖郑重抱拳：\"兄台侠义为怀，靖愿与君同行，共赴江湖！\"",
  },
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
    dialogueVariants: [
      { when: { kind: "arcBeat", arcId: "shendiao", beat: "huashan" }, text: "黄蓉柔声道：\"这一路走来，多亏有你。蓉儿……记在心里了。\"她别过脸去，发间飘来一阵桃花香。" },
      { when: { kind: "relation", npcId: "huangrong", gte: 20 }, text: "黄蓉亲热地挽住你的胳膊：\"你可算来了！蓉儿正闷得慌呢，走，咱们去捉弄一下靖哥哥！\"她笑靥如花，眼珠骨碌碌转着坏主意。" },
    ],
    teaches: ["dagou", "lanhua"],
    recruitCondition: { kind: "and", items: [{ kind: "reputation", gte: 15 }, { kind: "karma", gte: 0 }] },
    recruitDialogue: "黄蓉眨眨眼：\"好呀，有你同行准有趣！蓉儿这就收拾包袱，咱们说走就走！\"",
  },
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
    dialogueVariants: [
      { when: { kind: "npcRelationType", npcId: "hongqigong", eq: "师徒" }, text: "洪七公拍着你的肩膀哈哈大笑：\"好徒弟！俺老叫花收你这徒弟，真是捡到宝了！来来来，今天教你第三式！\"他眼中满是欣慰。" },
      { when: { kind: "relation", npcId: "hongqigong", gte: 10 }, text: "洪七公嚼着烤鸡含糊道：\"小子不错，有点侠气。俺老叫花走南闯北，最看得上你这种人。\"他撕下一只鸡腿递给你。" },
    ],
    teaches: ["xianglong18", "dagou"],
    // 洪七公只传功不入队，不设 recruitCondition
  },
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
    dialogueVariants: [
      { when: { kind: "npcRelationType", npcId: "huangyaoshi-npc", eq: "朋友" }, text: "黄药师微微颔首，语气比从前和缓了些许：\"你既通过了老夫的试炼，便是桃花岛的客人。有什么想学的，不妨直言。\"" },
      { when: { kind: "arcBeat", arcId: "shendiao", beat: "huashan" }, text: "黄药师破天荒露出一丝笑意：\"华山一役，你倒没给老夫丢脸。\"他拂了拂衣袖，\"蓉儿眼光不错。\"" },
    ],
    teaches: ["lanhua", "tiyun"],
    recruitCondition: { kind: "reputation", gte: 30 },
    recruitDialogue: "黄药师微微颔首：\"你的名头老夫有所耳闻。若愿来桃花岛小住，老夫不拦你。\"",
  },
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
    dialogueVariants: [
      { when: { kind: "arcBeat", arcId: "shendiao", beat: "huashan" }, text: "欧阳锋目光幽深：\"小子，你与那帮伪君子果然不是一路人。白驼山的大门，永远为你敞开。\"他嘿嘿笑了两声，转身隐入蛇群之中。" },
      { when: { kind: "relation", npcId: "ouyangfeng-npc", gte: 10 }, text: "欧阳锋打量你片刻，忽然阴笑：\"嘿嘿，你这小子身上有股狠劲，老夫喜欢。来，陪老夫过两招！\"" },
    ],
    // 西毒不可入队
  },
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
    dialogueVariants: [
      { when: { kind: "npcHasTag", npcId: "yangkang", tag: "杨康已黑化" }, text: "杨康双眼赤红，五指成爪：\"你逼我的……这一切都是你们逼我的！\"他浑身散发着九阴白骨爪的阴寒之气，已全然不顾后果。" },
      { when: { kind: "npcHasTag", npcId: "yangkang", tag: "杨康遁走" }, text: "杨康远遁的身影在雨中若隐若现。他回头看了你一眼——那目光里有不甘，也有说不清的复杂情绪。" },
      { when: { kind: "npcRelationType", npcId: "yangkang", eq: "朋友" }, text: "杨康犹豫片刻，压低声音：\"你救了我……我杨康不是不识好歹的人。但大金与宋的恩怨，你不懂。\"他目光闪烁，似在权衡。" },
      { when: { kind: "relation", npcId: "yangkang", gte: 10 }, text: "杨康微微点头，语气稍缓：\"你倒不像那些迂腐之辈。本王爷……倒可以与你多聊几句。\"" },
    ],
    // 杨康不可入队
  },
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
    dialogueVariants: [
      { when: { kind: "npcRelationType", npcId: "qiuchuji", eq: "朋友" }, text: "丘处机哈哈大笑，拍着你的肩膀：\"好兄弟！牛家村那夜你我并肩杀敌，贫道至今记忆犹新！\"他目光中满是豪气与信任。" },
      { when: { kind: "relation", npcId: "qiuchuji", gte: 10 }, text: "丘处机微微点头：\"阁下侠名渐起，贫道甚是欣慰。若要精进武学，全真的门随时为你敞开。\"" },
    ],
    teaches: ["changquan"],
    // 丘处机只传功不入队
  },
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
