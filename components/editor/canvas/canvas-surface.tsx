"use client"

import * as React from "react"
import { AnimatePresence, motion } from "motion/react"
import { useShallow } from "zustand/react/shallow"

import { BulkCanvasFlow } from "@/components/editor/bulk-canvas-flow"
import { CornerMarkers } from "@/components/editor/corner-marker"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel"
import { cn } from "@/lib/utils"
import { useEditorStore } from "@/lib/editor/store"

import { CanvasView } from "./canvas-view"
import { BASE_CANVAS_WIDTH } from "./constants"

export function CanvasSurface() {
  const canvasLayoutKeys = useEditorStore(
    useShallow((s) =>
      s.present.canvases.map(
        (canvas) =>
          `${canvas.id}\u0000${canvas.position.x}\u0000${canvas.position.y}`
      )
    )
  )
  const canvasLayouts = React.useMemo(
    () =>
      canvasLayoutKeys.map((key) => {
        const [id, x, y] = key.split("\u0000")
        return { id, position: { x: Number(x), y: Number(y) } }
      }),
    [canvasLayoutKeys]
  )
  const canvasIds = React.useMemo(
    () => canvasLayouts.map((canvas) => canvas.id),
    [canvasLayouts]
  )
  const activeCanvasId = useEditorStore((s) => s.present.activeCanvasId)
  const aspect = useEditorStore((s) => s.present.aspect)
  const canvasZoom = useEditorStore((s) => s.present.canvasZoom)
  const isPreviewMode = useEditorStore((s) => s.isPreviewMode)
  const bulkEditMode = useEditorStore((s) => s.bulkEditMode)
  const setActiveCanvasId = useEditorStore((s) => s.setActiveCanvasId)
  const setSelectedTextId = useEditorStore((s) => s.setSelectedTextId)
  const setSelectedAssetId = useEditorStore((s) => s.setSelectedAssetId)
  const setSelectedAnnotationShapeId = useEditorStore(
    (s) => s.setSelectedAnnotationShapeId
  )
  const setSelectedScreenshotSlotId = useEditorStore(
    (s) => s.setSelectedScreenshotSlotId
  )

  const aw = aspect.w || 16
  const ah = aspect.h || 10
  const widthPx = BASE_CANVAS_WIDTH
  const heightPx = (BASE_CANVAS_WIDTH * ah) / aw

  const zoomScale = isPreviewMode ? 1 : canvasZoom / 100

  const sectionRef = React.useRef<HTMLElement | null>(null)
  const [autoFit, setAutoFit] = React.useState(0.6)
  const [layoutMetrics, setLayoutMetrics] = React.useState({
    topGutter: 24,
    bottomGutter: 96,
  })

  React.useLayoutEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const measure = () => {
      const rect = el.getBoundingClientRect()
      if (!rect.width || !rect.height) return

      const isMobile = window.innerWidth < 768
      const topGutter = isPreviewMode ? 24 : isMobile ? 16 : 24
      const bottomGutter = isPreviewMode
        ? 80
        : isMobile
          ? rect.height * 0.42 + 64
          : 96

      setLayoutMetrics({ topGutter, bottomGutter })

      const hGutter = isMobile ? 32 : 48
      const fitW = Math.max(0, rect.width - hGutter) / widthPx
      const fitH =
        Math.max(0, rect.height - topGutter - bottomGutter) / heightPx
      setAutoFit(Math.max(0.05, Math.min(1, Math.min(fitW, fitH))))
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    window.addEventListener("resize", measure)
    return () => {
      observer.disconnect()
      window.removeEventListener("resize", measure)
    }
  }, [widthPx, heightPx, isPreviewMode])

  const verticalOffset = isPreviewMode
    ? 0
    : (layoutMetrics.topGutter - layoutMetrics.bottomGutter) / 2

  const effectiveScale = autoFit * zoomScale

  const isBulkScroll = bulkEditMode && !isPreviewMode
  const isPreviewCarousel = isPreviewMode && canvasIds.length > 1
  const isPreviewAutoScroll = useEditorStore((s) => s.isPreviewAutoScroll)
  const previewAutoScrollDelay = useEditorStore((s) => s.previewAutoScrollDelay)
  const previewAnimation = useEditorStore((s) => s.previewAnimation)
  const [carouselApi, setCarouselApi] = React.useState<CarouselApi>()
  const [animIndex, setAnimIndex] = React.useState(0)
  const [animDirection, setAnimDirection] = React.useState(1)

  const useCustomAnim = isPreviewCarousel && previewAnimation !== "slide"
  const boundedAnimIndex = canvasIds.length
    ? Math.min(animIndex, canvasIds.length - 1)
    : 0

  const goNext = React.useCallback(() => {
    if (canvasIds.length === 0) return
    setAnimDirection(1)
    setAnimIndex((i) => {
      const next = (i + 1) % canvasIds.length
      setActiveCanvasId(canvasIds[next])
      return next
    })
  }, [canvasIds, setActiveCanvasId])

  const goPrev = React.useCallback(() => {
    if (canvasIds.length === 0) return
    setAnimDirection(-1)
    setAnimIndex((i) => {
      const prev = (i - 1 + canvasIds.length) % canvasIds.length
      setActiveCanvasId(canvasIds[prev])
      return prev
    })
  }, [canvasIds, setActiveCanvasId])

  React.useEffect(() => {
    if (!carouselApi) return
    const onSelect = () => {
      const idx = carouselApi.selectedScrollSnap()
      const canvasId = canvasIds[idx]
      if (canvasId) setActiveCanvasId(canvasId)
    }
    carouselApi.on("select", onSelect)
    return () => {
      carouselApi.off("select", onSelect)
    }
  }, [carouselApi, canvasIds, setActiveCanvasId])

  React.useEffect(() => {
    if (!isPreviewAutoScroll) return
    if (useCustomAnim) {
      const id = setInterval(() => goNext(), previewAutoScrollDelay)
      return () => clearInterval(id)
    }
    if (!carouselApi) return
    const id = setInterval(
      () => carouselApi.scrollNext(),
      previewAutoScrollDelay
    )
    return () => clearInterval(id)
  }, [
    isPreviewAutoScroll,
    carouselApi,
    previewAutoScrollDelay,
    useCustomAnim,
    goNext,
  ])

  const animVariants = React.useMemo(() => {
    if (previewAnimation === "fade") {
      return {
        enter: { opacity: 0 },
        center: { opacity: 1 },
        exit: { opacity: 0 },
      }
    }
    if (previewAnimation === "zoom") {
      return {
        enter: { opacity: 0, scale: 0.88 },
        center: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 1.1 },
      }
    }
    if (previewAnimation === "flip") {
      return {
        enter: (dir: number) => ({ opacity: 0, rotateY: dir > 0 ? -80 : 80 }),
        center: { opacity: 1, rotateY: 0 },
        exit: (dir: number) => ({ opacity: 0, rotateY: dir > 0 ? 80 : -80 }),
      }
    }
    return { enter: {}, center: {}, exit: {} }
  }, [previewAnimation])

  const handleClearSelection = React.useCallback(() => {
    setSelectedTextId(null)
    setSelectedAssetId(null)
    setSelectedAnnotationShapeId(null)
    setSelectedScreenshotSlotId(null)
  }, [
    setSelectedTextId,
    setSelectedAssetId,
    setSelectedAnnotationShapeId,
    setSelectedScreenshotSlotId,
  ])

  return (
    <section
      ref={sectionRef}
      data-editor-canvas-surface
      style={{
        containerType: "size",
        touchAction: "none",
        overscrollBehavior: "none",
      }}
      className={cn(
        "relative z-0 flex flex-1 touch-none overflow-hidden overscroll-none bg-background transition-all duration-300 dark:bg-black",
        isPreviewMode
          ? "items-center justify-center p-0"
          : "border-b border-dashed border-border/70"
      )}
      role="presentation"
      onClick={handleClearSelection}
      onKeyDown={(e) => {
        if (e.key === "Escape") handleClearSelection()
      }}
    >
      <CornerMarkers className="text-border" size={12} />

      {isBulkScroll ? (
        <BulkCanvasFlow />
      ) : useCustomAnim ? (
        <div
          className="relative flex h-full w-full items-center justify-center overflow-hidden"
          style={{ perspective: 1400 }}
        >
          <AnimatePresence mode="wait" custom={animDirection}>
            {canvasIds[boundedAnimIndex] && (
              <motion.div
                key={canvasIds[boundedAnimIndex]}
                custom={animDirection}
                variants={animVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
                className="absolute origin-center"
                style={{ transformStyle: "preserve-3d" }}
              >
                <div
                  className="origin-center"
                  style={{
                    transform: `scale(${effectiveScale})`,
                    width: widthPx,
                    height: heightPx,
                    ["--canvas-fit-scale" as string]: effectiveScale,
                  }}
                >
                  <CanvasView
                    canvasId={canvasIds[boundedAnimIndex]}
                    isActive={true}
                    widthPx={widthPx}
                    heightPx={heightPx}
                    effectiveScale={effectiveScale}
                    onActivate={() => {}}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <button
            type="button"
            onClick={goPrev}
            className="absolute left-4 z-10 flex size-12 cursor-pointer items-center justify-center rounded-full border border-border/50 bg-background/80 shadow-lg backdrop-blur-sm transition-colors hover:bg-background"
            aria-label="Previous"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <button
            type="button"
            onClick={goNext}
            className="absolute right-4 z-10 flex size-12 cursor-pointer items-center justify-center rounded-full border border-border/50 bg-background/80 shadow-lg backdrop-blur-sm transition-colors hover:bg-background"
            aria-label="Next"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      ) : isPreviewCarousel ? (
        <Carousel
          className="h-full w-full"
          opts={{ align: "center", loop: true }}
          setApi={setCarouselApi}
        >
          <CarouselContent wrapperClassName="h-full" className="ml-0 h-full">
            {canvasIds.map((canvasId) => (
              <CarouselItem
                key={canvasId}
                className="flex h-full items-center justify-center pl-0"
              >
                <div
                  className="origin-center"
                  style={{
                    transform: `scale(${effectiveScale})`,
                    width: widthPx,
                    height: heightPx,
                    ["--canvas-fit-scale" as string]: effectiveScale,
                  }}
                >
                  <CanvasView
                    canvasId={canvasId}
                    isActive={canvasId === activeCanvasId}
                    widthPx={widthPx}
                    heightPx={heightPx}
                    effectiveScale={effectiveScale}
                    onActivate={() => setActiveCanvasId(canvasId)}
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-4 size-12 [&_svg]:size-6" />
          <CarouselNext className="right-4 size-12 [&_svg]:size-6" />
        </Carousel>
      ) : (
        <div
          className="absolute top-1/2 left-1/2 origin-center transition-transform duration-200 ease-out"
          style={{
            transform: `translate(-50%, calc(-50% + ${verticalOffset}px)) scale(${effectiveScale})`,
            ["--canvas-fit-scale" as string]: effectiveScale,
          }}
        >
          <div className="relative">
            {canvasLayouts.map((canvas) => {
              const isActive = canvas.id === activeCanvasId
              return (
                <div
                  key={canvas.id}
                  className="absolute"
                  style={{
                    left: canvas.position.x,
                    top: canvas.position.y,
                    transform: "translate(-50%, -50%)",
                    zIndex: isActive ? 10 : 0,
                  }}
                >
                  <CanvasView
                    canvasId={canvas.id}
                    isActive={isActive}
                    widthPx={widthPx}
                    heightPx={heightPx}
                    effectiveScale={effectiveScale}
                    onActivate={() => setActiveCanvasId(canvas.id)}
                  />
                </div>
              )
            })}
          </div>
        </div>
      )}
    </section>
  )
}
