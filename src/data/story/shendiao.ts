import type { StoryEvent } from "../events"

// ============================================================
// 射雕英雄传 · 剧情卷（声明式）
// 按原著脉络的8个关键节点，主角作为"穿越者"介入原著故事。
// 因果串联：每个节点的 condition 检查前一个节点的 arcBeat，
// 确保玩家按序体验。设计见《剧情系统设计手册.md》。
// ============================================================

export const SHENDIAO_STORY: StoryEvent[] = [
  // ===== 1. 牛家村·风雪惊变（连续第一幕 opening） =====
  {
    id: "shendiao-niujia-opening",
    entryNode: "main",
    locationId: "niujia",
    weight: 8,
    once: true,
    condition: {
      kind: "and",
      items: [
        { kind: "not", item: { kind: "arcBeat", arcId: "shendiao", beat: "niujia" } },
        {
          kind: "not",
          item: {
            kind: "or",
            items: [
              { kind: "flag", name: "shendiao.niujia.heard_tavern", eq: true },
              { kind: "flag", name: "shendiao.niujia.met_baoxiruo", eq: true },
              { kind: "flag", name: "shendiao.niujia.opposed_rescue", eq: true },
              { kind: "flag", name: "shendiao.niujia.helped_wanyan", eq: true },
              { kind: "flag", name: "shendiao.niujia.observed_wanyan", eq: true },
              { kind: "flag", name: "shendiao.niujia.accepted_wanyan", eq: true },
              { kind: "flag", name: "shendiao.niujia.fake_accept_wanyan", eq: true },
              { kind: "flag", name: "shendiao.niujia.rejected_wanyan", eq: true },
            ],
          },
        },
      ],
    },
    nodes: {
      main: {
        id: "main",
        title: "风雪牛家村",
        text: "风雪压着村路。村头酒馆里灯火未灭，窗纸被火光映得发黄，里头不时传出酒碗碰桌的脆响。两个汉子正与一个道人对饮，一个使枪，一个使戟，桌边还横着兵刃。偶有村民从街口匆匆走过，抬头望见酒馆里的影子，又赶紧低头绕开。你立在檐下拍去肩头积雪，鼻端尽是冷风、酒气与柴火味，先得决定今晚怎么落脚。",
        choices: [
          {
            id: "hear-tavern",
            text: "窗外偷听",
            description: "先不露面，在窗外听听这几人说些什么。",
            consumeDay: true,
            consequences: [
              { kind: "flag", name: "shendiao.niujia.heard_tavern", value: true },
            ],
            resultText: "你伏在窗外听了好一阵。屋里先是酒碗一碰，接着便听那道人自称丘处机；两个汉子一个姓郭、一个姓杨，说到兴起时还提起家中将有孩子。你越听越觉得，这村里今晚不会只是喝酒叙旧这么简单。雪落得更密了，你却没再急着离开。",
            transition: { type: "goto", nodeId: "wait-righteous" },
          },
          {
            id: "stay-baoxiruo",
            text: "借宿农家",
            description: "不去酒馆，先在村里找户人家借宿。",
            consumeDay: true,
            consequences: [
              { kind: "flag", name: "shendiao.niujia.met_baoxiruo", value: true },
            ],
            resultText: "你避开酒馆，沿村道拍了几家门，最后才敲开这一户。开门的是个眉目温柔的妇人，她先隔着门缝看了你一眼，见你浑身落雪，这才把你让进屋里。屋中陈设简朴，却收拾得极净，炭火、热水、旧桌椅都摆得仔细，像是有人正硬撑着把日子一寸寸护住。",
            transition: { type: "goto", nodeId: "lodging-night" },
          },
          {
            id: "leave-now",
            text: "连夜离村",
            description: "这村子气氛不对，趁雪色还深，先离开再说。",
            consumeDay: true,
            resultText: "你没有进酒馆，也没有敲开谁家的门，只把斗笠往下一压，踏着积雪掉头离村。风从耳边削过去，身后的灯火一点点缩成雪夜里的昏黄光斑。你走出一段路后还回头看了一眼，那点光仍在风雪里晃，却已经和你没什么关系了。",
            transition: { type: "goto", nodeId: "leave-end" },
          },
        ],
      },
      "lodging-night": {
        id: "lodging-night",
        title: "雪夜更深",
        text: "夜半风雪更紧，屋外风声拍得门板发颤。柴房那边忽然传来一阵压得极低的轻响，像是谁正忍着疼倒抽凉气。你循声推门望去，只见借你留宿的妇人正借着油灯替一个受伤武士包扎伤口。那人衣甲残破，靴边还带着冻硬的泥雪，口音却不像宋人。妇人抬头看了你一眼，手上没停。包惜弱：\"人都伤成这样了，总不能看着他死。\"",
        autoNext: { type: "goto", nodeId: "rescue" },
      },
      rescue: {
        id: "rescue",
        title: "雪夜救伤",
        text: "柴房里药味、血腥味和炭火气混在一处，熏得人鼻端发闷。伤者半倚在草堆边，嘴唇发白，却还硬撑着不肯昏死过去。包惜弱把药布一层层缠好，动作并不快，却稳得很，像是已经打定主意要把这条命先从雪夜里拽回来。她既没有求你帮手，也没有催你离开，只把这件事摆在你眼前，让你自己决定要不要卷进去。",
        choices: [
          {
            id: "oppose-rescue",
            text: "劝她别救",
            description: "此人来路不正，何必为了他惹祸上身。",
            consumeDay: true,
            consequences: [
              { kind: "flag", name: "shendiao.niujia.opposed_rescue", value: true },
            ],
            resultText: "你压低声音劝她收手，说此人来路不正，何苦为了个陌生伤者把自己也搭进去。包惜弱听完只顿了一下，随即仍把药布一层层缠上去，又伸手把灯火拨亮了些。她没有和你争辩，只是那副神色已经说明——今夜她是一定要救这个人的。",
            transition: { type: "goto", nodeId: "wait-righteous" },
          },
          {
            id: "help-rescue",
            text: "帮她救人",
            description: "不多问，先替这人止血换药再说。",
            consumeDay: true,
            consequences: [
              { kind: "factionAttitude", factionId: "jin", delta: 10 },
              { kind: "flag", name: "shendiao.niujia.helped_wanyan", value: true },
            ],
            resultText: "你挽起袖口上前搭手，替那人止血、换药、压住伤处。包惜弱原本一人忙得额上见汗，这时才终于能松口气，低声让你把热水递过去。那伤者虽仍昏沉，眼皮却微微动了动，像是把油灯、风雪和你俯身时的模样，全都记进了心里。",
            transition: { type: "goto", nodeId: "wait-jin" },
          },
          {
            id: "observe-rescue",
            text: "暗中观察",
            description: "不直接帮，也不直接阻止，先看清这人到底是什么来路。",
            consumeDay: true,
            consequences: [
              { kind: "flag", name: "shendiao.niujia.observed_wanyan", value: true },
            ],
            resultText: "你退到灯影照不到的地方，没有上前，也没有出声阻止，只借着昏黄灯火把那人看得更仔细些。那人虽然伤重，手指却仍压着刀柄不放，眉眼间也透着一股寻常军士少见的沉稳贵气。你看在眼里，知道这绝不是个普通的落难武夫。",
            transition: { type: "goto", nodeId: "wait-jin" },
          },
        ],
      },
      "wait-righteous": {
        id: "wait-righteous",
        title: "几日之后",
        text: "你没有立刻离开牛家村。风雪一连下了几日，村里人越发沉默，白天街上几乎没人多说一句话，到了傍晚却总有人朝村口那边多看两眼。酒馆里的低语断断续续飘到街面上，像是谁在等、又像是谁在怕。第五夜子时刚过，远处忽然响起一阵急促马蹄声，先是一骑，接着便是成片雪地被踏碎的闷响。",
        autoNext: { type: "goto", nodeId: "raid-righteous" },
      },
      "wait-jin": {
        id: "wait-jin",
        title: "几日之后",
        text: "过了数日，那个受伤的金人已经能起身。他没有立刻亮明身份，只让亲随把你请去一处偏屋。屋里火盆很旺，他披着狐裘坐着，看你时既像试探，也像施恩。",
        autoNext: { type: "goto", nodeId: "recruit" },
      },
      recruit: {
        id: "recruit",
        title: "完颜洪烈伤愈招揽",
        text: "那金人看着你，语气平缓。完颜洪烈：\"那夜你救我一命。我不喜欢欠人情。你若肯替我办件小事，以后荣华富贵，未必没有。\" 这时你已知道，这不再只是雪夜里随手救下一个伤者那么简单。",
        choices: [
          {
            id: "accept-offer",
            text: "接下差事",
            description: "先替他办一次事，看看这条路能通到哪里。",
            consumeDay: true,
            consequences: [
              { kind: "factionAttitude", factionId: "jin", delta: 15 },
              { kind: "flag", name: "shendiao.niujia.accepted_wanyan", value: true },
            ],
            resultText: "你没有多问，只应下了这桩差事。完颜洪烈点了点头，像是终于看清你值不值得收进手里。你也知道，自己已经踩进了这条线。",
            transition: { type: "goto", nodeId: "raid-jin-bridge" },
          },
          {
            id: "fake-accept-offer",
            text: "表面答应",
            description: "先把这层关系留着，看看他究竟想让你做什么。",
            consumeDay: true,
            consequences: [
              { kind: "factionAttitude", factionId: "jin", delta: 5 },
              { kind: "flag", name: "shendiao.niujia.fake_accept_wanyan", value: true },
            ],
            resultText: "你嘴上应得平静，心里却还留着分寸。完颜洪烈并不追问，只像看见一把暂时还未出鞘的刀。你把这层关系先留了下来。",
            transition: { type: "goto", nodeId: "raid-jin-bridge" },
          },
          {
            id: "reject-offer",
            text: "推辞不掺和",
            description: "这人情你认，但这条路你不想走。",
            consumeDay: true,
            consequences: [
              { kind: "flag", name: "shendiao.niujia.rejected_wanyan", value: true },
            ],
            resultText: "你谢过他的好意，却把这份招揽轻轻推了回去。完颜洪烈没有翻脸，只是目光深了几分，像是把你重新放回了可用、却未必可信的位置。",
            transition: { type: "goto", nodeId: "wait-righteous" },
          },
        ],
      },
      "raid-jin-bridge": {
        id: "raid-jin-bridge",
        title: "又过数日",
        text: "又过了几日，你跟着官军回到牛家村。雪夜里火把一圈圈铺开，领头军官喝令搜拿郭杨两家。你认得这村口，也认得今晚会被翻出来的人。到这一步，已经没人能替你决定该站在哪边。",
        autoNext: { type: "goto", nodeId: "raid-jin" },
      },
      "raid-righteous": {
        id: "raid-righteous",
        title: "官兵围村",
        text: "半夜马蹄踏碎雪地，官兵举火把围住牛家村。村口先是一阵犬吠，紧接着便有人高喊捉拿钦犯，几户人家接连亮灯，又很快传出摔门、哭喊和翻箱倒柜的声音。郭啸天已经提兵刃冲出院门。郭啸天：\"狗官兵，冲我来！\" 李萍也被惊醒，扶着门框站不太稳，却还强撑着往外看。巷口火把一晃，几名官兵已经朝这边压了过来。",
        choices: [
          {
            id: "help-guoxiao",
            text: "挡阵迎敌",
            description: "冲出去帮郭啸天挡一阵，先把这一夜顶过去。",
            consumeDay: true,
            resultText: "郭啸天侧身让开一步，长枪一抖，枪尖已抢在火把影里点出一串寒光。冲在最前头的官兵还没站稳，后头的人已经破口大骂着一齐扑了上来，雪地里刀刃跟着亮成一片。",
            transition: {
              type: "battle", enemyId: "guanjun",
              onWin: {
                text: "一波官军被逼退到巷口，雪地里总算腾出一线空当。郭啸天提枪回身，还没来得及喘匀气，已经先朝李萍那边喝了一声：\"快走！别回头！\" 官军虽退了一阵，村里的乱声却一点没停。",
                consequences: [
                  { kind: "karma", delta: 5 },
                  { kind: "reputation", delta: 4 },
                  { kind: "arcBeat", arcId: "shendiao", beat: "niujia", result: "won" },
                ],
                then: { type: "goto", nodeId: "close-won" },
              },
              onLose: {
                text: "雪地已经被踩成一片泥水。官兵从巷口又压了上来，火把和喊杀声重新把院门口堵得严严实实，郭啸天那杆枪也被逼得一步步往后收。",
                consequences: [
                  { kind: "arcBeat", arcId: "shendiao", beat: "niujia", result: "lost" },
                ],
                then: { type: "goto", nodeId: "close-lost" },
              },
              onFlee: {
                text: "火把顺着巷子一路逼过来，连雪地里的脚印都照得发亮。官兵越压越近，刀枪已经挤到院门口前，郭啸天也只得提枪硬挡，再没有多余空当。",
                consequences: [
                  { kind: "arcBeat", arcId: "shendiao", beat: "niujia", result: "skipped" },
                ],
                then: { type: "goto", nodeId: "close-skipped" },
              },
            },
          },
          {
            id: "save-liping",
            text: "护李萍撤离",
            description: "先护着李萍和村里妇孺一起撤出村口。",
            consumeDay: true,
            consequences: [
              { kind: "relation", npcId: "guojing", delta: 10 },
              { kind: "flag", name: "shendiao.niujia.saved_liping", value: true },
              { kind: "arcBeat", arcId: "shendiao", beat: "niujia", result: "done" },
            ],
            resultText: "李萍一手护着肚腹，一手死死抓着门框，咬牙道：\"郭大哥还在里头！\" 巷口那边火把已经越逼越近，几名妇孺也被哭声惊得乱作一团。后路总算还没被封死，再慢片刻，谁也走不脱。",

            transition: { type: "goto", nodeId: "close-done" },
          },
          {
            id: "hide-away",
            text: "藏身避祸",
            description: "先保住自己，等这阵兵过去再说。",
            consumeDay: true,
            consequences: [
              { kind: "reputation", delta: -1 },
              { kind: "arcBeat", arcId: "shendiao", beat: "niujia", result: "skipped" },
            ],
            resultText: "门板刚一掩上，巷子里的火把便从缝外一晃而过。官兵一阵阵冲过去，哭喊声也一阵阵压过来，等外头重新静下来时，巷子里只剩雪地被踩烂后的泥水声。",

            transition: { type: "goto", nodeId: "close-skipped" },
          },
        ],
      },
      "raid-jin": {
        id: "raid-jin",
        title: "官兵围村",
        text: "官军已经压到牛家村口，雪夜里火把一圈圈铺开。领头军官勒马停在前头，扬鞭喝令搜拿郭杨两家。几名官兵提刀往前压去，回头只等一声吩咐。村口、院门、侧巷，全都在火光里照得明明白白。",
        choices: [
          {
            id: "serve-jin",
            text: "奉命抓人",
            description: "搜屋、封路、协助抓人，把这一步走到底。",
            consumeDay: true,
            consequences: [
              { kind: "factionAttitude", factionId: "jin", delta: 10 },
              { kind: "relation", npcId: "guojing", delta: -20 },
              { kind: "arcBeat", arcId: "shendiao", beat: "niujia", result: "done" },
            ],
            resultText: "一声令下，官兵立刻顺着看住的路口压了过去。有人一脚踹开院门，有人提刀冲进屋里，雪地上的火把跟着一齐晃起来。领头军官在后头冷笑一声：\"这才像个办事的人。\"",

            transition: { type: "goto", nodeId: "jin-end" },
          },
          {
            id: "secretly-release",
            text: "暗中放人",
            description: "表面奉命，实则悄悄给李萍留出一条活路。",
            consumeDay: true,
            consequences: [
              { kind: "factionAttitude", factionId: "jin", delta: -15 },
              { kind: "relation", npcId: "guojing", delta: 6 },
              { kind: "flag", name: "shendiao.niujia.saved_liping", value: true },
              { kind: "arcBeat", arcId: "shendiao", beat: "niujia", result: "done" },
            ],
            resultText: "侧巷那扇虚掩的小门被悄悄推开一线。李萍抱着孩子踉跄钻进风雪里，连回头都顾不上；另一边官兵还在挨家挨户搜，火把照得院墙上下忽明忽暗。再等有人回过味来，这条活路就要没了。",

            transition: { type: "goto", nodeId: "mixed-end" },
          },
          {
            id: "turn-back",
            text: "临阵倒戈",
            description: "到这一步才看清自己不愿替他们把事做绝。",
            consumeDay: true,
            consequences: [
              { kind: "factionAttitude", factionId: "jin", delta: -25 },
              { kind: "relation", npcId: "guojing", delta: 8 },
              { kind: "arcBeat", arcId: "shendiao", beat: "niujia", result: "done" },
            ],
            resultText: "最前头那名官兵刚扑上去，便被猛地撞进雪地里。后头的人先是一愣，随即破口大骂着提刀扑上来，连村口勒马的军官都猛地回头看了过来。官军这边只要一乱，院里那头就还能多抢出一口气。",

            transition: { type: "goto", nodeId: "turn-end" },
          },
        ],
      },
      "close-won": {
        id: "close-won",
        title: "风雪之后",
        text: "风雪渐歇。那道人抱起一名婴儿匆匆北去，另一对夫妇也抱着襁褓消失在夜色中。村里只剩火把烧过后的焦味、雪地上杂乱的脚印，和还没来得及关严的门板。",
        autoNext: { type: "end" },
      },
      "close-lost": {
        id: "close-lost",
        title: "风雪之后",
        text: "火把渐远，雪地上一串串脚印踩得杂乱无章。那道人、那两户人家都已消失在夜色尽头，只剩院门口一地烂雪和被踏翻的盆桶还歪在原处。",
        autoNext: { type: "end" },
      },
      "close-done": {
        id: "close-done",
        title: "风雪之后",
        text: "李萍一路护着腹中孩儿，直到村口外的风雪更深处，才终于低声向人道了一句谢。巷口后路还留着一串歪斜脚印，风一吹，雪很快就把它们盖薄了一层。",
        autoNext: { type: "end" },
      },
      "close-skipped": {
        id: "close-skipped",
        title: "风雪之后",
        text: "风雪渐歇。那道人抱起一名婴儿匆匆北去，另一对夫妇也抱着襁褓消失在夜色中。农舍里那名孕妇还护着腹中孩儿，院门口却已经只剩残雪、血迹和哭声。",
        autoNext: { type: "end" },
      },
      "jin-end": {
        id: "jin-end",
        title: "风雪之后",
        text: "牛家村的火光终于熄了。你站在官军身后，看雪地上的脚印一路乱向远处，心里清楚，从这一夜起，你已经和原本那条路分开了。",
        autoNext: { type: "end" },
      },
      "mixed-end": {
        id: "mixed-end",
        title: "风雪之后",
        text: "你既没有真正替金人把事做绝，也没法再把自己当成从未靠近过他们的人。风雪卷走了李萍的身影，却把这一夜留下的复杂旧账，全都压进了你往后的路里。",
        autoNext: { type: "end" },
      },
      "turn-end": {
        id: "turn-end",
        title: "风雪之后",
        text: "等你重新站回风雪里时，身后的官军已把你视作叛徒，前头的人却也未必真能立刻信你。这一夜的代价不会轻，可你终究还是把自己从那条更深的歧路上拽了回来。",
        autoNext: { type: "end" },
      },
      "leave-end": {
        id: "leave-end",
        title: "风雪之后",
        text: "你没有卷进牛家村主因果，只把这一夜当成一场擦肩而过的风雪。可等你真正走远之后，仍会记得那点灯火曾在雪幕里摇了很久。",
        onEnter: [{ kind: "arcBeat", arcId: "shendiao", beat: "niujia", result: "skipped" }],
        autoNext: { type: "end" },
      },
    },
  },
  // ===== 1. 牛家村·风雪惊变（起点） =====
  {
    id: "shendiao-niujia-arrival",
    entryNode: "main",
    locationId: "niujia",
    weight: 6,
    once: true,
    condition: { kind: "not", item: { kind: "arcBeat", arcId: "shendiao", beat: "niujia" } },
    nodes: {
      main: {
        id: "main",
        title: "风雪牛家村",
        text: "风雪压着村路。村头酒馆里灯火未灭，两个汉子正与一个道人对饮。一个使枪，一个使戟，桌上还搁着几坛酒。村里人不多，却都像在避着什么。你站在酒馆外，肩上落满雪，先得决定今晚怎么落脚。",
        choices: [
          {
            id: "hear-tavern",
            text: "窗外偷听",
            description: "先不露面，在窗外听听这几人说些什么。",
            consumeDay: true,
            consequences: [
              { kind: "flag", name: "shendiao.niujia.heard_tavern", value: true },
            ],
            resultText: "你屏住呼吸伏在窗外，只听那道人自称丘处机，屋里两个汉子互称兄弟，言语间还提到家中将有孩子。村子里这股不安并非错觉——这一夜，注定要出大事。",
            transition: { type: "end" },
          },
          {
            id: "stay-baoxiruo",
            text: "借宿农家",
            description: "不去酒馆，先在村里找户人家借宿。",
            consumeDay: true,
            consequences: [
              { kind: "flag", name: "shendiao.niujia.met_baoxiruo", value: true },
            ],
            resultText: "你避开酒馆，敲开了一户农家的门。开门的是个眉目温柔的妇人，她迟疑片刻，还是把你让进屋里避雪。屋中陈设简朴，却收拾得很净，像是个肯把旧日子一点点护住的人家。",
            transition: { type: "end" },
          },
          {
            id: "leave-now",
            text: "连夜离村",
            description: "这村子气氛不对，趁雪色还深，先离开再说。",
            consumeDay: true,
            resultText: "你终究没有卷进这一夜。踏雪离村时，身后仍能看见牛家村那点昏黄灯火。风把马蹄声、呼喝声与犬吠声一齐吹散，你只是隐约知道，自己错过的不会是一桩小事。",
            transition: { type: "goto", nodeId: "leave-end" },
          },
        ],
      },
      "leave-end": {
        id: "leave-end",
        title: "风雪之后",
        text: "你没有卷进牛家村主因果，只把这一夜当成一场擦肩而过的风雪。可有些旧事，并不会因为你转身离开，就当真从此与你无关。",
        autoNext: { type: "end" },
        onEnter: [{ kind: "arcBeat", arcId: "shendiao", beat: "niujia", result: "skipped" }],
      },
    },
  },
  {
    id: "shendiao-niujia-rescue",
    entryNode: "main",
    locationId: "niujia",
    weight: 6,
    once: true,
    condition: {
      kind: "and",
      items: [
        { kind: "not", item: { kind: "arcBeat", arcId: "shendiao", beat: "niujia" } },
        { kind: "flag", name: "shendiao.niujia.met_baoxiruo", eq: true },
      ],
    },
    nodes: {
      main: {
        id: "main",
        title: "雪夜救伤",
        text: "半夜风雪更紧。你听见柴房里有细微响动，推门一看，只见借你留宿的妇人正借着油灯替一个受伤武士包扎伤口。那人衣甲残破，口音却不像宋人。她抬头看你一眼，手上没停，只轻声道：\"人都伤成这样了，总不能看着他死。\"",
        choices: [
          {
            id: "oppose-rescue",
            text: "劝她别救",
            description: "此人来路不正，何必为了他惹祸上身。",
            consumeDay: true,
            consequences: [
              { kind: "flag", name: "shendiao.niujia.opposed_rescue", value: true },
            ],
            resultText: "你压低声音劝她收手，可她只是摇了摇头，仍把药布一层层缠上去。她看你的目光里添了几分失望，却也没有与你争辩。你意识到，这一夜她守着的，未必只是一个陌生伤者。",
            transition: { type: "end" },
          },
          {
            id: "help-rescue",
            text: "帮她救人",
            description: "不多问，先替这人止血换药再说。",
            consumeDay: true,
            consequences: [
              { kind: "factionAttitude", factionId: "jin", delta: 10 },
              { kind: "flag", name: "shendiao.niujia.helped_wanyan", value: true },
            ],
            resultText: "你蹲下身替那人止血换药，手上动作利落，那妇人神色也稍稍一松。伤者虽然昏沉，眼皮却微微动了动，像是把你的样子记进了心里。屋外风雪未停，屋里却已悄悄埋下了另一重因果。",
            transition: { type: "end" },
          },
          {
            id: "observe-rescue",
            text: "暗中观察",
            description: "不直接帮，也不直接阻止，先看清这人到底是什么来路。",
            consumeDay: true,
            consequences: [
              { kind: "flag", name: "shendiao.niujia.observed_wanyan", value: true },
            ],
            resultText: "你退到灯影照不到的地方，没有帮，也没有出声阻止。那人虽然伤重，眉目间却有种寻常军士少见的沉稳贵气。你心里已然明白，这绝不是个普通的落难武夫。",
            transition: { type: "end" },
          },
        ],
      },
    },
  },
  {
    id: "shendiao-niujia-recruit",
    entryNode: "main",
    locationId: "niujia",
    weight: 6,
    once: true,
    condition: {
      kind: "and",
      items: [
        { kind: "not", item: { kind: "arcBeat", arcId: "shendiao", beat: "niujia" } },
        {
          kind: "or",
          items: [
            { kind: "flag", name: "shendiao.niujia.helped_wanyan", eq: true },
            { kind: "flag", name: "shendiao.niujia.observed_wanyan", eq: true },
          ],
        },
      ],
    },
    nodes: {
      main: {
        id: "main",
        title: "完颜洪烈伤愈招揽",
        text: "过了数日，那个受伤的金人已能起身。他没有立刻暴露身份，只让亲随把你请去一处偏屋。屋里火盆很旺，他披着狐裘坐着，开口时既像试探，也像施恩。\"那夜你救我一命。\"他看着你，语气平缓，\"我不喜欢欠人情。你若肯替我办件小事，以后荣华富贵，未必没有。\"",
        choices: [
          {
            id: "accept-offer",
            text: "接下差事",
            description: "先替他办一次事，看看这条路能通到哪里。",
            consumeDay: true,
            consequences: [
              { kind: "factionAttitude", factionId: "jin", delta: 15 },
              { kind: "flag", name: "shendiao.niujia.accepted_wanyan", value: true },
            ],
            resultText: "你没有多问，只应下了这桩差事。那金人满意地点了点头，像是终于看清了你值不值得收进手里。你知道，从这一刻起，自己已不再只是雪夜里随手帮过一次忙的路人。",
            transition: { type: "end" },
          },
          {
            id: "fake-accept-offer",
            text: "表面答应",
            description: "先把这层关系留着，看看他究竟想让你做什么。",
            consumeDay: true,
            consequences: [
              { kind: "factionAttitude", factionId: "jin", delta: 5 },
              { kind: "flag", name: "shendiao.niujia.fake_accept_wanyan", value: true },
            ],
            resultText: "你嘴上应得平静，心里却仍留着分寸。那金人听了并不追问，只像看见一把暂时还未出鞘的刀。你知道，自己已经踩进了这条线，只是还没有把脚全压下去。",
            transition: { type: "end" },
          },
          {
            id: "reject-offer",
            text: "推辞不掺和",
            description: "这人情你认，但这条路你不想走。",
            consumeDay: true,
            consequences: [
              { kind: "flag", name: "shendiao.niujia.rejected_wanyan", value: true },
            ],
            resultText: "你谢过他的好意，却把这份招揽轻轻推了回去。那金人没有翻脸，只是目光深了几分，像是把你重新放回了可用、却未必可信的位置。你知道，这条路并非从此断了，只是你暂时不愿顺着它走下去。",
            transition: { type: "end" },
          },
        ],
      },
    },
  },
  {
    id: "shendiao-niujia-raid-righteous",
    entryNode: "main",
    locationId: "niujia",
    weight: 6,
    once: true,
    condition: {
      kind: "and",
      items: [
        { kind: "not", item: { kind: "arcBeat", arcId: "shendiao", beat: "niujia" } },
        {
          kind: "or",
          items: [
            { kind: "flag", name: "shendiao.niujia.heard_tavern", eq: true },
            { kind: "flag", name: "shendiao.niujia.opposed_rescue", eq: true },
            { kind: "flag", name: "shendiao.niujia.rejected_wanyan", eq: true },
          ],
        },
        { kind: "not", item: { kind: "flag", name: "shendiao.niujia.accepted_wanyan", eq: true } },
        { kind: "not", item: { kind: "flag", name: "shendiao.niujia.fake_accept_wanyan", eq: true } },
      ],
    },
    nodes: {
      main: {
        id: "main",
        title: "官兵围村",
        text: "几日后，半夜马蹄踏碎雪地，官兵举火把围住牛家村。有人高喊捉拿钦犯，郭啸天已经提兵刃冲出院门，李萍也被惊醒。村里哭喊声四起，火光映得墙上人影乱晃。到了这一刻，你终究得选一边站。",
        choices: [
          {
            id: "help-guoxiao",
            text: "挡阵迎敌",
            description: "冲出去帮郭啸天挡一阵，先把这一夜顶过去。",
            consumeDay: true,
            resultText: "你提气扑进火光里，替郭啸天挡下最先冲上的几名官兵。雪地里刀刃反光，喊杀声压得人胸口发闷，这一夜已由不得任何人全身退开。",
            transition: {
              type: "battle", enemyId: "guanjun",
              onWin: {
                text: "你与郭啸天合力杀退一波官军，村口总算撑出一线喘息。虽然局势仍未稳住，可这一夜，你已经真真正正卷进了郭杨两家的旧事。",
                consequences: [
                  { kind: "karma", delta: 5 },
                  { kind: "reputation", delta: 4 },
                  { kind: "arcBeat", arcId: "shendiao", beat: "niujia", result: "won" },
                ],
                then: { type: "goto", nodeId: "close-won" },
              },
              onLose: {
                text: "你拼到力竭，仍旧没能撑住这一阵。等你拖着伤势退开时，牛家村的火光已乱成一团。这一夜你没有赢下来，可你终究还是站进去了。",
                consequences: [
                  { kind: "arcBeat", arcId: "shendiao", beat: "niujia", result: "lost" },
                ],
                then: { type: "goto", nodeId: "close-lost" },
              },
              onFlee: {
                text: "你虚晃数招勉强脱身，回头时官军已压得更近。你终究还是没能替这家人挡住这一夜，只把一身风雪与惊悸留在心里。",
                consequences: [
                  { kind: "arcBeat", arcId: "shendiao", beat: "niujia", result: "skipped" },
                ],
                then: { type: "goto", nodeId: "close-skipped" },
              },
            },
          },
          {
            id: "save-liping",
            text: "护李萍撤离",
            description: "先护着李萍和村里妇孺一起撤出村口。",
            consumeDay: true,
            consequences: [
              { kind: "relation", npcId: "guojing", delta: 10 },
              { kind: "flag", name: "shendiao.niujia.saved_liping", value: true },
              { kind: "arcBeat", arcId: "shendiao", beat: "niujia", result: "done" },
            ],
            resultText: "李萍一手护着肚腹，一手死死抓着门框，咬牙道：\"郭大哥还在里头！\" 巷口那边火把已经越逼越近，几名妇孺也被哭声惊得乱作一团。后路总算还没被封死，再慢片刻，谁也走不脱。",

            transition: { type: "goto", nodeId: "close-done" },
          },
          {
            id: "hide-away",
            text: "藏身避祸",
            description: "先保住自己，等这阵兵过去再说。",
            consumeDay: true,
            consequences: [
              { kind: "reputation", delta: -1 },
              { kind: "arcBeat", arcId: "shendiao", beat: "niujia", result: "skipped" },
            ],
            resultText: "门板刚一掩上，巷子里的火把便从缝外一晃而过。官兵一阵阵冲过去，哭喊声也一阵阵压过来，等外头重新静下来时，巷子里只剩雪地被踩烂后的泥水声。",

            transition: { type: "goto", nodeId: "close-skipped" },
          },
        ],
      },
      "close-won": {
        id: "close-won",
        title: "风雪之后",
        text: "风雪渐歇。那道人抱起一名婴儿匆匆北去，另一对夫妇也抱着襁褓消失在夜色中。村里只剩火把烧过后的焦味、雪地上杂乱的脚印，和还没来得及关严的门板。",
        autoNext: { type: "end" },
      },
      "close-lost": {
        id: "close-lost",
        title: "风雪之后",
        text: "火把渐远，雪地上一串串脚印踩得杂乱无章。那道人、那两户人家都已消失在夜色尽头，只剩院门口一地烂雪和被踏翻的盆桶还歪在原处。",
        autoNext: { type: "end" },
      },
      "close-done": {
        id: "close-done",
        title: "风雪之后",
        text: "李萍一路护着腹中孩儿，直到村口外的风雪更深处，才终于低声向人道了一句谢。巷口后路还留着一串歪斜脚印，风一吹，雪很快就把它们盖薄了一层。",
        autoNext: { type: "end" },
      },
      "close-skipped": {
        id: "close-skipped",
        title: "风雪之后",
        text: "风雪渐歇。你远远望见那道人抱起一名婴儿匆匆北去，另一对夫妇也抱着襁褓消失在夜色中。农舍中的孕妇紧紧护着腹中孩儿，在火光中默默垂泪。牛家村重新沉入夜色，只有残雪、血迹和哭声留在原地，叫人久久难忘。",
        autoNext: { type: "end" },
      },
    },
  },
  {
    id: "shendiao-niujia-raid-jin",
    entryNode: "main",
    locationId: "niujia",
    weight: 6,
    once: true,
    condition: {
      kind: "and",
      items: [
        { kind: "not", item: { kind: "arcBeat", arcId: "shendiao", beat: "niujia" } },
        {
          kind: "or",
          items: [
            { kind: "flag", name: "shendiao.niujia.accepted_wanyan", eq: true },
            { kind: "flag", name: "shendiao.niujia.fake_accept_wanyan", eq: true },
          ],
        },
      ],
    },
    nodes: {
      main: {
        id: "main",
        title: "官兵围村",
        text: "你跟着官军回到牛家村。雪夜里火把一圈圈铺开，领头军官喝令搜拿郭杨两家。你认得这村口、认得那户门，也认得今晚会被翻出来的人。你若真按完颜洪烈的意思办事，这一夜之后，很多人都不会再把你当成中原自己人。",
        choices: [
          {
            id: "serve-jin",
            text: "奉命抓人",
            description: "搜屋、封路、协助抓人，把这一步走到底。",
            consumeDay: true,
            consequences: [
              { kind: "factionAttitude", factionId: "jin", delta: 10 },
              { kind: "relation", npcId: "guojing", delta: -20 },
              { kind: "arcBeat", arcId: "shendiao", beat: "niujia", result: "done" },
            ],
            resultText: "一声令下，官兵立刻顺着看住的路口压了过去。有人一脚踹开院门，有人提刀冲进屋里，雪地上的火把跟着一齐晃起来。领头军官在后头冷笑一声：\"这才像个办事的人。\"",

            transition: { type: "goto", nodeId: "jin-end" },
          },
          {
            id: "secretly-release",
            text: "暗中放人",
            description: "表面奉命，实则悄悄给李萍留出一条活路。",
            consumeDay: true,
            consequences: [
              { kind: "factionAttitude", factionId: "jin", delta: -15 },
              { kind: "relation", npcId: "guojing", delta: 6 },
              { kind: "flag", name: "shendiao.niujia.saved_liping", value: true },
              { kind: "arcBeat", arcId: "shendiao", beat: "niujia", result: "done" },
            ],
            resultText: "侧巷那扇虚掩的小门被悄悄推开一线。李萍抱着孩子踉跄钻进风雪里，连回头都顾不上；另一边官兵还在挨家挨户搜，火把照得院墙上下忽明忽暗。再等有人回过味来，这条活路就要没了。",

            transition: { type: "goto", nodeId: "mixed-end" },
          },
          {
            id: "turn-back",
            text: "临阵倒戈",
            description: "到这一步才看清自己不愿替他们把事做绝。",
            consumeDay: true,
            consequences: [
              { kind: "factionAttitude", factionId: "jin", delta: -25 },
              { kind: "relation", npcId: "guojing", delta: 8 },
              { kind: "arcBeat", arcId: "shendiao", beat: "niujia", result: "done" },
            ],
            resultText: "最前头那名官兵刚扑上去，便被猛地撞进雪地里。后头的人先是一愣，随即破口大骂着提刀扑上来，连村口勒马的军官都猛地回头看了过来。官军这边只要一乱，院里那头就还能多抢出一口气。",

            transition: { type: "goto", nodeId: "turn-end" },
          },
        ],
      },
      "jin-end": {
        id: "jin-end",
        title: "风雪之后",
        text: "牛家村的火光终于熄了。你站在官军身后，看雪地上的脚印一路乱向远处，心里清楚，从这一夜起，你已经和原本那条路分开了。",
        autoNext: { type: "end" },
      },
      "mixed-end": {
        id: "mixed-end",
        title: "风雪之后",
        text: "你既没有真正替金人把事做绝，也没法再把自己当成从未靠近过他们的人。风雪卷走了李萍的身影，却把这一夜留下的复杂旧账，全都压进了你往后的路里。",
        autoNext: { type: "end" },
      },
      "turn-end": {
        id: "turn-end",
        title: "风雪之后",
        text: "等你重新站回风雪里时，身后的官军已把你视作叛徒，前头的人却也未必真能立刻信你。这一夜的代价不会轻，可你终究还是把自己从那条更深的歧路上拽了回来。",
        autoNext: { type: "end" },
      },
    },
  },

  // ===== 2. 大漠·少年射雕 =====
  {
    id: "shendiao-damos",
    entryNode: "main",
    locationId: "damos",
    weight: 5,
    once: true,
    condition: { kind: "arcBeat", arcId: "shendiao", beat: "niujia" },
    nodes: {
      main: {
        id: "main",
        title: "大漠·少年射雕",
        text: "你北行至蒙古大漠，黄沙漫天间远远望见一个憨厚少年正跟七位形貌各异的师父苦练武功。他招式笨拙，每一式要练上百遍方才成型，却从不偷懒——额上汗水如雨，眼神却异常坚定。一只白雕掠过天际，少年抬手一箭，正中雕翅。好生神准！",
        choices: [
          {
            id: "guide", text: "上前指点", description: "少年根骨奇佳却不得其法，你忍不住点拨运气门道。",
            consequences: [
              { kind: "reputation", delta: 2 },
              { kind: "aptitude", delta: 1 },
              { kind: "relation", npcId: "guojing", delta: 12 },
            ],
            consumeDay: true,
            resultText: "你上前点拨那少年运气发力的门道。他虽憨厚，却如获至宝，连连道谢。七位师父见你出手不凡，亦拱手相谢。少年自报名叫郭靖，这名字和牛家村雪夜里听过的旧事隐约对上了。",
            transition: { type: "goto", nodeId: "drill" },
          },
          {
            id: "spar", text: "切磋比试", description: "与少年过几招，试试他的斤两。",
            consequences: [
              { kind: "attack", delta: 2 },
              { kind: "relation", npcId: "guojing", delta: 5 },
            ],
            consumeDay: true,
            resultText: "你与郭靖切磋数招。他外家功夫扎实，却拙于变化。一番比试下来，你把自己的招式也磨砺得更精纯了。",
            transition: { type: "goto", nodeId: "drill" },
          },
          {
            id: "befriend", text: "结交为友", description: "欣赏这少年的憨直，请他喝碗马奶酒。",
            consequences: [
              { kind: "reputation", delta: 3 },
              { kind: "hp", delta: 20 },
              { kind: "item", id: "field-ration", count: 2 },
              { kind: "relation", npcId: "guojing", delta: 20 },
              { kind: "npcRelationType", npcId: "guojing", relationType: "朋友" },
            ],
            consumeDay: true,
            resultText: "你与郭靖对饮马奶酒，他说起大漠和江南的旧事。临别时他握住你的手：\"后会有期！\"",
            transition: { type: "goto", nodeId: "drill" },
          },
        ],
      },
      drill: {
        id: "drill",
        title: "大漠·江南七怪",
        text: "入夜，七位师父围坐篝火。韩小莹看着郭靖练拳。韩小莹：\"这孩子资质虽钝，胜在勤恳，只是……\"柯镇恶：\"既收了他做徒弟，便不谈资质。靖儿，再练！\"郭靖起身，又打了一套拳法。七怪谁也没有离席。",
        autoNext: { type: "goto", nodeId: "farewell" },
        onEnter: [{ kind: "reputation", delta: 1 }],
      },
      farewell: {
        id: "farewell",
        title: "大漠·惜别",
        text: "你在大漠又留了几日，看郭靖天不亮就被七怪拎去练功，看他一遍遍把最简单的招式打到手臂发颤，也看见他夜里坐在篝火旁，望着南方的天发呆。临别那天，郭靖追出三里地，硬塞给你一包干粮和一枚草原护符。郭靖：\"兄弟，等我回中原，咱们还要再见。\"风把他的话吹得断断续续，你却知道，这句约定多半不会落空。",
        autoNext: { type: "end" },
        onEnter: [
          { kind: "arcBeat", arcId: "shendiao", beat: "damos", result: "done" },
          { kind: "hp", delta: 20 },
          { kind: "relation", npcId: "guojing", delta: 4 },
        ],
      },
    },
  },

  // ===== 3. 中原·客栈奇缘 =====
  {
    id: "shendiao-meet-rong",
    entryNode: "main",
    locationId: "linan",
    weight: 5,
    once: true,
    condition: { kind: "arcBeat", arcId: "shendiao", beat: "damos" },
    nodes: {
      main: {
        id: "main",
        title: "中原·客栈奇缘",
        text: "你南下中原，在临安城外一家客栈歇脚。邻桌一个满脸煤灰的小乞丐正点满一桌好菜大快朵颐，吃相颇为斯文；身旁陪着个憨厚青年，一脸宠溺地看着。你眼角一跳——这乞丐……怎么看都不像寻常叫花子。",
        choices: [
          {
            id: "chat", text: "上前搭话", description: "这两人气质不凡，不妨结识一番。",
            consequences: [
              { kind: "relation", npcId: "huangrong", delta: 10 },
              { kind: "relation", npcId: "guojing", delta: 8 },
            ],
            consumeDay: true,
            resultText: "你上前攀谈。那小乞丐眼珠一转，三言两语便试探出你的深浅，随即咯咯笑了起来：\"你这人倒有趣。\"那憨厚青年正是郭靖——大漠一别，不想在此重逢！他见你友善，忙请你同坐。",
            transition: { type: "goto", nodeId: "reveal" },
          },
          {
            id: "treat", text: "请客结账", description: "替这两人付了酒钱，结个善缘。",
            consequences: [
              { kind: "gold", delta: -50 },
              { kind: "relation", npcId: "huangrong", delta: 18 },
              { kind: "relation", npcId: "guojing", delta: 6 },
              { kind: "karma", delta: 3 },
            ],
            consumeDay: true,
            resultText: "你悄悄替他们结了账。小乞丐察觉后挑眉看你，似在重新估量你。",
            transition: { type: "goto", nodeId: "reveal" },
          },
          {
            id: "observe", text: "静观不语", description: "这两人来历不凡，不贸然搭讪。",
            consequences: [
              { kind: "aptitude", delta: 1 },
            ],
            consumeDay: true,
            resultText: "你默默观察，只见那小乞丐谈笑间机锋暗藏，憨厚青年却一片赤诚。你暗暗记下这对组合。",
            transition: { type: "goto", nodeId: "reveal" },
          },
        ],
      },
      reveal: {
        id: "reveal",
        title: "真相·桃花岛上小东邪",
        text: "夜深后，客栈里的人散了大半。那小乞丐把破帽往桌上一丢，抬手抹去脸上的煤灰，帽下竟泻出一头长发。黄蓉挑眉看你：\"怎么，不意外？\"她把筷子一搁，笑得又狡又亮。黄蓉：\"我叫黄蓉，桃花岛黄药师之女。你若真有意思，改日来岛上找我。\"郭靖站在一旁，看看她，又看看你，半天没说出一句整话，只会挠头发怔。你忽然明白，大漠里那段少年岁月已经过去，中原这一局，从这一晚才算真正开始。",
        autoNext: { type: "end" },
        onEnter: [
          { kind: "arcBeat", arcId: "shendiao", beat: "meet-rong", result: "done" },
          { kind: "aptitude", delta: 1 },
          { kind: "relation", npcId: "huangrong", delta: 2 },
        ],
      },
    },
  },

  // ===== 4. 洪七公·叫花传功 =====
  {
    id: "shendiao-qigong",
    entryNode: "main",
    locationId: "linan",
    weight: 5,
    once: true,
    condition: { kind: "arcBeat", arcId: "shendiao", beat: "meet-rong" },
    nodes: {
      main: {
        id: "main",
        title: "洪七公·叫花传功",
        text: "你路过临安城外一片松林，忽然闻到一股奇香。循香而去，只见一个衣衫褴褛的老叫花正啃着一只烧鸡，旁边黄蓉正笑盈盈地往火堆上加佐料。那老叫花吃一口叫一声好，手指油光锃亮，往石上一坐却稳得像钉在地里一样。",
        choices: [
          {
            id: "join-feast", text: "入席同享", description: "厚着脸皮坐下，尝尝黄蓉的手艺。",
            consequences: [
              { kind: "relation", npcId: "hongqigong", delta: 8 },
              { kind: "relation", npcId: "huangrong", delta: 5 },
              { kind: "hp", delta: 30 },
            ],
            consumeDay: true,
            resultText: "黄蓉给你盛了一碗汤，鲜香无比。老叫花斜眼看你：\"小子，嘴倒不刁。\"你与三人席地而坐，松风入耳，竟是一顿难得的快意晚餐。",
            transition: { type: "goto", nodeId: "feast" },
          },
          {
            id: "watch-silently", text: "远远观望", description: "此人武功深不可测，不贸然接近。",
            consequences: [
              { kind: "aptitude", delta: 2 },
              { kind: "reputation", delta: 1 },
            ],
            consumeDay: true,
            resultText: "你藏身暗处，只见老叫花吃完烧鸡后抬手拍了郭靖后背一掌。郭靖肩背一震，呼吸随即长了许多，额上的汗也慢慢落了下去。",
            transition: { type: "goto", nodeId: "feast" },
          },
          {
            id: "challenge", text: "上前请教", description: "厚礼求教，看这位前辈愿不愿指点。",
            condition: { kind: "relation", npcId: "guojing", gte: 15 },
            consequences: [
              { kind: "relation", npcId: "hongqigong", delta: 15 },
            ],
            consumeDay: true,
            resultText: "你上前行礼请教。老叫花上下打量你，忽然大笑：\"好小子，有胆！俺洪七公今天心情好，便教你们两手！\"",
            transition: { type: "goto", nodeId: "feast" },
          },
        ],
      },
      feast: {
        id: "feast",
        title: "松林·降龙初现",
        text: "洪七公把最后一块鸡骨头往火里一丢，拍着肚子站了起来。洪七公：\"吃了人家姑娘这么多好菜，不还个人情，老叫花往后还怎么有脸再来蹭饭？靖儿，过来！\"他右掌推出，掌风竟把一地松针都掀得倒卷而起——正是降龙十八掌第一式「亢龙有悔」！郭靖依样施为，动作仍显笨拙，掌力却沉稳雄浑。黄蓉在旁看得眼睛发亮，像早知这一刻迟早会来。洪七公练完一式，忽又转头看向你，嘴角带着点促狭：\"你小子在旁边看得比谁都仔细，要不要也来试试？\"",
        autoNext: {
          type: "branch",
          cases: [
            { when: { kind: "relation", npcId: "hongqigong", gte: 10 }, then: { type: "goto", nodeId: "teaching" } },
          ],
          else: { type: "goto", nodeId: "watch-only" },
        },
      },
      teaching: {
        id: "teaching",
        title: "降龙十八掌·初窥",
        text: "洪七公见你有心，便传你降龙十八掌的入门心法。他讲得粗疏，要旨却清晰无比——至刚至阳，一掌既出，有去无回。你反复演练，终于摸到了第一式的门径。七公大笑：\"孺子可教！不过这门掌法，非一日之功，你日后须勤加修炼。\"",
        autoNext: { type: "end" },
        onEnter: [
          { kind: "skill", id: "xianglong18" },
          { kind: "arcBeat", arcId: "shendiao", beat: "qigong", result: "won" },
          { kind: "reputation", delta: 5 },
          { kind: "mp", delta: 15 },
          { kind: "npcRelationType", npcId: "hongqigong", relationType: "师徒" },
        ],
      },
      "watch-only": {
        id: "watch-only",
        title: "松林·旁观摩掌",
        text: "你远远看着洪七公传郭靖掌法。那掌力刚猛无俦，松枝断折声如爆竹。你虽未能亲学，却也把出掌时的起势、换气和收劲都看了个大概。",
        autoNext: { type: "end" },
        onEnter: [
          { kind: "arcBeat", arcId: "shendiao", beat: "qigong", result: "done" },
          { kind: "aptitude", delta: 2 },
          { kind: "attack", delta: 1 },
        ],
      },
    },
  },

  // ===== 5. 赵王府·夜探藏经 =====
  {
    id: "shendiao-wangfu",
    entryNode: "main",
    locationId: "linan",
    weight: 5,
    once: true,
    condition: { kind: "arcBeat", arcId: "shendiao", beat: "qigong" },
    nodes: {
      approach: {
        id: "approach",
        title: "赵王府·夜探藏经",
        text: "夜里潜到赵王府外，高墙深院一层层压在黑暗里，檐下灯火却还亮着。院中不时有人提灯巡过，甲叶声贴着墙根一路传远。",
        autoNext: { type: "goto", nodeId: "alarm" },
      },
      alarm: {
        id: "alarm",
        title: "赵王府·夜探藏经",
        text: "更深处忽然传来一阵凄厉怪笑，声音尖得像要把夜色划开。黄蓉提过，赵王府里藏着桃花岛叛徒梅超风的踪迹。",
        autoNext: { type: "goto", nodeId: "main" },
      },
      main: {
        id: "main",
        title: "赵王府·夜探藏经",
        text: "王府里的高手还在巡夜，藏经密室多半就在更深的院落里。眼下是继续摸进去，还是先在外院找机会下手，全看这一念。",
        choices: [
          {
            id: "steal", text: "深入盗书", description: "机缘与风险并存，博他一回。",
            consequences: [{ kind: "karma", delta: -2 }],
            consumeDay: true,
            resultText: "你潜入王府密室，四下翻找——",
            transition: { type: "goto", nodeId: "inner-court" },
          },
          {
            id: "ambush", text: "伏击巡夜", description: "遇王府高手，索性一战。",
            consumeDay: true,
            resultText: "你撞上王府护院高手，对方冷喝一声拔刀相向！",
            transition: {
              type: "battle", enemyId: "emingke",
              onWin: {
                text: "你几招制服王府护院，搜身得了一本残破武学手札与碎银。虽未深入藏经之所，收获已是不菲。",
                consequences: [
                  { kind: "gold", delta: 40 },
                  { kind: "item", id: "small-mp-pill", count: 1 },
                ],
                then: { type: "goto", nodeId: "escape" },
              },
              onLose: { text: "护院武艺不弱，你力战不敌，趁夜色狼狈逃出王府。此行空手而归，还险些折在里面。", then: { type: "goto", nodeId: "escape" } },
              onFlee: { text: "你虚晃几招遁入夜色，全身而退。", then: { type: "goto", nodeId: "escape" } },
            },
          },
          {
            id: "retreat", text: "见好就收", description: "王府高手如云，不可逞强。",
            consequences: [{ kind: "reputation", delta: 1 }],
            consumeDay: true,
            resultText: "你明智地全身而退。虽空手而归，却保全了性命。",
            transition: { type: "end" },
          },
        ],
      },
      "inner-court": {
        id: "inner-court",
        title: "王府·暗室惊变",
        text: "你在密室中翻得一部内功心法残卷，正要收起，身后传来阴恻恻的笑声：\"嘿嘿，胆敢擅闯王府，不知死活！\"一道劲风袭来——是梅超风！她双目已盲，却凭听风辨形之术锁定了你的方位。",
        choices: [
          {
            id: "fight-meichaofeng", text: "迎战梅超风", description: "避无可避，唯有力战！",
            consumeDay: true,
            transition: {
              type: "battle", enemyId: "meichaofeng",
              onWin: {
                text: "你拼尽全力击退梅超风，趁她调息之机夺路而出。怀中残卷虽只半部，依稀可见《九阴真经》的字样——这趟险没有白冒！",
                consequences: [
                  { kind: "skill", id: "jiuyang" },
                  { kind: "mp", delta: 20 },
                  { kind: "reputation", delta: 4 },
                ],
                then: { type: "goto", nodeId: "escape" },
              },
              onLose: {
                text: "九阴白骨爪阴毒无比，你不敌倒地。恍惚间似有人将你拖出王府——再睁眼已在城外破庙，怀中残卷不翼而飞。",
                then: { type: "goto", nodeId: "escape" },
              },
              onFlee: {
                text: "你忌惮梅超风毒功，趁她盲目之机闪身遁走，虽丢了残卷，好歹保全了性命。",
                then: { type: "goto", nodeId: "escape" },
              },
            },
          },
          {
            id: "distract", text: "投石问路", description: "她双目失明，靠听觉定位——制造声响引开她。",
            consequences: [
              { kind: "aptitude", delta: 2 },
            ],
            consumeDay: true,
            resultText: "你将一枚铜钱弹向墙角，梅超风掌风追随声息而去。你趁机溜出密室，顺手带走了残卷——好险！",
            transition: { type: "goto", nodeId: "escape" },
          },
        ],
      },
      escape: {
        id: "escape",
        title: "王府·月下脱身",
        text: "你翻出王府高墙，落进巷口夜色。身后传来杨康的喊声，院里很快又响起一阵急促脚步。王府灯火接连亮起。",
        autoNext: { type: "end" },
        onEnter: [
          { kind: "arcBeat", arcId: "shendiao", beat: "wangfu", result: "done" },
        ],
      },
    },
  },

  // ===== 6. 桃花岛·东邪试炼 =====
  {
    id: "shendiao-taohua",
    entryNode: "arrival",
    locationId: "taohuadao",
    weight: 5,
    once: true,
    condition: { kind: "arcBeat", arcId: "shendiao", beat: "wangfu" },
    nodes: {
      arrival: {
        id: "arrival",
        title: "桃花岛·东邪试炼",
        text: "渡海登岛，满目桃花灼灼。奇门阵法暗藏其中，你循着黄蓉留下的标记穿过桃林，来到一座精舍前。黄药师负手而立，冷冷看着你：\"能破我桃花阵而入者，近年不过寥寥数人。你来此何事？\"你说明来意——为他女儿与郭靖之事而来。黄药师冷哼一声：\"先过我三关再说。\"",
        choices: [
          {
            id: "accept-test", text: "应下三关", description: "既来之则安之，闯一闯东邪的试炼。",
            consumeDay: true,
            resultText: "你抱拳应下。黄药师点了点头。",
            transition: { type: "goto", nodeId: "test" },
          },
          {
            id: "negotiate", text: "以理服人", description: "不比武力，以言语打动黄药师。",
            condition: { kind: "relation", npcId: "huangrong", gte: 15 },
            consequences: [{ kind: "relation", npcId: "huangyaoshi-npc", delta: 5 }],
            consumeDay: true,
            resultText: "你不卑不亢，将黄蓉在江湖中所受的险厄一一说来，又言郭靖虽钝却忠贞不二。黄药师面色稍缓：\"你倒替他说了好话。也罢，但试一关——过了便准。\"",
            transition: { type: "goto", nodeId: "test" },
          },
          {
            id: "force-entry", text: "强行闯岛", description: "东邪虽强，未必不可力敌。",
            consequences: [
              { kind: "relation", npcId: "huangyaoshi-npc", delta: -15 },
              { kind: "karma", delta: -5 },
            ],
            consumeDay: true,
            resultText: "你运功强闯桃花阵，黄药师面露不悦。他不发一言，一掌向你推来！",
            transition: {
              type: "battle", enemyId: "huangyaoshi",
              onWin: {
                text: "你与黄药师连过数招，勉强站稳身形。他收掌站定。黄药师：\"功夫倒还过得去。看在蓉儿份上，不与你计较。\"",
                consequences: [
                  { kind: "reputation", delta: 8 },
                  { kind: "relation", npcId: "huangyaoshi-npc", delta: 10 },
                ],
                then: { type: "goto", nodeId: "result" },
              },
              onLose: {
                text: "黄药师武功远在你之上，数招之间你便被制住。黄药师：\"不自量力。\"你被逐出桃花岛。",
                then: { type: "end" },
              },
              onFlee: {
                text: "你知不敌，趁阵法遮掩狼狈退走。黄药师并未追击，只是冷哼一声。此番面上无光。",
                then: { type: "end" },
              },
            },
          },
        ],
      },
      test: {
        id: "test",
        title: "桃花·奇门试炼",
        text: "黄药师引你入阵，四面桃花遮眼，方位不断变幻。黄药师：\"一炷香内走出此阵，便算你过。\"你凝神观察，阵眼随着生门不断变动。",
        choices: [
          {
            id: "solve-array", text: "推演阵法", description: "静心推算生门方位，以智破阵。",
            consequences: [
              { kind: "relation", npcId: "huangyaoshi-npc", delta: 12 },
              { kind: "aptitude", delta: 2 },
            ],
            consumeDay: true,
            resultText: "你闭目推演，步步踏在生门之上。桃花让路，奇阵自开。黄药师目中闪过一丝惊讶：\"你竟懂奇门？难得。\"",
            transition: { type: "goto", nodeId: "result" },
          },
          {
            id: "brute-force", text: "以力破阵", description: "管他什么阵法，一力降十会！",
            consumeDay: true,
            resultText: "你运功强行闯阵，左冲右突——",
            transition: {
              type: "battle", enemyId: "huangyaoshi",
              onWin: {
                text: "你以蛮力破阵而出，衣袖上沾满落花。黄药师：\"莽夫有莽夫的好处。过关。\"",
                consequences: [
                  { kind: "speed", delta: 2 },
                ],
                then: { type: "goto", nodeId: "result" },
              },
              onLose: {
                text: "你体力耗尽倒在阵中。黄药师摇头：\"有勇无谋。\"将你送出岛外。",
                then: { type: "end" },
              },
            },
          },
          {
            id: "ask-rong", text: "求黄蓉暗助", description: "她最了解父亲的阵法。",
            condition: { kind: "relation", npcId: "huangrong", gte: 20 },
            consequences: [
              { kind: "relation", npcId: "huangrong", delta: 5 },
              { kind: "relation", npcId: "huangyaoshi-npc", delta: -5 },
            ],
            consumeDay: true,
            resultText: "黄蓉悄悄给你递了暗号，指引生门方位。你从容走出阵去。黄药师面色微沉，似已察觉女儿暗中帮了你，却未点破。",
            transition: { type: "goto", nodeId: "result" },
          },
        ],
      },
      result: {
        id: "result",
        title: "桃花岛·翁婿和解",
        text: "黄药师隔着海风沉默良久，像是把许多旧怨、旧傲和舍不得都在这一阵风里慢慢咽了回去。黄药师：\"蓉儿既认了郭靖，老夫再拦，也不过是逼她离岛更远。\"黄蓉站在一旁，难得没有插科打诨，只轻轻哼了一声。接下来的几日里，你得以留在岛上盘桓，见识桃花岛的奇门、箫曲与起居，也看见黄药师对女儿那份藏得极深的挂念。临行时，黄药师亲自送你到码头，把一式兰花拂穴手的发劲诀窍点给了你。黄药师：\"下次再来，别像头回那样乱闯。\"这话听着仍硬，语气却已没了初见时的冷。",
        autoNext: { type: "end" },
        onEnter: [
          { kind: "arcBeat", arcId: "shendiao", beat: "taohua", result: "done" },
          { kind: "reputation", delta: 5 },
          { kind: "factionAttitude", factionId: "taohuadao", delta: 15 },
          { kind: "aptitude", delta: 2 },
          { kind: "skill", id: "lanhua" },
          { kind: "npcRelationType", npcId: "huangyaoshi-npc", relationType: "朋友" },
          { kind: "npcFaction", npcId: "huangyaoshi-npc", faction: "taohuadao" },
          { kind: "relation", npcId: "huangrong", delta: 4 },
        ],
      },
    },
  },

  // ===== 7. 铁枪庙·恩仇了断（正邪核心分支） =====
  {
    id: "shendiao-yangkang",
    entryNode: "main",
    locationId: "niujia",
    weight: 5,
    once: true,
    condition: { kind: "arcBeat", arcId: "shendiao", beat: "taohua" },
    nodes: {
      main: {
        id: "main",
        title: "铁枪庙·恩仇了断",
        text: "你回到牛家村，村头那座破败的铁枪庙前围满了人。庙内传来争执声——杨康正与穆念慈对峙，他身后还站着几个金国武士。杨铁心的遗物铁枪就插在庙中，枪身上刻着\"杨\"字。杨康面色铁青：\"我生来便是完颜康！什么杨铁心、什么汉人血脉——与我何干！\"",
        choices: [
          {
            id: "persuade", text: "劝说杨康", description: "晓以大义，劝他认祖归宗。",
            consequences: [{ kind: "karma", delta: 5 }],
            consumeDay: true,
            resultText: "你上前一步：\"杨兄，身世不可改，血脉不可弃。令尊杨铁心一生忠义——你当真要认贼作父？\"杨康猛然回头，眼中闪过一丝挣扎……",
            transition: { type: "goto", nodeId: "confrontation" },
          },
          {
            id: "expose", text: "揭穿真相", description: "当众揭穿杨康认贼作父的真相，逼他面对。",
            consequences: [
              { kind: "karma", delta: 3 },
              { kind: "reputation", delta: 3 },
              { kind: "relation", npcId: "yangkang", delta: -20 },
            ],
            consumeDay: true,
            resultText: "你高声道：\"诸位！此人本名杨康，乃杨铁心之子，却认金国完颜洪烈为父，替金人做事！\"四下哗然。杨康面色惨白，随即转为暴怒。",
            transition: { type: "goto", nodeId: "confrontation" },
          },
          {
            id: "side-yangkang", text: "助杨康脱身", description: "他虽有不是，但各人有各人的选择。",
            consequences: [
              { kind: "karma", delta: -10 },
              { kind: "relation", npcId: "yangkang", delta: 15 },
              { kind: "relation", npcId: "guojing", delta: -15 },
              { kind: "gold", delta: 100 },
            ],
            consumeDay: true,
            resultText: "你挡在杨康身前，替他挡开众人的质问。杨康低声说了句谢。郭靖站在庙门外，没有再开口。",
            transition: { type: "goto", nodeId: "confrontation" },
          },
        ],
      },
      confrontation: {
        id: "confrontation",
        title: "铁枪庙·生死一念",
        text: "杨康忽然暴起，抓起铁枪直刺穆念慈！你横身挡住——他的枪法阴狠毒辣，竟是九阴白骨爪的路数！\"挡我者死！\"杨康双目赤红，杀意毕露。",
        choices: [
          {
            id: "fight-yangkang", text: "迎战杨康", description: "避无可避，唯有力战！",
            consumeDay: true,
            transition: {
              type: "battle", enemyId: "yangkang",
              onWin: {
                text: "你击落杨康手中铁枪，他踉跄后退。穆念慈：\"康哥，够了……\"杨康看了她一眼，转身冲入雨幕。",
                consequences: [
                  { kind: "npcTag", npcId: "yangkang", tag: "杨康已黑化" },
                ],
                then: { type: "goto", nodeId: "judgment" },
              },
              onLose: {
                text: "杨康枪法凌厉，你负伤倒地。郭靖赶到挡住杨康，两人对峙。杨康冷笑一声，带着金国武士扬长而去。",
                then: { type: "goto", nodeId: "judgment" },
              },
              onFlee: {
                text: "你忌惮杨康毒功，闪身退开。他趁机遁走，消失在雨夜之中。",
                then: { type: "goto", nodeId: "judgment" },
              },
            },
          },
          {
            id: "let-him-go", text: "放他离去", description: "不必与他生死相搏，由他去吧。",
            consequences: [
              { kind: "karma", delta: -3 },
            ],
            consumeDay: true,
            resultText: "你侧身让开，杨康冷笑一声冲出铁枪庙。穆念慈跌坐在地，泪流满面。郭靖沉默不语。",
            transition: { type: "goto", nodeId: "judgment" },
          },
        ],
      },
      judgment: {
        id: "judgment",
        title: "铁枪庙·善恶一念",
        text: "杨康被逼入绝境，忽然从怀中摸出一枚暗器——铁枪庙中的铁枪头上淬了剧毒！他面目狰狞地朝穆念慈掷去！千钧一发之际——",
        choices: [
          {
            id: "save-munianci", text: "飞身救人", description: "挡在穆念慈身前，哪怕自己中毒！",
            consequences: [
              { kind: "karma", delta: 15 },
              { kind: "hp", delta: -40 },
              { kind: "relation", npcId: "guojing", delta: 15 },
              { kind: "relation", npcId: "yangkang", delta: -25 },
              { kind: "npcAlive", npcId: "yangkang", alive: false },
              { kind: "npcTag", npcId: "yangkang", tag: "杨康已殒" },
            ],
            consumeDay: true,
            resultText: "你飞身挡在穆念慈身前，毒镖刺入你肩头！剧痛入骨，但你咬紧牙关。杨康见毒镖伤了你而非穆念慈，愣了一瞬——就在这一瞬间，铁枪庙的断梁轰然倒塌，将他砸入火海之中。杨康，终于为自己的选择付出了代价。",
            transition: { type: "goto", nodeId: "aftermath" },
          },
          {
            id: "let-fate-decide", text: "不出手", description: "杨康自作自受，因果自有定数。",
            consequences: [
              { kind: "karma", delta: -5 },
              { kind: "npcAlive", npcId: "yangkang", alive: false },
              { kind: "npcTag", npcId: "yangkang", tag: "杨康已殒" },
            ],
            consumeDay: true,
            resultText: "你没有出手。毒镖擦过穆念慈的衣袖，杨康得意大笑——然而笑声未落，他忽然面色铁青，双手掐住自己喉咙。原来他刚才比试时手掌被铁枪上的毒划伤，以毒攻毒，反噬己身。郭靖冲上去抱住他，杨康在义兄怀中咽下最后一口气，嘴角犹带着不甘的笑。",
            transition: { type: "goto", nodeId: "aftermath" },
          },
          {
            id: "save-yangkang", text: "拉杨康一把", description: "无论如何，他不该死在这里。",
            consequences: [
              { kind: "karma", delta: -8 },
              { kind: "relation", npcId: "yangkang", delta: 20 },
              { kind: "npcRelationType", npcId: "yangkang", relationType: "朋友" },
              { kind: "relation", npcId: "guojing", delta: -10 },
              { kind: "npcTag", npcId: "yangkang", tag: "杨康遁走" },
              { kind: "gold", delta: 50 },
            ],
            consumeDay: true,
            resultText: "你一把拉住杨康，将他拽离倒塌的断梁。他挣脱你的手，踉跄退入雨中，回头看了你一眼——那目光里有感激，更有不甘。\"你救我一次，但我不领情。\"他消失在夜色中，留下穆念慈的哭声和郭靖沉默的背影。",
            transition: { type: "goto", nodeId: "aftermath" },
          },
        ],
      },
      aftermath: {
        id: "aftermath",
        title: "铁枪庙·雨霁",
        text: "铁枪庙外的雨一点点小了下去。郭靖俯身把杨铁心那杆铁枪从废墟里拔出，先用袖子擦净泥水，又慢慢把它插回村口原处。穆念慈跪在庙前，肩头微微发抖，却连哭声都压得极轻。围观的人群散得很慢，谁也不愿先开口，仿佛谁先说话，今晚这场恩怨就真要落定了。你站在雨后泥水里，只觉得牛家村那场旧雪、大漠里的烈风、临安城的灯火和桃花岛的海潮，一路走来，竟都在这一刻压到了心口。可江湖从不肯让人久停——再往前，便只剩华山了。",
        autoNext: { type: "end" },
        onEnter: [
          { kind: "arcBeat", arcId: "shendiao", beat: "yangkang", result: "done" },
          { kind: "reputation", delta: 5 },
          { kind: "relation", npcId: "guojing", delta: 3 },
        ],
      },
    },
  },

  // ===== 8. 华山论剑·天下五绝（主线收束） =====
  {
    id: "shendiao-huashan",
    entryNode: "summit",
    locationId: "huashan",
    weight: 5,
    once: true,
    condition: { kind: "arcBeat", arcId: "shendiao", beat: "yangkang" },
    nodes: {
      summit: {
        id: "summit",
        title: "华山论剑·天下五绝",
        text: "华山之巅，云海翻涌。五位当世绝顶高手各据一方——东邪黄药师、西毒欧阳锋、南帝一灯大师、北丐洪七公，以及中神通王重阳的传人全真教众。郭靖立于峰顶，降龙十八掌掌风猎猎，已是当世一等一的高手。你站在观礼的人群中，感受着这千年一遇的武学盛会。",
        choices: [
          {
            id: "challenge-arena", text: "下场比武", description: "千载难逢，与天下高手过招！",
            consumeDay: true,
            resultText: "你纵身跃入场中。四下惊叹声起——竟有人敢在五绝面前献技！",
            transition: {
              type: "battle", enemyId: "ouyangfeng",
              onWin: {
                text: "你竟力抗西毒欧阳锋数十招而不败！虽未能取胜，但全场震动。洪七公抚掌大笑：\"好小子！有俺当年风采！\"黄药师微微颔首，连欧阳锋也阴阴一笑：\"你，倒是个人物。\"",
                consequences: [
                  { kind: "reputation", delta: 15 },
                  { kind: "skill", id: "xianglong18" },
                  { kind: "exp", delta: 200 },
                ],
                then: { type: "goto", nodeId: "contest" },
              },
              onLose: {
                text: "欧阳锋蛤蟆功一发，你当场败退。洪七公摆了摆手。洪七公：\"输给西毒不丢人。\"",
                consequences: [
                  { kind: "reputation", delta: 5 },
                  { kind: "exp", delta: 80 },
                  { kind: "aptitude", delta: 2 },
                ],
                then: { type: "goto", nodeId: "contest" },
              },
              onFlee: {
                text: "你见欧阳锋势不可挡，明智地退出场外。观战的洪七公朝你竖了竖大拇指——能审时度势，亦是武者修为。",
                consequences: [
                  { kind: "reputation", delta: 2 },
                ],
                then: { type: "goto", nodeId: "contest" },
              },
            },
          },
          {
            id: "observe-contest", text: "观战悟道", description: "静观五绝过招，揣摩绝世武学。",
            consumeDay: true,
            consequences: [
              { kind: "aptitude", delta: 3 },
              { kind: "attack", delta: 2 },
              { kind: "speed", delta: 2 },
            ],
            resultText: "你静坐观战，将五绝的招式变化尽收眼底。降龙十八掌的刚猛、蛤蟆功的阴毒、兰花拂穴手的精妙——这一夜所见，抵得过数年苦修。",
            transition: { type: "goto", nodeId: "contest" },
          },
          {
            id: "assist-guojing", text: "助郭靖守擂", description: "郭靖正在力抗群雄，你去替他分担。",
            condition: { kind: "relation", npcId: "guojing", gte: 20 },
            consequences: [
              { kind: "relation", npcId: "guojing", delta: 10 },
              { kind: "relation", npcId: "huangrong", delta: 5 },
              { kind: "reputation", delta: 8 },
              { kind: "exp", delta: 150 },
            ],
            consumeDay: true,
            resultText: "你纵身至郭靖身侧，与他联手抵挡各路挑战者。二人配合默契，降龙掌与你所学武学相辅相成，竟将数位高手逼退。郭靖大笑：\"兄弟好身手！\"",
            transition: { type: "goto", nodeId: "contest" },
          },
          {
            id: "seek-yangkang", text: "寻访杨康", description: "铁枪庙一别，不知他是否尚在人世。",
            condition: { kind: "npcHasTag", npcId: "yangkang", tag: "杨康遁走" },
            consequences: [
              { kind: "karma", delta: 3 },
              { kind: "relation", npcId: "yangkang", delta: 5 },
            ],
            consumeDay: true,
            resultText: "你趁论剑间隙下山，在华山脚下的小镇找到了杨康。他面容消瘦，眼中却不再有那股阴鸷之气。\"你居然还来找我……\"他沉默良久，\"我已不再是完颜康了。\"你与他默默饮尽一壶浊酒，各自无言——江湖路远，各人有各人的归途。",
            transition: { type: "goto", nodeId: "contest" },
          },
        ],
      },
      contest: {
        id: "contest",
        title: "论剑·天下第一",
        text: "华山上这一场盛会足足持续了三昼夜。有人败得心服，也有人带着不甘离去；有人在峰顶悟道，也有人只是来亲眼看一看，一个时代如何从旧宗师手里交到后来人掌中。最终，郭靖以降龙十八掌力压群雄，洪七公含笑点头，连黄药师望向他的目光都少了几分刻薄，多了几分认定。人群渐渐散开时，黄药师却忽然朝你看来。黄药师：\"你倒真是个异数——不属于这个江湖，却偏偏把这一池春水都搅活了。\"你站在华山风里，忽然明白，这一路真正被改写的，早已不只是别人。",
        autoNext: {
          type: "branch",
          cases: [
            { when: { kind: "karma", gte: 30 }, then: { type: "goto", nodeId: "epilogue-hero" } },
            { when: { kind: "karma", lte: -30 }, then: { type: "goto", nodeId: "epilogue-outcast" } },
          ],
          else: { type: "goto", nodeId: "epilogue-wanderer" },
        },
      },
      "epilogue-hero": {
        id: "epilogue-hero",
        title: "射雕·侠之大者",
        text: "华山论剑落幕。你行侠仗义、扶危济困的声名已传遍江湖。郭靖握住你的手：\"兄弟，你我虽非同姓，却胜似手足。\"黄蓉在旁盈盈一笑，洪七公大笑远去，黄药师拂袖归岛。峰顶的风从众人衣袖间穿过去，云海还在脚下缓缓翻涌。",
        autoNext: { type: "end" },
        onEnter: [
          { kind: "arcBeat", arcId: "shendiao", beat: "huashan", result: "won" },
          { kind: "reputation", delta: 10 },
          { kind: "relation", npcId: "guojing", delta: 10 },
          { kind: "npcRelationType", npcId: "guojing", relationType: "知己" },
          { kind: "npcRecruit", npcId: "guojing", recruited: true },
          { kind: "arcEnding", arcId: "shendiao", ending: "hero" },
        ],
      },
      "epilogue-outcast": {
        id: "epilogue-outcast",
        title: "射雕·独步江湖",
        text: "华山论剑落幕，众人散去。你独行下山，欧阳锋忽然出现在路旁：\"嘿嘿，小子，你跟那帮伪君子不是一路人。老夫看好你。\"他递来一枚蛇形令牌——持此可入白驼山修炼。山道尽头天光将暗，华山主峰在身后只剩一线冷金。",
        autoNext: { type: "end" },
        onEnter: [
          { kind: "arcBeat", arcId: "shendiao", beat: "huashan", result: "done" },
          { kind: "reputation", delta: 5 },
          { kind: "relation", npcId: "ouyangfeng-npc", delta: 15 },
          { kind: "relation", npcId: "guojing", delta: -10 },
          { kind: "arcEnding", arcId: "shendiao", ending: "outcast" },
        ],
      },
      "epilogue-wanderer": {
        id: "epilogue-wanderer",
        title: "射雕·江湖路远",
        text: "华山论剑落幕。你既未与郭靖同路，也未接欧阳锋那枚令牌。你背起行囊沿山道往下走，身后忽然传来黄蓉的声音：\"喂——下次再见面，记得请我吃饭！\"风把她的话吹得断断续续，山路前头仍长得望不到尽头。",
        autoNext: { type: "end" },
        onEnter: [
          { kind: "arcBeat", arcId: "shendiao", beat: "huashan", result: "done" },
          { kind: "reputation", delta: 5 },
          { kind: "arcEnding", arcId: "shendiao", ending: "wanderer" },
        ],
      },
    },
  },

  // ===== 9. 牛家村·故园残雪 =====
  {
    id: "shendiao-niujia-snow",
    entryNode: "main",
    locationId: "niujia",
    weight: 3,
    once: true,
    condition: { kind: "arcBeat", arcId: "shendiao", beat: "niujia" },
    nodes: {
      main: {
        id: "main",
        title: "牛家村·故园残雪",
        text: "你再回牛家村时，雪早已化尽，只剩几堵焦黑的残墙。村口老妪坐在断井边，絮絮叨叨说起那一夜官军围村、道人杀敌、村民逃散的旧事。风一阵阵从残墙缺口穿过去，断井边的草伏下又立起，灰黑砖缝里到处还留着火烧过的痕。",
        choices: [
          {
            id: "offer-incense",
            text: "替故人上香",
            description: "在残屋前点一炷清香，替旧人旧事收一收魂。",
            consumeDay: true,
            resultText: "你在残垣前燃起线香，行了一礼。老妪看了你一眼：\"还记得这村子的人，不多了。\"",
            consequences: [
              { kind: "karma", delta: 2 },
              { kind: "reputation", delta: 2 },
            ],
            transition: { type: "end" },
          },
          {
            id: "search-rubble",
            text: "翻检残垣",
            description: "看看火场废墟里是否还藏着什么旧物。",
            consumeDay: true,
            resultText: "你翻开焦木烂瓦，在灰烬里摸出一枚烧黑的铜锁和几页残纸。纸上的字大半模糊，只剩\"忠义\"二字还能辨认。",
            consequences: [
              { kind: "aptitude", delta: 1 },
              { kind: "item", id: "field-ration", count: 1 },
            ],
            transition: { type: "end" },
          },
        ],
      },
    },
  },

  // ===== 10. 牛家村·穆念慈独守 =====
  {
    id: "shendiao-munianci",
    entryNode: "main",
    locationId: "niujia",
    weight: 3,
    once: true,
    condition: { kind: "arcBeat", arcId: "shendiao", beat: "yangkang" },
    nodes: {
      main: {
        id: "main",
        title: "牛家村·穆念慈独守",
        text: "铁枪庙风波后，你在村口看见一名素衣女子独自扫去庙前碎瓦。她神色憔悴，却将杨铁心遗下的铁枪擦得一尘不染。听见脚步声，她回过头来，正是穆念慈。她眼中含着泪意，却强自镇定：\"江湖人都散了，庙还在，总得有人守着。\"",
        choices: [
          {
            id: "comfort",
            text: "上前宽慰",
            description: "陪她说几句心里话，让她不至一个人扛下所有。",
            consumeDay: true,
            resultText: "你陪穆念慈在庙前坐了一阵。她说起杨铁心，也说起杨康。末了，穆念慈：\"活着的人，总还得继续走。\"",
            consequences: [
              { kind: "karma", delta: 3 },
              { kind: "reputation", delta: 2 },
            ],
            transition: { type: "end" },
          },
          {
            id: "leave-silver",
            text: "留下盘缠",
            description: "不多言，只留些银两给她修整庙宇。",
            consumeDay: true,
            resultText: "你默默留下碎银转身便走。身后传来穆念慈压得极低的一句\"多谢\"，声音轻得像要散进风里。",
            consequences: [
              { kind: "gold", delta: -40 },
              { kind: "karma", delta: 2 },
              { kind: "reputation", delta: 3 },
            ],
            transition: { type: "end" },
          },
        ],
      },
    },
  },

  // ===== 11. 大漠·白雕传讯 =====
  {
    id: "shendiao-damos-eagle",
    entryNode: "main",
    presentation: "letter",
    letterStyle: "note",
    locationId: "damos",
    weight: 3,
    once: true,
    condition: { kind: "arcBeat", arcId: "shendiao", beat: "damos" },
    nodes: {
      main: {
        id: "main",
        title: "大漠·白雕传讯",
        letterIntro: "你在草原上歇马时，头顶掠过一道白影。那只白雕落到你身旁，爪上系着一截皮绳。",
        text: "兄弟，若来大漠，记得喝热马奶。",
        letterSignature: "郭靖",
        choices: [
          {
            id: "untie-letter",
            text: "把字条收好",
            description: "看看白雕到底替谁送来什么消息。",
            consumeDay: true,
            resultText: "你把字条折好收起，纸角上还沾着一点干掉的沙土。",
            consequences: [
              { kind: "relation", npcId: "guojing", delta: 6 },
              { kind: "hp", delta: 20 },
            ],
            transition: { type: "end" },
          },
          {
            id: "feed-eagle",
            text: "喂它些肉干",
            description: "不拆绳结，先喂饱这位远道来的使者。",
            consumeDay: true,
            resultText: "你掰开肉干喂给白雕。它吃完后绕着你飞了一圈，这才落下，让你取走爪上皮绳。上头还系着一枚草原护符。",
            consequences: [
              { kind: "relation", npcId: "guojing", delta: 4 },
              { kind: "item", id: "field-ration", count: 2 },
            ],
            transition: { type: "end" },
          },
        ],
      },
    },
  },

  // ===== 12. 大漠·可汗夜宴 =====
  {
    id: "shendiao-damos-feast",
    entryNode: "main",
    locationId: "damos",
    weight: 3,
    once: true,
    condition: { kind: "relation", npcId: "guojing", gte: 10 },
    nodes: {
      main: {
        id: "main",
        title: "大漠·可汗夜宴",
        text: "你被郭靖带进蒙古营帐，篝火映红整片草场。帐中有人高声劝酒，有人比试摔跤，少年豪气在酒香和马奶香里蒸腾。郭靖把你按在火堆旁坐下，笑得难得舒展：\"来得正好，今晚可汗设宴，咱们不醉不归。\"",
        choices: [
          {
            id: "drink",
            text: "举碗痛饮",
            description: "陪草原汉子狠狠干上几碗，看看自己酒量到底如何。",
            consumeDay: true,
            resultText: "你与郭靖碰碗大笑，马奶酒一碗接一碗地下肚。席间有人唱起长调，郭靖也跟着哼了两句，跑调得厉害，却让整座营帐笑成一团。",
            consequences: [
              { kind: "relation", npcId: "guojing", delta: 5 },
              { kind: "reputation", delta: 2 },
              { kind: "hp", delta: 25 },
            ],
            transition: { type: "end" },
          },
          {
            id: "watch-wrestle",
            text: "观摔跤比武",
            description: "不急着喝酒，先看看草原健儿的筋骨与力道。",
            consumeDay: true,
            resultText: "你在一旁看摔跤手抱摔缠斗，粗犷之中自有章法。郭靖见你看得认真，悄悄告诉你几处发力诀窍，竟和中原拳路暗暗相通。",
            consequences: [
              { kind: "attack", delta: 2 },
              { kind: "aptitude", delta: 1 },
            ],
            transition: { type: "end" },
          },
        ],
      },
    },
  },

  // ===== 13. 大漠·七怪试手 =====
  {
    id: "shendiao-seven-freaks",
    entryNode: "main",
    locationId: "damos",
    weight: 3,
    once: true,
    condition: { kind: "relation", npcId: "guojing", gte: 18 },
    nodes: {
      main: {
        id: "main",
        title: "大漠·七怪试手",
        text: "柯镇恶等人听郭靖提起你，便要轮流和你过几招。朱聪掂了掂铁算盘，韩小莹站在一旁看着。柯镇恶拄杖立在风里。柯镇恶：\"能得靖儿推崇，想来不差。来，让老夫等人瞧瞧。\"",
        choices: [
          {
            id: "accept",
            text: "依次接招",
            description: "索性将这一场试手当作难得的磨炼。",
            consumeDay: true,
            resultText: "七怪各出半招，或快或巧，或狠或奇。你虽应对得手忙脚乱，却也从他们不同路数里看出许多江湖门道。柯镇恶收杖后哼了一声：\"骨头还算硬。\"",
            consequences: [
              { kind: "reputation", delta: 3 },
              { kind: "attack", delta: 1 },
              { kind: "speed", delta: 1 },
            ],
            transition: { type: "end" },
          },
          {
            id: "ask-teachings",
            text: "请教心得",
            description: "既然动了手，不如趁机把招法问透。",
            consumeDay: true,
            resultText: "你并未逞强，只在接招后虚心请教。七怪虽口气各异，讲起经验却都不藏私。韩小莹还笑着替你纠正了一个起手破绽。",
            consequences: [
              { kind: "aptitude", delta: 2 },
              { kind: "relation", npcId: "guojing", delta: 4 },
            ],
            transition: { type: "end" },
          },
        ],
      },
    },
  },

  // ===== 14. 大漠·南归之前 =====
  {
    id: "shendiao-damos-southbound",
    entryNode: "main",
    locationId: "damos",
    weight: 4,
    once: true,
    condition: {
      kind: "and",
      items: [
        { kind: "arcBeat", arcId: "shendiao", beat: "damos" },
        { kind: "not", item: { kind: "arcBeat", arcId: "shendiao", beat: "meet-rong" } },
      ],
    },
    nodes: {
      main: {
        id: "main",
        title: "大漠·南归之前",
        text: "你离开大漠前最后一次回望草原，正撞见郭靖在替七怪收拾行囊。风把帐角吹得猎猎作响，几匹健马已备好鞍辔，像是有人终于下定决心，要从少年岁月里迈进另一个江湖。郭靖看见你，连忙把手里的皮囊递过来。郭靖：\"我也要回中原了。师父们常说，那里有我该去见的人、该了的事。可真到了要走的时候，心里还是发慌。\"",
        choices: [
          {
            id: "encourage",
            text: "替他定心",
            description: "告诉郭靖，这一趟南归，本就该去。",
            consumeDay: true,
            resultText: "你替郭靖把马缰重新系紧，又把中原一路上可能遇见的人和事说给他听。郭靖听得很认真，末了重重点头：\"好，我记住了。\"他不像从前那样只会被人推着走，眼神里第一次多了点主动上路的意思。",
            consequences: [
              { kind: "relation", npcId: "guojing", delta: 6 },
              { kind: "reputation", delta: 2 },
            ],
            transition: { type: "goto", nodeId: "departure" },
          },
          {
            id: "trade-keepsake",
            text: "互留信物",
            description: "既然都要南下，不如留个日后相认的凭据。",
            consumeDay: true,
            resultText: "你把随身的一件小物交给郭靖，郭靖则把那枚草原护符塞回你掌心，说若日在中原走散，只消亮出此物，他总认得你。风从你们之间穿过去，像把这句约定也一并带上了路。",
            consequences: [
              { kind: "relation", npcId: "guojing", delta: 8 },
              { kind: "item", id: "field-ration", count: 2 },
            ],
            transition: { type: "goto", nodeId: "departure" },
          },
        ],
      },
      departure: {
        id: "departure",
        title: "大漠·整鞍南去",
        text: "天刚蒙蒙亮，七怪已替郭靖把行囊和兵刃一件件收拾停当。柯镇恶拄杖立在最前头，照旧冷着脸，话却说得比往常更慢：\"到了中原，莫丢咱们的脸。\"韩小莹替郭靖理平肩头衣褶，朱聪把最后一把短刃塞进他包里，谁都没把不舍说破。郭靖翻身上马时，草原上的风正从帐边一路吹到马蹄下，把少年这些年没说出口的话全吹散在了天光里。",
        autoNext: { type: "goto", nodeId: "promise" },
      },
      promise: {
        id: "promise",
        title: "大漠·风里留约",
        text: "郭靖勒住缰绳，又回头看了你一眼。郭靖：\"等我到了中原，若真见着那些该见的人，也一定还会再见到你。\"你站在草坡上看他催马南去，直到那身影缩成地平线上的一点。大漠的风还是一样大，可这一次，它像真把一段少年岁月吹到了身后，也把另一段中原重逢的路提前铺在了你脚下。",
        onEnter: [
          { kind: "relation", npcId: "guojing", delta: 2 },
          { kind: "reputation", delta: 1 },
        ],
        autoNext: { type: "end" },
      },
    },
  },

  // ===== 15. 临安·并肩夜行 =====
  {
    id: "shendiao-linan-night-stroll",
    entryNode: "main",
    locationId: "linan",
    weight: 4,
    once: true,
    condition: {
      kind: "and",
      items: [
        { kind: "arcBeat", arcId: "shendiao", beat: "meet-rong" },
        { kind: "not", item: { kind: "arcBeat", arcId: "shendiao", beat: "qigong" } },
      ],
    },
    nodes: {
      main: {
        id: "main",
        title: "临安·并肩夜行",
        text: "临安夜市将散未散，河埠头的灯火被风吹得一跳一跳。郭靖提着给黄蓉买来的小食，黄蓉却走在前头，边走边嫌他笨，嫌他买贵了，嫌他连挑盏灯都不会。可她嘴上嫌着，脚下却始终没走远半步。你在桥边正好撞见二人，黄蓉回头便朝你招手。黄蓉：\"来得正好，替我评评理，这人是不是木头？\"郭靖挠着头，只把手里的纸包捧得更稳了些。",
        choices: [
          {
            id: "tease-guojing",
            text: "顺着黄蓉打趣",
            description: "看看这对人一个敢逗、一个肯受，到底能逗出什么火花。",
            consumeDay: true,
            resultText: "你顺着黄蓉的话打趣了郭靖几句，惹得她笑个不停。郭靖被说得耳根微红，却也只是憨憨笑着陪在一旁。闹到后来，连你都看出来，黄蓉嘴里每一句嫌弃，其实都带着点不肯明说的亲近。",
            consequences: [
              { kind: "relation", npcId: "huangrong", delta: 4 },
              { kind: "relation", npcId: "guojing", delta: 4 },
              { kind: "reputation", delta: 1 },
            ],
            transition: { type: "end" },
          },
          {
            id: "speak-for-guojing",
            text: "替郭靖说话",
            description: "告诉黄蓉，这世上肯这样跟着她的人并不多。",
            consumeDay: true,
            resultText: "你替郭靖说了句公道话，黄蓉先是瞪你，随即却安静了片刻。她低头捻了捻纸包边角，才轻轻哼了一声：\"他要是真一直这么笨下去，可有得我操心。\"郭靖没听出话外之意，只认真点头，说以后一定更仔细些。",
            consequences: [
              { kind: "relation", npcId: "huangrong", delta: 3 },
              { kind: "relation", npcId: "guojing", delta: 6 },
              { kind: "npcRelationType", npcId: "guojing", relationType: "朋友" },
            ],
            transition: { type: "end" },
          },
        ],
      },
    },
  },

  // ===== 16. 临安·丐帮小宴 =====
  {
    id: "shendiao-beggar-feast",
    entryNode: "main",
    locationId: "linan",
    weight: 3,
    once: true,
    condition: { kind: "arcBeat", arcId: "shendiao", beat: "meet-rong" },
    nodes: {
      main: {
        id: "main",
        title: "临安·丐帮小宴",
        text: "你在临安桥洞下闻到一股熟悉香气，掀帘一看，几个叫花子正围着陶锅忙活，黄蓉坐在当中看火候。见你来了，她抬头看你一眼。黄蓉：\"来得正好，今天这锅鱼羹缺个会夸人的。\"不远处，洪七公也守在锅边。",
        choices: [
          {
            id: "praise-cooking",
            text: "夸她厨艺",
            description: "先哄大小姐开心，再说别的。",
            consumeDay: true,
            resultText: "你夸得黄蓉眉开眼笑，连洪七公都忍不住替她添了两句好话。黄蓉嘴上说你油嘴滑舌，却多给你盛了一大碗鱼羹。",
            consequences: [
              { kind: "relation", npcId: "huangrong", delta: 6 },
              { kind: "relation", npcId: "hongqigong", delta: 3 },
              { kind: "hp", delta: 20 },
            ],
            transition: { type: "end" },
          },
          {
            id: "listen-news",
            text: "听丐帮消息",
            description: "借着这顿饭，听听临安近来的风吹草动。",
            consumeDay: true,
            resultText: "你坐在锅边听丐帮弟子报消息。临安城里的豪门旧闻、王府的新动静、江湖怪客南来的传闻，被他们一条条说了出来。洪七公看了你一眼，没说什么。",
            consequences: [
              { kind: "aptitude", delta: 1 },
              { kind: "reputation", delta: 2 },
            ],
            transition: { type: "end" },
          },
        ],
      },
    },
  },

  // ===== 16. 临安·王府风声 =====
  {
    id: "shendiao-linan-wangfu-rumor",
    entryNode: "main",
    locationId: "linan",
    weight: 4,
    once: true,
    condition: {
      kind: "and",
      items: [
        { kind: "arcBeat", arcId: "shendiao", beat: "qigong" },
        { kind: "not", item: { kind: "arcBeat", arcId: "shendiao", beat: "wangfu" } },
      ],
    },
    nodes: {
      main: {
        id: "main",
        title: "临安·王府风声",
        text: "临安夜里起了小雨，你在酒肆后巷撞见两个丐帮弟子正低声交换消息。一个说赵王府近来频频延请异人，另一个提到王府里藏着从北边运来的旧卷和兵书。更奇的是，他们还说见过杨康深夜带人入府，神色匆匆，像在避着谁。你刚停住脚，黄蓉便从檐下探出头来，冲你勾了勾手指。黄蓉：\"正想找你。看来这趟王府，不去也得去了。\"",
        choices: [
          {
            id: "follow-clue",
            text: "顺线追查",
            description: "和黄蓉一起把赵王府的风声理清楚。",
            consumeDay: true,
            resultText: "你和黄蓉借着夜色把几条线索拼到了一起：王府里藏的，多半不只是金珠财帛；杨康和梅超风之间，也绝不只是寻常主仆。黄蓉用手指在桌面轻轻一点：\"行了，去赵王府吧，再拖下去只会让线索更脏。\"",
            consequences: [
              { kind: "relation", npcId: "huangrong", delta: 5 },
              { kind: "aptitude", delta: 1 },
            ],
            transition: { type: "end" },
          },
          {
            id: "watch-from-afar",
            text: "先远远盯梢",
            description: "不忙着动手，先看看杨康和王府的人到底怎么来往。",
            consumeDay: true,
            resultText: "你在巷口守到更深，果然看见杨康领着两名高手匆匆回府。那背影看着仍是贵公子模样，脚下的步子却急得像踩着火。你没再跟，只把时辰、路线和门岗轮换记了下来。",
            consequences: [
              { kind: "aptitude", delta: 2 },
              { kind: "relation", npcId: "yangkang", delta: -4 },
            ],
            transition: { type: "end" },
          },
        ],
      },
    },
  },

  // ===== 17. 临安·武穆遗迹 =====
  {
    id: "shendiao-yuefei-wall",
    entryNode: "main",
    locationId: "linan",
    weight: 3,
    once: true,
    condition: { kind: "arcBeat", arcId: "shendiao", beat: "wangfu" },
    nodes: {
      main: {
        id: "main",
        title: "临安·武穆遗迹",
        text: "你顺着旧线索来到临安城外一处废祠，墙上斑驳碑文依稀还能看见\"尽忠报国\"四字。香火早断，只有风从破窗灌进来，把地上的灰尘吹得细细打旋。祠里静得很，残碑、旧灰和破窗外漏进来的天光并排落在墙根下。",
        choices: [
          {
            id: "copy-inscription",
            text: "誊抄残碑",
            description: "把尚能辨认的文字抄下，留作自勉。",
            consumeDay: true,
            resultText: "你对着残碑一字一字誊抄，虽有不少字句已残破难辨，纸上的墨痕却渐渐写满了整页。收笔时窗外风声仍紧，手里的纸却被你按得平平整整。",
            consequences: [
              { kind: "reputation", delta: 3 },
              { kind: "karma", delta: 2 },
            ],
            transition: { type: "end" },
          },
          {
            id: "meditate",
            text: "在祠中静坐",
            description: "不抄不看，只静静坐一会儿，让心安下来。",
            consumeDay: true,
            resultText: "你在破祠中坐了半日，听窗外风声和远远传来的人语。世道未必清明，江湖未必有公道，但人若连自己为何拔剑都忘了，才真是可悲。",
            consequences: [
              { kind: "mp", delta: 20 },
              { kind: "aptitude", delta: 1 },
            ],
            transition: { type: "end" },
          },
        ],
      },
    },
  },

  // ===== 18. 临安·王府旧影 =====
  {
    id: "shendiao-linan-yangkang-shadow",
    entryNode: "main",
    locationId: "linan",
    weight: 4,
    once: true,
    condition: {
      kind: "and",
      items: [
        { kind: "arcBeat", arcId: "shendiao", beat: "wangfu" },
        { kind: "not", item: { kind: "arcBeat", arcId: "shendiao", beat: "taohua" } },
      ],
    },
    nodes: {
      main: {
        id: "main",
        title: "临安·王府旧影",
        text: "夜探赵王府之后，你又回到那一带转了一圈。高墙外的灯火比前几日暗了许多，巡夜的人却更多了。巷子尽头有个卖汤饼的老汉，一边擀面一边低声念叨，说这两日常见一位贵公子半夜回府，面色一天比一天阴。你正听着，拐角处忽有一角锦袍闪过——那身形分明像杨康，却转瞬便没入黑暗。你追了两步，只在墙边看见一截被踩断的玉带穗。",
        choices: [
          {
            id: "keep-chasing",
            text: "继续追下去",
            description: "想弄清杨康究竟在逃什么，又在躲谁。",
            consumeDay: true,
            resultText: "你一路追到临安偏巷深处，只听见远远传来一声冷笑，再追时人影已经尽失。可那一声笑并不完全像杨康，更像另一个把毒与疯意都藏在喉咙里的女人。赵王府这条线，你越查越觉得里头不止一层人心。",
            consequences: [
              { kind: "aptitude", delta: 2 },
              { kind: "relation", npcId: "yangkang", delta: -6 },
            ],
            transition: { type: "end" },
          },
          {
            id: "leave-with-thought",
            text: "先把线索压下",
            description: "有些人还没到揭底的时候，先记住这股不对劲。",
            consumeDay: true,
            resultText: "你没有再追，只把那截断掉的玉穗收了起来。杨康那张在风雪、王府与庙前反复闪现的脸，忽然比从前更复杂了些——不只是贪恋富贵，也像是在拼命抓住某种早已快从掌心里漏光的东西。",
            consequences: [
              { kind: "relation", npcId: "yangkang", delta: 3 },
              { kind: "aptitude", delta: 1 },
            ],
            transition: { type: "end" },
          },
        ],
      },
    },
  },

  // ===== 19. 桃花岛·海上来书 =====
  {
    id: "shendiao-taohua-letter",
    entryNode: "main",
    presentation: "letter",
    letterStyle: "formal",
    locationId: "taohuadao",
    weight: 4,
    once: true,
    condition: {
      kind: "and",
      items: [
        { kind: "arcBeat", arcId: "shendiao", beat: "wangfu" },
        { kind: "not", item: { kind: "arcBeat", arcId: "shendiao", beat: "taohua" } },
      ],
    },
    nodes: {
      main: {
        id: "main",
        title: "桃花岛·海上来书",
        letterIntro: "你回到落脚处时，窗边压着一封带海潮咸味的书信，封口处还沾着一点桃花花瓣。",
        text: "你若还记得临安那顿饭，也还记得答应过要来看我爹，现在便该动身了。再拖下去，靖哥哥只会越来越笨。——对了，来时别乱走，桃花阵可不会认人。",
        letterSignature: "黄蓉",
        choices: [
          {
            id: "keep-letter",
            text: "把信收好",
            description: "既是黄蓉亲自催你，该去桃花岛看看了。",
            consumeDay: true,
            resultText: "你把信折好收入怀中，纸上还留着淡淡海气与花香。信里话说得促狭，催人的意思却再明白不过。",
            consequences: [
              { kind: "relation", npcId: "huangrong", delta: 4 },
              { kind: "reputation", delta: 1 },
            ],
            transition: { type: "end" },
          },
        ],
      },
    },
  },

  // ===== 19. 临安·湖心夜话 =====
  {
    id: "shendiao-linan-nighttalk",
    entryNode: "main",
    locationId: "linan",
    weight: 3,
    once: true,
    condition: { kind: "relation", npcId: "huangrong", gte: 12 },
    nodes: {
      main: {
        id: "main",
        title: "临安·湖心夜话",
        text: "黄蓉夜里约你泛舟西湖。小船离岸后，她看着远处灯火，半天没再说笑。黄蓉：\"靖哥哥总说，侠义就是该做的便去做。可江湖哪有那么简单？\"船桨一晃，湖面便散开一圈圈水纹。",
        choices: [
          {
            id: "speak-frankly",
            text: "坦白作答",
            description: "把你心里真正的想法告诉她。",
            consumeDay: true,
            resultText: "你与黄蓉在湖上说了很久，说侠义，也说一路见过的人和事。听完后，黄蓉：\"原来你也不是只会逞强。\"她把船桨一拨，小舟又往湖心荡出去一截。",
            consequences: [
              { kind: "relation", npcId: "huangrong", delta: 8 },
              { kind: "npcRelationType", npcId: "huangrong", relationType: "朋友" },
            ],
            transition: { type: "end" },
          },
          {
            id: "joke-away",
            text: "插科打诨",
            description: "不愿把气氛弄沉，就顺着她的机锋开个玩笑。",
            consumeDay: true,
            resultText: "你故意把话题岔开，逗得黄蓉又气又笑，拿船桨敲了你一下。她嘴上嫌你没正形，眼神里的郁结却淡了不少。",
            consequences: [
              { kind: "relation", npcId: "huangrong", delta: 5 },
              { kind: "reputation", delta: 1 },
            ],
            transition: { type: "end" },
          },
        ],
      },
    },
  },

  // ===== 17. 桃花岛·海潮听箫 =====
  {
    id: "shendiao-taohua-flute",
    entryNode: "main",
    locationId: "taohuadao",
    weight: 3,
    once: true,
    condition: { kind: "arcBeat", arcId: "shendiao", beat: "taohua" },
    nodes: {
      main: {
        id: "main",
        title: "桃花岛·海潮听箫",
        text: "夜里海潮拍岸，你循着箫声走到礁石边。黄药师背海而立，箫声在潮声里起落。曲终之后，他没有回头。黄药师：\"可听懂了几分？\"",
        choices: [
          {
            id: "answer-heart",
            text: "说出感受",
            description: "把你从箫声中听见的孤意说给他听。",
            consumeDay: true,
            resultText: "你把自己听出来的意思说给黄药师。黄药师沉默了一阵。黄药师：\"你倒不是木头。\"他折下一截桃枝抛给你：\"留着吧。\"",
            consequences: [
              { kind: "relation", npcId: "huangyaoshi-npc", delta: 6 },
              { kind: "aptitude", delta: 2 },
            ],
            transition: { type: "end" },
          },
          {
            id: "remain-silent",
            text: "抱拳不语",
            description: "有些心事，听懂便够了，不必多言。",
            consumeDay: true,
            resultText: "你没有多说，只向黄药师抱拳一礼。海风吹过，他的衣袂与箫声余韵一并飘远。片刻后，他淡淡地嗯了一声，算是默许你留在旁边再听一曲。",
            consequences: [
              { kind: "mp", delta: 20 },
              { kind: "relation", npcId: "huangyaoshi-npc", delta: 3 },
            ],
            transition: { type: "end" },
          },
        ],
      },
    },
  },

  // ===== 18. 桃花岛·试步桃林 =====
  {
    id: "shendiao-taohua-maze",
    entryNode: "main",
    locationId: "taohuadao",
    weight: 3,
    once: true,
    condition: { kind: "relation", npcId: "huangrong", gte: 15 },
    nodes: {
      main: {
        id: "main",
        title: "桃花岛·试步桃林",
        text: "黄蓉非要带你再走一次桃花阵，说是\"免得你下回来岛上又像无头苍蝇一样乱撞\"。她嘴里嫌你笨，脚下却有意放慢半拍，让你看清每一次拐步与换位。桃林花影纷乱，近在眼前的景致却时时错开半尺，令人心惊。",
        choices: [
          {
            id: "follow-carefully",
            text: "照她步法走",
            description: "老老实实跟着黄蓉的节奏，不逞强。",
            consumeDay: true,
            resultText: "你踩着黄蓉的步子一一跟进，虽偶有踉跄，总算没走丢。走到阵眼时她回头冲你得意一笑：\"这回总记住了吧？\"你忽然觉得，连桃林里的风都带着几分狡黠。",
            consequences: [
              { kind: "relation", npcId: "huangrong", delta: 5 },
              { kind: "speed", delta: 2 },
            ],
            transition: { type: "end" },
          },
          {
            id: "derive-yourself",
            text: "自己推演",
            description: "一边跟着她走，一边强记阵势变化。",
            consumeDay: true,
            resultText: "你强行把每一步都记在心里，走完整个阵法后已满头是汗。黄蓉见你竟真记下了大半，惊讶之余哼了一声：\"还不算太笨。\"",
            consequences: [
              { kind: "aptitude", delta: 2 },
              { kind: "relation", npcId: "huangrong", delta: 3 },
            ],
            transition: { type: "end" },
          },
        ],
      },
    },
  },

  // ===== 20. 牛家村·华山前夜 =====
  {
    id: "shendiao-niujia-before-huashan",
    entryNode: "main",
    locationId: "niujia",
    weight: 4,
    once: true,
    condition: {
      kind: "and",
      items: [
        { kind: "arcBeat", arcId: "shendiao", beat: "yangkang" },
        { kind: "not", item: { kind: "arcBeat", arcId: "shendiao", beat: "huashan" } },
      ],
    },
    nodes: {
      main: {
        id: "main",
        title: "牛家村·华山前夜",
        text: "铁枪庙的血气还没散尽，村口却已经有人在议论华山论剑。有人说郭靖会在山上与群雄一争高下，有人说欧阳锋也已动身西来。你夜里独自站在村外田埂上，远处屋舍灯火稀疏，风里仍带着潮湿泥气。郭靖不知何时走到你身边，和你并肩站了许久。郭靖：\"明日各人都要上路了。走到华山，也许这一卷江湖就真要分出个前后。\"",
        choices: [
          {
            id: "promise-company",
            text: "答应同去",
            description: "告诉郭靖，华山一程你会走到最后。",
            consumeDay: true,
            resultText: "你点头应下。郭靖没有说什么豪言，只是把背上的包袱往上提了提，像把心也一并放稳了。你忽然觉得，华山这一程不只是去看谁高谁低，更像去替这一卷江湖收尾。",
            consequences: [
              { kind: "relation", npcId: "guojing", delta: 6 },
              { kind: "reputation", delta: 2 },
            ],
            transition: { type: "end" },
          },
          {
            id: "watch-silently",
            text: "只与他并肩站着",
            description: "有些话不必多说，同行本身就够了。",
            consumeDay: true,
            resultText: "你没有多说什么，只和郭靖一同站到夜风更冷。村外的草叶被风吹得低低伏下，又很快抬起头来。郭靖最后拍了拍你的肩膀：\"华山见。\"这三个字说得极轻，却比许多誓言都更实在。",
            consequences: [
              { kind: "relation", npcId: "guojing", delta: 4 },
              { kind: "aptitude", delta: 1 },
            ],
            transition: { type: "end" },
          },
        ],
      },
    },
  },

  // ===== 21. 华山·雪夜论剑 =====
  {
    id: "shendiao-huashan-snow",
    entryNode: "main",
    locationId: "huashan",
    weight: 3,
    once: true,
    condition: { kind: "arcBeat", arcId: "shendiao", beat: "huashan" },
    nodes: {
      main: {
        id: "main",
        title: "华山·雪夜论剑",
        text: "论剑散场数日后，你仍留在华山。夜半飞雪，有几名散修剑客围着火堆争辩剑理，见你经过便硬把你拉去评理。有人说剑在快，有人说剑在意，还有人说江湖上所谓名剑，不过是给输家找借口。山风极烈，火星在雪里明灭不定，辩得人心也跟着燥了起来。",
        choices: [
          {
            id: "speak-technique",
            text: "从招法说起",
            description: "讲讲你在华山论剑中真正看见的门道。",
            consumeDay: true,
            resultText: "你把所见高手出招的轻重快慢逐一拆开，说得几名剑客频频点头。辩到最后，他们忽然发现自己争的并不是谁对谁错，而是各人心里的剑本就不同。",
            consequences: [
              { kind: "aptitude", delta: 2 },
              { kind: "reputation", delta: 2 },
            ],
            transition: { type: "end" },
          },
          {
            id: "draw-sword",
            text: "拔剑示意",
            description: "不如少说几句，直接演给他们看。",
            consumeDay: true,
            resultText: "你踏雪拔剑，借着火光与月色演了数式。雪花纷落，剑锋起落之间自有你一路行来所得。几名剑客一时无言，半晌后才有人低低赞了一句好剑意。",
            consequences: [
              { kind: "attack", delta: 2 },
              { kind: "speed", delta: 1 },
            ],
            transition: { type: "end" },
          },
        ],
      },
    },
  },

  // ===== 20. 华山·石壁遗刻 =====
  {
    id: "shendiao-huashan-stone",
    entryNode: "main",
    locationId: "huashan",
    weight: 3,
    once: true,
    condition: { kind: "arcBeat", arcId: "shendiao", beat: "huashan" },
    nodes: {
      main: {
        id: "main",
        title: "华山·石壁遗刻",
        text: "你在思过崖侧面的石壁上发现一片浅浅旧刻，石上留着几行指力刻下的心法。字迹已经风化过半，只剩\"大道至简\"、\"先守后发\"、\"心静则明\"几句还能看清。",
        choices: [
          {
            id: "trace-words",
            text: "沿字痕推演",
            description: "试着顺着石刻里残存的劲路去想象出手之法。",
            consumeDay: true,
            resultText: "你沿着石痕一遍遍摩挲推演，越想越觉得许多花巧其实都能归于最朴素的一招。离开时你并未学到某门绝技，却像拨开了一层迷雾。",
            consequences: [
              { kind: "aptitude", delta: 2 },
              { kind: "mp", delta: 20 },
            ],
            transition: { type: "end" },
          },
          {
            id: "bow-and-leave",
            text: "拱手致意",
            description: "对着石壁旧刻行一礼，当作向前人请安。",
            consumeDay: true,
            resultText: "你向着石壁旧刻拱手一礼，忽然生出一种说不清的敬意。那些名字已经被岁月磨没，可他们留给江湖的痕迹，却仍有人会看见。",
            consequences: [
              { kind: "karma", delta: 2 },
              { kind: "reputation", delta: 2 },
            ],
            transition: { type: "end" },
          },
        ],
      },
    },
  },
]
