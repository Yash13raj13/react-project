import { useState, useRef } from 'react'

// ── Frequencies ──────────────────────────────────────────────
const FREQS: Record<string, number> = {
  'C3': 130.81, 'C#3': 138.59, 'D3': 146.83, 'D#3': 155.56, 'E3': 164.81,
  'F3': 174.61, 'F#3': 185.00, 'G3': 196.00, 'G#3': 207.65, 'A3': 220.00,
  'A#3': 233.08, 'B3': 246.94, 'C4': 261.63, 'C#4': 277.18, 'D4': 293.66,
  'D#4': 311.13, 'E4': 329.63, 'F4': 349.23, 'F#4': 369.99, 'G4': 392.00,
  'G#4': 415.30, 'A4': 440.00, 'A#4': 466.16, 'B4': 493.88, 'C5': 523.25,
  'C#5': 554.37, 'D5': 587.33, 'E5': 659.25,
}

const FREQ_KEYS = Object.keys(FREQS)
const FREQ_VALS = Object.values(FREQS)

function freqAt(baseNote: string, semitones: number): number {
  const idx = FREQ_KEYS.indexOf(baseNote)
  if (idx === -1) return 440
  const target = Math.min(Math.max(idx + semitones, 0), FREQ_KEYS.length - 1)
  return FREQ_VALS[target]
}

// ── Data ─────────────────────────────────────────────────────
const INTERVALS = [
  { name: 'Minor 2nd',   semitones: 1,  hint: 'Jaws theme' },
  { name: 'Major 2nd',   semitones: 2,  hint: 'Happy Birthday' },
  { name: 'Minor 3rd',   semitones: 3,  hint: 'Smoke on the Water' },
  { name: 'Major 3rd',   semitones: 4,  hint: 'When the Saints' },
  { name: 'Perfect 4th', semitones: 5,  hint: 'Here Comes the Bride' },
  { name: 'Tritone',     semitones: 6,  hint: 'The Simpsons theme' },
  { name: 'Perfect 5th', semitones: 7,  hint: 'Star Wars' },
  { name: 'Minor 6th',   semitones: 8,  hint: 'The Entertainer' },
  { name: 'Major 6th',   semitones: 9,  hint: 'My Bonnie' },
  { name: 'Minor 7th',   semitones: 10, hint: 'Somewhere (reprise)' },
  { name: 'Major 7th',   semitones: 11, hint: 'Take On Me' },
  { name: 'Octave',      semitones: 12, hint: 'Somewhere Over the Rainbow' },
]

const CHORD_TYPES = [
  { name: 'Major',        intervals: [0, 4, 7],     color: '#d4a847', desc: 'Bright & happy' },
  { name: 'Minor',        intervals: [0, 3, 7],     color: '#9b7fe8', desc: 'Dark & emotional' },
  { name: 'Dominant 7th', intervals: [0, 4, 7, 10], color: '#e8507a', desc: 'Tense & bluesy' },
  { name: 'Major 7th',    intervals: [0, 4, 7, 11], color: '#2dd4c8', desc: 'Lush & dreamy' },
  { name: 'Minor 7th',    intervals: [0, 3, 7, 10], color: '#4db8ff', desc: 'Smooth & jazzy' },
  { name: 'Diminished',   intervals: [0, 3, 6],     color: '#ff9f43', desc: 'Tense & dissonant' },
]

const NOTE_NAMES = ['C', 'D', 'E', 'F', 'G', 'A', 'B']
const BASE_NOTES = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4']

type QuizMode = 'intervals' | 'chords' | 'notes'

interface Quiz {
  question: string
  correctAnswer: string
  options: string[]
  freqs: number[]
  simultaneous: boolean
  hint?: string
}

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5)
}

function pick4Including<T extends { name: string }>(pool: T[], correct: T): T[] {
  const others = shuffle(pool.filter(x => x.name !== correct.name)).slice(0, 3)
  return shuffle([correct, ...others])
}

// ── Component ─────────────────────────────────────────────────
export default function EarTraining() {
  const [mode, setMode] = useState<QuizMode>('intervals')
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [selected, setSelected] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [score, setScore] = useState({ correct: 0, total: 0 })
  const [streak, setStreak] = useState(0)
  const ctxRef = useRef<AudioContext | null>(null)

  // ── Audio helpers ──────────────────────────────────────────
  function getCtx(): AudioContext {
    if (!ctxRef.current || ctxRef.current.state === 'closed') {
      ctxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
    }
    return ctxRef.current
  }

  function playTone(ctx: AudioContext, freq: number, start: number, dur: number, vol = 0.3) {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    const filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.value = 3500
    osc.type = 'triangle'
    osc.frequency.value = freq
    gain.gain.setValueAtTime(0, start)
    gain.gain.linearRampToValueAtTime(vol, start + 0.015)
    gain.gain.setValueAtTime(vol * 0.8, start + dur * 0.6)
    gain.gain.linearRampToValueAtTime(0, start + dur)
    osc.connect(filter)
    filter.connect(gain)
    gain.connect(ctx.destination)
    osc.start(start)
    osc.stop(start + dur)
  }

  function playQuizSound(q: Quiz) {
    const ctx = getCtx()
    if (ctx.state === 'suspended') ctx.resume()
    setIsPlaying(true)
    const now = ctx.currentTime
    if (q.simultaneous) {
      q.freqs.forEach(f => playTone(ctx, f, now, 1.6, 0.28))
      setTimeout(() => setIsPlaying(false), 1800)
    } else {
      q.freqs.forEach((f, i) => playTone(ctx, f, now + i * 0.72, 0.65))
      setTimeout(() => setIsPlaying(false), q.freqs.length * 720 + 300)
    }
  }

  function playFeedback(correct: boolean) {
    const ctx = getCtx()
    if (ctx.state === 'suspended') ctx.resume()
    const now = ctx.currentTime
    if (correct) {
      playTone(ctx, 523, now,        0.12, 0.25)
      playTone(ctx, 659, now + 0.1,  0.12, 0.25)
      playTone(ctx, 784, now + 0.2,  0.18, 0.25)
    } else {
      playTone(ctx, 220, now,        0.3,  0.25)
      playTone(ctx, 196, now + 0.18, 0.3,  0.2)
    }
  }

  // ── Quiz generation ────────────────────────────────────────
  function generateQuiz() {
    setSelected(null)
    const base = BASE_NOTES[Math.floor(Math.random() * BASE_NOTES.length)]
    let q: Quiz

    if (mode === 'intervals') {
      const correct = INTERVALS[Math.floor(Math.random() * INTERVALS.length)]
      const four = pick4Including(INTERVALS, correct)
      q = {
        question: 'What interval is this?',
        correctAnswer: correct.name,
        options: four.map(x => x.name),
        freqs: [FREQS[base], freqAt(base, correct.semitones)],
        simultaneous: false,
        hint: correct.hint,
      }
    } else if (mode === 'chords') {
      const correct = CHORD_TYPES[Math.floor(Math.random() * CHORD_TYPES.length)]
      const four = pick4Including(CHORD_TYPES, correct)
      q = {
        question: 'What type of chord is this?',
        correctAnswer: correct.name,
        options: four.map(x => x.name),
        freqs: correct.intervals.map(i => freqAt(base, i)),
        simultaneous: true,
      }
    } else {
      const correct = NOTE_NAMES[Math.floor(Math.random() * NOTE_NAMES.length)]
      const four = shuffle(NOTE_NAMES.filter(n => n !== correct)).slice(0, 3)
      four.push(correct)
      q = {
        question: 'What note is this?',
        correctAnswer: correct,
        options: shuffle(four),
        freqs: [FREQS[correct + '4'] ?? 440],
        simultaneous: false,
      }
    }

    setQuiz(q)
    // Small delay so state is set before audio fires
    setTimeout(() => playQuizSound(q), 150)
  }

  function handleAnswer(ans: string) {
    if (selected !== null || !quiz) return
    setSelected(ans)
    const correct = ans === quiz.correctAnswer
    setScore(s => ({ correct: s.correct + (correct ? 1 : 0), total: s.total + 1 }))
    setStreak(s => correct ? s + 1 : 0)
    playFeedback(correct)
  }

  function switchMode(m: QuizMode) {
    setMode(m)
    setQuiz(null)
    setSelected(null)
  }

  const accuracy = score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0

  // ── Render ─────────────────────────────────────────────────
  return (
    <div style={{ paddingTop: '100px', paddingBottom: '80px', minHeight: '100vh' }}>
      <div className="container">

        {/* Header */}
        <div style={{ marginBottom: '36px' }}>
          <div className="section-label">Ear Training</div>
          <h1 className="section-title">Train Your Musical Ear</h1>
          <p className="section-subtitle">Identify intervals, chords, and notes purely by sound — the skill that separates good musicians from great ones.</p>
        </div>

        {/* Score strip */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '28px', flexWrap: 'wrap', alignItems: 'center' }}>
          {[
            { label: 'Score',    value: `${score.correct} / ${score.total}`, color: '#d4a847' },
            { label: 'Accuracy', value: `${accuracy}%`,                       color: '#2dd4c8' },
            { label: 'Streak 🔥', value: String(streak),                      color: '#e8507a' },
          ].map(s => (
            <div key={s.label} style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: '12px', padding: '14px 22px', minWidth: '110px',
            }}>
              <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: '5px' }}>{s.label}</div>
              <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '22px', fontWeight: '700', color: s.color }}>{s.value}</div>
            </div>
          ))}
          <button
            onClick={() => { setScore({ correct: 0, total: 0 }); setStreak(0) }}
            style={{ background: 'none', border: '1px solid var(--border)', borderRadius: '10px', padding: '14px 18px', color: 'var(--text-muted)', cursor: 'pointer', fontFamily: 'DM Mono, monospace', fontSize: '11px' }}
          >Reset</button>
        </div>

        {/* Mode pills */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '28px' }}>
          {([
            { key: 'intervals', label: '📏 Intervals' },
            { key: 'chords',    label: '🎶 Chords'    },
            { key: 'notes',     label: '🎵 Notes'     },
          ] as { key: QuizMode; label: string }[]).map(m => (
            <button key={m.key} onClick={() => switchMode(m.key)} style={{
              padding: '9px 20px', borderRadius: '50px',
              background: mode === m.key ? 'rgba(212,168,71,0.14)' : 'var(--bg-card)',
              border: `1px solid ${mode === m.key ? 'rgba(212,168,71,0.45)' : 'var(--border)'}`,
              color: mode === m.key ? 'var(--accent-gold)' : 'var(--text-secondary)',
              fontFamily: 'DM Sans, sans-serif', fontSize: '13px', fontWeight: '500',
              cursor: 'pointer', transition: 'all 0.2s',
            }}>{m.label}</button>
          ))}
        </div>

        {/* Main quiz card */}
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: '20px', padding: '40px', maxWidth: '600px',
        }}>
          {!quiz ? (
            /* ── Start screen ── */
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ fontSize: '72px', marginBottom: '16px', lineHeight: 1 }}>👂</div>
              <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '22px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '12px' }}>
                Ready to train?
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '15px', lineHeight: '1.7', marginBottom: '32px', maxWidth: '380px', margin: '0 auto 32px' }}>
                {mode === 'intervals'
                  ? 'Two notes play in sequence. Identify the interval between them.'
                  : mode === 'chords'
                  ? 'A chord plays all at once. Identify the chord type.'
                  : 'A single note plays. Name the note.'}
              </p>
              <button className="btn-primary" onClick={generateQuiz} style={{ fontSize: '15px' }}>
                Start Quiz ▶
              </button>
            </div>
          ) : (
            /* ── Active quiz ── */
            <div>
              {/* Question label */}
              <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--text-muted)', textAlign: 'center', marginBottom: '24px' }}>
                {quiz.question}
              </div>

              {/* Play button */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', marginBottom: '32px' }}>
                <button
                  onClick={() => playQuizSound(quiz)}
                  disabled={isPlaying}
                  style={{
                    width: '88px', height: '88px', borderRadius: '50%',
                    background: isPlaying
                      ? 'transparent'
                      : 'linear-gradient(135deg, var(--accent-gold), var(--accent-gold-dim))',
                    border: isPlaying ? '2px solid var(--accent-gold)' : 'none',
                    color: isPlaying ? 'var(--accent-gold)' : '#080810',
                    fontSize: '32px', cursor: isPlaying ? 'default' : 'pointer',
                    transition: 'all 0.25s',
                    boxShadow: isPlaying ? '0 0 28px rgba(212,168,71,0.45)' : '0 6px 24px rgba(212,168,71,0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  {isPlaying ? (
                    <span style={{ fontSize: '22px', animation: 'waveform 0.8s ease-in-out infinite alternate' }}>♫</span>
                  ) : '▶'}
                </button>
                <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '11px', color: 'var(--text-muted)' }}>
                  {isPlaying ? 'Playing…' : selected ? 'Play again' : 'Click to replay'}
                </span>
              </div>

              {/* Answer options */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
                {quiz.options.map(opt => {
                  const isChosen  = selected === opt
                  const isCorrect = opt === quiz.correctAnswer
                  const revealed  = selected !== null

                  let bg     = 'var(--bg-surface)'
                  let border = 'var(--border)'
                  let color  = 'var(--text-primary)'
                  let prefix = ''

                  if (revealed) {
                    if (isCorrect) {
                      bg = 'rgba(107,201,107,0.13)'; border = '#6bc96b'; color = '#6bc96b'; prefix = '✓ '
                    } else if (isChosen) {
                      bg = 'rgba(232,80,122,0.13)'; border = '#e8507a'; color = '#e8507a'; prefix = '✗ '
                    } else {
                      color = 'var(--text-muted)'
                    }
                  }

                  return (
                    <button
                      key={opt}
                      onClick={() => handleAnswer(opt)}
                      disabled={revealed}
                      style={{
                        padding: '15px 12px', borderRadius: '12px',
                        background: bg, border: `1.5px solid ${border}`, color,
                        fontFamily: 'DM Sans, sans-serif', fontSize: '14px', fontWeight: '500',
                        cursor: revealed ? 'default' : 'pointer',
                        transition: 'all 0.18s',
                        textAlign: 'center',
                      }}
                      onMouseEnter={e => { if (!revealed) (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-accent)' }}
                      onMouseLeave={e => { if (!revealed) (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)' }}
                    >
                      {prefix}{opt}
                    </button>
                  )
                })}
              </div>

              {/* Feedback + next */}
              {selected !== null && (
                <div style={{ textAlign: 'center', paddingTop: '8px', borderTop: '1px solid var(--border)' }}>
                  {selected === quiz.correctAnswer ? (
                    <div style={{ color: '#6bc96b', fontWeight: '600', fontSize: '16px', marginBottom: '16px' }}>
                      ✓ Correct!{streak > 1 ? ` 🔥 ${streak} in a row!` : ''}
                    </div>
                  ) : (
                    <div style={{ marginBottom: '16px' }}>
                      <div style={{ color: '#e8507a', fontWeight: '600', fontSize: '15px' }}>
                        ✗ It was: <span style={{ color: '#6bc96b' }}>{quiz.correctAnswer}</span>
                      </div>
                      {quiz.hint && (
                        <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '11px', color: 'var(--text-muted)', marginTop: '5px' }}>
                          💡 Remember: {quiz.hint}
                        </div>
                      )}
                    </div>
                  )}
                  <button className="btn-primary" onClick={generateQuiz} style={{ fontSize: '14px', padding: '11px 28px' }}>
                    Next →
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Reference tables */}
        <div style={{ marginTop: '48px' }}>
          {mode === 'intervals' && (
            <>
              <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-muted)', marginBottom: '14px' }}>
                Interval Reference
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: '10px' }}>
                {INTERVALS.map(iv => (
                  <div key={iv.name} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px 16px' }}>
                    <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '10px', color: 'var(--accent-gold)', marginBottom: '4px' }}>{iv.semitones} semitone{iv.semitones !== 1 ? 's' : ''}</div>
                    <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '3px' }}>{iv.name}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontStyle: 'italic' }}>{iv.hint}</div>
                  </div>
                ))}
              </div>
            </>
          )}

          {mode === 'chords' && (
            <>
              <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-muted)', marginBottom: '14px' }}>
                Chord Reference
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: '10px' }}>
                {CHORD_TYPES.map(ct => (
                  <div key={ct.name} style={{ background: 'var(--bg-card)', border: `1px solid ${ct.color}30`, borderRadius: '12px', padding: '14px 16px' }}>
                    <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '14px', fontWeight: '700', color: ct.color, marginBottom: '4px' }}>{ct.name}</div>
                    <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '3px' }}>+{ct.intervals.join(', ')} semitones</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontStyle: 'italic' }}>{ct.desc}</div>
                  </div>
                ))}
              </div>
            </>
          )}

          {mode === 'notes' && (
            <>
              <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-muted)', marginBottom: '14px' }}>
                Notes in Octave 4
              </div>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {NOTE_NAMES.map(n => (
                  <div key={n} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px 18px', textAlign: 'center' }}>
                    <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '20px', fontWeight: '700', color: 'var(--accent-gold)' }}>{n}</div>
                    <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '10px', color: 'var(--text-muted)', marginTop: '3px' }}>{FREQS[n + '4']?.toFixed(1)} Hz</div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  )
}
