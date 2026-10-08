import { useEffect, useRef } from 'react';
import { getLenis, reducedMotion } from '../lib/motion.js';
import { Dot } from './ui.jsx';

// Endless ticker whose speed (and direction) follows the scroll velocity.
export function Marquee({ items, speed = 60, className = '', label }) {
  const trackRef = useRef(null);

  useEffect(() => {
    const track = trackRef.current;
    if (reducedMotion()) return undefined;
    let x = 0;
    let raf = 0;
    let last = performance.now();
    let dir = 1;
    let visible = false;
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) {
        last = performance.now();
        raf = requestAnimationFrame(loop);
      } else cancelAnimationFrame(raf);
    });
    const loop = (now) => {
      const dt = Math.min(64, now - last) / 1000;
      last = now;
      const v = getLenis()?.velocity ?? 0;
      if (Math.abs(v) > 0.4) dir = Math.sign(v);
      const half = track.scrollWidth / 2;
      x -= dir * (speed + Math.min(Math.abs(v) * 28, 900)) * dt;
      if (x <= -half) x += half;
      if (x > 0) x -= half;
      track.style.transform = `translate3d(${x}px,0,0)`;
      if (visible) raf = requestAnimationFrame(loop);
    };
    io.observe(track);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [speed]);

  const run = (copy) =>
    items.map((item, i) => (
      <span className="marquee__item" key={`${copy}-${i}`}>
        <Dot />
        {item}
      </span>
    ));

  return (
    <div className={`marquee ${className}`} role="img" aria-label={label ?? items.join(', ')}>
      <div className="marquee__track" ref={trackRef} aria-hidden="true">
        {run('a')}
        {run('b')}
        {run('c')}
        {run('d')}
      </div>
    </div>
  );
}
