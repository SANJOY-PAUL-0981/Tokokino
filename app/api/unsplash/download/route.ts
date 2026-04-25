import { NextResponse } from "next/server"

const UNSPLASH_ACCESS_KEY =
  process.env.UNSPLASH_ACCESS_KEY ?? process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY

export async function GET(request: Request) {
  if (!UNSPLASH_ACCESS_KEY) {
    return NextResponse.json(
      { error: "Missing UNSPLASH_ACCESS_KEY" },
      { status: 500 }
    )
  }

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
