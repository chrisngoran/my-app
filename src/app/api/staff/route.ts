import { connection } from "next/server";
import { hasDatabase } from "@/lib/db";
import { googleSignInConfigured } from "@/lib/google-auth";
import { staffPasswordSet, staffSession } from "@/lib/staff-session";

/** Tells the admin whether edits are shared (a database is connected), how staff can sign in, and who is signed in here. */
export async function GET() {
  await connection();
  const shared = hasDatabase();
  const session = shared ? await staffSession() : null;
  return Response.json(
    { shared, passwordSet: staffPasswordSet(), google: googleSignInConfigured(), staff: session !== null, email: session?.email ?? "" },
    { headers: { "Cache-Control": "no-store" } },
  );
}
