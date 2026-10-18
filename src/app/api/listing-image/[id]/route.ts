import { hasDatabase } from "@/lib/db";
import { listingImage } from "@/lib/market";
import { isStaff } from "@/lib/staff-session";

/** A marketplace coffee's photo. Only approved listings are shown; the address changes with the photo. */
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  if (!hasDatabase() || !Number.isSafeInteger(id) || id < 1) return new Response(null, { status: 404 });
  // ?review=1: staff checking coffee that is not on sale yet. Never cached by shared caches.
  const review = new URL(request.url).searchParams.get("review") === "1" && (await isStaff());
  const photo = await listingImage(id, review);
  if (!photo) return new Response(null, { status: 404 });
  return new Response(new Uint8Array(photo.bytes), {
    headers: { "Content-Type": photo.type, "Cache-Control": review ? "private, no-store" : "public, max-age=31536000, immutable" },
  });
}
