import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  AlertIcon,
  CheckIcon,
  HillsBackdrop,
  LeafIcon,
  MountainIcon,
  PinIcon,
  ScaleIcon,
} from "@/components/trace/icons";
import {
  altitudeRange,
  formatHarvestDate,
  formatMetres,
  initials,
  lotFarmers,
  lotProducts,
  normaliseLotCode,
  safeDecode,
} from "@/components/trace/lot-utils";
import { btnPrimary, btnSecondary } from "@/components/trace/buttons";
import { FarmerStory, LotGauge, LotNotes, LotScoreWithGrade } from "@/components/trace/live-lot";
import { LotProducts } from "@/components/trace/lot-products";
import { LotQrCode } from "@/components/trace/qr-code";
import { cooperative, getLot, lots } from "@/lib/data";
import { traceUrl } from "@/lib/qr";
import type { ProcessingMethod } from "@/lib/types";

// Unknown params must wait for the full render so notFound() and redirect()
// set a real 404/307 status instead of streaming into a 200 response.
export const ensureStatic = "navigation";

export function generateStaticParams() {
  return lots.map((lot) => ({ code: lot.code }));
}

export async function generateMetadata({ params }: { params: Promise<{ code: string }> }): Promise<Metadata> {
  const { code } = await params;
  const lot = getLot(normaliseLotCode(safeDecode(code)));
  if (!lot) return { title: "Lot not found" };
  const names = lotFarmers(lot).map((f) => f.name).join(", ");
  return {
    title: `Lot ${lot.code}`,
    description: `${lot.processingMethod} ${lot.variety} grown by ${names} in the Bui highlands of Cameroon. Cupping score ${lot.quality.cuppingScore}.`,
  };
}

const PROCESS_TEXT: Record<ProcessingMethod, string> = {
  Washed: "Pulped and fermented, then washed clean before drying, for a bright and clean cup.",
  Natural: "Dried whole in the cherry on raised beds, giving a fruity, full-bodied cup.",
  Honey: "Pulped with some sticky fruit left on the bean while drying, for sweetness and body.",
};

/** One stop on the lot journey rail. The last stop is marked in cherry. */
function JourneyStep({ title, last = false, children }: { title: React.ReactNode; last?: boolean; children?: React.ReactNode }) {
  return (
    <li className="relative pb-8 last:pb-0 before:absolute before:top-5 before:bottom-0 before:-left-[21px] before:w-0.5 before:bg-border last:before:hidden">
      <span
        aria-hidden="true"
        className={`absolute top-1.5 -left-[26px] h-3 w-3 rounded-full ring-4 ring-background ${last ? "bg-cherry" : "bg-accent"}`}
      />
      <h3 className="type-title text-brand">{title}</h3>
      {children}
    </li>
  );
}

export default async function LotProvenancePage({ params }: { params: Promise<{ code: string }> }) {
  const { code: rawCode } = await params;
  const decoded = safeDecode(rawCode);
  const lot = getLot(normaliseLotCode(decoded));
  if (!lot) notFound();
  if (lot.code !== decoded) redirect(`/trace/${lot.code}`);

  const farmers = lotFarmers(lot);
  const products = lotProducts(lot);
  const villages = [...new Set(farmers.map((f) => f.village))];
  const q = lot.quality;
  // Split the trace URL so a narrow screen wraps before the lot code, never inside it.
  const fullUrl = traceUrl(lot.code);
  const codeSegment = encodeURIComponent(lot.code);
  const urlBase = fullUrl.endsWith(codeSegment) ? fullUrl.slice(0, -codeSegment.length) : fullUrl;
  const urlCode = fullUrl.endsWith(codeSegment) ? codeSegment : "";

  const record = [
    { icon: LeafIcon, label: "Variety", value: lot.variety },
    { icon: MountainIcon, label: "Altitude", value: altitudeRange(farmers) },
    { icon: ScaleIcon, label: "Lot weight", value: `${lot.weightKg.toLocaleString("en-GB")} kg` },
    { icon: PinIcon, label: "Origin", value: `${villages.length ? `${villages.join(", ")}, ` : ""}Kumbo` },
  ];

  const quality = [
    {
      label: "Moisture",
      value: `${q.moisturePercent}%`,
      ok: q.moisturePercent >= 10 && q.moisturePercent <= 12,
      hint: "Target 10–12% for stable storage",
      warning: "Outside the 10–12% target for stable storage",
    },
    {
      label: "Screen size",
      value: q.screenSize,
      ok: true,
      hint: "Bean size in 64ths of an inch",
      warning: "",
    },
    {
      label: "Defects",
      value: `${q.defectsPer300g} per 300 g`,
      ok: q.defectsPer300g <= 8,
      hint: q.defectsPer300g <= 5 ? "Specialty grade 1 (≤ 5)" : "Specialty grade (≤ 8)",
      warning: "Above the specialty limit of 8 per 300 g",
    },
  ];

  return (
    <article>
      {/* Hero: Volcanic Soil band. The stencilled code is the sack mark. */}
      <header className="on-dark relative overflow-hidden bg-brand text-white">
        <HillsBackdrop className="pointer-events-none absolute inset-x-0 bottom-0 h-16 w-full text-background sm:h-24" />
        <div className="relative mx-auto max-w-6xl px-4 pt-2 pb-20 sm:pb-28">
          <nav aria-label="Breadcrumb" className="text-sm text-mist-on-soil">
            <ol className="flex flex-wrap items-center gap-x-2">
              <li>
                <Link
                  href="/trace"
                  className="-mx-2 inline-flex min-h-11 items-center rounded-lg px-2 font-medium underline-offset-4 hover:text-sand hover:underline"
                >
                  Trace
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li aria-current="page" className="type-stencil text-lg text-sand">
                {lot.code}
              </li>
            </ol>
          </nav>
          <div className="mt-4 grid gap-10 md:grid-cols-[minmax(0,1fr)_auto] md:items-center md:gap-14">
            <div className="min-w-0">
              <p aria-hidden="true" className="type-stencil text-[3rem] text-sand sm:text-[3.5rem]">
                {lot.code}
              </p>
              <h1 className="type-h1 mt-3 text-balance [overflow-wrap:anywhere]">
                <span className="sr-only">Lot {lot.code}: </span>
                {lot.processingMethod} Arabica from {villages.join(villages.length > 2 ? ", " : " and ")}
              </h1>
              <LotNotes
                code={lot.code}
                fallback={lot.notes}
                className="type-lead mt-4 max-w-[60ch] text-pretty font-[450] tracking-[0.01em] text-white"
              />
              <p className="mt-4 max-w-[60ch] text-sm font-medium tracking-[0.01em] text-mist-on-soil">
                Grown by {farmers.length === 1 ? "one farmer" : `${farmers.length} member farmers`} of {cooperative.name},
                Bui Division, North West Cameroon.
              </p>
            </div>
            <div className="justify-self-start md:justify-self-end">
              <LotGauge code={lot.code} fallback={q.cuppingScore} />
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4">
        {/* Lot record */}
        <section aria-labelledby="record-heading" className="mt-10">
          <h2 id="record-heading" className="sr-only">
            Lot record
          </h2>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-4 border-y border-border py-5 sm:grid-cols-4">
            {record.map((f) => (
              <div key={f.label} className="min-w-0">
                <dt className="type-label flex items-center gap-1.5 text-muted">
                  <f.icon className="h-4 w-4 shrink-0 text-accent" />
                  {f.label}
                </dt>
                <dd className="type-data mt-1 text-lg text-foreground tabular-nums [overflow-wrap:anywhere]">{f.value}</dd>
              </div>
            ))}
          </dl>
        </section>

        <div className="grid gap-14 py-14 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-16">
          {/* Lot journey: a real sequence, so it sits on a rail. */}
          <section aria-labelledby="journey-heading" className="min-w-0">
            <h2 id="journey-heading" className="type-h2 text-brand">
              Lot journey
            </h2>
            <ol className="mt-8 pl-8">
              <JourneyStep title="Harvested">
                <p className="type-data mt-1 text-foreground">
                  <time dateTime={lot.harvestDate}>{formatHarvestDate(lot.harvestDate)}</time>
                </p>
              </JourneyStep>
              <JourneyStep title={`${lot.processingMethod} process`}>
                <p className="mt-1 max-w-[60ch] text-pretty text-foreground">{PROCESS_TEXT[lot.processingMethod]}</p>
              </JourneyStep>
              <JourneyStep title="Quality checked">
                <dl className="mt-3 grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-3">
                  {quality.map((item) => (
                    <div key={item.label} className="col-span-2 grid grid-cols-subgrid items-baseline">
                      <dt className="type-label text-muted">{item.label}</dt>
                      <dd className="min-w-0">
                        <span className="type-data text-foreground tabular-nums">{item.value}</span>
                        {item.ok ? (
                          <span className="mt-0.5 flex items-start gap-1.5 text-sm text-muted">
                            <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                            {item.hint}
                          </span>
                        ) : (
                          <span className="mt-0.5 flex items-start gap-1.5 text-sm font-medium text-danger">
                            <AlertIcon className="mt-0.5 h-4 w-4 shrink-0" />
                            {item.warning}
                          </span>
                        )}
                      </dd>
                    </div>
                  ))}
                </dl>
                <p className="mt-3 text-sm text-muted">Tested by the cooperative&apos;s quality team before export.</p>
              </JourneyStep>
              <JourneyStep
                title={
                  <>
                    Cupped: <LotScoreWithGrade code={lot.code} fallback={q.cuppingScore} />
                  </>
                }
              >
                <p className="mt-1 text-sm text-muted">On the Specialty Coffee Association scale, out of 100.</p>
              </JourneyStep>
              <JourneyStep last title="Farmers paid by mobile money once the lot is sold." />
            </ol>
          </section>

          {/* Farmers */}
          <section aria-labelledby="farmers-heading" className="min-w-0">
            <h2 id="farmers-heading" className="type-h2 text-brand">
              {farmers.length === 1 ? "Meet your farmer" : "Meet your farmers"}
            </h2>
            <p className="mt-2 max-w-[60ch] text-pretty text-muted">
              {farmers.length === 1
                ? "Every bean in this lot came from a single family farm."
                : `This lot brings together coffee from ${farmers.length} member farms.`}
            </p>
            <ul className="mt-5 divide-y divide-border border-y border-border">
              {farmers.map((f) => (
                <li key={f.id} className="grid grid-cols-[3rem_minmax(0,1fr)] gap-x-4 py-5">
                  <span
                    aria-hidden="true"
                    className="type-data flex h-12 w-12 items-center justify-center rounded-full bg-sand text-brand"
                  >
                    {initials(f.name)}
                  </span>
                  <div className="min-w-0 self-center">
                    <h3 className="type-title text-brand [overflow-wrap:anywhere]">{f.name}</h3>
                    <p className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted">
                      <span className="inline-flex items-center gap-1">
                        <PinIcon className="h-3.5 w-3.5 shrink-0" /> {f.village}
                      </span>
                      <span className="inline-flex items-center gap-1 tabular-nums">
                        <MountainIcon className="h-3.5 w-3.5 shrink-0" /> {formatMetres(f.altitudeMetres)}
                      </span>
                      <span className="tabular-nums">{f.plotHectares} ha</span>
                      <span>Member since {f.joinedYear}</span>
                    </p>
                  </div>
                  {/* Full width under the disc on phones; aligned with the name from sm up. */}
                  <div className="col-span-2 mt-3 min-w-0 sm:col-span-1 sm:col-start-2">
                    <FarmerStory id={f.id} fallback={f.story} className="max-w-[60ch] text-pretty text-foreground" />
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* Products */}
        <section aria-labelledby="products-heading">
          <h2 id="products-heading" className="type-h2 text-brand">
            Coffee from this lot
          </h2>
          <LotProducts slugs={products.map((p) => p.slug)} />
        </section>

        {/* QR: unboxed, the code itself is the object. No rule on top: the product list above already ends on one. */}
        <section
          aria-labelledby="qr-heading"
          className="mt-16 mb-4 grid items-center gap-6 sm:grid-cols-[auto_minmax(0,1fr)] sm:gap-10"
        >
          <LotQrCode code={lot.code} className="h-44 w-44 rounded-lg bg-white p-2 ring-1 ring-border sm:h-48 sm:w-48" />
          <div className="min-w-0">
            <h2 id="qr-heading" className="type-h2 text-brand">
              Share this coffee&apos;s story
            </h2>
            <p className="mt-2 max-w-[60ch] text-pretty text-foreground">
              This is the QR code printed on every bag from lot{" "}
              <span className="type-stencil text-xl text-brand">{lot.code}</span>. Scan it with your phone camera to open
              this page.
            </p>
            <p className="mt-2 font-mono text-xs text-muted [overflow-wrap:anywhere]">
              {urlBase}
              <wbr />
              <span className="whitespace-nowrap">{urlCode}</span>
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href={`/trace/${lot.code}/label`} className={btnPrimary}>
                Printable bag label
              </Link>
              <Link href="/trace" className={btnSecondary}>
                Trace another lot
              </Link>
            </div>
          </div>
        </section>
      </div>
    </article>
  );
}
