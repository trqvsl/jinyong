# 战斗模块（`src/game/battle/`）

一个**自包含、可独立迭代**的回合制战斗引擎。与游戏其他系统（存档、根基属性、React 界面）解耦。

## 设计目标
- **纯函数引擎**：核心逻辑是 `输入状态 → 输出新状态`，无副作用，易测试、易推理。
- **零外部耦合**：引擎只认识 `Combatant`/`BattleSkill`，不认识 `Player`/存档/根基属性。
- **可复用**：这套引擎能独立用到别的回合制项目，只需写对应的适配层。

## 文件结构

```
battle/
├── types.ts      引擎内部类型（Combatant/BattleSkill/状态/结果）——自包含，不 import 全局 types
├── engine.ts     纯函数核心（伤害公式/状态结算/出招分流/AI/胜负判定）——无任何外部依赖
├── adapter.ts    适配层：Player↔Combatant 转换（含根基属性推导：暴击/闪避/内功催动）、建场、成长结算
└── index.ts      门面：对外统一入口，外部只从这里 import
```

## 依赖方向（单向，不可逆转）

```
引擎(engine) ← 适配层(adapter) ← 门面(index) ← 外部(BattleScreen 等)
    ↑                ↑
    └─ 只依赖 types  └─ 依赖 engine + 全局 types + attributes（根基推导）
```

**铁律**：`engine.ts` 永远不 import `../types`、`../attributes`、`../player`。一旦引擎直接依赖游戏世界类型，解耦就破了。

## 怎么用

### 界面层（推荐，多对多流程）
界面层（如 `BattleScreen`）走多对多流程：用 adapter 建场/同步/结算成长，再用 engine 纯函数推进战斗。
```ts
import { createBattleState, syncPlayersFromState, applyVictoryGrowth } from "../game/battle/adapter"
import {
  performAction, advanceAtb, nextActor, checkBattleEndBySide,
  tickUnitStatuses, enemyDecideAction, isStunned,
} from "../game/battle/engine"
// createBattleState(players, enemies) 建场（Player↔Combatant 自动转换，根基属性一并推导）；
// performAction(state, command) 结算一次行动；advanceAtb/nextActor 驱动 CTB 行动轴；
// checkBattleEndBySide 判胜负；isStunned 判断是否被点穴而跳过。
```

### 纯引擎（高级，如复用到别的项目）
```ts
import { performAction, tickStatuses } from "../game/battle/engine"
import type { Combatant, BattleSkill, BattleState } from "../game/battle/types"
// 直接用 Combatant 调用，自己管状态。
```

## 扩展战斗机制时改哪里

| 想加的机制 | 改哪个文件 |
---|---|
| 新武功分类的结算 | `engine.ts` 的 `performSkill` 分流 |
| 新状态种类 | `types.ts` 的 `StatusKind` + `engine.ts` 的 `tickStatuses`/`applyStatus` |
| 伤害公式调整 | `engine.ts` 的 `resolveExternalAttack` |
| 属性克制 | `engine.ts` 的 `resolveExternalAttack`（查克制表） |
| 敌人 AI 策略 | `engine.ts` 的 `enemyChooseSkill` |
| 新的"单位来源"（队友/召唤物） | `adapter.ts` 加 `xxxToCombatant` |
| 成长/升级规则变化 | `adapter.ts` 的 `applyVictoryGrowth` |
| 行动顺序轴 CTB | `engine.ts` 新增排程逻辑（较大改动，见《战斗系统手册》第四节②） |

## 测试（建议未来补）
引擎是纯函数，非常适合单测：给定 Combatant A/B 和 skill，断言伤害范围、状态变化。
可用 Vitest 给 `engine.ts` 写测试，不依赖任何 React/存档环境。
