import "server-only"

import { getCloudflareContext } from "@opennextjs/cloudflare"
import { NextResponse } from "next/server"

/**
 * Cloudflare Workers native rate limiting.
 *
 * Limiters are declared as `ratelimit` bindings in `wrangler.jsonc`:
 *   - HEAVY_RATE_LIMITER  — 30 req / 60s   (expensive / unauthenticated routes)
 *   - WRITE_RATE_LIMITER  — 60 req / 60s   (authenticated write routes)
 *
 * The binding is only present in the Workers runtime (preview/deploy and
 * `wrangler dev`). Under plain `next dev` or `next build` it is absent, so we
 * fail open and skip limiting rather than break local development.
 */
export type RateLimiterName = "HEAVY_RATE_LIMITER" | "WRITE_RATE_LIMITER"

type CloudflareRateLimiter = {
  limit: (options: { key: string }) => Promise<{ success: boolean }>
}

function getLimiter(name: RateLimiterName): CloudflareRateLimiter | null {
  try {
    const binding = (
      getCloudflareContext().env as unknown as Record<string, unknown>
    )[name]
    if (
      binding &&
      typeof (binding as CloudflareRateLimiter).limit === "function"
    ) {
      return binding as CloudflareRateLimiter
    }
  } catch {
    // No Cloudflare context available (local `next dev` / `next build`).
  }
  return null
}

export function getClientIp(headers: Headers): string {
  return (
    headers.get("cf-connecting-ip") ??
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headers.get("x-real-ip") ??
    "unknown"
  )
}

/**
 * Returns a 429 `NextResponse` when the request exceeds the limit, otherwise
 * `null`. Fails open (returns `null`) when the limiter binding is unavailable.
 *
 * @param scope  A stable label for the route (e.g. "share-create"). Combined
 *               with `id` to form the rate-limit key so each route is counted
 *               independently.
 * @param id     The per-caller identifier — a user id when authenticated, or
 *               the client IP otherwise.
 */
export async function enforceRateLimit({
  limiter: limiterName,
  scope,
  id,
}: {
  limiter: RateLimiterName
  scope: string
  id: string
}): Promise<NextResponse | null> {
  const limiter = getLimiter(limiterName)
  if (!limiter) return null

  try {
    const { success } = await limiter.limit({ key: `${scope}:${id}` })
    if (success) return null
  } catch {
    // Treat limiter errors as allow rather than blocking legitimate traffic.
    return null
  }

  return NextResponse.json(
    { error: "Too many requests. Please slow down and try again shortly." },
    { status: 429, headers: { "Retry-After": "60" } }
  )
}
