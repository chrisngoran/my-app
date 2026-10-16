"use client";

/*
 * Small client pieces that let server-rendered pages show admin edits to lots
 * and farmers from this browser. Each one renders the original data.ts value
 * on the server and during hydration, then the edited value once the saved
 * edits are loaded. Product islands live in ./live-product.
 */

import { useFarmerView, useLotView } from "@/lib/catalog-overrides";

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

export function LiveFarmerStory({ id, fallback }: { id: string; fallback: string }) {
  return <>{useFarmerView(id)?.story ?? fallback}</>;
}
