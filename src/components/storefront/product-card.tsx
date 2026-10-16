"use client";

import Image from "next/image";
import Link from "next/link";
import { Price } from "@/components/price";
import { applyProductOverride, useCatalog, useProductView } from "@/lib/catalog-overrides";
import type { Product } from "@/lib/types";
import { AddToCartButton } from "./add-to-cart-button";
import { CATEGORY_LABELS, formatWeight } from "./catalog";

/** Product card. Applies any admin edits saved in this browser (name, price, photo, stock). */
export function ProductCard({ product: base, headingLevel = "h3" }: { product: Product; headingLevel?: "h2" | "h3" }) {
  const product = useProductView(base.slug) ?? applyProductOverride(base, undefined);
  const Heading = headingLevel;
  const href = `/shop/${product.slug}`;
  const soldOut = product.stock <= 0;
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-sm transition-shadow hover:shadow-md">
      <Link href={href} className="relative block aspect-[4/3] overflow-hidden bg-accent-soft" tabIndex={-1} aria-hidden="true">
        <Image
          src={product.image}
          alt=""
          width={800}
          height={600}
          unoptimized
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />
        <span className="absolute left-3 top-3 rounded-full bg-surface/90 px-2.5 py-1 text-xs font-medium text-brand">
          {CATEGORY_LABELS[product.category]}
        </span>
        {soldOut && (
          <span className="absolute right-3 top-3 rounded-full bg-red-700 px-2.5 py-1 text-xs font-semibold text-white">Sold out</span>
        )}
      </Link>
      <div className="flex flex-1 flex-col gap-3 p-4 sm:p-5">
        <div>
          <Heading className="font-serif text-lg font-bold leading-snug text-brand">
            <Link href={href} className="hover:underline focus-visible:underline">
              {product.name}
            </Link>
          </Heading>
          <p className="mt-0.5 text-sm text-muted">
            {formatWeight(product.weightGrams)}
            {product.roast ? ` · ${product.roast} roast` : product.category === "green" ? " · Unroasted" : ""}
          </p>
        </div>
        <ul className="flex flex-wrap gap-1.5" aria-label="Cupping notes">
          {product.cuppingNotes.map((note) => (
            <li key={note} className="rounded-full bg-accent-soft px-2.5 py-0.5 text-xs text-accent">
              {note}
            </li>
          ))}
        </ul>
        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-2">
          <Price xaf={product.priceXaf} className="text-lg font-bold text-foreground" />
          <AddToCartButton slug={product.slug} name={product.name} disabled={soldOut} />
        </div>
      </div>
    </article>
  );
}

/** A grid of product cards that leaves out products staff have hidden from the website. */
export function ProductGrid({
  products,
  headingLevel,
  className = "mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3",
}: {
  products: Product[];
  headingLevel?: "h2" | "h3";
  className?: string;
}) {
  const { products: merged } = useCatalog();
  const visible = products.filter((p) => !merged.find((m) => m.slug === p.slug)?.hidden);
  return (
    <ul className={className}>
      {visible.map((p) => (
        <li key={p.slug} className="flex [&>article]:flex-1">
          <ProductCard product={p} headingLevel={headingLevel} />
        </li>
      ))}
    </ul>
  );
}
