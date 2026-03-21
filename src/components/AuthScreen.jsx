import { signInWithGoogle } from '../lib/supabase.js'

export default function AuthScreen() {
  const handleGoogle = async () => {
    const { error } = await signInWithGoogle()
    if (error) alert('Sign-in failed: ' + error.message)
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', padding: '40px 20px',
      background: 'var(--bg)',
    }}>
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>日</div>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--accent-glow)', letterSpacing: '0.05em' }}>
          JLPT Sensei
        </h1>
        <p style={{ color: 'var(--text3)', marginTop: 8, fontSize: 14 }}>
          Study smarter. Track your progress.
        </p>
      </div>

      <div style={{
        background: 'var(--card)', border: '1px solid var(--border)',
        borderRadius: 16, padding: '32px 40px', width: '100%', maxWidth: 360,
        textAlign: 'center',
      }}>
        <p style={{ color: 'var(--text2)', fontSize: 14, marginBottom: 24 }}>
          Sign in to save your progress across devices.
        </p>

        <button onClick={handleGoogle} style={{
          width: '100%', padding: '12px 20px', borderRadius: 'var(--rsm)',
          border: '1px solid var(--border2)', background: 'var(--bg3)',
          color: 'var(--text)', fontSize: 14, fontWeight: 500,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          transition: 'all 0.15s',
        }}
        onMouseOver={e => e.currentTarget.style.background = 'var(--bg4)'}
        onMouseOut={e => e.currentTarget.style.background = 'var(--bg3)'}
        >
          <svg width="18" height="18" viewBox="0 0 18 18">
            <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
            <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
            <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/>
            <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/>
          </svg>
          Continue with Google
        </button>

        <p style={{ marginTop: 20, fontSize: 12, color: 'var(--text3)' }}>
          You can also study without signing in — progress saves locally.
        </p>

        <button
          onClick={() => window.dispatchEvent(new CustomEvent('skip-auth'))}
          style={{
            marginTop: 8, background: 'none', border: 'none',
            color: 'var(--accent-glow)', fontSize: 13, textDecoration: 'underline',
          }}
        >
          Continue without account
        </button>
      </div>
    </div>
  )
}
