import { useState, useEffect, useCallback } from 'react'
import { getCatData, CATEGORIES, SENTENCES } from '../data/index.js'

const MODES = ['flashcard', 'quiz', 'fill', 'sentences', 'conjugation']
const MODE_LABELS = { flashcard: 'Flashcards', quiz: 'Multiple choice', fill: 'Fill in blank', sentences: 'Sentences', conjugation: 'Conjugations' }

function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5) }

export default function StudyScreen({ level, cat, getStatus, record, onBack, onBrowse }) {
  const data = getCatData(level, cat)
  const info = CATEGORIES[cat]
  const [mode, setMode] = useState('flashcard')
  const [items, setItems] = useState([])
  const [idx, setIdx] = useState(0)
  const [sessCorrect, setSessCorrect] = useState(0)
  const [sessWrong, setSessWrong] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [quizState, setQuizState] = useState(null) // {answered, correct}
  const [fillValue, setFillValue] = useState('')
  const [fillResult, setFillResult] = useState(null)
  const [sentIdx, setSentIdx] = useState(0)
  const [sentShown, setSentShown] = useState(false)

  const isVerb = cat === 'verbs'
  const isGrammar = cat === 'grammar' || cat === 'particles'
  const isKata = cat === 'kata'

  const reset = useCallback(() => {
    setItems(shuffle(data.map((d, i) => ({ ...d, idx: i }))))
    setIdx(0); setSessCorrect(0); setSessWrong(0)
    setFlipped(false); setQuizState(null); setFillValue(''); setFillResult(null)
  }, [data])

  useEffect(() => { reset() }, [cat, mode])

  const item = items[idx]
  const done = idx >= items.length
  const status = item ? getStatus(level, cat, item.idx) : null

  // Quiz options
  const quizOpts = item ? (() => {
    const opts = [item]
    const pool = data.filter(d => d.ja !== item.ja)
    while (opts.length < 4 && pool.length) opts.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0])
    return shuffle(opts)
  })() : []

  function fcResult(correct) {
    if (correct !== null) { record(level, cat, item.idx, correct); correct ? setSessCorrect(c => c+1) : setSessWrong(c => c+1) }
    setFlipped(false); setIdx(i => i+1)
  }

  function handleQuizAnswer(opt) {
    if (quizState) return
    const correct = opt.ja === item.ja
    setQuizState({ answered: true, chosen: opt.ja, correct })
    record(level, cat, item.idx, correct)
    correct ? setSessCorrect(c => c+1) : setSessWrong(c => c+1)
  }

  function checkFill() {
    if (fillResult) return
    let answer = isVerb ? item.masu : item.ja
    const correct = fillValue.trim() === answer
    setFillResult({ correct, answer })
    record(level, cat, item.idx, correct)
    correct ? setSessCorrect(c => c+1) : setSessWrong(c => c+1)
  }

  const sentences = SENTENCES[cat] || SENTENCES.vocab

  // ── RENDER ──────────────────────────────────────────────

  if (done) return <Summary sessCorrect={sessCorrect} sessWrong={sessWrong} cat={cat} onRestart={reset} onBack={onBack} onBrowse={onBrowse} />

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        <Btn onClick={onBack}>← Back</Btn>
        <div>
          <strong style={{ fontSize: 16 }}>{info.name}</strong>
          <span style={{ fontSize: 12, color: 'var(--text3)', marginLeft: 8 }}>{data.length} items</span>
        </div>
        <Btn onClick={onBrowse} style={{ marginLeft: 'auto', fontSize: 12 }}>Browse list</Btn>
      </div>

      {/* Mode tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 24, flexWrap: 'wrap' }}>
        {MODES.filter(m => m !== 'conjugation' || isVerb).map(m => (
          <button key={m} onClick={() => setMode(m)} style={{
            padding: '7px 16px', borderRadius: 20, fontSize: 13,
            background: mode === m ? 'var(--accent2)' : 'transparent',
            border: `1px solid ${mode === m ? 'var(--accent)' : 'var(--border)'}`,
            color: mode === m ? '#fff' : 'var(--text2)', transition: 'all 0.15s',
          }}>
            {MODE_LABELS[m]}
          </button>
        ))}
      </div>

      {/* Mode content */}
      {mode === 'flashcard' && item && (
        <FlashcardMode item={item} status={status} total={items.length} idx={idx}
          flipped={flipped} setFlipped={setFlipped} onResult={fcResult}
          isVerb={isVerb} isGrammar={isGrammar} isKata={isKata} />
      )}
      {mode === 'quiz' && item && (
        <QuizMode item={item} opts={quizOpts} total={items.length} idx={idx}
          state={quizState} onAnswer={handleQuizAnswer}
          onNext={() => { setQuizState(null); setIdx(i => i+1) }}
          isVerb={isVerb} isGrammar={isGrammar} isKata={isKata} />
      )}
      {mode === 'fill' && item && (
        <FillMode item={item} total={items.length} idx={idx}
          value={fillValue} setValue={setFillValue} result={fillResult}
          onCheck={checkFill} onNext={() => { setFillValue(''); setFillResult(null); setIdx(i => i+1) }}
          isVerb={isVerb} isGrammar={isGrammar} isKata={isKata} />
      )}
      {mode === 'sentences' && (
        <SentencesMode sentences={sentences} sentIdx={sentIdx} shown={sentShown}
          setShown={setSentShown} onNext={() => { setSentIdx(i => (i+1) % sentences.length); setSentShown(false) }} />
      )}
      {mode === 'conjugation' && item && (
        <ConjMode item={item} total={items.length} idx={idx} onNext={() => setIdx(i => i+1)} />
      )}
    </div>
  )
}

// ── SUB-COMPONENTS ──────────────────────────────────────

function FlashcardMode({ item, status, total, idx, flipped, setFlipped, onResult, isVerb, isGrammar, isKata }) {
  let front, back
  if (isKata) {
    front = <><small style={{ color: 'var(--text3)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Katakana</small><div style={{ fontSize: 48, fontWeight: 300, margin: '8px 0' }}>{item.ja}</div><div style={{ color: 'var(--text3)' }}>{item.rom}</div></>
  } else if (isGrammar) {
    front = <><small style={{ color: 'var(--text3)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Pattern</small><div style={{ fontSize: 28, margin: '8px 0' }}>{item.ja}</div><div style={{ color: 'var(--text3)' }}>{item.rom}</div></>
  } else {
    front = <><small style={{ color: 'var(--text3)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{isVerb ? 'Dictionary form' : 'Japanese'}</small><div style={{ fontSize: 48, fontWeight: 300, margin: '8px 0' }}>{item.ja}</div><div style={{ color: 'var(--text3)' }}>{item.kana}</div><div style={{ color: 'var(--text3)', fontSize: 13 }}>{item.rom}</div></>
  }

  back = <><div style={{ fontSize: 22, fontWeight: 500, marginBottom: 8 }}>{item.en}</div>{isVerb && <div style={{ fontSize: 13, color: 'var(--text2)', marginTop: 8 }}>{item.masu} · {item.nai} · {item.ta}</div>}{isGrammar && item.note && <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 10, maxWidth: 300, lineHeight: 1.5 }}>{item.note}</div>}</>

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 14 }}>
        <span style={{ fontSize: 12, color: 'var(--text3)' }}>{idx+1} / {total}</span>
        <span className={`badge badge-${status}`}>{status}</span>
      </div>
      <div onClick={() => setFlipped(f => !f)} style={{
        width: '100%', maxWidth: 520, minHeight: 240,
        background: 'var(--card)', border: `1px solid ${flipped ? 'var(--accent)' : 'var(--border)'}`,
        borderRadius: 16, cursor: 'pointer', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', padding: 32, textAlign: 'center',
        transition: 'border-color 0.2s',
      }}>
        {flipped ? back : front}
      </div>
      {!flipped
        ? <p style={{ fontSize: 12, color: 'var(--text3)', marginTop: 14 }}>Tap card to reveal</p>
        : <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
            <ResultBtn onClick={() => onResult(false)} color="var(--coral)" bg="rgba(216,90,48,0.12)">✗ Wrong</ResultBtn>
            <ResultBtn onClick={() => onResult(null)} color="var(--text3)" bg="transparent">Skip</ResultBtn>
            <ResultBtn onClick={() => onResult(true)} color="var(--teal)" bg="rgba(29,158,117,0.12)">✓ Correct</ResultBtn>
          </div>
      }
    </div>
  )
}

function QuizMode({ item, opts, total, idx, state, onAnswer, onNext, isVerb, isGrammar, isKata }) {
  let display
  if (isKata) display = <><div style={{ fontSize: 52, fontWeight: 300, lineHeight: 1.2 }}>{item.ja}</div><div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 8 }}>{item.rom}</div></>
  else if (isGrammar) display = <><div style={{ fontSize: 28, lineHeight: 1.2 }}>{item.ja}</div><div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 8 }}>{item.rom}</div></>
  else display = <><div style={{ fontSize: 52, fontWeight: 300, lineHeight: 1.2 }}>{item.ja}</div><div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 8 }}>{item.kana} · {item.rom}</div></>

  return (
    <div style={{ maxWidth: 560 }}>
      <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 12 }}>{idx+1} / {total}</div>
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--r)', padding: 28, textAlign: 'center', marginBottom: 20 }}>
        {display}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {opts.map((opt, i) => {
          let bg = 'var(--card)', border = 'var(--border)', color = 'var(--text)'
          if (state) {
            if (opt.ja === item.ja) { bg = 'rgba(29,158,117,0.15)'; border = 'var(--teal)'; color = 'var(--teal-light)' }
            else if (opt.ja === state.chosen && !state.correct) { bg = 'rgba(216,90,48,0.12)'; border = 'var(--coral)'; color = 'var(--coral-light)' }
          }
          return (
            <button key={i} onClick={() => handleQuizAnswer(opt)} disabled={!!state} style={{
              background: bg, border: `1px solid ${border}`, borderRadius: 'var(--rsm)',
              padding: '14px 16px', fontSize: 14, color, textAlign: 'left', transition: 'all 0.15s',
            }}
            onMouseOver={e => { if (!state) e.currentTarget.style.background = 'var(--card2)' }}
            onMouseOut={e => { if (!state) e.currentTarget.style.background = bg }}
            >
              {opt.en}
            </button>
          )
        })}
      </div>
      {state && (
        <div style={{ textAlign: 'center', marginTop: 18 }}>
          <div style={{ color: state.correct ? 'var(--teal-light)' : 'var(--coral-light)', fontSize: 14, marginBottom: 12 }}>
            {state.correct ? '✓ Correct!' : '✗ Wrong'}
          </div>
          <PrimaryBtn onClick={onNext}>Next →</PrimaryBtn>
        </div>
      )}
    </div>
  )
  function handleQuizAnswer(opt) {
    if (state) return
    const correct = opt.ja === item.ja
    onAnswer(opt)
  }
}

function FillMode({ item, total, idx, value, setValue, result, onCheck, onNext, isVerb, isGrammar, isKata }) {
  let question, hint
  if (isVerb) { question = `${item.en} → ます form`; hint = `Dictionary: ${item.ja} ${item.kana}` }
  else if (isGrammar || isKata) { question = item.en; hint = `Romaji: ${item.rom}` }
  else { question = `${item.en} → Japanese`; hint = `Reading: ${item.kana || item.rom}` }

  return (
    <div style={{ maxWidth: 540 }}>
      <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 12 }}>{idx+1} / {total}</div>
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--r)', padding: '24px 28px', marginBottom: 10, fontSize: 18 }}>
        {question}
      </div>
      <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 14 }}>{hint}</div>
      <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
        <input
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !result) onCheck() }}
          disabled={!!result}
          placeholder="Type in Japanese…"
          autoComplete="off" autoCorrect="off" spellCheck="false"
          style={{
            flex: 1, background: 'var(--card)', padding: '10px 16px', fontSize: 16, color: 'var(--text)',
            border: `1px solid ${result ? (result.correct ? 'var(--teal)' : 'var(--coral)') : 'var(--border)'}`,
            borderRadius: 'var(--rsm)', outline: 'none',
          }}
        />
        {!result && <PrimaryBtn onClick={onCheck}>Check</PrimaryBtn>}
      </div>
      {result && (
        <>
          <div style={{ fontSize: 14, marginBottom: 12, color: result.correct ? 'var(--teal-light)' : 'var(--coral-light)' }}>
            {result.correct ? '✓ Correct!' : `✗ Answer: ${result.answer}`}
          </div>
          <PrimaryBtn onClick={onNext}>Next →</PrimaryBtn>
        </>
      )}
    </div>
  )
}

function SentencesMode({ sentences, sentIdx, shown, setShown, onNext }) {
  const s = sentences[sentIdx % sentences.length]
  return (
    <div>
      <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 16 }}>Sentence {(sentIdx % sentences.length)+1} / {sentences.length}</div>
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--r)', padding: '24px 28px', marginBottom: 16 }}>
        <div style={{ fontSize: 22, marginBottom: 8, lineHeight: 1.7 }}>{s.ja}</div>
        <div style={{ fontSize: 14, color: 'var(--text3)', marginBottom: 6 }}>{s.reading}</div>
        {shown && <div style={{ fontSize: 14, color: 'var(--text2)' }}>{s.en}</div>}
        <button onClick={() => setShown(v => !v)} style={{
          marginTop: 10, padding: '8px 20px', background: 'transparent',
          border: '1px solid var(--border)', borderRadius: 'var(--rsm)',
          color: 'var(--text2)', fontSize: 13,
        }}>
          {shown ? 'Hide translation' : 'Show translation'}
        </button>
      </div>
      <PrimaryBtn onClick={onNext}>Next →</PrimaryBtn>
    </div>
  )
}

function ConjMode({ item, total, idx, onNext }) {
  const TYPE_COLOR = { U: '#ef9f27', RU: '#7f77dd', IRR: '#d85a30', SURU: '#1d9e75' }
  return (
    <div style={{ maxWidth: 520 }}>
      <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 16 }}>{idx+1} / {total}</div>
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--r)', padding: '24px 28px', marginBottom: 16 }}>
        <div style={{ fontSize: 12, color: 'var(--text3)' }}>Dictionary form</div>
        <div style={{ fontSize: 36, margin: '4px 0' }}>{item.ja}</div>
        <div style={{ fontSize: 14, color: 'var(--text3)' }}>{item.kana} · {item.rom}</div>
        <div style={{ fontSize: 14, color: 'var(--accent-glow)', marginTop: 6 }}>{item.en}</div>
        <span style={{
          display: 'inline-block', marginTop: 8, padding: '2px 10px', borderRadius: 12,
          fontSize: 11, fontWeight: 600,
          background: TYPE_COLOR[item.type] + '22',
          color: TYPE_COLOR[item.type],
          border: `1px solid ${TYPE_COLOR[item.type]}44`,
        }}>{item.type}</span>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr>{['Form', 'Japanese'].map(h => <th key={h} style={{ textAlign: 'left', padding: '8px 12px', color: 'var(--text3)', borderBottom: '1px solid var(--border)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 500 }}>{h}</th>)}</tr>
        </thead>
        <tbody>
          {[['ます (polite)', item.masu], ['ない (negative)', item.nai], ['た (past)', item.ta], ['て (te-form)', item.te]].map(([form, val]) => (
            <tr key={form}><td style={{ padding: '10px 12px', borderBottom: '1px solid var(--border)', color: 'var(--text3)', fontSize: 12 }}>{form}</td><td style={{ padding: '10px 12px', borderBottom: '1px solid var(--border)', fontSize: 16 }}>{val}</td></tr>
          ))}
        </tbody>
      </table>
      <div style={{ marginTop: 20 }}><PrimaryBtn onClick={onNext}>Next →</PrimaryBtn></div>
    </div>
  )
}

function Summary({ sessCorrect, sessWrong, cat, onRestart, onBack, onBrowse }) {
  const total = sessCorrect + sessWrong
  const pct = total ? Math.round(sessCorrect / total * 100) : 0
  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--r)', padding: 28, textAlign: 'center', maxWidth: 400, margin: '40px auto' }}>
      <h3 style={{ fontSize: 20, marginBottom: 8 }}>Session complete!</h3>
      <p style={{ color: 'var(--text2)', marginBottom: 20 }}>Great work on {CATEGORIES[cat]?.name}.</p>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 32, marginBottom: 24 }}>
        {[['Correct', sessCorrect, 'var(--teal-light)'], ['Wrong', sessWrong, 'var(--coral-light)'], ['Score', pct + '%', 'var(--accent-glow)']].map(([l, v, c]) => (
          <div key={l}><div style={{ fontSize: 32, fontWeight: 600, color: c }}>{v}</div><div style={{ fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.07em', marginTop: 2 }}>{l}</div></div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
        <PrimaryBtn onClick={onRestart}>Study again</PrimaryBtn>
        <Btn onClick={onBrowse}>Browse list</Btn>
        <Btn onClick={onBack}>Dashboard</Btn>
      </div>
    </div>
  )
}

// ── Shared UI ─────────────────────────────────────────────

function PrimaryBtn({ onClick, children }) {
  return (
    <button onClick={onClick} style={{
      padding: '10px 24px', background: 'var(--accent2)', border: '1px solid var(--accent)',
      borderRadius: 'var(--rsm)', color: '#fff', fontSize: 14, fontWeight: 500,
    }}>{children}</button>
  )
}

function Btn({ onClick, children, style }) {
  return (
    <button onClick={onClick} style={{
      background: 'var(--card)', border: '1px solid var(--border)',
      borderRadius: 'var(--rsm)', padding: '8px 14px',
      color: 'var(--text2)', fontSize: 13, ...style,
    }}>{children}</button>
  )
}

function ResultBtn({ onClick, color, bg, children }) {
  return (
    <button onClick={onClick} style={{
      padding: '10px 28px', borderRadius: 'var(--rsm)',
      border: `1px solid ${color}`, background: bg, color, fontSize: 14, fontWeight: 500,
    }}>{children}</button>
  )
}
