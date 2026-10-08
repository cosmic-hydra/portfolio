import { useEffect, useRef, useState } from 'react';
import { fitCanvas, reducedMotion, rng } from '../lib/motion.js';

const DURATION = 1500;

// Counts to 100 while fonts load, then dissolves away in pixel blocks.
export function Loader({ onDone }) {
  const [count, setCount] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const [gone, setGone] = useState(false);
  const canvasRef = useRef(null);
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  useEffect(() => {
    if (reducedMotion()) {
      setGone(true);
      doneRef.current();
      return undefined;
    }
    let raf = 0;
    let cancelled = false;
    const start = performance.now();
    const fonts = document.fonts?.ready ?? Promise.resolve();
    let fontsReady = false;
    fonts.then(() => (fontsReady = true));

    const tick = (now) => {
      if (cancelled) return;
      const t = Math.min((now - start) / DURATION, fontsReady ? 1 : 0.92);
      const eased = 1 - Math.pow(1 - t, 3);
      setCount(Math.round(eased * 100));
      if (t < 1) raf = requestAnimationFrame(tick);
      else dissolve();
    };

    const dissolve = () => {
      setLeaving(true);
      const canvas = canvasRef.current;
      const { ctx, width, height } = fitCanvas(canvas);
      const size = Math.max(28, Math.round(Math.min(width, height) / 14));
      const cols = Math.ceil(width / size);
      const rows = Math.ceil(height / size);
      const rand = rng(7);
      const cells = [];
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          // Clears from the bottom-left corner outward, with jitter.
          const order = (x / cols) * 0.45 + (1 - y / rows) * 0.35 + rand() * 0.45;
          cells.push({ x, y, order });
        }
      }
      const t0 = performance.now();
      const span = 720;
      const fade = (now) => {
        if (cancelled) return;
        const p = (now - t0) / span;
        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = '#0b0b0b';
        for (const c of cells) {
          if (c.order * 0.8 > p) ctx.fillRect(c.x * size, c.y * size, size + 0.5, size + 0.5);
        }
        ctx.fillStyle = '#ff571a';
        for (const c of cells) {
          const d = c.order * 0.8 - p;
          if (d > 0 && d < 0.05) ctx.fillRect(c.x * size, c.y * size, size + 0.5, size + 0.5);
        }
        if (p < 1.05) raf = requestAnimationFrame(fade);
        else setGone(true);
      };
      doneRef.current();
      raf = requestAnimationFrame(fade);
    };

    raf = requestAnimationFrame(tick);
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
    };
  }, []);

  if (gone) return null;
  return (
    <div className={`loader ${leaving ? 'is-leaving' : ''}`} aria-hidden="true">
      <canvas ref={canvasRef} className="loader__canvas" />
      <div className="loader__ui">
        <span className="label">advvvvaith / index — 2026</span>
        <span className="label loader__mid">pacing the frontier</span>
        <span className="loader__count">{String(count).padStart(3, '0')}</span>
        <span className="loader__bar" style={{ transform: `scaleX(${count / 100})` }} />
      </div>
    </div>
  );
}
