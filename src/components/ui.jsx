import { Fragment, useEffect, useRef } from 'react';
import { reducedMotion } from '../lib/motion.js';

const arrowPaths = {
  ne: 'M3.5 12.5 12.5 3.5M5 3.5h7.5V11',
  e: 'M2 8h12M9 3l5 5-5 5',
  s: 'M8 2v12M3 9l5 5 5-5',
  n: 'M8 14V2M3 7l5-5 5 5',
};

export function Arrow({ dir = 'ne', className = '' }) {
  return (
    <svg className={`arrow ${className}`} viewBox="0 0 16 16" aria-hidden="true" focusable="false">
      <path d={arrowPaths[dir]} />
    </svg>
  );
}

export const Dot = ({ className = '' }) => <span className={`dot ${className}`} aria-hidden="true" />;

// Wraps each word in a mask so it can slide up into view.
export function Words({ text, className = 'wi' }) {
  const words = text.split(' ');
  return words.map((word, i) => (
    <Fragment key={`${word}-${i}`}>
      <span className="w">
        <span className={className}>{word}</span>
      </span>
      {i < words.length - 1 ? ' ' : null}
    </Fragment>
  ));
}

// Letters roll up to a copy of themselves when the parent link is hovered.
export function Roll({ text }) {
  return (
    <>
      <span className="sr-only">{text}</span>
      <span className="roll" aria-hidden="true">
        {[...text].map((ch, i) => (
          <span className="roll__c" style={{ '--i': i }} key={i}>
            {ch === ' ' ? ' ' : ch}
          </span>
        ))}
      </span>
    </>
  );
}

const GLYPHS = '01#%/<>_=+*$';

// Decodes from random glyphs into the final text the first time it scrolls into view.
export function Scramble({ text, className = '' }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (reducedMotion()) return undefined;
    let raf = 0;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        const start = performance.now();
        const span = 420 + text.length * 14;
        const tick = (now) => {
          const p = Math.min(1, (now - start) / span);
          const shown = Math.floor(p * text.length);
          let out = text.slice(0, shown);
          for (let i = shown; i < text.length; i++) {
            out += text[i] === ' ' ? ' ' : GLYPHS[(Math.random() * GLYPHS.length) | 0];
          }
          el.textContent = out;
          if (p < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      },
      { rootMargin: '0px 0px -8% 0px' },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      el.textContent = text;
    };
  }, [text]);
  return (
    <span className={className} ref={ref}>
      {text}
    </span>
  );
}

export function SectionHead({ title, meta, accent = false }) {
  return (
    <div className="section-head">
      <span className="label">
        <span className={`sq ${accent ? 'sq--orange' : ''}`} aria-hidden="true" />
        <Scramble text={title} />
      </span>
      <Scramble className="label label--dim" text={meta} />
    </div>
  );
}

export function Label({ children, className = '' }) {
  return <span className={`label ${className}`}>{children}</span>;
}

export function ExtLink({ href, children, className = '', ...rest }) {
  return (
    <a href={href} className={className} target="_blank" rel="noopener noreferrer" {...rest}>
      {children}
    </a>
  );
}
