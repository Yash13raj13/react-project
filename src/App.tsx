import { useState, createContext, useContext } from 'react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import MusicTheory from './components/MusicTheory'
import Instruments from './components/Instruments'
import InteractiveKeyboard from './components/InteractiveKeyboard'
import EarTraining from './components/EarTraining'
import Metronome from './components/Metronome'
import ChordProgression from './components/ChordProgression'
import Footer from './components/Footer'

export type Page = 'home' | 'theory' | 'instruments' | 'playground' | 'ear-training' | 'metronome' | 'chord-progression'

interface ThemeContextType {
  theme: 'dark' | 'light'
  toggleTheme: () => void
}

export const ThemeContext = createContext<ThemeContextType>({ theme: 'dark', toggleTheme: () => {} })
export const useTheme = () => useContext(ThemeContext)

function App() {
  const [activePage, setActivePage] = useState<Page>('home')
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark')

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <div className={`app-root theme-${theme}`}>
        <Navbar activePage={activePage} setActivePage={setActivePage} />
        <main>
          {activePage === 'home' && <Hero setActivePage={setActivePage} />}
          {activePage === 'theory' && <MusicTheory />}
          {activePage === 'instruments' && <Instruments />}
          {activePage === 'playground' && <InteractiveKeyboard />}
          {activePage === 'ear-training' && <EarTraining />}
          {activePage === 'metronome' && <Metronome />}
          {activePage === 'chord-progression' && <ChordProgression />}
        </main>
        <Footer setActivePage={setActivePage} />
      </div>
    </ThemeContext.Provider>
  )
}

export default App
