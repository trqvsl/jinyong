// ============================================================
// 剧情编排引擎：进入节点（onEnter 幂等结算）、结算选项、解析 branch 流转
// 纯函数，不认识任何具体剧情/NPC id。
// ============================================================
import type { Player } from "../../types"
import type { WorldState, StoryEvent, StoryNode, Choice, Transition, Outcome } from "../../data/story/schema"
import { applyConsequences } from "./consequences"
import { checkCondition } from "./conditions"

// 进入节点：结算 onEnter（仅首次，由 seenNodes 守护幂等），返回节点 + 新状态
export function enterNode(
  player: Player, world: WorldState, event: StoryEvent, nodeId: string
): { node: StoryNode; player: Player; world: WorldState } | null {
  const node = event.nodes[nodeId]
  if (!node) return null
  let p = player
  let w = world
  if (!w.seenNodes.includes(nodeId)) {
    if (node.onEnter && node.onEnter.length > 0) {
      const r = applyConsequences(p, w, node.onEnter)
      p = r.player
      w = r.world
    }
    w = { ...w, seenNodes: [...w.seenNodes, nodeId] }
  }
  return { node, player: p, world: w }
}

// 节点的可见选项（过滤掉 condition 不满足的）
export function visibleChoices(player: Player, world: WorldState, node: StoryNode): Choice[] {
  return (node.choices ?? []).filter((c) => checkCondition(player, world, c.condition))
}

// 结算一个选项：应用 consequences，返回新状态 + 该选项的流转
export function resolveChoice(
  player: Player, world: WorldState, event: StoryEvent, nodeId: string, choiceId: string
): { player: Player; world: WorldState; resultText?: string; transition: Transition } | null {
  const node = event.nodes[nodeId]
  if (!node) return null
  const choice = (node.choices ?? []).find((c) => c.id === choiceId)
  if (!choice) return null
  let p = player
  let w = world
  if (choice.consequences && choice.consequences.length > 0) {
    const r = applyConsequences(p, w, choice.consequences)
    p = r.player
    w = r.world
  }
  return { player: p, world: w, resultText: choice.resultText, transition: choice.transition }
}

// 解析 branch 流转：按世界状态递归选出实际应走的 transition（纯路由，无副作用）
export function resolveBranch(player: Player, world: WorldState, t: Transition): Transition {
  if (t.type !== "branch") return t
  for (const c of t.cases) {
    if (checkCondition(player, world, c.when)) return resolveBranch(player, world, c.then)
  }
  return t.else ? resolveBranch(player, world, t.else) : { type: "end" }
}

// 加权随机选一个分支（带随机副作用；branch 是纯路由，random 不是）。
// App 路由时：先用 resolveBranch 解析 branch，若结果仍是 random 再用本函数。
export function pickRandom(cases: { weight: number; then: Transition }[]): Transition {
  const total = cases.reduce((s, c) => s + c.weight, 0)
  let r = Math.random() * total
  for (const c of cases) {
    r -= c.weight
    if (r <= 0) return c.then
  }
  return cases[cases.length - 1].then
}

// 战斗结局结算：按胜负取对应 Outcome，应用其 consequences
export function resolveBattleOutcome(
  player: Player, world: WorldState, transition: Transition, outcome: "won" | "lost" | "fled"
): { player: Player; world: WorldState; text: string; then: Transition } | null {
  if (transition.type !== "battle") return null
  const oc: Outcome | undefined =
    outcome === "won" ? transition.onWin : outcome === "lost" ? transition.onLose : transition.onFlee
  if (!oc) {
    // 该结局缺省：默认文字 + end
    return {
      player, world,
      text: outcome === "won" ? "你取得了胜利。" : outcome === "fled" ? "你脱身而去。" : "你落败了。",
      then: { type: "end" },
    }
  }
  let p = player
  let w = world
  if (oc.consequences && oc.consequences.length > 0) {
    const r = applyConsequences(p, w, oc.consequences)
    p = r.player
    w = r.world
  }
  return { player: p, world: w, text: oc.text, then: oc.then ?? { type: "end" } }
}
