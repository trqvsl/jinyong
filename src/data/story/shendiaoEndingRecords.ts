export const SHENDIAO_ENDING_IDS = [
  "commander",
  "grassland",
  "taohua",
  "hero",
  "keeper",
  "hermit",
  "outcast",
  "wanderer",
] as const

export type ShendiaoEndingId = typeof SHENDIAO_ENDING_IDS[number]

export interface ShendiaoEndingDefinition {
  id: ShendiaoEndingId
  title: string
  shortTitle: string
  summary: string
  seal: string
  worldEventId: string
}

export const SHENDIAO_ENDING_DEFINITIONS: Record<
  ShendiaoEndingId,
  ShendiaoEndingDefinition
> = {
  commander: {
    id: "commander",
    title: "军中执令",
    shortTitle: "军职仍在",
    summary: "军印与调令仍承认你的军中身份，华山公议却没有替这份军职背书。",
    seal: "军印",
    worldEventId: "world-act8-echo-commander",
  },
  grassland: {
    id: "grassland",
    title: "草原旧路",
    shortTitle: "旧约未断",
    summary: "没有军旗的路引通向草原，同行与去留仍由你和华筝分别决定。",
    seal: "路引",
    worldEventId: "world-act8-echo-grassland",
  },
  taohua: {
    id: "taohua",
    title: "海上桃花",
    shortTitle: "旧门再开",
    summary: "桃花岛旧门路牌重新交到你手中，公议副本也由东海水路分送。",
    seal: "桃花",
    worldEventId: "world-act8-echo-taohua",
  },
  hero: {
    id: "hero",
    title: "并肩南行",
    shortTitle: "人卷同行",
    summary: "军报、原卷和伤者名册分路送达，你与郭靖继续处理山下未完的事。",
    seal: "同行",
    worldEventId: "world-act8-echo-hero",
  },
  keeper: {
    id: "keeper",
    title: "守卷人",
    shortTitle: "三卷有归",
    summary: "原卷、名册与见证副本各有去处，验封目录最后由你亲自保管。",
    seal: "验封",
    worldEventId: "world-act8-echo-keeper",
  },
  hermit: {
    id: "hermit",
    title: "退入山林",
    shortTitle: "无旗同行",
    summary: "你没有接军印或石台名次，愿意同行的人在没有旗号的山路上等候。",
    seal: "无名",
    worldEventId: "world-act8-echo-hermit",
  },
  outcast: {
    id: "outcast",
    title: "签名尽撤",
    shortTitle: "担保已撤",
    summary: "公议副本上的担保被逐项撤回，仍承认你的只剩军帖、残卷与少数旧识。",
    seal: "撤名",
    worldEventId: "world-act8-echo-outcast",
  },
  wanderer: {
    id: "wanderer",
    title: "负卷浪游",
    shortTitle: "不入旧席",
    summary: "你没有接下任何既有席位，沿途记录与旧信仍完整留在自己的行囊里。",
    seal: "行囊",
    worldEventId: "world-act8-echo-wanderer",
  },
}

export const SHENDIAO_DEPARTURE_LABELS: Record<string, string> = {
  "with-guojing": "随郭靖南归",
  "escort-refugees": "护送难民南下",
  "double-agent": "以双面身份留军",
  "mongol-command": "保留蒙古军职",
  "grassland-ending": "退出征战，转入草原旧路",
}

export const SHENDIAO_ORDER_LABELS: Record<string, string> = {
  obeyed: "服从屠城军令",
  delayed: "拖延军令",
  defied: "公开抗命",
  betrayed: "泄令救人",
}

export const SHENDIAO_HUAZHENG_LABELS: Record<string, string> = {
  "helped-escape": "华筝自主提供退路",
  "broke-ties": "华筝断绝旧情",
  "stayed-loyal": "华筝留守草原",
  "led-pursuit": "华筝亲自领队追捕",
}

export const SHENDIAO_LIPING_LABELS: Record<string, string> = {
  "survived-prepared": "李萍按准备路线离营",
  "died-covering-retreat": "李萍留帐断后",
  "died-testimony": "李萍以死明志",
}

export const SHENDIAO_ENTRY_LABELS: Record<string, string> = {
  "guo-family": "随郭靖与李萍入山",
  "guo-company": "随郭靖同行入山",
  "refugee-witness": "随难民见证入山",
  "covert-messenger": "以暗线送信人身份入山",
  "mongol-envoy": "持蒙古使节身份入山",
  "grassland-with-huazheng": "与华筝同走草原路入山",
  "grassland-alone": "独走草原旧路入山",
}

export const SHENDIAO_WITNESS_LABELS: Record<string, string> = {
  broad: "宽见证席",
  divided: "分席见证",
  sparse: "稀疏见证席",
}

export const SHENDIAO_RECORD_LABELS: Record<string, string> = {
  full: "旧案与战争记录完整公开",
  contested: "记录保留争议与待核段落",
  concealed: "部分责任页未公开",
  falsified: "公议原卷被主动改写",
}

export const SHENDIAO_VALUE_LABELS: Record<string, string> = {
  "save-crowd": "优先救下伤者与送达人",
  "guard-record": "优先守住公议原卷",
  "pursue-raiders": "追击夺卷与追缉责任人",
  "claim-seat": "接管山门与临时席位",
}

export const SHENDIAO_VALUE_COST_LABELS: Record<string, string> = {
  "culprit-escaped": "代价：责任人趁乱逃脱",
  "people-hurt": "代价：伤者与送达人受创",
  "record-damaged": "代价：公议副卷受损",
  "trust-lost": "代价：郭靖与黄蓉撤回信任",
}

export const SHENDIAO_MARTIAL_PATH_LABELS: Record<string, string> = {
  duel: "亲自下场对决",
  "hold-platform": "守住绝顶石台",
  "protect-descent": "护送记录与见证下山",
  observe: "观战拆招",
  decline: "主动退出名次争夺",
}

export const SHENDIAO_MARTIAL_RESULT_LABELS: Record<string, string> = {
  won: "武学行动完整达成",
  held: "守台完成",
  partial: "武学行动部分达成",
  lost: "武学行动未能达成",
  understood: "从观战中拆出可用法门",
  refused: "退席记录入册",
}

export const SHENDIAO_TITLE_LABELS: Record<string, string> = {
  recognized: "绝顶认可",
  contender: "挑战者",
  none: "不列名次",
}
