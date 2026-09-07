// Hand-written types mirroring supabase/migrations/0001_init.sql.
// If the schema changes, update these alongside the migration.

export type PaymentType = 'guarantee' | 'door_deal'
export type BandRole = 'owner' | 'member'

export interface Profile {
  id: string
  email: string
  display_name: string | null
  created_at: string
}

export interface Band {
  id: string
  name: string
  invite_code: string
  created_by: string
  created_at: string
}

export interface BandMember {
  band_id: string
  user_id: string
  role: BandRole
  joined_at: string
}

export interface BandMemberWithProfile extends BandMember {
  profile: Profile
}

export interface Tour {
  id: string
  band_id: string
  name: string
  start_date: string | null
  end_date: string | null
  notes: string | null
  created_by: string
  created_at: string
}

export interface Show {
  id: string
  tour_id: string | null
  band_id: string
  date: string
  venue_name: string
  venue_address: string | null
  city: string | null
  region: string | null
  contact_name: string | null
  contact_phone: string | null
  promoter_name: string | null
  payment_type: PaymentType
  guarantee_amount: number | null
  attendance_count: number | null
  merch_sales_total: number
  soft_merch_units: number
  hard_merch_units: number
  gas_spent: number
  food_spent: number
  lodging_spent: number
  equipment_spent: number
  door_total: number
  notes: string | null
  created_by: string
  created_at: string
  updated_at: string
}

export type ShowInput = Omit<
  Show,
  'id' | 'tour_id' | 'band_id' | 'created_by' | 'created_at' | 'updated_at'
>

export interface ShowPhoto {
  id: string
  show_id: string
  band_id: string
  storage_path: string
  caption: string | null
  uploaded_by: string
  created_at: string
}

/** What the band was actually paid for playing the show: the flat guarantee
 * when that's the deal, otherwise the door total. These are mutually
 * exclusive by construction — only one is ever collected for a given show
 * (see ShowFormPage, which hides whichever doesn't apply). */
export function showPayment(show: Pick<Show, 'payment_type' | 'door_total' | 'guarantee_amount'>): number {
  return show.payment_type === 'guarantee' ? (show.guarantee_amount ?? 0) : show.door_total
}

/** Derived net cash for a show: show payment + merch - gas - food - lodging - equipment. */
export function showNetCash(
  show: Pick<
    Show,
    'payment_type' | 'door_total' | 'guarantee_amount' | 'merch_sales_total' | 'gas_spent' | 'food_spent' | 'lodging_spent' | 'equipment_spent'
  >,
): number {
  return (
    showPayment(show) + show.merch_sales_total - show.gas_spent - show.food_spent - show.lodging_spent - show.equipment_spent
  )
}
