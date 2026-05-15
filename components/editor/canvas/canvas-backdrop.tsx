"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import {
  assetFilterCss,
  backgroundCss,
  overlayUrl,
  patternCssFor,
  type Backdrop,
  type Background,
  type Overlay,
  type Portrait,
} from "@/lib/editor/store"

import { NOISE_DATA_URL, portraitOverlayCss } from "./helpers"

type CanvasBackdropProps = {
  background: Background
  backdrop: Backdrop
  effectsFilter: string | undefined
  noiseEnabled: boolean
  noiseOpacity: number
  portrait: Portrait
  overlay: Overlay
}

function CanvasBackdropImpl({
  background,
  backdrop,
  effectsFilter,
  noiseEnabled,
  noiseOpacity,
  portrait,
  overlay,
}: CanvasBackdropProps) {
  const portraitStyle = portraitOverlayCss(
    portrait.mode,
    portrait.intensity,
    portrait.position,
    portrait.distance
  )

  // Wrap the live-edited effects filter in a CSS var so the inspector can
  // override it during drag without dispatching to the store on every tick.
  // `brightness(1)` is identity so the fallback is a no-op when nothing's set.
  const effectsFallback = effectsFilter ?? "brightness(1)"
  const assetFilter = assetFilterCss(backdrop.filter ?? "none")
  const filterValue = assetFilter
    ? `var(--bd-fx-preview, ${effectsFallback}) ${assetFilter}`
    : `var(--bd-fx-preview, ${effectsFallback})`

  return (
    <>
      <div
        aria-hidden
        className={cn(
          "absolute inset-0",
          background.type === "none" && "bg-transparency-checker"
        )}
        style={{
          ...backgroundCss(background),
          filter: filterValue,
        }}
      />

      {backdrop.pattern.ids.map((id) => (
        <div
          key={id}
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            ...patternCssFor(
              id,
              backdrop.pattern.color,
              backdrop.pattern.thickness
            ),
            opacity: `var(--bd-pattern-intensity, ${backdrop.pattern.intensity / 100})`,
          }}
        />
      ))}

      {noiseEnabled ? (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 mix-blend-overlay"
          style={{ backgroundImage: NOISE_DATA_URL, opacity: noiseOpacity }}
        />
      ) : null}

      {portraitStyle ? (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={
            portrait.mode === "blur" || portrait.mode === "stage"
              ? { ...portraitStyle, zIndex: 200 }
              : portraitStyle
          }
        />
      ) : null}

      {overlay.id !== null && overlay.position === "underlay" ? (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url("${overlayUrl(overlay.id)}")`,
            opacity: `var(--bd-overlay-opacity, ${overlay.opacity / 100})`,
          }}
        />
      ) : null}
    </>
  )
}

export const CanvasBackdrop = React.memo(CanvasBackdropImpl)
