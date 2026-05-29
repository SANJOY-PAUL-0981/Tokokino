import { betterAuth } from "better-auth"
import { nextCookies } from "better-auth/next-js"

import { getD1Database } from "@/lib/d1"
import { env, requireAuthConfig } from "@/lib/env"

function createAuth() {
  const authConfig = requireAuthConfig()

  return betterAuth({
    baseURL: authConfig.baseURL,
    secret: authConfig.secret,
    database: getD1Database(),
    emailAndPassword: {
      enabled: true,
    },
    socialProviders: {
      google: {
        clientId: env.GOOGLE_CLIENT_ID ?? "",
        clientSecret: env.GOOGLE_CLIENT_SECRET ?? "",
      },
    },
    rateLimit: {
      // Persist counters in D1 so limits hold across Workers isolates instead
      // of the default per-isolate in-memory store.
      enabled: process.env.NODE_ENV === "production",
      storage: "database",
      window: 60,
      max: 100,
      customRules: {
        "/sign-in/email": { window: 60, max: 5 },
        "/sign-up/email": { window: 60, max: 5 },
        "/forget-password": { window: 60, max: 3 },
        "/reset-password": { window: 60, max: 5 },
      },
    },
    plugins: [nextCookies()],
  })
}

let authInstance: ReturnType<typeof createAuth> | null = null

export function getAuth() {
  authInstance ??= createAuth()
  return authInstance
}
