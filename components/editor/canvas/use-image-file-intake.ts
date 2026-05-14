"use client"

import * as React from "react"
import { toast } from "sonner"

export function useImageFileIntake(onImage: (src: string) => void) {
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const [isDragOver, setIsDragOver] = React.useState(false)

  const readFile = React.useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) {
        toast.error("Please drop an image")
        return
      }

      const reader = new FileReader()
      reader.onload = () => {
        if (typeof reader.result === "string") onImage(reader.result)
      }
      reader.readAsDataURL(file)
    },
    [onImage]
  )

  React.useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items
      if (!items) return

      for (const item of items) {
        if (!item.type.startsWith("image/")) continue
        const file = item.getAsFile()
        if (!file) continue
        readFile(file)
        e.preventDefault()
        break
      }
    }

    window.addEventListener("paste", onPaste)
    return () => window.removeEventListener("paste", onPaste)
  }, [readFile])

  const fileInputProps = {
    ref: fileInputRef,
    type: "file",
    accept: "image/*",
    className: "hidden",
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) readFile(file)
      e.target.value = ""
    },
  }

  const dropHandlers = {
    onDragOver: (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragOver(true)
    },
    onDragLeave: () => setIsDragOver(false),
    onDrop: (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragOver(false)
      const file = e.dataTransfer.files?.[0]
      if (file) readFile(file)
    },
  }

  return {
    fileInputRef,
    fileInputProps,
    isDragOver,
    readFile,
    dropHandlers,
  }
}
