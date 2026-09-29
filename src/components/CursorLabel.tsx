import { useEffect, useRef } from 'react'

/** Follows the pointer and shows a pill for any element with data-cursor="label". */
export default function CursorLabel() {
  const el = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return
    let x = 0, y = 0, cx = 0, cy = 0, id = 0
    const label = el.current!
    const show = (el: Element | null) => {
      const t = el?.closest?.('[data-cursor]') as HTMLElement | null
      if (t && t.dataset.cursor) { label.textContent = t.dataset.cursor; label.style.opacity = '1'; label.style.scale = '1' }
      else { label.style.opacity = '0'; label.style.scale = '.6' }
    }
    const move = (e: PointerEvent) => { x = e.clientX; y = e.clientY; show(e.target as Element) }
    const onScroll = () => show(document.elementFromPoint(x, y)) // pointer is still while the page scrolls under it
    const loop = () => {
      cx += (x - cx) * 0.2; cy += (y - cy) * 0.2
      label.style.translate = `${cx + 14}px ${cy + 14}px`
      id = requestAnimationFrame(loop)
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('scroll', onScroll, { passive: true })
    id = requestAnimationFrame(loop)
    return () => { window.removeEventListener('pointermove', move); window.removeEventListener('scroll', onScroll); cancelAnimationFrame(id) }
  }, [])
  return (
    <div ref={el} aria-hidden className="pointer-events-none fixed left-0 top-0 z-[90] rounded-full bg-fg px-4 py-2 font-mono text-[11px] uppercase tracking-widest text-onfg opacity-0 transition-[opacity,scale] duration-300" style={{ scale: '.6' }} />
  )
}
