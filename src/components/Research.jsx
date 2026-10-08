import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { papers, profile } from '../content.js';
import { ScrollTrigger, gsap, reducedMotion, rng } from '../lib/motion.js';
import { Arrow, ExtLink, SectionHead } from './ui.jsx';

const BINS = 34;
const LEVELS = 16;
const CELL = 10;
const GAP = 2;
const RANGE = [-10, 6];
const ALPHA_MIN = 0.8;
const ALPHA_MAX = 0.995;

const binReturn = (i) => RANGE[0] + ((i + 0.5) * (RANGE[1] - RANGE[0])) / BINS;

// A skewed return distribution drawn in pixel stacks.
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

// VaR is the loss at the (1 − α) quantile; CVaR is the average loss beyond it.
function riskAt(heights, alpha) {
  const total = heights.reduce((a, b) => a + b, 0);
  const target = (1 - alpha) * total;
  let cum = 0;
  let k = 0;
  for (; k < BINS - 1; k++) {
    cum += heights[k];
    if (cum >= target) break;
  }
  let weight = 0;
  let sum = 0;
  for (let i = 0; i <= k; i++) {
    weight += heights[i];
    sum += heights[i] * binReturn(i);
  }
  return { k, valueAtRisk: -binReturn(k), cvar: -sum / weight, total };
}

function TailChart() {
  const heights = useDistribution();
  const [alpha, setAlpha] = useState(0.95);
  const svgRef = useRef(null);
  const { k, valueAtRisk, cvar, total } = riskAt(heights, alpha);
  const w = BINS * CELL;
  const h = LEVELS * CELL;

  // Dragging across the chart moves the VaR line to the bin under the pointer.
  const fromPointer = (e) => {
    const r = svgRef.current.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * (w + 4) - 2;
    const i = Math.min(BINS - 1, Math.max(0, Math.floor(x / CELL)));
    const cum = heights.slice(0, i + 1).reduce((a, b) => a + b, 0);
    setAlpha(Math.min(ALPHA_MAX, Math.max(ALPHA_MIN, 1 - (cum - 0.5) / total)));
  };

  const pct = (v) => `${v.toFixed(1)}%`;
  return (
    <figure className="tail">
      <svg
        ref={svgRef}
        viewBox={`-2 -26 ${w + 4} ${h + 52}`}
        role="img"
        aria-label={`Illustrative return distribution. At ${pct(alpha * 100)} confidence, VaR is ${pct(valueAtRisk)} and CVaR is ${pct(cvar)}.`}
        data-cursor="drag"
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          fromPointer(e);
        }}
        onPointerMove={(e) => e.buttons === 1 && fromPointer(e)}
      >
        {heights.map((n, i) =>
          Array.from({ length: n }, (_, j) => (
            <rect
              key={`${i}-${j}`}
              className={`tail__px ${i <= k ? 'is-tail' : ''}`}
              x={i * CELL}
              y={h - (j + 1) * CELL}
              width={CELL - GAP}
              height={CELL - GAP}
              style={{ '--d': `${(i * 0.018 + j * 0.03).toFixed(3)}s` }}
            />
          )),
        )}
        <g className="tail__marker" style={{ transform: `translateX(${(k + 1) * CELL - GAP / 2}px)` }}>
          <line className="tail__var" x1={0} x2={0} y1={-18} y2={h + 6} />
          <text className="tail__txt" x={4} y={-10}>
            VaR {(alpha * 100).toFixed(1)}
          </text>
        </g>
        <text className="tail__txt" x={0} y={h + 20}>
          ← CVaR: the mean of what’s left
        </text>
      </svg>

      <div className="tail__readout">
        <label className="tail__slider">
          <span className="label">confidence level</span>
          <input
            type="range"
            min={ALPHA_MIN * 100}
            max={ALPHA_MAX * 100}
            step="0.5"
            value={(alpha * 100).toFixed(1)}
            onChange={(e) => setAlpha(Number(e.target.value) / 100)}
          />
        </label>
        <div className="tail__stats" aria-live="polite">
          <span><i className="label">α</i>{pct(alpha * 100)}</span>
          <span><i className="label">VaR</i>{pct(valueAtRisk)}</span>
          <span><i className="label">CVaR</i>{pct(cvar)}</span>
        </div>
      </div>
      <figcaption className="label">
        fig. 03 — drag the chart or the slider. An illustrative distribution, not a result.
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
