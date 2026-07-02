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
                { kind: "flag", name: "world.hongqigong.guided", value: true },
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
      nodes: {
        main: {
          id: "main",
          title: "江湖回响·全真来信",
          speaker: "全真弟子",
          text: "你回到落脚处时，一名全真弟子已在门前恭候，将一封火漆尚新的书信递到你手中。信中丘处机笔走龙蛇：\"牛家村雪夜一别，闻君近日侠名渐著，贫道甚慰。全真门下不敢忘义，特奉薄礼，以谢旧情。\"信末还附了几句运剑使气的口诀。",
          choices: [
            {
              id: "read-letter",
              text: "拆信细读",
              description: "收下全真门下这份善意与谢礼。",
              resultText: "你将书信反复读了几遍，把其中口诀默记于心。全真门下这一封来信，不但让你感到江湖并非冷漠，更让你对自身所行之路多了几分笃定。",
              consequences: [
                { kind: "relation", npcId: "qiuchuji", delta: 3 },
                { kind: "reputation", delta: 2 },
                { kind: "gold", delta: 20 },
                { kind: "item", id: "small-mp-pill", count: 1 },
                { kind: "flag", name: "world.quanzhen.acknowledged", value: true },
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
          text: "你夜里刚熄灯，窗棂便被人轻轻叩了三下。推窗一看，黄蓉正蹲在屋檐上晃着一只食盒，笑得像偷到鱼的小猫。她压低声音：\"你这人白天总忙得不见影，我只好夜里来找你了。喏，刚做好的点心，再不吃就凉啦。\"说着，她已经利落地翻窗进屋，把食盒啪地搁在桌上。",
          choices: [
            {
              id: "share-snack",
              text: "陪她吃完",
              description: "夜色正好，索性陪黄蓉把这份点心吃完。",
              resultText: "你们一边分吃点心，一边有一搭没一搭地闲聊。黄蓉说起临安的趣闻，也问你最近又惹了什么风波。她嘴上总爱挖苦两句，眼底却分明是开心的。临走时她轻轻哼道：\"算你还有良心，没有让我白来。\"",
              consequences: [
                { kind: "relation", npcId: "huangrong", delta: 5 },
                { kind: "hp", delta: 15 },
                { kind: "flag", name: "world.huangrong.visited", value: true },
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
      nodes: {
        main: {
          id: "main",
          title: "江湖回响·靖传良药",
          text: "你回到住处时，门口木栏上挂着一个粗布包，包裹里是两瓶金创药和一封字迹歪斜的小纸条。纸上写着：\"兄弟，听说你近来常与人动手，药留给你，别总逞强。——郭靖\"字写得不算漂亮，却一笔一画都认真得很，像那个人一样。",
          choices: [
            {
              id: "accept-medicine",
              text: "收下这份心意",
              description: "把药和纸条都妥帖收好。",
              resultText: "你把纸条反复看了几遍，忍不住笑了一下。江湖上愿意惦记别人伤势的人本就不多，更何况是郭靖这种笨拙却真心的惦记。你将药收入怀中，只觉得连心口都暖了些。",
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
      nodes: {
        main: {
          id: "main",
          title: "江湖回响·白驼密帖",
          text: "你在枕边发现一封不知何时塞进来的薄帖，信封内还掉出一小片蛇蜕。帖中只写了一句话：\"白驼山向来只认有胆有牙的人。你若愿来，自会有人引路。——锋\"字迹阴厉，纸上还带着淡淡药香，显然出自西毒一脉。",
          choices: [
            {
              id: "burn-it",
              text: "先收着再说",
              description: "不急着应，也不急着拒，先把这张密帖留作后手。",
              resultText: "你把密帖收入袖中，指尖还残留着一点淡淡的药香。无论这份邀约是试探还是拉拢，至少说明西毒已经注意到了你。江湖路上，往往被谁看见，本身就是一件事。",
              consequences: [
                { kind: "flag", name: "world.baituo.invited", value: true },
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
