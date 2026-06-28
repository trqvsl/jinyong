import { useState } from "react"
import type { Player, Enemy } from "./types"
import { savePlayer } from "./game/player"
import { getLocationById } from "./data/map"
import { applyRelationChanges } from "./game/relations"
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
import { getAdventureEnemy, getStoryEventByLocation } from "./data/events"
import { getEnemyById } from "./data/enemies"
import "./App.css"

type Screen = "title" | "main" | "battle" | "sect" | "character" | "shop" | "event" | "map" | "debug" | "npc"

function App() {
  const [player, setPlayer] = useState<Player | null>(null)
  const [screen, setScreen] = useState<Screen>("title")
  const [enemies, setEnemies] = useState<Enemy[]>([])
  const [storyEvent, setStoryEvent] = useState<ReturnType<typeof getStoryEventByLocation> | null>(null)
  // 当前所选地点（用于抽取该地点专属事件与敌人池）
  const [locationId, setLocationId] = useState<string | null>(null)

  function handleSelectPlayer(p: Player) { savePlayer(p); setPlayer(p); setScreen("main") }
  function handleUpdate(p: Player) { savePlayer(p); setPlayer(p) }
  function handleAdventure() {
    setScreen("map")
  }
  // 在地图上选定一个地点 → 触发该地点的事件
  // 鍦ㄥ湴鍥句笂閫夊畾涓€涓湴鐐?鈫?瑙﹀彂璇ュ湴鐐圭殑浜嬩欢
  function handleSelectLocation(locId: string) {
    if (!player) return
    const loc = getLocationById(locId)
    if (!loc) return
    setLocationId(locId)
    setStoryEvent(getStoryEventByLocation(player, loc.events))
    setScreen("event")
  }

  function handleEventResolve(result: { player: Player; startBattle?: boolean; consumeDay?: boolean; enemyId?: string; relationChanges?: { npcId: string; delta: number }[] }) {
    let nextPlayer = result.consumeDay ? { ...result.player, day: result.player.day + 1 } : result.player
    nextPlayer = applyRelationChanges(nextPlayer, result.relationChanges)
    savePlayer(nextPlayer)
    setPlayer(nextPlayer)

    const loc = locationId ? getLocationById(locationId) : undefined
    const locPool = loc?.enemyPool ?? []
    if (result.startBattle) {
      setEnemies([getAdventureEnemy(nextPlayer, result.enemyId, locPool)])
      setScreen("battle")
    } else {
      setStoryEvent(null)
      setScreen("main")
    }
  }

  function handleBattleEnd(result: { player: Player; outcome: "won" | "lost" }) {
    // result.player 已由 BattleScreen 用 applyVictoryGrowth 算好（含经验/银两/升级）
    const finalPlayer: Player = result.outcome === "won"
      ? { ...result.player, day: result.player.day + 1 }
      : result.player
    savePlayer(finalPlayer); setPlayer(finalPlayer)
    setScreen("main"); setEnemies([])
  }

  // 调试屏：指定敌人直接进入战斗（用于验证战斗手感）
  // NPC 切磋：把 NPC 转 Enemy 进战斗
  function handleChallengeNpc(enemy: Enemy) {
    if (!player) return
    setEnemies([enemy])
    setScreen("battle")
  }
  function handleTestBattle(enemyIds: string[]) {
    if (!player) return
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
          onNpc={() => setScreen("npc")}
          onDebug={() => setScreen("debug")}
        />
      )}
      {screen === "event" && player && storyEvent && <EventScreen player={player} event={storyEvent} onResolve={handleEventResolve} />}
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
