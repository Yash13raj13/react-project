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
            <rect width="38" height="38" rx="10" fill="url(#groveFooterGrad)"/>
            <path d="M24 13.5 A8 8 0 1 0 27 20 L27 20 L22 20" stroke="rgba(8,8,16,0.8)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            <line x1="27" y1="20" x2="27" y2="11" stroke="rgba(8,8,16,0.8)" strokeWidth="2" strokeLinecap="round"/>
            <path d="M27 11 Q32 13.5 30 17" stroke="rgba(8,8,16,0.8)" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
            <defs>
              <linearGradient id="groveFooterGrad" x1="0" y1="0" x2="38" y2="38" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#d4a847"/><stop offset="100%" stopColor="#8a6408"/>
              </linearGradient>
            </defs>
          </svg>
          <div style={{ lineHeight: 1 }}>
            <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '17px', fontWeight: '900', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>Grove</div>
            <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '9px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--accent-gold)', marginTop: '2px' }}>Learn Music</div>
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
