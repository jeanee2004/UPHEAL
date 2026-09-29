import { useMemo, useState } from 'react'
import { Eyebrow } from './Glyph'
import { useStored } from '../lib'

type Contact = { id: string; name: string; email: string; role: string }
type Form = { matter: string; purpose: string; date: string; time: string; duration: number; format: string; place: string; agenda: string; lang: 'en' | 'ko'; sender: string; chat: string; bcc: boolean; conf: boolean; to: string[] }

const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
const plus = (n: number) => { const d = new Date(); d.setDate(d.getDate() + n); return iso(d) }

const PURPOSES = [
  { id: 'strategy',  label: 'Case strategy',      en: 'to discuss the strategy for the matter',                  ko: '사건 전략 논의를 위해' },
  { id: 'witness',   label: 'Witness preparation', en: 'to prepare for witness testimony',                        ko: '증인 신문 준비를 위해' },
  { id: 'client',    label: 'Client briefing',     en: 'to update you on the current status of the matter',       ko: '사건 진행 상황을 공유드리기 위해' },
  { id: 'expert',    label: 'Expert consultation', en: 'to consult on expert evidence',                           ko: '전문가 자문을 구하기 위해' },
  { id: 'coalition', label: 'Coalition call',      en: 'to coordinate with partner organisations',                ko: '협력 기관 간 조율을 위해' },
]
const FORMATS = ['Video call', 'In person', 'Phone call']
const FORMAT_KO: Record<string, string> = { 'Video call': '화상 회의', 'In person': '대면', 'Phone call': '전화' }

/* group-chat providers: only https links are accepted */
const PROVIDERS: [RegExp, string][] = [
  [/(^|\.)open\.kakao\.com$/, 'KakaoTalk'], [/(^|\.)signal\.group$/, 'Signal'], [/(^|\.)chat\.whatsapp\.com$/, 'WhatsApp'],
  [/(^|\.)t\.me$/, 'Telegram'], [/(^|\.)slack\.com$/, 'Slack'], [/(^|\.)(teams\.microsoft\.com|teams\.live\.com)$/, 'Microsoft Teams'],
  [/(^|\.)(discord\.gg|discord\.com)$/, 'Discord'], [/(^|\.)line\.me$/, 'LINE'], [/(^|\.)zoom\.us$/, 'Zoom'], [/(^|\.)meet\.google\.com$/, 'Google Meet'],
]
const parseChat = (raw: string): { ok: boolean; provider?: string; url?: string; err?: string } => {
  const v = raw.trim(); if (!v) return { ok: false }
  try {
    const u = new URL(v)
    if (u.protocol !== 'https:') return { ok: false, err: 'Only https:// links are accepted.' }
    return { ok: true, url: u.toString(), provider: PROVIDERS.find(([rx]) => rx.test(u.hostname))?.[1] ?? 'Group chat' }
  } catch { return { ok: false, err: 'That does not look like a valid link.' } }
}

const EMAIL = /^[^\s@,;]+@[^\s@,;]+\.[^\s@,;]+$/
const tz = () => new Intl.DateTimeFormat('en', { timeZoneName: 'short' }).formatToParts(new Date()).find((p) => p.type === 'timeZoneName')?.value ?? ''
const when = (f: Form) => {
  const d = new Date(`${f.date}T${f.time}`)
  if (isNaN(+d)) return ''
  return d.toLocaleString(f.lang === 'ko' ? 'ko-KR' : 'en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) + ` (${tz()})`
}
const hoursUntil = (f: Form) => (new Date(`${f.date}T${f.time}`).getTime() - Date.now()) / 36e5

type Tpl = { id: string; label: string; desc: string; subject: string; body: string }
function templates(f: Form, contacts: Contact[], chat: ReturnType<typeof parseChat>): Tpl[] {
  const en = f.lang === 'en', p = PURPOSES.find((x) => x.id === f.purpose)!, w = when(f)
  const names = f.to.map((e) => contacts.find((c) => c.email.toLowerCase() === e.toLowerCase())?.name).filter(Boolean) as string[]
  const hi = en ? (names.length === 1 ? `Dear ${names[0]},` : 'Dear all,') : (names.length === 1 ? `${names[0]}님께,` : '수신자 여러분께,')
  const fmt = en ? f.format : FORMAT_KO[f.format]
  const place = f.place.trim()
  const agenda = f.agenda.split('\n').map((l) => l.trim()).filter(Boolean).map((l) => `  • ${l.replace(/^[-•*]\s*/, '')}`).join('\n')
  const matter = f.matter.trim() || (en ? '[matter]' : '[사건명]')
  const short = new Date(`${f.date}T${f.time}`).toLocaleDateString(en ? 'en-GB' : 'ko-KR', { day: 'numeric', month: 'short' })
  const sig = f.sender.trim() || (en ? '[Your name]' : '[성명]')
  const conf = f.conf ? (en ? '\n\n—\nPrivileged & confidential. This message is intended only for the addressee(s). If you received it in error, please notify the sender and delete it.' : '\n\n—\n본 메일은 비밀유지 대상이며 수신인만을 위한 것입니다. 잘못 수신하셨다면 발신자에게 알리고 삭제해 주십시오.') : ''
  const chatLine = chat.ok ? (en ? `Group chat (${chat.provider}): ${chat.url}` : `단체 채팅방(${chat.provider}): ${chat.url}`) : ''
  const details = (en
    ? [`Date & time: ${w} · ${f.duration} min`, `Format: ${fmt}${place ? ` — ${place}` : ''}`, chatLine]
    : [`일시: ${w} · ${f.duration}분`, `방식: ${fmt}${place ? ` — ${place}` : ''}`, chatLine]).filter(Boolean).map((l) => `  ${l}`).join('\n')
  const ag = agenda ? `\n${en ? 'Agenda' : '안건'}:\n${agenda}\n` : ''

  return [
    {
      id: 'formal', label: en ? 'Formal' : '정중한 요청', desc: en ? 'Full context, polite tone — for clients and formal correspondence' : '충분한 배경 설명, 격식 있는 어조',
      subject: en ? `Meeting request — ${matter} (${short})` : `[미팅 요청] ${matter} (${short})`,
      body: en
        ? `${hi}\n\nI am writing ${p.en}. I would be grateful if you could join a meeting:\n\n${details}\n${ag}\nPlease confirm your availability by reply. If the proposed time does not suit you, I would be happy to suggest alternatives.\n\nKind regards,\n${sig}${conf}`
        : `${hi}\n\n${p.ko} 아래와 같이 미팅을 요청드립니다.\n\n${details}\n${ag}\n참석 가능 여부를 회신 부탁드립니다. 제안드린 시간이 어려우시면 가능한 일정을 알려 주시기 바랍니다.\n\n감사합니다.\n${sig}${conf}`,
    },
    {
      id: 'concise', label: en ? 'Concise' : '간단 공지', desc: en ? 'Short and scannable — for partners and larger groups' : '짧고 한눈에 — 협력기관·다수 수신용',
      subject: en ? `${matter} — call on ${short}` : `${matter} — ${short} 미팅`,
      body: en
        ? `${hi}\n\nQuick note ${p.en}:\n\n${details}\n${ag}\nReply “yes” if you can make it.\n\n${sig}${conf}`
        : `${hi}\n\n${p.ko} 아래 일정으로 모입니다.\n\n${details}\n${ag}\n참석 가능하시면 회신 부탁드립니다.\n\n${sig}${conf}`,
    },
    {
      id: 'urgent', label: en ? 'Urgent' : '긴급', desc: en ? 'Time-sensitive — asks for a quick reply' : '시급한 일정 — 빠른 회신 요청',
      subject: en ? `URGENT — ${matter}: meeting ${short}` : `[긴급] ${matter} — ${short} 미팅`,
      body: en
        ? `${hi}\n\nThis is time-sensitive. I need to meet ${p.en}:\n\n${details}\n${ag}\nPlease reply as soon as you can — ideally within a few hours — so we can confirm attendance.\n\n${sig}${conf}`
        : `${hi}\n\n시급한 사안으로 ${p.ko} 아래와 같이 미팅이 필요합니다.\n\n${details}\n${ag}\n가능한 한 빨리(가급적 몇 시간 내) 참석 여부를 회신해 주시기 바랍니다.\n\n${sig}${conf}`,
    },
  ]
}

const chatMessage = (f: Form) => {
  const en = f.lang === 'en', place = f.place.trim(), fmt = en ? f.format : FORMAT_KO[f.format]
  const ag = f.agenda.split('\n').map((l) => l.trim()).filter(Boolean).map((l) => `• ${l.replace(/^[-•*]\s*/, '')}`).join('\n')
  return en
    ? `📅 ${f.matter || '[matter]'}\n${when(f)} · ${f.duration} min\n${fmt}${place ? ` — ${place}` : ''}${ag ? `\n${ag}` : ''}\nPlease react 👍 or reply if you can attend.`
    : `📅 ${f.matter || '[사건명]'}\n${when(f)} · ${f.duration}분\n${fmt}${place ? ` — ${place}` : ''}${ag ? `\n${ag}` : ''}\n참석 가능하시면 👍 또는 답장 부탁드립니다.`
}

const icsFile = (f: Form, chatUrl?: string) => {
  const start = new Date(`${f.date}T${f.time}`), end = new Date(start.getTime() + f.duration * 60000)
  const fmt = (d: Date) => `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}T${String(d.getHours()).padStart(2, '0')}${String(d.getMinutes()).padStart(2, '0')}00`
  const esc = (t: string) => t.replace(/([,;\\])/g, '\\$1').replace(/\n/g, '\\n')
  return ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//UPHEAL//Meeting//EN', 'BEGIN:VEVENT', `UID:${crypto.randomUUID()}@upheal`, `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '')}`,
    `DTSTART:${fmt(start)}`, `DTEND:${fmt(end)}`, `SUMMARY:${esc(f.matter || 'Meeting')}`, `LOCATION:${esc(f.place || chatUrl || f.format)}`,
    `DESCRIPTION:${esc([f.agenda, chatUrl].filter(Boolean).join('\n'))}`, 'END:VEVENT', 'END:VCALENDAR'].join('\r\n')
}

const input = 'w-full rounded-xl border border-line bg-surface px-4 py-3 text-[15px] outline-none transition focus:border-ink'
const label = 'mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-mute'

export default function Meeting() {
  const [f, setF] = useStored<Form>('upheal.meeting.v1', () => ({ matter: '', purpose: 'strategy', date: plus(3), time: '10:00', duration: 60, format: 'Video call', place: '', agenda: '', lang: 'en', sender: '', chat: '', bcc: true, conf: true, to: [] }))
  const [contacts, setContacts] = useStored<Contact[]>('upheal.contacts.v1', () => [])
  const [tplId, setTplId] = useState('')
  const [draft, setDraft] = useState<{ subject: string; body: string } | null>(null)
  const [mail, setMail] = useState('')
  const [addC, setAddC] = useState(false)
  const [nc, setNc] = useState({ name: '', email: '', role: '' })
  const [note, setNote] = useState('')

  const set = <K extends keyof Form>(k: K, v: Form[K]) => setF((p) => ({ ...p, [k]: v }))
  const chat = useMemo(() => parseChat(f.chat), [f.chat])
  const tpls = useMemo(() => templates(f, contacts, chat), [f, contacts, chat])
  const hrs = hoursUntil(f)
  const rec = hrs > -1 && hrs < 48 ? 'urgent' : f.to.length > 3 ? 'concise' : 'formal'
  const recWhy = rec === 'urgent' ? 'the meeting is within 48 hours' : rec === 'concise' ? 'you are writing to more than 3 people' : 'best default for a small group'
  const tpl = tpls.find((t) => t.id === (tplId || rec))!
  const subject = draft?.subject ?? tpl.subject, body = draft?.body ?? tpl.body

  const flash = (t: string) => { setNote(t); setTimeout(() => setNote(''), 2200) }
  const addEmail = (raw: string) => {
    const list = raw.split(/[,;\s]+/).map((s) => s.trim()).filter(Boolean)
    const good = list.filter((e) => EMAIL.test(e) && !f.to.includes(e))
    if (good.length) set('to', [...f.to, ...good])
    if (list.length && good.length < list.length) flash('Some entries were skipped (invalid or duplicate).')
    setMail('')
  }
  const toggleContact = (c: Contact) => set('to', f.to.includes(c.email) ? f.to.filter((e) => e !== c.email) : [...f.to, c.email])
  const saveContact = (e: React.FormEvent) => {
    e.preventDefault()
    if (!EMAIL.test(nc.email.trim()) || !nc.name.trim()) return flash('Enter a name and a valid email.')
    setContacts((p) => [...p, { id: crypto.randomUUID(), name: nc.name.trim(), email: nc.email.trim(), role: nc.role.trim() }])
    setNc({ name: '', email: '', role: '' }); setAddC(false)
  }

  const rcpt = encodeURIComponent(f.to.join(','))
  const q = `subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  const mailto = f.bcc ? `mailto:?bcc=${rcpt}&${q}` : `mailto:${rcpt}?${q}`
  const gmail = `https://mail.google.com/mail/?view=cm&fs=1&${f.bcc ? 'bcc' : 'to'}=${rcpt}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  const tooLong = mailto.length > 1900
  const ready = f.to.length > 0 && !!f.matter.trim()
  const copy = (t: string, m: string) => { navigator.clipboard?.writeText(t); flash(m) }
  const download = () => {
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([icsFile(f, chat.url)], { type: 'text/calendar' }))
    a.download = 'meeting-invite.ics'; a.click(); URL.revokeObjectURL(a.href)
  }

  return (
    <section id="meeting" className="mx-auto max-w-[1440px] scroll-mt-16 px-5 pb-28 md:px-8">
      <div className="reveal grid gap-6 md:grid-cols-2 md:items-end">
        <div>
          <Eyebrow n="06" label="Together · Set a meeting" icon="tent" />
          <h2 className="mt-4 font-display text-[clamp(56px,9vw,132px)] font-extrabold uppercase leading-[0.88]">Climb <span className="font-serif text-[1.04em] font-normal normal-case italic tracking-normal">together</span></h2>
        </div>
        <p className="max-w-md text-[17px] leading-relaxed text-mute md:justify-self-end">You choose who to invite. Pick a purpose, get a recommended email in English or Korean, then send it from your own mail app — and point everyone to the group chat.</p>
      </div>

      <div className="reveal mt-12 grid gap-5 lg:grid-cols-[minmax(340px,0.9fr)_1.3fr]" style={{ ['--d' as string]: '100ms' }}>
        {/* ---------- form ---------- */}
        <div className="space-y-4 rounded-3xl border border-line bg-card p-5 md:p-7 panel-3d">
          <div><label className={label} htmlFor="m-matter">Matter / subject</label><input id="m-matter" className={input} placeholder="e.g. Matter A — emergency stay" value={f.matter} onChange={(e) => set('matter', e.target.value)} /></div>
          <div>
            <span className={label}>Purpose</span>
            <div className="flex flex-wrap gap-1.5">{PURPOSES.map((p) => <button key={p.id} type="button" aria-pressed={f.purpose === p.id} onClick={() => set('purpose', p.id)} className={`rounded-full border px-3.5 py-2 text-[13px] transition-colors ${f.purpose === p.id ? 'border-ink bg-fg text-onfg' : 'border-line bg-surface hover:border-ink'}`}>{p.label}</button>)}</div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className={label} htmlFor="m-date">Date</label><input id="m-date" type="date" className={input} value={f.date} onChange={(e) => set('date', e.target.value)} /></div>
            <div><label className={label} htmlFor="m-time">Time</label><input id="m-time" type="time" className={input} value={f.time} onChange={(e) => set('time', e.target.value)} /></div>
            <div><label className={label} htmlFor="m-dur">Duration</label>
              <select id="m-dur" className={input} value={f.duration} onChange={(e) => set('duration', +e.target.value)}>{[30, 45, 60, 90, 120].map((m) => <option key={m} value={m}>{m} min</option>)}</select></div>
            <div><label className={label} htmlFor="m-fmt">Format</label>
              <select id="m-fmt" className={input} value={f.format} onChange={(e) => set('format', e.target.value)}>{FORMATS.map((m) => <option key={m}>{m}</option>)}</select></div>
          </div>
          <div><label className={label} htmlFor="m-place">Location or video link (optional)</label><input id="m-place" className={input} placeholder="Room 3, Seoul office · or a Zoom / Meet link" value={f.place} onChange={(e) => set('place', e.target.value)} /></div>
          <div><label className={label} htmlFor="m-agenda">Agenda (one item per line)</label><textarea id="m-agenda" rows={3} className={`${input} resize-none`} placeholder={'Review exhibits 1–3\nConfirm witness order'} value={f.agenda} onChange={(e) => set('agenda', e.target.value)} /></div>

          {/* recipients */}
          <div>
            <span className={label}>Invite ({f.to.length})</span>
            <div className="flex flex-wrap gap-1.5">
              {f.to.map((e) => <span key={e} className="flex items-center gap-1.5 rounded-full bg-fg py-1.5 pl-3 pr-2 font-mono text-[11px] text-onfg">{e}<button type="button" aria-label={`Remove ${e}`} onClick={() => set('to', f.to.filter((x) => x !== e))} className="grid h-4 w-4 place-items-center rounded-full bg-onfg/20 leading-none hover:bg-key hover:text-deep">×</button></span>)}
            </div>
            <input aria-label="Add email addresses" className={`${input} mt-2`} placeholder="Type an email and press Enter" value={mail} onChange={(e) => setMail(e.target.value)}
              onKeyDown={(e) => { if (['Enter', ',', ';'].includes(e.key)) { e.preventDefault(); addEmail(mail) } }} onBlur={() => mail && addEmail(mail)} />
          </div>

          {/* contact book */}
          <div className="rounded-2xl border border-dashed border-ink/20 p-3">
            <div className="flex items-center justify-between"><span className={`${label} mb-0`}>Your contacts · saved in this browser</span>
              <button type="button" onClick={() => setAddC((v) => !v)} className="font-mono text-[10px] uppercase tracking-widest text-keydeep hover:underline">{addC ? 'Cancel' : '+ Add contact'}</button></div>
            {contacts.length === 0 && !addC && <p className="mt-2 text-sm text-mute">No contacts yet. Add the people you usually call — client, co-counsel, interpreter, expert — then tap to invite.</p>}
            <div className="mt-2 flex flex-wrap gap-1.5">
              {contacts.map((c) => (
                <span key={c.id} className={`group flex items-center rounded-full border text-[12px] transition-colors ${f.to.includes(c.email) ? 'border-key bg-key text-deep' : 'border-line bg-surface'}`}>
                  <button type="button" onClick={() => toggleContact(c)} aria-pressed={f.to.includes(c.email)} className="py-1.5 pl-3 pr-2 text-left">{c.name}{c.role && <span className="ml-1.5 font-mono text-[9px] uppercase opacity-60">{c.role}</span>}</button>
                  <button type="button" aria-label={`Delete ${c.name}`} onClick={() => setContacts((p) => p.filter((x) => x.id !== c.id))} className="pr-2.5 text-mute opacity-0 hover:text-rust focus:opacity-100 group-hover:opacity-100 max-md:opacity-100">×</button>
                </span>
              ))}
            </div>
            {addC && (
              <form onSubmit={saveContact} className="mt-3 grid gap-2 sm:grid-cols-3">
                <input aria-label="Name" className={input} placeholder="Name" value={nc.name} onChange={(e) => setNc({ ...nc, name: e.target.value })} />
                <input aria-label="Email" type="email" className={input} placeholder="Email" value={nc.email} onChange={(e) => setNc({ ...nc, email: e.target.value })} />
                <input aria-label="Role" className={input} placeholder="Role (optional)" value={nc.role} onChange={(e) => setNc({ ...nc, role: e.target.value })} />
                <button className="pill justify-center bg-fg text-[12px] text-onfg hover:bg-key hover:text-deep sm:col-span-3">Save contact</button>
              </form>
            )}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div><label className={label} htmlFor="m-sender">Your name (signature)</label><input id="m-sender" className={input} placeholder="e.g. Jin Park, Attorney" value={f.sender} onChange={(e) => set('sender', e.target.value)} /></div>
            <div><span className={label}>Language</span>
              <div className="flex gap-1 rounded-full bg-surface p-1 shadow-sm">{(['en', 'ko'] as const).map((l) => <button key={l} type="button" aria-pressed={f.lang === l} onClick={() => { set('lang', l); setDraft(null) }} className={`flex-1 rounded-full py-2 text-[13px] ${f.lang === l ? 'bg-fg text-onfg' : 'hover:bg-ink/5'}`}>{l === 'en' ? 'English' : '한국어'}</button>)}</div></div>
          </div>
          <label className="flex cursor-pointer items-start gap-3 text-[14px]"><input type="checkbox" checked={f.bcc} onChange={(e) => set('bcc', e.target.checked)} className="mt-1 h-4 w-4 accent-[#EDB021]" /><span><b className="font-medium">Send as BCC</b> <span className="text-mute">— recipients won’t see each other’s addresses (recommended for client matters).</span></span></label>
          <label className="flex cursor-pointer items-start gap-3 text-[14px]"><input type="checkbox" checked={f.conf} onChange={(e) => set('conf', e.target.checked)} className="mt-1 h-4 w-4 accent-[#EDB021]" /><span><b className="font-medium">Add confidentiality notice</b> <span className="text-mute">— privileged &amp; confidential footer.</span></span></label>
        </div>

        {/* ---------- preview + actions ---------- */}
        <div className="space-y-4">
          <div className="rounded-3xl border border-line bg-card p-5 md:p-7 panel-3d">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className={`${label} mb-0`}>Recommended email</span>
              {draft && <button onClick={() => setDraft(null)} className="font-mono text-[10px] uppercase tracking-widest text-keydeep hover:underline">Reset to template</button>}
            </div>
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              {tpls.map((t) => {
                const on = t.id === tpl.id
                return (
                  <button key={t.id} onClick={() => { setTplId(t.id); setDraft(null) }} aria-pressed={on} className={`rounded-2xl border p-4 text-left transition-all duration-300 ${on ? 'border-ink bg-fg text-onfg' : 'border-line bg-surface hover:-translate-y-0.5 hover:border-ink'}`}>
                    <span className="flex items-center justify-between gap-2"><span className="text-[16px] font-medium">{t.label}</span>{t.id === rec && <span className="rounded-full bg-key px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest text-deep">Best fit</span>}</span>
                    <span className={`mt-1 block text-[12px] leading-snug ${on ? 'text-deep/70' : 'text-mute'}`}>{t.desc}</span>
                  </button>
                )
              })}
            </div>
            <p className="mt-2 font-mono text-[10px] uppercase tracking-widest text-mute">Suggested because {recWhy}. Edit freely below.</p>

            <label className={`${label} mt-5`} htmlFor="m-subj">Subject</label>
            <input id="m-subj" className={input} value={subject} onChange={(e) => setDraft({ subject: e.target.value, body })} />
            <label className={`${label} mt-3`} htmlFor="m-body">Message</label>
            <textarea id="m-body" rows={16} className={`${input} font-mono text-[13px] leading-relaxed`} value={body} onChange={(e) => setDraft({ subject, body: e.target.value })} />
            {draft && <p className="mt-2 text-[12px] text-mute">Manual edits are kept — changing the form on the left won’t overwrite them until you reset.</p>}

            <div className="mt-5 flex flex-wrap gap-2">
              <a href={ready ? mailto : undefined} aria-disabled={!ready} onClick={(e) => !ready && e.preventDefault()} className={`pill bg-key text-deep ${ready ? 'hover:bg-fg hover:text-onfg' : 'cursor-not-allowed opacity-40'}`}>Open in email app ↗</a>
              <a href={ready ? gmail : undefined} target="_blank" rel="noopener noreferrer" aria-disabled={!ready} onClick={(e) => !ready && e.preventDefault()} className={`pill border border-ink/25 ${ready ? 'hover:bg-fg hover:text-onfg' : 'cursor-not-allowed opacity-40'}`}>Compose in Gmail ↗</a>
              <button onClick={() => copy(`Subject: ${subject}\n\n${body}`, 'Email copied')} className="pill border border-ink/25 hover:bg-fg hover:text-onfg">Copy email</button>
              <button onClick={download} disabled={!f.date || !f.time} className="pill border border-ink/25 hover:bg-fg hover:text-onfg disabled:opacity-40">Calendar invite .ics ↓</button>
            </div>
            {!ready && <p className="mt-3 font-mono text-[10px] uppercase tracking-widest text-mute">Add a matter name and at least one recipient to enable sending.</p>}
            {tooLong && ready && <p className="mt-3 rounded-xl bg-amber/15 px-3 py-2 text-[12px] text-keydeep">This message is long for a mail link — if your app truncates it, use “Copy email” or Gmail.</p>}
            <p aria-live="polite" className="mt-2 h-4 font-mono text-[10px] uppercase tracking-widest text-keydeep">{note}</p>
          </div>

          {/* group chat */}
          <div className="rounded-3xl bg-deep p-5 text-white md:p-7">
            <span className="font-mono text-[10px] uppercase tracking-widest text-key">Group chat</span>
            <h3 className="mt-2 text-[22px] font-medium tracking-[-0.02em]">Bring everyone into one room</h3>
            <p className="mt-1 text-sm text-white/60">Paste your KakaoTalk, Signal, WhatsApp, Telegram, Slack, Teams or Meet link. It’s added to the email, and you can open the room or post the invite message in one tap.</p>
            <input aria-label="Group chat link" className="mt-4 w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-[15px] text-white outline-none placeholder:text-white/35 focus:border-key" placeholder="https://open.kakao.com/o/…" value={f.chat} onChange={(e) => set('chat', e.target.value)} />
            {chat.err && <p className="mt-2 text-[13px] text-[#ff9c8f]">{chat.err}</p>}
            {chat.ok && <p className="mt-2 font-mono text-[10px] uppercase tracking-widest text-key">✓ {chat.provider} link detected</p>}
            <div className="mt-4 flex flex-wrap gap-2">
              <a href={chat.ok ? chat.url : undefined} target="_blank" rel="noopener noreferrer" aria-disabled={!chat.ok} onClick={(e) => !chat.ok && e.preventDefault()} className={`pill bg-key text-deep ${chat.ok ? 'hover:bg-white' : 'cursor-not-allowed opacity-40'}`}>Open {chat.ok ? chat.provider : 'group chat'} ↗</a>
              <button onClick={() => copy(`${chatMessage(f)}${chat.ok ? `\n${chat.url}` : ''}`, 'Chat message copied — paste it into the room')} className="pill border border-white/25 hover:bg-white hover:text-deep">Copy invite message</button>
              <button onClick={() => copy(chat.url ?? '', 'Link copied')} disabled={!chat.ok} className="pill border border-white/25 hover:bg-white hover:text-deep disabled:opacity-40">Copy link</button>
            </div>
            <pre className="mt-4 max-h-40 overflow-auto whitespace-pre-wrap rounded-xl bg-white/5 p-3 font-mono text-[12px] leading-relaxed text-white/75">{chatMessage(f)}</pre>
          </div>
          <p className="px-2 font-mono text-[10px] uppercase leading-relaxed tracking-widest text-mute">Nothing is sent from this page. The email opens in your own mail app or Gmail so you can review it first. Contacts and drafts stay in this browser.</p>
        </div>
      </div>
    </section>
  )
}
