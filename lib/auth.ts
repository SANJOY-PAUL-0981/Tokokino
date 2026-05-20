import { betterAuth } from "better-auth"
import { mongodbAdapter } from "better-auth/adapters/mongodb"
import { nextCookies } from "better-auth/next-js"

import { env, requireAuthConfig } from "@/lib/env"
import { getAppDb, getMongoClient } from "@/lib/mongo"

function createAuth() {
  const client = getMongoClient()
  const db = getAppDb()
  const authConfig = requireAuthConfig()

  return betterAuth({
    baseURL: authConfig.baseURL,
    secret: authConfig.secret,
    database: mongodbAdapter(db, { client }),
    emailAndPassword: {
      enabled: true,
    },
    socialProviders: {
      google: {
        clientId: env.GOOGLE_CLIENT_ID ?? "",
        clientSecret: env.GOOGLE_CLIENT_SECRET ?? "",
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
