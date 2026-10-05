# Prototype Instructions

The portfolio belongs to Advaith Vaithianathan and uses the brand `advvvvaith`. Contact email is `wassup@advaithvaithianathan.com`. The user preferred the original NBNZIA-based portfolio and explicitly reverted the editorial redesign. Preserve the full portrait hero, large typography, motion and colored project panels. Ground biographical facts in his public LinkedIn profile and linked first-party projects. Avoid unsupported performance metrics or presenting the reference site's clients as his work. The active portfolio is `src/portfolio.html`, displayed by `src/App.jsx`.

On 2026-10-05 the user requested a much more intense, personal portfolio with substantial animation and graphics, and a playing card expressing "jack of all trades." Extend the preferred portrait-led layout with this identity; make the range across AI, capital, astronomy, molecular science and climate feel connected. The user explicitly said **do not put his face on the playing cards**. Use a traditional illustrated Jack with no resemblance to Advaith; his real portrait belongs in the hero only. The user supplied no additional personal life details, so avoid inventing hobbies, milestones or achievements. Keep motion purposeful, support reduced motion, and preserve mobile readability. The bespoke Jack artwork is `public/assets/portfolio/jack-of-all-trades-v2.png`; enhancement code and styles live in `src/soul*.js` and `src/soul*.css`. `scripts/personalize-portfolio.py` and `scripts/enrich-portfolio.py` regenerate the active markup.

Run the local server yourself and open the preview in the browser available to this environment. Do not give the user server-start instructions when you can run it.

Before making substantial visual changes, use the Product Design plugin's `get-context` skill when the visual source is unclear or no longer matches the current goal. When the user gives durable prototype-specific design feedback, preferences, or decisions, record them in `AGENTS.md`.

When implementing from a selected generated mock, treat that image as the source of truth for layout, component anatomy, density, spacing, color, typography, visible content, and hierarchy.

Build app UI in `src/`. Keep `.openai/hosting.json`, `worker/index.js`, `scripts/prepare-sites-build.mjs`, and `tests/sites-worker.test.mjs` intact so the same local prototype can be handed to Sites. Before a Sites handoff, run `npm run build` and `npm run test:sites`; the build must leave `dist/client/index.html`, `dist/server/index.js`, and `dist/.openai/hosting.json`.
