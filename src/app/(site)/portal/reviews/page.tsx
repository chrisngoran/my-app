import type { Metadata } from "next";
import { Suspense } from "react";
import { StaffLogin } from "@/components/portal/insights/staff-login";
import { HideToggle } from "@/components/portal/review-moderation";
import { PageHeader } from "@/components/portal/ui";
import { Stars } from "@/components/reviews/stars";
import { products } from "@/lib/data";
import { allReviews, hasDatabase, type ReviewRow } from "@/lib/db";
import { googleSignInConfigured } from "@/lib/google-auth";
import { kumboTime } from "@/lib/order-status";
import { staffPasswordSet, isStaff } from "@/lib/staff-session";

export const metadata: Metadata = { title: "Reviews" };

const TITLE = "Reviews";
const DESCRIPTION = "Star ratings and comments from customers whose orders were confirmed. Hide any that are abusive or off-topic.";

export default function ReviewsPage() {
  if (!hasDatabase()) {
    return <PageHeader title={TITLE} description="Reviews start once the shop is connected to its database." />;
  }
  return (
    <Suspense fallback={<PageHeader title={TITLE} description={DESCRIPTION} />}>
      <Reviews />
    </Suspense>
  );
}

async function Reviews() {
  if (!(await isStaff())) {
    return (
      <>
        <PageHeader title={TITLE} description={DESCRIPTION} />
        <StaffLogin passwordSet={staffPasswordSet()} google={googleSignInConfigured()} next="/portal/reviews" note="Only cooperative staff can manage reviews." />
      </>
    );
  }
  let reviews: ReviewRow[] = [];
  let failed = false;
  try {
    reviews = await allReviews();
  } catch (e) {
    console.error("Could not read reviews", e);
    failed = true;
  }
  return (
    <>
      <PageHeader title={TITLE} description={DESCRIPTION} />
      {failed ? (
        <p className="text-sm text-muted">Reviews could not be loaded just now. Reload in a minute.</p>
      ) : reviews.length === 0 ? (
        <p className="max-w-md rounded-xl border border-border bg-surface p-5 text-sm text-muted shadow-sm">No reviews yet.</p>
      ) : (
        <ul className="grid gap-3 lg:grid-cols-2">
          {reviews.map((r) => (
            <li key={r.id} className={`rounded-xl border border-border bg-surface p-4 shadow-sm ${r.hidden ? "opacity-70" : ""}`}>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <Stars value={r.rating} />
                <span className="font-semibold text-foreground">{products.find((p) => p.slug === r.productSlug)?.name ?? r.productSlug}</span>
                {r.hidden && <span className="rounded-full bg-border/60 px-2 py-0.5 text-xs font-semibold text-muted">Hidden</span>}
              </div>
              <p className="mt-1 text-sm text-muted [overflow-wrap:anywhere]">
                {r.name ? `${r.name} (${r.email})` : r.email} · {kumboTime(r.updatedAt)}
              </p>
              {r.body && <p className="mt-2 whitespace-pre-line text-foreground [overflow-wrap:anywhere]">{r.body}</p>}
              <div className="mt-3">
                <HideToggle id={r.id} hidden={r.hidden} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
