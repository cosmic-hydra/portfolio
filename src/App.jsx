import { useCallback, useEffect, useRef } from "react";
import portfolioPageUrl from "./portfolio.html?url";
import { initSoulPortfolio } from "./soul.js";

export function App() {
  const frameRef = useRef(null);
  const cleanupRef = useRef(null);
  const enhanceFrame = useCallback(() => {
    const frame = frameRef.current;
    if (!frame?.contentDocument || frame.contentDocument.readyState !== 'complete') return;
    cleanupRef.current?.();
    cleanupRef.current = initSoulPortfolio(frame.contentDocument, frame.contentWindow);
  }, []);
  useEffect(() => {
    enhanceFrame();
    return () => cleanupRef.current?.();
  }, [enhanceFrame]);
  return (
    <main className="mirror-shell">
      <iframe
        className="mirror-frame"
        ref={frameRef}
        onLoad={enhanceFrame}
        src={portfolioPageUrl}
        title="advvvvaith — Advaith Vaithianathan's portfolio"
        allow="autoplay; fullscreen; picture-in-picture"
      />
    </main>
  );
}
