import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabaseClient'
import type { Show, ShowInput } from '../types/database'
import { useAuth } from '../context/AuthContext'

export function useShows(tourId: string | undefined) {
  return useQuery({
    queryKey: ['shows', tourId],
    enabled: !!tourId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('shows')
        .select('*')
        .eq('tour_id', tourId!)
        .order('date', { ascending: true })

      if (error) throw error
      return data as Show[]
    },
  })
}

export function useShow(showId: string | undefined) {
  return useQuery({
    queryKey: ['show', showId],
    enabled: !!showId,
    queryFn: async () => {
      const { data, error } = await supabase.from('shows').select('*').eq('id', showId!).single()
      if (error) throw error
      return data as Show
    },
  })
}

export function useCreateShow(bandId: string | undefined, tourId: string | undefined) {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: ShowInput) => {
      if (!bandId || !tourId || !user) throw new Error('Missing band, tour, or user')
      const { data, error } = await supabase
        .from('shows')
        .insert({ ...input, band_id: bandId, tour_id: tourId, created_by: user.id })
        .select()
        .single()

      if (error) throw error
      return data as Show
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shows', tourId] })
    },
  })
}

export function useUpdateShow(showId: string | undefined, tourId: string | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: ShowInput) => {
      if (!showId) throw new Error('Missing show id')
      const { data, error } = await supabase.from('shows').update(input).eq('id', showId).select().single()
      if (error) throw error
      return data as Show
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['show', showId] })
      queryClient.invalidateQueries({ queryKey: ['shows', tourId] })
    },
  })
}

export function useDeleteShow(tourId: string | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (showId: string) => {
      const { error } = await supabase.from('shows').delete().eq('id', showId)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shows', tourId] })
    },
  })
}
