# advvvvaith

Advaith Vaithianathan's portfolio: founder of [artificial hedge](https://artificialhedge.co/).

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

## Structure

- `src/App.jsx` composes the page from `src/components/`.
- `src/content.js` holds every fact and link; sources are documented in `content-sources.md`.
- `src/lib/motion.js` sets up GSAP ScrollTrigger and Lenis smooth scrolling.
- `public/media/` holds the optimised portrait, Jack card and share image; full-size masters live in `assets-src/`.

## Vercel

Import this repository with its root directory left at the repository root. `vercel.json` configures Vite, runs `npm run build`, and serves `dist/client/`.

Contact: [wassup@advaithvaithianathan.com](mailto:wassup@advaithvaithianathan.com).
