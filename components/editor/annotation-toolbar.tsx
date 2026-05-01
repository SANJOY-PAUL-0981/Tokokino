"use client"

import * as React from "react"
import {
  RiArrowLeftSLine,
  RiArrowRightUpLine,
  RiBallPenLine,
  RiBlurOffLine,
  RiCheckboxBlankCircleLine,
  RiDeleteBin6Line,
  RiEraserLine,
  RiEqualizerLine,
  RiMarkPenLine,
  RiRectangleLine,
} from "@remixicon/react"

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Slider } from "@/components/ui/slider"
import { ColorPickerPopover } from "@/components/editor/color-picker-popover"
import {
  ANNOTATION_COLORS,
  ANNOTATION_STROKES,
  type AnnotationMode,
  useEditor,
} from "@/lib/editor/store"
import { cn } from "@/lib/utils"

type ToolDef = {
  id: AnnotationMode
  label: string
  shortcut?: string
  icon: React.ComponentType<{ className?: string }>
}

const BRUSHES: ToolDef[] = [
  { id: "pen", label: "Pen", shortcut: "P", icon: RiBallPenLine },
  { id: "highlight", label: "Highlighter", shortcut: "H", icon: RiMarkPenLine },
  { id: "eraser", label: "Eraser", shortcut: "E", icon: RiEraserLine },
]

const SHAPES: ToolDef[] = [
  { id: "arrow", label: "Arrow", shortcut: "A", icon: RiArrowRightUpLine },
  { id: "rect", label: "Rectangle", shortcut: "R", icon: RiRectangleLine },
  {
    id: "ellipse",
    label: "Ellipse",
    shortcut: "O",
    icon: RiCheckboxBlankCircleLine,
  },
  { id: "blur", label: "Blur / Redact", shortcut: "B", icon: RiBlurOffLine },
]

export function AnnotationToolbar({ onExit }: { onExit: () => void }) {
  const { annotation, setAnnotation, clearAnnotations } = useEditor()
  const showColorControls =
    annotation.mode === "pen" || annotation.mode === "highlight"
  const showIntensityControls =
    showColorControls || annotation.mode === "eraser"

  return (
    <div className="flex items-center gap-0.5">
      {/* Exit / mode chip */}
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={onExit}
            aria-label="Exit annotate mode"
            className="group inline-flex h-9 items-center gap-1.5 rounded-lg pl-1.5 pr-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground cursor-pointer"
          >
            <RiArrowLeftSLine className="size-4" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.12em]">
              Annotate
            </span>
          </button>
        </TooltipTrigger>
        <TooltipContent side="top">Exit annotate mode</TooltipContent>
      </Tooltip>

      <Divider />

      {/* Brushes */}
      <ToolGroup>
        {BRUSHES.map((t) => (
          <ToolButton
            key={t.id}
            tool={t}
            active={annotation.mode === t.id}
            tint={annotation.color}
            onClick={() => setAnnotation({ mode: t.id })}
          />
        ))}
      </ToolGroup>

      <Divider />

      {/* Shapes */}
      <ToolGroup>
        {SHAPES.map((t) => (
          <ToolButton
            key={t.id}
            tool={t}
            active={annotation.mode === t.id}
            tint={annotation.color}
            onClick={() => setAnnotation({ mode: t.id })}
          />
        ))}
      </ToolGroup>

      {/* Color row */}
      {showColorControls ? (
        <>
          <Divider />
          <div className="flex items-center gap-1 px-1.5">
            {ANNOTATION_COLORS.map((c) => {
              const isActive =
                annotation.color.toLowerCase() === c.toLowerCase()
              return (
                <button
                  key={c}
                  onClick={() => setAnnotation({ color: c })}
                  aria-label={`Color ${c}`}
                  className="relative size-5 rounded-full cursor-pointer transition-[filter] hover:brightness-110"
                  style={{ background: c }}
                >
                  <span className="absolute inset-0 rounded-full border border-foreground/10" />
                  {isActive && (
                    <span className="absolute left-1/2 top-1/2 size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.25)]" />
                  )}
                </button>
              )
            })}
            <ColorPickerPopover
              value={annotation.color}
              side="top"
              align="center"
              onChange={(hex) => setAnnotation({ color: hex })}
            >
              <button
                aria-label="Custom color"
                title="Custom color"
                className="relative inline-flex size-5 cursor-pointer items-center justify-center overflow-hidden rounded-full border border-foreground/15 transition-[filter] hover:brightness-110"
              >
                <span
                  className="absolute inset-0"
                  style={{
                    background:
                      "conic-gradient(#ef4444, #f59e0b, #eab308, #22c55e, #06b6d4, #3b82f6, #a855f7, #ec4899, #ef4444)",
                  }}
                />
              </button>
            </ColorPickerPopover>
          </div>
        </>
      ) : null}

      {/* Stroke width */}
      {showIntensityControls ? (
        <>
          <Divider />
          <div className="flex items-center gap-0.5 px-1">
            {ANNOTATION_STROKES.map((w) => {
              const isActive = annotation.strokeWidth === w
              return (
                <Tooltip key={w}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => setAnnotation({ strokeWidth: w })}
                      aria-label={`Intensity ${w}px`}
                      className={cn(
                        "inline-flex size-7 items-center justify-center rounded-md transition-colors cursor-pointer hover:bg-accent",
                        isActive && "bg-accent"
                      )}
                    >
                      <span
                        className={cn(
                          "block rounded-full transition-all",
                          isActive ? "bg-foreground" : "bg-foreground/55"
                        )}
                        style={{ width: w + 2, height: w + 2 }}
                      />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top">Intensity {w}px</TooltipContent>
                </Tooltip>
              )
            })}
            <IntensitySliderButton
              value={annotation.strokeWidth}
              onChange={(strokeWidth) => setAnnotation({ strokeWidth })}
            />
          </div>
        </>
      ) : null}

      <Divider />

      {/* Clear */}
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={clearAnnotations}
            aria-label="Clear all annotations"
            className="group inline-flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-red-500/10 hover:text-red-500 cursor-pointer"
          >
            <RiDeleteBin6Line className="size-4" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="top">Clear all</TooltipContent>
      </Tooltip>
    </div>
  )
}

function Divider() {
  return <span className="mx-1 h-5 w-px bg-border" />
}

function ToolGroup({ children }: { children: React.ReactNode }) {
  return <div className="flex items-center gap-0.5">{children}</div>
}

function IntensitySliderButton({
  value,
  onChange,
}: {
  value: number
  onChange: (value: number) => void
}) {
  return (
    <Popover>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <button
              aria-label="Custom intensity"
              className="relative inline-flex size-7 items-center justify-center rounded-md transition-colors cursor-pointer hover:bg-accent"
            >
              <span
                className="block rounded-full bg-foreground/60"
                style={{
                  width: Math.min(22, Math.max(16, value + 8)),
                  height: Math.min(22, Math.max(16, value + 8)),
                }}
              />
              <span className="absolute left-1/2 top-1/2 grid size-4 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-black/45 text-white shadow-sm ring-1 ring-white/15 backdrop-blur-sm">
                <RiEqualizerLine className="size-3" />
              </span>
            </button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent side="top">Custom intensity</TooltipContent>
      </Tooltip>
      <PopoverContent
        side="top"
        align="center"
        sideOffset={10}
        className="w-48 border-border/60 bg-popover/95 p-3 backdrop-blur-md"
      >
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Intensity
            </span>
            <span className="font-mono text-xs text-foreground/80">
              {value}px
            </span>
          </div>
          <Slider
            value={[value]}
            min={1}
            max={32}
            step={1}
            onValueChange={([next]) => {
              if (typeof next === "number") onChange(next)
            }}
          />
        </div>
      </PopoverContent>
    </Popover>
  )
}

function ToolButton({
  tool,
  active,
  tint,
  onClick,
}: {
  tool: ToolDef
  active: boolean
  tint: string
  onClick: () => void
}) {
  const Icon = tool.icon
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={onClick}
          aria-label={tool.label}
          aria-pressed={active}
          className={cn(
            "relative inline-flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors cursor-pointer",
            "hover:bg-accent hover:text-foreground",
            active && "bg-foreground/[0.08] text-foreground"
          )}
        >
          <Icon className="size-4" />
          {active && (
            <span
              className="pointer-events-none absolute bottom-1 left-1/2 h-[3px] w-3 -translate-x-1/2 rounded-full"
              style={{ background: tint }}
            />
          )}
        </button>
      </TooltipTrigger>
      <TooltipContent side="top" className="flex items-center gap-2">
        <span>{tool.label}</span>
        {tool.shortcut && (
          <kbd className="rounded border border-border/60 bg-secondary/60 px-1 font-mono text-[10px] text-muted-foreground">
            {tool.shortcut}
          </kbd>
        )}
      </TooltipContent>
    </Tooltip>
  )
}
