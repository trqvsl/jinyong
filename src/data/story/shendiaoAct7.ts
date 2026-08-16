import type { StoryEvent } from "./schema"

// 第七幕 P3：
// 蒙古大漠负责草原再召与职责选择，西征大营负责诸王争令和俘虏处置，
// 撒马尔罕负责城外侦察。攻城、破城军纪与南归留待 P4-P5。
export const SHENDIAO_ACT7_STORY: StoryEvent[] = [
  {
    id: "shendiao-damos-act7",
    entryNode: "recall-entry",
    locationId: "damos",
    weight: 9,
    once: true,
    condition: {
      kind: "and",
      items: [
        { kind: "arcBeat", arcId: "shendiao", beat: "act6-truth" },
        { kind: "not", item: { kind: "arcVariant", arcId: "shendiao", key: "act7.recall", eq: "cleared" } },
        { kind: "not", item: { kind: "arcBeat", arcId: "shendiao", beat: "act7-western-campaign" } },
      ],
    },
    nodes: {
      "recall-entry": {
        id: "recall-entry",
        title: "草原再召",
        text: "北归驿路尽头立着三面军旗。中间一面写着郭靖军号，左侧驿骑带着蒙古令箭，右侧则停着运送伤者与存卷的车队。你从嘉兴带回的最后一件事，决定哪一队先认出你。",
        autoNext: {
          type: "branch",
          cases: [
            {
              when: { kind: "arcVariant", arcId: "shendiao", key: "act6.aftermath", eq: "return-damos" },
              then: { type: "goto", nodeId: "return-with-guojing" },
            },
            {
              when: { kind: "arcVariant", arcId: "shendiao", key: "act6.aftermath", eq: "track-wanyan" },
              then: { type: "goto", nodeId: "return-with-intelligence" },
            },
            {
              when: { kind: "arcVariant", arcId: "shendiao", key: "act6.aftermath", eq: "settle-survivors" },
              then: { type: "goto", nodeId: "return-with-survivors" },
            },
          ],
          else: { type: "goto", nodeId: "return-after-summons" },
        },
      },
      "return-with-guojing": {
        id: "return-with-guojing",
        title: "同骑北归",
        text: "郭靖与你一路换马北上，军报始终由他贴身收着。到了旧营外，他没有先去大帐，而是让驿骑把铁枪庙存卷送到安全处。郭靖：\"旧案已经有人守。眼前这封军令，咱们一起去问清。\"",
        autoNext: { type: "goto", nodeId: "old-camp-reunion" },
      },
      "return-with-intelligence": {
        id: "return-with-intelligence",
        title: "水路密报",
        text: "你沿完颜洪烈退走的水路追到北地，带回几份金国与花剌子模商队往来的记录。营门守卫不认江南封条，哲别却认出其中一条旧牧道。哲别：\"这条路能绕开关卡。先把图送进帐。\"",
        autoNext: { type: "goto", nodeId: "old-camp-reunion" },
      },
      "return-with-survivors": {
        id: "return-with-survivors",
        title: "伤者车队",
        text: "你先送完桃花岛伤者与存卷，再随北上车队进入草原。军营外的伤兵棚已经挤满人，李萍正带牧民分水和干粮。她看过车上伤者，才把一只热水囊递来。",
        autoNext: { type: "goto", nodeId: "old-camp-reunion" },
      },
      "return-after-summons": {
        id: "return-after-summons",
        title: "久别旧营",
        text: "你持北地召令独自进入草原。旧毡帐已经换成军需仓，少年时练箭的土坡也插满传令旗。营门守卫按军令验过姓名，仍要等郭靖或华筝出来认人。",
        autoNext: { type: "goto", nodeId: "old-camp-reunion" },
      },
      "old-camp-reunion": {
        id: "old-camp-reunion",
        title: "旧帐新令",
        text: "华筝先从马队中赶来，郭靖随后带着两名传令骑兵到帐前。李萍没有问军功，只把军报上的南北路线各看一遍。李萍：\"先听清要打谁、为何打。领了令再问，便迟了。\"",
        autoNext: { type: "goto", nodeId: "wumu-route" },
      },
      "wumu-route": {
        id: "wumu-route",
        title: "兵书旧账",
        text: "中军送来的攻城草图上已有武穆遗书阵法痕迹。兵书此前交到谁手里，决定这些内容为何会出现在蒙古军帐。",
        autoNext: {
          type: "branch",
          cases: [
            {
              when: { kind: "arcVariant", arcId: "shendiao", key: "act5.wumu-destination", eq: "mongol-copy" },
              then: { type: "goto", nodeId: "wumu-mongol-copy" },
            },
            {
              when: { kind: "arcVariant", arcId: "shendiao", key: "act5.wumu-destination", eq: "player-kept" },
              then: { type: "goto", nodeId: "wumu-player-kept" },
            },
            {
              when: { kind: "arcVariant", arcId: "shendiao", key: "act5.wumu-destination", eq: "song-command" },
              then: { type: "goto", nodeId: "wumu-song-command" },
            },
            {
              when: { kind: "arcVariant", arcId: "shendiao", key: "act5.wumu-destination", eq: "beggar-network" },
              then: { type: "goto", nodeId: "wumu-beggar-network" },
            },
          ],
          else: { type: "goto", nodeId: "wumu-no-copy" },
        },
      },
      "wumu-mongol-copy": {
        id: "wumu-mongol-copy",
        title: "草原已有节要",
        text: "你当初送出的阵法节要已经被拆成换防、粮道和攻城三卷。军纪与屠城禁令并不在其中。郭靖翻到卷尾。郭靖：\"阵法能少死些军士，可少了后半部，便没人问城破以后怎么办。\"",
        autoNext: { type: "goto", nodeId: "role-table" },
      },
      "wumu-player-kept": {
        id: "wumu-player-kept",
        title: "原卷仍在手中",
        text: "军帐里的草图只有残缺阵形，完整军纪仍在你保管的卷册中。成吉思汗的使者要求借阅三日，并以苍狼铜符作保。郭靖没有替你答应。",
        autoNext: { type: "goto", nodeId: "role-table" },
      },
      "wumu-song-command": {
        id: "wumu-song-command",
        title: "边军已有分卷",
        text: "阵法原本已经送往宋军，蒙古军帐里的草图来自战场缴获与商队转抄。两份内容有三处不同，传令官要求熟悉原卷的人当场校正。",
        autoNext: { type: "goto", nodeId: "role-table" },
      },
      "wumu-beggar-network": {
        id: "wumu-beggar-network",
        title: "三处分卷",
        text: "丐帮分存的三卷没有落入同一方手中，蒙古军帐只能拼出粮道与两处阵门。随军商队中却混有认得丐帮封记的人，城内民情也因此多了一条可查的路。",
        autoNext: { type: "goto", nodeId: "role-table" },
      },
      "wumu-no-copy": {
        id: "wumu-no-copy",
        title: "残图入帐",
        text: "军帐里的阵图来自旧战例与俘虏口供，互相矛盾。郭靖把三张图叠在一起，只能确认粮道与前锋驻地，攻城次序仍缺一半。",
        autoNext: { type: "goto", nodeId: "role-table" },
      },
      "role-table": {
        id: "role-table",
        title: "这一次做什么",
        text: "召令只要求你随军，没有替你决定职责。郭靖领本部兵马，哲别负责前锋斥候，拖雷正在清点粮队与伤兵。空下来的位置，要由你自己认领。",
        choices: [
          {
            id: "join-command",
            text: "随郭靖参与统兵",
            description: "不取代郭靖主将位置，负责传令校验、侧翼与临阵补位。",
            condition: {
              kind: "or",
              items: [
                { kind: "hasItem", id: "mongol-wolf-tally" },
                { kind: "factionAttitude", factionId: "mongol", gte: 10 },
                { kind: "npcHasTag", npcId: "temujin", tag: "愿将军务托给玩家" },
                { kind: "arcVariant", arcId: "shendiao", key: "act6.aftermath", eq: "return-damos" },
              ],
            },
            consumeDay: true,
            consequences: [
              { kind: "arcVariant", arcId: "shendiao", key: "act7.role", value: "command" },
              { kind: "factionAttitude", factionId: "mongol", delta: 5 },
              { kind: "relation", npcId: "guojing", delta: 4 },
            ],
            resultText: "你接下两枚侧翼令旗，只负责校对传令与补位。郭靖仍领本部。郭靖：\"若我下错令，你当面指出，不必替我留面子。\"",
            transition: { type: "goto", nodeId: "recall-close" },
          },
          {
            id: "lead-scouts",
            text: "领斥候先行",
            description: "与哲别分查城门、粮道和回营路线，先把情报带回来。",
            condition: {
              kind: "or",
              items: [
                { kind: "flag", name: "shendiao.damos.growth", eq: "riding" },
                { kind: "relation", npcId: "zhebie", gte: 8 },
                { kind: "hasItem", id: "mongol-wolf-tally" },
              ],
            },
            consumeDay: true,
            consequences: [
              { kind: "arcVariant", arcId: "shendiao", key: "act7.role", value: "scout" },
              { kind: "relation", npcId: "zhebie", delta: 5 },
              { kind: "reputation", delta: 2 },
            ],
            resultText: "哲别把东门与水道两支箭都交给你。哲别：\"先看，后报。没有看清的地方，不许拿猜测当军情。\"",
            transition: { type: "goto", nodeId: "recall-close" },
          },
          {
            id: "manage-rear",
            text: "管粮道、伤兵与后队",
            description: "先确保军队走得动，也让掉队者和伤者不被留在荒原。",
            consumeDay: true,
            consequences: [
              { kind: "arcVariant", arcId: "shendiao", key: "act7.role", value: "logistics" },
              { kind: "relation", npcId: "liping", delta: 4 },
              { kind: "karma", delta: 2 },
            ],
            resultText: "你接过粮车、伤兵棚与后队三本名册。李萍在缺水营地旁画出两处旧水眼，拖雷则把押粮骑兵交给你调度。",
            transition: { type: "goto", nodeId: "recall-close" },
          },
          {
            id: "remain-independent",
            text: "不受军职，独立随行",
            description: "保留说客、商路与查证身份，不让任何一方直接收走你的判断。",
            consumeDay: true,
            consequences: [
              { kind: "arcVariant", arcId: "shendiao", key: "act7.role", value: "independent" },
              { kind: "factionAttitude", factionId: "mongol", delta: -2 },
              { kind: "aptitude", delta: 1 },
            ],
            resultText: "你没有接令旗，只登记一匹换乘马和一张随军路引。成吉思汗的使者收回军职木牌，却允许你在商队与使帐之间通行。",
            transition: { type: "goto", nodeId: "recall-close" },
          },
        ],
      },
      "recall-close": {
        id: "recall-close",
        title: "军旗西去",
        text: "职责已经记入军册。西征大营先行拔营，郭靖与你将在下一处河谷与中军会合。",
        onEnter: [
          { kind: "arcVariant", arcId: "shendiao", key: "act7.recall", value: "cleared" },
        ],
        autoNext: { type: "end" },
      },
    },
  },
  {
    id: "shendiao-western-camp-act7",
    entryNode: "camp-arrival",
    locationId: "western-camp",
    weight: 9,
    once: true,
    condition: {
      kind: "and",
      items: [
        { kind: "arcVariant", arcId: "shendiao", key: "act7.recall", eq: "cleared" },
        { kind: "not", item: { kind: "arcVariant", arcId: "shendiao", key: "act7.camp", eq: "cleared" } },
        { kind: "not", item: { kind: "arcBeat", arcId: "shendiao", beat: "act7-western-campaign" } },
      ],
    },
    nodes: {
      "camp-arrival": {
        id: "camp-arrival",
        title: "西征大营",
        text: "西征大营沿河谷铺开数里。前锋旗、诸王旗与粮队旗各占一片营地，伤兵棚和俘虏圈却挤在同一条窄道旁。你刚到中军旗门，两封互相矛盾的调令便同时送来。",
        autoNext: {
          type: "branch",
          cases: [
            {
              when: { kind: "arcVariant", arcId: "shendiao", key: "act7.role", eq: "command" },
              then: { type: "goto", nodeId: "brief-command" },
            },
            {
              when: { kind: "arcVariant", arcId: "shendiao", key: "act7.role", eq: "scout" },
              then: { type: "goto", nodeId: "brief-scout" },
            },
            {
              when: { kind: "arcVariant", arcId: "shendiao", key: "act7.role", eq: "logistics" },
              then: { type: "goto", nodeId: "brief-logistics" },
            },
          ],
          else: { type: "goto", nodeId: "brief-independent" },
        },
      },
      "brief-command": {
        id: "brief-command",
        title: "两枚冲突令箭",
        text: "郭靖把术赤与察合台送来的令箭并排放下：一封要前锋抢先渡河，一封要抽走同一批马护粮。郭靖：\"两令不能同办。若只挑一边，另一边今日便会断。\"",
        autoNext: { type: "goto", nodeId: "orders-break" },
      },
      "brief-scout": {
        id: "brief-scout",
        title: "斥候无马",
        text: "哲别已经点好斥候，坐骑却被两位王子的亲兵各扣下一半。东门换防与西侧水道都等着查，马厩外的争吵已经拔出刀来。",
        autoNext: { type: "goto", nodeId: "orders-break" },
      },
      "brief-logistics": {
        id: "brief-logistics",
        title: "粮队停在河边",
        text: "拖雷把粮册交到你手里。术赤要粮车跟前锋先渡河，察合台则命粮车留下供中军使用。两支押粮骑兵堵住桥口，后面的伤兵车已经无法掉头。",
        autoNext: { type: "goto", nodeId: "orders-break" },
      },
      "brief-independent": {
        id: "brief-independent",
        title: "不在军册之内",
        text: "你没有军职，两边亲兵都不肯听你发令。郭靖却把传令原稿递来：术赤与察合台收到的副本都多了一句，字迹来自中军抄令房。",
        autoNext: { type: "goto", nodeId: "orders-break" },
      },
      "orders-break": {
        id: "orders-break",
        title: "同室操戈",
        text: "术赤与察合台在桥口相遇，各自认定对方扣住军马、篡改调令。两边骑兵已经分列河岸，粮车和伤兵车被夹在中间。成吉思汗尚在前营，眼下没有第三道令箭可以压住双方。",
        choices: [
          {
            id: "reorder-columns",
            text: "重排前锋与粮队次序",
            description: "拿出完整调令和阵图，把军马、粮车与渡河时辰重新拆开。",
            condition: {
              kind: "or",
              items: [
                { kind: "arcVariant", arcId: "shendiao", key: "act7.role", eq: "command" },
                { kind: "arcVariant", arcId: "shendiao", key: "act5.wumu-destination", eq: "player-kept" },
                { kind: "arcVariant", arcId: "shendiao", key: "act5.wumu-destination", eq: "mongol-copy" },
              ],
            },
            consumeDay: true,
            consequences: [
              { kind: "arcVariant", arcId: "shendiao", key: "act7.brothers", value: "reconciled" },
              { kind: "relation", npcId: "tuolei", delta: 4 },
              { kind: "factionAttitude", factionId: "mongol", delta: 4 },
            ],
            resultText: "你把前锋渡河提前半刻，粮车则改走下游浅滩，两边都不再争同一批马。术赤先收回前锋，察合台也撤掉堵桥亲兵。",
            transition: { type: "goto", nodeId: "prisoner-yard" },
          },
          {
            id: "disarm-both-sides",
            text: "与郭靖、拖雷无伤缴械",
            description: "不替任何一边判输赢，先把桥口和伤兵车从刀阵中抢出来。",
            condition: {
              kind: "or",
              items: [
                { kind: "flag", name: "shendiao.damos.growth", eq: "martial" },
                { kind: "arcVariant", arcId: "shendiao", key: "act7.role", eq: "command" },
              ],
            },
            consumeDay: true,
            transition: {
              type: "battle",
              enemyIds: ["mongol-camp-soldier", "mongol-camp-soldier"],
              allyIds: ["guojing", "tuolei"],
              objective: {
                kind: "surviveRounds",
                rounds: 2,
                protectAllyIds: ["guojing", "tuolei"],
                minProtectedSurvivors: 1,
                title: "夺下兵刃，保住调停者",
              },
              onWin: {
                text: "你与郭靖分开两列骑兵，拖雷趁机收走桥口令箭。双方兵刃被缴下，没有一人倒在粮车旁。",
                consequences: [
                  { kind: "arcVariant", arcId: "shendiao", key: "act7.brothers", value: "disarmed" },
                  { kind: "relation", npcId: "guojing", delta: 6 },
                  { kind: "factionAttitude", factionId: "mongol", delta: 2 },
                ],
                then: { type: "goto", nodeId: "prisoner-yard" },
              },
              onPartial: {
                text: "桥口兵刃最终被缴下，一名调停者却在混战中负伤。伤兵车保住了，术赤与察合台仍各自扣下一队亲兵。",
                consequences: [
                  { kind: "arcVariant", arcId: "shendiao", key: "act7.brothers", value: "disarmed" },
                  { kind: "relation", npcId: "guojing", delta: 2 },
                ],
                then: { type: "goto", nodeId: "prisoner-yard" },
              },
              onLose: {
                text: "两边骑兵冲散调停队伍，粮车翻在桥口。郭靖与拖雷把伤兵车带出刀阵，双方争令却没有真正停下。",
                consequences: [
                  { kind: "hp", delta: -25 },
                  { kind: "arcVariant", arcId: "shendiao", key: "act7.brothers", value: "unresolved" },
                  { kind: "factionAttitude", factionId: "mongol", delta: -3 },
                ],
                then: { type: "goto", nodeId: "prisoner-yard" },
              },
              onFlee: {
                text: "你退出桥口后，郭靖与拖雷只能先护住伤兵车。两边亲兵各退半里，冲突仍未解决。",
                consequences: [
                  { kind: "arcVariant", arcId: "shendiao", key: "act7.brothers", value: "unresolved" },
                  { kind: "factionAttitude", factionId: "mongol", delta: -4 },
                ],
                then: { type: "goto", nodeId: "prisoner-yard" },
              },
            },
          },
          {
            id: "exploit-rivalry",
            text: "借争令削弱两边亲兵",
            description: "让双方继续争一轮，再以中军名义收回空出的军马与指挥权。",
            consumeDay: true,
            consequences: [
              { kind: "arcVariant", arcId: "shendiao", key: "act7.brothers", value: "exploited" },
              { kind: "reputation", delta: 4 },
              { kind: "karma", delta: -4 },
              { kind: "relation", npcId: "guojing", delta: -7 },
            ],
            resultText: "你等双方各折一队人马，才带中军令骑收走桥口。空出的军马归到你手中，伤兵与粮车也因此多耽搁了半日。",
            transition: { type: "goto", nodeId: "prisoner-yard" },
          },
          {
            id: "protect-ledgers",
            text: "只保粮册、军报与伤兵车",
            description: "不替诸王争位作判断，先让军队仍能继续行进。",
            consumeDay: true,
            consequences: [
              { kind: "arcVariant", arcId: "shendiao", key: "act7.brothers", value: "unresolved" },
              { kind: "relation", npcId: "tuolei", delta: 5 },
              { kind: "aptitude", delta: 1 },
            ],
            resultText: "你带后队从浅滩绕开桥口，粮册、军报和伤兵车都没有遗失。术赤与察合台各自退营，争令被暂时压到下一次军议。",
            transition: { type: "goto", nodeId: "prisoner-yard" },
          },
        ],
      },
      "prisoner-yard": {
        id: "prisoner-yard",
        title: "俘虏不是军报",
        text: "桥口刚恢复通行，俘虏圈又送来三个人：一名受伤守军、一名城中译者和一名携双份路引的商队信使。三人口供互相矛盾，中军要求天黑前给出处置。",
        choices: [
          {
            id: "cross-check-statements",
            text: "分开核对三份口供",
            description: "把地名、换防时辰和路引印记逐项比对，不用刑讯替代证据。",
            consumeDay: true,
            consequences: [
              { kind: "arcVariant", arcId: "shendiao", key: "act7.prisoners", value: "verified" },
              { kind: "aptitude", delta: 2 },
              { kind: "relation", npcId: "zhebie", delta: 3 },
            ],
            resultText: "三人分开后仍说出同一处东门鼓号与一条废弃水渠。商队信使的第二份路引则来自城外蒙古细作。",
            transition: { type: "goto", nodeId: "camp-close" },
          },
          {
            id: "exchange-wounded",
            text: "用伤兵交换守军",
            description: "让双方各自带回一名伤者，也保留之后谈判与查证的余地。",
            consumeDay: true,
            consequences: [
              { kind: "arcVariant", arcId: "shendiao", key: "act7.prisoners", value: "exchanged" },
              { kind: "karma", delta: 3 },
              { kind: "relation", npcId: "guojing", delta: 4 },
              { kind: "factionAttitude", factionId: "mongol", delta: -2 },
            ],
            resultText: "你在河滩完成伤兵交换。守军被抬回城内前，指出西侧小门每三日接一次药材车。",
            transition: { type: "goto", nodeId: "camp-close" },
          },
          {
            id: "release-interpreter",
            text: "放译者带口信回城",
            description: "让他转告城中平民：城外仍有人愿意听招降与撤离条件。",
            consumeDay: true,
            consequences: [
              { kind: "arcVariant", arcId: "shendiao", key: "act7.prisoners", value: "released" },
              { kind: "karma", delta: 5 },
              { kind: "factionAttitude", factionId: "mongol", delta: -5 },
            ],
            resultText: "译者带着没有军印的口信走向城门。蒙古巡骑没有替你担保，城头却在日落前挂出一条白布回应。",
            transition: { type: "goto", nodeId: "camp-close" },
          },
          {
            id: "execute-as-spies",
            text: "按细作处置三人",
            description: "用最短时间封住泄密风险，也放弃继续核对口供。",
            consumeDay: true,
            consequences: [
              { kind: "arcVariant", arcId: "shendiao", key: "act7.prisoners", value: "executed" },
              { kind: "karma", delta: -8 },
              { kind: "factionAttitude", factionId: "mongol", delta: 5 },
              { kind: "relation", npcId: "guojing", delta: -10 },
            ],
            resultText: "三份路引被送入中军，口供则到此中断。郭靖收走处置记录，没有在军帐外与你争辩。",
            transition: { type: "goto", nodeId: "camp-close" },
          },
        ],
      },
      "camp-close": {
        id: "camp-close",
        title: "大营西移",
        text: "前锋、粮队和伤兵车重新上路。撒马尔罕的城墙已经出现在西南地平线上，斥候将在天黑前离开大营。",
        onEnter: [
          { kind: "arcVariant", arcId: "shendiao", key: "act7.camp", value: "cleared" },
        ],
        autoNext: { type: "end" },
      },
    },
  },
  {
    id: "shendiao-samarkand-scout-act7",
    entryNode: "city-horizon",
    locationId: "samarkand",
    weight: 9,
    once: true,
    condition: {
      kind: "and",
      items: [
        { kind: "arcVariant", arcId: "shendiao", key: "act7.camp", eq: "cleared" },
        { kind: "not", item: { kind: "arcVariant", arcId: "shendiao", key: "act7.scout", eq: "cleared" } },
        { kind: "not", item: { kind: "arcBeat", arcId: "shendiao", beat: "act7-western-campaign" } },
      ],
    },
    nodes: {
      "city-horizon": {
        id: "city-horizon",
        title: "撒马尔罕城外",
        text: "撒马尔罕城墙横在荒原尽头。东门换防旗每隔半个时辰移动一次，西侧水渠已经断流，南面商旅道则挤满难民与运粮车。一天只够优先查清一处。",
        autoNext: {
          type: "branch",
          cases: [
            {
              when: { kind: "arcVariant", arcId: "shendiao", key: "act7.brothers", eq: "exploited" },
              then: { type: "goto", nodeId: "escort-fractured" },
            },
            {
              when: { kind: "arcVariant", arcId: "shendiao", key: "act7.brothers", eq: "unresolved" },
              then: { type: "goto", nodeId: "escort-thin" },
            },
          ],
          else: { type: "goto", nodeId: "escort-ordered" },
        },
      },
      "escort-fractured": {
        id: "escort-fractured",
        title: "两部各守一边",
        text: "术赤与察合台各派一队人盯着对方，真正能随你出营的骑兵反而不足。哲别把多余军旗留在营里。哲别：\"今日只查一处，回程也只走一条路。\"",
        autoNext: { type: "goto", nodeId: "scout-priority" },
      },
      "escort-thin": {
        id: "escort-thin",
        title: "争令未息",
        text: "桥口争令虽停，双方斥候仍不肯共用口令。你只能带少量骑兵离营，回程若遇追骑，另一部未必接应。",
        autoNext: { type: "goto", nodeId: "scout-priority" },
      },
      "escort-ordered": {
        id: "escort-ordered",
        title: "军令暂时一致",
        text: "两部骑兵按同一份换防表出营，哲别负责东侧，拖雷留下接应。军中内斗没有消失，至少今日的号令仍能互认。",
        autoNext: { type: "goto", nodeId: "scout-priority" },
      },
      "scout-priority": {
        id: "scout-priority",
        title: "只能先查一处",
        text: "城门、水道与难民通道都在变化。你必须先选一处查到底，其余情报只能留给下一轮军议承担风险。",
        choices: [
          {
            id: "inspect-east-gate",
            text: "查东门换防与鼓号",
            description: "确认守军何时换旗、哪一道门会在鼓号间短暂失去支援。",
            transition: { type: "goto", nodeId: "gate-method" },
          },
          {
            id: "trace-water-and-grain",
            text: "查水源、粮车与旧渠",
            description: "找出围城能持续多久，也确认是否有不经过正门的路线。",
            transition: { type: "goto", nodeId: "supply-method" },
          },
          {
            id: "follow-refugee-route",
            text: "查难民通道与城内口风",
            description: "先分清出城者、守军家属与真正的细作，避免把所有人当成同一类人。",
            transition: { type: "goto", nodeId: "civilian-method" },
          },
          {
            id: "enter-with-caravan",
            text: "随商队混入外郭",
            description: "利用旧商路、王府记录或自由身份，直接接触城内人。",
            condition: {
              kind: "or",
              items: [
                { kind: "flag", name: "shendiao.damos.growth", eq: "free" },
                { kind: "arcVariant", arcId: "shendiao", key: "act7.role", eq: "independent" },
                { kind: "arcVariant", arcId: "shendiao", key: "act6.aftermath", eq: "track-wanyan" },
                { kind: "arcVariant", arcId: "shendiao", key: "act7.prisoners", eq: "verified" },
              ],
            },
            transition: { type: "goto", nodeId: "infiltration-method" },
          },
        ],
      },
      "gate-method": {
        id: "gate-method",
        title: "东门旗影",
        text: "东门前是一片没有遮挡的盐碱地。高坡能看见旗号，却听不清鼓声；贴近城门能同时确认两者，也会进入追骑与守军弓箭之间。",
        choices: [
          {
            id: "ride-close-with-jebe",
            text: "与哲别贴近城门",
            description: "用骑术穿过两轮追截，把鼓号与旗号一起带回去。",
            condition: {
              kind: "or",
              items: [
                { kind: "arcVariant", arcId: "shendiao", key: "act7.role", eq: "scout" },
                { kind: "flag", name: "shendiao.damos.growth", eq: "riding" },
                { kind: "relation", npcId: "zhebie", gte: 8 },
              ],
            },
            consumeDay: true,
            transition: {
              type: "battle",
              enemyIds: ["western-pursuer", "western-pursuer"],
              allyIds: ["zhebie"],
              objective: {
                kind: "surviveRounds",
                rounds: 2,
                protectAllyId: "zhebie",
                title: "确认两轮鼓号并带哲别回营",
              },
              onWin: {
                text: "你与哲别穿过两轮追截，记下东门鼓号比换旗早半刻。守军支援会在第二遍鼓声后短暂断开。",
                consequences: [
                  { kind: "arcVariant", arcId: "shendiao", key: "act7.scout-method", value: "cavalry" },
                  { kind: "arcVariant", arcId: "shendiao", key: "act7.intel", value: "complete" },
                  { kind: "relation", npcId: "zhebie", delta: 5 },
                ],
                then: { type: "goto", nodeId: "scout-report-router" },
              },
              onLose: {
                text: "追骑把你们逼离东门，守军随即更换旗号。鼓声只记下一轮，城头也已经发现这支斥候。",
                consequences: [
                  { kind: "arcVariant", arcId: "shendiao", key: "act7.scout-method", value: "cavalry" },
                  { kind: "arcVariant", arcId: "shendiao", key: "act7.intel", value: "exposed" },
                  { kind: "hp", delta: -20 },
                ],
                then: { type: "goto", nodeId: "scout-report-router" },
              },
              onFlee: {
                text: "你与哲别在第二轮追骑前撤回高坡，只核准第一遍鼓号。守军尚未看清你们的旗色。",
                consequences: [
                  { kind: "arcVariant", arcId: "shendiao", key: "act7.scout-method", value: "cavalry" },
                  { kind: "arcVariant", arcId: "shendiao", key: "act7.intel", value: "partial" },
                ],
                then: { type: "goto", nodeId: "scout-report-router" },
              },
            },
          },
          {
            id: "count-from-ridge",
            text: "留在高坡记录换防",
            description: "不冒险贴近，只确认旗号与守军人数，鼓声部分留待军议估算。",
            consumeDay: true,
            consequences: [
              { kind: "arcVariant", arcId: "shendiao", key: "act7.scout-method", value: "cavalry" },
              { kind: "arcVariant", arcId: "shendiao", key: "act7.intel", value: "partial" },
              { kind: "aptitude", delta: 1 },
            ],
            resultText: "你在高坡记完三次换旗，确认东门每轮会少一队守军。风向吞掉大半鼓声，换旗与开门的准确间隔仍不能确定。",
            transition: { type: "goto", nodeId: "scout-report-router" },
          },
        ],
      },
      "supply-method": {
        id: "supply-method",
        title: "断流旧渠",
        text: "西侧水渠表面已经断流，渠底却有新车辙。粮车在上游消失，另一批空车从城南回来，说明旧渠仍有一段可通行。",
        choices: [
          {
            id: "follow-old-water-eye",
            text: "沿旧水眼反查粮道",
            description: "用草原生存经验或后队名册，对照水源、车辙与伤兵取水点。",
            condition: {
              kind: "or",
              items: [
                { kind: "flag", name: "shendiao.damos.growth", eq: "survival" },
                { kind: "arcVariant", arcId: "shendiao", key: "act7.role", eq: "logistics" },
              ],
            },
            consumeDay: true,
            consequences: [
              { kind: "arcVariant", arcId: "shendiao", key: "act7.scout-method", value: "supply" },
              { kind: "arcVariant", arcId: "shendiao", key: "act7.intel", value: "complete" },
              { kind: "relation", npcId: "tuolei", delta: 4 },
            ],
            resultText: "你从上游水眼反查到旧渠入口，确认粮车每两日夜运一次。渠口也能容两人并行，但无法通过战马。",
            transition: { type: "goto", nodeId: "scout-report-router" },
          },
          {
            id: "shadow-grain-carts",
            text: "跟住往返粮车",
            description: "只记录车数、方向与时辰，不冒险进入旧渠。",
            consumeDay: true,
            consequences: [
              { kind: "arcVariant", arcId: "shendiao", key: "act7.scout-method", value: "supply" },
              { kind: "arcVariant", arcId: "shendiao", key: "act7.intel", value: "partial" },
            ],
            resultText: "你跟完两轮粮车，确认旧渠仍在使用，也记下大致时辰。入口被土坡挡住，能否供人通行还没有实证。",
            transition: { type: "goto", nodeId: "scout-report-router" },
          },
        ],
      },
      "civilian-method": {
        id: "civilian-method",
        title: "难民与口信",
        text: "南面商旅道挤着出城百姓、守军家属和倒卖路引的人。蒙古巡骑把他们拦在两道木栅之间，所有人口供都被混在同一本册子里。",
        choices: [
          {
            id: "use-relief-network",
            text: "借旧接应网分开查问",
            description: "用丐帮分卷、伤者车队或俘虏交换留下的接应，把百姓与细作分开。",
            condition: {
              kind: "or",
              items: [
                { kind: "arcVariant", arcId: "shendiao", key: "act5.wumu-destination", eq: "beggar-network" },
                { kind: "arcVariant", arcId: "shendiao", key: "act6.aftermath", eq: "settle-survivors" },
                { kind: "arcVariant", arcId: "shendiao", key: "act7.prisoners", eq: "exchanged" },
                { kind: "arcVariant", arcId: "shendiao", key: "act7.prisoners", eq: "released" },
              ],
            },
            consumeDay: true,
            consequences: [
              { kind: "arcVariant", arcId: "shendiao", key: "act7.scout-method", value: "civilian" },
              { kind: "arcVariant", arcId: "shendiao", key: "act7.intel", value: "complete" },
              { kind: "karma", delta: 3 },
            ],
            resultText: "你把三批人分开登记，核出南门药材车与难民通道共用一段路。城内每逢换药，侧门会打开一刻钟。",
            transition: { type: "goto", nodeId: "scout-report-router" },
          },
          {
            id: "record-crossings",
            text: "只记录出城时辰与人数",
            description: "不依赖任何旧关系，先固定哪一道栅门真正有人往返。",
            consumeDay: true,
            consequences: [
              { kind: "arcVariant", arcId: "shendiao", key: "act7.scout-method", value: "civilian" },
              { kind: "arcVariant", arcId: "shendiao", key: "act7.intel", value: "partial" },
              { kind: "reputation", delta: 1 },
            ],
            resultText: "你记下三轮出城人流，确认南门确有固定通道。百姓与守军家属仍混在一起，侧门开闭原因尚未查清。",
            transition: { type: "goto", nodeId: "scout-report-router" },
          },
        ],
      },
      "infiltration-method": {
        id: "infiltration-method",
        title: "商队外郭",
        text: "一支药材商队将在日落前进入外郭。车队持有两套路引，一套给城门守军，一套给城外巡骑。你只能选择其中一种身份跟进去。",
        choices: [
          {
            id: "use-wangfu-ledger",
            text: "用王府商路记录核验暗号",
            description: "完颜洪烈水路记录中留有同一批商号，可反查城内接头人。",
            condition: { kind: "arcVariant", arcId: "shendiao", key: "act6.aftermath", eq: "track-wanyan" },
            consumeDay: true,
            consequences: [
              { kind: "arcVariant", arcId: "shendiao", key: "act7.scout-method", value: "infiltration" },
              { kind: "arcVariant", arcId: "shendiao", key: "act7.intel", value: "complete" },
            ],
            resultText: "你用王府记录对上商号暗语，跟车进入外郭仓场。东门军械与南门药材共用一名仓官，换防名单也在他手里。",
            transition: { type: "goto", nodeId: "scout-report-router" },
          },
          {
            id: "travel-as-merchant",
            text: "按旧商路扮作押货人",
            description: "利用多年游历或独立随军身份，不借任何军中令牌。",
            condition: {
              kind: "or",
              items: [
                { kind: "flag", name: "shendiao.damos.growth", eq: "free" },
                { kind: "arcVariant", arcId: "shendiao", key: "act7.role", eq: "independent" },
              ],
            },
            consumeDay: true,
            consequences: [
              { kind: "arcVariant", arcId: "shendiao", key: "act7.scout-method", value: "infiltration" },
              { kind: "arcVariant", arcId: "shendiao", key: "act7.intel", value: "complete" },
              { kind: "aptitude", delta: 2 },
            ],
            resultText: "你随车进入外郭，在卸货时看清东门换防册与南门药材签押。商队离城前，你已把两处时辰分别记下。",
            transition: { type: "goto", nodeId: "scout-report-router" },
          },
          {
            id: "use-prisoner-passphrase",
            text: "用三份口供拼出的暗语",
            description: "俘虏口供已经核实，可用东门鼓号与商队印记换取城内接头。",
            condition: { kind: "arcVariant", arcId: "shendiao", key: "act7.prisoners", eq: "verified" },
            consumeDay: true,
            consequences: [
              { kind: "arcVariant", arcId: "shendiao", key: "act7.scout-method", value: "infiltration" },
              { kind: "arcVariant", arcId: "shendiao", key: "act7.intel", value: "complete" },
              { kind: "relation", npcId: "zhebie", delta: 2 },
            ],
            resultText: "暗语让守门人误认你是换路信使。你进入仓场后核出东门鼓号、旧渠入口与南门药车三条记录，但也只能带走抄本。",
            transition: { type: "goto", nodeId: "scout-report-router" },
          },
        ],
      },
      "scout-report-router": {
        id: "scout-report-router",
        title: "把所见带回去",
        text: "斥候回到营外，军议只收可复核的记录。你先按侦察方法整理地图、时辰和口供，再说明哪些部分仍是空白。",
        autoNext: {
          type: "branch",
          cases: [
            {
              when: { kind: "arcVariant", arcId: "shendiao", key: "act7.scout-method", eq: "cavalry" },
              then: { type: "goto", nodeId: "report-gate" },
            },
            {
              when: { kind: "arcVariant", arcId: "shendiao", key: "act7.scout-method", eq: "supply" },
              then: { type: "goto", nodeId: "report-supply" },
            },
            {
              when: { kind: "arcVariant", arcId: "shendiao", key: "act7.scout-method", eq: "civilian" },
              then: { type: "goto", nodeId: "report-civilian" },
            },
          ],
          else: { type: "goto", nodeId: "report-infiltration" },
        },
      },
      "report-gate": {
        id: "report-gate",
        title: "东门记录",
        text: "军图上新增三轮换旗与鼓号记录。下一次军议可以据此设计佯攻，但粮道和难民通道仍没有同时查清。",
        autoNext: { type: "goto", nodeId: "intel-strength-router" },
      },
      "report-supply": {
        id: "report-supply",
        title: "水粮记录",
        text: "军图上新增旧渠、粮车与取水时辰。下一次军议可以讨论封锁或潜入，但城门换防仍缺准确鼓号。",
        autoNext: { type: "goto", nodeId: "intel-strength-router" },
      },
      "report-civilian": {
        id: "report-civilian",
        title: "民路记录",
        text: "军图上新增南门药车与难民通道。下一次军议可以先留出平民出口，但东门与旧渠仍需承担未知风险。",
        autoNext: { type: "goto", nodeId: "intel-strength-router" },
      },
      "report-infiltration": {
        id: "report-infiltration",
        title: "外郭抄本",
        text: "军图旁多出一份仓场抄本。城门、药车或旧渠中至少两项得到旁证，但城内接头人也可能因这次潜入更换暗号。",
        autoNext: { type: "goto", nodeId: "intel-strength-router" },
      },
      "intel-strength-router": {
        id: "intel-strength-router",
        title: "军情强弱",
        text: "郭靖把已证与未证部分分开压在军图两侧，不允许传令官把推测抄进正式军报。",
        autoNext: {
          type: "branch",
          cases: [
            {
              when: { kind: "arcVariant", arcId: "shendiao", key: "act7.intel", eq: "complete" },
              then: { type: "goto", nodeId: "intel-complete" },
            },
            {
              when: { kind: "arcVariant", arcId: "shendiao", key: "act7.intel", eq: "exposed" },
              then: { type: "goto", nodeId: "intel-exposed" },
            },
          ],
          else: { type: "goto", nodeId: "intel-partial" },
        },
      },
      "intel-complete": {
        id: "intel-complete",
        title: "可用军情",
        text: "关键时辰与路线都有两处记录互相印证。军议可以据此减少一处正面强攻，但其他两处风险仍需保留。",
        autoNext: { type: "goto", nodeId: "scout-close" },
      },
      "intel-partial": {
        id: "intel-partial",
        title: "一处已证",
        text: "侦察目标已经找到，关键间隔或入口仍缺旁证。军议可以使用这份记录，却不能把它当成完整城防图。",
        autoNext: { type: "goto", nodeId: "scout-close" },
      },
      "intel-exposed": {
        id: "intel-exposed",
        title: "守军已经警觉",
        text: "带回的记录仍有价值，城头却已更换一轮旗号。下一次军议若继续使用旧时辰，必须承担守军设伏的风险。",
        autoNext: { type: "goto", nodeId: "scout-close" },
      },
      "scout-close": {
        id: "scout-close",
        title: "军议前夜",
        text: "侦察记录已经封入军匣。天亮后，各部会依据这份不完整的城防图选择攻城方式。",
        onEnter: [
          { kind: "arcVariant", arcId: "shendiao", key: "act7.scout", value: "cleared" },
        ],
        autoNext: { type: "end" },
      },
    },
  },
  {
    id: "shendiao-samarkand-siege-act7",
    entryNode: "council-dawn",
    locationId: "samarkand",
    weight: 9,
    once: true,
    condition: {
      kind: "and",
      items: [
        { kind: "arcVariant", arcId: "shendiao", key: "act7.scout", eq: "cleared" },
        { kind: "not", item: { kind: "arcVariant", arcId: "shendiao", key: "act7.siege", eq: "cleared" } },
        { kind: "not", item: { kind: "arcBeat", arcId: "shendiao", beat: "act7-western-campaign" } },
      ],
    },
    nodes: {
      "council-dawn": {
        id: "council-dawn",
        title: "城下军议",
        text: "天亮前，中军帐只点了三盏灯。东门旗号、旧渠车辙、南门药车与外郭抄本都摊在军图旁，未查明的地方则被郭靖用空白木牌压住。",
        autoNext: {
          type: "branch",
          cases: [
            {
              when: { kind: "arcVariant", arcId: "shendiao", key: "act7.intel", eq: "complete" },
              then: { type: "goto", nodeId: "intel-ready" },
            },
            {
              when: { kind: "arcVariant", arcId: "shendiao", key: "act7.intel", eq: "exposed" },
              then: { type: "goto", nodeId: "intel-compromised" },
            },
          ],
          else: { type: "goto", nodeId: "intel-limited" },
        },
      },
      "intel-ready": {
        id: "intel-ready",
        title: "两处互证",
        text: "关键时辰已有两处记录互相印证。郭靖把已证部分交给传令官。郭靖：\"能用的写进军令，没查清的仍按最坏处置。\"",
        autoNext: { type: "goto", nodeId: "siege-orders" },
      },
      "intel-limited": {
        id: "intel-limited",
        title: "一处已证",
        text: "侦察只查清一处目标，鼓号、旧渠或南门通道仍缺旁证。成吉思汗允许按这份记录出兵，但要求领令者自担失误。",
        autoNext: { type: "goto", nodeId: "siege-orders" },
      },
      "intel-compromised": {
        id: "intel-compromised",
        title: "守军已换旗",
        text: "城头已经更换一轮旗号，部分旧时辰可能正等着诱敌。哲别把暴露过的路线全部划去，军议可用的路因此少了一半。",
        autoNext: { type: "goto", nodeId: "siege-orders" },
      },
      "siege-orders": {
        id: "siege-orders",
        title: "下哪一道军令",
        text: "成吉思汗只问两件事：要多少兵，承担什么代价。四种方案不能同时执行，先出的军令会改变其余各部的站位。",
        choices: [
          {
            id: "order-feint",
            text: "佯攻换防，撕开东门支援",
            description: "利用旗号、鼓声或外郭抄本，让守军把预备队调到错误城门。",
            condition: {
              kind: "or",
              items: [
                { kind: "arcVariant", arcId: "shendiao", key: "act7.scout-method", eq: "cavalry" },
                { kind: "arcVariant", arcId: "shendiao", key: "act7.scout-method", eq: "infiltration" },
              ],
            },
            consumeDay: true,
            consequences: [
              { kind: "arcVariant", arcId: "shendiao", key: "act7.siege-plan", value: "feint" },
            ],
            transition: {
              type: "branch",
              cases: [
                {
                  when: { kind: "arcVariant", arcId: "shendiao", key: "act7.intel", eq: "complete" },
                  then: {
                    type: "battle",
                    enemyIds: ["samarkand-defender", "samarkand-defender"],
                    allyIds: ["guojing", "zhebie"],
                    objective: {
                      kind: "surviveRounds",
                      rounds: 2,
                      protectAllyIds: ["guojing", "zhebie"],
                      minProtectedSurvivors: 1,
                      title: "撑过两轮，等守军误调预备队",
                    },
                    onWin: {
                      text: "东门守军连续两次追着假旗换位，预备队被调离城楼。郭靖带前锋占住门外壕沟，没有让调停部队倒下。",
                      consequences: [
                        { kind: "arcVariant", arcId: "shendiao", key: "act7.siege-outcome", value: "clean" },
                        { kind: "relation", npcId: "guojing", delta: 5 },
                      ],
                      then: { type: "goto", nodeId: "siege-plan-router" },
                    },
                    onPartial: {
                      text: "假旗成功调走预备队，一名调停者却在撤旗时负伤。前锋仍占住壕沟，伤兵被抬回后队。",
                      consequences: [
                        { kind: "arcVariant", arcId: "shendiao", key: "act7.siege-outcome", value: "costly" },
                        { kind: "relation", npcId: "guojing", delta: 2 },
                      ],
                      then: { type: "goto", nodeId: "siege-plan-router" },
                    },
                    onLose: {
                      text: "守军没有追错旗号，反而从侧门夹击前锋。郭靖带人退回壕沟外，佯攻时辰已经失效。",
                      consequences: [
                        { kind: "arcVariant", arcId: "shendiao", key: "act7.siege-outcome", value: "stalled" },
                        { kind: "hp", delta: -30 },
                      ],
                      then: { type: "goto", nodeId: "siege-plan-router" },
                    },
                    onFlee: {
                      text: "你提前撤下假旗，守军没有完全离开东门。前锋保住兵力，却错过唯一一次换防空隙。",
                      consequences: [
                        { kind: "arcVariant", arcId: "shendiao", key: "act7.siege-outcome", value: "stalled" },
                      ],
                      then: { type: "goto", nodeId: "siege-plan-router" },
                    },
                  },
                },
              ],
              else: {
                type: "battle",
                enemyIds: ["samarkand-defender", "samarkand-defender", "western-pursuer"],
                allyIds: ["guojing", "zhebie"],
                objective: {
                  kind: "surviveRounds",
                  rounds: 3,
                  protectAllyIds: ["guojing", "zhebie"],
                  minProtectedSurvivors: 1,
                  title: "在可疑旗号下撑过三轮追截",
                },
                onWin: {
                  text: "旧旗号虽然有误，你们仍逼守军暴露第二队预备兵。前锋抢下壕沟，但动用了原本留给撤退的骑兵。",
                  consequences: [
                    { kind: "arcVariant", arcId: "shendiao", key: "act7.siege-outcome", value: "costly" },
                    { kind: "factionAttitude", factionId: "mongol", delta: 2 },
                  ],
                  then: { type: "goto", nodeId: "siege-plan-router" },
                },
                onPartial: {
                  text: "守军暴露预备兵，一名调停者却在追截中负伤。壕沟入口只占下一半，双方都在重新集结。",
                  consequences: [
                    { kind: "arcVariant", arcId: "shendiao", key: "act7.siege-outcome", value: "costly" },
                  ],
                  then: { type: "goto", nodeId: "siege-plan-router" },
                },
                onLose: {
                  text: "守军识破假旗，从壕沟与侧门同时反击。前锋退回原阵，城头也换掉全部旧号。",
                  consequences: [
                    { kind: "arcVariant", arcId: "shendiao", key: "act7.siege-outcome", value: "stalled" },
                    { kind: "hp", delta: -40 },
                  ],
                  then: { type: "goto", nodeId: "siege-plan-router" },
                },
                onFlee: {
                  text: "你撤回假旗，保住斥候与前锋。东门没有失守，旧换防记录也彻底作废。",
                  consequences: [
                    { kind: "arcVariant", arcId: "shendiao", key: "act7.siege-outcome", value: "stalled" },
                  ],
                  then: { type: "goto", nodeId: "siege-plan-router" },
                },
              },
            },
          },
          {
            id: "order-blockade",
            text: "截断粮道，逼守军出城",
            description: "利用旧渠、粮车和后队调度，守住封锁线而不急着撞城门。",
            condition: {
              kind: "or",
              items: [
                { kind: "arcVariant", arcId: "shendiao", key: "act7.scout-method", eq: "supply" },
                { kind: "arcVariant", arcId: "shendiao", key: "act7.role", eq: "logistics" },
                { kind: "arcVariant", arcId: "shendiao", key: "act5.wumu-destination", eq: "player-kept" },
                { kind: "arcVariant", arcId: "shendiao", key: "act5.wumu-destination", eq: "mongol-copy" },
              ],
            },
            consumeDay: true,
            consequences: [
              { kind: "arcVariant", arcId: "shendiao", key: "act7.siege-plan", value: "blockade" },
            ],
            transition: {
              type: "branch",
              cases: [
                {
                  when: { kind: "arcVariant", arcId: "shendiao", key: "act7.intel", eq: "complete" },
                  then: {
                    type: "battle",
                    enemyIds: ["samarkand-defender", "western-pursuer"],
                    allyIds: ["guojing", "tuolei"],
                    objective: {
                      kind: "surviveRounds",
                      rounds: 3,
                      protectAllyIds: ["guojing", "tuolei"],
                      minProtectedSurvivors: 1,
                      title: "守住旧渠与粮车封锁线",
                    },
                    onWin: {
                      text: "旧渠与粮车道同时被截，守军三次出城都未能冲开封锁。城头在日落前挂出议降白旗。",
                      consequences: [
                        { kind: "arcVariant", arcId: "shendiao", key: "act7.siege-outcome", value: "clean" },
                        { kind: "factionAttitude", factionId: "mongol", delta: 4 },
                      ],
                      then: { type: "goto", nodeId: "siege-plan-router" },
                    },
                    onPartial: {
                      text: "封锁线最终守住，一名调停者却在粮车反冲中负伤。守军开始议降，后队也损失了一批药材。",
                      consequences: [
                        { kind: "arcVariant", arcId: "shendiao", key: "act7.siege-outcome", value: "costly" },
                      ],
                      then: { type: "goto", nodeId: "siege-plan-router" },
                    },
                    onLose: {
                      text: "守军从未标出的渠口冲出，烧掉两排粮车。封锁线后撤，议降白旗也从城头消失。",
                      consequences: [
                        { kind: "arcVariant", arcId: "shendiao", key: "act7.siege-outcome", value: "stalled" },
                        { kind: "factionAttitude", factionId: "mongol", delta: -4 },
                      ],
                      then: { type: "goto", nodeId: "siege-plan-router" },
                    },
                    onFlee: {
                      text: "你放弃旧渠封锁，先把伤兵与剩余粮车撤回中军。守军重新取得一条补给路。",
                      consequences: [
                        { kind: "arcVariant", arcId: "shendiao", key: "act7.siege-outcome", value: "stalled" },
                      ],
                      then: { type: "goto", nodeId: "siege-plan-router" },
                    },
                  },
                },
              ],
              else: {
                type: "battle",
                enemyIds: ["samarkand-defender", "western-pursuer", "western-pursuer"],
                allyIds: ["guojing", "tuolei"],
                objective: {
                  kind: "surviveRounds",
                  rounds: 3,
                  protectAllyIds: ["guojing", "tuolei"],
                  minProtectedSurvivors: 1,
                  title: "在未明旧渠中守住封锁线",
                },
                onWin: {
                  text: "未查明的旧渠多出一支守军，你们仍守满三轮。封锁线没有被冲开，粮车与伤兵却被迫后移。",
                  consequences: [
                    { kind: "arcVariant", arcId: "shendiao", key: "act7.siege-outcome", value: "costly" },
                  ],
                  then: { type: "goto", nodeId: "siege-plan-router" },
                },
                onPartial: {
                  text: "封锁线勉强守住，一名调停者和数名押粮军士负伤。守军没有议降，只暂时停止出城。",
                  consequences: [
                    { kind: "arcVariant", arcId: "shendiao", key: "act7.siege-outcome", value: "costly" },
                  ],
                  then: { type: "goto", nodeId: "siege-plan-router" },
                },
                onLose: {
                  text: "旧渠伏兵与正面守军同时冲出，封锁线被截成两段。粮车退回中军，攻城时日继续拖长。",
                  consequences: [
                    { kind: "arcVariant", arcId: "shendiao", key: "act7.siege-outcome", value: "stalled" },
                    { kind: "hp", delta: -35 },
                  ],
                  then: { type: "goto", nodeId: "siege-plan-router" },
                },
                onFlee: {
                  text: "你带后队撤离旧渠，保住剩余粮草。守军重新打开补给路，封锁方案已经无法继续。",
                  consequences: [
                    { kind: "arcVariant", arcId: "shendiao", key: "act7.siege-outcome", value: "stalled" },
                  ],
                  then: { type: "goto", nodeId: "siege-plan-router" },
                },
              },
            },
          },
          {
            id: "order-corridor",
            text: "先开平民走廊，再作有限攻势",
            description: "利用难民、药车或商队通道，让非战斗人员先离开交战区。",
            condition: {
              kind: "or",
              items: [
                { kind: "arcVariant", arcId: "shendiao", key: "act7.scout-method", eq: "civilian" },
                { kind: "arcVariant", arcId: "shendiao", key: "act7.scout-method", eq: "infiltration" },
                { kind: "arcVariant", arcId: "shendiao", key: "act7.prisoners", eq: "exchanged" },
                { kind: "arcVariant", arcId: "shendiao", key: "act7.prisoners", eq: "released" },
                { kind: "arcVariant", arcId: "shendiao", key: "act5.wumu-destination", eq: "beggar-network" },
              ],
            },
            consumeDay: true,
            consequences: [
              { kind: "arcVariant", arcId: "shendiao", key: "act7.siege-plan", value: "corridor" },
              { kind: "karma", delta: 3 },
            ],
            transition: {
              type: "branch",
              cases: [
                {
                  when: { kind: "arcVariant", arcId: "shendiao", key: "act7.intel", eq: "complete" },
                  then: {
                    type: "battle",
                    enemyIds: ["samarkand-defender", "western-pursuer"],
                    allyIds: ["samarkand-healer", "samarkand-guide"],
                    objective: {
                      kind: "surviveRounds",
                      rounds: 3,
                      protectAllyIds: ["samarkand-healer", "samarkand-guide"],
                      minProtectedSurvivors: 1,
                      title: "守住药车与平民走廊",
                    },
                    onWin: {
                      text: "药材车按核准时辰穿过南门，两名引路人都带着第一批百姓离开交战区。有限攻势随后压住侧门守军。",
                      consequences: [
                        { kind: "arcVariant", arcId: "shendiao", key: "act7.siege-outcome", value: "clean" },
                        { kind: "relation", npcId: "samarkand-healer", delta: 6 },
                      ],
                      then: { type: "goto", nodeId: "siege-plan-router" },
                    },
                    onPartial: {
                      text: "走廊守满三轮，一名引路人却在撤离中负伤。大部分药车与百姓通过南门，侧门攻势也因此推迟。",
                      consequences: [
                        { kind: "arcVariant", arcId: "shendiao", key: "act7.siege-outcome", value: "costly" },
                        { kind: "relation", npcId: "samarkand-guide", delta: 2 },
                      ],
                      then: { type: "goto", nodeId: "siege-plan-router" },
                    },
                    onLose: {
                      text: "守军与追骑夹住南门，药材车堵在通道中。你把两名引路人抢回外营，平民走廊未能建立。",
                      consequences: [
                        { kind: "arcVariant", arcId: "shendiao", key: "act7.siege-outcome", value: "stalled" },
                        { kind: "hp", delta: -30 },
                      ],
                      then: { type: "goto", nodeId: "siege-plan-router" },
                    },
                    onFlee: {
                      text: "你提前关闭走廊，避免更多百姓进入交战区。药车退回外营，有限攻势也随之取消。",
                      consequences: [
                        { kind: "arcVariant", arcId: "shendiao", key: "act7.siege-outcome", value: "stalled" },
                      ],
                      then: { type: "goto", nodeId: "siege-plan-router" },
                    },
                  },
                },
              ],
              else: {
                type: "battle",
                enemyIds: ["samarkand-defender", "samarkand-defender", "western-pursuer"],
                allyIds: ["samarkand-healer", "samarkand-guide"],
                objective: {
                  kind: "surviveRounds",
                  rounds: 3,
                  protectAllyIds: ["samarkand-healer", "samarkand-guide"],
                  minProtectedSurvivors: 1,
                  title: "在未明路线中守住平民走廊",
                },
                onWin: {
                  text: "旧路线多出一道守军关卡，你们仍把第一批百姓送出南门。两名引路人都回来，有限攻势却错过原定时辰。",
                  consequences: [
                    { kind: "arcVariant", arcId: "shendiao", key: "act7.siege-outcome", value: "costly" },
                    { kind: "relation", npcId: "samarkand-healer", delta: 3 },
                  ],
                  then: { type: "goto", nodeId: "siege-plan-router" },
                },
                onPartial: {
                  text: "走廊勉强撑过三轮，一名引路人负伤，仍有百姓被挡回城内。侧门攻势无法按时发动。",
                  consequences: [
                    { kind: "arcVariant", arcId: "shendiao", key: "act7.siege-outcome", value: "costly" },
                  ],
                  then: { type: "goto", nodeId: "siege-plan-router" },
                },
                onLose: {
                  text: "守军识破药车路线，追骑也从外侧封住退路。走廊关闭，城内外都有人被困在关卡之间。",
                  consequences: [
                    { kind: "arcVariant", arcId: "shendiao", key: "act7.siege-outcome", value: "stalled" },
                    { kind: "hp", delta: -35 },
                  ],
                  then: { type: "goto", nodeId: "siege-plan-router" },
                },
                onFlee: {
                  text: "你撤回外营，停止继续放人进入未知路线。南门仍在守军手里，有限攻势没有开始。",
                  consequences: [
                    { kind: "arcVariant", arcId: "shendiao", key: "act7.siege-outcome", value: "stalled" },
                  ],
                  then: { type: "goto", nodeId: "siege-plan-router" },
                },
              },
            },
          },
          {
            id: "order-assault",
            text: "集中兵力强攻城门",
            description: "不再等待更多情报，以最快速度撞开城门，也承担最高正面伤亡。",
            consumeDay: true,
            consequences: [
              { kind: "arcVariant", arcId: "shendiao", key: "act7.siege-plan", value: "assault" },
              { kind: "factionAttitude", factionId: "mongol", delta: 3 },
            ],
            transition: {
              type: "branch",
              cases: [
                {
                  when: { kind: "arcVariant", arcId: "shendiao", key: "act7.intel", eq: "complete" },
                  then: {
                    type: "battle",
                    enemyIds: ["samarkand-defender", "samarkand-defender", "samarkand-defender"],
                    allyIds: ["guojing", "tuolei"],
                    objective: {
                      kind: "defeatAll",
                      protectAllyIds: ["guojing", "tuolei"],
                      minProtectedSurvivors: 1,
                      title: "击破城门守军，保住主攻将领",
                    },
                    onWin: {
                      text: "你们按已知换防空隙撞开城门，三队守军被迫退入内街。郭靖与拖雷都站在门洞内，主攻队没有失去指挥。",
                      consequences: [
                        { kind: "arcVariant", arcId: "shendiao", key: "act7.siege-outcome", value: "clean" },
                        { kind: "factionAttitude", factionId: "mongol", delta: 6 },
                      ],
                      then: { type: "goto", nodeId: "siege-plan-router" },
                    },
                    onPartial: {
                      text: "城门被撞开，一名主攻将领却在门洞争夺中负伤。守军退入内街，后队立即接手伤员。",
                      consequences: [
                        { kind: "arcVariant", arcId: "shendiao", key: "act7.siege-outcome", value: "costly" },
                        { kind: "factionAttitude", factionId: "mongol", delta: 3 },
                      ],
                      then: { type: "goto", nodeId: "siege-plan-router" },
                    },
                    onLose: {
                      text: "撞车停在门洞前，守军从城楼与侧墙同时压下。主攻队退回壕沟，城门仍未打开。",
                      consequences: [
                        { kind: "arcVariant", arcId: "shendiao", key: "act7.siege-outcome", value: "stalled" },
                        { kind: "hp", delta: -45 },
                      ],
                      then: { type: "goto", nodeId: "siege-plan-router" },
                    },
                    onFlee: {
                      text: "你带主攻队退出门洞，保住剩余撞车与伤兵。城门仍在守军手中。",
                      consequences: [
                        { kind: "arcVariant", arcId: "shendiao", key: "act7.siege-outcome", value: "stalled" },
                      ],
                      then: { type: "goto", nodeId: "siege-plan-router" },
                    },
                  },
                },
              ],
              else: {
                type: "battle",
                enemyIds: ["samarkand-defender", "samarkand-defender", "samarkand-defender", "western-pursuer"],
                allyIds: ["guojing", "tuolei"],
                objective: {
                  kind: "defeatAll",
                  protectAllyIds: ["guojing", "tuolei"],
                  minProtectedSurvivors: 1,
                  title: "在未知伏兵下强攻城门",
                },
                onWin: {
                  text: "城门最终被撞开，未标出的追骑却从侧门切入。主攻队夺下门洞，也耗尽了原本留作预备的兵力。",
                  consequences: [
                    { kind: "arcVariant", arcId: "shendiao", key: "act7.siege-outcome", value: "costly" },
                    { kind: "factionAttitude", factionId: "mongol", delta: 4 },
                  ],
                  then: { type: "goto", nodeId: "siege-plan-router" },
                },
                onPartial: {
                  text: "城门被撞开，一名主攻将领与多名军士负伤。守军退入内街，预备队已经所剩无几。",
                  consequences: [
                    { kind: "arcVariant", arcId: "shendiao", key: "act7.siege-outcome", value: "costly" },
                  ],
                  then: { type: "goto", nodeId: "siege-plan-router" },
                },
                onLose: {
                  text: "伏兵从侧门切断撞车，主攻队被迫退回壕沟。城门没有打开，伤兵棚却已经满了。",
                  consequences: [
                    { kind: "arcVariant", arcId: "shendiao", key: "act7.siege-outcome", value: "stalled" },
                    { kind: "hp", delta: -50 },
                  ],
                  then: { type: "goto", nodeId: "siege-plan-router" },
                },
                onFlee: {
                  text: "你下令撤回撞车，避免主攻队被侧门伏兵合围。城门仍在，下一轮攻势必须另换办法。",
                  consequences: [
                    { kind: "arcVariant", arcId: "shendiao", key: "act7.siege-outcome", value: "stalled" },
                  ],
                  then: { type: "goto", nodeId: "siege-plan-router" },
                },
              },
            },
          },
        ],
      },
      "siege-plan-router": {
        id: "siege-plan-router",
        title: "军令回报",
        text: "传令官先记录采用的方案，再另册登记伤亡与未完成目标，两项不得合并成一句胜负。",
        autoNext: {
          type: "branch",
          cases: [
            {
              when: { kind: "arcVariant", arcId: "shendiao", key: "act7.siege-plan", eq: "feint" },
              then: { type: "goto", nodeId: "report-feint" },
            },
            {
              when: { kind: "arcVariant", arcId: "shendiao", key: "act7.siege-plan", eq: "blockade" },
              then: { type: "goto", nodeId: "report-blockade" },
            },
            {
              when: { kind: "arcVariant", arcId: "shendiao", key: "act7.siege-plan", eq: "corridor" },
              then: { type: "goto", nodeId: "report-corridor" },
            },
          ],
          else: { type: "goto", nodeId: "report-assault" },
        },
      },
      "report-feint": {
        id: "report-feint",
        title: "佯攻回报",
        text: "军报记录了守军换位、假旗暴露与前锋占下的壕沟。城门并非只靠撞车打开，错误旗号也会让整队军士付出代价。",
        autoNext: { type: "goto", nodeId: "siege-outcome-router" },
      },
      "report-blockade": {
        id: "report-blockade",
        title: "封锁回报",
        text: "军报记录了旧渠、粮车和三轮出城冲击。封锁少一次撞城，却把缺粮压力同时压到守军与城中百姓身上。",
        autoNext: { type: "goto", nodeId: "siege-outcome-router" },
      },
      "report-corridor": {
        id: "report-corridor",
        title: "走廊回报",
        text: "军报单列药车、引路人与通过南门的百姓人数。有限攻势因此推迟，平民通道也没有被写成普通军功。",
        autoNext: { type: "goto", nodeId: "siege-outcome-router" },
      },
      "report-assault": {
        id: "report-assault",
        title: "强攻回报",
        text: "军报记录撞车、门洞与主攻队伤亡。城门是否打开一目了然，付出的预备兵力也不能从战功簿上删去。",
        autoNext: { type: "goto", nodeId: "siege-outcome-router" },
      },
      "siege-outcome-router": {
        id: "siege-outcome-router",
        title: "城门结果",
        text: "攻城方案已经执行，军议接下来只看实际损失与尚未完成的部分。",
        autoNext: {
          type: "branch",
          cases: [
            {
              when: { kind: "arcVariant", arcId: "shendiao", key: "act7.siege-outcome", eq: "clean" },
              then: { type: "goto", nodeId: "siege-clean" },
            },
            {
              when: { kind: "arcVariant", arcId: "shendiao", key: "act7.siege-outcome", eq: "costly" },
              then: { type: "goto", nodeId: "siege-costly" },
            },
          ],
          else: { type: "goto", nodeId: "siege-stalled" },
        },
      },
      "siege-clean": {
        id: "siege-clean",
        title: "目标达成",
        text: "既定目标完成，保护组无人倒下。守军开始向内街收缩，中军命各部暂不得越过指定街口。",
        autoNext: { type: "goto", nodeId: "siege-close" },
      },
      "siege-costly": {
        id: "siege-costly",
        title: "带伤入城",
        text: "既定目标完成，伤兵与失散军士却多出一批。守军向内街退去，中军预备队已经不足以同时控制所有城门。",
        autoNext: { type: "goto", nodeId: "siege-close" },
      },
      "siege-stalled": {
        id: "siege-stalled",
        title: "攻势停住",
        text: "本轮目标未能完成。第二日其他部队从北侧打开缺口，城门仍告失守，但最先进入城内的已不是受你军令约束的人马。",
        autoNext: { type: "goto", nodeId: "siege-close" },
      },
      "siege-close": {
        id: "siege-close",
        title: "城门之后",
        text: "军旗越过城门，前锋开始分街推进。军报上的攻城结果已经落定，城内军纪却还没有答案。",
        onEnter: [
          { kind: "arcVariant", arcId: "shendiao", key: "act7.siege", value: "cleared" },
        ],
        autoNext: { type: "end" },
      },
    },
  },
  {
    id: "shendiao-samarkand-aftermath-act7",
    entryNode: "breach-entry",
    locationId: "samarkand",
    weight: 10,
    once: true,
    condition: {
      kind: "and",
      items: [
        { kind: "arcVariant", arcId: "shendiao", key: "act7.siege", eq: "cleared" },
        { kind: "not", item: { kind: "arcVariant", arcId: "shendiao", key: "act7.city", eq: "cleared" } },
        { kind: "not", item: { kind: "arcBeat", arcId: "shendiao", beat: "act7-western-campaign" } },
      ],
    },
    nodes: {
      "breach-entry": {
        id: "breach-entry",
        title: "破城之后",
        text: "城门内没有庆功场地，只有翻倒的粮车、找不到本队的军士、伤兵和挤向南街的百姓。第一批抢掠已经从外郭仓房开始。",
        autoNext: {
          type: "branch",
          cases: [
            {
              when: { kind: "arcVariant", arcId: "shendiao", key: "act7.siege-outcome", eq: "clean" },
              then: { type: "goto", nodeId: "breach-clean" },
            },
            {
              when: { kind: "arcVariant", arcId: "shendiao", key: "act7.siege-outcome", eq: "costly" },
              then: { type: "goto", nodeId: "breach-costly" },
            },
          ],
          else: { type: "goto", nodeId: "breach-stalled" },
        },
      },
      "breach-clean": {
        id: "breach-clean",
        title: "令旗仍能传到",
        text: "你的本部与保护组仍保持完整，城门到南街之间还能传递军令。郭靖先派人封住酒窖与仓房，等你决定如何处置第一批乱兵。",
        autoNext: { type: "goto", nodeId: "discipline-scene" },
      },
      "breach-costly": {
        id: "breach-costly",
        title: "伤兵先占满街口",
        text: "后队正在抬走攻城伤员，能执行军纪的完整小队只剩一半。乱兵借着换防涌进外郭，郭靖已经带人挡住通往民居的街口。",
        autoNext: { type: "goto", nodeId: "discipline-scene" },
      },
      "breach-stalled": {
        id: "breach-stalled",
        title: "别部先入城",
        text: "北侧缺口由别部先打开，进入外郭的军士不受你此前军令约束。术赤与察合台的人各占一条街，谁也不肯先放下战利品。",
        autoNext: { type: "goto", nodeId: "discipline-scene" },
      },
      "discipline-scene": {
        id: "discipline-scene",
        title: "第一道军纪",
        text: "两名乱兵正在撬开药材仓，另一队人拖走商户家属作向导。军法官尚未到场，眼前这条街会先按你的处置行事。",
        choices: [
          {
            id: "enforce-discipline",
            text: "当众缴械，按军令执纪",
            description: "先停下抢掠，再把涉事军士交给军法官，不替任何部队遮掩。",
            consumeDay: true,
            transition: {
              type: "battle",
              enemyIds: ["mongol-plunderer", "mongol-plunderer"],
              allyIds: ["guojing"],
              objective: {
                kind: "defeatAll",
                protectAllyId: "guojing",
                title: "缴械乱兵，守住街口",
              },
              onWin: {
                text: "乱兵被缴械，药材仓与商户家属都保住。军法官赶到时，郭靖把涉事军士与战利品一并交出。",
                consequences: [
                  { kind: "arcVariant", arcId: "shendiao", key: "act7.discipline", value: "enforced" },
                  { kind: "relation", npcId: "guojing", delta: 8 },
                  { kind: "factionAttitude", factionId: "mongol", delta: -5 },
                ],
                then: { type: "goto", nodeId: "discipline-router" },
              },
              onLose: {
                text: "乱兵冲散街口守卫，药材仓被砸开一半。郭靖带来第二队军士才重新封住路口，军纪只能保住当前街区。",
                consequences: [
                  { kind: "arcVariant", arcId: "shendiao", key: "act7.discipline", value: "limited" },
                  { kind: "hp", delta: -25 },
                ],
                then: { type: "goto", nodeId: "discipline-router" },
              },
              onFlee: {
                text: "你退出街口后，乱兵拖走仓中财物。郭靖保住商户家属，涉事军士却已经混入其他部队。",
                consequences: [
                  { kind: "arcVariant", arcId: "shendiao", key: "act7.discipline", value: "permissive" },
                  { kind: "relation", npcId: "guojing", delta: -6 },
                ],
                then: { type: "goto", nodeId: "discipline-router" },
              },
            },
          },
          {
            id: "hold-one-quarter",
            text: "只封住药仓与当前街区",
            description: "保住眼前百姓与伤药，不在兵力不足时同时对抗所有入城部队。",
            consumeDay: true,
            consequences: [
              { kind: "arcVariant", arcId: "shendiao", key: "act7.discipline", value: "limited" },
              { kind: "relation", npcId: "samarkand-healer", delta: 5 },
              { kind: "factionAttitude", factionId: "mongol", delta: -2 },
            ],
            resultText: "你封住药仓、伤兵棚与相邻两条巷口，其他街区仍有抢掠发生。军法官把这片区域记为中军直辖。",
            transition: { type: "goto", nodeId: "discipline-router" },
          },
          {
            id: "allow-plunder",
            text: "默许各部自行取偿",
            description: "保住军功与军心，不阻止破城后的抢掠和报复。",
            consumeDay: true,
            consequences: [
              { kind: "arcVariant", arcId: "shendiao", key: "act7.discipline", value: "permissive" },
              { kind: "karma", delta: -12 },
              { kind: "factionAttitude", factionId: "mongol", delta: 10 },
              { kind: "relation", npcId: "guojing", delta: -15 },
            ],
            resultText: "你让开街口，各部军士自行进入仓房与民居。郭靖带本部退到伤兵棚，只护住仍在他军令范围内的人。",
            transition: { type: "goto", nodeId: "discipline-router" },
          },
          {
            id: "quietly-secure-route",
            text: "不争军法，先暗中清出退路",
            description: "表面不与各部冲突，把能调动的人手全部用于疏散百姓。",
            condition: {
              kind: "or",
              items: [
                { kind: "arcVariant", arcId: "shendiao", key: "act7.role", eq: "independent" },
                { kind: "arcVariant", arcId: "shendiao", key: "act7.scout-method", eq: "civilian" },
                { kind: "arcVariant", arcId: "shendiao", key: "act7.scout-method", eq: "infiltration" },
                { kind: "arcVariant", arcId: "shendiao", key: "act7.prisoners", eq: "released" },
              ],
            },
            consumeDay: true,
            consequences: [
              { kind: "arcVariant", arcId: "shendiao", key: "act7.discipline", value: "limited" },
              { kind: "karma", delta: 4 },
              { kind: "factionAttitude", factionId: "mongol", delta: -4 },
            ],
            resultText: "你没有在街口立军法旗，只让商道向导带人清出南门旧路。乱兵仍在别处抢掠，这一片百姓却先得到撤离时辰。",
            transition: { type: "goto", nodeId: "discipline-router" },
          },
        ],
      },
      "discipline-router": {
        id: "discipline-router",
        title: "军纪回报",
        text: "街口处置已经传到各部。军士是否继续听令，也决定接下来的撤离通道能有多少人手。",
        autoNext: {
          type: "branch",
          cases: [
            {
              when: { kind: "arcVariant", arcId: "shendiao", key: "act7.discipline", eq: "enforced" },
              then: { type: "goto", nodeId: "discipline-enforced" },
            },
            {
              when: { kind: "arcVariant", arcId: "shendiao", key: "act7.discipline", eq: "limited" },
              then: { type: "goto", nodeId: "discipline-limited" },
            },
          ],
          else: { type: "goto", nodeId: "discipline-permissive" },
        },
      },
      "discipline-enforced": {
        id: "discipline-enforced",
        title: "军法旗立起",
        text: "中军直辖街口停止抢掠，其他部队也开始把涉事军士送来。你能抽出完整小队护送百姓，但诸王军中已经有人要求追究越权。",
        autoNext: { type: "goto", nodeId: "evacuation-choice" },
      },
      "discipline-limited": {
        id: "discipline-limited",
        title: "只保一片街区",
        text: "药仓、伤兵棚和相邻街区暂时安全，其他方向仍有乱兵。撤离队伍必须走固定路线，无法同时接应全城。",
        autoNext: { type: "goto", nodeId: "evacuation-choice" },
      },
      "discipline-permissive": {
        id: "discipline-permissive",
        title: "各部自行取偿",
        text: "抢掠继续向内街扩散，百姓开始自行冲向城门。你仍可组织一条撤离路，但必须同时避开守军残部与蒙古乱兵。",
        autoNext: { type: "goto", nodeId: "evacuation-choice" },
      },
      "evacuation-choice": {
        id: "evacuation-choice",
        title: "平民撤离",
        text: "城外医者已把能行走的伤者集中到南街，商道向导则找到旧渠出口。出口只能守一次，身后还有没来得及集合的人。",
        choices: [
          {
            id: "open-evacuation-corridor",
            text: "守住旧渠出口三轮",
            description: "让医者与向导带队撤离，你在出口挡住追骑与乱兵。",
            consumeDay: true,
            transition: {
              type: "branch",
              cases: [
                {
                  when: {
                    kind: "and",
                    items: [
                      { kind: "arcVariant", arcId: "shendiao", key: "act7.intel", eq: "complete" },
                      {
                        kind: "or",
                        items: [
                          { kind: "arcVariant", arcId: "shendiao", key: "act7.scout-method", eq: "civilian" },
                          { kind: "arcVariant", arcId: "shendiao", key: "act7.scout-method", eq: "infiltration" },
                          { kind: "arcVariant", arcId: "shendiao", key: "act7.prisoners", eq: "released" },
                          { kind: "arcVariant", arcId: "shendiao", key: "act7.prisoners", eq: "exchanged" },
                        ],
                      },
                    ],
                  },
                  then: {
                    type: "battle",
                    enemyIds: ["western-pursuer", "mongol-plunderer"],
                    allyIds: ["samarkand-healer", "samarkand-guide"],
                    objective: {
                      kind: "surviveRounds",
                      rounds: 3,
                      protectAllyIds: ["samarkand-healer", "samarkand-guide"],
                      minProtectedSurvivors: 1,
                      title: "守住已核实的旧渠出口",
                    },
                    onWin: {
                      text: "旧渠出口守满三轮，医者与向导都带队通过。最后一批伤者离开后，你才封住入口。",
                      consequences: [
                        { kind: "arcVariant", arcId: "shendiao", key: "act7.evacuation", value: "full" },
                        { kind: "karma", delta: 10 },
                        { kind: "relation", npcId: "samarkand-healer", delta: 8 },
                      ],
                      then: { type: "goto", nodeId: "evacuation-router" },
                    },
                    onPartial: {
                      text: "旧渠出口守满三轮，一名引路人却在断后时负伤。大部分伤者与百姓离城，仍有人被困在南街。",
                      consequences: [
                        { kind: "arcVariant", arcId: "shendiao", key: "act7.evacuation", value: "partial" },
                        { kind: "karma", delta: 5 },
                      ],
                      then: { type: "goto", nodeId: "evacuation-router" },
                    },
                    onLose: {
                      text: "追骑与乱兵冲进旧渠出口，撤离队伍被迫分散。医者和向导被带回外营，仍有大批百姓困在城内。",
                      consequences: [
                        { kind: "arcVariant", arcId: "shendiao", key: "act7.evacuation", value: "failed" },
                        { kind: "hp", delta: -35 },
                      ],
                      then: { type: "goto", nodeId: "evacuation-router" },
                    },
                    onFlee: {
                      text: "你提前撤出旧渠，带走已经通过的人。出口随即被追骑封住，余下百姓无法继续撤离。",
                      consequences: [
                        { kind: "arcVariant", arcId: "shendiao", key: "act7.evacuation", value: "failed" },
                      ],
                      then: { type: "goto", nodeId: "evacuation-router" },
                    },
                  },
                },
              ],
              else: {
                type: "battle",
                enemyIds: ["western-pursuer", "western-pursuer", "mongol-plunderer"],
                allyIds: ["samarkand-healer", "samarkand-guide"],
                objective: {
                  kind: "surviveRounds",
                  rounds: 3,
                  protectAllyIds: ["samarkand-healer", "samarkand-guide"],
                  minProtectedSurvivors: 1,
                  title: "在未明追路中守住旧渠出口",
                },
                onWin: {
                  text: "未查清的追路多出一队骑兵，你们仍守满三轮。两名引路人都离开城内，南街还有一批百姓没赶上。",
                  consequences: [
                    { kind: "arcVariant", arcId: "shendiao", key: "act7.evacuation", value: "partial" },
                    { kind: "karma", delta: 6 },
                  ],
                  then: { type: "goto", nodeId: "evacuation-router" },
                },
                onPartial: {
                  text: "旧渠出口勉强守住，一名引路人负伤，撤离队伍也在追击中失散。只有一部分人到达外营。",
                  consequences: [
                    { kind: "arcVariant", arcId: "shendiao", key: "act7.evacuation", value: "partial" },
                    { kind: "karma", delta: 3 },
                  ],
                  then: { type: "goto", nodeId: "evacuation-router" },
                },
                onLose: {
                  text: "追骑从未标出的岔路切入，旧渠出口失守。你抢回两名引路人，撤离队伍却无法继续前进。",
                  consequences: [
                    { kind: "arcVariant", arcId: "shendiao", key: "act7.evacuation", value: "failed" },
                    { kind: "hp", delta: -40 },
                  ],
                  then: { type: "goto", nodeId: "evacuation-router" },
                },
                onFlee: {
                  text: "你带已经出城的人撤离旧渠，追骑随即封住入口。剩余百姓只能退回南街。",
                  consequences: [
                    { kind: "arcVariant", arcId: "shendiao", key: "act7.evacuation", value: "failed" },
                  ],
                  then: { type: "goto", nodeId: "evacuation-router" },
                },
              },
            },
          },
          {
            id: "escort-wounded-first",
            text: "只送伤者与老弱先走",
            description: "不冒险维持完整走廊，先用有限人手带走最难自行撤离的人。",
            consumeDay: true,
            consequences: [
              { kind: "arcVariant", arcId: "shendiao", key: "act7.evacuation", value: "partial" },
              { kind: "karma", delta: 5 },
              { kind: "relation", npcId: "samarkand-healer", delta: 5 },
            ],
            resultText: "医者带伤员从旧渠离城，向导留下标记后返回南街。老弱先到外营，其他人仍要等待下一次开门。",
            transition: { type: "goto", nodeId: "evacuation-router" },
          },
          {
            id: "leave-gates-to-army",
            text: "把城门交回各部军队",
            description: "不再分兵护送平民，集中人手维持占领与追击。",
            consumeDay: true,
            consequences: [
              { kind: "arcVariant", arcId: "shendiao", key: "act7.evacuation", value: "failed" },
              { kind: "karma", delta: -8 },
              { kind: "factionAttitude", factionId: "mongol", delta: 5 },
            ],
            resultText: "南街与旧渠都交给各部军队封锁。城内百姓无法再自行出城，外营也停止接收没有军令的伤者。",
            transition: { type: "goto", nodeId: "evacuation-router" },
          },
        ],
      },
      "evacuation-router": {
        id: "evacuation-router",
        title: "撤离结果",
        text: "旧渠与南街的名单重新核过一遍。实际出城人数已经无法再靠军报措辞改变。",
        autoNext: {
          type: "branch",
          cases: [
            {
              when: { kind: "arcVariant", arcId: "shendiao", key: "act7.evacuation", eq: "full" },
              then: { type: "goto", nodeId: "evacuation-full" },
            },
            {
              when: { kind: "arcVariant", arcId: "shendiao", key: "act7.evacuation", eq: "partial" },
              then: { type: "goto", nodeId: "evacuation-partial" },
            },
          ],
          else: { type: "goto", nodeId: "evacuation-failed" },
        },
      },
      "evacuation-full": {
        id: "evacuation-full",
        title: "走廊已经清空",
        text: "旧渠内不再有人停留，医者与向导都在外营清点名单。中军此时送来一封新令，要求各部停止接收城内降民。",
        autoNext: { type: "goto", nodeId: "slaughter-order" },
      },
      "evacuation-partial": {
        id: "evacuation-partial",
        title: "仍有人留在城内",
        text: "外营接到一部分伤者与百姓，南街和内城仍有人没能赶到出口。中军此时送来一封新令，要求各部停止接收城内降民。",
        autoNext: { type: "goto", nodeId: "slaughter-order" },
      },
      "evacuation-failed": {
        id: "evacuation-failed",
        title: "城门已经封死",
        text: "旧渠与南街都被军队控制，城内百姓无法再离开。中军此时送来一封新令，要求各部停止接收降民并清理内城。",
        autoNext: { type: "goto", nodeId: "slaughter-order" },
      },
      "slaughter-order": {
        id: "slaughter-order",
        title: "屠城军令",
        text: "令箭上的字很短：未按时出城者一律视为敌军，内城不留降民。郭靖看完，把令箭放回案上。郭靖：\"城门已破，这不是攻城。\"",
        choices: [
          {
            id: "obey-order",
            text: "服从军令，保住军职",
            description: "继续按中军命令清理内城，不再区分守军、降民与未及撤离者。",
            consumeDay: true,
            consequences: [
              { kind: "arcVariant", arcId: "shendiao", key: "act7.order", value: "obeyed" },
              { kind: "karma", delta: -20 },
              { kind: "factionAttitude", factionId: "mongol", delta: 15 },
              { kind: "relation", npcId: "guojing", delta: -20 },
              { kind: "npcTag", npcId: "temujin", tag: "玩家执行撒马尔罕屠城令" },
            ],
            resultText: "你接下令箭，各部继续向内城推进。郭靖撤回自己的令旗，只留下人手守住已经登记的伤兵棚。",
            transition: { type: "goto", nodeId: "order-router" },
          },
          {
            id: "delay-order",
            text: "再发一次招降，承担延误责任",
            description: "用清点俘虏与伤兵为由拖延军令，为内城争取最后一次开门。",
            consumeDay: true,
            consequences: [
              { kind: "arcVariant", arcId: "shendiao", key: "act7.order", value: "delayed" },
              { kind: "karma", delta: 5 },
              { kind: "factionAttitude", factionId: "mongol", delta: -8 },
              { kind: "relation", npcId: "guojing", delta: 5 },
              { kind: "npcTag", npcId: "temujin", tag: "玩家以招降拖延军令" },
            ],
            resultText: "你在回令上写明俘虏与伤兵尚未核清，再派译者向内城送出最后一次招降。中军给出的期限只有半日。",
            transition: { type: "goto", nodeId: "order-router" },
          },
          {
            id: "defy-with-guojing",
            text: "与郭靖公开抗命",
            description: "收起本部令旗，拒绝让军士继续向平民与降民动手。",
            consumeDay: true,
            consequences: [
              { kind: "arcVariant", arcId: "shendiao", key: "act7.order", value: "defied" },
              { kind: "karma", delta: 12 },
              { kind: "factionAttitude", factionId: "mongol", delta: -20 },
              { kind: "relation", npcId: "guojing", delta: 12 },
              { kind: "npcTag", npcId: "temujin", tag: "玩家在撒马尔罕公开抗命" },
            ],
            resultText: "你与郭靖同时收下本部令旗，军士停在内城街口。中军立即派人接管城门，并要求你们回营候审。",
            transition: { type: "goto", nodeId: "order-router" },
          },
          {
            id: "warn-inner-city",
            text: "偷送军令，放内城百姓先走",
            description: "把屠城令与最后时限送进内城，在中军反应前打开另一条生路。",
            condition: {
              kind: "or",
              items: [
                { kind: "arcVariant", arcId: "shendiao", key: "act7.role", eq: "independent" },
                { kind: "arcVariant", arcId: "shendiao", key: "act7.scout-method", eq: "infiltration" },
                { kind: "arcVariant", arcId: "shendiao", key: "act7.prisoners", eq: "released" },
                { kind: "arcVariant", arcId: "shendiao", key: "act7.evacuation", eq: "full" },
              ],
            },
            consumeDay: true,
            consequences: [
              { kind: "arcVariant", arcId: "shendiao", key: "act7.order", value: "betrayed" },
              { kind: "karma", delta: 15 },
              { kind: "factionAttitude", factionId: "mongol", delta: -30 },
              { kind: "relation", npcId: "guojing", delta: 7 },
              { kind: "npcTag", npcId: "temujin", tag: "玩家向撒马尔罕内城泄露军令" },
            ],
            resultText: "商道向导把军令与时限送进内城，另一处小门很快出现人流。蒙古巡骑也在同一刻发现有人泄露中军令箭。",
            transition: { type: "goto", nodeId: "order-router" },
          },
        ],
      },
      "order-router": {
        id: "order-router",
        title: "军令已回",
        text: "中军收到了你的答复。撒马尔罕的处置已经写入军册，草原大营也将在下一道命令到达前决定如何看待你。",
        autoNext: {
          type: "branch",
          cases: [
            {
              when: { kind: "arcVariant", arcId: "shendiao", key: "act7.order", eq: "obeyed" },
              then: { type: "goto", nodeId: "order-obeyed" },
            },
            {
              when: { kind: "arcVariant", arcId: "shendiao", key: "act7.order", eq: "delayed" },
              then: { type: "goto", nodeId: "order-delayed" },
            },
            {
              when: { kind: "arcVariant", arcId: "shendiao", key: "act7.order", eq: "defied" },
              then: { type: "goto", nodeId: "order-defied" },
            },
          ],
          else: { type: "goto", nodeId: "order-betrayed" },
        },
      },
      "order-obeyed": {
        id: "order-obeyed",
        title: "军职仍在",
        text: "中军保留你的军职与令牌，郭靖却不再与你共用一面军旗。未撤离者的名单被封入另一册，不列入战功。",
        autoNext: { type: "goto", nodeId: "city-close" },
      },
      "order-delayed": {
        id: "order-delayed",
        title: "半日招降",
        text: "中军给出的半日已经开始计时。部分内城百姓赶到城门，你也被记下一项延误军令的罪责。",
        autoNext: { type: "goto", nodeId: "city-close" },
      },
      "order-defied": {
        id: "order-defied",
        title: "收旗候审",
        text: "你与郭靖的本部被解除攻城职责，军士暂留伤兵棚。中军骑兵已经在回草原的路口等候。",
        autoNext: { type: "goto", nodeId: "city-close" },
      },
      "order-betrayed": {
        id: "order-betrayed",
        title: "军令已经外泄",
        text: "内城小门仍有人向外撤离，蒙古巡骑则开始搜查送信者。你在军册上的身份已经从随军者改为待缉。",
        autoNext: { type: "goto", nodeId: "city-close" },
      },
      "city-close": {
        id: "city-close",
        title: "回草原受令",
        text: "撒马尔罕的攻城、军纪与撤离结果都已封入军报。下一封命令将在蒙古大漠宣读。",
        onEnter: [
          { kind: "arcVariant", arcId: "shendiao", key: "act7.city", value: "cleared" },
        ],
        autoNext: { type: "end" },
      },
    },
  },
  {
    id: "shendiao-damos-home-order-act7",
    entryNode: "return-camp",
    locationId: "damos",
    weight: 10,
    once: true,
    condition: {
      kind: "and",
      items: [
        { kind: "arcVariant", arcId: "shendiao", key: "act7.city", eq: "cleared" },
        { kind: "not", item: { kind: "arcVariant", arcId: "shendiao", key: "act7.home-order", eq: "cleared" } },
        { kind: "not", item: { kind: "arcBeat", arcId: "shendiao", beat: "act7-western-campaign" } },
      ],
    },
    nodes: {
      "return-camp": {
        id: "return-camp",
        title: "回草原受令",
        text: "西征军旗已经回到蒙古大漠，撒马尔罕军报则比你早到一日。旧营外多了三道巡骑，往日可以直入的毡帐如今都要验令。",
        autoNext: {
          type: "branch",
          cases: [
            {
              when: { kind: "arcVariant", arcId: "shendiao", key: "act7.order", eq: "obeyed" },
              then: { type: "goto", nodeId: "return-under-banner" },
            },
            {
              when: { kind: "arcVariant", arcId: "shendiao", key: "act7.order", eq: "delayed" },
              then: { type: "goto", nodeId: "return-under-summons" },
            },
            {
              when: { kind: "arcVariant", arcId: "shendiao", key: "act7.order", eq: "defied" },
              then: { type: "goto", nodeId: "return-under-guard" },
            },
          ],
          else: { type: "goto", nodeId: "return-under-pursuit" },
        },
      },
      "return-under-banner": {
        id: "return-under-banner",
        title: "军职仍在",
        text: "你的令旗仍挂在中军一侧，军士按原职接马。郭靖的营位却已经撤下，他只带少数旧部住在李萍帐外。",
        autoNext: { type: "goto", nodeId: "south-order" },
      },
      "return-under-summons": {
        id: "return-under-summons",
        title: "延误军令",
        text: "中军没有收走你的路引，却将军职木牌暂扣。拖雷派人传话：南向大帐正在议新军令，撒马尔罕延误之罪会在那里一并处置。",
        autoNext: { type: "goto", nodeId: "south-order" },
      },
      "return-under-guard": {
        id: "return-under-guard",
        title: "收旗候审",
        text: "你与郭靖被安排在旧牧场外等候，周围都是中军巡骑。哲别没有靠近，只把两匹备好水囊的马拴在栅栏另一侧。",
        autoNext: { type: "goto", nodeId: "south-order" },
      },
      "return-under-pursuit": {
        id: "return-under-pursuit",
        title: "旧营之外",
        text: "中军已经把你列为待缉之人，你只能从旧水眼绕到李萍帐后。营内巡骑正按撒马尔罕泄令记录逐个核对商队与斥候。",
        autoNext: { type: "goto", nodeId: "south-order" },
      },
      "south-order": {
        id: "south-order",
        title: "兵锋转南",
        text: "成吉思汗的新令要求郭靖领兵南下，先取金境，再视宋境为敌。郭靖把令箭放回案上。郭靖：\"攻金旧仇，我可以打。要我带兵进宋境，我不领。\"",
        autoNext: { type: "goto", nodeId: "huazheng-choice" },
      },
      "huazheng-choice": {
        id: "huazheng-choice",
        title: "把话对华筝说清",
        text: "华筝守在帐外，手里拿着南门巡骑表。她没有先问婚约，也没有替父亲传话。华筝：\"你要离开、留下，还是让我帮忙，今日当面说。\"",
        choices: [
          {
            id: "tell-huazheng-truth",
            text: "如实说明撒马尔罕与南征军令",
            description: "不删去自己服从、拖延、抗命或泄令的部分，让她据此决定。",
            consumeDay: true,
            consequences: [
              { kind: "relation", npcId: "huazheng", delta: 3 },
            ],
            resultText: "你把屠城令、撤离名单与南征军令逐项说明，没有要求华筝先答应任何事。",
            transition: {
              type: "branch",
              cases: [
                {
                  when: {
                    kind: "and",
                    items: [
                      { kind: "arcVariant", arcId: "shendiao", key: "act7.order", eq: "defied" },
                      { kind: "relation", npcId: "huazheng", gte: 10 },
                    ],
                  },
                  then: { type: "goto", nodeId: "huazheng-helps" },
                },
                {
                  when: {
                    kind: "and",
                    items: [
                      { kind: "arcVariant", arcId: "shendiao", key: "act7.order", eq: "betrayed" },
                      { kind: "arcVariant", arcId: "shendiao", key: "act7.evacuation", eq: "full" },
                      { kind: "relation", npcId: "huazheng", gte: 20 },
                    ],
                  },
                  then: { type: "goto", nodeId: "huazheng-helps" },
                },
                {
                  when: { kind: "arcVariant", arcId: "shendiao", key: "act7.order", eq: "obeyed" },
                  then: { type: "goto", nodeId: "huazheng-breaks" },
                },
              ],
              else: { type: "goto", nodeId: "huazheng-stays" },
            },
          },
          {
            id: "ask-huazheng-help",
            text: "请她提供离营路线",
            description: "直说谁需要离开、为何被追，不拿旧情逼她替所有人担责。",
            consumeDay: true,
            resultText: "你把需要离营的人数与追骑位置交给华筝，请她自己决定是否帮忙。",
            transition: {
              type: "branch",
              cases: [
                {
                  when: {
                    kind: "and",
                    items: [
                      { kind: "relation", npcId: "huazheng", gte: 15 },
                      { kind: "not", item: { kind: "arcVariant", arcId: "shendiao", key: "act7.order", eq: "obeyed" } },
                    ],
                  },
                  then: { type: "goto", nodeId: "huazheng-helps" },
                },
                {
                  when: {
                    kind: "and",
                    items: [
                      { kind: "arcVariant", arcId: "shendiao", key: "act7.order", eq: "betrayed" },
                      { kind: "relation", npcId: "huazheng", lte: 14 },
                    ],
                  },
                  then: { type: "goto", nodeId: "huazheng-pursues" },
                },
                {
                  when: { kind: "arcVariant", arcId: "shendiao", key: "act7.order", eq: "obeyed" },
                  then: { type: "goto", nodeId: "huazheng-breaks" },
                },
              ],
              else: { type: "goto", nodeId: "huazheng-stays" },
            },
          },
          {
            id: "leave-huazheng-out",
            text: "不让她卷入离营计划",
            description: "不索要巡骑表或令牌，由她留在父兄一边作自己的选择。",
            consumeDay: true,
            consequences: [
              { kind: "relation", npcId: "huazheng", delta: 2 },
            ],
            resultText: "你没有索要巡骑表，只说明自己会另找离营路线。华筝收起令牌，没有向中军报出你来过。",
            transition: { type: "goto", nodeId: "huazheng-stays" },
          },
          {
            id: "deceive-huazheng",
            text: "隐瞒泄令与撤离去向",
            description: "只说自己奉命回营，试图从她手里套出巡骑换防。",
            consumeDay: true,
            consequences: [
              { kind: "karma", delta: -6 },
              { kind: "relation", npcId: "huazheng", delta: -15 },
            ],
            resultText: "你避开撒马尔罕泄令与撤离名单，只追问巡骑换防。华筝把你给出的时辰与中军记录对过一遍。",
            transition: { type: "goto", nodeId: "huazheng-pursues" },
          },
        ],
      },
      "huazheng-helps": {
        id: "huazheng-helps",
        title: "西牧场旧路",
        text: "华筝把西牧场巡骑表压在水囊下。华筝：\"这条路只空一刻钟。我送到旧水眼便回营，不随你们南下，也不替你们向父汗说谎。\"",
        onEnter: [
          { kind: "arcVariant", arcId: "shendiao", key: "act7.huazheng", value: "helped-escape" },
          { kind: "relation", npcId: "huazheng", delta: 8 },
        ],
        autoNext: { type: "goto", nodeId: "liping-tent" },
      },
      "huazheng-breaks": {
        id: "huazheng-breaks",
        title: "旧信退回",
        text: "华筝把旧日短笺与一枚营门木牌放回案上。华筝：\"你在撒马尔罕领过什么令，军报写得清楚。旧情不能替那些人抹掉。往后各走各路。\"",
        onEnter: [
          { kind: "arcVariant", arcId: "shendiao", key: "act7.huazheng", value: "broke-ties" },
          { kind: "relation", npcId: "huazheng", delta: -20 },
        ],
        autoNext: { type: "goto", nodeId: "liping-tent" },
      },
      "huazheng-stays": {
        id: "huazheng-stays",
        title: "留在草原",
        text: "华筝没有交出巡骑表，也没有向中军报信。华筝：\"我不随你们走。父汗和拖雷都在这里，我会留在草原把自己的话说完。\"",
        onEnter: [
          { kind: "arcVariant", arcId: "shendiao", key: "act7.huazheng", value: "stayed-loyal" },
        ],
        autoNext: { type: "goto", nodeId: "liping-tent" },
      },
      "huazheng-pursues": {
        id: "huazheng-pursues",
        title: "亲自验路",
        text: "华筝收走巡骑表，命人封住西牧场与旧水眼。华筝：\"你既不肯把实话给我，我便按军令办。再见面时，先验你的路引。\"",
        onEnter: [
          { kind: "arcVariant", arcId: "shendiao", key: "act7.huazheng", value: "led-pursuit" },
          { kind: "relation", npcId: "huazheng", delta: -10 },
        ],
        autoNext: { type: "goto", nodeId: "liping-tent" },
      },
      "liping-tent": {
        id: "liping-tent",
        title: "母子问答",
        text: "李萍把南征令放在矮桌上，只问郭靖一句。李萍：\"你若领兵进宋境，可对得起你爹留下的姓氏？\"郭靖跪在桌前。郭靖：\"孩儿不领这道令。\"",
        choices: [
          {
            id: "offer-prepared-route",
            text: "把安全退路与接应名册交给李萍",
            description: "郭靖已经公开抗命，再由李萍确认这条退路是否值得走。",
            condition: {
              kind: "and",
              items: [
                { kind: "arcVariant", arcId: "shendiao", key: "act7.evacuation", eq: "full" },
                { kind: "arcVariant", arcId: "shendiao", key: "act7.order", eq: "defied" },
                {
                  kind: "or",
                  items: [
                    { kind: "arcVariant", arcId: "shendiao", key: "act5.wumu-destination", eq: "beggar-network" },
                    { kind: "arcVariant", arcId: "shendiao", key: "act5.wumu-destination", eq: "song-command" },
                    { kind: "arcVariant", arcId: "shendiao", key: "act7.huazheng", eq: "helped-escape" },
                  ],
                },
                {
                  kind: "or",
                  items: [
                    { kind: "flag", name: "shendiao.niujia.saved_liping", eq: true },
                    {
                      kind: "and",
                      items: [
                        { kind: "flag", name: "shendiao.damos.growth", eq: "survival" },
                        { kind: "relation", npcId: "liping", gte: 10 },
                      ],
                    },
                  ],
                },
              ],
            },
            consumeDay: true,
            resultText: "你把旧渠撤离名单、南下接应与西牧场时辰全部摊开，没有替李萍收拾行装。",
            transition: { type: "goto", nodeId: "liping-survives" },
          },
          {
            id: "guard-rear-exit",
            text: "守住帐外，让母子先走后门",
            description: "追骑已经接近，先替郭靖与李萍争取离营时间。",
            condition: {
              kind: "or",
              items: [
                { kind: "arcVariant", arcId: "shendiao", key: "act7.order", eq: "defied" },
                { kind: "arcVariant", arcId: "shendiao", key: "act7.order", eq: "betrayed" },
                { kind: "arcVariant", arcId: "shendiao", key: "act7.huazheng", eq: "led-pursuit" },
              ],
            },
            consumeDay: true,
            resultText: "你守到后门马车离开，郭靖却在旧水眼发现母亲没有上车。李萍把自己的路引放在车座上，独自留在帐中。",
            transition: { type: "goto", nodeId: "liping-covers-retreat" },
          },
          {
            id: "let-liping-answer",
            text: "摊开军令，不替郭靖作答",
            description: "让李萍亲耳确认郭靖是否拒绝南征，不用空话遮住军令。",
            consumeDay: true,
            resultText: "郭靖在军令背面写下“不伐宋境”，交到母亲手中。李萍逐字看完，又让他当面念了一遍。",
            transition: { type: "goto", nodeId: "liping-testimony" },
          },
        ],
      },
      "liping-survives": {
        id: "liping-survives",
        title: "她自己收起路引",
        text: "李萍确认郭靖已经拒绝南征，才把军令与接应名册一同收好。李萍：\"既然你已经选定，我活着跟你走，不必再用一条命逼你。\"她自己系好行囊，走向后门马车。",
        onEnter: [
          { kind: "arcVariant", arcId: "shendiao", key: "act7.liping", value: "survived-prepared" },
          { kind: "npcAlive", npcId: "liping", alive: true },
          { kind: "npcTag", npcId: "liping", tag: "确认郭靖抗命后走准备路线离营" },
          { kind: "relation", npcId: "liping", delta: 10 },
        ],
        autoNext: { type: "goto", nodeId: "home-order-close" },
      },
      "liping-covers-retreat": {
        id: "liping-covers-retreat",
        title: "路引留在车上",
        text: "李萍让郭靖先带伤者离营，自己留下拖住搜营军士。追骑进入帐中时，她拒绝交代郭靖去向，也没有让自己成为逼儿子回头的人质。郭靖折返时，她已经死在帐内。",
        onEnter: [
          { kind: "arcVariant", arcId: "shendiao", key: "act7.liping", value: "died-covering-retreat" },
          { kind: "npcAlive", npcId: "liping", alive: false },
          { kind: "npcTag", npcId: "liping", tag: "留帐断后拒绝成为人质" },
          { kind: "npcTag", npcId: "guojing", tag: "母亲为离营断后而死" },
        ],
        autoNext: { type: "goto", nodeId: "home-order-close" },
      },
      "liping-testimony": {
        id: "liping-testimony",
        title: "不做负国之人",
        text: "李萍让郭靖保管写有拒令的话，又要他当面立誓不领兵侵宋。郭靖离帐交还令箭后，李萍在帐中自尽。她留下的只有路引、军令与一句不许回头。",
        onEnter: [
          { kind: "arcVariant", arcId: "shendiao", key: "act7.liping", value: "died-testimony" },
          { kind: "npcAlive", npcId: "liping", alive: false },
          { kind: "npcTag", npcId: "liping", tag: "以死阻止郭靖屈服南征军令" },
          { kind: "npcTag", npcId: "guojing", tag: "母亲以死明志" },
        ],
        autoNext: { type: "goto", nodeId: "home-order-close" },
      },
      "home-order-close": {
        id: "home-order-close",
        title: "离营前夜",
        text: "南征军令、华筝的决定与李萍的结局都已落定。营门外仍有不同方向的马匹和路引，最后一条路要在天亮前确认。",
        onEnter: [
          { kind: "arcVariant", arcId: "shendiao", key: "act7.home-order", value: "cleared" },
        ],
        autoNext: { type: "end" },
      },
    },
  },
  {
    id: "shendiao-damos-departure-act7",
    entryNode: "departure-entry",
    locationId: "damos",
    weight: 11,
    once: true,
    condition: {
      kind: "and",
      items: [
        { kind: "arcVariant", arcId: "shendiao", key: "act7.home-order", eq: "cleared" },
        { kind: "not", item: { kind: "arcBeat", arcId: "shendiao", beat: "act7-western-campaign" } },
      ],
    },
    nodes: {
      "departure-entry": {
        id: "departure-entry",
        title: "离营之前",
        text: "天亮前，营门外停着伤者车、南下快马与中军换防骑。每条路都只能带走一部分人，也会把你留在不同的军册上。",
        autoNext: {
          type: "branch",
          cases: [
            {
              when: { kind: "arcVariant", arcId: "shendiao", key: "act7.order", eq: "obeyed" },
              then: { type: "goto", nodeId: "departure-command-status" },
            },
            {
              when: { kind: "arcVariant", arcId: "shendiao", key: "act7.order", eq: "delayed" },
              then: { type: "goto", nodeId: "departure-watched-status" },
            },
            {
              when: { kind: "arcVariant", arcId: "shendiao", key: "act7.order", eq: "defied" },
              then: { type: "goto", nodeId: "departure-guarded-status" },
            },
          ],
          else: { type: "goto", nodeId: "departure-hunted-status" },
        },
      },
      "departure-command-status": {
        id: "departure-command-status",
        title: "军职仍在",
        text: "你的军职与令牌仍然有效，南征名册也留着位置。郭靖已经交还金刀和令箭，不会与你走同一条军路。",
        autoNext: { type: "goto", nodeId: "departure-choice" },
      },
      "departure-watched-status": {
        id: "departure-watched-status",
        title: "半日之后",
        text: "延误军令的罪责尚未裁定，你仍能调动少量驿骑。郭靖准备从旧水眼南下，中军则要求你留营说明撒马尔罕军报。",
        autoNext: { type: "goto", nodeId: "departure-choice" },
      },
      "departure-guarded-status": {
        id: "departure-guarded-status",
        title: "收旗离营",
        text: "你与郭靖都已失去军职，旧部只能在巡骑换防时送行。哲别守着东门，拖雷则没有撤走西牧场的两匹快马。",
        autoNext: { type: "goto", nodeId: "departure-choice" },
      },
      "departure-hunted-status": {
        id: "departure-hunted-status",
        title: "待缉名册",
        text: "中军巡骑已经拿到你的画像，公开营门都不能走。郭靖在旧水眼等候，城外难民车则沿另一条商道南下。",
        autoNext: { type: "goto", nodeId: "departure-choice" },
      },
      "departure-choice": {
        id: "departure-choice",
        title: "最后一条路",
        text: "快马、伤者车与军中令牌都已备好。你必须确认自己随谁离开，或决定继续留在草原。",
        choices: [
          {
            id: "leave-with-guojing",
            text: "随郭靖南归",
            description: "离开蒙古军中，与郭靖从旧水眼或西牧场路线南下。",
            condition: {
              kind: "or",
              items: [
                { kind: "arcVariant", arcId: "shendiao", key: "act7.order", eq: "delayed" },
                { kind: "arcVariant", arcId: "shendiao", key: "act7.order", eq: "defied" },
                { kind: "arcVariant", arcId: "shendiao", key: "act7.order", eq: "betrayed" },
              ],
            },
            consumeDay: true,
            consequences: [
              { kind: "arcVariant", arcId: "shendiao", key: "act7.departure", value: "with-guojing" },
              { kind: "relation", npcId: "guojing", delta: 10 },
              { kind: "factionAttitude", factionId: "mongol", delta: -10 },
            ],
            resultText: "你把军中令牌留在旧水眼，与郭靖换上不带旗号的马匹南下。",
            transition: { type: "goto", nodeId: "departure-router" },
          },
          {
            id: "escort-refugees",
            text: "护送撒马尔罕难民南下",
            description: "不走最快的路，先把已经出城的伤者与百姓送到安全商道。",
            condition: {
              kind: "or",
              items: [
                { kind: "arcVariant", arcId: "shendiao", key: "act7.evacuation", eq: "full" },
                { kind: "arcVariant", arcId: "shendiao", key: "act7.evacuation", eq: "partial" },
              ],
            },
            consumeDay: true,
            consequences: [
              { kind: "arcVariant", arcId: "shendiao", key: "act7.departure", value: "escort-refugees" },
              { kind: "karma", delta: 8 },
              { kind: "reputation", delta: 6 },
            ],
            resultText: "你带伤者车绕开中军驿路，商道向导在前方分批放行，郭靖则从另一条路引开追骑。",
            transition: { type: "goto", nodeId: "departure-router" },
          },
          {
            id: "remain-double-agent",
            text: "留军做双面人",
            description: "保留军中身份与驿骑权限，把南征调动分批送往中原接应者。",
            condition: {
              kind: "and",
              items: [
                { kind: "arcVariant", arcId: "shendiao", key: "act7.order", eq: "delayed" },
                {
                  kind: "or",
                  items: [
                    { kind: "arcVariant", arcId: "shendiao", key: "act7.role", eq: "command" },
                    { kind: "arcVariant", arcId: "shendiao", key: "act7.role", eq: "logistics" },
                    { kind: "hasItem", id: "mongol-wolf-tally" },
                  ],
                },
              ],
            },
            consumeDay: true,
            consequences: [
              { kind: "arcVariant", arcId: "shendiao", key: "act7.departure", value: "double-agent" },
              { kind: "factionAttitude", factionId: "mongol", delta: -3 },
              { kind: "reputation", delta: 3 },
            ],
            resultText: "你留下军中木牌，把第一份南征调动藏进商队药册。郭靖先行南下，约定只认分卷暗记。",
            transition: { type: "goto", nodeId: "departure-router" },
          },
          {
            id: "keep-mongol-command",
            text: "保留蒙古军职",
            description: "继续统领现有部伍，接受撒马尔罕与南征名册上的位置。",
            condition: { kind: "arcVariant", arcId: "shendiao", key: "act7.order", eq: "obeyed" },
            consumeDay: true,
            consequences: [
              { kind: "arcVariant", arcId: "shendiao", key: "act7.departure", value: "mongol-command" },
              { kind: "factionAttitude", factionId: "mongol", delta: 12 },
              { kind: "relation", npcId: "guojing", delta: -12 },
            ],
            resultText: "你收下新的军职木牌，部伍继续留在中军序列。郭靖已经撤下营旗，不在南征名册上署名。",
            transition: { type: "goto", nodeId: "departure-router" },
          },
          {
            id: "choose-grassland-ending",
            text: "退出征战，留在草原",
            description: "不随中军南征，也不返回中原主线，在旧牧地结束军旅身份。",
            condition: {
              kind: "and",
              items: [
                { kind: "arcVariant", arcId: "shendiao", key: "act7.huazheng", eq: "stayed-loyal" },
                {
                  kind: "or",
                  items: [
                    { kind: "arcVariant", arcId: "shendiao", key: "act7.order", eq: "obeyed" },
                    { kind: "arcVariant", arcId: "shendiao", key: "act7.order", eq: "delayed" },
                  ],
                },
              ],
            },
            consumeDay: true,
            consequences: [
              { kind: "arcVariant", arcId: "shendiao", key: "act7.departure", value: "grassland-ending" },
              { kind: "factionAttitude", factionId: "mongol", delta: 2 },
            ],
            resultText: "你交还军令，只保留旧牧地的路引。华筝留在王帐处理父兄之事，你则不再进入任何一支南征部伍。",
            transition: { type: "goto", nodeId: "departure-router" },
          },
        ],
      },
      "departure-router": {
        id: "departure-router",
        title: "路线确认",
        text: "最后一份路引已经封好，同行者、军职与追骑方向也随之确定。",
        autoNext: {
          type: "branch",
          cases: [
            {
              when: { kind: "arcVariant", arcId: "shendiao", key: "act7.departure", eq: "with-guojing" },
              then: { type: "goto", nodeId: "with-guojing-router" },
            },
            {
              when: { kind: "arcVariant", arcId: "shendiao", key: "act7.departure", eq: "escort-refugees" },
              then: { type: "goto", nodeId: "departure-refugees" },
            },
            {
              when: { kind: "arcVariant", arcId: "shendiao", key: "act7.departure", eq: "double-agent" },
              then: { type: "goto", nodeId: "departure-double-agent" },
            },
            {
              when: { kind: "arcVariant", arcId: "shendiao", key: "act7.departure", eq: "mongol-command" },
              then: { type: "goto", nodeId: "departure-mongol-command" },
            },
          ],
          else: { type: "goto", nodeId: "departure-grassland" },
        },
      },
      "with-guojing-router": {
        id: "with-guojing-router",
        title: "南下同行者",
        text: "南下快马已经离营，李萍是否同行决定这支队伍还要不要护住后车。",
        autoNext: {
          type: "branch",
          cases: [
            {
              when: { kind: "arcVariant", arcId: "shendiao", key: "act7.liping", eq: "survived-prepared" },
              then: { type: "goto", nodeId: "departure-with-family" },
            },
          ],
          else: { type: "goto", nodeId: "departure-with-guojing" },
        },
      },
      "departure-with-family": {
        id: "departure-with-family",
        title: "三骑一车",
        text: "郭靖与你轮流在前探路，李萍坐在后车照看伤者与干粮。队伍越过最后一道草坡后，不再使用蒙古军旗。",
        autoNext: { type: "goto", nodeId: "act7-complete" },
      },
      "departure-with-guojing": {
        id: "departure-with-guojing",
        title: "旧水眼南下",
        text: "你与郭靖从旧水眼换马南下，身后没有军旗。李萍留下的路引与军令由郭靖贴身收着。",
        autoNext: { type: "goto", nodeId: "act7-complete" },
      },
      "departure-refugees": {
        id: "departure-refugees",
        title: "伤者车队",
        text: "难民车沿商道分批南下，你守在最后一辆车旁。郭靖与哲别旧部从远处引开一轮追骑，随后各自折返。",
        autoNext: { type: "goto", nodeId: "act7-complete" },
      },
      "departure-double-agent": {
        id: "departure-double-agent",
        title: "军册内外",
        text: "你仍在中军名册上，第一份南征调动却已随商队离开草原。往后每一封暗报都可能同时暴露军中接应与中原收件人。",
        autoNext: { type: "goto", nodeId: "act7-complete" },
      },
      "departure-mongol-command": {
        id: "departure-mongol-command",
        title: "继续领军",
        text: "你的营旗留在中军序列，南征名册也重新封好。郭靖、李萍与离营者的去向不再列入你能调阅的军报。",
        autoNext: { type: "goto", nodeId: "act7-complete" },
      },
      "departure-grassland": {
        id: "departure-grassland",
        title: "旧牧地",
        text: "你交还军职，回到旧牧地安置马匹与伤者。中军继续南移，华筝仍在王帐，你不再随任何一面征战军旗。",
        autoNext: { type: "goto", nodeId: "act7-complete" },
      },
      "act7-complete": {
        id: "act7-complete",
        title: "万里兵锋·终",
        text: "离营路线与留军身份已经确定。撒马尔罕军报、南征令与同行者名单各自封存，第七幕到此收束。",
        onEnter: [
          { kind: "arcBeat", arcId: "shendiao", beat: "act7-western-campaign", result: "done" },
        ],
        autoNext: { type: "end" },
      },
    },
  },
]
