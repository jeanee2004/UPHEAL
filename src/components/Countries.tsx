import { useMemo, useState } from 'react'
import { Eyebrow } from './Glyph'
import data from '../data/countries.json'
import news from '../data/articles.json'
import dsp from '../data/displacement.json'
import Freshness from './Freshness'
import { burst, fmtDate, useStored } from '../lib'
import { CASES_KEY, CaseStore, casesInit, toggleFile } from '../data/caseModel'
import TopicChips from './TopicChips'

type Country = (typeof data.countries)[number]
const TIERS = ['All', 'Active conflict', 'Elevated risk'] as const
const fmt = new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 })
type Dsp = { year: number | null; refugees?: number; asylumSeekers?: number; idps?: number; topHosts?: { name: string; refugees: number }[]; note?: string }
const CONTINENTS = ['All', ...Array.from(new Set(data.countries.map((c) => c.continent)))]

const Pills = ({ label, items, value, set, count }: { label: string; items: readonly string[]; value: string; set: (v: string) => void; count: (v: string) => number }) => (
  <div className="flex items-center gap-3">
    <span className="hidden w-20 shrink-0 font-mono text-[10px] uppercase tracking-widest text-mute sm:block">{label}</span>
    <div role="tablist" aria-label={label} className="flex max-w-full gap-1 overflow-x-auto rounded-full bg-surface p-1 shadow-sm">
      {items.map((t) => (
        <button key={t} role="tab" aria-selected={value === t} onClick={(e) => burst(e.clientX, e.clientY, () => set(t))} className={`shrink-0 rounded-full px-4 py-2 text-[13px] transition-colors ${value === t ? 'bg-fg text-onfg' : 'hover:bg-ink/5'}`}>
          {t}<sup className="ml-0.5 text-[9px] opacity-70">{count(t)}</sup>
        </button>
      ))}
    </div>
  </div>
)

export default function Countries() {
  const [store, setStore] = useStored<CaseStore>(CASES_KEY, casesInit)
  const [activeId, setActive] = useStored<string>('upheal.activeCase', () => '')
  const folder = store.cases.find((c) => c.id === activeId) ?? store.cases[0]
  const [tier, setTier] = useState<string>('All')
  const [cont, setCont] = useState<string>('All')
  const match = (c: Country, t = tier, k = cont) => (t === 'All' || c.tier === t) && (k === 'All' || c.continent === k)
  const list = useMemo(
    () => data.countries.filter((c) => match(c)).sort((a, b) => (a.tier === b.tier ? b.last7 - a.last7 : a.tier === 'Active conflict' ? -1 : 1)),
    [tier, cont], // eslint-disable-line react-hooks/exhaustive-deps
  )
  const [sel, setSel] = useState('')
  const cur: Country | undefined = list.find((c) => c.name === sel) ?? list[0]
  const max = Math.max(...data.countries.map((c) => c.last7), 1)
  const photo = (c: Country) => {
    const same = news.articles.filter((a) => a.region === c.continent), pool = same.length ? same : news.articles
    return pool[data.countries.filter((x) => x.continent === c.continent).findIndex((x) => x.name === c.name) % pool.length]?.image
  }
  const dot = (t: string) => (t === 'Active conflict' ? 'bg-rust' : 'bg-amber')

  return (
    <section id="countries" className="mx-auto max-w-[1440px] scroll-mt-16 px-5 pb-28 md:px-8">
      <div className="reveal grid gap-6 md:grid-cols-2 md:items-end">
        <div>
          <Eyebrow n="02" label="Uphill · Watchlist" icon="boat" />
          <h2 className="mt-4 font-display text-[clamp(56px,9vw,132px)] font-extrabold uppercase leading-[0.88]">
            The climb, <span className="font-serif text-[1.04em] font-normal normal-case italic tracking-normal">country by country</span>
          </h2>
        </div>
        <div className="md:justify-self-end"><p className="max-w-md text-[17px] leading-relaxed text-mute">
          Every route starts somewhere. These are the countries where war or mass displacement is under way — or could spread. Filter by continent and risk tier; each country shows UNHCR displacement figures, its dominant legal topics and the last 10 days of headlines.</p><Freshness iso={data.fetched} label="News updated" className="mt-4" /></div>
      </div>

      <div className="reveal mt-10 space-y-3" style={{ ['--d' as string]: '100ms' }}>
        <Pills label="Continent" items={CONTINENTS} value={cont} set={setCont} count={(v) => data.countries.filter((c) => match(c, tier, v)).length} />
        <Pills label="Risk tier" items={TIERS} value={tier} set={setTier} count={(v) => data.countries.filter((c) => match(c, v, cont)).length} />
        <p className="flex flex-wrap items-center gap-x-5 gap-y-1 font-mono text-[10px] uppercase tracking-widest text-mute">
          <span className="flex items-center gap-1.5"><i className="block h-2 w-2 rounded-full bg-rust" />Active conflict</span>
          <span className="flex items-center gap-1.5"><i className="block h-2 w-2 rounded-full bg-amber" />Elevated risk</span>
          <span>Tiers are editorial · bar = stories in last 7 days</span>
        </p>
      </div>

      {!cur ? (
        <p className="mt-8 rounded-3xl border border-dashed border-ink/20 px-6 py-16 text-center text-mute">No countries match this combination.</p>
      ) : (
        <div className="reveal mt-8 grid gap-5 lg:grid-cols-[minmax(320px,0.8fr)_1.6fr]" style={{ ['--d' as string]: '160ms' }}>
          <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:block lg:space-y-1 lg:rounded-3xl lg:border lg:border-line lg:bg-card lg:p-2">
            {list.map((c) => {
              const on = c.name === cur.name
              return (
                <li key={c.name}>
                  <button onClick={() => setSel(c.name)} aria-pressed={on} data-cursor={on ? '' : 'Open'}
                    className={`group flex w-full items-center gap-3 overflow-hidden rounded-2xl border px-3 py-3 text-left transition-all duration-300 lg:border-transparent lg:px-4 ${on ? 'border-key bg-key text-deep' : 'border-line bg-card hover:bg-surface lg:bg-transparent'}`}>
                    <span className="text-2xl leading-none">{c.flag}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[16px] font-medium tracking-[-0.01em]">{c.name}</span>
                      <span className={`mt-0.5 flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-widest ${on ? 'text-deep/70' : 'text-mute'}`}><i className={`block h-1.5 w-1.5 rounded-full ${dot(c.tier)}`} />{c.continent}</span>
                    </span>
                    <span className="hidden w-14 sm:block lg:w-16">
                      <span className={`block h-1 rounded-full ${on ? 'bg-deep/20' : 'bg-ink/10'}`}><i className={`block h-full rounded-full ${on ? 'bg-deep' : 'bg-key'}`} style={{ width: `${(c.last7 / max) * 100}%` }} /></span>
                      <span className={`mt-1 block text-right font-mono text-[10px] ${on ? 'text-deep/70' : 'text-mute'}`}>{c.last7}</span>
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>

          <div key={cur.name} className="rounded-3xl border border-line bg-card p-6 md:p-9 panel-3d" style={{ animation: 'menuIn .6s cubic-bezier(.2,.7,.2,1) both' }}>
            <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[320px]">
              <img src={photo(cur)} alt="" referrerPolicy="no-referrer" className="h-full w-full object-cover opacity-50 grayscale contrast-110" />
              <div className="absolute inset-0 bg-gradient-to-b from-card/20 via-card/75 to-card" />
            </div>
            <div className="relative flex flex-wrap items-end justify-between gap-4 border-b border-ink/60 pb-5 pt-16">
              <div className="flex items-center gap-4">
                <span className="text-5xl leading-none md:text-6xl">{cur.flag}</span>
                <div>
                  <h3 className="font-serif text-[clamp(40px,5vw,72px)] italic leading-none tracking-tight">{cur.name}</h3>
                  <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] uppercase tracking-[0.12em] text-mute">
                    <span className="flex items-center gap-1.5 text-ink"><i className={`block h-2 w-2 rounded-full ${dot(cur.tier)}`} />{cur.tier}</span>
                    <span>{cur.continent}</span><span>{cur.last7} stories this week</span>
                  </p>
                </div>
              </div>
              <label className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-mute">File into<select aria-label="Folder to file into" className="border border-line bg-surface px-2 py-2 text-[13px] normal-case tracking-normal text-ink" value={folder?.id ?? ''} onChange={(e) => setActive(e.target.value)}>{store.cases.length === 0 && <option value="">—</option>}{store.cases.map((c) => <option key={c.id} value={c.id}>{c.alias}{c.region ? ` · ${c.region}` : ''}</option>)}</select></label>
              <a href={`https://news.google.com/search?q=${encodeURIComponent(cur.name + ' war refugees')}`} target="_blank" rel="noopener noreferrer" className="pill border border-ink/20 text-[13px] hover:bg-fg hover:text-onfg">More on {cur.name} ↗</a>
            </div>
            <div className="relative flex flex-wrap items-center gap-3 border-b border-line py-4">
              <span className="font-mono text-[10px] uppercase tracking-widest text-mute">Dominant topics</span>
              <TopicChips topics={cur.topTopics} />
            </div>
            {(() => {
              const d = (dsp.items as Record<string, Dsp>)[cur.name]
              if (!d?.year) return <p className="relative border-b border-line py-4 font-mono text-[10px] uppercase tracking-widest text-mute">UNHCR displacement figures: n/a{d?.note ? ` — ${d.note}` : ''}</p>
              return (
                <div className="relative border-b border-line py-5">
                  <div className="grid gap-3 sm:grid-cols-3">
                    {([['Refugees from ' + cur.name, d.refugees], ['Asylum-seekers', d.asylumSeekers], ['Internally displaced', d.idps]] as [string, number | undefined][]).map(([k, v]) => (
                      <div key={k} className="rounded-xl border border-line bg-paper/50 px-4 py-3"><p className="font-serif text-[38px] italic leading-none tracking-tight">{v ? fmt.format(v) : '—'}</p><p className="mt-1.5 font-mono text-[10px] uppercase tracking-widest text-mute">{k}</p></div>
                    ))}
                  </div>
                  {!!d.topHosts?.length && <p className="mt-3 text-[13.5px] text-mute"><span className="font-mono text-[10px] uppercase tracking-widest text-keydeep">Top host countries </span> {d.topHosts.map((h) => `${h.name} ${fmt.format(h.refugees)}`).join(' · ')}</p>}
                  <p className="mt-2 font-mono text-[10px] uppercase tracking-widest text-mute">Source: UNHCR Refugee Data Finder · {d.year} · as reported to UNHCR, not real-time{d.note ? ` · ${d.note}` : ''}</p>
                </div>
              )
            })()}
            <ul className="relative">
              {cur.articles.map((a) => (
                <li key={a.url} className="flex items-start gap-3 border-b border-line last:border-0">
                  <a href={a.url} target="_blank" rel="noopener noreferrer" data-cursor="Read ↗" className="group -mx-3 min-w-0 flex-1 grid grid-cols-[1fr_auto] items-start gap-4 rounded-2xl px-3 py-5 transition-colors duration-300 hover:bg-surface">
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-mute"><span className="text-ink">{a.source}</span> · {fmtDate(a.date)}</p>
                      <h4 className="mt-2 text-[19px] font-medium leading-snug tracking-[-0.015em] md:text-[21px]">{a.title}</h4>
                      <TopicChips topics={a.topics} className="mt-3" />
                    </div>
                    <span className="mt-1 text-xl transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1">↗</span>
                  </a>
                  {(() => { const filed = !!folder?.files?.some((f) => f.url === a.url); return (
                    <button disabled={!folder} onClick={() => folder && setStore((s) => toggleFile(s, folder.id, { source: a.source, title: a.title, excerpt: '', url: a.url, image: '', date: a.date, region: cur.continent, topics: a.topics }))} aria-pressed={filed} title={folder ? `File in ${folder.alias}` : 'Create a person folder in Reports first'}
                      className={`pill mt-5 shrink-0 px-3 py-2 text-[10.5px] ${filed ? 'bg-key text-deep' : 'border border-ink/30 hover:bg-fg hover:text-onfg'} disabled:opacity-40`}>{filed ? '✓ Filed' : '+ File'}</button>) })()}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </section>
  )
}
