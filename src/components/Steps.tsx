/** A trail of footprints, alternating left / right. `walk` makes them light up one after another; otherwise they wake on card hover. */
export default function Steps({ n = 12, walk = false, className = '' }: { n?: number; walk?: boolean; className?: string }) {
  return (
    <div aria-hidden className={`pointer-events-none flex items-end justify-between ${className}`}>
      {Array.from({ length: n }, (_, i) => (
        <svg key={i} viewBox="0 0 12 22" fill="currentColor" className={`h-[26px] w-[14px] shrink-0 ${walk ? 'animate-[stepWalk_3s_ease-in-out_infinite]' : 'opacity-60 group-hover:animate-[stepWalk_2.4s_ease-in-out_infinite]'}`}
          style={{ transform: `translateY(${i % 2 ? -7 : 7}px) rotate(${i % 2 ? 9 : -9}deg)`, animationDelay: `${i * 0.16}s` }}>
          <ellipse cx="6" cy="7" rx="4" ry="6.2" /><ellipse cx="6" cy="18" rx="3.1" ry="3.6" />
        </svg>
      ))}
    </div>
  )
}
