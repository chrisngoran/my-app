"use client";

import Image from "next/image";
import Link from "next/link";
import { Price } from "@/components/price";
import { useCatalog } from "@/lib/catalog-overrides";
import { products as baseProducts } from "@/lib/data";
import { textLink } from "./buttons";
import { formatWeight, notesSentence } from "./lot-utils";

/** Only images we produced: bundled files or a photo uploaded in admin. */
function safeImage(src: unknown, fallback: string) {
  return typeof src === "string" && (src.startsWith("data:image/") || src.startsWith("/")) ? src : fallback;
}

/** Products made from a lot, with admin edits applied and hidden products left out. */
export function LotProducts({ slugs }: { slugs: string[] }) {
  const { visibleProducts } = useCatalog();
  const products = visibleProducts.filter((p) => slugs.includes(p.slug));

  if (products.length === 0) {
    return (
      <p className="mt-3 max-w-[60ch] text-pretty text-muted">
        None of this lot&apos;s coffee is on sale right now.{" "}
        <Link href="/shop" className={textLink}>
          Browse the shop
        </Link>{" "}
        for coffee available now.
      </p>
    );
  }

  return (
    <ul className="mt-6 divide-y divide-border border-y border-border">
      {products.map((p) => {
        const base = baseProducts.find((b) => b.slug === p.slug);
        const name = typeof p.name === "string" && p.name.trim() ? p.name : (base?.name ?? p.slug);
        const price = Number.isFinite(p.priceXaf) && p.priceXaf > 0 ? p.priceXaf : null;
        const soldOut = !(Number(p.stock) > 0);
        const meta = [formatWeight(p.weightGrams), p.roast ? `${p.roast.toLowerCase()} roast` : null].filter(Boolean).join(", ");
        return (
          <li
            key={p.slug}
            className="grid min-w-0 grid-cols-[3.5rem_minmax(0,1fr)] gap-x-4 gap-y-2 py-5 sm:grid-cols-[3.5rem_minmax(0,1fr)_auto] sm:items-center"
          >
            <Image
              src={safeImage(p.image, base?.image ?? "/products/micro-lot.svg")}
              alt=""
              width={112}
              height={112}
              unoptimized
              className="h-14 w-14 rounded-lg bg-accent-soft object-cover"
            />
            <div className="min-w-0">
              <h3 className="type-title text-brand [overflow-wrap:anywhere]">{name}</h3>
              <p className="mt-0.5 text-sm text-muted">{meta}</p>
              {p.cuppingNotes.length > 0 && (
                <p className="mt-1 text-sm text-foreground">
                  <span className="sr-only">Tastes like: </span>
                  {notesSentence(p.cuppingNotes)}
                </p>
              )}
            </div>
            <div className="col-start-2 flex flex-wrap items-center gap-x-5 gap-y-1 sm:col-start-3 sm:flex-col sm:items-end sm:gap-0">
              {price !== null && <Price xaf={price} className="type-data text-lg text-brand" />}
              {soldOut && <span className="text-sm font-semibold text-muted">Sold out</span>}
              <Link href={`/shop/${p.slug}`} className={textLink}>
                See this coffee<span className="sr-only">: {name}</span>
              </Link>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
