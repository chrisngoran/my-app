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
    <div className="mx-auto max-w-6xl px-4 pb-6 pt-8 sm:pt-12">
      <header className="max-w-3xl">
        <h1 className="type-h1 text-brand">Coffee from the Bui highlands</h1>
        <p className="type-lead mt-4 max-w-[60ch] text-foreground">
          Small-batch roasts, single-farm micro-lots and green coffee for roasters. Every product is linked to a traceable lot
          from our member farmers.
        </p>
      </header>
      <div className="mt-6">
        <Suspense fallback={<ShopCatalogFallback products={products} />}>
          <ShopCatalog products={products} />
        </Suspense>
      </div>
    </div>
  );
}
