"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Price } from "@/components/price";
import { useStore } from "@/components/store-provider";
import { type CatalogProduct, useCatalog } from "@/lib/catalog-overrides";
import { formatWeight, SHIPPING_XAF } from "./catalog";
import { QuantityStepper } from "./quantity-stepper";
import { isUploadedImage } from "@/lib/catalog-clean";
import { productHref } from "@/lib/catalog-clean";

/** "250 g, light roast" / "1 kg, unroasted": the weight and roast as one comma phrase. */
export function productMeta(product: Pick<CatalogProduct, "weightGrams" | "roast" | "category">) {
  const weight = formatWeight(product.weightGrams);
  if (product.roast) return `${weight}, ${product.roast.toLowerCase()} roast`;
  if (product.category === "green") return `${weight}, unroasted`;
  return weight;
}

/** 16px chevron for back links (authored, not a glyph). */
export function ChevronLeft({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" className={`shrink-0 ${className}`} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 3.5 5.5 8l4.5 4.5" />
    </svg>
  );
}

/** 16px warning mark that sits before error text, so an error is never colour alone. */
export function AlertMark({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" className={`shrink-0 ${className}`} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="8" r="6.25" />
      <path d="M8 4.75v3.75M8 11.1v.15" />
    </svg>
  );
}

export interface CartLine {
  product: CatalogProduct;
  quantity: number;
  lineXaf: number;
  /** The saved quantity was more than is in stock, so it was reduced to the stock. */
  capped: boolean;
}

/**
 * Cart lines at the current price (including any admin edits saved in this
 * browser). Quantities never exceed the stock on hand. Products that are sold
 * out or hidden from the website are listed separately in `unavailable` and
 * left out of the total and the order.
 */
export function useCartLines() {
  const { cart } = useStore();
  const { orderable: products } = useCatalog();
  const lines: CartLine[] = [];
  const unavailable: CatalogProduct[] = [];
  for (const item of cart) {
    const product = products.find((p) => p.slug === item.slug);
    if (!product) continue;
    if (product.hidden || product.stock <= 0) {
      unavailable.push(product);
      continue;
    }
    const quantity = Math.min(item.quantity, product.stock);
    lines.push({ product, quantity, lineXaf: product.priceXaf * quantity, capped: quantity < item.quantity });
  }
  const subtotalXaf = lines.reduce((sum, l) => sum + l.lineXaf, 0);
  return { lines, unavailable, subtotalXaf };
}

const pulse = "animate-pulse bg-border/50 motion-reduce:animate-none";

/**
 * Placeholder in the shape of the real order: two lines at a real line's
 * height (image, text, stepper) and the totals card, so nothing below jumps
 * when the saved order arrives.
 */
export function CartSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading your order"
      className="grid grid-cols-[minmax(0,1fr)] gap-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start lg:gap-12"
    >
      <div className="divide-y divide-border border-y border-border">
        {[0, 1].map((i) => (
          <div key={i} className="flex gap-4 py-5">
            <div className={`h-18 w-18 shrink-0 rounded-lg ${pulse}`} />
            <div className={`h-31 flex-1 rounded-lg ${pulse}`} />
          </div>
        ))}
      </div>
      <div className={`h-68 rounded-2xl ${pulse}`} />
    </div>
  );
}

export function EmptyCart() {
  return (
    <div className="max-w-xl border-y border-border py-10">
      <svg aria-hidden="true" viewBox="0 0 48 48" className="h-12 w-12 text-accent">
        <path d="M10 17h28l-2.4 22.5a3 3 0 0 1-3 2.5H15.4a3 3 0 0 1-3-2.5z" fill="currentColor" opacity="0.14" />
        <path
          d="M10 17h28l-2.4 22.5a3 3 0 0 1-3 2.5H15.4a3 3 0 0 1-3-2.5zM18 17v-3a6 6 0 0 1 12 0v3"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinejoin="round"
        />
      </svg>
      <h2 className="type-h2 mt-4 text-brand">Your order is empty</h2>
      <p className="mt-3 max-w-[50ch] text-foreground">Pick a coffee from this harvest, then send the order on WhatsApp.</p>
      <Link href="/shop" className="btn btn-primary btn-lg mt-6">
        Shop the harvest
      </Link>
    </div>
  );
}

const UNDO_MS = 6000;
/** Matches --dur-exit, the .toast-out duration in globals.css. */
const UNDO_EXIT_MS = 160;

interface Removed {
  slug: string;
  name: string;
  quantity: number;
  id: number;
  leaving?: boolean;
  /** Replaced a removal that was still showing, so only the text swaps. */
  swapped?: boolean;
}

/** "Removed … Undo" bar, so a mistaken tap on Remove is easy to take back. */
function UndoToast({ removed, onUndo }: { removed: Removed | null; onUndo: () => void }) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex justify-center px-4" role="status" aria-live="polite">
      {removed && (
        <div
          className={`on-dark toast-in pointer-events-auto flex max-w-md min-w-0 items-center gap-3 rounded-lg bg-brand py-1.5 pr-1.5 pl-4 text-sm text-brand-contrast shadow-[var(--shadow-float)] ${
            removed.leaving ? "toast-out" : ""
          }`}
        >
          <p
            key={removed.id}
            className={`line-clamp-2 min-w-0 [overflow-wrap:anywhere] ${removed.swapped ? "anim-swap" : ""}`}
          >
            Removed <span className="font-semibold">{removed.name}</span>
          </p>
          <button
            type="button"
            onClick={onUndo}
            className="press inline-flex min-h-11 shrink-0 items-center rounded-lg px-3 font-semibold text-sand underline underline-offset-[3px] hover:bg-white/10"
          >
            Undo
          </button>
        </div>
      )}
    </div>
  );
}

/** Shown when the browser refuses to save the order (private mode, blocked or full storage). */
function NotSavedNote() {
  return (
    <p role="status" className="mb-6 flex max-w-2xl items-start gap-2 rounded-lg bg-danger-soft px-4 py-3 text-sm font-medium text-danger">
      <AlertMark className="mt-0.5 h-4 w-4" />
      <span>Your browser is not saving your order. Send it before you leave this page.</span>
    </p>
  );
}

export function CartView() {
  const { cart, setQuantity, removeFromCart, addToCart, loaded, persisted } = useStore();
  const { lines, unavailable, subtotalXaf } = useCartLines();
  const [removed, setRemoved] = useState<Removed | null>(null);
  const removals = useRef(0);
  /** The line Undo just put back, so it rises in where it returned instead of appearing without a cue. */
  const [restored, setRestored] = useState<string | null>(null);

  useEffect(() => {
    if (!removed) return;
    const t = window.setTimeout(
      () => setRemoved((r) => (r && r.id === removed.id ? (r.leaving ? null : { ...r, leaving: true }) : r)),
      removed.leaving ? UNDO_EXIT_MS : UNDO_MS,
    );
    return () => window.clearTimeout(t);
  }, [removed]);

  function remove(product: CatalogProduct) {
    const quantity = cart.find((i) => i.slug === product.slug)?.quantity ?? 1;
    removeFromCart(product.slug);
    setRemoved((r) => ({
      slug: product.slug,
      name: product.name,
      quantity,
      id: ++removals.current,
      swapped: r !== null && !r.leaving,
    }));
  }

  function undo() {
    if (!removed) return;
    addToCart(removed.slug, removed.quantity);
    setRestored(removed.slug);
    setRemoved(null);
  }

  const undoToast = <UndoToast removed={removed} onUndo={undo} />;
  const notSaved = persisted === false ? <NotSavedNote /> : null;

  if (!loaded) return <CartSkeleton />;
  if (lines.length === 0 && unavailable.length === 0)
    return (
      <>
        {notSaved}
        <EmptyCart />
        {undoToast}
      </>
    );

  return (
    <>
      {notSaved}
      <div className="grid grid-cols-[minmax(0,1fr)] gap-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start lg:gap-12">
        <section aria-labelledby="cart-items-heading" className="min-w-0">
          <h2 id="cart-items-heading" className="sr-only">
            Coffee in your order
          </h2>
          {lines.length > 0 && (
            <ul className="divide-y divide-border border-y border-border">
              {lines.map(({ product, quantity, lineXaf, capped }) => (
                <li key={product.slug} className={`flex gap-4 py-5 ${product.slug === restored ? "anim-enter" : ""}`}>
                  <Link href={productHref(product)} className="shrink-0" tabIndex={-1} aria-hidden="true">
                    <Image
                      src={product.image}
                      alt=""
                      width={144}
                      height={144}
                      unoptimized={isUploadedImage(product.image)}
                      className="h-18 w-18 rounded-lg bg-accent-soft object-cover"
                    />
                  </Link>
                  <div className="min-w-0 flex-1">
                    <h3 className="type-title text-brand [overflow-wrap:anywhere]">
                      <Link href={productHref(product)} className="relative rounded-sm hover:underline after:absolute after:inset-x-0 after:-inset-y-[11px]">
                        {product.name}
                      </Link>
                    </h3>
                    <p className="mt-1 text-sm text-muted">{productMeta(product)}</p>
                    <p className="text-sm text-muted">
                      <Price xaf={product.priceXaf} /> each
                    </p>
                    {capped && (
                      <p className="mt-1 text-sm font-medium text-cherry">
                        Only <span className="tabular-nums">{product.stock.toLocaleString("en-GB")}</span> left, so we reduced the quantity.
                      </p>
                    )}
                    <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
                      <QuantityStepper
                        label={`Quantity of ${product.name}`}
                        value={quantity}
                        min={1}
                        max={Math.max(1, product.stock)}
                        onChange={(q) => setQuantity(product.slug, Math.min(q, product.stock))}
                      />
                      <button
                        type="button"
                        onClick={() => remove(product)}
                        className="press inline-flex min-h-11 items-center rounded-lg px-2 text-sm font-medium text-danger underline underline-offset-[3px] hover:decoration-2"
                      >
                        Remove<span className="sr-only"> {product.name}</span>
                      </button>
                      <Price xaf={lineXaf} className="type-data ml-auto text-right text-lg text-brand" />
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
          {unavailable.length > 0 && (
            <div className={lines.length > 0 ? "mt-6" : ""}>
              <h3 className="type-label text-brand">No longer available</h3>
              <p className="mt-1 text-sm text-muted">These are left out of your order.</p>
              <ul className="mt-2 divide-y divide-border border-y border-border">
                {unavailable.map((p) => (
                  <li key={p.slug} className="flex items-center justify-between gap-3 py-1 text-sm">
                    <span className="min-w-0 text-muted [overflow-wrap:anywhere]">
                      {p.name}: {p.hidden ? "not on sale" : "sold out"}
                    </span>
                    <button
                      type="button"
                      onClick={() => remove(p)}
                      className="press inline-flex min-h-11 shrink-0 items-center rounded-lg px-2 font-medium text-danger underline underline-offset-[3px] hover:decoration-2"
                    >
                      Remove<span className="sr-only"> {p.name}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <Link
            href="/shop"
            className="mt-3 -ml-1 inline-flex min-h-11 items-center gap-1 rounded-lg px-1 text-sm font-semibold text-accent underline underline-offset-[3px] hover:decoration-2"
          >
            <ChevronLeft />
            Continue shopping
          </Link>
        </section>

        {/* The one card on the page: the totals, in the same words /order uses. */}
        <aside aria-labelledby="cart-total-heading" className="min-w-0 rounded-2xl border border-border bg-surface p-5 lg:sticky lg:top-6">
          <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
            <h2 id="cart-total-heading" className="type-label text-brand">
              Coffee total
            </h2>
            <Price xaf={subtotalXaf} className="type-data ml-auto text-right text-2xl text-brand" />
          </div>
          <dl className="mt-3 border-t border-border pt-3 text-sm">
            <div className="flex flex-wrap justify-between gap-x-3">
              <dt className="text-muted">Delivery (estimate)</dt>
              <dd className="ml-auto text-right">
                From <Price xaf={SHIPPING_XAF.local} />
              </dd>
            </div>
          </dl>
          <p className="mt-1 text-sm text-muted">The fee for your town is shown on the next step and confirmed on WhatsApp.</p>
          {lines.length > 0 ? (
            <Link href="/order" className="btn btn-primary btn-lg mt-5 w-full">
              Continue to send order
            </Link>
          ) : (
            <p className="mt-5 rounded-lg bg-background px-4 pt-3 pb-1 text-sm text-muted">
              Nothing in your order can be ordered right now.{" "}
              <Link href="/shop" className="inline-flex min-h-11 items-center font-semibold text-accent underline underline-offset-[3px]">
                Shop the harvest
              </Link>
            </p>
          )}
          <p className="mt-3 text-sm text-muted">Order on WhatsApp or by phone. Pay by MTN MoMo or Orange Money.</p>
        </aside>
      </div>
      {/* Fixed, so it takes no grid cell. */}
      {undoToast}
    </>
  );
}
