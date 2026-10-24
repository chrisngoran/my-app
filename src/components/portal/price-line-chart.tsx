"use client";

import { useId, useRef, useState } from "react";
import type { PricePoint } from "@/lib/world-price";

const PAD = { top: 14, right: 18, bottom: 38, left: 60 };
const W = 560;
const H = 220;
const PLOT_W = W - PAD.left - PAD.right;
const PLOT_H = H - PAD.top - PAD.bottom;

const MONTH_ABBR = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function niceStep(rough: number) {
  const pow = Math.pow(10, Math.floor(Math.log10(rough)));
  const f = rough / pow;
  if (f < 1.5) return pow;
  if (f < 3) return 2 * pow;
  if (f < 7) return 5 * pow;
  return 10 * pow;
}

function yRange(prices: number[], tickCount = 5) {
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const pad = (max - min) * 0.08;
  const step = niceStep((max - min + pad * 2) / (tickCount - 1));
  const lo = Math.floor((min - pad) / step) * step;
  return { lo, hi: lo + step * (tickCount - 1), ticks: Array.from({ length: tickCount }, (_, i) => lo + i * step) };
}

export function PriceLineChart({ points }: { points: PricePoint[] }) {
  const clipId = useId();
  const gradId = `${clipId}-g`;
  const svgRef = useRef<SVGSVGElement>(null);
  const [hover, setHover] = useState<{ xi: number; x: number; y: number } | null>(null);

  if (points.length < 2) {
    return <p className="p-4 text-sm text-muted">No price data available.</p>;
  }

  const prices = points.map((p) => p.centsPerLb / 100);
  const { lo, hi, ticks } = yRange(prices);

  const xOf = (i: number) => (i / (points.length - 1)) * PLOT_W;
  const yOf = (v: number) => PLOT_H - ((v - lo) / (hi - lo)) * PLOT_H;

  const linePath = points
    .map((p, i) => `${i === 0 ? "M" : "L"}${xOf(i).toFixed(1)},${yOf(p.centsPerLb / 100).toFixed(1)}`)
    .join(" ");
  const areaPath = `${linePath} L${xOf(points.length - 1).toFixed(1)},${PLOT_H} L0,${PLOT_H} Z`;

  const xLabelCount = Math.min(6, points.length);
  const xLabelIndices = Array.from({ length: xLabelCount }, (_, i) =>
    Math.round((i / (xLabelCount - 1)) * (points.length - 1)),
  );

  function onMouseMove(e: React.MouseEvent<SVGSVGElement>) {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const svgX = ((e.clientX - rect.left) / rect.width) * W - PAD.left;
    const idx = Math.max(0, Math.min(points.length - 1, Math.round((svgX / PLOT_W) * (points.length - 1))));
    setHover({ xi: idx, x: xOf(idx), y: yOf(points[idx].centsPerLb / 100) });
  }

  const hoverPt = hover ? points[hover.xi] : null;
  const ttX = hover ? (hover.x > PLOT_W * 0.6 ? hover.x - 116 : hover.x + 14) : 0;
  const ttY = hover ? Math.max(2, hover.y - 24) : 0;

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${W} ${H}`}
      className="w-full overflow-visible select-none"
      aria-label="Arabica C daily closing price over the last 90 days"
      role="img"
      onMouseMove={onMouseMove}
      onMouseLeave={() => setHover(null)}
    >
      <defs>
        <clipPath id={clipId}>
          <rect x={0} y={0} width={PLOT_W} height={PLOT_H} />
        </clipPath>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--color-brand)" stopOpacity="0.18" />
          <stop offset="100%" stopColor="var(--color-brand)" stopOpacity="0" />
        </linearGradient>
      </defs>

      <g transform={`translate(${PAD.left},${PAD.top})`}>
        {/* Grid lines + Y labels */}
        {ticks.map((tick) => {
          const yy = yOf(tick).toFixed(1);
          return (
            <g key={tick}>
              <line x1={0} y1={yy} x2={PLOT_W} y2={yy} stroke="var(--color-border)" strokeWidth="1" />
              <text x={-8} y={yy} textAnchor="end" dominantBaseline="middle" fontSize="11" fill="var(--color-muted)" fontFamily="inherit">
                {tick.toFixed(2)}
              </text>
            </g>
          );
        })}

        {/* X-axis labels */}
        {xLabelIndices.map((idx) => {
          const [, mo, day] = points[idx].date.split("-").map(Number);
          const anchor = idx === 0 ? "start" : idx === points.length - 1 ? "end" : "middle";
          return (
            <text key={idx} x={xOf(idx)} y={PLOT_H + 20} textAnchor={anchor} fontSize="11" fill="var(--color-muted)" fontFamily="inherit">
              {MONTH_ABBR[mo - 1]} {day}
            </text>
          );
        })}

        {/* Area fill */}
        <path d={areaPath} fill={`url(#${gradId})`} clipPath={`url(#${clipId})`} />

        {/* Line */}
        <path d={linePath} fill="none" stroke="var(--color-brand)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" clipPath={`url(#${clipId})`} />

        {/* Hover overlay */}
        {hover && hoverPt && (
          <>
            <line x1={hover.x} y1={0} x2={hover.x} y2={PLOT_H} stroke="var(--color-brand)" strokeWidth="1" strokeDasharray="4 3" opacity={0.5} />
            <circle cx={hover.x} cy={hover.y} r={4.5} fill="var(--color-surface)" stroke="var(--color-brand)" strokeWidth="2" />
            {/* Tooltip */}
            <rect x={ttX} y={ttY} width={108} height={42} rx={6} fill="var(--color-surface)" stroke="var(--color-border)" strokeWidth="1" />
            <text x={ttX + 9} y={ttY + 14} fontSize="11" fill="var(--color-muted)" fontFamily="inherit">
              {hoverPt.date}
            </text>
            <text x={ttX + 9} y={ttY + 30} fontSize="13" fontWeight="600" fill="var(--color-foreground)" fontFamily="inherit">
              {(hoverPt.centsPerLb / 100).toFixed(2)} USD/lb
            </text>
          </>
        )}
      </g>
    </svg>
  );
}
