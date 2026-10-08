import { useLayoutEffect, useRef } from 'react';
import { domains, profile } from '../content.js';
import { gsap, reducedMotion } from '../lib/motion.js';
import { Dot, SectionHead } from './ui.jsx';

// Words sit on a visible 6-column grid, like a score: word, dot, word.
const layout = [
  { row: 1, col: '1 / span 2', word: 0 },
  { row: 1, col: '3 / span 1', dot: true },
  { row: 1, col: '4 / span 3', word: 1 },
  { row: 2, col: '1 / span 1', dot: true },
  { row: 2, col: '2 / span 2', word: 2 },
  { row: 2, col: '4 / span 1', dot: true },
  { row: 2, col: '5 / span 2', word: 3 },
  { row: 3, col: '2 / span 4', word: 4 },
  { row: 3, col: '6 / span 1', dot: true, accent: true },
];

export function Manifesto() {
  const ref = useRef(null);

  useLayoutEffect(() => {
    if (reducedMotion()) return undefined;
    const ctx = gsap.context(() => {
      gsap
        .timeline({
          scrollTrigger: { trigger: '.manifesto__score', start: 'top 80%', end: 'bottom 55%', scrub: 0.6 },
        })
        .fromTo(
          '.manifesto__cell',
          { '--reveal': 0 },
          { '--reveal': 1, stagger: 0.12, duration: 0.5, ease: 'power2.out' },
        );
      gsap.fromTo(
        '.manifesto__rule',
        { scaleX: 0 },
        { scaleX: 1, ease: 'expo.out', duration: 1.6, stagger: 0.1, scrollTrigger: { trigger: '.manifesto__score', start: 'top 85%' } },
      );
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section className="manifesto" id="manifesto" data-theme="paper" ref={ref} aria-labelledby="manifesto-title">
      <SectionHead title="principle" meta="nº 001 — the operating line" />

      <h2 className="manifesto__score" id="manifesto-title" aria-label={profile.motto.join(' ')}>
        {[1, 2, 3].map((r) => (
          <span key={r} className="manifesto__rule" style={{ gridRow: r }} aria-hidden="true" />
        ))}
        {layout.map((cell, i) => (
          <span
            key={i}
            className={`manifesto__cell ${cell.dot ? 'is-dot' : ''}`}
            style={{ gridRow: cell.row, gridColumn: cell.col }}
            aria-hidden="true"
          >
            {cell.dot ? (
              <Dot className={cell.accent ? 'dot--orange' : ''} />
            ) : (
              <span className="manifesto__word">{profile.motto[cell.word]}</span>
            )}
          </span>
        ))}
      </h2>

      <div className="manifesto__foot">
        <p className="manifesto__note" data-lines>
          The work has spanned AI, capital, astronomy, molecular science and climate. The method
          stays the same: find the edge of what is possible, then build at it. Today that means
          frontier models for finance.
        </p>
        <ul className="manifesto__domains" aria-label="Fields">
          {domains.map((d, i) => (
            <li key={d}>
              <span className="label label--dim">0{i + 1}</span>
              {d}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
