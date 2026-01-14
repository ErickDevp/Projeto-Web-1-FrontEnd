import { useRef } from 'react'
import HomeMainContent from '../../components/home/HomeMainContent'
import HomeHero from '../../components/home/Home'

export default function Home() {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const wheelUpLockRef = useRef(false)

  const scrollToId = (id: string, durationMs = 220) => {
    const el = document.getElementById(id)
    const container = containerRef.current
    if (!el || !container) return

    const startY = container.scrollTop
    const targetY = el.offsetTop
    const delta = targetY - startY
    const start = performance.now()

    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)

    const step = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs)
      container.scrollTo({ top: startY + delta * easeOutCubic(t) })
      if (t < 1) requestAnimationFrame(step)
    }

    requestAnimationFrame(step)
  }

  const scrollToMain = () => scrollToId('home-main')
  const scrollToHero = () => scrollToId('home-hero')

  return (
    <div
      ref={containerRef}
      className="h-screen overflow-y-auto bg-bg-primary scroll-smooth snap-y snap-mandatory"
    >
      <div id="home-hero" className="snap-start">
        <HomeHero onNext={scrollToMain} />
      </div>

      <div
        id="home-main"
        className="snap-start"
        onWheel={(e) => {
          if (wheelUpLockRef.current) return
          if (e.deltaY >= 0) return

          const container = containerRef.current
          const el = document.getElementById('home-main')
          if (!container || !el) return

          // Só "puxa" para o Hero quando o scroll está no início do conteúdo.
          if (Math.abs(container.scrollTop - el.offsetTop) > 16) return

          wheelUpLockRef.current = true
          scrollToHero()

          setTimeout(() => {
            wheelUpLockRef.current = false
          }, 600)
        }}
      >
        <HomeMainContent />
      </div>
    </div>
  )
}
