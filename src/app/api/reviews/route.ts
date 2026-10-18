import { connection } from "next/server";
import { reviewerName } from "@/components/reviews/stars";
import { customerId } from "@/lib/customer-session";
import { products } from "@/lib/data";
import { hasBought, hasDatabase, myReview, reviewsFor } from "@/lib/db";
import { googleClientConfigured } from "@/lib/google-auth";
import { kumboTime } from "@/lib/order-status";

/**
 * A coffee's visible reviews (first name and last initial only), and what
 * this visitor may do: sign in, review, or edit their review.
 */
export async function GET(request: Request) {
  await connection();
  const slug = new URL(request.url).searchParams.get("slug") ?? "";
  if (!hasDatabase() || !products.some((p) => p.slug === slug)) return Response.json({ enabled: false });
  try {
    const [rows, id] = await Promise.all([reviewsFor(slug), customerId()]);
    const [bought, mine] = id ? await Promise.all([hasBought(id, slug), myReview(id, slug)]) : [false, null];
    return Response.json(
      {
        enabled: true,
        accounts: googleClientConfigured(),
        signedIn: id !== null,
        canReview: bought,
        mine,
        reviews: rows.map((r) => ({ id: r.id, rating: r.rating, body: r.body, by: reviewerName(r.name), date: kumboTime(r.updatedAt).split(",")[0] })),
      },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (e) {
    console.error("Could not read reviews", e);
    return Response.json({ enabled: false });
  }
}
