import { useEffect, useRef } from 'react';
import { reducedMotion, rng, whileVisible } from '../lib/motion.js';

const W = 120;
const H = 80;
const ORANGE = '#ff571a';
const PALE = '#ffb08a';
const INK = '#0b0b0b';

// All art is drawn on a tiny grid and scaled up without smoothing, so it reads as pixels.
const px = (g, x, y, c) => {
  g.fillStyle = c;
  g.fillRect(Math.round(x), Math.round(y), 1, 1);
};

const line = (g, x0, y0, x1, y1, c, step = 1) => {
  const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0));
  for (let i = 0; i <= n; i += step) px(g, x0 + ((x1 - x0) * i) / n, y0 + ((y1 - y0) * i) / n, c);
};

const scenes = {
  agents(g, t, rand) {
    const cx = W / 2;
    const cy = H / 2;
    const nodes = Array.from({ length: 10 }, (_, i) => {
      const a = (i / 10) * Math.PI * 2 + t * 0.00012;
      const r = i % 2 ? 30 : 22;
      return [cx + Math.cos(a) * r * 1.45, cy + Math.sin(a) * r];
    });
    nodes.forEach(([x, y], i) => {
      line(g, cx, cy, x, y, '#7a2c0c', 2);
      const [nx, ny] = nodes[(i + 3) % nodes.length];
      if (i % 3 === 0) line(g, x, y, nx, ny, '#55200a', 3);
      const p = ((t * 0.0006 + i * 0.13) % 1 + 1) % 1;
      g.fillStyle = PALE;
      g.fillRect(Math.round(cx + (x - cx) * p) - 1, Math.round(cy + (y - cy) * p), 2, 2);
    });
    nodes.forEach(([x, y], i) => {
      g.fillStyle = i % 4 === 0 ? PALE : ORANGE;
      g.fillRect(Math.round(x) - 2, Math.round(y) - 2, 4, 4);
    });
    g.fillStyle = '#fff1ea';
    g.fillRect(cx - 4, cy - 4, 8, 8);
  },

  stars(g, t, rand) {
    for (let i = 0; i < 90; i++) {
      const x = rand() * W;
      const y = rand() * H;
      const tw = Math.sin(t * 0.003 + i) > 0.6;
      px(g, x, y, tw ? '#ffffff' : '#5a3a2e');
    }
    const cx = W * 0.42;
    const cy = H * 0.5;
    for (let arm = 0; arm < 2; arm++) {
      for (let i = 0; i < 150; i++) {
        const r = i * 0.2;
        const a = i * 0.075 + arm * Math.PI + t * 0.00025;
        px(g, cx + Math.cos(a) * r * 1.4 + (rand() - 0.5) * 2, cy + Math.sin(a) * r * 0.7 + (rand() - 0.5) * 2, i < 40 ? '#fff1ea' : i % 2 ? ORANGE : '#a8320a');
      }
    }
    // Classification bracket hops between targets.
    const k = Math.floor(t / 1600) % 3;
    const targets = [
      [cx, cy, 20],
      [W * 0.82, H * 0.28, 7],
      [W * 0.78, H * 0.76, 6],
    ];
    const [bx, by, s] = targets[k];
    const c = PALE;
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([dx, dy]) => {
      line(g, bx + dx * s, by + dy * s, bx + dx * (s - 3), by + dy * s, c);
      line(g, bx + dx * s, by + dy * s, bx + dx * s, by + dy * (s - 3), c);
    });
  },

  molecule(g, t) {
    const a = t * 0.0005;
    const cos = Math.cos(a);
    const proj = ([x, y]) => [W / 2 + x * cos * 1.0, H / 2 + y];
    const hex = (ox, oy, r) =>
      Array.from({ length: 6 }, (_, i) => {
        const th = (Math.PI / 3) * i + Math.PI / 6;
        return [ox + Math.cos(th) * r, oy + Math.sin(th) * r];
      });
    const r = 11;
    const w = r * Math.sqrt(3);
    const rings = [hex(-w, 0, r), hex(0, 0, r), hex(w * 0.5, r * 1.5, r)];
    rings.forEach((ring, ri) => {
      ring.forEach((p, i) => {
        const [x0, y0] = proj(p);
        const [x1, y1] = proj(ring[(i + 1) % 6]);
        line(g, x0, y0, x1, y1, ri === 1 ? ORANGE : '#c93c0b');
        if (i % 2 === 0 && ri === 1) {
          const [ix0, iy0] = proj([p[0] * 0.75, p[1] * 0.75]);
          const [ix1, iy1] = proj([ring[(i + 1) % 6][0] * 0.75, ring[(i + 1) % 6][1] * 0.75]);
          line(g, ix0, iy0, ix1, iy1, '#7a2808');
        }
      });
    });
    const subs = [
      [[-w - r * 0.87, -r * 0.5], [-w - r * 1.9, -r * 1.1]],
      [[r * 0.87, -r * 0.5], [r * 2, -r * 1.2]],
      [[w * 0.5 + r * 0.87, r * 2], [w * 0.5 + r * 2, r * 2.6]],
    ];
    subs.forEach(([s, e], i) => {
      const [x0, y0] = proj(s);
      const [x1, y1] = proj(e);
      line(g, x0, y0, x1, y1, PALE);
      g.fillStyle = i === 1 ? '#fff1ea' : PALE;
      g.fillRect(Math.round(x1) - 2, Math.round(y1) - 2, 4, 4);
    });
  },

  orbit(g, t, rand) {
    const cx = W * 0.45;
    const cy = H * 0.52;
    const R = 24;
    for (let y = -R; y <= R; y++) {
      for (let x = -R; x <= R; x++) {
        const d = Math.hypot(x, y);
        if (d > R) continue;
        const lon = x + t * 0.004;
        const land =
          Math.sin(lon * 0.21 + 1.3) + 1.2 * Math.sin(y * 0.19 + lon * 0.07) + Math.sin((lon + y) * 0.13) > 1.15;
        const lit = x < 6;
        const dither = (x + y) % 2 === 0;
        if (land) px(g, cx + x, cy + y, lit ? ORANGE : dither ? '#7a2808' : INK);
        else if (lit ? dither || d > R - 1 : d > R - 1 && dither) px(g, cx + x, cy + y, lit ? '#3a1a0d' : '#1d0e07');
      }
    }
    const a = t * 0.0011;
    for (let i = 0; i < 26; i++) {
      const b = a - i * 0.045;
      const x = cx + Math.cos(b) * 46;
      const y = cy + Math.sin(b) * 14;
      const behind = Math.sin(b) < 0 && Math.abs(x - cx) < R;
      if (!behind) px(g, x, y, i === 0 ? '#fff1ea' : i < 6 ? PALE : '#7a2808');
    }
    const sx = cx + Math.cos(a) * 46;
    const sy = cy + Math.sin(a) * 14;
    if (!(Math.sin(a) < 0 && Math.abs(sx - cx) < R)) {
      g.fillStyle = '#fff1ea';
      g.fillRect(Math.round(sx) - 1, Math.round(sy) - 1, 3, 3);
    }
  },
};

export function ProjectArt({ kind, className = '' }) {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    canvas.width = W;
    canvas.height = H;
    const g = canvas.getContext('2d');
    const draw = (t) => {
      g.fillStyle = INK;
      g.fillRect(0, 0, W, H);
      scenes[kind](g, t, rng(5));
    };
    if (reducedMotion()) {
      draw(4000);
      return undefined;
    }
    draw(0);
    return whileVisible(canvas, draw);
  }, [kind]);

  return <canvas ref={ref} className={`project-art ${className}`} aria-hidden="true" />;
}
