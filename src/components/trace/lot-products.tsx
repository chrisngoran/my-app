"use client";

import Link from "next/link";
import { Price } from "@/components/price";
import { useCatalog } from "@/lib/catalog-overrides";
import { arrowNudge, linkedCard } from "./buttons";
import { ArrowRightIcon, BeanIcon } from "./icons";

/** Products made from a lot, with admin edits applied and hidden products left out. */
export function LotProducts({ slugs }: { slugs: string[] }) {
  const { visibleProducts } = useCatalog();
  const products = visibleProducts.filter((p) => slugs.includes(p.slug));

  if (products.length === 0) {
    return (
      <p className="mt-3 text-muted">
        This lot is reserved for export buyers. <Link href="/shop" className="font-semibold text-accent underline underline-offset-[3px]">Browse the shop</Link>{" "}
        for coffee available now.
      </p>
    );
  }

  return (
    <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((p) => (
        <li key={p.slug}>
          <Link
            href={`/shop/${p.slug}`}
            className={`${linkedCard} flex h-full flex-col rounded-2xl border border-border bg-surface p-5`}
          >
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand text-brand-contrast">
                <BeanIcon />
              </span>
              <div className="min-w-0">
                <h3 className="font-semibold text-foreground transition-colors duration-150 group-hover:text-brand">{p.name}</h3>
                <p className="text-sm text-muted">
                  {p.weightGrams >= 1000 ? `${p.weightGrams / 1000} kg` : `${p.weightGrams} g`}
                  {p.roast ? ` · ${p.roast} roast` : ""}
                </p>
              </div>
            </div>
            <ul className="mt-3 flex flex-wrap gap-1.5" aria-label="Tasting notes">
              {p.cuppingNotes.map((n) => (
                <li key={n} className="rounded-full bg-accent-soft px-2.5 py-0.5 text-xs font-medium text-accent">
                  {n}
                </li>
              ))}
            </ul>
            <div className="mt-auto flex items-center justify-between pt-4">
              <Price xaf={p.priceXaf} className="text-lg font-bold text-brand tabular-nums" />
              <span className="inline-flex items-center gap-1 text-sm font-semibold text-accent">
                {p.stock <= 0 ? "Sold out" : "Buy"} <ArrowRightIcon className={arrowNudge} />
              </span>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
