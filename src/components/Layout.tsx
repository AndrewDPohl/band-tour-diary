import type { ReactNode } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useActiveBand } from '../context/ActiveBandContext'
import { useCurrentBand, useUserBands } from '../hooks/useBand'
import { ThemeToggle } from './ThemeToggle'

const navItems = [
  { to: '/', label: 'Tours', icon: '🎸' },
  { to: '/settings', label: 'Settings', icon: '⚙️' },
]

function navLinkClasses(isActive: boolean) {
  return `flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 text-xs font-medium transition sm:flex-row sm:gap-2 sm:px-3 sm:py-2 sm:text-sm ${
    isActive ? 'bg-road/15 text-accent' : 'text-ink/60 hover:bg-ink/5 hover:text-ink'
  }`
}

function BandName() {
  const { data } = useCurrentBand()
  const { data: bands } = useUserBands()
  const { setActiveBandId } = useActiveBand()

  if (!data?.band) return null

  // Only show a switcher once there's actually something to switch between —
  // a single-band user just sees their band name, same as before.
  if (!bands || bands.length < 2) {
    return <div className="text-xs leading-tight text-ink/50">{data.band.name}</div>
  }

  return (
    <select
      aria-label="Active band"
      value={data.band.id}
      onChange={(e) => setActiveBandId(e.target.value)}
      className="-ml-1 rounded bg-transparent text-xs leading-tight text-ink/50 outline-none"
    >
      {bands.map((b) => (
        <option key={b.band.id} value={b.band.id}>
          {b.band.name}
        </option>
      ))}
    </select>
  )
}

export function Layout({ children }: { children: ReactNode }) {
  const { signOut } = useAuth()

  return (
    <div className="flex min-h-full flex-col">
      <header className="border-b border-ink/10 bg-surface/70 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">📓</span>
            <div>
              <div className="font-display text-base font-semibold leading-tight text-ink">Tour Diary</div>
              <BandName />
            </div>
          </div>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <nav className="hidden gap-1 sm:flex">
              {navItems.map((item) => (
                <NavLink key={item.to} to={item.to} end={item.to === '/'} className={({ isActive }) => navLinkClasses(isActive)}>
                  <span>{item.icon}</span>
                  {item.label}
                </NavLink>
              ))}
              <Link
                to="/bands/new"
                className="rounded-lg px-3 py-2 text-sm font-medium text-ink/60 transition hover:bg-ink/5 hover:text-ink"
              >
                + Add band
              </Link>
              <button
                onClick={() => signOut()}
                className="rounded-lg px-3 py-2 text-sm font-medium text-ink/60 transition hover:bg-ink/5 hover:text-ink"
              >
                Sign out
              </button>
            </nav>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 pb-24 pt-4 sm:pb-8">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 z-40 flex justify-around border-t border-ink/10 bg-surface/95 py-1.5 backdrop-blur sm:hidden">
        {navItems.map((item) => (
          <NavLink key={item.to} to={item.to} end={item.to === '/'} className={({ isActive }) => navLinkClasses(isActive)}>
            <span className="text-lg">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
