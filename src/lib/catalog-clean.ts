/*
 * Staff edits to products, lots and farmer stories: their shape, the checks
 * every saved edit passes on the way in, and how an edit is laid over the
 * original data.ts values. Shared by the browser (catalog-overrides.ts) and
 * the server (catalog-store.ts).
 */

import type { CoffeeLot, Farmer, Product } from "./types";

export interface ProductOverride {
  name?: string;
  priceXaf?: number;
  stock?: number;
  description?: string;
  hidden?: boolean;
  /** Uploaded photo: a JPEG data URL, or its address on this site once saved for everyone. */
  image?: string;
}

export interface LotOverride {
  notes?: string;
  cuppingScore?: number;
}

export interface FarmerOverride {
  story?: string;
}

export interface CatalogOverrides {
  products: Record<string, ProductOverride>;
  lots: Record<string, LotOverride>;
  farmers: Record<string, FarmerOverride>;
}

export type CatalogProduct = Product & { hidden: boolean };

export const EMPTY_OVERRIDES: CatalogOverrides = { products: {}, lots: {}, farmers: {} };

/** Where a photo saved for everyone is served from. */
export const IMAGE_PATH = "/api/catalog/image/";

/** True for photos staff uploaded (shown as they are, not resized by the image service). */
export const isUploadedImage = (src: string) => src.startsWith("data:") || src.startsWith("/api/");

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/*
 * Saved edits come from a browser, so each field is checked on the way in. A
 * field of the wrong type or out of range is dropped (the original data.ts
 * value shows instead) rather than crashing a page or printing "NaN FCFA".
 */
const isText = (v: unknown): v is string => typeof v === "string";
const isWhole = (v: unknown, min: number): v is number => typeof v === "number" && Number.isInteger(v) && v >= min;

function cleanProduct(o: Record<string, unknown>): ProductOverride {
  const out: ProductOverride = {};
  if (isText(o.name) && o.name.trim()) out.name = o.name.slice(0, 200);
  if (isText(o.description)) out.description = o.description.slice(0, 5000);
  if (isWhole(o.priceXaf, 1) && Number.isSafeInteger(o.priceXaf)) out.priceXaf = o.priceXaf;
  if (isWhole(o.stock, 0) && Number.isSafeInteger(o.stock)) out.stock = o.stock;
  if (typeof o.hidden === "boolean") out.hidden = o.hidden;
  if (isText(o.image) && (o.image.startsWith("data:image/") || o.image.startsWith(IMAGE_PATH))) out.image = o.image;
  return out;
}

function cleanLot(o: Record<string, unknown>): LotOverride {
  const out: LotOverride = {};
  if (isText(o.notes)) out.notes = o.notes.slice(0, 5000);
  if (typeof o.cuppingScore === "number" && Number.isFinite(o.cuppingScore) && o.cuppingScore >= 0 && o.cuppingScore <= 100) {
    out.cuppingScore = o.cuppingScore;
  }
  return out;
}

function cleanFarmer(o: Record<string, unknown>): FarmerOverride {
  return isText(o.story) ? { story: o.story.slice(0, 10000) } : {};
}

function cleanMap<T extends object>(value: unknown, clean: (o: Record<string, unknown>) => T, ids: Set<string>): Record<string, T> {
  const out: Record<string, T> = {};
  if (!isRecord(value)) return out;
  for (const [id, entry] of Object.entries(value)) {
    if (!ids.has(id) || !isRecord(entry)) continue;
    const cleaned = clean(entry);
    if (Object.keys(cleaned).length) out[id] = cleaned;
  }
  return out;
}

/** Keeps only valid edits to products, lots and farmers that exist. */
export function cleanOverrides(value: unknown, ids: { products: string[]; lots: string[]; farmers: string[] }): CatalogOverrides {
  if (!isRecord(value)) return EMPTY_OVERRIDES;
  return {
    products: cleanMap(value.products, cleanProduct, new Set(ids.products)),
    lots: cleanMap(value.lots, cleanLot, new Set(ids.lots)),
    farmers: cleanMap(value.farmers, cleanFarmer, new Set(ids.farmers)),
  };
}

export const isEmptyOverrides = (o: CatalogOverrides) =>
  !Object.keys(o.products).length && !Object.keys(o.lots).length && !Object.keys(o.farmers).length;

export function applyProductOverride(product: Product, o: ProductOverride | undefined): CatalogProduct {
  if (!o) return { ...product, hidden: false };
  return {
    ...product,
    name: o.name ?? product.name,
    priceXaf: o.priceXaf ?? product.priceXaf,
    stock: o.stock ?? product.stock,
    description: o.description ?? product.description,
    image: o.image ?? product.image,
    hidden: o.hidden ?? false,
  };
}

export function applyLotOverride(lot: CoffeeLot, o: LotOverride | undefined): CoffeeLot {
  if (!o) return lot;
  return {
    ...lot,
    notes: o.notes ?? lot.notes,
    quality: { ...lot.quality, cuppingScore: o.cuppingScore ?? lot.quality.cuppingScore },
  };
}

export function applyFarmerOverride(farmer: Farmer, o: FarmerOverride | undefined): Farmer {
  if (!o) return farmer;
  return { ...farmer, story: o.story ?? farmer.story };
}

/** The part of an order line that stock changes need. */
export interface OrderLineLike {
  slug: string;
  quantity: number;
}

/** Where a product's own page is: the cooperative's coffee under /shop, a farmer's under /market. */
export const productHref = (p: { slug: string; seller?: unknown }) => (p.seller ? `/market/${p.slug.slice(2)}` : `/shop/${p.slug}`);
