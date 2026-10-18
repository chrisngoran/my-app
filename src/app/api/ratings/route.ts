import { connection } from "next/server";
import { hasDatabase, ratingSummary } from "@/lib/db";

/** Average stars and review count per coffee, for the shop cards. Public; refreshed every few minutes. */
export async function GET() {
  await connection();
  if (!hasDatabase()) return Response.json({});
  try {
    return Response.json(await ratingSummary(), { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" } });
  } catch (e) {
    console.error("Could not read ratings", e);
    return Response.json({});
  }
}
