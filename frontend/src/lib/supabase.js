import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Auth helper functions
export const auth = {
  // Sign up new user
  signUp: async (email, password, userData = {}) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    })
    return { data, error }
  },

  // Sign in user
  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { data, error }
  },

  // Sign out user
  signOut: async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  // Get current user
  getCurrentUser: async () => {
    const { data: { user }, error } = await supabase.auth.getUser()
    return { user, error }
  },

  // Get current session
  getSession: async () => {
    const { data: { session }, error } = await supabase.auth.getSession()
    return { session, error }
  }
}

// Database helper functions
export const db = {
  // User profiles
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

  // Sessions
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

  // Generated images
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

  // Admin functions
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

// Create RPC function for incrementing download count
export const createIncrementFunction = async () => {
  const { data, error } = await supabase.rpc('create_increment_function')
  return { data, error }
}