import { expect, type Page } from '@playwright/test'

/** Every test signs up a fresh account through the real UI — no seeded users,
 * so tests never collide and never need cleanup. Requires "Confirm email" to
 * be OFF on the target Supabase project (see README's "End-to-end tests"
 * section), or signup won't return an active session immediately. */
export function randomEmail(): string {
  return `e2e-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`
}

export const TEST_PASSWORD = 'e2e-test-password-123'

export interface TestUser {
  name: string
  email: string
  password: string
}

/** Signs up a brand-new user via /signup and waits for the /onboarding
 * redirect. Assumes the target project has email confirmation disabled. */
export async function signUpNewUser(page: Page, name = 'E2E Test User'): Promise<TestUser> {
  const email = randomEmail()
  await page.goto('/signup')
  await page.locator('#name').fill(name)
  await page.locator('#email').fill(email)
  await page.locator('#password').fill(TEST_PASSWORD)
  await page.getByRole('button', { name: 'Create account' }).click()
  await expect(page).toHaveURL(/\/onboarding$/)
  return { name, email, password: TEST_PASSWORD }
}

/** From /onboarding, creates a band and waits for the dashboard redirect.
 * Assumes the "Create band" tab is already selected (it's the default). */
export async function createBand(page: Page, name: string): Promise<void> {
  await page.locator('#band-name').fill(name)
  await page.locator('form button[type=submit]').click()
  await expect(page).toHaveURL(/\/$/)
}

/** From /onboarding, switches to the "Join band" tab and submits a code.
 * Doesn't assert the outcome — a valid code redirects to the dashboard, an
 * invalid one shows an error and stays put; callers assert whichever they
 * expect. */
export async function joinBand(page: Page, inviteCode: string): Promise<void> {
  await page.getByRole('button', { name: 'Join band', exact: true }).click()
  await page.locator('#invite-code').fill(inviteCode)
  await page.locator('form button[type=submit]').click()
}

/** Reads the invite code shown on the Settings page for the signed-in user's band. */
export async function getInviteCode(page: Page): Promise<string> {
  await page.goto('/settings')
  const code = await page.getByTestId('invite-code').innerText()
  return code.trim()
}

export async function logOut(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Sign out' }).click()
  await expect(page).toHaveURL(/\/login$/)
}

export async function logIn(page: Page, email: string, password: string): Promise<void> {
  await page.goto('/login')
  await page.locator('#email').fill(email)
  await page.locator('#password').fill(password)
  await page.getByRole('button', { name: 'Sign in' }).click()
}
