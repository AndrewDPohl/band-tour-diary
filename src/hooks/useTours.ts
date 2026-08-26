import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabaseClient'
import type { Tour } from '../types/database'
import { useAuth } from '../context/AuthContext'

export function useTours(bandId: string | undefined) {
  return useQuery({
    queryKey: ['tours', bandId],
    enabled: !!bandId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tours')
        .select('*')
        .eq('band_id', bandId!)
        .order('start_date', { ascending: false, nullsFirst: false })

      if (error) throw error
      return data as Tour[]
    },
  })
}

export function useTour(tourId: string | undefined) {
  return useQuery({
    queryKey: ['tour', tourId],
    enabled: !!tourId,
    queryFn: async () => {
      const { data, error } = await supabase.from('tours').select('*').eq('id', tourId!).single()
      if (error) throw error
      return data as Tour
    },
  })
}

export interface TourInput {
  name: string
  start_date: string | null
  end_date: string | null
  notes: string | null
}

export function useCreateTour(bandId: string | undefined) {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: TourInput) => {
      if (!bandId || !user) throw new Error('Missing band or user')
      const { data, error } = await supabase
        .from('tours')
        .insert({ ...input, band_id: bandId, created_by: user.id })
        .select()
        .single()

      if (error) throw error
      return data as Tour
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tours', bandId] })
    },
  })
}
