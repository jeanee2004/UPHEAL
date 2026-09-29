import { ATTACHMENTS, RULES, SECTIONS } from './refugeeForm'
import { appProgress, Case, DOC_STATUS, flags, OWNERS, SEC_STATUS, secRange, secStatus, STAGES, docProgress, nextItem } from './caseModel'

const stage = (c: Case) => STAGES.find((s) => s.id === c.stage)!
const owner = (o: string) => OWNERS.find((x) => x.id === o)?.label ?? o
const dstat = (s: string) => DOC_STATUS.find((x) => x.id === s)?.en ?? s
const sstat = (s: string) => SEC_STATUS.find((x) => x.id === s)?.en ?? s

export function caseSheetMd(c: Case): string {
  const ap = appProgress(c), dp = docProgress(c), nx = nextItem(c), fl = flags(c)
  const L: string[] = [`# Case status — ${c.alias}${c.sample ? ' (sample)' : ''}`, '',
    `- Stage: **${stage(c).en}** (${stage(c).ko})${c.urgent ? ' · URGENT' : ''}`, `- Nationality: ${c.nationality || '—'} · Language: ${c.lang || '—'}${c.interpreter ? ' (interpreter)' : ''}`,
    `- Date of birth: ${c.dob || '—'} · Entry into Korea (10.7): ${c.entry || '—'} · Filed: ${c.filed || '—'} · Interview: ${c.interview || '—'}`,
    `- Application form: ${ap.ok}/${ap.total} sections verified · ${ap.review} to review · ${ap.fix} need follow-up`, `- Documents: ${dp.got}/${dp.total} in hand`, `- Next: ${nx ? `${nx.date} — ${nx.label}` : '—'}`, '']
  if (fl.length) L.push('## Needs attention', ...fl.map((f) => `- [${f.lvl}] ${f.text}`), '')
  L.push('## Consultations', ...(c.consults.length ? [...c.consults].sort((a, b) => b.date.localeCompare(a.date)).map((x) => `- **${x.date}** · ${x.mode}${x.with ? ` · ${x.with}` : ''} — ${x.summary}${x.nextText || x.nextDate ? ` _(next: ${x.nextText || ''} ${x.nextDate || ''})_` : ''}`) : ['_None logged._']), '')
  L.push('## Documents', '', '| Document | Category | Owner | Status | Due |', '|---|---|---|---|---|', ...(c.docs.length ? c.docs.map((d) => `| ${d.name} | ${d.cat} | ${owner(d.owner)} | ${dstat(d.status)} | ${d.due || ''} |`) : ['| _none_ | | | | |']), '')
  L.push('## Application form (별지 제1호서식)', '', '| § | Section | Questions | Status | Note |', '|---|---|---|---|---|', ...SECTIONS.map((s) => `| ${s.n} | ${s.en} / ${s.ko} | ${secRange(s.n)} | ${sstat(secStatus(c, s.n))} | ${c.sections[s.n]?.note || ''} |`), '')
  L.push('## Briefing checklist (explained to applicant)', ...RULES.flatMap((g) => g.items).map((r) => `- [${c.rules[r.id] ? 'x' : ' '}] ${r.en}`), '', '## Attachments', ...ATTACHMENTS.map((r) => `- [${c.att[r.id] ? 'x' : ' '}] ${r.en}`))
  if (c.notes.trim()) L.push('', '## Notes', c.notes.trim())
  return L.join('\n') + '\n'
}

const esc = (t: string) => t.replace(/[&<>"]/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[m]!))
export function caseSheetHtml(c: Case): string {
  const md = caseSheetMd(c).split('\n'), out: string[] = []
  let table: string[] = []
  const flush = () => { if (!table.length) return; const rows = table.filter((r) => !/^\|[-|]+\|$/.test(r)).map((r) => r.slice(1, -1).split('|').map((x) => x.trim())); out.push(`<table>${rows.map((r, i) => `<tr>${r.map((x) => (i ? `<td>${esc(x)}</td>` : `<th>${esc(x)}</th>`)).join('')}</tr>`).join('')}</table>`); table = [] }
  for (const l of md) {
    if (l.startsWith('|')) { table.push(l); continue }
    flush()
    const fmt = (t: string) => esc(t).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/_(.+?)_/g, '<i>$1</i>')
    if (l.startsWith('# ')) out.push(`<h1>${fmt(l.slice(2))}</h1>`); else if (l.startsWith('## ')) out.push(`<h2>${fmt(l.slice(3))}</h2>`)
    else if (l.startsWith('- ')) out.push(`<div class="li">• ${fmt(l.slice(2))}</div>`); else if (l.trim()) out.push(`<p>${fmt(l)}</p>`)
  }
  flush()
  return `<!doctype html><meta charset="utf-8"><title>Case status — ${esc(c.alias)}</title><style>body{font:13px/1.5 -apple-system,'Apple SD Gothic Neo',sans-serif;max-width:820px;margin:28px auto;padding:0 20px;color:#111}h1{font-size:21px}h2{font-size:14px;margin:22px 0 6px;border-bottom:2px solid #111;padding-bottom:3px}table{border-collapse:collapse;width:100%;font-size:11.5px;margin:6px 0}td,th{border:1px solid #999;padding:4px 6px;text-align:left;vertical-align:top}.li{margin:2px 0}p{margin:4px 0}</style>${out.join('')}`
}

export function casesCsv(cases: Case[]): string {
  const q = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`
  const head = ['Alias', 'Nationality', 'Language', 'Interpreter', 'Urgent', 'Stage', 'DOB', 'Entry (10.7)', 'Filed', 'Interview', 'Sections verified', 'Sections to review', 'Sections need follow-up', 'Docs in hand', 'Docs total', 'Next date', 'Next item', 'Warnings', 'To-dos']
  const rows = cases.map((c) => { const ap = appProgress(c), dp = docProgress(c), nx = nextItem(c), fl = flags(c); return [c.alias, c.nationality, c.lang, c.interpreter ? 'yes' : 'no', c.urgent ? 'yes' : 'no', stage(c).en, c.dob || '', c.entry || '', c.filed || '', c.interview || '', ap.ok, ap.review, ap.fix, dp.got, dp.total, nx?.date || '', nx?.label || '', fl.filter((f) => f.lvl === 'warn').length, fl.filter((f) => f.lvl === 'todo').length].map(q).join(',') })
  return '﻿' + [head.map(q).join(','), ...rows].join('\n')
}
