"use client"

import * as React from "react"
import { RiCheckLine, RiSearchLine } from "@remixicon/react"

import { Input } from "@/components/ui/input"
import { FONT_FAMILIES } from "@/lib/editor/fonts"
import type { FontCategory, FontFamilyOption } from "@/lib/editor/state-types"
import { cn } from "@/lib/utils"

const CATEGORY_OPTIONS = [
  { id: "all", label: "All" },
  { id: "sans", label: "Sans" },
  { id: "serif", label: "Serif" },
  { id: "mono", label: "Mono" },
  { id: "script", label: "Script" },
  { id: "system", label: "System" },
] as const

type FontFamilyPickerListProps = {
  value: string
  onSelect: (css: string) => void
  pinnedOptions?: FontFamilyOption[]
  className?: string
  listClassName?: string
}

function matchesQuery(font: FontFamilyOption, query: string) {
  if (!query) return true
  return (
    font.label.toLowerCase().includes(query) ||
    font.category.toLowerCase().includes(query)
  )
}

export function FontFamilyPickerList({
  value,
  onSelect,
  pinnedOptions = [],
  className,
  listClassName,
}: FontFamilyPickerListProps) {
  const [fontQuery, setFontQuery] = React.useState("")
  const [fontCategory, setFontCategory] = React.useState<"all" | FontCategory>(
    "all"
  )

  const normalizedQuery = fontQuery.trim().toLowerCase()

  const visiblePinned = pinnedOptions.filter((font) => {
    const categoryOk = fontCategory === "all" || font.category === fontCategory
    return categoryOk && matchesQuery(font, normalizedQuery)
  })

  const visibleFonts = FONT_FAMILIES.filter((font) => {
    const categoryOk = fontCategory === "all" || font.category === fontCategory
    if (!categoryOk) return false
    if (pinnedOptions.some((pinned) => pinned.css === font.css)) return false
    return matchesQuery(font, normalizedQuery)
  })

  return (
    <div className={cn("flex min-h-0 flex-col gap-2", className)}>
      <div className="relative shrink-0">
        <RiSearchLine className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={fontQuery}
          onChange={(e) => setFontQuery(e.target.value)}
          placeholder="Search fonts..."
          className="h-8 !pl-8 text-[12px]"
          onPointerDown={(e) => e.stopPropagation()}
        />
      </div>

      <div className="flex shrink-0 flex-wrap gap-1">
        {CATEGORY_OPTIONS.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              setFontCategory(option.id)
            }}
            className={cn(
              "cursor-pointer rounded-md px-2 py-1 text-[10px] font-medium transition-colors",
              fontCategory === option.id
                ? "bg-accent text-foreground"
                : "bg-secondary/60 text-muted-foreground hover:text-foreground"
            )}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div
        className={cn(
          "min-h-0 flex-1 overflow-y-auto overscroll-contain rounded-md border border-border/50 p-1",
          listClassName
        )}
      >
        <div className="flex flex-col gap-0.5">
          {visiblePinned.map((font) => {
            const active = font.css === value
            return (
              <button
                key={font.id}
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onSelect(font.css)
                }}
                className={cn(
                  "flex cursor-pointer items-center justify-between rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-accent",
                  active && "bg-accent text-foreground"
                )}
                style={{ fontFamily: font.css }}
              >
                <span className="truncate">{font.label}</span>
                <span className="grid size-4 shrink-0 place-items-center">
                  {active ? <RiCheckLine className="size-4" /> : null}
                </span>
              </button>
            )
          })}
          {visibleFonts.map((font) => {
            const active = font.css === value
            return (
              <button
                key={font.id}
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onSelect(font.css)
                }}
                className={cn(
                  "flex cursor-pointer items-center justify-between rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-accent",
                  active && "bg-accent text-foreground"
                )}
                style={{ fontFamily: font.css }}
              >
                <span className="truncate">{font.label}</span>
                <span className="shrink-0 text-[10px] text-muted-foreground uppercase">
                  {font.category}
                </span>
              </button>
            )
          })}
          {visiblePinned.length === 0 && visibleFonts.length === 0 ? (
            <p className="px-2 py-4 text-center font-mono text-[10px] text-muted-foreground">
              No fonts found
            </p>
          ) : null}
        </div>
      </div>
    </div>
  )
}

export function resolveFontFamilyOption(
  value: string,
  pinnedOptions: FontFamilyOption[] = []
): FontFamilyOption {
  const pinned = pinnedOptions.find((font) => font.css === value)
  if (pinned) return pinned

  const match = FONT_FAMILIES.find((font) => font.css === value)
  if (match) return match

  return {
    id: "custom-font",
    label: "Custom font",
    css: value,
    category: "system",
  }
}
