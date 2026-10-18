import "server-only";
import { createHash } from "node:crypto";
import {
  applyProductOverride,
  type CatalogOverrides,
  type CatalogProduct,
  cleanOverrides,
  EMPTY_OVERRIDES,
  IMAGE_PATH,
  type OrderLineLike,
} from "./catalog-clean";
import { farmers, lots, products } from "./data";
import { db, hasDatabase } from "./db";
import { adjustListingStock, listingIdFromSlug, marketProducts } from "./market";

/*
 * The staff's product, lot and farmer edits, kept in the database so every
 * visitor sees them. Photos are stored with the edits but sent to browsers by
 * address (/api/catalog/image/<slug>), so the shop does not download every
 * photo on every page.
 */

const IDS = { products: products.map((p) => p.slug), lots: lots.map((l) => l.code), farmers: farmers.map((f) => f.id) };

/** The edits exactly as stored, photos included as data URLs. */
async function readStored(): Promise<CatalogOverrides> {
  if (!hasDatabase()) return EMPTY_OVERRIDES;
  const q = await db();
  const rows = await q`SELECT data FROM catalog WHERE id = 1`;
  return rows.length ? cleanOverrides(rows[0].data, IDS) : EMPTY_OVERRIDES;
}

const photoVersion = (dataUrl: string) => createHash("sha256").update(dataUrl).digest("base64url").slice(0, 10);

/** The edits for browsers: each uploaded photo replaced by its address. */
export async function readOverrides(): Promise<CatalogOverrides> {
  const stored = await readStored();
  const productsOut: CatalogOverrides["products"] = {};
  for (const [slug, o] of Object.entries(stored.products)) {
    productsOut[slug] = o.image ? { ...o, image: `${IMAGE_PATH}${slug}?v=${photoVersion(o.image)}` } : o;
  }
  return { ...stored, products: productsOut };
}

export async function readPhoto(slug: string) {
  const stored = await readStored();
  const image = stored.products[slug]?.image;
  const match = image?.match(/^data:(image\/(?:jpeg|png|webp));base64,(.+)$/);
  return match ? { type: match[1], bytes: Buffer.from(match[2], "base64") } : null;
}

async function write(next: CatalogOverrides) {
  const q = await db();
  await q`INSERT INTO catalog (id, data, updated_at) VALUES (1, ${JSON.stringify(next)}::jsonb, now())
          ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = now()`;
}

const MAX_PHOTO_CHARS = 2_000_000;

/**
 * Saves the full set of edits sent by the admin. A photo sent back as its
 * address keeps the stored photo; a new photo arrives as a data URL.
 */
export async function saveOverrides(sent: unknown) {
  const next = cleanOverrides(sent, IDS);
  const stored = await readStored();
  for (const [slug, o] of Object.entries(next.products)) {
    if (!o.image) continue;
    if (o.image.startsWith(IMAGE_PATH)) {
      const kept = stored.products[slug]?.image;
      if (kept) o.image = kept;
      else delete o.image;
    } else if (o.image.length > MAX_PHOTO_CHARS) {
      throw new Error("Photo too large");
    }
  }
  await write(next);
}

/** Products with the shared edits applied, then approved marketplace coffee from farmers. */
export async function catalogProducts(): Promise<CatalogProduct[]> {
  const [o, market] = await Promise.all([readStored(), marketProducts()]);
  return [...products.map((p) => applyProductOverride(p, o.products[p.slug])), ...market.map((p) => ({ ...p, hidden: false }))];
}

/**
 * Changes stock by `sign` × each line's quantity (−1 when an order is
 * confirmed, +1 when a confirmed order is cancelled or deleted). Stock never
 * goes below 0.
 */
export async function adjustStock(lines: OrderLineLike[], sign: 1 | -1) {
  // Marketplace coffee keeps its own stock, on the listing.
  for (const line of lines) {
    const listing = listingIdFromSlug(line.slug);
    if (listing !== null) await adjustListingStock(listing, sign * line.quantity);
  }
  const stored = await readStored();
  const next: CatalogOverrides = { ...stored, products: { ...stored.products } };
  for (const line of lines) {
    const base = products.find((p) => p.slug === line.slug);
    if (!base) continue;
    const current = next.products[line.slug]?.stock ?? base.stock;
    const stock = Math.max(0, current + sign * line.quantity);
    next.products[line.slug] = { ...next.products[line.slug], stock };
  }
  await write(next);
}
