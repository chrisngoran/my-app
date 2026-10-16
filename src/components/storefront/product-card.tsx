"use client";

import Image from "next/image";
import Link from "next/link";
import { Price } from "@/components/price";
import { applyProductOverride, useCatalog, useProductView } from "@/lib/catalog-overrides";
import type { Product } from "@/lib/types";
import { AddToCartButton } from "./add-to-cart-button";
import { formatWeight } from "./catalog";

/** "250 g, light roast" / "1 kg, unroasted": one plain line, no middle dots. */
export function productMeta(product: Pick<Product, "weightGrams" | "roast" | "category">) {
  const weight = formatWeight(product.weightGrams);
  if (product.roast) return `${weight}, ${product.roast.toLowerCase()} roast`;
  if (product.category === "green") return `${weight}, unroasted`;
  return weight;
}

/** "Strawberry, jasmine, cocoa nib": sentence case, only the first note capitalised. */
function notesLine(notes: string[]) {
  const text = notes.map((n, i) => (i === 0 ? n : n.charAt(0).toLowerCase() + n.slice(1))).join(", ");
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * Product card, without card chrome: an image well with the lot's stencilled
 * tag, then the words. Applies any admin edits saved in this browser (name,
 * price, photo, stock). `compact` is a row with a small image, for secondary
 * lists such as "You may also like".
 */
export function ProductCard({
  product: base,
  headingLevel = "h3",
  compact = false,
}: {
  product: Product;
  headingLevel?: "h2" | "h3";
  compact?: boolean;
}) {
  const product = useProductView(base.slug) ?? applyProductOverride(base, undefined);
  const Heading = headingLevel;
  const href = `/shop/${product.slug}`;
  const soldOut = product.stock <= 0;

  if (compact) {
    return (
      <article className="group flex min-w-0 gap-4 border-b border-border pb-4">
        <Link
          href={href}
          tabIndex={-1}
          aria-hidden="true"
          className="relative block h-[88px] w-[88px] shrink-0 overflow-hidden rounded-xl bg-accent-soft"
        >
          <Image src={product.image} alt="" width={176} height={176} unoptimized className="card-zoom h-full w-full object-cover" />
          {soldOut && (
            <span className="absolute inset-x-1 bottom-1 rounded-md bg-danger px-1 py-0.5 text-center text-xs font-semibold text-white">
              Sold out
            </span>
          )}
        </Link>
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div>
            <Heading className="type-title text-brand [overflow-wrap:anywhere]">
              <Link href={href} className="relative hover:underline focus-visible:underline after:absolute after:inset-x-0 after:-inset-y-[11px]">
                {product.name}
              </Link>
            </Heading>
            <p className="mt-0.5 text-sm text-muted">{productMeta(product)}</p>
          </div>
          <div className="mt-auto flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
            <Price xaf={product.priceXaf} className="type-data text-lg text-foreground [overflow-wrap:anywhere]" />
            <AddToCartButton slug={product.slug} name={product.name} disabled={soldOut} />
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="group flex min-w-0 flex-col gap-3">
      <Link
        href={href}
        className="relative block aspect-[4/3] overflow-hidden rounded-2xl bg-accent-soft"
        tabIndex={-1}
        aria-hidden="true"
      >
        <Image src={product.image} alt="" width={800} height={600} unoptimized className="card-zoom h-full w-full object-cover" />
        {/* The lot code, stencilled like the sacks; the product page repeats it as real text. */}
        <span className="type-stencil absolute bottom-3 left-3 rounded-md bg-sand px-2 py-0.5 text-[1.125rem] text-brand">
          {product.lotCode}
        </span>
        {soldOut && (
          <span className="absolute right-3 top-3 rounded-md bg-danger px-2.5 py-1 text-xs font-semibold text-white">Sold out</span>
        )}
      </Link>
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div>
          <Heading className="type-title text-brand [overflow-wrap:anywhere]">
            <Link href={href} className="relative hover:underline focus-visible:underline after:absolute after:inset-x-0 after:-inset-y-[11px]">
              {product.name}
            </Link>
          </Heading>
          <p className="mt-0.5 text-sm text-muted">{productMeta(product)}</p>
        </div>
        {product.cuppingNotes.length > 0 && (
          <div aria-label="Cupping notes" role="group">
            <p className="text-sm text-foreground">{notesLine(product.cuppingNotes)}</p>
          </div>
        )}
        <div className="mt-auto flex flex-wrap items-center justify-between gap-x-3 gap-y-2 pt-1">
          <Price xaf={product.priceXaf} className="type-data text-xl text-foreground [overflow-wrap:anywhere]" />
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
  compact,
  className = "mt-8 grid grid-cols-[minmax(0,1fr)] gap-x-6 gap-y-10 sm:grid-cols-[repeat(2,minmax(0,1fr))] lg:grid-cols-[repeat(3,minmax(0,1fr))]",
}: {
  products: Product[];
  headingLevel?: "h2" | "h3";
  compact?: boolean;
  className?: string;
}) {
  const { products: merged } = useCatalog();
  const visible = products.filter((p) => !merged.find((m) => m.slug === p.slug)?.hidden);
  if (visible.length === 0) {
    return (
      <div className="mt-6 rounded-2xl border border-dashed border-field-border p-6 text-muted">
        <p>No coffee on sale here right now. Ask us on WhatsApp about the next roast, or browse the whole shop.</p>
        <Link
          href="/shop"
          className="mt-2 inline-flex min-h-11 items-center font-semibold text-accent underline decoration-1 underline-offset-4"
        >
          Browse the shop
        </Link>
      </div>
    );
  }
  return (
    <ul className={className}>
      {visible.map((p) => (
        <li key={p.slug} className="flex min-w-0 [&>article]:flex-1">
          <ProductCard product={p} headingLevel={headingLevel} compact={compact} />
        </li>
      ))}
    </ul>
  );
}
