import { describe, expect, it } from "vitest"
import type { Player } from "../src/types"
import type { StoryEvent, Transition } from "../src/data/story/schema"
import {
  normalizeMainPlayer,
  openLocationStory,
  resolveStoryFlow,
} from "../src/game/appFlow"
import { createPlayer } from "../src/game/player"
import { getShendiaoEndingRecord } from "../src/game/story/endingRecord"
import {
  enterNode,
  resolveBattleOutcome,
  resolveChoice,
  visibleChoices,
} from "../src/game/story/engine"
import { getStoryProgress } from "../src/game/story/query"

const MODERN_STORY_JOURNEY = [
  ["shendiao-niujia-opening", "niujia"],
  ["shendiao-damos", "damos"],
  ["shendiao-zhangjiakou", "zhangjiakou"],
  ["shendiao-zhongdu", "zhongdu"],
  ["shendiao-taihu", "taihu"],
  ["shendiao-guiyunzhuang", "guiyunzhuang"],
  ["shendiao-taohua-act4", "taohuadao"],
  ["shendiao-linan-act5", "linan"],
  ["shendiao-niujia-act5", "niujia"],
  ["shendiao-junshan-act5", "junshan"],
  ["shendiao-tiezhang-act5", "tiezhangfeng"],
  ["shendiao-blackmarsh-act5", "blackmarsh"],
  ["shendiao-yideng-act5", "yidengju"],
  ["shendiao-niujia-act6", "niujia"],
  ["shendiao-taohua-blood-act6", "taohuadao"],
  ["shendiao-yanyulou-act6", "yanyulou"],
  ["shendiao-tieqiangmiao-act6", "tieqiangmiao"],
  ["shendiao-damos-act7", "damos"],
  ["shendiao-western-camp-act7", "western-camp"],
  ["shendiao-samarkand-scout-act7", "samarkand"],
  ["shendiao-samarkand-siege-act7", "samarkand"],
  ["shendiao-samarkand-aftermath-act7", "samarkand"],
  ["shendiao-damos-home-order-act7", "damos"],
  ["shendiao-damos-departure-act7", "damos"],
  ["shendiao-huashan-arrival-act8", "huashan"],
  ["shendiao-huashan-testimony-act8", "huashan"],
  ["shendiao-huashan-crisis-act8", "huashan"],
  ["shendiao-huashan-contest-act8", "huashan"],
  ["shendiao-huashan-epilogue-act8", "huashan"],
] as const

function createJourneyPlayer(): Player {
  const player = createPlayer("完整旅程")
  return {
    ...player,
    level: 35,
    reputation: 60,
    karma: 20,
    relations: {
      guojing: 40,
      huangrong: 40,
      "huangyaoshi-npc": 30,
      hongqigong: 30,
      huazheng: 30,
      liping: 30,
      munianci: 30,
      qiuchuji: 20,
      luyoujiao: 20,
    },
  }
}

function resolveTransition(
  player: Player,
  event: StoryEvent,
  locationId: string,
  transition: Transition,
  consumedDay: boolean,
): {
  player: Player
  nextNodeId?: string
  ended: boolean
} {
  let flow = resolveStoryFlow({
    player,
    transition,
    consumedDay,
    currentStoryEvent: event,
    locationId,
  })

  while (flow.command.type === "show-battle") {
    const battle = flow.command.pendingBattleTransition
    if (!battle) throw new Error(`Missing battle transition in ${event.id}`)
    const outcome = resolveBattleOutcome(
      flow.player,
      flow.player.world,
      battle,
      "won",
    )
    if (!outcome) throw new Error(`Cannot resolve battle in ${event.id}`)
    flow = resolveStoryFlow({
      player: outcome.player,
      transition: outcome.then,
      consumedDay: false,
      currentStoryEvent: event,
      locationId,
    })
  }

  if (flow.command.type === "goto-node") {
    return {
      player: flow.player,
      nextNodeId: flow.command.nodeId,
      ended: false,
    }
  }
  if (flow.command.type === "show-main") {
    return {
      player: normalizeMainPlayer(flow.player),
      ended: true,
    }
  }
  throw new Error(`Unexpected ${flow.command.type} while playing ${event.id}`)
}

function playEvent(
  player: Player,
  expectedEventId: string,
  locationId: string,
): Player {
  const opened = openLocationStory({ player, locationId })
  if (!opened || opened.command.type !== "show-event-entry") {
    throw new Error(`Cannot open ${expectedEventId} at ${locationId}`)
  }
  expect(opened.command.event.id).toBe(expectedEventId)

  const event = opened.command.event
  let currentPlayer = opened.player
  let nodeId = opened.command.nodeId

  for (let step = 0; step < 500; step++) {
    const entered = enterNode(
      currentPlayer,
      currentPlayer.world,
      event,
      nodeId,
    )
    if (!entered) throw new Error(`Missing ${event.id}.${nodeId}`)
    currentPlayer = entered.player

    let transition: Transition
    let consumedDay = false
    if (entered.node.choices && entered.node.choices.length > 0) {
      const choices = visibleChoices(
        currentPlayer,
        currentPlayer.world,
        entered.node,
      )
      if (choices.length === 0) {
        throw new Error(`No visible choices at ${event.id}.${nodeId}`)
      }
      const choice = choices[0]
      const resolved = resolveChoice(
        currentPlayer,
        currentPlayer.world,
        event,
        nodeId,
        choice.id,
      )
      if (!resolved) {
        throw new Error(`Cannot resolve ${event.id}.${nodeId}.${choice.id}`)
      }
      currentPlayer = resolved.player
      transition = resolved.transition
      consumedDay = choice.consumeDay ?? false
    } else {
      transition = entered.node.autoNext ?? { type: "end" }
    }

    const advanced = resolveTransition(
      currentPlayer,
      event,
      locationId,
      transition,
      consumedDay,
    )
    currentPlayer = advanced.player
    if (advanced.ended) return currentPlayer
    nodeId = advanced.nextNodeId!
  }

  throw new Error(`Exceeded step limit in ${event.id}`)
}

describe("complete modern story journey", () => {
  it("plays all 29 main events from act one through the ending archive", () => {
    let player = normalizeMainPlayer(createJourneyPlayer())
    const visited: string[] = []

    for (const [eventId, locationId] of MODERN_STORY_JOURNEY) {
      player = playEvent(player, eventId, locationId)
      visited.push(eventId)
    }

    const progress = getStoryProgress(player)
    const record = getShendiaoEndingRecord(player)
    expect(visited).toEqual(MODERN_STORY_JOURNEY.map(([eventId]) => eventId))
    expect(progress.isComplete).toBe(true)
    expect(progress.completed).toBe(8)
    expect(player.world.arcs.shendiao.beats["act8-huashan"]).toBe("done")
    expect(player.world.arcs.shendiao.ending).toBeTruthy()
    expect(record?.sections).toHaveLength(5)
    expect(player.world.pendingWorldEvents[0]).toMatch(
      /^world-act8-echo-/,
    )
    expect(visited).not.toContain("shendiao-huashan")
  })
})
