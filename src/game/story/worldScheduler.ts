import type { Player } from "../../types"
import type { StoryEvent, WorldState } from "../../data/story/schema"
import { WORLD_EVENTS } from "../../data/story/worldEvents"
import { checkCondition } from "./conditions"

// ============================================================
// 涌现事件调度器：每次回到主界面时扫描一次。
// - 每轮至多触发一个事件
// - once 事件会先写入 triggeredEvents，防止本轮反复触发
// - 无副作用条件查询；真正的剧情结算仍由 EventScreen + 引擎处理
// ============================================================

export function pollWorldEvent(
  player: Player,
  world: WorldState
): { player: Player; world: WorldState; event?: StoryEvent } {
  for (const worldEvent of WORLD_EVENTS) {
    if (worldEvent.once && world.triggeredEvents.includes(worldEvent.id)) continue
    if (!checkCondition(player, world, worldEvent.trigger)) continue

    const nextWorld = worldEvent.once
      ? { ...world, triggeredEvents: [...world.triggeredEvents, worldEvent.id] }
      : world
    const nextPlayer = nextWorld === world ? player : { ...player, world: nextWorld }

    return { player: nextPlayer, world: nextWorld, event: worldEvent.event }
  }

  return { player, world }
}
