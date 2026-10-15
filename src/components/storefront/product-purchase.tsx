"use client";

import { useState } from "react";
import { Price } from "@/components/price";
import { AddToCartButton } from "./add-to-cart-button";
import { QuantityStepper } from "./quantity-stepper";

export function ProductPurchase({
  slug,
  name,
  priceXaf,
  stock,
}: {
  slug: string;
  name: string;
  priceXaf: number;
  stock: number;
}) {
  const max = Math.max(1, Math.min(stock, 20));
  const [quantity, setQuantity] = useState(1);
  const soldOut = stock <= 0;

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
      <p className="mt-3 text-xs text-muted">Prices are charged in FCFA. Other currencies are shown for reference.</p>
    </div>
  );
}
