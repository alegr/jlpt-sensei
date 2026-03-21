import { CATEGORIES, getCatData } from '../data/index.js'

export default function ProgressScreen({ level, getStatus, getCatPct, reset, setScreen, setCurrentCat }) {
  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 22, fontWeight: 600 }}>Progress</h2>
        <p style={{ color: 'var(--text2)', fontSize: 14, marginTop: 4 }}>Mastery overview for {level}</p>
      </div>

      {Object.keys(CATEGORIES).map(cat => {
        const info = CATEGORIES[cat]
        const data = getCatData(level, cat)
        let mastered = 0, inprog = 0, review = 0, pending = 0
        data.forEach((_, i) => {
          const s = getStatus(level, cat, i)
          if (s === 'mastered') mastered++
          else if (s === 'progress') inprog++
          else if (s === 'review') review++
          else pending++
        })
        const pct = data.length ? Math.round(mastered / data.length * 100) : 0

        return (
          <div key={cat} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--rsm)', padding: '12px 16px', marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <span style={{ flex: 1, fontSize: 14 }}>{info.icon} {info.name}</span>
              <div style={{ flex: 2, background: 'var(--bg4)', borderRadius: 4, height: 5, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: pct + '%', background: info.color, borderRadius: 4 }} />
              </div>
              <span style={{ fontSize: 13, color: 'var(--text3)', minWidth: 40, textAlign: 'right' }}>{pct}%</span>
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8, alignItems: 'center' }}>
              <span className="badge badge-mastered">{mastered} mastered</span>
              <span className="badge badge-progress">{inprog} in progress</span>
              <span className="badge badge-review">{review} review</span>
              <span className="badge badge-pending">{pending} pending</span>
              <button onClick={() => { setCurrentCat(cat); setScreen('browse') }} style={{
                marginLeft: 'auto', background: 'transparent', border: '1px solid var(--border)',
                borderRadius: 'var(--rsm)', padding: '3px 10px', color: 'var(--text3)', fontSize: 11,
              }}>Browse →</button>
            </div>
          </div>
        )
      })}

      <div style={{ marginTop: 28 }}>
        <button onClick={() => reset(level)} style={{
          background: 'transparent', border: '1px solid var(--coral)', borderRadius: 'var(--rsm)',
          padding: '8px 20px', color: 'var(--coral-light)', fontSize: 13,
        }}>
          Reset {level} progress
        </button>
      </div>
    </div>
  )
}
