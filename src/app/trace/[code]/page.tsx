import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Price } from "@/components/price";
import { CuppingScore } from "@/components/trace/cupping-score";
import {
  ArrowRightIcon,
  BeanIcon,
  CalendarIcon,
  DropIcon,
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
  lotFarmers,
  lotProducts,
  normaliseLotCode,
  safeDecode,
} from "@/components/trace/lot-utils";
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

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
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

  const facts = [
    { icon: CalendarIcon, label: "Harvested", value: formatHarvestDate(lot.harvestDate) },
    { icon: DropIcon, label: "Processing", value: lot.processingMethod },
    { icon: LeafIcon, label: "Variety", value: lot.variety },
    { icon: MountainIcon, label: "Altitude", value: altitudeRange(farmers) },
    { icon: ScaleIcon, label: "Lot weight", value: `${lot.weightKg.toLocaleString("en-GB")} kg` },
    { icon: PinIcon, label: "Origin", value: `${villages.join(", ")} · Kumbo` },
  ];

  const quality = [
    {
      label: "Moisture",
      value: `${q.moisturePercent}%`,
      hint: "Target 10–12% for stable storage",
      ok: q.moisturePercent >= 10 && q.moisturePercent <= 12,
    },
    { label: "Screen size", value: q.screenSize, hint: "Bean size in 64ths of an inch", ok: true },
    {
      label: "Defects",
      value: `${q.defectsPer300g}`,
      unit: "per 300 g",
      hint: q.defectsPer300g <= 5 ? "Specialty grade 1 (≤ 5)" : "Specialty grade (≤ 8)",
      ok: q.defectsPer300g <= 8,
    },
  ];

  return (
    <article>
      {/* Hero */}
      <header className="relative overflow-hidden bg-brand text-brand-contrast">
        <HillsBackdrop className="pointer-events-none absolute inset-x-0 bottom-0 h-20 w-full text-accent-soft sm:h-28" />
        <div className="relative mx-auto max-w-6xl px-4 pt-6 pb-16 sm:pb-24">
          <nav aria-label="Breadcrumb" className="text-sm text-brand-contrast/70">
            <ol className="flex flex-wrap items-center gap-1.5">
              <li>
                <Link href="/trace" className="hover:text-brand-contrast hover:underline">
                  Trace
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li aria-current="page" className="font-mono">
                {lot.code}
              </li>
            </ol>
          </nav>
          <div className="mt-8 grid gap-10 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full bg-brand-contrast/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em]">
                <span className="h-2 w-2 rounded-full bg-accent-soft" aria-hidden="true" />
                Verified lot · {lot.code}
              </p>
              <h1 className="mt-4 font-serif text-3xl font-bold leading-tight sm:text-5xl">
                {lot.processingMethod} Arabica from {villages.join(villages.length > 2 ? ", " : " & ")}
              </h1>
              <p className="mt-4 max-w-2xl text-base text-brand-contrast/85 sm:text-lg">{lot.notes}</p>
              <p className="mt-4 text-sm text-brand-contrast/70">
                Grown by {farmers.length === 1 ? "one farmer" : `${farmers.length} member farmers`} of {cooperative.name},
                Bui Division, North West Cameroon.
              </p>
            </div>
            <div className="justify-self-center rounded-3xl bg-brand-contrast/5 px-8 py-6 ring-1 ring-brand-contrast/15">
              <CuppingScore score={q.cuppingScore} />
            </div>
          </div>
        </div>
      </header>

      {/* Key facts */}
      <section aria-labelledby="facts-heading" className="relative mx-auto -mt-8 max-w-6xl px-4">
        <h2 id="facts-heading" className="sr-only">
          Lot details
        </h2>
        <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border bg-border shadow-sm lg:grid-cols-6">
          {facts.map((f) => (
            <div key={f.label} className="bg-surface p-4">
              <dt className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted">
                <f.icon className="h-4 w-4 text-accent" />
                {f.label}
              </dt>
              <dd className="mt-1.5 font-semibold leading-snug text-foreground">{f.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <div className="mx-auto max-w-6xl space-y-14 px-4 py-14">
        {/* Process & quality */}
        <section aria-labelledby="quality-heading" className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
          <div className="rounded-2xl border border-border bg-accent-soft p-6">
            <h2 className="flex items-center gap-2 font-serif text-xl font-bold text-accent">
              <DropIcon /> {lot.processingMethod} process
            </h2>
            <p className="mt-3 text-foreground/85">{PROCESS_TEXT[lot.processingMethod]}</p>
            <p className="mt-3 text-sm text-muted">{lot.notes}</p>
          </div>
          <div className="rounded-2xl border border-border bg-surface p-6">
            <h2 id="quality-heading" className="font-serif text-xl font-bold text-brand">
              Quality record
            </h2>
            <p className="mt-1 text-sm text-muted">Tested by the cooperative&apos;s quality team before export.</p>
            <dl className="mt-5 grid gap-3 sm:grid-cols-3">
              {quality.map((item) => (
                <div key={item.label} className="rounded-xl border border-border bg-background p-4">
                  <dt className="text-xs font-medium uppercase tracking-wider text-muted">{item.label}</dt>
                  <dd className="mt-1">
                    <span className="text-2xl font-bold text-foreground">{item.value}</span>
                    {item.unit && <span className="ml-1 text-sm text-muted">{item.unit}</span>}
                    <span className="mt-1 flex items-start gap-1 text-xs text-muted">
                      {item.ok && (
                        <svg viewBox="0 0 16 16" className="mt-px h-3.5 w-3.5 shrink-0 text-accent" aria-hidden="true">
                          <path d="M3 8.5 6.5 12 13 4.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                      )}
                      {item.hint}
                    </span>
                  </dd>
                </div>
              ))}
            </dl>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-brand p-4 text-brand-contrast">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-brand-contrast/70">Cupping score</p>
                <p className="text-sm text-brand-contrast/85">80+ points is specialty grade</p>
              </div>
              <p className="font-serif text-3xl font-bold">
                {q.cuppingScore}
                <span className="ml-1 text-base font-normal text-brand-contrast/70">/ 100</span>
              </p>
            </div>
          </div>
        </section>

        {/* Farmers */}
        <section aria-labelledby="farmers-heading">
          <h2 id="farmers-heading" className="font-serif text-2xl font-bold text-brand sm:text-3xl">
            {farmers.length === 1 ? "Meet your farmer" : "Meet your farmers"}
          </h2>
          <p className="mt-2 max-w-2xl text-muted">
            {farmers.length === 1
              ? "Every bean in this lot came from a single family farm."
              : `This lot brings together coffee from ${farmers.length} member farms.`}{" "}
            Farmers are paid directly by mobile money once the lot is sold.
          </p>
          <ul className="mt-6 grid gap-4 md:grid-cols-2">
            {farmers.map((f) => (
              <li key={f.id} className="flex gap-4 rounded-2xl border border-border bg-surface p-5">
                <div
                  aria-hidden="true"
                  className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-accent font-serif text-lg font-bold text-white"
                >
                  {initials(f.name)}
                </div>
                <div className="min-w-0">
                  <h3 className="text-lg font-semibold text-foreground">{f.name}</h3>
                  <p className="mt-0.5 flex flex-wrap gap-x-3 gap-y-1 text-sm text-muted">
                    <span className="inline-flex items-center gap-1">
                      <PinIcon className="h-3.5 w-3.5" /> {f.village}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <MountainIcon className="h-3.5 w-3.5" /> {formatMetres(f.altitudeMetres)}
                    </span>
                    <span>{f.plotHectares} ha</span>
                    <span>Member since {f.joinedYear}</span>
                  </p>
                  <p className="mt-3 text-foreground/85">{f.story}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* Products */}
        <section aria-labelledby="products-heading">
          <h2 id="products-heading" className="font-serif text-2xl font-bold text-brand sm:text-3xl">
            Coffee from this lot
          </h2>
          {products.length === 0 ? (
            <p className="mt-3 text-muted">
              This lot is reserved for export buyers. <Link href="/shop" className="font-semibold text-accent underline">Browse the shop</Link>{" "}
              for coffee available now.
            </p>
          ) : (
            <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((p) => (
                <li key={p.slug}>
                  <Link
                    href={`/shop/${p.slug}`}
                    className="group flex h-full flex-col rounded-2xl border border-border bg-surface p-5 transition hover:border-accent hover:shadow-md focus-visible:outline-2 focus-visible:outline-accent"
                  >
                    <div className="flex items-start gap-3">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand text-brand-contrast">
                        <BeanIcon />
                      </span>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-foreground group-hover:text-brand">{p.name}</h3>
                        <p className="text-sm text-muted">
                          {p.weightGrams >= 1000 ? `${p.weightGrams / 1000} kg` : `${p.weightGrams} g`}
                          {p.roast ? ` · ${p.roast} roast` : ""}
                        </p>
                      </div>
                    </div>
                    <ul className="mt-3 flex flex-wrap gap-1.5" aria-label="Tasting notes">
                      {p.cuppingNotes.map((n) => (
                        <li key={n} className="rounded-full bg-accent-soft px-2.5 py-0.5 text-xs font-medium text-accent">
                          {n}
                        </li>
                      ))}
                    </ul>
                    <div className="mt-auto flex items-center justify-between pt-4">
                      <Price xaf={p.priceXaf} className="text-lg font-bold text-brand" />
                      <span className="inline-flex items-center gap-1 text-sm font-semibold text-accent">
                        Buy <ArrowRightIcon />
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* QR */}
        <section
          aria-labelledby="qr-heading"
          className="grid items-center gap-6 rounded-2xl border border-border bg-surface p-6 sm:grid-cols-[auto_1fr] sm:p-8"
        >
          <LotQrCode code={lot.code} className="mx-auto h-44 w-44 rounded-lg border border-border bg-white p-2 sm:h-48 sm:w-48" />
          <div className="text-center sm:text-left">
            <h2 id="qr-heading" className="font-serif text-2xl font-bold text-brand">
              Share this coffee&apos;s story
            </h2>
            <p className="mt-2 text-muted">
              This is the QR code printed on every bag from lot <span className="font-mono font-semibold">{lot.code}</span>.
              Scan it with your phone camera to open this page.
            </p>
            <p className="mt-2 break-all font-mono text-xs text-muted">{traceUrl(lot.code)}</p>
            <div className="mt-5 flex flex-wrap justify-center gap-3 sm:justify-start">
              <Link
                href={`/trace/${lot.code}/label`}
                className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-brand-contrast hover:opacity-90"
              >
                Printable bag label
              </Link>
              <Link
                href="/trace"
                className="rounded-md border border-border px-4 py-2 text-sm font-semibold text-foreground hover:border-brand"
              >
                Trace another lot
              </Link>
            </div>
          </div>
        </section>
      </div>
    </article>
  );
}
