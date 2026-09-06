import { expect, test } from '@playwright/test'
import { createBand, signUpNewUser } from './fixtures'

test('create a band, a tour, and a show, with correct money math', async ({ page }) => {
  await signUpNewUser(page)

  const bandName = `E2E Band ${Date.now()}`
  await createBand(page, bandName)
  await expect(page.getByRole('heading', { name: 'Tours' })).toBeVisible()

  // --- Tour ---
  const tourName = `E2E Tour ${Date.now()}`
  await page.getByRole('button', { name: '+ New tour' }).click()
  await page.locator('#tour-name').fill(tourName)
  await page.getByRole('button', { name: 'Create tour' }).click()

  const tourLink = page.getByRole('link', { name: tourName })
  await expect(tourLink).toBeVisible()
  await tourLink.click()
  await expect(page.getByRole('heading', { name: tourName })).toBeVisible()

  // --- Show ---
  const venueName = `E2E Venue ${Date.now()}`
  await page.getByRole('link', { name: '+ Add show' }).click()
  await page.locator('#venue_name').fill(venueName)
  await page.locator('#city').fill('Testville')
  await page.locator('#region').fill('CA')
  await page.locator('#attendance_count').fill('150')
  await page.locator('#door_total').fill('400')
  await page.locator('#merch_sales_total').fill('200')
  await page.locator('#gas_spent').fill('80')
  await page.locator('#food_spent').fill('20')
  await page.getByRole('button', { name: 'Save show' }).click()

  // Net = 400 + 200 - 80 - 20 = 500
  await expect(page.getByRole('heading', { name: venueName, level: 1 })).toBeVisible()
  await expect(page.getByText('Testville, CA')).toBeVisible()
  await expect(page.getByText('$500', { exact: true })).toBeVisible()

  // --- Back on the tour, totals should match the one show we just added ---
  await page.getByRole('link', { name: '← Back to tour' }).click()
  await expect(page.getByRole('heading', { name: tourName })).toBeVisible()
  await expect(page.getByText(venueName)).toBeVisible()
  // "$500" appears twice: the tour-totals Net stat and this one show's own
  // net-cash badge on its ShowCard — with a single show they should agree.
  await expect(page.getByText('$500', { exact: true })).toHaveCount(2)
})

test('edit a show updates its values', async ({ page }) => {
  await signUpNewUser(page)
  await createBand(page, `E2E Band ${Date.now()}`)

  await page.getByRole('button', { name: '+ New tour' }).click()
  await page.locator('#tour-name').fill('Edit Test Tour')
  await page.getByRole('button', { name: 'Create tour' }).click()
  await page.getByRole('link', { name: 'Edit Test Tour' }).click()

  await page.getByRole('link', { name: '+ Add show' }).click()
  await page.locator('#venue_name').fill('Original Venue')
  await page.locator('#door_total').fill('100')
  await page.getByRole('button', { name: 'Save show' }).click()

  await page.getByRole('link', { name: 'Edit' }).click()
  await expect(page.getByRole('heading', { name: 'Edit show' })).toBeVisible()
  await page.locator('#venue_name').fill('Updated Venue')
  await page.getByRole('button', { name: 'Save changes' }).click()

  await expect(page.getByRole('heading', { name: 'Updated Venue', level: 1 })).toBeVisible()
})
