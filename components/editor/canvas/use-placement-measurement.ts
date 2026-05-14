"use client"

import * as React from "react"

export type PlacementDims = {
  stageW: number
  stageH: number
  imgW: number
  imgH: number
}

export function usePlacementMeasurement({
  enabled,
  stageRef,
  imageRef,
  layoutKey,
}: {
  enabled: boolean
  stageRef: React.RefObject<HTMLDivElement | null>
  imageRef: React.RefObject<HTMLImageElement | null>
  layoutKey?: string | number
}) {
  const [placementDims, setPlacementDims] =
    React.useState<PlacementDims | null>(null)

  const measurePlacement = React.useCallback(() => {
    const stage = stageRef.current
    const image = imageRef.current
    if (!stage || !image) return

    const next = {
      stageW: parseFloat(getComputedStyle(stage).width) || stage.clientWidth,
      stageH: parseFloat(getComputedStyle(stage).height) || stage.clientHeight,
      imgW: image.offsetWidth,
      imgH: image.offsetHeight,
    }

    if (!next.stageW || !next.stageH || !next.imgW || !next.imgH) return

    setPlacementDims((prev) => {
      if (
        prev?.stageW === next.stageW &&
        prev.stageH === next.stageH &&
        prev.imgW === next.imgW &&
        prev.imgH === next.imgH
      ) {
        return prev
      }
      return next
    })
  }, [imageRef, stageRef])

  React.useLayoutEffect(() => {
    if (!enabled) return

    const stage = stageRef.current
    const image = imageRef.current
    if (!stage || !image) return

    measurePlacement()
    const raf = window.requestAnimationFrame(measurePlacement)

    const observer = new ResizeObserver(measurePlacement)
    observer.observe(stage)
    observer.observe(image)
    return () => {
      window.cancelAnimationFrame(raf)
      observer.disconnect()
    }
  }, [enabled, imageRef, layoutKey, measurePlacement, stageRef])

  return { placementDims, measurePlacement }
}
