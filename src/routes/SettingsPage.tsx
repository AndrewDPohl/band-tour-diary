import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { themeOptions, useTheme } from '../context/ThemeContext'
import { useBandMembers, useCurrentBand } from '../hooks/useBand'

const inputClass =
  'mt-1 w-full rounded-lg border border-ink/15 bg-surface px-3 py-2 text-sm outline-none focus:border-road'

function ChangePasswordForm() {
  const { updatePassword } = useAuth()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Editing any field after a submit means the previous result no longer
  // describes what's on screen — clear both so a stale "Password updated."
  // (or a stale error) can't linger next to a half-typed new attempt.
  function clearStatus() {
    setError(null)
    setSuccess(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match')
      return
    }

    setSubmitting(true)
    const { error } = await updatePassword(currentPassword, newPassword)
    setSubmitting(false)

    if (error) {
      setError(error)
      return
    }

    setSuccess(true)
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-3 border-t border-ink/10 pt-4">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-ink/50">Change password</h3>
      <div>
        <label htmlFor="current-password" className="block text-sm font-medium text-ink/70">
          Current password
        </label>
        <input
          id="current-password"
          type="password"
          required
          value={currentPassword}
          onChange={(e) => {
            setCurrentPassword(e.target.value)
            clearStatus()
          }}
          className={inputClass}
        />
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="new-password" className="block text-sm font-medium text-ink/70">
            New password
          </label>
          <input
            id="new-password"
            type="password"
            required
            minLength={6}
            value={newPassword}
            onChange={(e) => {
              setNewPassword(e.target.value)
              clearStatus()
            }}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="confirm-password" className="block text-sm font-medium text-ink/70">
            Confirm new password
          </label>
          <input
            id="confirm-password"
            type="password"
            required
            minLength={6}
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value)
              clearStatus()
            }}
            className={inputClass}
          />
        </div>
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}
      {success && <p className="text-sm text-success">Password updated.</p>}

      <button
        type="submit"
        disabled={submitting}
        className="rounded-lg border border-ink/15 px-4 py-2 text-sm font-medium text-ink/70 transition hover:bg-ink/5 disabled:opacity-50"
      >
        {submitting ? 'Updating…' : 'Update password'}
      </button>
    </form>
  )
}

export function SettingsPage() {
  const { user, signOut } = useAuth()
  const { theme, setTheme } = useTheme()
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

      <section className="rounded-xl border border-ink/10 bg-surface/70 p-4">
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink/50">Band</h2>
        <p className="text-lg font-medium text-ink">{bandData?.band.name}</p>
        <div className="mt-3">
          <p className="text-sm text-ink/60">Invite code — share this with bandmates so they can join:</p>
          <div className="mt-1 flex items-center gap-2">
            <span
              data-testid="invite-code"
              className="rounded-lg bg-road/10 px-3 py-1.5 font-mono text-lg tracking-widest text-accent"
            >
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

      <section className="rounded-xl border border-ink/10 bg-surface/70 p-4">
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

      <section className="rounded-xl border border-ink/10 bg-surface/70 p-4">
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink/50">Appearance</h2>
        <div className="flex gap-2">
          {themeOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setTheme(option.value)}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition ${
                theme === option.value ? 'border-road/40 bg-road/10 text-accent' : 'border-ink/15 text-ink/70 hover:bg-ink/5'
              }`}
            >
              <span aria-hidden="true">{option.icon}</span>
              {option.label}
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-ink/10 bg-surface/70 p-4">
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink/50">Account</h2>
        <p className="text-sm text-ink/60">{user?.email}</p>
        <button
          type="button"
          onClick={() => signOut()}
          className="mt-3 rounded-lg border border-ink/15 px-4 py-2 text-sm font-medium text-ink/70 transition hover:bg-ink/5"
        >
          Sign out
        </button>

        <ChangePasswordForm />
      </section>
    </div>
  )
}
