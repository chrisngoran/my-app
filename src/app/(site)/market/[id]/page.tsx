import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { ShareLinks } from "@/components/share-links";
import { formatWeight } from "@/components/storefront/catalog";
import { ProductPurchase } from "@/components/storefront/product-purchase";
import { hasDatabase } from "@/lib/db";
import { farmerById, listingById, toProduct } from "@/lib/market";

async function load(idParam: string) {
  const id = Number(idParam);
  if (!hasDatabase() || !Number.isSafeInteger(id) || id < 1) return null;
  const listing = await listingById(id).catch(() => null);
  if (!listing || listing.status !== "approved") return null;
  const farmer = await farmerById(listing.farmerId).catch(() => null);
  if (!farmer?.active) return null;
  return { product: toProduct(listing, { id: farmer.id, name: farmer.name, village: farmer.village }), farmer };
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  await connection();
  const found = await load((await params).id);
  if (!found) return { title: "Coffee not found" };
  return {
    title: `${found.product.name}, from ${found.farmer.name}`,
    description: found.product.description || `Coffee grown by ${found.farmer.name} and sold through GREENVENTURES Cooperative, Kumbo.`,
  };
}

export default function MarketListingPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <div className="mx-auto max-w-6xl px-4 pb-10 pt-6">
      <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-border/40 motion-reduce:animate-none" />}>
        <Listing params={params} />
      </Suspense>
    </div>
  );
}

async function Listing({ params }: { params: Promise<{ id: string }> }) {
  // Listings change as farmers and staff edit them, so each visit reads them fresh.
  await connection();
  const found = await load((await params).id);
  if (!found) notFound();
  const { product, farmer } = found;
  return (
    <>
      <nav aria-label="Breadcrumb" className="text-sm text-muted">
        <Link href="/shop" className="underline underline-offset-[3px]">
          Shop
        </Link>{" "}
        /{" "}
        <Link href={`/farmers/${farmer.id}`} className="underline underline-offset-[3px]">
          {farmer.name}
        </Link>
      </nav>
      <div className="mt-4 grid gap-8 lg:grid-cols-2">
        <Image src={product.image} alt={`${product.name}, from ${farmer.name}`} width={900} height={675} unoptimized className="aspect-[4/3] h-auto w-full rounded-2xl object-cover" />
        <div className="min-w-0">
          <h1 className="type-h1 text-brand [overflow-wrap:anywhere]">{product.name}</h1>
          <p className="mt-2 text-foreground">
            Grown by{" "}
            <Link href={`/farmers/${farmer.id}`} className="font-semibold text-accent underline underline-offset-[3px]">
              {farmer.name}
            </Link>
            {farmer.village ? `, ${farmer.village}` : ""}. Sold and delivered by GREENVENTURES Cooperative.
          </p>
          {product.description && <p className="type-lead mt-4 max-w-[60ch] whitespace-pre-line text-foreground [overflow-wrap:anywhere]">{product.description}</p>}
          <p className="mt-3 text-sm text-muted">
            {formatWeight(product.weightGrams)}, {product.category === "green" ? "unroasted green coffee" : "roasted coffee"}
          </p>
          <div className="mt-6">
            <ProductPurchase slug={product.slug} name={product.name} priceXaf={product.priceXaf} stock={product.stock} />
            <ShareLinks path={`/market/${product.slug.slice(2)}`} text={`${product.name} from ${farmer.name}, via GREENVENTURES Coffee:`} />
          </div>
        </div>
      </div>
    </>
  );
}
