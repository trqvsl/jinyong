import type { Player } from "../types"
import { getRandomEnemy, getEnemyById, getRandomEnemyFromPool } from "./enemies"
import { getSkillById } from "./skills"
import { STORY_VOLUMES } from "./story"

function grantItem(player: Player, itemId: string, amount = 1): Player {
  return {
    ...player,
    inventory: {
      ...player.inventory,
      [itemId]: (player.inventory[itemId] ?? 0) + amount,
    },
  }
}

export interface EventChoiceResult {
  text: string
  player: Player
  startBattle?: boolean
  consumeDay?: boolean
  enemyId?: string
}

export interface EventChoice {
  id: string
  text: string
  description: string
  resolve: (player: Player) => EventChoiceResult
}

export interface StoryEvent {
  id: string
  title: string
  summary: string
  intro: string
  choices: EventChoice[]
  weight?: number
  condition?: (player: Player) => boolean
  locationId?: string             // 归属地点（去该地点时优先/必定触发）
}

export const STORY_EVENTS: StoryEvent[] = [
  // ===== 金庸原著剧情事件（射雕篇开头） =====
  // 主角作为"外来者"在牛家村风雪之夜介入原著开场。
  // 绑定到"牛家村"地点，由玩家主动前往触发。
  {
    id: "shendiao-niujia",
    title: "牛家村·风雪惊变",
    summary: "牛家村雪夜，一户农舍灯火通明，村外却已火把连绵。",
    intro:
      "你踏雪夜宿牛家村。一户农舍灯火通明，两名壮汉正与一位道人对饮，那道人目光如电、杀气内敛，绝非寻常之辈。你尚未来得及细看，村外火把连绵——一队官军已围住村子，冷喝\"奉命缉拿钦犯\"。风雪里，一场血战似已无可避免。",
    weight: 6,
    locationId: "niujia",
    choices: [
      {
        id: "defend",
        text: "挺身力战",
        description: "护那道人，与官军周旋，不论出身，先救人再说。",
        resolve: (player) => ({
          text:
            "你纵身跃入农舍院中，拔兵刃迎向官军。那道人见有人援手，眼中闪过一丝讶异，随即与两名壮汉并肩而上。一番厮杀，官军暂退，那道人抱拳道：\"阁下胆识过人，今日之情，贫道丘处机记下了。\"",
          player: { ...player, reputation: player.reputation + 3 },
          startBattle: true,
          enemyId: "guanjun",
          consumeDay: true,
        }),
      },
      {
        id: "escort-pregnant",
        text: "护送妇孺",
        description: "趁乱护送农舍中一位孕妇从后山出村，保全无辜。",
        resolve: (player) => ({
          text:
            "你借着风雪掩护，带着农舍中惊惶的孕妇从后山小路悄然出村。她紧紧护着腹中孩儿，低声谢你。走出数里，回望牛家村火光冲天，你心中隐隐觉得，这孩子日后恐怕不凡。",
          player: grantItem(
            { ...player, reputation: player.reputation + 4, hp: Math.max(1, player.hp - 5) },
            "field-ration",
            1
          ),
          consumeDay: true,
        }),
      },
      {
        id: "watch",
        text: "冷眼旁观",
        description: "藏身暗处，把那道人的全真剑法看个仔细，伺机而动。",
        resolve: (player) => ({
          text:
            "你伏于梁上，看那道人长剑如虹，官军竟一时近不得身。全真剑法的招式变化被你尽收眼底，似有所悟。待双方两败俱伤各自散去，你才悄然离开——只是这一夜袖手，心中难免留下几分愧疚。",
          player: { ...player, aptitude: Math.min(99, player.aptitude + 2), reputation: player.reputation - 2 },
          consumeDay: true,
        }),
      },
    ],
  },
  {
    id: "roadside-trouble",
    title: "路见纷争",
    summary: "前方传来吵嚷声，似有人在路边欺压商旅。",
    intro: "你沿山道前行，忽见几个地痞围住行脚商人。那商人神色惊慌，显然已被逼到绝境。",
    weight: 4,
    choices: [
      {
        id: "intervene",
        text: "拔刀相助",
        description: "挺身而出，直接与恶徒交手。",
        resolve: (player) => ({
          text: "你喝止恶徒，对方恼羞成怒，拔拳相向！",
          player,
          startBattle: true,
          consumeDay: true,
        }),
      },
      {
        id: "observe",
        text: "静观其变",
        description: "不贸然出手，先判断局势。",
        resolve: (player) => ({
          text: "你按兵不动，默记了这伙人的相貌，今日暂且未起波澜。",
          player: { ...player, reputation: player.reputation + 1 },
          consumeDay: true,
        }),
      },
    ],
  },
  {
    id: "hidden-cache",
    title: "荒祠遗物",
    summary: "破旧山神庙后，似乎藏着前人留下的东西。",
    intro: "你在野外避雨时，发现荒祠后墙有一块砖松动，里面竟藏着一个布包。",
    weight: 3,
    choices: [
      {
        id: "take-gold",
        text: "取走银两",
        description: "拿走布包内的碎银与干粮，补足旅费。",
        resolve: (player) => ({
          text: "你小心收起布包里的碎银，行囊顿时宽裕了些。",
          player: grantItem({ ...player, gold: player.gold + 40 }, "field-ration", 1),
          consumeDay: true,
        }),
      },
      {
        id: "leave-offering",
        text: "留下一炷香",
        description: "只取少量干粮，其余原样放回。",
        resolve: (player) => ({
          text: "你不愿多取，只带走少量干粮，心境反而更为安定。",
          player: { ...player, hp: Math.min(player.hpMax, player.hp + 18), reputation: player.reputation + 2 },
          consumeDay: true,
        }),
      },
    ],
  },
  {
    id: "strange-manual",
    title: "残页奇书",
    summary: "林间石桌上散着几页心法残章，似有人故意留在此地。",
    intro: "你在林间歇脚时，发现石桌上压着几页泛黄残纸，字迹潦草，却暗含武学思路。",
    weight: 2,
    condition: (player) => !player.skills.some((skill) => skill.id === "tiyun"),
    choices: [
      {
        id: "study",
        text: "细读残页",
        description: "花时间揣摩其中步法，或许能有所领悟。",
        resolve: (player) => {
          const skill = getSkillById("tiyun")
          const skills = skill ? [...player.skills, skill] : player.skills
          return {
            text: skill ? "你从残页中悟出几分腾挪步法，习得《梯云纵》！" : "你苦思良久，却只记下些零碎心得。",
            player: { ...player, skills },
            consumeDay: true,
          }
        },
      },
      {
        id: "memorize",
        text: "记下要点离开",
        description: "不强求立刻参透，只把关键句记在心里。",
        resolve: (player) => ({
          text: "你将关键句牢记于心，内息运转似乎也顺畅了些。",
          player: { ...player, mp: Math.min(player.mpMax, player.mp + 22), aptitude: Math.min(99, player.aptitude + 1) },
          consumeDay: true,
        }),
      },
    ],
  },
  {
    id: "escort-request",
    title: "旅商委托",
    summary: "一名行脚商人正为前路不安，似乎想雇人同行。",
    intro: "你在茶摊歇脚时，一名行脚商人低声问你可否护送一程，说前方山道常有宵小出没。",
    weight: 3,
    choices: [
      {
        id: "accept",
        text: "接下委托",
        description: "护送商人走一段山路，赚一笔辛苦钱。",
        resolve: (player) => ({
          text: "你护着商人平安穿过险路，对方千恩万谢，付了你一袋银两。",
          player: grantItem({ ...player, gold: player.gold + 55, reputation: player.reputation + 1 }, "small-hp-pill", 1),
          consumeDay: true,
        }),
      },
      {
        id: "decline",
        text: "婉言谢绝",
        description: "你还有别的安排，不想被委托束住脚步。",
        resolve: (player) => ({
          text: "你抱拳告辞，商人虽然失望，却也不再强求。",
          player,
          consumeDay: true,
        }),
      },
    ],
  },
  {
    id: "black-inn",
    title: "可疑客栈",
    summary: "日暮时分，你在路边发现一家灯火昏黄的小店，掌柜笑得让人不太放心。",
    intro: "夜色渐沉，客栈门外挂着一盏红灯。掌柜笑着招呼你进门歇脚，可你总觉得这店气氛不对。",
    weight: 2,
    choices: [
      {
        id: "stay-alert",
        text: "将计就计",
        description: "先进店观察，若有异动再伺机而动。",
        resolve: (player) => ({
          text: "你佯装入睡，果然听到脚步靠近。你先一步破门而出，还顺手带走了对方来不及藏好的碎银。",
          player: { ...player, gold: player.gold + 35, mp: Math.min(player.mpMax, player.mp + 10) },
          consumeDay: true,
        }),
      },
      {
        id: "leave-now",
        text: "转身离去",
        description: "宁可连夜赶路，也不住这间古怪小店。",
        resolve: (player) => ({
          text: "你没有停留，摸黑赶了一段夜路，虽有些疲惫，却避开了一场麻烦。",
          player: { ...player, mp: Math.max(0, player.mp - 8), reputation: player.reputation + 1 },
          consumeDay: true,
        }),
      },
    ],
  },
  {
    id: "senior-guidance",
    title: "前辈指点",
    summary: "山涧石台边，一位白发老人正在独自饮茶，似乎早已注意到你。",
    intro: "老人抬眼看了你一会儿，忽然笑道：\"你气息尚浅，却也有几分骨气。可愿听老夫一言？\"",
    weight: 2,
    choices: [
      {
        id: "listen",
        text: "虚心求教",
        description: "停下脚步，认真听前辈指点呼吸与出招。",
        resolve: (player) => ({
          text: "老人只寥寥几句，却让你顿觉豁然开朗，内息与身法都精进了一分。",
          player: { ...player, attack: player.attack + 1, speed: player.speed + 1, reputation: player.reputation + 1 },
          consumeDay: true,
        }),
      },
      {
        id: "bow-leave",
        text: "抱拳告辞",
        description: "礼数周全地退下，不打扰前辈清修。",
        resolve: (player) => ({
          text: "老人并未怪罪，只挥手示意你去。你离开时心境平和，气血也恢复了些。",
          player: grantItem({ ...player, hp: Math.min(player.hpMax, player.hp + 20) }, "small-mp-pill", 1),
          consumeDay: true,
        }),
      },
    ],
  },
  {
    id: "gambling-stall",
    title: "街头赌局",
    summary: "集市口围满了人，一名赌徒正吆喝着让人下注。",
    intro: "你路过集市时，见一张木桌前人头攒动。赌徒满脸兴奋，连声叫你也来试试手气。",
    weight: 2,
    choices: [
      {
        id: "bet-small",
        text: "押一把小注",
        description: "拿些碎银碰碰运气，输赢都不至于伤筋动骨。",
        resolve: (player) => {
          const win = Math.random() < 0.5
          return win
            ? {
                text: "你手气不错，小赚一笔，围观众人都高看了你几眼。",
                player: { ...player, gold: player.gold + 30 },
                consumeDay: true,
              }
            : {
                text: "你押错了门路，碎银被赢走，只好苦笑着退出人群。",
                player: { ...player, gold: Math.max(0, player.gold - 20) },
                consumeDay: true,
              }
        },
      },
      {
        id: "walk-away",
        text: "不沾赌局",
        description: "看一眼热闹便离开，不让自己陷进去。",
        resolve: (player) => ({
          text: "你没有停留太久，只把集市的喧闹当成过耳风声。",
          player: { ...player, reputation: player.reputation + 1 },
          consumeDay: true,
        }),
      },
    ],
  },
  {
    id: "sect-messenger",
    title: "门派传讯",
    summary: "山道上，一名弟子匆匆而来，似乎在替某处门派传话。",
    intro: "来人衣着整肃，见你气息不俗，便试探着问你是否有意日后上山拜访师门习艺。",
    weight: 2,
    choices: [
      {
        id: "ask-sects",
        text: "多问两句",
        description: "趁机了解各门各派的风格与路数。",
        resolve: (player) => ({
          text: "你与那弟子交谈许久，对江湖门派的脉络更熟悉了，日后择师也会更有主见。",
          player: { ...player, reputation: player.reputation + 1, aptitude: Math.min(99, player.aptitude + 1) },
          consumeDay: true,
        }),
      },
      {
        id: "hurry-on",
        text: "继续赶路",
        description: "你暂时无意停留，决定等时机成熟再说。",
        resolve: (player) => ({
          text: "你谢过传讯弟子，心里却也记下了各派山门的去处。",
          player,
          consumeDay: true,
        }),
      },
    ],
  },
  // ===== 游历地点奇遇（各区域代表性事件） =====
  {
    id: "linan-teahouse",
    title: "临安茶楼",
    summary: "茶楼里坐着几位江湖客，正低声议论一桩大事。",
    intro: "你走进临安城一家热闹的茶楼，角落里几名佩刀汉子压低声音，正谈论一桩惊天劫案。见你走近，他们警觉地住了口。",
    locationId: "linan",
    choices: [
      {
        id: "ask",
        text: "旁敲侧击",
        description: "买壶茶坐近，装作闲聊试探消息。",
        resolve: (player) => ({
          text: "你不动声色地打探，果然听到些江湖传闻——据说某处藏有前人遗宝。你的见识增长了几分。",
          player: { ...player, reputation: player.reputation + 1, aptitude: Math.min(99, player.aptitude + 1) },
          consumeDay: true,
        }),
      },
      {
        id: "ignore",
        text: "独自饮茶",
        description: "不招惹是非，安心歇脚。",
        resolve: (player) => ({ text: "你独自饮茶歇脚，不去招惹是非，精神恢复了几分。", player: grantItem({ ...player, hp: Math.min(player.hpMax, player.hp + 15) }, "field-ration", 1) }),
      },
    ],
  },
  {
    id: "linan-nightmarket",
    title: "夜市奇遇",
    summary: "夜市灯火通明，一个卖卦老者拉住了你。",
    intro: "华灯初上，临安夜市人潮涌动。一名白须老者忽然拦住你，上下打量道：阁下印堂发亮，近来恐有大机缘。",
    locationId: "linan",
    choices: [
      {
        id: "hear-fortune",
        text: "听他一卦",
        description: "花些银两听听这老者的玄话。",
        resolve: (player) => ({
          text: "老者掐指一算，只留下一句福至心灵便飘然而去。说来奇怪，你此后确实觉得诸事顺遂。",
          player: { ...player, gold: Math.max(0, player.gold - 20), reputation: player.reputation + 1 },
          consumeDay: true,
        }),
      },
      {
        id: "walk-on",
        text: "摇头走开",
        description: "江湖骗子多，不凑这热闹。",
        resolve: (player) => ({ text: "你没理会那老者，继续逛市。夜风送爽，倒也惬意。", player, consumeDay: true }),
      },
    ],
  },
  {
    id: "shaolin-scripture",
    title: "藏经阁外",
    summary: "少林藏经阁外，一名小沙弥正在扫地，似有难言之隐。",
    intro: "你来到少林寺藏经阁外，一名小沙弥正低头扫地。他抬眼见你气息不俗，犹豫片刻，低声道：施主可愿听贫僧一言？",
    locationId: "shaolin",
    choices: [
      {
        id: "listen",
        text: "倾听相询",
        description: "停下脚步，听小沙弥说些什么。",
        resolve: (player) => ({
          text: "小沙弥悄悄告诉你，藏经阁深处偶有高僧论道，旁听一二可受益匪浅。你依言静坐片刻，内息果然通畅了些。",
          player: { ...player, mp: Math.min(player.mpMax, player.mp + 25), aptitude: Math.min(99, player.aptitude + 1) },
          consumeDay: true,
        }),
      },
      {
        id: "bow-leave",
        text: "合十告辞",
        description: "佛门清净，不打扰修行。",
        resolve: (player) => ({ text: "你双手合十还礼，小沙弥含笑送你出门，心境一片澄明。", player: { ...player, hp: Math.min(player.hpMax, player.hp + 12) }, consumeDay: true }),
      },
    ],
  },
  {
    id: "huashan-cliff",
    title: "华山绝壁",
    summary: "华山险峰之上，风声呼啸，似有人在高处论剑。",
    intro: "你攀上华山险峰，狂风猎猎。远处的平台上传来金铁交鸣之声，几位高手正在切磋，掌风剑气激荡山林。",
    locationId: "huashan",
    choices: [
      {
        id: "watch",
        text: "登高观战",
        description: "远观高手过招，揣摩其中门道。",
        resolve: (player) => ({
          text: "你藏身暗处观战，那些高深的招式让你大开眼界，身法与眼力都精进了不少。",
          player: { ...player, speed: player.speed + 2, reputation: player.reputation + 2 },
          consumeDay: true,
        }),
      },
      {
        id: "descend",
        text: "悄然下山",
        description: "高手过招非同小可，不冒险逗留。",
        resolve: (player) => ({ text: "你识趣地退下华山，避开了一场可能的灾祸。", player, consumeDay: true }),
      },
    ],
  },
  {
    id: "emei-hermit",
    title: "峨眉隐者",
    summary: "峨眉云深处，一位持剑女子正独自练剑。",
    intro: "峨眉山云雾深处，一位青衣女子正持剑起舞，剑光如匹练流转，凌厉中不失飘逸。她见你到来，剑势一顿。",
    locationId: "emei",
    choices: [
      {
        id: "challenge",
        text: "请教剑术",
        description: "主动请缨，与女子切磋一番。",
        resolve: (player) => ({
          text: "女子也不推辞，拔剑与你过招。数招之后她收剑而笑，指点了你两式，你的剑理大有长进。",
          player: { ...player, attack: player.attack + 2, reputation: player.reputation + 1 },
          consumeDay: true,
        }),
      },
      {
        id: "watch-leave",
        text: "驻足欣赏",
        description: "静静看她舞完一曲，悄然离去。",
        resolve: (player) => ({ text: "你静静看完那一套剑法，女子舞毕朝你微微颔首。你心有所悟。", player: { ...player, aptitude: Math.min(99, player.aptitude + 2) }, consumeDay: true }),
      },
    ],
  },
  {
    id: "xingxiu-poison",
    title: "星宿毒沼",
    summary: "星宿海毒雾弥漫，一个阴恻恻的声音传来。",
    intro: "你深入星宿海，脚下毒沼冒泡，空气腥臭。一个阴恻恻的声音从雾中传来：嘿嘿，胆敢擅闯星宿海，留下命来！",
    locationId: "xingxiu",
    choices: [
      {
        id: "fight",
        text: "迎战毒物",
        description: "拔兵刃与星宿派妖人对峙。",
        resolve: (player) => ({ text: "你怒喝一声，迎向那阴毒的星宿派人！", player, startBattle: true, enemyId: "duyaozi", consumeDay: true }),
      },
      {
        id: "retreat",
        text: "屏息退走",
        description: "毒沼险地，不宜久留。",
        resolve: (player) => ({ text: "你以袖掩鼻，趁着毒雾稀薄时迅速退走，侥幸未被毒气所伤。", player: { ...player, mp: Math.max(0, player.mp - 8) }, consumeDay: true }),
      },
    ],
  },
  {
    id: "damos-eagle",
    title: "大漠射雕",
    summary: "大漠之上，一只巨雕掠过天际，似在追逐什么。",
    intro: "你在大漠中独行，忽见一只硕大无比的白雕自天际俯冲而下，爪下似抓着什么东西。它在你头顶盘旋，发出嘹亮的鸣叫。",
    locationId: "damos",
    choices: [
      {
        id: "track",
        text: "追踪神雕",
        description: "跟着白雕的方向走，看看有什么。",
        resolve: (player) => ({
          text: "你追随白雕走了许久，在一处沙丘后发现一具前人遗骸，身旁散落着银两与一卷残破地图。",
          player: grantItem({ ...player, gold: player.gold + 60, reputation: player.reputation + 2 }, "field-ration", 1),
          consumeDay: true,
        }),
      },
      {
        id: "watch-sky",
        text: "仰望神雕",
        description: "看那白雕翱翔，感叹天地辽阔。",
        resolve: (player) => ({ text: "白雕振翅高飞，消失在天际。你只觉胸中豪气顿生，气血运行也更为顺畅。", player: { ...player, hp: Math.min(player.hpMax, player.hp + 20), reputation: player.reputation + 1 }, consumeDay: true }),
      },
    ],
  },
  {
    id: "xiling-palace",
    title: "灵鹫宫下",
    summary: "雪山脚下，一道石阶蜿蜒向上，通往云中宫阙。",
    intro: "你来到西夏雪山脚下，抬头望去，一道长长的石阶没入云端，据说顶端便是那神秘的灵鹫宫。石阶旁立着一块石碑，上书非缘者勿登。",
    locationId: "xiling",
    choices: [
      {
        id: "climb",
        text: "拾级而上",
        description: "既是机缘，不妨一试。",
        resolve: (player) => ({
          text: "你咬牙攀上石阶，虽未能入宫，却在半山亭中悟得一段奇门步法，身法大进。",
          player: { ...player, speed: player.speed + 3, aptitude: Math.min(99, player.aptitude + 1) },
          consumeDay: true,
        }),
      },
      {
        id: "admire",
        text: "远观赞叹",
        description: "雪山高寒，量力而行。",
        resolve: (player) => ({ text: "你在山脚仰望良久，叹造化之奇，遂转身离去，心中却已种下一颗武学之念。", player: { ...player, reputation: player.reputation + 1 }, consumeDay: true }),
      },
    ],
  },
  {
    id: "baituo-snake",
    title: "白驼蛇阵",
    summary: "白驼山庄外，群蛇结阵，一阵阴笑传来。",
    intro: "你靠近白驼山庄，只见庄外密密麻麻盘踞着无数毒蛇，结成一个诡异的蛇阵。庄门内传来一阵阴恻恻的笑声：既来白驼山，便留下做蛇饵吧！",
    locationId: "baituo",
    choices: [
      {
        id: "break-array",
        text: "强破蛇阵",
        description: "运起内力，硬闯白驼山庄。",
        resolve: (player) => ({ text: "你大喝一声冲入蛇阵，蛇群受惊四散，一名白驼山弟子拦住去路！", player, startBattle: true, enemyId: "ouyangfeng", consumeDay: true }),
      },
      {
        id: "detour",
        text: "绕道而行",
        description: "蛇阵难破，先退再说。",
        resolve: (player) => ({ text: "你见蛇阵诡异难破，明智地选择绕道。虽未得见西毒，却保全了性命。", player: { ...player, reputation: player.reputation + 1 }, consumeDay: true }),
      },
    ],
  },
  {
    id: "mingjiao-fire",
    title: "圣火之下",
    summary: "光明顶圣火熊熊，明教群豪正集结议事。",
    intro: "你登上光明顶，圣火在夜风中猎猎作响。明教群豪齐聚，似有大事商议。有人察觉到你的到来，齐刷刷望向你。",
    locationId: "mingjiao",
    choices: [
      {
        id: "parley",
        text: "坦然相见",
        description: "既然被发现了，索性以礼相待。",
        resolve: (player) => ({
          text: "你坦然上前，明教中人见你气度不凡，竟未为难。一番交谈后，你对他们乾坤大挪移的思路略有领悟。",
          player: { ...player, aptitude: Math.min(99, player.aptitude + 2), reputation: player.reputation + 2 },
          consumeDay: true,
        }),
      },
      {
        id: "flee",
        text: "悄然退走",
        description: "明教势大，不宜招惹。",
        resolve: (player) => ({ text: "你借着夜色悄然退下光明顶，虽错过了一场机缘，却避免了正面冲突。", player, consumeDay: true }),
      },
    ],
  },
  {
    id: "taohua-array",
    title: "桃花迷阵",
    summary: "桃花岛上，桃树看似随意栽种，却暗藏奇门阵法。",
    intro: "你在桃花岛桃林中穿行，看似寻常的桃树，走几步却发现景物全变——分明是奇门遁甲的大阵。四下桃花纷飞，你已辨不清方向。",
    locationId: "taohuadao",
    choices: [
      {
        id: "break-array",
        text: "以武破阵",
        description: "不信邪，强行闯阵。",
        resolve: (player) => ({
          text: "你运功强行闯阵，虽狼狈闯出，却在反复周折中参透了些许步法，身法精进。",
          player: { ...player, speed: player.speed + 2, mp: Math.max(0, player.mp - 15) },
          consumeDay: true,
        }),
      },
      {
        id: "wait",
        text: "静心等候",
        description: "乱动不如不动，以静制动。",
        resolve: (player) => ({ text: "你盘膝静坐，任桃花纷飞。许久之后，风向忽变，阵眼自现，你从容走出。心境大为提升。", player: { ...player, hp: Math.min(player.hpMax, player.hp + 25), aptitude: Math.min(99, player.aptitude + 1) }, consumeDay: true }),
      },
    ],
  },
  {
    id: "dali-temple",
    title: "天龙寺外",
    summary: "大理天龙寺钟声悠扬，一位老僧正在寺门外扫地。",
    intro: "你来到大理天龙寺外，一位灰衣老僧正在扫地。他抬眼看你，目光温和却深邃：施主指法已有根基，可愿入寺一叙？",
    locationId: "dali",
    choices: [
      {
        id: "learn",
        text: "求教指法",
        description: "段氏指法天下闻名，机不可失。",
        resolve: (player) => ({
          text: "老僧引你入寺，点拨你一阳指的入门要诀。你虽未能尽悟，指尖已隐隐有了几分指力。",
          player: { ...player, attack: player.attack + 3, aptitude: Math.min(99, player.aptitude + 1) },
          consumeDay: true,
        }),
      },
      {
        id: "respect",
        text: "合十致敬",
        description: "佛门清净，不便叨扰。",
        resolve: (player) => ({ text: "你双手合十还礼，老僧微笑点头。临别时他赠你一串佛珠，似有安神之效。", player: grantItem({ ...player, mp: Math.min(player.mpMax, player.mp + 20) }, "small-mp-pill", 1) }),
      },
    ],
  },
]

export function getRandomStoryEvent(player: Player): StoryEvent {
  const ALL_EVENTS = [...STORY_EVENTS, ...STORY_VOLUMES]
  const available = ALL_EVENTS.filter((event) => (event.condition ? event.condition(player) : true))
  const pool = available.length > 0 ? available : ALL_EVENTS
  const weighted = pool.flatMap((event) => Array(event.weight ?? 1).fill(event))
  const chosen = weighted[Math.floor(Math.random() * weighted.length)]
  return chosen
}

// 按 id 取事件（调试/强制触发用）
export function getStoryEventById(id: string): StoryEvent | undefined {
  return [...STORY_EVENTS, ...STORY_VOLUMES].find((event) => event.id === id)
}

// 按地点取事件：优先返回该地点的专属剧情事件（满足 condition 才触发），
// 否则回退到全局随机事件。这样"去牛家村"稳定触发风雪惊变，去其他地点仍可遇奇遇。
export function getStoryEventByLocation(player: Player, locationEvents: string[]): StoryEvent {
  for (const eventId of locationEvents) {
    const event = getStoryEventById(eventId)
    if (event && (!event.condition || event.condition(player))) {
      return event
    }
  }
  return getRandomStoryEvent(player)
}

export function getAdventureEnemy(player: Player, enemyId?: string, locationPool?: string[]) {
  if (enemyId) return getEnemyById(enemyId)
  if (locationPool && locationPool.length > 0) return getRandomEnemyFromPool(player, locationPool)
  return getRandomEnemy(player)
}
