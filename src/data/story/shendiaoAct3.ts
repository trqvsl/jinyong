import type { StoryEvent } from "./schema"

// 第三幕拆成两个地点事件：
// 张家口负责黄蓉初遇，中都负责比武招亲、王府旧案与洪七公试掌。
// 旧 meet-rong / qigong / wangfu beat 继续写入，只作为旧存档兼容锚点。
export const SHENDIAO_ACT3_STORY: StoryEvent[] = [
  {
    id: "shendiao-zhangjiakou",
    entryNode: "approach",
    locationId: "zhangjiakou",
    weight: 8,
    once: true,
    condition: {
      kind: "and",
      items: [
        { kind: "arcBeat", arcId: "shendiao", beat: "damos" },
        { kind: "not", item: { kind: "arcBeat", arcId: "shendiao", beat: "meet-rong" } },
        { kind: "not", item: { kind: "arcBeat", arcId: "shendiao", beat: "act3-zhongdu" } },
      ],
    },
    nodes: {
      approach: {
        id: "approach",
        title: "南下入关",
        text: "大漠以南，驿路渐宽，商旅也多了起来。张家口外的车队正在清点失踪马匹，泥地里除了驼印，还有几道细长蛇痕。几个白衣女子骑骆驼远远停在坡上，目光始终没有离开郭靖那匹小红马。",
        onEnter: [
          { kind: "flag", name: "shendiao.zhongdu.reworked", value: true },
        ],
        autoNext: {
          type: "branch",
          cases: [
            {
              when: { kind: "flag", name: "shendiao.damos.departure", eq: "with-guojing" },
              then: { type: "goto", nodeId: "road-together" },
            },
            {
              when: { kind: "flag", name: "shendiao.damos.departure", eq: "ahead" },
              then: { type: "goto", nodeId: "road-ahead" },
            },
            {
              when: { kind: "flag", name: "shendiao.damos.departure", eq: "grassland-duty" },
              then: { type: "goto", nodeId: "road-late" },
            },
            {
              when: { kind: "flag", name: "shendiao.damos.departure", eq: "quanzhen" },
              then: { type: "goto", nodeId: "road-quanzhen" },
            },
          ],
          else: { type: "goto", nodeId: "road-alone" },
        },
      },
      "road-together": {
        id: "road-together",
        title: "同行入关",
        text: "你与郭靖、六怪同路入关。柯镇恶听完车队失马的经过，只让众人看紧马匹。朱聪在一处驼印旁捡起半片白色蛇鳞，认出这是西域驭蛇人的手段。",
        onEnter: [
          { kind: "flag", name: "shendiao.zhongdu.entry", value: "with-guojing" },
        ],
        autoNext: { type: "goto", nodeId: "baituo-traces" },
      },
      "road-ahead": {
        id: "road-ahead",
        title: "先到一步",
        text: "你比郭靖一行早到张家口数日。城外商队连续丢马，几个护院却只敢说看见白衣与骆驼。等大漠来的小红马出现在驿道尽头，那些躲在坡后的目光立刻跟了过去。",
        onEnter: [
          { kind: "flag", name: "shendiao.zhongdu.entry", value: "ahead" },
        ],
        autoNext: { type: "goto", nodeId: "baituo-traces" },
      },
      "road-late": {
        id: "road-late",
        title: "草原来客",
        text: "你处理完草原军务才赶到张家口，腰间苍狼铜符还沾着路尘。郭靖已经进城，驿卒说他带着一匹罕见红马，引得几名白衣骆驼客一路打听。",
        onEnter: [
          { kind: "flag", name: "shendiao.zhongdu.entry", value: "late" },
        ],
        autoNext: { type: "goto", nodeId: "baituo-traces" },
      },
      "road-quanzhen": {
        id: "road-quanzhen",
        title: "终南回流",
        text: "你从终南山转入张家口，行囊里还压着马钰交代的口信。城外蛇痕与白衣骆驼客让全真门人多看了几眼，他们只认出这是白驼山一系，却不知对方为何盯上南下马队。",
        onEnter: [
          { kind: "flag", name: "shendiao.zhongdu.entry", value: "quanzhen" },
        ],
        autoNext: { type: "goto", nodeId: "baituo-traces" },
      },
      "road-alone": {
        id: "road-alone",
        title: "独自南下",
        text: "你独自来到张家口。城外商旅正为失踪马匹争吵，坡后几名白衣女子却牵着骆驼悄然离开。她们鞍侧悬着竹篓，篓缝里不时探出细蛇。",
        onEnter: [
          { kind: "flag", name: "shendiao.zhongdu.entry", value: "alone" },
        ],
        autoNext: { type: "goto", nodeId: "baituo-traces" },
      },
      "baituo-traces": {
        id: "baituo-traces",
        title: "白驼过境",
        text: "白衣人已经绕到马棚后方，一人拿出涂过药的肉块，另一人则去解小红马的缰绳。车队护院仍在前门争执，尚未发现后院动静。",
        choices: [
          {
            id: "warn-stable",
            text: "提醒马棚护院",
            description: "先保住商旅与马匹，再问这些白衣人从何而来。",
            consumeDay: true,
            consequences: [
              { kind: "karma", delta: 2 },
              { kind: "reputation", delta: 2 },
              { kind: "flag", name: "shendiao.zhongdu.baituo-trace", value: "warned" },
            ],
            resultText: "你敲响马棚铜盆，护院立刻堵住后门。白衣人没有恋战，只放出两条毒蛇拦路，随即乘骆驼退入坡后。朱聪从药肉里辨出白驼山常用的麻药。",
            transition: { type: "goto", nodeId: "beggar-table" },
          },
          {
            id: "inspect-snake-baskets",
            text: "先看蛇篓与马具",
            description: "不惊动对方，记下白驼山门人的器具和用药。",
            consumeDay: true,
            consequences: [
              { kind: "aptitude", delta: 2 },
              { kind: "flag", name: "shendiao.zhongdu.baituo-trace", value: "studied" },
            ],
            resultText: "你藏在草料架后，看清蛇篓扣法、驼鞍纹样与药肉气味。白衣人试了两次都没能牵走小红马，只得在护院回来前撤走。她们留下的一截丝绳绣着白驼峰纹。",
            transition: { type: "goto", nodeId: "beggar-table" },
          },
          {
            id: "follow-white-riders",
            text: "跟踪白衣骆驼客",
            description: "马匹不是唯一线索，先弄清她们为何往中都方向走。",
            consumeDay: true,
            consequences: [
              { kind: "speed", delta: 1 },
              { kind: "flag", name: "shendiao.zhongdu.baituo-trace", value: "followed" },
            ],
            resultText: "你跟出十余里，看见白衣人在岔路与一名王府信使交换名帖。名帖上的赵王府印只露了一角，对方已经收缰转向中都。",
            transition: { type: "goto", nodeId: "beggar-table" },
          },
        ],
      },
      "beggar-table": {
        id: "beggar-table",
        title: "张家口小叫花",
        text: "张家口酒楼里，一个满脸煤灰的小叫花点了鱼、鸡、果子和四样细点，尝过几口便逐盘挑起火候。掌柜见他衣衫破旧，已经带伙计堵住门口。小叫花把空钱袋倒扣在桌上，眼神却亮得不像走投无路。",
        choices: [
          {
            id: "pay-without-question",
            text: "结账，不问来历",
            description: "把他当普通同桌之人，不施舍，也不盘问。",
            consumeDay: true,
            consequences: [
              { kind: "gold", delta: -35 },
              { kind: "relation", npcId: "huangrong", delta: 12 },
              { kind: "flag", name: "shendiao.zhongdu.huangrong-approach", value: "equal" },
            ],
            resultText: "你把饭钱放在柜上，只让掌柜照数找零。小叫花没有道谢，反而把最后一碟点心推过来。小叫花：\"你既不问我是谁，这一碟便算我请。\"",
            transition: { type: "goto", nodeId: "gift-bridge" },
          },
          {
            id: "ask-disguise",
            text: "问他为何装穷",
            description: "不绕弯子，直接问这身打扮与一桌好菜为何对不上。",
            consumeDay: true,
            consequences: [
              { kind: "aptitude", delta: 1 },
              { kind: "relation", npcId: "huangrong", delta: 6 },
              { kind: "flag", name: "shendiao.zhongdu.huangrong-approach", value: "probe" },
            ],
            resultText: "你指出他指甲干净、口音不杂，点菜也熟知南北做法。小叫花抬眼看了你片刻。小叫花：\"看出来便看出来，何必急着替我另换一身衣裳？\"",
            transition: { type: "goto", nodeId: "gift-bridge" },
          },
          {
            id: "keep-secret",
            text: "点破后替他保密",
            description: "说明自己看出伪装，但不会当众拆穿。",
            consumeDay: true,
            consequences: [
              { kind: "relation", npcId: "huangrong", delta: 9 },
              { kind: "reputation", delta: 1 },
              { kind: "flag", name: "shendiao.zhongdu.huangrong-approach", value: "kept-secret" },
            ],
            resultText: "你只用一句话点出他不是真乞儿，随即替他挡住掌柜追问。小叫花重新拿起筷子。小叫花：\"嘴还算严。可你若想凭这个讨人情，便要失望了。\"",
            transition: { type: "goto", nodeId: "gift-bridge" },
          },
          {
            id: "stop-innkeeper",
            text: "拦住店家赶人",
            description: "饭钱可以再算，先别让几个伙计围着一人动手。",
            consumeDay: true,
            consequences: [
              { kind: "karma", delta: 3 },
              { kind: "relation", npcId: "huangrong", delta: 8 },
              { kind: "flag", name: "shendiao.zhongdu.huangrong-approach", value: "defended" },
            ],
            resultText: "你挡开伙计手里的木棍，让掌柜把账一项项算清。小叫花在旁听完，忽然从袖中摸出一小块碎银。小叫花：\"我不是没钱，只想看看这家店先认衣裳，还是先认客人。\"",
            transition: { type: "goto", nodeId: "gift-bridge" },
          },
        ],
      },
      "gift-bridge": {
        id: "gift-bridge",
        title: "一桌试探",
        text: "饭局散后，小叫花没有立即离开，只倚着门框看向驿道。远处传来小红马的蹄声，南下的人已经到了张家口。",
        autoNext: {
          type: "branch",
          cases: [
            {
              when: { kind: "flag", name: "shendiao.zhongdu.entry", eq: "with-guojing" },
              then: { type: "goto", nodeId: "gift-together" },
            },
            {
              when: { kind: "flag", name: "shendiao.zhongdu.entry", eq: "ahead" },
              then: { type: "goto", nodeId: "gift-ahead" },
            },
          ],
          else: { type: "goto", nodeId: "gift-reunion" },
        },
      },
      "gift-together": {
        id: "gift-together",
        title: "解衣赠马",
        text: "郭靖进店后听完经过，先替小叫花补足饭钱，又把御寒貂裘和随身金锭放到桌边。小叫花问他若自己是骗子怎么办。郭靖：\"你冷了便该有衣穿，饿了便该吃饭。是不是骗子，等有了凭据再说。\"临走时，他又把小红马的缰绳递了过去。",
        autoNext: { type: "goto", nodeId: "river-reveal" },
      },
      "gift-ahead": {
        id: "gift-ahead",
        title: "后来的人",
        text: "次日郭靖进城，也在酒楼碰见了那名小叫花。他不知道昨日那场试探，只见对方衣薄，便解下貂裘，又把金锭与小红马相赠。小叫花接过缰绳时回头看了你一眼，没有把昨日的事说破。",
        autoNext: { type: "goto", nodeId: "river-reveal" },
      },
      "gift-reunion": {
        id: "gift-reunion",
        title: "错过一席",
        text: "你赶到时，郭靖已经把貂裘、金锭与小红马送给了小叫花。掌柜仍在念叨这位北方青年出手太阔，小叫花却坐在河边等着，见你走近便把昨日酒楼里的事从头问了一遍。",
        autoNext: { type: "goto", nodeId: "river-reveal" },
      },
      "river-reveal": {
        id: "river-reveal",
        title: "冰河再见",
        text: "数日后，冰河边传来小红马嘶鸣。先前的小叫花换回白衣，洗净脸上煤灰，长发用金环束在肩后。她没有解释桃花岛，也没有说自己为何离家，只向郭靖和你报了姓名。黄蓉：\"我姓黄，单名一个蓉字。张家口这顿饭，往后可别算错了账。\"",
        onEnter: [
          { kind: "arcBeat", arcId: "shendiao", beat: "meet-rong", result: "done" },
          { kind: "relation", npcId: "huangrong", delta: 2 },
        ],
        autoNext: { type: "end" },
      },
    },
  },
  {
    id: "shendiao-zhongdu",
    entryNode: "city-gate",
    locationId: "zhongdu",
    weight: 8,
    once: true,
    condition: {
      kind: "and",
      items: [
        { kind: "arcBeat", arcId: "shendiao", beat: "meet-rong" },
        { kind: "not", item: { kind: "arcBeat", arcId: "shendiao", beat: "act3-zhongdu" } },
      ],
    },
    nodes: {
      "city-gate": {
        id: "city-gate",
        title: "中都城下",
        text: "中都城门外挤着车马与卖艺人，金兵逐一查验路引。城内近来聚了不少江湖高手：白驼山少主、黄河帮、长白山参客都住进赵王府。郭靖与黄蓉也已到城中，只是各自追的线索不同。",
        onEnter: [
          { kind: "flag", name: "shendiao.zhongdu.reworked", value: true },
        ],
        autoNext: { type: "goto", nodeId: "mu-family" },
      },
      "mu-family": {
        id: "mu-family",
        title: "穆易父女",
        text: "城南空地上插着一面比武招亲旗。自称穆易的中年汉子收起铁枪，红衣少女穆念慈则把一名闹事汉子送出圈外。旗边除了杨家枪，还立着一对镔铁短戟；两件兵器都不像普通卖艺人随手置办。",
        choices: [
          {
            id: "ask-who-they-seek",
            text: "问他们在找谁",
            description: "比武之外，这对父女还在找人。",
            consumeDay: true,
            consequences: [
              { kind: "relation", npcId: "yangtiexin", delta: 6 },
              { kind: "relation", npcId: "munianci", delta: 4 },
              { kind: "flag", name: "shendiao.zhongdu.mu-clue", value: "asked" },
            ],
            resultText: "穆易只说要找一位山东故人，以及那位故人的后人。听见你提起牛家村，他握枪的手紧了一下，却没有当街追问。",
            transition: { type: "goto", nodeId: "arena" },
          },
          {
            id: "inspect-weapons",
            text: "细看枪戟路数",
            description: "先从兵器与招式判断他们真正的来历。",
            consumeDay: true,
            consequences: [
              { kind: "aptitude", delta: 2 },
              { kind: "flag", name: "shendiao.zhongdu.mu-clue", value: "weapons" },
            ],
            resultText: "穆易收枪时用了半招回马枪，穆念慈看守的双戟则与郭家旧兵形制相近。你没有当众说破，只记下枪杆上一处被磨平的旧刻。",
            transition: { type: "goto", nodeId: "arena" },
          },
          {
            id: "warn-about-city",
            text: "提醒他们小心王府",
            description: "中都权贵眼线众多，这面旗迟早会引来麻烦。",
            consumeDay: true,
            consequences: [
              { kind: "relation", npcId: "munianci", delta: 8 },
              { kind: "reputation", delta: 1 },
              { kind: "flag", name: "shendiao.zhongdu.mu-clue", value: "warned" },
            ],
            resultText: "穆念慈把你的提醒转告义父。穆易没有收旗，只把兵器挪得更近。穆易：\"人若一直不来，我们便一直找。来了麻烦，也躲不过。\"",
            transition: { type: "goto", nodeId: "arena" },
          },
          {
            id: "report-to-palace",
            text: "记住模样，回府报信",
            description: "沿用牛家村旧差身份，先把可疑父女报给王府。",
            condition: { kind: "flag", name: "shendiao.niujia.departure", eq: "jin-retinue" },
            consumeDay: true,
            consequences: [
              { kind: "factionAttitude", factionId: "jin", delta: 5 },
              { kind: "relation", npcId: "yangkang", delta: 5 },
              { kind: "flag", name: "shendiao.zhongdu.mu-clue", value: "reported" },
            ],
            resultText: "你把父女相貌、兵器与落脚客店写进王府耳目簿。管事没有追问，只让你次日去擂台外围候命。名簿上已经记着穆易二字。",
            transition: { type: "goto", nodeId: "arena" },
          },
        ],
      },
      arena: {
        id: "arena",
        title: "比武招亲",
        text: "午后，一个锦衣公子拨开人群上台。杨康几招压住穆念慈，夺下她脚上一只绣鞋，却不肯照规矩认亲。穆易上前理论，王府亲兵随即围住擂台。郭靖从人群中挤到台边。郭靖：\"既不愿娶，便不该下场欺负人。\"",
        autoNext: { type: "goto", nodeId: "arena-crisis" },
      },
      "arena-crisis": {
        id: "arena-crisis",
        title: "擂台翻脸",
        text: "杨康把绣鞋抛给亲兵，反手便向郭靖胸口打去。他用的是全真掌法，变招时五指却忽然屈成爪势。穆念慈被两名亲兵拦在旗边，远处一辆王府马车也在此时停下。",
        choices: [
          {
            id: "stand-with-guojing",
            text: "与郭靖一同挡住杨康",
            description: "不让王府亲兵把擂台上的羞辱变成围杀。",
            consumeDay: true,
            consequences: [
              { kind: "relation", npcId: "guojing", delta: 8 },
              { kind: "relation", npcId: "yangkang", delta: -10 },
              { kind: "flag", name: "shendiao.zhongdu.arena", value: "opposed-yangkang" },
            ],
            transition: {
              type: "battle",
              enemyId: "yangkang",
              onWin: {
                text: "你与郭靖前后夹住杨康，逼得他退到旗杆旁。王府亲兵正要拔刀，一名青袍道人已经踏进人群，抬袖拦住双方。",
                consequences: [
                  { kind: "reputation", delta: 4 },
                  { kind: "relation", npcId: "munianci", delta: 8 },
                ],
                then: { type: "goto", nodeId: "arena-aftermath" },
              },
              onLose: {
                text: "杨康趁你立足未稳连出两掌，郭靖横身接住追击。青袍道人随即踏入场中，一掌把杨康与王府亲兵分开。",
                then: { type: "goto", nodeId: "arena-aftermath" },
              },
              onFlee: {
                text: "你退到穆易父女身前护住旗杆。郭靖仍留在台上与杨康对峙，直到一名青袍道人出手分开两人。",
                then: { type: "goto", nodeId: "arena-aftermath" },
              },
            },
          },
          {
            id: "protect-munianci",
            text: "先护穆念慈下台",
            description: "比起争胜，先别让王府亲兵扣住受辱之人。",
            consumeDay: true,
            consequences: [
              { kind: "relation", npcId: "munianci", delta: 14 },
              { kind: "karma", delta: 4 },
              { kind: "flag", name: "shendiao.zhongdu.arena", value: "protected-munianci" },
            ],
            resultText: "你撞开旗边亲兵，把穆念慈送到穆易身旁。郭靖仍在台上挡住杨康，直到一名青袍道人从人群中出手，才把双方分开。",
            transition: { type: "goto", nodeId: "arena-aftermath" },
          },
          {
            id: "follow-carriage",
            text: "跟住王府马车",
            description: "车中妇人听见穆易声音后反应有异，先查她去了哪里。",
            consumeDay: true,
            consequences: [
              { kind: "aptitude", delta: 2 },
              { kind: "flag", name: "shendiao.zhongdu.arena", value: "followed-baoxiruo" },
              { kind: "flag", name: "shendiao.zhongdu.escape-route", value: true },
            ],
            resultText: "你没有留在擂台，而是跟着马车绕到赵王府西门。车中妇人一路没有落帘，回府后却独自去了后院一处破旧农舍。",
            transition: { type: "goto", nodeId: "arena-aftermath" },
          },
          {
            id: "cover-yangkang",
            text: "替杨康收住场面",
            description: "拦住亲兵继续动手，让小王爷先回府。",
            condition: {
              kind: "or",
              items: [
                { kind: "flag", name: "shendiao.niujia.departure", eq: "jin-retinue" },
                { kind: "factionAttitude", factionId: "jin", gte: 10 },
              ],
            },
            consumeDay: true,
            consequences: [
              { kind: "relation", npcId: "yangkang", delta: 12 },
              { kind: "factionAttitude", factionId: "jin", delta: 4 },
              { kind: "karma", delta: -4 },
              { kind: "flag", name: "shendiao.zhongdu.arena", value: "covered-yangkang" },
            ],
            resultText: "你把继续拔刀的亲兵压回去，又让杨康先从侧巷离场。杨康经过时只说了一句。杨康：\"明日来府里，我记得你。\"",
            transition: { type: "goto", nodeId: "arena-aftermath" },
          },
        ],
      },
      "arena-aftermath": {
        id: "arena-aftermath",
        title: "玉阳子入局",
        text: "出手分开众人的是全真七子王处一。他认出杨康所用掌法，追问丘处机为何教出这样的弟子。杨康当众请他入赵王府赴宴。入夜后，王处一被郭靖扶回客店，右手已经发黑。王处一：\"酒里有毒。要救命，须取五味药。王府药房都有。\"",
        autoNext: { type: "goto", nodeId: "wangchuyi-poison" },
      },
      "wangchuyi-poison": {
        id: "wangchuyi-poison",
        title: "五味解药",
        text: "药方写着血竭、田七、熊胆、没药与一味矿药。城中药铺刚被王府尽数买空。黄蓉把王府西墙、药房和后院旧宅画在同一张纸上；穆易父女也在赴宴后失踪。",
        choices: [
          {
            id: "seek-medicine",
            text: "以取药救人为先",
            description: "先从药房下手，让王处一撑到天亮。",
            consumeDay: true,
            consequences: [
              { kind: "relation", npcId: "wangchuyi", delta: 8 },
              { kind: "karma", delta: 3 },
              { kind: "flag", name: "shendiao.zhongdu.objective", value: "medicine" },
            ],
            resultText: "你与黄蓉对过药名，决定由她接应送药，你负责清出从药房到西墙的路。",
            transition: { type: "goto", nodeId: "palace-gates" },
          },
          {
            id: "seek-old-courtyard",
            text: "先查后院旧宅",
            description: "擂台马车里的妇人与穆易旧事有关，不能让这条线断掉。",
            consumeDay: true,
            consequences: [
              { kind: "relation", npcId: "yangtiexin", delta: 5 },
              { kind: "flag", name: "shendiao.zhongdu.objective", value: "courtyard" },
            ],
            resultText: "你记下后院旧宅位置。黄蓉仍会设法取药，但旧宅与铁牢要由你继续查。",
            transition: { type: "goto", nodeId: "palace-gates" },
          },
          {
            id: "enter-as-insider",
            text: "借王府身份入内",
            description: "沿旧差或擂台人情走正门，先接差事再摸底。",
            condition: {
              kind: "or",
              items: [
                { kind: "flag", name: "shendiao.niujia.departure", eq: "jin-retinue" },
                { kind: "flag", name: "shendiao.zhongdu.arena", eq: "covered-yangkang" },
                { kind: "factionAttitude", factionId: "jin", gte: 10 },
              ],
            },
            consumeDay: true,
            consequences: [
              { kind: "factionAttitude", factionId: "jin", delta: 5 },
              { kind: "flag", name: "shendiao.zhongdu.objective", value: "inside" },
            ],
            resultText: "王府管事给了你一块当夜腰牌，让你协助西院换岗。你不必翻墙，却也会被每个熟面孔记住。",
            transition: { type: "goto", nodeId: "palace-gates" },
          },
          {
            id: "follow-huangrong",
            text: "与黄蓉分头潜入",
            description: "她取药，你去找穆易父女与王府旧案。",
            condition: { kind: "flag", name: "shendiao.zhongdu.huangrong-approach" },
            consumeDay: true,
            consequences: [
              { kind: "relation", npcId: "huangrong", delta: 8 },
              { kind: "flag", name: "shendiao.zhongdu.objective", value: "split" },
            ],
            resultText: "黄蓉拿走药方，从东墙入府。你则沿西侧沟渠摸向铁牢与后院。两人约定三更前在旧槐树下会合。",
            transition: { type: "goto", nodeId: "palace-gates" },
          },
        ],
      },
      "palace-gates": {
        id: "palace-gates",
        title: "赵王府群英",
        text: "赵王府三更仍灯火通明。香雪厅里坐着沙通天、彭连虎、梁子翁与白驼山少主欧阳克，席间正在谈武穆遗书和宋军旧阵。药房、铁牢与王妃旧院分在三处，巡夜路线每刻钟便换一次。",
        autoNext: {
          type: "branch",
          cases: [
            {
              when: { kind: "flag", name: "shendiao.zhongdu.objective", eq: "inside" },
              then: { type: "goto", nodeId: "palace-inside" },
            },
            {
              when: { kind: "flag", name: "shendiao.zhongdu.objective", eq: "medicine" },
              then: { type: "goto", nodeId: "palace-medicine" },
            },
            {
              when: { kind: "flag", name: "shendiao.zhongdu.objective", eq: "courtyard" },
              then: { type: "goto", nodeId: "palace-courtyard" },
            },
          ],
          else: { type: "goto", nodeId: "palace-split" },
        },
      },
      "palace-inside": {
        id: "palace-inside",
        title: "持牌入府",
        text: "你持腰牌从西门入府，管事让你把一份换岗册送去铁牢。册上恰好标出药房空档、后院侧门与铁牢守卫人数，但每过一道门都有人核对你的来路。",
        autoNext: { type: "goto", nodeId: "palace-crossroads" },
      },
      "palace-medicine": {
        id: "palace-medicine",
        title: "药房暗窗",
        text: "药房北窗没有上闩，窗下却系着一串细铃。黄蓉已经用鱼线挑住铃舌，朝你比了个手势。梁子翁的宝蛇就在隔壁药室游动。",
        autoNext: { type: "goto", nodeId: "palace-crossroads" },
      },
      "palace-courtyard": {
        id: "palace-courtyard",
        title: "旧院墙外",
        text: "后院深处果然立着一间江南农舍，破犁、木床与旧枪都从牛家村运来。院门外另有两名亲兵来回巡查，铁牢则在相邻回廊之后。",
        autoNext: { type: "goto", nodeId: "palace-crossroads" },
      },
      "palace-split": {
        id: "palace-split",
        title: "分头行事",
        text: "黄蓉先去药房，你沿西廊寻找铁牢。香雪厅里不时传来酒盏与笑声，欧阳克带来的白衣姬人则守住了东侧回廊。",
        autoNext: { type: "goto", nodeId: "palace-crossroads" },
      },
      "palace-crossroads": {
        id: "palace-crossroads",
        title: "王府三路",
        text: "换岗铜锣即将敲响。你只来得及先完成一件事，再转向铁牢：药房里五味解药已经配齐，旧院侧门尚未落锁，巡夜册也正放在值房桌上。",
        choices: [
          {
            id: "send-medicine",
            text: "取药送出西墙",
            description: "先让黄蓉把五味药送给王处一，换来城外接应。",
            consumeDay: true,
            consequences: [
              { kind: "relation", npcId: "wangchuyi", delta: 8 },
              { kind: "flag", name: "shendiao.zhongdu.wangchuyi-aid", value: true },
            ],
            resultText: "你取齐五味药，从西墙暗孔递给黄蓉。她立即送往客店，王处一服药后已能压住毒势，也让人去通知丘处机与马钰。",
            transition: { type: "goto", nodeId: "iron-prison" },
          },
          {
            id: "mark-side-gate",
            text: "先清出后院侧门",
            description: "移开门闩与拴马索，为穆易父女预留退路。",
            consumeDay: true,
            consequences: [
              { kind: "aptitude", delta: 1 },
              { kind: "flag", name: "shendiao.zhongdu.escape-route", value: true },
            ],
            resultText: "你卸下侧门横闩，把拴在巷后的两匹马移到墙根，又在岔路留下不显眼的布记。退路已经能走，只差把人带来。",
            transition: { type: "goto", nodeId: "iron-prison" },
          },
          {
            id: "alter-patrol",
            text: "改掉巡夜次序",
            description: "趁持牌在手，把西院两队亲兵调往东廊。",
            condition: {
              kind: "or",
              items: [
                { kind: "flag", name: "shendiao.niujia.departure", eq: "jin-retinue" },
                { kind: "flag", name: "shendiao.zhongdu.arena", eq: "covered-yangkang" },
                { kind: "factionAttitude", factionId: "jin", gte: 10 },
              ],
            },
            consumeDay: true,
            consequences: [
              { kind: "factionAttitude", factionId: "jin", delta: -3 },
              { kind: "flag", name: "shendiao.zhongdu.guards-delayed", value: true },
            ],
            resultText: "你在换岗册上调换两处签押，西院亲兵随即被叫去东廊搜人。等管事发现问题，铁牢外至少会空出一刻钟。",
            transition: { type: "goto", nodeId: "iron-prison" },
          },
          {
            id: "hear-wumu-plan",
            text: "窃听香雪厅",
            description: "先弄清王府为何召集群英，再决定把消息交给谁。",
            condition: { kind: "flag", name: "shendiao.zhongdu.baituo-trace" },
            consumeDay: true,
            consequences: [
              { kind: "aptitude", delta: 2 },
              { kind: "flag", name: "shendiao.zhongdu.wumu-rumor", value: true },
            ],
            resultText: "你在窗外听见完颜洪烈询问岳飞遗书下落，欧阳克与彭连虎都答应南下追查。席间还提到太湖水寨与一座归云庄。",
            transition: { type: "goto", nodeId: "iron-prison" },
          },
        ],
      },
      "iron-prison": {
        id: "iron-prison",
        title: "铁牢救人",
        text: "穆易父女果然被关在西院铁牢。穆易双手带伤，仍在用断簪磨锁；穆念慈守在门边听脚步。守卫再过片刻就会回来。",
        choices: [
          {
            id: "pick-lock",
            text: "开锁后引开守卫",
            description: "让父女先走，自己留下把追兵引向另一条回廊。",
            consumeDay: true,
            consequences: [
              { kind: "relation", npcId: "yangtiexin", delta: 8 },
              { kind: "relation", npcId: "munianci", delta: 8 },
              { kind: "flag", name: "shendiao.zhongdu.guards-delayed", value: true },
            ],
            resultText: "你挑开铁锁，让穆念慈扶义父先走，随后故意在东廊碰响灯架。守卫全被引向相反方向，父女却没有直接出府，而是转向王妃旧院。",
            transition: { type: "goto", nodeId: "old-courtyard" },
          },
          {
            id: "fight-guard",
            text: "截住铁牢守卫",
            description: "正面挡住追兵，为穆易父女争取离开时间。",
            consumeDay: true,
            transition: {
              type: "battle",
              enemyId: "wangfu-guard",
              onWin: {
                text: "你把守卫逼进值房，反锁房门。穆念慈已经扶着义父离开铁牢，前方只剩王妃旧院一处灯火。",
                consequences: [
                  { kind: "reputation", delta: 3 },
                  { kind: "flag", name: "shendiao.zhongdu.guards-delayed", value: true },
                ],
                then: { type: "goto", nodeId: "old-courtyard" },
              },
              onLose: {
                text: "守卫把你逼退到墙角，穆念慈从背后掷来飞针，三人才勉强冲出铁牢。铜锣已经响起，留给众人的时间不多。",
                then: { type: "goto", nodeId: "old-courtyard" },
              },
              onFlee: {
                text: "你撞翻火盆，借烟掩护穆易父女冲出铁牢。守卫很快重新追来，西院各门也开始落闩。",
                then: { type: "goto", nodeId: "old-courtyard" },
              },
            },
          },
          {
            id: "use-palace-order",
            text: "持令调走守卫",
            description: "用王府腰牌让守卫去香雪厅增援。",
            condition: {
              kind: "or",
              items: [
                { kind: "flag", name: "shendiao.zhongdu.objective", eq: "inside" },
                { kind: "flag", name: "shendiao.zhongdu.arena", eq: "covered-yangkang" },
              ],
            },
            consumeDay: true,
            consequences: [
              { kind: "relation", npcId: "yangkang", delta: 3 },
              { kind: "flag", name: "shendiao.zhongdu.guards-delayed", value: true },
            ],
            resultText: "守卫看过腰牌便匆匆赶往香雪厅。你打开铁牢，穆易却认出这里离王妃旧院极近，坚持要先去看一眼。",
            transition: { type: "goto", nodeId: "old-courtyard" },
          },
        ],
      },
      "old-courtyard": {
        id: "old-courtyard",
        title: "牛家旧院",
        text: "王府后院立着一座从江南搬来的旧屋。墙上挂着生锈铁枪，墙角放着半截破犁，桌椅板橱也与牛家村杨家旧宅相同。包惜弱听见脚步，提灯走出内室；她没有认出风霜满面的穆易。",
        choices: [
          {
            id: "tell-baoxiruo",
            text: "告诉她穆易就是杨铁心",
            description: "直接说破身份，把余下的话留给夫妻二人。",
            consumeDay: true,
            consequences: [
              { kind: "relation", npcId: "baoxiruo", delta: 10 },
              { kind: "flag", name: "shendiao.zhongdu.baoxiruo-ready", value: true },
            ],
            resultText: "包惜弱先看向穆易，又看向墙上旧枪，没有立即相信。穆易没有争辩，只走到破犁旁停下。",
            transition: { type: "goto", nodeId: "reunion" },
          },
          {
            id: "ask-about-old-plow",
            text: "只问这半截旧犁",
            description: "不替他们认亲，让旧物和旧话自己开口。",
            condition: { kind: "flag", name: "shendiao.zhongdu.mu-clue" },
            consumeDay: true,
            consequences: [
              { kind: "aptitude", delta: 1 },
              { kind: "relation", npcId: "yangtiexin", delta: 5 },
            ],
            resultText: "你问包惜弱为何把一截破犁从江南运到中都。她刚要回答，穆易已经伸手摸过犁头缺口。",
            transition: { type: "goto", nodeId: "reunion" },
          },
          {
            id: "secure-courtyard-exit",
            text: "先看住旧院侧门",
            description: "重逢要紧，退路也要紧，别让众人再次困在屋里。",
            consumeDay: true,
            consequences: [
              { kind: "reputation", delta: 1 },
              { kind: "flag", name: "shendiao.zhongdu.escape-route", value: true },
            ],
            resultText: "你没有打断二人，只去卸下侧门暗锁，又把一辆空车推到巷口遮住王府视线。院内很快传来穆易说话的声音。",
            transition: { type: "goto", nodeId: "reunion" },
          },
          {
            id: "show-bribe-slip",
            text: "取出调兵银契",
            description: "让包惜弱先看清牛家村围捕并非普通官差办案。",
            condition: { kind: "hasItem", id: "duan-bribe-slip" },
            consumeDay: true,
            consequences: [
              { kind: "relation", npcId: "baoxiruo", delta: 8 },
              { kind: "flag", name: "shendiao.zhongdu.wanyan-evidence", value: true },
            ],
            resultText: "银契上的段天德画押与赵王府侧印仍能辨认。包惜弱看完后扶住桌沿。包惜弱：\"那夜的官兵，是他叫来的？\"穆易没有立即回答，只走向墙边破犁。",
            transition: { type: "goto", nodeId: "reunion" },
          },
        ],
      },
      reunion: {
        id: "reunion",
        title: "犁头旧语",
        text: "穆易看着破犁，照十八年前的口气开口。杨铁心：\"犁头损啦，明儿叫东村张木儿加一斤半铁，打一打。\"包惜弱手里的灯晃了一下。她又看见墙上铁枪与抽屉里没缝完的青布衣，终于抓住杨铁心的手臂。包惜弱：\"铁哥，你还活着。\"",
        autoNext: { type: "goto", nodeId: "identity" },
      },
      identity: {
        id: "identity",
        title: "父子相见",
        text: "杨康撞开院门时，包惜弱正把铁枪上的名字指给他看。她说他本姓杨，不是完颜氏。杨康已经听懂，却仍握住枪杆。杨康：\"你们要我凭一句旧话，便舍掉十八年的父亲、母亲和王府？\"",
        choices: [
          {
            id: "show-conspiracy-evidence",
            text: "把王府主谋证物摆在桌上",
            description: "血统之外，先让他看完颜洪烈如何夺走这个家。",
            condition: { kind: "hasItem", id: "duan-bribe-slip" },
            consumeDay: true,
            consequences: [
              { kind: "relation", npcId: "yangkang", delta: -8 },
              { kind: "relation", npcId: "baoxiruo", delta: 5 },
              { kind: "flag", name: "shendiao.zhongdu.wanyan-evidence", value: true },
            ],
            resultText: "你把银契、腰牌与王府纹样逐件排开。杨康看完没有再说证物是假的，只把银契折回桌上。杨康：\"即便如此，养我十八年的人还是他。\"",
            transition: { type: "goto", nodeId: "escape-crisis" },
          },
          {
            id: "ask-him-to-check",
            text: "让他亲自查完颜洪烈",
            description: "不逼他当场认父，但要求他别把王府说法当成全部真相。",
            consumeDay: true,
            consequences: [
              { kind: "relation", npcId: "yangkang", delta: 3 },
              { kind: "flag", name: "shendiao.zhongdu.yangkang-choice", value: "investigate" },
            ],
            resultText: "你让杨康先去查段天德、牛家村调兵与旧院来历。杨康没有答应认父，却也没有再说杨铁心是骗子。他把枪横在门前，只让母亲随自己回内院。",
            transition: { type: "goto", nodeId: "escape-crisis" },
          },
          {
            id: "hold-exit",
            text: "不争辩，继续守住退路",
            description: "身份不是几句话能定的，先让夫妻二人活着离开王府。",
            consumeDay: true,
            consequences: [
              { kind: "karma", delta: 3 },
              { kind: "flag", name: "shendiao.zhongdu.escape-route", value: true },
            ],
            resultText: "你没有加入争辩，只把侧门推开。杨铁心扶住包惜弱，穆念慈已经牵来巷后的马。王府铜锣也在此时响遍西院。",
            transition: { type: "goto", nodeId: "escape-crisis" },
          },
          {
            id: "leave-yangkang-a-way-back",
            text: "替杨康留住王府身份",
            description: "告诉他先送父母离开，也不等于今夜便要舍弃一切。",
            condition: {
              kind: "or",
              items: [
                { kind: "flag", name: "shendiao.zhongdu.objective", eq: "inside" },
                { kind: "flag", name: "shendiao.zhongdu.arena", eq: "covered-yangkang" },
              ],
            },
            consumeDay: true,
            consequences: [
              { kind: "relation", npcId: "yangkang", delta: 10 },
              { kind: "karma", delta: -3 },
              { kind: "flag", name: "shendiao.zhongdu.yangkang-choice", value: "return-palace" },
            ],
            resultText: "你指出送父母出府不等于立刻交出世子身份。杨康眼神一动，却仍没有放下铁枪。门外亲兵已经开始撞门。",
            transition: { type: "goto", nodeId: "escape-crisis" },
          },
        ],
      },
      "escape-crisis": {
        id: "escape-crisis",
        title: "王府追兵",
        text: "杨铁心空手夺住枪杆，用半招回马枪逼退杨康，抱起包惜弱冲出旧院。完颜洪烈带亲兵追到西街，丘处机与马钰也从客店赶来。王府高手随即围住街口；夫妻二人不愿拖累众人，已经把断枪握在手里。",
        choices: [
          {
            id: "save-both",
            text: "按预留退路送走二人",
            description: "王处一接应、巡夜延误与侧门退路缺一不可。",
            condition: {
              kind: "and",
              items: [
                { kind: "flag", name: "shendiao.zhongdu.wangchuyi-aid", eq: true },
                { kind: "flag", name: "shendiao.zhongdu.guards-delayed", eq: true },
                { kind: "flag", name: "shendiao.zhongdu.escape-route", eq: true },
              ],
            },
            consumeDay: true,
            consequences: [
              { kind: "karma", delta: 12 },
              { kind: "relation", npcId: "yangtiexin", delta: 12 },
              { kind: "relation", npcId: "baoxiruo", delta: 12 },
              { kind: "npcAlive", npcId: "yangtiexin", alive: true },
              { kind: "npcAlive", npcId: "baoxiruo", alive: true },
              { kind: "npcTag", npcId: "yangtiexin", tag: "中都脱险" },
              { kind: "npcTag", npcId: "baoxiruo", tag: "中都脱险" },
              { kind: "flag", name: "shendiao.zhongdu.family-outcome", value: "both-live" },
            ],
            resultText: "王处一在西街接住追兵，换岗册又让王府亲兵迟到一刻。你按布记带夫妻二人穿过侧门，穆念慈驾车冲出城南。杨康追到城门，却没有下令放箭。",
            transition: { type: "goto", nodeId: "family-bridge" },
          },
          {
            id: "save-baoxiruo",
            text: "先把包惜弱送进暗巷",
            description: "退路已清，至少不能让她再次被困回王府。",
            condition: {
              kind: "or",
              items: [
                { kind: "flag", name: "shendiao.zhongdu.escape-route", eq: true },
                { kind: "flag", name: "shendiao.zhongdu.baoxiruo-ready", eq: true },
              ],
            },
            consumeDay: true,
            consequences: [
              { kind: "karma", delta: 7 },
              { kind: "relation", npcId: "baoxiruo", delta: 10 },
              { kind: "npcAlive", npcId: "yangtiexin", alive: false },
              { kind: "npcAlive", npcId: "baoxiruo", alive: true },
              { kind: "npcTag", npcId: "baoxiruo", tag: "中都脱险" },
              { kind: "flag", name: "shendiao.zhongdu.family-outcome", value: "baoxiruo-live" },
            ],
            resultText: "你与穆念慈把包惜弱送进暗巷，杨铁心独自回身截住追兵。等众人冲出南门，他已经倒在街口断枪旁。包惜弱没有回王府，只让穆念慈带她继续走。",
            transition: { type: "goto", nodeId: "family-bridge" },
          },
          {
            id: "save-yangtiexin",
            text: "截断追兵，护杨铁心出城",
            description: "巡夜已经被拖住，趁王府合围前抢出一人。",
            condition: { kind: "flag", name: "shendiao.zhongdu.guards-delayed", eq: true },
            consumeDay: true,
            consequences: [
              { kind: "karma", delta: 7 },
              { kind: "relation", npcId: "yangtiexin", delta: 10 },
              { kind: "npcAlive", npcId: "yangtiexin", alive: true },
              { kind: "npcAlive", npcId: "baoxiruo", alive: false },
              { kind: "npcTag", npcId: "yangtiexin", tag: "中都脱险" },
              { kind: "flag", name: "shendiao.zhongdu.family-outcome", value: "yangtiexin-live" },
            ],
            resultText: "你截住西街追兵，穆念慈扶义父翻出城墙。包惜弱却在乱箭中回身替杨铁心挡下一箭。杨康抱住母亲时，杨铁心已经被你带出城外。",
            transition: { type: "goto", nodeId: "family-bridge" },
          },
          {
            id: "hold-street",
            text: "与丘处机守住街口",
            description: "没有完整退路，只能先挡住王府群英。",
            consumeDay: true,
            consequences: [
              { kind: "karma", delta: 2 },
              { kind: "npcAlive", npcId: "yangtiexin", alive: false },
              { kind: "npcAlive", npcId: "baoxiruo", alive: false },
              { kind: "npcTag", npcId: "yangtiexin", tag: "中都殒命" },
              { kind: "npcTag", npcId: "baoxiruo", tag: "中都殒命" },
              { kind: "flag", name: "shendiao.zhongdu.family-outcome", value: "both-dead" },
            ],
            resultText: "众人挡住了王府高手，却没能在合围前清出退路。杨铁心不肯让丘处机等人为自己送命，回枪刺入胸口；包惜弱拔出断枪，也倒在他身旁。杨康冲到近前时已经来不及。",
            transition: { type: "goto", nodeId: "family-bridge" },
          },
        ],
      },
      "family-bridge": {
        id: "family-bridge",
        title: "郭杨分道",
        text: "天亮后，丘处机、马钰、江南六怪与穆念慈在城南会合。杨家旧事已经摊开，杨康却仍站在王府骑队一侧。丘处机看过郭靖，又看向自己教了多年的杨康。",
        autoNext: {
          type: "branch",
          cases: [
            {
              when: { kind: "flag", name: "shendiao.zhongdu.family-outcome", eq: "both-live" },
              then: { type: "goto", nodeId: "divide-both-live" },
            },
            {
              when: { kind: "flag", name: "shendiao.zhongdu.family-outcome", eq: "baoxiruo-live" },
              then: { type: "goto", nodeId: "divide-baoxiruo-live" },
            },
            {
              when: { kind: "flag", name: "shendiao.zhongdu.family-outcome", eq: "yangtiexin-live" },
              then: { type: "goto", nodeId: "divide-yangtiexin-live" },
            },
          ],
          else: { type: "goto", nodeId: "divide-tragedy" },
        },
      },
      "divide-both-live": {
        id: "divide-both-live",
        title: "活着离开",
        text: "杨铁心与包惜弱已经随穆念慈离城。杨康亲眼看着车马远去，仍没有追上去。他只摘下王府金冠看了一眼，随后重新戴好。杨康：\"他们活着，是你们的本事。我回不回王府，是我的事。\"",
        autoNext: { type: "goto", nodeId: "qiu-verdict" },
      },
      "divide-baoxiruo-live": {
        id: "divide-baoxiruo-live",
        title: "母子隔路",
        text: "包惜弱没有随杨康回府。她隔着城门叫了他一声康儿，杨康握紧马缰，却只让亲兵让开南路。穆念慈扶她上车后，王府骑队便转回城中。",
        autoNext: { type: "goto", nodeId: "qiu-verdict" },
      },
      "divide-yangtiexin-live": {
        id: "divide-yangtiexin-live",
        title: "父子隔路",
        text: "杨铁心带伤站在城外，杨康却留在完颜洪烈身边。断枪上的杨字已经无法否认，杨康仍只称他一声穆先生，随即拨马回城。",
        autoNext: { type: "goto", nodeId: "qiu-verdict" },
      },
      "divide-tragedy": {
        id: "divide-tragedy",
        title: "断枪之后",
        text: "穆念慈把杨铁心与包惜弱的遗物收在一处。杨康没有随王府众人立即离开，却也没有改口认父。他把母亲留下的短剑收入袖中，仍让亲兵称自己小王爷。",
        autoNext: { type: "goto", nodeId: "qiu-verdict" },
      },
      "qiu-verdict": {
        id: "qiu-verdict",
        title: "长春服输",
        text: "丘处机收剑向江南六怪行礼。丘处机：\"当年这场赌约，是贫道输了。靖儿武功未必处处胜过康儿，做人却已经胜了。\"郭靖没有应声，只把父亲郭啸天、牛家村围捕与金刀婚约逐件听完。",
        choices: [
          {
            id: "stand-with-guojing",
            text: "与郭靖一同查旧案",
            description: "先追完颜洪烈与王府南下线索，再谈各自婚约。",
            condition: {
              kind: "or",
              items: [
                { kind: "flag", name: "shendiao.zhongdu.wumu-rumor", eq: true },
                { kind: "relation", npcId: "guojing", gte: 0 },
              ],
            },
            consumeDay: true,
            consequences: [
              { kind: "relation", npcId: "guojing", delta: 10 },
              { kind: "npcRelationType", npcId: "guojing", relationType: "朋友" },
              { kind: "flag", name: "shendiao.zhongdu.departure", value: "guo-huang" },
            ],
            resultText: "你与郭靖把第一幕留下的证物重新理过。完颜洪烈召集群英南下绝非只为王府私怨，太湖与武穆遗书都成了下一条线。",
            transition: { type: "goto", nodeId: "beggar-chicken" },
          },
          {
            id: "urge-yangkang-investigate",
            text: "让杨康先查完颜洪烈",
            description: "不逼他立即改姓，但要求他亲手查清牛家村与段天德。",
            condition: {
              kind: "or",
              items: [
                { kind: "flag", name: "shendiao.zhongdu.wanyan-evidence", eq: true },
                { kind: "flag", name: "shendiao.zhongdu.yangkang-choice", eq: "investigate" },
                { kind: "relation", npcId: "yangkang", gte: 0 },
              ],
            },
            consumeDay: true,
            consequences: [
              { kind: "relation", npcId: "yangkang", delta: 6 },
              { kind: "flag", name: "shendiao.zhongdu.yangkang-choice", value: "investigate" },
              { kind: "flag", name: "shendiao.zhongdu.departure", value: "yangkang-shadow" },
            ],
            resultText: "杨康没有答应离开王府，只接过一份证物拓纹。杨康：\"若这些是真的，我会自己问。别指望我因此听你们摆布。\"",
            transition: { type: "goto", nodeId: "beggar-chicken" },
          },
          {
            id: "separate-blood-and-choice",
            text: "指出血统不等于立场",
            description: "姓杨还是完颜只说明来处，今后怎么做仍要自己负责。",
            consumeDay: true,
            consequences: [
              { kind: "karma", delta: 4 },
              { kind: "aptitude", delta: 1 },
              { kind: "flag", name: "shendiao.zhongdu.departure", value: "independent" },
            ],
            resultText: "郭靖认真听完，杨康却没有反驳。两人最终走向不同方向：一个留在城外，一个回到王府。谁也不能再把选择推给上一代。",
            transition: { type: "goto", nodeId: "beggar-chicken" },
          },
          {
            id: "leave-palace-route",
            text: "替杨康留一条王府退路",
            description: "继续利用王府身份，不让今夜旧案立刻断掉。",
            condition: {
              kind: "or",
              items: [
                { kind: "flag", name: "shendiao.zhongdu.objective", eq: "inside" },
                { kind: "flag", name: "shendiao.zhongdu.arena", eq: "covered-yangkang" },
              ],
            },
            consumeDay: true,
            consequences: [
              { kind: "relation", npcId: "yangkang", delta: 10 },
              { kind: "relation", npcId: "guojing", delta: -6 },
              { kind: "factionAttitude", factionId: "jin", delta: 5 },
              { kind: "flag", name: "shendiao.zhongdu.departure", value: "wangfu-inside" },
            ],
            resultText: "你让杨康先回府稳住完颜洪烈，也保住自己的内线身份。郭靖没有赞同，只说往后若王府再害人，他仍会出手。",
            transition: { type: "goto", nodeId: "beggar-chicken" },
          },
        ],
      },
      "beggar-chicken": {
        id: "beggar-chicken",
        title: "叫花与一掌",
        text: "离开中都数日，林边传来烤鸡香。洪七公守着火堆，黄蓉正把调好的盐抹进鸡腹。一个小乞儿抱着受伤同伴来到路边，洪七公没有先问众人会多少武功，只把剩下半只鸡放在石上。",
        choices: [
          {
            id: "share-food",
            text: "先把食物分给伤者",
            description: "人还饿着，传不传功都该等吃完再说。",
            consumeDay: true,
            consequences: [
              { kind: "relation", npcId: "hongqigong", delta: 10 },
              { kind: "karma", delta: 4 },
              { kind: "hp", delta: 20 },
            ],
            resultText: "你把鸡肉与干粮先分给两个小乞儿，自己只留一碗汤。洪七公看见后啃完鸡腿，把骨头往火里一丢。洪七公：\"肯分吃的，才有资格谈别的。\"",
            transition: { type: "goto", nodeId: "palm-test" },
          },
          {
            id: "carry-message",
            text: "替丐帮送一封急信",
            description: "把中都王府与武穆遗书的消息送到前哨。",
            consumeDay: true,
            consequences: [
              { kind: "relation", npcId: "hongqigong", delta: 8 },
              { kind: "factionAttitude", factionId: "beggar", delta: 8 },
              { kind: "reputation", delta: 2 },
            ],
            resultText: "你把王府群英南下与太湖线索送到丐帮前哨，回来时洪七公已经吃完第二只鸡。他只问信有没有交到对的人手里，没有问路上用了几招。",
            transition: { type: "goto", nodeId: "palm-test" },
          },
          {
            id: "ask-for-palm",
            text: "直接请洪七公试掌",
            description: "不绕弯子，先让他看看自己的根基够不够。",
            consumeDay: true,
            consequences: [
              { kind: "relation", npcId: "hongqigong", delta: 3 },
              { kind: "aptitude", delta: 1 },
            ],
            resultText: "洪七公让你先打三遍惯用掌法，看到第二遍便用竹棒敲低你的肩。洪七公：\"先把这股争强的劲收回去，再谈降龙。\"",
            transition: { type: "goto", nodeId: "palm-test" },
          },
          {
            id: "watch-guojing",
            text: "先看郭靖如何练",
            description: "不急着求招，先看洪七公为何选中这套掌路。",
            consumeDay: true,
            consequences: [
              { kind: "aptitude", delta: 2 },
              { kind: "relation", npcId: "guojing", delta: 3 },
            ],
            resultText: "你站在火堆外看郭靖出掌。洪七公不许他只顾刚猛，每次掌力打满便用竹棒敲回去。第三十遍时，郭靖终于能在树干震动前先收住半步。",
            transition: { type: "goto", nodeId: "palm-test" },
          },
        ],
      },
      "palm-test": {
        id: "palm-test",
        title: "亢龙有悔",
        text: "洪七公左腿微屈，右掌画圆推出。枯叶被掌风卷起，却在撞上树干前忽然向两侧散开。洪七公：\"亢龙有悔，难的不在发，是发出去还能收。你若只图一掌把人打死，这招便不该学。\"",
        autoNext: {
          type: "branch",
          cases: [
            {
              when: {
                kind: "and",
                items: [
                  { kind: "relation", npcId: "hongqigong", gte: 8 },
                  { kind: "karma", gte: 0 },
                ],
              },
              then: { type: "goto", nodeId: "hong-teaching" },
            },
          ],
          else: { type: "goto", nodeId: "hong-glimpse" },
        },
      },
      "hong-teaching": {
        id: "hong-teaching",
        title: "掌留余地",
        text: "洪七公让你从脚下重新发力，肩、肘、腕逐处收紧又放松。第十遍推出时，树皮震落，掌心却仍留着回身余力。洪七公：\"这一掌先记住。以后肯不肯教第二掌，看你拿它去做什么。\"",
        onEnter: [
          { kind: "skill", id: "xianglong18" },
          { kind: "arcBeat", arcId: "shendiao", beat: "qigong", result: "won" },
          { kind: "relation", npcId: "hongqigong", delta: 4 },
          { kind: "npcRelationType", npcId: "hongqigong", relationType: "师徒" },
        ],
        autoNext: { type: "goto", nodeId: "act-end" },
      },
      "hong-glimpse": {
        id: "hong-glimpse",
        title: "只看一掌",
        text: "洪七公没有正式传你口诀，只让你站在侧面看郭靖练到收放由心。临走前，他用竹棒点了点你惯用招式的一处空门。洪七公：\"先把自己的功夫练明白，再来找老叫花。\"",
        onEnter: [
          { kind: "arcBeat", arcId: "shendiao", beat: "qigong", result: "done" },
          { kind: "aptitude", delta: 2 },
          { kind: "attack", delta: 1 },
        ],
        autoNext: { type: "goto", nodeId: "act-end" },
      },
      "act-end": {
        id: "act-end",
        title: "中都照影",
        text: "中都旧案已经拆开。杨康知道了身世，完颜洪烈的手也伸向武穆遗书，王府群英则沿水路陆续南下。离城前定下的方向，将决定下一程从哪条水路接上。",
        onEnter: [
          { kind: "arcBeat", arcId: "shendiao", beat: "wangfu", result: "done" },
          { kind: "arcBeat", arcId: "shendiao", beat: "act3-zhongdu", result: "done" },
        ],
        autoNext: {
          type: "branch",
          cases: [
            {
              when: { kind: "flag", name: "shendiao.zhongdu.departure", eq: "guo-huang" },
              then: { type: "goto", nodeId: "act-end-guo-huang" },
            },
            {
              when: {
                kind: "or",
                items: [
                  { kind: "flag", name: "shendiao.zhongdu.departure", eq: "yangkang-shadow" },
                  { kind: "flag", name: "shendiao.zhongdu.departure", eq: "wangfu-inside" },
                ],
              },
              then: { type: "goto", nodeId: "act-end-wangfu" },
            },
            {
              when: { kind: "flag", name: "shendiao.zhongdu.departure", eq: "independent" },
              then: { type: "goto", nodeId: "act-end-independent" },
            },
          ],
          else: { type: "goto", nodeId: "act-end-default" },
        },
      },
      "act-end-guo-huang": {
        id: "act-end-guo-huang",
        title: "同路南下",
        text: "黄蓉把太湖渡口与归云庄写在路引册上，郭靖收好短剑。三人先沿水路追王府群英，也继续查武穆遗书的去向。",
        autoNext: { type: "end" },
      },
      "act-end-wangfu": {
        id: "act-end-wangfu",
        title: "王府暗线",
        text: "杨康与王府群英已经南下。你保留着中都内线与一份真假难辨的王府路引，下一程可以跟着他们进入太湖，也可以把消息先交给郭靖。",
        autoNext: { type: "end" },
      },
      "act-end-independent": {
        id: "act-end-independent",
        title: "独走水路",
        text: "你没有完全站到郭靖或王府一侧，只把太湖、归云庄与武穆遗书记进路引册。水路上的各方都还不知道你会从哪边进场。",
        autoNext: { type: "end" },
      },
      "act-end-default": {
        id: "act-end-default",
        title: "南路再会",
        text: "中都众人先后转向南方。黄蓉留下太湖渡口位置，郭靖则带着短剑继续查完颜洪烈，下一次会合要到水路上再说。",
        autoNext: { type: "end" },
      },
    },
  },
]
