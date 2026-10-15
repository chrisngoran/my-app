import type { Metadata } from "next";
import { Suspense } from "react";
import { ShopCatalog, ShopCatalogFallback } from "@/components/storefront/shop-catalog";
import { products } from "@/lib/data";

export const metadata: Metadata = {
  title: "Shop",
  description: "Roasted coffee, green Arabica, micro-lots and subscriptions from Green Venture Cooperative in Kumbo, Cameroon.",
};

export default function ShopPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:py-12">
      <header className="max-w-2xl">
        <p className="text-sm font-semibold uppercase tracking-wider text-accent">The shop</p>
        <h1 className="mt-1 font-serif text-3xl font-bold text-brand sm:text-4xl">Coffee from the Bui highlands</h1>
        <p className="mt-3 text-foreground/80">
          Small-batch roasts, single-farm micro-lots and green coffee for roasters. Every product is linked to a traceable lot
          from our member farmers.
        </p>
      </header>
      <div className="mt-8">
        <Suspense fallback={<ShopCatalogFallback products={products} />}>
          <ShopCatalog products={products} />
        </Suspense>
      </div>
    </div>
  );
}
