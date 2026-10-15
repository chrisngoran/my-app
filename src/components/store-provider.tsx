"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
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

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>("XAF");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setCart(readStorage<CartItem[]>(CART_KEY, []));
    setCurrencyState(readStorage<Currency>(CURRENCY_KEY, "XAF"));
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) writeStorage(CART_KEY, cart);
  }, [cart, loaded]);

  const setCurrency = useCallback((c: Currency) => {
    setCurrencyState(c);
    writeStorage(CURRENCY_KEY, c);
  }, []);

  const addToCart = useCallback((slug: string, quantity = 1) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.slug === slug);
      if (existing) return prev.map((i) => (i.slug === slug ? { ...i, quantity: i.quantity + quantity } : i));
      return [...prev, { slug, quantity }];
    });
  }, []);

  const setQuantity = useCallback((slug: string, quantity: number) => {
    setCart((prev) =>
      quantity <= 0 ? prev.filter((i) => i.slug !== slug) : prev.map((i) => (i.slug === slug ? { ...i, quantity } : i)),
    );
  }, []);

  const removeFromCart = useCallback((slug: string) => {
    setCart((prev) => prev.filter((i) => i.slug !== slug));
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

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
    }),
    [currency, setCurrency, cart, addToCart, setQuantity, removeFromCart, clearCart],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}
