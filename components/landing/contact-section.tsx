"use client"

import { motion } from "motion/react"
import { RiMailLine } from "@remixicon/react"
import {
  ArrowRight,
  GithubGlyph,
  TwitterGlyph,
} from "@/components/landing/landing-svgs"
import { ease } from "@/components/landing/constants"

const CONTACT_LINKS = [
  {
    label: "Email",
    value: "hello@theshiva.xyz",
    href: "mailto:hello@theshiva.xyz",
    icon: RiMailLine,
  },
  {
    label: "X / Twitter",
    value: "x.com/sh17va",
    href: "https://x.com/sh17va",
    icon: TwitterGlyph,
  },
  {
    label: "GitHub",
    value: "git.new/Tokokino",
    href: "https://git.new/Tokokino",
    icon: GithubGlyph,
  },
] as const

export function ContactSection() {
  return (
    <section
      id="contact"
      className="relative overflow-hidden px-5 py-16 sm:px-8 sm:py-24 lg:px-12"
    >
      <div className="grid gap-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:items-end">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.6, ease }}
          className="flex max-w-xl flex-col gap-5"
        >
          <span className="font-mono text-[10px] tracking-widest text-primary/80 uppercase">
            {"// Contact"}
          </span>
          <div className="flex flex-col gap-4">
            <h2 className="text-2xl tracking-tight sm:text-3xl lg:text-4xl">
              Questions, ideas, or bugs?
            </h2>
            <p className="max-w-lg text-sm leading-7 text-foreground/58">
              Send a note, follow updates, or open the source. Tokokino is built
              in public and small thoughtful messages are very welcome.
            </p>
          </div>
        </motion.div>

        <div className="grid gap-3 sm:grid-cols-3">
          {CONTACT_LINKS.map((link, index) => {
            const Icon = link.icon

            return (
              <motion.a
                key={link.href}
                href={link.href}
                target={link.href.startsWith("http") ? "_blank" : undefined}
                rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.35 }}
                transition={{ duration: 0.52, delay: index * 0.06, ease }}
                className="group rounded-[14px] border border-border/60 bg-background/40 p-1.5 backdrop-blur-sm transition-colors hover:border-primary/45"
              >
                <div className="flex h-full min-h-36 flex-col justify-between rounded-[8px] border border-border/40 bg-background/62 p-5 transition-colors group-hover:bg-background/86">
                  <div className="flex items-center justify-between gap-3">
                    <span className="flex size-9 items-center justify-center rounded-md border border-border/60 text-foreground/58 transition-colors group-hover:border-primary/35 group-hover:text-primary">
                      <Icon className="size-4" />
                    </span>
                    <ArrowRight className="size-4 text-foreground/34 transition group-hover:translate-x-0.5 group-hover:text-primary" />
                  </div>
                  <div className="mt-7 min-w-0">
                    <p className="font-mono text-[10px] tracking-[0.24em] text-primary/80 uppercase">
                      {link.label}
                    </p>
                    <p className="mt-2 text-sm font-medium tracking-tight break-words text-foreground">
                      {link.value}
                    </p>
                  </div>
                </div>
              </motion.a>
            )
          })}
        </div>
      </div>
    </section>
  )
}
