import { useLayoutEffect, useRef, useState } from 'react';
import { work } from '../content.js';
import { getLenis, gsap, reducedMotion } from '../lib/motion.js';
import { ProjectArt } from './ProjectArt.jsx';
import { Arrow, ExtLink, SectionHead } from './ui.jsx';

export function Work() {
  const ref = useRef(null);
  const previewRef = useRef(null);
  const [active, setActive] = useState(null);
  const moveRef = useRef(null);
  // Keep the last project visible while the preview fades out.
  const lastRef = useRef(null);
  if (active) lastRef.current = active;
  const current = work.find((p) => p.id === lastRef.current);

  useLayoutEffect(() => {
    const preview = previewRef.current;
    const ctx = gsap.context(() => {
      gsap.set(preview, { xPercent: 6, yPercent: -50, x: window.innerWidth / 2, y: window.innerHeight / 2 });
      const xTo = gsap.quickTo(preview, 'x', { duration: 0.55, ease: 'power3.out' });
      const yTo = gsap.quickTo(preview, 'y', { duration: 0.55, ease: 'power3.out' });
      moveRef.current = (e) => {
        xTo(e.clientX);
        yTo(e.clientY);
      };
      if (reducedMotion()) return;

      gsap.fromTo(
        '.work__row',
        { '--line': 0 },
        {
          '--line': 1,
          stagger: 0.1,
          duration: 1.4,
          ease: 'expo.out',
          scrollTrigger: { trigger: '.work__list', start: 'top 80%' },
        },
      );
      gsap.fromTo(
        '.work__name-inner',
        { yPercent: 125 },
        {
          yPercent: 0,
          stagger: 0.1,
          duration: 1.2,
          ease: 'expo.out',
          scrollTrigger: { trigger: '.work__list', start: 'top 80%' },
        },
      );
    }, ref);

    // Project names lean with scroll speed and settle when scrolling stops.
    const list = ref.current.querySelector('.work__list');
    let skew = 0;
    const lean = () => {
      const target = gsap.utils.clamp(-7, 7, (getLenis()?.velocity ?? 0) * 0.3);
      const next = skew + (target - skew) * 0.12;
      if (Math.abs(next - skew) < 0.005) return;
      skew = next;
      list.style.setProperty('--skew', skew.toFixed(3));
    };
    if (!reducedMotion()) gsap.ticker.add(lean);

    return () => {
      gsap.ticker.remove(lean);
      ctx.revert();
    };
  }, []);

  return (
    <section
      className="work"
      id="work"
      data-theme="paper"
      ref={ref}
      aria-labelledby="work-title"
      onPointerMove={(e) => moveRef.current?.(e)}
    >
      <SectionHead title="selected work" meta="nº 004 — open source, science & education" />
      <h2 className="sr-only" id="work-title">Selected work</h2>

      <ol className="work__list" onPointerLeave={() => setActive(null)}>
        {work.map((p, i) => (
          <li
            className={`work__row ${active === p.id ? 'is-active' : ''}`}
            key={p.id}
            onPointerEnter={(e) => {
              if (e.pointerType === 'mouse') setActive(p.id);
            }}
          >
            <ExtLink href={p.url} className="work__link" data-cursor="open" onFocus={() => setActive(p.id)} onBlur={() => setActive(null)}>
              <span className="work__num label">0{i + 1}</span>
              <span className="work__name">
                <span className="work__name-inner">{p.name}</span>
              </span>
              <span className="work__meta">
                <span className="label">{p.field}</span>
                <span className="label label--dim">{p.role}</span>
              </span>
              <span className="work__summary">{p.summary}</span>
              <span className="work__go label">
                {p.url.includes('github') ? 'github' : 'visit'} <Arrow />
              </span>
            </ExtLink>
            <ProjectArt kind={p.art} className="work__art" />
          </li>
        ))}
      </ol>

      <div className={`work__preview ${active ? 'is-on' : ''}`} ref={previewRef} aria-hidden="true">
        <div className="work__preview-art">
          {work.map((p) => (
            <ProjectArt key={p.id} kind={p.art} className={current?.id === p.id ? 'is-active' : ''} />
          ))}
        </div>
        <p className="work__preview-copy">{current?.summary}</p>
      </div>
    </section>
  );
}
