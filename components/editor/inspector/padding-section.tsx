"use client"

import * as React from "react"

import { EditableValue } from "@/components/editor/editable-value"
import { Slider } from "@/components/ui/slider"
import {
  useActiveCanvasField,
  useActiveCanvasId,
  useEditorStore,
} from "@/lib/editor/store"
import { useScreenshotStyleTarget } from "@/lib/editor/screenshot-style-target"
import { cn } from "@/lib/utils"

const PADDING_PREVIEW_VAR = "--editor-padding-preview"

export function PaddingSection() {
  const canvasPadding = useActiveCanvasField((c) => c.padding)
  const activeCanvasId = useActiveCanvasId()
  const { applyStyle, selectedSlot, target } = useScreenshotStyleTarget()
  const padding = selectedSlot?.padding ?? canvasPadding
  const setPadding = useEditorStore((s) => s.setPadding)
  const setMainScreenshotPadding = useEditorStore(
    (s) => s.setMainScreenshotPadding
  )
  const [draftPadding, setDraftPadding] = React.useState<number | null>(null)
  const displayedPadding = draftPadding ?? padding
  const getPreviewScopeEl = React.useCallback((): HTMLElement | null => {
    if (typeof document === "undefined" || !activeCanvasId) return null
    const canvasEl = document.querySelector<HTMLElement>(
      `[data-canvas-id="${activeCanvasId}"]`
    )
    if (!canvasEl) return null
    if (target === "all") return canvasEl

    const scopeId = target === "slot" ? selectedSlot?.id : "canvas"
    if (!scopeId) return canvasEl
    return (
      canvasEl.querySelector<HTMLElement>(
        `[data-editor-shadow-preview-scope="${scopeId}"]`
      ) ?? canvasEl
    )
  }, [activeCanvasId, selectedSlot?.id, target])
  const setPreviewPadding = React.useCallback(
    (value: number | null) => {
      const el = getPreviewScopeEl()
      if (!el) return
      if (value === null) {
        el.style.removeProperty(PADDING_PREVIEW_VAR)
        return
      }
      el.style.setProperty(
        PADDING_PREVIEW_VAR,
        `${Math.max(0, Math.min(240, value)) / 12}%`
      )
    },
    [getPreviewScopeEl]
  )
  const clearPreviewPaddingAfterPaint = React.useCallback(() => {
    if (typeof requestAnimationFrame === "undefined") return
    requestAnimationFrame(() => setPreviewPadding(null))
  }, [setPreviewPadding])
  const applyPadding = React.useCallback(
    (value: number) => {
      applyStyle(
        { padding: value },
        () => setMainScreenshotPadding(value),
        () => setPadding(value)
      )
      setDraftPadding(null)
      clearPreviewPaddingAfterPaint()
    },
    [
      applyStyle,
      clearPreviewPaddingAfterPaint,
      setMainScreenshotPadding,
      setPadding,
    ]
  )
  const previewPadding = React.useCallback(
    (value: number) => {
      setDraftPadding(value)
      setPreviewPadding(value)
    },
    [setPreviewPadding]
  )
  const quick = [16, 40, 80, 120]
  return (
    <>
      <div className="mb-2 flex items-baseline justify-between">
        <span className="text-[11px] text-muted-foreground">Inset</span>
        <EditableValue
          value={displayedPadding}
          onChange={applyPadding}
          min={0}
          max={240}
          suffix="px"
        />
      </div>
      <Slider
        value={[displayedPadding]}
        onValueChange={([v]) => previewPadding(v)}
        onValueCommit={([v]) => applyPadding(v)}
        max={240}
        className="mb-3 cursor-pointer"
      />
      <div className="grid grid-cols-4 gap-1.5">
        {quick.map((q) => (
          <button
            key={q}
            onClick={() => applyPadding(q)}
            className={cn(
              "tabular h-8 cursor-pointer rounded-md border font-mono text-[11px] transition-colors",
              displayedPadding === q
                ? "border-primary/30 bg-primary text-white"
                : "border-border/60 bg-secondary/40 text-foreground/80 hover:border-foreground/25"
            )}
          >
            {q}
          </button>
        ))}
      </div>
    </>
  )
}
