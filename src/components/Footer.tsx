export default function Footer({ updated }: { updated: string }) {
  return (
    <footer className="relative overflow-hidden border-t border-line bg-deep px-5 pb-6 pt-20 text-white md:px-8">
      <div className="mx-auto grid max-w-[1440px] gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
        <p className="max-w-md text-lg leading-snug text-white/80"><b className="mb-3 block font-serif text-[30px] font-normal italic leading-none text-key">Uncovering pathways, healing every affected life.</b>Headlines, excerpts and thumbnails belong to their publishers — Al Jazeera, BBC News and UN News. UPHEAL links to the original reporting.</p>
        <div className="space-y-2 text-sm">
          <p className="font-mono text-[11px] uppercase tracking-widest text-white/40">Sections</p>
          {['reports', 'countries', 'hearings', 'vault', 'cases', 'meeting', 'briefing', 'sources'].map((s) => <a key={s} href={`#${s}`} className="block py-1.5 capitalize text-white/80 transition-colors hover:text-key">{s}</a>)}
        </div>
        <div className="space-y-2 text-sm">
          <p className="font-mono text-[11px] uppercase tracking-widest text-white/40">Publishers</p>
          <a className="block py-1.5 text-white/80 hover:text-key" href="https://www.aljazeera.com" target="_blank" rel="noopener noreferrer">aljazeera.com ↗</a>
          <a className="block py-1.5 text-white/80 hover:text-key" href="https://www.bbc.com/news" target="_blank" rel="noopener noreferrer">bbc.com/news ↗</a>
          <a className="block py-1.5 text-white/80 hover:text-key" href="https://news.un.org" target="_blank" rel="noopener noreferrer">news.un.org ↗</a>
        </div>
      </div>
      <img src="/logo.png" alt="UPHEAL" width="1400" height="378" className="mx-auto mt-16 w-full max-w-[880px] select-none" />
      <div className="mt-6 flex flex-wrap justify-between gap-2 font-mono text-[11px] uppercase tracking-widest text-white/40">
        <span>© 2026 UPHEAL</span><span>Feed updated {updated}</span>
      </div>
    </footer>
  )
}
