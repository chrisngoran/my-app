import Link from "next/link";
import type { Product } from "@/lib/types";
import { askNextRoastLink } from "@/lib/whatsapp";
import { formatWeight } from "./catalog";
import { CardRating } from "@/components/reviews/card-rating";
import {
  LiveAddToCart,
  LiveProductImage,
  LiveProductList,
  LiveProductName,
  LiveProductPrice,
  LiveSoldOutTag,
} from "./live-product";

/**
 * "250 g, light roast" / "1 kg, unroasted" / "3 × 250 g, rotating": one plain
 * line, no middle dots. A subscription draws from several lots, so it says so.
 */
export function productMeta(product: Pick<Product, "weightGrams" | "roast" | "category">) {
  const weight = formatWeight(product.weightGrams);
  if (product.category === "subscription") {
    const bags = product.weightGrams / 250;
    return Number.isInteger(bags) && bags > 1 ? `${bags} × 250 g, rotating` : `${weight}, rotating`;
  }
  if (product.roast) return `${weight}, ${product.roast.toLowerCase()} roast`;
  if (product.category === "green") return `${weight}, unroasted`;
  return weight;
}

/** "Strawberry, jasmine, cocoa nib": sentence case, only the first note capitalised. */
export function notesLine(notes: string[]) {
  const text = notes.map((n, i) => (i === 0 ? n : n.charAt(0).toLowerCase() + n.slice(1))).join(", ");
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** A subscription is filled from rotating lots, so it never carries one lot's code. */
export function isRotating(product: Pick<Product, "category">) {
  return product.category === "subscription";
}

type Layout = "responsive" | "row" | "stack";

/*
 * Class sets per layout. "row" is a price-list line (88px image, words beside
 * it). "stack" is the large image well with the words below. "responsive" is
 * a row on phones (half the scroll on a slow connection, and how a co-op
 * price list reads) and a stack from `sm` up.
 */
const L = {
  article: {
    row: "grid grid-cols-[88px_minmax(0,1fr)] gap-x-4 border-b border-border pb-4",
    stack: "flex flex-col gap-3",
    responsive:
      "grid grid-cols-[88px_minmax(0,1fr)] gap-x-4 border-b border-border pb-4 sm:flex sm:flex-col sm:gap-3 sm:border-b-0 sm:pb-0",
  },
  well: {
    row: "h-[88px] w-[88px] rounded-xl",
    stack: "aspect-[4/3] w-full rounded-2xl",
    responsive: "h-[88px] w-[88px] rounded-xl sm:aspect-[4/3] sm:h-auto sm:w-full sm:rounded-2xl",
  },
  lotTag: { row: "hidden", stack: "", responsive: "max-sm:hidden" },
  soldOut: {
    row: "absolute inset-x-1 bottom-1 rounded-md bg-danger px-1 py-0.5 text-center text-xs font-semibold text-white",
    stack: "absolute right-3 top-3 rounded-md bg-danger px-2.5 py-1 text-xs font-semibold text-white",
    responsive:
      "absolute inset-x-1 bottom-1 rounded-md bg-danger px-1 py-0.5 text-center text-xs font-semibold text-white sm:inset-x-auto sm:bottom-auto sm:right-3 sm:top-3 sm:px-2.5 sm:py-1",
  },
  notes: { row: "hidden", stack: "", responsive: "max-sm:hidden" },
  price: { row: "text-lg", stack: "text-xl", responsive: "text-lg sm:text-xl" },
} as const;

/**
 * A product without card chrome: an image well tagged with the lot's
 * stencilled code, then the words. Server-rendered; the parts staff can edit
 * in the demo admin (name, photo, price, stock) are small client islands.
 */
export function ProductCard({
  product,
  headingLevel = "h3",
  layout = "responsive",
  eager = false,
  prefetch,
}: {
  product: Product;
  headingLevel?: "h2" | "h3";
  layout?: Layout;
  /** The first image on a catalogue page: load it straight away. */
  eager?: boolean;
  /** `false` for secondary lists, so they do not spend a visitor's data in the background. */
  prefetch?: false;
}) {
  const Heading = headingLevel;
  const href = `/shop/${product.slug}`;
  const rotating = isRotating(product);

  return (
    <article className={`min-w-0 ${L.article[layout]}`}>
      <Link
        href={href}
        prefetch={prefetch}
        tabIndex={-1}
        aria-hidden="true"
        className={`relative block shrink-0 overflow-hidden bg-accent-soft ${L.well[layout]}`}
      >
        <LiveProductImage
          slug={product.slug}
          fallbackSrc={product.image}
          alt=""
          eager={eager}
          className="h-full w-full object-cover"
        />
        {/* The lot code, stencilled like the sacks; the product page repeats it as real text. */}
        {rotating ? (
          <span className={`type-label absolute bottom-3 left-3 rounded-md bg-sand px-2 py-1 text-brand ${L.lotTag[layout]}`}>
            Rotating lots
          </span>
        ) : (
          <span
            className={`type-stencil absolute bottom-3 left-3 rounded-md bg-sand px-2 py-0.5 text-[1.125rem] text-brand ${L.lotTag[layout]}`}
          >
            {product.lotCode}
          </span>
        )}
        <LiveSoldOutTag slug={product.slug} fallbackStock={product.stock} className={L.soldOut[layout]} />
      </Link>
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div>
          <Heading className="type-title text-brand [overflow-wrap:anywhere]">
            <Link
              href={href}
              prefetch={prefetch}
              className="relative hover:underline focus-visible:underline after:absolute after:inset-x-0 after:-inset-y-[11px]"
            >
              <LiveProductName slug={product.slug} fallback={product.name} />
            </Link>
          </Heading>
          <p className="mt-0.5 text-sm text-muted">{productMeta(product)}</p>
          <CardRating slug={product.slug} />
        </div>
        {product.cuppingNotes.length > 0 && !rotating && (
          <p className={`text-sm text-foreground ${L.notes[layout]}`}>
            <span className="sr-only">Tastes like: </span>
            {notesLine(product.cuppingNotes)}
          </p>
        )}
        <div className="mt-auto flex flex-wrap items-center justify-between gap-x-3 gap-y-2 sm:pt-1">
          <LiveProductPrice
            slug={product.slug}
            fallbackXaf={product.priceXaf}
            className={`type-data text-foreground ${L.price[layout]}`}
          />
          <LiveAddToCart slug={product.slug} fallbackName={product.name} fallbackStock={product.stock} />
        </div>
      </div>
    </article>
  );
}

/** Shown when staff have hidden every product in a list. */
export function NoCoffeeOnSale() {
  return (
    <div className="mt-6 rounded-2xl border border-dashed border-field-border p-6">
      <p className="text-foreground">No coffee on sale here right now. Ask us on WhatsApp about the next roast, or browse the whole shop.</p>
      <div className="mt-4 flex flex-wrap gap-3">
        <a href={askNextRoastLink()} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp">
          Ask on WhatsApp
        </a>
        <Link href="/shop" className="btn btn-secondary">
          Browse the shop
        </Link>
      </div>
    </div>
  );
}

/** A list of product cards that leaves out products staff have hidden from the website. */
export function ProductGrid({
  products,
  headingLevel,
  layout,
  prefetch,
  className = "mt-8 grid grid-cols-[minmax(0,1fr)] gap-x-6 gap-y-10 sm:grid-cols-[repeat(2,minmax(0,1fr))] lg:grid-cols-[repeat(3,minmax(0,1fr))]",
}: {
  products: Product[];
  headingLevel?: "h2" | "h3";
  layout?: Layout;
  prefetch?: false;
  className?: string;
}) {
  return (
    <LiveProductList
      className={className}
      empty={<NoCoffeeOnSale />}
      items={products.map((p) => ({
        slug: p.slug,
        node: <ProductCard product={p} headingLevel={headingLevel} layout={layout} prefetch={prefetch} />,
      }))}
    />
  );
}
