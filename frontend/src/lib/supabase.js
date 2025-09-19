// src/lib/supabase.js
import { createClient } from '@supabase/supabase-js'

// Get env vars from Vite
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Create client
export const supabase = createClient(supabaseUrl, supabaseKey)

// Aliases (so your code still works with db/auth)
export const db = supabase
export const auth = supabase.auth
