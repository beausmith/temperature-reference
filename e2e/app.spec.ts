import { test, expect } from '@playwright/test'

test('text selection is disabled across the app', async ({ page }) => {
  await page.goto('/')
  const userSelect = await page.evaluate(() => getComputedStyle(document.body).userSelect)
  expect(userSelect).toBe('none')
})
