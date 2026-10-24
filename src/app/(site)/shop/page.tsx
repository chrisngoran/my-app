import type { Metadata } from "next";
import { Suspense } from "react";
import { T } from "@/components/t";
import { ShopMarketSection } from "@/components/market/shop-market-section";
import { ProductCard } from "@/components/storefront/product-card";
import { ShopCatalog, ShopCatalogFallback } from "@/components/storefront/shop-catalog";
import { products } from "@/lib/data";

export const metadata: Metadata = {
  title: "Shop",
  description: "Roasted coffee, green Arabica, micro-lots and subscriptions from GREENVENTURES Cooperative in Kumbo, Cameroon.",
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
        <h1 className="type-h1 text-brand"><T k="shopHeading" /></h1>
        <p className="type-lead mt-4 max-w-[60ch] text-foreground"><T k="shopLead" /></p>
      </header>
      <div className="mt-6">
        <Suspense fallback={<ShopCatalogFallback products={products} cards={cards} />}>
          <ShopCatalog products={products} cards={cards} />
        </Suspense>
      </div>
      <ShopMarketSection />
    </div>
  );
}
