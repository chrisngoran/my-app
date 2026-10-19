import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { hasDatabase } from "@/lib/db";
import { allFarmers, marketProducts } from "@/lib/market";

export const metadata: Metadata = {
  title: "Our farmers",
  description: "Buy coffee directly from the family farmers of GREENVENTURES Cooperative in Kumbo, Cameroon.",
};

export default function FarmersPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 pb-10 pt-8">
      <h1 className="type-h1 text-brand">Our farmers</h1>
      <p className="type-lead mt-4 max-w-[60ch] text-foreground">
        Buy coffee straight from the family farms of the Bui highlands. The cooperative delivers every order and pays each farmer their share.
      </p>
      <Suspense fallback={<div className="mt-8 h-40 animate-pulse rounded-2xl bg-border/40 motion-reduce:animate-none" />}>
        <FarmerList />
      </Suspense>
      <p className="mt-10 text-sm text-muted">
        Are you a member farmer?{" "}
        <Link href="/farmer" className="font-semibold text-accent underline underline-offset-[3px]">
          Sign in to sell your coffee
        </Link>
      </p>
    </div>
  );
}

async function FarmerList() {
  await connection();
  if (!hasDatabase()) return <p className="mt-8 text-muted">The farmer marketplace opens soon.</p>;
  const [farmers, coffee] = await Promise.all([allFarmers().catch(() => []), marketProducts().catch(() => [])]);
  const selling = farmers.filter((f) => f.active && coffee.some((p) => p.seller?.id === f.id));
  if (selling.length === 0) return <p className="mt-8 text-muted">No farmers have coffee on sale right now. Check back after the next harvest.</p>;
  return (
    <ul className="mt-8 grid grid-cols-[minmax(0,1fr)] gap-4 sm:grid-cols-[repeat(2,minmax(0,1fr))] lg:grid-cols-[repeat(3,minmax(0,1fr))]">
      {selling.map((f) => {
        const n = coffee.filter((p) => p.seller?.id === f.id).length;
        return (
          <li key={f.id}>
            <Link href={`/farmers/${f.id}`} className="press block h-full rounded-2xl border border-border bg-surface p-5 shadow-sm pointer-fine:hover:border-accent">
              <span className="block text-xl font-bold text-brand">{f.name}</span>
              {f.village && <span className="mt-0.5 block text-muted">{f.village}</span>}
              <span className="mt-3 block text-sm font-semibold text-accent">
                {n} coffee{n > 1 ? "s" : ""} on sale
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
