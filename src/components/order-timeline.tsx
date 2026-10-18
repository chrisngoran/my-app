import { products } from "@/lib/data";
import type { OrderRow } from "@/lib/db";
import { formatFcfaText } from "@/lib/currency";
import { JOURNEY, kumboTime, STATUS_CLASS, STATUS_FOR_CUSTOMER, STATUS_LABEL } from "@/lib/order-status";

/** One order as its customer sees it: what was ordered, and how far it has come. */
export function OrderTimeline({ order }: { order: OrderRow }) {
  const reached = new Map(order.history.map((h) => [h.status, h.at]));
  // Orders from before tracking began have no history; their creation time stands in for "received".
  if (!reached.has("requested")) reached.set("requested", order.createdAt.toISOString());
  const cancelled = order.status === "cancelled";
  const at = JOURNEY.indexOf(order.status);
  const total = order.lines.reduce((n, l) => n + l.quantity * l.unitPriceXaf, 0);

  return (
    <article className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <h2 className="text-lg font-bold text-foreground">{order.ref ?? "Order"}</h2>
          <p className="text-sm text-muted">
            {kumboTime(order.createdAt)} · {order.city}
          </p>
        </div>
        <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-sm font-semibold ${STATUS_CLASS[order.status]}`}>{STATUS_LABEL[order.status]}</span>
      </div>
      <p className="mt-3 font-medium text-foreground">{STATUS_FOR_CUSTOMER[order.status]}</p>

      {!cancelled && (
        <ol className="mt-4 space-y-0" aria-label="Order progress">
          {JOURNEY.map((step, i) => {
            const done = i <= at;
            const when = reached.get(step);
            return (
              <li key={step} className="relative flex gap-3 pb-4 last:pb-0">
                {i < JOURNEY.length - 1 && (
                  <span aria-hidden="true" className={`absolute top-6 left-[11px] h-[calc(100%-1.25rem)] w-0.5 ${i < at ? "bg-accent" : "bg-border"}`} />
                )}
                <span
                  aria-hidden="true"
                  className={`relative mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold ${
                    done ? "border-accent bg-accent text-white" : "border-border bg-surface text-muted"
                  }`}
                >
                  {done ? "✓" : i + 1}
                </span>
                <span className="min-w-0">
                  <span className={`block font-semibold ${done ? "text-foreground" : "text-muted"}`}>
                    {step === "requested" ? "Received" : STATUS_LABEL[step]}
                    <span className="sr-only">{done ? " (done)" : " (not yet)"}</span>
                  </span>
                  {done && when && <span className="block text-sm text-muted">{kumboTime(when)}</span>}
                </span>
              </li>
            );
          })}
        </ol>
      )}

      <ul className="mt-4 space-y-1 border-t border-dashed border-border pt-3 text-sm">
        {order.lines.map((l) => (
          <li key={l.slug} className="flex justify-between gap-3">
            <span className="min-w-0 [overflow-wrap:anywhere]">
              <span className="tabular-nums">{l.quantity}</span> × {l.name ?? products.find((p) => p.slug === l.slug)?.name ?? "Coffee"}
            </span>
            <span className="shrink-0 tabular-nums">{formatFcfaText(l.quantity * l.unitPriceXaf)}</span>
          </li>
        ))}
        <li className="flex justify-between gap-3 border-t border-border pt-1 font-semibold">
          <span>Coffee total</span>
          <span className="shrink-0 tabular-nums">{formatFcfaText(total)}</span>
        </li>
      </ul>
    </article>
  );
}
