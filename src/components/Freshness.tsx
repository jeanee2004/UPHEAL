/** "Updated 3 h ago" — turns amber with a hint when the data snapshot is older than 48 hours. */
export default function Freshness({ iso, label = 'Updated', className = '' }: { iso: string; label?: string; className?: string }) {
  const h = Math.max(0, (Date.now() - new Date(iso).getTime()) / 36e5)
  const ago = h < 1 ? 'just now' : h < 24 ? `${Math.floor(h)} h ago` : `${Math.floor(h / 24)} d ago`
  const stale = h > 48
  return (
    <span className={`inline-flex flex-wrap items-center gap-x-2 rounded-full px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest ${stale ? 'bg-key/20 text-keydeep' : 'bg-fg/5 text-mute'} ${className}`}>
      <i className={`block h-1.5 w-1.5 rounded-full ${stale ? 'bg-key' : 'bg-ok'}`} />
      {label} {ago}{stale && <span> — may be stale · run <code className="normal-case">npm run refresh</code></span>}
    </span>
  )
}
