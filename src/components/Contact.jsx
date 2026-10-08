import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { profile } from '../content.js';
import { gsap, reducedMotion, scrollToTarget, whileVisible } from '../lib/motion.js';
import { useBengaluruTime } from '../lib/time.js';
import { Arrow, ExtLink, Roll, SectionHead } from './ui.jsx';

const WORD = profile.brand.split('');

// The four v's breathe like an accordion; letters near the pointer stretch out.
function Wordmark() {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    const letters = [...el.querySelectorAll('span')];
    const fit = () => {
      letters.forEach((l) => (l.style.fontVariationSettings = '"wdth" 94, "wght" 860'));
      el.style.fontSize = '100px';
      const natural = el.getBoundingClientRect().width;
      el.style.fontSize = `${(100 * el.parentElement.clientWidth * 0.94) / natural}px`;
    };
    fit();
    document.fonts?.ready.then(fit);
    const ro = new ResizeObserver(fit);
    ro.observe(el.parentElement);
    if (reducedMotion()) return () => ro.disconnect();

    let pointer = null;
    const onMove = (e) => (pointer = e.clientX);
    const onLeave = () => (pointer = null);
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerleave', onLeave);
    const widths = letters.map(() => 94);
    const stop = whileVisible(el, (t) => {
      // Read every position before writing any styles to avoid layout thrashing.
      const centers =
        pointer === null ? null : letters.map((l) => {
          const r = l.getBoundingClientRect();
          return r.left + r.width / 2;
        });
      const span = el.clientWidth;
      letters.forEach((l, i) => {
        let target = WORD[i] === 'v' ? 94 + 31 * Math.sin(t * 0.0021 - i * 0.95) : 94;
        if (centers) target = Math.max(62, 125 - (Math.abs(pointer - centers[i]) / span) * 260);
        widths[i] += (target - widths[i]) * 0.12;
        l.style.fontVariationSettings = `"wdth" ${widths[i].toFixed(1)}, "wght" 860`;
      });
    });
    return () => {
      ro.disconnect();
      stop();
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerleave', onLeave);
    };
  }, []);

  return (
    <div className="wordmark-wrap">
      <p className="wordmark" ref={ref} aria-label={profile.brand}>
        {WORD.map((ch, i) => (
          <span key={i} aria-hidden="true">
            {ch}
          </span>
        ))}
      </p>
    </div>
  );
}

export function Contact() {
  const ref = useRef(null);
  const time = useBengaluruTime();
  const [copied, setCopied] = useState(false);

  useLayoutEffect(() => {
    if (reducedMotion()) return undefined;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.contact__title .wi',
        { yPercent: 130 },
        {
          yPercent: 0,
          stagger: 0.08,
          duration: 1.2,
          ease: 'expo.out',
          scrollTrigger: { trigger: '.contact__title', start: 'top 85%' },
        },
      );
    }, ref);
    return () => ctx.revert();
  }, []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      window.location.href = `mailto:${profile.email}`;
    }
  };

  return (
    <footer className="contact" id="contact" data-theme="ink" ref={ref} aria-labelledby="contact-title">
      <SectionHead title="contact" meta="nº 006 — model access, research & collaboration" accent />

      <h2 className="contact__title" id="contact-title">
        <span className="w"><span className="wi">let’s</span></span>{' '}
        <span className="w"><span className="wi">talk</span></span>
        <span className="w"><span className="wi contact__dot">.</span></span>
      </h2>

      <div className="contact__mail">
        <a className="contact__email" href={`mailto:${profile.email}`} data-cursor="write">
          <Roll text={profile.email} />
        </a>
        <button type="button" className="btn btn--ghost btn--sm" data-magnetic onClick={copy}>
          {copied ? 'copied' : 'copy email'}
        </button>
      </div>

      <div className="contact__cols">
        <div>
          <span className="label label--dim">elsewhere</span>
          <ExtLink href={profile.links.linkedin}>linkedin <Arrow /></ExtLink>
          <ExtLink href={profile.links.github}>github <Arrow /></ExtLink>
          <ExtLink href={profile.links.orcid}>orcid <Arrow /></ExtLink>
        </div>
        <div>
          <span className="label label--dim">building</span>
          <ExtLink href={profile.links.hedge}>artificialhedge.co <Arrow /></ExtLink>
          <ExtLink href={profile.links.portal}>inference portal <Arrow /></ExtLink>
        </div>
        <div>
          <span className="label label--dim">local time</span>
          <span className="contact__time">{time}</span>
          <span className="label label--dim">ist · utc+5:30</span>
        </div>
        <div>
          <span className="label label--dim">based in</span>
          <span>{profile.location.toLowerCase()}</span>
          <span className="label label--dim">{profile.coordinates.toLowerCase()}</span>
        </div>
      </div>

      <Wordmark />

      <div className="contact__bar">
        <span className="label label--dim">© 2026 {profile.name.toLowerCase()}</span>
        <span className="label label--dim contact__pace">we must pace the frontier</span>
        <a
          className="label"
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            scrollToTarget('#top');
          }}
        >
          back to top <Arrow dir="n" />
        </a>
      </div>
    </footer>
  );
}
