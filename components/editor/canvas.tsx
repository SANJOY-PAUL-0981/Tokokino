"use client"

import * as React from "react"
import { RiImage2Line } from "@remixicon/react"
import { motion } from "motion/react"
import { toast } from "sonner"

import { CornerMarkers } from "@/components/editor/corner-marker"
import { cn } from "@/lib/utils"
import { backgroundCss, useEditor } from "@/lib/editor/store"

export function Canvas() {
  const {
    screenshot,
    aspect,
    background,
    padding,
    borderRadius,
    tilt,
    scale,
    setScreenshot,
  } = useEditor()
  const [isDragOver, setIsDragOver] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const readFile = React.useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) {
        toast.error("Please drop an image")
        return
      }
      const reader = new FileReader()
      reader.onload = () => {
        if (typeof reader.result === "string") setScreenshot(reader.result)
      }
      reader.readAsDataURL(file)
    },
    [setScreenshot]
  )

  // Paste from clipboard
  React.useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items
      if (!items) return
      for (const item of items) {
        if (item.type.startsWith("image/")) {
          const file = item.getAsFile()
          if (file) {
            readFile(file)
            e.preventDefault()
            break
          }
        }
      }
    }
    window.addEventListener("paste", onPaste)
    return () => window.removeEventListener("paste", onPaste)
  }, [readFile])

  const aspectRatio = `${aspect.w || 16} / ${aspect.h || 10}`

  const transform = [
    `perspective(1400px)`,
    `rotateX(${tilt.rx}deg)`,
    `rotateY(${tilt.ry}deg)`,
    `rotateZ(${tilt.rz}deg)`,
    `scale(${scale / 100})`,
  ].join(" ")

  return (
    <section className="relative flex flex-1 items-center justify-center border-b border-dashed border-border/70 bg-background px-4 py-4 sm:px-8 dark:bg-black">
      <CornerMarkers className="text-border" size={12} />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) readFile(f)
          e.target.value = ""
        }}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.985, y: 6 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        style={{ aspectRatio, ...backgroundCss(background) }}
        className={cn(
          "relative flex w-full max-w-[1100px] items-center justify-center overflow-hidden rounded-2xl ring-1 ring-border/60",
          aspect.h > aspect.w && "max-w-[min(70vh,720px)]"
        )}
        onDragOver={(e) => {
          e.preventDefault()
          setIsDragOver(true)
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={(e) => {
          e.preventDefault()
          setIsDragOver(false)
          const file = e.dataTransfer.files?.[0]
          if (file) readFile(file)
        }}
      >
        <div
          className="relative flex h-full w-full items-center justify-center"
          style={{ padding }}
        >
          {screenshot ? (
            <img
              src={screenshot}
              alt="Screenshot"
              style={{
                borderRadius,
                transform,
                transformStyle: "preserve-3d",
              }}
              className="max-h-full max-w-full object-contain shadow-2xl transition-transform"
            />
          ) : (
            <div
              data-drag-over={isDragOver}
              className={cn(
                "relative flex h-full w-full flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-foreground/25 bg-background/60 text-center backdrop-blur-sm transition-colors",
                "data-[drag-over=true]:border-foreground/60 data-[drag-over=true]:bg-foreground/10"
              )}
            >
              <div className="flex size-10 items-center justify-center rounded-xl border border-border/70 bg-background shadow-sm">
                <RiImage2Line className="size-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-[14px] font-medium">Drop a screenshot</p>
                <p className="mt-1 text-[12px] text-muted-foreground">
                  or{" "}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="text-foreground underline decoration-foreground/30 underline-offset-4 hover:decoration-foreground"
                  >
                    browse
                  </button>{" "}
                  · paste with{" "}
                  <kbd className="inline-flex h-4 min-w-4 items-center justify-center rounded border border-border px-1 font-mono text-[10px]">
                    ⌘V
                  </kbd>
                </p>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </section>
  )
}
