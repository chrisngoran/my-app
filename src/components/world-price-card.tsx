import { connection } from "next/server";
import { formatFcfaText } from "@/lib/currency";
import { type MarketQuote, worldCoffeePrice } from "@/lib/world-price";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
/** "17 Oct" in Kumbo time, written out by hand so server and browser agree. */
const day = (iso: string) => {
  const d = new Date(new Date(iso).getTime() + 3_600_000);
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}`;
};

function Quote({ name, q }: { name: string; q: MarketQuote }) {
  const up = (q.changePct ?? 0) >= 0;
  return (
    <div className="min-w-0">
      <p className="text-sm font-semibold text-muted">{name}</p>
      <p className="mt-0.5 text-2xl font-bold text-foreground tabular-nums">
        {formatFcfaText(Math.round(q.fcfaPerKg / 5) * 5)}
        <span className="text-base font-semibold text-muted"> / kg</span>
      </p>
      <p className="text-xs text-muted">
        {q.quoted}
        {q.changePct !== null && (
          <span className={`ml-1.5 font-semibold ${up ? "text-accent" : "text-danger"}`}>
            {up ? "▲" : "▼"} {Math.abs(q.changePct).toFixed(1)}%
          </span>
        )}
      </p>
    </div>
  );
}

/** Today's world prices for green coffee and cocoa beans, for setting prices and paying farmers. Staff pages only. */
export async function WorldPriceCard() {
  // Fetched when a page is visited (then cached for the hour), never while the site is built,
  // so a price source being down can never stop an update going live.
  await connection();
  let price;
  try {
    price = await worldCoffeePrice();
  } catch (e) {
    console.error("World coffee price unavailable", e);
    return (
      <section className="rounded-2xl border border-border bg-surface p-5 text-sm text-muted shadow-sm">
        World market prices: not available right now. They are checked again within the hour.
      </section>
    );
  }
  return (
    <section aria-labelledby="world-price-heading" className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
      <h2 id="world-price-heading" className="font-semibold text-foreground">
        World market prices today
      </h2>
      <div className="mt-3 grid grid-cols-[repeat(2,minmax(0,1fr))] gap-4">
        <Quote name="Arabica coffee (New York)" q={price.arabica} />
        {price.robusta && <Quote name="Robusta coffee (London)" q={price.robusta} />}
        {price.cocoa && <Quote name="Cocoa (New York)" q={price.cocoa} />}
      </div>
      <p className="mt-3 text-xs text-muted">
        Export prices for green coffee and cocoa beans, last traded {day(price.asOf)}. 1 USD = {Math.round(price.fcfaPerUsd)} FCFA. Updated about once an hour.
      </p>
    </section>
  );
}
