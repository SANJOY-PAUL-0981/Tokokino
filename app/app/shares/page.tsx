import type { Metadata } from "next"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

import { getAuth } from "@/lib/auth"
import { getUserShares } from "@/lib/share-db"

import { SharesGallery } from "./shares-gallery"

export const metadata: Metadata = {
  title: "My Shares — Tokokino",
  description: "View and manage your shared Tokokino screenshots.",
}

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export default async function SharesPage() {
  const auth = getAuth()
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session) {
    redirect("/login?callbackURL=/shares")
  }

  const shares = await getUserShares(session.user.id).catch(() => [])

  const serialized = shares.map((s) => ({
    id: s.id,
    imageUrl: s.imageUrl,
    viewCount: s.viewCount,
    createdAt: s.createdAt.toISOString(),
  }))

  return <SharesGallery shares={serialized} />
}
