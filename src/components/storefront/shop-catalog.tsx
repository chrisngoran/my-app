"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useStore } from "@/components/store-provider";
import { useCatalog } from "@/lib/catalog-overrides";
import { getT } from "@/lib/i18n";
import type { Product, ProductCategory } from "@/lib/types";
import { askNextRoastLink } from "@/lib/whatsapp";
import { CATEGORIES, isCategory } from "./catalog";

/** Server-rendered product cards, by slug. The catalogue only filters and orders them. */
export type CardsBySlug = Record<string, React.ReactNode>;

/* minmax(0, 1fr) tracks: a long unbroken product name wraps instead of widening the page. */
/* Phones get price-list rows (tighter rhythm); from sm up, image wells in a grid. */
const GRID =
  "grid grid-cols-[minmax(0,1fr)] gap-x-6 gap-y-4 sm:grid-cols-[repeat(2,minmax(0,1fr))] sm:gap-y-10 lg:grid-cols-[repeat(3,minmax(0,1fr))]";

/** Leaves out products that staff have hidden from the website in the demo admin. */
function useShownProducts(products: Product[]) {
  const { products: merged } = useCatalog();
  return products.filter((p) => !merged.find((m) => m.slug === p.slug)?.hidden);
}

const CATEGORY_KEY_MAP = {
  roasted: "categoryRoasted",
  green: "categoryGreen",
  "micro-lot": "categoryMicroLot",
  subscription: "categorySubscription",
} as const;

export function ShopCatalog({ products: all, cards }: { products: Product[]; cards: CardsBySlug }) {
  const products = useShownProducts(all);
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { lang } = useStore();
  const t = getT(lang);
  const raw = searchParams.get("category");
  const active: ProductCategory | null = isCategory(raw) ? raw : null;
  const visible = active ? products.filter((p) => p.category === active) : products;
  // Only fade the grid in after the visitor changes the filter, never on first paint.
  const [filtered, setFiltered] = useState(false);

  function select(category: ProductCategory | null) {
    setFiltered(true);
    router.replace(category ? `${pathname}?category=${category}` : pathname, { scroll: false });
  }

  const options: { id: ProductCategory | null; label: string; count: number }[] = [
    { id: null, label: t.allCoffee, count: products.length },
    ...CATEGORIES.map((c) => ({ id: c, label: t[CATEGORY_KEY_MAP[c]], count: products.filter((p) => p.category === c).length })),
    // An empty category is a dead end, so its chip only shows while it is the active filter.
  ].filter((o) => o.id === null || o.count > 0 || o.id === active);

  return (
    <div>
      {/* The right-edge fade shows that the chip row scrolls on narrow screens. */}
      <div className="-mx-4 overflow-x-auto px-4 py-1 [mask-image:linear-gradient(to_right,#000_calc(100%-1.5rem),transparent)] lg:[mask-image:none]">
        <div role="group" aria-label="Filter by category" className="flex w-max gap-2">
          {options.map((o) => {
            const pressed = o.id === active;
            return (
              <button
                key={o.id ?? "all"}
                type="button"
                aria-pressed={pressed}
                onClick={() => select(o.id)}
                className={`press inline-flex min-h-11 items-center gap-2 whitespace-nowrap rounded-lg border px-4 py-2 text-sm font-medium ${
                  pressed
                    ? "border-brand bg-brand text-brand-contrast"
                    : "border-field-border bg-transparent text-foreground pointer-fine:hover:border-brand pointer-fine:hover:text-brand"
                }`}
              >
                {o.label}
                <span className={`tabular ${pressed ? "text-mist-on-soil" : "text-muted"}`}>{o.count}</span>
              </button>
            );
          })}
        </div>
      </div>
      <p className="sr-only" role="status" aria-live="polite">
        Showing {visible.length} {visible.length === 1 ? "product" : "products"}
      </p>
      {visible.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-field-border p-6 sm:p-8">
          <p className="text-foreground">
            {active
              ? "No products in this category yet. Check back after the next harvest."
              : "No coffee on sale right now. Check back after the next harvest, or ask us on WhatsApp about the next roast."}
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            {active ? (
              <button type="button" onClick={() => select(null)} className="btn btn-secondary">
                Show all coffee
              </button>
            ) : (
              <a href={askNextRoastLink()} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp">
                Ask on WhatsApp
              </a>
            )}
          </div>
        </div>
      ) : (
        <ul key={active ?? "all"} className={`mt-6 ${GRID} ${filtered ? "anim-enter" : ""}`}>
          {visible.map((p) => (
            <li key={p.slug} className="flex min-w-0 [&>article]:flex-1">
              {cards[p.slug]}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function ShopCatalogFallback({ products: all, cards }: { products: Product[]; cards: CardsBySlug }) {
  const products = useShownProducts(all);
  return (
    <div>
      <div className="h-[3.25rem]" aria-hidden="true" />
      <ul className={`mt-6 ${GRID}`}>
        {products.map((p) => (
          <li key={p.slug} className="flex min-w-0 [&>article]:flex-1">
            {cards[p.slug]}
          </li>
        ))}
      </ul>
    </div>
  );
}
