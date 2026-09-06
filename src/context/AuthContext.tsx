import type { Session, User } from '@supabase/supabase-js'
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { supabase } from '../lib/supabaseClient'

interface AuthContextValue {
  session: Session | null
  user: User | null
  loading: boolean
  signUp: (email: string, password: string, displayName: string) => Promise<{ error: string | null }>
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
  updatePassword: (currentPassword: string, newPassword: string) => Promise<{ error: string | null }>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
    })

    return () => subscription.subscription.unsubscribe()
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      loading,
      async signUp(email, password, displayName) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { display_name: displayName } },
        })
        return { error: error?.message ?? null }
      },
      async signIn(email, password) {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        return { error: error?.message ?? null }
      },
      async signOut() {
        await supabase.auth.signOut()
      },
      async updatePassword(currentPassword, newPassword) {
        if (!session?.user.email) return { error: 'Not signed in' }

        // supabase.auth.updateUser() alone doesn't check the *current*
        // password — anyone with an already-open session could otherwise
        // change it without knowing the original. Re-authenticate first to
        // confirm the current password is actually correct.
        //
        // Trade-offs of using signInWithPassword for that check: it shares
        // Supabase's login rate limit (a few mistyped attempts here can also
        // block ordinary sign-in for a bit), and it swaps in a brand-new
        // session via onAuthStateChange, which — if another tab is mid
        // token-refresh right at that moment — can lose that race and get
        // signed out. Restoring the original session below limits how long
        // the ad-hoc reauth session stays active, but doesn't eliminate
        // either risk; this is a client-only check, not something Supabase
        // enforces server-side for updateUser.
        const originalSession = session

        const { error: reauthError } = await supabase.auth.signInWithPassword({
          email: session.user.email,
          password: currentPassword,
        })
        if (reauthError) {
          const wrongPassword = reauthError.message.toLowerCase().includes('invalid login credentials')
          // Only map the specific "wrong credentials" case to a friendly
          // message — pass through anything else (rate limit, network,
          // unconfirmed email) so the user isn't told they mistyped a
          // password they actually got right.
          return { error: wrongPassword ? 'Current password is incorrect' : reauthError.message }
        }

        const { error } = await supabase.auth.updateUser({ password: newPassword })

        try {
          await supabase.auth.setSession({
            access_token: originalSession.access_token,
            refresh_token: originalSession.refresh_token,
          })
        } catch {
          // Best-effort restore — if it fails, the reauth session (still
          // valid, just a different token pair) simply stays active instead.
        }

        return { error: error?.message ?? null }
      },
    }),
    [session, loading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
