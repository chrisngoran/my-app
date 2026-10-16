"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useState } from "react";
import { CURRENCIES } from "@/lib/currency";
import type { Currency } from "@/lib/types";
import { useStore } from "./store-provider";

const NAV = [
  { href: "/shop", label: "Shop" },
  { href: "/our-story", label: "Our story" },
  { href: "/trace", label: "Trace your coffee" },
];

function NavLinks({ pathname }: { pathname: string | null }) {
  return (
    <>
      {NAV.map((item) => {
        const current = pathname === item.href || (pathname?.startsWith(`${item.href}/`) ?? false);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={current ? "page" : undefined}
            className={`inline-flex min-h-11 items-center whitespace-nowrap decoration-2 underline-offset-[6px] hover:text-brand ${
              current ? "font-semibold text-brand underline decoration-brand" : "text-foreground/80"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </>
  );
}

/*
 * With cacheComponents on, usePathname can suspend on routes with params that
 * are not prerendered (e.g. an unknown lot code), so it sits in its own
 * Suspense boundary and the fallback renders the same links without an active
 * state.
 */
function ActiveNavLinks() {
  return <NavLinks pathname={usePathname()} />;
}

/** "My order" pill. The count badge pops when an item is added in this visit. */
function OrderPill({ className = "" }: { className?: string }) {
  const { itemCount, loaded } = useStore();
  // Derived during render (no effect): count each increase after the saved cart has loaded.
  const [seen, setSeen] = useState({ count: itemCount, loaded, bumps: 0 });
  if (seen.count !== itemCount || seen.loaded !== loaded) {
    setSeen({
      count: itemCount,
      loaded,
      bumps: seen.loaded && loaded && itemCount > seen.count ? seen.bumps + 1 : seen.bumps,
    });
  }

  return (
    <Link
      href="/cart"
      aria-label={`My order, ${itemCount} ${itemCount === 1 ? "item" : "items"}`}
      className={`press inline-flex min-h-11 items-center gap-2 rounded-full bg-brand py-2 pl-3.5 pr-1.5 text-sm font-semibold text-brand-contrast ${className}`}
    >
      My order
      <span
        key={seen.bumps}
        aria-hidden="true"
        className={`inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-surface px-1.5 text-xs font-bold text-brand tabular-nums ${
          seen.bumps > 0 ? "anim-pop" : ""
        }`}
      >
        {itemCount}
      </span>
    </Link>
  );
}

export function SiteHeader() {
  const { currency, setCurrency } = useStore();

  return (
    <header className="border-b border-border bg-surface print:hidden">
      <div className="bg-brand px-4 py-1.5 text-center text-xs text-brand-contrast">
        Demo version — sample products, farmers and orders for illustration only.
      </div>
      {/*
        Below lg: two rows (logo + My order, then nav + currency).
        lg and up: one row (logo, nav, currency, My order).
      */}
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-3 px-4 py-1.5 lg:flex-nowrap lg:gap-x-6 lg:py-3">
        <Link
          href="/"
          className="order-1 mr-auto inline-flex min-h-11 items-center font-serif text-[1.0625rem] font-bold text-brand sm:text-xl lg:mr-0"
        >
          <span>
            Green Venture <span className="text-accent">Coffee</span>
          </span>
        </Link>
        <OrderPill className="order-2 lg:order-5" />
        <div aria-hidden="true" className="order-3 basis-full lg:hidden" />
        <nav aria-label="Main" className="order-4 flex min-w-0 flex-1 gap-x-3 text-sm sm:gap-x-5 lg:order-2 lg:flex-none">
          <Suspense fallback={<NavLinks pathname={null} />}>
            <ActiveNavLinks />
          </Suspense>
        </nav>
        <div className="order-5 lg:order-3 lg:ml-auto">
          <label className="sr-only" htmlFor="currency">
            Display currency
          </label>
          <select
            id="currency"
            value={currency}
            onChange={(e) => setCurrency(e.target.value as Currency)}
            className="min-h-11 rounded-lg border border-border bg-surface px-2 text-sm"
          >
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>
                {c === "XAF" ? "FCFA" : c}
              </option>
            ))}
          </select>
        </div>
      </div>
    </header>
  );
}
