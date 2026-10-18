import { hasDatabase } from "@/lib/db";
import { listingImage } from "@/lib/market";
import { farmerId } from "@/lib/farmer-session";
import { isStaff } from "@/lib/staff-session";

/** A marketplace coffee's photo. Only approved listings are shown; the address changes with the photo. */
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  if (!hasDatabase() || !Number.isSafeInteger(id) || id < 1) return new Response(null, { status: 404 });
  // ?review=1: staff checking coffee that is not on sale yet. Never cached by shared caches.
  const search = new URL(request.url).searchParams;
  const review = search.get("review") === "1" && (await isStaff());
  // ?mine=1: a farmer looking at their own coffee, whatever its status.
  const mine = !review && search.get("mine") === "1" ? await farmerId() : null;
  const photo = await listingImage(id, review || mine !== null, mine ?? undefined);
  if (!photo) return new Response(null, { status: 404 });
  return new Response(new Uint8Array(photo.bytes), {
    headers: { "Content-Type": photo.type, "Cache-Control": review || mine ? "private, no-store" : "public, max-age=31536000, immutable" },
  });
}
