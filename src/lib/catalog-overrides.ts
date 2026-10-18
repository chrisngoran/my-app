"use client";

/*
 * Staff edits to products, lots and farmer stories, as the browser sees them.
 *
 * Two modes:
 * - Shared (a database is connected): the edits come from /api/catalog, so
 *   every visitor sees the same shop, and the admin saves them back there.
 * - Demo (no database): the edits live in this browser's localStorage only,
 *   under one key, merged over the sample data from data.ts.
 *
 * A tiny module-level store read with useSyncExternalStore, like the cart.
 * The server and the hydration pass see the "not loaded" snapshot with no
 * edits, so both render the original data.ts values; the browser then
 * switches to the edits once it knows which mode it is in.
 */

import { useMemo, useSyncExternalStore } from "react";
import {
  applyFarmerOverride,
  applyLotOverride,
  applyProductOverride,
  type CatalogOverrides,
  cleanOverrides,
  EMPTY_OVERRIDES,
  type FarmerOverride,
  isEmptyOverrides,
  type LotOverride,
  type ProductOverride,
} from "./catalog-clean";
import { farmers as baseFarmers, lots as baseLots, products as baseProducts } from "./data";

export type { CatalogOverrides, CatalogProduct, FarmerOverride, LotOverride, ProductOverride } from "./catalog-clean";
export { applyFarmerOverride, applyLotOverride, applyProductOverride } from "./catalog-clean";

export const ADMIN_STORAGE_KEY = "gv-admin-v1";

const IDS = { products: baseProducts.map((p) => p.slug), lots: baseLots.map((l) => l.code), farmers: baseFarmers.map((f) => f.id) };

export type CatalogMode = "loading" | "demo" | "shared";

interface Snapshot {
  overrides: CatalogOverrides;
  /** True once the edits for this mode have been read. */
  loaded: boolean;
  mode: CatalogMode;
  /** Goes up on every reset or outside change, so open admin forms can start again from the current values. */
  resets: number;
  /** Set when a shared save failed and the change was undone. */
  saveError: string | null;
}

const SERVER_SNAPSHOT: Snapshot = { overrides: EMPTY_OVERRIDES, loaded: false, mode: "loading", resets: 0, saveError: null };
let snapshot: Snapshot = SERVER_SNAPSHOT;
let started = false;
const listeners = new Set<() => void>();

function set(next: Partial<Snapshot>) {
  snapshot = { ...snapshot, ...next };
  listeners.forEach((l) => l());
}

function readLocal(): CatalogOverrides {
  try {
    const raw = window.localStorage.getItem(ADMIN_STORAGE_KEY);
    return raw ? cleanOverrides(JSON.parse(raw), IDS) : EMPTY_OVERRIDES;
  } catch {
    return EMPTY_OVERRIDES;
  }
}

/** Asks the site which mode it is in, and loads the shared edits when there are some. */
async function start() {
  try {
    const res = await fetch("/api/catalog", { cache: "no-store" });
    const data = (await res.json()) as { shared?: boolean; overrides?: unknown };
    if (data.shared) {
      // On a database hiccup this shows the original values, never this browser's old demo edits.
      const overrides = data.overrides ? cleanOverrides(data.overrides, IDS) : EMPTY_OVERRIDES;
      set({ overrides, loaded: true, mode: "shared", resets: snapshot.resets + 1 });
      return;
    }
  } catch {
    // Offline or blocked: fall back to this browser's demo edits.
  }
  set({ overrides: readLocal(), loaded: true, mode: "demo", resets: snapshot.resets + 1 });
}

function getSnapshot(): Snapshot {
  return snapshot;
}

function getServerSnapshot(): Snapshot {
  return SERVER_SNAPSHOT;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (!started) {
    started = true;
    void start();
  }
  // Demo mode: keeps other open tabs (e.g. the shop next to the admin) in sync.
  const onStorage = (e: StorageEvent) => {
    if (snapshot.mode === "demo" && (e.key === ADMIN_STORAGE_KEY || e.key === null)) {
      set({ overrides: readLocal(), resets: snapshot.resets + 1 });
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

const NOT_REACHED = "Not saved: the website could not be reached. Check the connection and try again.";

async function saveShared(next: CatalogOverrides, previous: CatalogOverrides) {
  try {
    const res = await fetch("/api/catalog", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ overrides: next }),
    });
    if (!res.ok) {
      const message =
        res.status === 401
          ? "Not saved: you are signed out. Sign in again and repeat the change."
          : res.status === 413
            ? "Not saved: the photo is too large. Try a smaller photo."
            : NOT_REACHED;
      set({ overrides: previous, resets: snapshot.resets + 1, saveError: message });
      return;
    }
    // The server answers with photos as addresses instead of data URLs; keep any newer change.
    const data = (await res.json()) as { overrides?: unknown };
    if (snapshot.overrides === next && data.overrides) set({ overrides: cleanOverrides(data.overrides, IDS) });
  } catch {
    set({ overrides: previous, resets: snapshot.resets + 1, saveError: NOT_REACHED });
  }
}

/**
 * Saves the new overrides. In demo mode returns false (and changes nothing) if
 * the browser refuses to store them. In shared mode the change shows at once
 * and is sent to the site; if that fails it is undone and saveError is set.
 */
function commit(next: CatalogOverrides): boolean {
  if (snapshot.mode === "shared") {
    const previous = snapshot.overrides;
    set({ overrides: next, saveError: null });
    void saveShared(next, previous);
    return true;
  }
  try {
    if (isEmptyOverrides(next)) window.localStorage.removeItem(ADMIN_STORAGE_KEY);
    else window.localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Usually the storage quota (large photos) or private browsing.
    return false;
  }
  set({ overrides: next });
  return true;
}

/** Clears the message of a failed shared save once staff have seen it. */
export function clearSaveError() {
  if (snapshot.saveError) set({ saveError: null });
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

export function useProductView(slug: string) {
  const { overrides } = useCatalogOverrides();
  return useMemo(() => {
    const base = baseProducts.find((p) => p.slug === slug);
    return base ? applyProductOverride(base, overrides.products[slug]) : undefined;
  }, [overrides, slug]);
}

export function useLotView(code: string) {
  const { overrides } = useCatalogOverrides();
  return useMemo(() => {
    const base = baseLots.find((l) => l.code === code);
    return base ? applyLotOverride(base, overrides.lots[code]) : undefined;
  }, [overrides, code]);
}

export function useFarmerView(id: string) {
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
  const o = snapshot.overrides;
  return commit({ ...o, products: patchEntry(o.products, slug, patch) });
}

export function resetProduct(slug: string) {
  const o = snapshot.overrides;
  return commit({ ...o, products: patchEntry(o.products, slug, null) });
}

export function updateLot(code: string, patch: LotOverride) {
  const o = snapshot.overrides;
  return commit({ ...o, lots: patchEntry(o.lots, code, patch) });
}

export function resetLot(code: string) {
  const o = snapshot.overrides;
  return commit({ ...o, lots: patchEntry(o.lots, code, null) });
}

export function updateFarmer(id: string, patch: FarmerOverride) {
  const o = snapshot.overrides;
  return commit({ ...o, farmers: patchEntry(o.farmers, id, patch) });
}

export function resetFarmer(id: string) {
  const o = snapshot.overrides;
  return commit({ ...o, farmers: patchEntry(o.farmers, id, null) });
}

export function resetAllOverrides() {
  const ok = commit(EMPTY_OVERRIDES);
  if (ok) set({ resets: snapshot.resets + 1 });
  return ok;
}
