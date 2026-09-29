import { useState } from 'react'
import { Article, cite, fmtDate } from '../lib'
import TopicChips from './TopicChips'

export type Selected = Article & { note: string }

const example: Selected = {
  source: 'Example Wire', title: 'Shelling reported near civilian shelters in Kharkiv oblast, local officials say',
  excerpt: 'This is placeholder content showing how a selected report will look once you bookmark one below.',
  url: '', image: '', date: new Date().toISOString().slice(0, 10), region: 'Europe', topics: ['Civilian harm', 'Accountability'],
  note: 'Matter A — corroborates risk on return; cite alongside the UNHCR position paper (para. 14).',
}

export default function SelectedReports({ items, onRemove, onNote }: { items: Selected[]; onRemove: (url: string) => void; onNote: (url: string, n: string) => void }) {
  const [copied, setCopied] = useState(false)
  const demo = items.length === 0
  const rows = demo ? [example] : items
  const text = () => items.map((a, i) => `${i + 1}. ${cite(a)}${a.note ? `\n   Note: ${a.note}` : ''}`).join('\n')
  const copy = () => { navigator.clipboard?.writeText(text()); setCopied(true); setTimeout(() => setCopied(false), 1500) }
  const download = () => {
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([`# Selected reports\n\n${items.map((r) => `- ${cite(r)}${r.note ? `  \n  _Note: ${r.note}_` : ''}`).join('\n')}\n`], { type: 'text/markdown' }))
    a.download = 'upheal-selected-reports.md'; a.click(); URL.revokeObjectURL(a.href)
  }

  return (
    <div className="reveal mt-12 rounded-3xl border border-line bg-fg/5 p-4 md:p-6" style={{ ['--d' as string]: '80ms' }}>
      <div className="flex flex-wrap items-center justify-between gap-3 px-2 pb-4">
        <div className="flex items-center gap-3">
          <h3 className="text-[22px] font-medium tracking-[-0.02em]">Your selection</h3>
          <span className="rounded-full bg-fg px-2.5 py-0.5 font-mono text-[10px] text-onfg">{items.length}</span>
        </div>
        <div className="flex gap-2">
          <button onClick={copy} disabled={demo} className="pill border border-ink/20 px-4 py-2 text-[12px] hover:bg-fg hover:text-onfg disabled:opacity-40">{copied ? 'Copied ✓' : 'Copy citations'}</button>
          <button onClick={download} disabled={demo} className="pill border border-ink/20 px-4 py-2 text-[12px] hover:bg-fg hover:text-onfg disabled:opacity-40">Download .md ↓</button>
        </div>
      </div>

      <ul className="space-y-2">
        {rows.map((a) => (
          <li key={a.url || 'example'} className={`grid gap-4 rounded-2xl border p-3 sm:grid-cols-[112px_1fr] md:p-4 ${demo ? 'border-dashed border-ink/25 bg-card/60' : 'border-line bg-card'}`}>
            <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-gradient-to-br from-sand to-mist sm:aspect-square">
              {a.image ? <img src={a.image} alt="" referrerPolicy="no-referrer" className="absolute inset-0 h-full w-full object-cover" /> : <span className="absolute inset-0 grid place-items-center font-serif text-4xl italic text-ink/50">“</span>}
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[10px] uppercase tracking-[0.12em] text-mute">
                {demo && <span className="rounded-full bg-amber/20 px-2 py-0.5 text-keydeep">Example</span>}
                <span className="text-ink">{a.source}</span><span>{fmtDate(a.date)}</span><span>{a.region}</span>
              </div>
              <h4 className="mt-1.5 text-[18px] font-medium leading-snug tracking-[-0.015em]">
                {a.url ? <a href={a.url} target="_blank" rel="noopener noreferrer" className="hover:underline">{a.title}</a> : a.title}
              </h4>
              <TopicChips topics={a.topics} className="mt-2" />
              <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-start">
                <label className="sr-only" htmlFor={`n-${a.url}`}>Note</label>
                <textarea id={`n-${a.url}`} rows={2} value={a.note} readOnly={demo} placeholder="Why does this matter to your matter? (e.g. matter, paragraph, purpose)"
                  onChange={(e) => onNote(a.url, e.target.value)} className="w-full resize-none rounded-xl border border-line bg-surface px-3 py-2 text-[14px] outline-none focus:border-ink" />
                {!demo && <button onClick={() => onRemove(a.url)} className="pill shrink-0 px-3 py-2 text-[12px] text-mute hover:text-rust">Remove</button>}
              </div>
            </div>
          </li>
        ))}
      </ul>
      {demo && <p className="mt-3 px-2 font-mono text-[10px] uppercase tracking-widest text-mute">Nothing selected yet — press “Select” on any report below. This example shows how your shortlist will appear.</p>}
    </div>
  )
}
