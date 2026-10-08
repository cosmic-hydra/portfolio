import { useEffect, useRef } from 'react';
import { ScrollTrigger, fitCanvas, reducedMotion, rng } from '../lib/motion.js';

const colors = { paper: '#efeee9', ink: '#0b0b0b', orange: '#ff571a' };

// A band of square cells that steps from one section colour into the next as you scroll.
export function PixelEdge({ from = 'paper', to = 'ink', seed = 3, flip = false }) {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    let cells = [];
    let size = 0;
    let dims = { ctx: null, width: 0, height: 0 };
    let progress = reducedMotion() ? 1 : 0;

    const build = () => {
      dims = fitCanvas(canvas);
      const { width, height } = dims;
      const cols = width < 760 ? 10 : 24;
      size = width / cols;
      const rows = Math.ceil(height / size);
      const rand = rng(seed);
      cells = [];
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const depth = flip ? y / rows : 1 - y / rows;
          cells.push({ x, y, t: depth * 0.7 + rand() * 0.3 });
        }
      }
      draw();
    };

    const draw = () => {
      const { ctx, width, height } = dims;
      if (!ctx) return;
      ctx.fillStyle = colors[from];
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = colors[to];
      for (const c of cells) {
        if (c.t < progress) ctx.fillRect(Math.floor(c.x * size), Math.floor(c.y * size), Math.ceil(size) + 1, Math.ceil(size) + 1);
      }
    };

    build();
    const ro = new ResizeObserver(build);
    ro.observe(canvas);
    const st = reducedMotion()
      ? null
      : ScrollTrigger.create({
          trigger: canvas,
          start: 'top bottom',
          end: 'bottom 35%',
          onUpdate: (self) => {
            // Quantise progress so cells snap on in steps rather than smoothly.
            const p = Math.round(self.progress * 18) / 18;
            if (p !== progress) {
              progress = p;
              draw();
            }
          },
        });

    return () => {
      ro.disconnect();
      st?.kill();
    };
  }, [from, to, seed, flip]);

  return <canvas ref={ref} className={`pixel-edge pixel-edge--${from}-${to}`} aria-hidden="true" />;
}
