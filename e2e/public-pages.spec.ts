import { expect, test } from '@playwright/test'

// This suite covers only what's reachable without a real Supabase backend:
// the public login/signup pages, navigation between them, client-side
// validation, and the route guards that gate everything else. Testing
// anything past sign-in (bands, tours, shows, photos) needs a real project
// to authenticate and persist data against — see README.md's "End-to-end
// tests" section for the plan once a test backend is set up.

test.describe('login page', () => {
  test('renders the expected fields and links', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByRole('heading', { name: 'Tour Diary' })).toBeVisible()
    await expect(page.locator('#email')).toBeVisible()
    await expect(page.locator('#password')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Create an account' })).toBeVisible()
  })

  test('link navigates to the signup page', async ({ page }) => {
    await page.goto('/login')
    await page.getByRole('link', { name: 'Create an account' }).click()
    await expect(page).toHaveURL(/\/signup$/)
    await expect(page.getByRole('heading', { name: 'Create an account' })).toBeVisible()
  })
})

test.describe('signup page', () => {
  test('renders the expected fields and links', async ({ page }) => {
    await page.goto('/signup')
    await expect(page.getByRole('heading', { name: 'Create an account' })).toBeVisible()
    await expect(page.locator('#name')).toBeVisible()
    await expect(page.locator('#email')).toBeVisible()
    await expect(page.locator('#password')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Create account' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Sign in' })).toBeVisible()
  })

  test('link navigates back to the login page', async ({ page }) => {
    await page.goto('/signup')
    await page.getByRole('link', { name: 'Sign in' }).click()
    await expect(page).toHaveURL(/\/login$/)
  })

  test('rejects a password under 6 characters before submitting', async ({ page }) => {
    await page.goto('/signup')
    await page.locator('#name').fill('Test User')
    await page.locator('#email').fill('test@example.com')
    await page.locator('#password').fill('short')
    await page.getByRole('button', { name: 'Create account' }).click()

    // Native minLength validation blocks the submit — no navigation, no
    // network call, and the browser reports the field as invalid.
    await expect(page).toHaveURL(/\/signup$/)
    const isValid = await page.locator('#password').evaluate((el: HTMLInputElement) => el.validity.valid)
    expect(isValid).toBe(false)
  })
})

test.describe('route guards', () => {
  for (const path of ['/', '/settings', '/tours/some-id', '/nonexistent-page']) {
    test(`unauthenticated visit to ${path} redirects to /login`, async ({ page }) => {
      await page.goto(path)
      await expect(page).toHaveURL(/\/login$/)
    })
  }
})
