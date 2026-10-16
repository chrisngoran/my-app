"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Price } from "@/components/price";
import { useStore } from "@/components/store-provider";
import { type CatalogProduct, useCatalog } from "@/lib/catalog-overrides";
import { formatWeight } from "./catalog";
import { QuantityStepper } from "./quantity-stepper";

/**
 * Cart lines at the current price (including any admin edits saved in this
 * browser). Products that are sold out or hidden from the website are listed
 * separately in `unavailable` and left out of the total and the order.
 */
export function useCartLines() {
  const { cart } = useStore();
  const { products } = useCatalog();
  const lines: { product: CatalogProduct; quantity: number; lineXaf: number }[] = [];
  const unavailable: CatalogProduct[] = [];
  for (const item of cart) {
    const product = products.find((p) => p.slug === item.slug);
    if (!product) continue;
    if (product.hidden || product.stock <= 0) unavailable.push(product);
    else lines.push({ product, quantity: item.quantity, lineXaf: product.priceXaf * item.quantity });
  }
  const subtotalXaf = lines.reduce((sum, l) => sum + l.lineXaf, 0);
  return { lines, unavailable, subtotalXaf };
}

export function CartSkeleton() {
  return (
    <div className="space-y-3" aria-busy="true" aria-label="Loading your order list">
      {[0, 1].map((i) => (
        <div key={i} className="h-28 animate-pulse rounded-2xl bg-border/50 motion-reduce:animate-none" />
      ))}
    </div>
  );
}

export function EmptyCart() {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-surface px-6 py-14 text-center">
      <svg aria-hidden="true" viewBox="0 0 64 64" className="mx-auto h-16 w-16 text-accent">
        <path d="M14 22h36l-3 30a4 4 0 0 1-4 4H21a4 4 0 0 1-4-4z" fill="currentColor" opacity="0.15" />
        <path d="M14 22h36l-3 30a4 4 0 0 1-4 4H21a4 4 0 0 1-4-4zM24 22v-4a8 8 0 0 1 16 0v4" fill="none" stroke="currentColor" strokeWidth="3" />
      </svg>
      <h2 className="mt-4 font-serif text-2xl font-bold text-brand">Your order list is empty</h2>
      <p className="mx-auto mt-2 max-w-sm text-muted">Fresh Arabica from the Bui highlands is waiting. Every bag is traceable to the farm it came from.</p>
      <Link
        href="/shop"
        className="btn btn-primary mt-6 px-6"
      >
        Browse the shop
      </Link>
    </div>
  );
}

const UNDO_MS = 6000;
const UNDO_EXIT_MS = 160;

interface Removed {
  slug: string;
  name: string;
  quantity: number;
  id: number;
  leaving?: boolean;
}

/** "Removed … Undo" bar, so a mistaken tap on Remove is easy to take back. */
function UndoToast({ removed, onUndo }: { removed: Removed | null; onUndo: () => void }) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex justify-center px-4" role="status" aria-live="polite">
      {removed && (
        <div
          key={removed.id}
          className={`pointer-events-auto flex max-w-md items-center gap-3 rounded-xl bg-brand py-1.5 pr-1.5 pl-4 text-sm text-brand-contrast shadow-lg transition-[opacity,translate] ease-out motion-reduce:transition-opacity ${
            removed.leaving
              ? "translate-y-2 opacity-0 duration-160 motion-reduce:translate-y-0"
              : "duration-240 starting:translate-y-full starting:opacity-0 motion-reduce:duration-150"
          }`}
        >
          <p className="min-w-0">
            Removed <span className="font-semibold">{removed.name}</span>
          </p>
          <button
            type="button"
            onClick={onUndo}
            className="on-dark press inline-flex min-h-11 shrink-0 items-center rounded-lg px-3 font-semibold text-sand underline-offset-[3px] hover:bg-white/10 hover:underline"
          >
            Undo
          </button>
        </div>
      )}
    </div>
  );
}

export function CartView() {
  const { cart, setQuantity, removeFromCart, addToCart, loaded } = useStore();
  const { lines, unavailable, subtotalXaf } = useCartLines();
  const [removed, setRemoved] = useState<Removed | null>(null);
  const removals = useRef(0);

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
    setRemoved({ slug: product.slug, name: product.name, quantity, id: ++removals.current });
  }

  function undo() {
    if (!removed) return;
    addToCart(removed.slug, removed.quantity);
    setRemoved(null);
  }

  const undoToast = <UndoToast removed={removed} onUndo={undo} />;

  if (!loaded) return <CartSkeleton />;
  if (lines.length === 0 && unavailable.length === 0)
    return (
      <>
        <EmptyCart />
        {undoToast}
      </>
    );

  const itemCount = lines.reduce((n, l) => n + l.quantity, 0);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px] lg:items-start">
      <section aria-labelledby="cart-items-heading">
        <h2 id="cart-items-heading" className="sr-only">
          Items in your order list
        </h2>
        <ul className="space-y-3">
          {lines.map(({ product, quantity, lineXaf }) => (
            <li key={product.slug} className="flex gap-3 rounded-2xl border border-border bg-surface p-3 sm:gap-4 sm:p-4">
              <Link href={`/shop/${product.slug}`} className="shrink-0" tabIndex={-1} aria-hidden="true">
                <Image
                  src={product.image}
                  alt=""
                  width={800}
                  height={600}
                  unoptimized
                  className="h-18 w-24 rounded-lg object-cover sm:h-24 sm:w-32"
                />
              </Link>
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="font-serif font-bold leading-snug text-brand">
                      <Link href={`/shop/${product.slug}`} className="rounded-sm hover:underline">
                        {product.name}
                      </Link>
                    </h3>
                    <p className="mt-0.5 text-sm text-muted">{formatWeight(product.weightGrams)}</p>
                    <p className="text-sm text-muted">
                      <Price xaf={product.priceXaf} /> each
                    </p>
                  </div>
                  <Price xaf={lineXaf} className="shrink-0 font-bold" />
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2">
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
                    className="press -mr-1 min-h-11 rounded-lg px-3 text-sm font-medium text-muted hover:text-danger hover:underline"
                  >
                    Remove<span className="sr-only"> {product.name}</span>
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
        {unavailable.length > 0 && (
          <div className="mt-4 rounded-2xl border border-dashed border-border bg-surface p-4">
            <p className="text-sm font-semibold text-brand">No longer available</p>
            <ul className="mt-2 space-y-1">
              {unavailable.map((p) => (
                <li key={p.slug} className="flex flex-wrap items-center justify-between gap-2 text-sm">
                  <span className="text-muted">
                    {p.name} · {p.hidden ? "not on sale" : "sold out"}
                  </span>
                  <button
                    type="button"
                    onClick={() => remove(p)}
                    className="press min-h-11 rounded-lg px-3 font-medium text-muted hover:text-danger hover:underline"
                  >
                    Remove<span className="sr-only"> {p.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
        <Link href="/shop" className="mt-2 -ml-1 inline-flex min-h-11 items-center rounded-lg px-1 text-sm font-medium text-accent hover:underline">
          ← Continue shopping
        </Link>
      </section>

      <aside aria-labelledby="cart-summary-heading" className="rounded-2xl border border-border bg-surface p-5 lg:sticky lg:top-6">
        <h2 id="cart-summary-heading" className="font-serif text-xl font-bold text-brand">
          Order summary
        </h2>
        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between gap-3">
            <dt className="text-muted">Items</dt>
            <dd className="tabular-nums">
              {itemCount} {itemCount === 1 ? "item" : "items"}
            </dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-muted">Delivery</dt>
            <dd className="text-right text-muted">Confirmed with your order</dd>
          </div>
        </dl>
        <div className="mt-4 flex items-baseline justify-between gap-3 border-t border-border pt-4">
          <span className="font-semibold">Subtotal</span>
          <Price xaf={subtotalXaf} className="text-2xl font-bold text-brand" />
        </div>
        {lines.length > 0 ? (
          <Link href="/order" className="btn btn-go btn-lg mt-5 w-full">
            Continue to send order
          </Link>
        ) : (
          <p className="mt-5 rounded-lg bg-background px-4 py-3 text-center text-sm text-muted">Nothing in your order list can be ordered right now.</p>
        )}
        <p className="mt-3 text-center text-xs text-muted">Order on WhatsApp or by phone. Pay by MoMo or Orange Money.</p>
      </aside>
      {/* Fixed, so it takes no grid cell. */}
      {undoToast}
    </div>
  );
}
