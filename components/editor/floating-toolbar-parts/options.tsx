import * as React from "react"

import type { EnhancePreset } from "@/lib/editor/store"

export const FIT_OPTIONS: {
  value: "contain" | "cover" | "fill"
  label: string
  icon: React.ReactNode
}[] = [
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

export const ENHANCE_PRESETS: {
  id: EnhancePreset
  label: string
  swatch: string
  filter?: string
}[] = [
  { id: "off", label: "Off", swatch: "linear-gradient(135deg,#888,#555)" },
  {
    id: "auto",
    label: "Auto",
    swatch: "linear-gradient(135deg,#7dd3fc,#a78bfa)",
    filter: "brightness(1.04) contrast(1.08) saturate(1.1)",
  },
  {
    id: "vivid",
    label: "Vivid",
    swatch: "linear-gradient(135deg,#f43f5e,#f59e0b)",
    filter: "saturate(1.35) contrast(1.12)",
  },
  {
    id: "soft",
    label: "Soft",
    swatch: "linear-gradient(135deg,#fde2e4,#cdb4db)",
    filter: "brightness(1.06) saturate(0.9)",
  },
  {
    id: "dramatic",
    label: "Dramatic",
    swatch: "linear-gradient(135deg,#1f2937,#6b7280)",
    filter: "contrast(1.25) saturate(1.2)",
  },
  {
    id: "sharp",
    label: "Sharp",
    swatch: "linear-gradient(135deg,#10b981,#0ea5e9)",
    filter: "contrast(1.18)",
  },
]
