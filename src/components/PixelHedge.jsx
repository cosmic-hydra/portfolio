import { useEffect, useRef } from 'react';
import { fitCanvas, reducedMotion, rng, whileVisible } from '../lib/motion.js';

const PALETTE = ['#ff571a', '#ff571a', '#e9480f', '#c93c0b', '#ff7a45', '#a8320a'];
const SPARK = ['#ffd5c2', '#ffb08a', '#fff3ec'];
const GROW_MS = 2600;

// Grows a branching "hedge" on a pixel grid. Each cell records when it was born,
// so the tree can be revealed over time.
function growHedge(cols, rows, seed, mobile) {
  const rand = rng(seed);
  const born = new Float32Array(cols * rows).fill(Infinity);
  const kind = new Uint8Array(cols * rows);
  let budget = 60000;

  const mark = (x, y, t, k) => {
    const ix = Math.round(x);
    const iy = Math.round(y);
    if (ix < 0 || iy < 0 || ix >= cols || iy >= rows) return;
    const i = iy * cols + ix;
    if (t < born[i]) born[i] = t;
    if (k > kind[i]) kind[i] = k;
  };

  const branch = (x, y, angle, len, width, t, depth) => {
    let a = angle;
    const steps = Math.max(4, Math.round(len));
    for (let s = 0; s < steps && budget > 0; s++, budget--) {
      a += (rand() - 0.5) * 0.22;
      a += (-Math.PI / 2 - a) * 0.01;
      x += Math.cos(a);
      y += Math.sin(a);
      const w = Math.max(0.6, width * (1 - (s / steps) * 0.55));
      const nx = Math.cos(a + Math.PI / 2);
      const ny = Math.sin(a + Math.PI / 2);
      for (let d = -w / 2; d <= w / 2; d += 0.6) mark(x + nx * d, y + ny * d, t + s, 1);
      if (depth > 0 && s > steps * 0.3 && rand() < 0.045) {
        const side = rand() < 0.5 ? -1 : 1;
        branch(x, y, a + side * (0.45 + rand() * 0.55), len * (0.38 + rand() * 0.25), w * 0.62, t + s, depth - 2);
      }
    }
    for (let k = 0; k < 5 + depth * 2; k++) {
      mark(x + (rand() - 0.5) * (8 + depth * 2), y + (rand() - 0.5) * (8 + depth * 2), t + steps + rand() * 14, 2);
    }
    if (depth > 0) {
      branch(x, y, a - 0.32 - rand() * 0.38, len * (0.52 + rand() * 0.14), width * 0.62, t + steps, depth - 1);
      branch(x, y, a + 0.32 + rand() * 0.38, len * (0.52 + rand() * 0.14), width * 0.62, t + steps, depth - 1);
    }
  };

  if (mobile) {
    branch(cols * 0.55, rows + 2, -Math.PI / 2 - 0.12, rows * 0.36, 4.5, 0, 5);
  } else {
    branch(cols * 0.68, rows + 2, -Math.PI / 2 - 0.22, rows * 0.4, 5.5, 0, 6);
    branch(cols * 0.9, rows + 2, -Math.PI / 2 + 0.28, rows * 0.26, 3.5, 18, 5);
  }

  const cells = [];
  let maxT = 0;
  for (let i = 0; i < born.length; i++) {
    if (born[i] === Infinity) continue;
    const r = rand();
    cells.push({
      x: i % cols,
      y: (i / cols) | 0,
      t: born[i],
      color: kind[i] === 2 ? SPARK[(r * SPARK.length) | 0] : PALETTE[(r * PALETTE.length) | 0],
      alpha: kind[i] === 2 ? 0.45 + r * 0.5 : 0.7 + r * 0.3,
    });
    maxT = Math.max(maxT, born[i]);
  }
  cells.sort((a, b) => a.t - b.t);
  return { cells, born, maxT };
}

export function PixelHedge({ className = '', seed = 11 }) {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    const still = reducedMotion();
    let state = null;
    let pointer = { x: -1e4, y: -1e4 };
    let start = 0;
    let base = null;

    const setup = () => {
      const fit = fitCanvas(canvas);
      const mobile = fit.width < 760;
      const cell = mobile ? 6 : 7;
      const cols = Math.ceil(fit.width / cell);
      const rows = Math.ceil(fit.height / cell);
      state = { ...fit, cell, cols, rows, ...growHedge(cols, rows, seed, mobile) };
      base = null;
      if (still) paint(Infinity);
    };

    const drawCells = (ctx, upto, cell, now) => {
      const { cells } = state;
      const size = cell - 1;
      for (let i = 0; i < cells.length; i++) {
        const c = cells[i];
        if (c.t > upto) break;
        const fresh = upto - c.t < 5;
        ctx.globalAlpha = fresh ? 1 : c.alpha;
        ctx.fillStyle = fresh ? '#fff1ea' : c.color;
        ctx.fillRect(c.x * cell, c.y * cell, size, size);
      }
      ctx.globalAlpha = 1;
    };

    const paint = (now) => {
      if (!state) return;
      const { ctx, width, height, cell, maxT, cells } = state;
      if (!start) start = now;
      const p = still ? 1 : Math.min(1, (now - start) / GROW_MS);
      const upto = (1 - Math.pow(1 - p, 2.2)) * (maxT + 6);

      if (p < 1 || !base) {
        ctx.clearRect(0, 0, width, height);
        drawCells(ctx, upto, cell, now);
        if (p >= 1) {
          base = document.createElement('canvas');
          base.width = canvas.width;
          base.height = canvas.height;
          base.getContext('2d').drawImage(canvas, 0, 0);
        }
        return;
      }

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(base, 0, 0);
      ctx.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);

      // Twinkle a handful of cells.
      const size = cell - 1;
      const n = Math.min(160, cells.length);
      const seedT = Math.floor(now / 90);
      for (let k = 0; k < n; k++) {
        const c = cells[(seedT * 7919 + k * 104729) % cells.length];
        ctx.globalAlpha = 0.5 + 0.5 * Math.sin(now / 240 + k);
        ctx.fillStyle = k % 3 ? '#ffb08a' : '#0b0b0b';
        ctx.fillRect(c.x * cell, c.y * cell, size, size);
      }

      // Light up the cells around the pointer.
      const { born, cols, rows } = state;
      const R = 13;
      const px = Math.round(pointer.x / cell);
      const py = Math.round(pointer.y / cell);
      for (let y = Math.max(0, py - R); y <= Math.min(rows - 1, py + R); y++) {
        for (let x = Math.max(0, px - R); x <= Math.min(cols - 1, px + R); x++) {
          const d = Math.hypot(x - px, y - py) / R;
          if (d > 1) continue;
          const lit = born[y * cols + x] !== Infinity;
          if (!lit && (x + y + seedT) % 9) continue;
          ctx.globalAlpha = (1 - d) * (lit ? 1 : 0.35);
          ctx.fillStyle = lit ? '#fff1ea' : '#ff571a';
          ctx.fillRect(x * cell, y * cell, size, size);
        }
      }
      ctx.globalAlpha = 1;
    };

    setup();
    const ro = new ResizeObserver(() => {
      setup();
      start = start ? performance.now() - GROW_MS : 0;
    });
    ro.observe(canvas);
    const onMove = (e) => {
      const r = canvas.getBoundingClientRect();
      pointer = { x: e.clientX - r.left, y: e.clientY - r.top };
    };
    const onLeave = () => (pointer = { x: -1e4, y: -1e4 });
    const host = canvas.parentElement;
    host.addEventListener('pointermove', onMove);
    host.addEventListener('pointerleave', onLeave);
    const stop = still ? () => {} : whileVisible(canvas, paint);

    return () => {
      ro.disconnect();
      stop();
      host.removeEventListener('pointermove', onMove);
      host.removeEventListener('pointerleave', onLeave);
    };
  }, [seed]);

  return <canvas ref={ref} className={`pixel-hedge ${className}`} aria-hidden="true" />;
}
