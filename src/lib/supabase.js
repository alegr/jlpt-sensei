import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

// ── Auth helpers ──────────────────────────────────────────

export async function signInWithGoogle() {
  return supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin }
  })
}

export async function signOut() {
  return supabase.auth.signOut()
}

export function onAuthChange(callback) {
  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user ?? null)
  })
  return () => subscription.unsubscribe()
}

// ── Progress helpers ──────────────────────────────────────

/** Load all progress rows for the current user */
export async function loadProgress(userId) {
  const { data, error } = await supabase
    .from('progress')
    .select('level, category, item_index, correct, seen')
    .eq('user_id', userId)

  if (error) { console.error('loadProgress:', error); return {} }

  // Reshape into { N5_vocab: { 0: {correct,seen}, ... }, ... }
  const out = {}
  for (const row of data) {
    const key = `${row.level}_${row.category}`
    if (!out[key]) out[key] = {}
    out[key][row.item_index] = { correct: row.correct, seen: row.seen }
  }
  return out
}

/** Upsert a single progress record */
export async function saveProgress(userId, level, category, itemIndex, correct, seen) {
  const { error } = await supabase
    .from('progress')
    .upsert({
      user_id: userId,
      level,
      category,
      item_index: itemIndex,
      correct,
      seen,
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id,level,category,item_index' })

  if (error) console.error('saveProgress:', error)
}

/** Bulk upsert — used when syncing offline progress after login */
export async function bulkSaveProgress(userId, progressMap) {
  const rows = []
  for (const [key, items] of Object.entries(progressMap)) {
    const [level, ...catParts] = key.split('_')
    const category = catParts.join('_')
    for (const [idx, val] of Object.entries(items)) {
      rows.push({
        user_id: userId,
        level,
        category,
        item_index: parseInt(idx),
        correct: val.correct,
        seen: val.seen,
        updated_at: new Date().toISOString()
      })
    }
  }
  if (!rows.length) return
  const { error } = await supabase
    .from('progress')
    .upsert(rows, { onConflict: 'user_id,level,category,item_index' })
  if (error) console.error('bulkSaveProgress:', error)
}

/** Delete all progress for the current user + level */
export async function resetProgress(userId, level) {
  const { error } = await supabase
    .from('progress')
    .delete()
    .eq('user_id', userId)
    .eq('level', level)
  if (error) console.error('resetProgress:', error)
}
