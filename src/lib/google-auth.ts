import "server-only";

/*
 * "Continue with Google", for staff and for customers. Google confirms who
 * the person is. Staff: only the email addresses listed in STAFF_EMAILS
 * (comma-separated, in Vercel) are let in. Customers: anyone, to follow
 * their own orders. Needs GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET from a Google
 * Cloud OAuth client whose redirect address is <site>/api/auth/google/callback.
 */

const clientId = () => process.env.GOOGLE_CLIENT_ID ?? "";
const clientSecret = () => process.env.GOOGLE_CLIENT_SECRET ?? "";

export const staffEmails = () =>
  (process.env.STAFF_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

/** Google is set up at all (customers can use it). */
export const googleClientConfigured = () => clientId() !== "" && clientSecret() !== "";
/** Google is set up and there is a staff list (staff can use it). */
export const googleSignInConfigured = () => googleClientConfigured() && staffEmails().length > 0;

export const callbackUrl = (request: Request) => `${new URL(request.url).origin}/api/auth/google/callback`;

export function googleAuthUrl(state: string, redirectUri: string, withName = false) {
  const params = new URLSearchParams({
    client_id: clientId(),
    redirect_uri: redirectUri,
    response_type: "code",
    // Customers' names greet them on their account page; staff only need the email.
    scope: withName ? "openid email profile" : "openid email",
    state,
    prompt: "select_account",
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
}

/**
 * Trades the code Google sent back for the person's verified email. The
 * token comes straight from Google over HTTPS with our secret, so its claims
 * are trusted after checking it was issued to this site and has not expired.
 */
export async function verifiedEmail(code: string, redirectUri: string): Promise<string | null> {
  return (await verifiedPerson(code, redirectUri))?.email ?? null;
}

export async function verifiedPerson(code: string, redirectUri: string): Promise<{ email: string; name: string } | null> {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId(),
      client_secret: clientSecret(),
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });
  if (!res.ok) return null;
  const { id_token } = (await res.json()) as { id_token?: string };
  const payload = id_token?.split(".")[1];
  if (!payload) return null;
  const claims = JSON.parse(Buffer.from(payload, "base64url").toString()) as {
    aud?: string;
    iss?: string;
    exp?: number;
    email?: string;
    email_verified?: boolean;
    name?: string;
  };
  const issuerOk = claims.iss === "https://accounts.google.com" || claims.iss === "accounts.google.com";
  if (claims.aud !== clientId() || !issuerOk || !claims.exp || claims.exp * 1000 < Date.now()) return null;
  if (!claims.email || claims.email_verified !== true) return null;
  return { email: claims.email.toLowerCase(), name: (claims.name ?? "").slice(0, 120) };
}
