"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/components/store-provider";

export function AddToCartButton({
  slug,
  name,
  quantity = 1,
  disabled = false,
  className = "",
}: {
  slug: string;
  name: string;
  quantity?: number;
  disabled?: boolean;
  className?: string;
}) {
  const { addToCart } = useStore();
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (!added) return;
    const t = window.setTimeout(() => setAdded(false), 1800);
    return () => window.clearTimeout(t);
  }, [added]);

  return (
    <>
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          addToCart(slug, quantity);
          setAdded(true);
        }}
        className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-50 ${
          added ? "bg-accent text-brand-contrast" : "bg-brand text-brand-contrast hover:bg-brand/90"
        } ${className}`}
      >
        {added ? (
          <>
            <svg aria-hidden="true" viewBox="0 0 20 20" className="h-4 w-4" fill="currentColor">
              <path d="M7.7 14.3 3.4 10l1.4-1.4 2.9 2.9 7.5-7.5 1.4 1.4z" />
            </svg>
            Added
          </>
        ) : disabled ? (
          "Sold out"
        ) : (
          "Add to cart"
        )}
      </button>
      <span role="status" aria-live="polite" className="sr-only">
        {added ? `${quantity} × ${name} added to your cart` : ""}
      </span>
    </>
  );
}
