import { useEffect, useRef } from 'react'

type Page = 'home' | 'theory' | 'instruments' | 'playground'
interface HeroProps { setActivePage: (page: Page) => void }

export default function Hero({ setActivePage }: HeroProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    let animId: number
    let time = 0

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      time += 0.008

      // Animated concentric rings (vinyl record feel)
      const cx = canvas.width * 0.75
      const cy = canvas.height * 0.45
      for (let i = 1; i <= 12; i++) {
        const r = i * 55 + Math.sin(time + i * 0.4) * 6
        ctx.beginPath()
        ctx.arc(cx, cy, r, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(212,168,71,${0.04 + (12 - i) * 0.005})`
        ctx.lineWidth = 1
        ctx.stroke()
      }

      // Orbiting notes
      const notes = ['♩', '♪', '♫', '♬', '𝄞']
      notes.forEach((note, i) => {
        const angle = time * (0.3 + i * 0.1) + (i * Math.PI * 2) / notes.length
        const orbitR = 120 + i * 40
        const x = cx + Math.cos(angle) * orbitR
        const y = cy + Math.sin(angle) * (orbitR * 0.4)
        ctx.font = `${14 + i * 2}px serif`
        ctx.fillStyle = `rgba(212,168,71,${0.15 + i * 0.05})`
        ctx.fillText(note, x, y)
      })

      // Stave lines on left
      for (let i = 0; i < 5; i++) {
        const y = 320 + i * 22
        const progress = Math.min(1, (time - i * 0.3) / 2)
        const w = Math.max(0, progress * canvas.width * 0.5)
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(w, y)
        ctx.strokeStyle = `rgba(255,255,255,0.05)`
        ctx.lineWidth = 1
        ctx.stroke()
      }

      // Frequency waveform at bottom
      ctx.beginPath()
      for (let x = 0; x < canvas.width; x++) {
        const freq1 = Math.sin(x * 0.015 + time * 2) * 20
        const freq2 = Math.sin(x * 0.03 + time * 3.1) * 10
        const freq3 = Math.sin(x * 0.008 + time * 1.4) * 15
        const y = canvas.height - 80 + freq1 + freq2 + freq3
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
      }
      ctx.strokeStyle = 'rgba(45,212,200,0.12)'
      ctx.lineWidth = 2
      ctx.stroke()

      animId = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  const stats = [
    { value: '12', label: 'Music Notes' },
    { value: '7', label: 'Scale Modes' },
    { value: '50+', label: 'Instruments' },
    { value: '∞', label: 'Possibilities' },
  ]

  const cards = [
    { icon: '🎵', title: 'Music Theory', desc: 'Master notes, scales & chords', page: 'theory' as Page, color: '#d4a847' },
    { icon: '🎸', title: 'Instruments', desc: 'Explore 50+ instruments', page: 'instruments' as Page, color: '#2dd4c8' },
    { icon: '🎹', title: 'Playground', desc: 'Interactive piano & tools', page: 'playground' as Page, color: '#9b7fe8' },
  ]

  return (
    <div style={{ position: 'relative', minHeight: '100vh', paddingTop: '72px', overflow: 'hidden' }}>
      {/* Canvas background */}
      <canvas ref={canvasRef} style={{
        position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none',
      }} />

      {/* Gradient bg */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse 60% 60% at 75% 45%, rgba(212,168,71,0.06) 0%, transparent 70%), radial-gradient(ellipse 40% 40% at 20% 70%, rgba(45,212,200,0.04) 0%, transparent 60%)',
        pointerEvents: 'none',
      }} />

      <div className="container" style={{ position: 'relative', zIndex: 1, paddingTop: '80px', paddingBottom: '80px' }}>
        <div style={{ maxWidth: '640px' }}>
          {/* Label */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px', animation: 'fadeUp 0.6s ease forwards' }}>
            <div className="waveform">
              {[...Array(7)].map((_, i) => (
                <div key={i} className="waveform-bar" />
              ))}
            </div>
            <span className="tag tag-gold">Your Musical Journey Starts Here</span>
          </div>

          {/* Headline */}
          <h1 style={{
            fontFamily: 'Playfair Display, serif',
            fontSize: 'clamp(2.8rem, 6vw, 4.5rem)',
            fontWeight: '900',
            lineHeight: '1.05',
            marginBottom: '24px',
            animation: 'fadeUp 0.7s ease 0.1s both forwards',
            opacity: 0,
          }}>
            <span style={{ display: 'block', color: '#f0ede8' }}>Understand</span>
            <span style={{ display: 'block' }} className="gradient-text">the Language</span>
            <span style={{ display: 'block', color: '#f0ede8' }}>of Music</span>
          </h1>

          {/* Subtitle */}
          <p style={{
            fontSize: '18px',
            color: '#9896a8',
            lineHeight: '1.75',
            marginBottom: '40px',
            animation: 'fadeUp 0.7s ease 0.2s both forwards',
            opacity: 0,
            maxWidth: '500px',
          }}>
            Explore music theory, master instruments, and unlock the science behind every melody — through beautiful, interactive lessons designed for all levels.
          </p>

          {/* CTA buttons */}
          <div style={{
            display: 'flex', gap: '14px', flexWrap: 'wrap',
            animation: 'fadeUp 0.7s ease 0.3s both forwards', opacity: 0,
          }}>
            <button className="btn-primary" onClick={() => setActivePage('theory')}>
              Start Learning ♪
            </button>
            <button className="btn-ghost" onClick={() => setActivePage('playground')}>
              Open Playground
            </button>
          </div>

          {/* Stats */}
          <div style={{
            display: 'flex', gap: '32px', marginTop: '60px', flexWrap: 'wrap',
            animation: 'fadeUp 0.7s ease 0.4s both forwards', opacity: 0,
          }}>
            {stats.map(stat => (
              <div key={stat.value}>
                <div style={{
                  fontFamily: 'Playfair Display, serif',
                  fontSize: '28px', fontWeight: '700', color: '#d4a847',
                }}>{stat.value}</div>
                <div style={{ fontSize: '12px', color: '#55546a', fontFamily: 'DM Mono, monospace', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: '2px' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Feature cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '20px',
          marginTop: '100px',
          animation: 'fadeUp 0.7s ease 0.5s both forwards',
          opacity: 0,
        }}>
          {cards.map(card => (
            <button
              key={card.page}
              onClick={() => setActivePage(card.page)}
              className="glass-card"
              style={{
                padding: '32px',
                textAlign: 'left',
                cursor: 'pointer',
                border: 'none',
              }}
            >
              <div style={{
                width: '52px', height: '52px',
                borderRadius: '14px',
                background: `${card.color}18`,
                border: `1px solid ${card.color}30`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '24px',
                marginBottom: '18px',
              }}>{card.icon}</div>
              <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '20px', fontWeight: '700', color: '#f0ede8', marginBottom: '8px' }}>{card.title}</div>
              <div style={{ fontSize: '14px', color: '#9896a8', lineHeight: '1.6' }}>{card.desc}</div>
              <div style={{ marginTop: '20px', fontSize: '13px', color: card.color, fontWeight: '600' }}>Explore →</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
