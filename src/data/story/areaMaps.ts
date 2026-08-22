import { STORY_STAGE_BACKGROUNDS } from "./stageAssets"

export type StoryAreaSpotKind = "story" | "training" | "exit" | "scenery"
export type StoryAreaActionKind =
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
  dialogues: StoryAreaDialogue[]
  visibleDuring?: StoryAreaTarget[]
}

export interface StoryAreaDialogue {
  id: string
  label: string
  description: string
  response: string
}

export interface StoryAreaAction {
  id: string
  kind: StoryAreaActionKind
  label: string
  description: string
  resultText?: string
  npcId?: string
  visibleDuring?: StoryAreaTarget[]
}

export interface StoryAreaSpace {
  sceneId: string
  sceneLabel: string
  background: string
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

const OPENING_AREA_ENTRY_TARGETS: StoryAreaTarget[] = [
  { eventId: "shendiao-niujia-opening", nodeId: "riverbank" },
]

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
          description: "两株老松之间铺着说书人的草席，江风卷着潮气吹过围听人群。",
          ambience: "潮声压着木板脆响，渡船号子从下游断断续续传来。",
          residents: [
            {
              name: "张十五",
              title: "钱塘说书人",
              line: "木板还没开场。江边人齐了，今日说《叶三姐节烈记》。",
              dialogues: [
                {
                  id: "today-story",
                  label: "问今日书目",
                  description: "听听今日说的是哪一段话本。",
                  response: "张十五：“不说神仙斗法，说一个北地姑娘。她家被兵火冲散，好容易团聚，回乡却只剩断墙。后面的事，等人齐了再开口。”",
                },
                {
                  id: "story-tools",
                  label: "问木板与小鼓",
                  description: "问他为何既敲木板，又带一面小鼓。",
                  response: "张十五：“木板收人声，小鼓催紧处。该慢时留一口气，该急时三槌赶上去。只有嘴里平平说到底，那不叫说书。”",
                },
                {
                  id: "village-audience",
                  label: "问村中听客",
                  description: "打听常来江边听书的村民。",
                  response: "张十五：“郭杨两位最肯听北地旧事，也肯替穷人付几枚书钱。曲掌柜不多话，送来的热酒倒从不掺水。”",
                },
              ],
            },
          ],
          actions: [
            {
              id: "watch-tide",
              kind: "inspect",
              label: "查看潮势",
              description: "沿江岸看看渡船、村路与说书场的位置。",
              resultText: "江水正涨，渡船都拴在高处。村中酒馆的酒旗就在路尽头，离两株松树不过百余步。",
            },
          ],
        },
      },
      {
        id: "qusan-tavern",
        name: "酒馆",
        description: "酒帘已经落下，后院偶尔传来鸡叫。",
        x: 23,
        y: 48,
        kind: "scenery",
        space: {
          sceneId: "qusan-tavern",
          sceneLabel: "牛家村 · 酒馆",
          background: STORY_STAGE_BACKGROUNDS["qusan-tavern"],
          description: "临江小店只有几张木桌，墙边摞着酒坛，后门通向傻姑住的院子。",
          ambience: "门外江风不时把半截酒帘吹进屋里，后院偶尔传来鸡叫。",
          residents: [
            {
              name: "曲三",
              title: "跛脚掌柜",
              line: "喝酒便坐，问旧事就免了。柜上还有些伤药和干粮。",
              dialogues: [
                {
                  id: "new-faces",
                  label: "问村外生面孔",
                  description: "问近来为何总有陌生人沿江路经过。",
                  response: "曲三把酒碗倒扣在柜上。曲三：“两个问渡口，一个问临安旧路，都不像真要赶路。天黑以后少在村西走。”",
                },
                {
                  id: "leg-injury",
                  label: "问他的腿伤",
                  description: "问他拄着双拐，为何动作仍如此利落。",
                  response: "曲三：“旧伤。端酒不洒，靠的是手稳，不是腿好。你若来喝酒，我给你烫一壶；若来查根底，这桌便不留了。”",
                },
                {
                  id: "counter-goods",
                  label: "问柜上货物",
                  description: "问伤药和干粮从何处进货。",
                  response: "曲三：“药是红梅村郎中配的，干粮是傻姑帮着包的。贵不到哪去，也不赊账。要买便自己看柜。”",
                },
              ],
              visibleDuring: OPENING_AREA_ENTRY_TARGETS,
            },
            {
              name: "傻姑",
              title: "曲三养女",
              line: "傻姑抱着鸡食盆躲在门后，只肯把公鸡叫作大老虎。",
              dialogues: [
                {
                  id: "rooster",
                  label: "问“大老虎”",
                  description: "问她为何把公鸡叫作老虎。",
                  response: "傻姑把鸡食盆抱紧。傻姑：“它会啄人，还会飞上酒坛。爹说抓住才给半块饼。大老虎最坏。”",
                },
                {
                  id: "wooden-box",
                  label: "问后院木匣",
                  description: "问她总守着的旧木匣是谁留下的。",
                  response: "傻姑立刻摇头，把衣角塞到匣盖缝里。傻姑：“爹的。不能开。桃花也不能给你看。”",
                },
              ],
            },
          ],
          actions: [
            {
              id: "open-shop",
              kind: "shop",
              label: "查看柜上货物",
              description: "购买金疮药、养气散和赶路干粮。",
              visibleDuring: OPENING_AREA_ENTRY_TARGETS,
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
          description: "院墙不高，枪架靠着东墙，柴房与旧坟之间有一条少有人走的小路。",
          ambience: "屋里有人添柴，院角晾着药布，雪天时脚印会一直留到林边。",
          residents: [
            {
              name: "杨铁心",
              title: "杨家枪传人",
              line: "院里地方窄，枪法只练收势。真要过招，去村口空地。",
              dialogues: [
                {
                  id: "yang-spear",
                  label: "问杨家枪",
                  description: "问枪架上的长枪传自何处。",
                  response: "杨铁心：“祖上杨再兴在岳爷爷帐下使枪。传到我手里，只剩几路守门、破阵的硬功夫，不敢拿来卖弄。”",
                },
                {
                  id: "guo-brother",
                  label: "问郭啸天",
                  description: "问他与郭家为何比邻而居。",
                  response: "杨铁心：“我与郭大哥一路避乱到江南，在牛家村结义落脚。两家院墙挨着，真有急事，一声便能听见。”",
                },
                {
                  id: "village-watch",
                  label: "问守夜安排",
                  description: "问村中近来为何开始轮流守夜。",
                  response: "杨铁心：“江边多了问路不赶路的人。郭大哥守前半夜，我看后半夜；村口空地的青壮也轮着来。”",
                },
              ],
            },
            {
              name: "包惜弱",
              title: "杨门夫人",
              line: "药布已经晒干。若在村外见到伤者，先把人抬回来再问来路。",
              dialogues: [
                {
                  id: "medicine-cloth",
                  label: "问院中药布",
                  description: "问屋檐下为何总晾着洗净的药布。",
                  response: "包惜弱：“猎户割伤、船夫擦破手，都会来借几条。洗净晒透，下次才不至于把伤口弄坏。”",
                },
                {
                  id: "back-path",
                  label: "问后院小路",
                  description: "问柴房后的小路通向哪里。",
                  response: "包惜弱：“绕过旧坟便进林子，平日只有拾柴的人走。雪天若有人经过，脚印会留得很清楚。”",
                },
                {
                  id: "two-families",
                  label: "问郭杨两家",
                  description: "问两户人家平日如何照应。",
                  response: "包惜弱：“郭大嫂做面食，我替她缝衣；两位兄长夜里练兵器，我们便把院门替他们留着。都是寻常日子。”",
                },
              ],
            },
          ],
          actions: [
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
        name: "废酒馆后门",
        description: "段天德的亲随正在这里交接银封与调兵契纸。",
        x: 28,
        y: 36,
        kind: "story",
        storyTargets: [
          { eventId: "shendiao-niujia-opening", nodeId: "wait-righteous" },
        ],
        space: {
          sceneId: "niujia-ruined-inn",
          sceneLabel: "牛家村 · 废酒馆后门",
          background: STORY_STAGE_BACKGROUNDS["niujia-ruined-inn"],
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
          description: "夯土空地上立着三排木桩，村中青壮平日由陆教头带着练拳守夜。",
          ambience: "柳树下摆着木刀和白蜡杆，远处能看见进村的两条路。",
          residents: [
            {
              name: "陆教头",
              title: "村中护院教头",
              line: "练功不是站一日便长本事。先摆架，再拆招，最后看你能不能守住三回合。",
              dialogues: [
                {
                  id: "stance",
                  label: "请教站架",
                  description: "请他指出长拳起手最常见的毛病。",
                  response: "陆教头用白蜡杆先点肩，再点膝弯。陆教头：“肩抬高，拳就浮；膝锁死，脚就慢。先把这两处收住。”",
                },
                {
                  id: "spar-rules",
                  label: "问切磋规矩",
                  description: "问过招时如何分胜负。",
                  response: "陆教头：“木刀木杆，不打后脑，不追倒地的人。你能守住三轮便算有根基，能逼我退一步才算真长进。”",
                },
                {
                  id: "night-watch",
                  label: "问村口守夜",
                  description: "问近来守夜时见过什么。",
                  response: "陆教头：“临安方向来过两匹快马，进村前换了软底鞋。人没住店，只绕着郭杨两家看了一圈。”",
                },
              ],
            },
          ],
          actions: [
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
          description: "驿路越过小桥后分往临安与红梅村，村民常在桥头交换车马消息。",
          ambience: "车辙沿桥面向外延伸，远处官道偶尔有商旅和差役经过。",
          residents: [
            {
              name: "桥头驿卒",
              title: "村路看守",
              line: "往临安的路还能走，天黑前若不回来，最好带盏风灯。",
              dialogues: [
                {
                  id: "linan-road",
                  label: "问临安路况",
                  description: "打听官道上近来的车马。",
                  response: "驿卒：“商车照走，官差却比往常多。两拨人都拿着公文，问的不是货，是牛家村住户。”",
                },
                {
                  id: "river-ferry",
                  label: "问江边渡口",
                  description: "问今日还能否过江。",
                  response: "驿卒：“申时前能过，潮头一上来便收船。夜里若真要走，只能沿北边田埂绕远路。”",
                },
                {
                  id: "red-plum-road",
                  label: "问红梅村",
                  description: "打听去红梅村的小路。",
                  response: "驿卒：“过石桥向西，两里见梅林便是。路窄，马车难走，徒步藏人倒比官道方便。”",
                },
              ],
            },
          ],
          actions: [
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
