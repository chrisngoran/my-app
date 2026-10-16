import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRightIcon, CalendarIcon, CupIcon, HillsBackdrop, LeafIcon, MountainIcon, QrIcon } from "@/components/trace/icons";
import { LiveLotScore } from "@/components/storefront/live-catalog";
import { LotSearch } from "@/components/trace/lot-search";
import { arrowNudge, linkedCard } from "@/components/trace/buttons";
import { altitudeRange, formatHarvestDate, lotFarmers } from "@/components/trace/lot-utils";
import { lots } from "@/lib/data";

export const metadata: Metadata = {
  title: "Trace your coffee",
  description:
    "Enter the lot code from your bag to see the farmers, harvest date, processing and quality record behind your Green Venture coffee.",
};

const STEPS = [
  {
    icon: LeafIcon,
    title: "Picked on the farm",
    text: "Members hand-pick only ripe red cherries on smallholder plots across the Bui highlands.",
  },
  {
    icon: CalendarIcon,
    title: "Weighed and recorded",
    text: "At collection, every delivery is weighed and logged against the farmer who grew it.",
  },
  {
    icon: MountainIcon,
    title: "Processed as a lot",
    text: "Cherries are washed, honey-processed or sun-dried together and given a unique lot code.",
  },
  {
    icon: CupIcon,
    title: "Cupped and graded",
    text: "Each lot is tested for moisture, screen size and defects, then cupped and scored.",
  },
  {
    icon: QrIcon,
    title: "Printed on your bag",
    text: "The lot code and QR code on your bag link straight back to this record.",
  },
];

export default function TracePage() {
  const sortedLots = [...lots].sort((a, b) => b.harvestDate.localeCompare(a.harvestDate));

  return (
    <div>
      <section className="relative overflow-hidden bg-brand text-brand-contrast">
        <HillsBackdrop className="pointer-events-none absolute inset-x-0 bottom-0 h-24 w-full text-background sm:h-32" />
        <div className="relative mx-auto grid max-w-6xl gap-10 px-4 pt-12 pb-20 sm:pt-16 sm:pb-28 lg:grid-cols-[1.1fr_1fr] lg:items-center">
          <div>
            <h1 className="font-serif text-balance text-3xl font-bold leading-tight sm:text-5xl">Meet the farmers behind your cup</h1>
            <p className="mt-4 max-w-xl text-base text-brand-contrast/85 sm:text-lg">
              Every bag of Green Venture coffee carries a lot code. Scan the QR code or type the code below to see
              who grew your coffee, where, when it was harvested and how it scored.
            </p>
          </div>
          <div className="rounded-2xl bg-surface p-5 text-foreground shadow-xl sm:p-6">
            <h2 className="font-serif text-xl font-bold text-brand">Find your lot</h2>
            <p className="mt-1 mb-4 text-sm text-muted">No QR scanner? No problem.</p>
            <LotSearch codes={lots.map((l) => l.code)} />
          </div>
        </div>
      </section>

      <section aria-labelledby="how-heading" className="mx-auto max-w-6xl px-4 py-14">
        <h2 id="how-heading" className="font-serif text-2xl font-bold text-brand sm:text-3xl">
          How traceability works
        </h2>
        <p className="mt-2 max-w-2xl text-muted">
          From a hillside in Kumbo to your kitchen, each step is recorded by the cooperative so the story of your
          coffee is never lost.
        </p>
        {/* One connected journey: a vertical rule on phones, a horizontal one through the discs on desktop. */}
        <ol className="mt-10 grid lg:grid-cols-5">
          {STEPS.map((step, i) => (
            <li key={step.title} className="relative pb-8 pl-14 last:pb-0 lg:pb-0 lg:pl-0 lg:pr-6">
              {i < STEPS.length - 1 && (
                <span
                  aria-hidden="true"
                  className="absolute top-12 bottom-2 left-5 w-px bg-border lg:top-5 lg:right-2 lg:bottom-auto lg:left-12 lg:h-px lg:w-auto"
                />
              )}
              <span className="absolute top-0 left-0 flex h-10 w-10 items-center justify-center rounded-full bg-accent-soft text-accent lg:static">
                <step.icon />
              </span>
              <h3 className="pt-2 font-semibold text-foreground lg:mt-4 lg:pt-0">{step.title}</h3>
              <p className="mt-1 max-w-prose text-sm text-muted">{step.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="lots-heading" className="border-t border-border bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2 id="lots-heading" className="font-serif text-2xl font-bold text-brand sm:text-3xl">
                2026 harvest lots
              </h2>
              <p className="mt-2 text-muted">Browse every lot the cooperative has recorded this season.</p>
            </div>
            <p className="text-sm text-muted">{lots.length} lots</p>
          </div>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2">
            {sortedLots.map((lot) => {
              const farmers = lotFarmers(lot);
              return (
                <li key={lot.code}>
                  <Link
                    href={`/trace/${lot.code}`}
                    className={`${linkedCard} flex h-full flex-col rounded-2xl border border-border bg-background p-5`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-mono text-lg font-bold tracking-wide text-brand">{lot.code}</p>
                        <p className="mt-0.5 text-sm text-muted">
                          {lot.processingMethod} · {lot.variety}
                        </p>
                      </div>
                      <div className="shrink-0 rounded-lg bg-accent-soft px-2.5 py-1 text-center text-accent">
                        <p className="text-lg font-bold leading-none tabular-nums">
                          <LiveLotScore code={lot.code} fallback={lot.quality.cuppingScore} />
                        </p>
                        <p className="mt-0.5 text-xs font-semibold tracking-wider">SCA</p>
                      </div>
                    </div>
                    <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                      <div>
                        <dt className="text-xs text-muted">Harvested</dt>
                        <dd className="font-medium">{formatHarvestDate(lot.harvestDate, "short")}</dd>
                      </div>
                      <div>
                        <dt className="text-xs text-muted">Altitude</dt>
                        <dd className="font-medium">{altitudeRange(farmers)}</dd>
                      </div>
                      <div className="col-span-2">
                        <dt className="text-xs text-muted">{farmers.length === 1 ? "Farmer" : `${farmers.length} farmers`}</dt>
                        <dd className="font-medium">{farmers.map((f) => f.name).join(", ")}</dd>
                      </div>
                    </dl>
                    <span className="mt-auto inline-flex items-center gap-1 pt-4 text-sm font-semibold text-accent">
                      View provenance <ArrowRightIcon className={arrowNudge} />
                    </span>
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
