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
 * FRED's official API is used when FRED_API_KEY is set (a free key from
 * fredaccount.stlouisfed.org); otherwise its public CSV and text downloads.
 *
 * Other Mild Arabicas: the IMF's monthly average for washed Arabicas from
 * outside Colombia and Brazil, the group Cameroon's Arabica is sold in
 * (series PCOFFOTMUSDM, same unit and source as the monthly Robusta).
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

/** Every outside request gives up after this long, so a slow source cannot hold up the staff page. */
const TIMEOUT_MS = 8000;
async function get(url: string, source: string) {
  try {
    return await fetch(url, { headers: { "User-Agent": "Mozilla/5.0 (compatible; GreenVentureCoffee/1.0)" }, signal: AbortSignal.timeout(TIMEOUT_MS) });
  } catch (e) {
    throw new Error(`${source}: ${e instanceof Error && e.name === "TimeoutError" ? "timed out" : "could not connect"}`);
  }
}

export interface WorldPrice {
  arabica: MarketQuote;
  robusta: MarketQuote | null;
  /** "Other Mild Arabicas", the world price group Cameroon's washed Arabica belongs to (monthly). */
  otherMilds: MarketQuote | null;
  cocoa: MarketQuote | null;
  /** When the exchange last traded, as an ISO date. */
  asOf: string;
  fcfaPerUsd: number;
  /** Which sources failed and why, for checking the setup (e.g. "RC=F: no price"). No secrets. */
  notes: string[];
}

interface YahooMeta {
  regularMarketPrice?: number;
  chartPreviousClose?: number;
  previousClose?: number;
  regularMarketTime?: number;
}

async function futures(symbol: string): Promise<YahooMeta> {
  const res = await get(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?range=5d&interval=1d`, symbol);
  if (!res.ok) throw new Error(`${symbol}: HTTP ${res.status}`);
  const meta = ((await res.json()) as { chart?: { result?: { meta?: YahooMeta }[] } }).chart?.result?.[0]?.meta;
  if (!meta?.regularMarketPrice) throw new Error(`${symbol}: no price`);
  return meta;
}

async function fcfaPerUsd() {
  const res = await get("https://api.frankfurter.app/latest?from=USD&to=EUR", "USD/EUR");
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

type Monthly = { month: string; value: number; previous: number | null };

/** The last two months of [date, value] pairs, skipping missing values. */
function lastTwo(series: string, pairs: [string, string][]): Monthly {
  const rows = pairs.filter(([date, v]) => /^\d{4}-\d{2}-\d{2}$/.test(date ?? "") && Number.isFinite(Number(v)) && Number(v) > 0);
  const last = rows.at(-1);
  if (!last) throw new Error(`${series}: no values`);
  const [y, m] = last[0].split("-").map(Number);
  const before = rows.at(-2);
  return { month: `${MONTHS[m - 1]} ${y}`, value: Number(last[1]), previous: before ? Number(before[1]) : null };
}

/** FRED's official API (needs a free key). */
async function fredApi(series: string, key: string): Promise<Monthly> {
  const res = await get(
    `https://api.stlouisfed.org/fred/series/observations?series_id=${series}&api_key=${encodeURIComponent(key)}&file_type=json&sort_order=desc&limit=3`,
    "FRED API",
  );
  if (!res.ok) throw new Error(`FRED API: HTTP ${res.status}`);
  const obs = ((await res.json()) as { observations?: { date: string; value: string }[] }).observations ?? [];
  return lastTwo(series, obs.map((o) => [o.date, o.value] as [string, string]).reverse());
}

/** FRED's public CSV download: "observation_date,SERIES" then "2026-09-01,212.34"; missing months are ".". */
async function fredCsv(series: string): Promise<Monthly> {
  const res = await get(`https://fred.stlouisfed.org/graph/fredgraph.csv?id=${series}`, "FRED CSV");
  if (!res.ok) throw new Error(`FRED CSV: HTTP ${res.status}`);
  const lines = (await res.text()).trim().split(/\r?\n/).slice(1);
  return lastTwo(series, lines.map((l) => l.split(",") as [string, string]));
}

/** FRED's public text table: header lines, then "2026-09-01  212.34". */
async function fredText(series: string): Promise<Monthly> {
  const res = await get(`https://fred.stlouisfed.org/data/${series}.txt`, "FRED text");
  if (!res.ok) throw new Error(`FRED text: HTTP ${res.status}`);
  const pairs = (await res.text())
    .split(/\r?\n/)
    .map((l) => l.trim().split(/\s+/) as [string, string])
    .filter(([d]) => /^\d{4}-\d{2}-\d{2}$/.test(d ?? ""));
  return lastTwo(series, pairs);
}

/** The first FRED route that answers, noting why the others did not. */
async function fredMonthly(series: string, notes: string[]): Promise<Monthly | null> {
  const key = process.env.FRED_API_KEY?.trim();
  const routes = [...(key ? [() => fredApi(series, key)] : []), () => fredCsv(series), () => fredText(series)];
  for (const route of routes) {
    try {
      return await route();
    } catch (e) {
      notes.push(`${series} ${e instanceof Error ? e.message : String(e)}`);
    }
  }
  return null;
}

export interface PricePoint {
  /** ISO date, e.g. "2026-07-01" */
  date: string;
  /** US cents per pound (Arabica C contract, ICE New York KC=F) */
  centsPerLb: number;
}

export interface RawPricePoint {
  /** ISO date, e.g. "2026-07-01" */
  date: string;
  /** Raw closing price in the symbol's native unit */
  close: number;
}

/** ~90 days of daily closing prices for any Yahoo Finance symbol. Cached ~1 hour. */
export async function worldPriceHistoryFor(symbol: string): Promise<RawPricePoint[]> {
  "use cache";
  cacheLife("hours");
  const res = await get(
    `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=3mo&interval=1d`,
    `${symbol} history`,
  );
  if (!res.ok) throw new Error(`${symbol} history: HTTP ${res.status}`);
  const data = (await res.json()) as {
    chart?: {
      result?: {
        timestamp?: number[];
        indicators?: { quote?: { close?: (number | null)[] }[] };
      }[];
    };
  };
  const result = data.chart?.result?.[0];
  const timestamps = result?.timestamp ?? [];
  const closes = result?.indicators?.quote?.[0]?.close ?? [];
  const points: RawPricePoint[] = [];
  for (let i = 0; i < timestamps.length; i++) {
    const close = closes[i];
    if (close == null || !Number.isFinite(close) || close <= 0) continue;
    const date = new Date(timestamps[i] * 1000).toISOString().slice(0, 10);
    points.push({ date, close });
  }
  return points.sort((a, b) => a.date.localeCompare(b.date));
}

/** ~90 days of daily Arabica C closing prices from Yahoo Finance. Cached ~1 hour. */
export async function worldPriceHistory(): Promise<PricePoint[]> {
  const raw = await worldPriceHistoryFor("KC=F");
  return raw.map((p) => ({ date: p.date, centsPerLb: p.close }));
}

/** Fetched at most about once an hour; throws when a source cannot be reached. */
export async function worldCoffeePrice(): Promise<WorldPrice> {
  "use cache";
  cacheLife("hours");
  const notes: string[] = [];
  const note = (e: unknown) => {
    notes.push(e instanceof Error ? e.message : String(e));
    return null;
  };
  // London Robusta goes by more than one ticker; the first that answers is used, else the monthly average.
  const robustaDaily = futures("RC=F").catch((e) => (note(e), futures("RM=F"))).catch(note);
  const robustaMonthly = fredMonthly("PCOFFROBUSDM", notes);
  const [arabica, robusta, robustaAvg, otherMildsAvg, cocoa, rate] = await Promise.all([
    futures("KC=F"),
    robustaDaily,
    robustaMonthly,
    fredMonthly("PCOFFOTMUSDM", notes),
    futures("CC=F").catch(note),
    fcfaPerUsd(),
  ]);
  /** A quote in US dollars per tonne, as FCFA per kilo. */
  const perTonne = (m: YahooMeta): MarketQuote => ({
    fcfaPerKg: (m.regularMarketPrice! / 1000) * rate,
    quoted: `${Math.round(m.regularMarketPrice!).toLocaleString("en-GB")} USD/tonne`,
    changePct: change(m),
  });
  /** A monthly average in US cents per pound, as FCFA per kilo. */
  const monthly = (m: Monthly): MarketQuote => ({
    fcfaPerKg: (m.value / 100 / KG_PER_LB) * rate,
    quoted: `${(m.value / 100).toFixed(2)} USD/lb`,
    changePct: m.previous ? ((m.value - m.previous) / m.previous) * 100 : null,
    period: `monthly average, ${m.month}`,
  });
  const centsPerLb = arabica.regularMarketPrice!;
  return {
    arabica: {
      fcfaPerKg: (centsPerLb / 100 / KG_PER_LB) * rate,
      quoted: `${(centsPerLb / 100).toFixed(2)} USD/lb`,
      changePct: change(arabica),
    },
    robusta: robusta ? perTonne(robusta) : robustaAvg ? monthly(robustaAvg) : null,
    otherMilds: otherMildsAvg ? monthly(otherMildsAvg) : null,
    cocoa: cocoa ? perTonne(cocoa) : null,
    asOf: new Date((arabica.regularMarketTime ?? 0) * 1000).toISOString(),
    fcfaPerUsd: rate,
    notes,
  };
}
