import "server-only";
import { cacheLife } from "next/cache";

/*
 * Today's world market price for coffee, per kilo in FCFA, for staff to set
 * prices and pay farmers against. Arabica is the ICE New York "C" contract
 * (US cents per pound); Robusta is ICE London (US dollars per tonne). Both
 * are futures prices for exportable green coffee, not retail prices.
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
  /** Change since the previous close, in percent, or null if unknown. */
  changePct: number | null;
}

export interface WorldPrice {
  arabica: MarketQuote;
  robusta: MarketQuote | null;
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

/** Fetched at most about once an hour; throws when a source cannot be reached. */
export async function worldCoffeePrice(): Promise<WorldPrice> {
  "use cache";
  cacheLife("hours");
  // London Robusta goes by more than one ticker; the first that answers is used.
  const robustaQuote = futures("RC=F").catch(() => futures("RM=F")).catch(() => null);
  const [arabica, robusta, rate] = await Promise.all([futures("KC=F"), robustaQuote, fcfaPerUsd()]);
  const centsPerLb = arabica.regularMarketPrice!;
  return {
    arabica: {
      fcfaPerKg: (centsPerLb / 100 / KG_PER_LB) * rate,
      quoted: `${(centsPerLb / 100).toFixed(2)} USD/lb`,
      changePct: change(arabica),
    },
    robusta: robusta
      ? {
          fcfaPerKg: (robusta.regularMarketPrice! / 1000) * rate,
          quoted: `${Math.round(robusta.regularMarketPrice!).toLocaleString("en-GB")} USD/tonne`,
          changePct: change(robusta),
        }
      : null,
    asOf: new Date((arabica.regularMarketTime ?? 0) * 1000).toISOString(),
    fcfaPerUsd: rate,
  };
}
