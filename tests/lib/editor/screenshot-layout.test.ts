import { describe, expect, it } from "vitest"

import {
  computeRowLayout,
  slotBoxAspectRatio,
} from "@/lib/editor/screenshot-layout"
import type { DeviceFrame } from "@/lib/editor/state-types"

const noneFrame: DeviceFrame = {
  id: "none",
  color: "black",
  orientation: "vertical",
}

describe("screenshot row layout", () => {
  it("centers one item and caps its height", () => {
    const [item] = computeRowLayout([{ id: "main", frame: noneFrame }], 16 / 10)

    expect(item?.id).toBe("main")
    expect(item?.xPct).toBeCloseTo(50)
    expect(item?.widthPct).toBeCloseTo(70)
  })

  it("lays out multiple items without crossing the row margins", () => {
    const layout = computeRowLayout(
      [
        { id: "main", frame: noneFrame },
        { id: "slot-1", frame: noneFrame },
        { id: "slot-2", frame: noneFrame },
      ],
      16 / 10
    )
    const firstLeft = layout[0].xPct - layout[0].widthPct / 2
    const lastRight = layout[2].xPct + layout[2].widthPct / 2

    expect(layout).toHaveLength(3)
    expect(firstLeft).toBeCloseTo(1)
    expect(lastRight).toBeCloseTo(99)
    expect(layout[1].xPct).toBeCloseTo(50)
  })

  it("uses natural image aspect for unframed slots when available", () => {
    expect(slotBoxAspectRatio(noneFrame, 16 / 10, { w: 1200, h: 800 })).toBe(
      "1200 / 800"
    )
    expect(slotBoxAspectRatio(noneFrame, 9 / 16)).toBe("10 / 14")
  })
})
