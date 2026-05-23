"use client"

import * as React from "react"

/**
 * Defers mounting of children until after the initial paint, showing a
 * fallback skeleton in the meantime.  An optional `priority` (lower = sooner)
 * staggers multiple deferred regions so the browser never has to mount
 * everything on the same frame.
 *
 * Uses `requestIdleCallback` where available, falling back to a
 * `requestAnimationFrame` + `setTimeout` combo so we yield to the browser's
 * compositor before each mount.
 */
export function DeferredMount({
  children,
  fallback,
  priority = 0,
}: {
  children: React.ReactNode
  fallback: React.ReactNode
  /** Lower values mount sooner (0 = first idle, 1 = next frame, …). */
  priority?: number
}) {
  const [ready, setReady] = React.useState(false)

  React.useEffect(() => {
    // Each priority level adds ~60 ms of stagger so components mount
    // on separate frames rather than all on the same one.
    const stagger = priority * 60

    let cancelled = false

    const mount = () => {
      if (!cancelled) setReady(true)
    }

    const scheduleMount = () => {
      if (cancelled) return
      if (stagger > 0) {
        setTimeout(mount, stagger)
      } else {
        mount()
      }
    }

    // Prefer requestIdleCallback so we mount during actual idle time
    if (typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(scheduleMount, { timeout: 300 })
      return () => {
        cancelled = true
        window.cancelIdleCallback(id)
      }
    }

    // Fallback: wait for two rAFs (one to enter the next frame, one to
    // guarantee the previous paint committed) then schedule.
    const raf1 = requestAnimationFrame(() => {
      const raf2 = requestAnimationFrame(scheduleMount)
      // store raf2 for cleanup
      ;(cleanup as { raf2?: number }).raf2 = raf2
    })

    const cleanup = () => {
      cancelled = true
      cancelAnimationFrame(raf1)
      if ((cleanup as { raf2?: number }).raf2) {
        cancelAnimationFrame((cleanup as { raf2?: number }).raf2!)
      }
    }

    return cleanup
  }, [priority])

  if (!ready) return <>{fallback}</>
  return <>{children}</>
}
