"use client"

import * as React from "react"
import {
  RiArrowUpCircleLine,
  RiCheckLine,
  RiEqualizerLine,
} from "@remixicon/react"
import { AnimatePresence, motion } from "motion/react"
import { toast } from "sonner"
import { useShallow } from "zustand/react/shallow"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { CanvasView } from "@/components/editor/canvas"
import { BASE_CANVAS_WIDTH } from "@/components/editor/canvas/constants"
import {
  exportCanvas,
  getOutputDims,
  EXPORT_FORMAT_EXTENSION,
  EXPORT_FORMAT_LABELS,
  EXPORT_RESOLUTION_LABELS,
  type ExportFormat,
  type ExportResolution,
} from "@/lib/editor/export"
import { useEditorStore } from "@/lib/editor/store"
import type { CanvasState } from "@/lib/editor/store"
import { cn } from "@/lib/utils"
import { SegmentedRow, SummaryRow, SwitchRow } from "./ui"

const EXPORT_FORMATS: ExportFormat[] = ["png", "jpeg", "webp"]
const EXPORT_RESOLUTIONS: ExportResolution[] = ["hd", "4k", "8k"]
const EXPORT_BUTTON_MAX_LABEL = `Export ${EXPORT_RESOLUTION_LABELS["hd"]} • ${EXPORT_FORMAT_LABELS.webp}`

function CanvasPreviewTile({
  canvas,
  index,
  isSelected,
  stageW,
  stageH,
  onToggle,
}: {
  canvas: CanvasState
  index: number
  isSelected: boolean
  stageW: number
  stageH: number
  onToggle: () => void
}) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const [scale, setScale] = React.useState(0.1)

  React.useLayoutEffect(() => {
    const el = containerRef.current
    if (!el) return
    const measure = () => {
      const rect = el.getBoundingClientRect()
      if (!rect.width || !rect.height) return
      setScale(Math.min(rect.width / stageW, rect.height / stageH))
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    return () => observer.disconnect()
  }, [stageW, stageH])

  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        "group flex flex-col rounded-[10px] border-2 p-1.5 text-left transition-all",
        isSelected
          ? "border-primary shadow-lg shadow-primary/20"
          : "border-border/40 opacity-50 hover:border-border hover:opacity-75"
      )}
    >
      <div
        ref={containerRef}
        className="relative isolate w-full overflow-hidden rounded-[6px] [&_*]:pointer-events-none"
        style={{ aspectRatio: `${stageW} / ${stageH}` }}
      >
        <div
          className="absolute top-1/2 left-1/2 origin-center"
          style={{ transform: `translate(-50%, -50%) scale(${scale})` }}
        >
          <CanvasView
            canvasId={`_bulk_export_preview_${canvas.id}`}
            isActive={false}
            widthPx={stageW}
            heightPx={stageH}
            effectiveScale={scale}
            onActivate={() => undefined}
            previewMode
            canvasOverride={canvas}
          />
        </div>
      </div>
      <div className="mt-1.5 flex items-center justify-between px-0.5">
        <span className="text-[11px] font-medium text-foreground/70">
          Canvas {index + 1}
        </span>
        <div
          className={cn(
            "flex size-4 items-center justify-center rounded-full transition-all",
            isSelected ? "bg-primary text-white" : "border border-border/60"
          )}
        >
          {isSelected ? <RiCheckLine className="size-2.5" /> : null}
        </div>
      </div>
    </button>
  )
}

function BulkExportDialog({
  open,
  onOpenChange,
  canvases,
  format,
  setFormat,
  resolution,
  setResolution,
  includeWatermark,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  canvases: CanvasState[]
  format: ExportFormat
  setFormat: (f: ExportFormat) => void
  resolution: ExportResolution
  setResolution: (r: ExportResolution) => void
  includeWatermark: boolean
}) {
  const globalAspect = useEditorStore((s) => s.present.aspect)
  const [selected, setSelected] = React.useState<Set<string>>(
    () => new Set(canvases.map((c) => c.id))
  )
  const [isExporting, setIsExporting] = React.useState(false)
  const [progress, setProgress] = React.useState<{
    done: number
    total: number
  } | null>(null)

  React.useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelected(new Set(canvases.map((c) => c.id)))
      setProgress(null)
    }
  }, [open, canvases])

  const allSelected = canvases.every((c) => selected.has(c.id))
  const noneSelected = selected.size === 0

  const toggleAll = () => {
    if (allSelected) setSelected(new Set())
    else setSelected(new Set(canvases.map((c) => c.id)))
  }

  const toggleOne = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleExport = async () => {
    if (isExporting || noneSelected) return
    const toExport = canvases.filter((c) => selected.has(c.id))
    setIsExporting(true)
    setProgress({ done: 0, total: toExport.length })
    let succeeded = 0
    for (let i = 0; i < toExport.length; i++) {
      try {
        await exportCanvas(toExport[i].id, format, resolution, {
          watermark: includeWatermark,
        })
        succeeded++
      } catch (err) {
        console.error(err)
        toast.error(`Canvas ${i + 1} export failed`)
      }
      setProgress({ done: i + 1, total: toExport.length })
    }
    setIsExporting(false)
    if (succeeded > 0) {
      toast.success(
        succeeded === 1 ? "1 canvas exported" : `${succeeded} canvases exported`
      )
    }
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 p-0 sm:max-w-[560px]">
        <div className="flex items-center justify-between border-b border-border/60 py-4 pr-12 pl-5">
          <div>
            <DialogTitle className="text-[15px]">Export canvases</DialogTitle>
            <DialogDescription className="mt-0.5 text-[12px]">
              Click to toggle which canvases to include
            </DialogDescription>
          </div>
          <button
            type="button"
            onClick={toggleAll}
            className={cn(
              "rounded-full px-3 py-1.5 text-[12px] font-medium transition-colors",
              allSelected
                ? "bg-primary text-white"
                : "bg-secondary text-muted-foreground hover:text-foreground"
            )}
          >
            {allSelected ? "Deselect all" : "Select all"}
          </button>
        </div>

        <div
          className="grid grid-cols-3 gap-3 overflow-y-auto p-4"
          style={{ maxHeight: "340px" }}
        >
          {canvases.map((canvas, idx) => {
            const isChecked = selected.has(canvas.id)
            const aspect = canvas.aspect ?? globalAspect
            const aw = aspect.w || 16
            const ah = aspect.h || 10
            const stageW = BASE_CANVAS_WIDTH
            const stageH = (BASE_CANVAS_WIDTH * ah) / aw
            return (
              <CanvasPreviewTile
                key={canvas.id}
                canvas={canvas}
                index={idx}
                isSelected={isChecked}
                stageW={stageW}
                stageH={stageH}
                onToggle={() => toggleOne(canvas.id)}
              />
            )
          })}
        </div>

        <div className="space-y-3 border-t border-border/60 px-5 py-4">
          <div className="space-y-2">
            <SegmentedRow
              options={EXPORT_FORMATS.map((f) => ({
                value: f,
                label: EXPORT_FORMAT_LABELS[f],
              }))}
              value={format}
              onChange={(v) => setFormat(v as ExportFormat)}
            />
            <SegmentedRow
              options={EXPORT_RESOLUTIONS.map((r) => ({
                value: r,
                label: EXPORT_RESOLUTION_LABELS[r],
              }))}
              value={resolution}
              onChange={(v) => setResolution(v as ExportResolution)}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              size="lg"
              onClick={() => onOpenChange(false)}
              disabled={isExporting}
            >
              Cancel
            </Button>
            <Button
              size="lg"
              onClick={() => void handleExport()}
              disabled={isExporting || noneSelected}
            >
              {isExporting && progress
                ? `Exporting ${progress.done}/${progress.total}…`
                : `Export ${selected.size > 0 ? selected.size : ""} canvas${selected.size !== 1 ? "es" : ""}`}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function ExportControls({
  includeWatermark,
  onIncludeWatermarkChange,
}: {
  includeWatermark: boolean
  onIncludeWatermarkChange: (include: boolean) => void
}) {
  const activeCanvasId = useEditorStore((s) => s.present.activeCanvasId)
  const bulkEditMode = useEditorStore((s) => s.bulkEditMode)
  const canvases = useEditorStore(useShallow((s) => s.present.canvases))
  const setTopBarPopoverOpen = useEditorStore((s) => s.setTopBarPopoverOpen)
  const [format, setFormat] = React.useState<ExportFormat>("png")
  const [resolution, setResolution] = React.useState<ExportResolution>("hd")
  const [isExporting, setIsExporting] = React.useState(false)
  const [open, setOpen] = React.useState(false)
  const [bulkDialogOpen, setBulkDialogOpen] = React.useState(false)

  const handleExport = React.useCallback(async () => {
    if (isExporting) return
    if (bulkEditMode) {
      setBulkDialogOpen(true)
      return
    }
    setIsExporting(true)
    try {
      const filename = await exportCanvas(activeCanvasId, format, resolution, {
        watermark: includeWatermark,
      })
      toast.success(`Saved as ${filename}`)
    } catch (err) {
      console.error(err)
      toast.error("Export failed. Please try again.")
    } finally {
      setIsExporting(false)
    }
  }, [
    activeCanvasId,
    bulkEditMode,
    format,
    includeWatermark,
    resolution,
    isExporting,
  ])

  const dims = open ? getOutputDims(activeCanvasId, resolution) : null
  const dimsLabel = dims ? `${dims.width} × ${dims.height}` : "—"

  return (
    <>
      <div className="flex h-8 items-stretch overflow-hidden rounded-md bg-primary text-white shadow-sm transition-all hover:shadow-md">
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              className="flex items-center gap-2 px-3.5 transition-colors hover:bg-white/10"
              onClick={() => void handleExport()}
            >
              <RiArrowUpCircleLine className="size-4 shrink-0" />
              <span className="relative inline-grid text-[12px] font-medium tracking-tight [&>span]:col-start-1 [&>span]:row-start-1">
                <span
                  className="invisible pr-0.5 whitespace-nowrap"
                  aria-hidden
                >
                  {EXPORT_BUTTON_MAX_LABEL}
                </span>
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={isExporting ? "exporting" : "export"}
                    className="whitespace-nowrap"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.18 }}
                  >
                    {isExporting
                      ? "Exporting…"
                      : `Export ${EXPORT_RESOLUTION_LABELS[resolution]} • ${EXPORT_FORMAT_LABELS[format]}`}
                  </motion.span>
                </AnimatePresence>
              </span>
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom">Export screenshot</TooltipContent>
        </Tooltip>

        <div className="w-px bg-white/20" />

        <Popover
          open={open}
          onOpenChange={(o) => {
            setOpen(o)
            setTopBarPopoverOpen(o)
          }}
        >
          <Tooltip open={open ? false : undefined}>
            <TooltipTrigger asChild>
              <PopoverTrigger asChild>
                <button className="flex items-center px-2.5 transition-colors hover:bg-white/10">
                  <RiEqualizerLine className="size-4" />
                </button>
              </PopoverTrigger>
            </TooltipTrigger>
            <TooltipContent side="bottom">Export settings</TooltipContent>
          </Tooltip>
          <PopoverContent
            align="end"
            sideOffset={8}
            className="w-64 gap-3 rounded-2xl border border-border/60 bg-popover/95 p-2 shadow-2xl backdrop-blur-md data-open:zoom-in-95 data-closed:zoom-out-95"
          >
            <SegmentedRow
              options={EXPORT_FORMATS.map((f) => ({
                value: f,
                label: EXPORT_FORMAT_LABELS[f],
              }))}
              value={format}
              onChange={(v) => setFormat(v as ExportFormat)}
            />
            <SegmentedRow
              options={EXPORT_RESOLUTIONS.map((r) => ({
                value: r,
                label: EXPORT_RESOLUTION_LABELS[r],
              }))}
              value={resolution}
              onChange={(v) => setResolution(v as ExportResolution)}
            />
            <div className="flex flex-col gap-1 px-1 pt-1">
              <SummaryRow label="Resolution" value={dimsLabel} />
              <div className="h-px bg-border/50" />
              <SummaryRow
                label="Format"
                value={EXPORT_FORMAT_EXTENSION[format]}
              />
              <div className="h-px bg-border/50" />
              <SwitchRow
                label="Watermark"
                checked={includeWatermark}
                onCheckedChange={onIncludeWatermarkChange}
              />
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <BulkExportDialog
        open={bulkDialogOpen}
        onOpenChange={setBulkDialogOpen}
        canvases={canvases}
        format={format}
        setFormat={setFormat}
        resolution={resolution}
        setResolution={setResolution}
        includeWatermark={includeWatermark}
      />
    </>
  )
}
