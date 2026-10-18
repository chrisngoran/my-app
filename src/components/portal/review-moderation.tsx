"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { setHidden } from "@/lib/review-actions";

/** Hide / Show again for one review. */
export function HideToggle({ id, hidden }: { id: number; hidden: boolean }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  return (
    <div>
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          start(async () => {
            const r = await setHidden(id, !hidden);
            setError(r.error ?? null);
            router.refresh();
          })
        }
        className="press inline-flex min-h-11 items-center rounded-lg border border-border bg-surface px-3 text-sm font-semibold text-foreground disabled:opacity-60"
      >
        {hidden ? "Show again" : "Hide from the shop"}
      </button>
      {error && (
        <p role="alert" className="mt-1 text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
