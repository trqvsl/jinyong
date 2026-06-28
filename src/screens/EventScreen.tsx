import { useMemo, useState } from "react"
import type { Player } from "../types"
import type { StoryEvent, EventChoiceResult } from "../data/events"

interface Props {
  player: Player
  event: StoryEvent
  onResolve: (result: EventChoiceResult) => void
}

export function EventScreen({ player, event, onResolve }: Props) {
  const [result, setResult] = useState<EventChoiceResult | null>(null)
  const [chosenId, setChosenId] = useState<string | null>(null)

  const titleTag = useMemo(() => {
    if (event.id.includes("manual")) return "奇遇"
    if (event.id.includes("trouble")) return "江湖"
    return "见闻"
  }, [event.id])

  function handleChoose(choiceId: string) {
    const choice = event.choices.find((entry) => entry.id === choiceId)
    if (!choice) return
    const resolved = choice.resolve(player)
    setChosenId(choiceId)
    setResult(resolved)
  }

  return (
    <div className="event-screen">
      <header className="top-bar">
        <span className="player-name">江湖奇遇</span>
        <span className="day-info">第 {player.day} 日</span>
      </header>

      <section className="event-hero stat-panel">
        <div className="event-tag">{titleTag}</div>
        <h1 className="event-title">{event.title}</h1>
        <p className="event-summary">{event.summary}</p>
        <div className="event-intro">{event.intro}</div>
      </section>

      {!result && (
        <section className="stat-panel">
          <h2>你的选择</h2>
          <div className="event-choice-list">
            {event.choices.map((choice) => (
              <button key={choice.id} className="event-choice-card" onClick={() => handleChoose(choice.id)}>
                <span className="event-choice-title">{choice.text}</span>
                <span className="event-choice-desc">{choice.description}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {result && (
        <section className="stat-panel">
          <h2>结果</h2>
          <div className="event-result-text">{result.text}</div>
          <div className="event-result-meta">
            <span>已选择：{event.choices.find((choice) => choice.id === chosenId)?.text}</span>
            <span>{result.startBattle ? "后续将进入战斗" : "本次事件直接结算"}</span>
          </div>
          <button className="menu-btn primary" onClick={() => onResolve(result)}>继续</button>
        </section>
      )}
    </div>
  )
}
