import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { useAuth } from './AuthContext'

const STORAGE_PREFIX = 'tour-diary-active-band'

interface ActiveBandContextValue {
  activeBandId: string | null
  setActiveBandId: (bandId: string) => void
}

const ActiveBandContext = createContext<ActiveBandContextValue | undefined>(undefined)

function readStored(userId: string): string | null {
  try {
    return localStorage.getItem(`${STORAGE_PREFIX}:${userId}`)
  } catch {
    return null
  }
}

/** Which of the user's (possibly several) bands is currently "active" —
 * scoping Dashboard/Settings/etc. Persisted per-user, since the same browser
 * profile could conceivably be used to sign in as different people. */
export function ActiveBandProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [activeBandId, setActiveBandIdState] = useState<string | null>(null)

  // Re-read from storage whenever the signed-in user changes (including on
  // first load, once we know who they are).
  useEffect(() => {
    setActiveBandIdState(user ? readStored(user.id) : null)
  }, [user])

  function setActiveBandId(bandId: string) {
    setActiveBandIdState(bandId)
    if (!user) return
    try {
      localStorage.setItem(`${STORAGE_PREFIX}:${user.id}`, bandId)
    } catch {
      // Ignore — the choice just won't persist across reloads in this browser.
    }
  }

  return <ActiveBandContext.Provider value={{ activeBandId, setActiveBandId }}>{children}</ActiveBandContext.Provider>
}

export function useActiveBand() {
  const ctx = useContext(ActiveBandContext)
  if (!ctx) throw new Error('useActiveBand must be used within an ActiveBandProvider')
  return ctx
}
