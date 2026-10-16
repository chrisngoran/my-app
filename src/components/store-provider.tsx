"use client";

import { createContext, useCallback, useContext, useMemo, useSyncExternalStore } from "react";
import { CURRENCIES } from "@/lib/currency";
import { products as catalogProducts } from "@/lib/data";
import type { Currency } from "@/lib/types";

export interface CartItem {
  slug: string;
  quantity: number;
}

interface StoreState {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  cart: CartItem[];
  addToCart: (slug: string, quantity?: number) => void;
  setQuantity: (slug: string, quantity: number) => void;
  removeFromCart: (slug: string) => void;
  clearCart: () => void;
  itemCount: number;
  /** True once the saved cart and currency have been read from localStorage. */
  loaded: boolean;
  /**
   * False once the browser has refused to save the order list (private mode,
   * blocked site data, full storage). The list still works in memory but is
   * lost on reload, so the cart page can say so.
   */
  persisted: boolean;
}

const StoreContext = createContext<StoreState | null>(null);

const CART_KEY = "gv-cart";
const CURRENCY_KEY = "gv-currency";

function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

/** Most of one product a single order line can hold; matches the stepper's ceiling. */
export const MAX_LINE_QUANTITY = 999;

const KNOWN_SLUGS = new Set(catalogProducts.map((p) => p.slug));

function clampQuantity(q: number) {
  return Math.min(MAX_LINE_QUANTITY, Math.max(0, Math.floor(q)));
}

/**
 * The saved cart is whatever this browser has under "gv-cart", so trust none
 * of it: keep only well-formed lines for products that exist, with a whole
 * quantity between 1 and 999, and merge duplicate slugs.
 */
export function sanitizeCart(raw: unknown): CartItem[] {
  if (!Array.isArray(raw)) return [];
  const merged = new Map<string, number>();
  for (const item of raw) {
    if (typeof item !== "object" || item === null) continue;
    const { slug, quantity } = item as { slug?: unknown; quantity?: unknown };
    if (typeof slug !== "string" || !KNOWN_SLUGS.has(slug)) continue;
    const q = Number(quantity);
    if (!Number.isFinite(q)) continue;
    const next = clampQuantity((merged.get(slug) ?? 0) + clampQuantity(q));
    if (next >= 1) merged.set(slug, next);
  }
  return Array.from(merged, ([slug, quantity]) => ({ slug, quantity }));
}

function sanitizeCurrency(raw: unknown): Currency {
  return CURRENCIES.includes(raw as Currency) ? (raw as Currency) : "XAF";
}

// Set when the browser refuses a write; never reset, the condition rarely clears mid-visit.
let persistFailed = false;

function writeStorage(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage can be unavailable (private mode); the cart still works in memory.
    persistFailed = true;
  }
}

/*
 * The cart and currency live in a tiny module-level store backed by
 * localStorage. React reads it with useSyncExternalStore: the server (and the
 * hydration pass) sees the empty "not loaded" snapshot, and the browser then
 * switches to the saved one without a setState-in-effect round trip.
 */
interface Snapshot {
  cart: CartItem[];
  currency: Currency;
  loaded: boolean;
  persisted: boolean;
}

const SERVER_SNAPSHOT: Snapshot = { cart: [], currency: "XAF", loaded: false, persisted: true };
let snapshot: Snapshot | null = null;
const listeners = new Set<() => void>();

function getSnapshot(): Snapshot {
  if (!snapshot) {
    snapshot = {
      cart: sanitizeCart(readStorage<unknown>(CART_KEY, [])),
      currency: sanitizeCurrency(readStorage<unknown>(CURRENCY_KEY, "XAF")),
      loaded: true,
      persisted: !persistFailed,
    };
  }
  return snapshot;
}

function getServerSnapshot(): Snapshot {
  return SERVER_SNAPSHOT;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key === CART_KEY || e.key === CURRENCY_KEY) {
      snapshot = null;
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function update(next: Partial<Omit<Snapshot, "loaded" | "persisted">>) {
  const prev = getSnapshot();
  if (next.cart) writeStorage(CART_KEY, next.cart);
  if (next.currency) writeStorage(CURRENCY_KEY, next.currency);
  snapshot = { ...prev, ...next, persisted: !persistFailed };
  listeners.forEach((l) => l());
}

function updateCart(fn: (prev: CartItem[]) => CartItem[]) {
  update({ cart: fn(getSnapshot().cart) });
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const { cart, currency, loaded, persisted } = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setCurrency = useCallback((c: Currency) => update({ currency: sanitizeCurrency(c) }), []);

  const addToCart = useCallback((slug: string, quantity = 1) => {
    const add = clampQuantity(Number.isFinite(quantity) ? quantity : 1);
    if (add < 1) return;
    updateCart((prev) => {
      const existing = prev.find((i) => i.slug === slug);
      if (existing) {
        return prev.map((i) => (i.slug === slug ? { ...i, quantity: clampQuantity(i.quantity + add) } : i));
      }
      return [...prev, { slug, quantity: add }];
    });
  }, []);

  const setQuantity = useCallback((slug: string, quantity: number) => {
    const q = Number.isFinite(quantity) ? clampQuantity(quantity) : 0;
    updateCart((prev) =>
      q <= 0 ? prev.filter((i) => i.slug !== slug) : prev.map((i) => (i.slug === slug ? { ...i, quantity: q } : i)),
    );
  }, []);

  const removeFromCart = useCallback((slug: string) => {
    updateCart((prev) => prev.filter((i) => i.slug !== slug));
  }, []);

  const clearCart = useCallback(() => update({ cart: [] }), []);

  const value = useMemo<StoreState>(
    () => ({
      currency,
      setCurrency,
      cart,
      addToCart,
      setQuantity,
      removeFromCart,
      clearCart,
      itemCount: cart.reduce((n, i) => n + i.quantity, 0),
      loaded,
      persisted,
    }),
    [currency, setCurrency, cart, addToCart, setQuantity, removeFromCart, clearCart, loaded, persisted],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}
