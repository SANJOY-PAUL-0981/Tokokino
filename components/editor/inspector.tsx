"use client"

import * as React from "react"
import {
  RiArrowDownSLine,
  RiLayoutGrid2Line,
  RiPaletteLine,
  RiRotateLockLine,
  RiUpload2Line,
  RiImageLine,
  RiGradienterLine,
  RiSunLine,
  RiEqualizerLine,
  RiGridLine,
  RiFocus2Line,
  RiArrowGoBackLine,
  RiUnsplashLine,
  RiMoonClearLine,
  RiArrowRightLine,
  RiFocus3Line,
  RiBrushLine,
} from "@remixicon/react"
import { AnimatePresence, motion } from "motion/react"

import { ColorPickerPopover } from "@/components/editor/color-picker-popover"
import { EditableValue } from "@/components/editor/editable-value"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import {
  BACKDROP_PATTERNS,
  GRADIENT_PRESETS,
  IMAGE_PRESETS,
  SOLID_PRESETS,
  patternCssFor,
  useEditor,
  type BgType,
} from "@/lib/editor/store"

export function Inspector({ className }: { className?: string }) {
  return (
    <aside className={cn("flex h-full min-h-0 w-[308px] shrink-0 flex-col border-l border-dashed border-border/70 bg-sidebar overflow-hidden", className)}>
      <div className="flex h-12 shrink-0 items-center justify-between border-b border-border/60 px-4">
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-medium tracking-tight">
            Inspector
          </span>
        </div>
        <span className="tabular rounded border border-border/60 bg-secondary/60 px-1.5 py-0.5 font-mono text-[9px] tracking-wider text-muted-foreground uppercase">
          Browser
        </span>
      </div>

      <ScrollArea className="min-h-0 flex-1">
        <div className="px-4 py-3 pb-24">
          <Section icon={RiPaletteLine} title="Background" defaultOpen>
            <BackgroundSection />
          </Section>
          <div className="my-3 h-px bg-border/50" />

          <Section icon={RiBrushLine} title="Border" defaultOpen>
            <BorderSection />
          </Section>
          <div className="my-3 h-px bg-border/50" />

          <Section icon={RiSunLine} title="Backdrop">
            <BackdropSection />
          </Section>
          <div className="my-3 h-px bg-border/50" />

          <Section icon={RiLayoutGrid2Line} title="Padding" defaultOpen>
            <PaddingSection />
          </Section>
          <div className="my-3 h-px bg-border/50" />

          <Section icon={RiRotateLockLine} title="Tilt & Scale" defaultOpen>
            <TiltSection />
          </Section>
          <div className="my-3 h-px bg-border/50" />

          <Section icon={RiMoonClearLine} title="Shadow" defaultOpen>
            <ShadowSection />
          </Section>
        </div>
      </ScrollArea>
    </aside>
  )
}

/* -------- Section primitive -------- */

function Section({
  icon: Icon,
  title,
  defaultOpen = true,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  defaultOpen?: boolean
  children: React.ReactNode
}) {
  const [open, setOpen] = React.useState(defaultOpen)
  return (
    <div>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2 py-1.5 text-left cursor-pointer"
      >
        <motion.span
          animate={{ rotate: open ? 0 : -90 }}
          transition={{ duration: 0.18 }}
          className="inline-flex size-4 items-center justify-center text-muted-foreground"
        >
          <RiArrowDownSLine className="size-4" />
        </motion.span>
        <span className="inline-flex size-5 items-center justify-center rounded-full bg-secondary/60 text-muted-foreground">
          <Icon className="size-3" />
        </span>
        <span className="text-[13px] font-medium">{title}</span>
      </button>
      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="pt-2 pb-1 pl-6">{children}</div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}

function SubHeader({
  children,
  trailing,
}: {
  children: React.ReactNode
  trailing?: React.ReactNode
}) {
  return (
    <div className="mb-2 flex items-center justify-between text-[11px] tracking-tight text-muted-foreground">
      <span>{children}</span>
      {trailing}
    </div>
  )
}

function NestedSection({
  title,
  defaultOpen = false,
  children,
}: {
  title: string
  defaultOpen?: boolean
  children: React.ReactNode
}) {
  const [open, setOpen] = React.useState(defaultOpen)
  return (
    <div>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-1.5 py-1 text-left cursor-pointer"
      >
        <span
          className="inline-flex size-3.5 items-center justify-center text-muted-foreground transition-transform"
          style={{ transform: open ? "rotate(0deg)" : "rotate(-90deg)" }}
        >
          <RiArrowDownSLine className="size-3.5" />
        </span>
        <span className="label-eyebrow">{title}</span>
      </button>
      {open ? <div className="pt-2 pb-1">{children}</div> : null}
    </div>
  )
}

/* -------- Backdrop -------- */

const PATTERN_COLORS = ["#FFFFFF", "#000000", "#F04462", "#7FB069", "#F87171", "#60A5FA"]

function BackdropSection() {
  const { backdrop, setBackdropEffects, setBackdropPattern } = useEditor()
  const { effects, pattern } = backdrop

  const [overlayOpacity, setOverlayOpacity] = React.useState(10)
  const [overlayPosition, setOverlayPosition] = React.useState("overlay")

  const setEffects = (patch: Partial<typeof effects>) =>
    setBackdropEffects({ ...effects, ...patch })
  const setPattern = (patch: Partial<typeof pattern>) =>
    setBackdropPattern({ ...pattern, ...patch })

  const shadowPatterns = [
    { id: 0, cls: "bg-checker" },
    { id: 1, cls: "bg-gradient-to-br from-white/0 via-black/20 to-black/40" },
    { id: 2, cls: "bg-gradient-to-r from-black/20 via-transparent to-black/20" },
    { id: 3, cls: "bg-[radial-gradient(circle,transparent_20%,black_100%)]" },
    { id: 4, cls: "bg-[linear-gradient(45deg,rgba(0,0,0,0.1)_25%,transparent_25%,transparent_50%,rgba(0,0,0,0.1)_50%,rgba(0,0,0,0.1)_75%,transparent_75%,transparent)] bg-[length:20px_20px]" },
    { id: 5, cls: "bg-gradient-to-t from-black/30 to-transparent" },
  ]

  return (
    <div className="grid grid-cols-2 gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="default" size="sm" className="h-9 justify-start gap-2 px-3 font-medium cursor-pointer">
            <RiSunLine className="size-4" />
            <span>Overlay</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent side="left" align="start" className="w-[240px] space-y-4 bg-popover/95 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-medium">Shadow Overlay</span>
            <Button variant="ghost" size="icon" className="size-6 cursor-pointer">
              <RiArrowGoBackLine className="size-3" />
            </Button>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {shadowPatterns.map((p) => (
              <button key={p.id} className={cn("aspect-square rounded-md border border-border/60 cursor-pointer", p.cls)} />
            ))}
          </div>
          <Button variant="secondary" size="sm" className="w-full text-[11px] h-8 cursor-pointer">
            <RiArrowDownSLine className="mr-1 size-3" />
            Show More
          </Button>
          <div className="space-y-3">
            <div className="flex items-baseline justify-between">
              <span className="text-[11px] text-muted-foreground">Opacity</span>
              <span className="tabular font-mono text-[11px] text-foreground/80">{overlayOpacity}%</span>
            </div>
            <Slider value={[overlayOpacity]} onValueChange={([v]) => setOverlayOpacity(v)} max={100} className="cursor-pointer" />
            <div className="space-y-2">
              <span className="text-[11px] text-muted-foreground">Position</span>
              <ToggleGroup type="single" value={overlayPosition} onValueChange={(v) => v && setOverlayPosition(v)} className="flex w-full bg-secondary/40 p-1">
                <ToggleGroupItem value="overlay" className="flex-1 h-7 text-[10px] cursor-pointer">Overlay</ToggleGroupItem>
                <ToggleGroupItem value="underlay" className="flex-1 h-7 text-[10px] cursor-pointer">Underlay</ToggleGroupItem>
              </ToggleGroup>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="default" size="sm" className="h-9 justify-start gap-2 px-3 font-medium cursor-pointer">
            <RiEqualizerLine className="size-4" />
            <span>Effects</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent side="left" align="start" className="w-[240px] space-y-4 bg-popover/95 backdrop-blur-md">
          <span className="text-[13px] font-medium">Effects</span>
          <div className="space-y-4">
            <EffectSlider
              label="Noise"
              value={effects.noise}
              onChange={(v) => setEffects({ noise: v })}
            />
            <EffectSlider
              label="Blur"
              value={effects.blur}
              onChange={(v) => setEffects({ blur: v })}
              max={20}
            />
            <EffectSlider
              label="Brightness"
              value={effects.brightness}
              onChange={(v) => setEffects({ brightness: v })}
              max={200}
            />
            <EffectSlider
              label="Saturation"
              value={effects.saturation}
              onChange={(v) => setEffects({ saturation: v })}
              max={200}
            />
            <EffectSlider
              label="Opacity"
              value={effects.opacity}
              onChange={(v) => setEffects({ opacity: v })}
            />
          </div>
        </PopoverContent>
      </Popover>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="default" size="sm" className="h-9 justify-start gap-2 px-3 font-medium cursor-pointer">
            <RiGridLine className="size-4" />
            <span>Pattern</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          side="left"
          align="start"
          className="w-[240px] !gap-3 bg-popover/95 backdrop-blur-md"
        >
           <span className="text-[13px] font-medium">Patterns</span>
           <div className="grid max-h-[228px] grid-cols-3 gap-2 overflow-y-auto pr-1 [scrollbar-width:thin]">
            {BACKDROP_PATTERNS.map((p) => {
              const selected = pattern.ids.includes(p.id)
              return (
                <button
                  key={p.id}
                  onClick={() =>
                    setPattern({
                      ids: selected
                        ? pattern.ids.filter((v) => v !== p.id)
                        : [...pattern.ids, p.id],
                    })
                  }
                  style={patternCssFor(p.id, pattern.color, pattern.thickness)}
                  className={cn(
                    "relative aspect-square overflow-hidden rounded-md border bg-secondary/40 transition-all cursor-pointer",
                    selected
                      ? "border-foreground ring-1 ring-foreground/30"
                      : "border-border/60 hover:border-foreground/30"
                  )}
                  title={p.name}
                />
              )
            })}
          </div>

          <div className="space-y-3 pt-3 border-t border-border/40">
            <div>
              <div className="mb-2 flex items-baseline justify-between">
                <span className="text-[11px] text-muted-foreground">Intensity</span>
                <EditableValue
                  value={pattern.intensity}
                  onChange={(v) => setPattern({ intensity: v })}
                  min={0}
                  max={100}
                  suffix="%"
                />
              </div>
              <Slider
                value={[pattern.intensity]}
                onValueChange={([v]) => setPattern({ intensity: v })}
                max={100}
                className="cursor-pointer"
              />
            </div>

            <div>
              <div className="mb-2 flex items-baseline justify-between">
                <span className="text-[11px] text-muted-foreground">Thickness</span>
                <EditableValue
                  value={pattern.thickness}
                  onChange={(v) => setPattern({ thickness: v })}
                  min={1}
                  max={10}
                  step={0.5}
                  suffix="px"
                />
              </div>
              <Slider
                value={[pattern.thickness]}
                onValueChange={([v]) => setPattern({ thickness: v })}
                min={1}
                max={10}
                step={0.5}
                className="cursor-pointer"
              />
            </div>

            <div>
              <span className="text-[11px] text-muted-foreground block mb-2">Colour</span>
              <div className="flex flex-wrap items-center gap-1.5">
                {PATTERN_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setPattern({ color: c })}
                    className={cn(
                      "size-5 rounded-full border border-border/60 cursor-pointer transition-transform hover:scale-110",
                      pattern.color.toLowerCase() === c.toLowerCase() &&
                        "ring-2 ring-primary ring-offset-1 ring-offset-popover"
                    )}
                    style={{ background: c }}
                  />
                ))}
                <ColorPickerPopover
                  value={pattern.color}
                  onChange={(hex) => setPattern({ color: hex })}
                >
                  <button
                    aria-label="Custom pattern color"
                    className={cn(
                      "relative size-5 rounded-full border border-border/60 cursor-pointer transition-transform hover:scale-110",
                      !PATTERN_COLORS.some(
                        (c) => c.toLowerCase() === pattern.color.toLowerCase()
                      ) && "ring-2 ring-primary ring-offset-1 ring-offset-popover"
                    )}
                    style={{
                      background: PATTERN_COLORS.some(
                        (c) => c.toLowerCase() === pattern.color.toLowerCase()
                      )
                        ? "conic-gradient(from 180deg at 50% 50%, #f87171, #fbbf24, #34d399, #60a5fa, #a78bfa, #f472b6, #f87171)"
                        : pattern.color,
                    }}
                  >
                    <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/30 text-white">
                      <RiGradienterLine className="size-3" />
                    </span>
                  </button>
                </ColorPickerPopover>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      <Button variant="default" size="sm" className="h-9 justify-start gap-2 px-3 font-medium cursor-pointer">
        <RiFocus2Line className="size-4" />
        <span>Portrait</span>
      </Button>
    </div>
  )
}

function EffectSlider({ label, value, onChange, max = 100 }: { label: string, value: number, onChange: (v: number) => void, max?: number }) {
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between">
        <span className="text-[11px] text-muted-foreground">{label}</span>
        <EditableValue
          value={value}
          onChange={onChange}
          min={0}
          max={max}
          suffix={max === 100 ? "%" : ""}
        />
      </div>
      <Slider value={[value]} onValueChange={([v]) => onChange(v)} max={max} className="cursor-pointer" />
    </div>
  )
}

/* -------- Background -------- */

function BackgroundSection() {
  const { background, setBackground } = useEditor()
  const fileRef = React.useRef<HTMLInputElement>(null)

  const onUpload = (file: File) => {
    if (!file.type.startsWith("image/")) return
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setBackground({ type: "image", value: reader.result })
      }
    }
    reader.readAsDataURL(file)
  }

  const customSolid =
    background.type === "solid" && !SOLID_PRESETS.includes(background.value)
      ? background.value
      : null

  return (
    <div className="flex flex-col gap-6 pt-3">
      <Tabs
        value={background.type}
        onValueChange={(v) => {
          const type = v as BgType
          if (type === "none") setBackground({ type, value: "" })
          else if (type === "solid")
            setBackground({
              type,
              value:
                background.type === "solid"
                  ? background.value
                  : SOLID_PRESETS[0],
            })
          else if (type === "gradient")
            setBackground({
              type,
              value:
                background.type === "gradient"
                  ? background.value
                  : GRADIENT_PRESETS[0],
            })
          else if (type === "image")
            setBackground({
              type,
              value:
                background.type === "image"
                  ? background.value
                  : IMAGE_PRESETS[0],
            })
        }}
        className="w-full"
      >
        <TabsList className="flex h-auto w-full justify-between bg-transparent p-0">
          <CircularTabTrigger value="none" label="None">
            <div className="size-full bg-checker" />
          </CircularTabTrigger>
          <CircularTabTrigger value="solid" label="Solid">
            <div className="size-full bg-white" />
          </CircularTabTrigger>
          <CircularTabTrigger value="gradient" label="Gradient">
            <div className="size-full bg-gradient-to-br from-primary/60 to-primary" />
          </CircularTabTrigger>
          <CircularTabTrigger value="image" label="Image">
            <RiImageLine className="size-4 text-white group-data-[state=active]:text-white" />
          </CircularTabTrigger>
        </TabsList>

        <TabsContent value="image" className="mt-6 space-y-4">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) onUpload(f)
              e.target.value = ""
            }}
          />
          <div className="flex gap-2">
            <Button variant="default" size="sm" className="h-9 flex-1 gap-2 cursor-pointer">
              <RiUnsplashLine className="size-4" />
              <span className="text-[11px] font-medium">Unsplash</span>
            </Button>
            <Button
              variant="default"
              size="sm"
              className="h-9 flex-1 gap-2 cursor-pointer"
              onClick={() => fileRef.current?.click()}
            >
              <RiUpload2Line className="size-4" />
              <span className="text-[11px] font-medium">Upload</span>
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-x-2 gap-y-4">
            {IMAGE_PRESETS.map((src, i) => {
              const active =
                background.type === "image" && background.value === src
              return (
                <button
                  key={i}
                  onClick={() =>
                    setBackground({ type: "image", value: src })
                  }
                  className="group flex flex-col gap-1.5 text-left cursor-pointer"
                >
                  <div
                    className={cn(
                      "aspect-square overflow-hidden rounded-lg border transition-all",
                      active
                        ? "border-foreground/60 ring-1 ring-foreground/30"
                        : "border-border/60 group-hover:border-foreground/40"
                    )}
                  >
                    <img
                      src={src}
                      alt=""
                      className="h-full w-full object-cover transition-transform group-hover:scale-110"
                    />
                  </div>
                </button>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="gradient" className="mt-6">
          <div className="grid grid-cols-4 gap-2">
            {GRADIENT_PRESETS.map((g) => {
              const active =
                background.type === "gradient" && background.value === g
              return (
                <button
                  key={g}
                  onClick={() => setBackground({ type: "gradient", value: g })}
                  style={{ background: g }}
                  className={cn(
                    "aspect-square rounded-md border transition-transform hover:-translate-y-0.5 cursor-pointer",
                    active
                      ? "border-foreground ring-1 ring-foreground/40"
                      : "border-border/60"
                  )}
                />
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="solid" className="mt-6">
          <div className="grid grid-cols-6 gap-2">
            {SOLID_PRESETS.map((c) => {
              const active =
                background.type === "solid" && background.value === c
              return (
                <button
                  key={c}
                  onClick={() => setBackground({ type: "solid", value: c })}
                  style={{ background: c }}
                  className={cn(
                    "aspect-square rounded-md border transition-transform hover:-translate-y-0.5 cursor-pointer",
                    active
                      ? "border-foreground ring-1 ring-foreground/40"
                      : "border-border/60"
                  )}
                />
              )
            })}
            <ColorPickerPopover
              value={customSolid || "#000000"}
              onChange={(hex) => setBackground({ type: "solid", value: hex })}
            >
              <button
                className={cn(
                  "relative aspect-square rounded-md border transition-transform hover:-translate-y-0.5 cursor-pointer",
                  customSolid
                    ? "border-foreground ring-1 ring-foreground/40"
                    : "border-border/60"
                )}
                style={{
                  background: customSolid || "transparent",
                  backgroundImage: customSolid
                    ? undefined
                    : "conic-gradient(from 180deg at 50% 50%, #f87171, #fbbf24, #34d399, #60a5fa, #a78bfa, #f472b6, #f87171)",
                }}
                aria-label="Custom color"
              >
                <span className="absolute inset-0 flex items-center justify-center rounded-md bg-black/35 text-white">
                  <RiGradienterLine className="size-3.5" />
                </span>
              </button>
            </ColorPickerPopover>
          </div>
        </TabsContent>

        <TabsContent value="none" className="mt-6">
          <p className="rounded-md border border-dashed border-border/60 bg-secondary/20 px-3 py-4 text-center text-[11px] text-muted-foreground">
            Transparent background
          </p>
        </TabsContent>
      </Tabs>

      <div className="my-1 h-px bg-border/40" />

    </div>
  )
}

function CircularTabTrigger({ value, label, children }: { value: string, label: string, children: React.ReactNode }) {
  return (
    <TabsTrigger
      value={value}
      className="group flex h-auto flex-col items-center gap-1.5 bg-transparent p-0 data-[state=active]:!bg-transparent data-[state=active]:!shadow-none data-[state=active]:!border-none cursor-pointer"
    >
      <div className={cn(
        "flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border/60 transition-all group-hover:border-primary/40 group-data-[state=active]:border-transparent",
        value === "image" && "group-data-[state=active]:bg-primary"
      )}>
        {children}
      </div>
      <span className="text-[10px] font-medium text-muted-foreground group-data-[state=active]:text-foreground">
        {label}
      </span>
    </TabsTrigger>
  )
}

/* -------- Padding -------- */

function PaddingSection() {
  const { padding, setPadding } = useEditor()
  const quick = [16, 40, 80, 120]
  return (
    <>
      <div className="mb-2 flex items-baseline justify-between">
        <span className="text-[11px] text-muted-foreground">Inset</span>
        <EditableValue
          value={padding}
          onChange={setPadding}
          min={0}
          max={240}
          suffix="px"
        />
      </div>
      <Slider
        value={[padding]}
        onValueChange={([v]) => setPadding(v)}
        max={240}
        className="mb-3 cursor-pointer"
      />
      <div className="grid grid-cols-4 gap-1.5">
        {quick.map((q) => (
          <button
            key={q}
            onClick={() => setPadding(q)}
            className={cn(
              "tabular h-8 rounded-md border font-mono text-[11px] transition-colors cursor-pointer",
              padding === q
                ? "border-primary/30 bg-primary text-white"
                : "border-border/60 bg-secondary/40 text-foreground/80 hover:border-foreground/25"
            )}
          >
            {q}
          </button>
        ))}
      </div>
    </>
  )
}

/* -------- Border -------- */

const BORDER_PRESETS = [
  "#ffffff",
  "#000000",
  "#f87171",
  "#fbbf24",
  "#34d399",
  "#60a5fa",
]

function BorderSection() {
  const { border, setBorder, borderRadius, setBorderRadius } = useEditor()
  const enabled = border.color !== null
  const currentColor = border.color || "#ffffff"
  const isCustom = enabled && !BORDER_PRESETS.includes(currentColor)

  return (
    <div className="space-y-4">
      <div>
        <div className="mb-2 flex items-baseline justify-between">
          <span className="text-[11px] text-muted-foreground">Radius</span>
          <EditableValue
            value={borderRadius}
            onChange={setBorderRadius}
            min={0}
            max={48}
            suffix="px"
          />
        </div>
        <Slider
          value={[borderRadius]}
          onValueChange={([v]) => setBorderRadius(v)}
          max={48}
          className="cursor-pointer"
        />
      </div>

      <div className="h-px bg-border/40" />

      <div className="flex items-center justify-between">
        <span className="text-[11px] text-muted-foreground">Border</span>
        <Switch
          size="sm"
          checked={enabled}
          onCheckedChange={(on) =>
            setBorder({ ...border, color: on ? "#ffffff" : null })
          }
          className="cursor-pointer"
        />
      </div>

      <div>
        <SubHeader>Color</SubHeader>
        <div className="grid grid-cols-6 gap-2">
          {BORDER_PRESETS.map((c) => {
            const active = enabled && currentColor.toLowerCase() === c
            return (
              <button
                key={c}
                onClick={() => setBorder({ ...border, color: c })}
                style={{ background: c }}
                className={cn(
                  "aspect-square rounded-md border transition-transform hover:-translate-y-0.5 cursor-pointer",
                  active
                    ? "border-foreground ring-1 ring-foreground/40"
                    : "border-border/60"
                )}
              />
            )
          })}
          <ColorPickerPopover
            value={isCustom ? currentColor : "#ffffff"}
            onChange={(hex) => setBorder({ ...border, color: hex })}
          >
            <button
              className={cn(
                "relative aspect-square rounded-md border transition-transform hover:-translate-y-0.5 cursor-pointer",
                isCustom
                  ? "border-foreground ring-1 ring-foreground/40"
                  : "border-border/60"
              )}
              style={{
                background: isCustom ? currentColor : "transparent",
                backgroundImage: isCustom
                  ? undefined
                  : "conic-gradient(from 180deg at 50% 50%, #f87171, #fbbf24, #34d399, #60a5fa, #a78bfa, #f472b6, #f87171)",
              }}
              aria-label="Custom border color"
            >
              <span className="absolute inset-0 flex items-center justify-center rounded-md bg-black/35 text-white">
                <RiGradienterLine className="size-3.5" />
              </span>
            </button>
          </ColorPickerPopover>
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-baseline justify-between">
          <span className="text-[11px] text-muted-foreground">Width</span>
          <EditableValue
            value={border.width}
            onChange={(v) => setBorder({ ...border, width: v })}
            min={0}
            max={12}
            suffix="px"
          />
        </div>
        <Slider
          value={[border.width]}
          onValueChange={([v]) => setBorder({ ...border, width: v })}
          min={0}
          max={12}
          className="cursor-pointer"
        />
      </div>
    </div>
  )
}

/* -------- Tilt & Scale -------- */

function TiltSection() {
  const { tilt, setTilt, scale, setScale } = useEditor()
  return (
    <>
      <DegreeRow
        label="Rotate X"
        value={tilt.rx}
        onChange={(v) => setTilt({ ...tilt, rx: v })}
      />
      <DegreeRow
        label="Rotate Y"
        value={tilt.ry}
        onChange={(v) => setTilt({ ...tilt, ry: v })}
      />
      <DegreeRow
        label="Rotate Z"
        value={tilt.rz}
        onChange={(v) => setTilt({ ...tilt, rz: v })}
      />
      <div className="mb-2 flex items-baseline justify-between">
        <span className="text-[11px] text-muted-foreground">Scale</span>
        <EditableValue
          value={scale}
          onChange={setScale}
          min={10}
          max={300}
          suffix="%"
        />
      </div>
      <Slider
        value={[scale]}
        onValueChange={([v]) => setScale(v)}
        min={50}
        max={150}
        className="cursor-pointer"
      />
    </>
  )
}

function DegreeRow({
  label,
  value,
  onChange,
}: {
  label: string
  value: number
  onChange: (v: number) => void
}) {
  return (
    <div className="mb-3">
      <div className="mb-2 flex items-baseline justify-between">
        <span className="text-[11px] text-muted-foreground">{label}</span>
        <EditableValue
          value={value}
          onChange={onChange}
          min={-180}
          max={180}
          suffix="°"
        />
      </div>
      <Slider
        value={[value]}
        onValueChange={([v]) => onChange(v)}
        min={-45}
        max={45}
        className="cursor-pointer"
      />
    </div>
  )
}

/* -------- Shadow (placeholder / dummy UI) -------- */

function ShadowSection() {
  const [type, setType] = React.useState("spread")
  const [intensity, setIntensity] = React.useState(40)
  const [lightSource, setLightSource] = React.useState("0-0")

  const types = [
    { id: "none", label: "None", icon: (
      <div className="size-full rounded-sm bg-background p-1.5">
         <div className="size-full rounded-sm border-2 border-dashed border-border" />
      </div>
    )},
    { id: "spread", label: "Spread", icon: (
      <div className="size-full rounded-sm bg-background p-1.5 shadow-[4px_4px_8px_-2px_rgba(0,0,0,0.2)]">
        <div className="size-full rounded-sm bg-white border border-border/20" />
      </div>
    )},
    { id: "hug", label: "Hug", icon: (
      <div className="size-full rounded-sm bg-background p-1.5 shadow-[0_0_12px_-2px_rgba(0,0,0,0.3)]">
        <div className="size-full rounded-sm bg-white border border-border/20" />
      </div>
    )},
  ]

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2">
        {types.map((t) => (
          <button
            key={t.id}
            onClick={() => setType(t.id)}
            className={cn(
              "flex flex-col items-center gap-1.5 rounded-lg border p-1.5 transition-all cursor-pointer",
              type === t.id
                ? "border-primary/40 bg-primary/5 ring-1 ring-primary/20"
                : "border-border/60 bg-secondary/20 hover:border-foreground/30"
            )}
          >
            <div className="aspect-square w-full">
              {t.icon}
            </div>
            <span className={cn(
              "text-[9px] font-medium",
              type === t.id ? "text-primary" : "text-muted-foreground"
            )}>{t.label}</span>
          </button>
        ))}
      </div>

      <div>
        <div className="mb-2 flex items-baseline justify-between">
          <span className="text-[11px] text-muted-foreground">Intensity</span>
          <EditableValue
            value={intensity}
            onChange={setIntensity}
            min={0}
            max={100}
            suffix="%"
          />
        </div>
        <Slider value={[intensity]} onValueChange={([v]) => setIntensity(v)} max={100} className="cursor-pointer" />
      </div>

      <div>
        <SubHeader>Light Source</SubHeader>
        <div className="mt-2 flex justify-center">
          <div className="grid grid-cols-5 gap-1.5">
            {LIGHT_POSITIONS.map((pos) => {
              const isActive = lightSource === pos.id
              return (
                <button
                  key={pos.id}
                  onClick={() => setLightSource(pos.id)}
                  className={cn(
                    "flex size-8 items-center justify-center rounded-md border transition-all cursor-pointer",
                    isActive
                      ? "border-primary bg-primary text-white"
                      : "border-border/60 bg-secondary/40 text-muted-foreground hover:border-foreground/30"
                  )}
                >
                  {pos.isCenter ? (
                    <RiFocus3Line className="size-3.5" />
                  ) : (
                    <RiArrowRightLine
                      className="size-3.5"
                      style={{ transform: `rotate(${pos.angle}deg)` }}
                    />
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

const LIGHT_POSITIONS = Array.from({ length: 25 }, (_, i) => {
  const r = Math.floor(i / 5)
  const c = i % 5
  const dx = c - 2
  const dy = r - 2
  const isCenter = dx === 0 && dy === 0
  return {
    id: isCenter ? "center" : `${r}-${c}`,
    isCenter,
    angle: isCenter ? 0 : (Math.atan2(dy, dx) * 180) / Math.PI,
  }
})
