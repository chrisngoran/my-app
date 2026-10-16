import type { Metadata } from "next";
import Link from "next/link";
import { LotScore } from "@/components/trace/live-lot";
import { LotSearch } from "@/components/trace/lot-search";
import { formatHarvestDate, lotFarmers } from "@/components/trace/lot-utils";
import { RidgeEdge } from "@/components/trace/ridge-edge";
import { lots } from "@/lib/data";

export const metadata: Metadata = {
  title: "Trace a bag",
  description:
    "Enter the lot code from your bag to see the farmers, harvest date, processing and quality record behind your Green Venture coffee.",
};

// A real sequence, so the rail numbers its steps.
const STEPS = [
  {
    title: "Picked on the farm",
    text: "Members hand-pick only ripe red cherries on their family plots across the Bui highlands.",
  },
  {
    title: "Weighed and recorded",
    text: "At collection, every delivery is weighed and logged against the farmer who grew it.",
  },
  {
    title: "Processed as a lot",
    text: "Cherries are washed, honey-processed or sun-dried together and given a unique lot code.",
  },
  {
    title: "Cupped and graded",
    text: "Each lot is tested for moisture, screen size and defects, then cupped and scored.",
  },
  {
    title: "Printed on your bag",
    text: "The lot code and QR code on your bag link straight back to this record.",
  },
];

export default function TracePage() {
  const sortedLots = [...lots].sort((a, b) => b.harvestDate.localeCompare(a.harvestDate));

  return (
    <div>
      {/* Soil band: the finder sits directly on it, no floating card. */}
      <section aria-labelledby="trace-heading" className="on-dark relative overflow-hidden bg-brand text-white">
        <RidgeEdge className="h-16 sm:h-24" />
        <div className="relative mx-auto grid max-w-6xl gap-8 px-4 pt-10 pb-20 sm:pt-14 sm:pb-28 lg:grid-cols-[1.1fr_1fr] lg:items-end lg:gap-14">
          <div>
            <h1 id="trace-heading" className="type-h1 text-balance">
              Trace your bag to the farm
            </h1>
            <p className="type-lead mt-4 max-w-[60ch] text-pretty font-[450] tracking-[0.01em]">
              Every bag of Green Venture coffee carries a lot code. Scan the QR code or type the code below to see who
              grew your coffee, where, when it was harvested and how it scored.
            </p>
          </div>
          <LotSearch codes={lots.map((l) => l.code)} tone="dark" label="Lot code from your bag" />
        </div>
      </section>

      <section aria-labelledby="how-heading" className="mx-auto grid max-w-6xl gap-8 px-4 py-14 lg:grid-cols-[1fr_1.3fr] lg:gap-14">
        <div>
          <h2 id="how-heading" className="type-h2 text-balance text-brand">
            How traceability works
          </h2>
          <p className="mt-3 max-w-[60ch] text-pretty text-foreground">
            Each step is recorded by the cooperative against the lot code.
          </p>
        </div>
        <ol className="space-y-0">
          {STEPS.map((step, i) => (
            <li
              key={step.title}
              className="relative pb-7 pl-12 last:pb-0 before:absolute before:top-8 before:bottom-1 before:left-[13px] before:w-px before:bg-border last:before:hidden"
            >
              <span
                aria-hidden="true"
                className="type-data absolute top-0 left-0 flex h-7 w-7 items-center justify-center rounded-full border-2 border-brand text-sm text-brand"
              >
                {i + 1}
              </span>
              <h3 className="type-title text-brand">{step.title}</h3>
              <p className="mt-1 max-w-[60ch] text-pretty text-muted">{step.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="lots-heading" className="border-t border-border">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
            <h2 id="lots-heading" className="type-h2 text-brand">
              2026 harvest lots
            </h2>
            <p className="text-sm text-muted">
              <span className="tabular">{lots.length}</span> lots recorded this season, newest harvest first
            </p>
          </div>
          <ul className="mt-6 border-t border-border">
            {sortedLots.map((lot) => {
              const farmers = lotFarmers(lot);
              const villages = [...new Set(farmers.map((f) => f.village))];
              return (
                <li key={lot.code} className="border-b border-border">
                  <Link
                    href={`/trace/${lot.code}`}
                    className="group grid min-h-11 grid-cols-[minmax(0,1fr)_auto] items-center gap-x-6 py-5"
                  >
                    <div className="min-w-0">
                      <p className="type-stencil text-2xl text-brand underline decoration-transparent decoration-2 underline-offset-4 transition-[text-decoration-color] duration-(--dur-ui) group-hover:decoration-current">
                        {lot.code}
                      </p>
                      <p className="mt-1.5 text-foreground [overflow-wrap:anywhere]">
                        {lot.processingMethod} process, {lot.variety}
                      </p>
                      <p className="mt-0.5 flex flex-wrap gap-x-4 text-sm text-muted">
                        <span className="[overflow-wrap:anywhere]">{villages.join(", ")}</span>
                        <span>Harvested {formatHarvestDate(lot.harvestDate, "short")}</span>
                      </p>
                    </div>
                    <p className="text-right">
                      <span className="type-data block text-2xl text-brand tabular-nums">
                        <LotScore code={lot.code} fallback={lot.quality.cuppingScore} fixed />
                      </span>
                      <span className="block text-xs text-muted">taste score</span>
                    </p>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </section>
    </div>
  );
}
