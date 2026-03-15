import { useState, useEffect } from 'react'
import { useTheme } from '../App'
import type { Page } from '../App'

interface NavbarProps {
  activePage: Page
  setActivePage: (page: Page) => void
}

export default function Navbar({ activePage, setActivePage }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { theme, toggleTheme } = useTheme()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const navLinks: { key: Page; label: string }[] = [
    { key: 'home', label: 'Home' },
    { key: 'theory', label: 'Theory' },
    { key: 'instruments', label: 'Instruments' },
    { key: 'ear-training', label: 'Ear Training' },
    { key: 'chord-progression', label: 'Chords' },
    { key: 'metronome', label: 'Metronome' },
    { key: 'playground', label: 'Playground' },
  ]

  const isDark = theme === 'dark'

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      padding: '0 24px', transition: 'all 0.3s ease',
      background: scrolled ? (isDark ? 'rgba(8,8,16,0.92)' : 'rgba(245,242,236,0.92)') : 'transparent',
      backdropFilter: scrolled ? 'blur(20px)' : 'none',
      borderBottom: scrolled ? '1px solid var(--border)' : '1px solid transparent',
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '68px' }}>
        <button onClick={() => setActivePage('home')} style={{ display: 'flex', alignItems: 'center', gap: '11px', background: 'none', border: 'none', cursor: 'pointer' }}>
          {/* Logo mark — stave + note */}
          <svg width="38" height="38" viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="38" height="38" rx="10" fill="url(#logoGrad)"/>
            {/* Stave lines */}
            <line x1="7" y1="13" x2="31" y2="13" stroke="rgba(8,8,16,0.35)" strokeWidth="1.2" strokeLinecap="round"/>
            <line x1="7" y1="17" x2="31" y2="17" stroke="rgba(8,8,16,0.35)" strokeWidth="1.2" strokeLinecap="round"/>
            <line x1="7" y1="21" x2="31" y2="21" stroke="rgba(8,8,16,0.35)" strokeWidth="1.2" strokeLinecap="round"/>
            <line x1="7" y1="25" x2="31" y2="25" stroke="rgba(8,8,16,0.35)" strokeWidth="1.2" strokeLinecap="round"/>
            {/* Filled note head */}
            <ellipse cx="14" cy="24" rx="4" ry="3" transform="rotate(-15 14 24)" fill="rgba(8,8,16,0.75)"/>
            {/* Stem */}
            <line x1="17.6" y1="22.5" x2="17.6" y2="10" stroke="rgba(8,8,16,0.75)" strokeWidth="1.6" strokeLinecap="round"/>
            {/* Flag */}
            <path d="M17.6 10 Q26 13 22 19" stroke="rgba(8,8,16,0.75)" strokeWidth="1.6" strokeLinecap="round" fill="none"/>
            <defs>
              <linearGradient id="logoGrad" x1="0" y1="0" x2="38" y2="38" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#d4a847"/>
                <stop offset="100%" stopColor="#8a6408"/>
              </linearGradient>
            </defs>
          </svg>
          {/* Wordmark */}
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
            <span style={{ fontFamily: 'Playfair Display, serif', fontSize: '18px', fontWeight: '900', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>Notara</span>
            <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '9px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--accent-gold)', marginTop: '1px' }}>Music Studio</span>
          </div>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }} className="desktop-nav">
          {navLinks.map(link => (
            <button key={link.key} onClick={() => setActivePage(link.key)} style={{
              background: activePage === link.key ? 'rgba(212,168,71,0.1)' : 'none',
              border: activePage === link.key ? '1px solid rgba(212,168,71,0.25)' : '1px solid transparent',
              borderRadius: '8px', padding: '7px 11px',
              color: activePage === link.key ? 'var(--accent-gold)' : 'var(--text-secondary)',
              fontFamily: 'DM Sans, sans-serif', fontSize: '13px', fontWeight: '500',
              cursor: 'pointer', transition: 'all 0.2s ease',
            }}>{link.label}</button>
          ))}
        </div>

        <button onClick={toggleTheme} title="Toggle theme" style={{
          width: '52px', height: '28px', borderRadius: '14px',
          background: isDark ? 'rgba(212,168,71,0.15)' : 'rgba(184,134,11,0.12)',
          border: '1px solid var(--border-accent)', cursor: 'pointer',
          position: 'relative', transition: 'all 0.3s', flexShrink: 0,
        }}>
          <div style={{
            width: '20px', height: '20px', borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--accent-gold), var(--accent-gold-dim))',
            position: 'absolute', top: '3px', left: isDark ? '4px' : '28px',
            transition: 'left 0.3s ease', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px',
          }}>{isDark ? '🌙' : '☀️'}</div>
        </button>
      </div>

      {mobileOpen && (
        <div style={{ padding: '12px 0 20px', borderTop: '1px solid var(--border)' }}>
          {navLinks.map(link => (
            <button key={link.key} onClick={() => { setActivePage(link.key); setMobileOpen(false) }} style={{
              display: 'block', width: '100%', textAlign: 'left',
              background: activePage === link.key ? 'rgba(212,168,71,0.08)' : 'none',
              border: 'none', padding: '12px 16px',
              color: activePage === link.key ? 'var(--accent-gold)' : 'var(--text-secondary)',
              fontFamily: 'DM Sans, sans-serif', fontSize: '15px', cursor: 'pointer',
            }}>{link.label}</button>
          ))}
        </div>
      )}

      <style>{`@media (max-width: 900px) { .desktop-nav { display: none !important; } }`}</style>
    </nav>
  )
}
