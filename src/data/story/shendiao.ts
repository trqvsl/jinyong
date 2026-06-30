import type { StoryEvent } from "../events"

// ============================================================
// 射雕英雄传 · 剧情卷（声明式）
// 按原著脉络的关键节点，主角作为"穿越者"介入原著故事。
// 节点：牛家村(在通用卷 events.ts) → 大漠成长 → 南下遇蓉 → 王府盗书 …
// 设计见《世界观设定.md》：原著角色保留底色，主角走平行分支。
// ============================================================

export const SHENDIAO_STORY: StoryEvent[] = [
  // ===== 大漠·少年射雕 =====
  {
    id: "shendiao-damos",
    entryNode: "main",
    locationId: "damos",
    weight: 5,
    once: true,
    condition: { kind: "reputation", gte: 3 },
    nodes: { main: {
      title: "大漠·少年射雕",
      text: "你深入蒙古大漠，远远望见一个憨厚少年正跟着七位形貌各异的师父苦练武功。他招式笨拙却肯下死功，额上汗水淋漓。忽而一只白雕掠过天际，少年抬手一箭，正中雕翅——好生神准！",
      choices: [
        { id: "guide", text: "上前指点", description: "看出少年根骨佳却不得其法，忍不住点拨几句。",
          consequences: [{ kind: "reputation", delta: 3 }, { kind: "aptitude", delta: 1 }, { kind: "relation", npcId: "guojing", delta: 8 }],
          consumeDay: true,
          resultText: "你上前点拨那少年运气发力的门道。他虽憨厚，却如获至宝，连连道谢。那七位怪师见你出手不凡，亦拱手相谢。少年名叫郭靖——这名字，你似乎在哪儿听过。",
          transition: { type: "end" } },
        { id: "spar", text: "切磋比试", description: "与少年过几招，试试他的斤两。",
          consequences: [{ kind: "attack", delta: 2 }, { kind: "reputation", delta: 2 }],
          consumeDay: true,
          resultText: "你与郭靖切磋数招。他外家功夫扎实，却拙于变化。一番比试下来，你把自己的招式也磨砺得更精纯了。",
          transition: { type: "end" } },
        { id: "befriend", text: "结交为友", description: "欣赏这少年的憨直，请他喝碗马奶酒。",
          consequences: [{ kind: "reputation", delta: 4 }, { kind: "hp", delta: 20 }, { kind: "item", id: "field-ration", count: 2 }, { kind: "relation", npcId: "guojing", delta: 20 }],
          consumeDay: true,
          resultText: "你与郭靖对饮马奶酒，他说起大漠的辽阔与江南的故乡，眼中满是向往。临别时他紧紧握住你的手：\"后会有期！\" 这份豪爽之交，让你心中暖意涌动。",
          transition: { type: "end" } },
      ],
    } },
  },

  // ===== 南下遇蓉 =====
  {
    id: "shendiao-meet-rong",
    entryNode: "main",
    locationId: "linan",
    weight: 4,
    once: true,
    condition: { kind: "reputation", gte: 6 },
    nodes: { main: {
      title: "南下中原·客栈奇缘",
      text: "你南下中原，在一家客栈歇脚。邻桌一个满脸煤灰的小乞丐正点满一桌好菜大快朵颐，吃相却颇为斯文；身旁陪着个憨厚青年，一脸宠溺地看着。你眼角一跳——这乞丐……怎么看都不像寻常叫花子。",
      choices: [
        { id: "chat", text: "上前搭话", description: "这两人气质不凡，不妨结识一番。",
          consequences: [{ kind: "reputation", delta: 3 }, { kind: "aptitude", delta: 2 }, { kind: "relation", npcId: "huangrong", delta: 10 }, { kind: "relation", npcId: "guojing", delta: 8 }],
          consumeDay: true,
          resultText: "你上前攀谈。那小乞丐眼珠一转，三言两语便试探出你的深浅，随即咯咯笑了起来：\"你这人倒有趣。\" 那憨厚青年正是郭靖，见你友善，忙请你同坐。",
          transition: { type: "end" } },
        { id: "treat", text: "请客结账", description: "替这两人付了酒钱，结个善缘。",
          consequences: [{ kind: "gold", delta: -50 }, { kind: "reputation", delta: 5 }, { kind: "relation", npcId: "huangrong", delta: 18 }, { kind: "relation", npcId: "guojing", delta: 6 }],
          consumeDay: true,
          resultText: "你悄悄替他们结了账。小乞丐察觉后挑眉看你，似在重新估量你。临别时她凑近低声道：\"你这人心眼不错，往后若有难处，可去桃花岛寻我。\" 桃花岛？你心头一动。",
          transition: { type: "end" } },
        { id: "observe-quietly", text: "静观不语", description: "这两人来历不凡，不贸然搭讪。",
          consequences: [{ kind: "reputation", delta: 1 }],
          consumeDay: true,
          resultText: "你默默观察，只见那小乞丐谈笑间机锋暗藏，憨厚青年却一片赤诚。你暗暗记下这对组合——日后江湖上，他们必有一番大作为。",
          transition: { type: "end" } },
      ],
    } },
  },

  // ===== 王府盗书 =====
  {
    id: "shendiao-wangfu",
    entryNode: "main",
    locationId: "linan",
    weight: 3,
    once: true,
    condition: { kind: "reputation", gte: 8 },
    nodes: { main: {
      title: "赵王府·夜探藏经",
      text: "你打听到赵王府中藏有一部武学秘籍，遂趁夜潜入。王府重重院落，灯火通明处隐约可见高手巡夜。你屏息潜行，忽闻远处传来一阵凄厉的怪笑——似有人正在练那阴毒的九阴白骨爪。",
      choices: [
        { id: "steal", text: "深入盗书", description: "风险与机缘并存，博他一回。",
          consequences: [{ kind: "skill", id: "jiuyang" }, { kind: "mp", delta: 20 }, { kind: "reputation", delta: 2 }],
          consumeDay: true,
          resultText: "你潜入王府密室，竟寻得一部内功心法残卷，依稀是《九阳神功》的根基！虽险些被梅超风察觉，终是全身而退。",
          transition: { type: "end" } },
        { id: "ambush", text: "伏击巡夜", description: "遇到王府高手，索性一战。",
          consumeDay: true,
          resultText: "你撞上王府的护院高手，对方冷喝一声拔刀相向！",
          transition: { type: "battle", enemyId: "emingke",
            onWin: { text: "你几招之间制服王府护院，搜身竟得了一本残破的武学手札与若干碎银。虽未及深入藏经之所，这番收获也已不菲，江湖经验更增几分。", consequences: [{ kind: "gold", delta: 40 }, { kind: "reputation", delta: 2 }, { kind: "item", id: "small-mp-pill", count: 1 }], then: { type: "end" } },
            onLose: { text: "护院高手武艺不弱，你力战不敌，趁夜色狼狈逃出王府。此行空手而归，还险些折在里面。", then: { type: "end" } },
            onFlee: { text: "你见护院身手不凡，不愿纠缠，虚晃几招遁入夜色，全身而退。", then: { type: "end" } },
          } },
        { id: "retreat", text: "见好就收", description: "王府高手如云，不可逞强。",
          consequences: [{ kind: "reputation", delta: 1 }],
          consumeDay: true,
          resultText: "你见王府戒备森严、高手如云，明智地选择全身而退。虽空手而归，却保全了性命。",
          transition: { type: "end" } },
      ],
    } },
  },
]
