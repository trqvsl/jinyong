import { useState } from "react"
import type { Player, Enemy } from "./types"
import type { Transition, StoryEvent } from "./data/events"
import { savePlayer } from "./game/player"
import { getLocationById } from "./data/map"
import { getStoryEventByLocation, getStoryEventById } from "./game/story/query"
import { getEnemyById } from "./data/enemies"
import { applyPartySupportToPlayer, getPartyBondBonuses, getPartySupportBonuses, getPartySupportTotals, getBattleSupportOpeningLines } from "./game/party"
import {
  getPendingWorldEvents,
  dequeuePendingWorldEvent,
  getRecruitedTeammates,
  normalizeMainPlayer,
  resolveBattleFlow,
  resolveStoryFlow,
} from "./game/appFlow"
import { TitleScreen } from "./screens/TitleScreen"
import { MainScreen } from "./screens/MainScreen"
import { BattleScreen } from "./screens/BattleScreen"
import { SectScreen } from "./screens/SectScreen"
import { CharacterScreen } from "./screens/CharacterScreen"
import { ShopScreen } from "./screens/ShopScreen"
import { EventScreen } from "./screens/EventScreen"
import { MapScreen } from "./screens/MapScreen"
import { NpcScreen } from "./screens/NpcScreen"
import { DebugScreen } from "./screens/DebugScreen"
import "./App.css"

type Screen = "title" | "main" | "battle" | "sect" | "character" | "shop" | "event" | "map" | "debug" | "npc"

function App() {
  const [player, setPlayer] = useState<Player | null>(null)
  const [screen, setScreen] = useState<Screen>("title")
  const [enemies, setEnemies] = useState<Enemy[]>([])
  const [storyEvent, setStoryEvent] = useState<StoryEvent | null>(null)
  const [locationId, setLocationId] = useState<string | null>(null)
  // 剧情节点流转状态
  const [storyNodeId, setStoryNodeId] = useState<string>("main")
  const [storyInitialResult, setStoryInitialResult] = useState<{ text: string; transition: Transition } | undefined>(undefined)
  // 当前战斗对应的 transition（剧情战斗用；调试/NPC切磋为 null）
  const [pendingBattleTransition, setPendingBattleTransition] = useState<Transition | null>(null)
  // NPC 切磋时的 npcId，战后结算关系后果
  const [challengeNpcId, setChallengeNpcId] = useState<string | null>(null)

  function returnToMain(nextPlayer: Player) {
    const finalPlayer = normalizeMainPlayer(nextPlayer)
    savePlayer(finalPlayer)
    setPlayer(finalPlayer)
    setStoryEvent(null)
    setStoryInitialResult(undefined)
    setLocationId(null)
    setScreen("main")
  }

  function handleOpenPendingWorldEvent(eventId: string) {
    if (!player) return
    const pendingEvent = getStoryEventById(eventId)
    const clearedPlayer = dequeuePendingWorldEvent(player, eventId)
    savePlayer(clearedPlayer)
    setPlayer(clearedPlayer)

    if (!pendingEvent) {
      returnToMain(clearedPlayer)
      return
    }

    setStoryEvent(pendingEvent)
    setStoryNodeId(pendingEvent.entryNode)
    setStoryInitialResult(undefined)
    setLocationId(null)
    setScreen("event")
  }

  function handleSelectPlayer(p: Player) { returnToMain(p) }
  function handleUpdate(p: Player) { savePlayer(p); setPlayer(p) }
  function handleAdventure() { setScreen("map") }

  // 地图选地点 → 触发该地点剧情事件
  function handleSelectLocation(locId: string) {
    if (!player) return
    const loc = getLocationById(locId)
    if (!loc) return
    setLocationId(locId)
    const ev = getStoryEventByLocation(player, loc.events)
    setStoryEvent(ev)
    setStoryNodeId(ev.entryNode)
    setStoryInitialResult(undefined)
    setScreen("event")
  }

  // 剧情选项 / 战后结果 → 按 transition 路由（引擎驱动，App 只编排）
  function handleStoryResolve(r: { player: Player; transition: Transition; consumedDay: boolean }) {
    const result = resolveStoryFlow({
      player: r.player,
      transition: r.transition,
      consumedDay: r.consumedDay,
      currentStoryEvent: storyEvent,
      locationId,
    })
    savePlayer(result.player)
    setPlayer(result.player)

    switch (result.command.type) {
      case "return-main":
        returnToMain(result.player)
        return
      case "goto-node":
        setStoryInitialResult(undefined)
        setStoryNodeId(result.command.nodeId)
        return
      case "start-battle":
        setPendingBattleTransition(result.command.transition)
        setEnemies(result.command.enemies)
        setScreen("battle")
        return
      case "goto-event":
        setStoryEvent(result.command.event)
        setStoryNodeId(result.command.event.entryNode)
        setStoryInitialResult(undefined)
        return
    }
  }

  // 战斗结束：剧情战斗按 onWin/onLose/onFlee 衔接收尾；非剧情战斗直接回主菜单
  function handleBattleEnd(result: { player: Player; outcome: "won" | "lost" | "fled" }) {
    const flow = resolveBattleFlow({
      player: result.player,
      outcome: result.outcome,
      pendingBattleTransition,
      challengeNpcId,
    })
    setPendingBattleTransition(null)
    setChallengeNpcId(null)
    setEnemies([])
    savePlayer(flow.player)
    setPlayer(flow.player)

    if (flow.command.type === "return-main") {
      returnToMain(flow.player)
      return
    }

    setStoryInitialResult({ text: flow.command.text, transition: flow.command.transition })
    setScreen("event")
  }

  // NPC 切磋：把 NPC 转 Enemy 进战斗（非剧情，战后回主菜单+结算关系）
  function handleChallengeNpc(enemy: Enemy, npcId?: string) {
    if (!player) return
    setPendingBattleTransition(null)
    setChallengeNpcId(npcId ?? null)
    setEnemies([enemy])
    setScreen("battle")
  }
  // 调试屏：指定敌人直接进战斗（非剧情）
  function handleTestBattle(enemyIds: string[]) {
    if (!player) return
    setPendingBattleTransition(null)
    setEnemies(enemyIds.map((id) => getEnemyById(id)))
    setScreen("battle")
  }

  function handleLearn(p: Player) {
    const advanced: Player = { ...p, day: p.day + 1 }
    savePlayer(advanced); setPlayer(advanced)
  }

  const activePartyBonuses = player ? getPartySupportBonuses(player) : []
  const activePartyBondBonuses = player ? getPartyBondBonuses(player) : []
  const activePartyTotals = player ? getPartySupportTotals(player) : { attack: 0, defense: 0, speed: 0 }
  const battleSupportOpeningLines = player ? getBattleSupportOpeningLines(player) : []
  const battlePlayer = player ? applyPartySupportToPlayer(player) : null

  return (
    <div className="app">
      {screen === "title" && <TitleScreen onSelectPlayer={handleSelectPlayer} />}
      {screen === "main" && player && (
        <MainScreen player={player} pendingWorldEvents={getPendingWorldEvents(player)} onOpenPendingWorldEvent={handleOpenPendingWorldEvent} onUpdate={handleUpdate} onAdventure={handleAdventure}
          onSect={() => setScreen("sect")} onCharacter={() => setScreen("character")} onShop={() => setScreen("shop")}
          onNpc={() => setScreen("npc")} onDebug={() => setScreen("debug")}
        />
      )}
      {screen === "event" && player && storyEvent && (
        <EventScreen
          key={`${storyEvent.id}:${storyNodeId}-${storyInitialResult ? "r" : "c"}`}
          player={player} event={storyEvent} nodeId={storyNodeId}
          initialResult={storyInitialResult} onResolve={handleStoryResolve}
        />
      )}
      {screen === "map" && player && <MapScreen player={player} onSelect={handleSelectLocation} onBack={() => returnToMain(player)} />}
      {screen === "debug" && player && <DebugScreen player={player} onUpdate={handleUpdate} onBack={() => returnToMain(player)} onTestBattle={handleTestBattle} />}
      {screen === "npc" && player && <NpcScreen player={player} onUpdate={handleUpdate} onChallenge={handleChallengeNpc} onBack={() => returnToMain(player)} />}
      {screen === "battle" && player && battlePlayer && enemies.length > 0 && <BattleScreen player={player} battlePlayer={battlePlayer} enemies={enemies} teammates={getRecruitedTeammates(player)} partySupportBonuses={activePartyBonuses} partyBondBonuses={activePartyBondBonuses} partySupportTotals={activePartyTotals} openingSupportLines={battleSupportOpeningLines} onEnd={handleBattleEnd} />}
      {screen === "sect" && player && <SectScreen player={player} onLearn={handleLearn} onBack={() => returnToMain(player)} />}
      {screen === "character" && player && <CharacterScreen player={player} onUpdate={handleUpdate} onBack={() => returnToMain(player)} />}
      {screen === "shop" && player && <ShopScreen player={player} onUpdate={handleUpdate} onBack={() => returnToMain(player)} />}
    </div>
  )
}
export default App
