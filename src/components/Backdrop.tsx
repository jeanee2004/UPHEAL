import { useEffect, useRef } from 'react'

/**
 * Page atmosphere (fixed, behind everything).
 *  light theme → pale glass water with a single drop of black ink slowly unfolding (SVG turbulence-displaced gradients)
 *  dark theme  → the previous neutral glows
 *  bg=plain    → flat colour only
 */
export default function Backdrop() {
  const root = useRef<HTMLDivElement>(null)
  useEffect(() => {
    let raf = 0
    const on = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => root.current?.style.setProperty('--sy', String(scrollY))) }
    on(); addEventListener('scroll', on, { passive: true })
    return () => { removeEventListener('scroll', on); cancelAnimationFrame(raf) }
  }, [])

  const plume = (seed: string, stops: string): React.CSSProperties => ({ filter: `url(#${seed})`, background: stops })
  return (
    <div ref={root} aria-hidden className="grain pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <svg width="0" height="0" className="absolute">
        <defs>
          {[['ink-a', 12, '0.006 0.011', 200], ['ink-b', 31, '0.009 0.016', 150]].map(([id, seed, freq, scale]) => (
            <filter key={id as string} id={id as string} x="-40%" y="-40%" width="180%" height="180%">
              <feTurbulence type="fractalNoise" baseFrequency={freq as string} numOctaves="3" seed={seed as number} result="t" />
              <feDisplacementMap in="SourceGraphic" in2="t" scale={scale as number} xChannelSelector="R" yChannelSelector="G" result="d" />
              <feGaussianBlur in="d" stdDeviation="8" />
            </filter>
          ))}
        </defs>
      </svg>

      {/* water: pale gradient + caustic light */}
      <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgb(var(--bd-top)), rgb(var(--paper)) 45%, rgb(var(--bd-bot)))' }} />
      <div className="bd-water absolute inset-0 bg-[radial-gradient(900px_520px_at_18%_8%,rgba(255,255,255,.95),transparent_62%),radial-gradient(760px_640px_at_88%_58%,rgba(255,255,255,.7),transparent_66%),radial-gradient(700px_420px_at_40%_100%,rgba(255,255,255,.55),transparent_70%)]" />

      {/* one drop of ink — parallax wrapper keeps the drift animation separate from the scroll movement */}
      <div className="absolute inset-0" style={{ transform: 'translate3d(0, calc(var(--sy, 0) * -0.11px), 0)' }}>
        <div className="bd-ink" style={{ right: '-6%', top: '-8%', width: 820, height: 820, opacity: 0.4, ...plume('ink-a', 'radial-gradient(circle at 44% 46%, rgb(6 6 8 / .92) 0%, rgb(6 6 8 / .6) 20%, rgb(6 6 8 / .2) 42%, transparent 66%)') }} />
        <div className="bd-ink" style={{ left: '-10%', top: '62vh', width: 560, height: 560, opacity: 0.2, animationDuration: '68s', animationDirection: 'alternate-reverse', ...plume('ink-b', 'radial-gradient(circle at 50% 50%, rgb(6 6 8 / .85) 0%, rgb(6 6 8 / .45) 26%, rgb(6 6 8 / .12) 48%, transparent 68%)') }} />
        <div className="bd-ink" style={{ right: '14%', top: '150vh', width: 420, height: 420, opacity: 0.14, animationDuration: '80s', ...plume('ink-a', 'radial-gradient(circle at 50% 50%, rgb(6 6 8 / .8) 0%, rgb(6 6 8 / .4) 28%, transparent 64%)') }} />
      </div>

      {/* dark theme: neutral glows */}
      <div className="bd-dark absolute inset-0 bg-[radial-gradient(1300px_760px_at_10%_-5%,rgba(255,255,255,.065),transparent_62%),radial-gradient(900px_620px_at_100%_38%,rgba(237,176,33,.075),transparent_62%),radial-gradient(1100px_760px_at_15%_95%,rgba(255,255,255,.04),transparent_66%)]" />
      <div className="bd-dark absolute -left-40 top-[30vh] h-[520px] w-[520px] rounded-full bg-white/[0.05] blur-[110px] [animation:float_22s_ease-in-out_infinite]" />
      <div className="bd-dark absolute -right-32 top-[65vh] h-[440px] w-[440px] rounded-full bg-key/10 blur-[120px] [animation:float_28s_ease-in-out_infinite_reverse]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_45%,transparent_58%,rgb(var(--shadow)/.10))]" />
    </div>
  )
}
