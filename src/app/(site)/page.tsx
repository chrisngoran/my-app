import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import cherries from "@/assets/story/cherries.jpg";
import { SHIPPING_XAF } from "@/components/storefront/catalog";
import { HeroRidge } from "@/components/storefront/hero-art";
import { LiveProductList } from "@/components/storefront/live-product";
import { LotTag } from "@/components/storefront/lot-tag";
import { NoCoffeeOnSale, ProductCard } from "@/components/storefront/product-card";
import { RipenOnView } from "@/components/storefront/ripen-on-view";
import { LotSearch } from "@/components/trace/lot-search";
import { formatFcfaText } from "@/lib/currency";
import { cooperative, farmers, getFarmer, getLot, lots, products } from "@/lib/data";
import { phoneLink, whatsappLink } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: { absolute: "Green Venture Cooperative Coffee · Traceable Arabica from Kumbo, Cameroon" },
  description: cooperative.story,
};

/** The lead lot (the highest-scoring micro-lot), then two everyday coffees as compact rows. */
const LEAD = "meluf-natural-micro-lot";
const ALSO = ["bui-highlands-medium-roast", "kumbo-honey-espresso"];

export default function Home() {
  const lead = products.find((p) => p.slug === LEAD) ?? products[0];
  const also = ALSO.flatMap((slug) => products.filter((p) => p.slug === slug && p.slug !== lead.slug));
  const leadLot = getLot(lead.lotCode) ?? lots[0];
  const leadGrowers = leadLot.farmerIds.flatMap((id) => getFarmer(id) ?? []);
  const harvestYear = new Date(leadLot.harvestDate).getUTCFullYear();

  return (
    <>
      {/* Hero: the coffee itself, then six farms on one ridge, standing on volcanic soil. */}
      <section aria-labelledby="hero-heading" className="bg-background">
        <div className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)] gap-x-10 gap-y-8 px-4 pt-8 sm:pt-12 lg:grid-cols-[repeat(12,minmax(0,1fr))] lg:items-end lg:pt-16">
          <div className="lg:col-span-6 lg:self-center">
            <h1 id="hero-heading" className="type-display text-brand">
              Highland Arabica from the family farms around Kumbo.
            </h1>
            <p className="type-lead mt-5 max-w-[60ch] text-foreground">
              Our member families grow it on the volcanic slopes of the Bui highlands, between 1,600 and 2,000 metres. We process
              and sell it together, so every family earns a fair price and every bag tells you exactly where it came from.
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
          {/* A real photograph first, so the first thing anyone sees is the coffee itself, not a drawing. */}
          <figure className="lg:col-span-6">
            <Image
              src={cherries}
              alt="A cluster of Arabica coffee cherries on the branch, most ripe red, some still orange and green"
              priority
              sizes="(min-width: 1152px) 540px, (min-width: 1024px) 47vw, 100vw"
              placeholder="blur"
              className="aspect-[4/3] w-full rounded-lg object-cover lg:aspect-[5/4]"
            />
            <figcaption className="mt-2 text-sm text-muted">Arabica cherries ripening on the branch.</figcaption>
          </figure>
          {/* The ridge runs the full width under both. On a phone it is below the fold, so its one moment waits until it is in view. */}
          <RipenOnView className="h-64 sm:h-72 lg:col-span-12 lg:h-72">
            <HeroRidge farmers={farmers} labelledBy="ridge-caption" className="h-full" />
          </RipenOnView>
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

      {/*
        One lead lot with its record beside it, then two everyday coffees as
        rows. How ordering works sits right here, where people pick.
      */}
      <section aria-labelledby="harvest-heading" className="mx-auto max-w-6xl px-4 pb-14 pt-10 sm:pb-16 sm:pt-14">
        <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
          <div className="max-w-[62ch]">
            <h2 id="harvest-heading" className="type-h2 text-brand">
              From the {harvestYear} harvest
            </h2>
            <p className="mt-3 text-foreground">
              Order on WhatsApp or by phone. We confirm stock and the delivery fee, then you pay by MTN MoMo or Orange Money.
            </p>
          </div>
          <Link
            href="/shop"
            className="inline-flex min-h-11 items-center font-semibold text-accent underline decoration-1 underline-offset-4 hover:decoration-2"
          >
            All coffee
          </Link>
        </div>
        <LiveProductList
          className="mt-8 grid grid-cols-[minmax(0,1fr)] gap-x-10 gap-y-6 sm:grid-cols-[repeat(2,minmax(0,1fr))]"
          empty={<NoCoffeeOnSale />}
          items={[
            {
              slug: lead.slug,
              className: "min-w-0 sm:col-span-2",
              node: (
                <div className="grid grid-cols-[minmax(0,1fr)] gap-8 border-b border-border pb-10 md:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] md:items-start lg:gap-14">
                  <ProductCard product={lead} layout="stack" headingLevel="h3" />
                  <LotTag lot={leadLot} growers={leadGrowers} headingLevel="h3" action="link" />
                </div>
              ),
            },
            ...also.map((p) => ({
              slug: p.slug,
              node: <ProductCard product={p} layout="row" headingLevel="h3" />,
            })),
          ]}
        />
      </section>

      {/* Traceability: one sentence and the way in. The lot record above is the example. */}
      <section aria-labelledby="trace-heading" className="border-y border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-4 py-12 sm:py-14 lg:flex-row lg:items-end lg:justify-between lg:gap-16">
          <div className="max-w-[60ch]">
            <h2 id="trace-heading" className="type-h2 text-brand">
              Every bag is traceable
            </h2>
            <p className="mt-4 text-foreground">
              Each bag carries a QR code with its lot number. Scan it with your phone camera to see who grew your coffee, which
              village and altitude it came from, how it was processed and how it scored.
            </p>
          </div>
          <Link href="/trace" className="btn btn-go btn-lg shrink-0">
            Trace a bag
          </Link>
        </div>
      </section>

      {/* Closing: a fact, the two ways to buy, and how to reach the cooperative. */}
      <section aria-labelledby="cta-heading" className="mx-auto max-w-6xl px-4 pb-4 pt-12 sm:pt-14">
        <div className="grid grid-cols-[minmax(0,1fr)] gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:gap-16">
          <div>
            <h2 id="cta-heading" className="type-h2 max-w-2xl text-brand">
              Delivered across Cameroon from {formatFcfaText(SHIPPING_XAF.local)}, and shipped worldwide.
            </h2>
            <p className="mt-3 max-w-[60ch] text-foreground">Cafés and roasters: ask us about green coffee by the bag.</p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link href="/shop" className="btn btn-primary btn-lg">
                Shop the harvest
              </Link>
              <Link href="/shop?category=subscription" prefetch={false} className="btn btn-secondary btn-lg">
                Start a subscription
              </Link>
            </div>
          </div>
          <dl className="grid content-start gap-y-4 border-t border-border pt-6 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-1">
            <div>
              <dt className="type-label text-muted">WhatsApp or phone</dt>
              <dd className="type-data mt-1 text-lg text-foreground">
                <span className="whitespace-nowrap">{cooperative.phone}</span>
              </dd>
              <dd className="flex flex-wrap gap-x-6">
                <a
                  href={whatsappLink(`Hello ${cooperative.shortName}, I have a question about your coffee.`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center font-semibold text-accent underline decoration-1 underline-offset-4 hover:decoration-2"
                >
                  Message on WhatsApp
                </a>
                <a
                  href={phoneLink()}
                  className="inline-flex min-h-11 items-center font-semibold text-accent underline decoration-1 underline-offset-4 hover:decoration-2"
                >
                  Call
                </a>
              </dd>
            </div>
            <div>
              <dt className="type-label text-muted">Email</dt>
              <dd className="mt-1">
                <a
                  href={`mailto:${cooperative.email}`}
                  className="inline-flex min-h-11 max-w-full items-center text-accent underline decoration-1 underline-offset-4 [overflow-wrap:anywhere] hover:decoration-2"
                >
                  {cooperative.email}
                </a>
              </dd>
            </div>
            <div>
              <dt className="type-label text-muted">Where we are</dt>
              <dd className="mt-1 text-foreground">{cooperative.location}</dd>
            </div>
          </dl>
        </div>
      </section>
    </>
  );
}
