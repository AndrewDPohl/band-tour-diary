import { expect, test } from '@playwright/test'
import { logIn, logOut, signUpNewUser } from './fixtures'

test('sign up, sign out, and sign back in', async ({ page }) => {
  const user = await signUpNewUser(page)

  // Fresh account has no band yet, so onboarding should be showing the
  // create/join choice rather than bouncing back to login or dashboard.
  await expect(page.getByRole('heading', { name: 'One more step' })).toBeVisible()

  // Sign out is reachable from onboarding too (RequireBand hasn't wrapped us
  // in the full Layout yet, but AuthContext-level sign out still works).
  await page.getByRole('button', { name: 'Sign out' }).click()
  await expect(page).toHaveURL(/\/login$/)

  await logIn(page, user.email, user.password)
  // Back to onboarding, since this account still has no band.
  await expect(page.getByRole('heading', { name: 'One more step' })).toBeVisible()
})

test('wrong password shows an error and does not sign in', async ({ page }) => {
  const user = await signUpNewUser(page)
  await logOut(page)

  await logIn(page, user.email, 'definitely-the-wrong-password')
  await expect(page.getByText('Invalid login credentials')).toBeVisible()
  await expect(page).toHaveURL(/\/login$/)
})
