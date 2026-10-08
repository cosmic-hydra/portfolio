import { useLayoutEffect, useRef } from 'react';
import { profile } from '../content.js';
import { ScrollTrigger, fitCanvas, gsap, reducedMotion, rng, scrollToTarget } from '../lib/motion.js';
import { Arrow, ExtLink } from './ui.jsx';

const PORTRAIT_RATIO = 1233 / 1276;
const MOBILE = 760;

// Scales the name so it spans the full width of the stage, Kalkbrenner style.
function fitName(stage, name) {
  const gutter = parseFloat(getComputedStyle(stage).paddingLeft) || 0;
  const target = stage.clientWidth - gutter * 2;
  name.style.fontSize = '100px';
  const natural = name.getBoundingClientRect().width;
  name.style.fontSize = `${Math.floor((100 * target) / natural * 100) / 100}px`;
}

// Covers the canvas in paper-coloured cells, then knocks them out one by one,
// each flashing ink for a frame before it disappears.
function pixelReveal(canvas, { delay, duration }) {
  const { ctx, width, height } = fitCanvas(canvas);
  const size = Math.max(6, Math.round(height / 7));
  const cols = Math.ceil(width / size);
  const rows = Math.ceil(height / size);
  const rand = rng(4);
  const cells = [];
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) cells.push({ x, y, t: (x / cols) * 0.5 + rand() * 0.5 });
  }
  const paint = (p) => {
    ctx.clearRect(0, 0, width, height);
    for (const c of cells) {
      if (c.t > p) ctx.fillStyle = '#efeee9';
      else if (c.t > p - 0.08) ctx.fillStyle = '#0b0b0b';
      else continue;
      ctx.fillRect(c.x * size, c.y * size, size + 0.5, size + 0.5);
    }
  };
  canvas.style.display = 'block';
  paint(0);
  let raf = 0;
  const start = performance.now() + delay;
  const tick = (now) => {
    const p = Math.max(0, (now - start) / duration) * 1.1;
    paint(p);
    if (p < 1.1) raf = requestAnimationFrame(tick);
    else canvas.style.display = 'none';
  };
  raf = requestAnimationFrame(tick);
  return () => {
    cancelAnimationFrame(raf);
    canvas.style.display = 'none';
  };
}

export function Hero({ ready }) {
  const stageRef = useRef(null);
  const nameRef = useRef(null);
  const slotRef = useRef(null);
  const portraitRef = useRef(null);
  const pixelsRef = useRef(null);

  useLayoutEffect(() => {
    const stage = stageRef.current;
    const name = nameRef.current;
    const fit = () => fitName(stage, name);
    fit();
    document.fonts?.ready.then(() => {
      fit();
      ScrollTrigger.refresh();
    });
    const ro = new ResizeObserver(fit);
    ro.observe(stage);
    return () => ro.disconnect();
  }, []);

  useLayoutEffect(() => {
    const stage = stageRef.current;
    const slot = slotRef.current;
    const portrait = portraitRef.current;

    const name = nameRef.current;
    // Layout offsets, not bounding rects, so measurements ignore the zoom transform.
    const slotRect = () => ({
      left: name.offsetLeft + slot.offsetLeft,
      top: name.offsetTop + slot.offsetTop,
      width: slot.offsetWidth,
      height: slot.offsetHeight,
    });
    const finalRect = () => {
      const W = stage.clientWidth;
      const H = stage.clientHeight;
      if (W < MOBILE) return { left: 0, top: 0, width: W, height: H };
      const width = Math.min(W, H * PORTRAIT_RATIO);
      return { left: (W - width) / 2, top: 0, width, height: H };
    };
    const rectVars = (fn) => ({
      left: () => fn().left,
      top: () => fn().top,
      width: () => fn().width,
      height: () => fn().height,
    });
    const zoom = () => finalRect().height / Math.max(1, slot.offsetHeight);
    const origin = () =>
      `${slot.offsetLeft + slot.offsetWidth / 2}px ${slot.offsetTop + slot.offsetHeight / 2}px`;

    const ctx = gsap.context(() => {
      if (reducedMotion()) {
        const place = () => gsap.set(portrait, slotRect());
        place();
        ScrollTrigger.addEventListener('refreshInit', place);
        return () => ScrollTrigger.removeEventListener('refreshInit', place);
      }

      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: stage,
          start: 'top top',
          end: () => `+=${window.innerHeight * 1.35}`,
          scrub: 0.5,
          pin: true,
          invalidateOnRefresh: true,
        },
      });
      tl.fromTo('.hero__meta', { autoAlpha: 1, y: 0 }, { autoAlpha: 0, y: 40, duration: 0.25 }, 0)
        .fromTo(
          name,
          { scale: 1, transformOrigin: origin },
          { scale: zoom, transformOrigin: origin, duration: 1, ease: 'power2.inOut' },
          0,
        )
        .fromTo(name, { autoAlpha: 1 }, { autoAlpha: 0, duration: 0.35 }, 0.55)
        .fromTo(portrait, rectVars(slotRect), { ...rectVars(finalRect), duration: 1, ease: 'power2.inOut' }, 0)
        .fromTo('.hero__img', { scale: 1.25 }, { scale: 1, duration: 1 }, 0)
        .fromTo(portrait, { backgroundColor: '#ff571a' }, { backgroundColor: '#efeee9', duration: 0.5 }, 0.35)
        .fromTo(
          '.hero__caption',
          { autoAlpha: 0, y: 24 },
          { autoAlpha: 1, y: 0, duration: 0.3, stagger: 0.05 },
          0.75,
        )
        .fromTo('.hero__claim .wi', { yPercent: 130 }, { yPercent: 0, duration: 0.35, stagger: 0.06, ease: 'power3.out' }, 0.8);
    }, stage);

    return () => ctx.revert();
  }, []);

  useLayoutEffect(() => {
    if (!ready || reducedMotion()) return undefined;
    // Paint the cover before the browser does, so the tile never flashes unrevealed.
    const reveal = pixelReveal(pixelsRef.current, { delay: 520, duration: 760 });
    const ctx = gsap.context(() => {
      gsap
        .timeline({ delay: 0.15 })
        .fromTo('.hero__word', { yPercent: 130 }, { yPercent: 0, duration: 1.25, stagger: 0.09, ease: 'expo.out' })
        .fromTo(
          '.hero__portrait',
          { scaleX: 0 },
          { scaleX: 1, duration: 0.6, ease: 'expo.inOut' },
          0.1,
        )
        .fromTo(
          '.hero__meta > *',
          { autoAlpha: 0, y: 18 },
          { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.08, ease: 'power3.out' },
          0.55,
        );
    }, stageRef);
    return () => {
      reveal();
      ctx.revert();
    };
  }, [ready]);

  return (
    <section className={`hero ${ready ? "is-ready" : ""}`} id="top" data-theme="paper" aria-label="Introduction">
      <div className="hero__stage" ref={stageRef}>
        <h1 className="hero__name" ref={nameRef} aria-label={profile.name}>
          <span className="hero__line" aria-hidden="true">
            <span className="hero__mask">
              <span className="hero__word">{profile.first}</span>
            </span>
            <span className="hero__slot" ref={slotRef} />
          </span>
          <span className="hero__line" aria-hidden="true">
            <span className="hero__mask">
              <span className="hero__word">{profile.last}</span>
            </span>
          </span>
        </h1>

        <figure className="hero__portrait" ref={portraitRef}>
          <img
            className="hero__img"
            src="/media/advaith-mono.webp"
            alt="Portrait of Advaith Vaithianathan"
            width="1233"
            height="1276"
            fetchPriority="high"
          />
          <canvas className="hero__pixels" ref={pixelsRef} aria-hidden="true" />
        </figure>

        <div className="hero__captions" aria-hidden="true">
          <span className="hero__caption label hero__caption--tl">fig. 01 — advaith vaithianathan</span>
          <span className="hero__caption label hero__caption--tr">{profile.location.toLowerCase()} · {profile.coordinates.toLowerCase()}</span>
          <p className="hero__claim">
            <span className="w"><span className="wi">founder,</span></span>{' '}
            <span className="w"><span className="wi">artificial</span></span>{' '}
            <span className="w"><span className="wi">hedge.</span></span>
          </p>
          <span className="hero__caption label hero__caption--br">frontier models for finance — since 2026</span>
        </div>

        <div className="hero__meta">
          <div className="hero__now">
            <span className="hero__pixel" aria-hidden="true" />
            <div>
              <span className="label label--dim">now building</span>
              <ExtLink href={profile.links.hedge} className="hero__nowlink">
                fx-1 &amp; fx-1 lite <Arrow />
              </ExtLink>
            </div>
          </div>
          <p className="hero__bio">
            Founder and builder from Bengaluru, working where AI meets capital. I build frontier
            language models for financial reasoning at artificial hedge, and write research on
            markets, risk and settlement.
          </p>
          <a
            className="hero__scroll label"
            href="#manifesto"
            onClick={(e) => {
              e.preventDefault();
              scrollToTarget('#manifesto');
            }}
          >
            scroll <Arrow dir="s" />
          </a>
        </div>
      </div>
    </section>
  );
}
