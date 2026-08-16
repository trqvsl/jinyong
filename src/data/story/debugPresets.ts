import type { BeatResult, NpcRelationType } from "./schema"

export interface StoryDebugNpcPatch {
  alive?: boolean
  recruited?: boolean
  faction?: string
  fateTags?: string[]
  relationType?: NpcRelationType
}

export interface StoryDebugPreset {
  id: string
  kind: "act" | "route"
  title: string
  description: string
  arcId: string
  expectedActId: string
  targetLocationId: string
  targetEventId?: string
  targetNodeId?: string
  targetChoiceId?: string
  routeGroupId?: "temple" | "act7-ending" | "act8-ending"
  beats: Record<string, BeatResult>
  variants?: Record<string, string>
  flags?: Record<string, boolean | number | string>
  items?: Record<string, number>
  resetItemIds?: string[]
  npcs?: Record<string, StoryDebugNpcPatch>
  relations?: Record<string, number>
  factions?: Record<string, { attitude: number; power: number }>
  completedEvents?: string[]
  karma?: number
}

export interface StoryDebugVariantOption {
  value: string
  label: string
}

export interface StoryDebugVariantField {
  key: string
  label: string
  group: StoryDebugVariantGroup
  options: StoryDebugVariantOption[]
}

export type StoryDebugVariantGroup =
  | "第六幕·阶段"
  | "第六幕·人物与会局"
  | "第六幕·四轮证据"
  | "第六幕·裁决"
  | "第七幕·阶段"
  | "第七幕·战争"
  | "第七幕·终局"

export interface StoryDebugRouteGroup {
  id: NonNullable<StoryDebugPreset["routeGroupId"]>
  title: string
  description: string
}

const COMPLETED_ACT1 = ["shendiao-niujia-opening"]
const COMPLETED_ACT2 = [...COMPLETED_ACT1, "shendiao-damos"]
const COMPLETED_ACT3 = [...COMPLETED_ACT2, "shendiao-zhangjiakou", "shendiao-zhongdu"]
const COMPLETED_ACT4 = [
  ...COMPLETED_ACT3,
  "shendiao-taihu",
  "shendiao-guiyunzhuang",
  "shendiao-taohua-act4",
]
const COMPLETED_ACT5 = [
  ...COMPLETED_ACT4,
  "shendiao-linan-act5",
  "shendiao-niujia-act5",
  "shendiao-junshan-act5",
  "shendiao-tiezhang-act5",
  "shendiao-blackmarsh-act5",
  "shendiao-yideng-act5",
]
const COMPLETED_TO_TEMPLE = [
  ...COMPLETED_ACT5,
  "shendiao-niujia-act6",
  "shendiao-taohua-blood-act6",
  "shendiao-yanyulou-act6",
]
const COMPLETED_ACT6 = [
  ...COMPLETED_TO_TEMPLE,
  "shendiao-tieqiangmiao-act6",
]
const COMPLETED_ACT7_HOME = [
  ...COMPLETED_ACT6,
  "shendiao-damos-act7",
  "shendiao-western-camp-act7",
  "shendiao-samarkand-scout-act7",
  "shendiao-samarkand-siege-act7",
  "shendiao-samarkand-aftermath-act7",
  "shendiao-damos-home-order-act7",
]
const COMPLETED_ACT7 = [
  ...COMPLETED_ACT7_HOME,
  "shendiao-damos-departure-act7",
]
const COMPLETED_ACT8_TO_EPILOGUE = [
  ...COMPLETED_ACT7,
  "shendiao-huashan-arrival-act8",
  "shendiao-huashan-testimony-act8",
  "shendiao-huashan-crisis-act8",
  "shendiao-huashan-contest-act8",
]

const BEATS_TO_ACT2: Record<string, BeatResult> = {
  "act1-wind": "done",
  niujia: "done",
}

const BEATS_TO_ACT3: Record<string, BeatResult> = {
  ...BEATS_TO_ACT2,
  "act2-damos": "done",
  damos: "done",
}

const BEATS_TO_ACT4: Record<string, BeatResult> = {
  ...BEATS_TO_ACT3,
  "act3-zhongdu": "done",
  "meet-rong": "done",
  qigong: "done",
  wangfu: "done",
}

const BEATS_TO_ACT5: Record<string, BeatResult> = {
  ...BEATS_TO_ACT4,
  "act4-taohua": "done",
  taohua: "done",
}

const BEATS_TO_ACT6: Record<string, BeatResult> = {
  ...BEATS_TO_ACT5,
  "act5-old-debts": "done",
}

const BEATS_TO_ACT7: Record<string, BeatResult> = {
  ...BEATS_TO_ACT6,
  "act6-truth": "done",
}

const BEATS_TO_ACT8: Record<string, BeatResult> = {
  ...BEATS_TO_ACT7,
  "act7-western-campaign": "done",
}

export const STORY_DEBUG_EVIDENCE_IDS = [
  "yangkang-jade-shoe",
  "han-xiaoying-blood-writing",
  "taohua-snake-venom",
  "yellow-robe-fiber",
  "taohua-route-scratch",
  "ouyangke-jade-shard",
] as const

export const STORY_DEBUG_ACT_PRESETS: StoryDebugPreset[] = [
  {
    id: "act1-start",
    kind: "act",
    title: "第一幕",
    description: "风雪旧案 · 牛家村",
    arcId: "shendiao",
    expectedActId: "act1-wind",
    targetLocationId: "niujia",
    targetEventId: "shendiao-niujia-opening",
    beats: {},
    resetItemIds: [...STORY_DEBUG_EVIDENCE_IDS],
    completedEvents: [],
    karma: 0,
  },
  {
    id: "act2-start",
    kind: "act",
    title: "第二幕",
    description: "大漠长成 · 蒙古草原",
    arcId: "shendiao",
    expectedActId: "act2-damos",
    targetLocationId: "damos",
    targetEventId: "shendiao-damos",
    beats: BEATS_TO_ACT2,
    flags: { "shendiao.niujia.saved_liping": true },
    resetItemIds: [...STORY_DEBUG_EVIDENCE_IDS],
    completedEvents: COMPLETED_ACT1,
    karma: 0,
  },
  {
    id: "act3-start",
    kind: "act",
    title: "第三幕",
    description: "中都照影 · 张家口",
    arcId: "shendiao",
    expectedActId: "act3-zhongdu",
    targetLocationId: "zhangjiakou",
    targetEventId: "shendiao-zhangjiakou",
    beats: BEATS_TO_ACT3,
    flags: { "shendiao.damos.departure": "with-guojing" },
    resetItemIds: [...STORY_DEBUG_EVIDENCE_IDS],
    completedEvents: COMPLETED_ACT2,
    karma: 0,
  },
  {
    id: "act4-start",
    kind: "act",
    title: "第四幕",
    description: "五湖桃花 · 太湖",
    arcId: "shendiao",
    expectedActId: "act4-taohua",
    targetLocationId: "taihu",
    targetEventId: "shendiao-taihu",
    beats: BEATS_TO_ACT4,
    flags: { "shendiao.zhongdu.departure": "guo-huang" },
    resetItemIds: [...STORY_DEBUG_EVIDENCE_IDS],
    completedEvents: COMPLETED_ACT3,
    karma: 0,
  },
  {
    id: "act5-start",
    kind: "act",
    title: "第五幕",
    description: "旧债成网 · 临安",
    arcId: "shendiao",
    expectedActId: "act5-old-debts",
    targetLocationId: "linan",
    targetEventId: "shendiao-linan-act5",
    beats: BEATS_TO_ACT5,
    variants: { "act4.taohua-route": "guo-huang" },
    resetItemIds: [...STORY_DEBUG_EVIDENCE_IDS],
    completedEvents: COMPLETED_ACT4,
    karma: 0,
  },
  {
    id: "act6-start",
    kind: "act",
    title: "第六幕",
    description: "真相索命 · 牛家村",
    arcId: "shendiao",
    expectedActId: "act6-truth",
    targetLocationId: "niujia",
    targetEventId: "shendiao-niujia-act6",
    beats: BEATS_TO_ACT6,
    variants: {
      "act4.taohua-route": "guo-huang",
      "act5.beggar": "rong-recognized",
      "act5.ouyangke": "killed-witnessed",
      "act5.wumu-destination": "beggar-network",
    },
    items: { "ouyangke-jade-shard": 1 },
    resetItemIds: [...STORY_DEBUG_EVIDENCE_IDS],
    completedEvents: COMPLETED_ACT5,
    karma: 0,
  },
  {
    id: "act7-start",
    kind: "act",
    title: "第七幕",
    description: "万里兵锋 · 蒙古大漠",
    arcId: "shendiao",
    expectedActId: "act7-western-campaign",
    targetLocationId: "damos",
    targetEventId: "shendiao-damos-act7",
    beats: BEATS_TO_ACT7,
    variants: {
      "act5.wumu-destination": "beggar-network",
      "act6.aftermath": "return-damos",
      "act6.yangkang-verdict": "captured",
    },
    flags: {
      "shendiao.niujia.saved_liping": true,
      "shendiao.damos.reworked": true,
      "shendiao.damos.growth": "riding",
      "shendiao.damos.departure": "with-guojing",
    },
    items: { "mongol-wolf-tally": 1 },
    resetItemIds: [...STORY_DEBUG_EVIDENCE_IDS, "mongol-wolf-tally"],
    relations: {
      guojing: 30,
      huazheng: 15,
      liping: 20,
      zhebie: 15,
    },
    factions: {
      mongol: { attitude: 20, power: 80 },
    },
    completedEvents: COMPLETED_ACT6,
    karma: 10,
  },
  {
    id: "act8-start",
    kind: "act",
    title: "第八幕",
    description: "华山问侠 · 华山",
    arcId: "shendiao",
    expectedActId: "act8-huashan",
    targetLocationId: "huashan",
    targetEventId: "shendiao-huashan-arrival-act8",
    beats: BEATS_TO_ACT8,
    variants: {
      "act4.taohua-route": "guo-huang",
      "act5.wumu-destination": "beggar-network",
      "act6.munianci-outcome": "broken",
      "act6.island-outcome": "xiaoying-saved",
      "act6.misunderstanding": "questioning",
      "act6.truth-strength": "complete",
      "act6.yangkang-verdict": "captured",
      "act7.discipline": "enforced",
      "act7.evacuation": "full",
      "act7.order": "defied",
      "act7.huazheng": "helped-escape",
      "act7.liping": "survived-prepared",
      "act7.departure": "with-guojing",
    },
    flags: {
      "shendiao.niujia.saved_liping": true,
      "shendiao.damos.reworked": true,
      "shendiao.damos.growth": "survival",
      "shendiao.damos.departure": "with-guojing",
    },
    resetItemIds: [...STORY_DEBUG_EVIDENCE_IDS, "mongol-wolf-tally"],
    npcs: {
      liping: { alive: true, fateTags: ["确认郭靖抗命后走准备路线离营"] },
      yangkang: { alive: true, fateTags: ["铁枪庙被捕待审"] },
      hanxiaoying: { alive: true },
    },
    relations: {
      guojing: 45,
      huangrong: 35,
      "huangyaoshi-npc": 20,
      huazheng: 30,
      liping: 35,
    },
    factions: {
      mongol: { attitude: -20, power: 80 },
    },
    completedEvents: COMPLETED_ACT7,
    karma: 35,
  },
]

const TEMPLE_BASE_VARIANTS: Record<string, string> = {
  "act4.taohua-route": "guo-huang",
  "act5.beggar": "rong-recognized",
  "act5.wumu-destination": "beggar-network",
  "act6.munianci": "cleared",
  "act6.island": "cleared",
  "act6.yanyu": "cleared",
}

const TEMPLE_BASE_NPCS: Record<string, StoryDebugNpcPatch> = {
  kezhene: { alive: true },
  yangkang: { alive: true },
}

const COMPLETE_EVIDENCE: Record<string, number> = {
  "yangkang-jade-shoe": 1,
  "han-xiaoying-blood-writing": 1,
  "taohua-snake-venom": 1,
  "yellow-robe-fiber": 1,
  "taohua-route-scratch": 1,
  "ouyangke-jade-shard": 1,
}

const ISLAND_EVIDENCE: Record<string, number> = {
  "yangkang-jade-shoe": 1,
  "han-xiaoying-blood-writing": 1,
  "taohua-snake-venom": 1,
  "yellow-robe-fiber": 1,
  "taohua-route-scratch": 1,
}

const ACT7_ENDING_BASE_VARIANTS: Record<string, string> = {
  "act5.wumu-destination": "beggar-network",
  "act6.aftermath": "return-damos",
  "act7.recall": "cleared",
  "act7.camp": "cleared",
  "act7.scout": "cleared",
  "act7.siege": "cleared",
  "act7.city": "cleared",
  "act7.home-order": "cleared",
  "act7.brothers": "reconciled",
  "act7.prisoners": "verified",
  "act7.scout-method": "civilian",
  "act7.intel": "complete",
  "act7.siege-plan": "corridor",
  "act7.siege-outcome": "clean",
}

const ACT7_ENDING_FLAGS: Record<string, boolean | number | string> = {
  "shendiao.niujia.saved_liping": true,
  "shendiao.damos.reworked": true,
  "shendiao.damos.growth": "survival",
  "shendiao.damos.departure": "with-guojing",
}

const ACT8_ENDING_BASE_VARIANTS: Record<string, string> = {
  "act4.taohua-route": "independent",
  "act7.order": "obeyed",
  "act7.departure": "double-agent",
  "act7.huazheng": "broke-ties",
  "act8.entry": "covert-messenger",
  "act8.witnesses": "divided",
  "act8.record": "contested",
  "act8.value": "pursue-raiders",
  "act8.value-cost": "record-damaged",
  "act8.martial-path": "observe",
  "act8.martial": "understood",
  "act8.title": "none",
  "act8.arrival": "cleared",
  "act8.testimony": "cleared",
  "act8.value-stage": "cleared",
  "act8.contest": "cleared",
}

export const STORY_DEBUG_ROUTE_GROUPS: StoryDebugRouteGroup[] = [
  {
    id: "temple",
    title: "铁枪庙路线夹具",
    description: "载入后从地图进入铁枪庙",
  },
  {
    id: "act7-ending",
    title: "第七幕终局夹具",
    description: "载入后从蒙古大漠进入离营选择",
  },
  {
    id: "act8-ending",
    title: "第八幕终局夹具",
    description: "载入后从华山核对触发事实与最终定席",
  },
]

export const STORY_DEBUG_ROUTE_PRESETS: StoryDebugPreset[] = [
  {
    id: "temple-complete-evidence",
    kind: "route",
    routeGroupId: "temple",
    title: "完整证据",
    description: "双证人、六项证物、王府退路封死，可验证被捕与有限认罪。",
    arcId: "shendiao",
    expectedActId: "act6-truth",
    targetLocationId: "tieqiangmiao",
    targetEventId: "shendiao-tieqiangmiao-act6",
    beats: BEATS_TO_ACT6,
    variants: {
      ...TEMPLE_BASE_VARIANTS,
      "act5.ouyangke": "killed-witnessed",
      "act6.munianci-evidence": "material",
      "act6.munianci-outcome": "broken",
      "act6.island-outcome": "xiaoying-saved",
      "act6.misunderstanding": "questioning",
      "act6.yanyu-focus": "oral-only",
      "act6.yanyu-outcome": "exits-sealed",
    },
    items: COMPLETE_EVIDENCE,
    resetItemIds: [...STORY_DEBUG_EVIDENCE_IDS],
    npcs: {
      ...TEMPLE_BASE_NPCS,
      hanxiaoying: { alive: true },
      ouyangke: { alive: false },
    },
    completedEvents: COMPLETED_TO_TEMPLE,
    karma: 0,
  },
  {
    id: "temple-partial-evidence",
    kind: "route",
    routeGroupId: "temple",
    title: "证据残缺",
    description: "只保留翡翠鞋与血字，四轮必须使用待核记录。",
    arcId: "shendiao",
    expectedActId: "act6-truth",
    targetLocationId: "tieqiangmiao",
    targetEventId: "shendiao-tieqiangmiao-act6",
    beats: BEATS_TO_ACT6,
    variants: {
      ...TEMPLE_BASE_VARIANTS,
      "act5.ouyangke": "killed-witnessed",
      "act6.munianci-evidence": "hearsay",
      "act6.munianci-outcome": "informed-unresolved",
      "act6.island-outcome": "ke-saved",
      "act6.misunderstanding": "partial",
      "act6.yanyu-focus": "oral-only",
      "act6.yanyu-outcome": "evidence-damaged",
    },
    items: {
      "yangkang-jade-shoe": 1,
      "han-xiaoying-blood-writing": 1,
    },
    resetItemIds: [...STORY_DEBUG_EVIDENCE_IDS],
    npcs: {
      ...TEMPLE_BASE_NPCS,
      hanxiaoying: { alive: false },
      ouyangke: { alive: false },
    },
    completedEvents: COMPLETED_TO_TEMPLE,
    karma: 0,
  },
  {
    id: "temple-ouyangke-alive",
    kind: "route",
    routeGroupId: "temple",
    title: "欧阳克存活",
    description: "白驼复仇动机自动降级，只能证明王府与白驼合作。",
    arcId: "shendiao",
    expectedActId: "act6-truth",
    targetLocationId: "tieqiangmiao",
    targetEventId: "shendiao-tieqiangmiao-act6",
    beats: BEATS_TO_ACT6,
    variants: {
      ...TEMPLE_BASE_VARIANTS,
      "act5.ouyangke": "survived-wounded",
      "act6.munianci-evidence": "eyewitness",
      "act6.munianci-outcome": "informed-unresolved",
      "act6.island-outcome": "xiaoying-saved",
      "act6.misunderstanding": "questioning",
      "act6.yanyu-focus": "baituo-traces",
      "act6.yanyu-outcome": "wanyan-escaped",
    },
    items: ISLAND_EVIDENCE,
    resetItemIds: [...STORY_DEBUG_EVIDENCE_IDS],
    npcs: {
      ...TEMPLE_BASE_NPCS,
      hanxiaoying: { alive: true },
      ouyangke: { alive: true },
    },
    completedEvents: COMPLETED_TO_TEMPLE,
    karma: 0,
  },
  {
    id: "temple-han-dead",
    kind: "route",
    routeGroupId: "temple",
    title: "韩小莹死亡",
    description: "活证缺席，由未完血字与验毒记录支撑第二轮。",
    arcId: "shendiao",
    expectedActId: "act6-truth",
    targetLocationId: "tieqiangmiao",
    targetEventId: "shendiao-tieqiangmiao-act6",
    beats: BEATS_TO_ACT6,
    variants: {
      ...TEMPLE_BASE_VARIANTS,
      "act5.ouyangke": "killed-witnessed",
      "act6.munianci-evidence": "material",
      "act6.munianci-outcome": "broken",
      "act6.island-outcome": "ke-saved",
      "act6.misunderstanding": "questioning",
      "act6.yanyu-focus": "blood-writing",
      "act6.yanyu-outcome": "evidence-secured",
    },
    items: COMPLETE_EVIDENCE,
    resetItemIds: [...STORY_DEBUG_EVIDENCE_IDS],
    npcs: {
      ...TEMPLE_BASE_NPCS,
      hanxiaoying: { alive: false },
      ouyangke: { alive: false },
    },
    completedEvents: COMPLETED_TO_TEMPLE,
    karma: 0,
  },
  {
    id: "temple-player-cover",
    kind: "route",
    routeGroupId: "temple",
    title: "玩家持续包庇",
    description: "破庙毁证、烟雨楼助退与高关系同时成立，可验证主动助逃。",
    arcId: "shendiao",
    expectedActId: "act6-truth",
    targetLocationId: "tieqiangmiao",
    targetEventId: "shendiao-tieqiangmiao-act6",
    beats: BEATS_TO_ACT6,
    variants: {
      ...TEMPLE_BASE_VARIANTS,
      "act5.ouyangke": "killed-concealed",
      "act6.munianci-evidence": "hidden",
      "act6.munianci-outcome": "hidden",
      "act6.island-outcome": "ke-saved",
      "act6.misunderstanding": "weak",
      "act6.yanyu-focus": "oral-only",
      "act6.yanyu-outcome": "yangkang-covered",
    },
    flags: { "shendiao.zhongdu.yangkang-choice": "return-palace" },
    items: {
      "yangkang-jade-shoe": 1,
      "han-xiaoying-blood-writing": 1,
    },
    resetItemIds: [...STORY_DEBUG_EVIDENCE_IDS],
    npcs: {
      ...TEMPLE_BASE_NPCS,
      hanxiaoying: { alive: false },
      ouyangke: { alive: false },
    },
    relations: { yangkang: 35, guojing: -10, huangrong: -10 },
    completedEvents: COMPLETED_TO_TEMPLE,
    karma: -25,
  },
  {
    id: "act7-with-guojing",
    kind: "route",
    routeGroupId: "act7-ending",
    title: "随郭靖南归",
    description: "公开抗命、华筝放行、李萍走准备路线，可验证母子同行版本。",
    arcId: "shendiao",
    expectedActId: "act7-western-campaign",
    targetLocationId: "damos",
    targetEventId: "shendiao-damos-departure-act7",
    targetNodeId: "departure-choice",
    targetChoiceId: "leave-with-guojing",
    beats: BEATS_TO_ACT7,
    variants: {
      ...ACT7_ENDING_BASE_VARIANTS,
      "act7.role": "command",
      "act7.discipline": "enforced",
      "act7.evacuation": "full",
      "act7.order": "defied",
      "act7.huazheng": "helped-escape",
      "act7.liping": "survived-prepared",
    },
    flags: ACT7_ENDING_FLAGS,
    items: { "mongol-wolf-tally": 1 },
    resetItemIds: [...STORY_DEBUG_EVIDENCE_IDS, "mongol-wolf-tally"],
    npcs: {
      liping: { alive: true, fateTags: ["确认郭靖抗命后走准备路线离营"] },
    },
    relations: { guojing: 45, huazheng: 30, liping: 35, zhebie: 15 },
    factions: { mongol: { attitude: -20, power: 80 } },
    completedEvents: COMPLETED_ACT7_HOME,
    karma: 35,
  },
  {
    id: "act7-escort-refugees",
    kind: "route",
    routeGroupId: "act7-ending",
    title: "护送难民",
    description: "泄露屠城令、华筝追捕、李萍留帐断后，可验证难民车队路线。",
    arcId: "shendiao",
    expectedActId: "act7-western-campaign",
    targetLocationId: "damos",
    targetEventId: "shendiao-damos-departure-act7",
    targetNodeId: "departure-choice",
    targetChoiceId: "escort-refugees",
    beats: BEATS_TO_ACT7,
    variants: {
      ...ACT7_ENDING_BASE_VARIANTS,
      "act7.role": "independent",
      "act7.discipline": "limited",
      "act7.evacuation": "full",
      "act7.order": "betrayed",
      "act7.huazheng": "led-pursuit",
      "act7.liping": "died-covering-retreat",
    },
    flags: { ...ACT7_ENDING_FLAGS, "shendiao.damos.growth": "free" },
    resetItemIds: [...STORY_DEBUG_EVIDENCE_IDS, "mongol-wolf-tally"],
    npcs: {
      liping: { alive: false, fateTags: ["留帐断后拒绝成为人质"] },
    },
    relations: { guojing: 35, huazheng: -15, liping: 20 },
    factions: { mongol: { attitude: -35, power: 80 } },
    completedEvents: COMPLETED_ACT7_HOME,
    karma: 45,
  },
  {
    id: "act7-double-agent",
    kind: "route",
    routeGroupId: "act7-ending",
    title: "双面留军",
    description: "拖延军令、华筝留守、李萍明志死亡，可验证暗报与军中身份。",
    arcId: "shendiao",
    expectedActId: "act7-western-campaign",
    targetLocationId: "damos",
    targetEventId: "shendiao-damos-departure-act7",
    targetNodeId: "departure-choice",
    targetChoiceId: "remain-double-agent",
    beats: BEATS_TO_ACT7,
    variants: {
      ...ACT7_ENDING_BASE_VARIANTS,
      "act7.role": "command",
      "act7.discipline": "limited",
      "act7.evacuation": "partial",
      "act7.order": "delayed",
      "act7.huazheng": "stayed-loyal",
      "act7.liping": "died-testimony",
    },
    flags: ACT7_ENDING_FLAGS,
    items: { "mongol-wolf-tally": 1 },
    resetItemIds: [...STORY_DEBUG_EVIDENCE_IDS, "mongol-wolf-tally"],
    npcs: {
      liping: { alive: false, fateTags: ["以死阻止郭靖屈服南征军令"] },
    },
    relations: { guojing: 25, huazheng: 15, liping: 20 },
    factions: { mongol: { attitude: -8, power: 80 } },
    completedEvents: COMPLETED_ACT7_HOME,
    karma: 10,
  },
  {
    id: "act7-mongol-command",
    kind: "route",
    routeGroupId: "act7-ending",
    title: "保留蒙古军职",
    description: "服从屠城令、华筝断绝、李萍明志死亡，郭靖同行已关闭。",
    arcId: "shendiao",
    expectedActId: "act7-western-campaign",
    targetLocationId: "damos",
    targetEventId: "shendiao-damos-departure-act7",
    targetNodeId: "departure-choice",
    targetChoiceId: "keep-mongol-command",
    beats: BEATS_TO_ACT7,
    variants: {
      ...ACT7_ENDING_BASE_VARIANTS,
      "act7.role": "command",
      "act7.discipline": "permissive",
      "act7.evacuation": "failed",
      "act7.order": "obeyed",
      "act7.huazheng": "broke-ties",
      "act7.liping": "died-testimony",
    },
    flags: ACT7_ENDING_FLAGS,
    items: { "mongol-wolf-tally": 1 },
    resetItemIds: [...STORY_DEBUG_EVIDENCE_IDS, "mongol-wolf-tally"],
    npcs: {
      liping: { alive: false, fateTags: ["以死阻止郭靖屈服南征军令"] },
    },
    relations: { guojing: -35, huazheng: -25, liping: 10 },
    factions: { mongol: { attitude: 40, power: 90 } },
    completedEvents: COMPLETED_ACT7_HOME,
    karma: -50,
  },
  {
    id: "act7-grassland-ending",
    kind: "route",
    routeGroupId: "act7-ending",
    title: "草原长期结局",
    description: "拖延军令、华筝留守、退出征战，可验证草原收束路线。",
    arcId: "shendiao",
    expectedActId: "act7-western-campaign",
    targetLocationId: "damos",
    targetEventId: "shendiao-damos-departure-act7",
    targetNodeId: "departure-choice",
    targetChoiceId: "choose-grassland-ending",
    beats: BEATS_TO_ACT7,
    variants: {
      ...ACT7_ENDING_BASE_VARIANTS,
      "act7.role": "logistics",
      "act7.discipline": "enforced",
      "act7.evacuation": "partial",
      "act7.order": "delayed",
      "act7.huazheng": "stayed-loyal",
      "act7.liping": "died-testimony",
    },
    flags: ACT7_ENDING_FLAGS,
    resetItemIds: [...STORY_DEBUG_EVIDENCE_IDS, "mongol-wolf-tally"],
    npcs: {
      liping: { alive: false, fateTags: ["以死阻止郭靖屈服南征军令"] },
    },
    relations: { guojing: 20, huazheng: 20, liping: 20 },
    factions: { mongol: { attitude: 0, power: 80 } },
    completedEvents: COMPLETED_ACT7_HOME,
    karma: 5,
  },
  {
    id: "act8-ending-commander",
    kind: "route",
    routeGroupId: "act8-ending",
    title: "军中执令",
    description: "蒙古军职、阵营支持与接管山门同时成立，验证军职结局优先级。",
    arcId: "shendiao",
    expectedActId: "act8-huashan",
    targetLocationId: "huashan",
    targetEventId: "shendiao-huashan-epilogue-act8",
    targetNodeId: "facts-commander",
    beats: BEATS_TO_ACT8,
    variants: {
      ...ACT8_ENDING_BASE_VARIANTS,
      "act7.departure": "mongol-command",
      "act8.record": "falsified",
      "act8.value": "claim-seat",
      "act8.value-cost": "trust-lost",
      "act8.martial-path": "duel",
      "act8.martial": "won",
    },
    relations: { guojing: -20, huangrong: -20 },
    factions: { mongol: { attitude: 30, power: 90 } },
    resetItemIds: [...STORY_DEBUG_EVIDENCE_IDS, "mongol-wolf-tally"],
    completedEvents: COMPLETED_ACT8_TO_EPILOGUE,
    karma: -20,
  },
  {
    id: "act8-ending-grassland",
    kind: "route",
    routeGroupId: "act8-ending",
    title: "草原旧路",
    description: "草原长期离营、公议争议与优先护人并存，验证华筝旧约收束。",
    arcId: "shendiao",
    expectedActId: "act8-huashan",
    targetLocationId: "huashan",
    targetEventId: "shendiao-huashan-epilogue-act8",
    targetNodeId: "facts-grassland",
    beats: BEATS_TO_ACT8,
    variants: {
      ...ACT8_ENDING_BASE_VARIANTS,
      "act7.departure": "grassland-ending",
      "act7.huazheng": "stayed-loyal",
      "act8.value": "save-crowd",
      "act8.value-cost": "culprit-escaped",
      "act8.martial-path": "decline",
      "act8.martial": "refused",
    },
    relations: { huazheng: 35 },
    resetItemIds: [...STORY_DEBUG_EVIDENCE_IDS, "mongol-wolf-tally"],
    completedEvents: COMPLETED_ACT8_TO_EPILOGUE,
    karma: 5,
  },
  {
    id: "act8-ending-taohua",
    kind: "route",
    routeGroupId: "act8-ending",
    title: "海上桃花",
    description: "桃花旧门、高人物关系、完整公议与守卷行动共同成立。",
    arcId: "shendiao",
    expectedActId: "act8-huashan",
    targetLocationId: "huashan",
    targetEventId: "shendiao-huashan-epilogue-act8",
    targetNodeId: "facts-taohua",
    beats: BEATS_TO_ACT8,
    variants: {
      ...ACT8_ENDING_BASE_VARIANTS,
      "act4.taohua-route": "guo-huang",
      "act7.departure": "with-guojing",
      "act7.order": "defied",
      "act8.record": "full",
      "act8.value": "guard-record",
      "act8.value-cost": "people-hurt",
    },
    relations: {
      huangrong: 40,
      "huangyaoshi-npc": 30,
      guojing: 30,
    },
    resetItemIds: [...STORY_DEBUG_EVIDENCE_IDS, "mongol-wolf-tally"],
    completedEvents: COMPLETED_ACT8_TO_EPILOGUE,
    karma: 30,
  },
  {
    id: "act8-ending-hero",
    kind: "route",
    routeGroupId: "act8-ending",
    title: "并肩南行",
    description: "护送难民、公开抗命、守住原卷与郭靖信任共同成立。",
    arcId: "shendiao",
    expectedActId: "act8-huashan",
    targetLocationId: "huashan",
    targetEventId: "shendiao-huashan-epilogue-act8",
    targetNodeId: "facts-hero",
    beats: BEATS_TO_ACT8,
    variants: {
      ...ACT8_ENDING_BASE_VARIANTS,
      "act7.departure": "escort-refugees",
      "act7.order": "defied",
      "act8.record": "full",
      "act8.value": "guard-record",
      "act8.value-cost": "people-hurt",
      "act8.martial-path": "protect-descent",
      "act8.martial": "won",
    },
    relations: { guojing: 30 },
    resetItemIds: [...STORY_DEBUG_EVIDENCE_IDS, "mongol-wolf-tally"],
    completedEvents: COMPLETED_ACT8_TO_EPILOGUE,
    karma: 45,
  },
  {
    id: "act8-ending-keeper",
    kind: "route",
    routeGroupId: "act8-ending",
    title: "守卷人",
    description: "双面离营、完整原卷、守卷与护送下山构成记录优先路线。",
    arcId: "shendiao",
    expectedActId: "act8-huashan",
    targetLocationId: "huashan",
    targetEventId: "shendiao-huashan-epilogue-act8",
    targetNodeId: "facts-keeper",
    beats: BEATS_TO_ACT8,
    variants: {
      ...ACT8_ENDING_BASE_VARIANTS,
      "act8.record": "full",
      "act8.value": "guard-record",
      "act8.value-cost": "people-hurt",
      "act8.martial-path": "protect-descent",
      "act8.martial": "won",
    },
    relations: { guojing: 5 },
    resetItemIds: [...STORY_DEBUG_EVIDENCE_IDS, "mongol-wolf-tally"],
    completedEvents: COMPLETED_ACT8_TO_EPILOGUE,
    karma: 15,
  },
  {
    id: "act8-ending-hermit",
    kind: "route",
    routeGroupId: "act8-ending",
    title: "退入山林",
    description: "先救伤者、绝顶观战且穆念慈关系深厚，验证主动退席路线。",
    arcId: "shendiao",
    expectedActId: "act8-huashan",
    targetLocationId: "huashan",
    targetEventId: "shendiao-huashan-epilogue-act8",
    targetNodeId: "facts-hermit",
    beats: BEATS_TO_ACT8,
    variants: {
      ...ACT8_ENDING_BASE_VARIANTS,
      "act8.value": "save-crowd",
      "act8.value-cost": "culprit-escaped",
    },
    relations: { munianci: 40 },
    resetItemIds: [...STORY_DEBUG_EVIDENCE_IDS, "mongol-wolf-tally"],
    completedEvents: COMPLETED_ACT8_TO_EPILOGUE,
    karma: 10,
  },
  {
    id: "act8-ending-outcast",
    kind: "route",
    routeGroupId: "act8-ending",
    title: "签名尽撤",
    description: "伪造公议原卷且没有更高优先级军职，验证逐出结局。",
    arcId: "shendiao",
    expectedActId: "act8-huashan",
    targetLocationId: "huashan",
    targetEventId: "shendiao-huashan-epilogue-act8",
    targetNodeId: "facts-outcast",
    beats: BEATS_TO_ACT8,
    variants: {
      ...ACT8_ENDING_BASE_VARIANTS,
      "act8.record": "falsified",
      "act8.value": "save-crowd",
      "act8.value-cost": "culprit-escaped",
      "act8.martial-path": "duel",
      "act8.martial": "won",
    },
    resetItemIds: [...STORY_DEBUG_EVIDENCE_IDS, "mongol-wolf-tally"],
    completedEvents: COMPLETED_ACT8_TO_EPILOGUE,
    karma: -40,
  },
  {
    id: "act8-ending-wanderer",
    kind: "route",
    routeGroupId: "act8-ending",
    title: "负卷浪游",
    description: "争议公议、追击责任人与观战均保留，验证八路兜底唯一性。",
    arcId: "shendiao",
    expectedActId: "act8-huashan",
    targetLocationId: "huashan",
    targetEventId: "shendiao-huashan-epilogue-act8",
    targetNodeId: "facts-wanderer",
    beats: BEATS_TO_ACT8,
    variants: ACT8_ENDING_BASE_VARIANTS,
    resetItemIds: [...STORY_DEBUG_EVIDENCE_IDS, "mongol-wolf-tally"],
    completedEvents: COMPLETED_ACT8_TO_EPILOGUE,
    karma: 0,
  },
]

export const STORY_DEBUG_VARIANT_GROUPS: StoryDebugVariantGroup[] = [
  "第六幕·阶段",
  "第六幕·人物与会局",
  "第六幕·四轮证据",
  "第六幕·裁决",
  "第七幕·阶段",
  "第七幕·战争",
  "第七幕·终局",
]

export const STORY_DEBUG_VARIANT_FIELDS: StoryDebugVariantField[] = [
  {
    key: "act6.munianci",
    label: "牛家村段",
    group: "第六幕·阶段",
    options: [{ value: "cleared", label: "已完成" }],
  },
  {
    key: "act6.island",
    label: "桃花岛段",
    group: "第六幕·阶段",
    options: [{ value: "cleared", label: "已完成" }],
  },
  {
    key: "act6.yanyu",
    label: "烟雨楼段",
    group: "第六幕·阶段",
    options: [{ value: "cleared", label: "已完成" }],
  },
  {
    key: "act6.munianci-outcome",
    label: "穆念慈结论",
    group: "第六幕·人物与会局",
    options: [
      { value: "broken", label: "断线" },
      { value: "informed-unresolved", label: "知情未决" },
      { value: "hidden", label: "被隐瞒" },
    ],
  },
  {
    key: "act6.island-outcome",
    label: "桃花岛结果",
    group: "第六幕·人物与会局",
    options: [
      { value: "ke-saved", label: "柯镇恶获救" },
      { value: "xiaoying-saved", label: "韩小莹获救" },
      { value: "evidence-secured", label: "证物封存" },
      { value: "killer-traced", label: "追到凶手痕迹" },
    ],
  },
  {
    key: "act6.misunderstanding",
    label: "误会强度",
    group: "第六幕·人物与会局",
    options: [
      { value: "weak", label: "误会扩散" },
      { value: "partial", label: "部分可证" },
      { value: "questioning", label: "足以质询" },
    ],
  },
  {
    key: "act6.yanyu-focus",
    label: "烟雨楼已验",
    group: "第六幕·人物与会局",
    options: [
      { value: "island-route", label: "入岛路线" },
      { value: "jade-shoe", label: "翡翠鞋" },
      { value: "blood-writing", label: "临死血字" },
      { value: "baituo-traces", label: "白驼痕迹" },
      { value: "living-witness", label: "活证" },
      { value: "oral-only", label: "仅录口供" },
    ],
  },
  {
    key: "act6.yanyu-outcome",
    label: "烟雨楼结果",
    group: "第六幕·人物与会局",
    options: [
      { value: "witness-secured", label: "证人保住" },
      { value: "dual-witness", label: "双证并立" },
      { value: "evidence-secured", label: "证物保住" },
      { value: "evidence-damaged", label: "证物受损" },
      { value: "evidence-scattered", label: "证物分散" },
      { value: "exits-sealed", label: "退路封死" },
      { value: "wanyan-escaped", label: "完颜洪烈逃离" },
      { value: "yangkang-covered", label: "杨康获掩护" },
      { value: "yangkang-cornered", label: "杨康被逼入庙" },
      { value: "witness-wounded", label: "证人负伤" },
    ],
  },
  {
    key: "act6.truth-entry",
    label: "第一轮·入岛",
    group: "第六幕·四轮证据",
    options: [
      { value: "proven", label: "已证" },
      { value: "partial", label: "待核" },
      { value: "misled", label: "误导" },
    ],
  },
  {
    key: "act6.truth-martial",
    label: "第二轮·伤痕",
    group: "第六幕·四轮证据",
    options: [
      { value: "proven", label: "已证" },
      { value: "partial", label: "待核" },
      { value: "misled", label: "误导" },
    ],
  },
  {
    key: "act6.truth-token",
    label: "第三轮·遗物",
    group: "第六幕·四轮证据",
    options: [
      { value: "proven", label: "已证" },
      { value: "partial", label: "待核" },
      { value: "misled", label: "误导" },
    ],
  },
  {
    key: "act6.truth-motive",
    label: "第四轮·动机",
    group: "第六幕·四轮证据",
    options: [
      { value: "proven", label: "已证" },
      { value: "partial", label: "待核" },
      { value: "misled", label: "误导" },
    ],
  },
  {
    key: "act6.truth-strength",
    label: "证据汇总",
    group: "第六幕·裁决",
    options: [
      { value: "complete", label: "完整" },
      { value: "partial", label: "部分" },
      { value: "corrupted", label: "冲突" },
    ],
  },
  {
    key: "act6.yangkang-verdict",
    label: "杨康裁决",
    group: "第六幕·裁决",
    options: [
      { value: "dead", label: "毒发身亡" },
      { value: "escaped", label: "负伤遁走" },
      { value: "captured", label: "被捕待审" },
      { value: "confessed", label: "有限认罪" },
      { value: "aided", label: "玩家助逃" },
    ],
  },
  {
    key: "act7.recall",
    label: "草原召回",
    group: "第七幕·阶段",
    options: [{ value: "cleared", label: "已完成" }],
  },
  {
    key: "act7.camp",
    label: "西征大营",
    group: "第七幕·阶段",
    options: [{ value: "cleared", label: "已完成" }],
  },
  {
    key: "act7.scout",
    label: "城外侦察",
    group: "第七幕·阶段",
    options: [{ value: "cleared", label: "已完成" }],
  },
  {
    key: "act7.siege",
    label: "城下军令",
    group: "第七幕·阶段",
    options: [{ value: "cleared", label: "已完成" }],
  },
  {
    key: "act7.city",
    label: "破城军纪",
    group: "第七幕·阶段",
    options: [{ value: "cleared", label: "已完成" }],
  },
  {
    key: "act7.home-order",
    label: "南征军令",
    group: "第七幕·阶段",
    options: [{ value: "cleared", label: "已完成" }],
  },
  {
    key: "act7.role",
    label: "随军职责",
    group: "第七幕·战争",
    options: [
      { value: "command", label: "统兵协力" },
      { value: "scout", label: "斥候" },
      { value: "logistics", label: "粮道后队" },
      { value: "independent", label: "独立随行" },
    ],
  },
  {
    key: "act7.brothers",
    label: "诸王争令",
    group: "第七幕·战争",
    options: [
      { value: "reconciled", label: "重排军序" },
      { value: "disarmed", label: "无伤缴械" },
      { value: "exploited", label: "借势夺权" },
      { value: "unresolved", label: "争令未解" },
    ],
  },
  {
    key: "act7.prisoners",
    label: "俘虏处置",
    group: "第七幕·战争",
    options: [
      { value: "verified", label: "核对口供" },
      { value: "exchanged", label: "交换伤兵" },
      { value: "released", label: "释放译者" },
      { value: "executed", label: "按细作处置" },
    ],
  },
  {
    key: "act7.scout-method",
    label: "侦察方法",
    group: "第七幕·战争",
    options: [
      { value: "cavalry", label: "骑兵贴近" },
      { value: "supply", label: "水粮旧渠" },
      { value: "civilian", label: "难民通道" },
      { value: "infiltration", label: "商队潜入" },
    ],
  },
  {
    key: "act7.intel",
    label: "军情强度",
    group: "第七幕·战争",
    options: [
      { value: "complete", label: "完整" },
      { value: "partial", label: "部分" },
      { value: "exposed", label: "路线暴露" },
    ],
  },
  {
    key: "act7.siege-plan",
    label: "攻城方案",
    group: "第七幕·战争",
    options: [
      { value: "feint", label: "佯攻换防" },
      { value: "blockade", label: "封锁粮道" },
      { value: "assault", label: "强攻城门" },
      { value: "corridor", label: "平民走廊" },
    ],
  },
  {
    key: "act7.siege-outcome",
    label: "攻城结果",
    group: "第七幕·战争",
    options: [
      { value: "clean", label: "无损达成" },
      { value: "costly", label: "代价达成" },
      { value: "stalled", label: "攻势停住" },
    ],
  },
  {
    key: "act7.discipline",
    label: "破城军纪",
    group: "第七幕·战争",
    options: [
      { value: "enforced", label: "公开执纪" },
      { value: "limited", label: "局部约束" },
      { value: "permissive", label: "默许抢掠" },
    ],
  },
  {
    key: "act7.evacuation",
    label: "平民撤离",
    group: "第七幕·战争",
    options: [
      { value: "full", label: "完整" },
      { value: "partial", label: "部分" },
      { value: "failed", label: "失败" },
    ],
  },
  {
    key: "act7.order",
    label: "屠城军令",
    group: "第七幕·战争",
    options: [
      { value: "obeyed", label: "服从" },
      { value: "delayed", label: "拖延" },
      { value: "defied", label: "公开抗命" },
      { value: "betrayed", label: "泄令救人" },
    ],
  },
  {
    key: "act7.huazheng",
    label: "华筝结论",
    group: "第七幕·终局",
    options: [
      { value: "helped-escape", label: "提供退路" },
      { value: "broke-ties", label: "断绝旧情" },
      { value: "stayed-loyal", label: "留守草原" },
      { value: "led-pursuit", label: "亲自追捕" },
    ],
  },
  {
    key: "act7.liping",
    label: "李萍结论",
    group: "第七幕·终局",
    options: [
      { value: "died-testimony", label: "明志死亡" },
      { value: "died-covering-retreat", label: "留帐断后" },
      { value: "survived-prepared", label: "准备路线存活" },
    ],
  },
  {
    key: "act7.departure",
    label: "离营结果",
    group: "第七幕·终局",
    options: [
      { value: "with-guojing", label: "随郭靖南归" },
      { value: "escort-refugees", label: "护送难民" },
      { value: "double-agent", label: "双面留军" },
      { value: "mongol-command", label: "蒙古军职" },
      { value: "grassland-ending", label: "草原结局" },
    ],
  },
]
