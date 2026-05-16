"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { EmptyStateBackdrop } from "./empty-state-backdrop"
import { UploadCard } from "./upload-card"

type BoxEmptyStateProps = {
  isDragOver?: boolean
  onBrowse: () => void
  onCapture?: () => void
  url?: string
  onUrlChange?: (value: string) => void
  compact?: boolean
}

export function BoxEmptyState({
  isDragOver = false,
  onBrowse,
  onCapture,
  compact = false,
}: BoxEmptyStateProps) {
  return (
    <EmptyStateBackdrop
      data-drag-over={isDragOver}
      className={cn(
        "flex items-center justify-center p-[3cqw] text-white transition-all",
        "data-[drag-over=true]:ring-2 data-[drag-over=true]:ring-primary/40"
      )}
      style={{ containerType: "inline-size" }}
    >
      {compact ? (
        <UploadCard
          compact
          isDragOver={isDragOver}
          onBrowse={onBrowse}
          onCapture={onCapture ? () => onCapture() : undefined}
        />
      ) : (
        <UploadCard
          fluid
          isDragOver={isDragOver}
          onBrowse={onBrowse}
          onCapture={onCapture ? () => onCapture() : undefined}
          className="w-full"
        />
      )}
    </EmptyStateBackdrop>
  )
}
