import type { Metadata } from "next";
import { pendingSalesXaf, totalSalesXaf } from "@/components/portal/metrics";
import { OrdersTable } from "@/components/portal/orders-table";
import { Card, PageHeader, StatCard } from "@/components/portal/ui";
import { Price } from "@/components/price";
import { orders } from "@/lib/data";

export const metadata: Metadata = { title: "Orders" };

export default function OrdersPage() {
  const sorted = [...orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const mobileMoney = orders.filter((o) => o.paymentMethod !== "Card").length;
  return (
    <>
      <PageHeader title="Orders" description="Online orders from the shop. Filter by status to plan packing and deliveries." />
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
