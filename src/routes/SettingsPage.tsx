import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useBandMembers, useCurrentBand } from '../hooks/useBand'

export function SettingsPage() {
  const { user, signOut } = useAuth()
  const { data: bandData } = useCurrentBand()
  const { data: members } = useBandMembers(bandData?.band.id)
  const [copied, setCopied] = useState(false)

  async function copyInviteCode() {
    if (!bandData) return
    await navigator.clipboard.writeText(bandData.band.invite_code)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-semibold text-ink">Settings</h1>

      <section className="rounded-xl border border-ink/10 bg-white/70 p-4">
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink/50">Band</h2>
        <p className="text-lg font-medium text-ink">{bandData?.band.name}</p>
        <div className="mt-3">
          <p className="text-sm text-ink/60">Invite code — share this with bandmates so they can join:</p>
          <div className="mt-1 flex items-center gap-2">
            <span className="rounded-lg bg-road/10 px-3 py-1.5 font-mono text-lg tracking-widest text-road-dark">
              {bandData?.band.invite_code}
            </span>
            <button
              type="button"
              onClick={copyInviteCode}
              className="rounded-lg border border-ink/15 px-3 py-1.5 text-sm font-medium text-ink/70 transition hover:bg-ink/5"
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-ink/10 bg-white/70 p-4">
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink/50">Members</h2>
        <ul className="divide-y divide-ink/10">
          {members?.map((m) => (
            <li key={m.user_id} className="flex items-center justify-between py-2 text-sm">
              <span className="text-ink">
                {m.profile.display_name || m.profile.email}
                {m.user_id === user?.id && <span className="text-ink/40"> (you)</span>}
              </span>
              <span className="capitalize text-ink/50">{m.role}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-xl border border-ink/10 bg-white/70 p-4">
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink/50">Account</h2>
        <p className="text-sm text-ink/60">{user?.email}</p>
        <button
          type="button"
          onClick={() => signOut()}
          className="mt-3 rounded-lg border border-ink/15 px-4 py-2 text-sm font-medium text-ink/70 transition hover:bg-ink/5"
        >
          Sign out
        </button>
      </section>
    </div>
  )
}
