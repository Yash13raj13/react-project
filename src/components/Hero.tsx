import { useEffect, useRef, useState } from 'react'
import { useTheme } from '../App'
import type { Page } from '../App'

interface HeroProps { setActivePage: (page: Page) => void }

const FEATURES = [
  { icon: '𝄞', title: 'Music Theory', subtitle: 'Core Concepts', desc: 'Notes, intervals, scales, chords, harmony — the complete language of music broken down beautifully.', page: 'theory' as Page, accent: '#d4a847', tag: 'Learn' },
  { icon: '🎸', title: 'Instruments', subtitle: '50+ Covered', desc: 'String, wind, percussion, electronic and world instruments from every musical tradition.', page: 'instruments' as Page, accent: '#2dd4c8', tag: 'Explore' },
  { icon: '👂', title: 'Ear Training', subtitle: 'Quiz Yourself', desc: 'Identify intervals, chords and notes by ear. Build the skill that separates good from great.', page: 'ear-training' as Page, accent: '#e8507a', tag: 'Train' },
  { icon: '🎶', title: 'Chord Builder', subtitle: 'Play & Hear', desc: 'Construct progressions, load classic patterns, and hear how chords connect and resolve.', page: 'chord-progression' as Page, accent: '#9b7fe8', tag: 'Build' },
  { icon: '🥁', title: 'Metronome', subtitle: 'Stay in Time', desc: 'Visual pendulum, tap tempo, time signatures. The tool every musician needs every day.', page: 'metronome' as Page, accent: '#6bc96b', tag: 'Practice' },
  { icon: '🎹', title: 'Playground', subtitle: 'Synth Studio', desc: 'A full browser synthesizer. ADSR envelope, reverb, waveforms — play and shape real sound.', page: 'playground' as Page, accent: '#ff9f43', tag: 'Play' },
]

const FLOATING_SYMBOLS = ['♩', '♪', '♫', '♬', '𝄞', '𝄢', '♭', '♯', '𝄐', '𝄑']

export default function Hero({ setActivePage }: HeroProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [hoveredCard, setHoveredCard] = useState<number | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

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

    // Particles
    const particles: { x: number; y: number; vx: number; vy: number; symbol: string; size: number; opacity: number; rotation: number; rotSpeed: number }[] = []
    for (let i = 0; i < 28; i++) {
      particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 0.3,
        vy: -Math.random() * 0.4 - 0.1,
        symbol: FLOATING_SYMBOLS[Math.floor(Math.random() * FLOATING_SYMBOLS.length)],
        size: Math.random() * 18 + 8,
        opacity: Math.random() * 0.12 + 0.04,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.01,
      })
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      time += 0.006

      // Animated staff lines across the full width
      const staffColors = isDark
        ? 'rgba(212,168,71,0.06)'
        : 'rgba(184,134,11,0.08)'
      for (let i = 0; i < 5; i++) {
        const y = canvas.height * 0.38 + i * 28
        const wave = Math.sin(time * 0.5 + i * 0.3) * 8
        ctx.beginPath()
        ctx.moveTo(0, y + wave)
        for (let x = 0; x < canvas.width; x += 4) {
          const dy = Math.sin(x * 0.004 + time * 0.4 + i * 0.5) * 5
          ctx.lineTo(x, y + dy)
        }
        ctx.strokeStyle = staffColors
        ctx.lineWidth = 1.5
        ctx.stroke()
      }

      // Treble clef glyph (large, right side)
      ctx.save()
      ctx.font = `${240}px serif`
      ctx.fillStyle = isDark ? 'rgba(212,168,71,0.04)' : 'rgba(184,134,11,0.06)'
      ctx.fillText('𝄞', canvas.width * 0.62, canvas.height * 0.72)
      ctx.restore()

      // Floating particles
      particles.forEach(p => {
        p.x += p.vx
        p.y += p.vy
        p.rotation += p.rotSpeed
        if (p.y < -40) { p.y = canvas.height + 20; p.x = Math.random() * canvas.width }
        if (p.x < -40) p.x = canvas.width + 20
        if (p.x > canvas.width + 40) p.x = -20

        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate(p.rotation)
        ctx.font = `${p.size}px serif`
        ctx.fillStyle = isDark
          ? `rgba(212,168,71,${p.opacity})`
          : `rgba(184,134,11,${p.opacity * 1.5})`
        ctx.textAlign = 'center'
        ctx.fillText(p.symbol, 0, 0)
        ctx.restore()
      })

      // Frequency wave — bottom
      ctx.beginPath()
      for (let x = 0; x < canvas.width; x++) {
        const y = canvas.height - 60
          + Math.sin(x * 0.012 + time * 1.8) * 18
          + Math.sin(x * 0.025 + time * 2.9) * 9
          + Math.sin(x * 0.007 + time * 1.2) * 12
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
      }
      ctx.strokeStyle = isDark ? 'rgba(45,212,200,0.09)' : 'rgba(14,158,148,0.12)'
      ctx.lineWidth = 2
      ctx.stroke()

      // Second wave offset
      ctx.beginPath()
      for (let x = 0; x < canvas.width; x++) {
        const y = canvas.height - 60
          + Math.sin(x * 0.01 + time * 2.2 + 1.5) * 14
          + Math.sin(x * 0.02 + time * 1.6 + 0.8) * 7
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
      }
      ctx.strokeStyle = isDark ? 'rgba(212,168,71,0.06)' : 'rgba(184,134,11,0.08)'
      ctx.lineWidth = 1.5
      ctx.stroke()

      animId = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [isDark])

  return (
    <div style={{ position: 'relative', minHeight: '100vh', overflow: 'hidden', background: 'var(--bg-deep)' }}>
      {/* Canvas */}
      <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }} />

      {/* Radial spotlight */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
        background: isDark
          ? 'radial-gradient(ellipse 70% 80% at 30% 40%, rgba(212,168,71,0.07) 0%, transparent 65%), radial-gradient(ellipse 50% 50% at 80% 70%, rgba(45,212,200,0.05) 0%, transparent 60%)'
          : 'radial-gradient(ellipse 70% 80% at 30% 40%, rgba(184,134,11,0.06) 0%, transparent 65%)',
      }} />

      {/* ── SECTION 1: HERO ── */}
      <section style={{ position: 'relative', zIndex: 1, minHeight: '100vh', display: 'flex', alignItems: 'center', paddingTop: '80px' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', alignItems: 'center' }}>

            {/* Left column */}
            <div>
              {/* Eyebrow */}
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '10px',
                padding: '6px 14px 6px 8px',
                background: isDark ? 'rgba(212,168,71,0.08)' : 'rgba(184,134,11,0.07)',
                border: '1px solid rgba(212,168,71,0.2)',
                borderRadius: '50px', marginBottom: '32px',
                opacity: mounted ? 1 : 0,
                transform: mounted ? 'translateY(0)' : 'translateY(20px)',
                transition: 'opacity 0.7s ease, transform 0.7s ease',
              }}>
                <div style={{ display: 'flex', gap: '3px' }}>
                  {[...Array(5)].map((_, i) => (
                    <div key={i} style={{
                      width: '3px', borderRadius: '2px',
                      background: 'var(--accent-gold)',
                      height: `${[10, 18, 12, 20, 14][i]}px`,
                      animation: `waveform 1.2s ease-in-out ${i * 0.15}s infinite`,
                    }} />
                  ))}
                </div>
                <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--accent-gold)' }}>Grove · Learn Music</span>
              </div>

              {/* Headline */}
              <h1 style={{
                fontFamily: 'Playfair Display, serif',
                fontSize: 'clamp(3rem, 5.5vw, 5rem)',
                fontWeight: '900',
                lineHeight: 1.0,
                marginBottom: '28px',
                opacity: mounted ? 1 : 0,
                transform: mounted ? 'translateY(0)' : 'translateY(30px)',
                transition: 'opacity 0.7s ease 0.12s, transform 0.7s ease 0.12s',
              }}>
                <span style={{ display: 'block', color: 'var(--text-primary)' }}>Learn to</span>
                <span style={{ display: 'block', color: 'var(--text-primary)' }}>speak the</span>
                <span style={{
                  display: 'block',
                  background: 'linear-gradient(135deg, var(--accent-gold) 0%, var(--accent-rose) 55%, var(--accent-violet) 100%)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                }}>language</span>
                <span style={{ display: 'block', color: 'var(--text-primary)', fontStyle: 'italic', opacity: 0.5, fontSize: '0.7em', letterSpacing: '0.05em' }}>of music.</span>
              </h1>

              {/* Descriptor */}
              <p style={{
                fontSize: '17px', color: 'var(--text-secondary)', lineHeight: '1.8',
                marginBottom: '44px', maxWidth: '460px',
                opacity: mounted ? 1 : 0,
                transform: mounted ? 'translateY(0)' : 'translateY(20px)',
                transition: 'opacity 0.7s ease 0.22s, transform 0.7s ease 0.22s',
              }}>
                From your very first note to advanced harmony — Harmonia teaches music theory, trains your ear, and gives you real instruments to play with, right in your browser.
              </p>

              {/* CTAs */}
              <div style={{
                display: 'flex', gap: '14px', flexWrap: 'wrap',
                opacity: mounted ? 1 : 0,
                transform: mounted ? 'translateY(0)' : 'translateY(20px)',
                transition: 'opacity 0.7s ease 0.32s, transform 0.7s ease 0.32s',
              }}>
                <button className="btn-primary" onClick={() => setActivePage('theory')} style={{ fontSize: '15px', padding: '15px 36px' }}>
                  Begin Learning ♪
                </button>
                <button className="btn-ghost" onClick={() => setActivePage('playground')} style={{ fontSize: '15px', padding: '14px 30px' }}>
                  Open Synth
                </button>
              </div>

              {/* Stats row */}
              <div style={{
                display: 'flex', gap: '0', marginTop: '56px',
                borderTop: '1px solid var(--border)', paddingTop: '28px',
                opacity: mounted ? 1 : 0,
                transition: 'opacity 0.7s ease 0.45s',
              }}>
                {[
                  { val: '12', unit: 'Notes', sub: 'chromatic scale' },
                  { val: '7', unit: 'Modes', sub: 'diatonic scales' },
                  { val: '50+', unit: 'Instruments', sub: 'from 5 families' },
                  { val: '6', unit: 'Tools', sub: 'interactive' },
                ].map((s, i) => (
                  <div key={s.val} style={{
                    flex: 1,
                    paddingLeft: i === 0 ? 0 : '24px',
                    borderLeft: i === 0 ? 'none' : '1px solid var(--border)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '2px' }}>
                      <span style={{ fontFamily: 'Playfair Display, serif', fontSize: '26px', fontWeight: '900', color: 'var(--accent-gold)' }}>{s.val}</span>
                      <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '10px', color: 'var(--accent-gold)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{s.unit}</span>
                    </div>
                    <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>{s.sub}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right column — Visual composition */}
            <div style={{
              position: 'relative', height: '520px',
              opacity: mounted ? 1 : 0,
              transform: mounted ? 'translateX(0)' : 'translateX(40px)',
              transition: 'opacity 0.9s ease 0.3s, transform 0.9s ease 0.3s',
            }}>
              {/* Big decorative circle */}
              <div style={{
                position: 'absolute', right: '-20px', top: '50%', transform: 'translateY(-50%)',
                width: '380px', height: '380px', borderRadius: '50%',
                border: '1px solid rgba(212,168,71,0.12)',
                animation: 'spin-slow 30s linear infinite',
              }}>
                {/* Notches on circle */}
                {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg, i) => (
                  <div key={deg} style={{
                    position: 'absolute', width: i % 3 === 0 ? '12px' : '6px', height: '2px',
                    background: i % 3 === 0 ? 'var(--accent-gold)' : 'rgba(212,168,71,0.3)',
                    top: '50%', left: '-1px',
                    transformOrigin: `${190 + (i % 3 === 0 ? 6 : 3)}px 1px`,
                    transform: `rotate(${deg}deg)`,
                    opacity: i % 3 === 0 ? 0.6 : 0.3,
                  }} />
                ))}
              </div>

              {/* Inner circle */}
              <div style={{
                position: 'absolute', right: '30px', top: '50%', transform: 'translateY(-50%)',
                width: '260px', height: '260px', borderRadius: '50%',
                border: '1px solid rgba(45,212,200,0.15)',
                animation: 'spin-slow 20s linear infinite reverse',
              }} />

              {/* Center note */}
              <div style={{
                position: 'absolute', right: '90px', top: '50%', transform: 'translateY(-50%)',
                width: '140px', height: '140px', borderRadius: '50%',
                background: isDark ? 'rgba(212,168,71,0.07)' : 'rgba(184,134,11,0.07)',
                border: '1px solid rgba(212,168,71,0.25)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '64px',
                boxShadow: isDark ? '0 0 60px rgba(212,168,71,0.15)' : '0 0 40px rgba(184,134,11,0.1)',
                animation: 'float 5s ease-in-out infinite',
              }}>𝄞</div>

              {/* Orbiting feature pills */}
              {FEATURES.slice(0, 5).map((f, i) => {
                const angle = (i / 5) * Math.PI * 2 - Math.PI / 2
                const r = 170
                const cx = 160, cy = 260
                const x = cx + Math.cos(angle) * r
                const y = cy + Math.sin(angle) * r * 0.75
                return (
                  <button key={f.title} onClick={() => setActivePage(f.page)} style={{
                    position: 'absolute',
                    left: `${x}px`, top: `${y}px`,
                    transform: 'translate(-50%, -50%)',
                    display: 'flex', alignItems: 'center', gap: '7px',
                    padding: '8px 14px',
                    background: isDark ? 'rgba(13,13,26,0.9)' : 'rgba(255,255,255,0.9)',
                    border: `1px solid ${f.accent}35`,
                    borderRadius: '30px',
                    backdropFilter: 'blur(12px)',
                    cursor: 'pointer',
                    transition: 'all 0.25s',
                    boxShadow: `0 4px 20px ${f.accent}15`,
                    whiteSpace: 'nowrap',
                  }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translate(-50%, -50%) scale(1.08)'; (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 30px ${f.accent}35` }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translate(-50%, -50%) scale(1)'; (e.currentTarget as HTMLElement).style.boxShadow = `0 4px 20px ${f.accent}15` }}
                  >
                    <span style={{ fontSize: '14px' }}>{f.icon}</span>
                    <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '12px', fontWeight: '600', color: 'var(--text-primary)' }}>{f.title}</span>
                    <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '10px', color: f.accent, background: f.accent + '18', padding: '1px 6px', borderRadius: '10px', border: `1px solid ${f.accent}30` }}>{f.tag}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 2: FEATURE CARDS ── */}
      <section style={{ position: 'relative', zIndex: 1, paddingTop: '40px', paddingBottom: '80px' }}>
        <div className="container">

          {/* Section header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div className="section-label">Everything You Need</div>
              <h2 className="section-title" style={{ marginBottom: 0 }}>Six ways to learn</h2>
            </div>
            <button className="btn-ghost" onClick={() => setActivePage('theory')} style={{ fontSize: '13px', padding: '10px 22px' }}>
              View All →
            </button>
          </div>

          {/* Cards grid — asymmetric */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            {FEATURES.map((f, i) => (
              <button
                key={f.title}
                onClick={() => setActivePage(f.page)}
                onMouseEnter={() => setHoveredCard(i)}
                onMouseLeave={() => setHoveredCard(null)}
                style={{
                  background: 'var(--bg-card)',
                  border: `1px solid ${hoveredCard === i ? f.accent + '40' : 'var(--border)'}`,
                  borderRadius: '20px',
                  padding: '32px 28px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  transform: hoveredCard === i ? 'translateY(-6px)' : 'translateY(0)',
                  boxShadow: hoveredCard === i ? `0 20px 50px ${f.accent}18, var(--shadow)` : 'var(--shadow)',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* Glow spot on hover */}
                <div style={{
                  position: 'absolute', top: '-30px', right: '-30px',
                  width: '120px', height: '120px', borderRadius: '50%',
                  background: `radial-gradient(circle, ${f.accent}25 0%, transparent 70%)`,
                  opacity: hoveredCard === i ? 1 : 0,
                  transition: 'opacity 0.3s',
                  pointerEvents: 'none',
                }} />

                {/* Tag */}
                <div style={{ marginBottom: '18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{
                    fontFamily: 'DM Mono, monospace', fontSize: '10px', letterSpacing: '0.15em',
                    textTransform: 'uppercase', color: f.accent,
                    background: f.accent + '14', padding: '4px 10px', borderRadius: '20px',
                    border: `1px solid ${f.accent}28`,
                  }}>{f.tag}</span>
                  <span style={{ fontSize: '28px', transition: 'transform 0.3s', transform: hoveredCard === i ? 'scale(1.15) rotate(-5deg)' : 'none' }}>{f.icon}</span>
                </div>

                <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '4px', lineHeight: 1.2 }}>{f.title}</div>
                <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '11px', color: f.accent, marginBottom: '12px', letterSpacing: '0.05em' }}>{f.subtitle}</div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.65' }}>{f.desc}</div>

                <div style={{ marginTop: '22px', display: 'flex', alignItems: 'center', gap: '6px', color: f.accent, fontSize: '13px', fontWeight: '600', transition: 'gap 0.2s', ...(hoveredCard === i ? { gap: '10px' } : {}) }}>
                  <span>Open</span>
                  <span style={{ transition: 'transform 0.2s', transform: hoveredCard === i ? 'translateX(4px)' : 'none' }}>→</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 3: HOW IT WORKS ── */}
      <section style={{ position: 'relative', zIndex: 1, paddingBottom: '100px' }}>
        <div className="container">
          <div style={{
            background: isDark
              ? 'linear-gradient(135deg, rgba(212,168,71,0.06) 0%, rgba(45,212,200,0.04) 50%, rgba(155,127,232,0.05) 100%)'
              : 'linear-gradient(135deg, rgba(184,134,11,0.05) 0%, rgba(14,158,148,0.04) 100%)',
            border: '1px solid var(--border)',
            borderRadius: '28px',
            padding: '56px 48px',
            position: 'relative',
            overflow: 'hidden',
          }}>
            {/* Background text */}
            <div style={{ position: 'absolute', right: '40px', bottom: '-20px', fontFamily: 'Playfair Display, serif', fontSize: '160px', fontWeight: '900', color: isDark ? 'rgba(212,168,71,0.04)' : 'rgba(184,134,11,0.05)', lineHeight: 1, pointerEvents: 'none', userSelect: 'none' }}>♩</div>

            <div style={{ maxWidth: '480px', marginBottom: '48px' }}>
              <div className="section-label">The Method</div>
              <h2 className="section-title">Three steps to musical fluency</h2>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7', fontSize: '16px' }}>Whether you're a complete beginner or brushing up on theory, Harmonia meets you where you are.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px' }}>
              {[
                { step: '01', icon: '📖', title: 'Learn the Concepts', desc: 'Start with notes, intervals, and scales. Our theory section breaks down complex ideas into clear, visual lessons.' , color: '#d4a847' },
                { step: '02', icon: '🎧', title: 'Train Your Ear', desc: 'Use the ear training quiz to identify what you\'re learning by sound. Hearing is understanding.', color: '#2dd4c8' },
                { step: '03', icon: '🎹', title: 'Play & Experiment', desc: 'Apply everything in the Playground. Build chord progressions, use the metronome, make real music.', color: '#9b7fe8' },
              ].map(step => (
                <div key={step.step} style={{ position: 'relative' }}>
                  <div style={{
                    fontFamily: 'Playfair Display, serif', fontSize: '64px', fontWeight: '900',
                    color: step.color, opacity: 0.12, lineHeight: 1, marginBottom: '-16px',
                  }}>{step.step}</div>
                  <div style={{ fontSize: '28px', marginBottom: '12px' }}>{step.icon}</div>
                  <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '8px' }}>{step.title}</div>
                  <div style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.7' }}>{step.desc}</div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '48px', paddingTop: '32px', borderTop: '1px solid var(--border)', display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
              <button className="btn-primary" onClick={() => setActivePage('theory')} style={{ fontSize: '14px', padding: '13px 30px' }}>Start with Theory →</button>
              <button className="btn-ghost" onClick={() => setActivePage('ear-training')} style={{ fontSize: '14px', padding: '12px 26px' }}>Try Ear Training</button>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        @media (max-width: 900px) {
          .hero-grid { grid-template-columns: 1fr !important; }
          .hero-visual { display: none !important; }
          .feature-grid { grid-template-columns: 1fr 1fr !important; }
          .steps-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 600px) {
          .feature-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
