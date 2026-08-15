import { useState } from "react"
import type { ReactNode } from "react"
import {
  BookOpenCheck,
  CheckCircle2,
  MapPin,
  Route,
  SlidersHorizontal,
} from "lucide-react"
import type { Player, Skill } from "../types"
import type { BattleObjectiveConfig } from "../game/battle"
import { savePlayer } from "../game/player"
import { applyStoryDebugPreset, setStoryDebugVariant } from "../game/debug"
import { recomputePlayerStats } from "../game/attributes"
import { getRelationLevel } from "../game/relations"
import { getStoryProgress } from "../game/story/query"
import { getSkillById } from "../data/skills"
import { getEnemyById } from "../data/enemies"
import { NPCS } from "../data/npcs"
import { getLocationById } from "../data/map"
import {
  STORY_DEBUG_ACT_PRESETS,
  STORY_DEBUG_ROUTE_PRESETS,
  STORY_DEBUG_VARIANT_FIELDS,
  type StoryDebugPreset,
} from "../data/story/debugPresets"

interface Props {
  player: Player
  onUpdate: (player: Player) => void
  onBack: () => void
  onTestBattle: (
    enemyIds: string[],
    options?: { allyIds?: string[]; objective?: BattleObjectiveConfig },
  ) => void
}

// 可分配/学习的武功候选（全部 SKILLS 的子集，用于加减）
const SKILL_IDS = [
  "changquan", "xianglong18", "dugu9", "liumai", "taijiquan", "dagou", "yiyangzhi",
  "kongming", "tiezhang",
  "jiuyang", "yijin", "qiankun", "beiming", "lingbo", "tiyun",
  "qianzhu", "huagu", "shehun", "lanhua", "hamagong", "lingshiquan",
]

const STORY_TEST_SKILL_IDS = ["xianglong18", "jiuyang", "lingbo", "lanhua", "liumai"] as const

const TEST_ENEMY_IDS = [
  "xialiubang", "shanzei", "duyaozi", "emingke", "xiejiaoshi",
  "guojing", "ouyangfeng", "huangyaoshi", "guanjun", "palace-guard", "qiuqianren", "yideng-disciple",
]

type DebugTone = "neutral" | "positive" | "negative" | "warning"
type StoryDebugTab = "routes" | "variants"

interface DebugEntry {
  text: string
  tone?: DebugTone
  strong?: boolean
}

function summarizeArcProgress(player: Player): DebugEntry[] {
  return Object.entries(player.world.arcs ?? {}).flatMap(([arcId, arcState]) => {
    const beatEntries = Object.entries(arcState.beats ?? {})
    const variantEntries = Object.entries(arcState.variants ?? {})
    if (beatEntries.length === 0 && variantEntries.length === 0 && !arcState.ending) return []

    const beatLine = beatEntries.length > 0
      ? `${arcId}：${beatEntries.map(([beat, result]) => `${beat}=${result}`).join(" / ")}`
      : `${arcId}：暂无节点记录`
    const variantLine = variantEntries.length > 0
      ? `${arcId}·variants：${variantEntries.map(([key, value]) => `${key}=${value}`).join(" / ")}`
      : ""

    const tone = beatEntries.some(([, result]) => result === "lost" || result === "skipped")
      ? "warning"
      : "positive"

    const entries: DebugEntry[] = [{ text: beatLine, tone, strong: true }]
    if (variantLine) entries.push({ text: variantLine })
    if (arcState.ending) entries.push({ text: `${arcId}·ending=${arcState.ending}`, tone: "positive" })
    return entries
  })
}

function summarizeWorldNpcStates(player: Player): DebugEntry[] {
  return Object.entries(player.world.npcs ?? {}).flatMap(([npcId, state]) => {
    const markers: string[] = []
    if (state.alive === false) markers.push("已故")
    if (state.recruited) markers.push("已入队")
    if (state.relationType && state.relationType !== "初识") markers.push(`关系=${state.relationType}`)
    if (state.faction) markers.push(`阵营=${state.faction}`)
    if (state.fateTags.length > 0) markers.push(`标签=${state.fateTags.join("、")}`)
    if (markers.length === 0) return []

    return [{
      text: `${npcId}：${markers.join(" / ")}`,
      tone: state.alive === false ? "negative" : state.recruited ? "positive" : "neutral",
      strong: true,
    }]
  })
}

function summarizeRelationStates(player: Player): DebugEntry[] {
  return Object.entries(player.relations ?? {})
    .filter(([, value]) => value !== 0)
    .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))
    .map(([npcId, value]) => {
      const npcName = NPCS.find((npc) => npc.id === npcId)?.name ?? npcId
      const rel = getRelationLevel(player, npcId, player.world)
      const polarity = value > 0 ? "+" : ""
      return {
        text: `${npcName}：${rel.label}（${polarity}${value}）`,
        tone: value > 0 ? "positive" : "negative",
        strong: Math.abs(value) >= 20,
      }
    })
}

function summarizeFactionStates(player: Player): DebugEntry[] {
  return Object.entries(player.world.factions ?? {})
    .sort((a, b) => Math.abs(b[1].attitude) - Math.abs(a[1].attitude))
    .map(([factionId, state]) => {
      const parts = [`态度=${state.attitude}`]
      if (state.power !== 0) parts.push(`势力=${state.power}`)
      return {
        text: `${factionId}：${parts.join(" / ")}`,
        tone: state.attitude > 0 ? "positive" : state.attitude < 0 ? "negative" : "neutral",
        strong: Math.abs(state.attitude) >= 20 || state.power !== 0,
      }
    })
}

function summarizeSeenNodes(player: Player): DebugEntry[] {
  return [...(player.world.seenNodes ?? [])].sort().map((text) => ({ text }))
}

function summarizeSeenNodeGroups(player: Player): DebugEntry[] {
  const counts = new Map<string, number>()
  for (const key of player.world.seenNodes ?? []) {
    const group = key.split(":")[0] ?? key
    counts.set(group, (counts.get(group) ?? 0) + 1)
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "zh-Hans-CN"))
    .map(([group, count]) => ({ text: `${group}：${count} 节点`, tone: "neutral", strong: count > 1 }))
}

function summarizeFlagStates(player: Player): DebugEntry[] {
  return Object.entries(player.world.flags ?? {})
    .sort(([a], [b]) => a.localeCompare(b, "zh-Hans-CN"))
    .map(([key, value]) => ({
      text: `${key}=${String(value)}`,
      tone: value === true ? "positive" : value === false ? "warning" : "neutral",
      strong: value === true,
    }))
}

function summarizeFlagGroups(player: Player): DebugEntry[] {
  const groups = new Map<string, { total: number; active: number }>()
  for (const [key, value] of Object.entries(player.world.flags ?? {})) {
    const group = key.split(/[.-]/)[0] ?? key
    const prev = groups.get(group) ?? { total: 0, active: 0 }
    groups.set(group, {
      total: prev.total + 1,
      active: prev.active + (value ? 1 : 0),
    })
  }
  return [...groups.entries()]
    .sort((a, b) => b[1].total - a[1].total || a[0].localeCompare(b[0], "zh-Hans-CN"))
    .map(([group, stats]) => ({
      text: `${group}：${stats.total} 项 / 生效 ${stats.active}`,
      tone: stats.active > 0 ? "positive" : "neutral",
      strong: stats.active > 0,
    }))
}

function renderDebugList(items: DebugEntry[], emptyText: string): ReactNode {
  if (items.length === 0) return <span className="debug-world-empty">{emptyText}</span>
  return (
    <ul className="debug-world-list">
      {items.map((item) => (
        <li
          key={item.text}
          className={`debug-world-list-item tone-${item.tone ?? "neutral"}${item.strong ? " strong" : ""}`}
        >
          {item.text}
        </li>
      ))}
    </ul>
  )
}

function renderDebugCard(args: {
  title: string
  items: DebugEntry[]
  emptyText: string
  wide?: boolean
  body?: ReactNode
  hidden?: boolean
}) {
  const { title, items, emptyText, wide, body, hidden } = args
  if (hidden) return null
  return (
    <div className={`debug-world-card${wide ? " wide" : ""}${items.length > 0 ? " has-data" : " empty"}`}>
      <div className="debug-world-head">
        <div className="debug-world-title">{title}</div>
        <span className={`debug-world-count${items.length > 0 ? " active" : " idle"}`}>
          {items.length > 0 ? `${items.length} 条` : "空"}
        </span>
      </div>
      <div className="debug-world-body">{body ?? renderDebugList(items, emptyText)}</div>
    </div>
  )
}

function formatGuidanceSource(
  source: ReturnType<typeof getStoryProgress>["guidanceSource"],
): string {
  if (source.kind === "complete") return "卷末完成态"
  if (source.kind === "act") return `幕级默认 · ${source.id}`

  const boundaries = [
    source.after ? `已达 ${source.after}` : "",
    source.before ? `未达 ${source.before}` : "",
  ].filter(Boolean)
  return boundaries.join(" · ") || source.id
}

export function DebugScreen({ player, onUpdate, onBack, onTestBattle }: Props) {
  const [, force] = useState(0)
  const refresh = () => force((n) => n + 1)
  const [selectedEnemies, setSelectedEnemies] = useState<string[]>([])
  const [showOnlyNonEmpty, setShowOnlyNonEmpty] = useState(true)
  const [storyDebugTab, setStoryDebugTab] = useState<StoryDebugTab>("routes")
  const [storyDebugNotice, setStoryDebugNotice] = useState("")

  function commit(next: Player) {
    savePlayer(next)
    onUpdate(next)
    refresh()
  }

  function applyStoryPreset(preset: StoryDebugPreset) {
    commit(applyStoryDebugPreset(player, preset))
    setStoryDebugNotice(`${preset.title}已载入，推荐地点切到${getLocationById(preset.targetLocationId)?.name ?? preset.targetLocationId}。`)
  }

  function updateStoryVariant(key: string, value: string, label: string) {
    commit(setStoryDebugVariant(player, "shendiao", key, value))
    setStoryDebugNotice(`${label}已${value ? `设为 ${value}` : "清除"}。`)
  }

  function applyStoryTestBoost() {
    const boostedSkills = STORY_TEST_SKILL_IDS
      .map((id) => getSkillById(id))
      .filter((skill): skill is Skill => !!skill)
    const existingSkillIds = new Set(player.skills.map((skill) => skill.id))

    const next: Player = {
      ...player,
      level: Math.max(player.level, 28),
      exp: 0,
      gold: Math.max(player.gold, 3000),
      attributePoints: Math.max(player.attributePoints ?? 0, 30),
      roots: {
        strength: Math.max(player.roots.strength, 28),
        external: Math.max(player.roots.external, 32),
        internal: Math.max(player.roots.internal, 30),
        comprehension: Math.max(player.roots.comprehension, 26),
        constitution: Math.max(player.roots.constitution, 28),
        breath: Math.max(player.roots.breath, 26),
        agility: Math.max(player.roots.agility, 26),
        luck: Math.max(player.roots.luck, 24),
      },
      skills: [...player.skills, ...boostedSkills.filter((skill) => !existingSkillIds.has(skill.id))],
      inventory: {
        ...player.inventory,
        "small-hp-pill": Math.max(player.inventory["small-hp-pill"] ?? 0, 8),
        "small-mp-pill": Math.max(player.inventory["small-mp-pill"] ?? 0, 6),
        "field-ration": Math.max(player.inventory["field-ration"] ?? 0, 10),
      },
    }

    const recomputed = recomputePlayerStats(next)
    commit({ ...recomputed, hp: recomputed.hpMax, mp: recomputed.mpMax, statuses: [] })
  }

  // 调整等级：直接设等级，重新推导面板，回满血蓝，补对应属性点（不补偿历史，纯调试）
  function setLevel(level: number) {
    const clamped = Math.max(1, Math.min(99, level))
    const next: Player = { ...player, level: clamped, exp: 0 }
    const recomputed = recomputePlayerStats(next)
    recomputed.hp = recomputed.hpMax
    recomputed.mp = recomputed.mpMax
    commit(recomputed)
  }

  // 给某根基属性 ±delta（不受属性点限制，纯调试自由调）
  function adjustRoot(key: keyof Player["roots"], delta: number) {
    const next: Player = {
      ...player,
      roots: { ...player.roots, [key]: Math.max(1, player.roots[key] + delta) },
    }
    const recomputed = recomputePlayerStats(next)
    commit(recomputed)
  }

  // 学习/遗忘武功
  function addSkill(id: string) {
    const skill = getSkillById(id)
    if (!skill || player.skills.some((s) => s.id === id)) return
    commit({
      ...player,
      skills: [...player.skills, skill],
      mastery: { ...player.mastery, [id]: 0 },
    })
  }
  function removeSkill(id: string) {
    const mastery = { ...player.mastery }
    delete mastery[id]
    commit({
      ...player,
      skills: player.skills.filter((s) => s.id !== id),
      mastery,
    })
  }

  // 刷满血蓝、给银两、重置状态
  function fullHeal() {
    commit({ ...player, hp: player.hpMax, mp: player.mpMax, statuses: [] })
  }
  function addGold() {
    commit({ ...player, gold: player.gold + 500 })
  }
  function grantPoints() {
    commit({ ...player, attributePoints: (player.attributePoints ?? 0) + 10 })
  }

  const rootKeys = ["strength", "external", "internal", "comprehension", "constitution", "breath", "agility", "luck"] as const
  const rootLabels: Record<string, string> = {
    strength: "力量", external: "外功", internal: "内功", comprehension: "悟性",
    constitution: "身体", breath: "吐纳", agility: "身法", luck: "福缘",
  }
  const arcSummary = summarizeArcProgress(player)
  const npcSummary = summarizeWorldNpcStates(player)
  const relationSummary = summarizeRelationStates(player)
  const factionSummary = summarizeFactionStates(player)
  const seenNodeSummary = summarizeSeenNodes(player)
  const seenNodeGroupSummary = summarizeSeenNodeGroups(player)
  const flagSummary = summarizeFlagStates(player)
  const flagGroupSummary = summarizeFlagGroups(player)
  const storyProgress = getStoryProgress(player)
  const recommendedLocation = getLocationById(storyProgress.recommendedLocationId)
  const storyVariantGroups = (["阶段", "人物与会局", "四轮证据", "裁决"] as const)
    .map((group) => ({
      group,
      fields: STORY_DEBUG_VARIANT_FIELDS.filter((field) => field.group === group),
    }))
  const currentStorySummary: DebugEntry[] = player.world.currentStory
    ? [
        { text: `event=${player.world.currentStory.eventId}`, tone: "positive", strong: true },
        { text: `node=${player.world.currentStory.nodeId}` },
        { text: `phase=${player.world.currentStory.phase} / page=${player.world.currentStory.pageIndex + 1}` },
        { text: `location=${player.world.currentStory.locationId ?? "无"}` },
        ...(player.world.currentStory.transition
          ? [{ text: `transition=${player.world.currentStory.transition.type}`, tone: "warning" as const }]
          : []),
      ]
    : []

  return (
    <div className="debug-screen">
      <header className="top-bar">
        <button className="back-btn" onClick={onBack}>← 返回</button>
        <span className="player-name">调试炼丹房</span>
        <span className="day-info">第 {player.day} 日</span>
      </header>

      <section className="stat-panel debug-story-console">
        <div className="debug-console-heading">
          <div>
            <span className="debug-console-kicker">P5 · 剧情校验台</span>
            <h2>{storyProgress.act.title}</h2>
          </div>
          <span className="debug-console-progress">
            {storyProgress.completed} / {storyProgress.total} 幕
          </span>
        </div>

        <div className="debug-guidance-strip">
          <div className="debug-guidance-primary">
            <MapPin size={17} aria-hidden="true" />
            <div>
              <span>当前推荐</span>
              <strong>{recommendedLocation?.name ?? storyProgress.recommendedLocationId}</strong>
            </div>
          </div>
          <div className="debug-guidance-source">
            <BookOpenCheck size={16} aria-hidden="true" />
            <div>
              <span>推荐来源</span>
              <strong>{formatGuidanceSource(storyProgress.guidanceSource)}</strong>
            </div>
          </div>
        </div>

        <div className="debug-console-tabs" role="tablist" aria-label="剧情调试模式">
          <button
            type="button"
            role="tab"
            aria-selected={storyDebugTab === "routes"}
            className={storyDebugTab === "routes" ? "active" : ""}
            onClick={() => setStoryDebugTab("routes")}
          >
            <Route size={16} aria-hidden="true" />
            路线预设
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={storyDebugTab === "variants"}
            className={storyDebugTab === "variants" ? "active" : ""}
            onClick={() => setStoryDebugTab("variants")}
          >
            <SlidersHorizontal size={16} aria-hidden="true" />
            关键状态
          </button>
        </div>

        {storyDebugTab === "routes" ? (
          <div className="debug-console-pane" role="tabpanel">
            <div className="debug-console-section-head">
              <span>按幕跳转</span>
              <small>保留角色战力，重建剧情世界</small>
            </div>
            <div className="debug-act-switcher">
              {STORY_DEBUG_ACT_PRESETS.map((preset, index) => (
                <button
                  key={preset.id}
                  type="button"
                  className={storyProgress.act.id === preset.expectedActId ? "current" : ""}
                  onClick={() => applyStoryPreset(preset)}
                  title={`载入${preset.title}并推荐${getLocationById(preset.targetLocationId)?.name ?? preset.targetLocationId}`}
                >
                  <span>{index + 1}</span>
                  <strong>{preset.title}</strong>
                  <small>{getLocationById(preset.targetLocationId)?.name ?? preset.targetLocationId}</small>
                </button>
              ))}
            </div>

            <div className="debug-console-section-head route-head">
              <span>铁枪庙路线夹具</span>
              <small>载入后从地图进入铁枪庙</small>
            </div>
            <div className="debug-route-fixtures">
              {STORY_DEBUG_ROUTE_PRESETS.map((preset) => (
                <div key={preset.id} className="debug-route-row">
                  <div className="debug-route-copy">
                    <strong>{preset.title}</strong>
                    <span>{preset.description}</span>
                  </div>
                  <button
                    type="button"
                    className="debug-route-apply"
                    onClick={() => applyStoryPreset(preset)}
                  >
                    <Route size={15} aria-hidden="true" />
                    载入
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="debug-console-pane" role="tabpanel">
            <div className="debug-console-section-head">
              <span>第六幕关键状态</span>
              <small>更改后清除当前剧情断点</small>
            </div>
            <div className="debug-variant-groups">
              {storyVariantGroups.map(({ group, fields }) => (
                <div key={group} className="debug-variant-group">
                  <div className="debug-variant-group-name">{group}</div>
                  <div className="debug-variant-fields">
                    {fields.map((field) => (
                      <label key={field.key} className="debug-variant-field">
                        <span>{field.label}</span>
                        <select
                          value={player.world.arcs.shendiao?.variants?.[field.key] ?? ""}
                          onChange={(event) => updateStoryVariant(field.key, event.target.value, field.label)}
                        >
                          <option value="">未设置</option>
                          {field.options.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {storyDebugNotice ? (
          <div className="debug-console-notice" role="status">
            <CheckCircle2 size={16} aria-hidden="true" />
            {storyDebugNotice}
          </div>
        ) : null}
      </section>

      <section className="stat-panel">
        <h2>角色调试</h2>
        <p className="hint">此处可自由调整角色配置，便于快速体验剧情与验证战斗手感。正式游玩不必使用。</p>
        <div className="debug-actions">
          <button className="menu-btn primary" onClick={applyStoryTestBoost}>一键剧情体验强化</button>
          <button className="menu-btn" onClick={fullHeal}>刷满气血内力</button>
          <button className="menu-btn" onClick={addGold}>+500 银两</button>
          <button className="menu-btn" onClick={grantPoints}>+10 属性点</button>
        </div>
        <p className="hint">强化会抬高等级、根基、武功与补给；若要回调，仍可用下面的按钮逐项减回去。</p>
        <div className="debug-row">
          <span className="debug-label">等级</span>
          <button className="debug-step" onClick={() => setLevel(player.level - 1)}>−</button>
          <span className="debug-value">{player.level}</span>
          <button className="debug-step" onClick={() => setLevel(player.level + 1)}>+</button>
        </div>
        <div className="debug-row">
          <span className="debug-label">待分配属性点</span>
          <span className="debug-value">{player.attributePoints ?? 0}</span>
        </div>
      </section>

      <section className="stat-panel">
        <h2>根基属性（自由调整）</h2>
        <div className="root-attr-grid">
          {rootKeys.map((key) => (
            <div key={key} className="root-attr-item">
              <div className="root-attr-head">
                <span className="root-attr-label">{rootLabels[key]}</span>
                <span className="root-attr-value">{player.roots[key]}</span>
              </div>
              <div className="debug-step-row">
                <button className="debug-step" onClick={() => adjustRoot(key, -1)}>−</button>
                <button className="debug-step" onClick={() => adjustRoot(key, -5)}>-5</button>
                <button className="debug-step" onClick={() => adjustRoot(key, +5)}>+5</button>
                <button className="debug-step" onClick={() => adjustRoot(key, +1)}>+</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="stat-panel">
        <h2>已学武功</h2>
        {player.skills.length === 0 ? (
          <p className="hint">尚未习得武功。</p>
        ) : (
          <div className="debug-skill-list">
            {player.skills.map((s: Skill) => (
              <div key={s.id} className="debug-skill-item">
                <span className={`skill-cat-tag cat-${s.category}`}>{s.category}</span>
                <span className="char-skill-name">{s.name}</span>
                <button className="debug-remove" onClick={() => removeSkill(s.id)}>遗忘</button>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="stat-panel">
        <h2>添加武功</h2>
        <div className="debug-skill-pool">
          {SKILL_IDS.filter((id) => !player.skills.some((s) => s.id === id)).map((id) => {
            const skill = getSkillById(id)
            return skill ? (
              <button key={id} className="menu-btn small" onClick={() => addSkill(id)}>
                <span className={`skill-cat-tag cat-${skill.category}`}>{skill.category}</span> {skill.name}
              </button>
            ) : null
          })}
        </div>
      </section>

      <section className="stat-panel">
        <h2>测试战斗 <span className="panel-count">已选 {selectedEnemies.length}</span></h2>
        <p className="hint">勾选1~3个对手，验证单体/群攻/多对多手感。点"开战"进入。</p>
        <div className="debug-enemy-grid">
          {TEST_ENEMY_IDS.map((id) => {
            const enemy = getEnemyById(id)
            const checked = selectedEnemies.includes(id)
            return (
              <button key={id} className={`location-card ${checked ? "selected" : ""}`} onClick={() => {
                setSelectedEnemies(checked ? selectedEnemies.filter((x) => x !== id) : [...selectedEnemies, id].slice(-3))
              }}>
                <span className="location-name">{enemy.name}{checked ? " ✓" : ""}</span>
                <span className="location-desc">气血 {enemy.hp} · 攻 {enemy.attack}</span>
              </button>
            )
          })}
        </div>
        <button
          className="menu-btn primary"
          disabled={selectedEnemies.length === 0}
          onClick={() => onTestBattle(selectedEnemies)}
        >开战（{selectedEnemies.length || 0} 个对手）</button>
        <button
          className="menu-btn"
          onClick={() => onTestBattle(
            ["qiuqianren"],
            {
              allyIds: ["guojing"],
              objective: {
                kind: "surviveRounds",
                rounds: 3,
                protectUid: "npc-guojing",
                title: "护住郭靖并守满三轮",
              },
            },
          )}
        >守轮护友测试</button>
      </section>

      <section className="stat-panel debug-world-panel">
        <h2>世界状态速览</h2>
        <p className="hint">只读查看当前存档里的主线、事件断点、待处理消息、seenNodes、关系值、阵营态度与世界字段，方便你边重写剧情边核对状态是否落对。</p>
        <div className="debug-world-overview">
          <span className={`debug-world-pill${arcSummary.length > 0 ? " active" : ""}`}>主线 {arcSummary.length}</span>
          <span className={`debug-world-pill${(player.world.pendingWorldEvents ?? []).length > 0 ? " active" : ""}`}>消息 {(player.world.pendingWorldEvents ?? []).length}</span>
          <span className={`debug-world-pill${relationSummary.length > 0 ? " active" : ""}`}>关系 {relationSummary.length}</span>
          <span className={`debug-world-pill${flagSummary.length > 0 ? " active" : ""}`}>Flags {flagSummary.length}</span>
          <button
            className={`debug-world-toggle${showOnlyNonEmpty ? " active" : ""}`}
            onClick={() => setShowOnlyNonEmpty((value) => !value)}
          >
            {showOnlyNonEmpty ? "只看有内容" : "显示全部"}
          </button>
        </div>
        <div className="debug-world-grid">
          {renderDebugCard({
            title: "主线 / 卷进度",
            items: arcSummary,
            emptyText: "暂无 arc 进度。",
            hidden: showOnlyNonEmpty && arcSummary.length === 0,
          })}
          {renderDebugCard({
            title: "当前事件断点",
            items: currentStorySummary,
            emptyText: "当前没有 currentStory。",
            hidden: showOnlyNonEmpty && currentStorySummary.length === 0,
          })}
          {renderDebugCard({
            title: "待处理消息",
            items: (player.world.pendingWorldEvents ?? []).map((text) => ({ text, tone: "warning", strong: true })),
            emptyText: "当前没有 pendingWorldEvents。",
            hidden: showOnlyNonEmpty && (player.world.pendingWorldEvents ?? []).length === 0,
          })}
          {renderDebugCard({
            title: "已触发世界事件",
            items: (player.world.triggeredEvents ?? []).map((text) => ({ text })),
            emptyText: "当前没有 triggeredEvents。",
            hidden: showOnlyNonEmpty && (player.world.triggeredEvents ?? []).length === 0,
          })}
          {renderDebugCard({
            title: "已完成一次性事件",
            items: (player.world.completedEvents ?? []).map((text) => ({ text, tone: "positive" })),
            emptyText: "当前没有 completedEvents。",
            hidden: showOnlyNonEmpty && (player.world.completedEvents ?? []).length === 0,
          })}
          {renderDebugCard({
            title: "队伍槽位",
            items: [...(player.world.party?.activeNpcIds ?? []), ...(player.world.party?.reserveNpcIds ?? [])].map((text) => ({ text })),
            emptyText: "当前没有队伍槽位记录。",
            hidden: showOnlyNonEmpty
              && (player.world.party?.activeNpcIds ?? []).length === 0
              && (player.world.party?.reserveNpcIds ?? []).length === 0,
            body: (
              <>
                <div className="debug-world-subtitle">出战</div>
                {renderDebugList((player.world.party?.activeNpcIds ?? []).map((text) => ({ text, tone: "positive" })), "当前无 activeNpcIds。")}
                <div className="debug-world-subtitle">候补</div>
                {renderDebugList((player.world.party?.reserveNpcIds ?? []).map((text) => ({ text })), "当前无 reserveNpcIds。")}
              </>
            ),
          })}
          {renderDebugCard({
            title: "阵营态度 / 势力",
            items: factionSummary,
            emptyText: "当前没有 faction 状态记录。",
            hidden: showOnlyNonEmpty && factionSummary.length === 0,
          })}
          {renderDebugCard({
            title: "已读节点分组",
            items: seenNodeGroupSummary,
            emptyText: "当前没有 seenNodes 分组。",
            hidden: showOnlyNonEmpty && seenNodeGroupSummary.length === 0,
          })}
          {renderDebugCard({
            title: "已读节点（seenNodes）",
            items: seenNodeSummary,
            emptyText: "当前没有 seenNodes。",
            wide: true,
            hidden: showOnlyNonEmpty && seenNodeSummary.length === 0,
          })}
          {renderDebugCard({
            title: "NPC 世界状态",
            items: npcSummary,
            emptyText: "当前没有记录到特殊 NPC 状态。",
            wide: true,
            hidden: showOnlyNonEmpty && npcSummary.length === 0,
          })}
          {renderDebugCard({
            title: "角色关系值（player.relations）",
            items: relationSummary,
            emptyText: "当前没有偏离 0 的关系值。",
            wide: true,
            hidden: showOnlyNonEmpty && relationSummary.length === 0,
          })}
          {renderDebugCard({
            title: "Flags 分组",
            items: flagGroupSummary,
            emptyText: "当前没有 flags 分组。",
            hidden: showOnlyNonEmpty && flagGroupSummary.length === 0,
          })}
          {renderDebugCard({
            title: "Flags",
            items: flagSummary,
            emptyText: "当前没有 flags。",
            wide: true,
            hidden: showOnlyNonEmpty && flagSummary.length === 0,
          })}
        </div>
      </section>
    </div>
  )
}
