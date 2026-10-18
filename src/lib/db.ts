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
}

export type OrderStatus = "requested" | "confirmed" | "cancelled";

export interface OrderRow {
  id: number;
  ref: string | null;
  status: OrderStatus;
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

export async function insertOrder(o: { ref: string | null; city: string; market: OrderRow["market"]; lines: OrderLine[] }) {
  if (!sql) return;
  const q = await db();
  const subtotal = o.lines.reduce((n, l) => n + l.quantity * l.unitPriceXaf, 0);
  await q`INSERT INTO orders (ref, city, market, lines, subtotal_xaf)
          VALUES (${o.ref}, ${o.city}, ${o.market}, ${JSON.stringify(o.lines)}::jsonb, ${subtotal})`;
}

function toRow(r: Record<string, unknown>): OrderRow {
  return {
    id: Number(r.id),
    ref: (r.ref as string | null) ?? null,
    status: r.status as OrderStatus,
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
  const rows = await q`SELECT id, ref, status, created_at, city, market, lines FROM orders
                       WHERE created_at > now() - make_interval(days => ${days}) AND status <> 'cancelled'
                       ORDER BY created_at`;
  return rows.map(toRow);
}

/** The latest orders of every status, newest first. */
export async function latestOrders(limit: number): Promise<OrderRow[]> {
  if (!sql) return [];
  const q = await db();
  const rows = await q`SELECT id, ref, status, created_at, city, market, lines FROM orders
                       ORDER BY created_at DESC LIMIT ${limit}`;
  return rows.map(toRow);
}

/**
 * Moves an order from one status to another. Returns its lines when it moved,
 * or null when it was not in the `from` status (e.g. a second tap).
 */
export async function moveOrder(id: number, from: OrderStatus[], to: OrderStatus) {
  const q = await db();
  const rows = await q`WITH old AS (SELECT id, status FROM orders WHERE id = ${id} AND status = ANY(${from}::text[]) FOR UPDATE)
                       UPDATE orders o SET status = ${to} FROM old WHERE o.id = old.id
                       RETURNING old.status AS was, o.lines`;
  return rows.length ? { was: rows[0].was as OrderStatus, lines: rows[0].lines as OrderLine[] } : null;
}

/** Deletes an order. Returns its status and lines, or null if it was already gone. */
export async function deleteOrder(id: number) {
  const q = await db();
  const rows = await q`DELETE FROM orders WHERE id = ${id} RETURNING status, lines`;
  return rows.length ? { was: rows[0].status as OrderStatus, lines: rows[0].lines as OrderLine[] } : null;
}
