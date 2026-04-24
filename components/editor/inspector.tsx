"use client"

import * as React from "react"
import {
  RiArrowDownSLine,
  RiLayoutGrid2Line,
  RiPaletteLine,
  RiRotateLockLine,
  RiUpload2Line,
  RiImageLine,
} from "@remixicon/react"
import { AnimatePresence, motion } from "motion/react"

import { EditableValue } from "@/components/editor/editable-value"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  GRADIENT_PRESETS,
  IMAGE_PRESETS,
  SOLID_PRESETS,
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
      </div>

      <ScrollArea className="min-h-0 flex-1">
        <div className="px-4 py-3 pb-24">
          <Section icon={RiPaletteLine} title="Background" defaultOpen>
            <BackgroundSection />
          </Section>
          <div className="my-3 h-px bg-border/50" />

          <Section icon={RiLayoutGrid2Line} title="Padding" defaultOpen>
            <PaddingSection />
          </Section>
          <div className="my-3 h-px bg-border/50" />

          <Section icon={RiRotateLockLine} title="Tilt & Scale" defaultOpen>
            <TiltSection />
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

/* -------- Background -------- */

function BackgroundSection() {
  const { background, setBackground, borderRadius, setBorderRadius } =
    useEditor()
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
          <Button
            variant="default"
            size="sm"
            className="h-9 w-full gap-2 cursor-pointer"
            onClick={() => fileRef.current?.click()}
          >
            <RiUpload2Line className="size-4" />
            <span className="text-[11px] font-medium">Upload</span>
          </Button>

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

        <TabsContent value="solid" className="mt-6 space-y-3">
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
          </div>
          <label className="flex items-center gap-2 rounded-md border border-border/60 bg-secondary/40 px-2 py-1.5">
            <span className="text-[11px] text-muted-foreground">Custom</span>
            <input
              type="color"
              value={
                background.type === "solid" && /^#/.test(background.value)
                  ? background.value
                  : "#000000"
              }
              onChange={(e) =>
                setBackground({ type: "solid", value: e.target.value })
              }
              className="h-6 w-8 cursor-pointer rounded bg-transparent"
            />
            <input
              type="text"
              value={background.type === "solid" ? background.value : ""}
              onChange={(e) =>
                setBackground({ type: "solid", value: e.target.value })
              }
              className="tabular flex-1 bg-transparent font-mono text-[11px] outline-none"
              placeholder="#000000"
            />
          </label>
        </TabsContent>

        <TabsContent value="none" className="mt-6">
          <p className="rounded-md border border-dashed border-border/60 bg-secondary/20 px-3 py-4 text-center text-[11px] text-muted-foreground">
            Transparent background
          </p>
        </TabsContent>
      </Tabs>

      <div className="my-1 h-px bg-border/40" />

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
