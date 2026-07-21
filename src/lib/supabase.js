import { createClient } from '@supabase/supabase-js'

// Configured entirely through Vite env vars so no secrets live in source.
// Copy .env.example to .env and fill these in to enable accounts + cloud sync.
const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabaseConfigured = Boolean(url && anonKey)

// Only a valid config produces a real client; otherwise the app runs in
// local-only mode (data stays in this browser via localStorage).
export const supabase = supabaseConfigured
  ? createClient(url, anonKey, {
      auth: { persistSession: true, autoRefreshToken: true },
    })
  : null
