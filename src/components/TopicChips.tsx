/** Auto-tagged legal-relevance chips. "Accountability" is emphasised for practitioners. */
export default function TopicChips({ topics, className = '' }: { topics: string[]; className?: string }) {
  if (!topics?.length) return null
  return (
    <ul className={`flex flex-wrap gap-1.5 ${className}`} aria-label="Topics">
      {topics.map((t) => (
        <li key={t} className={`rounded-full border px-2.5 py-1 font-mono text-[9.5px] uppercase tracking-[0.1em] ${t === 'Accountability' ? 'border-key bg-key text-deep' : 'border-line bg-fg/10 text-ink/80'}`}>{t}</li>
      ))}
    </ul>
  )
}
