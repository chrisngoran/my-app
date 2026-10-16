"use client";

import { useState } from "react";
import { Price } from "@/components/price";
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
        <AddToCartButton slug={slug} name={name} quantity={quantity} disabled={soldOut} className="flex-1 sm:flex-none sm:px-8" />
      </div>
      {soldOut ? (
        <p className="mt-3 flex min-h-11 w-full items-center justify-center rounded-lg bg-background px-6 py-2.5 text-center font-semibold text-muted">
          Sold out — ask us on WhatsApp about the next harvest
        </p>
      ) : (
      <a
        href={whatsappLink(
          `Hello ${cooperative.shortName}, I would like to order ${quantity} × ${name} (${formatPrice(priceXaf * quantity)}).`,
        )}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 flex min-h-11 w-full items-center justify-center rounded-lg bg-[#1f8a4c] px-6 py-2.5 font-semibold text-white hover:bg-[#19733f]"
      >
        Order this on WhatsApp
      </a>
      )}
      <p className="mt-3 text-xs text-muted">
        Prices are in FCFA; other currencies are shown for reference. Pay by MTN MoMo or Orange Money once we confirm your order.
      </p>
    </div>
  );
}
