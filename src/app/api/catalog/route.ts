import { connection } from "next/server";
import { readOverrides, saveOverrides } from "@/lib/catalog-store";
import { hasDatabase } from "@/lib/db";
import { marketProducts } from "@/lib/market";
import { fromThisSite } from "@/lib/same-origin";
import { isStaff } from "@/lib/staff-session";

/*
 * The staff's product, lot and farmer edits. Every page of the shop reads
 * them; only signed-in staff can change them. Without a database the site
 * stays in demo mode, where edits live in each browser.
 */

export async function GET() {
  await connection();
  if (!hasDatabase()) return Response.json({ shared: false });
  try {
    const [overrides, listings] = await Promise.all([readOverrides(), marketProducts()]);
    return Response.json({ shared: true, overrides, listings }, { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    console.error("Could not read catalog", e);
    return Response.json({ shared: true, error: true }, { status: 503 });
  }
}

export async function POST(request: Request) {
  if (!fromThisSite(request)) return new Response(null, { status: 403 });
  if (!hasDatabase()) return new Response(null, { status: 404 });
  if (!(await isStaff())) return new Response(null, { status: 401 });
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new Response(null, { status: 400 });
  }
  try {
    await saveOverrides((body as { overrides?: unknown })?.overrides);
  } catch (e) {
    if (e instanceof Error && e.message === "Photo too large") return new Response(null, { status: 413 });
    console.error("Could not save catalog", e);
    return new Response(null, { status: 500 });
  }
  return Response.json({ overrides: await readOverrides() });
}
