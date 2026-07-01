import type { Player } from "../types"
import type { StoryEvent } from "./story/schema"
import { checkCondition } from "../game/story/conditions"
import { getRandomEnemy, getEnemyById, getRandomEnemyFromPool } from "./enemies"
import { STORY_VOLUMES } from "./story"

// 对外导出剧情类型（UI 层从 events 一处 import 即可）
export type { StoryEvent, Transition, Condition, Consequence, Choice, StoryNode, Outcome, WorldState } from "./story/schema"

// ============================================================
// 通用剧情事件（声明式：entryNode + nodes + consequences + transition）
// 写法见《剧情系统设计手册.md》。战斗用 transition.battle + onWin/onLose/onFlee。
// ============================================================
export const STORY_EVENTS: StoryEvent[] = [
  // ===== 路见纷争 =====
  {
    id: "roadside-trouble",
    entryNode: "main", weight: 4,
    nodes: { main: {
      id: "main",
      text: "你沿山道前行，忽见几个地痞围住行脚商人。那商人神色惊慌，显然已被逼到绝境。",
      choices: [
        { id: "intervene", text: "拔刀相助", description: "挺身而出，直接与恶徒交手。",
          consumeDay: true, resultText: "你喝止恶徒，对方恼羞成怒，拔拳相向！",
          transition: { type: "battle", useLocationPool: true,
            onWin: { text: "几个回合下来，地痞们被打得抱头鼠窜、四散而逃。行脚商人千恩万谢，硬塞给你一袋碎银作谢礼。你路见不平拔刀相助，义举传出，江湖声名小增。", consequences: [{ kind: "gold", delta: 25 }, { kind: "reputation", delta: 3 }, { kind: "item", id: "small-hp-pill", count: 1 }], then: { type: "end" } },
            onLose: { text: "你寡不敌众，被地痞们围殴受伤。商人趁乱逃脱，你只能捂着伤口黯然离去。", then: { type: "end" } },
            onFlee: { text: "你见对方人多，虚晃一招抽身而退，商人那头的纷争已无力顾及。", then: { type: "end" } },
          } },
        { id: "observe", text: "静观其变", description: "不贸然出手，先判断局势。",
          consequences: [{ kind: "reputation", delta: 1 }], consumeDay: true,
          resultText: "你按兵不动，默记了这伙人的相貌，今日暂且未起波澜。",
          transition: { type: "end" } },
      ],
    } },
  },

  // ===== 荒祠遗物 =====
  {
    id: "hidden-cache",
    entryNode: "main", weight: 3,
    nodes: { main: {
      id: "main",
      text: "你在野外避雨时，发现荒祠后墙有一块砖松动，里面竟藏着一个布包。",
      choices: [
        { id: "take-gold", text: "取走银两", description: "拿走布包内的碎银与干粮，补足旅费。",
          consequences: [{ kind: "gold", delta: 40 }, { kind: "item", id: "field-ration", count: 1 }], consumeDay: true,
          resultText: "你小心收起布包里的碎银，行囊顿时宽裕了些。",
          transition: { type: "end" } },
        { id: "leave-offering", text: "留下一炷香", description: "只取少量干粮，其余原样放回。",
          consequences: [{ kind: "hp", delta: 18 }, { kind: "reputation", delta: 2 }], consumeDay: true,
          resultText: "你不愿多取，只带走少量干粮，心境反而更为安定。",
          transition: { type: "end" } },
      ],
    } },
  },

  // ===== 残页奇书（已学梯云纵则不再出现）=====
  {
    id: "strange-manual",
    entryNode: "main", weight: 2,
    condition: { kind: "not", item: { kind: "hasSkill", id: "tiyun" } },
    nodes: { main: {
      id: "main",
      text: "你在林间歇脚时，发现石桌上压着几页泛黄残纸，字迹潦草，却暗含武学思路。",
      choices: [
        { id: "study", text: "细读残页", description: "花时间揣摩其中步法，或许能有所领悟。",
          consequences: [{ kind: "skill", id: "tiyun" }], consumeDay: true,
          resultText: "你从残页中悟出几分腾挪步法，习得《梯云纵》！",
          transition: { type: "end" } },
        { id: "memorize", text: "记下要点离开", description: "不强求立刻参透，只把关键句记在心里。",
          consequences: [{ kind: "mp", delta: 22 }, { kind: "aptitude", delta: 1 }], consumeDay: true,
          resultText: "你将关键句牢记于心，内息运转似乎也顺畅了些。",
          transition: { type: "end" } },
      ],
    } },
  },

  // ===== 旅商委托 =====
  {
    id: "escort-request",
    entryNode: "main", weight: 3,
    nodes: { main: {
      id: "main",
      text: "你在茶摊歇脚时，一名行脚商人低声问你可否护送一程，说前方山道常有宵小出没。",
      choices: [
        { id: "accept", text: "接下委托", description: "护送商人走一段山路，赚一笔辛苦钱。",
          consequences: [{ kind: "gold", delta: 55 }, { kind: "reputation", delta: 1 }, { kind: "item", id: "small-hp-pill", count: 1 }], consumeDay: true,
          resultText: "你护着商人平安穿过险路，对方千恩万谢，付了你一袋银两。",
          transition: { type: "end" } },
        { id: "decline", text: "婉言谢绝", description: "你还有别的安排，不想被委托束住脚步。",
          consumeDay: true, resultText: "你抱拳告辞，商人虽然失望，却也不再强求。",
          transition: { type: "end" } },
      ],
    } },
  },

  // ===== 可疑客栈 =====
  {
    id: "black-inn",
    entryNode: "main", weight: 2,
    nodes: { main: {
      id: "main",
      text: "夜色渐沉，客栈门外挂着一盏红灯。掌柜笑着招呼你进门歇脚，可你总觉得这店气氛不对。",
      choices: [
        { id: "stay-alert", text: "将计就计", description: "先进店观察，若有异动再伺机而动。",
          consequences: [{ kind: "gold", delta: 35 }, { kind: "mp", delta: 10 }], consumeDay: true,
          resultText: "你佯装入睡，果然听到脚步靠近。你先一步破门而出，还顺手带走了对方来不及藏好的碎银。",
          transition: { type: "end" } },
        { id: "leave-now", text: "转身离去", description: "宁可连夜赶路，也不住这间古怪小店。",
          consequences: [{ kind: "mp", delta: -8 }, { kind: "reputation", delta: 1 }], consumeDay: true,
          resultText: "你没有停留，摸黑赶了一段夜路，虽有些疲惫，却避开了一场麻烦。",
          transition: { type: "end" } },
      ],
    } },
  },

  // ===== 前辈指点 =====
  {
    id: "senior-guidance",
    entryNode: "main", weight: 2,
    nodes: { main: {
      id: "main",
      text: "老人抬眼看了你一会儿，忽然笑道：\"你气息尚浅，却也有几分骨气。可愿听老夫一言？\"",
      choices: [
        { id: "listen", text: "虚心求教", description: "停下脚步，认真听前辈指点呼吸与出招。",
          consequences: [{ kind: "attack", delta: 1 }, { kind: "speed", delta: 1 }, { kind: "reputation", delta: 1 }], consumeDay: true,
          resultText: "老人只寥寥几句，却让你顿觉豁然开朗，内息与身法都精进了一分。",
          transition: { type: "end" } },
        { id: "bow-leave", text: "抱拳告辞", description: "礼数周全地退下，不打扰前辈清修。",
          consequences: [{ kind: "hp", delta: 20 }, { kind: "item", id: "small-mp-pill", count: 1 }], consumeDay: true,
          resultText: "老人并未怪罪，只挥手示意你去。你离开时心境平和，气血也恢复了些。",
          transition: { type: "end" } },
      ],
    } },
  },

  // ===== 街头赌局（random 随机分流到 win/lose 结果节点）=====
  {
    id: "gambling-stall",
    entryNode: "main", weight: 2,
    nodes: {
      main: {
        id: "main",
        text: "你路过集市时，见一张木桌前人头攒动。赌徒满脸兴奋，连声叫你也来试试手气。",
        choices: [
          { id: "bet-small", text: "押一把小注", description: "拿些碎银碰碰运气，输赢都不至于伤筋动骨。",
            consequences: [{ kind: "gold", delta: -20 }], consumeDay: true,
            resultText: "你掏出碎银押了一注，骰盅落地——",
            transition: { type: "random", cases: [
              { weight: 1, then: { type: "goto", nodeId: "win" } },
              { weight: 1, then: { type: "goto", nodeId: "lose" } },
            ] } },
          { id: "walk-away", text: "不沾赌局", description: "看一眼热闹便离开，不让自己陷进去。",
            consequences: [{ kind: "reputation", delta: 1 }], consumeDay: true,
            resultText: "你没有停留太久，只把集市的喧闹当成过耳风声。",
            transition: { type: "end" } },
        ],
      },
      win: {
        id: "win",
        text: "你手气不错，小赚一笔，围观众人都高看了你几眼。",
        onEnter: [{ kind: "gold", delta: 50 }],
        autoNext: { type: "end" },
      },
      lose: {
        id: "lose",
        text: "你押错了门路，碎银被赢走，只好苦笑着退出人群。",
        autoNext: { type: "end" },
      },
    },
  },

  // ===== 门派传讯 =====
  {
    id: "sect-messenger",
    entryNode: "main", weight: 2,
    nodes: { main: {
      id: "main",
      text: "来人衣着整肃，见你气息不俗，便试探着问你是否有意日后上山拜访师门习艺。",
      choices: [
        { id: "ask-sects", text: "多问两句", description: "趁机了解各门各派的风格与路数。",
          consequences: [{ kind: "reputation", delta: 1 }, { kind: "aptitude", delta: 1 }], consumeDay: true,
          resultText: "你与那弟子交谈许久，对江湖门派的脉络更熟悉了，日后择师也会更有主见。",
          transition: { type: "end" } },
        { id: "hurry-on", text: "继续赶路", description: "你暂时无意停留，决定等时机成熟再说。",
          consumeDay: true, resultText: "你谢过传讯弟子，心里却也记下了各派山门的去处。",
          transition: { type: "end" } },
      ],
    } },
  },

  // ===== 临安茶楼 =====
  {
    id: "linan-teahouse",
    entryNode: "main", locationId: "linan",
    nodes: { main: {
      id: "main",
      text: "你走进临安城一家热闹的茶楼，角落里几名佩刀汉子压低声音，正谈论一桩惊天劫案。见你走近，他们警觉地住了口。",
      choices: [
        { id: "ask", text: "旁敲侧击", description: "买壶茶坐近，装作闲聊试探消息。",
          consequences: [{ kind: "reputation", delta: 1 }, { kind: "aptitude", delta: 1 }], consumeDay: true,
          resultText: "你不动声色地打探，果然听到些江湖传闻——据说某处藏有前人遗宝。你的见识增长了几分。",
          transition: { type: "end" } },
        { id: "ignore", text: "独自饮茶", description: "不招惹是非，安心歇脚。",
          consequences: [{ kind: "hp", delta: 15 }, { kind: "item", id: "field-ration", count: 1 }],
          resultText: "你独自饮茶歇脚，不去招惹是非，精神恢复了几分。",
          transition: { type: "end" } },
      ],
    } },
  },

  // ===== 夜市奇遇 =====
  {
    id: "linan-nightmarket",
    entryNode: "main", locationId: "linan",
    nodes: { main: {
      id: "main",
      text: "华灯初上，临安夜市人潮涌动。一名白须老者忽然拦住你，上下打量道：阁下印堂发亮，近来恐有大机缘。",
      choices: [
        { id: "hear-fortune", text: "听他一卦", description: "花些银两听听这老者的玄话。",
          consequences: [{ kind: "gold", delta: -20 }, { kind: "reputation", delta: 1 }], consumeDay: true,
          resultText: "老者掐指一算，只留下一句福至心灵便飘然而去。说来奇怪，你此后确实觉得诸事顺遂。",
          transition: { type: "end" } },
        { id: "walk-on", text: "摇头走开", description: "江湖骗子多，不凑这热闹。",
          consumeDay: true, resultText: "你没理会那老者，继续逛市。夜风送爽，倒也惬意。",
          transition: { type: "end" } },
      ],
    } },
  },

  // ===== 藏经阁外 =====
  {
    id: "shaolin-scripture",
    entryNode: "main", locationId: "shaolin",
    nodes: { main: {
      id: "main",
      text: "你来到少林寺藏经阁外，一名小沙弥正低头扫地。他抬眼见你气息不俗，犹豫片刻，低声道：施主可愿听贫僧一言？",
      choices: [
        { id: "listen", text: "倾听相询", description: "停下脚步，听小沙弥说些什么。",
          consequences: [{ kind: "mp", delta: 25 }, { kind: "aptitude", delta: 1 }], consumeDay: true,
          resultText: "小沙弥悄悄告诉你，藏经阁深处偶有高僧论道，旁听一二可受益匪浅。你依言静坐片刻，内息果然通畅了些。",
          transition: { type: "end" } },
        { id: "bow-leave", text: "合十告辞", description: "佛门清净，不打扰修行。",
          consequences: [{ kind: "hp", delta: 12 }], consumeDay: true,
          resultText: "你双手合十还礼，小沙弥含笑送你出门，心境一片澄明。",
          transition: { type: "end" } },
      ],
    } },
  },

  // ===== 华山绝壁 =====
  {
    id: "huashan-cliff",
    entryNode: "main", locationId: "huashan",
    nodes: { main: {
      id: "main",
      text: "你攀上华山险峰，狂风猎猎。远处的平台上传来金铁交鸣之声，几位高手正在切磋，掌风剑气激荡山林。",
      choices: [
        { id: "watch", text: "登高观战", description: "远观高手过招，揣摩其中门道。",
          consequences: [{ kind: "speed", delta: 2 }, { kind: "reputation", delta: 2 }], consumeDay: true,
          resultText: "你藏身暗处观战，那些高深的招式让你大开眼界，身法与眼力都精进了不少。",
          transition: { type: "end" } },
        { id: "descend", text: "悄然下山", description: "高手过招非同小可，不冒险逗留。",
          consumeDay: true, resultText: "你识趣地退下华山，避开了一场可能的灾祸。",
          transition: { type: "end" } },
      ],
    } },
  },

  // ===== 峨眉隐者 =====
  {
    id: "emei-hermit",
    entryNode: "main", locationId: "emei",
    nodes: { main: {
      id: "main",
      text: "峨眉山云雾深处，一位青衣女子正持剑起舞，剑光如匹练流转，凌厉中不失飘逸。她见你到来，剑势一顿。",
      choices: [
        { id: "challenge", text: "请教剑术", description: "主动请缨，与女子切磋一番。",
          consequences: [{ kind: "attack", delta: 2 }, { kind: "reputation", delta: 1 }], consumeDay: true,
          resultText: "女子也不推辞，拔剑与你过招。数招之后她收剑而笑，指点了你两式，你的剑理大有长进。",
          transition: { type: "end" } },
        { id: "watch-leave", text: "驻足欣赏", description: "静静看她舞完一曲，悄然离去。",
          consequences: [{ kind: "aptitude", delta: 2 }], consumeDay: true,
          resultText: "你静静看完那一套剑法，女子舞毕朝你微微颔首。你心有所悟。",
          transition: { type: "end" } },
      ],
    } },
  },

  // ===== 星宿毒沼 =====
  {
    id: "xingxiu-poison",
    entryNode: "main", locationId: "xingxiu",
    nodes: { main: {
      id: "main",
      text: "你深入星宿海，脚下毒沼冒泡，空气腥臭。一个阴恻恻的声音从雾中传来：嘿嘿，胆敢擅闯星宿海，留下命来！",
      choices: [
        { id: "fight", text: "迎战毒物", description: "拔兵刃与星宿派妖人对峙。",
          consumeDay: true, resultText: "你怒喝一声，迎向那阴毒的星宿派人！",
          transition: { type: "battle", enemyId: "duyaozi",
            onWin: { text: "你以深厚内力逼退毒雾，数招之间将那星宿派妖人打翻在地。他丢下一包解毒丹连滚带爬地逃了。你搜得些银两丹药，更在毒沼中磨练了抗毒之能。", consequences: [{ kind: "gold", delta: 35 }, { kind: "reputation", delta: 3 }, { kind: "item", id: "small-hp-pill", count: 2 }], then: { type: "end" } },
            onLose: { text: "星宿派毒功阴狠，你不慎中了毒雾，身负重伤。那妖人狞笑几声也未追击，你勉强爬出毒沼，侥幸保住性命。", then: { type: "end" } },
            onFlee: { text: "你忌惮毒沼瘴气，不愿硬拼，屏息退出了星宿海。", then: { type: "end" } },
          } },
        { id: "retreat", text: "屏息退走", description: "毒沼险地，不宜久留。",
          consequences: [{ kind: "mp", delta: -8 }], consumeDay: true,
          resultText: "你以袖掩鼻，趁着毒雾稀薄时迅速退走，侥幸未被毒气所伤。",
          transition: { type: "end" } },
      ],
    } },
  },

  // ===== 大漠射雕 =====
  {
    id: "damos-eagle",
    entryNode: "main", locationId: "damos",
    nodes: { main: {
      id: "main",
      text: "你在大漠中独行，忽见一只硕大无比的白雕自天际俯冲而下，爪下似抓着什么东西。它在你头顶盘旋，发出嘹亮的鸣叫。",
      choices: [
        { id: "track", text: "追踪神雕", description: "跟着白雕的方向走，看看有什么。",
          consequences: [{ kind: "gold", delta: 60 }, { kind: "reputation", delta: 2 }, { kind: "item", id: "field-ration", count: 1 }], consumeDay: true,
          resultText: "你追随白雕走了许久，在一处沙丘后发现一具前人遗骸，身旁散落着银两与一卷残破地图。",
          transition: { type: "end" } },
        { id: "watch-sky", text: "仰望神雕", description: "看那白雕翱翔，感叹天地辽阔。",
          consequences: [{ kind: "hp", delta: 20 }, { kind: "reputation", delta: 1 }], consumeDay: true,
          resultText: "白雕振翅高飞，消失在天际。你只觉胸中豪气顿生，气血运行也更为顺畅。",
          transition: { type: "end" } },
      ],
    } },
  },

  // ===== 灵鹫宫下 =====
  {
    id: "xiling-palace",
    entryNode: "main", locationId: "xiling",
    nodes: { main: {
      id: "main",
      text: "你来到西夏雪山脚下，抬头望去，一道长长的石阶没入云端，据说顶端便是那神秘的灵鹫宫。石阶旁立着一块石碑，上书非缘者勿登。",
      choices: [
        { id: "climb", text: "拾级而上", description: "既是机缘，不妨一试。",
          consequences: [{ kind: "speed", delta: 3 }, { kind: "aptitude", delta: 1 }], consumeDay: true,
          resultText: "你咬牙攀上石阶，虽未能入宫，却在半山亭中悟得一段奇门步法，身法大进。",
          transition: { type: "end" } },
        { id: "admire", text: "远观赞叹", description: "雪山高寒，量力而行。",
          consequences: [{ kind: "reputation", delta: 1 }], consumeDay: true,
          resultText: "你在山脚仰望良久，叹造化之奇，遂转身离去，心中却已种下一颗武学之念。",
          transition: { type: "end" } },
      ],
    } },
  },

  // ===== 白驼蛇阵 =====
  {
    id: "baituo-snake",
    entryNode: "main", locationId: "baituo",
    nodes: { main: {
      id: "main",
      text: "你靠近白驼山庄，只见庄外密密麻麻盘踞着无数毒蛇，结成一个诡异的蛇阵。庄门内传来一阵阴恻恻的笑声：既来白驼山，便留下做蛇饵吧！",
      choices: [
        { id: "break-array", text: "强破蛇阵", description: "运起内力，硬闯白驼山庄。",
          consumeDay: true, resultText: "你大喝一声冲入蛇阵，蛇群受惊四散，一名白驼山弟子拦住去路！",
          transition: { type: "battle", enemyId: "ouyangfeng",
            onWin: { text: "你冲破蛇阵，与那白驼山弟子激战数合将其击退。蛇群失了驱策四散而去，你在庄前寻得些银两与疗伤丹药。能在白驼山全身而退，已是难得的本事。", consequences: [{ kind: "gold", delta: 45 }, { kind: "reputation", delta: 4 }, { kind: "item", id: "small-mp-pill", count: 2 }], then: { type: "end" } },
            onLose: { text: "白驼山武功诡异，你力战不敌，被蛇阵困住。千钧一发之际你拼死突围，虽保住性命，却已伤痕累累。", then: { type: "end" } },
            onFlee: { text: "你见蛇阵难破、强敌在后，当机立断绕道退走，未与白驼山弟子正面交锋。", then: { type: "end" } },
          } },
        { id: "detour", text: "绕道而行", description: "蛇阵难破，先退再说。",
          consequences: [{ kind: "reputation", delta: 1 }], consumeDay: true,
          resultText: "你见蛇阵诡异难破，明智地选择绕道。虽未得见西毒，却保全了性命。",
          transition: { type: "end" } },
      ],
    } },
  },

  // ===== 圣火之下 =====
  {
    id: "mingjiao-fire",
    entryNode: "main", locationId: "mingjiao",
    nodes: { main: {
      id: "main",
      text: "你登上光明顶，圣火在夜风中猎猎作响。明教群豪齐聚，似有大事商议。有人察觉到你的到来，齐刷刷望向你。",
      choices: [
        { id: "parley", text: "坦然相见", description: "既然被发现了，索性以礼相待。",
          consequences: [{ kind: "aptitude", delta: 2 }, { kind: "reputation", delta: 2 }], consumeDay: true,
          resultText: "你坦然上前，明教中人见你气度不凡，竟未为难。一番交谈后，你对他们乾坤大挪移的思路略有领悟。",
          transition: { type: "end" } },
        { id: "flee", text: "悄然退走", description: "明教势大，不宜招惹。",
          consumeDay: true, resultText: "你借着夜色悄然退下光明顶，虽错过了一场机缘，却避免了正面冲突。",
          transition: { type: "end" } },
      ],
    } },
  },

  // ===== 桃花迷阵 =====
  {
    id: "taohua-array",
    entryNode: "main", locationId: "taohuadao",
    nodes: { main: {
      id: "main",
      text: "你在桃花岛桃林中穿行，看似寻常的桃树，走几步却发现景物全变——分明是奇门遁甲的大阵。四下桃花纷飞，你已辨不清方向。",
      choices: [
        { id: "break-array", text: "以武破阵", description: "不信邪，强行闯阵。",
          consequences: [{ kind: "speed", delta: 2 }, { kind: "mp", delta: -15 }], consumeDay: true,
          resultText: "你运功强行闯阵，虽狼狈闯出，却在反复周折中参透了些许步法，身法精进。",
          transition: { type: "end" } },
        { id: "wait", text: "静心等候", description: "乱动不如不动，以静制动。",
          consequences: [{ kind: "hp", delta: 25 }, { kind: "aptitude", delta: 1 }], consumeDay: true,
          resultText: "你盘膝静坐，任桃花纷飞。许久之后，风向忽变，阵眼自现，你从容走出。心境大为提升。",
          transition: { type: "end" } },
      ],
    } },
  },

  // ===== 天龙寺外 =====
  {
    id: "dali-temple",
    entryNode: "main", locationId: "dali",
    nodes: { main: {
      id: "main",
      text: "你来到大理天龙寺外，一位灰衣老僧正在扫地。他抬眼看你，目光温和却深邃：施主指法已有根基，可愿入寺一叙？",
      choices: [
        { id: "learn", text: "求教指法", description: "段氏指法天下闻名，机不可失。",
          consequences: [{ kind: "attack", delta: 3 }, { kind: "aptitude", delta: 1 }], consumeDay: true,
          resultText: "老僧引你入寺，点拨你一阳指的入门要诀。你虽未能尽悟，指尖已隐隐有了几分指力。",
          transition: { type: "end" } },
        { id: "respect", text: "合十致敬", description: "佛门清净，不便叨扰。",
          consequences: [{ kind: "mp", delta: 20 }, { kind: "item", id: "small-mp-pill", count: 1 }],
          resultText: "你双手合十还礼，老僧微笑点头。临别时他赠你一串佛珠，似有安神之效。",
          transition: { type: "end" } },
      ],
    } },
  },
]

// ============================================================
// 查询函数
// ============================================================
// 排除已完成的 once 事件（一次性剧情节点做完不再触发）
function notCompleted(player: Player, e: StoryEvent): boolean {
  return !(player.world.completedEvents ?? []).includes(e.id)
}

export function getRandomStoryEvent(player: Player): StoryEvent {
  const ALL = [...STORY_EVENTS, ...STORY_VOLUMES].filter((e) => notCompleted(player, e))
  const available = ALL.filter((e) => checkCondition(player, player.world, e.condition))
  const pool = available.length > 0 ? available : ALL
  const weighted = pool.flatMap((e) => Array(e.weight ?? 1).fill(e))
  return weighted[Math.floor(Math.random() * weighted.length)]
}

export function getStoryEventById(id: string): StoryEvent | undefined {
  return [...STORY_EVENTS, ...STORY_VOLUMES].find((e) => e.id === id)
}

// 按地点取事件：优先该地点专属剧情（未完成且满足 condition），否则回退随机事件
export function getStoryEventByLocation(player: Player, locationEvents: string[]): StoryEvent {
  for (const id of locationEvents) {
    const e = getStoryEventById(id)
    if (e && notCompleted(player, e) && checkCondition(player, player.world, e.condition)) return e
  }
  return getRandomStoryEvent(player)
}

export function getAdventureEnemy(player: Player, enemyId?: string, locationPool?: string[]) {
  if (enemyId) return getEnemyById(enemyId)
  if (locationPool && locationPool.length > 0) return getRandomEnemyFromPool(player, locationPool)
  return getRandomEnemy(player)
}
