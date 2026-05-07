import { z } from "zod/v4"

/**
 * Schema for server-side environment variables.
 * These are only available in server components and API routes.
 */
const serverSchema = z.object({
  UNSPLASH_ACCESS_KEY: z.string().optional(),
  R2_ACCOUNT_ID: z.string().optional(),
  R2_BUCKET: z.string().optional(),
  R2_S3_ENDPOINT: z.url().optional(),
  R2_ACCESS_KEY_ID: z.string().optional(),
  R2_SECRET_ACCESS_KEY: z.string().optional(),
  R2_API_TOKEN: z.string().optional(),
})

/**
 * Schema for client-side environment variables (NEXT_PUBLIC_*).
 * Only NEXT_PUBLIC_R2_PUBLIC_BASE is needed — all other asset
 * URLs are derived from it in the consuming modules.
 */
const clientSchema = z.object({
  NEXT_PUBLIC_R2_PUBLIC_BASE: z.string(),
})

const serverEnv = serverSchema.parse({
  UNSPLASH_ACCESS_KEY: process.env.UNSPLASH_ACCESS_KEY,
  R2_ACCOUNT_ID: process.env.R2_ACCOUNT_ID,
  R2_BUCKET: process.env.R2_BUCKET,
  R2_S3_ENDPOINT: process.env.R2_S3_ENDPOINT,
  R2_ACCESS_KEY_ID: process.env.R2_ACCESS_KEY_ID,
  R2_SECRET_ACCESS_KEY: process.env.R2_SECRET_ACCESS_KEY,
  R2_API_TOKEN: process.env.R2_API_TOKEN,
})

const clientEnv = clientSchema.parse({
  NEXT_PUBLIC_R2_PUBLIC_BASE:
    process.env.NEXT_PUBLIC_R2_PUBLIC_BASE,
})

export const env = {
  ...serverEnv,
  ...clientEnv,
} as const
