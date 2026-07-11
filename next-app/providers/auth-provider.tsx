"use client"

import { createContext, useContext, useEffect, useState, useRef } from "react"
import type { Session, User } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/client"
import type { UserProfile } from "@/types"

interface AuthContextType {
  user: User | null
  session: Session | null
  profile: UserProfile | null
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signUp: (
    email: string,
    password: string,
    name: string
  ) => Promise<{ error: string | null; emailConfirmationRequired: boolean }>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const supabaseRef = useRef<ReturnType<typeof createClient> | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const sb = createClient()
    supabaseRef.current = sb

    sb.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(sb, session.user.id)
      setIsLoading(false)
    })

    const {
      data: { subscription },
    } = sb.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(sb, session.user.id)
      else setProfile(null)
    })

    return () => subscription.unsubscribe()
  }, [])

  async function fetchProfile(sb: ReturnType<typeof createClient>, userId: string) {
    const { data } = await sb
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single()
    if (data) setProfile(data as UserProfile)
  }

  function getSb() {
    if (!supabaseRef.current) throw new Error("Supabase not initialized")
    return supabaseRef.current
  }

  async function signIn(email: string, password: string) {
    try {
      const { error } = await getSb().auth.signInWithPassword({
        email,
        password,
      })
      return { error: error?.message ?? null }
    } catch {
      return { error: "Network error. Please check your connection and try again." }
    }
  }

  async function signUp(email: string, password: string, name: string) {
    try {
      const { data, error } = await getSb().auth.signUp({
        email,
        password,
        options: { data: { name } },
      })
      if (error) return { error: error.message, emailConfirmationRequired: false }
      const emailConfirmationRequired = !data.session
      return { error: null, emailConfirmationRequired }
    } catch {
      return { error: "Network error. Please check your connection and try again.", emailConfirmationRequired: false }
    }
  }

  async function signOut() {
    await getSb().auth.signOut()
    setProfile(null)
    window.location.href = "/"
  }

  async function refreshProfile() {
    if (user) fetchProfile(getSb(), user.id)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        isLoading,
        signIn,
        signUp,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth must be used within AuthProvider")
  return context
}
