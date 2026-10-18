import "server-only";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { connection } from "next/server";

/*
 * Staff sign-in for the admin and the portal pages that show real orders.
 * Two ways in: the shared staff password (STAFF_PASSWORD in Vercel), or a
 * Google account on the staff list (see google-auth.ts). Signing in stores a
 * signed cookie the browser cannot read or change; it lasts 7 days. Changing
 * the password (or SESSION_SECRET) signs everyone out.
 */

export const STAFF_COOKIE = "gv_staff";
const MAX_AGE_S = 7 * 24 * 60 * 60;

const password = () => process.env.STAFF_PASSWORD ?? "";
export const staffPasswordSet = () => password().length >= 8;
const googleSecret = () => process.env.GOOGLE_CLIENT_SECRET ?? "";

/** True when at least one way of signing in is set up. */
export const staffSignInConfigured = () => staffPasswordSet() || (googleSecret() !== "" && (process.env.STAFF_EMAILS ?? "").trim() !== "");

function key() {
  return process.env.SESSION_SECRET || createHash("sha256").update(`gv-staff-session:${password()}:${googleSecret()}`).digest("hex");
}

const sign = (payload: string) => createHmac("sha256", key()).update(payload).digest("base64url");

function same(a: string, b: string) {
  const x = createHash("sha256").update(a).digest();
  const y = createHash("sha256").update(b).digest();
  return timingSafeEqual(x, y);
}

export function passwordMatches(attempt: string) {
  return staffPasswordSet() && same(attempt, password());
}

/** Signs this browser in. `email` is the Google account used, or empty for the staff password. */
export async function startStaffSession(email = "") {
  const payload = `${Date.now() + MAX_AGE_S * 1000}.${Buffer.from(email).toString("base64url")}`;
  (await cookies()).set(STAFF_COOKIE, `${payload}.${sign(payload)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    // The whole site, so both the portal and the admin see it.
    path: "/",
    maxAge: MAX_AGE_S,
  });
}

export async function endStaffSession() {
  // One delete only: a second one for another path would replace this one in the response.
  // Older portal-only cookies are in a format isStaff() no longer accepts.
  (await cookies()).delete({ name: STAFF_COOKIE, path: "/" });
}

/** The signed-in staff member: `{ email }` (empty for the staff password), or null when signed out. */
export async function staffSession(): Promise<{ email: string } | null> {
  if (!staffSignInConfigured()) return null;
  // Signed-in pages are made per visit, never prepared ahead: the expiry check reads the clock.
  await connection();
  const value = (await cookies()).get(STAFF_COOKIE)?.value;
  if (!value) return null;
  const [exp, email, mac] = value.split(".");
  if (!exp || email === undefined || !mac || !same(mac, sign(`${exp}.${email}`))) return null;
  if (!(Number(exp) > Date.now())) return null;
  return { email: Buffer.from(email, "base64url").toString() };
}

export async function isStaff() {
  return (await staffSession()) !== null;
}
