import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { z } from 'zod'
import { useCurrentBand } from '../hooks/useBand'
import { useCreateShow, useShow, useUpdateShow } from '../hooks/useShows'
import { useTour } from '../hooks/useTours'
import type { ShowInput } from '../types/database'

// All fields are kept as plain strings here, matching the native <input> values.
// They're converted to the typed ShowInput shape in onSubmit.
const schema = z.object({
  date: z.string().min(1, 'Required'),
  venue_name: z.string().min(1, 'Required'),
  venue_address: z.string(),
  city: z.string(),
  region: z.string(),
  contact_name: z.string(),
  contact_phone: z.string(),
  promoter_name: z.string(),
  payment_type: z.enum(['guarantee', 'door_deal']),
  guarantee_amount: z.string(),
  attendance_count: z.string(),
  merch_sales_total: z.string(),
  gas_spent: z.string(),
  food_spent: z.string(),
  door_total: z.string(),
  notes: z.string(),
})

type FormValues = z.infer<typeof schema>

const defaults: FormValues = {
  date: new Date().toISOString().slice(0, 10),
  venue_name: '',
  venue_address: '',
  city: '',
  region: '',
  contact_name: '',
  contact_phone: '',
  promoter_name: '',
  payment_type: 'door_deal',
  guarantee_amount: '',
  attendance_count: '',
  merch_sales_total: '0',
  gas_spent: '0',
  food_spent: '0',
  door_total: '0',
  notes: '',
}

const blankToNull = (v: string) => (v.trim() === '' ? null : v)
const blankToZero = (v: string) => (v.trim() === '' ? 0 : Number(v))
const blankToNullNumber = (v: string) => (v.trim() === '' ? null : Number(v))

function toShowInput(values: FormValues): ShowInput {
  return {
    date: values.date,
    venue_name: values.venue_name.trim(),
    venue_address: blankToNull(values.venue_address),
    city: blankToNull(values.city),
    region: blankToNull(values.region),
    contact_name: blankToNull(values.contact_name),
    contact_phone: blankToNull(values.contact_phone),
    promoter_name: blankToNull(values.promoter_name),
    payment_type: values.payment_type,
    guarantee_amount: values.payment_type === 'guarantee' ? blankToNullNumber(values.guarantee_amount) : null,
    attendance_count: blankToNullNumber(values.attendance_count),
    merch_sales_total: blankToZero(values.merch_sales_total),
    gas_spent: blankToZero(values.gas_spent),
    food_spent: blankToZero(values.food_spent),
    door_total: blankToZero(values.door_total),
    notes: blankToNull(values.notes),
  }
}

function fromShow(show: NonNullable<ReturnType<typeof useShow>['data']>): FormValues {
  return {
    date: show.date,
    venue_name: show.venue_name,
    venue_address: show.venue_address ?? '',
    city: show.city ?? '',
    region: show.region ?? '',
    contact_name: show.contact_name ?? '',
    contact_phone: show.contact_phone ?? '',
    promoter_name: show.promoter_name ?? '',
    payment_type: show.payment_type,
    guarantee_amount: show.guarantee_amount != null ? String(show.guarantee_amount) : '',
    attendance_count: show.attendance_count != null ? String(show.attendance_count) : '',
    merch_sales_total: String(show.merch_sales_total),
    gas_spent: String(show.gas_spent),
    food_spent: String(show.food_spent),
    door_total: String(show.door_total),
    notes: show.notes ?? '',
  }
}

const inputClass =
  'mt-1 w-full rounded-lg border border-ink/15 bg-surface px-3 py-2 text-sm outline-none focus:border-road'
const labelClass = 'block text-sm font-medium text-ink/70'

export function ShowFormPage({ mode }: { mode: 'create' | 'edit' }) {
  const navigate = useNavigate()
  const { tourId: tourIdParam, showId } = useParams<{ tourId: string; showId: string }>()
  const { data: bandData } = useCurrentBand()
  const bandId = bandData?.band.id

  const { data: existingShow } = useShow(mode === 'edit' ? showId : undefined)
  const tourId = mode === 'edit' ? existingShow?.tour_id : tourIdParam
  const { data: tour } = useTour(tourId)

  const createShow = useCreateShow(bandId, tourId)
  const updateShow = useUpdateShow(showId, tourId)

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: defaults })

  useEffect(() => {
    if (mode === 'edit' && existingShow) {
      reset(fromShow(existingShow))
    }
  }, [mode, existingShow, reset])

  const paymentType = watch('payment_type')

  async function onSubmit(values: FormValues) {
    const input = toShowInput(values)
    if (mode === 'create') {
      const show = await createShow.mutateAsync(input)
      navigate(`/shows/${show.id}`, { replace: true })
    } else if (showId) {
      await updateShow.mutateAsync(input)
      navigate(`/shows/${showId}`, { replace: true })
    }
  }

  const backTo = mode === 'edit' && showId ? `/shows/${showId}` : tourId ? `/tours/${tourId}` : '/'

  return (
    <div>
      <Link to={backTo} className="text-sm text-ink/50 hover:text-ink">
        ← Back
      </Link>

      <h1 className="font-display mt-2 text-2xl font-semibold text-ink">
        {mode === 'create' ? 'Add a show' : 'Edit show'}
      </h1>
      {tour && <p className="text-sm text-ink/50">{tour.name}</p>}

      <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-6">
        <section className="space-y-3 rounded-xl border border-ink/10 bg-surface/70 p-4">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-ink/50">Venue &amp; date</h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Date</label>
              <input type="date" {...register('date')} className={inputClass} />
              {errors.date && <p className="mt-1 text-xs text-rose-700 dark:text-rose-400">{errors.date.message}</p>}
            </div>
            <div>
              <label className={labelClass}>Attendance</label>
              <input type="number" min={0} {...register('attendance_count')} className={inputClass} />
            </div>
          </div>
          <div>
            <label className={labelClass}>Venue name</label>
            <input type="text" {...register('venue_name')} className={inputClass} />
            {errors.venue_name && <p className="mt-1 text-xs text-rose-700 dark:text-rose-400">{errors.venue_name.message}</p>}
          </div>
          <div>
            <label className={labelClass}>Venue address</label>
            <input type="text" {...register('venue_address')} className={inputClass} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>City</label>
              <input type="text" {...register('city')} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>State / region</label>
              <input type="text" {...register('region')} className={inputClass} />
            </div>
          </div>
        </section>

        <section className="space-y-3 rounded-xl border border-ink/10 bg-surface/70 p-4">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-ink/50">Promoter &amp; contact</h2>
          <div>
            <label className={labelClass}>Promoter name</label>
            <input type="text" {...register('promoter_name')} className={inputClass} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Day-of contact name</label>
              <input type="text" {...register('contact_name')} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Contact phone</label>
              <input type="tel" {...register('contact_phone')} className={inputClass} />
            </div>
          </div>
        </section>

        <section className="space-y-3 rounded-xl border border-ink/10 bg-surface/70 p-4">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-ink/50">Money</h2>
          <div>
            <label className={labelClass}>Payment type</label>
            <select {...register('payment_type')} className={inputClass}>
              <option value="door_deal">Door deal</option>
              <option value="guarantee">Flat guarantee</option>
            </select>
          </div>
          {paymentType === 'guarantee' && (
            <div>
              <label className={labelClass}>Guarantee amount ($)</label>
              <input type="number" step="0.01" min={0} {...register('guarantee_amount')} className={inputClass} />
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Door total ($)</label>
              <input type="number" step="0.01" min={0} {...register('door_total')} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Merch sales ($)</label>
              <input type="number" step="0.01" min={0} {...register('merch_sales_total')} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Gas spent ($)</label>
              <input type="number" step="0.01" min={0} {...register('gas_spent')} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Food spent ($)</label>
              <input type="number" step="0.01" min={0} {...register('food_spent')} className={inputClass} />
            </div>
          </div>
        </section>

        <section className="space-y-3 rounded-xl border border-ink/10 bg-surface/70 p-4">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-ink/50">Diary notes</h2>
          <textarea
            rows={6}
            {...register('notes')}
            placeholder="How'd the night go? Crowd energy, gear issues, funny stories…"
            className={inputClass}
          />
        </section>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-lg bg-road px-4 py-3 text-sm font-semibold text-white transition hover:bg-road-dark disabled:opacity-50"
        >
          {isSubmitting ? 'Saving…' : mode === 'create' ? 'Save show' : 'Save changes'}
        </button>
      </form>
    </div>
  )
}
