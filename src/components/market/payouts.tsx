"use client";

import { useRouter } from "next/navigation";
import { useActionState, useState, useTransition } from "react";
import { recordPayout, undoPayout } from "@/lib/market-actions";
import { field, label } from "./listing-form";

const METHODS = ["MTN MoMo", "Orange Money", "Cash", "Bank transfer"];

/** "Record a payment" for one farmer; the amount starts at what is still owed. */
export function PayoutForm({ farmerId, owedXaf }: { farmerId: number; owedXaf: number }) {
  const [open, setOpen] = useState(false);
  // A saved payment closes the form and leaves its confirmation in view; an error keeps it open.
  const [state, action, pending] = useActionState(async (prev: Parameters<typeof recordPayout>[0], f: FormData) => {
    const result = await recordPayout(prev, f);
    if (result?.ok) setOpen(false);
    return result;
  }, null);
  if (!open) {
    return (
      <div className="mt-3">
        {state?.ok && (
          <p role="status" className="mb-2 text-sm font-medium text-accent">
            {state.ok}
          </p>
        )}
        <button type="button" onClick={() => setOpen(true)} className="btn btn-primary">
          Record a payment
        </button>
      </div>
    );
  }
  return (
    <form action={action} className="mt-3 space-y-3 rounded-xl border border-border bg-background p-4">
      <input type="hidden" name="farmerId" value={farmerId} />
      <div className="grid gap-3 sm:grid-cols-[repeat(2,minmax(0,1fr))]">
        <label className={label}>
          Amount paid (FCFA)
          <input name="amount" inputMode="numeric" required defaultValue={owedXaf > 0 ? owedXaf : ""} className={`${field} tabular-nums`} />
        </label>
        <label className={label}>
          Paid by
          <select name="method" required defaultValue="MTN MoMo" className={field}>
            {METHODS.map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>
        </label>
      </div>
      <label className={label}>
        Transaction reference <span className="font-normal text-muted">(optional, e.g. the MoMo ID)</span>
        <input name="reference" maxLength={80} className={field} />
      </label>
      <label className={label}>
        Note <span className="font-normal text-muted">(optional)</span>
        <input name="note" maxLength={300} placeholder="e.g. October harvest sales" className={field} />
      </label>
      {state?.error && (
        <p role="alert" className="text-sm font-medium text-danger">
          {state.error}
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        <button type="submit" disabled={pending} className="btn btn-primary">
          {pending ? "Saving…" : "Mark as paid"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="btn btn-secondary">
          Cancel
        </button>
      </div>
    </form>
  );
}

/** Takes back a payment recorded by mistake, after asking. */
export function UndoPayout({ id }: { id: number }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [asking, setAsking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  if (!asking) {
    return (
      <button type="button" onClick={() => setAsking(true)} className="min-h-11 text-sm font-semibold text-muted underline underline-offset-[3px]">
        Undo
      </button>
    );
  }
  return (
    <span className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-danger">Remove this payment?</span>
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          start(async () => {
            const r = await undoPayout(id);
            setError(r.error ?? null);
            setAsking(false);
            router.refresh();
          })
        }
        className="min-h-11 rounded-lg bg-danger px-3 text-sm font-semibold text-white"
      >
        Yes, remove
      </button>
      <button type="button" onClick={() => setAsking(false)} className="min-h-11 px-2 text-sm font-semibold">
        Keep
      </button>
      {error && <span className="text-sm text-danger">{error}</span>}
    </span>
  );
}
