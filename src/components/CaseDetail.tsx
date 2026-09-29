import { useState } from 'react'
import { ATTACHMENTS, DEFINITION, RULES, SECTIONS } from '../data/refugeeForm'
import { appProgress, ageOf, Case, CONSULT_MODES, DOC_STATUS, DOC_SUGGEST, docProgress, DocStatus, flags, Flag, nextItem, OWNERS, Owner, SEC_DOCS, SEC_STATUS, secRange, secStatus, SecStatus, STAGES, todayIso, uid, daysTo } from '../data/caseModel'
import { caseSheetHtml, caseSheetMd } from '../data/caseExport'
import { input, labelCls, Meter, RelDate, SecCells } from './caseUi'
import Glyph from './Glyph'

type Tab = 'overview' | 'consults' | 'docs' | 'application' | 'notes'
type Props = { c: Case; patch: (fn: (c: Case) => Case) => void; onBack: () => void; onDelete: () => void }

const card = 'rounded-2xl border border-line bg-card p-5 md:p-6'
const head = 'mb-3 font-mono text-[10.5px] uppercase tracking-widest text-keydeep'
const pillBtn = 'pill border border-ink/25 px-4 py-2 text-[12px] hover:bg-fg hover:text-onfg'

function FlagList({ items, go }: { items: Flag[]; go: (t: Tab) => void }) {
  if (!items.length) return <p className="text-[15px] text-mute">Nothing needs attention right now.</p>
  return (
    <ul className="space-y-1.5">
      {items.map((f, i) => (
        <li key={i}><button onClick={() => f.tab && go(f.tab)} className="flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-fg/5">
          <span className={`mt-0.5 shrink-0 rounded-full px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest ${f.lvl === 'warn' ? 'bg-rust/25 text-rust' : f.lvl === 'todo' ? 'bg-key text-deep' : 'border border-line text-mute'}`}>{f.lvl === 'warn' ? 'Warning' : f.lvl === 'todo' ? 'To do' : 'Note'}</span>
          <span className="text-[14px] leading-snug">{f.text}</span></button></li>
      ))}
    </ul>
  )
}

export default function CaseDetail({ c, patch, onBack, onDelete }: Props) {
  const [tab, setTab] = useState<Tab>('overview')
  const ap = appProgress(c), dp = docProgress(c), fl = flags(c), age = ageOf(c.dob), nx = nextItem(c)
  const set = <K extends keyof Case>(k: K, v: Case[K]) => patch((x) => ({ ...x, [k]: v }))
  const print = () => { const w = window.open('', '_blank'); if (!w) return; w.document.write(caseSheetHtml(c)); w.document.close(); w.focus(); setTimeout(() => w.print(), 300) }
  const download = () => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([caseSheetMd(c)], { type: 'text/markdown' })); a.download = `${c.alias || 'case'}-status.md`; a.click(); URL.revokeObjectURL(a.href) }
  const tabs: [Tab, string][] = [['overview', 'Overview'], ['consults', `Consultations · ${c.consults.length}`], ['docs', `Documents · ${dp.got}/${dp.total}`], ['application', `Application · ${ap.ok}/${ap.total}`], ['notes', 'Notes']]

  return (
    <div className="space-y-4" style={{ animation: 'menuIn .45s cubic-bezier(.2,.7,.2,1) both' }}>
      {/* header */}
      <div className="panel-3d rounded-3xl border border-line bg-card p-5 md:p-8">
        <div className="flex flex-wrap items-center gap-3">
          <button onClick={onBack} className="pill border border-ink/25 px-4 py-2 text-[12px] hover:bg-fg hover:text-onfg">← All cases</button>
          <div className="ml-auto flex flex-wrap gap-2">
            <button onClick={download} className={pillBtn}>Case sheet (.md) ↓</button>
            <button onClick={print} className={pillBtn}>Print / PDF</button>
            <button onClick={() => { if (confirm(`Delete case “${c.alias}” from this browser?`)) onDelete() }} className="pill px-3 py-2 text-[12px] text-mute hover:text-rust">Delete</button>
          </div>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-[1.2fr_1fr_1fr_auto] md:items-end">
          <div><label className={labelCls} htmlFor="cd-alias">Case alias</label><input id="cd-alias" className={`${input} text-[18px] font-medium`} value={c.alias} onChange={(e) => set('alias', e.target.value)} placeholder="Initials or code" /></div>
          <div><label className={labelCls} htmlFor="cd-nat">Nationality</label><input id="cd-nat" className={input} value={c.nationality} onChange={(e) => set('nationality', e.target.value)} /></div>
          <div><label className={labelCls} htmlFor="cd-lang">Applicant’s language</label><input id="cd-lang" className={input} value={c.lang} onChange={(e) => set('lang', e.target.value)} /></div>
          <div className="flex gap-2">
            <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-line bg-surface px-3 py-2.5 text-[13px]"><input type="checkbox" checked={c.interpreter} onChange={(e) => set('interpreter', e.target.checked)} className="accent-[#EDB021]" />Interpreter</label>
            <button aria-pressed={c.urgent} onClick={() => set('urgent', !c.urgent)} className={`rounded-xl border px-3 py-2.5 text-[13px] ${c.urgent ? 'border-rust bg-rust/15 text-rust' : 'border-line bg-surface hover:border-ink'}`}>{c.urgent ? '● Urgent' : 'Urgent'}</button>
          </div>
        </div>

        <ol className="mt-6 grid grid-cols-2 gap-1.5 sm:grid-cols-4 lg:grid-cols-8" aria-label="Case stage">
          {STAGES.map((s, i) => { const cur = STAGES.findIndex((x) => x.id === c.stage), on = i === cur, done = i < cur
            return <li key={s.id}><button onClick={() => set('stage', s.id)} aria-current={on} className={`w-full rounded-xl border px-3 py-2.5 text-left transition-colors ${on ? 'border-key bg-key text-deep' : done ? 'border-key/40 bg-key/10' : 'border-line hover:border-ink/40'}`}>
              <span className={`flex items-center justify-between font-mono text-[9px] uppercase tracking-widest ${on ? 'text-deep/70' : 'text-mute'}`}>{i + 1}<Glyph name="footprints" className={`h-4 w-4 ${on ? 'text-deep' : done ? 'text-keydeep' : 'opacity-40'}`} /></span><span className="block text-[13px] font-medium leading-tight">{s.en}</span><span className={`block text-[11px] ${on ? 'text-deep/70' : 'text-mute'}`}>{s.ko}</span></button></li> })}
        </ol>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {([['dob', 'Date of birth'], ['entry', 'Last entry into Korea (form 10.7)'], ['filed', 'Filed on'], ['interview', 'Interview on']] as const).map(([k, l]) => (
            <div key={k}><label className={labelCls} htmlFor={`cd-${k}`}>{l}</label><input id={`cd-${k}`} type="date" className={input} value={c[k] ?? ''} onChange={(e) => set(k, e.target.value)} />
              <p className="mt-1 h-4 font-mono text-[10px] uppercase tracking-widest text-mute">{k === 'dob' && age !== null ? `${age} years old` : k !== 'dob' && c[k] ? <RelDate d={c[k]!} /> : ''}</p></div>
          ))}
        </div>
      </div>

      {/* tabs */}
      <div role="tablist" className="flex gap-1 overflow-x-auto rounded-full bg-surface p-1">
        {tabs.map(([id, l]) => <button key={id} role="tab" aria-selected={tab === id} onClick={() => setTab(id)} className={`shrink-0 rounded-full px-4 py-2 text-[13px] transition-colors ${tab === id ? 'bg-fg text-onfg' : 'hover:bg-fg/10'}`}>{l}</button>)}
      </div>

      {tab === 'overview' && <Overview c={c} patch={patch} fl={fl} nx={nx} ap={ap} dp={dp} go={setTab} />}
      {tab === 'consults' && <Consults c={c} patch={patch} />}
      {tab === 'docs' && <Docs c={c} patch={patch} />}
      {tab === 'application' && <Application c={c} patch={patch} />}
      {tab === 'notes' && (
        <div className={card}>
          <label className={head} htmlFor="cd-notes">Case notes</label>
          <textarea id="cd-notes" rows={12} className={`${input} resize-y`} value={c.notes} onChange={(e) => set('notes', e.target.value)} placeholder="Strategy, credibility points, things to remember. Stored only in this browser." />
          <p className="mt-2 font-mono text-[10px] uppercase tracking-widest text-mute">Last updated {new Date(c.updated).toLocaleString('en-GB')}</p>
        </div>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ overview */
function Overview({ c, patch, fl, nx, ap, dp, go }: { c: Case; patch: Props['patch']; fl: Flag[]; nx: ReturnType<typeof nextItem>; ap: ReturnType<typeof appProgress>; dp: ReturnType<typeof docProgress>; go: (t: Tab) => void }) {
  const [txt, setTxt] = useState(''), [due, setDue] = useState('')
  const add = (e: React.FormEvent) => { e.preventDefault(); if (!txt.trim()) return; patch((x) => ({ ...x, actions: [...x.actions, { id: uid(), text: txt.trim(), due: due || undefined, done: false }] })); setTxt(''); setDue('') }
  const acts = [...c.actions].sort((a, b) => Number(a.done) - Number(b.done) || (a.due ?? '9').localeCompare(b.due ?? '9'))
  return (
    <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
      <div className="space-y-4">
        <div className={card}><p className={head}>Needs attention ({fl.length})</p><FlagList items={fl} go={go} /></div>
        <div className={card}>
          <p className={head}>Progress</p>
          <div className="grid gap-5 sm:grid-cols-2">
            <div><p className="mb-2 flex justify-between text-[13px]"><span>Application form</span><span className="font-mono text-mute">{ap.ok}/{ap.total} verified</span></p><SecCells c={c} size="h-3.5 w-3.5" />
              <p className="mt-2 font-mono text-[10px] uppercase tracking-widest text-mute">{ap.review} to review · {ap.fix} follow-up · {ap.client} applicant filling · {ap.todo} not started</p></div>
            <div><p className="mb-2 flex justify-between text-[13px]"><span>Documents</span><span className="font-mono text-mute">{dp.got}/{dp.total} in hand</span></p><Meter pct={dp.pct} /><p className="mt-2 font-mono text-[10px] uppercase tracking-widest text-mute">{dp.out} outstanding</p></div>
          </div>
        </div>
      </div>
      <div className="space-y-4">
        <div className={card}>
          <p className={head}>Next up</p>
          {nx ? <p className="mb-4 rounded-xl bg-key/15 px-4 py-3 text-[14px]"><b className="font-medium">{nx.label}</b> · {nx.date} · <RelDate d={nx.date} /></p> : <p className="mb-4 text-[14px] text-mute">Nothing dated yet.</p>}
          <ul className="space-y-1">
            {acts.map((a) => (
              <li key={a.id} className="flex items-start gap-3 rounded-xl px-2 py-2 hover:bg-fg/5">
                <input type="checkbox" aria-label={`Done: ${a.text}`} checked={a.done} onChange={(e) => patch((x) => ({ ...x, actions: x.actions.map((y) => (y.id === a.id ? { ...y, done: e.target.checked } : y)) }))} className="mt-1 h-4 w-4 shrink-0 accent-[#EDB021]" />
                <span className={`flex-1 text-[14px] leading-snug ${a.done ? 'text-mute line-through' : ''}`}>{a.text}{a.due && <span className="ml-2 font-mono text-[10px] uppercase tracking-widest"><RelDate d={a.due} /></span>}</span>
                <button onClick={() => patch((x) => ({ ...x, actions: x.actions.filter((y) => y.id !== a.id) }))} aria-label="Remove task" className="text-mute hover:text-rust">×</button>
              </li>
            ))}
          </ul>
          <form onSubmit={add} className="mt-3 grid gap-2 sm:grid-cols-[1fr_auto_auto]"><input aria-label="New task" className={input} placeholder="Add a follow-up task…" value={txt} onChange={(e) => setTxt(e.target.value)} /><input aria-label="Due date" type="date" className={input} value={due} onChange={(e) => setDue(e.target.value)} /><button className="pill justify-center bg-key text-deep hover:bg-fg hover:text-onfg">Add</button></form>
        </div>
        <div className={card}>
          <p className={head}>Jump to</p>
          <div className="flex flex-wrap gap-2">
            <a href="#meeting" className={pillBtn}>Schedule a consultation ↗</a><a href="#hearings" className={pillBtn}>Add to court calendar ↗</a><a href="#vault" className={pillBtn}>Seal a document ↗</a>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ consultations */
function Consults({ c, patch }: { c: Case; patch: Props['patch'] }) {
  const [f, setF] = useState({ date: todayIso(), mode: CONSULT_MODES[0], with: '', summary: '', nextText: '', nextDate: '' })
  const add = (e: React.FormEvent) => { e.preventDefault(); if (!f.summary.trim()) return; patch((x) => ({ ...x, consults: [...x.consults, { id: uid(), ...f, summary: f.summary.trim(), nextText: f.nextText.trim() || undefined, nextDate: f.nextDate || undefined }] })); setF({ ...f, with: '', summary: '', nextText: '', nextDate: '' }) }
  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_1.1fr]">
      <form onSubmit={add} className={`${card} space-y-3`}>
        <p className={head}>Log a consultation</p>
        <div className="grid grid-cols-2 gap-3"><div><label className={labelCls} htmlFor="co-date">Date</label><input id="co-date" type="date" className={input} value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} /></div>
          <div><label className={labelCls} htmlFor="co-mode">Mode</label><select id="co-mode" className={input} value={f.mode} onChange={(e) => setF({ ...f, mode: e.target.value })}>{CONSULT_MODES.map((m) => <option key={m}>{m}</option>)}</select></div></div>
        <div><label className={labelCls} htmlFor="co-with">Interpreter / who attended</label><input id="co-with" className={input} value={f.with} onChange={(e) => setF({ ...f, with: e.target.value })} /></div>
        <div><label className={labelCls} htmlFor="co-sum">What was covered</label><textarea id="co-sum" rows={4} className={`${input} resize-y`} value={f.summary} onChange={(e) => setF({ ...f, summary: e.target.value })} placeholder="Topics, what the applicant will bring or fill in next…" /></div>
        <div className="grid gap-3 sm:grid-cols-[1fr_auto]"><div><label className={labelCls} htmlFor="co-nt">Next step (optional)</label><input id="co-nt" className={input} value={f.nextText} onChange={(e) => setF({ ...f, nextText: e.target.value })} /></div><div><label className={labelCls} htmlFor="co-nd">Next date</label><input id="co-nd" type="date" className={input} value={f.nextDate} onChange={(e) => setF({ ...f, nextDate: e.target.value })} /></div></div>
        <div className="flex flex-wrap gap-2"><button className="pill bg-key text-deep hover:bg-fg hover:text-onfg">Save entry</button><a href="#meeting" className={pillBtn}>Send meeting invite ↗</a></div>
      </form>
      <div className={card}>
        <p className={head}>History ({c.consults.length})</p>
        {c.consults.length === 0 ? <p className="text-[15px] text-mute">No consultations logged yet.</p> : (
          <ol className="space-y-3">
            {[...c.consults].sort((a, b) => b.date.localeCompare(a.date)).map((x) => (
              <li key={x.id} className="rounded-xl border border-line bg-paper/50 p-4">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[10px] uppercase tracking-widest text-mute"><b className="font-medium text-ink">{x.date}</b><span>{x.mode}</span>{x.with && <span>{x.with}</span>}
                  <button onClick={() => patch((y) => ({ ...y, consults: y.consults.filter((z) => z.id !== x.id) }))} className="ml-auto hover:text-rust">Remove</button></div>
                <p className="mt-2 whitespace-pre-wrap text-[14px] leading-relaxed">{x.summary}</p>
                {(x.nextText || x.nextDate) && <p className="mt-2 text-[13px] text-keydeep">Next → {x.nextText} {x.nextDate && <>· {x.nextDate} · <RelDate d={x.nextDate} /></>}</p>}
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ documents */
function Docs({ c, patch }: { c: Case; patch: Props['patch'] }) {
  const [name, setName] = useState(''), [cat, setCat] = useState('Persecution evidence'), [owner, setOwner] = useState<Owner>('client')
  const cats = Array.from(new Set(DOC_SUGGEST.map((d) => d.cat)))
  const have = new Set(c.docs.map((d) => d.name))
  const addDoc = (n: string, ct: string, ow: Owner = 'client') => patch((x) => ({ ...x, docs: [...x.docs, { id: uid(), name: n, cat: ct, status: 'needed', owner: ow }] }))
  const upd = (id: string, p: Partial<Case['docs'][number]>) => patch((x) => ({ ...x, docs: x.docs.map((d) => (d.id === id ? { ...d, ...p } : d)) }))
  const order = DOC_STATUS.map((s) => s.id), sorted = [...c.docs].sort((a, b) => order.indexOf(a.status) - order.indexOf(b.status))
  const counts = DOC_STATUS.map((s) => [s, c.docs.filter((d) => d.status === s.id).length] as const)
  return (
    <div className="space-y-4">
      <div className={card}>
        <div className="flex flex-wrap gap-2">{counts.map(([s, n]) => <span key={s.id} className={`rounded-full border px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest ${s.cls}`}>{s.en} · {n}</span>)}</div>
      </div>
      <div className={card}>
        <p className={head}>Suggested documents — tap to add to this case</p>
        {cats.map((ct) => (
          <div key={ct} className="mb-3 flex flex-wrap items-center gap-1.5"><span className="mr-1 w-32 shrink-0 font-mono text-[10px] uppercase tracking-widest text-mute">{ct}</span>
            {DOC_SUGGEST.filter((d) => d.cat === ct).map((d) => <button key={d.name} disabled={have.has(d.name)} onClick={() => addDoc(d.name, d.cat)} className="rounded-full border border-line bg-surface px-3 py-1.5 text-[12.5px] transition-colors enabled:hover:border-key enabled:hover:text-keydeep disabled:opacity-35">{have.has(d.name) ? '✓ ' : '+ '}{d.name}</button>)}</div>
        ))}
        <form onSubmit={(e) => { e.preventDefault(); if (name.trim()) { addDoc(name.trim(), cat, owner); setName('') } }} className="mt-4 grid gap-2 border-t border-line pt-4 sm:grid-cols-[1fr_auto_auto_auto]">
          <input aria-label="Custom document" className={input} placeholder="Add another document…" value={name} onChange={(e) => setName(e.target.value)} />
          <select aria-label="Category" className={input} value={cat} onChange={(e) => setCat(e.target.value)}>{[...cats, 'Other'].map((x) => <option key={x}>{x}</option>)}</select>
          <select aria-label="Owner" className={input} value={owner} onChange={(e) => setOwner(e.target.value as Owner)}>{OWNERS.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}</select>
          <button className="pill justify-center bg-key text-deep hover:bg-fg hover:text-onfg">Add</button>
        </form>
      </div>
      <div className={card}>
        <p className={head}>Tracker ({c.docs.length})</p>
        {c.docs.length === 0 ? <p className="text-[15px] text-mute">No documents tracked yet — add from the suggestions above.</p> : (
          <ul className="space-y-2">
            {sorted.map((d) => {
              const st = DOC_STATUS.find((s) => s.id === d.status)!, od = d.due && d.due < todayIso() && (d.status === 'needed' || d.status === 'requested')
              return (
                <li key={d.id} className="grid gap-3 rounded-xl border border-line bg-paper/50 p-3 md:grid-cols-[1.6fr_1fr_1fr_1fr_auto] md:items-center">
                  <div className="min-w-0"><p className="text-[14px] font-medium leading-snug">{d.name}</p><p className="font-mono text-[10px] uppercase tracking-widest text-mute">{d.cat}</p></div>
                  <select aria-label="Status" className={`rounded-full border px-3 py-2 font-mono text-[10.5px] uppercase tracking-widest outline-none ${st.cls} bg-transparent`} value={d.status} onChange={(e) => upd(d.id, { status: e.target.value as DocStatus })}>{DOC_STATUS.map((s) => <option key={s.id} value={s.id} className="bg-card text-ink">{s.en}</option>)}</select>
                  <select aria-label="Owner" className={`${input} py-2`} value={d.owner} onChange={(e) => upd(d.id, { owner: e.target.value as Owner })}>{OWNERS.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}</select>
                  <div><input aria-label="Due date" type="date" className={`${input} py-2 ${od ? 'border-rust/60' : ''}`} value={d.due ?? ''} onChange={(e) => upd(d.id, { due: e.target.value || undefined })} />{od && <p className="mt-1 font-mono text-[9px] uppercase tracking-widest text-rust">Overdue</p>}</div>
                  <div className="flex items-center gap-3 md:justify-end">{(d.status === 'received' || d.status === 'translated') && <a href="#vault" className="font-mono text-[10px] uppercase tracking-widest text-keydeep hover:underline">Seal ↗</a>}<button onClick={() => patch((x) => ({ ...x, docs: x.docs.filter((y) => y.id !== d.id) }))} aria-label={`Remove ${d.name}`} className="text-mute hover:text-rust">×</button></div>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ application form tracker */
function Application({ c, patch }: { c: Case; patch: Props['patch'] }) {
  const ap = appProgress(c), age = ageOf(c.dob)
  const setSec = (n: string, p: { status?: SecStatus; note?: string }) => patch((x) => ({ ...x, sections: { ...x.sections, [n]: { status: x.sections[n]?.status ?? 'todo', note: x.sections[n]?.note, ...p } } }))
  const bulk = (from: SecStatus, to: SecStatus) => patch((x) => ({ ...x, sections: { ...x.sections, ...Object.fromEntries(SECTIONS.filter((s) => (x.sections[s.n]?.status ?? 'todo') === from).map((s) => [s.n, { ...x.sections[s.n], status: to }])) } }))
  return (
    <div className="space-y-4">
      <div className={card}>
        <p className="max-w-3xl text-[14.5px] leading-relaxed text-mute">The applicant fills in their own form (난민인정신청서, 별지 제1호서식). Here you track each of its {ap.total} sections, note what needs chasing, and mark it verified once you have checked it with them.</p>
        <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-3"><SecCells c={c} size="h-4 w-4" /><span className="font-mono text-[11px] uppercase tracking-widest text-mute"><b className="font-medium text-ink">{ap.ok}/{ap.total}</b> verified · {ap.review} to review · {ap.fix} follow-up</span></div>
        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1">{SEC_STATUS.map((s) => <span key={s.id} className="flex items-center gap-1.5 font-mono text-[9.5px] uppercase tracking-widest text-mute"><i className={`block h-2.5 w-2.5 rounded-[2px] ${s.dot}`} />{s.en}</span>)}</div>
        <div className="mt-4 flex flex-wrap gap-2"><button onClick={() => bulk('review', 'ok')} className={pillBtn}>Mark all “ready to review” as verified</button><button onClick={() => bulk('todo', 'client')} className={pillBtn}>Mark all unstarted as “applicant filling”</button></div>
        {age !== null && age < 19 && <p className="mt-4 rounded-xl bg-key/15 px-4 py-3 text-[14px] text-keydeep">{flags(c).find((f) => f.text.startsWith('Applicant is'))?.text}</p>}
      </div>

      <ul className="space-y-2">
        {SECTIONS.map((s) => {
          const st = secStatus(c, s.n), meta = SEC_STATUS.find((x) => x.id === st)!
          const tips = s.fields.filter((f) => f.tip).map((f) => ({ id: f.id, tip: f.tip! }))
          return (
            <li key={s.n} className="rounded-2xl border border-line bg-card p-4 md:p-5">
              <div className="grid gap-3 md:grid-cols-[minmax(0,1.5fr)_200px_minmax(0,1fr)] md:items-center">
                <div className="flex min-w-0 items-start gap-4"><span className="font-serif text-[34px] italic leading-none text-key">{s.n}</span>
                  <div className="min-w-0"><p className="text-[15px] font-medium leading-snug">{s.en}</p><p className="text-[12.5px] text-mute">{s.ko} · <span className="font-mono">{secRange(s.n)}</span></p></div></div>
                <select aria-label={`Status of section ${s.n}`} className={`rounded-full border px-3 py-2.5 font-mono text-[10.5px] uppercase tracking-widest outline-none ${meta.cls} bg-transparent`} value={st} onChange={(e) => setSec(s.n, { status: e.target.value as SecStatus })}>{SEC_STATUS.map((x) => <option key={x.id} value={x.id} className="bg-card text-ink">{x.en} · {x.ko}</option>)}</select>
                <input aria-label={`Note for section ${s.n}`} className={input} placeholder="Note / what to chase…" value={c.sections[s.n]?.note ?? ''} onChange={(e) => setSec(s.n, { note: e.target.value })} />
              </div>
              {(tips.length > 0 || SEC_DOCS[s.n]) && (
                <details className="mt-3"><summary className="cursor-pointer select-none font-mono text-[10px] uppercase tracking-widest text-keydeep hover:underline">Check &amp; gather</summary>
                  <div className="mt-3 grid gap-4 md:grid-cols-2">
                    {SEC_DOCS[s.n] && <div><p className={labelCls}>Typical supporting material</p><ul className="list-disc space-y-1 pl-5 text-[13.5px] text-mute">{SEC_DOCS[s.n].map((x) => <li key={x}>{x}</li>)}</ul></div>}
                    {tips.length > 0 && <div><p className={labelCls}>Practice pointers</p><ul className="space-y-2 text-[13.5px] leading-relaxed text-mute">{tips.map((t) => <li key={t.id}><b className="mr-1 font-mono text-[11px] font-medium text-ink">{t.id}</b>{t.tip}</li>)}</ul></div>}
                    {s.n === '13' && <div className="md:col-span-2"><p className={labelCls}>Definition on the form</p><p className="text-[13px] leading-relaxed text-mute">{DEFINITION.en}</p></div>}
                  </div></details>
              )}
            </li>
          )
        })}
      </ul>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className={card}>
          <p className={head}>Briefing checklist · explained to the applicant ({RULES.flatMap((g) => g.items).filter((r) => c.rules[r.id]).length}/{RULES.flatMap((g) => g.items).length})</p>
          <ul className="space-y-0.5">{RULES.flatMap((g) => g.items).map((r) => (
            <li key={r.id}><label className={`flex cursor-pointer items-start gap-3 rounded-xl px-3 py-2 hover:bg-fg/5 ${c.rules[r.id] ? 'bg-key/10' : ''}`}><input type="checkbox" checked={!!c.rules[r.id]} onChange={(e) => patch((x) => ({ ...x, rules: { ...x.rules, [r.id]: e.target.checked } }))} className="mt-1 h-4 w-4 shrink-0 accent-[#EDB021]" /><span className="text-[13.5px] leading-snug"><span className="block">{r.ko}</span><span className="text-mute">{r.en}</span></span></label></li>
          ))}</ul>
        </div>
        <div className={card}>
          <p className={head}>Ready to file · attachments ({ATTACHMENTS.filter((r) => c.att[r.id]).length}/{ATTACHMENTS.length})</p>
          <ul className="space-y-0.5">{ATTACHMENTS.map((r) => (
            <li key={r.id}><label className={`flex cursor-pointer items-start gap-3 rounded-xl px-3 py-2 hover:bg-fg/5 ${c.att[r.id] ? 'bg-key/10' : ''}`}><input type="checkbox" checked={!!c.att[r.id]} onChange={(e) => patch((x) => ({ ...x, att: { ...x.att, [r.id]: e.target.checked } }))} className="mt-1 h-4 w-4 shrink-0 accent-[#EDB021]" /><span className="text-[13.5px] leading-snug"><span className="block">{r.ko}</span><span className="text-mute">{r.en}</span></span></label></li>
          ))}</ul>
          <p className="mt-3 px-3 text-[12.5px] text-mute">Filing: no fee · processing 6 months, extendable by up to 6 months. {daysTo(c.filed) !== null && c.filed ? `Filed ${c.filed}.` : ''}</p>
        </div>
      </div>
    </div>
  )
}
