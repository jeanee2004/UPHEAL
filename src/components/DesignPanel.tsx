import { useEffect, useRef, useState } from 'react'

type D = { theme: 'light' | 'dark'; bg: 'ink' | 'plain'; glass: 'soft' | 'rich'; icons: 'on' | 'off'; objets: 'on' | 'off' }
const DEFAULT: D = { theme: 'light', bg: 'ink', glass: 'soft', icons: 'on', objets: 'on' }
const KEY = 'upheal.design.v1'
const ROWS: { k: keyof D; label: string; hint: string; opts: [string, string][] }[] = [
  { k: 'theme', label: 'Theme', hint: 'Overall tone', opts: [['light', 'Light glass'], ['dark', 'Dark mono']] },
  { k: 'bg', label: 'Background', hint: 'Light theme only', opts: [['ink', 'Ink in water'], ['plain', 'Plain']] },
  { k: 'glass', label: 'Glass', hint: 'Blur & sheen', opts: [['soft', 'Soft'], ['rich', 'Rich']] },
  { k: 'icons', label: 'Refugee symbols', hint: 'Footprints, cases, life vests…', opts: [['on', 'On'], ['off', 'Off']] },
  { k: 'objets', label: 'Glass objets', hint: 'Between sections', opts: [['on', 'On'], ['off', 'Off']] },
]

/** floating control to try the design directions — choices persist in this browser */
export default function DesignPanel() {
  const [d, setD] = useState<D>(() => { try { return { ...DEFAULT, ...JSON.parse(localStorage.getItem(KEY) || '{}') } } catch { return DEFAULT } })
  const [open, setOpen] = useState(false)
  const box = useRef<HTMLDivElement>(null)

  useEffect(() => {
    Object.entries(d).forEach(([k, v]) => { document.documentElement.dataset[k] = v })
    document.querySelector('meta[name=theme-color]')?.setAttribute('content', d.theme === 'dark' ? '#0a0a0a' : '#e6e6e3')
    try { localStorage.setItem(KEY, JSON.stringify(d)) } catch { /* private mode */ }
  }, [d])
  useEffect(() => {
    if (!open) return
    const k = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    const c = (e: PointerEvent) => { if (!box.current?.contains(e.target as Node)) setOpen(false) }
    addEventListener('keydown', k); addEventListener('pointerdown', c)
    return () => { removeEventListener('keydown', k); removeEventListener('pointerdown', c) }
  }, [open])

  return (
    <div ref={box} style={{ bottom: 'max(1rem, env(safe-area-inset-bottom))' }} className="fixed left-4 z-[85] flex flex-col items-start gap-2 max-sm:left-auto max-sm:right-4 max-sm:items-end">
      {open && (
        <div role="dialog" aria-label="Design options" className="panel-3d w-[min(300px,calc(100vw-2rem))] rounded-3xl border border-line bg-card p-4" style={{ animation: 'menuIn .35s cubic-bezier(.2,.7,.2,1) both' }}>
          <p className="mb-3 font-mono text-[10px] uppercase tracking-widest text-keydeep">Design options</p>
          <div className="space-y-3.5">
            {ROWS.map((r) => (
              <div key={r.k}><p className="mb-1.5 flex items-baseline justify-between"><span className="text-[13px] font-medium">{r.label}</span><span className="text-[10.5px] text-mute">{r.hint}</span></p>
                <div role="group" aria-label={r.label} className="flex gap-1 rounded-full bg-fg/10 p-1">{r.opts.map(([v, l]) => <button key={v} aria-pressed={d[r.k] === v} onClick={() => setD({ ...d, [r.k]: v })} className={`flex-1 rounded-full px-2 py-1.5 text-[12px] transition-colors ${d[r.k] === v ? 'bg-fg text-onfg' : 'hover:bg-fg/10'}`}>{l}</button>)}</div></div>
            ))}
          </div>
          <button onClick={() => setD(DEFAULT)} className="mt-4 font-mono text-[10px] uppercase tracking-widest text-mute hover:text-ink">Reset to default</button>
        </div>
      )}
      <button onClick={() => setOpen((v) => !v)} aria-expanded={open} className="panel-3d flex items-center gap-2 rounded-full border border-line bg-card px-4 py-2.5 text-[12.5px] font-medium shadow-lg transition-transform hover:scale-105">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden><path d="M4 7h10M18 7h2M4 17h2M10 17h10" /><circle cx="16" cy="7" r="2" /><circle cx="8" cy="17" r="2" /></svg>Design
      </button>
    </div>
  )
}
