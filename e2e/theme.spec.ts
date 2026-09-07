import { expect, test } from '@playwright/test'

// The dark-mode toggle itself lives inside the authenticated Layout, so it
// isn't reachable without a real backend session. But the logic that decides
// which theme to paint on load — index.html's pre-paint script plus
// ThemeContext's localStorage/system-preference fallback — is pure
// client-side state that any page (including the public login page) applies
// before React even mounts. That's what's covered here.

test('defaults to light when nothing is stored and the OS has no preference', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' })
  await page.goto('/login')
  await expect(page.locator('html')).not.toHaveClass(/dark/)
})

test('follows the OS preference when no theme is stored', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' })
  await page.goto('/login')
  await expect(page.locator('html')).toHaveClass(/dark/)
})

test('a stored dark preference overrides a light OS setting', async ({ context, page }) => {
  // Runs before any page script on every navigation in this context —
  // simulates a returning visitor whose choice was already saved, which is
  // exactly the case the pre-paint script exists to handle without a flash
  // of the wrong theme.
  await context.addInitScript(() => {
    window.localStorage.setItem('tour-diary-theme', 'dark')
  })
  await page.emulateMedia({ colorScheme: 'light' }) // OS says light...
  await page.goto('/login')
  await expect(page.locator('html')).toHaveClass(/dark/) // ...stored choice wins
})

test('a stored light preference overrides a dark OS setting', async ({ context, page }) => {
  await context.addInitScript(() => {
    window.localStorage.setItem('tour-diary-theme', 'light')
  })
  await page.emulateMedia({ colorScheme: 'dark' }) // OS says dark...
  await page.goto('/login')
  await expect(page.locator('html')).not.toHaveClass(/dark/) // ...stored choice wins
})
