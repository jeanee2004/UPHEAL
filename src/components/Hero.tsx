import { useEffect, useRef, useState } from 'react'
import Steps from './Steps'
import { burst, fmtTime } from '../lib'
import briefing from '../data/briefing.json'

const WORD = 'together'.split('')
const MEDIA = { video: '/media/hero.mp4', poster: '/media/hero-poster.jpg', still: '/media/hero-still.jpg' }

export default function Hero({ updated }: { updated: string }) {
  const root = useRef<HTMLElement>(null)
  const letters = useRef<(HTMLSpanElement | null)[]>([])
  const vid = useRef<HTMLVideoElement>(null)
  const [ready, setReady] = useState(false)   // video is playing → fade it over the still
  const [dip, setDip] = useState(false)       // dip to navy at the loop point so the cut is invisible
  const [reduced] = useState(() => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches)

  // headline weight swells near the cursor + gentle parallax on the media
  useEffect(() => {
    const el = root.current!
    let tx = 0, ty = 0, x = 0, y = 0, id = 0
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      tx = (e.clientX - r.left) / r.width - 0.5; ty = (e.clientY - r.top) / r.height - 0.5
      letters.current.forEach((l) => {
        if (!l) return
        const b = l.getBoundingClientRect()
        const k = Math.max(0, 1 - Math.hypot(e.clientX - (b.left + b.width / 2), e.clientY - (b.top + b.height / 2)) / 220)
        l.style.fontVariationSettings = `'wght' ${Math.round(640 + k * 260)}`; l.style.transform = `translateY(${-k * 14}px)`
      })
    }
    let last = performance.now()
    const loop = (t: number) => { const k = 1 - Math.exp(-(t - last) / 70); last = t; x += (tx - x) * k; y += (ty - y) * k; el.style.setProperty('--mx', x.toFixed(4)); el.style.setProperty('--my', y.toFixed(4)); id = requestAnimationFrame(loop) }
    id = requestAnimationFrame(loop)
    el.addEventListener('pointermove', move)
    return () => { cancelAnimationFrame(id); el.removeEventListener('pointermove', move) }
  }, [])

  // autoplay (muted) + loop dip
  useEffect(() => {
    const v = vid.current
    if (!v || reduced) return
    v.muted = true
    v.play().catch(() => { /* autoplay blocked: the still image stays */ })
    const t = setInterval(() => { if (v.duration) setDip(v.duration - v.currentTime < 0.6) }, 100)
    return () => clearInterval(t)
  }, [reduced])

  const go = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault(); burst(e.clientX, e.clientY, () => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }))
  }

  return (
    <section ref={root} id="top" className="grain-dark relative h-[min(100svh,1100px)] min-h-[680px] w-full overflow-hidden bg-[#0a0a0a]">
      {/* ---------- media: refugee imagery (right side on desktop, top on mobile) ---------- */}
      <div className="absolute inset-x-0 top-0 h-[64%] [-webkit-mask-image:linear-gradient(180deg,#000_62%,transparent)] [mask-image:linear-gradient(180deg,#000_62%,transparent)] lg:inset-y-0 lg:left-auto lg:right-0 lg:h-full lg:w-[72%] lg:[-webkit-mask-image:linear-gradient(90deg,transparent,#000_34%)] lg:[mask-image:linear-gradient(90deg,transparent,#000_34%)]" style={{ transform: 'translate3d(calc(var(--mx,0) * -10px), calc(var(--my,0) * -6px), 0) scale(1.04)' }}>
        <img src={MEDIA.still} alt="" className="absolute inset-0 h-full w-full object-cover object-[62%_center] grayscale contrast-[1.08] brightness-[.8]" />
        {!reduced && (
          <video ref={vid} muted loop playsInline autoPlay preload="auto" poster={MEDIA.poster} onPlaying={() => setReady(true)} aria-hidden
            className={`absolute inset-0 h-full w-full object-cover object-[58%_center] grayscale contrast-[1.08] brightness-[.8] transition-opacity duration-700 ${ready && !dip ? 'opacity-100' : 'opacity-0'}`}>
            <source src={MEDIA.video} type="video/mp4" />
          </video>
        )}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_60%_45%,transparent_35%,rgba(0,0,0,.65))]" />
      </div>
      {/* fades: text side / bottom / header */}
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,#0a0a0a_0%,rgba(10,10,10,.86)_26%,rgba(10,10,10,.25)_52%,transparent_70%)] max-lg:hidden" />
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(10,10,10,.55)_0%,transparent_22%,transparent_46%,#0a0a0a_88%)] lg:bg-[linear-gradient(180deg,rgba(10,10,10,.5)_0%,transparent_20%,transparent_70%,rgba(10,10,10,.85)_100%)]" />

      {/* ---------- copy ---------- */}
      <div className="relative z-10 mx-auto flex h-full max-w-[1440px] flex-col justify-end px-5 pb-[170px] md:px-8 lg:justify-center lg:pb-16">
        <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-cream/75 md:text-xs md:tracking-[0.18em]">UPHEAL · Uncovering pathways, healing every affected life</p>
        <h1 className="mt-4 select-none">
          <span className="block font-serif text-[clamp(44px,8.6vw,128px)] italic leading-[0.95] tracking-tight text-cream">Uphill,</span>
          <span className="block font-display text-[clamp(80px,13.5vw,210px)] font-black uppercase leading-[0.84] text-cream" aria-label="together">
            {WORD.map((c, i) => (
              <span key={i} ref={(n) => { letters.current[i] = n }} aria-hidden className="inline-block transition-[font-variation-settings,transform] duration-300 ease-out" style={{ fontVariationSettings: "'wght' 640" }}>{c}</span>
            ))}
          </span>
        </h1>
        <p className="mt-6 max-w-md text-[17px] leading-relaxed text-cream/80">Research that uncovers new routes to remedy — and case tools for the lawyers who help every affected life recover its dignity.</p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <a href="#reports" onClick={go('reports')} data-cursor="Scroll ↓" className="pill group bg-key text-deep hover:-translate-y-0.5 hover:bg-cream">
            Read today&apos;s reports <span className="transition-transform duration-300 group-hover:translate-x-1 group-hover:translate-y-1">↘</span>
          </a>
          <a href="#cases" onClick={go('cases')} className="pill border border-cream/40 text-cream hover:border-cream hover:bg-cream hover:text-deep">Open the case tracker</a>
        </div>
      </div>

      {/* ---------- corners ---------- */}
      <div className="absolute inset-x-0 bottom-0 z-20 flex items-center justify-between gap-4 px-5 pb-[72px] md:px-8 md:pb-[84px]">
        <div className="flex items-center gap-3">
          <a href="#briefing" onClick={go('briefing')} aria-label="Audio briefing" className="grid h-11 w-11 place-items-center rounded-full bg-cream transition-transform hover:scale-110">
            <span className="flex h-3.5 items-end gap-[3px]">{[6, 12, 8, 14, 5].map((h, i) => <i key={i} className="block w-[2px] bg-deep" style={{ height: h, animation: `pulse ${1 + i * 0.2}s ease-in-out infinite` }} />)}</span>
          </a>
          <a href="#briefing" onClick={go('briefing')} className="hidden rounded-full border border-cream/70 px-5 py-2.5 text-sm text-cream transition-colors hover:bg-cream hover:text-deep sm:block">Listen · {fmtTime(briefing.duration)} briefing</a>
        </div>
        <p className="max-w-[260px] text-right font-mono text-[9.5px] uppercase leading-relaxed tracking-widest text-cream/60 md:max-w-none"><span className="hidden md:inline">Data updated {updated}</span></p>
      </div>
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[rgb(var(--paper))] to-transparent" />
      <Steps n={30} walk className="absolute inset-x-5 bottom-3 overflow-hidden text-cream md:inset-x-8" />
    </section>
  )
}
