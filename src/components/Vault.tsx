import { useRef, useState } from 'react'
import { Eyebrow } from './Glyph'
import { fmtBytes, sha256, useStored } from '../lib'

type Entry = { i: number; kind: 'genesis' | 'file' | 'note'; name: string; size: number; mime: string; sha: string; at: string; prev: string; hash: string; thumb?: string; note?: string }
const ZERO = '0'.repeat(64)
const chainHash = (e: Pick<Entry, 'i' | 'at' | 'name' | 'size' | 'sha' | 'prev'>) => sha256(`${e.i}|${e.at}|${e.name}|${e.size}|${e.sha}|${e.prev}`)

async function genesis(): Promise<Entry> {
  const at = new Date().toISOString()
  const sha = await sha256(`UPHEAL-LEDGER-GENESIS|${at}`)
  const base = { i: 0, at, name: 'Ledger initialised', size: 0, sha, prev: ZERO }
  return { ...base, kind: 'genesis', mime: '', hash: await chainHash(base) }
}

const thumbOf = (file: File) => new Promise<string | undefined>((res) => {
  if (!file.type.startsWith('image/')) return res(undefined)
  const url = URL.createObjectURL(file), img = new Image()
  img.onload = () => {
    const c = document.createElement('canvas'), k = 240 / Math.max(img.width, img.height)
    c.width = img.width * k; c.height = img.height * k
    c.getContext('2d')!.drawImage(img, 0, 0, c.width, c.height)
    URL.revokeObjectURL(url); res(c.toDataURL('image/jpeg', 0.6))
  }
  img.onerror = () => { URL.revokeObjectURL(url); res(undefined) }
  img.src = url
})

const short = (h: string) => `${h.slice(0, 10)}…${h.slice(-8)}`

export default function Vault() {
  const [ledger, setLedger] = useStored<Entry[]>('upheal.vault.v1', () => [])
  const [busy, setBusy] = useState(false)
  const [drag, setDrag] = useState(false)
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const [note, setNote] = useState('')
  const [copied, setCopied] = useState('')
  const [checks, setChecks] = useState<Record<number, boolean | undefined>>({})
  const pick = useRef<HTMLInputElement>(null)

  const append = async (base: Omit<Entry, 'i' | 'prev' | 'hash' | 'at'>) => {
    let chain = ledger
    if (chain.length === 0) chain = [await genesis()]
    const last = chain[chain.length - 1]
    const b = { ...base, i: last.i + 1, at: new Date().toISOString(), prev: last.hash }
    return [...chain, { ...b, hash: await chainHash(b) }]
  }
  const seal = async (files: File[]) => {
    setBusy(true); setMsg(null)
    try {
      let chain = ledger
      for (const f of files) {
        if (f.size > 300 * 1048576) { setMsg({ ok: false, text: `${f.name} is larger than 300 MB — skipped.` }); continue }
        const sha = await sha256(await f.arrayBuffer())
        const thumb = await thumbOf(f)
        if (chain.length === 0) chain = [await genesis()]
        const last = chain[chain.length - 1]
        const b = { i: last.i + 1, at: new Date().toISOString(), name: f.name, size: f.size, sha, prev: last.hash }
        chain = [...chain, { ...b, kind: 'file', mime: f.type || 'application/octet-stream', thumb, hash: await chainHash(b) }]
      }
      setLedger(chain)
      setMsg({ ok: true, text: `Sealed ${files.length} file${files.length > 1 ? 's' : ''}. Files never leave your device — only their fingerprints are stored.` })
    } finally { setBusy(false) }
  }
  const sealNote = async () => {
    if (!note.trim()) return
    const text = note.trim()
    setLedger(await append({ kind: 'note', name: text.slice(0, 48) + (text.length > 48 ? '…' : ''), size: new TextEncoder().encode(text).length, mime: 'text/plain', sha: await sha256(text), note: text }))
    setNote(''); setMsg({ ok: true, text: 'Note sealed into the ledger.' })
  }
  const verify = async () => {
    for (let k = 0; k < ledger.length; k++) {
      const e = ledger[k]
      const okPrev = k === 0 ? e.prev === ZERO : e.prev === ledger[k - 1].hash
      if (!okPrev || (await chainHash(e)) !== e.hash) return setMsg({ ok: false, text: `Chain broken at entry #${e.i} — the ledger has been altered.` })
    }
    setMsg({ ok: true, text: `Chain intact · ${ledger.length} entries verified with SHA-256.` })
  }
  const recheck = async (e: Entry, f?: File) => {
    if (!f) return
    const ok = (await sha256(await f.arrayBuffer())) === e.sha
    setChecks((c) => ({ ...c, [e.i]: ok }))
  }
  const copy = (h: string) => { navigator.clipboard?.writeText(h); setCopied(h); setTimeout(() => setCopied(''), 1400) }
  const exportJson = () => {
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([JSON.stringify(ledger.map(({ thumb, ...r }) => r), null, 2)], { type: 'application/json' }))
    a.download = 'upheal-custody-ledger.json'; a.click(); URL.revokeObjectURL(a.href)
  }
  const clear = () => { if (confirm('Erase the whole ledger from this browser? This cannot be undone.')) { setLedger([]); setChecks({}); setMsg(null) } }

  return (
    <section id="vault" className="mx-auto max-w-[1440px] scroll-mt-16 px-5 pb-28 md:px-8">
      <div className="reveal grid gap-6 md:grid-cols-2 md:items-end">
        <div>
          <Eyebrow n="04" label="Proof · Evidence vault" icon="suitcase" />
          <h2 className="mt-4 text-[clamp(44px,7vw,104px)] font-medium leading-[0.95] tracking-[-0.045em]">Proof that <span className="font-serif font-normal italic tracking-tight">holds</span></h2>
        </div>
        <p className="max-w-md text-[17px] leading-relaxed text-mute md:justify-self-end">Drop a file to fingerprint it with SHA-256 and seal it into a hash-linked ledger. Change one byte — of a file or of the ledger — and verification fails.</p>
      </div>

      <div className="reveal mt-12 grid gap-5 lg:grid-cols-[minmax(320px,0.8fr)_1.6fr]" style={{ ['--d' as string]: '100ms' }}>
        <div className="space-y-5">
          <div
            onDragOver={(e) => { e.preventDefault(); setDrag(true) }} onDragLeave={() => setDrag(false)}
            onDrop={(e) => { e.preventDefault(); setDrag(false); seal([...e.dataTransfer.files]) }}
            className={`grid min-h-[260px] place-items-center rounded-3xl border-2 border-dashed p-8 text-center transition-all duration-300 ${drag ? 'scale-[1.02] border-key bg-key/15' : 'border-ink/25 bg-card hover:border-ink'}`}>
            <div>
              <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-fg text-2xl text-onfg">{busy ? <span className="animate-spin">✳</span> : '↑'}</div>
              <p className="text-xl font-medium tracking-[-0.015em]">{busy ? 'Hashing…' : 'Drop exhibits here'}</p>
              <p className="mt-1 text-sm text-mute">Any file type · processed locally, never uploaded</p>
              <button onClick={() => pick.current?.click()} disabled={busy} data-cursor="Browse" className="pill mt-5 border border-ink/20 text-[13px] hover:bg-fg hover:text-onfg">Choose files</button>
              <input ref={pick} type="file" multiple hidden onChange={(e) => { const f = [...(e.target.files ?? [])]; e.target.value = ''; if (f.length) seal(f) }} />
            </div>
          </div>

          <div className="rounded-3xl border border-line bg-card p-5 panel-3d">
            <label className="font-mono text-[10px] uppercase tracking-widest text-mute" htmlFor="note">Seal a note as an exhibit</label>
            <textarea id="note" rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Witness statement, taken 14:20, Room 3…" className="mt-2 w-full resize-none rounded-xl border border-line bg-surface px-4 py-3 text-[15px] outline-none focus:border-ink" />
            <button onClick={sealNote} disabled={!note.trim()} className="pill mt-2 bg-fg text-[13px] text-onfg hover:bg-key hover:text-deep disabled:opacity-40">Seal note</button>
          </div>
        </div>

        <div>
          <div className="flex flex-wrap items-center gap-2">
            <button onClick={verify} disabled={!ledger.length} className="pill bg-fg text-[13px] text-onfg hover:bg-key hover:text-deep disabled:opacity-40">Verify chain ✓</button>
            <button onClick={exportJson} disabled={!ledger.length} className="pill border border-ink/20 text-[13px] hover:bg-fg hover:text-onfg disabled:opacity-40">Export ledger ↓</button>
            <button onClick={clear} disabled={!ledger.length} className="pill ml-auto text-[13px] text-mute hover:text-rust disabled:opacity-40">Erase</button>
          </div>
          {msg && <p role="status" className={`mt-3 rounded-2xl px-4 py-3 font-mono text-[11px] uppercase tracking-wider ${msg.ok ? 'bg-ok/15 text-ok' : 'bg-rust/12 text-rust'}`}>{msg.text}</p>}

          {ledger.length === 0 ? (
            <div className="mt-4 grid min-h-[300px] place-items-center rounded-3xl border border-line bg-card px-6 text-center panel-3d">
              <div><p className="font-serif text-4xl italic">The ledger is empty.</p><p className="mt-2 max-w-sm text-mute">Seal your first exhibit — a genesis block is created automatically and every new entry links to the one before it.</p></div>
            </div>
          ) : (
            <ol className="mt-4 space-y-2">
              {[...ledger].reverse().map((e) => (
                <li key={e.i} className="grid gap-4 rounded-3xl border border-line bg-card p-4 transition-all duration-300 hover:bg-surface hover:shadow-[0_20px_40px_-25px_rgb(var(--shadow)/.6)] sm:grid-cols-[88px_1fr] md:p-5 panel-3d" style={{ animation: 'menuIn .5s cubic-bezier(.2,.7,.2,1) both' }}>
                  <div className="relative grid aspect-square place-items-center overflow-hidden rounded-2xl bg-gradient-to-br from-sand to-mist">
                    {e.thumb ? <img src={e.thumb} alt="" className="absolute inset-0 h-full w-full object-cover" /> : <span className="font-serif text-4xl italic text-ink/70">{e.kind === 'note' ? '“' : e.kind === 'genesis' ? '✳' : (e.name.split('.').pop() || 'file').slice(0, 4)}</span>}
                    <span className="absolute left-1.5 top-1.5 rounded-full bg-white/85 px-2 py-0.5 font-mono text-[9px]">#{String(e.i).padStart(3, '0')}</span>
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                      <p className="truncate text-[18px] font-medium tracking-[-0.015em]" title={e.name}>{e.name}</p>
                      <p className="font-mono text-[10px] uppercase tracking-widest text-mute">{e.kind === 'genesis' ? 'Genesis' : fmtBytes(e.size)} · {new Date(e.at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                    {e.note && <p className="mt-1 line-clamp-2 text-sm text-mute">{e.note}</p>}
                    <dl className="mt-2 space-y-1 font-mono text-[11px]">
                      <div className="flex gap-2"><dt className="w-14 shrink-0 text-mute">SHA-256</dt><dd className="min-w-0 truncate" title={e.sha}>{short(e.sha)}</dd><button onClick={() => copy(e.sha)} className="ml-auto shrink-0 text-keydeep hover:underline">{copied === e.sha ? 'Copied' : 'Copy'}</button></div>
                      <div className="flex gap-2"><dt className="w-14 shrink-0 text-mute">Prev</dt><dd className="truncate text-mute" title={e.prev}>{e.i === 0 ? 'genesis' : short(e.prev)}</dd></div>
                      <div className="flex gap-2"><dt className="w-14 shrink-0 text-mute">Block</dt><dd className="truncate" title={e.hash}>{short(e.hash)}</dd></div>
                    </dl>
                    {e.kind === 'file' && (
                      <div className="mt-3 flex items-center gap-3">
                        <label className="pill cursor-pointer border border-ink/20 px-3 py-1.5 text-[11px] hover:bg-fg hover:text-onfg">Re-check file
                          <input type="file" hidden onChange={(ev) => { const f = ev.target.files?.[0]; ev.target.value = ''; recheck(e, f) }} />
                        </label>
                        {checks[e.i] !== undefined && <span className={`font-mono text-[10px] uppercase tracking-widest ${checks[e.i] ? 'text-ok' : 'text-rust'}`}>{checks[e.i] ? '✓ Identical to sealed original' : '✕ File differs from sealed original'}</span>}
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </section>
  )
}
