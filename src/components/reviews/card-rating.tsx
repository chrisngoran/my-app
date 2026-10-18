"use client";

import { useEffect, useState } from "react";
import { Stars } from "./stars";

type Summary = Record<string, { average: number; count: number }>;
/** One request per page, however many cards ask. */
let request: Promise<Summary> | null = null;
const load = (): Promise<Summary> =>
  (request ??= fetch("/api/ratings")
    .then((r) => (r.ok ? (r.json() as Promise<Summary>) : {}))
    .catch(() => ({})));

/** "★★★★☆ 4.3 (12)" under a shop card's name, once there are reviews. Takes no space until then. */
export function CardRating({ slug }: { slug: string }) {
  const [rating, setRating] = useState<{ average: number; count: number } | null>(null);
  useEffect(() => {
    let live = true;
    load().then((s) => live && setRating(s[slug] ?? null));
    return () => {
      live = false;
    };
  }, [slug]);
  if (!rating) return null;
  return (
    <p className="mt-1 flex items-center gap-1.5 text-sm text-muted">
      <Stars value={rating.average} />
      <span className="font-semibold text-foreground">{rating.average.toFixed(1)}</span>
      <span>({rating.count})</span>
    </p>
  );
}
