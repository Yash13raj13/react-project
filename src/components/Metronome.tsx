import { useState, useRef, useEffect, useCallback } from 'react'

const PRESETS = [
  { name: 'Largo', bpm: 50 }, { name: 'Andante', bpm: 76 }, { name: 'Moderato', bpm: 100 },
  { name: 'Allegro', bpm: 132 }, { name: 'Vivace', bpm: 168 }, { name: 'Presto', bpm: 200 },
]

const TIME_SIGS = ['2/4', '3/4', '4/4', '6/8', '7/8']

export default function Metronome() {
  const [bpm, setBpm] = useState(120)
  const [isPlaying, setIsPlaying] = useState(false)
  const [beat, setBeat] = useState(0)
  const [timeSig, setTimeSig] = useState('4/4')
  const [accent, setAccent] = useState(true)
  const [pendulumAngle, setPendulumAngle] = useState(0)
  const [tapTimes, setTapTimes] = useState<number[]>([])
  const [isBeat, setIsBeat] = useState(false)

  const intervalRef = useRef<number | null>(null)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const beatRef = useRef(0)
  const bpmRef = useRef(bpm)

  useEffect(() => { bpmRef.current = bpm }, [bpm])

  const getCtx = () => {
    if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
    }
    return audioCtxRef.current
  }

  const beatsPerBar = parseInt(timeSig.split('/')[0])

  const playClick = useCallback((isAccented: boolean) => {
    const ctx = getCtx()
    if (ctx.state === 'suspended') ctx.resume()
    const now = ctx.currentTime

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'square'
    osc.frequency.value = isAccented ? 1200 : 800
    gain.gain.setValueAtTime(isAccented ? 0.4 : 0.25, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05)
    osc.connect(gain); gain.connect(ctx.destination)
    osc.start(now); osc.stop(now + 0.05)
  }, [])

  const tick = useCallback(() => {
    const nextBeat = (beatRef.current + 1) % beatsPerBar
    beatRef.current = nextBeat
    setBeat(nextBeat)
    setIsBeat(true)
    setTimeout(() => setIsBeat(false), 100)
    setPendulumAngle(prev => prev > 0 ? -30 : 30)
    playClick(accent && nextBeat === 0)
  }, [beatsPerBar, playClick, accent])

  const start = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    beatRef.current = -1
    tick()
    intervalRef.current = window.setInterval(tick, (60 / bpmRef.current) * 1000)
    setIsPlaying(true)
  }, [tick])

  const stop = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    setIsPlaying(false)
    setBeat(0)
    setPendulumAngle(0)
  }, [])

  useEffect(() => {
    if (isPlaying) {
      if (intervalRef.current) clearInterval(intervalRef.current)
      intervalRef.current = window.setInterval(tick, (60 / bpm) * 1000)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [bpm, isPlaying, tick])

  useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current) }, [])

  const tapTempo = () => {
    const now = Date.now()
    const recent = [...tapTimes, now].filter(t => now - t < 3000).slice(-8)
    setTapTimes(recent)
    if (recent.length >= 2) {
      const diffs = recent.slice(1).map((t, i) => t - recent[i])
      const avg = diffs.reduce((a, b) => a + b, 0) / diffs.length
      const newBpm = Math.round(60000 / avg)
      setBpm(Math.max(20, Math.min(300, newBpm)))
    }
  }

  const tempo = PRESETS.find(p => bpm >= p.bpm - 12 && bpm <= p.bpm + 12)?.name || 'Custom'

  return (
    <div style={{ paddingTop: '100px', paddingBottom: '80px', minHeight: '100vh' }}>
      <div className="container">
        <div style={{ marginBottom: '48px', animation: 'fadeUp 0.6s ease forwards' }}>
          <div className="section-label">Tools</div>
          <h1 className="section-title">Metronome</h1>
          <p className="section-subtitle">Practice with a steady beat. Tap tempo, choose time signature, and train your internal clock.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', maxWidth: '800px', animation: 'fadeUp 0.5s ease 0.1s both forwards', opacity: 0 }}>
          {/* Main metronome */}
          <div className="glass-card" style={{ padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '28px' }}>
            {/* Pendulum visual */}
            <div style={{ position: 'relative', width: '100px', height: '160px', display: 'flex', justifyContent: 'center' }}>
              <div style={{
                width: '3px', height: '130px',
                background: 'linear-gradient(to bottom, var(--accent-gold), transparent)',
                transformOrigin: 'top center',
                transform: `rotate(${pendulumAngle}deg)`,
                transition: isPlaying ? `transform ${(60 / bpm) * 500}ms ease-in-out` : 'none',
                position: 'absolute', top: 0,
                borderRadius: '2px',
              }}>
                <div style={{
                  width: '20px', height: '20px', borderRadius: '50%',
                  background: isBeat ? 'linear-gradient(135deg, var(--accent-gold), var(--accent-gold-dim))' : 'var(--bg-card-hover)',
                  border: '2px solid var(--accent-gold)',
                  position: 'absolute', bottom: '-10px', left: '-9px',
                  transition: 'background 0.05s',
                  boxShadow: isBeat ? '0 0 20px rgba(212,168,71,0.7)' : 'none',
                }} />
              </div>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-gold)', position: 'absolute', top: 0 }} />
            </div>

            {/* Beat dots */}
            <div style={{ display: 'flex', gap: '10px' }}>
              {Array.from({ length: beatsPerBar }).map((_, i) => (
                <div key={i} style={{
                  width: '14px', height: '14px', borderRadius: '50%',
                  background: beat === i
                    ? (i === 0 && accent ? 'var(--accent-gold)' : 'var(--accent-teal)')
                    : 'var(--border)',
                  transition: 'background 0.05s',
                  boxShadow: beat === i ? `0 0 10px ${i === 0 && accent ? 'rgba(212,168,71,0.8)' : 'rgba(45,212,200,0.8)'}` : 'none',
                }} />
              ))}
            </div>

            {/* BPM display */}
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '56px', fontWeight: '900', color: 'var(--accent-gold)', lineHeight: 1 }}>{bpm}</div>
              <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.15em', marginTop: '4px' }}>BPM · {tempo}</div>
            </div>

            {/* BPM slider */}
            <div style={{ width: '100%' }}>
              <input type="range" min="20" max="300" value={bpm} onChange={e => setBpm(Number(e.target.value))} style={{ width: '100%' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'DM Mono, monospace', marginTop: '4px' }}>
                <span>20</span><span>300</span>
              </div>
            </div>

            {/* Play / Stop */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={isPlaying ? stop : start}
                style={{
                  width: '64px', height: '64px', borderRadius: '50%',
                  background: isPlaying ? 'rgba(232,80,122,0.15)' : 'linear-gradient(135deg, var(--accent-gold), var(--accent-gold-dim))',
                  border: isPlaying ? '2px solid var(--accent-rose)' : 'none',
                  color: isPlaying ? 'var(--accent-rose)' : '#080810',
                  fontSize: '24px', cursor: 'pointer', transition: 'all 0.2s',
                  boxShadow: isPlaying ? '0 0 20px rgba(212,168,71,0.3)' : 'none',
                }}
              >{isPlaying ? '⏹' : '▶'}</button>

              <button onClick={tapTempo} style={{
                padding: '0 24px', height: '64px', borderRadius: '32px',
                background: 'var(--bg-card-hover)', border: '1px solid var(--border-accent)',
                color: 'var(--accent-gold)', fontFamily: 'DM Mono, monospace', fontSize: '12px',
                cursor: 'pointer', transition: 'all 0.1s', fontWeight: '600', letterSpacing: '0.05em',
              }} onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.95)')}
                onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}>TAP</button>
            </div>
          </div>

          {/* Settings panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Time signature */}
            <div className="glass-card" style={{ padding: '24px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'DM Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '14px' }}>Time Signature</div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {TIME_SIGS.map(ts => (
                  <button key={ts} onClick={() => { setTimeSig(ts); setBeat(0) }} style={{
                    padding: '8px 16px', borderRadius: '8px',
                    background: timeSig === ts ? 'rgba(212,168,71,0.15)' : 'var(--bg-surface)',
                    border: `1px solid ${timeSig === ts ? 'rgba(212,168,71,0.4)' : 'var(--border)'}`,
                    color: timeSig === ts ? 'var(--accent-gold)' : 'var(--text-secondary)',
                    fontFamily: 'DM Mono, monospace', fontSize: '13px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s',
                  }}>{ts}</button>
                ))}
              </div>
            </div>

            {/* Accent toggle */}
            <div className="glass-card" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '4px' }}>Accent Beat 1</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Louder click on the first beat</div>
              </div>
              <button onClick={() => setAccent(a => !a)} style={{
                width: '48px', height: '26px', borderRadius: '13px',
                background: accent ? 'rgba(212,168,71,0.2)' : 'var(--bg-surface)',
                border: '1px solid var(--border-accent)', cursor: 'pointer', position: 'relative', transition: 'all 0.3s',
              }}>
                <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: accent ? 'var(--accent-gold)' : 'var(--text-muted)', position: 'absolute', top: '3px', left: accent ? '26px' : '4px', transition: 'left 0.3s' }} />
              </button>
            </div>

            {/* Tempo presets */}
            <div className="glass-card" style={{ padding: '24px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'DM Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '14px' }}>Tempo Presets</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {PRESETS.map(p => (
                  <button key={p.name} onClick={() => setBpm(p.bpm)} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '10px 14px', borderRadius: '8px',
                    background: bpm === p.bpm ? 'rgba(212,168,71,0.08)' : 'transparent',
                    border: `1px solid ${bpm === p.bpm ? 'rgba(212,168,71,0.25)' : 'transparent'}`,
                    cursor: 'pointer', transition: 'all 0.2s',
                  }}>
                    <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '13px', color: 'var(--text-primary)', fontWeight: '500' }}>{p.name}</span>
                    <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '12px', color: 'var(--accent-gold)' }}>{p.bpm} BPM</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <style>{`@media (max-width: 640px) { .metronome-grid { grid-template-columns: 1fr !important; } }`}</style>
      </div>
    </div>
  )
}
