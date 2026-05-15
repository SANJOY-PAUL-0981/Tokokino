import { isBrowserFrame } from "@/lib/browser-frame"

import type { DeviceFrame, Tilt } from "./state-types"

export type PresentPreset = {
  id: string
  name: string
  tilt: Tilt
  scale: number
}

export const PRESENT_PRESETS: PresentPreset[] = [
  {
    id: "default",
    name: "Default",
    tilt: { rx: 0, ry: 0, rz: 0 },
    scale: 100,
  },
  {
    id: "left-depth",
    name: "Left Depth",
    tilt: { rx: 15, ry: 20, rz: -9 },
    scale: 85,
  },
  {
    id: "right-depth",
    name: "Right Depth",
    tilt: { rx: 15, ry: -20, rz: 10 },
    scale: 85,
  },
]

export function resolvePresentPresetScale(
  preset: PresentPreset,
  frame: DeviceFrame
) {
  if (preset.id === "default") return 100
  if (frame.id === "none" || isBrowserFrame(frame.id)) return 85
  if (
    frame.id.startsWith("macbook") ||
    frame.id.startsWith("imac") ||
    frame.id.includes("display")
  ) {
    return 90
  }
  return 100
}
