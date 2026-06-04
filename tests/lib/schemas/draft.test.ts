import { describe, expect, it } from "vitest"

import {
  DRAFT_NAME_MAX_LENGTH,
  countCanvasesInDraftState,
  parseDraftSaveBody,
  unwrapDraftState,
} from "@/lib/schemas/draft"

describe("draft schema helpers", () => {
  it("accepts legacy draft state when creating a named draft", () => {
    const state = { canvases: [{ id: "canvas-1" }] }

    expect(
      parseDraftSaveBody(
        { name: "  Launch shot  ", state },
        { requireName: true }
      )
    ).toEqual({
      ok: true,
      name: "Launch shot",
      state,
    })
  })

  it("rejects unnamed creates, long names, and empty canvas states", () => {
    expect(
      parseDraftSaveBody(
        { state: { canvases: [{ id: "a" }] } },
        { requireName: true }
      )
    ).toEqual({
      ok: false,
      error: "Name is required",
    })

    expect(
      parseDraftSaveBody(
        {
          name: "x".repeat(DRAFT_NAME_MAX_LENGTH + 1),
          state: { canvases: [{ id: "a" }] },
        },
        { requireName: true }
      )
    ).toEqual({ ok: false, error: "Name is too long" })

    expect(
      parseDraftSaveBody(
        { name: "Empty", state: { canvases: [] } },
        { requireName: true }
      )
    ).toEqual({ ok: false, error: "Invalid draft state" })
  })

  it("unwraps current draft payloads and counts canvases", () => {
    const payload = {
      schemaVersion: 1 as const,
      present: { canvases: [{ id: "a" }, { id: "b" }] },
      ui: { presetTab: "multi" as const },
    }

    expect(unwrapDraftState(payload)).toEqual({
      present: payload.present,
      ui: payload.ui,
    })
    expect(countCanvasesInDraftState(payload)).toBe(2)
  })
})
