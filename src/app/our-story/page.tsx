import type { Metadata } from "next";
import Link from "next/link";
import { LiveFarmerStory } from "@/components/storefront/live-catalog";
import { cooperative, farmers, lots } from "@/lib/data";

export const metadata: Metadata = {
  title: "Our story",
  description:
    "How Green Venture Cooperative brings together smallholder Arabica farmers in Kumbo, Bui Division, and how your coffee travels from farm to cup.",
};

const STEPS = [
  {
    title: "Grown on smallholder plots",
    text: "Member families farm Arabica on plots of 0.5 to 2 hectares between 1,600 and 2,000 m, often intercropped with beans and plantain.",
  },
  {
    title: "Hand-picked and collected",
    text: "Only ripe red cherries are picked. Collection agents weigh each delivery and record it against the farmer's name and lot.",
  },
  {
    title: "Processed at our stations",
    text: "Cherries are washed, honey-processed or dried whole on raised beds, then rested and hulled to green coffee.",
  },
  {
    title: "Graded and cupped",
    text: "Each lot is checked for moisture, screen size and defects, then cupped and scored so you know exactly what you are buying.",
  },
  {
    title: "Roasted and packed in Kumbo",
    text: "We roast in small batches and print a QR code with the lot number on every bag before it leaves the cooperative.",
  },
  {
    title: "Farmers paid, transparently",
    text: "Farmers are paid by MTN MoMo or Orange Money, and every payment is linked to the lot, so you can see it when you trace your bag.",
  },
];

const VALUES = [
  { title: "Fair prices", text: "Selling together lets members earn more than selling cherries alone to middlemen." },
  { title: "Quality first", text: "Training on selective picking and drying lifts quality, and with it the price each farmer receives." },
  { title: "Full transparency", text: "From farmer to cup, every lot is recorded and open for customers to see." },
];

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((p) => p[0])
    .slice(0, 2)
    .join("");
}

const LOW = 1600;
const HIGH = 2000;

/** Where a farm sits between the 1,600 m and 2,000 m contours, as a percentage. */
function altitudePct(m: number) {
  return Math.min(100, Math.max(0, ((m - LOW) / (HIGH - LOW)) * 100));
}

export default function OurStoryPage() {
  return (
    <>
      <section aria-labelledby="story-heading" className="mx-auto max-w-6xl px-4 pb-10 pt-8 sm:pb-12 sm:pt-14">
        <div className="max-w-3xl">
          <h1 id="story-heading" className="type-h1 text-brand">
            A cooperative of coffee families in the Bui highlands
          </h1>
          <p className="type-lead mt-5 max-w-[60ch] text-foreground">{cooperative.story}</p>
          <p className="mt-4 text-sm text-muted">{cooperative.location}</p>
        </div>
      </section>

      <section aria-labelledby="values-heading" className="mx-auto max-w-6xl px-4 pb-12 sm:pb-14">
        <h2 id="values-heading" className="sr-only">
          What we stand for
        </h2>
        {/* A typographic statement row, divided by hairlines rather than boxed. */}
        <ul className="grid divide-y divide-border border-y border-border md:grid-cols-3 md:divide-x md:divide-y-0">
          {VALUES.map((v) => (
            <li key={v.title} className="py-6 md:px-8 md:py-8 md:first:pl-0 md:last:pr-0">
              <h3 className="type-h2 text-brand">{v.title}</h3>
              <p className="mt-2 max-w-sm text-foreground">{v.text}</p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="journey-heading" className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
        <h2 id="journey-heading" className="type-h2 text-brand">
          From farm to cup
        </h2>
        {/*
          A real sequence, so it is numbered, on one rail: a vertical line on
          phones, a hairline along each row of three on large screens.
        */}
        <ol className="mt-8 grid gap-y-8 sm:mt-10 lg:grid-cols-3 lg:gap-x-8 lg:gap-y-12">
          {STEPS.map((s, i) => (
            <li
              key={s.title}
              className="relative pl-12 before:absolute before:-bottom-8 before:left-[15.5px] before:top-9 before:w-px before:bg-border last:before:hidden lg:pl-0 lg:pt-12 lg:before:-right-8 lg:before:bottom-auto lg:before:left-10 lg:before:top-4 lg:before:h-px lg:before:w-auto lg:last:before:block lg:[&:nth-child(3n)]:before:right-0"
            >
              <span
                aria-hidden="true"
                className="type-data absolute left-0 top-0 flex h-8 w-8 items-center justify-center rounded-full border-2 border-brand bg-background text-brand"
              >
                {i + 1}
              </span>
              <h3 className="type-title text-brand">{s.title}</h3>
              <p className="mt-1 max-w-[46ch] text-foreground">{s.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="farmers-heading" className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
        <div className="max-w-2xl">
          <h2 id="farmers-heading" className="type-h2 text-brand">
            The people behind your cup
          </h2>
          <p className="mt-3 text-foreground">A few of the member families whose coffee is in this season&apos;s lots.</p>
        </div>
        <ul className="mt-8 divide-y divide-border border-y border-border">
          {farmers.map((f) => {
            const farmerLots = lots.filter((l) => l.farmerIds.includes(f.id));
            return (
              <li
                key={f.id}
                className="grid grid-cols-[3rem_minmax(0,1fr)] gap-x-4 gap-y-3 py-6 sm:grid-cols-[3rem_minmax(0,1fr)_14rem] sm:gap-x-8"
              >
                <span
                  aria-hidden="true"
                  className="type-data flex h-12 w-12 items-center justify-center rounded-full bg-sand text-lg text-brand"
                >
                  {initials(f.name)}
                </span>
                <div className="min-w-0 self-center">
                  <h3 className="type-title text-brand [overflow-wrap:anywhere]">{f.name}</h3>
                  <p className="text-sm text-muted">
                    {f.village}, member since {f.joinedYear}
                  </p>
                </div>
                <p className="col-span-2 max-w-[62ch] text-foreground [overflow-wrap:anywhere] sm:col-span-1 sm:col-start-2">
                  <LiveFarmerStory id={f.id} fallback={f.story} />
                </p>
                <div className="col-span-2 sm:col-span-1 sm:col-start-3 sm:row-span-2 sm:row-start-1">
                  {/* The farm on the same 1,600 to 2,000 m scale as the home page ridge. */}
                  <div aria-hidden="true" className="relative mt-2 h-1 rounded-full bg-border">
                    <span
                      className="absolute -top-[3px] h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-cherry"
                      style={{ left: `${altitudePct(f.altitudeMetres)}%` }}
                    />
                  </div>
                  <div aria-hidden="true" className="mt-1 flex justify-between text-xs text-muted tabular">
                    <span>1,600 m</span>
                    <span>2,000 m</span>
                  </div>
                  <dl className="mt-2 flex flex-wrap gap-x-4 text-sm">
                    <div className="flex gap-1.5">
                      <dt className="sr-only">Altitude</dt>
                      <dd className="type-data text-foreground">{f.altitudeMetres.toLocaleString("en-GB")} m</dd>
                    </div>
                    <div className="flex gap-1.5">
                      <dt className="sr-only">Coffee plot</dt>
                      <dd className="text-muted">
                        <span className="tabular">{f.plotHectares}</span> ha coffee plot
                      </dd>
                    </div>
                  </dl>
                  {farmerLots.length > 0 && (
                    <div className="mt-1 flex flex-wrap items-center gap-x-4">
                      <span className="w-full pt-2 text-sm text-muted">In lots</span>
                      {farmerLots.map((l) => (
                        <Link
                          key={l.code}
                          href={`/trace/${l.code}`}
                          className="type-stencil inline-flex min-h-11 items-center text-lg text-accent underline decoration-1 underline-offset-4 hover:decoration-2"
                        >
                          {l.code}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
        <p className="mt-6 text-xs text-muted">Farmer names and stories on this demo are illustrative.</p>
      </section>

      {/* Full-bleed soil band; it runs straight into the footer's soil ground. */}
      <section aria-labelledby="support-heading" className="on-dark -mb-12 mt-4 border-b border-white/15 bg-brand">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-4 py-12 sm:flex-row sm:items-center">
          <div>
            <h2 id="support-heading" className="type-h2 text-brand-contrast">
              Support these farmers with every cup
            </h2>
            <p className="mt-2 text-mist-on-soil">Order direct from the cooperative, delivered across Cameroon and abroad.</p>
          </div>
          <Link href="/shop" className="btn btn-on-dark btn-lg shrink-0">
            Shop the harvest
          </Link>
        </div>
      </section>
    </>
  );
}
