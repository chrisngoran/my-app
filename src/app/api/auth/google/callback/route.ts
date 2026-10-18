import { cookies } from "next/headers";
import { startCustomerSession } from "@/lib/customer-session";
import { hasDatabase, upsertCustomer } from "@/lib/db";
import { callbackUrl, googleClientConfigured, googleSignInConfigured, staffEmails, verifiedPerson } from "@/lib/google-auth";
import { startStaffSession } from "@/lib/staff-session";

const STATE_COOKIE = "gv_google_state";

/**
 * Google sends the browser back here. Staff on the list are signed in to the
 * staff pages; customers are signed in to their account; anyone else is turned away.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const jar = await cookies();
  const [state, next, who] = (jar.get(STATE_COOKIE)?.value ?? "").split("|");
  jar.delete({ name: STATE_COOKIE, path: "/api/auth/google" });
  const customer = who === "customer";
  const back = (reason: string) => Response.redirect(new URL(`${customer ? "/account" : "/admin"}?signin=${reason}`, url), 303);
  if (customer ? !googleClientConfigured() || !hasDatabase() : !googleSignInConfigured()) return back("google-off");

  const code = url.searchParams.get("code");
  // The state must match the one set when this sign-in started, so no other site can start it.
  if (!state || url.searchParams.get("state") !== state || !code) return back("google-failed");

  let person: { email: string; name: string } | null;
  try {
    person = await verifiedPerson(code, callbackUrl(request));
  } catch (e) {
    console.error("Google sign-in failed", e);
    person = null;
  }
  if (!person) return back("google-failed");

  if (customer) {
    try {
      await startCustomerSession(await upsertCustomer(person.email, person.name));
    } catch (e) {
      console.error("Could not save customer", e);
      return back("google-failed");
    }
    return Response.redirect(new URL(next || "/account", url), 303);
  }

  if (!staffEmails().includes(person.email)) return back("not-staff");
  await startStaffSession(person.email);
  return Response.redirect(new URL(next || "/staff", url), 303);
}
