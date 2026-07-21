import { supabase, supabaseConfigured } from './supabase'

// AI features run through the Supabase Edge Function `ai`, which holds the
// Claude API key server-side. Without Supabase configured there is nowhere
// safe to keep that key, so the AI features report themselves unavailable.
export const aiAvailable = supabaseConfigured

async function invoke(op, payload) {
  if (!aiAvailable) throw new Error('AI is not configured')
  const { data, error } = await supabase.functions.invoke('ai', {
    body: { op, ...payload },
  })
  if (error) {
    // supabase-js reports a generic "non-2xx status code"; the function's
    // real error is in the response body (error.context is a Response).
    let detail = error.message || 'AI request failed'
    try {
      if (error.context && typeof error.context.json === 'function') {
        const body = await error.context.json()
        if (body?.error) detail = body.error
      }
    } catch {
      // couldn't parse a body — keep the generic message
    }
    console.error('AI function error:', detail)
    throw new Error(detail)
  }
  if (data?.error) throw new Error(data.error)
  return data
}

// "spent 5000 on lunch yesterday" -> { type, amount, category, description, date }
export function parseTransaction(text, categories) {
  return invoke('parse', { text, categories, today: new Date().toISOString().slice(0, 10) })
}

// Suggest the best-fit category for a free-text description.
export function suggestCategory(description, type, categories) {
  return invoke('categorize', { description, type, categories })
}

// Plain-English summary of spending for the selected period.
export function generateInsights(stats) {
  return invoke('insights', { stats })
}

// Budget suggestions + anomaly flags from category history.
export function budgetReview(categoryTotals, transactions) {
  return invoke('budget', { categoryTotals, transactions })
}
