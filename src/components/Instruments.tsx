import { useState } from 'react'

interface Instrument {
  name: string
  emoji: string
  origin: string
  type: string
  description: string
  funFact: string
  range?: string
  color: string
}

const INSTRUMENT_FAMILIES: Record<string, { color: string; icon: string; instruments: Instrument[] }> = {
  'String': {
    color: '#d4a847',
    icon: '🎻',
    instruments: [
      { name: 'Guitar', emoji: '🎸', origin: 'Spain (16th c.)', type: 'Chordophone', description: 'The world\'s most popular instrument. 6 strings tuned E-A-D-G-B-E. Core of rock, pop, folk, and flamenco.', funFact: 'Over 2 billion guitars exist worldwide.', range: 'E2–E6', color: '#d4a847' },
      { name: 'Violin', emoji: '🎻', origin: 'Italy (16th c.)', type: 'Chordophone', description: 'Highest-pitched bowed string instrument. Heart of the orchestra. Four strings: G-D-A-E.', funFact: 'A violin bow uses ~150 horse hairs.', range: 'G3–A7', color: '#e8b84b' },
      { name: 'Cello', emoji: '🎻', origin: 'Italy (16th c.)', type: 'Chordophone', description: 'Rich, warm bowed instrument. Tuned C-G-D-A. Closest to the human voice range.', funFact: 'Played between the knees, like an acoustic "chair."', range: 'C2–C6', color: '#c89a36' },
      { name: 'Bass Guitar', emoji: '🎸', origin: 'USA (1950s)', type: 'Chordophone', description: 'Provides the low-end foundation in bands. Usually 4 strings tuned E-A-D-G.', funFact: 'Leo Fender revolutionized music when he invented it in 1951.', range: 'E1–G4', color: '#f0c060' },
      { name: 'Harp', emoji: '🪕', origin: 'Mesopotamia (~3500 BC)', type: 'Chordophone', description: 'The oldest known chordophone. Modern concert harps have 47 strings and 7 pedals.', funFact: 'The harp appears in the national symbol of Ireland.', range: 'C1–G7', color: '#d4a847' },
      { name: 'Ukulele', emoji: '🪕', origin: 'Hawaii (1880s)', type: 'Chordophone', description: 'Small 4-string guitar-like instrument. Four strings tuned G-C-E-A. Known for its bright, joyful tone.', funFact: 'The name means "jumping flea" in Hawaiian.', range: 'G4–A6', color: '#e8c060' },
      { name: 'Banjo', emoji: '🪕', origin: 'West Africa / USA', type: 'Chordophone', description: '4 or 5 string instrument with a drum-like resonator. Central to bluegrass and folk music.', funFact: 'African enslaved people brought its ancestor, the akonting, to America.', color: '#b8882a' },
      { name: 'Mandolin', emoji: '🪕', origin: 'Italy (18th c.)', type: 'Chordophone', description: '8 strings in 4 pairs (double-courses). Tuned like a violin: G-D-A-E. Core of Italian and folk music.', funFact: 'Vivaldi composed concertos specifically for mandolin.', color: '#d4a847' },
    ]
  },
  'Wind': {
    color: '#2dd4c8',
    icon: '🎺',
    instruments: [
      { name: 'Piano', emoji: '🎹', origin: 'Italy (1700)', type: 'Keyboard/Percussion', description: 'The "king of instruments." 88 keys, covering the full range of the orchestra. Hammers strike strings.', funFact: 'A full-size piano has over 12,000 parts.', range: 'A0–C8', color: '#2dd4c8' },
      { name: 'Trumpet', emoji: '🎺', origin: 'Ancient Egypt / Modern: 1800s', type: 'Aerophone', description: 'Highest brass instrument. Brilliant, piercing tone. 3 valves to change pitch.', funFact: 'Miles Davis is considered the greatest trumpeter of the 20th century.', range: 'F#3–D6', color: '#40d4c8' },
      { name: 'Flute', emoji: '🪈', origin: 'Ancient (~43,000 BC)', type: 'Aerophone', description: 'Among the world\'s oldest instruments. Player blows across a hole to create sound.', funFact: 'The oldest known musical instrument is a flute made from a vulture bone.', range: 'C4–C7', color: '#60e0d8' },
      { name: 'Saxophone', emoji: '🎷', origin: 'Belgium (1840s)', type: 'Aerophone', description: 'Invented by Adolphe Sax. Made of brass but uses a reed — bridges woodwinds and brass.', funFact: 'Despite being made of metal, saxophones are classified as woodwinds.', range: 'Bb3–F#6', color: '#2dd4c8' },
      { name: 'Clarinet', emoji: '🎵', origin: 'Germany (1700)', type: 'Aerophone', description: 'Single-reed woodwind. Known for its warm, rich tone across a wide dynamic range.', funFact: 'Mozart wrote his famous Clarinet Concerto for his friend Anton Stadler.', range: 'D3–Bb6', color: '#3ecac0' },
      { name: 'Trombone', emoji: '🎺', origin: 'Europe (15th c.)', type: 'Aerophone', description: 'Brass instrument with a slide instead of valves. Glissandos are its signature sound.', funFact: 'Once called the "sackbut" — meaning "push-pull" in medieval French.', range: 'E2–Bb5', color: '#20b8b0' },
      { name: 'Oboe', emoji: '🪈', origin: 'France (17th c.)', type: 'Aerophone', description: 'Double-reed woodwind. Nasal, penetrating tone. Tuning note for orchestras (concert A).', funFact: 'The oboe takes 200+ hours to make a single reed.', range: 'Bb3–A6', color: '#50d8d0' },
      { name: 'French Horn', emoji: '📯', origin: 'Europe (17th c.)', type: 'Aerophone', description: '12 feet of tubing coiled into a circular shape. Mellow, warm brass tone.', funFact: 'Players insert their hand into the bell to tune and alter tone color.', range: 'B1–F5', color: '#2dd4c8' },
    ]
  },
  'Percussion': {
    color: '#e8507a',
    icon: '🥁',
    instruments: [
      { name: 'Drums', emoji: '🥁', origin: 'Ancient (~6000 BC)', type: 'Membranophone', description: 'The heartbeat of modern music. Drum kit includes kick, snare, hi-hat, toms, and crash cymbals.', funFact: 'The fastest drummers can play 1000+ notes per minute.', color: '#e8507a' },
      { name: 'Marimba', emoji: '🪘', origin: 'Africa / Central America', type: 'Idiophone', description: 'Wooden bars struck with mallets. Tuned resonator tubes beneath each bar. Warm, woody tone.', funFact: 'Guatemala named the marimba their national instrument.', color: '#e86080' },
      { name: 'Xylophone', emoji: '🎵', origin: 'Africa/Asia (~9th c.)', type: 'Idiophone', description: 'Similar to marimba but brighter and more percussive. Wooden bars, smaller resonators.', funFact: 'The name comes from Greek: xylon (wood) + phone (sound).', color: '#f07090' },
      { name: 'Timpani', emoji: '🥁', origin: 'Ottoman Empire (~14th c.)', type: 'Membranophone', description: 'Large kettle drums with adjustable pitch via pedals. Can play definite pitches in orchestras.', funFact: 'Beethoven used off-key timpani intentionally to create dramatic tension.', color: '#e8507a' },
      { name: 'Tabla', emoji: '🪘', origin: 'India (~18th c.)', type: 'Membranophone', description: 'Pair of hand drums from India. Central to Hindustani classical music. Can play complex rhythmic patterns (tala).', funFact: 'The tabla\'s black center patch (syahi) is made from iron powder and rice paste.', color: '#d04060' },
      { name: 'Cajón', emoji: '📦', origin: 'Peru (18th c.)', type: 'Membranophone', description: 'Box-shaped percussion instrument. Player sits on it and strikes the front face.', funFact: 'Paco de Lucia introduced cajón into flamenco after finding one in Peru.', color: '#e86070' },
    ]
  },
  'Electronic': {
    color: '#9b7fe8',
    icon: '🎹',
    instruments: [
      { name: 'Synthesizer', emoji: '🎹', origin: 'USA (1960s)', type: 'Electrophone', description: 'Generates sound electronically. Can imitate any instrument or create entirely new sounds via oscillators, filters, and envelopes.', funFact: 'The Moog synthesizer debuted at the 1964 New York World\'s Fair.', color: '#9b7fe8' },
      { name: 'Electric Guitar', emoji: '🎸', origin: 'USA (1930s)', type: 'Electrophone', description: 'Magnetic pickups convert string vibrations to electrical signals. Foundation of rock music.', funFact: 'Jimi Hendrix played a right-handed guitar strung left-handed.', color: '#aa90f0' },
      { name: 'Theremin', emoji: '📻', origin: 'Russia (1920)', type: 'Electrophone', description: 'The world\'s first electronic instrument. Played without touching — hands move near two antennas.', funFact: 'Leon Theremin gave a private demonstration to Lenin in 1920.', color: '#8b6fd8' },
      { name: 'Drum Machine', emoji: '🥁', origin: 'USA (1980s)', type: 'Electrophone', description: 'Programmable rhythm patterns. The Roland TR-808 defined hip-hop, techno, and pop production.', funFact: 'The TR-808 was discontinued as a "failure" — it went on to define modern music.', color: '#b090f8' },
      { name: 'Vocoder', emoji: '🎙️', origin: 'USA (1930s)', type: 'Electrophone', description: 'Processes voice through synthesis. Creates that iconic robotic vocal sound. Used by Daft Punk, Kraftwerk, and many others.', funFact: 'The vocoder was originally invented for secure military communications.', color: '#9b7fe8' },
    ]
  },
  'World': {
    color: '#6bc96b',
    icon: '🌍',
    instruments: [
      { name: 'Sitar', emoji: '🪕', origin: 'India (13th c.)', type: 'Chordophone', description: '18–21 strings across a long neck with moveable frets. Core of Hindustani classical music. Creates the characteristic "buzz" through sympathetic strings.', funFact: 'George Harrison learned sitar from Ravi Shankar in 1966.', color: '#6bc96b' },
      { name: 'Didgeridoo', emoji: '🪵', origin: 'Australia (~1500 BC)', type: 'Aerophone', description: 'Ancient Aboriginal wind instrument. A long wooden tube producing a deep drone. Circular breathing allows continuous sound.', funFact: 'The didgeridoo is one of the world\'s oldest wind instruments.', color: '#7ad97a' },
      { name: 'Kora', emoji: '🪕', origin: 'West Africa (18th c.)', type: 'Chordophone', description: '21-string instrument combining features of the lute and harp. Made from a large gourd. Central to Mandinka griot tradition.', funFact: 'The kora\'s bridge arrangement allows two separate tunes to be played simultaneously.', color: '#5cb95c' },
      { name: 'Erhu', emoji: '🎻', origin: 'China (~10th c.)', type: 'Chordophone', description: '2-string bowed instrument. The "Chinese violin." The bow hair is threaded between the strings permanently.', funFact: 'The erhu can imitate birdsong, wind, and human crying.', color: '#8de08d' },
      { name: 'Shamisen', emoji: '🪕', origin: 'Japan (16th c.)', type: 'Chordophone', description: '3-string plucked lute. Traditionally covered in cat or dog skin. Used in kabuki theater and geisha performances.', funFact: 'The shamisen was introduced to Japan via Okinawa from China.', color: '#6bc96b' },
      { name: 'Bagpipes', emoji: '🎵', origin: 'Middle East / Scotland', type: 'Aerophone', description: 'Wind instrument with a bag reservoir. Continuous drone while playing a melody on the chanter pipe.', funFact: 'Scotland\'s Highland bagpipes were once used to lead warriors into battle.', color: '#50a050' },
    ]
  },
}

export default function Instruments() {
  const [activeFamily, setActiveFamily] = useState('String')
  const [selectedInstrument, setSelectedInstrument] = useState<Instrument | null>(null)

  const family = INSTRUMENT_FAMILIES[activeFamily]

  return (
    <div style={{ paddingTop: '100px', paddingBottom: '80px', minHeight: '100vh' }}>
      <div className="container">
        {/* Header */}
        <div style={{ marginBottom: '48px', animation: 'fadeUp 0.6s ease forwards' }}>
          <div className="section-label">Instruments</div>
          <h1 className="section-title">The World's Instruments</h1>
          <p className="section-subtitle">
            From ancient bone flutes to modern synthesizers — explore 50+ instruments across every musical tradition.
          </p>
        </div>

        {/* Family tabs */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '40px', animation: 'fadeUp 0.6s ease 0.1s both forwards', opacity: 0 }}>
          {Object.entries(INSTRUMENT_FAMILIES).map(([name, fam]) => (
            <button
              key={name}
              onClick={() => { setActiveFamily(name); setSelectedInstrument(null); }}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '10px 20px', borderRadius: '50px',
                background: activeFamily === name ? fam.color + '20' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${activeFamily === name ? fam.color + '50' : 'rgba(255,255,255,0.08)'}`,
                color: activeFamily === name ? fam.color : '#9896a8',
                fontFamily: 'DM Sans, sans-serif', fontSize: '14px', fontWeight: '500',
                cursor: 'pointer', transition: 'all 0.2s',
              }}
            >
              <span>{fam.icon}</span>
              <span>{name}</span>
            </button>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: selectedInstrument ? '1fr 380px' : '1fr', gap: '24px', animation: 'fadeUp 0.5s ease forwards' }}>
          {/* Instrument grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px', alignContent: 'start' }}>
            {family.instruments.map(inst => (
              <button
                key={inst.name}
                onClick={() => setSelectedInstrument(selectedInstrument?.name === inst.name ? null : inst)}
                className="glass-card"
                style={{
                  padding: '24px', textAlign: 'left', cursor: 'pointer', border: 'none',
                  borderColor: selectedInstrument?.name === inst.name ? inst.color + '50' : undefined,
                  background: selectedInstrument?.name === inst.name ? inst.color + '10' : undefined,
                }}
              >
                <div style={{ fontSize: '36px', marginBottom: '12px', display: 'block' }}>{inst.emoji}</div>
                <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '17px', fontWeight: '600', color: selectedInstrument?.name === inst.name ? inst.color : '#f0ede8', marginBottom: '6px' }}>{inst.name}</div>
                <div style={{ fontSize: '12px', color: '#55546a', fontFamily: 'DM Mono, monospace', marginBottom: '8px' }}>{inst.type}</div>
                <div style={{ fontSize: '13px', color: '#9896a8', lineHeight: '1.5' }}>{inst.description.split('.')[0]}.</div>
              </button>
            ))}
          </div>

          {/* Detail panel */}
          {selectedInstrument && (
            <div style={{
              background: selectedInstrument.color + '08',
              border: `1px solid ${selectedInstrument.color}25`,
              borderRadius: '16px', padding: '32px',
              animation: 'fadeUp 0.3s ease forwards',
              alignSelf: 'start',
              position: 'sticky', top: '100px',
            }}>
              <button onClick={() => setSelectedInstrument(null)} style={{
                float: 'right', background: 'none', border: 'none', color: '#55546a', cursor: 'pointer', fontSize: '18px',
              }}>✕</button>
              <div style={{ fontSize: '52px', marginBottom: '16px' }}>{selectedInstrument.emoji}</div>
              <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '24px', fontWeight: '700', color: '#f0ede8', marginBottom: '4px' }}>{selectedInstrument.name}</h2>
              <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '12px', color: selectedInstrument.color, marginBottom: '20px', letterSpacing: '0.1em' }}>{selectedInstrument.type.toUpperCase()}</div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px' }}>
                  <div style={{ fontSize: '11px', color: '#55546a', fontFamily: 'DM Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>Origin</div>
                  <div style={{ fontSize: '14px', color: '#f0ede8' }}>{selectedInstrument.origin}</div>
                </div>
                {selectedInstrument.range && (
                  <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px' }}>
                    <div style={{ fontSize: '11px', color: '#55546a', fontFamily: 'DM Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>Range</div>
                    <div style={{ fontSize: '14px', color: '#f0ede8', fontFamily: 'DM Mono, monospace' }}>{selectedInstrument.range}</div>
                  </div>
                )}
                <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px' }}>
                  <div style={{ fontSize: '11px', color: '#55546a', fontFamily: 'DM Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>About</div>
                  <div style={{ fontSize: '14px', color: '#9896a8', lineHeight: '1.7' }}>{selectedInstrument.description}</div>
                </div>
                <div style={{ padding: '16px', background: selectedInstrument.color + '12', border: `1px solid ${selectedInstrument.color}25`, borderRadius: '10px' }}>
                  <div style={{ fontSize: '11px', color: selectedInstrument.color, fontFamily: 'DM Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>💡 Fun Fact</div>
                  <div style={{ fontSize: '14px', color: '#f0ede8', lineHeight: '1.6', fontStyle: 'italic' }}>{selectedInstrument.funFact}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
