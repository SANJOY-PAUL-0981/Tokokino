import { describe, expect, it } from "vitest"

import {
  LAYOUT_PRESETS,
  layoutPresetDeviceClassForFrame,
  resolveLayoutPresetGeometry,
} from "@/lib/editor/present-presets"
import type { DeviceFrame } from "@/lib/editor/state-types"

describe("present presets", () => {
  it("uses portrait-device geometry for vertical phone frames", () => {
    const preset = LAYOUT_PRESETS.find((item) => item.id === "triple")
    const phoneFrame: DeviceFrame = {
      id: "iphone_17",
      color: "black",
      orientation: "vertical",
    }

    expect(layoutPresetDeviceClassForFrame(phoneFrame)).toBe("portrait-device")
    expect(resolveLayoutPresetGeometry(preset!, phoneFrame)).toBe(
      preset?.portraitDevice
    )
  })

  it("falls back to default geometry for horizontal phone frames", () => {
    const preset = LAYOUT_PRESETS.find((item) => item.id === "triple")
    const phoneFrame: DeviceFrame = {
      id: "iphone_17",
      color: "black",
      orientation: "horizontal",
    }

    expect(layoutPresetDeviceClassForFrame(phoneFrame)).toBe("default")
    expect(resolveLayoutPresetGeometry(preset!, phoneFrame)).toBe(preset)
  })
})
