import { useMemo, useState } from 'react'
import { Eyebrow } from './Glyph'
import { useStored } from '../lib'

type Hearing = { id: string; date: string; time: string; matter: string; court: string; type: string; note: string; sample?: boolean }
const TYPES = ['Hearing', 'Filing deadline', 'Appeal', 'Mention', 'Judgment']
const FILTERS = ['Upcoming', 'Past', 'All'] as const

const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
const plus = (n: number) => { const d = new Date(); d.setDate(d.getDate() + n); return iso(d) }
const days = (date: string) => Math.round((new Date(date + 'T00:00:00').getTime() - new Date(iso(new Date()) + 'T00:00:00').getTime()) / 86400000)

const seed = (): Hearing[] => [
  { id: 's1', date: plus(4), time: '10:00', matter: 'Matter A — emergency stay of removal', court: 'Administrative High Court', type: 'Hearing', note: 'Bring certified translations of Exhibits 1–3.', sample: true },
  { id: 's2', date: plus(9), time: '14:30', matter: 'Matter B — asylum denial review', court: 'Administrative Court, Panel 3', type: 'Hearing', note: 'Witness statement due 48h before.', sample: true },
  { id: 's3', date: plus(13), time: '11:00', matter: 'Matter C — appeal on habeas review', court: 'Supreme Court, Division 2', type: 'Appeal', note: '', sample: true },
  { id: 's4', date: plus(-6), time: '09:30', matter: 'Matter A — filing of petition', court: 'Administrative High Court', type: 'Filing deadline', note: 'Filed.', sample: true },
]

const ics = (hs: Hearing[]) => {
  const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '')
  const ev = hs.map((h) => {
    const d = h.date.replace(/-/g, '') + 'T' + h.time.replace(':', '') + '00'
    const esc = (t: string) => t.replace(/([,;\\])/g, '\\$1').replace(/\n/g, '\\n')
    return ['BEGIN:VEVENT', `UID:${h.id}@upheal`, `DTSTAMP:${stamp}`, `DTSTART:${d}`, `SUMMARY:${esc(`${h.type}: ${h.matter}`)}`, `LOCATION:${esc(h.court)}`, `DESCRIPTION:${esc(h.note)}`, 'END:VEVENT'].join('\r\n')
  })
  return ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//UPHEAL//Hearings//EN', ...ev, 'END:VCALENDAR'].join('\r\n')
}

const field = 'w-full rounded-xl border border-line bg-surface px-4 py-3 text-[15px] outline-none transition focus:border-ink'

export default function Hearings() {
  const [items, setItems] = useStored<Hearing[]>('upheal.hearings.v1', seed)
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('Upcoming')
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ matter: '', court: '', type: TYPES[0], date: plus(7), time: '10:00', note: '' })

  const sorted = useMemo(() => [...items].sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time)), [items])
  const shown = sorted.filter((h) => (filter === 'All' ? true : filter === 'Upcoming' ? days(h.date) >= 0 : days(h.date) < 0))
  const list = filter === 'Past' ? [...shown].reverse() : shown
  const next = sorted.find((h) => days(h.date) >= 0)
  const anySample = items.some((h) => h.sample)

  const add = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.matter.trim()) return
    setItems((p) => [...p, { ...form, matter: form.matter.trim(), court: form.court.trim(), id: crypto.randomUUID() }])
    setForm({ ...form, matter: '', note: '' }); setOpen(false); setFilter('Upcoming')
  }
  const download = () => {
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([ics(sorted)], { type: 'text/calendar' }))
    a.download = 'upheal-hearings.ics'; a.click(); URL.revokeObjectURL(a.href)
  }
  const chip = (d: number) => d === 0 ? ['Today', 'bg-key text-deep'] : d > 0 && d <= 7 ? [`In ${d} day${d > 1 ? 's' : ''}`, 'bg-key/25 text-keydeep'] : d > 0 ? [`In ${d} days`, 'bg-ink/5 text-ink'] : [`${-d} day${d < -1 ? 's' : ''} ago`, 'bg-ink/5 text-mute']

  return (
    <section id="hearings" className="mx-auto max-w-[1440px] scroll-mt-16 px-5 pb-28 md:px-8">
      <div className="reveal grid gap-6 md:grid-cols-2 md:items-end">
        <div>
          <Eyebrow n="03" label="Step by step · Court calendar" icon="scales" />
          <h2 className="mt-4 text-[clamp(44px,7vw,104px)] font-medium leading-[0.95] tracking-[-0.045em]">One hearing, <span className="font-serif font-normal italic tracking-tight">one step up</span></h2>
        </div>
        <p className="max-w-md text-[17px] leading-relaxed text-mute md:justify-self-end">Track hearings, filing deadlines and appeals in one place. Entries are stored only in this browser; export them to any calendar app as an .ics file.</p>
      </div>

      <div className="reveal mt-12 grid gap-5 lg:grid-cols-[minmax(300px,0.7fr)_1.6fr]" style={{ ['--d' as string]: '100ms' }}>
        {/* next hearing */}
        <div className="grain relative flex min-h-[280px] flex-col justify-between overflow-hidden rounded-3xl bg-gradient-to-br from-[#f8cb52] via-[#EDB021] to-[#c98a10] p-7 text-deep shadow-[0_40px_70px_-35px_rgba(237,176,33,.55)] md:p-9">
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-deep/70">Next up</p>
          {next ? (
            <div>
              <p className="font-serif text-[clamp(84px,11vw,150px)] italic leading-[0.85] tracking-tight">{days(next.date) === 0 ? 'Today' : days(next.date)}</p>
              {days(next.date) > 0 && <p className="mt-1 font-mono text-xs uppercase tracking-widest text-deep/70">day{days(next.date) > 1 ? 's' : ''} to go</p>}
              <p className="mt-5 text-xl font-medium leading-tight tracking-[-0.015em]">{next.matter}</p>
              <p className="mt-1 text-sm text-deep/70">{next.court} · {next.time}</p>
            </div>
          ) : <p className="font-serif text-4xl italic">Nothing scheduled.</p>}
        </div>

        <div>
          <div className="flex flex-wrap items-center gap-3">
            <div role="tablist" className="flex gap-1 rounded-full bg-surface p-1 shadow-sm">
              {FILTERS.map((f) => (
                <button key={f} role="tab" aria-selected={filter === f} onClick={() => setFilter(f)} className={`rounded-full px-4 py-2 text-[13px] transition-colors ${filter === f ? 'bg-fg text-onfg' : 'hover:bg-ink/5'}`}>{f}</button>
              ))}
            </div>
            <div className="ml-auto flex gap-2">
              <button onClick={download} className="pill border border-ink/20 text-[13px] hover:bg-fg hover:text-onfg">Export .ics ↓</button>
              <button onClick={() => setOpen((v) => !v)} aria-expanded={open} className="pill bg-fg text-[13px] text-onfg hover:bg-key hover:text-deep">{open ? 'Close' : '+ Add hearing'}</button>
            </div>
          </div>

          {open && (
            <form onSubmit={add} className="mt-4 grid gap-3 rounded-3xl border border-line bg-card p-5 sm:grid-cols-2 md:p-6 panel-3d" style={{ animation: 'menuIn .5s cubic-bezier(.2,.7,.2,1) both' }}>
              <input required className={`${field} sm:col-span-2`} placeholder="Matter / case name" value={form.matter} onChange={(e) => setForm({ ...form, matter: e.target.value })} aria-label="Matter" />
              <input className={field} placeholder="Court & chamber" value={form.court} onChange={(e) => setForm({ ...form, court: e.target.value })} aria-label="Court" />
              <select className={field} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} aria-label="Type">{TYPES.map((t) => <option key={t}>{t}</option>)}</select>
              <input required type="date" className={field} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} aria-label="Date" />
              <input required type="time" className={field} value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} aria-label="Time" />
              <textarea className={`${field} sm:col-span-2`} rows={2} placeholder="Notes (optional)" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} aria-label="Notes" />
              <button className="pill justify-center bg-key text-deep hover:bg-fg hover:text-onfg sm:col-span-2">Save to calendar</button>
            </form>
          )}

          {anySample && (
            <p className="mt-4 rounded-2xl bg-key/20 px-4 py-3 font-mono text-[11px] uppercase tracking-wider text-keydeep">Sample entries shown — delete them or add your own matters.</p>
          )}

          <ul className="mt-4 space-y-2">
            {list.length === 0 && <li className="rounded-3xl border border-dashed border-ink/20 px-6 py-12 text-center text-mute">No {filter.toLowerCase()} entries.</li>}
            {list.map((h) => {
              const d = days(h.date), dt = new Date(h.date + 'T00:00:00'), [label, cls] = chip(d)
              return (
                <li key={h.id} className={`group grid grid-cols-[64px_1fr_auto] items-center gap-4 rounded-3xl border border-line bg-card px-4 py-4 transition-all duration-300 hover:-translate-y-0.5 hover:bg-surface hover:shadow-[0_20px_40px_-25px_rgb(var(--shadow)/.6)] md:grid-cols-[84px_1fr_auto] md:px-6 ${d < 0 ? 'opacity-60' : ''} panel-3d`}>
                  <div className="text-center leading-none">
                    <p className="font-serif text-[44px] italic md:text-[54px]">{dt.getDate()}</p>
                    <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-mute">{dt.toLocaleDateString('en-US', { month: 'short' })} · {h.time}</p>
                  </div>
                  <div className="min-w-0">
                    <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-keydeep">{h.type}{h.sample && <span className="ml-2 text-mute">· sample</span>}</p>
                    <p className="mt-1 text-[18px] font-medium leading-snug tracking-[-0.015em] md:text-[20px]">{h.matter}</p>
                    <p className="text-sm text-mute">{h.court}{h.note && ` — ${h.note}`}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`whitespace-nowrap rounded-full px-3 py-1 font-mono text-[10px] uppercase tracking-widest ${cls}`}>{label}</span>
                    <button onClick={() => setItems((p) => p.filter((x) => x.id !== h.id))} aria-label={`Delete ${h.matter}`} className="max-md:-my-2 max-md:px-2 max-md:py-3 font-mono text-[10px] uppercase tracking-widest text-mute opacity-0 transition hover:text-keydeep focus:opacity-100 group-hover:opacity-100 max-md:opacity-100">Delete</button>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </section>
  )
}
