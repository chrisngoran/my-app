import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { OrderTimeline } from "@/components/order-timeline";
import { hasDatabase, orderByRef } from "@/lib/db";

export const metadata: Metadata = {
  title: "Track my order",
  description: "Follow your Green Venture coffee order with the reference from your WhatsApp message.",
};

const REF = /^GV-[A-HJ-NP-Z2-9]{5}$/;

export default function TrackPage({ searchParams }: { searchParams: Promise<{ ref?: string }> }) {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8">
      <h1 className="type-h2 text-brand">Track my order</h1>
      <p className="mt-2 text-muted">Type the reference from your WhatsApp order message. It looks like GV-7K3PQ.</p>
      <Suspense fallback={<TrackForm value="" />}>
        <TrackResult searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

function TrackForm({ value }: { value: string }) {
  return (
    <form action="/track" className="mt-5 flex flex-wrap gap-2">
      <label className="min-w-0 flex-1 basis-48">
        <span className="sr-only">Order reference</span>
        <input
          name="ref"
          defaultValue={value}
          placeholder="GV-7K3PQ"
          autoCapitalize="characters"
          autoComplete="off"
          spellCheck={false}
          className="block min-h-12 w-full rounded-lg border border-field-border bg-surface px-3 text-base uppercase tracking-wide text-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent"
        />
      </label>
      <button type="submit" className="btn btn-primary btn-lg">
        Track
      </button>
    </form>
  );
}

async function TrackResult({ searchParams }: { searchParams: Promise<{ ref?: string }> }) {
  const raw = (await searchParams).ref ?? "";
  // Looked up on each visit, never prepared ahead: an order's status changes.
  if (raw) await connection();
  // Forgiving about spaces, lower case and a missing "GV-".
  const cleaned = raw.toUpperCase().replace(/\s+/g, "");
  const ref = cleaned && !cleaned.startsWith("GV-") ? `GV-${cleaned.replace(/^GV/, "")}` : cleaned;
  let content = null;
  if (ref) {
    if (!REF.test(ref)) {
      content = <p className="mt-4 text-sm font-medium text-danger">That does not look like an order reference. Check the letters after GV-.</p>;
    } else if (!hasDatabase()) {
      content = <p className="mt-4 text-sm text-muted">Order tracking starts once the shop is connected to its database.</p>;
    } else {
      let order = null;
      try {
        order = await orderByRef(ref);
      } catch (e) {
        console.error("Could not look up order", e);
        content = <p className="mt-4 text-sm text-muted">The order list could not be reached just now. Try again in a minute.</p>;
      }
      if (order) content = <div className="mt-6"><OrderTimeline order={order} /></div>;
      else if (!content)
        content = (
          <p className="mt-4 text-sm text-muted">
            No order {ref} yet. If you sent it a moment ago, wait a minute. Still nothing? Message us on WhatsApp.
          </p>
        );
    }
  }
  return (
    <>
      <TrackForm value={ref} />
      {content}
      <p className="mt-8 text-sm text-muted">
        Sign in to see all your orders in one place:{" "}
        <Link href="/account" className="font-semibold text-accent underline underline-offset-[3px]">
          My account
        </Link>
      </p>
    </>
  );
}
