import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CATEGORY_LABELS, formatWeight } from "@/components/storefront/catalog";
import {
  LiveLotNotes,
  LiveLotScore,
  LiveProductDescription,
  LiveProductImage,
  LiveProductName,
  LiveProductStock,
} from "@/components/storefront/live-catalog";
import { ProductGrid } from "@/components/storefront/product-card";
import { ProductPurchase } from "@/components/storefront/product-purchase";
import { getFarmer, getLot, getProduct, products } from "@/lib/data";

// Unknown slugs must wait for the full render so notFound() returns a real 404
// instead of a streamed soft 404 with status 200.
export const ensureStatic = "navigation";

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) return { title: "Product not found" };
  return { title: product.name, description: product.description };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();

  const lot = getLot(product.lotCode);
  const growers = lot ? lot.farmerIds.flatMap((id) => getFarmer(id) ?? []) : [];
  const altitudes = growers.map((f) => f.altitudeMetres);
  const related = products.filter((p) => p.slug !== product.slug).slice(0, 3);

  const details: { label: string; value: React.ReactNode }[] = [
    { label: "Weight", value: formatWeight(product.weightGrams) },
    { label: "Roast", value: product.roast ?? (product.category === "green" ? "Unroasted (green)" : "—") },
    ...(lot
      ? [
          { label: "Processing", value: lot.processingMethod },
          { label: "Variety", value: lot.variety },
          {
            label: "Altitude",
            value: altitudes.length
              ? Math.min(...altitudes) === Math.max(...altitudes)
                ? `${altitudes[0].toLocaleString("en-GB")} m`
                : `${Math.min(...altitudes).toLocaleString("en-GB")}–${Math.max(...altitudes).toLocaleString("en-GB")} m`
              : "1,600–2,000 m",
          },
          {
            label: "Cupping score",
            value: (
              <>
                <LiveLotScore code={lot.code} fallback={lot.quality.cuppingScore} /> / 100
              </>
            ),
          },
        ]
      : []),
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:py-12">
      <nav aria-label="Breadcrumb" className="text-sm text-muted">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li>
            <Link href="/shop" className="hover:text-brand hover:underline">
              Shop
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link href={`/shop?category=${product.category}`} className="hover:text-brand hover:underline">
              {CATEGORY_LABELS[product.category]}
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-foreground">
            <LiveProductName slug={product.slug} fallback={product.name} />
          </li>
        </ol>
      </nav>

      <div className="mt-6 grid gap-8 lg:grid-cols-2 lg:gap-12">
        <div className="overflow-hidden rounded-3xl border border-border bg-accent-soft lg:sticky lg:top-6 lg:self-start">
          <LiveProductImage
            slug={product.slug}
            fallbackSrc={product.image}
            alt={`${product.name} — ${formatWeight(product.weightGrams)} bag`}
            preload
            className="aspect-[4/3] h-auto w-full object-cover"
          />
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-accent">{CATEGORY_LABELS[product.category]}</p>
          <h1 className="mt-1 font-serif text-3xl font-bold leading-tight text-brand sm:text-4xl">
            <LiveProductName slug={product.slug} fallback={product.name} />
          </h1>
          <div className="mt-3">
            <LiveProductStock slug={product.slug} fallback={product.stock} />
          </div>
          <p className="mt-4 text-lg leading-relaxed text-foreground/85">
            <LiveProductDescription slug={product.slug} fallback={product.description} />
          </p>

          <section aria-labelledby="notes-heading" className="mt-6">
            <h2 id="notes-heading" className="text-sm font-semibold uppercase tracking-wider text-muted">
              Cupping notes
            </h2>
            <ul className="mt-2 flex flex-wrap gap-2">
              {product.cuppingNotes.map((n) => (
                <li key={n} className="rounded-full bg-accent-soft px-3 py-1 text-sm font-medium text-accent">
                  {n}
                </li>
              ))}
            </ul>
          </section>

          <div className="mt-6">
            <ProductPurchase slug={product.slug} name={product.name} priceXaf={product.priceXaf} stock={product.stock} />
          </div>

          <section aria-labelledby="details-heading" className="mt-8">
            <h2 id="details-heading" className="font-serif text-xl font-bold text-brand">
              Coffee details
            </h2>
            <dl className="mt-3 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border text-sm">
              {details.map((d) => (
                <div key={d.label} className="bg-surface p-3">
                  <dt className="text-muted">{d.label}</dt>
                  <dd className="mt-0.5 font-semibold">{d.value}</dd>
                </div>
              ))}
            </dl>
          </section>

          {lot && (
            <section aria-labelledby="origin-heading" className="mt-8 rounded-2xl border border-accent/30 bg-accent-soft p-5">
              <h2 id="origin-heading" className="font-serif text-xl font-bold text-accent">
                Where this coffee comes from
              </h2>
              <p className="mt-2 text-sm text-foreground/85">
                <LiveLotNotes code={lot.code} fallback={lot.notes} />
              </p>
              {growers.length > 0 && (
                <p className="mt-3 text-sm">
                  <span className="font-semibold">Grown by: </span>
                  {growers.map((f) => `${f.name} (${f.village})`).join(", ")}
                </p>
              )}
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <Link
                  href={`/trace/${lot.code}`}
                  className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-brand-contrast hover:bg-accent/90"
                >
                  <svg aria-hidden="true" viewBox="0 0 20 20" className="h-4 w-4" fill="currentColor">
                    <path d="M2 2h6v6H2zm2 2v2h2V4zm8-2h6v6h-6zm2 2v2h2V4zM2 12h6v6H2zm2 2v2h2v-2zm7-2h2v2h-2zm2 2h2v2h-2zm2-2h3v2h-3zm-4 4h2v2h-2zm4 0h3v2h-3z" />
                  </svg>
                  Trace this coffee
                </Link>
                <span className="font-mono text-sm text-muted">Lot {lot.code}</span>
              </div>
            </section>
          )}
        </div>
      </div>

      <section aria-labelledby="related-heading" className="mt-16">
        <h2 id="related-heading" className="font-serif text-2xl font-bold text-brand">
          You may also like
        </h2>
        <ProductGrid products={related} className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3" />
      </section>
    </div>
  );
}
