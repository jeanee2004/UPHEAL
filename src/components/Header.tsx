import { useEffect, useState } from 'react'
import Glyph, { GlyphName } from './Glyph'

const ICONS: Record<string, GlyphName> = { reports: 'lantern', countries: 'boat', hearings: 'scales', vault: 'suitcase', cases: 'footprints', meeting: 'tent', briefing: 'radio' }
const LINKS = [
  { id: 'reports', label: 'Reports', sub: 'Uncover' },
  { id: 'countries', label: 'Countries', sub: 'Uphill' },
  { id: 'hearings', label: 'Hearings', sub: 'Step by step' },
  { id: 'vault', label: 'Vault', sub: 'Proof' },
  { id: 'cases', label: 'Cases', sub: 'Heal' },
  { id: 'meeting', label: 'Meeting', sub: 'Together' },
  { id: 'briefing', label: 'Briefing', sub: 'Listen' },
]

export default function Header() {
  const [open, setOpen] = useState(false)
  const [solid, setSolid] = useState(false)

  useEffect(() => {
    const on = () => setSolid(scrollY > innerHeight * 0.7)
    on(); addEventListener('scroll', on, { passive: true })
    return () => removeEventListener('scroll', on)
  }, [])
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    addEventListener('keydown', k)
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { removeEventListener('keydown', k); document.body.style.overflow = '' }
  }, [open])

  const go = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault(); setOpen(false)
    document.body.style.overflow = ''
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <>
      <header className={`fixed inset-x-0 top-0 z-[70] transition-colors duration-500 ${solid && !open ? 'bg-paper/85 text-ink backdrop-blur-md' : open ? 'text-ink' : 'text-cream'}`}>
        <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-5 md:px-8">
          <a href="#top" onClick={go('top')} aria-label="UPHEAL — back to top" className="-my-3 block py-3 pr-3"><img src="/logo.png" alt="UPHEAL" width="1400" height="378" className="h-8 w-auto md:h-9" /></a>
          <nav className="flex items-center gap-1 md:gap-2">
            <div className="hidden items-center lg:flex">
              {LINKS.map((l) => (
                <a key={l.id} href={`#${l.id}`} onClick={go(l.id)} className="group relative px-3 py-2 text-[15px]">
                  {l.label}
                  <span className="absolute inset-x-3 bottom-1 h-px origin-left scale-x-0 bg-current transition-transform duration-300 group-hover:scale-x-100" />
                </a>
              ))}
            </div>
            <button aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} onClick={() => setOpen((v) => !v)} className="ml-1 grid h-11 w-11 place-items-center rounded-full bg-fg shadow-sm transition-transform duration-300 hover:scale-110">
              <span className="flex gap-[5px]">
                <i className={`block h-[5px] w-[5px] rounded-full bg-onfg transition-transform duration-300 ${open ? 'translate-x-[5px] translate-y-0 rotate-45 scale-x-[3] scale-y-[.3]' : ''}`} />
                <i className={`block h-[5px] w-[5px] rounded-full bg-onfg transition-transform duration-300 ${open ? '-translate-x-[5px] -rotate-45 scale-x-[3] scale-y-[.3]' : ''}`} />
              </span>
            </button>
          </nav>
        </div>
      </header>

      <div className={`fixed inset-0 z-[65] transition-[clip-path] duration-700 [transition-timing-function:cubic-bezier(.7,0,.2,1)] ${open ? '[clip-path:circle(150%_at_calc(100%-40px)_36px)]' : '[clip-path:circle(0%_at_calc(100%-40px)_36px)] pointer-events-none'}`} aria-hidden={!open}>
        <div className="grain relative flex h-full flex-col justify-between bg-gradient-to-b from-[rgb(var(--paper))] via-[rgb(var(--paper))] to-[rgb(var(--paper))] px-5 pb-24 pt-24 md:px-8 md:pb-10">
          <ul className="flex flex-col gap-1">
            {LINKS.map((l, i) => (
              <li key={l.id} style={open ? { animation: `menuIn .8s ${0.25 + i * 0.08}s both cubic-bezier(.2,.7,.2,1)` } : undefined}>
                <a href={`#${l.id}`} onClick={go(l.id)} className="group flex items-baseline gap-4 font-serif text-[clamp(44px,9vw,104px)] italic leading-[1.02] transition-transform duration-500 hover:translate-x-4">
                  <span className="font-mono text-xs not-italic tracking-widest text-ink/50">0{i + 1}</span><Glyph name={ICONS[l.id]} className="h-7 w-7 self-center text-keydeep md:h-11 md:w-11" />
                  {l.label}<span className="ml-3 self-center font-mono text-[10px] not-italic uppercase tracking-[0.18em] text-mute">{l.sub}</span>
                </a>
              </li>
            ))}
          </ul>
          <img src="/logo.png" alt="" aria-hidden width="1400" height="378" className="mb-5 h-12 w-auto self-start object-contain" /><p className="max-w-sm text-sm text-ink/70">UPHEAL — uncovering pathways, healing every affected life. Headlines, excerpts and thumbnails belong to their publishers; every story links to the original report.</p>
        </div>
      </div>
    </>
  )
}
