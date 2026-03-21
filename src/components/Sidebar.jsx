import { useState, useEffect } from 'react'
import { CATEGORIES, getCatData } from '../data/index.js'

const NAV_COLORS = {
  vocab: '#1d9e75', verbs: '#ef9f27', iadj: '#d4537e', adj: '#d85a30',
  adv: '#7f77dd', kata: '#ba7517', grammar: '#993556', particles: '#0f6e56',
}

function useIsMobile() {
  const [mobile, setMobile] = useState(() => window.innerWidth < 768)
  useEffect(() => {
    const fn = () => setMobile(window.innerWidth < 768)
    window.addEventListener('resize', fn)
    return () => window.removeEventListener('resize', fn)
  }, [])
  return mobile
}

export default function Sidebar({ level, setLevel, screen, setScreen, currentCat, setCurrentCat, getCatPct, user, onSignOut, syncing }) {
  const isMobile = useIsMobile()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const catKeys = Object.keys(CATEGORIES)

  function openCat(cat) {
    setCurrentCat(cat); setScreen('study'); setDrawerOpen(false)
  }
  function navigate(s) {
    setCurrentCat(null); setScreen(s); setDrawerOpen(false)
  }

  if (isMobile) {
    return <MobileNav
      level={level} setLevel={setLevel} screen={screen} currentCat={currentCat}
      catKeys={catKeys} getCatPct={getCatPct} drawerOpen={drawerOpen}
      setDrawerOpen={setDrawerOpen} openCat={openCat} navigate={navigate}
      user={user} onSignOut={onSignOut} syncing={syncing}
    />
  }

  return (
    <nav style={{
      width: 220, minHeight: '100vh', background: 'var(--bg2)',
      borderRight: '1px solid var(--border)', display: 'flex',
      flexDirection: 'column', flexShrink: 0, position: 'sticky',
      top: 0, height: '100vh', overflowY: 'auto',
    }}>
      <div style={{ padding: '20px 20px 14px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent-glow)', letterSpacing: '0.03em' }}>JLPT Sensei</div>
        <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
          {['N5', 'N4'].map(l => (
            <button key={l} onClick={() => setLevel(l)} style={{
              padding: '3px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700, border: '1px solid', cursor: 'pointer',
              background: level === l ? (l === 'N5' ? 'rgba(29,158,117,0.2)' : 'rgba(127,119,221,0.2)') : 'transparent',
              borderColor: level === l ? (l === 'N5' ? 'rgba(29,158,117,0.4)' : 'rgba(127,119,221,0.4)') : 'var(--border)',
              color: level === l ? (l === 'N5' ? 'var(--teal-light)' : 'var(--accent-glow)') : 'var(--text3)',
            }}>{l}</button>
          ))}
        </div>
      </div>

      <SectionLabel>Overview</SectionLabel>
      <NavItem active={screen === 'dashboard' && !currentCat} onClick={() => navigate('dashboard')}>
        <Dot color="#afa9ec" /><span>Dashboard</span>
      </NavItem>

      <SectionLabel>Study</SectionLabel>
      {catKeys.map(cat => {
        const data = getCatData(level, cat)
        const pct = getCatPct(level, cat, data)
        return (
          <NavItem key={cat} active={screen === 'study' && currentCat === cat} onClick={() => openCat(cat)}>
            <Dot color={NAV_COLORS[cat]} />
            <span style={{ flex: 1 }}>{CATEGORIES[cat].name}</span>
            <span style={{ fontSize: 10, color: 'var(--text3)' }}>{pct}%</span>
          </NavItem>
        )
      })}

      <SectionLabel>Review</SectionLabel>
      <NavItem active={screen === 'progress'} onClick={() => navigate('progress')}>
        <Dot color="#888780" /><span>Progress</span>
      </NavItem>

      <div style={{ marginTop: 'auto', padding: 16, borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 4 }}>
          {user ? (syncing ? '⟳ Syncing…' : `✓ ${user.email?.split('@')[0]}`) : 'Not signed in'}
        </div>
        <SmallBtn onClick={user ? onSignOut : () => window.location.reload()}>
          {user ? 'Sign out' : 'Sign in'}
        </SmallBtn>
      </div>
    </nav>
  )
}

// ── MOBILE NAV ─────────────────────────────────────────────

function MobileNav({ level, setLevel, screen, currentCat, catKeys, getCatPct, drawerOpen, setDrawerOpen, openCat, navigate, user, onSignOut, syncing }) {
  const activeTab = (screen === 'study' || screen === 'browse') ? 'study'
    : screen === 'progress' ? 'progress'
    : screen === 'account' ? 'account'
    : 'dashboard'

  const tabs = [
    { id: 'dashboard', label: 'Home',     icon: '⌂' },
    { id: 'study',     label: 'Study',    icon: '✎' },
    { id: 'progress',  label: 'Progress', icon: '◎' },
    { id: 'account',   label: 'Account',  icon: '◉' },
  ]

  function handleTab(id) {
    if (id === 'study') { setDrawerOpen(v => !v); return }
    setDrawerOpen(false)
    navigate(id)
  }

  return (
    <>
      {/* Backdrop */}
      {drawerOpen && (
        <div onClick={() => setDrawerOpen(false)} style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 40,
        }} />
      )}

      {/* Slide-up category drawer */}
      <div style={{
        position: 'fixed', left: 0, right: 0, bottom: 56, zIndex: 50,
        background: 'var(--bg2)', borderTop: '1px solid var(--border)',
        borderRadius: '16px 16px 0 0',
        transform: drawerOpen ? 'translateY(0)' : 'translateY(100%)',
        transition: 'transform 0.25s ease',
        maxHeight: '70vh', overflowY: 'auto',
      }}>
        {/* Drag handle */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 4px' }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--border2)' }} />
        </div>

        {/* Level switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 20px 14px', borderBottom: '1px solid var(--border)' }}>
          <span style={{ fontSize: 12, color: 'var(--text3)' }}>Level:</span>
          {['N5', 'N4'].map(l => (
            <button key={l} onClick={() => setLevel(l)} style={{
              padding: '4px 18px', borderRadius: 20, fontSize: 12, fontWeight: 700, border: '1px solid',
              background: level === l ? (l === 'N5' ? 'rgba(29,158,117,0.2)' : 'rgba(127,119,221,0.2)') : 'transparent',
              borderColor: level === l ? (l === 'N5' ? 'rgba(29,158,117,0.4)' : 'rgba(127,119,221,0.4)') : 'var(--border)',
              color: level === l ? (l === 'N5' ? 'var(--teal-light)' : 'var(--accent-glow)') : 'var(--text3)',
            }}>{l}</button>
          ))}
        </div>

        {/* Category rows */}
        {catKeys.map(cat => {
          const data = getCatData(level, cat)
          const pct = getCatPct(level, cat, data)
          const info = CATEGORIES[cat]
          return (
            <button key={cat} onClick={() => openCat(cat)} style={{
              display: 'flex', alignItems: 'center', gap: 14, width: '100%',
              padding: '14px 20px', background: 'transparent', border: 'none',
              borderBottom: '1px solid rgba(127,119,221,0.06)',
              color: 'var(--text)', textAlign: 'left',
            }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: NAV_COLORS[cat], flexShrink: 0 }} />
              <span style={{ flex: 1, fontSize: 15 }}>{info.name}</span>
              <span style={{ fontSize: 12, color: 'var(--text3)' }}>{pct}%</span>
              <span style={{ fontSize: 20, color: 'var(--text3)', lineHeight: 1 }}>›</span>
            </button>
          )
        })}
      </div>

      {/* Account overlay */}
      {screen === 'account' && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 55, background: 'var(--bg)',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', gap: 16, padding: 32,
        }}>
          <div style={{ fontSize: 14, color: 'var(--text2)' }}>
            {user ? `Signed in as ${user.email}` : 'Not signed in'}
          </div>
          {user && <div style={{ fontSize: 12, color: 'var(--text3)' }}>{syncing ? '⟳ Syncing…' : '✓ Progress synced'}</div>}
          <button onClick={user ? onSignOut : () => window.location.reload()} style={{
            padding: '11px 32px', background: 'var(--card)', border: '1px solid var(--border)',
            borderRadius: 'var(--rsm)', color: 'var(--text2)', fontSize: 14,
          }}>{user ? 'Sign out' : 'Sign in'}</button>
          <button onClick={() => navigate('dashboard')} style={{ background: 'none', border: 'none', color: 'var(--text3)', fontSize: 13 }}>← Back</button>
        </div>
      )}

      {/* Bottom tab bar */}
      <nav style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 60,
        height: 56, background: 'var(--bg2)', borderTop: '1px solid var(--border)',
        display: 'flex', alignItems: 'stretch',
      }}>
        {tabs.map(tab => {
          const isActive = tab.id === 'study' ? drawerOpen : activeTab === tab.id
          return (
            <button key={tab.id} onClick={() => handleTab(tab.id)} style={{
              flex: 1, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 2,
              background: 'transparent', border: 'none', fontFamily: 'inherit',
              color: isActive ? 'var(--accent-glow)' : 'var(--text3)',
              fontSize: 10, transition: 'color 0.15s',
            }}>
              <span style={{ fontSize: 20, lineHeight: 1 }}>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          )
        })}
      </nav>
    </>
  )
}

function SectionLabel({ children }) {
  return <div style={{ padding: '12px 12px 4px', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text3)' }}>{children}</div>
}

function NavItem({ active, onClick, children }) {
  return (
    <button onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '9px 14px', margin: '1px 8px', borderRadius: 'var(--rsm)',
      background: active ? 'rgba(127,119,221,0.15)' : 'transparent',
      border: `1px solid ${active ? 'var(--border)' : 'transparent'}`,
      color: active ? 'var(--accent-glow)' : 'var(--text2)',
      fontSize: 13.5, textAlign: 'left', transition: 'all 0.15s', width: 'calc(100% - 16px)',
    }}>
      {children}
    </button>
  )
}

function Dot({ color }) {
  return <div style={{ width: 7, height: 7, borderRadius: '50%', background: color, flexShrink: 0 }} />
}

function SmallBtn({ onClick, children }) {
  return (
    <button onClick={onClick} style={{
      background: 'var(--card)', border: '1px solid var(--border)',
      borderRadius: 'var(--rsm)', padding: '7px 14px',
      color: 'var(--text3)', fontSize: 11, width: '100%',
    }}>
      {children}
    </button>
  )
}
