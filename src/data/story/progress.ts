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
  afterBeat?: string
  beforeBeat?: string
  afterVariant?: { key: string; value: string }
  beforeVariant?: { key: string; value: string }
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
      recommendedLocationId: "taihu",
      primaryAction: "沿水路进入太湖",
      guidance: "王府群英已经南下。先到太湖辨认水寨灯号，归云庄与桃花岛的旧债才会逐步露出。",
      next: "下一关键节点：太湖截船与归云庄。",
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
      relatedNpcIds: ["hongqigong", "huangrong", "yangkang", "luyoujiao", "qiuqianren-npc", "yinggu", "yideng"],
      priorities: DEFAULT_PRIORITIES,
    },
    {
      id: "act6-truth",
      beat: "act6-truth",
      order: 6,
      title: "第六幕·真相索命",
      recommendedLocationId: "niujia",
      primaryAction: "回牛家村见穆念慈",
      guidance: "欧阳克案、君山假帮主与杨康旧线都要先交给穆念慈判断。玩家可以提供证据，不能替她作出断绝与否的选择。",
      next: "下一关键节点：穆念慈断线与桃花岛血案。",
      hubName: "江南落脚处",
      hubMood: "夜雨压着屋檐，旧恩旧怨像都在等一份迟来的证据。",
      relatedNpcIds: ["yangkang", "munianci", "guojing", "huangrong", "kezhene", "hanxiaoying", "huangyaoshi-npc", "ouyangfeng-npc"],
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
      relatedNpcIds: ["guojing", "liping", "huazheng", "zhebie", "tuolei", "temujin"],
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
      next: "下一关键节点：群雄上山与见证席。",
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
    {
      afterVariant: { key: "act4.taihu", value: "cleared" },
      beforeVariant: { key: "act4.guiyun", value: "cleared" },
      recommendedLocationId: "guiyunzhuang",
      primaryAction: "随俘船进入归云庄",
      guidance: "太湖截船已经收束，俘虏、王府密信与段天德都被送往归云庄。英雄宴正在等一份旧案证词。",
      next: "下一关键节点：归云庄英雄宴。",
    },
    {
      afterVariant: { key: "act4.guiyun", value: "cleared" },
      beforeBeat: "act4-taohua",
      recommendedLocationId: "taohuadao",
      primaryAction: "从东海渡口登岛",
      guidance: "归云庄旧案已经翻开，黄药师留下的船也已到渡口。桃花岛三试与白驼山求亲队伍将同时登场。",
      next: "下一关键节点：桃花岛三试与海上火船。",
    },
    {
      afterVariant: { key: "act5.palace", value: "cleared" },
      beforeVariant: { key: "act5.niujia", value: "cleared" },
      recommendedLocationId: "niujia",
      primaryAction: "退回牛家村密室",
      guidance: "禁宫追兵和重伤都不能带进闹市。曲灵风留下的地道通向牛家村，密室外还有一场尚未发生的冲突。",
      next: "下一关键节点：密室七日与欧阳克死因。",
    },
    {
      afterVariant: { key: "act5.niujia", value: "cleared" },
      beforeVariant: { key: "act5.junshan", value: "cleared" },
      recommendedLocationId: "junshan",
      primaryAction: "携打狗棒赴君山",
      guidance: "丐帮传来洪七公死讯，杨康已在君山召集净衣派。黄蓉必须带着竹杖和证言赶到大会。",
      next: "下一关键节点：君山真假帮主。",
    },
    {
      afterVariant: { key: "act5.junshan", value: "cleared" },
      beforeVariant: { key: "act5.tiezhang", value: "cleared" },
      recommendedLocationId: "tiezhangfeng",
      primaryAction: "沿铁掌暗记追上峰",
      guidance: "君山内应与禁宫密件都指向铁掌峰。武穆遗书原本仍在帮中禁地，裘千仞也已得到消息。",
      next: "下一关键节点：铁掌峰禁地与武穆遗书。",
    },
    {
      afterVariant: { key: "act5.tiezhang", value: "cleared" },
      beforeVariant: { key: "act5.blackmarsh", value: "cleared" },
      recommendedLocationId: "blackmarsh",
      primaryAction: "带伤进入黑沼",
      guidance: "铁掌伤势不是寻常药石能解。黑沼中的瑛姑知道一灯居路径，也准备借这次求医送去一件旧物。",
      next: "下一关键节点：黑沼算局。",
    },
    {
      afterVariant: { key: "act5.blackmarsh", value: "cleared" },
      beforeBeat: "act5-old-debts",
      recommendedLocationId: "yidengju",
      primaryAction: "闯过渔樵耕读四关",
      guidance: "瑛姑已经给出水路与算筹。要见一灯，仍需过四名弟子的关，也要决定是否把旧债带到他面前。",
      next: "下一关键节点：一灯救人与前代旧债。",
    },
    {
      afterVariant: { key: "act6.munianci", value: "cleared" },
      beforeVariant: { key: "act6.island", value: "cleared" },
      recommendedLocationId: "taohuadao",
      primaryAction: "赶赴桃花岛查血案",
      guidance: "穆念慈已经作出自己的决定，江南七怪却失去联络。桃花岛旧路、白驼玉饰与蛇毒痕迹将决定能保住多少人和证据。",
      next: "下一关键节点：桃花岛血案与误会扩散。",
    },
    {
      afterVariant: { key: "act6.island", value: "cleared" },
      beforeVariant: { key: "act6.yanyu", value: "cleared" },
      recommendedLocationId: "yanyulou",
      primaryAction: "携证人证物赴烟雨楼",
      guidance: "桃花岛血案已经发生，各方却仍在争执凶手身份。烟雨楼会局要先保住证人和证物，才有机会阻止误会继续扩大。",
      next: "下一关键节点：烟雨楼多方会局。",
    },
    {
      afterVariant: { key: "act6.yanyu", value: "cleared" },
      beforeBeat: "act6-truth",
      recommendedLocationId: "tieqiangmiao",
      primaryAction: "追杨康至铁枪庙",
      guidance: "烟雨楼会局留下了可质询的证人和证物。铁枪庙将按入岛资格、武功伤痕、临死取物与杀人动机逐轮拆解真相。",
      next: "下一关键节点：四轮推理与杨康裁决。",
    },
    {
      afterVariant: { key: "act7.recall", value: "cleared" },
      beforeVariant: { key: "act7.camp", value: "cleared" },
      recommendedLocationId: "western-camp",
      primaryAction: "前往西征大营领职",
      guidance: "草原召令已经验明身份。西征大营中，前锋、粮道和诸王军令正在彼此冲突，必须先确定本次随军职责。",
      next: "下一关键节点：军帐分职与同室操戈。",
      hubName: "西征前哨",
      hubMood: "传令骑兵沿河谷往返，中军旗号与伤兵车正把战争的代价一起送到眼前。",
      relatedNpcIds: ["guojing", "zhebie", "tuolei", "temujin", "juchi", "chagatai"],
    },
    {
      afterVariant: { key: "act7.camp", value: "cleared" },
      beforeVariant: { key: "act7.scout", value: "cleared" },
      recommendedLocationId: "samarkand",
      primaryAction: "先行侦察撒马尔罕",
      guidance: "军中职责已经分定。城门换防、水源粮道与难民通道不可能同时查清，斥候必须先选一处突破。",
      next: "下一关键节点：城外侦察与俘虏口供。",
      hubName: "西征行营",
      hubMood: "远处城墙压在荒原尽头，斥候带回的每一条路都对应另一处来不及查明的缺口。",
      relatedNpcIds: ["guojing", "zhebie", "tuolei"],
    },
    {
      afterVariant: { key: "act7.scout", value: "cleared" },
      beforeVariant: { key: "act7.siege", value: "cleared" },
      recommendedLocationId: "samarkand",
      primaryAction: "携侦察结果赴城下军议",
      guidance: "城门、粮道或民情中已有一项得到核验。军议必须据此选择佯攻、封锁、强攻或先开平民走廊。",
      next: "下一关键节点：城下军令与攻城编组。",
      hubName: "撒马尔罕城外",
      hubMood: "攻城旗号尚未升起，各部却已经按不同方案移动。错误军令会先落到前锋和城中百姓身上。",
      relatedNpcIds: ["guojing", "zhebie", "tuolei", "temujin"],
    },
    {
      afterVariant: { key: "act7.siege", value: "cleared" },
      beforeVariant: { key: "act7.city", value: "cleared" },
      recommendedLocationId: "samarkand",
      primaryAction: "进城约束军纪",
      guidance: "攻城主目标已经有了结果，城内抢掠、伤兵与逃难者却同时出现。现在要决定胜利之后哪些命令仍不可做。",
      next: "下一关键节点：破城军纪、平民撤离与屠城军令。",
      hubName: "破城临时营",
      hubMood: "城门内外都是伤兵与失散人群，庆功号角尚未吹响，街巷里的军纪已经先受考验。",
      relatedNpcIds: ["guojing", "zhebie", "tuolei", "temujin"],
    },
    {
      afterVariant: { key: "act7.city", value: "cleared" },
      beforeVariant: { key: "act7.home-order", value: "cleared" },
      recommendedLocationId: "damos",
      primaryAction: "返回草原接南征军令",
      guidance: "撒马尔罕的军纪与百姓结果已经落定。新的军令却把兵锋转向南方，也把郭靖、华筝与李萍推到同一场选择前。",
      next: "下一关键节点：南征军令、华筝与李萍。",
      hubName: "草原归营处",
      hubMood: "西征军旗正在回卷，南向军报已经先到。旧日毡帐与新的军令隔着不到一箭之地。",
      relatedNpcIds: ["guojing", "liping", "huazheng", "temujin"],
    },
    {
      afterVariant: { key: "act7.home-order", value: "cleared" },
      beforeBeat: "act7-western-campaign",
      recommendedLocationId: "damos",
      primaryAction: "决定离营与南归路线",
      guidance: "南征军令的立场已经说清，仍需安排谁同行、谁护送难民、谁留在军中，以及如何离开共同生活多年的草原。",
      next: "下一关键节点：南归、留军或草原长期结局。",
      hubName: "离营前夜",
      hubMood: "营门外的马已经备好，不同方向的路引却不能同时带走。曾经并肩的人都在等最后一句明话。",
      relatedNpcIds: ["guojing", "liping", "huazheng", "zhebie", "tuolei"],
    },
    {
      afterVariant: { key: "act8.arrival", value: "cleared" },
      beforeVariant: { key: "act8.testimony", value: "cleared" },
      recommendedLocationId: "huashan",
      primaryAction: "参加山腰华山公议",
      guidance: "入山身份与见证席已经确定。铁枪庙旧案、桃花岛血案和撒马尔罕军报要分别说明哪些可证、哪些仍有争议。",
      next: "下一关键节点：旧案与战争记录公议。",
      hubName: "华山山腰客舍",
      hubMood: "见证人与各方来客分坐山腰，原卷尚未展开，谁愿意公开什么已经先形成分歧。",
      relatedNpcIds: ["guojing", "huangrong", "munianci", "kezhene", "hanxiaoying", "huazheng"],
    },
    {
      afterVariant: { key: "act8.testimony", value: "cleared" },
      beforeVariant: { key: "act8.value-stage", value: "cleared" },
      recommendedLocationId: "huashan",
      primaryAction: "处理最后军报",
      guidance: "公议记录已经形成，新的南侵军报、伤者与追缉令却同时抵达。人、原卷、责任人与权位无法全部兼得。",
      next: "下一关键节点：最后军报与山门取舍。",
      hubName: "华山公议棚",
      hubMood: "军报压在公议原卷旁，山门下的伤者车与追缉人马都在等待同一道答复。",
      relatedNpcIds: ["guojing", "huangrong", "hongqigong", "huazheng", "samarkand-healer", "samarkand-guide"],
    },
    {
      afterVariant: { key: "act8.value-stage", value: "cleared" },
      beforeVariant: { key: "act8.contest", value: "cleared" },
      recommendedLocationId: "huashan",
      primaryAction: "登绝顶完成论剑",
      guidance: "最后军报已经付出明确代价。绝顶石台仍在等对决、守台、护卷、观战或退席的最终选择。",
      next: "下一关键节点：绝顶论剑与武学定席。",
      hubName: "华山绝顶前营",
      hubMood: "山风卷过石台，公议留下的伤者与原卷都还在场，论剑不再只是一场名次之争。",
      relatedNpcIds: ["guojing", "huangrong", "huangyaoshi-npc", "ouyangfeng-npc", "hongqigong", "yideng"],
    },
    {
      afterVariant: { key: "act8.contest", value: "cleared" },
      beforeBeat: "act8-huashan",
      recommendedLocationId: "huashan",
      primaryAction: "确认射雕卷最终去向",
      guidance: "公议记录、最后军报和论剑结果都已落定。现在要按一路真实选择确认人物关系、江湖身份与最终归处。",
      next: "下一关键节点：江湖定席与卷末后日谈。",
      hubName: "华山离山亭",
      hubMood: "石台已经空下，各路人马却走向不同山道。最后一份名册只等确认去向。",
      relatedNpcIds: ["guojing", "huangrong", "huangyaoshi-npc", "hongqigong", "huazheng", "munianci"],
    },
  ],
  complete: {
    primaryAction: "重访华山旧地",
    guidance: "射雕卷现代八幕已经收束，可回看华山、牛家村、江南与桃花岛的人物余波。",
    next: "射雕卷现代八幕已完整收束，可继续游历并查看人物与世界回响。",
    hubName: "华山下客舍",
    hubMood: "论剑风声已经散去，客舍里留下的，是一路选择所结成的江湖回响。",
    relatedNpcIds: ["guojing", "huangrong", "huangyaoshi-npc", "ouyangfeng-npc", "hongqigong"],
  },
}

export const STORY_PROGRESS_DEFINITIONS: StoryProgressDefinition[] = [
  SHENDIAO_PROGRESS,
]
