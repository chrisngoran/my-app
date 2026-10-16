"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import { useCatalog } from "@/lib/catalog-overrides";
import { CURRENCIES } from "@/lib/currency";
import type { Currency } from "@/lib/types";
import { useStore } from "./store-provider";

const NAV = [
  { href: "/shop", label: "Shop", short: null },
  { href: "/our-story", label: "Our story", short: null },
  // Below 420px only "Trace" shows; the full name stays the link's accessible name.
  { href: "/trace", label: "Trace your coffee", short: "Trace" },
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
            className={`inline-flex min-h-11 shrink-0 items-center whitespace-nowrap text-[0.9375rem] focus-visible:-outline-offset-2 decoration-2 underline-offset-[6px] hover:text-brand ${
              current ? "font-semibold text-brand underline decoration-cherry" : "font-medium text-foreground"
            }`}
          >
            {item.short ? (
              // One inline wrapper: as direct flex items the leading space would collapse ("Traceyour").
              <span>
                {item.short}
                <span className="max-[419px]:sr-only">{item.label.slice(item.short.length)}</span>
              </span>
            ) : (
              item.label
            )}
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

/**
 * How many bags the order list can actually send: products that exist, are on
 * sale and in stock, each line capped at the stock left. This matches the
 * order list page rather than the raw saved numbers.
 */
function useOrderableCount() {
  const { cart, loaded } = useStore();
  const { products } = useCatalog();
  const count = useMemo(
    () =>
      cart.reduce((n, item) => {
        const product = products.find((p) => p.slug === item.slug);
        if (!product || product.hidden || product.stock <= 0) return n;
        return n + Math.min(item.quantity, product.stock);
      }, 0),
    [cart, products],
  );
  return { count, loaded };
}

/** "My order" pill. The count badge pops when an item is added in this visit. */
function OrderPill({ className = "" }: { className?: string }) {
  const { count: itemCount, loaded } = useOrderableCount();
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
      aria-label={loaded ? `My order, ${itemCount.toLocaleString("en-GB")} ${itemCount === 1 ? "item" : "items"}` : "My order"}
      className={`press inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full bg-cherry py-2 pl-3.5 pr-1.5 text-sm font-semibold text-brand-contrast pointer-fine:hover:bg-cherry-hover ${className}`}
    >
      My order
      {/* Empty until the saved list is read, so it never flashes "0" first. */}
      <span
        key={seen.bumps}
        aria-hidden="true"
        className={`inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-surface px-1.5 text-xs font-bold text-cherry tabular-nums ${
          seen.bumps > 0 ? "anim-pop" : ""
        }`}
      >
        {loaded ? (itemCount > 99 ? "99+" : itemCount) : ""}
      </span>
    </Link>
  );
}

/** Two ripe cherries on a short leaf stroke: the cooperative's mark. */
function CherryMark() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-[22px] w-[22px] shrink-0">
      <path d="M12.6 2.4c3.7.1 6.6 2.2 7.6 5.5-3.9.5-6.8-1.5-7.6-5.5Z" fill="var(--accent)" />
      <path
        d="M12.6 3.4c-.5 4.1-2.5 7.2-4.7 9.8M12.6 3.4c.8 4.3 2.3 7.5 3.8 10.4"
        fill="none"
        stroke="var(--accent)"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <circle cx="7.4" cy="16.8" r="4.6" fill="var(--cherry)" />
      <circle cx="16.6" cy="17.6" r="4.6" fill="var(--cherry)" />
    </svg>
  );
}

export function SiteHeader() {
  const { currency, setCurrency } = useStore();

  return (
    <header className="border-b border-border bg-background print:hidden">
      <div className="bg-brand px-4 py-1 text-center text-xs text-sand">
        Demo version — sample products, farmers and orders for illustration only.
      </div>
      {/*
        Below lg: two rows (logo + My order, then nav + currency).
        lg and up: one row (logo, nav, currency, My order).
      */}
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-3 px-4 lg:flex-nowrap lg:gap-x-8 lg:py-2.5">
        <Link href="/" className="order-1 mr-auto inline-flex min-h-11 items-center gap-2 text-brand lg:mr-0">
          <CherryMark />
          <span className="type-title font-extrabold [font-stretch:80%] sm:text-xl">
            Green Venture<span className="sr-only"> Coffee, home</span>
          </span>
        </Link>
        <OrderPill className="order-2 lg:order-5" />
        <div aria-hidden="true" className="order-3 basis-full lg:hidden" />
        {/* Scrolls sideways rather than overlapping the currency menu on very narrow or zoomed screens. */}
        <nav
          aria-label="Main"
          className="relative order-4 flex min-w-0 flex-1 gap-x-4 overflow-x-auto [mask-image:linear-gradient(to_right,#000_calc(100%-1rem),transparent)] [scrollbar-width:none] sm:gap-x-6 lg:order-2 lg:flex-none lg:overflow-visible lg:[mask-image:none]"
        >
          <Suspense fallback={<NavLinks pathname={null} />}>
            <ActiveNavLinks />
          </Suspense>
        </nav>
        <div className="order-5 shrink-0 lg:order-3 lg:ml-auto">
          <label className="sr-only" htmlFor="currency">
            Display currency
          </label>
          <select
            id="currency"
            value={currency}
            onChange={(e) => setCurrency(e.target.value as Currency)}
            className="min-h-11 rounded-lg border border-field-border bg-surface px-2 text-sm font-medium"
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
