import { useState, useRef, useEffect } from 'react'

const PRESETS = [
  { name: 'Largo',    bpm: 50  },
  { name: 'Andante',  bpm: 76  },
  { name: 'Moderato', bpm: 100 },
  { name: 'Allegro',  bpm: 132 },
  { name: 'Vivace',   bpm: 168 },
  { name: 'Presto',   bpm: 200 },
]

const TIME_SIGS = ['2/4', '3/4', '4/4', '6/8', '7/8']

export default function Metronome() {
  const [bpm, setBpm]           = useState(120)
  const [isPlaying, setIsPlaying] = useState(false)
  const [beat, setBeat]         = useState(0)          // 0-based current beat shown in UI
  const [timeSig, setTimeSig]   = useState('4/4')
  const [accent, setAccent]     = useState(true)
  const [swingAngle, setSwingAngle] = useState(0)      // –30 or +30
  const [flash, setFlash]       = useState(false)      // pendulum bob flash
  const [tapTimes, setTapTimes] = useState<number[]>([])

  // Refs that the interval closure reads — always current
  const bpmRef          = useRef(bpm)
  const beatsPerBarRef  = useRef(parseInt(timeSig.split('/')[0]))
  const accentRef       = useRef(accent)
  const beatCountRef    = useRef(0)       // running beat counter inside interval
  const intervalRef     = useRef<ReturnType<typeof setInterval> | null>(null)
  const ctxRef          = useRef<AudioContext | null>(null)
  const dirRef          = useRef(1)       // pendulum direction

  // Keep refs in sync with state
  useEffect(() => { bpmRef.current = bpm }, [bpm])
  useEffect(() => { beatsPerBarRef.current = parseInt(timeSig.split('/')[0]) }, [timeSig])
  useEffect(() => { accentRef.current = accent }, [accent])

  function getCtx() {
    if (!ctxRef.current || ctxRef.current.state === 'closed') {
      ctxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
    }
    return ctxRef.current
  }

  function playClick(accented: boolean) {
    const ctx = getCtx()
    if (ctx.state === 'suspended') ctx.resume()
    const now = ctx.currentTime
    const osc  = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'square'
    osc.frequency.value = accented ? 1100 : 750
    gain.gain.setValueAtTime(accented ? 0.45 : 0.28, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(now)
    osc.stop(now + 0.06)
  }

  function doTick() {
    const bpb       = beatsPerBarRef.current
    const thisBeat  = beatCountRef.current % bpb
    beatCountRef.current += 1

    // Update UI
    setBeat(thisBeat)
    setFlash(true)
    setTimeout(() => setFlash(false), 80)

    // Swing pendulum
    dirRef.current = dirRef.current * -1
    setSwingAngle(dirRef.current * 30)

    // Sound
    playClick(accentRef.current && thisBeat === 0)
  }

  function startMetronome() {
    if (intervalRef.current) clearInterval(intervalRef.current)
    beatCountRef.current = 0
    doTick()
    intervalRef.current = setInterval(() => {
      doTick()
    }, (60 / bpmRef.current) * 1000)
    setIsPlaying(true)
  }

  function stopMetronome() {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null }
    setIsPlaying(false)
    setBeat(0)
    setSwingAngle(0)
    setFlash(false)
    beatCountRef.current = 0
  }

  // When BPM changes while playing, restart interval at new speed
  useEffect(() => {
    if (!isPlaying) return
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = setInterval(() => { doTick() }, (60 / bpm) * 1000)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bpm, timeSig])

  // Cleanup on unmount
  useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current) }, [])

  function tapTempo() {
    const now    = Date.now()
    const recent = [...tapTimes, now].filter(t => now - t < 4000).slice(-8)
    setTapTimes(recent)
    if (recent.length >= 2) {
      const diffs = recent.slice(1).map((t, i) => t - recent[i])
      const avg   = diffs.reduce((a, b) => a + b, 0) / diffs.length
      setBpm(Math.max(20, Math.min(300, Math.round(60000 / avg))))
    }
  }

  const beatsPerBar = parseInt(timeSig.split('/')[0])
  const tempoLabel  = PRESETS.find(p => Math.abs(p.bpm - bpm) <= 12)?.name ?? 'Custom'

  return (
    <div style={{ paddingTop: '100px', paddingBottom: '80px', minHeight: '100vh' }}>
      <div className="container">

        {/* Header */}
        <div style={{ marginBottom: '40px' }}>
          <div className="section-label">Tools</div>
          <h1 className="section-title">Metronome</h1>
          <p className="section-subtitle">Practice with a steady beat. Tap tempo, choose your time signature, and build your internal clock.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', maxWidth: '820px' }}>

          {/* ── Left: Main unit ── */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '20px', padding: '36px 28px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>

            {/* Pendulum */}
            <div style={{ position: 'relative', width: '80px', height: '150px', display: 'flex', justifyContent: 'center' }}>
              {/* Pivot dot */}
              <div style={{ position: 'absolute', top: 0, width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-gold)', zIndex: 2, left: '50%', transform: 'translateX(-50%)' }} />
              {/* Rod */}
              <div style={{
                position: 'absolute', top: '4px',
                width: '3px', height: '120px',
                background: 'linear-gradient(to bottom, var(--accent-gold), rgba(212,168,71,0.3))',
                borderRadius: '2px',
                transformOrigin: 'top center',
                transform: `rotate(${swingAngle}deg)`,
                transition: isPlaying ? `transform ${(60 / bpm) * 480}ms ease-in-out` : 'transform 0.3s ease',
                left: 'calc(50% - 1.5px)',
              }}>
                {/* Bob */}
                <div style={{
                  position: 'absolute', bottom: '-12px', left: '-9px',
                  width: '21px', height: '21px', borderRadius: '50%',
                  background: flash
                    ? 'linear-gradient(135deg, var(--accent-gold), var(--accent-gold-dim))'
                    : 'var(--bg-surface)',
                  border: '2px solid var(--accent-gold)',
                  transition: 'background 0.05s, box-shadow 0.05s',
                  boxShadow: flash ? '0 0 18px rgba(212,168,71,0.8)' : 'none',
                }} />
              </div>
            </div>

            {/* Beat dots */}
            <div style={{ display: 'flex', gap: '10px' }}>
              {Array.from({ length: beatsPerBar }).map((_, i) => (
                <div key={i} style={{
                  width: '13px', height: '13px', borderRadius: '50%',
                  background: beat === i
                    ? (i === 0 && accent ? 'var(--accent-gold)' : 'var(--accent-teal)')
                    : 'var(--border)',
                  transition: 'background 0.06s, box-shadow 0.06s',
                  boxShadow: beat === i
                    ? `0 0 10px ${i === 0 && accent ? 'rgba(212,168,71,0.9)' : 'rgba(45,212,200,0.9)'}`
                    : 'none',
                }} />
              ))}
            </div>

            {/* BPM number */}
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '60px', fontWeight: '900', color: 'var(--accent-gold)', lineHeight: 1 }}>{bpm}</div>
              <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '0.15em', textTransform: 'uppercase', marginTop: '4px' }}>BPM · {tempoLabel}</div>
            </div>

            {/* Slider */}
            <div style={{ width: '100%' }}>
              <input
                type="range" min="20" max="300" value={bpm}
                onChange={e => setBpm(Number(e.target.value))}
                style={{ width: '100%' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'DM Mono, monospace', marginTop: '4px' }}>
                <span>20</span><span>300</span>
              </div>
            </div>

            {/* Play + Tap */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={isPlaying ? stopMetronome : startMetronome}
                style={{
                  width: '66px', height: '66px', borderRadius: '50%',
                  background: isPlaying
                    ? 'rgba(232,80,122,0.12)'
                    : 'linear-gradient(135deg, var(--accent-gold), var(--accent-gold-dim))',
                  border: isPlaying ? '2px solid var(--accent-rose)' : 'none',
                  color: isPlaying ? 'var(--accent-rose)' : '#080810',
                  fontSize: '24px', cursor: 'pointer', transition: 'all 0.2s',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >{isPlaying ? '⏹' : '▶'}</button>

              <button
                onClick={tapTempo}
                onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.94)')}
                onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
                style={{
                  flex: 1, height: '66px', borderRadius: '33px',
                  background: 'var(--bg-card-hover)', border: '1px solid var(--border-accent)',
                  color: 'var(--accent-gold)', fontFamily: 'DM Mono, monospace',
                  fontSize: '13px', fontWeight: '700', letterSpacing: '0.1em',
                  cursor: 'pointer', transition: 'transform 0.08s',
                }}>TAP</button>
            </div>
          </div>

          {/* ── Right: Settings ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* Time signature */}
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '22px' }}>
              <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-muted)', marginBottom: '12px' }}>Time Signature</div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {TIME_SIGS.map(ts => (
                  <button key={ts} onClick={() => { setTimeSig(ts); setBeat(0); beatCountRef.current = 0 }} style={{
                    padding: '8px 16px', borderRadius: '8px',
                    background: timeSig === ts ? 'rgba(212,168,71,0.14)' : 'transparent',
                    border: `1px solid ${timeSig === ts ? 'rgba(212,168,71,0.45)' : 'var(--border)'}`,
                    color: timeSig === ts ? 'var(--accent-gold)' : 'var(--text-secondary)',
                    fontFamily: 'DM Mono, monospace', fontSize: '13px', fontWeight: '600',
                    cursor: 'pointer', transition: 'all 0.18s',
                  }}>{ts}</button>
                ))}
              </div>
            </div>

            {/* Accent toggle */}
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '3px' }}>Accent Beat 1</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Louder click on the downbeat</div>
              </div>
              <button onClick={() => setAccent(a => !a)} style={{
                width: '48px', height: '26px', borderRadius: '13px',
                background: accent ? 'rgba(212,168,71,0.18)' : 'var(--bg-surface)',
                border: '1px solid var(--border-accent)', cursor: 'pointer',
                position: 'relative', transition: 'background 0.25s', flexShrink: 0,
              }}>
                <div style={{
                  width: '18px', height: '18px', borderRadius: '50%',
                  background: accent ? 'var(--accent-gold)' : 'var(--text-muted)',
                  position: 'absolute', top: '3px',
                  left: accent ? '26px' : '4px',
                  transition: 'left 0.25s, background 0.25s',
                }} />
              </button>
            </div>

            {/* Tempo presets */}
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '22px', flex: 1 }}>
              <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-muted)', marginBottom: '12px' }}>Tempo Presets</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {PRESETS.map(p => (
                  <button key={p.name} onClick={() => setBpm(p.bpm)} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '10px 12px', borderRadius: '8px',
                    background: Math.abs(bpm - p.bpm) <= 12 ? 'rgba(212,168,71,0.07)' : 'transparent',
                    border: `1px solid ${Math.abs(bpm - p.bpm) <= 12 ? 'rgba(212,168,71,0.22)' : 'transparent'}`,
                    cursor: 'pointer', transition: 'all 0.18s', width: '100%',
                  }}>
                    <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '13px', fontWeight: '500', color: 'var(--text-primary)' }}>{p.name}</span>
                    <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '12px', color: 'var(--accent-gold)' }}>{p.bpm} BPM</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
