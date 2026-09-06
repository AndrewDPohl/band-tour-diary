import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabaseClient'

export function SignupPage() {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [needsConfirmation, setNeedsConfirmation] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    const { error } = await signUp(email, password, name)
    setSubmitting(false)
    if (error) {
      setError(error)
      return
    }

    // If email confirmation is required, there's no session yet.
    const { data } = await supabase.auth.getSession()
    if (!data.session) {
      setNeedsConfirmation(true)
      return
    }
    navigate('/onboarding', { replace: true })
  }

  if (needsConfirmation) {
    return (
      <div className="flex min-h-full items-center justify-center px-4 py-12 text-center">
        <div className="max-w-sm">
          <div className="text-3xl">📬</div>
          <h1 className="font-display mt-2 text-xl font-semibold text-ink">Check your email</h1>
          <p className="mt-2 text-sm text-ink/60">
            We sent a confirmation link to <strong>{email}</strong>. Click it, then come back and sign in.
          </p>
          <Link to="/login" className="mt-4 inline-block text-sm font-medium text-road-dark underline underline-offset-2 dark:text-amber-400">
            Back to sign in
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-full items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="text-3xl">📓</div>
          <h1 className="font-display mt-2 text-2xl font-semibold text-ink">Create an account</h1>
          <p className="mt-1 text-sm text-ink/60">Start logging your shows.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-ink/10 bg-surface/70 p-6">
          <div>
            <label className="block text-sm font-medium text-ink/70">Your name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-ink/15 bg-surface px-3 py-2 text-sm outline-none focus:border-road"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink/70">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-ink/15 bg-surface px-3 py-2 text-sm outline-none focus:border-road"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink/70">Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-ink/15 bg-surface px-3 py-2 text-sm outline-none focus:border-road"
            />
          </div>

          {error && <p className="text-sm text-rose-700 dark:text-rose-400">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-road px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-road-dark disabled:opacity-50"
          >
            {submitting ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-ink/60">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-road-dark underline underline-offset-2 dark:text-amber-400">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
