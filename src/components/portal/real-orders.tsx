"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Price } from "@/components/price";
import { type OrderAction, updateOrder } from "@/lib/order-actions";

export interface RealOrder {
  id: number;
  ref: string | null;
  status: "requested" | "confirmed" | "cancelled";
  /** Already written out in Kumbo time on the server. */
  when: string;
  city: string;
  abroad: boolean;
  lines: { name: string; quantity: number; lineXaf: number }[];
  totalXaf: number;
}

const STATUS = {
  requested: { label: "Waiting", className: "bg-warm/15 text-warm" },
  confirmed: { label: "Confirmed", className: "bg-accent-soft text-accent" },
  cancelled: { label: "Cancelled", className: "bg-border/60 text-muted" },
} as const;

const button =
  "press inline-flex min-h-11 items-center justify-center rounded-lg border px-3 text-sm font-semibold disabled:opacity-60";

function OrderCard({ order }: { order: RealOrder }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [askDelete, setAskDelete] = useState(false);

  const run = (action: OrderAction) =>
    start(async () => {
      setError(null);
      const result = await updateOrder(order.id, action);
      if (result.error) setError(result.error);
      setAskDelete(false);
      router.refresh();
    });

  const status = STATUS[order.status];
  return (
    <li className={`rounded-xl border border-border bg-surface p-4 shadow-sm ${order.status === "cancelled" ? "opacity-75" : ""}`} aria-busy={pending}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-semibold text-foreground">
            {order.ref ?? "No reference"} · {order.city}
            {order.abroad ? " (abroad)" : ""}
          </p>
          <p className="text-sm text-muted">{order.when}</p>
        </div>
        <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${status.className}`}>{status.label}</span>
      </div>
      <ul className="mt-3 space-y-1 border-t border-dashed border-border pt-3 text-sm">
        {order.lines.map((l) => (
          <li key={l.name} className="flex justify-between gap-3">
            <span className="min-w-0 [overflow-wrap:anywhere]">
              <span className="tabular-nums">{l.quantity}</span> × {l.name}
            </span>
            <Price xaf={l.lineXaf} className="shrink-0" />
          </li>
        ))}
        <li className="flex justify-between gap-3 border-t border-border pt-1 font-semibold">
          <span>Coffee total</span>
          <Price xaf={order.totalXaf} className="shrink-0" />
        </li>
      </ul>
      {error && (
        <p role="alert" className="mt-3 text-sm font-medium text-danger">
          {error}
        </p>
      )}
      {askDelete ? (
        <div className="mt-3 rounded-lg bg-danger-soft p-3">
          <p className="text-sm font-semibold text-danger">Delete this order for good? Use this for test orders.</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <button type="button" disabled={pending} onClick={() => run("delete")} className={`${button} border-danger bg-danger text-white`}>
              Yes, delete
            </button>
            <button type="button" disabled={pending} onClick={() => setAskDelete(false)} className={`${button} border-border bg-surface`}>
              Keep it
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-3 flex flex-wrap gap-2">
          {order.status !== "confirmed" && (
            <button type="button" disabled={pending} onClick={() => run("confirm")} className={`${button} border-accent bg-accent text-white`}>
              {order.status === "cancelled" ? "Confirm after all" : "Confirm (takes from stock)"}
            </button>
          )}
          {order.status !== "cancelled" && (
            <button type="button" disabled={pending} onClick={() => run("cancel")} className={`${button} border-border bg-surface text-foreground`}>
              {order.status === "confirmed" ? "Cancel (puts back in stock)" : "Cancel"}
            </button>
          )}
          <button type="button" disabled={pending} onClick={() => setAskDelete(true)} className={`${button} border-border bg-surface text-danger`}>
            Delete
          </button>
        </div>
      )}
    </li>
  );
}

export function RealOrders({ orders }: { orders: RealOrder[] }) {
  if (orders.length === 0) {
    return (
      <p className="max-w-md rounded-xl border border-border bg-surface p-5 text-sm text-muted shadow-sm">
        No orders yet. Each order a customer sends on WhatsApp from the website appears here, with its reference.
      </p>
    );
  }
  return (
    <ul className="grid gap-3 lg:grid-cols-2">
      {orders.map((o) => (
        <OrderCard key={o.id} order={o} />
      ))}
    </ul>
  );
}
