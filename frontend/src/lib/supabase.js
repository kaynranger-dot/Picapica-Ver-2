import { createClient } from '@supabase/supabase-js'

// ✅ Use Vite env variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Auth helper functions
export const auth = {
  signUp: async (email, password, userData = {}) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: userData }
    })
    return { data, error }
  },

  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { data, error }
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  getCurrentUser: async () => {
    const { data: { user }, error } = await supabase.auth.getUser()
    return { user, error }
  },

  getSession: async () => {
    const { data: { session }, error } = await supabase.auth.getSession()
    return { session, error }
  }
}

// Database helper functions
export const db = {
  getUserProfile: async (userId) => {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single()
    return { data, error }
  },

  updateUserProfile: async (userId, updates) => {
    const { data, error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single()
    return { data, error }
  },

  createSession: async (sessionData) => {
    const { data, error } = await supabase
      .from('sessions')
      .insert(sessionData)
      .select()
      .single()
    return { data, error }
  },

  getUserSessions: async (userId) => {
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    return { data, error }
  },

  saveGeneratedImage: async (imageData) => {
    const { data, error } = await supabase
      .from('generated_images')
      .insert(imageData)
      .select()
      .single()
    return { data, error }
  },

  getUserImages: async (userId) => {
    const { data, error } = await supabase
      .from('generated_images')
      .select(`
        *,
        sessions (
          layout,
          filter_applied,
          created_at
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    return { data, error }
  },

  updateImageDownloadCount: async (imageId) => {
    const { data, error } = await supabase
      .rpc('increment_download_count', { image_id: imageId })
    return { data, error }
  },

  getAllUsers: async () => {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false })
    return { data, error }
  },

  getAllImages: async () => {
    const { data, error } = await supabase
      .from('generated_images')
      .select(`
        *,
        user_profiles (
          email,
          full_name
        ),
        sessions (
          layout,
          filter_applied
        )
      `)
      .order('created_at', { ascending: false })
    return { data, error }
  },

  getAllSessions: async () => {
    const { data, error } = await supabase
      .from('sessions')
      .select(`
        *,
        user_profiles (
          email,
          full_name
        )
      `)
      .order('created_at', { ascending: false })
    return { data, error }
  }
}

export const createIncrementFunction = async () => {
  const { data, error } = await supabase.rpc('create_increment_function')
  return { data, error }
}
