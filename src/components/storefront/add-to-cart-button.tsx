"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/components/store-provider";

export function AddToCartButton({
  slug,
  name,
  quantity = 1,
  disabled = false,
  className = "",
  disabledLabel = "Sold out",
  onAdded,
}: {
  slug: string;
  name: string;
  quantity?: number;
  disabled?: boolean;
  className?: string;
  /** What the button says while disabled (default "Sold out"). */
  disabledLabel?: string;
  /** Called after the item is added, e.g. to show a link to the order list. */
  onAdded?: () => void;
}) {
  const { addToCart } = useStore();
  const [added, setAdded] = useState(false);
  // Whether the label has swapped at least once: the first render never animates.
  const [swapped, setSwapped] = useState(false);

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
          setSwapped(true);
          onAdded?.();
        }}
        className={`btn px-4 text-sm ${added ? "bg-accent text-brand-contrast" : "btn-primary"} ${className}`}
      >
        {/* Keyed so the label crossfades in each time it changes. */}
        <span key={added ? "added" : "add"} className={`inline-flex items-center gap-2 ${swapped ? "anim-swap" : ""}`}>
          {added ? (
            <>
              <svg aria-hidden="true" viewBox="0 0 20 20" className="h-4 w-4" fill="currentColor">
                <path d="M7.7 14.3 3.4 10l1.4-1.4 2.9 2.9 7.5-7.5 1.4 1.4z" />
              </svg>
              Added
            </>
          ) : disabled ? (
            disabledLabel
          ) : (
            "Add to order"
          )}
        </span>
      </button>
      <span role="status" aria-live="polite" className="sr-only">
        {added ? `${quantity} × ${name} added to your order` : ""}
      </span>
    </>
  );
}
