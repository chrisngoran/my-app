import { connection } from "next/server";
import { hasDatabase } from "@/lib/db";
import { isStaff, staffPasswordSet } from "@/lib/staff-session";

/** Tells the admin whether edits are shared (a database is connected) and whether this browser is signed in. */
export async function GET() {
  await connection();
  const shared = hasDatabase();
  return Response.json(
    { shared, passwordSet: staffPasswordSet(), staff: shared && (await isStaff()) },
    { headers: { "Cache-Control": "no-store" } },
  );
}
