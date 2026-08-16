import { describe, expect, it } from "vitest"
import { DIALOGUE_PORTRAITS } from "../src/data/dialoguePortraits"
import { getEnemyById } from "../src/data/enemies"
import { getNpcById } from "../src/data/npcs"
import { STORY_VOLUMES } from "../src/data/story"
import { STORY_AREA_MAPS } from "../src/data/story/areaMaps"
import {
  normalizeMainPlayer,
  openLocationStory,
  resumePausedStory,
  resolveStoryFlow,
  restoreStoryCheckpoint,
} from "../src/game/appFlow"
import { createPlayer } from "../src/game/player"
import { getDialoguePortrait } from "../src/screens/dialoguePortrait"

function getActOne() {
  const event = STORY_VOLUMES.find((item) => item.id === "shendiao-niujia-opening")
  if (!event) throw new Error("Missing modern act one")
  return event
}

describe("act one RPG vertical slice", () => {
  it("introduces the opening cast before using their names", () => {
    const event = getActOne()
    const riverbank = event.nodes.riverbank.text
    const jingkang = event.nodes["riverbank-jingkang"].text
    const riverbankQusan = event.nodes["riverbank-qusan"].text
    const tavern = event.nodes["qusan-tavern"].text
    const yangtiexin = event.nodes["tavern-yangtiexin"].text
    const qusan = event.nodes["tavern-qusan"].text

    expect(riverbank).toContain("梨花木板横在膝上")
    expect(riverbank).toContain("张十五：")
    expect(jingkang).toContain("背负双戟的是郭啸天")
    expect(jingkang).toContain("杨家枪传人杨铁心")
    expect(riverbankQusan).toContain("跛脚掌柜曲三")
    expect(tavern).toContain("郭啸天：")
    expect(yangtiexin).toContain("杨铁心：")
    expect(qusan).toContain("曲三：")
    expect(qusan).toContain("郭啸天：")
  })

  it("has generated portraits and entrance titles for the first-act cast", () => {
    expect(getDialoguePortrait("长春子丘处机")).toMatchObject({
      name: "丘处机",
      title: "全真长春子",
    })
    for (const name of ["郭啸天", "杨铁心", "曲三", "包惜弱", "李萍", "完颜洪烈"]) {
      expect(DIALOGUE_PORTRAITS[name]?.title).toBeTruthy()
      expect(DIALOGUE_PORTRAITS[name]?.src).toContain("text_to_image")
    }
  })

  it("keeps the whole tavern cast on stage and animates Shagu chasing a rooster", () => {
    const event = getActOne()
    const tavern = event.nodes["qusan-tavern"]
    const chase = event.nodes["tavern-shagu-chase"]
    const qiuClash = event.nodes["qiu-clash"]

    expect(tavern.stage).toMatchObject({
      sceneId: "qusan-tavern",
      sceneLabel: "牛家村 · 曲三酒店",
    })
    expect(tavern.stage?.actors?.map((actor) => actor.name)).toEqual([
      "郭啸天",
      "杨铁心",
      "曲三",
      "傻姑",
    ])
    expect(tavern.stage?.props).toBeUndefined()
    expect(chase.stage?.props).toContainEqual({
      id: "rooster",
      slot: "far-right",
      motion: "run-left",
      label: "被傻姑追赶的公鸡",
    })
    expect(event.nodes["tavern-nightfall"].stage?.props).toBeUndefined()
    expect(qiuClash.stage?.actors).toEqual(expect.arrayContaining([
      expect.objectContaining({ name: "杨铁心", motion: "lunge-right" }),
      expect.objectContaining({ name: "长春子丘处机", motion: "lunge-left" }),
    ]))
  })

  it("uses travel actions for scene changes and removes low-impact choices", () => {
    const event = getActOne()
    expect(event.nodes.riverbank.choices).toBeUndefined()
    expect(event.nodes.riverbank.autoNext).toEqual({
      type: "goto",
      nodeId: "riverbank-jingkang",
    })
    expect(event.nodes["riverbank-jingkang"].autoNext).toEqual({
      type: "goto",
      nodeId: "riverbank-wumu",
    })
    expect(event.nodes["riverbank-wumu"].autoNext).toEqual({
      type: "goto",
      nodeId: "riverbank-qusan",
    })
    expect(event.nodes["riverbank-departure"].text).toContain("收场三响")
    expect(event.nodes["riverbank-departure"].text).toContain("用麻绳把木板系到背后")
    expect(event.nodes["riverbank-departure"].choices).toEqual([
      expect.objectContaining({
        id: "go-tavern",
        kind: "travel",
        transition: { type: "goto", nodeId: "qusan-tavern" },
      }),
    ])
    expect(event.nodes["qusan-tavern"].choices).toBeUndefined()
    expect(event.nodes["tavern-qusan"].text).toContain("曲掌柜还知道些什么")
    expect(event.nodes["tavern-shagu-chase"].text).toContain("好利落的身手")
    expect(event.nodes["tavern-closing"].sceneTransition).toMatchObject({
      timeLabel: "酉时 · 日暮",
      tone: "dusk",
    })
    expect(event.nodes["tavern-first-watch"].sceneTransition?.timeLabel).toBe("戌时")
    expect(event.nodes["tavern-second-watch"].sceneTransition?.timeLabel).toBe("亥时")
    expect(event.nodes["tavern-nightfall"].sceneTransition?.timeLabel).toBe("子时")
    expect(event.nodes["tavern-nightfall"].choices).toEqual([
      expect.objectContaining({
        id: "go-west-grove",
        kind: "travel",
        transition: { type: "goto", nodeId: "qusan-night" },
      }),
    ])
    expect(event.nodes["qusan-night"].text).toContain("三名黑衣人")
    expect(event.nodes["qusan-night"].text).not.toContain("曲三没有否认")
    expect(event.nodes["qusan-night-guoyang"].text).toContain("这些是宫里的人")
    expect(event.nodes["qusan-night-account"].text).toContain("人是从临安跟来的")
    expect(event.nodes["qusan-night-account"].choices).toHaveLength(3)
    expect(event.nodes["qiu-arrival"].choices).toBeUndefined()
    expect(event.nodes["qiu-clash"].choices).toHaveLength(2)
    expect(event.nodes["qiu-clash"].text).not.toContain("贫道认错了人")
    expect(event.nodes["qiu-recognition"].text).toContain("贫道认错了人")
    expect(event.nodes["qiu-aftermath"].choices).toHaveLength(2)
  })

  it("opens the first visit on the village map before starting at the riverbank", () => {
    const player = createPlayer("地图入口")
    const opened = openLocationStory({ player, locationId: "niujia" })

    expect(opened?.command).toEqual({ type: "show-area", locationId: "niujia" })
    expect(opened?.player.world.currentStory).toMatchObject({
      eventId: "shendiao-niujia-opening",
      nodeId: "riverbank",
      locationId: "niujia",
      paused: true,
      areaEntry: true,
    })

    const started = resumePausedStory(opened!.player)
    expect(started.command).toMatchObject({
      type: "show-event-entry",
      nodeId: "riverbank",
      locationId: "niujia",
    })
    expect(started.player.world.currentStory).toMatchObject({
      paused: false,
      areaEntry: false,
    })
  })

  it("pauses without completing the event and resumes from the same location", () => {
    const event = getActOne()
    const player = createPlayer("暂离测试")
    const paused = resolveStoryFlow({
      player,
      transition: { type: "pause", nodeId: "main" },
      consumedDay: false,
      currentStoryEvent: event,
      locationId: "niujia",
    })

    expect(paused.command).toEqual({ type: "show-area", locationId: "niujia" })
    expect(paused.player.world.currentStory).toMatchObject({
      eventId: event.id,
      nodeId: "main",
      locationId: "niujia",
      paused: true,
    })
    expect(paused.player.world.completedEvents).not.toContain(event.id)
    expect(restoreStoryCheckpoint(paused.player).command).toEqual({
      type: "show-area",
      locationId: "niujia",
    })
    expect(normalizeMainPlayer(paused.player).world.currentStory?.paused).toBe(true)

    const resumed = openLocationStory({
      player: paused.player,
      locationId: "niujia",
    })
    expect(resumed?.command).toEqual({
      type: "show-area",
      locationId: "niujia",
    })

    const continued = resumePausedStory(resumed!.player)
    expect(continued.command).toMatchObject({
      type: "show-event-entry",
      nodeId: "main",
      locationId: "niujia",
    })
    expect(continued.player.world.currentStory?.paused).toBe(false)
  })

  it("gives preparation breaks and a winnable supported tutorial battle", () => {
    const event = getActOne()
    const qiuChoice = event.nodes["qiu-aftermath"].choices?.[0]
    const monthsLater = event.nodes["months-later"]
    const battleChoice = event.nodes["raid-righteous"].choices?.find(
      (choice) => choice.id === "help-guoxiao",
    )
    if (battleChoice?.transition.type !== "battle") {
      throw new Error("Missing first-act tutorial battle")
    }

    expect(qiuChoice?.transition).toEqual({ type: "pause", nodeId: "main" })
    expect(qiuChoice?.consequences).toContainEqual({ kind: "exp", delta: 40 })
    expect(monthsLater.onEnter).toContainEqual({ kind: "exp", delta: 60 })
    expect(monthsLater.autoNext).toEqual({
      type: "pause",
      nodeId: "wait-righteous",
    })

    const enemy = getEnemyById(battleChoice.transition.enemyId)
    const ally = getNpcById("guoxiaotian")
    const player = createPlayer("首战测试")
    expect(battleChoice.transition.allyIds).toContain("guoxiaotian")
    expect(battleChoice.transition.objective).toMatchObject({
      kind: "defeatAll",
      protectAllyId: "guoxiaotian",
    })
    expect(enemy.id).toBe("jin-village-raider")
    expect(enemy.attack).toBeLessThan(player.attack)
    expect(enemy.hp).toBeLessThan(ally!.combat.hp)
    expect(ally!.combat.attack).toBeGreaterThan(enemy.defense * 3)
  })

  it("maps every village spot to an independent space and uses a coach for training", () => {
    const area = STORY_AREA_MAPS.find((item) => item.locationId === "niujia")!
    expect(area.spots.find((spot) => spot.id === "riverbank")?.storyTargets).toContainEqual({
      eventId: "shendiao-niujia-opening",
      nodeId: "riverbank",
    })
    expect(area.spots.find((spot) => spot.id === "yang-backyard")?.storyTargets).toContainEqual({
      eventId: "shendiao-niujia-opening",
      nodeId: "main",
    })
    expect(area.spots.find((spot) => spot.id === "ruined-tavern")?.storyTargets).toContainEqual({
      eventId: "shendiao-niujia-opening",
      nodeId: "wait-righteous",
    })
    expect(area.spots.map((spot) => spot.kind)).toEqual(
      expect.arrayContaining(["story", "training", "exit", "scenery"]),
    )
    expect(area.spots.every((spot) =>
      !!spot.space.background
      && !!spot.space.description
      && spot.space.actions.length > 0
    )).toBe(true)

    const tavern = area.spots.find((spot) => spot.id === "qusan-tavern")!
    expect(tavern.space.actions.map((action) => action.kind)).toEqual(
      expect.arrayContaining(["talk", "shop", "inventory"]),
    )

    const trainingGround = area.spots.find((spot) => spot.id === "training-ground")!
    expect(trainingGround.space.residents).toContainEqual(
      expect.objectContaining({ name: "陆教头" }),
    )
    expect(trainingGround.space.actions).toContainEqual(
      expect.objectContaining({
        kind: "spar",
        npcId: "niujia-coach",
      }),
    )
    expect(getNpcById("niujia-coach")).toMatchObject({
      name: "陆教头",
      locationId: "niujia",
    })
    const coach = getNpcById("niujia-coach")!
    const novice = createPlayer("过招验收")
    expect(coach.combat.attack).toBeLessThanOrEqual(novice.defense)
    expect(coach.combat.hp).toBeLessThan(novice.hp)
  })
})
