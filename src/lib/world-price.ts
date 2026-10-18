import "server-only";
import { cacheLife } from "next/cache";

/*
 * Today's world market prices for coffee and cocoa, per kilo in FCFA, for
 * staff to set prices and pay farmers against. Arabica is the ICE New York
 * "C" contract (US cents per pound); Robusta is ICE London (US dollars per
 * tonne); cocoa is ICE New York (US dollars per tonne). All are futures
 * prices for exportable green coffee and cocoa beans, not retail prices.
 *
 * Robusta: the daily ICE London price when Yahoo has it; otherwise the
 * IMF's monthly average world Robusta price (series PCOFFROBUSDM, US cents
 * per pound, published free by the St. Louis Fed's FRED, about a month behind).
 *
 * FCFA is pegged to the euro (1 EUR = 655.957 FCFA), so only the euro-dollar
 * rate is looked up (European Central Bank, via frankfurter.app).
 */

const FCFA_PER_EUR = 655.957;
const KG_PER_LB = 0.45359237;

export interface MarketQuote {
  /** FCFA per kilo of green coffee. */
  fcfaPerKg: number;
  /** The exchange's own unit, for staff who follow the market. */
  quoted: string;
  /** Change since the previous close (or month), in percent, or null if unknown. */
  changePct: number | null;
  /** Set for a monthly average instead of today's price, e.g. "monthly average, Sep 2026". */
  period?: string;
}

export interface WorldPrice {
  arabica: MarketQuote;
  robusta: MarketQuote | null;
  cocoa: MarketQuote | null;
  /** When the exchange last traded, as an ISO date. */
  asOf: string;
  fcfaPerUsd: number;
}

interface YahooMeta {
  regularMarketPrice?: number;
  chartPreviousClose?: number;
  previousClose?: number;
  regularMarketTime?: number;
}

async function futures(symbol: string): Promise<YahooMeta> {
  const res = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?range=5d&interval=1d`, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; GreenVentureCoffee/1.0)" },
  });
  if (!res.ok) throw new Error(`${symbol}: HTTP ${res.status}`);
  const meta = ((await res.json()) as { chart?: { result?: { meta?: YahooMeta }[] } }).chart?.result?.[0]?.meta;
  if (!meta?.regularMarketPrice) throw new Error(`${symbol}: no price`);
  return meta;
}

async function fcfaPerUsd() {
  const res = await fetch("https://api.frankfurter.app/latest?from=USD&to=EUR");
  if (!res.ok) throw new Error(`USD/EUR: HTTP ${res.status}`);
  const eur = ((await res.json()) as { rates?: { EUR?: number } }).rates?.EUR;
  if (!eur) throw new Error("USD/EUR: no rate");
  return eur * FCFA_PER_EUR;
}

const change = (m: YahooMeta) => {
  const before = m.chartPreviousClose ?? m.previousClose;
  return before ? ((m.regularMarketPrice! - before) / before) * 100 : null;
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** The latest two monthly values of a FRED series, from its free CSV download (no key needed). */
async function fredMonthly(series: string): Promise<{ month: string; value: number; previous: number | null }> {
  const res = await fetch(`https://fred.stlouisfed.org/graph/fredgraph.csv?id=${series}`, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; GreenVentureCoffee/1.0)" },
  });
  if (!res.ok) throw new Error(`${series}: HTTP ${res.status}`);
  // "observation_date,PCOFFROBUSDM" then "2026-09-01,212.34"; missing months are ".".
  const rows = (await res.text())
    .trim()
    .split(/\r?\n/)
    .slice(1)
    .map((line) => line.split(","))
    .filter(([date, v]) => /^\d{4}-\d{2}-\d{2}$/.test(date ?? "") && Number.isFinite(Number(v)) && Number(v) > 0);
  const last = rows.at(-1);
  if (!last) throw new Error(`${series}: no values`);
  const [y, m] = last[0].split("-").map(Number);
  const before = rows.at(-2);
  return { month: `${MONTHS[m - 1]} ${y}`, value: Number(last[1]), previous: before ? Number(before[1]) : null };
}

/** Fetched at most about once an hour; throws when a source cannot be reached. */
export async function worldCoffeePrice(): Promise<WorldPrice> {
  "use cache";
  cacheLife("hours");
  // London Robusta goes by more than one ticker; the first that answers is used, else the monthly average.
  const robustaDaily = futures("RC=F").catch(() => futures("RM=F")).catch(() => null);
  const robustaMonthly = fredMonthly("PCOFFROBUSDM").catch(() => null);
  const [arabica, robusta, robustaAvg, cocoa, rate] = await Promise.all([
    futures("KC=F"),
    robustaDaily,
    robustaMonthly,
    futures("CC=F").catch(() => null),
    fcfaPerUsd(),
  ]);
  /** A quote in US dollars per tonne, as FCFA per kilo. */
  const perTonne = (m: YahooMeta): MarketQuote => ({
    fcfaPerKg: (m.regularMarketPrice! / 1000) * rate,
    quoted: `${Math.round(m.regularMarketPrice!).toLocaleString("en-GB")} USD/tonne`,
    changePct: change(m),
  });
  const centsPerLb = arabica.regularMarketPrice!;
  return {
    arabica: {
      fcfaPerKg: (centsPerLb / 100 / KG_PER_LB) * rate,
      quoted: `${(centsPerLb / 100).toFixed(2)} USD/lb`,
      changePct: change(arabica),
    },
    robusta: robusta
      ? perTonne(robusta)
      : robustaAvg
        ? {
            fcfaPerKg: (robustaAvg.value / 100 / KG_PER_LB) * rate,
            quoted: `${(robustaAvg.value / 100).toFixed(2)} USD/lb`,
            changePct: robustaAvg.previous ? ((robustaAvg.value - robustaAvg.previous) / robustaAvg.previous) * 100 : null,
            period: `monthly average, ${robustaAvg.month}`,
          }
        : null,
    cocoa: cocoa ? perTonne(cocoa) : null,
    asOf: new Date((arabica.regularMarketTime ?? 0) * 1000).toISOString(),
    fcfaPerUsd: rate,
  };
}
