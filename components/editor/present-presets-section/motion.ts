"use client"

import { animate } from "motion/react"

import type { Tilt } from "@/lib/editor/store"

type PresetMotionKind = "canvas" | "slot"

const PRESET_MOTION_MS = 560

function motionVarName(
  kind: PresetMotionKind,
  axis: "rx" | "ry" | "rz" | "scale"
) {
  return `--${kind}-ts-${axis}`
}

function setMotionVars(
  el: HTMLElement,
  kind: PresetMotionKind,
  tilt: Tilt,
  scale: number
) {
  el.style.setProperty(motionVarName(kind, "rx"), `${tilt.rx}deg`)
  el.style.setProperty(motionVarName(kind, "ry"), `${tilt.ry}deg`)
  el.style.setProperty(motionVarName(kind, "rz"), `${tilt.rz}deg`)
  el.style.setProperty(motionVarName(kind, "scale"), String(scale / 100))
}

function clearMotionVars(el: HTMLElement, kind: PresetMotionKind) {
  el.style.removeProperty(motionVarName(kind, "rx"))
  el.style.removeProperty(motionVarName(kind, "ry"))
  el.style.removeProperty(motionVarName(kind, "rz"))
  el.style.removeProperty(motionVarName(kind, "scale"))
}

function mixNumber(from: number, to: number, progress: number) {
  return from + (to - from) * progress
}

function overshootNumber(from: number, to: number, amount: number) {
  const delta = to - from
  if (Math.abs(delta) < 0.001) return to
  return to + delta * amount
}

export function startPresetMotion({
  target,
  kind,
  fromTilt,
  fromScale,
  toTilt,
  toScale,
}: {
  target: HTMLElement | null
  kind: PresetMotionKind
  fromTilt: Tilt
  fromScale: number
  toTilt: Tilt
  toScale: number
}) {
  if (!target) return () => undefined

  const media = window.matchMedia("(prefers-reduced-motion: reduce)")
  if (media.matches) return () => undefined

  const peakTilt: Tilt = {
    rx: overshootNumber(fromTilt.rx, toTilt.rx, 0.16),
    ry: overshootNumber(fromTilt.ry, toTilt.ry, 0.16),
    rz: overshootNumber(fromTilt.rz, toTilt.rz, 0.16),
  }
  const peakScale = overshootNumber(fromScale, toScale, 0.12)
  setMotionVars(target, kind, fromTilt, fromScale)

  const controls = animate(0, 1, {
    duration: PRESET_MOTION_MS / 1000,
    ease: [0.16, 1, 0.3, 1],
    onUpdate: (value) => {
      const firstLeg = value < 0.68
      const legProgress = firstLeg ? value / 0.68 : (value - 0.68) / 0.32
      const startTilt = firstLeg ? fromTilt : peakTilt
      const endTilt = firstLeg ? peakTilt : toTilt
      const startScale = firstLeg ? fromScale : peakScale
      const endScale = firstLeg ? peakScale : toScale

      setMotionVars(
        target,
        kind,
        {
          rx: mixNumber(startTilt.rx, endTilt.rx, legProgress),
          ry: mixNumber(startTilt.ry, endTilt.ry, legProgress),
          rz: mixNumber(startTilt.rz, endTilt.rz, legProgress),
        },
        mixNumber(startScale, endScale, legProgress)
      )
    },
  })

  const cleanupTimer = window.setTimeout(() => {
    clearMotionVars(target, kind)
  }, PRESET_MOTION_MS + 80)

  return () => {
    controls.stop()
    window.clearTimeout(cleanupTimer)
    clearMotionVars(target, kind)
  }
}
