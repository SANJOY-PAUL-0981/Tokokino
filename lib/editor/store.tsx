"use client"

import * as React from "react"

export type AspectState = { id: string; w: number; h: number }

export type BgType = "none" | "solid" | "gradient" | "image"

export type Background = { type: BgType; value: string }

export type Tilt = { rx: number; ry: number; rz: number }

export type Border = { color: string | null; width: number }

export type BackdropEffects = {
  noise: number
  blur: number
  brightness: number
  saturation: number
  opacity: number
}

export type BackdropPattern = {
  ids: number[]
  intensity: number
  thickness: number
  color: string
}

export type Backdrop = {
  effects: BackdropEffects
  pattern: BackdropPattern
}

export type EditorState = {
  screenshot: string | null
  aspect: AspectState
  background: Background
  padding: number
  borderRadius: number
  border: Border
  backdrop: Backdrop
  tilt: Tilt
  scale: number
}

export const GRADIENT_PRESETS = [
  "linear-gradient(135deg, #f87171, #fbbf24)",
  "linear-gradient(135deg, #60a5fa, #a78bfa)",
  "linear-gradient(135deg, #34d399, #60a5fa)",
  "linear-gradient(135deg, #f472b6, #a78bfa)",
  "linear-gradient(135deg, #fbbf24, #f472b6)",
  "linear-gradient(135deg, #111827, #374151)",
  "linear-gradient(135deg, #fb7185, #fdba74)",
  "linear-gradient(135deg, #22d3ee, #818cf8)",
]

export const SOLID_PRESETS = [
  "#0f172a",
  "#ffffff",
  "#f87171",
  "#fbbf24",
  "#34d399",
  "#60a5fa",
  "#a78bfa",
  "#f472b6",
]

export const IMAGE_PRESETS = [
  "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1574169208507-84376144848b?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1557682250-33bd709cbe85?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1557682224-5b8590cd9ec5?q=80&w=1200&auto=format&fit=crop",
]

const DEFAULT_STATE: EditorState = {
  screenshot: null,
  aspect: { id: "16-10", w: 1920, h: 1200 },
  background: {
    type: "gradient",
    value: GRADIENT_PRESETS[2],
  },
  padding: 64,
  borderRadius: 12,
  border: { color: null, width: 1 },
  backdrop: {
    effects: {
      noise: 0,
      blur: 0,
      brightness: 100,
      saturation: 100,
      opacity: 100,
    },
    pattern: {
      ids: [],
      intensity: 50,
      thickness: 1,
      color: "#FFFFFF",
    },
  },
  tilt: { rx: 0, ry: 0, rz: 0 },
  scale: 100,
}

const HISTORY_LIMIT = 100
const GROUP_MERGE_MS = 600

type HistoryState = {
  past: EditorState[]
  present: EditorState
  future: EditorState[]
  lastGroup: string | null
  lastTs: number
}

type Action =
  | { type: "SET"; patch: Partial<EditorState>; group: string | null }
  | { type: "UNDO" }
  | { type: "REDO" }
  | { type: "RESET" }

function reducer(state: HistoryState, action: Action): HistoryState {
  switch (action.type) {
    case "SET": {
      const present = { ...state.present, ...action.patch }
      const now = Date.now()
      const canMerge =
        action.group !== null &&
        action.group === state.lastGroup &&
        now - state.lastTs < GROUP_MERGE_MS
      if (canMerge) {
        return {
          ...state,
          present,
          future: [],
          lastTs: now,
        }
      }
      const past = [...state.past, state.present]
      if (past.length > HISTORY_LIMIT) past.shift()
      return {
        past,
        present,
        future: [],
        lastGroup: action.group,
        lastTs: now,
      }
    }
    case "UNDO": {
      if (!state.past.length) return state
      const prev = state.past[state.past.length - 1]
      return {
        past: state.past.slice(0, -1),
        present: prev,
        future: [state.present, ...state.future],
        lastGroup: null,
        lastTs: 0,
      }
    }
    case "REDO": {
      if (!state.future.length) return state
      const next = state.future[0]
      return {
        past: [...state.past, state.present],
        present: next,
        future: state.future.slice(1),
        lastGroup: null,
        lastTs: 0,
      }
    }
    case "RESET": {
      return {
        past: [...state.past, state.present],
        present: DEFAULT_STATE,
        future: [],
        lastGroup: null,
        lastTs: 0,
      }
    }
  }
}

type Ctx = EditorState & {
  setScreenshot: (s: string | null) => void
  setAspect: (a: AspectState) => void
  setBackground: (b: Background) => void
  setPadding: (n: number) => void
  setBorderRadius: (n: number) => void
  setBorder: (b: Border) => void
  setBackdropEffects: (e: BackdropEffects) => void
  setBackdropPattern: (p: BackdropPattern) => void
  setTilt: (t: Tilt) => void
  setScale: (n: number) => void
  reset: () => void
  undo: () => void
  redo: () => void
  canUndo: boolean
  canRedo: boolean
}

const EditorContext = React.createContext<Ctx | null>(null)

export function EditorProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = React.useReducer(reducer, {
    past: [],
    present: DEFAULT_STATE,
    future: [],
    lastGroup: null,
    lastTs: 0,
  })

  const value: Ctx = React.useMemo(() => {
    const set = (patch: Partial<EditorState>, group: string | null) =>
      dispatch({ type: "SET", patch, group })
    return {
      ...state.present,
      setScreenshot: (s) => set({ screenshot: s }, null),
      setAspect: (a) => set({ aspect: a }, "aspect"),
      setBackground: (b) => set({ background: b }, "background"),
      setPadding: (n) => set({ padding: n }, "padding"),
      setBorderRadius: (n) => set({ borderRadius: n }, "borderRadius"),
      setBorder: (b) => set({ border: b }, "border"),
      setBackdropEffects: (e) =>
        set(
          { backdrop: { ...state.present.backdrop, effects: e } },
          "backdrop-effects"
        ),
      setBackdropPattern: (p) =>
        set(
          { backdrop: { ...state.present.backdrop, pattern: p } },
          "backdrop-pattern"
        ),
      setTilt: (t) => set({ tilt: t }, "tilt"),
      setScale: (n) => set({ scale: n }, "scale"),
      reset: () => dispatch({ type: "RESET" }),
      undo: () => dispatch({ type: "UNDO" }),
      redo: () => dispatch({ type: "REDO" }),
      canUndo: state.past.length > 0,
      canRedo: state.future.length > 0,
    }
  }, [state])

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null
      const tag = target?.tagName
      const isEditable =
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        target?.isContentEditable === true
      if (isEditable) return
      const mod = e.metaKey || e.ctrlKey
      if (!mod) return
      if (e.key === "z" || e.key === "Z") {
        e.preventDefault()
        if (e.shiftKey) dispatch({ type: "REDO" })
        else dispatch({ type: "UNDO" })
      } else if (e.key === "y" || e.key === "Y") {
        e.preventDefault()
        dispatch({ type: "REDO" })
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  return (
    <EditorContext.Provider value={value}>{children}</EditorContext.Provider>
  )
}

export function useEditor() {
  const ctx = React.useContext(EditorContext)
  if (!ctx) throw new Error("useEditor must be used within EditorProvider")
  return ctx
}

export const BACKDROP_PATTERNS = [
  { id: 1, name: "Dots" },
  { id: 2, name: "Grid" },
  { id: 3, name: "Diagonals" },
  { id: 4, name: "Noise" },
  { id: 5, name: "Mesh" },
  { id: 6, name: "Waves" },
  { id: 7, name: "Crosshatch" },
  { id: 8, name: "H-Lines" },
  { id: 9, name: "V-Lines" },
  { id: 10, name: "Rings" },
  { id: 11, name: "Chevron" },
  { id: 12, name: "Stripes" },
] as const

export function patternCssFor(
  id: number,
  color: string,
  thickness: number
): React.CSSProperties {
  const t = Math.max(0.5, thickness)
  switch (id) {
    case 1:
      return {
        backgroundImage: `radial-gradient(${color} ${t}px, transparent ${t}px)`,
        backgroundSize: "10px 10px",
      }
    case 2:
      return {
        backgroundImage: `linear-gradient(${color} ${t}px, transparent ${t}px), linear-gradient(90deg, ${color} ${t}px, transparent ${t}px)`,
        backgroundSize: "14px 14px",
      }
    case 3:
      return {
        backgroundImage: `repeating-linear-gradient(-45deg, ${color} 0 ${t}px, transparent ${t}px 8px)`,
      }
    case 4:
      return {
        backgroundImage: `radial-gradient(${color} ${t}px, transparent ${t}px), radial-gradient(${color} ${Math.max(
          0.5,
          t - 0.3
        )}px, transparent ${Math.max(0.5, t - 0.3)}px)`,
        backgroundSize: "9px 9px, 13px 13px",
        backgroundPosition: "0 0, 4px 4px",
      }
    case 5:
      return {
        backgroundImage: `conic-gradient(from 180deg at 50% 50%, ${color}, transparent, ${color})`,
      }
    case 6:
      return {
        backgroundImage: `linear-gradient(30deg, ${color} 12%, transparent 12.5%, transparent 87%, ${color} 87.5%), linear-gradient(150deg, ${color} 12%, transparent 12.5%, transparent 87%, ${color} 87.5%)`,
        backgroundSize: "60px 100px",
      }
    case 7:
      return {
        backgroundImage: `repeating-linear-gradient(45deg, ${color} 0 ${t}px, transparent ${t}px 10px), repeating-linear-gradient(-45deg, ${color} 0 ${t}px, transparent ${t}px 10px)`,
      }
    case 8:
      return {
        backgroundImage: `repeating-linear-gradient(0deg, ${color} 0 ${t}px, transparent ${t}px 10px)`,
      }
    case 9:
      return {
        backgroundImage: `repeating-linear-gradient(90deg, ${color} 0 ${t}px, transparent ${t}px 10px)`,
      }
    case 10: {
      const r = Math.max(3, 5 - t / 2)
      return {
        backgroundImage: `radial-gradient(circle, transparent ${r}px, ${color} ${r}px ${r + t}px, transparent ${r + t}px)`,
        backgroundSize: "20px 20px",
      }
    }
    case 11:
      return {
        backgroundImage: `linear-gradient(135deg, ${color} 25%, transparent 25%), linear-gradient(225deg, ${color} 25%, transparent 25%), linear-gradient(315deg, ${color} 25%, transparent 25%), linear-gradient(45deg, ${color} 25%, transparent 25%)`,
        backgroundSize: "16px 16px",
        backgroundPosition: "-8px 0, -8px 0, 0 0, 0 0",
      }
    case 12:
      return {
        backgroundImage: `repeating-linear-gradient(-45deg, ${color} 0 ${t * 3}px, transparent ${t * 3}px ${t * 6}px)`,
      }
    default:
      return {}
  }
}

export function effectsFilterCss(e: BackdropEffects): string | undefined {
  const parts: string[] = []
  if (e.blur > 0) parts.push(`blur(${e.blur}px)`)
  if (e.brightness !== 100) parts.push(`brightness(${e.brightness}%)`)
  if (e.saturation !== 100) parts.push(`saturate(${e.saturation}%)`)
  if (e.opacity !== 100) parts.push(`opacity(${e.opacity}%)`)
  return parts.length ? parts.join(" ") : undefined
}

export function backgroundCss(bg: Background): React.CSSProperties {
  if (bg.type === "none") return {}
  if (bg.type === "image") {
    return {
      backgroundImage: `url("${bg.value}")`,
      backgroundSize: "cover",
      backgroundPosition: "center",
    }
  }
  return { background: bg.value }
}
