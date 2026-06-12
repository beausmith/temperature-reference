import { test, expect, Page } from '@playwright/test'

// (celciusMax / scale) * rowHeight + rowHeight / 2, no safe-area insets in desktop Chromium
const zeroScrollTop = 3025
const yFor = (celsius: number) => zeroScrollTop - celsius * 10

const indicator = (page: Page) => page.getByText(/ºC \/ /)

const scrollToTemp = async (page: Page, celsius: number) => {
  await page.evaluate(y => window.scrollTo(0, y), yFor(celsius))
  await page.waitForFunction(
    expected => localStorage.getItem('lastTemp') === expected,
    celsius.toFixed(1),
  )
}

test('first visit scrolls to 0ºC', async ({ page }) => {
  await page.goto('/')
  await expect(indicator(page)).toHaveText('0.0ºC / 32.0ºF')
  expect(await page.evaluate(() => window.scrollY)).toBe(zeroScrollTop)
})

test('reload restores the last viewed temperature', async ({ page }) => {
  await page.goto('/')
  await scrollToTemp(page, 50)
  await page.reload()
  await expect(indicator(page)).toHaveText('50.0ºC / 122.0ºF')
  expect(await page.evaluate(() => window.scrollY)).toBe(yFor(50))
})

test('closing and reopening the app restores the last viewed temperature', async ({ page, context }) => {
  await page.goto('/')
  await scrollToTemp(page, -10)
  await page.close()

  const reopened = await context.newPage()
  await reopened.goto('/')
  await expect(indicator(reopened)).toHaveText('-10.0ºC / 14.0ºF')
  expect(await reopened.evaluate(() => window.scrollY)).toBe(yFor(-10))
})

test('0ºC button lands exactly on zero after a restore and stays there', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('lastTemp', '50.0'))
  await page.goto('/')
  await expect(indicator(page)).toHaveText('50.0ºC / 122.0ºF')

  await page.getByRole('button', { name: '0ºC' }).click()
  await expect(indicator(page)).toHaveText('0.0ºC / 32.0ºF')

  // regression: a stale restore timeout used to snap the scroll away from zero
  await page.waitForTimeout(600)
  await expect(indicator(page)).toHaveText('0.0ºC / 32.0ºF')
  expect(await page.evaluate(() => window.scrollY)).toBe(zeroScrollTop)
})
