import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { MarketCard } from "@/components/market/market-card";
import { hasDatabase } from "@/lib/db";
import { farmerById, marketProducts } from "@/lib/market";

export const metadata: Metadata = { title: "Farmer" };

export default function FarmerShopPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <div className="mx-auto max-w-6xl px-4 pb-10 pt-8">
      <Suspense fallback={<div className="h-64 animate-pulse rounded-2xl bg-border/40 motion-reduce:animate-none" />}>
        <FarmerShop params={params} />
      </Suspense>
    </div>
  );
}

async function FarmerShop({ params }: { params: Promise<{ id: string }> }) {
  await connection();
  const id = Number((await params).id);
  if (!hasDatabase() || !Number.isSafeInteger(id) || id < 1) notFound();
  const farmer = await farmerById(id).catch(() => null);
  if (!farmer?.active) notFound();
  const coffee = (await marketProducts().catch(() => [])).filter((p) => p.seller?.id === id);
  return (
    <>
      <nav aria-label="Breadcrumb" className="text-sm text-muted">
        <Link href="/farmers" className="underline underline-offset-[3px]">
          Our farmers
        </Link>
      </nav>
      <h1 className="type-h1 mt-3 text-brand [overflow-wrap:anywhere]">{farmer.name}</h1>
      {farmer.village && <p className="mt-1 text-muted">{farmer.village}, Bui Division</p>}
      {farmer.story && <p className="type-lead mt-4 max-w-[60ch] whitespace-pre-line text-foreground [overflow-wrap:anywhere]">{farmer.story}</p>}
      <h2 className="type-h2 mt-10 text-brand">Coffee from {farmer.name.split(" ")[0]}</h2>
      {coffee.length === 0 ? (
        <p className="mt-3 text-muted">Nothing on sale right now. Check back after the next harvest.</p>
      ) : (
        <div className="mt-5 grid grid-cols-[minmax(0,1fr)] gap-6 sm:grid-cols-[repeat(2,minmax(0,1fr))] lg:grid-cols-[repeat(3,minmax(0,1fr))]">
          {coffee.map((p) => (
            <MarketCard key={p.slug} product={p} />
          ))}
        </div>
      )}
      <p className="mt-10 text-sm text-muted">
        Every order is delivered by GREENVENTURES Cooperative, and {farmer.name.split(" ")[0]} is paid their share of each sale.
      </p>
    </>
  );
}
