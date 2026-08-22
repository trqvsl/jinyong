import { useEffect, useState } from "react"
import {
  BadgeCheck,
  FlaskConical,
  HeartPulse,
  Package,
  ScrollText,
} from "lucide-react"
import type { ItemDef } from "../data/items"

interface Props {
  item: ItemDef
  className?: string
  decorative?: boolean
}

function ItemGlyph({ item }: { item: ItemDef }) {
  if (item.id === "small-hp-pill") return <HeartPulse size={32} />
  if (item.id === "small-mp-pill") return <FlaskConical size={32} />
  if (item.id === "field-ration") return <Package size={32} />
  if (item.category === "特殊") return <ScrollText size={32} />
  return <BadgeCheck size={32} />
}

async function isGeneratedImage(blob: Blob): Promise<boolean> {
  const bitmap = await createImageBitmap(blob)
  const canvas = document.createElement("canvas")
  canvas.width = 12
  canvas.height = 12
  const context = canvas.getContext("2d", { willReadFrequently: true })
  if (!context) {
    bitmap.close()
    return false
  }

  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close()
  const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data
  let lightness = 0
  let lightnessSquared = 0
  const count = pixels.length / 4

  for (let index = 0; index < pixels.length; index += 4) {
    const value = pixels[index] * 0.2126
      + pixels[index + 1] * 0.7152
      + pixels[index + 2] * 0.0722
    lightness += value
    lightnessSquared += value * value
  }

  const average = lightness / count
  const variance = lightnessSquared / count - average * average
  return average < 205 || variance > 1200
}

export function ItemArtwork({ item, className = "", decorative = false }: Props) {
  const [generatedSrc, setGeneratedSrc] = useState("")

  useEffect(() => {
    let cancelled = false
    let retryTimer = 0
    let objectUrl = ""
    let attempt = 0

    async function load() {
      try {
        const separator = item.image.includes("?") ? "&" : "?"
        const response = await fetch(
          `${item.image}${separator}preview_retry=${attempt}`,
          { cache: "no-store" },
        )
        if (!response.ok) throw new Error(`Image request failed: ${response.status}`)
        const blob = await response.blob()
        if (await isGeneratedImage(blob)) {
          objectUrl = URL.createObjectURL(blob)
          if (!cancelled) setGeneratedSrc(objectUrl)
          return
        }
      } catch {
        // The icon plate remains visible while the external image is unavailable.
      }

      attempt += 1
      if (!cancelled && attempt < 6) {
        retryTimer = window.setTimeout(load, 8000)
      }
    }

    setGeneratedSrc("")
    void load()
    return () => {
      cancelled = true
      window.clearTimeout(retryTimer)
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [item.image])

  return (
    <div className={`item-artwork ${generatedSrc ? "is-generated" : "is-pending"} ${className}`.trim()}>
      <div className="item-artwork-fallback" aria-hidden="true">
        <ItemGlyph item={item} />
        <span>{item.name}</span>
      </div>
      {generatedSrc && (
        <img
          src={generatedSrc}
          alt={decorative ? "" : item.name}
          aria-hidden={decorative || undefined}
        />
      )}
    </div>
  )
}
