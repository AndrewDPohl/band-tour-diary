import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { expect, test } from '@playwright/test'
import { createBand, signUpNewUser } from './fixtures'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const TEST_PHOTO = path.join(__dirname, 'fixtures', 'test-photo.jpg')

test('uploading a photo adds it to the show gallery', async ({ page }) => {
  await signUpNewUser(page)
  await createBand(page, `E2E Band ${Date.now()}`)

  await page.getByRole('button', { name: '+ New tour' }).click()
  await page.locator('#tour-name').fill('Photo Test Tour')
  await page.getByRole('button', { name: 'Create tour' }).click()
  await page.getByRole('link', { name: 'Photo Test Tour' }).click()

  await page.getByRole('link', { name: '+ Add show' }).click()
  await page.locator('#venue_name').fill('Photo Test Venue')
  await page.getByRole('button', { name: 'Save show' }).click()

  await expect(page.getByText('No photos yet — add some from tonight.')).toBeVisible()

  // The trigger button opens a hidden <input type=file>; set it directly
  // rather than simulating the click-to-open-picker interaction.
  await page.locator('input[type=file]').setInputFiles(TEST_PHOTO)

  await expect(page.getByText('No photos yet')).toHaveCount(0)
  await expect(page.locator('img[src]')).toHaveCount(1)
})
