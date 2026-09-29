import { useEffect, useRef } from 'react'

type Kind = 'suitcase' | 'backpack' | 'bundle' | 'vest' | 'foot'
type Piece = { kind: Kind; x: number; y: number; vx: number; vy: number; s: number; rot: number; vr: number; col: string; life: number; amb: boolean; ph: number }

const KEY = '237,176,33'
const fgRgb = () => getComputedStyle(document.documentElement).getPropertyValue('--fg').trim().split(/\s+/).join(',') || '17,18,20'

/* ---- silhouettes, centred on 0,0; s ≈ half-width. Cut-outs use destination-out (canvas holds only our shapes). ---- */
function rr(c: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) { c.beginPath(); c.roundRect(x, y, w, h, r) }
function cut(c: CanvasRenderingContext2D, lw: number, draw: () => void) { c.save(); c.globalCompositeOperation = 'destination-out'; c.lineWidth = lw; c.lineCap = 'round'; draw(); c.restore() }
const SHAPES: Record<Kind, (c: CanvasRenderingContext2D, s: number) => void> = {
  suitcase(c, s) {
    rr(c, -s, -s * 0.6, s * 2, s * 1.4, s * 0.2); c.fill()
    c.lineWidth = s * 0.2; c.lineJoin = 'round'; c.beginPath(); c.moveTo(-s * 0.4, -s * 0.6); c.lineTo(-s * 0.4, -s); c.lineTo(s * 0.4, -s); c.lineTo(s * 0.4, -s * 0.6); c.stroke()
    cut(c, s * 0.13, () => { for (const x of [-0.5, 0.5]) { c.beginPath(); c.moveTo(x * s, -s * 0.6); c.lineTo(x * s, s * 0.8); c.stroke() } })
  },
  backpack(c, s) {
    c.beginPath(); c.moveTo(-s * 0.8, s * 0.9); c.lineTo(-s * 0.8, -s * 0.2); c.arc(0, -s * 0.2, s * 0.8, Math.PI, 0); c.lineTo(s * 0.8, s * 0.9); c.closePath(); c.fill()
    c.lineWidth = s * 0.16; c.beginPath(); c.arc(0, -s * 0.98, s * 0.28, Math.PI, 0); c.stroke()
    cut(c, s * 0.11, () => { rr(c, -s * 0.5, 0, s, s * 0.62, s * 0.14); c.stroke(); c.beginPath(); c.moveTo(-s * 0.5, -s * 0.35); c.lineTo(s * 0.5, -s * 0.35); c.stroke() })
  },
  bundle(c, s) {
    c.beginPath(); c.ellipse(0, s * 0.2, s * 0.95, s * 0.75, 0, 0, 7); c.fill()
    c.beginPath(); c.arc(0, -s * 0.62, s * 0.3, 0, 7); c.fill()
    cut(c, s * 0.1, () => { c.beginPath(); c.moveTo(-s * 0.55, -s * 0.15); c.quadraticCurveTo(0, s * 0.35, s * 0.55, -s * 0.15); c.stroke(); c.beginPath(); c.moveTo(-s * 0.7, s * 0.3); c.quadraticCurveTo(0, s * 0.85, s * 0.7, s * 0.3); c.stroke() })
  },
  foot(c, s) { c.beginPath(); c.ellipse(0, -s * 0.5, s * 0.55, s * 0.85, 0, 0, 7); c.fill(); c.beginPath(); c.ellipse(0, s * 0.85, s * 0.45, s * 0.5, 0, 0, 7); c.fill() },
  vest(c, s) {   // life jacket
    c.beginPath(); c.moveTo(-s * 0.95, -s * 0.8); c.lineTo(-s * 0.4, -s * 0.8); c.quadraticCurveTo(0, -s * 0.2, s * 0.4, -s * 0.8); c.lineTo(s * 0.95, -s * 0.8); c.lineTo(s * 0.8, s * 0.9); c.lineTo(-s * 0.8, s * 0.9); c.closePath(); c.fill()
    cut(c, s * 0.1, () => { c.beginPath(); c.moveTo(0, -s * 0.15); c.lineTo(0, s * 0.9); c.stroke(); c.beginPath(); c.moveTo(-s * 0.85, s * 0.2); c.lineTo(s * 0.85, s * 0.2); c.stroke() })
  },
}
const KINDS = Object.keys(SHAPES) as Kind[]

/**
 * Fixed canvas that only draws on interaction: `upheal:burst` (filter pills, hero buttons…) throws a handful of
 * belongings — suitcase, backpack, bundle, life jacket — upward from the click point. Nothing floats on its own.
 */
export default function Journey() {
  const cv = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const c = cv.current!, ctx = c.getContext('2d')!
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let W = 0, H = 0
    const resize = () => { const dpr = Math.min(2, devicePixelRatio || 1); W = innerWidth; H = innerHeight; c.width = W * dpr; c.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0) }
    resize(); addEventListener('resize', resize)

    const pcs: Piece[] = []
    let id = 0, last = performance.now()
    const loop = (now: number) => {
      const dt = Math.min(2.5, (now - last) / 16.7); last = now
      ctx.clearRect(0, 0, W, H)
      for (let i = pcs.length - 1; i >= 0; i--) {
        const p = pcs[i]
        p.vy += 0.05 * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.rot += p.vr * dt; p.life -= 0.008 * dt; p.vx *= 0.99
        if (p.life <= 0) { pcs.splice(i, 1); continue }
        ctx.save(); ctx.globalAlpha = Math.min(1, p.life * 1.5) * 0.9; ctx.fillStyle = ctx.strokeStyle = `rgb(${p.col})`
        ctx.translate(p.x, p.y); ctx.rotate(p.rot); SHAPES[p.kind](ctx, p.s); ctx.restore()
      }
      if (pcs.length) id = requestAnimationFrame(loop)
      else { id = 0; ctx.clearRect(0, 0, W, H) }   // idle: no frames are scheduled
    }
    const onBurst = (e: Event) => {
      const { x, y } = (e as CustomEvent).detail
      for (let i = 0; i < 7; i++) {
        const a = -Math.PI / 2 + (Math.random() - 0.5) * 1.6, sp = 2.6 + Math.random() * 2.8, kind = KINDS[(Math.random() * KINDS.length) | 0]
        pcs.push({ kind, x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, s: 11 + Math.random() * 7, rot: (Math.random() - 0.5) * 0.8, vr: (Math.random() - 0.5) * 0.12, col: kind === 'vest' ? KEY : fgRgb(), life: 1, amb: false, ph: 0 })
      }
      if (!id) { last = performance.now(); loop(last) }   // draw now, don't wait for the next frame
    }
    addEventListener('upheal:burst', onBurst)
    return () => { if (id) cancelAnimationFrame(id); removeEventListener('resize', resize); removeEventListener('upheal:burst', onBurst) }
  }, [])
  return <canvas ref={cv} aria-hidden className="pointer-events-none fixed inset-0 z-[60] h-full w-full" />
}
