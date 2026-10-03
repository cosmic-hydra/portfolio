# advvvvaith

Advaith Vaithianathan's portfolio, with local images, fonts, and animation assets.

## Development

```sh
npm install
npm run dev
```

## Production build

```sh
npm run build
```

The build produces the website in `dist/client/` and the optional Sites worker in `dist/server/`.

## Vercel

Import this repository with its root directory left at the repository root. `vercel.json` configures Vite, runs `npm run build`, and serves `dist/client/`, where the website's `index.html` and assets are generated.

The React entry point is `src/App.jsx`; the portfolio markup is in `src/portfolio.html`. Assets live in `public/assets/`. Content sources are documented in `content-sources.md`.

Contact: [wassup@advaithvaithianathan.com](mailto:wassup@advaithvaithianathan.com).
