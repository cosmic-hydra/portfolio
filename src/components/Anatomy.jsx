import { useEffect, useLayoutEffect, useRef } from 'react';
import { fitCanvas, gsap, reducedMotion, rng, whileVisible } from '../lib/motion.js';
import { Scramble } from './ui.jsx';

// A pinned scene that turns fx-1's published specs into a picture: 3.4T parameters as a
// grid of cells, then ~128B of them (about 4%) lighting up for each token, then fx-1 lite.
// Which cells activate is illustrative; only the proportions come from the specs.

const COLS = 48;
const ROWS = 32;
const BLOCK = 2;
const BC = COLS / BLOCK;
const BR = ROWS / BLOCK;
const BLOCKS = BC * BR;
const LITE_BLOCKS = Math.round((BLOCKS * 2.4) / 3.4);
const ACTIVE_FX1 = Math.round((BLOCKS * 128) / 3400);
const ACTIVE_LITE = Math.round((LITE_BLOCKS * 49) / 2400);
const STRIP = 4;
const TOKEN_MS = 260;
const TOKEN_LIFE = 1500;
const FILL_END = 0.28;
const ROUTE_AT = 0.3;
const LITE_AT = 0.66;

const steps = [
  {
    big: <><span className="anatomy__count">3.4</span>T</>,
    kicker: 'fx-1 · total parameters',
    text: 'Each cell stands for about 2.2 billion parameters. Together they make fx-1, the frontier model in the fx series.',
  },
  {
    big: <>~128B</>,
    kicker: 'fx-1 · active per token',
    text: 'For every token, only about 4% of the network is active. Watch each token light up its own small slice of the grid.',
  },
  {
    big: <>fx-1 lite</>,
    kicker: '2.4T total · ~49B active',
    text: 'The economy model keeps the same finance and maths focus with a smaller network, and about 2% of it active per token.',
  },
];

function buildBlocks() {
  const rand = rng(17);
  const blocks = Array.from({ length: BLOCKS }, (_, i) => ({
    bx: i % BC,
    by: Math.floor(i / BC),
    key: (i % BC) + rand() * 4,
    activeAt: -1e9,
  }));
  [...blocks].sort((a, b) => a.key - b.key).forEach((b, order) => (b.order = order));
  return blocks;
}

export function Anatomy() {
  const ref = useRef(null);
  const canvasRef = useRef(null);
  const progressRef = useRef(reducedMotion() ? 0.5 : 0);

  useLayoutEffect(() => {
    if (reducedMotion()) return undefined;
    const root = ref.current;
    const ctx = gsap.context(() => {
      const count = root.querySelector('.anatomy__count');
      count.textContent = '0.0';
      const pips = root.querySelectorAll('.anatomy__pip');
      const tl = gsap.timeline({
        defaults: { ease: 'power2.inOut', duration: 0.06 },
        scrollTrigger: {
          trigger: root,
          start: 'top top',
          end: () => `+=${window.innerHeight * 2.4}`,
          pin: true,
          scrub: 0.5,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const p = self.progress;
            progressRef.current = p;
            count.textContent = (3.4 * Math.min(1, p / FILL_END)).toFixed(1);
            const step = p < ROUTE_AT ? 0 : p < LITE_AT ? 1 : 2;
            pips.forEach((pip, i) => pip.classList.toggle('is-on', i <= step));
          },
        },
      });
      const items = gsap.utils.toArray('.anatomy__step', root);
      gsap.set(items.slice(1), { autoAlpha: 0, yPercent: 30 });
      tl.to(items[0], { autoAlpha: 0, yPercent: -30 }, ROUTE_AT - 0.03)
        .to(items[1], { autoAlpha: 1, yPercent: 0 }, ROUTE_AT)
        .to(items[1], { autoAlpha: 0, yPercent: -30 }, LITE_AT - 0.03)
        .to(items[2], { autoAlpha: 1, yPercent: 0 }, LITE_AT)
        .to({}, { duration: 1 - LITE_AT - 0.06 });
    }, root);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const blocks = buildBlocks();
    const byOrder = [...blocks].sort((a, b) => a.order - b.order);
    const rand = rng(29);
    let dims = null;
    let tokens = [];
    let lastToken = 0;
    let routes = [];

    const resize = () => {
      dims = fitCanvas(canvas);
      dims.cell = dims.width / COLS;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const route = (now, pool, n) => {
      const picked = [];
      while (picked.length < n) {
        const b = pool[Math.floor(rand() * pool.length)];
        if (!picked.includes(b)) picked.push(b);
      }
      picked.forEach((b) => (b.activeAt = now));
      routes = picked;
    };

    const draw = (now) => {
      const { ctx, width, height, cell } = dims;
      const p = progressRef.current;
      const visible = Math.floor(Math.min(1, p / FILL_END) * BLOCKS);
      const lite = gsap.utils.clamp(0, 1, (p - LITE_AT) / 0.08);
      const routing = p >= ROUTE_AT;
      ctx.clearRect(0, 0, width, height);

      // Tokens enter along the strip; each one is routed to a handful of blocks.
      if (routing && now - lastToken > TOKEN_MS) {
        lastToken = now;
        tokens.push(now);
        const pool = lite > 0.5 ? byOrder.slice(0, LITE_BLOCKS) : byOrder;
        route(now, pool, lite > 0.5 ? ACTIVE_LITE : ACTIVE_FX1);
      }
      tokens = tokens.filter((t) => now - t < TOKEN_LIFE);
      ctx.fillStyle = 'rgba(244,244,242,0.14)';
      ctx.fillRect(0, cell * 2.6, width, 1);
      tokens.forEach((t) => {
        const age = (now - t) / TOKEN_LIFE;
        ctx.fillStyle = now - t < TOKEN_MS ? '#ff571a' : `rgba(244,244,242,${0.5 * (1 - age)})`;
        ctx.fillRect(age * width, cell * 0.6, cell * 1.4, cell * 1.4);
      });
      if (!routing) {
        ctx.fillStyle = 'rgba(244,244,242,0.35)';
        ctx.font = `500 ${Math.max(9, cell * 0.75)}px "JetBrains Mono Variable", monospace`;
        ctx.fillText('TOKENS →', 0, cell * 1.8);
      }

      const top = STRIP * cell;
      const size = cell - Math.max(1, cell * 0.14);
      for (const b of blocks) {
        if (b.order >= visible) continue;
        const gone = b.order >= LITE_BLOCKS ? lite : 0;
        const heat = Math.max(0, 1 - (now - b.activeAt) / 300);
        const fresh = !routing && visible - b.order < 14;
        for (let j = 0; j < BLOCK * BLOCK; j++) {
          const x = (b.bx * BLOCK + (j % BLOCK)) * cell;
          const y = top + (b.by * BLOCK + Math.floor(j / BLOCK)) * cell;
          if (gone > 0) {
            ctx.strokeStyle = `rgba(244,244,242,${0.12 * gone})`;
            ctx.strokeRect(x + 0.5, y + 0.5, size - 1, size - 1);
          }
          if (heat > 0 && gone < 0.5) {
            ctx.fillStyle = heat > 0.75 ? '#ffd5c2' : `rgba(255,87,26,${0.35 + heat * 0.65})`;
          } else if (fresh) {
            ctx.fillStyle = 'rgba(244,244,242,0.85)';
          } else {
            ctx.fillStyle = `rgba(244,244,242,${(routing ? 0.1 : 0.22) * (1 - gone)})`;
          }
          ctx.fillRect(x, y, size, size);
        }
      }

      // Routing lines from the newest token down to the blocks it woke up.
      const newest = tokens.at(-1);
      if (routing && newest !== undefined) {
        const age = (now - newest) / 380;
        if (age < 1) {
          const tx = ((now - newest) / TOKEN_LIFE) * width + cell * 0.7;
          ctx.strokeStyle = `rgba(255,87,26,${0.4 * (1 - age)})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          routes.forEach((b) => {
            ctx.moveTo(tx, cell * 2);
            ctx.lineTo((b.bx + 0.5) * BLOCK * cell, top + (b.by + 0.5) * BLOCK * cell);
          });
          ctx.stroke();
        }
      }
    };

    if (reducedMotion()) {
      route(1000, byOrder, ACTIVE_FX1);
      draw(1100);
      return () => ro.disconnect();
    }
    const stop = whileVisible(canvas, draw);
    return () => {
      ro.disconnect();
      stop();
    };
  }, []);

  return (
    <section className={`anatomy ${reducedMotion() ? 'is-static' : ''}`} ref={ref} aria-labelledby="anatomy-title">
      <div className="anatomy__copy">
        <span className="label">
          <span className="sq sq--orange" aria-hidden="true" />
          <Scramble text="nº 002.1 — inside the fx series" />
        </span>
        <h3 className="anatomy__title" id="anatomy-title">
          inside fx-1<span className="accent">.</span>
        </h3>
        <div className="anatomy__steps">
          {steps.map((s, i) => (
            <div className="anatomy__step" key={s.kicker}>
              <span className="label label--dim">0{i + 1} / {s.kicker}</span>
              <span className="anatomy__big">{s.big}</span>
              <p>{s.text}</p>
            </div>
          ))}
        </div>
        <div className="anatomy__pips" aria-hidden="true">
          {steps.map((s, i) => (
            <span className="anatomy__pip" key={s.kicker}>
              <i />0{i + 1}
            </span>
          ))}
        </div>
      </div>
      <figure className="anatomy__viz">
        <canvas ref={canvasRef} aria-hidden="true" />
        <figcaption className="label label--dim">
          fig. 02.1 — 1 cell ≈ 2.2B parameters. Proportions follow the published specs; which
          cells activate is illustrative.
        </figcaption>
      </figure>
    </section>
  );
}
