import type { StoryEvent } from "./schema"

export const SHENDIAO_ACT8_EVENT_IDS = {
  arrival: "shendiao-huashan-arrival-act8",
  testimony: "shendiao-huashan-testimony-act8",
  crisis: "shendiao-huashan-crisis-act8",
  contest: "shendiao-huashan-contest-act8",
  epilogue: "shendiao-huashan-epilogue-act8",
} as const

// 地点查询按数组顺序取第一个满足条件的事件，因此后段事件必须排在前段之前。
export const SHENDIAO_ACT8_LOCATION_EVENT_ORDER = [
  SHENDIAO_ACT8_EVENT_IDS.epilogue,
  SHENDIAO_ACT8_EVENT_IDS.contest,
  SHENDIAO_ACT8_EVENT_IDS.crisis,
  SHENDIAO_ACT8_EVENT_IDS.testimony,
  SHENDIAO_ACT8_EVENT_IDS.arrival,
] as const

// P2 先注册入山与公议；最后军报、论剑和结局仍留待 P3-P4。
export const SHENDIAO_ACT8_STORY: StoryEvent[] = [
  {
    id: SHENDIAO_ACT8_EVENT_IDS.arrival,
    entryNode: "huashan-foot",
    locationId: "huashan",
    weight: 12,
    once: true,
    condition: {
      kind: "and",
      items: [
        {
          kind: "arcBeat",
          arcId: "shendiao",
          beat: "act7-western-campaign",
          result: "done",
        },
        {
          kind: "not",
          item: {
            kind: "arcVariant",
            arcId: "shendiao",
            key: "act8.arrival",
            eq: "cleared",
          },
        },
        {
          kind: "not",
          item: { kind: "arcBeat", arcId: "shendiao", beat: "act8-huashan" },
        },
      ],
    },
    nodes: {
      "huashan-foot": {
        id: "huashan-foot",
        title: "群雄上山",
        text: "华山脚下分出三条山路。南路停着江南来客与旧案存卷，西侧驿道排着伤者车和军报箱，正门外另有持军旗的使团验帖。守山弟子先问来路，再决定把谁的名帖送上山腰。",
        autoNext: {
          type: "branch",
          cases: [
            {
              when: {
                kind: "arcVariant",
                arcId: "shendiao",
                key: "act7.departure",
                eq: "with-guojing",
              },
              then: { type: "goto", nodeId: "arrival-guo-router" },
            },
            {
              when: {
                kind: "arcVariant",
                arcId: "shendiao",
                key: "act7.departure",
                eq: "escort-refugees",
              },
              then: { type: "goto", nodeId: "arrival-refugee-witness" },
            },
            {
              when: {
                kind: "arcVariant",
                arcId: "shendiao",
                key: "act7.departure",
                eq: "double-agent",
              },
              then: { type: "goto", nodeId: "arrival-covert-messenger" },
            },
            {
              when: {
                kind: "arcVariant",
                arcId: "shendiao",
                key: "act7.departure",
                eq: "mongol-command",
              },
              then: { type: "goto", nodeId: "arrival-mongol-envoy" },
            },
            {
              when: {
                kind: "arcVariant",
                arcId: "shendiao",
                key: "act7.departure",
                eq: "grassland-ending",
              },
              then: { type: "goto", nodeId: "arrival-grassland-router" },
            },
          ],
          else: { type: "goto", nodeId: "arrival-grassland-alone" },
        },
      },
      "arrival-guo-router": {
        id: "arrival-guo-router",
        title: "南路同行者",
        text: "郭靖先把军令与铁枪庙存卷交给守山弟子。后方是否还有李萍与伤者同行，要看离营时留下的那条路。",
        autoNext: {
          type: "branch",
          cases: [
            {
              when: {
                kind: "and",
                items: [
                  {
                    kind: "arcVariant",
                    arcId: "shendiao",
                    key: "act7.liping",
                    eq: "survived-prepared",
                  },
                  { kind: "npcAlive", npcId: "liping", alive: true },
                ],
              },
              then: { type: "goto", nodeId: "arrival-guo-family" },
            },
          ],
          else: { type: "goto", nodeId: "arrival-guo-company" },
        },
      },
      "arrival-guo-family": {
        id: "arrival-guo-family",
        title: "三骑一车到华山",
        text: "郭靖牵马走在伤者车旁，李萍把沿途保管的南征令、拒令手书和离营名册一起交给山腰收卷人。黄蓉已经在石阶上等候。黄蓉：\"人先安置，卷册逐件验封。谁也别把两件事混在一起。\"",
        onEnter: [
          {
            kind: "arcVariant",
            arcId: "shendiao",
            key: "act8.entry",
            value: "guo-company",
          },
          { kind: "relation", npcId: "guojing", delta: 3 },
          { kind: "relation", npcId: "liping", delta: 3 },
        ],
        autoNext: { type: "goto", nodeId: "witness-roll" },
      },
      "arrival-guo-company": {
        id: "arrival-guo-company",
        title: "与郭靖同上华山",
        text: "郭靖与你从南路上山，随身只有铁枪庙存卷、南征令抄件和李萍留下的路引。黄蓉逐一核过封条。郭靖：\"我在草原领过什么令、又交回什么令，都照原样写。\"",
        onEnter: [
          {
            kind: "arcVariant",
            arcId: "shendiao",
            key: "act8.entry",
            value: "guo-company",
          },
          { kind: "relation", npcId: "guojing", delta: 3 },
        ],
        autoNext: { type: "goto", nodeId: "witness-roll" },
      },
      "arrival-refugee-witness": {
        id: "arrival-refugee-witness",
        title: "伤者车与见证人",
        text: "撒马尔罕医者带着伤者名册，商道向导护送两只军报箱到山脚。你守在最后一辆车旁，没有让守山弟子先搬卷册。城外医者：\"先给伤者腾地方。名册不会走，伤口等不得。\"",
        onEnter: [
          {
            kind: "arcVariant",
            arcId: "shendiao",
            key: "act8.entry",
            value: "refugee-witness",
          },
          { kind: "relation", npcId: "samarkand-healer", delta: 5 },
          { kind: "relation", npcId: "samarkand-guide", delta: 4 },
        ],
        autoNext: { type: "goto", nodeId: "witness-roll" },
      },
      "arrival-covert-messenger": {
        id: "arrival-covert-messenger",
        title: "无名军报",
        text: "你从西侧樵路入山，腰牌仍挂在蒙古军册名下，南征调动却藏在药材箱夹层。黄蓉只让一名丐帮弟子接箱，没有当众报出送信人。黄蓉：\"封条先留原样。名字何时写，等你自己开口。\"",
        onEnter: [
          {
            kind: "arcVariant",
            arcId: "shendiao",
            key: "act8.entry",
            value: "covert-messenger",
          },
          { kind: "relation", npcId: "huangrong", delta: 3 },
          { kind: "factionAttitude", factionId: "mongol", delta: -2 },
        ],
        autoNext: { type: "goto", nodeId: "witness-roll" },
      },
      "arrival-mongol-envoy": {
        id: "arrival-mongol-envoy",
        title: "军旗到山门",
        text: "两名传令骑兵在正门外收旗，你以仍在册的军职递上使帖。帖中要求公议不得扣留蒙古军报与使者，也没有替你撤去撒马尔罕的署名。守山弟子验过印信，把使团安排在公议棚东侧。",
        onEnter: [
          {
            kind: "arcVariant",
            arcId: "shendiao",
            key: "act8.entry",
            value: "mongol-envoy",
          },
          { kind: "factionAttitude", factionId: "mongol", delta: 3 },
        ],
        autoNext: { type: "goto", nodeId: "witness-roll" },
      },
      "arrival-grassland-router": {
        id: "arrival-grassland-router",
        title: "草原旧约",
        text: "你没有带军旗，只带着草原旧友的路引。华筝是否亲自送到山脚，取决于她留在草原后是否仍愿与你同路一程。",
        autoNext: {
          type: "branch",
          cases: [
            {
              when: {
                kind: "and",
                items: [
                  {
                    kind: "arcVariant",
                    arcId: "shendiao",
                    key: "act7.huazheng",
                    eq: "stayed-loyal",
                  },
                  { kind: "relation", npcId: "huazheng", gte: 10 },
                ],
              },
              then: { type: "goto", nodeId: "arrival-grassland-with-huazheng" },
            },
          ],
          else: { type: "goto", nodeId: "arrival-grassland-alone" },
        },
      },
      "arrival-grassland-with-huazheng": {
        id: "arrival-grassland-with-huazheng",
        title: "送到山脚",
        text: "华筝把你送到华山脚下，没有换中原衣饰，也没有进入公议棚。她把王帐往来文书交给你。华筝：\"我只证明这些信从哪里来。山上要写成什么，由你当面说。\"",
        onEnter: [
          {
            kind: "arcVariant",
            arcId: "shendiao",
            key: "act8.entry",
            value: "grassland-visitor",
          },
          { kind: "relation", npcId: "huazheng", delta: 4 },
        ],
        autoNext: { type: "goto", nodeId: "witness-roll" },
      },
      "arrival-grassland-alone": {
        id: "arrival-grassland-alone",
        title: "不带军旗的访客",
        text: "你以草原访客身份递上旧友路引，行囊里没有军职木牌。守山弟子只登记姓名与来处，另把华筝的书信、军报抄件和你带来的旧卷分别封存。",
        onEnter: [
          {
            kind: "arcVariant",
            arcId: "shendiao",
            key: "act8.entry",
            value: "grassland-visitor",
          },
        ],
        autoNext: { type: "goto", nodeId: "witness-roll" },
      },
      "witness-roll": {
        id: "witness-roll",
        title: "山腰见证席",
        text: "公议棚分成旧案、桃花岛与战争三列席位。活证、书面证词和原始军报各有位置，空着的名牌不会由旁人代签。",
        autoNext: {
          type: "branch",
          cases: [
            {
              when: {
                kind: "and",
                items: [
                  {
                    kind: "arcVariant",
                    arcId: "shendiao",
                    key: "act8.entry",
                    eq: "guo-company",
                  },
                  { kind: "relation", npcId: "huangrong", gte: 10 },
                  {
                    kind: "or",
                    items: [
                      { kind: "npcAlive", npcId: "hanxiaoying", alive: true },
                      { kind: "npcAlive", npcId: "liping", alive: true },
                    ],
                  },
                ],
              },
              then: { type: "goto", nodeId: "witness-broad" },
            },
            {
              when: {
                kind: "and",
                items: [
                  {
                    kind: "arcVariant",
                    arcId: "shendiao",
                    key: "act8.entry",
                    eq: "refugee-witness",
                  },
                  {
                    kind: "arcVariant",
                    arcId: "shendiao",
                    key: "act7.evacuation",
                    eq: "full",
                  },
                ],
              },
              then: { type: "goto", nodeId: "witness-broad" },
            },
            {
              when: {
                kind: "and",
                items: [
                  {
                    kind: "arcVariant",
                    arcId: "shendiao",
                    key: "act8.entry",
                    eq: "grassland-visitor",
                  },
                  {
                    kind: "arcVariant",
                    arcId: "shendiao",
                    key: "act7.huazheng",
                    eq: "stayed-loyal",
                  },
                  { kind: "relation", npcId: "huazheng", gte: 10 },
                ],
              },
              then: { type: "goto", nodeId: "witness-broad" },
            },
            {
              when: {
                kind: "or",
                items: [
                  {
                    kind: "arcVariant",
                    arcId: "shendiao",
                    key: "act8.entry",
                    eq: "covert-messenger",
                  },
                  {
                    kind: "arcVariant",
                    arcId: "shendiao",
                    key: "act8.entry",
                    eq: "mongol-envoy",
                  },
                  {
                    kind: "arcVariant",
                    arcId: "shendiao",
                    key: "act7.evacuation",
                    eq: "partial",
                  },
                ],
              },
              then: { type: "goto", nodeId: "witness-divided" },
            },
          ],
          else: { type: "goto", nodeId: "witness-sparse" },
        },
      },
      "witness-broad": {
        id: "witness-broad",
        title: "三列都有见证",
        text: "旧案席有活证或具名证词，桃花岛席保留验伤与封存记录，战争席则有军令、伤者名册和送达人。三列并不互相担保，却都能当场接受质询。",
        onEnter: [
          {
            kind: "arcVariant",
            arcId: "shendiao",
            key: "act8.witnesses",
            value: "broad",
          },
        ],
        autoNext: { type: "goto", nodeId: "arrival-close" },
      },
      "witness-divided": {
        id: "witness-divided",
        title: "两边各持一份",
        text: "旧案与战争见证分别坐在公议棚两侧。蒙古使者不替伤者签名，江南来客也不替军中抄件担保。每份记录只能由自己的送达人说明来处。",
        onEnter: [
          {
            kind: "arcVariant",
            arcId: "shendiao",
            key: "act8.witnesses",
            value: "divided",
          },
        ],
        autoNext: { type: "goto", nodeId: "arrival-close" },
      },
      "witness-sparse": {
        id: "witness-sparse",
        title: "空席与封卷",
        text: "三列席位有两处无人到场，只留下封卷、路引和未能当面复核的署名。黄蓉把空名牌翻到背面，不让任何人用缺席者的口气补写证言。",
        onEnter: [
          {
            kind: "arcVariant",
            arcId: "shendiao",
            key: "act8.witnesses",
            value: "sparse",
          },
        ],
        autoNext: { type: "goto", nodeId: "arrival-close" },
      },
      "arrival-close": {
        id: "arrival-close",
        title: "山腰开棚",
        text: "入山身份、同行者和见证席已经登记。旧案与战争记录仍各自封存，下一场公议才决定哪些内容公开写入原卷。",
        onEnter: [
          {
            kind: "arcVariant",
            arcId: "shendiao",
            key: "act8.arrival",
            value: "cleared",
          },
        ],
        autoNext: { type: "end" },
      },
    },
  },
  {
    id: SHENDIAO_ACT8_EVENT_IDS.testimony,
    entryNode: "council-opening",
    locationId: "huashan",
    weight: 12,
    once: true,
    condition: {
      kind: "and",
      items: [
        {
          kind: "arcBeat",
          arcId: "shendiao",
          beat: "act7-western-campaign",
          result: "done",
        },
        {
          kind: "arcVariant",
          arcId: "shendiao",
          key: "act8.arrival",
          eq: "cleared",
        },
        {
          kind: "not",
          item: {
            kind: "arcVariant",
            arcId: "shendiao",
            key: "act8.testimony",
            eq: "cleared",
          },
        },
        {
          kind: "not",
          item: { kind: "arcBeat", arcId: "shendiao", beat: "act8-huashan" },
        },
      ],
    },
    nodes: {
      "council-opening": {
        id: "council-opening",
        title: "华山公议",
        text: "山腰棚内没有主位。旧案存卷、桃花岛验伤记录与撒马尔罕军报分放三案，执笔人只记录具名陈述。玩家带来的身份和见证席，决定第一轮质询如何开始。",
        autoNext: {
          type: "branch",
          cases: [
            {
              when: {
                kind: "arcVariant",
                arcId: "shendiao",
                key: "act8.witnesses",
                eq: "broad",
              },
              then: { type: "goto", nodeId: "council-broad" },
            },
            {
              when: {
                kind: "arcVariant",
                arcId: "shendiao",
                key: "act8.witnesses",
                eq: "divided",
              },
              then: { type: "goto", nodeId: "council-divided" },
            },
          ],
          else: { type: "goto", nodeId: "council-sparse" },
        },
      },
      "council-broad": {
        id: "council-broad",
        title: "各案都有人答",
        text: "三列见证席都有人或具名文书在场。黄蓉先核封条，郭靖与撒马尔罕送达人各自按手印，旧案证人只回答自己亲见的部分。",
        autoNext: { type: "goto", nodeId: "record-order" },
      },
      "council-divided": {
        id: "council-divided",
        title: "席位分在两侧",
        text: "蒙古使团、江南见证与伤者送达人分坐两侧。双方都带着自己的抄件，不肯先承认对方版本。执笔人把每次异议另列一栏。",
        autoNext: { type: "goto", nodeId: "record-order" },
      },
      "council-sparse": {
        id: "council-sparse",
        title: "先验空席留下的卷",
        text: "多张名牌翻在桌面，只能先验封条、旧伤记录和送达路引。黄药师站在棚外，不替缺席者作证；一灯让弟子把未能核实的段落逐条标出。",
        autoNext: { type: "goto", nodeId: "record-order" },
      },
      "record-order": {
        id: "record-order",
        title: "先议哪一卷",
        text: "旧案与战争记录都必须处理。先后只改变质询次序，不会让另一卷消失。",
        choices: [
          {
            id: "old-record-first",
            text: "先议铁枪庙与桃花岛旧案",
            description: "先处理证据强弱、幸存者证言与误会责任，再转入战争记录。",
            resultText: "你把铁枪庙存卷与桃花岛验伤记录放到同一案上，要求执笔人保留每条证言原有的限定。",
            transition: { type: "goto", nodeId: "old-record-source" },
          },
          {
            id: "war-record-first",
            text: "先议撒马尔罕与南征军令",
            description: "先核对军令、撤离名册与玩家署名，再回到江南旧案。",
            resultText: "你先拆开军报箱，依次摆出屠城令、撤离名册、南征令和离营记录，没有移走自己的署名。",
            transition: { type: "goto", nodeId: "war-record-source" },
          },
        ],
      },
      "old-record-source": {
        id: "old-record-source",
        title: "旧案底卷",
        text: "铁枪庙裁决、桃花岛验伤与烟雨楼证言依次拆封。此前保下多少证据，决定这些内容能否互相印证。",
        autoNext: {
          type: "branch",
          cases: [
            {
              when: {
                kind: "and",
                items: [
                  {
                    kind: "arcVariant",
                    arcId: "shendiao",
                    key: "act6.truth-strength",
                    eq: "complete",
                  },
                  {
                    kind: "arcVariant",
                    arcId: "shendiao",
                    key: "act6.misunderstanding",
                    eq: "questioning",
                  },
                ],
              },
              then: { type: "goto", nodeId: "old-record-corroborated" },
            },
            {
              when: {
                kind: "arcVariant",
                arcId: "shendiao",
                key: "act6.truth-strength",
                eq: "corrupted",
              },
              then: { type: "goto", nodeId: "old-record-conflicted" },
            },
          ],
          else: { type: "goto", nodeId: "old-record-limited" },
        },
      },
      "old-record-corroborated": {
        id: "old-record-corroborated",
        title: "证物与活证相合",
        text: "铁枪庙四轮记录都有对应证物，桃花岛误认也已在烟雨楼得到质询。韩小莹或留存证词能区分蛤蟆功、九阴爪与桃花岛掌伤。",
        autoNext: { type: "goto", nodeId: "old-record-choice" },
      },
      "old-record-limited": {
        id: "old-record-limited",
        title: "有结论，也有缺页",
        text: "杨康裁决已经落定，桃花岛记录却仍有证物缺失或证言争议。公议可以公开现有内容，但不能删去“待核”二字。",
        autoNext: { type: "goto", nodeId: "old-record-choice" },
      },
      "old-record-conflicted": {
        id: "old-record-conflicted",
        title: "互相冲突的旧卷",
        text: "铁枪庙卷中仍留着被误导或改写的段落，桃花岛证言也无法全部互证。黄蓉把矛盾处逐条圈出，不允许执笔人合成一份无争议结论。",
        autoNext: { type: "goto", nodeId: "old-record-choice" },
      },
      "old-record-choice": {
        id: "old-record-choice",
        title: "旧案如何入卷",
        text: "执笔人等你确认公开范围。裁决结果、证据强弱和桃花岛误认责任可以原样写入，也可以被限定、扣下或改写。",
        choices: [
          {
            id: "disclose-old-record",
            text: "完整公开，并保留证据强弱",
            description: "公开裁决与现有证言；有争议的段落照样标为争议。",
            consumeDay: true,
            consequences: [
              {
                kind: "arcVariant",
                arcId: "shendiao",
                key: "act8.old-record",
                value: "disclosed",
              },
              { kind: "relation", npcId: "guojing", delta: 4 },
              { kind: "relation", npcId: "huangrong", delta: 4 },
              { kind: "relation", npcId: "munianci", delta: 3 },
            ],
            resultText: "你公开裁决原文、证物目录与桃花岛质询记录，并要求每处缺证和异议继续留在卷上。",
            transition: { type: "goto", nodeId: "after-old-record" },
          },
          {
            id: "qualify-old-record",
            text: "只公开可复核部分",
            description: "保留裁决事实，删去无法由第二来源确认的推断。",
            consumeDay: true,
            consequences: [
              {
                kind: "arcVariant",
                arcId: "shendiao",
                key: "act8.old-record",
                value: "qualified",
              },
              { kind: "relation", npcId: "kezhene", delta: 2 },
              { kind: "relation", npcId: "huangrong", delta: 2 },
            ],
            resultText: "你留下裁决、验伤和具名证词，把无法复核的动机推断另封为附卷。",
            transition: { type: "goto", nodeId: "after-old-record" },
          },
          {
            id: "withhold-old-record",
            text: "扣下会伤及自己或同伴的段落",
            description: "公议知道卷册不全，但不知道被扣下的内容。",
            consumeDay: true,
            consequences: [
              {
                kind: "arcVariant",
                arcId: "shendiao",
                key: "act8.old-record",
                value: "withheld",
              },
              { kind: "relation", npcId: "huangrong", delta: -6 },
              { kind: "relation", npcId: "guojing", delta: -3 },
            ],
            resultText: "你抽走数页与自身旧选择有关的记录，只让执笔人注明“原卷未全数公开”。",
            transition: { type: "goto", nodeId: "after-old-record" },
          },
          {
            id: "distort-old-record",
            text: "改写桃花岛与杨康的责任",
            description: "把仍有争议的段落写成确定结论，转移旧案责任。",
            consumeDay: true,
            consequences: [
              {
                kind: "arcVariant",
                arcId: "shendiao",
                key: "act8.old-record",
                value: "distorted",
              },
              { kind: "karma", delta: -10 },
              { kind: "relation", npcId: "huangrong", delta: -12 },
              { kind: "relation", npcId: "kezhene", delta: -8 },
            ],
            resultText: "你要求执笔人删去矛盾处，把未能复核的责任写成定论。黄蓉当场取回自己的验封签名。",
            transition: { type: "goto", nodeId: "after-old-record" },
          },
        ],
      },
      "after-old-record": {
        id: "after-old-record",
        title: "旧卷暂封",
        text: "旧案公开方式已经落笔。执笔人把卷册移到一旁，检查战争记录是否已经处理。",
        autoNext: {
          type: "branch",
          cases: [
            {
              when: {
                kind: "or",
                items: [
                  {
                    kind: "arcVariant",
                    arcId: "shendiao",
                    key: "act8.war-record",
                    eq: "disclosed",
                  },
                  {
                    kind: "arcVariant",
                    arcId: "shendiao",
                    key: "act8.war-record",
                    eq: "qualified",
                  },
                  {
                    kind: "arcVariant",
                    arcId: "shendiao",
                    key: "act8.war-record",
                    eq: "withheld",
                  },
                  {
                    kind: "arcVariant",
                    arcId: "shendiao",
                    key: "act8.war-record",
                    eq: "distorted",
                  },
                ],
              },
              then: { type: "goto", nodeId: "record-tally" },
            },
          ],
          else: { type: "goto", nodeId: "war-record-source" },
        },
      },
      "war-record-source": {
        id: "war-record-source",
        title: "军令与执行名册",
        text: "撒马尔罕军报、屠城令、撤离名册和南征调动依次展开。玩家的军职与离营路线，决定哪一方先提出异议。",
        autoNext: {
          type: "branch",
          cases: [
            {
              when: {
                kind: "arcVariant",
                arcId: "shendiao",
                key: "act7.departure",
                eq: "mongol-command",
              },
              then: { type: "goto", nodeId: "war-record-envoy" },
            },
            {
              when: {
                kind: "arcVariant",
                arcId: "shendiao",
                key: "act7.order",
                eq: "obeyed",
              },
              then: { type: "goto", nodeId: "war-record-obeyed" },
            },
            {
              when: {
                kind: "or",
                items: [
                  {
                    kind: "arcVariant",
                    arcId: "shendiao",
                    key: "act7.order",
                    eq: "defied",
                  },
                  {
                    kind: "arcVariant",
                    arcId: "shendiao",
                    key: "act7.order",
                    eq: "betrayed",
                  },
                ],
              },
              then: { type: "goto", nodeId: "war-record-resisted" },
            },
            {
              when: {
                kind: "arcVariant",
                arcId: "shendiao",
                key: "act7.order",
                eq: "delayed",
              },
              then: { type: "goto", nodeId: "war-record-delayed" },
            },
          ],
          else: { type: "goto", nodeId: "war-record-fractured" },
        },
      },
      "war-record-envoy": {
        id: "war-record-envoy",
        title: "使团先验军印",
        text: "蒙古使者先确认每份军令上的印信，再要求把军中伤亡与城中伤者分开记录。你的名字仍在领军名册上，使团也没有替你撤下署名。",
        autoNext: { type: "goto", nodeId: "war-record-choice" },
      },
      "war-record-obeyed": {
        id: "war-record-obeyed",
        title: "军令已被执行",
        text: "屠城令与执行名册上都有你的署名，撤离记录却不完整。郭靖没有替你辩解，只要求执笔人把军令原文与执行时辰并排放置。",
        autoNext: { type: "goto", nodeId: "war-record-choice" },
      },
      "war-record-resisted": {
        id: "war-record-resisted",
        title: "抗命与泄令记录",
        text: "屠城令旁附着拖延、抗命或泄令的处分记录，伤者名册也能证明部分撤离结果。军中使者要求追究违令，伤者送达人则要求先核人数。",
        autoNext: { type: "goto", nodeId: "war-record-choice" },
      },
      "war-record-delayed": {
        id: "war-record-delayed",
        title: "相差半日的军报",
        text: "中军调动与实际出兵时辰相差半日，期间有伤者车出城，也有军令被重新封发。双方都承认时辰，却不承认延误的目的。",
        autoNext: { type: "goto", nodeId: "war-record-choice" },
      },
      "war-record-fractured": {
        id: "war-record-fractured",
        title: "残缺的战争记录",
        text: "军令、伤者名册与离营路线来自不同送达人，封条也不在同一处。现有内容足以证明发生过什么，却无法让每个数字互相吻合。",
        autoNext: { type: "goto", nodeId: "war-record-choice" },
      },
      "war-record-choice": {
        id: "war-record-choice",
        title: "战争记录如何入卷",
        text: "公议要同时记录军令和执行结果。是否写入自己的署名、伤亡争议与军职变化，由你当场确认。",
        choices: [
          {
            id: "disclose-war-record",
            text: "公开军令与自己的执行记录",
            description: "服从、拖延、抗命或泄令都按原名册写入。",
            consumeDay: true,
            consequences: [
              {
                kind: "arcVariant",
                arcId: "shendiao",
                key: "act8.war-record",
                value: "disclosed",
              },
              { kind: "factionAttitude", factionId: "mongol", delta: -12 },
              { kind: "relation", npcId: "guojing", delta: 6 },
              { kind: "relation", npcId: "samarkand-healer", delta: 4 },
            ],
            resultText: "你交出原军令、执行时辰和离营记录，保留自己的署名。蒙古使者当场记下这次公开，郭靖在见证栏签字。",
            transition: { type: "goto", nodeId: "after-war-record" },
          },
          {
            id: "qualify-war-record",
            text: "公开军令，保留争议数字",
            description: "确认命令与主要行动，把无法互证的伤亡数列为待核。",
            consumeDay: true,
            consequences: [
              {
                kind: "arcVariant",
                arcId: "shendiao",
                key: "act8.war-record",
                value: "qualified",
              },
              { kind: "factionAttitude", factionId: "mongol", delta: -4 },
              { kind: "relation", npcId: "samarkand-guide", delta: 4 },
            ],
            resultText: "你公开屠城令、撤离路线和主要执行时辰，把无法由第二份名册确认的数字保留为争议。",
            transition: { type: "goto", nodeId: "after-war-record" },
          },
          {
            id: "withhold-war-record",
            text: "隐去自己的服从、抗命或泄令",
            description: "保留战争结果，却抽走能说明玩家责任的军册页。",
            consumeDay: true,
            consequences: [
              {
                kind: "arcVariant",
                arcId: "shendiao",
                key: "act8.war-record",
                value: "withheld",
              },
              { kind: "relation", npcId: "guojing", delta: -8 },
              { kind: "relation", npcId: "samarkand-healer", delta: -4 },
            ],
            resultText: "你留下军令与伤者名册，却抽走自己的执行页。执笔人只能注明“责任人记录未公开”。",
            transition: { type: "goto", nodeId: "after-war-record" },
          },
          {
            id: "distort-war-record",
            text: "用军职或名望改写记录",
            description: "要求执笔人把争议伤亡与违令责任推给缺席者。",
            consumeDay: true,
            consequences: [
              {
                kind: "arcVariant",
                arcId: "shendiao",
                key: "act8.war-record",
                value: "distorted",
              },
              { kind: "karma", delta: -12 },
              { kind: "factionAttitude", factionId: "mongol", delta: 8 },
              { kind: "relation", npcId: "guojing", delta: -12 },
              { kind: "relation", npcId: "huazheng", delta: -6 },
            ],
            resultText: "你要求执笔人以军中版本覆盖伤者证词，把无法核对的责任写给缺席者。郭靖与商道向导都拒绝在这一页签名。",
            transition: { type: "goto", nodeId: "after-war-record" },
          },
        ],
      },
      "after-war-record": {
        id: "after-war-record",
        title: "军报暂封",
        text: "战争记录的公开方式已经落笔。执笔人检查旧案卷是否已经处理。",
        autoNext: {
          type: "branch",
          cases: [
            {
              when: {
                kind: "or",
                items: [
                  {
                    kind: "arcVariant",
                    arcId: "shendiao",
                    key: "act8.old-record",
                    eq: "disclosed",
                  },
                  {
                    kind: "arcVariant",
                    arcId: "shendiao",
                    key: "act8.old-record",
                    eq: "qualified",
                  },
                  {
                    kind: "arcVariant",
                    arcId: "shendiao",
                    key: "act8.old-record",
                    eq: "withheld",
                  },
                  {
                    kind: "arcVariant",
                    arcId: "shendiao",
                    key: "act8.old-record",
                    eq: "distorted",
                  },
                ],
              },
              then: { type: "goto", nodeId: "record-tally" },
            },
          ],
          else: { type: "goto", nodeId: "old-record-source" },
        },
      },
      "record-tally": {
        id: "record-tally",
        title: "两卷汇总",
        text: "旧案与战争记录都已落笔。执笔人按公开方式与原始证据强弱确定公议原卷的最终标记。",
        autoNext: {
          type: "branch",
          cases: [
            {
              when: {
                kind: "or",
                items: [
                  {
                    kind: "arcVariant",
                    arcId: "shendiao",
                    key: "act8.old-record",
                    eq: "distorted",
                  },
                  {
                    kind: "arcVariant",
                    arcId: "shendiao",
                    key: "act8.war-record",
                    eq: "distorted",
                  },
                ],
              },
              then: { type: "goto", nodeId: "record-falsified" },
            },
            {
              when: {
                kind: "or",
                items: [
                  {
                    kind: "arcVariant",
                    arcId: "shendiao",
                    key: "act8.old-record",
                    eq: "withheld",
                  },
                  {
                    kind: "arcVariant",
                    arcId: "shendiao",
                    key: "act8.war-record",
                    eq: "withheld",
                  },
                ],
              },
              then: { type: "goto", nodeId: "record-concealed" },
            },
            {
              when: {
                kind: "and",
                items: [
                  {
                    kind: "arcVariant",
                    arcId: "shendiao",
                    key: "act8.old-record",
                    eq: "disclosed",
                  },
                  {
                    kind: "arcVariant",
                    arcId: "shendiao",
                    key: "act8.war-record",
                    eq: "disclosed",
                  },
                  {
                    kind: "not",
                    item: {
                      kind: "arcVariant",
                      arcId: "shendiao",
                      key: "act6.truth-strength",
                      eq: "corrupted",
                    },
                  },
                ],
              },
              then: { type: "goto", nodeId: "record-full" },
            },
          ],
          else: { type: "goto", nodeId: "record-contested" },
        },
      },
      "record-full": {
        id: "record-full",
        title: "记录完整",
        text: "两组记录都公开入卷，证据强弱、异议与玩家署名也全部保留。黄蓉把副本分给旧案、伤者和军报送达人，各方只在自己确认的段落签名。",
        onEnter: [
          {
            kind: "arcVariant",
            arcId: "shendiao",
            key: "act8.record",
            value: "full",
          },
        ],
        autoNext: { type: "goto", nodeId: "council-close" },
      },
      "record-contested": {
        id: "record-contested",
        title: "争议并列",
        text: "公议原卷保留两组记录，也保留无法互证的段落。柯镇恶、蒙古使者与伤者送达人分别签下异议，没有一方替另一方撤去名字。",
        onEnter: [
          {
            kind: "arcVariant",
            arcId: "shendiao",
            key: "act8.record",
            value: "contested",
          },
        ],
        autoNext: { type: "goto", nodeId: "council-close" },
      },
      "record-concealed": {
        id: "record-concealed",
        title: "原卷留有缺页",
        text: "公开卷中明确标出未提交的页码与责任记录。郭靖不在缺页后的结论上签名，执笔人也没有把“未公开”改写成“从未发生”。",
        onEnter: [
          {
            kind: "arcVariant",
            arcId: "shendiao",
            key: "act8.record",
            value: "concealed",
          },
        ],
        autoNext: { type: "goto", nodeId: "council-close" },
      },
      "record-falsified": {
        id: "record-falsified",
        title: "签名被撤下",
        text: "改写段落进入原卷后，黄蓉、郭靖与伤者送达人撤下各自签名。军中使者保留符合使团口径的抄件，公议原卷则另记“责任归属遭主动改写”。",
        onEnter: [
          {
            kind: "arcVariant",
            arcId: "shendiao",
            key: "act8.record",
            value: "falsified",
          },
        ],
        autoNext: { type: "goto", nodeId: "council-close" },
      },
      "council-close": {
        id: "council-close",
        title: "公议封卷",
        text: "旧案、桃花岛与战争记录已经形成公议原卷。各方副本分别封存，山下驿路却在此时送来一封新的南侵军报。",
        onEnter: [
          {
            kind: "arcVariant",
            arcId: "shendiao",
            key: "act8.testimony",
            value: "cleared",
          },
        ],
        autoNext: { type: "end" },
      },
    },
  },
  {
    id: SHENDIAO_ACT8_EVENT_IDS.crisis,
    entryNode: "last-report-arrival",
    locationId: "huashan",
    weight: 12,
    once: true,
    condition: {
      kind: "and",
      items: [
        {
          kind: "arcBeat",
          arcId: "shendiao",
          beat: "act7-western-campaign",
          result: "done",
        },
        {
          kind: "arcVariant",
          arcId: "shendiao",
          key: "act8.testimony",
          eq: "cleared",
        },
        {
          kind: "not",
          item: {
            kind: "arcVariant",
            arcId: "shendiao",
            key: "act8.value-stage",
            eq: "cleared",
          },
        },
        {
          kind: "not",
          item: { kind: "arcBeat", arcId: "shendiao", beat: "act8-huashan" },
        },
      ],
    },
    nodes: {
      "last-report-arrival": {
        id: "last-report-arrival",
        title: "最后军报",
        text: "公议刚封卷，山下驿路便送来一辆伤者车。车上带着新的南侵调动、撒马尔罕补录名册和两名负伤送报人。追缉骑卒紧随其后，另一队蒙面人已从侧坡逼近封卷棚。",
        autoNext: {
          type: "branch",
          cases: [
            {
              when: {
                kind: "arcVariant",
                arcId: "shendiao",
                key: "act8.record",
                eq: "full",
              },
              then: { type: "goto", nodeId: "crisis-record-full" },
            },
            {
              when: {
                kind: "arcVariant",
                arcId: "shendiao",
                key: "act8.record",
                eq: "concealed",
              },
              then: { type: "goto", nodeId: "crisis-record-concealed" },
            },
            {
              when: {
                kind: "arcVariant",
                arcId: "shendiao",
                key: "act8.record",
                eq: "falsified",
              },
              then: { type: "goto", nodeId: "crisis-record-falsified" },
            },
          ],
          else: { type: "goto", nodeId: "crisis-record-contested" },
        },
      },
      "crisis-record-full": {
        id: "crisis-record-full",
        title: "原卷已有多方签名",
        text: "完整公议原卷已经分出数份副本，夺卷者无法一次抹去所有记录。他们转而盯住送报人和签名名册，追缉骑卒则要求查封军报箱。",
        autoNext: { type: "goto", nodeId: "pursuit-demand" },
      },
      "crisis-record-contested": {
        id: "crisis-record-contested",
        title: "异议仍在卷上",
        text: "争议原卷保留着多方签名，每一方都想先拿到新军报补强自己的版本。追缉骑卒要求扣人验讯，蒙面人则直奔存放异议页的木匣。",
        autoNext: { type: "goto", nodeId: "pursuit-demand" },
      },
      "crisis-record-concealed": {
        id: "crisis-record-concealed",
        title: "缺页被重新追索",
        text: "新军报列出公议原卷缺失的时辰与责任人，送报人还带着一份未公开的军册页。追缉骑卒要求连人带页交出，夺卷者开始拆封公议棚后的存卷箱。",
        autoNext: { type: "goto", nodeId: "pursuit-demand" },
      },
      "crisis-record-falsified": {
        id: "crisis-record-falsified",
        title: "新军报撞上改写记录",
        text: "新军报与公议原卷中的改写段落直接冲突。郭靖和黄蓉拒绝替原卷护住假页，送报人却仍在伤者车上，夺卷者也想先烧掉能证明改写的军报。",
        autoNext: { type: "goto", nodeId: "pursuit-demand" },
      },
      "pursuit-demand": {
        id: "pursuit-demand",
        title: "谁有权带走人和卷",
        text: "追缉文书同时点名送报人、撒马尔罕见证与公议原卷。玩家此前以什么身份上山，决定追缉者把这份要求交给谁。",
        autoNext: {
          type: "branch",
          cases: [
            {
              when: {
                kind: "arcVariant",
                arcId: "shendiao",
                key: "act8.entry",
                eq: "mongol-envoy",
              },
              then: { type: "goto", nodeId: "demand-envoy-seat" },
            },
            {
              when: {
                kind: "arcVariant",
                arcId: "shendiao",
                key: "act8.entry",
                eq: "covert-messenger",
              },
              then: { type: "goto", nodeId: "demand-covert-source" },
            },
            {
              when: {
                kind: "arcVariant",
                arcId: "shendiao",
                key: "act8.entry",
                eq: "refugee-witness",
              },
              then: { type: "goto", nodeId: "demand-witness-cart" },
            },
          ],
          else: { type: "goto", nodeId: "demand-mountain-gate" },
        },
      },
      "demand-envoy-seat": {
        id: "demand-envoy-seat",
        title: "使者席递来军印",
        text: "追缉使把军印递到你面前，要求你以仍在册的身份接管山门、扣下送报人并封存原卷。郭靖守在伤者车旁，没有替你撕毁使帖。",
        autoNext: { type: "goto", nodeId: "value-choice" },
      },
      "demand-covert-source": {
        id: "demand-covert-source",
        title: "密报来源已被认出",
        text: "追缉骑卒认出药材箱夹层的军中封线，开始按军册排查送报人。黄蓉把原卷主匣移到石阶后，只问你先护哪一处。",
        autoNext: { type: "goto", nodeId: "value-choice" },
      },
      "demand-witness-cart": {
        id: "demand-witness-cart",
        title: "伤者车先被截住",
        text: "追缉骑卒封住车道，要求医者与向导下车受审。蒙面人同时割断存卷棚外绳索，原卷、伤者和夺卷者已经分在三个方向。",
        autoNext: { type: "goto", nodeId: "value-choice" },
      },
      "demand-mountain-gate": {
        id: "demand-mountain-gate",
        title: "山门分成三处",
        text: "郭靖守住伤者车，黄蓉带人护住原卷，夺卷者正沿侧坡退走。两人都已出手，却无法同时替你追责、护人和保卷。",
        autoNext: { type: "goto", nodeId: "value-choice" },
      },
      "value-choice": {
        id: "value-choice",
        title: "只能先保一处",
        text: "伤者车、公议原卷和夺卷者分在三条山路，追缉使还留着一枚可以接管山门的军印。你必须先把人手压到一个方向。",
        choices: [
          {
            id: "save-crowd",
            text: "护送伤者与见证人下山",
            description: "先把医者、向导和送报人带离追缉线，原卷与夺卷者交给留守者处理。",
            consumeDay: true,
            transition: {
              type: "branch",
              cases: [
                {
                  when: {
                    kind: "or",
                    items: [
                      {
                        kind: "arcVariant",
                        arcId: "shendiao",
                        key: "act8.entry",
                        eq: "refugee-witness",
                      },
                      {
                        kind: "and",
                        items: [
                          {
                            kind: "arcVariant",
                            arcId: "shendiao",
                            key: "act7.evacuation",
                            eq: "full",
                          },
                          { kind: "relation", npcId: "guojing", gte: 20 },
                        ],
                      },
                    ],
                  },
                  then: {
                    type: "battle",
                    enemyIds: [
                      "huashan-military-pursuer",
                      "huashan-record-raider",
                    ],
                    allyIds: [
                      "guojing",
                      "samarkand-healer",
                      "samarkand-guide",
                    ],
                    objective: {
                      kind: "surviveRounds",
                      rounds: 3,
                      protectAllyIds: [
                        "samarkand-healer",
                        "samarkand-guide",
                      ],
                      minProtectedSurvivors: 1,
                      title: "护送伤者车通过三段山路",
                    },
                    onWin: {
                      text: "郭靖挡住追缉使，你护着两名见证和伤者车通过三段山路。夺卷者趁乱从侧坡离开，没有被追上。",
                      consequences: [
                        {
                          kind: "arcVariant",
                          arcId: "shendiao",
                          key: "act8.value",
                          value: "save-crowd",
                        },
                        {
                          kind: "arcVariant",
                          arcId: "shendiao",
                          key: "act8.value-cost",
                          value: "culprit-escaped",
                        },
                        { kind: "relation", npcId: "guojing", delta: 6 },
                        { kind: "relation", npcId: "samarkand-healer", delta: 6 },
                      ],
                      then: { type: "goto", nodeId: "value-result-router" },
                    },
                    onPartial: {
                      text: "伤者车通过山口，一名见证却在混战中负伤。黄蓉来得及抢出主卷，装有异议页的副匣被夺卷者砸坏。",
                      consequences: [
                        {
                          kind: "arcVariant",
                          arcId: "shendiao",
                          key: "act8.value",
                          value: "save-crowd",
                        },
                        {
                          kind: "arcVariant",
                          arcId: "shendiao",
                          key: "act8.value-cost",
                          value: "record-damaged",
                        },
                        { kind: "relation", npcId: "samarkand-guide", delta: 3 },
                      ],
                      then: { type: "goto", nodeId: "value-result-router" },
                    },
                    onLose: {
                      text: "追缉骑卒逼停伤者车，你把送报人与伤者退到下层石亭。众人没有被带走，公议棚后的两只副卷匣却被砸毁。",
                      consequences: [
                        {
                          kind: "arcVariant",
                          arcId: "shendiao",
                          key: "act8.value",
                          value: "save-crowd",
                        },
                        {
                          kind: "arcVariant",
                          arcId: "shendiao",
                          key: "act8.value-cost",
                          value: "record-damaged",
                        },
                        { kind: "relation", npcId: "samarkand-healer", delta: 2 },
                      ],
                      then: { type: "goto", nodeId: "value-result-router" },
                    },
                    onFlee: {
                      text: "你带伤者车转入樵路，避开正面追缉。送报人与见证都下了山，夺卷者和追缉使却从两侧撤走。",
                      consequences: [
                        {
                          kind: "arcVariant",
                          arcId: "shendiao",
                          key: "act8.value",
                          value: "save-crowd",
                        },
                        {
                          kind: "arcVariant",
                          arcId: "shendiao",
                          key: "act8.value-cost",
                          value: "culprit-escaped",
                        },
                      ],
                      then: { type: "goto", nodeId: "value-result-router" },
                    },
                  },
                },
              ],
              else: {
                type: "battle",
                enemyIds: [
                  "huashan-military-pursuer",
                  "huashan-military-pursuer",
                  "huashan-record-raider",
                ],
                allyIds: [
                  "guojing",
                  "samarkand-healer",
                  "samarkand-guide",
                ],
                objective: {
                  kind: "surviveRounds",
                  rounds: 3,
                  protectAllyIds: [
                    "samarkand-healer",
                    "samarkand-guide",
                  ],
                  minProtectedSurvivors: 1,
                  title: "在增援到来前护送伤者车",
                },
                onWin: {
                  text: "你与郭靖在增援追骑之间守满三轮，伤者车全部通过山口。为此无人追击沿侧坡离开的夺卷者。",
                  consequences: [
                    {
                      kind: "arcVariant",
                      arcId: "shendiao",
                      key: "act8.value",
                      value: "save-crowd",
                    },
                    {
                      kind: "arcVariant",
                      arcId: "shendiao",
                      key: "act8.value-cost",
                      value: "culprit-escaped",
                    },
                    { kind: "relation", npcId: "guojing", delta: 4 },
                  ],
                  then: { type: "goto", nodeId: "value-result-router" },
                },
                onPartial: {
                  text: "伤者车勉强通过山口，一名见证负伤，存放战争异议页的副匣也在混战中破裂。",
                  consequences: [
                    {
                      kind: "arcVariant",
                      arcId: "shendiao",
                      key: "act8.value",
                      value: "save-crowd",
                    },
                    {
                      kind: "arcVariant",
                      arcId: "shendiao",
                      key: "act8.value-cost",
                      value: "record-damaged",
                    },
                  ],
                  then: { type: "goto", nodeId: "value-result-router" },
                },
                onLose: {
                  text: "追骑切断主路，你只能带伤者退进石亭。送报人没有被带走，公议棚后的副卷却无人看守。",
                  consequences: [
                    {
                      kind: "arcVariant",
                      arcId: "shendiao",
                      key: "act8.value",
                      value: "save-crowd",
                    },
                    {
                      kind: "arcVariant",
                      arcId: "shendiao",
                      key: "act8.value-cost",
                      value: "record-damaged",
                    },
                    { kind: "relation", npcId: "samarkand-guide", delta: 1 },
                  ],
                  then: { type: "goto", nodeId: "value-result-router" },
                },
                onFlee: {
                  text: "你改走樵路，把伤者和见证带离追缉线。追缉使与夺卷者都没有被留下。",
                  consequences: [
                    {
                      kind: "arcVariant",
                      arcId: "shendiao",
                      key: "act8.value",
                      value: "save-crowd",
                    },
                    {
                      kind: "arcVariant",
                      arcId: "shendiao",
                      key: "act8.value-cost",
                      value: "culprit-escaped",
                    },
                  ],
                  then: { type: "goto", nodeId: "value-result-router" },
                },
              },
            },
          },
          {
            id: "guard-record",
            text: "守住公议原卷与证人席",
            description: "把人手集中在封卷棚，伤者车与追缉者交给山下接应。",
            consumeDay: true,
            transition: {
              type: "branch",
              cases: [
                {
                  when: {
                    kind: "or",
                    items: [
                      {
                        kind: "and",
                        items: [
                          {
                            kind: "arcVariant",
                            arcId: "shendiao",
                            key: "act8.record",
                            eq: "full",
                          },
                          { kind: "relation", npcId: "huangrong", gte: 20 },
                        ],
                      },
                      {
                        kind: "arcVariant",
                        arcId: "shendiao",
                        key: "act8.witnesses",
                        eq: "broad",
                      },
                    ],
                  },
                  then: {
                    type: "battle",
                    enemyIds: [
                      "huashan-record-raider",
                      "huashan-military-pursuer",
                    ],
                    allyIds: ["huangrong", "kezhene"],
                    objective: {
                      kind: "surviveRounds",
                      rounds: 3,
                      protectAllyIds: ["huangrong", "kezhene"],
                      minProtectedSurvivors: 1,
                      title: "守住原卷与见证签名",
                    },
                    onWin: {
                      text: "你与黄蓉守住主卷和全部签名，柯镇恶也没有离开见证席。山下伤者车无人接应，多人被追骑逼回石亭。",
                      consequences: [
                        {
                          kind: "arcVariant",
                          arcId: "shendiao",
                          key: "act8.value",
                          value: "guard-record",
                        },
                        {
                          kind: "arcVariant",
                          arcId: "shendiao",
                          key: "act8.value-cost",
                          value: "people-hurt",
                        },
                        { kind: "relation", npcId: "huangrong", delta: 7 },
                        { kind: "relation", npcId: "kezhene", delta: 4 },
                      ],
                      then: { type: "goto", nodeId: "value-result-router" },
                    },
                    onPartial: {
                      text: "主卷与大部分签名保住，一名见证在争匣时负伤。山下伤者车同样遭到追骑冲撞。",
                      consequences: [
                        {
                          kind: "arcVariant",
                          arcId: "shendiao",
                          key: "act8.value",
                          value: "guard-record",
                        },
                        {
                          kind: "arcVariant",
                          arcId: "shendiao",
                          key: "act8.value-cost",
                          value: "people-hurt",
                        },
                        { kind: "relation", npcId: "huangrong", delta: 3 },
                      ],
                      then: { type: "goto", nodeId: "value-result-router" },
                    },
                    onLose: {
                      text: "你抢回主卷，却没能护住全部证人席。山腰与山下都有伤者，原卷仍保留可核的签名。",
                      consequences: [
                        {
                          kind: "arcVariant",
                          arcId: "shendiao",
                          key: "act8.value",
                          value: "guard-record",
                        },
                        {
                          kind: "arcVariant",
                          arcId: "shendiao",
                          key: "act8.value-cost",
                          value: "people-hurt",
                        },
                      ],
                      then: { type: "goto", nodeId: "value-result-router" },
                    },
                    onFlee: {
                      text: "你带主卷退出封卷棚，见证席随之散开。人没有被困在棚内，装有副本的两只木匣却被夺走。",
                      consequences: [
                        {
                          kind: "arcVariant",
                          arcId: "shendiao",
                          key: "act8.value",
                          value: "guard-record",
                        },
                        {
                          kind: "arcVariant",
                          arcId: "shendiao",
                          key: "act8.value-cost",
                          value: "record-damaged",
                        },
                      ],
                      then: { type: "goto", nodeId: "value-result-router" },
                    },
                  },
                },
              ],
              else: {
                type: "battle",
                enemyIds: [
                  "huashan-record-raider",
                  "huashan-record-raider",
                  "huashan-military-pursuer",
                ],
                allyIds: ["huangrong", "kezhene"],
                objective: {
                  kind: "surviveRounds",
                  rounds: 3,
                  protectAllyIds: ["huangrong", "kezhene"],
                  minProtectedSurvivors: 1,
                  title: "在分散见证中守住主卷",
                },
                onWin: {
                  text: "你们守住主卷与现有签名，分散在山路上的伤者却无人及时接应。",
                  consequences: [
                    {
                      kind: "arcVariant",
                      arcId: "shendiao",
                      key: "act8.value",
                      value: "guard-record",
                    },
                    {
                      kind: "arcVariant",
                      arcId: "shendiao",
                      key: "act8.value-cost",
                      value: "people-hurt",
                    },
                    { kind: "relation", npcId: "huangrong", delta: 4 },
                  ],
                  then: { type: "goto", nodeId: "value-result-router" },
                },
                onPartial: {
                  text: "主卷保住，一名见证负伤，山下伤者车也被迫停在追骑包围外。",
                  consequences: [
                    {
                      kind: "arcVariant",
                      arcId: "shendiao",
                      key: "act8.value",
                      value: "guard-record",
                    },
                    {
                      kind: "arcVariant",
                      arcId: "shendiao",
                      key: "act8.value-cost",
                      value: "people-hurt",
                    },
                  ],
                  then: { type: "goto", nodeId: "value-result-router" },
                },
                onLose: {
                  text: "你从破裂木匣中抢回主卷，见证席和山下伤者都有人负伤。",
                  consequences: [
                    {
                      kind: "arcVariant",
                      arcId: "shendiao",
                      key: "act8.value",
                      value: "guard-record",
                    },
                    {
                      kind: "arcVariant",
                      arcId: "shendiao",
                      key: "act8.value-cost",
                      value: "people-hurt",
                    },
                  ],
                  then: { type: "goto", nodeId: "value-result-router" },
                },
                onFlee: {
                  text: "你带主卷退入石室，见证席散开，两只副卷匣留在棚外被毁。",
                  consequences: [
                    {
                      kind: "arcVariant",
                      arcId: "shendiao",
                      key: "act8.value",
                      value: "guard-record",
                    },
                    {
                      kind: "arcVariant",
                      arcId: "shendiao",
                      key: "act8.value-cost",
                      value: "record-damaged",
                    },
                  ],
                  then: { type: "goto", nodeId: "value-result-router" },
                },
              },
            },
          },
          {
            id: "pursue-raiders",
            text: "追击夺卷者与灭口者",
            description: "离开原地追上责任人，让同伴分别照看伤者和原卷。",
            consumeDay: true,
            transition: {
              type: "branch",
              cases: [
                {
                  when: {
                    kind: "or",
                    items: [
                      {
                        kind: "arcVariant",
                        arcId: "shendiao",
                        key: "act7.role",
                        eq: "scout",
                      },
                      {
                        kind: "arcVariant",
                        arcId: "shendiao",
                        key: "act7.scout-method",
                        eq: "cavalry",
                      },
                      {
                        kind: "arcVariant",
                        arcId: "shendiao",
                        key: "act7.scout-method",
                        eq: "infiltration",
                      },
                      {
                        kind: "flag",
                        name: "shendiao.damos.growth",
                        eq: "riding",
                      },
                    ],
                  },
                  then: {
                    type: "battle",
                    enemyIds: [
                      "huashan-record-raider",
                      "huashan-military-pursuer",
                    ],
                    allyIds: ["guojing", "samarkand-guide"],
                    objective: {
                      kind: "defeatAll",
                      protectAllyIds: ["guojing", "samarkand-guide"],
                      minProtectedSurvivors: 1,
                      title: "追上夺卷者，保住引路人",
                    },
                    onWin: {
                      text: "向导带你截住侧坡出口，郭靖缴下追缉使兵刃。夺卷者与追缉文书都被留下，山下伤者却在无人接应时遭到冲撞。",
                      consequences: [
                        {
                          kind: "arcVariant",
                          arcId: "shendiao",
                          key: "act8.value",
                          value: "pursue-raiders",
                        },
                        {
                          kind: "arcVariant",
                          arcId: "shendiao",
                          key: "act8.value-cost",
                          value: "people-hurt",
                        },
                        { kind: "relation", npcId: "samarkand-guide", delta: 6 },
                        { kind: "reputation", delta: 5 },
                      ],
                      then: { type: "goto", nodeId: "value-result-router" },
                    },
                    onPartial: {
                      text: "夺卷者被截住，一名追击同伴却负伤。山腰主卷保住，留在棚外的副卷遭人撕毁。",
                      consequences: [
                        {
                          kind: "arcVariant",
                          arcId: "shendiao",
                          key: "act8.value",
                          value: "pursue-raiders",
                        },
                        {
                          kind: "arcVariant",
                          arcId: "shendiao",
                          key: "act8.value-cost",
                          value: "record-damaged",
                        },
                        { kind: "relation", npcId: "guojing", delta: 2 },
                      ],
                      then: { type: "goto", nodeId: "value-result-router" },
                    },
                    onLose: {
                      text: "夺卷者分路退走，你只留下追缉文书与一枚腰牌。追击期间，山下伤者车被逼回石亭。",
                      consequences: [
                        {
                          kind: "arcVariant",
                          arcId: "shendiao",
                          key: "act8.value",
                          value: "pursue-raiders",
                        },
                        {
                          kind: "arcVariant",
                          arcId: "shendiao",
                          key: "act8.value-cost",
                          value: "people-hurt",
                        },
                      ],
                      then: { type: "goto", nodeId: "value-result-router" },
                    },
                    onFlee: {
                      text: "你放弃追击，带负伤同伴退回公议棚。夺卷者砸毁一只副卷匣后离开。",
                      consequences: [
                        {
                          kind: "arcVariant",
                          arcId: "shendiao",
                          key: "act8.value",
                          value: "pursue-raiders",
                        },
                        {
                          kind: "arcVariant",
                          arcId: "shendiao",
                          key: "act8.value-cost",
                          value: "record-damaged",
                        },
                      ],
                      then: { type: "goto", nodeId: "value-result-router" },
                    },
                  },
                },
              ],
              else: {
                type: "battle",
                enemyIds: [
                  "huashan-record-raider",
                  "huashan-record-raider",
                  "huashan-military-pursuer",
                ],
                allyIds: ["guojing", "samarkand-guide"],
                objective: {
                  kind: "defeatAll",
                  protectAllyIds: ["guojing", "samarkand-guide"],
                  minProtectedSurvivors: 1,
                  title: "在陌生侧坡追截夺卷者",
                },
                onWin: {
                  text: "你们在侧坡尽头截住三名追缉者，代价是山下伤者无人及时接应。",
                  consequences: [
                    {
                      kind: "arcVariant",
                      arcId: "shendiao",
                      key: "act8.value",
                      value: "pursue-raiders",
                    },
                    {
                      kind: "arcVariant",
                      arcId: "shendiao",
                      key: "act8.value-cost",
                      value: "people-hurt",
                    },
                    { kind: "reputation", delta: 3 },
                  ],
                  then: { type: "goto", nodeId: "value-result-router" },
                },
                onPartial: {
                  text: "夺卷者被截住，一名同伴负伤，公议棚外的副卷无人照看而被毁。",
                  consequences: [
                    {
                      kind: "arcVariant",
                      arcId: "shendiao",
                      key: "act8.value",
                      value: "pursue-raiders",
                    },
                    {
                      kind: "arcVariant",
                      arcId: "shendiao",
                      key: "act8.value-cost",
                      value: "record-damaged",
                    },
                  ],
                  then: { type: "goto", nodeId: "value-result-router" },
                },
                onLose: {
                  text: "侧坡岔路拖慢追击，你只抢回一册残卷。山下伤者车也在混乱中被冲散。",
                  consequences: [
                    {
                      kind: "arcVariant",
                      arcId: "shendiao",
                      key: "act8.value",
                      value: "pursue-raiders",
                    },
                    {
                      kind: "arcVariant",
                      arcId: "shendiao",
                      key: "act8.value-cost",
                      value: "people-hurt",
                    },
                  ],
                  then: { type: "goto", nodeId: "value-result-router" },
                },
                onFlee: {
                  text: "你带负伤同伴退出侧坡，夺卷者趁机毁掉一只副卷匣。",
                  consequences: [
                    {
                      kind: "arcVariant",
                      arcId: "shendiao",
                      key: "act8.value",
                      value: "pursue-raiders",
                    },
                    {
                      kind: "arcVariant",
                      arcId: "shendiao",
                      key: "act8.value-cost",
                      value: "record-damaged",
                    },
                  ],
                  then: { type: "goto", nodeId: "value-result-router" },
                },
              },
            },
          },
          {
            id: "claim-seat",
            text: "接过军印，以席位接管山门",
            description: "用军职、阵营支持或名望命令各方停手，由你决定扣人和封卷次序。",
            condition: {
              kind: "or",
              items: [
                {
                  kind: "arcVariant",
                  arcId: "shendiao",
                  key: "act8.entry",
                  eq: "mongol-envoy",
                },
                { kind: "reputation", gte: 40 },
                { kind: "factionAttitude", factionId: "mongol", gte: 20 },
              ],
            },
            consumeDay: true,
            consequences: [
              {
                kind: "arcVariant",
                arcId: "shendiao",
                key: "act8.value",
                value: "claim-seat",
              },
              {
                kind: "arcVariant",
                arcId: "shendiao",
                key: "act8.value-cost",
                value: "trust-lost",
              },
              { kind: "factionAttitude", factionId: "mongol", delta: 6 },
              { kind: "reputation", delta: 5 },
              { kind: "relation", npcId: "guojing", delta: -10 },
              { kind: "relation", npcId: "huangrong", delta: -8 },
            ],
            resultText: "你接过军印，命追缉骑卒封住三条山路，又要求伤者、见证与原卷依次受验。冲突停下，郭靖和黄蓉同时撤回自己的接应人手。",
            transition: { type: "goto", nodeId: "value-result-router" },
          },
        ],
      },
      "value-result-router": {
        id: "value-result-router",
        title: "保住什么，失去什么",
        text: "山门冲突已经停下。被优先保护的人、卷或责任人留在场中，另一处代价也已经发生。",
        autoNext: {
          type: "branch",
          cases: [
            {
              when: {
                kind: "and",
                items: [
                  {
                    kind: "arcVariant",
                    arcId: "shendiao",
                    key: "act8.value",
                    eq: "save-crowd",
                  },
                  {
                    kind: "arcVariant",
                    arcId: "shendiao",
                    key: "act8.value-cost",
                    eq: "culprit-escaped",
                  },
                ],
              },
              then: { type: "goto", nodeId: "result-crowd-culprit" },
            },
            {
              when: {
                kind: "arcVariant",
                arcId: "shendiao",
                key: "act8.value",
                eq: "save-crowd",
              },
              then: { type: "goto", nodeId: "result-crowd-record" },
            },
            {
              when: {
                kind: "and",
                items: [
                  {
                    kind: "arcVariant",
                    arcId: "shendiao",
                    key: "act8.value",
                    eq: "guard-record",
                  },
                  {
                    kind: "arcVariant",
                    arcId: "shendiao",
                    key: "act8.value-cost",
                    eq: "record-damaged",
                  },
                ],
              },
              then: { type: "goto", nodeId: "result-record-damaged" },
            },
            {
              when: {
                kind: "arcVariant",
                arcId: "shendiao",
                key: "act8.value",
                eq: "guard-record",
              },
              then: { type: "goto", nodeId: "result-record-people" },
            },
            {
              when: {
                kind: "and",
                items: [
                  {
                    kind: "arcVariant",
                    arcId: "shendiao",
                    key: "act8.value",
                    eq: "pursue-raiders",
                  },
                  {
                    kind: "arcVariant",
                    arcId: "shendiao",
                    key: "act8.value-cost",
                    eq: "record-damaged",
                  },
                ],
              },
              then: { type: "goto", nodeId: "result-pursuit-record" },
            },
            {
              when: {
                kind: "arcVariant",
                arcId: "shendiao",
                key: "act8.value",
                eq: "pursue-raiders",
              },
              then: { type: "goto", nodeId: "result-pursuit-people" },
            },
            {
              when: {
                kind: "arcVariant",
                arcId: "shendiao",
                key: "act8.value",
                eq: "claim-seat",
              },
              then: { type: "goto", nodeId: "result-claimed-seat" },
            },
          ],
          else: { type: "goto", nodeId: "crisis-close" },
        },
      },
      "result-crowd-culprit": {
        id: "result-crowd-culprit",
        title: "人车已经下山",
        text: "伤者、送报人和见证都离开追缉线，夺卷者却带着一枚军印或残页逃走。公议主卷仍在，责任人没有被留下。",
        autoNext: { type: "goto", nodeId: "crisis-close" },
      },
      "result-crowd-record": {
        id: "result-crowd-record",
        title: "人留下，副卷受损",
        text: "伤者与见证没有被带走，公议主卷也被抢回。部分副本、异议页或封条已经损坏，后续只能按现存主卷继续。",
        autoNext: { type: "goto", nodeId: "crisis-close" },
      },
      "result-record-people": {
        id: "result-record-people",
        title: "原卷仍可核验",
        text: "公议原卷、签名和主要副本保住了。山下伤者与山腰见证都有人负伤，这些名字被补进新的伤者名册。",
        autoNext: { type: "goto", nodeId: "crisis-close" },
      },
      "result-record-damaged": {
        id: "result-record-damaged",
        title: "只保住主卷",
        text: "主卷仍可核验，部分副本与见证签名已经损坏。公议结果没有消失，却无法再靠多份抄件互证。",
        autoNext: { type: "goto", nodeId: "crisis-close" },
      },
      "result-pursuit-people": {
        id: "result-pursuit-people",
        title: "追缉者留下",
        text: "夺卷者、腰牌或追缉文书被留在华山，山下伤者却因无人接应而增加。责任人到案，代价进入伤者名册。",
        autoNext: { type: "goto", nodeId: "crisis-close" },
      },
      "result-pursuit-record": {
        id: "result-pursuit-record",
        title: "追责换来残卷",
        text: "夺卷者的身份线索被留下，公议副卷却在追击期间受损。责任线仍能追查，记录不再完整。",
        autoNext: { type: "goto", nodeId: "crisis-close" },
      },
      "result-claimed-seat": {
        id: "result-claimed-seat",
        title: "山门听令",
        text: "追缉骑卒、守山弟子和送报人都按新次序停在原地。你保住了调度权，郭靖与黄蓉却不再替这道命令担保。",
        autoNext: { type: "goto", nodeId: "crisis-close" },
      },
      "crisis-close": {
        id: "crisis-close",
        title: "最后军报·终",
        text: "伤者、原卷、责任人与山门席位已经各有结果。绝顶石台仍在等论剑，山腰留下的代价也会一同带上去。",
        onEnter: [
          {
            kind: "arcVariant",
            arcId: "shendiao",
            key: "act8.value-stage",
            value: "cleared",
          },
        ],
        autoNext: { type: "end" },
      },
    },
  },
  {
    id: SHENDIAO_ACT8_EVENT_IDS.contest,
    entryNode: "summit-arrival",
    locationId: "huashan",
    weight: 12,
    once: true,
    condition: {
      kind: "and",
      items: [
        {
          kind: "arcBeat",
          arcId: "shendiao",
          beat: "act7-western-campaign",
          result: "done",
        },
        {
          kind: "arcVariant",
          arcId: "shendiao",
          key: "act8.value-stage",
          eq: "cleared",
        },
        {
          kind: "not",
          item: {
            kind: "arcVariant",
            arcId: "shendiao",
            key: "act8.contest",
            eq: "cleared",
          },
        },
        {
          kind: "not",
          item: { kind: "arcBeat", arcId: "shendiao", beat: "act8-huashan" },
        },
      ],
    },
    nodes: {
      "summit-arrival": {
        id: "summit-arrival",
        title: "绝顶论剑",
        text: "绝顶石台没有擂台旗号，只有东邪、北丐、西毒、一灯和几方见证各据一侧。山腰的伤者、原卷与追缉结果也被带到石台外，没有一件事因登顶而消失。",
        autoNext: {
          type: "branch",
          cases: [
            {
              when: {
                kind: "arcVariant",
                arcId: "shendiao",
                key: "act8.value-cost",
                eq: "people-hurt",
              },
              then: { type: "goto", nodeId: "summit-with-wounded" },
            },
            {
              when: {
                kind: "arcVariant",
                arcId: "shendiao",
                key: "act8.value-cost",
                eq: "record-damaged",
              },
              then: { type: "goto", nodeId: "summit-with-damaged-record" },
            },
            {
              when: {
                kind: "arcVariant",
                arcId: "shendiao",
                key: "act8.value-cost",
                eq: "culprit-escaped",
              },
              then: { type: "goto", nodeId: "summit-with-open-pursuit" },
            },
          ],
          else: { type: "goto", nodeId: "summit-with-lost-trust" },
        },
      },
      "summit-with-wounded": {
        id: "summit-with-wounded",
        title: "伤者留在石台外",
        text: "医者在避风石后照看新伤，郭靖和黄蓉轮流下台查看。石台仍可论武，但愿意替你压阵的人先分出了一半去照料伤者。",
        autoNext: { type: "goto", nodeId: "mad-westerner" },
      },
      "summit-with-damaged-record": {
        id: "summit-with-damaged-record",
        title: "残卷摆在石案上",
        text: "黄蓉把尚能核验的主卷压在石案上，破裂封条和缺失副本另放一侧。任何想借论剑改写记录的人，都得先面对这些缺页。",
        autoNext: { type: "goto", nodeId: "mad-westerner" },
      },
      "summit-with-open-pursuit": {
        id: "summit-with-open-pursuit",
        title: "侧坡仍有追踪印记",
        text: "夺卷者或追缉使已经离开，商道向导在侧坡留下追踪标记。石台上的人知道责任人未到案，论剑结束后仍有人要沿标记下山。",
        autoNext: { type: "goto", nodeId: "mad-westerner" },
      },
      "summit-with-lost-trust": {
        id: "summit-with-lost-trust",
        title: "军印占了一席",
        text: "军印与使帖被放在石台东侧，郭靖和黄蓉没有坐到这一席。官方秩序保住了位置，原本愿意替你作证的人却各自退开。",
        autoNext: { type: "goto", nodeId: "mad-westerner" },
      },
      "mad-westerner": {
        id: "mad-westerner",
        title: "疯者站上石台",
        text: "欧阳锋倒行招式，接连逼退黄药师与洪七公，又转身追问在场众人自己的姓名。欧阳锋：\"谁是欧阳锋？你们说的那个人，武功可胜得过我？\"黄药师收起玉箫，没有替他回答。",
        autoNext: { type: "goto", nodeId: "martial-choice" },
      },
      "martial-choice": {
        id: "martial-choice",
        title: "以何种方式留在绝顶",
        text: "疯者夺台之后，石台不再有一份人人承认的名次。你仍可选择对决、守台、护卷、观战或退席，每条路都会留下独立的武学结果。",
        choices: [
          {
            id: "duel",
            text: "正面挑战一名可用对手",
            description: "以单场对决验证武学；对手由白驼、桃花岛和郭靖关系决定。",
            condition: {
              kind: "or",
              items: [
                { kind: "reputation", gte: 25 },
                { kind: "hasSkill", id: "xianglong18" },
                { kind: "hasSkill", id: "dugu9" },
                { kind: "hasSkill", id: "jiuyang" },
                { kind: "hasSkill", id: "yiyangzhi" },
                { kind: "hasSkill", id: "kongming" },
                { kind: "hasSkill", id: "hamagong" },
              ],
            },
            consumeDay: true,
            transition: {
              type: "branch",
              cases: [
                {
                  when: {
                    kind: "or",
                    items: [
                      { kind: "relation", npcId: "ouyangfeng-npc", gte: 15 },
                      { kind: "hasSkill", id: "hamagong" },
                      { kind: "hasSkill", id: "lingshiquan" },
                    ],
                  },
                  then: {
                    type: "battle",
                    enemyId: "ouyangfeng",
                    lethal: false,
                    objective: {
                      kind: "defeatAll",
                      title: "在疯者乱招中完成正面对决",
                    },
                    onWin: {
                      text: "你在乱招中逼欧阳锋退到石台边缘。他没有认输，只转身去问黄药师自己的名字。石台见证仍把这一场记为你胜。",
                      consequences: [
                        {
                          kind: "arcVariant",
                          arcId: "shendiao",
                          key: "act8.martial-path",
                          value: "duel",
                        },
                        {
                          kind: "arcVariant",
                          arcId: "shendiao",
                          key: "act8.martial",
                          value: "won",
                        },
                        { kind: "reputation", delta: 15 },
                        { kind: "relation", npcId: "ouyangfeng-npc", delta: 4 },
                      ],
                      then: { type: "goto", nodeId: "title-router" },
                    },
                    onLose: {
                      text: "欧阳锋的逆行招式打乱你的换气，你退出石台才避开后续连击。见证记录败局，也保留你主动下场的名字。",
                      consequences: [
                        {
                          kind: "arcVariant",
                          arcId: "shendiao",
                          key: "act8.martial-path",
                          value: "duel",
                        },
                        {
                          kind: "arcVariant",
                          arcId: "shendiao",
                          key: "act8.martial",
                          value: "lost",
                        },
                        { kind: "relation", npcId: "hongqigong", delta: 2 },
                      ],
                      then: { type: "goto", nodeId: "title-router" },
                    },
                    onFlee: {
                      text: "你在乱招合围前退出石台，没有让疯者继续追入见证席。此战记为败，不影响你此前的公议与价值行动。",
                      consequences: [
                        {
                          kind: "arcVariant",
                          arcId: "shendiao",
                          key: "act8.martial-path",
                          value: "duel",
                        },
                        {
                          kind: "arcVariant",
                          arcId: "shendiao",
                          key: "act8.martial",
                          value: "lost",
                        },
                      ],
                      then: { type: "goto", nodeId: "title-router" },
                    },
                  },
                },
                {
                  when: {
                    kind: "and",
                    items: [
                      {
                        kind: "arcVariant",
                        arcId: "shendiao",
                        key: "act4.taohua-route",
                        eq: "guo-huang",
                      },
                      { kind: "relation", npcId: "huangyaoshi-npc", gte: 15 },
                    ],
                  },
                  then: {
                    type: "battle",
                    enemyId: "huangyaoshi",
                    lethal: false,
                    objective: {
                      kind: "defeatAll",
                      title: "接下东邪的奇门试招",
                    },
                    onWin: {
                      text: "你避开玉箫虚招，在石台第三次换位时封住黄药师退路。黄药师收招。黄药师：\"这一局是你占先，不必多说。\"",
                      consequences: [
                        {
                          kind: "arcVariant",
                          arcId: "shendiao",
                          key: "act8.martial-path",
                          value: "duel",
                        },
                        {
                          kind: "arcVariant",
                          arcId: "shendiao",
                          key: "act8.martial",
                          value: "won",
                        },
                        { kind: "reputation", delta: 15 },
                        { kind: "relation", npcId: "huangyaoshi-npc", delta: 8 },
                      ],
                      then: { type: "goto", nodeId: "title-router" },
                    },
                    onLose: {
                      text: "黄药师连续变换方位，你在第七次错步后被逼出石台。黄药师没有追击，只让执笔人照实记下胜负。",
                      consequences: [
                        {
                          kind: "arcVariant",
                          arcId: "shendiao",
                          key: "act8.martial-path",
                          value: "duel",
                        },
                        {
                          kind: "arcVariant",
                          arcId: "shendiao",
                          key: "act8.martial",
                          value: "lost",
                        },
                        { kind: "relation", npcId: "huangyaoshi-npc", delta: 3 },
                      ],
                      then: { type: "goto", nodeId: "title-router" },
                    },
                    onFlee: {
                      text: "你在奇门步法收紧前退出石台。黄药师收箫，这一场按败局入册。",
                      consequences: [
                        {
                          kind: "arcVariant",
                          arcId: "shendiao",
                          key: "act8.martial-path",
                          value: "duel",
                        },
                        {
                          kind: "arcVariant",
                          arcId: "shendiao",
                          key: "act8.martial",
                          value: "lost",
                        },
                      ],
                      then: { type: "goto", nodeId: "title-router" },
                    },
                  },
                },
              ],
              else: {
                type: "battle",
                enemyId: "guojing",
                lethal: false,
                objective: {
                  kind: "defeatAll",
                  title: "与郭靖完成三百招之约",
                },
                onWin: {
                  text: "你在三百招内占住石台中线，郭靖收掌退开一步。郭靖：\"这一场你赢。军报和山下的事，仍照原来的记录算。\"",
                  consequences: [
                    {
                      kind: "arcVariant",
                      arcId: "shendiao",
                      key: "act8.martial-path",
                      value: "duel",
                    },
                    {
                      kind: "arcVariant",
                      arcId: "shendiao",
                      key: "act8.martial",
                      value: "won",
                    },
                    { kind: "reputation", delta: 15 },
                    { kind: "relation", npcId: "guojing", delta: 8 },
                  ],
                  then: { type: "goto", nodeId: "title-router" },
                },
                onLose: {
                  text: "郭靖守住中线，三百招后仍未露出可乘之隙。你按约退出石台，郭靖先去扶起台边受伤的见证人。",
                  consequences: [
                    {
                      kind: "arcVariant",
                      arcId: "shendiao",
                      key: "act8.martial-path",
                      value: "duel",
                    },
                    {
                      kind: "arcVariant",
                      arcId: "shendiao",
                      key: "act8.martial",
                      value: "lost",
                    },
                    { kind: "relation", npcId: "guojing", delta: 4 },
                  ],
                  then: { type: "goto", nodeId: "title-router" },
                },
                onFlee: {
                  text: "你在三百招未满前退出石台，郭靖立即收掌。这一场按败局记录，双方无人追击。",
                  consequences: [
                    {
                      kind: "arcVariant",
                      arcId: "shendiao",
                      key: "act8.martial-path",
                      value: "duel",
                    },
                    {
                      kind: "arcVariant",
                      arcId: "shendiao",
                      key: "act8.martial",
                      value: "lost",
                    },
                  ],
                  then: { type: "goto", nodeId: "title-router" },
                },
              },
            },
          },
          {
            id: "hold-platform",
            text: "守住石台，应对多方轮番抢台",
            description: "以守台四轮代替单挑；同伴全部站稳为完整达成，保住一人则部分达成。",
            condition: {
              kind: "or",
              items: [
                { kind: "reputation", gte: 25 },
                {
                  kind: "arcVariant",
                  arcId: "shendiao",
                  key: "act8.value",
                  eq: "claim-seat",
                },
                {
                  kind: "arcVariant",
                  arcId: "shendiao",
                  key: "act8.entry",
                  eq: "mongol-envoy",
                },
              ],
            },
            consumeDay: true,
            transition: {
              type: "battle",
              enemyIds: ["ouyangfeng", "qiuqianren", "quanzhen-blockade"],
              allyIds: ["hongqigong", "huangyaoshi-npc"],
              objective: {
                kind: "surviveRounds",
                rounds: 4,
                protectAllyIds: ["hongqigong", "huangyaoshi-npc"],
                minProtectedSurvivors: 1,
                title: "守满四轮，保住两名压阵宗师",
              },
              onWin: {
                text: "四轮抢台结束，洪七公与黄药师都仍站在石台两侧。你没有追赶退下的对手，守台按完整达成记入名册。",
                consequences: [
                  {
                    kind: "arcVariant",
                    arcId: "shendiao",
                    key: "act8.martial-path",
                    value: "hold-platform",
                  },
                  {
                    kind: "arcVariant",
                    arcId: "shendiao",
                    key: "act8.martial",
                    value: "held",
                  },
                  { kind: "reputation", delta: 18 },
                  { kind: "relation", npcId: "hongqigong", delta: 6 },
                  { kind: "relation", npcId: "huangyaoshi-npc", delta: 4 },
                ],
                then: { type: "goto", nodeId: "title-router" },
              },
              onPartial: {
                text: "你守满四轮，一名压阵宗师却在换位时负伤退出。石台没有失守，这一场按部分达成记录。",
                consequences: [
                  {
                    kind: "arcVariant",
                    arcId: "shendiao",
                    key: "act8.martial-path",
                    value: "hold-platform",
                  },
                  {
                    kind: "arcVariant",
                    arcId: "shendiao",
                    key: "act8.martial",
                    value: "partial",
                  },
                  { kind: "reputation", delta: 8 },
                ],
                then: { type: "goto", nodeId: "title-router" },
              },
              onLose: {
                text: "三路抢台先后压住石台中线，两名压阵者也被迫退开。守台失败，山腰公议记录不因此改变。",
                consequences: [
                  {
                    kind: "arcVariant",
                    arcId: "shendiao",
                    key: "act8.martial-path",
                    value: "hold-platform",
                  },
                  {
                    kind: "arcVariant",
                    arcId: "shendiao",
                    key: "act8.martial",
                    value: "lost",
                  },
                ],
                then: { type: "goto", nodeId: "title-router" },
              },
              onFlee: {
                text: "你主动撤下石台，把压阵者带离乱招中心。守台记为失败，人员没有继续留在台上。",
                consequences: [
                  {
                    kind: "arcVariant",
                    arcId: "shendiao",
                    key: "act8.martial-path",
                    value: "hold-platform",
                  },
                  {
                    kind: "arcVariant",
                    arcId: "shendiao",
                    key: "act8.martial",
                    value: "lost",
                  },
                ],
                then: { type: "goto", nodeId: "title-router" },
              },
            },
          },
          {
            id: "protect-descent",
            text: "护送记录与见证下山",
            description: "不争石台名次，沿下峰路抵挡仍未撤走的追兵。",
            consumeDay: true,
            transition: {
              type: "branch",
              cases: [
                {
                  when: {
                    kind: "and",
                    items: [
                      {
                        kind: "arcVariant",
                        arcId: "shendiao",
                        key: "act8.record",
                        eq: "full",
                      },
                      {
                        kind: "or",
                        items: [
                          {
                            kind: "arcVariant",
                            arcId: "shendiao",
                            key: "act8.value",
                            eq: "save-crowd",
                          },
                          {
                            kind: "arcVariant",
                            arcId: "shendiao",
                            key: "act8.value",
                            eq: "guard-record",
                          },
                        ],
                      },
                    ],
                  },
                  then: {
                    type: "battle",
                    enemyIds: [
                      "huashan-military-pursuer",
                      "huashan-record-raider",
                    ],
                    allyIds: ["huangrong", "kezhene", "samarkand-guide"],
                    objective: {
                      kind: "surviveRounds",
                      rounds: 3,
                      protectAllyIds: [
                        "huangrong",
                        "kezhene",
                        "samarkand-guide",
                      ],
                      minProtectedSurvivors: 2,
                      title: "护住主卷与三名送达人",
                    },
                    onWin: {
                      text: "主卷与三名送达人全部通过下峰路。你没有在绝顶留下名次，记录却由不同见证分别带走。",
                      consequences: [
                        {
                          kind: "arcVariant",
                          arcId: "shendiao",
                          key: "act8.martial-path",
                          value: "protect-descent",
                        },
                        {
                          kind: "arcVariant",
                          arcId: "shendiao",
                          key: "act8.martial",
                          value: "won",
                        },
                        { kind: "reputation", delta: 8 },
                        { kind: "relation", npcId: "huangrong", delta: 6 },
                        { kind: "relation", npcId: "kezhene", delta: 4 },
                      ],
                      then: { type: "goto", nodeId: "title-router" },
                    },
                    onPartial: {
                      text: "主卷通过下峰路，一名送达人却在断崖口负伤。两份具名副本仍被分别带走，护送按部分达成记录。",
                      consequences: [
                        {
                          kind: "arcVariant",
                          arcId: "shendiao",
                          key: "act8.martial-path",
                          value: "protect-descent",
                        },
                        {
                          kind: "arcVariant",
                          arcId: "shendiao",
                          key: "act8.martial",
                          value: "partial",
                        },
                        { kind: "relation", npcId: "samarkand-guide", delta: 3 },
                      ],
                      then: { type: "goto", nodeId: "title-router" },
                    },
                    onLose: {
                      text: "追兵截断下峰路，送达人退回绝顶石室。主卷仍在华山，护送未能完成。",
                      consequences: [
                        {
                          kind: "arcVariant",
                          arcId: "shendiao",
                          key: "act8.martial-path",
                          value: "protect-descent",
                        },
                        {
                          kind: "arcVariant",
                          arcId: "shendiao",
                          key: "act8.martial",
                          value: "lost",
                        },
                      ],
                      then: { type: "goto", nodeId: "title-router" },
                    },
                    onFlee: {
                      text: "你放弃主路，带现存送达人退回石室。追兵没有拿到主卷，护送也未能下山。",
                      consequences: [
                        {
                          kind: "arcVariant",
                          arcId: "shendiao",
                          key: "act8.martial-path",
                          value: "protect-descent",
                        },
                        {
                          kind: "arcVariant",
                          arcId: "shendiao",
                          key: "act8.martial",
                          value: "lost",
                        },
                      ],
                      then: { type: "goto", nodeId: "title-router" },
                    },
                  },
                },
              ],
              else: {
                type: "battle",
                enemyIds: [
                  "huashan-military-pursuer",
                  "huashan-record-raider",
                  "western-pursuer",
                ],
                allyIds: ["huangrong", "samarkand-guide"],
                objective: {
                  kind: "surviveRounds",
                  rounds: 3,
                  protectAllyIds: ["huangrong", "samarkand-guide"],
                  minProtectedSurvivors: 1,
                  title: "护送残卷与现存见证下山",
                },
                onWin: {
                  text: "现存记录与两名送达人通过下峰路，缺页仍旧缺失。你没有争夺石台名次，护送按完整达成记录。",
                  consequences: [
                    {
                      kind: "arcVariant",
                      arcId: "shendiao",
                      key: "act8.martial-path",
                      value: "protect-descent",
                    },
                    {
                      kind: "arcVariant",
                      arcId: "shendiao",
                      key: "act8.martial",
                      value: "won",
                    },
                    { kind: "reputation", delta: 6 },
                    { kind: "relation", npcId: "huangrong", delta: 4 },
                  ],
                  then: { type: "goto", nodeId: "title-router" },
                },
                onPartial: {
                  text: "一名送达人带着主卷下山，另一人负伤退回石室。护送按部分达成记录。",
                  consequences: [
                    {
                      kind: "arcVariant",
                      arcId: "shendiao",
                      key: "act8.martial-path",
                      value: "protect-descent",
                    },
                    {
                      kind: "arcVariant",
                      arcId: "shendiao",
                      key: "act8.martial",
                      value: "partial",
                    },
                  ],
                  then: { type: "goto", nodeId: "title-router" },
                },
                onLose: {
                  text: "追兵逼退下峰队伍，现存记录只能留在绝顶石室。护送未能完成。",
                  consequences: [
                    {
                      kind: "arcVariant",
                      arcId: "shendiao",
                      key: "act8.martial-path",
                      value: "protect-descent",
                    },
                    {
                      kind: "arcVariant",
                      arcId: "shendiao",
                      key: "act8.martial",
                      value: "lost",
                    },
                  ],
                  then: { type: "goto", nodeId: "title-router" },
                },
                onFlee: {
                  text: "你带送达人退回绝顶，放弃从主路下山。追兵没有夺卷，护送也没有完成。",
                  consequences: [
                    {
                      kind: "arcVariant",
                      arcId: "shendiao",
                      key: "act8.martial-path",
                      value: "protect-descent",
                    },
                    {
                      kind: "arcVariant",
                      arcId: "shendiao",
                      key: "act8.martial",
                      value: "lost",
                    },
                  ],
                  then: { type: "goto", nodeId: "title-router" },
                },
              },
            },
          },
          {
            id: "observe",
            text: "观战拆招，不争石台名次",
            description: "按已学武功和宗师关系观察不同招路，得到理解结果。",
            consequences: [
              {
                kind: "arcVariant",
                arcId: "shendiao",
                key: "act8.martial-path",
                value: "observe",
              },
            ],
            transition: { type: "goto", nodeId: "observe-router" },
          },
          {
            id: "decline",
            text: "明确退出论剑",
            description: "不争名次，保留此前公议、价值行动与人物关系结果。",
            consequences: [
              {
                kind: "arcVariant",
                arcId: "shendiao",
                key: "act8.martial-path",
                value: "decline",
              },
              {
                kind: "arcVariant",
                arcId: "shendiao",
                key: "act8.martial",
                value: "refused",
              },
              { kind: "relation", npcId: "guojing", delta: 2 },
            ],
            resultText: "你把石台中线让给继续试招的人，回到伤者、见证与原卷所在的一侧。执笔人注明你主动退席，而非败退。",
            transition: { type: "goto", nodeId: "title-router" },
          },
        ],
      },
      "observe-router": {
        id: "observe-router",
        title: "从哪一路拆招",
        text: "石台上各家招路不断变化。你能看懂多少，取决于已经练过的武功和与宗师往来的深浅。",
        autoNext: {
          type: "branch",
          cases: [
            {
              when: {
                kind: "or",
                items: [
                  { kind: "hasSkill", id: "hamagong" },
                  { kind: "hasSkill", id: "lingshiquan" },
                ],
              },
              then: { type: "goto", nodeId: "observe-reversed-meridians" },
            },
            {
              when: {
                kind: "or",
                items: [
                  { kind: "hasSkill", id: "xianglong18" },
                  { kind: "hasSkill", id: "kongming" },
                ],
              },
              then: { type: "goto", nodeId: "observe-hard-soft" },
            },
            {
              when: {
                kind: "or",
                items: [
                  { kind: "hasSkill", id: "lanhua" },
                  { kind: "relation", npcId: "huangyaoshi-npc", gte: 20 },
                ],
              },
              then: { type: "goto", nodeId: "observe-changing-steps" },
            },
          ],
          else: { type: "goto", nodeId: "observe-breathing" },
        },
      },
      "observe-reversed-meridians": {
        id: "observe-reversed-meridians",
        title: "逆行招路",
        text: "你认出欧阳锋每次逆转经脉后的停顿，也看见黄药师与洪七公如何避开正面硬接。疯者仍压住石台，破绽却不再完全无迹可寻。",
        onEnter: [
          {
            kind: "arcVariant",
            arcId: "shendiao",
            key: "act8.martial",
            value: "understood",
          },
          { kind: "exp", delta: 120 },
          { kind: "relation", npcId: "ouyangfeng-npc", delta: 2 },
        ],
        autoNext: { type: "goto", nodeId: "title-router" },
      },
      "observe-hard-soft": {
        id: "observe-hard-soft",
        title: "刚掌与空明",
        text: "郭靖的掌势从正面压住石台，周伯通留下的空明路数却从侧面卸力。你把两种换劲时机逐次记下，没有下场争胜。",
        onEnter: [
          {
            kind: "arcVariant",
            arcId: "shendiao",
            key: "act8.martial",
            value: "understood",
          },
          { kind: "exp", delta: 120 },
          { kind: "relation", npcId: "guojing", delta: 3 },
        ],
        autoNext: { type: "goto", nodeId: "title-router" },
      },
      "observe-changing-steps": {
        id: "observe-changing-steps",
        title: "奇门换位",
        text: "黄药师每次换位都先借石台风向遮住一步。你按桃花岛旧阵与兰花拂穴手的节奏拆看，记下三处可进可退的位置。",
        onEnter: [
          {
            kind: "arcVariant",
            arcId: "shendiao",
            key: "act8.martial",
            value: "understood",
          },
          { kind: "exp", delta: 110 },
          { kind: "relation", npcId: "huangyaoshi-npc", delta: 4 },
        ],
        autoNext: { type: "goto", nodeId: "title-router" },
      },
      "observe-breathing": {
        id: "observe-breathing",
        title: "先看换气",
        text: "你不追逐招式名称，只记录每个人出手、回气与收势的间隔。一灯的指力和洪七公的掌势各有节奏，仍能拆出可用的基本法门。",
        onEnter: [
          {
            kind: "arcVariant",
            arcId: "shendiao",
            key: "act8.martial",
            value: "understood",
          },
          { kind: "exp", delta: 80 },
          { kind: "aptitude", delta: 1 },
        ],
        autoNext: { type: "goto", nodeId: "title-router" },
      },
      "title-router": {
        id: "title-router",
        title: "石台名册",
        text: "试招与护送结束后，执笔人按实际路径和结果整理石台名册。公议结论与价值行动仍另卷保存，不并入武学名次。",
        autoNext: {
          type: "branch",
          cases: [
            {
              when: {
                kind: "and",
                items: [
                  {
                    kind: "or",
                    items: [
                      {
                        kind: "and",
                        items: [
                          {
                            kind: "arcVariant",
                            arcId: "shendiao",
                            key: "act8.martial-path",
                            eq: "duel",
                          },
                          {
                            kind: "arcVariant",
                            arcId: "shendiao",
                            key: "act8.martial",
                            eq: "won",
                          },
                        ],
                      },
                      {
                        kind: "and",
                        items: [
                          {
                            kind: "arcVariant",
                            arcId: "shendiao",
                            key: "act8.martial-path",
                            eq: "hold-platform",
                          },
                          {
                            kind: "arcVariant",
                            arcId: "shendiao",
                            key: "act8.martial",
                            eq: "held",
                          },
                        ],
                      },
                    ],
                  },
                  { kind: "reputation", gte: 50 },
                  {
                    kind: "or",
                    items: [
                      { kind: "hasSkill", id: "xianglong18" },
                      { kind: "hasSkill", id: "dugu9" },
                      { kind: "hasSkill", id: "jiuyang" },
                      { kind: "hasSkill", id: "yiyangzhi" },
                      { kind: "hasSkill", id: "kongming" },
                      { kind: "hasSkill", id: "hamagong" },
                    ],
                  },
                  {
                    kind: "or",
                    items: [
                      { kind: "relation", npcId: "hongqigong", gte: 20 },
                      { kind: "relation", npcId: "huangyaoshi-npc", gte: 20 },
                      { kind: "relation", npcId: "yideng", gte: 20 },
                      {
                        kind: "arcVariant",
                        arcId: "shendiao",
                        key: "act8.witnesses",
                        eq: "broad",
                      },
                    ],
                  },
                ],
              },
              then: { type: "goto", nodeId: "title-recognized" },
            },
            {
              when: {
                kind: "or",
                items: [
                  {
                    kind: "and",
                    items: [
                      {
                        kind: "arcVariant",
                        arcId: "shendiao",
                        key: "act8.martial-path",
                        eq: "duel",
                      },
                      {
                        kind: "arcVariant",
                        arcId: "shendiao",
                        key: "act8.martial",
                        eq: "won",
                      },
                    ],
                  },
                  {
                    kind: "and",
                    items: [
                      {
                        kind: "arcVariant",
                        arcId: "shendiao",
                        key: "act8.martial-path",
                        eq: "hold-platform",
                      },
                      {
                        kind: "arcVariant",
                        arcId: "shendiao",
                        key: "act8.martial",
                        eq: "held",
                      },
                    ],
                  },
                  {
                    kind: "and",
                    items: [
                      {
                        kind: "arcVariant",
                        arcId: "shendiao",
                        key: "act8.martial-path",
                        eq: "protect-descent",
                      },
                      {
                        kind: "arcVariant",
                        arcId: "shendiao",
                        key: "act8.martial",
                        eq: "won",
                      },
                    ],
                  },
                ],
              },
              then: { type: "goto", nodeId: "title-contender" },
            },
          ],
          else: { type: "goto", nodeId: "title-none" },
        },
      },
      "title-recognized": {
        id: "title-recognized",
        title: "绝顶认可",
        text: "黄药师、洪七公或一灯在试招记录旁留下见证，石台名册把你列入可与绝顶高手论武的一栏。欧阳锋仍在追问自己的姓名，这份认可没有被写成“天下第一”。",
        onEnter: [
          {
            kind: "arcVariant",
            arcId: "shendiao",
            key: "act8.title",
            value: "recognized",
          },
          { kind: "reputation", delta: 12 },
        ],
        autoNext: { type: "goto", nodeId: "contest-result-router" },
      },
      "title-contender": {
        id: "title-contender",
        title: "名列挑战者",
        text: "石台名册保留你的胜局或护送结果，把你列入本次挑战者。没有宗师联名，也没有“天下第一”的判词。",
        onEnter: [
          {
            kind: "arcVariant",
            arcId: "shendiao",
            key: "act8.title",
            value: "contender",
          },
          { kind: "reputation", delta: 4 },
        ],
        autoNext: { type: "goto", nodeId: "contest-result-router" },
      },
      "title-none": {
        id: "title-none",
        title: "不列名次",
        text: "执笔人只记录你观战、退席、部分达成或落败的事实，不另列绝顶名次。公议记录与价值行动仍保持原样。",
        onEnter: [
          {
            kind: "arcVariant",
            arcId: "shendiao",
            key: "act8.title",
            value: "none",
          },
        ],
        autoNext: { type: "goto", nodeId: "contest-result-router" },
      },
      "contest-result-router": {
        id: "contest-result-router",
        title: "武学定席",
        text: "名册已经落笔。你在绝顶选择的路径，将与公议和最后军报分开带入离山亭。",
        autoNext: {
          type: "branch",
          cases: [
            {
              when: {
                kind: "arcVariant",
                arcId: "shendiao",
                key: "act8.martial-path",
                eq: "duel",
              },
              then: { type: "goto", nodeId: "contest-result-duel" },
            },
            {
              when: {
                kind: "arcVariant",
                arcId: "shendiao",
                key: "act8.martial-path",
                eq: "hold-platform",
              },
              then: { type: "goto", nodeId: "contest-result-hold" },
            },
            {
              when: {
                kind: "arcVariant",
                arcId: "shendiao",
                key: "act8.martial-path",
                eq: "protect-descent",
              },
              then: { type: "goto", nodeId: "contest-result-protect" },
            },
            {
              when: {
                kind: "arcVariant",
                arcId: "shendiao",
                key: "act8.martial-path",
                eq: "observe",
              },
              then: { type: "goto", nodeId: "contest-result-observe" },
            },
          ],
          else: { type: "goto", nodeId: "contest-result-decline" },
        },
      },
      "contest-result-duel": {
        id: "contest-result-duel",
        title: "对决入册",
        text: "你的对手、胜负和见证人都写入石台名册。山腰原卷没有因这场胜负增删一字。",
        autoNext: { type: "goto", nodeId: "contest-close" },
      },
      "contest-result-hold": {
        id: "contest-result-hold",
        title: "守台入册",
        text: "守台轮数、压阵者伤势和最终结果逐项记下。完整、部分与失败各有不同标记。",
        autoNext: { type: "goto", nodeId: "contest-close" },
      },
      "contest-result-protect": {
        id: "contest-result-protect",
        title: "护送入册",
        text: "名册记下你没有争夺石台，而是在下峰路使用武功保护记录与见证。护送结果仍是一项正式武学行动。",
        autoNext: { type: "goto", nodeId: "contest-close" },
      },
      "contest-result-observe": {
        id: "contest-result-observe",
        title: "拆招入册",
        text: "执笔人记下你所拆看的招路与见证宗师，没有伪造一场并未发生的胜局。",
        autoNext: { type: "goto", nodeId: "contest-close" },
      },
      "contest-result-decline": {
        id: "contest-result-decline",
        title: "退席入册",
        text: "你主动退出名次争夺，退席原因与此前护人、守卷或接管山门的事实一并保留。",
        autoNext: { type: "goto", nodeId: "contest-close" },
      },
      "contest-close": {
        id: "contest-close",
        title: "绝顶论剑·终",
        text: "公议卷、最后军报和石台名册被分别送到离山亭。下一步只按已经发生的事实确定最终去向。",
        onEnter: [
          {
            kind: "arcVariant",
            arcId: "shendiao",
            key: "act8.contest",
            value: "cleared",
          },
        ],
        autoNext: { type: "end" },
      },
    },
  },
  {
    id: SHENDIAO_ACT8_EVENT_IDS.epilogue,
    entryNode: "ending-facts",
    locationId: "huashan",
    weight: 12,
    once: true,
    condition: {
      kind: "and",
      items: [
        {
          kind: "arcBeat",
          arcId: "shendiao",
          beat: "act7-western-campaign",
          result: "done",
        },
        {
          kind: "arcVariant",
          arcId: "shendiao",
          key: "act8.contest",
          eq: "cleared",
        },
        {
          kind: "not",
          item: { kind: "arcBeat", arcId: "shendiao", beat: "act8-huashan" },
        },
      ],
    },
    nodes: {
      "ending-facts": {
        id: "ending-facts",
        title: "江湖定席",
        text: "离山亭摆着四份互不覆盖的记录：第七幕离营与军令、公议原卷、最后军报取舍、绝顶石台名册。结局只按这些事实和人物关系分流，不再追加一次决定全部的问答。",
        autoNext: {
          type: "branch",
          cases: [
            {
              when: {
                kind: "arcVariant",
                arcId: "shendiao",
                key: "act8.title",
                eq: "recognized",
              },
              then: { type: "goto", nodeId: "title-echo-recognized" },
            },
            {
              when: {
                kind: "arcVariant",
                arcId: "shendiao",
                key: "act8.title",
                eq: "contender",
              },
              then: { type: "goto", nodeId: "title-echo-contender" },
            },
          ],
          else: { type: "goto", nodeId: "title-echo-none" },
        },
      },
      "title-echo-recognized": {
        id: "title-echo-recognized",
        title: "触发事实·绝顶认可",
        text: "石台名册由宗师或宽见证席共同签名，记录你具备与绝顶高手论武的资格。这一项只影响名望与后日谈，不替代军令、公议和价值行动。",
        autoNext: { type: "goto", nodeId: "ending-router" },
      },
      "title-echo-contender": {
        id: "title-echo-contender",
        title: "触发事实·挑战者",
        text: "石台名册保留你的胜局、守台或护送结果，但没有宗师联名认可。结局仍读取此前全部行动。",
        autoNext: { type: "goto", nodeId: "ending-router" },
      },
      "title-echo-none": {
        id: "title-echo-none",
        title: "触发事实·不争名次",
        text: "石台名册只记录观战、退席、部分达成或败局，没有另列绝顶名次。这不会关闭人物、阵营或归隐结局。",
        autoNext: { type: "goto", nodeId: "ending-router" },
      },
      "ending-router": {
        id: "ending-router",
        title: "八路归处",
        text: "离山路按既有身份、关系、公议、价值行动和论剑结果依次打开。若多条路线同时成立，只取优先级最高的一条。",
        autoNext: {
          type: "branch",
          cases: [
            {
              when: {
                kind: "and",
                items: [
                  {
                    kind: "arcVariant",
                    arcId: "shendiao",
                    key: "act7.departure",
                    eq: "mongol-command",
                  },
                  { kind: "factionAttitude", factionId: "mongol", gte: 20 },
                  {
                    kind: "or",
                    items: [
                      {
                        kind: "arcVariant",
                        arcId: "shendiao",
                        key: "act8.value",
                        eq: "claim-seat",
                      },
                      {
                        kind: "arcVariant",
                        arcId: "shendiao",
                        key: "act8.value",
                        eq: "pursue-raiders",
                      },
                    ],
                  },
                  {
                    kind: "not",
                    item: {
                      kind: "arcVariant",
                      arcId: "shendiao",
                      key: "act8.martial-path",
                      eq: "protect-descent",
                    },
                  },
                ],
              },
              then: { type: "goto", nodeId: "facts-commander" },
            },
            {
              when: {
                kind: "and",
                items: [
                  {
                    kind: "or",
                    items: [
                      {
                        kind: "arcVariant",
                        arcId: "shendiao",
                        key: "act7.departure",
                        eq: "grassland-ending",
                      },
                      {
                        kind: "and",
                        items: [
                          {
                            kind: "arcVariant",
                            arcId: "shendiao",
                            key: "act7.huazheng",
                            eq: "stayed-loyal",
                          },
                          { kind: "relation", npcId: "huazheng", gte: 35 },
                        ],
                      },
                    ],
                  },
                  {
                    kind: "not",
                    item: {
                      kind: "arcVariant",
                      arcId: "shendiao",
                      key: "act8.record",
                      eq: "falsified",
                    },
                  },
                  {
                    kind: "or",
                    items: [
                      {
                        kind: "arcVariant",
                        arcId: "shendiao",
                        key: "act8.value",
                        eq: "save-crowd",
                      },
                      {
                        kind: "arcVariant",
                        arcId: "shendiao",
                        key: "act8.value",
                        eq: "guard-record",
                      },
                    ],
                  },
                ],
              },
              then: { type: "goto", nodeId: "facts-grassland" },
            },
            {
              when: {
                kind: "and",
                items: [
                  {
                    kind: "arcVariant",
                    arcId: "shendiao",
                    key: "act4.taohua-route",
                    eq: "guo-huang",
                  },
                  {
                    kind: "or",
                    items: [
                      { kind: "relation", npcId: "huangrong", gte: 35 },
                      { kind: "relation", npcId: "huangyaoshi-npc", gte: 25 },
                    ],
                  },
                  {
                    kind: "or",
                    items: [
                      {
                        kind: "arcVariant",
                        arcId: "shendiao",
                        key: "act8.record",
                        eq: "full",
                      },
                      {
                        kind: "arcVariant",
                        arcId: "shendiao",
                        key: "act8.record",
                        eq: "contested",
                      },
                    ],
                  },
                  {
                    kind: "arcVariant",
                    arcId: "shendiao",
                    key: "act8.value",
                    eq: "guard-record",
                  },
                  {
                    kind: "not",
                    item: {
                      kind: "arcVariant",
                      arcId: "shendiao",
                      key: "act7.departure",
                      eq: "mongol-command",
                    },
                  },
                ],
              },
              then: { type: "goto", nodeId: "facts-taohua" },
            },
            {
              when: {
                kind: "and",
                items: [
                  {
                    kind: "or",
                    items: [
                      {
                        kind: "arcVariant",
                        arcId: "shendiao",
                        key: "act7.departure",
                        eq: "with-guojing",
                      },
                      {
                        kind: "arcVariant",
                        arcId: "shendiao",
                        key: "act7.departure",
                        eq: "escort-refugees",
                      },
                    ],
                  },
                  {
                    kind: "or",
                    items: [
                      {
                        kind: "arcVariant",
                        arcId: "shendiao",
                        key: "act7.order",
                        eq: "defied",
                      },
                      {
                        kind: "arcVariant",
                        arcId: "shendiao",
                        key: "act7.order",
                        eq: "betrayed",
                      },
                      {
                        kind: "arcVariant",
                        arcId: "shendiao",
                        key: "act7.order",
                        eq: "delayed",
                      },
                    ],
                  },
                  {
                    kind: "not",
                    item: {
                      kind: "arcVariant",
                      arcId: "shendiao",
                      key: "act8.record",
                      eq: "falsified",
                    },
                  },
                  {
                    kind: "or",
                    items: [
                      {
                        kind: "arcVariant",
                        arcId: "shendiao",
                        key: "act8.value",
                        eq: "save-crowd",
                      },
                      {
                        kind: "arcVariant",
                        arcId: "shendiao",
                        key: "act8.value",
                        eq: "guard-record",
                      },
                    ],
                  },
                  { kind: "relation", npcId: "guojing", gte: 20 },
                ],
              },
              then: { type: "goto", nodeId: "facts-hero" },
            },
            {
              when: {
                kind: "and",
                items: [
                  {
                    kind: "or",
                    items: [
                      {
                        kind: "arcVariant",
                        arcId: "shendiao",
                        key: "act7.departure",
                        eq: "escort-refugees",
                      },
                      {
                        kind: "arcVariant",
                        arcId: "shendiao",
                        key: "act7.departure",
                        eq: "double-agent",
                      },
                    ],
                  },
                  {
                    kind: "arcVariant",
                    arcId: "shendiao",
                    key: "act8.record",
                    eq: "full",
                  },
                  {
                    kind: "arcVariant",
                    arcId: "shendiao",
                    key: "act8.value",
                    eq: "guard-record",
                  },
                  {
                    kind: "or",
                    items: [
                      {
                        kind: "arcVariant",
                        arcId: "shendiao",
                        key: "act8.martial-path",
                        eq: "protect-descent",
                      },
                      {
                        kind: "arcVariant",
                        arcId: "shendiao",
                        key: "act8.martial-path",
                        eq: "observe",
                      },
                      {
                        kind: "arcVariant",
                        arcId: "shendiao",
                        key: "act8.martial-path",
                        eq: "decline",
                      },
                    ],
                  },
                ],
              },
              then: { type: "goto", nodeId: "facts-keeper" },
            },
            {
              when: {
                kind: "and",
                items: [
                  {
                    kind: "arcVariant",
                    arcId: "shendiao",
                    key: "act8.value",
                    eq: "save-crowd",
                  },
                  {
                    kind: "or",
                    items: [
                      {
                        kind: "arcVariant",
                        arcId: "shendiao",
                        key: "act8.martial-path",
                        eq: "observe",
                      },
                      {
                        kind: "arcVariant",
                        arcId: "shendiao",
                        key: "act8.martial-path",
                        eq: "decline",
                      },
                    ],
                  },
                  {
                    kind: "or",
                    items: [
                      {
                        kind: "and",
                        items: [
                          { kind: "npcAlive", npcId: "guojing", alive: true },
                          { kind: "relation", npcId: "guojing", gte: 30 },
                        ],
                      },
                      {
                        kind: "and",
                        items: [
                          { kind: "npcAlive", npcId: "huangrong", alive: true },
                          { kind: "relation", npcId: "huangrong", gte: 30 },
                        ],
                      },
                      {
                        kind: "and",
                        items: [
                          { kind: "npcAlive", npcId: "huazheng", alive: true },
                          { kind: "relation", npcId: "huazheng", gte: 30 },
                        ],
                      },
                      {
                        kind: "and",
                        items: [
                          { kind: "npcAlive", npcId: "munianci", alive: true },
                          { kind: "relation", npcId: "munianci", gte: 30 },
                        ],
                      },
                    ],
                  },
                  {
                    kind: "not",
                    item: {
                      kind: "arcVariant",
                      arcId: "shendiao",
                      key: "act7.departure",
                      eq: "mongol-command",
                    },
                  },
                ],
              },
              then: { type: "goto", nodeId: "facts-hermit" },
            },
            {
              when: {
                kind: "or",
                items: [
                  {
                    kind: "and",
                    items: [
                      {
                        kind: "arcVariant",
                        arcId: "shendiao",
                        key: "act8.record",
                        eq: "falsified",
                      },
                      {
                        kind: "or",
                        items: [
                          {
                            kind: "arcVariant",
                            arcId: "shendiao",
                            key: "act8.value",
                            eq: "save-crowd",
                          },
                          {
                            kind: "arcVariant",
                            arcId: "shendiao",
                            key: "act8.value",
                            eq: "guard-record",
                          },
                          {
                            kind: "arcVariant",
                            arcId: "shendiao",
                            key: "act8.value",
                            eq: "pursue-raiders",
                          },
                          {
                            kind: "arcVariant",
                            arcId: "shendiao",
                            key: "act8.value",
                            eq: "claim-seat",
                          },
                        ],
                      },
                    ],
                  },
                  {
                    kind: "and",
                    items: [
                      {
                        kind: "arcVariant",
                        arcId: "shendiao",
                        key: "act8.value",
                        eq: "claim-seat",
                      },
                      { kind: "relation", npcId: "guojing", lte: 0 },
                      { kind: "relation", npcId: "huangrong", lte: 0 },
                    ],
                  },
                ],
              },
              then: { type: "goto", nodeId: "facts-outcast" },
            },
          ],
          else: { type: "goto", nodeId: "facts-wanderer" },
        },
      },
      "facts-commander": {
        id: "facts-commander",
        title: "触发事实·军职仍在",
        text: "离营记录显示你保留蒙古军职，蒙古阵营仍支持你；最后军报中你选择接管山门或追击责任人，也没有在论剑时转去护卷下山。",
        autoNext: { type: "goto", nodeId: "ending-commander" },
      },
      "facts-grassland": {
        id: "facts-grassland",
        title: "触发事实·草原旧约",
        text: "你以草原访客身份离营，或仍得到华筝自主支持；公议记录没有伪造，最后军报中也优先护人或守卷。",
        autoNext: { type: "goto", nodeId: "ending-grassland" },
      },
      "facts-taohua": {
        id: "facts-taohua",
        title: "触发事实·桃花旧门",
        text: "第四幕桃花岛路线、黄蓉或黄药师关系、公议记录与守卷行动同时成立；离山时也没有保留蒙古军职。",
        autoNext: { type: "goto", nodeId: "ending-taohua" },
      },
      "facts-hero": {
        id: "facts-hero",
        title: "触发事实·同行与抗命",
        text: "你曾与郭靖同行或护送难民，没有服从屠城军令；公议没有伪造，最后军报中也实际护住人或记录，郭靖关系仍未决裂。",
        autoNext: { type: "goto", nodeId: "ending-hero" },
      },
      "facts-keeper": {
        id: "facts-keeper",
        title: "触发事实·护卷到底",
        text: "你从难民或双面人路线带来记录，公议原卷完整，最后军报选择守卷；绝顶时又护卷、观战或退席，没有用名次覆盖记录。",
        autoNext: { type: "goto", nodeId: "ending-keeper" },
      },
      "facts-hermit": {
        id: "facts-hermit",
        title: "触发事实·主动退席",
        text: "最后军报中你先护住伤者，绝顶时选择观战或退席；至少一名存活同伴仍与你关系深厚，你也没有保留征战军职。",
        autoNext: { type: "goto", nodeId: "ending-hermit" },
      },
      "facts-outcast": {
        id: "facts-outcast",
        title: "触发事实·签名撤回",
        text: "公议原卷被主动伪造，或你以席位接管冲突后同时失去郭靖与黄蓉信任。更高优先级的军职结局没有成立。",
        autoNext: { type: "goto", nodeId: "ending-outcast" },
      },
      "facts-wanderer": {
        id: "facts-wanderer",
        title: "触发事实·不入既有席位",
        text: "既有阵营与人物结局条件没有同时成立。公议、价值行动和论剑结果仍完整保留，你选择带着这些记录继续行走。",
        autoNext: { type: "goto", nodeId: "ending-wanderer" },
      },
      "ending-commander": {
        id: "ending-commander",
        title: "江湖定席·军中执令",
        text: "蒙古使团在北路展开军旗，把新的调令和军印一并交回你手中。你带着仍在册的军职下山，公议副本留在华山，郭靖与黄蓉没有在军令上签名。",
        onEnter: [
          {
            kind: "arcVariant",
            arcId: "shendiao",
            key: "act8.ending",
            value: "commander",
          },
          { kind: "arcEnding", arcId: "shendiao", ending: "commander" },
          {
            kind: "arcBeat",
            arcId: "shendiao",
            beat: "act8-huashan",
            result: "done",
          },
          { kind: "factionAttitude", factionId: "mongol", delta: 10 },
          { kind: "reputation", delta: 8 },
        ],
        autoNext: { type: "end" },
      },
      "ending-grassland": {
        id: "ending-grassland",
        title: "江湖定席·草原旧路",
        text: "北路拴着一匹没有军旗的马，华筝留下的路引只写会合地点，没有替你决定去留。你带走自己的公议副本，从草原旧路下山。",
        onEnter: [
          {
            kind: "arcVariant",
            arcId: "shendiao",
            key: "act8.ending",
            value: "grassland",
          },
          { kind: "arcEnding", arcId: "shendiao", ending: "grassland" },
          {
            kind: "arcBeat",
            arcId: "shendiao",
            beat: "act8-huashan",
            result: "done",
          },
          { kind: "relation", npcId: "huazheng", delta: 8 },
          { kind: "reputation", delta: 5 },
        ],
        autoNext: { type: "end" },
      },
      "ending-taohua": {
        id: "ending-taohua",
        title: "江湖定席·海上桃花",
        text: "黄药师把一枚桃花岛旧门路牌放在离山亭，不催你接，也不替你谢绝。黄蓉带走守住的公议副本，你随东路下山，海船已在渡口等候。",
        onEnter: [
          {
            kind: "arcVariant",
            arcId: "shendiao",
            key: "act8.ending",
            value: "taohua",
          },
          { kind: "arcEnding", arcId: "shendiao", ending: "taohua" },
          {
            kind: "arcBeat",
            arcId: "shendiao",
            beat: "act8-huashan",
            result: "done",
          },
          { kind: "relation", npcId: "huangrong", delta: 6 },
          { kind: "relation", npcId: "huangyaoshi-npc", delta: 8 },
          {
            kind: "npcRelationType",
            npcId: "huangyaoshi-npc",
            relationType: "知己",
          },
        ],
        autoNext: { type: "end" },
      },
      "ending-hero": {
        id: "ending-hero",
        title: "江湖定席·并肩南行",
        text: "郭靖把南征军报、公议副本和伤者名册分装三匣，先交给不同送达人。郭靖：\"名次留在山上，路还在山下。咱们先把这些人和卷送到该去的地方。\"",
        onEnter: [
          {
            kind: "arcVariant",
            arcId: "shendiao",
            key: "act8.ending",
            value: "hero",
          },
          { kind: "arcEnding", arcId: "shendiao", ending: "hero" },
          {
            kind: "arcBeat",
            arcId: "shendiao",
            beat: "act8-huashan",
            result: "done",
          },
          { kind: "relation", npcId: "guojing", delta: 10 },
          { kind: "relation", npcId: "huangrong", delta: 6 },
          {
            kind: "npcRelationType",
            npcId: "guojing",
            relationType: "挚友",
          },
          { kind: "reputation", delta: 15 },
        ],
        autoNext: { type: "end" },
      },
      "ending-keeper": {
        id: "ending-keeper",
        title: "江湖定席·守卷人",
        text: "你把完整原卷、伤者名册和见证副本分成三路送走，自己带着验封目录最后下山。名册上没有最高名次，三份记录却都保留了来处与签名。",
        onEnter: [
          {
            kind: "arcVariant",
            arcId: "shendiao",
            key: "act8.ending",
            value: "keeper",
          },
          { kind: "arcEnding", arcId: "shendiao", ending: "keeper" },
          {
            kind: "arcBeat",
            arcId: "shendiao",
            beat: "act8-huashan",
            result: "done",
          },
          { kind: "relation", npcId: "huangrong", delta: 4 },
          { kind: "relation", npcId: "samarkand-guide", delta: 6 },
          { kind: "reputation", delta: 8 },
        ],
        autoNext: { type: "end" },
      },
      "ending-hermit": {
        id: "ending-hermit",
        title: "江湖定席·退入山林",
        text: "你把伤者安置和卷册送达逐项交代清楚，没有接军印，也没有取石台名次。仍愿同行的人在南坡等候，你从不设旗号的小路离开华山。",
        onEnter: [
          {
            kind: "arcVariant",
            arcId: "shendiao",
            key: "act8.ending",
            value: "hermit",
          },
          { kind: "arcEnding", arcId: "shendiao", ending: "hermit" },
          {
            kind: "arcBeat",
            arcId: "shendiao",
            beat: "act8-huashan",
            result: "done",
          },
          { kind: "aptitude", delta: 2 },
          { kind: "exp", delta: 120 },
        ],
        autoNext: { type: "end" },
      },
      "ending-outcast": {
        id: "ending-outcast",
        title: "江湖定席·签名尽撤",
        text: "郭靖、黄蓉与伤者送达人把签名从你的公议副本上撤下，石台名次也无人替其余选择担保。你带走仍承认你的军帖、残卷与少数追随者，从西坡下山。",
        onEnter: [
          {
            kind: "arcVariant",
            arcId: "shendiao",
            key: "act8.ending",
            value: "outcast",
          },
          { kind: "arcEnding", arcId: "shendiao", ending: "outcast" },
          {
            kind: "arcBeat",
            arcId: "shendiao",
            beat: "act8-huashan",
            result: "done",
          },
          { kind: "reputation", delta: -10 },
          { kind: "karma", delta: -8 },
        ],
        autoNext: { type: "end" },
      },
      "ending-wanderer": {
        id: "ending-wanderer",
        title: "江湖定席·负卷浪游",
        text: "你没有接下既有阵营的席位，也没有丢弃一路留下的记录。公议副本、石台名册与几封旧信一同收入行囊，你从东南小路继续上路。",
        onEnter: [
          {
            kind: "arcVariant",
            arcId: "shendiao",
            key: "act8.ending",
            value: "wanderer",
          },
          { kind: "arcEnding", arcId: "shendiao", ending: "wanderer" },
          {
            kind: "arcBeat",
            arcId: "shendiao",
            beat: "act8-huashan",
            result: "done",
          },
          { kind: "reputation", delta: 3 },
          { kind: "exp", delta: 100 },
        ],
        autoNext: { type: "end" },
      },
    },
  },
]
