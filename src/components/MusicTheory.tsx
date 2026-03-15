import { useState } from 'react'

const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

const SCALES: Record<string, { intervals: number[]; description: string; mood: string; color: string }> = {
  Major: { intervals: [0,2,4,5,7,9,11], description: 'Happy, bright, and uplifting. The foundation of Western music.', mood: '😊 Happy', color: '#d4a847' },
  'Natural Minor': { intervals: [0,2,3,5,7,8,10], description: 'Sad, dark, and emotional. Common in pop, rock, and classical.', mood: '😔 Melancholic', color: '#9b7fe8' },
  'Harmonic Minor': { intervals: [0,2,3,5,7,8,11], description: 'Exotic and dramatic with a raised 7th degree.', mood: '🌙 Exotic', color: '#e8507a' },
  Dorian: { intervals: [0,2,3,5,7,9,10], description: 'Minor scale with a raised 6th — jazzy and soulful.', mood: '🎷 Soulful', color: '#2dd4c8' },
  Phrygian: { intervals: [0,1,3,5,7,8,10], description: 'Dark, Spanish-flavored with a distinctive b2.', mood: '🦋 Mysterious', color: '#e86c2d' },
  Lydian: { intervals: [0,2,4,6,7,9,11], description: 'Dreamy and floaty with a raised 4th.', mood: '✨ Ethereal', color: '#4db8ff' },
  Pentatonic: { intervals: [0,2,4,7,9], description: '5-note scale — the backbone of blues and folk music.', mood: '🌍 Universal', color: '#6bc96b' },
}

const CHORDS: Record<string, { intervals: number[]; symbol: string; description: string; color: string }> = {
  Major: { intervals: [0,4,7], symbol: '', description: 'Bright and stable. The most common chord type.', color: '#d4a847' },
  Minor: { intervals: [0,3,7], symbol: 'm', description: 'Darker and more emotional than major.', color: '#9b7fe8' },
  Dominant7: { intervals: [0,4,7,10], symbol: '7', description: 'Bluesy and tension-building. Wants to resolve.', color: '#e8507a' },
  Major7: { intervals: [0,4,7,11], symbol: 'maj7', description: 'Lush, dreamy — common in jazz and bossa nova.', color: '#2dd4c8' },
  Minor7: { intervals: [0,3,7,10], symbol: 'm7', description: 'Smooth and sophisticated. A jazz staple.', color: '#4db8ff' },
  Diminished: { intervals: [0,3,6], symbol: '°', description: 'Tense and dissonant. Creates dramatic tension.', color: '#e86c2d' },
  Augmented: { intervals: [0,4,8], symbol: '+', description: 'Ambiguous and dreamlike — symmetrical structure.', color: '#6bc96b' },
  Sus2: { intervals: [0,2,7], symbol: 'sus2', description: 'Open, floaty sound without a 3rd.', color: '#ff9f43' },
}

const THEORY_TOPICS = [
  {
    id: 'notes',
    icon: '🎵',
    title: 'The 12 Notes',
    color: '#d4a847',
    content: `Western music is built on 12 pitch classes arranged in a chromatic scale. These 12 notes repeat across octaves — higher or lower in frequency. The distance between any two adjacent notes is called a **semitone** (or half step). Two semitones make a **whole tone** (whole step).

The 7 natural notes (A B C D E F G) are the white keys on a piano. The 5 sharps/flats (C# D# F# G# A#) are the black keys. Each note has an enharmonic equivalent — C# sounds identical to D♭.

**Concert pitch** is A = 440 Hz, the standard tuning used worldwide.`,
  },
  {
    id: 'intervals',
    icon: '📏',
    title: 'Intervals',
    color: '#2dd4c8',
    content: `An interval is the distance between two notes. Intervals are the building blocks of melodies and chords.

- **Unison (0 semitones)** — Same note
- **Minor 2nd (1)** — Dissonant step
- **Major 2nd (2)** — Whole step
- **Minor 3rd (3)** — Minor chord foundation
- **Major 3rd (4)** — Major chord foundation  
- **Perfect 4th (5)** — Open, stable sound
- **Tritone (6)** — The "devil's interval" — maximum tension
- **Perfect 5th (7)** — The power chord
- **Minor 6th (8)** — Bittersweet
- **Major 6th (9)** — Warm, major feel
- **Minor 7th (10)** — Dominant tension
- **Major 7th (11)** — Dreamy, leading tone
- **Octave (12)** — Same note, doubled frequency`,
  },
  {
    id: 'rhythm',
    icon: '🥁',
    title: 'Rhythm & Time',
    color: '#e8507a',
    content: `Rhythm is the backbone of music — it organizes sound in time. Key concepts include:

**Time Signatures** define how beats are grouped. 4/4 (common time) has 4 quarter-note beats per bar. 3/4 (waltz) has 3. 6/8 has 6 eighth notes grouped as 2 beats of 3.

**Tempo** is the speed in BPM (beats per minute). Largo ~50 BPM, Andante ~76, Allegro ~120-160, Presto ~200+.

**Note Values**: Whole note (4 beats) → Half note (2) → Quarter note (1) → Eighth (½) → Sixteenth (¼).

**Syncopation** places emphasis on weak beats — the foundation of jazz, reggae, and funk.`,
  },
  {
    id: 'harmony',
    icon: '🎶',
    title: 'Harmony & Tonality',
    color: '#9b7fe8',
    content: `Harmony is the vertical dimension of music — notes sounding simultaneously. **Tonality** refers to the sense of a home key or tonal center.

**Consonance** describes stable, pleasing intervals (unison, 5ths, 3rds). **Dissonance** describes unstable intervals that create tension and want to resolve (7ths, tritones, 2nds).

The **circle of fifths** maps all 12 keys arranged by fifths — adjacent keys share maximum common notes. Moving around it clockwise raises the key by a fifth.

**Modulation** is changing from one key to another mid-composition. **Cadences** are chord progressions that create a sense of arrival or rest (e.g., V→I is a perfect cadence).`,
  },
]

export default function MusicTheory() {
  const [rootNote, setRootNote] = useState('C')
  const [selectedScale, setSelectedScale] = useState('Major')
  const [selectedChord, setSelectedChord] = useState('Major')
  const [expandedTopic, setExpandedTopic] = useState<string | null>('notes')
  const [activeTab, setActiveTab] = useState<'scales' | 'chords' | 'theory'>('theory')

  const getScaleNotes = () => {
    const rootIdx = NOTES.indexOf(rootNote)
    return SCALES[selectedScale].intervals.map(i => NOTES[(rootIdx + i) % 12])
  }

  const getChordNotes = () => {
    const rootIdx = NOTES.indexOf(rootNote)
    return CHORDS[selectedChord].intervals.map(i => NOTES[(rootIdx + i) % 12])
  }

  const scaleNotes = getScaleNotes()
  const chordNotes = getChordNotes()

  return (
    <div style={{ paddingTop: '100px', paddingBottom: '80px', minHeight: '100vh' }}>
      <div className="container">
        {/* Header */}
        <div style={{ marginBottom: '60px', animation: 'fadeUp 0.6s ease forwards' }}>
          <div className="section-label">Music Theory</div>
          <h1 className="section-title">The Science of Sound</h1>
          <p className="section-subtitle">
            From the physics of frequency to the art of harmony — explore the building blocks that make music work.
          </p>
        </div>

        {/* Tab bar */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '48px', borderBottom: '1px solid rgba(255,255,255,0.07)', paddingBottom: '0' }}>
          {(['theory', 'scales', 'chords'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '10px 22px',
                background: 'none',
                border: 'none',
                borderBottom: activeTab === tab ? '2px solid #d4a847' : '2px solid transparent',
                color: activeTab === tab ? '#d4a847' : '#9896a8',
                fontFamily: 'DM Sans, sans-serif',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s',
                textTransform: 'capitalize',
                letterSpacing: '0.02em',
              }}
            >{tab === 'theory' ? 'Core Concepts' : tab === 'scales' ? 'Scale Explorer' : 'Chord Builder'}</button>
          ))}
        </div>

        {/* Core Concepts Tab */}
        {activeTab === 'theory' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', animation: 'fadeUp 0.5s ease forwards' }}>
            {THEORY_TOPICS.map(topic => (
              <div
                key={topic.id}
                className="glass-card"
                style={{ overflow: 'hidden', cursor: 'pointer' }}
                onClick={() => setExpandedTopic(expandedTopic === topic.id ? null : topic.id)}
              >
                <div style={{ padding: '24px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{
                      width: '44px', height: '44px', borderRadius: '12px',
                      background: `${topic.color}18`, border: `1px solid ${topic.color}30`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px',
                      flexShrink: 0,
                    }}>{topic.icon}</div>
                    <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '19px', fontWeight: '600', color: '#f0ede8' }}>{topic.title}</div>
                  </div>
                  <div style={{ color: '#9896a8', fontSize: '18px', transition: 'transform 0.3s', transform: expandedTopic === topic.id ? 'rotate(180deg)' : 'none', flexShrink: 0 }}>⌄</div>
                </div>
                {expandedTopic === topic.id && (
                  <div style={{ padding: '0 28px 28px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ paddingTop: '20px', color: '#9896a8', lineHeight: '1.8', fontSize: '15px', whiteSpace: 'pre-line' }}>
                      {topic.content.split('**').map((part, i) =>
                        i % 2 === 1
                          ? <strong key={i} style={{ color: topic.color, fontWeight: '600' }}>{part}</strong>
                          : <span key={i}>{part}</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Scale Explorer Tab */}
        {activeTab === 'scales' && (
          <div style={{ animation: 'fadeUp 0.5s ease forwards' }}>
            {/* Controls */}
            <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', marginBottom: '40px' }}>
              <div>
                <div style={{ fontSize: '12px', color: '#55546a', fontFamily: 'DM Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '10px' }}>Root Note</div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {NOTES.map(note => (
                    <button key={note} onClick={() => setRootNote(note)} style={{
                      width: '44px', height: '44px', borderRadius: '10px',
                      background: rootNote === note ? 'linear-gradient(135deg, #d4a847, #a07a28)' : 'rgba(255,255,255,0.04)',
                      border: rootNote === note ? 'none' : '1px solid rgba(255,255,255,0.08)',
                      color: rootNote === note ? '#080810' : '#9896a8',
                      fontFamily: 'DM Mono, monospace', fontSize: '12px', fontWeight: '600',
                      cursor: 'pointer', transition: 'all 0.2s',
                    }}>{note}</button>
                  ))}
                </div>
              </div>
            </div>

            {/* Scale grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '40px' }}>
              {Object.entries(SCALES).map(([name, scale]) => (
                <button
                  key={name}
                  onClick={() => setSelectedScale(name)}
                  className="glass-card"
                  style={{
                    padding: '20px 24px', textAlign: 'left', cursor: 'pointer', border: 'none',
                    borderColor: selectedScale === name ? scale.color + '40' : undefined,
                    background: selectedScale === name ? `${scale.color}10` : undefined,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '16px', fontWeight: '600', color: selectedScale === name ? scale.color : '#f0ede8' }}>{name}</div>
                    <span style={{ fontSize: '14px' }}>{scale.mood}</span>
                  </div>
                  <div style={{ fontSize: '13px', color: '#9896a8', lineHeight: '1.5' }}>{scale.description}</div>
                </button>
              ))}
            </div>

            {/* Scale display */}
            <div style={{ background: 'rgba(212,168,71,0.04)', border: '1px solid rgba(212,168,71,0.15)', borderRadius: '16px', padding: '32px' }}>
              <div style={{ marginBottom: '20px' }}>
                <span style={{ fontFamily: 'Playfair Display, serif', fontSize: '22px', fontWeight: '700', color: '#f0ede8' }}>{rootNote} {selectedScale}</span>
                <span style={{ marginLeft: '12px', fontFamily: 'DM Mono, monospace', fontSize: '12px', color: '#55546a' }}>{scaleNotes.length} notes</span>
              </div>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {scaleNotes.map((note, i) => (
                  <div key={i} style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
                    padding: '16px 20px', borderRadius: '12px',
                    background: i === 0 ? `${SCALES[selectedScale].color}22` : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${i === 0 ? SCALES[selectedScale].color + '40' : 'rgba(255,255,255,0.06)'}`,
                    minWidth: '54px',
                  }}>
                    <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '16px', fontWeight: '600', color: i === 0 ? SCALES[selectedScale].color : '#f0ede8' }}>{note}</div>
                    <div style={{ fontSize: '11px', color: '#55546a' }}>{['R','2','3','4','5','6','7','8'][i] || (i+1)}</div>
                  </div>
                ))}
              </div>
              {/* Visual step display */}
              <div style={{ marginTop: '24px', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '12px', color: '#55546a', fontFamily: 'DM Mono, monospace', marginRight: '4px' }}>STEPS:</span>
                {SCALES[selectedScale].intervals.map((interval, i, arr) => {
                  const step = i < arr.length - 1 ? arr[i+1] - arr[i] : 12 - arr[arr.length-1]
                  return (
                    <span key={i} style={{
                      padding: '3px 10px', borderRadius: '6px', fontSize: '12px',
                      fontFamily: 'DM Mono, monospace',
                      background: step === 2 ? 'rgba(212,168,71,0.12)' : 'rgba(155,127,232,0.12)',
                      color: step === 2 ? '#d4a847' : '#9b7fe8',
                      border: `1px solid ${step === 2 ? 'rgba(212,168,71,0.2)' : 'rgba(155,127,232,0.2)'}`,
                    }}>{step === 2 ? 'W' : 'H'}</span>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* Chord Builder Tab */}
        {activeTab === 'chords' && (
          <div style={{ animation: 'fadeUp 0.5s ease forwards' }}>
            <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', marginBottom: '40px' }}>
              <div>
                <div style={{ fontSize: '12px', color: '#55546a', fontFamily: 'DM Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '10px' }}>Root Note</div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {NOTES.map(note => (
                    <button key={note} onClick={() => setRootNote(note)} style={{
                      width: '44px', height: '44px', borderRadius: '10px',
                      background: rootNote === note ? 'linear-gradient(135deg, #d4a847, #a07a28)' : 'rgba(255,255,255,0.04)',
                      border: rootNote === note ? 'none' : '1px solid rgba(255,255,255,0.08)',
                      color: rootNote === note ? '#080810' : '#9896a8',
                      fontFamily: 'DM Mono, monospace', fontSize: '12px', fontWeight: '600',
                      cursor: 'pointer', transition: 'all 0.2s',
                    }}>{note}</button>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '40px' }}>
              {Object.entries(CHORDS).map(([name, chord]) => (
                <button
                  key={name}
                  onClick={() => setSelectedChord(name)}
                  className="glass-card"
                  style={{
                    padding: '18px 22px', textAlign: 'left', cursor: 'pointer', border: 'none',
                    borderColor: selectedChord === name ? chord.color + '40' : undefined,
                    background: selectedChord === name ? `${chord.color}10` : undefined,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                    <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '15px', fontWeight: '600', color: selectedChord === name ? chord.color : '#f0ede8' }}>{name}</div>
                    <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '12px', color: chord.color, background: chord.color + '18', padding: '2px 8px', borderRadius: '6px', border: `1px solid ${chord.color}30` }}>{rootNote}{chord.symbol}</span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#9896a8', lineHeight: '1.5' }}>{chord.description}</div>
                </button>
              ))}
            </div>

            {/* Chord display */}
            <div style={{ background: `${CHORDS[selectedChord].color}08`, border: `1px solid ${CHORDS[selectedChord].color}25`, borderRadius: '16px', padding: '32px' }}>
              <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'baseline', gap: '12px' }}>
                <span style={{ fontFamily: 'Playfair Display, serif', fontSize: '28px', fontWeight: '700', color: '#f0ede8' }}>
                  {rootNote}<span style={{ color: CHORDS[selectedChord].color }}>{CHORDS[selectedChord].symbol}</span>
                </span>
                <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '15px', color: '#9896a8' }}>{selectedChord} Chord</span>
              </div>
              <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                {chordNotes.map((note, i) => {
                  const names = ['Root', '3rd', '5th', '7th', '9th']
                  return (
                    <div key={i} style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
                      padding: '20px 24px', borderRadius: '14px',
                      background: i === 0 ? `${CHORDS[selectedChord].color}22` : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${i === 0 ? CHORDS[selectedChord].color + '50' : 'rgba(255,255,255,0.06)'}`,
                      minWidth: '70px',
                    }}>
                      <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '20px', fontWeight: '600', color: i === 0 ? CHORDS[selectedChord].color : '#f0ede8' }}>{note}</div>
                      <div style={{ fontSize: '11px', color: '#55546a', fontFamily: 'DM Mono, monospace', letterSpacing: '0.05em' }}>{names[i]}</div>
                    </div>
                  )
                })}
              </div>
              <div style={{ marginTop: '20px', fontSize: '14px', color: '#9896a8', lineHeight: '1.6' }}>{CHORDS[selectedChord].description}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
