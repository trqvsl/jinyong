import type { Player } from "../types"
import type { StoryEvent } from "../data/events"
import { savePlayer } from "../game/player"
import { recomputePlayerStats } from "../game/attributes"
import { getRelationLevel } from "../game/relations"
import { getActivePartyNpcs, getReservePartyNpcs, getNpcBattleRole, getPartyPower, getPartySupportBonuses, getPartySupportTotals, getPartyBondBonuses, getBattleSupportMechanicRules } from "../game/party"

interface Props {
  player: Player; pendingWorldEvents?: StoryEvent[]; onOpenPendingWorldEvent?: (eventId: string) => void; onUpdate: (player: Player) => void; onAdventure: () => void; onSect: () => void; onCharacter: () => void; onShop: () => void; onNpc?: () => void; onDebug?: () => void
}

function getPendingWorldEventLabel(event?: StoryEvent | null): string {
  if (event?.presentation === "letter") {
    if (event.letterStyle === "secret") return "密帖送达"
    if (event.letterStyle === "note") return "字条送达"
    return "书信送达"
  }
  const title = event?.nodes[event.entryNode]?.title ?? event?.id ?? ""
  if (title.includes("来信") || title.includes("密帖")) return "书信送达"
  if (title.includes("敲窗") || title.includes("寻你")) return "有人来访"
  return "江湖回响"
}

export function MainScreen({ player, pendingWorldEvents = [], onOpenPendingWorldEvent, onUpdate, onAdventure, onSect, onCharacter, onShop, onNpc, onDebug }: Props) {
  const activeParty = getActivePartyNpcs(player)
  const reserveParty = getReservePartyNpcs(player)
  const partyPower = getPartyPower(player)
  const supportBonuses = getPartySupportBonuses(player)
  const bondBonuses = getPartyBondBonuses(player)
  const supportTotals = getPartySupportTotals(player)
  const supportMechanicRules = getBattleSupportMechanicRules(player)
  // onDebug 可选；调试入口，正式游玩可隐藏
  function train() {
    const gain = 1 + Math.floor(player.aptitude / 30)
    const cultivated: Player = {
      ...player,
      day: player.day + 1,
      roots: {
        ...player.roots,
        external: player.roots.external + gain,
        internal: player.roots.internal + 1,
        constitution: player.roots.constitution + Math.max(1, Math.floor(gain / 2)),
      },
    }
    const recomputed = recomputePlayerStats(cultivated)
    const updated: Player = { ...recomputed, hp: recomputed.hpMax, mp: recomputed.mpMax }
    savePlayer(updated); onUpdate(updated)
  }
  const catCounts = player.skills.reduce((acc, s) => { acc[s.category] = (acc[s.category] || 0) + 1; return acc }, {} as Record<string, number>)

  return (
    <div className="main-screen">
      <header className="top-bar"><span className="player-name">{player.name}</span><span className="day-info">第 {player.day} 日</span></header>
      <section className="stat-panel">
        <h2>江湖名号</h2>
        <div className="stat-grid">
          <div>等级 <b>{player.level}</b></div><div>资质 <b>{player.aptitude}</b></div>
          <div>立场 <b>{player.alignment}</b></div><div>名声 <b>{player.reputation}</b></div>
          <div>银两 <b>{player.gold}</b></div>
        </div>
        <div className="stat-bars">
          <Bar label="气血" value={player.hp} max={player.hpMax} color="#c0392b" />
          <Bar label="内力" value={player.mp} max={player.mpMax} color="#2980b9" />
          <Bar label="经验" value={player.exp} max={player.expMax} color="#27ae60" />
        </div>
      </section>
      <section className="stat-panel party-summary-panel">
        <div className="party-summary-head">
          <h2>随行队伍 <span className="panel-count">出战 {activeParty.length} · 候补 {reserveParty.length}</span></h2>
          <button className="menu-btn party-summary-manage-btn" onClick={onCharacter}>整队</button>
        </div>
        <p className="hint">当前战斗只会带上出战位中的队友。候补不会自动参战。</p>
        {activeParty.length === 0 ? (
          <p className="hint">你现在仍是独行江湖。去“江湖人物”中邀约可同行的角色吧。</p>
        ) : (
          <>
            <div className="party-summary-meta">
              <span className="char-tag">队伍战力 {partyPower}</span>
              <span className="char-tag">当前阵容 {activeParty.map((npc) => npc.name).join(" / ")}</span>
              <span className="char-tag">随行加成 攻+{supportTotals.attack} / 防+{supportTotals.defense} / 速+{supportTotals.speed}</span>
            </div>
            <div className="party-support-list">
              {supportBonuses.map((bonus) => (
                <div key={bonus.npcId} className="party-support-item">
                  <div className="party-support-name">{bonus.npcName} · {bonus.role}</div>
                  <div className="party-support-value">攻+{bonus.attack} 防+{bonus.defense} 速+{bonus.speed}</div>
                </div>
              ))}
            </div>
            {bondBonuses.length > 0 && (
              <div className="party-bond-list">
                {bondBonuses.map((bond) => (
                  <div key={bond.id} className="party-bond-item">
                    <div className="party-bond-name">{bond.name}</div>
                    <div className="party-bond-value">攻+{bond.attack} 防+{bond.defense} 速+{bond.speed}</div>
                    <div className="party-bond-desc">{bond.description}</div>
                  </div>
                ))}
              </div>
            )}
            {supportMechanicRules.length > 0 && (
              <div className="party-trigger-rule-list">
                {supportMechanicRules.map((rule) => (
                  <div key={rule.trigger} className="party-trigger-rule-item">
                    <div className="party-trigger-rule-head">
                      <span className="party-trigger-rule-name">{rule.title}</span>
                      <span className="party-trigger-rule-trigger">{rule.triggerLabel}</span>
                    </div>
                    <div className="party-trigger-rule-desc">{rule.summary}</div>
                    <div className="party-trigger-rule-tags">
                      {rule.focusTags.map((tag) => <span key={tag} className="party-trigger-rule-tag">{tag}</span>)}
                    </div>
                    <div className="party-trigger-rule-source-list compact">
                      {rule.sourceEntries.map((entry) => (
                        <div key={entry.key} className={`party-trigger-rule-source-item ${entry.type}`}>
                          <span className="party-trigger-rule-source-name">{entry.label}</span>
                          <span className="party-trigger-rule-effects">{entry.details.join(" · ")}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="party-summary-list">
              {activeParty.map((npc, index) => {
                const relation = getRelationLevel(player, npc.id, player.world)
                return (
                  <div key={npc.id} className="party-summary-card">
                    <div className="party-summary-card-head">
                      <span className="party-summary-order">位次 {index + 1}</span>
                      <span className={`relation-badge rel-${relation.tone}`}>{relation.label}</span>
                    </div>
                    <div className="party-summary-name">{npc.title}·{npc.name}</div>
                    <div className="party-summary-role">{getNpcBattleRole(npc)}</div>
                    <div className="party-summary-stats">攻 {npc.combat.attack} · 防 {npc.combat.defense} · 速 {npc.combat.speed}</div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </section>
      {pendingWorldEvents.length > 0 && onOpenPendingWorldEvent && (
        <section className="stat-panel pending-world-event-panel">
          <div className="pending-world-event-head">
            <span className="pending-world-event-tag">江湖消息 {pendingWorldEvents.length}</span>
          </div>
          <div className="pending-world-event-title">大本营里收到了新的动静</div>
          <p className="pending-world-event-desc">回到落脚处后收到的来信、来访和江湖回响都会先留在这里，不再直接打断流程。</p>
          <div className="pending-world-event-list">
            {pendingWorldEvents.map((event) => (
              <button key={event.id} className="pending-world-event-item" onClick={() => onOpenPendingWorldEvent(event.id)}>
                <span className="pending-world-event-item-tag">{getPendingWorldEventLabel(event)}</span>
                <span className="pending-world-event-item-title">{event.nodes[event.entryNode]?.title ?? event.id}</span>
              </button>
            ))}
          </div>
        </section>
      )}
      <section className="stat-panel">
        <h2>武功绝学 <span className="panel-count">{player.skills.length}</span></h2>
        {player.skills.length === 0 ? <p className="hint">尚未习得任何武功。</p> : (
          <>
            <div className="cat-summary">
              {(["外功","内功","轻功","奇门"] as const).map(c => (
                <span key={c} className={`cat-chip cat-${c}`}>{c} {catCounts[c]||0}</span>
              ))}
            </div>
            <ul className="skill-list">{player.skills.map(s => (
              <li key={s.id}><span className={`skill-cat-tag cat-${s.category}`}>{s.category}</span><span className="skill-name">{s.name}</span>{s.power>0 && <span className="skill-power">威力 {s.power}</span>}</li>
            ))}</ul>
          </>
        )}
      </section>
      <section className="stat-panel">
        <h2>行动</h2>
        <div className="action-buttons">
          <button className="menu-btn" onClick={train}>闭关修炼</button>
          <button className="menu-btn primary" onClick={onAdventure}>江湖游历</button>
          <button className="menu-btn" onClick={onShop}>江湖商铺</button>
          <button className="menu-btn" onClick={onSect}>游历门派</button>
          {onNpc && <button className="menu-btn" onClick={onNpc}>江湖人物</button>}
          <button className="menu-btn" onClick={onCharacter}>个人属性</button>
          {onDebug && <button className="menu-btn" onClick={onDebug}>调试炼丹房</button>}
        </div>
      </section>
    </div>
  )
}
function Bar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100))
  return (<div className="bar-row"><span className="bar-label">{label}</span><div className="bar-track"><div className="bar-fill" style={{ width: pct + "%", background: color }} /></div><span className="bar-value">{value}/{max}</span></div>)
}
