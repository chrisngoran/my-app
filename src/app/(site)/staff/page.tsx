import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { StaffLogin } from "@/components/portal/insights/staff-login";
import { WorldPriceCard } from "@/components/world-price-card";
import { cooperative } from "@/lib/data";
import { countWaitingOrders, hasDatabase } from "@/lib/db";
import { googleSignInConfigured } from "@/lib/google-auth";
import { signOutStaff } from "@/lib/staff-actions";
import { staffPasswordSet, staffSession } from "@/lib/staff-session";

export const metadata: Metadata = {
  title: "Staff home",
  robots: { index: false, follow: false },
};

const svg = { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round" } as const;
const ICONS = {
  orders: <path d="M6 3h12l1 18H5zM9 7a3 3 0 0 0 6 0" />,
  sales: <path d="M3 17l5-5 4 3 8-8M15 7h5v5" />,
  products: <path d="M3 7.5 12 3l9 4.5v9L12 21l-9-4.5zM3 7.5 12 12l9-4.5M12 12v9" />,
  lots: <path d="M12 3.5c4 0 7 3.8 7 8.5s-3 8.5-7 8.5-7-3.8-7-8.5 3-8.5 7-8.5zM9 18c2-3 1-6 3-9s2.5-3 3.5-4" />,
  farmers: <path d="M9 11.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM2.5 20c.8-3.5 3.4-5.5 6.5-5.5s5.7 2 6.5 5.5M16 4.5a3.5 3.5 0 0 1 0 7M18 14.8c1.9.8 3.1 2.6 3.5 5.2" />,
  shop: <path d="M4 9h16l-1 11H5zM8 9V7a4 4 0 0 1 8 0v2" />,
};

function Tile({
  href,
  icon,
  title,
  hint,
  badge,
  primary = false,
}: {
  href: string;
  icon: keyof typeof ICONS;
  title: string;
  hint: string;
  badge?: string;
  primary?: boolean;
}) {
  return (
    <li className="min-w-0">
      <Link
        href={href}
        className={`press relative flex h-full min-h-36 flex-col gap-3 rounded-2xl border p-5 shadow-sm transition-colors ${
          primary
            ? "border-brand bg-brand text-brand-contrast pointer-fine:hover:bg-brand/90"
            : "border-border bg-surface text-foreground pointer-fine:hover:border-accent"
        }`}
      >
        <span
          className={`flex h-12 w-12 items-center justify-center rounded-xl ${primary ? "bg-white/15" : "bg-accent-soft text-accent"}`}
          aria-hidden="true"
        >
          <svg {...svg} className="h-7 w-7">
            {ICONS[icon]}
          </svg>
        </span>
        <span className="text-xl font-bold leading-tight">{title}</span>
        <span className={`text-sm ${primary ? "text-brand-contrast/85" : "text-muted"}`}>{hint}</span>
        {badge && (
          <span className="absolute top-4 right-4 rounded-full bg-warm px-2.5 py-1 text-sm font-bold text-white tabular-nums">{badge}</span>
        )}
      </Link>
    </li>
  );
}

export default function StaffHomePage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8">
      <p className="type-title text-brand">{cooperative.name}</p>
      <h1 className="type-h2 mt-1 text-brand">Staff home</h1>
      <Suspense fallback={<div className="mt-6 h-72 animate-pulse rounded-2xl bg-border/40 motion-reduce:animate-none" />}>
        <StaffHome />
      </Suspense>
    </div>
  );
}

async function StaffHome() {
  const live = hasDatabase();
  const session = live ? await staffSession() : null;

  if (live && !session) {
    return (
      <div className="mt-6">
        <StaffLogin
          passwordSet={staffPasswordSet()}
          google={googleSignInConfigured()}
          next="/staff"
          note="Sign in to manage orders, prices, stock and photos."
        />
      </div>
    );
  }

  let waiting = 0;
  if (live) {
    try {
      waiting = await countWaitingOrders();
    } catch (e) {
      console.error("Could not count orders", e);
    }
  }

  return (
    <>
      <p className="mt-2 text-muted [overflow-wrap:anywhere]">
        {live ? `Signed in as ${session?.email || "cooperative staff"}.` : "Demo: no database is connected, so these pages show sample data."}
      </p>
      <ul className="mt-6 grid grid-cols-[repeat(2,minmax(0,1fr))] gap-3 sm:gap-4">
        <Tile
          href="/portal/orders"
          icon="orders"
          title="Orders"
          hint={waiting ? "Confirm or cancel new orders" : "No orders waiting"}
          badge={waiting ? `${waiting} new` : undefined}
          primary
        />
        <Tile href="/portal/insights" icon="sales" title="Sales & demand" hint="What sold, where and when" />
        <Tile href="/admin/products" icon="products" title="Products" hint="Prices, stock, photos, sold out" />
        <Tile href="/admin/lots" icon="lots" title="Coffee lots" hint="Tasting notes and scores" />
        <Tile href="/admin/farmers" icon="farmers" title="Farmers" hint="Their stories" />
        <Tile href="/shop" icon="shop" title="View the shop" hint="See it as customers do" />
      </ul>
      <div className="mt-6">
        <Suspense fallback={<div className="h-36 animate-pulse rounded-2xl bg-border/40 motion-reduce:animate-none" />}>
          <WorldPriceCard />
        </Suspense>
      </div>
      {live && (
        <form action={signOutStaff} className="mt-8">
          <input type="hidden" name="next" value="/staff" />
          <button type="submit" className="btn btn-secondary btn-lg w-full">
            Sign out
          </button>
        </form>
      )}
    </>
  );
}
