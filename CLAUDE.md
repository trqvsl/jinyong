# 金庸群侠传 · Claude Code 项目指南

> 本文件在每次新会话自动加载，无需手动读取。只放"做事需要知道的"，详细设计见各手册。

## 项目概况

致敬半瓶神仙醋版金庸群侠传2/3 的网页 RPG。纯前端单机，React 19 + TypeScript 6 + Vite 8 + 纯 CSS。

## 核心架构（三层分离）

```
data/          ← 纯数据，零逻辑（武功/敌人/NPC/门派/地图/剧情事件）
game/          ← 纯逻辑引擎，零剧情认知（战斗引擎 / 剧情引擎 / 属性推导）
screens/       ← 纯展示，调引擎
App.tsx        ← 路由编排，不含业务逻辑
```

**铁律**：`game/story/*` 不认识任何剧情/NPC id；`data/` 不含函数（apply 除外）。

## 关键类型与数据流

- `Player`（`src/types/index.ts`）：战斗属性 + 八大根基 `roots` + `karma`/`world`/`relations`/`inventory`
- `WorldState`（`src/data/story/schema.ts`）：npcs/factions/arcs/flags/triggeredEvents/seenNodes/completedEvents
- **世界状态挂 `player.world`**，`applyConsequences` 会同步 `p.world = w`（必须，否则 arcBeat 丢失）
- `karma` → 自动派生 `alignment`（≥30 正，≤-30 邪）
- 根基属性经 `src/game/attributes.ts` 推导战斗属性

## 剧情引擎（声明式）

- **Consequence**（写入）：17 种，数值用 delta/set，NPC 命运用 npcAlive/npcTag/arcBeat
- **Condition**（查询）：14 种 + and/or/not，missing key 有默认值（npc alive=true, recruited=false, faction attitude=0）
- **Transition**（流转）：end / goto / branch / random / battle / gotoEvent / gameOver
- **StoryNode**：`choices?`（选择）或 `autoNext`（纯叙事自动流转）或无（终点）
- **StoryEvent**：`once?` + `condition?` + `entryNode` + `nodes: Record<string, StoryNode>`
- 节点 Record 的 **key 必须与 node.id 一致**（enterNode 按 key 查找，goto 按 nodeId 查找）
- `EventScreen` 支持 three phases：choosing（选项）/ autoNext（纯叙事+继续按钮）/ result（结果+继续）

## 事件触发机制

1. 玩家去地图选地点 → `getStoryEventByLocation(player, loc.events)`
2. 遍历 loc.events 数组，返回第一个 `notCompleted + checkCondition 通过` 的
3. **数组顺序即优先级**：射雕主线事件排在通用事件前
4. `once: true` 的事件完成后进 `completedEvents`，不再触发
5. arcBeat 条件实现线性串联：完成前一节点的 arcBeat 才解锁下一个

## 战斗引擎（自包含模块）

- `src/game/battle/`：types / engine / adapter，纯函数零外部依赖
- 多对多 CTB 行动顺序，支持群攻（横扫/双击/乱打）
- 剧情战斗通过 `pendingBattleTransition` 衔接战后流转

## 射雕主线（8 节点因果链）

详见 `射雕主线脚本.md`（自然语言）↔ `src/data/story/shendiao.ts`（代码），一一对应。

arcBeat 串联：niujia → damos → meet-rong → qigong → wangfu → taohua → yangkang → huashan

## 存档迁移

- `migratePlayer()`（`src/game/player.ts`）：补 statuses/inventory/roots/karma/world/mastery/relations
- `migrateWorld()`（`src/game/story/state.ts`）：补 completedEvents/seenNodes + 旧 completedEvents→arcBeat 兼容
- **加新字段必须同步进迁移函数**

## 开发命令

- `npm run dev` — 启动开发服务器 http://localhost:5173/
- `npm run build` — tsc + vite build
- `npx tsx scripts/verify-story.ts` — 剧情引擎 34 项验证
- `npx tsx scripts/verify-battle.ts` — 战斗引擎 13 项验证
- `npx tsx scripts/verify-fixes.ts` — 修复回归 7 项验证

## 常见坑

- **applyConsequences 返回后 `player.world` 必须等于 `world`**（已修复，但改 consequences 时别破坏）
- **节点 key ≠ node.id 会导致 enterNode 找不到节点**
- **纯叙事节点（autoNext）需要 EventScreen 有对应 phase**，否则卡死
- **通用事件无 condition 会抢先于有 arcBeat 条件的主线事件**
- **React 闭包陷阱**：BattleScreen 用 useRef 持最新状态
- **旧存档**：改 WorldState 结构后必须更新 migrateWorld
