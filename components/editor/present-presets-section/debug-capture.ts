import { BASE_CANVAS_WIDTH } from "@/components/editor/canvas/constants"
import { layoutPresetDeviceClassForFrame } from "@/lib/editor/present-presets"
import type { AspectState, CanvasState } from "@/lib/editor/store"

function canvasDimsFromAspect(aspect: AspectState) {
  const aw = aspect.w || 16
  const ah = aspect.h || 10
  return {
    width: BASE_CANVAS_WIDTH,
    height: (BASE_CANVAS_WIDTH * ah) / aw,
  }
}

function roundLayoutNumber(value: number) {
  return Number(value.toFixed(2))
}

export function buildLayoutPresetCapture({
  canvas,
  aspect,
  activeLayoutPresetId,
}: {
  canvas: CanvasState
  aspect: AspectState
  activeLayoutPresetId: string | null
}) {
  const dims = canvasDimsFromAspect(aspect)
  const mainOffset = {
    xPct: roundLayoutNumber((canvas.screenshotOffset.x / dims.width) * 100),
    yPct: roundLayoutNumber((canvas.screenshotOffset.y / dims.height) * 100),
  }
  const slots = canvas.screenshotSlots.map((slot, index) => ({
    index,
    id: slot.id,
    xPct: roundLayoutNumber(slot.xPct),
    yPct: roundLayoutNumber(slot.yPct),
    widthPct: roundLayoutNumber(slot.widthPct),
    heightPct: roundLayoutNumber(slot.heightPct),
    rotation: roundLayoutNumber(slot.rotation),
    tilt: {
      rx: roundLayoutNumber(slot.tilt.rx),
      ry: roundLayoutNumber(slot.tilt.ry),
      rz: roundLayoutNumber(slot.tilt.rz),
    },
    scale: roundLayoutNumber(slot.scale),
    zIndex: slot.zIndex,
  }))
  const presetPatch = {
    canvasTilt: {
      rx: roundLayoutNumber(canvas.tilt.rx),
      ry: roundLayoutNumber(canvas.tilt.ry),
      rz: roundLayoutNumber(canvas.tilt.rz),
    },
    canvasScale: roundLayoutNumber(canvas.scale),
    slots: slots.map(({ xPct, yPct, rotation, tilt, scale, zIndex }) => ({
      xPct,
      yPct,
      rotation,
      tilt,
      scale,
      zIndex,
    })),
    mainOffset,
  }

  return {
    type: "layout-preset-capture-v1",
    activeLayoutPresetId,
    layoutDeviceClass: layoutPresetDeviceClassForFrame(canvas.frame),
    frame: {
      id: canvas.frame.id,
      orientation: canvas.frame.orientation,
    },
    aspect: {
      id: aspect.id,
      w: aspect.w || 16,
      h: aspect.h || 10,
    },
    screenshotPosition: canvas.screenshotPosition,
    presetPatch,
    slots,
  }
}
