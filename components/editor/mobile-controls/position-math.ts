import { computeRowLayout } from "@/lib/editor/screenshot-layout"
import { screenshotPositionAnchor } from "@/lib/editor/store"
import type {
  AspectState,
  DeviceFrame,
  ScreenshotPosition,
} from "@/lib/editor/store"
import type { ScreenshotSlot } from "@/lib/editor/state-types"

export type PercentPoint = { xPct: number; yPct: number }
type PercentBox = PercentPoint & { widthPct: number; heightPct: number }

const BASE_CANVAS_WIDTH = 1100

export function clampPercent(value: number) {
  return Math.max(0, Math.min(100, value))
}

export function positionIdFromPercent(
  xPct: number,
  yPct: number
): ScreenshotPosition {
  const col = Math.round(Math.max(0, Math.min(4, xPct / 25)))
  const row = Math.round(Math.max(0, Math.min(4, yPct / 25)))
  if (col === 2 && row === 2) return "center"
  return `${row}-${col}` as ScreenshotPosition
}

function canvasDimsFromAspect(aspect: AspectState) {
  const aw = aspect.w || 16
  const ah = aspect.h || 10
  return {
    width: BASE_CANVAS_WIDTH,
    height: (BASE_CANVAS_WIDTH * ah) / aw,
    ratio: aw / ah,
  }
}

export function mainScreenshotPositionPct({
  aspect,
  frame,
  position,
  offset,
  slots,
}: {
  aspect: AspectState
  frame: DeviceFrame
  position: ScreenshotPosition
  offset: { x: number; y: number }
  slots: ScreenshotSlot[]
}): PercentPoint {
  const dims = canvasDimsFromAspect(aspect)

  if (slots.length > 0) {
    const rowLayout = computeRowLayout(
      [
        { id: "__main__", frame },
        ...slots.map((slot) => ({ id: slot.id, frame })),
      ],
      dims.ratio
    )
    const mainLayout = rowLayout[0]
    if (mainLayout) {
      const anchor = screenshotPositionAnchor(position)
      const baseX = position === "center" ? mainLayout.xPct : anchor.x
      const baseY = position === "center" ? 50 : anchor.y
      return {
        xPct: baseX + (offset.x / dims.width) * 100,
        yPct: baseY + (offset.y / dims.height) * 100,
      }
    }
  }

  const anchor = screenshotPositionAnchor(position)
  return {
    xPct: anchor.x + (offset.x / dims.width) * 100,
    yPct: anchor.y + (offset.y / dims.height) * 100,
  }
}

export function mainScreenshotOffsetForPoint({
  aspect,
  frame,
  position,
  slots,
  point,
}: {
  aspect: AspectState
  frame: DeviceFrame
  position: ScreenshotPosition
  slots: ScreenshotSlot[]
  point: PercentPoint
}) {
  const dims = canvasDimsFromAspect(aspect)
  const anchor = screenshotPositionAnchor(position)
  let baseX = anchor.x
  let baseY = anchor.y

  if (slots.length > 0 && position === "center") {
    const rowLayout = computeRowLayout(
      [
        { id: "__main__", frame },
        ...slots.map((slot) => ({ id: slot.id, frame })),
      ],
      dims.ratio
    )
    const mainLayout = rowLayout[0]
    if (mainLayout) {
      baseX = mainLayout.xPct
      baseY = 50
    }
  }

  return {
    x: ((point.xPct - baseX) / 100) * dims.width,
    y: ((point.yPct - baseY) / 100) * dims.height,
  }
}

export function screenshotSlotGroupCenter(slots: ScreenshotSlot[]) {
  if (slots.length === 0) return null
  const boxes: PercentBox[] = slots.map((slot) => ({
    xPct: slot.xPct,
    yPct: slot.yPct,
    widthPct: slot.widthPct,
    heightPct: slot.heightPct,
  }))
  const bounds = boxes.reduce(
    (acc, box) => ({
      minX: Math.min(acc.minX, box.xPct - box.widthPct / 2),
      maxX: Math.max(acc.maxX, box.xPct + box.widthPct / 2),
      minY: Math.min(acc.minY, box.yPct - box.heightPct / 2),
      maxY: Math.max(acc.maxY, box.yPct + box.heightPct / 2),
    }),
    {
      minX: Number.POSITIVE_INFINITY,
      maxX: Number.NEGATIVE_INFINITY,
      minY: Number.POSITIVE_INFINITY,
      maxY: Number.NEGATIVE_INFINITY,
    }
  )
  return {
    xPct: clampPercent((bounds.minX + bounds.maxX) / 2),
    yPct: clampPercent((bounds.minY + bounds.maxY) / 2),
  }
}
