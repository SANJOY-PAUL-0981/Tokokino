import { fileURLToPath } from "node:url"

import { defineConfig } from "vitest/config"

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL(".", import.meta.url)),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    include: ["tests/**/*.{test,spec}.{ts,tsx}"],
    exclude: ["node_modules", ".next", ".open-next"],
    environmentOptions: {
      jsdom: {
        url: "https://app.tokokino.test/editor",
      },
    },
  },
})
