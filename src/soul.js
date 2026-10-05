import styles from './soul.css?inline';
import cardStyles from './soul-card.css?inline';
import { initSoulCard } from './soul-card.js';
import { initSoulWork } from './soul-work.js';

/** All DOM and animation work stays inside the portfolio's same-origin frame. */
export function initSoulPortfolio(doc, win) {
  if (!doc?.body || !win) return () => {};
  const cleanups = [];
  const style = doc.createElement('style');
  style.dataset.soulStyles = 'true';
  style.textContent = styles + '\n' + cardStyles;
  doc.head.append(style);
  doc.body.classList.add('soul-portfolio');
  cleanups.push(() => style.remove());
  cleanups.push(initSoulCard(doc, win), initSoulWork(doc, win));

  const motion = win.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = win.matchMedia('(hover: hover) and (pointer: fine)');
  const progress = doc.createElement('div');
  progress.className = 'soul-progress';
  progress.setAttribute('aria-hidden', 'true');
  const marker = doc.createElement('div');
  marker.className = 'soul-chapter-marker';
  marker.setAttribute('aria-hidden', 'true');
  doc.body.append(progress, marker);
  cleanups.push(() => { progress.remove(); marker.remove(); });

  const chapters = [
    [doc.querySelector('.willem-header'), '01 / ADVAITH'],
    [doc.getElementById('about'), '02 / THE PERSON'],
    [doc.getElementById('identity'), '03 / ALL TRADES'],
    [doc.getElementById('services'), '04 / THE WORLDS'],
    [doc.getElementById('work'), '05 / SELECTED WORK'],
    [doc.getElementById('throughline'), '06 / THE THROUGHLINE'],
    [doc.getElementById('process'), '07 / THE PRACTICE'],
    [doc.querySelector('.footer-wrap'), '08 / WHAT NEXT?'],
  ].filter(([element]) => element);
  const photo = doc.querySelector('.willem__cover-image');
  let scrollRaf = 0;
  function paintScroll() {
    scrollRaf = 0;
    const y = win.scrollY;
    const height = Math.max(1, doc.documentElement.scrollHeight - win.innerHeight);
    progress.style.transform = `scaleX(${Math.min(1, y / height)})`;
    let current = chapters[0]?.[1] || '';
    for (const [element, label] of chapters) {
      if (element.getBoundingClientRect().top < win.innerHeight * 0.52) current = label;
    }
    marker.textContent = current;
    if (photo && !motion.matches && y < win.innerHeight * 1.1) {
      photo.style.transform = `translate3d(0,${-Math.min(32, y * 0.045)}px,0) scale(1.015)`;
    }
  }
  function queueScroll() { if (!scrollRaf) scrollRaf = win.requestAnimationFrame(paintScroll); }
  win.addEventListener('scroll', queueScroll, { passive:true });
  win.addEventListener('resize', queueScroll, { passive:true });
  paintScroll();
  cleanups.push(() => {
    win.removeEventListener('scroll', queueScroll); win.removeEventListener('resize', queueScroll);
    win.cancelAnimationFrame(scrollRaf); if(photo) photo.style.transform='';
  });

  const clock = doc.querySelector('.soul-local-time');
  function paintClock() {
    if (clock) clock.textContent = new Intl.DateTimeFormat('en-GB', {timeZone:'Asia/Kolkata',hour:'2-digit',minute:'2-digit',hour12:false}).format(new Date()) + ' / BENGALURU';
  }
  paintClock();
  const clockInterval = win.setInterval(paintClock, 60000);
  cleanups.push(() => win.clearInterval(clockInterval));

  const closeMenuOnNavigate = event => {
    if(event.target.closest('.bold-nav-full__link, .bold-nav-full__logo')) {
      doc.querySelector('.bold-nav-full')?.setAttribute('data-navigation-status', 'not-active');
    }
  };
  doc.addEventListener('click', closeMenuOnNavigate, true);
  cleanups.push(() => doc.removeEventListener('click', closeMenuOnNavigate, true));

  // A pinned project must be reached at its ScrollTrigger start, before its exit transform.
  const navigateCard = event => {
    const link = event.target.closest('.soul-card-disciplines a');
    if(!link || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const target = doc.getElementById(link.getAttribute('href').slice(1));
    if(!target) return;
    const slide = target.closest('.case-slide');
    const pin = win.ScrollTrigger?.getAll().find(trigger => trigger.trigger === slide && trigger.pin);
    const top = pin ? pin.start + 2 : target.getBoundingClientRect().top + win.scrollY - 30;
    event.preventDefault(); event.stopPropagation();
    if(win.portfolioLenis) win.portfolioLenis.scrollTo(top, {force:true, immediate:motion.matches});
    else win.scrollTo({top, behavior:motion.matches ? 'instant' : 'smooth'});
  };
  doc.addEventListener('click',navigateCard,true);
  cleanups.push(() => doc.removeEventListener('click',navigateCard,true));

  // Reveals stop at the section boundary and never hide important content without JS.
  const revealTargets = doc.querySelectorAll('.soul-manifesto h2 span, .soul-manifesto-bottom, .soul-about-links');
  let gsapContext;
  if (win.gsap && !motion.matches) {
    gsapContext = win.gsap.context(() => {
      revealTargets.forEach(element => {
        win.gsap.from(element, {
          y:55, opacity:0, duration:1, ease:'power3.out',
          scrollTrigger:{trigger:element, start:'top 92%', once:true},
          clearProps:'transform,opacity',
        });
      });
    }, doc.body);
    cleanups.push(() => gsapContext?.revert());
  }

  let cursorRaf = 0;
  let stopCursor = null;
  if (finePointer.matches && !motion.matches) {
    const cursor = doc.createElement('div');
    cursor.className = 'soul-project-cursor';
    cursor.innerHTML = 'VIEW<br>PROJECT ↗';
    cursor.setAttribute('aria-hidden','true');
    doc.body.append(cursor);
    doc.body.classList.add('soul-cursor-ready');
    let px=0, py=0, cx=0, cy=0, active=false, cursorStopped=false;
    function move(e) { px=e.clientX-36; py=e.clientY-36; }
    function drawCursor() {
      if(cursorStopped) { cursorRaf=0; return; }
      cx += (px-cx)*.22; cy += (py-cy)*.22;
      cursor.style.transform = `translate3d(${cx}px,${cy}px,0) scale(${active?1:0})`;
      if(active || Math.abs(px-cx)>1 || Math.abs(py-cy)>1) cursorRaf=win.requestAnimationFrame(drawCursor);
      else cursorRaf=0;
    }
    function enter(e) { if(cursorStopped) return; move(e); cx=px;cy=py; active=true; if(!cursorRaf) drawCursor(); }
    function leave() { active=false; cursor.style.transform=`translate3d(${cx}px,${cy}px,0) scale(0)`; }
    doc.addEventListener('pointermove',move,{passive:true});
    doc.querySelectorAll('.case-content_guts').forEach(a=>{
      a.addEventListener('pointerenter',enter);a.addEventListener('pointerleave',leave);
      cleanups.push(()=>{a.removeEventListener('pointerenter',enter);a.removeEventListener('pointerleave',leave);});
    });
    stopCursor = () => {
      if(cursorStopped) return;
      cursorStopped = true;
      active = false;
      win.cancelAnimationFrame(cursorRaf);cursor.remove();doc.removeEventListener('pointermove',move);
      doc.body.classList.remove('soul-cursor-ready');
    };
    cleanups.push(stopCursor);
  }

  const particles = new Set();
  let lastDeal=0;
  const onDeal = event => {
    const button = event.target.closest('.soul-deal-btn');
    if (!button || Date.now()-lastDeal<850) return;
    lastDeal=Date.now();
    if (motion.matches || !win.gsap) { button.firstChild.textContent='A LITTLE CURIOSITY, DEALT '; return; }
    const rect=button.getBoundingClientRect();
    for(let i=0;i<5;i++) {
      const card=doc.createElement('img');
      card.className='soul-dealt-card';card.src='/assets/portfolio/jack-of-all-trades-v2.png';
      card.alt='';card.setAttribute('aria-hidden','true');
      card.style.left=`${Math.min(win.innerWidth-100, rect.left+rect.width/2)}px`;
      card.style.top=`${rect.top}px`;
      doc.body.append(card);particles.add(card);
      win.gsap.fromTo(card, {y:0, x:0, rotation:i*12-25, scale:.7}, {
        y:-win.innerHeight*.7-i*60,x:(i-2)*80,rotation:(i-2)*35,scale:1,opacity:0,
        duration:1.55,delay:i*.055,ease:'power2.out',onComplete:()=>{card.remove();particles.delete(card);},
      });
    }
  };
  doc.addEventListener('click',onDeal);
  cleanups.push(()=>{
    doc.removeEventListener('click',onDeal);
    particles.forEach(card=>{win.gsap?.killTweensOf(card);card.remove();});
  });
  function preferenceChanged() {
    if(motion.matches) {
      gsapContext?.revert(); gsapContext = null;
      stopCursor?.();
      if(photo) photo.style.transform='';
    }
    if(!finePointer.matches) stopCursor?.();
    queueScroll();
  }
  motion.addEventListener('change', preferenceChanged);
  finePointer.addEventListener('change', preferenceChanged);
  cleanups.push(()=>{
    motion.removeEventListener('change', preferenceChanged);
    finePointer.removeEventListener('change', preferenceChanged);
  });
  // The original page recalculates its pinned sections after the new chapter settles.
  win.ScrollTrigger?.refresh();
  return () => cleanups.reverse().forEach(cleanup => { if(typeof cleanup==='function') cleanup(); });
}
