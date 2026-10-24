"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/components/store-provider";
import { getT } from "@/lib/i18n";

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
  const { addToCart, lang } = useStore();
  const t = getT(lang);
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
        {/*
          Both labels share one grid cell, so the button keeps the width of the
          longer one and the price row never reflows mid-tap. The shown label is
          keyed, so it rises in each time it changes.
        */}
        <span className="grid justify-items-center [&>*]:col-start-1 [&>*]:row-start-1">
          <span
            key={added ? "idle-hidden" : "idle"}
            aria-hidden={added || undefined}
            className={`inline-flex items-center gap-2 ${added ? "invisible" : swapped ? "anim-swap" : ""}`}
          >
            {disabled ? disabledLabel : t.addToOrder}
          </span>
          <span
            key={added ? "added" : "added-hidden"}
            aria-hidden={!added || undefined}
            className={`inline-flex items-center gap-2 ${added ? "anim-swap" : "invisible"}`}
          >
            <svg aria-hidden="true" viewBox="0 0 20 20" className="h-4 w-4" fill="currentColor">
              <path d="M7.7 14.3 3.4 10l1.4-1.4 2.9 2.9 7.5-7.5 1.4 1.4z" />
            </svg>
            {t.added}
          </span>
        </span>
      </button>
      <span role="status" aria-live="polite" className="sr-only">
        {added ? `${quantity} × ${name} added to your order` : ""}
      </span>
    </>
  );
}
