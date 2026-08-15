import type { StoryEvent } from "./schema"

// 第五幕拆成六个地点事件：
// 临安禁宫、牛家村密室、君山大会、铁掌峰、黑沼、一灯居。
// 幕内版本统一写入 arcVariant，最终由 act5-old-debts 收束。
export const SHENDIAO_ACT5_STORY: StoryEvent[] = [
  {
    id: "shendiao-linan-act5",
    entryNode: "palace-rumor",
    locationId: "linan",
    weight: 8,
    once: true,
    condition: {
      kind: "and",
      items: [
        { kind: "arcBeat", arcId: "shendiao", beat: "act4-taohua" },
        { kind: "not", item: { kind: "arcBeat", arcId: "shendiao", beat: "act5-old-debts" } },
        { kind: "not", item: { kind: "arcVariant", arcId: "shendiao", key: "act5.palace", eq: "cleared" } },
      ],
    },
    nodes: {
      "palace-rumor": {
        id: "palace-rumor",
        title: "禁宫旧图",
        text: "临安夜禁前，三路消息同时送到客舍：丐帮弟子说洪七公要查禁宫密库；归云庄封存的钦使名册写着武穆遗书旧档；曲灵风留下的宫物纹记则与城墙下一处排水门完全相合。",
        choices: [
          {
            id: "enter-with-beggars",
            text: "随丐帮从御街入宫",
            description: "先接应洪七公与黄蓉，沿巡夜换岗空隙进入禁宫。",
            consumeDay: true,
            consequences: [
              { kind: "relation", npcId: "hongqigong", delta: 5 },
              { kind: "factionAttitude", factionId: "beggar", delta: 4 },
              { kind: "arcVariant", arcId: "shendiao", key: "act5.palace-entry", value: "beggar" },
            ],
            resultText: "鲁有脚安排两队弟子在御街外制造争执，洪七公带你与郭靖翻过东墙。黄蓉已经记下三轮换岗时辰。",
            transition: { type: "goto", nodeId: "imperial-archive" },
          },
          {
            id: "follow-palace-agent",
            text: "跟住王府密使",
            description: "赵王府比众人早一步拿到宫门腰牌，先看他们要找哪一份档案。",
            consumeDay: true,
            consequences: [
              { kind: "relation", npcId: "yangkang", delta: 3 },
              { kind: "arcVariant", arcId: "shendiao", key: "act5.palace-entry", value: "wangfu" },
            ],
            resultText: "你跟着王府密使混入运炭车队。对方没有去兵器库，而是直奔存放旧军档的西阁。",
            transition: { type: "goto", nodeId: "imperial-archive" },
          },
          {
            id: "use-qusan-mark",
            text: "按曲灵风暗记走排水门",
            description: "第一幕留下的宫物纹记，正好能补全墙下旧道入口。",
            condition: { kind: "hasItem", id: "qusan-palace-rubbing" },
            consumeDay: true,
            consequences: [
              { kind: "relation", npcId: "huangyaoshi-npc", delta: 3 },
              { kind: "aptitude", delta: 2 },
              { kind: "arcVariant", arcId: "shendiao", key: "act5.palace-entry", value: "qusan-route" },
            ],
            resultText: "你对照拓纹移开排水门第三块旧砖，门后果然刻着半枚桃花。地道绕过两层宫墙，出口就在西阁书架下。",
            transition: { type: "goto", nodeId: "imperial-archive" },
          },
          {
            id: "climb-watchtower",
            text: "先登望楼看巡防",
            description: "不急着选边，先把禁宫火点、守卫与车马路线记清。",
            consumeDay: true,
            consequences: [
              { kind: "speed", delta: 1 },
              { kind: "aptitude", delta: 1 },
              { kind: "arcVariant", arcId: "shendiao", key: "act5.palace-entry", value: "scout" },
            ],
            resultText: "你从相邻酒楼屋脊看清巡防：西阁门前守卫最少，地下却每隔一刻钟便有人送出旧档木箱。",
            transition: { type: "goto", nodeId: "imperial-archive" },
          },
        ],
      },
      "imperial-archive": {
        id: "imperial-archive",
        title: "旧军档库",
        text: "西阁地下一排排木架都标着旧年军号。武穆遗书原本不在宫中，档案却记着临安旧库、铁掌峰禁地与一条经牛家村转运的密道。王府密使已在另一侧翻找同一批卷宗。",
        choices: [
          {
            id: "copy-transfer-ledger",
            text: "抄下兵书转运簿",
            description: "先固定武穆遗书从禁宫转往铁掌峰的时间与接手人。",
            consumeDay: true,
            consequences: [
              { kind: "reputation", delta: 3 },
              { kind: "arcVariant", arcId: "shendiao", key: "act5.palace-clue", value: "transfer-ledger" },
            ],
            resultText: "你抄下三页转运记录。最后一次交接盖着铁掌帮暗印，旁边另记牛家村曲家酒馆的旧地道。",
            transition: { type: "goto", nodeId: "palace-alarm" },
          },
          {
            id: "protect-qigong",
            text: "先替洪七公守住出口",
            description: "老伤未愈，西毒若追来，不能让洪七公再独自断后。",
            condition: {
              kind: "or",
              items: [
                { kind: "arcVariant", arcId: "shendiao", key: "act5.palace-entry", eq: "beggar" },
                { kind: "arcVariant", arcId: "shendiao", key: "act4.qigong-injury", eq: "severe" },
              ],
            },
            consumeDay: true,
            consequences: [
              { kind: "relation", npcId: "hongqigong", delta: 7 },
              { kind: "arcVariant", arcId: "shendiao", key: "act5.palace-clue", value: "qigong-guarded" },
            ],
            resultText: "你没有继续翻架，只把地道出口与西阁楼梯守住。洪七公取到旧军档时，外面的脚步仍没能逼进档库。",
            transition: { type: "goto", nodeId: "palace-alarm" },
          },
          {
            id: "take-palace-seal",
            text: "调换王府密使的宫门印",
            description: "留下他们曾入禁宫的实证，也让追兵先去查王府车队。",
            condition: { kind: "arcVariant", arcId: "shendiao", key: "act5.palace-entry", eq: "wangfu" },
            consumeDay: true,
            consequences: [
              { kind: "karma", delta: -1 },
              { kind: "relation", npcId: "yangkang", delta: -4 },
              { kind: "arcVariant", arcId: "shendiao", key: "act5.palace-clue", value: "palace-seal" },
            ],
            resultText: "你把王府宫门印换进空档匣，再拿走一枚无字铜牌。巡夜守卫很快从西阁搜出赵王府印记。",
            transition: { type: "goto", nodeId: "palace-alarm" },
          },
          {
            id: "trace-hidden-tunnel",
            text: "拓下书架后的地道刻线",
            description: "曲灵风的暗记不只通向宫外，还继续指向牛家村。",
            condition: { kind: "arcVariant", arcId: "shendiao", key: "act5.palace-entry", eq: "qusan-route" },
            consumeDay: true,
            consequences: [
              { kind: "item", id: "palace-route-rubbing" },
              { kind: "aptitude", delta: 2 },
              { kind: "arcVariant", arcId: "shendiao", key: "act5.palace-clue", value: "secret-tunnel" },
            ],
            resultText: "你把地道转折与桃花暗记完整拓下。终点旁写着一个曲字，出口方向正是牛家村旧酒馆。",
            transition: { type: "goto", nodeId: "palace-alarm" },
          },
        ],
      },
      "palace-alarm": {
        id: "palace-alarm",
        title: "西阁封门",
        text: "禁宫铜锣突然响起，带御器械封住西阁楼梯。另一头的地道也传来蛤蟆功蓄力声。欧阳锋没有去抢普通档案，他盯的是郭靖记得的九阴经文与武穆遗书去向。",
        choices: [
          {
            id: "hold-west-poison",
            text: "正面截住欧阳锋",
            description: "替郭靖、黄蓉和洪七公争取退入地道的时间。",
            consumeDay: true,
            consequences: [
              { kind: "relation", npcId: "guojing", delta: 6 },
              { kind: "relation", npcId: "hongqigong", delta: 4 },
            ],
            transition: {
              type: "battle",
              enemyId: "ouyangfeng",
              onWin: {
                text: "你接住欧阳锋两轮掌势，把他逼离地道口。临退时，他隔着书架再发一掌，郭靖替黄蓉挡住掌风，胸口当场见血。",
                consequences: [
                  { kind: "arcVariant", arcId: "shendiao", key: "act5.patient", value: "guojing" },
                  { kind: "npcTag", npcId: "guojing", tag: "禁宫掌伤" },
                ],
                then: { type: "goto", nodeId: "secret-retreat" },
              },
              onLose: {
                text: "蛤蟆功震开你的护势，掌力透入胸腹。郭靖把你拖进地道，黄蓉随即放下断门石。",
                consequences: [
                  { kind: "hp", delta: -70 },
                  { kind: "arcVariant", arcId: "shendiao", key: "act5.patient", value: "player" },
                ],
                then: { type: "goto", nodeId: "secret-retreat" },
              },
              onFlee: {
                text: "你借倒下的书架退入地道，郭靖留在最后接了一掌，众人才合力落下断门石。",
                consequences: [
                  { kind: "arcVariant", arcId: "shendiao", key: "act5.patient", value: "guojing" },
                  { kind: "npcTag", npcId: "guojing", tag: "禁宫掌伤" },
                ],
                then: { type: "goto", nodeId: "secret-retreat" },
              },
            },
          },
          {
            id: "shield-guojing",
            text: "替郭靖挡住地道口",
            description: "郭靖带着军档先走，你承下西毒追来的一掌。",
            consumeDay: true,
            consequences: [
              { kind: "hp", delta: -80 },
              { kind: "relation", npcId: "guojing", delta: 10 },
              { kind: "arcVariant", arcId: "shendiao", key: "act5.patient", value: "player" },
            ],
            resultText: "你把郭靖推进地道，转身硬接欧阳锋掌力。黄蓉放下断门石时，你已经站立不稳，只能由郭靖背着撤离。",
            transition: { type: "goto", nodeId: "secret-retreat" },
          },
          {
            id: "use-antivenom",
            text: "以解毒粉封住掌伤",
            description: "白驼毒血与掌劲同源，先减轻郭靖中掌后的毒气侵入。",
            condition: { kind: "arcVariant", arcId: "shendiao", key: "act4.fire-prep", eq: "antivenom-kept" },
            consumeDay: true,
            consequences: [
              { kind: "relation", npcId: "guojing", delta: 7 },
              { kind: "arcVariant", arcId: "shendiao", key: "act5.patient", value: "guojing" },
              { kind: "arcVariant", arcId: "shendiao", key: "act5.injury", value: "contained" },
              { kind: "npcTag", npcId: "guojing", tag: "禁宫掌伤" },
            ],
            resultText: "郭靖挡掌后气息一滞，你立即把解毒粉封在掌印周围。伤势仍须闭关运功，毒气却没有继续侵入心脉。",
            transition: { type: "goto", nodeId: "secret-retreat" },
          },
          {
            id: "break-guard-ring",
            text: "击破禁军合围",
            description: "让郭靖与黄蓉专心应对西毒，你先打通旧道出口。",
            consumeDay: true,
            transition: {
              type: "battle",
              enemyId: "palace-guard",
              onWin: {
                text: "你击开旧道口的盾阵，郭靖随后挡住欧阳锋追掌。众人退入地道时，他胸口仍被掌风扫中。",
                consequences: [
                  { kind: "arcVariant", arcId: "shendiao", key: "act5.patient", value: "guojing" },
                  { kind: "npcTag", npcId: "guojing", tag: "禁宫掌伤" },
                ],
                then: { type: "goto", nodeId: "secret-retreat" },
              },
              onLose: {
                text: "禁军盾阵把你压在地道口，欧阳锋的掌力又从侧后袭来。郭靖拖你进门时，你已无法自行运气。",
                consequences: [
                  { kind: "hp", delta: -65 },
                  { kind: "arcVariant", arcId: "shendiao", key: "act5.patient", value: "player" },
                ],
                then: { type: "goto", nodeId: "secret-retreat" },
              },
              onFlee: {
                text: "你掀翻灯架逼禁军后退，借浓烟撤入旧道。郭靖留在最后，被欧阳锋隔门一掌扫中。",
                consequences: [
                  { kind: "arcVariant", arcId: "shendiao", key: "act5.patient", value: "guojing" },
                  { kind: "npcTag", npcId: "guojing", tag: "禁宫掌伤" },
                ],
                then: { type: "goto", nodeId: "secret-retreat" },
              },
            },
          },
          {
            id: "mislead-palace-guards",
            text: "把追兵引向王府密使",
            description: "借宫门印与巡夜守卫制造第二处冲突，再从旧道退走。",
            condition: { kind: "arcVariant", arcId: "shendiao", key: "act5.palace-clue", eq: "palace-seal" },
            consumeDay: true,
            consequences: [
              { kind: "speed", delta: 2 },
              { kind: "relation", npcId: "yangkang", delta: -6 },
              { kind: "arcVariant", arcId: "shendiao", key: "act5.patient", value: "guojing" },
              { kind: "npcTag", npcId: "guojing", tag: "禁宫掌伤" },
            ],
            resultText: "你把守卫引到王府密使藏身处。两边拔刀时，众人抢进旧道；欧阳锋隔门补出一掌，郭靖仍被掌风扫中。",
            transition: { type: "goto", nodeId: "secret-retreat" },
          },
        ],
      },
      "secret-retreat": {
        id: "secret-retreat",
        title: "旧道出城",
        text: "地道越走越低，最后从牛家村旧酒馆地窖下穿出。禁宫军档已经带出，伤者却必须连续运功七日。黄蓉封住入口，只留下君山丐帮大会与铁掌峰两个名字。",
        onEnter: [
          { kind: "arcVariant", arcId: "shendiao", key: "act5.palace", value: "cleared" },
        ],
        autoNext: { type: "end" },
      },
    },
  },
  {
    id: "shendiao-niujia-act5",
    entryNode: "hidden-room",
    locationId: "niujia",
    weight: 8,
    once: true,
    condition: {
      kind: "and",
      items: [
        { kind: "arcVariant", arcId: "shendiao", key: "act5.palace", eq: "cleared" },
        { kind: "not", item: { kind: "arcVariant", arcId: "shendiao", key: "act5.niujia", eq: "cleared" } },
        { kind: "not", item: { kind: "arcBeat", arcId: "shendiao", beat: "act5-old-debts" } },
      ],
    },
    nodes: {
      "hidden-room": {
        id: "hidden-room",
        title: "曲家密室",
        text: "旧酒馆地窖后藏着一间石室，墙上留有曲灵风搬运宫物时刻下的路线。伤者盘膝坐在中央，郭靖与黄蓉说明运功一旦开始，七日内不能受惊，也不能强行收功。",
        autoNext: {
          type: "branch",
          cases: [
            {
              when: { kind: "arcVariant", arcId: "shendiao", key: "act5.patient", eq: "player" },
              then: { type: "goto", nodeId: "player-healing" },
            },
          ],
          else: { type: "goto", nodeId: "guojing-healing" },
        },
      },
      "player-healing": {
        id: "player-healing",
        title: "同室运功",
        text: "你胸腹掌伤尚未散开，只能与郭靖对坐导气。黄蓉负责守住密室门与换药时辰。石门外任何响动，都可能逼你提前收功。",
        autoNext: { type: "goto", nodeId: "seven-day-watch" },
      },
      "guojing-healing": {
        id: "guojing-healing",
        title: "守住七日",
        text: "郭靖闭目运功，黄蓉以真气替他引开掌伤。你负责密室外的食水、来客与追兵，七日内不能让石门被撞开。",
        autoNext: { type: "goto", nodeId: "seven-day-watch" },
      },
      "seven-day-watch": {
        id: "seven-day-watch",
        title: "密室外的七日",
        text: "第三日夜里，村外先后出现白驼山蛇奴、王府旧部和一个披灰斗篷的女子。密室里正到换气关口，外面任何一方都不能直接放进来。",
        choices: [
          {
            id: "seal-outer-door",
            text: "守住酒馆外门",
            description: "不离开密室附近，以假锁与空酒坛拖住来人。",
            consumeDay: true,
            consequences: [
              { kind: "relation", npcId: "guojing", delta: 5 },
              { kind: "relation", npcId: "huangrong", delta: 5 },
            ],
            resultText: "你把旧酒坛堆在地窖门上，又让来人只看见一间塌了半边的废店。蛇奴搜到后院便被空坛声引开。",
            transition: { type: "goto", nodeId: "temple-footsteps" },
          },
          {
            id: "fetch-herbs",
            text: "从村外药铺取续脉药",
            description: "伤势已有反复，必须在天亮前带药回来。",
            consumeDay: true,
            consequences: [
              { kind: "item", id: "small-hp-pill", count: 2 },
              { kind: "speed", delta: 1 },
            ],
            resultText: "你从村外药铺取回续脉药，又故意把追踪脚印引向河滩。回到地窖时，运功仍未中断。",
            transition: { type: "goto", nodeId: "temple-footsteps" },
          },
          {
            id: "read-qusan-wall",
            text: "辨认墙上宫物刻线",
            description: "密室不只用于藏身，曲灵风还在墙上留下铁掌峰方向。",
            consumeDay: true,
            consequences: [
              { kind: "item", id: "palace-route-rubbing" },
              { kind: "aptitude", delta: 2 },
            ],
            resultText: "你拓下墙角被烟灰遮住的刻线。路线从禁宫通到牛家村，再折向西南一座双峰，终点标着铁掌暗印。",
            transition: { type: "goto", nodeId: "temple-footsteps" },
          },
          {
            id: "spread-false-rumor",
            text: "放出伤者已去桃花岛的假话",
            description: "把白驼山与王府眼线从牛家村引走。",
            consumeDay: true,
            consequences: [
              { kind: "aptitude", delta: 1 },
              { kind: "relation", npcId: "ouyangfeng-npc", delta: -3 },
            ],
            resultText: "你让两个行商带着同一句假消息离村。白驼山蛇奴当夜便改走东海，王府旧部也跟了过去。",
            transition: { type: "goto", nodeId: "temple-footsteps" },
          },
        ],
      },
      "temple-footsteps": {
        id: "temple-footsteps",
        title: "破庙三人",
        text: "第五日，灰斗篷女子在村外破庙摘下帽子，正是穆念慈。欧阳克拦住庙门，杨康却从后窗进来。穆念慈把短刀横在身前，杨康右手藏在袖中，枪头只露出半寸。",
        choices: [
          {
            id: "protect-munianci",
            text: "先把穆念慈护到门外",
            description: "不让她困在欧阳克与杨康之间，也看清杨康下一步。",
            consumeDay: true,
            consequences: [
              { kind: "relation", npcId: "munianci", delta: 12 },
              { kind: "arcVariant", arcId: "shendiao", key: "act5.ouyangke", value: "killed-witnessed" },
              { kind: "npcAlive", npcId: "ouyangke", alive: false },
              { kind: "item", id: "ouyangke-jade-shard" },
            ],
            resultText: "你把穆念慈带出庙门。杨康趁欧阳克转身，以短枪刺入他腰侧。欧阳克倒地时扯断腰间玉饰，你拾到的残片同时沾着枪锈与蛇毒。",
            transition: { type: "goto", nodeId: "murder-aftermath" },
          },
          {
            id: "stop-yangkang",
            text: "截住杨康袖中短枪",
            description: "先阻止灭口，再让穆念慈自行决定是否离开。",
            consumeDay: true,
            consequences: [
              { kind: "relation", npcId: "yangkang", delta: -10 },
              { kind: "relation", npcId: "munianci", delta: 6 },
            ],
            transition: {
              type: "battle",
              enemyId: "yangkang",
              onWin: {
                text: "你在短枪出袖前扣住杨康手腕。欧阳克趁乱撞破后窗逃走，腰间玉饰仍被窗钉扯下一角。",
                consequences: [
                  { kind: "arcVariant", arcId: "shendiao", key: "act5.ouyangke", value: "survived-wounded" },
                  { kind: "npcAlive", npcId: "ouyangke", alive: true },
                  { kind: "item", id: "ouyangke-jade-shard" },
                ],
                then: { type: "goto", nodeId: "murder-aftermath" },
              },
              onLose: {
                text: "杨康以左手爪势逼你松手，短枪随即刺中欧阳克。穆念慈看见他收枪，也看见他把蛇毒抹上伤口。",
                consequences: [
                  { kind: "arcVariant", arcId: "shendiao", key: "act5.ouyangke", value: "killed-witnessed" },
                  { kind: "npcAlive", npcId: "ouyangke", alive: false },
                  { kind: "item", id: "ouyangke-jade-shard" },
                ],
                then: { type: "goto", nodeId: "murder-aftermath" },
              },
              onFlee: {
                text: "你退到庙门护住穆念慈。杨康的短枪已经刺中欧阳克，他随即把凶器投入井中。",
                consequences: [
                  { kind: "arcVariant", arcId: "shendiao", key: "act5.ouyangke", value: "killed-no-weapon" },
                  { kind: "npcAlive", npcId: "ouyangke", alive: false },
                ],
                then: { type: "goto", nodeId: "murder-aftermath" },
              },
            },
          },
          {
            id: "watch-from-rafters",
            text: "藏在梁上看清凶器",
            description: "暂不暴露密室位置，先留下能在铁枪庙使用的完整证据。",
            consumeDay: true,
            consequences: [
              { kind: "aptitude", delta: 2 },
              { kind: "karma", delta: -2 },
              { kind: "arcVariant", arcId: "shendiao", key: "act5.ouyangke", value: "killed-witnessed" },
              { kind: "npcAlive", npcId: "ouyangke", alive: false },
              { kind: "item", id: "ouyangke-jade-shard" },
            ],
            resultText: "你从梁上看见杨康用短枪杀人，又把蛇毒涂进伤口。穆念慈离开后，你从砖缝取出一片玉饰与断枪铁屑。",
            transition: { type: "goto", nodeId: "murder-aftermath" },
          },
          {
            id: "help-hide-body",
            text: "帮杨康清掉枪痕",
            description: "保住王府暗线，也把这桩命案变成可以交换的把柄。",
            condition: { kind: "relation", npcId: "yangkang", gte: 10 },
            consumeDay: true,
            consequences: [
              { kind: "karma", delta: -7 },
              { kind: "relation", npcId: "yangkang", delta: 10 },
              { kind: "relation", npcId: "munianci", delta: -10 },
              { kind: "arcVariant", arcId: "shendiao", key: "act5.ouyangke", value: "killed-concealed" },
              { kind: "npcAlive", npcId: "ouyangke", alive: false },
            ],
            resultText: "你擦掉墙上枪血，又把断枪投入枯井。杨康用蛇毒伪造伤口，临走前只说君山见。",
            transition: { type: "goto", nodeId: "murder-aftermath" },
          },
        ],
      },
      "murder-aftermath": {
        id: "murder-aftermath",
        title: "密室外的罪",
        text: "破庙恢复安静，密室里的运功仍未中断。欧阳克的死活与证物已经有了版本，杨康则带着丐帮净衣派令牌赶往君山。",
        autoNext: {
          type: "branch",
          cases: [
            {
              when: { kind: "arcVariant", arcId: "shendiao", key: "act5.patient", eq: "player" },
              then: { type: "goto", nodeId: "player-recovered" },
            },
          ],
          else: { type: "goto", nodeId: "guojing-recovered" },
        },
      },
      "player-recovered": {
        id: "player-recovered",
        title: "七日收功",
        text: "第七日，你把最后一股掌力逼出胸腹，终于能自行起身。郭靖推开石门，黄蓉已经把君山大会与铁掌峰路线并排画在墙上。",
        onEnter: [
          { kind: "hp", delta: 180 },
          { kind: "arcVariant", arcId: "shendiao", key: "act5.niujia", value: "cleared" },
        ],
        autoNext: { type: "end" },
      },
      "guojing-recovered": {
        id: "guojing-recovered",
        title: "掌伤暂平",
        text: "第七日，郭靖自行推开石门，掌伤已经不再侵入心脉。黄蓉收好打狗棒与禁宫军档，先去君山查洪七公死讯。",
        onEnter: [
          { kind: "npcTag", npcId: "guojing", tag: "禁宫掌伤", add: false },
          { kind: "npcTag", npcId: "guojing", tag: "禁宫伤势已稳" },
          { kind: "arcVariant", arcId: "shendiao", key: "act5.niujia", value: "cleared" },
        ],
        autoNext: { type: "end" },
      },
    },
  },
  {
    id: "shendiao-junshan-act5",
    entryNode: "beggar-assembly",
    locationId: "junshan",
    weight: 8,
    once: true,
    condition: {
      kind: "and",
      items: [
        { kind: "arcVariant", arcId: "shendiao", key: "act5.niujia", eq: "cleared" },
        { kind: "not", item: { kind: "arcVariant", arcId: "shendiao", key: "act5.junshan", eq: "cleared" } },
        { kind: "not", item: { kind: "arcBeat", arcId: "shendiao", beat: "act5-old-debts" } },
      ],
    },
    nodes: {
      "beggar-assembly": {
        id: "beggar-assembly",
        title: "君山双旗",
        text: "君山石台两侧各立一面帮旗。净衣派拥着杨康，说洪七公已死，并称打狗棒已传给新帮主；鲁有脚带污衣派守住山门，只认帮规、传令与抗金旧誓。黄蓉背着竹杖走上石阶，台下却先响起弓弦声。",
        autoNext: {
          type: "branch",
          cases: [
            {
              when: { kind: "arcVariant", arcId: "shendiao", key: "act4.aftermath", eq: "staff-guardian" },
              then: { type: "goto", nodeId: "staff-witness" },
            },
            {
              when: { kind: "arcVariant", arcId: "shendiao", key: "act5.ouyangke", eq: "killed-concealed" },
              then: { type: "goto", nodeId: "wangfu-welcome" },
            },
          ],
          else: { type: "goto", nodeId: "assembly-crossroads" },
        },
      },
      "staff-witness": {
        id: "staff-witness",
        title: "护杖人证",
        text: "荒岛上由你护住竹杖，君山弟子中已有两人认得此事。鲁有脚请你先说清洪七公如何传棒，再让黄蓉当众验明棒法。",
        onEnter: [
          { kind: "factionAttitude", factionId: "beggar", delta: 5 },
        ],
        autoNext: { type: "goto", nodeId: "assembly-crossroads" },
      },
      "wangfu-welcome": {
        id: "wangfu-welcome",
        title: "净衣上客",
        text: "净衣派提前给你留了席位。杨康只让人递来一句话：破庙里的痕迹已经清干净，今日只谈谁能替丐帮换来金国粮道。",
        onEnter: [
          { kind: "relation", npcId: "yangkang", delta: 3 },
        ],
        autoNext: { type: "goto", nodeId: "assembly-crossroads" },
      },
      "assembly-crossroads": {
        id: "assembly-crossroads",
        title: "真假帮主",
        text: "杨康拿出一根外形相同的竹杖，又命净衣派长老宣读洪七公死讯。黄蓉没有抢话，只让人把两根杖放在同一张石案上。鲁有脚则被净衣派弟子围在台下。",
        choices: [
          {
            id: "verify-qigong-message",
            text: "当众核对洪七公伤势",
            description: "海难伤在何处、谁曾护脉，假死讯无法回答这些细节。",
            consumeDay: true,
            consequences: [
              { kind: "reputation", delta: 4 },
              { kind: "relation", npcId: "huangrong", delta: 5 },
              { kind: "arcVariant", arcId: "shendiao", key: "act5.junshan-side", value: "huangrong" },
            ],
            resultText: "你逐项问起洪七公肩背掌伤、竹杖去向与荒岛船工。传假讯的弟子只答得出死讯日期，连伤在左肩还是右肩都说不清。",
            transition: { type: "goto", nodeId: "staff-rules" },
          },
          {
            id: "protect-lu-youjiao",
            text: "先替鲁有脚解围",
            description: "帮主之争不能靠扣住反对长老来定。",
            consumeDay: true,
            consequences: [
              { kind: "karma", delta: 4 },
              { kind: "relation", npcId: "luyoujiao", delta: 10 },
              { kind: "arcVariant", arcId: "shendiao", key: "act5.junshan-side", value: "lu-youjiao" },
            ],
            resultText: "你挡开围住鲁有脚的净衣弟子，把他送上石台。鲁有脚当众说出历代传棒规矩，也指出杨康从未受过帮中长老共议。",
            transition: { type: "goto", nodeId: "staff-rules" },
          },
          {
            id: "show-jade-evidence",
            text: "拿白驼玉饰逼杨康退场",
            description: "先让净衣派知道他们拥立的人还背着一桩命案。",
            condition: {
              kind: "and",
              items: [
                { kind: "hasItem", id: "ouyangke-jade-shard" },
                { kind: "npcAlive", npcId: "ouyangke", alive: false },
              ],
            },
            consumeDay: true,
            consequences: [
              { kind: "relation", npcId: "yangkang", delta: -12 },
              { kind: "reputation", delta: 3 },
              { kind: "arcVariant", arcId: "shendiao", key: "act5.junshan-side", value: "evidence" },
            ],
            resultText: "你把玉饰残片与枪锈放上石案。杨康没有承认杀人，却立即改口说今日先议帮规。净衣派中已有数人悄悄放下兵刃。",
            transition: { type: "goto", nodeId: "staff-rules" },
          },
          {
            id: "support-yangkang",
            text: "替杨康稳住净衣派",
            description: "先让他掌握帮中号令，再以王府粮道换取支持。",
            condition: {
              kind: "or",
              items: [
                { kind: "arcVariant", arcId: "shendiao", key: "act5.ouyangke", eq: "killed-concealed" },
                { kind: "relation", npcId: "yangkang", gte: 20 },
              ],
            },
            consumeDay: true,
            consequences: [
              { kind: "karma", delta: -6 },
              { kind: "relation", npcId: "yangkang", delta: 10 },
              { kind: "factionAttitude", factionId: "beggar", delta: -8 },
              { kind: "arcVariant", arcId: "shendiao", key: "act5.junshan-side", value: "yangkang" },
            ],
            resultText: "你把王府粮道与赈济名册交给净衣派长老。几人仍不认杨康会打狗棒法，却愿先听他调度。",
            transition: { type: "goto", nodeId: "staff-rules" },
          },
        ],
      },
      "staff-rules": {
        id: "staff-rules",
        title: "打狗棒问规",
        text: "鲁有脚提出三问：谁能说出传棒规矩，谁能辨明真棒，谁愿继续丐帮抗金旧誓。黄蓉拿起竹杖，没有让旁人替她演棒法。杨康则示意台后弓手准备动手。",
        choices: [
          {
            id: "recite-succession-rules",
            text: "替众弟子复述传令经过",
            description: "只作荒岛见证，不替黄蓉回答棒法与帮主之位。",
            consumeDay: true,
            consequences: [
              { kind: "relation", npcId: "luyoujiao", delta: 5 },
              { kind: "factionAttitude", factionId: "beggar", delta: 5 },
            ],
            resultText: "你说清洪七公何时交棒、当时有哪些船工与弟子在场。黄蓉随后独自演出缠、绊、挑三诀，鲁有脚当众认棒。",
            transition: { type: "goto", nodeId: "junshan-verdict" },
          },
          {
            id: "disarm-hidden-archers",
            text: "先拆掉台后伏弓",
            description: "让帮主之争回到石台，不让暗箭替任何一边作答。",
            consumeDay: true,
            consequences: [
              { kind: "speed", delta: 2 },
              { kind: "relation", npcId: "huangrong", delta: 5 },
            ],
            resultText: "你绕到台后割断三张弓弦，又把箭囊踢下石坡。黄蓉演完棒法时，杨康再也等不到暗号。",
            transition: { type: "goto", nodeId: "junshan-verdict" },
          },
          {
            id: "challenge-yangkang",
            text: "逼杨康当众护住假棒",
            description: "让他亲自下场，看看王府武功能否替代丐帮传承。",
            consumeDay: true,
            consequences: [
              { kind: "relation", npcId: "yangkang", delta: -8 },
            ],
            transition: {
              type: "battle",
              enemyId: "yangkang",
              onWin: {
                text: "你击落杨康手中假棒，黄蓉随即以真棒锁住他退路。净衣派长老再无人敢说两根竹杖没有分别。",
                consequences: [
                  { kind: "reputation", delta: 5 },
                  { kind: "arcVariant", arcId: "shendiao", key: "act5.junshan-side", value: "huangrong" },
                ],
                then: { type: "goto", nodeId: "junshan-verdict" },
              },
              onLose: {
                text: "杨康以九阴爪势逼你退下石台，黄蓉却从侧面以打狗棒法缠落假棒。胜负仍没替他补上帮规与传令。",
                then: { type: "goto", nodeId: "junshan-verdict" },
              },
              onFlee: {
                text: "你退到鲁有脚一侧守住伤者。黄蓉独自接下杨康攻势，以真棒压住假棒。",
                then: { type: "goto", nodeId: "junshan-verdict" },
              },
            },
          },
          {
            id: "open-gate-for-yangkang",
            text: "替杨康打开北坡退路",
            description: "帮主位未必保得住，先保住净衣派与王府合作线。",
            condition: { kind: "arcVariant", arcId: "shendiao", key: "act5.junshan-side", eq: "yangkang" },
            consumeDay: true,
            consequences: [
              { kind: "relation", npcId: "yangkang", delta: 8 },
              { kind: "factionAttitude", factionId: "beggar", delta: -5 },
            ],
            resultText: "你移开北坡拒马，杨康带亲信与几名净衣派长老退走。他没有夺到真棒，却留下了一支仍听王府号令的帮中势力。",
            transition: { type: "goto", nodeId: "junshan-verdict" },
          },
        ],
      },
      "junshan-verdict": {
        id: "junshan-verdict",
        title: "君山号令",
        text: "真假竹杖、传令与棒法都已验过。黄蓉接下丐帮号令，杨康仍可带走部分净衣派亲信；君山没有因一场比武立刻消除内斗。",
        autoNext: {
          type: "branch",
          cases: [
            {
              when: { kind: "arcVariant", arcId: "shendiao", key: "act5.junshan-side", eq: "yangkang" },
              then: { type: "goto", nodeId: "beggar-divided" },
            },
          ],
          else: { type: "goto", nodeId: "rong-recognized" },
        },
      },
      "beggar-divided": {
        id: "beggar-divided",
        title: "分裂余波",
        text: "黄蓉取得真棒与多数长老承认，杨康却带走一批净衣派弟子。鲁有脚把铁掌峰内应名单交给你，名单上已有王府批注。",
        onEnter: [
          { kind: "arcVariant", arcId: "shendiao", key: "act5.beggar", value: "divided" },
          { kind: "arcVariant", arcId: "shendiao", key: "act5.junshan", value: "cleared" },
        ],
        autoNext: { type: "end" },
      },
      "rong-recognized": {
        id: "rong-recognized",
        title: "真棒归位",
        text: "鲁有脚与多数长老向黄蓉行帮礼。她第一道号令不是追杀杨康，而是查清铁掌峰与武穆遗书，再把洪七公尚在人世的消息传遍各舵。",
        onEnter: [
          { kind: "factionAttitude", factionId: "beggar", delta: 12 },
          { kind: "npcFaction", npcId: "huangrong", faction: "beggar" },
          { kind: "npcTag", npcId: "huangrong", tag: "丐帮帮主" },
          { kind: "arcVariant", arcId: "shendiao", key: "act5.beggar", value: "rong-recognized" },
          { kind: "arcVariant", arcId: "shendiao", key: "act5.junshan", value: "cleared" },
        ],
        autoNext: { type: "end" },
      },
    },
  },
  {
    id: "shendiao-tiezhang-act5",
    entryNode: "foothill",
    locationId: "tiezhangfeng",
    weight: 8,
    once: true,
    condition: {
      kind: "and",
      items: [
        { kind: "arcVariant", arcId: "shendiao", key: "act5.junshan", eq: "cleared" },
        { kind: "not", item: { kind: "arcVariant", arcId: "shendiao", key: "act5.tiezhang", eq: "cleared" } },
        { kind: "not", item: { kind: "arcBeat", arcId: "shendiao", beat: "act5-old-debts" } },
      ],
    },
    nodes: {
      foothill: {
        id: "foothill",
        title: "真铁掌",
        text: "铁掌峰下没有铜缸与酥砖，守山弟子只用一掌便把拦路石碑震出裂纹。峰顶钟声响过三次，裘千仞已经知道君山来人到了。",
        choices: [
          {
            id: "follow-secret-route",
            text: "按禁宫转运簿走后峰",
            description: "军档记着兵书送入禁地的路线，可避开前山大堂。",
            condition: { kind: "arcVariant", arcId: "shendiao", key: "act5.palace-clue", eq: "transfer-ledger" },
            consumeDay: true,
            consequences: [
              { kind: "aptitude", delta: 2 },
              { kind: "arcVariant", arcId: "shendiao", key: "act5.tiezhang-entry", value: "ledger-route" },
            ],
            resultText: "你按转运日期对应的暗号穿过后峰石门，避开两轮巡山，直接抵达禁地外侧。",
            transition: { type: "goto", nodeId: "summit-crossroads" },
          },
          {
            id: "use-palace-route",
            text: "沿曲灵风拓图找石窟",
            description: "牛家村墙刻与铁掌双峰方位完全吻合。",
            condition: { kind: "hasItem", id: "palace-route-rubbing" },
            consumeDay: true,
            consequences: [
              { kind: "relation", npcId: "huangyaoshi-npc", delta: 2 },
              { kind: "arcVariant", arcId: "shendiao", key: "act5.tiezhang-entry", value: "qusan-map" },
            ],
            resultText: "拓图把禁地画成一只倒扣铁掌。你从小指峰下钻入石缝，出口正对藏书石窟。",
            transition: { type: "goto", nodeId: "summit-crossroads" },
          },
          {
            id: "present-wangfu-terms",
            text: "以王府与净衣派名义上峰",
            description: "表面谈兵书交易，先看裘千仞愿意把筹码卖给谁。",
            condition: {
              kind: "or",
              items: [
                { kind: "arcVariant", arcId: "shendiao", key: "act5.beggar", eq: "divided" },
                { kind: "relation", npcId: "yangkang", gte: 20 },
              ],
            },
            consumeDay: true,
            consequences: [
              { kind: "relation", npcId: "qiuqianren-npc", delta: 5 },
              { kind: "arcVariant", arcId: "shendiao", key: "act5.tiezhang-entry", value: "negotiation" },
            ],
            resultText: "裘千仞让你进前山大堂，却只谈价码，不谈兵书所在。他要王府粮道、丐帮内应和君山结果三样证明。",
            transition: { type: "goto", nodeId: "summit-crossroads" },
          },
          {
            id: "climb-iron-chain",
            text: "从铁索桥强行上峰",
            description: "不借任何身份，正面闯过巡峰弟子。",
            consumeDay: true,
            consequences: [
              { kind: "reputation", delta: 3 },
              { kind: "arcVariant", arcId: "shendiao", key: "act5.tiezhang-entry", value: "force" },
            ],
            transition: {
              type: "battle",
              enemyId: "xiejiaoshi",
              onWin: {
                text: "你在铁索桥上击退巡峰护法，趁钟声传上前峰时转入后山石窟。",
                consequences: [
                  { kind: "reputation", delta: 3 },
                ],
                then: { type: "goto", nodeId: "summit-crossroads" },
              },
              onLose: {
                text: "护法封住铁索前端，你只能借雾退到偏峰，再从采药小径绕向后山。",
                consequences: [
                  { kind: "hp", delta: -25 },
                ],
                then: { type: "goto", nodeId: "summit-crossroads" },
              },
              onFlee: {
                text: "你斩断一截副索制造混乱，趁守山弟子修桥时绕入后峰。",
                then: { type: "goto", nodeId: "summit-crossroads" },
              },
            },
          },
        ],
      },
      "summit-crossroads": {
        id: "summit-crossroads",
        title: "禁地三门",
        text: "后峰有三道门：左门关着君山被俘弟子，中门堆着王府与铁掌帮往来文书，右门石缝透出旧纸与桐油气味。裘千仞的脚步正从前峰逼近。",
        choices: [
          {
            id: "free-beggar-captives",
            text: "先放出丐帮俘虏",
            description: "多几个人接应撤退，也不能把君山弟子留给铁掌帮灭口。",
            consumeDay: true,
            consequences: [
              { kind: "karma", delta: 4 },
              { kind: "factionAttitude", factionId: "beggar", delta: 6 },
            ],
            resultText: "你劈开左门锁链，把鲁有脚派来的弟子放出。他们熟悉运货暗号，带你从侧廊进入藏书石窟。",
            transition: { type: "goto", nodeId: "wumu-vault" },
          },
          {
            id: "copy-alliance-ledger",
            text: "抄下铁掌与王府往来",
            description: "兵书之外，这份名单能证明谁在用江湖势力换军政筹码。",
            consumeDay: true,
            consequences: [
              { kind: "reputation", delta: 2 },
              { kind: "aptitude", delta: 1 },
            ],
            resultText: "你抄下王府、净衣派内应与铁掌分舵名单，再从文书架后的暗门进入石窟。",
            transition: { type: "goto", nodeId: "wumu-vault" },
          },
          {
            id: "honor-negotiation",
            text: "按约去见裘千仞",
            description: "先听他开出兵书价码，再决定是否翻脸。",
            condition: { kind: "arcVariant", arcId: "shendiao", key: "act5.tiezhang-entry", eq: "negotiation" },
            consumeDay: true,
            consequences: [
              { kind: "relation", npcId: "qiuqianren-npc", delta: 3 },
            ],
            resultText: "裘千仞要你用丐帮内应名单换一次进石窟的机会。他不许带走原本，却允许抄一页验货。",
            transition: { type: "goto", nodeId: "wumu-vault" },
          },
          {
            id: "enter-oil-scent",
            text: "直接闯右门石窟",
            description: "桐油用来防潮，武穆遗书原本就在里面。",
            consumeDay: true,
            consequences: [
              { kind: "speed", delta: 1 },
            ],
            resultText: "你撬开右门石缝，石匣上刻着岳字，旁边另压着一套铁掌帮伪造的交接文书。",
            transition: { type: "goto", nodeId: "wumu-vault" },
          },
        ],
      },
      "wumu-vault": {
        id: "wumu-vault",
        title: "武穆遗书",
        text: "石匣中的原卷不是武功秘籍，而是军纪、阵图、粮道与守城法。卷尾写着用兵先护百姓，不得纵军掳掠。山外警钟已经连成一片，能带走多少，必须立刻决定。",
        choices: [
          {
            id: "take-original",
            text: "带走兵书原本",
            description: "收益最高，也会让铁掌帮与王府沿路追杀。",
            consumeDay: true,
            consequences: [
              { kind: "item", id: "wumu-original" },
              { kind: "reputation", delta: 6 },
              { kind: "factionAttitude", factionId: "iron-palm", delta: -20 },
              { kind: "arcVariant", arcId: "shendiao", key: "act5.wumu", value: "original" },
            ],
            resultText: "你把原卷裹进防潮布，封好石匣空壳。铁掌帮很快会发现兵书失窃。",
            transition: { type: "goto", nodeId: "iron-palm-intercept" },
          },
          {
            id: "copy-essential-chapters",
            text: "只抄阵图与军纪节要",
            description: "保留可用内容，不把原卷带出禁地。",
            consumeDay: true,
            consequences: [
              { kind: "item", id: "wumu-copy" },
              { kind: "aptitude", delta: 3 },
              { kind: "arcVariant", arcId: "shendiao", key: "act5.wumu", value: "copy" },
            ],
            resultText: "你抄下守城阵图、粮道与军纪数篇，再把原卷按原样放回石匣。",
            transition: { type: "goto", nodeId: "iron-palm-intercept" },
          },
          {
            id: "mark-vault-and-leave",
            text: "只记位置，不碰兵书",
            description: "先保住人和路线，把取书留给准备更足的时候。",
            consumeDay: true,
            consequences: [
              { kind: "reputation", delta: 1 },
              { kind: "arcVariant", arcId: "shendiao", key: "act5.wumu", value: "left-in-vault" },
            ],
            resultText: "你记下石窟机关与暗号，原卷仍留在铁掌峰。离开前，你把伪造交接文书带走一角。",
            transition: { type: "goto", nodeId: "iron-palm-intercept" },
          },
          {
            id: "hand-copy-to-qiu",
            text: "用禁宫军档换裘千仞放行",
            description: "保留王府与铁掌交易路线，不在此刻夺书。",
            condition: { kind: "arcVariant", arcId: "shendiao", key: "act5.tiezhang-entry", eq: "negotiation" },
            consumeDay: true,
            consequences: [
              { kind: "karma", delta: -4 },
              { kind: "relation", npcId: "qiuqianren-npc", delta: 8 },
              { kind: "arcVariant", arcId: "shendiao", key: "act5.wumu", value: "iron-palm-kept" },
            ],
            resultText: "你交出一页禁宫军档，裘千仞允许你看完卷尾，却仍把原本锁回石匣。他只答应送你下峰，不保证同行者平安。",
            transition: { type: "goto", nodeId: "iron-palm-intercept" },
          },
        ],
      },
      "iron-palm-intercept": {
        id: "iron-palm-intercept",
        title: "铁掌追命",
        text: "裘千仞堵在铁索桥前，掌下石栏一寸寸开裂。黄蓉带丐帮弟子从侧峰接应，桥面却只容两人并肩。裘千仞没有报招式，第一掌已经直取携书之人。",
        choices: [
          {
            id: "take-palm-for-rong",
            text: "替黄蓉硬接铁掌",
            description: "保住她与竹杖，也替众人争出下桥时间。",
            consumeDay: true,
            consequences: [
              { kind: "relation", npcId: "huangrong", delta: 10 },
            ],
            transition: {
              type: "battle",
              enemyId: "qiuqianren",
              onWin: {
                text: "你架开裘千仞正面掌势，胸腹仍被余劲震伤。黄蓉带众人越过铁索，你随后斩断桥边副索脱身。",
                consequences: [
                  { kind: "hp", delta: -55 },
                  { kind: "arcVariant", arcId: "shendiao", key: "act5.patient", value: "player" },
                  { kind: "arcVariant", arcId: "shendiao", key: "act5.injury", value: "contained" },
                ],
                then: { type: "goto", nodeId: "blackmarsh-clue" },
              },
              onLose: {
                text: "铁掌穿过你的护势，掌力直入胸腹。黄蓉与郭靖合力把你拖过铁索，伤势已不是普通药石能压住。",
                consequences: [
                  { kind: "hp", delta: -90 },
                  { kind: "arcVariant", arcId: "shendiao", key: "act5.patient", value: "player" },
                  { kind: "arcVariant", arcId: "shendiao", key: "act5.injury", value: "severe" },
                ],
                then: { type: "goto", nodeId: "blackmarsh-clue" },
              },
              onFlee: {
                text: "你边挡边退，最后仍被掌风扫中。众人撤出铁索，伤势却必须另寻高人救治。",
                consequences: [
                  { kind: "hp", delta: -65 },
                  { kind: "arcVariant", arcId: "shendiao", key: "act5.patient", value: "player" },
                  { kind: "arcVariant", arcId: "shendiao", key: "act5.injury", value: "severe" },
                ],
                then: { type: "goto", nodeId: "blackmarsh-clue" },
              },
            },
          },
          {
            id: "coordinate-retreat",
            text: "与郭靖分守桥头",
            description: "一人卸掌，一人送黄蓉和兵书过桥。",
            consumeDay: true,
            consequences: [
              { kind: "relation", npcId: "guojing", delta: 6 },
              { kind: "arcVariant", arcId: "shendiao", key: "act5.patient", value: "huangrong" },
              { kind: "arcVariant", arcId: "shendiao", key: "act5.injury", value: "severe" },
              { kind: "npcTag", npcId: "huangrong", tag: "铁掌重伤" },
            ],
            resultText: "你与郭靖轮流接掌，黄蓉过桥前仍被裘千仞隔空掌力击中背心。她护住竹杖与兵书，落地后却已无法自行运气。",
            transition: { type: "goto", nodeId: "blackmarsh-clue" },
          },
          {
            id: "use-lightness-with-book",
            text: "先把兵书送过断桥",
            description: "以轻功保住军略原卷，再回头接应伤者。",
            condition: {
              kind: "or",
              items: [
                { kind: "hasItem", id: "wumu-original" },
                { kind: "hasItem", id: "wumu-copy" },
              ],
            },
            consumeDay: true,
            consequences: [
              { kind: "speed", delta: 2 },
              { kind: "arcVariant", arcId: "shendiao", key: "act5.patient", value: "huangrong" },
              { kind: "arcVariant", arcId: "shendiao", key: "act5.injury", value: "severe" },
              { kind: "npcTag", npcId: "huangrong", tag: "铁掌重伤" },
            ],
            resultText: "你先把兵书送到对峰，再转身接人。裘千仞趁空隙一掌击中黄蓉，原卷保住了，她却当场吐血倒下。",
            transition: { type: "goto", nodeId: "blackmarsh-clue" },
          },
          {
            id: "yield-the-original",
            text: "交回原本换众人下峰",
            description: "不拿同行人的性命赌兵书，先让裘千仞收掌。",
            condition: { kind: "hasItem", id: "wumu-original" },
            consumeDay: true,
            consequences: [
              { kind: "item", id: "wumu-original", count: -1 },
              { kind: "relation", npcId: "qiuqianren-npc", delta: 5 },
              { kind: "arcVariant", arcId: "shendiao", key: "act5.wumu", value: "returned-original" },
              { kind: "arcVariant", arcId: "shendiao", key: "act5.patient", value: "huangrong" },
              { kind: "arcVariant", arcId: "shendiao", key: "act5.injury", value: "contained" },
              { kind: "npcTag", npcId: "huangrong", tag: "铁掌掌伤" },
            ],
            resultText: "你把原本放回石匣袋。裘千仞仍补出一掌立威，黄蓉替身后弟子挡住余劲，伤势较轻，却仍须一阳指疏通经脉。",
            transition: { type: "goto", nodeId: "blackmarsh-clue" },
          },
        ],
      },
      "blackmarsh-clue": {
        id: "blackmarsh-clue",
        title: "白发女子",
        text: "众人下峰后，一名白发女子在路旁留下三枚乌木算筹。算筹背面写着：铁掌伤入经脉，往黑沼找我；要见一灯，先把路算明白。",
        onEnter: [
          { kind: "npcTag", npcId: "qiuqianren-npc", tag: "铁掌峰追杀" },
          { kind: "arcVariant", arcId: "shendiao", key: "act5.tiezhang", value: "cleared" },
        ],
        autoNext: { type: "end" },
      },
    },
  },
  {
    id: "shendiao-blackmarsh-act5",
    entryNode: "numbered-stakes",
    locationId: "blackmarsh",
    weight: 8,
    once: true,
    condition: {
      kind: "and",
      items: [
        { kind: "arcVariant", arcId: "shendiao", key: "act5.tiezhang", eq: "cleared" },
        { kind: "not", item: { kind: "arcVariant", arcId: "shendiao", key: "act5.blackmarsh", eq: "cleared" } },
        { kind: "not", item: { kind: "arcBeat", arcId: "shendiao", beat: "act5-old-debts" } },
      ],
    },
    nodes: {
      "numbered-stakes": {
        id: "numbered-stakes",
        title: "黑沼算路",
        text: "黑沼木桩依次刻着二、三、五、八，下一排却只露出半截数字。踩错的木板会翻入泥潭，绕路又来不及救治铁掌伤者。",
        choices: [
          {
            id: "continue-sequence",
            text: "按前两数之和推下一桩",
            description: "沿二、三、五、八的次序找十三与二十一。",
            consumeDay: true,
            consequences: [
              { kind: "aptitude", delta: 2 },
              { kind: "relation", npcId: "yinggu", delta: 3 },
            ],
            resultText: "你踩上刻着十三的木桩，泥面下的翻板没有动作。后续数字一路通向芦苇深处的茅屋。",
            transition: { type: "goto", nodeId: "yinggu-hut" },
          },
          {
            id: "sound-the-mud",
            text: "以长杆探明暗桩",
            description: "不解算式，逐处确认泥下有没有实木支撑。",
            consumeDay: true,
            consequences: [
              { kind: "speed", delta: 1 },
            ],
            resultText: "你用长杆逐处探路，虽走得慢，却把两块翻板提前压开。伤者被稳稳送到茅屋前。",
            transition: { type: "goto", nodeId: "yinggu-hut" },
          },
          {
            id: "follow-reed-birds",
            text: "沿水鸟落脚处绕行",
            description: "活物不会停在空板上，借鸟迹避开机关。",
            consumeDay: true,
            consequences: [
              { kind: "aptitude", delta: 1 },
              { kind: "karma", delta: 1 },
            ],
            resultText: "你沿白鹭停留的木桩绕开主路，从茅屋后侧踏上干地。瑛姑已经站在门前等候。",
            transition: { type: "goto", nodeId: "yinggu-hut" },
          },
          {
            id: "force-through-marsh",
            text: "背起伤者强闯",
            description: "不再耽搁，以轻功连踏芦根冲过泥潭。",
            consumeDay: true,
            consequences: [
              { kind: "hp", delta: -20 },
              { kind: "relation", npcId: "yinggu", delta: -3 },
            ],
            resultText: "你连踏芦根冲过黑沼，最后一脚踩塌翻板边缘。人虽到了茅屋，机关也被撞坏三处。",
            transition: { type: "goto", nodeId: "yinggu-hut" },
          },
        ],
      },
      "yinggu-hut": {
        id: "yinggu-hut",
        title: "茅屋问伤",
        text: "瑛姑只看一眼掌伤，便说普通药石无用。一灯能救人，却要耗损多年功力。她把一枚乌木算筹压在地图上，算筹另一面刻着周伯通三个字。",
        choices: [
          {
            id: "ask-openly",
            text: "如实说明铁掌峰经过",
            description: "先求救命路线，也让她知道裘千仞与武穆遗书都在追索。",
            consumeDay: true,
            consequences: [
              { kind: "relation", npcId: "yinggu", delta: 6 },
              { kind: "arcVariant", arcId: "shendiao", key: "act5.yinggu-deal", value: "open" },
            ],
            resultText: "你说清铁掌峰、伤者与兵书去向。瑛姑画出通往一灯居的水路，却把周伯通那面算筹留在手边。",
            transition: { type: "goto", nodeId: "yinggu-request" },
          },
          {
            id: "name-zhou-botong",
            text: "指出她真正要找周伯通",
            description: "求医只是明面，她把旧名刻在算筹上另有目的。",
            condition: {
              kind: "or",
              items: [
                { kind: "arcVariant", arcId: "shendiao", key: "act4.zhou", eq: "played" },
                { kind: "arcVariant", arcId: "shendiao", key: "act4.zhou", eq: "empty-palm" },
                { kind: "relation", npcId: "zhoubotong", gte: 5 },
              ],
            },
            consumeDay: true,
            consequences: [
              { kind: "relation", npcId: "yinggu", delta: 3 },
              { kind: "arcVariant", arcId: "shendiao", key: "act5.yinggu-deal", value: "motive-exposed" },
            ],
            resultText: "你说出桃花岛山洞与老顽童近况。瑛姑收起算筹，承认她既要一灯救人，也要一灯回答当年为何不救那个孩子。",
            transition: { type: "goto", nodeId: "yinggu-request" },
          },
          {
            id: "trade-wumu-clue",
            text: "以武穆遗书线索换完整路线",
            description: "她熟悉铁掌峰与大理旧路，可以避开四弟子外围耳目。",
            condition: {
              kind: "or",
              items: [
                { kind: "hasItem", id: "wumu-original" },
                { kind: "hasItem", id: "wumu-copy" },
                { kind: "arcVariant", arcId: "shendiao", key: "act5.wumu", eq: "left-in-vault" },
              ],
            },
            consumeDay: true,
            consequences: [
              { kind: "relation", npcId: "yinggu", delta: 4 },
              { kind: "arcVariant", arcId: "shendiao", key: "act5.yinggu-deal", value: "wumu-bargain" },
            ],
            resultText: "瑛姑补出一条避开山洪的旧驿道，也提醒你裘千仞与大理段氏之间另有未清的旧恶。",
            transition: { type: "goto", nodeId: "yinggu-request" },
          },
          {
            id: "hide-patient-name",
            text: "不报伤者姓名",
            description: "只问一阳指能否救铁掌伤，不把郭黄与丐帮带进她的旧局。",
            consumeDay: true,
            consequences: [
              { kind: "relation", npcId: "yinggu", delta: -2 },
              { kind: "arcVariant", arcId: "shendiao", key: "act5.yinggu-deal", value: "guarded" },
            ],
            resultText: "瑛姑没有追问姓名，只给出最险的一条水路。她也不再解释算筹背面的周伯通三字。",
            transition: { type: "goto", nodeId: "yinggu-request" },
          },
        ],
      },
      "yinggu-request": {
        id: "yinggu-request",
        title: "算筹两面",
        text: "瑛姑把水路图与乌木算筹分开放在桌上。水路能救眼前伤者，算筹则会把周伯通、旧日皇妃与一个夭折孩子带到一灯面前。",
        choices: [
          {
            id: "take-token",
            text: "带上算筹与旧问",
            description: "求医时不替她隐瞒，也不替她先定一灯有罪。",
            consumeDay: true,
            consequences: [
              { kind: "item", id: "yinggu-token" },
              { kind: "arcVariant", arcId: "shendiao", key: "act5.token", value: "accepted" },
            ],
            resultText: "你收下算筹与水路图。瑛姑只要求你把东西当面交给一灯，不许交给守关弟子。",
            transition: { type: "goto", nodeId: "marsh-end" },
          },
          {
            id: "take-route-only",
            text: "只取求医路线",
            description: "先救人，不替瑛姑把复仇信物带进一灯居。",
            consumeDay: true,
            consequences: [
              { kind: "karma", delta: 1 },
              { kind: "arcVariant", arcId: "shendiao", key: "act5.token", value: "refused" },
            ],
            resultText: "你只收水路图，把算筹推回桌上。瑛姑没有阻拦，却把通往正门的路线划掉一段。",
            transition: { type: "goto", nodeId: "marsh-end" },
          },
          {
            id: "promise-confrontation",
            text: "答应安排三方当面对质",
            description: "不做传话人，要求瑛姑、一灯与周伯通最终自己说清旧事。",
            condition: { kind: "arcVariant", arcId: "shendiao", key: "act5.yinggu-deal", eq: "motive-exposed" },
            consumeDay: true,
            consequences: [
              { kind: "relation", npcId: "yinggu", delta: 8 },
              { kind: "item", id: "yinggu-token" },
              { kind: "arcVariant", arcId: "shendiao", key: "act5.token", value: "confrontation" },
            ],
            resultText: "瑛姑把算筹交给你，另写下自己会等候的地点。她不要代答，只要三人都到场。",
            transition: { type: "goto", nodeId: "marsh-end" },
          },
        ],
      },
      "marsh-end": {
        id: "marsh-end",
        title: "出沼水路",
        text: "木筏沿瑛姑标出的水道离开黑沼，前方山路依次标着渔、樵、耕、读四个记号。伤势尚未稳定，一灯居也不会无条件开门。",
        onEnter: [
          { kind: "arcVariant", arcId: "shendiao", key: "act5.blackmarsh", value: "cleared" },
        ],
        autoNext: { type: "end" },
      },
    },
  },
  {
    id: "shendiao-yideng-act5",
    entryNode: "fisher-pass",
    locationId: "yidengju",
    weight: 8,
    once: true,
    condition: {
      kind: "and",
      items: [
        { kind: "arcVariant", arcId: "shendiao", key: "act5.blackmarsh", eq: "cleared" },
        { kind: "not", item: { kind: "arcBeat", arcId: "shendiao", beat: "act5-old-debts" } },
      ],
    },
    nodes: {
      "fisher-pass": {
        id: "fisher-pass",
        title: "渔关·逆水",
        text: "山脚只有一条逆流小舟。渔隐把船横在急水中央，不问武功，只问你愿不愿先把伤者与兵刃分船。强行抢渡，船必翻一艘。",
        choices: [
          {
            id: "send-patient-first",
            text: "让伤者先过急水",
            description: "自己留在后船稳住兵刃与行囊。",
            consumeDay: true,
            consequences: [
              { kind: "karma", delta: 3 },
              { kind: "relation", npcId: "yideng", delta: 2 },
            ],
            resultText: "你把最稳的小舟留给伤者，自己在后船压住船尾。渔隐看过两船吃水，放下了横江竹篙。",
            transition: { type: "goto", nodeId: "woodcutter-pass" },
          },
          {
            id: "read-current",
            text: "观察回流再定船序",
            description: "先找急水后的缓涡，让两船错开半程。",
            consumeDay: true,
            consequences: [
              { kind: "aptitude", delta: 2 },
            ],
            resultText: "你让前船借缓涡转向，后船再贴岸跟进。两船没有争同一条水线，渔隐随即让路。",
            transition: { type: "goto", nodeId: "woodcutter-pass" },
          },
          {
            id: "show-yinggu-route",
            text: "出示瑛姑水路图",
            description: "承认来路，也让守关人知道伤势不能再拖。",
            condition: {
              kind: "or",
              items: [
                { kind: "arcVariant", arcId: "shendiao", key: "act5.token", eq: "accepted" },
                { kind: "arcVariant", arcId: "shendiao", key: "act5.token", eq: "confrontation" },
              ],
            },
            consumeDay: true,
            consequences: [
              { kind: "relation", npcId: "yideng", delta: 1 },
            ],
            resultText: "渔隐认出黑沼水道，却没有接算筹。他只把小舟送到对岸，叫你自己向师父说明来意。",
            transition: { type: "goto", nodeId: "woodcutter-pass" },
          },
          {
            id: "follow-crossed-out-route",
            text: "按被划去的旧水道试渡",
            description: "没有带走算筹，只能自行补全瑛姑抹去的半段路线。",
            condition: { kind: "arcVariant", arcId: "shendiao", key: "act5.token", eq: "refused" },
            consumeDay: true,
            consequences: [
              { kind: "aptitude", delta: 1 },
              { kind: "hp", delta: -10 },
            ],
            resultText: "你从残图推回旧水道，船底仍在暗礁上擦过一次。渔隐见你护住伤者，最终放下竹篙接应。",
            transition: { type: "goto", nodeId: "woodcutter-pass" },
          },
        ],
      },
      "woodcutter-pass": {
        id: "woodcutter-pass",
        title: "樵关·收斧",
        text: "樵夫横斧守在窄桥中央，桥下便是深谷。他要试的不是谁能劈断斧柄，而是谁能在窄桥上逼人退开又不把人打落。",
        choices: [
          {
            id: "control-the-bridge",
            text: "只封步法，不攻要害",
            description: "以身法逼他让出半步，保住窄桥上的分寸。",
            consumeDay: true,
            consequences: [
              { kind: "speed", delta: 1 },
              { kind: "reputation", delta: 2 },
            ],
            resultText: "你连续封住樵夫三次落脚，最后一掌只停在肩前。他收斧退开，让出桥中通路。",
            transition: { type: "goto", nodeId: "farmer-pass" },
          },
          {
            id: "take-three-measured-moves",
            text: "接他三招而不毁桥",
            description: "正面过关，但不以重手震断木板。",
            consumeDay: true,
            transition: {
              type: "battle",
              enemyId: "yideng-disciple",
              onWin: {
                text: "你接住三招，最后把掌力引向桥边石柱。樵夫收斧认输，木桥仍可供伤者通过。",
                consequences: [
                  { kind: "reputation", delta: 3 },
                ],
                then: { type: "goto", nodeId: "farmer-pass" },
              },
              onLose: {
                text: "樵夫斧背压住你的肩，却没有继续发力。他看见你仍护在伤者一侧，收斧让出桥面。",
                consequences: [
                  { kind: "hp", delta: -15 },
                ],
                then: { type: "goto", nodeId: "farmer-pass" },
              },
              onFlee: {
                text: "你退回桥头，没有把樵夫引向伤者。双方换过位置后，他让出另一侧山径。",
                then: { type: "goto", nodeId: "farmer-pass" },
              },
            },
          },
        ],
      },
      "farmer-pass": {
        id: "farmer-pass",
        title: "耕关·担石",
        text: "农夫把山门石闩拆成两段，一段压在独轮车上，一段堵住坡道。要继续上山，必须有人承担重量，也可以想办法利用坡势。",
        choices: [
          {
            id: "carry-stone",
            text: "亲自把石闩担上坡",
            description: "不让伤者与守关人分担，靠根基走完这一段。",
            consumeDay: true,
            consequences: [
              { kind: "attack", delta: 1 },
              { kind: "relation", npcId: "yideng", delta: 2 },
            ],
            resultText: "你把石闩担到山门旁，肩上磨出一道血痕。农夫接过石闩，先替你敷药再开门。",
            transition: { type: "goto", nodeId: "scholar-pass" },
          },
          {
            id: "use-slope-and-rope",
            text: "借坡势与绳轮运石",
            description: "不与重量硬拼，把独轮车改成简易绞盘。",
            consumeDay: true,
            consequences: [
              { kind: "aptitude", delta: 2 },
            ],
            resultText: "你把车轮卡进石槽，以绳索借坡势拖动石闩。农夫看完机关，自己补上最后一根木楔。",
            transition: { type: "goto", nodeId: "scholar-pass" },
          },
          {
            id: "share-the-load",
            text: "与守关人分担重量",
            description: "不争谁的力气更大，先把道路恢复。",
            consumeDay: true,
            consequences: [
              { kind: "karma", delta: 2 },
            ],
            resultText: "你与农夫各担一端，把石闩重新送上山门。坡道清开后，伤者也能稳稳通过。",
            transition: { type: "goto", nodeId: "scholar-pass" },
          },
        ],
      },
      "scholar-pass": {
        id: "scholar-pass",
        title: "读关·问因",
        text: "书生守在竹门前，案上写着一句：求医者为今日之伤，送信者为往日之债。你若两件都带来，先说哪一件。",
        choices: [
          {
            id: "patient-before-debt",
            text: "先救伤者，再谈旧债",
            description: "旧事可以当面对质，铁掌伤势不能继续拖。",
            consumeDay: true,
            consequences: [
              { kind: "relation", npcId: "yideng", delta: 4 },
            ],
            resultText: "书生收起题纸，先派人去通知一灯准备金针与药炉。瑛姑算筹仍由你亲手保管。",
            transition: { type: "goto", nodeId: "lamp-chamber" },
          },
          {
            id: "declare-both-purposes",
            text: "求医与旧问都不隐瞒",
            description: "一灯救人前就该知道瑛姑为何指这条路。",
            condition: { kind: "hasItem", id: "yinggu-token" },
            consumeDay: true,
            consequences: [
              { kind: "reputation", delta: 2 },
              { kind: "relation", npcId: "yideng", delta: 2 },
            ],
            resultText: "你把伤势与算筹来历一并说清。书生没有代师父回答，只打开竹门让众人入内。",
            transition: { type: "goto", nodeId: "lamp-chamber" },
          },
          {
            id: "answer-with-action",
            text: "把兵刃留在门外",
            description: "先表明求医不是强闯，旧债也不会靠刀剑逼答。",
            consumeDay: true,
            consequences: [
              { kind: "karma", delta: 2 },
              { kind: "factionAttitude", factionId: "dali", delta: 5 },
            ],
            resultText: "你把兵刃放上案面。书生验过鞘中无暗器，开门请众人入内。",
            transition: { type: "goto", nodeId: "lamp-chamber" },
          },
        ],
      },
      "lamp-chamber": {
        id: "lamp-chamber",
        title: "一灯问诊",
        text: "一灯看过铁掌伤势，说明若以一阳指疏通经脉，自己数年功力都会受损。伤者可以获救，一灯居却会在数月内失去最强的护持。",
        choices: [
          {
            id: "accept-treatment",
            text: "接受一阳指救治",
            description: "承认救治有代价，并负责护住一灯虚弱期。",
            consumeDay: true,
            consequences: [
              { kind: "relation", npcId: "yideng", delta: 8 },
              { kind: "karma", delta: 3 },
            ],
            resultText: "一灯让四弟子封住竹门，开始以一阳指逐处疏通掌伤。治疗持续整夜。",
            transition: {
              type: "branch",
              cases: [
                {
                  when: { kind: "arcVariant", arcId: "shendiao", key: "act5.patient", eq: "player" },
                  then: { type: "goto", nodeId: "treat-player" },
                },
              ],
              else: { type: "goto", nodeId: "treat-huangrong" },
            },
          },
          {
            id: "refuse-full-cost",
            text: "拒绝让一灯耗尽功力",
            description: "只请他封住要穴，再另寻长期疗法。",
            condition: { kind: "arcVariant", arcId: "shendiao", key: "act5.injury", eq: "severe" },
            consumeDay: true,
            consequences: [
              { kind: "relation", npcId: "yideng", delta: 4 },
              { kind: "arcVariant", arcId: "shendiao", key: "act5.injury", value: "stabilized-not-cured" },
            ],
            resultText: "一灯以一阳指封住三处要穴，没有继续损耗本元。伤势暂不致命，却仍会影响往后运功。",
            transition: { type: "goto", nodeId: "old-debt-question" },
          },
          {
            id: "offer-guard-duty",
            text: "先承诺守住一灯居",
            description: "救治之后由你与同行人承担外敌，不让四弟子独守。",
            consumeDay: true,
            consequences: [
              { kind: "reputation", delta: 3 },
              { kind: "relation", npcId: "yideng", delta: 6 },
            ],
            resultText: "你先把护院、巡山与退路安排写在纸上。一灯看完才命弟子点起药炉，随后开始救治。",
            transition: {
              type: "branch",
              cases: [
                {
                  when: { kind: "arcVariant", arcId: "shendiao", key: "act5.patient", eq: "player" },
                  then: { type: "goto", nodeId: "treat-player" },
                },
              ],
              else: { type: "goto", nodeId: "treat-huangrong" },
            },
          },
        ],
      },
      "treat-player": {
        id: "treat-player",
        title: "经脉复通",
        text: "一阳指力逐处逼出铁掌余劲。天亮时，你已能自行运气，一灯脸色却比昨夜苍白许多。",
        onEnter: [
          { kind: "hp", delta: 240 },
          { kind: "arcVariant", arcId: "shendiao", key: "act5.injury", value: "cured" },
        ],
        autoNext: { type: "goto", nodeId: "old-debt-question" },
      },
      "treat-huangrong": {
        id: "treat-huangrong",
        title: "掌伤离脉",
        text: "一灯收指后，黄蓉背心黑印已经散去。她先向一灯行礼，再把竹杖放在门边，没有立刻起身。",
        onEnter: [
          { kind: "npcTag", npcId: "huangrong", tag: "铁掌重伤", add: false },
          { kind: "npcTag", npcId: "huangrong", tag: "铁掌掌伤", add: false },
          { kind: "npcTag", npcId: "huangrong", tag: "一灯救治" },
          { kind: "arcVariant", arcId: "shendiao", key: "act5.injury", value: "cured" },
        ],
        autoNext: { type: "goto", nodeId: "old-debt-question" },
      },
      "old-debt-question": {
        id: "old-debt-question",
        title: "算筹旧问",
        text: "救治结束，一灯看见乌木算筹上的旧刻。他说起周伯通、瑛姑与当年夭折的孩子，也承认自己曾因嫉恨与身份没有出手相救。",
        choices: [
          {
            id: "deliver-token",
            text: "把瑛姑原话完整转告",
            description: "不替她加罪，也不替一灯删去最难回答的一句。",
            condition: { kind: "hasItem", id: "yinggu-token" },
            consumeDay: true,
            consequences: [
              { kind: "item", id: "yinggu-token", count: -1 },
              { kind: "relation", npcId: "yideng", delta: 5 },
              { kind: "arcVariant", arcId: "shendiao", key: "act5.old-debt", value: "faced" },
            ],
            resultText: "你把算筹交给一灯，逐字转告瑛姑要三人当面对质。一灯收下算筹，答应伤者离开后亲往黑沼。",
            transition: { type: "goto", nodeId: "book-disposition-bridge" },
          },
          {
            id: "expose-revenge-plan",
            text: "说明瑛姑也想借救人逼债",
            description: "她的旧恨真实，利用伤者同样需要说清。",
            condition: { kind: "arcVariant", arcId: "shendiao", key: "act5.yinggu-deal", eq: "motive-exposed" },
            consumeDay: true,
            consequences: [
              { kind: "relation", npcId: "yideng", delta: 4 },
              { kind: "arcVariant", arcId: "shendiao", key: "act5.old-debt", value: "motive-named" },
            ],
            resultText: "你说清瑛姑为何选中这次重伤。一灯没有因此推翻她的旧问，只说自己会亲自去听。",
            transition: { type: "goto", nodeId: "book-disposition-bridge" },
          },
          {
            id: "conceal-token",
            text: "暂不拿出算筹",
            description: "一灯刚耗损功力，此刻不让黑沼旧债继续压进来。",
            condition: { kind: "hasItem", id: "yinggu-token" },
            consumeDay: true,
            consequences: [
              { kind: "relation", npcId: "yinggu", delta: -5 },
              { kind: "arcVariant", arcId: "shendiao", key: "act5.old-debt", value: "delayed" },
            ],
            resultText: "你只说黑沼有人等候，没有拿出算筹。一灯听出你有所保留，没有追问。",
            transition: { type: "goto", nodeId: "book-disposition-bridge" },
          },
          {
            id: "ask-direct-answer",
            text: "问他为何今日肯救",
            description: "不代瑛姑复仇，只让一灯说明今日与当年的差别。",
            consumeDay: true,
            consequences: [
              { kind: "aptitude", delta: 2 },
              { kind: "relation", npcId: "yideng", delta: 3 },
              { kind: "arcVariant", arcId: "shendiao", key: "act5.old-debt", value: "answered" },
            ],
            resultText: "一灯承认今日救人不能抵消当年的不救。他愿意面对瑛姑，也不会要求她先原谅。",
            transition: { type: "goto", nodeId: "book-disposition-bridge" },
          },
        ],
      },
      "book-disposition-bridge": {
        id: "book-disposition-bridge",
        title: "兵书在手",
        text: "伤势与旧债暂时收住，武穆遗书仍须决定去向。原本、节要或铁掌峰位置，都足以引来下一批争夺者。",
        autoNext: {
          type: "branch",
          cases: [
            {
              when: {
                kind: "or",
                items: [
                  { kind: "hasItem", id: "wumu-original" },
                  { kind: "hasItem", id: "wumu-copy" },
                ],
              },
              then: { type: "goto", nodeId: "book-disposition" },
            },
          ],
          else: { type: "goto", nodeId: "qiu-shadow" },
        },
      },
      "book-disposition": {
        id: "book-disposition",
        title: "武穆遗书去向",
        text: "郭靖主张兵书不可落入侵民之军，黄蓉则要求先留副本辨真伪。丐帮、宋廷与草原旧识都能接手，但每一处都有不同风险。",
        choices: [
          {
            id: "send-to-song-command",
            text: "交给可信宋军将领",
            description: "以守城与抗金为先，不让兵书继续留在江湖人手里。",
            consumeDay: true,
            consequences: [
              { kind: "item", id: "wumu-original", count: -1 },
              { kind: "item", id: "wumu-copy", count: -1 },
              { kind: "reputation", delta: 6 },
              { kind: "factionAttitude", factionId: "song", delta: 12 },
              { kind: "arcVariant", arcId: "shendiao", key: "act5.wumu-destination", value: "song-command" },
            ],
            resultText: "你把兵书封成军报，由丐帮两处分舵分路送往边军。收件将领只知道另一半路线在郭靖手里。",
            transition: { type: "goto", nodeId: "book-result-bridge" },
          },
          {
            id: "entrust-beggar-network",
            text: "交由丐帮分散保管",
            description: "原卷与节要分开，让净衣、污衣任何一派都不能独占。",
            consumeDay: true,
            consequences: [
              { kind: "item", id: "wumu-original", count: -1 },
              { kind: "item", id: "wumu-copy", count: -1 },
              { kind: "factionAttitude", factionId: "beggar", delta: 10 },
              { kind: "arcVariant", arcId: "shendiao", key: "act5.wumu-destination", value: "beggar-network" },
            ],
            resultText: "黄蓉把阵图、军纪与粮道分成三份，分别交给鲁有脚与两处分舵。完整内容必须三处合验。",
            transition: { type: "goto", nodeId: "book-result-bridge" },
          },
          {
            id: "keep-book",
            text: "暂由自己保管",
            description: "不把兵书交给任何现成势力，继续观察谁真正值得托付。",
            consumeDay: true,
            consequences: [
              { kind: "arcVariant", arcId: "shendiao", key: "act5.wumu-destination", value: "player-kept" },
            ],
            resultText: "你重新封好兵书与节要，未向任何一方交出原卷。郭靖要求至少另留一份路线给黄蓉。",
            transition: { type: "goto", nodeId: "book-result-bridge" },
          },
          {
            id: "send-mongol-copy",
            text: "把节要送回草原",
            description: "保留未来攻金筹码，但明确不得用于屠城与掠民。",
            condition: {
              kind: "and",
              items: [
                { kind: "hasItem", id: "mongol-wolf-tally" },
                { kind: "hasItem", id: "wumu-copy" },
              ],
            },
            consumeDay: true,
            consequences: [
              { kind: "item", id: "wumu-copy", count: -1 },
              { kind: "factionAttitude", factionId: "mongol", delta: 8 },
              { kind: "relation", npcId: "guojing", delta: -3 },
              { kind: "arcVariant", arcId: "shendiao", key: "act5.wumu-destination", value: "mongol-copy" },
            ],
            resultText: "你只送出阵法节要，没有交出军纪原卷，并在铜符密信中写明不可用此法纵军屠掠。",
            transition: { type: "goto", nodeId: "book-result-bridge" },
          },
        ],
      },
      "book-result-bridge": {
        id: "book-result-bridge",
        title: "军略归处",
        text: "兵书去向已经落定，送书人与保管人各自离开一灯居。竹门外却出现一串铁掌帮独有的深脚印。",
        autoNext: {
          type: "branch",
          cases: [
            {
              when: { kind: "arcVariant", arcId: "shendiao", key: "act5.wumu-destination", eq: "song-command" },
              then: { type: "goto", nodeId: "book-to-song" },
            },
            {
              when: { kind: "arcVariant", arcId: "shendiao", key: "act5.wumu-destination", eq: "beggar-network" },
              then: { type: "goto", nodeId: "book-to-beggars" },
            },
            {
              when: { kind: "arcVariant", arcId: "shendiao", key: "act5.wumu-destination", eq: "mongol-copy" },
              then: { type: "goto", nodeId: "book-to-mongol" },
            },
          ],
          else: { type: "goto", nodeId: "book-kept" },
        },
      },
      "book-to-song": {
        id: "book-to-song",
        title: "军报北送",
        text: "送往宋军的兵书已拆成两路，铁掌帮只截到一封空函。边军是否采用，仍要看持书之人如何用它。",
        autoNext: { type: "goto", nodeId: "qiu-shadow" },
      },
      "book-to-beggars": {
        id: "book-to-beggars",
        title: "三处分卷",
        text: "丐帮三处分舵各持一部分，杨康与铁掌帮无法靠拿下一名长老夺走全卷。",
        autoNext: { type: "goto", nodeId: "qiu-shadow" },
      },
      "book-to-mongol": {
        id: "book-to-mongol",
        title: "草原节要",
        text: "蒙古驿骑只带走阵法节要，军纪与屠城禁令仍留在你手中。郭靖没有赞同，却记住了这份约束。",
        autoNext: { type: "goto", nodeId: "qiu-shadow" },
      },
      "book-kept": {
        id: "book-kept",
        title: "兵书未交",
        text: "兵书仍在你身上。丐帮、宋廷、王府与铁掌帮都会继续追问，它还不是已经结束的奖励。",
        autoNext: { type: "goto", nodeId: "qiu-shadow" },
      },
      "qiu-shadow": {
        id: "qiu-shadow",
        title: "峰主到门",
        text: "裘千仞没有闯进竹门，只在山道外留下一枚裂开的铁掌令。他已经知道一灯救了伤者，也知道众人找到了兵书与禁宫军档的关联。",
        choices: [
          {
            id: "invite-qiu-to-answer",
            text: "请一灯留一条问罪之路",
            description: "不赦免裘千仞，也不让他只剩继续作恶一条路。",
            condition: {
              kind: "not",
              item: { kind: "arcVariant", arcId: "shendiao", key: "act5.old-debt", eq: "delayed" },
            },
            consumeDay: true,
            consequences: [
              { kind: "relation", npcId: "yideng", delta: 5 },
              { kind: "npcTag", npcId: "qiuqianren-npc", tag: "一灯愿见" },
              { kind: "arcVariant", arcId: "shendiao", key: "act5.qiu-fate", value: "invited" },
            ],
            resultText: "一灯在铁掌令背面写下一个见字，让弟子把令牌放回山道。裘千仞没有现身，也没有把令牌劈碎。",
            transition: { type: "goto", nodeId: "act5-ending-bridge" },
          },
          {
            id: "publish-qiu-crimes",
            text: "让丐帮继续追索铁掌旧恶",
            description: "兵书与掌伤都须有人负责，先把证据送往各处分舵。",
            consumeDay: true,
            consequences: [
              { kind: "reputation", delta: 4 },
              { kind: "factionAttitude", factionId: "iron-palm", delta: -10 },
              { kind: "arcVariant", arcId: "shendiao", key: "act5.qiu-fate", value: "pursued" },
            ],
            resultText: "黄蓉把铁掌峰内应、追杀与兵书记录送往各舵。裘千仞从此不能只靠帮主名号压住所有证人。",
            transition: { type: "goto", nodeId: "act5-ending-bridge" },
          },
          {
            id: "return-broken-token",
            text: "把裂令送回铁掌峰",
            description: "告诉裘千仞：下一次见面，先谈他做过的事。",
            consumeDay: true,
            consequences: [
              { kind: "relation", npcId: "qiuqianren-npc", delta: -3 },
              { kind: "npcTag", npcId: "qiuqianren-npc", tag: "收到问罪裂令" },
              { kind: "arcVariant", arcId: "shendiao", key: "act5.qiu-fate", value: "challenged" },
            ],
            resultText: "你把裂令原样送回峰下，只附上禁宫转运日期与伤者掌印。铁掌帮没有回信。",
            transition: { type: "goto", nodeId: "act5-ending-bridge" },
          },
        ],
      },
      "act5-ending-bridge": {
        id: "act5-ending-bridge",
        title: "旧债成网",
        text: "禁宫军档、密室命案、君山帮主、武穆遗书与一灯旧事已经连成一处。离开一灯居前，山道上的下一步仍取决于裘千仞如何回应。",
        autoNext: {
          type: "branch",
          cases: [
            {
              when: { kind: "arcVariant", arcId: "shendiao", key: "act5.qiu-fate", eq: "invited" },
              then: { type: "goto", nodeId: "act5-end-invited" },
            },
            {
              when: { kind: "arcVariant", arcId: "shendiao", key: "act5.qiu-fate", eq: "pursued" },
              then: { type: "goto", nodeId: "act5-end-pursued" },
            },
          ],
          else: { type: "goto", nodeId: "act5-end-challenged" },
        },
      },
      "act5-end-invited": {
        id: "act5-end-invited",
        title: "留一盏灯",
        text: "一灯把铁掌裂令放在窗边，留着裘千仞前来答话的位置。瑛姑与周伯通的会面也已约定，但没有人替他们先写下结果。",
        onEnter: [
          { kind: "arcBeat", arcId: "shendiao", beat: "act5-old-debts", result: "done" },
          { kind: "reputation", delta: 8 },
        ],
        autoNext: { type: "end" },
      },
      "act5-end-pursued": {
        id: "act5-end-pursued",
        title: "各舵传证",
        text: "丐帮弟子带着铁掌旧恶与兵书记录分路下山。裘千仞尚未回头，追索他的证据却已不再只掌握在一人手中。",
        onEnter: [
          { kind: "arcBeat", arcId: "shendiao", beat: "act5-old-debts", result: "done" },
          { kind: "reputation", delta: 8 },
        ],
        autoNext: { type: "end" },
      },
      "act5-end-challenged": {
        id: "act5-end-challenged",
        title: "裂令回峰",
        text: "裂开的铁掌令被送回峰下。裘千仞没有回应，一灯也没有撤去山门；双方下一次见面，兵书与掌伤都要当面算清。",
        onEnter: [
          { kind: "arcBeat", arcId: "shendiao", beat: "act5-old-debts", result: "done" },
          { kind: "reputation", delta: 8 },
        ],
        autoNext: { type: "end" },
      },
    },
  },
]
