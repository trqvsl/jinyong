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

当前已知历史例外（不得继续扩散）：

- `data/npcs.ts` 仍导出 `getNpcById / npcToEnemy`，`data/enemies.ts` 等也保留查询 helper；后续应迁到 game/query 或 adapter
- `App.tsx` 的地点切磋回流暂时直接执行回满气血 / 内力；该结算应下沉到 `game/appFlow.ts`

## 关键类型与数据流

- `Player`（`src/types/index.ts`）：战斗属性 + 八大根基 `roots` + `karma`/`world`/`relations`/`inventory`
- `WorldState`（`src/data/story/schema.ts`）：npcs（含 relationType 语义关系）/factions/arcs（beats + variants）/flags/party/pendingWorldEvents/triggeredEvents/seenNodes/completedEvents/currentStory
- **世界状态挂 `player.world`**，`applyConsequences` 会同步 `p.world = w`（必须，否则 arcBeat 丢失）
- `karma` → 自动派生 `alignment`（≥30 正，≤-30 邪）
- 根基属性经 `src/game/attributes.ts` 推导战斗属性

## 剧情引擎（声明式）

- **Consequence**（写入）：当前以 `src/data/story/schema.ts` 为准，包含数值 delta/set、NPC 命运、语义关系、arcBeat、arcEnding、flag 等多种声明式写入
- **Condition**（查询）：13 种原子条件 + and/or/not，missing key 有默认值（npc alive=true, recruited=false, faction attitude=0, relationType=初识）
- **Transition**（流转）：end / pause / goto / branch / random / battle / gotoEvent / gameOver
- **StoryNode**：`choices?`（选择）或 `autoNext`（纯叙事自动流转）或无（终点）；可选 `stage` 声明场景、人物、动作与道具，可选 `sceneTransition` 声明纯展示用的地点 / 时辰题签
- **Choice**：`kind: "travel"` 表示显式换场；无结果文本时直接执行流转，不插入空结果页
- **StoryEvent**：`once?` + `condition?` + `entryNode` + `nodes: Record<string, StoryNode>`
- 节点 Record 的 **key 必须与 node.id 一致**（enterNode 按 key 查找，goto 按 nodeId 查找）
- `EventScreen` 支持 three phases：choosing（选项）/ autoNext（纯叙事+继续按钮）/ result（结果+继续）

## 事件触发机制

1. 玩家去地图选地点 → `getStoryEventByLocation(player, loc.events)`
2. 遍历 loc.events 数组，返回第一个 `notCompleted + checkCondition 通过` 的
3. **数组顺序即优先级**：射雕主线事件排在通用事件前
4. `once: true` 的事件完成后进 `completedEvents`，不再触发
5. arcBeat 条件实现线性串联：完成前一节点的 arcBeat 才解锁下一个
6. World event 可声明 `priority: "urgent"`；urgent 消息进入 `pendingWorldEvents` 队首，终局回响使用此能力

## 地点内部空间（当前只在牛家村启用）

1. 世界地图进入带 `STORY_AREA_MAPS` 配置的地点时，`openLocationStory()` 先建立暂停 checkpoint，再进入 `AreaScreen`
2. `AreaScreen` 先展示地点地图；点击点位后直接进入该点的 `StoryAreaSpace`
3. 独立空间由 `background / description / ambience / residents / actions` 组成
4. `storyTargets(eventId + nodeId)` 决定哪个空间显示当前剧情续接动作
5. 驻场人物可声明多组 `dialogues`；点击 NPC 后在底部命令框选择话题
6. 本地商店复用 `ShopScreen + SHOP_ITEMS`；本地行囊使用 `CharacterScreen` 的专用 inventory mode；切磋复用 NPC → battle 流程
7. residents / actions 可用 `visibleDuring(eventId + nodeId)` 按剧情断点显隐
8. 空间左上角“离开”返回地点地图，不在底部动作区重复放返回按钮
9. `SceneTransition` 只负责 cover / reveal 与时辰题签，**不修改** `day`、checkpoint 或剧情 transition

当前能力边界：

- 只有牛家村配置了内部地图；这还不是所有地点的通用自由探索层
- 独立空间依赖活动剧情的 `paused / areaEntry` checkpoint，事件结束后不能脱离剧情任意进入
- 驻场人物与本地动作已支持断点级显隐，但尚未接入人物生死、阵营等通用 `Condition`
- 商店仍使用通用三种货物，尚无地点专属库存；行囊已有独立物品图、分类、详情与场景内使用

## 战斗引擎（自包含模块）

- `src/game/battle/`：types / engine / adapter，纯函数零外部依赖
- 多对多 CTB 行动顺序，支持群攻（横扫/双击/乱打）
- 剧情战支持显式多敌方、单人 / 多人保护、最低幸存人数与 `partial` 结果
- 剧情战斗通过 `pendingBattleTransition` 衔接战后流转

## 射雕主线（八幕因果链，逐幕迁移）

- 《射雕英雄传二创游戏设定.md》：**射雕卷综合策划蓝图**，负责长期方向、多入口结构、节点版本体系、人物线与远期扩写口径
- 《射雕主线脚本.md》：**当前实现样板线说明**，负责当前代码里已落地的主线事件自然语言镜像
- `src/data/story/shendiao.ts`：**实际实现数据**

当前射雕现代八幕、P15 世界回响、卷末纪事与 RPG 专用对白框均已完成；第一幕高品质 RPG 样板首轮已经收口。牛家村已接入 7 个可直接进入的独立空间、22 名角色头像、NPC 多话题交谈、阶段显隐、本地商店、专用行囊、教头切磋、两次暂离续接、自然升级与郭啸天助战教学战。首次进入牛家村先看村图，再从钱塘江边入席听书；张十五说书、酒馆夜事、风雪误斗、雪地救伤、残冬监视、四路围村与九类离散结果均已拆成连续现场节拍。地点和剧情换场经过 `SceneTransition`，战况日志支持自动跟随与手动翻阅。29 个现代主线事件已按真实引擎连续走通，八类终局均有专属 urgent 回响和五段可回看记录。下一步先完成第一幕从新档到南北离散的整段桌面复验，并深化通用 Condition、地点专属库存和证物读侧，再处理世界地图与按幕拆包。`niujia / damos / meet-rong / qigong / wangfu / taohua` 仍同步写入，作为旧存档与后续旧样板兼容 beat。

当前验收以 **1280 × 800 桌面端** 为基准；暂不新增或维护移动端适配。项目进展中的旧移动端记录只是历史验证结果，不代表当前交付要求。

## 存档迁移

- `migratePlayer()`（`src/game/player.ts`）：补 statuses/inventory/roots/karma/world/mastery/relations
- `migrateWorld()`（`src/game/story/state.ts`）：补全 WorldState 字段 + 旧事件/旧 beat→八幕进度兼容
- **加新字段必须同步进迁移函数**

## 开发命令

### package.json 中的真实 scripts
- `npm run dev` — 启动开发服务器 http://localhost:5173/
- `npm run build` — tsc + vite build
- `npm run lint` — 运行 oxlint
- `npm test` — Vitest 路线、证物组合与引擎回归
- `npm run verify` — 聚合剧情、战斗、修复回归与 Vitest
- `npm run preview` — 预览构建结果

### 单项验证命令
- `npm run verify:story` — 剧情引擎 + 静态结构 / flag 使用验证
- `npm run verify:battle` — 战斗引擎验证
- `npm run verify:fixes` — 修复回归验证
- `npm run test:story-routes` — 路线可达性与证物组合
- `npm run test:story-engine` — 剧情引擎回归

### 桌面浏览器验收

- 当前基准：`1280 × 800`
- 优先访问正在运行的 `http://127.0.0.1:5173/`
- 若内置浏览器固定窄视口或沙箱内 Chrome 无法访问本机 Vite，使用沙箱外独立无头 Chrome
- 推荐参数：

```bash
'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' \
  --headless=new \
  --disable-gpu \
  --no-first-run \
  --no-default-browser-check \
  --disable-background-networking \
  --remote-debugging-address=127.0.0.1 \
  --remote-debugging-port=9230 \
  --user-data-dir=/tmp/jinyong-isolated-chrome-9230 \
  about:blank
```

- 该命令需要沙箱外执行授权；`/tmp` profile 与日常 Chrome 的 Cookie、扩展和登录完全隔离
- 通过 CDP `Emulation.setDeviceMetricsOverride` 设置 1280 × 800，再检查 DOM、控制台、图片 natural size、横向溢出与截图

## 常见坑

- **任何返回 player + world 的剧情结算后两者必须同步**；`applyConsequences` 与 `enterNode` 都要保证 `player.world === world`
- **节点 key ≠ node.id 会导致 enterNode 找不到节点**
- **纯叙事节点（autoNext）需要 EventScreen 有对应 phase**，否则卡死
- **pause 不等于 end**：pause 必须保留 `currentStory.paused`，不能写入 completedEvents；回原地点才续接
- **通用事件无 condition 会抢先于有 arcBeat 条件的主线事件**
- **React 闭包陷阱**：BattleScreen 用 useRef 持最新状态
- **旧存档**：改 WorldState 结构后必须更新 migrateWorld

## 文件索引（按任务场景分组）

### 改剧情 / 加事件
- `射雕英雄传二创游戏设定.md` — 射雕卷综合策划蓝图；改长期方向、多入口结构、节点版本体系、人物线时优先看这里
- `第七幕万里兵锋P0设计.md` — 第七幕统兵 / 侦察 / 军纪 / 平民撤离 / 抗命的 User Motion、Use Case、接口与状态契约
- `第八幕华山问侠P0设计.md` — 第八幕五种入场、真相 / 价值 / 武学三重高潮、八类结局与验收矩阵
- `第八幕华山问侠P15设计.md` — 第六幕余波、八类终局回响、五段卷末纪事、分层与验收契约
- `射雕主线脚本.md` — 当前实现样板线的自然语言脚本；改当前已落地主线事件时同步这里与代码
- `src/data/story/shendiao.ts` — 射雕剧情卷聚合、第一二幕、旧样板主线与同卷支线 / 余波事件
- `src/data/story/shendiaoAct3.ts` — 第三幕“中都照影”双地点连续事件
- `src/data/story/shendiaoAct4.ts` — 第四幕“五湖桃花”太湖、归云庄与桃花岛连续事件
- `src/data/story/shendiaoAct5.ts` — 第五幕“旧债成网”禁宫、密室、君山、铁掌峰、黑沼与一灯居连续事件
- `src/data/story/shendiaoAct6.ts` — 第六幕 P2-P4“真相索命”牛家村穆念慈、桃花岛血案、烟雨楼会局与铁枪庙四轮推理 / 杨康裁决连续事件
- `src/data/story/shendiaoAct7.ts` — 第七幕 P3-P5“万里兵锋”召回、军帐、侦察、攻城、军纪、撤离、屠城、华筝、李萍与南归
- `src/data/story/shendiaoAct8.ts` — 第八幕现代五事件链、华山公议、价值行动、绝顶论剑、隐藏称号、八类结局与卷末完成
- `src/data/story/shendiaoEndingRecords.ts` — 八类结局定义与离营 / 公议 / 军报 / 论剑静态文案映射
- `src/data/story/shendiaoWorldEvents.ts` — 第六幕三路余波与八类终局 urgent 世界回响
- `src/data/dialoguePortraits.ts` — 对白头像 URL、角色名与称呼别名纯数据
- `src/data/story/stageAssets.ts` — 剧情舞台背景与动态道具资源纯数据
- `src/data/story/areaMaps.ts` — 地点内部地图、独立空间、驻场人物、本地动作与剧情续接目标纯数据
- `src/data/story/worldEvents.ts` — 世界回响 / 江湖消息数据
- `src/data/events.ts` — 通用奇遇事件
- `src/data/story/schema.ts` — Consequence/Condition/Transition/StoryNode/WorldState 等类型定义
- `src/data/story/progress.ts` — 剧情卷幕级进度、界面引导与旧 beat 映射元数据
- `src/data/story/debugPresets.ts` — Debug 八幕入口、铁枪庙 / 第七幕终局 / 第八幕终局路线夹具与六七幕可编辑 variant 纯数据
- `src/data/story/index.ts` — 剧情卷聚合（加新作品改这里）
- `src/data/map.ts` — 地点定义 + 事件绑定（events 数组）
- `src/game/story/consequences.ts` — 后果解释器（加新 Consequence 种类改这里）
- `src/game/story/conditions.ts` — 条件解释器（加新 Condition 种类改这里）
- `src/game/story/engine.ts` — 节点流转 / 选项结算 / battle outcome 解释
- `src/game/story/query.ts` — 地点事件查询（地点优先 + 通用事件兜底）
- `src/game/story/worldScheduler.ts` — 世界回响调度器
- `src/game/story/endingRecord.ts` — 从既有世界状态派生五段卷末纪事
- `src/game/story/state.ts` — WorldState 初始化 / 迁移 / 默认值
- `src/game/appFlow.ts` — 剧情 / 战斗 / 主界面回流编排
- `src/game/debug.ts` — 通用调试预设应用与单项 variant 更新
- `src/screens/EventScreen.tsx` — 事件界面（多角色舞台、RPG 头像对白框、人物入场、travel、无文字角标、choosing/autoNext/result 三阶段 + 书信展示）
- `src/screens/StoryStage.tsx` — 场景背景、常驻人物头像框、焦点、动作与动态道具
- `src/screens/AreaScreen.tsx` — 地点局部地图、独立空间、驻场人物、本地动作与剧情续接
- `src/screens/SceneTransition.tsx` — 地点 / 时段 / 剧情场景的全屏转场题签
- `src/screens/imagePreloader.ts` — 场景 / 地图 / 头像共享预载队列与已加载缓存
- `src/screens/ItemArtwork.tsx` — 物品生成图加载、服务占位识别与图标底板降级
- `src/screens/dialoguePortrait.ts` — 说话人别名、头像与未知角色降级解析
- `src/screens/EndingRecordScreen.tsx` — 八幕完成后的只读卷末纪事页面
- `src/App.tsx` — 根路由编排；维护 `areaPlaceId / areaUtilityReturn / battleReturnAreaId` 等非持久化界面回流状态
- `tests/story-routes.test.ts` — 全剧情可达性、第六幕入口 / 并轨、32 / 64 证物组合与旧事件隔离
- `tests/story-engine-defects.test.ts` — 剧情引擎状态同步回归
- `tests/story-debug.test.ts` — 八幕跳转、铁枪庙 / 第七幕 / 第八幕终局夹具、推荐来源与状态编辑回归
- `tests/battle-objectives.test.ts` — 多敌方、多人保护、最低幸存人数、`partial` 结算与刷新恢复回归
- `tests/act7-foundation.test.ts` — 第七幕地点、人物、敌军、动态路引与 Debug 入口回归
- `tests/act7-routes.test.ts` — 第七幕职责、军帐内斗、俘虏、侦察方法、军情强度与阶段收束回归
- `tests/act7-war.test.ts` — 第七幕攻城方案、情报编组、军纪、撤离、屠城军令与阶段收束回归
- `tests/act7-ending.test.ts` — 第七幕华筝四态、李萍三态、存活门槛、五种 departure 与幕级完成回归
- `tests/act7-audit.test.ts` — 第七幕 16 组前情、全部剧情战出口、多人保护伤亡组合与旧华山隔离审计
- `tests/act8-foundation.test.ts` — 第八幕五事件 id、华山优先级、动态路引、Debug 入口与 legacy 隔离回归
- `tests/act8-council.test.ts` — 第八幕五种入山、见证席、两组记录、四态公议矩阵与阶段边界回归
- `tests/act8-value.test.ts` — 第八幕最后军报、价值行动、六套战斗编组、24 个出口与必付代价回归
- `tests/act8-martial-ending.test.ts` — 第八幕五种武学路径、称号门槛、八类结局、优先级与最终 beat 回归
- `tests/act8-ending-audit.test.ts` — 第八幕 4 × 4 × 5 共 80 组合结局确定性、称号 / karma 不变性与状态同步审计
- `tests/act8-ending-record.test.ts` — 八类终局回响、urgent 入队、五段卷末纪事与第六幕余波回归
- `tests/full-story-journey.test.ts` — 29 个现代主线事件从第一幕到 8/8 终局的完整引擎旅程
- `tests/dialogue-presentation.test.ts` — 说话人拆解、头像别名、未知角色降级与生成资源约束
- `tests/act1-polish.test.ts` — 第一幕人物辨识、说书节拍、场景舞台、空间对话 / 显隐、转场、暂停续接与教学战

### 改战斗
- `src/game/battle/index.ts` — battle 模块公共入口（外部优先从这里 import）
- `src/game/battle/types.ts` — Combatant/ActionResult/Team 等战斗类型
- `src/game/battle/engine.ts` — 战斗核心逻辑（纯函数）
- `src/game/battle/adapter.ts` — Player↔Combatant 适配层
- `src/game/battle/flow.ts` — battle 应用层编排（ATB 推进 / 支援落地 / 战后收尾 helper）
- `src/screens/BattleScreen.tsx` — 战斗界面 + 动画
- `src/data/enemies.ts` — 敌人数据 + 随机遇敌逻辑
- `src/data/skills.ts` — 武功数据（16+门）

### 改角色 / 数值
- `src/types/index.ts` — Player/Enemy/Skill/RootAttributes 等核心类型
- `src/game/attributes.ts` — 根基→战斗属性推导公式
- `src/game/progression.ts` — 统一经验升级、武功熟练度增长与战斗修正
- `src/game/player.ts` — 角色创建 + 存档 + 旧档迁移
- `src/data/npcs.ts` — NPC 数据 + npcToEnemy 转换
- `src/data/items.ts` — 道具定义 + apply 效果
- `tests/progression.test.ts` — 剧情 / 战斗统一升级、熟练度增长上限与适配层修正回归

### 改界面
- `src/screens/` — 所有界面组件（Title/Main/Battle/Event/Map/Sect/Shop/Character/Npc/Debug）
- `src/App.tsx` — 根组件 + 屏幕路由
- `src/App.css` — 全局样式 + 动画

### 设计文档（非代码，只读参考）
- `待做事项.md` — 当前 canonical backlog；继续开发前先看这里确认优先级与已完成项
- `内容编写 checklist.md` — 剧情 / world event / 书信演出 / 结构字段使用的轻量自检清单
- `世界观设定.md` — 叙事定位、角色使用方式、写作约定
- `战斗系统手册.md` — 根基体系、多对多设计
- `剧情系统设计手册.md` — 因果网络、WorldState、迁移路线
- `项目进展.md` — 各阶段里程碑记录
- `学习笔记.md` — 技术概念笔记

### 项目内共享 Skill
- `.claude/skills/jinyong-story-writer.md` — 金庸 RPG 剧情写作 Skill；用于生成/改写地点支线、主线节点、world events，强调游戏感、人物气质、非剧透、禁止替玩家写内心；文件内已附调用模板，可直接复用

## 文档使用口径（简版）

- 改**长期结构方向 / 多入口设计 / 远期版本体系**：先看并先改《射雕英雄传二创游戏设定.md》
- 改**当前已实现主线样板 / 现阶段事件文本 / 当前 arcBeat 串联**：同步改《射雕主线脚本.md》与 `src/data/story/shendiao.ts`
- 改**字段设计 / 条件后果能力 / 迁移与引擎约束**：看《剧情系统设计手册.md》与对应代码
- 改**具体事件写法 / letter / node id / flag 使用习惯**：看《内容编写 checklist.md》
- 不要把“长期蓝图”直接当成“当前代码已实现内容”来描述，也不要让“当前实现样板线”反过来限制长期结构设计
