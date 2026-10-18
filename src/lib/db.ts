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

export interface OrderRow {
  createdAt: Date;
  city: string;
  market: "cameroon" | "abroad";
  lines: OrderLine[];
}

let ready: Promise<unknown> | null = null;

/** Creates the table the first time it is needed. */
function ensureTable() {
  if (!sql) throw new Error("No database configured");
  ready ??= sql`
    CREATE TABLE IF NOT EXISTS orders (
      id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      created_at  timestamptz NOT NULL DEFAULT now(),
      city        text NOT NULL,
      market      text NOT NULL CHECK (market IN ('cameroon', 'abroad')),
      lines       jsonb NOT NULL,
      subtotal_xaf integer NOT NULL
    )`.catch((e) => {
    ready = null;
    throw e;
  });
  return ready;
}

export async function insertOrder(o: Omit<OrderRow, "createdAt">) {
  if (!sql) return;
  await ensureTable();
  const subtotal = o.lines.reduce((n, l) => n + l.quantity * l.unitPriceXaf, 0);
  await sql`INSERT INTO orders (city, market, lines, subtotal_xaf)
            VALUES (${o.city}, ${o.market}, ${JSON.stringify(o.lines)}::jsonb, ${subtotal})`;
}

/** Orders from the last `days` days, oldest first. */
export async function recentOrders(days: number): Promise<OrderRow[]> {
  if (!sql) return [];
  await ensureTable();
  const rows = await sql`SELECT created_at, city, market, lines FROM orders
                         WHERE created_at > now() - make_interval(days => ${days})
                         ORDER BY created_at`;
  return rows.map((r) => ({
    createdAt: new Date(r.created_at as string),
    city: r.city as string,
    market: r.market as OrderRow["market"],
    lines: r.lines as OrderLine[],
  }));
}
