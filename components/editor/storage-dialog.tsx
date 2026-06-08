"use client"

import * as React from "react"
import {
  RiFolder3Line,
  RiImageLine,
  RiInfinityLine,
  RiMailLine,
  RiSparkling2Line,
} from "@remixicon/react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

const SUPPORT_EMAIL = "hello@theshiva.xyz"

type StoragePool = { used: number; limit: number }

function hasStoragePool(value: unknown): value is { storage: StoragePool } {
  if (typeof value !== "object" || value === null) return false
  const storage = (value as { storage?: unknown }).storage
  return (
    typeof storage === "object" &&
    storage !== null &&
    typeof (storage as StoragePool).used === "number" &&
    typeof (storage as StoragePool).limit === "number"
  )
}

function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 MB"
  const mb = bytes / (1024 * 1024)
  if (mb < 0.1) return `${(bytes / 1024).toFixed(0)} KB`
  if (mb < 1024) return `${mb.toFixed(mb < 10 ? 2 : 0)} MB`
  return `${(mb / 1024).toFixed(2)} GB`
}

function MeteredRow({
  icon,
  label,
  pool,
}: {
  icon: React.ReactNode
  label: string
  pool: StoragePool | null
}) {
  const used = pool?.used ?? 0
  const limit = pool?.limit ?? 0
  const pct = limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0
  const near = pct >= 80

  return (
    <div className="rounded-lg border border-border/70 bg-secondary/30 p-3">
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-2 text-[13px] font-medium text-foreground">
          <span className="text-muted-foreground">{icon}</span>
          {label}
        </span>
        <span className="text-[11px] text-muted-foreground tabular-nums">
          {pool ? (
            <>
              {formatBytes(used)}{" "}
              <span className="opacity-60">/ {formatBytes(limit)}</span>
            </>
          ) : (
            "…"
          )}
        </span>
      </div>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className={cn(
            "h-full rounded-full transition-[width] duration-500",
            near ? "bg-destructive" : "bg-primary"
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

function UnlimitedRow({
  icon,
  label,
}: {
  icon: React.ReactNode
  label: string
}) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-lg border border-border/70 bg-secondary/30 p-3">
      <span className="flex items-center gap-2 text-[13px] font-medium text-foreground">
        <span className="text-muted-foreground">{icon}</span>
        {label}
      </span>
      <span className="flex items-center gap-1 text-[11px] font-medium text-primary">
        <RiInfinityLine className="size-3.5" />
        Unlimited
      </span>
    </div>
  )
}

export function StorageDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [drafts, setDrafts] = React.useState<StoragePool | null>(null)
  const [shares, setShares] = React.useState<StoragePool | null>(null)

  React.useEffect(() => {
    if (!open) return
    let cancelled = false

    void (async () => {
      try {
        const [draftsRes, sharesRes] = await Promise.all([
          fetch("/api/drafts?limit=1", { cache: "no-store" }),
          fetch("/api/share", { cache: "no-store" }),
        ])
        if (draftsRes.ok) {
          const data = await draftsRes.json()
          if (!cancelled && hasStoragePool(data)) setDrafts(data.storage)
        }
        if (sharesRes.ok) {
          const data = await sharesRes.json()
          if (!cancelled && hasStoragePool(data)) setShares(data.storage)
        }
      } catch {
        // Leave pools null — rows render a loading placeholder.
      }
    })()

    return () => {
      cancelled = true
    }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-4 p-5 sm:max-w-sm">
        <DialogHeader className="pr-8">
          <DialogTitle>Storage</DialogTitle>
          <DialogDescription>
            Usage across your account. Each pool has its own limit.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <MeteredRow
            icon={<RiFolder3Line className="size-4" />}
            label="Saved projects"
            pool={drafts}
          />
          <MeteredRow
            icon={<RiImageLine className="size-4" />}
            label="Shared images"
            pool={shares}
          />
          <UnlimitedRow
            icon={<RiSparkling2Line className="size-4" />}
            label="Custom presets"
          />

          <div className="space-y-1.5 rounded-lg bg-secondary/30 px-3 pt-3">
            <p className="text-[13px] font-medium text-foreground">
              Need more space?
            </p>
            <div className="flex items-center gap-2">
              <RiMailLine className="size-4 shrink-0 text-muted-foreground" />
              <p className="text-[11px] text-muted-foreground">
                Email{" "}
                <a
                  href={`mailto:${SUPPORT_EMAIL}`}
                  className="font-medium text-foreground underline underline-offset-2 hover:text-primary"
                >
                  {SUPPORT_EMAIL}
                </a>{" "}
                to increase your limit.
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
