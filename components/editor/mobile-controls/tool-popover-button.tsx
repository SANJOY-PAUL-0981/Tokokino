"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

export function MobileToolPopoverButton({
  label,
  icon: Icon,
  active = false,
  disabled = false,
  onClick,
}: {
  label: React.ReactNode
  icon: React.ComponentType<{ className?: string }>
  active?: boolean
  disabled?: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      aria-label={typeof label === "string" ? label : undefined}
      aria-pressed={active}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-lg border border-transparent bg-secondary/30 px-2 py-3.5 text-foreground transition-colors hover:bg-secondary/70 dark:bg-white/[0.04] dark:hover:bg-white/10",
        active &&
          "border-primary/40 bg-primary/10 text-primary dark:bg-white/10 dark:text-foreground",
        disabled &&
          "cursor-not-allowed text-foreground/35 hover:bg-secondary/30"
      )}
    >
      <Icon className="size-6" />
      <span className="text-center text-[11px] leading-tight font-medium">
        {label}
      </span>
    </button>
  )
}
