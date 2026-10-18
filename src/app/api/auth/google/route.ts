import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { callbackUrl, googleAuthUrl, googleClientConfigured, googleSignInConfigured } from "@/lib/google-auth";
import { safeCustomerReturnTo, safeReturnTo } from "@/lib/staff-return";

const STATE_COOKIE = "gv_google_state";

/**
 * Starts "Continue with Google": remembers who is signing in (staff, or a
 * customer with ?as=customer) and where to return, then sends the browser to Google.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const customer = url.searchParams.get("as") === "customer";
  if (customer ? !googleClientConfigured() : !googleSignInConfigured()) {
    return Response.redirect(new URL(customer ? "/account?signin=google-off" : "/admin?signin=google-off", url), 303);
  }
  const state = randomBytes(24).toString("base64url");
  const next = customer ? safeCustomerReturnTo(url.searchParams.get("next")) : safeReturnTo(url.searchParams.get("next"));
  (await cookies()).set(STATE_COOKIE, `${state}|${next}|${customer ? "customer" : "staff"}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/api/auth/google",
    maxAge: 600,
  });
  return Response.redirect(googleAuthUrl(state, callbackUrl(request), customer), 303);
}
