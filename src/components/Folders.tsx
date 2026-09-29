import { canon, Case, continentOf, STAGES } from '../data/caseModel'
import { docProgress } from '../data/caseModel'
import Glyph from './Glyph'

const chev = <svg viewBox="0 0 10 10" className="h-2.5 w-2.5 shrink-0 transition-transform group-open/c:rotate-90 group-open/k:rotate-90 group-open/r:rotate-90" fill="currentColor"><path d="M2 1l6 4-6 4z" /></svg>
const sortDesc = <T,>(m: Map<string, T[]>) => [...m.entries()].sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0]))
const group = <T,>(xs: T[], key: (x: T) => string) => { const m = new Map<string, T[]>(); xs.forEach((x) => { const k = key(x); m.set(k, [...(m.get(k) ?? []), x]) }); return m }

/** continent › country › region › person — every person is a folder holding their filed articles */
export default function Folders({ cases, open }: { cases: Case[]; open: (id: string) => void }) {
  if (!cases.length) return <p className="border-t border-ink py-14 text-center text-mute">No folders yet — create a case to start one.</p>
  const tree = sortDesc(group(cases, (c) => continentOf(c.nationality)))
  return (
    <div>
      <p className="mb-3 flex flex-wrap items-center gap-x-2 font-mono text-[10px] uppercase tracking-widest text-mute">Continent <i className="not-italic text-keydeep">›</i> Country <i className="not-italic text-keydeep">›</i> Region <i className="not-italic text-keydeep">›</i> Person <span className="ml-2 normal-case tracking-normal">· articles you Select in Reports or Countries land in the person’s folder</span></p>
      {tree.map(([ct, inCt]) => (
        <details key={ct} open className="group/c border-t-2 border-ink py-4">
          <summary className="flex cursor-pointer list-none items-baseline gap-3 [&::-webkit-details-marker]:hidden">{chev}<span className="font-display text-[clamp(30px,4vw,48px)] font-extrabold uppercase leading-none">{ct}</span><span className="font-mono text-[10px] uppercase tracking-widest text-mute">{inCt.length} {inCt.length === 1 ? 'person' : 'people'}</span></summary>
          <div className="ml-1 mt-3 space-y-1 border-l border-line pl-4 md:ml-3 md:pl-7">
            {sortDesc(group(inCt, (c) => canon(c.nationality)?.name ?? (c.nationality.trim() || 'Nationality not set'))).map(([co, inCo]) => (
              <details key={co} open className="group/k py-2">
                <summary className="flex cursor-pointer list-none items-center gap-3 [&::-webkit-details-marker]:hidden">{chev}<span className="text-xl leading-none">{canon(co)?.flag ?? '🏳️'}</span><span className="text-[18px] font-bold">{co}</span><span className="font-mono text-[10px] uppercase tracking-widest text-mute">{inCo.length}</span></summary>
                <div className="ml-1 mt-2 space-y-1 border-l border-line pl-4 md:ml-3 md:pl-6">
                  {sortDesc(group(inCo, (c) => c.region?.trim() || 'Region not set')).map(([rg, inRg]) => (
                    <details key={rg} open className="group/r py-1.5">
                      <summary className="flex cursor-pointer list-none items-center gap-3 [&::-webkit-details-marker]:hidden">{chev}<span className="text-[15px] font-semibold text-ink/80">{rg}</span><span className="font-mono text-[10px] uppercase tracking-widest text-mute">{inRg.length}</span></summary>
                      <ul className="mt-2 space-y-2 pl-5 md:pl-8">
                        {inRg.map((c) => {
                          const files = c.files ?? [], dp = docProgress(c), st = STAGES.find((s) => s.id === c.stage)!
                          return (
                            <li key={c.id} className="border border-line bg-card">
                              <button onClick={() => open(c.id)} data-cursor="Open" className="flex w-full flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3 text-left transition-colors hover:bg-fg/5">
                                <Glyph name="footprints" className="h-5 w-5 text-keydeep" />
                                <b className="text-[17px] font-bold">{c.alias}</b>{c.urgent && <span className="bg-rust px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-widest text-white">Urgent</span>}{c.sample && <span className="border border-line px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-widest text-mute">Sample</span>}
                                <span className="font-mono text-[10px] uppercase tracking-widest text-mute">{st.en}</span>
                                <span className="ml-auto font-mono text-[10px] uppercase tracking-widest text-mute"><b className="text-ink">{files.length}</b> filed · <b className="text-ink">{dp.got}/{dp.total}</b> docs</span>
                              </button>
                              {files.length > 0 && (
                                <ul className="border-t border-line px-4 py-2">
                                  {files.slice(0, 4).map((f) => (
                                    <li key={f.url}><a href={f.url} target="_blank" rel="noopener noreferrer" className="flex items-baseline gap-3 py-1.5 text-[13.5px] hover:underline"><span className="w-[88px] shrink-0 font-mono text-[9.5px] uppercase tracking-widest text-mute">{f.source}</span><span className="truncate">{f.title}</span><span className="ml-auto shrink-0">↗</span></a></li>
                                  ))}
                                  {files.length > 4 && <li><button onClick={() => open(c.id)} className="py-1.5 font-mono text-[10px] uppercase tracking-widest text-keydeep hover:underline">+ {files.length - 4} more in this folder</button></li>}
                                </ul>
                              )}
                            </li>
                          )
                        })}
                      </ul>
                    </details>
                  ))}
                </div>
              </details>
            ))}
          </div>
        </details>
      ))}
    </div>
  )
}
