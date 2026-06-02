"use client"

import { RiArrowRightLine } from "@remixicon/react"
import { AnimatePresence, motion } from "motion/react"

import { ScrollArea } from "@/components/ui/scroll-area"
import type { Background } from "@/lib/editor/state-types"
import { cn } from "@/lib/utils"

import {
  gradientCategoryIcon,
  GRADIENT_PREVIEW_COUNT,
  POP_EASE,
  TILE_GRID_VARIANTS,
  TILE_ITEM_VARIANTS,
  type GradientOption,
} from "./constants"
import { GradientCustomizerPopover } from "./gradient-customizer-popover"

type GradientCategoryOptions = {
  key: string
  label: string
  options: GradientOption[]
}

type GradientEditorProps = {
  background: Background
  gradientConfig: { angle: number; colors: string[] } | null
  canResetGradient: boolean
  setGradientAngle: (angle: number) => void
  setGradientColor: (colorIndex: number, colorValue: string) => void
  resetGradientEdits: () => void
}

type SetBackground = (background: Background) => void

export function GradientPanel({
  background,
  gradientCategoryOptions,
  gradientCategoryKey,
  setGradientCategoryKey,
  gradientExpanded,
  setGradientExpanded,
  gradientConfig,
  canResetGradient,
  setGradientAngle,
  setGradientColor,
  resetGradientEdits,
  setBackground,
}: GradientEditorProps & {
  gradientCategoryOptions: GradientCategoryOptions[]
  gradientCategoryKey: string
  setGradientCategoryKey: (key: string) => void
  gradientExpanded: boolean
  setGradientExpanded: (expanded: boolean) => void
  setBackground: SetBackground
}) {
  const activeCategory =
    gradientCategoryOptions.find((c) => c.key === gradientCategoryKey) ??
    gradientCategoryOptions[0]
  if (!activeCategory) return null
  const items = activeCategory.options
  const visible = gradientExpanded
    ? items
    : items.slice(0, GRADIENT_PREVIEW_COUNT)
  const hidden = items.slice(GRADIENT_PREVIEW_COUNT)
  const peek = hidden[0] ?? null
  const showExpandTile = !gradientExpanded && hidden.length > 0

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-1 rounded-md bg-secondary/40 p-1">
        {gradientCategoryOptions.map((c) => {
          const active = c.key === activeCategory.key
          const CategoryIcon = gradientCategoryIcon(c.key)
          return (
            <button
              key={c.key}
              onClick={() => {
                setGradientCategoryKey(c.key)
                setGradientExpanded(false)
              }}
              className={cn(
                "relative flex h-9 cursor-pointer items-center justify-center gap-1.5 rounded-[5px] px-3 text-[11px] font-medium transition-colors",
                active
                  ? "text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {active ? (
                <motion.span
                  layoutId="gradient-category-pill"
                  className="absolute inset-0 rounded-[5px] bg-primary shadow-sm"
                  transition={{
                    type: "spring",
                    stiffness: 380,
                    damping: 32,
                  }}
                />
              ) : null}
              <CategoryIcon className="relative z-10 size-3.5 shrink-0" />
              <span className="relative z-10">{c.label}</span>
            </button>
          )
        })}
      </div>

      <motion.div
        layout
        transition={{ layout: { duration: 0.3, ease: POP_EASE } }}
        className="relative w-full"
      >
        {gradientExpanded ? (
          <ScrollArea className="[&>[data-slot=scroll-area-viewport]]:max-h-[280px]">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={`grad-expanded-${activeCategory.key}`}
                variants={TILE_GRID_VARIANTS}
                initial="initial"
                animate="animate"
                exit="exit"
                className="grid grid-cols-3 gap-2 px-1 py-1 pr-2"
              >
                {visible.map((option) => (
                  <GradientTile
                    key={option.id}
                    option={option}
                    activeCategoryKey={activeCategory.key}
                    active={
                      background.type === "gradient" &&
                      background.value === option.value
                    }
                    gradientConfig={gradientConfig}
                    canResetGradient={canResetGradient}
                    onSelect={() =>
                      setBackground({
                        type: "gradient",
                        value: option.value,
                      })
                    }
                    setGradientAngle={setGradientAngle}
                    setGradientColor={setGradientColor}
                    resetGradientEdits={resetGradientEdits}
                  />
                ))}
              </motion.div>
            </AnimatePresence>
          </ScrollArea>
        ) : (
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={`grad-collapsed-${activeCategory.key}`}
              variants={TILE_GRID_VARIANTS}
              initial="initial"
              animate="animate"
              exit="exit"
              className="grid grid-cols-3 gap-2 px-1 py-1"
            >
              {visible.map((option) => (
                <GradientTile
                  key={option.id}
                  option={option}
                  activeCategoryKey={activeCategory.key}
                  active={
                    background.type === "gradient" &&
                    background.value === option.value
                  }
                  gradientConfig={gradientConfig}
                  canResetGradient={canResetGradient}
                  onSelect={() =>
                    setBackground({
                      type: "gradient",
                      value: option.value,
                    })
                  }
                  setGradientAngle={setGradientAngle}
                  setGradientColor={setGradientColor}
                  resetGradientEdits={resetGradientEdits}
                />
              ))}
              {showExpandTile ? (
                <motion.button
                  variants={TILE_ITEM_VARIANTS}
                  onClick={() => setGradientExpanded(true)}
                  title={`Show all ${items.length} ${activeCategory.label.toLowerCase()} gradients`}
                  className="group relative aspect-video w-full cursor-pointer overflow-hidden rounded-lg border border-border/60 transition-colors hover:border-foreground/30"
                >
                  {peek ? (
                    <span
                      className="block size-full scale-110 blur-sm"
                      style={{ background: peek.value }}
                    />
                  ) : (
                    <span className="block size-full bg-secondary/40" />
                  )}
                  <span className="absolute inset-0 flex flex-col items-center justify-center gap-0.5 bg-black/45 text-white">
                    <RiArrowRightLine className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                    <span className="text-[9px] font-semibold">
                      +{hidden.length}
                    </span>
                  </span>
                </motion.button>
              ) : null}
            </motion.div>
          </AnimatePresence>
        )}
      </motion.div>

      {gradientExpanded ? (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2, delay: 0.15 }}
          onClick={() => setGradientExpanded(false)}
          className="mt-2 cursor-pointer text-[11px] text-muted-foreground transition-colors hover:text-foreground"
        >
          Show less
        </motion.button>
      ) : null}
    </div>
  )
}

function GradientTile({
  option,
  activeCategoryKey,
  active,
  gradientConfig,
  canResetGradient,
  onSelect,
  setGradientAngle,
  setGradientColor,
  resetGradientEdits,
}: {
  option: GradientOption
  activeCategoryKey: string
  active: boolean
  gradientConfig: { angle: number; colors: string[] } | null
  canResetGradient: boolean
  onSelect: () => void
  setGradientAngle: (angle: number) => void
  setGradientColor: (colorIndex: number, colorValue: string) => void
  resetGradientEdits: () => void
}) {
  return (
    <motion.div variants={TILE_ITEM_VARIANTS} className="relative">
      <button
        onClick={onSelect}
        className={cn(
          "relative aspect-video w-full cursor-pointer rounded-lg border",
          active ? "border-transparent" : "border-border/60"
        )}
      >
        <span
          className="block size-full rounded-[inherit]"
          style={{ background: option.value }}
        />
        {active ? (
          <motion.span
            layoutId={`gradient-tile-ring-${activeCategoryKey}`}
            className="pointer-events-none absolute -inset-0.5 rounded-[10px] ring-1 ring-primary/45"
            transition={{
              type: "spring",
              stiffness: 380,
              damping: 32,
            }}
          />
        ) : null}
      </button>
      {active && gradientConfig ? (
        <div className="absolute inset-0">
          <GradientCustomizerPopover
            ariaLabel="Customize gradient"
            config={gradientConfig}
            canReset={canResetGradient}
            onAngleChange={setGradientAngle}
            onColorChange={setGradientColor}
            onReset={resetGradientEdits}
          />
        </div>
      ) : null}
    </motion.div>
  )
}

export function AutoGradientPanel({
  background,
  autoGradientOptions,
  gradientConfig,
  canResetGradient,
  setGradientAngle,
  setGradientColor,
  resetGradientEdits,
  setBackground,
}: GradientEditorProps & {
  autoGradientOptions: GradientOption[]
  setBackground: SetBackground
}) {
  return (
    <ScrollArea className="[&>[data-slot=scroll-area-viewport]]:max-h-[280px]">
      <div className="grid grid-cols-3 gap-2 px-1 py-1 pr-2">
        {autoGradientOptions.map((option) => {
          const active =
            background.type === "auto" && background.value === option.value
          return (
            <div key={option.id} className="relative">
              <button
                onClick={() =>
                  setBackground({ type: "auto", value: option.value })
                }
                className={cn(
                  "relative aspect-video w-full cursor-pointer rounded-lg border",
                  active ? "border-transparent" : "border-border/60"
                )}
              >
                <span
                  className="block size-full rounded-[inherit]"
                  style={{ background: option.value }}
                />
                {active ? (
                  <motion.span
                    layoutId="auto-gradient-tile-ring"
                    className="pointer-events-none absolute -inset-0.5 rounded-[10px] ring-1 ring-primary/45"
                    transition={{
                      type: "spring",
                      stiffness: 380,
                      damping: 32,
                    }}
                  />
                ) : null}
              </button>
              {active && gradientConfig ? (
                <div className="absolute inset-0">
                  <GradientCustomizerPopover
                    ariaLabel="Customize auto gradient"
                    config={gradientConfig}
                    canReset={canResetGradient}
                    onAngleChange={setGradientAngle}
                    onColorChange={setGradientColor}
                    onReset={resetGradientEdits}
                  />
                </div>
              ) : null}
            </div>
          )
        })}
      </div>
    </ScrollArea>
  )
}
