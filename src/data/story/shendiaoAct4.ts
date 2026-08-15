import type { StoryEvent } from "./schema"

// 第四幕拆成三个地点事件：
// 太湖负责水路并轨，归云庄负责旧案与师门债，桃花岛负责三试、海难和荒岛传承。
// 幕内入口与结果写入 arcVariant，最终由 act4-taohua 统一收束。
export const SHENDIAO_ACT4_STORY: StoryEvent[] = [
  {
    id: "shendiao-taihu",
    entryNode: "lake-approach",
    locationId: "taihu",
    weight: 8,
    once: true,
    condition: {
      kind: "and",
      items: [
        { kind: "arcBeat", arcId: "shendiao", beat: "act3-zhongdu" },
        { kind: "not", item: { kind: "arcBeat", arcId: "shendiao", beat: "act4-taohua" } },
        { kind: "not", item: { kind: "arcVariant", arcId: "shendiao", key: "act4.taihu", eq: "cleared" } },
      ],
    },
    nodes: {
      "lake-approach": {
        id: "lake-approach",
        title: "芦汊灯号",
        text: "太湖入夜后只剩风声与水声。前方钦使船挂着金国旗号，两侧芦苇里却各亮起三点渔火。左侧灯号连闪两次，右侧一艘小船随即熄灯，船上的弩手已经瞄准钦使船尾。",
        autoNext: {
          type: "branch",
          cases: [
            {
              when: { kind: "flag", name: "shendiao.zhongdu.departure", eq: "guo-huang" },
              then: { type: "goto", nodeId: "entry-guo-huang" },
            },
            {
              when: {
                kind: "or",
                items: [
                  { kind: "flag", name: "shendiao.zhongdu.departure", eq: "yangkang-shadow" },
                  { kind: "flag", name: "shendiao.zhongdu.departure", eq: "wangfu-inside" },
                ],
              },
              then: { type: "goto", nodeId: "entry-wangfu" },
            },
          ],
          else: { type: "goto", nodeId: "entry-independent" },
        },
      },
      "entry-guo-huang": {
        id: "entry-guo-huang",
        title: "同舟南下",
        text: "黄蓉认出左侧是太湖水寨灯号。郭靖把船篙压进水里，先让载着妇孺的商船退到芦苇外。黄蓉：\"陆冠英要截的是钦使，不该让过路船替他们挡箭。\"",
        onEnter: [
          { kind: "arcVariant", arcId: "shendiao", key: "act4.entry", value: "guo-huang" },
        ],
        autoNext: { type: "goto", nodeId: "reed-crossroads" },
      },
      "entry-wangfu": {
        id: "entry-wangfu",
        title: "王府暗船",
        text: "你手里的王府路引与钦使船旗号相同。船尾一名亲兵认出暗记，示意你从右舷靠近；芦苇深处的太湖快船也已经封住退路。两边都还没看清你站在哪一侧。",
        onEnter: [
          { kind: "arcVariant", arcId: "shendiao", key: "act4.entry", value: "wangfu" },
        ],
        autoNext: { type: "goto", nodeId: "reed-crossroads" },
      },
      "entry-independent": {
        id: "entry-independent",
        title: "独入水网",
        text: "你雇的小舟刚进港汊，船家便伏低身子。钦使船与水寨快船隔着芦苇互换灯号，另有一艘载满盐袋的民船被夹在中间。船家：\"再往前，三边都要拿咱们当探船。\"",
        onEnter: [
          { kind: "arcVariant", arcId: "shendiao", key: "act4.entry", value: "independent" },
        ],
        autoNext: { type: "goto", nodeId: "reed-crossroads" },
      },
      "reed-crossroads": {
        id: "reed-crossroads",
        title: "太湖截船",
        text: "水寨快船突然升起红灯，数条绳钩同时飞向钦使船。金兵砍断第一批绳索，船头弩手随即转向民船。水面窄得无法绕行，下一轮箭雨已经上弦。",
        choices: [
          {
            id: "answer-water-fort",
            text: "替水寨抢上钦使船",
            description: "接应太湖群雄，先压住船头弩手。",
            consumeDay: true,
            consequences: [
              { kind: "karma", delta: 4 },
              { kind: "relation", npcId: "luguanying", delta: 8 },
              { kind: "arcVariant", arcId: "shendiao", key: "act4.lake-side", value: "water-fort" },
            ],
            transition: {
              type: "battle",
              enemyId: "wangfu-guard",
              onWin: {
                text: "你踩着绳钩登上船头，先撞开弩架，再把领队亲兵逼离舵位。陆冠英的快船从另一侧贴上来，太湖群雄很快控制住甲板。",
                consequences: [
                  { kind: "reputation", delta: 5 },
                ],
                then: { type: "goto", nodeId: "sealed-cargo" },
              },
              onLose: {
                text: "亲兵用盾阵把你压回船舷。陆冠英趁弩手转向，从船尾破开缺口，钦使船仍被截下，你肩上却多了一道弩伤。",
                consequences: [
                  { kind: "hp", delta: -25 },
                ],
                then: { type: "goto", nodeId: "sealed-cargo" },
              },
              onFlee: {
                text: "你割断绳钩退回小舟。太湖群雄随后撞坏钦使船舵，双方在芦苇口继续缠斗。",
                then: { type: "goto", nodeId: "sealed-cargo" },
              },
            },
          },
          {
            id: "shield-civilians",
            text: "先把民船拖出箭路",
            description: "截船胜负可以再争，先别让船民困在两边火力之间。",
            consumeDay: true,
            consequences: [
              { kind: "karma", delta: 6 },
              { kind: "relation", npcId: "guojing", delta: 5 },
              { kind: "relation", npcId: "luguanying", delta: 3 },
              { kind: "arcVariant", arcId: "shendiao", key: "act4.lake-side", value: "civilians" },
            ],
            resultText: "你斩断民船卡在暗桩上的缆绳，郭靖以船篙顶住来船，黄蓉则用灯号让水寨暂缓放箭。民船退出港汊后，陆冠英已经截住钦使船。",
            transition: { type: "goto", nodeId: "sealed-cargo" },
          },
          {
            id: "use-palace-pass",
            text: "持王府路引登船",
            description: "先取得钦使船信任，再决定如何处置水寨。",
            condition: { kind: "arcVariant", arcId: "shendiao", key: "act4.entry", eq: "wangfu" },
            consumeDay: true,
            consequences: [
              { kind: "relation", npcId: "yangkang", delta: 5 },
              { kind: "factionAttitude", factionId: "jin", delta: 5 },
              { kind: "arcVariant", arcId: "shendiao", key: "act4.lake-side", value: "wangfu" },
            ],
            transition: {
              type: "battle",
              enemyId: "shanzei",
              onWin: {
                text: "钦使船放下短梯，你登船后带亲兵守住右舷。陆冠英见你亮出王府路引，没有继续强攻，只命快船咬住船尾，把整条航路逼向归云庄水口。",
                then: { type: "goto", nodeId: "sealed-cargo" },
              },
              onLose: {
                text: "水寨好手从芦苇下潜来凿船。你守住甲板，却没能保住船舵，钦使船最终被迫停在归云庄水口。",
                consequences: [
                  { kind: "hp", delta: -20 },
                ],
                then: { type: "goto", nodeId: "sealed-cargo" },
              },
              onFlee: {
                text: "你借浓烟离开甲板。钦使船失去路引照应，很快被太湖快船拖向归云庄。",
                then: { type: "goto", nodeId: "sealed-cargo" },
              },
            },
          },
          {
            id: "trail-both-sides",
            text: "熄灯跟住双方",
            description: "不急着亮明立场，先看钦使船究竟运了什么。",
            consumeDay: true,
            consequences: [
              { kind: "aptitude", delta: 2 },
              { kind: "speed", delta: 1 },
              { kind: "arcVariant", arcId: "shendiao", key: "act4.lake-side", value: "observer" },
            ],
            resultText: "你让船家熄灯，借芦苇遮住船身。两边交手时，一名王府文吏把封蜡木匣转移到尾舱；陆冠英的快船随后切断前路，把钦使船逼向归云庄。",
            transition: { type: "goto", nodeId: "sealed-cargo" },
          },
        ],
      },
      "sealed-cargo": {
        id: "sealed-cargo",
        title: "封舱密件",
        text: "钦使船在归云庄水口停下。尾舱木匣盖着赵王府与兵部两道封蜡，押船文吏已经撕去名册前页。被捆在舱边的船工则说，船上还有一个从临安押来的官差，见人便自称段天德。",
        choices: [
          {
            id: "preserve-manifest",
            text: "先封存残缺名册",
            description: "留下王府、钦使与武穆遗书水路之间的书面联系。",
            consumeDay: true,
            consequences: [
              { kind: "reputation", delta: 2 },
              { kind: "arcVariant", arcId: "shendiao", key: "act4.water-clue", value: "wumu-manifest" },
            ],
            resultText: "你把残页按原位压回木匣，又请陆冠英当面补封。名册虽少了前页，后半仍记着临安禁宫、武穆遗书和赵王府接应船期。",
            transition: { type: "goto", nodeId: "guiyun-bound" },
          },
          {
            id: "free-boatmen",
            text: "先替船工解缚",
            description: "他们看过装船与换押，活证比半页名册更难伪造。",
            consumeDay: true,
            consequences: [
              { kind: "karma", delta: 3 },
              { kind: "relation", npcId: "luguanying", delta: 4 },
              { kind: "arcVariant", arcId: "shendiao", key: "act4.water-clue", value: "boatmen-witnesses" },
            ],
            resultText: "你割开船工绳索，让他们逐一说出装船地点、押送官差与换旗时辰。陆冠英命人分开记录口供，不让众人互相串话。",
            transition: { type: "goto", nodeId: "guiyun-bound" },
          },
          {
            id: "keep-palace-order",
            text: "收起王府调船令",
            description: "这份真路引既能作证，也能让暗线继续走下去。",
            condition: { kind: "arcVariant", arcId: "shendiao", key: "act4.entry", eq: "wangfu" },
            consumeDay: true,
            consequences: [
              { kind: "relation", npcId: "yangkang", delta: 3 },
              { kind: "arcVariant", arcId: "shendiao", key: "act4.water-clue", value: "palace-order" },
            ],
            resultText: "你在文吏烧掉公文前抽走调船令。令上写着杨康的王府名号，也写明段天德必须活着送到太湖。",
            transition: { type: "goto", nodeId: "guiyun-bound" },
          },
          {
            id: "trace-iron-palm",
            text: "辨认木匣夹层",
            description: "木匣底部另有机关，手法不像王府匠人。",
            consumeDay: true,
            consequences: [
              { kind: "aptitude", delta: 2 },
              { kind: "arcVariant", arcId: "shendiao", key: "act4.water-clue", value: "iron-palm-mark" },
            ],
            resultText: "你拆开木匣夹层，里面只剩一撮砖粉与铁掌形暗记。有人借赵王府的船，把铁掌帮的信也送进了太湖。",
            transition: { type: "goto", nodeId: "guiyun-bound" },
          },
        ],
      },
      "guiyun-bound": {
        id: "guiyun-bound",
        title: "俘船入庄",
        text: "陆冠英命人把钦使船、封舱木匣和段天德一并押往归云庄。临上岸前，他把一枚水寨木牌递给你。陆冠英：\"今晚庄里开宴。你是客，是证人，还是王府的人，进门后再说。\"",
        onEnter: [
          { kind: "arcVariant", arcId: "shendiao", key: "act4.taihu", value: "cleared" },
          { kind: "npcFaction", npcId: "luguanying", faction: "guiyunzhuang" },
        ],
        autoNext: { type: "end" },
      },
    },
  },
  {
    id: "shendiao-guiyunzhuang",
    entryNode: "outer-gate",
    locationId: "guiyunzhuang",
    weight: 8,
    once: true,
    condition: {
      kind: "and",
      items: [
        { kind: "arcVariant", arcId: "shendiao", key: "act4.taihu", eq: "cleared" },
        { kind: "not", item: { kind: "arcBeat", arcId: "shendiao", beat: "act4-taohua" } },
        { kind: "not", item: { kind: "arcVariant", arcId: "shendiao", key: "act4.guiyun", eq: "cleared" } },
      ],
    },
    nodes: {
      "outer-gate": {
        id: "outer-gate",
        title: "归云庄门",
        text: "归云庄正厅灯火通明，门外松林却布着绊索与暗桩。庄丁把钦使船俘虏分押两处，段天德单独关在偏厅。正门迎客，侧门查人，后院水闸则留给王府密使。",
        autoNext: {
          type: "branch",
          cases: [
            {
              when: { kind: "arcVariant", arcId: "shendiao", key: "act4.lake-side", eq: "wangfu" },
              then: { type: "goto", nodeId: "entry-insider" },
            },
            {
              when: {
                kind: "or",
                items: [
                  { kind: "arcVariant", arcId: "shendiao", key: "act4.lake-side", eq: "water-fort" },
                  { kind: "arcVariant", arcId: "shendiao", key: "act4.lake-side", eq: "civilians" },
                ],
              },
              then: { type: "goto", nodeId: "entry-guest" },
            },
          ],
          else: { type: "goto", nodeId: "entry-watched" },
        },
      },
      "entry-guest": {
        id: "entry-guest",
        title: "水寨上客",
        text: "陆冠英亲自把你领进正厅。陆乘风坐在轮椅上，先问船民是否安置，再问钦使船伤亡。听到段天德的名字，他让庄丁把偏厅守卫加了一倍。",
        onEnter: [
          { kind: "arcVariant", arcId: "shendiao", key: "act4.guiyun-entry", value: "guest" },
          { kind: "relation", npcId: "luchengfeng", delta: 5 },
        ],
        autoNext: { type: "goto", nodeId: "false-master" },
      },
      "entry-insider": {
        id: "entry-insider",
        title: "侧门密使",
        text: "你从后院水闸入庄。杨康已经换下钦使船衣甲，正隔着花窗看向偏厅。杨康：\"段天德若把中都旧事说完，父王与我都再无退路。你现在出去，还来得及当他们的上客。\"",
        onEnter: [
          { kind: "arcVariant", arcId: "shendiao", key: "act4.guiyun-entry", value: "insider" },
          { kind: "relation", npcId: "yangkang", delta: 3 },
        ],
        autoNext: { type: "goto", nodeId: "false-master" },
      },
      "entry-watched": {
        id: "entry-watched",
        title: "堂下看客",
        text: "庄丁收走你的水寨木牌，却没有安排席位，只在正厅下首留了一张空椅。陆乘风让人送茶，也让两名弟子守在廊外。庄里尚未把你当敌人，却也没有把后背交给你。",
        onEnter: [
          { kind: "arcVariant", arcId: "shendiao", key: "act4.guiyun-entry", value: "watched" },
        ],
        autoNext: { type: "goto", nodeId: "false-master" },
      },
      "false-master": {
        id: "false-master",
        title: "铁掌宗师",
        text: "英雄宴刚开，一名白须老者便踏着铜缸进厅，自称铁掌帮主裘千仞。他一掌拍碎青砖，又指着北方兵势劝众人早降大金。黄蓉捡起半块砖，在指间轻轻一捻，砖面立刻落下一层新粉。",
        choices: [
          {
            id: "inspect-vat",
            text: "查看铜缸夹层",
            description: "碎砖未必是掌力，先找机关留下的痕迹。",
            consumeDay: true,
            consequences: [
              { kind: "aptitude", delta: 2 },
              { kind: "relation", npcId: "huangrong", delta: 4 },
            ],
            resultText: "你在铜缸底沿找到活动插销，缸壁夹层还藏着换过的酥砖。黄蓉把插销抛到席上。黄蓉：\"裘帮主这一掌，先得问问缸里的木匠。\"",
            transition: { type: "goto", nodeId: "duan-witness" },
          },
          {
            id: "take-a-palm",
            text: "请他当面试掌",
            description: "不拆机关，只让他在没有准备的地方再打一掌。",
            consumeDay: true,
            consequences: [
              { kind: "reputation", delta: 4 },
              { kind: "attack", delta: 1 },
            ],
            resultText: "你把一块庄中旧磨石推到堂前。裘千丈绕着石头走了两圈，忽然改口说今日掌气不宜见血。席间笑声一起，他转身便想往后堂退。",
            transition: { type: "goto", nodeId: "duan-witness" },
          },
          {
            id: "let-him-preach",
            text: "先听他如何劝降",
            description: "骗局只是表面，先看堂上谁会响应大金招揽。",
            consumeDay: true,
            consequences: [
              { kind: "aptitude", delta: 1 },
            ],
            resultText: "你没有立刻拆穿。裘千丈越说越急，席间两名生客开始附和降金，陆乘风随即命人封门。等黄蓉弹碎他鞋底暗藏的砖粉，连那两名生客也被一并拿下。",
            transition: { type: "goto", nodeId: "duan-witness" },
          },
          {
            id: "compare-iron-palm-mark",
            text: "拿木匣暗记问他",
            description: "若真是铁掌帮主，不会认不出自己门下的运货标记。",
            condition: { kind: "arcVariant", arcId: "shendiao", key: "act4.water-clue", eq: "iron-palm-mark" },
            consumeDay: true,
            consequences: [
              { kind: "reputation", delta: 4 },
              { kind: "relation", npcId: "luchengfeng", delta: 4 },
            ],
            resultText: "你把木匣底层的铁掌暗记拓在纸上。裘千丈先说是左坛印，片刻后又改口右坛。陆乘风让庄丁取来旧帮帖，两处说法都对不上。",
            transition: { type: "goto", nodeId: "duan-witness" },
          },
        ],
      },
      "duan-witness": {
        id: "duan-witness",
        title: "段天德开口",
        text: "偏厅门被推开，段天德双手反绑，先认出郭靖腰间短剑，又认出杨康。段天德：\"牛家村调兵不是我的主意。赵王爷给银子，叫我把郭杨两家拆散。小王爷，这些事你父王都知道。\"杨康站在他身后，右手已经扣住一柄短匕。",
        choices: [
          {
            id: "show-bribe-slip",
            text: "亮出调兵银契",
            description: "证人口供可以被灭，第一幕留下的王府侧印不能跟着消失。",
            condition: { kind: "hasItem", id: "duan-bribe-slip" },
            consumeDay: true,
            consequences: [
              { kind: "reputation", delta: 6 },
              { kind: "relation", npcId: "guojing", delta: 5 },
              { kind: "arcVariant", arcId: "shendiao", key: "act4.duan", value: "evidence-preserved" },
              { kind: "npcAlive", npcId: "duantiande", alive: true },
              { kind: "npcTag", npcId: "duantiande", tag: "归云庄公开作证" },
            ],
            resultText: "你把银契摊在席上，赵王府侧印与段天德口供正好相合。杨康的匕首刚离袖口，郭靖已经挡在证人身前。陆乘风命人把证词、银契和钦使船名册分别封存。",
            transition: { type: "goto", nodeId: "witness-aftermath" },
          },
          {
            id: "present-water-records",
            text: "先呈上水路证据",
            description: "用钦使船名册、船工作证或王府调船令固定证词。",
            condition: {
              kind: "or",
              items: [
                { kind: "arcVariant", arcId: "shendiao", key: "act4.water-clue", eq: "wumu-manifest" },
                { kind: "arcVariant", arcId: "shendiao", key: "act4.water-clue", eq: "boatmen-witnesses" },
                { kind: "arcVariant", arcId: "shendiao", key: "act4.water-clue", eq: "palace-order" },
              ],
            },
            consumeDay: true,
            consequences: [
              { kind: "reputation", delta: 4 },
              { kind: "arcVariant", arcId: "shendiao", key: "act4.duan", value: "records-survive" },
              { kind: "npcAlive", npcId: "duantiande", alive: false },
            ],
            resultText: "陆乘风先让船工与段天德分开画押，再把名册和调船令封存。杨康仍在混乱中刺死段天德，却没能毁掉三份互相印证的记录。",
            transition: { type: "goto", nodeId: "witness-aftermath" },
          },
          {
            id: "stop-yangkang",
            text: "先扣住杨康右腕",
            description: "证词尚未说完，不能让他用死人截断旧案。",
            consumeDay: true,
            consequences: [
              { kind: "relation", npcId: "yangkang", delta: -10 },
            ],
            transition: {
              type: "battle",
              enemyId: "yangkang",
              onWin: {
                text: "你在匕首出袖前扣住杨康手腕，将他逼离段天德三步。段天德把完颜洪烈如何买通官差、如何追走包惜弱逐件说完。",
                consequences: [
                  { kind: "reputation", delta: 5 },
                  { kind: "arcVariant", arcId: "shendiao", key: "act4.duan", value: "witness-alive" },
                  { kind: "npcAlive", npcId: "duantiande", alive: true },
                  { kind: "npcTag", npcId: "duantiande", tag: "归云庄公开作证" },
                ],
                then: { type: "goto", nodeId: "witness-aftermath" },
              },
              onLose: {
                text: "杨康以左手爪势逼你松手，短匕随即刺入段天德胸口。郭靖扶住证人时，他只来得及再说出一次完颜洪烈的名字。",
                consequences: [
                  { kind: "arcVariant", arcId: "shendiao", key: "act4.duan", value: "silenced" },
                  { kind: "npcAlive", npcId: "duantiande", alive: false },
                ],
                then: { type: "goto", nodeId: "witness-aftermath" },
              },
              onFlee: {
                text: "你避开杨康爪势退到堂柱后。短匕已经没入段天德胸口，证词在最要紧处断了。",
                consequences: [
                  { kind: "arcVariant", arcId: "shendiao", key: "act4.duan", value: "silenced" },
                  { kind: "npcAlive", npcId: "duantiande", alive: false },
                ],
                then: { type: "goto", nodeId: "witness-aftermath" },
              },
            },
          },
          {
            id: "press-testimony",
            text: "逼他先报主谋姓名",
            description: "来不及铺陈旧事，先让堂上所有人听清谁是主谋。",
            consumeDay: true,
            consequences: [
              { kind: "relation", npcId: "guojing", delta: 2 },
              { kind: "arcVariant", arcId: "shendiao", key: "act4.duan", value: "name-recorded" },
              { kind: "npcAlive", npcId: "duantiande", alive: false },
            ],
            resultText: "段天德当众喊出完颜洪烈。下一刻，杨康的短匕已经刺进他背心。证人倒下了，主谋姓名却被满堂群雄听得清清楚楚。",
            transition: { type: "goto", nodeId: "witness-aftermath" },
          },
          {
            id: "open-water-gate",
            text: "替杨康打开后院水闸",
            description: "保住王府暗线，让他带段天德离开归云庄。",
            condition: { kind: "arcVariant", arcId: "shendiao", key: "act4.guiyun-entry", eq: "insider" },
            consumeDay: true,
            consequences: [
              { kind: "karma", delta: -5 },
              { kind: "relation", npcId: "yangkang", delta: 10 },
              { kind: "relation", npcId: "luchengfeng", delta: -10 },
              { kind: "arcVariant", arcId: "shendiao", key: "act4.duan", value: "escaped-with-yangkang" },
              { kind: "npcAlive", npcId: "duantiande", alive: true },
              { kind: "npcTag", npcId: "duantiande", tag: "被杨康带走" },
            ],
            resultText: "你割断后院水闸绳索，杨康挟着段天德跃上快船。郭靖追到码头时，船已经没入芦苇。杨康没有谢你，只把王府令牌留在石阶上。",
            transition: { type: "goto", nodeId: "witness-aftermath" },
          },
        ],
      },
      "witness-aftermath": {
        id: "witness-aftermath",
        title: "证词之后",
        text: "段天德的证词已经落定。正厅尚未收拾，一阵铁杖点地声便从庄外逼近。陆乘风扶住轮椅，郭靖握紧短剑，来人没有叩门，五指已经抓碎第一扇窗格。",
        autoNext: {
          type: "branch",
          cases: [
            {
              when: { kind: "arcVariant", arcId: "shendiao", key: "act4.duan", eq: "escaped-with-yangkang" },
              then: { type: "goto", nodeId: "witness-escaped" },
            },
            {
              when: { kind: "npcAlive", npcId: "duantiande", alive: true },
              then: { type: "goto", nodeId: "witness-alive" },
            },
          ],
          else: { type: "goto", nodeId: "witness-dead" },
        },
      },
      "witness-alive": {
        id: "witness-alive",
        title: "活证封存",
        text: "段天德被转入地牢，口供与物证分开封存。杨康站在堂外听完处置，没有认错，也没有再说自己不知情。",
        autoNext: { type: "goto", nodeId: "old-gate-debt" },
      },
      "witness-dead": {
        id: "witness-dead",
        title: "死证留名",
        text: "段天德死在堂上，陆乘风仍把众人听见的主谋姓名逐一记录。郭靖收起短剑，没有再答应杨康提出的结义。",
        autoNext: { type: "goto", nodeId: "old-gate-debt" },
      },
      "witness-escaped": {
        id: "witness-escaped",
        title: "水闸空船",
        text: "后院只剩被割断的闸绳。杨康带走段天德，也带走了唯一能替完颜洪烈改口的活证；王府令牌留在石阶上，成了一份没有署名的回信。",
        autoNext: { type: "goto", nodeId: "old-gate-debt" },
      },
      "old-gate-debt": {
        id: "old-gate-debt",
        title: "桃花旧门",
        text: "梅超风踏进正厅，铁杖在地上点出一道裂痕。她认出陆乘风的呼吸，也听见郭靖拔剑。梅超风：\"陆师弟，你请了这许多人，是要替师父清理门户，还是替江南七怪讨命？\"",
        choices: [
          {
            id: "guard-estate",
            text: "守住陆乘风身前",
            description: "旧门恩怨可以再说，先别让正厅变成死地。",
            consumeDay: true,
            consequences: [
              { kind: "relation", npcId: "luchengfeng", delta: 6 },
              { kind: "arcVariant", arcId: "shendiao", key: "act4.old-gate", value: "opposed-meichaofeng" },
            ],
            transition: {
              type: "battle",
              enemyId: "meichaofeng",
              onWin: {
                text: "你以堂柱挡开铁杖，再逼梅超风退出三步。她正要再进，庄外忽然响起一声玉箫，厅中众人同时停手。",
                consequences: [
                  { kind: "reputation", delta: 4 },
                  { kind: "relation", npcId: "guojing", delta: 4 },
                ],
                then: { type: "goto", nodeId: "east-heretic-arrives" },
              },
              onLose: {
                text: "铁杖扫断桌角，你被震退到屏风边。梅超风没有追击，庄外玉箫已压住她下一招。",
                consequences: [
                  { kind: "hp", delta: -25 },
                ],
                then: { type: "goto", nodeId: "east-heretic-arrives" },
              },
              onFlee: {
                text: "你退开正厅中线，让陆家弟子先撤。梅超风刚逼近轮椅，庄外玉箫已经响起。",
                then: { type: "goto", nodeId: "east-heretic-arrives" },
              },
            },
          },
          {
            id: "call-old-debt",
            text: "提起大漠旧人情",
            description: "她曾欠你一次退路，现在让她先收住铁杖。",
            condition: { kind: "npcHasTag", npcId: "meichaofeng", tag: "大漠欠玩家一份人情" },
            consumeDay: true,
            consequences: [
              { kind: "relation", npcId: "meichaofeng", delta: 8 },
              { kind: "arcVariant", arcId: "shendiao", key: "act4.old-gate", value: "old-debt-mediated" },
            ],
            resultText: "你报出大漠黑风夜留下的旧话。梅超风的铁杖停在陆乘风轮椅前。梅超风：\"我欠你一条路，不欠江南七怪。今日先听你把话说完。\"",
            transition: { type: "goto", nodeId: "east-heretic-arrives" },
          },
          {
            id: "return-scripture-trace",
            text: "交出九阴残图线索",
            description: "把大漠留下的残图摆到桃花旧门众人面前。",
            condition: {
              kind: "or",
              items: [
                { kind: "hasItem", id: "jiuyin-fragment-rubbing" },
                { kind: "hasItem", id: "qusan-palace-rubbing" },
              ],
            },
            consumeDay: true,
            consequences: [
              { kind: "relation", npcId: "meichaofeng", delta: 5 },
              { kind: "relation", npcId: "huangyaoshi-npc", delta: 4 },
              { kind: "arcVariant", arcId: "shendiao", key: "act4.old-gate", value: "traces-returned" },
            ],
            resultText: "你把残图与宫物桃花暗记放在桌上。梅超风认出经文运劲图，陆乘风则认出曲灵风留下的暗记。两人尚未开口，庄外玉箫已经响起。",
            transition: { type: "goto", nodeId: "east-heretic-arrives" },
          },
          {
            id: "hold-the-middle",
            text: "让两边各说一句",
            description: "不替任何一边出手，先把逐出师门与同门死伤分开说清。",
            consumeDay: true,
            consequences: [
              { kind: "aptitude", delta: 1 },
              { kind: "arcVariant", arcId: "shendiao", key: "act4.old-gate", value: "heard-both-sides" },
            ],
            resultText: "你拦住郭靖与陆家弟子，只让梅超风、陆乘风各说一遍当年经过。两边刚说到曲灵风，庄外玉箫便截断了争执。",
            transition: { type: "goto", nodeId: "east-heretic-arrives" },
          },
        ],
      },
      "east-heretic-arrives": {
        id: "east-heretic-arrives",
        title: "一声玉箫",
        text: "玉箫只响三声，厅中兵刃便尽数垂下。黄药师从庄门走进来，先看梅超风，再看陆乘风，最后扫过桌上的旧物与段天德口供。黄药师：\"我的弟子犯了错，自有我处置。外人要替桃花岛定罪，先站出来。\"",
        choices: [
          {
            id: "plead-for-lu",
            text: "替陆乘风求回师门",
            description: "他受迁怒多年，归云庄也一直守着抗金本心。",
            consumeDay: true,
            consequences: [
              { kind: "relation", npcId: "luchengfeng", delta: 8 },
              { kind: "relation", npcId: "huangyaoshi-npc", delta: 5 },
              { kind: "factionAttitude", factionId: "taohuadao", delta: 5 },
            ],
            resultText: "你把归云庄抗金、截船与保存证词逐件说清。黄药师没有答应，只让陆乘风明日带旧门信物去东海渡口。",
            transition: { type: "goto", nodeId: "guiyun-departure" },
          },
          {
            id: "plead-for-mei",
            text: "替梅超风留一条归路",
            description: "她的罪由她自己偿，不必再把旧门所有人一起逐尽。",
            consumeDay: true,
            consequences: [
              { kind: "relation", npcId: "meichaofeng", delta: 8 },
              { kind: "relation", npcId: "huangyaoshi-npc", delta: 2 },
            ],
            resultText: "黄药师让梅超风交回经文来历，再去清偿陈玄风与张阿生留下的血债。他没有说重收弟子，也没有再命陆乘风动手。",
            transition: { type: "goto", nodeId: "guiyun-departure" },
          },
          {
            id: "name-the-blame",
            text: "指出逐尽弟子是迁怒",
            description: "当着黄药师的面，把桃花岛旧债中最难听的一句说出来。",
            consumeDay: true,
            consequences: [
              { kind: "reputation", delta: 3 },
              { kind: "relation", npcId: "huangyaoshi-npc", delta: -3 },
            ],
            resultText: "正厅无人接话。黄药师看了你片刻，转向陆乘风。黄药师：\"腿是我打断的，话也是我说的。明日到岛上来，我给你一个交代。\"",
            transition: { type: "goto", nodeId: "guiyun-departure" },
          },
          {
            id: "leave-old-gate-to-them",
            text: "把旧门之事还给师徒",
            description: "你只保存段天德证词，不替桃花岛决定收放。",
            consumeDay: true,
            resultText: "你收起段天德证词，退到堂下。黄药师命梅超风与陆乘风各自带上旧物，明日随船回桃花岛。",
            transition: { type: "goto", nodeId: "guiyun-departure" },
          },
        ],
      },
      "guiyun-departure": {
        id: "guiyun-departure",
        title: "东海去路",
        text: "归云庄外停着三条船：郭靖与黄蓉准备从正港出海；黄药师的哑仆守着旧门信物；另一条白驼山快船带来欧阳锋求亲名帖。杨康留下的王府路引也能登上最后一条船。",
        choices: [
          {
            id: "sail-with-guo-huang",
            text: "随郭靖黄蓉出海",
            description: "从正港登岛，亲自面对黄药师与求亲试局。",
            consumeDay: true,
            consequences: [
              { kind: "relation", npcId: "guojing", delta: 4 },
              { kind: "relation", npcId: "huangrong", delta: 5 },
              { kind: "arcVariant", arcId: "shendiao", key: "act4.taohua-route", value: "guo-huang" },
            ],
            resultText: "你与郭靖、黄蓉同乘一船。黄蓉收起归云庄证词，只在舱门上留下一幅避开桃花阵外圈的简图。",
            transition: { type: "goto", nodeId: "guiyun-end" },
          },
          {
            id: "follow-old-gate",
            text: "跟桃花旧门的船",
            description: "陆乘风与梅超风都要回岛，旧债尚未真正结清。",
            condition: {
              kind: "or",
              items: [
                { kind: "arcVariant", arcId: "shendiao", key: "act4.old-gate", eq: "opposed-meichaofeng" },
                { kind: "arcVariant", arcId: "shendiao", key: "act4.old-gate", eq: "old-debt-mediated" },
                { kind: "arcVariant", arcId: "shendiao", key: "act4.old-gate", eq: "traces-returned" },
                { kind: "arcVariant", arcId: "shendiao", key: "act4.old-gate", eq: "heard-both-sides" },
              ],
            },
            consumeDay: true,
            consequences: [
              { kind: "relation", npcId: "huangyaoshi-npc", delta: 3 },
              { kind: "arcVariant", arcId: "shendiao", key: "act4.taohua-route", value: "old-gate" },
            ],
            resultText: "你把旧物封进木匣，随哑仆的船从侧港出海。陆乘风与梅超风隔舱而坐，一路没有再动兵刃。",
            transition: { type: "goto", nodeId: "guiyun-end" },
          },
          {
            id: "take-white-camel-ship",
            text: "持王府路引上白驼船",
            description: "以王府或杨康旧线身份进入欧阳锋的求亲队伍。",
            condition: {
              kind: "or",
              items: [
                { kind: "arcVariant", arcId: "shendiao", key: "act4.guiyun-entry", eq: "insider" },
                { kind: "relation", npcId: "yangkang", gte: 10 },
              ],
            },
            consumeDay: true,
            consequences: [
              { kind: "karma", delta: -2 },
              { kind: "relation", npcId: "ouyangfeng-npc", delta: 3 },
              { kind: "arcVariant", arcId: "shendiao", key: "act4.taohua-route", value: "white-camel" },
            ],
            resultText: "白驼山弟子验过王府路引，让你登上尾船。欧阳锋没有露面，欧阳克的蛇杖却已经摆在船头。",
            transition: { type: "goto", nodeId: "guiyun-end" },
          },
          {
            id: "charter-own-boat",
            text: "另雇海船独自登岛",
            description: "不替求亲或旧门任何一方站队，凭自己的来意入岛。",
            consumeDay: true,
            consequences: [
              { kind: "reputation", delta: 2 },
              { kind: "arcVariant", arcId: "shendiao", key: "act4.taohua-route", value: "independent" },
            ],
            resultText: "你另雇一艘小海船，只带归云庄水寨木牌与自己的兵刃。船家约定三天后来接，随即把船头对准东海。",
            transition: { type: "goto", nodeId: "guiyun-end" },
          },
        ],
      },
      "guiyun-end": {
        id: "guiyun-end",
        title: "五湖出海",
        text: "归云庄灯火渐远，三路海船先后驶出太湖水口。段天德的证词已有结果，杨康也再次作出选择；东海上的试局，将由不同身份重新开场。",
        onEnter: [
          { kind: "arcVariant", arcId: "shendiao", key: "act4.guiyun", value: "cleared" },
        ],
        autoNext: { type: "end" },
      },
    },
  },
  {
    id: "shendiao-taohua-act4",
    entryNode: "island-shore",
    locationId: "taohuadao",
    weight: 8,
    once: true,
    condition: {
      kind: "and",
      items: [
        { kind: "arcVariant", arcId: "shendiao", key: "act4.guiyun", eq: "cleared" },
        { kind: "not", item: { kind: "arcBeat", arcId: "shendiao", beat: "act4-taohua" } },
      ],
    },
    nodes: {
      "island-shore": {
        id: "island-shore",
        title: "桃花岛岸",
        text: "海船靠上石岸，桃林间没有迎客人，只有三条石径分别通向正门、箫声与一处刻着全真记号的山洞。远处白驼山大船也已经落帆，欧阳克带着蛇杖走上码头。",
        autoNext: {
          type: "branch",
          cases: [
            {
              when: { kind: "arcVariant", arcId: "shendiao", key: "act4.taohua-route", eq: "guo-huang" },
              then: { type: "goto", nodeId: "landing-guo-huang" },
            },
            {
              when: { kind: "arcVariant", arcId: "shendiao", key: "act4.taohua-route", eq: "old-gate" },
              then: { type: "goto", nodeId: "landing-old-gate" },
            },
            {
              when: { kind: "arcVariant", arcId: "shendiao", key: "act4.taohua-route", eq: "white-camel" },
              then: { type: "goto", nodeId: "landing-white-camel" },
            },
          ],
          else: { type: "goto", nodeId: "landing-independent" },
        },
      },
      "landing-guo-huang": {
        id: "landing-guo-huang",
        title: "正港登岛",
        text: "黄蓉带你与郭靖穿过第一重桃林。黄药师没有来接，只让哑仆送来一句话：欧阳锋已经替侄儿求亲，郭靖若要留下，便按岛上的规矩应试。",
        onEnter: [
          { kind: "arcVariant", arcId: "shendiao", key: "act4.island-entry", value: "guo-huang" },
        ],
        autoNext: { type: "goto", nodeId: "stone-cave" },
      },
      "landing-old-gate": {
        id: "landing-old-gate",
        title: "旧门回岛",
        text: "哑仆先把陆乘风与梅超风带去精舍。黄药师留下你，让你把归云庄旧物逐件放回原位。做完这些，他才用玉箫指向山后。黄药师：\"老顽童又拆了我的阵，你去把人找回来。\"",
        onEnter: [
          { kind: "arcVariant", arcId: "shendiao", key: "act4.island-entry", value: "old-gate" },
        ],
        autoNext: { type: "goto", nodeId: "stone-cave" },
      },
      "landing-white-camel": {
        id: "landing-white-camel",
        title: "白驼客船",
        text: "你随白驼山队伍从侧港登岛。欧阳锋只交代两件事：别碰岛上阵石，也别让郭靖安稳过试。欧阳克带人去正门，你则在桃林里先听见一阵又笑又骂的声音。",
        onEnter: [
          { kind: "arcVariant", arcId: "shendiao", key: "act4.island-entry", value: "white-camel" },
        ],
        autoNext: { type: "goto", nodeId: "stone-cave" },
      },
      "landing-independent": {
        id: "landing-independent",
        title: "独闯桃林",
        text: "你按潮声与树影走进桃林，三次回到同一块青石。第四次转弯时，林后有人把一颗桃核弹在你脚边。周伯通：\"别再走啦！你把这阵绕顺了，黄老邪又要怪我。\"",
        onEnter: [
          { kind: "arcVariant", arcId: "shendiao", key: "act4.island-entry", value: "independent" },
        ],
        autoNext: { type: "goto", nodeId: "stone-cave" },
      },
      "stone-cave": {
        id: "stone-cave",
        title: "老顽童的洞",
        text: "山洞里画满左右手互打的小人。周伯通把两根树枝塞到你手里，一根画圆，一根画方。周伯通：\"先别问经书。两只手若只会帮忙，不会打架，学什么都没趣。\"",
        choices: [
          {
            id: "play-first",
            text: "先陪他玩左右互搏",
            description: "不追问来历，照他的怪规矩把两只手分开用。",
            consumeDay: true,
            consequences: [
              { kind: "relation", npcId: "zhoubotong", delta: 10 },
              { kind: "aptitude", delta: 2 },
              { kind: "arcVariant", arcId: "shendiao", key: "act4.zhou", value: "played" },
            ],
            resultText: "你左手画圆，右手写字，十次里有九次缠成一团。周伯通笑得在地上打滚，却肯把空明拳的收劲法多演了三遍。",
            transition: { type: "goto", nodeId: "root-test" },
          },
          {
            id: "compare-empty-palm",
            text: "请他演空明拳",
            description: "先看清七十二路空明拳如何以虚接实。",
            consumeDay: true,
            consequences: [
              { kind: "attack", delta: 1 },
              { kind: "relation", npcId: "zhoubotong", delta: 6 },
              { kind: "arcVariant", arcId: "shendiao", key: "act4.zhou", value: "empty-palm" },
            ],
            resultText: "周伯通一掌按来，手臂软得像没有骨头，落到石壁前却突然收住。你照着练到第五路时，他又把前四路全改了一遍。",
            transition: { type: "goto", nodeId: "root-test" },
          },
          {
            id: "show-scripture-trace",
            text: "拿出九阴残图拓片",
            description: "把黑风夜留下的残缺运劲图交给真正保管过经书的人看。",
            condition: { kind: "hasItem", id: "jiuyin-fragment-rubbing" },
            consumeDay: true,
            consequences: [
              { kind: "relation", npcId: "zhoubotong", delta: 5 },
              { kind: "arcVariant", arcId: "shendiao", key: "act4.zhou", value: "scripture-trace" },
            ],
            resultText: "周伯通把拓片倒过来读了两遍，又在错乱处画了三个圈。周伯通：\"这是下卷里的东西，可少了半截。你别照着乱练，练反了又要怪我。\"",
            transition: { type: "goto", nodeId: "root-test" },
          },
        ],
      },
      "root-test": {
        id: "root-test",
        title: "第一试·根基",
        text: "桃花岛正厅外摆着三只石鼎。黄药师让郭靖、欧阳克各接黄蓉一掌，再以原地不退为限。轮到你时，他没有说明是在试你，还是让你替其中一方补位。",
        choices: [
          {
            id: "stand-your-ground",
            text: "自己接这一掌",
            description: "不借巧步，守住下盘，再看如何卸去余劲。",
            consumeDay: true,
            consequences: [
              { kind: "attack", delta: 1 },
              { kind: "relation", npcId: "huangyaoshi-npc", delta: 5 },
              { kind: "arcVariant", arcId: "shendiao", key: "act4.root-test", value: "steady" },
            ],
            resultText: "你双足未退，只把掌力从肩背引到石鼎。鼎中清水荡出大半，鼎脚却没有挪位。黄药师看了一眼湿地，没有评价。",
            transition: { type: "goto", nodeId: "flute-test" },
          },
          {
            id: "help-guojing-balance",
            text: "替郭靖指出落脚位",
            description: "不抢试题，只把阵石遮住的半步位置点给他。",
            consumeDay: true,
            consequences: [
              { kind: "relation", npcId: "guojing", delta: 6 },
              { kind: "relation", npcId: "huangrong", delta: 4 },
              { kind: "arcVariant", arcId: "shendiao", key: "act4.root-test", value: "assisted-guojing" },
            ],
            resultText: "你用鞋尖点出阵石后的实地。郭靖落脚后硬接一掌，退势正好止在石线前。黄蓉看见了，没有出声。",
            transition: { type: "goto", nodeId: "flute-test" },
          },
          {
            id: "study-ouyangke",
            text: "观察欧阳克借扇卸力",
            description: "白驼山的身法里藏着取巧，也藏着可用的门道。",
            condition: { kind: "arcVariant", arcId: "shendiao", key: "act4.island-entry", eq: "white-camel" },
            consumeDay: true,
            consequences: [
              { kind: "speed", delta: 2 },
              { kind: "relation", npcId: "ouyangfeng-npc", delta: 2 },
              { kind: "arcVariant", arcId: "shendiao", key: "act4.root-test", value: "studied-white-camel" },
            ],
            resultText: "你看清欧阳克用扇骨压住黄蓉腕势，再借衣袖遮住后撤半步。黄药师也看见了，只把石线向前挪了一寸。",
            transition: { type: "goto", nodeId: "flute-test" },
          },
        ],
      },
      "flute-test": {
        id: "flute-test",
        title: "第二试·听箫",
        text: "黄药师在海崖吹起碧海潮生曲。箫声先与潮声相合，随后忽高忽低。欧阳克盘膝运功，郭靖的呼吸却渐渐乱了。黄蓉站在父亲身后，不能出声提醒。",
        choices: [
          {
            id: "guard-breath",
            text: "守住自己的呼吸",
            description: "不与箫声相抗，只按周伯通方才教的空处收心。",
            consumeDay: true,
            consequences: [
              { kind: "mp", delta: 20 },
              { kind: "relation", npcId: "huangyaoshi-npc", delta: 5 },
              { kind: "arcVariant", arcId: "shendiao", key: "act4.flute-test", value: "calm" },
            ],
            resultText: "你把呼吸收在箫声转折之间，不追高音，也不躲低音。曲终时，衣角被海风吹动，脚下石屑却没有乱。",
            transition: { type: "goto", nodeId: "old-script-test" },
          },
          {
            id: "tap-guojing-rhythm",
            text: "以指节提醒郭靖换气",
            description: "在石后敲出大漠夜授的吐纳节拍。",
            consumeDay: true,
            consequences: [
              { kind: "relation", npcId: "guojing", delta: 6 },
              { kind: "relation", npcId: "huangrong", delta: 3 },
              { kind: "arcVariant", arcId: "shendiao", key: "act4.flute-test", value: "helped-guojing" },
            ],
            resultText: "你在石后敲出三长一短的换气节拍。郭靖循声调整吐纳，肩背重新放松。黄药师曲调未停，目光却往石后扫了一次。",
            transition: { type: "goto", nodeId: "old-script-test" },
          },
          {
            id: "break-the-echo",
            text: "弹石截断回声",
            description: "不碰箫声，只破坏海崖把曲调送回来的第二重回音。",
            consumeDay: true,
            consequences: [
              { kind: "aptitude", delta: 2 },
              { kind: "relation", npcId: "huangyaoshi-npc", delta: 2 },
              { kind: "arcVariant", arcId: "shendiao", key: "act4.flute-test", value: "broke-echo" },
            ],
            resultText: "你连续弹出三颗石子，击落海崖边的空贝壳。第二重回音骤然少了一角，欧阳克先睁开眼，黄药师也随即收住长音。",
            transition: { type: "goto", nodeId: "old-script-test" },
          },
        ],
      },
      "old-script-test": {
        id: "old-script-test",
        title: "第三试·旧经",
        text: "黄药师把一卷黄夫人手书放在案上，只展开三行。欧阳锋说郭靖背得出九阴经文，便该当场续下去；周伯通却在廊外连连摇头。卷上第三行的经脉次序，与大漠残图正好相反。",
        choices: [
          {
            id: "identify-reversed-line",
            text: "指出第三行次序颠倒",
            description: "用残图与运劲常理证明这不是可直接修炼的正序经文。",
            condition: { kind: "hasItem", id: "jiuyin-fragment-rubbing" },
            consumeDay: true,
            consequences: [
              { kind: "aptitude", delta: 2 },
              { kind: "relation", npcId: "huangyaoshi-npc", delta: 8 },
              { kind: "relation", npcId: "zhoubotong", delta: 4 },
              { kind: "arcVariant", arcId: "shendiao", key: "act4.script-test", value: "reversal-found" },
            ],
            resultText: "你把残图拓片压在手书旁，指出两处经脉不可能同向运行。周伯通从廊外探头。周伯通：\"总算有人先问真假，不是先问能不能练。\"",
            transition: { type: "goto", nodeId: "trial-verdict" },
          },
          {
            id: "let-guojing-recite",
            text: "让郭靖按所记背完",
            description: "不替他作答，也不让旁人把他的记忆说成偷学。",
            consumeDay: true,
            consequences: [
              { kind: "relation", npcId: "guojing", delta: 5 },
              { kind: "relation", npcId: "huangrong", delta: 4 },
              { kind: "arcVariant", arcId: "shendiao", key: "act4.script-test", value: "guojing-recalled" },
            ],
            resultText: "郭靖逐字背下周伯通教过的经文，遇到手书错序便停下说明。黄药师核过三处，不再追问经文来处。",
            transition: { type: "goto", nodeId: "trial-verdict" },
          },
          {
            id: "expose-white-camel-copy",
            text: "指出白驼山抄本少了一页",
            description: "你从白驼船上见过装订线，欧阳锋拿出的并非完整经卷。",
            condition: { kind: "arcVariant", arcId: "shendiao", key: "act4.island-entry", eq: "white-camel" },
            consumeDay: true,
            consequences: [
              { kind: "reputation", delta: 4 },
              { kind: "relation", npcId: "ouyangfeng-npc", delta: -8 },
              { kind: "relation", npcId: "huangyaoshi-npc", delta: 4 },
              { kind: "arcVariant", arcId: "shendiao", key: "act4.script-test", value: "white-camel-exposed" },
            ],
            resultText: "你指出抄本装订线少穿了一孔，缺页正是黄夫人手书的前后承接。欧阳锋收回经卷，没有再让欧阳克续背。",
            transition: { type: "goto", nodeId: "trial-verdict" },
          },
        ],
      },
      "trial-verdict": {
        id: "trial-verdict",
        title: "三试之后",
        text: "三试结束，黄药师没有把婚事判给胜负。他让郭靖回答是否仍守华筝婚约，也让欧阳克说明白驼山随行姬妾。黄蓉站在两人之间，没有替任何人开口。郭靖最终当众说清旧诺与眼下选择，黄药师只命众人明日离岛。",
        onEnter: [
          { kind: "factionAttitude", factionId: "taohuadao", delta: 10 },
          { kind: "relation", npcId: "huangrong", delta: 4 },
        ],
        autoNext: {
          type: "branch",
          cases: [
            {
              when: {
                kind: "and",
                items: [
                  { kind: "arcVariant", arcId: "shendiao", key: "act4.root-test", eq: "steady" },
                  { kind: "arcVariant", arcId: "shendiao", key: "act4.flute-test", eq: "calm" },
                  { kind: "arcVariant", arcId: "shendiao", key: "act4.script-test", eq: "reversal-found" },
                ],
              },
              then: { type: "goto", nodeId: "trial-recognized" },
            },
          ],
          else: { type: "goto", nodeId: "sea-departure" },
        },
      },
      "trial-recognized": {
        id: "trial-recognized",
        title: "东邪留帖",
        text: "黄药师在你离席前递来一张桃木短帖。黄药师：\"三试都没取巧，也没替旁人作主。往后持此帖登岛，不必再从外阵走。\"",
        onEnter: [
          { kind: "relation", npcId: "huangyaoshi-npc", delta: 8 },
          { kind: "npcRelationType", npcId: "huangyaoshi-npc", relationType: "朋友" },
        ],
        autoNext: { type: "goto", nodeId: "sea-departure" },
      },
      "sea-departure": {
        id: "sea-departure",
        title: "凶船出海",
        text: "次日海上起雾，哑仆却把众人引上一艘高舷旧船。周伯通在码头烧掉一叠经文，欧阳锋则逼郭靖默写九阴口诀。船舱里有硫黄味，底舱还不断传来木板刮擦声。",
        choices: [
          {
            id: "inspect-bilge",
            text: "下到底舱查硫黄味",
            description: "先找火油与引线，不等船离岸再问。",
            consumeDay: true,
            consequences: [
              { kind: "aptitude", delta: 2 },
              { kind: "arcVariant", arcId: "shendiao", key: "act4.fire-prep", value: "oil-found" },
            ],
            resultText: "你在压舱石后找到浸过油的麻绳，引线一直通到船尾。你没有立刻割断，只先记下两处起火点。",
            transition: { type: "goto", nodeId: "fire-ship" },
          },
          {
            id: "help-false-scripture",
            text: "帮郭靖把口诀倒写",
            description: "不给欧阳锋真经，也让伪经保留足够可信的经脉顺序。",
            consumeDay: true,
            consequences: [
              { kind: "relation", npcId: "guojing", delta: 5 },
              { kind: "arcVariant", arcId: "shendiao", key: "act4.fire-prep", value: "false-scripture" },
            ],
            resultText: "你把残图中的两处正序故意调换，郭靖再按周伯通教的口诀倒写。欧阳锋逐行收好，没有当场试练。",
            transition: { type: "goto", nodeId: "fire-ship" },
          },
          {
            id: "watch-snake-cages",
            text: "盯住白驼山蛇篓",
            description: "海里已有鲨群跟船，欧阳锋带毒蛇上船不会没有用处。",
            consumeDay: true,
            consequences: [
              { kind: "speed", delta: 1 },
              { kind: "arcVariant", arcId: "shendiao", key: "act4.fire-prep", value: "antivenom-kept" },
            ],
            resultText: "你从蛇篓底层取到一包解毒粉，也看见白驼弟子把毒血倒进海里。跟船鲨群很快翻白，海面却因此更加混乱。",
            transition: { type: "goto", nodeId: "fire-ship" },
          },
          {
            id: "stay-with-qigong",
            text: "守在洪七公身边",
            description: "欧阳锋没有在岛上翻脸，不代表他会在海上守规矩。",
            consumeDay: true,
            consequences: [
              { kind: "relation", npcId: "hongqigong", delta: 5 },
              { kind: "arcVariant", arcId: "shendiao", key: "act4.fire-prep", value: "guard-qigong" },
            ],
            resultText: "你留在洪七公身侧。老叫花看了看船帆，又看了看欧阳锋。洪七公：\"这船不对。等会儿若真烧起来，先把不会水的丢进小艇。\"",
            transition: { type: "goto", nodeId: "fire-ship" },
          },
        ],
      },
      "fire-ship": {
        id: "fire-ship",
        title: "船底起火",
        text: "入夜后船尾先冒黑烟，底舱随即窜出火舌。白驼弟子抢占小艇，几名船工却被反锁在舱门内。欧阳锋跃上断桅，洪七公反而先打碎舱门救人。",
        choices: [
          {
            id: "cut-oil-line",
            text: "割断第二道引线",
            description: "你已经查明火路，先让火势停在尾舱。",
            condition: { kind: "arcVariant", arcId: "shendiao", key: "act4.fire-prep", eq: "oil-found" },
            consumeDay: true,
            consequences: [
              { kind: "reputation", delta: 5 },
              { kind: "arcVariant", arcId: "shendiao", key: "act4.fire-response", value: "fire-contained" },
            ],
            resultText: "你钻进浓烟割断浸油麻绳，再把压舱沙推向火口。船仍在下沉，火势却没有立刻吞掉中舱。",
            transition: { type: "goto", nodeId: "qigong-rescue" },
          },
          {
            id: "free-crew",
            text: "砸开舱门救船工",
            description: "先把被锁的人送上木板与小艇。",
            consumeDay: true,
            consequences: [
              { kind: "karma", delta: 6 },
              { kind: "relation", npcId: "hongqigong", delta: 4 },
              { kind: "arcVariant", arcId: "shendiao", key: "act4.fire-response", value: "crew-rescued" },
            ],
            resultText: "你与洪七公一前一后砸开舱门，把船工推上浮木。最后一人刚离舱，主桅便带着火星倒进海里。",
            transition: { type: "goto", nodeId: "qigong-rescue" },
          },
          {
            id: "warn-qigong",
            text: "提醒洪七公防背后",
            description: "欧阳锋落水后仍在蓄力，救人不能把后背完全交出去。",
            consumeDay: true,
            consequences: [
              { kind: "relation", npcId: "hongqigong", delta: 6 },
              { kind: "arcVariant", arcId: "shendiao", key: "act4.fire-response", value: "qigong-warned" },
            ],
            resultText: "洪七公仍然把竹杖伸向落水的欧阳锋，却在拉人上木板时留了半步。欧阳锋反掌袭来，掌力只擦中他肩背。",
            transition: { type: "goto", nodeId: "qigong-rescue" },
          },
          {
            id: "secure-skiff",
            text: "先夺下白驼小艇",
            description: "没有退路，救下的人也只会继续困在火船旁。",
            consumeDay: true,
            consequences: [
              { kind: "speed", delta: 2 },
              { kind: "arcVariant", arcId: "shendiao", key: "act4.fire-response", value: "skiff-secured" },
            ],
            resultText: "你把两名白驼弟子逼离小艇，割断缆绳后回头接人。火船沉没前，郭靖、黄蓉与数名船工都登上了艇。",
            transition: { type: "goto", nodeId: "qigong-rescue" },
          },
        ],
      },
      "qigong-rescue": {
        id: "qigong-rescue",
        title: "救敌一杖",
        text: "欧阳锋抓住洪七公竹杖爬上浮木，下一掌却直取老叫花背心。洪七公没有后悔伸出竹杖，只借浮木翻身卸力。众人被海浪冲散，直到天亮才在一座荒岛重新会合。",
        autoNext: {
          type: "branch",
          cases: [
            {
              when: {
                kind: "or",
                items: [
                  { kind: "arcVariant", arcId: "shendiao", key: "act4.fire-response", eq: "qigong-warned" },
                  { kind: "arcVariant", arcId: "shendiao", key: "act4.fire-response", eq: "fire-contained" },
                ],
              },
              then: { type: "goto", nodeId: "qigong-light-injury" },
            },
          ],
          else: { type: "goto", nodeId: "qigong-heavy-injury" },
        },
      },
      "qigong-light-injury": {
        id: "qigong-light-injury",
        title: "留住一口真气",
        text: "洪七公肩背中掌，仍能自行运气封住经脉。黄蓉替他敷药时，他还能抬手敲郭靖一下。洪七公：\"救人没错。把西毒当君子，才是错。\"",
        onEnter: [
          { kind: "arcVariant", arcId: "shendiao", key: "act4.qigong-injury", value: "contained" },
          { kind: "npcTag", npcId: "hongqigong", tag: "海难轻伤" },
        ],
        autoNext: { type: "goto", nodeId: "island-survival" },
      },
      "qigong-heavy-injury": {
        id: "qigong-heavy-injury",
        title: "掌伤入脉",
        text: "洪七公背心掌印发黑，气息断续，只能由郭靖与黄蓉轮流护住心脉。竹杖落在礁石边，白驼山的人也已经登岛。",
        onEnter: [
          { kind: "arcVariant", arcId: "shendiao", key: "act4.qigong-injury", value: "severe" },
          { kind: "npcTag", npcId: "hongqigong", tag: "海难重伤" },
        ],
        autoNext: { type: "goto", nodeId: "island-survival" },
      },
      "island-survival": {
        id: "island-survival",
        title: "荒岛三难",
        text: "岛上只有一处淡水洼、两片能避风的岩洞和半艘冲上岸的破船。欧阳克带白驼弟子占住高处，欧阳锋则盯着郭靖写下的假经。入夜前必须先定下一件事。",
        choices: [
          {
            id: "guard-cave",
            text: "守住洪七公的岩洞",
            description: "让郭靖黄蓉去找食水，你挡住白驼山试探。",
            consumeDay: true,
            consequences: [
              { kind: "relation", npcId: "hongqigong", delta: 6 },
              { kind: "relation", npcId: "huangrong", delta: 4 },
              { kind: "arcVariant", arcId: "shendiao", key: "act4.survival", value: "guarded-cave" },
            ],
            resultText: "你在洞口摆下三处碎石警线。白驼弟子夜里试探两次，都被你提前截住，没有靠近洪七公半步。",
            transition: { type: "goto", nodeId: "beggar-succession" },
          },
          {
            id: "find-fresh-water",
            text: "沿鸟迹找淡水",
            description: "伤者与船工都撑不过两日，先解决饮水。",
            consumeDay: true,
            consequences: [
              { kind: "karma", delta: 4 },
              { kind: "reputation", delta: 3 },
              { kind: "arcVariant", arcId: "shendiao", key: "act4.survival", value: "water-found" },
            ],
            resultText: "你沿海鸟飞向找到岩缝渗水，又用破船帆布接成水槽。黄蓉把第一碗送进洪七公洞里，其余按伤者与船工人数分下去。",
            transition: { type: "goto", nodeId: "beggar-succession" },
          },
          {
            id: "set-rock-trap",
            text: "在高坡布落石机关",
            description: "欧阳克不断逼近，先把能用的地势变成退路。",
            consumeDay: true,
            consequences: [
              { kind: "aptitude", delta: 2 },
              { kind: "arcVariant", arcId: "shendiao", key: "act4.survival", value: "rock-trap" },
            ],
            resultText: "你与黄蓉把破船缆绳绕过岩缝，再以碎木撑住坡顶巨石。机关只封路，不会无故滚向下方营地。",
            transition: { type: "goto", nodeId: "beggar-succession" },
          },
          {
            id: "watch-false-scripture",
            text: "盯住欧阳锋练假经",
            description: "他若察觉经文有误，岛上所有人都会先受牵连。",
            condition: { kind: "arcVariant", arcId: "shendiao", key: "act4.fire-prep", eq: "false-scripture" },
            consumeDay: true,
            consequences: [
              { kind: "aptitude", delta: 2 },
              { kind: "relation", npcId: "guojing", delta: 3 },
              { kind: "arcVariant", arcId: "shendiao", key: "act4.survival", value: "watched-scripture" },
            ],
            resultText: "你远远记下欧阳锋试练到哪一段。假经第一处逆行尚未发作，他却已经命白驼弟子封住海岸。",
            transition: { type: "goto", nodeId: "beggar-succession" },
          },
        ],
      },
      "beggar-succession": {
        id: "beggar-succession",
        title: "竹杖托付",
        text: "洪七公把竹杖交给黄蓉，让她接下丐帮帮主之位。黄蓉没有推辞，只先问清帮中规矩、长老信物与君山大会日期。郭靖守在洞外，白驼山的人正在高坡重新集结。",
        choices: [
          {
            id: "guard-bamboo-staff",
            text: "替黄蓉护住竹杖",
            description: "传承由她来接，你负责让这根杖安全离岛。",
            consumeDay: true,
            consequences: [
              { kind: "relation", npcId: "huangrong", delta: 8 },
              { kind: "relation", npcId: "hongqigong", delta: 5 },
              { kind: "factionAttitude", factionId: "beggar", delta: 10 },
              { kind: "arcVariant", arcId: "shendiao", key: "act4.aftermath", value: "staff-guardian" },
            ],
            resultText: "你用布把竹杖缚在背后，先挡下两名白驼弟子的抢夺。黄蓉腾出手来调动船工守住淡水与伤者。",
            transition: { type: "goto", nodeId: "zhou-bridge" },
          },
          {
            id: "organize-castaways",
            text: "组织船工修船",
            description: "帮主之位不能替代海路，先把半艘破船重新推回水里。",
            consumeDay: true,
            consequences: [
              { kind: "reputation", delta: 5 },
              { kind: "karma", delta: 3 },
              { kind: "arcVariant", arcId: "shendiao", key: "act4.aftermath", value: "castaway-leader" },
            ],
            resultText: "你把能用的船板、桅布与淡水分成三组，带船工补好一艘小艇。洪七公与伤者先登船，其余人再按水性分批离岸。",
            transition: { type: "goto", nodeId: "zhou-bridge" },
          },
          {
            id: "drop-rock-on-ouyangke",
            text: "引欧阳克进落石线",
            description: "用先前布好的机关封住高坡追兵，不让他再逼近黄蓉。",
            condition: { kind: "arcVariant", arcId: "shendiao", key: "act4.survival", eq: "rock-trap" },
            consumeDay: true,
            consequences: [
              { kind: "relation", npcId: "huangrong", delta: 6 },
              { kind: "arcVariant", arcId: "shendiao", key: "act4.aftermath", value: "ouyangke-pinned" },
              { kind: "npcTag", npcId: "ouyangke", tag: "荒岛巨石压伤" },
            ],
            resultText: "欧阳克追到坡口时，你割断缆绳。巨石滚下封住去路，将他一腿压在岩缝间。欧阳锋忙着救人，白驼弟子再无暇追船。",
            transition: { type: "goto", nodeId: "zhou-bridge" },
          },
          {
            id: "tend-qigong",
            text: "留下替洪七公护脉",
            description: "重伤尚未稳定，先让黄蓉处理帮中与离岛事务。",
            condition: { kind: "arcVariant", arcId: "shendiao", key: "act4.qigong-injury", eq: "severe" },
            consumeDay: true,
            consequences: [
              { kind: "mp", delta: 20 },
              { kind: "relation", npcId: "hongqigong", delta: 8 },
              { kind: "arcVariant", arcId: "shendiao", key: "act4.aftermath", value: "qigong-tended" },
            ],
            resultText: "你按洪七公指示守住两处经脉，直到掌伤不再扩散。黄蓉处理完竹杖与船工，再回来接替你守夜。",
            transition: { type: "goto", nodeId: "zhou-bridge" },
          },
        ],
      },
      "zhou-bridge": {
        id: "zhou-bridge",
        title: "空明一别",
        text: "离岛前，周伯通从另一块浮木上爬进小艇，怀里还护着半袋湿透的桃核。他看过洪七公伤势，又把两根树枝塞回你手中。",
        autoNext: {
          type: "branch",
          cases: [
            {
              when: {
                kind: "or",
                items: [
                  { kind: "arcVariant", arcId: "shendiao", key: "act4.zhou", eq: "played" },
                  { kind: "arcVariant", arcId: "shendiao", key: "act4.zhou", eq: "empty-palm" },
                ],
              },
              then: { type: "goto", nodeId: "zhou-teaching" },
            },
          ],
          else: { type: "goto", nodeId: "aftermath-bridge" },
        },
      },
      "zhou-teaching": {
        id: "zhou-teaching",
        title: "七十二路空明",
        text: "周伯通把空明拳最要紧的虚实变化重新演了一遍，只许你先记十二路。周伯通：\"练顺了再来找我。没练顺也来，反正我一个人玩得闷。\"",
        onEnter: [
          { kind: "skill", id: "kongming" },
          { kind: "relation", npcId: "zhoubotong", delta: 5 },
        ],
        autoNext: { type: "goto", nodeId: "aftermath-bridge" },
      },
      "aftermath-bridge": {
        id: "aftermath-bridge",
        title: "荒岛离路",
        text: "破船已经补到能下水，海潮也转向西南。最后一批人登船前，荒岛上留下的局面仍要收住。",
        autoNext: {
          type: "branch",
          cases: [
            {
              when: { kind: "arcVariant", arcId: "shendiao", key: "act4.aftermath", eq: "staff-guardian" },
              then: { type: "goto", nodeId: "aftermath-staff" },
            },
            {
              when: { kind: "arcVariant", arcId: "shendiao", key: "act4.aftermath", eq: "castaway-leader" },
              then: { type: "goto", nodeId: "aftermath-castaways" },
            },
            {
              when: { kind: "arcVariant", arcId: "shendiao", key: "act4.aftermath", eq: "ouyangke-pinned" },
              then: { type: "goto", nodeId: "aftermath-ouyangke" },
            },
          ],
          else: { type: "goto", nodeId: "aftermath-qigong" },
        },
      },
      "aftermath-staff": {
        id: "aftermath-staff",
        title: "竹杖离岛",
        text: "你把竹杖交还黄蓉。她先安排丐帮弟子护送洪七公，再把君山大会的日期抄进路引册。竹杖没有在混战中落入白驼山手里。",
        autoNext: { type: "goto", nodeId: "act4-end" },
      },
      "aftermath-castaways": {
        id: "aftermath-castaways",
        title: "众人归舟",
        text: "船工、伤者与两边弟子按水性分批登船。最后一艘小艇离岸时，淡水与干粮仍够众人撑到江南。",
        autoNext: { type: "goto", nodeId: "act4-end" },
      },
      "aftermath-ouyangke": {
        id: "aftermath-ouyangke",
        title: "巨石留敌",
        text: "欧阳锋留在岛上救治欧阳克，只派两名弟子跟船。白驼山暂时无力追击，欧阳克的腿伤则会跟着他进入下一段江湖。",
        autoNext: { type: "goto", nodeId: "act4-end" },
      },
      "aftermath-qigong": {
        id: "aftermath-qigong",
        title: "护脉归航",
        text: "洪七公伤势终于稳住。黄蓉守着竹杖，郭靖守着船头，你与船工轮换掌舵，先把伤者送回江南。",
        autoNext: { type: "goto", nodeId: "act4-end" },
      },
      "act4-end": {
        id: "act4-end",
        title: "五湖桃花",
        text: "小艇离开荒岛时，归云庄证词、桃花旧门、求亲三试与海上暗算都有了结果。黄蓉带着竹杖去处理丐帮来信，郭靖护送洪七公回江南，武穆遗书的线索则重新指向临安。",
        onEnter: [
          { kind: "arcBeat", arcId: "shendiao", beat: "taohua", result: "done" },
          { kind: "arcBeat", arcId: "shendiao", beat: "act4-taohua", result: "done" },
          { kind: "reputation", delta: 8 },
          { kind: "factionAttitude", factionId: "taohuadao", delta: 10 },
        ],
        autoNext: { type: "end" },
      },
    },
  },
]
