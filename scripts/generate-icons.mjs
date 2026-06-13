// Generates the regular ("any" + apple-touch) PWA icons from assets/glyph.svg
// over a full-bleed gradient sampled from public/icons/icon-maskable-512.png.
// The maskable icon itself is hand-made and left untouched. The glyph is fuller
// than the maskable (the OS only rounds corners on these, it doesn't circle-crop)
// and the C's center sits on the icon center, matching the splash screens.
//
// Usage: node scripts/generate-icons.mjs

import { chromium } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')

const ICONS = [
  [512, 'icon-512.png'],
  [192, 'icon-192.png'],
  [180, 'apple-touch-icon-180.png'],
]
const FILL = 0.60 // glyph box width as a fraction of the icon
const Y_NUDGE = 14 / 512 // vertical offset of the glyph, fraction of icon height (+ = down)
const GLYPH_RATIO = 252 / 266 // glyph viewBox height / width

const glyph = readFileSync(resolve(root, 'assets/glyph.svg'), 'utf8')
const iconDataUrl =
  'data:image/png;base64,' +
  readFileSync(resolve(root, 'public/icons/icon-maskable-512.png')).toString('base64')

const browser = await chromium.launch({ channel: 'chrome' })
const page = await browser.newPage()

// Locate the C's center within the glyph box (the "°"+"C" render as one shape;
// the "°" is upper-left, so the C's right/bottom are the glyph's overall
// right/bottom, its top is the highest ink in the right half, its left the
// leftmost ink in the lower band).
const glyphCenter = await page.evaluate(async ({ svg, ratio }) => {
  const W = 800
  const H = Math.round(W * ratio)
  const url = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)))
  const img = new Image()
  img.src = url
  await img.decode()
  const c = document.createElement('canvas')
  c.width = W
  c.height = H
  const ctx = c.getContext('2d')
  ctx.drawImage(img, 0, 0, W, H)
  const a = ctx.getImageData(0, 0, W, H).data
  const on = (x, y) => a[(y * W + x) * 4 + 3] > 128
  let maxX = 0, maxY = 0
  const top = new Array(W).fill(-1)
  const left = new Array(H).fill(-1)
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      if (!on(x, y)) continue
      if (top[x] < 0) top[x] = y
      if (left[y] < 0) left[y] = x
      if (x > maxX) maxX = x
      if (y > maxY) maxY = y
    }
  }
  let minYc = H
  for (let x = Math.floor(0.5 * W); x < W; x++) if (top[x] >= 0 && top[x] < minYc) minYc = top[x]
  let minXc = W
  for (let y = Math.floor(0.45 * H); y <= maxY; y++) if (left[y] >= 0 && left[y] < minXc) minXc = left[y]
  return { fx: (minXc + maxX) / 2 / W, fy: (minYc + maxY) / 2 / H }
}, { svg: glyph, ratio: GLYPH_RATIO })

const stops = await page.evaluate(async (dataUrl) => {
  const img = new Image()
  img.src = dataUrl
  await img.decode()
  const c = document.createElement('canvas')
  c.width = img.width
  c.height = img.height
  const ctx = c.getContext('2d')
  ctx.drawImage(img, 0, 0)
  const N = 12
  const out = []
  for (let i = 0; i <= N; i++) {
    const y = Math.round((i / N) * (img.height - 1))
    const [r, g, b] = ctx.getImageData(4, y, 1, 1).data
    out.push(`rgb(${r},${g},${b}) ${((i / N) * 100).toFixed(2)}%`)
  }
  return out
}, iconDataUrl)

const gradient = `linear-gradient(180deg, ${stops.join(', ')})`

for (const [size, name] of ICONS) {
  const gw = Math.round(size * FILL)
  const gh = gw * GLYPH_RATIO
  const left = size / 2 - glyphCenter.fx * gw
  const top = size / 2 - glyphCenter.fy * gh + Y_NUDGE * size
  await page.setViewportSize({ width: size, height: size })
  await page.setContent(`<!doctype html><html><body style="margin:0">
    <div style="position:relative;width:${size}px;height:${size}px;background:${gradient}">
      <div style="position:absolute;left:${left}px;top:${top}px;width:${gw}px;height:${gh}px">${glyph}</div>
    </div></body></html>`)
  await page.screenshot({
    path: resolve(root, 'public/icons', name),
    clip: { x: 0, y: 0, width: size, height: size },
  })
}

console.log(`Generated ${ICONS.length} icons in public/icons/ (maskable left untouched)`)
await browser.close()
