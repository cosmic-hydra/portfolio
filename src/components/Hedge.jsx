import { useLayoutEffect, useRef } from 'react';
import { hedge, profile } from '../content.js';
import { gsap, reducedMotion } from '../lib/motion.js';
import { Marquee } from './Marquee.jsx';
import { PixelHedge } from './PixelHedge.jsx';
import { Arrow, ExtLink, Roll, Scramble, Words } from './ui.jsx';

function Spec({ spec }) {
  if (spec.text) {
    return (
      <div className="spec">
        <span className="label label--dim">{spec.label}</span>
        <span className="spec__text">{spec.text}</span>
      </div>
    );
  }
  return (
    <div className="spec">
      <span className="label label--dim">{spec.label}</span>
      <span className="spec__value">
        {spec.prefix}
        <span className="spec__num" data-to={spec.value} data-decimals={spec.decimals ?? 0}>
          {spec.value.toFixed(spec.decimals ?? 0)}
        </span>
        <span className="spec__unit">{spec.unit}</span>
      </span>
    </div>
  );
}

// Feeds the pointer position to the card under it for the spotlight and border glow.
function spotlight(e) {
  const card = e.target.closest('.model');
  if (!card) return;
  const r = card.getBoundingClientRect();
  card.style.setProperty('--mx', `${e.clientX - r.left}px`);
  card.style.setProperty('--my', `${e.clientY - r.top}px`);
}

export function Hedge() {
  const ref = useRef(null);

  useLayoutEffect(() => {
    if (reducedMotion()) return undefined;
    const ctx = gsap.context(() => {
      // Statement brightens word by word as it scrolls through.
      gsap.fromTo(
        '.hedge__statement .wi',
        { opacity: 0.16 },
        {
          opacity: 1,
          stagger: 0.08,
          ease: 'none',
          scrollTrigger: { trigger: '.hedge__statement', start: 'top 78%', end: 'bottom 42%', scrub: true },
        },
      );

      gsap.utils.toArray('.model').forEach((card, i) => {
        gsap.fromTo(
          card,
          { clipPath: 'inset(0 0 100% 0)' },
          {
            clipPath: 'inset(0 0 0% 0)',
            duration: 1.2,
            delay: i * 0.12,
            ease: 'expo.out',
            clearProps: 'clipPath',
            scrollTrigger: { trigger: '.hedge__models', start: 'top 80%' },
          },
        );
      });

      gsap.utils.toArray('.spec__num').forEach((el) => {
        const to = parseFloat(el.dataset.to);
        const decimals = parseInt(el.dataset.decimals, 10);
        const counter = { v: 0 };
        gsap.to(counter, {
          v: to,
          duration: 1.8,
          ease: 'expo.out',
          scrollTrigger: { trigger: el, start: 'top 90%' },
          onUpdate: () => (el.textContent = counter.v.toFixed(decimals)),
        });
      });

      // The wire fills left to right as you scroll and lights each stage it reaches.
      const cols = gsap.utils.toArray('.flow__col');
      gsap.fromTo(
        '.flow__fill',
        { scaleX: 0 },
        {
          scaleX: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: '.flow',
            start: 'top 70%',
            end: 'bottom 40%',
            scrub: 0.4,
            onUpdate: (self) =>
              cols.forEach((col, i) => col.classList.toggle('is-lit', self.progress >= i / cols.length)),
          },
        },
      );

      gsap.fromTo(
        '.flow__col',
        { y: 60, autoAlpha: 0 },
        {
          y: 0,
          autoAlpha: 1,
          stagger: 0.12,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: { trigger: '.hedge__flow', start: 'top 75%' },
        },
      );
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section className="hedge" id="artificial-hedge" data-theme="ink" ref={ref} aria-labelledby="hedge-title">
      <Marquee
        className="marquee--hedge"
        items={['artificial hedge', 'frontier intelligence for finance']}
        label="artificial hedge: frontier intelligence for finance"
      />

      <div className="hedge__head">
        <span className="label">
          <span className="sq sq--orange" aria-hidden="true" />
          <Scramble text="nº 002 / currently building" />
        </span>
        <Scramble className="label" text={`${hedge.role} · ${hedge.since} — present`} />
        <Scramble className="label label--dim" text="fx series · research preview" />
        <ExtLink className="label hedge__headlink" href={profile.links.hedge}>
          artificialhedge.co <Arrow />
        </ExtLink>
      </div>

      <div className="hedge__stage">
        <PixelHedge />
        <div className="hedge__copy">
          <h2 className="hedge__title" id="hedge-title">
            artificial hedge<span className="hedge__period">.</span>
          </h2>
          <p className="hedge__statement">
            <Words text={hedge.statement} />
          </p>
          <div className="hedge__ctas">
            <ExtLink className="btn btn--orange" href={profile.links.hedge} data-magnetic>
              <Roll text="meet the models" /> <Arrow />
            </ExtLink>
            <ExtLink className="btn btn--ghost" href={profile.links.portal} data-magnetic>
              <Roll text="inference portal" /> <Arrow />
            </ExtLink>
          </div>
        </div>
        <span className="hedge__fig label label--dim" aria-hidden="true">fig. 02 — a hedge, grown pixel by pixel</span>
      </div>

      <div className="hedge__models">
        <div className="hedge__models-head">
          <h3 className="display-sm">the fx series.</h3>
          <p>
            Two models, two ways in: frontier depth, or the same finance and maths focus tuned for
            cost. A harness is on the way.
          </p>
        </div>
        <div className="hedge__grid" onPointerMove={spotlight}>
          {hedge.models.map((m) => (
            <article className={`model ${m.status === 'in development' ? 'model--dev' : ''}`} key={m.name}>
              <div className="model__top">
                <span className="label label--dim">{m.index}</span>
                <span className="chip">
                  <span className="chip__dot" aria-hidden="true" />
                  {m.status}
                </span>
              </div>
              <h4 className="model__name">{m.name}</h4>
              <span className="label model__kind">{m.kind}</span>
              <p className="model__blurb">{m.blurb}</p>
              <div className="model__specs">
                {m.specs.map((s) => (
                  <Spec spec={s} key={s.label} />
                ))}
              </div>
            </article>
          ))}
        </div>
        <p className="hedge__source label label--dim">
          specifications as published on artificialhedge.co
        </p>
      </div>

      <div className="hedge__flow">
        <h3 className="display-sm">
          from source <br />
          to financial reasoning.
        </h3>
        <div className="flow">
          <div className="flow__wire" aria-hidden="true">
            <span />
            <span />
            <span />
            <i className="flow__fill" />
          </div>
          {hedge.flow.map((col) => (
            <div className="flow__col" key={col.step}>
              <span className="flow__step">{col.step}</span>
              <span className="label">{col.title}</span>
              <ul>
                {col.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="hedge__links">
        <ExtLink className="bigrow" href={profile.links.hedge} data-cursor="visit">
          <span className="label label--dim">01</span>
          <span className="bigrow__text">artificialhedge.co</span>
          <span className="bigrow__mag" data-magnetic>
            <Arrow className="bigrow__arrow" />
          </span>
        </ExtLink>
        <ExtLink className="bigrow" href={profile.links.portal} data-cursor="visit">
          <span className="label label--dim">02</span>
          <span className="bigrow__text">inference portal</span>
          <span className="bigrow__mag" data-magnetic>
            <Arrow className="bigrow__arrow" />
          </span>
        </ExtLink>
      </div>
    </section>
  );
}
