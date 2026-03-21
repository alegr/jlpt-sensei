import { useState } from 'react'
import { CATEGORIES, getCatData } from '../data/index.js'

const STATUS_LABEL = { mastered: 'Mastered', progress: 'In progress', review: 'Needs review', pending: 'Pending' }

export default function BrowseScreen({ level, cat, getStatus, onBack }) {
  const [filter, setFilter] = useState('all')
  const [q, setQ] = useState('')
  const data = getCatData(level, cat)
  const info = CATEGORIES[cat]
  const isVerb = cat === 'verbs'
  const isGrammar = cat === 'grammar' || cat === 'particles'
  const isKata = cat === 'kata'

  const rows = data
    .map((item, idx) => ({ item, idx, status: getStatus(level, cat, idx) }))
    .filter(({ item, status }) => {
      if (filter !== 'all' && status !== filter) return false
      if (!q) return true
      const lq = q.toLowerCase()
      return (item.ja || '').includes(q) || (item.kana || '').includes(q) || (item.rom || '').toLowerCase().includes(lq) || (item.en || '').toLowerCase().includes(lq)
    })

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <button onClick={onBack} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--rsm)', padding: '8px 14px', color: 'var(--text2)', fontSize: 13 }}>← Back</button>
        <strong style={{ fontSize: 16 }}>{info.name}</strong>
        <span style={{ fontSize: 12, color: 'var(--text3)' }}>{data.length} items</span>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          value={q} onChange={e => setQ(e.target.value)}
          placeholder="Search…"
          style={{ flex: 1, minWidth: 160, background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--rsm)', padding: '9px 14px', color: 'var(--text)', fontSize: 14, outline: 'none' }}
        />
        {['all', 'mastered', 'progress', 'review', 'pending'].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: '7px 13px', borderRadius: 20, fontSize: 12,
            border: `1px solid ${filter === f ? 'var(--border2)' : 'var(--border)'}`,
            background: filter === f ? 'var(--bg3)' : 'transparent',
            color: filter === f ? 'var(--text)' : 'var(--text2)',
          }}>
            {f === 'all' ? 'All' : STATUS_LABEL[f]}
          </button>
        ))}
      </div>

      <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 12 }}>{rows.length} of {data.length} items</div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr>
              <th style={TH}>Japanese</th>
              {!isKata && <th style={TH}>Reading</th>}
              <th style={TH}>Meaning</th>
              {(isVerb || isGrammar) && <th style={TH}>{isVerb ? 'Conjugations' : 'Notes'}</th>}
              <th style={TH}>Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ item, idx, status }) => (
              <tr key={idx} style={{ borderBottom: '1px solid rgba(127,119,221,0.07)' }}>
                <td style={{ padding: '11px 12px', fontSize: 18, fontWeight: 300 }}>
                  {item.ja}
                  {isVerb && <div style={{ fontSize: 11, color: 'var(--amber-light)', marginTop: 2 }}>{item.type}</div>}
                </td>
                {!isKata && (
                  <td style={{ padding: '11px 12px' }}>
                    <div style={{ color: 'var(--text3)', fontSize: 13 }}>{item.kana || '—'}</div>
                    <div style={{ color: 'var(--text3)', fontSize: 11 }}>{item.rom}</div>
                  </td>
                )}
                {isKata && <td style={{ padding: '11px 12px', color: 'var(--text3)', fontSize: 13 }}>{item.rom}</td>}
                <td style={{ padding: '11px 12px', color: 'var(--text2)' }}>{item.en}</td>
                {isVerb && (
                  <td style={{ padding: '11px 12px', fontSize: 12, color: 'var(--text3)' }}>
                    {item.masu}<br />{item.nai}<br />{item.ta}
                  </td>
                )}
                {isGrammar && (
                  <td style={{ padding: '11px 12px', fontSize: 12, color: 'var(--text3)', maxWidth: 260, lineHeight: 1.5 }}>
                    {item.note}
                  </td>
                )}
                <td style={{ padding: '11px 12px' }}>
                  <span className={`badge badge-${status}`}>{STATUS_LABEL[status]}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const TH = {
  textAlign: 'left', padding: '10px 12px',
  color: 'var(--text3)', borderBottom: '1px solid var(--border)',
  fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 500,
  position: 'sticky', top: 0, background: 'var(--bg2)',
}
