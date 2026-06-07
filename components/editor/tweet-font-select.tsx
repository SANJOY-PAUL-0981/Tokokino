"use client"

import * as React from "react"
import { RiArrowDownSLine, RiCheckLine } from "@remixicon/react"

import {
  FontFamilyPickerList,
  resolveFontFamilyOption,
} from "@/components/editor/font-family-picker-list"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  DEFAULT_TWEET_FONT_FAMILY,
  TWEET_THEME_OPTIONS,
  type TweetCardSettings,
} from "@/lib/editor/tweet-settings"
import type { FontFamilyOption } from "@/lib/editor/state-types"
import { cn } from "@/lib/utils"

const TWEET_DEFAULT_FONT_OPTION: FontFamilyOption = {
  id: "tweet-default",
  label: "X Default",
  css: DEFAULT_TWEET_FONT_FAMILY,
  category: "system",
}

type TweetFontSelectProps = {
  value: TweetCardSettings["fontFamily"]
  onValueChange: (value: TweetCardSettings["fontFamily"]) => void
  triggerClassName?: string
  contentClassName?: string
}

export function TweetFontSelect({
  value,
  onValueChange,
  triggerClassName,
  contentClassName,
}: TweetFontSelectProps) {
  const [open, setOpen] = React.useState(false)
  const activeFont = resolveFontFamilyOption(value, [TWEET_DEFAULT_FONT_OPTION])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          onPointerDown={(e) => e.stopPropagation()}
          className={cn(
            "flex h-8 w-[156px] items-center justify-between gap-2 rounded-md border border-border/70 bg-secondary/20 px-2 text-left text-[12px] text-foreground transition-colors outline-none hover:bg-secondary/40",
            triggerClassName
          )}
        >
          <span
            className="min-w-0 truncate"
            style={{ fontFamily: activeFont.css }}
          >
            {activeFont.label}
          </span>
          <RiArrowDownSLine
            className={cn(
              "size-3.5 shrink-0 text-muted-foreground transition-transform",
              open && "rotate-180"
            )}
          />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        side="top"
        sideOffset={6}
        onPointerDown={(e) => e.stopPropagation()}
        className={cn(
          "z-1200 flex w-[min(288px,calc(100vw-2rem))] flex-col overflow-hidden rounded-lg border-border/70 bg-popover p-2 shadow-xl",
          contentClassName
        )}
      >
        <FontFamilyPickerList
          value={value}
          pinnedOptions={[TWEET_DEFAULT_FONT_OPTION]}
          className="h-72"
          listClassName="bg-secondary/30"
          onSelect={(fontFamily) => {
            onValueChange(fontFamily)
            setOpen(false)
          }}
        />
      </PopoverContent>
    </Popover>
  )
}

type TweetThemeSelectProps = {
  value: TweetCardSettings["theme"]
  onValueChange: (value: TweetCardSettings["theme"]) => void
  triggerClassName?: string
  contentClassName?: string
}

export function TweetThemeSelect({
  value,
  onValueChange,
  triggerClassName,
  contentClassName,
}: TweetThemeSelectProps) {
  const [open, setOpen] = React.useState(false)
  const activeTheme =
    TWEET_THEME_OPTIONS.find((theme) => theme.id === value) ??
    TWEET_THEME_OPTIONS[0]

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          onPointerDown={(e) => e.stopPropagation()}
          className={cn(
            "flex h-8 w-[156px] items-center justify-between gap-2 rounded-md border border-border/70 bg-secondary/20 px-2 text-left text-[12px] text-foreground transition-colors outline-none hover:bg-secondary/40",
            triggerClassName
          )}
        >
          <span className="flex min-w-0 items-center gap-2 truncate">
            <span
              className="size-3 shrink-0 rounded-full border border-black/10 dark:border-white/15"
              style={{ background: activeTheme?.swatch }}
            />
            <span className="truncate">{activeTheme?.label ?? "Theme"}</span>
          </span>
          <RiArrowDownSLine
            className={cn(
              "size-3.5 shrink-0 text-muted-foreground transition-transform",
              open && "rotate-180"
            )}
          />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        side="bottom"
        sideOffset={6}
        onPointerDown={(e) => e.stopPropagation()}
        className={cn(
          "z-1200 w-[180px] overflow-hidden rounded-lg border-border/70 bg-popover p-1 shadow-xl",
          contentClassName
        )}
      >
        <div className="max-h-48 touch-pan-y overflow-y-auto overscroll-contain pr-1">
          {TWEET_THEME_OPTIONS.map((theme) => {
            const active = theme.id === value
            return (
              <button
                key={theme.id}
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onValueChange(theme.id)
                  setOpen(false)
                }}
                className={cn(
                  "flex min-h-8 w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-[13px] transition-colors",
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-foreground hover:bg-accent"
                )}
              >
                <span
                  className="size-3 shrink-0 rounded-full border border-black/10 dark:border-white/15"
                  style={{ background: theme.swatch }}
                />
                <span className="min-w-0 flex-1 truncate">{theme.label}</span>
                <span className="grid size-4 shrink-0 place-items-center">
                  {active ? <RiCheckLine className="size-4" /> : null}
                </span>
              </button>
            )
          })}
        </div>
      </PopoverContent>
    </Popover>
  )
}
