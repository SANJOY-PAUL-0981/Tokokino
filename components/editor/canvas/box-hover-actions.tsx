"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { RiCropLine, RiDeleteBinLine, RiRefreshLine } from "@remixicon/react"

import { cn } from "@/lib/utils"

type BoxHoverActionsProps = {
  hoverGroupClass: string
  onCrop: () => void
  onReplaceFile: (file: File) => void
  onDelete: () => void
}

export function BoxHoverActions({
  hoverGroupClass,
  onCrop,
  onReplaceFile,
  onDelete,
}: BoxHoverActionsProps) {
  const anchorRef = React.useRef<HTMLDivElement>(null)
  const replaceInputRef = React.useRef<HTMLInputElement>(null)
  const hideTimerRef = React.useRef<number | null>(null)
  const [visible, setVisible] = React.useState(false)
  const [rect, setRect] = React.useState<DOMRect | null>(null)

  const clearHideTimer = React.useCallback(() => {
    if (hideTimerRef.current === null) return
    window.clearTimeout(hideTimerRef.current)
    hideTimerRef.current = null
  }, [])

  const scheduleHide = React.useCallback(() => {
    clearHideTimer()
    hideTimerRef.current = window.setTimeout(() => {
      setVisible(false)
      hideTimerRef.current = null
    }, 120)
  }, [clearHideTimer])

  React.useEffect(() => {
    const anchor = anchorRef.current
    const positionTarget = anchor?.parentElement
    const hoverTarget =
      anchor?.closest<HTMLElement>("[data-box-hover-target]") ?? positionTarget
    if (!positionTarget || !hoverTarget) return

    const updateRect = () => setRect(positionTarget.getBoundingClientRect())
    const show = () => {
      clearHideTimer()
      updateRect()
      setVisible(true)
    }

    hoverTarget.addEventListener("pointerenter", show)
    hoverTarget.addEventListener("pointerleave", scheduleHide)
    hoverTarget.addEventListener("focusin", show)
    hoverTarget.addEventListener("focusout", scheduleHide)
    window.addEventListener("scroll", updateRect, true)
    window.addEventListener("resize", updateRect)
    updateRect()

    return () => {
      clearHideTimer()
      hoverTarget.removeEventListener("pointerenter", show)
      hoverTarget.removeEventListener("pointerleave", scheduleHide)
      hoverTarget.removeEventListener("focusin", show)
      hoverTarget.removeEventListener("focusout", scheduleHide)
      window.removeEventListener("scroll", updateRect, true)
      window.removeEventListener("resize", updateRect)
    }
  }, [clearHideTimer, scheduleHide])

  return (
    <>
      <div
        ref={anchorRef}
        aria-hidden
        className={cn(
          "pointer-events-none absolute top-1/2 left-1/2 size-0 -translate-x-1/2 -translate-y-1/2 opacity-0",
          hoverGroupClass
        )}
      />
      <input
        ref={replaceInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) onReplaceFile(file)
          e.target.value = ""
        }}
      />
      {visible && rect && typeof document !== "undefined"
        ? createPortal(
            <div
              className="pointer-events-auto fixed flex -translate-x-1/2 -translate-y-1/2 items-center justify-center gap-2 transition-opacity duration-200"
              style={{
                top: rect.top + rect.height / 2,
                left: rect.left + rect.width / 2,
                zIndex: 1100,
              }}
              onPointerEnter={() => {
                clearHideTimer()
                setVisible(true)
              }}
              onPointerLeave={scheduleHide}
            >
              <BoxActionButton label="Crop image" onClick={onCrop}>
                <RiCropLine className="size-4" />
              </BoxActionButton>
              <BoxActionButton
                label="Replace image"
                onClick={() => replaceInputRef.current?.click()}
              >
                <RiRefreshLine className="size-4" />
              </BoxActionButton>
              <BoxActionButton
                label="Delete image"
                destructive
                onClick={onDelete}
              >
                <RiDeleteBinLine className="size-4" />
              </BoxActionButton>
            </div>,
            document.body
          )
        : null}
    </>
  )
}

function BoxActionButton({
  label,
  destructive,
  onClick,
  children,
}: {
  label: string
  destructive?: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onPointerDown={(e) => e.stopPropagation()}
      onPointerUp={(e) => e.stopPropagation()}
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
      className={cn(
        "pointer-events-auto flex size-9 items-center justify-center rounded-full bg-black/70 text-white shadow-lg ring-1 ring-white/10 backdrop-blur-md transition-all hover:scale-105 hover:bg-black/85",
        destructive && "hover:bg-red-500/90"
      )}
    >
      {children}
    </button>
  )
}
