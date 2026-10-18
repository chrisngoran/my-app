"use client";

import { useCallback, useEffect, useState } from "react";
import { ReviewForm } from "./review-form";
import { Stars } from "./stars";

interface ReviewsData {
  enabled: boolean;
  accounts?: boolean;
  signedIn?: boolean;
  canReview?: boolean;
  mine?: { rating: number; body: string } | null;
  reviews?: { id: number; rating: number; body: string; by: string; date: string }[];
}

/**
 * Ratings and reviews on a coffee's page, and the form for customers who
 * bought it. Loaded in the browser, so the page itself stays prebuilt and fast.
 */
export function ProductReviews({ slug }: { slug: string }) {
  const [data, setData] = useState<ReviewsData | null>(null);
  const load = useCallback(
    () =>
      fetch(`/api/reviews?slug=${encodeURIComponent(slug)}`, { cache: "no-store" })
        .then((r) => r.json() as Promise<ReviewsData>)
        .then(setData)
        .catch(() => setData({ enabled: false })),
    [slug],
  );
  useEffect(() => {
    void load();
  }, [load]);

  if (!data?.enabled) return null;
  const reviews = data.reviews ?? [];
  const average = reviews.length ? reviews.reduce((n, r) => n + r.rating, 0) / reviews.length : 0;

  return (
    <section aria-labelledby="reviews-heading" className="anim-enter mt-10">
      <h2 id="reviews-heading" className="type-title text-brand">
        Reviews
      </h2>
      {reviews.length > 0 ? (
        <p className="mt-2 flex items-center gap-2 text-foreground">
          <Stars value={average} className="h-5 w-5" />
          <span className="font-semibold">{average.toFixed(1)}</span>
          <span className="text-muted">
            from {reviews.length} review{reviews.length > 1 ? "s" : ""}
          </span>
        </p>
      ) : (
        <p className="mt-2 text-muted">No reviews yet.</p>
      )}

      {data.canReview ? (
        <ReviewForm slug={slug} initial={data.mine ?? null} onSaved={load} />
      ) : data.signedIn ? (
        <p className="mt-3 text-sm text-muted">You can review this coffee once an order of it has been confirmed.</p>
      ) : data.accounts ? (
        <p className="mt-3 text-sm text-muted">
          Bought this coffee?{" "}
          <a href="/api/auth/google?as=customer&next=%2Faccount" className="font-semibold text-accent underline underline-offset-[3px]">
            Sign in
          </a>{" "}
          to review it.
        </p>
      ) : null}

      {reviews.length > 0 && (
        <ul className="mt-5 divide-y divide-border border-y border-border">
          {reviews.map((r) => (
            <li key={r.id} className="py-4">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <Stars value={r.rating} />
                <span className="font-semibold text-foreground">{r.by}</span>
                <span className="rounded-full bg-accent-soft px-2 py-0.5 text-xs font-semibold text-accent">Verified buyer</span>
                <span className="text-sm text-muted">{r.date}</span>
              </div>
              {r.body && <p className="mt-2 max-w-[60ch] whitespace-pre-line text-foreground [overflow-wrap:anywhere]">{r.body}</p>}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
