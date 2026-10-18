import "server-only";
import { neon } from "@neondatabase/serverless";

/*
 * The orders database (Neon Postgres, created from Vercel → Storage). Each
 * order request a buyer sends on WhatsApp is stored here, so the staff
 * dashboard shows real figures. Only what the dashboard needs is kept: the
 * town, the delivery choice and the coffees. No names or phone numbers.
 *
 * With no DATABASE_URL set, nothing is stored and the dashboard shows the
 * sample data instead.
 */

const url = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;
const sql = url ? neon(url) : null;

export const hasDatabase = () => sql !== null;

export interface OrderLine {
  slug: string;
  quantity: number;
  unitPriceXaf: number;
  /** The coffee's name when it was ordered (orders from before this was stored have none). */
  name?: string;
  /** Marketplace lines: the farmer who sells it, and the cooperative's share at the time of sale. */
  farmerId?: number;
  commissionPct?: number;
}

/** An order's journey: requested (sent on WhatsApp) → confirmed (paid, bags taken from stock) → packed → shipped → delivered; or cancelled. */
export type OrderStatus = "requested" | "confirmed" | "packed" | "shipped" | "delivered" | "cancelled";

/** Statuses in which the bags have left stock. */
export const OUT_OF_STOCK: OrderStatus[] = ["confirmed", "packed", "shipped", "delivered"];

export interface OrderRow {
  id: number;
  ref: string | null;
  status: OrderStatus;
  /** When each status was reached, oldest first. */
  history: { status: OrderStatus; at: string }[];
  /** The signed-in customer who placed it, if any. */
  customerId: number | null;
  createdAt: Date;
  city: string;
  market: "cameroon" | "abroad";
  lines: OrderLine[];
}

let ready: Promise<unknown> | null = null;

/** Creates the tables the first time they are needed, and adds columns from later versions. */
export function ensureTables() {
  if (!sql) throw new Error("No database configured");
  const db = sql;
  ready ??= (async () => {
    await db`
      CREATE TABLE IF NOT EXISTS orders (
        id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        created_at  timestamptz NOT NULL DEFAULT now(),
        city        text NOT NULL,
        market      text NOT NULL CHECK (market IN ('cameroon', 'abroad')),
        lines       jsonb NOT NULL,
        subtotal_xaf integer NOT NULL
      )`;
    await db`ALTER TABLE orders ADD COLUMN IF NOT EXISTS ref text`;
    await db`ALTER TABLE orders ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'requested'`;
    await db`ALTER TABLE orders ADD COLUMN IF NOT EXISTS history jsonb NOT NULL DEFAULT '[]'::jsonb`;
    await db`ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_id bigint`;
    await db`CREATE INDEX IF NOT EXISTS orders_ref ON orders (ref)`;
    await db`CREATE INDEX IF NOT EXISTS orders_customer ON orders (customer_id)`;
    // Customers who signed in with Google, so they can follow their orders.
    await db`
      CREATE TABLE IF NOT EXISTS customers (
        id         bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        email      text NOT NULL UNIQUE,
        name       text NOT NULL DEFAULT '',
        created_at timestamptz NOT NULL DEFAULT now()
      )`;
    // Star ratings from customers who bought the coffee; one per customer per coffee.
    await db`
      CREATE TABLE IF NOT EXISTS reviews (
        id           bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        product_slug text NOT NULL,
        customer_id  bigint NOT NULL,
        rating       smallint NOT NULL CHECK (rating BETWEEN 1 AND 5),
        body         text NOT NULL DEFAULT '',
        hidden       boolean NOT NULL DEFAULT false,
        created_at   timestamptz NOT NULL DEFAULT now(),
        updated_at   timestamptz NOT NULL DEFAULT now(),
        UNIQUE (product_slug, customer_id)
      )`;
    // The farmer marketplace: farmers who sell through the cooperative, and their coffee.
    await db`
      CREATE TABLE IF NOT EXISTS market_farmers (
        id         bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        name       text NOT NULL,
        village    text NOT NULL DEFAULT '',
        phone      text NOT NULL UNIQUE,
        pin_hash   text NOT NULL DEFAULT '',
        email      text,
        story      text NOT NULL DEFAULT '',
        active     boolean NOT NULL DEFAULT true,
        created_at timestamptz NOT NULL DEFAULT now()
      )`;
    await db`ALTER TABLE market_farmers ADD COLUMN IF NOT EXISTS failed_pins integer NOT NULL DEFAULT 0`;
    await db`ALTER TABLE market_farmers ADD COLUMN IF NOT EXISTS locked_until timestamptz`;
    await db`
      CREATE TABLE IF NOT EXISTS listings (
        id           bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        farmer_id    bigint NOT NULL,
        name         text NOT NULL,
        kind         text NOT NULL CHECK (kind IN ('roasted', 'green')),
        weight_grams integer NOT NULL,
        price_xaf    integer NOT NULL,
        stock        integer NOT NULL DEFAULT 0,
        description  text NOT NULL DEFAULT '',
        image        text,
        status       text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'paused')),
        note         text NOT NULL DEFAULT '',
        created_at   timestamptz NOT NULL DEFAULT now(),
        updated_at   timestamptz NOT NULL DEFAULT now()
      )`;
    await db`CREATE TABLE IF NOT EXISTS settings (key text PRIMARY KEY, value jsonb NOT NULL)`;
    // Money the cooperative has paid each farmer for their marketplace sales.
    await db`
      CREATE TABLE IF NOT EXISTS farmer_payouts (
        id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        farmer_id   bigint NOT NULL,
        amount_xaf  integer NOT NULL CHECK (amount_xaf > 0),
        method      text NOT NULL,
        reference   text NOT NULL DEFAULT '',
        note        text NOT NULL DEFAULT '',
        recorded_by text NOT NULL DEFAULT '',
        paid_at     timestamptz NOT NULL DEFAULT now()
      )`;
    // One row (id 1) holding the staff's product, lot and farmer edits.
    await db`
      CREATE TABLE IF NOT EXISTS catalog (
        id         smallint PRIMARY KEY,
        data       jsonb NOT NULL,
        updated_at timestamptz NOT NULL DEFAULT now()
      )`;
  })().catch((e) => {
    ready = null;
    throw e;
  });
  return ready;
}

/** The database client, after the tables exist. Only call when hasDatabase() is true. */
export async function db() {
  await ensureTables();
  return sql!;
}

export async function insertOrder(o: {
  ref: string | null;
  city: string;
  market: OrderRow["market"];
  lines: OrderLine[];
  customerId: number | null;
}) {
  if (!sql) return;
  const q = await db();
  const subtotal = o.lines.reduce((n, l) => n + l.quantity * l.unitPriceXaf, 0);
  const history = JSON.stringify([{ status: "requested", at: new Date().toISOString() }]);
  await q`INSERT INTO orders (ref, city, market, lines, subtotal_xaf, history, customer_id)
          VALUES (${o.ref}, ${o.city}, ${o.market}, ${JSON.stringify(o.lines)}::jsonb, ${subtotal}, ${history}::jsonb, ${o.customerId})`;
}

const COLUMNS = "id, ref, status, history, customer_id, created_at, city, market, lines";

function toRow(r: Record<string, unknown>): OrderRow {
  return {
    id: Number(r.id),
    ref: (r.ref as string | null) ?? null,
    status: r.status as OrderStatus,
    history: Array.isArray(r.history) ? (r.history as OrderRow["history"]) : [],
    customerId: r.customer_id == null ? null : Number(r.customer_id),
    createdAt: new Date(r.created_at as string),
    city: r.city as string,
    market: r.market as OrderRow["market"],
    lines: r.lines as OrderLine[],
  };
}

/** Orders from the last `days` days that were not cancelled, oldest first. */
export async function recentOrders(days: number): Promise<OrderRow[]> {
  if (!sql) return [];
  const q = await db();
  const rows = await q.query(
    `SELECT ${COLUMNS} FROM orders WHERE created_at > now() - make_interval(days => $1) AND status <> 'cancelled' ORDER BY created_at`,
    [days],
  );
  return rows.map(toRow);
}

/** How many orders are waiting for staff to confirm or cancel. */
export async function countWaitingOrders(): Promise<number> {
  if (!sql) return 0;
  const q = await db();
  const rows = await q`SELECT count(*)::int AS n FROM orders WHERE status = 'requested'`;
  return Number(rows[0]?.n ?? 0);
}

/** The latest orders of every status, newest first. */
export async function latestOrders(limit: number): Promise<OrderRow[]> {
  if (!sql) return [];
  const q = await db();
  const rows = await q.query(`SELECT ${COLUMNS} FROM orders ORDER BY created_at DESC LIMIT $1`, [limit]);
  return rows.map(toRow);
}

/** One order by its reference (e.g. GV-7K3PQ), for "Track my order". */
export async function orderByRef(ref: string): Promise<OrderRow | null> {
  if (!sql) return null;
  const q = await db();
  const rows = await q.query(`SELECT ${COLUMNS} FROM orders WHERE ref = $1 ORDER BY created_at DESC LIMIT 1`, [ref]);
  return rows.length ? toRow(rows[0]) : null;
}

/** A customer's orders, newest first. */
export async function ordersForCustomer(customerId: number): Promise<OrderRow[]> {
  if (!sql) return [];
  const q = await db();
  const rows = await q.query(`SELECT ${COLUMNS} FROM orders WHERE customer_id = $1 ORDER BY created_at DESC LIMIT 100`, [customerId]);
  return rows.map(toRow);
}

/** Finds or adds the customer with this Google email; returns their id. */
export async function upsertCustomer(email: string, name: string): Promise<number> {
  const q = await db();
  const rows = await q`INSERT INTO customers (email, name) VALUES (${email}, ${name})
                       ON CONFLICT (email) DO UPDATE SET name = CASE WHEN EXCLUDED.name <> '' THEN EXCLUDED.name ELSE customers.name END
                       RETURNING id`;
  return Number(rows[0].id);
}

export async function customerById(id: number): Promise<{ email: string; name: string } | null> {
  return (await customersById([id])).get(id) ?? null;
}

/** Emails and names of the customers behind these orders, for the staff orders page. */
export async function customersById(ids: number[]): Promise<Map<number, { email: string; name: string }>> {
  const out = new Map<number, { email: string; name: string }>();
  if (!sql || ids.length === 0) return out;
  const q = await db();
  const rows = await q`SELECT id, email, name FROM customers WHERE id = ANY(${ids}::bigint[])`;
  for (const r of rows) out.set(Number(r.id), { email: r.email as string, name: r.name as string });
  return out;
}

/**
 * Moves an order from one status to another. Returns its lines when it moved,
 * or null when it was not in the `from` status (e.g. a second tap).
 */
export async function moveOrder(id: number, from: OrderStatus[], to: OrderStatus) {
  const q = await db();
  const rows = await q`WITH old AS (SELECT id, status FROM orders WHERE id = ${id} AND status = ANY(${from}::text[]) FOR UPDATE)
                       UPDATE orders o SET status = ${to},
                         history = o.history || jsonb_build_array(jsonb_build_object('status', ${to}::text, 'at', now()))
                       FROM old WHERE o.id = old.id
                       RETURNING old.status AS was, o.lines`;
  return rows.length ? { was: rows[0].was as OrderStatus, lines: rows[0].lines as OrderLine[] } : null;
}

/** Deletes an order. Returns its status and lines, or null if it was already gone. */
export async function deleteOrder(id: number) {
  const q = await db();
  const rows = await q`DELETE FROM orders WHERE id = ${id} RETURNING status, lines`;
  return rows.length ? { was: rows[0].status as OrderStatus, lines: rows[0].lines as OrderLine[] } : null;
}

export interface ReviewRow {
  id: number;
  productSlug: string;
  customerId: number;
  rating: number;
  body: string;
  hidden: boolean;
  updatedAt: Date;
  /** The reviewer's name as Google gave it (shown shortened). */
  name: string;
  email: string;
}

const toReview = (r: Record<string, unknown>): ReviewRow => ({
  id: Number(r.id),
  productSlug: r.product_slug as string,
  customerId: Number(r.customer_id),
  rating: Number(r.rating),
  body: r.body as string,
  hidden: r.hidden as boolean,
  updatedAt: new Date(r.updated_at as string),
  name: (r.name as string) ?? "",
  email: (r.email as string) ?? "",
});

/** Visible reviews of one coffee, newest first. */
export async function reviewsFor(slug: string): Promise<ReviewRow[]> {
  if (!sql) return [];
  const q = await db();
  const rows = await q`SELECT r.*, c.name, c.email FROM reviews r JOIN customers c ON c.id = r.customer_id
                       WHERE r.product_slug = ${slug} AND NOT r.hidden ORDER BY r.updated_at DESC LIMIT 50`;
  return rows.map(toReview);
}

/** Every review, newest first, for staff. */
export async function allReviews(): Promise<ReviewRow[]> {
  if (!sql) return [];
  const q = await db();
  const rows = await q`SELECT r.*, c.name, c.email FROM reviews r JOIN customers c ON c.id = r.customer_id
                       ORDER BY r.updated_at DESC LIMIT 300`;
  return rows.map(toReview);
}

/** Average stars and count of visible reviews, per coffee. */
export async function ratingSummary(): Promise<Record<string, { average: number; count: number }>> {
  if (!sql) return {};
  const q = await db();
  const rows = await q`SELECT product_slug, avg(rating)::float AS average, count(*)::int AS n
                       FROM reviews WHERE NOT hidden GROUP BY product_slug`;
  return Object.fromEntries(rows.map((r) => [r.product_slug as string, { average: Number(r.average), count: Number(r.n) }]));
}

/** True when this customer has a confirmed (or later) order that includes this coffee. */
export async function hasBought(customerId: number, slug: string): Promise<boolean> {
  const q = await db();
  const rows = await q`SELECT 1 FROM orders WHERE customer_id = ${customerId} AND status = ANY(${OUT_OF_STOCK}::text[])
                       AND lines @> ${JSON.stringify([{ slug }])}::jsonb LIMIT 1`;
  return rows.length > 0;
}

export async function myReview(customerId: number, slug: string): Promise<{ rating: number; body: string } | null> {
  const q = await db();
  const rows = await q`SELECT rating, body FROM reviews WHERE customer_id = ${customerId} AND product_slug = ${slug}`;
  return rows.length ? { rating: Number(rows[0].rating), body: rows[0].body as string } : null;
}

export async function saveReview(customerId: number, slug: string, rating: number, body: string) {
  const q = await db();
  await q`INSERT INTO reviews (product_slug, customer_id, rating, body) VALUES (${slug}, ${customerId}, ${rating}, ${body})
          ON CONFLICT (product_slug, customer_id) DO UPDATE SET rating = EXCLUDED.rating, body = EXCLUDED.body, updated_at = now()`;
}

export async function setReviewHidden(id: number, hidden: boolean) {
  const q = await db();
  await q`UPDATE reviews SET hidden = ${hidden} WHERE id = ${id}`;
}
