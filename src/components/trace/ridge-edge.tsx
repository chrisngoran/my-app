import { farmers as allFarmers } from "@/lib/data";

/*
 * The bottom edge of the Volcanic Soil trace heroes: the same ridge as the
 * home hero (every member farm plotted by real altitude between the 1,600 m
 * and 2,000 m contours, lowest farms at the ends, the summit in the middle),
 * filled with Highland Mist so the band settles into the page along the
 * cooperative's own hillside instead of a generic wave.
 *
 * On a lot page the farms that grew the lot are marked in cherry and named;
 * the other farms stay small mist dots. Decorative: the h1 and lot record
 * already say which villages the lot came from.
 *
 * The geometry mirrors HeroRidge in storefront/hero-art.tsx (LOW/HIGH,
 * ridgeOrder, smoothPath). Keep the two in step until it moves to src/lib.
 */

const LOW = 1600;
const HIGH = 2000;

function heightPct(altitude: number) {
  return Math.min(100, Math.max(0, ((altitude - LOW) / (HIGH - LOW)) * 100));
}

function ridgeOrder<T>(ascending: T[]) {
  const up = ascending.filter((_, i) => i % 2 === 0);
  const down = ascending.filter((_, i) => i % 2 === 1).reverse();
  return [...up, ...down];
}

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

export function RidgeEdge({ highlight = [], className = "" }: { highlight?: string[]; className?: string }) {
  const ascending = [...allFarmers].sort((a, b) => a.altitudeMetres - b.altitudeMetres);
  const ridge = ridgeOrder(ascending);
  const n = ridge.length;
  const span = n > 1 ? 84 / (n - 1) : 0;
  const marks = ridge.map((f, i) => ({
    farmer: f,
    x: n > 1 ? 8 + i * span : 50,
    h: heightPct(f.altitudeMetres),
    lit: highlight.includes(f.id),
    align: i === 0 ? "start" : i === n - 1 ? "end" : "center",
  }));
  const pts: [number, number][] = marks.map((m) => [m.x, 100 - m.h]);
  const line =
    pts.length > 0
      ? smoothPath([[0, Math.min(100, pts[0][1] + 14)], ...pts, [100, Math.min(100, pts[pts.length - 1][1] + 14)]])
      : "M0 100 L100 100";

  return (
    <div aria-hidden="true" className={`pointer-events-none absolute inset-x-0 bottom-0 ${className}`}>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
        <path d={`${line} L100 100 L0 100 Z`} fill="var(--background)" />
      </svg>
      {marks.map((m) => (
        <div key={m.farmer.id} className="absolute h-0 w-0" style={{ left: `${m.x}%`, bottom: `${m.h}%` }}>
          {m.lit ? (
            <>
              <span className="absolute -bottom-[5px] -left-[5px] h-2.5 w-2.5 rounded-full bg-cherry-lift ring-2 ring-brand" />
              <span
                className={`absolute bottom-2.5 text-[0.8125rem] leading-tight font-semibold whitespace-nowrap text-sand [font-stretch:85%] ${
                  m.align === "start" ? "-left-[5px]" : m.align === "end" ? "-right-[5px]" : "left-0 -translate-x-1/2"
                }`}
              >
                {m.farmer.village}
              </span>
            </>
          ) : (
            <span className="absolute -bottom-[3px] -left-[3px] h-1.5 w-1.5 rounded-full bg-mist-on-soil" />
          )}
        </div>
      ))}
    </div>
  );
}
