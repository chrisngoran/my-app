import type { Metadata } from "next";
import Link from "next/link";
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

const AVATAR_COLOURS = ["bg-brand", "bg-accent", "bg-warm", "bg-[#7a4a33]", "bg-[#245432]", "bg-[#a6662a]"];

export default function OurStoryPage() {
  return (
    <>
      <section className="bg-gradient-to-b from-accent-soft/60 to-background">
        <div className="mx-auto max-w-4xl px-4 py-12 text-center sm:py-16">
          <p className="text-sm font-semibold uppercase tracking-wider text-accent">Our story</p>
          <h1 className="mt-2 font-serif text-4xl font-bold leading-tight text-brand sm:text-5xl">
            A cooperative of coffee families in the Bui highlands
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-foreground/80">{cooperative.story}</p>
          <p className="mt-4 text-sm text-muted">{cooperative.location}</p>
        </div>
      </section>

      <section aria-labelledby="values-heading" className="mx-auto max-w-6xl px-4 py-12">
        <h2 id="values-heading" className="sr-only">
          What we stand for
        </h2>
        <ul className="grid gap-5 md:grid-cols-3">
          {VALUES.map((v) => (
            <li key={v.title} className="rounded-2xl border border-border bg-surface p-6">
              <h3 className="font-serif text-xl font-bold text-brand">{v.title}</h3>
              <p className="mt-2 text-foreground/80">{v.text}</p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="journey-heading" className="bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:py-16">
          <p className="text-sm font-semibold uppercase tracking-wider text-accent">How it works</p>
          <h2 id="journey-heading" className="mt-1 font-serif text-3xl font-bold text-brand">
            From farm to cup
          </h2>
          <ol className="mt-10 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {STEPS.map((s, i) => (
              <li key={s.title} className="relative pl-14">
                <span
                  aria-hidden="true"
                  className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-full bg-brand font-serif text-lg font-bold text-brand-contrast"
                >
                  {i + 1}
                </span>
                <h3 className="font-semibold text-foreground">{s.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-foreground/75">{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section aria-labelledby="farmers-heading" className="mx-auto max-w-6xl px-4 py-14 sm:py-16">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-accent">Meet the farmers</p>
          <h2 id="farmers-heading" className="mt-1 font-serif text-3xl font-bold text-brand">
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
                <p className="mt-4 flex-1 text-sm leading-relaxed text-foreground/85">{f.story}</p>
                <dl className="mt-4 grid grid-cols-2 gap-2 text-sm">
                  <div className="rounded-lg bg-background p-2.5">
                    <dt className="text-xs text-muted">Altitude</dt>
                    <dd className="font-semibold">{f.altitudeMetres.toLocaleString("en-GB")} m</dd>
                  </div>
                  <div className="rounded-lg bg-background p-2.5">
                    <dt className="text-xs text-muted">Coffee plot</dt>
                    <dd className="font-semibold">{f.plotHectares} ha</dd>
                  </div>
                </dl>
                {farmerLots.length > 0 && (
                  <p className="mt-3 text-xs text-muted">
                    In lots:{" "}
                    {farmerLots.map((l, j) => (
                      <span key={l.code}>
                        {j > 0 && ", "}
                        <Link href={`/trace/${l.code}`} className="font-mono text-accent hover:underline">
                          {l.code}
                        </Link>
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

      <section className="mx-auto max-w-6xl px-4 pb-4">
        <div className="flex flex-col items-start justify-between gap-5 rounded-3xl bg-brand px-6 py-10 text-brand-contrast sm:flex-row sm:items-center sm:px-10">
          <div>
            <h2 className="font-serif text-2xl font-bold sm:text-3xl">Support these farmers with every cup</h2>
            <p className="mt-2 text-brand-contrast/80">Order direct from the cooperative, delivered across Cameroon and abroad.</p>
          </div>
          <Link
            href="/shop"
            className="inline-flex min-h-12 shrink-0 items-center justify-center rounded-lg bg-surface px-7 py-3 font-semibold text-brand hover:bg-accent-soft"
          >
            Shop the harvest
          </Link>
        </div>
      </section>
    </>
  );
}
