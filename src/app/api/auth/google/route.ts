import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { callbackUrl, googleAuthUrl, googleClientConfigured, googleSignInConfigured } from "@/lib/google-auth";
import { safeCustomerReturnTo, safeReturnTo } from "@/lib/staff-return";

const STATE_COOKIE = "gv_google_state";
/** Where each kind of sign-in starts, for sending people back with a reason. */
const HOME = { staff: "/admin", customer: "/account", farmer: "/farmer" } as const;

/**
 * Starts "Continue with Google": remembers who is signing in (staff, or
 * ?as=customer / ?as=farmer) and where to return, then sends the browser to Google.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const as = url.searchParams.get("as");
  const who = as === "customer" || as === "farmer" ? as : "staff";
  const ready = who === "staff" ? googleSignInConfigured() : googleClientConfigured();
  if (!ready) return Response.redirect(new URL(`${HOME[who]}?signin=google-off`, url), 303);
  const state = randomBytes(24).toString("base64url");
  const next = who === "customer" ? safeCustomerReturnTo(url.searchParams.get("next")) : who === "farmer" ? "/farmer" : safeReturnTo(url.searchParams.get("next"));
  (await cookies()).set(STATE_COOKIE, `${state}|${next}|${who}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/api/auth/google",
    maxAge: 600,
  });
  return Response.redirect(googleAuthUrl(state, callbackUrl(request), who === "customer"), 303);
}
