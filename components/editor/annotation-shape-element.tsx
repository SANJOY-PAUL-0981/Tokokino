"use client"

import * as React from "react"
import {
  RiDeleteBinLine,
  RiDragMove2Line,
  RiFileCopyLine,
} from "@remixicon/react"

import { ColorPickerPopover } from "@/components/editor/color-picker-popover"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  type AnnotationLineStyle,
  type AnnotationShape,
  useEditor,
} from "@/lib/editor/store"
import { cn } from "@/lib/utils"

type ResizeHandleId = "tl" | "tr" | "bl" | "br" | "ml" | "mr" | "mt" | "mb"

type DragState = {
  pointerId: number
  startX: number
  startY: number
  startXPct: number
  startYPct: number
  canvasW: number
  canvasH: number
}

type ResizeState = {
  pointerId: number
  handle: ResizeHandleId
  startX: number
  startY: number
  startXPct: number
  startYPct: number
  startWidthPct: number
  startHeightPct: number
  canvasW: number
  canvasH: number
}

const iconBtnClass =
  "inline-flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground cursor-pointer shrink-0"

export function AnnotationShapeElement({
  shape,
  canvasRef,
  onCenterGuideChange,
}: {
  shape: AnnotationShape
  canvasRef: React.RefObject<HTMLDivElement | null>
  onCenterGuideChange?: (guides: { x: boolean; y: boolean }) => void
}) {
  const {
    selectedAnnotationShapeId,
    setSelectedAnnotationShapeId,
    setSelectedTextId,
    setSelectedAssetId,
    updateAnnotationShape,
    deleteAnnotationShape,
  } = useEditor()
  const isSelected = selectedAnnotationShapeId === shape.id
  const dashArray = lineDashArray(shape.lineStyle)
  const elRef = React.useRef<HTMLDivElement>(null)
  const dragRef = React.useRef<DragState | null>(null)
  const resizeRef = React.useRef<ResizeState | null>(null)

  React.useEffect(() => {
    if (!isSelected) return
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName
      if (tag === "INPUT" || tag === "TEXTAREA") return
      if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault()
        deleteAnnotationShape(shape.id)
        setSelectedAnnotationShapeId(null)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [
    deleteAnnotationShape,
    isSelected,
    setSelectedAnnotationShapeId,
    shape.id,
  ])

  const selectShape = (
    e: React.PointerEvent | React.MouseEvent | React.KeyboardEvent
  ) => {
    e.stopPropagation()
    setSelectedAnnotationShapeId(shape.id)
    setSelectedTextId(null)
    setSelectedAssetId(null)
  }

  const startDrag = (e: React.PointerEvent<Element>) => {
    const canvas = canvasRef.current
    if (!canvas || e.button !== 0) return
    selectShape(e)
    e.preventDefault()
    e.currentTarget.setPointerCapture(e.pointerId)
    const rect = canvas.getBoundingClientRect()
    dragRef.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      startXPct: shape.xPct,
      startYPct: shape.yPct,
      canvasW: rect.width,
      canvasH: rect.height,
    }
  }

  const moveDrag = (e: React.PointerEvent<Element>) => {
    const drag = dragRef.current
    if (!drag || drag.pointerId !== e.pointerId) return
    e.preventDefault()
    const dxPct = ((e.clientX - drag.startX) / drag.canvasW) * 100
    const dyPct = ((e.clientY - drag.startY) / drag.canvasH) * 100
    let nextX = clamp(drag.startXPct + dxPct, -20, 120)
    let nextY = clamp(drag.startYPct + dyPct, -20, 120)
    const snapX = Math.abs(nextX - 50) <= (8 / drag.canvasW) * 100
    const snapY = Math.abs(nextY - 50) <= (8 / drag.canvasH) * 100
    if (snapX) nextX = 50
    if (snapY) nextY = 50
    onCenterGuideChange?.({ x: snapX, y: snapY })
    updateAnnotationShape(shape.id, { xPct: nextX, yPct: nextY })
  }

  const endDrag = (e: React.PointerEvent<Element>) => {
    const drag = dragRef.current
    if (!drag || drag.pointerId !== e.pointerId) return
    dragRef.current = null
    onCenterGuideChange?.({ x: false, y: false })
  }

  const startResize =
    (handle: ResizeHandleId) => (e: React.PointerEvent<HTMLButtonElement>) => {
      const canvas = canvasRef.current
      if (!canvas) return
      e.stopPropagation()
      e.preventDefault()
      e.currentTarget.setPointerCapture(e.pointerId)
      const rect = canvas.getBoundingClientRect()
      resizeRef.current = {
        pointerId: e.pointerId,
        handle,
        startX: e.clientX,
        startY: e.clientY,
        startXPct: shape.xPct,
        startYPct: shape.yPct,
        startWidthPct: shape.widthPct,
        startHeightPct: shape.heightPct,
        canvasW: rect.width,
        canvasH: rect.height,
      }
    }

  const moveResize = (e: React.PointerEvent<HTMLButtonElement>) => {
    const rs = resizeRef.current
    if (!rs || rs.pointerId !== e.pointerId) return
    e.preventDefault()
    const dxPct = ((e.clientX - rs.startX) / rs.canvasW) * 100
    const dyPct = ((e.clientY - rs.startY) / rs.canvasH) * 100
    const minSize = 1
    let nextX = rs.startXPct
    let nextY = rs.startYPct
    let nextW = rs.startWidthPct
    let nextH = rs.startHeightPct

    const left = rs.startXPct - rs.startWidthPct / 2
    const right = rs.startXPct + rs.startWidthPct / 2
    const top = rs.startYPct - rs.startHeightPct / 2
    const bottom = rs.startYPct + rs.startHeightPct / 2

    if (rs.handle.includes("l")) {
      nextW = Math.max(minSize, rs.startWidthPct - dxPct)
      nextX = right - nextW / 2
    }
    if (rs.handle.includes("r")) {
      nextW = Math.max(minSize, rs.startWidthPct + dxPct)
      nextX = left + nextW / 2
    }
    if (rs.handle.includes("t")) {
      nextH = Math.max(minSize, rs.startHeightPct - dyPct)
      nextY = bottom - nextH / 2
    }
    if (rs.handle.includes("b")) {
      nextH = Math.max(minSize, rs.startHeightPct + dyPct)
      nextY = top + nextH / 2
    }

    updateAnnotationShape(shape.id, {
      xPct: clamp(nextX, -20, 120),
      yPct: clamp(nextY, -20, 120),
      widthPct: clamp(nextW, minSize, 200),
      heightPct: clamp(nextH, minSize, 200),
    })
  }

  const endResize = (e: React.PointerEvent<HTMLButtonElement>) => {
    const rs = resizeRef.current
    if (!rs || rs.pointerId !== e.pointerId) return
    resizeRef.current = null
  }

  return (
    <>
      <div
        ref={elRef}
        role="button"
        tabIndex={0}
        aria-label={`${shape.kind} annotation`}
        className={cn(
          "pointer-events-auto absolute touch-none select-none",
          isSelected ? "cursor-move" : "cursor-pointer"
        )}
        onClick={selectShape}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") selectShape(e)
        }}
        onPointerDown={startDrag}
        onPointerMove={moveDrag}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        style={{
          left: `${shape.xPct}%`,
          top: `${shape.yPct}%`,
          width: `${shape.widthPct}%`,
          height: `${shape.heightPct}%`,
          transform: "translate(-50%, -50%)",
          zIndex: 86 + shape.zIndex,
        }}
      >
        <svg
          className="h-full w-full overflow-visible"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          {shape.kind === "arrow" ? (
            <g
              fill="none"
              stroke={shape.color}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={shape.strokeWidth}
              strokeDasharray={dashArray}
              vectorEffect="non-scaling-stroke"
            >
              <line x1="50" y1="90" x2="50" y2="15" />
              <polyline points="18,43 50,15 82,43" />
            </g>
          ) : shape.kind === "rect" ? (
            <rect
              x="4"
              y="4"
              width="92"
              height="92"
              rx="3"
              fill="none"
              stroke={shape.color}
              strokeWidth={shape.strokeWidth}
              strokeDasharray={dashArray}
              vectorEffect="non-scaling-stroke"
            />
          ) : (
            <ellipse
              cx="50"
              cy="50"
              rx="46"
              ry="46"
              fill="none"
              stroke={shape.color}
              strokeWidth={shape.strokeWidth}
              strokeDasharray={dashArray}
              vectorEffect="non-scaling-stroke"
            />
          )}
        </svg>

        {isSelected ? (
          <>
            <div className="pointer-events-none absolute inset-0 border border-dashed border-[#92b97a]/80" />
            {RESIZE_HANDLES.map((handle) => (
              <button
                key={handle}
                aria-label={`Resize ${handle}`}
                className={cn(
                  "absolute z-10 size-2.5 rounded-full border border-[#92b97a] bg-background shadow",
                  HANDLE_CLASS[handle]
                )}
                onPointerDown={startResize(handle)}
                onPointerMove={moveResize}
                onPointerUp={endResize}
                onPointerCancel={endResize}
              />
            ))}
            <AnnotationShapeToolbar
              shape={shape}
              onDragPointerDown={startDrag}
              onDragPointerMove={moveDrag}
              onDragPointerUp={endDrag}
            />
          </>
        ) : null}
      </div>
    </>
  )
}

function AnnotationShapeToolbar({
  shape,
  onDragPointerDown,
  onDragPointerMove,
  onDragPointerUp,
}: {
  shape: AnnotationShape
  onDragPointerDown: (e: React.PointerEvent<Element>) => void
  onDragPointerMove: (e: React.PointerEvent<Element>) => void
  onDragPointerUp: (e: React.PointerEvent<Element>) => void
}) {
  const {
    updateAnnotationShape,
    deleteAnnotationShape,
    duplicateAnnotationShape,
    setSelectedAnnotationShapeId,
  } = useEditor()

  return (
    <div
      className="pointer-events-auto absolute left-1/2 top-0 z-[120] flex -translate-x-1/2 -translate-y-[calc(100%+12px)] items-center gap-0.5 rounded-md border border-border/70 bg-popover/95 p-1 shadow-xl backdrop-blur-md"
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            aria-label="Move shape"
            className={cn(iconBtnClass, "cursor-move active:cursor-grabbing")}
            onPointerDown={onDragPointerDown}
            onPointerMove={onDragPointerMove}
            onPointerUp={onDragPointerUp}
            onPointerCancel={onDragPointerUp}
          >
            <RiDragMove2Line className="size-4" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="top">Drag shape</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <button
            aria-label="Delete shape"
            className={cn(iconBtnClass, "text-red-500 hover:text-red-500")}
            onClick={() => {
              deleteAnnotationShape(shape.id)
              setSelectedAnnotationShapeId(null)
            }}
          >
            <RiDeleteBinLine className="size-4" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="top">Delete</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <button
            aria-label="Duplicate shape"
            className={iconBtnClass}
            onClick={() => {
              const id = duplicateAnnotationShape(shape.id)
              if (id) setSelectedAnnotationShapeId(id)
            }}
          >
            <RiFileCopyLine className="size-4" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="top">Duplicate</TooltipContent>
      </Tooltip>

      <ColorPickerPopover
        value={shape.color}
        side="top"
        align="center"
        onChange={(color) => updateAnnotationShape(shape.id, { color })}
      >
        <button
          aria-label="Shape color"
          className={cn(iconBtnClass, "mx-1")}
        >
          <span
            className="block size-5 rounded-full border border-foreground/10"
            style={{ background: shape.color }}
          />
        </button>
      </ColorPickerPopover>

      <span className="mx-1 h-5 w-px bg-border" />

      {LINE_STYLES.map((style) => (
        <Tooltip key={style.id}>
          <TooltipTrigger asChild>
            <button
              aria-label={`${style.label} line`}
              className={cn(
                iconBtnClass,
                shape.lineStyle === style.id && "bg-accent text-foreground"
              )}
              onClick={() =>
                updateAnnotationShape(shape.id, { lineStyle: style.id })
              }
            >
              <LineStylePreview
                style={style.id}
                kind={shape.kind}
                active={shape.lineStyle === style.id}
              />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top">{style.label}</TooltipContent>
        </Tooltip>
      ))}
    </div>
  )
}

const LINE_STYLES: { id: AnnotationLineStyle; label: string }[] = [
  { id: "solid", label: "Solid" },
  { id: "dashed", label: "Dashed" },
  { id: "dotted", label: "Short Dash" },
]

function LineStylePreview({
  style,
  kind,
  active,
}: {
  style: AnnotationLineStyle
  kind: AnnotationShape["kind"]
  active: boolean
}) {
  const strokeColor = active ? "text-foreground" : "text-foreground/55"
  const dashArray = lineDashArray(style)
  return (
    <svg
      viewBox="0 0 20 20"
      aria-hidden="true"
      className={cn("size-4 overflow-visible", strokeColor)}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {kind === "arrow" ? (
        <>
          <line x1="4" y1="15" x2="14" y2="5" strokeDasharray={dashArray} />
          <polyline points="10,5 14,5 14,9" strokeDasharray={dashArray} />
        </>
      ) : kind === "rect" ? (
        <rect
          x="3.5"
          y="3.5"
          width="13"
          height="13"
          rx="2.5"
          strokeDasharray={dashArray}
        />
      ) : (
        <circle cx="10" cy="10" r="6.5" strokeDasharray={dashArray} />
      )}
    </svg>
  )
}

const RESIZE_HANDLES: ResizeHandleId[] = [
  "tl",
  "mt",
  "tr",
  "ml",
  "mr",
  "bl",
  "mb",
  "br",
]

const HANDLE_CLASS: Record<ResizeHandleId, string> = {
  tl: "left-0 top-0 -translate-x-1/2 -translate-y-1/2 cursor-nwse-resize",
  mt: "left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 cursor-ns-resize",
  tr: "right-0 top-0 translate-x-1/2 -translate-y-1/2 cursor-nesw-resize",
  ml: "left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize",
  mr: "right-0 top-1/2 translate-x-1/2 -translate-y-1/2 cursor-ew-resize",
  bl: "bottom-0 left-0 -translate-x-1/2 translate-y-1/2 cursor-nesw-resize",
  mb: "bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 cursor-ns-resize",
  br: "bottom-0 right-0 translate-x-1/2 translate-y-1/2 cursor-nwse-resize",
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n))
}

function lineDashArray(style: AnnotationShape["lineStyle"]) {
  if (style === "dashed") return "5 3"
  if (style === "dotted") return "2.2 2.2"
  return undefined
}
