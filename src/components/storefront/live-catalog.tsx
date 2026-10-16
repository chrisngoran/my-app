"use client";

/*
 * Small client pieces that let server-rendered pages show admin edits from
 * this browser. Each one renders the original data.ts value on the server and
 * during hydration, then the edited value once the saved edits are loaded.
 */

import Image from "next/image";
import { Price } from "@/components/price";
import { CuppingScore } from "@/components/trace/cupping-score";
import { useFarmerView, useLotView, useProductView } from "@/lib/catalog-overrides";
import { StockIndicator } from "./stock-indicator";

export function LiveProductName({ slug, fallback }: { slug: string; fallback: string }) {
  return <>{useProductView(slug)?.name ?? fallback}</>;
}

/** The description as its own paragraph; nothing at all when staff have cleared it. */
export function LiveProductDescription({ slug, fallback, className }: { slug: string; fallback: string; className?: string }) {
  const text = useProductView(slug)?.description ?? fallback;
  if (!text.trim()) return null;
  return <p className={className}>{text}</p>;
}

export function LiveProductPrice({ slug, fallbackXaf, className }: { slug: string; fallbackXaf: number; className?: string }) {
  return <Price xaf={useProductView(slug)?.priceXaf ?? fallbackXaf} className={className} />;
}

export function LiveProductStock({ slug, fallback }: { slug: string; fallback: number }) {
  const product = useProductView(slug);
  if (product?.hidden) {
    return (
      <p className="inline-flex items-center gap-2 text-sm font-medium text-muted">
        <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full bg-muted" />
        Not on sale at the moment
      </p>
    );
  }
  return <StockIndicator stock={product?.stock ?? fallback} />;
}

export function LiveProductImage({
  slug,
  fallbackSrc,
  alt,
  className,
  preload,
}: {
  slug: string;
  fallbackSrc: string;
  alt: string;
  className?: string;
  preload?: boolean;
}) {
  const src = useProductView(slug)?.image ?? fallbackSrc;
  return <Image src={src} alt={alt} width={800} height={600} unoptimized preload={preload} className={className} />;
}

export function LiveLotNotes({ code, fallback }: { code: string; fallback: string }) {
  return <>{useLotView(code)?.notes ?? fallback}</>;
}

/** Lot notes as their own paragraph; nothing at all when they are blank (no empty gap). */
export function LiveLotNotesBlock({ code, fallback, className }: { code: string; fallback: string; className?: string }) {
  const text = useLotView(code)?.notes ?? fallback;
  if (!text.trim()) return null;
  return <p className={className}>{text}</p>;
}

export function LiveLotScore({ code, fallback }: { code: string; fallback: number }) {
  return <>{useLotView(code)?.quality.cuppingScore ?? fallback}</>;
}

export function LiveCuppingGauge({ code, fallback }: { code: string; fallback: number }) {
  return <CuppingScore score={useLotView(code)?.quality.cuppingScore ?? fallback} />;
}

export function LiveFarmerStory({ id, fallback }: { id: string; fallback: string }) {
  return <>{useFarmerView(id)?.story ?? fallback}</>;
}
