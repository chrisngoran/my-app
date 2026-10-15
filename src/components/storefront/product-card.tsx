import Image from "next/image";
import Link from "next/link";
import { Price } from "@/components/price";
import type { Product } from "@/lib/types";
import { AddToCartButton } from "./add-to-cart-button";
import { CATEGORY_LABELS, formatWeight } from "./catalog";

export function ProductCard({ product, headingLevel = "h3" }: { product: Product; headingLevel?: "h2" | "h3" }) {
  const Heading = headingLevel;
  const href = `/shop/${product.slug}`;
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
          <AddToCartButton slug={product.slug} name={product.name} disabled={product.stock <= 0} />
        </div>
      </div>
    </article>
  );
}
