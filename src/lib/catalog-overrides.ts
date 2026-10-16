"use client";

/*
 * Demo admin edits, stored in this browser only.
 *
 * Cooperative staff can change products, lots and farmer stories in /admin.
 * There is no database in the demo, so the edits are kept in localStorage
 * under one key and merged over the sample data from data.ts. The public site
 * reads the merged values through the hooks below, so a change in the admin
 * shows up in the shop straight away in the same browser.
 *
 * Same pattern as the cart store: a tiny module-level store read with
 * useSyncExternalStore. The server (and the hydration pass) sees the
 * "not loaded" snapshot with no overrides, so server HTML and the first client
 * render both use the original data.ts values; the browser then switches to
 * the saved edits.
 */

import { useMemo, useSyncExternalStore } from "react";
import { farmers as baseFarmers, lots as baseLots, products as baseProducts } from "./data";
import type { CoffeeLot, Farmer, Product } from "./types";

export const ADMIN_STORAGE_KEY = "gv-admin-v1";

export interface ProductOverride {
  name?: string;
  priceXaf?: number;
  stock?: number;
  description?: string;
  hidden?: boolean;
  /** Uploaded photo as a JPEG data URL. */
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

interface Snapshot {
  overrides: CatalogOverrides;
  loaded: boolean;
  /** Goes up on every "Reset demo data", so open admin forms can start again from the original values. */
  resets: number;
}

const EMPTY: CatalogOverrides = { products: {}, lots: {}, farmers: {} };
const SERVER_SNAPSHOT: Snapshot = { overrides: EMPTY, loaded: false, resets: 0 };
let resets = 0;
let snapshot: Snapshot | null = null;
const listeners = new Set<() => void>();

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readOverrides(): CatalogOverrides {
  try {
    const raw = window.localStorage.getItem(ADMIN_STORAGE_KEY);
    if (!raw) return EMPTY;
    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed)) return EMPTY;
    return {
      products: isRecord(parsed.products) ? (parsed.products as CatalogOverrides["products"]) : {},
      lots: isRecord(parsed.lots) ? (parsed.lots as CatalogOverrides["lots"]) : {},
      farmers: isRecord(parsed.farmers) ? (parsed.farmers as CatalogOverrides["farmers"]) : {},
    };
  } catch {
    return EMPTY;
  }
}

function getSnapshot(): Snapshot {
  if (!snapshot) snapshot = { overrides: readOverrides(), loaded: true, resets };
  return snapshot;
}

function getServerSnapshot(): Snapshot {
  return SERVER_SNAPSHOT;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  // Keeps other open tabs (e.g. the shop next to the admin) in sync.
  const onStorage = (e: StorageEvent) => {
    if (e.key === ADMIN_STORAGE_KEY || e.key === null) {
      snapshot = null;
      resets += 1;
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

/** Saves the new overrides. Returns false (and changes nothing) if the browser refuses to store them. */
function commit(next: CatalogOverrides): boolean {
  try {
    const empty = !Object.keys(next.products).length && !Object.keys(next.lots).length && !Object.keys(next.farmers).length;
    if (empty) window.localStorage.removeItem(ADMIN_STORAGE_KEY);
    else window.localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Usually the storage quota (large photos) or private browsing.
    return false;
  }
  snapshot = { overrides: next, loaded: true, resets };
  listeners.forEach((l) => l());
  return true;
}

/** Merges a patch into one entry. Keys set to undefined are removed; an empty entry is dropped. */
function patchEntry<T extends object>(map: Record<string, T>, id: string, patch: Partial<T> | null): Record<string, T> {
  const rest = { ...map };
  delete rest[id];
  if (patch === null) return rest;
  const merged: Record<string, unknown> = { ...(map[id] ?? {}), ...patch };
  for (const key of Object.keys(merged)) if (merged[key] === undefined) delete merged[key];
  return Object.keys(merged).length ? { ...rest, [id]: merged as T } : rest;
}

// ---------------------------------------------------------------------------
// Merging
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

/** Raw overrides plus a loaded flag (false on the server and during hydration). */
export function useCatalogOverrides() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/** All products with admin edits applied, including hidden ones (check `hidden`). */
export function useCatalog() {
  const { overrides, loaded } = useCatalogOverrides();
  const products = useMemo(
    () => baseProducts.map((p) => applyProductOverride(p, overrides.products[p.slug])),
    [overrides],
  );
  const visibleProducts = useMemo(() => products.filter((p) => !p.hidden), [products]);
  return { products, visibleProducts, loaded };
}

export function useProductView(slug: string): CatalogProduct | undefined {
  const { overrides } = useCatalogOverrides();
  return useMemo(() => {
    const base = baseProducts.find((p) => p.slug === slug);
    return base ? applyProductOverride(base, overrides.products[slug]) : undefined;
  }, [overrides, slug]);
}

export function useLotView(code: string): CoffeeLot | undefined {
  const { overrides } = useCatalogOverrides();
  return useMemo(() => {
    const base = baseLots.find((l) => l.code === code);
    return base ? applyLotOverride(base, overrides.lots[code]) : undefined;
  }, [overrides, code]);
}

export function useFarmerView(id: string): Farmer | undefined {
  const { overrides } = useCatalogOverrides();
  return useMemo(() => {
    const base = baseFarmers.find((f) => f.id === id);
    return base ? applyFarmerOverride(base, overrides.farmers[id]) : undefined;
  }, [overrides, id]);
}

// ---------------------------------------------------------------------------
// Actions (all return false if the browser could not save)
// ---------------------------------------------------------------------------

export function updateProduct(slug: string, patch: ProductOverride) {
  const o = getSnapshot().overrides;
  return commit({ ...o, products: patchEntry(o.products, slug, patch) });
}

export function resetProduct(slug: string) {
  const o = getSnapshot().overrides;
  return commit({ ...o, products: patchEntry(o.products, slug, null) });
}

export function updateLot(code: string, patch: LotOverride) {
  const o = getSnapshot().overrides;
  return commit({ ...o, lots: patchEntry(o.lots, code, patch) });
}

export function resetLot(code: string) {
  const o = getSnapshot().overrides;
  return commit({ ...o, lots: patchEntry(o.lots, code, null) });
}

export function updateFarmer(id: string, patch: FarmerOverride) {
  const o = getSnapshot().overrides;
  return commit({ ...o, farmers: patchEntry(o.farmers, id, patch) });
}

export function resetFarmer(id: string) {
  const o = getSnapshot().overrides;
  return commit({ ...o, farmers: patchEntry(o.farmers, id, null) });
}

export function resetAllOverrides() {
  resets += 1;
  return commit(EMPTY);
}
