const ROW = ['Al Jazeera', 'BBC News', 'UN News', 'Original reporting', 'Linked at source']
import { Eyebrow } from './Glyph'

const CARDS = [
  { k: 'Real articles', t: 'Every card opens the original story.', d: 'Headlines, short excerpts and thumbnails come straight from the publishers’ public RSS feeds. We never republish full text.' },
  { k: 'Fresh on demand', t: 'Two commands pull the latest.', d: 'npm run news refreshes the headline feed; npm run countries refreshes the country watchlist. The watchlist and its risk tiers are editorial choices.' },
  { k: 'Your data stays yours', t: 'Hearings, evidence and case notes never leave the browser.', d: 'The calendar, custody ledger and case tracker are stored locally. Files are fingerprinted on your device with SHA-256 and are never uploaded.' },
  { k: 'Audio you can steer', t: 'Slow it down, skip ahead, jump to a topic.', d: 'The briefing player supports 0.5×–2× speed, ±10s, a draggable waveform, chapters and a clickable transcript.' },
]

export default function Sources() {
  return (
    <section id="sources" className="scroll-mt-16 border-t border-line py-24 md:py-32">
      <div className="mx-auto max-w-[1440px] px-5 md:px-8">
        <div className="reveal grid gap-6 md:grid-cols-2 md:items-end">
          <div>
            <Eyebrow n="08" label="About UPHEAL" icon="compass" />
            <h2 className="mt-4 font-display text-[clamp(56px,9vw,108px)] font-extrabold uppercase leading-[0.88]">Uncovering pathways,<br /><span className="font-serif text-[1.04em] font-normal normal-case italic tracking-normal">healing every affected life.</span></h2>
          </div>
          <p className="max-w-md text-[17px] leading-relaxed text-mute md:justify-self-end">UPHEAL carries the sound of “uphill” — climbing together — and the warmth of “heal”. It is a research and case-support tool, not a newsroom: it points to the people reporting from the ground.</p>
        </div>
        <div className="reveal mt-12 grid gap-4 md:grid-cols-2">
          {[['UP', 'Uphill — the steep road we climb together', 'Solidarity with people fighting for their rights: shared cases, shared calendars, shared proof.'], ['HEAL', 'Heal — restoring life and dignity', 'Public-interest legal support and system reform aimed at the recovery of every affected life.']].map(([k, t, d]) => (
            <div key={k} className="panel-3d flex items-start gap-5 rounded-3xl border border-line bg-card p-6 md:p-8"><span className="font-serif text-[64px] italic leading-[.8] text-keydeep md:text-[84px]">{k}</span><span><span className="block text-[19px] font-medium leading-snug tracking-[-0.01em]">{t}</span><span className="mt-2 block text-[14.5px] leading-relaxed text-mute">{d}</span></span></div>
          ))}
        </div>
        <div className="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {CARDS.map((c, i) => (
            <div key={c.k} className="reveal group rounded-3xl border border-line bg-card p-8 transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_30px_60px_-30px_rgb(var(--shadow)/.6)] panel-3d" style={{ ['--d' as string]: `${i * 90}ms` }}>
              <p className="eyebrow">{c.k}</p>
              <h3 className="mt-6 text-2xl font-medium leading-tight tracking-[-0.02em]">{c.t}</h3>
              <p className="mt-4 text-[15px] leading-relaxed text-mute">{c.d}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-24 overflow-hidden border-y border-line py-6" aria-hidden>
        <div className="flex w-max animate-[marquee_28s_linear_infinite] whitespace-nowrap hover:[animation-play-state:paused]">
          {[0, 1].map((k) => (
            <div key={k} className="flex shrink-0 items-center">
              {ROW.map((w, i) => (
                <span key={i} className="flex items-center">
                  <span className={`px-8 text-[clamp(44px,7vw,110px)] leading-none tracking-[-0.04em] ${i % 2 ? 'font-serif italic' : 'font-medium'}`}>{w}</span>
                  <span className="text-3xl text-key">✳</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
