import { useEffect, useRef, useSyncExternalStore } from 'react'

export type Article = {
  source: string
  title: string
  excerpt: string
  url: string
  image: string
  date: string
  region: string
  topics: string[]
}

export const fmtDate = (d: string) =>
  new Date(d + 'T00:00:00Z').toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })

export const fmtTime = (s: number) => {
  s = Math.max(0, Math.floor(s))
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

/** seeded PRNG so pixel patterns are stable between renders */
export const rng = (seed: number) => () => {
  seed |= 0; seed = (seed + 0x6d2b79f5) | 0
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}

/** adds .in to .reveal elements as they scroll into view — also picks up elements added later (filters, tabs) */
export function useReveal() {
  useEffect(() => {
    const seen = new WeakSet<Element>()
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => e.isIntersecting && (e.target.classList.add('in'), io.unobserve(e.target))),
      { threshold: 0.12, rootMargin: '0px 0px -6% 0px' },
    )
    const scan = (root: ParentNode = document) =>
      root.querySelectorAll<HTMLElement>('.reveal:not(.in)').forEach((el) => { if (!seen.has(el)) { seen.add(el); io.observe(el) } })
    scan()
    const mo = new MutationObserver(() => scan())
    mo.observe(document.body, { childList: true, subtree: true })
    return () => { io.disconnect(); mo.disconnect() }
  }, [])
}

export function useRafLoop(cb: (t: number) => void, active = true) {
  const ref = useRef(cb)
  ref.current = cb
  useEffect(() => {
    if (!active) return
    let id = 0
    const loop = (t: number) => { ref.current(t); id = requestAnimationFrame(loop) }
    id = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(id)
  }, [active])
}

/** Draws the burst first, then runs `then` (heavy state updates) after that frame has been painted. */
export const burst = (x: number, y: number, then?: () => void) => {
  window.dispatchEvent(new CustomEvent('upheal:burst', { detail: { x, y } }))
  if (then) requestAnimationFrame(() => setTimeout(then, 0))
}

export async function sha256(data: ArrayBuffer | string): Promise<string> {
  const buf = typeof data === 'string' ? new TextEncoder().encode(data) : data
  const d = await crypto.subtle.digest('SHA-256', buf)
  return [...new Uint8Array(d)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

export const fmtBytes = (n: number) =>
  n < 1024 ? `${n} B` : n < 1048576 ? `${(n / 1024).toFixed(1)} KB` : `${(n / 1048576).toFixed(1)} MB`

/** localStorage-backed state shared by every component that uses the same key (one in-memory copy + subscribers). */
const mem = new Map<string, unknown>(), subs = new Map<string, Set<() => void>>()
export function useStored<T>(key: string, init: () => T): [T, (v: T | ((p: T) => T)) => void] {
  const read = () => {
    if (!mem.has(key)) { let v: T; try { const s = localStorage.getItem(key); v = s ? (JSON.parse(s) as T) : init() } catch { v = init() } mem.set(key, v) }
    return mem.get(key) as T
  }
  const v = useSyncExternalStore((cb) => { const set = subs.get(key) ?? subs.set(key, new Set()).get(key)!; set.add(cb); return () => set.delete(cb) }, read)
  const save = (n: T | ((p: T) => T)) => {
    const nv = typeof n === 'function' ? (n as (p: T) => T)(read()) : n
    mem.set(key, nv)
    try { localStorage.setItem(key, JSON.stringify(nv)) } catch { /* quota */ }
    subs.get(key)?.forEach((f) => f())
  }
  return [v, save]
}

export const cite = (a: Pick<Article, 'source' | 'title' | 'date' | 'url'>) =>
  `${a.source}, “${a.title}” (${new Date(a.date + 'T00:00:00Z').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })}), ${a.url}`

/** 3D tilt + moving glare on hover (fine pointers only). Attach the returned ref to an element with class "tilt". */
export function useTilt<T extends HTMLElement>(max = 6) {
  const ref = useRef<T>(null)
  useEffect(() => {
    const el = ref.current
    if (!el || !matchMedia('(hover: hover)').matches || matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect(), px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height
      el.style.setProperty('--ry', `${((px - 0.5) * max * 2).toFixed(2)}deg`)
      el.style.setProperty('--rx', `${((0.5 - py) * max * 2).toFixed(2)}deg`)
      el.style.setProperty('--gx', `${(px * 100).toFixed(1)}%`); el.style.setProperty('--gy', `${(py * 100).toFixed(1)}%`)
    }
    const leave = () => { el.style.setProperty('--rx', '0deg'); el.style.setProperty('--ry', '0deg') }
    el.addEventListener('pointermove', move); el.addEventListener('pointerleave', leave)
    return () => { el.removeEventListener('pointermove', move); el.removeEventListener('pointerleave', leave) }
  }, [max])
  return ref
}
