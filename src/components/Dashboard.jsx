import { CATEGORIES, getCatData } from '../data/index.js'

export default function Dashboard({ level, getCatPct, getStatus, setScreen, setCurrentCat }) {
  const cats = Object.keys(CATEGORIES)
  const allData = cats.map(cat => ({ cat, data: getCatData(level, cat) }))

  let total = 0, mastered = 0, learning = 0, review = 0
  allData.forEach(({ cat, data }) => {
    total += data.length
    data.forEach((_, i) => {
      const s = getStatus(level, cat, i)
      if (s === 'mastered') mastered++
      else if (s === 'progress') learning++
      else if (s === 'review') review++
    })
  })
  const pct = total ? Math.round(mastered / total * 100) : 0

  function openCat(cat) { setCurrentCat(cat); setScreen('study') }

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 22, fontWeight: 600 }}>おはようございます！</h2>
        <p style={{ color: 'var(--text2)', fontSize: 14, marginTop: 4 }}>
          Studying {level} — pick a category below.
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 12, marginBottom: 28 }}>
        {[
          { label: 'Total items', value: total, color: 'var(--text)' },
          { label: 'Mastered', value: mastered, color: 'var(--teal-light)' },
          { label: 'In progress', value: learning, color: 'var(--amber-light)' },
          { label: 'Needs review', value: review, color: 'var(--coral-light)' },
          { label: 'Overall', value: pct + '%', color: 'var(--accent-glow)' },
        ].map(s => (
          <div key={s.label} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--r)', padding: 16 }}>
            <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text3)', marginBottom: 8 }}>{s.label}</div>
            <div style={{ fontSize: 26, fontWeight: 600, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Category cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14 }}>
        {allData.map(({ cat, data }) => {
          const info = CATEGORIES[cat]
          const pct = getCatPct(level, cat, data)
          return (
            <button key={cat} onClick={() => openCat(cat)} style={{
              background: 'var(--card)', border: '1px solid var(--border)',
              borderRadius: 'var(--r)', padding: 18, textAlign: 'left',
              transition: 'all 0.2s', cursor: 'pointer', color: 'var(--text)',
            }}
            onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--border2)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
            onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = '' }}
            >
              <div style={{ fontSize: 22, marginBottom: 10 }}>{info.icon}</div>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{info.name}</div>
              <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 12 }}>{data.length} items</div>
              <div style={{ background: 'var(--bg4)', borderRadius: 4, height: 5, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: pct + '%', background: info.color, borderRadius: 4, transition: 'width 0.4s' }} />
              </div>
              <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 5 }}>{pct}% mastered</div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
