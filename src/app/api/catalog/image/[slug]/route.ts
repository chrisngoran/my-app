import { readPhoto } from "@/lib/catalog-store";
import { hasDatabase } from "@/lib/db";

/** A product photo uploaded in the admin. The address changes with the photo, so browsers may keep it. */
export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!hasDatabase()) return new Response(null, { status: 404 });
  const photo = await readPhoto(slug);
  if (!photo) return new Response(null, { status: 404 });
  return new Response(new Uint8Array(photo.bytes), {
    headers: { "Content-Type": photo.type, "Cache-Control": "public, max-age=31536000, immutable" },
  });
}
