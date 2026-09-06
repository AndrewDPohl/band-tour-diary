import { expect, test } from '@playwright/test'
import { createBand, getInviteCode, joinBand, signUpNewUser } from './fixtures'

test('a second user can join a band by invite code and see its tours', async ({ browser }) => {
  const ownerContext = await browser.newContext()
  const ownerPage = await ownerContext.newPage()

  const bandName = `E2E Shared Band ${Date.now()}`
  const tourName = `E2E Shared Tour ${Date.now()}`

  await signUpNewUser(ownerPage, 'Band Owner')
  await createBand(ownerPage, bandName)

  await ownerPage.getByRole('button', { name: '+ New tour' }).click()
  await ownerPage.locator('#tour-name').fill(tourName)
  await ownerPage.getByRole('button', { name: 'Create tour' }).click()
  await expect(ownerPage.getByRole('link', { name: tourName })).toBeVisible()

  const inviteCode = await getInviteCode(ownerPage)
  expect(inviteCode).toMatch(/^[A-Z0-9]{6}$/)

  // --- A second, independent browser session joins with that code ---
  const memberContext = await browser.newContext()
  const memberPage = await memberContext.newPage()

  await signUpNewUser(memberPage, 'Band Member')
  await joinBand(memberPage, inviteCode)
  await expect(memberPage).toHaveURL(/\/$/)

  await expect(memberPage.getByRole('heading', { name: 'Tours' })).toBeVisible()
  await expect(memberPage.getByRole('link', { name: tourName })).toBeVisible()

  // Settings should reflect the shared band, with both members listed.
  await memberPage.goto('/settings')
  await expect(memberPage.getByText(bandName)).toBeVisible()
  await expect(memberPage.getByText('Band Owner')).toBeVisible()
  await expect(memberPage.getByText('Band Member (you)')).toBeVisible()

  await ownerContext.close()
  await memberContext.close()
})

test('joining with an invalid invite code shows an error', async ({ page }) => {
  await signUpNewUser(page)
  await joinBand(page, 'ZZZZZZ')
  await expect(page.getByText('No band found with that invite code.')).toBeVisible()
  await expect(page).toHaveURL(/\/onboarding$/)
})
