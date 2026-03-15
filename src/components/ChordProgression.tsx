import { useState, useRef, useCallback } from 'react'

const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
const NOTE_FREQS: Record<string, number> = {
  'C3': 130.81, 'C#3': 138.59, 'D3': 146.83, 'D#3': 155.56, 'E3': 164.81, 'F3': 174.61,
  'F#3': 185.00, 'G3': 196.00, 'G#3': 207.65, 'A3': 220.00, 'A#3': 233.08, 'B3': 246.94,
  'C4': 261.63, 'C#4': 277.18, 'D4': 293.66, 'D#4': 311.13, 'E4': 329.63, 'F4': 349.23,
  'F#4': 369.99, 'G4': 392.00, 'G#4': 415.30, 'A4': 440.00, 'A#4': 466.16, 'B4': 493.88,
}

const CHORD_TYPES = [
  { symbol: '', name: 'Major', intervals: [0, 4, 7], color: '#d4a847' },
  { symbol: 'm', name: 'Minor', intervals: [0, 3, 7], color: '#9b7fe8' },
  { symbol: '7', name: 'Dom 7', intervals: [0, 4, 7, 10], color: '#e8507a' },
  { symbol: 'maj7', name: 'Maj 7', intervals: [0, 4, 7, 11], color: '#2dd4c8' },
  { symbol: 'm7', name: 'Min 7', intervals: [0, 3, 7, 10], color: '#4db8ff' },
  { symbol: 'sus4', name: 'Sus 4', intervals: [0, 5, 7], color: '#6bc96b' },
  { symbol: 'dim', name: 'Dim', intervals: [0, 3, 6], color: '#ff9f43' },
  { symbol: 'aug', name: 'Aug', intervals: [0, 4, 8], color: '#ff6b6b' },
]

const PROGRESSIONS = [
  { name: 'I–V–vi–IV (Pop)', chords: [{ root: 'C', type: '' }, { root: 'G', type: '' }, { root: 'A', type: 'm' }, { root: 'F', type: '' }] },
  { name: 'ii–V–I (Jazz)', chords: [{ root: 'D', type: 'm7' }, { root: 'G', type: '7' }, { root: 'C', type: 'maj7' }, { root: 'C', type: 'maj7' }] },
  { name: 'I–IV–V–I (Blues)', chords: [{ root: 'A', type: '7' }, { root: 'D', type: '7' }, { root: 'E', type: '7' }, { root: 'A', type: '7' }] },
  { name: 'vi–IV–I–V (Minor)', chords: [{ root: 'A', type: 'm' }, { root: 'F', type: '' }, { root: 'C', type: '' }, { root: 'G', type: '' }] },
  { name: 'I–vi–IV–V (50s)', chords: [{ root: 'C', type: '' }, { root: 'A', type: 'm' }, { root: 'F', type: '' }, { root: 'G', type: '' }] },
]

interface Chord { root: string; type: string }

function getChordFreqs(root: string, typeSymbol: string): number[] {
  const ct = CHORD_TYPES.find(c => c.symbol === typeSymbol) || CHORD_TYPES[0]
  const rootIdx = NOTES.indexOf(root)
  return ct.intervals.map(i => {
    const noteIdx = (rootIdx + i) % 12
    const noteName = NOTES[noteIdx]
    const key3 = noteName + '3'
    const key4 = noteName + '4'
    return NOTE_FREQS[key3] || NOTE_FREQS[key4] || 261.63
  })
}

export default function ChordProgression() {
  const [progression, setProgression] = useState<Chord[]>([
    { root: 'C', type: '' }, { root: 'G', type: '' }, { root: 'A', type: 'm' }, { root: 'F', type: '' },
  ])
  const [activeChord, setActiveChord] = useState<number | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [tempo, setTempo] = useState(80)
  const [addRoot, setAddRoot] = useState('C')
  const [addType, setAddType] = useState('')
  const audioCtxRef = useRef<AudioContext | null>(null)
  const stopRef = useRef(false)

  const getCtx = () => {
    if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
    }
    return audioCtxRef.current
  }

  const playChord = useCallback((freqs: number[], startTime: number, duration: number, ctx: AudioContext) => {
    freqs.forEach(freq => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      const filter = ctx.createBiquadFilter()
      filter.type = 'lowpass'; filter.frequency.value = 3500
      osc.type = 'triangle'; osc.frequency.value = freq
      gain.gain.setValueAtTime(0, startTime)
      gain.gain.linearRampToValueAtTime(0.25, startTime + 0.05)
      gain.gain.linearRampToValueAtTime(0.2, startTime + duration * 0.7)
      gain.gain.linearRampToValueAtTime(0, startTime + duration)
      osc.connect(filter); filter.connect(gain); gain.connect(ctx.destination)
      osc.start(startTime); osc.stop(startTime + duration)
    })
  }, [])

  const playSingleChord = (chord: Chord) => {
    const ctx = getCtx()
    if (ctx.state === 'suspended') ctx.resume()
    const freqs = getChordFreqs(chord.root, chord.type)
    playChord(freqs, ctx.currentTime, 1.5, ctx)
  }

  const playProgression = async () => {
    if (isPlaying) { stopRef.current = true; setIsPlaying(false); setActiveChord(null); return }
    stopRef.current = false
    setIsPlaying(true)
    const ctx = getCtx()
    if (ctx.state === 'suspended') ctx.resume()
    const beatDur = 60 / tempo * 2

    for (let i = 0; i < progression.length; i++) {
      if (stopRef.current) break
      setActiveChord(i)
      const freqs = getChordFreqs(progression[i].root, progression[i].type)
      playChord(freqs, ctx.currentTime, beatDur * 0.95, ctx)
      await new Promise(r => setTimeout(r, beatDur * 1000))
    }
    setIsPlaying(false)
    setActiveChord(null)
  }

  const loadPreset = (preset: typeof PROGRESSIONS[0]) => {
    setProgression(preset.chords)
  }

  const removeChord = (i: number) => setProgression(p => p.filter((_, idx) => idx !== i))
  const addChord = () => {
    if (progression.length < 8) setProgression(p => [...p, { root: addRoot, type: addType }])
  }

  return (
    <div style={{ paddingTop: '100px', paddingBottom: '80px', minHeight: '100vh' }}>
      <div className="container">
        <div style={{ marginBottom: '40px', animation: 'fadeUp 0.6s ease forwards' }}>
          <div className="section-label">Tools</div>
          <h1 className="section-title">Chord Progression Builder</h1>
          <p className="section-subtitle">Build, play, and experiment with chord progressions. Load classic patterns or create your own.</p>
        </div>

        {/* Presets */}
        <div style={{ marginBottom: '32px', animation: 'fadeUp 0.5s ease 0.1s both forwards', opacity: 0 }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'DM Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>Classic Progressions</div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {PROGRESSIONS.map(p => (
              <button key={p.name} onClick={() => loadPreset(p)} style={{
                padding: '8px 16px', borderRadius: '20px',
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                color: 'var(--text-secondary)', fontFamily: 'DM Sans, sans-serif', fontSize: '13px',
                cursor: 'pointer', transition: 'all 0.2s',
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-accent)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--accent-gold)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-secondary)' }}
              >{p.name}</button>
            ))}
          </div>
        </div>

        {/* Progression display */}
        <div style={{ animation: 'fadeUp 0.5s ease 0.15s both forwards', opacity: 0 }}>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '24px', alignItems: 'stretch' }}>
            {progression.map((chord, i) => {
              const ct = CHORD_TYPES.find(c => c.symbol === chord.type) || CHORD_TYPES[0]
              const isActive = activeChord === i
              return (
                <div key={i} style={{
                  position: 'relative',
                  minWidth: '100px',
                  padding: '20px 16px',
                  background: isActive ? ct.color + '20' : 'var(--bg-card)',
                  border: `1px solid ${isActive ? ct.color + '70' : 'var(--border)'}`,
                  borderRadius: '14px',
                  textAlign: 'center',
                  transition: 'all 0.15s',
                  boxShadow: isActive ? `0 0 24px ${ct.color}40` : 'var(--shadow)',
                  cursor: 'pointer',
                }} onClick={() => playSingleChord(chord)}>
                  <button onClick={e => { e.stopPropagation(); removeChord(i) }} style={{
                    position: 'absolute', top: '6px', right: '8px',
                    background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '14px', lineHeight: 1,
                  }}>×</button>
                  <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '24px', fontWeight: '700', color: isActive ? ct.color : 'var(--text-primary)' }}>{chord.root}</div>
                  <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '12px', color: ct.color, marginTop: '2px' }}>{chord.type || '△'}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', fontFamily: 'DM Mono, monospace' }}>{ct.name}</div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '6px' }}>▶ click</div>
                </div>
              )
            })}

            {/* Add chord button */}
            {progression.length < 8 && (
              <div style={{
                minWidth: '100px', padding: '20px 16px',
                background: 'transparent', border: '2px dashed var(--border)',
                borderRadius: '14px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px',
              }}>
                <select value={addRoot} onChange={e => setAddRoot(e.target.value)} style={{ width: '70px', textAlign: 'center' }}>
                  {NOTES.map(n => <option key={n} value={n}>{n}</option>)}
                </select>
                <select value={addType} onChange={e => setAddType(e.target.value)} style={{ width: '70px', textAlign: 'center' }}>
                  {CHORD_TYPES.map(ct => <option key={ct.symbol} value={ct.symbol}>{ct.name}</option>)}
                </select>
                <button onClick={addChord} style={{
                  width: '36px', height: '36px', borderRadius: '50%',
                  background: 'rgba(212,168,71,0.1)', border: '1px solid var(--border-accent)',
                  color: 'var(--accent-gold)', fontSize: '20px', cursor: 'pointer', transition: 'all 0.2s',
                }}>+</button>
              </div>
            )}
          </div>

          {/* Playback controls */}
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
            <button onClick={playProgression} style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '14px 32px', borderRadius: '50px',
              background: isPlaying ? 'rgba(232,80,122,0.12)' : 'linear-gradient(135deg, var(--accent-gold), var(--accent-gold-dim))',
              border: isPlaying ? '1px solid var(--accent-rose)' : 'none',
              color: isPlaying ? 'var(--accent-rose)' : '#080810',
              fontFamily: 'DM Sans, sans-serif', fontSize: '15px', fontWeight: '600',
              cursor: 'pointer', transition: 'all 0.2s',
            }}>{isPlaying ? '⏹ Stop' : '▶ Play All'}</button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'DM Mono, monospace' }}>TEMPO</span>
              <input type="range" min="40" max="200" value={tempo} onChange={e => setTempo(Number(e.target.value))} style={{ width: '120px' }} />
              <span style={{ fontSize: '13px', color: 'var(--accent-gold)', fontFamily: 'DM Mono, monospace', minWidth: '50px' }}>{tempo} BPM</span>
            </div>
          </div>
        </div>

        {/* Chord type reference */}
        <div style={{ marginTop: '48px', animation: 'fadeUp 0.5s ease 0.3s both forwards', opacity: 0 }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'DM Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px' }}>Chord Types</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '10px' }}>
            {CHORD_TYPES.map(ct => (
              <div key={ct.symbol} className="glass-card" style={{ padding: '14px 18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>{ct.name}</span>
                  <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '12px', color: ct.color, background: ct.color + '18', padding: '2px 8px', borderRadius: '6px' }}>{ct.symbol || '△'}</span>
                </div>
                <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '11px', color: 'var(--text-muted)' }}>{ct.intervals.join(' – ')} semitones</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
