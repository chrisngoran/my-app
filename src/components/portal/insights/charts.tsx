"use client";

import { useId, useRef, useState } from "react";

/*
 * Small, dependency-free charts for the "Sales & demand" dashboard, drawn
 * with HTML so they reflow on any phone. Shared rules (the dataviz method):
 * thin marks with a 4px rounded data end and a square baseline, a 2px
 * surface gap between touching fills, hairline solid gridlines, text in text
 * tokens (never the series colour), a hover/focus tooltip on every mark, and
 * a table view so no value is reachable only by hovering.
 *
 * Colours come from CSS variables set on the dashboard root:
 *   --viz-1 (#a8293f, cherry) and --viz-2 (#c98500, honey), validated as a
 *   pair on the white card surface; --viz-muted for context marks.
 */

export interface TooltipRow {
  label: string;
  value: string;
  /** CSS colour for the line key; omit for a plain row. */
  key?: string;
}

interface TipState {
  x: number;
  y: number;
  title: string;
  rows: TooltipRow[];
}

/** One tooltip per chart, positioned over the hovered or focused mark. */
function useTooltip() {
  const box = useRef<HTMLDivElement>(null);
  const [tip, setTip] = useState<TipState | null>(null);
  const show = (el: HTMLElement, title: string, rows: TooltipRow[]) => {
    const host = box.current?.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    if (!host) return;
    const x = Math.min(Math.max(r.left + r.width / 2 - host.left, 90), host.width - 90);
    setTip({ x, y: r.top - host.top, title, rows });
  };
  const hide = () => setTip(null);
  const view = tip ? (
    <div
      role="presentation"
      className="pointer-events-none absolute z-10 min-w-36 -translate-x-1/2 -translate-y-full rounded-lg border border-border bg-surface px-3 py-2 text-sm shadow-[var(--shadow-float)]"
      style={{ left: tip.x, top: tip.y - 8 }}
    >
      <p className="text-xs text-muted">{tip.title}</p>
      <ul className="mt-1 space-y-0.5">
        {tip.rows.map((row) => (
          <li key={row.label} className="flex items-center gap-2 whitespace-nowrap">
            {row.key ? <span aria-hidden="true" className="h-0.5 w-3 rounded-full" style={{ background: row.key }} /> : null}
            <span className="font-semibold text-foreground">{row.value}</span>
            <span className="text-muted">{row.label}</span>
          </li>
        ))}
      </ul>
    </div>
  ) : null;
  return { box, show, hide, view };
}

/** Clean axis maximum and three tick values (0, half, max). */
export function niceTicks(max: number) {
  if (max <= 0) return [0, 1];
  const exp = 10 ** Math.floor(Math.log10(max));
  const steps = [1, 1.2, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10];
  const top = (steps.find((s) => s * exp >= max) ?? 10) * exp;
  return [0, top / 2, top];
}

/** 1 234 567 → "1.2M", 250 000 → "250K". */
export function compact(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(n >= 10_000_000 ? 0 : 1).replace(/\.0$/, "")}M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}K`;
  return `${Math.round(n)}`;
}

export function TableView({ caption, head, rows }: { caption: string; head: string[]; rows: (string | number)[][] }) {
  return (
    <details className="group border-t border-border px-4 py-2 text-sm sm:px-5">
      <summary className="inline-flex min-h-11 cursor-pointer items-center font-medium text-accent underline-offset-4 hover:underline">
        Show as a table
      </summary>
      <div className="overflow-x-auto pb-2">
        <table className="w-full border-collapse text-sm">
          <caption className="sr-only">{caption}</caption>
          <thead>
            <tr>
              {head.map((h, i) => (
                <th key={h} scope="col" className={`py-2 pr-4 font-medium text-muted ${i ? "text-right" : "text-left"}`}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={String(r[0])} className="border-t border-border">
                {r.map((c, i) => (
                  <td key={i} className={`py-2 pr-4 ${i ? "text-right tabular-nums" : "text-left"}`}>
                    {c}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}

export interface StackDatum {
  key: string;
  label: string;
  /** Short tick label under the column, shown only where `tick` is true. */
  short: string;
  tick: boolean;
  a: number;
  b: number;
}

/**
 * Stacked columns of two series on one axis (a at the base, b on top), with
 * hairline gridlines at 0, half and max, the largest total labelled on its
 * cap, and a per-column tooltip.
 */
export function StackedColumns({
  data,
  seriesA,
  seriesB,
  format,
  label,
}: {
  data: StackDatum[];
  seriesA: string;
  seriesB: string;
  format: (n: number) => string;
  label: string;
}) {
  const { box, show, hide, view } = useTooltip();
  const ticks = niceTicks(Math.max(...data.map((d) => d.a + d.b)));
  const top = ticks[2];
  const peak = data.reduce((best, d) => (d.a + d.b > best.a + best.b ? d : best), data[0]);
  const PLOT = 176;

  return (
    <div className="px-4 pb-2 pt-4 sm:px-5">
      <ul className="mb-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted" aria-label="Legend">
        <li className="inline-flex items-center gap-2">
          <span aria-hidden="true" className="h-2.5 w-2.5 rounded-sm" style={{ background: "var(--viz-1)" }} />
          {seriesA}
        </li>
        <li className="inline-flex items-center gap-2">
          <span aria-hidden="true" className="h-2.5 w-2.5 rounded-sm" style={{ background: "var(--viz-2)" }} />
          {seriesB}
        </li>
      </ul>
      <div ref={box} className="relative" role="group" aria-label={label}>
        {view}
        <div className="flex">
          {/* y axis: ticks right-aligned beside the plot */}
          <div className="relative mr-2 w-10 shrink-0 text-right text-xs tabular-nums text-muted" style={{ height: PLOT }} aria-hidden="true">
            {ticks.map((t) => (
              <span key={t} className="absolute right-0 -translate-y-1/2" style={{ top: PLOT - (t / top) * PLOT }}>
                {compact(t)}
              </span>
            ))}
          </div>
          <div className="relative min-w-0 flex-1">
            {ticks.map((t) => (
              <div
                key={t}
                aria-hidden="true"
                className="absolute inset-x-0 h-px"
                style={{ top: PLOT - (t / top) * PLOT, background: t === 0 ? "var(--viz-axis)" : "var(--viz-grid)" }}
              />
            ))}
            <div className="relative flex items-end justify-between gap-[2px]" style={{ height: PLOT }}>
              {data.map((d) => {
                const total = d.a + d.b;
                const hA = (d.a / top) * PLOT;
                const hB = (d.b / top) * PLOT;
                const text = `${d.label}: ${format(total)} in total, ${format(d.a)} ${seriesA}, ${format(d.b)} ${seriesB}`;
                const open = (e: React.SyntheticEvent<HTMLElement>) =>
                  show(e.currentTarget, d.label, [
                    { label: "total", value: format(total) },
                    { label: seriesA, value: format(d.a), key: "var(--viz-1)" },
                    { label: seriesB, value: format(d.b), key: "var(--viz-2)" },
                  ]);
                return (
                  <div
                    key={d.key}
                    tabIndex={0}
                    aria-label={text}
                    onPointerEnter={open}
                    onPointerLeave={hide}
                    onFocus={open}
                    onBlur={hide}
                    className="group relative flex h-full min-w-0 max-w-6 flex-1 flex-col justify-end rounded-sm outline-offset-2 focus-visible:outline-2 focus-visible:outline-accent"
                  >
                    {d.key === peak.key && total > 0 ? (
                      <span
                        aria-hidden="true"
                        className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-semibold text-foreground"
                        style={{ bottom: hA + hB + 4 }}
                      >
                        {compact(total)}
                      </span>
                    ) : null}
                    {d.b > 0 ? (
                      <div
                        className="w-full rounded-t-[4px] transition-opacity group-hover:opacity-80"
                        style={{ height: Math.max(hB - 2, 1), marginBottom: 2, background: "var(--viz-2)" }}
                      />
                    ) : null}
                    <div
                      className={`w-full transition-opacity group-hover:opacity-80 ${d.b > 0 ? "" : "rounded-t-[4px]"}`}
                      style={{ height: hA, background: "var(--viz-1)" }}
                    />
                  </div>
                );
              })}
            </div>
            {/* x labels */}
            <div className="mt-1.5 flex justify-between gap-[2px] text-xs text-muted" aria-hidden="true">
              {data.map((d) => (
                <span key={d.key} className="relative min-w-0 max-w-6 flex-1">
                  {d.tick ? <span className="absolute left-0 whitespace-nowrap">{d.short}</span> : null}
                </span>
              ))}
            </div>
            <div className="h-4" />
          </div>
        </div>
      </div>
    </div>
  );
}

export interface BarDatum {
  key: string;
  label: string;
  value: number;
  /** Extra tooltip rows, e.g. orders or change vs the previous period. */
  extra?: TooltipRow[];
}

/** Horizontal bars of one series: label above, value at the bar's tip, tooltip on hover/focus. */
export function Bars({ data, format, label }: { data: BarDatum[]; format: (n: number) => string; label: string }) {
  const { box, show, hide, view } = useTooltip();
  const max = Math.max(1, ...data.map((d) => d.value));
  const total = data.reduce((n, d) => n + d.value, 0);
  return (
    <div ref={box} className="relative px-4 py-4 sm:px-5" role="group" aria-label={label}>
      {view}
      <ul className="space-y-3">
        {data.map((d) => {
          const share = total ? Math.round((d.value / total) * 100) : 0;
          const open = (e: React.SyntheticEvent<HTMLElement>) =>
            show(e.currentTarget, d.label, [{ label: `${share}% of all`, value: format(d.value) }, ...(d.extra ?? [])]);
          return (
            <li key={d.key}>
              <div
                tabIndex={0}
                aria-label={`${d.label}: ${format(d.value)}, ${share}% of all`}
                onPointerEnter={open}
                onPointerLeave={hide}
                onFocus={open}
                onBlur={hide}
                className="group -mx-1 rounded-md px-1 py-0.5 outline-offset-2 focus-visible:outline-2 focus-visible:outline-accent"
              >
                <p className="truncate text-sm text-foreground">{d.label}</p>
                <div className="mt-1 flex items-center gap-2">
                  <div className="h-3 min-w-0 flex-1" aria-hidden="true">
                    <div
                      className="h-full rounded-r-[4px] transition-opacity group-hover:opacity-80"
                      style={{ width: `${d.value > 0 ? Math.max((d.value / max) * 100, 1.5) : 0}%`, background: "var(--viz-1)" }}
                    />
                  </div>
                  <span className="w-16 shrink-0 text-right text-sm tabular-nums text-foreground">{format(d.value)}</span>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/** Columns of one series (e.g. orders by weekday); the peak is labelled on its cap. */
export function Columns({ data, format, label }: { data: BarDatum[]; format: (n: number) => string; label: string }) {
  const { box, show, hide, view } = useTooltip();
  const ticks = niceTicks(Math.max(...data.map((d) => d.value)));
  const top = ticks[2];
  const peak = data.reduce((best, d) => (d.value > best.value ? d : best), data[0]);
  const PLOT = 132;
  const titleId = useId();
  return (
    <div ref={box} className="relative px-4 pb-4 pt-6 sm:px-5" role="group" aria-label={label} aria-describedby={titleId}>
      {view}
      <span id={titleId} className="sr-only">
        Busiest: {peak.label}, {format(peak.value)}
      </span>
      <div className="relative" style={{ height: PLOT }}>
        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-px" style={{ background: "var(--viz-axis)" }} />
        <div className="relative flex h-full items-end justify-around gap-[2px]">
          {data.map((d) => {
            const h = (d.value / top) * PLOT;
            const open = (e: React.SyntheticEvent<HTMLElement>) => show(e.currentTarget, d.label, [{ label: "orders", value: format(d.value) }]);
            return (
              <div
                key={d.key}
                tabIndex={0}
                aria-label={`${d.label}: ${format(d.value)} orders`}
                onPointerEnter={open}
                onPointerLeave={hide}
                onFocus={open}
                onBlur={hide}
                className="group relative flex h-full w-full max-w-6 flex-col justify-end rounded-sm outline-offset-2 focus-visible:outline-2 focus-visible:outline-accent"
              >
                {d.key === peak.key ? (
                  <span aria-hidden="true" className="absolute left-1/2 -translate-x-1/2 text-xs font-semibold text-foreground" style={{ bottom: h + 4 }}>
                    {format(d.value)}
                  </span>
                ) : null}
                <div
                  className="w-full rounded-t-[4px] transition-opacity group-hover:opacity-80"
                  style={{ height: h, background: d.key === peak.key ? "var(--viz-1)" : "var(--viz-muted)" }}
                />
              </div>
            );
          })}
        </div>
      </div>
      <div className="mt-1.5 flex justify-around gap-[2px] text-xs text-muted" aria-hidden="true">
        {data.map((d) => (
          <span key={d.key} className="w-full max-w-6 text-center">
            {d.label.slice(0, 3)}
          </span>
        ))}
      </div>
    </div>
  );
}

/** A 12-point trend line for a stat tile: muted line, the latest point in the accent. */
export function Sparkline({ values }: { values: number[] }) {
  const W = 120;
  const H = 32;
  const max = Math.max(1, ...values);
  const pts = values.map((v, i) => [(i / Math.max(1, values.length - 1)) * (W - 8) + 4, H - 4 - (v / max) * (H - 8)] as const);
  const last = pts[pts.length - 1];
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-8 w-28" aria-hidden="true">
      <polyline
        points={pts.map((p) => p.join(",")).join(" ")}
        fill="none"
        stroke="var(--viz-muted)"
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
      {last ? <circle cx={last[0]} cy={last[1]} r="4" fill="var(--viz-1)" stroke="var(--color-surface)" strokeWidth="2" /> : null}
    </svg>
  );
}
