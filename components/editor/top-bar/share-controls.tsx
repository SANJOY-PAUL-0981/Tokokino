"use client"

import * as React from "react"
import {
  RiCheckLine,
  RiExternalLinkLine,
  RiFileCopyLine,
  RiLink,
  RiShareForwardLine,
} from "@remixicon/react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import type { ShareDialogState } from "./types"

function ShareContent({
  status,
  url,
  error,
  copied,
  onCopyLink,
  onRetry,
}: {
  status: ShareDialogState["status"]
  url: string | null
  error: string | null
  copied: boolean
  onCopyLink: (url: string) => Promise<void>
  onRetry: () => Promise<void>
}) {
  const isPreparing = status === "preparing"

  return (
    <>
      <div className="px-1">
        <p className="text-sm font-medium">Share screenshot</p>
        {isPreparing ? (
          <div className="mt-2 space-y-1.5">
            <Skeleton className="h-3 w-56 max-w-full" />
            <Skeleton className="h-3 w-40 max-w-[80%]" />
          </div>
        ) : (
          <p className="mt-1 text-xs/relaxed text-muted-foreground">
            {status === "ready"
              ? "Copy the public link or open the share page."
              : status === "error"
                ? "The link could not be prepared."
                : "Create a public link for this canvas."}
          </p>
        )}
      </div>

      {status === "preparing" ? (
        <div className="space-y-3">
          <div className="flex min-w-0 items-center gap-2 overflow-hidden rounded-lg border border-border/70 bg-secondary/40 p-2">
            <Skeleton className="size-4 shrink-0 rounded-full" />
            <Skeleton className="h-4 flex-1" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Skeleton className="h-8 rounded-md" />
            <Skeleton className="h-8 rounded-md" />
          </div>
        </div>
      ) : null}

      {status === "ready" && url ? (
        <div className="min-w-0 space-y-3">
          <div className="flex min-w-0 items-center gap-2 overflow-hidden rounded-lg border border-border/70 bg-secondary/40 p-2">
            <RiLink className="size-4 shrink-0 text-muted-foreground" />
            <p className="min-w-0 flex-1 truncate font-mono text-[11px] text-foreground">
              {url}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="lg"
              className="min-w-0"
              onClick={() => void onCopyLink(url)}
            >
              {copied ? <RiCheckLine /> : <RiFileCopyLine />}
              <span>{copied ? "Copied" : "Copy"}</span>
            </Button>
            <Button asChild size="lg" className="min-w-0">
              <a href={url} target="_blank" rel="noreferrer">
                <RiExternalLinkLine />
                <span>Open</span>
              </a>
            </Button>
          </div>
        </div>
      ) : null}

      {status === "error" ? (
        <div className="space-y-3">
          <p className="rounded-lg border border-destructive/25 bg-destructive/10 p-3 text-xs/relaxed text-destructive">
            {error ?? "Something went wrong."}
          </p>
          <Button size="lg" className="w-full" onClick={() => void onRetry()}>
            <RiShareForwardLine />
            <span>Try again</span>
          </Button>
        </div>
      ) : null}
    </>
  )
}

export function ShareControls({
  open,
  status,
  url,
  error,
  copied,
  onOpenChange,
  onShare,
  onCopyLink,
  onRetry,
}: {
  open: boolean
  status: ShareDialogState["status"]
  url: string | null
  error: string | null
  copied: boolean
  onOpenChange: (open: boolean) => void
  onShare: () => void
  onCopyLink: (url: string) => Promise<void>
  onRetry: () => Promise<void>
}) {
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <Tooltip open={open ? false : undefined}>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="lg"
              onClick={() => {
                if (!open && status !== "preparing") onShare()
              }}
            >
              <RiShareForwardLine />
              <span className="hidden xl:inline">Share</span>
            </Button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent side="bottom">Share screenshot</TooltipContent>
      </Tooltip>
      <PopoverContent
        align="center"
        sideOffset={12}
        className="w-[min(calc(100vw-2rem),360px)] gap-3 rounded-2xl border border-border/60 bg-popover/95 p-3 shadow-2xl backdrop-blur-md data-open:zoom-in-95 data-closed:zoom-out-95"
      >
        <ShareContent
          status={status}
          url={url}
          error={error}
          copied={copied}
          onCopyLink={onCopyLink}
          onRetry={onRetry}
        />
      </PopoverContent>
    </Popover>
  )
}

export function MobileShareDialog({
  open,
  status,
  url,
  error,
  copied,
  onOpenChange,
  onCopyLink,
  onRetry,
}: {
  open: boolean
  status: ShareDialogState["status"]
  url: string | null
  error: string | null
  copied: boolean
  onOpenChange: (open: boolean) => void
  onCopyLink: (url: string) => Promise<void>
  onRetry: () => Promise<void>
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[min(calc(100vw-2rem),360px)] gap-3 rounded-2xl p-3 md:hidden">
        <DialogTitle className="sr-only">Share screenshot</DialogTitle>
        <DialogDescription className="sr-only">
          Create and copy a public link for this canvas.
        </DialogDescription>
        <ShareContent
          status={status}
          url={url}
          error={error}
          copied={copied}
          onCopyLink={onCopyLink}
          onRetry={onRetry}
        />
      </DialogContent>
    </Dialog>
  )
}
