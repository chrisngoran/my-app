"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useMemo } from "react";
import { BrandMark } from "@/components/brand-mark";
import { useCatalog } from "@/lib/catalog-overrides";
import { CURRENCIES } from "@/lib/currency";
import type { Currency } from "@/lib/types";
import { useStore } from "./store-provider";

/* One name per destination, the same in the header, footer and buttons ("Trace a bag"). */
const NAV = [
  { href: "/shop", label: "Shop" },
  { href: "/our-story", label: "Our story" },
  { href: "/trace", label: "Trace a bag" },
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

/**
 * How many bags the order list can actually send: products that exist, are on
 * sale and in stock, each line capped at the stock left. This matches the
 * order list page rather than the raw saved numbers.
 */
function useOrderableCount() {
  const { cart, loaded } = useStore();
  const { orderable: products } = useCatalog();
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

/** "My order" pill. The count badge pops each time something is added (not when a quantity is edited). */
function OrderPill({ className = "" }: { className?: string }) {
  const { count: itemCount, loaded } = useOrderableCount();
  const { adds } = useStore();

  return (
    <Link
      href="/cart"
      aria-label={loaded ? `My order, ${itemCount.toLocaleString("en-GB")} ${itemCount === 1 ? "item" : "items"}` : "My order"}
      className={`press inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full bg-cherry py-2 pl-3.5 pr-1.5 text-sm font-semibold text-brand-contrast pointer-fine:hover:bg-cherry-hover ${className}`}
    >
      My order
      {/* Empty until the saved list is read, so it never flashes "0" first. */}
      <span
        key={adds}
        aria-hidden="true"
        className={`inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-surface px-1.5 text-xs font-bold text-cherry tabular-nums ${
          adds > 0 ? "anim-pop" : ""
        }`}
      >
        {loaded ? (itemCount > 99 ? "99+" : itemCount) : ""}
      </span>
    </Link>
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
        Below md: two rows (logo + My order, then nav + currency).
        md and up: one row (logo, nav, currency, My order), so a phone held
        sideways keeps most of its short screen for the page.
      */}
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-3 px-4 md:flex-nowrap md:gap-x-5 md:py-2 lg:gap-x-8 lg:py-2.5">
        <Link href="/" className="order-1 mr-auto inline-flex min-h-11 items-center gap-2 text-brand md:mr-0">
          <BrandMark className="h-10 w-10 shrink-0" />
          <span className="type-title font-extrabold [font-stretch:80%] sm:text-xl">
            GREENVENTURES<span className="sr-only"> Coffee, home</span>
          </span>
        </Link>
        <OrderPill className="order-2 md:order-5" />
        <div aria-hidden="true" className="order-3 basis-full md:hidden" />
        {/* Scrolls sideways rather than overlapping the currency menu on very narrow or zoomed screens. */}
        <nav
          aria-label="Main"
          className="relative order-4 flex min-w-0 flex-1 gap-x-4 overflow-x-auto [mask-image:linear-gradient(to_right,#000_calc(100%-1rem),transparent)] [scrollbar-width:none] sm:gap-x-6 md:order-2 md:flex-none md:gap-x-5 md:overflow-visible md:[mask-image:none] lg:gap-x-6"
        >
          <Suspense fallback={<NavLinks pathname={null} />}>
            <ActiveNavLinks />
          </Suspense>
        </nav>
        <div className="order-5 shrink-0 md:order-3 md:ml-auto">
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
