import type { OrderStatus } from "./db";

/** The steps an order goes through, in order. Cancelled sits outside them. */
export const JOURNEY: OrderStatus[] = ["requested", "confirmed", "packed", "shipped", "delivered"];

export const STATUS_LABEL: Record<OrderStatus, string> = {
  requested: "Waiting",
  confirmed: "Confirmed",
  packed: "Packed",
  shipped: "On the way",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

/** What each step means, in the customer's words. */
export const STATUS_FOR_CUSTOMER: Record<OrderStatus, string> = {
  requested: "Order received. We will confirm it on WhatsApp.",
  confirmed: "Confirmed and paid. Your coffee is set aside.",
  packed: "Packed and ready to go.",
  shipped: "On the way to you.",
  delivered: "Delivered. Enjoy your coffee!",
  cancelled: "This order was cancelled.",
};

export const STATUS_CLASS: Record<OrderStatus, string> = {
  requested: "bg-warm/15 text-warm",
  confirmed: "bg-accent-soft text-accent",
  packed: "bg-accent-soft text-accent",
  shipped: "bg-accent-soft text-accent",
  delivered: "bg-accent text-white",
  cancelled: "bg-border/60 text-muted",
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "18 Oct 2026, 14:05" in Kumbo time (UTC+1 all year), written out by hand so server and browser agree. */
export function kumboTime(iso: string | Date) {
  const t = new Date(new Date(iso).getTime() + 3_600_000);
  const hh = String(t.getUTCHours()).padStart(2, "0");
  const mm = String(t.getUTCMinutes()).padStart(2, "0");
  return `${t.getUTCDate()} ${MONTHS[t.getUTCMonth()]} ${t.getUTCFullYear()}, ${hh}:${mm}`;
}
