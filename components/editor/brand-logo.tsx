"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "motion/react"
import { cn } from "@/lib/utils"

const WORDMARK = "Tokokino"

export function BrandLogo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn("flex min-w-0 items-center gap-2 select-none", className)}
      aria-label={WORDMARK}
    >
      <motion.span
        className="relative inline-flex items-center justify-center"
        initial={{ opacity: 0, scale: 0.6, rotate: -16 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 320, damping: 22, mass: 0.6 }}
      >
        <Image src="/logo.png" alt={WORDMARK} width={20} height={20} className="size-5" />
      </motion.span>

      <motion.span
        className="font-mono text-[14px] font-medium tracking-[-0.02em] text-foreground"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.045, delayChildren: 0.18 } },
        }}
        aria-hidden="true"
      >
        {WORDMARK.split("").map((char, i) => (
          <motion.span
            key={`${char}-${i}`}
            className="inline-block"
            variants={{
              hidden: { y: "60%", opacity: 0, filter: "blur(4px)" },
              visible: {
                y: 0,
                opacity: 1,
                filter: "blur(0px)",
                transition: { type: "spring", stiffness: 420, damping: 28, mass: 0.5 },
              },
            }}
          >
            {char}
          </motion.span>
        ))}
      </motion.span>
    </Link>
  )
}
