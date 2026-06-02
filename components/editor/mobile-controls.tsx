"use client"

import * as React from "react"
import { AnimatePresence, LayoutGroup, motion } from "motion/react"
import {
  RiArrowGoBackLine,
  RiArrowGoForwardLine,
  RiArrowRightUpLine,
  RiBrushLine,
  RiCloseLine,
  RiCropLine,
  RiCursorLine,
  RiDragMove2Line,
  RiFullscreenLine,
  RiLayoutGrid2Line,
  RiLayoutMasonryLine,
  RiImageAddLine,
  RiMoonClearLine,
  RiPaletteLine,
  RiPenNibLine,
  RiResetLeftLine,
  RiRotateLockLine,
  RiSettingsLine,
  RiSmartphoneLine,
  RiSparkling2Line,
  RiStackLine,
  RiSubtractLine,
  RiAddLine,
  RiSunLine,
  RiText,
  RiUserLine,
  RiGalleryLine,
  RiHardDrive2Line,
  RiLogoutBoxLine,
} from "@remixicon/react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { AccountAvatar } from "@/components/editor/account-avatar"
import { AnnotationToolbar } from "@/components/editor/annotation-toolbar"
import { LayersPanelContent } from "@/components/editor/layers-popover"
import {
  MobileAspectPicker,
  findAspectOption,
} from "@/components/editor/aspect-popover"
import { MobileFramePicker } from "@/components/editor/frame-popover"
import { PresentPresetsSection } from "@/components/editor/present-presets-section"
import { BackdropSection } from "@/components/editor/inspector/backdrop-section"
import { BackgroundSection } from "@/components/editor/inspector/background-section"
import { BorderSection } from "@/components/editor/inspector/border-section"
import { PaddingSection } from "@/components/editor/inspector/padding-section"
import { ShadowSection } from "@/components/editor/inspector/shadow-section"
import { TiltSection } from "@/components/editor/inspector/tilt-section"
import {
  PositionSwipeField,
  type PositionSwipePoint,
} from "@/components/editor/position-swipe-field"
import {
  clearPositionPreviewVarsAfterPaint,
  setElementPositionPreview,
  setMainScreenshotPositionPreview,
} from "@/components/editor/position-preview-vars"
import { StorageDialog } from "@/components/editor/storage-dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  useActiveCanvasField,
  MAX_SCREENSHOT_SLOTS,
  screenshotPositionAnchor,
  useEditor,
  useEditorStore,
  useSelectedScreenshotSlot,
} from "@/lib/editor/store"
import { computeRowLayout } from "@/lib/editor/screenshot-layout"
import type {
  AspectState,
  DeviceFrame,
  EnhancePreset,
  ScreenshotPosition,
} from "@/lib/editor/store"
import type { ScreenshotSlot } from "@/lib/editor/state-types"
import { editorValueSchemas } from "@/lib/editor/value-schemas"
import { readImageFileAsDataUrl } from "@/lib/editor/image-resize"
import { getFrameAspectCompatibilityWarning } from "@/lib/editor/frame-aspect-compatibility"
import { signOut, useSession } from "@/lib/auth-client"
import { cn } from "@/lib/utils"

type TabId = "design" | "tools"

type CategoryId =
  | "aspect"
  | "frame"
  | "layout"
  | "fit"
  | "move"
  | "layers"
  | "enhance"
  | "text"
  | "annotate"
  | "background"
  | "backdrop"
  | "border"
  | "padding"
  | "shadow"
  | "transform"

type Category = {
  id: CategoryId
  label: string
  icon: React.ComponentType<{ className?: string }>
}

const TABS: {
  id: TabId
  label: string
  icon: React.ComponentType<{ className?: string }>
}[] = [
  { id: "design", label: "Design", icon: RiLayoutMasonryLine },
  { id: "tools", label: "Tools", icon: RiSettingsLine },
]

const DESIGN_CATEGORIES: Category[] = [
  { id: "aspect", label: "Ratio", icon: RiCropLine },
  { id: "frame", label: "Frame", icon: RiSmartphoneLine },
  { id: "layout", label: "Layout", icon: RiLayoutMasonryLine },
  { id: "text", label: "Text", icon: RiText },
  { id: "annotate", label: "Annotate", icon: RiArrowRightUpLine },
  { id: "fit", label: "Fit", icon: RiFullscreenLine },
  { id: "move", label: "Move", icon: RiDragMove2Line },
  { id: "layers", label: "Layers", icon: RiStackLine },
  { id: "enhance", label: "Enhance", icon: RiSparkling2Line },
]

const TOOLS_CATEGORIES: Category[] = [
  { id: "background", label: "Background", icon: RiPaletteLine },
  { id: "backdrop", label: "Backdrop", icon: RiSunLine },
  { id: "border", label: "Border", icon: RiBrushLine },
  { id: "padding", label: "Padding", icon: RiLayoutGrid2Line },
  { id: "shadow", label: "Shadow", icon: RiMoonClearLine },
  { id: "transform", label: "Transform", icon: RiRotateLockLine },
]

const ALL_CATEGORIES = [...DESIGN_CATEGORIES, ...TOOLS_CATEGORIES]

// Most inline panels size to their content, capped at max-h. Layout uses a
// fixed panel height so horizontal preset scrolling never changes the sheet.
const TALL_CATEGORIES = new Set<CategoryId>(["layout", "layers"])

const ENHANCE_PRESETS: {
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

/**
 * Phone control surface (< md). Mirrors the iPad sidebar's two-tab model
 * (Design / Tools) as a centered, rounded segmented control. A floating-tools
 * button sits on the left (reveals compact canvas tools), the account bubble
 * on the right. The active tab's options are a horizontally-scrolling
 * chip strip; tapping a chip opens an inline options panel above the bar —
 * except Frame, which opens a searchable bottom Drawer.
 */
export function MobileControls({
  onOpenChange,
  floatingOpen,
  onFloatingOpenChange,
}: {
  onOpenChange?: (open: boolean) => void
  floatingOpen?: boolean
  onFloatingOpenChange?: (open: boolean) => void
}) {
  const [tab, setTab] = React.useState<TabId>("design")
  const [active, setActive] = React.useState<CategoryId | null>(null)
  const [historyOpen, setHistoryOpen] = React.useState(false)
  const [annotationOpen, setAnnotationOpen] = React.useState(false)
  const [toolsOpen, setToolsOpen] = React.useState(false)
  const assetInputRef = React.useRef<HTMLInputElement>(null)

  const globalAspect = useEditorStore((s) => s.present.aspect)
  const canvasAspect = useActiveCanvasField((c) => c.aspect)
  const bulkEditMode = useEditorStore((s) => s.bulkEditMode)
  const activeCanvasId = useEditorStore((s) => s.present.activeCanvasId)
  const frame = useActiveCanvasField((c) => c.frame)
  const objectFit = useActiveCanvasField((c) => c.objectFit)
  const screenshot = useActiveCanvasField((c) => c.screenshot)
  const screenshotSlots = useActiveCanvasField((c) => c.screenshotSlots)
  const scale = useActiveCanvasField((c) => c.scale)
  const texts = useActiveCanvasField((c) => c.texts)
  const setAspect = useEditorStore((s) => s.setAspect)
  const setCanvasAspect = useEditorStore((s) => s.setCanvasAspect)
  const setFrameForMatchingScreenshots = useEditorStore(
    (s) => s.setFrameForMatchingScreenshots
  )
  const selectedSlot = useSelectedScreenshotSlot()
  const activeTool = useEditorStore((s) => s.present.activeTool)
  const selectedTextId = useEditorStore((s) => s.selectedTextId)
  const addText = useEditorStore((s) => s.addText)
  const addAsset = useEditorStore((s) => s.addAsset)
  const addScreenshotSlot = useEditorStore((s) => s.addScreenshotSlot)
  const setActiveTool = useEditorStore((s) => s.setActiveTool)
  const setObjectFit = useEditorStore((s) => s.setObjectFit)
  const setScale = useEditorStore((s) => s.setScale)
  const updateScreenshotSlot = useEditorStore((s) => s.updateScreenshotSlot)
  const setSelectedTextId = useEditorStore((s) => s.setSelectedTextId)
  const setSelectedAssetId = useEditorStore((s) => s.setSelectedAssetId)
  const setSelectedAnnotationShapeId = useEditorStore(
    (s) => s.setSelectedAnnotationShapeId
  )
  const setSelectedScreenshotSlotId = useEditorStore(
    (s) => s.setSelectedScreenshotSlotId
  )
  const setIsScreenshotSelected = useEditorStore(
    (s) => s.setIsScreenshotSelected
  )

  const frameId = frame.id
  const screenshotBoxCount = useActiveCanvasField(
    (c) => (c.screenshot ? 1 : 0) + c.screenshotSlots.length
  )
  const hasDeviceFrame = frameId !== "none"
  const showPadding = screenshotBoxCount <= 1
  const showBorder = !hasDeviceFrame
  const hasScalableContent =
    Boolean(selectedSlot?.src) ||
    Boolean(screenshot) ||
    hasDeviceFrame ||
    screenshotSlots.length > 0
  const activeScale = selectedSlot?.scale ?? scale

  const aspect = bulkEditMode ? (canvasAspect ?? globalAspect) : globalAspect

  const showCompatibilityWarning = React.useCallback(
    (nextAspect: AspectState, nextFrame: DeviceFrame, aspectName?: string) => {
      const warning = getFrameAspectCompatibilityWarning({
        aspect: nextAspect,
        frame: nextFrame,
        aspectName,
      })
      if (!warning) return
      toast.warning(warning.title, {
        description: warning.description,
        id: "frame-aspect-compatibility",
        position: "top-center",
      })
    },
    []
  )

  const handleAspectChange = React.useCallback(
    (id: string, custom?: { w: number; h: number }) => {
      if (custom) {
        const nextAspect = { id, w: custom.w, h: custom.h }
        if (bulkEditMode) setCanvasAspect(activeCanvasId, nextAspect)
        else setAspect(nextAspect)
        showCompatibilityWarning(nextAspect, frame, "Custom size")
        return
      }
      const opt = findAspectOption(id)
      if (opt) {
        const nextAspect = { id, w: opt.w, h: opt.h }
        if (bulkEditMode) setCanvasAspect(activeCanvasId, nextAspect)
        else setAspect(nextAspect)
        showCompatibilityWarning(nextAspect, frame, opt.name)
      }
    },
    [
      bulkEditMode,
      activeCanvasId,
      setAspect,
      setCanvasAspect,
      frame,
      showCompatibilityWarning,
    ]
  )

  const handleFrameChange = React.useCallback(
    (nextFrame: DeviceFrame) => {
      setFrameForMatchingScreenshots(nextFrame)
      showCompatibilityWarning(
        aspect,
        nextFrame,
        findAspectOption(aspect.id)?.name
      )
    },
    [setFrameForMatchingScreenshots, showCompatibilityWarning, aspect]
  )

  // Filter the active tab's chips down to what's relevant for this canvas.
  const categories = (
    tab === "design" ? DESIGN_CATEGORIES : TOOLS_CATEGORIES
  ).filter((c) => {
    if (c.id === "border") return showBorder
    if (c.id === "padding") return showPadding
    return true
  })

  const resolvedActive =
    active && categories.some((c) => c.id === active) ? active : null

  // The inline panel covers everything except Frame (which uses the Drawer).
  const inlineActive = resolvedActive === "frame" ? null : resolvedActive
  const drawerOpen = resolvedActive === "frame"

  React.useEffect(() => {
    onOpenChange?.(drawerOpen || historyOpen || annotationOpen || toolsOpen)
  }, [annotationOpen, drawerOpen, historyOpen, onOpenChange, toolsOpen])

  const close = React.useCallback(() => {
    setActive(null)
    setHistoryOpen(false)
    setAnnotationOpen(false)
    setToolsOpen(false)
  }, [])

  const openCategory = React.useCallback(
    (id: CategoryId) => {
      setHistoryOpen(false)
      setAnnotationOpen(false)
      setToolsOpen(false)
      onFloatingOpenChange?.(false)
      setActive((prev) => (prev === id ? null : id))
    },
    [onFloatingOpenChange]
  )

  const closePanels = React.useCallback(() => {
    setHistoryOpen(false)
    setAnnotationOpen(false)
    setToolsOpen(false)
    setActive(null)
    onFloatingOpenChange?.(false)
  }, [onFloatingOpenChange])

  const addTextLayer = React.useCallback(() => {
    closePanels()
    const newId = selectedTextId ?? texts.at(-1)?.id ?? addText()
    setSelectedTextId(newId)
    setSelectedAssetId(null)
    setSelectedAnnotationShapeId(null)
    setSelectedScreenshotSlotId(null)
    setIsScreenshotSelected(false)
    setActiveTool("pointer")
  }, [
    addText,
    closePanels,
    selectedTextId,
    setActiveTool,
    setIsScreenshotSelected,
    setSelectedAnnotationShapeId,
    setSelectedAssetId,
    setSelectedScreenshotSlotId,
    setSelectedTextId,
    texts,
  ])

  const startAnnotating = React.useCallback(() => {
    closePanels()
    setSelectedTextId(null)
    setSelectedAssetId(null)
    setSelectedAnnotationShapeId(null)
    setSelectedScreenshotSlotId(null)
    setIsScreenshotSelected(false)
    setActiveTool("arrow")
    setAnnotationOpen(true)
  }, [
    closePanels,
    setActiveTool,
    setIsScreenshotSelected,
    setSelectedAnnotationShapeId,
    setSelectedAssetId,
    setSelectedScreenshotSlotId,
    setSelectedTextId,
  ])

  const addImageAsset = React.useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) {
        toast.error("Please choose an image file")
        return
      }
      void readImageFileAsDataUrl(file, {
        downscaleAbove: 10 * 1024 * 1024,
        maxDimension: 1600,
      })
        .then((src) => {
          const id = addAsset(src)
          setSelectedAssetId(id)
          setSelectedTextId(null)
          setSelectedAnnotationShapeId(null)
          setSelectedScreenshotSlotId(null)
          setIsScreenshotSelected(false)
          setActiveTool("pointer")
          setToolsOpen(false)
        })
        .catch(() => {
          toast.error("Could not read image")
        })
    },
    [
      addAsset,
      setActiveTool,
      setIsScreenshotSelected,
      setSelectedAnnotationShapeId,
      setSelectedAssetId,
      setSelectedScreenshotSlotId,
      setSelectedTextId,
    ]
  )

  const addSlot = React.useCallback(() => {
    const id = addScreenshotSlot()
    if (!id) {
      toast.error(`Screenshot box limit reached (${MAX_SCREENSHOT_SLOTS})`)
      return
    }
    setSelectedScreenshotSlotId(id)
    setSelectedTextId(null)
    setSelectedAssetId(null)
    setSelectedAnnotationShapeId(null)
    setIsScreenshotSelected(false)
    setActiveTool("pointer")
    setToolsOpen(false)
  }, [
    addScreenshotSlot,
    setActiveTool,
    setIsScreenshotSelected,
    setSelectedAnnotationShapeId,
    setSelectedAssetId,
    setSelectedScreenshotSlotId,
    setSelectedTextId,
  ])

  const setTool = React.useCallback(
    (tool: "pointer") => {
      setActiveTool(tool)
      setToolsOpen(false)
    },
    [setActiveTool]
  )

  const adjustScale = React.useCallback(
    (delta: number) => {
      if (!hasScalableContent) return
      const nextScale = editorValueSchemas.scale
        .catch(100)
        .parse(activeScale + delta)
      if (selectedSlot) {
        updateScreenshotSlot(selectedSlot.id, { scale: nextScale })
        return
      }
      setScale(nextScale)
    },
    [
      activeScale,
      hasScalableContent,
      selectedSlot,
      setScale,
      updateScreenshotSlot,
    ]
  )

  const resetScale = React.useCallback(() => {
    if (!hasScalableContent) return
    const nextScale = editorValueSchemas.scale.catch(100).parse(100)
    if (selectedSlot) {
      updateScreenshotSlot(selectedSlot.id, { scale: nextScale })
      return
    }
    setScale(nextScale)
  }, [hasScalableContent, selectedSlot, setScale, updateScreenshotSlot])

  const activeLabel =
    ALL_CATEGORIES.find((c) => c.id === inlineActive)?.label ?? "Controls"

  return (
    <>
      {/* Tap-away layer for panels/popovers. Annotation mode must leave the canvas touchable. */}
      {inlineActive || floatingOpen || historyOpen || toolsOpen ? (
        <button
          type="button"
          aria-hidden
          tabIndex={-1}
          onClick={() => {
            close()
            onFloatingOpenChange?.(false)
          }}
          className="fixed inset-0 z-40 cursor-default md:hidden"
        />
      ) : null}

      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex flex-col items-center gap-2 px-2 pb-[max(env(safe-area-inset-bottom),0.5rem)] md:hidden">
        {/* Scrim — keeps the flat controls legible over a bright canvas */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-44 bg-gradient-to-t from-background via-background/85 to-transparent" />

        {/* Inline options panel (every category except Frame) */}
        <AnimatePresence>
          {inlineActive ? (
            <motion.div
              key="mobile-inline-options"
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className={cn(
                "pointer-events-auto flex w-[min(440px,calc(100vw-1rem))] flex-col overflow-hidden rounded-md border border-border/60 bg-sidebar/95 shadow-xl backdrop-blur",
                inlineActive === "layers"
                  ? "h-[42vh] max-h-[360px] min-h-[260px]"
                  : TALL_CATEGORIES.has(inlineActive)
                    ? "h-[36vh] max-h-[270px] min-h-[240px]"
                    : inlineActive === "move"
                      ? "max-h-[32vh]"
                      : inlineActive === "background" ||
                          inlineActive === "border" ||
                          inlineActive === "shadow"
                        ? "max-h-[38vh]"
                        : "max-h-[46vh]"
              )}
            >
              <div className="flex shrink-0 items-center justify-between px-3 py-2">
                <span className="text-[13px] font-medium text-foreground">
                  {activeLabel}
                </span>
                <button
                  type="button"
                  onClick={close}
                  aria-label="Close"
                  className="inline-flex size-7 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary/70 hover:text-foreground"
                >
                  <RiCloseLine className="size-4" />
                </button>
              </div>
              <div className="flex min-h-0 flex-1 flex-col">
                <motion.div
                  key={inlineActive}
                  initial={{ opacity: 0.72 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.1, ease: "easeOut" }}
                  className="flex min-h-0 flex-1 flex-col"
                >
                  <InlineOptions
                    id={inlineActive}
                    aspect={aspect}
                    objectFit={objectFit}
                    onAspectChange={handleAspectChange}
                    onClose={close}
                  />
                </motion.div>
              </div>
            </motion.div>
          ) : null}
          {!inlineActive && annotationOpen ? (
            <motion.div
              key="mobile-annotation-options"
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="pointer-events-auto flex w-[min(440px,calc(100vw-1rem))] overflow-hidden rounded-md border border-border/60 bg-sidebar/95 p-1 shadow-xl backdrop-blur"
            >
              <AnnotationToolbar
                onExit={() => {
                  setActiveTool("pointer")
                  setAnnotationOpen(false)
                }}
              />
            </motion.div>
          ) : null}
        </AnimatePresence>

        {/* Category chips — flat, horizontal overflow-x scroll for the active tab */}
        <div className="pointer-events-auto flex max-w-full [scrollbar-width:none] items-center gap-0.5 overflow-x-auto px-1 [&::-webkit-scrollbar]:hidden">
          <MobileHistoryButton
            open={historyOpen}
            onOpenChange={(open) => {
              setHistoryOpen(open)
              if (open) {
                setActive(null)
                onFloatingOpenChange?.(false)
              }
            }}
          />
          {categories.map((cat) => {
            const isActive =
              cat.id === "annotate"
                ? annotationOpen || activeTool === "arrow"
                : resolvedActive === cat.id
            const handleClick =
              cat.id === "text"
                ? addTextLayer
                : cat.id === "annotate"
                  ? startAnnotating
                  : () => openCategory(cat.id)
            return (
              <button
                key={cat.id}
                type="button"
                onClick={handleClick}
                aria-pressed={isActive}
                className={cn(
                  "flex shrink-0 cursor-pointer flex-col items-center gap-1 rounded-md border px-3 py-1.5 text-[11px] font-medium transition-colors",
                  isActive
                    ? "border-[#ff5a6f] bg-[#ff5a6f] text-white"
                    : "border-transparent text-foreground/60 hover:bg-[#cfe5b8]/20 hover:text-foreground dark:hover:bg-[#cfe5b8]/10"
                )}
              >
                <cat.icon className="size-5 shrink-0" />
                <span className="whitespace-nowrap">{cat.label}</span>
              </button>
            )
          })}
        </div>

        {/* Main bar: [tools] · [Design | Tools] · [account] */}
        <div className="pointer-events-auto flex w-full items-center justify-between gap-2">
          <Popover
            open={toolsOpen}
            onOpenChange={(open) => {
              setToolsOpen(open)
              if (open) {
                setHistoryOpen(false)
                setAnnotationOpen(false)
                setActive(null)
                onFloatingOpenChange?.(false)
              }
            }}
          >
            <PopoverTrigger asChild>
              <button
                type="button"
                aria-label="Tools"
                aria-pressed={toolsOpen}
                className={cn(
                  "flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors",
                  toolsOpen
                    ? "bg-foreground text-background"
                    : "bg-secondary/50 text-foreground/70 hover:text-foreground"
                )}
              >
                <RiPenNibLine className="size-[18px]" />
              </button>
            </PopoverTrigger>
            <PopoverContent
              side="top"
              align="start"
              sideOffset={8}
              collisionPadding={12}
              className="w-[min(252px,calc(100vw-2rem))] rounded-md border border-border/60 bg-popover/95 px-2.5 py-2 text-popover-foreground shadow-2xl ring-1 ring-foreground/10 backdrop-blur-xl"
            >
              <input
                ref={assetInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0]
                  event.target.value = ""
                  if (file) addImageAsset(file)
                }}
              />
              <div className="grid grid-cols-4 gap-1">
                <MobileToolPopoverButton
                  label="Slot"
                  icon={RiGalleryLine}
                  disabled={screenshotSlots.length >= MAX_SCREENSHOT_SLOTS}
                  onClick={addSlot}
                />
                <MobileToolPopoverButton
                  label="Image"
                  icon={RiImageAddLine}
                  onClick={() => assetInputRef.current?.click()}
                />
                <MobileToolPopoverButton
                  label="Select"
                  icon={RiCursorLine}
                  active={activeTool === "pointer"}
                  onClick={() => setTool("pointer")}
                />
                <MobileToolPopoverButton
                  label="100%"
                  icon={RiFullscreenLine}
                  disabled={!hasScalableContent}
                  onClick={resetScale}
                />
              </div>
              <div className="mt-2 flex items-center justify-center gap-1 border-t border-border/60 pt-2">
                <button
                  type="button"
                  aria-label="Zoom out"
                  disabled={!hasScalableContent || activeScale <= 10}
                  onClick={() => adjustScale(-10)}
                  className={cn(
                    "inline-flex size-7 cursor-pointer items-center justify-center rounded-md text-foreground transition-colors hover:bg-secondary/70 dark:hover:bg-white/5",
                    (!hasScalableContent || activeScale <= 10) &&
                      "cursor-not-allowed text-foreground/35 hover:bg-transparent"
                  )}
                >
                  <RiSubtractLine className="size-4" />
                </button>
                <button
                  type="button"
                  disabled={!hasScalableContent}
                  onClick={resetScale}
                  className={cn(
                    "min-w-11 cursor-pointer rounded-md px-1 py-1 text-center font-mono text-[10px] text-foreground/85 hover:bg-secondary/70 dark:hover:bg-white/5",
                    !hasScalableContent &&
                      "cursor-not-allowed text-foreground/35 hover:bg-transparent"
                  )}
                >
                  {activeScale}%
                </button>
                <button
                  type="button"
                  aria-label="Zoom in"
                  disabled={!hasScalableContent || activeScale >= 300}
                  onClick={() => adjustScale(10)}
                  className={cn(
                    "inline-flex size-7 cursor-pointer items-center justify-center rounded-md text-foreground transition-colors hover:bg-secondary/70 dark:hover:bg-white/5",
                    (!hasScalableContent || activeScale >= 300) &&
                      "cursor-not-allowed text-foreground/35 hover:bg-transparent"
                  )}
                >
                  <RiAddLine className="size-4" />
                </button>
              </div>
            </PopoverContent>
          </Popover>

          <LayoutGroup id="mobile-tabs">
            <div className="flex items-center gap-1 rounded-lg bg-secondary/60 p-1 shadow-lg backdrop-blur">
              {TABS.map((t) => {
                const isActive = tab === t.id
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      setTab(t.id)
                      setActive(null)
                    }}
                    aria-pressed={isActive}
                    className={cn(
                      "relative flex cursor-pointer items-center gap-1.5 rounded-md px-4 py-1.5 text-[13px] font-medium transition-colors",
                      isActive
                        ? "text-white"
                        : "text-foreground/70 hover:text-foreground"
                    )}
                  >
                    {isActive ? (
                      <motion.span
                        layoutId="mobile-tab-pill"
                        className="absolute inset-0 rounded-md bg-[#ff5a6f]"
                        transition={{
                          type: "spring",
                          stiffness: 420,
                          damping: 34,
                        }}
                      />
                    ) : null}
                    <span className="relative z-10 flex items-center gap-1.5">
                      <t.icon className="size-4" />
                      {t.label}
                    </span>
                  </button>
                )
              })}
            </div>
          </LayoutGroup>

          <MobileAccountButton />
        </div>
      </div>

      {/* Frame is the only category that opens a full Drawer (searchable list) */}
      <Drawer
        open={drawerOpen}
        onOpenChange={(open) => {
          if (!open) close()
        }}
      >
        <DrawerContent className="h-[82vh] max-md:flex">
          <DrawerHeader className="shrink-0 px-4 pt-3 pb-2 text-left">
            <DrawerTitle>Frame</DrawerTitle>
          </DrawerHeader>
          <div className="flex min-h-0 flex-1 flex-col">
            {drawerOpen ? (
              <MobileFramePicker
                value={frame}
                onChange={handleFrameChange}
                previewImage={selectedSlot ? selectedSlot.src : undefined}
                imageFit={selectedSlot?.objectFit ?? objectFit ?? "cover"}
              />
            ) : null}
          </div>
        </DrawerContent>
      </Drawer>
    </>
  )
}

function MobileToolPopoverButton({
  label,
  icon: Icon,
  active = false,
  disabled = false,
  onClick,
}: {
  label: string
  icon: React.ComponentType<{ className?: string }>
  active?: boolean
  disabled?: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "flex cursor-pointer flex-col items-center gap-0.5 rounded-md px-1 py-1 text-foreground transition-colors hover:bg-secondary/70 dark:hover:bg-white/5",
        active &&
          "bg-primary/10 text-primary dark:bg-white/10 dark:text-foreground",
        disabled && "cursor-not-allowed text-foreground/35 hover:bg-transparent"
      )}
    >
      <Icon className="size-4.5" />
      <span className="text-[9px] font-medium">{label}</span>
    </button>
  )
}

function MobileHistoryButton({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [resetAlertOpen, setResetAlertOpen] = React.useState(false)
  const undo = useEditorStore((s) => s.undo)
  const redo = useEditorStore((s) => s.redo)
  const reset = useEditorStore((s) => s.reset)
  const canUndo = useEditorStore((s) => s.past.length > 0)
  const canRedo = useEditorStore((s) => s.future.length > 0)

  return (
    <>
      <Popover open={open} onOpenChange={onOpenChange}>
        <PopoverTrigger asChild>
          <button
            type="button"
            aria-label="History"
            aria-pressed={open}
            className={cn(
              "flex shrink-0 cursor-pointer flex-col items-center gap-1 rounded-md border px-3 py-1.5 text-[11px] font-medium transition-colors",
              open
                ? "border-[#ff5a6f] bg-[#ff5a6f] text-white"
                : "border-transparent text-foreground/60 hover:bg-[#cfe5b8]/20 hover:text-foreground dark:hover:bg-[#cfe5b8]/10"
            )}
          >
            <RiArrowGoBackLine className="size-5 shrink-0" />
            <span className="whitespace-nowrap">History</span>
          </button>
        </PopoverTrigger>
        <PopoverContent
          side="top"
          align="center"
          sideOffset={6}
          collisionPadding={12}
          className="w-[min(198px,calc(100vw-2rem))] rounded-md border border-border/60 bg-popover/95 px-2.5 py-2 text-popover-foreground shadow-2xl ring-1 ring-foreground/10 backdrop-blur-xl"
        >
          <div className="grid grid-cols-3 gap-1">
            <button
              type="button"
              aria-label="Undo"
              disabled={!canUndo}
              onClick={() => {
                undo()
                onOpenChange(false)
              }}
              className={cn(
                "flex cursor-pointer flex-col items-center gap-0.5 rounded-md px-1 py-0.5 text-foreground transition-colors hover:bg-secondary/70 dark:hover:bg-white/5",
                !canUndo &&
                  "cursor-not-allowed text-foreground/35 hover:bg-transparent"
              )}
            >
              <RiArrowGoBackLine className="size-4.5" />
              <span className="text-[9px] font-medium">Undo</span>
            </button>
            <button
              type="button"
              aria-label="Redo"
              disabled={!canRedo}
              onClick={() => {
                redo()
                onOpenChange(false)
              }}
              className={cn(
                "flex cursor-pointer flex-col items-center gap-0.5 rounded-md px-1 py-0.5 text-foreground transition-colors hover:bg-secondary/70 dark:hover:bg-white/5",
                !canRedo &&
                  "cursor-not-allowed text-foreground/35 hover:bg-transparent"
              )}
            >
              <RiArrowGoForwardLine className="size-4.5" />
              <span className="text-[9px] font-medium">Redo</span>
            </button>
            <button
              type="button"
              aria-label="Reset all"
              onClick={() => {
                onOpenChange(false)
                setResetAlertOpen(true)
              }}
              className="flex cursor-pointer flex-col items-center gap-0.5 rounded-md px-1 py-0.5 text-foreground transition-colors hover:bg-secondary/70 dark:hover:bg-white/5"
            >
              <RiResetLeftLine className="size-4.5" />
              <span className="text-[9px] font-medium">Reset</span>
            </button>
          </div>
        </PopoverContent>
      </Popover>
      <AlertDialog open={resetAlertOpen} onOpenChange={setResetAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset to defaults?</AlertDialogTitle>
            <AlertDialogDescription>
              This will discard all your changes and restore the editor to its
              default state. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="grid grid-cols-2 gap-2 sm:flex">
            <AlertDialogCancel className="cursor-pointer">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              className="cursor-pointer"
              onClick={() => {
                reset()
                setResetAlertOpen(false)
              }}
            >
              Reset
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

function InlineOptions({
  id,
  aspect,
  objectFit,
  onAspectChange,
  onClose,
}: {
  id: CategoryId
  aspect: AspectState
  objectFit?: "contain" | "cover" | "fill"
  onAspectChange: (id: string, custom?: { w: number; h: number }) => void
  onClose: () => void
}) {
  void objectFit

  if (id === "aspect") {
    return (
      <MobileAspectPicker
        value={aspect.id}
        onChange={onAspectChange}
        onClose={onClose}
      />
    )
  }

  if (id === "layout") {
    return <PresentPresetsSection flat horizontal showPresetHeading={false} />
  }

  if (id === "layers") {
    return (
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-2 pb-4">
        <div className="[&>div]:w-full">
          <LayersPanelContent />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-2 pb-6">
      <div>
        {id === "fit" ? <MobileFitPanel /> : null}
        {id === "move" ? <MobileMovePanel /> : null}
        {id === "enhance" ? <MobileEnhancePanel /> : null}
        {id === "background" ? <BackgroundSection /> : null}
        {id === "backdrop" ? <BackdropSection popoverSide="top" /> : null}
        {id === "border" ? <BorderSection /> : null}
        {id === "padding" ? <PaddingSection /> : null}
        {id === "shadow" ? <ShadowSection /> : null}
        {id === "transform" ? <TiltSection /> : null}
      </div>
    </div>
  )
}

function MobileFitPanel() {
  const selectedSlot = useSelectedScreenshotSlot()
  const screenshot = useActiveCanvasField((c) => c.screenshot)
  const objectFit = useActiveCanvasField((c) => c.objectFit)
  const scale = useActiveCanvasField((c) => c.scale)
  const frame = useActiveCanvasField((c) => c.frame)
  const screenshotSlots = useActiveCanvasField((c) => c.screenshotSlots)
  const setObjectFit = useEditorStore((s) => s.setObjectFit)
  const setScale = useEditorStore((s) => s.setScale)
  const updateScreenshotSlot = useEditorStore((s) => s.updateScreenshotSlot)

  const activeFit = selectedSlot?.objectFit ?? objectFit ?? "cover"
  const activeScale = selectedSlot?.scale ?? scale
  const hasFitTarget = selectedSlot
    ? Boolean(selectedSlot.src)
    : Boolean(screenshot)
  const hasScalableContent =
    selectedSlot ||
    Boolean(screenshot) ||
    frame.id !== "none" ||
    screenshotSlots.length > 0

  const setFit = React.useCallback(
    (fit: "contain" | "cover" | "fill") => {
      if (selectedSlot) {
        updateScreenshotSlot(selectedSlot.id, { objectFit: fit })
        return
      }
      setObjectFit(fit)
    },
    [selectedSlot, setObjectFit, updateScreenshotSlot]
  )

  const setTargetScale = React.useCallback(
    (next: number) => {
      const nextScale = editorValueSchemas.scale.catch(100).parse(next)
      if (selectedSlot) {
        updateScreenshotSlot(selectedSlot.id, { scale: nextScale })
        return
      }
      setScale(nextScale)
    },
    [selectedSlot, setScale, updateScreenshotSlot]
  )

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        {(["cover", "contain", "fill"] as const).map((fit) => (
          <button
            key={fit}
            type="button"
            disabled={!hasFitTarget}
            onClick={() => setFit(fit)}
            className={cn(
              "flex cursor-pointer flex-col items-center gap-1.5 rounded-md border px-2 py-3 text-[11px] capitalize transition-all",
              activeFit === fit
                ? "border-primary/40 bg-primary/10 text-foreground ring-1 ring-primary/20"
                : "border-border/60 bg-secondary/30 text-muted-foreground hover:border-foreground/30 hover:text-foreground",
              !hasFitTarget && "cursor-not-allowed opacity-40"
            )}
          >
            <RiFullscreenLine className="size-5" />
            {fit}
          </button>
        ))}
      </div>
      <div className="flex items-center justify-center gap-2 rounded-md border border-border/60 bg-secondary/20 p-2">
        <button
          type="button"
          disabled={!hasScalableContent || activeScale <= 10}
          onClick={() => setTargetScale(activeScale - 10)}
          className={cn(
            "inline-flex size-8 cursor-pointer items-center justify-center rounded-md text-foreground transition-colors hover:bg-accent",
            (!hasScalableContent || activeScale <= 10) &&
              "cursor-not-allowed opacity-40 hover:bg-transparent"
          )}
        >
          <RiSubtractLine className="size-4" />
        </button>
        <button
          type="button"
          disabled={!hasScalableContent}
          onClick={() => setTargetScale(100)}
          className={cn(
            "min-w-14 cursor-pointer rounded-md px-2 py-1.5 text-center font-mono text-[11px] text-foreground/85 hover:bg-accent",
            !hasScalableContent && "cursor-not-allowed opacity-40"
          )}
        >
          {activeScale}%
        </button>
        <button
          type="button"
          disabled={!hasScalableContent || activeScale >= 300}
          onClick={() => setTargetScale(activeScale + 10)}
          className={cn(
            "inline-flex size-8 cursor-pointer items-center justify-center rounded-md text-foreground transition-colors hover:bg-accent",
            (!hasScalableContent || activeScale >= 300) &&
              "cursor-not-allowed opacity-40 hover:bg-transparent"
          )}
        >
          <RiAddLine className="size-4" />
        </button>
      </div>
    </div>
  )
}

function MobileMovePanel() {
  const editor = useEditor()
  const setActiveTool = useEditorStore((s) => s.setActiveTool)
  const activeCanvasId = useEditorStore((s) => s.present.activeCanvasId)

  React.useEffect(() => {
    setActiveTool("position")
    return () => setActiveTool("pointer")
  }, [setActiveTool])

  const selectedText = editor.selectedTextId
    ? editor.texts.find((text) => text.id === editor.selectedTextId)
    : null
  const selectedAsset = editor.selectedAssetId
    ? editor.assets.find((asset) => asset.id === editor.selectedAssetId)
    : null
  const selectedAnnotation = editor.selectedAnnotationShapeId
    ? editor.annotationShapes.find(
        (shape) => shape.id === editor.selectedAnnotationShapeId
      )
    : null
  const selectedSlot = editor.selectedScreenshotSlotId
    ? editor.screenshotSlots.find(
        (slot) => slot.id === editor.selectedScreenshotSlotId
      )
    : null
  const hasDeviceFrame = editor.frame.id !== "none"
  const hasMainTarget = Boolean(editor.screenshot) || hasDeviceFrame
  const hasSlotGroup = editor.screenshotSlots.length > 0
  const targetLabel = selectedText
    ? "text"
    : selectedAsset
      ? "image"
      : selectedAnnotation
        ? "annotation"
        : selectedSlot
          ? "screenshot box"
          : hasMainTarget
            ? hasDeviceFrame
              ? "device frame"
              : "screenshot"
            : hasSlotGroup
              ? "screenshot boxes"
              : "nothing"

  const getActiveCanvasElement = React.useCallback(() => {
    if (typeof document === "undefined" || !activeCanvasId) return null
    return document.querySelector<HTMLElement>(
      `[data-canvas-id="${CSS.escape(activeCanvasId)}"]`
    )
  }, [activeCanvasId])

  const queryActiveCanvasElement = React.useCallback(
    (selector: string) =>
      getActiveCanvasElement()?.querySelector<HTMLElement>(selector) ?? null,
    [getActiveCanvasElement]
  )

  const collectPositionPreviewElements = React.useCallback(() => {
    const canvasElement = getActiveCanvasElement()
    if (!canvasElement) return []

    const elements: Array<HTMLElement | null> = [canvasElement]
    if (selectedText) {
      elements.push(
        canvasElement.querySelector<HTMLElement>(
          `[data-editor-text-id="${CSS.escape(selectedText.id)}"]`
        )
      )
    }
    if (selectedAsset) {
      elements.push(
        canvasElement.querySelector<HTMLElement>(
          `[data-editor-asset-id="${CSS.escape(selectedAsset.id)}"]`
        )
      )
    }
    if (selectedAnnotation) {
      elements.push(
        canvasElement.querySelector<HTMLElement>(
          `[data-annotation-shape-id="${CSS.escape(selectedAnnotation.id)}"]`
        )
      )
    }
    for (const slot of editor.screenshotSlots) {
      elements.push(
        canvasElement.querySelector<HTMLElement>(
          `[data-screenshot-slot-id="${CSS.escape(slot.id)}"]`
        )
      )
    }
    return elements
  }, [
    editor.screenshotSlots,
    getActiveCanvasElement,
    selectedAnnotation,
    selectedAsset,
    selectedText,
  ])

  const currentPosition = React.useMemo<PositionSwipePoint | null>(() => {
    if (selectedText)
      return { xPct: selectedText.xPct, yPct: selectedText.yPct }
    if (selectedAsset)
      return { xPct: selectedAsset.xPct, yPct: selectedAsset.yPct }
    if (selectedAnnotation) {
      return {
        xPct: selectedAnnotation.xPct,
        yPct: selectedAnnotation.yPct,
      }
    }
    if (selectedSlot)
      return { xPct: selectedSlot.xPct, yPct: selectedSlot.yPct }
    if (hasMainTarget) {
      const point = mainScreenshotPositionPct({
        aspect: editor.aspect,
        frame: editor.frame,
        position: editor.screenshotPosition,
        offset: editor.screenshotOffset,
        slots: editor.screenshotSlots,
      })
      return { xPct: clampPercent(point.xPct), yPct: clampPercent(point.yPct) }
    }
    if (hasSlotGroup) return screenshotSlotGroupCenter(editor.screenshotSlots)
    return null
  }, [
    editor.aspect,
    editor.frame,
    editor.screenshotOffset,
    editor.screenshotPosition,
    editor.screenshotSlots,
    hasMainTarget,
    hasSlotGroup,
    selectedAnnotation,
    selectedAsset,
    selectedSlot,
    selectedText,
  ])

  const previewMoveTo = React.useCallback(
    (point: PositionSwipePoint) => {
      const safePoint = {
        xPct: clampPercent(point.xPct),
        yPct: clampPercent(point.yPct),
      }
      const canvasElement = getActiveCanvasElement()
      if (!canvasElement) return

      if (selectedText) {
        setElementPositionPreview(
          queryActiveCanvasElement(
            `[data-editor-text-id="${CSS.escape(selectedText.id)}"]`
          ),
          safePoint
        )
        return
      }
      if (selectedAsset) {
        setElementPositionPreview(
          queryActiveCanvasElement(
            `[data-editor-asset-id="${CSS.escape(selectedAsset.id)}"]`
          ),
          safePoint
        )
        return
      }
      if (selectedAnnotation) {
        setElementPositionPreview(
          queryActiveCanvasElement(
            `[data-annotation-shape-id="${CSS.escape(selectedAnnotation.id)}"]`
          ),
          safePoint
        )
        return
      }
      if (selectedSlot) {
        setElementPositionPreview(
          queryActiveCanvasElement(
            `[data-screenshot-slot-id="${CSS.escape(selectedSlot.id)}"]`
          ),
          safePoint
        )
        return
      }
      if (hasMainTarget) {
        setMainScreenshotPositionPreview(canvasElement, safePoint)
        return
      }
      if (hasSlotGroup) {
        const center = screenshotSlotGroupCenter(editor.screenshotSlots)
        if (!center) return
        const dx = safePoint.xPct - center.xPct
        const dy = safePoint.yPct - center.yPct
        for (const slot of editor.screenshotSlots) {
          setElementPositionPreview(
            queryActiveCanvasElement(
              `[data-screenshot-slot-id="${CSS.escape(slot.id)}"]`
            ),
            {
              xPct: clampPercent(slot.xPct + dx),
              yPct: clampPercent(slot.yPct + dy),
            }
          )
        }
      }
    },
    [
      editor.screenshotSlots,
      getActiveCanvasElement,
      hasMainTarget,
      hasSlotGroup,
      queryActiveCanvasElement,
      selectedAnnotation,
      selectedAsset,
      selectedSlot,
      selectedText,
    ]
  )

  const moveTo = React.useCallback(
    (point: PositionSwipePoint) => {
      const safePoint = {
        xPct: clampPercent(point.xPct),
        yPct: clampPercent(point.yPct),
      }
      const position = positionIdFromPercent(safePoint.xPct, safePoint.yPct)

      try {
        if (selectedText) {
          editor.updateText(selectedText.id, safePoint)
          return
        }
        if (selectedAsset) {
          editor.updateAsset(selectedAsset.id, safePoint)
          return
        }
        if (selectedAnnotation) {
          editor.updateAnnotationShape(selectedAnnotation.id, safePoint)
          return
        }
        if (selectedSlot) {
          editor.updateScreenshotSlot(selectedSlot.id, safePoint)
          return
        }
        if (hasMainTarget) {
          editor.setScreenshotPlacement(
            position,
            mainScreenshotOffsetForPoint({
              aspect: editor.aspect,
              frame: editor.frame,
              position,
              slots: editor.screenshotSlots,
              point: safePoint,
            })
          )
          return
        }
        if (hasSlotGroup) {
          editor.setScreenshotSlotGroupPosition(safePoint)
        }
      } finally {
        clearPositionPreviewVarsAfterPaint(collectPositionPreviewElements())
      }
    },
    [
      collectPositionPreviewElements,
      editor,
      hasMainTarget,
      hasSlotGroup,
      selectedAnnotation,
      selectedAsset,
      selectedSlot,
      selectedText,
    ]
  )

  return (
    <div className="mx-auto w-full max-w-[360px] px-1">
      <PositionSwipeField
        ariaLabel={`Move ${targetLabel}`}
        disabled={targetLabel === "nothing"}
        value={currentPosition}
        onPreview={previewMoveTo}
        onChange={moveTo}
      />
    </div>
  )
}

type PercentPoint = { xPct: number; yPct: number }
type PercentBox = PercentPoint & { widthPct: number; heightPct: number }

const BASE_CANVAS_WIDTH = 1100

function clampPercent(value: number) {
  return Math.max(0, Math.min(100, value))
}

function positionIdFromPercent(xPct: number, yPct: number): ScreenshotPosition {
  const col = Math.round(Math.max(0, Math.min(4, xPct / 25)))
  const row = Math.round(Math.max(0, Math.min(4, yPct / 25)))
  if (col === 2 && row === 2) return "center"
  return `${row}-${col}` as ScreenshotPosition
}

function canvasDimsFromAspect(aspect: AspectState) {
  const aw = aspect.w || 16
  const ah = aspect.h || 10
  return {
    width: BASE_CANVAS_WIDTH,
    height: (BASE_CANVAS_WIDTH * ah) / aw,
    ratio: aw / ah,
  }
}

function mainScreenshotPositionPct({
  aspect,
  frame,
  position,
  offset,
  slots,
}: {
  aspect: AspectState
  frame: DeviceFrame
  position: ScreenshotPosition
  offset: { x: number; y: number }
  slots: ScreenshotSlot[]
}): PercentPoint {
  const dims = canvasDimsFromAspect(aspect)

  if (slots.length > 0) {
    const rowLayout = computeRowLayout(
      [
        { id: "__main__", frame },
        ...slots.map((slot) => ({ id: slot.id, frame })),
      ],
      dims.ratio
    )
    const mainLayout = rowLayout[0]
    if (mainLayout) {
      const anchor = screenshotPositionAnchor(position)
      const baseX = position === "center" ? mainLayout.xPct : anchor.x
      const baseY = position === "center" ? 50 : anchor.y
      return {
        xPct: baseX + (offset.x / dims.width) * 100,
        yPct: baseY + (offset.y / dims.height) * 100,
      }
    }
  }

  const anchor = screenshotPositionAnchor(position)
  return {
    xPct: anchor.x + (offset.x / dims.width) * 100,
    yPct: anchor.y + (offset.y / dims.height) * 100,
  }
}

function mainScreenshotOffsetForPoint({
  aspect,
  frame,
  position,
  slots,
  point,
}: {
  aspect: AspectState
  frame: DeviceFrame
  position: ScreenshotPosition
  slots: ScreenshotSlot[]
  point: PercentPoint
}) {
  const dims = canvasDimsFromAspect(aspect)
  const anchor = screenshotPositionAnchor(position)
  let baseX = anchor.x
  let baseY = anchor.y

  if (slots.length > 0 && position === "center") {
    const rowLayout = computeRowLayout(
      [
        { id: "__main__", frame },
        ...slots.map((slot) => ({ id: slot.id, frame })),
      ],
      dims.ratio
    )
    const mainLayout = rowLayout[0]
    if (mainLayout) {
      baseX = mainLayout.xPct
      baseY = 50
    }
  }

  return {
    x: ((point.xPct - baseX) / 100) * dims.width,
    y: ((point.yPct - baseY) / 100) * dims.height,
  }
}

function screenshotSlotGroupCenter(slots: ScreenshotSlot[]) {
  if (slots.length === 0) return null
  const boxes: PercentBox[] = slots.map((slot) => ({
    xPct: slot.xPct,
    yPct: slot.yPct,
    widthPct: slot.widthPct,
    heightPct: slot.heightPct,
  }))
  const bounds = boxes.reduce(
    (acc, box) => ({
      minX: Math.min(acc.minX, box.xPct - box.widthPct / 2),
      maxX: Math.max(acc.maxX, box.xPct + box.widthPct / 2),
      minY: Math.min(acc.minY, box.yPct - box.heightPct / 2),
      maxY: Math.max(acc.maxY, box.yPct + box.heightPct / 2),
    }),
    {
      minX: Number.POSITIVE_INFINITY,
      maxX: Number.NEGATIVE_INFINITY,
      minY: Number.POSITIVE_INFINITY,
      maxY: Number.NEGATIVE_INFINITY,
    }
  )
  return {
    xPct: clampPercent((bounds.minX + bounds.maxX) / 2),
    yPct: clampPercent((bounds.minY + bounds.maxY) / 2),
  }
}

function MobileEnhancePanel() {
  const enhance = useActiveCanvasField((c) => c.enhance)
  const setEnhance = useEditorStore((s) => s.setEnhance)

  return (
    <div className="grid grid-cols-3 gap-2">
      {ENHANCE_PRESETS.map((preset) => (
        <button
          key={preset.id}
          type="button"
          onClick={() => setEnhance(preset.id)}
          className={cn(
            "flex cursor-pointer flex-col items-center gap-1.5 rounded-md border px-2 py-3 text-[11px] transition-all",
            enhance === preset.id
              ? "border-primary/40 bg-primary/10 text-foreground ring-1 ring-primary/20"
              : "border-border/60 bg-secondary/30 text-muted-foreground hover:border-foreground/30 hover:text-foreground"
          )}
        >
          <span
            className="block size-8 rounded-full border border-border/60"
            style={{ background: preset.swatch, filter: preset.filter }}
          />
          <span className="font-medium">{preset.label}</span>
        </button>
      ))}
    </div>
  )
}

function MobileAccountButton() {
  const { data: session } = useSession()
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  const [storageOpen, setStorageOpen] = React.useState(false)
  const user = session?.user

  const triggerClass =
    "flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full bg-secondary/50 text-foreground/70 transition-colors hover:text-foreground"

  if (!user) {
    return (
      <button
        type="button"
        onClick={() => router.push("/login")}
        className={triggerClass}
        aria-label="Sign in"
      >
        <RiUserLine className="size-[18px]" />
      </button>
    )
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button type="button" className={triggerClass} aria-label="Account">
          <AccountAvatar
            src={user.image}
            name={user.name}
            className="size-7 rounded-full ring-1 ring-border/70"
            iconClassName="size-[18px]"
          />
        </button>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="end"
        sideOffset={8}
        collisionPadding={12}
        className="w-48 p-1"
      >
        <button
          type="button"
          onClick={() => {
            setOpen(false)
            router.push("/app/shares")
          }}
          className="flex w-full cursor-pointer items-center gap-2.5 rounded-md px-3 py-2 text-[13px] text-foreground transition-colors hover:bg-accent"
        >
          <RiGalleryLine className="size-4 text-muted-foreground" />
          My Shares
        </button>
        <button
          type="button"
          onClick={() => {
            setOpen(false)
            setStorageOpen(true)
          }}
          className="flex w-full cursor-pointer items-center gap-2.5 rounded-md px-3 py-2 text-[13px] text-foreground transition-colors hover:bg-accent"
        >
          <RiHardDrive2Line className="size-4 text-muted-foreground" />
          Storage
        </button>
        <button
          type="button"
          onClick={() => {
            setOpen(false)
            void signOut()
          }}
          className="flex w-full cursor-pointer items-center gap-2.5 rounded-md px-3 py-2 text-[13px] text-destructive transition-colors hover:bg-destructive/10"
        >
          <RiLogoutBoxLine className="size-4" />
          Sign out
        </button>
      </PopoverContent>
      <StorageDialog open={storageOpen} onOpenChange={setStorageOpen} />
    </Popover>
  )
}
