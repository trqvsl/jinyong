import type { Transition, WorldEvent } from "./schema"

const ACT6_ISLAND_ROUTE: Transition = {
  type: "branch",
  cases: [
    {
      when: {
        kind: "arcVariant",
        arcId: "shendiao",
        key: "act6.island-outcome",
        eq: "xiaoying-saved",
      },
      then: { type: "goto", nodeId: "island-xiaoying-saved" },
    },
    {
      when: {
        kind: "arcVariant",
        arcId: "shendiao",
        key: "act6.island-outcome",
        eq: "ke-wounded",
      },
      then: { type: "goto", nodeId: "island-ke-wounded" },
    },
    {
      when: {
        kind: "arcVariant",
        arcId: "shendiao",
        key: "act6.island-outcome",
        eq: "evidence-preserved",
      },
      then: { type: "goto", nodeId: "island-evidence-preserved" },
    },
    {
      when: {
        kind: "arcVariant",
        arcId: "shendiao",
        key: "act6.island-outcome",
        eq: "killer-traced",
      },
      then: { type: "goto", nodeId: "island-killer-traced" },
    },
  ],
  else: { type: "goto", nodeId: "island-limited-survivors" },
}

const ACT6_VERDICT_ROUTE: Transition = {
  type: "branch",
  cases: [
    {
      when: {
        kind: "arcVariant",
        arcId: "shendiao",
        key: "act6.yangkang-verdict",
        eq: "dead",
      },
      then: { type: "goto", nodeId: "verdict-dead" },
    },
    {
      when: {
        kind: "arcVariant",
        arcId: "shendiao",
        key: "act6.yangkang-verdict",
        eq: "captured",
      },
      then: { type: "goto", nodeId: "verdict-captured" },
    },
    {
      when: {
        kind: "arcVariant",
        arcId: "shendiao",
        key: "act6.yangkang-verdict",
        eq: "confessed",
      },
      then: { type: "goto", nodeId: "verdict-confessed" },
    },
    {
      when: {
        kind: "arcVariant",
        arcId: "shendiao",
        key: "act6.yangkang-verdict",
        eq: "aided",
      },
      then: { type: "goto", nodeId: "verdict-aided" },
    },
  ],
  else: { type: "goto", nodeId: "verdict-escaped" },
}

export const SHENDIAO_ACT6_AFTERMATH_WORLD_EVENT: WorldEvent = {
  id: "act6-iron-temple-aftermath",
  once: true,
  trigger: {
    kind: "and",
    items: [
      {
        kind: "arcBeat",
        arcId: "shendiao",
        beat: "act6-truth",
        result: "done",
      },
      {
        kind: "not",
        item: {
          kind: "arcBeat",
          arcId: "shendiao",
          beat: "act7-western-campaign",
        },
      },
    ],
  },
  event: {
    id: "world-act6-iron-temple-aftermath",
    entryNode: "aftermath-arrives",
    nodes: {
      "aftermath-arrives": {
        id: "aftermath-arrives",
        title: "江湖回响·铁枪庙三路消息",
        text: "你回到落脚处时，桌上已经摆着三路消息：牛家村送来的枪缨木匣、桃花岛幸存者名册、嘉兴分舵抄出的铁枪庙裁决。三份记录各自有人署名，不能合成一句胜负。",
        autoNext: {
          type: "branch",
          cases: [
            {
              when: {
                kind: "arcVariant",
                arcId: "shendiao",
                key: "act6.munianci-outcome",
                eq: "broken",
              },
              then: { type: "goto", nodeId: "munianci-broken" },
            },
            {
              when: {
                kind: "arcVariant",
                arcId: "shendiao",
                key: "act6.munianci-outcome",
                eq: "hidden",
              },
              then: { type: "goto", nodeId: "munianci-hidden" },
            },
          ],
          else: { type: "goto", nodeId: "munianci-questioned" },
        },
      },
      "munianci-broken": {
        id: "munianci-broken",
        title: "牛家村·枪缨归匣",
        text: "穆念慈已把杨铁心旧枪缨交给村中老人保管。她没有托人问杨康去向，只在木匣清单上补了一行：王府短笺已经烧尽。",
        autoNext: ACT6_ISLAND_ROUTE,
      },
      "munianci-questioned": {
        id: "munianci-questioned",
        title: "牛家村·最后一问",
        text: "穆念慈留下了君山帮帖和破庙短枪的拓印。她已当面问过欧阳克案，也把杨康的回答另页封存，不再让旁人替两边改口。",
        autoNext: ACT6_ISLAND_ROUTE,
      },
      "munianci-hidden": {
        id: "munianci-hidden",
        title: "牛家村·缺页仍在",
        text: "穆念慈送来的清单保留着一处空白：破庙命案最初曾被隐瞒。她没有接受补写的说辞，只把君山与王府记录分开收好。",
        autoNext: ACT6_ISLAND_ROUTE,
      },
      "island-xiaoying-saved": {
        id: "island-xiaoying-saved",
        title: "桃花岛·两名幸存者",
        text: "桃花岛名册确认柯镇恶与韩小莹都活了下来。韩小莹的证言、朱聪留下的翡翠鞋和其余五怪的安葬位置分别登记，没有用“多救一人”抹去死者。",
        autoNext: ACT6_VERDICT_ROUTE,
      },
      "island-ke-wounded": {
        id: "island-ke-wounded",
        title: "桃花岛·重伤证人",
        text: "柯镇恶保住性命，断杖与伤势却使他的证言只能标作亲闻。岛上名册把黄袍、箫声和蛇毒分列三项，未再写成同一个凶手。",
        autoNext: ACT6_VERDICT_ROUTE,
      },
      "island-evidence-preserved": {
        id: "island-evidence-preserved",
        title: "桃花岛·证物分封",
        text: "翡翠鞋、未完血字与蛇毒记录已经分匣送达。柯镇恶活着，另外五怪的名字仍列在亡者栏，证物没有被写成补偿。",
        autoNext: ACT6_VERDICT_ROUTE,
      },
      "island-killer-traced": {
        id: "island-killer-traced",
        title: "桃花岛·黄袍去向",
        text: "礁石蛇毒与黄袍丝缕指向白驼船路，追船记录却没有改动幸存者名册。柯镇恶活着，五名死者仍各有独立卷页。",
        autoNext: ACT6_VERDICT_ROUTE,
      },
      "island-limited-survivors": {
        id: "island-limited-survivors",
        title: "桃花岛·有限幸存",
        text: "岛上名册只确认柯镇恶生还，其余线索或有缺页，或在追击中散失。亡者姓名、现存证物与待核指认被分成三栏。",
        autoNext: ACT6_VERDICT_ROUTE,
      },
      "verdict-dead": {
        id: "verdict-dead",
        title: "嘉兴·铁枪前的死讯",
        text: "嘉兴分舵送来的裁决写明：杨康死于蛇毒，四轮记录仍按原封保存。丘处机没有让弟子把死亡改写成认罪，穆念慈也没有回庙收走枪缨。",
        choices: [
          {
            id: "archive-dead-verdict",
            text: "收下裁决抄件",
            description: "把死亡、证据与未认之事分开留档。",
            resultText: "你把裁决抄件夹在证物目录之后，没有添写杨康未曾说过的话。",
            consequences: [
              { kind: "reputation", delta: 2 },
              { kind: "aptitude", delta: 1 },
            ],
            transition: { type: "end" },
          },
        ],
      },
      "verdict-escaped": {
        id: "verdict-escaped",
        title: "嘉兴·负伤去向",
        text: "分舵只确认杨康负伤离开嘉兴，王府腰牌和白驼信符都没有再出现。追查者把“遁走”写进裁决，没有擅自补成死亡或悔改。",
        choices: [
          {
            id: "archive-escaped-verdict",
            text: "记下最后行踪",
            description: "保留已知去向，不把传闻补成事实。",
            resultText: "你在地图上标出雨巷尽头的马蹄方向，其余位置仍留空。",
            consequences: [
              { kind: "relation", npcId: "yangkang", delta: 2 },
              { kind: "aptitude", delta: 1 },
            ],
            transition: { type: "end" },
          },
        ],
      },
      "verdict-captured": {
        id: "verdict-captured",
        title: "嘉兴·共同看押",
        text: "全真与丐帮分别送来押送画押，两份都写明不得私刑。杨康仍在嘉兴分舵待审，王府与白驼山暂时没有人能单独把他带走。",
        choices: [
          {
            id: "archive-captured-verdict",
            text: "核对两份画押",
            description: "确认两派都保留了同一份看押责任。",
            resultText: "你核过印记，把两份画押分交不同信使带回。",
            consequences: [
              { kind: "factionAttitude", factionId: "quanzhen", delta: 2 },
              { kind: "factionAttitude", factionId: "beggar", delta: 2 },
            ],
            transition: { type: "end" },
          },
        ],
      },
      "verdict-confessed": {
        id: "verdict-confessed",
        title: "嘉兴·有限认罪原文",
        text: "分舵抄件保留杨康亲口承认的破庙短枪与桃花岛九阴爪，也明确列出他没有承认的身份与旧债。全真、丐帮和穆念慈各持一份。",
        choices: [
          {
            id: "archive-confessed-verdict",
            text: "保留认罪原文",
            description: "不扩大，也不删减他亲口承认的部分。",
            resultText: "你把认罪页与证物目录并排封存，页尾仍保留三方画押。",
            consequences: [
              { kind: "relation", npcId: "munianci", delta: 2 },
              { kind: "reputation", delta: 3 },
            ],
            transition: { type: "end" },
          },
        ],
      },
      "verdict-aided": {
        id: "verdict-aided",
        title: "嘉兴·缺失的第三卷",
        text: "追查名单写明杨康由暗门离开，第三轮验物记录同时失踪。郭靖、黄蓉与丘处机都在见证栏留下名字，也写明是谁挡住了追兵。",
        choices: [
          {
            id: "archive-aided-verdict",
            text: "收下缺页名单",
            description: "保留助逃与遗失记录，不撤去自己的名字。",
            resultText: "你把缺页名单收入行囊，见证栏上的名字保持原样。",
            consequences: [
              { kind: "relation", npcId: "yangkang", delta: 3 },
              { kind: "reputation", delta: -3 },
            ],
            transition: { type: "end" },
          },
        ],
      },
    },
  },
}

export const SHENDIAO_ENDING_WORLD_EVENTS: WorldEvent[] = [
  {
    id: "act8-echo-commander",
    once: true,
    priority: "urgent",
    trigger: {
      kind: "and",
      items: [
        { kind: "arcBeat", arcId: "shendiao", beat: "act8-huashan", result: "done" },
        { kind: "arcVariant", arcId: "shendiao", key: "act8.ending", eq: "commander" },
      ],
    },
    event: {
      id: "world-act8-echo-commander",
      entryNode: "main",
      presentation: "letter",
      letterStyle: "formal",
      nodes: {
        main: {
          id: "main",
          title: "江湖回响·北路新令",
          letterIntro: "一名蒙古传令官在客舍外下马，把军印匣、军饷清单和一封盖着中军印信的调令放到案上。",
          text: "旧军职仍在册。北路辎重与新编骑队自今日起听你调遣。华山公议副本不入军令，军中也不替山上诸人签名。",
          letterSignature: "中军行台",
          choices: [
            {
              id: "receive-command-seal",
              text: "验过军印",
              description: "确认军职与华山公议仍是两份记录。",
              resultText: "你核过军印和调令时辰，把公议副本留在另一只匣中。",
              consequences: [
                { kind: "factionAttitude", factionId: "mongol", delta: 3 },
                { kind: "gold", delta: 40 },
              ],
              transition: { type: "end" },
            },
          ],
        },
      },
    },
  },
  {
    id: "act8-echo-grassland",
    once: true,
    priority: "urgent",
    trigger: {
      kind: "and",
      items: [
        { kind: "arcBeat", arcId: "shendiao", beat: "act8-huashan", result: "done" },
        { kind: "arcVariant", arcId: "shendiao", key: "act8.ending", eq: "grassland" },
      ],
    },
    event: {
      id: "world-act8-echo-grassland",
      entryNode: "main",
      presentation: "letter",
      letterStyle: "note",
      nodes: {
        main: {
          id: "main",
          title: "江湖回响·无旗路引",
          letterIntro: "客舍马桩上多了一副旧草原鞍，鞍袋里压着一张没有军印的皮纸路引。",
          text: "北路第三口井已经清过淤泥。你若来，沿没有军旗的牧道走。若不来，这张路引也只写你的名字，不替你答应。",
          letterSignature: "华筝",
          choices: [
            {
              id: "keep-grassland-route",
              text: "收下路引",
              description: "把会合地点记下，去留仍留待上路时决定。",
              resultText: "你把路引卷回皮筒，另给送马人添了两包草料。",
              consequences: [
                { kind: "relation", npcId: "huazheng", delta: 4 },
                { kind: "item", id: "field-ration", count: 2 },
              ],
              transition: { type: "end" },
            },
          ],
        },
      },
    },
  },
  {
    id: "act8-echo-taohua",
    once: true,
    priority: "urgent",
    trigger: {
      kind: "and",
      items: [
        { kind: "arcBeat", arcId: "shendiao", beat: "act8-huashan", result: "done" },
        { kind: "arcVariant", arcId: "shendiao", key: "act8.ending", eq: "taohua" },
      ],
    },
    event: {
      id: "world-act8-echo-taohua",
      entryNode: "main",
      presentation: "letter",
      letterStyle: "note",
      nodes: {
        main: {
          id: "main",
          title: "江湖回响·东海渡口",
          letterIntro: "一只海东青落在窗栏，爪下系着渡口船牌和一张折成小舟形状的短笺。",
          text: "守卷的船已到东海渡口。我爹把旧门路牌放在船头，接不接由你。公议副本另走一条船，不会和人一起沉。",
          letterSignature: "黄蓉",
          choices: [
            {
              id: "mark-taohua-ferry",
              text: "记下渡口",
              description: "收好船牌与独立分送的公议副本编号。",
              resultText: "你把渡口和两条船的编号写进路册，海东青叼走了回信。",
              consequences: [
                { kind: "relation", npcId: "huangrong", delta: 3 },
                { kind: "relation", npcId: "huangyaoshi-npc", delta: 2 },
              ],
              transition: { type: "end" },
            },
          ],
        },
      },
    },
  },
  {
    id: "act8-echo-hero",
    once: true,
    priority: "urgent",
    trigger: {
      kind: "and",
      items: [
        { kind: "arcBeat", arcId: "shendiao", beat: "act8-huashan", result: "done" },
        { kind: "arcVariant", arcId: "shendiao", key: "act8.ending", eq: "hero" },
      ],
    },
    event: {
      id: "world-act8-echo-hero",
      entryNode: "main",
      nodes: {
        main: {
          id: "main",
          title: "江湖回响·三匣回报",
          text: "郭靖派来的骑手带回三枚不同颜色的封签。南征军报已经送进军府，公议副本交给江南分舵，伤者名册则随车队到了安全驿站。",
          choices: [
            {
              id: "receive-three-reports",
              text: "逐项核对回报",
              description: "确认人、卷与军报都各自送达。",
              resultText: "你把三枚封签按送达时辰排好，让骑手带回验收画押。",
              consequences: [
                { kind: "relation", npcId: "guojing", delta: 4 },
                { kind: "reputation", delta: 3 },
              ],
              transition: { type: "end" },
            },
          ],
        },
      },
    },
  },
  {
    id: "act8-echo-keeper",
    once: true,
    priority: "urgent",
    trigger: {
      kind: "and",
      items: [
        { kind: "arcBeat", arcId: "shendiao", beat: "act8-huashan", result: "done" },
        { kind: "arcVariant", arcId: "shendiao", key: "act8.ending", eq: "keeper" },
      ],
    },
    event: {
      id: "world-act8-echo-keeper",
      entryNode: "main",
      presentation: "letter",
      letterStyle: "formal",
      nodes: {
        main: {
          id: "main",
          title: "江湖回响·三路回执",
          letterIntro: "三名不同装束的信使先后到达客舍，各自交来一枚回执：原卷、伤者名册、见证副本。",
          text: "三份记录均已验封入库，来处、缺页与签名保持原样。验封总目录仍由守卷人保管，任何一方不得单独调走。",
          letterSignature: "三路送达人联署",
          choices: [
            {
              id: "bind-three-receipts",
              text: "将回执收入总目录",
              description: "让三份记录继续保持独立可核。",
              resultText: "你把三枚回执钉在总目录末页，封口分别盖上原有印记。",
              consequences: [
                { kind: "reputation", delta: 4 },
                { kind: "aptitude", delta: 1 },
              ],
              transition: { type: "end" },
            },
          ],
        },
      },
    },
  },
  {
    id: "act8-echo-hermit",
    once: true,
    priority: "urgent",
    trigger: {
      kind: "and",
      items: [
        { kind: "arcBeat", arcId: "shendiao", beat: "act8-huashan", result: "done" },
        { kind: "arcVariant", arcId: "shendiao", key: "act8.ending", eq: "hermit" },
      ],
    },
    event: {
      id: "world-act8-echo-hermit",
      entryNode: "main",
      nodes: {
        main: {
          id: "main",
          title: "江湖回响·南坡来客",
          text: "一名没有佩门派标记的旧识来到客舍，只带了伤者安置清单和南坡小路图。清单上的人已各有住处，图上也没有旗号或山门名称。",
          choices: [
            {
              id: "take-unmarked-road",
              text: "收下小路图",
              description: "确认卷册与伤者已经送达，再决定何时离开人群。",
              resultText: "你核过安置清单，把小路图折进无字封套。",
              consequences: [
                { kind: "exp", delta: 80 },
                { kind: "aptitude", delta: 1 },
              ],
              transition: { type: "end" },
            },
          ],
        },
      },
    },
  },
  {
    id: "act8-echo-outcast",
    once: true,
    priority: "urgent",
    trigger: {
      kind: "and",
      items: [
        { kind: "arcBeat", arcId: "shendiao", beat: "act8-huashan", result: "done" },
        { kind: "arcVariant", arcId: "shendiao", key: "act8.ending", eq: "outcast" },
      ],
    },
    event: {
      id: "world-act8-echo-outcast",
      entryNode: "main",
      presentation: "letter",
      letterStyle: "secret",
      nodes: {
        main: {
          id: "main",
          title: "江湖回响·撤名副本",
          letterIntro: "一份被退回的公议副本从门缝下塞进屋内，见证栏上的名字被逐条划去，页角仍留着原来的验封孔。",
          text: "担保已经撤回，原卷改写与缺页责任仍保留。此副本无人代你销毁，也无人再替你签名。",
          letterSignature: "华山执笔人",
          choices: [
            {
              id: "keep-withdrawn-copy",
              text: "保留撤名页",
              description: "留下谁撤名、为何撤名的完整痕迹。",
              resultText: "你把撤名副本与残卷分开放置，没有刮去划痕。",
              consequences: [
                { kind: "aptitude", delta: 1 },
                { kind: "reputation", delta: -2 },
              ],
              transition: { type: "end" },
            },
          ],
        },
      },
    },
  },
  {
    id: "act8-echo-wanderer",
    once: true,
    priority: "urgent",
    trigger: {
      kind: "and",
      items: [
        { kind: "arcBeat", arcId: "shendiao", beat: "act8-huashan", result: "done" },
        { kind: "arcVariant", arcId: "shendiao", key: "act8.ending", eq: "wanderer" },
      ],
    },
    event: {
      id: "world-act8-echo-wanderer",
      entryNode: "main",
      nodes: {
        main: {
          id: "main",
          title: "江湖回响·无人代领",
          text: "驿卒送来几封无人代领的旧信：江南问你是否回去，西域商队邀你同行，东海渡口则留着一张空白船期。信封上没有任何阵营替你填写下一站。",
          choices: [
            {
              id: "pack-unclaimed-letters",
              text: "把旧信收入行囊",
              description: "保留所有来路，不急着给下一站盖印。",
              resultText: "你把几封旧信按来路收好，空白船期仍夹在最后。",
              consequences: [
                { kind: "exp", delta: 100 },
                { kind: "reputation", delta: 2 },
              ],
              transition: { type: "end" },
            },
          ],
        },
      },
    },
  },
]
