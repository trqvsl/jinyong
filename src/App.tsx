import { useState } from "react"
import type { Player, Enemy } from "./types"
import type { Transition, StoryEvent } from "./data/events"
import { savePlayer } from "./game/player"
import { getLocationById } from "./data/map"
import { getStoryEventByLocation, getStoryEventById, getAdventureEnemy } from "./data/events"
import { resolveBranch, pickRandom, resolveBattleOutcome } from "./game/story/engine"
import { getEnemyById } from "./data/enemies"
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

  function handleSelectPlayer(p: Player) { savePlayer(p); setPlayer(p); setScreen("main") }
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
    let p = r.player
    if (r.consumedDay) p = { ...p, day: p.day + 1 }
    // 先解析 branch（纯路由），再解析 random（带随机），循环处理嵌套
    let t = resolveBranch(p, p.world, r.transition)
    while (t.type === "random") t = resolveBranch(p, p.world, pickRandom(t.cases))
    // 一次性剧情节点 end 时标记完成，下次不再触发
    if (t.type === "end" && storyEvent?.once && !p.world.completedEvents.includes(storyEvent.id)) {
      p = { ...p, world: { ...p.world, completedEvents: [...p.world.completedEvents, storyEvent.id] } }
    }
    savePlayer(p); setPlayer(p)

    switch (t.type) {
      case "end":
        setStoryEvent(null); setStoryInitialResult(undefined)
        setScreen("main")
        break
      case "goto":
        setStoryInitialResult(undefined)
        setStoryNodeId(t.nodeId)             // EventScreen remount 到新节点
        break
      case "battle": {
        setPendingBattleTransition(t)
        const loc = locationId ? getLocationById(locationId) : undefined
        setEnemies([getAdventureEnemy(p, t.enemyId, t.useLocationPool ? loc?.enemyPool : undefined)])
        setScreen("battle")
        break
      }
      case "gotoEvent": {
        const ev = getStoryEventById(t.eventId)
        if (ev) { setStoryEvent(ev); setStoryNodeId(ev.entryNode); setStoryInitialResult(undefined) }
        else { setStoryEvent(null); setScreen("main") }
        break
      }
      case "gameOver":
        // 阶段4 接多结局系统；当前简化为回主菜单
        setStoryEvent(null); setStoryInitialResult(undefined)
        setScreen("main")
        break
      default: // branch/random 理论上已解析完
        setStoryEvent(null); setScreen("main")
    }
  }

  // 战斗结束：剧情战斗按 onWin/onLose/onFlee 衔接收尾；非剧情战斗直接回主菜单
  function handleBattleEnd(result: { player: Player; outcome: "won" | "lost" | "fled" }) {
    if (!pendingBattleTransition) {
      // 调试 / NPC 切磋：胜利算 1 天，回主菜单
      const finalPlayer = result.outcome === "won" ? { ...result.player, day: result.player.day + 1 } : result.player
      savePlayer(finalPlayer); setPlayer(finalPlayer)
      setScreen("main"); setEnemies([])
      return
    }
    const bt = pendingBattleTransition
    setPendingBattleTransition(null)
    setEnemies([])

    // 致命战斗战败 → 结局
    if (result.outcome === "lost" && bt.type === "battle" && bt.lethal) {
      setStoryInitialResult({ text: "你力战不敌，命丧于此……这一遭，江湖路竟走到了尽头。", transition: { type: "gameOver" } })
      setScreen("event")
      return
    }

    const ot = resolveBattleOutcome(result.player, result.player.world, bt, result.outcome)
    if (!ot) { setScreen("main"); return }
    savePlayer(ot.player); setPlayer(ot.player)
    setStoryInitialResult({ text: ot.text, transition: ot.then })
    setScreen("event")
  }

  // NPC 切磋：把 NPC 转 Enemy 进战斗（非剧情，战后回主菜单）
  function handleChallengeNpc(enemy: Enemy) {
    if (!player) return
    setPendingBattleTransition(null)
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

  return (
    <div className="app">
      {screen === "title" && <TitleScreen onSelectPlayer={handleSelectPlayer} />}
      {screen === "main" && player && (
        <MainScreen player={player} onUpdate={handleUpdate} onAdventure={handleAdventure}
          onSect={() => setScreen("sect")} onCharacter={() => setScreen("character")} onShop={() => setScreen("shop")}
          onNpc={() => setScreen("npc")} onDebug={() => setScreen("debug")}
        />
      )}
      {screen === "event" && player && storyEvent && (
        <EventScreen
          key={`${storyNodeId}-${storyInitialResult ? "r" : "c"}`}
          player={player} event={storyEvent} nodeId={storyNodeId}
          initialResult={storyInitialResult} onResolve={handleStoryResolve}
        />
      )}
      {screen === "map" && player && <MapScreen player={player} onSelect={handleSelectLocation} onBack={() => setScreen("main")} />}
      {screen === "debug" && player && <DebugScreen player={player} onUpdate={handleUpdate} onBack={() => setScreen("main")} onTestBattle={handleTestBattle} />}
      {screen === "npc" && player && <NpcScreen player={player} onUpdate={handleUpdate} onChallenge={handleChallengeNpc} onBack={() => setScreen("main")} />}
      {screen === "battle" && player && enemies.length > 0 && <BattleScreen player={player} enemies={enemies} onEnd={handleBattleEnd} />}
      {screen === "sect" && player && <SectScreen player={player} onLearn={handleLearn} onBack={() => setScreen("main")} />}
      {screen === "character" && player && <CharacterScreen player={player} onUpdate={handleUpdate} onBack={() => setScreen("main")} />}
      {screen === "shop" && player && <ShopScreen player={player} onUpdate={handleUpdate} onBack={() => setScreen("main")} />}
    </div>
  )
}
export default App
