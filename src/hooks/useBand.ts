import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabaseClient'
import type { Band, BandMemberWithProfile } from '../types/database'
import { useAuth } from '../context/AuthContext'

function randomInviteCode(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // no 0/O/1/I to avoid confusion
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)]
  }
  return code
}

/** The current user's band (MVP assumes one band per user). */
export function useCurrentBand() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['current-band', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('band_members')
        .select('band_id, role, joined_at, bands(*)')
        .eq('user_id', user!.id)
        .limit(1)
        .maybeSingle()

      if (error) throw error
      if (!data) return null

      return {
        band: data.bands as unknown as Band,
        role: data.role as 'owner' | 'member',
      }
    },
  })
}

export function useCreateBand() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (name: string) => {
      if (!user) throw new Error('Not signed in')

      // Retry a couple times in the unlikely event of an invite code collision.
      for (let attempt = 0; attempt < 5; attempt++) {
        const invite_code = randomInviteCode()
        const { data: band, error: bandError } = await supabase
          .from('bands')
          .insert({ name, invite_code, created_by: user.id })
          .select()
          .single()

        if (bandError) {
          if (bandError.code === '23505') continue // unique violation, retry
          throw bandError
        }

        const { error: memberError } = await supabase
          .from('band_members')
          .insert({ band_id: band.id, user_id: user.id, role: 'owner' })

        if (memberError) throw memberError
        return band as Band
      }

      throw new Error('Could not generate a unique invite code, please try again.')
    },
    onSuccess: () => {
      // `refetchType: 'all'` (not the default 'active') matters here: nothing
      // is actively observing ['current-band'] while still on the Onboarding
      // page, so a default invalidation would just mark it stale without
      // refetching — and mutateAsync would resolve before the cache actually
      // has the new band, letting the RequireBand route guard bounce back to
      // /onboarding before the fresh data arrives.
      return queryClient.invalidateQueries({ queryKey: ['current-band'], refetchType: 'all' })
    },
  })
}

export function useJoinBand() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (inviteCode: string) => {
      if (!user) throw new Error('Not signed in')

      // A plain SELECT can't see a band you're not a member of yet, so the
      // lookup goes through a security-definer function scoped to the code.
      const { data: matches, error: lookupError } = await supabase.rpc('find_band_by_invite_code', {
        code: inviteCode.trim(),
      })

      if (lookupError) throw lookupError
      const band = matches?.[0]
      if (!band) throw new Error('No band found with that invite code.')

      const { error: memberError } = await supabase
        .from('band_members')
        .insert({ band_id: band.id, user_id: user.id, role: 'member' })

      if (memberError) {
        if (memberError.code === '23505') {
          throw new Error("You're already a member of this band.")
        }
        throw memberError
      }

      return band as Pick<Band, 'id' | 'name'>
    },
    onSuccess: () => {
      // `refetchType: 'all'` (not the default 'active') matters here: nothing
      // is actively observing ['current-band'] while still on the Onboarding
      // page, so a default invalidation would just mark it stale without
      // refetching — and mutateAsync would resolve before the cache actually
      // has the new band, letting the RequireBand route guard bounce back to
      // /onboarding before the fresh data arrives.
      return queryClient.invalidateQueries({ queryKey: ['current-band'], refetchType: 'all' })
    },
  })
}

export function useBandMembers(bandId: string | undefined) {
  return useQuery({
    queryKey: ['band-members', bandId],
    enabled: !!bandId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('band_members')
        .select('*, profile:profiles(*)')
        .eq('band_id', bandId!)
        .order('joined_at', { ascending: true })

      if (error) throw error
      return data as unknown as BandMemberWithProfile[]
    },
  })
}
