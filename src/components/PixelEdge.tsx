import { useMemo } from 'react'
import { rng } from '../lib'

/** Row of squares that dissolves one section into the next (bottom edge). */
export default function PixelEdge({ color = 'rgb(var(--paper))', cols = 32, rows = 4, seed = 7, className = '' }: { color?: string; cols?: number; rows?: number; seed?: number; className?: string }) {
  const cells = useMemo(() => {
    const r = rng(seed)
    const out: boolean[] = []
    for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) out.push(r() < (y + 1) / rows - 0.05 * (rows - y - 1) - (y === 0 ? 0.1 : 0))
    return out
  }, [cols, rows, seed])
  return (
    <div aria-hidden className={`pointer-events-none absolute inset-x-0 bottom-[-1px] grid ${className}`} style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
      {cells.map((on, i) => (
        <span key={i} style={{ background: on ? color : 'transparent', aspectRatio: '1', transitionDelay: `${(i % cols) * 12}ms` }} className="block transition-opacity duration-500" />
      ))}
    </div>
  )
}
