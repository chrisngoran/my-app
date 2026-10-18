import "server-only";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { connection } from "next/server";

/*
 * Farmer sign-in, for member farmers who sell through the marketplace: phone
 * number and PIN (set by staff), or Google for farmers with a Gmail on file.
 * Its own cookie and signing key, apart from staff and customers. Lasts 30 days.
 */

const COOKIE = "gv_farmer";
const MAX_AGE_S = 30 * 24 * 60 * 60;

function key() {
  const base = process.env.SESSION_SECRET || `${process.env.STAFF_PASSWORD ?? ""}:${process.env.GOOGLE_CLIENT_SECRET ?? ""}:${process.env.DATABASE_URL ?? ""}`;
  return createHash("sha256").update(`gv-farmer-session:${base}`).digest("hex");
}

const sign = (payload: string) => createHmac("sha256", key()).update(payload).digest("base64url");
const same = (a: string, b: string) =>
  timingSafeEqual(createHash("sha256").update(a).digest(), createHash("sha256").update(b).digest());

export async function startFarmerSession(id: number) {
  const payload = `${Date.now() + MAX_AGE_S * 1000}.${id}`;
  (await cookies()).set(COOKIE, `${payload}.${sign(payload)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_S,
  });
}

export async function endFarmerSession() {
  (await cookies()).delete({ name: COOKIE, path: "/" });
}

/** The signed-in farmer's id, or null. */
export async function farmerId(): Promise<number | null> {
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
