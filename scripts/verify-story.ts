// 剧情引擎单测：consequences / conditions / branch / onEnter 幂等
// 运行：npx tsx scripts/verify-story.ts
import type { Player } from "../src/types"
import { STORY_EVENTS } from "../src/data/events"
import { STORY_VOLUMES } from "../src/data/story"
import { WORLD_EVENTS } from "../src/data/story/worldEvents"
import { getLocationById } from "../src/data/map"
import { createWorld, migrateWorld } from "../src/game/story/state"
import { applyConsequences } from "../src/game/story/consequences"
import { checkCondition } from "../src/game/story/conditions"
import { resolveBranch, enterNode, resolveChoice, resolveBattleOutcome } from "../src/game/story/engine"
import { getStoryProgress } from "../src/game/story/query"
import {
  createBattleEntryCommand,
  getBattleTeammates,
  openLocationStory,
  resolveStoryFlow,
  restoreStoryCheckpoint,
  setStoryCheckpoint,
} from "../src/game/appFlow"
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

function warn(label: string, detail = "") {
  console.log(`  ⚠ ${label}${detail ? ` ${detail}` : ""}`)
}

const ALL_STORY_EVENTS: StoryEvent[] = [
  ...STORY_EVENTS,
  ...STORY_VOLUMES,
  ...WORLD_EVENTS.map((worldEvent) => worldEvent.event),
]

function walkTransition(
  transition: Transition | undefined,
  visit: (transition: Transition) => void,
) {
  if (!transition) return
  visit(transition)
  switch (transition.type) {
    case "branch":
      transition.cases.forEach((item) => walkTransition(item.then, visit))
      walkTransition(transition.else, visit)
      return
    case "random":
      transition.cases.forEach((item) => walkTransition(item.then, visit))
      return
    case "battle":
      walkTransition(transition.onWin?.then, visit)
      walkTransition(transition.onLose?.then, visit)
      walkTransition(transition.onFlee?.then, visit)
      return
    default:
      return
  }
}

function collectStaticStoryWarnings(events: StoryEvent[]) {
  const warningMessages: string[] = []
  const eventIdsByNodeId = new Map<string, Set<string>>()

  for (const event of events) {
    const seenNodeIds = new Set<string>()
    for (const node of Object.values(event.nodes)) {
      if (seenNodeIds.has(node.id)) continue
      seenNodeIds.add(node.id)
      const bucket = eventIdsByNodeId.get(node.id) ?? new Set<string>()
      bucket.add(event.id)
      eventIdsByNodeId.set(node.id, bucket)
    }
  }

  for (const [nodeId, eventIds] of eventIdsByNodeId.entries()) {
    if (eventIds.size > 1) {
      warningMessages.push(`nodeId \`${nodeId}\` 被多个事件复用：${Array.from(eventIds).sort().join(", ")}`)
    }
  }

  return warningMessages.sort()
}

function collectFlagWarnings(events: StoryEvent[]) {
  const writes = new Map<string, Set<string>>()
  const reads = new Map<string, Set<string>>()
  const variantWrites = new Map<string, Set<string>>()
  const variantReads = new Map<string, Set<string>>()

  const track = (bucket: Map<string, Set<string>>, flagName: string, source: string) => {
    const owners = bucket.get(flagName) ?? new Set<string>()
    owners.add(source)
    bucket.set(flagName, owners)
  }

  const walkCondition = (cond: any, source: string) => {
    if (!cond) return
    switch (cond.kind) {
      case "flag":
        track(reads, cond.name, source)
        return
      case "arcVariant":
        track(variantReads, `${cond.arcId}.${cond.key}`, source)
        return
      case "and":
      case "or":
        cond.items.forEach((item: any) => walkCondition(item, source))
        return
      case "not":
        walkCondition(cond.item, source)
        return
      default:
        return
    }
  }

  const walkConsequences = (cs: any[] | undefined, source: string) => {
    for (const c of cs ?? []) {
      if (c.kind === "flag") track(writes, c.name, source)
      if (c.kind === "arcVariant") track(variantWrites, `${c.arcId}.${c.key}`, source)
    }
  }

  const walkTransitionConditions = (transition: Transition | undefined, source: string) => {
    walkTransition(transition, (current) => {
      if (current.type === "branch") {
        current.cases.forEach((item, index) => {
          walkCondition(item.when, `${source}.branch[${index}]`)
        })
      }
      if (current.type === "battle") {
        walkConsequences(current.onWin?.consequences, `${source}.battle.onWin`)
        walkConsequences(current.onLose?.consequences, `${source}.battle.onLose`)
        walkConsequences(current.onFlee?.consequences, `${source}.battle.onFlee`)
      }
    })
  }

  for (const event of events) {
    walkCondition((event as any).condition, `${event.id}.condition`)
    for (const node of Object.values(event.nodes)) {
      walkConsequences((node as any).onEnter, `${event.id}.${node.id}.onEnter`)
      walkTransitionConditions(node.autoNext, `${event.id}.${node.id}.autoNext`)
      for (const choice of node.choices ?? []) {
        walkCondition((choice as any).condition, `${event.id}.${node.id}.${choice.id}.condition`)
        walkConsequences((choice as any).consequences, `${event.id}.${node.id}.${choice.id}.consequences`)
        walkTransitionConditions(choice.transition, `${event.id}.${node.id}.${choice.id}.transition`)
      }
    }
  }
  for (const worldEvent of WORLD_EVENTS) {
    walkCondition(worldEvent.trigger, `${worldEvent.id}.trigger`)
  }

  const warningMessages: string[] = []
  for (const [flagName, sources] of writes.entries()) {
    if (!reads.has(flagName)) {
      warningMessages.push(`flag \`${flagName}\` 仅写入未读取：${Array.from(sources).sort().join(", ")}`)
    }
  }

  for (const [flagName, sources] of reads.entries()) {
    if (!writes.has(flagName)) {
      warningMessages.push(`flag \`${flagName}\` 仅读取未写入：${Array.from(sources).sort().join(", ")}`)
    }
  }

  for (const [variantKey, sources] of variantWrites.entries()) {
    if (!variantReads.has(variantKey)) {
      warningMessages.push(`arcVariant \`${variantKey}\` 仅写入未读取：${Array.from(sources).sort().join(", ")}`)
    }
  }

  for (const [variantKey, sources] of variantReads.entries()) {
    if (!variantWrites.has(variantKey)) {
      warningMessages.push(`arcVariant \`${variantKey}\` 仅读取未写入：${Array.from(sources).sort().join(", ")}`)
    }
  }

  warningMessages.push(`当前剧情数据 flag 写入 ${writes.size} 个，flag 条件读取 ${reads.size} 个`)
  warningMessages.push(`当前剧情数据 arcVariant 写入 ${variantWrites.size} 个，条件读取 ${variantReads.size} 个`)
  return warningMessages.sort()
}

console.log("\n=== 1. 剧情静态结构校验 ===")
{
  const allEventIds = new Set(ALL_STORY_EVENTS.map((event) => event.id))
  check("事件 id 全局唯一", allEventIds.size === ALL_STORY_EVENTS.length, `total=${ALL_STORY_EVENTS.length}, unique=${allEventIds.size}`)

  for (const event of ALL_STORY_EVENTS) {
    check(`entryNode 存在：${event.id}`, event.entryNode in event.nodes, `entryNode=${event.entryNode}`)

    const seenNodeIds = new Set<string>()
    for (const [nodeKey, node] of Object.entries(event.nodes)) {
      check(`节点 key 与 node.id 一致：${event.id}.${nodeKey}`, node.id === nodeKey, `node.id=${node.id}`)
      check(`同一事件内 node.id 不重复：${event.id}.${node.id}`, !seenNodeIds.has(node.id), `node.id=${node.id}`)
      seenNodeIds.add(node.id)

      walkTransition(node.autoNext, (transition) => {
        if (transition.type === "goto") {
          check(`goto 目标存在：${event.id}.${node.id} -> ${transition.nodeId}`, transition.nodeId in event.nodes, `nodeId=${transition.nodeId}`)
        }
        if (transition.type === "gotoEvent") {
          check(`gotoEvent 目标存在：${event.id}.${node.id} -> ${transition.eventId}`, allEventIds.has(transition.eventId), `eventId=${transition.eventId}`)
        }
        if (transition.type === "battle" && transition.objective) {
          check(
            `战斗目标轮数有效：${event.id}.${node.id}`,
            transition.objective.kind !== "surviveRounds"
              || Number.isInteger(transition.objective.rounds) && transition.objective.rounds > 0,
          )
          check(
            `保护目标已加入友方：${event.id}.${node.id}`,
            !transition.objective.protectAllyId
              || (transition.allyIds ?? []).includes(transition.objective.protectAllyId),
          )
        }
      })

      for (const choice of node.choices ?? []) {
        walkTransition(choice.transition, (transition) => {
          if (transition.type === "goto") {
            check(`goto 目标存在：${event.id}.${node.id}.${choice.id} -> ${transition.nodeId}`, transition.nodeId in event.nodes, `nodeId=${transition.nodeId}`)
          }
          if (transition.type === "gotoEvent") {
            check(`gotoEvent 目标存在：${event.id}.${node.id}.${choice.id} -> ${transition.eventId}`, allEventIds.has(transition.eventId), `eventId=${transition.eventId}`)
          }
          if (transition.type === "battle" && transition.objective) {
            check(
              `战斗目标轮数有效：${event.id}.${node.id}.${choice.id}`,
              transition.objective.kind !== "surviveRounds"
                || Number.isInteger(transition.objective.rounds) && transition.objective.rounds > 0,
            )
            check(
              `保护目标已加入友方：${event.id}.${node.id}.${choice.id}`,
              !transition.objective.protectAllyId
                || (transition.allyIds ?? []).includes(transition.objective.protectAllyId),
            )
          }
        })
      }
    }
  }

  const warnings = collectStaticStoryWarnings(ALL_STORY_EVENTS)
  if (warnings.length === 0) warn("未发现跨事件重复 nodeId")
  else {
    warn(`发现 ${warnings.length} 条跨事件重复 nodeId 警告`)
    warnings.forEach((message) => warn(message))
  }

  const flagWarnings = collectFlagWarnings(ALL_STORY_EVENTS)
  flagWarnings.forEach((message) => warn(message))
}

console.log("\n=== 2. applyConsequences：数值类 + clamp + alignment 同步 ===")
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

console.log("\n=== 3. item / skill / relation ===")
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

console.log("\n=== 4. NPC 命运 / 阵营 / arcBeat / flag ===")
{
  const r = applyConsequences(mkPlayer(), createWorld(), [
    { kind: "npcAlive", npcId: "yangkang", alive: false },
    { kind: "npcRecruit", npcId: "guojing", recruited: true },
    { kind: "npcTag", npcId: "yangkang", tag: "已黑化" },
    { kind: "npcRelationType", npcId: "hongqigong", relationType: "师徒" },
    { kind: "factionAttitude", factionId: "quanzhen", delta: 15 },
    { kind: "factionAttitude", factionId: "quanzhen", set: -40 },
    { kind: "arcBeat", arcId: "shendiao", beat: "niujia", result: "won" },
    { kind: "arcVariant", arcId: "shendiao", key: "act4.entry", value: "guo-huang" },
    { kind: "flag", name: "niujiacun.helped", value: true },
  ])
  const w = r.world
  check("杨康死亡", w.npcs["yangkang"].alive === false)
  check("郭靖入队", w.npcs["guojing"].recruited === true)
  check("杨康命运标记", w.npcs["yangkang"].fateTags.includes("已黑化"))
  check("NPC 关系类型写入", w.npcs["hongqigong"].relationType === "师徒")
  check("阵营态度 set 覆盖", w.factions["quanzhen"].attitude === -40, `att=${w.factions["quanzhen"].attitude}`)
  check("arcBeat 写入", w.arcs["shendiao"].beats["niujia"] === "won")
  check("arcVariant 写入", w.arcs["shendiao"].variants["act4.entry"] === "guo-huang")
  check("flag 写入", w.flags["niujiacun.helped"] === true)
  // 不污染入参
  check("不污染入参 world", createWorld().npcs["yangkang"] === undefined)
}

console.log("\n=== 5. checkCondition：默认值 + 区间 + 组合 ===")
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
  const variantResult = applyConsequences(r.player, r.world, [
    { kind: "arcVariant", arcId: "a", key: "entry", value: "water-fort" },
  ])
  check("arcVariant 指定版本匹配", checkCondition(variantResult.player, variantResult.world, { kind: "arcVariant", arcId: "a", key: "entry", eq: "water-fort" }))
  check("arcVariant 其他版本不匹配", !checkCondition(variantResult.player, variantResult.world, { kind: "arcVariant", arcId: "a", key: "entry", eq: "wangfu" }))
}
{
  // npcRelationType 条件：设置后匹配
  const p = mkPlayer()
  const w = createWorld()
  const r = applyConsequences(p, w, [{ kind: "npcRelationType", npcId: "hongqigong", relationType: "师徒" }])
  check("npcRelationType 匹配（师徒）", checkCondition(r.player, r.world, { kind: "npcRelationType", npcId: "hongqigong", eq: "师徒" }))
  check("npcRelationType 不匹配（朋友）", !checkCondition(r.player, r.world, { kind: "npcRelationType", npcId: "hongqigong", eq: "朋友" }))
}

console.log("\n=== 6. resolveBranch：条件分叉 + 嵌套 + else ===")
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

console.log("\n=== 7. enterNode onEnter 幂等 + resolveChoice ===")
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

console.log("\n=== 8. seenNodes 按事件作用域去重，而不是按裸 nodeId ===")
{
  const firstEvent: StoryEvent = {
    id: "event-a", entryNode: "main",
    nodes: {
      main: { id: "main", text: "甲事件", onEnter: [{ kind: "gold", delta: 10 }] },
    },
  }
  const secondEvent: StoryEvent = {
    id: "event-b", entryNode: "main",
    nodes: {
      main: { id: "main", text: "乙事件", onEnter: [{ kind: "gold", delta: 20 }] },
    },
  }
  const p = mkPlayer({ gold: 0 })
  const firstEnter = enterNode(p, p.world, firstEvent, "main")!
  check("第一个事件首次进入执行 onEnter（gold+10）", firstEnter.player.gold === 10, `gold=${firstEnter.player.gold}`)
  const secondEnter = enterNode(firstEnter.player, firstEnter.world, secondEvent, "main")!
  check("不同事件复用同名 node 时仍各自执行 onEnter（再+20）", secondEnter.player.gold === 30, `gold=${secondEnter.player.gold}`)
  const repeatSecondEnter = enterNode(secondEnter.player, secondEnter.world, secondEvent, "main")!
  check("同一事件二次进入仍保持幂等", repeatSecondEnter.player.gold === 30, `gold=${repeatSecondEnter.player.gold}`)
  check("seenNodes 记录的是事件作用域键", repeatSecondEnter.world.seenNodes.includes("event-a:main") && repeatSecondEnter.world.seenNodes.includes("event-b:main"), `seenNodes=${repeatSecondEnter.world.seenNodes.join(",")}`)
}

console.log("\n=== 9. 八幕进度映射 + 事件断点恢复 ===")
{
  const world = createWorld()
  world.arcs.shendiao = {
    beats: {
      niujia: "done",
      damos: "done",
      wangfu: "done",
      taohua: "done",
    },
    variants: {},
  }
  const legacyPlayer = mkPlayer({ world })
  const progress = getStoryProgress(legacyPlayer)
  check("旧样板桃花岛后映射到第六幕", progress.act.id === "act6-truth", `act=${progress.act.id}`)
  check("旧样板明确将未实现第五幕记为 skipped", progress.completed === 5, `completed=${progress.completed}`)

  const migrated = migrateWorld({
    ...world,
    version: 4,
    currentStory: {
      eventId: "shendiao-niujia-opening",
      nodeId: "main",
      phase: "choosing",
      pageIndex: 2,
      locationId: "niujia",
    },
  })
  check("旧 niujia beat 补写第一幕里程碑", migrated.arcs.shendiao.beats["act1-wind"] === "done")
  check("旧 taohua beat 补写第四幕里程碑", migrated.arcs.shendiao.beats["act4-taohua"] === "done")
  check("旧样板缺失第五幕被显式迁移为 skipped", migrated.arcs.shendiao.beats["act5-old-debts"] === "skipped")
  check("事件断点迁移保留页码", migrated.currentStory?.pageIndex === 2)

  const modern = migrateWorld({
    version: 6,
    arcs: {
      shendiao: {
        beats: {
          taohua: "done",
          "act1-wind": "done",
          "act2-damos": "done",
          "act3-zhongdu": "done",
          "act4-taohua": "done",
        },
        variants: {},
      },
    },
  })
  check("现代幕级存档不被旧 taohua beat 补写第五幕 skipped", modern.arcs.shendiao.beats["act5-old-debts"] === undefined)
}
{
  const player = mkPlayer()
  const opened = openLocationStory({ player, locationId: "niujia" })!
  check("打开地点事件立即建立断点", opened.player.world.currentStory?.eventId === "shendiao-niujia-opening")
  check("入口断点记录地点", opened.player.world.currentStory?.locationId === "niujia")

  const event = STORY_VOLUMES.find((item) => item.id === "shendiao-niujia-opening")!
  const advanced = resolveStoryFlow({
    player: opened.player,
    transition: { type: "goto", nodeId: "wait-righteous" },
    consumedDay: false,
    currentStoryEvent: event,
    locationId: "niujia",
  })
  check("goto 后断点更新到目标节点", advanced.player.world.currentStory?.nodeId === "wait-righteous")

  const resultPlayer = setStoryCheckpoint(advanced.player, {
    eventId: event.id,
    nodeId: "wait-righteous",
    phase: "result",
    pageIndex: 1,
    locationId: "niujia",
    resultText: "断点结果",
    transition: { type: "end" },
    consumedDay: true,
  })
  const restoredResult = restoreStoryCheckpoint(resultPlayer)
  check("结果页断点可恢复", restoredResult.command?.type === "show-event-entry" && restoredResult.command.initialResult?.text === "断点结果")
  check("结果页恢复保留 consumeDay", restoredResult.command?.type === "show-event-entry" && restoredResult.command.initialResult?.consumedDay === true)

  const battle = resolveStoryFlow({
    player: opened.player,
    transition: {
      type: "battle",
      enemyId: "guanjun",
      allyIds: ["guojing"],
      objective: {
        kind: "surviveRounds",
        rounds: 3,
        protectAllyId: "guojing",
        title: "护住郭靖",
      },
      onWin: { text: "胜" },
    },
    consumedDay: false,
    currentStoryEvent: event,
    locationId: "niujia",
  })
  check("剧情战开始前写入 battle 断点", battle.player.world.currentStory?.phase === "battle")
  check(
    "剧情战目标转成运行时保护 uid",
    battle.command.type === "show-battle"
      && battle.command.battleObjective?.kind === "surviveRounds"
      && battle.command.battleObjective.protectUid === "npc-guojing",
  )
  check("剧情战命令携带剧情友方", battle.command.type === "show-battle" && battle.command.allyIds.includes("guojing"))
  const restoredBattle = restoreStoryCheckpoint(battle.player)
  check("剧情战刷新后从战斗开场恢复", restoredBattle.command?.type === "show-battle")
  check("剧情战恢复同时带回事件上下文", restoredBattle.command?.type === "show-battle" && restoredBattle.command.storyContext?.event.id === event.id)
  check(
    "剧情战刷新后恢复目标与友方",
    restoredBattle.command?.type === "show-battle"
      && restoredBattle.command.allyIds.includes("guojing")
      && restoredBattle.command.battleObjective?.protectUid === "npc-guojing",
  )

  const teammates = getBattleTeammates(opened.player, ["guojing", "guojing"])
  check("剧情友方与重复来源按 NPC id 去重", teammates.filter((npc) => npc.id === "guojing").length === 1)

  const protectOnlyCommand = createBattleEntryCommand({
    enemies: [],
    pendingBattleTransition: {
      type: "battle",
      allyIds: ["guojing"],
      objective: { kind: "defeatAll", protectAllyId: "guojing" },
    },
  })
  check(
    "歼灭战可附加保护友方目标",
    protectOnlyCommand.battleObjective?.kind === "defeatAll"
      && protectOnlyCommand.battleObjective.protectUid === "npc-guojing",
  )

  const ended = resolveStoryFlow({
    player: resultPlayer,
    transition: { type: "end" },
    consumedDay: true,
    currentStoryEvent: event,
    locationId: "niujia",
  })
  check("事件结束后清空断点", ended.player.world.currentStory === null)
  check("结果页 consumeDay 只在继续时结算", ended.player.day === player.day + 1, `day=${ended.player.day}`)
}

console.log("\n=== 10. 射雕第一幕校正结构 ===")
{
  const firstAct = STORY_VOLUMES.find((item) => item.id === "shendiao-niujia-opening")!
  const requiredNodes = [
    "riverbank",
    "qusan-tavern",
    "qusan-night",
    "qiu-arrival",
    "qiu-aftermath",
    "rescue",
    "wait-righteous",
    "raid-righteous",
    "raid-jin",
    "close-prepared",
    "close-evidence",
  ]
  check("第一幕从钱塘江边进入", firstAct.entryNode === "riverbank", `entry=${firstAct.entryNode}`)
  check("第一幕七段骨架节点齐全", requiredNodes.every((nodeId) => nodeId in firstAct.nodes))

  const firstActText = JSON.stringify(firstAct)
  check("第一幕不再出现丘处机抱婴儿时序错误", !firstActText.includes("丘处机带着孩子") && !firstActText.includes("抱起一名婴儿"))
  check("第一幕不再把孕期李萍写成抱孩子逃跑", !firstActText.includes("李萍抱着孩子"))
  check("第一幕同时写入八幕里程碑", firstActText.includes("\"beat\":\"act1-wind\""))

  const damos = STORY_VOLUMES.find((item) => item.id === "shendiao-damos")!
  check("第二幕入口读取第一幕版本", damos.entryNode === "arrival")

  const jinWorld = createWorld()
  jinWorld.flags["shendiao.niujia.departure"] = "jin-retinue"
  const jinRoute = resolveBranch(mkPlayer({ world: jinWorld }), jinWorld, damos.nodes.arrival.autoNext!)
  check("王府离村版本进入王府旧差", jinRoute.type === "goto" && jinRoute.nodeId === "arrival-jin")

  const lipingWorld = createWorld()
  lipingWorld.flags["shendiao.niujia.saved_liping"] = true
  const lipingRoute = resolveBranch(mkPlayer({ world: lipingWorld }), lipingWorld, damos.nodes.arrival.autoNext!)
  check("援救李萍版本进入北路旧识", lipingRoute.type === "goto" && lipingRoute.nodeId === "arrival-liping")
}

console.log("\n=== 11. 射雕第二幕重组结构 ===")
{
  const damos = STORY_VOLUMES.find((item) => item.id === "shendiao-damos")!
  const requiredNodes = [
    "childhood-camp",
    "jebe-wounded",
    "jebe-search",
    "jebe-surrender",
    "seven-freaks-arrive",
    "blackwind-omens",
    "blackwind-night",
    "blackwind-aftermath",
    "growth-seasons",
    "growth-years",
    "mayu-cliff",
    "mayu-result",
    "eagle-shot",
    "sangkun-plot",
    "sangkun-siege",
    "counterattack",
    "golden-knife",
    "farewell",
  ]
  check("第二幕连续骨架节点齐全", requiredNodes.every((nodeId) => nodeId in damos.nodes))
  check("第二幕入口标记新流程", JSON.stringify(damos.nodes.arrival.onEnter).includes("shendiao.damos.reworked"))
  check("第二幕保留郭靖哲别核心选择", damos.nodes["jebe-surrender"].text.includes("不许拿客人的东西"))
  check("黑风夜保留陈玄风与张阿生结局", damos.nodes["blackwind-aftermath"].text.includes("陈玄风已死") && damos.nodes["blackwind-aftermath"].text.includes("张阿生伤重不治"))
  check("金刀首功仍归郭靖", damos.nodes["golden-knife"].text.includes("首功记在郭靖名下"))

  const damosText = JSON.stringify(damos)
  check("第二幕写入八幕里程碑", damosText.includes("\"beat\":\"act2-damos\""))
  check("第二幕包含桑昆剧情战", damosText.includes("\"enemyId\":\"sangkun-guard\""))

  const compatibilityPlayer = mkPlayer()
  compatibilityPlayer.world.arcs.shendiao = { beats: { damos: "done" }, variants: {} }
  compatibilityPlayer.world.flags["shendiao.damos.reworked"] = true
  compatibilityPlayer.relations.guojing = 30
  const compatibilityIds = [
    "shendiao-damos-eagle",
    "shendiao-damos-feast",
    "shendiao-seven-freaks",
    "shendiao-damos-southbound",
  ]
  check(
    "新流程完成后旧大漠支线不重复触发",
    compatibilityIds.every((eventId) => {
      const event = STORY_VOLUMES.find((item) => item.id === eventId)!
      return !checkCondition(compatibilityPlayer, compatibilityPlayer.world, event.condition)
    }),
  )

  const zhangjiakou = STORY_VOLUMES.find((item) => item.id === "shendiao-zhangjiakou")!
  const aheadWorld = createWorld()
  aheadWorld.flags["shendiao.damos.departure"] = "ahead"
  const aheadRoute = resolveBranch(mkPlayer({ world: aheadWorld }), aheadWorld, zhangjiakou.nodes.approach.autoNext!)
  check("提前南下版本在第三幕入口回读", aheadRoute.type === "goto" && aheadRoute.nodeId === "road-ahead")
}

console.log("\n=== 12. 射雕第三幕双地点重组 ===")
{
  const zhangjiakou = STORY_VOLUMES.find((item) => item.id === "shendiao-zhangjiakou")!
  const zhongdu = STORY_VOLUMES.find((item) => item.id === "shendiao-zhongdu")!
  const legacyEventIds = [
    "shendiao-meet-rong",
    "shendiao-linan-night-stroll",
    "shendiao-beggar-feast",
    "shendiao-qigong",
    "shendiao-linan-wangfu-rumor",
    "shendiao-wangfu",
    "shendiao-linan-yangkang-shadow",
  ]

  check("第三幕拆分张家口与中都事件", zhangjiakou.locationId === "zhangjiakou" && zhongdu.locationId === "zhongdu")
  check(
    "张家口包含白驼过境、小叫花与冰河再见",
    ["baituo-traces", "beggar-table", "gift-bridge", "river-reveal"].every((nodeId) => nodeId in zhangjiakou.nodes),
  )
  check(
    "中都连续骨架节点齐全",
    [
      "mu-family",
      "arena",
      "wangchuyi-poison",
      "palace-gates",
      "iron-prison",
      "old-courtyard",
      "reunion",
      "identity",
      "escape-crisis",
      "qiu-verdict",
      "beggar-chicken",
      "palm-test",
      "act-end",
    ].every((nodeId) => nodeId in zhongdu.nodes),
  )

  const zhangText = JSON.stringify(zhangjiakou)
  const zhongduText = JSON.stringify(zhongdu)
  check("张家口写入旧 meet-rong 兼容 beat", zhangText.includes("\"beat\":\"meet-rong\""))
  check("中都写入第三幕与旧王府 beat", zhongduText.includes("\"beat\":\"act3-zhongdu\"") && zhongduText.includes("\"beat\":\"wangfu\""))
  check("比武招亲保留郭靖仗义出手", zhongdu.nodes.arena.text.includes("郭靖") && zhongdu.nodes.arena.text.includes("不该下场欺负人"))
  check("犁头旧语采用原著认亲口令", zhongdu.nodes.reunion.text.includes("张木儿加一斤半铁"))
  check("杨康知道身世后仍可拒认", zhongdu.nodes.identity.text.includes("舍掉十八年的父亲、母亲和王府"))
  check("第三幕包含杨康与王府亲兵剧情战", zhongduText.includes("\"enemyId\":\"yangkang\"") && zhongduText.includes("\"enemyId\":\"wangfu-guard\""))

  const rescueWorld = createWorld()
  rescueWorld.flags["shendiao.zhongdu.wangchuyi-aid"] = true
  rescueWorld.flags["shendiao.zhongdu.guards-delayed"] = true
  rescueWorld.flags["shendiao.zhongdu.escape-route"] = true
  const rescuePlayer = mkPlayer({ world: rescueWorld })
  const rescueChoice = zhongdu.nodes["escape-crisis"].choices!.find((choice) => choice.id === "save-both")!
  check("三项准备齐全时可保下杨铁心与包惜弱", checkCondition(rescuePlayer, rescueWorld, rescueChoice.condition))

  const progressWorld = createWorld()
  progressWorld.arcs.shendiao = { beats: { damos: "done", "act2-damos": "done" }, variants: {} }
  const beforeMeet = mkPlayer({ world: progressWorld })
  check("第二幕后主线推荐张家口", getStoryProgress(beforeMeet).recommendedLocationId === "zhangjiakou")
  const openedZhangjiakou = openLocationStory({ player: beforeMeet, locationId: "zhangjiakou" })!
  check("张家口地点优先触发新第三幕入口", openedZhangjiakou.command.type === "show-event-entry" && openedZhangjiakou.command.event.id === "shendiao-zhangjiakou")

  progressWorld.arcs.shendiao.beats["meet-rong"] = "done"
  const afterMeet = mkPlayer({ world: progressWorld })
  check("黄蓉初遇后主线推荐切到中都", getStoryProgress(afterMeet).recommendedLocationId === "zhongdu")
  const openedZhongdu = openLocationStory({ player: afterMeet, locationId: "zhongdu" })!
  check("中都地点优先触发王府主事件", openedZhongdu.command.type === "show-event-entry" && openedZhongdu.command.event.id === "shendiao-zhongdu")

  const compatibilityPlayer = mkPlayer()
  compatibilityPlayer.world.arcs.shendiao = { beats: { damos: "done", "meet-rong": "done", qigong: "done" }, variants: {} }
  compatibilityPlayer.world.flags["shendiao.zhongdu.reworked"] = true
  check(
    "新第三幕启用后旧临安主线与桥接不再重复触发",
    legacyEventIds.every((eventId) => {
      const event = STORY_VOLUMES.find((item) => item.id === eventId)!
      return !checkCondition(compatibilityPlayer, compatibilityPlayer.world, event.condition)
    }),
  )
}

console.log("\n=== 13. 射雕第四幕三地点落地 ===")
{
  const taihu = STORY_VOLUMES.find((item) => item.id === "shendiao-taihu")!
  const guiyun = STORY_VOLUMES.find((item) => item.id === "shendiao-guiyunzhuang")!
  const taohua = STORY_VOLUMES.find((item) => item.id === "shendiao-taohua-act4")!
  const legacyTaohua = STORY_VOLUMES.find((item) => item.id === "shendiao-taohua")!

  check(
    "第四幕拆分太湖、归云庄与桃花岛事件",
    taihu.locationId === "taihu" && guiyun.locationId === "guiyunzhuang" && taohua.locationId === "taohuadao",
  )
  check(
    "太湖与归云庄地图地点已挂载",
    getLocationById("taihu")?.events[0] === "shendiao-taihu"
      && getLocationById("guiyunzhuang")?.events[0] === "shendiao-guiyunzhuang",
  )
  check(
    "太湖包含灯号、水战、封舱与入庄节点",
    ["lake-approach", "reed-crossroads", "sealed-cargo", "guiyun-bound"].every((nodeId) => nodeId in taihu.nodes),
  )
  check(
    "归云庄包含假宗师、段天德、旧门与东邪节点",
    ["false-master", "duan-witness", "old-gate-debt", "east-heretic-arrives", "guiyun-departure"].every((nodeId) => nodeId in guiyun.nodes),
  )
  check(
    "桃花岛包含周伯通、三试、火船与荒岛传承",
    ["stone-cave", "root-test", "flute-test", "old-script-test", "fire-ship", "island-survival", "beggar-succession"].every((nodeId) => nodeId in taohua.nodes),
  )

  const act4Text = JSON.stringify([taihu, guiyun, taohua])
  check("第四幕包含太湖与归云庄剧情战", act4Text.includes("\"enemyId\":\"wangfu-guard\"") && act4Text.includes("\"enemyId\":\"meichaofeng\""))
  check("段天德可由第一幕银契保为活证", act4Text.includes("duan-bribe-slip") && act4Text.includes("归云庄公开作证"))
  check("洪七公仍亲自选择救欧阳锋", taohua.nodes["qigong-rescue"].text.includes("欧阳锋抓住洪七公竹杖"))
  check("黄蓉仍承担丐帮竹杖传承", taohua.nodes["beggar-succession"].text.includes("让她接下丐帮帮主之位"))
  check("第四幕收束写入旧桃花与幕级 beat", act4Text.includes("\"beat\":\"taohua\"") && act4Text.includes("\"beat\":\"act4-taohua\""))
  check("周伯通机缘只奖励空明拳而非整部九阴", taohua.nodes["zhou-teaching"].onEnter?.some((item) => item.kind === "skill" && item.id === "kongming") === true)

  const progressWorld = createWorld()
  progressWorld.arcs.shendiao = {
    beats: {
      "act1-wind": "done",
      "act2-damos": "done",
      "act3-zhongdu": "done",
      wangfu: "done",
    },
    variants: {},
  }
  const beforeTaihu = mkPlayer({ world: progressWorld })
  check("第三幕后主线推荐太湖", getStoryProgress(beforeTaihu).recommendedLocationId === "taihu")
  const openedTaihu = openLocationStory({ player: beforeTaihu, locationId: "taihu" })!
  check("太湖地点优先触发第四幕入口", openedTaihu.command.type === "show-event-entry" && openedTaihu.command.event.id === "shendiao-taihu")

  progressWorld.arcs.shendiao.variants["act4.taihu"] = "cleared"
  const afterTaihu = mkPlayer({ world: progressWorld })
  check("太湖后主线推荐归云庄", getStoryProgress(afterTaihu).recommendedLocationId === "guiyunzhuang")
  const openedGuiyun = openLocationStory({ player: afterTaihu, locationId: "guiyunzhuang" })!
  check("归云庄地点触发旧案主事件", openedGuiyun.command.type === "show-event-entry" && openedGuiyun.command.event.id === "shendiao-guiyunzhuang")

  progressWorld.arcs.shendiao.variants["act4.guiyun"] = "cleared"
  const afterGuiyun = mkPlayer({ world: progressWorld })
  check("归云庄后主线推荐桃花岛", getStoryProgress(afterGuiyun).recommendedLocationId === "taohuadao")
  const openedTaohua = openLocationStory({ player: afterGuiyun, locationId: "taohuadao" })!
  check("桃花岛优先触发第四幕新事件", openedTaohua.command.type === "show-event-entry" && openedTaohua.command.event.id === "shendiao-taohua-act4")

  const wangfuWorld = createWorld()
  wangfuWorld.flags["shendiao.zhongdu.departure"] = "wangfu-inside"
  const wangfuEntry = resolveBranch(mkPlayer({ world: wangfuWorld }), wangfuWorld, taihu.nodes["lake-approach"].autoNext!)
  check("王府离场版本从太湖暗船入口进入", wangfuEntry.type === "goto" && wangfuEntry.nodeId === "entry-wangfu")

  const waterEvidenceWorld = createWorld()
  waterEvidenceWorld.arcs.shendiao = { beats: {}, variants: { "act4.water-clue": "wumu-manifest" } }
  const waterEvidencePlayer = mkPlayer({ world: waterEvidenceWorld })
  const waterEvidenceChoice = guiyun.nodes["duan-witness"].choices!.find((choice) => choice.id === "present-water-records")!
  check("太湖水路证据在段天德审问中被读取", checkCondition(waterEvidencePlayer, waterEvidenceWorld, waterEvidenceChoice.condition))

  const newActPlayer = mkPlayer({ world: progressWorld })
  check("新第三幕存档不会再触发旧桃花岛三节点事件", !checkCondition(newActPlayer, newActPlayer.world, legacyTaohua.condition))

  const migratedV5 = migrateWorld({
    version: 5,
    arcs: { shendiao: { beats: { "act3-zhongdu": "done" } } },
  })
  check("v5 存档迁移补全 arc variants", !!migratedV5.arcs.shendiao && Object.keys(migratedV5.arcs.shendiao.variants).length === 0)
}

console.log("\n=== 14. 射雕第五幕六地点落地 ===")
{
  const linan = STORY_VOLUMES.find((item) => item.id === "shendiao-linan-act5")!
  const niujia = STORY_VOLUMES.find((item) => item.id === "shendiao-niujia-act5")!
  const junshan = STORY_VOLUMES.find((item) => item.id === "shendiao-junshan-act5")!
  const tiezhang = STORY_VOLUMES.find((item) => item.id === "shendiao-tiezhang-act5")!
  const blackmarsh = STORY_VOLUMES.find((item) => item.id === "shendiao-blackmarsh-act5")!
  const yideng = STORY_VOLUMES.find((item) => item.id === "shendiao-yideng-act5")!

  check(
    "第五幕拆分临安、牛家村、君山、铁掌峰、黑沼与一灯居",
    linan.locationId === "linan"
      && niujia.locationId === "niujia"
      && junshan.locationId === "junshan"
      && tiezhang.locationId === "tiezhangfeng"
      && blackmarsh.locationId === "blackmarsh"
      && yideng.locationId === "yidengju",
  )
  check(
    "四个第五幕新地点已挂载",
    getLocationById("junshan")?.events[0] === "shendiao-junshan-act5"
      && getLocationById("tiezhangfeng")?.events[0] === "shendiao-tiezhang-act5"
      && getLocationById("blackmarsh")?.events[0] === "shendiao-blackmarsh-act5"
      && getLocationById("yidengju")?.events[0] === "shendiao-yideng-act5",
  )
  check(
    "禁宫事件包含军档、欧阳锋与旧道撤离",
    ["imperial-archive", "palace-alarm", "secret-retreat"].every((nodeId) => nodeId in linan.nodes),
  )
  check(
    "牛家村事件包含七日疗伤、破庙命案与伤势收束",
    ["seven-day-watch", "temple-footsteps", "murder-aftermath", "player-recovered", "guojing-recovered"].every((nodeId) => nodeId in niujia.nodes),
  )
  check(
    "君山事件包含真假帮主、棒法验正与分裂结果",
    ["assembly-crossroads", "staff-rules", "junshan-verdict", "beggar-divided", "rong-recognized"].every((nodeId) => nodeId in junshan.nodes),
  )
  check(
    "铁掌峰包含真裘千仞、武穆遗书与追命掌伤",
    ["foothill", "summit-crossroads", "wumu-vault", "iron-palm-intercept", "blackmarsh-clue"].every((nodeId) => nodeId in tiezhang.nodes),
  )
  check(
    "黑沼与一灯居包含算局、渔樵耕读、救治与旧债",
    ["numbered-stakes", "yinggu-hut", "yinggu-request"].every((nodeId) => nodeId in blackmarsh.nodes)
      && ["fisher-pass", "woodcutter-pass", "farmer-pass", "scholar-pass", "lamp-chamber", "old-debt-question"].every((nodeId) => nodeId in yideng.nodes),
  )

  const act5Text = JSON.stringify([linan, niujia, junshan, tiezhang, blackmarsh, yideng])
  check("第五幕包含禁宫、西毒、杨康、裘千仞与一灯守关战", ["palace-guard", "ouyangfeng", "yangkang", "qiuqianren", "yideng-disciple"].every((enemyId) => act5Text.includes(`"enemyId":"${enemyId}"`)))
  check("禁宫与铁掌峰都读取武穆遗书线索", act5Text.includes("武穆遗书") && act5Text.includes("transfer-ledger"))
  check("欧阳克死因可留下白驼玉饰证物", act5Text.includes("ouyangke-jade-shard") && act5Text.includes("killed-witnessed"))
  check("武穆遗书支持原本、节要与留库三种结果", ["wumu-original", "wumu-copy", "left-in-vault"].every((value) => act5Text.includes(value)))
  check("黄蓉仍亲自演棒法并接下丐帮号令", junshan.nodes["staff-rules"].text.includes("没有让旁人替她演棒法") && junshan.nodes["rong-recognized"].text.includes("第一道号令"))
  check("一灯救治明确损耗自身功力", yideng.nodes["lamp-chamber"].text.includes("自己数年功力都会受损"))
  check("第五幕收束写入幕级 beat", act5Text.includes("\"beat\":\"act5-old-debts\""))

  const progressWorld = createWorld()
  progressWorld.arcs.shendiao = {
    beats: {
      "act1-wind": "done",
      "act2-damos": "done",
      "act3-zhongdu": "done",
      "act4-taohua": "done",
      wangfu: "done",
      taohua: "done",
    },
    variants: {
      "act4.taihu": "cleared",
      "act4.guiyun": "cleared",
    },
  }
  const beforePalace = mkPlayer({ world: progressWorld })
  check("第四幕后主线推荐临安禁宫", getStoryProgress(beforePalace).recommendedLocationId === "linan")
  const openedPalace = openLocationStory({ player: beforePalace, locationId: "linan" })!
  check("临安优先触发第五幕禁宫事件", openedPalace.command.type === "show-event-entry" && openedPalace.command.event.id === "shendiao-linan-act5")

  progressWorld.arcs.shendiao.variants["act5.palace"] = "cleared"
  const afterPalace = mkPlayer({ world: progressWorld })
  check("禁宫后主线推荐牛家村", getStoryProgress(afterPalace).recommendedLocationId === "niujia")
  const openedNiujia = openLocationStory({ player: afterPalace, locationId: "niujia" })!
  check("牛家村优先触发第五幕密室事件", openedNiujia.command.type === "show-event-entry" && openedNiujia.command.event.id === "shendiao-niujia-act5")

  progressWorld.arcs.shendiao.variants["act5.niujia"] = "cleared"
  const afterNiujia = mkPlayer({ world: progressWorld })
  check("密室后主线推荐君山", getStoryProgress(afterNiujia).recommendedLocationId === "junshan")
  const openedJunshan = openLocationStory({ player: afterNiujia, locationId: "junshan" })!
  check("君山触发真假帮主事件", openedJunshan.command.type === "show-event-entry" && openedJunshan.command.event.id === "shendiao-junshan-act5")

  progressWorld.arcs.shendiao.variants["act5.junshan"] = "cleared"
  const afterJunshan = mkPlayer({ world: progressWorld })
  check("君山后主线推荐铁掌峰", getStoryProgress(afterJunshan).recommendedLocationId === "tiezhangfeng")
  const openedTiezhang = openLocationStory({ player: afterJunshan, locationId: "tiezhangfeng" })!
  check("铁掌峰触发兵书事件", openedTiezhang.command.type === "show-event-entry" && openedTiezhang.command.event.id === "shendiao-tiezhang-act5")

  progressWorld.arcs.shendiao.variants["act5.tiezhang"] = "cleared"
  const afterTiezhang = mkPlayer({ world: progressWorld })
  check("铁掌峰后主线推荐黑沼", getStoryProgress(afterTiezhang).recommendedLocationId === "blackmarsh")

  progressWorld.arcs.shendiao.variants["act5.blackmarsh"] = "cleared"
  const afterBlackmarsh = mkPlayer({ world: progressWorld })
  check("黑沼后主线推荐一灯居", getStoryProgress(afterBlackmarsh).recommendedLocationId === "yidengju")
  const openedYideng = openLocationStory({ player: afterBlackmarsh, locationId: "yidengju" })!
  check("一灯居触发渔樵耕读事件", openedYideng.command.type === "show-event-entry" && openedYideng.command.event.id === "shendiao-yideng-act5")

  progressWorld.arcs.shendiao.beats["act5-old-debts"] = "done"
  const afterAct5 = mkPlayer({ world: progressWorld })
  check("第五幕完成后主线进入第六幕牛家村", getStoryProgress(afterAct5).recommendedLocationId === "niujia")

  const playerPatientWorld = createWorld()
  playerPatientWorld.arcs.shendiao = { beats: {}, variants: { "act5.patient": "player" } }
  const patientRoute = resolveBranch(mkPlayer({ world: playerPatientWorld }), playerPatientWorld, niujia.nodes["hidden-room"].autoNext!)
  check("禁宫玩家承伤会进入同室疗伤版", patientRoute.type === "goto" && patientRoute.nodeId === "player-healing")

  const evidenceWorld = createWorld()
  evidenceWorld.npcs.ouyangke = { alive: false, recruited: false, faction: "", fateTags: [] }
  const evidencePlayer = mkPlayer({ inventory: { "ouyangke-jade-shard": 1 }, world: evidenceWorld })
  const evidenceChoice = junshan.nodes["assembly-crossroads"].choices!.find((choice) => choice.id === "show-jade-evidence")!
  check("欧阳克证物在君山可用于制衡杨康", checkCondition(evidencePlayer, evidencePlayer.world, evidenceChoice.condition))

  const treatmentWorld = createWorld()
  treatmentWorld.arcs.shendiao = { beats: {}, variants: { "act5.patient": "player", "act5.injury": "severe" } }
  const treatmentChoice = yideng.nodes["lamp-chamber"].choices!.find((choice) => choice.id === "accept-treatment")!
  const treatmentRoute = resolveBranch(mkPlayer({ world: treatmentWorld }), treatmentWorld, treatmentChoice.transition)
  check("一灯救治按伤者身份分流", treatmentRoute.type === "goto" && treatmentRoute.nodeId === "treat-player")
}

console.log("\n=== 15. 射雕第六幕 P1 地图与动态路引 ===")
{
  const yanyulou = getLocationById("yanyulou")!
  const tieqiangmiao = getLocationById("tieqiangmiao")!
  check(
    "烟雨楼与铁枪庙地图元数据已挂未来事件",
    yanyulou.events[0] === "shendiao-yanyulou-act6"
      && tieqiangmiao.events[0] === "shendiao-tieqiangmiao-act6",
  )
  check(
    "第六幕新地点具备节奏与风险定位",
    yanyulou.rhythm === "战斗"
      && yanyulou.risk === "高"
      && tieqiangmiao.rhythm === "剧情"
      && tieqiangmiao.risk === "高",
  )

  const world = createWorld()
  world.arcs.shendiao = {
    beats: {
      "act1-wind": "done",
      "act2-damos": "done",
      "act3-zhongdu": "done",
      "act4-taohua": "done",
      "act5-old-debts": "done",
    },
    variants: {},
  }
  const beforeAct6 = mkPlayer({ world })
  check("第六幕起点推荐牛家村", getStoryProgress(beforeAct6).recommendedLocationId === "niujia")
  check("第六幕起点不提前解锁烟雨楼", yanyulou.unlock?.(beforeAct6) === false)
  check("第六幕起点不提前解锁铁枪庙", tieqiangmiao.unlock?.(beforeAct6) === false)

  world.arcs.shendiao.variants["act6.munianci"] = "cleared"
  const afterMunianci = mkPlayer({ world })
  const munianciProgress = getStoryProgress(afterMunianci)
  check(
    "穆念慈断线后推荐桃花岛",
    munianciProgress.recommendedLocationId === "taohuadao"
      && munianciProgress.primaryAction.includes("桃花岛"),
  )

  world.arcs.shendiao.variants["act6.island"] = "cleared"
  const afterIsland = mkPlayer({ world })
  const islandProgress = getStoryProgress(afterIsland)
  check(
    "桃花岛血案后推荐烟雨楼",
    islandProgress.recommendedLocationId === "yanyulou"
      && islandProgress.primaryAction.includes("烟雨楼"),
  )
  check("桃花岛血案后解锁烟雨楼", yanyulou.unlock?.(afterIsland) === true)
  check("烟雨楼完成前铁枪庙仍锁定", tieqiangmiao.unlock?.(afterIsland) === false)

  world.arcs.shendiao.variants["act6.yanyu"] = "cleared"
  const afterYanyu = mkPlayer({ world })
  const yanyuProgress = getStoryProgress(afterYanyu)
  check(
    "烟雨楼会局后推荐铁枪庙",
    yanyuProgress.recommendedLocationId === "tieqiangmiao"
      && yanyuProgress.primaryAction.includes("铁枪庙"),
  )
  check("烟雨楼会局后解锁铁枪庙", tieqiangmiao.unlock?.(afterYanyu) === true)

  world.arcs.shendiao.beats["act6-truth"] = "done"
  const afterAct6 = mkPlayer({ world })
  check("第六幕完成后不再停留铁枪庙路引", getStoryProgress(afterAct6).recommendedLocationId === "damos")
}

console.log("\n=== 16. 射雕第六幕 P2 穆念慈与桃花岛血案 ===")
{
  const niujia = STORY_VOLUMES.find((event) => event.id === "shendiao-niujia-act6")!
  const island = STORY_VOLUMES.find((event) => event.id === "shendiao-taohua-blood-act6")!
  const oldYangkang = STORY_VOLUMES.find((event) => event.id === "shendiao-yangkang")!
  check("P2 拆分牛家村与桃花岛两个连续事件", !!niujia && !!island)

  const baseWorld = createWorld()
  baseWorld.arcs.shendiao = {
    beats: { "act5-old-debts": "done", taohua: "done" },
    variants: {
      "act5.ouyangke": "killed-witnessed",
      "act5.beggar": "rong-recognized",
      "act4.taohua-route": "guo-huang",
    },
  }
  baseWorld.npcs.ouyangke = { alive: false, recruited: false, faction: "", fateTags: [] }
  const basePlayer = mkPlayer({
    inventory: { "ouyangke-jade-shard": 1 },
    world: baseWorld,
  })
  const openedNiujia = openLocationStory({ player: basePlayer, locationId: "niujia" })!
  check(
    "第五幕后牛家村优先触发穆念慈新事件",
    openedNiujia.command.type === "show-event-entry"
      && openedNiujia.command.event.id === "shendiao-niujia-act6",
  )

  const materialChoice = resolveChoice(basePlayer, baseWorld, niujia, "evidence-table", "show-jade-shard")!
  const materialRoute = resolveBranch(
    materialChoice.player,
    materialChoice.world,
    niujia.nodes["munianci-verdict"].autoNext!,
  )
  check(
    "物证完整时由穆念慈自行进入断线结论",
    materialRoute.type === "goto" && materialRoute.nodeId === "munianci-breaks",
  )
  const broken = enterNode(materialChoice.player, materialChoice.world, niujia, "munianci-breaks")!
  check(
    "断线结果使用独立结构化版本",
    broken.world.arcs.shendiao.variants["act6.munianci-outcome"] === "broken"
      && broken.world.npcs.munianci.fateTags.includes("与杨康断线"),
  )

  const hiddenChoice = resolveChoice(basePlayer, baseWorld, niujia, "evidence-table", "hide-the-murder")!
  const hiddenRoute = resolveBranch(
    hiddenChoice.player,
    hiddenChoice.world,
    niujia.nodes["munianci-verdict"].autoNext!,
  )
  check(
    "隐瞒命案不会被错误写成穆念慈断线",
    hiddenRoute.type === "goto" && hiddenRoute.nodeId === "munianci-deceived",
  )

  const guardMunianci = niujia.nodes["iron-palm-pursuit"].choices!.find((choice) => choice.id === "guard-munianci")!
  check(
    "穆念慈脱离追兵使用守两轮加保护友方目标",
    guardMunianci.transition.type === "battle"
      && guardMunianci.transition.objective?.kind === "surviveRounds"
      && guardMunianci.transition.objective.rounds === 2
      && guardMunianci.transition.objective.protectAllyId === "munianci"
      && guardMunianci.transition.allyIds?.includes("munianci") === true,
  )

  baseWorld.arcs.shendiao.variants["act6.munianci"] = "cleared"
  const afterMunianci = mkPlayer({ world: baseWorld })
  const openedIsland = openLocationStory({ player: afterMunianci, locationId: "taohuadao" })!
  check(
    "穆念慈节点后桃花岛优先触发血案事件",
    openedIsland.command.type === "show-event-entry"
      && openedIsland.command.event.id === "shendiao-taohua-blood-act6",
  )
  check(
    "act6 新流程启用后旧铁枪庙样板失效",
    !checkCondition(afterMunianci, baseWorld, oldYangkang.condition),
  )

  const protectKe = island.nodes["courtyard-cries"].choices!.find((choice) => choice.id === "protect-ke-zhene")!
  const saveXiaoying = island.nodes["courtyard-cries"].choices!.find((choice) => choice.id === "save-han-xiaoying")!
  check(
    "桃花岛提供保护柯镇恶与韩小莹两种非歼灭战",
    protectKe.transition.type === "battle"
      && protectKe.transition.objective?.kind === "surviveRounds"
      && protectKe.transition.objective.protectAllyId === "kezhene"
      && saveXiaoying.transition.type === "battle"
      && saveXiaoying.transition.objective?.kind === "surviveRounds"
      && saveXiaoying.transition.objective.protectAllyId === "hanxiaoying",
  )

  const rescueOutcomeNodes = [
    "ke-survived",
    "ke-wounded",
    "xiaoying-saved",
    "xiaoying-fell",
    "evidence-secured",
    "evidence-scattered",
    "killer-traced",
    "killer-lost",
  ]
  const freakIds = ["kezhene", "zhucong", "hanbaoju", "nanxiren", "quanjinfa", "hanxiaoying"]
  const everyOutcomeKeepsLoss = rescueOutcomeNodes.every((nodeId) => {
    const world = createWorld()
    const entered = enterNode(mkPlayer({ world }), world, island, nodeId)!
    const survivors = freakIds.filter((npcId) => entered.world.npcs[npcId]?.alive !== false)
    return survivors.length <= 2
  })
  check("桃花岛每种救援结果最多保住两名现存七怪", everyOutcomeKeepsLoss)

  const savedWorld = createWorld()
  const saved = enterNode(
    mkPlayer({ inventory: { "taohua-route-scratch": 1 }, world: savedWorld }),
    savedWorld,
    island,
    "xiaoying-saved",
  )!
  check(
    "高价值介入可额外救下韩小莹但四人仍不可逆死亡",
    saved.world.npcs.kezhene.alive
      && saved.world.npcs.hanxiaoying.alive
      && ["zhucong", "hanbaoju", "nanxiren", "quanjinfa"].every((npcId) => saved.world.npcs[npcId].alive === false),
  )
  const strongEvidenceRoute = resolveBranch(saved.player, saved.world, island.nodes["evidence-review"].autoNext!)
  check(
    "翡翠鞋加血字加路线痕迹达到质询版本",
    strongEvidenceRoute.type === "goto" && strongEvidenceRoute.nodeId === "misunderstanding-questioning",
  )

  const partialPlayer = mkPlayer({ inventory: { "yellow-robe-fiber": 1 } })
  const partialRoute = resolveBranch(partialPlayer, partialPlayer.world, island.nodes["evidence-review"].autoNext!)
  check(
    "单项物证只能进入部分可证版本",
    partialRoute.type === "goto" && partialRoute.nodeId === "misunderstanding-partial",
  )
  const weakPlayer = mkPlayer()
  const weakRoute = resolveBranch(weakPlayer, weakPlayer.world, island.nodes["evidence-review"].autoNext!)
  check(
    "无物证时进入误会扩散版本",
    weakRoute.type === "goto" && weakRoute.nodeId === "misunderstanding-weak",
  )

  const worldEventById = (id: string) => WORLD_EVENTS.find((event) => event.id === id)!
  for (const variant of ["weak", "partial", "questioning"]) {
    const world = createWorld()
    world.arcs.shendiao = {
      beats: {},
      variants: { "act6.island": "cleared", "act6.misunderstanding": variant },
    }
    const player = mkPlayer({ world })
    const matches = [
      "taohua-blame-spreads",
      "taohua-evidence-disputed",
      "taohua-evidence-summons",
    ].filter((id) => checkCondition(player, world, worldEventById(id).trigger))
    check(`误会 ${variant} 只触发对应 world event`, matches.length === 1)
  }
}

console.log("\n=== 17. 射雕第六幕 P3 烟雨楼多方会局 ===")
{
  const yanyu = STORY_VOLUMES.find((event) => event.id === "shendiao-yanyulou-act6")!
  check("烟雨楼会局事件已接入射雕卷", !!yanyu && yanyu.locationId === "yanyulou")

  const baseWorld = createWorld()
  baseWorld.arcs.shendiao = {
    beats: {
      "act1-wind": "done",
      "act2-damos": "done",
      "act3-zhongdu": "done",
      "act4-taohua": "done",
      "act5-old-debts": "done",
    },
    variants: {
      "act6.munianci": "cleared",
      "act6.munianci-outcome": "broken",
      "act6.island": "cleared",
      "act6.island-outcome": "xiaoying-saved",
      "act6.misunderstanding": "questioning",
      "act5.beggar": "rong-recognized",
      "act5.wumu-destination": "beggar-network",
    },
  }
  baseWorld.npcs.hanxiaoying = { alive: true, recruited: false, faction: "", fateTags: [] }
  baseWorld.npcs.kezhene = { alive: true, recruited: false, faction: "", fateTags: [] }
  const evidenceInventory = {
    "yangkang-jade-shoe": 1,
    "han-xiaoying-blood-writing": 1,
    "taohua-snake-venom": 1,
    "yellow-robe-fiber": 1,
    "taohua-route-scratch": 1,
  }
  const basePlayer = mkPlayer({ inventory: evidenceInventory, world: baseWorld })
  const opened = openLocationStory({ player: basePlayer, locationId: "yanyulou" })!
  check(
    "桃花岛血案后烟雨楼优先触发 P3 事件",
    opened.command.type === "show-event-entry"
      && opened.command.event.id === "shendiao-yanyulou-act6",
  )

  const openingCases = [
    ["weak", "accusation-first"],
    ["partial", "two-records"],
    ["questioning", "sealed-hearing"],
  ] as const
  for (const [variant, expectedNode] of openingCases) {
    const world = createWorld()
    world.arcs.shendiao = { beats: {}, variants: { "act6.misunderstanding": variant } }
    const route = resolveBranch(mkPlayer({ world }), world, yanyu.nodes["lake-arrival"].autoNext!)
    check(`烟雨楼 ${variant} 进入对应会局版本`, route.type === "goto" && route.nodeId === expectedNode)
  }

  const livingRoute = resolveBranch(basePlayer, baseWorld, yanyu.nodes["witness-rollcall"].autoNext!)
  check("韩小莹存活时进入双证人版本", livingRoute.type === "goto" && livingRoute.nodeId === "living-witness")
  const deadWorld = structuredClone(baseWorld)
  deadWorld.npcs.hanxiaoying.alive = false
  const deadRoute = resolveBranch(mkPlayer({ world: deadWorld }), deadWorld, yanyu.nodes["witness-rollcall"].autoNext!)
  check("韩小莹死亡时由未完血字替代", deadRoute.type === "goto" && deadRoute.nodeId === "blood-writing-witness")

  const munianciCases = [
    ["broken", "munianci-broken-arrival"],
    ["informed-unresolved", "munianci-last-question"],
    ["hidden", "munianci-absent"],
  ] as const
  for (const [variant, expectedNode] of munianciCases) {
    const world = createWorld()
    world.arcs.shendiao = { beats: {}, variants: { "act6.munianci-outcome": variant } }
    const route = resolveBranch(mkPlayer({ world }), world, yanyu.nodes["munianci-position"].autoNext!)
    check(`穆念慈 ${variant} 对应烟雨楼站位`, route.type === "goto" && route.nodeId === expectedNode)
  }

  const cordonCases = [
    ["song-command", "song-cordon"],
    ["beggar-network", "beggar-cordon"],
    ["mongol-copy", "mongol-cordon"],
    ["player-kept", "player-cordon"],
  ] as const
  for (const [variant, expectedNode] of cordonCases) {
    const world = createWorld()
    world.arcs.shendiao = { beats: {}, variants: { "act5.wumu-destination": variant } }
    const route = resolveBranch(mkPlayer({ world }), world, yanyu.nodes["lake-cordon"].autoNext!)
    check(`武穆遗书 ${variant} 改变外围站位`, route.type === "goto" && route.nodeId === expectedNode)
  }

  const evidenceChoices = yanyu.nodes["yanyu-evidence-table"].choices!
  const visibleEvidenceIds = evidenceChoices
    .filter((choice) => checkCondition(basePlayer, baseWorld, choice.condition))
    .map((choice) => choice.id)
  check(
    "五项证物与活证在烟雨楼均有读侧",
    [
      "verify-island-route",
      "present-jade-shoe",
      "read-blood-writing",
      "compare-baituo-traces",
      "hear-han-xiaoying",
    ].every((choiceId) => visibleEvidenceIds.includes(choiceId)),
  )

  const conflictChoices = yanyu.nodes["ouyangfeng-provokes"].choices!
  const protectKe = conflictChoices.find((choice) => choice.id === "protect-ke-zhene")!
  const guardEvidence = conflictChoices.find((choice) => choice.id === "guard-evidence-boxes")!
  const sealExit = conflictChoices.find((choice) => choice.id === "seal-wangfu-exit")!
  const coverYangkang = conflictChoices.find((choice) => choice.id === "cover-yangkang")!
  check(
    "保住柯镇恶使用三轮保护目标",
    protectKe.transition.type === "battle"
      && protectKe.transition.objective?.kind === "surviveRounds"
      && protectKe.transition.objective.rounds === 3
      && protectKe.transition.objective.protectAllyId === "kezhene"
      && protectKe.transition.allyIds?.includes("kezhene") === true,
  )
  check(
    "守住证物使用三轮非歼灭目标",
    guardEvidence.transition.type === "battle"
      && guardEvidence.transition.objective?.kind === "surviveRounds"
      && guardEvidence.transition.objective.rounds === 3
      && guardEvidence.transition.objective.protectAllyId === undefined,
  )
  check(
    "丐帮或宋军路线可封王府出口",
    checkCondition(basePlayer, baseWorld, sealExit.condition)
      && sealExit.transition.type === "battle"
      && sealExit.transition.objective?.kind === "surviveRounds",
  )

  const coverPlayer = mkPlayer({ relations: { yangkang: 12 }, world: baseWorld })
  check(
    "王府残线可反向掩护杨康",
    checkCondition(coverPlayer, baseWorld, coverYangkang.condition)
      && coverYangkang.transition.type === "battle"
      && coverYangkang.transition.objective?.protectAllyId === "yangkang",
  )

  const protectWin = resolveBattleOutcome(
    basePlayer,
    baseWorld,
    protectKe.transition,
    "won",
  )!
  check(
    "保护柯镇恶胜利写入 witness-secured",
    protectWin.world.arcs.shendiao.variants["act6.yanyu-outcome"] === "witness-secured",
  )
  const evidenceLoss = resolveBattleOutcome(
    basePlayer,
    baseWorld,
    guardEvidence.transition,
    "lost",
  )!
  check(
    "守证物失败只损失脆弱痕迹并保留核心物证",
    evidenceLoss.player.inventory["taohua-route-scratch"] === 0
      && evidenceLoss.player.inventory["yellow-robe-fiber"] === 0
      && evidenceLoss.player.inventory["yangkang-jade-shoe"] === 1
      && evidenceLoss.player.inventory["han-xiaoying-blood-writing"] === 1,
  )

  const outcomeCases = [
    ["witness-secured", "witness-held"],
    ["dual-witness", "dual-witness-held"],
    ["evidence-secured", "evidence-held"],
    ["evidence-damaged", "evidence-damaged"],
    ["evidence-scattered", "yanyu-evidence-scattered"],
    ["exits-sealed", "exits-held"],
    ["wanyan-escaped", "wanyan-gone"],
    ["yangkang-covered", "covered-retreat"],
    ["yangkang-cornered", "wounded-retreat"],
    ["witness-wounded", "witness-interrupted"],
  ] as const
  for (const [variant, expectedNode] of outcomeCases) {
    const world = createWorld()
    world.arcs.shendiao = { beats: {}, variants: { "act6.yanyu-outcome": variant } }
    const route = resolveBranch(mkPlayer({ world }), world, yanyu.nodes["meeting-result"].autoNext!)
    check(`会局结果 ${variant} 有明确余波出口`, route.type === "goto" && route.nodeId === expectedNode)
  }

  const focusCases = [
    ["island-route", "focus-route-record"],
    ["jade-shoe", "focus-jade-record"],
    ["blood-writing", "focus-blood-record"],
    ["baituo-traces", "focus-baituo-record"],
    ["living-witness", "focus-living-record"],
    ["oral-only", "focus-oral-record"],
  ] as const
  for (const [variant, expectedNode] of focusCases) {
    const world = createWorld()
    world.arcs.shendiao = { beats: {}, variants: { "act6.yanyu-focus": variant } }
    const route = resolveBranch(mkPlayer({ world }), world, yanyu.nodes["focus-catalogue"].autoNext!)
    check(`会局焦点 ${variant} 带入铁枪庙`, route.type === "goto" && route.nodeId === expectedNode)
  }

  const finalWorld = createWorld()
  finalWorld.arcs.shendiao = { beats: { "act5-old-debts": "done" }, variants: {} }
  const finalEntered = enterNode(mkPlayer({ world: finalWorld }), finalWorld, yanyu, "iron-temple-trail")!
  check(
    "烟雨楼收束只写完成标记并指向铁枪庙",
    finalEntered.world.arcs.shendiao.variants["act6.yanyu"] === "cleared"
      && finalEntered.world.arcs.shendiao.beats["act6-truth"] === undefined
      && finalEntered.world.npcs.yangkang.fateTags.includes("逃往铁枪庙"),
  )
  check("烟雨楼完成后动态路引切到铁枪庙", getStoryProgress(finalEntered.player).recommendedLocationId === "tieqiangmiao")
}

console.log("\n=== 18. 射雕第六幕 P4 铁枪庙推理与杨康裁决 ===")
{
  const temple = STORY_VOLUMES.find((event) => event.id === "shendiao-tieqiangmiao-act6")!
  const templeLocation = getLocationById("tieqiangmiao")
  check(
    "铁枪庙事件已接入射雕卷与地图首位",
    !!temple
      && temple.locationId === "tieqiangmiao"
      && templeLocation?.events[0] === "shendiao-tieqiangmiao-act6",
  )

  const baseWorld = createWorld()
  baseWorld.arcs.shendiao = {
    beats: {
      "act1-wind": "done",
      "act2-damos": "done",
      "act3-zhongdu": "done",
      "act4-taohua": "done",
      "act5-old-debts": "done",
    },
    variants: {
      "act4.taohua-route": "guo-huang",
      "act5.ouyangke": "killed-witnessed",
      "act6.munianci": "cleared",
      "act6.munianci-evidence": "material",
      "act6.munianci-outcome": "broken",
      "act6.island": "cleared",
      "act6.island-outcome": "xiaoying-saved",
      "act6.yanyu": "cleared",
      "act6.yanyu-focus": "oral-only",
      "act6.yanyu-outcome": "exits-sealed",
    },
  }
  baseWorld.npcs.ouyangke = { alive: false, recruited: false, faction: "", fateTags: [] }
  baseWorld.npcs.hanxiaoying = { alive: true, recruited: false, faction: "", fateTags: [] }
  const evidenceInventory = {
    "ouyangke-jade-shard": 1,
    "yangkang-jade-shoe": 1,
    "han-xiaoying-blood-writing": 1,
    "taohua-snake-venom": 1,
    "yellow-robe-fiber": 1,
    "taohua-route-scratch": 1,
  }
  const basePlayer = mkPlayer({ inventory: evidenceInventory, world: baseWorld })
  const opened = openLocationStory({ player: basePlayer, locationId: "tieqiangmiao" })!
  check(
    "烟雨楼完成后铁枪庙优先触发 P4 事件",
    opened.command.type === "show-event-entry"
      && opened.command.event.id === "shendiao-tieqiangmiao-act6",
  )

  const focusCases = [
    ["island-route", "prior-entry-record"],
    ["blood-writing", "prior-martial-record"],
    ["living-witness", "prior-martial-record"],
    ["jade-shoe", "prior-token-record"],
    ["baituo-traces", "prior-motive-record"],
    ["oral-only", "prior-oral-record"],
  ] as const
  for (const [focus, expectedNode] of focusCases) {
    const world = structuredClone(baseWorld)
    world.arcs.shendiao.variants["act6.yanyu-focus"] = focus
    const route = resolveBranch(mkPlayer({ world }), world, temple.nodes["yanyu-record"].autoNext!)
    check(`烟雨楼焦点 ${focus} 对应铁枪庙既有记录`, route.type === "goto" && route.nodeId === expectedNode)
  }

  const livingOuyangWorld = structuredClone(baseWorld)
  livingOuyangWorld.npcs.ouyangke.alive = true
  livingOuyangWorld.arcs.shendiao.variants["act5.ouyangke"] = "survived-wounded"
  livingOuyangWorld.arcs.shendiao.variants["act6.yanyu-focus"] = "baituo-traces"
  const livingOuyangRoute = resolveBranch(
    mkPlayer({ world: livingOuyangWorld }),
    livingOuyangWorld,
    temple.nodes["yanyu-record"].autoNext!,
  )
  check(
    "欧阳克存活时白驼焦点只能进入动机部分成立",
    livingOuyangRoute.type === "goto" && livingOuyangRoute.nodeId === "prior-motive-partial",
  )
  const livingOuyangEntered = enterNode(
    mkPlayer({ world: livingOuyangWorld }),
    livingOuyangWorld,
    temple,
    "prior-motive-partial",
  )!
  check(
    "欧阳克存活不会把报仇动机记为完整",
    livingOuyangEntered.world.arcs.shendiao.variants["act6.truth-motive"] === "partial",
  )

  const proofChoices = [
    ["truth-entry-question", "submit-route-scratch", "act6.truth-entry"],
    ["truth-martial-question", "match-blood-and-venom", "act6.truth-martial"],
    ["truth-token-question", "present-jade-shoe-again", "act6.truth-token"],
    ["truth-motive-question", "present-ouyangke-shard", "act6.truth-motive"],
  ] as const
  let proofPlayer = basePlayer
  let proofWorld = baseWorld
  for (const [nodeId, choiceId, variantKey] of proofChoices) {
    const choice = temple.nodes[nodeId].choices!.find((item) => item.id === choiceId)!
    check(`完整证物选项可见：${choiceId}`, checkCondition(proofPlayer, proofWorld, choice.condition))
    const resolved = resolveChoice(proofPlayer, proofWorld, temple, nodeId, choiceId)!
    proofPlayer = resolved.player
    proofWorld = resolved.world
    check(
      `完整证物写入 proven：${variantKey}`,
      proofWorld.arcs.shendiao.variants[variantKey] === "proven",
    )
  }

  const completeRoute = resolveBranch(proofPlayer, proofWorld, temple.nodes["truth-tally"].autoNext!)
  check("四轮 proven 汇总为完整证据链", completeRoute.type === "goto" && completeRoute.nodeId === "truth-complete")
  const completeEntered = enterNode(proofPlayer, proofWorld, temple, "truth-complete")!
  check(
    "完整证据链写入 truth-strength=complete",
    completeEntered.world.arcs.shendiao.variants["act6.truth-strength"] === "complete",
  )

  const partialWorld = structuredClone(proofWorld)
  partialWorld.arcs.shendiao.variants["act6.truth-token"] = "partial"
  const partialRoute = resolveBranch(mkPlayer({ world: partialWorld }), partialWorld, temple.nodes["truth-tally"].autoNext!)
  check("任一轮 partial 时汇总为部分证据链", partialRoute.type === "goto" && partialRoute.nodeId === "truth-partial")

  const corruptedWorld = structuredClone(proofWorld)
  corruptedWorld.arcs.shendiao.variants["act6.truth-martial"] = "misled"
  const corruptedRoute = resolveBranch(
    mkPlayer({ world: corruptedWorld }),
    corruptedWorld,
    temple.nodes["truth-tally"].autoNext!,
  )
  check("任一轮 misled 时汇总为冲突记录", corruptedRoute.type === "goto" && corruptedRoute.nodeId === "truth-corrupted")

  const misleadingChoiceIds = [
    "blame-taohua-gate",
    "reuse-flute-accusation",
    "hide-jade-shoe",
    "blame-old-taohua-feud",
  ]
  check(
    "四轮都提供故意误导入口",
    misleadingChoiceIds.every((choiceId) =>
      Object.values(temple.nodes).some((node) => node.choices?.some((choice) => choice.id === choiceId))
    ),
  )

  const verdictChoices = temple.nodes["yangkang-verdict"].choices!
  const verdictChoice = (id: string) => verdictChoices.find((choice) => choice.id === id)!
  const completeVerdictWorld = completeEntered.world
  const completeVerdictPlayer = completeEntered.player
  check(
    "完整证据加封死退路可进入被捕",
    checkCondition(
      completeVerdictPlayer,
      completeVerdictWorld,
      verdictChoice("bind-for-trial").condition,
    ),
  )
  check(
    "极高门槛路线可进入有限认罪",
    checkCondition(
      completeVerdictPlayer,
      completeVerdictWorld,
      verdictChoice("let-munianci-ask").condition,
    ),
  )

  const coveredWorld = structuredClone(completeVerdictWorld)
  coveredWorld.arcs.shendiao.variants["act6.yanyu-outcome"] = "yangkang-covered"
  check(
    "烟雨楼包庇后关闭有限认罪并开启助逃",
    !checkCondition(mkPlayer({ world: coveredWorld }), coveredWorld, verdictChoice("let-munianci-ask").condition)
      && checkCondition(mkPlayer({ world: coveredWorld }), coveredWorld, verdictChoice("open-back-route").condition),
  )

  const concealedWorld = structuredClone(completeVerdictWorld)
  concealedWorld.arcs.shendiao.variants["act5.ouyangke"] = "killed-concealed"
  check(
    "替杨康毁过欧阳克证据时关闭有限认罪",
    !checkCondition(mkPlayer({ world: concealedWorld }), concealedWorld, verdictChoice("let-munianci-ask").condition),
  )

  const corruptedEntered = enterNode(
    mkPlayer({ world: corruptedWorld }),
    corruptedWorld,
    temple,
    "truth-corrupted",
  )!
  check(
    "四轮存在误导时允许玩家继续主动助逃",
    checkCondition(
      corruptedEntered.player,
      corruptedEntered.world,
      verdictChoice("open-back-route").condition,
    ),
  )

  const verdictCases = [
    ["verdict-dead", "dead", false],
    ["verdict-escaped", "escaped", true],
    ["verdict-captured", "captured", true],
    ["verdict-confessed", "confessed", true],
    ["verdict-aided", "aided", true],
  ] as const
  for (const [nodeId, verdict, alive] of verdictCases) {
    const world = structuredClone(completeVerdictWorld)
    const entered = enterNode(mkPlayer({ world }), world, temple, nodeId)!
    check(
      `杨康裁决 ${verdict} 写入命运与生死`,
      entered.world.arcs.shendiao.variants["act6.yangkang-verdict"] === verdict
        && entered.world.npcs.yangkang.alive === alive,
    )
    check(
      `杨康裁决 ${verdict} 不提前完成第六幕`,
      entered.world.arcs.shendiao.beats["act6-truth"] === undefined,
    )
  }

  const aidedEntered = enterNode(
    mkPlayer({ world: structuredClone(completeVerdictWorld) }),
    structuredClone(completeVerdictWorld),
    temple,
    "verdict-aided",
  )!
  check(
    "玩家助逃会与郭靖黄蓉语义关系决裂",
    aidedEntered.world.npcs.guojing.relationType === "仇敌"
      && aidedEntered.world.npcs.huangrong.relationType === "仇敌",
  )

  const afterChoice = resolveChoice(
    completeVerdictPlayer,
    completeVerdictWorld,
    temple,
    "after-trail",
    "return-damos",
  )!
  const closeRoute = resolveBranch(
    afterChoice.player,
    afterChoice.world,
    temple.nodes["act6-close-router"].autoNext!,
  )
  check("铁枪庙余波选择能进入对应收束节点", closeRoute.type === "goto" && closeRoute.nodeId === "act6-close-damos")
  const finalEntered = enterNode(afterChoice.player, afterChoice.world, temple, "act6-close-damos")!
  check(
    "仅最终余波写入 act6-truth",
    finalEntered.world.arcs.shendiao.beats["act6-truth"] === "done",
  )
  const nextProgress = getStoryProgress(finalEntered.player)
  check(
    "第六幕完成后进度切到第七幕大漠",
    nextProgress.act.id === "act7-western-campaign"
      && nextProgress.recommendedLocationId === "damos",
  )

  const templeText = JSON.stringify(temple)
  check(
    "五项桃花岛证物与欧阳克证物均在铁枪庙有读侧",
    [
      "yangkang-jade-shoe",
      "han-xiaoying-blood-writing",
      "taohua-snake-venom",
      "yellow-robe-fiber",
      "taohua-route-scratch",
      "ouyangke-jade-shard",
    ].every((itemId) => templeText.includes(itemId)),
  )
  check(
    "铁枪庙不使用塌梁替代人物因果",
    !templeText.includes("塌梁") && !templeText.includes("横梁砸"),
  )
}

console.log(`\n========================================`)
console.log(`通过 ${pass} / 失败 ${fail}`)
console.log(`========================================`)
process.exit(fail > 0 ? 1 : 0)
