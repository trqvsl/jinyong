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
  targetEventId: string
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
  group: "阶段" | "人物与会局" | "四轮证据" | "裁决"
  options: StoryDebugVariantOption[]
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

export const STORY_DEBUG_ROUTE_PRESETS: StoryDebugPreset[] = [
  {
    id: "temple-complete-evidence",
    kind: "route",
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
]

export const STORY_DEBUG_VARIANT_FIELDS: StoryDebugVariantField[] = [
  {
    key: "act6.munianci",
    label: "牛家村段",
    group: "阶段",
    options: [{ value: "cleared", label: "已完成" }],
  },
  {
    key: "act6.island",
    label: "桃花岛段",
    group: "阶段",
    options: [{ value: "cleared", label: "已完成" }],
  },
  {
    key: "act6.yanyu",
    label: "烟雨楼段",
    group: "阶段",
    options: [{ value: "cleared", label: "已完成" }],
  },
  {
    key: "act6.munianci-outcome",
    label: "穆念慈结论",
    group: "人物与会局",
    options: [
      { value: "broken", label: "断线" },
      { value: "informed-unresolved", label: "知情未决" },
      { value: "hidden", label: "被隐瞒" },
    ],
  },
  {
    key: "act6.island-outcome",
    label: "桃花岛结果",
    group: "人物与会局",
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
    group: "人物与会局",
    options: [
      { value: "weak", label: "误会扩散" },
      { value: "partial", label: "部分可证" },
      { value: "questioning", label: "足以质询" },
    ],
  },
  {
    key: "act6.yanyu-focus",
    label: "烟雨楼已验",
    group: "人物与会局",
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
    group: "人物与会局",
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
    group: "四轮证据",
    options: [
      { value: "proven", label: "已证" },
      { value: "partial", label: "待核" },
      { value: "misled", label: "误导" },
    ],
  },
  {
    key: "act6.truth-martial",
    label: "第二轮·伤痕",
    group: "四轮证据",
    options: [
      { value: "proven", label: "已证" },
      { value: "partial", label: "待核" },
      { value: "misled", label: "误导" },
    ],
  },
  {
    key: "act6.truth-token",
    label: "第三轮·遗物",
    group: "四轮证据",
    options: [
      { value: "proven", label: "已证" },
      { value: "partial", label: "待核" },
      { value: "misled", label: "误导" },
    ],
  },
  {
    key: "act6.truth-motive",
    label: "第四轮·动机",
    group: "四轮证据",
    options: [
      { value: "proven", label: "已证" },
      { value: "partial", label: "待核" },
      { value: "misled", label: "误导" },
    ],
  },
  {
    key: "act6.truth-strength",
    label: "证据汇总",
    group: "裁决",
    options: [
      { value: "complete", label: "完整" },
      { value: "partial", label: "部分" },
      { value: "corrupted", label: "冲突" },
    ],
  },
  {
    key: "act6.yangkang-verdict",
    label: "杨康裁决",
    group: "裁决",
    options: [
      { value: "dead", label: "毒发身亡" },
      { value: "escaped", label: "负伤遁走" },
      { value: "captured", label: "被捕待审" },
      { value: "confessed", label: "有限认罪" },
      { value: "aided", label: "玩家助逃" },
    ],
  },
]
