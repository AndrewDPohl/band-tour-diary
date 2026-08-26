import { Link } from 'react-router-dom'
import type { Tour } from '../types/database'

const dateFmt = (d: string | null) =>
  d ? new Date(`${d}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : null

export function TourCard({ tour, showCount }: { tour: Tour; showCount?: number }) {
  const range =
    dateFmt(tour.start_date) && dateFmt(tour.end_date)
      ? `${dateFmt(tour.start_date)} – ${dateFmt(tour.end_date)}`
      : (dateFmt(tour.start_date) ?? dateFmt(tour.end_date))

  return (
    <Link
      to={`/tours/${tour.id}`}
      className="block rounded-xl border border-ink/10 bg-white/70 p-4 transition hover:border-road/40 hover:bg-white"
    >
      <div className="font-display text-lg font-semibold text-ink">{tour.name}</div>
      <div className="mt-1 text-sm text-ink/60">
        {range ?? 'No dates set'}
        {showCount !== undefined ? ` · ${showCount} show${showCount === 1 ? '' : 's'}` : ''}
      </div>
    </Link>
  )
}
