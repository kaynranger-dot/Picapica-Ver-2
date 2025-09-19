// frontend/src/lib/supabase.js
import { createClient } from '@supabase/supabase-js'

// Use Vite env vars if available, otherwise fallback
const supabaseUrl =
  import.meta.env?.VITE_SUPABASE_URL ||
  "https://thwjfnfqdqkpvsdmggpb.supabase.co"

const supabaseAnonKey =
  import.meta.env?.VITE_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRod2pmbmZxZHFrcHZzZG1nZ3BiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyNzk4MjgsImV4cCI6MjA3Mzg1NTgyOH0.nhCSoKHrsqugXoudG7_msyTt0Dnx2_mdgLTQLq8GFwI"

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables")
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// --- Auth helpers ---
export const auth = {
  signUp: async (email, password, userData = {}) => {
    return await supabase.auth.signUp({
      email,
      password,
      options: { data: userData },
    })
  },

  signIn: async (email, password) => {
    return await supabase.auth.signInWithPassword({ email, password })
  },

  signOut: async () => {
    return await supabase.auth.signOut()
  },

  getCurrentUser: async () => {
    return await supabase.auth.getUser()
  },

  getSession: async () => {
    return await supabase.auth.getSession()
  },
}

// --- Database helpers ---
export const db = {
  getUserProfile: async (userId) =>
    await supabase.from("user_profiles").select("*").eq("user_id", userId).single(),

  updateUserProfile: async (userId, updates) =>
    await supabase.from("user_profiles").update(updates).eq("user_id", userId).select().single(),

  createSession: async (sessionData) =>
    await supabase.from("sessions").insert(sessionData).select().single(),

  getUserSessions: async (userId) =>
    await supabase.from("sessions").select("*").eq("user_id", userId).order("created_at", { ascending: false }),

  saveGeneratedImage: async (imageData) =>
    await supabase.from("generated_images").insert(imageData).select().single(),

  getUserImages: async (userId) =>
    await supabase
      .from("generated_images")
      .select(
        `*, sessions (layout, filter_applied, created_at)`
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false }),

  updateImageDownloadCount: async (imageId) =>
    await supabase.rpc("increment_download_count", { image_id: imageId }),

  getAllUsers: async () =>
    await supabase.from("user_profiles").select("*").order("created_at", { ascending: false }),

  getAllImages: async () =>
    await supabase
      .from("generated_images")
      .select(
        `*, user_profiles (email, full_name), sessions (layout, filter_applied)`
      )
      .order("created_at", { ascending: false }),

  getAllSessions: async () =>
    await supabase
      .from("sessions")
      .select(
        `*, user_profiles (email, full_name)`
      )
      .order("created_at", { ascending: false }),
}

// --- RPC helper ---
export const createIncrementFunction = async () => {
  return await supabase.rpc("create_increment_function")
}
