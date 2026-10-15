"use client";

import { useMemo, useState } from "react";
import { Price } from "@/components/price";
import { getProduct, orderTotalXaf } from "@/lib/data";
import type { Order, OrderStatus } from "@/lib/types";
import { formatDateTime, ORDER_STATUSES } from "./metrics";
import { rowClass, StatusBadge, TableWrap, tableClass, td, tdRight, th, theadClass, thRight } from "./ui";

type Filter = OrderStatus | "All";

export function OrdersTable({ orders, showFilter = true, caption }: { orders: Order[]; showFilter?: boolean; caption: string }) {
  const [filter, setFilter] = useState<Filter>("All");
  const counts = useMemo(() => {
    const c = new Map<Filter, number>([["All", orders.length]]);
    for (const s of ORDER_STATUSES) c.set(s, orders.filter((o) => o.status === s).length);
    return c;
  }, [orders]);

  const visible = filter === "All" ? orders : orders.filter((o) => o.status === filter);
  const visibleTotal = visible.reduce((n, o) => n + orderTotalXaf(o), 0);

  return (
    <div>
      {showFilter ? (
        <div className="border-b border-border px-4 py-3 sm:px-5 print:hidden">
          <fieldset className="min-w-0">
            <legend className="sr-only">Filter orders by status</legend>
            <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
              {(["All", ...ORDER_STATUSES] as Filter[]).map((s) => {
                const active = filter === s;
                return (
                  <button
                    key={s}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setFilter(s)}
                    className={`shrink-0 whitespace-nowrap rounded-full border px-3 py-1 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                      active
                        ? "border-brand bg-brand text-brand-contrast"
                        : "border-border bg-surface text-foreground/80 hover:border-accent hover:text-accent"
                    }`}
                  >
                    {s} <span className={active ? "opacity-80" : "text-muted"}>({counts.get(s) ?? 0})</span>
                  </button>
                );
              })}
            </div>
          </fieldset>
          <p className="mt-2 text-xs text-muted" aria-live="polite">
            Showing {visible.length} of {orders.length} orders · <Price xaf={visibleTotal} />
          </p>
        </div>
      ) : null}
      <TableWrap label={caption}>
        <table className={tableClass}>
          <caption className="sr-only">{caption}</caption>
          <thead className={theadClass}>
            <tr>
              <th scope="col" className={th}>Order</th>
              <th scope="col" className={th}>Customer</th>
              <th scope="col" className={th}>Items</th>
              <th scope="col" className={th}>Status</th>
              <th scope="col" className={th}>Payment</th>
              <th scope="col" className={th}>City</th>
              <th scope="col" className={thRight}>Total</th>
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 ? (
              <tr className="border-t border-border">
                <td colSpan={7} className="px-4 py-8 text-center text-sm text-muted">
                  No orders with status “{filter}”.
                </td>
              </tr>
            ) : (
              visible.map((o) => (
                <tr key={o.id} className={rowClass}>
                  <td className={td}>
                    <div className="font-mono text-xs font-semibold text-brand">{o.id}</div>
                    <div className="text-xs text-muted">{formatDateTime(o.createdAt)}</div>
                  </td>
                  <td className={td}>{o.customerName}</td>
                  <td className={`${td} text-xs text-muted`}>
                    <div className="w-48 whitespace-normal">
                      {o.lines.map((l) => `${l.quantity} × ${getProduct(l.productSlug)?.name ?? l.productSlug}`).join(", ")}
                    </div>
                  </td>
                  <td className={td}>
                    <StatusBadge status={o.status} />
                  </td>
                  <td className={td}>{o.paymentMethod}</td>
                  <td className={td}>{o.city}</td>
                  <td className={`${tdRight} font-semibold`}>
                    <Price xaf={orderTotalXaf(o)} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </TableWrap>
    </div>
  );
}
