import type { Player } from "../../types"
import type { StoryEvent } from "../events"
import { getSkillById } from "../skills"

// ============================================================
// 射雕英雄传 · 剧情卷
// 按原著脉络的关键节点，主角作为"穿越者"介入原著故事。
// 节点：牛家村(已在通用卷) → 大漠成长 → 南下中原 → 桃花岛 …
// 设计见《世界观设定.md》：原著角色保留底色，主角走平行分支。
// ============================================================

function grantItem(player: Player, itemId: string, amount = 1): Player {
  return { ...player, inventory: { ...player.inventory, [itemId]: (player.inventory[itemId] ?? 0) + amount } }
}

export const SHENDIAO_STORY: StoryEvent[] = [
  // ===== 大漠成长 =====
  // 主角到大漠，撞见少年郭靖拜师学艺的场面，可介入指点/旁观/结交。
  {
    id: "shendiao-damos",
    title: "大漠·少年射雕",
    summary: "大漠深处，一个憨厚的少年正跟着几位怪师学武，远处有雕鸣。",
    intro:
      "你深入蒙古大漠，远远望见一个憨厚少年正跟着七位形貌各异的师父苦练武功。他招式笨拙却肯下死功，额上汗水淋漓。忽而一只白雕掠过天际，少年抬手一箭，正中雕翅——好生神准！",
    weight: 5,
    condition: (player) => player.reputation >= 3,
    locationId: "damos",
    choices: [
      {
        id: "guide",
        text: "上前指点",
        description: "看出少年根骨佳却不得其法，忍不住点拨几句。",
        resolve: (player) => ({
          text: "你上前点拨那少年运气发力的门道。他虽憨厚，却如获至宝，连连道谢。那七位怪师见你出手不凡，亦拱手相谢。少年名叫郭靖——这名字，你似乎在哪儿听过。",
          player: { ...player, reputation: player.reputation + 3, aptitude: Math.min(99, player.aptitude + 1) },
          relationChanges: [{ npcId: "guojing", delta: 8 }],
          consumeDay: true,
        }),
      },
      {
        id: "spar",
        text: "切磋比试",
        description: "与少年过几招，试试他的斤两。",
        resolve: (player) => ({
          text: "你与郭靖切磋数招。他外家功夫扎实，却拙于变化。一番比试下来，你把自己的招式也磨砺得更精纯了。",
          player: { ...player, attack: player.attack + 2, reputation: player.reputation + 2 },
          consumeDay: true,
        }),
      },
      {
        id: "befriend",
        text: "结交为友",
        description: "欣赏这少年的憨直，请他喝碗马奶酒。",
        resolve: (player) => ({
          text: "你与郭靖对饮马奶酒，他说起大漠的辽阔与江南的故乡，眼中满是向往。临别时他紧紧握住你的手：\"后会有期！\" 这份豪爽之交，让你心中暖意涌动。",
          player: grantItem({ ...player, reputation: player.reputation + 4, hp: Math.min(player.hpMax, player.hp + 20) }, "field-ration", 2),
          relationChanges: [{ npcId: "guojing", delta: 20 }],
          consumeDay: true,
        }),
      },
    ],
  },

  // ===== 南下遇蓉 =====
  // 主角南下中原，在客栈撞见扮作乞丐的黄蓉与憨直的郭靖，正是原著名场面。
  {
    id: "shendiao-meet-rong",
    title: "南下中原·客栈奇缘",
    summary: "中原小镇客栈里，一个脏兮兮的小乞丐正大快朵颐，身旁陪着个憨厚青年。",
    intro:
      "你南下中原，在一家客栈歇脚。邻桌一个满脸煤灰的小乞丐正点满一桌好菜大快朵颐，吃相却颇为斯文；身旁陪着个憨厚青年，一脸宠溺地看着。你眼角一跳——这乞丐……怎么看都不像寻常叫花子。",
    weight: 4,
    condition: (player) => player.reputation >= 6,
    locationId: "linan",
    choices: [
      {
        id: "chat",
        text: "上前搭话",
        description: "这两人气质不凡，不妨结识一番。",
        resolve: (player) => ({
          text: "你上前攀谈。那小乞丐眼珠一转，三言两语便试探出你的深浅，随即咯咯笑了起来：\"你这人倒有趣。\" 那憨厚青年正是郭靖，见你友善，忙请你同坐。这一席话，让你对江湖又多了几分见识。",
          player: { ...player, reputation: player.reputation + 3, aptitude: Math.min(99, player.aptitude + 2) },
          relationChanges: [{ npcId: "huangrong", delta: 10 }, { npcId: "guojing", delta: 8 }],
          consumeDay: true,
        }),
      },
      {
        id: "treat",
        text: "请客结账",
        description: "替这两人付了酒钱，结个善缘。",
        resolve: (player) => ({
          text: "你悄悄替他们结了账。小乞丐察觉后挑眉看你，似在重新估量你。临别时她凑近低声道：\"你这人心眼不错，往后若有难处，可去桃花岛寻我。\" 桃花岛？你心头一动。",
          player: { ...player, gold: Math.max(0, player.gold - 50), reputation: player.reputation + 5 },
          relationChanges: [{ npcId: "huangrong", delta: 18 }, { npcId: "guojing", delta: 6 }],
          consumeDay: true,
        }),
      },
      {
        id: "observe-quietly",
        text: "静观不语",
        description: "这两人来历不凡，不贸然搭讪。",
        resolve: (player) => ({
          text: "你默默观察，只见那小乞丐谈笑间机锋暗藏，憨厚青年却一片赤诚。你暗暗记下这对组合——日后江湖上，他们必有一番大作为。",
          player: { ...player, reputation: player.reputation + 1 },
          consumeDay: true,
        }),
      },
    ],
  },

  // ===== 王府盗书 =====
  // 赵王府中藏有武学秘籍，主角可潜入盗取，遇梅超风等反派。
  {
    id: "shendiao-wangfu",
    title: "赵王府·夜探藏经",
    summary: "夜色中的赵王府戒备森严，传闻府内藏有武林秘籍。",
    intro:
      "你打听到赵王府中藏有一部武学秘籍，遂趁夜潜入。王府重重院落，灯火通明处隐约可见高手巡夜。你屏息潜行，忽闻远处传来一阵凄厉的怪笑——似有人正在练那阴毒的九阴白骨爪。",
    weight: 3,
    condition: (player) => player.reputation >= 8,
    locationId: "linan",
    choices: [
      {
        id: "steal",
        text: "深入盗书",
        description: "风险与机缘并存，博他一回。",
        resolve: (player) => {
          const skill = getSkillById("jiuyang")
          const skills = skill && !player.skills.some((s) => s.id === skill.id) ? [...player.skills, skill] : player.skills
          return {
            text: skill ? "你潜入王府密室，竟寻得一部内功心法残卷，依稀是《九阳神功》的根基！虽险些被梅超风察觉，终是全身而退。" : "你潜入王府，虽未得秘籍，却在密室中悟得几分内息运功之法，内力有所精进。",
            player: { ...player, skills, mp: Math.min(player.mpMax, player.mp + 20), reputation: player.reputation + 2 },
            consumeDay: true,
          }
        },
      },
      {
        id: "ambush",
        text: "伏击巡夜",
        description: "遇到王府高手，索性一战。",
        resolve: (player) => ({ text: "你撞上王府的护院高手，对方冷喝一声拔刀相向！", player, startBattle: true, enemyId: "emingke", consumeDay: true, afterBattle: { victoryText: "你几招之间制服王府护院，搜身竟得了一本残破的武学手札与若干碎银。虽未及深入藏经之所，这番收获也已不菲，江湖经验更增几分。", victoryRewards: (p) => grantItem({ ...p, gold: p.gold + 40, reputation: p.reputation + 2 }, "small-mp-pill", 1), defeatText: "护院高手武艺不弱，你力战不敌，趁夜色狼狈逃出王府。此行空手而归，还险些折在里面。", fledText: "你见护院身手不凡，不愿纠缠，虚晃几招遁入夜色，全身而退。" } }),
      },
      {
        id: "retreat",
        text: "见好就收",
        description: "王府高手如云，不可逞强。",
        resolve: (player) => ({ text: "你见王府戒备森严、高手如云，明智地选择全身而退。虽空手而归，却保全了性命。", player: { ...player, reputation: player.reputation + 1 }, consumeDay: true }),
      },
    ],
  },
]