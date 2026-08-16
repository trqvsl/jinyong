import type { Player } from "../types"
import type { StoryEvent } from "../data/events"
import {
  BookOpenCheck,
  Compass,
  FlaskConical,
  Landmark,
  Mail,
  MapPinned,
  ScrollText,
  ShoppingBag,
  Swords,
  UserRound,
  UsersRound,
} from "lucide-react"
import {
  getStoryEventById,
  getStoryProgress,
  type StoryProgressView,
} from "../game/story/query"
import {
  getActivePartyNpcs,
  getPartyPower,
} from "../game/party"

interface Props {
  player: Player; pendingWorldEvents?: StoryEvent[]; onOpenPendingWorldEvent?: (eventId: string) => void; onAdventure: () => void; onSect: () => void; onCharacter: () => void; onShop: () => void; onNpc?: () => void; onDebug?: () => void; onEndingRecord?: () => void
}

function getHubMoodText(progress: StoryProgressView, pendingWorldEvents: StoryEvent[]): string {
  if (pendingWorldEvents.length > 0) {
    return "灯影摇晃，信匣里压着新近送来的来信与江湖风声。"
  }
  return progress.hubMood
}

function summarizePendingWorldEvent(pendingWorldEvents: StoryEvent[]) {
  const firstEvent = pendingWorldEvents[0]
  if (!firstEvent) {
    return {
      badge: "暂无新信",
      title: "江湖暂时平静",
      summary: "今晚未见新信与江湖回响，可先继续主线或稍作整备。",
      buttonLabel: "暂无来信",
    }
  }

  const entryNode = firstEvent.nodes[firstEvent.entryNode]
  const cleanedTitle = (entryNode?.title ?? firstEvent.id).replace(/^江湖回响·/, "")
  const category = firstEvent.presentation === "letter" ? "书信待阅" : "江湖回响"
  const rawSummary = (entryNode?.letterIntro?.trim() || entryNode?.text || "有新的消息送到客舍。").replace(/\s+/g, " ")
  const summary = rawSummary.length > 36 ? `${rawSummary.slice(0, 36)}…` : rawSummary

  return {
    badge: `${category} · 待看 ${pendingWorldEvents.length}`,
    title: cleanedTitle,
    summary,
    buttonLabel: `查看${cleanedTitle}`,
  }
}

function getSystemPriorityBadges(progress: StoryProgressView, pendingWorldEvents: StoryEvent[]) {
  if (pendingWorldEvents.length > 0) {
    return {
      ...progress.priorities,
      adventure: "次选",
      letters: "优先",
    }
  }
  return progress.priorities
}

export function MainScreen({ player, pendingWorldEvents = [], onOpenPendingWorldEvent, onAdventure, onSect, onCharacter, onShop, onNpc, onDebug, onEndingRecord }: Props) {
  const activeParty = getActivePartyNpcs(player)
  const partyPower = getPartyPower(player)
  const storyProgress = getStoryProgress(player)
  const pausedCheckpoint = player.world.currentStory?.paused
    ? player.world.currentStory
    : null
  const pausedEvent = pausedCheckpoint
    ? getStoryEventById(pausedCheckpoint.eventId)
    : undefined
  const pausedNodeTitle = pausedCheckpoint
    ? pausedEvent?.nodes[pausedCheckpoint.nodeId]?.title
    : undefined
  const primaryAction = pausedNodeTitle
    ? `继续 · ${pausedNodeTitle}`
    : storyProgress.primaryAction
  const primaryGuidance = pausedNodeTitle
    ? "这段江湖事尚未结束。风雪稍歇，未完的线索仍留在原处。"
    : storyProgress.guidance
  const hubMoodText = getHubMoodText(storyProgress, pendingWorldEvents)
  const pendingWorldEventSummary = summarizePendingWorldEvent(pendingWorldEvents)
  const systemPriorityBadges = getSystemPriorityBadges(storyProgress, pendingWorldEvents)
  const firstPendingEvent = pendingWorldEvents[0]
  const progressPercent = `${Math.max(4, (storyProgress.completed / storyProgress.total) * 100)}%`
  return (
    <div className="main-screen main-hub-shell">
      <header className="top-bar main-hub-topbar compact">
        <div className="main-hub-topbar-block">
          <span className="main-hub-brand">金庸群侠传</span>
          <span className="main-hub-topbar-sub">{player.name} · 第 {player.day} 日</span>
        </div>
        <div className="main-hub-topbar-stats compact">
          <span className="char-tag">Lv.{player.level}</span>
          <span className="char-tag">银两 {player.gold}</span>
          <span className="char-tag">名声 {player.reputation}</span>
        </div>
      </header>

      <section className="main-hub-hero">
        <div className="main-hub-hero-backdrop" aria-hidden="true" />
        <div className="main-hub-hero-main">
          <div className="main-hub-scene-tag"><Compass size={14} /> 江湖据点</div>
          <h1 className="main-hub-scene-title">{storyProgress.hubName}</h1>
          <p className="main-hub-scene-copy">{hubMoodText}</p>
          <div className="main-hub-quest-kicker">射雕卷 · {storyProgress.act.title}</div>
          <div className="main-hub-quest-progress" aria-label={`射雕卷进度 ${storyProgress.completed}/${storyProgress.total}`}>
            <span style={{ width: progressPercent }} />
          </div>
          <h2 className="main-hub-quest-title">{primaryAction}</h2>
          <p className="main-hub-quest-copy">{primaryGuidance}</p>
          <div className="main-hub-hero-actions">
            <button className="main-hub-primary-action" onClick={onAdventure}>
              <MapPinned size={19} />
              <span>{primaryAction}</span>
            </button>
            {storyProgress.isComplete && onEndingRecord && (
              <button className="main-hub-secondary-action" onClick={onEndingRecord}>
                <BookOpenCheck size={18} />
                <span>查看卷末纪事</span>
              </button>
            )}
            {firstPendingEvent && (
              <button className="main-hub-secondary-action" onClick={() => onOpenPendingWorldEvent?.(firstPendingEvent.id)}>
                <Mail size={18} />
                <span>{pendingWorldEventSummary.buttonLabel}</span>
              </button>
            )}
          </div>
        </div>

        <aside className="main-hub-status-panel" aria-label="角色状态">
          <div className="main-hub-hero-row slim">
            <div className="main-hub-avatar">{player.name.slice(0, 1)}</div>
            <div className="main-hub-hero-meta">
              <div className="main-hub-hero-name">{player.name}</div>
              <div className="main-hub-hero-sub">{player.alignment}道 · 资质 {player.aptitude}</div>
            </div>
          </div>
          <div className="stat-bars main-hub-bars compact">
            <Bar label="气血" value={player.hp} max={player.hpMax} color="#b74332" />
            <Bar label="内力" value={player.mp} max={player.mpMax} color="#3b8c92" />
            <Bar label="阅历" value={player.exp} max={player.expMax} color="#b9944a" />
          </div>
          <div className="main-hub-status-grid">
            <span><b>{partyPower}</b>战力</span>
            <span><b>{player.skills.length}</b>武学</span>
            <span><b>{activeParty.length}</b>同行</span>
          </div>
        </aside>
      </section>

      <section className="main-hub-ledger">
        <div className={`main-hub-message-card${firstPendingEvent ? " has-pending" : ""}`}>
          <div className="main-hub-message-head">
            <span className="main-hub-message-label"><Mail size={15} /> 客舍信匣</span>
            <span className={`main-hub-message-status${firstPendingEvent ? " pending" : " idle"}`}>{firstPendingEvent ? "待阅" : "平静"}</span>
          </div>
          <div className="main-hub-message-title">{pendingWorldEventSummary.title}</div>
          <p className="main-hub-message-copy">{pendingWorldEventSummary.summary}</p>
          <button className="main-hub-message-btn" onClick={() => firstPendingEvent && onOpenPendingWorldEvent?.(firstPendingEvent.id)} disabled={!firstPendingEvent}>
            {pendingWorldEventSummary.buttonLabel}
          </button>
        </div>

        <div className="main-hub-quick-actions">
          <button className="main-hub-quick-action" onClick={onCharacter}>
            <UserRound size={21} />
            <span>
              <b>整顿行装</b>
              <small>人物、武学与队伍</small>
            </span>
          </button>
          <button className="main-hub-quick-action" onClick={onAdventure}>
            <Swords size={21} />
            <span>
              <b>寻访教头</b>
              <small>前往地点与人物过招</small>
            </span>
          </button>
          <div className="main-hub-next-note">
            <ScrollText size={21} />
            <span>
              <b>{storyProgress.next}</b>
              <small>射雕卷 {storyProgress.completed}/{storyProgress.total}</small>
            </span>
          </div>
        </div>
      </section>

      <nav className="main-hub-dock" aria-label="江湖功能">
        <button className="main-hub-dock-btn primary" onClick={onAdventure} title="江湖游历">
          <MapPinned className="main-hub-dock-icon" size={21} />
          <span className="main-hub-dock-text">江湖游历</span>
          <span className="main-hub-dock-hint">{systemPriorityBadges.adventure}</span>
        </button>
        <button className="main-hub-dock-btn" onClick={onCharacter} title="人物">
          <UserRound className="main-hub-dock-icon" size={21} />
          <span className="main-hub-dock-text">人物</span>
          <span className="main-hub-dock-hint">{systemPriorityBadges.character}</span>
        </button>
        <button className="main-hub-dock-btn" onClick={onShop} title="商铺">
          <ShoppingBag className="main-hub-dock-icon" size={21} />
          <span className="main-hub-dock-text">商铺</span>
          <span className="main-hub-dock-hint">{systemPriorityBadges.shop}</span>
        </button>
        <button className="main-hub-dock-btn" onClick={onSect} title="门派">
          <Landmark className="main-hub-dock-icon" size={21} />
          <span className="main-hub-dock-text">门派</span>
          <span className="main-hub-dock-hint">{systemPriorityBadges.sect}</span>
        </button>
        {onNpc && (
          <button className="main-hub-dock-btn" onClick={onNpc} title="江湖人物">
            <UsersRound className="main-hub-dock-icon" size={21} />
            <span className="main-hub-dock-text">江湖人物</span>
            <span className="main-hub-dock-hint">{systemPriorityBadges.npc}</span>
          </button>
        )}
        <button className="main-hub-dock-btn" onClick={onAdventure} title="寻访教头">
          <Swords className="main-hub-dock-icon" size={21} />
          <span className="main-hub-dock-text">寻访教头</span>
          <span className="main-hub-dock-hint">过招</span>
        </button>
        {onDebug && (
          <button className="main-hub-dock-btn subtle" onClick={onDebug} title="调试炼丹房">
            <FlaskConical className="main-hub-dock-icon" size={21} />
            <span className="main-hub-dock-text">调试炼丹房</span>
          </button>
        )}
      </nav>
    </div>
  )
}

function Bar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100))
  return (
    <div className="bar-row">
      <span className="bar-label">{label}</span>
      <div className="bar-track">
        <div className="bar-fill" style={{ width: pct + "%", background: color }} />
      </div>
      <span className="bar-value">{value}/{max}</span>
    </div>
  )
}
