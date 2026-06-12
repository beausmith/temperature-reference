# Celcius.Life

I built this app to have a reference when cooking and traveling… and then found it to be a fun side project to tinker with.

## Future Feature Ideas

- ✅ Re-opening app restores temperature / scroll position.
- **More reference items**
    — Several cooking temps are already commented out in App.tsx (medium/well-done steak, roasts).
    - Candy-making stages (soft ball, hard crack), bread baking, and common baking temps (325°F/375°F/425°F) would round out the cooking section well.
- **Categories/Sections/Tabs/Filters** — Once there are more items, grouping them (Cooking, Weather, Body/Health, Food Safety) with visual dividers or color-coded labels would reduce cognitive load.
- **Jump-to / Search / Text Filter** — A text input that scrolls to a typed temperature. Useful when you need a specific temp fast.
- **Fahrenheit/Celsius toggle mode** — A toggle to flip which unit is primary. Useful for users who are familiar with F or C.
- **Food safety zone highlight** — A visible "danger zone" band (40°F–140°F / 4°C–60°C) where bacteria multiply. This is a genuinely useful kitchen reference.
- **Shareable deep links** — celsius.life/#65 scrolls to 65°C. Handy for texting a cook temp to someone.
- **Dark mode** — Kitchens are often dim; a dark theme is practical.
- **Playwright (browser) tests** — Cover the behaviors jsdom can't: real scrolling and layout, the indicator updating while scrolling, the smooth-scroll 0ºC button, and scroll restore across an actual page reload.

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
yarn test          # run tests once
yarn test:watch    # run tests in watch mode
```

### Production build

```bash
yarn build         # type-check + bundle into dist/
yarn preview       # serve dist/ at http://localhost:4173
```

### Branches

| Branch | Deploys to |
|--------|-----------|
| `production` | https://celsius.life |
| `master` | https://master--celsius-life.netlify.app |
