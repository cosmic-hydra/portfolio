import { useCallback, useEffect, useState } from 'react';
import { Contact } from './components/Contact.jsx';
import { Cursor } from './components/Cursor.jsx';
import { Hedge } from './components/Hedge.jsx';
import { Hero } from './components/Hero.jsx';
import { Loader } from './components/Loader.jsx';
import { Manifesto } from './components/Manifesto.jsx';
import { Nav } from './components/Nav.jsx';
import { Palette } from './components/Palette.jsx';
import { PixelEdge } from './components/PixelEdge.jsx';
import { Research } from './components/Research.jsx';
import { Trajectory } from './components/Trajectory.jsx';
import { Work } from './components/Work.jsx';
import { ScrollTrigger, lockScroll, reducedMotion, revealLines, startSmoothScroll } from './lib/motion.js';

export function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    window.scrollTo(0, 0);
    const stop = startSmoothScroll();
    // The loader unlocks scrolling when it finishes (immediately under reduced motion).
    if (!reducedMotion()) lockScroll(true);
    const refresh = () => ScrollTrigger.refresh();
    let unsplit = () => {};
    let alive = true;
    // Lines must be measured with the final fonts, so split after they load.
    (document.fonts?.ready ?? Promise.resolve()).then(() => {
      if (!alive) return;
      unsplit = revealLines();
      refresh();
    });
    window.addEventListener('load', refresh);
    return () => {
      alive = false;
      unsplit();
      stop();
      window.removeEventListener('load', refresh);
    };
  }, []);

  const onIntroDone = useCallback(() => {
    setReady(true);
    lockScroll(false);
  }, []);

  return (
    <>
      <a className="skip" href="#manifesto">
        Skip to content
      </a>
      <Loader onDone={onIntroDone} />
      <Nav />
      <main className={ready ? 'is-ready' : ''}>
        <Hero ready={ready} />
        <Manifesto />
        <PixelEdge from="paper" to="ink" seed={3} />
        <Hedge />
        <PixelEdge from="ink" to="orange" seed={8} />
        <Research />
        <Work />
        <PixelEdge from="paper" to="ink" seed={13} />
        <Trajectory />
      </main>
      <Contact />
      <Palette />
      <Cursor />
      <div className="grain" aria-hidden="true" />
    </>
  );
}
