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
import { getAdventureEnemy, getStoryEventByLocation, type EventChoiceResult, type AfterBattleEpilogue } from "./data/events"
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
  // 剧情战斗的战后收尾配置：战斗由剧情触发时记下，结束后回事件屏播放收尾
  const [pendingAfterBattle, setPendingAfterBattle] = useState<AfterBattleEpilogue | null>(null)

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

  function handleEventResolve(result: EventChoiceResult) {
    let nextPlayer = result.consumeDay ? { ...result.player, day: result.player.day + 1 } : result.player
    nextPlayer = applyRelationChanges(nextPlayer, result.relationChanges)
    savePlayer(nextPlayer)
    setPlayer(nextPlayer)

    const loc = locationId ? getLocationById(locationId) : undefined
    const locPool = loc?.enemyPool ?? []
    if (result.startBattle) {
      // 记下战后收尾，待战斗结束回放（无 afterBattle 的战斗仍直接回主菜单）
      setPendingAfterBattle(result.afterBattle ?? null)
      setEnemies([getAdventureEnemy(nextPlayer, result.enemyId, locPool)])
      setScreen("battle")
    } else {
      setStoryEvent(null)
      setScreen("main")
    }
  }

  function handleBattleEnd(result: { player: Player; outcome: "won" | "lost" | "fled" }) {
    const epilogue = pendingAfterBattle
    setPendingAfterBattle(null)
    setEnemies([])
    // 剧情战斗的天数已在 handleEventResolve（consumeDay）里结算过，此处不再加；
    // 调试/NPC 切磋等非剧情战斗，胜利时才算 1 天（修复原先剧情战斗天数被重复 +1 的问题）。
    const finalPlayer: Player = result.outcome === "won" && !epilogue
      ? { ...result.player, day: result.player.day + 1 }
      : result.player
    savePlayer(finalPlayer); setPlayer(finalPlayer)

    // 若是剧情触发的战斗，回到事件屏播放战后收尾；否则（调试/NPC 切磋）直接回主菜单
    if (epilogue) {
      let text: string
      let p = finalPlayer
      if (result.outcome === "won") {
        text = epilogue.victoryText
        if (epilogue.victoryRewards) p = epilogue.victoryRewards(finalPlayer)
      } else if (result.outcome === "fled") {
        text = epilogue.fledText ?? "你脱身而去，此事暂且作罢。"
      } else {
        text = epilogue.defeatText ?? "你力战不敌，黯然退去，须勤加修炼再图后举。"
      }
      if (p !== finalPlayer) { savePlayer(p); setPlayer(p) }
      // 用一个一次性"收尾事件"承载战后剧情，玩家点继续后回主菜单
      setStoryEvent({
        id: "after-battle-epilogue",
        title: result.outcome === "won" ? "得胜收尾" : result.outcome === "fled" ? "全身而退" : "力战不敌",
        summary: "",
        intro: text,
        choices: [
          { id: "done", text: "继续闯荡", description: "收拾心情，踏上新的旅程。", resolve: (pl) => ({ text: "你收拾心情，继续踏上江湖之路。", player: pl }) },
        ],
      })
      setScreen("event")
    } else {
      setScreen("main")
    }
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
