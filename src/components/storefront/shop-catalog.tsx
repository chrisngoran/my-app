"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCatalog } from "@/lib/catalog-overrides";
import type { Product, ProductCategory } from "@/lib/types";
import { CATEGORIES, CATEGORY_LABELS, isCategory } from "./catalog";
import { ProductCard } from "./product-card";

/** Leaves out products that staff have hidden from the website in the demo admin. */
function useShownProducts(products: Product[]) {
  const { products: merged } = useCatalog();
  return products.filter((p) => !merged.find((m) => m.slug === p.slug)?.hidden);
}

export function ShopCatalog({ products: all }: { products: Product[] }) {
  const products = useShownProducts(all);
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const raw = searchParams.get("category");
  const active: ProductCategory | null = isCategory(raw) ? raw : null;
  const visible = active ? products.filter((p) => p.category === active) : products;

  function select(category: ProductCategory | null) {
    router.replace(category ? `${pathname}?category=${category}` : pathname, { scroll: false });
  }

  const options: { id: ProductCategory | null; label: string; count: number }[] = [
    { id: null, label: "All coffee", count: products.length },
    ...CATEGORIES.map((c) => ({ id: c, label: CATEGORY_LABELS[c], count: products.filter((p) => p.category === c).length })),
  ];

  return (
    <div>
      <div className="-mx-4 overflow-x-auto px-4 pb-1">
        <div role="group" aria-label="Filter by category" className="flex w-max gap-2">
          {options.map((o) => {
            const pressed = o.id === active;
            return (
              <button
                key={o.id ?? "all"}
                type="button"
                aria-pressed={pressed}
                onClick={() => select(o.id)}
                className={`min-h-10 whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                  pressed
                    ? "border-brand bg-brand text-brand-contrast"
                    : "border-border bg-surface text-foreground hover:border-brand hover:text-brand"
                }`}
              >
                {o.label} <span className={pressed ? "opacity-80" : "text-muted"}>({o.count})</span>
              </button>
            );
          })}
        </div>
      </div>
      <p className="sr-only" role="status" aria-live="polite">
        Showing {visible.length} {visible.length === 1 ? "product" : "products"}
      </p>
      {visible.length === 0 ? (
        <p className="mt-10 rounded-xl border border-dashed border-border p-8 text-center text-muted">
          No products in this category yet — check back after the next harvest.
        </p>
      ) : (
        <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((p) => (
            <li key={p.slug} className="flex">
              <div className="flex w-full flex-col [&>article]:flex-1">
                <ProductCard product={p} headingLevel="h2" />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function ShopCatalogFallback({ products: all }: { products: Product[] }) {
  const products = useShownProducts(all);
  return (
    <div>
      <div className="h-11" aria-hidden="true" />
      <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((p) => (
          <li key={p.slug} className="flex">
            <div className="flex w-full flex-col [&>article]:flex-1">
              <ProductCard product={p} headingLevel="h2" />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
