"use client";

/*
 * Small client islands for product data that staff can edit in the demo
 * admin (name, description, price, stock, photo, hidden). Each renders the
 * data.ts value on the server and during hydration, then the edited value
 * once this browser's saved edits are loaded. Everything else about a product
 * card or page stays server-rendered HTML.
 */

import Image from "next/image";
import { Price } from "@/components/price";
import { useCatalog, useProductView } from "@/lib/catalog-overrides";
import { AddToCartButton } from "./add-to-cart-button";
import { StockIndicator } from "./stock-indicator";

export function LiveProductName({ slug, fallback }: { slug: string; fallback: string }) {
  return <>{useProductView(slug)?.name ?? fallback}</>;
}

/** The description as its own paragraph; nothing at all when staff have cleared it. */
export function LiveProductDescription({ slug, fallback, className }: { slug: string; fallback: string; className?: string }) {
  const text = useProductView(slug)?.description ?? fallback;
  if (!text.trim()) return null;
  return <p className={className}>{text}</p>;
}

export function LiveProductPrice({ slug, fallbackXaf, className }: { slug: string; fallbackXaf: number; className?: string }) {
  return <Price xaf={useProductView(slug)?.priceXaf ?? fallbackXaf} className={className} />;
}

export function LiveProductStock({ slug, fallback }: { slug: string; fallback: number }) {
  const product = useProductView(slug);
  if (product?.hidden) {
    return (
      <p className="inline-flex items-center gap-2 text-sm font-medium text-muted">
        <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full bg-muted" />
        Not on sale at the moment
      </p>
    );
  }
  return <StockIndicator stock={product?.stock ?? fallback} />;
}

export function LiveProductImage({
  slug,
  fallbackSrc,
  alt,
  className,
  width = 800,
  height = 600,
  preload,
  eager,
}: {
  slug: string;
  fallbackSrc: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  /** The page's main image (product page). */
  preload?: boolean;
  /** Above the fold but not the page's main image (first card on /shop). */
  eager?: boolean;
}) {
  const src = useProductView(slug)?.image ?? fallbackSrc;
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      // bundled photos are resized per screen; a photo uploaded in admin is a data: URL and is shown as is
      unoptimized={src.startsWith("data:")}
      preload={preload}
      loading={eager ? "eager" : undefined}
      fetchPriority={eager ? "high" : undefined}
      className={className}
    />
  );
}

/** "Sold out" over a product image, shown only while the (possibly edited) stock is zero. */
export function LiveSoldOutTag({ slug, fallbackStock, className }: { slug: string; fallbackStock: number; className?: string }) {
  const stock = useProductView(slug)?.stock ?? fallbackStock;
  if (stock > 0) return null;
  return <span className={className}>Sold out</span>;
}

/** "Add to order" for a card: edited name for the announcement, disabled when sold out. */
export function LiveAddToCart({ slug, fallbackName, fallbackStock }: { slug: string; fallbackName: string; fallbackStock: number }) {
  const product = useProductView(slug);
  return (
    <AddToCartButton
      slug={slug}
      name={product?.name ?? fallbackName}
      disabled={(product?.stock ?? fallbackStock) <= 0}
    />
  );
}

/**
 * A list of server-rendered product items that leaves out products staff have
 * hidden from the website. When every one is hidden, `empty` shows instead.
 */
export function LiveProductList({
  items,
  className,
  empty = null,
}: {
  items: { slug: string; node: React.ReactNode; className?: string }[];
  className?: string;
  empty?: React.ReactNode;
}) {
  const { products } = useCatalog();
  const shown = items.filter((item) => !products.find((p) => p.slug === item.slug)?.hidden);
  if (shown.length === 0) return <>{empty}</>;
  return (
    <ul className={className}>
      {shown.map((item) => (
        <li key={item.slug} className={item.className ?? "flex min-w-0 [&>article]:flex-1"}>
          {item.node}
        </li>
      ))}
    </ul>
  );
}
