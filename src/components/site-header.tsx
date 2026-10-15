"use client";

import Link from "next/link";
import { CURRENCIES } from "@/lib/currency";
import type { Currency } from "@/lib/types";
import { useStore } from "./store-provider";

const NAV = [
  { href: "/shop", label: "Shop" },
  { href: "/our-story", label: "Our story" },
  { href: "/trace", label: "Trace your coffee" },
  { href: "/portal", label: "Cooperative portal" },
];

export function SiteHeader() {
  const { itemCount, currency, setCurrency } = useStore();

  return (
    <header className="border-b border-border bg-surface">
      <div className="bg-brand px-4 py-1.5 text-center text-xs text-brand-contrast">
        Demo version — sample products, farmers and orders for illustration only.
      </div>
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-3 px-4 py-4">
        <Link href="/" className="font-serif text-xl font-bold text-brand">
          Green Venture <span className="text-accent">Coffee</span>
        </Link>
        <nav className="order-3 flex w-full flex-wrap gap-x-5 gap-y-1 text-sm sm:order-none sm:w-auto">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className="text-foreground/80 hover:text-brand">
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-3">
          <label className="sr-only" htmlFor="currency">
            Currency
          </label>
          <select
            id="currency"
            value={currency}
            onChange={(e) => setCurrency(e.target.value as Currency)}
            className="rounded-md border border-border bg-surface px-2 py-1 text-sm"
          >
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>
                {c === "XAF" ? "FCFA" : c}
              </option>
            ))}
          </select>
          <Link href="/cart" className="rounded-md bg-brand px-3 py-1.5 text-sm font-medium text-brand-contrast">
            Cart ({itemCount})
          </Link>
        </div>
      </div>
    </header>
  );
}
