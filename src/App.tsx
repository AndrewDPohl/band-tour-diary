import type { ReactNode } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { useAuth } from './context/AuthContext'
import { useCurrentBand } from './hooks/useBand'
import { AddBandPage } from './routes/AddBandPage'
import { DashboardPage } from './routes/DashboardPage'
import { LoginPage } from './routes/LoginPage'
import { OnboardingPage } from './routes/OnboardingPage'
import { SettingsPage } from './routes/SettingsPage'
import { ShowDetailPage } from './routes/ShowDetailPage'
import { ShowFormPage } from './routes/ShowFormPage'
import { SignupPage } from './routes/SignupPage'
import { TourDetailPage } from './routes/TourDetailPage'

function FullScreenMessage({ children }: { children: ReactNode }) {
  return <div className="flex min-h-full items-center justify-center px-4 text-sm text-ink/50">{children}</div>
}

/** Requires a signed-in user; otherwise sends to /login. */
function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return <FullScreenMessage>Loading…</FullScreenMessage>
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

/** Requires the signed-in user to belong to a band; otherwise sends to /onboarding. */
function RequireBand({ children }: { children: ReactNode }) {
  const { data: bandData, isLoading } = useCurrentBand()
  if (isLoading) return <FullScreenMessage>Loading…</FullScreenMessage>
  if (!bandData) return <Navigate to="/onboarding" replace />
  return <Layout>{children}</Layout>
}

/** Sends already-authenticated users away from /login and /signup. */
function RedirectIfAuthed({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return <FullScreenMessage>Loading…</FullScreenMessage>
  if (user) return <Navigate to="/" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <RedirectIfAuthed>
            <LoginPage />
          </RedirectIfAuthed>
        }
      />
      <Route
        path="/signup"
        element={
          <RedirectIfAuthed>
            <SignupPage />
          </RedirectIfAuthed>
        }
      />
      <Route
        path="/onboarding"
        element={
          <RequireAuth>
            <OnboardingPage />
          </RequireAuth>
        }
      />
      <Route
        path="/bands/new"
        element={
          <RequireAuth>
            <AddBandPage />
          </RequireAuth>
        }
      />
      <Route
        path="/"
        element={
          <RequireAuth>
            <RequireBand>
              <DashboardPage />
            </RequireBand>
          </RequireAuth>
        }
      />
      <Route
        path="/tours/:tourId"
        element={
          <RequireAuth>
            <RequireBand>
              <TourDetailPage />
            </RequireBand>
          </RequireAuth>
        }
      />
      <Route
        path="/tours/:tourId/shows/new"
        element={
          <RequireAuth>
            <RequireBand>
              <ShowFormPage mode="create" />
            </RequireBand>
          </RequireAuth>
        }
      />
      <Route
        path="/shows/new"
        element={
          <RequireAuth>
            <RequireBand>
              <ShowFormPage mode="create" />
            </RequireBand>
          </RequireAuth>
        }
      />
      <Route
        path="/shows/:showId"
        element={
          <RequireAuth>
            <RequireBand>
              <ShowDetailPage />
            </RequireBand>
          </RequireAuth>
        }
      />
      <Route
        path="/shows/:showId/edit"
        element={
          <RequireAuth>
            <RequireBand>
              <ShowFormPage mode="edit" />
            </RequireBand>
          </RequireAuth>
        }
      />
      <Route
        path="/settings"
        element={
          <RequireAuth>
            <RequireBand>
              <SettingsPage />
            </RequireBand>
          </RequireAuth>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
