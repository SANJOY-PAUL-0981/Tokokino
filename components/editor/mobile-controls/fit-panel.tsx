"use client"

import * as React from "react"
import { RiAddLine, RiFullscreenLine, RiSubtractLine } from "@remixicon/react"

import {
  useActiveCanvasField,
  useEditorStore,
  useSelectedScreenshotSlot,
} from "@/lib/editor/store"
import { editorValueSchemas } from "@/lib/editor/value-schemas"
import { cn } from "@/lib/utils"

export function MobileFitPanel() {
  const selectedSlot = useSelectedScreenshotSlot()
  const screenshot = useActiveCanvasField((c) => c.screenshot)
  const objectFit = useActiveCanvasField((c) => c.objectFit)
  const scale = useActiveCanvasField((c) => c.scale)
  const frame = useActiveCanvasField((c) => c.frame)
  const screenshotSlots = useActiveCanvasField((c) => c.screenshotSlots)
  const setObjectFit = useEditorStore((s) => s.setObjectFit)
  const setScale = useEditorStore((s) => s.setScale)
  const updateScreenshotSlot = useEditorStore((s) => s.updateScreenshotSlot)

  const activeFit = selectedSlot?.objectFit ?? objectFit ?? "cover"
  const activeScale = selectedSlot?.scale ?? scale
  const hasFitTarget = selectedSlot
    ? Boolean(selectedSlot.src)
    : Boolean(screenshot)
  const hasScalableContent =
    selectedSlot ||
    Boolean(screenshot) ||
    frame.id !== "none" ||
    screenshotSlots.length > 0

  const setFit = React.useCallback(
    (fit: "contain" | "cover" | "fill") => {
      if (selectedSlot) {
        updateScreenshotSlot(selectedSlot.id, { objectFit: fit })
        return
      }
      setObjectFit(fit)
    },
    [selectedSlot, setObjectFit, updateScreenshotSlot]
  )

  const setTargetScale = React.useCallback(
    (next: number) => {
      const nextScale = editorValueSchemas.scale.catch(100).parse(next)
      if (selectedSlot) {
        updateScreenshotSlot(selectedSlot.id, { scale: nextScale })
        return
      }
      setScale(nextScale)
    },
    [selectedSlot, setScale, updateScreenshotSlot]
  )

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        {(["cover", "contain", "fill"] as const).map((fit) => (
          <button
            key={fit}
            type="button"
            disabled={!hasFitTarget}
            onClick={() => setFit(fit)}
            className={cn(
              "flex cursor-pointer flex-col items-center gap-1.5 rounded-md border px-2 py-3 text-[11px] capitalize transition-all",
              activeFit === fit
                ? "border-primary/40 bg-primary/10 text-foreground ring-1 ring-primary/20"
                : "border-border/60 bg-secondary/30 text-muted-foreground hover:border-foreground/30 hover:text-foreground",
              !hasFitTarget && "cursor-not-allowed opacity-40"
            )}
          >
            <RiFullscreenLine className="size-5" />
            {fit}
          </button>
        ))}
      </div>
      <div className="flex items-center justify-center gap-2 rounded-md border border-border/60 bg-secondary/20 p-2">
        <button
          type="button"
          disabled={!hasScalableContent || activeScale <= 10}
          onClick={() => setTargetScale(activeScale - 10)}
          className={cn(
            "inline-flex size-8 cursor-pointer items-center justify-center rounded-md text-foreground transition-colors hover:bg-accent",
            (!hasScalableContent || activeScale <= 10) &&
              "cursor-not-allowed opacity-40 hover:bg-transparent"
          )}
        >
          <RiSubtractLine className="size-4" />
        </button>
        <button
          type="button"
          disabled={!hasScalableContent}
          onClick={() => setTargetScale(100)}
          className={cn(
            "min-w-14 cursor-pointer rounded-md px-2 py-1.5 text-center font-mono text-[11px] text-foreground/85 hover:bg-accent",
            !hasScalableContent && "cursor-not-allowed opacity-40"
          )}
        >
          {activeScale}%
        </button>
        <button
          type="button"
          disabled={!hasScalableContent || activeScale >= 300}
          onClick={() => setTargetScale(activeScale + 10)}
          className={cn(
            "inline-flex size-8 cursor-pointer items-center justify-center rounded-md text-foreground transition-colors hover:bg-accent",
            (!hasScalableContent || activeScale >= 300) &&
              "cursor-not-allowed opacity-40 hover:bg-transparent"
          )}
        >
          <RiAddLine className="size-4" />
        </button>
      </div>
    </div>
  )
}
