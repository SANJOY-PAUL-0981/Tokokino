"use client"

import * as React from "react"
import { createPortal } from "react-dom"

import {
  floatingToolbarTransform,
  ToolbarDivider,
  ToolbarDragHandle,
  ToolbarDuplicateButton,
  ToolbarLayerOrderMenu,
  ToolbarSurface,
} from "@/components/editor/toolbar/primitives"
import { isBrowserFrame } from "@/lib/browser-frame"
import type { DeviceFrame, EditorTool } from "@/lib/editor/store"
import { cn } from "@/lib/utils"

import { BoxHoverActions } from "./box-hover-actions"
import { FramedScreenshotVisual } from "./framed-screenshot-visual"
import { frameSelectionRadius } from "./helpers"

type MainScreenshotRowItemProps = {
  style: React.CSSProperties
  offset: { x: number; y: number }
  screenshot: string | null
  frame: DeviceFrame
  addressValue: string
  onAddressChange: (value: string) => void
  transform: string
  isDragOver: boolean
  imgStyle: React.CSSProperties
  shadowFilter: string | undefined
  filterChain: string | undefined
  isSelected: boolean
  bulkCanvasDragging: boolean
  hoverActionsInline: boolean
  hoverActionsLayoutKey: string
  hoverActionsScale: number
  toolbarScale: number
  activeTool: EditorTool
  isScreenshotDragging: boolean
  onSelect: (e: React.MouseEvent | React.PointerEvent) => void
  onBrowse: () => void
  onCropClick: () => void
  onReplaceFile: (file: File) => void
  onDelete: () => void
  onDuplicate: () => void
  onBringToFront: () => void
  onSendToBack: () => void
  onPointerDown: (e: React.PointerEvent<HTMLDivElement>) => void
  onPointerMove: (e: React.PointerEvent<HTMLDivElement>) => void
  onPointerUp: (e: React.PointerEvent<HTMLDivElement>) => void
}

export function MainScreenshotRowItem({
  style,
  offset,
  screenshot,
  frame,
  addressValue,
  onAddressChange,
  transform,
  isDragOver,
  imgStyle,
  shadowFilter,
  filterChain,
  isSelected,
  bulkCanvasDragging,
  hoverActionsInline,
  hoverActionsLayoutKey,
  hoverActionsScale,
  toolbarScale,
  activeTool,
  isScreenshotDragging,
  onSelect,
  onBrowse,
  onCropClick,
  onReplaceFile,
  onDelete,
  onDuplicate,
  onBringToFront,
  onSendToBack,
  onPointerDown,
  onPointerMove,
  onPointerUp,
}: MainScreenshotRowItemProps) {
  const rowRef = React.useRef<HTMLDivElement | null>(null)
  const [toolbarRect, setToolbarRect] = React.useState<DOMRect | null>(null)

  React.useEffect(() => {
    if (
      bulkCanvasDragging ||
      !isSelected ||
      activeTool !== "pointer" ||
      !rowRef.current
    ) {
      setToolbarRect(null)
      return
    }

    const el = rowRef.current
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
  }, [bulkCanvasDragging, isSelected, activeTool])

  React.useEffect(() => {
    if (
      bulkCanvasDragging ||
      !isSelected ||
      activeTool !== "pointer" ||
      !rowRef.current
    ) {
      return
    }
    setToolbarRect(rowRef.current.getBoundingClientRect())
  }, [
    bulkCanvasDragging,
    isSelected,
    activeTool,
    offset.x,
    offset.y,
    style.left,
    style.top,
  ])

  const baseTransform = (style.transform as string | undefined) ?? ""
  const mergedStyle: React.CSSProperties = {
    ...style,
    transform:
      `${baseTransform} translate(${offset.x}px, ${offset.y}px)`.trim(),
  }
  const selectionRadius = frameSelectionRadius(
    frame.id,
    imgStyle.borderRadius as number
  )

  return (
    <>
      <div
        ref={rowRef}
        data-box-hover-target
        className={cn(
          "group/main-row pointer-events-auto",
          activeTool === "pointer" && "cursor-grab",
          isScreenshotDragging && "cursor-grabbing"
        )}
        style={mergedStyle}
        onClick={onSelect}
        onPointerDown={(e) => {
          if (activeTool !== "pointer") return
          e.stopPropagation()
          onPointerDown(e)
        }}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <div
          className={cn(
            "relative h-full w-full",
            isSelected &&
              activeTool === "pointer" &&
              "outline-2 outline-offset-2 outline-[#9BCD64]/95 outline-dashed"
          )}
          style={{
            transform,
            transformStyle: "preserve-3d",
            opacity: imgStyle.opacity as number | undefined,
            mixBlendMode:
              imgStyle.mixBlendMode as React.CSSProperties["mixBlendMode"],
            borderRadius: selectionRadius,
            boxShadow:
              frame.id === "none"
                ? (imgStyle.boxShadow as string | undefined)
                : undefined,
          }}
        >
          <FramedScreenshotVisual
            src={screenshot}
            frame={frame}
            onBrowse={onBrowse}
            isDragOver={isDragOver}
            imageFilter={filterChain}
            shadowFilter={frame.id === "none" ? undefined : shadowFilter}
            borderRadius={imgStyle.borderRadius as number | undefined}
            addressValue={addressValue}
            onAddressChange={onAddressChange}
          />

          {screenshot && activeTool === "pointer" ? (
            <BoxHoverActions
              hoverGroupClass="group-hover/main-row:opacity-100"
              disabled={bulkCanvasDragging || isScreenshotDragging}
              inline
              mode={
                frame.id !== "none" && !isBrowserFrame(frame.id)
                  ? "menu"
                  : "buttons"
              }
              layoutKey={hoverActionsLayoutKey}
              controlScale={hoverActionsInline ? 1 : hoverActionsScale}
              measureRef={rowRef}
              onCrop={onCropClick}
              onReplaceFile={onReplaceFile}
              onDelete={onDelete}
            />
          ) : null}
        </div>
      </div>

      {isSelected &&
      !bulkCanvasDragging &&
      activeTool === "pointer" &&
      toolbarRect &&
      typeof document !== "undefined"
        ? createPortal(
            (() => {
              const flipBelow = toolbarRect.top < 80
              const top = flipBelow
                ? toolbarRect.bottom + 12
                : toolbarRect.top - 12
              const left = toolbarRect.left + toolbarRect.width / 2
              return (
                <div
                  data-editor-floating-toolbar-target="main-screenshot"
                  className="pointer-events-none fixed z-100"
                  style={{
                    top,
                    left,
                    transform: floatingToolbarTransform(
                      flipBelow,
                      toolbarScale
                    ),
                    transformOrigin: flipBelow ? "top center" : "bottom center",
                  }}
                >
                  <div className="pointer-events-auto">
                    <ToolbarSurface>
                      <ToolbarDragHandle
                        ariaLabel="Drag screenshot"
                        onPointerDown={(e) => {
                          e.stopPropagation()
                          onPointerDown(
                            e as unknown as React.PointerEvent<HTMLDivElement>
                          )
                        }}
                        onPointerMove={(e) =>
                          onPointerMove(
                            e as unknown as React.PointerEvent<HTMLDivElement>
                          )
                        }
                        onPointerUp={(e) =>
                          onPointerUp(
                            e as unknown as React.PointerEvent<HTMLDivElement>
                          )
                        }
                      />
                      <ToolbarDivider />
                      <ToolbarDuplicateButton
                        ariaLabel="Duplicate screenshot"
                        onDuplicate={onDuplicate}
                      />
                      <ToolbarLayerOrderMenu
                        onBringToFront={onBringToFront}
                        onSendToBack={onSendToBack}
                      />
                    </ToolbarSurface>
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
