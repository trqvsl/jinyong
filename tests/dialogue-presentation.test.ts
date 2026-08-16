import { describe, expect, it } from "vitest"
import {
  DIALOGUE_PORTRAITS,
} from "../src/data/dialoguePortraits"
import {
  getDialoguePortrait,
  getDialoguePortraitFallback,
} from "../src/screens/dialoguePortrait"
import { buildScriptPages } from "../src/screens/eventPresenter"

describe("RPG dialogue presentation", () => {
  it("separates narration, speaker name and spoken line", () => {
    const pages = buildScriptPages(
      "郭靖收起长弓，先看了一眼远处的骑队。郭靖：\"这条路我走前面。\"",
    )
    const dialoguePage = pages.find((page) =>
      page.some((segment) => segment.type === "dialogue")
    )!

    expect(dialoguePage).toEqual([
      {
        type: "narration",
        text: "郭靖收起长弓，先看了一眼远处的骑队。",
      },
      {
        type: "dialogue",
        text: "这条路我走前面。",
        speaker: "郭靖",
      },
    ])
  })

  it("resolves aliases to the same generated portrait", () => {
    expect(getDialoguePortrait("小叫花")).toBe(DIALOGUE_PORTRAITS.黄蓉)
    expect(getDialoguePortrait("长春子丘处机")).toBe(DIALOGUE_PORTRAITS.丘处机)
    expect(getDialoguePortrait("穆易")).toBe(DIALOGUE_PORTRAITS.杨铁心)
  })

  it("keeps unknown speakers readable with a short fallback mark", () => {
    expect(getDialoguePortrait("城外医者")).toBeUndefined()
    expect(getDialoguePortraitFallback("城外医者")).toBe("医者")
    expect(getDialoguePortraitFallback(undefined)).toBe("江湖")
  })

  it("uses only generated portrait resources and keeps every URL unique", () => {
    const urls = Object.values(DIALOGUE_PORTRAITS).map((portrait) => portrait.src)
    expect(urls.length).toBeGreaterThanOrEqual(12)
    expect(new Set(urls).size).toBe(urls.length)
    expect(urls.every((url) =>
      url.startsWith(
        "https://copilot-cn.bytedance.net/api/ide/v1/text_to_image?prompt=",
      )
      && url.endsWith("&image_size=portrait_4_3")
    )).toBe(true)
  })
})
