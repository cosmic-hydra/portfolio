import { useEffect, useRef, useState } from 'react';
import { gsap, reducedMotion } from '../lib/motion.js';

const INTERACTIVE = 'a, button, [data-cursor]';

// A square cursor that trails the pointer, adapts to the section colour, grows over
// interactive elements and shows a short label where one is set via data-cursor.
// Elements marked data-magnetic lean towards the pointer.
export function Cursor() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const trailRef = useRef(null);
  const [enabled] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(hover: hover) and (pointer: fine)').matches &&
      !reducedMotion(),
  );

  useEffect(() => {
    if (!enabled) return undefined;
    const dot = dotRef.current;
    const ring = ringRef.current;
    const root = document.documentElement;
    root.classList.add('has-cursor');

    const dx = gsap.quickTo(dot, 'x', { duration: 0.08, ease: 'power3.out' });
    const dy = gsap.quickTo(dot, 'y', { duration: 0.08, ease: 'power3.out' });
    const rx = gsap.quickTo(ring, 'x', { duration: 0.4, ease: 'power3.out' });
    const ry = gsap.quickTo(ring, 'y', { duration: 0.4, ease: 'power3.out' });

    let magnet = null;
    let last = null;
    const trail = trailRef.current;
    const tctx = trail.getContext('2d');
    let cells = [];
    let trailRaf = 0;
    const GRID = 16;
    const LIFE = 620;

    const sizeTrail = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      trail.width = window.innerWidth * dpr;
      trail.height = window.innerHeight * dpr;
      tctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    sizeTrail();
    window.addEventListener('resize', sizeTrail);

    // On dark sections the pointer leaves a short-lived trail of grid-snapped pixels.
    const paintTrail = (now) => {
      tctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      cells = cells.filter((c) => now - c.t < LIFE);
      for (const c of cells) {
        const a = 1 - (now - c.t) / LIFE;
        tctx.fillStyle = `rgba(255,87,26,${(0.55 * a).toFixed(3)})`;
        const inset = (1 - a) * GRID * 0.35;
        tctx.fillRect(c.x + inset, c.y + inset, GRID - 2 - inset * 2, GRID - 2 - inset * 2);
      }
      trailRaf = cells.length ? requestAnimationFrame(paintTrail) : 0;
    };
    const addTrail = (x, y) => {
      const now = performance.now();
      const steps = last ? Math.ceil(Math.hypot(x - last.x, y - last.y) / (GRID / 2)) : 1;
      for (let i = 1; i <= steps; i++) {
        const px = last ? last.x + ((x - last.x) * i) / steps : x;
        const py = last ? last.y + ((y - last.y) * i) / steps : y;
        const gx = Math.floor(px / GRID) * GRID;
        const gy = Math.floor(py / GRID) * GRID;
        const existing = cells.find((c) => c.x === gx && c.y === gy);
        if (existing) existing.t = now;
        else cells.push({ x: gx, y: gy, t: now });
      }
      if (!trailRaf) trailRaf = requestAnimationFrame(paintTrail);
    };

    const onMove = (e) => {
      if (ring.dataset.on === 'ink' && !ring.classList.contains('is-hover')) {
        addTrail(e.clientX, e.clientY);
      }
      last = { x: e.clientX, y: e.clientY };
      dx(e.clientX);
      dy(e.clientY);
      rx(e.clientX);
      ry(e.clientY);
      ring.classList.add('is-visible');
      dot.classList.add('is-visible');
      if (magnet) {
        const r = magnet.getBoundingClientRect();
        const mx = (e.clientX - (r.left + r.width / 2)) * 0.28;
        const my = (e.clientY - (r.top + r.height / 2)) * 0.38;
        gsap.to(magnet, { x: mx, y: my, duration: 0.5, ease: 'power3.out', overwrite: 'auto' });
      }
    };

    const onOver = (e) => {
      // Sections declare data-theme; the nav mirrors the section under it via data-on.
      const section = e.target.closest?.('[data-theme], [data-on]');
      ring.dataset.on = section?.dataset.theme ?? section?.dataset.on ?? 'paper';
      dot.dataset.on = ring.dataset.on;
      const hit = e.target.closest?.(INTERACTIVE);
      ring.classList.toggle('is-hover', !!hit);
      dot.classList.toggle('is-hover', !!hit);
      const label = hit?.dataset.cursor;
      ring.dataset.label = label ?? '';
      ring.classList.toggle('has-label', !!label);

      const m = e.target.closest?.('[data-magnetic]');
      if (m !== magnet) {
        if (magnet) gsap.to(magnet, { x: 0, y: 0, duration: 0.8, ease: 'elastic.out(1, 0.4)', overwrite: 'auto' });
        magnet = m;
      }
    };

    const onLeave = () => {
      ring.classList.remove('is-visible');
      dot.classList.remove('is-visible');
    };
    const onDown = () => ring.classList.add('is-down');
    const onUp = () => ring.classList.remove('is-down');

    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerover', onOver);
    document.documentElement.addEventListener('pointerleave', onLeave);
    window.addEventListener('pointerdown', onDown);
    window.addEventListener('pointerup', onUp);
    return () => {
      cancelAnimationFrame(trailRaf);
      window.removeEventListener('resize', sizeTrail);
      root.classList.remove('has-cursor');
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerover', onOver);
      document.documentElement.removeEventListener('pointerleave', onLeave);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
    };
  }, [enabled]);

  if (!enabled) return null;
  return (
    <>
      <canvas className="cursor-trail" ref={trailRef} aria-hidden="true" />
      <div className="cursor-ring" ref={ringRef} aria-hidden="true" />
      <div className="cursor-dot" ref={dotRef} aria-hidden="true" />
    </>
  );
}
