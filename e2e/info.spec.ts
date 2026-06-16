import { test, expect } from '@playwright/test'

test('Info button opens the info screen with install steps and version', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Info' }).click()
  const dialog = page.getByRole('dialog', { name: 'Info' })
  await expect(dialog).toBeVisible()
  // desktop Chrome → both platforms shown
  await expect(page.getByText('iPhone & iPad (iOS)')).toBeVisible()
  await expect(page.getByText('Add to Home Screen', { exact: true })).toBeVisible() // iOS
  await expect(page.getByText('Add to Home screen', { exact: true })).toBeVisible() // Android
  await expect(page.getByText(/Version v/)).toBeVisible()
})

test('does not scroll the ruler while the info screen is open', async ({ page }) => {
  await page.goto('/')
  await page.waitForFunction(() => window.scrollY === 3025) // let the initial restore settle
  await page.getByRole('button', { name: 'Info' }).click()
  await expect(page.getByRole('dialog', { name: 'Info' })).toBeVisible()
  const before = await page.evaluate(() => window.scrollY)
  await page.mouse.wheel(0, 600)
  await page.waitForTimeout(150)
  expect(await page.evaluate(() => window.scrollY)).toBe(before)
})

test('Done closes the info screen', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Info' }).click()
  await expect(page.getByRole('dialog', { name: 'Info' })).toBeVisible()
  await page.getByRole('button', { name: 'Done' }).click()
  await expect(page.getByRole('dialog', { name: 'Info' })).not.toBeVisible()
})
