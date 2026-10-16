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

export function LiveProductDescription({ slug, fallback }: { slug: string; fallback: string }) {
  return <>{useProductView(slug)?.description ?? fallback}</>;
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

export function LiveLotScore({ code, fallback }: { code: string; fallback: number }) {
  return <>{useLotView(code)?.quality.cuppingScore ?? fallback}</>;
}

export function LiveCuppingGauge({ code, fallback }: { code: string; fallback: number }) {
  return <CuppingScore score={useLotView(code)?.quality.cuppingScore ?? fallback} />;
}

export function LiveFarmerStory({ id, fallback }: { id: string; fallback: string }) {
  return <>{useFarmerView(id)?.story ?? fallback}</>;
}
