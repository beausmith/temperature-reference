import { test, expect, Page } from '@playwright/test'

// Matches the fixed indicator label ("X.XºC / Y.YºF") that tracks the current scroll position
const indicatorText = (celsius: number) => {
  const f = (celsius * 9 / 5 + 32).toFixed(1)
  return `${celsius.toFixed(1)}ºC / ${f}ºF`
}

const indicator = (page: Page) => page.getByText(/ºC \/ /)

const openKeypad = async (page: Page) => {
  await page.getByRole('button', { name: 'Go' }).click()
  await expect(page.getByRole('button', { name: 'Go to temperature' })).toBeVisible()
}

const typeTemp = async (page: Page, value: string) => {
  for (const char of value) {
    if (char === '-') continue
    if (char === '.') {
      await page.getByRole('button', { name: 'decimal point' }).click()
    } else {
      await page.getByRole('button', { name: char, exact: true }).click()
    }
  }
  if (value.startsWith('-')) {
    await page.getByRole('button', { name: 'plus or minus' }).click()
  }
}

test('Go button opens keypad', async ({ page }) => {
  await page.goto('/')
  await openKeypad(page)
  await expect(page.getByRole('button', { name: 'Go to temperature' })).toBeVisible()
})

test('tapping backdrop closes keypad without scrolling', async ({ page }) => {
  await page.goto('/')
  await expect(indicator(page)).toHaveText(indicatorText(0))
  await openKeypad(page)
  await page.mouse.click(10, 10)
  await expect(page.getByRole('button', { name: 'Go to temperature' })).not.toBeVisible()
  await expect(indicator(page)).toHaveText(indicatorText(0))
})

test('typing a °C value and submitting scrolls to that temperature', async ({ page }) => {
  await page.goto('/')
  await openKeypad(page)
  await typeTemp(page, '54.5')
  await page.getByRole('button', { name: 'Go to temperature' }).click()
  await expect(indicator(page)).toHaveText(indicatorText(54.5), { timeout: 10000 })
})

test('typing a °F value and submitting scrolls to the correct °C position', async ({ page }) => {
  await page.goto('/')
  await openKeypad(page)
  await page.getByRole('button', { name: '°F', exact: true }).click()
  await typeTemp(page, '212')
  await page.getByRole('button', { name: 'Go to temperature' }).click()
  // 212°F = 100°C
  await expect(indicator(page)).toHaveText(indicatorText(100), { timeout: 10000 })
})

test('toggling unit converts the displayed value', async ({ page }) => {
  await page.goto('/')
  await openKeypad(page)
  await typeTemp(page, '100')
  await expect(page.getByTestId('keypad-display')).toHaveText('100')
  await page.getByRole('button', { name: '°F', exact: true }).click()
  await expect(page.getByTestId('keypad-display')).toHaveText('212')
  await page.getByRole('button', { name: '°C', exact: true }).click()
  await expect(page.getByTestId('keypad-display')).toHaveText('100')
})

test('out-of-range value disables submit and shows error', async ({ page }) => {
  await page.goto('/')
  await openKeypad(page)
  await typeTemp(page, '301')
  await expect(page.getByText('Supported range −40 to 300°C')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Go to temperature' })).toBeDisabled()
})

test('backspace removes the last digit', async ({ page }) => {
  await page.goto('/')
  await openKeypad(page)
  await typeTemp(page, '54')
  await page.getByRole('button', { name: 'backspace' }).click()
  await expect(page.getByTestId('keypad-display')).toHaveText('5')
  await page.getByRole('button', { name: 'Go to temperature' }).click()
  await expect(indicator(page)).toHaveText(indicatorText(5), { timeout: 10000 })
})

test('selected unit is remembered the next time the keypad opens', async ({ page }) => {
  await page.goto('/')
  await openKeypad(page)
  await page.getByRole('button', { name: '°F', exact: true }).click()
  await page.mouse.click(10, 10) // dismiss without submitting
  await openKeypad(page)
  // The °F toggle should already be active
  await typeTemp(page, '32')
  await page.getByRole('button', { name: 'Go to temperature' }).click()
  // 32°F = 0°C
  await expect(indicator(page)).toHaveText(indicatorText(0), { timeout: 10000 })
})

test('negative temperature scrolls to the correct position', async ({ page }) => {
  await page.goto('/')
  await openKeypad(page)
  await typeTemp(page, '-10')
  await page.getByRole('button', { name: 'Go to temperature' }).click()
  await expect(indicator(page)).toHaveText(indicatorText(-10), { timeout: 10000 })
})
