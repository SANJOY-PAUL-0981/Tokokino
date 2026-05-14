import { isBrowserFrame } from "@/lib/browser-frame"
import { DEVICE_MOCKUP_SPECS } from "@/lib/mockups"

import type { DeviceFrame } from "@/lib/editor/state-types"

export const SLOT_ROW_MARGIN = 1
export const SLOT_ROW_GAP = 2

const TARGET_HEIGHT_PCT = 60
const SOLO_HEIGHT_PCT = 70
const BROWSER_FRAME_ASPECT = 16 / 10
const NONE_LANDSCAPE_ASPECT = 16 / 10
const NONE_PORTRAIT_ASPECT = 10 / 14

export function frameNaturalAspect(frame: DeviceFrame): number | null {
  if (frame.id === "none") return null
  if (isBrowserFrame(frame.id)) return BROWSER_FRAME_ASPECT
  const spec = DEVICE_MOCKUP_SPECS[frame.id]
  if (!spec) return null
  const [w, h] = spec.aspectRatio.split("/").map((part) => Number(part.trim()))
  if (!w || !h) return null
  const natural = w / h
  if (frame.orientation === "horizontal" && natural < 1) return 1 / natural
  return natural
}

function noneFallbackAspect(canvasAspect: number) {
  return canvasAspect < 0.85 ? NONE_PORTRAIT_ASPECT : NONE_LANDSCAPE_ASPECT
}

export function slotBoxAspectRatio(
  frame: DeviceFrame,
  canvasAspect: number,
  naturalDims?: { w: number; h: number } | null
): string {
  if (frame.id === "none") {
    if (naturalDims && naturalDims.w > 0 && naturalDims.h > 0) {
      return `${naturalDims.w} / ${naturalDims.h}`
    }
    return canvasAspect < 0.85 ? "10 / 14" : "16 / 10"
  }
  const aspect = frameNaturalAspect(frame) ?? noneFallbackAspect(canvasAspect)
  return String(aspect)
}

function widthPctFromHeightBudget(
  frame: DeviceFrame,
  canvasAspect: number,
  targetHeightPct: number
): number {
  const aspect = frameNaturalAspect(frame) ?? noneFallbackAspect(canvasAspect)
  return (targetHeightPct * aspect) / canvasAspect
}

export type RowItemInput = { id: string; frame: DeviceFrame }
export type RowItemLayout = { id: string; widthPct: number; xPct: number }

export function computeRowLayout(
  items: RowItemInput[],
  canvasAspect: number
): RowItemLayout[] {
  if (items.length === 0) return []

  const target = items.length === 1 ? SOLO_HEIGHT_PCT : TARGET_HEIGHT_PCT
  const widths = items.map((item) =>
    widthPctFromHeightBudget(item.frame, canvasAspect, target)
  )

  const totalGaps = SLOT_ROW_GAP * (items.length - 1)
  const usableW = 100 - 2 * SLOT_ROW_MARGIN
  const totalRaw = widths.reduce((acc, w) => acc + w, 0) + totalGaps

  if (totalRaw > usableW) {
    const widthBudget = usableW - totalGaps
    const widthSum = widths.reduce((acc, w) => acc + w, 0)
    const scale = widthSum > 0 ? widthBudget / widthSum : 1
    for (let i = 0; i < widths.length; i++) widths[i] = widths[i] * scale
  }

  const totalW = widths.reduce((acc, w) => acc + w, 0) + totalGaps
  const startX = 50 - totalW / 2
  let cursor = startX
  return items.map((item, i) => {
    const w = widths[i]
    const x = cursor + w / 2
    cursor += w + SLOT_ROW_GAP
    return { id: item.id, widthPct: w, xPct: x }
  })
}
