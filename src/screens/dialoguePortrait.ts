import {
  DIALOGUE_PORTRAIT_ALIASES,
  DIALOGUE_PORTRAITS,
  type DialoguePortrait,
} from "../data/dialoguePortraits"

export function getDialoguePortrait(
  speaker: string | undefined,
): DialoguePortrait | undefined {
  if (!speaker) return undefined
  const canonicalName = DIALOGUE_PORTRAIT_ALIASES[speaker] ?? speaker
  return DIALOGUE_PORTRAITS[canonicalName]
}

export function getDialoguePortraitFallback(
  speaker: string | undefined,
): string {
  const normalized = speaker?.trim() || "江湖"
  return normalized.length > 2 ? normalized.slice(-2) : normalized
}
