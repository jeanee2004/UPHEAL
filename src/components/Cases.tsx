import { useMemo, useState } from 'react'
import { Eyebrow } from './Glyph'
import { useStored } from '../lib'
import { appProgress, blankCase, Case, daysTo, docProgress, flags, nextItem, CaseStore, CASES_KEY, casesInit, StageId, STAGES } from '../data/caseModel'
import { casesCsv } from '../data/caseExport'
import CaseDetail from './CaseDetail'
import Folders from './Folders'
import { input, labelCls, Meter, RelDate, SecCells, StageChip } from './caseUi'

const card = 'rounded-2xl border border-line bg-card'

export default function Cases() {
  const [st, setSt] = useStored<CaseStore>(CASES_KEY, casesInit)
  const [openId, setOpenId] = useState<string | null>(null)
  const [q, setQ] = useState(''), [stage, setStage] = useState<'all' | StageId>('all'), [only, setOnly] = useState(false)
  const [adding, setAdding] = useState(false), [nf, setNf] = useState({ alias: '', nationality: '', lang: '' })

  const patch = (id: string) => (fn: (c: Case) => Case) => setSt((p) => ({ ...p, cases: p.cases.map((c) => (c.id === id ? { ...fn(c), updated: new Date().toISOString() } : c)) }))
  const rows = useMemo(() => st.cases.map((c) => ({ c, ap: appProgress(c), dp: docProgress(c), nx: nextItem(c), fl: flags(c) })), [st.cases])
  const shown = rows.filter(({ c, fl }) => (stage === 'all' || c.stage === stage) && (!only || fl.some((f) => f.lvl !== 'info')) && (`${c.alias} ${c.nationality} ${c.lang}`.toLowerCase().includes(q.toLowerCase())))
    .sort((a, b) => Number(b.c.urgent) - Number(a.c.urgent) || (a.nx?.date ?? '9').localeCompare(b.nx?.date ?? '9'))
  const cur = openId ? st.cases.find((c) => c.id === openId) : null

  const stats = {
    active: rows.filter((r) => r.c.stage !== 'decision').length, urgent: rows.filter((r) => r.c.urgent).length,
    review: rows.reduce((n, r) => n + r.ap.review, 0), fix: rows.reduce((n, r) => n + r.ap.fix, 0), out: rows.reduce((n, r) => n + r.dp.out, 0),
    soon: rows.filter((r) => r.nx && (daysTo(r.nx.date) ?? 99) <= 14).length, year: rows.filter((r) => r.fl.some((f) => f.text.includes('one year'))).length,
  }
  const attention = rows.flatMap((r) => r.fl.filter((f) => f.lvl !== 'info').map((f) => ({ ...f, c: r.c }))).sort((a, b) => (a.lvl === b.lvl ? 0 : a.lvl === 'warn' ? -1 : 1)).slice(0, 8)
  const hasSamples = st.cases.some((c) => c.sample)

  const create = (e: React.FormEvent) => {
    e.preventDefault()
    const c = blankCase(nf.alias.trim() || `Case ${st.cases.length + 1}`, { nationality: nf.nationality.trim(), lang: nf.lang.trim() })
    setSt((p) => ({ ...p, cases: [c, ...p.cases] })); setNf({ alias: '', nationality: '', lang: '' }); setAdding(false); setOpenId(c.id)
  }
  const csv = () => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([casesCsv(st.cases)], { type: 'text/csv' })); a.download = 'upheal-case-board.csv'; a.click(); URL.revokeObjectURL(a.href) }

  return (
    <section id="cases" className="mx-auto max-w-[1440px] scroll-mt-16 px-5 pb-28 md:px-8">
      <div className="reveal grid gap-6 md:grid-cols-2 md:items-end">
        <div>
          <Eyebrow n="05" label="Heal · Case tracker" icon="footprints" />
          <h2 className="mt-4 font-display text-[clamp(56px,9vw,132px)] font-extrabold uppercase leading-[0.88]">Every life, <span className="font-serif text-[1.04em] font-normal normal-case italic tracking-normal">at a glance</span></h2>
        </div>
        <p className="max-w-md text-[17px] leading-relaxed text-mute md:justify-self-end">Applicants fill in their own 난민인정신청서. You keep track: who is where in the process, what has been discussed, which documents are still missing, and how far each form has been checked.</p>
      </div>

      <div className="mt-10">
        {cur ? (
          <CaseDetail key={cur.id} c={cur} patch={patch(cur.id)} onBack={() => setOpenId(null)} onDelete={() => { setSt((p) => ({ ...p, cases: p.cases.filter((c) => c.id !== cur.id) })); setOpenId(null) }} />
        ) : (
          <div className="space-y-4">
            {/* summary */}
            <div className="reveal grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-7" style={{ ['--d' as string]: '60ms' }}>
              {([['Active cases', stats.active, ''], ['Urgent', stats.urgent, stats.urgent ? 'text-rust' : ''], ['Sections to review', stats.review, stats.review ? 'text-keydeep' : ''], ['Need follow-up', stats.fix, stats.fix ? 'text-rust' : ''], ['Documents outstanding', stats.out, ''], ['Dates in 14 days', stats.soon, ''], ['Over 1 year to file', stats.year, stats.year ? 'text-keydeep' : '']] as [string, number, string][]).map(([k, v, tone]) => (
                <div key={k} className={`${card} panel-3d px-4 py-4`}><p className={`font-serif text-[44px] italic leading-none tracking-tight ${tone}`}>{v}</p><p className="mt-2 font-mono text-[9.5px] uppercase leading-tight tracking-widest text-mute">{k}</p></div>
              ))}
            </div>

            {/* toolbar */}
            <div className={`${card} flex flex-wrap items-center gap-2 p-3`}>
              <input aria-label="Search cases" className={`${input} max-w-[240px]`} placeholder="Search alias, nationality, language…" value={q} onChange={(e) => setQ(e.target.value)} />
              <select aria-label="Stage filter" className={`${input} max-w-[190px]`} value={stage} onChange={(e) => setStage(e.target.value as 'all' | StageId)}><option value="all">All stages</option>{STAGES.map((s) => <option key={s.id} value={s.id}>{s.en} · {s.ko}</option>)}</select>
              <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-line bg-surface px-3 py-2.5 text-[13px]"><input type="checkbox" checked={only} onChange={(e) => setOnly(e.target.checked)} className="accent-[#EDB021]" />Needs attention</label>
              <div role="group" aria-label="View" className="ml-auto flex gap-1 rounded-full bg-surface p-1">{(['folders', 'table', 'board'] as const).map((v) => <button key={v} aria-pressed={st.view === v} onClick={() => setSt((p) => ({ ...p, view: v }))} className={`rounded-full px-4 py-1.5 text-[12.5px] capitalize ${st.view === v ? 'bg-fg text-onfg' : 'hover:bg-fg/10'}`}>{v === 'table' ? 'List' : v === 'board' ? 'Board' : 'Folders'}</button>)}</div>
              <button onClick={csv} className="pill border border-ink/25 px-4 py-2 text-[12px] hover:bg-fg hover:text-onfg">Export .csv ↓</button>
              <button onClick={() => setAdding((v) => !v)} className="pill bg-key px-4 py-2 text-[12px] text-deep hover:bg-fg hover:text-onfg">{adding ? 'Cancel' : '+ New case'}</button>
            </div>

            {adding && (
              <form onSubmit={create} className={`${card} grid gap-3 p-4 sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-end`} style={{ animation: 'menuIn .4s cubic-bezier(.2,.7,.2,1) both' }}>
                <div><label className={labelCls} htmlFor="nc-a">Alias (initials or code — not the full name)</label><input id="nc-a" autoFocus className={input} value={nf.alias} onChange={(e) => setNf({ ...nf, alias: e.target.value })} /></div>
                <div><label className={labelCls} htmlFor="nc-n">Nationality</label><input id="nc-n" className={input} value={nf.nationality} onChange={(e) => setNf({ ...nf, nationality: e.target.value })} /></div>
                <div><label className={labelCls} htmlFor="nc-l">Language</label><input id="nc-l" className={input} value={nf.lang} onChange={(e) => setNf({ ...nf, lang: e.target.value })} /></div>
                <button className="pill justify-center bg-key text-deep hover:bg-fg hover:text-onfg">Create case</button>
              </form>
            )}

            {hasSamples && (
              <p className="flex flex-wrap items-center gap-3 rounded-2xl bg-key/10 px-4 py-3 font-mono text-[10.5px] uppercase tracking-wider text-keydeep">Sample cases shown so you can see the layout.
                <button onClick={() => setSt((p) => ({ ...p, cases: p.cases.filter((c) => !c.sample) }))} className="rounded-full border border-key/50 px-3 py-1 hover:bg-key hover:text-deep max-md:py-2.5">Remove samples</button></p>
            )}

            {st.view === 'folders' && <Folders cases={shown.map((r) => r.c)} open={setOpenId} />}

            {/* list */}
            {st.view === 'table' && (
              <div className={`${card} overflow-hidden`}>
                <div className="hidden grid-cols-[1.2fr_.9fr_1.2fr_.9fr_1.3fr_.7fr] gap-4 border-b border-line px-5 py-3 font-mono text-[9.5px] uppercase tracking-widest text-mute lg:grid"><span>Case</span><span>Stage</span><span>Application form</span><span>Documents</span><span>Next</span><span className="text-right">Flags</span></div>
                {shown.length === 0 && <p className="px-5 py-14 text-center text-mute">No cases match.</p>}
                <ul>
                  {shown.map(({ c, ap, dp, nx, fl }) => {
                    const w = fl.filter((f) => f.lvl === 'warn').length, t = fl.filter((f) => f.lvl === 'todo').length
                    return (
                      <li key={c.id} className="border-b border-line last:border-0">
                        <button onClick={() => setOpenId(c.id)} data-cursor="Open" className="grid w-full gap-3 px-5 py-4 text-left transition-colors hover:bg-fg/5 lg:grid-cols-[1.2fr_.9fr_1.2fr_.9fr_1.3fr_.7fr] lg:items-center lg:gap-4">
                          <span className="min-w-0"><span className="flex items-center gap-2"><b className="text-[17px] font-medium tracking-[-0.01em]">{c.alias}</b>{c.urgent && <span className="rounded-full bg-rust/20 px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest text-rust">Urgent</span>}{c.sample && <span className="rounded-full border border-line px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest text-mute">Sample</span>}</span>
                            <span className="block text-[12.5px] text-mute">{c.nationality || '—'}{c.lang && ` · ${c.lang}`}{c.interpreter && ' · interpreter'}</span></span>
                          <span><StageChip c={c} /></span>
                          <span><SecCells c={c} /><span className="mt-1.5 block font-mono text-[10px] uppercase tracking-widest text-mute">{ap.ok}/{ap.total} verified{ap.fix ? ` · ${ap.fix} follow-up` : ''}{ap.review ? ` · ${ap.review} to review` : ''}</span></span>
                          <span><Meter pct={dp.pct} /><span className="mt-1.5 block font-mono text-[10px] uppercase tracking-widest text-mute">{dp.total ? `${dp.got}/${dp.total} in hand` : 'none tracked'}</span></span>
                          <span className="min-w-0 text-[13px]">{nx ? <><span className="block truncate">{nx.label}</span><span className="font-mono text-[10px] uppercase tracking-widest"><RelDate d={nx.date} /> · {nx.date}</span></> : <span className="text-mute">—</span>}</span>
                          <span className="flex gap-1.5 lg:justify-end">{w > 0 && <span className="rounded-full bg-rust/25 px-2.5 py-1 font-mono text-[10px] text-rust">{w} ⚠</span>}{t > 0 && <span className="rounded-full bg-key px-2.5 py-1 font-mono text-[10px] text-deep">{t} to do</span>}{w + t === 0 && <span className="font-mono text-[10px] text-ok">✓ clear</span>}</span>
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </div>
            )}

            {/* board */}
            {st.view === 'board' && (
              <div className="-mx-5 overflow-x-auto px-5 pb-2 md:-mx-8 md:px-8">
                <div className="grid min-w-[1180px] grid-cols-8 gap-3">
                  {STAGES.map((s, i) => {
                    const col = shown.filter((r) => r.c.stage === s.id)
                    return (
                      <div key={s.id} className="rounded-2xl border border-line bg-paper/60 p-2.5">
                        <p className="mb-2.5 flex items-center justify-between px-1.5 pt-1 font-mono text-[9.5px] uppercase tracking-widest text-mute"><span><i className="mr-1.5 not-italic text-keydeep">{i + 1}</i>{s.en}</span><span>{col.length}</span></p>
                        <ul className="space-y-2">
                          {col.map(({ c, ap, dp, fl }) => (
                            <li key={c.id}><button onClick={() => setOpenId(c.id)} data-cursor="Open" className="w-full rounded-xl border border-line bg-card p-3 text-left transition-all hover:-translate-y-0.5 hover:border-key/60">
                              <span className="flex items-center justify-between gap-2"><b className="text-[15px] font-medium">{c.alias}</b>{c.urgent && <i className="h-2 w-2 rounded-full bg-rust" title="Urgent" />}</span>
                              <span className="block text-[11.5px] text-mute">{c.nationality || '—'}</span>
                              <span className="mt-2 block"><SecCells c={c} size="h-2 w-2" /></span>
                              <span className="mt-2 block font-mono text-[9px] uppercase tracking-widest text-mute">{ap.ok}/{ap.total} form · {dp.got}/{dp.total} docs</span>
                              {fl.some((f) => f.lvl === 'warn') && <span className="mt-1.5 inline-block rounded-full bg-rust/25 px-2 py-0.5 font-mono text-[9px] text-rust">⚠ {fl.filter((f) => f.lvl === 'warn').length}</span>}
                            </button></li>
                          ))}
                        </ul>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* attention across cases */}
            {attention.length > 0 && (
              <div className={`${card} p-5 md:p-6`}>
                <p className="mb-3 font-mono text-[10.5px] uppercase tracking-widest text-keydeep">Needs attention across all cases</p>
                <ul className="space-y-1">{attention.map((a, i) => (
                  <li key={i}><button onClick={() => setOpenId(a.c.id)} className="flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-fg/5">
                    <b className="w-12 shrink-0 text-[14px] font-medium">{a.c.alias}</b>
                    <span className={`mt-0.5 shrink-0 rounded-full px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest ${a.lvl === 'warn' ? 'bg-rust/25 text-rust' : 'bg-key text-deep'}`}>{a.lvl === 'warn' ? 'Warning' : 'To do'}</span>
                    <span className="text-[14px] leading-snug">{a.text}</span></button></li>
                ))}</ul>
              </div>
            )}
            <p className="font-mono text-[10px] uppercase leading-relaxed tracking-widest text-mute">Stored only in this browser · nothing is uploaded · use aliases, not full names · practice pointers are general aids, not legal advice</p>
          </div>
        )}
      </div>
    </section>
  )
}
