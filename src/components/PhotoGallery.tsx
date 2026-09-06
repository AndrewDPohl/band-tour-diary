import { useState } from 'react'
import { useDeletePhoto } from '../hooks/usePhotos'
import type { ShowPhotoWithUrl } from '../hooks/usePhotos'

export function PhotoGallery({ photos, showId }: { photos: ShowPhotoWithUrl[]; showId: string }) {
  const [lightbox, setLightbox] = useState<ShowPhotoWithUrl | null>(null)
  const deletePhoto = useDeletePhoto(showId)

  if (photos.length === 0) {
    return <p className="text-sm text-ink/50">No photos yet — add some from tonight.</p>
  }

  return (
    <>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
        {photos.map((photo) => (
          <button
            key={photo.id}
            type="button"
            onClick={() => setLightbox(photo)}
            className="aspect-square overflow-hidden rounded-lg border border-ink/10 bg-ink/5"
          >
            {photo.url && (
              <img src={photo.url} alt={photo.caption ?? ''} className="h-full w-full object-cover" />
            )}
          </button>
        ))}
      </div>

      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setLightbox(null)}
        >
          <div className="max-h-full max-w-full" onClick={(e) => e.stopPropagation()}>
            {lightbox.url && (
              <img src={lightbox.url} alt={lightbox.caption ?? ''} className="max-h-[80vh] max-w-full rounded-lg object-contain" />
            )}
            <div className="mt-3 flex justify-center gap-3">
              <button
                type="button"
                onClick={() => setLightbox(null)}
                className="rounded-lg bg-surface/90 px-4 py-2 text-sm font-medium text-ink"
              >
                Close
              </button>
              <button
                type="button"
                onClick={async () => {
                  await deletePhoto.mutateAsync(lightbox)
                  setLightbox(null)
                }}
                className="rounded-lg bg-rose-600/90 px-4 py-2 text-sm font-medium text-white dark:bg-rose-500/90"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
