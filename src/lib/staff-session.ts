import "server-only";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

/*
 * Staff sign-in for the pages that show real orders. There is one shared
 * staff password, set as STAFF_PASSWORD in Vercel. Signing in stores a signed
 * cookie the browser cannot read or change; it lasts 7 days. Changing the
 * password signs everyone out. The same sign-in opens the admin and the
 * portal pages that show real orders.
 */

export const STAFF_COOKIE = "gv_staff";
const MAX_AGE_S = 7 * 24 * 60 * 60;

const password = () => process.env.STAFF_PASSWORD ?? "";
export const staffPasswordSet = () => password().length >= 8;

function key() {
  return process.env.SESSION_SECRET || createHash("sha256").update(`gv-staff-session:${password()}`).digest("hex");
}

const sign = (exp: string) => createHmac("sha256", key()).update(exp).digest("base64url");

function same(a: string, b: string) {
  const x = createHash("sha256").update(a).digest();
  const y = createHash("sha256").update(b).digest();
  return timingSafeEqual(x, y);
}

export function passwordMatches(attempt: string) {
  return staffPasswordSet() && same(attempt, password());
}

export async function startStaffSession() {
  const exp = String(Date.now() + MAX_AGE_S * 1000);
  (await cookies()).set(STAFF_COOKIE, `${exp}.${sign(exp)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    // The whole site, so both the portal and the admin see it.
    path: "/",
    maxAge: MAX_AGE_S,
  });
}

export async function endStaffSession() {
  const jar = await cookies();
  jar.delete({ name: STAFF_COOKIE, path: "/" });
  // Sign-ins from before the admin used it were limited to the portal.
  jar.delete({ name: STAFF_COOKIE, path: "/portal" });
}

export async function isStaff() {
  if (!staffPasswordSet()) return false;
  const value = (await cookies()).get(STAFF_COOKIE)?.value;
  if (!value) return false;
  const [exp, mac] = value.split(".");
  if (!exp || !mac || !same(mac, sign(exp))) return false;
  return Number(exp) > Date.now();
}
