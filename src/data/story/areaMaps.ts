import { STORY_STAGE_BACKGROUNDS } from "./stageAssets"

export type StoryAreaSpotKind = "story" | "training" | "exit" | "scenery"
export type StoryAreaActionKind =
  | "talk"
  | "inspect"
  | "shop"
  | "inventory"
  | "spar"
  | "exit"

export interface StoryAreaTarget {
  eventId: string
  nodeId: string
}

export interface StoryAreaResident {
  name: string
  title: string
  line: string
}

export interface StoryAreaAction {
  id: string
  kind: StoryAreaActionKind
  label: string
  description: string
  resultText?: string
  npcId?: string
}

export interface StoryAreaSpace {
  sceneId: string
  sceneLabel: string
  background: string
  kicker: string
  description: string
  ambience: string
  residents: StoryAreaResident[]
  actions: StoryAreaAction[]
}

export interface StoryAreaSpot {
  id: string
  name: string
  description: string
  x: number
  y: number
  kind: StoryAreaSpotKind
  storyTargets?: StoryAreaTarget[]
  space: StoryAreaSpace
}

export interface StoryAreaMap {
  id: string
  locationId: string
  name: string
  subtitle: string
  background: string
  spots: StoryAreaSpot[]
}

export const STORY_AREA_MAPS: StoryAreaMap[] = [
  {
    id: "niujia-village",
    locationId: "niujia",
    name: "牛家村",
    subtitle: "钱塘江畔 · 村中路引",
    background: "https://copilot-cn.bytedance.net/api/ide/v1/text_to_image?prompt=top-down%20illustrated%20local%20map%20for%20a%20Chinese%20wuxia%20RPG%2C%20Southern%20Song%20dynasty%20Niujia%20village%2C%20Qiantang%20river%20along%20the%20south%20edge%2C%20small%20tavern%20on%20the%20west%20road%2C%20two%20farmhouse%20courtyards%20in%20the%20center%2C%20pine%20grove%20to%20the%20north%2C%20open%20training%20ground%20near%20the%20east%20gate%2C%20snow-dusted%20paths%2C%20clear%20landmarks%20and%20open%20spaces%20for%20UI%20markers%2C%20ink%20and%20mineral%20color%20painting%2C%20no%20people%2C%20no%20readable%20text%2C%20no%20logo&image_size=landscape_16_9",
    spots: [
      {
        id: "riverbank",
        name: "钱塘江边",
        description: "张十五说书的两株松树仍立在江岸。",
        x: 46,
        y: 78,
        kind: "story",
        storyTargets: [
          { eventId: "shendiao-niujia-opening", nodeId: "riverbank" },
        ],
        space: {
          sceneId: "niujia-riverbank",
          sceneLabel: "牛家村 · 钱塘江边",
          background: STORY_STAGE_BACKGROUNDS["niujia-riverbank"],
          kicker: "江潮与说书场",
          description: "两株老松之间铺着说书人的草席，江风卷着潮气吹过围听人群。",
          ambience: "潮声压着木板脆响，渡船号子从下游断断续续传来。",
          residents: [
            {
              name: "张十五",
              title: "钱塘说书人",
              line: "今日先说靖康旧事，再说岳武穆如何领兵北上。",
            },
          ],
          actions: [
            {
              id: "talk-storyteller",
              kind: "talk",
              label: "与张十五说话",
              description: "问问今日说的是哪一段旧事。",
              resultText: "张十五把梨花木板横在膝上，说今日要从靖康年间讲起，等江边人到齐便开场。",
            },
            {
              id: "watch-tide",
              kind: "inspect",
              label: "查看潮势",
              description: "沿江岸看看渡船、村路与说书场的位置。",
              resultText: "江水正涨，渡船都拴在高处。曲三酒店的酒旗就在村路尽头，离两株松树不过百余步。",
            },
          ],
        },
      },
      {
        id: "qusan-tavern",
        name: "曲三酒店",
        description: "酒帘已经落下，后院偶尔传来鸡叫。",
        x: 23,
        y: 48,
        kind: "scenery",
        space: {
          sceneId: "qusan-tavern",
          sceneLabel: "牛家村 · 曲三酒店",
          background: STORY_STAGE_BACKGROUNDS["qusan-tavern"],
          kicker: "酒炉与村中柜台",
          description: "临江小店只有几张木桌，墙边摞着酒坛，后门通向傻姑住的院子。",
          ambience: "酒炉轻响，门外江风不时把半截酒帘吹进屋里。",
          residents: [
            {
              name: "曲三",
              title: "跛脚掌柜",
              line: "喝酒便坐，问旧事就免了。柜上还有些伤药和干粮。",
            },
            {
              name: "傻姑",
              title: "曲三养女",
              line: "傻姑抱着鸡食盆躲在门后，只肯把公鸡叫作大老虎。",
            },
          ],
          actions: [
            {
              id: "talk-qusan",
              kind: "talk",
              label: "与曲三交谈",
              description: "听听这个跛脚掌柜如何看村里的来往人物。",
              resultText: "曲三擦着酒碗，只提醒你村外近来多了生面孔。再追问，他便把话头转回酒钱。",
            },
            {
              id: "open-shop",
              kind: "shop",
              label: "查看柜上货物",
              description: "购买金疮药、养气散和赶路干粮。",
            },
            {
              id: "open-inventory",
              kind: "inventory",
              label: "整理行囊",
              description: "查看药品、证物与当前携带数量。",
            },
          ],
        },
      },
      {
        id: "yang-backyard",
        name: "杨家后院",
        description: "雪地血迹绕过旧坟，通向柴房后的林子。",
        x: 57,
        y: 44,
        kind: "story",
        storyTargets: [
          { eventId: "shendiao-niujia-opening", nodeId: "main" },
        ],
        space: {
          sceneId: "yang-backyard",
          sceneLabel: "牛家村 · 杨家后院",
          background: STORY_STAGE_BACKGROUNDS["yang-backyard"],
          kicker: "枪架与柴房",
          description: "院墙不高，枪架靠着东墙，柴房与旧坟之间有一条少有人走的小路。",
          ambience: "屋里有人添柴，院角晾着药布，雪天时脚印会一直留到林边。",
          residents: [
            {
              name: "杨铁心",
              title: "杨家枪传人",
              line: "院里地方窄，枪法只练收势。真要过招，去村口空地。",
            },
            {
              name: "包惜弱",
              title: "杨门夫人",
              line: "药布已经晒干。若在村外见到伤者，先把人抬回来再问来路。",
            },
          ],
          actions: [
            {
              id: "talk-yangtiexin",
              kind: "talk",
              label: "问杨家枪",
              description: "请杨铁心说说枪架上的旧兵器。",
              resultText: "杨铁心说长枪是祖上传下的样式，练的不是花架子，而是马上冲阵与守门护人的本事。",
            },
            {
              id: "inspect-back-path",
              kind: "inspect",
              label: "查看后院小路",
              description: "辨认柴房、旧坟和林边之间的路线。",
              resultText: "小路绕过旧坟后分成两股：一股回村道，一股钻进林子。雨雪天最容易留下拖拽和马蹄痕迹。",
            },
            {
              id: "open-inventory",
              kind: "inventory",
              label: "整理行囊",
              description: "在屋檐下检查药品和证物。",
            },
          ],
        },
      },
      {
        id: "ruined-tavern",
        name: "废酒店后门",
        description: "段天德的亲随正在这里交接银封与调兵契纸。",
        x: 28,
        y: 36,
        kind: "story",
        storyTargets: [
          { eventId: "shendiao-niujia-opening", nodeId: "wait-righteous" },
        ],
        space: {
          sceneId: "niujia-ruined-inn",
          sceneLabel: "牛家村 · 废酒店后门",
          background: STORY_STAGE_BACKGROUNDS["niujia-ruined-inn"],
          kicker: "空店与泥路",
          description: "旧酒旗已经扯破，后门门轴松脱，泥地却常有新鲜马蹄和靴印。",
          ambience: "风从破窗穿过去，屋里残留着陈酒和潮木头的气味。",
          residents: [],
          actions: [
            {
              id: "inspect-mud",
              kind: "inspect",
              label: "检查泥地",
              description: "查看门后脚印、车辙与遗落物。",
              resultText: "门后的脚印分成官靴与软底快靴两类，车辙只压到后墙便折向村外，显然有人在这里短暂停车交接。",
            },
            {
              id: "inspect-cellar",
              kind: "inspect",
              label: "查看旧酒窖",
              description: "确认空店里是否还藏着人或货物。",
              resultText: "酒窖早已搬空，只在墙缝里留着半截封绳。绳上的朱砂颜色不像普通商号所用。",
            },
          ],
        },
      },
      {
        id: "west-grove",
        name: "村西林",
        description: "湿土新翻，树下还留着半截宫灯。",
        x: 18,
        y: 22,
        kind: "scenery",
        space: {
          sceneId: "niujia-west-grove",
          sceneLabel: "牛家村 · 村西林",
          background: STORY_STAGE_BACKGROUNDS["niujia-west-grove"],
          kicker: "松林与旧土",
          description: "林子不深，靠村一侧多是松树，往西便接上荒坟和通往临安的小路。",
          ambience: "白日只有鸟声，入夜后风穿过松针，细响很容易遮住脚步。",
          residents: [],
          actions: [
            {
              id: "inspect-soil",
              kind: "inspect",
              label: "查看翻土",
              description: "看看林中旧土、折枝和残留痕迹。",
              resultText: "几处湿土颜色比周围更深，旁边还有被靴底踩断的细枝。这里最近不止一个人在夜里动过土。",
            },
            {
              id: "listen-grove",
              kind: "inspect",
              label: "听林中动静",
              description: "分辨村路、荒坟和西侧小道的声音。",
              resultText: "村路上的脚步清楚，西侧小道却被松涛盖住。若有人熟悉地形，确实能从林后绕开村口。",
            },
          ],
        },
      },
      {
        id: "training-ground",
        name: "村口空地",
        description: "陆教头在木桩旁带村中青壮拆招守夜。",
        x: 78,
        y: 48,
        kind: "training",
        space: {
          sceneId: "niujia-training-ground",
          sceneLabel: "牛家村 · 村口空地",
          background: STORY_STAGE_BACKGROUNDS["niujia-training-ground"],
          kicker: "木桩与兵器架",
          description: "夯土空地上立着三排木桩，村中青壮平日由陆教头带着练拳守夜。",
          ambience: "柳树下摆着木刀和白蜡杆，远处能看见进村的两条路。",
          residents: [
            {
              name: "陆教头",
              title: "村中护院教头",
              line: "练功不是站一日便长本事。先摆架，再拆招，最后看你能不能守住三回合。",
            },
          ],
          actions: [
            {
              id: "talk-coach",
              kind: "talk",
              label: "请教基本架势",
              description: "听陆教头讲长拳的站桩、护头与收势。",
              resultText: "陆教头用白蜡杆点出你肩、肘、膝三处空门，让你先把架势摆稳，再谈出拳快慢。",
            },
            {
              id: "spar-coach",
              kind: "spar",
              label: "与陆教头过招",
              description: "进行一场低风险切磋，以实战积累阅历。",
              npcId: "niujia-coach",
            },
          ],
        },
      },
      {
        id: "village-exit",
        name: "出村驿路",
        description: "沿驿路返回江湖客舍。",
        x: 88,
        y: 72,
        kind: "exit",
        space: {
          sceneId: "niujia-east-road",
          sceneLabel: "牛家村 · 出村驿路",
          background: STORY_STAGE_BACKGROUNDS["niujia-east-road"],
          kicker: "石桥与官道",
          description: "驿路越过小桥后分往临安与红梅村，村民常在桥头交换车马消息。",
          ambience: "车辙沿桥面向外延伸，远处官道偶尔有商旅和差役经过。",
          residents: [
            {
              name: "桥头驿卒",
              title: "村路看守",
              line: "往临安的路还能走，天黑前若不回来，最好带盏风灯。",
            },
          ],
          actions: [
            {
              id: "ask-road",
              kind: "talk",
              label: "询问路况",
              description: "打听临安、红梅村和江边渡口的行程。",
              resultText: "驿卒说临安方向近来官差较多，红梅村路面尚稳，江边渡口则要看每日潮水。",
            },
            {
              id: "leave-village",
              kind: "exit",
              label: "离开牛家村",
              description: "沿驿路返回江湖客舍，未完剧情仍会保留。",
            },
          ],
        },
      },
    ],
  },
]
