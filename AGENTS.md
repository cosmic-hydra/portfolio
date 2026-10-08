# Prototype Instructions

The portfolio belongs to Advaith Vaithianathan and uses the brand `advvvvaith`. Contact email is `wassup@advaithvaithianathan.com`. Ground biographical facts in his public LinkedIn profile, artificialhedge.co and linked first-party projects (see `content-sources.md`). Avoid unsupported performance metrics, benchmark scores, superiority claims and follower counts. Don't invent hobbies, milestones or achievements.

## Design direction (2026-10-08)

The user asked for an "insanely good" redesign inspired by paulkalkbrenner.net, pxpush.com and artemartemartem.com, with **priority on artificial hedge**. This replaced the earlier NBNZIA/Webflow mirror, which was removed. The current system:

- Swiss grid with hairlines and tiny mono labels (Kalkbrenner), giant condensed type and marquees with dot separators (PX PUSH), heavy condensed lowercase display (artem).
- Palette: ink `#0b0b0b`, paper `#efeee9`, artificial hedge orange `#ff571a`. Sections alternate paper / ink / orange; pixel-block transitions (`PixelEdge`) join some of them.
- Type: Inter Tight (grotesk), Archivo at `font-stretch: 62%` (condensed display), JetBrains Mono (labels). All self-hosted via Fontsource.
- Hero: full name fitted edge to edge with the portrait inline; scrolling zooms the portrait to full height. The real portrait appears in the hero (and the share image) only.
- artificial hedge is the first and largest chapter: marquee, generative pixel "hedge" canvas, the fx series (fx-1, fx-1 lite, dipcatcher) with specs as published on artificialhedge.co, and the source → reasoning → output flow.
- Section order: hero, principle, artificial hedge, research, selected work, trajectory, contact.

## Professional pass (2026-10-08)

The user asked to **remove the Jack of all trades section** and make the site more professional with more effects. The Jack card and the record table were removed; dated milestones now live in a pinned, horizontally scrolling `Trajectory` section (vertical on phones). Copy is restrained and businesslike: no playful headlines, labels numbered nº 001–006. Effects: custom square cursor with contextual labels and magnetic buttons (fine pointers only), decoding section labels, letter-roll link hovers, model-card spotlight, scroll-filled architecture diagram, velocity skew on project names, nav progress bar and active section, film grain, pixel reveal on the hero portrait. Do not reintroduce the Jack card unless asked; if it ever returns, never put his face on it.

## Code

React + Vite. `src/App.jsx` composes sections from `src/components/`; content lives in `src/content.js`; motion helpers (GSAP ScrollTrigger + Lenis) are in `src/lib/motion.js`. Every animation must respect `prefers-reduced-motion` and the layout must stay readable on phones.

Run the local server yourself and open the preview in the browser available to this environment. Do not give the user server-start instructions when you can run it. When the user gives durable design feedback, preferences or decisions, record them here.

Keep `.openai/hosting.json`, `worker/index.js`, `scripts/prepare-sites-build.mjs` and `tests/sites-worker.test.mjs` intact so the same site can be handed to Sites. Before a Sites handoff, run `npm run build` and `npm run test:sites`; the build must leave `dist/client/index.html`, `dist/server/index.js` and `dist/.openai/hosting.json`.
