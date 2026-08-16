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
    locationId: "zhongdu",
    dialogue: "杨康冷笑：\"哼，你这乡野村夫，也配与本王爷说话？\"",
    dialogueVariants: [
      { when: { kind: "npcHasTag", npcId: "yangkang", tag: "杨康已黑化" }, text: "杨康双眼赤红，五指成爪：\"你逼我的……这一切都是你们逼我的！\"他浑身散发着九阴白骨爪的阴寒之气，已全然不顾后果。" },
      { when: { kind: "npcHasTag", npcId: "yangkang", tag: "杨康遁走" }, text: "杨康远遁的身影在雨中若隐若现。他回头看了你一眼——那目光里有不甘，也有说不清的复杂情绪。" },
      { when: { kind: "npcRelationType", npcId: "yangkang", eq: "朋友" }, text: "杨康看了看四周，这才开口：\"你救了我……我杨康不是不识好歹的人。但大金与宋的恩怨，你不懂。\"他说完便不再多提。" },
      { when: { kind: "relation", npcId: "yangkang", gte: 10 }, text: "杨康微微点头，语气稍缓：\"你倒不像那些迂腐之辈。本王爷……倒可以与你多聊几句。\"" },
    ],
    // 杨康不可入队
  },
  {
    id: "munianci",
    name: "穆念慈",
    title: "杨门义女",
    work: "射雕英雄传",
    alignment: "正",
    roles: ["剧情"],
    description: "性情坚忍，重情却不失是非。杨康每一次选择，都由她自己判断是否还能继续同行。",
    combat: {
      hp: 185, hpMax: 185, mp: 65, mpMax: 65,
      attack: 27, defense: 18, speed: 21, statuses: [],
      skills: [getSkillById("changquan")!, getSkillById("tiyun")!],
      expReward: 150, goldReward: 50,
    },
    locationId: "niujia",
    dialogue: "穆念慈收起短刀。穆念慈：\"你把证据给我看便是。康哥该不该再信，由我自己决定。\"",
  },
  {
    id: "kezhene",
    name: "柯镇恶",
    title: "飞天蝙蝠",
    work: "射雕英雄传",
    alignment: "正",
    roles: ["剧情"],
    description: "江南七怪之首，性情刚烈，眼盲而听觉过人。认定之事极难回头，却从不逃避自己的错判。",
    combat: {
      hp: 225, hpMax: 225, mp: 75, mpMax: 75,
      attack: 30, defense: 22, speed: 18, statuses: [],
      skills: [getSkillById("changquan")!, getSkillById("tiyun")!],
      expReward: 180, goldReward: 40,
    },
    dialogue: "柯镇恶以铁杖点地。柯镇恶：\"老夫听见什么便说什么。若有人说我错了，拿证据来。\"",
  },
  {
    id: "hanxiaoying",
    name: "韩小莹",
    title: "越女剑",
    work: "射雕英雄传",
    alignment: "正",
    roles: ["剧情"],
    description: "江南七怪中的越女剑传人，温和而果决，遇到生死之事从不把责任推给旁人。",
    combat: {
      hp: 175, hpMax: 175, mp: 70, mpMax: 70,
      attack: 27, defense: 17, speed: 25, statuses: [],
      skills: [getSkillById("changquan")!, getSkillById("tiyun")!],
      expReward: 165, goldReward: 35,
    },
    dialogue: "韩小莹按住剑柄。韩小莹：\"先救还能救的人。凶手是谁，留下的伤和物件会说话。\"",
  },
  {
    id: "luyoujiao",
    name: "鲁有脚",
    title: "丐帮长老",
    work: "射雕英雄传",
    alignment: "正",
    roles: ["剧情"],
    description: "丐帮污衣派长老，为人直朴，重帮规也重抗金大义，不以衣饰出身取人。",
    combat: {
      hp: 205, hpMax: 205, mp: 75, mpMax: 75,
      attack: 28, defense: 21, speed: 17, statuses: [],
      skills: [getSkillById("dagou")!, getSkillById("changquan")!],
      expReward: 150, goldReward: 50,
    },
    locationId: "junshan",
    dialogue: "鲁有脚把竹杖横在膝前。鲁有脚：\"帮主之位要看传令、帮规和担当，不是哪一个人先抢到棒子。\"",
  },
  {
    id: "qiuqianren-npc",
    name: "裘千仞",
    title: "铁掌水上飘",
    work: "射雕英雄传",
    alignment: "邪",
    roles: ["对手", "剧情"],
    description: "铁掌帮主，掌力与轻功皆臻一流，野心极重，却并非没有需要面对的旧恶。",
    combat: {
      hp: 285, hpMax: 285, mp: 105, mpMax: 105,
      attack: 37, defense: 24, speed: 23, statuses: [],
      skills: [getSkillById("tiezhang")!, getSkillById("tiyun")!],
      expReward: 270, goldReward: 260,
    },
    locationId: "tiezhangfeng",
    dialogue: "裘千仞按住石案，掌下裂纹向四面展开。裘千仞：\"要兵书，便拿能换它的东西来。\"",
  },
  {
    id: "yinggu",
    name: "瑛姑",
    title: "神算子",
    work: "射雕英雄传",
    alignment: "中",
    roles: ["剧情"],
    description: "隐居黑沼的算学奇人，机关与术数都极精深，求医指路背后藏着多年未解的旧恨。",
    combat: {
      hp: 190, hpMax: 190, mp: 115, mpMax: 115,
      attack: 22, defense: 18, speed: 25, statuses: [],
      skills: [getSkillById("shehun")!, getSkillById("tiyun")!],
      expReward: 170, goldReward: 60,
    },
    locationId: "blackmarsh",
    dialogue: "瑛姑拨动案上算筹。瑛姑：\"想见一灯，先把这条路算明白。算错一步，黑沼便多留一个人。\"",
  },
  {
    id: "yideng",
    name: "一灯",
    title: "南帝",
    work: "射雕英雄传",
    alignment: "正",
    roles: ["师父", "剧情"],
    description: "大理段氏前帝，出家后法号一灯。一阳指功力深厚，慈悲之下也背着未曾偿清的旧债。",
    combat: {
      hp: 300, hpMax: 300, mp: 155, mpMax: 155,
      attack: 35, defense: 29, speed: 20, statuses: [],
      skills: [getSkillById("yiyangzhi")!, getSkillById("jiuyang")!],
      expReward: 300, goldReward: 80,
    },
    locationId: "yidengju",
    dialogue: "一灯合十。一灯：\"先救眼前之人。旧事若有人来问，贫僧也不再回避。\"",
    teaches: ["yiyangzhi"],
  },
  {
    id: "liping",
    name: "李萍",
    title: "郭门慈母",
    work: "射雕英雄传",
    alignment: "正",
    roles: ["剧情"],
    description: "郭靖之母，在乱军与风雪中独自把孩子养大。她不谈空泛道理，只看人是否肯做该做的事。",
    combat: {
      hp: 145, hpMax: 145, mp: 30, mpMax: 30,
      attack: 18, defense: 14, speed: 11, statuses: [],
      skills: [getSkillById("changquan")!],
      expReward: 100, goldReward: 20,
    },
    locationId: "damos",
    dialogue: "李萍把干粮和水囊分开放好。李萍：\"军令再急，也得先让伤兵和孩子有口水喝。\"",
  },
  {
    id: "huazheng",
    name: "华筝",
    title: "草原明珠",
    work: "射雕英雄传",
    alignment: "正",
    roles: ["队友", "剧情"],
    description: "成吉思汗之女，性情直接，重感情也重父兄与草原。她会帮人承担风险，却不会被当作逃路工具。",
    combat: {
      hp: 190, hpMax: 190, mp: 70, mpMax: 70,
      attack: 27, defense: 17, speed: 27, statuses: [],
      skills: [getSkillById("changquan")!, getSkillById("tiyun")!],
      expReward: 150, goldReward: 60,
    },
    locationId: "damos",
    dialogue: "华筝勒住马。华筝：\"要我送信便把话说清楚。你们要救谁，又准备让谁留下？\"",
  },
  {
    id: "zhebie",
    name: "哲别",
    title: "神箭手",
    work: "射雕英雄传",
    alignment: "中",
    roles: ["队友", "剧情"],
    description: "蒙古军中神箭手，受过郭靖与玩家旧恩。临阵看重命令是否清楚，也记得谁曾在危急时不肯出卖他。",
    combat: {
      hp: 225, hpMax: 225, mp: 80, mpMax: 80,
      attack: 32, defense: 19, speed: 29, statuses: [],
      skills: [getSkillById("changquan")!, getSkillById("tiyun")!],
      expReward: 190, goldReward: 80,
    },
    locationId: "western-camp",
    dialogue: "哲别把两支不同羽色的箭压在地图上。哲别：\"一支报城门，一支报水道。先说哪一路不能丢。\"",
  },
  {
    id: "tuolei",
    name: "拖雷",
    title: "蒙古四王子",
    work: "射雕英雄传",
    alignment: "中",
    roles: ["队友", "剧情"],
    description: "成吉思汗幼子，与郭靖结为安答。待人坦率，临军务时仍必须在兄弟、父命与旧友情之间作答。",
    combat: {
      hp: 230, hpMax: 230, mp: 75, mpMax: 75,
      attack: 31, defense: 22, speed: 22, statuses: [],
      skills: [getSkillById("changquan")!, getSkillById("tiyun")!],
      expReward: 185, goldReward: 90,
    },
    locationId: "western-camp",
    dialogue: "拖雷按住争执双方递来的军报。拖雷：\"先把前锋和粮队接回来。谁的功劳，等人回来再算。\"",
  },
  {
    id: "temujin",
    name: "成吉思汗",
    title: "蒙古大汗",
    work: "射雕英雄传",
    alignment: "中",
    roles: ["剧情"],
    description: "统一蒙古诸部的大汗，识人用兵、赏罚果断，也把征服与杀戮视作扩张权力的手段。",
    combat: {
      hp: 250, hpMax: 250, mp: 80, mpMax: 80,
      attack: 30, defense: 24, speed: 18, statuses: [],
      skills: [getSkillById("changquan")!],
      expReward: 220, goldReward: 150,
    },
    locationId: "western-camp",
    dialogue: "成吉思汗把令箭放到军图中央。成吉思汗：\"我要能执行的办法。要多少骑兵，要几日，把代价一并说出。\"",
  },
  {
    id: "juchi",
    name: "术赤",
    title: "蒙古长子",
    work: "射雕英雄传",
    alignment: "中",
    roles: ["对手", "剧情"],
    description: "成吉思汗长子，领兵经验深，最不能容忍军功被弟弟夺走。争执背后既有军务，也有长期积压的身份压力。",
    combat: {
      hp: 240, hpMax: 240, mp: 75, mpMax: 75,
      attack: 33, defense: 22, speed: 21, statuses: [],
      skills: [getSkillById("changquan")!, getSkillById("tiyun")!],
      expReward: 200, goldReward: 110,
    },
    locationId: "western-camp",
    dialogue: "术赤指向前锋旗号。术赤：\"我的人先到城下，粮道却归别人发令。出了差错，算谁的？\"",
  },
  {
    id: "chagatai",
    name: "察合台",
    title: "蒙古二王子",
    work: "射雕英雄传",
    alignment: "中",
    roles: ["对手", "剧情"],
    description: "成吉思汗次子，强硬好胜，治军严厉。与术赤的冲突会让传令、援军和攻城部署同时失控。",
    combat: {
      hp: 235, hpMax: 235, mp: 80, mpMax: 80,
      attack: 34, defense: 21, speed: 23, statuses: [],
      skills: [getSkillById("changquan")!, getSkillById("tiyun")!],
      expReward: 205, goldReward: 115,
    },
    locationId: "western-camp",
    dialogue: "察合台把马鞭压在案边。察合台：\"军中只认令箭。有人不肯听令，就先把他的兵撤下来。\"",
  },
  {
    id: "samarkand-healer",
    name: "城外医者",
    title: "伤民照料者",
    work: "射雕英雄传",
    alignment: "正",
    roles: ["队友", "剧情"],
    description: "随难民撤到城外的医者，熟悉药材车、伤兵棚和南门小路，只要求交战双方不要拿伤者作饵。",
    combat: {
      hp: 170, hpMax: 170, mp: 55, mpMax: 55,
      attack: 20, defense: 17, speed: 18, statuses: [],
      skills: [getSkillById("changquan")!],
      expReward: 110, goldReward: 35,
    },
    locationId: "samarkand",
    dialogue: "城外医者把伤者名册分成两份。城外医者：\"能走的先走，不能走的要有人守。别把两件事写成同一道军令。\"",
  },
  {
    id: "samarkand-guide",
    name: "商道向导",
    title: "外郭引路人",
    work: "射雕英雄传",
    alignment: "中",
    roles: ["队友", "剧情"],
    description: "往来外郭、药材道与旧渠的商道向导，认路也认各方关卡，但不会替任何军队保证百姓安全。",
    combat: {
      hp: 185, hpMax: 185, mp: 45, mpMax: 45,
      attack: 24, defense: 18, speed: 22, statuses: [],
      skills: [getSkillById("changquan")!, getSkillById("tiyun")!],
      expReward: 120, goldReward: 45,
    },
    locationId: "samarkand",
    dialogue: "商道向导指向干涸旧渠。商道向导：\"这条路能带人出去，带不了马。若有人追，出口只能守一次。\"",
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
