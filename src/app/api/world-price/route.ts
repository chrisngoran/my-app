import { connection } from "next/server";
import { worldCoffeePrice } from "@/lib/world-price";

/** The same public market figures the staff pages show, as JSON. */
export async function GET() {
  await connection();
  try {
    return Response.json(await worldCoffeePrice(), { headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=3600" } });
  } catch (e) {
    console.error("World coffee price unavailable", e);
    return Response.json({ error: "unavailable" }, { status: 503 });
  }
}
