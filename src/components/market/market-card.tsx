import Image from "next/image";
import Link from "next/link";
import { Price } from "@/components/price";
import { formatWeight } from "@/components/storefront/catalog";
import { productHref } from "@/lib/catalog-clean";
import type { Product } from "@/lib/types";

/** A farmer's coffee in a grid: photo, name, who grew it, weight and price. */
export function MarketCard({ product, headingLevel: Heading = "h3" }: { product: Product; headingLevel?: "h2" | "h3" }) {
  const href = productHref(product);
  return (
    <article className="relative flex min-w-0 gap-4 sm:flex-col">
      <Link href={href} tabIndex={-1} aria-hidden="true" className="block w-28 shrink-0 overflow-hidden rounded-xl bg-accent-soft sm:w-full">
        <Image src={product.image} alt="" width={600} height={450} unoptimized className="aspect-square h-auto w-full object-cover sm:aspect-[4/3]" />
      </Link>
      <div className="min-w-0">
        <Heading className="type-title text-brand [overflow-wrap:anywhere]">
          <Link href={href} className="relative hover:underline focus-visible:underline after:absolute after:inset-x-0 after:-inset-y-[11px]">
            {product.name}
          </Link>
        </Heading>
        {product.seller && (
          <p className="mt-0.5 text-sm text-muted">
            Grown by{" "}
            <Link href={`/farmers/${product.seller.id}`} className="relative z-10 font-semibold text-accent underline underline-offset-[3px]">
              {product.seller.name}
            </Link>
            {product.seller.village ? `, ${product.seller.village}` : ""}
          </p>
        )}
        <p className="mt-0.5 text-sm text-muted">
          {formatWeight(product.weightGrams)}, {product.category === "green" ? "unroasted" : "roasted"}
          {product.stock <= 0 ? " · Sold out" : ""}
        </p>
        <p className="mt-1">
          <Price xaf={product.priceXaf} className="type-data text-foreground" />
        </p>
      </div>
    </article>
  );
}
