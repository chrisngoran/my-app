import type { Metadata } from "next";
import { Suspense } from "react";
import { ProductCard } from "@/components/storefront/product-card";
import { ShopCatalog, ShopCatalogFallback } from "@/components/storefront/shop-catalog";
import { products } from "@/lib/data";

export const metadata: Metadata = {
  title: "Shop",
  description: "Roasted coffee, green Arabica, micro-lots and subscriptions from Green Venture Cooperative in Kumbo, Cameroon.",
};

export default function ShopPage() {
  // Cards render here, on the server; the client catalogue only filters them.
  // The first image is the page's largest paint, so it loads straight away.
  const cards = Object.fromEntries(
    products.map((p, i) => [p.slug, <ProductCard key={p.slug} product={p} headingLevel="h2" eager={i === 0} />]),
  );
  return (
    <div className="mx-auto max-w-6xl px-4 pb-6 pt-8 sm:pt-12">
      <header className="max-w-3xl">
        <h1 className="type-h1 text-brand">Coffee from the Bui highlands</h1>
        <p className="type-lead mt-4 max-w-[60ch] text-foreground">
          Roasted coffee, a single-farm micro-lot, green coffee by the kilo for roasters and a monthly subscription. Every bag
          carries a lot code you can trace to the farms.
        </p>
      </header>
      <div className="mt-6">
        <Suspense fallback={<ShopCatalogFallback products={products} cards={cards} />}>
          <ShopCatalog products={products} cards={cards} />
        </Suspense>
      </div>
    </div>
  );
}
