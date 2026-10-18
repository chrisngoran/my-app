import type { Metadata } from "next";
import { Suspense } from "react";
import { SalesDashboard } from "@/components/portal/insights/dashboard";
import { StaffLogin } from "@/components/portal/insights/staff-login";
import { PageHeader } from "@/components/portal/ui";
import { catalogProducts } from "@/lib/catalog-store";
import { hasDatabase, type OrderRow, recentOrders } from "@/lib/db";
import { SAMPLE_END, sampleOrders, type SampleOrder } from "@/lib/sample-sales";
import { googleSignInConfigured } from "@/lib/google-auth";
import { signOutStaff } from "@/lib/staff-actions";
import { isStaff, staffPasswordSet } from "@/lib/staff-session";

export const metadata: Metadata = { title: "Sales & demand" };

const DAY_MS = 86_400_000;
/** Kumbo is on West Africa Time, UTC+1 all year, so a day starts at 23:00 UTC. */
const WAT_MS = 3_600_000;
const watDay = (ms: number) => Math.floor((ms + WAT_MS) / DAY_MS);
const longDate = (d: Date) => d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

const TITLE = "Sales & demand";
const DESCRIPTION = "What sold, where, when, and how long the stock will last.";

export default function InsightsPage() {
  return (
    <Suspense fallback={<PageHeader title={TITLE} description={DESCRIPTION} />}>
      <Insights />
    </Suspense>
  );
}

/** Turns stored orders into days before today (Kumbo time), the shape the dashboard counts in. */
function countBackFromToday(rows: OrderRow[]) {
  const today = watDay(Date.now());
  const orders: SampleOrder[] = rows.map((r) => ({
    daysAgo: today - watDay(r.createdAt.getTime()),
    city: r.city,
    market: r.market,
    lines: r.lines,
  }));
  return { orders, endMs: today * DAY_MS + 12 * 3_600_000 };
}

async function Insights() {
  // No database yet: the demo figures, open to anyone as before.
  if (!hasDatabase()) {
    const end = new Date(`${SAMPLE_END}T12:00:00Z`);
    return (
      <>
        <PageHeader
          title={TITLE}
          description={`${DESCRIPTION} Sample data up to ${longDate(end)}; real figures appear once the orders database is connected.`}
        />
        <SalesDashboard orders={sampleOrders} endMs={end.getTime()} sample />
      </>
    );
  }

  if (!(await isStaff())) {
    return (
      <>
        <PageHeader title={TITLE} description={DESCRIPTION} />
        <StaffLogin passwordSet={staffPasswordSet()} google={googleSignInConfigured()} next="/portal/insights" note="The sales figures are real orders, so only cooperative staff can see them." />
      </>
    );
  }

  const signOut = (
    <form action={signOutStaff}>
      <input type="hidden" name="next" value="/portal/insights" />
      <button type="submit" className="btn btn-secondary">
        Sign out
      </button>
    </form>
  );

  let rows;
  let catalog;
  try {
    // Two years, so the 52-week view can compare with the year before.
    [rows, catalog] = await Promise.all([recentOrders(728), catalogProducts()]);
  } catch (e) {
    console.error("Could not read orders", e);
    return (
      <>
        <PageHeader title={TITLE} description={DESCRIPTION} actions={signOut} />
        <p className="max-w-md rounded-xl border border-border bg-surface p-5 text-sm text-muted shadow-sm">
          The orders database could not be reached just now. Reload the page in a minute.
        </p>
      </>
    );
  }

  const { orders, endMs } = countBackFromToday(rows);

  return (
    <>
      <PageHeader
        title={TITLE}
        description={`${DESCRIPTION} Real order requests sent from the website (cancelled ones left out), up to today, ${longDate(new Date(endMs))}.`}
        actions={signOut}
      />
      {orders.length === 0 ? (
        <p className="max-w-md rounded-xl border border-border bg-surface p-5 text-sm text-muted shadow-sm">
          No orders recorded yet. Each order a customer sends on WhatsApp from the website will appear here.
        </p>
      ) : (
        <SalesDashboard
          orders={orders}
          endMs={endMs}
          sample={false}
          catalog={catalog.map((p) => ({ slug: p.slug, name: p.name, stock: p.stock }))}
        />
      )}
    </>
  );
}
