import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { PHOTOS_BUCKET, supabase } from '../lib/supabaseClient'
import type { ShowPhoto } from '../types/database'
import { useAuth } from '../context/AuthContext'

export interface ShowPhotoWithUrl extends ShowPhoto {
  url: string | null
}

const SIGNED_URL_TTL_SECONDS = 60 * 60 // 1 hour, enough for a browsing session

export function usePhotos(showId: string | undefined) {
  return useQuery({
    queryKey: ['photos', showId],
    enabled: !!showId,
    queryFn: async () => {
      const { data: rows, error } = await supabase
        .from('show_photos')
        .select('*')
        .eq('show_id', showId!)
        .order('created_at', { ascending: true })

      if (error) throw error
      const photos = rows as ShowPhoto[]
      if (photos.length === 0) return [] as ShowPhotoWithUrl[]

      const { data: signed, error: signError } = await supabase.storage
        .from(PHOTOS_BUCKET)
        .createSignedUrls(
          photos.map((p) => p.storage_path),
          SIGNED_URL_TTL_SECONDS,
        )

      if (signError) throw signError

      return photos.map((photo, i) => ({
        ...photo,
        url: signed?.[i]?.signedUrl ?? null,
      }))
    },
  })
}

export function useUploadPhoto(bandId: string | undefined, showId: string | undefined) {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (file: File) => {
      if (!bandId || !showId || !user) throw new Error('Missing band, show, or user')

      const ext = file.name.split('.').pop() ?? 'jpg'
      const path = `${bandId}/${showId}/${crypto.randomUUID()}.${ext}`

      const { error: uploadError } = await supabase.storage.from(PHOTOS_BUCKET).upload(path, file)
      if (uploadError) throw uploadError

      const { error: insertError } = await supabase.from('show_photos').insert({
        show_id: showId,
        band_id: bandId,
        storage_path: path,
        uploaded_by: user.id,
      })
      if (insertError) throw insertError
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['photos', showId] })
    },
  })
}

export function useDeletePhoto(showId: string | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (photo: ShowPhoto) => {
      const { error: storageError } = await supabase.storage.from(PHOTOS_BUCKET).remove([photo.storage_path])
      if (storageError) throw storageError

      const { error: deleteError } = await supabase.from('show_photos').delete().eq('id', photo.id)
      if (deleteError) throw deleteError
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['photos', showId] })
    },
  })
}
