import { useCallback, useEffect, useState } from "react";
import "../styles/splash.css";

type Phase = "hidden" | "visible" | "exiting";

const SESSION_KEY = "scriptorium_splash_seen";

export default function SplashScreen({
  panelImageUrl,
}: { panelImageUrl?: string } = {}) {
  const [phase, setPhase] = useState<Phase>("hidden");

  const dismiss = useCallback(() => {
    if (phase !== "visible") return;
    sessionStorage.setItem(SESSION_KEY, "1");
    setPhase("exiting");
    setTimeout(() => setPhase("hidden"), 450);
  }, [phase]);

  useEffect(() => {
    if (sessionStorage.getItem(SESSION_KEY)) return;
    const timer = setTimeout(() => setPhase("visible"), 80);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (phase !== "visible") return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "Enter" || e.key === " ") dismiss();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [phase, dismiss]);

  if (phase === "hidden") return null;

  return (
    <div
      className={`splash-overlay${phase === "exiting" ? " splash-overlay--exiting" : ""}`}
      onClick={dismiss}
      role="dialog"
      aria-modal="true"
      aria-label="Welcome to The Scriptorium"
    >
      <div className="splash-diptych" onClick={(e) => e.stopPropagation()}>
        {/* Left panel — Kirby Krackle (or assigned image) */}
        <div
          className="splash-panel splash-panel--kirby"
          {...(panelImageUrl ? { "data-has-image": "true" } : {})}
        >
          {panelImageUrl && (
            <img
              className="splash-panel__img"
              src={panelImageUrl}
              alt=""
              aria-hidden="true"
            />
          )}
          <span className="kirby-badge">New Issue!</span>
        </div>

        {/* Right panel — Title + CTA */}
        <div className="splash-panel splash-panel--title">
          <span className="splash-eyebrow">
            The Happy Feeling Scriptorium Presents
          </span>

          <h1 className="splash-title">
            Where Artists
            <br />
            Tell Their
            <br />
            Stories
          </h1>

          <p className="splash-tagline">
            Comics. Cartoons. Portraits.
            <br />
            Superhero action &amp; beyond.
          </p>

          <button className="splash-cta" onClick={dismiss} type="button">
            Enter The Happy Feeling Scriptorium →
          </button>
        </div>

        {/* Speech bubble — positioned absolute via CSS */}
        <div className="splash-bubble" aria-hidden="true">
          Welcome, creator. Your story starts here.
        </div>
      </div>

      <button
        className="splash-skip"
        onClick={dismiss}
        type="button"
        aria-label="Skip intro"
      >
        press any key or click anywhere to enter
      </button>
    </div>
  );
}
