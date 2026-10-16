import type { Farmer } from "./types";

/*
 * The cooperative's one signature shape: the member farms plotted by real
 * altitude between the 1,600 m and 2,000 m contours, the lowest farms at the
 * two ends and the summit in the middle. Shared by the home hero ridge, the
 * trace hero edge and (redrawn by hand) the product bag art, so every ridge on
 * the site is the same hillside.
 *
 * Coordinates are in a 100 × 100 box with y running downwards, ready for an
 * SVG with viewBox="0 0 100 100".
 */

export const RIDGE_LOW = 1600;
export const RIDGE_HIGH = 2000;

/** Height on the ridge as a percentage of the plot, clamped to the two contours. */
export function ridgeHeightPct(altitude: number) {
  return Math.min(100, Math.max(0, ((altitude - RIDGE_LOW) / (RIDGE_HIGH - RIDGE_LOW)) * 100));
}

/** Lowest farms at the two ends, the highest in the middle: a0, a2, a4, … a5, a3, a1. */
export function ridgeOrder<T>(ascending: T[]) {
  const up = ascending.filter((_, i) => i % 2 === 0);
  const down = ascending.filter((_, i) => i % 2 === 1).reverse();
  return [...up, ...down];
}

/** A smooth line through the points (Catmull-Rom converted to cubic Béziers). */
export function smoothPath(points: [number, number][]) {
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

export interface RidgeMark {
  farmer: Farmer;
  /** Left edge to right edge, 8 to 92. */
  x: number;
  /** Height above the 1,600 m contour, 0 to 100. */
  h: number;
  /** Altitude rank, 0 = lowest farm. */
  rank: number;
  /** Position along the ridge, left to right. */
  index: number;
}

/** Every farm placed on the ridge, plus the ridge line itself (open path) through them. */
export function ridgeGeometry(farmers: Farmer[]) {
  const ascending = [...farmers].sort((a, b) => a.altitudeMetres - b.altitudeMetres);
  const rank = new Map(ascending.map((f, i) => [f.id, i]));
  const ridge = ridgeOrder(ascending);
  const n = ridge.length;
  const span = n > 1 ? 84 / (n - 1) : 0;
  const marks: RidgeMark[] = ridge.map((f, i) => ({
    farmer: f,
    x: n > 1 ? 8 + i * span : 50,
    h: ridgeHeightPct(f.altitudeMetres),
    rank: rank.get(f.id) ?? i,
    index: i,
  }));
  const peak = marks.reduce((best, m, i) => (m.h > marks[best].h ? i : best), 0);
  // The ridge falls away past the first and last farm.
  const pts: [number, number][] = marks.map((m) => [m.x, 100 - m.h]);
  const line =
    pts.length > 0
      ? smoothPath([[0, Math.min(100, pts[0][1] + 14)], ...pts, [100, Math.min(100, pts[pts.length - 1][1] + 14)]])
      : "M0 100 L100 100";
  return { ascending, marks, peak, line };
}
