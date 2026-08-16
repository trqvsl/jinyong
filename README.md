# 金庸群侠传 · 单机网页武侠 RPG

致敬《金庸群侠传 2/3》的纯前端单机武侠 RPG 原型。

当前项目已经不是 Vite 模板 demo，而是一个具备完整主循环的可玩雏形：

- 创建角色 / 读取本地存档
- 世界地图、牛家村内部地图与 7 个独立空间
- 地点调查、商店、行囊、NPC 切磋与剧情续接
- 声明式剧情引擎与世界状态
- 多对多战斗引擎
- NPC 互动、队伍、羁绊与战斗支援
- 射雕现代八幕、八类终局回响与卷末纪事

---

## 技术栈

- React 19
- TypeScript 6
- Vite 8
- 纯 CSS
- oxlint

项目是**纯前端单机**：

- 无后端
- 无数据库
- 存档保存在 `localStorage`
- 主要游戏逻辑运行在浏览器端

---

## 项目结构

```text
src/
  data/        纯数据层（剧情 / 地图 / NPC / 敌人 / 技能 / 门派 / 道具）
  game/        纯逻辑层（剧情引擎 / 战斗引擎 / 属性推导 / 存档迁移 / 队伍机制）
  screens/     展示层（各个 Screen 的 UI 与交互）
  App.tsx      全局编排（界面切换、剧情与战斗衔接）
```

核心分层原则：

- `data/` 负责“世界是什么”
- `game/` 负责“系统怎么运行”
- `screens/` 负责“如何展示与交互”
- `App.tsx` 负责全局流程编排，不直接承载具体业务规则

当前有两项待清理的历史例外：

- `data/npcs.ts / data/enemies.ts` 仍保留查询 / 适配 helper
- `App.tsx` 暂时承担地点切磋的战后恢复与原空间回流

---

## 当前核心系统

## 1. 剧情系统

剧情系统已经做成**声明式数据 + 通用引擎**：

- 数据模型定义在 `src/data/story/schema.ts`
- 条件 / 后果 / 节点流转在 `src/game/story/*`
- 地点剧情查询在 `src/game/story/query.ts`
- 世界回响调度在 `src/game/story/worldScheduler.ts`
- 事件展示在 `src/screens/EventScreen.tsx`

当前支持：

- `Condition / Consequence / Transition`
- 节点式剧情（`goto / branch / random / battle / gotoEvent / gameOver`）
- `WorldState` 挂在 `player.world`
- 地点事件优先 + 通用事件兜底
- 世界回响事件（回主界面时入队）
- `letter` 书信展示、对白拆解、分页阅读
- `StoryStage` 多角色舞台与一次性动态道具
- `SceneTransition` 地点 / 时辰题签（纯展示，不推进游戏时间）
- `pause / areaEntry` 驱动的牛家村内部地图与独立空间

地点空间当前只在牛家村启用，并依赖活动剧情 checkpoint；它还不是全局自由探索系统。

## 2. 战斗系统

战斗系统已经拆成独立模块：

- 内部类型：`src/game/battle/types.ts`
- 核心结算：`src/game/battle/engine.ts`
- 适配层：`src/game/battle/adapter.ts`
- UI：`src/screens/BattleScreen.tsx`

当前支持：

- 多对多战斗
- CTB / ATB 式行动值推进
- 单体 / 横扫 / 双击 / 乱打 / 我方全体等目标模式
- 中毒 / 回春 / 护盾 / 眩晕 / 攻防速增益 / 追击势
- 内功催动外功
- 队友 / 羁绊支援效果接入战斗

## 3. 队伍与 NPC 系统

当前已实现：

- NPC 互动与切磋
- 招募 NPC 入队
- `WorldState.party` 存储出战 / 候补编队
- 队友固定加成、触发型支援、羁绊收益
- 主界面 / 角色页 / 战斗页联动展示

---

## 运行命令

这些是 `package.json` 中当前真实存在的命令：

```bash
npm run dev
npm run build
npm run lint
npm test
npm run verify
npm run preview
```

说明：

- `npm run dev`：启动 Vite 开发服务器
- `npm run build`：TypeScript 编译 + Vite 构建
- `npm run lint`：运行 oxlint
- `npm test`：运行 Vitest 回归
- `npm run verify`：聚合剧情、战斗、修复回归与 Vitest
- `npm run preview`：预览构建产物

---

## 当前状态

当前项目处于：

> **射雕八幕因果与终局闭环已完成；当前优先把第一幕做成可复制的高品质 RPG 章节模板。**

当前快照：

- 射雕事件 58 个 / 剧情节点 612 个
- NPC 27 / 敌人 26 / 武功 21 / 专用头像 22
- 牛家村内部地图 1 张 / 独立空间 7 个
- 聚合校验：剧情 3334、战斗 33、修复回归 15、Vitest 384

已明显成型的部分：

- 三层分离架构
- 声明式剧情系统
- 世界状态与存档迁移
- 多对多战斗引擎
- 队友 / 羁绊支援机制
- 射雕现代八幕与 29 事件完整旅程
- 牛家村 7 个独立空间和钱塘说书至村西林的多拍演出

仍在持续扩展的部分：

- 第一幕后半段的地点化与演出丰满度
- 独立空间的条件化驻场人物 / 动作
- 地点专属商店、物品详情与场景内使用
- 数值平衡
- 装备 / 更长期养成
- 更多作品卷

当前体验与验收只面向 **1280 × 800 桌面端**，暂不维护移动端适配。

---

## 参考文档

- `CLAUDE.md`：项目开发约束与文件索引
- `项目架构导览.md`：当前模块边界、主流程与已知架构债
- `待做事项.md`：当前 canonical backlog / 后续迭代统一入口
- `内容编写 checklist.md`：剧情 / world event / 书信演出 / 结构字段使用的轻量自检清单
- `剧情系统设计手册.md`：剧情系统设计与现状说明
- `战斗系统手册.md`：战斗系统设计与代码索引
- `项目进展.md`：当前阶段、已完成内容与后续方向
- `世界观设定.md`：叙事定位与角色使用原则
- `射雕主线脚本.md`：射雕卷自然语言脚本

如果要继续扩剧情或系统，建议先看 `CLAUDE.md`、`待做事项.md`、`内容编写 checklist.md` 与相应手册。
