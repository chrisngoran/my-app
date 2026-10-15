// Aggregations used across the cooperative portal. Everything is computed
// from the sample data in src/lib/data.ts and returned in FCFA.
import { farmerPayments, farmers, getProduct, lots, orderTotalXaf, orders, products } from "@/lib/data";
import type { OrderStatus, PaymentMethod } from "@/lib/types";

export const LOW_STOCK_THRESHOLD = 30;

export const ORDER_STATUSES: OrderStatus[] = [
  "Pending payment",
  "Paid",
  "Preparing",
  "Out for delivery",
  "Delivered",
];

export interface SalesRow {
  key: string;
  label: string;
  units: number;
  orders: number;
  totalXaf: number;
}

export function totalSalesXaf() {
  return orders.reduce((sum, o) => sum + orderTotalXaf(o), 0);
}

export function pendingSalesXaf() {
  return orders.filter((o) => o.status === "Pending payment").reduce((sum, o) => sum + orderTotalXaf(o), 0);
}

export function ordersByStatus() {
  return ORDER_STATUSES.map((status) => ({
    status,
    count: orders.filter((o) => o.status === status).length,
  }));
}

/** Product sales from order lines (excludes shipping). */
export function salesByProduct(): SalesRow[] {
  return products
    .map((p) => {
      const lines = orders.flatMap((o) => o.lines.filter((l) => l.productSlug === p.slug));
      return {
        key: p.slug,
        label: p.name,
        units: lines.reduce((n, l) => n + l.quantity, 0),
        orders: orders.filter((o) => o.lines.some((l) => l.productSlug === p.slug)).length,
        totalXaf: lines.reduce((n, l) => n + l.quantity * l.unitPriceXaf, 0),
      };
    })
    .sort((a, b) => b.totalXaf - a.totalXaf);
}

function groupOrders(keyOf: (o: (typeof orders)[number]) => string): SalesRow[] {
  const map = new Map<string, SalesRow>();
  for (const o of orders) {
    const key = keyOf(o);
    const row = map.get(key) ?? { key, label: key, units: 0, orders: 0, totalXaf: 0 };
    row.orders += 1;
    row.units += o.lines.reduce((n, l) => n + l.quantity, 0);
    row.totalXaf += orderTotalXaf(o);
    map.set(key, row);
  }
  return [...map.values()].sort((a, b) => b.totalXaf - a.totalXaf);
}

/** Order totals (incl. shipping) by payment method. */
export function salesByPaymentMethod(): SalesRow[] {
  const methods: PaymentMethod[] = ["MTN MoMo", "Orange Money", "Card"];
  const rows = groupOrders((o) => o.paymentMethod);
  return methods.map(
    (m) => rows.find((r) => r.key === m) ?? { key: m, label: m, units: 0, orders: 0, totalXaf: 0 },
  );
}

/** Order totals (incl. shipping) by delivery city. */
export function salesByCity(): SalesRow[] {
  return groupOrders((o) => o.city);
}

export function farmerTotalPaidXaf(farmerId: string) {
  return farmerPayments.filter((p) => p.farmerId === farmerId).reduce((n, p) => n + p.amountXaf, 0);
}

export function totalFarmerPaymentsXaf() {
  return farmerPayments.reduce((n, p) => n + p.amountXaf, 0);
}

export function paymentsPerFarmer() {
  return farmers
    .map((f) => {
      const records = farmerPayments.filter((p) => p.farmerId === f.id);
      return {
        farmer: f,
        count: records.length,
        totalXaf: records.reduce((n, p) => n + p.amountXaf, 0),
        lastPaidOn: records.map((p) => p.paidOn).sort().at(-1),
      };
    })
    .sort((a, b) => b.totalXaf - a.totalXaf);
}

export function lotsForFarmer(farmerId: string) {
  return lots.filter((l) => l.farmerIds.includes(farmerId));
}

export function stockKg(slug: string) {
  const p = getProduct(slug);
  return p ? (p.stock * p.weightGrams) / 1000 : 0;
}

export function inventoryTotals() {
  return {
    units: products.reduce((n, p) => n + p.stock, 0),
    kg: products.reduce((n, p) => n + (p.stock * p.weightGrams) / 1000, 0),
    valueXaf: products.reduce((n, p) => n + p.stock * p.priceXaf, 0),
    lowStock: products.filter((p) => p.stock < LOW_STOCK_THRESHOLD),
  };
}

export function greenStockKg() {
  return lots.reduce((n, l) => n + l.weightKg, 0);
}

const dateFmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
const dateTimeFmt = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "UTC",
});

/** Deterministic (UTC) date formatting so server and client output match. */
export function formatDate(iso: string) {
  return dateFmt.format(new Date(iso.length === 10 ? `${iso}T00:00:00Z` : iso));
}

export function formatDateTime(iso: string) {
  return `${dateTimeFmt.format(new Date(iso))} UTC`;
}

export function formatNumber(n: number, digits = 0) {
  return n.toLocaleString("en-GB", { maximumFractionDigits: digits });
}
