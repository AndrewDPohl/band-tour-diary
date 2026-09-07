import { Link, useNavigate } from 'react-router-dom'
import { BandSetupForm } from '../components/BandSetupForm'
import { useActiveBand } from '../context/ActiveBandContext'

/** Create or join *another* band, for a user who already has at least one.
 * Unlike /onboarding (only reachable with zero bands), this is reachable any
 * time via the header switcher or Settings. */
export function AddBandPage() {
  const { setActiveBandId } = useActiveBand()
  const navigate = useNavigate()

  function handleSuccess(bandId: string) {
    setActiveBandId(bandId)
    navigate('/', { replace: true })
  }

  return (
    <div className="flex min-h-full items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="text-3xl">🎸</div>
          <h1 className="font-display mt-2 text-2xl font-semibold text-ink">Add another band</h1>
          <p className="mt-1 text-sm text-ink/60">Create a new one, or join one with an invite code.</p>
        </div>

        <BandSetupForm onSuccess={handleSuccess} />

        <Link to="/" className="mt-4 block w-full text-center text-sm text-ink/50 underline underline-offset-2">
          Cancel
        </Link>
      </div>
    </div>
  )
}
