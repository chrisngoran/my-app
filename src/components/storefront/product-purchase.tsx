"use client";

import Link from "next/link";
import { useState } from "react";
import { Price } from "@/components/price";
import { useStore } from "@/components/store-provider";
import { useProductView } from "@/lib/catalog-overrides";
import { formatPrice } from "@/lib/currency";
import { cooperative } from "@/lib/data";
import { whatsappLink } from "@/lib/whatsapp";
import { AddToCartButton } from "./add-to-cart-button";
import { QuantityStepper } from "./quantity-stepper";

/** Price, quantity and ordering. The props are the defaults; admin edits saved in this browser win. */
export function ProductPurchase({
  slug,
  name: defaultName,
  priceXaf: defaultPriceXaf,
  stock: defaultStock,
}: {
  slug: string;
  name: string;
  priceXaf: number;
  stock: number;
}) {
  const live = useProductView(slug);
  const name = live?.name ?? defaultName;
  const priceXaf = live?.priceXaf ?? defaultPriceXaf;
  const stock = live?.stock ?? defaultStock;
  const hidden = live?.hidden ?? false;
  const max = Math.max(1, Math.min(stock, 20));
  const [chosen, setQuantity] = useState(1);
  // Stock can drop while the page is open (e.g. edited in the admin).
  const quantity = Math.min(chosen, max);
  const soldOut = stock <= 0 || hidden;
  const { itemCount } = useStore();
  // Once something is added on this page, keep a route to the order list in view.
  const [addedHere, setAddedHere] = useState(false);

  if (hidden) {
    return (
      <div className="rounded-2xl border border-border bg-surface p-4 sm:p-5">
        <p className="font-semibold text-brand">This coffee is not on sale at the moment.</p>
        <p className="mt-1 text-sm text-muted">Browse the shop for coffee available now, or ask us on WhatsApp when it will be back.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-surface p-4 sm:p-5">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <Price xaf={priceXaf} className="text-3xl font-bold text-brand" />
        {quantity > 1 && (
          <p className="text-sm text-muted">
            {quantity} × = <Price xaf={priceXaf * quantity} className="font-semibold text-foreground" />
          </p>
        )}
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <QuantityStepper
          label="Quantity"
          value={quantity}
          min={1}
          max={max}
          onChange={(q) => setQuantity(Math.min(max, Math.max(1, q)))}
        />
        <AddToCartButton
          slug={slug}
          name={name}
          quantity={quantity}
          disabled={soldOut}
          onAdded={() => setAddedHere(true)}
          className="flex-1 sm:flex-none sm:px-8"
        />
      </div>
      {addedHere && (
        <Link
          href="/cart"
          className="anim-enter mt-2 inline-flex min-h-11 items-center gap-1 font-semibold text-accent hover:underline"
        >
          View my order <span className="tabular-nums">({itemCount})</span>
          <span aria-hidden="true">→</span>
        </Link>
      )}
      {soldOut ? (
        <p className="mt-3 flex min-h-11 w-full items-center justify-center rounded-lg bg-background px-6 py-2.5 text-center font-semibold text-muted text-pretty">
          Sold out — ask us on WhatsApp about the next harvest
        </p>
      ) : (
        <a
          href={whatsappLink(
            `Hello ${cooperative.shortName}, I would like to order ${quantity} × ${name} (${formatPrice(priceXaf * quantity)}).`,
          )}
          target="_blank"
          rel="noopener noreferrer"
          className="btn mt-3 w-full border border-whatsapp/40 bg-surface text-whatsapp hover:border-whatsapp hover:bg-whatsapp/5"
        >
          <WhatsAppGlyph />
          Order this on WhatsApp
        </a>
      )}
      <p className="mt-3 text-xs text-muted">
        Prices are in FCFA; other currencies are shown for reference. Pay by MTN MoMo or Orange Money once we confirm your order.
      </p>
    </div>
  );
}

/** Chat-bubble-with-handset mark for WhatsApp actions. */
function WhatsAppGlyph() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 shrink-0" fill="currentColor">
      <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2c-1.5 0-3-.4-4.3-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Z" />
      <path d="M16.6 14.1c-.3-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.4.1-.7.3-.2.3-.9.9-.9 2.1s.9 2.4 1 2.6c.1.2 1.8 2.8 4.4 3.9 1.6.7 2.3.8 3.1.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.6-.3Z" />
    </svg>
  );
}
