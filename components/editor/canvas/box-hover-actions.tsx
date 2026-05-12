"use client"

import * as React from "react"
import { RiCropLine, RiDeleteBinLine, RiRefreshLine } from "@remixicon/react"

import { cn } from "@/lib/utils"

type BoxHoverActionsProps = {
  hoverGroupClass: string
  onCrop: () => void
  onReplaceFile: (file: File) => void
  onDelete: () => void
}

export function BoxHoverActions({
  hoverGroupClass,
  onCrop,
  onReplaceFile,
  onDelete,
}: BoxHoverActionsProps) {
  const replaceInputRef = React.useRef<HTMLInputElement>(null)
  return (
    <div
      className={cn(
        "pointer-events-none absolute top-1/2 left-1/2 z-20 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center gap-2 opacity-0 transition-opacity duration-200",
        hoverGroupClass
      )}
    >
      <input
        ref={replaceInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) onReplaceFile(file)
          e.target.value = ""
        }}
      />
      <BoxActionButton label="Crop image" onClick={onCrop}>
        <RiCropLine className="size-4" />
      </BoxActionButton>
      <BoxActionButton
        label="Replace image"
        onClick={() => replaceInputRef.current?.click()}
      >
        <RiRefreshLine className="size-4" />
      </BoxActionButton>
      <BoxActionButton label="Delete image" destructive onClick={onDelete}>
        <RiDeleteBinLine className="size-4" />
      </BoxActionButton>
    </div>
  )
}

function BoxActionButton({
  label,
  destructive,
  onClick,
  children,
}: {
  label: string
  destructive?: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onPointerDown={(e) => e.stopPropagation()}
      onPointerUp={(e) => e.stopPropagation()}
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
      className={cn(
        "pointer-events-auto flex size-9 items-center justify-center rounded-full bg-black/70 text-white shadow-lg ring-1 ring-white/10 backdrop-blur-md transition-all hover:scale-105 hover:bg-black/85",
        destructive && "hover:bg-red-500/90"
      )}
    >
      {children}
    </button>
  )
}
