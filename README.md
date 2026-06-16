# Celcius.Life

I built this app to have a reference when cooking and traveling… and then found it to be a fun side project to tinker with.

## Features
- **Installable [PWA](https://www.google.com/search?q=PWA)** — Add app to your home screen. The app works offline and updates automatically when a new update is available.
- **°C/°F ruler** — Celsius and Fahrenheit side by side. Scroll to any temperature.
- **Reference Markers** — common cooking/everyday temps pinned on the scale (sauna, tea, egg, chicken, salmon, steak, pizza…), some with times.
- **Go to Temp** — type a temperature and jump to it; °C/°F toggle with live conversion.

## Future Feature Ideas
- **More reference items**
    — Several cooking temps are already commented out in App.tsx (medium/well-done steak, roasts).
    - Candy-making stages (soft ball, hard crack), bread baking, and common baking temps (325°F/375°F/425°F) would round out the cooking section well.
- **Categories/Sections/Tabs/Filters** — Once there are more items, grouping them (Cooking, Weather, Body/Health, Food Safety) with visual dividers or color-coded labels would reduce cognitive load.
- Search / Text Filter of available temperature labels.
- **Fahrenheit/Celsius toggle mode** — A toggle to flip which unit is primary. Useful for users who are familiar with F or C.
- **Food safety zone highlight** — A visible "danger zone" band (40°F–140°F / 4°C–60°C) where bacteria multiply. This is a genuinely useful kitchen reference.
- **Shareable deep links** — celsius.life/#65 scrolls to 65°C. Handy for texting a cook temp to someone.
- **Dark mode** — Kitchens are often dim; a dark theme is practical.

Similar apps / sites and what they do:

- **ThermoWorks reference charts** — Static PDFs with comprehensive meat doneness tables organized by cut. Good model for thoroughness.
- **SeriousEats / ChefSteps guides** — Narrative context for each temperature ("why 65°C for chicken"). Adding a brief tooltip or footnote per item could borrow this.
- **Unit conversion apps** (e.g., ConvertPad) — They offer bidirectional F↔C input with a keypad. Useful for calculation but lack the visual/contextual reference angle your app has — that's a differentiator worth preserving.
- **Weber/Traeger grill apps** — Include timers alongside temps. A "set a timer when I reach this temp" feature is more app-like than this PWA currently is, but worth noting.

## Install App

1. Visit https://celsius.life on mobile device. (or https://celcius.life if you're like me sometimes! 🙃)
2. Install as app:
    - iOS: choose "Install on Home Screen" from the share menu.
    - Android: open the action menu (three dots at the top right) and select "Add to Home screen".

Beta test the latest build: https://master--celsius-life.netlify.app/

## Dev

Built with [React](https://react.dev) 19, [TypeScript](https://www.typescriptlang.org), [Vite](https://vite.dev), and [styled-components](https://styled-components.com). Deployed as a PWA via [Netlify](https://www.netlify.com).

**Prerequisites:** Node.js 22 (see `.nvmrc`)

### Running locally

```bash
yarn install
yarn start
```

Starts a dev server at http://localhost:5173.

### Testing

```bash
yarn test          # run unit tests once
yarn test:watch    # run unit tests in watch mode
yarn test:e2e      # run Playwright browser tests (starts the dev server itself)
```

The Playwright tests run against your locally installed Google Chrome (`channel: 'chrome'`), so no browser download is needed. `e2e/` covers real scrolling, the 0ºC button, the keypad, the Info screen, scroll restore across reloads, and scroll-locking behind modals. Remaining idea: run them against iOS Safari/WebKit to exercise real safe-area insets.

### Production build

```bash
yarn build         # type-check + bundle into dist/
yarn preview       # serve dist/ at http://localhost:4173
```

### PWA icons & splash screens

Source files:
- `assets/glyph.svg` — the white `°C` glyph (transparent), composited onto icons/splashes
- `public/icons/icon-maskable-512.png` — hand-made full-bleed gradient maskable icon; also the gradient source that the generators sample

Both generators render via your locally installed Chrome (Playwright), so no
downloads are needed:

```bash
node scripts/generate-icons.mjs    # any + apple-touch icons → public/icons/
node scripts/generate-splash.mjs   # iOS launch images → public/splashscreens/
node scripts/generate-splash.mjs --samples   # a few sizes with center guides, for tuning
```

The maskable icon is hand-made and left untouched. Tunables live at the top of
each script (`FILL`, `Y_NUDGE`, `GLYPH_SCALE`). After changing the device list in
`generate-splash.mjs`, update the matching `apple-touch-startup-image` `<link>`
media queries in `index.html`.

### Branches

| Branch | Deploys to |
|--------|-----------|
| `production` | https://celsius.life |
| `master` | https://master--celsius-life.netlify.app |
