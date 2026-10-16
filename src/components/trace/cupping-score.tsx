import { cuppingGrade, formatScore } from "./lot-utils";

/**
 * Circular gauge for a cupping score, drawn on the Volcanic Soil trace hero.
 * The ring maps the specialty range (70–95) to a full circle so differences
 * between lots are visible.
 *
 * Delight 2: the arc draws itself once when the gauge first renders (the
 * score is the payoff of scanning a bag). It is pure CSS: the final offset is
 * the resting style and @starting-style supplies the empty ring, so the score
 * is never hidden if transitions are unsupported. The number fades in with the
 * ring and replays only when the score itself changes (an admin edit). With
 * reduced motion both are static.
 *
 * `score` may come from browser storage, so anything that is not a finite
 * number between 0 and 100 renders as "not recorded" instead of crashing.
 */
export function CuppingScore({ score, size = "lg" }: { score: number; size?: "lg" | "sm" }) {
  const value = typeof score === "number" && Number.isFinite(score) ? Math.min(100, Math.max(0, score)) : null;
  const min = 70;
  const max = 95;
  const fraction = value === null ? 0 : Math.min(1, Math.max(0, (value - min) / (max - min)));
  const r = 52;
  const circumference = 2 * Math.PI * r;
  const dim = size === "lg" ? "h-40 w-40 sm:h-44 sm:w-44" : "h-28 w-28";
  const text = value === null ? "–" : formatScore(value);

  return (
    <figure className="flex flex-col items-start text-left md:items-center md:text-center">
      <div className={`relative ${dim}`}>
        <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90" aria-hidden="true">
          <circle cx="60" cy="60" r={r} fill="none" stroke="currentColor" strokeOpacity="0.18" strokeWidth="9" />
          <circle
            cx="60"
            cy="60"
            r={r}
            fill="none"
            stroke="var(--cherry-lift)"
            strokeWidth="9"
            strokeLinecap="round"
            strokeDasharray={`${circumference} ${circumference}`}
            style={
              {
                "--gauge-empty": `${circumference}px`,
                "--gauge-offset": `${circumference * (1 - fraction)}px`,
              } as React.CSSProperties
            }
            className="[stroke-dashoffset:var(--gauge-offset)] transition-[stroke-dashoffset] duration-600 ease-(--ease-out) starting:[stroke-dashoffset:var(--gauge-empty)] motion-reduce:transition-none"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span
            key={text}
            className={`type-data anim-swap font-extrabold leading-none tabular-nums [font-stretch:80%] motion-reduce:animate-none ${
              size === "lg" ? "text-5xl sm:text-6xl" : "text-3xl"
            }`}
          >
            {text}
          </span>
          <span className="mt-1 text-xs font-medium text-mist-on-soil">of 100 pts</span>
        </div>
      </div>
      <figcaption className="mt-3 max-w-[16rem]">
        <span className="block text-sm font-medium text-mist-on-soil">SCA cupping score</span>
        <span className="type-title mt-0.5 block text-sand">{value === null ? "Not recorded" : cuppingGrade(value)}</span>
        <span className="mt-1 block text-sm text-mist-on-soil">80+ points is specialty grade.</span>
      </figcaption>
    </figure>
  );
}
