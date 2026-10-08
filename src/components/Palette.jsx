import { useEffect, useMemo, useRef, useState } from 'react';
import { nav, profile } from '../content.js';
import { lockScroll, scrollToTarget } from '../lib/motion.js';
import { Arrow } from './ui.jsx';

export const openPalette = () => window.dispatchEvent(new Event('palette:open'));

const isMac = typeof navigator !== 'undefined' && /mac|iphone|ipad/i.test(navigator.platform || navigator.userAgent);
export const paletteKey = isMac ? '⌘K' : 'Ctrl K';

function buildCommands(copyEmail) {
  const open = (url) => () => window.open(url, '_blank', 'noopener,noreferrer');
  return [
    { group: 'jump to', label: 'top', hint: '00', run: () => scrollToTarget('#top') },
    { group: 'jump to', label: 'principle', hint: '—', run: () => scrollToTarget('#manifesto') },
    ...nav.map((item, i) => ({
      group: 'jump to',
      label: item.label,
      hint: `0${i + 1}`,
      run: () => scrollToTarget(`#${item.id}`),
    })),
    { group: 'actions', label: 'copy email address', hint: profile.email, run: copyEmail },
    { group: 'actions', label: 'write an email', hint: 'mailto', run: () => (window.location.href = `mailto:${profile.email}`) },
    { group: 'open', label: 'artificialhedge.co', hint: 'company', run: open(profile.links.hedge), ext: true },
    { group: 'open', label: 'inference portal', hint: 'fx models', run: open(profile.links.portal), ext: true },
    { group: 'open', label: 'linkedin', hint: 'profile', run: open(profile.links.linkedin), ext: true },
    { group: 'open', label: 'github', hint: 'cosmic-hydra', run: open(profile.links.github), ext: true },
    { group: 'open', label: 'orcid', hint: 'research', run: open(profile.links.orcid), ext: true },
  ];
}

// A keyboard-first command menu: ⌘K / Ctrl K or "/" opens it.
export function Palette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [index, setIndex] = useState(0);
  const [toast, setToast] = useState('');
  const inputRef = useRef(null);
  const returnFocus = useRef(null);

  const commands = useMemo(
    () =>
      buildCommands(async () => {
        try {
          await navigator.clipboard.writeText(profile.email);
          setToast('email copied');
        } catch {
          setToast(profile.email);
        }
      }),
    [],
  );

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter((c) => `${c.group} ${c.label} ${c.hint}`.toLowerCase().includes(q));
  }, [commands, query]);

  useEffect(() => {
    const onKey = (e) => {
      const typing = /input|textarea|select/i.test(document.activeElement?.tagName ?? '');
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || (e.key === '/' && !typing && !open)) {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    const onOpen = () => setOpen(true);
    window.addEventListener('keydown', onKey);
    window.addEventListener('palette:open', onOpen);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('palette:open', onOpen);
    };
  }, [open]);

  useEffect(() => {
    if (open) {
      returnFocus.current = document.activeElement;
      setQuery('');
      setIndex(0);
      lockScroll(true);
      requestAnimationFrame(() => inputRef.current?.focus());
    } else if (returnFocus.current) {
      lockScroll(false);
      returnFocus.current.focus?.();
      returnFocus.current = null;
    }
  }, [open]);

  useEffect(() => {
    if (!toast) return undefined;
    const id = setTimeout(() => setToast(''), 1800);
    return () => clearTimeout(id);
  }, [toast]);

  const run = (cmd) => {
    setOpen(false);
    // Let the menu close (and scrolling unlock) before jumping.
    setTimeout(cmd.run, 60);
  };

  const onKeyDown = (e) => {
    if (e.key === 'Escape') setOpen(false);
    else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setIndex((i) => (i + 1) % Math.max(1, results.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setIndex((i) => (i - 1 + results.length) % Math.max(1, results.length));
    } else if (e.key === 'Enter' && results[index]) {
      e.preventDefault();
      run(results[index]);
    } else if (e.key === 'Tab') e.preventDefault();
  };

  let lastGroup = null;
  return (
    <>
      <div className={`palette ${open ? 'is-open' : ''}`} inert={!open} onPointerDown={(e) => e.target === e.currentTarget && setOpen(false)}>
        <div className="palette__panel" role="dialog" aria-modal="true" aria-label="Command menu">
          <div className="palette__bar">
            <span className="palette__prompt" aria-hidden="true">›</span>
            <input
              ref={inputRef}
              className="palette__input"
              value={query}
              placeholder="jump to a section or run a command…"
              role="combobox"
              aria-expanded="true"
              aria-controls="palette-list"
              aria-activedescendant={results[index] ? `cmd-${index}` : undefined}
              onChange={(e) => {
                setQuery(e.target.value);
                setIndex(0);
              }}
              onKeyDown={onKeyDown}
            />
            <kbd className="palette__esc">esc</kbd>
          </div>
          <ul className="palette__list" id="palette-list" role="listbox">
            {results.length === 0 && <li className="palette__empty label">no matches</li>}
            {results.map((cmd, i) => {
              const header = cmd.group !== lastGroup ? cmd.group : null;
              lastGroup = cmd.group;
              return (
                <li key={`${cmd.group}-${cmd.label}`} role="presentation">
                  {header && <span className="palette__group label">{header}</span>}
                  <button
                    type="button"
                    id={`cmd-${i}`}
                    role="option"
                    aria-selected={i === index}
                    className={`palette__item ${i === index ? 'is-active' : ''}`}
                    style={{ '--i': i }}
                    tabIndex={-1}
                    onPointerMove={() => setIndex(i)}
                    onClick={() => run(cmd)}
                  >
                    <span className="palette__label">{cmd.label}</span>
                    <span className="palette__hint label">{cmd.hint}</span>
                    {cmd.ext ? <Arrow /> : <Arrow dir="e" />}
                  </button>
                </li>
              );
            })}
          </ul>
          <div className="palette__foot label">
            <span>↑↓ navigate</span>
            <span>↵ select</span>
            <span>{paletteKey} toggle</span>
          </div>
        </div>
      </div>
      <div className={`toast label ${toast ? 'is-on' : ''}`} role="status">
        {toast}
      </div>
    </>
  );
}
