import type { Metadata } from "next";
import Link from "next/link";
import { HeroArt } from "@/components/storefront/hero-art";
import { PaymentBadges } from "@/components/storefront/payment-badges";
import { LiveLotNotes, LiveLotScore } from "@/components/storefront/live-catalog";
import { ProductGrid } from "@/components/storefront/product-card";
import { cooperative, farmers, lots, products } from "@/lib/data";

export const metadata: Metadata = {
  title: { absolute: "Green Venture Cooperative Coffee · Traceable Arabica from Kumbo, Cameroon" },
  description: cooperative.story,
};

const FEATURED = ["meluf-natural-micro-lot", "bui-highlands-medium-roast", "kumbo-honey-espresso"];

const STATS = [
  { value: "1,600–2,000 m", label: "Altitude of our farms" },
  { value: `${farmers.length}+`, label: "Smallholder member families" },
  { value: `${lots.length}`, label: "Traceable lots this harvest" },
  { value: "100%", label: "Arabica, hand-picked" },
];

export default function Home() {
  const featured = FEATURED.flatMap((slug) => products.filter((p) => p.slug === slug));
  const exampleLot = lots.find((l) => l.code === "GV-2026-014") ?? lots[0];

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-accent-soft/60 to-background">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-12 sm:py-16 lg:grid-cols-2 lg:py-20">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-surface px-3 py-1 text-xs font-semibold uppercase tracking-wider text-accent shadow-sm">
              <span aria-hidden="true" className="h-2 w-2 rounded-full bg-accent" />
              Kumbo · Bui Division · North West Cameroon
            </p>
            <h1 className="mt-5 font-serif text-4xl font-bold leading-tight text-brand sm:text-5xl">
              Highland Arabica, grown by smallholders, traceable to the hillside.
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-foreground/80">
              On the volcanic slopes of the Bui highlands, our member farmers grow Arabica between 1,600 and 2,000 metres. We
              process and sell it together — so every family earns a fair price and every bag tells you exactly where it came
              from.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/shop"
                className="inline-flex min-h-12 items-center justify-center rounded-lg bg-brand px-7 py-3 font-semibold text-brand-contrast shadow-sm hover:bg-brand/90"
              >
                Shop our coffee
              </Link>
              <Link
                href="/our-story"
                className="inline-flex min-h-12 items-center justify-center rounded-lg border border-brand/30 bg-surface px-7 py-3 font-semibold text-brand hover:border-brand"
              >
                Meet the farmers
              </Link>
            </div>
          </div>
          <HeroArt className="h-auto w-full drop-shadow-sm" />
        </div>
      </section>

      {/* Stats */}
      <section aria-label="The cooperative in numbers" className="border-y border-border bg-surface">
        <dl className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-4 py-8 text-center sm:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label} className="flex flex-col">
              <dt className="order-2 text-sm text-muted">{s.label}</dt>
              <dd className="font-serif text-2xl font-bold text-brand sm:text-3xl">{s.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Featured products */}
      <section aria-labelledby="featured-heading" className="mx-auto max-w-6xl px-4 py-14 sm:py-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-accent">From this harvest</p>
            <h2 id="featured-heading" className="mt-1 font-serif text-3xl font-bold text-brand">
              Featured coffees
            </h2>
          </div>
          <Link href="/shop" className="font-medium text-accent hover:underline">
            See all products →
          </Link>
        </div>
        <ProductGrid products={featured} />
      </section>

      {/* Traceability */}
      <section aria-labelledby="trace-heading" className="bg-brand text-brand-contrast">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 sm:py-16 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-[#e9c79c]">Farm to cup, in the open</p>
            <h2 id="trace-heading" className="mt-1 font-serif text-3xl font-bold sm:text-4xl">
              Every bag is traceable
            </h2>
            <p className="mt-4 max-w-xl leading-relaxed text-brand-contrast/85">
              Each bag carries a QR code with its lot number. Scan it with your phone camera to see who grew your coffee, which
              village and altitude it came from, how it was processed, its quality scores — and when the farmers were paid.
            </p>
            <ol className="mt-6 space-y-3">
              {[
                "Scan the QR code on the back of your bag",
                "See the farmers, harvest date and processing method",
                "Check the cupping score and quality records",
              ].map((step, i) => (
                <li key={step} className="flex items-start gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-warm text-sm font-bold text-white">
                    {i + 1}
                  </span>
                  <span className="pt-0.5">{step}</span>
                </li>
              ))}
            </ol>
            <Link
              href="/trace"
              className="mt-8 inline-flex min-h-12 items-center justify-center rounded-lg bg-surface px-7 py-3 font-semibold text-brand hover:bg-accent-soft"
            >
              Trace a lot
            </Link>
          </div>
          <div className="rounded-2xl bg-surface p-5 text-foreground shadow-lg sm:p-6">
            <div className="flex items-center gap-4">
              <svg viewBox="0 0 21 21" className="h-20 w-20 shrink-0 rounded-md border border-border p-1" aria-hidden="true" shapeRendering="crispEdges">
                <g fill="#2a1d16">
                  <path d="M0 0h7v7H0zM1 1v5h5V1zM2 2h3v3H2zM14 0h7v7h-7zM15 1v5h5V1zM16 2h3v3h-3zM0 14h7v7H0zM1 15v5h5v-5zM2 16h3v3H2z" fillRule="evenodd" />
                  <path d="M8 0h1v2H8zM10 1h2v1h-2zM9 3h2v2H9zM12 4h1v3h-1zM8 6h2v2H8zM0 8h2v1H0zM3 8h3v1H3zM10 8h3v2h-3zM14 8h2v1h-2zM18 8h3v2h-3zM1 10h2v2H1zM5 10h3v1H5zM8 11h2v2H8zM13 11h3v1h-3zM17 11h2v3h-2zM4 12h2v1H4zM11 13h2v2h-2zM14 13h2v2h-2zM8 14h2v2H8zM19 15h2v2h-2zM12 16h3v1h-3zM8 17h1v3H8zM10 18h3v2h-3zM15 18h3v1h-3zM14 20h2v1h-2zM19 19h2v2h-2z" />
                </g>
              </svg>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted">Lot code</p>
                <p className="font-mono text-xl font-bold text-brand">{exampleLot.code}</p>
                <p className="text-sm text-muted">{exampleLot.processingMethod} · {exampleLot.variety}</p>
              </div>
            </div>
            <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg bg-background p-3">
                <dt className="text-muted">Cupping score</dt>
                <dd className="text-lg font-bold text-accent">
                  <LiveLotScore code={exampleLot.code} fallback={exampleLot.quality.cuppingScore} />
                </dd>
              </div>
              <div className="rounded-lg bg-background p-3">
                <dt className="text-muted">Harvested</dt>
                <dd className="text-lg font-bold">
                  {new Date(exampleLot.harvestDate).toLocaleDateString("en-GB", { month: "short", year: "numeric", timeZone: "UTC" })}
                </dd>
              </div>
            </dl>
            <p className="mt-4 text-sm text-foreground/80">
              <LiveLotNotes code={exampleLot.code} fallback={exampleLot.notes} />
            </p>
            <Link href={`/trace/${exampleLot.code}`} className="mt-4 inline-block text-sm font-semibold text-accent hover:underline">
              See the full journey of this lot →
            </Link>
          </div>
        </div>
      </section>

      {/* Payment methods */}
      <section aria-labelledby="pay-heading" className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-4 px-4 py-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 id="pay-heading" className="font-serif text-xl font-bold text-brand">
              Order on WhatsApp, pay with mobile money
            </h2>
            <p className="text-sm text-muted">Choose your coffee, send the order on WhatsApp or call us, then pay by MTN MoMo or Orange Money once we confirm.</p>
          </div>
          <PaymentBadges />
        </div>
      </section>

      {/* CTA */}
      <section aria-labelledby="cta-heading" className="mx-auto max-w-6xl px-4 py-14 sm:py-16">
        <div className="relative overflow-hidden rounded-3xl bg-accent px-6 py-10 text-brand-contrast sm:px-12 sm:py-14">
          <svg aria-hidden="true" viewBox="0 0 200 200" className="pointer-events-none absolute -right-10 -top-10 h-64 w-64 opacity-15">
            <ellipse cx="100" cy="100" rx="70" ry="95" fill="currentColor" transform="rotate(30 100 100)" />
            <path d="M60 30 C110 80 90 120 140 170" stroke="#245432" strokeWidth="10" fill="none" />
          </svg>
          <h2 id="cta-heading" className="max-w-2xl font-serif text-3xl font-bold sm:text-4xl">
            Taste the Bui highlands — and know who grew it.
          </h2>
          <p className="mt-3 max-w-xl text-brand-contrast/85">
            Delivered across Cameroon from 1,000 FCFA, and shipped worldwide. Cafés and roasters: ask us about green coffee by
            the bag.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/shop"
              className="inline-flex min-h-12 items-center justify-center rounded-lg bg-surface px-7 py-3 font-semibold text-accent hover:bg-accent-soft"
            >
              Order now
            </Link>
            <Link
              href="/shop?category=subscription"
              className="inline-flex min-h-12 items-center justify-center rounded-lg border border-white/50 px-7 py-3 font-semibold text-brand-contrast hover:bg-white/10"
            >
              Start a subscription
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
