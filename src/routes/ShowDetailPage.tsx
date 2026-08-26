import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useCurrentBand } from '../hooks/useBand'
import { useDeleteShow, useShow } from '../hooks/useShows'
import { usePhotos } from '../hooks/usePhotos'
import { MoneySummary } from '../components/MoneySummary'
import { PhotoGallery } from '../components/PhotoGallery'
import { PhotoUploader } from '../components/PhotoUploader'

const dateFmt = (d: string) =>
  new Date(`${d}T00:00:00`).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

const money = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD' })

export function ShowDetailPage() {
  const { showId } = useParams<{ showId: string }>()
  const navigate = useNavigate()
  const { data: bandData } = useCurrentBand()
  const bandId = bandData?.band.id

  const { data: show, isLoading } = useShow(showId)
  const { data: photos } = usePhotos(showId)
  const deleteShow = useDeleteShow(show?.tour_id)
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  if (isLoading) return <p className="text-sm text-ink/50">Loading show…</p>
  if (!show) return <p className="text-sm text-ink/50">Show not found.</p>

  async function handleDelete() {
    if (!show) return
    await deleteShow.mutateAsync(show.id)
    navigate(`/tours/${show.tour_id}`, { replace: true })
  }

  return (
    <div>
      <Link to={`/tours/${show.tour_id}`} className="text-sm text-ink/50 hover:text-ink">
        ← Back to tour
      </Link>

      <div className="mt-2 flex items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">{show.venue_name}</h1>
          <p className="text-sm text-ink/60">{dateFmt(show.date)}</p>
          {(show.city || show.region) && (
            <p className="text-sm text-ink/60">
              {show.city}
              {show.city && show.region ? ', ' : ''}
              {show.region}
            </p>
          )}
        </div>
        <div className="flex shrink-0 gap-2">
          <Link
            to={`/shows/${show.id}/edit`}
            className="rounded-lg border border-ink/15 px-3 py-1.5 text-sm font-medium text-ink/70 transition hover:bg-ink/5"
          >
            Edit
          </Link>
        </div>
      </div>

      <div className="mt-5">
        <MoneySummary
          doorTotal={show.door_total}
          merchTotal={show.merch_sales_total}
          gasSpent={show.gas_spent}
          foodSpent={show.food_spent}
          attendance={show.attendance_count}
        />
      </div>

      <section className="mt-5 rounded-xl border border-ink/10 bg-white/70 p-4">
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink/50">Show details</h2>
        <dl className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
          {show.venue_address && (
            <div>
              <dt className="text-ink/50">Venue address</dt>
              <dd className="text-ink">{show.venue_address}</dd>
            </div>
          )}
          {show.promoter_name && (
            <div>
              <dt className="text-ink/50">Promoter</dt>
              <dd className="text-ink">{show.promoter_name}</dd>
            </div>
          )}
          {show.contact_name && (
            <div>
              <dt className="text-ink/50">Day-of contact</dt>
              <dd className="text-ink">
                {show.contact_name}
                {show.contact_phone ? ` · ${show.contact_phone}` : ''}
              </dd>
            </div>
          )}
          <div>
            <dt className="text-ink/50">Payment type</dt>
            <dd className="text-ink">
              {show.payment_type === 'guarantee'
                ? `Flat guarantee${show.guarantee_amount != null ? ` (${money(show.guarantee_amount)})` : ''}`
                : 'Door deal'}
            </dd>
          </div>
        </dl>
      </section>

      <section className="mt-5">
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink/50">Diary</h2>
        <div className="rounded-xl border border-ink/10 bg-white/70 p-4">
          {show.notes ? (
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink">{show.notes}</p>
          ) : (
            <p className="text-sm text-ink/40">No notes written for this night yet.</p>
          )}
        </div>
      </section>

      <section className="mt-5">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-ink/50">Photos</h2>
          {bandId && <PhotoUploader bandId={bandId} showId={show.id} />}
        </div>
        <PhotoGallery photos={photos ?? []} showId={show.id} />
      </section>

      <section className="mt-8 border-t border-ink/10 pt-4">
        {confirmingDelete ? (
          <div className="flex items-center gap-3 text-sm">
            <span className="text-ink/70">Delete this show and its photos?</span>
            <button
              onClick={handleDelete}
              disabled={deleteShow.isPending}
              className="rounded-lg bg-rose-600 px-3 py-1.5 font-medium text-white disabled:opacity-50"
            >
              {deleteShow.isPending ? 'Deleting…' : 'Yes, delete'}
            </button>
            <button onClick={() => setConfirmingDelete(false)} className="text-ink/50">
              Cancel
            </button>
          </div>
        ) : (
          <button onClick={() => setConfirmingDelete(true)} className="text-sm text-rose-700 underline underline-offset-2">
            Delete show
          </button>
        )}
      </section>
    </div>
  )
}
