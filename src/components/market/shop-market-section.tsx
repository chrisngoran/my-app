"use client";

import Link from "next/link";
import { useCatalog } from "@/lib/catalog-overrides";
import { MarketCard } from "./market-card";

/** "From our farmers" under the cooperative's own coffee, once any farmer has approved coffee on sale. */
export function ShopMarketSection() {
  const { listings } = useCatalog();
  if (listings.length === 0) return null;
  return (
    <section aria-labelledby="farmers-coffee-heading" className="anim-enter mt-14 border-t border-border pt-10">
      <h2 id="farmers-coffee-heading" className="type-h2 text-brand">
        From our farmers
      </h2>
      <p className="mt-2 max-w-[60ch] text-foreground">
        Coffee sold by our member farmers themselves. We deliver it with your order, and the farmer is paid their share.{" "}
        <Link href="/farmers" className="font-semibold text-accent underline underline-offset-[3px]">
          Meet the farmers
        </Link>
      </p>
      <div className="mt-6 grid grid-cols-[minmax(0,1fr)] gap-6 sm:grid-cols-[repeat(2,minmax(0,1fr))] lg:grid-cols-[repeat(3,minmax(0,1fr))]">
        {listings.map((p) => (
          <MarketCard key={p.slug} product={p} />
        ))}
      </div>
    </section>
  );
}
