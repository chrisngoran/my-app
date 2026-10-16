import type { Farmer } from "@/lib/types";

/*
 * "Six farms on one ridge": the member farms plotted by real altitude
 * (data.ts) between the 1,600 m and 2,000 m contours. A server component with
 * no client JavaScript: an SVG ridge that stretches to its box, two static
 * mist bands, and one HTML marker per farm so the labels stay crisp text.
 *
 * Delight 1: the farm dots ripen from leaf green to cherry once per load,
 * lowest farm first (.anim-ripen in globals.css; reduced motion shows them
 * ripe straight away).
 */

const LOW = 1600;
const HIGH = 2000;

/** Height on the ridge as a percentage of the plot, clamped to the two contours. */
function heightPct(altitude: number) {
  return Math.min(100, Math.max(0, ((altitude - LOW) / (HIGH - LOW)) * 100));
}

/** Lowest farms at the two ends, the highest in the middle: a0, a2, a4, … a5, a3, a1. */
function ridgeOrder<T>(ascending: T[]) {
  const up = ascending.filter((_, i) => i % 2 === 0);
  const down = ascending.filter((_, i) => i % 2 === 1).reverse();
  return [...up, ...down];
}

/** A smooth line through the points (Catmull-Rom converted to cubic Béziers). */
function smoothPath(points: [number, number][]) {
  const f = (n: number) => Number(n.toFixed(2));
  let d = `M${f(points[0][0])} ${f(points[0][1])}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${f(c1[0])} ${f(c1[1])} ${f(c2[0])} ${f(c2[1])} ${f(p2[0])} ${f(p2[1])}`;
  }
  return d;
}

const metres = (m: number) => `${m.toLocaleString("en-GB")} m`;

export function HeroRidge({
  farmers,
  labelledBy,
  className = "",
}: {
  farmers: Farmer[];
  /** id of the caption that names the figure ("Member farms by altitude. Sample data."). */
  labelledBy: string;
  className?: string;
}) {
  const ascending = [...farmers].sort((a, b) => a.altitudeMetres - b.altitudeMetres);
  const rank = new Map(ascending.map((f, i) => [f.id, i]));
  const ridge = ridgeOrder(ascending);
  const n = ridge.length;
  const span = n > 1 ? 84 / (n - 1) : 0;
  const peak = ridge.reduce((best, f, i) => (f.altitudeMetres > ridge[best].altitudeMetres ? i : best), 0);
  const marks = ridge.map((f, i) => ({
    farmer: f,
    x: n > 1 ? 8 + i * span : 50,
    h: heightPct(f.altitudeMetres),
    rank: rank.get(f.id) ?? i,
    // Only the summit is labelled above its dot. Every other label hangs below
    // its dot on the downhill side, under the ridge line, so labels never cross
    // the line or each other: left of the summit they run right, right of it they run left.
    above: i === peak,
    align: i === peak ? "center" : i < peak ? "start" : "end",
  }));

  // SVG y runs downwards; the ridge falls away past the first and last farm.
  const pts: [number, number][] = marks.map((m) => [m.x, 100 - m.h]);
  const line =
    pts.length > 0
      ? smoothPath([[0, Math.min(100, pts[0][1] + 14)], ...pts, [100, Math.min(100, pts[pts.length - 1][1] + 14)]])
      : "M0 100 L100 100";

  return (
    <figure aria-labelledby={labelledBy} className={`relative ${className}`}>
      <ul className="sr-only">
        {[...ascending].reverse().map((f) => (
          <li key={f.id}>
            {f.village}, {metres(f.altitudeMetres)}
          </li>
        ))}
      </ul>

      <div aria-hidden="true" className="absolute inset-0">
        {/* The hillside runs on below the lowest contour, down to the soil band. */}
        <div className="absolute inset-x-0 bottom-0 h-8 bg-accent-soft" />
        {/* Contour labels sit outside the plot so no farm label lands on them. */}
        <span className="absolute left-0 top-0 text-xs text-muted tabular">2,000 m</span>
        <span className="absolute bottom-1.5 left-0 text-xs text-muted tabular">1,600 m</span>

        <div className="absolute inset-x-0 bottom-8 top-6">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full overflow-visible">
            <path d={`${line} L100 100 L0 100 Z`} fill="var(--accent-soft)" />
            <line x1="0" y1="0" x2="100" y2="0" stroke="var(--field-border)" strokeWidth="1" strokeDasharray="3 4" vectorEffect="non-scaling-stroke" />
            <line x1="0" y1="100" x2="100" y2="100" stroke="var(--field-border)" strokeWidth="1" strokeDasharray="3 4" vectorEffect="non-scaling-stroke" />
            <path d={line} fill="none" stroke="var(--brand)" strokeWidth="2" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
          </svg>

          {/* Morning mist: two still bands. A slow drifting loop would be motion noise. */}
          {[35, 62].map((top) => (
            <div
              key={top}
              className="absolute inset-x-0 h-3.5 bg-[linear-gradient(90deg,transparent,rgb(255_255_255/0.55),transparent)]"
              style={{ top: `${top}%` }}
            />
          ))}

          {marks.map((m) => (
            <div key={m.farmer.id} className="absolute h-0 w-0" style={{ left: `${m.x}%`, bottom: `${m.h}%` }}>
              <span
                className="anim-ripen absolute -bottom-[5px] -left-[5px] h-2.5 w-2.5 rounded-full bg-cherry ring-2 ring-background"
                style={{ "--i": m.rank } as React.CSSProperties}
              />
              <span
                className={`absolute flex flex-col whitespace-nowrap leading-tight ${m.above ? "bottom-2.5" : "top-2.5"} ${
                  m.align === "start" ? "-left-[5px]" : m.align === "end" ? "-right-[5px] items-end" : "left-0 -translate-x-1/2 items-center"
                }`}
              >
                <span className="text-[0.8125rem] font-semibold text-brand [font-stretch:85%]">{m.farmer.village}</span>
                <span className="text-xs text-muted tabular">{metres(m.farmer.altitudeMetres)}</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </figure>
  );
}
