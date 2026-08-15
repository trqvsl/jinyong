import type { StoryEvent } from "./story/schema"

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
      text: "你沿山道前行，忽见几个地痞围住行脚商人。那商人背靠山石，已经退无可退。",
      choices: [
        { id: "intervene", text: "拔刀相助", description: "挺身而出，直接与恶徒交手。",
          consumeDay: true, resultText: "你走到商人身前，按住其中一名地痞伸向货箱的手。地痞甩开胳膊，招呼同伴围了上来。",
          transition: { type: "battle", useLocationPool: true,
            onWin: { text: "几名地痞被逼退到山道下方，再不敢靠近货箱。行脚商人重新捆好散开的包裹，把一袋碎银和一瓶伤药塞到你手里。", consequences: [{ kind: "gold", delta: 25 }, { kind: "reputation", delta: 3 }, { kind: "item", id: "small-hp-pill", count: 1 }], then: { type: "end" } },
            onLose: { text: "你被几人围住，肩背接连挨了数下。商人趁乱背起货箱逃开，地痞见追不上他，也很快散入山林。", then: { type: "end" } },
            onFlee: { text: "你见对方人多，虚晃一招抽身而退，商人那头的纷争已无力顾及。", then: { type: "end" } },
          } },
        { id: "observe", text: "静观其变", description: "不贸然出手，先判断局势。",
          consequences: [{ kind: "reputation", delta: 1 }], consumeDay: true,
          resultText: "你绕到高处看清几人的相貌与去向。商人趁其中两人争抢货物时钻进岔路，那伙地痞追错方向，很快消失在林后。",
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
          resultText: "你只取了两块干粮，又在破香炉中点上一炷香。雨停后，荒祠里积下的潮气也散了些。",
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
          resultText: "残页上画着七处落脚方位。你照图在林中反复腾挪，直到能一口气踏过三块山石，才把纸页收好。",
          transition: { type: "end" } },
        { id: "memorize", text: "抄下要点离开", description: "不强求立刻参透，先把关键句抄进册页。",
          consequences: [{ kind: "mp", delta: 22 }, { kind: "aptitude", delta: 1 }], consumeDay: true,
          resultText: "你抄下残页中的换气次序，照着运转一个周天。原本滞在肩背的一口气，顺着经脉沉回丹田。",
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
      text: "你在茶摊歇脚时，一名行脚商人把货担放到桌边。他指了指前方山道。行脚商人：\"昨夜有三拨人被劫。少侠若同路，我愿出五十两护送到下个驿站。\"",
      choices: [
        { id: "accept", text: "接下委托", description: "护送商人走一段山路，赚一笔辛苦钱。",
          consequences: [{ kind: "gold", delta: 55 }, { kind: "reputation", delta: 1 }, { kind: "item", id: "small-hp-pill", count: 1 }], consumeDay: true,
          resultText: "你护着商人穿过山道，途中两次发现林中有人盯梢。到了驿站，商人当面点清银两，又添送一瓶伤药。",
          transition: { type: "end" } },
        { id: "decline", text: "婉言谢绝", description: "你还有别的安排，不想被委托束住脚步。",
          consumeDay: true, resultText: "你说明另有去处，抱拳告辞。商人只得留下继续等人，临走前仍提醒你前方岔路不要独行。",
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
          resultText: "你和衣躺下，三更时果然有人撬动门闩。你先一步撞开窗户，又从后院截住正在转移赃物的伙计，取回了几名住客被偷的银袋。",
          transition: { type: "end" } },
        { id: "leave-now", text: "转身离去", description: "宁可连夜赶路，也不住这间古怪小店。",
          consequences: [{ kind: "mp", delta: -8 }, { kind: "reputation", delta: 1 }], consumeDay: true,
          resultText: "你没有停留，摸黑赶出五里。回头时，那盏红灯已经熄灭，官道上却多了两匹从客栈方向追来的马。",
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
      text: "老人抬眼看了你一会儿。老人：\"你气息尚浅，却也有几分骨气。可愿听老夫一言？\"",
      choices: [
        { id: "listen", text: "虚心求教", description: "停下脚步，认真听前辈指点呼吸与出招。",
          consequences: [{ kind: "attack", delta: 1 }, { kind: "speed", delta: 1 }, { kind: "reputation", delta: 1 }], consumeDay: true,
          resultText: "老人让你把惯用招式打了一遍，随后用树枝点出肩、腰、膝三处发力错误。你照着重练，出招时少了两次停顿。",
          transition: { type: "end" } },
        { id: "bow-leave", text: "抱拳告辞", description: "礼数周全地退下，不打扰前辈清修。",
          consequences: [{ kind: "hp", delta: 20 }, { kind: "item", id: "small-mp-pill", count: 1 }], consumeDay: true,
          resultText: "老人并未怪罪，只把一枚药丸抛到你手中。老人：\"赶路前先把伤养好。礼数周全，身子却不能靠礼数撑着。\"",
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
        text: "骰盅揭开，你押中的点数正好胜出。庄家数出五十两放到桌前，催着你再押一局。",
        onEnter: [{ kind: "gold", delta: 50 }],
        autoNext: { type: "end" },
      },
      lose: {
        id: "lose",
        text: "骰盅揭开，点数与所押差了一门。庄家收走碎银，立刻招呼下一位赌客落座。",
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
      text: "一名佩着门派腰牌的弟子在驿站张贴山门告示。他见你带着兵刃，便递来一份各派收徒时日。传讯弟子：\"若有意学艺，可以先问。免得走错山门，白费脚力。\"",
      choices: [
        { id: "ask-sects", text: "多问两句", description: "趁机了解各门各派的风格与路数。",
          consequences: [{ kind: "reputation", delta: 1 }, { kind: "aptitude", delta: 1 }], consumeDay: true,
          resultText: "那弟子把少林、全真、丐帮等派的收徒规矩逐一说清，还在路引上圈出几处山门。你把各派擅长与门槛一并记下。",
          transition: { type: "end" } },
        { id: "hurry-on", text: "继续赶路", description: "你暂时无意停留，决定等时机成熟再说。",
          consumeDay: true, resultText: "你谢过传讯弟子，收下那份山门路引继续赶路。",
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
      text: "你走进临安城一家热闹的茶楼，角落里几名佩刀汉子正凑在一处说话。见你走近，他们立刻住了口。",
      choices: [
        { id: "ask", text: "旁敲侧击", description: "买壶茶坐近，装作闲聊试探消息。",
          consequences: [{ kind: "reputation", delta: 1 }, { kind: "aptitude", delta: 1 }], consumeDay: true,
          resultText: "你买壶茶坐到邻桌，听见几人提到城外废寺与一张残缺藏宝图。散席后，其中一人把写着地点的纸角落在桌下。",
          transition: { type: "end" } },
        { id: "ignore", text: "独自饮茶", description: "不招惹是非，安心歇脚。",
          consequences: [{ kind: "hp", delta: 15 }, { kind: "item", id: "field-ration", count: 1 }],
          resultText: "你另选窗边坐下，把茶与干粮吃完。那几名佩刀汉子不久便结账离开，茶楼重新热闹起来。",
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
      text: "华灯初上，临安夜市人潮涌动。一名白须老者拦住你，上下打量了一眼。老者：\"阁下印堂发亮，近来恐有大机缘。\"",
      choices: [
        { id: "hear-fortune", text: "听他一卦", description: "花些银两听听这老者的玄话。",
          consequences: [{ kind: "gold", delta: -20 }, { kind: "reputation", delta: 1 }], consumeDay: true,
          resultText: "老者收下银钱，在纸上写了“福至心灵”四字，又特意圈住城南方向。你再抬头时，他已经挤进夜市人群。",
          transition: { type: "end" } },
        { id: "walk-on", text: "摇头走开", description: "江湖骗子多，不凑这热闹。",
          consumeDay: true, resultText: "你绕过老者继续往前。没走多远，便听见他用同样的话拦住了下一名客人。",
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
      text: "你来到少林寺藏经阁外，一名小沙弥正低头扫地。他抬眼看了看你。小沙弥：\"施主可愿听贫僧一言？\"",
      choices: [
        { id: "listen", text: "倾听相询", description: "停下脚步，听小沙弥说些什么。",
          consequences: [{ kind: "mp", delta: 25 }, { kind: "aptitude", delta: 1 }], consumeDay: true,
          resultText: "小沙弥领你到回廊外坐下。阁内正有两名老僧讲解吐纳，你依着钟声调整呼吸，半个时辰后才起身。",
          transition: { type: "end" } },
        { id: "bow-leave", text: "合十告辞", description: "佛门清净，不打扰修行。",
          consequences: [{ kind: "hp", delta: 12 }], consumeDay: true,
          resultText: "你双手合十还礼。小沙弥送你到山门，又递来一碗温热药茶，供你下山前饮用。",
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
          resultText: "你在侧峰看完二十余招，记下几次借山风变向的步法。两名高手收剑后，你也沿着同一段险石试走了一遍。",
          transition: { type: "end" } },
        { id: "descend", text: "悄然下山", description: "高手过招非同小可，不冒险逗留。",
          consumeDay: true, resultText: "你没有靠近交手之处，沿原路下山。片刻后，峰上传来巨响，一块被剑气削断的山石滚过方才立足的位置。",
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
          resultText: "女子抱剑应下，与你拆了十余招。她在你第三次重复同一破绽时收剑，用剑鞘点了点手腕。青衣女子：\"剑尖先露，后招便藏不住。再来。\"",
          transition: { type: "end" } },
        { id: "watch-leave", text: "驻足欣赏", description: "静静看她舞完一曲，悄然离去。",
          consequences: [{ kind: "aptitude", delta: 2 }], consumeDay: true,
          resultText: "你站在石阶外看完一套剑法，记下她每次转腕时的脚步。女子收剑后向你颔首，你也在空地上照着试了两遍。",
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
      text: "你深入星宿海，脚下毒沼不断冒泡。雾中有人摇响铜铃，四周蛇虫立刻向路中聚拢。星宿弟子：\"进了星宿海还想走？把药囊和银子留下！\"",
      choices: [
        { id: "fight", text: "迎战毒物", description: "拔兵刃与星宿派妖人对峙。",
          consumeDay: true, resultText: "你封住口鼻，拔出兵刃踏上沼中石块。星宿弟子摇铃后退，蛇群已经先扑上来。",
          transition: { type: "battle", enemyId: "duyaozi",
            onWin: { text: "你震开蛇群，又把摇铃的星宿弟子打落石台。他扔下解毒药与钱袋，踩着泥水逃入浓雾。", consequences: [{ kind: "gold", delta: 35 }, { kind: "reputation", delta: 3 }, { kind: "item", id: "small-hp-pill", count: 2 }], then: { type: "end" } },
            onLose: { text: "毒雾侵入经脉，你的手脚很快发麻。星宿弟子见你退入深水，也没有继续追赶。你沿来路爬出毒沼，衣袖已经被毒水蚀穿。", then: { type: "end" } },
            onFlee: { text: "你忌惮毒沼瘴气，不愿硬拼，屏息退出了星宿海。", then: { type: "end" } },
          } },
        { id: "retreat", text: "屏息退走", description: "毒沼险地，不宜久留。",
          consequences: [{ kind: "mp", delta: -8 }], consumeDay: true,
          resultText: "你以湿布掩住口鼻，沿上风处退回干地。雾中铜铃追了一阵，最终停在沼泽边缘。",
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
          resultText: "白雕迎着风盘旋上升。你照着它借风转向的节奏调整呼吸，直到那道白影越过远处山脊。",
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
          resultText: "你一路攀到半山亭，宫门仍在云层之上。亭柱上刻着一组换步图，你照着在雪地试走，落脚比上山时轻了许多。",
          transition: { type: "end" } },
        { id: "admire", text: "远观赞叹", description: "雪山高寒，量力而行。",
          consequences: [{ kind: "reputation", delta: 1 }], consumeDay: true,
          resultText: "你在山脚仰望良久，雪线上的石阶一直没入云里。站够了，才拢紧衣襟转身下山。",
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
      text: "你靠近白驼山庄，庄外蛇群正随竹哨声分开又合拢。门内有人隔墙开口。白驼弟子：\"没有令牌也敢上山。留下药囊，我便让蛇群给你留条路。\"",
      choices: [
        { id: "break-array", text: "强破蛇阵", description: "运起内力，硬闯白驼山庄。",
          consumeDay: true, resultText: "你用内力震开最前方的蛇群，踏进阵中。竹哨声立刻变急，一名白驼弟子从庄门后跃出。",
          transition: { type: "battle", enemyId: "ouyangfeng",
            onWin: { text: "你把白驼弟子的竹哨击落，蛇群随即散开。他退回庄门时丢下钱袋与两瓶蛇药。", consequences: [{ kind: "gold", delta: 45 }, { kind: "reputation", delta: 4 }, { kind: "item", id: "small-mp-pill", count: 2 }], then: { type: "end" } },
            onLose: { text: "白驼弟子以蛇杖封住退路，蛇群也从两侧围拢。你撞开一处缺口退下山道，手臂与小腿已留下数道伤口。", then: { type: "end" } },
            onFlee: { text: "你见蛇阵难破、强敌在后，当机立断绕道退走，未与白驼山弟子正面交锋。", then: { type: "end" } },
          } },
        { id: "detour", text: "绕道而行", description: "蛇阵难破，先退再说。",
          consequences: [{ kind: "reputation", delta: 1 }], consumeDay: true,
          resultText: "你没有踏入蛇阵，沿山脚绕向另一条路。竹哨声跟了半里，蛇群却始终没有离开庄门范围。",
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
          resultText: "你解下兵刃放在石阶前，报明来意。明教弟子查过路引后让出道路，又在殿外与你谈了几种借力转劲的法门。",
          transition: { type: "end" } },
        { id: "flee", text: "悄然退走", description: "明教势大，不宜招惹。",
          consumeDay: true, resultText: "你趁众人尚未合围，沿来路退出光明顶。两名守卫追到石阶前，见你已放下兵刃，便没有继续追赶。",
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
          resultText: "你折下几枝挡路桃木，强行穿过阵势。走出桃林时鞋上满是泥，回头看去，却也记住了几处反复出现的石位。",
          transition: { type: "end" } },
        { id: "wait", text: "静心等候", description: "乱动不如不动，以静制动。",
          consequences: [{ kind: "hp", delta: 25 }, { kind: "aptitude", delta: 1 }], consumeDay: true,
          resultText: "你在原地坐下，等日影与风向变化。午后，几处重叠树影终于错开，你顺着露出的石径走出桃林。",
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
      text: "你来到大理天龙寺外，一位灰衣老僧正在扫地。他看了看你握兵刃的手。灰衣老僧：\"施主指上已有发力旧痕。若不嫌寺中茶淡，可入内试两招。\"",
      choices: [
        { id: "learn", text: "求教指法", description: "段氏指法天下闻名，机不可失。",
          consequences: [{ kind: "attack", delta: 3 }, { kind: "aptitude", delta: 1 }], consumeDay: true,
          resultText: "老僧引你到偏殿，以木鱼作靶，纠正你屈指与送腕的次序。离寺前，你已经能隔着半尺震动木鱼槌。",
          transition: { type: "end" } },
        { id: "respect", text: "合十致敬", description: "佛门清净，不便叨扰。",
          consequences: [{ kind: "mp", delta: 20 }, { kind: "item", id: "small-mp-pill", count: 1 }],
          resultText: "你双手合十还礼。老僧从袖中取出一串旧佛珠，让你在行功岔气时按珠调息。",
          transition: { type: "end" } },
      ],
    } },
  },
]

// ============================================================
// 查询函数
