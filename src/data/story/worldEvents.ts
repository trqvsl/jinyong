import type { WorldEvent } from "./schema"
import {
  SHENDIAO_ACT6_AFTERMATH_WORLD_EVENT,
  SHENDIAO_ENDING_WORLD_EVENTS,
} from "./shendiaoWorldEvents"

// ============================================================
// 涌现事件：不绑定地点，由世界状态自然浮现。
// 每次回到主界面时，由 world scheduler 扫描并触发第一个满足条件的事件。
// ============================================================

export const WORLD_EVENTS: WorldEvent[] = [
  ...SHENDIAO_ENDING_WORLD_EVENTS,
  SHENDIAO_ACT6_AFTERMATH_WORLD_EVENT,
  {
    id: "hongqigong-seeks-you",
    once: true,
    trigger: {
      kind: "and",
      items: [
        { kind: "karma", gte: 30 },
        { kind: "relation", npcId: "hongqigong", gte: 10 },
      ],
    },
    event: {
      id: "world-hongqigong-guidance",
      entryNode: "main",
      nodes: {
        main: {
          id: "main",
          title: "江湖回响·北丐寻你",
          text: "你刚回客舍，窗外便飘来叫花鸡的香气。洪七公盘腿坐在屋檐上，一手提鸡腿，一手用竹棒敲了敲瓦片。洪七公：\"近来几件事办得还算像样，老叫花路过，顺便看看你功夫有没有长进。先接着！\"半只鸡从檐上落下，他也跟着翻进院里。",
          choices: [
            {
              id: "accept-guidance",
              text: "虚心受教",
              description: "认真记下洪七公点拨的吐纳与发劲诀窍。",
              resultText: "洪七公让你连出三掌，第一掌敲肩，第二掌打腕，第三掌才点了点头。洪七公：\"劲到掌心便散了，腰上再送半寸。记住，救人时别把自己也搭进去。\"他拎走剩下的鸡骨头，翻上屋檐便走。",
              consequences: [
                { kind: "relation", npcId: "hongqigong", delta: 5 },
                { kind: "reputation", delta: 3 },
                { kind: "mp", delta: 20 },
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
    id: "quanzhen-sends-letter",
    once: true,
    trigger: {
      kind: "and",
      items: [
        { kind: "factionAttitude", factionId: "quanzhen", gte: 10 },
        { kind: "relation", npcId: "qiuchuji", gte: 10 },
      ],
    },
    event: {
      id: "world-quanzhen-letter",
      entryNode: "main",
      presentation: "letter",
      letterStyle: "formal",
      nodes: {
        main: {
          id: "main",
          title: "江湖回响·全真来信",
          letterIntro: "你回到落脚处时，一名全真弟子已在门前等候，将一封火漆尚新的书信递到你手中。",
          text: "牛家村雪夜一别，闻君近日侠名渐著，贫道甚慰。全真门下不敢忘义，特奉薄礼，以谢旧情。另附全真剑诀“回风引气”三句，或可助你运剑换息。",
          letterSignature: "丘处机",
          choices: [
            {
              id: "read-letter",
              text: "收下书信",
              description: "收下全真门下这份善意与谢礼。",
              resultText: "你照着信中三句口诀试运一遍，把换息位置记在随身册页上。那名全真弟子留下礼盒，打个稽首便离开客舍。",
              consequences: [
                { kind: "relation", npcId: "qiuchuji", delta: 3 },
                { kind: "reputation", delta: 2 },
                { kind: "gold", delta: 20 },
                { kind: "item", id: "small-mp-pill", count: 1 },
              ],
              transition: { type: "end" },
            },
          ],
        },
      },
    },
  },
  {
    id: "guojing-southbound-rumor",
    once: true,
    trigger: {
      kind: "and",
      items: [
        { kind: "arcBeat", arcId: "shendiao", beat: "damos" },
        { kind: "relation", npcId: "guojing", gte: 15 },
      ],
    },
    event: {
      id: "world-guojing-southbound",
      entryNode: "main",
      nodes: {
        main: {
          id: "main",
          title: "江湖回响·草原传讯",
          text: "你刚回住处歇下，门外便有行商送来一句口信，说是北边草原上有个姓郭的年轻人已经辞别师父，正一路南下。行商还从怀里掏出一截粗布包着的肉干，笑说那年轻人千叮万嘱，要替他交到你手上。那肉干风干得极硬，一看便知是草原上的做法。",
          choices: [
            {
              id: "accept-news",
              text: "收下口信",
              description: "把这份从草原一路带来的惦记收好。",
              resultText: "你收下肉干，向行商问清郭靖南下所走的驿道。行商说他七日前已过居庸关，临走还反复叮嘱这包东西一定要送到。",
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
  },
  {
    id: "huangrong-night-visit",
    once: true,
    trigger: {
      kind: "and",
      items: [
        { kind: "arcBeat", arcId: "shendiao", beat: "meet-rong" },
        { kind: "relation", npcId: "huangrong", gte: 18 },
      ],
    },
    event: {
      id: "world-huangrong-midnight-snack",
      entryNode: "main",
      nodes: {
        main: {
          id: "main",
          title: "江湖回响·夜半敲窗",
          text: "你夜里刚熄灯，窗棂便被人叩了三下。推窗一看，黄蓉正蹲在屋檐上提着一只食盒。黄蓉：\"你白天总不见人影，我只好夜里来找你。喏，刚做好的点心，再不吃就凉了。\"她翻窗进屋，把食盒搁在桌上。",
          choices: [
            {
              id: "share-snack",
              text: "陪她吃完",
              description: "让她进屋，边吃边说临安近况。",
              resultText: "你们分完食盒里的点心，黄蓉又在桌上画出两处新探到的王府暗门。临走前，她把最后一块点心留在盘中。黄蓉：\"这一块给你明早吃，省得又空着肚子出门。\"",
              consequences: [
                { kind: "relation", npcId: "huangrong", delta: 5 },
                { kind: "hp", delta: 15 },
              ],
              transition: { type: "end" },
            },
          ],
        },
      },
    },
  },
  {
    id: "taohua-island-letter",
    once: true,
    trigger: {
      kind: "and",
      items: [
        { kind: "arcBeat", arcId: "shendiao", beat: "wangfu" },
        { kind: "relation", npcId: "huangrong", gte: 12 },
      ],
    },
    event: {
      id: "world-taohua-invitation",
      entryNode: "main",
      presentation: "letter",
      letterStyle: "note",
      nodes: {
        main: {
          id: "main",
          title: "江湖回响·桃花催信",
          letterIntro: "你回到落脚处时，一只海东青在窗外扑了两下翅膀，留下信便飞走了，案上还散着两瓣被风吹落的桃花。",
          text: "我爹今日又问了一遍，郭靖何时登岛。你若再不来，我便亲自去临安把你们一道拖来。海上风大，记得雇条稳些的船。",
          letterSignature: "黄蓉",
          choices: [
            {
              id: "read-and-prepare",
              text: "收起书信",
              description: "把这封催人的字条先收好。",
              resultText: "你把字条收入怀中，又在地图上标出东海渡口。海东青仍停在窗外，啄了两下木框才展翅离开。",
              consequences: [
                { kind: "relation", npcId: "huangrong", delta: 3 },
                { kind: "reputation", delta: 1 },
              ],
              transition: { type: "end" },
            },
          ],
        },
      },
    },
  },
  {
    id: "yangkang-rain-message",
    once: true,
    trigger: {
      kind: "and",
      items: [
        { kind: "npcHasTag", npcId: "yangkang", tag: "杨康遁走" },
        { kind: "relation", npcId: "yangkang", gte: 10 },
      ],
    },
    event: {
      id: "world-yangkang-rain-message",
      entryNode: "main",
      presentation: "letter",
      letterStyle: "secret",
      nodes: {
        main: {
          id: "main",
          title: "江湖回响·雨夜留字",
          letterIntro: "你夜里回房时，窗台上不知何时多了一张被雨气打湿边角的短笺，纸上只有寥寥几行字，墨迹却压得很重。",
          text: "你那日若不伸手，我已死在庙里。可你救得了我一回，未必救得了我这一生。以后若再见，不必替我说话。",
          letterSignature: "康",
          choices: [
            {
              id: "keep-the-note",
              text: "把字条收起",
              description: "先把这句说不清是谢是怨的话收起来。",
              resultText: "你把短笺晾干后折好收起。窗台外只留下一枚断掉的王府玉扣，边缘已经被刀削去原本的纹样。",
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
  },
  {
    id: "guojing-sends-medicine",
    once: true,
    trigger: {
      kind: "and",
      items: [
        { kind: "relation", npcId: "guojing", gte: 22 },
        { kind: "karma", gte: 0 },
      ],
    },
    event: {
      id: "world-guojing-medicine",
      entryNode: "main",
      presentation: "letter",
      letterStyle: "note",
      nodes: {
        main: {
          id: "main",
          title: "江湖回响·靖传良药",
          letterIntro: "你回到住处时，门口木栏上挂着一个粗布包，包里是两瓶金创药和一张小纸条。",
          text: "兄弟，听说你近来常与人动手，药留给你，别总逞强。",
          letterSignature: "郭靖",
          choices: [
            {
              id: "accept-medicine",
              text: "收起纸条与药瓶",
              description: "把药和纸条都妥帖收好。",
              resultText: "你把纸条折好收入怀中，又把两瓶金创药塞进包袱最顺手的位置。",
              consequences: [
                { kind: "relation", npcId: "guojing", delta: 4 },
                { kind: "item", id: "small-hp-pill", count: 2 },
                { kind: "reputation", delta: 2 },
              ],
              transition: { type: "end" },
            },
          ],
        },
      },
    },
  },
  {
    id: "baituo-secret-invite",
    once: true,
    trigger: {
      kind: "or",
      items: [
        { kind: "karma", lte: -20 },
        { kind: "relation", npcId: "ouyangfeng-npc", gte: 10 },
      ],
    },
    event: {
      id: "world-baituo-invitation",
      entryNode: "main",
      presentation: "letter",
      letterStyle: "secret",
      nodes: {
        main: {
          id: "main",
          title: "江湖回响·白驼密帖",
          letterIntro: "你在枕边发现一封不知何时塞进来的薄帖，信封里还掉出一小片蛇蜕。",
          text: "白驼山只认有胆有牙的人。你若愿来，自会有人引路。",
          letterSignature: "锋",
          choices: [
            {
              id: "burn-it",
              text: "先收着再说",
              description: "不急着应，也不急着拒，先把这张密帖留作后手。",
              resultText: "你把密帖收入袖中，先留作后手。",
              consequences: [
                { kind: "reputation", delta: 2 },
              ],
              transition: { type: "end" },
            },
          ],
        },
      },
    },
  },
  {
    id: "taohua-blame-spreads",
    once: true,
    trigger: {
      kind: "and",
      items: [
        { kind: "arcVariant", arcId: "shendiao", key: "act6.island", eq: "cleared" },
        { kind: "arcVariant", arcId: "shendiao", key: "act6.misunderstanding", eq: "weak" },
      ],
    },
    event: {
      id: "world-taohua-blame-spreads",
      entryNode: "main",
      nodes: {
        main: {
          id: "main",
          title: "江湖回响·东邪杀徒传闻",
          text: "你回到江南落脚处，楼下说书人已经把桃花岛血案编成新段。柯镇恶的指认被传成黄药师亲手杀人，白驼山与杨康的名字一句未提。",
          choices: [
            {
              id: "stop-the-rumor",
              text: "拿现有线索压下定论",
              description: "证物尚弱，只能要求众人先等烟雨楼对质。",
              resultText: "你让说书人删去“亲眼所见”四字，又请丐帮弟子传话：柯镇恶是亲耳听见，不是亲眼看见。传闻没有消失，至少不再被说成定案。",
              consequences: [
                { kind: "relation", npcId: "huangrong", delta: 2 },
                { kind: "reputation", delta: 1 },
              ],
              transition: { type: "end" },
            },
          ],
        },
      },
    },
  },
  {
    id: "taohua-evidence-disputed",
    once: true,
    trigger: {
      kind: "and",
      items: [
        { kind: "arcVariant", arcId: "shendiao", key: "act6.island", eq: "cleared" },
        { kind: "arcVariant", arcId: "shendiao", key: "act6.misunderstanding", eq: "partial" },
      ],
    },
    event: {
      id: "world-taohua-evidence-disputed",
      entryNode: "main",
      nodes: {
        main: {
          id: "main",
          title: "江湖回响·两种伤痕",
          text: "丐帮分舵送来两张验伤抄件。一张记着桃花岛落英掌伤，另一张却记着白驼蛇毒与九阴爪孔。两派弟子正为哪一张可信争执不休。",
          choices: [
            {
              id: "seal-both-records",
              text: "两份都封存",
              description: "不让任何一派先毁掉对自己不利的验伤记录。",
              resultText: "你让分舵在两份抄件上同时盖印，交由不同弟子带往烟雨楼。此后谁要质疑，都得当众指出哪一处伤痕作假。",
              consequences: [
                { kind: "factionAttitude", factionId: "beggar", delta: 2 },
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
    id: "taohua-evidence-summons",
    once: true,
    trigger: {
      kind: "and",
      items: [
        { kind: "arcVariant", arcId: "shendiao", key: "act6.island", eq: "cleared" },
        { kind: "arcVariant", arcId: "shendiao", key: "act6.misunderstanding", eq: "questioning" },
      ],
    },
    event: {
      id: "world-taohua-evidence-summons",
      entryNode: "main",
      presentation: "letter",
      letterStyle: "formal",
      nodes: {
        main: {
          id: "main",
          title: "江湖回响·烟雨楼验匣",
          letterIntro: "鲁有脚派两名弟子送来盖着丐帮分舵印记的短帖，另附三只编号木匣的封条。",
          text: "翡翠鞋、血字与蛇毒已分路送往烟雨楼。柯大侠愿当众复述所闻，韩女侠若能赴会，也请一并到场。各方只认证物，不认传闻。",
          letterSignature: "鲁有脚",
          choices: [
            {
              id: "accept-seals",
              text: "收下木匣封条",
              description: "确认三份证物在烟雨楼会局前不会被混换。",
              resultText: "你核过封条编号，让两名弟子分别走水路与陆路。烟雨楼会局因此多了可以逐件质询的实物。",
              consequences: [
                { kind: "relation", npcId: "luyoujiao", delta: 4 },
                { kind: "reputation", delta: 3 },
              ],
              transition: { type: "end" },
            },
          ],
        },
      },
    },
  },
]
