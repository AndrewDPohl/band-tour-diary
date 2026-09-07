import { defineConfig, devices } from '@playwright/test'

const PORT = 5173
const baseURL = `http://localhost:${PORT}`

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['html', { open: 'never' }], ['list']] : 'list',
  use: {
    baseURL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    // A built + previewed app is closer to what actually ships than the dev
    // server, and skips watching/HMR overhead that CI doesn't need.
    command: process.env.CI ? `npm run build && npm run preview -- --port ${PORT}` : `npm run dev -- --port ${PORT}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      // This suite only covers flows that don't need a real backend (public
      // pages, route guards, dark-mode init) — see e2e/*.spec.ts — so these
      // just need to be well-formed enough for the Supabase client to
      // construct without throwing. No live project, no secrets, no
      // network calls are ever made against these.
      VITE_SUPABASE_URL: 'https://placeholder.supabase.co',
      VITE_SUPABASE_ANON_KEY: 'placeholder-anon-key',
    },
  },
})
