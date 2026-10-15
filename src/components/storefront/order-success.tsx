"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Price } from "@/components/price";

const METHOD_LABELS: Record<string, string> = {
  mtn: "MTN Mobile Money",
  orange: "Orange Money",
  card: "Card",
};

export function OrderSuccess() {
  const params = useSearchParams();
  const order = params.get("order");
  const method = METHOD_LABELS[params.get("pay") ?? ""];
  const total = Number(params.get("total"));
  const name = params.get("name");

  return (
    <div className="mx-auto max-w-xl rounded-2xl border border-border bg-surface p-6 text-center shadow-sm sm:p-10">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-accent-soft text-accent">
        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-9 w-9" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="m5 12.5 4.5 4.5L19 7.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <h1 className="mt-5 font-serif text-3xl font-bold text-brand">
        Thank you{name ? `, ${name}` : ""}!
      </h1>
      <p className="mt-2 text-muted">Your payment was received and your order is confirmed.</p>

      <dl className="mx-auto mt-6 grid max-w-sm gap-3 rounded-xl bg-background p-4 text-left text-sm">
        <div className="flex justify-between gap-3">
          <dt className="text-muted">Order number</dt>
          <dd className="font-mono font-bold text-brand">{order ?? "GV-ORD-DEMO"}</dd>
        </div>
        {method && (
          <div className="flex justify-between gap-3">
            <dt className="text-muted">Paid with</dt>
            <dd className="font-medium">{method}</dd>
          </div>
        )}
        {Number.isFinite(total) && total > 0 && (
          <div className="flex justify-between gap-3">
            <dt className="text-muted">Total paid</dt>
            <dd>
              <Price xaf={total} className="font-semibold" />
            </dd>
          </div>
        )}
      </dl>

      <p className="mt-6 text-sm text-foreground">
        A confirmation with your order number would be sent to you by <strong>SMS</strong> and <strong>email</strong>, followed by
        an SMS when your coffee is out for delivery.
      </p>
      <p className="mt-2 text-xs text-muted">This is a demo: no real payment was taken and no messages are sent.</p>

      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <Link href="/shop" className="inline-flex min-h-11 items-center justify-center rounded-lg bg-brand px-6 py-2.5 font-semibold text-brand-contrast hover:bg-brand/90">
          Continue shopping
        </Link>
        <Link
          href="/trace"
          className="inline-flex min-h-11 items-center justify-center rounded-lg border border-border px-6 py-2.5 font-semibold text-brand hover:border-brand"
        >
          Trace your coffee
        </Link>
      </div>
    </div>
  );
}

export function OrderSuccessFallback() {
  return <div className="mx-auto h-96 max-w-xl animate-pulse rounded-2xl bg-border/50" aria-busy="true" aria-label="Loading order confirmation" />;
}
