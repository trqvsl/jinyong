import type { StoryEvent } from "../events"
import { SHENDIAO_ACT3_STORY } from "./shendiaoAct3"
import { SHENDIAO_ACT4_STORY } from "./shendiaoAct4"
import { SHENDIAO_ACT5_STORY } from "./shendiaoAct5"
import { SHENDIAO_ACT6_STORY } from "./shendiaoAct6"

// ============================================================
// 射雕英雄传 · 剧情卷（声明式）
// 当前数据正从8节点样板迁移到八幕结构，原创主角作为外部变量介入原著因果。
// 幕级进度使用 act* beat；旧 beat 保留给现有样板与存档兼容。
// 详细时序见《射雕英雄传二创剧本大纲.md》。
// ============================================================

export const SHENDIAO_STORY: StoryEvent[] = [
  // ===== 1. 牛家村·风雪惊变（连续第一幕 opening） =====
  {
    id: "shendiao-niujia-opening",
    entryNode: "riverbank",
    locationId: "niujia",
    weight: 8,
    once: true,
    condition: {
      kind: "and",
      items: [
        { kind: "not", item: { kind: "arcBeat", arcId: "shendiao", beat: "niujia" } },
        {
          kind: "not",
          item: {
            kind: "or",
            items: [
              { kind: "flag", name: "shendiao.niujia.heard_tavern", eq: true },
              { kind: "flag", name: "shendiao.niujia.met_baoxiruo", eq: true },
              { kind: "flag", name: "shendiao.niujia.opposed_rescue", eq: true },
              { kind: "flag", name: "shendiao.niujia.helped_wanyan", eq: true },
              { kind: "flag", name: "shendiao.niujia.observed_wanyan", eq: true },
              { kind: "flag", name: "shendiao.niujia.accepted_wanyan", eq: true },
              { kind: "flag", name: "shendiao.niujia.fake_accept_wanyan", eq: true },
              { kind: "flag", name: "shendiao.niujia.rejected_wanyan", eq: true },
            ],
          },
        },
      ],
    },
    nodes: {
      riverbank: {
        id: "riverbank",
        title: "松下开场",
        text: "两株老松之间铺着一方旧草席。张十五盘腿坐下，把一块梨花木板横在膝上，右手握着短木槌。围听的船夫、樵夫和村民刚站稳，木槌便在板上敲出两声脆响。张十五：\"列位，今日不说神仙鬼怪，先说一段北地旧事。那一年金兵渡河，汴京城门一破，徽钦二帝连同宗室百官都被押往北地。史书上只写靖康二字，落在百姓头上，却是千万户人家再也等不到归人。\"",
        stage: {
          sceneId: "niujia-riverbank",
          sceneLabel: "牛家村 · 钱塘江边",
          actors: [
            { name: "张十五", slot: "far-left", motion: "enter-left" },
            { name: "郭啸天", slot: "left", motion: "step-forward" },
            { name: "杨铁心", slot: "right", motion: "enter-right" },
          ],
        },
        autoNext: { type: "goto", nodeId: "riverbank-jingkang" },
      },
      "riverbank-jingkang": {
        id: "riverbank-jingkang",
        title: "靖康旧恨",
        text: "张十五把木槌在掌中一转，又敲了一记。张十五：\"有人背着老母往南逃，有人抱着孩子死守渡口。过了黄河，官军叫他们等；过了长江，官府还叫他们等。可这一等，北地的田契成了废纸，祖坟也不知落进谁家马场。\"人群外侧站着两名结义兄弟。浓眉阔肩、背负双戟的是郭啸天；白净精悍、枪囊从不离身的是杨家枪传人杨铁心。郭啸天听到这里，把原本抱在胸前的手放了下来。",
        stage: {
          sceneId: "niujia-riverbank",
          sceneLabel: "牛家村 · 钱塘江边",
          actors: [
            { name: "张十五", slot: "far-left", motion: "step-forward", focus: true },
            { name: "郭啸天", slot: "left" },
            { name: "杨铁心", slot: "right" },
          ],
        },
        autoNext: { type: "goto", nodeId: "riverbank-wumu" },
      },
      "riverbank-wumu": {
        id: "riverbank-wumu",
        title: "岳武穆北伐",
        text: "江风把草席一角掀起，张十五用木板压住，接着往下说。张十五：\"后来岳元帅在郾城破拐子马，朱仙镇前军心正盛。北地百姓已经备好香案，只等王师渡河。谁知临安一日十二道金牌，硬把人从前线召了回来。十年功废，三军气短，风波亭里再没有一支军队能替他说话。\"杨铁心按住枪囊。杨铁心：\"若当年朝廷肯让岳家军再走百里，何至于让百姓把北伐只当说书听。\"",
        stage: {
          sceneId: "niujia-riverbank",
          sceneLabel: "牛家村 · 钱塘江边",
          actors: [
            { name: "张十五", slot: "far-left", focus: true },
            { name: "郭啸天", slot: "left" },
            { name: "杨铁心", slot: "right", motion: "step-forward" },
          ],
        },
        autoNext: { type: "goto", nodeId: "riverbank-qusan" },
      },
      "riverbank-qusan": {
        id: "riverbank-qusan",
        title: "村头酒来",
        text: "村路那头传来拐杖点地声。跛脚掌柜曲三一手提酒壶，一手夹着几只粗瓷碗，从人群后面挪到松树下。他右腿落地不便，两根木拐却一前一后，酒壶里的水没有洒出半滴。曲三：\"张先生说了半日，先润润嗓子。酒算郭杨两位的账。\"郭啸天笑着接过酒碗。郭啸天：\"曲掌柜肯送酒，郭某自然认账。张先生若不嫌村酒薄，散场后再到店里喝一碗。\"",
        stage: {
          sceneId: "niujia-riverbank",
          sceneLabel: "牛家村 · 钱塘江边",
          actors: [
            { name: "张十五", slot: "far-left" },
            { name: "郭啸天", slot: "left", motion: "step-forward" },
            { name: "杨铁心", slot: "right" },
            { name: "曲三", slot: "far-right", motion: "enter-right", focus: true },
          ],
        },
        autoNext: { type: "goto", nodeId: "riverbank-departure" },
      },
      "riverbank-departure": {
        id: "riverbank-departure",
        title: "江边散场",
        text: "最后一段说完，张十五用木槌在梨花木板上敲出收场三响。他把木槌塞回布囊，又用麻绳把木板系到背后。围听的村民这才把铜钱放进草席边的小碗，沿江岸各自散去。张十五：\"郭英雄相请，老汉便再叨扰一碗。只是入夜前还得赶回钱塘城。\"杨铁心替他提起布囊，郭啸天已经沿村路往曲三酒店走去。",
        stage: {
          sceneId: "niujia-riverbank",
          sceneLabel: "牛家村 · 钱塘江边",
          actors: [
            { name: "张十五", slot: "left" },
            { name: "郭啸天", slot: "center", motion: "cross-right" },
            { name: "杨铁心", slot: "right", motion: "cross-right" },
            { name: "曲三", slot: "far-right" },
          ],
        },
        choices: [
          {
            id: "go-tavern",
            kind: "travel",
            text: "前往曲三酒店",
            description: "跟着郭啸天、杨铁心和张十五进店。",
            transition: { type: "goto", nodeId: "qusan-tavern" },
          },
        ],
      },
      "qusan-tavern": {
        id: "qusan-tavern",
        title: "曲三酒店",
        text: "郭啸天把双戟靠在桌边，先替说书人张十五斟满一碗。郭啸天：\"郭某祖上也是北地人。靖康以后多少百姓有家难回，这碗酒敬张先生肯把旧事说给后人听。\"",
        sceneTransition: {
          title: "曲三酒店",
          subtitle: "离江边不过百余步",
          timeLabel: "申时末",
          tone: "dusk",
        },
        stage: {
          sceneId: "qusan-tavern",
          sceneLabel: "牛家村 · 曲三酒店",
          actors: [
            { name: "郭啸天", slot: "far-left" },
            { name: "杨铁心", slot: "left" },
            { name: "曲三", slot: "right" },
            { name: "傻姑", slot: "far-right", scale: "small" },
          ],
        },
        autoNext: { type: "goto", nodeId: "tavern-yangtiexin" },
      },
      "tavern-yangtiexin": {
        id: "tavern-yangtiexin",
        title: "同饮旧事",
        text: "杨铁心把枪囊放到脚边，也向张十五举起酒碗。杨铁心：\"我与郭大哥在牛家村结义安家。朝廷若真肯北望，也不会只剩说书人口中的岳武穆。\"",
        stage: {
          sceneId: "qusan-tavern",
          sceneLabel: "牛家村 · 曲三酒店",
          actors: [
            { name: "郭啸天", slot: "far-left" },
            { name: "杨铁心", slot: "left", motion: "step-forward" },
            { name: "曲三", slot: "right" },
            { name: "傻姑", slot: "far-right", scale: "small" },
          ],
        },
        autoNext: { type: "goto", nodeId: "tavern-qusan" },
      },
      "tavern-qusan": {
        id: "tavern-qusan",
        title: "酒炉旧话",
        text: "曲三正给火上的酒壶添水，听到岳武穆三个字，手忽然停住。曲三：\"害死岳飞的，不只秦桧一个。\"郭啸天放下酒碗。郭啸天：\"曲掌柜还知道些什么？\"曲三把酒壶推回炭火上。曲三：\"临安城里知道的人不少，肯说的没几个。我一个卖酒的，只管酒冷不冷。\"",
        stage: {
          sceneId: "qusan-tavern",
          sceneLabel: "牛家村 · 曲三酒店",
          actors: [
            { name: "郭啸天", slot: "far-left" },
            { name: "杨铁心", slot: "left" },
            { name: "曲三", slot: "right", motion: "step-forward", focus: true },
            { name: "傻姑", slot: "far-right", scale: "small" },
          ],
        },
        autoNext: { type: "goto", nodeId: "tavern-shagu-chase" },
      },
      "tavern-shagu-chase": {
        id: "tavern-shagu-chase",
        title: "满店鸡飞",
        text: "后院木门被撞开。泥脸小姑娘傻姑把公鸡当老虎，举着烧火棍追得它满店乱跑。曲三弯腰护住酒坛，起身时右拐只在地上一点，整个人已经越过半张桌子。杨铁心的手停在枪囊上。杨铁心：\"曲掌柜，好利落的身手。\"曲三把酒坛放稳。曲三：\"酒坛碎了要赔。我这条腿，不过挪得快些。\"",
        stage: {
          sceneId: "qusan-tavern",
          sceneLabel: "牛家村 · 曲三酒店",
          actors: [
            { name: "郭啸天", slot: "far-left" },
            { name: "杨铁心", slot: "left" },
            { name: "曲三", slot: "right", motion: "cross-left", focus: true },
            { name: "傻姑", slot: "far-right", motion: "cross-left", scale: "small" },
          ],
          props: [
            { id: "rooster", slot: "far-right", motion: "run-left", label: "被傻姑追赶的公鸡" },
          ],
        },
        autoNext: { type: "goto", nodeId: "tavern-last-bowl" },
      },
      "tavern-last-bowl": {
        id: "tavern-last-bowl",
        title: "日影西斜",
        text: "门外江面已经染上晚霞，店里的影子从桌脚一直拖到墙边。张十五把最后半碗酒慢慢喝完，摸出两枚铜钱压在桌上。张十五：\"天黑前还要过渡口。今日这碗酒，老汉记下了。改日再说到岳家军，给两位英雄留个靠前的位置。\"郭啸天把铜钱推回去。郭啸天：\"说书钱归说书钱，酒钱归酒钱。张先生收着。\"",
        stage: {
          sceneId: "qusan-tavern",
          sceneLabel: "牛家村 · 曲三酒店",
          actors: [
            { name: "张十五", slot: "far-left", motion: "step-forward", focus: true },
            { name: "郭啸天", slot: "left" },
            { name: "杨铁心", slot: "right" },
            { name: "曲三", slot: "far-right" },
          ],
        },
        autoNext: { type: "goto", nodeId: "tavern-guoyang-depart" },
      },
      "tavern-guoyang-depart": {
        id: "tavern-guoyang-depart",
        title: "各自归家",
        text: "张十五背好梨花木板，沿江路往渡口去了。郭啸天把双戟重新负到背后，起身时朝杨铁心家的方向看了一眼。郭啸天：\"弟妹今日说要补屋顶。天还没黑，我去搭把手。\"杨铁心提起枪囊。杨铁心：\"大哥先走，我把这坛酒送回后院便来。\"两人向曲三抱拳，先后出了店门。",
        stage: {
          sceneId: "qusan-tavern",
          sceneLabel: "牛家村 · 曲三酒店",
          actors: [
            { name: "郭啸天", slot: "left", motion: "cross-right" },
            { name: "杨铁心", slot: "right", motion: "cross-right" },
            { name: "曲三", slot: "far-right" },
          ],
        },
        autoNext: { type: "goto", nodeId: "tavern-closing" },
      },
      "tavern-closing": {
        id: "tavern-closing",
        title: "收店",
        text: "曲三把空碗一只只摞回木盘，又让傻姑把公鸡抱进后院。曲三：\"天黑后不再卖酒。靠窗那张桌子可以歇脚，灯油只够到二更。\"傻姑抱着公鸡从后门探出半张泥脸。傻姑：\"大老虎不咬人。\"曲三用拐杖轻轻碰了碰门槛。曲三：\"不咬人也得关好。去。\"",
        sceneTransition: {
          title: "暮色入村",
          subtitle: "酒旗落下，渡口收船",
          timeLabel: "酉时 · 日暮",
          tone: "dusk",
        },
        stage: {
          sceneId: "qusan-tavern",
          sceneLabel: "牛家村 · 曲三酒店",
          actors: [
            { name: "曲三", slot: "right", motion: "step-forward", focus: true },
            { name: "傻姑", slot: "far-right", motion: "cross-right", scale: "small" },
          ],
        },
        autoNext: { type: "goto", nodeId: "tavern-first-watch" },
      },
      "tavern-first-watch": {
        id: "tavern-first-watch",
        title: "初更灯火",
        text: "店门合上后，江风只从窗缝里钻进来。曲三在柜后核完酒账，提着灯进了后院。屋里剩下靠窗一盏小油灯，灯芯偶尔爆出细响。村道上先是有人收晾衣杆，随后是犬吠，最后连脚步声也听不见了。",
        sceneTransition: {
          title: "初更",
          subtitle: "村道渐静",
          timeLabel: "戌时",
          tone: "night",
        },
        stage: {
          sceneId: "qusan-tavern",
          sceneLabel: "牛家村 · 曲三酒店",
          actors: [],
        },
        autoNext: { type: "goto", nodeId: "tavern-second-watch" },
      },
      "tavern-second-watch": {
        id: "tavern-second-watch",
        title: "灯油将尽",
        text: "二更梆子从村东传来时，窗边油灯已经矮了一半。后院没有鸡叫，曲三的房门也没有再开。江潮退去，水声离岸更远，反倒让村西松林的风声显得清楚。柜台下压着一截没收走的麻绳，门边却少了曲三平日倚着的一根短拐。",
        sceneTransition: {
          title: "二更",
          subtitle: "潮退，灯残",
          timeLabel: "亥时",
          tone: "night",
        },
        stage: {
          sceneId: "qusan-tavern",
          sceneLabel: "牛家村 · 曲三酒店",
          actors: [],
        },
        autoNext: { type: "goto", nodeId: "tavern-nightfall" },
      },
      "tavern-nightfall": {
        id: "tavern-nightfall",
        title: "林中兵刃",
        text: "三更梆子刚落，村西林中传来一声金铁相撞。第一声很短，像刀刃被硬物架住；片刻后又是一声，紧接着有枯枝折断。后院仍没有人出来，柜边那根短拐也一直没有回来。",
        sceneTransition: {
          title: "三更",
          subtitle: "村西林传来兵刃声",
          timeLabel: "子时",
          tone: "night",
        },
        stage: {
          sceneId: "qusan-tavern",
          sceneLabel: "牛家村 · 曲三酒店",
          actors: [],
        },
        choices: [
          {
            id: "go-west-grove",
            kind: "travel",
            text: "循声前往村西林",
            description: "林中有兵刃声，曲三刚才也不见了。",
            transition: { type: "goto", nodeId: "qusan-night" },
          },
        ],
      },
      "qusan-night": {
        id: "qusan-night",
        title: "林中三尸",
        text: "松林里倒着三名黑衣人。两人伏在草间，一人背靠树根，胸口都已经没有起伏。三柄短刀落在湿土上，刀镡刻着宫门内卫的纹样。曲三半跪在一只破开的包裹旁，右肩衣料被割开，散落的书画卷轴和金玉器物铺了半圈。",
        sceneTransition: {
          title: "村西林",
          subtitle: "循兵刃声穿过松林",
          timeLabel: "三更后",
          tone: "night",
        },
        stage: {
          sceneId: "niujia-west-grove",
          sceneLabel: "牛家村 · 村西林",
          actors: [
            { name: "曲三", slot: "center", motion: "injured", focus: true },
          ],
        },
        autoNext: { type: "goto", nodeId: "qusan-night-guoyang" },
      },
      "qusan-night-guoyang": {
        id: "qusan-night-guoyang",
        title: "郭杨赶到",
        text: "林后响起急促脚步。郭啸天提着双戟先穿过树隙，杨铁心紧随其后，枪尖仍套着布囊。郭啸天看了一眼地上的短刀。郭啸天：\"这些是宫里的人？\"杨铁心停在散落的卷轴前。杨铁心：\"曲掌柜，你从临安带回来的究竟是什么？\"",
        stage: {
          sceneId: "niujia-west-grove",
          sceneLabel: "牛家村 · 村西林",
          actors: [
            { name: "郭啸天", slot: "left", motion: "enter-left" },
            { name: "曲三", slot: "center", motion: "injured", focus: true },
            { name: "杨铁心", slot: "right", motion: "enter-right" },
          ],
        },
        autoNext: { type: "goto", nodeId: "qusan-night-account" },
      },
      "qusan-night-account": {
        id: "qusan-night-account",
        title: "曲三认账",
        text: "曲三用短拐拨开脚边一柄刀，刀下露出半块宫库封签。曲三：\"人是从临安跟来的，东西也是从宫里取的。字画金玉原本锁在库房，放着给那些人发霉，不如带出来。\"郭啸天：\"为了这些东西，值得连杀三人？\"曲三：\"他们先追到牛家村。今夜若不倒在这里，明日进店搜的就不只是酒坛。\"杨铁心望向村路。杨铁心：\"天亮前必须把尸首和痕迹处理掉。后面还有没有追兵，等埋完再问。\"",
        stage: {
          sceneId: "niujia-west-grove",
          sceneLabel: "牛家村 · 村西林",
          actors: [
            { name: "郭啸天", slot: "left" },
            { name: "曲三", slot: "center", motion: "step-forward", focus: true },
            { name: "杨铁心", slot: "right", motion: "guard" },
          ],
        },
        choices: [
          {
            id: "bury-traces",
            text: "帮忙掩埋",
            description: "先把侍卫尸首与打斗痕迹收拾干净。",
            consumeDay: true,
            consequences: [
              { kind: "relation", npcId: "guoxiaotian", delta: 3 },
              { kind: "relation", npcId: "yangtiexin", delta: 3 },
            ],
            resultText: "你与郭杨二人挖开湿土，把三具尸身移入坑中。曲三收好一枚铁八卦。曲三：\"今晚所见，不必再让第五个人知道。\"郭啸天点头，杨铁心把最后一层土踏实。",
            transition: { type: "goto", nodeId: "winter-snow" },
          },
          {
            id: "inspect-relics",
            text: "记下包裹纹样",
            description: "不拿那些旧物，只把卷轴封口与暗记拓下一角。",
            consumeDay: true,
            consequences: [
              { kind: "item", id: "qusan-palace-rubbing" },
              { kind: "aptitude", delta: 1 },
            ],
            resultText: "你借月光拓下卷轴封口，宫中库印旁还有半枚桃花形暗记。曲三看见了，却没有夺走。曲三：\"认得纹样，不等于认得它的主人。收好，别拿去换钱。\"",
            transition: { type: "goto", nodeId: "winter-snow" },
          },
          {
            id: "alert-guoyang",
            text: "提醒郭杨",
            description: "曲三既被宫中侍卫追到，牛家村未必还能一直太平。",
            consumeDay: true,
            consequences: [
              { kind: "relation", npcId: "guoxiaotian", delta: 4 },
              { kind: "relation", npcId: "yangtiexin", delta: 4 },
              { kind: "flag", name: "shendiao.niujia.warned_guoyang", value: true },
            ],
            resultText: "你指出宫中侍卫能追到林外，后面未必没有别人。杨铁心收起猎叉。杨铁心：\"明日起我和大哥轮流守夜。曲三若要走，也得先把傻姑安顿好。\"",
            transition: { type: "goto", nodeId: "winter-snow" },
          },
        ],
      },
      "winter-snow": {
        id: "winter-snow",
        title: "秋尽冬来",
        text: "此后数月，曲三没有再回酒店，只留下傻姑由村人照看。江畔乌柏落尽了叶，北风一日紧过一日。入冬后第一场大雪封住村路，杨铁心到红梅村沽酒回来，傍晚又在雪中看见一个负剑道人沿大路而来。",
        sceneTransition: {
          title: "秋尽冬来",
          subtitle: "曲三酒店空置，牛家村迎来第一场雪",
          timeLabel: "数月后 · 入冬",
          tone: "snow",
        },
        stage: {
          sceneId: "niujia-snow-courtyard",
          sceneLabel: "牛家村 · 杨家院外",
          actors: [
            { name: "杨铁心", slot: "left", motion: "enter-left" },
            { name: "长春子丘处机", slot: "far-right", motion: "enter-right" },
          ],
        },
        autoNext: { type: "goto", nodeId: "qiu-arrival" },
      },
      "qiu-arrival": {
        id: "qiu-arrival",
        title: "风雪遇长春",
        text: "道人走到杨家院前，袍角与剑鞘上都是积雪。郭啸天把双戟留在屋内，杨铁心也解下枪囊，请他进屋喝碗热酒。道人没有跨过门槛，目光在两家院墙与兵器架之间来回。长春子丘处机：\"贫道一路被官差追到这里。两位半夜持兵相候，这碗酒怕不是专为贫道温的。\"郭啸天：\"道长误会。大雪封路，不过请你进屋避一避。\"",
        stage: {
          sceneId: "niujia-snow-courtyard",
          sceneLabel: "牛家村 · 杨家院前",
          actors: [
            { name: "郭啸天", slot: "far-left", motion: "step-forward" },
            { name: "杨铁心", slot: "left", motion: "guard" },
            { name: "长春子丘处机", slot: "right", motion: "enter-right", focus: true },
          ],
        },
        autoNext: { type: "goto", nodeId: "qiu-clash" },
      },
      "qiu-clash": {
        id: "qiu-clash",
        title: "风雪交锋",
        text: "丘处机没有收手，反而扣向郭啸天手腕。杨铁心横枪隔开这一抓，枪杆刚离地面，道人的袍袖已经卷向枪尖。双方还没分清身份，第二招便逼到院门。",
        stage: {
          sceneId: "niujia-snow-courtyard",
          sceneLabel: "牛家村 · 风雪院前",
          actors: [
            { name: "郭啸天", slot: "far-left", motion: "guard" },
            { name: "杨铁心", slot: "left", motion: "lunge-right", focus: true },
            { name: "长春子丘处机", slot: "right", motion: "lunge-left", focus: true },
          ],
        },
        choices: [
          {
            id: "name-spear-lineage",
            text: "喊明杨家枪来历",
            description: "趁第二招未落，点明枪法传承，让双方先核身份。",
            consumeDay: true,
            consequences: [
              { kind: "aptitude", delta: 2 },
              { kind: "relation", npcId: "qiuchuji", delta: 2 },
            ],
            resultText: "你在枪尖再起前报出岳武穆麾下杨家枪的来历。道人目光一动，原本探向胸口的掌势改成封架，却仍要亲手验完这一枪。",
            transition: { type: "goto", nodeId: "qiu-recognition" },
          },
          {
            id: "clear-villagers",
            text: "劝村民退开",
            description: "官差可能仍在追这道人，先别让无关村民围在门外。",
            consumeDay: true,
            consequences: [
              { kind: "reputation", delta: 2 },
              { kind: "relation", npcId: "qiuchuji", delta: 2 },
            ],
            resultText: "你把门外看热闹的村民劝回各家，又将路上的脚印扫乱。院门前空下来，郭杨二人不必再护着旁人，道人也不再分神留意街口。",
            transition: { type: "goto", nodeId: "qiu-recognition" },
          },
        ],
      },
      "qiu-recognition": {
        id: "qiu-recognition",
        title: "枪下释疑",
        text: "杨铁心拧腰收势，回马枪由实转虚。丘处机两指夹住枪杆，顺着枪路看清来历，随即松手退开。长春子丘处机：\"岳武穆麾下杨家枪，原来传到了这里。贫道认错了人。两位既是忠良之后，方才多有得罪。\"杨铁心收枪抱拳，郭啸天重新推开院门。",
        stage: {
          sceneId: "niujia-snow-courtyard",
          sceneLabel: "牛家村 · 风雪院前",
          actors: [
            { name: "郭啸天", slot: "far-left", motion: "guard" },
            { name: "杨铁心", slot: "left", motion: "recoil" },
            { name: "长春子丘处机", slot: "right", motion: "recoil", focus: true },
          ],
        },
        autoNext: { type: "goto", nodeId: "qiu-night-talk" },
      },
      "qiu-night-talk": {
        id: "qiu-night-talk",
        title: "灯下短剑",
        text: "丘处机把长剑解下，横放在门边，这才接过热酒。他说自己追查临安武官与金人往来的线索，途中杀了一个替金人办事的奸细，后面的官差因此紧追不放。李萍与包惜弱添过炭火，提到两家孩子都将在来年出生。丘处机取出两柄短剑，在剑鞘上分别刻下郭靖、杨康。长春子丘处机：\"靖康二字，不该只留在说书人口中。孩子长大后，是友是敌，由他们自己选。\"",
        stage: {
          sceneId: "niujia-snow-courtyard",
          sceneLabel: "牛家村 · 杨家屋内",
          actors: [
            { name: "郭啸天", slot: "far-left" },
            { name: "杨铁心", slot: "left" },
            { name: "长春子丘处机", slot: "center", motion: "step-forward", focus: true },
            { name: "李萍", slot: "right" },
            { name: "包惜弱", slot: "far-right" },
          ],
        },
        autoNext: { type: "goto", nodeId: "qiu-pursuers" },
      },
      "qiu-pursuers": {
        id: "qiu-pursuers",
        title: "雪夜追兵",
        text: "两柄短剑刚收回鞘中，村外便传来急促马蹄。火把沿雪路逼近，前排官差中还夹着几个佩女真腰牌的人。丘处机提剑走到门外。长春子丘处机：\"他们追的是贫道。两位守住家门，不必替我添这一场人命。\"",
        stage: {
          sceneId: "niujia-snow-courtyard",
          sceneLabel: "牛家村 · 雪夜院前",
          actors: [
            { name: "郭啸天", slot: "far-left", motion: "guard" },
            { name: "杨铁心", slot: "left", motion: "guard" },
            { name: "长春子丘处机", slot: "right", motion: "step-forward", focus: true },
          ],
        },
        autoNext: { type: "goto", nodeId: "qiu-aftermath" },
      },
      "qiu-aftermath": {
        id: "qiu-aftermath",
        title: "雪地腰牌",
        text: "一盏茶后，院外只剩折断的箭杆和没入雪地的火把。丘处机收剑回到门前，郭杨二人这才上前查看。尸身上既有临安府公文，也有刻着女真文字的腰牌；官差与金人显然走的是同一路。",
        stage: {
          sceneId: "niujia-snow-courtyard",
          sceneLabel: "牛家村 · 雪夜之后",
          actors: [
            { name: "郭啸天", slot: "left", motion: "guard" },
            { name: "长春子丘处机", slot: "center", motion: "step-forward", focus: true },
            { name: "杨铁心", slot: "right", motion: "guard" },
          ],
        },
        onEnter: [
          { kind: "flag", name: "shendiao.niujia.witnessed_sword_oath", value: true },
        ],
        choices: [
          {
            id: "keep-token",
            text: "收起一枚腰牌",
            description: "官差和金兵一同追人，这件东西以后或许能说明问题。",
            consumeDay: true,
            consequences: [
              { kind: "item", id: "jin-command-token" },
              { kind: "exp", delta: 40 },
            ],
            resultText: "你从雪地里捡起一枚断带腰牌，先让丘处机看过。丘处机：\"留着。金兵能在临安地界随官差拿人，这块牌子比空口骂几句有用。\"",
            transition: { type: "pause", nodeId: "main" },
          },
          {
            id: "help-bury",
            text: "帮忙清理雪地",
            description: "趁天亮前把追兵尸身与血迹处理掉。",
            consumeDay: true,
            consequences: [
              { kind: "reputation", delta: 2 },
              { kind: "relation", npcId: "qiuchuji", delta: 4 },
              { kind: "exp", delta: 40 },
            ],
            resultText: "你与郭杨二人把尸身移到江边，李萍和包惜弱扫去雪上血迹。丘处机在旁辨认公文与腰牌，记下领兵者的来路。",
            transition: { type: "pause", nodeId: "main" },
          },
        ],
      },
      main: {
        id: "main",
        title: "雪夜余痕",
        text: "丘处机离村后，风雪仍未停。杨家后院还有一线血迹没扫干净，从旧坟旁一路拖进林中。包惜弱提着灯循迹过去，片刻后又匆匆回屋取了热酒、药布和一块门板。村口方向没有追兵，林里却传来一声被压住的呻吟。",
        stage: {
          sceneId: "yang-backyard",
          sceneLabel: "牛家村 · 杨家后院",
          actors: [
            { name: "杨铁心", slot: "far-left", motion: "guard" },
            { name: "包惜弱", slot: "right", motion: "enter-right", focus: true },
          ],
        },
        choices: [
          {
            id: "follow-blood",
            text: "循血迹跟去",
            description: "那人或许是漏网追兵，先看清包惜弱正在救谁。",
            consumeDay: true,
            consequences: [
              { kind: "flag", name: "shendiao.niujia.met_baoxiruo", value: true },
              { kind: "relation", npcId: "baoxiruo", delta: 2 },
            ],
            resultText: "旧坟后的伤者穿着黑衣，肩背中了一枝狼牙箭。包惜弱已经割开箭旁衣甲，正把人拖上门板。她看见你走近，只说了一句。包惜弱：\"要问来路，也得等他先活下来。\"",
            transition: { type: "goto", nodeId: "lodging-night" },
          },
          {
            id: "warn-guoyang",
            text: "去叫郭杨二人",
            description: "漏网追兵身份不明，不能只让包惜弱一人处置。",
            consumeDay: true,
            consequences: [
              { kind: "flag", name: "shendiao.niujia.warned_guoyang", value: true },
              { kind: "relation", npcId: "guoxiaotian", delta: 2 },
              { kind: "relation", npcId: "yangtiexin", delta: 2 },
            ],
            resultText: "你转身去敲郭家院门。等郭杨二人提兵刃赶到，林后只剩一块染血门板和拖向杨家柴房的痕迹。杨铁心看见妻子手上的药布，脸色沉了下来。",
            transition: { type: "goto", nodeId: "months-later" },
          },
          {
            id: "leave-now",
            text: "连夜离村",
            description: "官差、金兵和身份不明的伤者先后出现，这里不宜再留。",
            consumeDay: true,
            consequences: [
              { kind: "flag", name: "shendiao.niujia.departure", value: "left-before-raid" },
            ],
            resultText: "你沿江离开牛家村。身后的雪地很快盖住脚印，杨家后院那盏灯仍在林木间时隐时现。",
            transition: { type: "goto", nodeId: "leave-end" },
          },
        ],
      },
      "lodging-night": {
        id: "lodging-night",
        title: "雪夜更深",
        text: "柴房里药味、血腥味和炭火气混在一处。包惜弱已经拔出伤者肩后的狼牙箭，正用止血散压住创口。那人衣甲残破，靴面绣线与宋军不同，昏迷中仍把右手扣在腰间刀柄上。包惜弱抬头看向你，手上没有停。包惜弱：\"人都伤成这样了，总不能看着他死。\"",
        stage: {
          sceneId: "yang-backyard",
          sceneLabel: "牛家村 · 杨家柴房",
          actors: [
            { name: "包惜弱", slot: "left", motion: "step-forward", focus: true },
            { name: "完颜洪烈", slot: "right", motion: "injured" },
          ],
        },
        autoNext: { type: "goto", nodeId: "rescue" },
      },
      rescue: {
        id: "rescue",
        title: "雪夜救伤",
        text: "柴房里药味、血腥味和炭火气混在一处。伤者半倚在草堆边，嘴唇发白，右手却仍扣着腰间刀柄。包惜弱把药布缠好，又伸手去够远处的热水。门外忽然传来犬吠，伤者立刻睁眼。包惜弱回头看向你，手仍压在伤口上。",
        stage: {
          sceneId: "yang-backyard",
          sceneLabel: "牛家村 · 杨家柴房",
          actors: [
            { name: "包惜弱", slot: "left", motion: "guard", focus: true },
            { name: "完颜洪烈", slot: "right", motion: "injured" },
          ],
        },
        choices: [
          {
            id: "oppose-rescue",
            text: "劝她别救",
            description: "此人来路不正，何必为了他惹祸上身。",
            consumeDay: true,
            consequences: [
              { kind: "flag", name: "shendiao.niujia.opposed_rescue", value: true },
              { kind: "relation", npcId: "baoxiruo", delta: -5 },
            ],
            resultText: "你拦住包惜弱去取热水的手，指出伤者衣甲与口音都不似宋人。包惜弱只停了一瞬，便轻轻拨开你的手。包惜弱：\"他是谁，等他活下来再问。眼下先止血。\"她把油灯拨亮，继续替那人包扎。",
            transition: { type: "goto", nodeId: "months-later" },
          },
          {
            id: "help-rescue",
            text: "帮她救人",
            description: "不多问，先替这人止血换药再说。",
            consumeDay: true,
            consequences: [
              { kind: "factionAttitude", factionId: "jin", delta: 5 },
              { kind: "flag", name: "shendiao.niujia.helped_wanyan", value: true },
              { kind: "relation", npcId: "baoxiruo", delta: 8 },
            ],
            resultText: "你挽起袖口上前搭手，替伤者压住伤处，又把热水与药布递给包惜弱。包惜弱：\"劳你按紧些，血快止住了。\"伤者醒过片刻，先看了包惜弱一眼，又把你的衣着相貌看了一遍，随后才重新闭眼。",
            transition: { type: "goto", nodeId: "months-later" },
          },
          {
            id: "observe-rescue",
            text: "暗中观察",
            description: "不直接帮，也不直接阻止，先看清这人到底是什么来路。",
            consumeDay: true,
            consequences: [
              { kind: "flag", name: "shendiao.niujia.observed_wanyan", value: true },
              { kind: "item", id: "zhaowang-clasp-rubbing" },
            ],
            resultText: "你退到灯影照不到的地方，没有上前，也没有出声阻止。伤者腰间残破的铜扣上留着女真文字和王府纹样。你趁包惜弱换药时拓下一角，没有惊动伤者。",
            transition: { type: "goto", nodeId: "months-later" },
          },
        ],
      },
      "months-later": {
        id: "months-later",
        title: "数月之后",
        text: "天亮前，柴房里的伤者已经独自离去。雪地只留下一串向西的血脚印。此后腊尽春回，包惜弱与李萍的身孕渐渐显怀；村外却多了盘问户籍的差役，曲三空置的酒店也被人翻过两次。",
        sceneTransition: {
          title: "腊尽春回",
          subtitle: "村外开始有人盘问户籍",
          timeLabel: "次年春",
          tone: "ink",
        },
        stage: {
          sceneId: "niujia-riverbank",
          sceneLabel: "牛家村 · 腊尽春回",
          actors: [
            { name: "李萍", slot: "left", motion: "enter-left" },
            { name: "包惜弱", slot: "right", motion: "enter-right" },
          ],
        },
        onEnter: [{ kind: "exp", delta: 60 }],
        autoNext: { type: "pause", nodeId: "wait-righteous" },
      },
      "wait-righteous": {
        id: "wait-righteous",
        title: "温柔的网",
        text: "傍晚，段天德的亲随在废酒店后门接下一包银子。契纸上写着调兵数目，侧边压着半枚赵王府印。另有两名生客沿村道逐户认门，问的正是郭杨两家。围捕尚未发动，你还来得及决定把这条线送到谁手里。",
        stage: {
          sceneId: "niujia-ruined-inn",
          sceneLabel: "牛家村 · 废酒店后门",
          actors: [
            { name: "段天德", slot: "center", motion: "step-forward", focus: true },
            { name: "王府亲随", slot: "right", motion: "enter-right" },
          ],
        },
        choices: [
          {
            id: "warn-families",
            text: "提醒郭杨两家",
            description: "把巡查、银封与调兵消息直接告诉郭啸天和杨铁心。",
            consumeDay: true,
            consequences: [
              { kind: "flag", name: "shendiao.niujia.warned_guoyang", value: true },
              { kind: "relation", npcId: "guoxiaotian", delta: 5 },
              { kind: "relation", npcId: "yangtiexin", delta: 5 },
            ],
            resultText: "杨铁心听完便去牵马，郭啸天把后门杂物挪开，又让两家妻子把短剑贴身收好。郭啸天：\"他们既盯了几个月，今晚不来也会明晚来。先给妇人留退路。\"",
            transition: { type: "goto", nodeId: "raid-righteous-bridge" },
          },
          {
            id: "follow-duan",
            text: "跟住段天德",
            description: "先拿到能证明这不是普通缉捕的实物。",
            consumeDay: true,
            consequences: [
              { kind: "item", id: "duan-bribe-slip" },
              { kind: "aptitude", delta: 1 },
            ],
            resultText: "你跟到村外驿亭，从泥地里捡回亲随遗落的银契。上面既有段天德的调兵画押，也有赵王府侧印。驿亭外的马已经分作四路，正准备从东南西北合围。",
            transition: { type: "goto", nodeId: "raid-righteous-bridge" },
          },
          {
            id: "meet-wanyan",
            text: "去见王府来人",
            description: "雪地伤者既与赵王府有关，先听听对方要你做什么。",
            condition: {
              kind: "or",
              items: [
                { kind: "flag", name: "shendiao.niujia.helped_wanyan", eq: true },
                { kind: "flag", name: "shendiao.niujia.observed_wanyan", eq: true },
                { kind: "hasItem", id: "zhaowang-clasp-rubbing" },
              ],
            },
            consumeDay: true,
            resultText: "你带着铜扣拓纹到了村外偏院。门前亲随验过纹样，没有问你从何处得来，只把你领进点着两只火盆的正屋。",
            transition: { type: "goto", nodeId: "wait-jin" },
          },
          {
            id: "protect-shagu",
            text: "先送走傻姑",
            description: "曲三不知所踪，官差若搜空酒店，这孩子和旧物都会落入他们手里。",
            condition: { kind: "hasItem", id: "qusan-palace-rubbing" },
            consumeDay: true,
            consequences: [
              { kind: "npcTag", npcId: "shagu", tag: "牛家村时受玩家保护" },
              { kind: "reputation", delta: 2 },
            ],
            resultText: "你把傻姑和酒店后屋的旧木匣送到红梅村包家。傻姑抱着木匣不肯撒手，只把一枚桃花纹铜片塞给你看了一眼，又立刻藏回怀里。",
            transition: { type: "goto", nodeId: "raid-righteous-bridge" },
          },
        ],
      },
      "wait-jin": {
        id: "wait-jin",
        title: "赵王门下",
        text: "正屋里坐着的正是雪地伤者。他已换了锦袍，肩伤也只剩一道浅痕。亲随躬身称他六王爷。完颜洪烈把一枚完整铜扣放到你的拓纹旁，纹路严丝合缝。完颜洪烈：\"本王不喜欢欠人情，也不喜欢有人拿着半件信物四处打听。\"",
        stage: {
          sceneId: "niujia-ruined-inn",
          sceneLabel: "牛家村外 · 王府偏院",
          actors: [
            { name: "王府亲随", slot: "left", motion: "guard" },
            { name: "完颜洪烈", slot: "center", motion: "step-forward", focus: true },
          ],
        },
        autoNext: { type: "goto", nodeId: "recruit" },
      },
      recruit: {
        id: "recruit",
        title: "完颜洪烈的差事",
        text: "桌上摊着牛家村草图，郭杨两家的院门和后巷都被朱笔圈出。完颜洪烈没有解释罪名。完颜洪烈：\"明夜官府拿人。你熟悉村路，替本王认一认后巷。事成以后，银钱、师门、前程，都可以谈。\"",
        stage: {
          sceneId: "niujia-ruined-inn",
          sceneLabel: "牛家村外 · 王府偏院",
          actors: [
            { name: "完颜洪烈", slot: "center", motion: "step-forward", focus: true },
            { name: "王府亲随", slot: "right", motion: "guard" },
          ],
        },
        choices: [
          {
            id: "accept-offer",
            text: "接下差事",
            description: "先替他办一次事，看看这条路能通到哪里。",
            consumeDay: true,
            consequences: [
              { kind: "factionAttitude", factionId: "jin", delta: 15 },
              { kind: "flag", name: "shendiao.niujia.accepted_wanyan", value: true },
            ],
            resultText: "你收下腰牌和盘缠。完颜洪烈把草图推到你面前，让你指出郭杨两家后巷与村外岔路。亲随在旁逐一记下。",
            transition: { type: "goto", nodeId: "raid-jin-bridge" },
          },
          {
            id: "fake-accept-offer",
            text: "表面答应",
            description: "先把这层关系留着，看看他究竟想让你做什么。",
            consumeDay: true,
            consequences: [
              { kind: "factionAttitude", factionId: "jin", delta: 5 },
              { kind: "flag", name: "shendiao.niujia.fake_accept_wanyan", value: true },
            ],
            resultText: "你接过腰牌，却没有碰盘缠，只在草图上随手点了两处。完颜洪烈看了一眼，没有追问。完颜洪烈：\"明夜带着牌子来。到时再看你认的是哪条路。\"",
            transition: { type: "goto", nodeId: "raid-jin-bridge" },
          },
          {
            id: "reject-offer",
            text: "推辞不掺和",
            description: "这人情你认，但这条路你不想走。",
            consumeDay: true,
            consequences: [
              { kind: "flag", name: "shendiao.niujia.rejected_wanyan", value: true },
            ],
            resultText: "你把腰牌推回桌前，只认雪夜救命是随手而为。完颜洪烈收起笑意，示意亲随送客。完颜洪烈：\"人情可以不领，路却未必由你一人挑。\"",
            transition: { type: "goto", nodeId: "raid-righteous-bridge" },
          },
        ],
      },
      "raid-righteous-bridge": {
        id: "raid-righteous-bridge",
        title: "围村之夜",
        text: "午夜前后，四面马蹄同时逼近。官兵举火把封住村路，领头军官正是段天德。郭杨两家虽提前收好兵刃与短剑，孕妇和村民仍无法从四路骑兵之间悄然脱身。",
        stage: {
          sceneId: "niujia-raid",
          sceneLabel: "牛家村 · 围村之夜",
          actors: [
            { name: "郭啸天", slot: "far-left", motion: "guard" },
            { name: "杨铁心", slot: "left", motion: "guard" },
            { name: "李萍", slot: "right" },
            { name: "包惜弱", slot: "far-right" },
          ],
        },
        autoNext: { type: "goto", nodeId: "raid-righteous" },
      },
      "raid-jin-bridge": {
        id: "raid-jin-bridge",
        title: "围村之夜",
        text: "午夜前后，你带着王府腰牌跟官兵回到牛家村。段天德把兵马分作四路，火把沿村道一圈圈铺开。草图上的后巷就在眼前，郭杨两家也已经听见马蹄。",
        stage: {
          sceneId: "niujia-raid",
          sceneLabel: "牛家村 · 围村之夜",
          actors: [
            { name: "段天德", slot: "left", motion: "step-forward", focus: true },
            { name: "完颜洪烈", slot: "right", motion: "guard" },
          ],
        },
        autoNext: { type: "goto", nodeId: "raid-jin" },
      },
      "raid-righteous": {
        id: "raid-righteous",
        title: "官兵围村",
        text: "段天德在马上宣读临安府公文，指郭啸天、杨铁心勾结巨寇。杨铁心提枪守住杨家门前，郭啸天握着双戟退到妻子身侧。李萍和包惜弱都已有数月身孕，短剑藏在衣内，村外四条路却已被骑兵封死。",
        stage: {
          sceneId: "niujia-raid",
          sceneLabel: "牛家村 · 郭杨两家",
          actors: [
            { name: "郭啸天", slot: "far-left", motion: "guard", focus: true },
            { name: "杨铁心", slot: "left", motion: "guard", focus: true },
            { name: "李萍", slot: "right" },
            { name: "包惜弱", slot: "far-right" },
          ],
        },
        choices: [
          {
            id: "help-guoxiao",
            text: "挡阵迎敌",
            description: "冲出去帮郭啸天挡一阵，先把这一夜顶过去。",
            consumeDay: true,
            resultText: "郭啸天把右侧交给你，双戟一错，先架住两柄长矛。杨铁心从另一边挺枪杀出，官兵立刻分出一队压向院门。",
            transition: {
              type: "battle",
              enemyId: "jin-village-raider",
              allyIds: ["guoxiaotian"],
              objective: {
                kind: "defeatAll",
                title: "与郭啸天守住侧巷",
                protectAllyId: "guoxiaotian",
              },
              onWin: {
                text: "一队官军被逼退到巷口，雪地里腾出一线空当。郭啸天收回双戟，先朝李萍那边喊了一声。郭啸天：\"跟弟妹走，别回头！\"远处号角随即响起，更多火把正从村外压来。",
                consequences: [
                  { kind: "karma", delta: 5 },
                  { kind: "reputation", delta: 4 },
                  { kind: "exp", delta: 30 },
                  { kind: "npcTag", npcId: "guojing", tag: "牛家村并肩旧识" },
                  { kind: "flag", name: "shendiao.niujia.departure", value: "village-aftermath" },
                  { kind: "arcBeat", arcId: "shendiao", beat: "niujia", result: "won" },
                  { kind: "arcBeat", arcId: "shendiao", beat: "act1-wind", result: "won" },
                ],
                then: { type: "goto", nodeId: "close-won" },
              },
              onLose: {
                text: "雪地已经被踩成一片泥水。官兵重新堵住院门，郭啸天的双戟被数柄长矛一齐压住。杨铁心从另一侧折返救人，四面火把却越围越紧。",
                consequences: [
                  { kind: "flag", name: "shendiao.niujia.departure", value: "wounded-aftermath" },
                  { kind: "arcBeat", arcId: "shendiao", beat: "niujia", result: "lost" },
                  { kind: "arcBeat", arcId: "shendiao", beat: "act1-wind", result: "lost" },
                ],
                then: { type: "goto", nodeId: "close-lost" },
              },
              onFlee: {
                text: "你从侧巷退走，官兵立刻补上空位。郭啸天以双戟守在妻子身前，杨铁心又被另一队骑兵隔开，两家再没有同时突围的空当。",
                consequences: [
                  { kind: "flag", name: "shendiao.niujia.departure", value: "missed-aftermath" },
                  { kind: "arcBeat", arcId: "shendiao", beat: "niujia", result: "skipped" },
                  { kind: "arcBeat", arcId: "shendiao", beat: "act1-wind", result: "skipped" },
                ],
                then: { type: "goto", nodeId: "close-skipped" },
              },
            },
          },
          {
            id: "save-liping",
            text: "护李萍撤离",
            description: "先护着李萍和村里妇孺一起撤出村口。",
            consumeDay: true,
            consequences: [
              { kind: "relation", npcId: "guojing", delta: 10 },
              { kind: "relation", npcId: "liping", delta: 15 },
              { kind: "npcTag", npcId: "guojing", tag: "母亲受玩家援手" },
              { kind: "flag", name: "shendiao.niujia.saved_liping", value: true },
              { kind: "flag", name: "shendiao.niujia.departure", value: "north-with-liping" },
              { kind: "arcBeat", arcId: "shendiao", beat: "niujia", result: "done" },
              { kind: "arcBeat", arcId: "shendiao", beat: "act1-wind", result: "done" },
            ],
            resultText: "你扶住李萍，从郭家后门带她穿过菜地。她一手护着肚腹，一手还抓着门框。李萍：\"啸哥还在里面。你替我挡一阵，我到村外等他。\"后巷预先挪开的木栅给两人留出了一条窄路。",

            transition: { type: "goto", nodeId: "close-done" },
          },
          {
            id: "use-prepared-route",
            text: "按预留退路突围",
            description: "此前已经提醒两家，现在按约定先护孕妇从后巷撤离。",
            condition: { kind: "flag", name: "shendiao.niujia.warned_guoyang", eq: true },
            consumeDay: true,
            consequences: [
              { kind: "relation", npcId: "guojing", delta: 12 },
              { kind: "relation", npcId: "liping", delta: 12 },
              { kind: "npcTag", npcId: "guojing", tag: "牛家村预警旧识" },
              { kind: "flag", name: "shendiao.niujia.saved_liping", value: true },
              { kind: "flag", name: "shendiao.niujia.departure", value: "prepared-north-route" },
              { kind: "arcBeat", arcId: "shendiao", beat: "niujia", result: "done" },
              { kind: "arcBeat", arcId: "shendiao", beat: "act1-wind", result: "done" },
            ],
            resultText: "郭杨二人按此前约定守住正面，你从后巷带李萍与包惜弱先走。刚出村口，另一队骑兵从北路截来。杨铁心折返接应，四个人只得分作两路。",
            transition: { type: "goto", nodeId: "close-prepared" },
          },
          {
            id: "show-bribe-slip",
            text: "亮出调兵银契",
            description: "当众指出段天德收受王府银钱，逼在场官兵看清这道命令的来路。",
            condition: { kind: "hasItem", id: "duan-bribe-slip" },
            consumeDay: true,
            consequences: [
              { kind: "reputation", delta: 5 },
              { kind: "factionAttitude", factionId: "jin", delta: -8 },
              { kind: "npcTag", npcId: "guojing", tag: "牛家村旧案证人" },
              { kind: "flag", name: "shendiao.niujia.departure", value: "kept-conspiracy-evidence" },
              { kind: "arcBeat", arcId: "shendiao", beat: "niujia", result: "done" },
              { kind: "arcBeat", arcId: "shendiao", beat: "act1-wind", result: "done" },
            ],
            resultText: "你把银契举到火把下，念出段天德的调兵画押与赵王府侧印。前排官兵迟疑片刻，段天德立即命亲兵抢契灭口。这一阵混乱替郭杨两家争到了突围时间，银契也仍在你手里。",
            transition: { type: "goto", nodeId: "close-evidence" },
          },
          {
            id: "hide-away",
            text: "藏身避祸",
            description: "先保住自己，等这阵兵过去再说。",
            consumeDay: true,
            consequences: [
              { kind: "reputation", delta: -1 },
              { kind: "flag", name: "shendiao.niujia.departure", value: "hid-through-raid" },
              { kind: "arcBeat", arcId: "shendiao", beat: "niujia", result: "skipped" },
              { kind: "arcBeat", arcId: "shendiao", beat: "act1-wind", result: "skipped" },
            ],
            resultText: "门板刚一掩上，巷子里的火把便从缝外一晃而过。官兵一阵阵冲过去，哭喊声也一阵阵压过来，等外头重新静下来时，巷子里只剩雪地被踩烂后的泥水声。",

            transition: { type: "goto", nodeId: "close-skipped" },
          },
        ],
      },
      "raid-jin": {
        id: "raid-jin",
        title: "官兵围村",
        text: "段天德把两张画像递给你，又指向草图上的后巷。段天德：\"郭杨两家，一个也不能漏。\"院里已经传来兵刃声，李萍与包惜弱都怀着身孕，正被官兵从两户人家之间逼向村口。",
        stage: {
          sceneId: "niujia-raid",
          sceneLabel: "牛家村 · 官军阵中",
          actors: [
            { name: "段天德", slot: "left", motion: "step-forward", focus: true },
            { name: "李萍", slot: "right", motion: "recoil" },
            { name: "包惜弱", slot: "far-right", motion: "recoil" },
          ],
        },
        choices: [
          {
            id: "serve-jin",
            text: "奉命抓人",
            description: "搜屋、封路、协助抓人，把这一步走到底。",
            consumeDay: true,
            consequences: [
              { kind: "factionAttitude", factionId: "jin", delta: 10 },
              { kind: "relation", npcId: "guojing", delta: -20 },
              { kind: "npcTag", npcId: "guojing", tag: "牛家村旧怨" },
              { kind: "flag", name: "shendiao.niujia.departure", value: "jin-retinue" },
              { kind: "arcBeat", arcId: "shendiao", beat: "niujia", result: "done" },
              { kind: "arcBeat", arcId: "shendiao", beat: "act1-wind", result: "done" },
            ],
            resultText: "一声令下，官兵立刻顺着看住的路口压了过去。有人一脚踹开院门，有人提刀冲进屋里，雪地上的火把跟着一齐晃起来。领头军官在后头冷笑一声：\"这才像个办事的人。\"",

            transition: { type: "goto", nodeId: "jin-end" },
          },
          {
            id: "secretly-release",
            text: "暗中放人",
            description: "表面奉命，实则悄悄给李萍留出一条活路。",
            consumeDay: true,
            consequences: [
              { kind: "factionAttitude", factionId: "jin", delta: -15 },
              { kind: "relation", npcId: "guojing", delta: 6 },
              { kind: "relation", npcId: "liping", delta: 10 },
              { kind: "npcTag", npcId: "guojing", tag: "母亲受玩家暗助" },
              { kind: "flag", name: "shendiao.niujia.saved_liping", value: true },
              { kind: "flag", name: "shendiao.niujia.departure", value: "double-agent-north" },
              { kind: "arcBeat", arcId: "shendiao", beat: "niujia", result: "done" },
              { kind: "arcBeat", arcId: "shendiao", beat: "act1-wind", result: "done" },
            ],
            resultText: "侧巷木栅被你悄悄抬开一线。李萍一手护着肚腹，从火把照不到的菜地穿了出去。她回头只看了你一眼，随即沿北边田埂去找郭啸天。",

            transition: { type: "goto", nodeId: "mixed-end" },
          },
          {
            id: "turn-back",
            text: "临阵倒戈",
            description: "到这一步才看清自己不愿替他们把事做绝。",
            consumeDay: true,
            consequences: [
              { kind: "factionAttitude", factionId: "jin", delta: -25 },
              { kind: "relation", npcId: "guojing", delta: 8 },
              { kind: "npcTag", npcId: "guojing", tag: "牛家村复杂旧识" },
              { kind: "flag", name: "shendiao.niujia.departure", value: "defected-at-raid" },
              { kind: "arcBeat", arcId: "shendiao", beat: "niujia", result: "done" },
              { kind: "arcBeat", arcId: "shendiao", beat: "act1-wind", result: "done" },
            ],
            resultText: "最前头那名官兵刚扑上去，便被猛地撞进雪地里。后头的人先是一愣，随即破口大骂着提刀扑上来，连村口勒马的军官都猛地回头看了过来。官军这边只要一乱，院里那头就还能多抢出一口气。",

            transition: { type: "goto", nodeId: "turn-end" },
          },
        ],
      },
      "close-won": {
        id: "close-won",
        title: "风雪之后",
        text: "你们打退的是侧巷一队，村外主力随后仍压了进来。天亮时，江边只剩郭啸天的一柄断戟和大片血迹；杨铁心、李萍、包惜弱都已不知去向。段天德的队伍分作南北两路离村，赵王府亲随则护着另一辆马车向北。",
        autoNext: { type: "end" },
      },
      "close-lost": {
        id: "close-lost",
        title: "风雪之后",
        text: "你从泥雪里醒来时，官兵已经撤走。郭家门前留着一柄断戟，杨家院墙塌了半边，两个孕妇与杨铁心全都失踪。段天德的人沿官道北去，路边每隔一段便有带血的车辙。",
        autoNext: { type: "end" },
      },
      "close-done": {
        id: "close-done",
        title: "风雪之后",
        text: "你护着李萍走到村北驿路，身后火光仍未熄。追兵截断了回村的路，她只能把郭啸天留下的短剑贴身收好。李萍：\"我不能落到段天德手里。先往北走，等躲过这一阵再回来找人。\"",
        autoNext: { type: "end" },
      },
      "close-prepared": {
        id: "close-prepared",
        title: "南北离散",
        text: "预留后巷让两家多抢出了一段路，村外伏兵却仍把众人冲散。杨铁心带包惜弱折向西侧，你与李萍沿北路避开追兵。郭啸天留下断后，此后再没有赶上来。",
        autoNext: { type: "end" },
      },
      "close-evidence": {
        id: "close-evidence",
        title: "证物在手",
        text: "银契让前排官兵乱了一阵，却没能撤掉围捕。混战后，郭啸天战死，杨铁心负伤失踪；李萍被段天德带往北路，包惜弱则被一队自称救人的黑衣骑士带走。调兵银契仍在你手中，其他旧证也没有遗失。",
        autoNext: { type: "end" },
      },
      "close-skipped": {
        id: "close-skipped",
        title: "风雪之后",
        text: "等你从藏身处出来，官兵已经撤走。郭杨两家院门大开，屋内被翻得一片狼藉；江边有断戟和血迹，两名孕妇与杨铁心都不知去向。村民只看见两队人马先后向北。",
        autoNext: { type: "end" },
      },
      "jin-end": {
        id: "jin-end",
        title: "风雪之后",
        text: "郭啸天倒在围捕中，杨铁心负伤冲出村口。段天德押着李萍往北，另一队王府亲随则在路上接走包惜弱。段天德把一块沾血腰牌抛到你脚边。段天德：\"王爷会记得你的功劳。\"",
        autoNext: { type: "end" },
      },
      "mixed-end": {
        id: "mixed-end",
        title: "风雪之后",
        text: "李萍已经沿北边田埂逃远。官军发现木栅被人抬开，段天德当场扣下两名看守，又命亲兵沿路追查。你仍在王府队伍里，却已经有人开始盘问后巷是谁负责。",
        autoNext: { type: "end" },
      },
      "turn-end": {
        id: "turn-end",
        title: "风雪之后",
        text: "官军调转刀口追来，你与郭啸天退到村口。郭啸天把夺来的刀抛给你，自己仍以双戟断后。郭啸天：\"带她们走，别回头。\"再一队骑兵从北面冲来，众人随即被迫分散。",
        autoNext: { type: "end" },
      },
      "leave-end": {
        id: "leave-end",
        title: "数月后的消息",
        text: "数月后，驿道上的逃难村民说牛家村遭官兵围捕，郭啸天死在村外，杨铁心与两名怀孕的妇人都已失踪。有人往北追过段天德，也有人看见赵王府车马经过，消息彼此对不上。",
        onEnter: [
          { kind: "arcBeat", arcId: "shendiao", beat: "niujia", result: "skipped" },
          { kind: "arcBeat", arcId: "shendiao", beat: "act1-wind", result: "skipped" },
        ],
        autoNext: { type: "end" },
      },
    },
  },
  // ===== 1. 牛家村·风雪惊变（起点） =====
  {
    id: "shendiao-niujia-arrival",
    entryNode: "main",
    locationId: "niujia",
    weight: 6,
    once: true,
    condition: { kind: "not", item: { kind: "arcBeat", arcId: "shendiao", beat: "niujia" } },
    nodes: {
      main: {
        id: "main",
        title: "风雪牛家村",
        text: "风雪压着村路。村头酒馆里灯火未灭，两个汉子正与一个道人对饮。一个使枪，一个使戟，桌上还搁着几坛酒。村里人不多，却都像在避着什么。你站在酒馆外，肩上落满雪，先得决定今晚怎么落脚。",
        choices: [
          {
            id: "hear-tavern",
            text: "窗外偷听",
            description: "先不露面，在窗外听听这几人说些什么。",
            consumeDay: true,
            consequences: [
              { kind: "flag", name: "shendiao.niujia.heard_tavern", value: true },
            ],
            resultText: "你伏在窗外，听那道人自称丘处机；两个汉子一个姓郭、一个姓杨，还提到家中将有孩子。酒馆对街有两名生客一直守在檐下，手始终没有离开刀柄。",
            transition: { type: "end" },
          },
          {
            id: "stay-baoxiruo",
            text: "借宿农家",
            description: "不去酒馆，先在村里找户人家借宿。",
            consumeDay: true,
            consequences: [
              { kind: "flag", name: "shendiao.niujia.met_baoxiruo", value: true },
            ],
            resultText: "你避开酒馆，敲开了一户农家的门。开门的妇人见你浑身落雪，迟疑片刻后把你让进屋里。桌上叠着补了一半的冬衣，灶边温着热水，炭盆也刚添过新炭。",
            transition: { type: "end" },
          },
          {
            id: "leave-now",
            text: "连夜离村",
            description: "这村子气氛不对，趁雪色还深，先离开再说。",
            consumeDay: true,
            resultText: "你踏雪离村。走出二里后，身后忽然传来一阵急促马蹄，紧接着是呼喝与犬吠。牛家村那点灯火很快被风雪遮住。",
            transition: { type: "goto", nodeId: "leave-end" },
          },
        ],
      },
      "leave-end": {
        id: "leave-end",
        title: "数月后的消息",
        text: "数月后，驿道上的逃难村民说牛家村遭官兵围捕，郭啸天死在村外，杨铁心与两名怀孕的妇人都已失踪。有人往北追过段天德，也有人看见赵王府车马经过，消息彼此对不上。",
        autoNext: { type: "end" },
        onEnter: [{ kind: "arcBeat", arcId: "shendiao", beat: "niujia", result: "skipped" }],
      },
    },
  },
  {
    id: "shendiao-niujia-rescue",
    entryNode: "main",
    locationId: "niujia",
    weight: 6,
    once: true,
    condition: {
      kind: "and",
      items: [
        { kind: "not", item: { kind: "arcBeat", arcId: "shendiao", beat: "niujia" } },
        { kind: "flag", name: "shendiao.niujia.met_baoxiruo", eq: true },
      ],
    },
    nodes: {
      main: {
        id: "main",
        title: "雪夜救伤",
        text: "半夜风雪更紧。柴房里传出一声闷哼。你推门一看，借你留宿的妇人正借着油灯替一个受伤武士包扎。那人衣甲残破，口音却不像宋人。包惜弱抬头看你，手上没停。包惜弱：\"人都伤成这样了，总不能看着他死。\"",
        choices: [
          {
            id: "oppose-rescue",
            text: "劝她别救",
            description: "此人来路不正，何必为了他惹祸上身。",
            consumeDay: true,
            consequences: [
              { kind: "flag", name: "shendiao.niujia.opposed_rescue", value: true },
            ],
            resultText: "你指出伤者衣甲与口音都不似宋人，劝包惜弱不要惹祸。她只停了一瞬，便继续缠紧药布。包惜弱：\"他是谁，等他活下来再问。\"",
            transition: { type: "end" },
          },
          {
            id: "help-rescue",
            text: "帮她救人",
            description: "不多问，先替这人止血换药再说。",
            consumeDay: true,
            consequences: [
              { kind: "factionAttitude", factionId: "jin", delta: 10 },
              { kind: "flag", name: "shendiao.niujia.helped_wanyan", value: true },
            ],
            resultText: "你蹲下身替伤者压住伤处，又把热水与药布递给包惜弱。包惜弱：\"劳你按紧些，血快止住了。\"伤者醒过片刻，把你的衣着相貌看了一遍，随后才重新闭眼。",
            transition: { type: "end" },
          },
          {
            id: "observe-rescue",
            text: "暗中观察",
            description: "不直接帮，也不直接阻止，先看清这人到底是什么来路。",
            consumeDay: true,
            consequences: [
              { kind: "flag", name: "shendiao.niujia.observed_wanyan", value: true },
            ],
            resultText: "你退到灯影照不到的地方。伤者虽然失血不少，手指却始终压着刀柄；靴面绣线细密，腰间残破的铜扣上还留着女真文字。他绝非寻常军士。",
            transition: { type: "end" },
          },
        ],
      },
    },
  },
  {
    id: "shendiao-niujia-recruit",
    entryNode: "main",
    locationId: "niujia",
    weight: 6,
    once: true,
    condition: {
      kind: "and",
      items: [
        { kind: "not", item: { kind: "arcBeat", arcId: "shendiao", beat: "niujia" } },
        {
          kind: "or",
          items: [
            { kind: "flag", name: "shendiao.niujia.helped_wanyan", eq: true },
            { kind: "flag", name: "shendiao.niujia.observed_wanyan", eq: true },
          ],
        },
      ],
    },
    nodes: {
      main: {
        id: "main",
        title: "完颜洪烈伤愈招揽",
        text: "过了数日，那个受伤的金人已能起身。他让亲随把你请去一处偏屋，桌上放着一枚刻有王府印记的腰牌。完颜洪烈：\"那夜你救我一命。我不喜欢欠人情。你若肯替我办件小事，以后荣华富贵，未必没有。\"",
        choices: [
          {
            id: "accept-offer",
            text: "接下差事",
            description: "先替他办一次事，看看这条路能通到哪里。",
            consumeDay: true,
            consequences: [
              { kind: "factionAttitude", factionId: "jin", delta: 15 },
              { kind: "flag", name: "shendiao.niujia.accepted_wanyan", value: true },
            ],
            resultText: "你收下腰牌。完颜洪烈示意亲随送上一袋盘缠。完颜洪烈：\"三日后，跟我的人去牛家村。到时自有人告诉你该做什么。\"",
            transition: { type: "end" },
          },
          {
            id: "fake-accept-offer",
            text: "表面答应",
            description: "先把这层关系留着，看看他究竟想让你做什么。",
            consumeDay: true,
            consequences: [
              { kind: "factionAttitude", factionId: "jin", delta: 5 },
              { kind: "flag", name: "shendiao.niujia.fake_accept_wanyan", value: true },
            ],
            resultText: "你接过腰牌，却没有碰桌上的盘缠。完颜洪烈扫了一眼那袋银子。完颜洪烈：\"谨慎是好事。三日后，带着牌子来见我的人。\"",
            transition: { type: "end" },
          },
          {
            id: "reject-offer",
            text: "推辞不掺和",
            description: "这人情你认，但这条路你不想走。",
            consumeDay: true,
            consequences: [
              { kind: "flag", name: "shendiao.niujia.rejected_wanyan", value: true },
            ],
            resultText: "你把腰牌推回桌前，只认雪夜救命是随手而为。完颜洪烈示意亲随送客。完颜洪烈：\"人情可以不领，路却未必由你一人挑。\"",
            transition: { type: "end" },
          },
        ],
      },
    },
  },
  {
    id: "shendiao-niujia-raid-righteous",
    entryNode: "main",
    locationId: "niujia",
    weight: 6,
    once: true,
    condition: {
      kind: "and",
      items: [
        { kind: "not", item: { kind: "arcBeat", arcId: "shendiao", beat: "niujia" } },
        {
          kind: "or",
          items: [
            { kind: "flag", name: "shendiao.niujia.heard_tavern", eq: true },
            { kind: "flag", name: "shendiao.niujia.opposed_rescue", eq: true },
            { kind: "flag", name: "shendiao.niujia.rejected_wanyan", eq: true },
          ],
        },
        { kind: "not", item: { kind: "flag", name: "shendiao.niujia.accepted_wanyan", eq: true } },
        { kind: "not", item: { kind: "flag", name: "shendiao.niujia.fake_accept_wanyan", eq: true } },
      ],
    },
    nodes: {
      main: {
        id: "main",
        title: "官兵围村",
        text: "数月后，半夜马蹄踏碎村路，官兵举火把围住牛家村。郭啸天握着双戟冲出院门，杨铁心提枪守住另一侧；李萍与包惜弱都已有身孕，官兵则从四条路同时压来。",
        choices: [
          {
            id: "help-guoxiao",
            text: "挡阵迎敌",
            description: "冲出去帮郭啸天挡一阵，先把这一夜顶过去。",
            consumeDay: true,
            resultText: "你提气扑进火光里，替郭啸天挡下最先冲上的几名官兵。郭啸天双戟一错，抢到你身侧。郭啸天：\"左边交给我！先把院门守住！\"",
            transition: {
              type: "battle", enemyId: "guanjun",
              onWin: {
                text: "你与郭啸天合力把一波官军逼退到巷口。郭啸天收回双戟，先朝屋里喊了一声。郭啸天：\"李萍，走后门！别回头！\"",
                consequences: [
                  { kind: "karma", delta: 5 },
                  { kind: "reputation", delta: 4 },
                  { kind: "arcBeat", arcId: "shendiao", beat: "niujia", result: "won" },
                ],
                then: { type: "goto", nodeId: "close-won" },
              },
              onLose: {
                text: "你拼到力竭，仍没撑住这一阵。官兵重新堵住院门，郭啸天的双戟也被数柄长矛一齐压住。屋后传来木门被撞开的巨响。",
                consequences: [
                  { kind: "arcBeat", arcId: "shendiao", beat: "niujia", result: "lost" },
                ],
                then: { type: "goto", nodeId: "close-lost" },
              },
              onFlee: {
                text: "你虚晃数招退进侧巷。官兵很快补上空位，刀枪再次挤到院门前。郭啸天被逼得连退数步，再没有护送家人离开的空当。",
                consequences: [
                  { kind: "arcBeat", arcId: "shendiao", beat: "niujia", result: "skipped" },
                ],
                then: { type: "goto", nodeId: "close-skipped" },
              },
            },
          },
          {
            id: "save-liping",
            text: "护李萍撤离",
            description: "先护着李萍和村里妇孺一起撤出村口。",
            consumeDay: true,
            consequences: [
              { kind: "relation", npcId: "guojing", delta: 10 },
              { kind: "flag", name: "shendiao.niujia.saved_liping", value: true },
              { kind: "arcBeat", arcId: "shendiao", beat: "niujia", result: "done" },
            ],
            resultText: "李萍一手护着肚腹，一手死死抓着门框，咬牙道：\"郭大哥还在里头！\" 巷口那边火把已经越逼越近，几名妇孺也被哭声惊得乱作一团。后路总算还没被封死，再慢片刻，谁也走不脱。",

            transition: { type: "goto", nodeId: "close-done" },
          },
          {
            id: "hide-away",
            text: "藏身避祸",
            description: "先保住自己，等这阵兵过去再说。",
            consumeDay: true,
            consequences: [
              { kind: "reputation", delta: -1 },
              { kind: "arcBeat", arcId: "shendiao", beat: "niujia", result: "skipped" },
            ],
            resultText: "门板刚一掩上，巷子里的火把便从缝外一晃而过。官兵一阵阵冲过去，哭喊声也一阵阵压过来，等外头重新静下来时，巷子里只剩雪地被踩烂后的泥水声。",

            transition: { type: "goto", nodeId: "close-skipped" },
          },
        ],
      },
      "close-won": {
        id: "close-won",
        title: "风雪之后",
        text: "你们打退的是侧巷一队，村外主力随后仍压了进来。天亮时，江边只剩郭啸天的一柄断戟和大片血迹；杨铁心、李萍、包惜弱都已不知去向。",
        autoNext: { type: "end" },
      },
      "close-lost": {
        id: "close-lost",
        title: "风雪之后",
        text: "火把渐远，雪地上一串串脚印踩得杂乱无章。那道人、那两户人家都已消失在夜色尽头，只剩院门口一地烂雪和被踏翻的盆桶还歪在原处。",
        autoNext: { type: "end" },
      },
      "close-done": {
        id: "close-done",
        title: "风雪之后",
        text: "李萍一路护着腹中孩儿，走到村外才扶住树干喘气。李萍：\"郭大哥还在村里。你不必陪我，快回去帮他。\"巷口后路还留着一串歪斜脚印，风一吹，雪很快便盖了上去。",
        autoNext: { type: "end" },
      },
      "close-skipped": {
        id: "close-skipped",
        title: "风雪之后",
        text: "等你从藏身处出来，官兵已经撤走。郭杨两家院门大开，屋内被翻得一片狼藉；江边有断戟和血迹，两名孕妇与杨铁心都不知去向。",
        autoNext: { type: "end" },
      },
    },
  },
  {
    id: "shendiao-niujia-raid-jin",
    entryNode: "main",
    locationId: "niujia",
    weight: 6,
    once: true,
    condition: {
      kind: "and",
      items: [
        { kind: "not", item: { kind: "arcBeat", arcId: "shendiao", beat: "niujia" } },
        {
          kind: "or",
          items: [
            { kind: "flag", name: "shendiao.niujia.accepted_wanyan", eq: true },
            { kind: "flag", name: "shendiao.niujia.fake_accept_wanyan", eq: true },
          ],
        },
      ],
    },
    nodes: {
      main: {
        id: "main",
        title: "官兵围村",
        text: "你跟着官军回到牛家村。领头军官把两张画像递到你手里，又指向村口与侧巷。领头军官：\"郭杨两家，一个也不能漏。你熟路，带人封住后巷。\"几户人家听见马蹄，已经先后熄了灯。",
        choices: [
          {
            id: "serve-jin",
            text: "奉命抓人",
            description: "搜屋、封路、协助抓人，把这一步走到底。",
            consumeDay: true,
            consequences: [
              { kind: "factionAttitude", factionId: "jin", delta: 10 },
              { kind: "relation", npcId: "guojing", delta: -20 },
              { kind: "arcBeat", arcId: "shendiao", beat: "niujia", result: "done" },
            ],
            resultText: "一声令下，官兵立刻顺着看住的路口压了过去。有人一脚踹开院门，有人提刀冲进屋里，雪地上的火把跟着一齐晃起来。领头军官在后头冷笑一声：\"这才像个办事的人。\"",

            transition: { type: "goto", nodeId: "jin-end" },
          },
          {
            id: "secretly-release",
            text: "暗中放人",
            description: "表面奉命，实则悄悄给李萍留出一条活路。",
            consumeDay: true,
            consequences: [
              { kind: "factionAttitude", factionId: "jin", delta: -15 },
              { kind: "relation", npcId: "guojing", delta: 6 },
              { kind: "flag", name: "shendiao.niujia.saved_liping", value: true },
              { kind: "arcBeat", arcId: "shendiao", beat: "niujia", result: "done" },
            ],
            resultText: "侧巷木栅被你悄悄抬开一线。李萍一手护着肚腹，从火把照不到的菜地穿了出去；另一边官兵还在挨家挨户搜，再等有人回过味来，这条活路就要没了。",

            transition: { type: "goto", nodeId: "mixed-end" },
          },
          {
            id: "turn-back",
            text: "临阵倒戈",
            description: "到这一步才看清自己不愿替他们把事做绝。",
            consumeDay: true,
            consequences: [
              { kind: "factionAttitude", factionId: "jin", delta: -25 },
              { kind: "relation", npcId: "guojing", delta: 8 },
              { kind: "arcBeat", arcId: "shendiao", beat: "niujia", result: "done" },
            ],
            resultText: "最前头那名官兵刚扑上去，便被猛地撞进雪地里。后头的人先是一愣，随即破口大骂着提刀扑上来，连村口勒马的军官都猛地回头看了过来。官军这边只要一乱，院里那头就还能多抢出一口气。",

            transition: { type: "goto", nodeId: "turn-end" },
          },
        ],
      },
      "jin-end": {
        id: "jin-end",
        title: "风雪之后",
        text: "牛家村的火光渐渐熄了。领头军官清点完俘虏，把一块沾血的腰牌抛到你脚边。领头军官：\"王爷会记得你的功劳。\"几名村民隔着残墙看向这边，随即关紧了门。",
        autoNext: { type: "end" },
      },
      "mixed-end": {
        id: "mixed-end",
        title: "风雪之后",
        text: "李萍已经从侧巷逃远。官军很快发现那扇虚掩的小门，领头军官当场扣下两名看守，又命人封住余下路口。回营的队伍中，有人开始低声追问方才是谁守着侧巷。",
        autoNext: { type: "end" },
      },
      "turn-end": {
        id: "turn-end",
        title: "风雪之后",
        text: "官军调转刀口追了上来。你退到村口时，郭啸天只来得及看你一眼，便把一柄夺来的刀抛到你手中。郭啸天：\"先活着出去，别的话以后再说。\"",
        autoNext: { type: "end" },
      },
    },
  },

  // ===== 2. 大漠·少年射雕 =====
  {
    id: "shendiao-damos",
    entryNode: "arrival",
    locationId: "damos",
    weight: 5,
    once: true,
    condition: { kind: "arcBeat", arcId: "shendiao", beat: "niujia" },
    nodes: {
      arrival: {
        id: "arrival",
        title: "大漠旧路",
        text: "牛家村之后，北路消息断断续续。李萍最终在乱军与风雪间抵达蒙古草原，靠放牧和织毡把孩子养大；你以什么身份再次接近这对母子，要从当年离村的那条路说起。",
        onEnter: [
          { kind: "flag", name: "shendiao.damos.reworked", value: true },
        ],
        autoNext: {
          type: "branch",
          cases: [
            {
              when: { kind: "flag", name: "shendiao.niujia.departure", eq: "jin-retinue" },
              then: { type: "goto", nodeId: "arrival-jin" },
            },
            {
              when: { kind: "flag", name: "shendiao.niujia.saved_liping", eq: true },
              then: { type: "goto", nodeId: "arrival-liping" },
            },
          ],
          else: { type: "goto", nodeId: "arrival-stranger" },
        },
      },
      "arrival-jin": {
        id: "arrival-jin",
        title: "王府旧差",
        text: "数年后，你随一支金国使队进入草原，终于找到李萍母子的营地。六岁的郭靖看见你腰间旧式王府牌，先把母亲挡在身后。郭靖：\"你是从中都来的，还是来找我娘的？\"",
        autoNext: { type: "goto", nodeId: "childhood-camp" },
      },
      "arrival-liping": {
        id: "arrival-liping",
        title: "北路旧识",
        text: "当年你曾替李萍抢出一段北路。她后来在风雪与乱军间生下郭靖，靠牧民接济留在草原。几年过去，郭靖已能帮母亲赶羊。李萍把孩子叫到身边。李萍：\"靖儿，这就是娘说过的牛家村旧人。\"",
        autoNext: { type: "goto", nodeId: "childhood-camp" },
      },
      "arrival-stranger": {
        id: "arrival-stranger",
        title: "草原生客",
        text: "你没有亲历李萍北上的路。营地里只知道这对汉人母子从南方逃难而来，女人靠织毡换粮，六岁的孩子说话慢，却每天最早把羊赶出圈。",
        autoNext: { type: "goto", nodeId: "childhood-camp" },
      },
      "childhood-camp": {
        id: "childhood-camp",
        title: "大漠落脚",
        text: "李萍的毡帐立在营地边缘，羊圈缺了一段木栅，水桶也得从两里外提回。郭靖抱着一捆比自己还高的干草，走得不快，却一次也没有把草放下。营中蒙古人认得这对汉人母子，却还不认得你。",
        choices: [
          {
            id: "help-liping",
            text: "留下搭把手",
            description: "先把羊圈、饮水和过冬干草收拾妥当。",
            consumeDay: true,
            consequences: [
              { kind: "relation", npcId: "liping", delta: 12 },
              { kind: "relation", npcId: "guojing", delta: 8 },
              { kind: "hp", delta: 20 },
            ],
            resultText: "你与郭靖一起补好木栅，又赶在天黑前拉回两车干草。李萍没有说客套话，只把热羊汤分成三碗。李萍：\"草原上过日子，肯出力便比会说话强。\"",
            transition: { type: "goto", nodeId: "jebe-wounded" },
          },
          {
            id: "work-for-camp",
            text: "去营中找差事",
            description: "替牧人巡圈、修鞍，也先学会草原上的规矩。",
            consumeDay: true,
            consequences: [
              { kind: "factionAttitude", factionId: "mongol", delta: 6 },
              { kind: "speed", delta: 1 },
              { kind: "relation", npcId: "guojing", delta: 4 },
            ],
            resultText: "你跟牧人巡过羊圈，又替一队骑兵修好断裂的鞍扣。郭靖在旁递工具，做完后才问你明日是否还来。营中老兵已经记住这个肯干活的汉人。",
            transition: { type: "goto", nodeId: "jebe-wounded" },
          },
          {
            id: "follow-jin-order",
            text: "按王府旧差打听",
            description: "先确认李萍母子是否仍被金国与段天德追索。",
            condition: { kind: "flag", name: "shendiao.niujia.departure", eq: "jin-retinue" },
            consumeDay: true,
            consequences: [
              { kind: "factionAttitude", factionId: "jin", delta: 5 },
              { kind: "relation", npcId: "guojing", delta: -4 },
              { kind: "aptitude", delta: 1 },
            ],
            resultText: "金国使队只要你查明母子去向，没有立刻拿人。你回到营边时，郭靖正站在帐外看着你。郭靖：\"你若要问我娘，先当面问。别去问旁人。\"",
            transition: { type: "goto", nodeId: "jebe-wounded" },
          },
        ],
      },
      "jebe-wounded": {
        id: "jebe-wounded",
        title: "哲别藏身",
        text: "数日后，一个黑袍将军伏在伤马上来到帐外。他脸上带血，只向郭靖要水和羊肉。远处很快扬起追兵尘土。伤者把黑马赶开，自己钻进干草堆。郭靖没有问他曾替谁打仗，只把水碗和肉放到草边。",
        choices: [
          {
            id: "hide-black-horse",
            text: "把黑马引远",
            description: "追兵先找坐骑，把马带去另一片牧道。",
            consumeDay: true,
            consequences: [
              { kind: "relation", npcId: "zhebie", delta: 8 },
              { kind: "relation", npcId: "guojing", delta: 4 },
              { kind: "speed", delta: 1 },
            ],
            resultText: "你牵着黑马绕过两道沙坡，再解开缰绳让它自行吃草。追兵先被马蹄印引向西侧，回头时才发现郭靖仍守在草堆附近。",
            transition: { type: "goto", nodeId: "jebe-search" },
          },
          {
            id: "bind-wound",
            text: "替哲别裹伤",
            description: "趁追兵还远，先让伤者有力气自己走出来。",
            consumeDay: true,
            consequences: [
              { kind: "relation", npcId: "zhebie", delta: 10 },
              { kind: "relation", npcId: "guojing", delta: 5 },
              { kind: "reputation", delta: 1 },
            ],
            resultText: "你割下一段干净毡布压住伤口。哲别只报了名字，随即重新握住断刀。哲别：\"他们若打孩子，我自己出去。你不必替我送命。\"",
            transition: { type: "goto", nodeId: "jebe-search" },
          },
          {
            id: "alert-patrol",
            text: "通知巡骑",
            description: "这个将军刚与铁木真交战，不愿替陌生人承担风险。",
            consumeDay: true,
            consequences: [
              { kind: "factionAttitude", factionId: "mongol", delta: 5 },
              { kind: "relation", npcId: "guojing", delta: -8 },
            ],
            resultText: "你把消息交给最近的巡骑。郭靖听见后挡在草堆前。郭靖：\"他喝过我家的水。你们要抓他，也不能先打人。\"追兵随即从两侧围住毡帐。",
            transition: { type: "goto", nodeId: "jebe-search" },
          },
        ],
      },
      "jebe-search": {
        id: "jebe-search",
        title: "不说",
        text: "朮赤带兵赶到，黑马已经暴露哲别就在附近。郭靖被问到藏身处，只反复说自己不说。马鞭落在他额角，六头猎犬也开始沿草堆嗅闻。郭靖家的牧羊犬守住草堆，已经被咬得遍体是伤。",
        choices: [
          {
            id: "draw-hounds",
            text: "引开猎犬",
            description: "拿带血毡布绕向另一堆干草，替哲别争一段时间。",
            consumeDay: true,
            consequences: [
              { kind: "relation", npcId: "guojing", delta: 8 },
              { kind: "relation", npcId: "zhebie", delta: 4 },
              { kind: "speed", delta: 1 },
            ],
            resultText: "你拖着染血毡布从羊圈后绕过，几头猎犬立刻改向。朮赤很快看出这是调虎离山，却也因此把鞭子转向了你。",
            transition: { type: "goto", nodeId: "jebe-surrender" },
          },
          {
            id: "take-the-whip",
            text: "挡住下一鞭",
            description: "郭靖仍不肯说，先别让朮赤继续往孩子头上打。",
            consumeDay: true,
            consequences: [
              { kind: "hp", delta: -10 },
              { kind: "relation", npcId: "guojing", delta: 12 },
              { kind: "reputation", delta: 2 },
            ],
            resultText: "你挤到郭靖身前，鞭梢抽在肩背。朮赤正要再打，草堆里忽然伸出半截断刀，把第二鞭架在半空。",
            transition: { type: "goto", nodeId: "jebe-surrender" },
          },
          {
            id: "hold-position",
            text: "守在外围",
            description: "不再帮哲别，也不跟着追兵欺负孩子。",
            consumeDay: true,
            consequences: [
              { kind: "relation", npcId: "guojing", delta: 2 },
              { kind: "aptitude", delta: 1 },
            ],
            resultText: "你没有靠近草堆，只盯住周围兵刃。郭靖抱住朮赤的腿仍不松手，哲别终于从草中跃出，把孩子拉到自己身后。",
            transition: { type: "goto", nodeId: "jebe-surrender" },
          },
        ],
      },
      "jebe-surrender": {
        id: "jebe-surrender",
        title: "神箭手归帐",
        text: "哲别不肯让郭靖替自己挨刀，主动走出草堆。铁木真没有立即杀他，而是让他与博尔朮比箭。哲别本可取博尔朮性命，却折去箭头换郭靖平安；博尔朮也以同样手法还箭。铁木真当场收下这名神箭手。郭靖把哲别送来的金子推回去，只说母亲不许拿客人的东西。",
        onEnter: [
          { kind: "npcTag", npcId: "guojing", tag: "不出卖哲别" },
          { kind: "npcTag", npcId: "zhebie", tag: "受郭靖与玩家旧恩" },
          { kind: "factionAttitude", factionId: "mongol", delta: 4 },
        ],
        autoNext: { type: "goto", nodeId: "seven-freaks-arrive" },
      },
      "seven-freaks-arrive": {
        id: "seven-freaks-arrive",
        title: "江南七怪寻人",
        text: "又过数月，七个江南口音的怪客在草原上撞见郭靖与拖雷打架。朱聪夺过郭靖短剑，看见剑柄上的杨康二字；柯镇恶又从孩子口中听见段天德的名字。七人苦寻六年，终于找到了郭啸天的遗腹子。",
        choices: [
          {
            id: "identify-sword",
            text: "说出换剑旧事",
            description: "用牛家村时见过的短剑次序，替郭靖母子补全身份。",
            condition: { kind: "flag", name: "shendiao.niujia.witnessed_sword_oath", eq: true },
            consumeDay: true,
            consequences: [
              { kind: "flag", name: "shendiao.damos.training", value: "seven-freaks" },
              { kind: "relation", npcId: "guojing", delta: 12 },
              { kind: "npcRelationType", npcId: "guojing", relationType: "同门" },
              { kind: "reputation", delta: 2 },
            ],
            resultText: "你说出两家交换短剑的细节，又指出郭家手中本该是刻着杨康的那柄。朱聪把短剑交还郭靖。柯镇恶：\"旧事能说到这个地步，至少不是冒认。今夜你与靖儿一同上山。\"",
            transition: { type: "goto", nodeId: "blackwind-omens" },
          },
          {
            id: "take-trial",
            text: "与郭靖同受考验",
            description: "若七怪肯教，先按他们的规矩证明自己能吃苦。",
            consumeDay: true,
            consequences: [
              { kind: "flag", name: "shendiao.damos.training", value: "seven-freaks" },
              { kind: "relation", npcId: "guojing", delta: 10 },
              { kind: "npcRelationType", npcId: "guojing", relationType: "同门" },
              { kind: "attack", delta: 1 },
            ],
            resultText: "朱聪让你与郭靖在午夜前独自到荒山。郭靖没有多问，只把短剑重新系紧。韩小莹：\"敢去是一回事，到了以后能不能守规矩，又是另一回事。\"",
            transition: { type: "goto", nodeId: "blackwind-omens" },
          },
          {
            id: "help-guojing-train",
            text: "只陪郭靖练",
            description: "不抢他的师承，愿在旁帮他记招、拆招和守夜。",
            consumeDay: true,
            consequences: [
              { kind: "flag", name: "shendiao.damos.training", value: "companion" },
              { kind: "relation", npcId: "guojing", delta: 12 },
              { kind: "reputation", delta: 1 },
            ],
            resultText: "你没有拜师，只答应陪郭靖练功。南希仁看了你一眼。南希仁：\"陪得住十年，再说别的。\"七怪仍准你在夜课旁听。",
            transition: { type: "goto", nodeId: "blackwind-omens" },
          },
          {
            id: "keep-distance",
            text: "暂不入门",
            description: "七怪规矩重、旧怨深，先保留自由身份。",
            consumeDay: true,
            consequences: [
              { kind: "flag", name: "shendiao.damos.training", value: "free" },
              { kind: "aptitude", delta: 1 },
            ],
            resultText: "你没有答应拜师，只把荒山方向记下。柯镇恶没有强留。柯镇恶：\"不入门便不必守我们的规矩，但今夜若听见动静，莫往山上凑。\"",
            transition: { type: "goto", nodeId: "blackwind-omens" },
          },
        ],
      },
      "blackwind-omens": {
        id: "blackwind-omens",
        title: "骷髅成阵",
        text: "午夜荒山上，二十七颗骷髅排成三座小塔，每个头骨顶上都有五个指孔。柯镇恶认出这是黑风双煞练功留下的阵势，命六个弟妹埋伏。郭靖仍按约独自上山，雷云也正从西边压过来。",
        autoNext: { type: "goto", nodeId: "blackwind-night" },
      },
      "blackwind-night": {
        id: "blackwind-night",
        title: "黑风夜",
        text: "梅超风以活人试掌，江南七怪随即围攻。柯镇恶的毒菱打瞎她双眼，陈玄风却在雷雨中赶到。韩小莹下山接郭靖时被陈玄风截住，张阿生已经扑到她身前替她挡下九阴白骨爪。",
        choices: [
          {
            id: "pull-guojing-clear",
            text: "先拉开郭靖",
            description: "孩子被陈玄风挟住，先替七怪保住人。",
            consumeDay: true,
            consequences: [
              { kind: "relation", npcId: "guojing", delta: 10 },
              { kind: "reputation", delta: 2 },
            ],
            resultText: "你借电光扑到近前，扯住郭靖衣领往外拖。陈玄风反手来抓，郭靖在慌乱中拔出短剑，剑锋正刺入他腹部罩门。",
            transition: { type: "goto", nodeId: "blackwind-aftermath" },
          },
          {
            id: "shield-zhang",
            text: "替张阿生挡一掌",
            description: "他已为救韩小莹重伤，至少替他抢回说完最后几句话的时间。",
            consumeDay: true,
            consequences: [
              { kind: "hp", delta: -20 },
              { kind: "reputation", delta: 4 },
              { kind: "relation", npcId: "guojing", delta: 8 },
              { kind: "npcTag", npcId: "zhangasheng", tag: "临终时受玩家援手" },
            ],
            resultText: "你撞开陈玄风补来的一掌，把张阿生拖出爪势。张阿生伤势已不可救，却还能撑到雨停，亲眼看郭靖向自己磕头拜师。",
            transition: { type: "goto", nodeId: "blackwind-aftermath" },
          },
          {
            id: "help-mei-escape",
            text: "替梅超风留退路",
            description: "趁七怪救伤时挪开一侧兵刃，让她带陈玄风尸身离开。",
            consumeDay: true,
            consequences: [
              { kind: "karma", delta: -4 },
              { kind: "relation", npcId: "meichaofeng", delta: 12 },
              { kind: "relation", npcId: "guojing", delta: -6 },
              { kind: "npcTag", npcId: "meichaofeng", tag: "大漠欠玩家一份人情" },
            ],
            resultText: "你把落在山道上的长矛踢开。梅超风双目流血，仍循声抱起陈玄风尸身。她经过你身侧时停了半步。梅超风：\"今日这条路，我记下了。\"",
            transition: { type: "goto", nodeId: "blackwind-aftermath" },
          },
          {
            id: "copy-scripture",
            text: "拓下残缺图式",
            description: "不拿整张人皮，只趁混乱拓下露在破口外的几句经文。",
            consumeDay: true,
            consequences: [
              { kind: "karma", delta: -3 },
              { kind: "item", id: "jiuyin-fragment-rubbing" },
              { kind: "aptitude", delta: 2 },
            ],
            resultText: "陈玄风倒下时，胸前破口露出一角经文。你只来得及拓下几处经脉和倒乱口诀，梅超风已经循声扑回，把尸身与原物一并带走。",
            transition: { type: "goto", nodeId: "blackwind-aftermath" },
          },
        ],
      },
      "blackwind-aftermath": {
        id: "blackwind-aftermath",
        title: "雨停之后",
        text: "雷雨过去，陈玄风已死，梅超风带着尸身失去踪影。张阿生伤重不治，临终前让郭靖先行拜师，只嘱咐他肯下苦功、为人先顾侠义。六怪把兄弟葬在荒山，随后留在大漠教郭靖成人。",
        onEnter: [
          { kind: "npcTag", npcId: "guojing", tag: "误杀陈玄风" },
          { kind: "npcTag", npcId: "meichaofeng", tag: "大漠失明" },
          { kind: "npcAlive", npcId: "zhangasheng", alive: false },
        ],
        autoNext: { type: "goto", nodeId: "growth-seasons" },
      },
      "growth-seasons": {
        id: "growth-seasons",
        title: "十年功课",
        text: "七怪在大漠住下。白天，郭靖跟哲别练骑射、帮李萍放牧；夜里再到六位师父帐中练拳剑、暗器与兵刃。草原一年分成风雪、春牧、夏猎和秋收，你不可能样样精通，只能决定把最多时间放在哪里。",
        choices: [
          {
            id: "train-with-freaks",
            text: "跟六怪磨基本功",
            description: "守夜课、跑桩、拆招，把笨功夫一遍遍练熟。",
            condition: {
              kind: "or",
              items: [
                { kind: "flag", name: "shendiao.damos.training", eq: "seven-freaks" },
                { kind: "flag", name: "shendiao.damos.training", eq: "companion" },
              ],
            },
            consumeDay: true,
            consequences: [
              { kind: "flag", name: "shendiao.damos.growth", value: "martial" },
              { kind: "attack", delta: 3 },
              { kind: "reputation", delta: 2 },
              { kind: "relation", npcId: "guojing", delta: 8 },
            ],
            resultText: "你与郭靖轮流挨六怪纠正。朱聪教变招，南希仁只让你们把一套掌法练到脚下不乱。多年下来，招式未必花巧，出手和站桩却都扎实了。",
            transition: { type: "goto", nodeId: "growth-years" },
          },
          {
            id: "ride-with-jebe",
            text: "跟哲别练骑射",
            description: "学会在风沙、奔马和乱阵里仍把箭送到该去的地方。",
            consumeDay: true,
            consequences: [
              { kind: "flag", name: "shendiao.damos.growth", value: "riding" },
              { kind: "speed", delta: 3 },
              { kind: "factionAttitude", factionId: "mongol", delta: 8 },
              { kind: "relation", npcId: "zhebie", delta: 8 },
            ],
            resultText: "哲别不教空靶，只让你在奔马、逆风与夜色里射箭。射偏便自己去找，摔下马也自己爬起。营中骑兵逐渐愿意让你参加巡哨。",
            transition: { type: "goto", nodeId: "growth-years" },
          },
          {
            id: "share-liping-work",
            text: "帮李萍撑起营生",
            description: "放牧、找水、过冬和照看伤兵，把草原生活先过稳。",
            consumeDay: true,
            consequences: [
              { kind: "flag", name: "shendiao.damos.growth", value: "survival" },
              { kind: "hp", delta: 35 },
              { kind: "relation", npcId: "liping", delta: 15 },
              { kind: "relation", npcId: "guojing", delta: 6 },
            ],
            resultText: "你记下冬季水眼、狼道和各部迁营时间，也替李萍照看过受伤牧人。营里人不再只叫你汉人，遇到断粮、失马和风雪封路，也会来问你一句。",
            transition: { type: "goto", nodeId: "growth-years" },
          },
          {
            id: "remain-free",
            text: "在各方之间游历",
            description: "不固定师承，替商队带路，也从汉人旧客口中打听中原。",
            consumeDay: true,
            consequences: [
              { kind: "flag", name: "shendiao.damos.growth", value: "free" },
              { kind: "aptitude", delta: 3 },
              { kind: "reputation", delta: 1 },
            ],
            resultText: "你随商队走过几条牧道，也替流落草原的汉人送过口信。各家武艺只看得零碎，中原地名与南下路线却记得比旁人清楚。",
            transition: { type: "goto", nodeId: "growth-years" },
          },
        ],
      },
      "growth-years": {
        id: "growth-years",
        title: "岁月在马蹄间",
        text: "大漠的年月按迁营与风雪计算。郭靖从放羊孩子长成粗壮少年，仍是别人教十遍便练十遍，从不拿资质作借口。铁木真部众逐年壮大，王罕与桑昆的使者也越来越常出现在营地边缘。",
        autoNext: { type: "goto", nodeId: "mayu-cliff" },
      },
      "mayu-cliff": {
        id: "mayu-cliff",
        title: "马钰夜授",
        text: "白雕巢下，一个三髻道人救下两只幼雕，又让郭靖在月圆之夜攀上绝壁。道人自称马钰，只教呼吸、静坐、行路与睡觉，不传招式，也不肯占江南七怪的师名。你在崖下遇见他时，他正把长索垂给半山的郭靖。",
        choices: [
          {
            id: "learn-breathing",
            text: "求教吐纳",
            description: "不求招式，只按他的方法把呼吸与脚步练稳。",
            consumeDay: true,
            consequences: [
              { kind: "mp", delta: 20 },
              { kind: "aptitude", delta: 2 },
              { kind: "factionAttitude", factionId: "quanzhen", delta: 10 },
            ],
            resultText: "马钰先看你走了一段崖路，只改了呼吸和落脚时机。马钰：\"招式已有来处，贫道不添一门。先把气息练得不断，原来的功夫自然使得出来。\"",
            transition: { type: "goto", nodeId: "mayu-result" },
          },
          {
            id: "guard-secret",
            text: "替郭靖守口",
            description: "六怪尚不知道此事，先替马钰守住崖下。",
            consumeDay: true,
            consequences: [
              { kind: "relation", npcId: "guojing", delta: 8 },
              { kind: "factionAttitude", factionId: "quanzhen", delta: 5 },
              { kind: "reputation", delta: 1 },
            ],
            resultText: "你替两人看住巡骑和夜行牧人。马钰没有许诺别的，只在离开前说，若六怪追问，他会亲自解释，不让孩子独自担责。",
            transition: { type: "goto", nodeId: "mayu-result" },
          },
          {
            id: "tell-six-freaks",
            text: "请他明示六怪",
            description: "暗中相授终会引起误会，不如尽早把界限说清。",
            consumeDay: true,
            consequences: [
              { kind: "reputation", delta: 3 },
              { kind: "relation", npcId: "guojing", delta: 5 },
              { kind: "factionAttitude", factionId: "quanzhen", delta: 4 },
            ],
            resultText: "马钰没有责怪。马钰：\"你说得对。贫道原想少生争执，藏得久了，反倒像有意夺徒。待郭靖根基稍稳，我亲自去见六侠。\"",
            transition: { type: "goto", nodeId: "mayu-result" },
          },
          {
            id: "ask-quanzhen-path",
            text: "询问全真门径",
            description: "自己未入七怪门下，可请马钰留下正式投门的机会。",
            condition: { kind: "flag", name: "shendiao.damos.training", eq: "free" },
            consumeDay: true,
            consequences: [
              { kind: "factionAttitude", factionId: "quanzhen", delta: 12 },
              { kind: "flag", name: "shendiao.damos.quanzhen-contact", value: true },
            ],
            resultText: "马钰没有当场收徒，只让你记下终南山重阳宫。马钰：\"今夜肯爬崖，不等于肯守门规。日后到了山门，再由执事问你一路所为。\"",
            transition: { type: "goto", nodeId: "mayu-result" },
          },
        ],
      },
      "mayu-result": {
        id: "mayu-result",
        title: "不争师名",
        text: "马钰后来亲自向江南六怪说明，自己只补郭靖内功根基，不传招式，也不列师徒名分。六怪虽有疑虑，仍承认这番指点没有坏掉十八年之约。郭靖白日练拳剑，夜里调息攀崖，原先使不到的劲力终于渐渐接上。",
        onEnter: [
          { kind: "npcTag", npcId: "guojing", tag: "马钰传授吐纳" },
        ],
        autoNext: { type: "goto", nodeId: "eagle-shot" },
      },
      "eagle-shot": {
        id: "eagle-shot",
        title: "弯弓射雕",
        text: "悬崖上一对白雕遭黑雕围攻，成鸟死伤后，两只幼雕也暴露在巢口。铁木真与诸将接连开弓，余下黑雕却已飞得极高。哲别把自己的强弓交给郭靖，只提醒一句。哲别：\"跪下，射项颈。\"",
        choices: [
          {
            id: "call-wind",
            text: "替郭靖测风",
            description: "盯住高处羽毛偏向，报出横风变化。",
            consumeDay: true,
            consequences: [
              { kind: "aptitude", delta: 2 },
              { kind: "relation", npcId: "guojing", delta: 6 },
            ],
            resultText: "你报出横风转弱的瞬间。郭靖右膝跪地，等两头黑雕比翼掠过才松弦。长箭先穿一雕项颈，余势又贯入第二头黑雕腹中，两雕一同坠下。",
            transition: { type: "goto", nodeId: "main" },
          },
          {
            id: "guard-young-eagles",
            text: "护住崖下幼雕",
            description: "先把落下的碎石与伤雕引开，免得幼雕坠崖。",
            consumeDay: true,
            consequences: [
              { kind: "reputation", delta: 3 },
              { kind: "relation", npcId: "huazheng", delta: 4 },
            ],
            resultText: "你与华筝守在崖下，把受伤黑雕赶离幼巢。头顶弓弦骤响，郭靖一箭贯穿两雕。华筝抬头看见黑影坠落，立刻跑去接住哲别交回的弓袋。",
            transition: { type: "goto", nodeId: "main" },
          },
          {
            id: "watch-tactics",
            text: "观察雕群合击",
            description: "铁木真正借雕群进退向诸子讲解诱敌与回援。",
            consumeDay: true,
            consequences: [
              { kind: "aptitude", delta: 2 },
              { kind: "factionAttitude", factionId: "mongol", delta: 3 },
            ],
            resultText: "你记下黑雕先退后返、专攻落单白雕的次序。铁木真尚在讲侧翼合围，郭靖已经接过哲别强弓，一箭穿过两头并飞黑雕。",
            transition: { type: "goto", nodeId: "main" },
          },
        ],
      },
      main: {
        id: "main",
        title: "十年之后",
        text: "草原风卷着沙砾，郭靖已长成粗壮少年，正在六位师父面前练拳。柯镇恶以铁杖顿地。柯镇恶：\"脚下又乱了。重来！\"郭靖才重新起势，远处忽有牧人惊呼。一只苍鹰抓起羊羔贴着草坡掠过，他转身取弓，弦响过后，长箭擦过鹰爪，羊羔滚进草丛。",
        choices: [
          {
            id: "guide", text: "上前指点", description: "指出他下盘发力的破绽。",
            consequences: [
              { kind: "reputation", delta: 2 },
              { kind: "aptitude", delta: 1 },
              { kind: "relation", npcId: "guojing", delta: 12 },
            ],
            consumeDay: true,
            resultText: "你压住郭靖的手肘，让他把重心再沉半寸。他照着重练一遍，拳到末势，脚下不再虚浮。柯镇恶没有夸他，只用铁杖在地上点了两下。柯镇恶：\"靖儿，记住这几步。\"",
            transition: { type: "goto", nodeId: "drill" },
          },
          {
            id: "spar", text: "切磋比试", description: "与少年过几招，试试他的斤两。",
            consequences: [
              { kind: "attack", delta: 2 },
              { kind: "relation", npcId: "guojing", delta: 5 },
            ],
            consumeDay: true,
            resultText: "你下场与少年拆了十余招。他每一拳都打得扎实，临敌变招却慢了半拍。你侧身避开一记直拳，反手在他肩头轻轻一拍。郭靖退开两步，又认真摆好架势。郭靖：\"我总接不住你的变招。能不能再来一次？\"这一回，你也得把刚才用过的招法重新想一遍。",
            transition: { type: "goto", nodeId: "drill" },
          },
          {
            id: "befriend", text: "歇火叙旧", description: "递上一碗马奶酒，说说这些年各自走过的路。",
            consequences: [
              { kind: "reputation", delta: 3 },
              { kind: "hp", delta: 20 },
              { kind: "item", id: "field-ration", count: 2 },
              { kind: "relation", npcId: "guojing", delta: 20 },
              { kind: "npcRelationType", npcId: "guojing", relationType: "朋友" },
            ],
            consumeDay: true,
            resultText: "郭靖双手接过酒碗，说起哲别的箭、六位师父的夜课和母亲这些年的辛苦。郭靖：\"师父们教十遍，我便练十遍。练不会，再从第一遍来。\"他饮完又替你添满。",
            transition: { type: "goto", nodeId: "drill" },
          },
          {
            id: "ask-short-sword",
            text: "问起杨康短剑",
            description: "当年亲眼见过两家换剑，此刻可用只有旧人知道的细节证明身份。",
            condition: { kind: "flag", name: "shendiao.niujia.witnessed_sword_oath", eq: true },
            consequences: [
              { kind: "relation", npcId: "guojing", delta: 15 },
              { kind: "npcRelationType", npcId: "guojing", relationType: "朋友" },
            ],
            consumeDay: true,
            resultText: "你说出两柄短剑刻名相反、交换时由两位夫人各自收好的细节。李萍从帐中取出刻着杨康二字的短剑。郭靖看过母亲神色，重新向你抱拳。郭靖：\"这件事，娘只对我说过。\"",
            transition: { type: "goto", nodeId: "drill" },
          },
        ],
      },
      drill: {
        id: "drill",
        title: "大漠·江南七怪",
        text: "入夜后，郭靖仍在篝火旁练拳。韩小莹替他把散在地上的箭一支支收回箭囊。韩小莹：\"今日这套拳比昨日稳了，只是转身仍慢。\"柯镇恶面向火堆，铁杖横在膝前。柯镇恶：\"慢便多练。既收了徒弟，就没有嫌他资质的道理。靖儿，再来！\"郭靖重新站回草地。其余六怪也都留在火旁。",
        autoNext: { type: "goto", nodeId: "sangkun-plot" },
        onEnter: [{ kind: "reputation", delta: 1 }],
      },
      "sangkun-plot": {
        id: "sangkun-plot",
        title: "桑昆帐外",
        text: "王罕催办华筝与都史婚事，桑昆却在帐中与札木合、完颜洪烈商议伏杀铁木真。郭靖随马钰追踪梅超风时听见了全盘计划：假借议婚请铁木真轻骑赴会，再以几路兵马截断退路。华筝已骑马去报信，但铁木真未必肯信。",
        choices: [
          {
            id: "carry-warning",
            text: "替华筝送第二路信",
            description: "从另一条牧道赶回本营，避免第一名信使被截。",
            condition: {
              kind: "or",
              items: [
                { kind: "flag", name: "shendiao.damos.growth", eq: "riding" },
                { kind: "flag", name: "shendiao.damos.growth", eq: "survival" },
              ],
            },
            consumeDay: true,
            consequences: [
              { kind: "relation", npcId: "huazheng", delta: 10 },
              { kind: "factionAttitude", factionId: "mongol", delta: 8 },
              { kind: "npcTag", npcId: "temujin", tag: "玩家参与桑昆预警" },
            ],
            resultText: "你从旧牧道绕回本营，把桑昆沿路设伏的位置交给拖雷。华筝已经先一步报过信，却被父亲当成不愿出嫁的托词。第二份路线图让留营诸将开始集结。",
            transition: { type: "goto", nodeId: "sangkun-siege" },
          },
          {
            id: "scout-ambush",
            text: "先查伏兵位置",
            description: "不抢郭靖报信的功劳，去确认哪条退路还没封死。",
            consumeDay: true,
            consequences: [
              { kind: "aptitude", delta: 2 },
              { kind: "reputation", delta: 2 },
              { kind: "npcTag", npcId: "temujin", tag: "玩家查明桑昆伏兵" },
            ],
            resultText: "你沿土山外围查出三处伏兵和一段尚未合拢的缺口，再把位置刻在箭杆上送进山中。郭靖此时已经骑小红马追上铁木真，当面说出帐中密谋。",
            transition: { type: "goto", nodeId: "sangkun-siege" },
          },
          {
            id: "mislead-jin",
            text: "向王府报假路",
            description: "仍保留王府身份，可把铁木真的真实退路换成一条废牧道。",
            condition: { kind: "flag", name: "shendiao.niujia.departure", eq: "jin-retinue" },
            consumeDay: true,
            consequences: [
              { kind: "factionAttitude", factionId: "jin", delta: -8 },
              { kind: "factionAttitude", factionId: "mongol", delta: 6 },
              { kind: "relation", npcId: "guojing", delta: 5 },
              { kind: "npcTag", npcId: "temujin", tag: "玩家以王府身份误导追兵" },
            ],
            resultText: "你把废牧道指给完颜洪烈的亲随。两队追兵被引进盐碱地，真正围向土山的兵力少了一角；王府暂时还不知道消息是你送错的。",
            transition: { type: "goto", nodeId: "sangkun-siege" },
          },
        ],
      },
      "sangkun-siege": {
        id: "sangkun-siege",
        title: "土山合围",
        text: "铁木真带着数百亲兵退守土山，桑昆与札木合的军马已经围住四面。郭靖骑小红马冲入敌阵，擒住都史作为人质，替山上争得谈判时间；拂晓前，完颜洪烈又命亲兵与黄河四鬼从侧坡强攻。",
        choices: [
          {
            id: "guard-flank",
            text: "守住侧坡",
            description: "用这些年磨出的近身功夫拦下桑昆亲兵。",
            condition: { kind: "flag", name: "shendiao.damos.growth", eq: "martial" },
            consumeDay: true,
            resultText: "你与六怪守住侧坡，让郭靖能留在正面保护铁木真与都史人质。桑昆亲兵已经弃马冲到近前。",
            transition: {
              type: "battle",
              enemyId: "sangkun-guard",
              onWin: {
                text: "侧坡亲兵被逼退，拖雷带来的援军也在远处扬起大片尘土。敌军误以为蒙古主力尽出，包围开始松动。",
                consequences: [
                  { kind: "reputation", delta: 5 },
                  { kind: "factionAttitude", factionId: "mongol", delta: 10 },
                  { kind: "relation", npcId: "guojing", delta: 8 },
                ],
                then: { type: "goto", nodeId: "counterattack" },
              },
              onLose: {
                text: "你负伤退回山顶，侧坡险些失守。郭靖与哲别分兵补上缺口，拖雷的援军随后赶到，众人才冲开包围。",
                consequences: [
                  { kind: "hp", delta: -20 },
                  { kind: "factionAttitude", factionId: "mongol", delta: 3 },
                ],
                then: { type: "goto", nodeId: "counterattack" },
              },
              onFlee: {
                text: "你从侧坡撤回后方，郭靖与六怪接手缺口。援军到来后，铁木真仍率众突围，但军中没有把这处侧坡记在你的功劳簿上。",
                then: { type: "goto", nodeId: "counterattack" },
              },
            },
          },
          {
            id: "open-water-route",
            text: "从暗水沟接援军",
            description: "利用多年记下的水眼和牧道，把拖雷部队引到包围薄弱处。",
            condition: { kind: "flag", name: "shendiao.damos.growth", eq: "survival" },
            consumeDay: true,
            consequences: [
              { kind: "factionAttitude", factionId: "mongol", delta: 12 },
              { kind: "reputation", delta: 4 },
              { kind: "item", id: "mongol-wolf-tally" },
            ],
            resultText: "你从干涸水沟穿出包围，找到拖雷的年轻骑兵，再沿低地把他们带到桑昆左翼。马尾拖起的树枝扬起大片尘土，围军误判援军数目，阵脚先乱了一层。",
            transition: { type: "goto", nodeId: "counterattack" },
          },
          {
            id: "shoot-signal",
            text: "射断号旗",
            description: "让桑昆几路兵马无法同时向土山压上。",
            consumeDay: true,
            consequences: [
              { kind: "speed", delta: 1 },
              { kind: "reputation", delta: 3 },
              { kind: "factionAttitude", factionId: "mongol", delta: 6 },
            ],
            resultText: "你与哲别轮流盯住传令骑兵，接连射断两面号旗。山下几路军马先后错过冲锋时机，郭靖也得以在敌阵中把都史带回土山。",
            transition: { type: "goto", nodeId: "counterattack" },
          },
          {
            id: "serve-jin-plan",
            text: "按王府密令不出手",
            description: "保住金国身份，让郭靖和蒙古人独自应付这场围杀。",
            condition: { kind: "flag", name: "shendiao.niujia.departure", eq: "jin-retinue" },
            consumeDay: true,
            consequences: [
              { kind: "factionAttitude", factionId: "jin", delta: 10 },
              { kind: "factionAttitude", factionId: "mongol", delta: -15 },
              { kind: "relation", npcId: "guojing", delta: -12 },
              { kind: "npcTag", npcId: "guojing", tag: "桑昆之局中与玩家立场相悖" },
            ],
            resultText: "你留在王府亲随之后，没有向土山射出一箭。郭靖、哲别和拖雷仍合力救出铁木真，撤退时郭靖隔着乱军认出了你，却没有停马。",
            transition: { type: "goto", nodeId: "counterattack" },
          },
        ],
      },
      counterattack: {
        id: "counterattack",
        title: "反客为主",
        text: "突围后，铁木真没有立刻追杀桑昆。他先放回都史、送去厚礼，又假装胸口箭伤难愈；等王罕撤掉戒备，蒙古兵才分三路夜袭。桑昆与王罕兵败，札木合旧部也相继归附。斡难河源大会上，各部推举铁木真为成吉思汗。",
        autoNext: { type: "goto", nodeId: "golden-knife" },
      },
      "golden-knife": {
        id: "golden-knife",
        title: "金刀与首功",
        text: "庆功帐中，成吉思汗把土山救援首功记在郭靖名下，当众赐下金刀，并宣布将华筝许配给郭靖。郭靖站在帐中没有答话，只先看向母亲与六位师父。玩家无论做过侧翼、传讯还是接援，都只按实际协力另行受赏。",
        choices: [
          {
            id: "congratulate-guojing",
            text: "向郭靖道贺",
            description: "首功本就由他立下，先把自己的协力与婚约分开。",
            consumeDay: true,
            consequences: [
              { kind: "relation", npcId: "guojing", delta: 10 },
              { kind: "relation", npcId: "huazheng", delta: 3 },
              { kind: "item", id: "mongol-wolf-tally" },
              { kind: "factionAttitude", factionId: "mongol", delta: 8 },
            ],
            resultText: "你先向郭靖敬了一碗酒。郭靖接过酒却仍有些发怔。郭靖：\"大汗的赏赐太重，我得先问母亲和师父。你守过侧翼的功劳，也不能不算。\"铁木真随后命人给你一枚苍狼铜符。",
            transition: { type: "goto", nodeId: "farewell" },
          },
          {
            id: "accept-service-token",
            text: "只领军务铜符",
            description: "接受共同作战的封赏，不碰华筝婚约。",
            consumeDay: true,
            consequences: [
              { kind: "item", id: "mongol-wolf-tally" },
              { kind: "factionAttitude", factionId: "mongol", delta: 12 },
              { kind: "reputation", delta: 4 },
              { kind: "npcTag", npcId: "temujin", tag: "愿将军务托给玩家" },
            ],
            resultText: "你只接下调动驿骑的铜符，没有接受别的封赏。铁木真把铜符按在你掌中。铁木真：\"能办事的人不一定都做我的将军。拿着它，草原驿骑会认你。\"",
            transition: { type: "goto", nodeId: "farewell" },
          },
          {
            id: "decline-reward",
            text: "谢绝封赏",
            description: "说明自己只是还旧恩，不准备在蒙古军中任职。",
            consumeDay: true,
            consequences: [
              { kind: "karma", delta: 3 },
              { kind: "relation", npcId: "guojing", delta: 8 },
              { kind: "factionAttitude", factionId: "mongol", delta: 3 },
            ],
            resultText: "你把酒饮尽，只认这场援手是还草原多年的收留与旧情。铁木真没有强留。铁木真：\"不领军职，也不等于不是朋友。以后见到我的旗，仍可进帐。\"",
            transition: { type: "goto", nodeId: "farewell" },
          },
        ],
      },
      farewell: {
        id: "farewell",
        title: "整鞍南去",
        text: "六怪已备好南下马匹。郭靖要赴嘉兴十八年之约，也要追查段天德和完颜洪烈；李萍留在草原等他回来处理婚事。你在大漠住过这些年，也得决定从哪条路离开。",
        choices: [
          {
            id: "travel-with-guojing",
            text: "与郭靖同行",
            description: "随六怪一起南下，沿途照应。",
            consumeDay: true,
            consequences: [
              { kind: "flag", name: "shendiao.damos.departure", value: "with-guojing" },
              { kind: "relation", npcId: "guojing", delta: 8 },
              { kind: "item", id: "field-ration", count: 2 },
              { kind: "arcBeat", arcId: "shendiao", beat: "damos", result: "done" },
              { kind: "arcBeat", arcId: "shendiao", beat: "act2-damos", result: "done" },
            ],
            resultText: "你把行囊系上马鞍，与郭靖和六怪同日离营。郭靖将南下地图折成两份，一份交给你。郭靖：\"路上若走散，先在张家口等。\"",
            transition: { type: "goto", nodeId: "southbound-end" },
          },
          {
            id: "leave-ahead",
            text: "提前独自南下",
            description: "比郭靖先走几日，自己安排中原入口。",
            consumeDay: true,
            consequences: [
              { kind: "flag", name: "shendiao.damos.departure", value: "ahead" },
              { kind: "aptitude", delta: 2 },
              { kind: "reputation", delta: 2 },
              { kind: "arcBeat", arcId: "shendiao", beat: "damos", result: "done" },
              { kind: "arcBeat", arcId: "shendiao", beat: "act2-damos", result: "done" },
            ],
            resultText: "你先沿商道离营，避开蒙古大队常走的驿路。郭靖把一枚旧护符交给你，只让你到了中原后留下能认路的记号。",
            transition: { type: "goto", nodeId: "independent-end" },
          },
          {
            id: "remain-grassland",
            text: "暂留草原军务",
            description: "先把铜符与军中承诺处理完，再自行南下。",
            consumeDay: true,
            consequences: [
              { kind: "flag", name: "shendiao.damos.departure", value: "grassland-duty" },
              { kind: "factionAttitude", factionId: "mongol", delta: 10 },
              { kind: "relation", npcId: "huazheng", delta: 5 },
              { kind: "arcBeat", arcId: "shendiao", beat: "damos", result: "done" },
              { kind: "arcBeat", arcId: "shendiao", beat: "act2-damos", result: "done" },
            ],
            resultText: "你留在营中交还军马、清点伤兵和驿骑。郭靖随六怪先走，临行前约你日后在中原会合。",
            transition: { type: "goto", nodeId: "grassland-end" },
          },
          {
            id: "follow-quanzhen",
            text: "循全真线回中原",
            description: "马钰曾留下终南山门径，可先往全真回流。",
            condition: { kind: "flag", name: "shendiao.damos.quanzhen-contact", eq: true },
            consumeDay: true,
            consequences: [
              { kind: "flag", name: "shendiao.damos.departure", value: "quanzhen" },
              { kind: "factionAttitude", factionId: "quanzhen", delta: 8 },
              { kind: "arcBeat", arcId: "shendiao", beat: "damos", result: "done" },
              { kind: "arcBeat", arcId: "shendiao", beat: "act2-damos", result: "done" },
            ],
            resultText: "你没有跟六怪同路，而是带着马钰留下的山门口信向终南方向出发。郭靖替你备好水囊，也没有追问门派选择。",
            transition: { type: "goto", nodeId: "quanzhen-end" },
          },
        ],
      },
      "southbound-end": {
        id: "southbound-end",
        title: "同路南归",
        text: "马队离开草原时，拖雷、华筝与哲别都来送行。郭靖与他们逐一拥抱，随后跟上六怪。众人沿商道南去，大漠在身后渐渐退成一线。",
        autoNext: { type: "end" },
      },
      "independent-end": {
        id: "independent-end",
        title: "先行一步",
        text: "你独自越过南边关道，先于郭靖一行进入汉地。身上带着大漠十年的旧关系，也保留着自行决定下一站的余地。",
        autoNext: { type: "end" },
      },
      "grassland-end": {
        id: "grassland-end",
        title: "军务未了",
        text: "郭靖与六怪已经南下，你仍在草原停留一段时间。苍狼铜符让各处驿骑认得你，华筝与拖雷也知道你终究会往中原去。",
        autoNext: { type: "end" },
      },
      "quanzhen-end": {
        id: "quanzhen-end",
        title: "终南方向",
        text: "你沿着马钰说过的路线离开大漠。终南山在南下途中偏西，这条路不会与郭靖完全同行，却仍会在中原旧案附近重新交汇。",
        autoNext: { type: "end" },
      },
    },
  },

  ...SHENDIAO_ACT3_STORY,
  ...SHENDIAO_ACT4_STORY,
  ...SHENDIAO_ACT5_STORY,
  ...SHENDIAO_ACT6_STORY,

  // ===== 3. 中原·客栈奇缘 =====
  {
    id: "shendiao-meet-rong",
    entryNode: "approach",
    locationId: "linan",
    weight: 5,
    once: true,
    condition: {
      kind: "and",
      items: [
        { kind: "arcBeat", arcId: "shendiao", beat: "damos" },
        { kind: "not", item: { kind: "flag", name: "shendiao.zhongdu.reworked", eq: true } },
      ],
    },
    nodes: {
      approach: {
        id: "approach",
        title: "南下之后",
        text: "离开大漠以后，中原驿路、关隘与城镇重新挤进视野。郭靖和六怪也已南下，只是你们抵达江南的先后与身份并不相同。",
        autoNext: {
          type: "branch",
          cases: [
            {
              when: { kind: "flag", name: "shendiao.damos.departure", eq: "with-guojing" },
              then: { type: "goto", nodeId: "approach-together" },
            },
            {
              when: { kind: "flag", name: "shendiao.damos.departure", eq: "ahead" },
              then: { type: "goto", nodeId: "approach-ahead" },
            },
            {
              when: { kind: "flag", name: "shendiao.damos.departure", eq: "grassland-duty" },
              then: { type: "goto", nodeId: "approach-late" },
            },
            {
              when: { kind: "flag", name: "shendiao.damos.departure", eq: "quanzhen" },
              then: { type: "goto", nodeId: "approach-quanzhen" },
            },
          ],
          else: { type: "goto", nodeId: "main" },
        },
      },
      "approach-together": {
        id: "approach-together",
        title: "同行入关",
        text: "你与郭靖、六怪同路入关，到了江南城外才分头投店找马。郭靖说安顿好师父便来寻你，没想到先在另一家客栈被一个小乞丐留住。",
        autoNext: { type: "goto", nodeId: "main" },
      },
      "approach-ahead": {
        id: "approach-ahead",
        title: "先到一步",
        text: "你比郭靖一行早到江南数日，已经认过城门、驿站和几家客栈。等大漠马队进城时，你正坐在城外客栈听人议论一个出手阔绰的北方青年。",
        autoNext: { type: "goto", nodeId: "main" },
      },
      "approach-late": {
        id: "approach-late",
        title: "草原来客",
        text: "处理完草原军务后，你持苍狼铜符独自南下。郭靖已经先到江南，客栈伙计说那个北方青年近日总与一个满脸煤灰的小乞丐同桌。",
        autoNext: { type: "goto", nodeId: "main" },
      },
      "approach-quanzhen": {
        id: "approach-quanzhen",
        title: "终南回流",
        text: "你先绕道终南山递过马钰口信，再转向江南。全真门人带来的消息比郭靖慢半程，等你进城时，他已在城外客栈结识了一个来历不明的小乞丐。",
        autoNext: { type: "goto", nodeId: "main" },
      },
      main: {
        id: "main",
        title: "中原·客栈奇缘",
        text: "临安城外的客栈里，一个满脸煤灰的小乞丐独占了半张桌子，面前摆着鲜鱼、荷叶鸡和四样点心。小乞丐夹起一筷鱼肉，只尝一口便放下。小乞丐：\"火候老了。小二，这盘不算钱。\"邻桌青年急忙去摸钱袋，抬头时正与你撞个照面。竟是郭靖。",
        choices: [
          {
            id: "chat", text: "上前搭话", description: "与郭靖重逢，也会一会这名小乞丐。",
            consequences: [
              { kind: "relation", npcId: "huangrong", delta: 10 },
              { kind: "relation", npcId: "guojing", delta: 8 },
            ],
            consumeDay: true,
            resultText: "郭靖起身替你拉开长凳，连声说起大漠分别后的事。小乞丐却把筷子搁在碗沿，接连问了你的来处、师承和进城缘由。你答到第三句时，他忽然笑了。小乞丐：\"前两句是真的，第三句留了一半。你这人还算有趣。\"郭靖没听出试探，只招呼小二再添一副碗筷。",
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
            resultText: "你在柜上压下银钱。小乞丐等小二走远，才用筷尾轻轻敲了敲桌面。小乞丐：\"无功不受禄。你请这一桌，是认得这位郭兄，还是想从我这里问什么？\"郭靖刚要解释，他已经把一碟点心推到你面前。",
            transition: { type: "goto", nodeId: "reveal" },
          },
          {
            id: "observe", text: "静观不语", description: "这两人来历不凡，不贸然搭讪。",
            consequences: [
              { kind: "aptitude", delta: 1 },
            ],
            consumeDay: true,
            resultText: "你留在原位。小乞丐一边挑剔菜色，一边套问郭靖南下后的见闻；郭靖问什么答什么，连钱袋里还剩几两银子也说了。片刻后，小乞丐忽然朝你这桌望来。小乞丐：\"那边的朋友，听了半天，不如过来坐。\"",
            transition: { type: "goto", nodeId: "reveal" },
          },
        ],
      },
      reveal: {
        id: "reveal",
        title: "真相·桃花岛上小东邪",
        text: "夜深后，客栈里只剩两桌客人。小乞丐摘下破帽，又用帕子擦去脸上的煤灰。郭靖握着茶碗，半晌没有出声。黄蓉：\"怎么，郭大哥认不出了？\"郭靖猛地站起，险些撞翻长凳。郭靖：\"你……你原来是位姑娘。\"黄蓉把长发束回脑后，转而看向你。黄蓉：\"我叫黄蓉，家在桃花岛。今日既坐过一桌，往后到了东海，报我的名字便是。\"",
        autoNext: { type: "end" },
        onEnter: [
          { kind: "arcBeat", arcId: "shendiao", beat: "meet-rong", result: "done" },
          { kind: "aptitude", delta: 1 },
          { kind: "relation", npcId: "huangrong", delta: 2 },
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
    condition: {
      kind: "and",
      items: [
        { kind: "arcBeat", arcId: "shendiao", beat: "meet-rong" },
        { kind: "not", item: { kind: "flag", name: "shendiao.zhongdu.reworked", eq: true } },
      ],
    },
    nodes: {
      main: {
        id: "main",
        title: "洪七公·叫花传功",
        text: "临安城外的松林里飘来烤鸡香气。一个老叫花盘腿坐在石上，左手抓鸡腿，右手还护着火边那只砂锅。黄蓉往锅里撒了一撮盐。洪七公：\"慢些，慢些！好汤不是这么糟蹋的。\"黄蓉：\"七公既嫌弃，便别喝第三碗。\"郭靖抱着一捆柴站在旁边，见你过来便招手让出位置。",
        choices: [
          {
            id: "join-feast", text: "入席同享", description: "在火边坐下，尝尝黄蓉煨的鸡汤。",
            consequences: [
              { kind: "relation", npcId: "hongqigong", delta: 8 },
              { kind: "relation", npcId: "huangrong", delta: 5 },
              { kind: "hp", delta: 30 },
            ],
            consumeDay: true,
            resultText: "你在火边坐下。黄蓉盛来一碗汤，洪七公却先伸筷夹走了碗里的笋尖。洪七公：\"小子，手慢便没得吃。\"他说归说，还是把剩下半只鸡推到你和郭靖中间。",
            transition: { type: "goto", nodeId: "feast" },
          },
          {
            id: "watch-silently", text: "远远观望", description: "此人武功深不可测，不贸然接近。",
            consequences: [
              { kind: "aptitude", delta: 2 },
              { kind: "reputation", delta: 1 },
            ],
            consumeDay: true,
            resultText: "你藏身暗处，只见老叫花吃完烧鸡后抬手拍了郭靖后背一掌。郭靖肩背一震，呼吸随即长了许多，额上的汗也慢慢落了下去。",
            transition: { type: "goto", nodeId: "feast" },
          },
          {
            id: "challenge", text: "上前请教", description: "报明来意，请洪七公看一遍掌法。",
            condition: { kind: "relation", npcId: "guojing", gte: 15 },
            consequences: [
              { kind: "relation", npcId: "hongqigong", delta: 15 },
            ],
            consumeDay: true,
            resultText: "你上前报明来意。洪七公把鸡骨头咬得咔嚓一响，上下打量你几眼。洪七公：\"饭还没吃，先来讨功夫。胆子不小。坐下，等老叫花吃饱再说。\"",
            transition: { type: "goto", nodeId: "feast" },
          },
        ],
      },
      feast: {
        id: "feast",
        title: "松林·降龙初现",
        text: "洪七公把最后一块鸡骨头丢进火里，起身拍净衣襟。洪七公：\"吃了蓉丫头这么多好菜，总得还她个人情。靖儿，过来。\"他沉肩出掌，地上松针被掌风推开一丈。郭靖照着起势，第一掌只震动几根枯枝。洪七公用竹棒点了点他的肘。洪七公：\"劲发七分，留三分回身，这才叫亢龙有悔。\"郭靖重新出掌时，树干终于猛地一震。洪七公转头看向你。洪七公：\"看了两遍还不下场，要等老叫花请你么？\"",
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
        text: "洪七公让你先打三遍惯用掌法，随后一棒敲在你肩头。洪七公：\"肩抬这么高，力气全漏了。沉肩，松肘，劲从脚底起。\"你照着他的口令重新运劲，第四掌推出时，火堆旁的灰烬被震开一圈。洪七公：\"这才像样。口诀记住，往后自己练。老叫花可没工夫天天盯着你。\"",
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
        text: "你远远看着洪七公传郭靖掌法。那掌力刚猛无俦，松枝断折声如爆竹。你虽未能亲学，却也把出掌时的起势、换气和收劲都看了个大概。",
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
    condition: {
      kind: "and",
      items: [
        { kind: "arcBeat", arcId: "shendiao", beat: "qigong" },
        { kind: "not", item: { kind: "flag", name: "shendiao.zhongdu.reworked", eq: true } },
      ],
    },
    nodes: {
      approach: {
        id: "approach",
        title: "赵王府·夜探藏经",
        text: "夜里潜到赵王府外，高墙深院一层层压在黑暗里，檐下灯火却还亮着。院中不时有人提灯巡过，甲叶声贴着墙根一路传远。",
        autoNext: { type: "goto", nodeId: "alarm" },
      },
      alarm: {
        id: "alarm",
        title: "赵王府·夜探藏经",
        text: "更深处忽然传来一阵凄厉怪笑，声音尖得像要把夜色划开。黄蓉提过，赵王府里藏着桃花岛叛徒梅超风的踪迹。",
        autoNext: { type: "goto", nodeId: "main" },
      },
      main: {
        id: "main",
        title: "赵王府·夜探藏经",
        text: "王府更鼓刚过三更。外院有两队护卫交替巡行，东侧书阁每隔片刻便有人送炭，西廊尽头却一直锁着门。墙内忽然传来铁链拖地声，紧接着是一声短促怪笑。留给你的空当只够选一条路。",
        choices: [
          {
            id: "steal", text: "深入盗书", description: "趁换岗空当，潜入常年落锁的西廊。",
            consequences: [{ kind: "karma", delta: -2 }],
            consumeDay: true,
            resultText: "你贴着西廊绕过守卫，用薄刃挑开门锁。暗室里堆着兵书与药匣，最下层木箱还压着一卷无名内功残篇。",
            transition: { type: "goto", nodeId: "inner-court" },
          },
          {
            id: "ambush", text: "引开护院", description: "在外院制造声响，截住落单的巡夜护院。",
            consumeDay: true,
            resultText: "你故意在外院碰响瓦片。一名护院提刀跃上屋脊。护院：\"三更半夜闯王府，留下姓名！\"",
            transition: {
              type: "battle", enemyId: "emingke",
              onWin: {
                text: "你卸下护院长刀，将人点倒在瓦脊背风处。他腰间除了几块碎银，还有一本记着换气法门的手札。",
                consequences: [
                  { kind: "gold", delta: 40 },
                  { kind: "item", id: "small-mp-pill", count: 1 },
                ],
                then: { type: "goto", nodeId: "escape" },
              },
              onLose: { text: "护院一刀劈断檐角，你落进院中，又被赶来的守卫围住。你撞翻灯架冲出侧门，身后铜锣很快响遍王府。", then: { type: "goto", nodeId: "escape" } },
              onFlee: { text: "你虚晃一招，踩着飞檐退入巷中。护院追到墙头时，只看见一片被风卷走的瓦灰。", then: { type: "goto", nodeId: "escape" } },
            },
          },
          {
            id: "retreat", text: "记路退走", description: "先记下换岗与门锁位置，改日再来。",
            consequences: [{ kind: "reputation", delta: 1 }],
            consumeDay: true,
            resultText: "你记下巡夜路线，趁两队护卫换岗时翻出高墙。片刻后，王府西院忽然亮起数盏灯，方才藏身的屋脊也有人提刀搜过。",
            transition: { type: "end" },
          },
        ],
      },
      "inner-court": {
        id: "inner-court",
        title: "王府·暗室惊变",
        text: "你刚把内功残卷收入怀中，身后的铁链忽然绷直。梅超风：\"脚步轻，呼吸却乱。谁派你来的？\"她双目紧闭，五指已经扣向你方才落脚的位置。木架被爪风扫中，当场碎开。",
        choices: [
          {
            id: "fight-meichaofeng", text: "迎战梅超风", description: "避无可避，唯有力战！",
            consumeDay: true,
            transition: {
              type: "battle", enemyId: "meichaofeng",
              onWin: {
                text: "你借木架挡住一爪，又从她身侧抢过半步。梅超风收势调息时，你撞开暗门冲进回廊。怀中残卷仍在，上面记着几句阳刚内息的周天法门。",
                consequences: [
                  { kind: "skill", id: "jiuyang" },
                  { kind: "mp", delta: 20 },
                  { kind: "reputation", delta: 4 },
                ],
                then: { type: "goto", nodeId: "escape" },
              },
              onLose: {
                text: "梅超风一爪扫中肩头，你当场撞倒木架。再醒来时已在城外破庙，肩伤被人草草包过，怀中残卷却不见了。",
                then: { type: "goto", nodeId: "escape" },
              },
              onFlee: {
                text: "你把残卷掷向另一侧，趁梅超风追声出爪时撞开暗门。卷册留在室内，王府回廊上的铜锣却已响起。",
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
            resultText: "你把一枚铜钱弹向墙角。梅超风立刻转身出爪，石壁上多出五道深痕。你趁她收招时钻出暗门，残卷也仍在怀中。",
            transition: { type: "goto", nodeId: "escape" },
          },
        ],
      },
      escape: {
        id: "escape",
        title: "王府·月下脱身",
        text: "你翻出王府高墙，落进巷口夜色。身后传来杨康的喊声，院里很快又响起一阵急促脚步。王府灯火接连亮起。",
        autoNext: { type: "end" },
        onEnter: [
          { kind: "arcBeat", arcId: "shendiao", beat: "wangfu", result: "done" },
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
    condition: {
      kind: "and",
      items: [
        { kind: "arcBeat", arcId: "shendiao", beat: "wangfu" },
        { kind: "not", item: { kind: "arcBeat", arcId: "shendiao", beat: "act3-zhongdu" } },
      ],
    },
    nodes: {
      arrival: {
        id: "arrival",
        title: "桃花岛·东邪试炼",
        text: "你循着黄蓉留下的石记穿过桃林，来到一座精舍前。黄药师背对院门，手里握着一管玉箫。黄药师：\"蓉儿给你留了路，不算破阵。说吧，来桃花岛做什么？\"你报上郭靖与黄蓉的名字。黄药师这才转身。黄药师：\"替人说情，也得先让我看看你有多少斤两。\"",
        choices: [
          {
            id: "accept-test", text: "应下试炼", description: "按黄药师的规矩，先走一遍桃花阵。",
            consumeDay: true,
            resultText: "你抱拳应下。黄药师用玉箫指向身后桃林。黄药师：\"一炷香。走得出来，再谈别的。\"",
            transition: { type: "goto", nodeId: "test" },
          },
          {
            id: "negotiate", text: "直陈来意", description: "把郭靖做过的事逐件说清，请他少试一关。",
            condition: { kind: "relation", npcId: "huangrong", gte: 15 },
            consequences: [{ kind: "relation", npcId: "huangyaoshi-npc", delta: 5 }],
            consumeDay: true,
            resultText: "你没有替郭靖夸耀武功，只把他在大漠与临安做过的事逐件说清。黄药师听完，用玉箫轻敲掌心。黄药师：\"蠢人若真能十年如一日，倒也比聪明人难得。只试一关，过了再说。\"",
            transition: { type: "goto", nodeId: "test" },
          },
          {
            id: "force-entry", text: "强行入门", description: "不接试题，径直踏上精舍石阶。",
            consequences: [
              { kind: "relation", npcId: "huangyaoshi-npc", delta: -15 },
              { kind: "karma", delta: -5 },
            ],
            consumeDay: true,
            resultText: "你没有接他的试题，径直踏入精舍石阶。黄药师横箫拦在身前。黄药师：\"桃花岛不是任人撒野的地方。\"",
            transition: {
              type: "battle", enemyId: "huangyaoshi",
              onWin: {
                text: "你接下数招，最后一步踩碎石阶边角，却没有退出院门。黄药师收箫入袖。黄药师：\"功夫尚可，规矩却差。看在蓉儿面上，这次不逐你下海。\"",
                consequences: [
                  { kind: "reputation", delta: 8 },
                  { kind: "relation", npcId: "huangyaoshi-npc", delta: 10 },
                ],
                then: { type: "goto", nodeId: "result" },
              },
              onLose: {
                text: "黄药师以箫点中肩井，你半边身子立刻失去知觉。黄药师：\"连三招都接不稳，还敢强闯。送客。\"两名哑仆随后把小舟推离码头。",
                then: { type: "end" },
              },
              onFlee: {
                text: "你借桃树遮挡退出精舍。黄药师没有追来，远处玉箫只响了一声，林中道路便再次合拢。你只得循原路回到码头。",
                then: { type: "end" },
              },
            },
          },
        ],
      },
      test: {
        id: "test",
        title: "桃花·奇门试炼",
        text: "黄药师引你入阵，四面桃花遮眼，方位不断变幻。黄药师：\"一炷香内走出此阵，便算你过。\"你凝神观察，阵眼随着生门不断变动。",
        choices: [
          {
            id: "solve-array", text: "推演阵法", description: "静心推算生门方位，以智破阵。",
            consequences: [
              { kind: "relation", npcId: "huangyaoshi-npc", delta: 12 },
              { kind: "aptitude", delta: 2 },
            ],
            consumeDay: true,
            resultText: "你先记住风向与花枝摆动，再顺着石径阴影推算生门。香烧到一半时，你从另一侧走回精舍。黄药师看了看炉中残香。黄药师：\"没有乱折一枝桃花。还算懂规矩。\"",
            transition: { type: "goto", nodeId: "result" },
          },
          {
            id: "brute-force", text: "以力破阵", description: "震开挡路花枝，强行穿过阵势。",
            consumeDay: true,
            resultText: "你运功强行闯阵，左冲右突——",
            transition: {
              type: "battle", enemyId: "huangyaoshi",
              onWin: {
                text: "你连续震开挡路花枝，终于从阵中闯出，衣袖已被划开几道。黄药师：\"阵没看懂，路倒真让你撞出来了。算你过。\"",
                consequences: [
                  { kind: "speed", delta: 2 },
                ],
                then: { type: "goto", nodeId: "result" },
              },
              onLose: {
                text: "你在阵中转回原地三次，最后力竭坐倒。黄药师的箫声从林外传来，哑仆随后现身，把你领回码头。",
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
            resultText: "黄蓉在林外吹了三声短哨。你依着哨声辨清生门，很快走出桃林。黄药师看向女儿，黄蓉却只低头摆弄手里的竹枝。黄药师没有点破此事。",
            transition: { type: "goto", nodeId: "result" },
          },
        ],
      },
      result: {
        id: "result",
        title: "桃花岛·翁婿和解",
        text: "黄药师在海边站了许久，终于把玉箫收入袖中。黄药师：\"蓉儿既认了郭靖，我再拦她，她也只会自己离岛。\"黄蓉别过脸。黄蓉：\"爹早些这么说，便省了许多事。\"黄药师没有接话，只命哑仆收拾客房。几日后你离岛，他亲自来到码头，以玉箫点出兰花拂穴手的发劲方位。黄药师：\"腕上留三分力。下次再来，别踩坏我的桃树。\"",
        autoNext: { type: "end" },
        onEnter: [
          { kind: "arcBeat", arcId: "shendiao", beat: "taohua", result: "done" },
          { kind: "reputation", delta: 5 },
          { kind: "factionAttitude", factionId: "taohuadao", delta: 15 },
          { kind: "aptitude", delta: 2 },
          { kind: "skill", id: "lanhua" },
          { kind: "npcRelationType", npcId: "huangyaoshi-npc", relationType: "朋友" },
          { kind: "npcFaction", npcId: "huangyaoshi-npc", faction: "taohuadao" },
          { kind: "relation", npcId: "huangrong", delta: 4 },
        ],
      },
    },
  },

  // ===== 7. 旧铁枪庙样板（仅供未进入 act6 新流程的存档兼容） =====
  {
    id: "shendiao-yangkang",
    entryNode: "main",
    locationId: "niujia",
    weight: 5,
    once: true,
    condition: {
      kind: "and",
      items: [
        { kind: "arcBeat", arcId: "shendiao", beat: "taohua" },
        { kind: "not", item: { kind: "arcVariant", arcId: "shendiao", key: "act6.munianci", eq: "cleared" } },
      ],
    },
    nodes: {
      main: {
        id: "main",
        title: "铁枪庙·恩仇了断",
        text: "牛家村的铁枪庙前围满了人。杨康站在庙门内，身后是数名金国武士；穆念慈挡在杨铁心留下的铁枪前。穆念慈：\"义父的遗物，你也要让金兵拿走？\"杨康握紧腰间短枪。杨康：\"我在王府长大，姓完颜。你们今日拿一杆旧枪，便要替我另认一个父亲？\"",
        choices: [
          {
            id: "persuade", text: "让他看枪上刻字", description: "把杨铁心的旧枪转向他，请他先查清牛家村旧事。",
            consequences: [{ kind: "karma", delta: 5 }],
            consumeDay: true,
            resultText: "你走到铁枪旁，把枪身上的“杨”字转向杨康，又指出他可以不认这杆枪，却该先问清当年牛家村发生过什么。杨康盯着刻字片刻，随即移开目光。杨康：\"让开。\"",
            transition: { type: "goto", nodeId: "confrontation" },
          },
          {
            id: "expose", text: "当众说出旧事", description: "把杨铁心、包惜弱与完颜洪烈的关系说给众人听。",
            consequences: [
              { kind: "karma", delta: 3 },
              { kind: "reputation", delta: 3 },
              { kind: "relation", npcId: "yangkang", delta: -20 },
            ],
            consumeDay: true,
            resultText: "你当众说出杨铁心、包惜弱与完颜洪烈之间的旧事。围观者立刻议论起来，几名金国武士也转头看向杨康。杨康拔枪指住你。杨康：\"住口！我的家事，轮不到你在这里说。\"",
            transition: { type: "goto", nodeId: "confrontation" },
          },
          {
            id: "side-yangkang", text: "替杨康挡住人群", description: "守住庙门，为他让出一条离开的侧巷。",
            consequences: [
              { kind: "karma", delta: -10 },
              { kind: "relation", npcId: "yangkang", delta: 15 },
              { kind: "relation", npcId: "guojing", delta: -15 },
              { kind: "gold", delta: 100 },
            ],
            consumeDay: true,
            resultText: "你挡住庙门外逼近的人群，给杨康让出侧巷。杨康经过你身边时停了一步，把随身钱袋抛到你手里。杨康：\"这份情，我记下。\"郭靖站在雨里，没有追赶，只把手里的刀慢慢垂下。",
            transition: { type: "goto", nodeId: "confrontation" },
          },
        ],
      },
      confrontation: {
        id: "confrontation",
        title: "铁枪庙·生死一念",
        text: "杨康忽然抄起铁枪，枪尖直取穆念慈肩头。你横身架开，枪杆擦着庙柱撞出一片木屑。杨康左手随即屈指成爪，招式已不是杨家枪法。杨康：\"再拦我，便一起死在这里！\"",
        choices: [
          {
            id: "fight-yangkang", text: "迎战杨康", description: "封住庙门，不让他继续追击穆念慈。",
            consumeDay: true,
            transition: {
              type: "battle", enemyId: "yangkang",
              onWin: {
                text: "你击落杨康手中铁枪，他踉跄后退。穆念慈：\"康哥，够了……\"杨康看了她一眼，转身冲入雨幕。",
                consequences: [
                  { kind: "npcTag", npcId: "yangkang", tag: "杨康已黑化" },
                ],
                then: { type: "goto", nodeId: "judgment" },
              },
              onLose: {
                text: "杨康一枪逼开你的兵刃，枪尾随即撞中肋下。郭靖赶到庙门前，横掌挡住追击。杨康没有再战，只带着金国武士退入雨中。",
                then: { type: "goto", nodeId: "judgment" },
              },
              onFlee: {
                text: "你避开杨康左手爪势，退到断墙外。他没有追来，转身便带人冲进雨幕。",
                then: { type: "goto", nodeId: "judgment" },
              },
            },
          },
          {
            id: "let-him-go", text: "让开庙门", description: "收起兵刃，不再阻拦他离开。",
            consequences: [
              { kind: "karma", delta: -3 },
            ],
            consumeDay: true,
            resultText: "你侧身让开庙门。杨康收枪冲入雨中，穆念慈追到门口又停下。郭靖扶住她，没有说话。",
            transition: { type: "goto", nodeId: "judgment" },
          },
        ],
      },
      judgment: {
        id: "judgment",
        title: "铁枪庙·善恶一念",
        text: "混战中，杨康右掌擦过铁枪上生锈发黑的旧刺。他只看了一眼伤口，便从袖中扣出一枚毒镖，朝挡在庙门前的穆念慈甩去。与此同时，火势已经烧上腐朽横梁。",
        choices: [
          {
            id: "save-munianci", text: "飞身挡镖", description: "抢到穆念慈身前，用肩背挡下毒镖。",
            consequences: [
              { kind: "karma", delta: 15 },
              { kind: "hp", delta: -40 },
              { kind: "relation", npcId: "guojing", delta: 15 },
              { kind: "relation", npcId: "yangkang", delta: -25 },
              { kind: "npcAlive", npcId: "yangkang", alive: false },
              { kind: "npcTag", npcId: "yangkang", tag: "杨康已殒" },
            ],
            consumeDay: true,
            resultText: "你抢到穆念慈身前，毒镖钉入肩头。穆念慈扶住你时，烧断的横梁也从杨康头顶砸下。郭靖扑过去只抓到半截衣袖，火焰随即封住庙门。",
            transition: { type: "goto", nodeId: "aftermath" },
          },
          {
            id: "let-fate-decide", text: "不出手", description: "留在原地，看他这一招会落到何处。",
            consequences: [
              { kind: "karma", delta: -5 },
              { kind: "npcAlive", npcId: "yangkang", alive: false },
              { kind: "npcTag", npcId: "yangkang", tag: "杨康已殒" },
            ],
            consumeDay: true,
            resultText: "毒镖擦破穆念慈衣袖，钉进门框。杨康刚迈出一步，右手便开始发黑，呼吸也骤然停滞。方才铁枪旧刺上的毒已经顺着掌心伤口入体。郭靖冲上去扶住他，杨康张了张口，只吐出一口黑血。",
            transition: { type: "goto", nodeId: "aftermath" },
          },
          {
            id: "save-yangkang", text: "拉开杨康", description: "赶在横梁落下前，把他拖出火场。",
            consequences: [
              { kind: "karma", delta: -8 },
              { kind: "relation", npcId: "yangkang", delta: 20 },
              { kind: "npcRelationType", npcId: "yangkang", relationType: "朋友" },
              { kind: "relation", npcId: "guojing", delta: -10 },
              { kind: "npcTag", npcId: "yangkang", tag: "杨康遁走" },
              { kind: "gold", delta: 50 },
            ],
            consumeDay: true,
            resultText: "你抓住杨康后领，把他拖离倒下的横梁。他撑着墙站稳，甩开你的手，腰间钱袋也落进泥水。杨康：\"你救我一次，我也不会因此照你的路走。\"他说完便捂着伤手退入雨中。郭靖追出庙门时，巷里已经不见人影。",
            transition: { type: "goto", nodeId: "aftermath" },
          },
        ],
      },
      aftermath: {
        id: "aftermath",
        title: "铁枪庙·雨霁",
        text: "雨势渐小。郭靖从废墟里拔出杨铁心留下的铁枪，用袖口擦去泥水，又把它插回庙前石缝。穆念慈跪在一旁，把烧断的枪缨重新系好。天亮前，一名丐帮弟子赶到村口，递来洪七公的口信：华山论剑将开，各路高手已经动身。",
        autoNext: { type: "end" },
        onEnter: [
          { kind: "arcBeat", arcId: "shendiao", beat: "yangkang", result: "done" },
          { kind: "reputation", delta: 5 },
          { kind: "relation", npcId: "guojing", delta: 3 },
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
    condition: {
      kind: "and",
      items: [
        { kind: "arcBeat", arcId: "shendiao", beat: "yangkang" },
        {
          kind: "not",
          item: {
            kind: "arcBeat",
            arcId: "shendiao",
            beat: "act7-western-campaign",
            result: "done",
          },
        },
      ],
    },
    nodes: {
      summit: {
        id: "summit",
        title: "华山论剑·天下五绝",
        text: "华山绝顶已经围满各路武人。黄药师独立东侧崖边，欧阳锋盘坐石台，一灯大师与洪七公则在松下交谈。全真弟子守着中神通旧位，不许旁人靠近。郭靖刚以一掌震退挑战者，峰顶又有人高声问，还有谁愿下场。",
        choices: [
          {
            id: "challenge-arena", text: "下场比武", description: "向欧阳锋请战，亲自试一试蛤蟆功。",
            consumeDay: true,
            resultText: "你越过石栏落入场中，向欧阳锋抱拳。欧阳锋缓缓起身，双膝微屈。欧阳锋：\"年轻人争名，倒比老夫还急。来。\"",
            transition: {
              type: "battle", enemyId: "ouyangfeng",
              onWin: {
                text: "你接连拆过欧阳锋数十招，最后借石壁卸开蛤蟆功掌力，仍站在场中。洪七公以竹棒敲地。洪七公：\"够了！再打下去，华山都要让你们拆了。\"欧阳锋收势退开。欧阳锋：\"还算有几分本事。\"",
                consequences: [
                  { kind: "reputation", delta: 15 },
                  { kind: "skill", id: "xianglong18" },
                  { kind: "exp", delta: 200 },
                ],
                then: { type: "goto", nodeId: "contest" },
              },
              onLose: {
                text: "欧阳锋伏地蓄势，一掌把你震出场外。洪七公用竹棒托住你的后背。洪七公：\"能逼他认真发这一掌，今日便没白下场。\"",
                consequences: [
                  { kind: "reputation", delta: 5 },
                  { kind: "exp", delta: 80 },
                  { kind: "aptitude", delta: 2 },
                ],
                then: { type: "goto", nodeId: "contest" },
              },
              onFlee: {
                text: "欧阳锋伏地蓄势时，你先一步退出掌力正面。劲风擦着衣袖撞上石壁，碎石滚落山涧。洪七公在场外点了点头，没有出声。",
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
            resultText: "你守在侧峰，从起手、换气到退步逐一记下。洪七公每次收掌都留半步回身，欧阳锋却把全身劲力压在下一击上；黄药师不与二人硬碰，只用箫身点向招式空隙。",
            transition: { type: "goto", nodeId: "contest" },
          },
          {
            id: "assist-guojing", text: "助郭靖守擂", description: "接下左侧挑战者，替郭靖封住夹攻路线。",
            condition: { kind: "relation", npcId: "guojing", gte: 20 },
            consequences: [
              { kind: "relation", npcId: "guojing", delta: 10 },
              { kind: "relation", npcId: "huangrong", delta: 5 },
              { kind: "reputation", delta: 8 },
              { kind: "exp", delta: 150 },
            ],
            consumeDay: true,
            resultText: "你落到郭靖身侧，替他接下左边两名挑战者。郭靖守正面，你封侧路，三轮交手后几名对手一齐退出石台。郭靖收掌抱拳。郭靖：\"多谢。方才若让他们左右夹攻，我未必守得住。\"",
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
            resultText: "你在华山脚下的酒肆找到杨康。他换了粗布衣裳，右手仍缠着药布。杨康：\"论剑的热闹在山上，你来找我做什么？\"你把一壶酒放到桌上。杨康沉默片刻，摘下腰间最后一块王府玉牌，丢进火盆。杨康：\"完颜康已经死在铁枪庙了。往后我姓什么，由我自己定。\"",
            transition: { type: "goto", nodeId: "contest" },
          },
        ],
      },
      contest: {
        id: "contest",
        title: "论剑·天下第一",
        text: "论剑持续到第三日午后。最后一名挑战者退出石台，郭靖也收掌退到洪七公身边。洪七公：\"天下第一这四个字，谁爱背谁背。能知道该为谁出掌，便没白学武。\"黄药师看了郭靖一眼，又转向你。黄药师：\"牛家村、大漠、王府、桃花岛，你处处都要插手。既然走到了这里，往后也别指望江湖忘了你。\"山下钟声响起，各派开始收拾兵刃下山。",
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
        text: "众人准备下山时，郭靖把自己的马牵到你身边。郭靖：\"北边还有不少流民，我想先送粮过去。你若同路，咱们一起走。\"黄蓉把两份干粮分别系上马鞍。洪七公早已先行下山，只在石上留了一行竹棒划出的字：少说侠义，多做实事。",
        autoNext: { type: "end" },
        onEnter: [
          { kind: "arcBeat", arcId: "shendiao", beat: "huashan", result: "won" },
          { kind: "reputation", delta: 10 },
          { kind: "relation", npcId: "guojing", delta: 10 },
          { kind: "npcRelationType", npcId: "guojing", relationType: "知己" },
          { kind: "npcRecruit", npcId: "guojing", recruited: true },
          { kind: "arcEnding", arcId: "shendiao", ending: "hero" },
        ],
      },
      "epilogue-outcast": {
        id: "epilogue-outcast",
        title: "射雕·独步江湖",
        text: "你独自沿西侧山道下山，欧阳锋已在转角等候。他把一枚蛇形令牌抛到你脚边。欧阳锋：\"山上那群人容不下你的做法，白驼山却只看本事。拿着它，想来时自有人带路。\"他说完转入山雾，没有再等答复。",
        autoNext: { type: "end" },
        onEnter: [
          { kind: "arcBeat", arcId: "shendiao", beat: "huashan", result: "done" },
          { kind: "reputation", delta: 5 },
          { kind: "relation", npcId: "ouyangfeng-npc", delta: 15 },
          { kind: "relation", npcId: "guojing", delta: -10 },
          { kind: "arcEnding", arcId: "shendiao", ending: "outcast" },
        ],
      },
      "epilogue-wanderer": {
        id: "epilogue-wanderer",
        title: "射雕·江湖路远",
        text: "你没有随郭靖北上，也把欧阳锋的令牌留在原处。走到半山亭时，身后传来黄蓉的声音。黄蓉：\"下回见面，记得补上临安那顿饭！\"郭靖也在远处向你抱拳。山道在亭外分成数条，分别通往江南、中原与西域。",
        autoNext: { type: "end" },
        onEnter: [
          { kind: "arcBeat", arcId: "shendiao", beat: "huashan", result: "done" },
          { kind: "reputation", delta: 5 },
          { kind: "arcEnding", arcId: "shendiao", ending: "wanderer" },
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
        text: "你再回牛家村时，雪早已化尽，只剩几堵焦黑的残墙。村口老妪坐在断井边，絮絮叨叨说起那一夜官军围村、道人杀敌、村民逃散的旧事。风一阵阵从残墙缺口穿过去，断井边的草伏下又立起，灰黑砖缝里到处还留着火烧过的痕。",
        choices: [
          {
            id: "offer-incense",
            text: "替故人上香",
            description: "在残屋前点一炷清香，替旧人旧事收一收魂。",
            consumeDay: true,
            resultText: "你在残垣前燃起线香，行了一礼。老妪看了你一眼：\"还记得这村子的人，不多了。\"",
            consequences: [
              { kind: "karma", delta: 2 },
              { kind: "reputation", delta: 2 },
            ],
            transition: { type: "end" },
          },
          {
            id: "search-rubble",
            text: "翻检残垣",
            description: "看看火场废墟里是否还藏着什么旧物。",
            consumeDay: true,
            resultText: "你翻开焦木烂瓦，在灰烬里摸出一枚烧黑的铜锁和几页残纸。纸上的字大半模糊，只剩\"忠义\"二字还能辨认。",
            consequences: [
              { kind: "aptitude", delta: 1 },
              { kind: "item", id: "field-ration", count: 1 },
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
            description: "陪她在庙前坐一阵，听她把未尽的话说完。",
            consumeDay: true,
            resultText: "你陪穆念慈在庙前坐了一阵。她说起杨铁心，也说起杨康。末了，穆念慈：\"活着的人，总还得继续走。\"",
            consequences: [
              { kind: "karma", delta: 3 },
              { kind: "reputation", delta: 2 },
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
    presentation: "letter",
    letterStyle: "note",
    locationId: "damos",
    weight: 3,
    once: true,
    condition: {
      kind: "and",
      items: [
        { kind: "arcBeat", arcId: "shendiao", beat: "damos" },
        { kind: "not", item: { kind: "flag", name: "shendiao.damos.reworked", eq: true } },
      ],
    },
    nodes: {
      main: {
        id: "main",
        title: "大漠·白雕传讯",
        letterIntro: "你在草原上歇马时，头顶掠过一道白影。那只白雕落到你身旁，爪上系着一截皮绳。",
        text: "兄弟，若来大漠，记得喝热马奶。",
        letterSignature: "郭靖",
        choices: [
          {
            id: "untie-letter",
            text: "把字条收好",
            description: "看看白雕到底替谁送来什么消息。",
            consumeDay: true,
            resultText: "你把字条折好收起，纸角上还沾着一点干掉的沙土。",
            consequences: [
              { kind: "relation", npcId: "guojing", delta: 6 },
              { kind: "hp", delta: 20 },
            ],
            transition: { type: "end" },
          },
          {
            id: "feed-eagle",
            text: "喂它些肉干",
            description: "不拆绳结，先喂饱这位远道来的使者。",
            consumeDay: true,
            resultText: "你掰开肉干喂给白雕。它吃完后绕着你飞了一圈，这才落下，让你取走爪上皮绳。上头还系着一枚草原护符。",
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
    condition: {
      kind: "and",
      items: [
        { kind: "relation", npcId: "guojing", gte: 10 },
        { kind: "not", item: { kind: "flag", name: "shendiao.damos.reworked", eq: true } },
      ],
    },
    nodes: {
      main: {
        id: "main",
        title: "大漠·可汗夜宴",
        text: "郭靖带你进了蒙古营帐。篝火映红草场，帐中有人劝酒，也有人在毡毯上比试摔跤。郭靖腾出火边的座位，把一只木碗塞到你手里。郭靖：\"今晚可汗设宴。先吃肉，马奶酒后劲大，别一口灌得太急。\"",
        choices: [
          {
            id: "drink",
            text: "举碗痛饮",
            description: "陪众人饮上几碗，试试草原酒量。",
            consumeDay: true,
            resultText: "你与郭靖碰碗饮酒。席间有人唱起长调，郭靖也跟着哼了两句，头一句便错了调。帐中先静了一瞬，随后连唱歌的人都拍着膝盖笑起来。",
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
    condition: {
      kind: "and",
      items: [
        { kind: "relation", npcId: "guojing", gte: 18 },
        { kind: "not", item: { kind: "flag", name: "shendiao.damos.reworked", eq: true } },
      ],
    },
    nodes: {
      main: {
        id: "main",
        title: "大漠·七怪试手",
        text: "柯镇恶等人听郭靖提起你，便要轮流和你过几招。朱聪掂了掂铁算盘，韩小莹站在一旁看着。柯镇恶拄杖立在风里。柯镇恶：\"能得靖儿推崇，想来不差。来，让老夫等人瞧瞧。\"",
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

  // ===== 14. 大漠·南归之前 =====
  {
    id: "shendiao-damos-southbound",
    entryNode: "main",
    locationId: "damos",
    weight: 4,
    once: true,
    condition: {
      kind: "and",
      items: [
        { kind: "arcBeat", arcId: "shendiao", beat: "damos" },
        { kind: "not", item: { kind: "arcBeat", arcId: "shendiao", beat: "meet-rong" } },
        { kind: "not", item: { kind: "flag", name: "shendiao.damos.reworked", eq: true } },
      ],
    },
    nodes: {
      main: {
        id: "main",
        title: "大漠·南归之前",
        text: "七怪的帐外已经备好几匹健马。郭靖正把弓袋、短刀和干粮逐样系上马鞍，解了两次，仍嫌不牢。见你过来，他递上一只水囊。郭靖：\"我也要回中原了。师父们说，那里有该见的人，也有该了的事。只是路该怎么走，我心里还没底。\"",
        choices: [
          {
            id: "encourage",
            text: "替他定心",
            description: "告诉郭靖，这一趟南归，本就该去。",
            consumeDay: true,
            resultText: "你替郭靖把松脱的皮扣重新系紧，又在草地上画出南下的几处驿道。郭靖蹲在一旁，把地名逐个念了一遍。郭靖：\"先把母亲送安稳，再随师父们查旧事。好，我记住了。\"他抹平地上的路线，起身把水囊挂回马鞍。",
            consequences: [
              { kind: "relation", npcId: "guojing", delta: 6 },
              { kind: "reputation", delta: 2 },
            ],
            transition: { type: "goto", nodeId: "departure" },
          },
          {
            id: "trade-keepsake",
            text: "互留信物",
            description: "既然都要南下，不如留个途中相认的凭据。",
            consumeDay: true,
            resultText: "你把随身的旧络子交给郭靖。郭靖看了半天，也解下腰间那枚草原护符。郭靖：\"到了中原，人多路也多。若是走散，见到这件东西，总能认出是自己人。\"他把护符塞进你手里，又将旧络子仔细系在刀鞘上。",
            consequences: [
              { kind: "relation", npcId: "guojing", delta: 8 },
              { kind: "item", id: "field-ration", count: 2 },
            ],
            transition: { type: "goto", nodeId: "departure" },
          },
        ],
      },
      departure: {
        id: "departure",
        title: "大漠·整鞍南去",
        text: "天刚亮，七怪已经等在帐外。柯镇恶拄杖立在最前头。柯镇恶：\"到了中原，先看清是非，再出手。莫丢咱们的脸。\"韩小莹替郭靖理平肩头衣褶，朱聪则把最后一把短刃塞进他包里。郭靖逐一向师父行礼，随后翻身上马。",
        autoNext: { type: "goto", nodeId: "promise" },
      },
      promise: {
        id: "promise",
        title: "大漠·风里留约",
        text: "郭靖催马走出十余步，又勒缰回头。郭靖：\"我到了中原，会设法给你送信。你若先到临安，也在那里等我几日。\"他说完才追上七怪。马队沿着草坡南去，很快没入晨雾。",
        onEnter: [
          { kind: "relation", npcId: "guojing", delta: 2 },
          { kind: "reputation", delta: 1 },
        ],
        autoNext: { type: "end" },
      },
    },
  },

  // ===== 15. 临安·并肩夜行 =====
  {
    id: "shendiao-linan-night-stroll",
    entryNode: "main",
    locationId: "linan",
    weight: 4,
    once: true,
    condition: {
      kind: "and",
      items: [
        { kind: "arcBeat", arcId: "shendiao", beat: "meet-rong" },
        { kind: "not", item: { kind: "arcBeat", arcId: "shendiao", beat: "qigong" } },
        { kind: "not", item: { kind: "flag", name: "shendiao.zhongdu.reworked", eq: true } },
      ],
    },
    nodes: {
      main: {
        id: "main",
        title: "临安·并肩夜行",
        text: "临安夜市将散，河埠头只剩几盏灯还亮着。郭靖提着两包栗子跟在黄蓉身后。黄蓉掂了掂纸包。黄蓉：\"一包栗子也能买贵两文。郭大哥，你还说没被骗？\"郭靖：\"那摊主说，这是今夜最后一锅。\"黄蓉正要再说，转头看见你站在桥边。黄蓉：\"来得正好。你替我评评理，他是不是一块木头？\"",
        choices: [
          {
            id: "tease-guojing",
            text: "顺着黄蓉打趣",
            description: "看看这对人一个敢逗、一个肯受，到底能逗出什么火花。",
            consumeDay: true,
            resultText: "你拿过纸包掂了掂，也说这两文钱花得冤。黄蓉立刻接过话头，把郭靖从买栗子说到挑灯笼。郭靖被说得耳根发红，仍把剥好的栗子递到她手边。黄蓉咬了一口，终于没有再提那两文钱。",
            consequences: [
              { kind: "relation", npcId: "huangrong", delta: 4 },
              { kind: "relation", npcId: "guojing", delta: 4 },
              { kind: "reputation", delta: 1 },
            ],
            transition: { type: "end" },
          },
          {
            id: "speak-for-guojing",
            text: "替郭靖说话",
            description: "告诉黄蓉，这世上肯这样跟着她的人并不多。",
            consumeDay: true,
            resultText: "你说郭靖肯跑过半条街买她想吃的栗子，多花两文也不算什么。黄蓉看了你一眼，又看向郭靖手里的纸包。黄蓉：\"这回便算了。下次先问三家价钱。\"郭靖认真点头。郭靖：\"好，我记住了。\"",
            consequences: [
              { kind: "relation", npcId: "huangrong", delta: 3 },
              { kind: "relation", npcId: "guojing", delta: 6 },
              { kind: "npcRelationType", npcId: "guojing", relationType: "朋友" },
            ],
            transition: { type: "end" },
          },
        ],
      },
    },
  },

  // ===== 16. 临安·丐帮小宴 =====
  {
    id: "shendiao-beggar-feast",
    entryNode: "main",
    locationId: "linan",
    weight: 3,
    once: true,
    condition: {
      kind: "and",
      items: [
        { kind: "arcBeat", arcId: "shendiao", beat: "meet-rong" },
        { kind: "not", item: { kind: "flag", name: "shendiao.zhongdu.reworked", eq: true } },
      ],
    },
    nodes: {
      main: {
        id: "main",
        title: "临安·丐帮小宴",
        text: "你在临安桥洞下闻到一股熟悉香气，掀帘一看，几个叫花子正围着陶锅忙活，黄蓉坐在当中看火候。见你来了，她抬头看你一眼。黄蓉：\"来得正好，今天这锅鱼羹缺个会夸人的。\"不远处，洪七公也守在锅边。",
        choices: [
          {
            id: "praise-cooking",
            text: "夸她厨艺",
            description: "尝过鱼羹，再照实说说火候。",
            consumeDay: true,
            resultText: "你尝过鱼羹，指出鱼肉鲜而不腥，姜丝却还可以再细些。黄蓉抬眼看你，又给你添了满满一碗。黄蓉：\"还算会吃，不只会说好听话。\"洪七公趁她转身，又从锅里捞走一块鱼腹。",
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
            resultText: "你坐在锅边听丐帮弟子报消息。临安城里的豪门旧闻、王府的新动静、江湖怪客南来的传闻，被他们一条条说了出来。洪七公看了你一眼，没说什么。",
            consequences: [
              { kind: "aptitude", delta: 1 },
              { kind: "reputation", delta: 2 },
            ],
            transition: { type: "end" },
          },
        ],
      },
    },
  },

  // ===== 16. 临安·王府风声 =====
  {
    id: "shendiao-linan-wangfu-rumor",
    entryNode: "main",
    locationId: "linan",
    weight: 4,
    once: true,
    condition: {
      kind: "and",
      items: [
        { kind: "arcBeat", arcId: "shendiao", beat: "qigong" },
        { kind: "not", item: { kind: "arcBeat", arcId: "shendiao", beat: "wangfu" } },
        { kind: "not", item: { kind: "flag", name: "shendiao.zhongdu.reworked", eq: true } },
      ],
    },
    nodes: {
      main: {
        id: "main",
        title: "临安·王府风声",
        text: "临安夜里起了小雨。酒肆后巷中，两名丐帮弟子正在檐下交接消息：赵王府近来接连延请江湖异人，三日前还有一批旧卷与兵书从北门运入。杨康也在昨夜带人回府，特意避开了正门。黄蓉从另一侧屋檐下现身，把一张王府巡夜图递给你。黄蓉：\"我等你半个时辰了。人齐了，便把这些线索理一遍。\"",
        choices: [
          {
            id: "follow-clue",
            text: "顺线追查",
            description: "和黄蓉一起把赵王府的风声理清楚。",
            consumeDay: true,
            resultText: "你按时辰把运书车、杨康回府与巡夜换岗标在图上。三条记录都指向西院那处常年落锁的书阁。黄蓉用指尖点住书阁位置。黄蓉：\"入口多半在这里。明夜二更，西墙会空一刻钟。\"",
            consequences: [
              { kind: "relation", npcId: "huangrong", delta: 5 },
              { kind: "aptitude", delta: 1 },
            ],
            transition: { type: "end" },
          },
          {
            id: "watch-from-afar",
            text: "先远远盯梢",
            description: "不忙着动手，先看看杨康和王府的人到底怎么来往。",
            consumeDay: true,
            resultText: "你在巷口守到更深，果然看见杨康领着两名高手匆匆回府。那背影看着仍是贵公子模样，脚下的步子却急得像踩着火。你没再跟，只把时辰、路线和门岗轮换记了下来。",
            consequences: [
              { kind: "aptitude", delta: 2 },
              { kind: "relation", npcId: "yangkang", delta: -4 },
            ],
            transition: { type: "end" },
          },
        ],
      },
    },
  },

  // ===== 17. 临安·武穆遗迹 =====
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
        text: "你顺着旧线索来到临安城外一处废祠，墙上斑驳碑文依稀还能看见\"尽忠报国\"四字。香火早断，只有风从破窗灌进来，把地上的灰尘吹得细细打旋。祠里静得很，残碑、旧灰和破窗外漏进来的天光并排落在墙根下。",
        choices: [
          {
            id: "copy-inscription",
            text: "誊抄残碑",
            description: "把尚能辨认的文字抄下，留作自勉。",
            consumeDay: true,
            resultText: "你对着残碑一字一字誊抄，虽有不少字句已残破难辨，纸上的墨痕却渐渐写满了整页。收笔时窗外风声仍紧，手里的纸却被你按得平平整整。",
            consequences: [
              { kind: "reputation", delta: 3 },
              { kind: "karma", delta: 2 },
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

  // ===== 18. 临安·王府旧影 =====
  {
    id: "shendiao-linan-yangkang-shadow",
    entryNode: "main",
    locationId: "linan",
    weight: 4,
    once: true,
    condition: {
      kind: "and",
      items: [
        { kind: "arcBeat", arcId: "shendiao", beat: "wangfu" },
        { kind: "not", item: { kind: "arcBeat", arcId: "shendiao", beat: "taohua" } },
        { kind: "not", item: { kind: "flag", name: "shendiao.zhongdu.reworked", eq: true } },
      ],
    },
    nodes: {
      main: {
        id: "main",
        title: "临安·王府旧影",
        text: "夜探赵王府之后，你又回到那一带。高墙外灯火少了，巡夜的人却添了一倍。巷口卖汤饼的老汉说，这两日总有一名贵公子从侧门回府，每次都在子时以后。话音刚落，拐角便闪过一角锦袍。你追进偏巷，只在墙边找到一截被踩断的玉带穗。",
        choices: [
          {
            id: "keep-chasing",
            text: "继续追下去",
            description: "想弄清杨康究竟在逃什么，又在躲谁。",
            consumeDay: true,
            resultText: "你一路追到偏巷尽头，屋脊上忽然传来铁链拖过瓦面的声音。五枚瓦片同时落下，你避开后再抬头，人影已经不见。墙上却留下五道新鲜爪痕，与王府暗室里的痕迹一模一样。",
            consequences: [
              { kind: "aptitude", delta: 2 },
              { kind: "relation", npcId: "yangkang", delta: -6 },
            ],
            transition: { type: "end" },
          },
          {
            id: "leave-with-thought",
            text: "先把线索压下",
            description: "有些人还没到揭底的时候，先记住这股不对劲。",
            consumeDay: true,
            resultText: "你没有继续追，把断掉的玉穗收了起来。穗结内侧绣着王府纹样，边角却沾着暗红药粉。第二日再去侧门时，门上的守卫已经全部换过。",
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

  // ===== 19. 桃花岛·海上来书 =====
  {
    id: "shendiao-taohua-letter",
    entryNode: "main",
    presentation: "letter",
    letterStyle: "formal",
    locationId: "taohuadao",
    weight: 4,
    once: true,
    condition: {
      kind: "and",
      items: [
        { kind: "arcBeat", arcId: "shendiao", beat: "wangfu" },
        { kind: "not", item: { kind: "arcBeat", arcId: "shendiao", beat: "taohua" } },
        { kind: "not", item: { kind: "arcBeat", arcId: "shendiao", beat: "act3-zhongdu" } },
      ],
    },
    nodes: {
      main: {
        id: "main",
        title: "桃花岛·海上来书",
        letterIntro: "你回到落脚处时，窗边压着一封带海潮咸味的书信，封口处还沾着一点桃花花瓣。",
        text: "你若还记得临安那顿饭，也还记得答应过要来看我爹，现在便该动身了。再拖下去，靖哥哥只会越来越笨。——对了，来时别乱走，桃花阵可不会认人。",
        letterSignature: "黄蓉",
        choices: [
          {
            id: "keep-letter",
            text: "把信收好",
            description: "既是黄蓉亲自催你，该去桃花岛看看了。",
            consumeDay: true,
            resultText: "你把信折好收入怀中，又在地图上圈出东海渡口。封口处那片桃花也被一并夹进册页。",
            consequences: [
              { kind: "relation", npcId: "huangrong", delta: 4 },
              { kind: "reputation", delta: 1 },
            ],
            transition: { type: "end" },
          },
        ],
      },
    },
  },

  // ===== 19. 临安·湖心夜话 =====
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
        text: "黄蓉夜里约你泛舟西湖。小船离岸后，她看着远处灯火，半天没再说笑。黄蓉：\"靖哥哥总说，侠义就是该做的便去做。可江湖哪有那么简单？\"船桨一晃，湖面便散开一圈圈水纹。",
        choices: [
          {
            id: "speak-frankly",
            text: "坦白作答",
            description: "把一路见过的事和自己的判断直说出来。",
            consumeDay: true,
            resultText: "你与黄蓉在湖上说了很久，说侠义，也说一路见过的人和事。听完后，黄蓉：\"原来你也不是只会逞强。\"她把船桨一拨，小舟又往湖心荡出去一截。",
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
            resultText: "你故意把话头转到郭靖买贵的栗子上。黄蓉先瞪了你一眼，随后用船桨敲了敲船沿。黄蓉：\"你也学会拿他来挡话了。罢了，今晚不问。\"她重新划桨，小舟慢慢转向岸边灯火。",
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
        text: "夜里海潮拍岸，你循着箫声走到礁石边。黄药师背海而立，箫声在潮声里起落。曲终之后，他没有回头。黄药师：\"可听懂了几分？\"",
        choices: [
          {
            id: "answer-heart",
            text: "说出感受",
            description: "把你从箫声中听见的孤意说给他听。",
            consumeDay: true,
            resultText: "你把自己听出来的意思说给黄药师。黄药师沉默了一阵。黄药师：\"你倒不是木头。\"他折下一截桃枝抛给你：\"留着吧。\"",
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
        text: "黄蓉折下一根桃枝，在地上画出八个方位。黄蓉：\"桃花阵不会认熟人。你下回来若还乱走，我可不去捞你。\"她先踏进林中，每到岔路便停半步，让你看清树影与石位如何变化。",
        choices: [
          {
            id: "follow-carefully",
            text: "照她步法走",
            description: "老老实实跟着黄蓉的节奏，不逞强。",
            consumeDay: true,
            resultText: "你照着黄蓉的落脚处逐步跟进，中途踩错一次，她便用桃枝把你拨回原位。走到阵眼时，黄蓉停下回头。黄蓉：\"现在闭眼，自己说下一步往哪边。\"",
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
            resultText: "你没有一直跟着黄蓉，而是按树影与石位自己推算。走完整座阵后，袖口被花枝划开一道，路线却记下了大半。黄蓉接过你画的方位图。黄蓉：\"错了两处。肯自己算，总比只跟着我强。\"",
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

  // ===== 20. 牛家村·华山前夜 =====
  {
    id: "shendiao-niujia-before-huashan",
    entryNode: "main",
    locationId: "niujia",
    weight: 4,
    once: true,
    condition: {
      kind: "and",
      items: [
        { kind: "arcBeat", arcId: "shendiao", beat: "yangkang" },
        { kind: "not", item: { kind: "arcBeat", arcId: "shendiao", beat: "huashan" } },
      ],
    },
    nodes: {
      main: {
        id: "main",
        title: "牛家村·华山前夜",
        text: "铁枪庙风波后，村口已有行商议论华山论剑。有人见过欧阳锋往西走，也有人说洪七公与一灯大师都已动身。夜里，郭靖背着收好的行囊来到村外田埂。郭靖：\"我明早去华山。师父说，论剑不只为争高下，也该把这些年的旧账当面说清。\"",
        choices: [
          {
            id: "promise-company",
            text: "答应同去",
            description: "告诉郭靖，华山一程你会走到最后。",
            consumeDay: true,
            resultText: "你应下同去。郭靖把一张通往华山的路引递给你。郭靖：\"我先去临安接蓉儿。三日后，华山脚下那间旧驿站会合。\"",
            consequences: [
              { kind: "relation", npcId: "guojing", delta: 6 },
              { kind: "reputation", delta: 2 },
            ],
            transition: { type: "end" },
          },
          {
            id: "watch-silently",
            text: "只与他并肩站着",
            description: "有些话不必多说，同行本身就够了。",
            consumeDay: true,
            resultText: "你没有多说，只和郭靖在田埂上站了一阵。临走时，他拍了拍你的肩膀。郭靖：\"华山见。\"随后他便转身回村，去收拾明早要带的干粮与兵刃。",
            consequences: [
              { kind: "relation", npcId: "guojing", delta: 4 },
              { kind: "aptitude", delta: 1 },
            ],
            transition: { type: "end" },
          },
        ],
      },
    },
  },

  // ===== 21. 华山·雪夜论剑 =====
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
        text: "论剑散场数日后，华山夜里又落了雪。几名散修剑客围着火堆争论：一人说剑贵在快，一人说剑先在意，还有人把一柄缺口长剑拍在石上，认定兵器优劣才定胜负。见你经过，他们立刻让出火边位置，请你评一评论剑所见。",
        choices: [
          {
            id: "speak-technique",
            text: "从招法说起",
            description: "讲讲你在华山论剑中真正看见的门道。",
            consumeDay: true,
            resultText: "你把论剑时几次交手拆开来讲：快剑如何被预判落点，重剑如何因回身不及露出空门。几名剑客照着比划，先前拍桌最响的人也把缺口长剑收回鞘中。",
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
            resultText: "你踏雪拔剑，只演了三式：第一式取快，第二式用力，第三式却在半途收住。几名剑客各自看见了前两式的破绽，到了第三式反而无人能先开口。",
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
        text: "你在思过崖侧面的石壁上发现一片浅浅旧刻，石上留着几行指力刻下的心法。字迹已经风化过半，只剩\"大道至简\"、\"先守后发\"、\"心静则明\"几句还能看清。",
        choices: [
          {
            id: "trace-words",
            text: "沿字痕推演",
            description: "试着顺着石刻里残存的劲路去想象出手之法。",
            consumeDay: true,
            resultText: "你沿石痕的深浅推演发力方向，又在空地上逐句试招。那些残字没有连成完整武功，却把几处多余的起手动作删得干净。",
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
            resultText: "你向石壁旧刻拱手一礼，又清掉字缝里的枯叶与浮土。下山前，那几句残字已经比来时清楚了些。",
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
