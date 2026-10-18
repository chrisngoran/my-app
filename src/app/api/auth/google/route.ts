import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { callbackUrl, googleAuthUrl, googleSignInConfigured } from "@/lib/google-auth";
import { safeReturnTo } from "@/lib/staff-return";

const STATE_COOKIE = "gv_google_state";

/** Starts "Continue with Google": remembers where to return, then sends the browser to Google. */
export async function GET(request: Request) {
  const url = new URL(request.url);
  if (!googleSignInConfigured()) return Response.redirect(new URL("/admin?signin=google-off", url), 303);
  const state = randomBytes(24).toString("base64url");
  const next = safeReturnTo(url.searchParams.get("next"));
  (await cookies()).set(STATE_COOKIE, `${state}|${next}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/api/auth/google",
    maxAge: 600,
  });
  return Response.redirect(googleAuthUrl(state, callbackUrl(request)), 303);
}
