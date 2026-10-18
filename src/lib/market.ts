import "server-only";
import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { db, hasDatabase } from "./db";
import type { Product } from "./types";

/*
 * The farmer marketplace: farmers who sell their own coffee through the
 * cooperative. Staff (and, later, farmers themselves) add coffee; nothing
 * shows in the shop until staff approve it. Orders still come to the
 * cooperative, which delivers and pays each farmer their share.
 */

export type ListingStatus = "pending" | "approved" | "rejected" | "paused";

export interface MarketFarmer {
  id: number;
  name: string;
  village: string;
  phone: string;
  email: string | null;
  story: string;
  active: boolean;
  hasPin: boolean;
}

export interface Listing {
  id: number;
  farmerId: number;
  name: string;
  kind: "roasted" | "green";
  weightGrams: number;
  priceXaf: number;
  stock: number;
  description: string;
  hasImage: boolean;
  imageVersion: string;
  status: ListingStatus;
  note: string;
  updatedAt: Date;
}

export const listingSlug = (id: number) => `l-${id}`;
export const listingIdFromSlug = (slug: string) => (/^l-\d+$/.test(slug) ? Number(slug.slice(2)) : null);


const toFarmer = (r: Record<string, unknown>): MarketFarmer => ({
  id: Number(r.id),
  name: r.name as string,
  village: r.village as string,
  phone: r.phone as string,
  email: (r.email as string | null) ?? null,
  story: r.story as string,
  active: r.active as boolean,
  hasPin: (r.pin_hash as string) !== "",
});

const toListing = (r: Record<string, unknown>): Listing => ({
  id: Number(r.id),
  farmerId: Number(r.farmer_id),
  name: r.name as string,
  kind: r.kind as Listing["kind"],
  weightGrams: Number(r.weight_grams),
  priceXaf: Number(r.price_xaf),
  stock: Number(r.stock),
  description: r.description as string,
  hasImage: !!r.has_image,
  imageVersion: (r.image_version as string) ?? "",
  status: r.status as ListingStatus,
  note: r.note as string,
  updatedAt: new Date(r.updated_at as string),
});

// Every listing query leaves the photo itself out; it is served separately.
const LISTING_COLUMNS =
  "id, farmer_id, name, kind, weight_grams, price_xaf, stock, description, status, note, updated_at, image IS NOT NULL AS has_image, left(md5(coalesce(image, '')), 10) AS image_version";

// ---------------------------------------------------------------------------
// Phone numbers and PINs
// ---------------------------------------------------------------------------

/** "6 81 13 99 79", "+237681139979" and "00237 681..." all become "237681139979". */
export function normalisePhone(raw: string) {
  let d = raw.replace(/\D/g, "");
  if (d.startsWith("00")) d = d.slice(2);
  if (d.length === 9 && d.startsWith("6")) d = `237${d}`;
  return /^\d{9,15}$/.test(d) ? d : null;
}

export const validPin = (pin: string) => /^\d{4,6}$/.test(pin);

export function hashPin(pin: string) {
  const salt = randomBytes(16);
  return `${salt.toString("base64url")}.${scryptSync(pin, salt, 32).toString("base64url")}`;
}

export function pinMatches(pin: string, stored: string) {
  const [salt, hash] = stored.split(".");
  if (!salt || !hash) return false;
  const attempt = scryptSync(pin, Buffer.from(salt, "base64url"), 32);
  const expected = Buffer.from(hash, "base64url");
  return attempt.length === expected.length && timingSafeEqual(attempt, expected);
}

// ---------------------------------------------------------------------------
// Settings
// ---------------------------------------------------------------------------

/** The cooperative's share of each marketplace sale, in percent (0 until staff set it). */
export async function commissionPct(): Promise<number> {
  if (!hasDatabase()) return 0;
  const q = await db();
  const rows = await q`SELECT value FROM settings WHERE key = 'commission_pct'`;
  const v = Number(rows[0]?.value);
  return Number.isFinite(v) && v >= 0 && v <= 50 ? v : 0;
}

export async function setCommissionPct(pct: number) {
  const q = await db();
  await q`INSERT INTO settings (key, value) VALUES ('commission_pct', ${JSON.stringify(pct)}::jsonb)
          ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`;
}

// ---------------------------------------------------------------------------
// Farmers
// ---------------------------------------------------------------------------

export async function allFarmers(): Promise<MarketFarmer[]> {
  if (!hasDatabase()) return [];
  const q = await db();
  return (await q`SELECT * FROM market_farmers ORDER BY name`).map(toFarmer);
}

export async function farmerById(id: number): Promise<MarketFarmer | null> {
  const q = await db();
  const rows = await q`SELECT * FROM market_farmers WHERE id = ${id}`;
  return rows.length ? toFarmer(rows[0]) : null;
}

export async function farmerByPhone(phone: string): Promise<(MarketFarmer & { pinHash: string; locked: boolean }) | null> {
  const q = await db();
  const rows = await q`SELECT *, coalesce(locked_until > now(), false) AS locked FROM market_farmers WHERE phone = ${phone}`;
  return rows.length ? { ...toFarmer(rows[0]), pinHash: rows[0].pin_hash as string, locked: rows[0].locked as boolean } : null;
}

/** Counts a wrong PIN; the fifth in a row locks the account for 15 minutes. */
export async function recordWrongPin(id: number) {
  const q = await db();
  await q`UPDATE market_farmers SET failed_pins = failed_pins + 1,
            locked_until = CASE WHEN failed_pins + 1 >= 5 THEN now() + interval '15 minutes' ELSE locked_until END
          WHERE id = ${id}`;
}

export async function clearWrongPins(id: number) {
  const q = await db();
  await q`UPDATE market_farmers SET failed_pins = 0, locked_until = NULL WHERE id = ${id}`;
}

export async function farmerByEmail(email: string): Promise<MarketFarmer | null> {
  const q = await db();
  const rows = await q`SELECT * FROM market_farmers WHERE lower(email) = ${email.toLowerCase()} AND active`;
  return rows.length ? toFarmer(rows[0]) : null;
}

export async function addFarmer(f: { name: string; village: string; phone: string; pin: string; email: string | null; story: string }) {
  const q = await db();
  const rows = await q`INSERT INTO market_farmers (name, village, phone, pin_hash, email, story)
                       VALUES (${f.name}, ${f.village}, ${f.phone}, ${hashPin(f.pin)}, ${f.email}, ${f.story})
                       ON CONFLICT (phone) DO NOTHING RETURNING id`;
  return rows.length ? Number(rows[0].id) : null;
}

export async function setFarmerPin(id: number, pin: string) {
  const q = await db();
  // A new PIN from staff also lifts any lock from wrong guesses.
  await q`UPDATE market_farmers SET pin_hash = ${hashPin(pin)}, failed_pins = 0, locked_until = NULL WHERE id = ${id}`;
}

export async function setFarmerActive(id: number, active: boolean) {
  const q = await db();
  await q`UPDATE market_farmers SET active = ${active} WHERE id = ${id}`;
}

// ---------------------------------------------------------------------------
// Listings
// ---------------------------------------------------------------------------

export async function allListings(): Promise<Listing[]> {
  if (!hasDatabase()) return [];
  const q = await db();
  return (await q.query(`SELECT ${LISTING_COLUMNS} FROM listings ORDER BY status = 'pending' DESC, updated_at DESC`)).map(toListing);
}

export async function listingsForFarmer(farmerId: number): Promise<Listing[]> {
  const q = await db();
  return (await q.query(`SELECT ${LISTING_COLUMNS} FROM listings WHERE farmer_id = $1 ORDER BY updated_at DESC`, [farmerId])).map(toListing);
}

export async function listingById(id: number): Promise<Listing | null> {
  const q = await db();
  const rows = await q.query(`SELECT ${LISTING_COLUMNS} FROM listings WHERE id = $1`, [id]);
  return rows.length ? toListing(rows[0]) : null;
}

/** A listing's photo. Only approved coffee is public; staff and the farmer may see any of theirs. */
export async function listingImage(id: number, anyStatus = false, farmerId?: number) {
  const q = await db();
  const rows = anyStatus
    ? farmerId
      ? await q`SELECT image FROM listings WHERE id = ${id} AND farmer_id = ${farmerId}`
      : await q`SELECT image FROM listings WHERE id = ${id}`
    : await q`SELECT image FROM listings WHERE id = ${id} AND status = 'approved'`;
  const m = (rows[0]?.image as string | undefined)?.match(/^data:(image\/(?:jpeg|png|webp));base64,(.+)$/);
  return m ? { type: m[1], bytes: Buffer.from(m[2], "base64") } : null;
}

export interface ListingInput {
  name: string;
  kind: "roasted" | "green";
  weightGrams: number;
  priceXaf: number;
  stock: number;
  description: string;
  /** A new photo as a data URL; undefined keeps the current one. */
  image?: string;
}

export async function addListing(farmerId: number, l: ListingInput, status: ListingStatus) {
  const q = await db();
  const rows = await q`INSERT INTO listings (farmer_id, name, kind, weight_grams, price_xaf, stock, description, image, status)
                       VALUES (${farmerId}, ${l.name}, ${l.kind}, ${l.weightGrams}, ${l.priceXaf}, ${l.stock}, ${l.description}, ${l.image ?? null}, ${status})
                       RETURNING id`;
  return Number(rows[0].id);
}

export async function updateListing(id: number, l: ListingInput, status: ListingStatus) {
  const q = await db();
  await q`UPDATE listings SET name = ${l.name}, kind = ${l.kind}, weight_grams = ${l.weightGrams}, price_xaf = ${l.priceXaf},
            stock = ${l.stock}, description = ${l.description}, image = coalesce(${l.image ?? null}, image),
            status = ${status}, note = '', updated_at = now()
          WHERE id = ${id}`;
}

export async function setListingStatus(id: number, status: ListingStatus, note = "") {
  const q = await db();
  await q`UPDATE listings SET status = ${status}, note = ${note}, updated_at = now() WHERE id = ${id}`;
}

/** A farmer changes how many bags are available. It stays on sale if it was. */
export async function setListingStock(id: number, farmerId: number, stock: number) {
  const q = await db();
  const rows = await q`UPDATE listings SET stock = ${stock}, updated_at = now() WHERE id = ${id} AND farmer_id = ${farmerId} RETURNING id`;
  return rows.length > 0;
}

export interface FarmerSale {
  orderId: number;
  ref: string | null;
  status: string;
  createdAt: Date;
  name: string;
  quantity: number;
  lineXaf: number;
  /** What the farmer is owed for this line, after the cooperative's share at the time of sale. */
  owedXaf: number;
}

/** A farmer's coffee in orders that were confirmed or went further, newest first. */
export async function salesForFarmer(farmerId: number): Promise<FarmerSale[]> {
  const q = await db();
  const rows = await q`SELECT id, ref, status, created_at, lines FROM orders
                       WHERE status IN ('confirmed', 'packed', 'shipped', 'delivered')
                         AND lines @> ${JSON.stringify([{ farmerId }])}::jsonb
                       ORDER BY created_at DESC LIMIT 200`;
  return rows.flatMap((r) =>
    (r.lines as { slug: string; name?: string; quantity: number; unitPriceXaf: number; farmerId?: number; commissionPct?: number }[])
      .filter((l) => l.farmerId === farmerId)
      .map((l) => {
        const lineXaf = l.quantity * l.unitPriceXaf;
        return {
          orderId: Number(r.id),
          ref: (r.ref as string | null) ?? null,
          status: r.status as string,
          createdAt: new Date(r.created_at as string),
          name: l.name ?? "Coffee",
          quantity: l.quantity,
          lineXaf,
          owedXaf: Math.round(lineXaf * (1 - (l.commissionPct ?? 0) / 100)),
        };
      }),
  );
}

export async function adjustListingStock(id: number, delta: number) {
  const q = await db();
  await q`UPDATE listings SET stock = greatest(0, stock + ${delta}) WHERE id = ${id}`;
}

/** Approved coffee from active farmers, shaped like the cooperative's own products. */
export async function countPendingListings(): Promise<number> {
  if (!hasDatabase()) return 0;
  const q = await db();
  return Number((await q`SELECT count(*)::int AS n FROM listings WHERE status = 'pending'`)[0]?.n ?? 0);
}

export async function marketProducts(): Promise<Product[]> {
  if (!hasDatabase()) return [];
  const q = await db();
  const rows = await q.query(
    `SELECT l.id, l.farmer_id, l.name, l.kind, l.weight_grams, l.price_xaf, l.stock, l.description, l.status, l.note, l.updated_at,
            l.image IS NOT NULL AS has_image, left(md5(coalesce(l.image, '')), 10) AS image_version,
            f.name AS farmer_name, f.village AS farmer_village
     FROM listings l JOIN market_farmers f ON f.id = l.farmer_id
     WHERE l.status = 'approved' AND f.active ORDER BY l.updated_at DESC`,
  );
  return rows.map((r) => toProduct(toListing(r), { id: Number(r.farmer_id), name: r.farmer_name as string, village: r.farmer_village as string }));
}

export function toProduct(l: Listing, seller: { id: number; name: string; village: string }): Product {
  return {
    slug: listingSlug(l.id),
    name: l.name,
    category: l.kind === "green" ? "green" : "roasted",
    priceXaf: l.priceXaf,
    weightGrams: l.weightGrams,
    lotCode: "",
    cuppingNotes: [],
    description: l.description,
    stock: l.stock,
    image: l.hasImage ? `/api/listing-image/${l.id}?v=${l.imageVersion}` : "/products/green.jpg",
    seller,
  };
}
