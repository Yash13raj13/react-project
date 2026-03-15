import { useState, useRef, useEffect } from 'react'


const KEYS = [
  { note: 'C4',  label: 'C',  type: 'white', kb: 'A' },
  { note: 'C#4', label: 'C#', type: 'black', kb: 'W' },
  { note: 'D4',  label: 'D',  type: 'white', kb: 'S' },
  { note: 'D#4', label: 'D#', type: 'black', kb: 'E' },
  { note: 'E4',  label: 'E',  type: 'white', kb: 'D' },
  { note: 'F4',  label: 'F',  type: 'white', kb: 'F' },
  { note: 'F#4', label: 'F#', type: 'black', kb: 'T' },
  { note: 'G4',  label: 'G',  type: 'white', kb: 'G' },
  { note: 'G#4', label: 'G#', type: 'black', kb: 'Y' },
  { note: 'A4',  label: 'A',  type: 'white', kb: 'H' },
  { note: 'A#4', label: 'A#', type: 'black', kb: 'U' },
  { note: 'B4',  label: 'B',  type: 'white', kb: 'J' },
  { note: 'C5',  label: 'C',  type: 'white', kb: 'K' },
  { note: 'C#5', label: 'C#', type: 'black', kb: 'O' },
  { note: 'D5',  label: 'D',  type: 'white', kb: 'L' },
  { note: 'D#5', label: 'D#', type: 'black', kb: 'P' },
  { note: 'E5',  label: 'E',  type: 'white', kb: ';' },
]

const FREQS: Record<string, number> = {
  'C4': 261.63, 'C#4': 277.18, 'D4': 293.66, 'D#4': 311.13, 'E4': 329.63,
  'F4': 349.23, 'F#4': 369.99, 'G4': 392.00, 'G#4': 415.30, 'A4': 440.00,
  'A#4': 466.16, 'B4': 493.88, 'C5': 523.25, 'C#5': 554.37, 'D5': 587.33,
  'D#5': 622.25, 'E5': 659.25,
}

const WAVEFORMS: OscillatorType[] = ['sine', 'triangle', 'sawtooth', 'square']

const SCALES: Record<string, string[]> = {
  'None':        [],
  'C Major':     ['C4','D4','E4','F4','G4','A4','B4','C5'],
  'A Minor':     ['A4','B4','C5','D5','E4','F4','G4'],
  'C Pentatonic':['C4','D4','E4','G4','A4','C5'],
  'A Blues':     ['A4','C5','D5','D#5','E5','G4'],
}

const QUICK_CHORDS = [
  { name: 'C',     notes: ['C4','E4','G4'],       color: '#d4a847' },
  { name: 'Am',    notes: ['A4','C5','E4'],        color: '#9b7fe8' },
  { name: 'F',     notes: ['F4','A4','C5'],        color: '#2dd4c8' },
  { name: 'G',     notes: ['G4','B4','D5'],        color: '#e8507a' },
  { name: 'Em',    notes: ['E4','G4','B4'],        color: '#6bc96b' },
  { name: 'Dm',    notes: ['D4','F4','A4'],        color: '#ff9f43' },
  { name: 'G7',    notes: ['G4','B4','D5','F4'],   color: '#4db8ff' },
  { name: 'Cmaj7', notes: ['C4','E4','G4','B4'],   color: '#ff6b6b' },
]

const KB_MAP: Record<string, string> = {}
KEYS.forEach(k => { KB_MAP[k.kb.toLowerCase()] = k.note })


let _ctx: AudioContext | null = null
let _master: GainNode | null = null
let _dryGain: GainNode | null = null
let _wetGain: GainNode | null = null

function ensureGraph() {
  if (_ctx && _ctx.state !== 'closed') return _ctx
  _ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
  _master  = _ctx.createGain();  _master.gain.value = 0.5
  _dryGain = _ctx.createGain();  _dryGain.gain.value = 0.8
  _wetGain = _ctx.createGain();  _wetGain.gain.value = 0.2

 
  const conv = _ctx.createConvolver()
  const len  = _ctx.sampleRate * 2
  const buf  = _ctx.createBuffer(2, len, _ctx.sampleRate)
  for (let c = 0; c < 2; c++) {
    const d = buf.getChannelData(c)
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.5)
  }
  conv.buffer = buf

  _master.connect(_dryGain)
  _master.connect(conv)
  conv.connect(_wetGain)
  _dryGain.connect(_ctx.destination)
  _wetGain.connect(_ctx.destination)
  return _ctx
}

export default function InteractiveKeyboard() {
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set())
  const [playedNotes, setPlayedNotes] = useState<string[]>([])
  const [activeTab, setActiveTab]     = useState<'synth'|'chords'|'info'>('synth')


  const [waveform, setWaveformState] = useState<OscillatorType>('triangle')
  const [volume,   setVolumeState]   = useState(0.5)
  const [attack,   setAttackState]   = useState(0.01)
  const [release,  setReleaseState]  = useState(0.35)
  const [reverbMix,setReverbState]   = useState(0.2)
  const [scaleKey, setScaleKey]      = useState('None')

  const waveformRef  = useRef<OscillatorType>('triangle')
  const attackRef    = useRef(0.01)
  const releaseRef   = useRef(0.35)

  const activeOscs = useRef<Map<string, { osc: OscillatorNode; gain: GainNode }>>(new Map())

  
  function setWaveform(v: OscillatorType) { waveformRef.current = v; setWaveformState(v) }
  function setAttack(v: number)           { attackRef.current  = v; setAttackState(v)   }
  function setRelease(v: number)          { releaseRef.current = v; setReleaseState(v)  }
  function setVolume(v: number) {
    setVolumeState(v)
    if (_master) _master.gain.value = v
  }
  function setReverb(v: number) {
    setReverbState(v)
    if (_dryGain) _dryGain.gain.value = 1 - v
    if (_wetGain) _wetGain.gain.value = v
  }

  
  function playNote(note: string) {
    if (activeOscs.current.has(note)) return
    const freq = FREQS[note]
    if (!freq) return

    const ctx = ensureGraph()
    if (ctx.state === 'suspended') ctx.resume()

    const osc    = ctx.createOscillator()
    const gain   = ctx.createGain()
    const filter = ctx.createBiquadFilter()

    filter.type = 'lowpass'
    filter.frequency.value = waveformRef.current === 'sine' ? 8000
      : waveformRef.current === 'triangle' ? 5000 : 3200

    osc.type = waveformRef.current
    osc.frequency.value = freq
    osc.detune.value = (Math.random() - 0.5) * 4

    const now = ctx.currentTime
    gain.gain.setValueAtTime(0, now)
    gain.gain.linearRampToValueAtTime(0.9, now + Math.max(0.005, attackRef.current))

    osc.connect(filter)
    filter.connect(gain)
    gain.connect(_master ?? ctx.destination)
    osc.start()

    activeOscs.current.set(note, { osc, gain })
    setPressedKeys(p => new Set([...p, note]))
    setPlayedNotes(p => [...p.slice(-19), note.replace(/\d/, '')])
  }

  function stopNote(note: string) {
    const entry = activeOscs.current.get(note)
    if (!entry) return
    const ctx = ensureGraph()
    const now = ctx.currentTime
    const rel = Math.max(0.05, releaseRef.current)
    entry.gain.gain.cancelScheduledValues(now)
    entry.gain.gain.setValueAtTime(entry.gain.gain.value, now)
    entry.gain.gain.linearRampToValueAtTime(0, now + rel)
    entry.osc.stop(now + rel)
    activeOscs.current.delete(note)
    setPressedKeys(p => { const s = new Set(p); s.delete(note); return s })
  }

  function playChord(notes: string[], dur = 1300) {
    notes.forEach(n => { playNote(n); setTimeout(() => stopNote(n), dur) })
  }

  
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.repeat) return
      const note = KB_MAP[e.key.toLowerCase()]
      if (note) playNote(note)
    }
    const up = (e: KeyboardEvent) => {
      const note = KB_MAP[e.key.toLowerCase()]
      if (note) stopNote(note)
    }
    window.addEventListener('keydown', down)
    window.addEventListener('keyup',   up)
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up) }
  
  }, []) 

  const scaleNotes = SCALES[scaleKey] ?? []
  const whiteKeys  = KEYS.filter(k => k.type === 'white')

  
  return (
    <div style={{ paddingTop: '100px', paddingBottom: '80px', minHeight: '100vh' }}>
      <div className="container">

        <div style={{ marginBottom: '36px' }}>
          <div className="section-label">Playground</div>
          <h1 className="section-title">Synth Playground</h1>
          <p className="section-subtitle">Click keys or use your computer keyboard. Shape sound with the synth controls below.</p>
        </div>

        
        <div style={{ display: 'flex', gap: '4px', marginBottom: '20px', borderBottom: '1px solid var(--border)' }}>
          {(['synth','chords','info'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              padding: '9px 18px', background: 'none', border: 'none',
              borderBottom: activeTab === tab ? '2px solid var(--accent-gold)' : '2px solid transparent',
              color: activeTab === tab ? 'var(--accent-gold)' : 'var(--text-secondary)',
              fontFamily: 'DM Sans, sans-serif', fontSize: '13px', fontWeight: '500',
              cursor: 'pointer', transition: 'all 0.18s', textTransform: 'capitalize',
            }}>
              {tab === 'synth' ? '🎛️ Synth' : tab === 'chords' ? '🎶 Chords' : '📖 How to Play'}
            </button>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: '20px' }}>

          
          <div>

           
            {activeTab === 'synth' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>

                {/* Waveform */}
                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '14px', padding: '16px 18px' }}>
                  <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-muted)', marginBottom: '10px' }}>Waveform</div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {WAVEFORMS.map(w => (
                      <button key={w} onClick={() => setWaveform(w)} style={{
                        flex: 1, padding: '7px 4px', borderRadius: '7px',
                        background: waveform === w ? 'rgba(212,168,71,0.14)' : 'transparent',
                        border: `1px solid ${waveform === w ? 'rgba(212,168,71,0.45)' : 'var(--border)'}`,
                        color: waveform === w ? 'var(--accent-gold)' : 'var(--text-muted)',
                        fontFamily: 'DM Mono, monospace', fontSize: '10px',
                        cursor: 'pointer', transition: 'all 0.15s', textTransform: 'capitalize',
                      }}>{w.slice(0,3)}</button>
                    ))}
                  </div>
                </div>

                {/* Scale */}
                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '14px', padding: '16px 18px' }}>
                  <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-muted)', marginBottom: '10px' }}>Scale Highlight</div>
                  <select value={scaleKey} onChange={e => setScaleKey(e.target.value)} style={{ width: '100%', fontSize: '12px' }}>
                    {Object.keys(SCALES).map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                {/* ADSR */}
                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '14px', padding: '16px 18px' }}>
                  <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-muted)', marginBottom: '10px' }}>Envelope</div>
                  {[
                    { label: 'Attack',  val: attack,  set: setAttack,  min: 0.001, max: 1,   step: 0.001 },
                    { label: 'Release', val: release, set: setRelease, min: 0.05,  max: 3,   step: 0.01  },
                  ].map(row => (
                    <div key={row.label} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '10px', color: 'var(--text-muted)', width: '46px', flexShrink: 0 }}>{row.label}</span>
                      <input type="range" min={row.min} max={row.max} step={row.step} value={row.val}
                        onChange={e => row.set(parseFloat(e.target.value))} style={{ flex: 1 }} />
                      <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '10px', color: 'var(--accent-gold)', width: '32px', textAlign: 'right' }}>{row.val.toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                {/* Mix */}
                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '14px', padding: '16px 18px' }}>
                  <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-muted)', marginBottom: '10px' }}>Mix</div>
                  {[
                    { label: 'Volume', val: volume,   set: setVolume, min: 0, max: 1, step: 0.01 },
                    { label: 'Reverb', val: reverbMix, set: setReverb, min: 0, max: 1, step: 0.01 },
                  ].map(row => (
                    <div key={row.label} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '10px', color: 'var(--text-muted)', width: '46px', flexShrink: 0 }}>{row.label}</span>
                      <input type="range" min={row.min} max={row.max} step={row.step} value={row.val}
                        onChange={e => row.set(parseFloat(e.target.value))} style={{ flex: 1 }} />
                      <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '10px', color: 'var(--accent-gold)', width: '32px', textAlign: 'right' }}>{Math.round(row.val * 100)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Chord grid */}
            {activeTab === 'chords' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '10px', marginBottom: '20px' }}>
                {QUICK_CHORDS.map(c => (
                  <button key={c.name} onMouseDown={() => playChord(c.notes)}
                    style={{ padding: '16px 8px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', cursor: 'pointer', textAlign: 'center', transition: 'all 0.15s' }}
                    onMouseEnter={e => { (e.currentTarget).style.borderColor = c.color + '60'; (e.currentTarget).style.background = c.color + '10' }}
                    onMouseLeave={e => { (e.currentTarget).style.borderColor = 'var(--border)'; (e.currentTarget).style.background = 'var(--bg-card)' }}
                  >
                    <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '18px', fontWeight: '700', color: c.color }}>{c.name}</div>
                    <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px' }}>{c.notes.map(n => n.replace(/\d/,'')).join('·')}</div>
                  </button>
                ))}
              </div>
            )}

            {/* Info */}
            {activeTab === 'info' && (
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '14px', padding: '24px', marginBottom: '20px' }}>
                <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '18px', color: 'var(--text-primary)', marginBottom: '16px' }}>How to Play</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.7' }}>
                  {[
                    ['⌨️', 'Keyboard', 'White keys: A S D F G H J K L  |  Black keys: W E T Y U O P'],
                    ['🖱️', 'Mouse',    'Click and hold any piano key to play it.'],
                    ['🎛️', 'Waveform', 'Sine = soft & pure. Triangle = warm. Sawtooth = bright. Square = buzzy.'],
                    ['⚡', 'Attack',   'How fast the note fades in. Low = snappy, High = slow swell.'],
                    ['🌊', 'Release',  'How long the note rings after you release the key.'],
                    ['🏛️', 'Reverb',   'Adds room/hall echo — increase for a spacious sound.'],
                    ['🎵', 'Scale',    'Highlights the notes of a chosen scale on the keys.'],
                  ].map(([icon, title, desc]) => (
                    <div key={title as string}>
                      <span>{icon} </span>
                      <strong style={{ color: 'var(--text-primary)' }}>{title}: </strong>
                      <span>{desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '18px', overflowX: 'auto' }}>
              <div style={{ position: 'relative', display: 'flex', height: '158px', gap: '3px', minWidth: '580px' }}>

                
                {whiteKeys.map(key => {
                  const pressed     = pressedKeys.has(key.note)
                  const highlighted = scaleNotes.includes(key.note)
                  return (
                    <div key={key.note}
                      onMouseDown={() => playNote(key.note)}
                      onMouseUp={() => stopNote(key.note)}
                      onMouseLeave={() => stopNote(key.note)}
                      onTouchStart={e => { e.preventDefault(); playNote(key.note) }}
                      onTouchEnd={() => stopNote(key.note)}
                      style={{
                        flex: 1, minWidth: '40px', height: '100%',
                        background: pressed
                          ? 'linear-gradient(to bottom, var(--accent-gold), var(--accent-gold-dim))'
                          : highlighted ? 'rgba(212,168,71,0.15)' : '#f0ede8',
                        border: `1px solid ${highlighted ? 'rgba(212,168,71,0.5)' : 'rgba(0,0,0,0.13)'}`,
                        borderRadius: '0 0 8px 8px', cursor: 'pointer',
                        transform: pressed ? 'scaleY(0.96) translateY(3px)' : 'none',
                        transition: 'background 0.04s, transform 0.04s',
                        boxShadow: pressed ? 'inset 0 -2px 6px rgba(0,0,0,0.25)' : '0 4px 8px rgba(0,0,0,0.18)',
                        display: 'flex', flexDirection: 'column', alignItems: 'center',
                        justifyContent: 'flex-end', paddingBottom: '7px',
                        zIndex: 1, userSelect: 'none', position: 'relative',
                      }}>
                      <span style={{ fontSize: '8px', color: highlighted ? 'var(--accent-gold)' : '#bbb', fontFamily: 'DM Mono, monospace' }}>{key.kb}</span>
                      <span style={{ fontSize: '9px', color: highlighted ? 'var(--accent-gold)' : '#999', fontFamily: 'DM Mono, monospace', fontWeight: '600' }}>{key.label}</span>
                    </div>
                  )
                })}

  
                {(() => {
                  let wi = 0
                  const WW = 43 
                  return KEYS.map(key => {
                    if (key.type === 'white') { wi++; return null }
                    const pressed     = pressedKeys.has(key.note)
                    const highlighted = scaleNotes.includes(key.note)
                    const left        = (wi - 0.5) * WW + 18 - 13
                    return (
                      <div key={key.note}
                        onMouseDown={e => { e.stopPropagation(); playNote(key.note) }}
                        onMouseUp={() => stopNote(key.note)}
                        onMouseLeave={() => stopNote(key.note)}
                        onTouchStart={e => { e.preventDefault(); playNote(key.note) }}
                        onTouchEnd={() => stopNote(key.note)}
                        style={{
                          position: 'absolute', top: 0, left: `${left}px`,
                          width: '27px', height: '94px',
                          background: pressed
                            ? 'linear-gradient(to bottom, var(--accent-gold), #7a4e08)'
                            : highlighted ? 'rgba(160,120,30,0.85)' : '#1a1a2e',
                          border: `1px solid ${highlighted ? 'rgba(212,168,71,0.55)' : 'rgba(255,255,255,0.07)'}`,
                          borderRadius: '0 0 6px 6px', cursor: 'pointer', zIndex: 2,
                          transition: 'background 0.04s',
                          boxShadow: pressed ? 'none' : '2px 4px 10px rgba(0,0,0,0.55)',
                          display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
                          paddingBottom: '5px', userSelect: 'none',
                        }}>
                        <span style={{ fontSize: '8px', color: highlighted ? '#d4a847' : '#444', fontFamily: 'DM Mono, monospace' }}>{key.kb}</span>
                      </div>
                    )
                  })
                })()}
              </div>
            </div>

            {/* Note trail */}
            <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '5px', flexWrap: 'wrap', minHeight: '28px' }}>
              <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '10px', color: 'var(--text-muted)' }}>♪</span>
              {playedNotes.map((n, i) => (
                <span key={i} style={{
                  padding: '2px 7px', borderRadius: '5px', fontFamily: 'DM Mono, monospace', fontSize: '11px',
                  background: `rgba(212,168,71,${0.04 + (i / playedNotes.length) * 0.18})`,
                  border: '1px solid rgba(212,168,71,0.12)', color: 'var(--accent-gold)',
                }}>{n}</span>
              ))}
              {playedNotes.length > 0 && (
                <button onClick={() => setPlayedNotes([])} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '11px', fontFamily: 'DM Mono, monospace' }}>clear</button>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-muted)' }}>Quick Chords</div>
            {QUICK_CHORDS.map(c => (
              <button key={c.name} onMouseDown={() => playChord(c.notes)}
                style={{ padding: '13px 16px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'all 0.15s' }}
                onMouseEnter={e => { (e.currentTarget).style.borderColor = c.color + '50'; (e.currentTarget).style.transform = 'translateY(-1px)' }}
                onMouseLeave={e => { (e.currentTarget).style.borderColor = 'var(--border)'; (e.currentTarget).style.transform = 'none' }}
              >
                <div>
                  <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '1px' }}>{c.name}</div>
                  <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '10px', color: 'var(--text-muted)' }}>{c.notes.map(n => n.replace(/\d/,'')).join('·')}</div>
                </div>
                <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: c.color + '18', border: `1px solid ${c.color}38`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: c.color, fontSize: '13px', flexShrink: 0 }}>♪</div>
              </button>
            ))}

            {/* Active keys display */}
            <div style={{ marginTop: '4px', padding: '12px 14px', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '10px' }}>
              <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '7px' }}>
                Active: {pressedKeys.size}
              </div>
              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', minHeight: '20px' }}>
                {[...pressedKeys].map(k => (
                  <span key={k} style={{ padding: '2px 7px', borderRadius: '4px', background: 'rgba(212,168,71,0.14)', border: '1px solid rgba(212,168,71,0.28)', color: 'var(--accent-gold)', fontFamily: 'DM Mono, monospace', fontSize: '11px' }}>
                    {k.replace(/\d/,'')}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
