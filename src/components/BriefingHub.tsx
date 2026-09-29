import { useMemo, useState } from 'react'
import { Eyebrow } from './Glyph'
import { BRIEFS, CADENCES, Cadence, TAG_ORDER } from '../data/briefingCatalog'
import BriefingPlayer from './BriefingPlayer'
import { rng, useTilt } from '../lib'

function Bars({ seed, n = 34, dim }: { seed: number; n?: number; dim?: boolean }) {
  const h = useMemo(() => { const r = rng(seed); return Array.from({ length: n }, () => 0.2 + r() * 0.8) }, [seed, n])
  return <span aria-hidden className="flex h-9 items-center gap-[2px]">{h.map((v, i) => <i key={i} className={`block flex-1 rounded-full ${dim ? 'bg-ink/15' : 'bg-key/80'}`} style={{ height: `${v * 100}%` }} />)}</span>
}

function Card({ b, on, onPick, i }: { b: (typeof BRIEFS)[number]; on: boolean; onPick: () => void; i: number }) {
  const tilt = useTilt<HTMLButtonElement>(6)
  return (
    <button ref={tilt} onClick={onPick} aria-pressed={on} data-cursor={on ? '' : 'Open'}
      className={`tilt group relative flex h-full flex-col gap-3 overflow-hidden rounded-2xl border p-5 text-left ${on ? 'border-key bg-surface shadow-[0_0_0_1px_rgba(237,176,33,.6),0_40px_70px_-35px_rgba(237,176,33,.4)]' : 'border-line bg-card shadow-[inset_0_1px_0_rgba(255,255,255,.1),0_24px_44px_-28px_rgb(var(--shadow)/.9)] hover:border-ink/40'}`}>
      <i className="tilt-glare" aria-hidden />
      <span className="flex items-center justify-between gap-2">
        <span className={`rounded-full px-2.5 py-1 font-mono text-[9px] uppercase tracking-widest ${b.sample ? 'bg-key text-deep' : 'border border-line text-mute'}`}>{b.sample ? '● Sample recording' : 'Category preview'}</span>
        <span className="font-mono text-[10px] text-mute">{b.length}</span>
      </span>
      <span className="text-[19px] font-medium leading-tight tracking-[-0.015em]">{b.title}</span>
      <span className="line-clamp-2 text-[13.5px] leading-relaxed text-mute">{b.blurb}</span>
      <span className="mt-auto pt-2"><Bars seed={i * 7 + 3} dim={!b.sample} /></span>
      <span className="flex flex-wrap gap-1">{b.tags.slice(0, 3).map((t) => <span key={t} className="rounded-full border border-line px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-ink/70">{t}</span>)}</span>
    </button>
  )
}

export default function BriefingHub() {
  const [cad, setCad] = useState<Cadence>('Daily')
  const [tag, setTag] = useState('All')
  const [sel, setSel] = useState('d-all')

  const ofCad = BRIEFS.filter((b) => b.cadence === cad)
  const list = ofCad.filter((b) => tag === 'All' || b.tags.includes(tag))
  const tags = TAG_ORDER.map((t) => [t, ofCad.filter((b) => b.tags.includes(t)).length] as const).filter(([, n]) => n > 0)
  const cur = list.find((b) => b.id === sel) ?? list[0]

  const pickCad = (c: Cadence) => { setCad(c); setTag('All'); setSel(BRIEFS.find((b) => b.cadence === c)!.id) }
  const pickTag = (t: string) => { setTag(t); const first = ofCad.filter((b) => t === 'All' || b.tags.includes(t))[0]; if (first) setSel(first.id) }

  return (
    <section id="briefing" className="mx-auto max-w-[1440px] scroll-mt-16 px-5 pb-28 md:px-8">
      <div className="reveal grid gap-6 md:grid-cols-2 md:items-end">
        <div>
          <Eyebrow n="07" label="Listen · Briefings" icon="radio" />
          <h2 className="mt-4 font-display text-[clamp(56px,9vw,132px)] font-extrabold uppercase leading-[0.88]">Voices <span className="font-serif text-[1.04em] font-normal normal-case italic tracking-normal">along the path</span></h2>
        </div>
        <p className="max-w-md text-[17px] leading-relaxed text-mute md:justify-self-end">Three rhythms — daily, weekly, monthly — each split by region and legal topic. Only today’s daily has a sample recording; the other corners show the categories you can expect.</p>
      </div>

      <div className="reveal mt-10 grid gap-3 md:grid-cols-3" style={{ ['--d' as string]: '80ms' }}>
        {CADENCES.map((c) => {
          const on = cad === c.id
          return (
            <button key={c.id} onClick={() => pickCad(c.id)} aria-pressed={on} className={`group flex items-center justify-between rounded-2xl border px-6 py-5 text-left transition-all duration-300 ${on ? 'border-key bg-key text-deep shadow-[0_24px_50px_-24px_rgba(237,176,33,.6)]' : 'border-line bg-card hover:-translate-y-0.5 hover:border-ink/40'}`}>
              <span><span className="block font-serif text-[34px] italic leading-none">{c.id}</span><span className={`mt-2 block font-mono text-[10px] uppercase tracking-widest ${on ? 'text-deep/70' : 'text-mute'}`}>{c.sub}</span></span>
              <span className={`grid h-11 w-11 place-items-center rounded-full font-mono text-sm ${on ? 'bg-deep text-key' : 'border border-line'}`}>{BRIEFS.filter((b) => b.cadence === c.id).length}</span>
            </button>
          )
        })}
      </div>

      <div className="reveal mt-5 flex items-center gap-3" style={{ ['--d' as string]: '120ms' }}>
        <span className="hidden w-16 shrink-0 font-mono text-[10px] uppercase tracking-widest text-mute sm:block">Topic</span>
        <div role="tablist" aria-label="Briefing topic" className="flex max-w-full gap-1 overflow-x-auto rounded-full bg-surface p-1">
          {[['All', ofCad.length] as const, ...tags].map(([t, n]) => (
            <button key={t} role="tab" aria-selected={tag === t} onClick={() => pickTag(t)} className={`shrink-0 rounded-full px-4 py-2 text-[13px] transition-colors ${tag === t ? 'bg-fg text-onfg' : 'hover:bg-fg/10'}`}>{t}<sup className="ml-0.5 text-[9px] opacity-70">{n}</sup></button>
          ))}
        </div>
      </div>

      <div key={cad + tag} className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" style={{ animation: 'menuIn .5s cubic-bezier(.2,.7,.2,1) both' }}>
        {list.map((b, i) => <Card key={b.id} b={b} i={i} on={cur?.id === b.id} onPick={() => setSel(b.id)} />)}
      </div>

      <div className="mt-8" aria-live="polite">
        {cur?.sample ? <BriefingPlayer /> : cur && (
          <div className="panel-3d grid gap-8 overflow-hidden rounded-[32px] border border-line bg-deep p-6 md:p-12 lg:grid-cols-[1.2fr_1fr]">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-key">{cur.cadence} · category preview</p>
              <h3 className="mt-3 font-serif text-[clamp(36px,4.6vw,64px)] italic leading-none tracking-tight">{cur.title}</h3>
              <p className="mt-4 max-w-lg text-[17px] leading-relaxed text-white/70">{cur.blurb}</p>
              <div className="mt-5 flex flex-wrap gap-1.5">{cur.tags.map((t) => <span key={t} className="rounded-full border border-white/20 px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-white/75">{t}</span>)}</div>
              <p className="mt-6 font-mono text-[11px] uppercase tracking-widest text-white/50">Planned length {cur.length} · no recording produced yet</p>
            </div>
            <div className="flex flex-col justify-center gap-4 rounded-2xl border border-dashed border-white/20 p-6">
              <Bars seed={99} n={60} dim />
              <div className="flex items-center gap-3"><span className="grid h-14 w-14 place-items-center rounded-full border border-white/25 text-white/40" aria-hidden><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M6 3.5v17l14-8.5z" /></svg></span><p className="text-sm leading-snug text-white/55">This corner shows where the <b className="font-medium text-white/80">{cur.cadence.toLowerCase()} · {cur.title}</b> recording would appear. Select “Today’s conflict briefing” under Daily to hear the sample.</p></div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
