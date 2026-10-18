import type { Metadata } from "next";
import { Suspense } from "react";
import { StaffLogin } from "@/components/portal/insights/staff-login";
import { pendingSalesXaf, totalSalesXaf } from "@/components/portal/metrics";
import { OrdersTable } from "@/components/portal/orders-table";
import { type RealOrder, RealOrders } from "@/components/portal/real-orders";
import { Card, PageHeader, StatCard } from "@/components/portal/ui";
import { Price } from "@/components/price";
import { orders, products } from "@/lib/data";
import { customersById, hasDatabase, latestOrders, type OrderRow } from "@/lib/db";
import { kumboTime } from "@/lib/order-status";
import { googleSignInConfigured } from "@/lib/google-auth";
import { signOutStaff } from "@/lib/staff-actions";
import { isStaff, staffPasswordSet } from "@/lib/staff-session";

export const metadata: Metadata = { title: "Orders" };

const TITLE = "Orders";

export default function OrdersPage() {
  // No database yet: the demo orders, as before.
  if (!hasDatabase()) return <SampleOrders />;
  return (
    <Suspense fallback={<PageHeader title={TITLE} />}>
      <LiveOrders />
    </Suspense>
  );
}

function SampleOrders() {
  const sorted = [...orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const mobileMoney = orders.filter((o) => o.paymentMethod !== "Card").length;
  return (
    <>
      <PageHeader title={TITLE} description="Online orders from the shop. Filter by status to plan packing and deliveries." />
      <div className="mb-6 grid grid-cols-1 gap-3 min-[420px]:grid-cols-3 sm:gap-4">
        <StatCard label="Order value" value={<Price xaf={totalSalesXaf()} />} hint="Including shipping" />
        <StatCard label="Awaiting payment" value={<Price xaf={pendingSalesXaf()} />} tone="warm" />
        <StatCard label="Paid by mobile money" value={`${mobileMoney} of ${orders.length}`} hint="MTN MoMo and Orange Money" tone="accent" />
      </div>
      <Card id="orders" title="All orders">
        <OrdersTable orders={sorted} caption="All orders" />
      </Card>
    </>
  );
}

function toCard(o: OrderRow, customers: Map<number, { email: string; name: string }>): RealOrder {
  const lines = o.lines.map((l) => ({
    name: products.find((p) => p.slug === l.slug)?.name ?? l.slug,
    quantity: l.quantity,
    lineXaf: l.quantity * l.unitPriceXaf,
  }));
  return {
    id: o.id,
    ref: o.ref,
    status: o.status,
    when: kumboTime(o.createdAt),
    customer: o.customerId && customers.get(o.customerId) ? describe(customers.get(o.customerId)!) : null,
    city: o.city,
    abroad: o.market === "abroad",
    lines,
    totalXaf: lines.reduce((n, l) => n + l.lineXaf, 0),
  };
}

const describe = (c: { email: string; name: string }) => (c.name ? `${c.name} (${c.email})` : c.email);

async function LiveOrders() {
  const description =
    "Order requests sent on WhatsApp from the website, newest first. Match them by the reference in the WhatsApp message. Confirm takes the bags from stock.";
  if (!(await isStaff())) {
    return (
      <>
        <PageHeader title={TITLE} description={description} />
        <StaffLogin passwordSet={staffPasswordSet()} google={googleSignInConfigured()} next="/portal/orders" note="These are real customer orders, so only cooperative staff can see them." />
      </>
    );
  }
  const signOut = (
    <form action={signOutStaff}>
      <input type="hidden" name="next" value="/portal/orders" />
      <button type="submit" className="btn btn-secondary">
        Sign out
      </button>
    </form>
  );
  let rows: OrderRow[];
  let customers: Map<number, { email: string; name: string }>;
  try {
    rows = await latestOrders(200);
    customers = await customersById([...new Set(rows.flatMap((r) => (r.customerId ? [r.customerId] : [])))]);
  } catch (e) {
    console.error("Could not read orders", e);
    return (
      <>
        <PageHeader title={TITLE} description={description} actions={signOut} />
        <p className="max-w-md rounded-xl border border-border bg-surface p-5 text-sm text-muted shadow-sm">
          The orders database could not be reached just now. Reload the page in a minute.
        </p>
      </>
    );
  }
  const cards = rows.map((r) => toCard(r, customers));
  const waiting = cards.filter((c) => c.status === "requested");
  return (
    <>
      <PageHeader title={TITLE} description={description} actions={signOut} />
      <div className="mb-6 grid grid-cols-1 gap-3 min-[420px]:grid-cols-3 sm:gap-4">
        <StatCard label="Waiting" value={String(waiting.length)} hint={<Price xaf={waiting.reduce((n, c) => n + c.totalXaf, 0)} />} tone="warm" />
        <StatCard label="In progress" value={String(cards.filter((c) => ["confirmed", "packed", "shipped"].includes(c.status)).length)} hint="Confirmed, packed or on the way" tone="accent" />
        <StatCard label="Delivered" value={String(cards.filter((c) => c.status === "delivered").length)} />
      </div>
      <RealOrders orders={cards} />
    </>
  );
}
