import { useLayoutEffect, useRef } from 'react';
import { alongside, languages, trajectory } from '../content.js';
import { gsap, scrollToTarget } from '../lib/motion.js';
import { Arrow, Roll, SectionHead } from './ui.jsx';

// On wide screens the section pins and the milestones scroll sideways.
export function Trajectory() {
  const ref = useRef(null);
  const trackRef = useRef(null);
  const progressRef = useRef(null);

  useLayoutEffect(() => {
    const section = ref.current;
    const track = trackRef.current;
    const mm = gsap.matchMedia();

    mm.add('(min-width: 900px) and (prefers-reduced-motion: no-preference)', () => {
      const distance = () => Math.max(0, track.scrollWidth - track.parentElement.clientWidth);
      const slide = gsap.to(track, {
        x: () => -distance(),
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: () => `+=${distance()}`,
          pin: true,
          scrub: 0.7,
          invalidateOnRefresh: true,
          onUpdate: (self) => gsap.set(progressRef.current, { scaleX: self.progress }),
        },
      });

      gsap.utils.toArray('.traj__num', section).forEach((num) => {
        gsap.fromTo(
          num,
          { xPercent: 40, '--fill': 0 },
          {
            xPercent: 0,
            '--fill': 1,
            ease: 'none',
            scrollTrigger: { containerAnimation: slide, trigger: num, start: 'left 100%', end: 'left 35%', scrub: true },
          },
        );
      });

      gsap.utils.toArray('.traj__item', section).forEach((item) => {
        // Items already on screen when the pin starts reveal as the section arrives.
        const onScreen = item.getBoundingClientRect().left - track.getBoundingClientRect().left < window.innerWidth * 0.9;
        gsap.fromTo(
          item,
          { y: 50, autoAlpha: 0 },
          {
            y: 0,
            autoAlpha: 1,
            duration: 0.9,
            ease: 'power3.out',
            scrollTrigger: onScreen
              ? { trigger: section, start: 'top 45%', toggleActions: 'play none none reverse' }
              : { containerAnimation: slide, trigger: item, start: 'left 92%', toggleActions: 'play none none reverse' },
          },
        );
      });
    });

    mm.add('(max-width: 899px) and (prefers-reduced-motion: no-preference)', () => {
      gsap.utils.toArray('.traj__item', section).forEach((item) => {
        gsap.fromTo(
          item,
          { y: 30, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: item, start: 'top 90%' } },
        );
      });
    });

    return () => mm.revert();
  }, []);

  return (
    <section className="traj" id="trajectory" data-theme="ink" ref={ref} aria-labelledby="traj-title">
      <SectionHead title="trajectory" meta="nº 005 — milestones, 2023 → now" accent />

      <div className="traj__viewport">
        <div className="traj__track" ref={trackRef}>
          <div className="traj__intro">
            <h2 className="display" id="traj-title">
              trajectory<span className="accent">.</span>
            </h2>
            <p data-lines>
              From national rocketry and astronomy competitions to research papers, a Palantir
              fellowship and frontier models for finance. The milestones, in order.
            </p>
            <span className="label traj__hint">
              keep scrolling <Arrow dir="e" />
            </span>
          </div>

          {trajectory.map((group) => (
            <div className={`traj__year ${group.year === '2026' ? 'is-now' : ''}`} key={group.year}>
              <span className="traj__num" aria-hidden="true">
                {group.year}
              </span>
              <ol className="traj__items" aria-label={group.year}>
                {group.items.map((item) => (
                  <li className={`traj__item ${item.accent ? 'is-accent' : ''}`} key={item.what}>
                    <span className="traj__tick" aria-hidden="true" />
                    <span className="label label--dim">
                      {item.when === group.year ? group.year : `${item.when} ${group.year}`} · {item.kind}
                    </span>
                    <h3>{item.what}</h3>
                    <p>{item.who}</p>
                  </li>
                ))}
              </ol>
            </div>
          ))}

          <div className="traj__end">
            <div>
              <span className="label label--dim">alongside</span>
              <ul>
                {alongside.map((a) => (
                  <li key={a.who}>
                    <span>{a.what}</span>
                    <span className="label label--dim">{a.who}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <span className="label label--dim">speaks</span>
              <p className="traj__langs">{languages.join(' · ')}</p>
            </div>
            <a
              className="btn btn--orange"
              href="#artificial-hedge"
              data-magnetic
              onClick={(e) => {
                e.preventDefault();
                scrollToTarget('#artificial-hedge');
              }}
            >
              <Roll text="now: artificial hedge" /> <Arrow dir="n" />
            </a>
          </div>
        </div>
      </div>

      <div className="traj__rail" aria-hidden="true">
        <span className="traj__progress" ref={progressRef} />
      </div>
    </section>
  );
}
