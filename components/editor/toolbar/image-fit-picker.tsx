"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

export type ImageFit = "contain" | "cover" | "fill"

const OPTIONS: ReadonlyArray<{
  value: ImageFit
  label: string
  icon: React.ReactNode
}> = [
  {
    value: "contain",
    label: "Contain",
    icon: (
      <svg viewBox="0 0 32 32" className="size-full" fill="none">
        <rect
          x="2"
          y="2"
          width="28"
          height="28"
          rx="3"
          className="stroke-current opacity-30"
          strokeWidth="1.5"
          strokeDasharray="3 2"
        />
        <rect
          x="7"
          y="5"
          width="18"
          height="22"
          rx="2"
          className="fill-current opacity-25"
        />
        <rect
          x="7"
          y="5"
          width="18"
          height="22"
          rx="2"
          className="stroke-current"
          strokeWidth="1.5"
        />
      </svg>
    ),
  },
  {
    value: "cover",
    label: "Cover",
    icon: (
      <svg viewBox="0 0 32 32" className="size-full" fill="none">
        <rect
          x="2"
          y="2"
          width="28"
          height="28"
          rx="3"
          className="stroke-current opacity-30"
          strokeWidth="1.5"
          strokeDasharray="3 2"
        />
        <rect
          x="2"
          y="2"
          width="28"
          height="28"
          rx="3"
          className="fill-current opacity-25"
        />
        <rect
          x="-2"
          y="4"
          width="36"
          height="24"
          rx="2"
          className="stroke-current"
          strokeWidth="1.5"
        />
      </svg>
    ),
  },
  {
    value: "fill",
    label: "Fill",
    icon: (
      <svg viewBox="0 0 32 32" className="size-full" fill="none">
        <rect
          x="2"
          y="2"
          width="28"
          height="28"
          rx="3"
          className="fill-current opacity-25"
        />
        <rect
          x="2"
          y="2"
          width="28"
          height="28"
          rx="3"
          className="stroke-current"
          strokeWidth="1.5"
        />
        <path
          d="M8 8L5 5M24 8l3-3M8 24l-3 3M24 24l3 3"
          className="stroke-current opacity-50"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
]

export function ImageFitPicker({
  value,
  onChange,
}: {
  value: ImageFit
  onChange: (fit: ImageFit) => void
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="px-1 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
        Image Fit
      </span>
      <div className="grid grid-cols-3 gap-1.5">
        {OPTIONS.map(({ value: optionValue, label, icon }) => (
          <button
            key={optionValue}
            onClick={() => onChange(optionValue)}
            className={cn(
              "flex cursor-pointer flex-col items-center gap-1.5 rounded-md border px-2 py-2.5 text-[11px] transition-all",
              value === optionValue
                ? "border-primary/40 bg-primary/10 text-foreground ring-1 ring-primary/20"
                : "border-border/60 bg-secondary/30 text-muted-foreground hover:border-foreground/30"
            )}
          >
            <span className="size-7">{icon}</span>
            <span className="font-medium">{label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
