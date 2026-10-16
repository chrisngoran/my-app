"use client";

import Image from "next/image";
import Link from "next/link";
import { Price } from "@/components/price";
import { useStore } from "@/components/store-provider";
import { getProduct } from "@/lib/data";
import { formatWeight } from "./catalog";
import { QuantityStepper } from "./quantity-stepper";

export function useCartLines() {
  const { cart } = useStore();
  const lines = cart.flatMap((item) => {
    const product = getProduct(item.slug);
    return product ? [{ product, quantity: item.quantity, lineXaf: product.priceXaf * item.quantity }] : [];
  });
  const subtotalXaf = lines.reduce((sum, l) => sum + l.lineXaf, 0);
  return { lines, subtotalXaf };
}

export function CartSkeleton() {
  return (
    <div className="space-y-3" aria-busy="true" aria-label="Loading your cart">
      {[0, 1].map((i) => (
        <div key={i} className="h-28 animate-pulse rounded-2xl bg-border/50" />
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
      <h2 className="mt-4 font-serif text-2xl font-bold text-brand">Your cart is empty</h2>
      <p className="mx-auto mt-2 max-w-sm text-muted">Fresh Arabica from the Bui highlands is waiting. Every bag is traceable to the farm it came from.</p>
      <Link
        href="/shop"
        className="mt-6 inline-flex min-h-11 items-center rounded-lg bg-brand px-6 py-2.5 font-semibold text-brand-contrast hover:bg-brand/90"
      >
        Browse the shop
      </Link>
    </div>
  );
}

export function CartView() {
  const { setQuantity, removeFromCart, loaded } = useStore();
  const { lines, subtotalXaf } = useCartLines();

  if (!loaded) return <CartSkeleton />;
  if (lines.length === 0) return <EmptyCart />;

  const itemCount = lines.reduce((n, l) => n + l.quantity, 0);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px] lg:items-start">
      <section aria-labelledby="cart-items-heading">
        <h2 id="cart-items-heading" className="sr-only">
          Items in your cart
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
                      <Link href={`/shop/${product.slug}`} className="hover:underline">
                        {product.name}
                      </Link>
                    </h3>
                    <p className="text-sm text-muted">
                      {formatWeight(product.weightGrams)} · <Price xaf={product.priceXaf} /> each
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
                    onClick={() => removeFromCart(product.slug)}
                    className="min-h-11 rounded-lg px-3 text-sm font-medium text-muted underline-offset-2 hover:text-red-700 hover:underline"
                  >
                    Remove<span className="sr-only"> {product.name}</span>
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
        <Link href="/shop" className="mt-4 inline-block text-sm font-medium text-accent hover:underline">
          ← Continue shopping
        </Link>
      </section>

      <aside aria-labelledby="cart-summary-heading" className="rounded-2xl border border-border bg-surface p-5 lg:sticky lg:top-6">
        <h2 id="cart-summary-heading" className="font-serif text-xl font-bold text-brand">
          Order summary
        </h2>
        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted">
              Subtotal ({itemCount} {itemCount === 1 ? "item" : "items"})
            </dt>
            <dd>
              <Price xaf={subtotalXaf} className="font-semibold" />
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted">Delivery</dt>
            <dd className="text-muted">Confirmed with your order</dd>
          </div>
        </dl>
        <div className="mt-4 flex items-baseline justify-between border-t border-border pt-4">
          <span className="font-semibold">Subtotal</span>
          <Price xaf={subtotalXaf} className="text-2xl font-bold text-brand" />
        </div>
        <Link
          href="/order"
          className="mt-5 flex min-h-12 w-full items-center justify-center rounded-lg bg-accent px-6 py-3 font-semibold text-brand-contrast hover:bg-accent/90"
        >
          Continue to send order
        </Link>
        <p className="mt-3 text-center text-xs text-muted">Order on WhatsApp or by phone. Pay by MoMo or Orange Money.</p>
      </aside>
    </div>
  );
}
