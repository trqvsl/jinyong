import type { StoryEvent } from "./schema"

// 第六幕 P2-P4：
// 牛家村负责穆念慈自行判断杨康，桃花岛负责有限救援、证物保存与误会版本，
// 烟雨楼负责多方会局与证人/证物保全，铁枪庙负责四轮推理、杨康裁决与幕末收束。
export const SHENDIAO_ACT6_STORY: StoryEvent[] = [
  {
    id: "shendiao-niujia-act6",
    entryNode: "village-rain",
    locationId: "niujia",
    weight: 8,
    once: true,
    condition: {
      kind: "and",
      items: [
        { kind: "arcBeat", arcId: "shendiao", beat: "act5-old-debts" },
        { kind: "not", item: { kind: "arcVariant", arcId: "shendiao", key: "act6.munianci", eq: "cleared" } },
        { kind: "not", item: { kind: "arcBeat", arcId: "shendiao", beat: "act6-truth" } },
      ],
    },
    nodes: {
      "village-rain": {
        id: "village-rain",
        title: "破庙雨线",
        text: "牛家村又下起雨。穆念慈独自住在破庙偏屋，桌上放着杨铁心旧枪缨、君山帮帖与一封没有拆开的王府短笺。她没有问杨康是否还会回来，只问你从破庙和君山带回了什么。",
        autoNext: {
          type: "branch",
          cases: [
            {
              when: { kind: "arcVariant", arcId: "shendiao", key: "act5.ouyangke", eq: "killed-concealed" },
              then: { type: "goto", nodeId: "concealed-arrival" },
            },
          ],
          else: { type: "goto", nodeId: "open-arrival" },
        },
      },
      "open-arrival": {
        id: "open-arrival",
        title: "旧问未答",
        text: "穆念慈知道杨康在君山冒认帮主，也知道欧阳克案另有蹊跷。穆念慈：\"你把看见的、拿到的都放在桌上。别替他说，也别替我说。\"",
        autoNext: { type: "goto", nodeId: "evidence-table" },
      },
      "concealed-arrival": {
        id: "concealed-arrival",
        title: "井中断枪",
        text: "破庙枯井已被人填平，墙上的血迹也刷过一遍。穆念慈看见你进门，只把一小块带蛇腥味的旧砖放上桌。穆念慈：\"有人替康哥清过现场。你若知道是谁，今日一并说清。\"",
        autoNext: { type: "goto", nodeId: "evidence-table" },
      },
      "evidence-table": {
        id: "evidence-table",
        title: "把证据交给她",
        text: "雨水从破瓦间落下，正好隔开你与桌边的穆念慈。她没有碰王府短笺，只等你先开口。",
        choices: [
          {
            id: "show-jade-shard",
            text: "交出白驼玉饰残片",
            description: "让枪锈、蛇毒与欧阳克随身玉饰自己说明破庙里发生过什么。",
            condition: {
              kind: "and",
              items: [
                { kind: "hasItem", id: "ouyangke-jade-shard" },
                { kind: "npcAlive", npcId: "ouyangke", alive: false },
              ],
            },
            consumeDay: true,
            consequences: [
              { kind: "relation", npcId: "munianci", delta: 8 },
              { kind: "arcVariant", arcId: "shendiao", key: "act6.munianci-evidence", value: "material" },
            ],
            resultText: "穆念慈用布包起玉饰残片，逐处看过枪锈与蛇毒。她认得杨康袖中短枪的铁色，也记得欧阳克腰间那块玉。",
            transition: { type: "goto", nodeId: "munianci-verdict" },
          },
          {
            id: "give-eyewitness-account",
            text: "逐句说出破庙所见",
            description: "不添判断，只说明杨康何时出枪、何时把蛇毒抹进伤口。",
            condition: { kind: "arcVariant", arcId: "shendiao", key: "act5.ouyangke", eq: "killed-witnessed" },
            consumeDay: true,
            consequences: [
              { kind: "relation", npcId: "munianci", delta: 6 },
              { kind: "arcVariant", arcId: "shendiao", key: "act6.munianci-evidence", value: "eyewitness" },
            ],
            resultText: "你把短枪、蛇毒和杨康清理现场前后的动作逐句说完。穆念慈没有打断，只在听到杨康给尸身补毒时握紧枪缨。",
            transition: { type: "goto", nodeId: "munianci-verdict" },
          },
          {
            id: "show-junshan-record",
            text: "交出君山假帮主记录",
            description: "欧阳克案未必完整，但冒认帮主、勾结铁掌帮已经有多人作证。",
            condition: {
              kind: "or",
              items: [
                { kind: "arcVariant", arcId: "shendiao", key: "act5.beggar", eq: "rong-recognized" },
                { kind: "arcVariant", arcId: "shendiao", key: "act5.beggar", eq: "divided" },
              ],
            },
            consumeDay: true,
            consequences: [
              { kind: "relation", npcId: "munianci", delta: 4 },
              { kind: "arcVariant", arcId: "shendiao", key: "act6.munianci-evidence", value: "junshan" },
            ],
            resultText: "穆念慈看完鲁有脚画押的帮帖。杨康在君山如何借洪七公死讯争位、如何带净衣派退走，都记得清楚。",
            transition: { type: "goto", nodeId: "munianci-verdict" },
          },
          {
            id: "say-ouyangke-survived",
            text: "说明欧阳克负伤逃走",
            description: "这一路没有死人，却也证明杨康确实在破庙动过杀心。",
            condition: { kind: "arcVariant", arcId: "shendiao", key: "act5.ouyangke", eq: "survived-wounded" },
            consumeDay: true,
            consequences: [
              { kind: "relation", npcId: "munianci", delta: 3 },
              { kind: "arcVariant", arcId: "shendiao", key: "act6.munianci-evidence", value: "attempted" },
            ],
            resultText: "你说明自己截住短枪后，欧阳克才得以撞窗逃走。穆念慈把王府短笺翻到背面，没有拆封。",
            transition: { type: "goto", nodeId: "munianci-verdict" },
          },
          {
            id: "hide-the-murder",
            text: "隐去破庙命案",
            description: "只谈君山与铁掌峰，不把自己参与毁证的部分交出来。",
            consumeDay: true,
            consequences: [
              { kind: "karma", delta: -4 },
              { kind: "relation", npcId: "yangkang", delta: 4 },
              { kind: "relation", npcId: "munianci", delta: -8 },
              { kind: "arcVariant", arcId: "shendiao", key: "act6.munianci-evidence", value: "hidden" },
            ],
            resultText: "你只说杨康带净衣派离开君山，没有提破庙枯井与蛇毒。穆念慈把旧砖收回袖中，没有继续追问。",
            transition: { type: "goto", nodeId: "munianci-verdict" },
          },
        ],
      },
      "munianci-verdict": {
        id: "munianci-verdict",
        title: "由她作答",
        text: "证物与口供都已经摆过一遍。穆念慈终于拆开王府短笺，看完后把纸放到灯焰上。",
        autoNext: {
          type: "branch",
          cases: [
            {
              when: {
                kind: "or",
                items: [
                  { kind: "arcVariant", arcId: "shendiao", key: "act6.munianci-evidence", eq: "material" },
                  { kind: "arcVariant", arcId: "shendiao", key: "act6.munianci-evidence", eq: "eyewitness" },
                ],
              },
              then: { type: "goto", nodeId: "munianci-breaks" },
            },
            {
              when: { kind: "arcVariant", arcId: "shendiao", key: "act6.munianci-evidence", eq: "hidden" },
              then: { type: "goto", nodeId: "munianci-deceived" },
            },
          ],
          else: { type: "goto", nodeId: "munianci-questions" },
        },
      },
      "munianci-breaks": {
        id: "munianci-breaks",
        title: "枪缨归匣",
        text: "穆念慈把杨铁心旧枪缨收进木匣，又将王府短笺烧尽。穆念慈：\"他不是不知道自己在做什么。往后我不再替他问理由，也不再跟着他走。\"",
        onEnter: [
          { kind: "npcTag", npcId: "munianci", tag: "与杨康断线" },
          { kind: "arcVariant", arcId: "shendiao", key: "act6.munianci-outcome", value: "broken" },
        ],
        autoNext: { type: "goto", nodeId: "iron-palm-pursuit" },
      },
      "munianci-questions": {
        id: "munianci-questions",
        title: "只问最后一次",
        text: "穆念慈把君山帮帖与断枪线索收在一起。穆念慈：\"这些已够我不再信他的空话。欧阳克一事，我还要当面问一次。问完便走，不论他答什么。\"",
        onEnter: [
          { kind: "npcTag", npcId: "munianci", tag: "不再替杨康辩解" },
          { kind: "arcVariant", arcId: "shendiao", key: "act6.munianci-outcome", value: "informed-unresolved" },
        ],
        autoNext: { type: "goto", nodeId: "iron-palm-pursuit" },
      },
      "munianci-deceived": {
        id: "munianci-deceived",
        title: "旧砖未解",
        text: "穆念慈没有烧掉枪缨，只把王府短笺撕成两半。穆念慈：\"君山的事我会问他。破庙这块砖，你既不肯说，我自己查。\"",
        onEnter: [
          { kind: "npcTag", npcId: "munianci", tag: "欧阳克案被隐瞒" },
          { kind: "arcVariant", arcId: "shendiao", key: "act6.munianci-outcome", value: "hidden" },
        ],
        autoNext: { type: "goto", nodeId: "iron-palm-pursuit" },
      },
      "iron-palm-pursuit": {
        id: "iron-palm-pursuit",
        title: "雨巷追兵",
        text: "庙外忽然响起三声短哨，铁掌帮追兵从村口与河滩同时逼近。他们要带走穆念慈，也要收回君山帮帖与铁掌峰抄录。",
        choices: [
          {
            id: "guard-munianci",
            text: "护住穆念慈守满两轮",
            description: "让她带证物退到地道口，你守住雨巷不让追兵近身。",
            consumeDay: true,
            transition: {
              type: "battle",
              enemyId: "iron-palm-disciple",
              allyIds: ["munianci"],
              objective: {
                kind: "surviveRounds",
                rounds: 2,
                protectAllyId: "munianci",
                title: "护住穆念慈撤到地道口",
              },
              onWin: {
                text: "你与穆念慈守住两轮夹击，地道口终于打开。她带着帮帖和木匣先行退入，追兵未能夺走证物。",
                consequences: [
                  { kind: "relation", npcId: "munianci", delta: 6 },
                  { kind: "npcTag", npcId: "munianci", tag: "带证物脱离追兵" },
                ],
                then: { type: "goto", nodeId: "munianci-resolution" },
              },
              onLose: {
                text: "穆念慈在退到地道前被铁掌震倒。你把她抢回破庙，帮帖却被追兵撕走一角。",
                consequences: [
                  { kind: "relation", npcId: "munianci", delta: 2 },
                  { kind: "npcTag", npcId: "munianci", tag: "被铁掌追兵所伤" },
                ],
                then: { type: "goto", nodeId: "munianci-resolution" },
              },
              onFlee: {
                text: "你带穆念慈翻过断墙，从河滩绕开追兵。证物仍在，铁掌帮也知道她已经脱离控制。",
                consequences: [
                  { kind: "npcTag", npcId: "munianci", tag: "带证物脱离追兵" },
                ],
                then: { type: "goto", nodeId: "munianci-resolution" },
              },
            },
          },
          {
            id: "call-beggar-reinforcement",
            text: "点燃丐帮信火",
            description: "黄蓉已获多数长老承认时，可请附近分舵护送穆念慈出村。",
            condition: { kind: "arcVariant", arcId: "shendiao", key: "act5.beggar", eq: "rong-recognized" },
            consumeDay: true,
            consequences: [
              { kind: "factionAttitude", factionId: "beggar", delta: 3 },
              { kind: "relation", npcId: "munianci", delta: 4 },
              { kind: "npcTag", npcId: "munianci", tag: "由丐帮护送离村" },
            ],
            resultText: "污衣派弟子从河滩接应，把穆念慈与证物分乘两船送走。铁掌追兵没有分清她在哪一条船上。",
            transition: { type: "goto", nodeId: "munianci-resolution" },
          },
          {
            id: "draw-pursuers-away",
            text: "独自引走追兵",
            description: "让穆念慈从地道离村，你把铁掌追兵带向村北荒坡。",
            consumeDay: true,
            transition: {
              type: "battle",
              enemyId: "iron-palm-disciple",
              objective: {
                kind: "surviveRounds",
                rounds: 2,
                title: "拖住追兵两轮",
              },
              onWin: {
                text: "你在荒坡拖住追兵两轮，穆念慈已经带证物离开牛家村。追兵再回头时，地道入口已被封死。",
                consequences: [
                  { kind: "reputation", delta: 3 },
                  { kind: "npcTag", npcId: "munianci", tag: "带证物脱离追兵" },
                ],
                then: { type: "goto", nodeId: "munianci-resolution" },
              },
              onLose: {
                text: "你被铁掌追兵逼下荒坡，仍替穆念慈争到离村时间。自己肩背却多了一道沉掌伤。",
                consequences: [
                  { kind: "hp", delta: -35 },
                  { kind: "npcTag", npcId: "munianci", tag: "带证物脱离追兵" },
                ],
                then: { type: "goto", nodeId: "munianci-resolution" },
              },
              onFlee: {
                text: "你借雨幕改变脚印方向，追兵被带往临安官道。穆念慈从另一侧离开了牛家村。",
                consequences: [
                  { kind: "npcTag", npcId: "munianci", tag: "带证物脱离追兵" },
                ],
                then: { type: "goto", nodeId: "munianci-resolution" },
              },
            },
          },
        ],
      },
      "munianci-resolution": {
        id: "munianci-resolution",
        title: "她自己的去路",
        text: "铁掌追兵已经退开，穆念慈也不再留在破庙等人。她最后如何处置杨康，仍由方才看过的证据决定。",
        autoNext: {
          type: "branch",
          cases: [
            {
              when: { kind: "arcVariant", arcId: "shendiao", key: "act6.munianci-outcome", eq: "broken" },
              then: { type: "goto", nodeId: "munianci-end-broken" },
            },
            {
              when: { kind: "arcVariant", arcId: "shendiao", key: "act6.munianci-outcome", eq: "hidden" },
              then: { type: "goto", nodeId: "munianci-end-hidden" },
            },
          ],
          else: { type: "goto", nodeId: "munianci-end-question" },
        },
      },
      "munianci-end-broken": {
        id: "munianci-end-broken",
        title: "不再同行",
        text: "穆念慈带着杨家枪缨往嘉兴方向去。她不再追随杨康，只准备在下一次见面时把欧阳克案与君山帮帖放到他面前。",
        onEnter: [
          { kind: "arcVariant", arcId: "shendiao", key: "act6.munianci", value: "cleared" },
        ],
        autoNext: { type: "end" },
      },
      "munianci-end-question": {
        id: "munianci-end-question",
        title: "最后一问",
        text: "穆念慈决定先找杨康问完欧阳克案，再结束这条旧路。她没有要求你同行，只让你若先到烟雨楼，替她留一个能当面对质的位置。",
        onEnter: [
          { kind: "arcVariant", arcId: "shendiao", key: "act6.munianci", value: "cleared" },
        ],
        autoNext: { type: "end" },
      },
      "munianci-end-hidden": {
        id: "munianci-end-hidden",
        title: "自行查证",
        text: "穆念慈把破庙旧砖与君山帮帖带走。你隐去的命案没有消失，她会沿枯井、蛇毒与王府短枪自己查下去。",
        onEnter: [
          { kind: "arcVariant", arcId: "shendiao", key: "act6.munianci", value: "cleared" },
        ],
        autoNext: { type: "end" },
      },
    },
  },
  {
    id: "shendiao-taohua-blood-act6",
    entryNode: "island-landing",
    locationId: "taohuadao",
    weight: 8,
    once: true,
    condition: {
      kind: "and",
      items: [
        { kind: "arcVariant", arcId: "shendiao", key: "act6.munianci", eq: "cleared" },
        { kind: "not", item: { kind: "arcVariant", arcId: "shendiao", key: "act6.island", eq: "cleared" } },
        { kind: "not", item: { kind: "arcBeat", arcId: "shendiao", beat: "act6-truth" } },
      ],
    },
    nodes: {
      "island-landing": {
        id: "island-landing",
        title: "潮退石阶",
        text: "桃花岛码头没有哑仆接船，系缆石上却多了新鲜刀痕。桃林外圈被人移动过三处阵石，泥地里同时留下蛇篓拖痕与杨家短枪的铁屑。",
        autoNext: {
          type: "branch",
          cases: [
            {
              when: { kind: "arcVariant", arcId: "shendiao", key: "act6.munianci-outcome", eq: "broken" },
              then: { type: "goto", nodeId: "landing-with-warning" },
            },
            {
              when: { kind: "arcVariant", arcId: "shendiao", key: "act6.munianci-outcome", eq: "hidden" },
              then: { type: "goto", nodeId: "landing-with-doubt" },
            },
          ],
          else: { type: "goto", nodeId: "landing-with-question" },
        },
      },
      "landing-with-warning": {
        id: "landing-with-warning",
        title: "穆念慈的警告",
        text: "穆念慈托丐帮快船先送来一句话：杨康已经知道有人保存欧阳克案证物。若他来过桃花岛，绝不会只为找郭靖。",
        autoNext: { type: "goto", nodeId: "outer-array-traces" },
      },
      "landing-with-question": {
        id: "landing-with-question",
        title: "未完口供",
        text: "穆念慈尚未拿到完整命案证据，只确认杨康曾与白驼山、铁掌帮同时来往。岛上两种痕迹都在，无法只凭来路定凶。",
        autoNext: { type: "goto", nodeId: "outer-array-traces" },
      },
      "landing-with-doubt": {
        id: "landing-with-doubt",
        title: "被隐去的旧案",
        text: "穆念慈沿破庙枯井查到桃花岛渡口，却没有得到你的完整口供。她只留下半张船票，上面同时记着杨康与白驼山弟子的名字。",
        autoNext: { type: "goto", nodeId: "outer-array-traces" },
      },
      "outer-array-traces": {
        id: "outer-array-traces",
        title: "谁动过桃花阵",
        text: "桃花阵外圈的石记被照图挪动过，改动者只知道入口，不懂阵势回合。林中已经传来铁杖撞树与长剑落地声。",
        choices: [
          {
            id: "record-route-scratches",
            text: "拓下阵石改动",
            description: "先证明凶手是按外来岛图入阵，而非桃花岛门人自由通行。",
            consumeDay: true,
            consequences: [
              { kind: "item", id: "taohua-route-scratch" },
              { kind: "aptitude", delta: 2 },
            ],
            resultText: "你拓下三处新刻与错位石记。改动路线绕开外阵，却在内阵连续走错两次。",
            transition: { type: "goto", nodeId: "courtyard-cries" },
          },
          {
            id: "seal-snake-venom",
            text: "封存蛇篓毒痕",
            description: "白驼山蛇毒已经渗入泥地，先留一份可与欧阳克案对照的样本。",
            consumeDay: true,
            consequences: [
              { kind: "item", id: "taohua-snake-venom" },
              { kind: "relation", npcId: "huangrong", delta: 2 },
            ],
            resultText: "你从断竹与泥水中封存一小瓶蛇毒，气味与白驼玉饰残片上的毒腥相同。",
            transition: { type: "goto", nodeId: "courtyard-cries" },
          },
          {
            id: "use-known-island-route",
            text: "沿旧路抢入内阵",
            description: "此前随郭黄或桃花旧门登岛，可以避开外圈错路直接救人。",
            condition: {
              kind: "or",
              items: [
                { kind: "arcVariant", arcId: "shendiao", key: "act4.taohua-route", eq: "guo-huang" },
                { kind: "arcVariant", arcId: "shendiao", key: "act4.taohua-route", eq: "old-gate" },
              ],
            },
            consumeDay: true,
            consequences: [
              { kind: "speed", delta: 2 },
              { kind: "item", id: "taohua-route-scratch" },
            ],
            resultText: "你从旧门小径穿过内阵，比沿石记绕行少走两重桃林。打斗声已在前方精舍外。",
            transition: { type: "goto", nodeId: "courtyard-cries" },
          },
          {
            id: "rush-toward-clash",
            text: "立刻循兵刃声救人",
            description: "放弃外圈取证，先赶到仍有人交手的精舍。",
            consumeDay: true,
            consequences: [
              { kind: "relation", npcId: "guojing", delta: 3 },
            ],
            resultText: "你越过两处倒伏桃树冲进内阵。精舍外已经有人倒地，西侧竹林仍有铁杖与掌风交击。",
            transition: { type: "goto", nodeId: "courtyard-cries" },
          },
        ],
      },
      "courtyard-cries": {
        id: "courtyard-cries",
        title: "血案正在发生",
        text: "韩宝驹与全金发已经倒在精舍前，朱聪靠着石阶仍在动。西侧柯镇恶独自抵住一名黄袍高手，东侧韩小莹被杨康与蛇奴逼进竹林。南希仁试图封住通往码头的路。你只能先救一处。",
        choices: [
          {
            id: "protect-ke-zhene",
            text: "护住柯镇恶守满三轮",
            description: "挡住黄袍高手，让柯镇恶活着离开这片桃林。",
            consumeDay: true,
            transition: {
              type: "battle",
              enemyId: "ouyangfeng",
              allyIds: ["kezhene"],
              objective: {
                kind: "surviveRounds",
                rounds: 3,
                protectAllyId: "kezhene",
                title: "护住柯镇恶撤出桃林",
              },
              onWin: {
                text: "你与柯镇恶守满三轮，黄袍高手不再恋战，转身退向码头。柯镇恶仍能自行持杖，却没看见东侧竹林的经过。",
                then: { type: "goto", nodeId: "ke-survived" },
              },
              onLose: {
                text: "柯镇恶被掌风震倒，你把他拖出精舍时，黄袍高手已经退走。他保住性命，听觉与记忆却都被剧痛搅乱。",
                then: { type: "goto", nodeId: "ke-wounded" },
              },
              onFlee: {
                text: "你带柯镇恶穿出断墙，黄袍高手没有追远。其余方向的打斗声也在此时停下。",
                then: { type: "goto", nodeId: "ke-wounded" },
              },
            },
          },
          {
            id: "save-han-xiaoying",
            text: "冲进竹林救韩小莹",
            description: "她仍能挥剑；若守住两轮，可多保下一名证人与一份血字。",
            consumeDay: true,
            transition: {
              type: "battle",
              enemyId: "yangkang",
              allyIds: ["hanxiaoying"],
              objective: {
                kind: "surviveRounds",
                rounds: 2,
                protectAllyId: "hanxiaoying",
                title: "护住韩小莹冲出竹林",
              },
              onWin: {
                text: "你与韩小莹守住两轮，杨康见黄袍高手已经退向码头，也带蛇奴离开。韩小莹肩伤极重，仍能指认凶手招式。",
                then: { type: "goto", nodeId: "xiaoying-saved" },
              },
              onLose: {
                text: "杨康的爪势穿过防线，韩小莹倒在竹边。你抢回她留下的半截血字，柯镇恶则被随后赶来的岛仆救出。",
                then: { type: "goto", nodeId: "xiaoying-fell" },
              },
              onFlee: {
                text: "你被迫退出竹林。韩小莹没有跟出来，只在石面留下未写完的血字；柯镇恶仍从西侧活着撤出。",
                then: { type: "goto", nodeId: "xiaoying-fell" },
              },
            },
          },
          {
            id: "secure-zhu-cong-evidence",
            text: "护住朱聪与临死取物",
            description: "朱聪手里攥着从凶手身上扯下的东西，先让证物不被杨康夺回。",
            consumeDay: true,
            transition: {
              type: "battle",
              enemyId: "yangkang",
              allyIds: ["kezhene"],
              objective: {
                kind: "surviveRounds",
                rounds: 2,
                protectAllyId: "kezhene",
                title: "守住朱聪证物与柯镇恶",
              },
              onWin: {
                text: "你守住石阶两轮，杨康没能夺回朱聪手里的翡翠鞋。朱聪把证物交给柯镇恶后伤重断气。",
                then: { type: "goto", nodeId: "evidence-secured" },
              },
              onLose: {
                text: "杨康抢走半只翡翠鞋，另一半仍留在朱聪掌中。柯镇恶活着撤出，证物却只剩残缺一角。",
                then: { type: "goto", nodeId: "evidence-scattered" },
              },
              onFlee: {
                text: "你带柯镇恶退离石阶，只抢回朱聪掌中的翡翠鞋。其他伤痕来不及封存。",
                then: { type: "goto", nodeId: "evidence-scattered" },
              },
            },
          },
          {
            id: "chase-yellow-robed-killer",
            text: "追击黄袍高手",
            description: "不留在原地救援，先确认凶手伪装、蛇毒与退路。",
            consumeDay: true,
            transition: {
              type: "battle",
              enemyId: "ouyangfeng",
              objective: {
                kind: "surviveRounds",
                rounds: 2,
                title: "缠住黄袍高手并留下痕迹",
              },
              onWin: {
                text: "你缠住黄袍高手两轮，扯下一片袍角，也看清他以蛇杖点船离岛。回到精舍时，柯镇恶已被岛仆救下。",
                then: { type: "goto", nodeId: "killer-traced" },
              },
              onLose: {
                text: "黄袍高手一掌把你震回岸边，只留下一缕断裂丝线。柯镇恶后来被岛仆从断墙下救出。",
                then: { type: "goto", nodeId: "killer-lost" },
              },
              onFlee: {
                text: "你没有追上离岛小船，只在礁石边找到一缕黄袍丝线与蛇毒残液。柯镇恶仍活着撤出。",
                then: { type: "goto", nodeId: "killer-lost" },
              },
            },
          },
        ],
      },
      "ke-survived": {
        id: "ke-survived",
        title: "铁杖未折",
        text: "柯镇恶活着离开精舍，韩小莹却没能走出竹林。朱聪、韩宝驹、南希仁、全金发都已死在岛上。",
        onEnter: [
          { kind: "npcAlive", npcId: "kezhene", alive: true },
          { kind: "npcAlive", npcId: "hanxiaoying", alive: false },
          { kind: "npcAlive", npcId: "zhucong", alive: false },
          { kind: "npcAlive", npcId: "hanbaoju", alive: false },
          { kind: "npcAlive", npcId: "nanxiren", alive: false },
          { kind: "npcAlive", npcId: "quanjinfa", alive: false },
          { kind: "item", id: "yangkang-jade-shoe" },
          { kind: "item", id: "han-xiaoying-blood-writing" },
          { kind: "arcVariant", arcId: "shendiao", key: "act6.island-outcome", value: "ke-survived" },
        ],
        autoNext: { type: "goto", nodeId: "blood-aftermath-bridge" },
      },
      "ke-wounded": {
        id: "ke-wounded",
        title: "重伤证人",
        text: "柯镇恶保住性命，铁杖却断成两截。他只记得黄袍、箫声与熟悉岛路，无法分清哪些是亲见，哪些来自凶手故意留下的线索。",
        onEnter: [
          { kind: "npcAlive", npcId: "kezhene", alive: true },
          { kind: "npcTag", npcId: "kezhene", tag: "桃花岛血案重伤" },
          { kind: "npcAlive", npcId: "hanxiaoying", alive: false },
          { kind: "npcAlive", npcId: "zhucong", alive: false },
          { kind: "npcAlive", npcId: "hanbaoju", alive: false },
          { kind: "npcAlive", npcId: "nanxiren", alive: false },
          { kind: "npcAlive", npcId: "quanjinfa", alive: false },
          { kind: "item", id: "han-xiaoying-blood-writing" },
          { kind: "arcVariant", arcId: "shendiao", key: "act6.island-outcome", value: "ke-wounded" },
        ],
        autoNext: { type: "goto", nodeId: "blood-aftermath-bridge" },
      },
      "xiaoying-saved": {
        id: "xiaoying-saved",
        title: "多救一人",
        text: "韩小莹被救出竹林，柯镇恶也由岛仆带回精舍。朱聪把翡翠鞋交出后断气，韩宝驹、南希仁、全金发同样没能活下来。",
        onEnter: [
          { kind: "npcAlive", npcId: "kezhene", alive: true },
          { kind: "npcAlive", npcId: "hanxiaoying", alive: true },
          { kind: "npcTag", npcId: "hanxiaoying", tag: "桃花岛血案幸存" },
          { kind: "npcAlive", npcId: "zhucong", alive: false },
          { kind: "npcAlive", npcId: "hanbaoju", alive: false },
          { kind: "npcAlive", npcId: "nanxiren", alive: false },
          { kind: "npcAlive", npcId: "quanjinfa", alive: false },
          { kind: "item", id: "yangkang-jade-shoe" },
          { kind: "item", id: "han-xiaoying-blood-writing" },
          { kind: "arcVariant", arcId: "shendiao", key: "act6.island-outcome", value: "xiaoying-saved" },
        ],
        autoNext: { type: "goto", nodeId: "blood-aftermath-bridge" },
      },
      "xiaoying-fell": {
        id: "xiaoying-fell",
        title: "血字未完",
        text: "韩小莹死在竹林，柯镇恶由岛仆救回。朱聪、韩宝驹、南希仁、全金发也都没能离开血案现场。",
        onEnter: [
          { kind: "npcAlive", npcId: "kezhene", alive: true },
          { kind: "npcAlive", npcId: "hanxiaoying", alive: false },
          { kind: "npcAlive", npcId: "zhucong", alive: false },
          { kind: "npcAlive", npcId: "hanbaoju", alive: false },
          { kind: "npcAlive", npcId: "nanxiren", alive: false },
          { kind: "npcAlive", npcId: "quanjinfa", alive: false },
          { kind: "item", id: "han-xiaoying-blood-writing" },
          { kind: "arcVariant", arcId: "shendiao", key: "act6.island-outcome", value: "ke-only" },
        ],
        autoNext: { type: "goto", nodeId: "blood-aftermath-bridge" },
      },
      "evidence-secured": {
        id: "evidence-secured",
        title: "临死取物",
        text: "朱聪留下的翡翠鞋、韩小莹未完血字与伤口蛇毒都被分别封存。柯镇恶活着，另外五怪却都死在岛上。",
        onEnter: [
          { kind: "npcAlive", npcId: "kezhene", alive: true },
          { kind: "npcAlive", npcId: "hanxiaoying", alive: false },
          { kind: "npcAlive", npcId: "zhucong", alive: false },
          { kind: "npcAlive", npcId: "hanbaoju", alive: false },
          { kind: "npcAlive", npcId: "nanxiren", alive: false },
          { kind: "npcAlive", npcId: "quanjinfa", alive: false },
          { kind: "item", id: "yangkang-jade-shoe" },
          { kind: "item", id: "han-xiaoying-blood-writing" },
          { kind: "item", id: "taohua-snake-venom" },
          { kind: "arcVariant", arcId: "shendiao", key: "act6.island-outcome", value: "evidence-preserved" },
        ],
        autoNext: { type: "goto", nodeId: "blood-aftermath-bridge" },
      },
      "evidence-scattered": {
        id: "evidence-scattered",
        title: "只余半鞋",
        text: "你只保住朱聪掌中的半只翡翠鞋。柯镇恶活着，另外五怪都已身亡，其他伤痕也被混战踩乱。",
        onEnter: [
          { kind: "npcAlive", npcId: "kezhene", alive: true },
          { kind: "npcAlive", npcId: "hanxiaoying", alive: false },
          { kind: "npcAlive", npcId: "zhucong", alive: false },
          { kind: "npcAlive", npcId: "hanbaoju", alive: false },
          { kind: "npcAlive", npcId: "nanxiren", alive: false },
          { kind: "npcAlive", npcId: "quanjinfa", alive: false },
          { kind: "item", id: "yangkang-jade-shoe" },
          { kind: "arcVariant", arcId: "shendiao", key: "act6.island-outcome", value: "evidence-fragment" },
        ],
        autoNext: { type: "goto", nodeId: "blood-aftermath-bridge" },
      },
      "killer-traced": {
        id: "killer-traced",
        title: "黄袍与蛇杖",
        text: "黄袍丝缕与礁石蛇毒都被封存，柯镇恶也被岛仆救下。江南五怪仍死在岛上，追击没有换回他们的性命。",
        onEnter: [
          { kind: "npcAlive", npcId: "kezhene", alive: true },
          { kind: "npcAlive", npcId: "hanxiaoying", alive: false },
          { kind: "npcAlive", npcId: "zhucong", alive: false },
          { kind: "npcAlive", npcId: "hanbaoju", alive: false },
          { kind: "npcAlive", npcId: "nanxiren", alive: false },
          { kind: "npcAlive", npcId: "quanjinfa", alive: false },
          { kind: "item", id: "yellow-robe-fiber" },
          { kind: "item", id: "taohua-snake-venom" },
          { kind: "arcVariant", arcId: "shendiao", key: "act6.island-outcome", value: "killer-traced" },
        ],
        autoNext: { type: "goto", nodeId: "blood-aftermath-bridge" },
      },
      "killer-lost": {
        id: "killer-lost",
        title: "凶船离岸",
        text: "你只从礁石留下的断线中收回一缕黄袍丝。柯镇恶被岛仆救下，另外五怪都没能生还。",
        onEnter: [
          { kind: "npcAlive", npcId: "kezhene", alive: true },
          { kind: "npcAlive", npcId: "hanxiaoying", alive: false },
          { kind: "npcAlive", npcId: "zhucong", alive: false },
          { kind: "npcAlive", npcId: "hanbaoju", alive: false },
          { kind: "npcAlive", npcId: "nanxiren", alive: false },
          { kind: "npcAlive", npcId: "quanjinfa", alive: false },
          { kind: "item", id: "yellow-robe-fiber" },
          { kind: "arcVariant", arcId: "shendiao", key: "act6.island-outcome", value: "killer-lost" },
        ],
        autoNext: { type: "goto", nodeId: "blood-aftermath-bridge" },
      },
      "blood-aftermath-bridge": {
        id: "blood-aftermath-bridge",
        title: "幸存者开口",
        text: "尸身与伤者被移到精舍，郭靖也在此时赶到。柯镇恶认定黄袍高手就是黄药师，黄蓉却要求先分清亲见、听见与凶手留下的物证。",
        autoNext: {
          type: "branch",
          cases: [
            {
              when: { kind: "arcVariant", arcId: "shendiao", key: "act6.island-outcome", eq: "xiaoying-saved" },
              then: { type: "goto", nodeId: "xiaoying-testimony" },
            },
            {
              when: { kind: "arcVariant", arcId: "shendiao", key: "act6.island-outcome", eq: "evidence-preserved" },
              then: { type: "goto", nodeId: "sealed-evidence" },
            },
          ],
          else: { type: "goto", nodeId: "ke-accusation" },
        },
      },
      "xiaoying-testimony": {
        id: "xiaoying-testimony",
        title: "活证与错认",
        text: "韩小莹肩上缠着止血布，先把自己看见的招式逐一说清。韩小莹：\"黄袍人用的是蛤蟆功，杨康在竹林使过九阴爪。大哥听见箫声不假，可那支箫从头到尾没有吹成曲。\"",
        autoNext: { type: "goto", nodeId: "evidence-review" },
      },
      "sealed-evidence": {
        id: "sealed-evidence",
        title: "三匣分存",
        text: "翡翠鞋、未完血字与蛇毒被分装三匣。柯镇恶仍不肯撤回对黄药师的指认，却同意把证物带到烟雨楼当众核验。",
        autoNext: { type: "goto", nodeId: "evidence-review" },
      },
      "ke-accusation": {
        id: "ke-accusation",
        title: "错误证人",
        text: "柯镇恶只听见箫声、黄袍摩擦与桃花阵开路声，便认定凶手是黄药师。郭靖在师父尸身前没有接受黄蓉解释，黄蓉也没有继续追问。",
        autoNext: { type: "goto", nodeId: "evidence-review" },
      },
      "evidence-review": {
        id: "evidence-review",
        title: "证据够不够",
        text: "黄蓉把现有证物逐件放在案上。它们能否推翻柯镇恶的亲耳证词，取决于是否同时回答谁能入岛、谁会九阴爪，以及谁有杀人动机。",
        autoNext: {
          type: "branch",
          cases: [
            {
              when: {
                kind: "and",
                items: [
                  { kind: "hasItem", id: "yangkang-jade-shoe" },
                  { kind: "hasItem", id: "han-xiaoying-blood-writing" },
                  {
                    kind: "or",
                    items: [
                      { kind: "hasItem", id: "taohua-snake-venom" },
                      { kind: "hasItem", id: "yellow-robe-fiber" },
                      { kind: "hasItem", id: "taohua-route-scratch" },
                    ],
                  },
                ],
              },
              then: { type: "goto", nodeId: "misunderstanding-questioning" },
            },
            {
              when: {
                kind: "or",
                items: [
                  { kind: "hasItem", id: "yangkang-jade-shoe" },
                  { kind: "hasItem", id: "han-xiaoying-blood-writing" },
                  { kind: "hasItem", id: "taohua-snake-venom" },
                  { kind: "hasItem", id: "yellow-robe-fiber" },
                  { kind: "hasItem", id: "taohua-route-scratch" },
                ],
              },
              then: { type: "goto", nodeId: "misunderstanding-partial" },
            },
          ],
          else: { type: "goto", nodeId: "misunderstanding-weak" },
        },
      },
      "misunderstanding-questioning": {
        id: "misunderstanding-questioning",
        title: "足以质询",
        text: "翡翠鞋把杨康放进现场，血字与蛇毒又指向九阴爪和白驼山。郭靖仍未原谅任何人，却同意先到烟雨楼质询，不再把黄药师当场定为凶手。",
        onEnter: [
          { kind: "arcVariant", arcId: "shendiao", key: "act6.misunderstanding", value: "questioning" },
          { kind: "arcVariant", arcId: "shendiao", key: "act6.island", value: "cleared" },
        ],
        autoNext: { type: "end" },
      },
      "misunderstanding-partial": {
        id: "misunderstanding-partial",
        title: "只能延缓指认",
        text: "现有证物能证明现场还有杨康或白驼山痕迹，却无法独立还原整个血案。郭靖答应把证物带到烟雨楼，柯镇恶仍坚持黄药师是主凶。",
        onEnter: [
          { kind: "arcVariant", arcId: "shendiao", key: "act6.misunderstanding", value: "partial" },
          { kind: "arcVariant", arcId: "shendiao", key: "act6.island", value: "cleared" },
        ],
        autoNext: { type: "end" },
      },
      "misunderstanding-weak": {
        id: "misunderstanding-weak",
        title: "指认先行",
        text: "没有足够物证反驳柯镇恶，黄药师杀害江南五怪的说法先一步传出桃花岛。郭靖带师父尸身赴烟雨楼，黄蓉留在后船。",
        onEnter: [
          { kind: "arcVariant", arcId: "shendiao", key: "act6.misunderstanding", value: "weak" },
          { kind: "arcVariant", arcId: "shendiao", key: "act6.island", value: "cleared" },
        ],
        autoNext: { type: "end" },
      },
    },
  },
  {
    id: "shendiao-yanyulou-act6",
    entryNode: "lake-arrival",
    locationId: "yanyulou",
    weight: 8,
    once: true,
    condition: {
      kind: "and",
      items: [
        { kind: "arcVariant", arcId: "shendiao", key: "act6.island", eq: "cleared" },
        { kind: "not", item: { kind: "arcVariant", arcId: "shendiao", key: "act6.yanyu", eq: "cleared" } },
        { kind: "not", item: { kind: "arcBeat", arcId: "shendiao", beat: "act6-truth" } },
      ],
    },
    nodes: {
      "lake-arrival": {
        id: "lake-arrival",
        title: "南湖旧约",
        text: "细雨罩着南湖。烟雨楼下泊着全真、丐帮、桃花岛与王府四路船只，白驼山蛇奴则把船停在芦苇外。楼中桌椅已经搬空，正中只留一张验物长案。",
        autoNext: {
          type: "branch",
          cases: [
            {
              when: { kind: "arcVariant", arcId: "shendiao", key: "act6.misunderstanding", eq: "weak" },
              then: { type: "goto", nodeId: "accusation-first" },
            },
            {
              when: { kind: "arcVariant", arcId: "shendiao", key: "act6.misunderstanding", eq: "partial" },
              then: { type: "goto", nodeId: "two-records" },
            },
          ],
          else: { type: "goto", nodeId: "sealed-hearing" },
        },
      },
      "accusation-first": {
        id: "accusation-first",
        title: "指认先到",
        text: "柯镇恶刚踏上二楼便以铁杖指向黄药师。全真弟子同时移到楼梯两侧，郭靖站在师父身后。黄药师没有解释，只把玉箫放在窗边。欧阳锋坐在临水一桌，手边没有兵器。",
        autoNext: { type: "goto", nodeId: "witness-rollcall" },
      },
      "two-records": {
        id: "two-records",
        title: "两种伤痕",
        text: "鲁有脚先把两份验伤抄件压在长案上。一份记着桃花岛掌伤，另一份记着白驼蛇毒与九阴爪孔。柯镇恶仍指认黄药师，黄蓉则要求每个人只说亲见与亲闻。",
        autoNext: { type: "goto", nodeId: "witness-rollcall" },
      },
      "sealed-hearing": {
        id: "sealed-hearing",
        title: "三匣上楼",
        text: "丐帮弟子把三只编号木匣依次放上长案，封条与送达记录都在。柯镇恶坐在左侧，郭靖没有拔剑。黄蓉先请丘处机、鲁有脚与玩家共同验封，再请黄药师入楼。",
        autoNext: { type: "goto", nodeId: "witness-rollcall" },
      },
      "witness-rollcall": {
        id: "witness-rollcall",
        title: "谁能作证",
        text: "长案一侧留着两个证人位置。柯镇恶已经到场，另一张椅子是否有人坐下，取决于桃花岛竹林里谁活着出来。",
        autoNext: {
          type: "branch",
          cases: [
            {
              when: { kind: "npcAlive", npcId: "hanxiaoying", alive: true },
              then: { type: "goto", nodeId: "living-witness" },
            },
          ],
          else: { type: "goto", nodeId: "blood-writing-witness" },
        },
      },
      "living-witness": {
        id: "living-witness",
        title: "越女剑作证",
        text: "韩小莹肩上仍缠着药布，却能自行走上楼。韩小莹：\"我看见杨康在竹林用九阴爪，也看见黄袍人以蛤蟆功退走。大哥听见箫声不假，但没有看见出掌的人。\"",
        autoNext: { type: "goto", nodeId: "munianci-position" },
      },
      "blood-writing-witness": {
        id: "blood-writing-witness",
        title: "空椅与血字",
        text: "第二张椅子空着。黄蓉把韩小莹留下的未完血字放在椅前，柯镇恶听见纸张展开，没有收回铁杖。郭靖把五位师父的名牌逐一摆到案角。",
        autoNext: { type: "goto", nodeId: "munianci-position" },
      },
      "munianci-position": {
        id: "munianci-position",
        title: "穆念慈是否到场",
        text: "楼下又有一条小船靠岸。船头没有旗号，只放着一只装过杨家枪缨的木匣。",
        autoNext: {
          type: "branch",
          cases: [
            {
              when: { kind: "arcVariant", arcId: "shendiao", key: "act6.munianci-outcome", eq: "broken" },
              then: { type: "goto", nodeId: "munianci-broken-arrival" },
            },
            {
              when: { kind: "arcVariant", arcId: "shendiao", key: "act6.munianci-outcome", eq: "informed-unresolved" },
              then: { type: "goto", nodeId: "munianci-last-question" },
            },
          ],
          else: { type: "goto", nodeId: "munianci-absent" },
        },
      },
      "munianci-broken-arrival": {
        id: "munianci-broken-arrival",
        title: "枪缨已经归匣",
        text: "穆念慈带着君山帮帖上楼，没有走到杨康身边。穆念慈：\"我今日来作证，不来劝他。欧阳克案与假帮主之事，他自己回答。\"",
        autoNext: { type: "goto", nodeId: "lake-cordon" },
      },
      "munianci-last-question": {
        id: "munianci-last-question",
        title: "最后一问",
        text: "穆念慈把木匣放在自己面前。穆念慈：\"破庙那一枪、君山那根打狗棒，我只问最后一次。你若再说旁人逼你，我便不再听。\"杨康没有回答。",
        autoNext: { type: "goto", nodeId: "lake-cordon" },
      },
      "munianci-absent": {
        id: "munianci-absent",
        title: "自行查证",
        text: "船上只送来一块从破庙枯井取出的带毒旧砖。穆念慈没有到场，她仍在查被隐去的命案，不肯替任何一方补全口供。",
        autoNext: { type: "goto", nodeId: "lake-cordon" },
      },
      "lake-cordon": {
        id: "lake-cordon",
        title: "楼外是谁的船",
        text: "湖面各船已经占住退路。武穆遗书此前交到谁手里，也改变了今日谁能调动外围人手。",
        autoNext: {
          type: "branch",
          cases: [
            {
              when: { kind: "arcVariant", arcId: "shendiao", key: "act5.wumu-destination", eq: "song-command" },
              then: { type: "goto", nodeId: "song-cordon" },
            },
            {
              when: { kind: "arcVariant", arcId: "shendiao", key: "act5.wumu-destination", eq: "beggar-network" },
              then: { type: "goto", nodeId: "beggar-cordon" },
            },
            {
              when: { kind: "arcVariant", arcId: "shendiao", key: "act5.wumu-destination", eq: "mongol-copy" },
              then: { type: "goto", nodeId: "mongol-cordon" },
            },
            {
              when: { kind: "arcVariant", arcId: "shendiao", key: "act5.wumu-destination", eq: "player-kept" },
              then: { type: "goto", nodeId: "player-cordon" },
            },
          ],
          else: { type: "goto", nodeId: "open-water" },
        },
      },
      "song-cordon": {
        id: "song-cordon",
        title: "巡江军船",
        text: "两艘宋军巡船停在南湖口，只查兵刃与王府腰牌，不入楼干预江湖争端。完颜洪烈的亲兵因此退到最靠里的码头。",
        autoNext: { type: "goto", nodeId: "yanyu-evidence-table" },
      },
      "beggar-cordon": {
        id: "beggar-cordon",
        title: "丐船封水",
        text: "丐帮分舵的小船散在芦苇间，鲁有脚只要一声竹哨便能封住三处水道。净衣、污衣两派今日都听同一支号令。",
        autoNext: { type: "goto", nodeId: "yanyu-evidence-table" },
      },
      "mongol-cordon": {
        id: "mongol-cordon",
        title: "北地驿骑在岸",
        text: "携兵书节要北上的驿骑正在嘉兴换马，王府亲兵借机指责郭靖私通蒙古。郭靖只把金刀收进鞘中，没有离开证人席。",
        autoNext: { type: "goto", nodeId: "yanyu-evidence-table" },
      },
      "player-cordon": {
        id: "player-cordon",
        title: "兵书仍在你手",
        text: "武穆遗书仍由你保管，王府与白驼山眼线因此同时盯住你的包袱。长案上的血案证物反而暂时少受一层注意。",
        autoNext: { type: "goto", nodeId: "yanyu-evidence-table" },
      },
      "open-water": {
        id: "open-water",
        title: "湖口无人封锁",
        text: "南湖水道没有统一号令，王府快船与白驼蛇舟都留着退路。鲁有脚只能分出少数弟子守住烟雨楼下的证物船。",
        autoNext: { type: "goto", nodeId: "yanyu-evidence-table" },
      },
      "yanyu-evidence-table": {
        id: "yanyu-evidence-table",
        title: "先验哪一项",
        text: "黄蓉请你从现有证物中选一项先验。它不能一次定案，只会决定会局被打断后，哪条证据链已经得到三方共同确认。",
        choices: [
          {
            id: "verify-island-route",
            text: "核对岛图使用痕",
            description: "先证明凶手按外来路线入阵，不是桃花岛门人自由通行。",
            condition: { kind: "hasItem", id: "taohua-route-scratch" },
            consumeDay: true,
            consequences: [
              { kind: "arcVariant", arcId: "shendiao", key: "act6.yanyu-focus", value: "island-route" },
              { kind: "aptitude", delta: 1 },
            ],
            resultText: "丘处机、鲁有脚与黄蓉逐一核对阵石拓痕，确认改动者只知道入口图，不懂桃花阵变化。",
            transition: { type: "goto", nodeId: "yangkang-objects" },
          },
          {
            id: "present-jade-shoe",
            text: "验朱聪留下的翡翠鞋",
            description: "先确认这件随身物属于杨康，也确认朱聪为何临死仍攥着它。",
            condition: { kind: "hasItem", id: "yangkang-jade-shoe" },
            consumeDay: true,
            consequences: [
              { kind: "arcVariant", arcId: "shendiao", key: "act6.yanyu-focus", value: "jade-shoe" },
              { kind: "relation", npcId: "guojing", delta: 2 },
            ],
            resultText: "穆念慈认出翡翠鞋的王府配色，丘处机也见过杨康穿戴。杨康否认鞋从自己身上取下，却没有解释为何缺了一只。",
            transition: { type: "goto", nodeId: "yangkang-objects" },
          },
          {
            id: "read-blood-writing",
            text: "展开韩小莹未完血字",
            description: "让在场者先辨字势、剑痕与落笔方向，再听柯镇恶复述现场声音。",
            condition: { kind: "hasItem", id: "han-xiaoying-blood-writing" },
            consumeDay: true,
            consequences: [
              { kind: "arcVariant", arcId: "shendiao", key: "act6.yanyu-focus", value: "blood-writing" },
              { kind: "relation", npcId: "kezhene", delta: 2 },
            ],
            resultText: "血字末笔指向蛇毒落点，旁边还有九阴爪划过石面的碎屑。柯镇恶承认自己当时没有摸到这处痕迹。",
            transition: { type: "goto", nodeId: "yangkang-objects" },
          },
          {
            id: "compare-baituo-traces",
            text: "对验蛇毒与黄袍丝缕",
            description: "先查黄袍是否真属黄药师，再把岛上蛇毒与白驼山配方并排。",
            condition: {
              kind: "or",
              items: [
                { kind: "hasItem", id: "taohua-snake-venom" },
                { kind: "hasItem", id: "yellow-robe-fiber" },
              ],
            },
            consumeDay: true,
            consequences: [
              { kind: "arcVariant", arcId: "shendiao", key: "act6.yanyu-focus", value: "baituo-traces" },
              { kind: "relation", npcId: "huangrong", delta: 2 },
            ],
            resultText: "黄袍织法不是桃花岛旧制，蛇毒则与白驼玉饰上的残毒相近。欧阳锋仍坐在原位，只让蛇杖从袖口露出半寸。",
            transition: { type: "goto", nodeId: "yangkang-objects" },
          },
          {
            id: "hear-han-xiaoying",
            text: "请韩小莹先复述招式",
            description: "活证可以区分蛤蟆功、九阴爪与桃花岛掌法。",
            condition: { kind: "npcAlive", npcId: "hanxiaoying", alive: true },
            consumeDay: true,
            consequences: [
              { kind: "arcVariant", arcId: "shendiao", key: "act6.yanyu-focus", value: "living-witness" },
              { kind: "relation", npcId: "hanxiaoying", delta: 4 },
            ],
            resultText: "韩小莹把黄袍高手与杨康出招的先后说清，又在长案上画出两人站位。郭靖第一次从师父尸身旁抬头看向杨康。",
            transition: { type: "goto", nodeId: "yangkang-objects" },
          },
          {
            id: "record-oral-testimony",
            text: "只录各方口供",
            description: "若证物不足，先把柯镇恶、黄药师与杨康的话分别记下。",
            consumeDay: true,
            consequences: [
              { kind: "arcVariant", arcId: "shendiao", key: "act6.yanyu-focus", value: "oral-only" },
            ],
            resultText: "三份口供互不相让。柯镇恶坚持箫声与岛路，黄药师不作自辩，杨康则把白驼蛇毒说成桃花岛奇药。",
            transition: { type: "goto", nodeId: "yangkang-objects" },
          },
        ],
      },
      "yangkang-objects": {
        id: "yangkang-objects",
        title: "不许再验",
        text: "杨康按住下一只木匣。杨康：\"拿几片破布、一只鞋，便要定我杀人？今日是江南旧约，不是丐帮私设公堂。\"完颜洪烈身后的亲兵同时向楼梯移动。",
        autoNext: { type: "goto", nodeId: "ouyangfeng-provokes" },
      },
      "ouyangfeng-provokes": {
        id: "ouyangfeng-provokes",
        title: "箫声起处",
        text: "欧阳锋忽然以指节敲出三声短响，湖外蛇舟随即放出毒烟。全真弟子误以为黄药师先动手，剑阵转向窗边；王府亲兵则扑向证人席与验物长案。",
        choices: [
          {
            id: "protect-ke-zhene",
            text: "护住柯镇恶守满三轮",
            description: "保住第一证人的性命，也让他有机会修正亲闻与推断的界线。",
            consumeDay: true,
            transition: {
              type: "battle",
              enemyId: "yanyu-assassins",
              allyIds: ["kezhene", "guojing"],
              objective: {
                kind: "surviveRounds",
                rounds: 3,
                protectAllyId: "kezhene",
                title: "护住柯镇恶完成证言",
              },
              onWin: {
                text: "你与郭靖挡住三轮袭杀，柯镇恶始终没有离开证人席。他听清蛇奴号令与王府亲兵的脚步，也承认这些声音此前不在自己的指认里。",
                consequences: [
                  { kind: "relation", npcId: "kezhene", delta: 8 },
                  { kind: "relation", npcId: "guojing", delta: 4 },
                  { kind: "npcTag", npcId: "kezhene", tag: "烟雨楼证言保全" },
                  { kind: "arcVariant", arcId: "shendiao", key: "act6.yanyu-outcome", value: "witness-secured" },
                ],
                then: { type: "goto", nodeId: "meeting-result" },
              },
              onLose: {
                text: "柯镇恶被暗器击中肩背，你把他从窗边抢回。性命保住了，后半段证言却被毒烟与混战打断。",
                consequences: [
                  { kind: "npcTag", npcId: "kezhene", tag: "烟雨楼证言受损" },
                  { kind: "arcVariant", arcId: "shendiao", key: "act6.yanyu-outcome", value: "witness-wounded" },
                ],
                then: { type: "goto", nodeId: "meeting-result" },
              },
              onFlee: {
                text: "你带柯镇恶退到楼下船舱。证人活着，楼上的口供、封条与各派站位却全部散开。",
                consequences: [
                  { kind: "arcVariant", arcId: "shendiao", key: "act6.yanyu-outcome", value: "meeting-broken" },
                ],
                then: { type: "goto", nodeId: "meeting-result" },
              },
            },
          },
          {
            id: "guard-evidence-boxes",
            text: "守住证物长案三轮",
            description: "让黄蓉与鲁有脚分装证物，你挡住毁匣死士直到封条转移完成。",
            condition: {
              kind: "or",
              items: [
                { kind: "hasItem", id: "yangkang-jade-shoe" },
                { kind: "hasItem", id: "han-xiaoying-blood-writing" },
                { kind: "hasItem", id: "taohua-snake-venom" },
                { kind: "hasItem", id: "yellow-robe-fiber" },
                { kind: "hasItem", id: "taohua-route-scratch" },
              ],
            },
            consumeDay: true,
            transition: {
              type: "battle",
              enemyId: "yanyu-assassins",
              allyIds: ["huangrong", "luyoujiao"],
              objective: {
                kind: "surviveRounds",
                rounds: 3,
                title: "守住证物直到分匣完成",
              },
              onWin: {
                text: "你挡住毁匣死士，黄蓉与鲁有脚把证物分成水陆两路送出。原封条、验物记录与证人画押都保了下来。",
                consequences: [
                  { kind: "relation", npcId: "huangrong", delta: 6 },
                  { kind: "relation", npcId: "luyoujiao", delta: 5 },
                  { kind: "arcVariant", arcId: "shendiao", key: "act6.yanyu-outcome", value: "evidence-secured" },
                ],
                then: { type: "goto", nodeId: "meeting-result" },
              },
              onLose: {
                text: "死士砸毁两只外匣，岛图拓片与黄袍丝缕被火水浸坏。黄蓉仍抢出翡翠鞋、血字和验毒记录。",
                consequences: [
                  { kind: "item", id: "taohua-route-scratch", count: -1 },
                  { kind: "item", id: "yellow-robe-fiber", count: -1 },
                  { kind: "arcVariant", arcId: "shendiao", key: "act6.yanyu-outcome", value: "evidence-damaged" },
                ],
                then: { type: "goto", nodeId: "meeting-result" },
              },
              onFlee: {
                text: "你护着一只木匣退到丐帮船上，其他证物被不同人带走。东西没有全毁，封条次序却已无法当场核清。",
                consequences: [
                  { kind: "arcVariant", arcId: "shendiao", key: "act6.yanyu-outcome", value: "evidence-scattered" },
                ],
                then: { type: "goto", nodeId: "meeting-result" },
              },
            },
          },
          {
            id: "seal-wangfu-exit",
            text: "借外围人手封住王府快船",
            description: "让丐帮或宋军先截退路，逼完颜洪烈与杨康分开撤离。",
            condition: {
              kind: "or",
              items: [
                { kind: "arcVariant", arcId: "shendiao", key: "act5.beggar", eq: "rong-recognized" },
                { kind: "arcVariant", arcId: "shendiao", key: "act5.wumu-destination", eq: "song-command" },
                { kind: "arcVariant", arcId: "shendiao", key: "act5.wumu-destination", eq: "beggar-network" },
              ],
            },
            consumeDay: true,
            transition: {
              type: "battle",
              enemyId: "wangfu-guard",
              allyIds: ["luyoujiao"],
              objective: {
                kind: "surviveRounds",
                rounds: 2,
                title: "封住王府快船两轮",
              },
              onWin: {
                text: "你与鲁有脚守住码头两轮，王府快船无法靠岸。完颜洪烈转上外湖小舟，杨康只能从烟雨楼后窗独自脱身。",
                consequences: [
                  { kind: "factionAttitude", factionId: "beggar", delta: 4 },
                  { kind: "arcVariant", arcId: "shendiao", key: "act6.yanyu-outcome", value: "exits-sealed" },
                ],
                then: { type: "goto", nodeId: "meeting-result" },
              },
              onLose: {
                text: "王府亲兵抢到码头，完颜洪烈先一步上船。杨康没有随船离湖，而是借后巷往嘉兴旧庙方向退走。",
                consequences: [
                  { kind: "arcVariant", arcId: "shendiao", key: "act6.yanyu-outcome", value: "wanyan-escaped" },
                ],
                then: { type: "goto", nodeId: "meeting-result" },
              },
              onFlee: {
                text: "你退出码头封锁，王府快船带走完颜洪烈与大半亲兵。杨康为避开全真弟子，从另一侧小舟离开。",
                consequences: [
                  { kind: "arcVariant", arcId: "shendiao", key: "act6.yanyu-outcome", value: "wanyan-escaped" },
                ],
                then: { type: "goto", nodeId: "meeting-result" },
              },
            },
          },
          {
            id: "protect-han-testimony",
            text: "护住韩小莹复述招式",
            description: "活证比血字更难替换；让她把蛤蟆功与九阴爪站位说完。",
            condition: { kind: "npcAlive", npcId: "hanxiaoying", alive: true },
            consumeDay: true,
            transition: {
              type: "battle",
              enemyId: "yanyu-assassins",
              allyIds: ["hanxiaoying", "kezhene"],
              objective: {
                kind: "surviveRounds",
                rounds: 2,
                protectAllyId: "hanxiaoying",
                title: "护住韩小莹完成复述",
              },
              onWin: {
                text: "你挡住两轮暗器，韩小莹在混战中仍把两名凶手的招式与站位复述完整。柯镇恶也当众承认自己的指认少了这一段。",
                consequences: [
                  { kind: "relation", npcId: "hanxiaoying", delta: 8 },
                  { kind: "relation", npcId: "kezhene", delta: 4 },
                  { kind: "npcTag", npcId: "hanxiaoying", tag: "烟雨楼完整作证" },
                  { kind: "arcVariant", arcId: "shendiao", key: "act6.yanyu-outcome", value: "dual-witness" },
                ],
                then: { type: "goto", nodeId: "meeting-result" },
              },
              onLose: {
                text: "韩小莹旧伤裂开，口供只说到杨康在竹林出爪。你将她护下楼，柯镇恶仍坚持自己听见的箫声。",
                consequences: [
                  { kind: "npcTag", npcId: "hanxiaoying", tag: "烟雨楼作证中断" },
                  { kind: "arcVariant", arcId: "shendiao", key: "act6.yanyu-outcome", value: "witness-wounded" },
                ],
                then: { type: "goto", nodeId: "meeting-result" },
              },
              onFlee: {
                text: "你先把韩小莹送上丐帮船，完整口供未能留在楼中。她与柯镇恶都活着，质询却只能改到铁枪庙继续。",
                consequences: [
                  { kind: "arcVariant", arcId: "shendiao", key: "act6.yanyu-outcome", value: "meeting-broken" },
                ],
                then: { type: "goto", nodeId: "meeting-result" },
              },
            },
          },
          {
            id: "cover-yangkang",
            text: "反向掩护杨康穿过剑阵",
            description: "替他挡住全真门人，保住王府残线，也让烟雨楼质询彻底破局。",
            condition: {
              kind: "or",
              items: [
                { kind: "relation", npcId: "yangkang", gte: 10 },
                { kind: "karma", lte: -20 },
                { kind: "arcVariant", arcId: "shendiao", key: "act6.munianci-outcome", eq: "hidden" },
                { kind: "arcVariant", arcId: "shendiao", key: "act5.ouyangke", eq: "killed-concealed" },
              ],
            },
            consumeDay: true,
            transition: {
              type: "battle",
              enemyId: "quanzhen-blockade",
              allyIds: ["yangkang"],
              objective: {
                kind: "surviveRounds",
                rounds: 2,
                protectAllyId: "yangkang",
                title: "掩护杨康穿过全真剑阵",
              },
              onWin: {
                text: "你替杨康挡住两轮剑阵，他从后窗落上小舟。临走前，他把嘉兴铁枪庙的旧钥匙抛给你，要你独自过去。",
                consequences: [
                  { kind: "karma", delta: -10 },
                  { kind: "relation", npcId: "yangkang", delta: 12 },
                  { kind: "relation", npcId: "guojing", delta: -12 },
                  { kind: "relation", npcId: "huangrong", delta: -10 },
                  { kind: "arcVariant", arcId: "shendiao", key: "act6.yanyu-outcome", value: "yangkang-covered" },
                ],
                then: { type: "goto", nodeId: "meeting-result" },
              },
              onLose: {
                text: "全真剑阵切断你与杨康的位置。杨康肩上中剑，仍撞破后窗逃走；王府亲兵没能跟上他。",
                consequences: [
                  { kind: "relation", npcId: "yangkang", delta: 4 },
                  { kind: "npcTag", npcId: "yangkang", tag: "烟雨楼剑伤" },
                  { kind: "arcVariant", arcId: "shendiao", key: "act6.yanyu-outcome", value: "yangkang-cornered" },
                ],
                then: { type: "goto", nodeId: "meeting-result" },
              },
              onFlee: {
                text: "你没有继续冲阵，杨康独自翻出后窗。全真弟子追到湖边，只捡到一枚指向铁枪庙的旧钥匙。",
                consequences: [
                  { kind: "arcVariant", arcId: "shendiao", key: "act6.yanyu-outcome", value: "meeting-broken" },
                ],
                then: { type: "goto", nodeId: "meeting-result" },
              },
            },
          },
        ],
      },
      "meeting-result": {
        id: "meeting-result",
        title: "会局留下什么",
        text: "毒烟从破窗散去，各派已经分到楼上、码头与湖面。烟雨楼没有完成全部质询，但你保住或放弃的东西已经有了结果。",
        autoNext: {
          type: "branch",
          cases: [
            {
              when: { kind: "arcVariant", arcId: "shendiao", key: "act6.yanyu-outcome", eq: "witness-secured" },
              then: { type: "goto", nodeId: "witness-held" },
            },
            {
              when: { kind: "arcVariant", arcId: "shendiao", key: "act6.yanyu-outcome", eq: "dual-witness" },
              then: { type: "goto", nodeId: "dual-witness-held" },
            },
            {
              when: { kind: "arcVariant", arcId: "shendiao", key: "act6.yanyu-outcome", eq: "evidence-secured" },
              then: { type: "goto", nodeId: "evidence-held" },
            },
            {
              when: { kind: "arcVariant", arcId: "shendiao", key: "act6.yanyu-outcome", eq: "evidence-damaged" },
              then: { type: "goto", nodeId: "evidence-damaged" },
            },
            {
              when: { kind: "arcVariant", arcId: "shendiao", key: "act6.yanyu-outcome", eq: "evidence-scattered" },
              then: { type: "goto", nodeId: "yanyu-evidence-scattered" },
            },
            {
              when: { kind: "arcVariant", arcId: "shendiao", key: "act6.yanyu-outcome", eq: "exits-sealed" },
              then: { type: "goto", nodeId: "exits-held" },
            },
            {
              when: { kind: "arcVariant", arcId: "shendiao", key: "act6.yanyu-outcome", eq: "wanyan-escaped" },
              then: { type: "goto", nodeId: "wanyan-gone" },
            },
            {
              when: { kind: "arcVariant", arcId: "shendiao", key: "act6.yanyu-outcome", eq: "yangkang-covered" },
              then: { type: "goto", nodeId: "covered-retreat" },
            },
            {
              when: { kind: "arcVariant", arcId: "shendiao", key: "act6.yanyu-outcome", eq: "yangkang-cornered" },
              then: { type: "goto", nodeId: "wounded-retreat" },
            },
            {
              when: { kind: "arcVariant", arcId: "shendiao", key: "act6.yanyu-outcome", eq: "witness-wounded" },
              then: { type: "goto", nodeId: "witness-interrupted" },
            },
          ],
          else: { type: "goto", nodeId: "meeting-scattered" },
        },
      },
      "witness-held": {
        id: "witness-held",
        title: "亲闻不是亲见",
        text: "柯镇恶当众重述桃花岛所闻，也承认自己没有看见黄药师出手。郭靖仍要追究师仇，却同意先带证物与杨康到铁枪庙继续问。",
        autoNext: { type: "goto", nodeId: "focus-catalogue" },
      },
      "dual-witness-held": {
        id: "dual-witness-held",
        title: "两份证言并存",
        text: "韩小莹说出蛤蟆功与九阴爪站位，柯镇恶则保留箫声与岛路证言。两份口供不再互相覆盖，杨康也无法只把罪名推给黄药师。",
        autoNext: { type: "goto", nodeId: "focus-catalogue" },
      },
      "evidence-held": {
        id: "evidence-held",
        title: "封条未破",
        text: "证物与验物记录完整送出烟雨楼。丘处机要求杨康到铁枪庙逐项回答，黄药师没有同行，只让黄蓉把黄袍丝缕带走。",
        autoNext: { type: "goto", nodeId: "focus-catalogue" },
      },
      "evidence-damaged": {
        id: "evidence-damaged",
        title: "两项痕迹被毁",
        text: "岛图拓片与黄袍丝缕已经无法验用，翡翠鞋、血字与验毒记录仍在。黄蓉把剩余证物重新编号，要求所有人去铁枪庙补完动机与凶器。",
        autoNext: { type: "goto", nodeId: "focus-catalogue" },
      },
      "yanyu-evidence-scattered": {
        id: "yanyu-evidence-scattered",
        title: "证物分散",
        text: "证物分别落在丐帮、全真与玩家手中，封条次序无法在烟雨楼恢复。要继续质询，只能让三路人同时赶到铁枪庙。",
        autoNext: { type: "goto", nodeId: "focus-catalogue" },
      },
      "exits-held": {
        id: "exits-held",
        title: "王府退路被截",
        text: "完颜洪烈与杨康没能同船离开。杨康独自越过后巷，沿嘉兴旧城墙退向铁枪庙；王府亲兵则被拦在南湖。",
        autoNext: { type: "goto", nodeId: "focus-catalogue" },
      },
      "wanyan-gone": {
        id: "wanyan-gone",
        title: "赵王先走",
        text: "完颜洪烈已经离开南湖，杨康却没有登上王府快船。丘处机沿后巷找到带血脚印，尽头仍是铁枪庙方向。",
        autoNext: { type: "goto", nodeId: "focus-catalogue" },
      },
      "covered-retreat": {
        id: "covered-retreat",
        title: "你替他开路",
        text: "杨康已经借你掩护离开烟雨楼。郭靖、黄蓉与丘处机都看见了你的选择，也都循着小舟靠岸处赶往铁枪庙。",
        autoNext: { type: "goto", nodeId: "focus-catalogue" },
      },
      "wounded-retreat": {
        id: "wounded-retreat",
        title: "带伤离楼",
        text: "杨康肩上带着全真剑伤，无法再回王府快船。他留下的血迹穿过两条后巷，最后消失在铁枪庙外墙。",
        autoNext: { type: "goto", nodeId: "focus-catalogue" },
      },
      "witness-interrupted": {
        id: "witness-interrupted",
        title: "口供未完",
        text: "证人活着，烟雨楼口供却没能录完。黄蓉收起残页，柯镇恶要求到铁枪庙当着杨康与欧阳锋的面重新说一次。",
        autoNext: { type: "goto", nodeId: "focus-catalogue" },
      },
      "meeting-scattered": {
        id: "meeting-scattered",
        title: "各派离楼",
        text: "烟雨楼会局彻底破散，证人、证物与各派人手分乘不同船只离开。唯一一致的去处，是杨康退走的铁枪庙。",
        autoNext: { type: "goto", nodeId: "focus-catalogue" },
      },
      "focus-catalogue": {
        id: "focus-catalogue",
        title: "先验过的一环",
        text: "离开烟雨楼前，黄蓉把本轮已经共同核验的证据另抄一份。铁枪庙不必从头再问，但仍要补齐其余三环。",
        autoNext: {
          type: "branch",
          cases: [
            {
              when: { kind: "arcVariant", arcId: "shendiao", key: "act6.yanyu-focus", eq: "island-route" },
              then: { type: "goto", nodeId: "focus-route-record" },
            },
            {
              when: { kind: "arcVariant", arcId: "shendiao", key: "act6.yanyu-focus", eq: "jade-shoe" },
              then: { type: "goto", nodeId: "focus-jade-record" },
            },
            {
              when: { kind: "arcVariant", arcId: "shendiao", key: "act6.yanyu-focus", eq: "blood-writing" },
              then: { type: "goto", nodeId: "focus-blood-record" },
            },
            {
              when: { kind: "arcVariant", arcId: "shendiao", key: "act6.yanyu-focus", eq: "baituo-traces" },
              then: { type: "goto", nodeId: "focus-baituo-record" },
            },
            {
              when: { kind: "arcVariant", arcId: "shendiao", key: "act6.yanyu-focus", eq: "living-witness" },
              then: { type: "goto", nodeId: "focus-living-record" },
            },
          ],
          else: { type: "goto", nodeId: "focus-oral-record" },
        },
      },
      "focus-route-record": {
        id: "focus-route-record",
        title: "入岛路线已验",
        text: "三方画押的拓痕记录证明凶手凭外来岛图入阵。铁枪庙第一轮只需追问谁把路线交给了杨康与白驼山。",
        autoNext: { type: "goto", nodeId: "iron-temple-trail" },
      },
      "focus-jade-record": {
        id: "focus-jade-record",
        title: "翡翠鞋归属已验",
        text: "穆念慈与丘处机都确认翡翠鞋属于杨康。铁枪庙必须回答朱聪为何能从血案现场取到这件随身物。",
        autoNext: { type: "goto", nodeId: "iron-temple-trail" },
      },
      "focus-blood-record": {
        id: "focus-blood-record",
        title: "未完血字已验",
        text: "血字落笔、剑痕与蛇毒位置已经共同记录。铁枪庙仍要把这份临终证言与凶手招式逐一对应。",
        autoNext: { type: "goto", nodeId: "iron-temple-trail" },
      },
      "focus-baituo-record": {
        id: "focus-baituo-record",
        title: "白驼痕迹已验",
        text: "黄袍织法与蛇毒配方都指向伪装和白驼山。铁枪庙接下来要追问欧阳锋为何替杨康进入桃花岛。",
        autoNext: { type: "goto", nodeId: "iron-temple-trail" },
      },
      "focus-living-record": {
        id: "focus-living-record",
        title: "活证招式已录",
        text: "韩小莹的站位图已经画押，蛤蟆功与九阴爪的先后顺序得以保留。铁枪庙只需让被指认者逐项回应。",
        autoNext: { type: "goto", nodeId: "iron-temple-trail" },
      },
      "focus-oral-record": {
        id: "focus-oral-record",
        title: "只有口供",
        text: "烟雨楼只留下三份相互冲突的口供。铁枪庙仍需从入岛资格、招式、临死取物与杀人动机重新问起。",
        autoNext: { type: "goto", nodeId: "iron-temple-trail" },
      },
      "iron-temple-trail": {
        id: "iron-temple-trail",
        title: "旧钥匙指向铁枪庙",
        text: "湖边捡到的旧钥匙刻着杨家枪纹。证人、证物与王府退路尚未完全并拢，下一轮质询只能在铁枪庙继续。",
        onEnter: [
          { kind: "npcTag", npcId: "yangkang", tag: "逃往铁枪庙" },
          { kind: "arcVariant", arcId: "shendiao", key: "act6.yanyu", value: "cleared" },
        ],
        autoNext: { type: "end" },
      },
    },
  },
  {
    id: "shendiao-tieqiangmiao-act6",
    entryNode: "temple-threshold",
    locationId: "tieqiangmiao",
    weight: 8,
    once: true,
    condition: {
      kind: "and",
      items: [
        { kind: "arcVariant", arcId: "shendiao", key: "act6.yanyu", eq: "cleared" },
        { kind: "not", item: { kind: "arcBeat", arcId: "shendiao", beat: "act6-truth" } },
      ],
    },
    nodes: {
      "temple-threshold": {
        id: "temple-threshold",
        title: "四面封门",
        text: "铁枪庙只点了四盏灯。杨家铁枪斜插在石座旁，杨康站在供桌后，肩上仍带着烟雨楼留下的伤。郭靖守住正门，丘处机与鲁有脚各守一侧，黄蓉把证物匣按入岛、伤痕、遗物与动机分成四处。",
        autoNext: { type: "goto", nodeId: "yanyu-record" },
      },
      "yanyu-record": {
        id: "yanyu-record",
        title: "烟雨楼验过什么",
        text: "黄蓉先展开烟雨楼三方画押的验物记录。已经共同核验的一环不再重问，其余三环仍由你逐项提交。",
        autoNext: {
          type: "branch",
          cases: [
            {
              when: { kind: "arcVariant", arcId: "shendiao", key: "act6.yanyu-focus", eq: "island-route" },
              then: { type: "goto", nodeId: "prior-entry-record" },
            },
            {
              when: {
                kind: "or",
                items: [
                  { kind: "arcVariant", arcId: "shendiao", key: "act6.yanyu-focus", eq: "blood-writing" },
                  { kind: "arcVariant", arcId: "shendiao", key: "act6.yanyu-focus", eq: "living-witness" },
                ],
              },
              then: { type: "goto", nodeId: "prior-martial-record" },
            },
            {
              when: { kind: "arcVariant", arcId: "shendiao", key: "act6.yanyu-focus", eq: "jade-shoe" },
              then: { type: "goto", nodeId: "prior-token-record" },
            },
            {
              when: {
                kind: "and",
                items: [
                  { kind: "arcVariant", arcId: "shendiao", key: "act6.yanyu-focus", eq: "baituo-traces" },
                  { kind: "npcAlive", npcId: "ouyangke", alive: false },
                ],
              },
              then: { type: "goto", nodeId: "prior-motive-record" },
            },
            {
              when: { kind: "arcVariant", arcId: "shendiao", key: "act6.yanyu-focus", eq: "baituo-traces" },
              then: { type: "goto", nodeId: "prior-motive-partial" },
            },
          ],
          else: { type: "goto", nodeId: "prior-oral-record" },
        },
      },
      "prior-entry-record": {
        id: "prior-entry-record",
        title: "第一环已有画押",
        text: "岛图拓痕已经证明凶手按外来路线入阵，不是桃花岛门人自由开路。第一轮直接采用烟雨楼记录。",
        onEnter: [
          { kind: "arcVariant", arcId: "shendiao", key: "act6.truth-entry", value: "proven" },
        ],
        autoNext: { type: "goto", nodeId: "truth-entry-gate" },
      },
      "prior-martial-record": {
        id: "prior-martial-record",
        title: "第二环已有画押",
        text: "韩小莹的站位图或未完血字已经验明九阴爪与蛤蟆功的先后。第二轮直接采用烟雨楼记录。",
        onEnter: [
          { kind: "arcVariant", arcId: "shendiao", key: "act6.truth-martial", value: "proven" },
        ],
        autoNext: { type: "goto", nodeId: "truth-entry-gate" },
      },
      "prior-token-record": {
        id: "prior-token-record",
        title: "第三环已有画押",
        text: "穆念慈与丘处机已经确认翡翠鞋属于杨康。朱聪临死取走的物件不再重验。",
        onEnter: [
          { kind: "arcVariant", arcId: "shendiao", key: "act6.truth-token", value: "proven" },
        ],
        autoNext: { type: "goto", nodeId: "truth-entry-gate" },
      },
      "prior-motive-record": {
        id: "prior-motive-record",
        title: "第四环已有画押",
        text: "黄袍织法、白驼蛇毒与欧阳克死讯已经共同验明。欧阳锋替侄儿报仇，杨康借他的武功灭口，两人的行动在这一环并拢。",
        onEnter: [
          { kind: "arcVariant", arcId: "shendiao", key: "act6.truth-motive", value: "proven" },
        ],
        autoNext: { type: "goto", nodeId: "truth-entry-gate" },
      },
      "prior-motive-partial": {
        id: "prior-motive-partial",
        title: "白驼痕迹已验，死因待核",
        text: "黄袍织法与白驼蛇毒已经共同验明，欧阳克却仍活着离开破庙。第四轮不能沿用报仇结论，仍需重问双方为何合作。",
        onEnter: [
          { kind: "arcVariant", arcId: "shendiao", key: "act6.truth-motive", value: "partial" },
        ],
        autoNext: { type: "goto", nodeId: "truth-entry-gate" },
      },
      "prior-oral-record": {
        id: "prior-oral-record",
        title: "只有三份口供",
        text: "烟雨楼只留下互相冲突的口供，没有哪一环获得共同画押。四轮都要重新核对。",
        autoNext: { type: "goto", nodeId: "truth-entry-gate" },
      },
      "truth-entry-gate": {
        id: "truth-entry-gate",
        title: "第一轮·谁能入岛",
        text: "桃花阵不会替外人自行让路。第一轮只问凶手如何进入桃花岛。",
        autoNext: {
          type: "branch",
          cases: [
            {
              when: { kind: "arcVariant", arcId: "shendiao", key: "act6.truth-entry", eq: "proven" },
              then: { type: "goto", nodeId: "truth-entry-accepted" },
            },
          ],
          else: { type: "goto", nodeId: "truth-entry-question" },
        },
      },
      "truth-entry-accepted": {
        id: "truth-entry-accepted",
        title: "外来路线成立",
        text: "丘处机把烟雨楼画押压在第一盏灯下。杨康没有否认自己见过岛图，只说图不是从他手里送到白驼山。",
        autoNext: { type: "goto", nodeId: "truth-martial-gate" },
      },
      "truth-entry-question": {
        id: "truth-entry-question",
        title: "提交入岛证据",
        text: "黄蓉把桃花阵外圈图铺在地上。你可以提交拓痕、指出路线矛盾，也可以把嫌疑重新推回桃花岛旧门。",
        choices: [
          {
            id: "submit-route-scratch",
            text: "提交岛图使用痕",
            description: "石记改动证明入阵者只懂一张旧图，不懂阵势变化。",
            condition: { kind: "hasItem", id: "taohua-route-scratch" },
            consumeDay: true,
            consequences: [
              { kind: "arcVariant", arcId: "shendiao", key: "act6.truth-entry", value: "proven" },
              { kind: "relation", npcId: "huangrong", delta: 3 },
            ],
            resultText: "你把阵石拓痕逐处对上外圈图。改图者依赖固定路线，遇到黄蓉后来改过的两处转折便留下反复试路的刮痕。",
            transition: { type: "goto", nodeId: "truth-martial-gate" },
          },
          {
            id: "rebuild-island-route",
            text: "复原此前登岛路线",
            description: "用自己见过的正港、侧港或白驼船路说明外人如何接触岛图。",
            condition: {
              kind: "or",
              items: [
                { kind: "arcVariant", arcId: "shendiao", key: "act4.taohua-route", eq: "guo-huang" },
                { kind: "arcVariant", arcId: "shendiao", key: "act4.taohua-route", eq: "old-gate" },
                { kind: "arcVariant", arcId: "shendiao", key: "act4.taohua-route", eq: "white-camel" },
                { kind: "arcVariant", arcId: "shendiao", key: "act4.taohua-route", eq: "independent" },
              ],
            },
            consumeDay: true,
            consequences: [
              { kind: "arcVariant", arcId: "shendiao", key: "act6.truth-entry", value: "partial" },
              { kind: "aptitude", delta: 1 },
            ],
            resultText: "你复原几次登岛船路，证明王府与白驼山都有机会接触入口图。缺少阵石拓痕，这一轮只能锁定路线来源，不能锁定交图之人。",
            transition: { type: "goto", nodeId: "truth-martial-gate" },
          },
          {
            id: "record-entry-doubt",
            text: "只指出外人可能持图",
            description: "证物不足时保留疑点，不把推断当成已经验明的事实。",
            consumeDay: true,
            consequences: [
              { kind: "arcVariant", arcId: "shendiao", key: "act6.truth-entry", value: "partial" },
            ],
            resultText: "鲁有脚把这一环记为待核：外人可以凭图入阵，但现有记录无法说明图从何处流出。",
            transition: { type: "goto", nodeId: "truth-martial-gate" },
          },
          {
            id: "blame-taohua-gate",
            text: "坚持是桃花岛门人开阵",
            description: "故意忽略外圈试路痕迹，把入岛资格重新指向黄药师旧门。",
            consumeDay: true,
            consequences: [
              { kind: "karma", delta: -4 },
              { kind: "relation", npcId: "huangrong", delta: -7 },
              { kind: "arcVariant", arcId: "shendiao", key: "act6.truth-entry", value: "misled" },
            ],
            resultText: "你把路线解释成桃花岛旧门接应。黄蓉立即指出三处阵石转向相反，杨康却接过你的说法，要求先查陆乘风与梅超风。",
            transition: { type: "goto", nodeId: "truth-martial-gate" },
          },
        ],
      },
      "truth-martial-gate": {
        id: "truth-martial-gate",
        title: "第二轮·谁会九阴爪",
        text: "第二盏灯照着尸身验伤抄件。箫声只能证明黄药师曾在附近，爪孔、蛇毒与站位才说明谁真正出手。",
        autoNext: {
          type: "branch",
          cases: [
            {
              when: { kind: "arcVariant", arcId: "shendiao", key: "act6.truth-martial", eq: "proven" },
              then: { type: "goto", nodeId: "truth-martial-accepted" },
            },
          ],
          else: { type: "goto", nodeId: "truth-martial-question" },
        },
      },
      "truth-martial-accepted": {
        id: "truth-martial-accepted",
        title: "两种武功已经分开",
        text: "验伤记录将九阴爪与蛤蟆功分在两列。黄药师没有使用这两门武功，杨康与欧阳锋却都无法否认。",
        autoNext: { type: "goto", nodeId: "truth-token-gate" },
      },
      "truth-martial-question": {
        id: "truth-martial-question",
        title: "提交伤痕证据",
        text: "柯镇恶先复述箫声，韩小莹若仍在场则补充所见。你必须决定哪些是亲见，哪些只是推断。",
        choices: [
          {
            id: "call-han-xiaoying",
            text: "请韩小莹重画站位",
            description: "活证能把九阴爪、蛤蟆功与黄药师掌法分开。",
            condition: {
              kind: "and",
              items: [
                { kind: "npcAlive", npcId: "hanxiaoying", alive: true },
                { kind: "arcVariant", arcId: "shendiao", key: "act6.island-outcome", eq: "xiaoying-saved" },
              ],
            },
            consumeDay: true,
            consequences: [
              { kind: "arcVariant", arcId: "shendiao", key: "act6.truth-martial", value: "proven" },
              { kind: "relation", npcId: "hanxiaoying", delta: 4 },
              { kind: "relation", npcId: "kezhene", delta: 2 },
            ],
            resultText: "韩小莹以剑鞘画出两名凶手的位置：杨康近身出爪，黄袍人从外侧以蛤蟆功封路。柯镇恶把自己只听见的箫声单列在旁。",
            transition: { type: "goto", nodeId: "truth-token-gate" },
          },
          {
            id: "match-blood-and-venom",
            text: "对验血字、爪痕与蛇毒",
            description: "临终血字与现场残痕可以替代缺席的活证。",
            condition: {
              kind: "and",
              items: [
                { kind: "hasItem", id: "han-xiaoying-blood-writing" },
                {
                  kind: "or",
                  items: [
                    { kind: "hasItem", id: "taohua-snake-venom" },
                    { kind: "hasItem", id: "yellow-robe-fiber" },
                  ],
                },
              ],
            },
            consumeDay: true,
            consequences: [
              { kind: "arcVariant", arcId: "shendiao", key: "act6.truth-martial", value: "proven" },
              { kind: "relation", npcId: "guojing", delta: 3 },
            ],
            resultText: "血字末笔落在蛇毒旁，爪孔则从另一方向切入。两名凶手的招式与站位由三处痕迹互相印证。",
            transition: { type: "goto", nodeId: "truth-token-gate" },
          },
          {
            id: "separate-sound-and-wound",
            text: "把箫声与伤痕分开记录",
            description: "至少纠正柯镇恶把亲闻直接当成亲见的错误。",
            consumeDay: true,
            consequences: [
              { kind: "arcVariant", arcId: "shendiao", key: "act6.truth-martial", value: "partial" },
              { kind: "relation", npcId: "kezhene", delta: 2 },
            ],
            resultText: "柯镇恶承认自己没有看见黄药师出掌。没有活证或完整验物，这一轮只能排除一部分指认，仍不足以锁定两名凶手。",
            transition: { type: "goto", nodeId: "truth-token-gate" },
          },
          {
            id: "reuse-flute-accusation",
            text: "继续以箫声指认黄药师",
            description: "故意把亲闻当成亲见，掩去九阴爪与蛇毒的方向差异。",
            consumeDay: true,
            consequences: [
              { kind: "karma", delta: -4 },
              { kind: "relation", npcId: "guojing", delta: -6 },
              { kind: "relation", npcId: "huangrong", delta: -8 },
              { kind: "arcVariant", arcId: "shendiao", key: "act6.truth-martial", value: "misled" },
            ],
            resultText: "你把箫声放在验伤之前。杨康立即要求黄药师先自证，黄蓉则把爪孔拓片压在你面前，不肯让第二轮就此结案。",
            transition: { type: "goto", nodeId: "truth-token-gate" },
          },
        ],
      },
      "truth-token-gate": {
        id: "truth-token-gate",
        title: "第三轮·朱聪取走什么",
        text: "第三盏灯下只有朱聪临死时蜷起的手势记录。妙手书生不会无故在凶手身上抓取一件东西。",
        autoNext: {
          type: "branch",
          cases: [
            {
              when: { kind: "arcVariant", arcId: "shendiao", key: "act6.truth-token", eq: "proven" },
              then: { type: "goto", nodeId: "truth-token-accepted" },
            },
          ],
          else: { type: "goto", nodeId: "truth-token-question" },
        },
      },
      "truth-token-accepted": {
        id: "truth-token-accepted",
        title: "翡翠鞋归属成立",
        text: "丘处机与穆念慈的画押都在。杨康脚上只剩一只同式翡翠鞋，无法再把朱聪取得的物件说成桃花岛旧物。",
        autoNext: { type: "goto", nodeId: "truth-motive-gate" },
      },
      "truth-token-question": {
        id: "truth-token-question",
        title: "提交临死遗物",
        text: "黄蓉请你说明朱聪为何在重伤时仍要伸手，以及他从谁身上取到了什么。",
        choices: [
          {
            id: "present-jade-shoe-again",
            text: "摆出翡翠鞋",
            description: "鞋上王府配色、桃花岛泥沙与杨康缺失的另一只可以互相印证。",
            condition: { kind: "hasItem", id: "yangkang-jade-shoe" },
            consumeDay: true,
            consequences: [
              { kind: "arcVariant", arcId: "shendiao", key: "act6.truth-token", value: "proven" },
              { kind: "relation", npcId: "guojing", delta: 3 },
            ],
            resultText: "你把翡翠鞋放在铁枪旁。丘处机认出王府所制，穆念慈认出杨康曾穿，鞋底泥沙则来自桃花岛竹林。",
            transition: { type: "goto", nodeId: "truth-motive-gate" },
          },
          {
            id: "reconstruct-zhucong-hand",
            text: "按朱聪手势复原取物",
            description: "没有实物时，只能证明他曾从近身凶手身上扯下一件随身物。",
            consumeDay: true,
            consequences: [
              { kind: "arcVariant", arcId: "shendiao", key: "act6.truth-token", value: "partial" },
              { kind: "aptitude", delta: 1 },
            ],
            resultText: "你按验尸记录复原朱聪最后一次伸手，确认他抓到近身凶手的衣摆或鞋履。实物不在，这一轮无法完成归属。",
            transition: { type: "goto", nodeId: "truth-motive-gate" },
          },
          {
            id: "hide-jade-shoe",
            text: "收起翡翠鞋不让验看",
            description: "故意让朱聪取得的物件失去归属，为杨康留下否认空间。",
            condition: { kind: "hasItem", id: "yangkang-jade-shoe" },
            consumeDay: true,
            consequences: [
              { kind: "karma", delta: -5 },
              { kind: "relation", npcId: "yangkang", delta: 6 },
              { kind: "relation", npcId: "huangrong", delta: -8 },
              { kind: "arcVariant", arcId: "shendiao", key: "act6.truth-token", value: "misled" },
            ],
            resultText: "你只复述朱聪伸手，没有打开木匣。杨康随即否认现场遗物属于自己，丘处机则记下你拒绝验物。",
            transition: { type: "goto", nodeId: "truth-motive-gate" },
          },
          {
            id: "claim-yellow-fabric-token",
            text: "改称朱聪抓到黄袍碎片",
            description: "把临死取物与黄袍伪装混在一起，重新制造对黄药师的嫌疑。",
            consumeDay: true,
            consequences: [
              { kind: "karma", delta: -4 },
              { kind: "relation", npcId: "kezhene", delta: -4 },
              { kind: "arcVariant", arcId: "shendiao", key: "act6.truth-token", value: "misled" },
            ],
            resultText: "你把两件证物说成同一件。黄蓉当场指出丝缕发现于礁石，不在朱聪手中；柯镇恶没有接过你的结论。",
            transition: { type: "goto", nodeId: "truth-motive-gate" },
          },
        ],
      },
      "truth-motive-gate": {
        id: "truth-motive-gate",
        title: "第四轮·谁要替欧阳克报仇",
        text: "最后一盏灯照着白驼玉饰与破庙记录。欧阳克的死因决定欧阳锋为何出现在桃花岛，也决定杨康为何要把罪名推给黄药师。",
        autoNext: {
          type: "branch",
          cases: [
            {
              when: { kind: "arcVariant", arcId: "shendiao", key: "act6.truth-motive", eq: "proven" },
              then: { type: "goto", nodeId: "truth-motive-accepted" },
            },
          ],
          else: { type: "goto", nodeId: "truth-motive-question" },
        },
      },
      "truth-motive-accepted": {
        id: "truth-motive-accepted",
        title: "白驼与王府互相借力",
        text: "烟雨楼已经验明黄袍伪装与蛇毒来源。欧阳锋替侄儿报仇，杨康则借他的武功灭口并嫁祸，两人的行动在这一环并拢。",
        autoNext: { type: "goto", nodeId: "truth-tally" },
      },
      "truth-motive-question": {
        id: "truth-motive-question",
        title: "提交欧阳克案",
        text: "穆念慈此前是否看过破庙证物、欧阳克是否活着离开，都会改变这一轮能证明到哪一步。",
        choices: [
          {
            id: "present-ouyangke-shard",
            text: "对验白驼玉饰残片",
            description: "短枪铁锈与后补蛇毒能证明杨康杀人，并制造白驼山报复桃花岛的动机。",
            condition: {
              kind: "and",
              items: [
                { kind: "hasItem", id: "ouyangke-jade-shard" },
                { kind: "npcAlive", npcId: "ouyangke", alive: false },
              ],
            },
            consumeDay: true,
            consequences: [
              { kind: "arcVariant", arcId: "shendiao", key: "act6.truth-motive", value: "proven" },
              { kind: "relation", npcId: "munianci", delta: 3 },
              { kind: "relation", npcId: "huangrong", delta: 3 },
            ],
            resultText: "玉饰裂口的短枪铁锈在前，蛇毒渗入在后。杨康先杀欧阳克，再补毒嫁祸；欧阳锋因此与他一同进入桃花岛。",
            transition: { type: "goto", nodeId: "truth-tally" },
          },
          {
            id: "call-munianci-record",
            text: "请穆念慈复述破庙验物",
            description: "她若亲自看过玉饰或听过完整证言，可以证明杨康不是被人逼迫行凶。",
            condition: {
              kind: "or",
              items: [
                { kind: "arcVariant", arcId: "shendiao", key: "act6.munianci-evidence", eq: "material" },
                { kind: "arcVariant", arcId: "shendiao", key: "act6.munianci-evidence", eq: "eyewitness" },
              ],
            },
            consumeDay: true,
            consequences: [
              { kind: "arcVariant", arcId: "shendiao", key: "act6.truth-motive", value: "proven" },
              { kind: "relation", npcId: "munianci", delta: 4 },
            ],
            resultText: "穆念慈只说自己亲眼看过或亲耳确认的部分：短枪、补毒与清理现场都由杨康主动完成，没有人替他握枪。",
            transition: { type: "goto", nodeId: "truth-tally" },
          },
          {
            id: "record-attempted-murder",
            text: "记录欧阳克负伤逃走",
            description: "没有死亡便没有报仇动机，但杨康的杀意与白驼合作仍可保留。",
            condition: { kind: "arcVariant", arcId: "shendiao", key: "act5.ouyangke", eq: "survived-wounded" },
            consumeDay: true,
            consequences: [
              { kind: "arcVariant", arcId: "shendiao", key: "act6.truth-motive", value: "partial" },
            ],
            resultText: "欧阳克活着离开破庙，欧阳锋便不是为侄儿之死报仇。这一路仍能证明杨康曾下杀手，却不能沿用原来的动机链。",
            transition: { type: "goto", nodeId: "truth-tally" },
          },
          {
            id: "record-motive-doubt",
            text: "只记录王府与白驼合作",
            description: "证物不足时保留势力合作，不强行补全欧阳锋的私仇。",
            consumeDay: true,
            consequences: [
              { kind: "arcVariant", arcId: "shendiao", key: "act6.truth-motive", value: "partial" },
            ],
            resultText: "王府与白驼山互通船路已经成立，欧阳克案却缺少可核实的凶器或见证。这一轮记为部分成立。",
            transition: { type: "goto", nodeId: "truth-tally" },
          },
          {
            id: "blame-old-taohua-feud",
            text: "把动机改成桃花岛旧怨",
            description: "故意掩去欧阳克案，把白驼山入岛说成五绝旧争。",
            consumeDay: true,
            consequences: [
              { kind: "karma", delta: -5 },
              { kind: "relation", npcId: "yangkang", delta: 5 },
              { kind: "relation", npcId: "munianci", delta: -8 },
              { kind: "arcVariant", arcId: "shendiao", key: "act6.truth-motive", value: "misled" },
            ],
            resultText: "你把欧阳克案从记录中抽走，只谈东邪西毒旧怨。穆念慈当场问起破庙短枪，杨康却要求鲁有脚先封存她的证言。",
            transition: { type: "goto", nodeId: "truth-tally" },
          },
        ],
      },
      "truth-tally": {
        id: "truth-tally",
        title: "四轮合卷",
        text: "黄蓉没有替任何人补完缺口。四轮结论按已证、待核与误导分列，能否闭合取决于你刚才真正提交的内容。",
        autoNext: {
          type: "branch",
          cases: [
            {
              when: {
                kind: "and",
                items: [
                  { kind: "arcVariant", arcId: "shendiao", key: "act6.truth-entry", eq: "proven" },
                  { kind: "arcVariant", arcId: "shendiao", key: "act6.truth-martial", eq: "proven" },
                  { kind: "arcVariant", arcId: "shendiao", key: "act6.truth-token", eq: "proven" },
                  { kind: "arcVariant", arcId: "shendiao", key: "act6.truth-motive", eq: "proven" },
                ],
              },
              then: { type: "goto", nodeId: "truth-complete" },
            },
            {
              when: {
                kind: "or",
                items: [
                  { kind: "arcVariant", arcId: "shendiao", key: "act6.truth-entry", eq: "misled" },
                  { kind: "arcVariant", arcId: "shendiao", key: "act6.truth-martial", eq: "misled" },
                  { kind: "arcVariant", arcId: "shendiao", key: "act6.truth-token", eq: "misled" },
                  { kind: "arcVariant", arcId: "shendiao", key: "act6.truth-motive", eq: "misled" },
                ],
              },
              then: { type: "goto", nodeId: "truth-corrupted" },
            },
          ],
          else: { type: "goto", nodeId: "truth-partial" },
        },
      },
      "truth-complete": {
        id: "truth-complete",
        title: "证据链闭合",
        text: "外来岛图、九阴爪与蛤蟆功、朱聪取走的翡翠鞋、欧阳克案留下的动机互相扣合。郭靖收回对黄药师的指认，柯镇恶也把铁杖横放在膝前。杨康没有再说证物是伪造，只盯着庙后暗门。",
        onEnter: [
          { kind: "arcVariant", arcId: "shendiao", key: "act6.truth-strength", value: "complete" },
          { kind: "npcTag", npcId: "huangyaoshi-npc", tag: "桃花岛血案嫌疑洗清" },
          { kind: "relation", npcId: "huangrong", delta: 6 },
          { kind: "relation", npcId: "guojing", delta: 4 },
        ],
        autoNext: { type: "goto", nodeId: "yangkang-verdict" },
      },
      "truth-partial": {
        id: "truth-partial",
        title: "主线成立，缺口仍在",
        text: "四轮中至少一环只有推断。黄药师不再是唯一嫌疑，杨康与欧阳锋的行动也被放进同一条线上，但缺失证物仍会影响如何处置杨康。",
        onEnter: [
          { kind: "arcVariant", arcId: "shendiao", key: "act6.truth-strength", value: "partial" },
          { kind: "relation", npcId: "huangrong", delta: 2 },
        ],
        autoNext: { type: "goto", nodeId: "yangkang-verdict" },
      },
      "truth-corrupted": {
        id: "truth-corrupted",
        title: "记录互相冲突",
        text: "你提交的说法与验物记录发生冲突。黄蓉无法让四轮闭合，杨康则抓住这些矛盾，要求立即离庙。郭靖没有替任何一方让开门。",
        onEnter: [
          { kind: "arcVariant", arcId: "shendiao", key: "act6.truth-strength", value: "corrupted" },
          { kind: "relation", npcId: "guojing", delta: -5 },
          { kind: "relation", npcId: "huangrong", delta: -5 },
        ],
        autoNext: { type: "goto", nodeId: "yangkang-verdict" },
      },
      "yangkang-verdict": {
        id: "yangkang-verdict",
        title: "他再次选择",
        text: "杨康突然掀翻第四盏灯，左手五指直取黄蓉。软猬甲上仍留着白驼蛇毒，正门与暗门也在同一刻有人逼近。你只能先决定眼前这一招如何收场。",
        choices: [
          {
            id: "let-munianci-ask",
            text: "让穆念慈问完最后一句",
            description: "只有证据完整、退路已失且玩家从未替杨康毁证时，他才可能承担一次自己的后果。",
            condition: {
              kind: "and",
              items: [
                { kind: "arcVariant", arcId: "shendiao", key: "act6.truth-strength", eq: "complete" },
                { kind: "arcVariant", arcId: "shendiao", key: "act6.munianci-outcome", eq: "broken" },
                {
                  kind: "or",
                  items: [
                    { kind: "arcVariant", arcId: "shendiao", key: "act6.yanyu-outcome", eq: "exits-sealed" },
                    { kind: "arcVariant", arcId: "shendiao", key: "act6.yanyu-outcome", eq: "wanyan-escaped" },
                  ],
                },
                { kind: "not", item: { kind: "arcVariant", arcId: "shendiao", key: "act5.ouyangke", eq: "killed-concealed" } },
                { kind: "not", item: { kind: "arcVariant", arcId: "shendiao", key: "act6.yanyu-outcome", eq: "yangkang-covered" } },
                { kind: "not", item: { kind: "flag", name: "shendiao.zhongdu.yangkang-choice", eq: "return-palace" } },
              ],
            },
            consumeDay: true,
            resultText: "你扣住杨康手腕，没有替他回答。穆念慈只问破庙与桃花岛两件事。庙外没有王府接应，供桌上四轮证据也没有缺口。",
            transition: { type: "goto", nodeId: "verdict-confessed" },
          },
          {
            id: "bind-for-trial",
            text: "与郭靖合力擒住杨康",
            description: "完整证据与封死的王府退路，可以把裁决从私斗转成交付审理。",
            condition: {
              kind: "and",
              items: [
                { kind: "arcVariant", arcId: "shendiao", key: "act6.truth-strength", eq: "complete" },
                { kind: "arcVariant", arcId: "shendiao", key: "act6.yanyu-outcome", eq: "exits-sealed" },
              ],
            },
            consumeDay: true,
            resultText: "你架开九阴爪，郭靖随即锁住杨康右臂。丘处机卸下他的短枪，鲁有脚把四卷画押分别交给全真与丐帮保管。",
            transition: { type: "goto", nodeId: "verdict-captured" },
          },
          {
            id: "shield-huangrong",
            text: "护住黄蓉，不替他挡回毒掌",
            description: "阻止他杀人，但不再替他承担软猬甲与蛇毒造成的后果。",
            consumeDay: true,
            resultText: "你将黄蓉护在身后。杨康强行变爪，掌心仍擦过软猬甲尖刺，残留蛇毒沿伤口迅速发黑。",
            transition: { type: "goto", nodeId: "verdict-dead" },
          },
          {
            id: "pull-yangkang-clear",
            text: "在触甲前拉开杨康",
            description: "救下他的性命，却不替他拦住随后追来的全真与丐帮。",
            consumeDay: true,
            resultText: "你扯住杨康手肘，让五指偏开软猬甲。丘处机的剑锋同时划过他肩背，他撞破后窗，带伤跃入庙后雨巷。",
            transition: { type: "goto", nodeId: "verdict-escaped" },
          },
          {
            id: "open-back-route",
            text: "灭灯替杨康打开后路",
            description: "延续此前包庇或误导，主动挡住追兵并替他带走关键记录。",
            condition: {
              kind: "or",
              items: [
                { kind: "arcVariant", arcId: "shendiao", key: "act6.truth-strength", eq: "corrupted" },
                { kind: "arcVariant", arcId: "shendiao", key: "act6.yanyu-outcome", eq: "yangkang-covered" },
                { kind: "arcVariant", arcId: "shendiao", key: "act5.ouyangke", eq: "killed-concealed" },
                { kind: "relation", npcId: "yangkang", gte: 20 },
                { kind: "karma", lte: -20 },
                { kind: "flag", name: "shendiao.zhongdu.yangkang-choice", eq: "return-palace" },
              ],
            },
            consumeDay: true,
            resultText: "你踢灭余下三盏灯，抽走暗门门闩，又把追来的郭靖挡在供桌外。杨康抓起一卷验物记录，从庙后离开。",
            transition: { type: "goto", nodeId: "verdict-aided" },
          },
        ],
      },
      "verdict-dead": {
        id: "verdict-dead",
        title: "蛇毒入掌",
        text: "杨康退到铁枪旁，掌心黑线已经越过手腕。他仍要去抓最后一卷证词，没有求饶，也没有改口。片刻后短枪落地，他倒在杨家铁枪前。",
        onEnter: [
          { kind: "arcVariant", arcId: "shendiao", key: "act6.yangkang-verdict", value: "dead" },
          { kind: "npcAlive", npcId: "yangkang", alive: false },
          { kind: "npcTag", npcId: "yangkang", tag: "铁枪庙毒发身亡" },
          { kind: "relation", npcId: "guojing", delta: 4 },
          { kind: "relation", npcId: "huangrong", delta: 4 },
        ],
        autoNext: { type: "goto", nodeId: "verdict-aftermath" },
      },
      "verdict-escaped": {
        id: "verdict-escaped",
        title: "负伤遁走",
        text: "杨康避开蛇毒，却被全真剑锋伤了肩背。他没有接受你的同行，也没有回头解释，独自沿雨巷离开嘉兴。",
        onEnter: [
          { kind: "arcVariant", arcId: "shendiao", key: "act6.yangkang-verdict", value: "escaped" },
          { kind: "npcAlive", npcId: "yangkang", alive: true },
          { kind: "npcTag", npcId: "yangkang", tag: "铁枪庙负伤遁走" },
          { kind: "karma", delta: -3 },
          { kind: "relation", npcId: "yangkang", delta: 5 },
          { kind: "relation", npcId: "guojing", delta: -4 },
        ],
        autoNext: { type: "goto", nodeId: "verdict-aftermath" },
      },
      "verdict-captured": {
        id: "verdict-captured",
        title: "共同看押",
        text: "杨康被卸去短枪与王府腰牌。丘处机不许全真弟子当场报仇，鲁有脚也不许丐帮私刑。两方各持一份画押，先把他押往嘉兴分舵待审。",
        onEnter: [
          { kind: "arcVariant", arcId: "shendiao", key: "act6.yangkang-verdict", value: "captured" },
          { kind: "npcAlive", npcId: "yangkang", alive: true },
          { kind: "npcTag", npcId: "yangkang", tag: "铁枪庙被捕待审" },
          { kind: "relation", npcId: "guojing", delta: 7 },
          { kind: "relation", npcId: "huangrong", delta: 5 },
          { kind: "factionAttitude", factionId: "quanzhen", delta: 5 },
          { kind: "factionAttitude", factionId: "beggar", delta: 5 },
        ],
        autoNext: { type: "goto", nodeId: "verdict-aftermath" },
      },
      "verdict-confessed": {
        id: "verdict-confessed",
        title: "只认亲手所做",
        text: "杨康看过空着的暗门与四卷画押，终于承认破庙短枪和桃花岛九阴爪都出自自己。他没有认回杨姓，也没有求穆念慈原谅，只把白驼信符放到供桌上，接受全真与丐帮共同看押。",
        onEnter: [
          { kind: "arcVariant", arcId: "shendiao", key: "act6.yangkang-verdict", value: "confessed" },
          { kind: "npcAlive", npcId: "yangkang", alive: true },
          { kind: "npcTag", npcId: "yangkang", tag: "铁枪庙有限认罪" },
          { kind: "npcTag", npcId: "yangkang", tag: "由全真丐帮共同看押" },
          { kind: "relation", npcId: "munianci", delta: 2 },
          { kind: "relation", npcId: "guojing", delta: 6 },
          { kind: "relation", npcId: "huangrong", delta: 5 },
          { kind: "reputation", delta: 6 },
        ],
        autoNext: { type: "goto", nodeId: "verdict-aftermath" },
      },
      "verdict-aided": {
        id: "verdict-aided",
        title: "你替他带走一卷",
        text: "杨康从暗门离开时带走了第三轮验物记录。你挡住郭靖与丘处机，直到庙后马蹄声越过旧城墙。留下的人都看见是谁替他开的门。",
        onEnter: [
          { kind: "arcVariant", arcId: "shendiao", key: "act6.yangkang-verdict", value: "aided" },
          { kind: "npcAlive", npcId: "yangkang", alive: true },
          { kind: "npcTag", npcId: "yangkang", tag: "由玩家助逃铁枪庙" },
          { kind: "npcTag", npcId: "guojing", tag: "因铁枪庙助逃与玩家决裂" },
          { kind: "npcTag", npcId: "huangrong", tag: "因铁枪庙助逃与玩家决裂" },
          { kind: "npcRelationType", npcId: "guojing", relationType: "仇敌" },
          { kind: "npcRelationType", npcId: "huangrong", relationType: "仇敌" },
          { kind: "karma", delta: -15 },
          { kind: "relation", npcId: "yangkang", delta: 20 },
          { kind: "relation", npcId: "guojing", delta: -30 },
          { kind: "relation", npcId: "huangrong", delta: -30 },
          { kind: "relation", npcId: "kezhene", delta: -25 },
          { kind: "relation", npcId: "munianci", delta: -25 },
        ],
        autoNext: { type: "goto", nodeId: "verdict-aftermath" },
      },
      "verdict-aftermath": {
        id: "verdict-aftermath",
        title: "裁决已定",
        text: "铁枪庙内重新点起一盏灯。杨康的去向已经确定，留下的人开始处理证词、尸身或追捕文书。",
        autoNext: {
          type: "branch",
          cases: [
            {
              when: { kind: "arcVariant", arcId: "shendiao", key: "act6.yangkang-verdict", eq: "dead" },
              then: { type: "goto", nodeId: "aftermath-dead" },
            },
            {
              when: { kind: "arcVariant", arcId: "shendiao", key: "act6.yangkang-verdict", eq: "captured" },
              then: { type: "goto", nodeId: "aftermath-captured" },
            },
            {
              when: { kind: "arcVariant", arcId: "shendiao", key: "act6.yangkang-verdict", eq: "confessed" },
              then: { type: "goto", nodeId: "aftermath-confessed" },
            },
            {
              when: { kind: "arcVariant", arcId: "shendiao", key: "act6.yangkang-verdict", eq: "aided" },
              then: { type: "goto", nodeId: "aftermath-aided" },
            },
          ],
          else: { type: "goto", nodeId: "aftermath-escaped" },
        },
      },
      "aftermath-dead": {
        id: "aftermath-dead",
        title: "铁枪前收殓",
        text: "郭靖取下王府腰牌，丘处机则把杨家短枪放回石座。没有人替杨康补一句悔言，四轮证据照原样封存。",
        autoNext: { type: "goto", nodeId: "munianci-reckoning" },
      },
      "aftermath-escaped": {
        id: "aftermath-escaped",
        title: "只追到血迹",
        text: "全真弟子追出两条街，只找到剑伤留下的血迹与一枚断扣。杨康没有王府快船接应，去向仍未查明。",
        autoNext: { type: "goto", nodeId: "munianci-reckoning" },
      },
      "aftermath-captured": {
        id: "aftermath-captured",
        title: "证词分存",
        text: "全真与丐帮各封一卷证词，嘉兴分舵另存实物。任何一方都不能单独毁去整条证据链。",
        autoNext: { type: "goto", nodeId: "munianci-reckoning" },
      },
      "aftermath-confessed": {
        id: "aftermath-confessed",
        title: "认罪不是赦免",
        text: "杨康的两句认罪被写进第四卷末尾。丘处机仍为他上了锁链，穆念慈也没有收回已经归匣的枪缨。",
        autoNext: { type: "goto", nodeId: "munianci-reckoning" },
      },
      "aftermath-aided": {
        id: "aftermath-aided",
        title: "缺失的第三卷",
        text: "翡翠鞋归属记录被杨康带走，剩余三卷仍在。郭靖不接受你的解释，黄蓉则把余下封条逐一更换。",
        autoNext: { type: "goto", nodeId: "munianci-reckoning" },
      },
      "munianci-reckoning": {
        id: "munianci-reckoning",
        title: "穆念慈的答复",
        text: "杨康的裁决不能替穆念慈重新决定关系。她此前作出的选择仍然有效。",
        autoNext: {
          type: "branch",
          cases: [
            {
              when: { kind: "arcVariant", arcId: "shendiao", key: "act6.munianci-outcome", eq: "broken" },
              then: { type: "goto", nodeId: "munianci-closed" },
            },
            {
              when: { kind: "arcVariant", arcId: "shendiao", key: "act6.munianci-outcome", eq: "informed-unresolved" },
              then: { type: "goto", nodeId: "munianci-answered" },
            },
          ],
          else: { type: "goto", nodeId: "munianci-receives-record" },
        },
      },
      "munianci-closed": {
        id: "munianci-closed",
        title: "枪缨仍在匣中",
        text: "穆念慈只确认四轮画押与裁决结果，没有再替杨康求情。她抱起枪缨木匣，随丐帮女弟子离庙。",
        autoNext: { type: "goto", nodeId: "kezhene-reckoning" },
      },
      "munianci-answered": {
        id: "munianci-answered",
        title: "最后一问已经回答",
        text: "穆念慈听完杨康在事实面前作出的选择，把未拆的王府短笺投入灯火。她没有跟随押队，也没有追入雨巷。",
        autoNext: { type: "goto", nodeId: "kezhene-reckoning" },
      },
      "munianci-receives-record": {
        id: "munianci-receives-record",
        title: "封卷送往牛家村",
        text: "穆念慈没有到庙。鲁有脚将破庙证词、四轮结论与裁决结果另抄一份，交给两名女弟子送往牛家村。",
        autoNext: { type: "goto", nodeId: "kezhene-reckoning" },
      },
      "kezhene-reckoning": {
        id: "kezhene-reckoning",
        title: "柯镇恶重述证言",
        text: "柯镇恶最后一次复述桃花岛所闻。他是否收回对黄药师的指认，只看四轮记录是否真的闭合。",
        autoNext: {
          type: "branch",
          cases: [
            {
              when: { kind: "arcVariant", arcId: "shendiao", key: "act6.truth-strength", eq: "complete" },
              then: { type: "goto", nodeId: "kezhene-corrects" },
            },
            {
              when: { kind: "arcVariant", arcId: "shendiao", key: "act6.truth-strength", eq: "corrupted" },
              then: { type: "goto", nodeId: "kezhene-refuses" },
            },
          ],
          else: { type: "goto", nodeId: "kezhene-revises" },
        },
      },
      "kezhene-corrects": {
        id: "kezhene-corrects",
        title: "错证当众更正",
        text: "柯镇恶承认自己把箫声当成出手，把推断当成亲见。他没有向黄药师求和，只要求在三份存卷上都补写这句更正。",
        onEnter: [
          { kind: "npcTag", npcId: "kezhene", tag: "铁枪庙更正错证" },
          { kind: "relation", npcId: "kezhene", delta: 4 },
        ],
        autoNext: { type: "goto", nodeId: "after-trail" },
      },
      "kezhene-revises": {
        id: "kezhene-revises",
        title: "撤回唯一指认",
        text: "柯镇恶不再坚持黄药师是唯一凶手，却保留对缺失证物的追问。郭靖把这份修订与其余记录一同封存。",
        autoNext: { type: "goto", nodeId: "after-trail" },
      },
      "kezhene-refuses": {
        id: "kezhene-refuses",
        title: "矛盾没有被抹平",
        text: "柯镇恶指出你的提交与验物记录互相冲突，不肯替任何一方画押。铁枪庙仍结束了私斗，真相记录却留下明确争议。",
        autoNext: { type: "goto", nodeId: "after-trail" },
      },
      "after-trail": {
        id: "after-trail",
        title: "庙外三条路",
        text: "天亮前，庙外同时送来王府水路、伤者安置与北地军报三条消息。第六幕在此收束，你仍要决定先接哪一条线。",
        choices: [
          {
            id: "track-wanyan",
            text: "把王府证词交给丐帮追查",
            description: "继续追完颜洪烈与王府残余水路。",
            consumeDay: true,
            consequences: [
              { kind: "arcVariant", arcId: "shendiao", key: "act6.aftermath", value: "track-wanyan" },
              { kind: "factionAttitude", factionId: "beggar", delta: 3 },
            ],
            resultText: "鲁有脚接过王府水路与调兵记录，分三路弟子沿嘉兴、临安和太湖追查。",
            transition: { type: "goto", nodeId: "act6-close-router" },
          },
          {
            id: "settle-survivors",
            text: "先护送证人与伤者离开",
            description: "把桃花岛血案的幸存者、尸身与存卷安置妥当。",
            consumeDay: true,
            consequences: [
              { kind: "arcVariant", arcId: "shendiao", key: "act6.aftermath", value: "settle-survivors" },
              { kind: "reputation", delta: 4 },
              { kind: "relation", npcId: "kezhene", delta: 3 },
            ],
            resultText: "你把证人、伤者与三份存卷分乘不同船只送离嘉兴，避免白驼山再以一次袭杀毁掉全部见证。",
            transition: { type: "goto", nodeId: "act6-close-router" },
          },
          {
            id: "return-damos",
            text: "接下北地军报",
            description: "个人旧案已经收束，大漠西征军令正在越过关口。",
            consumeDay: true,
            consequences: [
              { kind: "arcVariant", arcId: "shendiao", key: "act6.aftermath", value: "return-damos" },
              { kind: "relation", npcId: "guojing", delta: 2 },
            ],
            resultText: "你收下北地驿骑送来的军报。郭靖看完军令日期，将金刀与短剑一同系回鞍侧。",
            transition: { type: "goto", nodeId: "act6-close-router" },
          },
        ],
      },
      "act6-close-router": {
        id: "act6-close-router",
        title: "真相索命·终",
        text: "铁枪庙存卷已经封好。你选择的下一条线，也决定哪些人先离开嘉兴。",
        autoNext: {
          type: "branch",
          cases: [
            {
              when: { kind: "arcVariant", arcId: "shendiao", key: "act6.aftermath", eq: "track-wanyan" },
              then: { type: "goto", nodeId: "act6-close-wanyan" },
            },
            {
              when: { kind: "arcVariant", arcId: "shendiao", key: "act6.aftermath", eq: "settle-survivors" },
              then: { type: "goto", nodeId: "act6-close-survivors" },
            },
          ],
          else: { type: "goto", nodeId: "act6-close-damos" },
        },
      },
      "act6-close-wanyan": {
        id: "act6-close-wanyan",
        title: "水路追索",
        text: "丐帮小船先离南湖，追向完颜洪烈退走的水路。郭靖与黄蓉留下处理存卷，北地军报暂由驿骑带回关口。",
        onEnter: [
          { kind: "arcBeat", arcId: "shendiao", beat: "act6-truth", result: "done" },
        ],
        autoNext: { type: "end" },
      },
      "act6-close-survivors": {
        id: "act6-close-survivors",
        title: "先送活人",
        text: "证人与伤者先后离开嘉兴，桃花岛血案的存卷则由全真、丐帮和你各保一份。北地军报仍在客舍等候。",
        onEnter: [
          { kind: "arcBeat", arcId: "shendiao", beat: "act6-truth", result: "done" },
        ],
        autoNext: { type: "end" },
      },
      "act6-close-damos": {
        id: "act6-close-damos",
        title: "北地军报",
        text: "铁枪庙旧案交给留下的人继续收存。你与郭靖带上军报离开嘉兴，驿路已经换上北行马匹。",
        onEnter: [
          { kind: "arcBeat", arcId: "shendiao", beat: "act6-truth", result: "done" },
        ],
        autoNext: { type: "end" },
      },
    },
  },
]
