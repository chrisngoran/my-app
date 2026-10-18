import type { Metadata } from "next";
import { Suspense } from "react";
import { AddFarmerForm, CommissionForm, FarmerControls, ListingCard, type StaffListing, StaffAddListing } from "@/components/market/staff-market";
import { StaffLogin } from "@/components/portal/insights/staff-login";
import { Card, PageHeader } from "@/components/portal/ui";
import { hasDatabase } from "@/lib/db";
import { googleSignInConfigured } from "@/lib/google-auth";
import { allFarmers, allListings, commissionPct } from "@/lib/market";
import { isStaff, staffPasswordSet } from "@/lib/staff-session";

export const metadata: Metadata = { title: "Marketplace" };

const TITLE = "Farmer marketplace";
const DESCRIPTION = "Farmers who sell their own coffee through the cooperative. Nothing a farmer adds goes on sale until you approve it.";

export default function MarketplacePage() {
  if (!hasDatabase()) return <PageHeader title={TITLE} description="The marketplace starts once the shop is connected to its database." />;
  return (
    <Suspense fallback={<PageHeader title={TITLE} description={DESCRIPTION} />}>
      <Marketplace />
    </Suspense>
  );
}

async function Marketplace() {
  if (!(await isStaff())) {
    return (
      <>
        <PageHeader title={TITLE} description={DESCRIPTION} />
        <StaffLogin
          passwordSet={staffPasswordSet()}
          google={googleSignInConfigured()}
          next="/portal/marketplace"
          note="Only cooperative staff can manage the marketplace."
        />
      </>
    );
  }
  let data;
  try {
    data = await Promise.all([allFarmers(), allListings(), commissionPct()]);
  } catch (e) {
    console.error("Could not read marketplace", e);
    return (
      <>
        <PageHeader title={TITLE} description={DESCRIPTION} />
        <p className="text-sm text-muted">The marketplace could not be loaded just now. Reload in a minute.</p>
      </>
    );
  }
  const [farmers, listings, pct] = data;
  const names = new Map(farmers.map((f) => [f.id, f.name]));
  const toStaff = (l: (typeof listings)[number]): StaffListing => ({
    id: l.id,
    name: l.name,
    kind: l.kind,
    weightGrams: l.weightGrams,
    priceXaf: l.priceXaf,
    stock: l.stock,
    description: l.description,
    farmer: names.get(l.farmerId) ?? "Unknown farmer",
    status: l.status,
    note: l.note,
    imageSrc: l.hasImage ? `/api/listing-image/${l.id}?review=1&v=${l.imageVersion}` : null,
  });
  const pending = listings.filter((l) => l.status === "pending");
  const others = listings.filter((l) => l.status !== "pending");

  return (
    <>
      <PageHeader title={TITLE} description={DESCRIPTION} />
      <div className="space-y-6">
        <Card id="pending" title={pending.length ? `Waiting for approval (${pending.length})` : "Waiting for approval"}>
          <div className="p-4 sm:p-5">
            {pending.length === 0 ? (
              <p className="text-sm text-muted">Nothing waiting. Coffee that farmers add shows up here first.</p>
            ) : (
              <ul className="grid gap-3 lg:grid-cols-2">
                {pending.map((l) => (
                  <ListingCard key={l.id} listing={toStaff(l)} />
                ))}
              </ul>
            )}
          </div>
        </Card>

        <Card id="listings" title="Farmers' coffee">
          <div className="p-4 sm:p-5">
            {others.length === 0 ? (
              <p className="text-sm text-muted">No farmer coffee yet.</p>
            ) : (
              <ul className="grid gap-3 lg:grid-cols-2">
                {others.map((l) => (
                  <ListingCard key={l.id} listing={toStaff(l)} />
                ))}
              </ul>
            )}
          </div>
        </Card>

        <Card id="add-listing" title="Add coffee for a farmer">
          <div className="max-w-xl p-4 sm:p-5">
            <p className="mb-4 text-sm text-muted">For farmers without a smartphone. Coffee you add goes on sale straight away.</p>
            <StaffAddListing farmers={farmers.filter((f) => f.active).map((f) => ({ id: f.id, name: f.name }))} />
          </div>
        </Card>

        <Card id="farmers" title={`Farmers (${farmers.length})`}>
          <div className="p-4 sm:p-5">
            {farmers.length === 0 ? (
              <p className="text-sm text-muted">No farmers yet. Add the first one below.</p>
            ) : (
              <ul className="grid gap-3 lg:grid-cols-2">
                {farmers.map((f) => {
                  const theirs = listings.filter((l) => l.farmerId === f.id);
                  return (
                    <li key={f.id} className={`rounded-xl border border-border bg-surface p-4 ${f.active ? "" : "opacity-70"}`}>
                      <p className="font-semibold text-foreground">
                        {f.name}
                        {!f.active && <span className="ml-2 rounded-full bg-border/60 px-2 py-0.5 text-xs text-muted">Not selling</span>}
                      </p>
                      <p className="text-sm text-muted [overflow-wrap:anywhere]">{[f.village, `+${f.phone}`, f.email].filter(Boolean).join(" · ")}</p>
                      <p className="text-sm text-muted">
                        {theirs.filter((l) => l.status === "approved").length} on sale · {theirs.filter((l) => l.status === "pending").length} waiting
                      </p>
                      <FarmerControls id={f.id} active={f.active} />
                    </li>
                  );
                })}
              </ul>
            )}
            <div className="mt-6 max-w-xl border-t border-border pt-5">
              <h3 className="mb-3 font-semibold text-foreground">Add a farmer</h3>
              <AddFarmerForm />
            </div>
          </div>
        </Card>

        <Card id="share" title="Cooperative's share">
          <div className="p-4 sm:p-5">
            <CommissionForm pct={pct} />
          </div>
        </Card>
      </div>
    </>
  );
}
