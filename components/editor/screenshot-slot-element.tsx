"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import {
  RiDeleteBinLine,
  RiRefreshLine,
  RiSparkling2Line,
} from "@remixicon/react"
import { toast } from "sonner"

import { CanvasEmptyState } from "@/components/editor/canvas/canvas-empty-state"
import {
  ToolbarButton,
  ToolbarDeleteButton,
  ToolbarDivider,
  ToolbarDragHandle,
  ToolbarDuplicateButton,
  ToolbarPopover,
  ToolbarSurface,
} from "@/components/editor/toolbar/primitives"
import { Slider } from "@/components/ui/slider"
import {
  assetFilterCss,
  enhanceFilterCss,
  type ScreenshotSlot,
  shadowCss,
  useEditor,
} from "@/lib/editor/store"
import { cn } from "@/lib/utils"

type DragState = {
  pointerId: number
  startX: number
  startY: number
  startXPct: number
  startYPct: number
  canvasW: number
  canvasH: number
  lastXPct: number
  lastYPct: number
  moved: boolean
}

type ResizeHandleId = "ml" | "mr" | "mt" | "mb" | "tl" | "tr" | "bl" | "br"

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

const readFileAsDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === "string") resolve(reader.result)
      else reject(new Error("Could not read file"))
    }
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })

export function ScreenshotSlotView({
  slot,
  canvasRef,
}: {
  slot: ScreenshotSlot
  canvasRef: React.RefObject<HTMLDivElement | null>
}) {
  const {
    selectedScreenshotSlotId,
    setSelectedScreenshotSlotId,
    setSelectedAssetId,
    setSelectedTextId,
    setSelectedAnnotationShapeId,
    updateScreenshotSlot,
    setScreenshotSlotImage,
    deleteScreenshotSlot,
    setIsScreenshotSelected,
  } = useEditor()
  const isSelected = selectedScreenshotSlotId === slot.id

  const elRef = React.useRef<HTMLDivElement>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const dragRef = React.useRef<DragState | null>(null)
  const resizeRef = React.useRef<ResizeState | null>(null)
  const [isDragOver, setIsDragOver] = React.useState(false)
  const [toolbarRect, setToolbarRect] = React.useState<DOMRect | null>(null)

  React.useEffect(() => {
    if (!isSelected || !elRef.current) {
      setToolbarRect(null)
      return
    }
    const el = elRef.current
    const update = () => setToolbarRect(el.getBoundingClientRect())
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    window.addEventListener("scroll", update, true)
    window.addEventListener("resize", update)
    return () => {
      ro.disconnect()
      window.removeEventListener("scroll", update, true)
      window.removeEventListener("resize", update)
    }
  }, [isSelected])

  React.useEffect(() => {
    if (!isSelected || !elRef.current) return
    setToolbarRect(elRef.current.getBoundingClientRect())
  }, [
    isSelected,
    slot.xPct,
    slot.yPct,
    slot.widthPct,
    slot.heightPct,
    slot.rotation,
  ])

  const select = (e: React.MouseEvent | React.PointerEvent) => {
    e.stopPropagation()
    setSelectedScreenshotSlotId(slot.id)
    setSelectedAssetId(null)
    setSelectedTextId(null)
    setSelectedAnnotationShapeId(null)
    setIsScreenshotSelected(false)
  }

  React.useEffect(() => {
    if (!isSelected) return
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null
      const tag = target?.tagName
      if (
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        target?.isContentEditable === true
      ) {
        return
      }
      if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault()
        deleteScreenshotSlot(slot.id)
        setSelectedScreenshotSlotId(null)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [slot.id, deleteScreenshotSlot, isSelected, setSelectedScreenshotSlotId])

  const handleFiles = React.useCallback(
    async (files: FileList | File[] | null) => {
      const list = files ? Array.from(files) : []
      const imageFile = list.find((f) => f.type.startsWith("image/"))
      if (!imageFile) {
        toast.error("Please drop an image")
        return
      }
      try {
        const src = await readFileAsDataUrl(imageFile)
        setScreenshotSlotImage(slot.id, src)
      } catch {
        toast.error("Could not read image")
      }
    },
    [setScreenshotSlotImage, slot.id]
  )

  const startDrag = (e: React.PointerEvent<Element>) => {
    if (!canvasRef.current) return
    e.stopPropagation()
    select(e)
    const rect = canvasRef.current.getBoundingClientRect()
    dragRef.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      startXPct: slot.xPct,
      startYPct: slot.yPct,
      canvasW: rect.width,
      canvasH: rect.height,
      lastXPct: slot.xPct,
      lastYPct: slot.yPct,
      moved: false,
    }
    ;(e.currentTarget as Element).setPointerCapture(e.pointerId)
  }

  const moveDrag = (e: React.PointerEvent<Element>) => {
    const drag = dragRef.current
    if (!drag || drag.pointerId !== e.pointerId) return
    const dxPct = ((e.clientX - drag.startX) / drag.canvasW) * 100
    const dyPct = ((e.clientY - drag.startY) / drag.canvasH) * 100
    const nextX = Math.max(-20, Math.min(120, drag.startXPct + dxPct))
    const nextY = Math.max(-20, Math.min(120, drag.startYPct + dyPct))
    drag.lastXPct = nextX
    drag.lastYPct = nextY
    drag.moved = true
    const el = elRef.current
    if (el) {
      el.style.left = `${nextX}%`
      el.style.top = `${nextY}%`
      setToolbarRect(el.getBoundingClientRect())
    }
  }

  const endDrag = (e: React.PointerEvent<Element>) => {
    const drag = dragRef.current
    if (!drag || drag.pointerId !== e.pointerId) return
    if (drag.moved) {
      updateScreenshotSlot(slot.id, {
        xPct: drag.lastXPct,
        yPct: drag.lastYPct,
      })
    }
    dragRef.current = null
  }

  const startResize =
    (handle: ResizeHandleId) => (e: React.PointerEvent<HTMLButtonElement>) => {
      const canvas = canvasRef.current
      const el = elRef.current
      if (!canvas || !el) return
      e.stopPropagation()
      e.preventDefault()
      e.currentTarget.setPointerCapture(e.pointerId)
      const rect = canvas.getBoundingClientRect()
      resizeRef.current = {
        pointerId: e.pointerId,
        handle,
        startX: e.clientX,
        startY: e.clientY,
        startXPct: slot.xPct,
        startYPct: slot.yPct,
        startWidthPct: slot.widthPct,
        startHeightPct: slot.heightPct,
        canvasW: rect.width,
        canvasH: rect.height,
      }
    }

  const moveResize = (e: React.PointerEvent<HTMLButtonElement>) => {
    const rs = resizeRef.current
    if (!rs || rs.pointerId !== e.pointerId) return
    const dxPct = ((e.clientX - rs.startX) / rs.canvasW) * 100
    const dyPct = ((e.clientY - rs.startY) / rs.canvasH) * 100

    let newW = rs.startWidthPct
    let newH = rs.startHeightPct
    let xShift = 0
    let yShift = 0

    const isCorner =
      rs.handle === "tl" ||
      rs.handle === "tr" ||
      rs.handle === "bl" ||
      rs.handle === "br"

    if (isCorner) {
      const signX = rs.handle === "tr" || rs.handle === "br" ? 1 : -1
      const signY = rs.handle === "bl" || rs.handle === "br" ? 1 : -1
      newW = Math.max(5, rs.startWidthPct + signX * dxPct)
      newH = Math.max(5, rs.startHeightPct + signY * dyPct)
      xShift = (signX * (newW - rs.startWidthPct)) / 2
      yShift = (signY * (newH - rs.startHeightPct)) / 2
    } else {
      switch (rs.handle) {
        case "ml":
          newW = Math.max(5, rs.startWidthPct - dxPct)
          xShift = -(newW - rs.startWidthPct) / 2
          break
        case "mr":
          newW = Math.max(5, rs.startWidthPct + dxPct)
          xShift = (newW - rs.startWidthPct) / 2
          break
        case "mt":
          newH = Math.max(5, rs.startHeightPct - dyPct)
          yShift = -(newH - rs.startHeightPct) / 2
          break
        case "mb":
          newH = Math.max(5, rs.startHeightPct + dyPct)
          yShift = (newH - rs.startHeightPct) / 2
          break
      }
    }

    updateScreenshotSlot(slot.id, {
      widthPct: Math.min(150, newW),
      heightPct: Math.min(150, newH),
      xPct: Math.max(-20, Math.min(120, rs.startXPct + xShift)),
      yPct: Math.max(-20, Math.min(120, rs.startYPct + yShift)),
    })
  }

  const endResize = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (resizeRef.current?.pointerId === e.pointerId) {
      resizeRef.current = null
    }
  }

  const computedShadow = shadowCss(slot.shadow)
  const enhanceFilter = enhanceFilterCss(slot.enhance)
  const filterChain = [enhanceFilter, assetFilterCss(slot.filter)]
    .filter(Boolean)
    .join(" ")
    .trim()

  const containerStyle: React.CSSProperties = {
    left: `${slot.xPct}%`,
    top: `${slot.yPct}%`,
    width: `${slot.widthPct}%`,
    height: `${slot.heightPct}%`,
    transform: `translate(-50%, -50%) rotate(${slot.rotation}deg)`,
    zIndex: 60 + slot.zIndex,
    display: slot.hidden ? "none" : undefined,
    mixBlendMode: slot.blendMode,
  }

  const imageBoxStyle: React.CSSProperties = {
    borderRadius: slot.borderRadius,
    boxShadow: computedShadow,
    opacity: slot.opacity / 100,
  }
  if (slot.border.color && slot.border.width > 0) {
    imageBoxStyle.outline = `${slot.border.width}px ${slot.border.style || "solid"} ${slot.border.color}`
    imageBoxStyle.outlineOffset = `${slot.border.padding || 0}px`
  }

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const files = e.target.files
          if (files) void handleFiles(files)
          e.target.value = ""
        }}
      />

      <div
        ref={elRef}
        data-screenshot-slot-id={slot.id}
        onPointerDown={startDrag}
        onPointerMove={moveDrag}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onClick={select}
        onDragOver={(e) => {
          e.preventDefault()
          e.stopPropagation()
          setIsDragOver(true)
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={(e) => {
          e.preventDefault()
          e.stopPropagation()
          setIsDragOver(false)
          void handleFiles(e.dataTransfer.files)
        }}
        className={cn(
          "group/slot absolute select-none",
          isSelected ? "cursor-grabbing" : "cursor-grab"
        )}
        style={containerStyle}
      >
        {slot.src ? (
          <div
            className={cn(
              "relative h-full w-full overflow-hidden bg-black/40",
              isSelected &&
                "outline-2 outline-offset-2 outline-[#9BCD64]/95 outline-dashed"
            )}
            style={imageBoxStyle}
          >
            <img
              src={slot.src}
              alt=""
              draggable={false}
              className="block h-full w-full select-none object-cover"
              style={{
                filter: filterChain || undefined,
              }}
            />
          </div>
        ) : (
          <div
            className={cn(
              "relative h-full w-full overflow-hidden",
              isSelected &&
                "outline-2 outline-offset-2 outline-[#9BCD64]/95 outline-dashed"
            )}
            style={{
              borderRadius: slot.borderRadius,
              boxShadow: computedShadow,
            }}
          >
            <CanvasEmptyState
              isDragOver={isDragOver}
              isActive={isSelected}
              onBrowse={() => {
                setSelectedScreenshotSlotId(slot.id)
                setSelectedAssetId(null)
                setSelectedTextId(null)
                setSelectedAnnotationShapeId(null)
                setIsScreenshotSelected(false)
                fileInputRef.current?.click()
              }}
            />
          </div>
        )}

        {isSelected ? (
          <>
            {(
              [
                ["ml", "top-1/2", "left-0", "-translate-x-1/2 -translate-y-1/2", "ew-resize"],
                ["mr", "top-1/2", "right-0", "translate-x-1/2 -translate-y-1/2", "ew-resize"],
                ["mt", "top-0", "left-1/2", "-translate-x-1/2 -translate-y-1/2", "ns-resize"],
                ["mb", "bottom-0", "left-1/2", "-translate-x-1/2 translate-y-1/2", "ns-resize"],
                ["tl", "top-0", "left-0", "-translate-x-1/2 -translate-y-1/2", "nwse-resize"],
                ["tr", "top-0", "right-0", "translate-x-1/2 -translate-y-1/2", "nesw-resize"],
                ["bl", "bottom-0", "left-0", "-translate-x-1/2 translate-y-1/2", "nesw-resize"],
                ["br", "bottom-0", "right-0", "translate-x-1/2 translate-y-1/2", "nwse-resize"],
              ] as const
            ).map(([id, vClass, hClass, transformClass, cursor]) => (
              <button
                key={id}
                aria-label={`Resize ${id}`}
                onPointerDown={startResize(id)}
                onPointerMove={moveResize}
                onPointerUp={endResize}
                onPointerCancel={endResize}
                onClick={(e) => e.stopPropagation()}
                className={cn(
                  "absolute z-10 size-2.5 rounded-full border border-[#92b97a] bg-background shadow",
                  vClass,
                  hClass,
                  transformClass
                )}
                style={{ cursor }}
              />
            ))}
          </>
        ) : null}
      </div>

      {isSelected && toolbarRect && typeof document !== "undefined"
        ? createPortal(
            (() => {
              const flipBelow = toolbarRect.top < 80
              const top = flipBelow
                ? toolbarRect.bottom + 12
                : toolbarRect.top - 12
              const left = toolbarRect.left + toolbarRect.width / 2
              return (
                <div
                  data-editor-floating-toolbar-target={`slot:${slot.id}`}
                  className="pointer-events-none fixed z-100"
                  style={{
                    top,
                    left,
                    transform: flipBelow
                      ? "translate(-50%, 0)"
                      : "translate(-50%, -100%)",
                  }}
                >
                  <div className="pointer-events-auto">
                    <ScreenshotSlotToolbar
                      slot={slot}
                      onDragHandlePointerDown={startDrag}
                      onDragHandlePointerMove={moveDrag}
                      onDragHandlePointerUp={endDrag}
                      onReplaceClick={() => fileInputRef.current?.click()}
                    />
                  </div>
                </div>
              )
            })(),
            document.body
          )
        : null}
    </>
  )
}

type DragHandlers = {
  onDragHandlePointerDown?: (e: React.PointerEvent<HTMLButtonElement>) => void
  onDragHandlePointerMove?: (e: React.PointerEvent<HTMLButtonElement>) => void
  onDragHandlePointerUp?: (e: React.PointerEvent<HTMLButtonElement>) => void
}

function ScreenshotSlotToolbar({
  slot,
  onDragHandlePointerDown,
  onDragHandlePointerMove,
  onDragHandlePointerUp,
  onReplaceClick,
}: {
  slot: ScreenshotSlot
  onReplaceClick: () => void
} & DragHandlers) {
  const {
    deleteScreenshotSlot,
    duplicateScreenshotSlot,
    setSelectedScreenshotSlotId,
    setScreenshotSlotImage,
    updateScreenshotSlot,
  } = useEditor()

  return (
    <ToolbarSurface>
      <ToolbarDragHandle
        ariaLabel="Drag screenshot"
        onPointerDown={onDragHandlePointerDown}
        onPointerMove={onDragHandlePointerMove}
        onPointerUp={onDragHandlePointerUp}
      />

      <ToolbarDivider />

      <ToolbarDeleteButton
        ariaLabel="Delete screenshot"
        onDelete={() => {
          deleteScreenshotSlot(slot.id)
          setSelectedScreenshotSlotId(null)
        }}
      />

      <ToolbarDuplicateButton
        ariaLabel="Duplicate screenshot"
        onDuplicate={() => {
          const id = duplicateScreenshotSlot(slot.id)
          if (id) setSelectedScreenshotSlotId(id)
        }}
      />

      {slot.src ? (
        <ToolbarButton
          aria-label="Replace screenshot"
          tooltip="Replace"
          onClick={onReplaceClick}
        >
          <RiRefreshLine className="size-4" />
        </ToolbarButton>
      ) : null}

      {slot.src ? (
        <ToolbarButton
          aria-label="Clear image"
          tooltip="Clear image"
          onClick={() => setScreenshotSlotImage(slot.id, null)}
        >
          <RiDeleteBinLine className="size-4" />
        </ToolbarButton>
      ) : null}

      <ToolbarDivider />

      <ToolbarPopover
        tooltip="Style"
        contentClassName="w-64 p-3"
        trigger={({ open }) => (
          <ToolbarButton
            aria-label="Style"
            active={open}
          >
            <RiSparkling2Line className="size-4" />
          </ToolbarButton>
        )}
      >
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                Radius
              </span>
              <span className="font-mono text-[11px] text-foreground">
                {slot.borderRadius}px
              </span>
            </div>
            <Slider
              min={0}
              max={40}
              step={1}
              value={[slot.borderRadius]}
              onValueChange={([v]) =>
                updateScreenshotSlot(slot.id, { borderRadius: v })
              }
              className="cursor-pointer"
            />
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                Shadow
              </span>
              <span className="font-mono text-[11px] text-foreground">
                {slot.shadow.intensity}
              </span>
            </div>
            <Slider
              min={0}
              max={100}
              step={1}
              value={[slot.shadow.intensity]}
              onValueChange={([v]) =>
                updateScreenshotSlot(slot.id, {
                  shadow: { ...slot.shadow, intensity: v },
                })
              }
              className="cursor-pointer"
            />
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                Opacity
              </span>
              <span className="font-mono text-[11px] text-foreground">
                {slot.opacity}%
              </span>
            </div>
            <Slider
              min={0}
              max={100}
              step={1}
              value={[slot.opacity]}
              onValueChange={([v]) =>
                updateScreenshotSlot(slot.id, { opacity: v })
              }
              className="cursor-pointer"
            />
          </div>
        </div>
      </ToolbarPopover>
    </ToolbarSurface>
  )
}
