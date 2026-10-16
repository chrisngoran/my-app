"use client";

import { formatPrice } from "@/lib/currency";
import { useStore } from "./store-provider";

/** Shows an FCFA amount in the visitor's chosen display currency, with tabular numerals. */
export function Price({ xaf, className = "" }: { xaf: number; className?: string }) {
  const { currency } = useStore();
  return <span className={`tabular-nums ${className}`}>{formatPrice(xaf, currency)}</span>;
}
