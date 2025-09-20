// src/lib/supabase.js
import { createClient } from '@supabase/supabase-js'

// Get env vars from Create React App
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY

// Create client
export const supabase = createClient(supabaseUrl, supabaseKey)

// Aliases (so your code still works with db/auth)
export const db = supabase
export const auth = supabase.auth
