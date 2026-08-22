import { useEffect, useState } from "react"
import type { Player, Enemy } from "./types"
import type { Transition, StoryEvent } from "./data/events"
import type { StoryCheckpoint } from "./data/story/schema"
import type { BattleObjectiveConfig, BattleOutcome } from "./game/battle"
import { savePlayer } from "./game/player"
import { getEnemyById } from "./data/enemies"
import { applyPartySupportToPlayer, getPartyBondBonuses, getPartySupportBonuses, getPartySupportTotals, getBattleSupportOpeningLines } from "./game/party"
import {
  createBattleEntryCommand,
  createMainViewCommand,
  getBattleTeammates,
  getPendingWorldEvents,
  normalizeMainPlayer,
  openLocationStory,
  openPendingWorldEvent,
  resumePausedStory,
  restoreStoryCheckpoint,
  resolveBattleFlow,
  resolveStoryFlow,
  setStoryCheckpoint,
  type AppViewCommand,
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
import { EndingRecordScreen } from "./screens/EndingRecordScreen"
import { AreaScreen } from "./screens/AreaScreen"
import "./App.css"

type Screen = "title" | "main" | "battle" | "sect" | "character" | "shop" | "event" | "map" | "area" | "debug" | "npc" | "ending-record"

function App() {
  const [player, setPlayer] = useState<Player | null>(null)
  const [screen, setScreen] = useState<Screen>("title")
  const [enemies, setEnemies] = useState<Enemy[]>([])
  const [storyEvent, setStoryEvent] = useState<StoryEvent | null>(null)
  const [locationId, setLocationId] = useState<string | null>(null)
  // 剧情节点流转状态
  const [storyNodeId, setStoryNodeId] = useState<string>("main")
  const [storyInitialPageIndex, setStoryInitialPageIndex] = useState(0)
  const [storyInitialResult, setStoryInitialResult] = useState<{ text: string; transition: Transition; title?: string; consumedDay: boolean } | undefined>(undefined)
  const [areaPlaceId, setAreaPlaceId] = useState<string | null>(null)
  const [areaUtilityReturn, setAreaUtilityReturn] = useState(false)
  const [battleReturnAreaId, setBattleReturnAreaId] = useState<string | null>(null)
  // 当前战斗对应的 transition（剧情战斗用；调试/NPC切磋为 null）
  const [pendingBattleTransition, setPendingBattleTransition] = useState<Transition | null>(null)
  const [battleAllyIds, setBattleAllyIds] = useState<string[]>([])
  const [battleObjective, setBattleObjective] = useState<BattleObjectiveConfig | undefined>(undefined)
  // NPC 切磋时的 npcId，战后结算关系后果
  const [challengeNpcId, setChallengeNpcId] = useState<string | null>(null)

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0 })
  }, [screen])

  function applyViewCommand(command: AppViewCommand) {
    switch (command.type) {
      case "show-main":
        setStoryEvent(null)
        setStoryInitialResult(undefined)
        setStoryInitialPageIndex(0)
        setLocationId(null)
        setPendingBattleTransition(null)
        setBattleAllyIds([])
        setBattleObjective(undefined)
        setChallengeNpcId(null)
        setEnemies([])
        setAreaPlaceId(null)
        setAreaUtilityReturn(false)
        setBattleReturnAreaId(null)
        setScreen("main")
        return
      case "show-area":
        setStoryEvent(null)
        setStoryInitialResult(undefined)
        setStoryInitialPageIndex(0)
        setLocationId(command.locationId)
        setPendingBattleTransition(null)
        setBattleAllyIds([])
        setBattleObjective(undefined)
        setChallengeNpcId(null)
        setEnemies([])
        setAreaPlaceId(null)
        setAreaUtilityReturn(false)
        setBattleReturnAreaId(null)
        setScreen("area")
        return
      case "show-event-entry":
        setStoryEvent(command.event)
        setStoryNodeId(command.nodeId)
        setStoryInitialPageIndex(command.pageIndex)
        setStoryInitialResult(command.initialResult)
        setLocationId(command.locationId)
        setPendingBattleTransition(null)
        setBattleAllyIds([])
        setBattleObjective(undefined)
        setChallengeNpcId(null)
        setEnemies([])
        setAreaPlaceId(null)
        setAreaUtilityReturn(false)
        setBattleReturnAreaId(null)
        setScreen("event")
        return
      case "show-event-result":
        setStoryInitialResult({
          text: command.text,
          transition: command.transition,
          title: storyEvent?.nodes[storyNodeId]?.title,
          consumedDay: false,
        })
        setStoryInitialPageIndex(0)
        setPendingBattleTransition(null)
        setBattleAllyIds([])
        setBattleObjective(undefined)
        setChallengeNpcId(null)
        setEnemies([])
        setAreaPlaceId(null)
        setAreaUtilityReturn(false)
        setBattleReturnAreaId(null)
        setScreen("event")
        return
      case "show-battle":
        if (command.storyContext) {
          setStoryEvent(command.storyContext.event)
          setStoryNodeId(command.storyContext.nodeId)
          setStoryInitialResult(undefined)
          setStoryInitialPageIndex(0)
          setLocationId(command.storyContext.locationId)
        }
        setPendingBattleTransition(command.pendingBattleTransition)
        setBattleAllyIds(command.allyIds)
        setBattleObjective(command.battleObjective)
        setChallengeNpcId(command.challengeNpcId)
        setEnemies(command.enemies)
        setScreen("battle")
        return
    }
  }

  function returnToMain(nextPlayer: Player) {
    const finalPlayer = normalizeMainPlayer(nextPlayer)
    savePlayer(finalPlayer)
    setPlayer(finalPlayer)
    applyViewCommand(createMainViewCommand())
  }

  function handleOpenPendingWorldEvent(eventId: string) {
    if (!player) return
    const result = openPendingWorldEvent({ player, eventId })
    savePlayer(result.player)
    setPlayer(result.player)
    if (result.command.type === "show-main") {
      returnToMain(result.player)
      return
    }
    applyViewCommand(result.command)
  }

  function handleSelectPlayer(p: Player) {
    const restored = restoreStoryCheckpoint(p)
    savePlayer(restored.player)
    setPlayer(restored.player)
    if (restored.command) {
      applyViewCommand(restored.command)
      return
    }
    returnToMain(restored.player)
  }
  function handleUpdate(p: Player) { savePlayer(p); setPlayer(p) }
  function handleAdventure() { setScreen("map") }

  function handleResumeAreaStory() {
    if (!player) return
    const resumed = resumePausedStory(player)
    savePlayer(resumed.player)
    setPlayer(resumed.player)
    setAreaPlaceId(null)
    if (resumed.command) applyViewCommand(resumed.command)
  }

  function handleAreaShop(spotId: string) {
    setAreaPlaceId(spotId)
    setAreaUtilityReturn(true)
    setScreen("shop")
  }

  function handleAreaInventory(spotId: string) {
    setAreaPlaceId(spotId)
    setAreaUtilityReturn(true)
    setScreen("character")
  }

  function returnToAreaUtility() {
    setAreaUtilityReturn(false)
    setScreen("area")
  }

  function handleAreaChallenge(enemy: Enemy, npcId: string, spotId: string) {
    if (!player || !locationId) return
    setAreaPlaceId(spotId)
    setBattleReturnAreaId(locationId)
    applyViewCommand(createBattleEntryCommand({
      enemies: [enemy],
      challengeNpcId: npcId,
    }))
  }

  // 地图选地点 → 触发该地点剧情事件
  function handleSelectLocation(locId: string) {
    if (!player) return
    const result = openLocationStory({ player, locationId: locId })
    if (!result) return
    savePlayer(result.player)
    setPlayer(result.player)
    applyViewCommand(result.command)
  }

  function handleStoryCheckpoint(nextPlayer: Player, checkpoint: StoryCheckpoint) {
    const checkpointed = setStoryCheckpoint(nextPlayer, checkpoint)
    savePlayer(checkpointed)
    setPlayer(checkpointed)
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

    if (result.command.type === "goto-node") {
      setStoryInitialResult(undefined)
      setStoryInitialPageIndex(0)
      setStoryNodeId(result.command.nodeId)
      return
    }

    if (result.command.type === "show-main") {
      returnToMain(result.player)
      return
    }

    applyViewCommand(result.command)
  }

  // 战斗结束：剧情战斗按 onWin/onLose/onFlee 衔接收尾；非剧情战斗直接回主菜单
  function handleBattleEnd(result: { player: Player; outcome: BattleOutcome }) {
    const flow = resolveBattleFlow({
      player: result.player,
      outcome: result.outcome,
      pendingBattleTransition,
      challengeNpcId,
    })
    const nextPlayer = battleReturnAreaId && !pendingBattleTransition
      ? { ...flow.player, hp: flow.player.hpMax, mp: flow.player.mpMax }
      : flow.player
    savePlayer(nextPlayer)
    setPlayer(nextPlayer)

    if (battleReturnAreaId && !pendingBattleTransition) {
      setEnemies([])
      setPendingBattleTransition(null)
      setBattleAllyIds([])
      setBattleObjective(undefined)
      setChallengeNpcId(null)
      setBattleReturnAreaId(null)
      setScreen("area")
      return
    }

    if (flow.command.type === "show-main") {
      returnToMain(nextPlayer)
      return
    }

    applyViewCommand(flow.command)
  }

  // NPC 切磋：把 NPC 转 Enemy 进战斗（非剧情，战后回主菜单+结算关系）
  function handleChallengeNpc(enemy: Enemy, npcId?: string) {
    if (!player) return
    setBattleReturnAreaId(null)
    applyViewCommand(createBattleEntryCommand({ enemies: [enemy], challengeNpcId: npcId ?? null }))
  }
  // 调试屏：指定敌人直接进战斗（非剧情）
  function handleTestBattle(
    enemyIds: string[],
    options?: { allyIds?: string[]; objective?: BattleObjectiveConfig },
  ) {
    if (!player) return
    setBattleReturnAreaId(null)
    applyViewCommand(createBattleEntryCommand({
      enemies: enemyIds.map((id) => getEnemyById(id)),
      allyIds: options?.allyIds,
      battleObjective: options?.objective,
    }))
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
  const battleTeammates = player ? getBattleTeammates(player, battleAllyIds) : []

  return (
    <div className="app">
      {screen === "title" && <TitleScreen onSelectPlayer={handleSelectPlayer} />}
      {screen === "main" && player && (
        <MainScreen player={player} pendingWorldEvents={getPendingWorldEvents(player)} onOpenPendingWorldEvent={handleOpenPendingWorldEvent} onAdventure={handleAdventure}
          onSect={() => setScreen("sect")} onCharacter={() => { setAreaUtilityReturn(false); setScreen("character") }} onShop={() => { setAreaUtilityReturn(false); setScreen("shop") }}
          onNpc={() => setScreen("npc")} onDebug={() => setScreen("debug")} onEndingRecord={() => setScreen("ending-record")}
        />
      )}
      {screen === "event" && player && storyEvent && (
        <EventScreen
          key={`${storyEvent.id}:${storyNodeId}-${storyInitialResult ? "r" : "c"}`}
          player={player} event={storyEvent} nodeId={storyNodeId}
          initialPageIndex={storyInitialPageIndex}
          initialResult={storyInitialResult}
          onCheckpoint={handleStoryCheckpoint}
          onResolve={handleStoryResolve}
        />
      )}
      {screen === "map" && player && <MapScreen player={player} onSelect={handleSelectLocation} onBack={() => returnToMain(player)} />}
      {screen === "area" && player && (
        <AreaScreen
          player={player}
          initialSpotId={areaPlaceId}
          onResume={handleResumeAreaStory}
          onOpenShop={handleAreaShop}
          onOpenInventory={handleAreaInventory}
          onChallenge={handleAreaChallenge}
          onExit={() => { setAreaPlaceId(null); returnToMain(player) }}
        />
      )}
      {screen === "debug" && player && <DebugScreen player={player} onUpdate={handleUpdate} onBack={() => returnToMain(player)} onTestBattle={handleTestBattle} />}
      {screen === "npc" && player && <NpcScreen player={player} onUpdate={handleUpdate} onChallenge={handleChallengeNpc} onBack={() => returnToMain(player)} />}
      {screen === "battle" && player && battlePlayer && enemies.length > 0 && <BattleScreen player={player} battlePlayer={battlePlayer} enemies={enemies} teammates={battleTeammates} objective={battleObjective} partySupportBonuses={activePartyBonuses} partyBondBonuses={activePartyBondBonuses} partySupportTotals={activePartyTotals} openingSupportLines={battleSupportOpeningLines} onEnd={handleBattleEnd} />}
      {screen === "sect" && player && <SectScreen player={player} onLearn={handleLearn} onBack={() => returnToMain(player)} />}
      {screen === "character" && player && <CharacterScreen player={player} onUpdate={handleUpdate} onBack={areaUtilityReturn ? returnToAreaUtility : () => returnToMain(player)} mode={areaUtilityReturn ? "inventory" : "full"} locationName={areaUtilityReturn ? "牛家村 · 行旅整备" : undefined} />}
      {screen === "shop" && player && <ShopScreen player={player} onUpdate={handleUpdate} onBack={areaUtilityReturn ? returnToAreaUtility : () => returnToMain(player)} shopName={areaUtilityReturn ? "酒馆柜台" : undefined} shopkeeper={areaUtilityReturn ? "曲三" : undefined} />}
      {screen === "ending-record" && player && <EndingRecordScreen player={player} onBack={() => returnToMain(player)} />}
    </div>
  )
}
export default App
