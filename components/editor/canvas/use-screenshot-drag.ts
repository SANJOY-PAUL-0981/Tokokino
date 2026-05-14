"use client"

import * as React from "react"

import type { EditorTool } from "@/lib/editor/store"

import type { CenterGuidesState } from "./center-guides"
import { snapCenterToTarget } from "./helpers"
import type { PlacementDims } from "./use-placement-measurement"

type Offset = { x: number; y: number }

type ScreenshotDragState = {
  pointerId: number
  startClientX: number
  startClientY: number
  startOffsetX: number
  startOffsetY: number
  baseLeft: number
  baseTop: number
  stageW: number
  stageH: number
  imgW: number
  imgH: number
}

type MockupDragState = {
  pointerId: number
  startClientX: number
  startClientY: number
  startOffsetX: number
  startOffsetY: number
}

export function useScreenshotDrag({
  activeTool,
  canDragScreenshot,
  effectiveScale,
  placementDims,
  positionedStyle,
  screenshotOffset,
  setScreenshotOffset,
  setIsScreenshotSelected,
  clearSelection,
  updateCenterGuides,
}: {
  activeTool: EditorTool
  canDragScreenshot: boolean
  effectiveScale: number
  placementDims: PlacementDims | null
  positionedStyle: React.CSSProperties | null
  screenshotOffset: Offset
  setScreenshotOffset: (offset: Offset) => void
  setIsScreenshotSelected: (selected: boolean) => void
  clearSelection: () => void
  updateCenterGuides: (next: CenterGuidesState) => void
}) {
  const [isScreenshotDragging, setIsScreenshotDragging] = React.useState(false)
  const [liveOffset, setLiveOffset] = React.useState<Offset | null>(null)
  const liveOffsetRef = React.useRef<Offset | null>(null)
  const dragRef = React.useRef<ScreenshotDragState | null>(null)
  const mockupDragRef = React.useRef<MockupDragState | null>(null)

  const updateLiveOffset = (offset: Offset | null) => {
    liveOffsetRef.current = offset
    setLiveOffset(offset)
  }

  const commitLiveOffset = () => {
    if (liveOffsetRef.current) setScreenshotOffset(liveOffsetRef.current)
    updateLiveOffset(null)
  }

  const startScreenshotDrag = (e: React.PointerEvent<HTMLImageElement>) => {
    if (!canDragScreenshot || !placementDims || !positionedStyle) return

    e.preventDefault()
    e.stopPropagation()
    e.currentTarget.setPointerCapture(e.pointerId)
    setIsScreenshotSelected(true)
    setIsScreenshotDragging(true)
    clearSelection()
    dragRef.current = {
      pointerId: e.pointerId,
      startClientX: e.clientX,
      startClientY: e.clientY,
      startOffsetX: screenshotOffset.x,
      startOffsetY: screenshotOffset.y,
      baseLeft: positionedStyle.left as number,
      baseTop: positionedStyle.top as number,
      stageW: placementDims.stageW,
      stageH: placementDims.stageH,
      imgW: placementDims.imgW,
      imgH: placementDims.imgH,
    }
  }

  const moveScreenshot = (e: React.PointerEvent<HTMLImageElement>) => {
    const drag = dragRef.current
    if (!drag || drag.pointerId !== e.pointerId) return

    e.preventDefault()
    let nextX =
      drag.startOffsetX + (e.clientX - drag.startClientX) / effectiveScale
    let nextY =
      drag.startOffsetY + (e.clientY - drag.startClientY) / effectiveScale
    const centerX = drag.baseLeft + nextX + drag.imgW / 2
    const centerY = drag.baseTop + nextY + drag.imgH / 2
    const snap = snapCenterToTarget({
      centerX,
      centerY,
      targetX: drag.stageW / 2,
      targetY: drag.stageH / 2,
    })

    nextX += snap.deltaX
    nextY += snap.deltaY

    updateCenterGuides(snap.guides)
    updateLiveOffset({ x: nextX, y: nextY })
  }

  const stopScreenshotDrag = (e: React.PointerEvent<HTMLImageElement>) => {
    const drag = dragRef.current
    if (!drag || drag.pointerId !== e.pointerId) return

    dragRef.current = null
    setIsScreenshotDragging(false)
    updateCenterGuides({ x: false, y: false })
    commitLiveOffset()
  }

  const startMockupDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    if (activeTool !== "pointer") return

    e.preventDefault()
    e.stopPropagation()
    e.currentTarget.setPointerCapture(e.pointerId)
    setIsScreenshotSelected(true)
    setIsScreenshotDragging(true)
    clearSelection()
    mockupDragRef.current = {
      pointerId: e.pointerId,
      startClientX: e.clientX,
      startClientY: e.clientY,
      startOffsetX: screenshotOffset.x,
      startOffsetY: screenshotOffset.y,
    }
  }

  const moveMockup = (e: React.PointerEvent<HTMLDivElement>) => {
    const drag = mockupDragRef.current
    if (!drag || drag.pointerId !== e.pointerId) return

    e.preventDefault()
    let nextX =
      drag.startOffsetX + (e.clientX - drag.startClientX) / effectiveScale
    let nextY =
      drag.startOffsetY + (e.clientY - drag.startClientY) / effectiveScale
    const snap = snapCenterToTarget({
      centerX: nextX,
      centerY: nextY,
      targetX: 0,
      targetY: 0,
    })

    nextX += snap.deltaX
    nextY += snap.deltaY

    updateCenterGuides(snap.guides)
    updateLiveOffset({ x: nextX, y: nextY })
  }

  const stopMockupDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    const drag = mockupDragRef.current
    if (!drag || drag.pointerId !== e.pointerId) return

    mockupDragRef.current = null
    setIsScreenshotDragging(false)
    updateCenterGuides({ x: false, y: false })
    commitLiveOffset()
  }

  return {
    isScreenshotDragging,
    liveOffset,
    startScreenshotDrag,
    moveScreenshot,
    stopScreenshotDrag,
    startMockupDrag,
    moveMockup,
    stopMockupDrag,
  }
}
