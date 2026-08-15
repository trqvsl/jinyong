import type { BeatResult } from "./schema"

export type StorySystemPriority = "优先" | "主线" | "次选" | "整备" | "整队" | "补给" | "可学" | "可看" | "稍后" | "暂无"

export interface StorySystemPriorities {
  adventure: StorySystemPriority
  character: StorySystemPriority
  shop: StorySystemPriority
  sect: StorySystemPriority
  npc: StorySystemPriority
  letters: StorySystemPriority
}

export interface StoryActDefinition {
  id: string
  beat: string
  order: number
  title: string
  recommendedLocationId: string
  primaryAction: string
  guidance: string
  next: string
  hubName: string
  hubMood: string
  relatedNpcIds: string[]
  priorities: StorySystemPriorities
}

export interface LegacyBeatMigration {
  legacyBeat: string
  targets: Array<{ beat: string; result: BeatResult }>
}

export interface StoryGuidanceOverride {
  afterBeat: string
  beforeBeat?: string
  recommendedLocationId?: string
  primaryAction?: string
  guidance?: string
  next?: string
  hubName?: string
  hubMood?: string
  relatedNpcIds?: string[]
}

export interface StoryProgressDefinition {
  id: string
  name: string
  arcId: string
  acts: StoryActDefinition[]
  legacyBeatMigrations: LegacyBeatMigration[]
  legacyGuidance: StoryGuidanceOverride[]
  complete: {
    primaryAction: string
    guidance: string
    next: string
    hubName: string
    hubMood: string
    relatedNpcIds: string[]
  }
}

const DEFAULT_PRIORITIES: StorySystemPriorities = {
  adventure: "主线",
  character: "整队",
  shop: "补给",
  sect: "可学",
  npc: "可看",
  letters: "暂无",
}

export const SHENDIAO_PROGRESS: StoryProgressDefinition = {
  id: "shendiao",
  name: "射雕英雄传",
  arcId: "shendiao",
  acts: [
    {
      id: "act1-wind",
      beat: "act1-wind",
      order: 1,
      title: "第一幕·风雪旧案",
      recommendedLocationId: "niujia",
      primaryAction: "从牛家村起身",
      guidance: "先去牛家村看看。郭杨两家、雪地伤者与村外官兵，将把这桩旧案推向第一场风雪。",
      next: "下一关键节点：牛家村风雪。",
      hubName: "江湖客舍",
      hubMood: "你暂歇于客舍，桌上铺着地图，窗外仍是一个等你去闯的江湖。",
      relatedNpcIds: ["qiuchuji", "guojing", "yangkang"],
      priorities: {
        adventure: "优先",
        character: "次选",
        shop: "稍后",
        sect: "稍后",
        npc: "稍后",
        letters: "暂无",
      },
    },
    {
      id: "act2-damos",
      beat: "act2-damos",
      order: 2,
      title: "第二幕·大漠长成",
      recommendedLocationId: "damos",
      primaryAction: "北上大漠追线索",
      guidance: "牛家村一夜之后，李萍与郭靖的去向落在北方。大漠中的旧人、师承与部族风波正在聚拢。",
      next: "下一关键节点：蒙古大漠。",
      hubName: "风雪后客舍",
      hubMood: "屋檐残雪未化，牛家村留下的旧案已经把路引向更远的北方。",
      relatedNpcIds: ["guojing", "qiuchuji"],
      priorities: {
        adventure: "优先",
        character: "整备",
        shop: "补给",
        sect: "稍后",
        npc: "可看",
        letters: "暂无",
      },
    },
    {
      id: "act3-zhongdu",
      beat: "act3-zhongdu",
      order: 3,
      title: "第三幕·中都照影",
      recommendedLocationId: "zhangjiakou",
      primaryAction: "南下张家口",
      guidance: "大漠成长告一段落。张家口的白衣骆驼客与小叫花，会把郭靖的南下之路引向中都旧案。",
      next: "下一关键节点：张家口小叫花。",
      hubName: "入关驿舍",
      hubMood: "塞外风沙还留在行囊上，南下商旅已经带来白驼山与中都王府的消息。",
      relatedNpcIds: ["guojing", "huangrong", "hongqigong", "yangkang"],
      priorities: {
        ...DEFAULT_PRIORITIES,
        adventure: "优先",
        character: "整备",
      },
    },
    {
      id: "act4-taohua",
      beat: "act4-taohua",
      order: 4,
      title: "第四幕·五湖桃花",
      recommendedLocationId: "taohuadao",
      primaryAction: "渡海去桃花岛",
      guidance: "王府身世只是开端。太湖旧门、桃花岛试炼与海上风波，会把师承、婚约和五绝旧怨卷到一起。",
      next: "下一关键节点：桃花岛与海上风波。",
      hubName: "江南落脚处",
      hubMood: "水路消息接连送到客舍，东海桃花与太湖旧事正牵出更深的江湖关系。",
      relatedNpcIds: ["huangrong", "huangyaoshi-npc", "guojing", "ouyangfeng-npc"],
      priorities: DEFAULT_PRIORITIES,
    },
    {
      id: "act5-old-debts",
      beat: "act5-old-debts",
      order: 5,
      title: "第五幕·旧债成网",
      recommendedLocationId: "linan",
      primaryAction: "回临安追查旧债",
      guidance: "禁宫、丐帮、铁掌峰与一灯旧事将把武穆遗书和前代恩怨连成一张网。",
      next: "下一关键节点：禁宫盗书与牛家村密室。",
      hubName: "临安客舍",
      hubMood: "客舍窗纸微动，禁宫、丐帮与铁掌峰的消息仍在暗处交错。",
      relatedNpcIds: ["hongqigong", "huangrong", "yangkang"],
      priorities: DEFAULT_PRIORITIES,
    },
    {
      id: "act6-truth",
      beat: "act6-truth",
      order: 6,
      title: "第六幕·真相索命",
      recommendedLocationId: "niujia",
      primaryAction: "回牛家村追因果",
      guidance: "桃花岛血案与多年前的旧证即将汇合。烟雨楼的误战之后，铁枪庙会逼所有人面对真相。",
      next: "下一关键节点：烟雨楼与铁枪庙。",
      hubName: "江南落脚处",
      hubMood: "夜雨压着屋檐，旧恩旧怨像都在等一份迟来的证据。",
      relatedNpcIds: ["yangkang", "guojing", "huangrong", "huangyaoshi-npc", "ouyangfeng-npc"],
      priorities: DEFAULT_PRIORITIES,
    },
    {
      id: "act7-western-campaign",
      beat: "act7-western-campaign",
      order: 7,
      title: "第七幕·万里兵锋",
      recommendedLocationId: "damos",
      primaryAction: "重返大漠赴军令",
      guidance: "个人恩仇之后，更大的兵锋已经越过草原。军令、故人和城中百姓会把选择推到无法回避的位置。",
      next: "下一关键节点：西征城下。",
      hubName: "北归驿舍",
      hubMood: "北来的军报压在案头，旧日草原故人和新的兵锋一同逼近。",
      relatedNpcIds: ["guojing"],
      priorities: DEFAULT_PRIORITIES,
    },
    {
      id: "act8-huashan",
      beat: "act8-huashan",
      order: 8,
      title: "第八幕·华山问侠",
      recommendedLocationId: "huashan",
      primaryAction: "启程赴华山",
      guidance: "旧债、战争与武学都将登上华山。天下第一的胜负之后，还要回答何人才算英雄。",
      next: "下一关键节点：华山论剑与英雄之问。",
      hubName: "华山下客舍",
      hubMood: "山风穿过窗隙，论剑之约与一路行来的选择都已到了收束之时。",
      relatedNpcIds: ["guojing", "huangrong", "huangyaoshi-npc", "ouyangfeng-npc", "hongqigong"],
      priorities: DEFAULT_PRIORITIES,
    },
  ],
  legacyBeatMigrations: [
    { legacyBeat: "niujia", targets: [{ beat: "act1-wind", result: "done" }] },
    { legacyBeat: "damos", targets: [{ beat: "act2-damos", result: "done" }] },
    { legacyBeat: "wangfu", targets: [{ beat: "act3-zhongdu", result: "done" }] },
    {
      legacyBeat: "taohua",
      targets: [
        { beat: "act4-taohua", result: "done" },
        { beat: "act5-old-debts", result: "skipped" },
      ],
    },
    {
      legacyBeat: "yangkang",
      targets: [
        { beat: "act6-truth", result: "done" },
        { beat: "act7-western-campaign", result: "skipped" },
      ],
    },
    { legacyBeat: "huashan", targets: [{ beat: "act8-huashan", result: "done" }] },
  ],
  legacyGuidance: [
    {
      afterBeat: "damos",
      beforeBeat: "meet-rong",
      recommendedLocationId: "zhangjiakou",
      primaryAction: "南下张家口",
      guidance: "大漠一别后，先沿驿路进入张家口。白驼山过境与一名小叫花正在关口等着。",
      next: "下一关键节点：张家口小叫花。",
    },
    {
      afterBeat: "meet-rong",
      beforeBeat: "qigong",
      recommendedLocationId: "zhongdu",
      primaryAction: "赶赴中都",
      guidance: "张家口初遇之后，赵王府、穆易父女与各路江湖高手已经在中都聚拢。",
      next: "下一关键节点：比武招亲与王府旧案。",
    },
    {
      afterBeat: "qigong",
      beforeBeat: "wangfu",
      recommendedLocationId: "zhongdu",
      primaryAction: "了结中都旧案",
      guidance: "旧存档已完成洪七公节点，中都王府身世仍需收束后才会进入下一幕。",
      next: "下一关键节点：杨家身世与赵王府。",
    },
  ],
  complete: {
    primaryAction: "重访华山旧地",
    guidance: "射雕卷当前样板已经收束，可回看华山、牛家村、江南与桃花岛的人物余波。",
    next: "这一卷已收束，可继续游历或等待后续八幕内容补齐。",
    hubName: "华山下客舍",
    hubMood: "论剑风声已经散去，客舍里留下的，是一路选择所结成的江湖回响。",
    relatedNpcIds: ["guojing", "huangrong", "huangyaoshi-npc", "ouyangfeng-npc", "hongqigong"],
  },
}

export const STORY_PROGRESS_DEFINITIONS: StoryProgressDefinition[] = [
  SHENDIAO_PROGRESS,
]
