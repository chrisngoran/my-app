"use client";

import { createContext, useCallback, useContext, useMemo, useSyncExternalStore } from "react";
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

function writeStorage(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage can be unavailable (private mode); the cart still works in memory.
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
}

const SERVER_SNAPSHOT: Snapshot = { cart: [], currency: "XAF", loaded: false };
let snapshot: Snapshot | null = null;
const listeners = new Set<() => void>();

function getSnapshot(): Snapshot {
  if (!snapshot) {
    snapshot = {
      cart: readStorage<CartItem[]>(CART_KEY, []),
      currency: readStorage<Currency>(CURRENCY_KEY, "XAF"),
      loaded: true,
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

function update(next: Partial<Omit<Snapshot, "loaded">>) {
  const prev = getSnapshot();
  snapshot = { ...prev, ...next };
  if (next.cart) writeStorage(CART_KEY, next.cart);
  if (next.currency) writeStorage(CURRENCY_KEY, next.currency);
  listeners.forEach((l) => l());
}

function updateCart(fn: (prev: CartItem[]) => CartItem[]) {
  update({ cart: fn(getSnapshot().cart) });
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const { cart, currency, loaded } = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setCurrency = useCallback((c: Currency) => update({ currency: c }), []);

  const addToCart = useCallback((slug: string, quantity = 1) => {
    updateCart((prev) => {
      const existing = prev.find((i) => i.slug === slug);
      if (existing) return prev.map((i) => (i.slug === slug ? { ...i, quantity: i.quantity + quantity } : i));
      return [...prev, { slug, quantity }];
    });
  }, []);

  const setQuantity = useCallback((slug: string, quantity: number) => {
    updateCart((prev) =>
      quantity <= 0 ? prev.filter((i) => i.slug !== slug) : prev.map((i) => (i.slug === slug ? { ...i, quantity } : i)),
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
    }),
    [currency, setCurrency, cart, addToCart, setQuantity, removeFromCart, clearCart, loaded],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}
