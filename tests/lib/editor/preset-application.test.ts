import { describe, expect, it } from "vitest"

import {
  planLayoutPreset,
  planSinglePreset,
} from "@/lib/editor/preset-application"
import { createScreenshotSlot } from "@/lib/editor/store/canvas-helpers"
import { createCanvas } from "@/lib/editor/store/defaults"
import type { LayoutPreset, PresentPreset } from "@/lib/editor/present-presets"

describe("preset application planners", () => {
  it("plans single presets without changing screenshot placement", () => {
    const canvas = {
      ...createCanvas("canvas"),
      screenshotPosition: "0-0" as const,
      screenshotOffset: { x: 14, y: -9 },
      screenshotSlots: [createScreenshotSlot({ id: "slot-1" }, 1)],
    }
    const preset: PresentPreset = {
      id: "test-depth",
      name: "Depth",
      tilt: { rx: 8, ry: -12, rz: 2 },
      scale: 125,
    }

    const plan = planSinglePreset(preset, canvas, { id: "16-10", w: 16, h: 10 })

    expect(plan.canvasTilt).toEqual(preset.tilt)
    expect(plan.canvasScale).toBe(100)
    expect(plan.screenshotPosition).toBe("0-0")
    expect(plan.screenshotOffset).toEqual({ x: 14, y: -9 })
    expect(plan.slots[0]).toMatchObject({
      yPct: 50,
      rotation: 0,
      tilt: preset.tilt,
      scale: 100,
    })
  })

  it("plans relative layout preset slots from their natural row positions", () => {
    const canvas = createCanvas("canvas")
    const preset: LayoutPreset = {
      id: "relative-test",
      name: "Relative",
      canvasTilt: { rx: 0, ry: 0, rz: 0 },
      canvasScale: 110,
      relativeSlotPositions: true,
      mainOffset: { xPct: 10, yPct: -5 },
      slots: [
        {
          xPct: -10,
          yPct: 6,
          rotation: 4,
          tilt: { rx: 1, ry: 2, rz: 3 },
          scale: 120,
          zIndex: 7,
        },
      ],
    }

    const plan = planLayoutPreset(preset, canvas, { id: "16-10", w: 16, h: 10 })

    expect(plan.canvasScale).toBe(110)
    expect(plan.screenshotPosition).toBe("center")
    expect(plan.screenshotOffset.x).toBeCloseTo(110)
    expect(plan.screenshotOffset.y).toBeCloseTo(-34.375)
    expect(plan.slots[0]).toMatchObject({
      yPct: 56,
      rotation: 4,
      tilt: { rx: 1, ry: 2, rz: 3 },
      scale: 120,
      zIndex: 7,
    })
    expect(plan.slots[0]?.xPct).toBeCloseTo(65)
  })
})
