import type { StoryEvent } from "../events"

// ============================================================
// 射雕英雄传 · 剧情卷（声明式）
// 按原著脉络的8个关键节点，主角作为"穿越者"介入原著故事。
// 因果串联：每个节点的 condition 检查前一个节点的 arcBeat，
// 确保玩家按序体验。设计见《剧情系统设计手册.md》。
// ============================================================

export const SHENDIAO_STORY: StoryEvent[] = [
  // ===== 1. 牛家村·风雪惊变（起点） =====
  {
    id: "shendiao-niujia",
    entryNode: "main",
    locationId: "niujia",
    weight: 6,
    once: true,
    nodes: {
      main: {
        id: "main",
        title: "牛家村·风雪惊变",
        text: "你踏雪夜宿牛家村。一户农舍灯火通明，两名壮汉正与一位道人对饮，那道人目光如电、杀气内敛，绝非寻常之辈。你尚未来得及细看，村外火把连绵——一队官军已围住村子，冷喝\"奉命缉拿钦犯\"。风雪里，一场血战似已无可避免。",
        choices: [
          {
            id: "defend", text: "挺身力战", description: "护那道人，与官军周旋，不论出身，先救人再说。",
            consequences: [{ kind: "reputation", delta: 3 }],
            consumeDay: true,
            resultText: "你纵身跃入农舍院中，拔兵刃迎向官军。那道人见有人援手，眼中闪过一丝讶异，随即与两名壮汉并肩而上。风雪里刀枪齐鸣，火把映得院墙忽明忽暗，这一战已无可回避。",
            transition: {
              type: "battle", enemyId: "guanjun",
              onWin: {
                text: "官军被你与丘处机联手杀退。丘处机长剑入鞘，深揖道：\"阁下仗义出手，武艺胆识皆是不凡，丘某佩服。\"他见你根骨奇佳，传你两式全真剑法的御敌要诀，又赠碎银作盘缠：\"日后江湖重逢，再共谋一醉。\"经此一役，你在牛家村一带声名鹊起。",
                consequences: [
                  { kind: "karma", delta: 5 },
                  { kind: "reputation", delta: 5 },
                  { kind: "gold", delta: 30 },
                  { kind: "aptitude", delta: 1 },
                  { kind: "relation", npcId: "qiuchuji", delta: 15 },
                  { kind: "npcRelationType", npcId: "qiuchuji", relationType: "朋友" },
                  { kind: "npcFaction", npcId: "qiuchuji", faction: "quanzhen" },
                  { kind: "factionAttitude", factionId: "quanzhen", delta: 10 },
                  { kind: "item", id: "small-hp-pill", count: 2 },
                  { kind: "arcBeat", arcId: "shendiao", beat: "niujia", result: "won" },
                  { kind: "flag", name: "shendiao.niujia.helped", value: true },
                ],
                then: { type: "goto", nodeId: "aftermath" },
              },
              onLose: {
                text: "你力战不敌，身负重伤倒地。恍惚间似有人将你救出村外，再睁眼已在破庙之中，丘处机留下一瓶金创药便已匆匆离去——此役虽败，却让你深知己身修为尚浅，更添奋进之心。",
                consequences: [
                  { kind: "arcBeat", arcId: "shendiao", beat: "niujia", result: "lost" },
                ],
                then: { type: "goto", nodeId: "aftermath" },
              },
              onFlee: {
                text: "你见官军人多势众，虚晃几招趁乱脱身。身后厮杀声渐远，你保全了性命，却终究未能帮上那道人。",
                consequences: [
                  { kind: "arcBeat", arcId: "shendiao", beat: "niujia", result: "skipped" },
                ],
                then: { type: "goto", nodeId: "aftermath" },
              },
            },
          },
          {
            id: "escort-pregnant", text: "护送妇孺", description: "趁乱护送农舍中一位孕妇从后山出村，保全无辜。",
            consequences: [
              { kind: "reputation", delta: 4 },
              { kind: "hp", delta: -5 },
              { kind: "item", id: "field-ration", count: 1 },
              { kind: "karma", delta: 3 },
              { kind: "arcBeat", arcId: "shendiao", beat: "niujia", result: "done" },
            ],
            consumeDay: true,
            resultText: "你借着风雪掩护，带着农舍中惊惶的孕妇从后山小路悄然出村。她紧紧护着腹中孩儿，低声谢你。走出数里，回望牛家村火光冲天，你只觉得这一夜的风雪像压在胸口，久久散不去。",
            transition: { type: "goto", nodeId: "aftermath" },
          },
          {
            id: "watch", text: "冷眼旁观", description: "藏身暗处，把那道人的全真剑法看个仔细，伺机而动。",
            consequences: [
              { kind: "aptitude", delta: 2 },
              { kind: "reputation", delta: -2 },
              { kind: "karma", delta: -2 },
              { kind: "arcBeat", arcId: "shendiao", beat: "niujia", result: "skipped" },
            ],
            consumeDay: true,
            resultText: "你伏于梁上，看那道人长剑如虹，官军竟一时近不得身。全真剑法的招式变化被你尽收眼底，似有所悟。待双方两败俱伤各自散去，你才悄然离开——只是这一夜袖手，心中难免留下几分愧疚。",
            transition: { type: "goto", nodeId: "aftermath" },
          },
        ],
      },
      aftermath: {
        id: "aftermath",
        title: "风雪之后",
        text: "风雪渐歇。你远远望见那道人抱起一名婴儿匆匆北去，另一对夫妇也抱着襁褓消失在夜色中。农舍中的孕妇紧紧护着腹中孩儿，在火光中默默垂泪。牛家村重新沉入夜色，只有残雪、血迹和哭声留在原地，叫人久久难忘。",
        autoNext: { type: "end" },
      },
    },
  },

  // ===== 2. 大漠·少年射雕 =====
  {
    id: "shendiao-damos",
    entryNode: "main",
    locationId: "damos",
    weight: 5,
    once: true,
    condition: { kind: "arcBeat", arcId: "shendiao", beat: "niujia" },
    nodes: {
      main: {
        id: "main",
        title: "大漠·少年射雕",
        text: "你北行至蒙古大漠，黄沙漫天间远远望见一个憨厚少年正跟七位形貌各异的师父苦练武功。他招式笨拙，每一式要练上百遍方才成型，却从不偷懒——额上汗水如雨，眼神却异常坚定。一只白雕掠过天际，少年抬手一箭，正中雕翅。好生神准！",
        choices: [
          {
            id: "guide", text: "上前指点", description: "少年根骨奇佳却不得其法，你忍不住点拨运气门道。",
            consequences: [
              { kind: "reputation", delta: 2 },
              { kind: "aptitude", delta: 1 },
              { kind: "relation", npcId: "guojing", delta: 12 },
            ],
            consumeDay: true,
            resultText: "你上前点拨那少年运气发力的门道。他虽憨厚，却如获至宝，连连道谢。七位师父见你出手不凡，亦拱手相谢。少年名叫郭靖——你心头一动，这名字似在牛家村那个风雪夜听过。",
            transition: { type: "goto", nodeId: "drill" },
          },
          {
            id: "spar", text: "切磋比试", description: "与少年过几招，试试他的斤两。",
            consequences: [
              { kind: "attack", delta: 2 },
              { kind: "relation", npcId: "guojing", delta: 5 },
            ],
            consumeDay: true,
            resultText: "你与郭靖切磋数招。他外家功夫扎实，却拙于变化。一番比试下来，你把自己的招式也磨砺得更精纯了。",
            transition: { type: "goto", nodeId: "drill" },
          },
          {
            id: "befriend", text: "结交为友", description: "欣赏这少年的憨直，请他喝碗马奶酒。",
            consequences: [
              { kind: "reputation", delta: 3 },
              { kind: "hp", delta: 20 },
              { kind: "item", id: "field-ration", count: 2 },
              { kind: "relation", npcId: "guojing", delta: 20 },
              { kind: "npcRelationType", npcId: "guojing", relationType: "朋友" },
            ],
            consumeDay: true,
            resultText: "你与郭靖对饮马奶酒，他说起大漠的辽阔与江南的故乡，眼中满是向往。临别时他紧紧握住你的手：\"后会有期！\"这份豪爽之交，让你心中暖意涌动。",
            transition: { type: "goto", nodeId: "drill" },
          },
        ],
      },
      drill: {
        id: "drill",
        title: "大漠·江南七怪",
        text: "入夜，七位师父围坐篝火。那矮胖女子韩小莹低声叹息：\"这孩子资质虽钝，胜在勤恳，只是……\"话未说完，为首的柯镇恶冷声道：\"既收了他做徒弟，便不谈资质。靖儿，再练！\"郭靖默默起身，又打了一套拳法。七位师父各有绝学，却因一个承诺，在这苦寒大漠守了整整十年——你暗暗敬佩。",
        autoNext: { type: "goto", nodeId: "farewell" },
        onEnter: [{ kind: "reputation", delta: 1 }],
      },
      farewell: {
        id: "farewell",
        title: "大漠·惜别",
        text: "数日后，你辞别郭靖继续南行。他追出三里地，塞给你一包干粮：\"江湖路远，兄弟保重！\"你望着他憨厚的背影，只觉得这份直来直去的情义，在江湖上实在难得。风从草原尽头吹来，把马奶酒和篝火的气味一并留在了身后。",
        autoNext: { type: "end" },
        onEnter: [
          { kind: "arcBeat", arcId: "shendiao", beat: "damos", result: "done" },
          { kind: "hp", delta: 20 },
        ],
      },
    },
  },

  // ===== 3. 中原·客栈奇缘 =====
  {
    id: "shendiao-meet-rong",
    entryNode: "main",
    locationId: "linan",
    weight: 5,
    once: true,
    condition: { kind: "arcBeat", arcId: "shendiao", beat: "damos" },
    nodes: {
      main: {
        id: "main",
        title: "中原·客栈奇缘",
        text: "你南下中原，在临安城外一家客栈歇脚。邻桌一个满脸煤灰的小乞丐正点满一桌好菜大快朵颐，吃相颇为斯文；身旁陪着个憨厚青年，一脸宠溺地看着。你眼角一跳——这乞丐……怎么看都不像寻常叫花子。",
        choices: [
          {
            id: "chat", text: "上前搭话", description: "这两人气质不凡，不妨结识一番。",
            consequences: [
              { kind: "relation", npcId: "huangrong", delta: 10 },
              { kind: "relation", npcId: "guojing", delta: 8 },
            ],
            consumeDay: true,
            resultText: "你上前攀谈。那小乞丐眼珠一转，三言两语便试探出你的深浅，随即咯咯笑了起来：\"你这人倒有趣。\"那憨厚青年正是郭靖——大漠一别，不想在此重逢！他见你友善，忙请你同坐。",
            transition: { type: "goto", nodeId: "reveal" },
          },
          {
            id: "treat", text: "请客结账", description: "替这两人付了酒钱，结个善缘。",
            consequences: [
              { kind: "gold", delta: -50 },
              { kind: "relation", npcId: "huangrong", delta: 18 },
              { kind: "relation", npcId: "guojing", delta: 6 },
              { kind: "karma", delta: 3 },
            ],
            consumeDay: true,
            resultText: "你悄悄替他们结了账。小乞丐察觉后挑眉看你，似在重新估量你。",
            transition: { type: "goto", nodeId: "reveal" },
          },
          {
            id: "observe", text: "静观不语", description: "这两人来历不凡，不贸然搭讪。",
            consequences: [
              { kind: "aptitude", delta: 1 },
            ],
            consumeDay: true,
            resultText: "你默默观察，只见那小乞丐谈笑间机锋暗藏，憨厚青年却一片赤诚。你暗暗记下这对组合。",
            transition: { type: "goto", nodeId: "reveal" },
          },
        ],
      },
      reveal: {
        id: "reveal",
        title: "真相·桃花岛上小东邪",
        text: "夜深，小乞丐忽然摘下头上破帽，抖落煤灰——一头青丝如瀑泻下，竟是个绝色少女！她咯咯笑道：\"我叫黄蓉，桃花岛黄药师之女。你这人若有趣，改日来岛上找我爹下棋。\"郭靖目瞪口呆，你看着她眉眼间那股掩不住的灵气，只觉这才和白日里那个古灵精怪的小乞丐对上了。",
        autoNext: { type: "end" },
        onEnter: [
          { kind: "arcBeat", arcId: "shendiao", beat: "meet-rong", result: "done" },
          { kind: "flag", name: "shendiao.rong.revealed", value: true },
          { kind: "aptitude", delta: 1 },
        ],
      },
    },
  },

  // ===== 4. 洪七公·叫花传功 =====
  {
    id: "shendiao-qigong",
    entryNode: "main",
    locationId: "linan",
    weight: 5,
    once: true,
    condition: { kind: "arcBeat", arcId: "shendiao", beat: "meet-rong" },
    nodes: {
      main: {
        id: "main",
        title: "洪七公·叫花传功",
        text: "你路过临安城外一片松林，忽然闻到一股奇香。循香而去，只见一个衣衫褴褛的老叫花正啃着一只烧鸡，旁边黄蓉正笑盈盈地往火堆上加佐料。那老叫花吃一口叫一声好，手指油光锃亮——你心中一凛：此人虽邋遢，却有一股不怒自威的宗师气度。",
        choices: [
          {
            id: "join-feast", text: "入席同享", description: "厚着脸皮坐下，尝尝黄蓉的手艺。",
            consequences: [
              { kind: "relation", npcId: "hongqigong", delta: 8 },
              { kind: "relation", npcId: "huangrong", delta: 5 },
              { kind: "hp", delta: 30 },
            ],
            consumeDay: true,
            resultText: "黄蓉给你盛了一碗汤，鲜香无比。老叫花斜眼看你：\"小子，嘴倒不刁。\"你与三人席地而坐，松风入耳，竟是一顿难得的快意晚餐。",
            transition: { type: "goto", nodeId: "feast" },
          },
          {
            id: "watch-silently", text: "远远观望", description: "此人武功深不可测，不贸然接近。",
            consequences: [
              { kind: "aptitude", delta: 2 },
              { kind: "reputation", delta: 1 },
            ],
            consumeDay: true,
            resultText: "你藏身暗处，只见老叫花吃完烧鸡后忽然拍了郭靖后背一掌——一股浑厚内力透体而过！你看得心惊，这分明是以内力替他打通经脉的高深手法。",
            transition: { type: "goto", nodeId: "feast" },
          },
          {
            id: "challenge", text: "上前请教", description: "厚礼求教，看这位前辈愿不愿指点。",
            condition: { kind: "relation", npcId: "guojing", gte: 15 },
            consequences: [
              { kind: "relation", npcId: "hongqigong", delta: 15 },
            ],
            consumeDay: true,
            resultText: "你上前行礼请教。老叫花上下打量你，忽然大笑：\"好小子，有胆！俺洪七公今天心情好，便教你们两手！\"",
            transition: { type: "goto", nodeId: "feast" },
          },
        ],
      },
      feast: {
        id: "feast",
        title: "松林·降龙初现",
        text: "洪七公酒足饭饱，忽然拍拍肚子站起来：\"吃了人家姑娘这么多好菜，不还个人情说不过去。靖儿，过来！\"他右掌推出，掌风激荡松林，落叶纷飞——正是降龙十八掌第一式「亢龙有悔」！郭靖依样施为，虽笨拙却掌力浑厚。七公转头看向你：\"你也要学？\"",
        autoNext: {
          type: "branch",
          cases: [
            { when: { kind: "relation", npcId: "hongqigong", gte: 10 }, then: { type: "goto", nodeId: "teaching" } },
          ],
          else: { type: "goto", nodeId: "watch-only" },
        },
      },
      teaching: {
        id: "teaching",
        title: "降龙十八掌·初窥",
        text: "洪七公见你有心，便传你降龙十八掌的入门心法。他讲得粗疏，要旨却清晰无比——至刚至阳，一掌既出，有去无回。你反复演练，终于摸到了第一式的门径。七公大笑：\"孺子可教！不过这门掌法，非一日之功，你日后须勤加修炼。\"",
        autoNext: { type: "end" },
        onEnter: [
          { kind: "skill", id: "xianglong18" },
          { kind: "arcBeat", arcId: "shendiao", beat: "qigong", result: "won" },
          { kind: "reputation", delta: 5 },
          { kind: "mp", delta: 15 },
          { kind: "npcRelationType", npcId: "hongqigong", relationType: "师徒" },
        ],
      },
      "watch-only": {
        id: "watch-only",
        title: "松林·旁观摩掌",
        text: "你远远看着洪七公传郭靖掌法。那掌力刚猛无俦，松枝断折声如爆竹。你虽未能亲学，却也将出掌的运势看了个大概——日后若再遇降龙掌，至少不会两眼一抹黑。",
        autoNext: { type: "end" },
        onEnter: [
          { kind: "arcBeat", arcId: "shendiao", beat: "qigong", result: "done" },
          { kind: "aptitude", delta: 2 },
          { kind: "attack", delta: 1 },
        ],
      },
    },
  },

  // ===== 5. 赵王府·夜探藏经 =====
  {
    id: "shendiao-wangfu",
    entryNode: "main",
    locationId: "linan",
    weight: 5,
    once: true,
    condition: { kind: "arcBeat", arcId: "shendiao", beat: "qigong" },
    nodes: {
      main: {
        id: "main",
        title: "赵王府·夜探藏经",
        text: "你打听到赵王府中藏有武穆遗书与九阴真经残卷，遂趁夜潜入。王府重重院落，灯火通明处隐约可见高手巡夜。你屏息潜行，忽闻远处传来凄厉怪笑——似有人正在练那阴毒的九阴白骨爪。黄蓉曾提过：赵王府中有一对阴险夫妻，梅超风与陈玄风，叛出桃花岛后在此藏匿。",
        choices: [
          {
            id: "steal", text: "深入盗书", description: "机缘与风险并存，博他一回。",
            consequences: [{ kind: "karma", delta: -2 }],
            consumeDay: true,
            resultText: "你潜入王府密室，四下翻找——",
            transition: { type: "goto", nodeId: "inner-court" },
          },
          {
            id: "ambush", text: "伏击巡夜", description: "遇王府高手，索性一战。",
            consumeDay: true,
            resultText: "你撞上王府护院高手，对方冷喝一声拔刀相向！",
            transition: {
              type: "battle", enemyId: "emingke",
              onWin: {
                text: "你几招制服王府护院，搜身得了一本残破武学手札与碎银。虽未深入藏经之所，收获已是不菲。",
                consequences: [
                  { kind: "gold", delta: 40 },
                  { kind: "item", id: "small-mp-pill", count: 1 },
                ],
                then: { type: "goto", nodeId: "escape" },
              },
              onLose: { text: "护院武艺不弱，你力战不敌，趁夜色狼狈逃出王府。此行空手而归，还险些折在里面。", then: { type: "goto", nodeId: "escape" } },
              onFlee: { text: "你虚晃几招遁入夜色，全身而退。", then: { type: "goto", nodeId: "escape" } },
            },
          },
          {
            id: "retreat", text: "见好就收", description: "王府高手如云，不可逞强。",
            consequences: [{ kind: "reputation", delta: 1 }],
            consumeDay: true,
            resultText: "你明智地全身而退。虽空手而归，却保全了性命。",
            transition: { type: "end" },
          },
        ],
      },
      "inner-court": {
        id: "inner-court",
        title: "王府·暗室惊变",
        text: "你在密室中翻得一部内功心法残卷，正要收起，身后传来阴恻恻的笑声：\"嘿嘿，胆敢擅闯王府，不知死活！\"一道劲风袭来——是梅超风！她双目已盲，却凭听风辨形之术锁定了你的方位。",
        choices: [
          {
            id: "fight-meichaofeng", text: "迎战梅超风", description: "避无可避，唯有力战！",
            consumeDay: true,
            transition: {
              type: "battle", enemyId: "meichaofeng",
              onWin: {
                text: "你拼尽全力击退梅超风，趁她调息之机夺路而出。怀中残卷虽只半部，依稀可见《九阴真经》的字样——这趟险没有白冒！",
                consequences: [
                  { kind: "skill", id: "jiuyang" },
                  { kind: "mp", delta: 20 },
                  { kind: "reputation", delta: 4 },
                ],
                then: { type: "goto", nodeId: "escape" },
              },
              onLose: {
                text: "九阴白骨爪阴毒无比，你不敌倒地。恍惚间似有人将你拖出王府——再睁眼已在城外破庙，怀中残卷不翼而飞。",
                then: { type: "goto", nodeId: "escape" },
              },
              onFlee: {
                text: "你忌惮梅超风毒功，趁她盲目之机闪身遁走，虽丢了残卷，好歹保全了性命。",
                then: { type: "goto", nodeId: "escape" },
              },
            },
          },
          {
            id: "distract", text: "投石问路", description: "她双目失明，靠听觉定位——制造声响引开她。",
            consequences: [
              { kind: "aptitude", delta: 2 },
            ],
            consumeDay: true,
            resultText: "你将一枚铜钱弹向墙角，梅超风掌风追随声息而去。你趁机溜出密室，顺手带走了残卷——好险！",
            transition: { type: "goto", nodeId: "escape" },
          },
        ],
      },
      escape: {
        id: "escape",
        title: "王府·月下脱身",
        text: "你翻出王府高墙，消失在夜色中。身后隐约传来杨康的声音，他在招呼什么人——这小王爷与梅超风之间，似乎有不可告人的关联。你暗暗记下此事，日后或有大用。",
        autoNext: { type: "end" },
        onEnter: [
          { kind: "arcBeat", arcId: "shendiao", beat: "wangfu", result: "done" },
          { kind: "flag", name: "shendiao.wangfu.infiltrated", value: true },
        ],
      },
    },
  },

  // ===== 6. 桃花岛·东邪试炼 =====
  {
    id: "shendiao-taohua",
    entryNode: "arrival",
    locationId: "taohuadao",
    weight: 5,
    once: true,
    condition: { kind: "arcBeat", arcId: "shendiao", beat: "wangfu" },
    nodes: {
      arrival: {
        id: "arrival",
        title: "桃花岛·东邪试炼",
        text: "渡海登岛，满目桃花灼灼。奇门阵法暗藏其中，你循着黄蓉留下的标记穿过桃林，来到一座精舍前。黄药师负手而立，冷冷看着你：\"能破我桃花阵而入者，近年不过寥寥数人。你来此何事？\"你说明来意——为他女儿与郭靖之事而来。黄药师冷哼一声：\"先过我三关再说。\"",
        choices: [
          {
            id: "accept-test", text: "应下三关", description: "既来之则安之，闯一闯东邪的试炼。",
            consumeDay: true,
            resultText: "你抱拳道：\"晚辈愿领教。\"黄药师微微颔首，眼中闪过一丝赞赏。",
            transition: { type: "goto", nodeId: "test" },
          },
          {
            id: "negotiate", text: "以理服人", description: "不比武力，以言语打动黄药师。",
            condition: { kind: "relation", npcId: "huangrong", gte: 15 },
            consequences: [{ kind: "relation", npcId: "huangyaoshi-npc", delta: 5 }],
            consumeDay: true,
            resultText: "你不卑不亢，将黄蓉在江湖中所受的险厄一一说来，又言郭靖虽钝却忠贞不二。黄药师面色稍缓：\"你倒替他说了好话。也罢，但试一关——过了便准。\"",
            transition: { type: "goto", nodeId: "test" },
          },
          {
            id: "force-entry", text: "强行闯岛", description: "东邪虽强，未必不可力敌。",
            consequences: [
              { kind: "relation", npcId: "huangyaoshi-npc", delta: -15 },
              { kind: "karma", delta: -5 },
            ],
            consumeDay: true,
            resultText: "你运功强闯桃花阵，黄药师面露不悦。他不发一言，一掌向你推来！",
            transition: {
              type: "battle", enemyId: "huangyaoshi",
              onWin: {
                text: "你拼尽全力与黄药师过了数招，竟未落下风。他收掌而立，冷冷道：\"功夫倒还过得去。罢了，看在蓉儿份上，不与你计较。\"",
                consequences: [
                  { kind: "reputation", delta: 8 },
                  { kind: "relation", npcId: "huangyaoshi-npc", delta: 10 },
                ],
                then: { type: "goto", nodeId: "result" },
              },
              onLose: {
                text: "黄药师武功远在你之上，数招之间你便被制住。他冷声道：\"不自量力。\"拂袖而去，你被逐出桃花岛。",
                then: { type: "end" },
              },
              onFlee: {
                text: "你知不敌，趁阵法遮掩狼狈退走。黄药师并未追击，只是冷哼一声。此番面上无光。",
                then: { type: "end" },
              },
            },
          },
        ],
      },
      test: {
        id: "test",
        title: "桃花·奇门试炼",
        text: "黄药师引你入阵，四面桃花纷飞，方位不断变幻。他冷声道：\"一炷香内走出此阵，便算你过。\"你凝神观察，发现阵眼随生门变化而转——这便是桃花岛奇门遁甲的奥妙。",
        choices: [
          {
            id: "solve-array", text: "推演阵法", description: "静心推算生门方位，以智破阵。",
            consequences: [
              { kind: "relation", npcId: "huangyaoshi-npc", delta: 12 },
              { kind: "aptitude", delta: 2 },
            ],
            consumeDay: true,
            resultText: "你闭目推演，步步踏在生门之上。桃花让路，奇阵自开。黄药师目中闪过一丝惊讶：\"你竟懂奇门？难得。\"",
            transition: { type: "goto", nodeId: "result" },
          },
          {
            id: "brute-force", text: "以力破阵", description: "管他什么阵法，一力降十会！",
            consumeDay: true,
            resultText: "你运功强行闯阵，左冲右突——",
            transition: {
              type: "battle", enemyId: "huangyaoshi",
              onWin: {
                text: "你以蛮力破阵而出，虽狼狈却不失气势。黄药师叹道：\"莽夫有莽夫的好处。过关。\"",
                consequences: [
                  { kind: "speed", delta: 2 },
                ],
                then: { type: "goto", nodeId: "result" },
              },
              onLose: {
                text: "你体力耗尽倒在阵中。黄药师摇头：\"有勇无谋。\"将你送出岛外。",
                then: { type: "end" },
              },
            },
          },
          {
            id: "ask-rong", text: "求黄蓉暗助", description: "她最了解父亲的阵法。",
            condition: { kind: "relation", npcId: "huangrong", gte: 20 },
            consequences: [
              { kind: "relation", npcId: "huangrong", delta: 5 },
              { kind: "relation", npcId: "huangyaoshi-npc", delta: -5 },
            ],
            consumeDay: true,
            resultText: "黄蓉悄悄给你递了暗号，指引生门方位。你从容走出阵去。黄药师面色微沉，似已察觉女儿暗中帮了你，却未点破。",
            transition: { type: "goto", nodeId: "result" },
          },
        ],
      },
      result: {
        id: "result",
        title: "桃花岛·翁婿和解",
        text: "黄药师长叹一声：\"罢了。蓉儿既认了那傻小子，老夫再拦也无用。\"他看了你一眼：\"你既为客，便在此盘桓数日。\"数日间，你观摩了桃花岛的奇门术数与音律武学，获益匪浅。临行时黄药师破天荒送至码头：\"日后若有难处，可来桃花岛寻我。\"——这便是东邪对友人最高的礼遇。",
        autoNext: { type: "end" },
        onEnter: [
          { kind: "arcBeat", arcId: "shendiao", beat: "taohua", result: "done" },
          { kind: "reputation", delta: 5 },
          { kind: "factionAttitude", factionId: "taohuadao", delta: 15 },
          { kind: "aptitude", delta: 2 },
          { kind: "skill", id: "lanhua" },
          { kind: "npcRelationType", npcId: "huangyaoshi-npc", relationType: "朋友" },
          { kind: "npcFaction", npcId: "huangyaoshi-npc", faction: "taohuadao" },
        ],
      },
    },
  },

  // ===== 7. 铁枪庙·恩仇了断（正邪核心分支） =====
  {
    id: "shendiao-yangkang",
    entryNode: "main",
    locationId: "niujia",
    weight: 5,
    once: true,
    condition: { kind: "arcBeat", arcId: "shendiao", beat: "taohua" },
    nodes: {
      main: {
        id: "main",
        title: "铁枪庙·恩仇了断",
        text: "你回到牛家村，村头那座破败的铁枪庙前围满了人。庙内传来争执声——杨康正与穆念慈对峙，他身后还站着几个金国武士。杨铁心的遗物铁枪就插在庙中，枪身上刻着\"杨\"字。杨康面色铁青：\"我生来便是完颜康！什么杨铁心、什么汉人血脉——与我何干！\"",
        choices: [
          {
            id: "persuade", text: "劝说杨康", description: "晓以大义，劝他认祖归宗。",
            consequences: [{ kind: "karma", delta: 5 }],
            consumeDay: true,
            resultText: "你上前一步：\"杨兄，身世不可改，血脉不可弃。令尊杨铁心一生忠义——你当真要认贼作父？\"杨康猛然回头，眼中闪过一丝挣扎……",
            transition: { type: "goto", nodeId: "confrontation" },
          },
          {
            id: "expose", text: "揭穿真相", description: "当众揭穿杨康认贼作父的真相，逼他面对。",
            consequences: [
              { kind: "karma", delta: 3 },
              { kind: "reputation", delta: 3 },
              { kind: "relation", npcId: "yangkang", delta: -20 },
            ],
            consumeDay: true,
            resultText: "你高声道：\"诸位！此人本名杨康，乃杨铁心之子，却认金国完颜洪烈为父，替金人做事！\"四下哗然。杨康面色惨白，随即转为暴怒。",
            transition: { type: "goto", nodeId: "confrontation" },
          },
          {
            id: "side-yangkang", text: "助杨康脱身", description: "他虽有不是，但各人有各人的选择。",
            consequences: [
              { kind: "karma", delta: -10 },
              { kind: "relation", npcId: "yangkang", delta: 15 },
              { kind: "relation", npcId: "guojing", delta: -15 },
              { kind: "gold", delta: 100 },
            ],
            consumeDay: true,
            resultText: "你挡在杨康身前，替他挡开众人的质问。他低声道了声谢，眼中却有算计之色。郭靖远远望着你，眼中满是失望。",
            transition: { type: "goto", nodeId: "confrontation" },
          },
        ],
      },
      confrontation: {
        id: "confrontation",
        title: "铁枪庙·生死一念",
        text: "杨康忽然暴起，抓起铁枪直刺穆念慈！你横身挡住——他的枪法阴狠毒辣，竟是九阴白骨爪的路数！\"挡我者死！\"杨康双目赤红，杀意毕露。",
        choices: [
          {
            id: "fight-yangkang", text: "迎战杨康", description: "避无可避，唯有力战！",
            consumeDay: true,
            transition: {
              type: "battle", enemyId: "yangkang",
              onWin: {
                text: "你击落杨康手中铁枪，他踉跄后退。穆念慈哭道：\"康哥，够了……\"杨康眼中闪过一丝复杂神色，随即转身冲入雨幕之中。",
                consequences: [
                  { kind: "npcTag", npcId: "yangkang", tag: "杨康已黑化" },
                ],
                then: { type: "goto", nodeId: "judgment" },
              },
              onLose: {
                text: "杨康枪法凌厉，你负伤倒地。郭靖赶到挡住杨康，两人对峙。杨康冷笑一声，带着金国武士扬长而去。",
                then: { type: "goto", nodeId: "judgment" },
              },
              onFlee: {
                text: "你忌惮杨康毒功，闪身退开。他趁机遁走，消失在雨夜之中。",
                then: { type: "goto", nodeId: "judgment" },
              },
            },
          },
          {
            id: "let-him-go", text: "放他离去", description: "不必与他生死相搏，由他去吧。",
            consequences: [
              { kind: "karma", delta: -3 },
            ],
            consumeDay: true,
            resultText: "你侧身让开，杨康冷笑一声冲出铁枪庙。穆念慈跌坐在地，泪流满面。郭靖沉默不语。",
            transition: { type: "goto", nodeId: "judgment" },
          },
        ],
      },
      judgment: {
        id: "judgment",
        title: "铁枪庙·善恶一念",
        text: "杨康被逼入绝境，忽然从怀中摸出一枚暗器——铁枪庙中的铁枪头上淬了剧毒！他面目狰狞地朝穆念慈掷去！千钧一发之际——",
        choices: [
          {
            id: "save-munianci", text: "飞身救人", description: "挡在穆念慈身前，哪怕自己中毒！",
            consequences: [
              { kind: "karma", delta: 15 },
              { kind: "hp", delta: -40 },
              { kind: "relation", npcId: "guojing", delta: 15 },
              { kind: "relation", npcId: "yangkang", delta: -25 },
              { kind: "npcAlive", npcId: "yangkang", alive: false },
              { kind: "npcTag", npcId: "yangkang", tag: "杨康已殒" },
            ],
            consumeDay: true,
            resultText: "你飞身挡在穆念慈身前，毒镖刺入你肩头！剧痛入骨，但你咬紧牙关。杨康见毒镖伤了你而非穆念慈，愣了一瞬——就在这一瞬间，铁枪庙的断梁轰然倒塌，将他砸入火海之中。杨康，终于为自己的选择付出了代价。",
            transition: { type: "goto", nodeId: "aftermath" },
          },
          {
            id: "let-fate-decide", text: "不出手", description: "杨康自作自受，因果自有定数。",
            consequences: [
              { kind: "karma", delta: -5 },
              { kind: "npcAlive", npcId: "yangkang", alive: false },
              { kind: "npcTag", npcId: "yangkang", tag: "杨康已殒" },
            ],
            consumeDay: true,
            resultText: "你没有出手。毒镖擦过穆念慈的衣袖，杨康得意大笑——然而笑声未落，他忽然面色铁青，双手掐住自己喉咙。原来他刚才比试时手掌被铁枪上的毒划伤，以毒攻毒，反噬己身。郭靖冲上去抱住他，杨康在义兄怀中咽下最后一口气，嘴角犹带着不甘的笑。",
            transition: { type: "goto", nodeId: "aftermath" },
          },
          {
            id: "save-yangkang", text: "拉杨康一把", description: "无论如何，他不该死在这里。",
            consequences: [
              { kind: "karma", delta: -8 },
              { kind: "relation", npcId: "yangkang", delta: 20 },
              { kind: "npcRelationType", npcId: "yangkang", relationType: "朋友" },
              { kind: "relation", npcId: "guojing", delta: -10 },
              { kind: "npcTag", npcId: "yangkang", tag: "杨康遁走" },
              { kind: "gold", delta: 50 },
            ],
            consumeDay: true,
            resultText: "你一把拉住杨康，将他拽离倒塌的断梁。他挣脱你的手，踉跄退入雨中，回头看了你一眼——那目光里有感激，更有不甘。\"你救我一次，但我不领情。\"他消失在夜色中，留下穆念慈的哭声和郭靖沉默的背影。",
            transition: { type: "goto", nodeId: "aftermath" },
          },
        ],
      },
      aftermath: {
        id: "aftermath",
        title: "铁枪庙·雨霁",
        text: "铁枪庙的雨渐渐停了。郭靖默默将杨铁心的铁枪从废墟中拔出，擦净泥污，插回村口。穆念慈跪在庙前低声啜泣。你望着这一切，心中百味杂陈——这便是江湖：恩怨纠葛，身不由己。而更大的风浪，尚在华山之巅等着。",
        autoNext: { type: "end" },
        onEnter: [
          { kind: "arcBeat", arcId: "shendiao", beat: "yangkang", result: "done" },
          { kind: "reputation", delta: 5 },
        ],
      },
    },
  },

  // ===== 8. 华山论剑·天下五绝（主线收束） =====
  {
    id: "shendiao-huashan",
    entryNode: "summit",
    locationId: "huashan",
    weight: 5,
    once: true,
    condition: { kind: "arcBeat", arcId: "shendiao", beat: "yangkang" },
    nodes: {
      summit: {
        id: "summit",
        title: "华山论剑·天下五绝",
        text: "华山之巅，云海翻涌。五位当世绝顶高手各据一方——东邪黄药师、西毒欧阳锋、南帝一灯大师、北丐洪七公，以及中神通王重阳的传人全真教众。郭靖立于峰顶，降龙十八掌掌风猎猎，已是当世一等一的高手。你站在观礼的人群中，感受着这千年一遇的武学盛会。",
        choices: [
          {
            id: "challenge-arena", text: "下场比武", description: "千载难逢，与天下高手过招！",
            consumeDay: true,
            resultText: "你纵身跃入场中。四下惊叹声起——竟有人敢在五绝面前献技！",
            transition: {
              type: "battle", enemyId: "ouyangfeng",
              onWin: {
                text: "你竟力抗西毒欧阳锋数十招而不败！虽未能取胜，但全场震动。洪七公抚掌大笑：\"好小子！有俺当年风采！\"黄药师微微颔首，连欧阳锋也阴阴一笑：\"你，倒是个人物。\"",
                consequences: [
                  { kind: "reputation", delta: 15 },
                  { kind: "skill", id: "xianglong18" },
                  { kind: "exp", delta: 200 },
                ],
                then: { type: "goto", nodeId: "contest" },
              },
              onLose: {
                text: "欧阳锋蛤蟆功一发，你如遭雷击败退。虽败犹荣——能在五绝面前走上几招，已是江湖中人梦寐以求的经历。洪七公安慰道：\"输给西毒不丢人，俺当年也赢不了他。\"",
                consequences: [
                  { kind: "reputation", delta: 5 },
                  { kind: "exp", delta: 80 },
                  { kind: "aptitude", delta: 2 },
                ],
                then: { type: "goto", nodeId: "contest" },
              },
              onFlee: {
                text: "你见欧阳锋势不可挡，明智地退出场外。观战的洪七公朝你竖了竖大拇指——能审时度势，亦是武者修为。",
                consequences: [
                  { kind: "reputation", delta: 2 },
                ],
                then: { type: "goto", nodeId: "contest" },
              },
            },
          },
          {
            id: "observe-contest", text: "观战悟道", description: "静观五绝过招，揣摩绝世武学。",
            consumeDay: true,
            consequences: [
              { kind: "aptitude", delta: 3 },
              { kind: "attack", delta: 2 },
              { kind: "speed", delta: 2 },
            ],
            resultText: "你静坐观战，将五绝的招式变化尽收眼底。降龙十八掌的刚猛、蛤蟆功的阴毒、兰花拂穴手的精妙——这一夜所见，抵得过数年苦修。",
            transition: { type: "goto", nodeId: "contest" },
          },
          {
            id: "assist-guojing", text: "助郭靖守擂", description: "郭靖正在力抗群雄，你去替他分担。",
            condition: { kind: "relation", npcId: "guojing", gte: 20 },
            consequences: [
              { kind: "relation", npcId: "guojing", delta: 10 },
              { kind: "relation", npcId: "huangrong", delta: 5 },
              { kind: "reputation", delta: 8 },
              { kind: "exp", delta: 150 },
            ],
            consumeDay: true,
            resultText: "你纵身至郭靖身侧，与他联手抵挡各路挑战者。二人配合默契，降龙掌与你所学武学相辅相成，竟将数位高手逼退。郭靖大笑：\"兄弟好身手！\"",
            transition: { type: "goto", nodeId: "contest" },
          },
          {
            id: "seek-yangkang", text: "寻访杨康", description: "铁枪庙一别，不知他是否尚在人世。",
            condition: { kind: "npcHasTag", npcId: "yangkang", tag: "杨康遁走" },
            consequences: [
              { kind: "karma", delta: 3 },
              { kind: "relation", npcId: "yangkang", delta: 5 },
            ],
            consumeDay: true,
            resultText: "你趁论剑间隙下山，在华山脚下的小镇找到了杨康。他面容消瘦，眼中却不再有那股阴鸷之气。\"你居然还来找我……\"他沉默良久，\"我已不再是完颜康了。\"你与他默默饮尽一壶浊酒，各自无言——江湖路远，各人有各人的归途。",
            transition: { type: "goto", nodeId: "contest" },
          },
        ],
      },
      contest: {
        id: "contest",
        title: "论剑·天下第一",
        text: "论剑三昼夜，胜负终分。郭靖以降龙十八掌力压群雄，洪七公含笑认可——北丐之位，后继有人。黄药师虽未下场，却在散场时看了你一眼：\"你倒是个异数——不属于这个江湖，却搅动了这一池春水。\"",
        autoNext: {
          type: "branch",
          cases: [
            { when: { kind: "karma", gte: 30 }, then: { type: "goto", nodeId: "epilogue-hero" } },
            { when: { kind: "karma", lte: -30 }, then: { type: "goto", nodeId: "epilogue-outcast" } },
          ],
          else: { type: "goto", nodeId: "epilogue-wanderer" },
        },
      },
      "epilogue-hero": {
        id: "epilogue-hero",
        title: "射雕·侠之大者",
        text: "华山论剑落幕。你行侠仗义、扶危济困的声名已传遍江湖。郭靖握住你的手：\"兄弟，你我虽非同姓，却胜似手足。靖愿与你共守襄阳、抗击鞑虏！\"黄蓉在旁盈盈一笑，洪七公大笑远去，黄药师拂袖归岛。你立于华山之巅，俯瞰万里河山——这一遭穿越，终是不负此行。",
        autoNext: { type: "end" },
        onEnter: [
          { kind: "arcBeat", arcId: "shendiao", beat: "huashan", result: "won" },
          { kind: "reputation", delta: 10 },
          { kind: "relation", npcId: "guojing", delta: 10 },
          { kind: "npcRelationType", npcId: "guojing", relationType: "知己" },
          { kind: "npcRecruit", npcId: "guojing", recruited: true },
          { kind: "flag", name: "shendiao.complete", value: true },
          { kind: "flag", name: "shendiao.ending", value: "hero" },
        ],
      },
      "epilogue-outcast": {
        id: "epilogue-outcast",
        title: "射雕·独步江湖",
        text: "华山论剑落幕，众人散去。你独行下山，欧阳锋忽然出现在路旁：\"嘿嘿，小子，你跟那帮伪君子不是一路人。老夫看好你。\"他递来一枚蛇形令牌——持此可入白驼山修炼。你回望华山之巅的余晖，心中冷笑：这江湖，不过是另一个名利场罢了。",
        autoNext: { type: "end" },
        onEnter: [
          { kind: "arcBeat", arcId: "shendiao", beat: "huashan", result: "done" },
          { kind: "reputation", delta: 5 },
          { kind: "relation", npcId: "ouyangfeng-npc", delta: 15 },
          { kind: "relation", npcId: "guojing", delta: -10 },
          { kind: "flag", name: "shendiao.complete", value: true },
          { kind: "flag", name: "shendiao.ending", value: "outcast" },
        ],
      },
      "epilogue-wanderer": {
        id: "epilogue-wanderer",
        title: "射雕·江湖路远",
        text: "华山论剑落幕。你既未与郭靖同守襄阳，也未随欧阳锋入白驼山。你只是背起行囊，继续走你自己的江湖路。身后传来黄蓉的声音：\"喂——下次再见面，记得请我吃饭！\"你没有回头，嘴角却微微上扬。这个世界的故事远未结束，而你的旅途，才刚刚开始。",
        autoNext: { type: "end" },
        onEnter: [
          { kind: "arcBeat", arcId: "shendiao", beat: "huashan", result: "done" },
          { kind: "reputation", delta: 5 },
          { kind: "flag", name: "shendiao.complete", value: true },
          { kind: "flag", name: "shendiao.ending", value: "wanderer" },
        ],
      },
    },
  },

  // ===== 9. 牛家村·故园残雪 =====
  {
    id: "shendiao-niujia-snow",
    entryNode: "main",
    locationId: "niujia",
    weight: 3,
    once: true,
    condition: { kind: "arcBeat", arcId: "shendiao", beat: "niujia" },
    nodes: {
      main: {
        id: "main",
        title: "牛家村·故园残雪",
        text: "你再回牛家村时，雪早已化尽，只剩几堵焦黑的残墙。村口老妪坐在断井边，絮絮叨叨说起那一夜官军围村、道人杀敌、村民逃散的旧事。你立在风里，竟觉得这里像一根扎在江湖里的刺，提醒人有些动荡看似过去了，痕迹却一直还在。",
        choices: [
          {
            id: "offer-incense",
            text: "替故人上香",
            description: "在残屋前点一炷清香，替旧人旧事收一收魂。",
            consumeDay: true,
            resultText: "你在残垣前燃起线香，默默行了一礼。老妪见你神情肃然，叹道：\"这世上若多几分记挂旧情的人，江湖也不至如此凉薄。\"",
            consequences: [
              { kind: "karma", delta: 2 },
              { kind: "reputation", delta: 2 },
              { kind: "flag", name: "shendiao.niujia.mourned", value: true },
            ],
            transition: { type: "end" },
          },
          {
            id: "search-rubble",
            text: "翻检残垣",
            description: "看看火场废墟里是否还藏着什么旧物。",
            consumeDay: true,
            resultText: "你翻开焦木烂瓦，在灰烬里摸出一枚烧黑的铜锁和几页残纸，像是谁匆忙间来不及带走的旧物。纸上的字大半模糊，却仍能辨出\"忠义\"二字。",
            consequences: [
              { kind: "aptitude", delta: 1 },
              { kind: "item", id: "field-ration", count: 1 },
              { kind: "flag", name: "shendiao.niujia.relic", value: true },
            ],
            transition: { type: "end" },
          },
        ],
      },
    },
  },

  // ===== 10. 牛家村·穆念慈独守 =====
  {
    id: "shendiao-munianci",
    entryNode: "main",
    locationId: "niujia",
    weight: 3,
    once: true,
    condition: { kind: "arcBeat", arcId: "shendiao", beat: "yangkang" },
    nodes: {
      main: {
        id: "main",
        title: "牛家村·穆念慈独守",
        text: "铁枪庙风波后，你在村口看见一名素衣女子独自扫去庙前碎瓦。她神色憔悴，却将杨铁心遗下的铁枪擦得一尘不染。听见脚步声，她回过头来，正是穆念慈。她眼中含着泪意，却强自镇定：\"江湖人都散了，庙还在，总得有人守着。\"",
        choices: [
          {
            id: "comfort",
            text: "上前宽慰",
            description: "陪她说几句心里话，让她不至一个人扛下所有。",
            consumeDay: true,
            resultText: "你陪穆念慈在庙前坐了许久。她说起杨铁心，说起杨康，说起那些本不该走到这一步的旧缘。说到最后，她只轻声道：\"有些人走错了路，可活着的人总还得继续走。\"",
            consequences: [
              { kind: "karma", delta: 3 },
              { kind: "reputation", delta: 2 },
              { kind: "flag", name: "shendiao.munianci.comforted", value: true },
            ],
            transition: { type: "end" },
          },
          {
            id: "leave-silver",
            text: "留下盘缠",
            description: "不多言，只留些银两给她修整庙宇。",
            consumeDay: true,
            resultText: "你默默留下碎银转身便走。身后传来穆念慈压得极低的一句\"多谢\"，声音轻得像要散进风里。",
            consequences: [
              { kind: "gold", delta: -40 },
              { kind: "karma", delta: 2 },
              { kind: "reputation", delta: 3 },
            ],
            transition: { type: "end" },
          },
        ],
      },
    },
  },

  // ===== 11. 大漠·白雕传讯 =====
  {
    id: "shendiao-damos-eagle",
    entryNode: "main",
    locationId: "damos",
    weight: 3,
    once: true,
    condition: { kind: "arcBeat", arcId: "shendiao", beat: "damos" },
    nodes: {
      main: {
        id: "main",
        title: "大漠·白雕传讯",
        text: "你在草原上歇马时，头顶忽有白影掠过。那只郭靖曾射下又亲手放飞的白雕竟落在你身旁，爪上还系着一截细细的皮绳。雕目炯炯，似在认你。它低低鸣了两声，像是奉命而来。",
        choices: [
          {
            id: "untie-letter",
            text: "解下皮绳",
            description: "看看白雕到底替谁送来什么消息。",
            consumeDay: true,
            resultText: "你从皮绳里取出一张皱巴巴的小纸片，上面是郭靖歪歪扭扭的字：\"兄弟，若来大漠，记得喝热马奶。\"短短一句，朴拙得叫人想笑，却也叫人心头一暖。",
            consequences: [
              { kind: "relation", npcId: "guojing", delta: 6 },
              { kind: "hp", delta: 20 },
              { kind: "flag", name: "shendiao.damos.letter", value: true },
            ],
            transition: { type: "end" },
          },
          {
            id: "feed-eagle",
            text: "喂它些肉干",
            description: "不拆绳结，先喂饱这位远道来的使者。",
            consumeDay: true,
            resultText: "你掰开肉干喂给白雕。它吃完后振翅绕你一圈，这才落下，让你取走爪上皮绳。上头系着的是一枚草原护符，粗糙，却显然出自郭靖之手。",
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

  // ===== 12. 大漠·可汗夜宴 =====
  {
    id: "shendiao-damos-feast",
    entryNode: "main",
    locationId: "damos",
    weight: 3,
    once: true,
    condition: { kind: "relation", npcId: "guojing", gte: 10 },
    nodes: {
      main: {
        id: "main",
        title: "大漠·可汗夜宴",
        text: "你被郭靖带进蒙古营帐，篝火映红整片草场。帐中有人高声劝酒，有人比试摔跤，少年豪气在酒香和马奶香里蒸腾。郭靖把你按在火堆旁坐下，笑得难得舒展：\"来得正好，今晚可汗设宴，咱们不醉不归。\"",
        choices: [
          {
            id: "drink",
            text: "举碗痛饮",
            description: "陪草原汉子狠狠干上几碗，看看自己酒量到底如何。",
            consumeDay: true,
            resultText: "你与郭靖碰碗大笑，马奶酒一碗接一碗地下肚。席间有人唱起长调，郭靖也跟着哼了两句，跑调得厉害，却让整座营帐笑成一团。",
            consequences: [
              { kind: "relation", npcId: "guojing", delta: 5 },
              { kind: "reputation", delta: 2 },
              { kind: "hp", delta: 25 },
            ],
            transition: { type: "end" },
          },
          {
            id: "watch-wrestle",
            text: "观摔跤比武",
            description: "不急着喝酒，先看看草原健儿的筋骨与力道。",
            consumeDay: true,
            resultText: "你在一旁看摔跤手抱摔缠斗，粗犷之中自有章法。郭靖见你看得认真，悄悄告诉你几处发力诀窍，竟和中原拳路暗暗相通。",
            consequences: [
              { kind: "attack", delta: 2 },
              { kind: "aptitude", delta: 1 },
            ],
            transition: { type: "end" },
          },
        ],
      },
    },
  },

  // ===== 13. 大漠·七怪试手 =====
  {
    id: "shendiao-seven-freaks",
    entryNode: "main",
    locationId: "damos",
    weight: 3,
    once: true,
    condition: { kind: "relation", npcId: "guojing", gte: 18 },
    nodes: {
      main: {
        id: "main",
        title: "大漠·七怪试手",
        text: "柯镇恶等人听郭靖提起你，忽然起了兴致，非要轮流和你过几招看看成色。韩小莹轻笑，朱聪掂着铁算盘，柯镇恶则拄杖立在风里，冷冷道：\"能得靖儿推崇，想来不差。来，让老夫等人瞧瞧。\"",
        choices: [
          {
            id: "accept",
            text: "依次接招",
            description: "索性将这一场试手当作难得的磨炼。",
            consumeDay: true,
            resultText: "七怪各出半招，或快或巧，或狠或奇。你虽应对得手忙脚乱，却也从他们不同路数里看出许多江湖门道。柯镇恶收杖后哼了一声：\"骨头还算硬。\"",
            consequences: [
              { kind: "reputation", delta: 3 },
              { kind: "attack", delta: 1 },
              { kind: "speed", delta: 1 },
            ],
            transition: { type: "end" },
          },
          {
            id: "ask-teachings",
            text: "请教心得",
            description: "既然动了手，不如趁机把招法问透。",
            consumeDay: true,
            resultText: "你并未逞强，只在接招后虚心请教。七怪虽口气各异，讲起经验却都不藏私。韩小莹还笑着替你纠正了一个起手破绽。",
            consequences: [
              { kind: "aptitude", delta: 2 },
              { kind: "relation", npcId: "guojing", delta: 4 },
            ],
            transition: { type: "end" },
          },
        ],
      },
    },
  },

  // ===== 14. 临安·丐帮小宴 =====
  {
    id: "shendiao-beggar-feast",
    entryNode: "main",
    locationId: "linan",
    weight: 3,
    once: true,
    condition: { kind: "arcBeat", arcId: "shendiao", beat: "meet-rong" },
    nodes: {
      main: {
        id: "main",
        title: "临安·丐帮小宴",
        text: "你在临安桥洞下闻到一股熟悉香气，掀帘一看，几个叫花子正围着陶锅笑闹，黄蓉坐在当中指挥火候。见你来了，她眼珠一转：\"来得正好，今天这锅鱼羹缺个会夸人的。\"不远处，洪七公装作不经意地咳了两声，显然也是冲着这口吃的。",
        choices: [
          {
            id: "praise-cooking",
            text: "夸她厨艺",
            description: "先哄大小姐开心，再说别的。",
            consumeDay: true,
            resultText: "你夸得黄蓉眉开眼笑，连洪七公都忍不住替她添了两句好话。黄蓉嘴上说你油嘴滑舌，却多给你盛了一大碗鱼羹。",
            consequences: [
              { kind: "relation", npcId: "huangrong", delta: 6 },
              { kind: "relation", npcId: "hongqigong", delta: 3 },
              { kind: "hp", delta: 20 },
            ],
            transition: { type: "end" },
          },
          {
            id: "listen-news",
            text: "听丐帮消息",
            description: "借着这顿饭，听听临安近来的风吹草动。",
            consumeDay: true,
            resultText: "你坐在锅边听丐帮弟子七嘴八舌，临安城里的豪门旧闻、王府新动静、江湖怪客南来的消息，被他们说得清清楚楚。洪七公瞥你一眼，似乎对你这份耐心颇为满意。",
            consequences: [
              { kind: "aptitude", delta: 1 },
              { kind: "reputation", delta: 2 },
              { kind: "flag", name: "shendiao.linan.beggar-news", value: true },
            ],
            transition: { type: "end" },
          },
        ],
      },
    },
  },

  // ===== 15. 临安·武穆遗迹 =====
  {
    id: "shendiao-yuefei-wall",
    entryNode: "main",
    locationId: "linan",
    weight: 3,
    once: true,
    condition: { kind: "arcBeat", arcId: "shendiao", beat: "wangfu" },
    nodes: {
      main: {
        id: "main",
        title: "临安·武穆遗迹",
        text: "你顺着旧线索来到临安城外一处废祠，墙上斑驳碑文依稀还能看见\"尽忠报国\"四字。香火早断，只有风从破窗灌进来，把地上的灰尘吹得细细打旋。你忽然想起赵王府那一夜，那些争夺兵书、借刀杀人的人，未必有谁真正懂得这四字有多重。",
        choices: [
          {
            id: "copy-inscription",
            text: "誊抄残碑",
            description: "把尚能辨认的文字抄下，留作自勉。",
            consumeDay: true,
            resultText: "你对着残碑一字一字誊抄，虽有不少字句已残破难辨，但那份凛然之意却像刻进了心里。走出废祠时，你竟觉得自己的脚步也稳了几分。",
            consequences: [
              { kind: "reputation", delta: 3 },
              { kind: "karma", delta: 2 },
              { kind: "flag", name: "shendiao.yuefei.copied", value: true },
            ],
            transition: { type: "end" },
          },
          {
            id: "meditate",
            text: "在祠中静坐",
            description: "不抄不看，只静静坐一会儿，让心安下来。",
            consumeDay: true,
            resultText: "你在破祠中坐了半日，听窗外风声和远远传来的人语。世道未必清明，江湖未必有公道，但人若连自己为何拔剑都忘了，才真是可悲。",
            consequences: [
              { kind: "mp", delta: 20 },
              { kind: "aptitude", delta: 1 },
            ],
            transition: { type: "end" },
          },
        ],
      },
    },
  },

  // ===== 16. 临安·湖心夜话 =====
  {
    id: "shendiao-linan-nighttalk",
    entryNode: "main",
    locationId: "linan",
    weight: 3,
    once: true,
    condition: { kind: "relation", npcId: "huangrong", gte: 12 },
    nodes: {
      main: {
        id: "main",
        title: "临安·湖心夜话",
        text: "黄蓉夜里约你泛舟西湖。月色把湖面铺成一层薄银，她撑着小船，忽然也不说笑了，只看着远处灯火。\"靖哥哥总说，侠义就是该做的便去做。可江湖哪有那么简单？\"她轻轻晃了晃船桨，水纹一圈圈散开，像心事也跟着浮出湖面。",
        choices: [
          {
            id: "speak-frankly",
            text: "坦白作答",
            description: "把你心里真正的想法告诉她。",
            consumeDay: true,
            resultText: "你与黄蓉在湖上说到很晚，说侠义，说命运，也说各自见过的凉薄与温情。她听完后轻轻一笑：\"原来你也不是只会逞强。\"那笑意淡淡，却比月色还柔和。",
            consequences: [
              { kind: "relation", npcId: "huangrong", delta: 8 },
              { kind: "npcRelationType", npcId: "huangrong", relationType: "朋友" },
            ],
            transition: { type: "end" },
          },
          {
            id: "joke-away",
            text: "插科打诨",
            description: "不愿把气氛弄沉，就顺着她的机锋开个玩笑。",
            consumeDay: true,
            resultText: "你故意把话题岔开，逗得黄蓉又气又笑，拿船桨敲了你一下。她嘴上嫌你没正形，眼神里的郁结却淡了不少。",
            consequences: [
              { kind: "relation", npcId: "huangrong", delta: 5 },
              { kind: "reputation", delta: 1 },
            ],
            transition: { type: "end" },
          },
        ],
      },
    },
  },

  // ===== 17. 桃花岛·海潮听箫 =====
  {
    id: "shendiao-taohua-flute",
    entryNode: "main",
    locationId: "taohuadao",
    weight: 3,
    once: true,
    condition: { kind: "arcBeat", arcId: "shendiao", beat: "taohua" },
    nodes: {
      main: {
        id: "main",
        title: "桃花岛·海潮听箫",
        text: "夜里海潮拍岸，你循着箫声走到礁石边。黄药师背海而立，一支玉箫在月下泛着冷光，箫声时而清绝，时而凄迷。你不敢出声，只觉那乐音里藏着桃花岛主一生的孤高、悔恨与不甘。曲终之后，他也不回头，只淡淡问：\"可听懂了几分？\"",
        choices: [
          {
            id: "answer-heart",
            text: "说出感受",
            description: "把你从箫声中听见的孤意说给他听。",
            consumeDay: true,
            resultText: "你斟酌着说出曲中所藏的郁结。黄药师沉默良久，忽然轻叹一声：\"你倒不是木头。\"他随手折下一截桃枝抛给你：\"留着吧。江湖上若还能有人听懂老夫的箫，也不算太坏。\"",
            consequences: [
              { kind: "relation", npcId: "huangyaoshi-npc", delta: 6 },
              { kind: "aptitude", delta: 2 },
            ],
            transition: { type: "end" },
          },
          {
            id: "remain-silent",
            text: "抱拳不语",
            description: "有些心事，听懂便够了，不必多言。",
            consumeDay: true,
            resultText: "你没有多说，只向黄药师抱拳一礼。海风吹过，他的衣袂与箫声余韵一并飘远。片刻后，他淡淡地嗯了一声，算是默许你留在旁边再听一曲。",
            consequences: [
              { kind: "mp", delta: 20 },
              { kind: "relation", npcId: "huangyaoshi-npc", delta: 3 },
            ],
            transition: { type: "end" },
          },
        ],
      },
    },
  },

  // ===== 18. 桃花岛·试步桃林 =====
  {
    id: "shendiao-taohua-maze",
    entryNode: "main",
    locationId: "taohuadao",
    weight: 3,
    once: true,
    condition: { kind: "relation", npcId: "huangrong", gte: 15 },
    nodes: {
      main: {
        id: "main",
        title: "桃花岛·试步桃林",
        text: "黄蓉非要带你再走一次桃花阵，说是\"免得你下回来岛上又像无头苍蝇一样乱撞\"。她嘴里嫌你笨，脚下却有意放慢半拍，让你看清每一次拐步与换位。桃林花影纷乱，近在眼前的景致却时时错开半尺，令人心惊。",
        choices: [
          {
            id: "follow-carefully",
            text: "照她步法走",
            description: "老老实实跟着黄蓉的节奏，不逞强。",
            consumeDay: true,
            resultText: "你踩着黄蓉的步子一一跟进，虽偶有踉跄，总算没走丢。走到阵眼时她回头冲你得意一笑：\"这回总记住了吧？\"你忽然觉得，连桃林里的风都带着几分狡黠。",
            consequences: [
              { kind: "relation", npcId: "huangrong", delta: 5 },
              { kind: "speed", delta: 2 },
            ],
            transition: { type: "end" },
          },
          {
            id: "derive-yourself",
            text: "自己推演",
            description: "一边跟着她走，一边强记阵势变化。",
            consumeDay: true,
            resultText: "你强行把每一步都记在心里，走完整个阵法后已满头是汗。黄蓉见你竟真记下了大半，惊讶之余哼了一声：\"还不算太笨。\"",
            consequences: [
              { kind: "aptitude", delta: 2 },
              { kind: "relation", npcId: "huangrong", delta: 3 },
            ],
            transition: { type: "end" },
          },
        ],
      },
    },
  },

  // ===== 19. 华山·雪夜论剑 =====
  {
    id: "shendiao-huashan-snow",
    entryNode: "main",
    locationId: "huashan",
    weight: 3,
    once: true,
    condition: { kind: "arcBeat", arcId: "shendiao", beat: "huashan" },
    nodes: {
      main: {
        id: "main",
        title: "华山·雪夜论剑",
        text: "论剑散场数日后，你仍留在华山。夜半飞雪，有几名散修剑客围着火堆争辩剑理，见你经过便硬把你拉去评理。有人说剑在快，有人说剑在意，还有人说江湖上所谓名剑，不过是给输家找借口。山风极烈，火星在雪里明灭不定，辩得人心也跟着燥了起来。",
        choices: [
          {
            id: "speak-technique",
            text: "从招法说起",
            description: "讲讲你在华山论剑中真正看见的门道。",
            consumeDay: true,
            resultText: "你把所见高手出招的轻重快慢逐一拆开，说得几名剑客频频点头。辩到最后，他们忽然发现自己争的并不是谁对谁错，而是各人心里的剑本就不同。",
            consequences: [
              { kind: "aptitude", delta: 2 },
              { kind: "reputation", delta: 2 },
            ],
            transition: { type: "end" },
          },
          {
            id: "draw-sword",
            text: "拔剑示意",
            description: "不如少说几句，直接演给他们看。",
            consumeDay: true,
            resultText: "你踏雪拔剑，借着火光与月色演了数式。雪花纷落，剑锋起落之间自有你一路行来所得。几名剑客一时无言，半晌后才有人低低赞了一句好剑意。",
            consequences: [
              { kind: "attack", delta: 2 },
              { kind: "speed", delta: 1 },
            ],
            transition: { type: "end" },
          },
        ],
      },
    },
  },

  // ===== 20. 华山·石壁遗刻 =====
  {
    id: "shendiao-huashan-stone",
    entryNode: "main",
    locationId: "huashan",
    weight: 3,
    once: true,
    condition: { kind: "arcBeat", arcId: "shendiao", beat: "huashan" },
    nodes: {
      main: {
        id: "main",
        title: "华山·石壁遗刻",
        text: "你在思过崖侧面的石壁上发现一片浅浅旧刻，像是昔年高手以指力留下的几行心法。字迹已经风化过半，只剩只言片语：\"大道至简\"、\"先守后发\"、\"心静则明\"。山崖绝壁之间，连这些残缺字痕都透着一股过尽千帆后的平淡。",
        choices: [
          {
            id: "trace-words",
            text: "沿字痕推演",
            description: "试着顺着石刻里残存的劲路去想象出手之法。",
            consumeDay: true,
            resultText: "你沿着石痕一遍遍摩挲推演，越想越觉得许多花巧其实都能归于最朴素的一招。离开时你并未学到某门绝技，却像拨开了一层迷雾。",
            consequences: [
              { kind: "aptitude", delta: 2 },
              { kind: "mp", delta: 20 },
            ],
            transition: { type: "end" },
          },
          {
            id: "bow-and-leave",
            text: "拱手致意",
            description: "对着石壁旧刻行一礼，当作向前人请安。",
            consumeDay: true,
            resultText: "你向着石壁旧刻拱手一礼，忽然生出一种说不清的敬意。那些名字已经被岁月磨没，可他们留给江湖的痕迹，却仍有人会看见。",
            consequences: [
              { kind: "karma", delta: 2 },
              { kind: "reputation", delta: 2 },
            ],
            transition: { type: "end" },
          },
        ],
      },
    },
  },
]
