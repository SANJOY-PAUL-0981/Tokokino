"use client"

import { useActiveCanvasField, useEditorStore } from "@/lib/editor/store"
import { cn } from "@/lib/utils"

import { ENHANCE_PRESETS } from "./categories"

export function MobileEnhancePanel() {
  const enhance = useActiveCanvasField((c) => c.enhance)
  const setEnhance = useEditorStore((s) => s.setEnhance)

  return (
    <div className="grid grid-cols-3 gap-2">
      {ENHANCE_PRESETS.map((preset) => (
        <button
          key={preset.id}
          type="button"
          onClick={() => setEnhance(preset.id)}
          className={cn(
            "flex cursor-pointer flex-col items-center gap-1.5 rounded-md border px-2 py-3 text-[11px] transition-all",
            enhance === preset.id
              ? "border-primary/40 bg-primary/10 text-foreground ring-1 ring-primary/20"
              : "border-border/60 bg-secondary/30 text-muted-foreground hover:border-foreground/30 hover:text-foreground"
          )}
        >
          <span
            className="block size-8 rounded-full border border-border/60"
            style={{ background: preset.swatch, filter: preset.filter }}
          />
          <span className="font-medium">{preset.label}</span>
        </button>
      ))}
    </div>
  )
}
