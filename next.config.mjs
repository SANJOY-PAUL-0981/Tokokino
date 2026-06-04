import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare"
import { withSentryConfig } from "@sentry/nextjs"

initOpenNextCloudflareForDev()

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: "/",
        headers: [
          {
            key: "Link",
            value: '</llms.txt>; rel="describedby", </sitemap.xml>; rel="sitemap", </.well-known/api-catalog>; rel="api-catalog"',
          },
        ],
      },
    ]
  },
}

export default withSentryConfig(nextConfig, {
  authToken: process.env.SENTRY_AUTH_TOKEN,
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  release: {
    create: Boolean(process.env.SENTRY_AUTH_TOKEN),
  },
  silent: !process.env.CI,
  sourcemaps: {
    disable:
      !process.env.SENTRY_AUTH_TOKEN ||
      !process.env.SENTRY_ORG ||
      !process.env.SENTRY_PROJECT,
  },
  telemetry: false,
})
