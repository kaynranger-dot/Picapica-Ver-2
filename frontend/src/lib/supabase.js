// src/lib/supabase.js
import { createClient } from '@supabase/supabase-js'

// Get env vars from Create React App
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables')
}

// Create client
export const supabase = createClient(supabaseUrl, supabaseKey)

// Database operations
export const db = {
  // User operations
  getUserImages: async (userId) => {
    return await supabase
      .from('generated_images')
      .select(`
        *,
        user_profiles(full_name, email)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
  },

  getUserSessions: async (userId) => {
    return await supabase
      .from('sessions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
  },

  // Admin operations
  getAllUsers: async () => {
    return await supabase
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false })
  },

  getAllImages: async () => {
    return await supabase
      .from('generated_images')
      .select(`
        *,
        user_profiles(full_name, email)
      `)
      .order('created_at', { ascending: false })
  },

  getAllSessions: async () => {
    return await supabase
      .from('sessions')
      .select(`
        *,
        user_profiles(full_name, email)
      `)
      .order('created_at', { ascending: false })
  },

  // Session operations
  createSession: async (sessionData) => {
    return await supabase
      .from('sessions')
      .insert([sessionData])
      .select()
      .single()
  },

  // Image operations
  saveGeneratedImage: async (imageData) => {
    return await supabase
      .from('generated_images')
      .insert([imageData])
      .select()
      .single()
  },

  updateImageDownloadCount: async (imageId) => {
    return await supabase
      .from('generated_images')
      .update({ 
        download_count: supabase.raw('download_count + 1') 
      })
      .eq('id', imageId)
  }
}

export const auth = supabase.auth
