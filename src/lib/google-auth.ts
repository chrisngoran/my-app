import "server-only";

/*
 * "Continue with Google" for staff. Google confirms who the person is; only
 * the email addresses listed in STAFF_EMAILS (comma-separated, in Vercel)
 * are let in. Needs GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET from a Google
 * Cloud OAuth client whose redirect address is <site>/api/auth/google/callback.
 */

const clientId = () => process.env.GOOGLE_CLIENT_ID ?? "";
const clientSecret = () => process.env.GOOGLE_CLIENT_SECRET ?? "";

export const staffEmails = () =>
  (process.env.STAFF_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

export const googleSignInConfigured = () => clientId() !== "" && clientSecret() !== "" && staffEmails().length > 0;

export const callbackUrl = (request: Request) => `${new URL(request.url).origin}/api/auth/google/callback`;

export function googleAuthUrl(state: string, redirectUri: string) {
  const params = new URLSearchParams({
    client_id: clientId(),
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email",
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
  };
  const issuerOk = claims.iss === "https://accounts.google.com" || claims.iss === "accounts.google.com";
  if (claims.aud !== clientId() || !issuerOk || !claims.exp || claims.exp * 1000 < Date.now()) return null;
  if (!claims.email || claims.email_verified !== true) return null;
  return claims.email.toLowerCase();
}
