import { useEffect, useRef, useState } from 'react';
import { nav, profile } from '../content.js';
import { ScrollTrigger, gsap, lockScroll, scrollToTarget } from '../lib/motion.js';
import { useBengaluruTime } from '../lib/time.js';
import { Arrow, ExtLink, Roll } from './ui.jsx';

// Tracks which section sits under the nav so its colour can contrast with it.
function useThemeUnderNav() {
  const [theme, setTheme] = useState('paper');
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => e.isIntersecting && setTheme(e.target.dataset.theme));
      },
      { rootMargin: '0px 0px -95% 0px' },
    );
    document.querySelectorAll('[data-theme]').forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  return theme;
}

// Highlights the nav link for the section in the middle of the viewport.
function useActiveSection() {
  const [active, setActive] = useState(null);
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: '-50% 0px -50% 0px' },
    );
    document.querySelectorAll('main section[id], #contact').forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  return active;
}

export function Nav() {
  const time = useBengaluruTime();
  const [open, setOpen] = useState(false);
  const theme = useThemeUnderNav();
  const active = useActiveSection();
  const progressRef = useRef(null);

  useEffect(() => {
    const st = ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: (self) => gsap.set(progressRef.current, { scaleX: self.progress }),
    });
    return () => st.kill();
  }, []);

  useEffect(() => {
    lockScroll(open);
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const go = (e, id) => {
    e.preventDefault();
    setOpen(false);
    scrollToTarget(`#${id}`);
  };

  return (
    <>
      <header className="nav" data-on={open ? 'ink' : theme}>
        <a className="nav__brand" href="#top" data-magnetic onClick={(e) => go(e, 'top')}>
          <Roll text="advvvvaith" />
        </a>
        <nav className="nav__links" aria-label="Sections">
          {nav.map((item, i) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className={active === item.id ? 'is-active' : ''}
              aria-current={active === item.id ? 'true' : undefined}
              onClick={(e) => go(e, item.id)}
            >
              <span className="nav__num">0{i + 1}</span>
              <Roll text={item.label} />
            </a>
          ))}
        </nav>
        <span className="nav__time" aria-label={`Local time in Bengaluru: ${time}`}>
          <span className="nav__pulse" aria-hidden="true" />
          blr {time}
        </span>
        <button
          className="nav__menu"
          type="button"
          aria-expanded={open}
          aria-controls="menu"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? 'close' : 'menu'}
        </button>
        <span className="nav__progress" ref={progressRef} aria-hidden="true" />
      </header>

      <div id="menu" className={`menu ${open ? 'is-open' : ''}`} inert={!open}>
        <nav aria-label="Menu">
          {nav.map((item, i) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              tabIndex={open ? 0 : -1}
              onClick={(e) => go(e, item.id)}
              style={{ '--i': i }}
            >
              <span className="label">0{i + 1}</span>
              {item.label}
            </a>
          ))}
        </nav>
        <div className="menu__foot">
          <a className="label" href={`mailto:${profile.email}`} tabIndex={open ? 0 : -1}>
            {profile.email}
          </a>
          <ExtLink className="label" href={profile.links.hedge} tabIndex={open ? 0 : -1}>
            artificialhedge.co <Arrow />
          </ExtLink>
        </div>
      </div>
    </>
  );
}
