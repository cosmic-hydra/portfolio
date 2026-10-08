import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { papers, profile } from '../content.js';
import { ScrollTrigger, gsap, reducedMotion, rng } from '../lib/motion.js';
import { Arrow, ExtLink, SectionHead } from './ui.jsx';

const BINS = 34;
const LEVELS = 16;
const TAIL = 7;

// A skewed return distribution drawn in pixel stacks, its left tail filled in.
function useDistribution() {
  return useMemo(() => {
    const rand = rng(21);
    const bins = Array.from({ length: BINS }, (_, i) => {
      const x = (i - BINS * 0.6) / (BINS * 0.15);
      const body = Math.exp(-0.5 * x * x);
      // A second, smaller hump on the left gives the distribution its fat tail.
      const t = (i - 3.5) / 2.6;
      const tail = 0.19 * Math.exp(-0.5 * t * t);
      return body + tail + rand() * 0.04;
    });
    const max = Math.max(...bins);
    return bins.map((v) => Math.max(1, Math.round((v / max) * LEVELS)));
  }, []);
}

function TailChart() {
  const heights = useDistribution();
  const cell = 10;
  const gap = 2;
  const w = BINS * cell;
  const h = LEVELS * cell;
  return (
    <figure className="tail">
      <svg viewBox={`-2 -26 ${w + 4} ${h + 52}`} role="img" aria-labelledby="tail-cap">
        {heights.map((n, i) =>
          Array.from({ length: n }, (_, j) => (
            <rect
              key={`${i}-${j}`}
              className={`tail__px ${i < TAIL ? 'is-tail' : ''}`}
              x={i * cell}
              y={h - (j + 1) * cell}
              width={cell - gap}
              height={cell - gap}
              style={{ '--d': `${(i * 0.018 + j * 0.03).toFixed(3)}s` }}
            />
          )),
        )}
        <line className="tail__var" x1={TAIL * cell - gap / 2} x2={TAIL * cell - gap / 2} y1={-18} y2={h + 6} />
        <text className="tail__txt" x={TAIL * cell + 4} y={-10}>
          VaR 95
        </text>
        <text className="tail__txt" x={0} y={h + 20}>
          ← CVaR: the mean of what’s left
        </text>
      </svg>
      <figcaption id="tail-cap" className="label">
        fig. 03 — tail risk, illustrated. A sketch of the idea, not a result.
      </figcaption>
    </figure>
  );
}

export function Research() {
  const ref = useRef(null);
  const [open, setOpen] = useState(0);

  useLayoutEffect(() => {
    if (reducedMotion()) return undefined;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.research__title .wi',
        { yPercent: 130 },
        {
          yPercent: 0,
          stagger: 0.08,
          duration: 1.1,
          ease: 'expo.out',
          scrollTrigger: { trigger: '.research__title', start: 'top 85%' },
        },
      );
      ScrollTrigger.create({
        trigger: '.tail',
        start: 'top 80%',
        once: true,
        onEnter: (self) => self.trigger.classList.add('is-in'),
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section className="research" id="research" data-theme="orange" ref={ref} aria-labelledby="research-title">
      <SectionHead title="research" meta="nº 003 — markets, risk & settlement" />

      <div className="research__top">
        <h2 className="research__title display" id="research-title">
          <span className="w"><span className="wi">published</span></span>{' '}
          <span className="w"><span className="wi">research.</span></span>
        </h2>
        <TailChart />
      </div>

      <div className="table" role="list">
        <div className="table__head" aria-hidden="true">
          <span>date</span>
          <span>title</span>
          <span>venue</span>
          <span>field</span>
        </div>
        {papers.map((p, i) => {
          const isOpen = open === i;
          return (
            <div className={`paper ${isOpen ? 'is-open' : ''}`} role="listitem" key={p.title}>
              <button
                className="paper__row"
                type="button"
                data-cursor={isOpen ? 'close' : 'read'}
                aria-expanded={isOpen}
                aria-controls={`paper-${i}`}
                onClick={() => setOpen(isOpen ? -1 : i)}
              >
                <span className="paper__date">{p.date}</span>
                <span className="paper__title">{p.title}</span>
                <span className="paper__venue">{p.venue}</span>
                <span className="paper__field">{p.field}</span>
                <span className="paper__toggle" aria-hidden="true" />
              </button>
              <div className="paper__body" id={`paper-${i}`}>
                <div className="paper__inner">
                  <p>{p.abstract}</p>
                  <ExtLink className="label paper__link" href={profile.links.linkedin}>
                    listed on linkedin <Arrow />
                  </ExtLink>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
