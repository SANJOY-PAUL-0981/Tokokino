"use client"

import * as React from "react"
import { RiFocus3Line } from "@remixicon/react"

import { cn } from "@/lib/utils"

export type PositionSwipePoint = { xPct: number; yPct: number }

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

function safePoint(point: PositionSwipePoint | null): PositionSwipePoint {
  return {
    xPct: clamp(point?.xPct ?? 50, 0, 100),
    yPct: clamp(point?.yPct ?? 50, 0, 100),
  }
}

export function PositionSwipeField({
  ariaLabel,
  className,
  disabled = false,
  value,
  onChange,
  onPreview,
}: {
  ariaLabel: string
  className?: string
  disabled?: boolean
  value: PositionSwipePoint | null
  onChange: (point: PositionSwipePoint) => void
  onPreview?: (point: PositionSwipePoint) => void
}) {
  const point = safePoint(value)
  const handleRef = React.useRef<HTMLDivElement | null>(null)
  const glowRef = React.useRef<HTMLDivElement | null>(null)
  const draggingRef = React.useRef(false)
  const draftPointRef = React.useRef(point)

  const moveVisualPoint = React.useCallback((nextPoint: PositionSwipePoint) => {
    const safeNextPoint = safePoint(nextPoint)
    draftPointRef.current = safeNextPoint

    if (handleRef.current) {
      handleRef.current.style.cssText = `left: calc(${safeNextPoint.xPct}% - 14px); top: calc(${safeNextPoint.yPct}% - 14px);`
    }

    if (glowRef.current) {
      glowRef.current.style.cssText = `left: calc(${safeNextPoint.xPct}% - 54px); top: calc(${safeNextPoint.yPct}% - 54px);`
    }
  }, [])

  React.useLayoutEffect(() => {
    if (draggingRef.current) return
    moveVisualPoint(point)
  }, [moveVisualPoint, point])

  const pointFromPointer = React.useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const rect = event.currentTarget.getBoundingClientRect()
      return {
        xPct: clamp(((event.clientX - rect.left) / rect.width) * 100, 0, 100),
        yPct: clamp(((event.clientY - rect.top) / rect.height) * 100, 0, 100),
      }
    },
    []
  )

  const previewPoint = React.useCallback(
    (nextPoint: PositionSwipePoint) => {
      onPreview?.(safePoint(nextPoint))
    },
    [onPreview]
  )

  const commitPoint = React.useCallback(
    (nextPoint: PositionSwipePoint) => {
      onChange(safePoint(nextPoint))
    },
    [onChange]
  )

  const handlePointerDown = React.useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (disabled) return

      event.currentTarget.setPointerCapture(event.pointerId)
      draggingRef.current = true
      const nextPoint = pointFromPointer(event)
      moveVisualPoint(nextPoint)
      previewPoint(nextPoint)
    },
    [disabled, moveVisualPoint, pointFromPointer, previewPoint]
  )

  const handlePointerMove = React.useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (disabled || !draggingRef.current || event.buttons !== 1) return
      const nextPoint = pointFromPointer(event)
      moveVisualPoint(nextPoint)
      previewPoint(nextPoint)
    },
    [disabled, moveVisualPoint, pointFromPointer, previewPoint]
  )

  const handlePointerUp = React.useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (disabled || !draggingRef.current) return

      const nextPoint = pointFromPointer(event)
      moveVisualPoint(nextPoint)
      draggingRef.current = false
      commitPoint(nextPoint)
    },
    [commitPoint, disabled, moveVisualPoint, pointFromPointer]
  )

  const handlePointerCancel = React.useCallback(() => {
    if (!draggingRef.current) return
    draggingRef.current = false
    commitPoint(draftPointRef.current)
  }, [commitPoint])

  const handleLostPointerCapture = React.useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!draggingRef.current || event.buttons === 1) return
      draggingRef.current = false
      commitPoint(draftPointRef.current)
    },
    [commitPoint]
  )

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (disabled) return

      const step = event.shiftKey ? 10 : 5
      let nextPoint = { ...point }
      if (event.key === "ArrowLeft") nextPoint.xPct -= step
      else if (event.key === "ArrowRight") nextPoint.xPct += step
      else if (event.key === "ArrowUp") nextPoint.yPct -= step
      else if (event.key === "ArrowDown") nextPoint.yPct += step
      else if (event.key === "Home") nextPoint = { xPct: 50, yPct: 50 }
      else return

      event.preventDefault()
      commitPoint(nextPoint)
    },
    [commitPoint, disabled, point]
  )

  return (
    <div
      role="slider"
      tabIndex={disabled ? -1 : 0}
      aria-label={ariaLabel}
      aria-valuenow={Math.round((point.xPct + point.yPct) / 2)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuetext={`${Math.round(point.xPct)}% horizontal, ${Math.round(point.yPct)}% vertical`}
      aria-disabled={disabled}
      onKeyDown={handleKeyDown}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      onLostPointerCapture={handleLostPointerCapture}
      className={cn(
        "group relative h-[132px] w-full max-w-full touch-none overflow-hidden rounded-md border border-black/10 bg-white shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_14px_30px_rgba(44,36,25,0.06)] transition outline-none dark:border-white/10 dark:bg-[#202020] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]",
        disabled
          ? "cursor-not-allowed opacity-55"
          : "cursor-grab focus-visible:ring-2 focus-visible:ring-[#f65d72]/50 active:cursor-grabbing",
        className
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,currentColor_1px,transparent_1.5px)] bg-[length:18px_18px] text-black/20 dark:text-white/15" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(145deg,rgba(255,255,255,0.38),rgba(136,180,143,0.06)_48%,rgba(255,90,114,0.05))] dark:bg-[linear-gradient(145deg,rgba(255,255,255,0.08),transparent_54%)]" />
      <div className="pointer-events-none absolute top-1/2 left-0 h-px w-full -translate-y-1/2 bg-foreground/10" />
      <div className="pointer-events-none absolute top-0 left-1/2 h-full w-px -translate-x-1/2 bg-foreground/10" />
      <div
        ref={glowRef}
        className="pointer-events-none absolute size-[108px] rounded-full bg-primary/25 blur-2xl will-change-[left,top]"
        style={{
          left: `calc(${point.xPct}% - 54px)`,
          top: `calc(${point.yPct}% - 54px)`,
        }}
      />
      <div
        ref={handleRef}
        className="absolute z-10 flex size-7 items-center justify-center rounded-full border-[3px] border-white bg-primary text-primary-foreground shadow-[0_0_0_1px_rgba(0,0,0,0.45),0_10px_24px_rgba(0,0,0,0.35)] transition-transform will-change-[left,top] group-active:scale-105"
        style={{
          left: `calc(${point.xPct}% - 14px)`,
          top: `calc(${point.yPct}% - 14px)`,
        }}
      >
        <RiFocus3Line className="size-3.5" />
      </div>
    </div>
  )
}
