"use client"

import * as React from "react"
import { motion } from "motion/react"
import { RiCheckLine, RiLinkM } from "@remixicon/react"

import { cn } from "@/lib/utils"

const RECOMMENDED_MIN_PX = 1024

export function MobileOnlyWarning() {
  const [viewport, setViewport] = React.useState<number | null>(null)
  const [copied, setCopied] = React.useState(false)

  React.useEffect(() => {
    const update = () => setViewport(window.innerWidth)
    update()
    window.addEventListener("resize", update)
    return () => window.removeEventListener("resize", update)
  }, [])

  const onCopyLink = React.useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      const t = setTimeout(() => setCopied(false), 1800)
      return () => clearTimeout(t)
    } catch {
      /* clipboard unavailable */
    }
  }, [])

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Open on a larger screen"
      className="fixed inset-0 z-[100] flex md:hidden"
    >
      <Atmosphere />

      <div className="relative z-10 flex h-full w-full flex-col items-center justify-between px-6 py-10 text-foreground">
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.22em] text-foreground/55"
        >
          <span className="inline-block size-1.5 rounded-full bg-primary shadow-[0_0_12px_rgba(255,90,90,0.85)]" />
          Noctivy Studio
        </motion.div>

        <div className="flex w-full max-w-[420px] flex-col items-center text-center">
          <Illustration />

          <motion.h1
            initial={{ opacity: 0, y: 14, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{
              duration: 0.7,
              ease: [0.22, 1, 0.36, 1],
              delay: 0.35,
            }}
            style={{ fontFamily: "var(--font-playfair)" }}
            className="mt-10 text-[34px] leading-[1.04] tracking-[-0.02em] text-foreground"
          >
            Best viewed{" "}
            <span className="italic text-primary">
              on a wider screen
            </span>


          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: "easeOut", delay: 0.6 }}
            className="mt-5 max-w-[34ch] text-[13.5px] leading-relaxed text-foreground/60"
          >
            The Noctivy editor was designed for desktops  its toolbars,
            inspectors, and canvas don&apos;t fit comfortably on phones yet.
            Hop on a laptop or tablet, and we&apos;ll be waiting.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut", delay: 0.85 }}
            className="mt-7 flex items-center gap-2"
          >
            <button
              type="button"
              onClick={onCopyLink}
              className={cn(
                "group relative inline-flex items-center gap-2 overflow-hidden rounded-full border border-white/15 bg-white/[0.04] px-4 py-2.5 text-[12.5px] font-medium text-foreground/90 backdrop-blur-sm transition-colors",
                "hover:border-primary/40 hover:bg-white/[0.08]"
              )}
            >
              <span
                aria-hidden
                className="absolute inset-y-0 -left-12 w-12 -skew-x-12 bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-700 group-hover:translate-x-[280px]"
              />
              {copied ? (
                <RiCheckLine className="size-3.5 text-primary" />
              ) : (
                <RiLinkM className="size-3.5 text-foreground/70" />
              )}
              {copied ? "Link copied" : "Copy link to open later"}
            </button>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.05 }}
          className="flex flex-col items-center gap-2 text-[10.5px] uppercase tracking-[0.18em] text-foreground/40"
        >
          <div className="flex items-center gap-2">
            <span className="font-mono normal-case tracking-normal text-foreground/55">
              {viewport !== null ? `${viewport}px` : "—"}
            </span>
            <span className="h-px w-6 bg-foreground/20" />
            <span className="font-mono normal-case tracking-normal text-foreground/55">
              {RECOMMENDED_MIN_PX}px+ recommended
            </span>
          </div>
          <span>Made for big canvases</span>
        </motion.div>
      </div>
    </div>
  )
}

function Atmosphere() {
  return (
    <div className="absolute inset-0 overflow-hidden bg-background">
      <div
        aria-hidden
        className="absolute left-1/2 top-[18%] h-[420px] w-[420px] -translate-x-1/2 rounded-full opacity-[0.55] blur-[80px]"
        style={{
          background:
            "radial-gradient(closest-side, oklch(0.7 0.2 18 / 35%), transparent 70%)",
        }}
      />
      <div
        aria-hidden
        className="absolute -bottom-24 left-1/2 h-[320px] w-[320px] -translate-x-1/2 rounded-full opacity-50 blur-[90px]"
        style={{
          background:
            "radial-gradient(closest-side, oklch(0.55 0.18 200 / 28%), transparent 70%)",
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.08] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.35 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0 [mask-image:radial-gradient(120%_80%_at_50%_30%,black,transparent_75%)]"
        style={{
          backgroundImage:
            "linear-gradient(to right, oklch(1 0 0 / 0.04) 1px, transparent 1px), linear-gradient(to bottom, oklch(1 0 0 / 0.04) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />
    </div>
  )
}

const STARS: { cx: number; cy: number; r: number; delay: number }[] = [
  { cx: 30, cy: 36, r: 1.1, delay: 0 },
  { cx: 222, cy: 28, r: 1.4, delay: 0.4 },
  { cx: 18, cy: 130, r: 0.9, delay: 0.8 },
  { cx: 236, cy: 150, r: 1.2, delay: 1.1 },
  { cx: 56, cy: 18, r: 0.7, delay: 0.6 },
  { cx: 198, cy: 110, r: 0.8, delay: 1.4 },
  { cx: 80, cy: 174, r: 0.9, delay: 0.2 },
  { cx: 168, cy: 184, r: 1.0, delay: 0.9 },
]

function Illustration() {
  const crescentMaskId = React.useId()
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{
        type: "spring",
        stiffness: 220,
        damping: 24,
        mass: 0.7,
        delay: 0.05,
      }}
      className="relative"
    >
      <svg
        viewBox="0 0 256 220"
        width="256"
        height="220"
        fill="none"
        aria-hidden="true"
        className="drop-shadow-[0_30px_60px_rgba(255,90,90,0.18)]"
      >
        <defs>
          <linearGradient id="screen-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="oklch(0.24 0.01 270)" />
            <stop offset="100%" stopColor="oklch(0.16 0.01 270)" />
          </linearGradient>
          <linearGradient id="frame-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="oklch(1 0 0 / 0.25)" />
            <stop offset="100%" stopColor="oklch(1 0 0 / 0.07)" />
          </linearGradient>
          <radialGradient id="crescent-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="oklch(0.78 0.22 18 / 0.55)" />
            <stop offset="60%" stopColor="oklch(0.78 0.22 18 / 0.1)" />
            <stop offset="100%" stopColor="oklch(0.78 0.22 18 / 0)" />
          </radialGradient>
          <mask id={crescentMaskId}>
            <rect width="100%" height="100%" fill="black" />
            <circle cx="128" cy="100" r="26" fill="white" />
            <circle cx="138" cy="92" r="22" fill="black" />
          </mask>
        </defs>

        {/* twinkling field */}
        {STARS.map((s, i) => (
          <motion.circle
            key={i}
            cx={s.cx}
            cy={s.cy}
            r={s.r}
            fill="oklch(1 0 0 / 0.85)"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.15, 0.85, 0.15] }}
            transition={{
              duration: 2.8 + (i % 3) * 0.6,
              ease: "easeInOut",
              repeat: Infinity,
              delay: s.delay,
            }}
          />
        ))}

        {/* arc / orbit */}
        <motion.ellipse
          cx="128"
          cy="100"
          rx="92"
          ry="72"
          stroke="oklch(1 0 0 / 0.07)"
          strokeWidth="1"
          strokeDasharray="2 6"
          initial={{ rotate: -8 }}
          animate={{ rotate: 6 }}
          transition={{
            duration: 14,
            ease: "easeInOut",
            repeat: Infinity,
            repeatType: "reverse",
          }}
          style={{ transformOrigin: "128px 100px" }}
        />

        {/* glow halo behind crescent */}
        <motion.circle
          cx="128"
          cy="100"
          r="58"
          fill="url(#crescent-glow)"
          initial={{ opacity: 0.6 }}
          animate={{ opacity: [0.45, 0.85, 0.45], scale: [1, 1.04, 1] }}
          transition={{ duration: 4, ease: "easeInOut", repeat: Infinity }}
          style={{ transformOrigin: "128px 100px" }}
        />

        {/* monitor frame */}
        <motion.g
          initial={{ y: 6, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
        >
          <rect
            x="38"
            y="40"
            width="180"
            height="120"
            rx="14"
            fill="url(#screen-grad)"
            stroke="url(#frame-grad)"
            strokeWidth="1.2"
          />
          <rect
            x="44"
            y="46"
            width="168"
            height="108"
            rx="9"
            fill="oklch(0.12 0 0)"
            stroke="oklch(1 0 0 / 0.04)"
          />
          {/* faux inner content lines, very subtle */}
          <rect
            x="56"
            y="58"
            width="40"
            height="3"
            rx="1.5"
            fill="oklch(1 0 0 / 0.08)"
          />
          <rect
            x="56"
            y="138"
            width="60"
            height="3"
            rx="1.5"
            fill="oklch(1 0 0 / 0.06)"
          />
          <rect
            x="184"
            y="58"
            width="16"
            height="3"
            rx="1.5"
            fill="oklch(1 0 0 / 0.08)"
          />

          {/* crescent (Noctivy mark) inside screen */}
          <rect
            x="44"
            y="46"
            width="168"
            height="108"
            mask={`url(#${crescentMaskId})`}
            fill="oklch(0.82 0.2 18)"
          />

          {/* tiny accent star next to crescent */}
          <motion.circle
            cx="156"
            cy="78"
            r="1.4"
            fill="oklch(0.95 0.05 60)"
            initial={{ opacity: 0, scale: 0.4 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              type: "spring",
              stiffness: 320,
              damping: 18,
              delay: 0.85,
            }}
          />

          {/* base / pedestal */}
          <rect
            x="116"
            y="160"
            width="24"
            height="6"
            rx="1.6"
            fill="oklch(1 0 0 / 0.14)"
          />
          <rect
            x="92"
            y="166"
            width="72"
            height="4"
            rx="2"
            fill="oklch(1 0 0 / 0.1)"
          />
        </motion.g>

        {/* small phone, faded — visual narrative */}
        <motion.g
          initial={{ x: -4, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.6 }}
        >
          <g transform="translate(196 138)">
            <rect
              x="0"
              y="0"
              width="22"
              height="38"
              rx="4.5"
              fill="oklch(0.18 0 0)"
              stroke="oklch(1 0 0 / 0.12)"
              strokeWidth="1"
            />
            <rect
              x="2.5"
              y="3"
              width="17"
              height="32"
              rx="2.5"
              fill="oklch(0.13 0 0)"
            />
            <line
              x1="-6"
              y1="-6"
              x2="28"
              y2="44"
              stroke="oklch(0.78 0.22 18 / 0.85)"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
          </g>
        </motion.g>
      </svg>
    </motion.div>
  )
}
