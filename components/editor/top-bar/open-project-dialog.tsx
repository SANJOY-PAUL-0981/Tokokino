"use client"

import * as React from "react"
import { RiDeleteBinLine, RiDraftLine } from "@remixicon/react"
import { toast } from "sonner"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { ShimmerImage } from "@/components/ui/shimmer-image"
import { cn } from "@/lib/utils"

export type DraftListItem = {
  id: string
  name: string
  canvasCount: number
  byteSize: number
  updatedAt: string
  createdAt: string
  thumbnailUrl: string | null
}

type SortOrder = "latest" | "oldest"

const PAGE_SIZE = 9

function formatRelativeDate(iso: string) {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ""
  const diffMs = Date.now() - date.getTime()
  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour
  if (diffMs < minute) return "just now"
  if (diffMs < hour) {
    const n = Math.floor(diffMs / minute)
    return `${n}m ago`
  }
  if (diffMs < day) {
    const n = Math.floor(diffMs / hour)
    return `${n}h ago`
  }
  if (diffMs < 7 * day) {
    const n = Math.floor(diffMs / day)
    return `${n}d ago`
  }
  return date.toLocaleDateString()
}

function DraftCard({
  draft,
  isCurrent,
  isOpening,
  isDeleting,
  onOpen,
  onDelete,
}: {
  draft: DraftListItem
  isCurrent: boolean
  isOpening: boolean
  isDeleting: boolean
  onOpen: () => void
  onDelete: () => void
}) {
  const updated = formatRelativeDate(draft.updatedAt)
  const [thumbError, setThumbError] = React.useState(false)
  const showThumbnail = draft.thumbnailUrl && !thumbError

  return (
    <div className="group relative">
      <button
        type="button"
        onClick={onOpen}
        disabled={isOpening || isDeleting}
        className={cn(
          "flex w-full flex-col overflow-hidden rounded-xl border bg-secondary/30 text-left transition-colors",
          isCurrent
            ? "border-primary"
            : "border-border/50 hover:border-primary/55",
          (isOpening || isDeleting) && "cursor-not-allowed opacity-60"
        )}
      >
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-secondary/40">
          {showThumbnail ? (
            <ShimmerImage
              src={draft.thumbnailUrl!}
              alt=""
              className="size-full object-cover"
              onError={() => setThumbError(true)}
            />
          ) : (
            <div className="flex size-full flex-col items-center justify-center gap-1.5 text-muted-foreground/40">
              <RiDraftLine className="size-7" />
              <span className="text-[10px]">No preview</span>
            </div>
          )}
          {isCurrent ? (
            <span className="absolute top-2 left-2 rounded-full bg-primary/90 px-2 py-0.5 text-[10px] font-medium text-primary-foreground">
              Open
            </span>
          ) : null}
        </div>
        <div className="flex items-center justify-between gap-2 px-3 py-2">
          <div className="min-w-0">
            <p className="truncate text-[12px] font-medium text-foreground">
              {draft.name}
            </p>
            <p className="text-[11px] text-muted-foreground">
              {draft.canvasCount} canvas
              {draft.canvasCount === 1 ? "" : "es"} · {updated}
            </p>
          </div>
        </div>
      </button>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          onDelete()
        }}
        disabled={isDeleting}
        aria-label={`Delete ${draft.name}`}
        className="absolute top-2 right-2 inline-flex size-7 items-center justify-center rounded-full border border-border/60 bg-background/85 text-muted-foreground opacity-100 shadow-sm transition-opacity hover:border-destructive/40 hover:bg-destructive/15 hover:text-destructive focus:opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
      >
        <RiDeleteBinLine className="size-3.5" />
      </button>
    </div>
  )
}

export function OpenProjectDialog({
  open,
  onOpenChange,
  currentDraftId,
  onOpenDraft,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentDraftId: string | null
  onOpenDraft: (id: string) => void | Promise<void>
}) {
  const [drafts, setDrafts] = React.useState<DraftListItem[] | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const [busyId, setBusyId] = React.useState<string | null>(null)
  const [deletingId, setDeletingId] = React.useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = React.useState<string | null>(
    null
  )
  const [sort, setSort] = React.useState<SortOrder>("latest")
  const [hasMore, setHasMore] = React.useState(false)
  const [isFetchingMore, setIsFetchingMore] = React.useState(false)
  const offsetRef = React.useRef(0)
  const isFetchingMoreRef = React.useRef(false)
  const scrollAreaRef = React.useRef<HTMLDivElement>(null)
  const sentinelRef = React.useRef<HTMLDivElement>(null)

  const fetchDrafts = React.useCallback(
    async (
      offset: number,
      currentSort: SortOrder,
      replace: boolean
    ): Promise<void> => {
      try {
        const res = await fetch(
          `/api/drafts?limit=${PAGE_SIZE}&offset=${offset}&sort=${currentSort}`,
          { credentials: "include" }
        )
        if (!res.ok) {
          const data = (await res.json().catch(() => null)) as {
            error?: string
          } | null
          throw new Error(data?.error ?? "Could not load drafts")
        }
        const data: {
          drafts: DraftListItem[]
          hasMore: boolean
        } = await res.json()
        if (replace) {
          setDrafts(data.drafts)
        } else {
          setDrafts((prev) => [...(prev ?? []), ...data.drafts])
        }
        setHasMore(data.hasMore)
        offsetRef.current = offset + data.drafts.length
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not load drafts")
      }
    },
    []
  )

  // Initial load + reload on sort change
  React.useEffect(() => {
    if (!open) return
    let cancelled = false
    offsetRef.current = 0
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDrafts(null)
    setError(null)
    setHasMore(false)
    setIsFetchingMore(false)
    isFetchingMoreRef.current = false

    void fetchDrafts(0, sort, true).then(() => {
      if (cancelled) {
        setDrafts(null)
      }
    })

    return () => {
      cancelled = true
    }
  }, [open, sort, fetchDrafts])

  // Infinite scroll via IntersectionObserver on sentinel
  React.useEffect(() => {
    const el = sentinelRef.current
    const root = scrollAreaRef.current
    if (!el || !hasMore) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !isFetchingMoreRef.current) {
          isFetchingMoreRef.current = true
          setIsFetchingMore(true)
          void fetchDrafts(offsetRef.current, sort, false).finally(() => {
            isFetchingMoreRef.current = false
            setIsFetchingMore(false)
          })
        }
      },
      { root, rootMargin: "160px 0px", threshold: 0 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [hasMore, sort, fetchDrafts])

  const handleOpen = async (id: string) => {
    setBusyId(id)
    try {
      await onOpenDraft(id)
    } finally {
      setBusyId(null)
    }
  }

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    try {
      const res = await fetch(`/api/drafts/${id}`, {
        method: "DELETE",
        credentials: "include",
      })
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as {
          error?: string
        } | null
        throw new Error(data?.error ?? "Could not delete draft")
      }
      setDrafts((prev) => prev?.filter((d) => d.id !== id) ?? prev)
      toast.success("Draft removed")
    } catch (err) {
      console.error(err)
      toast.error(err instanceof Error ? err.message : "Could not delete draft")
    } finally {
      setDeletingId(null)
    }
  }

  const draftToDelete = drafts?.find((d) => d.id === confirmDeleteId) ?? null

  return (
    <>
      <AlertDialog
        open={confirmDeleteId !== null}
        onOpenChange={(open) => {
          if (!open) setConfirmDeleteId(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete &ldquo;{draftToDelete?.name}&rdquo;?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this draft. This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="grid grid-cols-2 gap-2 sm:flex">
            <AlertDialogCancel className="cursor-pointer">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              className="cursor-pointer"
              onClick={() => {
                if (confirmDeleteId) void handleDelete(confirmDeleteId)
                setConfirmDeleteId(null)
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="flex max-h-[min(560px,calc(100dvh-2rem))] flex-col gap-0 overflow-hidden rounded-md bg-popover p-0 sm:max-w-[720px]">
          <div className="shrink-0 border-b border-border/60 bg-popover px-5 py-4">
            <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
              <div>
                <DialogTitle className="text-[15px]">Open project</DialogTitle>
                <DialogDescription className="mt-0.5 text-[12px]">
                  Pick a saved draft to resume editing.
                </DialogDescription>
              </div>
              <Select
                value={sort}
                onValueChange={(val) => setSort(val as SortOrder)}
              >
                <SelectTrigger className="h-8 w-full self-stretch rounded-md border border-border/70 bg-background px-2.5 text-[11px] font-medium text-foreground shadow-none transition-colors hover:border-primary/50 hover:bg-secondary/20 focus-visible:border-border/70 focus-visible:ring-0 sm:mr-6 sm:w-[110px] sm:self-auto">
                  <SelectValue placeholder="Latest" />
                </SelectTrigger>
                <SelectContent
                  align="end"
                  position="popper"
                  className="min-w-[110px] rounded-md border border-border/70 bg-popover p-1 shadow-2xl"
                >
                  <SelectItem value="latest">Latest</SelectItem>
                  <SelectItem value="oldest">Oldest</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div
            ref={scrollAreaRef}
            className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 sm:max-h-[396px]"
          >
            {drafts === null && !error ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <Skeleton
                    key={i}
                    className="aspect-[16/10] w-full rounded-lg"
                  />
                ))}
              </div>
            ) : null}

            {error ? (
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-[12px] text-destructive">
                {error}
              </div>
            ) : null}

            {drafts && drafts.length === 0 && !error ? (
              <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border/60 bg-secondary/20 px-4 py-8 text-center">
                <span className="inline-flex size-10 items-center justify-center rounded-full bg-secondary text-muted-foreground">
                  <RiDraftLine className="size-5" />
                </span>
                <p className="text-[13px] font-medium text-foreground">
                  No saved projects yet
                </p>
                <p className="text-[12px] text-muted-foreground">
                  Use Save → Save as draft to keep your work in the cloud.
                </p>
              </div>
            ) : null}

            {drafts && drafts.length > 0 ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {drafts.map((draft) => (
                  <DraftCard
                    key={draft.id}
                    draft={draft}
                    isCurrent={currentDraftId === draft.id}
                    isOpening={busyId === draft.id}
                    isDeleting={deletingId === draft.id}
                    onOpen={() => void handleOpen(draft.id)}
                    onDelete={() => setConfirmDeleteId(draft.id)}
                  />
                ))}
              </div>
            ) : null}

            {/* Infinite scroll sentinel */}
            <div
              ref={sentinelRef}
              className="mt-3 flex h-8 items-center justify-center"
            >
              {isFetchingMore ? (
                <div className="size-4 animate-spin rounded-full border-2 border-border border-t-foreground/60" />
              ) : null}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
