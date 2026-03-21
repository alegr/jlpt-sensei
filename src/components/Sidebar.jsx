import { CATEGORIES, getCatData } from '../data/index.js'

const NAV_COLORS = {
  vocab: '#1d9e75', verbs: '#ef9f27', iadj: '#d4537e', adj: '#d85a30',
  adv: '#7f77dd', kata: '#ba7517', grammar: '#993556', particles: '#0f6e56',
}

export default function Sidebar({ level, setLevel, screen, setScreen, currentCat, setCurrentCat, getCatPct, user, onSignOut, syncing }) {
  const catKeys = Object.keys(CATEGORIES)

  function openCat(cat) {
    setCurrentCat(cat)
    setScreen('study')
  }

  return (
    <nav style={{
      width: 220, minHeight: '100vh', background: 'var(--bg2)',
      borderRight: '1px solid var(--border)', display: 'flex',
      flexDirection: 'column', flexShrink: 0, position: 'sticky',
      top: 0, height: '100vh', overflowY: 'auto',
    }}>
      {/* Logo */}
      <div style={{ padding: '20px 20px 14px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent-glow)', letterSpacing: '0.03em' }}>
          JLPT Sensei
        </div>
        <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
          {['N5', 'N4'].map(l => (
            <button key={l} onClick={() => setLevel(l)} style={{
              padding: '3px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700,
              border: '1px solid',
              background: level === l ? (l === 'N5' ? 'rgba(29,158,117,0.2)' : 'rgba(127,119,221,0.2)') : 'transparent',
              borderColor: level === l ? (l === 'N5' ? 'rgba(29,158,117,0.4)' : 'rgba(127,119,221,0.4)') : 'var(--border)',
              color: level === l ? (l === 'N5' ? 'var(--teal-light)' : 'var(--accent-glow)') : 'var(--text3)',
              cursor: 'pointer',
            }}>
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* Overview */}
      <SectionLabel>Overview</SectionLabel>
      <NavItem active={screen === 'dashboard' && !currentCat} onClick={() => { setCurrentCat(null); setScreen('dashboard') }}>
        <Dot color="#afa9ec" /><span>Dashboard</span>
      </NavItem>

      {/* Categories */}
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

      {/* Progress */}
      <SectionLabel>Review</SectionLabel>
      <NavItem active={screen === 'progress'} onClick={() => { setCurrentCat(null); setScreen('progress') }}>
        <Dot color="#888780" /><span>Progress</span>
      </NavItem>

      {/* Bottom */}
      <div style={{ marginTop: 'auto', padding: 16, borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {user ? (
          <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 4 }}>
            {syncing ? '⟳ Syncing…' : `✓ ${user.email?.split('@')[0]}`}
          </div>
        ) : (
          <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 4 }}>Not signed in</div>
        )}
        {user
          ? <SmallBtn onClick={onSignOut}>Sign out</SmallBtn>
          : <SmallBtn onClick={() => window.location.reload()}>Sign in</SmallBtn>
        }
      </div>
    </nav>
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
