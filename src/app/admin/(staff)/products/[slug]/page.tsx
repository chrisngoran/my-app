import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdminProductEdit } from "@/components/admin/product-form";
import { getProduct, products } from "@/lib/data";

// Unknown slugs must wait for the full render so notFound() returns a real 404.
export const ensureStatic = "navigation";

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);
  return {
    title: product ? `Edit ${product.name}` : "Product not found",
    robots: { index: false, follow: false },
  };
}

export default async function AdminProductEditPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!getProduct(slug)) notFound();
  return <AdminProductEdit slug={slug} />;
}
