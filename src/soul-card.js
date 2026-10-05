const activeCards = new WeakMap();

/** Initialize the personal playing card inside the portfolio iframe. */
export function initSoulCard(doc, win) {
  const chapter = doc.querySelector('[data-soul-card]');
  if (!chapter) return () => {};
  activeCards.get(chapter)?.();

  const stage = chapter.querySelector('[data-soul-stage]');
  const assembly = chapter.querySelector('[data-soul-assembly]');
  const stack = chapter.querySelector('[data-soul-stack]');
  const inner = chapter.querySelector('[data-soul-inner]');
  const front = chapter.querySelector('[data-soul-front]');
  const back = chapter.querySelector('[data-soul-back]');
  const toggle = chapter.querySelector('[data-soul-toggle]');
  const label = chapter.querySelector('[data-soul-toggle-label]');
  if (!stage || !stack || !inner || !front || !back || !toggle || !label) return () => {};

  const motionPreference = win.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = win.matchMedia('(hover: hover) and (pointer: fine)');
  let flipped = false;
  let pointerFrame = 0;
  let lastPointer = null;
  let alive = true;
  let animationContext = null;
  let observer = null;

  const showFace = (isFlipped) => {
    flipped = isFlipped;
    inner.classList.toggle('is-flipped', flipped);
    toggle.setAttribute('aria-pressed', String(flipped));
    toggle.setAttribute('aria-label', flipped
      ? 'Show the illustrated front of the Jack of Hearts playing card'
      : 'Show the disciplines on the back of the Jack of Hearts playing card');
    label.textContent = flipped ? 'Back to the front' : 'Turn the card';
    front.setAttribute('aria-hidden', String(flipped));
    back.setAttribute('aria-hidden', String(!flipped));
    front.toggleAttribute('inert', flipped);
    back.toggleAttribute('inert', !flipped);
    front.style.pointerEvents = flipped ? 'none' : 'auto';
    back.style.pointerEvents = flipped ? 'auto' : 'none';
  };

  const flipCard = () => showFace(!flipped);
  const resetTilt = () => {
    lastPointer = null;
    if (pointerFrame) win.cancelAnimationFrame(pointerFrame);
    pointerFrame = 0;
    stack.style.setProperty('--soul-tilt-x', '0deg');
    stack.style.setProperty('--soul-tilt-y', '0deg');
  };
  const renderTilt = () => {
    pointerFrame = 0;
    if (!alive || !lastPointer || motionPreference.matches || !finePointer.matches) return;
    const bounds = stack.getBoundingClientRect();
    const x = Math.max(-1, Math.min(1, (lastPointer.x - bounds.left - bounds.width / 2) / (bounds.width / 2)));
    const y = Math.max(-1, Math.min(1, (lastPointer.y - bounds.top - bounds.height / 2) / (bounds.height / 2)));
    stack.style.setProperty('--soul-tilt-x', `${(-y * 5).toFixed(2)}deg`);
    stack.style.setProperty('--soul-tilt-y', `${(x * 7).toFixed(2)}deg`);
  };
  const trackPointer = (event) => {
    if (motionPreference.matches || !finePointer.matches || event.pointerType === 'touch') return;
    lastPointer = { x: event.clientX, y: event.clientY };
    if (!pointerFrame) pointerFrame = win.requestAnimationFrame(renderTilt);
  };

  const revealChapter = () => {
    if (!alive || motionPreference.matches || !win.gsap) return;
    animationContext?.revert();
    animationContext = win.gsap.context(() => {
      win.gsap.fromTo(chapter.querySelectorAll('[data-soul-reveal]'),
        { y: 48, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.05, ease: 'power3.out', stagger: .09, clearProps: 'transform,opacity' });
      win.gsap.fromTo(assembly,
        { y: 85, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.35, delay: .16, ease: 'power3.out', clearProps: 'transform,opacity' });
    }, chapter);
  };

  const onMotionChange = () => {
    resetTilt();
    if (motionPreference.matches) {
      animationContext?.revert();
      animationContext = null;
    }
  };

  showFace(false);
  toggle.disabled = false;
  toggle.addEventListener('click', flipCard);
  stage.addEventListener('pointermove', trackPointer, { passive: true });
  stage.addEventListener('pointerleave', resetTilt, { passive: true });
  stage.addEventListener('pointercancel', resetTilt, { passive: true });
  motionPreference.addEventListener?.('change', onMotionChange);
  finePointer.addEventListener?.('change', resetTilt);

  if (!motionPreference.matches && win.gsap && win.IntersectionObserver) {
    observer = new win.IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        revealChapter();
        observer.disconnect();
      }
    }, { rootMargin: '0px 0px -15% 0px', threshold: .08 });
    observer.observe(chapter);
  }

  const cleanup = () => {
    alive = false;
    observer?.disconnect();
    animationContext?.revert();
    resetTilt();
    toggle.removeEventListener('click', flipCard);
    stage.removeEventListener('pointermove', trackPointer);
    stage.removeEventListener('pointerleave', resetTilt);
    stage.removeEventListener('pointercancel', resetTilt);
    motionPreference.removeEventListener?.('change', onMotionChange);
    finePointer.removeEventListener?.('change', resetTilt);
    toggle.disabled = true;
    showFace(false);
    activeCards.delete(chapter);
  };
  activeCards.set(chapter, cleanup);
  return cleanup;
}
