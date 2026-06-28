// ============================================================
// 剧情模块入口：按作品分卷汇总
// 每卷一个文件（shendiao.ts、tianlong.ts …），导出该卷的事件数组。
// 新增作品只需新建文件 + 在这里汇总，events.ts 的查询函数会自动纳入。
// ============================================================

import type { StoryEvent } from "../events"
import { SHENDIAO_STORY } from "./shendiao"

// 所有剧情卷的汇总（通用随机奇遇仍在 events.ts，不在此处）
export const STORY_VOLUMES: StoryEvent[] = [
  ...SHENDIAO_STORY,
]

// 按作品列出的卷名（供将来做"剧情进度/图鉴"用）
export const VOLUME_NAMES = ["射雕英雄传"] as const

// 按 id 取剧情事件
export function getStoryEventFromVolumes(id: string): StoryEvent | undefined {
  return STORY_VOLUMES.find((event) => event.id === id)
}
