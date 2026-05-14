"use client"

import * as React from "react"

export function useSuppressTransitionOnChange(value: unknown) {
  const [suppressTransition, setSuppressTransition] = React.useState(false)
  const previousValueRef = React.useRef(value)

  React.useEffect(() => {
    if (previousValueRef.current === value) return

    previousValueRef.current = value
    setSuppressTransition(true)
    let secondFrame = 0
    const firstFrame = requestAnimationFrame(() => {
      secondFrame = requestAnimationFrame(() => {
        setSuppressTransition(false)
      })
    })

    return () => {
      cancelAnimationFrame(firstFrame)
      if (secondFrame) cancelAnimationFrame(secondFrame)
    }
  }, [value])

  return suppressTransition
}
