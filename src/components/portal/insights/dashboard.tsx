"use client";

import { useMemo, useState } from "react";
import { formatFcfaText } from "@/lib/currency";
import { products } from "@/lib/data";
import { orderItems, orderValueXaf, sampleDate, sampleOrders, type SampleOrder } from "@/lib/sample-sales";
import { Bars, type BarDatum, Columns, compact, Sparkline, StackedColumns, type StackDatum, TableView } from "./charts";

const PERIODS = [
  // Whole weeks, so every column on the chart covers the same span.
  { days: 28, label: "Last 4 weeks" },
  { days: 91, label: "Last 13 weeks" },
  { days: 364, label: "Last 52 weeks" },
] as const;
type Days = (typeof PERIODS)[number]["days"];

const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const fcfa = (n: number) => formatFcfaText(n);
const count = (n: number) => Math.round(n).toLocaleString("en-GB");
// Dates are spelled out by hand: server and browser builds of Intl disagree on short month names ("Sept" / "Sep").
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const shortDate = (d: Date) => `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}`;

/** Orders whose day falls in [from, to) days ago. */
const slice = (from: number, to: number) => sampleOrders.filter((o) => o.daysAgo >= from && o.daysAgo < to);

function totals(orders: SampleOrder[]) {
  const revenue = orders.reduce((n, o) => n + orderValueXaf(o), 0);
  const items = orders.reduce((n, o) => n + orderItems(o), 0);
  return { revenue, orders: orders.length, items, aov: orders.length ? revenue / orders.length : 0 };
}

/** Signed change vs the previous period, or null when the sample has no previous period. */
function change(now: number, before: number | null) {
  if (before === null || before === 0) return null;
  return Math.round(((now - before) / before) * 100);
}

function Delta({ pct, days }: { pct: number | null; days: number }) {
  if (pct === null) return <p className="min-w-0 text-xs text-muted">No earlier data to compare</p>;
  const up = pct >= 0;
  return (
    <p className="flex min-w-0 flex-wrap items-center gap-x-1 text-xs">
      <span aria-hidden="true" style={{ color: up ? "var(--viz-good-text)" : "var(--viz-bad-text)" }}>
        {up ? "▲" : "▼"}
      </span>
      <span className="font-semibold text-foreground">
        {up ? "+" : "−"}
        {Math.abs(pct)}%
      </span>
      <span className="text-muted">vs previous {days} days</span>
    </p>
  );
}

function Kpi({ label, value, unit, pct, days, trend }: { label: string; value: string; unit?: string; pct: number | null; days: number; trend: number[] }) {
  return (
    <div className="min-w-0 rounded-xl border border-border bg-surface p-4 shadow-sm">
      {/* Trend beside the label, so neither a long figure nor the change note is crowded. */}
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm text-muted">{label}</p>
        <span className="-mt-1 shrink-0">
          <Sparkline values={trend} />
        </span>
      </div>
      <p className="mt-1 text-2xl font-bold leading-tight text-foreground">
        <span className="whitespace-nowrap">{value}</span>
        {unit ? <span className="ml-1 text-sm font-medium text-muted">{unit}</span> : null}
      </p>
      <div className="mt-1">
        <Delta pct={pct} days={days} />
      </div>
    </div>
  );
}

function Panel({ title, note, children }: { title: string; note?: string; children: React.ReactNode }) {
  return (
    <section className="min-w-0 rounded-xl border border-border bg-surface shadow-sm">
      <div className="border-b border-border px-4 py-3 sm:px-5">
        <h2 className="font-semibold text-foreground">{title}</h2>
        {note ? <p className="mt-0.5 text-sm text-muted">{note}</p> : null}
      </div>
      {children}
    </section>
  );
}

const STATUS = {
  critical: { label: "Reorder now", color: "var(--viz-critical)", icon: "!" },
  warning: { label: "Running low", color: "var(--viz-warning)", icon: "–" },
  good: { label: "Enough stock", color: "var(--viz-good)", icon: "✓" },
} as const;

export function SalesDashboard() {
  const [days, setDays] = useState<Days>(28);

  const view = useMemo(() => {
    const now = slice(0, days);
    const before = days * 2 <= 365 ? slice(days, days * 2) : null;
    const t = totals(now);
    const p = before ? totals(before) : null;

    // Twelve equal slices of the period for the stat-tile trends.
    const chunk = days / 12;
    const trendSlices = Array.from({ length: 12 }, (_, i) => totals(slice(days - (i + 1) * chunk, days - i * chunk)));

    // Revenue over time: daily for 30 days, weekly for 90, four-weekly for 12 months.
    const step = days === 28 ? 1 : days === 91 ? 7 : 28;
    const buckets = days / step;
    const series: StackDatum[] = Array.from({ length: buckets }, (_, i) => {
      const end = (buckets - 1 - i) * step; // days ago of the bucket's last day
      const startAgo = end + step - 1;
      const os = slice(end, startAgo + 1);
      const a = os.filter((o) => o.market === "cameroon").reduce((n, o) => n + orderValueXaf(o), 0);
      const b = os.filter((o) => o.market === "abroad").reduce((n, o) => n + orderValueXaf(o), 0);
      const first = sampleDate(startAgo);
      const last = sampleDate(end);
      const label = step === 1 ? `${DAY_SHORT[first.getUTCDay()]} ${shortDate(first)}` : `${shortDate(first)} – ${shortDate(last)}`;
      return { key: String(i), label, short: shortDate(first), tick: i % (step === 1 ? 7 : 3) === 0, a, b };
    });

    // Demand by coffee: items ordered, with change vs the previous period.
    const unitsBy = (os: SampleOrder[]) => {
      const m = new Map<string, { units: number; orders: number }>();
      for (const o of os)
        for (const l of o.lines) {
          const r = m.get(l.slug) ?? { units: 0, orders: 0 };
          r.units += l.quantity;
          r.orders += 1;
          m.set(l.slug, r);
        }
      return m;
    };
    const unitsNow = unitsBy(now);
    const unitsBefore = before ? unitsBy(before) : null;
    const demand: BarDatum[] = products
      .map((pr) => {
        const r = unitsNow.get(pr.slug) ?? { units: 0, orders: 0 };
        const pct = change(r.units, unitsBefore ? (unitsBefore.get(pr.slug)?.units ?? 0) : null);
        return {
          key: pr.slug,
          label: pr.name,
          value: r.units,
          extra: [
            { label: "orders", value: count(r.orders) },
            ...(pct === null ? [] : [{ label: `vs previous ${days} days`, value: `${pct >= 0 ? "+" : "−"}${Math.abs(pct)}%` }]),
          ],
        };
      })
      .sort((x, y) => y.value - x.value);

    // Where orders come from: top six cities, the rest folded into "Other".
    const byCity = new Map<string, number>();
    for (const o of now) byCity.set(o.city, (byCity.get(o.city) ?? 0) + 1);
    const cities = [...byCity.entries()].sort((x, y) => y[1] - x[1]);
    const cityBars: BarDatum[] = cities.slice(0, 6).map(([c, n]) => ({ key: c, label: c, value: n }));
    const rest = cities.slice(6).reduce((n, [, v]) => n + v, 0);
    if (rest) cityBars.push({ key: "other", label: `Other (${cities.length - 6} places)`, value: rest });

    // Orders by weekday.
    const wd = Array(7).fill(0) as number[];
    for (const o of now) wd[(sampleDate(o.daysAgo).getUTCDay() + 6) % 7]++;
    const weekdays: BarDatum[] = WEEKDAYS.map((d, i) => ({ key: d, label: d, value: wd[i] }));

    // Stock cover: weeks of stock left at this period's weekly demand.
    const cover = products.map((pr) => {
      const weekly = ((unitsNow.get(pr.slug)?.units ?? 0) / days) * 7;
      const weeks = weekly > 0 ? pr.stock / weekly : Infinity;
      const status: keyof typeof STATUS = weeks < 2 ? "critical" : weeks < 4 ? "warning" : "good";
      return { slug: pr.slug, name: pr.name, stock: pr.stock, weekly, weeks, status };
    });

    return { t, p, trendSlices, series, demand, cityBars, weekdays, cover, abroadShare: t.revenue ? series.reduce((n, s) => n + s.b, 0) / t.revenue : 0 };
  }, [days]);

  const { t, p } = view;
  const periodLabel = PERIODS.find((x) => x.days === days)?.label ?? "";

  return (
    <div
      className="space-y-5"
      style={
        {
          "--viz-1": "#a8293f",
          "--viz-2": "#c98500",
          "--viz-muted": "#b9b6ad",
          "--viz-grid": "#e1e0d9",
          "--viz-axis": "#c3c2b7",
          "--viz-good": "#0ca30c",
          "--viz-warning": "#fab219",
          "--viz-critical": "#d03b3b",
          "--viz-good-text": "#006300",
          "--viz-bad-text": "#b42318",
        } as React.CSSProperties
      }
    >
      {/* One filter row, above everything it scopes. */}
      <div role="radiogroup" aria-label="Period" className="flex flex-wrap gap-2">
        {PERIODS.map((x) => (
          <button
            key={x.days}
            type="button"
            role="radio"
            aria-checked={days === x.days}
            onClick={() => setDays(x.days)}
            className={`inline-flex min-h-11 items-center gap-1.5 rounded-lg border px-4 text-sm font-medium transition-colors ${
              days === x.days ? "border-brand bg-brand text-white" : "border-border bg-surface text-foreground hover:bg-background"
            }`}
          >
            {days === x.days ? <span aria-hidden="true" className="font-bold">✓</span> : null}
            {x.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Sales" value={count(t.revenue).replace(/,/g, "\u00a0")} unit="FCFA" pct={change(t.revenue, p ? p.revenue : null)} days={days} trend={view.trendSlices.map((s) => s.revenue)} />
        <Kpi label="Orders" value={count(t.orders)} pct={change(t.orders, p ? p.orders : null)} days={days} trend={view.trendSlices.map((s) => s.orders)} />
        <Kpi label="Bags and kilos sold" value={count(t.items)} pct={change(t.items, p ? p.items : null)} days={days} trend={view.trendSlices.map((s) => s.items)} />
        <Kpi label="Average order" value={count(t.aov).replace(/,/g, "\u00a0")} unit="FCFA" pct={change(t.aov, p ? p.aov : null)} days={days} trend={view.trendSlices.map((s) => s.aov)} />
      </div>

      <Panel
        title="Sales over time"
        note={`${periodLabel}, in FCFA, ${days === 28 ? "per day" : days === 91 ? "per week" : "per four weeks"}. ${Math.round(view.abroadShare * 100)}% of sales went abroad.`}
      >
        <StackedColumns data={view.series} seriesA="Cameroon" seriesB="Abroad" format={fcfa} label={`Sales over time, ${periodLabel}`} />
        <TableView
          caption={`Sales over time, ${periodLabel}`}
          head={["Period", "Cameroon", "Abroad", "Total"]}
          rows={view.series.map((s) => [s.label, fcfa(s.a), fcfa(s.b), fcfa(s.a + s.b)])}
        />
      </Panel>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Panel title="Demand by coffee" note={`Bags (and kilos of green coffee) ordered, ${periodLabel.toLowerCase()}`}>
          <Bars data={view.demand} format={count} label="Demand by coffee" />
          <TableView caption="Demand by coffee" head={["Coffee", "Ordered"]} rows={view.demand.map((d) => [d.label, count(d.value)])} />
        </Panel>

        <Panel title="Where orders come from" note={`Orders by town, ${periodLabel.toLowerCase()}`}>
          <Bars data={view.cityBars} format={count} label="Orders by town" />
          <TableView caption="Orders by town" head={["Town", "Orders"]} rows={view.cityBars.map((d) => [d.label, count(d.value)])} />
        </Panel>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <Panel title="Busiest days" note="Orders by day of the week, so WhatsApp is staffed when buyers write">
          <Columns data={view.weekdays} format={count} label="Orders by day of the week" />
          <TableView caption="Orders by day of the week" head={["Day", "Orders"]} rows={view.weekdays.map((d) => [d.label, count(d.value)])} />
        </Panel>

        <Panel title="Stock against demand" note={`Weeks of stock left at the ${periodLabel.toLowerCase()} rate of ordering`}>
          <ul className="divide-y divide-border">
            {view.cover.map((c) => {
              const s = STATUS[c.status];
              const pct = Number.isFinite(c.weeks) ? Math.min(c.weeks / 12, 1) * 100 : 100;
              return (
                <li key={c.slug} className="px-4 py-3 sm:px-5">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                    <p className="min-w-0 text-sm font-medium text-foreground">{c.name}</p>
                    <p className="inline-flex items-center gap-1.5 text-sm text-foreground">
                      <span
                        aria-hidden="true"
                        className="inline-flex h-4 w-4 items-center justify-center rounded-full text-[0.65rem] font-bold text-white"
                        style={{ background: s.color }}
                      >
                        {s.icon}
                      </span>
                      {s.label}
                    </p>
                  </div>
                  <div
                    className="mt-1.5 h-2 overflow-hidden rounded-full"
                    style={{ background: `color-mix(in oklab, ${s.color} 18%, white)` }}
                    role="meter"
                    aria-label={`${c.name} stock cover`}
                    aria-valuemin={0}
                    aria-valuemax={12}
                    aria-valuenow={Number.isFinite(c.weeks) ? Math.round(c.weeks * 10) / 10 : 12}
                    aria-valuetext={Number.isFinite(c.weeks) ? `${c.weeks.toFixed(1)} weeks` : "No orders in this period"}
                  >
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: s.color }} />
                  </div>
                  <p className="mt-1 text-xs text-muted">
                    {count(c.stock)} in stock, about {c.weekly < 10 ? c.weekly.toFixed(1) : count(c.weekly)} ordered a week,{" "}
                    {Number.isFinite(c.weeks) ? `${c.weeks < 10 ? c.weeks.toFixed(1) : count(c.weeks)} weeks left` : "no orders yet"}
                  </p>
                </li>
              );
            })}
          </ul>
        </Panel>
      </div>

      <p className="text-xs text-muted">
        Axis values are rounded ({compact(1_250_000)} = 1,250,000 FCFA). Every figure on this page is sample data for the demo.
      </p>
    </div>
  );
}
