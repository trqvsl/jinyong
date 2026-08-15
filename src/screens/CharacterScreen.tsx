import { getItemById } from "../data/items"
import type { Player, Skill, SkillCategory } from "../types"
import { savePlayer } from "../game/player"
import { recomputePlayerStats } from "../game/attributes"
import {
  applyMasteryToSkill,
  getSkillMastery,
  getSkillMasteryLabel,
} from "../game/progression"
import { getLocationById } from "../data/map"
import { getRelationLevel } from "../game/relations"
import { getActivePartyNpcs, getReservePartyNpcs, moveActiveNpc, setNpcPartyActive, MAX_ACTIVE_TEAMMATES, normalizePlayerParty, getNpcBattleRole, getPartySupportBonuses, getPartySupportTotals, getPartyBondBonuses, getBattleSupportMechanicRules } from "../game/party"

interface Props {
  player: Player
  onUpdate: (player: Player) => void
  onBack: () => void
}

const CAT_ORDER: SkillCategory[] = ["外功", "内功", "轻功", "奇门"]
const CAT_COLOR: Record<SkillCategory, string> = {
  "外功": "#c0392b", "内功": "#d4a017", "轻功": "#16a085", "奇门": "#8e44ad"
}

// 八大根基属性：键名 → 显示名 + 武侠意涵
const ROOT_ATTRS: { key: keyof Player["roots"]; label: string; note: string }[] = [
  { key: "strength", label: "力量", note: "外力根基，参与共构攻击力" },
  { key: "external", label: "外功", note: "外家修为，与力量共构物理攻击" },
  { key: "internal", label: "内功", note: "内家真气，催动外功招式" },
  { key: "comprehension", label: "悟性", note: "修炼速度、武学门槛" },
  { key: "constitution", label: "身体", note: "气血上限、防御" },
  { key: "breath", label: "吐纳", note: "内力上限" },
  { key: "agility", label: "身法", note: "速度、命中、暴击、闪避" },
  { key: "luck", label: "福缘", note: "奇遇、剧情检定、逃跑" },
]

function getMasteryBonusText(skill: Skill, mastery: number): string {
  const modified = applyMasteryToSkill(skill, mastery)
  const bonuses: string[] = []
  const powerGain = modified.power - skill.power
  if (powerGain > 0) bonuses.push(`威力 +${powerGain}`)

  if (skill.effect) {
    const potencyGain = Math.abs(modified.effectPotency) - Math.abs(skill.effect.potency)
    if (potencyGain > 0) bonuses.push(`效果 +${potencyGain}`)

    const chanceGain = Math.round(
      (modified.effectApplyChance - skill.effect.applyChance) * 1000,
    ) / 10
    if (chanceGain > 0) bonuses.push(`命中 +${chanceGain}%`)
  }

  return bonuses.join(" · ") || "尚无战斗加成"
}

export function CharacterScreen({ player, onUpdate, onBack }: Props) {
  const activeParty = getActivePartyNpcs(player)
  const reserveParty = getReservePartyNpcs(player)
  const supportBonuses = getPartySupportBonuses(player)
  const bondBonuses = getPartyBondBonuses(player)
  const supportTotals = getPartySupportTotals(player)
  const supportMechanicRules = getBattleSupportMechanicRules(player)
  const catGroups = CAT_ORDER.map(cat => ({
    cat,
    skills: player.skills.filter(s => s.category === cat)
  })).filter(g => g.skills.length > 0)

  const maxStats = { hpMax: 500, mpMax: 300, attack: 100, defense: 60, speed: 60 }
  const bagItemEntries = Object.entries(player.inventory).filter(([, count]) => count > 0)
  const bagCount = Object.values(player.inventory).reduce((sum, count) => sum + count, 0)
  const topSkills = player.skills.slice(0, 3)

  function pct(cur: number, max: number) {
    return Math.min(100, Math.round((cur / max) * 100))
  }

  function persist(nextPlayer: Player) {
    const normalized = normalizePlayerParty(nextPlayer)
    savePlayer(normalized)
    onUpdate(normalized)
  }

  function handleResetName() {
    const name = prompt("请输入新名字（8字以内）：", player.name)
    if (name && name.trim()) {
      const updated = { ...player, name: name.trim().slice(0, 8) }
      persist(updated)
    }
  }
  // 给某根基属性 +1，消耗 1 属性点，然后重新推导面板
  function investRoot(key: keyof Player["roots"]) {
    if ((player.attributePoints ?? 0) <= 0) return
    const invested: Player = {
      ...player,
      roots: { ...player.roots, [key]: player.roots[key] + 1 },
      attributePoints: (player.attributePoints ?? 0) - 1,
    }
    const recomputed = recomputePlayerStats(invested)
    persist(recomputed)
  }


  function consumeItem(itemId: string) {
    const item = getItemById(itemId)
    if (!item?.usable || !item.apply) {
      alert("此物暂不可直接使用。")
      return
    }
    const updated = item.apply({
      ...player,
      inventory: {
        ...player.inventory,
        [itemId]: Math.max(0, (player.inventory[itemId] ?? 0) - 1),
      },
    })
    const cleaned = { ...updated.inventory }
    if (cleaned[itemId] <= 0) delete cleaned[itemId]
    const finalPlayer = { ...updated, inventory: cleaned }
    persist(finalPlayer)
    alert(`使用了 ${item.name}：${item.effectText}`)
  }

  function handleToggleParty(npcId: string, active: boolean) {
    persist(setNpcPartyActive(player, npcId, active))
  }

  function handleMoveParty(npcId: string, direction: "forward" | "backward") {
    persist(moveActiveNpc(player, npcId, direction))
  }

  function renderPartyMember(npcId: string, mode: "active" | "reserve", order?: number) {
    const npc = [...activeParty, ...reserveParty].find((item) => item.id === npcId)
    if (!npc) return null
    const locationName = npc.locationId ? getLocationById(npc.locationId)?.name : undefined
    const relation = getRelationLevel(player, npc.id, player.world)
    const support = supportBonuses.find((item) => item.npcId === npc.id)
    const strongestSkill = [...npc.combat.skills].sort((a, b) => b.power - a.power)[0]
    const role = getNpcBattleRole(npc)

    return (
      <div key={npc.id} className={`party-member-card ${mode}`}>
        <div className="party-member-main">
          {typeof order === "number" && <div className="party-member-order">位次 {order + 1}</div>}
          <div className="party-member-title-row">
            <div className="party-member-name">{npc.title}·{npc.name}</div>
            <span className={`relation-badge rel-${relation.tone}`}>{relation.label}</span>
          </div>
          <div className="party-member-meta">{npc.work} · {npc.alignment}道{locationName ? ` · 常驻${locationName}` : ""}</div>
          <div className="party-member-tags">
            <span className="char-tag">定位 {role}</span>
            <span className="char-tag">气血 {npc.combat.hpMax}</span>
            <span className="char-tag">攻击 {npc.combat.attack}</span>
            <span className="char-tag">身法 {npc.combat.speed}</span>
            {strongestSkill && <span className="char-tag">主修 {strongestSkill.name}</span>}
            {support && <span className="char-tag">随行加成 攻+{support.attack} / 防+{support.defense} / 速+{support.speed}</span>}
          </div>
          <div className="party-member-desc">{npc.description}</div>
          {support && <div className="party-member-support-note">{support.description}</div>}
        </div>
        <div className="party-member-actions">
          {mode === "active" ? (
            <>
              <button className="menu-btn party-action-btn" disabled={order === 0} onClick={() => handleMoveParty(npc.id, "forward")}>前移</button>
              <button className="menu-btn party-action-btn" disabled={order === activeParty.length - 1} onClick={() => handleMoveParty(npc.id, "backward")}>后移</button>
              <button className="menu-btn party-action-btn" onClick={() => handleToggleParty(npc.id, false)}>转候补</button>
            </>
          ) : (
            <button className="menu-btn party-action-btn" onClick={() => handleToggleParty(npc.id, true)}>编入出战</button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="char-screen">
      <header className="top-bar">
        <button className="back-btn" onClick={onBack}>← 返回</button>
        <span className="player-name">个人属性</span>
        <span className="day-info">第 {player.day} 日</span>
      </header>

      <section className="stat-panel">
        <h2>基础信息</h2>
        <div className="char-basic">
          <div className="char-avatar">{player.name.slice(0, 1)}</div>
          <div className="char-name-row">
            <span className="char-name">{player.name}</span>
            <button className="char-rename" onClick={handleResetName}>改名</button>
          </div>
          <div className="char-tags">
            <span className="char-tag">等级 {player.level}</span>
            <span className="char-tag">{player.alignment}道</span>
            <span className="char-tag">名声 {player.reputation}</span>
            <span className="char-tag">银两 {player.gold}</span>
          </div>
        </div>
      </section>

      <section className="stat-panel char-focus-panel">
        <div className="char-focus-head">
          <div>
            <h2>当前战备</h2>
            <p className="hint">先看这三块：现在能打成什么样、手上有哪些主修武功、行囊里有什么能立刻用。</p>
          </div>
          {(player.attributePoints ?? 0) > 0 && <span className="panel-count highlight">待分配 {player.attributePoints}</span>}
        </div>
        <div className="char-quick-summary-row">
          <span className="char-tag strong">攻击 {player.attack}</span>
          <span className="char-tag strong">防御 {player.defense}</span>
          <span className="char-tag strong">身法 {player.speed}</span>
          <span className="char-tag strong">武功 {player.skills.length}</span>
          <span className="char-tag strong">道具 {bagCount}</span>
        </div>
        <div className="char-stat-bars">
          {[
            { label: "气血", cur: player.hp, max: player.hpMax, limit: maxStats.hpMax, color: "#c0392b" },
            { label: "内力", cur: player.mp, max: player.mpMax, limit: maxStats.mpMax, color: "#2980b9" },
            { label: "攻击", cur: player.attack, max: maxStats.attack, limit: maxStats.attack, color: "#e17055" },
            { label: "防御", cur: player.defense, max: maxStats.defense, limit: maxStats.defense, color: "#0984e3" },
            { label: "身法", cur: player.speed, max: maxStats.speed, limit: maxStats.speed, color: "#00b894" },
            { label: "经验", cur: player.exp, max: player.expMax, limit: player.expMax, color: "#27ae60" },
          ].map(b => (
            <div key={b.label} className="char-bar-row">
              <span className="char-bar-label">{b.label}</span>
              <div className="char-bar-track">
                <div className="char-bar-fill" style={{ width: pct(b.cur, b.limit) + "%", background: b.color }} />
              </div>
              <span className="char-bar-value">{b.cur}/{b.max}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="stat-panel char-focus-panel compact">
        <div className="char-focus-head compact">
          <h2>主修武功</h2>
          <span className="panel-count">先看前 {Math.min(topSkills.length, 3)} 门</span>
        </div>
        {topSkills.length === 0 ? <p className="hint">尚未习得任何武功。</p> : (
          <div className="char-priority-list">
            {topSkills.map((skill) => {
              const mastery = getSkillMastery(player, skill.id)
              return (
                <div key={skill.id} className="char-priority-item">
                  <div className="char-priority-main">
                    <div className="char-priority-title">
                      <span className="skill-cat-tag" style={{ background: CAT_COLOR[skill.category] }}>{skill.category}</span>
                      <span className="char-skill-name">{skill.name}</span>
                    </div>
                    <span className={`skill-mastery-rank ${mastery >= 100 ? "mastered" : ""}`}>
                      {getSkillMasteryLabel(mastery)} · {mastery}
                    </span>
                  </div>
                  <div
                    className="skill-mastery-track"
                    role="progressbar"
                    aria-label={`${skill.name}熟练度`}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={mastery}
                  >
                    <span style={{ width: `${mastery}%` }} />
                  </div>
                  <div className="char-skill-detail">
                    <span className="char-skill-desc">{skill.description}</span>
                    <span className="skill-mastery-bonus">{getMasteryBonusText(skill, mastery)}</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      <section className="stat-panel char-focus-panel compact">
        <div className="char-focus-head compact">
          <h2>即用行囊</h2>
          <span className="panel-count">{bagCount}</span>
        </div>
        {bagItemEntries.length === 0 ? <p className="hint">行囊空空，还没有收集到任何道具。</p> : (
          <div className="char-bag-list">
            {bagItemEntries.map(([itemId, count]) => {
              const item = getItemById(itemId)
              return (
                <div key={itemId} className="char-skill-item char-bag-row">
                  <div className="char-bag-info">
                    <span className="char-skill-name">{item?.name ?? itemId} × {count}</span>
                    <span className="char-skill-desc">{item?.effectText ?? "未知物品"}</span>
                  </div>
                  <button
                    className="menu-btn char-use-btn"
                    disabled={!item?.usable || count <= 0}
                    onClick={() => consumeItem(itemId)}
                  >
                    {item?.usable ? "使用" : "留存"}
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </section>

      <section className="stat-panel char-deep-panel">
        <div className="char-deep-head">
          <h2>根基属性</h2>
          <span className="char-deep-note">深入养成</span>
        </div>
        <p className="hint">修炼根基，战斗属性由根基推导而来。{(player.attributePoints ?? 0) > 0 ? "点击 + 投入属性点。" : "升级或修炼秘籍可获得属性点。"}</p>
        <div className="root-attr-grid">
          {ROOT_ATTRS.map(attr => (
            <div key={attr.key} className="root-attr-item">
              <div className="root-attr-head">
                <span className="root-attr-label">{attr.label}</span>
                <span className="root-attr-value">{player.roots[attr.key]}</span>
                {(player.attributePoints ?? 0) > 0 && (
                  <button className="root-invest-btn" onClick={() => investRoot(attr.key)}>+</button>
                )}
              </div>
              <span className="root-attr-note">{attr.note}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="stat-panel char-deep-panel">
        <div className="char-deep-head">
          <h2>同行队伍 <span className="panel-count">{activeParty.length}/{MAX_ACTIVE_TEAMMATES}</span></h2>
          <span className="char-deep-note">队伍管理</span>
        </div>
        <p className="hint">已入队人物不会自动全员上阵。这里只管理当前随行出战的队友与候补名单。</p>
        <div className="party-team-bonus-banner">当前随行加成：攻击 +{supportTotals.attack} / 防御 +{supportTotals.defense} / 身法 +{supportTotals.speed}</div>
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
          <div className="party-trigger-rule-list detailed">
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
                <div className="party-trigger-rule-source-list">
                  {rule.sourceEntries.map((entry) => (
                    <div key={entry.key} className={`party-trigger-rule-source-item ${entry.type}`}>
                      <div className="party-trigger-rule-source-name">{entry.label}</div>
                      <ul className="party-trigger-rule-detail-list">
                        {entry.details.map((detail, index) => <li key={index}>{detail}</li>)}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="party-section-block">
          <div className="party-section-head">出战位</div>
          {activeParty.length === 0 ? (
            <p className="hint">你暂时独自行走江湖，还没有安排任何同行队友。</p>
          ) : (
            <div className="party-list">
              {activeParty.map((npc, index) => renderPartyMember(npc.id, "active", index))}
            </div>
          )}
        </div>

        <div className="party-section-block">
          <div className="party-section-head">候补</div>
          {reserveParty.length === 0 ? (
            <p className="hint">暂无候补队友。</p>
          ) : (
            <div className="party-list reserve">
              {reserveParty.map((npc) => renderPartyMember(npc.id, "reserve"))}
            </div>
          )}
        </div>
      </section>

      <section className="stat-panel char-deep-panel">
        <div className="char-deep-head">
          <h2>武功总览 <span className="panel-count">{player.skills.length}</span></h2>
          <span className="char-deep-note">完整列表</span>
        </div>
        {catGroups.map(group => (
          <div key={group.cat} className="char-skill-group">
            <div className="char-cat-header">
              <span className="skill-cat-tag" style={{ background: CAT_COLOR[group.cat] }}>{group.cat}</span>
              <span className="char-cat-count">{group.skills.length} 门</span>
            </div>
            {group.skills.map((skill) => {
              const mastery = getSkillMastery(player, skill.id)
              return (
                <div key={skill.id} className="char-skill-item char-mastery-item">
                  <div className="char-mastery-line">
                    <span className="char-skill-name">{skill.name}</span>
                    <span className={`skill-mastery-rank ${mastery >= 100 ? "mastered" : ""}`}>
                      {getSkillMasteryLabel(mastery)} · {mastery}/100
                    </span>
                  </div>
                  <div
                    className="skill-mastery-track compact"
                    role="progressbar"
                    aria-label={`${skill.name}熟练度`}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={mastery}
                  >
                    <span style={{ width: `${mastery}%` }} />
                  </div>
                  <div className="char-skill-detail">
                    <span className="char-skill-desc">{skill.description}</span>
                    <span className="skill-mastery-bonus">{getMasteryBonusText(skill, mastery)}</span>
                  </div>
                </div>
              )
            })}
          </div>
        ))}
        {player.skills.length === 0 && <p className="hint">尚未习得任何武功。</p>}
      </section>
    </div>
  )
}
