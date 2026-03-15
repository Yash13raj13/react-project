import { useState, useRef, useCallback } from 'react'

const KEYBOARD_LAYOUT = [
  { note: 'C4', label: 'C', type: 'white', key: 'a' },
  { note: 'C#4', label: 'C#', type: 'black', key: 'w' },
  { note: 'D4', label: 'D', type: 'white', key: 's' },
  { note: 'D#4', label: 'D#', type: 'black', key: 'e' },
  { note: 'E4', label: 'E', type: 'white', key: 'd' },
  { note: 'F4', label: 'F', type: 'white', key: 'f' },
  { note: 'F#4', label: 'F#', type: 'black', key: 't' },
  { note: 'G4', label: 'G', type: 'white', key: 'g' },
  { note: 'G#4', label: 'G#', type: 'black', key: 'y' },
  { note: 'A4', label: 'A', type: 'white', key: 'h' },
  { note: 'A#4', label: 'A#', type: 'black', key: 'u' },
  { note: 'B4', label: 'B', type: 'white', key: 'j' },
  { note: 'C5', label: 'C', type: 'white', key: 'k' },
  { note: 'C#5', label: 'C#', type: 'black', key: 'o' },
  { note: 'D5', label: 'D', type: 'white', key: 'l' },
]

const NOTE_FREQUENCIES: Record<string, number> = {
  'C4': 261.63, 'C#4': 277.18, 'D4': 293.66, 'D#4': 311.13, 'E4': 329.63,
  'F4': 349.23, 'F#4': 369.99, 'G4': 392.00, 'G#4': 415.30, 'A4': 440.00,
  'A#4': 466.16, 'B4': 493.88, 'C5': 523.25, 'C#5': 554.37, 'D5': 587.33,
}

const WAVEFORMS: OscillatorType[] = ['sine', 'square', 'sawtooth', 'triangle']

const SCALE_PATTERNS: Record<string, { notes: string[]; label: string }> = {
  'C Major': { notes: ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'], label: 'C Major' },
  'A Minor': { notes: ['A4', 'B4', 'C5', 'D5', 'E4', 'F4', 'G4', 'A4'], label: 'A Minor' },
  'C Pentatonic': { notes: ['C4', 'D4', 'E4', 'G4', 'A4', 'C5'], label: 'C Pentatonic' },
  'Blues': { notes: ['A4', 'C5', 'D5', 'D#4', 'E4', 'G4'], label: 'A Blues' },
}

export default function InteractiveKeyboard() {
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set())
  const [waveform, setWaveform] = useState<OscillatorType>('sine')
  const [octave] = useState(4)
  const [highlightScale, setHighlightScale] = useState<string | null>(null)
  const [playedNotes, setPlayedNotes] = useState<string[]>([])
  const [volume, setVolume] = useState(0.4)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const activeOscillatorsRef = useRef<Map<string, { osc: OscillatorNode; gain: GainNode }>>(new Map())

  const getAudioCtx = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
    }
    return audioCtxRef.current
  }

  const playNote = useCallback((note: string) => {
    if (activeOscillatorsRef.current.has(note)) return
    const ctx = getAudioCtx()
    if (ctx.state === 'suspended') ctx.resume()

    const freq = NOTE_FREQUENCIES[note]
    if (!freq) return

    const osc = ctx.createOscillator()
    const gainNode = ctx.createGain()
    const filter = ctx.createBiquadFilter()

    osc.type = waveform
    osc.frequency.setValueAtTime(freq, ctx.currentTime)

    filter.type = 'lowpass'
    filter.frequency.setValueAtTime(waveform === 'sine' ? 8000 : 3000, ctx.currentTime)

    gainNode.gain.setValueAtTime(0, ctx.currentTime)
    gainNode.gain.linearRampToValueAtTime(volume * 0.7, ctx.currentTime + 0.01)

    osc.connect(filter)
    filter.connect(gainNode)
    gainNode.connect(ctx.destination)
    osc.start()

    activeOscillatorsRef.current.set(note, { osc, gain: gainNode })
    setPressedKeys(prev => new Set([...prev, note]))
    setPlayedNotes(prev => [...prev.slice(-15), note.replace(/\d/, '')])
  }, [waveform, volume])

  const stopNote = useCallback((note: string) => {
    const active = activeOscillatorsRef.current.get(note)
    if (!active) return
    const ctx = getAudioCtx()

    active.gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.15)
    active.osc.stop(ctx.currentTime + 0.15)
    activeOscillatorsRef.current.delete(note)
    setPressedKeys(prev => { const s = new Set(prev); s.delete(note); return s })
  }, [])

  const playChord = (notes: string[]) => {
    notes.forEach(n => { playNote(n); setTimeout(() => stopNote(n), 1200) })
  }

  const scaleHighlight = highlightScale ? SCALE_PATTERNS[highlightScale]?.notes : []
  const whiteKeys = KEYBOARD_LAYOUT.filter(k => k.type === 'white')
  const allKeys = KEYBOARD_LAYOUT

  const chords = [
    { name: 'C Major', notes: ['C4', 'E4', 'G4'], color: '#d4a847' },
    { name: 'A Minor', notes: ['A4', 'C5', 'E4'], color: '#9b7fe8' },
    { name: 'G Major', notes: ['G4', 'B4', 'D5'], color: '#2dd4c8' },
    { name: 'F Major', notes: ['F4', 'A4', 'C5'], color: '#e8507a' },
    { name: 'D Minor', notes: ['D4', 'F4', 'A4'], color: '#6bc96b' },
    { name: 'E Minor', notes: ['E4', 'G4', 'B4'], color: '#ff9f43' },
  ]

  return (
    <div style={{ paddingTop: '100px', paddingBottom: '80px', minHeight: '100vh' }}>
      <div className="container">
        {/* Header */}
        <div style={{ marginBottom: '48px', animation: 'fadeUp 0.6s ease forwards' }}>
          <div className="section-label">Playground</div>
          <h1 className="section-title">Interactive Playground</h1>
          <p className="section-subtitle">
            Play notes, explore chords, and experiment with sound synthesis in real-time.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '24px', animation: 'fadeUp 0.6s ease 0.1s both forwards', opacity: 0 }}>
          {/* Main keyboard area */}
          <div>
            {/* Controls */}
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '28px', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '11px', color: '#55546a', fontFamily: 'DM Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>Waveform</div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {WAVEFORMS.map(w => (
                    <button key={w} onClick={() => setWaveform(w)} style={{
                      padding: '7px 14px', borderRadius: '8px',
                      background: waveform === w ? 'rgba(212,168,71,0.15)' : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${waveform === w ? 'rgba(212,168,71,0.4)' : 'rgba(255,255,255,0.08)'}`,
                      color: waveform === w ? '#d4a847' : '#9896a8',
                      fontFamily: 'DM Mono, monospace', fontSize: '11px',
                      cursor: 'pointer', transition: 'all 0.2s', textTransform: 'capitalize',
                    }}>{w}</button>
                  ))}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#55546a', fontFamily: 'DM Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>Volume</div>
                <input
                  type="range" min="0" max="1" step="0.05" value={volume}
                  onChange={e => setVolume(parseFloat(e.target.value))}
                  style={{ width: '100px', accentColor: '#d4a847' }}
                />
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#55546a', fontFamily: 'DM Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>Highlight Scale</div>
                <select
                  value={highlightScale || ''}
                  onChange={e => setHighlightScale(e.target.value || null)}
                  style={{
                    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '8px', padding: '7px 12px',
                    color: '#f0ede8', fontFamily: 'DM Mono, monospace', fontSize: '11px',
                    cursor: 'pointer',
                  }}
                >
                  <option value="">None</option>
                  {Object.keys(SCALE_PATTERNS).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            {/* Piano keyboard */}
            <div style={{
              position: 'relative',
              background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '16px', padding: '24px 20px 20px',
              overflow: 'hidden',
            }}>
              <div style={{ position: 'relative', display: 'flex', height: '160px', gap: '3px', justifyContent: 'center' }}>
                {whiteKeys.map((key, i) => {
                  const isPressed = pressedKeys.has(key.note)
                  const isHighlighted = scaleHighlight.includes(key.note)

                  return (
                    <div
                      key={key.note}
                      onMouseDown={() => playNote(key.note)}
                      onMouseUp={() => stopNote(key.note)}
                      onMouseLeave={() => stopNote(key.note)}
                      onTouchStart={e => { e.preventDefault(); playNote(key.note) }}
                      onTouchEnd={() => stopNote(key.note)}
                      style={{
                        position: 'relative',
                        width: '52px',
                        height: '100%',
                        background: isPressed
                          ? 'linear-gradient(to bottom, #d4a847, #a07a28)'
                          : isHighlighted
                          ? 'rgba(212,168,71,0.15)'
                          : 'rgba(240,237,232,0.92)',
                        border: `1px solid ${isHighlighted ? 'rgba(212,168,71,0.5)' : 'rgba(0,0,0,0.2)'}`,
                        borderRadius: '0 0 8px 8px',
                        cursor: 'pointer',
                        transition: 'background 0.05s, transform 0.05s',
                        transform: isPressed ? 'scaleY(0.96) translateY(3px)' : 'none',
                        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
                        paddingBottom: '10px',
                        boxShadow: isPressed ? 'inset 0 -2px 8px rgba(0,0,0,0.3)' : '0 4px 8px rgba(0,0,0,0.4)',
                        zIndex: 1,
                        userSelect: 'none',
                      }}
                    >
                      <span style={{ fontSize: '10px', color: isHighlighted ? '#d4a847' : '#999', fontFamily: 'DM Mono, monospace', fontWeight: '600' }}>{key.label}</span>
                      <span style={{ position: 'absolute', top: '8px', left: '50%', transform: 'translateX(-50%)', fontSize: '9px', color: isHighlighted ? '#d4a847' : '#bbb', fontFamily: 'DM Mono, monospace' }}>{key.key.toUpperCase()}</span>
                    </div>
                  )
                })}

                {/* Black keys */}
                {(() => {
                  let whiteIdx = 0
                  return allKeys.map((key, i) => {
                    if (key.type === 'white') { whiteIdx++; return null }
                    const isPressed = pressedKeys.has(key.note)
                    const isHighlighted = scaleHighlight.includes(key.note)
                    const leftOffset = (whiteIdx - 0.5) * 55 + 20 - 16

                    return (
                      <div
                        key={key.note}
                        onMouseDown={e => { e.stopPropagation(); playNote(key.note) }}
                        onMouseUp={() => stopNote(key.note)}
                        onMouseLeave={() => stopNote(key.note)}
                        onTouchStart={e => { e.preventDefault(); playNote(key.note) }}
                        onTouchEnd={() => stopNote(key.note)}
                        style={{
                          position: 'absolute',
                          left: `${leftOffset}px`,
                          top: '0',
                          width: '32px',
                          height: '95px',
                          background: isPressed
                            ? 'linear-gradient(to bottom, #d4a847, #805010)'
                            : isHighlighted
                            ? 'rgba(180,130,40,0.8)'
                            : '#1a1a2e',
                          border: `1px solid ${isHighlighted ? 'rgba(212,168,71,0.6)' : 'rgba(255,255,255,0.1)'}`,
                          borderRadius: '0 0 6px 6px',
                          cursor: 'pointer',
                          zIndex: 2,
                          transition: 'background 0.05s',
                          boxShadow: isPressed ? 'none' : '2px 4px 12px rgba(0,0,0,0.7)',
                          display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
                          paddingBottom: '8px',
                          userSelect: 'none',
                        }}
                      >
                        <span style={{ fontSize: '8px', color: isHighlighted ? '#d4a847' : '#666', fontFamily: 'DM Mono, monospace' }}>{key.key.toUpperCase()}</span>
                      </div>
                    )
                  })
                })()}
              </div>
            </div>

            {/* Played notes trail */}
            <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', minHeight: '36px' }}>
              <span style={{ fontSize: '11px', color: '#55546a', fontFamily: 'DM Mono, monospace', flexShrink: 0 }}>PLAYED:</span>
              {playedNotes.map((note, i) => (
                <span key={i} style={{
                  padding: '3px 10px', borderRadius: '6px',
                  background: `rgba(212,168,71,${0.05 + (i / playedNotes.length) * 0.15})`,
                  border: '1px solid rgba(212,168,71,0.15)',
                  color: '#d4a847', fontFamily: 'DM Mono, monospace', fontSize: '12px',
                  transition: 'all 0.3s',
                }}>{note}</span>
              ))}
              {playedNotes.length > 0 && (
                <button onClick={() => setPlayedNotes([])} style={{
                  background: 'none', border: 'none', color: '#55546a', cursor: 'pointer', fontSize: '12px',
                }}>clear</button>
              )}
            </div>
          </div>

          {/* Chord panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ fontSize: '12px', color: '#55546a', fontFamily: 'DM Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Quick Chords</div>
            {chords.map(chord => (
              <button
                key={chord.name}
                onMouseDown={() => playChord(chord.notes)}
                className="glass-card"
                style={{
                  padding: '16px 20px', cursor: 'pointer', border: 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '15px', fontWeight: '600', color: '#f0ede8', marginBottom: '4px' }}>{chord.name}</div>
                  <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '11px', color: '#55546a' }}>{chord.notes.map(n => n.replace(/\d/, '')).join(' – ')}</div>
                </div>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '50%',
                  background: chord.color + '20', border: `1px solid ${chord.color}40`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '16px', color: chord.color,
                }}>♪</div>
              </button>
            ))}

            {/* Keyboard hint */}
            <div style={{ marginTop: '8px', padding: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px' }}>
              <div style={{ fontSize: '11px', color: '#55546a', fontFamily: 'DM Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '10px' }}>Keyboard Mapping</div>
              <div style={{ fontSize: '12px', color: '#9896a8', lineHeight: '1.8' }}>
                White keys: <span style={{ color: '#d4a847', fontFamily: 'DM Mono, monospace' }}>A S D F G H J K L</span><br/>
                Black keys: <span style={{ color: '#d4a847', fontFamily: 'DM Mono, monospace' }}>W E T Y U O</span>
              </div>
            </div>
          </div>
        </div>

        {/* Interval reference */}
        <div style={{ marginTop: '48px', animation: 'fadeUp 0.6s ease 0.3s both forwards', opacity: 0 }}>
          <div style={{ fontSize: '12px', color: '#55546a', fontFamily: 'DM Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '20px' }}>Quick Reference — Note Frequencies</div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {Object.entries(NOTE_FREQUENCIES).map(([note, freq]) => (
              <div key={note} style={{
                padding: '8px 14px', borderRadius: '8px',
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                textAlign: 'center',
              }}>
                <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '13px', color: '#f0ede8', marginBottom: '2px' }}>{note.replace(/4|5/, '')}</div>
                <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '10px', color: '#55546a' }}>{freq} Hz</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .keyboard-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
