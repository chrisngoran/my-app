import type { Metadata } from "next";
import Link from "next/link";
import { HeroRidge } from "@/components/storefront/hero-art";
import { LotTag } from "@/components/storefront/lot-tag";
import { PaymentBadges } from "@/components/storefront/payment-badges";
import { ProductGrid } from "@/components/storefront/product-card";
import { LotSearch } from "@/components/trace/lot-search";
import { cooperative, farmers, getFarmer, lots, products } from "@/lib/data";

export const metadata: Metadata = {
  title: { absolute: "Green Venture Cooperative Coffee · Traceable Arabica from Kumbo, Cameroon" },
  description: cooperative.story,
};

const FEATURED = ["meluf-natural-micro-lot", "bui-highlands-medium-roast", "kumbo-honey-espresso"];

const SCAN_STEPS = [
  "Scan the QR code on the back of your bag",
  "See the farmers, harvest date and processing method",
  "Check the cupping score and quality records",
];

export default function Home() {
  const featured = FEATURED.flatMap((slug) => products.filter((p) => p.slug === slug));
  const exampleLot = lots.find((l) => l.code === "GV-2026-014") ?? lots[0];
  const exampleGrowers = exampleLot.farmerIds.flatMap((id) => getFarmer(id) ?? []);

  return (
    <>
      {/* Hero: six farms on one ridge, standing on volcanic soil. */}
      <section aria-labelledby="hero-heading" className="bg-background">
        <div className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)] gap-x-10 gap-y-8 px-4 pt-8 sm:pt-12 lg:grid-cols-[repeat(12,minmax(0,1fr))] lg:items-end lg:pt-16">
          <div className="lg:col-span-6 lg:pb-14">
            <h1 id="hero-heading" className="type-display text-brand">
              Highland Arabica, grown by smallholders, traceable to the hillside.
            </h1>
            <p className="type-lead mt-5 max-w-[60ch] text-foreground">
              On the volcanic slopes of the Bui highlands around Kumbo, our member families grow Arabica between 1,600 and 2,000
              metres. We process and sell it together, so every family earns a fair price and every bag tells you exactly where it
              came from.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/shop" className="btn btn-primary btn-lg">
                Shop the harvest
              </Link>
              <Link href="/our-story" className="btn btn-secondary btn-lg">
                Meet the farmers
              </Link>
            </div>
          </div>
          <HeroRidge
            farmers={farmers}
            labelledBy="ridge-caption"
            className="h-72 sm:h-80 lg:col-span-6 lg:h-[26rem]"
          />
        </div>

        <div className="on-dark bg-brand text-sand">
          <div className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)] gap-x-10 gap-y-5 px-4 py-6 lg:grid-cols-[repeat(12,minmax(0,1fr))] lg:items-end lg:py-8">
            <p id="ridge-caption" className="text-sm text-mist-on-soil lg:col-span-5 lg:pb-3">
              Member farms by altitude. Sample data.
            </p>
            <div className="max-w-xl lg:col-span-7 lg:max-w-none">
              <LotSearch codes={lots.map((l) => l.code)} tone="dark" label="Have a bag? Enter its lot code" />
            </div>
          </div>
        </div>
      </section>

      {/* Featured products */}
      <section aria-labelledby="featured-heading" className="mx-auto max-w-6xl px-4 pb-14 pt-12 sm:pb-16 sm:pt-16">
        <div className="flex flex-wrap items-end justify-between gap-x-4">
          <h2 id="featured-heading" className="type-h2 text-brand">
            Featured coffees
          </h2>
          <Link
            href="/shop"
            className="inline-flex min-h-11 items-center font-semibold text-accent underline decoration-1 underline-offset-4 hover:decoration-2"
          >
            All coffee
          </Link>
        </div>
        <ProductGrid
          products={featured}
          className="mt-6 grid grid-cols-[minmax(0,1fr)] gap-x-6 gap-y-10 sm:grid-cols-[repeat(2,minmax(0,1fr))] lg:grid-cols-[repeat(3,minmax(0,1fr))]"
        />
      </section>

      {/* Traceability */}
      <section aria-labelledby="trace-heading" className="border-y border-border bg-background">
        <div className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)] items-start gap-10 px-4 py-14 sm:py-16 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-16">
          <div>
            <h2 id="trace-heading" className="type-h2 text-brand">
              Every bag is traceable
            </h2>
            <p className="mt-4 max-w-[60ch] text-foreground">
              Each bag carries a QR code with its lot number. Scan it with your phone camera to see who grew your coffee, which
              village and altitude it came from, how it was processed, its quality scores, and when the farmers were paid.
            </p>
            {/* A real sequence, so it is numbered: three steps on one rail. */}
            <ol className="mt-7 space-y-5">
              {SCAN_STEPS.map((step, i) => (
                <li
                  key={step}
                  className="relative flex items-start gap-4 before:absolute before:-bottom-5 before:left-[13.5px] before:top-7 before:w-px before:bg-border last:before:hidden"
                >
                  <span
                    aria-hidden="true"
                    className="type-data relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-brand bg-background text-sm text-brand"
                  >
                    {i + 1}
                  </span>
                  <span className="pt-0.5">{step}</span>
                </li>
              ))}
            </ol>
            <Link href="/trace" className="btn btn-go btn-lg mt-8">
              Trace a lot
            </Link>
          </div>
          <LotTag lot={exampleLot} growers={exampleGrowers} headingLevel="h3" action="link" />
        </div>
      </section>

      {/* Payment methods */}
      <section aria-labelledby="pay-heading" className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-[60ch]">
            <h2 id="pay-heading" className="type-title text-brand">
              Order on WhatsApp, pay with mobile money
            </h2>
            <p className="mt-1 text-sm text-muted">
              Choose your coffee, send the order on WhatsApp or call us, then pay by MTN MoMo or Orange Money once we confirm.
            </p>
          </div>
          <PaymentBadges />
        </div>
      </section>

      {/* Closing call to action */}
      <section aria-labelledby="cta-heading" className="mx-auto max-w-6xl px-4 pb-4 pt-2">
        <div className="border-t border-brand/20 pt-12">
          <h2 id="cta-heading" className="type-h2 max-w-2xl text-brand">
            Taste the Bui highlands and know who grew it.
          </h2>
          <p className="mt-3 max-w-[60ch] text-foreground">
            Delivered across Cameroon from 1,000 FCFA, and shipped worldwide. Cafés and roasters: ask us about green coffee by
            the bag.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link href="/shop" className="btn btn-primary btn-lg">
              Order now
            </Link>
            <Link href="/shop?category=subscription" className="btn btn-secondary btn-lg">
              Start a subscription
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
