# Celcius.Life

I built this app to have a reference when cooking and traveling… and then found it to be a fun side project to tinker with.

## Install App

1. Visit https://celsius.life on mobile device.
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
