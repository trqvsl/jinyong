// ============================================================
// 剧情系统数据模型（纯类型，自包含）
// 设计见《剧情系统设计手册.md》。data/story 下只描述"发生了什么"，不含任何逻辑。
// 引擎（game/story）只认这里的类型，不认识任何具体剧情/NPC id。
// ============================================================
import type { Alignment } from "../../types"

// 主线/事件链节点的完成结果
export type BeatResult = "won" | "lost" | "skipped" | "done"

// ============================================================
// 世界状态 WorldState（挂在 player.world，随存档持久化）
// ============================================================

// NPC 关系类型：语义化关系性质（与好感值 player.relations 正交）
export type NpcRelationType =
  | "初识"    // 刚认识，无特殊羁绊
  | "朋友"    // 友人
  | "知己"    // 深交知己
  | "挚友"    // 生死之交
  | "师徒"    // 师父与弟子（方向由上下文决定）
  | "同门"    // 同门师兄弟
  | "恋人"    // 情侣
  | "仇敌"    // 宿敌
  | "主从"    // 主仆/上下级

// NPC 命运：好感之外的"关系状态"（好感值仍用 player.relations，不重复存）
export interface WorldNpcState {
  alive: boolean                 // 生死（守门：已死 NPC 不再出现）
  recruited: boolean             // 是否已加入主角队伍
  faction: string                // 当前所属阵营（可随剧情转变）
  fateTags: string[]             // 命运标记（如 "杨康已黑化"）
  relationType?: NpcRelationType // 语义关系类型，undefined = 初识
}

// 阵营/门派：对玩家的态度 + 势力消长
export interface WorldFactionState {
  attitude: number               // 对玩家的态度 -100~100
  power: number                  // 势力强弱
}

export interface WorldArcState {
  beats: Record<string, BeatResult>
}

export interface WorldState {
  version: number
  npcs: Record<string, WorldNpcState>
  factions: Record<string, WorldFactionState>
  arcs: Record<string, WorldArcState>
  flags: Record<string, boolean | number | string>
  triggeredEvents: string[]        // 已触发过的涌现事件 id（防重复）
  seenNodes: string[]              // 已结算过 onEnter 的节点 id（防重复结算）
  completedEvents: string[]        // 已完成的 once 事件 id（一次性剧情节点防重复触发）
}

// ============================================================
// 声明式后果 Consequence：一次选择/战斗结局对世界的影响
// 数值类：{ delta } 增减 或 { set } 设绝对值，二选一。
// ============================================================
export type Consequence =
  // ① 自身收益/属性
  | { kind: "reputation"; delta?: number; set?: number }
  | { kind: "karma"; delta?: number; set?: number }
  | { kind: "gold"; delta?: number; set?: number }
  | { kind: "exp"; delta?: number }
  | { kind: "hp"; delta?: number }
  | { kind: "mp"; delta?: number }
  | { kind: "aptitude"; delta?: number }
  | { kind: "attack"; delta?: number }
  | { kind: "speed"; delta?: number }
  | { kind: "item"; id: string; count?: number }    // 默认 1，负数=扣除
  | { kind: "skill"; id: string }                   // 习得武功（去重）
  // ② NPC 好感（写入 player.relations）
  | { kind: "relation"; npcId: string; delta: number }
  // ③ NPC 命运/阵营
  | { kind: "npcAlive"; npcId: string; alive: boolean }
  | { kind: "npcRecruit"; npcId: string; recruited: boolean }
  | { kind: "npcFaction"; npcId: string; faction: string }
  | { kind: "npcRelationType"; npcId: string; relationType: NpcRelationType }
  | { kind: "npcTag"; npcId: string; tag: string; add?: boolean }   // 默认 add=true，false=移除
  | { kind: "factionAttitude"; factionId: string; delta?: number; set?: number }
  | { kind: "factionPower"; factionId: string; delta?: number; set?: number }
  // ④ 主线进度 + 标记
  | { kind: "arcBeat"; arcId: string; beat: string; result: BeatResult }
  | { kind: "flag"; name: string; value: boolean | number | string }

// ============================================================
// 查询条件 Condition：控制节点/选项/事件/涌现的可见与分支
// ============================================================
export type Condition =
  | { kind: "reputation"; gte?: number; lte?: number }
  | { kind: "karma"; gte?: number; lte?: number }
  | { kind: "relation"; npcId: string; gte?: number; lte?: number }
  | { kind: "npcAlive"; npcId: string; alive?: boolean }
  | { kind: "npcRecruited"; npcId: string }
  | { kind: "npcHasTag"; npcId: string; tag: string }
  | { kind: "npcRelationType"; npcId: string; eq: NpcRelationType }
  | { kind: "factionAttitude"; factionId: string; gte?: number; lte?: number }
  | { kind: "arcBeat"; arcId: string; beat: string; result?: BeatResult }  // result 缺省=已完成不论结果
  | { kind: "flag"; name: string; eq?: boolean | number | string }
  | { kind: "hasItem"; id: string }
  | { kind: "hasSkill"; id: string }
  | { kind: "and"; items: Condition[] }
  | { kind: "or"; items: Condition[] }
  | { kind: "not"; item: Condition }

// ============================================================
// 流转 Transition + 战斗结局 Outcome
// ============================================================
export type Transition =
  | { type: "end" }                                                // 回主菜单
  | { type: "goto"; nodeId: string }                               // 同事件下一节点
  | { type: "branch"; cases: { when: Condition; then: Transition }[]; else?: Transition }  // 条件分叉
  | { type: "random"; cases: { weight: number; then: Transition }[] }                       // 加权随机分流（如赌博）
  | { type: "battle"; enemyId?: string; useLocationPool?: boolean; lethal?: boolean;
      onWin?: Outcome; onLose?: Outcome; onFlee?: Outcome }
  | { type: "gotoEvent"; eventId: string }                         // 跨事件串联
  | { type: "gameOver"; endingId?: string }                        // 死亡/结局

export interface Outcome {
  text: string
  consequences?: Consequence[]
  then?: Transition                // 战后继续流转，缺省 end
}

// ============================================================
// 选项 / 节点 / 事件
// ============================================================
export interface Choice {
  id: string
  text: string
  description?: string
  condition?: Condition            // 不满足则隐藏
  consequences?: Consequence[]     // 选了立即结算
  consumeDay?: boolean             // 选了是否消耗 1 天
  transition: Transition
  resultText?: string
}

export interface StoryNode {
  id: string
  title?: string
  text: string
  speaker?: string
  onEnter?: Consequence[]          // 进入节点时结算（幂等，由 seenNodes 守护）
  choices?: Choice[]               // 有 = 选择节点
  autoNext?: Transition            // 无 choice 时展示后自动流转（可用 branch 条件分流）
  // 约定：choices 与 autoNext 至少有其一；都无 = 终点节点（等价 end）
}

export interface StoryEvent {
  id: string
  entryNode: string
  nodes: Record<string, StoryNode>
  locationId?: string
  weight?: number
  condition?: Condition
  once?: boolean                   // 一次性剧情节点：完成后记入 completedEvents，不再触发
}

// ============================================================
// 涌现事件：世界状态满足条件时自动触发
// ============================================================
export interface WorldEvent {
  id: string
  trigger: Condition
  once: boolean
  event: StoryEvent
}

// 对齐用：派生函数虽在 state.ts 实现，但阈值常量集中于此
export const ALIGNMENT_THRESHOLDS = { positive: 30, negative: -30 }
export type { Alignment }
