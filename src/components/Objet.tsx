/**
 * Glass objets that sit between sections — small sculptures rendered in SVG (refraction, specular highlights, a warm
 * caustic in the brand yellow). They float, and drift slightly with the cursor. Hidden when "Glass objets" is off.
 */
export type ObjetKind = 'orb' | 'drop' | 'cairn' | 'ring' | 'boat' | 'case'

const Defs = ({ k }: { k: string }) => (
  <defs>
    <linearGradient id={`${k}-body`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#fff" stopOpacity=".82" /><stop offset=".5" stopColor="#dfe3e6" stopOpacity=".26" /><stop offset="1" stopColor="#8d949a" stopOpacity=".42" /></linearGradient>
    <radialGradient id={`${k}-hi`} cx="28%" cy="22%" r="55%"><stop offset="0" stopColor="#fff" stopOpacity=".98" /><stop offset="1" stopColor="#fff" stopOpacity="0" /></radialGradient>
    <radialGradient id={`${k}-warm`} cx="50%" cy="104%" r="72%"><stop offset="0" stopColor="#EDB021" stopOpacity=".7" /><stop offset="1" stopColor="#EDB021" stopOpacity="0" /></radialGradient>
    <filter id={`${k}-sh`} x="-30%" y="-100%" width="160%" height="300%"><feGaussianBlur stdDeviation="7" /></filter>
    <filter id={`${k}-ink`} x="-40%" y="-40%" width="180%" height="180%"><feTurbulence type="fractalNoise" baseFrequency=".035 .05" numOctaves="3" seed="5" result="t" /><feDisplacementMap in="SourceGraphic" in2="t" scale="34" /><feGaussianBlur stdDeviation="2.2" /></filter>
  </defs>
)
const Shadow = ({ k, cx = 100, cy = 176, rx = 62, ry = 8 }: { k: string; cx?: number; cy?: number; rx?: number; ry?: number }) => <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="rgb(var(--shadow))" opacity=".28" filter={`url(#${k}-sh)`} />
const rim = { fill: 'none', stroke: '#fff', strokeOpacity: 0.85, strokeWidth: 1.6 }

function Art({ kind }: { kind: ObjetKind }) {
  const k = `o-${kind}`
  if (kind === 'orb') return (
    <svg viewBox="0 0 200 190" className="h-full w-full overflow-visible"><Defs k={k} /><Shadow k={k} />
      <clipPath id={`${k}-c`}><circle cx="100" cy="92" r="72" /></clipPath>
      <g clipPath={`url(#${k}-c)`}><circle cx="100" cy="92" r="72" fill="#f4f5f6" opacity=".35" /><circle cx="108" cy="104" r="30" fill="#0a0a0c" filter={`url(#${k}-ink)`} /><circle cx="86" cy="80" r="11" fill="#0a0a0c" opacity=".55" filter={`url(#${k}-ink)`} /><circle cx="100" cy="92" r="72" fill={`url(#${k}-warm)`} /></g>
      <circle cx="100" cy="92" r="72" fill={`url(#${k}-body)`} opacity=".7" /><circle cx="100" cy="92" r="72" {...rim} /><ellipse cx="76" cy="56" rx="26" ry="16" fill={`url(#${k}-hi)`} transform="rotate(-28 76 56)" /><circle cx="140" cy="132" r="4" fill="#fff" opacity=".8" /></svg>)
  if (kind === 'drop') return (
    <svg viewBox="0 0 200 190" className="h-full w-full overflow-visible"><Defs k={k} /><Shadow k={k} rx={50} />
      <path id={`${k}-p`} d="M100 16C100 16 48 84 48 122a52 52 0 0 0 104 0C152 84 100 16 100 16Z" fill={`url(#${k}-body)`} /><clipPath id={`${k}-c`}><path d="M100 16C100 16 48 84 48 122a52 52 0 0 0 104 0C152 84 100 16 100 16Z" /></clipPath>
      <g clipPath={`url(#${k}-c)`}><circle cx="104" cy="126" r="20" fill="#0a0a0c" opacity=".9" filter={`url(#${k}-ink)`} /><rect x="40" y="90" width="120" height="90" fill={`url(#${k}-warm)`} /></g>
      <path d="M100 16C100 16 48 84 48 122a52 52 0 0 0 104 0C152 84 100 16 100 16Z" {...rim} /><ellipse cx="78" cy="98" rx="10" ry="22" fill={`url(#${k}-hi)`} transform="rotate(14 78 98)" /></svg>)
  if (kind === 'cairn') return (
    <svg viewBox="0 0 200 190" className="h-full w-full overflow-visible"><Defs k={k} /><Shadow k={k} rx={70} />
      {[[100, 150, 66, 24, 0], [96, 118, 50, 21, -4], [103, 92, 36, 17, 6], [99, 70, 22, 13, -8]].map(([cx, cy, rx, ry, rot], i) => (
        <g key={i} transform={`rotate(${rot} ${cx} ${cy})`}><ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={`url(#${k}-body)`} /><ellipse cx={cx} cy={cy} rx={rx} ry={ry} {...rim} /><ellipse cx={cx - rx * 0.32} cy={cy - ry * 0.4} rx={rx * 0.34} ry={ry * 0.3} fill={`url(#${k}-hi)`} />{i === 0 && <ellipse cx={cx} cy={cy + ry * 0.55} rx={rx * 0.8} ry={ry * 0.4} fill="#EDB021" opacity=".35" />}</g>
      ))}</svg>)
  if (kind === 'ring') return (
    <svg viewBox="0 0 200 190" className="h-full w-full overflow-visible"><Defs k={k} /><Shadow k={k} rx={68} />
      <g transform="translate(100 92)"><circle r="50" fill="none" stroke={`url(#${k}-body)`} strokeWidth="42" /><circle r="50" fill="none" stroke="#EDB021" strokeOpacity=".72" strokeWidth="42" strokeDasharray="39.27 39.27" transform="rotate(-20)" />
        <circle r="71" {...rim} /><circle r="29" {...rim} /><path d="M-58 -34A68 68 0 0 1 -10 -66" fill="none" stroke="#fff" strokeOpacity=".95" strokeWidth="5" strokeLinecap="round" /><path d="M28 60A62 62 0 0 0 58 30" fill="none" stroke="#fff" strokeOpacity=".5" strokeWidth="3" strokeLinecap="round" /></g></svg>)
  if (kind === 'boat') return (
    <svg viewBox="0 0 200 190" className="h-full w-full overflow-visible"><Defs k={k} /><Shadow k={k} cy={172} rx={78} />
      <ellipse cx="100" cy="150" rx="88" ry="6" fill="none" stroke="#fff" strokeOpacity=".7" strokeWidth="1.4" /><ellipse cx="100" cy="158" rx="64" ry="4" fill="none" stroke="#fff" strokeOpacity=".4" strokeWidth="1.2" />
      {[['M100 22L160 112H100Z', 1], ['M91 46L44 112H91Z', 0.8], ['M22 120H178L150 148H50Z', 1]].map(([d, o], i) => (
        <g key={i}><path d={d as string} fill={`url(#${k}-body)`} opacity={o as number} /><path d={d as string} {...rim} /></g>
      ))}
      <path d="M22 120H178L150 148H50Z" fill={`url(#${k}-warm)`} opacity=".8" /><path d="M100 22V112M100 112 91 46" stroke="#fff" strokeOpacity=".55" strokeWidth="1.2" fill="none" /><path d="M40 122H160" stroke="#fff" strokeOpacity=".8" strokeWidth="2" strokeLinecap="round" /></svg>)
  return (
    <svg viewBox="0 0 200 190" className="h-full w-full overflow-visible"><Defs k={k} /><Shadow k={k} rx={74} />
      <path d="M78 58V46a10 10 0 0 1 10-10h24a10 10 0 0 1 10 10v12" fill="none" stroke="#fff" strokeOpacity=".9" strokeWidth="7" /><path d="M78 58V46a10 10 0 0 1 10-10h24a10 10 0 0 1 10 10v12" fill="none" stroke="#8d949a" strokeOpacity=".5" strokeWidth="2" />
      <rect x="30" y="56" width="140" height="106" rx="16" fill={`url(#${k}-body)`} /><rect x="30" y="56" width="140" height="106" rx="16" {...rim} /><rect x="70" y="56" width="14" height="106" fill="#EDB021" opacity=".62" /><rect x="116" y="56" width="14" height="106" fill="#EDB021" opacity=".62" />
      <rect x="30" y="56" width="140" height="106" rx="16" fill={`url(#${k}-warm)`} opacity=".7" /><ellipse cx="62" cy="80" rx="26" ry="12" fill={`url(#${k}-hi)`} transform="rotate(-12 62 80)" /></svg>)
}

const LABEL: Record<ObjetKind, string> = { orb: 'Ink, held', drop: 'One drop', cairn: 'A marker for those who follow', ring: 'Within reach', boat: 'Crossing', case: 'All that could be carried' }

export default function Objet({ kind, n }: { kind: ObjetKind; n: string }) {
  return (
    <div aria-hidden className="objet-band pointer-events-none relative mx-auto flex max-w-[1440px] items-center gap-4 px-5 py-14 md:gap-8 md:px-8 md:py-24">
      <span className="h-px flex-1 bg-gradient-to-r from-transparent to-[rgb(var(--ink)/.22)]" />
      <div className="relative h-36 w-36 shrink-0 md:h-52 md:w-52" style={{ transform: 'translate3d(calc(var(--px, 0) * 18px), calc(var(--py, 0) * 10px), 0) rotate(calc(var(--px, 0) * 5deg))', transition: 'transform .5s cubic-bezier(.2,.7,.2,1)' }}>
        <div className="h-full w-full [animation:bob_7s_ease-in-out_infinite]"><Art kind={kind} /></div>
      </div>
      <span className="flex flex-1 items-center gap-4"><span className="h-px flex-1 bg-gradient-to-l from-transparent to-[rgb(var(--ink)/.22)]" /><span className="hidden whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.18em] text-mute md:block">Objet {n} · {LABEL[kind]}</span></span>
    </div>
  )
}
