"use client";

import { formatPrice } from "@/lib/currency";
import { useStore } from "./store-provider";

/**
 * Shows an FCFA amount in the visitor's chosen display currency, with tabular
 * numerals. Never breaks inside the amount ("9 500" / "FCFA" on two lines).
 */
export function Price({ xaf, className = "" }: { xaf: number; className?: string }) {
  const { currency } = useStore();
  return <span className={`whitespace-nowrap tabular-nums ${className}`}>{formatPrice(xaf, currency)}</span>;
}
