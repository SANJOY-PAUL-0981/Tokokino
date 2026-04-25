import { NextResponse } from "next/server"

const UNSPLASH_ACCESS_KEY =
  process.env.UNSPLASH_ACCESS_KEY ?? process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY

type UnsplashSearchPhoto = {
  id: string
  alt_description: string | null
  urls: {
    small: string
    regular: string
    full: string
  }
  user: {
    name: string
    links: {
      html: string
    }
  }
  links: {
    download_location: string
  }
}

type UnsplashSearchResponse = {
  results: UnsplashSearchPhoto[]
}

export async function GET(request: Request) {
  if (!UNSPLASH_ACCESS_KEY) {
    return NextResponse.json(
      { error: "Missing UNSPLASH_ACCESS_KEY" },
      { status: 500 }
    )
  }

  const { searchParams } = new URL(request.url)
  const query = searchParams.get("q")?.trim()
  if (!query) {
    return NextResponse.json({ error: "Missing search query" }, { status: 400 })
  }

  const params = new URLSearchParams({
    query,
    per_page: "12",
    orientation: "landscape",
    content_filter: "high",
  })

  const response = await fetch(
    `https://api.unsplash.com/search/photos?${params}`,
    {
      headers: {
        Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
        "Accept-Version": "v1",
      },
      next: { revalidate: 300 },
    }
  )

  if (!response.ok) {
    return NextResponse.json(
      { error: "Unsplash search failed" },
      { status: response.status }
    )
  }

  const data = (await response.json()) as UnsplashSearchResponse
  return NextResponse.json({
    results: data.results.map((photo) => ({
      id: photo.id,
      alt: photo.alt_description ?? "Unsplash photo",
      thumb: photo.urls.small,
      full: photo.urls.regular,
      downloadLocation: photo.links.download_location,
      photographer: photo.user.name,
      photographerUrl: photo.user.links.html,
    })),
  })
}
