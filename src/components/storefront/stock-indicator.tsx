"use client";

import { useStore } from "@/components/store-provider";
import { getT } from "@/lib/i18n";

export function StockIndicator({ stock }: { stock: number }) {
  const { lang } = useStore();
  const t = getT(lang);
  const state =
    stock <= 0
      ? { label: t.soldOut, dot: "bg-danger", text: "text-danger" }
      : stock <= 30
        ? { label: t.onlyXLeft(stock), dot: "bg-warm", text: "text-warm-ink" }
        : { label: t.inStock, dot: "bg-accent", text: "text-accent" };
  return (
    <p className={`inline-flex items-center gap-2 text-sm font-medium ${state.text}`}>
      <span aria-hidden="true" className={`h-2.5 w-2.5 rounded-full ${state.dot}`} />
      {state.label}
    </p>
  );
}
