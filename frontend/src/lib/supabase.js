// src/lib/supabase.js
import { createClient } from '@supabase/supabase-js'

// Get env vars from Create React App
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.warn('Missing Supabase environment variables. Using demo mode.')
}

// Create client
export const supabase = supabaseUrl && supabaseKey ? 
  createClient(supabaseUrl, supabaseKey) : 
  null

// Database operations
export const db = {
  // User operations
  getUserImages: async (userId) => {
    if (!supabase) return { data: [], error: null }
    return await supabase
      .from('generated_images')
      .select(`
        *,
        user_profiles!inner(full_name, email)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
  },

  getUserSessions: async (userId) => {
    if (!supabase) return { data: [], error: null }
    return await supabase
      .from('sessions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
  },

  // Admin operations
  getAllUsers: async () => {
    if (!supabase) return { data: [], error: null }
    return await supabase
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false })
  },

  getAllImages: async () => {
    if (!supabase) return { data: [], error: null }
    return await supabase
      .from('generated_images')
      .select(`
        *,
        user_profiles!inner(full_name, email)
      `)
      .order('created_at', { ascending: false })
  },

  getAllSessions: async () => {
    if (!supabase) return { data: [], error: null }
    return await supabase
      .from('sessions')
      .select(`
        *,
        user_profiles!inner(full_name, email)
      `)
      .order('created_at', { ascending: false })
  },

  // Session operations
  createSession: async (sessionData) => {
    if (!supabase) return { data: { session_id: 'demo-session' }, error: null }
    return await supabase
      .from('sessions')
      .insert([sessionData])
      .select()
      .single()
  },

  // Image operations
  saveGeneratedImage: async (imageData) => {
    if (!supabase) return { data: { id: 'demo-image' }, error: null }
    return await supabase
      .from('generated_images')
      .insert([imageData])
      .select()
      .single()
  },

  updateImageDownloadCount: async (imageId) => {
    if (!supabase) return { error: null }
    return await supabase
      .from('generated_images')
      .rpc('increment_download_count', { image_id: imageId })
      .eq('id', imageId)
  }
}

export const auth = supabase?.auth || {
  getSession: () => Promise.resolve({ data: { session: null }, error: null }),
  onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
  signUp: () => Promise.resolve({ data: null, error: { message: 'Demo mode' } }),
  signInWithPassword: () => Promise.resolve({ data: null, error: { message: 'Demo mode' } }),
  signOut: () => Promise.resolve({ error: null })
}
