import portfolioPageUrl from "./portfolio.html?url";

export function App() {
  return (
    <main className="mirror-shell">
      <iframe
        className="mirror-frame"
        src={portfolioPageUrl}
        title="advvvvaith — Advaith Vaithianathan's portfolio"
        allow="autoplay; fullscreen; picture-in-picture"
      />
    </main>
  );
}
