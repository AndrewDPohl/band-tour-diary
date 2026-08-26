import { useRef, useState } from 'react'
import { useUploadPhoto } from '../hooks/usePhotos'

export function PhotoUploader({ bandId, showId }: { bandId: string; showId: string }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const upload = useUploadPhoto(bandId, showId)
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(0)

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return
    setError(null)
    const list = Array.from(files)
    setPending(list.length)
    for (const file of list) {
      try {
        await upload.mutateAsync(file)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Upload failed')
      } finally {
        setPending((n) => Math.max(0, n - 1))
      }
    }
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        capture="environment"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={pending > 0}
        className="rounded-lg border border-road/40 bg-road/10 px-4 py-2 text-sm font-medium text-road-dark transition hover:bg-road/20 disabled:opacity-50"
      >
        {pending > 0 ? `Uploading ${pending}…` : 'Add photos'}
      </button>
      {error && <p className="mt-2 text-sm text-rose-700">{error}</p>}
    </div>
  )
}
