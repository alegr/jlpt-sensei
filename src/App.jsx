import { useState, useEffect } from 'react'
import { supabase, signOut, onAuthChange } from './lib/supabase.js'
import { useProgress } from './lib/useProgress.js'
import AuthScreen from './components/AuthScreen.jsx'
import Sidebar from './components/Sidebar.jsx'
import Dashboard from './components/Dashboard.jsx'
import StudyScreen from './components/StudyScreen.jsx'
import BrowseScreen from './components/BrowseScreen.jsx'
import ProgressScreen from './components/ProgressScreen.jsx'

export default function App() {
  const [user, setUser] = useState(undefined) // undefined = loading
  const [skipped, setSkipped] = useState(false)
  const [level, setLevel] = useState('N5')
  const [screen, setScreen] = useState('dashboard')
  const [currentCat, setCurrentCat] = useState(null)
  const [browseFrom, setBrowseFrom] = useState('study')

  const { record, getItem, getStatus, getCatPct, reset, syncing } = useProgress(user)

  // Auth state
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })
    return onAuthChange(setUser)
  }, [])

  // "Continue without account" button
  useEffect(() => {
    const handler = () => setSkipped(true)
    window.addEventListener('skip-auth', handler)
    return () => window.removeEventListener('skip-auth', handler)
  }, [])

  // Loading
  if (user === undefined) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text3)', fontSize: 14 }}>Loading…</div>
  }

  // Not signed in and hasn't skipped
  if (!user && !skipped) return <AuthScreen />

  function openCat(cat) { setCurrentCat(cat); setScreen('study') }
  function openBrowse(cat, from = 'study') { setCurrentCat(cat); setBrowseFrom(from); setScreen('browse') }
  function backFromBrowse() { setScreen(browseFrom === 'progress' ? 'progress' : 'study') }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar
        level={level} setLevel={setLevel}
        screen={screen} setScreen={setScreen}
        currentCat={currentCat} setCurrentCat={setCurrentCat}
        getCatPct={getCatPct}
        user={user} onSignOut={signOut} syncing={syncing}
      />
      <main style={{ flex: 1, overflowY: 'auto', padding: 32, maxWidth: 960 }}>
        {screen === 'dashboard' && (
          <Dashboard level={level} getCatPct={getCatPct} getStatus={getStatus} setScreen={setScreen} setCurrentCat={setCurrentCat} />
        )}
        {screen === 'study' && currentCat && (
          <StudyScreen
            level={level} cat={currentCat}
            getStatus={getStatus} record={record}
            onBack={() => { setCurrentCat(null); setScreen('dashboard') }}
            onBrowse={() => openBrowse(currentCat, 'study')}
          />
        )}
        {screen === 'browse' && currentCat && (
          <BrowseScreen level={level} cat={currentCat} getStatus={getStatus} onBack={backFromBrowse} />
        )}
        {screen === 'progress' && (
          <ProgressScreen
            level={level} getStatus={getStatus} getCatPct={getCatPct} reset={reset}
            setScreen={setScreen} setCurrentCat={setCurrentCat}
          />
        )}
      </main>
    </div>
  )
}
