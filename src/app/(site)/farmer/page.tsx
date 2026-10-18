import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { FarmerListingCard, FarmerSignIn } from "@/components/market/farmer-ui";
import { ListingForm } from "@/components/market/listing-form";
import { formatFcfaText } from "@/lib/currency";
import { hasDatabase } from "@/lib/db";
import { farmerAddListing, farmerSignOut } from "@/lib/farmer-actions";
import { farmerId } from "@/lib/farmer-session";
import { googleClientConfigured } from "@/lib/google-auth";
import { commissionPct, farmerById, listingsForFarmer, salesForFarmer } from "@/lib/market";
import { kumboTime, STATUS_LABEL } from "@/lib/order-status";
import type { OrderStatus } from "@/lib/db";

export const metadata: Metadata = {
  title: "Farmer sign-in",
  robots: { index: false, follow: false },
};

export default function FarmerPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8">
      <Suspense fallback={<div className="h-64 animate-pulse rounded-2xl bg-border/40 motion-reduce:animate-none" />}>
        <Farmer />
      </Suspense>
    </div>
  );
}

async function Farmer() {
  if (!hasDatabase()) {
    return (
      <>
        <h1 className="type-h2 text-brand">For our farmers</h1>
        <p className="mt-2 text-muted">Farmer sign-in starts once the shop is connected to its database.</p>
      </>
    );
  }
  const id = await farmerId();
  const farmer = id ? await farmerById(id).catch(() => null) : null;

  if (!farmer?.active) {
    return (
      <>
        <h1 className="type-h2 text-brand">For our farmers</h1>
        <p className="mt-2 max-w-[60ch] text-muted">
          Member farmers can sell their own coffee here. Sign in with the phone number and PIN the cooperative office gave you.
        </p>
        <FarmerSignIn google={googleClientConfigured()} />
      </>
    );
  }

  const [listings, sales, pct] = await Promise.all([listingsForFarmer(farmer.id), salesForFarmer(farmer.id), commissionPct()]);
  const delivered = sales.filter((s) => s.status === "delivered");
  const coming = sales.filter((s) => s.status !== "delivered");
  const sum = (xs: typeof sales) => xs.reduce((n, s) => n + s.owedXaf, 0);

  return (
    <>
      <h1 className="type-h2 text-brand">Hello, {farmer.name.split(" ")[0]}</h1>
      <p className="mt-1 text-muted">
        Your shop page:{" "}
        <Link href={`/farmers/${farmer.id}`} className="font-semibold text-accent underline underline-offset-[3px]">
          see it as customers do
        </Link>
      </p>

      <section aria-labelledby="money-heading" className="mt-6 grid grid-cols-[repeat(2,minmax(0,1fr))] gap-3">
        <h2 id="money-heading" className="sr-only">
          Money
        </h2>
        <div className="rounded-2xl border border-border bg-surface p-4 shadow-sm">
          <p className="text-sm font-semibold text-muted">Earned (delivered)</p>
          <p className="mt-1 text-2xl font-bold text-foreground tabular-nums">{formatFcfaText(sum(delivered))}</p>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-4 shadow-sm">
          <p className="text-sm font-semibold text-muted">Coming (on the way)</p>
          <p className="mt-1 text-2xl font-bold text-foreground tabular-nums">{formatFcfaText(sum(coming))}</p>
        </div>
        <p className="col-span-2 text-sm text-muted">
          The cooperative pays you for each sale after its share{pct ? ` (${pct}% now)` : ""}. Ask the office about payment dates.
        </p>
      </section>

      <section aria-labelledby="my-coffee-heading" className="mt-10">
        <h2 id="my-coffee-heading" className="type-title text-brand">
          My coffee
        </h2>
        {listings.length === 0 ? (
          <p className="mt-2 text-muted">Nothing yet. Add your first coffee below.</p>
        ) : (
          <ul className="mt-3 space-y-3">
            {listings.map((l) => (
              <FarmerListingCard
                key={l.id}
                listing={{
                  id: l.id,
                  name: l.name,
                  kind: l.kind,
                  weightGrams: l.weightGrams,
                  priceXaf: l.priceXaf,
                  stock: l.stock,
                  description: l.description,
                  status: l.status,
                  note: l.note,
                  imageSrc: l.hasImage ? `/api/listing-image/${l.id}?mine=1&v=${l.imageVersion}` : null,
                }}
              />
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="add-heading" className="mt-10 rounded-2xl border border-border bg-surface p-5 shadow-sm">
        <h2 id="add-heading" className="type-title text-brand">
          Add coffee to sell
        </h2>
        <p className="mt-1 mb-4 text-sm text-muted">The cooperative checks it first. It goes on sale once they approve it.</p>
        <ListingForm action={farmerAddListing} submitLabel="Send for approval" />
      </section>

      <section aria-labelledby="sales-heading" className="mt-10">
        <h2 id="sales-heading" className="type-title text-brand">
          My sales
        </h2>
        {sales.length === 0 ? (
          <p className="mt-2 text-muted">No sales yet. Confirmed orders of your coffee show here.</p>
        ) : (
          <ul className="mt-3 divide-y divide-border border-y border-border">
            {sales.map((s) => (
              <li key={`${s.orderId}-${s.name}`} className="flex flex-wrap justify-between gap-x-3 gap-y-1 py-3 text-sm">
                <span className="min-w-0">
                  <span className="font-semibold text-foreground">
                    {s.quantity} × {s.name}
                  </span>
                  <span className="block text-muted">
                    {kumboTime(s.createdAt).split(",")[0]} · {s.ref ?? "Order"} · {STATUS_LABEL[s.status as OrderStatus] ?? s.status}
                  </span>
                </span>
                <span className="shrink-0 text-right">
                  <span className="block font-semibold text-foreground tabular-nums">{formatFcfaText(s.owedXaf)}</span>
                  <span className="block text-muted">for you</span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <form action={farmerSignOut} className="mt-10">
        <button type="submit" className="btn btn-secondary w-full">
          Sign out
        </button>
      </form>
    </>
  );
}
