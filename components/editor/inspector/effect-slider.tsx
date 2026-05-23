"use client"

import * as React from "react"

import { EditableValue } from "@/components/editor/editable-value"
import { Slider } from "@/components/ui/slider"

export function EffectSlider({
  label,
  value,
  onChange,
  onPreview,
  min = 0,
  max = 100,
  step,
  suffix,
  disabled = false,
  className,
  sliderClassName,
}: {
  label: string
  value: number
  onChange: (v: number) => void
  onPreview?: (v: number) => void
  min?: number
  max?: number
  step?: number
  suffix?: string
  disabled?: boolean
  className?: string
  sliderClassName?: string
}) {
  const [draft, setDraft] = React.useState<number | null>(null)
  const displayed = draft ?? value
  const resolvedSuffix = suffix ?? (max === 100 ? "%" : "")
  return (
    <div className={className}>
      <div className="mb-1 flex items-baseline justify-between">
        <span className="text-[11px] text-muted-foreground">{label}</span>
        {disabled ? (
          <span className="tabular rounded px-1 font-mono text-[11px] text-foreground/45">
            {displayed}
            {resolvedSuffix}
          </span>
        ) : (
          <EditableValue
            value={displayed}
            onChange={(v) => {
              setDraft(null)
              onChange(v)
            }}
            min={min}
            max={max}
            step={step}
            suffix={resolvedSuffix}
          />
        )}
      </div>
      <Slider
        value={[displayed]}
        onValueChange={([v]) => {
          if (disabled) return
          setDraft(v)
          onPreview?.(v)
        }}
        onValueCommit={([v]) => {
          if (disabled) return
          setDraft(null)
          onChange(v)
        }}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        className={sliderClassName ?? "cursor-pointer"}
      />
    </div>
  )
}
