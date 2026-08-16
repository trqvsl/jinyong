// 剧情引擎单测：consequences / conditions / branch / onEnter 幂等
// 运行：npx tsx scripts/verify-story.ts
import type { Player } from "../src/types"
import { STORY_EVENTS } from "../src/data/events"
import { STORY_VOLUMES } from "../src/data/story"
import { WORLD_EVENTS } from "../src/data/story/worldEvents"
import { ENEMIES } from "../src/data/enemies"
import { getSkillById } from "../src/data/skills"
import { getLocationById, LOCATIONS } from "../src/data/map"
import { NPCS } from "../src/data/npcs"
import {
  STORY_DEBUG_ACT_PRESETS,
  STORY_DEBUG_ROUTE_GROUPS,
  STORY_DEBUG_ROUTE_PRESETS,
  STORY_DEBUG_VARIANT_FIELDS,
} from "../src/data/story/debugPresets"
import {
  SHENDIAO_ACT8_EVENT_IDS,
  SHENDIAO_ACT8_LOCATION_EVENT_ORDER,
  SHENDIAO_ACT8_STORY,
} from "../src/data/story/shendiaoAct8"
import {
  SHENDIAO_ENDING_DEFINITIONS,
  SHENDIAO_ENDING_IDS,
} from "../src/data/story/shendiaoEndingRecords"
import {
  SHENDIAO_ACT6_AFTERMATH_WORLD_EVENT,
  SHENDIAO_ENDING_WORLD_EVENTS,
} from "../src/data/story/shendiaoWorldEvents"
import { createWorld, migrateWorld } from "../src/game/story/state"
import { applyStoryDebugPreset } from "../src/game/debug"
import { applyConsequences } from "../src/game/story/consequences"
import { checkCondition } from "../src/game/story/conditions"
import { getShendiaoEndingRecord } from "../src/game/story/endingRecord"
import { resolveBranch, enterNode, resolveChoice, resolveBattleOutcome, visibleChoices } from "../src/game/story/engine"
import { getStoryEventByLocation, getStoryProgress } from "../src/game/story/query"
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

const KNOWN_ENEMY_IDS = new Set(ENEMIES.map((enemy) => enemy.id))

function verifyBattleTransition(label: string, transition: Extract<Transition, { type: "battle" }>) {
  const enemySourceCount = Number(!!transition.enemyId)
    + Number(transition.enemyIds !== undefined)
    + Number(!!transition.useLocationPool)
  check(`${label} 敌方来源互斥`, enemySourceCount <= 1)
  if (transition.enemyId) {
    check(`${label} 敌方 id 存在`, KNOWN_ENEMY_IDS.has(transition.enemyId))
  }
  if (transition.enemyIds !== undefined) {
    check(`${label} 多敌方编组非空`, transition.enemyIds.length > 0)
    check(
      `${label} 多敌方 id 均存在`,
      transition.enemyIds.every((enemyId) => KNOWN_ENEMY_IDS.has(enemyId)),
    )
  }

  const objective = transition.objective
  if (!objective) return
  check(
    `${label} 战斗目标轮数有效`,
    objective.kind !== "surviveRounds"
      || Number.isInteger(objective.rounds) && objective.rounds > 0,
  )

  const declaredProtectedIds = [
    ...(objective.protectAllyIds ?? []),
    ...(objective.protectAllyId ? [objective.protectAllyId] : []),
  ]
  const protectedIds = Array.from(new Set(declaredProtectedIds))
  check(`${label} 保护目标不重复`, declaredProtectedIds.length === protectedIds.length)
  check(
    `${label} 保护目标已加入友方`,
    protectedIds.every((allyId) => (transition.allyIds ?? []).includes(allyId)),
  )

  if (objective.minProtectedSurvivors !== undefined) {
    check(
      `${label} 最低幸存人数有效`,
      protectedIds.length > 0
        && Number.isInteger(objective.minProtectedSurvivors)
        && objective.minProtectedSurvivors > 0
        && objective.minProtectedSurvivors <= protectedIds.length,
    )
    if (objective.minProtectedSurvivors < protectedIds.length) {
      check(`${label} 允许伤亡时声明 onPartial`, !!transition.onPartial)
    }
  }
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
      walkTransition(transition.onPartial?.then, visit)
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
        walkConsequences(current.onPartial?.consequences, `${source}.battle.onPartial`)
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
        if (transition.type === "battle") {
          verifyBattleTransition(`${event.id}.${node.id}`, transition)
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
          if (transition.type === "battle") {
            verifyBattleTransition(`${event.id}.${node.id}.${choice.id}`, transition)
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

console.log("\n=== 19. 射雕第七幕 P2 地点、人物、敌军与动态路引 ===")
{
  const npcIds = new Set(NPCS.map((npc) => npc.id))
  const enemyIds = new Set(ENEMIES.map((enemy) => enemy.id))
  check("地图 id 全局唯一", new Set(LOCATIONS.map((location) => location.id)).size === LOCATIONS.length)
  check("NPC id 全局唯一", npcIds.size === NPCS.length)
  check("敌人 id 全局唯一", enemyIds.size === ENEMIES.length)
  check(
    "地图 NPC 引用均存在",
    LOCATIONS.every((location) => (location.npcIds ?? []).every((npcId) => npcIds.has(npcId))),
  )
  check(
    "地图敌人池引用均存在",
    LOCATIONS.every((location) => location.enemyPool.every((enemyId) => enemyIds.has(enemyId))),
  )

  const camp = getLocationById("western-camp")!
  const samarkand = getLocationById("samarkand")!
  const damos = getLocationById("damos")!
  check("西征大营挂载军帐事件", camp.events[0] === "shendiao-western-camp-act7")
  check(
    "撒马尔罕事件按余波、攻城、侦察排序",
    samarkand.events.join(",") === [
      "shendiao-samarkand-aftermath-act7",
      "shendiao-samarkand-siege-act7",
      "shendiao-samarkand-scout-act7",
    ].join(","),
  )
  check(
    "大漠优先预留第七幕后段与召回事件",
    damos.events.slice(0, 3).join(",") === [
      "shendiao-damos-departure-act7",
      "shendiao-damos-home-order-act7",
      "shendiao-damos-act7",
    ].join(","),
  )

  const world = createWorld()
  world.arcs.shendiao = {
    beats: {
      "act1-wind": "done",
      "act2-damos": "done",
      "act3-zhongdu": "done",
      "act4-taohua": "done",
      "act5-old-debts": "done",
      "act6-truth": "done",
    },
    variants: {},
  }
  const player = mkPlayer({ world })
  check("第七幕起点推荐蒙古大漠", getStoryProgress(player).recommendedLocationId === "damos")
  check("第七幕起点不提前解锁西征大营", camp.unlock?.(player) === false)
  check("第七幕起点不提前解锁撒马尔罕", samarkand.unlock?.(player) === false)

  world.arcs.shendiao.variants["act7.recall"] = "cleared"
  check(
    "草原召回后解锁并推荐西征大营",
    camp.unlock?.(player) === true
      && getStoryProgress(player).recommendedLocationId === "western-camp",
  )

  world.arcs.shendiao.variants["act7.camp"] = "cleared"
  check(
    "军帐完成后解锁并推荐撒马尔罕",
    samarkand.unlock?.(player) === true
      && getStoryProgress(player).recommendedLocationId === "samarkand",
  )

  world.arcs.shendiao.variants["act7.scout"] = "cleared"
  check("侦察后路引切到城下军议", getStoryProgress(player).primaryAction === "携侦察结果赴城下军议")
  world.arcs.shendiao.variants["act7.siege"] = "cleared"
  check("攻城后路引切到破城军纪", getStoryProgress(player).primaryAction === "进城约束军纪")
  world.arcs.shendiao.variants["act7.city"] = "cleared"
  check("城中段后路引返回大漠", getStoryProgress(player).recommendedLocationId === "damos")
  world.arcs.shendiao.variants["act7.home-order"] = "cleared"
  check("南征军令后路引切到离营南归", getStoryProgress(player).primaryAction === "决定离营与南归路线")
}

console.log("\n=== 20. 射雕第七幕 P3 草原再召、军帐与城外侦察 ===")
{
  const recall = STORY_VOLUMES.find((event) => event.id === "shendiao-damos-act7")!
  const camp = STORY_VOLUMES.find((event) => event.id === "shendiao-western-camp-act7")!
  const scout = STORY_VOLUMES.find((event) => event.id === "shendiao-samarkand-scout-act7")!
  check("P3 三个事件已接入射雕卷", !!recall && !!camp && !!scout)

  const world = createWorld()
  world.arcs.shendiao = {
    beats: {
      "act1-wind": "done",
      "act2-damos": "done",
      "act3-zhongdu": "done",
      "act4-taohua": "done",
      "act5-old-debts": "done",
      "act6-truth": "done",
    },
    variants: {
      "act5.wumu-destination": "player-kept",
      "act6.aftermath": "return-damos",
    },
  }
  world.flags["shendiao.damos.growth"] = "riding"
  world.factions.mongol = { attitude: 15, power: 80 }
  const player = mkPlayer({
    world,
    relations: { zhebie: 10 },
    inventory: { "mongol-wolf-tally": 1 },
  })
  check(
    "第七幕大漠优先触发草原再召",
    getStoryEventByLocation(player, getLocationById("damos")!.events).id === recall.id,
  )
  check(
    "草原再召提供四种职责",
    visibleChoices(player, world, recall.nodes["role-table"]).map((choice) => choice.id).join(",") === [
      "join-command",
      "lead-scouts",
      "manage-rear",
      "remain-independent",
    ].join(","),
  )

  const roleResult = resolveChoice(player, world, recall, "role-table", "lead-scouts")!
  const recallClosed = enterNode(roleResult.player, roleResult.world, recall, "recall-close")!
  check(
    "职责与召回阶段分别写入",
    recallClosed.world.arcs.shendiao.variants["act7.role"] === "scout"
      && recallClosed.world.arcs.shendiao.variants["act7.recall"] === "cleared",
  )
  check(
    "召回后西征大营优先触发军帐事件",
    getStoryEventByLocation(recallClosed.player, getLocationById("western-camp")!.events).id === camp.id,
  )

  const disarm = (camp.nodes["orders-break"].choices ?? []).find((choice) => choice.id === "disarm-both-sides")!
  check(
    "军中缴械使用多敌方与多人保护 partial 契约",
    disarm.transition.type === "battle"
      && disarm.transition.enemyIds?.length === 2
      && disarm.transition.objective?.protectAllyIds?.length === 2
      && disarm.transition.objective.minProtectedSurvivors === 1
      && !!disarm.transition.onPartial,
  )
  const costlyDisarm = resolveBattleOutcome(recallClosed.player, recallClosed.world, disarm.transition, "partial")!
  check(
    "军帐部分达成仍写入缴械结果",
    costlyDisarm.world.arcs.shendiao.variants["act7.brothers"] === "disarmed",
  )

  const prisoner = resolveChoice(
    costlyDisarm.player,
    costlyDisarm.world,
    camp,
    "prisoner-yard",
    "cross-check-statements",
  )!
  const campClosed = enterNode(prisoner.player, prisoner.world, camp, "camp-close")!
  check(
    "俘虏核验与军帐阶段分别写入",
    campClosed.world.arcs.shendiao.variants["act7.prisoners"] === "verified"
      && campClosed.world.arcs.shendiao.variants["act7.camp"] === "cleared",
  )
  check(
    "军帐后撒马尔罕优先触发侦察事件",
    getStoryEventByLocation(campClosed.player, getLocationById("samarkand")!.events).id === scout.id,
  )

  const gateBattle = (scout.nodes["gate-method"].choices ?? []).find((choice) => choice.id === "ride-close-with-jebe")!
  const gateWin = resolveBattleOutcome(campClosed.player, campClosed.world, gateBattle.transition, "won")!
  check(
    "骑兵侦察胜利写入完整军情",
    gateWin.world.arcs.shendiao.variants["act7.scout-method"] === "cavalry"
      && gateWin.world.arcs.shendiao.variants["act7.intel"] === "complete",
  )
  const reportRoute = resolveBranch(gateWin.player, gateWin.world, scout.nodes["scout-report-router"].autoNext!)
  check("侦察方法能路由到对应军报", reportRoute.type === "goto" && reportRoute.nodeId === "report-gate")
  const scoutClosed = enterNode(gateWin.player, gateWin.world, scout, "scout-close")!
  check(
    "侦察只在最终军报后写入完成阶段",
    scoutClosed.world.arcs.shendiao.variants["act7.scout"] === "cleared"
      && scoutClosed.world.arcs.shendiao.beats["act7-western-campaign"] === undefined,
  )
}

console.log("\n=== 21. 射雕第七幕 P4 城下军令、军纪与屠城抉择 ===")
{
  const siege = STORY_VOLUMES.find((event) => event.id === "shendiao-samarkand-siege-act7")!
  const city = STORY_VOLUMES.find((event) => event.id === "shendiao-samarkand-aftermath-act7")!
  check("P4 攻城与城内两个事件已接入射雕卷", !!siege && !!city)
  check(
    "P4 两名本地保护友方已注册",
    NPCS.some((npc) => npc.id === "samarkand-healer")
      && NPCS.some((npc) => npc.id === "samarkand-guide"),
  )

  const world = createWorld()
  world.arcs.shendiao = {
    beats: {
      "act1-wind": "done",
      "act2-damos": "done",
      "act3-zhongdu": "done",
      "act4-taohua": "done",
      "act5-old-debts": "done",
      "act6-truth": "done",
    },
    variants: {
      "act5.wumu-destination": "player-kept",
      "act6.aftermath": "return-damos",
      "act7.recall": "cleared",
      "act7.camp": "cleared",
      "act7.scout": "cleared",
      "act7.role": "independent",
      "act7.brothers": "reconciled",
      "act7.prisoners": "released",
      "act7.scout-method": "infiltration",
      "act7.intel": "complete",
    },
  }
  const player = mkPlayer({ world })
  check(
    "侦察后撒马尔罕优先触发攻城事件",
    getStoryEventByLocation(player, getLocationById("samarkand")!.events).id === siege.id,
  )
  check(
    "完整复合前情可见四种攻城方案",
    visibleChoices(player, world, siege.nodes["siege-orders"]).map((choice) => choice.id).join(",") === [
      "order-feint",
      "order-blockade",
      "order-corridor",
      "order-assault",
    ].join(","),
  )

  const verifiedFeint = resolveChoice(player, world, siege, "siege-orders", "order-feint")!
  const verifiedFeintBattle = resolveBranch(
    verifiedFeint.player,
    verifiedFeint.world,
    verifiedFeint.transition,
  )
  check(
    "完整情报减少佯攻敌军编组",
    verifiedFeintBattle.type === "battle"
      && verifiedFeintBattle.enemyIds?.length === 2,
  )

  const uncertainWorld = structuredClone(world)
  uncertainWorld.arcs.shendiao.variants["act7.intel"] = "partial"
  const uncertainPlayer = mkPlayer({ world: uncertainWorld })
  const uncertainFeint = resolveChoice(uncertainPlayer, uncertainWorld, siege, "siege-orders", "order-feint")!
  const uncertainFeintBattle = resolveBranch(
    uncertainFeint.player,
    uncertainFeint.world,
    uncertainFeint.transition,
  )
  check(
    "不完整情报增加佯攻敌军编组",
    uncertainFeintBattle.type === "battle"
      && uncertainFeintBattle.enemyIds?.length === 3,
  )

  const assault = resolveChoice(player, world, siege, "siege-orders", "order-assault")!
  const assaultBattle = resolveBranch(assault.player, assault.world, assault.transition)
  const costlyAssault = assaultBattle.type === "battle"
    ? resolveBattleOutcome(assault.player, assault.world, assaultBattle, "partial")
    : null
  check(
    "攻城部分达成写入 costly",
    costlyAssault?.world.arcs.shendiao.variants["act7.siege-outcome"] === "costly",
  )

  const siegeClosed = enterNode(
    costlyAssault!.player,
    costlyAssault!.world,
    siege,
    "siege-close",
  )!
  check(
    "攻城只在最终回报写入 act7.siege",
    siegeClosed.world.arcs.shendiao.variants["act7.siege"] === "cleared",
  )
  check(
    "攻城后撒马尔罕优先触发城内事件",
    getStoryEventByLocation(siegeClosed.player, getLocationById("samarkand")!.events).id === city.id,
  )

  const discipline = resolveChoice(
    siegeClosed.player,
    siegeClosed.world,
    city,
    "discipline-scene",
    "quietly-secure-route",
  )!
  check(
    "暗中清路写入有限军纪",
    discipline.world.arcs.shendiao.variants["act7.discipline"] === "limited",
  )

  const evacuation = resolveChoice(
    discipline.player,
    discipline.world,
    city,
    "evacuation-choice",
    "open-evacuation-corridor",
  )!
  const evacuationBattle = resolveBranch(
    evacuation.player,
    evacuation.world,
    evacuation.transition,
  )
  check(
    "平民撤离使用双友方与最低幸存人数",
    evacuationBattle.type === "battle"
      && evacuationBattle.objective?.protectAllyIds?.length === 2
      && evacuationBattle.objective.minProtectedSurvivors === 1,
  )
  const fullEvacuation = evacuationBattle.type === "battle"
    ? resolveBattleOutcome(evacuation.player, evacuation.world, evacuationBattle, "won")
    : null
  check(
    "已核实路线无损达成写入 full",
    fullEvacuation?.world.arcs.shendiao.variants["act7.evacuation"] === "full",
  )

  const orderChoices = visibleChoices(
    fullEvacuation!.player,
    fullEvacuation!.world,
    city.nodes["slaughter-order"],
  ).map((choice) => choice.id)
  check(
    "完整撤离后四种屠城军令回应均可见",
    ["obey-order", "delay-order", "defy-with-guojing", "warn-inner-city"]
      .every((choiceId) => orderChoices.includes(choiceId)),
  )
  const defied = resolveChoice(
    fullEvacuation!.player,
    fullEvacuation!.world,
    city,
    "slaughter-order",
    "defy-with-guojing",
  )!
  check(
    "公开抗命写入 defied",
    defied.world.arcs.shendiao.variants["act7.order"] === "defied",
  )
  const cityClosed = enterNode(defied.player, defied.world, city, "city-close")!
  check(
    "城内收束写入 act7.city 且不提前完成第七幕",
    cityClosed.world.arcs.shendiao.variants["act7.city"] === "cleared"
      && cityClosed.world.arcs.shendiao.beats["act7-western-campaign"] === undefined,
  )
  check(
    "P4 完成后动态路引返回蒙古大漠",
    getStoryProgress(cityClosed.player).recommendedLocationId === "damos",
  )
}

console.log("\n=== 22. 射雕第七幕 P5 华筝、李萍与南归 ===")
{
  const home = STORY_VOLUMES.find((event) => event.id === "shendiao-damos-home-order-act7")!
  const departure = STORY_VOLUMES.find((event) => event.id === "shendiao-damos-departure-act7")!
  check("P5 家庭军令与离营两个事件已接入射雕卷", !!home && !!departure)

  const world = createWorld()
  world.arcs.shendiao = {
    beats: {
      "act1-wind": "done",
      "act2-damos": "done",
      "act3-zhongdu": "done",
      "act4-taohua": "done",
      "act5-old-debts": "done",
      "act6-truth": "done",
    },
    variants: {
      "act5.wumu-destination": "beggar-network",
      "act6.aftermath": "return-damos",
      "act7.recall": "cleared",
      "act7.camp": "cleared",
      "act7.scout": "cleared",
      "act7.siege": "cleared",
      "act7.city": "cleared",
      "act7.role": "command",
      "act7.discipline": "enforced",
      "act7.evacuation": "full",
      "act7.order": "defied",
    },
  }
  world.flags["shendiao.niujia.saved_liping"] = true
  world.flags["shendiao.damos.growth"] = "survival"
  const player = mkPlayer({
    world,
    relations: { huazheng: 25, liping: 20, guojing: 30 },
  })
  check(
    "P4 完成后大漠优先触发南征军令事件",
    getStoryEventByLocation(player, getLocationById("damos")!.events).id === home.id,
  )

  const truth = resolveChoice(player, world, home, "huazheng-choice", "tell-huazheng-truth")!
  const truthRoute = resolveBranch(truth.player, truth.world, truth.transition)
  const huaHelped = truthRoute.type === "goto"
    ? enterNode(truth.player, truth.world, home, truthRoute.nodeId)
    : null
  check(
    "公开抗命并保持信任时华筝自主提供离营路线",
    huaHelped?.world.arcs.shendiao.variants["act7.huazheng"] === "helped-escape",
  )

  const obeyedWorld = structuredClone(world)
  obeyedWorld.arcs.shendiao.variants["act7.order"] = "obeyed"
  const obeyedPlayer = mkPlayer({
    world: obeyedWorld,
    relations: { huazheng: 30, liping: 20, guojing: -10 },
  })
  const obeyedTruth = resolveChoice(
    obeyedPlayer,
    obeyedWorld,
    home,
    "huazheng-choice",
    "tell-huazheng-truth",
  )!
  const obeyedRoute = resolveBranch(obeyedTruth.player, obeyedTruth.world, obeyedTruth.transition)
  const huaBroke = obeyedRoute.type === "goto"
    ? enterNode(obeyedTruth.player, obeyedTruth.world, home, obeyedRoute.nodeId)
    : null
  check(
    "服从屠城时华筝断绝旧情",
    huaBroke?.world.arcs.shendiao.variants["act7.huazheng"] === "broke-ties",
  )

  const preparedChoices = visibleChoices(
    huaHelped!.player,
    huaHelped!.world,
    home.nodes["liping-tent"],
  ).map((choice) => choice.id)
  check(
    "完整撤离、公开抗命、可信接应与长期信任共同解锁李萍存活",
    preparedChoices.includes("offer-prepared-route"),
  )
  const prepared = resolveChoice(
    huaHelped!.player,
    huaHelped!.world,
    home,
    "liping-tent",
    "offer-prepared-route",
  )!
  const lipingSurvived = enterNode(
    prepared.player,
    prepared.world,
    home,
    "liping-survives",
  )!
  check(
    "高门槛路线由李萍自己选择离营并保持存活",
    lipingSurvived.world.arcs.shendiao.variants["act7.liping"] === "survived-prepared"
      && lipingSurvived.world.npcs.liping.alive === true,
  )

  const noRouteWorld = structuredClone(world)
  noRouteWorld.arcs.shendiao.variants["act7.evacuation"] = "partial"
  const noRoutePlayer = mkPlayer({
    world: noRouteWorld,
    relations: { huazheng: 25, liping: 20 },
  })
  check(
    "缺少完整撤离时关闭李萍存活选项",
    !visibleChoices(noRoutePlayer, noRouteWorld, home.nodes["liping-tent"])
      .some((choice) => choice.id === "offer-prepared-route"),
  )
  const testimony = enterNode(noRoutePlayer, noRouteWorld, home, "liping-testimony")!
  check(
    "默认原著路线写入李萍明志死亡",
    testimony.world.arcs.shendiao.variants["act7.liping"] === "died-testimony"
      && testimony.world.npcs.liping.alive === false,
  )

  const homeClosed = enterNode(
    lipingSurvived.player,
    lipingSurvived.world,
    home,
    "home-order-close",
  )!
  check(
    "家庭军令只在最终节点写入 act7.home-order",
    homeClosed.world.arcs.shendiao.variants["act7.home-order"] === "cleared",
  )
  check(
    "家庭军令后大漠优先触发离营事件",
    getStoryEventByLocation(homeClosed.player, getLocationById("damos")!.events).id === departure.id,
  )

  const departureChoices = visibleChoices(
    homeClosed.player,
    homeClosed.world,
    departure.nodes["departure-choice"],
  ).map((choice) => choice.id)
  check(
    "抗命且完整撤离时可随郭靖或护送难民",
    departureChoices.includes("leave-with-guojing")
      && departureChoices.includes("escort-refugees"),
  )
  const leave = resolveChoice(
    homeClosed.player,
    homeClosed.world,
    departure,
    "departure-choice",
    "leave-with-guojing",
  )!
  check(
    "随郭靖南归写入 departure 但不提前完成幕级 beat",
    leave.world.arcs.shendiao.variants["act7.departure"] === "with-guojing"
      && leave.world.arcs.shendiao.beats["act7-western-campaign"] === undefined,
  )

  obeyedWorld.arcs.shendiao.variants["act7.home-order"] = "cleared"
  obeyedWorld.arcs.shendiao.variants["act7.huazheng"] = "broke-ties"
  obeyedWorld.arcs.shendiao.variants["act7.evacuation"] = "failed"
  const obeyedDepartureChoices = visibleChoices(
    obeyedPlayer,
    obeyedWorld,
    departure.nodes["departure-choice"],
  ).map((choice) => choice.id)
  check(
    "服从屠城永久关闭郭靖同行并保留蒙古军职线",
    !obeyedDepartureChoices.includes("leave-with-guojing")
      && obeyedDepartureChoices.includes("keep-mongol-command"),
  )

  const completed = enterNode(leave.player, leave.world, departure, "act7-complete")!
  check(
    "第七幕只在最终离营节点完成",
    completed.world.arcs.shendiao.beats["act7-western-campaign"] === "done"
      && completed.player.world === completed.world,
  )
  check(
    "第七幕完成后进度切到第八幕",
    getStoryProgress(completed.player).act.id === "act8-huashan",
  )
}

console.log("\n=== 23. 射雕第七幕 P6 全路线与 Debug 审计 ===")
{
  const endingPresets = STORY_DEBUG_ROUTE_PRESETS.filter(
    (preset) => preset.routeGroupId === "act7-ending",
  )
  check(
    "Debug 路线夹具按铁枪庙、第七幕终局与第八幕终局分组",
    STORY_DEBUG_ROUTE_GROUPS.map((group) => group.id).sort().join(",")
      === ["act7-ending", "act8-ending", "temple"].join(","),
  )
  check("第七幕终局提供五类 departure 夹具", endingPresets.length === 5)

  let visibleEndingChoices = 0
  for (const preset of endingPresets) {
    const player = applyStoryDebugPreset(mkPlayer(), preset)
    const location = getLocationById(preset.targetLocationId)!
    const event = STORY_VOLUMES.find((candidate) => candidate.id === preset.targetEventId)!
    const node = event.nodes[preset.targetNodeId!]
    const choices = visibleChoices(player, player.world, node).map((choice) => choice.id)
    if (
      getStoryEventByLocation(player, location.events).id === preset.targetEventId
      && choices.includes(preset.targetChoiceId!)
    ) {
      visibleEndingChoices++
    }
  }
  check("五类终局夹具均命中目标事件与目标选项", visibleEndingChoices === 5)
  check(
    "终局夹具覆盖华筝四态",
    new Set(endingPresets.map((preset) => preset.variants?.["act7.huazheng"])).size === 4,
  )
  check(
    "终局夹具覆盖李萍三态",
    new Set(endingPresets.map((preset) => preset.variants?.["act7.liping"])).size === 3,
  )
  check(
    "关键状态编辑包含第七幕阶段、战争与终局",
    ["第七幕·阶段", "第七幕·战争", "第七幕·终局"].every((group) =>
      STORY_DEBUG_VARIANT_FIELDS.some((field) => field.group === group)
    ),
  )

  const recall = STORY_VOLUMES.find((event) => event.id === "shendiao-damos-act7")!
  const camp = STORY_VOLUMES.find((event) => event.id === "shendiao-western-camp-act7")!
  const scout = STORY_VOLUMES.find((event) => event.id === "shendiao-samarkand-scout-act7")!
  const wumuRoutes = [
    ["song-command", "wumu-song-command"],
    ["beggar-network", "wumu-beggar-network"],
    ["player-kept", "wumu-player-kept"],
    ["mongol-copy", "wumu-mongol-copy"],
  ] as const
  const growthRoutes = ["martial", "riding", "survival", "free"] as const
  let viableInputPairs = 0
  for (const [wumu, expectedNode] of wumuRoutes) {
    for (const growth of growthRoutes) {
      const world = createWorld()
      world.arcs.shendiao = {
        beats: { "act6-truth": "done" },
        variants: {
          "act5.wumu-destination": wumu,
          "act6.aftermath": "return-damos",
          "act7.role": growth === "survival"
            ? "logistics"
            : growth === "free"
              ? "independent"
              : growth === "riding"
                ? "scout"
                : "command",
        },
      }
      world.flags["shendiao.damos.growth"] = growth
      const player = mkPlayer({ world, relations: { zhebie: 15, liping: 20 } })
      const wumuRoute = resolveBranch(player, world, recall.nodes["wumu-route"].autoNext!)
      const growthVisible = growth === "martial"
        ? visibleChoices(player, world, camp.nodes["orders-break"])
          .some((choice) => choice.id === "disarm-both-sides")
        : growth === "riding"
          ? visibleChoices(player, world, scout.nodes["gate-method"])
            .some((choice) => choice.id === "ride-close-with-jebe")
          : growth === "survival"
            ? visibleChoices(player, world, scout.nodes["supply-method"])
              .some((choice) => choice.id === "follow-old-water-eye")
            : visibleChoices(player, world, scout.nodes["infiltration-method"])
              .some((choice) => choice.id === "travel-as-merchant")
      if (
        wumuRoute.type === "goto"
        && wumuRoute.nodeId === expectedNode
        && growthVisible
      ) {
        viableInputPairs++
      }
    }
  }
  check("四种武穆去向 × 四种大漠成长共 16 组均有读侧", viableInputPairs === 16)

  const oldHuashan = STORY_VOLUMES.find((event) => event.id === "shendiao-huashan")!
  const modernWorld = createWorld()
  modernWorld.arcs.shendiao = {
    beats: {
      yangkang: "done",
      "act7-western-campaign": "done",
    },
    variants: {},
  }
  const modernPlayer = mkPlayer({ world: modernWorld, reputation: 30 })
  check(
    "现代第七幕 done 后旧华山样板被隔离",
    !checkCondition(modernPlayer, modernWorld, oldHuashan.condition)
      && getStoryEventByLocation(modernPlayer, getLocationById("huashan")!.events).id !== oldHuashan.id,
  )

  const legacyWorld = createWorld()
  legacyWorld.arcs.shendiao = {
    beats: {
      yangkang: "done",
      "act7-western-campaign": "skipped",
    },
    variants: {},
  }
  const legacyPlayer = mkPlayer({ world: legacyWorld, reputation: 30 })
  check(
    "旧存档 act7 skipped 仍保留旧华山兼容入口",
    checkCondition(legacyPlayer, legacyWorld, oldHuashan.condition),
  )
}

console.log("\n=== 24. 射雕第八幕 P1 数据、路引与 Debug 底座 ===")
{
  const act8EventIds = [
    "shendiao-huashan-arrival-act8",
    "shendiao-huashan-testimony-act8",
    "shendiao-huashan-crisis-act8",
    "shendiao-huashan-contest-act8",
    "shendiao-huashan-epilogue-act8",
  ]
  check(
    "第八幕五事件 id 与设计契约一致",
    Object.values(SHENDIAO_ACT8_EVENT_IDS).join(",") === act8EventIds.join(","),
  )
  check(
    "华山地点按后段优先排列现代事件",
    SHENDIAO_ACT8_LOCATION_EVENT_ORDER.join(",") === [...act8EventIds].reverse().join(",")
      && getLocationById("huashan")!.events.slice(0, 6).join(",")
        === [...SHENDIAO_ACT8_LOCATION_EVENT_ORDER, "shendiao-huashan"].join(","),
  )
  check(
    "P4 已注册完整五事件链",
    SHENDIAO_ACT8_STORY.map((event) => event.id).join(",")
      === act8EventIds.join(","),
  )

  const world = createWorld()
  world.arcs.shendiao = {
    beats: {
      "act1-wind": "done",
      "act2-damos": "done",
      "act3-zhongdu": "done",
      "act4-taohua": "done",
      "act5-old-debts": "done",
      "act6-truth": "done",
      "act7-western-campaign": "done",
    },
    variants: { "act7.departure": "with-guojing" },
  }
  const player = mkPlayer({ world, reputation: 0 })
  check(
    "第七幕完成后低声望也可进入华山",
    getLocationById("huashan")!.unlock?.(player) === true,
  )
  check(
    "第八幕起点推荐赴华山",
    getStoryProgress(player).act.id === "act8-huashan"
      && getStoryProgress(player).primaryAction === "启程赴华山",
  )

  const guidanceCases = [
    ["act8.arrival", "参加山腰华山公议"],
    ["act8.testimony", "处理最后军报"],
    ["act8.value-stage", "登绝顶完成论剑"],
    ["act8.contest", "确认射雕卷最终去向"],
  ] as const
  let guidanceMatches = 0
  for (const [variant, expectedAction] of guidanceCases) {
    const routeWorld = structuredClone(world)
    routeWorld.arcs.shendiao.variants[variant] = "cleared"
    const progress = getStoryProgress(mkPlayer({ world: routeWorld }))
    if (
      progress.recommendedLocationId === "huashan"
      && progress.primaryAction === expectedAction
    ) {
      guidanceMatches++
    }
  }
  check("第八幕四段幕内路引均指向华山", guidanceMatches === guidanceCases.length)

  const preset = STORY_DEBUG_ACT_PRESETS.find((candidate) => candidate.id === "act8-start")!
  const debugPlayer = applyStoryDebugPreset(mkPlayer(), preset)
  check(
    "第八幕 Debug 入口命中群雄上山事件",
    preset.targetEventId === SHENDIAO_ACT8_EVENT_IDS.arrival
      && getStoryProgress(debugPlayer).act.id === "act8-huashan"
      && getStoryProgress(debugPlayer).recommendedLocationId === "huashan"
      && getStoryEventByLocation(debugPlayer, getLocationById("huashan")!.events).id
        === SHENDIAO_ACT8_EVENT_IDS.arrival,
  )
  check(
    "第八幕 Debug 入口隔离旧华山样板",
    getStoryEventByLocation(debugPlayer, getLocationById("huashan")!.events).id
      !== "shendiao-huashan",
  )
}

console.log("\n=== 25. 射雕第八幕 P2 群雄上山与华山公议 ===")
{
  const arrival = STORY_VOLUMES.find(
    (event) => event.id === SHENDIAO_ACT8_EVENT_IDS.arrival,
  )!
  const testimony = STORY_VOLUMES.find(
    (event) => event.id === SHENDIAO_ACT8_EVENT_IDS.testimony,
  )!
  const huashan = getLocationById("huashan")!
  const baseWorld = createWorld()
  baseWorld.arcs.shendiao = {
    beats: {
      "act1-wind": "done",
      "act2-damos": "done",
      "act3-zhongdu": "done",
      "act4-taohua": "done",
      "act5-old-debts": "done",
      "act6-truth": "done",
      "act7-western-campaign": "done",
    },
    variants: {
      "act6.truth-strength": "complete",
      "act6.misunderstanding": "questioning",
      "act7.evacuation": "full",
      "act7.order": "defied",
      "act7.huazheng": "stayed-loyal",
      "act7.liping": "survived-prepared",
      "act7.departure": "with-guojing",
    },
  }
  const basePlayer = mkPlayer({
    world: baseWorld,
    relations: { guojing: 30, huangrong: 25, huazheng: 20, liping: 20 },
  })
  check(
    "第七幕完成后华山优先触发群雄上山",
    getStoryEventByLocation(basePlayer, huashan.events).id === arrival.id,
  )
  baseWorld.arcs.shendiao.variants["act8.arrival"] = "cleared"
  check(
    "入山完成后华山优先触发公议",
    getStoryEventByLocation(basePlayer, huashan.events).id === testimony.id,
  )

  const entryCases = [
    ["with-guojing", "arrival-guo-router"],
    ["escort-refugees", "arrival-refugee-witness"],
    ["double-agent", "arrival-covert-messenger"],
    ["mongol-command", "arrival-mongol-envoy"],
    ["grassland-ending", "arrival-grassland-router"],
  ] as const
  let entryRoutes = 0
  for (const [departure, expectedNodeId] of entryCases) {
    const world = structuredClone(baseWorld)
    world.arcs.shendiao.variants["act7.departure"] = departure
    delete world.arcs.shendiao.variants["act8.arrival"]
    const player = mkPlayer({ world })
    const route = resolveBranch(player, world, arrival.nodes["huashan-foot"].autoNext!)
    if (route.type === "goto" && route.nodeId === expectedNodeId) entryRoutes++
  }
  check("五种 departure 均命中独立入山版本", entryRoutes === entryCases.length)

  const witnessCases = [
    ["guo-company", { "act7.evacuation": "full" }, { huangrong: 25 }, "witness-broad"],
    ["refugee-witness", { "act7.evacuation": "full" }, {}, "witness-broad"],
    ["covert-messenger", { "act7.evacuation": "full" }, {}, "witness-divided"],
    ["mongol-envoy", { "act7.evacuation": "full" }, {}, "witness-divided"],
    [
      "grassland-visitor",
      { "act7.huazheng": "stayed-loyal" },
      { huazheng: 20 },
      "witness-broad",
    ],
  ] as const
  let witnessRoutes = 0
  for (const [entry, variants, relations, expectedNodeId] of witnessCases) {
    const world = structuredClone(baseWorld)
    Object.assign(world.arcs.shendiao.variants, variants, { "act8.entry": entry })
    const player = mkPlayer({ world, relations })
    const route = resolveBranch(player, world, arrival.nodes["witness-roll"].autoNext!)
    if (route.type === "goto" && route.nodeId === expectedNodeId) witnessRoutes++
  }
  check("五种入场形成宽席、分席或稀疏见证席", witnessRoutes === witnessCases.length)

  const oldChoiceIds = visibleChoices(
    basePlayer,
    baseWorld,
    testimony.nodes["old-record-choice"],
  ).map((choice) => choice.id)
  const warChoiceIds = visibleChoices(
    basePlayer,
    baseWorld,
    testimony.nodes["war-record-choice"],
  ).map((choice) => choice.id)
  check(
    "旧案与战争记录均提供公开、限定、扣下与歪曲四种立场",
    oldChoiceIds.length === 4
      && warChoiceIds.length === 4
      && oldChoiceIds.includes("disclose-old-record")
      && oldChoiceIds.includes("distort-old-record")
      && warChoiceIds.includes("disclose-war-record")
      && warChoiceIds.includes("distort-war-record"),
  )

  const recordValues = ["disclosed", "qualified", "withheld", "distorted"] as const
  let recordMatrixMatches = 0
  for (const oldRecord of recordValues) {
    for (const warRecord of recordValues) {
      const world = structuredClone(baseWorld)
      Object.assign(world.arcs.shendiao.variants, {
        "act8.old-record": oldRecord,
        "act8.war-record": warRecord,
      })
      const player = mkPlayer({ world })
      const route = resolveBranch(player, world, testimony.nodes["record-tally"].autoNext!)
      const expected = oldRecord === "distorted" || warRecord === "distorted"
        ? "record-falsified"
        : oldRecord === "withheld" || warRecord === "withheld"
          ? "record-concealed"
          : oldRecord === "disclosed" && warRecord === "disclosed"
            ? "record-full"
            : "record-contested"
      if (route.type === "goto" && route.nodeId === expected) recordMatrixMatches++
    }
  }
  check("公议 4 × 4 记录组合全部命中确定结果", recordMatrixMatches === 16)

  const corruptedWorld = structuredClone(baseWorld)
  Object.assign(corruptedWorld.arcs.shendiao.variants, {
    "act6.truth-strength": "corrupted",
    "act8.old-record": "disclosed",
    "act8.war-record": "disclosed",
  })
  const corruptedPlayer = mkPlayer({ world: corruptedWorld })
  check(
    "旧证据 corrupted 时双公开仍只能进入争议记录",
    resolveBranch(
      corruptedPlayer,
      corruptedWorld,
      testimony.nodes["record-tally"].autoNext!,
    ).type === "goto"
      && (
        resolveBranch(
          corruptedPlayer,
          corruptedWorld,
          testimony.nodes["record-tally"].autoNext!,
        ) as Extract<Transition, { type: "goto" }>
      ).nodeId === "record-contested",
  )

  const closed = enterNode(basePlayer, baseWorld, testimony, "council-close")!
  check(
    "P2 只完成公议阶段，不提前写价值、论剑或幕级完成",
    closed.world.arcs.shendiao.variants["act8.testimony"] === "cleared"
      && closed.world.arcs.shendiao.variants["act8.value-stage"] === undefined
      && closed.world.arcs.shendiao.variants["act8.contest"] === undefined
      && closed.world.arcs.shendiao.beats["act8-huashan"] === undefined
      && closed.player.world === closed.world,
  )
}

console.log("\n=== 26. 射雕第八幕 P3 最后军报与必付代价 ===")
{
  const crisis = STORY_VOLUMES.find(
    (event) => event.id === SHENDIAO_ACT8_EVENT_IDS.crisis,
  )!
  const huashan = getLocationById("huashan")!
  const makeValuePlayer = (args: {
    variants?: Record<string, string>
    relations?: Record<string, number>
    reputation?: number
    mongolAttitude?: number
  } = {}) => {
    const world = createWorld()
    world.arcs.shendiao = {
      beats: {
        "act1-wind": "done",
        "act2-damos": "done",
        "act3-zhongdu": "done",
        "act4-taohua": "done",
        "act5-old-debts": "done",
        "act6-truth": "done",
        "act7-western-campaign": "done",
      },
      variants: {
        "act7.role": "independent",
        "act7.scout-method": "civilian",
        "act7.evacuation": "full",
        "act7.departure": "with-guojing",
        "act8.entry": "guo-company",
        "act8.witnesses": "broad",
        "act8.record": "full",
        "act8.arrival": "cleared",
        "act8.testimony": "cleared",
        ...(args.variants ?? {}),
      },
    }
    world.factions.mongol = {
      attitude: args.mongolAttitude ?? 10,
      power: 80,
    }
    return mkPlayer({
      world,
      reputation: args.reputation ?? 0,
      relations: {
        guojing: 25,
        huangrong: 25,
        "samarkand-guide": 10,
        ...(args.relations ?? {}),
      },
    })
  }
  const getValueBattle = (
    player: Player,
    choiceId: "save-crowd" | "guard-record" | "pursue-raiders",
  ): Extract<Transition, { type: "battle" }> => {
    const choice = visibleChoices(
      player,
      player.world,
      crisis.nodes["value-choice"],
    ).find((candidate) => candidate.id === choiceId)!
    return resolveBranch(
      player,
      player.world,
      choice.transition,
    ) as Extract<Transition, { type: "battle" }>
  }

  check(
    "P3 两类华山追缉敌人已注册",
    ENEMIES.some((enemy) => enemy.id === "huashan-military-pursuer")
      && ENEMIES.some((enemy) => enemy.id === "huashan-record-raider"),
  )
  const entryPlayer = makeValuePlayer()
  check(
    "公议完成后华山优先触发最后军报",
    getStoryEventByLocation(entryPlayer, huashan.events).id === crisis.id,
  )

  const recordRoutes = [
    ["full", "crisis-record-full"],
    ["contested", "crisis-record-contested"],
    ["concealed", "crisis-record-concealed"],
    ["falsified", "crisis-record-falsified"],
  ] as const
  let recordRouteMatches = 0
  for (const [record, expectedNodeId] of recordRoutes) {
    const player = makeValuePlayer({ variants: { "act8.record": record } })
    const route = resolveBranch(
      player,
      player.world,
      crisis.nodes["last-report-arrival"].autoNext!,
    )
    if (route.type === "goto" && route.nodeId === expectedNodeId) recordRouteMatches++
  }
  check("四类公议记录均改变最后军报开场", recordRouteMatches === recordRoutes.length)

  const ordinaryChoices = visibleChoices(
    entryPlayer,
    entryPlayer.world,
    crisis.nodes["value-choice"],
  ).map((choice) => choice.id)
  const envoyPlayer = makeValuePlayer({
    variants: { "act8.entry": "mongol-envoy" },
  })
  const envoyChoices = visibleChoices(
    envoyPlayer,
    envoyPlayer.world,
    crisis.nodes["value-choice"],
  ).map((choice) => choice.id)
  check(
    "普通路线提供三种行动，军职路线额外开放接管山门",
    ordinaryChoices.join(",") === "save-crowd,guard-record,pursue-raiders"
      && envoyChoices.includes("claim-seat"),
  )

  const battleConfigs = [
    [
      "save-crowd",
      { variants: { "act8.entry": "refugee-witness" } },
    ],
    [
      "save-crowd",
      {
        variants: {
          "act8.entry": "guo-company",
          "act7.evacuation": "failed",
        },
        relations: { guojing: 0 },
      },
    ],
    [
      "guard-record",
      { variants: { "act8.record": "full", "act8.witnesses": "broad" } },
    ],
    [
      "guard-record",
      {
        variants: {
          "act8.record": "contested",
          "act8.witnesses": "sparse",
        },
        relations: { huangrong: 0 },
      },
    ],
    [
      "pursue-raiders",
      { variants: { "act7.role": "scout" } },
    ],
    [
      "pursue-raiders",
      {
        variants: {
          "act7.role": "independent",
          "act7.scout-method": "civilian",
        },
      },
    ],
  ] as const
  let battleContracts = 0
  let battleOutcomes = 0
  for (const [choiceId, args] of battleConfigs) {
    const player = makeValuePlayer(args)
    const battle = getValueBattle(player, choiceId)
    if (
      battle.enemyIds?.length
      && battle.objective?.protectAllyIds?.length === 2
      && battle.objective.minProtectedSurvivors === 1
      && battle.onPartial
    ) {
      battleContracts++
    }
    for (const outcome of ["won", "partial", "lost", "fled"] as const) {
      const outcomePlayer = makeValuePlayer(args)
      const outcomeBattle = getValueBattle(outcomePlayer, choiceId)
      const resolved = resolveBattleOutcome(
        outcomePlayer,
        outcomePlayer.world,
        outcomeBattle,
        outcome,
      )!
      if (
        resolved.world.arcs.shendiao.variants["act8.value"] === choiceId
        && Boolean(resolved.world.arcs.shendiao.variants["act8.value-cost"])
        && resolved.then.type === "goto"
        && resolved.then.nodeId === "value-result-router"
        && resolved.player.world === resolved.world
      ) {
        battleOutcomes++
      }
    }
  }
  check("三种剧情战均提供多人保护与 partial 契约", battleContracts === 6)
  check("六套编组的 24 个战斗出口全部写入非空代价", battleOutcomes === 24)

  const claimed = resolveChoice(
    envoyPlayer,
    envoyPlayer.world,
    crisis,
    "value-choice",
    "claim-seat",
  )!
  check(
    "接管山门保留军职路线但固定损失信任",
    claimed.world.arcs.shendiao.variants["act8.value"] === "claim-seat"
      && claimed.world.arcs.shendiao.variants["act8.value-cost"] === "trust-lost"
      && claimed.world.arcs.shendiao.variants["act8.entry"] === "mongol-envoy"
      && claimed.player.relations.guojing === 15
      && claimed.player.relations.huangrong === 17,
  )

  const resultRoutes = [
    ["save-crowd", "culprit-escaped", "result-crowd-culprit"],
    ["save-crowd", "record-damaged", "result-crowd-record"],
    ["guard-record", "people-hurt", "result-record-people"],
    ["guard-record", "record-damaged", "result-record-damaged"],
    ["pursue-raiders", "people-hurt", "result-pursuit-people"],
    ["pursue-raiders", "record-damaged", "result-pursuit-record"],
    ["claim-seat", "trust-lost", "result-claimed-seat"],
  ] as const
  let resultRouteMatches = 0
  for (const [value, cost, expectedNodeId] of resultRoutes) {
    const player = makeValuePlayer({
      variants: {
        "act8.value": value,
        "act8.value-cost": cost,
      },
    })
    const route = resolveBranch(
      player,
      player.world,
      crisis.nodes["value-result-router"].autoNext!,
    )
    if (route.type === "goto" && route.nodeId === expectedNodeId) resultRouteMatches++
  }
  check("七种价值与代价组合均有可见结果节点", resultRouteMatches === resultRoutes.length)

  const closingPlayer = makeValuePlayer({
    variants: {
      "act8.value": "save-crowd",
      "act8.value-cost": "culprit-escaped",
    },
  })
  const closed = enterNode(
    closingPlayer,
    closingPlayer.world,
    crisis,
    "crisis-close",
  )!
  check(
    "P3 只完成价值阶段，不提前写论剑或幕级完成",
    closed.world.arcs.shendiao.variants["act8.value-stage"] === "cleared"
      && closed.world.arcs.shendiao.variants["act8.contest"] === undefined
      && closed.world.arcs.shendiao.beats["act8-huashan"] === undefined
      && getStoryProgress(closed.player).primaryAction === "登绝顶完成论剑"
      && closed.player.world === closed.world,
  )
}

console.log("\n=== 27. 射雕第八幕 P4 绝顶论剑与江湖定席 ===")
{
  const contest = STORY_VOLUMES.find(
    (event) => event.id === SHENDIAO_ACT8_EVENT_IDS.contest,
  )!
  const epilogue = STORY_VOLUMES.find(
    (event) => event.id === SHENDIAO_ACT8_EVENT_IDS.epilogue,
  )!
  const huashan = getLocationById("huashan")!
  const makeFinalPlayer = (args: {
    variants?: Record<string, string>
    relations?: Record<string, number>
    reputation?: number
    karma?: number
    mongolAttitude?: number
    skillIds?: string[]
  } = {}) => {
    const world = createWorld()
    world.arcs.shendiao = {
      beats: {
        "act1-wind": "done",
        "act2-damos": "done",
        "act3-zhongdu": "done",
        "act4-taohua": "done",
        "act5-old-debts": "done",
        "act6-truth": "done",
        "act7-western-campaign": "done",
      },
      variants: {
        "act4.taohua-route": "independent",
        "act7.order": "obeyed",
        "act7.departure": "double-agent",
        "act7.huazheng": "broke-cleanly",
        "act8.entry": "covert-messenger",
        "act8.witnesses": "divided",
        "act8.record": "contested",
        "act8.value": "pursue-raiders",
        "act8.value-cost": "record-damaged",
        "act8.arrival": "cleared",
        "act8.testimony": "cleared",
        "act8.value-stage": "cleared",
        ...(args.variants ?? {}),
      },
    }
    world.factions.mongol = {
      attitude: args.mongolAttitude ?? 0,
      power: 80,
    }
    return mkPlayer({
      world,
      reputation: args.reputation ?? 30,
      karma: args.karma ?? 0,
      skills: (args.skillIds ?? ["xianglong18"])
        .map((id) => getSkillById(id)!)
        .filter(Boolean),
      relations: {
        guojing: 10,
        huangrong: 10,
        "huangyaoshi-npc": 10,
        hongqigong: 10,
        yideng: 10,
        huazheng: 10,
        munianci: 10,
        ...(args.relations ?? {}),
      },
    })
  }
  const martialBattle = (
    player: Player,
    choiceId: "duel" | "hold-platform" | "protect-descent",
  ): Extract<Transition, { type: "battle" }> => {
    const choice = visibleChoices(
      player,
      player.world,
      contest.nodes["martial-choice"],
    ).find((candidate) => candidate.id === choiceId)!
    return resolveBranch(
      player,
      player.world,
      choice.transition,
    ) as Extract<Transition, { type: "battle" }>
  }
  const finalRoute = (player: Player) => resolveBranch(
    player,
    player.world,
    epilogue.nodes["ending-router"].autoNext!,
  )

  const contestPlayer = makeFinalPlayer()
  check(
    "价值阶段完成后华山优先触发绝顶论剑",
    getStoryEventByLocation(contestPlayer, huashan.events).id === contest.id,
  )
  const martialChoices = visibleChoices(
    contestPlayer,
    contestPlayer.world,
    contest.nodes["martial-choice"],
  ).map((choice) => choice.id)
  check(
    "合格角色可见对决、守台、护卷、观战与退席五路径",
    martialChoices.join(",")
      === "duel,hold-platform,protect-descent,observe,decline",
  )

  const noPrestige = makeFinalPlayer({ reputation: 0, skillIds: [] })
  const noPrestigeChoices = visibleChoices(
    noPrestige,
    noPrestige.world,
    contest.nodes["martial-choice"],
  ).map((choice) => choice.id)
  check(
    "无挑战门槛仍可护卷、观战或退席",
    noPrestigeChoices.join(",") === "protect-descent,observe,decline",
  )

  const westPlayer = makeFinalPlayer({
    relations: { "ouyangfeng-npc": 20 },
  })
  const taohuaPlayer = makeFinalPlayer({
    variants: { "act4.taohua-route": "guo-huang" },
    relations: { "huangyaoshi-npc": 20 },
  })
  const guoPlayer = makeFinalPlayer({
    relations: {
      "ouyangfeng-npc": 0,
      "huangyaoshi-npc": 0,
    },
  })
  check(
    "对决按白驼、桃花与默认关系注入三类对手",
    martialBattle(westPlayer, "duel").enemyId === "ouyangfeng"
      && martialBattle(taohuaPlayer, "duel").enemyId === "huangyaoshi"
      && martialBattle(guoPlayer, "duel").enemyId === "guojing",
  )

  const holdBattle = martialBattle(contestPlayer, "hold-platform")
  check(
    "守台使用四轮、多敌方、双宗师保护与 partial",
    holdBattle.enemyIds?.length === 3
      && holdBattle.objective?.kind === "surviveRounds"
      && holdBattle.objective.rounds === 4
      && holdBattle.objective.protectAllyIds?.length === 2
      && holdBattle.objective.minProtectedSurvivors === 1
      && Boolean(holdBattle.onPartial),
  )

  const preparedProtectPlayer = makeFinalPlayer({
    variants: {
      "act8.record": "full",
      "act8.value": "guard-record",
    },
  })
  const exposedProtectPlayer = makeFinalPlayer({
    variants: {
      "act8.record": "contested",
      "act8.value": "pursue-raiders",
    },
  })
  const preparedProtect = martialBattle(preparedProtectPlayer, "protect-descent")
  const exposedProtect = martialBattle(exposedProtectPlayer, "protect-descent")
  check(
    "完整记录与保护前情减少护卷敌军但不取消保护底线",
    preparedProtect.enemyIds?.length === 2
      && preparedProtect.objective?.protectAllyIds?.length === 3
      && preparedProtect.objective.minProtectedSurvivors === 2
      && exposedProtect.enemyIds?.length === 3
      && exposedProtect.objective?.protectAllyIds?.length === 2
      && exposedProtect.objective.minProtectedSurvivors === 1,
  )

  const battleCases = [
    ["duel", guoPlayer, ["won", "lost", "fled"]],
    ["hold-platform", contestPlayer, ["won", "partial", "lost", "fled"]],
    [
      "protect-descent",
      preparedProtectPlayer,
      ["won", "partial", "lost", "fled"],
    ],
    [
      "protect-descent",
      exposedProtectPlayer,
      ["won", "partial", "lost", "fled"],
    ],
  ] as const
  let martialOutcomes = 0
  for (const [choiceId, player, outcomes] of battleCases) {
    for (const outcome of outcomes) {
      const resolved = resolveBattleOutcome(
        player,
        player.world,
        martialBattle(player, choiceId),
        outcome,
      )!
      if (
        resolved.world.arcs.shendiao.variants["act8.martial-path"] === choiceId
        && Boolean(resolved.world.arcs.shendiao.variants["act8.martial"])
        && resolved.then.type === "goto"
        && resolved.then.nodeId === "title-router"
        && resolved.player.world === resolved.world
      ) {
        martialOutcomes++
      }
    }
  }
  check("论剑 15 个战斗出口均写入路径与结果", martialOutcomes === 15)

  const observeCases = [
    [["hamagong"], {}, "observe-reversed-meridians"],
    [["xianglong18"], {}, "observe-hard-soft"],
    [["changquan"], { "huangyaoshi-npc": 25 }, "observe-changing-steps"],
    [["changquan"], {}, "observe-breathing"],
  ] as const
  let observeRoutes = 0
  for (const [skillIds, relations, expectedNodeId] of observeCases) {
    const player = makeFinalPlayer({
      skillIds: [...skillIds],
      relations,
    })
    const route = resolveBranch(
      player,
      player.world,
      contest.nodes["observe-router"].autoNext!,
    )
    if (route.type === "goto" && route.nodeId === expectedNodeId) observeRoutes++
  }
  check("四类武学前情均有观战拆招版本", observeRoutes === observeCases.length)

  const titleCases = [
    ["duel", "won", 50, "title-recognized"],
    ["hold-platform", "held", 50, "title-recognized"],
    ["duel", "won", 30, "title-contender"],
    ["protect-descent", "won", 60, "title-contender"],
    ["observe", "understood", 60, "title-none"],
    ["hold-platform", "partial", 60, "title-none"],
  ] as const
  let titleRoutes = 0
  for (const [path, martial, reputation, expectedNodeId] of titleCases) {
    const player = makeFinalPlayer({
      reputation,
      relations: { hongqigong: 25 },
      variants: {
        "act8.witnesses": "broad",
        "act8.martial-path": path,
        "act8.martial": martial,
      },
    })
    const route = resolveBranch(
      player,
      player.world,
      contest.nodes["title-router"].autoNext!,
    )
    if (route.type === "goto" && route.nodeId === expectedNodeId) titleRoutes++
  }
  check("称号门槛稳定区分 recognized、contender 与 none", titleRoutes === 6)

  const endingFixtures = [
    [
      "commander",
      {
        "act7.departure": "mongol-command",
        "act8.record": "falsified",
        "act8.value": "claim-seat",
        "act8.martial-path": "duel",
      },
      { guojing: -20, huangrong: -20 },
      30,
    ],
    [
      "grassland",
      {
        "act7.departure": "grassland-ending",
        "act8.record": "contested",
        "act8.value": "save-crowd",
        "act8.martial-path": "decline",
      },
      {},
      0,
    ],
    [
      "taohua",
      {
        "act4.taohua-route": "guo-huang",
        "act7.departure": "with-guojing",
        "act7.order": "defied",
        "act8.record": "full",
        "act8.value": "guard-record",
        "act8.martial-path": "observe",
      },
      { huangrong: 40, "huangyaoshi-npc": 30, guojing: 30 },
      0,
    ],
    [
      "hero",
      {
        "act7.departure": "escort-refugees",
        "act7.order": "defied",
        "act8.record": "full",
        "act8.value": "guard-record",
        "act8.martial-path": "protect-descent",
      },
      { guojing: 30 },
      0,
    ],
    [
      "keeper",
      {
        "act7.departure": "double-agent",
        "act8.record": "full",
        "act8.value": "guard-record",
        "act8.martial-path": "protect-descent",
      },
      { guojing: 5 },
      0,
    ],
    [
      "hermit",
      {
        "act7.departure": "double-agent",
        "act8.record": "contested",
        "act8.value": "save-crowd",
        "act8.martial-path": "observe",
      },
      { munianci: 40 },
      0,
    ],
    [
      "outcast",
      {
        "act7.departure": "double-agent",
        "act8.record": "falsified",
        "act8.value": "save-crowd",
        "act8.martial-path": "duel",
      },
      {},
      0,
    ],
    [
      "wanderer",
      {
        "act7.departure": "double-agent",
        "act8.record": "contested",
        "act8.value": "pursue-raiders",
        "act8.martial-path": "observe",
      },
      {},
      0,
    ],
  ] as const
  let endingRoutes = 0
  let finalWrites = 0
  for (const [ending, variants, relations, mongolAttitude] of endingFixtures) {
    const player = makeFinalPlayer({
      variants: {
        ...variants,
        "act8.contest": "cleared",
      },
      relations,
      mongolAttitude,
    })
    const route = finalRoute(player)
    if (route.type !== "goto" || route.nodeId !== `facts-${ending}`) continue
    endingRoutes++
    const endingRoute = resolveBranch(
      player,
      player.world,
      epilogue.nodes[route.nodeId].autoNext!,
    )
    if (endingRoute.type !== "goto") continue
    const ended = enterNode(
      player,
      player.world,
      epilogue,
      endingRoute.nodeId,
    )!
    if (
      ended.world.arcs.shendiao.variants["act8.ending"] === ending
      && ended.world.arcs.shendiao.ending === ending
      && ended.world.arcs.shendiao.beats["act8-huashan"] === "done"
      && ended.player.world === ended.world
    ) {
      finalWrites++
    }
  }
  check("八类结局均有可达事实夹具", endingRoutes === 8)
  check("八类最终节点同步写 ending、arcEnding 与幕级 beat", finalWrites === 8)

  const titleNone = makeFinalPlayer({
    variants: {
      "act8.contest": "cleared",
      "act8.title": "none",
      "act8.martial-path": "observe",
    },
  })
  const titleRecognized = makeFinalPlayer({
    variants: {
      "act8.contest": "cleared",
      "act8.title": "recognized",
      "act8.martial-path": "observe",
    },
  })
  check(
    "隐藏称号不覆盖结局矩阵",
    finalRoute(titleNone).type === "goto"
      && (finalRoute(titleNone) as Extract<Transition, { type: "goto" }>).nodeId
        === "facts-wanderer"
      && finalRoute(titleRecognized).type === "goto"
      && (
        finalRoute(titleRecognized) as Extract<Transition, { type: "goto" }>
      ).nodeId === "facts-wanderer",
  )

  const karmaHigh = makeFinalPlayer({
    karma: 100,
    variants: {
      "act8.contest": "cleared",
      "act8.martial-path": "observe",
    },
  })
  const karmaLow = makeFinalPlayer({
    karma: -100,
    variants: {
      "act8.contest": "cleared",
      "act8.martial-path": "observe",
    },
  })
  check(
    "karma 高低不单独改变结局",
    finalRoute(karmaHigh).type === "goto"
      && (finalRoute(karmaHigh) as Extract<Transition, { type: "goto" }>).nodeId
        === "facts-wanderer"
      && finalRoute(karmaLow).type === "goto"
      && (finalRoute(karmaLow) as Extract<Transition, { type: "goto" }>).nodeId
        === "facts-wanderer",
  )

  const finalEventPlayer = makeFinalPlayer({
    variants: { "act8.contest": "cleared" },
  })
  check(
    "论剑完成后华山优先触发江湖定席",
    getStoryEventByLocation(finalEventPlayer, huashan.events).id === epilogue.id,
  )
}

console.log("\n=== 28. 射雕第八幕 P5 80 组合结局审计 ===")
{
  const epilogue = STORY_VOLUMES.find(
    (event) => event.id === SHENDIAO_ACT8_EVENT_IDS.epilogue,
  )!
  const legacyHuashan = STORY_VOLUMES.find(
    (event) => event.id === "shendiao-huashan",
  )!
  const endingPresets = STORY_DEBUG_ROUTE_PRESETS.filter(
    (preset) => preset.routeGroupId === "act8-ending",
  )
  let matchedEndingPresets = 0
  let isolatedEndingPresets = 0
  for (const preset of endingPresets) {
    const player = applyStoryDebugPreset(mkPlayer(), preset)
    const route = resolveBranch(
      player,
      player.world,
      epilogue.nodes["ending-router"].autoNext!,
    )
    if (
      getStoryEventByLocation(
        player,
        getLocationById(preset.targetLocationId)!.events,
      ).id === preset.targetEventId
      && route.type === "goto"
      && route.nodeId === preset.targetNodeId
    ) {
      matchedEndingPresets++
    }
    if (!checkCondition(player, player.world, legacyHuashan.condition)) {
      isolatedEndingPresets++
    }
  }
  check("第八幕终局提供八类 Debug 夹具", endingPresets.length === 8)
  check("八类终局夹具均命中现代事实页", matchedEndingPresets === 8)
  check("八类终局夹具均隔离旧华山样板", isolatedEndingPresets === 8)

  const records = ["full", "contested", "concealed", "falsified"] as const
  const values = [
    "save-crowd",
    "guard-record",
    "pursue-raiders",
    "claim-seat",
  ] as const
  const martialPaths = [
    "duel",
    "hold-platform",
    "protect-descent",
    "observe",
    "decline",
  ] as const
  const expectedEnding = (
    record: typeof records[number],
    value: typeof values[number],
    path: typeof martialPaths[number],
  ) => {
    if (
      record === "full"
      && value === "guard-record"
      && ["protect-descent", "observe", "decline"].includes(path)
    ) {
      return "keeper"
    }
    if (value === "save-crowd" && (path === "observe" || path === "decline")) {
      return "hermit"
    }
    if (record === "falsified") return "outcast"
    return "wanderer"
  }
  const makeAuditPlayer = (
    record: typeof records[number],
    value: typeof values[number],
    path: typeof martialPaths[number],
    title: "recognized" | "contender" | "none" = "none",
    karma = 0,
  ) => {
    const world = createWorld()
    world.arcs.shendiao = {
      beats: {
        "act1-wind": "done",
        "act2-damos": "done",
        "act3-zhongdu": "done",
        "act4-taohua": "done",
        "act5-old-debts": "done",
        "act6-truth": "done",
        "act7-western-campaign": "done",
      },
      variants: {
        "act4.taohua-route": "independent",
        "act7.order": "obeyed",
        "act7.departure": "double-agent",
        "act7.huazheng": "broke-cleanly",
        "act8.record": record,
        "act8.value": value,
        "act8.value-cost": value === "save-crowd"
          ? "culprit-escaped"
          : value === "guard-record"
            ? "people-hurt"
            : value === "pursue-raiders"
              ? "record-damaged"
              : "trust-lost",
        "act8.martial-path": path,
        "act8.martial": path === "duel"
          ? "won"
          : path === "hold-platform"
            ? "held"
            : path === "protect-descent"
              ? "won"
              : path === "observe"
                ? "understood"
                : "refused",
        "act8.title": title,
        "act8.contest": "cleared",
      },
    }
    return mkPlayer({
      world,
      karma,
      relations: {
        guojing: 10,
        huangrong: 10,
        "huangyaoshi-npc": 10,
        hongqigong: 10,
        yideng: 10,
        huazheng: 10,
        munianci: 40,
      },
    })
  }
  const resolveEnding = (player: Player) => {
    const route = resolveBranch(
      player,
      player.world,
      epilogue.nodes["ending-router"].autoNext!,
    )
    return route.type === "goto" ? route.nodeId.replace("facts-", "") : ""
  }

  let combinations = 0
  let deterministic = 0
  let titleInvariant = 0
  let karmaInvariant = 0
  const distribution: Record<string, number> = {
    keeper: 0,
    hermit: 0,
    outcast: 0,
    wanderer: 0,
  }
  for (const record of records) {
    for (const value of values) {
      for (const path of martialPaths) {
        combinations++
        const expected = expectedEnding(record, value, path)
        const actual = resolveEnding(makeAuditPlayer(record, value, path))
        distribution[actual] = (distribution[actual] ?? 0) + 1
        if (
          actual === expected
          && resolveEnding(makeAuditPlayer(record, value, path)) === expected
        ) {
          deterministic++
        }
        if (
          ["recognized", "contender", "none"].every(
            (title) => resolveEnding(makeAuditPlayer(
              record,
              value,
              path,
              title as "recognized" | "contender" | "none",
            )) === expected,
          )
        ) {
          titleInvariant++
        }
        if (
          [-100, 100].every(
            (karma) => resolveEnding(makeAuditPlayer(
              record,
              value,
              path,
              "none",
              karma,
            )) === expected,
          )
        ) {
          karmaInvariant++
        }
      }
    }
  }
  check("4 × 4 × 5 矩阵包含 80 个组合", combinations === 80)
  check("80 个组合重复解析均命中确定结局", deterministic === 80)
  check("80 个组合均不受隐藏称号覆盖", titleInvariant === 80)
  check("80 个组合均不由 karma 单独改写", karmaInvariant === 80)
  check(
    "中立审计基线分布稳定",
    distribution.keeper === 3
      && distribution.hermit === 8
      && distribution.outcast === 18
      && distribution.wanderer === 51,
  )
}

console.log("\n=== 29. P15 世界回响与卷末纪事 ===")
{
  const epilogue = STORY_VOLUMES.find(
    (event) => event.id === SHENDIAO_ACT8_EVENT_IDS.epilogue,
  )!
  const endingPresets = STORY_DEBUG_ROUTE_PRESETS.filter(
    (preset) => preset.routeGroupId === "act8-ending",
  )
  let completeRecords = 0
  let uniqueEndingEchoes = 0

  for (const preset of endingPresets) {
    const player = applyStoryDebugPreset(mkPlayer(), preset)
    const factRoute = resolveBranch(
      player,
      player.world,
      epilogue.nodes["ending-router"].autoNext!,
    )
    if (factRoute.type !== "goto") continue
    const endingRoute = resolveBranch(
      player,
      player.world,
      epilogue.nodes[factRoute.nodeId].autoNext!,
    )
    if (endingRoute.type !== "goto") continue
    const ended = enterNode(
      player,
      player.world,
      epilogue,
      endingRoute.nodeId,
    )!
    const record = getShendiaoEndingRecord(ended.player)
    if (
      record
      && record.sections.length === 5
      && record.sections.every((section) => section.facts.length >= 2)
    ) {
      completeRecords++
    }

    const matches = SHENDIAO_ENDING_WORLD_EVENTS.filter((worldEvent) =>
      checkCondition(ended.player, ended.world, worldEvent.trigger)
    )
    if (
      matches.length === 1
      && matches[0].event.id
        === SHENDIAO_ENDING_DEFINITIONS[record!.endingId].worldEventId
    ) {
      uniqueEndingEchoes++
    }
  }

  check(
    "八类终局回响数据与 ending 定义一一对应",
    SHENDIAO_ENDING_WORLD_EVENTS.length === SHENDIAO_ENDING_IDS.length
      && new Set(SHENDIAO_ENDING_WORLD_EVENTS.map((item) => item.id)).size === 8,
  )
  check("八类 Debug 终局均派生五段卷末纪事", completeRecords === 8)
  check("八类 Debug 终局均只命中自己的回响", uniqueEndingEchoes === 8)
  check(
    "终局回响优先于普通世界事件",
    WORLD_EVENTS.slice(0, 8).map((item) => item.id).join(",")
      === SHENDIAO_ENDING_WORLD_EVENTS.map((item) => item.id).join(",")
      && SHENDIAO_ENDING_WORLD_EVENTS.every((item) => item.priority === "urgent"),
  )

  const act6Variants = {
    "act6.munianci-outcome": "broken",
    "act6.island-outcome": "xiaoying-saved",
    "act6.yangkang-verdict": "captured",
  }
  const act6World = createWorld()
  act6World.arcs.shendiao = {
    beats: { "act6-truth": "done" },
    variants: act6Variants,
  }
  const act6Player = mkPlayer({ world: act6World })
  check(
    "第六幕完成后触发铁枪庙三路余波",
    checkCondition(
      act6Player,
      act6World,
      SHENDIAO_ACT6_AFTERMATH_WORLD_EVENT.trigger,
    ),
  )

  const act6Event = SHENDIAO_ACT6_AFTERMATH_WORLD_EVENT.event
  const routeCases = [
    ["aftermath-arrives", "act6.munianci-outcome", "broken", "munianci-broken"],
    ["aftermath-arrives", "act6.munianci-outcome", "informed-unresolved", "munianci-questioned"],
    ["aftermath-arrives", "act6.munianci-outcome", "hidden", "munianci-hidden"],
    ["munianci-broken", "act6.island-outcome", "xiaoying-saved", "island-xiaoying-saved"],
    ["munianci-broken", "act6.island-outcome", "ke-wounded", "island-ke-wounded"],
    ["munianci-broken", "act6.island-outcome", "evidence-preserved", "island-evidence-preserved"],
    ["munianci-broken", "act6.island-outcome", "killer-traced", "island-killer-traced"],
    ["munianci-broken", "act6.island-outcome", "ke-only", "island-limited-survivors"],
    ["island-xiaoying-saved", "act6.yangkang-verdict", "dead", "verdict-dead"],
    ["island-xiaoying-saved", "act6.yangkang-verdict", "escaped", "verdict-escaped"],
    ["island-xiaoying-saved", "act6.yangkang-verdict", "captured", "verdict-captured"],
    ["island-xiaoying-saved", "act6.yangkang-verdict", "confessed", "verdict-confessed"],
    ["island-xiaoying-saved", "act6.yangkang-verdict", "aided", "verdict-aided"],
  ] as const
  let routedAct6Echoes = 0
  for (const [nodeId, key, value, expectedNode] of routeCases) {
    const world = createWorld()
    world.arcs.shendiao = {
      beats: { "act6-truth": "done" },
      variants: { [key]: value },
    }
    const player = mkPlayer({ world })
    const route = resolveBranch(
      player,
      world,
      act6Event.nodes[nodeId].autoNext!,
    )
    if (route.type === "goto" && route.nodeId === expectedNode) {
      routedAct6Echoes++
    }
  }
  check(
    "穆念慈、桃花岛与杨康余波分流全部可达",
    routedAct6Echoes === routeCases.length,
  )
}

console.log(`\n========================================`)
console.log(`通过 ${pass} / 失败 ${fail}`)
console.log(`========================================`)
process.exit(fail > 0 ? 1 : 0)
