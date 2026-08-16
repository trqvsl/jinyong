import { useEffect, useState } from "react"
import { LoaderCircle } from "lucide-react"
import type { Player } from "../types"
import { hasSave, loadPlayer } from "../game/player"
import {
  DIALOGUE_PORTRAITS,
  FIRST_ACT_PORTRAIT_NAMES,
} from "../data/dialoguePortraits"
import {
  FIRST_ACT_STAGE_PROP_PRELOAD_IDS,
  FIRST_ACT_STAGE_PRELOAD_IDS,
  STORY_STAGE_BACKGROUNDS,
  STORY_STAGE_PROP_ASSETS,
} from "../data/story/stageAssets"
import { STORY_AREA_MAPS } from "../data/story/areaMaps"
import { preloadImage, preloadImages } from "./imagePreloader"

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
  const [openingReady, setOpeningReady] = useState(false)
  const saved = hasSave()

  useEffect(() => {
    let cancelled = false
    const villageMap = STORY_AREA_MAPS.find((area) => area.locationId === "niujia")
    const mapAssets = [villageMap?.background].filter((src): src is string => !!src)
    const riverbankAssets = [
      STORY_STAGE_BACKGROUNDS["niujia-riverbank"],
      ...["张十五", "郭啸天", "杨铁心", "曲三"]
        .map((name) => DIALOGUE_PORTRAITS[name]?.src),
    ].filter((src): src is string => !!src)
    const tavernAssets = [
      STORY_STAGE_BACKGROUNDS["qusan-tavern"],
      DIALOGUE_PORTRAITS.傻姑?.src,
      STORY_STAGE_PROP_ASSETS.rooster?.src,
    ].filter((src): src is string => !!src)
    const snowAssets = [
      STORY_STAGE_BACKGROUNDS["niujia-west-grove"],
      STORY_STAGE_BACKGROUNDS["niujia-snow-courtyard"],
      DIALOGUE_PORTRAITS.丘处机?.src,
    ].filter((src): src is string => !!src)
    const priorityAssets = [
      ...mapAssets,
      ...riverbankAssets,
      ...tavernAssets,
      ...snowAssets,
    ]
    const deferredAssets = [
      ...FIRST_ACT_PORTRAIT_NAMES.map((name) => DIALOGUE_PORTRAITS[name]?.src),
      ...FIRST_ACT_STAGE_PRELOAD_IDS.map((sceneId) => STORY_STAGE_BACKGROUNDS[sceneId]),
      ...FIRST_ACT_STAGE_PROP_PRELOAD_IDS.map((propId) => STORY_STAGE_PROP_ASSETS[propId].src),
    ].filter((src): src is string =>
      !!src && !priorityAssets.includes(src)
    )

    preloadImages(mapAssets).then(() => {
      if (!cancelled) setOpeningReady(true)
      return preloadImages(riverbankAssets)
    }).then(() => {
      return preloadImages(tavernAssets)
    }).then(() => {
      return preloadImages(snowAssets)
    }).then(async () => {
      for (const src of deferredAssets) {
        await preloadImage(src)
      }
    })

    return () => {
      cancelled = true
    }
  }, [])

  function startNewGame() {
    setShowNameInput(true)
  }

  function continueGame() {
    const p = loadPlayer()
    if (p) onSelectPlayer(p)
  }

  function confirmName() {
    if (!openingReady) return
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
          <button
            className="menu-btn primary title-enter-btn"
            onClick={confirmName}
            disabled={!openingReady}
            aria-busy={!openingReady}
          >
            {!openingReady && <LoaderCircle size={16} />}
            {openingReady ? "踏入江湖" : "牛家村载入中"}
          </button>
        </div>
      )}
    </div>
  )
}
