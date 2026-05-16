"use client"

import * as React from "react"

export type CenterGuidesState = { x: boolean; y: boolean }

export function useCenterGuides() {
  const [guides, setGuides] = React.useState<CenterGuidesState>({
    x: false,
    y: false,
  })

  const updateGuides = React.useCallback((next: CenterGuidesState) => {
    setGuides((prev) => (prev.x === next.x && prev.y === next.y ? prev : next))
  }, [])

  return [guides, updateGuides] as const
}

export function CenterGuides({ guides }: { guides: CenterGuidesState }) {
  return (
    <>
      {guides.x ? (
        <div
          aria-hidden
          data-export-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-1/2 z-[900] -translate-x-1/2 border-l border-dashed border-[#9BCD64]/95"
        />
      ) : null}
      {guides.y ? (
        <div
          aria-hidden
          data-export-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-1/2 z-[900] -translate-y-1/2 border-t border-dashed border-[#9BCD64]/95"
        />
      ) : null}
    </>
  )
}
