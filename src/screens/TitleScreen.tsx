import { useState } from "react"
import type { Player } from "../types"
import { hasSave, loadPlayer } from "../game/player"

// ============================================================
// 标题界面
// 游戏入口。显示游戏名、读取/开始新游戏。
// onSelectPlayer：把选定的角色传给上层，进入游戏。
// ============================================================

interface Props {
  onSelectPlayer: (player: Player) => void
}

export function TitleScreen({ onSelectPlayer }: Props) {
  const [showNameInput, setShowNameInput] = useState(false)
  const [name, setName] = useState("")
  const saved = hasSave()

  function startNewGame() {
    setShowNameInput(true)
  }

  function continueGame() {
    const p = loadPlayer()
    if (p) onSelectPlayer(p)
  }

  function confirmName() {
    const finalName = name.trim() || "无名小卒"
    // 通过 createPlayer 创建角色交给上层；这里先 import
    import("../game/player").then(({ createPlayer }) => {
      onSelectPlayer(createPlayer(finalName))
    })
  }

  return (
    <div className="title-screen">
      <h1 className="game-title">金庸群侠传</h1>
      <p className="game-subtitle">江湖路远，仗剑而行</p>

      {!showNameInput ? (
        <div className="title-buttons">
          {saved && (
            <button className="menu-btn primary" onClick={continueGame}>
              继续游戏
            </button>
          )}
          <button className="menu-btn" onClick={startNewGame}>
            开始新游戏
          </button>
        </div>
      ) : (
        <div className="name-input">
          <label>少侠请留名</label>
          <input
            type="text"
            value={name}
            maxLength={8}
            placeholder="无名小卒"
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && confirmName()}
            autoFocus
          />
          <button className="menu-btn primary" onClick={confirmName}>
            踏入江湖
          </button>
        </div>
      )}
    </div>
  )
}
