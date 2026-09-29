/** Symbols of displacement and shelter — drawn as one consistent line-icon family. Hidden globally when "Refugee symbols" is off. */
const P: Record<string, React.ReactNode> = {
  footprints: (<><g transform="translate(8.6 8.8) rotate(-10)"><ellipse cx="0" cy="-2.9" rx="2.1" ry="3.3" /><ellipse cx="0" cy="3.3" rx="1.7" ry="2.1" /></g><g transform="translate(15.6 15.6) rotate(10)"><ellipse cx="0" cy="-2.9" rx="2.1" ry="3.3" /><ellipse cx="0" cy="3.3" rx="1.7" ry="2.1" /></g></>),
  suitcase: (<><rect x="3.5" y="7.5" width="17" height="12" rx="2.2" /><path d="M9 7.5V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1.5M8 7.5v12M16 7.5v12" /></>),
  backpack: (<><path d="M7 20.5V10a5 5 0 0 1 10 0v10.5a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1Z" /><path d="M9.5 5V4a2.5 2.5 0 0 1 5 0v1" /><rect x="9" y="13.5" width="6" height="4.5" rx="1.2" /></>),
  vest: (<><path d="M8 3.5 5.5 6v13a1.5 1.5 0 0 0 1.5 1.5h3.2V11.5L12 14l1.8-2.5v9H17a1.5 1.5 0 0 0 1.5-1.5V6L16 3.5 13.8 6 12 5 10.2 6 8 3.5Z" /><path d="M5.5 15.5h4.7M13.8 15.5h4.7" /></>),
  boat: (<><path d="M3 15.5h18l-3 4H6l-3-4Z" /><path d="M12 4l6.5 10H12V4ZM11 7l-4.5 7H11V7Z" /></>),
  tent: (<><path d="M3 19.5 12 4l9 15.5H3Z" /><path d="M12 4v15.5M9.2 19.5 12 13.5l2.8 6" /></>),
  lantern: (<><path d="M9 3.5h6M10 3.5V5M14 3.5V5" /><path d="M7.5 8a2 2 0 0 1 2-2h5a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-5a2 2 0 0 1-2-2V8Z" /><path d="M9.5 19v1.5h5V19M12 9.5v6" /></>),
  scales: (<><path d="M12 4v15M7 19.5h10M5 7.5h14" /><path d="M5 7.5 2.5 13.5a2.7 2.7 0 0 0 5 0L5 7.5ZM19 7.5l-2.5 6a2.7 2.7 0 0 0 5 0L19 7.5Z" /></>),
  radio: (<><rect x="3.5" y="8.5" width="17" height="11" rx="2.2" /><path d="M8 8.5 17 3.5" /><circle cx="9" cy="14" r="2.3" /><path d="M14.5 12.5H18M14.5 15.5H18" /></>),
  compass: (<><circle cx="12" cy="12" r="8.5" /><path d="m15.5 8.5-2 5-5 2 2-5 5-2Z" /></>),
  lifering: (<><circle cx="12" cy="12" r="8.5" /><circle cx="12" cy="12" r="3.6" /><path d="m6 6 3.4 3.4M18 6l-3.4 3.4M6 18l3.4-3.4M18 18l-3.4-3.4" /></>),
}
export type GlyphName = keyof typeof P

export default function Glyph({ name, className = 'h-5 w-5' }: { name: GlyphName; className?: string }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden className={`glyph shrink-0 ${className}`}>{P[name]}</svg>
}

/** glass roundel holding a symbol */
export function GlyphBadge({ name }: { name: GlyphName }) {
  return <span className="glyph panel-3d grid h-10 w-10 shrink-0 place-items-center rounded-full border border-line bg-card text-keydeep"><Glyph name={name} className="h-[18px] w-[18px]" /></span>
}

/** numbered section label with its symbol */
export function Eyebrow({ n, label, icon }: { n: string; label: string; icon: GlyphName }) {
  return <p className="eyebrow flex items-center gap-3"><GlyphBadge name={icon} /><span>{n} — {label}</span></p>
}
