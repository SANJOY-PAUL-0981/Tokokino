"use client"

import * as React from "react"

import { DeviceFrameEmptyContent } from "@/components/editor/canvas/device-frame-empty-content"
import { cn } from "@/lib/utils"

type BoxEmptyStateProps = {
  isDragOver?: boolean
  onBrowse: () => void
  onCapture?: () => void
  url?: string
  onUrlChange?: (value: string) => void
}

export function BoxEmptyState({
  isDragOver = false,
  onBrowse,
  onCapture,
  url,
  onUrlChange,
}: BoxEmptyStateProps) {
  return (
    <div
      data-drag-over={isDragOver}
      className={cn(
        "relative size-full bg-black/40 text-white transition-all",
        "data-[drag-over=true]:bg-primary/15 data-[drag-over=true]:ring-2 data-[drag-over=true]:ring-primary/60"
      )}
      style={{
        backgroundImage:
          "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.06) 1px, transparent 0)",
        backgroundSize: "16px 16px",
        containerType: "inline-size",
      }}
    >
      <DeviceFrameEmptyContent
        url={url}
        onUrlChange={onUrlChange}
        onBrowse={onBrowse}
        onCapture={onCapture}
      />
    </div>
  )
}
