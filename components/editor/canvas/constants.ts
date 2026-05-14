export const BASE_CANVAS_WIDTH = 1100
export const SCREENSHOT_ROW_MARGIN = 1
export const SCREENSHOT_ROW_GAP = 2

export function screenshotRowItemWidth(count: number) {
  if (count <= 1) return 66
  const usableW = Math.max(
    20,
    100 - 2 * SCREENSHOT_ROW_MARGIN - (count - 1) * SCREENSHOT_ROW_GAP
  )
  return usableW / count
}
