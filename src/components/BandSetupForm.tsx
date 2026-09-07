import { useState } from 'react'
import { useCreateBand, useJoinBand } from '../hooks/useBand'

/** The create-band/join-band tab switcher + form, shared by OnboardingPage
 * (a brand new user's first band) and AddBandPage (an existing user adding
 * another one). `onSuccess` receives the new/joined band's id. */
export function BandSetupForm({ onSuccess }: { onSuccess: (bandId: string) => void }) {
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
      const band = mode === 'create' ? await createBand.mutateAsync(bandName.trim()) : await joinBand.mutateAsync(inviteCode.trim())
      onSuccess(band.id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    }
  }

  return (
    <>
      <div className="mb-4 flex rounded-lg border border-ink/15 bg-surface/70 p-1 text-sm font-medium">
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

      <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-ink/10 bg-surface/70 p-6">
        {mode === 'create' ? (
          <div>
            <label htmlFor="band-name" className="block text-sm font-medium text-ink/70">
              Band name
            </label>
            <input
              id="band-name"
              type="text"
              required
              value={bandName}
              onChange={(e) => setBandName(e.target.value)}
              placeholder="e.g. The Roadworn"
              className="mt-1 w-full rounded-lg border border-ink/15 bg-surface px-3 py-2 text-sm outline-none focus:border-road"
            />
          </div>
        ) : (
          <div>
            <label htmlFor="invite-code" className="block text-sm font-medium text-ink/70">
              Invite code
            </label>
            <input
              id="invite-code"
              type="text"
              required
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              placeholder="e.g. AB3XZ9"
              className="mt-1 w-full rounded-lg border border-ink/15 bg-surface px-3 py-2 text-sm uppercase tracking-widest outline-none focus:border-road"
            />
          </div>
        )}

        {error && <p className="text-sm text-danger">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-road px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-road-dark disabled:opacity-50"
        >
          {submitting ? 'Please wait…' : mode === 'create' ? 'Create band' : 'Join band'}
        </button>
      </form>
    </>
  )
}
