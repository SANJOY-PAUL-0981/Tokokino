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
}: {
  label: string
  value: number
  onChange: (v: number) => void
  onPreview?: (v: number) => void
  min?: number
  max?: number
  step?: number
  suffix?: string
}) {
  const [draft, setDraft] = React.useState<number | null>(null)
  const displayed = draft ?? value
  const resolvedSuffix = suffix ?? (max === 100 ? "%" : "")
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between">
        <span className="text-[11px] text-muted-foreground">{label}</span>
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
      </div>
      <Slider
        value={[displayed]}
        onValueChange={([v]) => {
          setDraft(v)
          onPreview?.(v)
        }}
        onValueCommit={([v]) => {
          setDraft(null)
          onChange(v)
        }}
        min={min}
        max={max}
        step={step}
        className="cursor-pointer"
      />
    </div>
  )
}
