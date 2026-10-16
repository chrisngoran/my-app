import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CATEGORY_LABELS, formatWeight } from "@/components/storefront/catalog";
import {
  LiveProductDescription,
  LiveProductImage,
  LiveProductName,
  LiveProductStock,
} from "@/components/storefront/live-catalog";
import { LotTag } from "@/components/storefront/lot-tag";
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
  const related = products.filter((p) => p.slug !== product.slug).slice(0, 3);

  // The lot tag carries processing, variety, altitude, harvest and score; these are the bag's own facts.
  const details: { label: string; value: string }[] = [
    { label: "Weight", value: formatWeight(product.weightGrams) },
    ...(product.roast
      ? [{ label: "Roast", value: product.roast }]
      : product.category === "green"
        ? [{ label: "Roast", value: "Unroasted (green)" }]
        : []),
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 pb-10 pt-3 sm:pb-12 sm:pt-6">
      <nav aria-label="Breadcrumb" className="text-sm text-muted">
        <ol className="flex flex-wrap items-center gap-x-2">
          <li>
            <Link href="/shop" className="inline-flex min-h-11 items-center hover:text-brand hover:underline">
              Shop
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link
              href={`/shop?category=${product.category}`}
              className="inline-flex min-h-11 items-center hover:text-brand hover:underline"
            >
              {CATEGORY_LABELS[product.category]}
            </Link>
          </li>
          {/* The page title repeats the name right below, so phones skip this crumb. */}
          <li aria-hidden="true" className="max-sm:hidden">
            /
          </li>
          <li aria-current="page" className="min-w-0 py-3 text-foreground [overflow-wrap:anywhere] max-sm:hidden">
            <LiveProductName slug={product.slug} fallback={product.name} />
          </li>
        </ol>
      </nav>

      <div className="mt-2 grid grid-cols-[minmax(0,1fr)] gap-8 lg:mt-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-14">
        <div className="relative overflow-hidden rounded-2xl bg-accent-soft lg:sticky lg:top-6 lg:self-start">
          <LiveProductImage
            slug={product.slug}
            fallbackSrc={product.image}
            alt={`${product.name}, ${formatWeight(product.weightGrams)} bag`}
            preload
            className="aspect-[4/3] h-auto w-full object-cover"
          />
          {/* On phones the lot record is a screen away, so the code is tagged on the photo; on desktop the lot record sits beside it. */}
          <span
            aria-hidden="true"
            className="type-stencil absolute bottom-4 left-4 rounded-md bg-sand px-2.5 py-1 text-2xl text-brand lg:hidden"
          >
            {product.lotCode}
          </span>
        </div>

        <div className="min-w-0">
          <h1 className="type-h1 text-brand [overflow-wrap:anywhere]">
            <LiveProductName slug={product.slug} fallback={product.name} />
          </h1>
          <div className="mt-3">
            <LiveProductStock slug={product.slug} fallback={product.stock} />
          </div>
          <LiveProductDescription
            slug={product.slug}
            fallback={product.description}
            className="type-lead mt-4 max-w-[60ch] text-foreground [overflow-wrap:anywhere]"
          />

          {product.cuppingNotes.length > 0 && (
            <section aria-labelledby="notes-heading" className="mt-6">
              <h2 id="notes-heading" className="type-label text-muted">
                Cupping notes
              </h2>
              <ul className="mt-2 flex flex-wrap gap-2">
                {product.cuppingNotes.map((n) => (
                  <li key={n} className="rounded-lg bg-accent-soft px-3 py-1 text-sm font-medium text-accent">
                    {n}
                  </li>
                ))}
              </ul>
            </section>
          )}

          <div className="mt-6">
            <ProductPurchase slug={product.slug} name={product.name} priceXaf={product.priceXaf} stock={product.stock} />
          </div>

          {lot && <LotTag lot={lot} growers={growers} className="mt-8" />}

          <section aria-labelledby="details-heading" className="mt-8">
            <h2 id="details-heading" className="type-label text-muted">
              About the bag
            </h2>
            <dl className="mt-2 divide-y divide-border border-y border-border">
              {details.map((d) => (
                <div key={d.label} className="flex items-baseline justify-between gap-4 py-2.5">
                  <dt className="text-sm text-muted">{d.label}</dt>
                  <dd className="type-data text-right">{d.value}</dd>
                </div>
              ))}
            </dl>
          </section>
        </div>
      </div>

      <section aria-labelledby="related-heading" className="mt-14 sm:mt-16">
        <h2 id="related-heading" className="type-h2 text-brand">
          You may also like
        </h2>
        <ProductGrid
          products={related}
          compact
          className="mt-5 grid grid-cols-[minmax(0,1fr)] gap-x-6 gap-y-4 sm:mt-6 sm:grid-cols-[repeat(2,minmax(0,1fr))] lg:grid-cols-[repeat(3,minmax(0,1fr))]"
        />
      </section>
    </div>
  );
}
