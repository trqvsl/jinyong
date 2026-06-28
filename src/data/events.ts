import type { Player } from "../types"
import { getRandomEnemy, getEnemyById, getRandomEnemyFromPool } from "./enemies"
import { getSkillById } from "./skills"

function grantItem(player: Player, itemId: string, amount = 1): Player {
  return {
    ...player,
    inventory: {
      ...player.inventory,
      [itemId]: (player.inventory[itemId] ?? 0) + amount,
    },
  }
}

export interface EventChoiceResult {
  text: string
  player: Player
  startBattle?: boolean
  consumeDay?: boolean
  enemyId?: string
}

export interface EventChoice {
  id: string
  text: string
  description: string
  resolve: (player: Player) => EventChoiceResult
}

export interface StoryEvent {
  id: string
  title: string
  summary: string
  intro: string
  choices: EventChoice[]
  weight?: number
  condition?: (player: Player) => boolean
  locationId?: string             // 归属地点（去该地点时优先/必定触发）
}

export const STORY_EVENTS: StoryEvent[] = [
  // ===== 金庸原著剧情事件（射雕篇开头） =====
  // 主角作为"外来者"在牛家村风雪之夜介入原著开场。
  // 绑定到"牛家村"地点，由玩家主动前往触发。
  {
    id: "shendiao-niujia",
    title: "牛家村·风雪惊变",
    summary: "牛家村雪夜，一户农舍灯火通明，村外却已火把连绵。",
    intro:
      "你踏雪夜宿牛家村。一户农舍灯火通明，两名壮汉正与一位道人对饮，那道人目光如电、杀气内敛，绝非寻常之辈。你尚未来得及细看，村外火把连绵——一队官军已围住村子，冷喝\"奉命缉拿钦犯\"。风雪里，一场血战似已无可避免。",
    weight: 6,
    locationId: "niujia",
    choices: [
      {
        id: "defend",
        text: "挺身力战",
        description: "护那道人，与官军周旋，不论出身，先救人再说。",
        resolve: (player) => ({
          text:
            "你纵身跃入农舍院中，拔兵刃迎向官军。那道人见有人援手，眼中闪过一丝讶异，随即与两名壮汉并肩而上。一番厮杀，官军暂退，那道人抱拳道：\"阁下胆识过人，今日之情，贫道丘处机记下了。\"",
          player: { ...player, reputation: player.reputation + 3 },
          startBattle: true,
          enemyId: "guanjun",
          consumeDay: true,
        }),
      },
      {
        id: "escort-pregnant",
        text: "护送妇孺",
        description: "趁乱护送农舍中一位孕妇从后山出村，保全无辜。",
        resolve: (player) => ({
          text:
            "你借着风雪掩护，带着农舍中惊惶的孕妇从后山小路悄然出村。她紧紧护着腹中孩儿，低声谢你。走出数里，回望牛家村火光冲天，你心中隐隐觉得，这孩子日后恐怕不凡。",
          player: grantItem(
            { ...player, reputation: player.reputation + 4, hp: Math.max(1, player.hp - 5) },
            "field-ration",
            1
          ),
          consumeDay: true,
        }),
      },
      {
        id: "watch",
        text: "冷眼旁观",
        description: "藏身暗处，把那道人的全真剑法看个仔细，伺机而动。",
        resolve: (player) => ({
          text:
            "你伏于梁上，看那道人长剑如虹，官军竟一时近不得身。全真剑法的招式变化被你尽收眼底，似有所悟。待双方两败俱伤各自散去，你才悄然离开——只是这一夜袖手，心中难免留下几分愧疚。",
          player: { ...player, aptitude: Math.min(99, player.aptitude + 2), reputation: player.reputation - 2 },
          consumeDay: true,
        }),
      },
    ],
  },
  {
    id: "roadside-trouble",
    title: "路见纷争",
    summary: "前方传来吵嚷声，似有人在路边欺压商旅。",
    intro: "你沿山道前行，忽见几个地痞围住行脚商人。那商人神色惊慌，显然已被逼到绝境。",
    weight: 4,
    choices: [
      {
        id: "intervene",
        text: "拔刀相助",
        description: "挺身而出，直接与恶徒交手。",
        resolve: (player) => ({
          text: "你喝止恶徒，对方恼羞成怒，拔拳相向！",
          player,
          startBattle: true,
          consumeDay: true,
        }),
      },
      {
        id: "observe",
        text: "静观其变",
        description: "不贸然出手，先判断局势。",
        resolve: (player) => ({
          text: "你按兵不动，默记了这伙人的相貌，今日暂且未起波澜。",
          player: { ...player, reputation: player.reputation + 1 },
          consumeDay: true,
        }),
      },
    ],
  },
  {
    id: "hidden-cache",
    title: "荒祠遗物",
    summary: "破旧山神庙后，似乎藏着前人留下的东西。",
    intro: "你在野外避雨时，发现荒祠后墙有一块砖松动，里面竟藏着一个布包。",
    weight: 3,
    choices: [
      {
        id: "take-gold",
        text: "取走银两",
        description: "拿走布包内的碎银与干粮，补足旅费。",
        resolve: (player) => ({
          text: "你小心收起布包里的碎银，行囊顿时宽裕了些。",
          player: grantItem({ ...player, gold: player.gold + 40 }, "field-ration", 1),
          consumeDay: true,
        }),
      },
      {
        id: "leave-offering",
        text: "留下一炷香",
        description: "只取少量干粮，其余原样放回。",
        resolve: (player) => ({
          text: "你不愿多取，只带走少量干粮，心境反而更为安定。",
          player: { ...player, hp: Math.min(player.hpMax, player.hp + 18), reputation: player.reputation + 2 },
          consumeDay: true,
        }),
      },
    ],
  },
  {
    id: "strange-manual",
    title: "残页奇书",
    summary: "林间石桌上散着几页心法残章，似有人故意留在此地。",
    intro: "你在林间歇脚时，发现石桌上压着几页泛黄残纸，字迹潦草，却暗含武学思路。",
    weight: 2,
    condition: (player) => !player.skills.some((skill) => skill.id === "tiyun"),
    choices: [
      {
        id: "study",
        text: "细读残页",
        description: "花时间揣摩其中步法，或许能有所领悟。",
        resolve: (player) => {
          const skill = getSkillById("tiyun")
          const skills = skill ? [...player.skills, skill] : player.skills
          return {
            text: skill ? "你从残页中悟出几分腾挪步法，习得《梯云纵》！" : "你苦思良久，却只记下些零碎心得。",
            player: { ...player, skills },
            consumeDay: true,
          }
        },
      },
      {
        id: "memorize",
        text: "记下要点离开",
        description: "不强求立刻参透，只把关键句记在心里。",
        resolve: (player) => ({
          text: "你将关键句牢记于心，内息运转似乎也顺畅了些。",
          player: { ...player, mp: Math.min(player.mpMax, player.mp + 22), aptitude: Math.min(99, player.aptitude + 1) },
          consumeDay: true,
        }),
      },
    ],
  },
  {
    id: "escort-request",
    title: "旅商委托",
    summary: "一名行脚商人正为前路不安，似乎想雇人同行。",
    intro: "你在茶摊歇脚时，一名行脚商人低声问你可否护送一程，说前方山道常有宵小出没。",
    weight: 3,
    choices: [
      {
        id: "accept",
        text: "接下委托",
        description: "护送商人走一段山路，赚一笔辛苦钱。",
        resolve: (player) => ({
          text: "你护着商人平安穿过险路，对方千恩万谢，付了你一袋银两。",
          player: grantItem({ ...player, gold: player.gold + 55, reputation: player.reputation + 1 }, "small-hp-pill", 1),
          consumeDay: true,
        }),
      },
      {
        id: "decline",
        text: "婉言谢绝",
        description: "你还有别的安排，不想被委托束住脚步。",
        resolve: (player) => ({
          text: "你抱拳告辞，商人虽然失望，却也不再强求。",
          player,
          consumeDay: true,
        }),
      },
    ],
  },
  {
    id: "black-inn",
    title: "可疑客栈",
    summary: "日暮时分，你在路边发现一家灯火昏黄的小店，掌柜笑得让人不太放心。",
    intro: "夜色渐沉，客栈门外挂着一盏红灯。掌柜笑着招呼你进门歇脚，可你总觉得这店气氛不对。",
    weight: 2,
    choices: [
      {
        id: "stay-alert",
        text: "将计就计",
        description: "先进店观察，若有异动再伺机而动。",
        resolve: (player) => ({
          text: "你佯装入睡，果然听到脚步靠近。你先一步破门而出，还顺手带走了对方来不及藏好的碎银。",
          player: { ...player, gold: player.gold + 35, mp: Math.min(player.mpMax, player.mp + 10) },
          consumeDay: true,
        }),
      },
      {
        id: "leave-now",
        text: "转身离去",
        description: "宁可连夜赶路，也不住这间古怪小店。",
        resolve: (player) => ({
          text: "你没有停留，摸黑赶了一段夜路，虽有些疲惫，却避开了一场麻烦。",
          player: { ...player, mp: Math.max(0, player.mp - 8), reputation: player.reputation + 1 },
          consumeDay: true,
        }),
      },
    ],
  },
  {
    id: "senior-guidance",
    title: "前辈指点",
    summary: "山涧石台边，一位白发老人正在独自饮茶，似乎早已注意到你。",
    intro: "老人抬眼看了你一会儿，忽然笑道：\"你气息尚浅，却也有几分骨气。可愿听老夫一言？\"",
    weight: 2,
    choices: [
      {
        id: "listen",
        text: "虚心求教",
        description: "停下脚步，认真听前辈指点呼吸与出招。",
        resolve: (player) => ({
          text: "老人只寥寥几句，却让你顿觉豁然开朗，内息与身法都精进了一分。",
          player: { ...player, attack: player.attack + 1, speed: player.speed + 1, reputation: player.reputation + 1 },
          consumeDay: true,
        }),
      },
      {
        id: "bow-leave",
        text: "抱拳告辞",
        description: "礼数周全地退下，不打扰前辈清修。",
        resolve: (player) => ({
          text: "老人并未怪罪，只挥手示意你去。你离开时心境平和，气血也恢复了些。",
          player: grantItem({ ...player, hp: Math.min(player.hpMax, player.hp + 20) }, "small-mp-pill", 1),
          consumeDay: true,
        }),
      },
    ],
  },
  {
    id: "gambling-stall",
    title: "街头赌局",
    summary: "集市口围满了人，一名赌徒正吆喝着让人下注。",
    intro: "你路过集市时，见一张木桌前人头攒动。赌徒满脸兴奋，连声叫你也来试试手气。",
    weight: 2,
    choices: [
      {
        id: "bet-small",
        text: "押一把小注",
        description: "拿些碎银碰碰运气，输赢都不至于伤筋动骨。",
        resolve: (player) => {
          const win = Math.random() < 0.5
          return win
            ? {
                text: "你手气不错，小赚一笔，围观众人都高看了你几眼。",
                player: { ...player, gold: player.gold + 30 },
                consumeDay: true,
              }
            : {
                text: "你押错了门路，碎银被赢走，只好苦笑着退出人群。",
                player: { ...player, gold: Math.max(0, player.gold - 20) },
                consumeDay: true,
              }
        },
      },
      {
        id: "walk-away",
        text: "不沾赌局",
        description: "看一眼热闹便离开，不让自己陷进去。",
        resolve: (player) => ({
          text: "你没有停留太久，只把集市的喧闹当成过耳风声。",
          player: { ...player, reputation: player.reputation + 1 },
          consumeDay: true,
        }),
      },
    ],
  },
  {
    id: "sect-messenger",
    title: "门派传讯",
    summary: "山道上，一名弟子匆匆而来，似乎在替某处门派传话。",
    intro: "来人衣着整肃，见你气息不俗，便试探着问你是否有意日后上山拜访师门习艺。",
    weight: 2,
    choices: [
      {
        id: "ask-sects",
        text: "多问两句",
        description: "趁机了解各门各派的风格与路数。",
        resolve: (player) => ({
          text: "你与那弟子交谈许久，对江湖门派的脉络更熟悉了，日后择师也会更有主见。",
          player: { ...player, reputation: player.reputation + 1, aptitude: Math.min(99, player.aptitude + 1) },
          consumeDay: true,
        }),
      },
      {
        id: "hurry-on",
        text: "继续赶路",
        description: "你暂时无意停留，决定等时机成熟再说。",
        resolve: (player) => ({
          text: "你谢过传讯弟子，心里却也记下了各派山门的去处。",
          player,
          consumeDay: true,
        }),
      },
    ],
  },
]

export function getRandomStoryEvent(player: Player): StoryEvent {
  const available = STORY_EVENTS.filter((event) => (event.condition ? event.condition(player) : true))
  const pool = available.length > 0 ? available : STORY_EVENTS
  const weighted = pool.flatMap((event) => Array(event.weight ?? 1).fill(event))
  const chosen = weighted[Math.floor(Math.random() * weighted.length)]
  return chosen
}

// 按 id 取事件（调试/强制触发用）
export function getStoryEventById(id: string): StoryEvent | undefined {
  return STORY_EVENTS.find((event) => event.id === id)
}

// 按地点取事件：优先返回该地点的专属剧情事件（满足 condition 才触发），
// 否则回退到全局随机事件。这样"去牛家村"稳定触发风雪惊变，去其他地点仍可遇奇遇。
export function getStoryEventByLocation(player: Player, locationEvents: string[]): StoryEvent {
  for (const eventId of locationEvents) {
    const event = getStoryEventById(eventId)
    if (event && (!event.condition || event.condition(player))) {
      return event
    }
  }
  return getRandomStoryEvent(player)
}

export function getAdventureEnemy(player: Player, enemyId?: string, locationPool?: string[]) {
  if (enemyId) return getEnemyById(enemyId)
  if (locationPool && locationPool.length > 0) return getRandomEnemyFromPool(player, locationPool)
  return getRandomEnemy(player)
}
