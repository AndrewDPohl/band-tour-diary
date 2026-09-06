import { useState } from 'react'
import { useCurrentBand } from '../hooks/useBand'
import { useCreateTour, useTours } from '../hooks/useTours'
import { TourCard } from '../components/TourCard'

export function DashboardPage() {
  const { data: bandData } = useCurrentBand()
  const bandId = bandData?.band.id
  const { data: tours, isLoading } = useTours(bandId)
  const createTour = useCreateTour(bandId)

  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    try {
      await createTour.mutateAsync({
        name: name.trim(),
        start_date: startDate || null,
        end_date: endDate || null,
        notes: null,
      })
      setName('')
      setStartDate('')
      setEndDate('')
      setShowForm(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create tour')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold text-ink">Tours</h1>
        <button
          type="button"
          onClick={() => setShowForm((s) => !s)}
          className="rounded-lg bg-road px-4 py-2 text-sm font-semibold text-white transition hover:bg-road-dark"
        >
          {showForm ? 'Cancel' : '+ New tour'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="mt-4 space-y-3 rounded-xl border border-ink/10 bg-surface/70 p-4">
          <div>
            <label className="block text-sm font-medium text-ink/70">Tour name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Summer 2026 Tour"
              className="mt-1 w-full rounded-lg border border-ink/15 bg-surface px-3 py-2 text-sm outline-none focus:border-road"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-ink/70">Start date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="mt-1 w-full rounded-lg border border-ink/15 bg-surface px-3 py-2 text-sm outline-none focus:border-road"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink/70">End date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="mt-1 w-full rounded-lg border border-ink/15 bg-surface px-3 py-2 text-sm outline-none focus:border-road"
              />
            </div>
          </div>
          {error && <p className="text-sm text-danger">{error}</p>}
          <button
            type="submit"
            disabled={createTour.isPending}
            className="w-full rounded-lg bg-road px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-road-dark disabled:opacity-50"
          >
            {createTour.isPending ? 'Creating…' : 'Create tour'}
          </button>
        </form>
      )}

      <div className="mt-6 space-y-3">
        {isLoading && <p className="text-sm text-ink/50">Loading tours…</p>}
        {!isLoading && tours?.length === 0 && (
          <p className="rounded-lg border border-dashed border-ink/20 px-4 py-8 text-center text-sm text-ink/50">
            No tours yet. Create your first one above.
          </p>
        )}
        {tours?.map((tour) => (
          <TourCard key={tour.id} tour={tour} />
        ))}
      </div>
    </div>
  )
}
