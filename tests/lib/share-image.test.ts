import { describe, expect, it } from "vitest"

import { detectShareImageContentType } from "@/lib/share-image"

describe("detectShareImageContentType", () => {
  it("accepts PNG signatures", () => {
    expect(
      detectShareImageContentType(
        new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
      )
    ).toBe("image/png")
  })

  it("accepts JPEG signatures", () => {
    expect(
      detectShareImageContentType(new Uint8Array([0xff, 0xd8, 0xff, 0xe0]))
    ).toBe("image/jpeg")
  })

  it("rejects spoofed or truncated image bodies", () => {
    expect(
      detectShareImageContentType(new TextEncoder().encode("<svg></svg>"))
    ).toBeNull()
    expect(detectShareImageContentType(new Uint8Array([0xff, 0xd8]))).toBeNull()
  })
})
