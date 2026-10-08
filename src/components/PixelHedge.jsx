import { useEffect, useRef } from 'react';
import { fitCanvas, reducedMotion, rng, whileVisible } from '../lib/motion.js';
import { createHedgeGL } from './hedgeGL.js';

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

// Renders the hedge with WebGL when available (wind, cursor repulsion, click ripples),
// falling back to a simpler 2D canvas.
export function PixelHedge({ className = '', seed = 11 }) {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    const host = canvas.parentElement;
    const still = reducedMotion();
    let state = null;
    let renderer = null;
    let start = 0;
    const pointer = { x: -1e4, y: -1e4, tx: -1e4, ty: -1e4, force: 0, inside: false };
    const pulse = { x: -1e4, y: -1e4, t: -100 };

    const setup = () => {
      const { width, height, dpr } = fitCanvas(canvas, 2, false);
      // Skip transient zero or runaway sizes (e.g. mid-resize) rather than allocating for them.
      if (!width || !height || width * height > 16e6) return;
      const mobile = width < 760;
      const cell = mobile ? 6 : 7;
      const cols = Math.ceil(width / cell);
      const rows = Math.ceil(height / cell);
      state = { width, height, dpr, cell, cols, rows, ...growHedge(cols, rows, seed, mobile) };
      if (!renderer) renderer = createHedgeGL(canvas) ?? create2D(canvas);
      renderer.load(state);
    };

    const frame = (now) => {
      if (!state || !renderer) return;
      if (!start) start = now;
      const p = still ? 1 : Math.min(1, (now - start) / GROW_MS);
      const grow = (1 - Math.pow(1 - p, 2.2)) * (state.maxT + 6);
      pointer.force += ((pointer.inside ? 1 : 0) - pointer.force) * 0.08;
      pointer.x += (pointer.tx - pointer.x) * 0.2;
      pointer.y += (pointer.ty - pointer.y) * 0.2;
      renderer.draw({ grow, time: still ? 0 : now / 1000, pointer, pulse });
    };

    setup();
    const ro = new ResizeObserver(() => {
      setup();
      if (start) start = performance.now() - GROW_MS;
      if (still) frame(performance.now());
    });
    ro.observe(canvas);

    const local = (e) => {
      const r = canvas.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    };
    const onMove = (e) => {
      const { x, y } = local(e);
      if (!pointer.inside) {
        pointer.x = x;
        pointer.y = y;
      }
      pointer.tx = x;
      pointer.ty = y;
      pointer.inside = true;
    };
    const onLeave = () => (pointer.inside = false);
    const onDown = (e) => {
      if (e.target.closest('a, button')) return;
      const { x, y } = local(e);
      Object.assign(pulse, { x, y, t: performance.now() / 1000 });
    };
    host.addEventListener('pointermove', onMove);
    host.addEventListener('pointerleave', onLeave);
    host.addEventListener('pointerdown', onDown);
    const stop = still ? (frame(performance.now()), () => {}) : whileVisible(canvas, frame);

    return () => {
      ro.disconnect();
      stop();
      renderer?.dispose();
      host.removeEventListener('pointermove', onMove);
      host.removeEventListener('pointerleave', onLeave);
      host.removeEventListener('pointerdown', onDown);
    };
  }, [seed]);

  return <canvas ref={ref} className={`pixel-hedge ${className}`} aria-hidden="true" />;
}

// Fallback renderer: the same hedge, drawn cell by cell, lit around the pointer.
function create2D(canvas) {
  let s = null;
  return {
    load(state) {
      s = state;
    },
    draw({ grow, pointer }) {
      const ctx = canvas.getContext('2d');
      ctx.setTransform(s.dpr, 0, 0, s.dpr, 0, 0);
      ctx.clearRect(0, 0, s.width, s.height);
      const size = s.cell - 1;
      const R = s.cell * 16;
      for (const c of s.cells) {
        if (c.t > grow) break;
        const cx = c.x * s.cell;
        const cy = c.y * s.cell;
        const d = Math.hypot(cx - pointer.x, cy - pointer.y);
        const lit = d < R ? (1 - d / R) * pointer.force : 0;
        ctx.globalAlpha = Math.max(c.alpha, lit);
        ctx.fillStyle = lit > 0.4 || grow - c.t < 5 ? '#fff1ea' : c.color;
        ctx.fillRect(cx, cy, size, size);
      }
      ctx.globalAlpha = 1;
    },
    dispose() {},
  };
}
