// Generates full-bleed gradient iOS splash screens with a centered glyph.
// The vertical gradient is sampled from public/icons/icon-maskable-512.png so
// the splash matches the app icon; the glyph (assets/glyph.svg, white on
// transparent) is composited on top — undistorted — at each device resolution,
// positioned so the C's center sits on the canvas center.
//
// Usage:
//   node scripts/generate-splash.mjs            # full set → public/splashscreens
//   node scripts/generate-splash.mjs --samples  # a few sizes w/ guides → assets/splash-samples

import { chromium } from '@playwright/test'
import { readFileSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')

// device-width device-height ratio (portrait) → pixel W×H = dw*r × dh*r
const DEVICES = [
  [320, 568, 2], [375, 667, 2], [414, 736, 3], [375, 812, 3],
  [360, 780, 3], [414, 896, 2], [414, 896, 3], [390, 844, 3],
  [393, 852, 3], [428, 926, 3], [430, 932, 3], [402, 874, 3],
  [440, 956, 3], [768, 1024, 2], [834, 1194, 2], [1024, 1366, 2],
]
const SAMPLE_SIZES = [[1290, 2796], [750, 1334], [1536, 2048]]
const GLYPH_SCALE = 0.45 // glyph width as a fraction of the short edge
const GLYPH_RATIO = 252 / 266 // glyph viewBox height / width

const samples = process.argv.slice(2).includes('--samples')
const glyph = readFileSync(resolve(root, 'assets/glyph.svg'), 'utf8')
const iconDataUrl =
  'data:image/png;base64,' +
  readFileSync(resolve(root, 'public/icons/icon-maskable-512.png')).toString('base64')

const browser = await chromium.launch({ channel: 'chrome' })
const page = await browser.newPage()

// Find the C's center as a fraction of the glyph box. The "°" and "C" render
// as one connected shape, so we locate the C geometrically: the "°" sits in the
// upper-left, so the C's right/bottom edges are the glyph's overall right/bottom,
// the C's top is the highest ink in the right half (no "°" there), and the C's
// left is the leftmost ink in the lower band (below the "°").
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
  const top = new Array(W).fill(-1) // topmost ink y per column
  const left = new Array(H).fill(-1) // leftmost ink x per row
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      if (!on(x, y)) continue
      if (top[x] < 0) top[x] = y
      if (left[y] < 0) left[y] = x
      if (x > maxX) maxX = x
      if (y > maxY) maxY = y
    }
  }
  let minYc = H // C top: highest ink in the right half (clear of the degree sign)
  for (let x = Math.floor(0.5 * W); x < W; x++) if (top[x] >= 0 && top[x] < minYc) minYc = top[x]
  let minXc = W // C left: leftmost ink in the lower band (below the degree sign)
  for (let y = Math.floor(0.45 * H); y <= maxY; y++) if (left[y] >= 0 && left[y] < minXc) minXc = left[y]

  return { fx: (minXc + maxX) / 2 / W, fy: (minYc + maxY) / 2 / H }
}, { svg: glyph, ratio: GLYPH_RATIO })

// Sample the icon's vertical gradient ramp from its left edge (pure gradient)
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

const render = async (w, h, outDir, guides = false) => {
  const iconW = Math.round(Math.min(w, h) * GLYPH_SCALE)
  const iconH = iconW * GLYPH_RATIO
  // Place the glyph so the C's center sits exactly on the canvas center
  const left = w / 2 - glyphCenter.fx * iconW
  const top = h / 2 - glyphCenter.fy * iconH
  const guideMarkup = guides
    ? `<div style="position:absolute;left:50%;top:0;width:1px;height:100%;background:rgba(0,80,255,.6)"></div>
       <div style="position:absolute;left:0;top:50%;width:100%;height:1px;background:rgba(0,80,255,.6)"></div>`
    : ''
  await page.setViewportSize({ width: w, height: h })
  await page.setContent(`<!doctype html><html><body style="margin:0">
    <div style="position:relative;width:${w}px;height:${h}px;background:${gradient}">
      <div style="position:absolute;left:${left}px;top:${top}px;width:${iconW}px;height:${iconH}px">${glyph}</div>
      ${guideMarkup}
    </div></body></html>`)
  await page.screenshot({ path: resolve(outDir, `splash-${w}x${h}.png`), clip: { x: 0, y: 0, width: w, height: h } })
}

if (samples) {
  const outDir = resolve(root, 'assets/splash-samples')
  mkdirSync(outDir, { recursive: true })
  for (const [w, h] of SAMPLE_SIZES) await render(w, h, outDir, true)
  console.log(`C center fraction: fx=${glyphCenter.fx.toFixed(4)} fy=${glyphCenter.fy.toFixed(4)}`)
  console.log('Samples written to assets/splash-samples/')
} else {
  const outDir = resolve(root, 'public/splashscreens')
  for (const [dw, dh, r] of DEVICES) await render(dw * r, dh * r, outDir)
  console.log(`Generated ${DEVICES.length} splash images in public/splashscreens/`)
}

await browser.close()
