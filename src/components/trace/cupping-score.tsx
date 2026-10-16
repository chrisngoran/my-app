import { cuppingGrade } from "./lot-utils";

/**
 * Circular gauge for a cupping score. The ring maps the specialty range
 * (70–95) to a full circle so differences between lots are visible.
 *
 * The arc draws itself once when the gauge first renders (the score is the
 * payoff of scanning a bag). It is pure CSS: the final offset is the resting
 * style and @starting-style supplies the empty ring, so the score is never
 * hidden if CSS transitions are unsupported, and reduced motion shows it final.
 */
export function CuppingScore({ score, size = "lg" }: { score: number; size?: "lg" | "sm" }) {
  const min = 70;
  const max = 95;
  const fraction = Math.min(1, Math.max(0, (score - min) / (max - min)));
  const r = 52;
  const circumference = 2 * Math.PI * r;
  const dim = size === "lg" ? "h-40 w-40 sm:h-44 sm:w-44" : "h-28 w-28";

  return (
    <figure className="flex flex-col items-center text-center">
      <div className={`relative ${dim}`}>
        <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90" aria-hidden="true">
          <circle cx="60" cy="60" r={r} fill="none" stroke="currentColor" strokeOpacity="0.15" strokeWidth="9" />
          <circle
            cx="60"
            cy="60"
            r={r}
            fill="none"
            stroke="var(--warm)"
            strokeWidth="9"
            strokeLinecap="round"
            strokeDasharray={`${circumference} ${circumference}`}
            style={
              {
                "--gauge-empty": `${circumference}px`,
                "--gauge-offset": `${circumference * (1 - fraction)}px`,
              } as React.CSSProperties
            }
            className="[stroke-dashoffset:var(--gauge-offset)] transition-[stroke-dashoffset] duration-600 ease-out starting:[stroke-dashoffset:var(--gauge-empty)] motion-reduce:transition-none"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`font-serif font-bold leading-none ${size === "lg" ? "text-4xl sm:text-5xl" : "text-3xl"}`}>
            {score.toFixed(2).replace(/\.?0+$/, "")}
          </span>
          <span className="mt-1 text-xs font-semibold tracking-wide opacity-80">of 100 pts</span>
        </div>
      </div>
      <figcaption className="mt-3">
        <span className="block text-xs font-semibold uppercase tracking-wider opacity-80">SCA cupping score</span>
        <span className="mt-1 inline-block rounded-full border border-current/30 px-3 py-0.5 text-sm font-semibold">
          {cuppingGrade(score)}
        </span>
        <span className="mt-2 block text-xs opacity-80">80+ points is specialty grade</span>
      </figcaption>
    </figure>
  );
}
