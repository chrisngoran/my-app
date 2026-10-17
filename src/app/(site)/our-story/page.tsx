import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import handSorting from "@/assets/story/hand-sorting.jpg";
import millHuller from "@/assets/story/mill-huller.jpg";
import millLine from "@/assets/story/mill-line.jpg";
import { LiveFarmerStory } from "@/components/storefront/live-catalog";
import { cooperative, farmers, lots } from "@/lib/data";
import { ridgeHeightPct } from "@/lib/ridge";
import type { Farmer } from "@/lib/types";

export const metadata: Metadata = {
  title: "Our story",
  description:
    "How Green Venture Cooperative brings together family Arabica farmers in Kumbo, Bui Division, and how each lot goes from picking to payment.",
};

const STEPS = [
  {
    title: "Grown on family plots",
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
    text: "Each lot is checked for moisture, screen size and defects, then cupped and scored.",
  },
  {
    title: "Roasted and packed in Kumbo",
    text: "We roast in small batches and print a QR code with the lot number on every bag before it leaves the cooperative.",
  },
  {
    title: "Farmers paid",
    // farmerPayments in data.ts includes a cash payment, so mobile money is "mostly", not "always".
    text: "Farmers are paid once their lot is sold, mostly by MTN MoMo or Orange Money, and each payment is recorded against the lot.",
  },
];

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((p) => p[0])
    .slice(0, 2)
    .join("");
}

const metres = (m: number) => `${m.toLocaleString("en-GB")} m`;

/**
 * Label positions for the altitude rail: each label starts level with its
 * farm's dot, then is nudged just far enough apart (in % of the rail) that
 * no two overlap; a short leader joins a nudged label to its dot.
 */
function railLabels(sorted: Farmer[], gap: number) {
  const pos = sorted.map((f) => ridgeHeightPct(f.altitudeMetres));
  for (let i = 1; i < pos.length; i++) pos[i] = Math.min(pos[i], pos[i - 1] - gap);
  if (pos.length && pos[pos.length - 1] < 0) {
    pos[pos.length - 1] = 0;
    for (let i = pos.length - 2; i >= 0; i--) pos[i] = Math.max(pos[i], pos[i + 1] + gap);
  }
  return pos.map((p) => Math.min(100, p));
}

/**
 * One shared altitude axis for every member family on the page: the home
 * ridge, unrolled into a single ruler. A strip above the list on phones, a
 * sticky rail beside it on large screens.
 */
function AltitudeRail({ sorted }: { sorted: Farmer[] }) {
  const labels = railLabels(sorted, 9);
  return (
    <figure aria-hidden="true" className="relative h-56 lg:sticky lg:top-6 lg:h-[26rem] lg:self-start">
      <span className="absolute left-0 top-0 text-xs text-muted tabular">2,000 m</span>
      <span className="absolute bottom-0 left-0 text-xs text-muted tabular">1,600 m</span>
      <div className="absolute bottom-2 left-16 right-0 top-2">
        {/* The axis, and dashed contours at its two ends as on the home ridge. */}
        <span className="absolute -left-px bottom-0 top-0 w-0.5 rounded-full bg-border" />
        <span className="absolute -left-2 right-0 top-0 border-t border-dashed border-field-border" />
        <span className="absolute -left-2 bottom-0 right-0 border-t border-dashed border-field-border" />
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute bottom-0 left-0 top-0 h-full w-6 overflow-visible">
          {sorted.map((f, i) => (
            <line
              key={f.id}
              x1="0"
              y1={100 - ridgeHeightPct(f.altitudeMetres)}
              x2="100"
              y2={100 - labels[i]}
              stroke="var(--field-border)"
              strokeWidth="1"
              vectorEffect="non-scaling-stroke"
            />
          ))}
        </svg>
        {sorted.map((f) => (
          <span
            key={f.id}
            className="absolute -left-[5px] h-2.5 w-2.5 translate-y-1/2 rounded-full bg-cherry ring-2 ring-background"
            style={{ bottom: `${ridgeHeightPct(f.altitudeMetres)}%` }}
          />
        ))}
        {sorted.map((f, i) => (
          <span
            key={f.id}
            className="absolute left-7 flex translate-y-1/2 items-baseline gap-2 whitespace-nowrap leading-tight"
            style={{ bottom: `${labels[i]}%` }}
          >
            <span className="text-[0.8125rem] font-semibold text-brand [font-stretch:85%]">{f.village}</span>
            <span className="text-xs text-muted tabular">{metres(f.altitudeMetres)}</span>
          </span>
        ))}
      </div>
    </figure>
  );
}

export default function OurStoryPage() {
  // Highest farm first, the same order the ridge reads from its summit down.
  const byAltitude = [...farmers].sort((a, b) => b.altitudeMetres - a.altitudeMetres);
  const highest = byAltitude[0];
  const lowest = byAltitude[byAltitude.length - 1];

  return (
    <>
      <section aria-labelledby="story-heading" className="mx-auto max-w-6xl px-4 pb-10 pt-8 sm:pb-12 sm:pt-14">
        <div className="max-w-3xl">
          <h1 id="story-heading" className="type-h1 text-brand">
            A cooperative of coffee families in the Bui highlands
          </h1>
          <p className="type-lead mt-5 max-w-[60ch] text-foreground">{cooperative.story}</p>
          <p className="mt-4 max-w-[60ch] text-foreground">
            Selling together earns members more than selling cherries alone to middlemen. Training in selective picking and
            drying lifts quality, and with it the price each farmer receives. Every lot is recorded and open for you to see.
          </p>
          <p className="mt-4 text-sm text-muted">{cooperative.location}</p>
        </div>
      </section>

      {/* The cooperative's own photographs: hand-sorting and the mill in Kumbo. */}
      <section aria-labelledby="place-heading" className="mx-auto max-w-6xl px-4 py-6 sm:py-8">
        <h2 id="place-heading" className="sr-only">
          At the cooperative
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)_minmax(0,1fr)]">
          <figure className="col-span-2 lg:col-span-1">
            <Image
              src={handSorting}
              alt="Women at long tables under a tin roof, sorting green coffee beans by hand"
              sizes="(min-width: 1024px) 560px, 100vw"
              placeholder="blur"
              className="aspect-[4/3] w-full rounded-lg object-cover lg:aspect-auto lg:h-96"
            />
            <figcaption className="mt-2 text-sm text-muted">Sorting green coffee by hand, bean by bean, before it is bagged.</figcaption>
          </figure>
          <figure>
            <Image
              src={millHuller}
              alt="A green-painted processing machine marked Green Ventures, with a hopper, fan housing and belt-driven motor"
              sizes="(min-width: 1024px) 340px, 50vw"
              placeholder="blur"
              className="aspect-[3/4] w-full rounded-lg object-cover lg:aspect-auto lg:h-96"
            />
            <figcaption className="mt-2 text-sm text-muted">Our mill, where dried coffee is processed.</figcaption>
          </figure>
          <figure>
            <Image
              src={millLine}
              alt="Tall green elevator columns marked Green Ventures linking the machines of the processing line"
              sizes="(min-width: 1024px) 340px, 50vw"
              placeholder="blur"
              className="aspect-[3/4] w-full rounded-lg object-cover lg:aspect-auto lg:h-96"
            />
            <figcaption className="mt-2 text-sm text-muted">Elevators carry the coffee from one machine to the next.</figcaption>
          </figure>
        </div>
      </section>

      <section aria-labelledby="journey-heading" className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
        <h2 id="journey-heading" className="type-h2 text-brand">
          From picking to payment
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
            Member families, from {highest.village} down to {lowest.village}
          </h2>
          <p className="mt-3 text-foreground">
            Some of the families whose coffee is in this season&apos;s lots, from the highest farm to the lowest.
          </p>
        </div>
        <div className="mt-8 grid grid-cols-[minmax(0,1fr)] gap-8 lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-12">
          <AltitudeRail sorted={byAltitude} />
          <ul className="divide-y divide-border border-y border-border">
            {byAltitude.map((f) => {
              const farmerLots = lots.filter((l) => l.farmerIds.includes(f.id));
              return (
                <li
                  key={f.id}
                  className="grid grid-cols-[3rem_minmax(0,1fr)] gap-x-4 gap-y-3 py-6 sm:grid-cols-[3rem_minmax(0,1fr)_11rem] sm:gap-x-8"
                >
                  {/* Portrait slot: initials until the cooperative supplies a consented photograph (Farmer.photo). */}
                  {f.photo ? (
                    <Image src={f.photo} alt="" width={96} height={96} className="h-12 w-12 rounded-full object-cover" />
                  ) : (
                    <span
                      aria-hidden="true"
                      className="type-data flex h-12 w-12 items-center justify-center rounded-full bg-sand text-lg text-brand"
                    >
                      {initials(f.name)}
                    </span>
                  )}
                  <div className="min-w-0 self-center">
                    <h3 className="type-title text-brand [overflow-wrap:anywhere]">{f.name}</h3>
                    <p className="text-sm text-muted">
                      {f.village}, member since {f.joinedYear}
                    </p>
                  </div>
                  <div className="col-span-2 sm:col-span-1 sm:col-start-2">
                    <p className="max-w-[62ch] text-foreground [overflow-wrap:anywhere]">
                      <LiveFarmerStory id={f.id} fallback={f.story} />
                    </p>
                    <p className="mt-2 text-sm text-muted">
                      <span className="sr-only">Altitude and coffee plot: </span>
                      <span className="type-data text-foreground">{metres(f.altitudeMetres)}</span>,{" "}
                      <span className="tabular">{f.plotHectares}</span> ha of coffee
                    </p>
                  </div>
                  {farmerLots.length > 0 && (
                    <div className="col-span-2 sm:col-span-1 sm:col-start-3 sm:row-span-2 sm:row-start-1">
                      <p className="text-sm text-muted">In lots</p>
                      <div className="flex flex-wrap items-center gap-x-4">
                        {farmerLots.map((l) => (
                          <Link
                            key={l.code}
                            href={`/trace/${l.code}`}
                            prefetch={false}
                            className="type-stencil inline-flex min-h-11 items-center text-lg text-accent underline decoration-1 underline-offset-4 hover:decoration-2"
                          >
                            {l.code}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
        <p className="mt-6 text-xs text-muted">Farmer names and stories on this demo are illustrative.</p>
      </section>

      {/* Ends on mist, so it does not run into the footer's soil as one oversized band. */}
      <section aria-labelledby="support-heading" className="mx-auto max-w-6xl px-4 pb-4 pt-2">
        <div className="flex flex-col items-start justify-between gap-6 border-t border-brand/20 pt-10 sm:flex-row sm:items-center">
          <div>
            <h2 id="support-heading" className="type-h2 text-brand">
              Order from these farms
            </h2>
            <p className="mt-2 text-foreground">Order direct from the cooperative, delivered across Cameroon and abroad.</p>
          </div>
          <Link href="/shop" className="btn btn-primary btn-lg shrink-0">
            Shop the harvest
          </Link>
        </div>
      </section>
    </>
  );
}
