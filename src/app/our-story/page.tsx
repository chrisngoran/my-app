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
    text: "Farmers are paid by MTN MoMo or Orange Money, and every payment is linked to the lot — visible when you trace your bag.",
  },
];

const VALUES = [
  { title: "Fair prices", text: "Selling together lets members earn more than selling cherries alone to middlemen." },
  { title: "Quality first", text: "Training on selective picking and drying lifts quality — and the price each farmer receives." },
  { title: "Full transparency", text: "From farmer to cup, every lot is recorded and open for customers to see." },
];

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((p) => p[0])
    .slice(0, 2)
    .join("");
}

// Brand, leaf and warm-ink: each carries white initials at 4.5:1 or better.
const AVATAR_COLOURS = ["bg-brand", "bg-accent", "bg-warm-ink"];

export default function OurStoryPage() {
  return (
    <>
      <section className="bg-gradient-to-b from-accent-soft/60 to-background">
        <div className="mx-auto max-w-4xl px-4 py-12 text-center sm:py-16">
          <h1 className="text-balance font-serif text-4xl font-bold leading-tight text-brand sm:text-5xl">
            A cooperative of coffee families in the Bui highlands
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-pretty text-lg leading-relaxed text-foreground/80">{cooperative.story}</p>
          <p className="mt-4 text-sm text-muted">{cooperative.location}</p>
        </div>
      </section>

      <section aria-labelledby="values-heading" className="mx-auto max-w-6xl px-4 pb-12 pt-4 sm:pb-14">
        <h2 id="values-heading" className="sr-only">
          What we stand for
        </h2>
        {/* A typographic statement row, divided by hairlines rather than boxed. */}
        <ul className="grid divide-y divide-border border-y border-border md:grid-cols-3 md:divide-x md:divide-y-0">
          {VALUES.map((v) => (
            <li key={v.title} className="py-6 md:px-8 md:py-8 md:first:pl-0 md:last:pr-0">
              <h3 className="font-serif text-2xl font-bold text-brand">{v.title}</h3>
              <p className="mt-2 max-w-sm text-pretty leading-relaxed text-foreground/80">{v.text}</p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="journey-heading" className="bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:py-16">
          <h2 id="journey-heading" className="font-serif text-3xl font-bold text-brand">
            From farm to cup
          </h2>
          {/* On phones a hairline joins the numbered discs so the steps read as one journey. */}
          <ol className="mt-8 grid gap-x-8 gap-y-8 sm:mt-10 sm:grid-cols-2 sm:gap-y-10 lg:grid-cols-3">
            {STEPS.map((s, i) => (
              <li
                key={s.title}
                className="relative pl-14 before:absolute before:-bottom-7 before:left-5 before:top-11 before:w-px before:bg-border last:before:hidden sm:before:hidden"
              >
                <span
                  aria-hidden="true"
                  className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-full bg-brand font-serif text-lg font-bold text-brand-contrast"
                >
                  {i + 1}
                </span>
                <h3 className="font-semibold text-foreground">{s.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-foreground/80">{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section aria-labelledby="farmers-heading" className="mx-auto max-w-6xl px-4 py-14 sm:py-16">
        <div className="max-w-2xl">
          <h2 id="farmers-heading" className="font-serif text-3xl font-bold text-brand">
            The people behind your cup
          </h2>
          <p className="mt-3 text-foreground/80">
            A few of the member families whose coffee is in this season&apos;s lots.
          </p>
        </div>
        <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {farmers.map((f, i) => {
            const farmerLots = lots.filter((l) => l.farmerIds.includes(f.id));
            return (
              <li key={f.id} className="flex flex-col rounded-2xl border border-border bg-surface p-5 shadow-sm">
                <div className="flex items-center gap-4">
                  <span
                    aria-hidden="true"
                    className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full font-serif text-lg font-bold text-white ${
                      AVATAR_COLOURS[i % AVATAR_COLOURS.length]
                    }`}
                  >
                    {initials(f.name)}
                  </span>
                  <div className="min-w-0">
                    <h3 className="font-serif text-lg font-bold text-brand">{f.name}</h3>
                    <p className="text-sm text-muted">
                      {f.village} · member since {f.joinedYear}
                    </p>
                  </div>
                </div>
                <p className="mt-4 flex-1 text-sm leading-relaxed text-foreground/80">
                  <LiveFarmerStory id={f.id} fallback={f.story} />
                </p>
                <dl className="mt-4 flex flex-wrap gap-x-6 gap-y-1 border-t border-border pt-3 text-sm">
                  <div className="flex gap-1.5">
                    <dt className="text-muted">Altitude</dt>
                    <dd className="font-semibold tabular-nums">{f.altitudeMetres.toLocaleString("en-GB")} m</dd>
                  </div>
                  <div className="flex gap-1.5">
                    <dt className="text-muted">Coffee plot</dt>
                    <dd className="font-semibold tabular-nums">{f.plotHectares} ha</dd>
                  </div>
                </dl>
                {farmerLots.length > 0 && (
                  <p className="mt-1 flex flex-wrap items-center gap-x-1 text-sm text-muted">
                    <span className="mr-1">In lots:</span>
                    {farmerLots.map((l, j) => (
                      <span key={l.code} className="inline-flex items-center">
                        <Link
                          href={`/trace/${l.code}`}
                          className="inline-flex min-h-11 items-center font-mono font-semibold text-accent hover:underline"
                        >
                          {l.code}
                        </Link>
                        {j < farmerLots.length - 1 && ","}
                      </span>
                    ))}
                  </p>
                )}
              </li>
            );
          })}
        </ul>
        <p className="mt-6 text-xs text-muted">Farmer names and stories on this demo are illustrative.</p>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-6 pt-4 sm:pt-6">
        <div className="on-dark flex flex-col items-start justify-between gap-5 rounded-3xl bg-brand px-6 py-10 text-brand-contrast sm:flex-row sm:items-center sm:px-10">
          <div>
            <h2 className="font-serif text-2xl font-bold sm:text-3xl">Support these farmers with every cup</h2>
            <p className="mt-2 text-brand-contrast/80">Order direct from the cooperative, delivered across Cameroon and abroad.</p>
          </div>
          <Link href="/shop" className="btn btn-lg shrink-0 bg-surface text-brand hover:bg-accent-soft">
            Shop the harvest
          </Link>
        </div>
      </section>
    </>
  );
}
