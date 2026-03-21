import { useState, useEffect, useCallback, useRef } from 'react'
import { loadProgress, saveProgress, bulkSaveProgress, resetProgress } from '../lib/supabase.js'

const LS_KEY = 'jlpt_progress_v2'

function readLocal() {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || '{}') } catch { return {} }
}
function writeLocal(p) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(p)) } catch {}
}

export function useProgress(user) {
  const [progress, setProgress] = useState(readLocal)
  const [syncing, setSyncing] = useState(false)
  const pendingRef = useRef({}) // queued writes not yet sent to Supabase

  // On login: load from Supabase, merge with any offline progress
  useEffect(() => {
    if (!user) return
    setSyncing(true)
    loadProgress(user.id).then(remote => {
      setProgress(prev => {
        // Merge: take the higher correct+seen per item
        const merged = { ...remote }
        for (const [key, items] of Object.entries(prev)) {
          if (!merged[key]) merged[key] = {}
          for (const [idx, val] of Object.entries(items)) {
            const r = merged[key][idx] || { correct: 0, seen: 0 }
            merged[key][idx] = {
              correct: Math.max(val.correct, r.correct),
              seen: Math.max(val.seen, r.seen),
            }
          }
        }
        writeLocal(merged)
        // Push any local-only items up to Supabase
        bulkSaveProgress(user.id, merged)
        return merged
      })
    }).finally(() => setSyncing(false))
  }, [user?.id])

  const record = useCallback((level, cat, idx, wasCorrect) => {
    const key = `${level}_${cat}`
    setProgress(prev => {
      const cur = prev[key]?.[idx] || { correct: 0, seen: 0 }
      const updated = {
        ...prev,
        [key]: {
          ...prev[key],
          [idx]: {
            correct: cur.correct + (wasCorrect ? 1 : 0),
            seen: cur.seen + 1,
          }
        }
      }
      writeLocal(updated)
      // Sync to Supabase if logged in
      if (user) {
        const next = updated[key][idx]
        saveProgress(user.id, level, cat, idx, next.correct, next.seen)
      }
      return updated
    })
  }, [user])

  const getItem = useCallback((level, cat, idx) => {
    return progress[`${level}_${cat}`]?.[idx] || { correct: 0, seen: 0 }
  }, [progress])

  const getStatus = useCallback((level, cat, idx) => {
    const p = getItem(level, cat, idx)
    if (!p.seen) return 'pending'
    if (p.correct >= 2) return 'mastered'
    if (p.seen > 0 && p.correct / p.seen < 0.5) return 'review'
    return 'progress'
  }, [getItem])

  const getCatPct = useCallback((level, cat, data) => {
    if (!data.length) return 0
    const m = data.filter((_, i) => getStatus(level, cat, i) === 'mastered').length
    return Math.round(m / data.length * 100)
  }, [getStatus])

  const reset = useCallback(async (level) => {
    if (!window.confirm(`Reset all ${level} progress?`)) return
    setProgress(prev => {
      const next = { ...prev }
      Object.keys(next).forEach(k => { if (k.startsWith(level + '_')) delete next[k] })
      writeLocal(next)
      return next
    })
    if (user) await resetProgress(user.id, level)
  }, [user])

  return { progress, record, getItem, getStatus, getCatPct, reset, syncing }
}
