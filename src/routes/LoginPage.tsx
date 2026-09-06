import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function LoginPage() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    const { error } = await signIn(email, password)
    setSubmitting(false)
    if (error) {
      setError(error)
      return
    }
    navigate('/', { replace: true })
  }

  return (
    <div className="flex min-h-full items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="text-3xl">📓</div>
          <h1 className="font-display mt-2 text-2xl font-semibold text-ink">Tour Diary</h1>
          <p className="mt-1 text-sm text-ink/60">Log back in to your band's diary.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-ink/10 bg-surface/70 p-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-ink/70">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-ink/15 bg-surface px-3 py-2 text-sm outline-none focus:border-road"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-ink/70">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-ink/15 bg-surface px-3 py-2 text-sm outline-none focus:border-road"
            />
          </div>

          {error && <p className="text-sm text-danger">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-road px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-road-dark disabled:opacity-50"
          >
            {submitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-ink/60">
          New band?{' '}
          <Link to="/signup" className="font-medium text-accent underline underline-offset-2">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  )
}
