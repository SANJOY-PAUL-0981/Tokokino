/**
 * Export filename templating.
 *
 * Users can define a filename format with variable tokens (e.g.
 * `{TEMPLATE}_{SCALE}_{DATE}`). The chosen format is persisted in
 * localStorage and applied by `lib/editor/export.ts` when downloading.
 */

export const EXPORT_FILENAME_STORAGE_KEY = "tokokino:export-filename-format"
export const DEFAULT_EXPORT_FILENAME_FORMAT = "screenshot_{SCALE}_{DATE}"

export type ExportFilenameVariable = {
  token: string
  label: string
}

export const EXPORT_FILENAME_VARIABLES: ExportFilenameVariable[] = [
  { token: "{DATE}", label: "Current date and time" },
  { token: "{TEMPLATE}", label: "Current template / preset" },
  { token: "{SCALE}", label: "Export scale factor" },
  { token: "{RANDOM}", label: "Random string" },
  { token: "{WIDTH}", label: "Image width in pixels" },
  { token: "{HEIGHT}", label: "Image height in pixels" },
]

const TOKEN_PATTERN = /\{(DATE|TEMPLATE|SCALE|RANDOM|WIDTH|HEIGHT)\}/g

export type ExportFilenameContext = {
  date: string
  template: string
  scale: string
  random: string
  width: number | string
  height: number | string
}

export function getExportFilenameFormat(): string {
  if (typeof window === "undefined") return DEFAULT_EXPORT_FILENAME_FORMAT
  try {
    const stored = window.localStorage.getItem(EXPORT_FILENAME_STORAGE_KEY)
    return stored && stored.trim() ? stored : DEFAULT_EXPORT_FILENAME_FORMAT
  } catch {
    return DEFAULT_EXPORT_FILENAME_FORMAT
  }
}

export function setExportFilenameFormat(format: string): void {
  if (typeof window === "undefined") return
  try {
    const trimmed = format.trim()
    if (!trimmed || trimmed === DEFAULT_EXPORT_FILENAME_FORMAT) {
      window.localStorage.removeItem(EXPORT_FILENAME_STORAGE_KEY)
    } else {
      window.localStorage.setItem(EXPORT_FILENAME_STORAGE_KEY, trimmed)
    }
  } catch {
    /* ignore quota / privacy-mode errors */
  }
}

export function exportTimestamp(date = new Date()): string {
  return date.toISOString().replace(/[:.]/g, "-").replace("T", "_").slice(0, 19)
}

export function randomFilenameToken(length = 6): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789"
  let out = ""
  for (let i = 0; i < length; i += 1) {
    out += chars[Math.floor(Math.random() * chars.length)]
  }
  return out
}

/** Replace tokens then strip characters that are unsafe in filenames. */
export function applyExportFilenameFormat(
  format: string,
  ctx: ExportFilenameContext
): string {
  const values: Record<string, string> = {
    "{DATE}": ctx.date,
    "{TEMPLATE}": ctx.template,
    "{SCALE}": ctx.scale,
    "{RANDOM}": ctx.random,
    "{WIDTH}": String(ctx.width),
    "{HEIGHT}": String(ctx.height),
  }

  const replaced = format.replace(
    TOKEN_PATTERN,
    (match) => values[match] ?? match
  )

  const safe = replaced
    .replace(/[\\/:*?"<>|]+/g, "-")
    .replace(/\s+/g, "_")
    .replace(/_{2,}/g, "_")
    .replace(/^[._-]+|[._-]+$/g, "")

  return safe || "screenshot"
}

/** Build the final download filename (without re-adding the extension). */
export function buildExportFilename(opts: {
  format: string
  scale: string
  template: string
  width: number
  height: number
  extension: string
}): string {
  const name = applyExportFilenameFormat(opts.format, {
    date: exportTimestamp(),
    template: opts.template,
    scale: opts.scale,
    random: randomFilenameToken(),
    width: opts.width,
    height: opts.height,
  })
  return `${name}${opts.extension}`
}
