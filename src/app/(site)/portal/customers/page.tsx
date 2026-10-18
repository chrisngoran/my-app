import type { Metadata } from "next";
import { Suspense } from "react";
import { StaffLogin } from "@/components/portal/insights/staff-login";
import { PageHeader } from "@/components/portal/ui";
import { formatFcfaText } from "@/lib/currency";
import { customerList, type CustomerSummary, hasDatabase } from "@/lib/db";
import { googleSignInConfigured } from "@/lib/google-auth";
import { kumboTime } from "@/lib/order-status";
import { staffPasswordSet, isStaff } from "@/lib/staff-session";

export const metadata: Metadata = { title: "Customers", robots: { index: false, follow: false } };

const TITLE = "Customers";
const DESCRIPTION =
  "Everyone who has signed in with Google to follow their orders, newest first. People who order without signing in are only known from their WhatsApp message.";

export default function CustomersPage() {
  if (!hasDatabase()) {
    return <PageHeader title={TITLE} description="The customer list starts once the shop is connected to its database." />;
  }
  return (
    <Suspense fallback={<PageHeader title={TITLE} description={DESCRIPTION} />}>
      <Customers />
    </Suspense>
  );
}

async function Customers() {
  if (!(await isStaff())) {
    return (
      <>
        <PageHeader title={TITLE} description={DESCRIPTION} />
        <StaffLogin passwordSet={staffPasswordSet()} google={googleSignInConfigured()} next="/portal/customers" note="Only cooperative staff can see customers." />
      </>
    );
  }
  let customers: CustomerSummary[] = [];
  let failed = false;
  try {
    customers = await customerList();
  } catch (e) {
    console.error("Could not read customers", e);
    failed = true;
  }
  const buyers = customers.filter((c) => c.orders > 0).length;
  return (
    <>
      <PageHeader title={TITLE} description={DESCRIPTION} />
      {failed ? (
        <p className="text-sm text-muted">Customers could not be loaded just now. Reload in a minute.</p>
      ) : customers.length === 0 ? (
        <p className="max-w-md rounded-xl border border-border bg-surface p-5 text-sm text-muted shadow-sm">No one has signed in yet.</p>
      ) : (
        <>
          <p className="mb-4 text-sm font-semibold text-foreground">
            {customers.length} {customers.length === 1 ? "customer" : "customers"} · {buyers} ordered
          </p>
          <ul className="grid gap-3 lg:grid-cols-2">
            {customers.map((c) => (
              <li key={c.id} className="rounded-xl border border-border bg-surface p-4 shadow-sm">
                <p className="font-semibold text-foreground [overflow-wrap:anywhere]">{c.name || c.email}</p>
                {c.name && (
                  <a href={`mailto:${c.email}`} className="text-sm text-accent underline-offset-2 [overflow-wrap:anywhere] pointer-fine:hover:underline">
                    {c.email}
                  </a>
                )}
                <dl className="mt-2 grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-0.5 text-sm">
                  <dt className="text-muted">Joined</dt>
                  <dd className="text-foreground">{kumboTime(c.joined)}</dd>
                  {c.lastSeen && c.lastSeen.getTime() - c.joined.getTime() > 60_000 && (
                    <>
                      <dt className="text-muted">Last signed in</dt>
                      <dd className="text-foreground">{kumboTime(c.lastSeen)}</dd>
                    </>
                  )}
                  <dt className="text-muted">Orders</dt>
                  <dd className="text-foreground tabular-nums">
                    {c.orders}
                    {c.spentXaf > 0 && ` · ${formatFcfaText(c.spentXaf)} confirmed`}
                  </dd>
                  {c.lastOrder && (
                    <>
                      <dt className="text-muted">Last order</dt>
                      <dd className="text-foreground">{kumboTime(c.lastOrder)}</dd>
                    </>
                  )}
                </dl>
              </li>
            ))}
          </ul>
        </>
      )}
    </>
  );
}
