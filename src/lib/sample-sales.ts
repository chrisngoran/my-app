// Twelve months of SAMPLE orders for the "Sales & demand" dashboard in the
// staff portal. Every figure is invented, generated from a fixed seed so the
// page is the same on every visit. Real figures replace this once orders are
// recorded on the site (today they go straight to WhatsApp).
import { products } from "./data";

export const SAMPLE_END = "2026-10-17";
const DAY_MS = 86_400_000;
const END_MS = Date.parse(`${SAMPLE_END}T12:00:00Z`);
const DAYS = 365;

export type Market = "cameroon" | "abroad";

export interface SampleLine {
  slug: string;
  quantity: number;
  unitPriceXaf: number;
}

export interface SampleOrder {
  /** Days before SAMPLE_END: 0 = the last day. */
  daysAgo: number;
  city: string;
  market: Market;
  lines: SampleLine[];
}

/** mulberry32: a small seeded generator, so the sample never changes between visits. */
function seeded(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(rand: () => number, items: readonly (readonly [T, number])[]): T {
  const total = items.reduce((n, [, w]) => n + w, 0);
  let r = rand() * total;
  for (const [item, w] of items) {
    if ((r -= w) <= 0) return item;
  }
  return items[items.length - 1][0];
}

const CITIES_CM = [
  ["Bamenda", 26],
  ["Yaoundé", 22],
  ["Douala", 20],
  ["Kumbo", 14],
  ["Buea", 8],
  ["Bafoussam", 6],
  ["Limbe", 4],
] as const;
const CITIES_ABROAD = [
  ["Berlin", 3],
  ["Paris", 3],
  ["London", 2],
  ["Brussels", 2],
  ["Washington", 1],
] as const;

/** What a basket tends to hold; green coffee goes to cafés in larger quantities. */
const PRODUCT_WEIGHTS = [
  ["bui-highlands-medium-roast", 40],
  ["kumbo-honey-espresso", 24],
  ["meluf-natural-micro-lot", 10],
  ["washed-green-coffee-1kg", 12],
  ["monthly-subscription", 14],
] as const;

/** Demand by month (Jan = 0): the harvest and the December holidays lift it, the rainy season slows it. */
const MONTH_FACTOR = [1.15, 1.05, 0.95, 0.9, 0.85, 0.8, 0.75, 0.8, 0.9, 1.0, 1.15, 1.45];
/** Monday = 0 … Sunday = 6. */
const WEEKDAY_FACTOR = [1.05, 1.0, 1.0, 1.05, 1.3, 1.2, 0.6];

function build(): SampleOrder[] {
  const rand = seeded(20261017);
  const priceOf = new Map(products.map((p) => [p.slug, p.priceXaf]));
  const out: SampleOrder[] = [];
  for (let daysAgo = DAYS - 1; daysAgo >= 0; daysAgo--) {
    const date = new Date(END_MS - daysAgo * DAY_MS);
    const weekday = (date.getUTCDay() + 6) % 7;
    // Slow, steady growth across the year as more buyers find the cooperative.
    const growth = 0.75 + 0.5 * ((DAYS - daysAgo) / DAYS);
    const expected = 2.1 * growth * MONTH_FACTOR[date.getUTCMonth()] * WEEKDAY_FACTOR[weekday];
    // Poisson-like count around the expected value.
    let count = 0;
    let p = Math.exp(-expected);
    let s = p;
    const u = rand();
    while (u > s && count < 12) {
      count++;
      p *= expected / count;
      s += p;
    }
    for (let i = 0; i < count; i++) {
      const abroad = rand() < 0.12;
      const city = abroad ? pick(rand, CITIES_ABROAD) : pick(rand, CITIES_CM);
      const lineCount = rand() < 0.7 ? 1 : 2;
      const lines: SampleLine[] = [];
      for (let l = 0; l < lineCount; l++) {
        const slug = pick(rand, PRODUCT_WEIGHTS);
        if (lines.some((x) => x.slug === slug)) continue;
        const quantity = slug === "washed-green-coffee-1kg" ? 2 + Math.floor(rand() * 9) : 1 + Math.floor(rand() * (abroad ? 3 : 2));
        lines.push({ slug, quantity, unitPriceXaf: priceOf.get(slug) ?? 0 });
      }
      out.push({ daysAgo, city, market: abroad ? "abroad" : "cameroon", lines });
    }
  }
  return out;
}

export const sampleOrders: SampleOrder[] = build();

export const orderValueXaf = (o: SampleOrder) => o.lines.reduce((n, l) => n + l.quantity * l.unitPriceXaf, 0);
export const orderItems = (o: SampleOrder) => o.lines.reduce((n, l) => n + l.quantity, 0);

/** The calendar date of a day in the sample, as a Date at noon UTC. */
export const sampleDate = (daysAgo: number) => new Date(END_MS - daysAgo * DAY_MS);
