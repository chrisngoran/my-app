import { ridgeGeometry } from "@/lib/ridge";
import type { Farmer } from "@/lib/types";

/*
 * "Six farms on one ridge": the member farms plotted by real altitude
 * (data.ts) between the 1,600 m and 2,000 m contours. A server component with
 * no client JavaScript: an SVG ridge that stretches to its box, two static
 * mist bands, and one HTML marker per farm so the labels stay crisp text.
 *
 * Delight 1: the farm dots ripen from leaf green to cherry once per load,
 * lowest farm first (.anim-ripen in globals.css; reduced motion shows them
 * ripe straight away). On a phone the ridge sits below the fold, so the page
 * wraps it in <RipenOnView>, which holds the moment until it is in view.
 * The geometry lives in src/lib/ridge.ts, shared with the trace hero edge.
 */

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
  const { ascending, marks: placed, peak, line } = ridgeGeometry(farmers);
  const marks = placed.map((m) => ({
    ...m,
    // Only the summit is labelled above its dot. Every other label hangs below
    // its dot on the downhill side, under the ridge line, so labels never cross
    // the line or each other: left of the summit they run right, right of it they run left.
    above: m.index === peak,
    align: m.index === peak ? "center" : m.index < peak ? "start" : "end",
  }));

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
                className={`absolute flex flex-col whitespace-nowrap leading-tight ${m.above ? "bottom-2.5" : "top-3.5"} ${
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
