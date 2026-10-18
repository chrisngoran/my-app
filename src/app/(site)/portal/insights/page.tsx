import type { Metadata } from "next";
import { SalesDashboard } from "@/components/portal/insights/dashboard";
import { PageHeader } from "@/components/portal/ui";
import { SAMPLE_END } from "@/lib/sample-sales";

export const metadata: Metadata = { title: "Sales & demand" };

export default function InsightsPage() {
  const asOf = new Date(`${SAMPLE_END}T12:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
  return (
    <>
      <PageHeader
        title="Sales & demand"
        description={`What sold, where, when, and how long the stock will last. Sample data up to ${asOf}; real figures appear once orders are recorded on the site.`}
      />
      <SalesDashboard />
    </>
  );
}
