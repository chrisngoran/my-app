import type { Metadata } from "next";
import Link from "next/link";
import { BarChart } from "@/components/portal/bar-chart";
import {
  formatNumber,
  greenStockKg,
  inventoryTotals,
  LOW_STOCK_THRESHOLD,
  ordersByStatus,
  pendingSalesXaf,
  salesByProduct,
  totalFarmerPaymentsXaf,
  totalSalesXaf,
} from "@/components/portal/metrics";
import { OrdersTable } from "@/components/portal/orders-table";
import { Card, PageHeader, Pill, StatCard, TextLink } from "@/components/portal/ui";
import { Price } from "@/components/price";
import { farmers, lots, orders } from "@/lib/data";
import type { OrderStatus } from "@/lib/types";

export const metadata: Metadata = { title: "Dashboard" };

const STATUS_DOT: Record<OrderStatus, string> = {
  "Pending payment": "bg-amber-500",
  Paid: "bg-sky-500",
  Preparing: "bg-violet-500",
  "Out for delivery": "bg-orange-500",
  Delivered: "bg-accent",
};

const iconProps = { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, className: "h-4 w-4" } as const;

export default function PortalDashboard() {
  const inv = inventoryTotals();
  const statuses = ordersByStatus();
  const recent = [...orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5);
  const productSales = salesByProduct();

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Overview of sales, stock and member activity across the cooperative."
        actions={
          <Link
            href="/portal/reports"
            className="inline-flex items-center rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-brand-contrast shadow-sm hover:opacity-90"
          >
            View reports
          </Link>
        }
      />

      <section aria-labelledby="kpi-heading">
        <h2 id="kpi-heading" className="sr-only">Key figures</h2>
        <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 xl:grid-cols-4 sm:gap-4">
          <StatCard
            label="Total sales"
            value={<Price xaf={totalSalesXaf()} />}
            hint={<>
              {orders.length} orders · <Price xaf={pendingSalesXaf()} /> awaiting payment
            </>}
            icon={<svg {...iconProps} aria-hidden="true"><path d="M4 17l5-5 4 4 7-8" /><path d="M14 8h6v6" /></svg>}
          />
          <StatCard
            label="Member farmers"
            value={farmers.length}
            hint={<><Price xaf={totalFarmerPaymentsXaf()} /> paid out this season</>}
            tone="accent"
            icon={<svg {...iconProps} aria-hidden="true"><circle cx="12" cy="8" r="4" /><path d="M4 21c1-4 4-6 8-6s7 2 8 6" /></svg>}
          />
          <StatCard
            label="Active lots"
            value={lots.length}
            hint={`${formatNumber(greenStockKg())} kg green coffee traced`}
            tone="warm"
            icon={<svg {...iconProps} aria-hidden="true"><ellipse cx="12" cy="12" rx="6" ry="8.5" transform="rotate(-30 12 12)" /><path d="M8.5 18.5c2-3 1-6 3-9s3.5-3 4-4" /></svg>}
          />
          <StatCard
            label="Stock on hand"
            value={`${formatNumber(inv.units)} bags`}
            hint={`${formatNumber(inv.kg, 1)} kg packed · ${inv.lowStock.length} low-stock item${inv.lowStock.length === 1 ? "" : "s"}`}
            icon={<svg {...iconProps} aria-hidden="true"><path d="M3 7.5 12 3l9 4.5v9L12 21l-9-4.5z" /><path d="M3 7.5 12 12l9-4.5M12 12v9" /></svg>}
          />
        </div>
      </section>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <Card id="status" title="Orders by status" className="xl:col-span-1">
          <ul className="divide-y divide-border">
            {statuses.map(({ status, count }) => (
              <li key={status} className="flex items-center justify-between gap-3 px-4 py-3 text-sm sm:px-5">
                <span className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${STATUS_DOT[status]}`} aria-hidden="true" />
                  {status}
                </span>
                <span className="font-semibold tabular-nums">{count}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card
          id="product-sales"
          title="Sales per product"
          className="xl:col-span-2"
          action={<TextLink href="/portal/reports">Full report</TextLink>}
        >
          <BarChart
            caption="Sales per product in the selected currency, excluding shipping"
            data={productSales.map((r) => ({
              key: r.key,
              label: r.label,
              valueXaf: r.totalXaf,
              detail: `${r.units} sold`,
            }))}
          />
        </Card>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <Card
          id="recent-orders"
          title="Recent orders"
          className="xl:col-span-2"
          action={<TextLink href="/portal/orders">All orders</TextLink>}
        >
          <OrdersTable orders={recent} showFilter={false} caption="Five most recent orders" />
        </Card>

        <Card id="low-stock" title="Low-stock alerts" action={<TextLink href="/portal/inventory">Inventory</TextLink>}>
          {inv.lowStock.length === 0 ? (
            <p className="px-4 py-6 text-sm text-muted sm:px-5">All products are above {LOW_STOCK_THRESHOLD} units.</p>
          ) : (
            <ul className="divide-y divide-border">
              {inv.lowStock.map((p) => (
                <li key={p.slug} className="flex items-start gap-3 px-4 py-3 sm:px-5">
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-700" aria-hidden="true">
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 3 2 20h20zM12 10v4M12 17h.01" />
                    </svg>
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{p.name}</p>
                    <p className="text-xs text-muted">
                      Lot <span className="font-mono">{p.lotCode}</span> · reorder below {LOW_STOCK_THRESHOLD}
                    </p>
                  </div>
                  <Pill tone="warn">{p.stock} left</Pill>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </>
  );
}
