import { useState } from "react"
import type { Player, Enemy } from "./types"
import { savePlayer } from "./game/player"
import { getRandomEnemy } from "./data/enemies"
import { TitleScreen } from "./screens/TitleScreen"
import { MainScreen } from "./screens/MainScreen"
import { BattleScreen } from "./screens/BattleScreen"
import { SectScreen } from "./screens/SectScreen"
import { CharacterScreen } from "./screens/CharacterScreen"
import "./App.css"

type Screen = "title" | "main" | "battle" | "sect" | "character"

function App() {
  const [player, setPlayer] = useState<Player | null>(null)
  const [screen, setScreen] = useState<Screen>("title")
  const [enemy, setEnemy] = useState<Enemy | null>(null)

  function handleSelectPlayer(p: Player) { savePlayer(p); setPlayer(p); setScreen("main") }
  function handleUpdate(p: Player) { savePlayer(p); setPlayer(p) }
  function handleAdventure() { if (!player) return; setEnemy(getRandomEnemy()); setScreen("battle") }

  function handleBattleEnd(result: { player: Player; outcome: "won" | "lost" }) {
    if (result.outcome === "lost") {
      const recovered: Player = { ...result.player, hp: Math.max(1, Math.round(result.player.hpMax * 0.3)) }
      savePlayer(recovered); setPlayer(recovered)
    } else {
      const advanced: Player = { ...result.player, day: result.player.day + 1 }
      savePlayer(advanced); setPlayer(advanced)
    }
    setScreen("main"); setEnemy(null)
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
          onSect={() => setScreen("sect")} onCharacter={() => setScreen("character")} />
      )}
      {screen === "battle" && player && enemy && <BattleScreen player={player} enemy={enemy} onEnd={handleBattleEnd} />}
      {screen === "sect" && player && <SectScreen player={player} onLearn={handleLearn} onBack={() => setScreen("main")} />}
      {screen === "character" && player && <CharacterScreen player={player} onUpdate={handleUpdate} onBack={() => setScreen("main")} />}
    </div>
  )
}
export default App