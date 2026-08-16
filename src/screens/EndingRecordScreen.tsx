import {
  ArrowLeft,
  BookOpenCheck,
  CheckCircle2,
  ScrollText,
} from "lucide-react"
import type { Player } from "../types"
import { getShendiaoEndingRecord } from "../game/story/endingRecord"

interface Props {
  player: Player
  onBack: () => void
}

export function EndingRecordScreen({ player, onBack }: Props) {
  const record = getShendiaoEndingRecord(player)

  if (!record) {
    return (
      <div className="ending-record-screen">
        <header className="ending-record-topbar">
          <button className="back-btn" onClick={onBack}>
            <ArrowLeft size={18} />
            返回
          </button>
          <span>卷末纪事</span>
        </header>
        <main className="ending-record-empty">
          <ScrollText size={28} aria-hidden="true" />
          <h1>卷末尚未落笔</h1>
          <p>完成现代八幕终局后，离营、公议、军报与论剑记录会在此归档。</p>
        </main>
      </div>
    )
  }

  return (
    <div className="ending-record-screen">
      <header className="ending-record-topbar">
        <button className="back-btn" onClick={onBack}>
          <ArrowLeft size={18} />
          返回据点
        </button>
        <span>{record.volumeName} · 8/8</span>
      </header>

      <main className="ending-record-main">
        <section className="ending-record-hero">
          <div className="ending-record-kicker">
            <BookOpenCheck size={16} aria-hidden="true" />
            射雕卷 · 卷末纪事
          </div>
          <div className="ending-record-hero-grid">
            <div>
              <p className="ending-record-overline">江湖定席</p>
              <h1>{record.endingTitle}</h1>
              <p className="ending-record-summary">{record.endingSummary}</p>
            </div>
            <div className="ending-record-seal" aria-label={`卷末印记 ${record.seal}`}>
              <span>{record.seal}</span>
              <small>{record.endingShortTitle}</small>
            </div>
          </div>
        </section>

        <section className="ending-record-ledger" aria-label="卷末五份记录">
          {record.sections.map((section) => (
            <article className="ending-record-entry" key={section.id}>
              <div className="ending-record-entry-index">
                {String(section.order).padStart(2, "0")}
              </div>
              <div className="ending-record-entry-body">
                <p className="ending-record-entry-kicker">{section.kicker}</p>
                <h2>{section.title}</h2>
                <p className="ending-record-entry-summary">{section.summary}</p>
                <dl className="ending-record-facts">
                  {section.facts.map((fact) => (
                    <div key={fact.label}>
                      <dt>{fact.label}</dt>
                      <dd>{fact.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </article>
          ))}
        </section>

        <footer className="ending-record-footer">
          <CheckCircle2 size={18} aria-hidden="true" />
          <span>五份记录均从当前存档派生，回看不会改写既有结局。</span>
        </footer>
      </main>
    </div>
  )
}
