import type { StoryEvent } from "../data/events"
import type { Consequence } from "../data/story/schema"

const PAGE_CHAR_LIMIT = 110

export interface ScriptSegment {
  type: "narration" | "dialogue"
  text: string
  speaker?: string
}

export interface LetterMeta {
  tag: string
  seal: string
  className: string
}

export function getLetterMeta(event: StoryEvent, title?: string): LetterMeta {
  switch (event.letterStyle) {
    case "formal":
      return { tag: "书信", seal: "全真封", className: "letter-formal" }
    case "note":
      if (title?.includes("传讯")) return { tag: "传讯", seal: "雕羽传书", className: "letter-note" }
      return { tag: "字条", seal: "草绳结", className: "letter-note" }
    case "secret":
      return { tag: "密帖", seal: "蛇纹印", className: "letter-secret" }
    default:
      if (title?.includes("密帖")) return { tag: "密帖", seal: "墨迹未干", className: "letter-secret" }
      if (title?.includes("传讯")) return { tag: "传讯", seal: "墨迹未干", className: "letter-note" }
      if (title?.includes("良药")) return { tag: "字条", seal: "墨迹未干", className: "letter-note" }
      return { tag: "书信", seal: "墨迹未干", className: "letter-formal" }
  }
}

export function getEventTag(event: StoryEvent, title?: string): string {
  if (event.presentation === "letter") return getLetterMeta(event, title).tag
  return "见闻"
}

function splitTextChunks(text: string): string[] {
  const normalized = text.trim()
  if (!normalized) return [""]

  const paragraphs = normalized
    .split(/\n{2,}/)
    .map((part) => part.trim())
    .filter(Boolean)

  const chunks: string[] = []
  for (const paragraph of paragraphs.length > 0 ? paragraphs : [normalized]) {
    const sentences = paragraph
      .split(/(?<=[。！？；])/)
      .map((part) => part.trim())
      .filter(Boolean)

    let current = ""
    for (const sentence of sentences.length > 0 ? sentences : [paragraph]) {
      if (!current) {
        current = sentence
        continue
      }
      if ((current + sentence).length > PAGE_CHAR_LIMIT) {
        chunks.push(current)
        current = sentence
      } else {
        current += sentence
      }
    }
    if (current) chunks.push(current)
  }

  return chunks.length > 0 ? chunks : [normalized]
}

function splitNarrationChunks(text: string): string[] {
  const normalized = text.trim()
  if (!normalized) return [""]

  const sentences = normalized
    .split(/(?<=[。！？；])/)
    .map((part) => part.trim())
    .filter(Boolean)

  const chunks: string[] = []
  let current = ""
  for (const sentence of sentences.length > 0 ? sentences : [normalized]) {
    if (!current) {
      current = sentence
      continue
    }
    if ((current + sentence).length > PAGE_CHAR_LIMIT) {
      chunks.push(current)
      current = sentence
    } else {
      current += sentence
    }
  }
  if (current) chunks.push(current)

  return chunks.length > 0 ? chunks : [normalized]
}

function extractDialogueCue(context: string, fallbackSpeaker?: string): { narration: string; speaker?: string } {
  const trimmed = context.trim()
  if (!trimmed) return { narration: "", speaker: fallbackSpeaker }

  const cuePatterns = [
    /^(.*?)([一-龥A-Za-z0-9·]{2,8})[:：]\s*$/,
    /^(.*?)([一-龥A-Za-z0-9·]{2,8})(?:说道|说|问道|问|答道|答|喝道|道)[:：]?\s*$/,
  ]

  for (const pattern of cuePatterns) {
    const match = trimmed.match(pattern)
    if (match?.[2]) {
      return {
        narration: match[1].trim().replace(/[，、；：:]+$/, ""),
        speaker: match[2],
      }
    }
  }

  return { narration: trimmed, speaker: fallbackSpeaker }
}

function parseStorySegments(text: string, fallbackSpeaker?: string): ScriptSegment[] {
  const normalized = text.trim()
  if (!normalized) return [{ type: "narration", text: "" }]

  const quoteRegex = /“([^”]+)”|"([^"]+)"/g
  const segments: ScriptSegment[] = []
  let cursor = 0
  let matched = false

  for (const match of normalized.matchAll(quoteRegex)) {
    matched = true
    const full = match[0]
    const quote = (match[1] ?? match[2] ?? "").trim()
    const index = match.index ?? 0
    const before = normalized.slice(cursor, index).trim()
    const cue = extractDialogueCue(before, fallbackSpeaker)
    if (cue.narration) segments.push({ type: "narration", text: cue.narration })
    if (quote) segments.push({ type: "dialogue", text: quote, speaker: cue.speaker })
    cursor = index + full.length
  }

  const after = normalized.slice(cursor).trim()
  if (after) segments.push({ type: "narration", text: after })

  if (!matched) return [{ type: fallbackSpeaker ? "dialogue" : "narration", text: normalized, speaker: fallbackSpeaker }]
  return segments.length > 0 ? segments : [{ type: "narration", text: normalized }]
}

export function buildScriptPages(text: string, fallbackSpeaker?: string): ScriptSegment[][] {
  const segments = parseStorySegments(text, fallbackSpeaker)
  const pages: ScriptSegment[][] = []
  let currentPage: ScriptSegment[] = []
  let currentChars = 0

  for (const segment of segments) {
    const chunks = segment.type === "narration" ? splitNarrationChunks(segment.text) : splitTextChunks(segment.text)
    for (const chunk of chunks) {
      if (currentPage.length > 0 && currentChars + chunk.length > PAGE_CHAR_LIMIT) {
        pages.push(currentPage)
        currentPage = []
        currentChars = 0
      }
      currentPage.push({ ...segment, text: chunk })
      currentChars += chunk.length

      // 剧情演出按“一拍一个说话人”推进，避免同页堆成聊天记录。
      if (segment.type === "dialogue") {
        pages.push(currentPage)
        currentPage = []
        currentChars = 0
      }
    }
  }

  if (currentPage.length > 0) pages.push(currentPage)
  return pages.length > 0 ? pages : [[{ type: "narration", text: text.trim() }]]
}

export function mergeLetterPageText(page: ScriptSegment[]): string {
  return page
    .map((segment) => segment.type === "dialogue" ? `${segment.speaker ? `${segment.speaker}：` : ""}“${segment.text}”` : segment.text)
    .join("\n\n")
}

export function summarizeConsequences(consequences?: Consequence[]): string[] {
  if (!consequences || consequences.length === 0) return []

  const summary: string[] = []
  for (const consequence of consequences) {
    switch (consequence.kind) {
      case "aptitude":
        summary.push((consequence.delta ?? 0) >= 0 ? "悟性提升" : "悟性受挫")
        break
      case "reputation":
        summary.push((consequence.delta ?? 0) >= 0 ? "名声上升" : "名声受损")
        break
      case "karma":
        summary.push((consequence.delta ?? 0) >= 0 ? "行止偏正" : "行止偏邪")
        break
      case "gold":
        summary.push((consequence.delta ?? 0) >= 0 ? "获得银两" : "花费银两")
        break
      case "hp":
        summary.push((consequence.delta ?? 0) >= 0 ? "气血恢复" : "受到伤势")
        break
      case "mp":
        summary.push((consequence.delta ?? 0) >= 0 ? "内息增长" : "内力消耗")
        break
      case "attack":
        summary.push((consequence.delta ?? 0) >= 0 ? "攻击提升" : "攻击受挫")
        break
      case "speed":
        summary.push((consequence.delta ?? 0) >= 0 ? "身法提升" : "身法受挫")
        break
      case "exp":
        summary.push((consequence.delta ?? 0) >= 0 ? "阅历增长" : "阅历受损")
        break
      case "item":
        summary.push((consequence.count ?? 1) >= 0 ? "获得物品" : "失去物品")
        break
      case "skill":
        summary.push("习得武功")
        break
      case "relation":
        summary.push((consequence.delta ?? 0) >= 0 ? "关系加深" : "关系生变")
        break
      default:
        break
    }
  }

  return Array.from(new Set(summary))
}
