import { useEffect, useMemo, useRef, useState } from 'react'
import { Article, fmtDate, rng, useTilt } from '../lib'
import TopicChips from './TopicChips'
import Glyph from './Glyph'

/** Shared SVG displacement filter — animated on hover for a gentle liquid warp on thumbnails. */
export function WarpFilter() {
  return (
    <svg width="0" height="0" className="absolute" aria-hidden>
      <filter id="warp" x="-5%" y="-5%" width="110%" height="110%">
        <feTurbulence type="fractalNoise" baseFrequency="0.008 0.018" numOctaves="2" seed="4" result="n" />
        <feDisplacementMap id="warp-map" in="SourceGraphic" in2="n" scale="0" xChannelSelector="R" yChannelSelector="G" />
      </filter>
    </svg>
  )
}

let raf = 0
const setWarp = (to: number) => {
  cancelAnimationFrame(raf)
  const map = document.getElementById('warp-map')
  if (!map) return
  const step = () => {
    const cur = parseFloat(map.getAttribute('scale') || '0'), next = cur + (to - cur) * 0.12
    map.setAttribute('scale', Math.abs(next - to) < 0.3 ? String(to) : next.toFixed(2))
    if (Math.abs(next - to) >= 0.3) raf = requestAnimationFrame(step)
  }
  raf = requestAnimationFrame(step)
}

function Pixels({ seed, hover }: { seed: number; hover: boolean }) {
  const cells = useMemo(() => { const r = rng(seed); return Array.from({ length: 30 * 2 }, (_, i) => ({ on: r() < (i < 30 ? 0.2 : 0.7), d: r() * 260 })) }, [seed])
  return (
    <div aria-hidden className="pointer-events-none absolute inset-x-0 -bottom-px grid grid-cols-[repeat(30,1fr)]">
      {cells.map((c, i) => (
        <span key={i} className="block aspect-square bg-[rgb(var(--card-solid))] transition-all duration-500" style={{ opacity: c.on ? (hover ? 0.2 + (i % 3) * 0.25 : 1) : 0, transform: hover && c.on ? 'translateY(35%)' : 'none', transitionDelay: `${c.d}ms` }} />
      ))}
    </div>
  )
}

export default function ArticleCard({ a, i, saved, onToggle }: { a: Article; i: number; saved: boolean; onToggle: () => void }) {
  const [hover, setHover] = useState(false)
  const [ok, setOk] = useState(true)
  const img = useRef<HTMLImageElement>(null)
  const tilt = useTilt<HTMLElement>(5)
  useEffect(() => () => setWarp(0), [])
  const on = () => { setHover(true); if (img.current) img.current.style.filter = 'url(#warp)'; setWarp(20) }
  const off = () => { setHover(false); setWarp(0); setTimeout(() => { if (img.current && !img.current.matches(':hover')) img.current.style.filter = '' }, 700) }

  return (
    <div className="reveal" style={{ ['--d' as string]: `${(i % 3) * 80}ms` }}>
    <article ref={tilt} onMouseEnter={on} onMouseLeave={off}
      className="tilt group relative flex h-full flex-col overflow-hidden rounded-2xl border border-line card-3d">
      <i className="tilt-glare" aria-hidden />
      <div className="relative aspect-[4/3] overflow-hidden bg-surface">
        {ok ? <img ref={img} src={a.image} alt="" loading={i < 3 ? 'eager' : 'lazy'} referrerPolicy="no-referrer" onError={() => setOk(false)} className="absolute inset-0 h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.07] photo-tone" />
          : <div className="absolute inset-0 bg-gradient-to-br from-sand to-mist" />}
        <span className="absolute left-3 top-3 rounded-full bg-white/85 px-2.5 py-1 font-mono text-[9.5px] uppercase tracking-widest backdrop-blur">{a.region}</span>
        <Pixels seed={i * 13 + 5} hover={hover} />
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.12em] text-mute">
          <span className="text-ink">{a.source}</span><span>{fmtDate(a.date)}</span>
        </div>
        <h3 className="text-[19px] font-medium leading-[1.2] tracking-[-0.015em]">
          <a href={a.url} target="_blank" rel="noopener noreferrer" data-cursor="Read ↗" className="outline-none after:absolute after:inset-0 after:z-[1] focus-visible:after:ring-2 focus-visible:after:ring-key focus-visible:after:ring-inset">{a.title}</a>
        </h3>
        <p className="line-clamp-2 text-[14px] leading-relaxed text-mute">{a.excerpt}</p>
        <div className="mt-auto flex items-end justify-between gap-3 pt-2">
          <TopicChips topics={a.topics} />
          <span className="shrink-0 text-lg transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden>↗</span>
        </div>
      </div>

      <button onClick={onToggle} aria-pressed={saved} aria-label={saved ? 'Remove from selected reports' : 'Add to selected reports'} data-cursor={saved ? 'Remove' : 'Select'}
        className={`absolute right-3 top-3 z-[2] flex items-center gap-1.5 rounded-full px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest backdrop-blur max-md:px-3.5 max-md:py-2.5 transition-all duration-300 ${saved ? 'bg-key text-deep' : 'bg-white/85 text-ink hover:bg-fg hover:text-onfg'}`}>
        <Glyph name="vest" className="h-4 w-4" />
        {saved ? 'Selected' : 'Select'}
      </button>
    </article>
    </div>
  )
}
