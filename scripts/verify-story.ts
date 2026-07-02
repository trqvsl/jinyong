// 剧情引擎单测：consequences / conditions / branch / onEnter 幂等
// 运行：npx tsx scripts/verify-story.ts
import type { Player } from "../src/types"
import { createWorld } from "../src/game/story/state"
import { applyConsequences } from "../src/game/story/consequences"
import { checkCondition } from "../src/game/story/conditions"
import { resolveBranch, enterNode, resolveChoice } from "../src/game/story/engine"
import type { StoryEvent, Transition } from "../src/data/story/schema"

function mkPlayer(over: Partial<Player> = {}): Player {
  return {
    name: "测试", level: 1, exp: 0, expMax: 100, gold: 100, aptitude: 50,
    roots: { strength: 5, external: 5, internal: 3, comprehension: 50, constitution: 5, breath: 5, agility: 5, luck: 30 },
    attributePoints: 0, mastery: {}, relations: {}, alignment: "中", karma: 0, reputation: 0, day: 1,
    skills: [], inventory: {}, world: createWorld(),
    hp: 100, hpMax: 100, mp: 50, mpMax: 50, attack: 10, defense: 5, speed: 10, statuses: [],
    ...over,
  } as Player
}

let pass = 0, fail = 0
function check(label: string, cond: boolean, detail = "") {
  if (cond) { pass++; console.log(`  ✓ ${label}`) }
  else { fail++; console.log(`  ✗ ${label} ${detail}`) }
}

console.log("\n=== 1. applyConsequences：数值类 + clamp + alignment 同步 ===")
{
  const r = applyConsequences(mkPlayer(), createWorld(), [
    { kind: "karma", delta: 40 },        // 0 → 40
    { kind: "reputation", delta: 5 },
    { kind: "gold", delta: -30 },
    { kind: "karma", delta: 200 },       // clamp 到 100
  ])
  check("karma 被 clamp 到 100", r.player.karma === 100, `karma=${r.player.karma}`)
  check("karma≥30 → alignment 派生为正", r.player.alignment === "正", `alignment=${r.player.alignment}`)
  check("reputation +5", r.player.reputation === 5, `rep=${r.player.reputation}`)
  check("gold 100-30=70", r.player.gold === 70, `gold=${r.player.gold}`)
}
{
  const r = applyConsequences(mkPlayer(), createWorld(), [{ kind: "karma", set: -50 }])
  check("karma set=-50 生效", r.player.karma === -50)
  check("karma≤-30 → alignment 派生为邪", r.player.alignment === "邪")
}

console.log("\n=== 2. item / skill / relation ===")
{
  const r = applyConsequences(mkPlayer(), createWorld(), [
    { kind: "item", id: "small-hp-pill", count: 2 },
    { kind: "item", id: "small-hp-pill", count: -1 },
    { kind: "skill", id: "tiyun" },
    { kind: "skill", id: "tiyun" },        // 重复习得应去重
    { kind: "relation", npcId: "qiuchuji", delta: 15 },
    { kind: "relation", npcId: "qiuchuji", delta: 200 },  // clamp 100
  ])
  check("道具 +2-1=1", r.player.inventory["small-hp-pill"] === 1, `count=${r.player.inventory["small-hp-pill"]}`)
  check("武功习得且去重（只1个梯云纵）", r.player.skills.filter((s) => s.id === "tiyun").length === 1)
  check("relation clamp 到 100", r.player.relations["qiuchuji"] === 100, `rel=${r.player.relations["qiuchuji"]}`)
}

console.log("\n=== 3. NPC 命运 / 阵营 / arcBeat / flag ===")
{
  const r = applyConsequences(mkPlayer(), createWorld(), [
    { kind: "npcAlive", npcId: "yangkang", alive: false },
    { kind: "npcRecruit", npcId: "guojing", recruited: true },
    { kind: "npcTag", npcId: "yangkang", tag: "已黑化" },
    { kind: "npcRelationType", npcId: "hongqigong", relationType: "师徒" },
    { kind: "factionAttitude", factionId: "quanzhen", delta: 15 },
    { kind: "factionAttitude", factionId: "quanzhen", set: -40 },
    { kind: "arcBeat", arcId: "shendiao", beat: "niujia", result: "won" },
    { kind: "flag", name: "niujiacun.helped", value: true },
  ])
  const w = r.world
  check("杨康死亡", w.npcs["yangkang"].alive === false)
  check("郭靖入队", w.npcs["guojing"].recruited === true)
  check("杨康命运标记", w.npcs["yangkang"].fateTags.includes("已黑化"))
  check("NPC 关系类型写入", w.npcs["hongqigong"].relationType === "师徒")
  check("阵营态度 set 覆盖", w.factions["quanzhen"].attitude === -40, `att=${w.factions["quanzhen"].attitude}`)
  check("arcBeat 写入", w.arcs["shendiao"].beats["niujia"] === "won")
  check("flag 写入", w.flags["niujiacun.helped"] === true)
  // 不污染入参
  check("不污染入参 world", createWorld().npcs["yangkang"] === undefined)
}

console.log("\n=== 4. checkCondition：默认值 + 区间 + 组合 ===")
{
  const p = mkPlayer({ karma: 25, reputation: 10 })
  const w = createWorld()
  check("karma 区间 gte", checkCondition(p, w, { kind: "karma", gte: 20 }))
  check("karma 区间 lte（25 不 ≥30）", !checkCondition(p, w, { kind: "karma", gte: 30 }))
  check("NPC 无条目默认 alive=true", checkCondition(p, w, { kind: "npcAlive", npcId: "nobody", alive: true }))
  check("NPC 无条目默认 recruited=false", !checkCondition(p, w, { kind: "npcRecruited", npcId: "nobody" }))
  check("npcRelationType 未设置默认=初识", checkCondition(p, w, { kind: "npcRelationType", npcId: "nobody", eq: "初识" }))
  check("npcRelationType 初识≠朋友", !checkCondition(p, w, { kind: "npcRelationType", npcId: "nobody", eq: "朋友" }))
  check("faction 无条目默认 attitude=0，gte10 不满足", !checkCondition(p, w, { kind: "factionAttitude", factionId: "xxx", gte: 10 }))
  check("arcBeat 未完成 → false", !checkCondition(p, w, { kind: "arcBeat", arcId: "a", beat: "b" }))
  check("and 组合", checkCondition(p, w, { kind: "and", items: [{ kind: "karma", gte: 20 }, { kind: "reputation", gte: 5 }] }))
  check("not 组合", checkCondition(p, w, { kind: "not", item: { kind: "karma", gte: 30 } }))
}
{
  // arcBeat result 语义
  const p = mkPlayer()
  const w = createWorld()
  const r = applyConsequences(p, w, [{ kind: "arcBeat", arcId: "a", beat: "b", result: "lost" }])
  check("arcBeat 已完成不论结果（result 缺省）", checkCondition(r.player, r.world, { kind: "arcBeat", arcId: "a", beat: "b" }))
  check("arcBeat 指定 result=lost 匹配", checkCondition(r.player, r.world, { kind: "arcBeat", arcId: "a", beat: "b", result: "lost" }))
  check("arcBeat 指定 result=won 不匹配", !checkCondition(r.player, r.world, { kind: "arcBeat", arcId: "a", beat: "b", result: "won" }))
}
{
  // npcRelationType 条件：设置后匹配
  const p = mkPlayer()
  const w = createWorld()
  const r = applyConsequences(p, w, [{ kind: "npcRelationType", npcId: "hongqigong", relationType: "师徒" }])
  check("npcRelationType 匹配（师徒）", checkCondition(r.player, r.world, { kind: "npcRelationType", npcId: "hongqigong", eq: "师徒" }))
  check("npcRelationType 不匹配（朋友）", !checkCondition(r.player, r.world, { kind: "npcRelationType", npcId: "hongqigong", eq: "朋友" }))
}

console.log("\n=== 5. resolveBranch：条件分叉 + 嵌套 + else ===")
{
  const p = mkPlayer({ karma: 40 })
  const w = createWorld()
  const t: Transition = {
    type: "branch", cases: [
      { when: { kind: "karma", gte: 30 }, then: { type: "goto", nodeId: "good" } },
    ], else: { type: "goto", nodeId: "neutral" },
  }
  check("命中 case", resolveBranch(p, w, t).type === "goto" && (resolveBranch(p, w, t) as any).nodeId === "good")
  const p2 = mkPlayer({ karma: 0 })
  check("落空 → else", (resolveBranch(p2, w, t) as any).nodeId === "neutral")
  // 嵌套 branch
  const tn: Transition = { type: "branch", cases: [{ when: { kind: "karma", gte: 30 }, then: t }] }
  check("嵌套 branch 递归解析", (resolveBranch(p, w, tn) as any).nodeId === "good")
}

console.log("\n=== 6. enterNode onEnter 幂等 + resolveChoice ===")
{
  const event: StoryEvent = {
    id: "t", entryNode: "n1",
    nodes: {
      n1: {
        id: "n1", text: "节点1",
        onEnter: [{ kind: "gold", delta: 10 }],
        choices: [{ id: "c1", text: "拿钱", transition: { type: "end" }, consequences: [{ kind: "gold", delta: 5 }] }],
      },
    },
  }
  const p = mkPlayer({ gold: 0 })
  const e1 = enterNode(p, p.world, event, "n1")!
  check("onEnter 首次结算（gold+10）", e1.player.gold === 10, `gold=${e1.player.gold}`)
  const e2 = enterNode(e1.player, e1.world, event, "n1")!
  check("onEnter 幂等（二次进入不重算）", e2.player.gold === 10, `gold=${e2.player.gold}`)
  const rc = resolveChoice(e2.player, e2.world, event, "n1", "c1")!
  check("resolveChoice 结算选项后果（gold+5）", rc.player.gold === 15, `gold=${rc.player.gold}`)
  check("resolveChoice 返回流转", rc.transition.type === "end")
}

console.log(`\n========================================`)
console.log(`通过 ${pass} / 失败 ${fail}`)
console.log(`========================================`)
process.exit(fail > 0 ? 1 : 0)
