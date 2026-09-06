import { themeOptions, useTheme } from '../context/ThemeContext'

/** Compact icon button that flips between light/dark explicitly. The
 * three-way Light/Dark/System choice lives in Settings — this is just the
 * quick day-to-day toggle. */
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  // resolvedTheme is always 'light' or 'dark', so this always finds a match —
  // pulled from the shared list so the icon can't drift from Settings' picker.
  const icon = themeOptions.find((o) => o.value === resolvedTheme)!.icon

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-ink/60 transition hover:bg-ink/5 hover:text-ink"
    >
      <span aria-hidden="true">{icon}</span>
    </button>
  )
}
