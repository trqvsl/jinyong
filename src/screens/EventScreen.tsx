import { useState } from "react"
import type { Player } from "../types"
import type { StoryEvent, Transition } from "../data/events"
import { enterNode, visibleChoices, resolveChoice } from "../game/story/engine"

// ============================================================
// 剧情事件界面：纯展示，所有结算/流转交给引擎 + App 路由
// - choosing：显示当前节点正文 + 可见选项（condition 过滤）
// - result：显示选项/战后结果文字，点"继续"把 transition 交回 App
// - initialResult：进入时直接显示结果（用于战后衔接），跳过节点选项
// ============================================================

interface Props {
  player: Player
  event: StoryEvent
  nodeId: string
  initialResult?: { text: string; transition: Transition }
  onResolve: (r: { player: Player; transition: Transition; consumedDay: boolean }) => void
}

export function EventScreen({ player, event, nodeId, initialResult, onResolve }: Props) {
  // 进入节点：onEnter 幂等结算。initialResult 模式不进入节点（只显示结果）
  const entered = initialResult ? null : enterNode(player, player.world, event, nodeId)
  const [phase, setPhase] = useState<"choosing" | "result">(initialResult ? "result" : "choosing")
  const [resultText, setResultText] = useState<string>(initialResult?.text ?? "")
  const [pending, setPending] = useState<{ player: Player; transition: Transition; consumedDay: boolean } | null>(
    initialResult ? { player, transition: initialResult.transition, consumedDay: false } : null
  )

  const node = entered?.node
  const choices = entered ? visibleChoices(entered.player, entered.world, entered.node) : []

  function handleChoose(choiceId: string) {
    if (!entered) return
    const choice = choices.find((c) => c.id === choiceId)
    if (!choice) return
    const r = resolveChoice(entered.player, entered.world, event, nodeId, choiceId)
    setResultText(r.resultText ?? "")
    setPending({ player: r.player, transition: r.transition, consumedDay: choice.consumeDay ?? false })
    setPhase("result")
  }

  function handleContinue() {
    if (pending) onResolve({ player: pending.player, transition: pending.transition, consumedDay: pending.consumedDay })
  }

  return (
    <div className="event-screen">
      <header className="top-bar">
        <span className="player-name">江湖奇遇</span>
        <span className="day-info">第 {player.day} 日</span>
      </header>

      <section className="event-hero stat-panel">
        <div className="event-tag">见闻</div>
        <h1 className="event-title">{node?.title ?? "事后"}</h1>
        {phase === "choosing" && node ? <div className="event-intro">{node.text}</div> : null}
      </section>

      {phase === "choosing" && node && (
        <section className="stat-panel">
          <h2>你的选择</h2>
          <div className="event-choice-list">
            {choices.map((c) => (
              <button key={c.id} className="event-choice-card" onClick={() => handleChoose(c.id)}>
                <span className="event-choice-title">{c.text}</span>
                <span className="event-choice-desc">{c.description}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {phase === "result" && (
        <section className="stat-panel">
          <h2>结果</h2>
          <div className="event-result-text">{resultText}</div>
          <button className="menu-btn primary" onClick={handleContinue}>继续</button>
        </section>
      )}
    </div>
  )
}
