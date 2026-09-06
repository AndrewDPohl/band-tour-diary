import { expect, test } from '@playwright/test'
import { createBand, logIn, logOut, signUpNewUser, TEST_PASSWORD } from './fixtures'

test.describe('dark mode', () => {
  test('toggling flips the theme and it survives a reload', async ({ page }) => {
    await signUpNewUser(page)
    await createBand(page, `E2E Band ${Date.now()}`)

    const html = page.locator('html')
    await expect(html).not.toHaveClass(/dark/)

    await page.getByRole('button', { name: 'Switch to dark mode' }).click()
    await expect(html).toHaveClass(/dark/)

    await page.reload()
    await expect(html).toHaveClass(/dark/) // persisted via localStorage, no flash back to light

    await page.getByRole('button', { name: 'Switch to light mode' }).click()
    await expect(html).not.toHaveClass(/dark/)
  })

  test('Settings has an explicit System option alongside Light/Dark', async ({ page }) => {
    await signUpNewUser(page)
    await createBand(page, `E2E Band ${Date.now()}`)
    await page.goto('/settings')

    // The icon spans are aria-hidden, so each button's accessible name is
    // just its label ("Light" / "Dark" / "System").
    await page.getByRole('button', { name: 'Dark', exact: true }).click()
    await expect(page.locator('html')).toHaveClass(/dark/)

    await page.getByRole('button', { name: 'Light', exact: true }).click()
    await expect(page.locator('html')).not.toHaveClass(/dark/)
  })
})

test.describe('change password', () => {
  test('wrong current password is rejected, correct flow lets you log back in', async ({ page }) => {
    const user = await signUpNewUser(page)
    await createBand(page, `E2E Band ${Date.now()}`)
    await page.goto('/settings')

    const newPassword = 'a-brand-new-password-456'

    // Wrong current password: rejected, nothing should change.
    await page.locator('#current-password').fill('not-the-real-password')
    await page.locator('#new-password').fill(newPassword)
    await page.locator('#confirm-password').fill(newPassword)
    await page.getByRole('button', { name: 'Update password' }).click()
    await expect(page.getByText('Current password is incorrect')).toBeVisible()

    // Mismatched new/confirm: rejected client-side before any network call.
    await page.locator('#current-password').fill(user.password)
    await page.locator('#new-password').fill(newPassword)
    await page.locator('#confirm-password').fill('does-not-match')
    await page.getByRole('button', { name: 'Update password' }).click()
    await expect(page.getByText('New passwords do not match')).toBeVisible()

    // Correct flow.
    await page.locator('#current-password').fill(user.password)
    await page.locator('#new-password').fill(newPassword)
    await page.locator('#confirm-password').fill(newPassword)
    await page.getByRole('button', { name: 'Update password' }).click()
    await expect(page.getByText('Password updated.')).toBeVisible()

    await logOut(page)
    await logIn(page, user.email, newPassword)
    await expect(page).not.toHaveURL(/\/login$/)

    // Old password no longer works.
    await logOut(page)
    await logIn(page, user.email, TEST_PASSWORD)
    await expect(page.getByText('Invalid login credentials')).toBeVisible()
  })
})
