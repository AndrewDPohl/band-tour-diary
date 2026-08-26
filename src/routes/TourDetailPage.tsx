import { Link, useParams } from 'react-router-dom'
import { useTour } from '../hooks/useTours'
import { useShows } from '../hooks/useShows'
import { ShowCard } from '../components/ShowCard'
import { MoneySummary } from '../components/MoneySummary'

export function TourDetailPage() {
  const { tourId } = useParams<{ tourId: string }>()
  const { data: tour, isLoading: tourLoading } = useTour(tourId)
  const { data: shows, isLoading: showsLoading } = useShows(tourId)

  const totals = (shows ?? []).reduce(
    (acc, s) => ({
      door: acc.door + s.door_total,
      merch: acc.merch + s.merch_sales_total,
      gas: acc.gas + s.gas_spent,
      food: acc.food + s.food_spent,
      attendance: acc.attendance + (s.attendance_count ?? 0),
    }),
    { door: 0, merch: 0, gas: 0, food: 0, attendance: 0 },
  )

  if (tourLoading) return <p className="text-sm text-ink/50">Loading tour…</p>
  if (!tour) return <p className="text-sm text-ink/50">Tour not found.</p>

  return (
    <div>
      <Link to="/" className="text-sm text-ink/50 hover:text-ink">
        ← All tours
      </Link>

      <div className="mt-2 flex items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-semibold text-ink">{tour.name}</h1>
        <Link
          to={`/tours/${tour.id}/shows/new`}
          className="shrink-0 rounded-lg bg-road px-4 py-2 text-sm font-semibold text-white transition hover:bg-road-dark"
        >
          + Add show
        </Link>
      </div>

      {shows && shows.length > 0 && (
        <div className="mt-4">
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink/50">Tour totals</h2>
          <MoneySummary
            doorTotal={totals.door}
            merchTotal={totals.merch}
            gasSpent={totals.gas}
            foodSpent={totals.food}
            attendance={totals.attendance}
          />
        </div>
      )}

      <div className="mt-6 space-y-2">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-ink/50">Shows</h2>
        {showsLoading && <p className="text-sm text-ink/50">Loading shows…</p>}
        {!showsLoading && shows?.length === 0 && (
          <p className="rounded-lg border border-dashed border-ink/20 px-4 py-8 text-center text-sm text-ink/50">
            No shows logged yet for this tour.
          </p>
        )}
        {shows?.map((show) => (
          <ShowCard key={show.id} show={show} />
        ))}
      </div>
    </div>
  )
}
