/**
 * Case tracker model — a lawyer's working view of each applicant.
 * The applicant fills in their own form; the lawyer tracks consultations, documents and section-by-section progress.
 */
import { SECTIONS } from './refugeeForm'
import countries from './countries.json'
import type { Article } from '../lib'

export type StageId = 'intake' | 'consult' | 'docs' | 'drafting' | 'review' | 'filed' | 'interview' | 'decision'
export type SecStatus = 'todo' | 'client' | 'review' | 'fix' | 'ok'
export type DocStatus = 'needed' | 'requested' | 'received' | 'translated' | 'sealed'
export type Owner = 'client' | 'lawyer' | 'third'

export type FileItem = Article & { note: string }
export type Consult = { id: string; date: string; mode: string; with: string; summary: string; nextText?: string; nextDate?: string }
export type Action = { id: string; text: string; due?: string; done: boolean }
export type Doc = { id: string; name: string; cat: string; status: DocStatus; owner: Owner; due?: string; note?: string }
export type Case = {
  id: string; alias: string; nationality: string; lang: string; interpreter: boolean; urgent: boolean; sample?: boolean
  stage: StageId; dob?: string; entry?: string; filed?: string; interview?: string
  consults: Consult[]; actions: Action[]; docs: Doc[]
  sections: Record<string, { status: SecStatus; note?: string }>
  rules: Record<string, boolean>; att: Record<string, boolean>
  notes: string; updated: string
  region?: string; files?: FileItem[]   // area inside the country · articles filed to this person's folder
}

export const STAGES: { id: StageId; en: string; ko: string }[] = [
  { id: 'intake', en: 'Intake', ko: '상담 접수' }, { id: 'consult', en: 'Consultation', ko: '상담 진행' }, { id: 'docs', en: 'Documents', ko: '자료 수집' },
  { id: 'drafting', en: 'Applicant filling', ko: '신청서 작성' }, { id: 'review', en: 'Lawyer review', ko: '검토' }, { id: 'filed', en: 'Filed', ko: '접수 완료' },
  { id: 'interview', en: 'Interview', ko: '면접·조사' }, { id: 'decision', en: 'Decision', ko: '결정' },
]
export const SEC_STATUS: { id: SecStatus; en: string; ko: string; cls: string; dot: string }[] = [
  { id: 'todo', en: 'Not started', ko: '미작성', cls: 'border-line text-mute', dot: 'bg-fg/20' },
  { id: 'client', en: 'Applicant filling', ko: '신청자 작성 중', cls: 'border-fg/40 text-ink', dot: 'bg-fg/60' },
  { id: 'review', en: 'Ready to review', ko: '검토 대기', cls: 'border-key/60 bg-key/10 text-keydeep', dot: 'bg-key' },
  { id: 'fix', en: 'Needs follow-up', ko: '보완 필요', cls: 'border-rust/60 bg-rust/10 text-rust', dot: 'bg-rust' },
  { id: 'ok', en: 'Verified', ko: '확인 완료', cls: 'border-ok/50 bg-ok/10 text-ok', dot: 'bg-ok' },
]
export const DOC_STATUS: { id: DocStatus; en: string; ko: string; cls: string }[] = [
  { id: 'needed', en: 'Needed', ko: '필요', cls: 'border-line text-mute' }, { id: 'requested', en: 'Requested', ko: '요청함', cls: 'border-key/60 bg-key/10 text-keydeep' },
  { id: 'received', en: 'Received', ko: '수령', cls: 'border-fg/40 text-ink' }, { id: 'translated', en: 'Translated', ko: '번역 완료', cls: 'border-fg/40 bg-fg/10 text-ink' },
  { id: 'sealed', en: 'Sealed in Vault', ko: 'Vault 봉인', cls: 'border-ok/50 bg-ok/10 text-ok' },
]
export const OWNERS: { id: Owner; label: string }[] = [{ id: 'client', label: 'Applicant' }, { id: 'lawyer', label: 'Lawyer' }, { id: 'third', label: 'Third party' }]
export const CONSULT_MODES = ['In person', 'Video call', 'Phone call', 'Interpreter-assisted', 'Message']

/** Suggested supporting documents — a starting list to pick from, not exhaustive and not legal advice. */
export const DOC_SUGGEST: { name: string; cat: string }[] = [
  { name: 'Passport / travel document (copy)', cat: 'Identity' }, { name: 'Alien Registration Card (copy)', cat: 'Identity' }, { name: 'Birth certificate / national ID', cat: 'Identity' },
  { name: 'Photo 35×45 mm (taken within 6 months)', cat: 'Filing' }, { name: 'Statement if passport / ARC cannot be shown', cat: 'Filing' }, { name: 'Korean/English translation of applicant’s writing', cat: 'Filing' },
  { name: 'Entry record / visa', cat: 'Korea status' }, { name: 'Proof of address in Korea', cat: 'Korea status' },
  { name: 'Marriage / divorce certificate', cat: 'Family' }, { name: 'Children’s documents / guardianship or travel consent', cat: 'Family' },
  { name: 'Summons / arrest warrant / court documents', cat: 'Persecution evidence' }, { name: 'Police report / complaint filed', cat: 'Persecution evidence' }, { name: 'Detention or release papers', cat: 'Persecution evidence' },
  { name: 'Membership / party card / organisation letter', cat: 'Persecution evidence' }, { name: 'Witness statement / affidavit', cat: 'Persecution evidence' }, { name: 'Photos / videos of incidents', cat: 'Persecution evidence' }, { name: 'Threat messages / emails', cat: 'Persecution evidence' },
  { name: 'Medical / forensic report', cat: 'Medical' }, { name: 'Psychological assessment', cat: 'Medical' },
  { name: 'Country-of-origin reports (UNHCR, NGOs)', cat: 'Country information' }, { name: 'News coverage of the applicant’s case', cat: 'Country information' },
]
/** Typical supporting material to gather per form section (suggestions). */
export const SEC_DOCS: Record<string, string[]> = {
  '1': ['Passport / ID', 'Birth certificate'], '2': ['Other nationality / residence papers'], '3': ['Marriage / divorce / death certificates'], '4': ['Family registry / birth certificates'],
  '5': ['Diplomas, transcripts'], '6': ['Employment letters, contracts'], '7': ['Military service record / discharge papers'], '8': ['Residence proofs, leases'],
  '9': ['Passport copy, or reason it is unavailable'], '10': ['Visa, entry stamp, tickets'], '11': ['ARC, address proof, medical notes'], '12': ['Exit stamps, tickets, transit records'],
  '13': ['Arrest warrants, summons, medical reports, witness statements, membership proof, country reports'], '15': ['Chronology built from the applicant’s own account'], '16': ['Photo, passport/ARC, translations, extra sheets'],
}

export const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
export const plus = (n: number) => { const d = new Date(); d.setDate(d.getDate() + n); return iso(d) }
export const todayIso = () => iso(new Date())
export const daysTo = (d?: string) => (d ? Math.round((new Date(d + 'T00:00:00').getTime() - new Date(todayIso() + 'T00:00:00').getTime()) / 864e5) : null)
export const uid = () => crypto.randomUUID()
export const ageOf = (dob?: string) => { if (!dob) return null; const d = new Date(dob + 'T00:00:00'); if (isNaN(+d)) return null; const n = new Date(); let a = n.getFullYear() - d.getFullYear(); if (n < new Date(n.getFullYear(), d.getMonth(), d.getDate())) a--; return a }

export const blankCase = (alias: string, x: Partial<Case> = {}): Case => ({
  id: uid(), alias, nationality: '', lang: '', interpreter: false, urgent: false, stage: 'intake',
  consults: [], actions: [], docs: [], sections: {}, rules: {}, att: {}, notes: '', updated: new Date().toISOString(), ...x,
})

/** Section range shown as “1.1–1.14” from the official form numbering. */
export const secRange = (n: string) => { const f = SECTIONS.find((s) => s.n === n)!.fields; const a = f[0].id.replace(/[a-z]$/, ''), b = f[f.length - 1].id.replace(/[a-z]$/, ''); return a === b ? a : `${a}–${b}` }

/* ---------------------------------------------------------------- derived */
export const secStatus = (c: Case, n: string): SecStatus => c.sections[n]?.status ?? 'todo'
export function appProgress(c: Case) {
  const t = SECTIONS.length, count = (s: SecStatus) => SECTIONS.filter((x) => secStatus(c, x.n) === s).length
  return { total: t, ok: count('ok'), review: count('review'), fix: count('fix'), client: count('client'), todo: count('todo'), pct: Math.round((count('ok') / t) * 100) }
}
export const docProgress = (c: Case) => { const got = c.docs.filter((d) => d.status !== 'needed' && d.status !== 'requested').length; return { got, total: c.docs.length, out: c.docs.length - got, pct: c.docs.length ? Math.round((got / c.docs.length) * 100) : 0 } }

export type Flag = { lvl: 'warn' | 'todo' | 'info'; text: string; tab?: 'overview' | 'consults' | 'docs' | 'application' }
export function flags(c: Case): Flag[] {
  const out: Flag[] = [], age = ageOf(c.dob), ap = appProgress(c), dp = docProgress(c), td = todayIso()
  if (age !== null && age < 19) out.push({ lvl: 'info', tab: 'application', text: age <= 9 ? `Applicant is ${age}: a parent may complete only “1. Personal Information” for a child of 9 or under and sign for them.` : `Applicant is ${age}: a child aged 10–18 completes the whole form themselves; the parent or child signs.` })
  if (c.entry) { const end = c.filed || td, gap = (+new Date(end) - +new Date(c.entry)) / 864e5; if (gap > 365) out.push({ lvl: 'warn', tab: 'application', text: `${c.filed ? 'Filed' : 'Filing'} is more than one year after entry (${c.entry}) — gather the reasons for 14.18.` }) }
  const iv = daysTo(c.interview)
  if (iv !== null && iv >= 0 && iv <= 14) out.push({ lvl: dp.out > 0 || ap.ok < ap.total ? 'warn' : 'info', tab: 'docs', text: `Interview in ${iv} day${iv === 1 ? '' : 's'}${dp.out > 0 ? ` — ${dp.out} document${dp.out > 1 ? 's' : ''} still outstanding` : ''}${ap.ok < ap.total ? `, ${ap.total - ap.ok} form section${ap.total - ap.ok > 1 ? 's' : ''} not verified` : ''}.` })
  if (ap.fix) out.push({ lvl: 'warn', tab: 'application', text: `${ap.fix} form section${ap.fix > 1 ? 's' : ''} need follow-up with the applicant.` })
  if (ap.review) out.push({ lvl: 'todo', tab: 'application', text: `${ap.review} form section${ap.review > 1 ? 's' : ''} ready for your review.` })
  const overdueDocs = c.docs.filter((d) => d.due && d.due < td && (d.status === 'needed' || d.status === 'requested'))
  if (overdueDocs.length) out.push({ lvl: 'warn', tab: 'docs', text: `${overdueDocs.length} document request${overdueDocs.length > 1 ? 's' : ''} overdue (${overdueDocs.slice(0, 2).map((d) => d.name).join('; ')}${overdueDocs.length > 2 ? '…' : ''}).` })
  const overdueAct = c.actions.filter((a) => !a.done && a.due && a.due < td)
  if (overdueAct.length) out.push({ lvl: 'warn', tab: 'overview', text: `${overdueAct.length} follow-up task${overdueAct.length > 1 ? 's' : ''} overdue.` })
  if (['filed', 'interview', 'decision'].includes(c.stage) && ap.ok < ap.total) out.push({ lvl: 'warn', tab: 'application', text: `Case is ${c.stage === 'filed' ? 'filed' : 'past filing'} but ${ap.total - ap.ok} form section${ap.total - ap.ok > 1 ? 's are' : ' is'} not marked verified.` })
  const last = c.consults.map((x) => x.date).sort().pop()
  if (['intake', 'consult', 'docs', 'drafting'].includes(c.stage)) {
    if (!last) out.push({ lvl: 'todo', tab: 'consults', text: 'No consultation logged yet.' })
    else if ((+new Date(td) - +new Date(last)) / 864e5 > 21) out.push({ lvl: 'todo', tab: 'consults', text: `No consultation in ${Math.round((+new Date(td) - +new Date(last)) / 864e5)} days.` })
  }
  if (c.interpreter && !c.lang.trim()) out.push({ lvl: 'todo', tab: 'overview', text: 'Interpreter needed — record the language.' })
  const rk = { warn: 0, todo: 1, info: 2 }
  return out.sort((a, b) => rk[a.lvl] - rk[b.lvl])
}

/** the soonest dated thing on this case */
export function nextItem(c: Case): { date: string; label: string } | null {
  const td = todayIso(), items: { date: string; label: string }[] = []
  if (c.interview && c.interview >= td) items.push({ date: c.interview, label: 'Interview' })
  c.consults.forEach((x) => x.nextDate && x.nextDate >= td && items.push({ date: x.nextDate, label: x.nextText || 'Consultation' }))
  c.actions.forEach((a) => !a.done && a.due && a.due >= td && items.push({ date: a.due, label: a.text }))
  c.docs.forEach((d) => d.due && d.due >= td && (d.status === 'needed' || d.status === 'requested') && items.push({ date: d.due, label: `Doc: ${d.name}` }))
  return items.sort((a, b) => a.date.localeCompare(b.date))[0] ?? null
}

/* ---------------------------------------------------------------- samples (clearly marked) */
function baseSamples(): Case[] {
  const S = (o: Record<string, SecStatus>) => Object.fromEntries(Object.entries(o).map(([k, v]) => [k, { status: v }]))
  const d = (name: string, cat: string, status: DocStatus, owner: Owner = 'client', due?: string): Doc => ({ id: uid(), name, cat, status, owner, due })
  return [
    blankCase('A-01', { sample: true, nationality: 'Myanmar', lang: 'Burmese', interpreter: true, urgent: false, stage: 'docs', dob: '1991-04-12', entry: plus(-430),
      consults: [{ id: uid(), date: plus(-16), mode: 'Interpreter-assisted', with: 'Burmese interpreter', summary: 'Background, timeline of arrest in 2021, reasons for late filing.', nextText: 'Collect warrant copy', nextDate: plus(5) }],
      actions: [{ id: uid(), text: 'Ask applicant to list reasons for waiting more than a year', due: plus(3), done: false }],
      docs: [d('Passport / travel document (copy)', 'Identity', 'received'), d('Summons / arrest warrant / court documents', 'Persecution evidence', 'requested', 'third', plus(5)), d('Medical / forensic report', 'Medical', 'needed', 'lawyer', plus(12)), d('Photo 35×45 mm (taken within 6 months)', 'Filing', 'received')],
      sections: S({ '1': 'ok', '2': 'ok', '3': 'ok', '4': 'review', '5': 'client', '6': 'client', '9': 'review', '13': 'client' }) }),
    blankCase('B-02', { sample: true, nationality: 'Sudan', lang: 'Arabic', interpreter: true, urgent: true, stage: 'interview', dob: '1988-09-03', entry: plus(-150), filed: plus(-70), interview: plus(9),
      consults: [{ id: uid(), date: plus(-4), mode: 'Video call', with: 'Arabic interpreter', summary: 'Interview preparation; walked through Section 13 chronology.', nextText: 'Mock interview', nextDate: plus(4) }],
      actions: [{ id: uid(), text: 'Confirm interpreter for the interview date', due: plus(2), done: false }],
      docs: [d('Passport / travel document (copy)', 'Identity', 'sealed'), d('Witness statement / affidavit', 'Persecution evidence', 'translated'), d('Country-of-origin reports (UNHCR, NGOs)', 'Country information', 'received', 'lawyer'), d('Psychological assessment', 'Medical', 'requested', 'third', plus(3))],
      sections: S({ ...Object.fromEntries(['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '16'].map((k) => [k, 'ok' as SecStatus])), '15': 'fix' }) }),
    blankCase('C-03', { sample: true, nationality: 'Ukraine', lang: 'Ukrainian', interpreter: false, stage: 'intake', dob: plus(-365 * 8 - 40), entry: plus(-60),
      consults: [], actions: [{ id: uid(), text: 'Book first consultation (applicant is a child — parent attends)', due: plus(2), done: false }], docs: [], sections: {} }),
  ]
}

/* ---------------------------------------------------------------- folders: continent › country › region › person */
export const CASES_KEY = 'upheal.cases.v2'
export type CaseStore = { cases: Case[]; view: 'folders' | 'table' | 'board' }
const byLen = [...countries.countries].sort((a, b) => b.name.length - a.name.length)
/** match a free-text nationality to a watchlist country (exact, then contained) */
export const canon = (nat: string) => { const n = nat.trim().toLowerCase(); return n ? byLen.find((c) => c.name.toLowerCase() === n) ?? byLen.find((c) => n.includes(c.name.toLowerCase())) : undefined }
export const continentOf = (nat: string) => canon(nat)?.continent ?? 'Unsorted'
export const COUNTRY_NAMES = countries.countries.map((c) => c.name)

const filesFor = (nat: string): FileItem[] => (countries.countries.find((c) => c.name === nat)?.articles ?? []).slice(0, 2).map((a) => ({ source: a.source, title: a.title, excerpt: '', url: a.url, image: '', date: a.date, region: continentOf(nat), topics: a.topics, note: '' }))
export function sampleCases(): Case[] {
  const reg: Record<string, string> = { 'A-01': 'Mandalay', 'B-02': 'Darfur', 'C-03': 'Kharkiv', 'D-04': 'Yangon' }
  const extra = blankCase('D-04', { sample: true, nationality: 'Myanmar', lang: 'Burmese', interpreter: true, stage: 'consult', dob: '1996-11-02' })
  return [...baseSamples(), extra].map((c) => ({ ...c, region: reg[c.alias], files: ['A-01', 'B-02'].includes(c.alias) ? filesFor(c.nationality) : [] }))
}
/** keeps the user's saved cases from v1 and opens on the new folder view */
export const casesInit = (): CaseStore => {
  try { const o = JSON.parse(localStorage.getItem('upheal.cases.v1') || 'null'); if (o?.cases) return { ...o, view: 'folders' } } catch { /* ignore */ }
  return { cases: sampleCases(), view: 'folders' }
}
/** file / un-file an article in one person's folder */
export const toggleFile = (s: CaseStore, id: string, f: Article): CaseStore => ({
  ...s, cases: s.cases.map((c) => (c.id !== id ? c : { ...c, updated: new Date().toISOString(), files: (c.files ?? []).some((x) => x.url === f.url) ? (c.files ?? []).filter((x) => x.url !== f.url) : [{ ...f, note: '' }, ...(c.files ?? [])] })),
})
export const patchFiles = (s: CaseStore, id: string, fn: (f: FileItem[]) => FileItem[]): CaseStore => ({ ...s, cases: s.cases.map((c) => (c.id === id ? { ...c, files: fn(c.files ?? []) } : c)) })
