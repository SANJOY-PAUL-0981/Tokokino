import { NextResponse } from "next/server"

import { env } from "@/lib/env"
import { enforceRateLimit, getClientIp } from "@/lib/rate-limit"

const UNSPLASH_ACCESS_KEY = env.UNSPLASH_ACCESS_KEY

export async function GET(request: Request) {
  if (!UNSPLASH_ACCESS_KEY) {
    return NextResponse.json(
      { error: "Missing UNSPLASH_ACCESS_KEY" },
      { status: 500 }
    )
  }

  const limited = await enforceRateLimit({
    limiter: "HEAVY_RATE_LIMITER",
    scope: "unsplash-download",
    id: getClientIp(request.headers),
  })
  if (limited) return limited

  const { searchParams } = new URL(request.url)
  const url = searchParams.get("url")
  if (!url || !url.startsWith("https://api.unsplash.com/")) {
    return NextResponse.json(
      { error: "Missing Unsplash download location" },
      { status: 400 }
    )
  }

  const response = await fetch(url, {
    headers: {
      Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
      "Accept-Version": "v1",
    },
  })

  if (!response.ok) {
    return NextResponse.json(
      { error: "Unsplash download tracking failed" },
      { status: response.status }
    )
  }

  return NextResponse.json({ ok: true })
}
