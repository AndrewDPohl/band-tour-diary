import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCreateBand, useJoinBand } from '../hooks/useBand'
import { useAuth } from '../context/AuthContext'

export function OnboardingPage() {
  const { signOut } = useAuth()
  const navigate = useNavigate()
  const [mode, setMode] = useState<'create' | 'join'>('create')
  const [bandName, setBandName] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [error, setError] = useState<string | null>(null)

  const createBand = useCreateBand()
  const joinBand = useJoinBand()
  const submitting = createBand.isPending || joinBand.isPending

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    try {
      if (mode === 'create') {
        await createBand.mutateAsync(bandName.trim())
      } else {
        await joinBand.mutateAsync(inviteCode.trim())
      }
      navigate('/', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    }
  }

  return (
    <div className="flex min-h-full items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="text-3xl">🎤</div>
          <h1 className="font-display mt-2 text-2xl font-semibold text-ink">One more step</h1>
          <p className="mt-1 text-sm text-ink/60">Create a band, or join one with an invite code.</p>
        </div>

        <div className="mb-4 flex rounded-lg border border-ink/15 bg-white/70 p-1 text-sm font-medium">
          <button
            type="button"
            onClick={() => setMode('create')}
            className={`flex-1 rounded-md py-1.5 transition ${mode === 'create' ? 'bg-road text-white' : 'text-ink/60'}`}
          >
            Create band
          </button>
          <button
            type="button"
            onClick={() => setMode('join')}
            className={`flex-1 rounded-md py-1.5 transition ${mode === 'join' ? 'bg-road text-white' : 'text-ink/60'}`}
          >
            Join band
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-ink/10 bg-white/70 p-6">
          {mode === 'create' ? (
            <div>
              <label className="block text-sm font-medium text-ink/70">Band name</label>
              <input
                type="text"
                required
                value={bandName}
                onChange={(e) => setBandName(e.target.value)}
                placeholder="e.g. The Roadworn"
                className="mt-1 w-full rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm outline-none focus:border-road"
              />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-ink/70">Invite code</label>
              <input
                type="text"
                required
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                placeholder="e.g. AB3XZ9"
                className="mt-1 w-full rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm uppercase tracking-widest outline-none focus:border-road"
              />
            </div>
          )}

          {error && <p className="text-sm text-rose-700">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-road px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-road-dark disabled:opacity-50"
          >
            {submitting ? 'Please wait…' : mode === 'create' ? 'Create band' : 'Join band'}
          </button>
        </form>

        <button
          type="button"
          onClick={() => signOut()}
          className="mt-4 block w-full text-center text-sm text-ink/50 underline underline-offset-2"
        >
          Sign out
        </button>
      </div>
    </div>
  )
}
