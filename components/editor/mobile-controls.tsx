"use client"

import * as React from "react"
import { AnimatePresence, motion } from "motion/react"
import {
  RiBrushLine,
  RiLayoutGrid2Line,
  RiLayoutMasonryLine,
  RiMoonClearLine,
  RiPaletteLine,
  RiRotateLockLine,
  RiSunLine,
  RiUserLine,
  RiGalleryLine,
  RiHardDrive2Line,
  RiLogoutBoxLine,
} from "@remixicon/react"
import { useRouter } from "next/navigation"

import { EffectsSidebar } from "@/components/editor/effects-sidebar"
import { BackdropSection } from "@/components/editor/inspector/backdrop-section"
import { BackgroundSection } from "@/components/editor/inspector/background-section"
import { BorderSection } from "@/components/editor/inspector/border-section"
import { PaddingSection } from "@/components/editor/inspector/padding-section"
import { Section } from "@/components/editor/inspector/primitives"
import { ShadowSection } from "@/components/editor/inspector/shadow-section"
import { TiltSection } from "@/components/editor/inspector/tilt-section"
import { StorageDialog } from "@/components/editor/storage-dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useActiveCanvasField } from "@/lib/editor/store"
import { signOut, useSession } from "@/lib/auth-client"
import { cn } from "@/lib/utils"

type CategoryId = "layout" | "style" | "border" | "shadow" | "details"

const CATEGORIES: {
  id: CategoryId
  label: string
  icon: React.ComponentType<{ className?: string }>
}[] = [
  { id: "layout", label: "Layout", icon: RiLayoutMasonryLine },
  { id: "style", label: "Style", icon: RiPaletteLine },
  { id: "border", label: "Border", icon: RiBrushLine },
  { id: "shadow", label: "Shadow", icon: RiMoonClearLine },
  { id: "details", label: "Transform", icon: RiRotateLockLine },
]

/**
 * Phone control surface (< md). The canvas owns the whole screen; this floats
 * over the bottom as a collapsed icon strip. Tapping a category slides its
 * panel up above the strip (tap the active one again to collapse). iPad widths
 * use the left IpadSidebar; desktop uses the two inline panels.
 */
const CATEGORY_ORDER: CategoryId[] = [
  "layout",
  "style",
  "border",
  "shadow",
  "details",
]

export function MobileControls({
  onOpenChange,
}: {
  onOpenChange?: (open: boolean) => void
}) {
  const [active, setActive] = React.useState<CategoryId | null>(null)
  const [direction, setDirection] = React.useState<1 | -1>(1)
  const frameId = useActiveCanvasField((c) => c.frame.id)
  const screenshotBoxCount = useActiveCanvasField(
    (c) => (c.screenshot ? 1 : 0) + c.screenshotSlots.length
  )
  const hasDeviceFrame = frameId !== "none"
  const showPadding = screenshotBoxCount <= 1
  const showBorder = !hasDeviceFrame || showPadding

  const categories = CATEGORIES.filter((c) => c.id !== "border" || showBorder)

  // Collapse if the selected Border tab is no longer available (derived, not stored).
  const resolvedActive = active === "border" && !showBorder ? null : active

  const handleTabChange = React.useCallback((next: CategoryId) => {
    setActive((prev) => {
      if (prev === next) return null
      const prevIdx = prev ? CATEGORY_ORDER.indexOf(prev) : -1
      const nextIdx = CATEGORY_ORDER.indexOf(next)
      setDirection(nextIdx > prevIdx ? 1 : -1)
      return next
    })
  }, [])

  React.useEffect(() => {
    onOpenChange?.(resolvedActive !== null)
  }, [resolvedActive, onOpenChange])

  return (
    <>
      {resolvedActive ? (
        <div
          className="fixed inset-0 z-40 md:hidden"
          onClick={() => setActive(null)}
          aria-hidden="true"
        />
      ) : null}
      <div className="fixed inset-x-0 bottom-0 z-50 flex flex-col md:hidden">
        <AnimatePresence initial={false}>
          {resolvedActive ? (
            // Outer: height-only animation on an empty shell (cheap, no content reflow)
            // Inner: translateY (GPU-composited, no reflow)
            <motion.div
              key="panel-shell"
              initial={{ height: 0 }}
              animate={{ height: "42svh" }}
              exit={{
                height: 0,
                transition: { duration: 0.18, ease: [0.4, 0, 1, 1] },
              }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="relative overflow-hidden border-t border-border/60 bg-sidebar"
            >
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{
                  y: "100%",
                  transition: { duration: 0.18, ease: [0.4, 0, 1, 1] },
                }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0"
                style={{ willChange: "transform" }}
              >
                <AnimatePresence mode="wait" initial={false} custom={direction}>
                  <motion.div
                    key={resolvedActive}
                    custom={direction}
                    variants={{
                      enter: (d: number) => ({ x: `${d * 40}%`, opacity: 0 }),
                      center: { x: 0, opacity: 1 },
                      exit: (d: number) => ({ x: `${d * -40}%`, opacity: 0 }),
                    }}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute inset-0"
                    style={{ willChange: "transform" }}
                  >
                    <CategoryPanel
                      id={resolvedActive}
                      hasDeviceFrame={hasDeviceFrame}
                      showPadding={showPadding}
                    />
                  </motion.div>
                </AnimatePresence>
              </motion.div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <div className="border-t border-border/60 bg-sidebar pb-[env(safe-area-inset-bottom)]">
          <div className="flex overflow-hidden px-1 py-1.5">
            {categories.map((cat) => {
              const isActive = resolvedActive === cat.id
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleTabChange(cat.id)}
                  className={cn(
                    "flex flex-1 cursor-pointer flex-col items-center gap-0.5 rounded-lg py-1.5 text-[10px] font-medium transition-colors",
                    isActive
                      ? "bg-background text-foreground shadow-sm"
                      : "text-foreground/55 hover:text-foreground/80"
                  )}
                  aria-pressed={isActive}
                >
                  <cat.icon className="size-[18px]" />
                  {cat.label}
                </button>
              )
            })}
            <MobileAccountButton />
          </div>
        </div>
      </div>
    </>
  )
}

function MobileAccountButton() {
  const { data: session } = useSession()
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  const [storageOpen, setStorageOpen] = React.useState(false)
  const user = session?.user

  if (!user) {
    return (
      <button
        type="button"
        onClick={() => router.push("/login")}
        className="flex flex-1 cursor-pointer flex-col items-center gap-0.5 rounded-lg py-1.5 text-[10px] font-medium text-foreground/55 transition-colors hover:text-foreground/80"
        aria-label="Sign in"
      >
        <RiUserLine className="size-[18px]" />
        Account
      </button>
    )
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex flex-1 cursor-pointer flex-col items-center gap-0.5 rounded-lg py-1.5 text-[10px] font-medium text-foreground/55 transition-colors hover:text-foreground/80"
          aria-label="Account"
        >
          {user.image ? (
            <span
              className="size-[18px] rounded-full bg-cover bg-center ring-1 ring-border/70"
              style={{ backgroundImage: `url(${user.image})` }}
            />
          ) : (
            <RiUserLine className="size-[18px]" />
          )}
          Account
        </button>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="center"
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

function CategoryPanel({
  id,
  hasDeviceFrame,
  showPadding,
}: {
  id: CategoryId
  hasDeviceFrame: boolean
  showPadding: boolean
}) {
  if (id === "layout") {
    return (
      <EffectsSidebar
        className="!h-full !w-full !border-none !bg-transparent"
        hideAccount
      />
    )
  }

  return (
    <ScrollArea className="h-full">
      <div className="px-4 py-3 pb-10">
        {id === "style" ? (
          <>
            <Section
              icon={RiPaletteLine}
              title="Background"
              collapsible={false}
            >
              <BackgroundSection />
            </Section>
            <div className="my-3 h-px bg-border/50" />
            <Section icon={RiSunLine} title="Backdrop" collapsible={false}>
              <BackdropSection popoverSide="top" />
            </Section>
          </>
        ) : null}

        {id === "border" ? (
          <>
            {!hasDeviceFrame ? (
              <Section icon={RiBrushLine} title="Border" collapsible={false}>
                <BorderSection />
              </Section>
            ) : null}
            {!hasDeviceFrame && showPadding ? (
              <div className="my-3 h-px bg-border/50" />
            ) : null}
            {showPadding ? (
              <Section
                icon={RiLayoutGrid2Line}
                title="Padding"
                collapsible={false}
              >
                <PaddingSection />
              </Section>
            ) : null}
          </>
        ) : null}

        {id === "shadow" ? (
          <Section icon={RiMoonClearLine} title="Shadow" collapsible={false}>
            <ShadowSection />
          </Section>
        ) : null}

        {id === "details" ? (
          <Section
            icon={RiRotateLockLine}
            title="Tilt & Scale"
            collapsible={false}
          >
            <TiltSection />
          </Section>
        ) : null}
      </div>
    </ScrollArea>
  )
}
