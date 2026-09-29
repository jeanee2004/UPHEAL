import { SECTIONS } from '../data/refugeeForm'
import { appProgress, Case, daysTo, SEC_STATUS, secStatus, STAGES } from '../data/caseModel'

export const input = 'w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-[14px] outline-none transition focus:border-ink'
export const labelCls = 'mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-mute'

/** one small square per form section, coloured by review status — the whole application at a glance */
export function SecCells({ c, size = 'h-2.5 w-2.5' }: { c: Case; size?: string }) {
  return (
    <span className="flex flex-wrap gap-[3px]" role="img" aria-label={`Application: ${appProgress(c).ok} of ${SECTIONS.length} sections verified`}>
      {SECTIONS.map((s) => { const st = SEC_STATUS.find((x) => x.id === secStatus(c, s.n))!; return <i key={s.n} title={`§${s.n} ${s.en} — ${st.en}`} className={`block rounded-[2px] ${size} ${st.dot}`} /> })}
    </span>
  )
}
export const Meter = ({ pct, tone = 'bg-key' }: { pct: number; tone?: string }) => (
  <span className="block h-1.5 w-full overflow-hidden rounded-full bg-fg/10"><i className={`block h-full rounded-full ${tone}`} style={{ width: `${pct}%` }} /></span>
)
export function StageChip({ c }: { c: Case }) {
  const i = STAGES.findIndex((s) => s.id === c.stage), s = STAGES[i]
  return <span className="inline-flex items-center gap-2 rounded-full border border-line bg-fg/5 px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest"><i className="font-normal text-keydeep">{i + 1}/{STAGES.length}</i>{s.en}</span>
}
export function RelDate({ d }: { d: string }) {
  const n = daysTo(d)!
  const t = n === 0 ? 'today' : n === 1 ? 'tomorrow' : n > 0 ? `in ${n} d` : `${-n} d ago`
  return <span className={n < 0 ? 'text-rust' : n <= 3 ? 'text-keydeep' : 'text-mute'}>{t}</span>
}
