"use client";

import { useEffect, useRef } from "react";

/*
 * Holds the home ridge's one moment (the cherries ripening) until the ridge is
 * actually seen. On a phone it sits below the fold and would finish before
 * anyone scrolled to it.
 *
 * The server HTML carries no attribute, so without JavaScript, or when the
 * ridge is already in view (desktop), the dots ripen on load as before. On
 * mount, if less than 60% of the ridge is visible, it waits
 * (data-ripen="wait" in globals.css shows the green, unripe dots); once 60% is
 * in view the attribute goes and the CSS animation plays from the start.
 * Reduced motion is untouched: the dots are simply ripe.
 */
export function RipenOnView({ className = "", children }: { className?: string; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const rect = el.getBoundingClientRect();
    const visible = Math.max(0, Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0));
    if (rect.height === 0 || visible / rect.height >= 0.6) return;

    el.dataset.ripen = "wait";
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          delete el.dataset.ripen;
          observer.disconnect();
        }
      },
      { threshold: 0.6 },
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      delete el.dataset.ripen;
    };
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
