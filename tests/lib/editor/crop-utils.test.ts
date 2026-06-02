import { describe, expect, it } from "vitest"

import {
  computeCoverCropRegion,
  computeCoverCropRegionForAspect,
  cropRegionMatchesAspect,
  insetCropRegion,
} from "@/lib/editor/crop-utils"

describe("crop utils", () => {
  it("computes side crops for wide images in narrow containers", () => {
    expect(computeCoverCropRegion(2000, 1000, 1, 1)).toEqual({
      x: 25,
      y: 0,
      width: 50,
      height: 100,
    })
  })

  it("computes top-anchored vertical crops for browser frame captures", () => {
    expect(computeCoverCropRegionForAspect(1000, 2000, 1, "top")).toEqual({
      x: 0,
      y: 0,
      width: 100,
      height: 50,
    })
  })

  it("insets crop regions while preserving top anchoring when requested", () => {
    expect(
      insetCropRegion({ x: 0, y: 0, width: 100, height: 50 }, 0.8, "top")
    ).toEqual({ x: 10, y: 0, width: 80, height: 40 })
  })

  it("checks whether a crop region matches the requested aspect", () => {
    expect(
      cropRegionMatchesAspect(
        { x: 25, y: 0, width: 50, height: 100 },
        2000,
        1000,
        1
      )
    ).toBe(true)
    expect(
      cropRegionMatchesAspect(
        { x: 0, y: 0, width: 100, height: 100 },
        2000,
        1000,
        1
      )
    ).toBe(false)
  })
})
