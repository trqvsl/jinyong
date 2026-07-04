import type { WorldEvent } from "./schema"

// ============================================================
// 涌现事件：不绑定地点，由世界状态自然浮现。
// 每次回到主界面时，由 world scheduler 扫描并触发第一个满足条件的事件。
// ============================================================

export const WORLD_EVENTS: WorldEvent[] = [
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
          speaker: "洪七公",
          text: "你刚回客舍，窗外忽然飘来一阵叫花鸡的香气。推门一看，洪七公正盘腿坐在屋檐上啃鸡腿，笑得胡子直抖：\"小子，最近做了几桩漂亮事，连俺老叫花都听见了。江湖上肯扶弱济困的人不多，值得俺专程来一趟。\"他说完随手把半只鸡丢给你，又指点了你几处运劲换气的诀窍。",
          choices: [
            {
              id: "accept-guidance",
              text: "虚心受教",
              description: "认真记下洪七公点拨的吐纳与发劲诀窍。",
              resultText: "洪七公边吃边骂你蠢，手下却毫不藏私。短短一炷香，你对内力流转和掌劲运使都多了几分领悟。临走前他拍着你的肩膀大笑：\"继续这么闯，别给俺丐帮丢人！\"",
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
              resultText: "你将书信反复读了几遍，把其中口诀默记于心，又把随信送来的薄礼一并收起。那名全真弟子打个稽首便离去了。",
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
              description: "夜色正好，索性陪黄蓉把这份点心吃完。",
              resultText: "你们把食盒里的点心分着吃完，又聊了些临安近来的事。临走前，黄蓉：\"算你还有良心，没有让我白来。\"",
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
]
