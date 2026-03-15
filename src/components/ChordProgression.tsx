import { useState, useRef } from 'react'

const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

const NOTE_FREQS: Record<string, number> = {
  'C3':130.81,'C#3':138.59,'D3':146.83,'D#3':155.56,'E3':164.81,'F3':174.61,
  'F#3':185.00,'G3':196.00,'G#3':207.65,'A3':220.00,'A#3':233.08,'B3':246.94,
  'C4':261.63,'C#4':277.18,'D4':293.66,'D#4':311.13,'E4':329.63,'F4':349.23,
  'F#4':369.99,'G4':392.00,'G#4':415.30,'A4':440.00,'A#4':466.16,'B4':493.88,
}

const CHORD_TYPES = [
  { symbol: '',     name: 'Major',  intervals: [0,4,7],    color: '#d4a847' },
  { symbol: 'm',    name: 'Minor',  intervals: [0,3,7],    color: '#9b7fe8' },
  { symbol: '7',    name: 'Dom 7',  intervals: [0,4,7,10], color: '#e8507a' },
  { symbol: 'maj7', name: 'Maj 7',  intervals: [0,4,7,11], color: '#2dd4c8' },
  { symbol: 'm7',   name: 'Min 7',  intervals: [0,3,7,10], color: '#4db8ff' },
  { symbol: 'sus4', name: 'Sus 4',  intervals: [0,5,7],    color: '#6bc96b' },
  { symbol: 'dim',  name: 'Dim',    intervals: [0,3,6],    color: '#ff9f43' },
  { symbol: 'aug',  name: 'Aug',    intervals: [0,4,8],    color: '#ff6b6b' },
]

const PRESETS = [
  { name: 'I–V–vi–IV (Pop)',    chords: [{root:'C',type:''},{root:'G',type:''},{root:'A',type:'m'},{root:'F',type:''}] },
  { name: 'ii–V–I (Jazz)',      chords: [{root:'D',type:'m7'},{root:'G',type:'7'},{root:'C',type:'maj7'},{root:'C',type:'maj7'}] },
  { name: 'I–IV–V (Blues)',     chords: [{root:'A',type:'7'},{root:'D',type:'7'},{root:'E',type:'7'},{root:'A',type:'7'}] },
  { name: 'vi–IV–I–V (Minor)',  chords: [{root:'A',type:'m'},{root:'F',type:''},{root:'C',type:''},{root:'G',type:''}] },
  { name: 'I–vi–IV–V (50s)',    chords: [{root:'C',type:''},{root:'A',type:'m'},{root:'F',type:''},{root:'G',type:''}] },
]

interface Chord { root: string; type: string }

function getFreqs(root: string, typeSymbol: string): number[] {
  const ct      = CHORD_TYPES.find(c => c.symbol === typeSymbol) ?? CHORD_TYPES[0]
  const rootIdx = NOTES.indexOf(root)
  return ct.intervals.map(semitones => {
    const noteIdx  = (rootIdx + semitones) % 12
    const noteName = NOTES[noteIdx]
    return NOTE_FREQS[noteName + '3'] ?? NOTE_FREQS[noteName + '4'] ?? 261.63
  })
}

export default function ChordProgression() {
  const [progression, setProgression] = useState<Chord[]>([
    { root: 'C', type: '' },
    { root: 'G', type: '' },
    { root: 'A', type: 'm' },
    { root: 'F', type: '' },
  ])
  const [activeChord, setActiveChord] = useState<number | null>(null)
  const [isPlaying,   setIsPlaying]   = useState(false)
  const [tempo,       setTempo]       = useState(80)
  const [addRoot,     setAddRoot]     = useState('C')
  const [addType,     setAddType]     = useState('')

  const ctxRef    = useRef<AudioContext | null>(null)
  const stopRef   = useRef(false)
  const timerRef  = useRef<ReturnType<typeof setTimeout> | null>(null)

  function getCtx() {
    if (!ctxRef.current || ctxRef.current.state === 'closed') {
      ctxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
    }
    return ctxRef.current
  }

  function playFreqs(freqs: number[], dur: number) {
    const ctx = getCtx()
    if (ctx.state === 'suspended') ctx.resume()
    const now = ctx.currentTime
    freqs.forEach(freq => {
      const osc    = ctx.createOscillator()
      const gain   = ctx.createGain()
      const filter = ctx.createBiquadFilter()
      filter.type            = 'lowpass'
      filter.frequency.value = 3200
      osc.type               = 'triangle'
      osc.frequency.value    = freq
      gain.gain.setValueAtTime(0, now)
      gain.gain.linearRampToValueAtTime(0.28, now + 0.04)
      gain.gain.setValueAtTime(0.22, now + dur * 0.65)
      gain.gain.linearRampToValueAtTime(0, now + dur)
      osc.connect(filter)
      filter.connect(gain)
      gain.connect(ctx.destination)
      osc.start(now)
      osc.stop(now + dur)
    })
  }

  function playSingle(chord: Chord) {
    playFreqs(getFreqs(chord.root, chord.type), 1.6)
  }

  function playStep(prog: Chord[], index: number, beatMs: number) {
    if (stopRef.current || index >= prog.length) {
      setIsPlaying(false)
      setActiveChord(null)
      return
    }
    setActiveChord(index)
    playFreqs(getFreqs(prog[index].root, prog[index].type), (beatMs / 1000) * 0.92)
    timerRef.current = setTimeout(() => playStep(prog, index + 1, beatMs), beatMs)
  }

  function togglePlay() {
    if (isPlaying) {
      stopRef.current = true
      if (timerRef.current) clearTimeout(timerRef.current)
      setIsPlaying(false)
      setActiveChord(null)
    } else {
      stopRef.current = false
      setIsPlaying(true)
      const beatMs = (60 / tempo) * 2 * 1000   // 2 beats per chord
      playStep(progression, 0, beatMs)
    }
  }

  function removeChord(i: number) {
    setProgression(p => p.filter((_, idx) => idx !== i))
  }

  function addChord() {
    if (progression.length < 8) {
      setProgression(p => [...p, { root: addRoot, type: addType }])
    }
  }

  return (
    <div style={{ paddingTop: '100px', paddingBottom: '80px', minHeight: '100vh' }}>
      <div className="container">

        {/* Header */}
        <div style={{ marginBottom: '36px' }}>
          <div className="section-label">Tools</div>
          <h1 className="section-title">Chord Progression Builder</h1>
          <p className="section-subtitle">Build progressions up to 8 chords, click any chord to hear it, or play the full sequence.</p>
        </div>

        {/* Preset buttons */}
        <div style={{ marginBottom: '28px' }}>
          <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-muted)', marginBottom: '10px' }}>Classic Progressions</div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {PRESETS.map(p => (
              <button key={p.name} onClick={() => setProgression(p.chords)} style={{
                padding: '8px 16px', borderRadius: '20px',
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                color: 'var(--text-secondary)', fontFamily: 'DM Sans, sans-serif', fontSize: '13px',
                cursor: 'pointer', transition: 'all 0.18s',
              }}
                onMouseEnter={e => { (e.currentTarget).style.borderColor = 'var(--border-accent)'; (e.currentTarget).style.color = 'var(--accent-gold)' }}
                onMouseLeave={e => { (e.currentTarget).style.borderColor = 'var(--border)'; (e.currentTarget).style.color = 'var(--text-secondary)' }}
              >{p.name}</button>
            ))}
          </div>
        </div>

        {/* Chord cards */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '24px', alignItems: 'stretch' }}>
          {progression.map((chord, i) => {
            const ct       = CHORD_TYPES.find(c => c.symbol === chord.type) ?? CHORD_TYPES[0]
            const isActive = activeChord === i
            return (
              <div
                key={i}
                onClick={() => playSingle(chord)}
                style={{
                  position: 'relative', minWidth: '100px',
                  padding: '20px 16px',
                  background: isActive ? ct.color + '1e' : 'var(--bg-card)',
                  border: `1.5px solid ${isActive ? ct.color + '90' : 'var(--border)'}`,
                  borderRadius: '14px', textAlign: 'center',
                  cursor: 'pointer', transition: 'all 0.15s',
                  boxShadow: isActive ? `0 0 22px ${ct.color}44` : 'var(--shadow)',
                  userSelect: 'none',
                }}
              >
                {/* Remove button */}
                <button
                  onClick={e => { e.stopPropagation(); removeChord(i) }}
                  style={{ position: 'absolute', top: '6px', right: '8px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '15px', lineHeight: 1, padding: 0 }}
                >×</button>

                <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '26px', fontWeight: '700', color: isActive ? ct.color : 'var(--text-primary)' }}>{chord.root}</div>
                <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '12px', color: ct.color, marginTop: '2px' }}>{chord.type || '△'}</div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '3px', fontFamily: 'DM Mono, monospace' }}>{ct.name}</div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '8px', opacity: 0.6 }}>▶ tap</div>
              </div>
            )
          })}

          {/* Add chord slot */}
          {progression.length < 8 && (
            <div style={{
              minWidth: '110px', padding: '16px 12px',
              background: 'transparent', border: '2px dashed var(--border)',
              borderRadius: '14px', display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: '8px',
            }}>
              <select value={addRoot} onChange={e => setAddRoot(e.target.value)} style={{ width: '72px', textAlign: 'center', fontSize: '12px' }}>
                {NOTES.map(n => <option key={n} value={n}>{n}</option>)}
              </select>
              <select value={addType} onChange={e => setAddType(e.target.value)} style={{ width: '72px', textAlign: 'center', fontSize: '12px' }}>
                {CHORD_TYPES.map(ct => <option key={ct.symbol} value={ct.symbol}>{ct.name}</option>)}
              </select>
              <button onClick={addChord} style={{
                width: '36px', height: '36px', borderRadius: '50%',
                background: 'rgba(212,168,71,0.1)', border: '1px solid var(--border-accent)',
                color: 'var(--accent-gold)', fontSize: '22px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>+</button>
            </div>
          )}
        </div>

        {/* Playback bar */}
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '48px' }}>
          <button onClick={togglePlay} style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '13px 30px', borderRadius: '50px',
            background: isPlaying
              ? 'rgba(232,80,122,0.1)'
              : 'linear-gradient(135deg, var(--accent-gold), var(--accent-gold-dim))',
            border: isPlaying ? '1.5px solid var(--accent-rose)' : 'none',
            color: isPlaying ? 'var(--accent-rose)' : '#080810',
            fontFamily: 'DM Sans, sans-serif', fontSize: '15px', fontWeight: '600',
            cursor: 'pointer', transition: 'all 0.2s',
          }}>{isPlaying ? '⏹ Stop' : '▶ Play All'}</button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Tempo</span>
            <input type="range" min="40" max="200" value={tempo} onChange={e => setTempo(Number(e.target.value))} style={{ width: '130px' }} />
            <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '13px', color: 'var(--accent-gold)', minWidth: '52px' }}>{tempo} BPM</span>
          </div>
        </div>

        {/* Chord type reference */}
        <div>
          <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-muted)', marginBottom: '12px' }}>Chord Reference</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(155px, 1fr))', gap: '10px' }}>
            {CHORD_TYPES.map(ct => (
              <div key={ct.symbol} style={{ background: 'var(--bg-card)', border: `1px solid ${ct.color}28`, borderRadius: '12px', padding: '14px 16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                  <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>{ct.name}</span>
                  <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '11px', color: ct.color, background: ct.color + '18', padding: '2px 7px', borderRadius: '6px' }}>{ct.symbol || '△'}</span>
                </div>
                <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '10px', color: 'var(--text-muted)' }}>+{ct.intervals.join(', ')} semitones</div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
