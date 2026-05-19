"use client"

import * as React from "react"
import {
  RiAddLine,
  RiCameraLine,
  RiLink,
  RiSettings3Line,
  RiUploadLine,
} from "@remixicon/react"

import { cn } from "@/lib/utils"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export type CaptureDevice = "desktop" | "mobile"
export type CaptureTheme = "light" | "dark"
export type CaptureDelay = "none" | "2s" | "5s"
export type AspectRatio = "4:3" | "16:9" | "1:1"

export type CaptureSettings = {
  device: CaptureDevice
  aspectRatio: AspectRatio
  width: number
  theme: CaptureTheme
  delay: CaptureDelay
}

export const DEFAULT_CAPTURE_SETTINGS: CaptureSettings = {
  device: "desktop",
  aspectRatio: "16:9",
  width: 1280,
  theme: "light",
  delay: "none",
}

type ToggleChipProps = {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}

function ToggleChip({ active, onClick, children }: ToggleChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      onPointerDown={(e) => e.stopPropagation()}
      className={cn(
        "rounded-lg px-3 py-1.5 text-[12px] font-medium transition-all",
        active
          ? "bg-neutral-200 text-neutral-950 shadow-sm dark:bg-white/15 dark:text-white"
          : "text-neutral-500 hover:text-neutral-800 dark:text-white/60 dark:hover:text-white/85"
      )}
    >
      {children}
    </button>
  )
}

function CaptureSettingsPopover({
  settings,
  onChange,
}: {
  settings: CaptureSettings
  onChange: <K extends keyof CaptureSettings>(
    key: K,
    value: CaptureSettings[K]
  ) => void
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
          aria-label="Capture settings"
          className="grid size-10 shrink-0 place-items-center rounded-md border border-neutral-200 bg-neutral-50 text-neutral-500 transition-all hover:bg-neutral-100 hover:text-neutral-800 data-[state=open]:bg-neutral-100 data-[state=open]:text-neutral-900 dark:border-white/10 dark:bg-white/8 dark:text-white/60 dark:hover:bg-white/12 dark:hover:text-white dark:data-[state=open]:bg-white/15 dark:data-[state=open]:text-white"
        >
          <RiSettings3Line className="size-4" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        side="right"
        align="start"
        sideOffset={10}
        onPointerDown={(e) => e.stopPropagation()}
        className="w-[280px] rounded-2xl border border-neutral-200 bg-white p-0 text-neutral-950 shadow-2xl ring-0 backdrop-blur-xl dark:border-white/10 dark:bg-neutral-950 dark:text-white"
      >
        <div className="flex flex-col divide-y divide-neutral-200 dark:divide-white/10">
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-[13px] text-neutral-500 dark:text-white/55">
              Device
            </span>
            <div className="flex items-center gap-0.5 rounded-xl bg-neutral-100 p-0.5 dark:bg-white/8">
              <ToggleChip
                active={settings.device === "desktop"}
                onClick={() => onChange("device", "desktop")}
              >
                Desktop
              </ToggleChip>
              <ToggleChip
                active={settings.device === "mobile"}
                onClick={() => onChange("device", "mobile")}
              >
                Mobile
              </ToggleChip>
            </div>
          </div>
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-[13px] text-neutral-500 dark:text-white/55">
              Aspect Ratio
            </span>
            <div className="flex items-center gap-0.5 rounded-xl bg-neutral-100 p-0.5 dark:bg-white/8">
              {(["4:3", "16:9", "1:1"] as AspectRatio[]).map((r) => (
                <ToggleChip
                  key={r}
                  active={settings.aspectRatio === r}
                  onClick={() => onChange("aspectRatio", r)}
                >
                  {r}
                </ToggleChip>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-[13px] text-neutral-500 dark:text-white/55">
              Width
            </span>
            <div className="flex items-center gap-0.5 rounded-xl bg-neutral-100 p-0.5 dark:bg-white/8">
              {([1280, 1440, 1920] as number[]).map((w) => (
                <ToggleChip
                  key={w}
                  active={settings.width === w}
                  onClick={() => onChange("width", w)}
                >
                  {w}
                </ToggleChip>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-[13px] text-neutral-500 dark:text-white/55">
              Theme
            </span>
            <div className="flex items-center gap-0.5 rounded-xl bg-neutral-100 p-0.5 dark:bg-white/8">
              <ToggleChip
                active={settings.theme === "light"}
                onClick={() => onChange("theme", "light")}
              >
                Light
              </ToggleChip>
              <ToggleChip
                active={settings.theme === "dark"}
                onClick={() => onChange("theme", "dark")}
              >
                Dark
              </ToggleChip>
            </div>
          </div>
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-[13px] text-neutral-500 dark:text-white/55">
              Delay
            </span>
            <div className="flex items-center gap-0.5 rounded-xl bg-neutral-100 p-0.5 dark:bg-white/8">
              {(["none", "2s", "5s"] as CaptureDelay[]).map((d) => (
                <ToggleChip
                  key={d}
                  active={settings.delay === d}
                  onClick={() => onChange("delay", d)}
                >
                  {d === "none" ? "None" : d}
                </ToggleChip>
              ))}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

type UploadCardProps = {
  isDragOver?: boolean
  onBrowse: () => void
  onCapture?: (url: string, settings: CaptureSettings) => void
  showHint?: boolean
  /** Pass custom className overrides for the outer card shell */
  className?: string
  /** Use cqw-based sizing for container-query contexts (e.g. preset thumbnails) */
  fluid?: boolean
  /** Render only a small trigger icon; full upload UI opens in a popover */
  compact?: boolean
}

export function UploadCard({
  isDragOver = false,
  onBrowse,
  onCapture,
  showHint = false,
  className,
  fluid = false,
  compact = false,
}: UploadCardProps) {
  const PREFIX = "https://"
  const [url, setUrl] = React.useState(PREFIX)
  const [settings, setSettings] = React.useState<CaptureSettings>(
    DEFAULT_CAPTURE_SETTINGS
  )

  function handleSettingChange<K extends keyof CaptureSettings>(
    key: K,
    value: CaptureSettings[K]
  ) {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  function handleUrlChange(value: string) {
    if (!value.startsWith(PREFIX)) {
      setUrl(PREFIX)
      return
    }
    // Strip duplicate protocol if user pastes a full URL into the prefixed input
    const body = value.slice(PREFIX.length)
    const stripped = body.replace(/^https?:\/\//i, "")
    setUrl(PREFIX + stripped)
  }

  function handleCapture(e: React.MouseEvent | React.KeyboardEvent) {
    e.stopPropagation()
    if (url === PREFIX) return
    onCapture?.(url, settings)
  }

  if (compact) {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <button
            type="button"
            data-upload-compact-trigger
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
            aria-label="Add screenshot"
            // Counter-scale by the canvas's autoFit so the `+` keeps a
            // consistent on-screen size — without this, tall portrait
            // canvases shrink the button into illegibility.
            style={{
              transform:
                "scale(clamp(1, calc(1 / var(--canvas-fit-scale, 1)), 3))",
              transformOrigin: "center",
            }}
            className={cn(
              "pointer-events-auto grid place-items-center rounded-full border-2 border-primary bg-white text-neutral-950 shadow-[0_0_0_3px_rgba(0,0,0,0.06),0_6px_20px_-6px_rgba(0,0,0,0.18)] backdrop-blur-sm transition-[background-color,border-color] hover:bg-neutral-50 dark:bg-neutral-900 dark:text-white dark:shadow-[0_0_0_4px_rgba(0,0,0,0.4),0_8px_24px_-8px_rgba(0,0,0,0.6)] dark:hover:bg-neutral-800",
              "size-14",
              className
            )}
          >
            <RiAddLine className="size-7" />
          </button>
        </PopoverTrigger>
        <PopoverContent
          side="bottom"
          align="center"
          sideOffset={8}
          onPointerDown={(e) => e.stopPropagation()}
          className="w-[320px] rounded-2xl border border-neutral-200 bg-white p-0 text-neutral-950 shadow-xl shadow-black/10 dark:border-white/10 dark:bg-neutral-950 dark:text-white dark:shadow-black/40"
        >
          <UploadCard
            isDragOver={isDragOver}
            onBrowse={onBrowse}
            onCapture={onCapture}
            showHint={showHint}
          />
        </PopoverContent>
      </Popover>
    )
  }

  if (fluid) {
    return (
      <div
        className={cn(
          "flex w-full flex-col gap-[2cqw] overflow-hidden p-[2cqw]",
          className
        )}
      >
        <button
          type="button"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation()
            onBrowse()
          }}
          className={cn(
            "flex w-full items-center justify-center gap-[2cqw] rounded-[3cqw] px-[4cqw] py-[3cqw] text-[clamp(0.55rem,2.2cqw,0.9rem)] font-semibold text-white transition-all",
            isDragOver
              ? "bg-primary/70"
              : "bg-primary hover:brightness-110 active:brightness-95"
          )}
        >
          <RiUploadLine className="size-[clamp(0.6rem,2cqw,0.85rem)] shrink-0" />
          Upload Screenshot
        </button>
        <div className="flex items-center gap-[1.5cqw]">
          <label
            onPointerDown={(e) => e.stopPropagation()}
            className="flex min-h-[8cqw] flex-1 items-center gap-[2cqw] rounded-[2.5cqw] bg-foreground/[0.06] px-[3cqw] transition-colors focus-within:bg-foreground/[0.1]"
          >
            <RiLink className="size-[clamp(0.55rem,1.9cqw,0.8rem)] shrink-0 text-muted-foreground/60" />
            <input
              type="text"
              inputMode="url"
              placeholder="example.com"
              aria-label="Website URL"
              value={url}
              onChange={(e) => handleUrlChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCapture(e)
              }}
              className="min-w-0 flex-1 bg-transparent text-[clamp(0.5rem,1.8cqw,0.78rem)] text-foreground placeholder:text-muted-foreground/40 focus:outline-none"
              onClick={(e) => e.stopPropagation()}
            />
          </label>
          <CaptureSettingsPopover
            settings={settings}
            onChange={handleSettingChange}
          />
        </div>
        <button
          type="button"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation()
            handleCapture(e)
          }}
          className="flex w-full items-center justify-center gap-[2cqw] rounded-[2.5cqw] bg-foreground/[0.06] py-[2.5cqw] text-[clamp(0.5rem,1.8cqw,0.78rem)] font-medium text-muted-foreground transition-all hover:bg-foreground/10 hover:text-foreground"
        >
          <RiCameraLine className="size-[clamp(0.55rem,1.9cqw,0.8rem)]" />
          Capture Screenshot
        </button>
        {showHint && (
          <div className="-mx-[2cqw] mt-[0.5cqw] -mb-[2cqw] flex items-center justify-center border-t border-border/30 px-[3cqw] py-[2cqw]">
            <span className="inline-flex items-center gap-[1.5cqw] text-[clamp(0.45rem,1.4cqw,0.7rem)] text-muted-foreground/50">
              <kbd className="rounded border border-border/50 bg-foreground/[0.06] px-[1.2cqw] py-[0.3cqw] font-mono text-[clamp(0.4rem,1.2cqw,0.62rem)] text-muted-foreground">
                ⌘V
              </kbd>
              paste · drop · or click upload
            </span>
          </div>
        )}
      </div>
    )
  }

  return (
    <div
      className={cn(
        "flex flex-col gap-2 p-2.5 text-neutral-950 dark:text-white",
        className
      )}
    >
      <button
        type="button"
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.stopPropagation()
          onBrowse()
        }}
        className={cn(
          "flex w-full items-center justify-center gap-2.5 rounded-lg px-5 py-4 text-[14px] font-semibold tracking-[-0.02em] transition-all",
          isDragOver
            ? "bg-primary/70 text-white"
            : "bg-primary text-white hover:brightness-110 active:brightness-95"
        )}
      >
        <RiUploadLine className="size-4 shrink-0" />
        Upload Screenshot
      </button>
      <div className="flex items-center gap-1.5">
        <label
          onPointerDown={(e) => e.stopPropagation()}
          className="flex min-h-10 flex-1 items-center gap-2 rounded-md border border-neutral-200 bg-neutral-50 px-3 text-left transition-colors focus-within:border-neutral-300 focus-within:bg-white dark:border-white/10 dark:bg-white/8 dark:focus-within:bg-white/12"
        >
          <RiLink className="size-4 shrink-0 text-neutral-400 dark:text-white/35" />
          <input
            type="text"
            inputMode="url"
            placeholder="example.com"
            aria-label="Website URL"
            value={url}
            onChange={(e) => handleUrlChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleCapture(e)
            }}
            className="min-w-0 flex-1 bg-transparent text-[13px] text-neutral-950 placeholder:text-neutral-400 focus:outline-none dark:text-white dark:placeholder:text-white/35"
            onClick={(e) => e.stopPropagation()}
          />
        </label>
        <CaptureSettingsPopover
          settings={settings}
          onChange={handleSettingChange}
        />
      </div>
      <button
        type="button"
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => handleCapture(e)}
        className={cn(
          "flex w-full items-center justify-center gap-2 rounded-md border border-neutral-200 bg-neutral-50 py-2.5 text-[13px] font-medium text-neutral-500 transition-all hover:bg-neutral-100 hover:text-neutral-800 dark:border-white/10 dark:bg-white/8 dark:text-white/45 dark:hover:bg-white/12 dark:hover:text-white/75",
          url === PREFIX && "cursor-default opacity-50"
        )}
      >
        <RiCameraLine className="size-4" />
        Capture Screenshot
      </button>
      {showHint && (
        <div className="-mx-2.5 mt-0.5 -mb-2.5 flex items-center justify-center border-t border-neutral-200 px-4 py-2.5 dark:border-white/10">
          <span className="inline-flex items-center gap-1.5 text-[11px] text-neutral-400 dark:text-white/40">
            <kbd className="rounded border border-neutral-200 bg-neutral-50 px-1.5 py-0.5 font-mono text-[10px] text-neutral-500 dark:border-white/10 dark:bg-white/10 dark:text-white/70">
              ⌘V
            </kbd>
            paste · drop · or click upload
          </span>
        </div>
      )}
    </div>
  )
}
