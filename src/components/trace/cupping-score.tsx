import { cuppingGrade, formatScore } from "./lot-utils";

/*
 * The cupping score as a ruler on the SCA scale, drawn on the Volcanic Soil
 * trace hero. The ticks are the real grade thresholds (80 specialty,
 * 85 excellent, 90 outstanding), so the marker's position means exactly what
 * the grade text says. The ruler runs 78 to 92: almost every specialty lot
 * lands inside it, and anything outside is pinned to the end it passed.
 *
 * Delight 2, the lot page's one moment: the fill and the marker draw in from
 * the left once, 600ms with --ease-out, from @starting-style. Both move with
 * transform only (scaleX on the fill, translateX on a full-width marker rail),
 * so it stays on the compositor. The resting style is the final state, so the
 * score is never hidden without transitions. An admin edit loaded after
 * hydration retargets the same transition instead of restarting it. The
 * number fades in with anim-swap and replays only when the score changes.
 * Reduced motion: static.
 *
 * `score` may come from browser storage, so anything that is not a finite
 * number between 0 and 100 renders as "not recorded" instead of crashing.
 */

const MIN = 78;
const MAX = 92;
const TICKS = [80, 85, 90];

const at = (score: number) => Math.min(1, Math.max(0, (score - MIN) / (MAX - MIN)));
const pct = (score: number) => `${(at(score) * 100).toFixed(2)}%`;

export function CuppingScore({ score, size = "lg" }: { score: number; size?: "lg" | "sm" }) {
  const value =
    typeof score === "number" && Number.isFinite(score) && score >= 0 && score <= 100 ? score : null;
  const fraction = value === null ? 0 : at(value);
  const text = value === null ? "–" : formatScore(value);
  const draw = "transition-transform duration-600 ease-(--ease-out) motion-reduce:transition-none";

  return (
    <figure className="w-full" style={{ "--f": fraction } as React.CSSProperties}>
      <p className="text-sm font-medium text-mist-on-soil">Taste score (SCA)</p>
      <p className="mt-1 flex flex-wrap items-baseline gap-x-3">
        <span
          key={text}
          className={`type-data anim-swap font-extrabold leading-none tabular-nums [font-stretch:80%] motion-reduce:animate-none ${
            size === "lg" ? "text-5xl sm:text-6xl" : "text-3xl"
          }`}
        >
          {text}
        </span>
        <span className="type-title text-sand">{value === null ? "Not recorded" : cuppingGrade(value)}</span>
      </p>

      <div aria-hidden="true" className="mt-4">
        {/* overflow-x-clip: the marker rail travels a full width to the right; never let it widen the page. */}
        <div className="relative h-6 overflow-x-clip">
          <div className="absolute inset-x-2 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-white/15">
            {TICKS.map((t) => (
              <span
                key={t}
                className="absolute top-1/2 h-3.5 w-px -translate-y-1/2 bg-mist-on-soil"
                style={{ left: pct(t) }}
              />
            ))}
            {value !== null && (
              <>
                <span
                  className={`absolute inset-0 origin-left rounded-full bg-cherry-lift [transform:scaleX(var(--f))] starting:[transform:scaleX(0)] ${draw}`}
                />
                <span
                  className={`absolute inset-0 [transform:translateX(calc(var(--f)*100%))] starting:[transform:translateX(0)] ${draw}`}
                >
                  <span className="absolute top-1/2 left-0 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cherry-lift ring-4 ring-brand" />
                </span>
              </>
            )}
          </div>
        </div>
        <div className="relative mx-2 h-5 text-xs font-medium text-mist-on-soil tabular-nums">
          {TICKS.map((t) => (
            <span key={t} className="absolute top-0.5 -translate-x-1/2" style={{ left: pct(t) }}>
              {t}
            </span>
          ))}
        </div>
      </div>

      <figcaption className="mt-2 text-sm text-pretty text-mist-on-soil">
        A taste test by trained tasters, out of 100. 80 or more is specialty grade.
      </figcaption>
    </figure>
  );
}
