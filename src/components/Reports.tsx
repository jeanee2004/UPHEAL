import { useMemo, useState } from 'react'
import { Eyebrow } from './Glyph'
import ArticleCard, { WarpFilter } from './ArticleCard'
import SelectedReports, { Selected } from './SelectedReports'
import { Article, burst, useStored } from '../lib'
import Freshness from './Freshness'
import news from '../data/articles.json'

const Pill = ({ on, children, onClick }: { on: boolean; children: React.ReactNode; onClick: (e: React.MouseEvent) => void }) => (
  <button role="tab" aria-selected={on} onClick={onClick} className={`shrink-0 rounded-full px-4 py-2 text-[13px] transition-colors duration-300 ${on ? 'bg-fg text-onfg' : 'hover:bg-ink/5'}`}>{children}</button>
)

export default function Reports({ articles }: { articles: Article[] }) {
  const [saved, setSaved] = useStored<Selected[]>('upheal.selected.v1', () => [])
  const [region, setRegion] = useState('All')
  const [topic, setTopic] = useState('All')

  const regions = useMemo(() => {
    const m = new Map<string, number>(); articles.forEach((a) => m.set(a.region, (m.get(a.region) || 0) + 1))
    return [['All', articles.length] as const, ...[...m.entries()].sort((a, b) => b[1] - a[1])]
  }, [articles])
  const topics = useMemo(() => {
    const m = new Map<string, number>(); articles.forEach((a) => a.topics.forEach((t) => m.set(t, (m.get(t) || 0) + 1)))
    return [['All', articles.length] as const, ...[...m.entries()].sort((a, b) => b[1] - a[1])]
  }, [articles])
  const list = articles.filter((a) => (region === 'All' || a.region === region) && (topic === 'All' || a.topics.includes(topic)))
  const has = (u: string) => saved.some((s) => s.url === u)
  const toggle = (a: Article) => setSaved((p) => (p.some((s) => s.url === a.url) ? p.filter((s) => s.url !== a.url) : [{ ...a, note: '' }, ...p]))
  const stat = (t: string) => articles.filter((a) => a.topics.includes(t)).length
  const sources = new Set(articles.map((a) => a.source)).size

  return (
    <section id="reports" className="relative mx-auto max-w-[1440px] scroll-mt-16 px-5 pb-28 pt-24 md:px-8 md:pt-32">
      <WarpFilter />
      <div className="reveal grid gap-6 md:grid-cols-2 md:items-end">
        <div>
          <Eyebrow n="01" label="Uncover · Reports" icon="lantern" />
          <h2 className="mt-4 text-[clamp(44px,7vw,104px)] font-medium leading-[0.95] tracking-[-0.045em]">
            Uncovering <span className="font-serif font-normal italic tracking-tight">pathways</span>
          </h2>
        </div>
        <div className="md:justify-self-end"><p className="max-w-md text-[17px] leading-relaxed text-mute">
          Research that finds the route to a remedy. Build a shortlist for your matter: press <b className="font-medium text-ink">Select</b> on any report below, add a note, then copy ready-made citations. Every card opens the original article.</p><Freshness iso={news.fetched} className="mt-4" /></div>
      </div>

      <SelectedReports items={saved} onRemove={(u) => setSaved((p) => p.filter((s) => s.url !== u))} onNote={(u, n) => setSaved((p) => p.map((s) => (s.url === u ? { ...s, note: n } : s)))} />

      {/* at a glance */}
      <div className="reveal mt-16 grid grid-cols-2 border-y border-ink/80 md:grid-cols-4">
        {[['Latest reports', articles.length], ['Publishers', sources], ['Displacement', stat('Displacement')], ['Accountability', stat('Accountability')]].map(([k, v], i) => (
          <div key={k as string} className={`px-2 py-5 md:px-6 ${i ? 'md:border-l md:border-line' : ''} ${i === 2 ? 'max-md:border-t max-md:border-line' : ''} ${i === 3 ? 'max-md:border-l max-md:border-t max-md:border-line' : ''} ${i === 1 ? 'max-md:border-l max-md:border-line' : ''}`}>
            <p className="font-serif text-[52px] italic leading-none tracking-tight">{v}</p>
            <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.14em] text-mute">{k}</p>
          </div>
        ))}
      </div>

      <div className="reveal mt-8 space-y-3">
        <div className="flex items-center gap-3">
          <span className="hidden w-16 shrink-0 font-mono text-[10px] uppercase tracking-widest text-mute sm:block">Region</span>
          <div role="tablist" aria-label="Region" className="flex max-w-full gap-1 overflow-x-auto rounded-full bg-surface p-1 shadow-sm">
            {regions.map(([r, n]) => <Pill key={r} on={region === r} onClick={(e) => { setRegion(r); burst(e.clientX, e.clientY) }}>{r}<sup className="ml-0.5 text-[9px] opacity-70">{n}</sup></Pill>)}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden w-16 shrink-0 font-mono text-[10px] uppercase tracking-widest text-mute sm:block">Topic</span>
          <div role="tablist" aria-label="Topic" className="flex max-w-full gap-1 overflow-x-auto rounded-full bg-surface p-1 shadow-sm">
            {topics.map(([t, n]) => <Pill key={t} on={topic === t} onClick={() => setTopic(t)}>{t}<sup className="ml-0.5 text-[9px] opacity-70">{n}</sup></Pill>)}
          </div>
        </div>
        <p className="font-mono text-[10px] uppercase tracking-widest text-mute">Topics are auto-tagged from headlines by keyword — verify in the source.</p>
      </div>

      <div key={region + topic} className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((a, i) => <ArticleCard key={a.url} a={a} i={i} saved={has(a.url)} onToggle={() => toggle(a)} />)}
        {list.length === 0 && <p className="col-span-full rounded-3xl border border-dashed border-ink/20 px-6 py-16 text-center text-mute">No reports match this combination.</p>}
      </div>
    </section>
  )
}
