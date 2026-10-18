import { cookies } from "next/headers";
import { callbackUrl, googleSignInConfigured, staffEmails, verifiedEmail } from "@/lib/google-auth";
import { startStaffSession } from "@/lib/staff-session";

const STATE_COOKIE = "gv_google_state";

/** Google sends the browser back here. Staff on the list are signed in; anyone else is turned away. */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const back = (reason: string) => Response.redirect(new URL(`/admin?signin=${reason}`, url), 303);
  if (!googleSignInConfigured()) return back("google-off");

  const jar = await cookies();
  const [state, next] = (jar.get(STATE_COOKIE)?.value ?? "").split("|");
  jar.delete({ name: STATE_COOKIE, path: "/api/auth/google" });
  const code = url.searchParams.get("code");
  // The state must match the one set when this sign-in started, so no other site can start it.
  if (!state || url.searchParams.get("state") !== state || !code) return back("google-failed");

  let email: string | null;
  try {
    email = await verifiedEmail(code, callbackUrl(request));
  } catch (e) {
    console.error("Google sign-in failed", e);
    email = null;
  }
  if (!email) return back("google-failed");
  if (!staffEmails().includes(email)) return back("not-staff");

  await startStaffSession(email);
  return Response.redirect(new URL(next || "/staff", url), 303);
}
