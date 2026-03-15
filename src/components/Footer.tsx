import type { Page } from '../App'

interface FooterProps {
  setActivePage: (page: Page) => void
}

const LINKS: { key: Page; label: string }[] = [
  { key: 'home', label: 'Home' },
  { key: 'theory', label: 'Music Theory' },
  { key: 'instruments', label: 'Instruments' },
  { key: 'ear-training', label: 'Ear Training' },
  { key: 'chord-progression', label: 'Chord Builder' },
  { key: 'metronome', label: 'Metronome' },
  { key: 'playground', label: 'Playground' },
]

export default function Footer({ setActivePage }: FooterProps) {
  return (
    <footer style={{ borderTop: '1px solid var(--border)', padding: '48px 24px', background: 'rgba(0,0,0,0.1)' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <svg width="32" height="32" viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="38" height="38" rx="10" fill="url(#footerLogoGrad)"/>
            <line x1="7" y1="13" x2="31" y2="13" stroke="rgba(8,8,16,0.35)" strokeWidth="1.2" strokeLinecap="round"/>
            <line x1="7" y1="17" x2="31" y2="17" stroke="rgba(8,8,16,0.35)" strokeWidth="1.2" strokeLinecap="round"/>
            <line x1="7" y1="21" x2="31" y2="21" stroke="rgba(8,8,16,0.35)" strokeWidth="1.2" strokeLinecap="round"/>
            <line x1="7" y1="25" x2="31" y2="25" stroke="rgba(8,8,16,0.35)" strokeWidth="1.2" strokeLinecap="round"/>
            <ellipse cx="14" cy="24" rx="4" ry="3" transform="rotate(-15 14 24)" fill="rgba(8,8,16,0.75)"/>
            <line x1="17.6" y1="22.5" x2="17.6" y2="10" stroke="rgba(8,8,16,0.75)" strokeWidth="1.6" strokeLinecap="round"/>
            <path d="M17.6 10 Q26 13 22 19" stroke="rgba(8,8,16,0.75)" strokeWidth="1.6" strokeLinecap="round" fill="none"/>
            <defs>
              <linearGradient id="footerLogoGrad" x1="0" y1="0" x2="38" y2="38" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#d4a847"/><stop offset="100%" stopColor="#8a6408"/>
              </linearGradient>
            </defs>
          </svg>
          <div style={{ lineHeight: 1 }}>
            <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '17px', fontWeight: '900', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>Notara</div>
            <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '9px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--accent-gold)', marginTop: '2px' }}>Music Studio</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          {LINKS.map(link => (
            <button key={link.key} onClick={() => setActivePage(link.key)} style={{
              background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '13px',
              fontFamily: 'DM Sans, sans-serif', cursor: 'pointer', transition: 'color 0.2s',
            }}
              onMouseEnter={e => (e.target as HTMLButtonElement).style.color = 'var(--accent-gold)'}
              onMouseLeave={e => (e.target as HTMLButtonElement).style.color = 'var(--text-muted)'}
            >{link.label}</button>
          ))}
        </div>

        <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'DM Mono, monospace' }}>Built with ♪ for music learners</div>
      </div>
    </footer>
  )
}
