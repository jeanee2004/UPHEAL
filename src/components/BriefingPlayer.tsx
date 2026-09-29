import { useCallback, useEffect, useRef, useState } from 'react'
import { fmtTime, useRafLoop } from '../lib'
import briefing from '../data/briefing.json'

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2]
const BARS = 110
const SRC = '/audio/briefing.m4a'

export default function BriefingPlayer() {
  const audio = useRef<HTMLAudioElement>(null)
  const track = useRef<HTMLDivElement>(null)
  const tx = useRef<HTMLDivElement>(null)
  const [playing, setPlaying] = useState(false)
  const [t, setT] = useState(0)
  const [dur, setDur] = useState(briefing.duration)
  const [speed, setSpeed] = useState(1)
  const [peaks, setPeaks] = useState<number[]>(() => Array.from({ length: BARS }, (_, i) => 0.25 + 0.5 * Math.abs(Math.sin(i * 0.37) * Math.cos(i * 0.11))))
  const [hoverT, setHoverT] = useState<{ x: number; t: number } | null>(null)
  const drag = useRef(false)

  // real waveform from the actual audio file
  useEffect(() => {
    let dead = false
    ;(async () => {
      try {
        const buf = await (await fetch(SRC)).arrayBuffer()
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
        const dec = await ctx.decodeAudioData(buf); ctx.close()
        const ch = dec.getChannelData(0), size = Math.floor(ch.length / BARS)
        const p = Array.from({ length: BARS }, (_, i) => { let m = 0; for (let j = i * size; j < (i + 1) * size; j += 40) m = Math.max(m, Math.abs(ch[j])); return m })
        const mx = Math.max(...p) || 1
        if (!dead) setPeaks(p.map((v) => Math.max(0.06, v / mx)))
      } catch { /* keep placeholder */ }
    })()
    return () => { dead = true }
  }, [])

  useRafLoop(() => { if (audio.current && !drag.current) setT(audio.current.currentTime) }, playing)

  const seek = useCallback((s: number) => {
    const a = audio.current; if (!a) return
    const d = a.duration || dur
    a.currentTime = Math.max(0, Math.min(d - 0.05, s)); setT(a.currentTime)
  }, [dur])
  const toggle = () => { const a = audio.current!; if (a.paused) a.play(); else a.pause() }
  const setRate = (r: number) => { setSpeed(r); if (audio.current) { audio.current.playbackRate = r; audio.current.preservesPitch = true } }

  const ratioAt = (e: React.PointerEvent) => { const r = track.current!.getBoundingClientRect(); return Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)) }
  const onDown = (e: React.PointerEvent) => { drag.current = true; (e.target as HTMLElement).setPointerCapture(e.pointerId); seek(ratioAt(e) * dur) }
  const onMove = (e: React.PointerEvent) => { const r = ratioAt(e); setHoverT({ x: r * 100, t: r * dur }); if (drag.current) seek(r * dur) }
  const onUp = () => { drag.current = false }
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === ' ') { e.preventDefault(); toggle() }
    else if (e.key === 'ArrowRight') seek(t + 5)
    else if (e.key === 'ArrowLeft') seek(t - 5)
  }

  const lineIdx = briefing.lines.findIndex((l) => t >= l.start && t < l.end + 0.45)
  const line = lineIdx >= 0 ? briefing.lines[lineIdx] : undefined
  const chapter = line ? line.chapter : t > 0 ? briefing.chapters.filter((c) => c.start <= t).length - 1 : 0

  useEffect(() => {
    if (!playing || lineIdx < 0 || !tx.current) return
    const el = tx.current.children[lineIdx] as HTMLElement
    tx.current.scrollTo({ top: el.offsetTop - tx.current.clientHeight / 3, behavior: 'smooth' })
  }, [lineIdx, playing])

  const pct = (t / dur) * 100

  return (
    <div className="grain relative overflow-hidden rounded-[32px] border border-line bg-deep panel-3d p-6 text-white md:p-12">
      <div className="pointer-events-none absolute -right-24 -top-24 h-[420px] w-[420px] rounded-full bg-gradient-to-br from-key via-[#777] to-mist opacity-25 blur-3xl" />
      <audio ref={audio} src={SRC} preload="metadata"
        onLoadedMetadata={(e) => setDur(e.currentTarget.duration || briefing.duration)}
        onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onEnded={() => { setPlaying(false); setT(0) }}
        onTimeUpdate={(e) => { if (!playing) setT(e.currentTarget.currentTime) }} />

      <div className="relative grid gap-10 lg:grid-cols-[1.25fr_1fr]">
        <div className="flex flex-col">
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-key">Audio briefing · sample</p>
          <h3 className="mt-3 font-serif text-[clamp(36px,4.6vw,64px)] italic leading-[1] tracking-tight">Today&apos;s conflict briefing</h3>
          <p className="mt-3 max-w-md text-sm text-white/60">Generated with a synthetic voice ({briefing.voice}) from the reports on this page. Drag the waveform, tap a chapter or a sentence to jump.</p>

          {/* waveform scrubber */}
          <div className="mt-8">
            <div className="relative mb-2 h-5 font-mono text-[10px] uppercase tracking-widest text-white/40">
              {briefing.chapters.map((c) => (
                <button key={c.title} onClick={() => seek(c.start)} style={{ left: `${(c.start / dur) * 100}%` }} className="absolute -my-2.5 whitespace-nowrap border-l border-white/25 py-2.5 pl-1.5 text-left transition-colors hover:text-white">{c.title}</button>
              ))}
            </div>
            <div ref={track} tabIndex={0} role="slider" aria-label="Seek" aria-valuemin={0} aria-valuemax={Math.round(dur)} aria-valuenow={Math.round(t)} aria-valuetext={`${fmtTime(t)} of ${fmtTime(dur)}`}
              onKeyDown={onKey} onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerLeave={() => setHoverT(null)} data-cursor="Drag"
              className="relative flex h-24 cursor-pointer touch-none select-none items-center gap-[2px] outline-none focus-visible:ring-2 focus-visible:ring-[#EDB021]">
              {peaks.map((p, i) => {
                const played = (i / BARS) * 100 < pct
                return <i key={i} className="block flex-1 rounded-full transition-colors duration-150" style={{ height: `${Math.max(6, p * 100)}%`, background: played ? '#EDB021' : 'rgba(255,255,255,.22)' }} />
              })}
              <div className="pointer-events-none absolute inset-y-0 w-px bg-surface" style={{ left: `${pct}%` }}><span className="absolute -left-[5px] -top-1 h-[11px] w-[11px] rounded-full bg-surface shadow" /></div>
              {hoverT && <div className="pointer-events-none absolute -top-7 -translate-x-1/2 rounded bg-white px-2 py-0.5 font-mono text-[10px] text-deep" style={{ left: `${hoverT.x}%` }}>{fmtTime(hoverT.t)}</div>}
            </div>
            <div className="mt-2 flex justify-between font-mono text-xs text-white/60"><span>{fmtTime(t)}</span><span>−{fmtTime(dur - t)}</span></div>
          </div>

          {/* transport */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button onClick={() => seek(t - 10)} aria-label="Back 10 seconds" className="grid h-12 w-12 place-items-center rounded-full border border-white/25 font-mono text-[11px] transition hover:bg-white hover:text-deep">−10</button>
            <button onClick={toggle} aria-label={playing ? 'Pause' : 'Play'} data-cursor={playing ? 'Pause' : 'Play'} className="grid h-16 w-16 place-items-center rounded-full bg-white text-deep transition-transform hover:scale-105">
              {playing
                ? <span className="flex gap-1.5"><i className="block h-5 w-1.5 rounded-sm bg-deep" /><i className="block h-5 w-1.5 rounded-sm bg-deep" /></span>
                : <svg width="22" height="22" viewBox="0 0 24 24" className="ml-1"><path d="M6 3.5v17l14-8.5z" fill="currentColor" /></svg>}
            </button>
            <button onClick={() => seek(t + 10)} aria-label="Forward 10 seconds" className="grid h-12 w-12 place-items-center rounded-full border border-white/25 font-mono text-[11px] transition hover:bg-white hover:text-deep">+10</button>
            <div className="ml-auto flex items-center gap-1 overflow-x-auto rounded-full border border-white/20 p-1" role="group" aria-label="Playback speed">
              {SPEEDS.map((s) => (
                <button key={s} onClick={() => setRate(s)} aria-pressed={speed === s} className={`rounded-full px-2.5 py-1.5 max-md:py-2.5 font-mono text-[11px] transition-colors ${speed === s ? 'bg-key text-deep' : 'text-white/70 hover:text-white'}`}>{s}×</button>
              ))}
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {briefing.chapters.map((c, i) => (
              <button key={c.title} onClick={() => { seek(c.start); audio.current?.play() }} className={`rounded-full border px-4 py-2 text-[13px] transition-colors ${chapter === i ? 'border-key bg-key text-deep' : 'border-white/20 text-white/80 hover:border-white'}`}>
                <span className="mr-2 font-mono text-[10px] opacity-60">{fmtTime(c.start)}</span>{c.title}
              </button>
            ))}
          </div>
        </div>

        {/* transcript */}
        <div>
          <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.14em] text-white/50">Transcript</p>
          <div ref={tx} className="relative h-[420px] space-y-1 overflow-y-auto pr-2 [mask-image:linear-gradient(180deg,transparent,#000_8%,#000_92%,transparent)] lg:h-[500px]">
            {briefing.lines.map((l, i) => (
              <button key={i} onClick={() => { seek(l.start); audio.current?.play() }} className={`block w-full rounded-xl px-3 py-2 text-left text-[17px] leading-snug transition-all duration-300 ${i === lineIdx ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/80'}`}>
                {l.text}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
