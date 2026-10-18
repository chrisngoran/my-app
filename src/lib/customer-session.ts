import "server-only";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { connection } from "next/server";

/*
 * Customer sign-in (Google only), so buyers can follow their orders. Kept
 * apart from the staff sign-in: its own cookie and its own signing key, so a
 * customer cookie can never open a staff page. Lasts 30 days.
 */

const COOKIE = "gv_customer";
const MAX_AGE_S = 30 * 24 * 60 * 60;

function key() {
  const base = process.env.SESSION_SECRET || `${process.env.GOOGLE_CLIENT_SECRET ?? ""}:${process.env.STAFF_PASSWORD ?? ""}`;
  return createHash("sha256").update(`gv-customer-session:${base}`).digest("hex");
}

const sign = (payload: string) => createHmac("sha256", key()).update(payload).digest("base64url");
const same = (a: string, b: string) =>
  timingSafeEqual(createHash("sha256").update(a).digest(), createHash("sha256").update(b).digest());

export async function startCustomerSession(id: number) {
  const payload = `${Date.now() + MAX_AGE_S * 1000}.${id}`;
  (await cookies()).set(COOKIE, `${payload}.${sign(payload)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_S,
  });
}

export async function endCustomerSession() {
  (await cookies()).delete({ name: COOKIE, path: "/" });
}

/** The signed-in customer's id, or null. */
export async function customerId(): Promise<number | null> {
  if (!process.env.GOOGLE_CLIENT_SECRET) return null;
  // Read per visit, never prepared ahead: the expiry check reads the clock.
  await connection();
  const value = (await cookies()).get(COOKIE)?.value;
  if (!value) return null;
  const [exp, id, mac] = value.split(".");
  if (!exp || !id || !mac || !same(mac, sign(`${exp}.${id}`))) return null;
  if (!(Number(exp) > Date.now())) return null;
  const n = Number(id);
  return Number.isSafeInteger(n) && n > 0 ? n : null;
}
