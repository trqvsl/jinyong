import type { Player } from "../types"

export type LocationRhythm = "剧情" | "战斗" | "探索"
export type LocationRisk = "低" | "中" | "高"

// ============================================================
// 地点式江湖地图
// 「游历」入口：一张可视化中国地图，地名标在对应坐标，点击前往。
// 每个地点绑定专属奇遇事件 + 敌人池 + 解锁条件。
// coordinates 是 0~100 的相对坐标（x=经度方向，y=纬度方向），供地图界面标点。
// ============================================================

export interface Location {
  id: string
  name: string
  region: string                 // 所属区域
  description: string            // 一句话介绍（去之前看的）
  arrival: string                // 到达时的场景描述
  coordinates: { x: number; y: number }  // 在总图上的相对坐标（0~100）
  events: string[]               // 该地点专属奇遇事件 id
  enemyPool: string[]            // 该地点的随机敌人池
  npcIds?: string[]              // 常驻该地点的 NPC id（双向参考，用于地图/NPC界面显示）
  rhythm: LocationRhythm         // 内容节奏（地图出发前预期）
  risk: LocationRisk             // 基础风险（主线推荐态由界面另行覆盖）
  contentTag: string             // 内容定位短标签
  contentPreview: string         // 非推荐状态下的内容预览
  unlock?: (player: Player) => boolean   // 解锁条件
}

export const LOCATIONS: Location[] = [
  // ===== 江南 =====
  {
    id: "niujia",
    name: "牛家村",
    region: "江南",
    description: "临安城外的一座小村，雪夜听书之处，江湖风波由此而起。",
    arrival: "你踏雪走进牛家村。炊烟袅袅，鸡犬相闻，看似宁静的村落里，却隐隐涌动着一股不安的气息。",
    coordinates: { x: 76, y: 66 },
    events: ["shendiao-niujia-act6", "shendiao-niujia-act5", "shendiao-niujia-opening", "shendiao-niujia-arrival", "shendiao-niujia-rescue", "shendiao-niujia-recruit", "shendiao-niujia-raid-righteous", "shendiao-niujia-raid-jin", "shendiao-yangkang", "shendiao-niujia-before-huashan", "shendiao-niujia-snow", "shendiao-munianci"],
    enemyPool: ["xialiubang", "shanzei"],
    rhythm: "剧情",
    risk: "低",
    contentTag: "旧地因果",
    contentPreview: "既有开局事件，也承接后续回村收束与人物余波。",
  },
  {
    id: "linan",
    name: "临安府",
    region: "江南",
    description: "南宋都城，繁华甲于天下，也是江湖人物云集之地。",
    arrival: "你走进临安城，街市繁华，人声鼎沸。茶楼酒肆间，似有江湖人物在低声密语。",
    coordinates: { x: 74, y: 70 },
    events: ["shendiao-linan-act5", "shendiao-meet-rong", "shendiao-linan-night-stroll", "shendiao-qigong", "shendiao-linan-wangfu-rumor", "shendiao-wangfu", "shendiao-linan-yangkang-shadow", "shendiao-beggar-feast", "shendiao-yuefei-wall", "shendiao-linan-nighttalk", "linan-teahouse", "linan-nightmarket"],
    enemyPool: ["xialiubang", "shanzei"],
    npcIds: ["hongqigong"],
    rhythm: "剧情",
    risk: "中",
    contentTag: "江湖风波",
    contentPreview: "可接江南人物线、王府旧案与多段中期剧情。",
  },
  {
    id: "taihu",
    name: "太湖",
    region: "江南",
    description: "港汊与芦苇荡交错成网，太湖群雄正盯着一艘金国钦使船。",
    arrival: "湖风卷过芦苇，远处数点渔火忽明忽暗。两艘快船贴着水草无声靠近，船头短弩已经上弦。",
    coordinates: { x: 63, y: 64 },
    events: ["shendiao-taihu"],
    enemyPool: ["wangfu-guard", "shanzei"],
    rhythm: "战斗",
    risk: "高",
    contentTag: "水路截船",
    contentPreview: "偏水战、灯号判断、护送与王府暗线，多种立场会在湖上并轨。",
    unlock: (player) => !!player.world.arcs.shendiao?.beats["act3-zhongdu"],
  },
  {
    id: "guiyunzhuang",
    name: "归云庄",
    region: "江南",
    description: "陆乘风经营的太湖庄院，英雄宴下藏着抗金旧志与桃花岛旧债。",
    arrival: "水道尽头露出一座临湖庄院。墙外松林布着暗桩，码头却摆出迎客灯笼，庄丁正把几名俘虏押向正厅。",
    coordinates: { x: 71, y: 57 },
    events: ["shendiao-guiyunzhuang"],
    enemyPool: ["wangfu-guard", "meichaofeng"],
    rhythm: "剧情",
    risk: "高",
    contentTag: "旧案并轨",
    contentPreview: "承接太湖水战，回收段天德证词、杨康立场和桃花岛师门旧债。",
    unlock: (player) => player.world.arcs.shendiao?.variants?.["act4.taihu"] === "cleared",
  },
  {
    id: "yanyulou",
    name: "烟雨楼",
    region: "江南",
    description: "嘉兴南湖上的旧约会场，全真、桃花岛、白驼与王府势力将同时到场。",
    arrival: "南湖水面压着细雨，烟雨楼门窗尽开。楼下各派船只分泊四面，楼内桌椅却已被挪出一片空场。",
    coordinates: { x: 70, y: 82 },
    events: ["shendiao-yanyulou-act6"],
    enemyPool: ["qiuqianren", "ouyangfeng"],
    rhythm: "战斗",
    risk: "高",
    contentTag: "多方会局",
    contentPreview: "偏误会对峙、保护证人、守住证物与非歼灭剧情战。",
    unlock: (player) => player.world.arcs.shendiao?.variants?.["act6.island"] === "cleared",
  },
  {
    id: "tieqiangmiao",
    name: "铁枪庙",
    region: "江南",
    description: "嘉兴旧庙，杨家铁枪与多年物证都将在这里接受最后一轮质询。",
    arrival: "庙门半掩，断墙上还留着旧火痕。杨家铁枪斜插在石座旁，供桌上已经摆开数只封存证物的木匣。",
    coordinates: { x: 83, y: 73 },
    events: ["shendiao-tieqiangmiao-act6"],
    enemyPool: ["yangkang", "wangfu-guard"],
    rhythm: "剧情",
    risk: "高",
    contentTag: "真相裁决",
    contentPreview: "偏四轮证据推理、杨康多版本裁决与第六幕因果收束。",
    unlock: (player) => player.world.arcs.shendiao?.variants?.["act6.yanyu"] === "cleared",
  },
  {
    id: "junshan",
    name: "君山",
    region: "荆楚",
    description: "洞庭湖中丐帮大会所在，净衣、污衣两派正围着一根打狗棒争夺号令。",
    arrival: "洞庭水雾贴着山脚，成百丐帮弟子分列两侧。石台上插着打狗棒，台下却同时挂着两面帮旗。",
    coordinates: { x: 61, y: 75 },
    events: ["shendiao-junshan-act5"],
    enemyPool: ["shanzei", "emingke"],
    npcIds: ["luyoujiao"],
    rhythm: "剧情",
    risk: "高",
    contentTag: "帮主之争",
    contentPreview: "偏帮规查证、真假传令、净衣污衣冲突与黄蓉接棒。",
    unlock: (player) => player.world.arcs.shendiao?.variants?.["act5.niujia"] === "cleared",
  },
  {
    id: "tiezhangfeng",
    name: "铁掌峰",
    region: "荆楚",
    description: "铁掌帮盘踞的险峰，帮中禁地藏着武穆遗书，也守着真正的铁掌高手。",
    arrival: "两座峰头并立，铁索桥横在云雾之间。巡峰弟子逐级盘查，后峰石窟外另有掌印暗号。",
    coordinates: { x: 48, y: 67 },
    events: ["shendiao-tiezhang-act5"],
    enemyPool: ["qiuqianren", "xiejiaoshi"],
    npcIds: ["qiuqianren-npc"],
    rhythm: "战斗",
    risk: "高",
    contentTag: "兵书禁地",
    contentPreview: "偏潜入、交易、救援、武穆遗书去向与裘千仞追杀。",
    unlock: (player) => player.world.arcs.shendiao?.variants?.["act5.junshan"] === "cleared",
  },
  {
    id: "blackmarsh",
    name: "黑沼",
    region: "荆楚",
    description: "芦苇与泥潭遮住的水泽迷阵，瑛姑以算筹、暗桩和旧恨守住唯一生路。",
    arrival: "黑水没过枯草根部，木桩上的数字被水汽浸得发暗。远处茅屋没有灯，门前算筹却刚被人拨动。",
    coordinates: { x: 35, y: 63 },
    events: ["shendiao-blackmarsh-act5"],
    enemyPool: ["duyaozi", "xiejiaoshi"],
    npcIds: ["yinggu"],
    rhythm: "探索",
    risk: "高",
    contentTag: "算局求医",
    contentPreview: "偏路径推演、机关判断、瑛姑私心与一灯求医信物。",
    unlock: (player) => player.world.arcs.shendiao?.variants?.["act5.tiezhang"] === "cleared",
  },
  {
    id: "yidengju",
    name: "一灯居",
    region: "大理",
    description: "深山中的清修之所，渔樵耕读四弟子守住山路，一灯在此闭关。",
    arrival: "山路沿溪水盘旋而上，前方依次传来舟桨、斧声、牛铃与读书声。竹门后只点着一盏青灯。",
    coordinates: { x: 50, y: 81 },
    events: ["shendiao-yideng-act5"],
    enemyPool: ["yideng-disciple", "emingke"],
    npcIds: ["yideng"],
    rhythm: "剧情",
    risk: "中",
    contentTag: "求医问债",
    contentPreview: "偏渔樵耕读四关、一阳指救治与周伯通瑛姑旧事。",
    unlock: (player) => player.world.arcs.shendiao?.variants?.["act5.blackmarsh"] === "cleared",
  },

  // ===== 燕赵 =====
  {
    id: "zhangjiakou",
    name: "张家口",
    region: "燕赵",
    description: "塞外入中原的商旅关口，驼队、马市与南北消息都在这里交汇。",
    arrival: "你沿驿道来到张家口。马市尘土飞扬，酒楼里挤满南下商旅，城外还有白衣骆驼客在暗中打量来往马匹。",
    coordinates: { x: 58, y: 29 },
    events: ["shendiao-zhangjiakou"],
    enemyPool: ["xialiubang", "shanzei"],
    npcIds: ["guojing", "huangrong"],
    rhythm: "剧情",
    risk: "中",
    contentTag: "南下关口",
    contentPreview: "承接大漠离场版本、白驼山过境与黄蓉初遇。",
  },
  {
    id: "zhongdu",
    name: "中都",
    region: "燕赵",
    description: "金国都城大兴府，赵王府与江湖群英正把旧案推到台前。",
    arrival: "你走进中都。城门金兵逐一查验路引，街市深处却已搭起比武擂台，赵王府车马不时从人群外经过。",
    coordinates: { x: 67, y: 34 },
    events: ["shendiao-zhongdu"],
    enemyPool: ["guanjun", "emingke"],
    npcIds: ["yangkang", "qiuchuji"],
    rhythm: "剧情",
    risk: "高",
    contentTag: "王府旧案",
    contentPreview: "偏比武招亲、杨家身世、王府群英与多路线救援。",
  },

  // ===== 中原 =====
  {
    id: "shaolin",
    name: "少林寺",
    region: "中原",
    description: "天下武功出少林，嵩山深处古刹钟声不绝。",
    arrival: "嵩山深处，古刹巍峨。山门庄严肃穆，钟声悠悠回荡在林间，似在诵念千年的武学传承。",
    coordinates: { x: 55, y: 50 },
    events: ["shaolin-scripture"],
    enemyPool: ["shanzei", "emingke"],
    npcIds: ["qiuchuji"],
    rhythm: "探索",
    risk: "中",
    contentTag: "修行地",
    contentPreview: "更偏门派、秘籍与扬名后的武学探索。",
    unlock: (player) => player.reputation >= 5,
  },
  {
    id: "huashan",
    name: "华山",
    region: "中原",
    description: "五岳之首，华山论剑之地，绝顶高手论武所在。",
    arrival: "华山险峻，苍松夹道。你沿山道登高，峰顶云气翻涌，四周风声不断。",
    coordinates: { x: 50, y: 45 },
    events: ["shendiao-huashan", "shendiao-huashan-snow", "shendiao-huashan-stone", "huashan-cliff"],
    enemyPool: ["emingke", "xiejiaoshi"],
    rhythm: "战斗",
    risk: "高",
    contentTag: "卷末节点",
    contentPreview: "更接近论剑、卷末收束与高强度阶段事件。",
    unlock: (player) => player.reputation >= 20,
  },

  // ===== 巴蜀 =====
  {
    id: "emei",
    name: "峨眉山",
    region: "巴蜀",
    description: "峨眉天下秀，山中隐有女侠剑派，剑法灵动。",
    arrival: "云雾缭绕的峨眉山中，古木参天。远处似有剑光闪动，山中修行之人剑法轻灵飘逸。",
    coordinates: { x: 40, y: 55 },
    events: ["emei-hermit"],
    enemyPool: ["shanzei", "emingke"],
    rhythm: "探索",
    risk: "低",
    contentTag: "清修地",
    contentPreview: "适合寻找隐士、剑术见闻与后续门派内容。",
  },
  {
    id: "xingxiu",
    name: "星宿海",
    region: "巴蜀",
    description: "荒漠毒沼之地，星宿派丁春秋盘踞之所，毒功阴狠。",
    arrival: "你踏入一片荒凉沼泽，空气里弥漫着腥臭。远处飘来几缕诡异的绿烟，毒虫毒蛇随处可见。",
    coordinates: { x: 33, y: 48 },
    events: ["xingxiu-poison"],
    enemyPool: ["duyaozi", "xiejiaoshi"],
    rhythm: "战斗",
    risk: "高",
    contentTag: "毒沼险地",
    contentPreview: "偏毒术、邪派遭遇与高风险战斗。",
    unlock: (player) => player.reputation >= 10,
  },

  // ===== 塞北 =====
  {
    id: "damos",
    name: "蒙古大漠",
    region: "塞北",
    description: "蒙古大漠，郭靖生长之地，草原辽阔，铁骑纵横。",
    arrival: "黄沙漫天，草原无垠。远处传来悠扬的马头琴声，你置身大漠，感受着天地的苍茫。",
    coordinates: { x: 30, y: 22 },
    events: ["shendiao-damos", "shendiao-damos-southbound", "shendiao-damos-eagle", "shendiao-damos-feast", "shendiao-seven-freaks", "damos-eagle"],
    enemyPool: ["shanzei", "emingke"],
    npcIds: ["guojing"],
    rhythm: "剧情",
    risk: "中",
    contentTag: "故人线",
    contentPreview: "偏郭靖前期主线、大漠成长与草原人物铺垫。",
  },
  {
    id: "xiling",
    name: "西夏",
    region: "塞北",
    description: "西夏国境，灵鹫宫近在咫尺，天山童姥传闻不绝。",
    arrival: "你来到西夏边陲，戈壁苍凉。远处雪山之巅云雾缭绕，传闻那便是神秘的灵鹫宫所在。",
    coordinates: { x: 28, y: 32 },
    events: ["xiling-palace"],
    enemyPool: ["emingke", "xiejiaoshi"],
    rhythm: "探索",
    risk: "高",
    contentTag: "塞外远行",
    contentPreview: "偏后期地图拓展、雪山探索与异域势力。",
    unlock: (player) => player.reputation >= 25,
  },

  // ===== 西域 =====
  {
    id: "baituo",
    name: "白驼山",
    region: "西域",
    description: "西毒欧阳锋的老巢，白驼山庄隐于大漠深处。",
    arrival: "你深入西域大漠，找到白驼山庄。庄门紧闭，隐约能听见蛇群游动的窸窣声，令人毛骨悚然。",
    coordinates: { x: 18, y: 38 },
    events: ["baituo-snake"],
    enemyPool: ["duyaozi", "ouyangfeng"],
    npcIds: ["ouyangfeng-npc"],
    rhythm: "战斗",
    risk: "高",
    contentTag: "西毒险地",
    contentPreview: "偏白驼山、毒术与高风险邪派路线。",
    unlock: (player) => player.reputation >= 15,
  },
  {
    id: "mingjiao",
    name: "光明顶",
    region: "西域",
    description: "明教总坛所在，乾坤大挪移与圣火令的传承之地。",
    arrival: "你登上昆仑山光明顶，圣火熊熊。明教群豪齐聚，空气中弥漫着一触即发的紧张气氛。",
    coordinates: { x: 22, y: 42 },
    events: ["mingjiao-fire"],
    enemyPool: ["xiejiaoshi", "huangyaoshi"],
    rhythm: "战斗",
    risk: "高",
    contentTag: "西域远行",
    contentPreview: "偏后期地图拓展、明教势力与西域战斗。",
    unlock: (player) => player.reputation >= 30,
  },

  // ===== 东海 =====
  {
    id: "taohuadao",
    name: "桃花岛",
    region: "东海",
    description: "东海之上的桃花秘境，东邪黄药师隐居之所。",
    arrival: "渡海登岛，满目桃花灼灼，奇门阵法暗藏其中，令人方向莫辨。",
    coordinates: { x: 88, y: 60 },
    events: ["shendiao-taohua-blood-act6", "shendiao-taohua-act4", "shendiao-taohua-letter", "shendiao-taohua", "shendiao-taohua-flute", "shendiao-taohua-maze", "taohua-array"],
    enemyPool: ["emingke", "huangyaoshi"],
    npcIds: ["huangrong", "huangyaoshi-npc"],
    rhythm: "剧情",
    risk: "中",
    contentTag: "人物推进",
    contentPreview: "偏黄蓉、黄药师、桃花岛旧门与五绝相关剧情。",
    unlock: (player) => player.reputation >= 15,
  },

  // ===== 岭南 =====
  {
    id: "dali",
    name: "大理",
    region: "岭南",
    description: "大理段氏皇族故地，一阳指与六脉神剑的发源。",
    arrival: "你来到苍山洱海之间的大理。段氏皇族武学名震天下，街上行人举手投足间似皆暗含指法。",
    coordinates: { x: 38, y: 75 },
    events: ["dali-temple"],
    enemyPool: ["shanzei", "emingke"],
    rhythm: "探索",
    risk: "低",
    contentTag: "武学源流",
    contentPreview: "偏大理段氏、一阳指与后续岭南人物内容。",
  },
]

// 按 id 取地点
export function getLocationById(id: string): Location | undefined {
  return LOCATIONS.find((loc) => loc.id === id)
}

// 取该玩家当前可前往的地点（解锁的）
export function getAvailableLocations(player: Player): Location[] {
  return LOCATIONS.filter((loc) => (loc.unlock ? loc.unlock(player) : true))
}

// 取所有地点，并标注是否已解锁
export function getAllLocationsWithStatus(player: Player) {
  return LOCATIONS.map((loc) => ({
    ...loc,
    unlocked: loc.unlock ? loc.unlock(player) : true,
  }))
}
