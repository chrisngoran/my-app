"use client";

import { useActionState, useEffect, useState } from "react";
import { type ReviewState, submitReview } from "@/lib/review-actions";

const LABELS = ["", "Poor", "Fair", "Good", "Very good", "Excellent"];

/** Stars as five radio buttons (keyboard and screen-reader friendly), then an optional comment. */
export function ReviewForm({ slug, initial, onSaved }: { slug: string; initial: { rating: number; body: string } | null; onSaved: () => void }) {
  const [state, action, pending] = useActionState<ReviewState, FormData>(submitReview, null);
  const [rating, setRating] = useState(initial?.rating ?? 0);
  // A saved review shows in the list straight away.
  useEffect(() => {
    if (state?.ok) onSaved();
  }, [state, onSaved]);

  return (
    <form action={action} className="mt-4 rounded-2xl border border-border bg-surface p-5">
      <input type="hidden" name="slug" value={slug} />
      <fieldset>
        <legend className="font-semibold text-foreground">{initial ? "Your review" : "Rate this coffee"}</legend>
        <div className="mt-2 flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <label key={n} className="cursor-pointer rounded-md p-1 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-ring">
              <input type="radio" name="rating" value={n} checked={rating === n} onChange={() => setRating(n)} className="sr-only" required />
              <span className="sr-only">
                {n} star{n > 1 ? "s" : ""}, {LABELS[n]}
              </span>
              <svg aria-hidden="true" viewBox="0 0 20 20" className={`h-9 w-9 ${n <= rating ? "text-[#c98500]" : "text-border"}`} fill="currentColor">
                <path d="M10 1.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L10 14.9l-5.2 2.7 1-5.8L1.5 7.7l5.9-.9z" />
              </svg>
            </label>
          ))}
          <span className="ml-2 text-sm text-muted" aria-hidden="true">
            {LABELS[rating]}
          </span>
        </div>
      </fieldset>
      <label className="mt-4 block text-sm font-semibold text-foreground">
        Comment <span className="font-normal text-muted">(optional)</span>
        <textarea
          name="body"
          defaultValue={initial?.body ?? ""}
          maxLength={1000}
          rows={3}
          placeholder="How did it taste? How did you brew it?"
          className="mt-1.5 block w-full rounded-lg border border-field-border bg-surface px-3 py-2 text-base font-normal text-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent"
        />
      </label>
      {state?.error && (
        <p role="alert" className="mt-2 text-sm font-medium text-danger">
          {state.error}
        </p>
      )}
      {state?.ok && (
        <p role="status" className="mt-2 text-sm font-medium text-accent">
          Thank you. Your review is on the page.
        </p>
      )}
      <button type="submit" disabled={pending || rating === 0} className="btn btn-primary mt-4 w-full">
        {pending ? "Saving…" : initial ? "Update my review" : "Post my review"}
      </button>
    </form>
  );
}
