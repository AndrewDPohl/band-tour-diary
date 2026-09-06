import { Link } from 'react-router-dom'
import type { Show } from '../types/database'
import { showNetCash } from '../types/database'

const money = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })

const dateFmt = (d: string) =>
  new Date(`${d}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

export function ShowCard({ show }: { show: Show }) {
  const net = showNetCash(show)

  return (
    <Link
      to={`/shows/${show.id}`}
      className="flex items-center justify-between gap-3 rounded-lg border border-ink/10 bg-surface/70 px-4 py-3 transition hover:border-road/40 hover:bg-surface"
    >
      <div className="min-w-0">
        <div className="truncate font-semibold text-ink">{show.venue_name}</div>
        <div className="truncate text-sm text-ink/60">
          {dateFmt(show.date)}
          {show.city ? ` · ${show.city}${show.region ? `, ${show.region}` : ''}` : ''}
        </div>
      </div>
      <div
        className={`shrink-0 text-sm font-semibold ${net >= 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'}`}
      >
        {money(net)}
      </div>
    </Link>
  )
}
