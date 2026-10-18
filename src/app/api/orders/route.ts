import { catalogProducts } from "@/lib/catalog-store";
import { customerId } from "@/lib/customer-session";
import { hasDatabase, insertOrder, type OrderLine } from "@/lib/db";
import { commissionPct } from "@/lib/market";
import { fromThisSite } from "@/lib/same-origin";

/*
 * Records an order request at the moment a buyer taps "Send order on
 * WhatsApp". The browser sends only the coffees, quantities, town and
 * delivery choice and the order reference; prices are taken from the
 * catalogue (with staff edits) here, never from the browser, and anything
 * that does not match the catalogue is refused.
 */

const MAX_LINES = 10;
const MAX_QUANTITY = 100;
const WINDOW_MS = 10 * 60_000;
const MAX_PER_WINDOW = 10;

/** A rough guard against one visitor filling the table: 10 orders per 10 minutes per address, per server instance. */
const recent = new Map<string, number[]>();
function tooMany(ip: string) {
  const now = Date.now();
  const hits = (recent.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  hits.push(now);
  recent.set(ip, hits);
  if (recent.size > 5000) recent.clear();
  return hits.length > MAX_PER_WINDOW;
}

/** "  yaoundé " → "Yaoundé". Control characters and extra spaces are dropped. */
function cleanCity(raw: unknown) {
  if (typeof raw !== "string") return null;
  const city = raw.replace(/[\p{C}]/gu, "").replace(/\s+/g, " ").trim().slice(0, 60);
  return city ? city.charAt(0).toLocaleUpperCase("en-GB") + city.slice(1) : null;
}

export async function POST(request: Request) {
  // Only this site's own pages may record orders.
  if (!fromThisSite(request)) return new Response(null, { status: 403 });
  if (!hasDatabase()) return new Response(null, { status: 204 });

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (tooMany(ip)) return new Response(null, { status: 429 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new Response(null, { status: 400 });
  }
  const { city: rawCity, delivery, lines: rawLines, ref: rawRef } = (body ?? {}) as Record<string, unknown>;
  // The reference shown in the WhatsApp message, so staff can match the two.
  const ref = typeof rawRef === "string" && /^GV-[A-HJ-NP-Z2-9]{5}$/.test(rawRef) ? rawRef : null;

  const city = cleanCity(rawCity);
  if (!city || (delivery !== "cameroon" && delivery !== "international")) return new Response(null, { status: 400 });
  if (!Array.isArray(rawLines) || rawLines.length === 0 || rawLines.length > MAX_LINES) return new Response(null, { status: 400 });

  let products;
  let commission = 0;
  try {
    [products, commission] = await Promise.all([catalogProducts(), commissionPct()]);
  } catch (e) {
    console.error("Could not read catalog", e);
    return new Response(null, { status: 500 });
  }
  const lines: OrderLine[] = [];
  for (const raw of rawLines) {
    const { slug, quantity } = (raw ?? {}) as Record<string, unknown>;
    const product = products.find((p) => p.slug === slug);
    if (!product || product.hidden || !Number.isInteger(quantity) || (quantity as number) < 1 || (quantity as number) > MAX_QUANTITY) {
      return new Response(null, { status: 400 });
    }
    if (lines.some((l) => l.slug === product.slug)) return new Response(null, { status: 400 });
    lines.push({
      slug: product.slug,
      name: product.name,
      quantity: quantity as number,
      unitPriceXaf: product.priceXaf,
      // A farmer's coffee records who is owed and the cooperative's share as it stood at the sale.
      ...(product.seller ? { farmerId: product.seller.id, commissionPct: commission } : {}),
    });
  }

  try {
    // Signed-in customers see the order on their account page.
    await insertOrder({ ref, customerId: await customerId(), city, market: delivery === "international" ? "abroad" : "cameroon", lines });
  } catch (e) {
    console.error("Could not record order", e);
    return new Response(null, { status: 500 });
  }
  return new Response(null, { status: 204 });
}
