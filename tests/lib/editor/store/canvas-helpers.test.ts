import { describe, expect, it } from "vitest"

import {
  applySlotStyleDefaults,
  CANVAS_BASE_W,
  CANVAS_GAP,
  createScreenshotSlot,
  duplicateLayerItem,
  migrateLegacySlot,
  placementAfterCanvas,
  removeSlotFromRow,
  scaleScreenshotOffsetForAspectChange,
} from "@/lib/editor/store/canvas-helpers"
import { createCanvas } from "@/lib/editor/store/defaults"
import type { DeviceFrame } from "@/lib/editor/state-types"

const frame: DeviceFrame = {
  id: "none",
  color: "black",
  orientation: "vertical",
}

describe("canvas store helpers", () => {
  it("scales screenshot offset Y when the canvas aspect changes", () => {
    expect(
      scaleScreenshotOffsetForAspectChange({ x: 12, y: 50 }, 16 / 10, 9 / 16)
    ).toEqual({ x: 12, y: 50 * (1100 / (9 / 16) / (1100 / (16 / 10))) })
  })

  it("reflows remaining slots after deleting a row-layout slot", () => {
    const first = createScreenshotSlot({ id: "first" }, 1)
    const second = createScreenshotSlot({ id: "second" }, 2)
    const reflowed = removeSlotFromRow([first, second], "first", frame, 16 / 10)

    expect(reflowed).toHaveLength(1)
    expect(reflowed[0]?.id).toBe("second")
    expect(reflowed[0]?.yPct).toBe(50)
    expect(reflowed[0]?.rotation).toBe(0)
    expect(reflowed[0]?.xPct).toBeCloseTo(75)
    expect(reflowed[0]?.widthPct).toBeCloseTo(48)
  })

  it("migrates legacy slots and fills modern defaults", () => {
    const slot = migrateLegacySlot({
      id: "legacy",
      src: "data:image/png;base64,abc",
      xPct: 12,
      tilt: { ry: 15 },
      objectFit: "cover",
    })

    expect(slot.id).toBe("legacy")
    expect(slot.src).toBe("data:image/png;base64,abc")
    expect(slot.xPct).toBe(12)
    expect(slot.yPct).toBe(50)
    expect(slot.tilt).toEqual({ rx: 0, ry: 15, rz: 0 })
    expect(slot.objectFit).toBe("cover")
    expect(slot.heightPct).toBe(28)
  })

  it("applies canvas style defaults to slots without mutating canvas values", () => {
    const canvas = {
      ...createCanvas("canvas"),
      padding: 72,
      borderRadius: 18,
      border: {
        color: "#111111",
        width: 3,
        style: "dashed" as const,
        padding: 2,
      },
    }
    const slot = applySlotStyleDefaults(
      createScreenshotSlot({ id: "slot" }, 1),
      canvas
    )

    expect(slot.padding).toBe(72)
    expect(slot.borderRadius).toBe(18)
    expect(slot.border).toEqual(canvas.border)
    expect(slot.border).not.toBe(canvas.border)
  })

  it("duplicates layer items with offset and a new z-index", () => {
    const result = duplicateLayerItem(
      [{ id: "text-1", xPct: 94, yPct: 10, zIndex: 2 }],
      "text-1",
      "text-2",
      8
    )

    expect(result.ok).toBe(true)
    expect(result.items).toHaveLength(2)
    expect(result.items[1]).toEqual({
      id: "text-2",
      xPct: 95,
      yPct: 14,
      zIndex: 8,
    })
  })

  it("places a duplicated canvas to the right unless that slot is occupied", () => {
    const source = createCanvas("source", { x: 0, y: 0 })
    const occupied = createCanvas("occupied", {
      x: CANVAS_BASE_W + CANVAS_GAP,
      y: 0,
    })
    const next = placementAfterCanvas(
      {
        activeTool: "pointer",
        aspect: { id: "16-10", w: 16, h: 10 },
        canvasZoom: 100,
        annotation: {
          mode: "pen",
          color: "#ef4444",
          strokeWidth: 4,
          lineStyle: "solid",
          blurEffect: "blur",
          blurAmount: 14,
        },
        canvases: [source, occupied],
        activeCanvasId: "source",
      },
      "source"
    )

    expect(next).toEqual({ x: 2 * (CANVAS_BASE_W + CANVAS_GAP), y: 0 })
  })
})
