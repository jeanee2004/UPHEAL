import Header from './components/Header'
import Hero from './components/Hero'
import Reports from './components/Reports'
import BriefingHub from './components/BriefingHub'
import Backdrop from './components/Backdrop'
import Countries from './components/Countries'
import Hearings from './components/Hearings'
import Vault from './components/Vault'
import Cases from './components/Cases'
import Meeting from './components/Meeting'
import Sources from './components/Sources'
import Footer from './components/Footer'
import Journey from './components/Journey'
import Objet from './components/Objet'
import DesignPanel from './components/DesignPanel'
import CursorLabel from './components/CursorLabel'
import { Article, useReveal } from './lib'
import { useEffect } from 'react'
import data from './data/articles.json'

const articles = data.articles as Article[]
const updated = new Date(data.fetched).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })

export default function App() {
  useReveal()
  useEffect(() => {
    let raf = 0
    const h = (e: PointerEvent) => { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => { const s = document.documentElement.style; s.setProperty('--px', ((e.clientX / innerWidth) * 2 - 1).toFixed(3)); s.setProperty('--py', ((e.clientY / innerHeight) * 2 - 1).toFixed(3)) }) }
    addEventListener('pointermove', h)
    return () => { removeEventListener('pointermove', h); cancelAnimationFrame(raf) }
  }, [])
  return (
    <>
      <Backdrop />
      <Header />
      <main>
        <Hero updated={updated} />
        <Reports articles={articles} />
        <Objet kind="drop" n="01" />
        <Countries />
        <Objet kind="cairn" n="02" />
        <Hearings />
        <Objet kind="ring" n="03" />
        <Vault />
        <Objet kind="case" n="04" />
        <Cases />
        <Objet kind="boat" n="05" />
        <Meeting />
        <Objet kind="orb" n="06" />
        <BriefingHub />
        <Sources />
      </main>
      <Footer updated={updated} />
      <Journey />
      <DesignPanel />
      <CursorLabel />
    </>
  )
}
