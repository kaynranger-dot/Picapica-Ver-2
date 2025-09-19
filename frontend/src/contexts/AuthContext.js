import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase, auth, db } from '../lib/supabase'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState(null)

  useEffect(() => {
    const getInitialSession = async () => {
      const { data, error } = await auth.getSession()
      if (error) console.error('Error getting session:', error)

      setSession(data.session)
      setUser(data.session?.user ?? null)

      if (data.session?.user) {
        await fetchUserProfile(data.session.user.id)
      }

      setLoading(false)
    }

    getInitialSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)

      if (session?.user) {
        await fetchUserProfile(session.user.id)
      } else {
        setUserProfile(null)
      }

      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  // 🔹 Fetch user profile from `user_profiles` table
  const fetchUserProfile = async (userId) => {
    const { data, error } = await db
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('Error fetching user profile:', error.message)
      return
    }
    setUserProfile(data)
  }

  // 🔹 Signup (Supabase v2)
  const signUp = async (email, password, userData = {}) => {
    try {
      setLoading(true)
      const { data, error } = await auth.signUp({
        email,
        password,
        options: {
          data: userData, // saves to user_metadata
        },
      })

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    } finally {
      setLoading(false)
    }
  }

  // 🔹 Sign in
  const signIn = async (email, password) => {
    try {
      setLoading(true)
      const { data, error } = await auth.signInWithPassword({ email, password })

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    } finally {
      setLoading(false)
    }
  }

  // 🔹 Sign out
  const signOut = async () => {
    try {
      setLoading(true)
      const { error } = await auth.signOut()
      if (error) throw error

      setUser(null)
      setUserProfile(null)
      setSession(null)

      return { error: null }
    } catch (error) {
      return { error }
    } finally {
      setLoading(false)
    }
  }

  // 🔹 Update profile
  const updateProfile = async (updates) => {
    try {
      if (!user) throw new Error('No user logged in')

      const { data, error } = await db
        .from('user_profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single()

      if (error) throw error

      setUserProfile(data)
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  // 🔹 Check if user is admin
  const isAdmin = () => {
    return userProfile?.role === 'admin'
  }

  const value = {
    user,
    userProfile,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
    isAdmin,
    fetchUserProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
