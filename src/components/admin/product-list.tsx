"use client";

import Image from "next/image";
import Link from "next/link";
import { updateProduct, useCatalog, useCatalogOverrides } from "@/lib/catalog-overrides";
import { formatPrice } from "@/lib/currency";
import { getProduct } from "@/lib/data";
import { PageTitle, Toggle, useToast } from "./ui";

export function LiveVersionNote() {
  return (
    <p className="mt-4 rounded-xl border border-accent/30 bg-accent-soft px-4 py-3 text-sm text-accent">
      In the live version these changes are saved securely online and appear for every customer.
    </p>
  );
}

export function AdminProductList() {
  const { products } = useCatalog();
  const { overrides } = useCatalogOverrides();
  const { toast, show } = useToast();

  function save(ok: boolean, message: string) {
    show(ok ? message : "Could not save: this browser is blocking storage.", ok ? "success" : "error");
  }

  return (
    <div>
      <PageTitle title="Products" intro="Tap a product to change its name, price, photo, stock or description." />
      <LiveVersionNote />

      <ul className="mt-6 space-y-3">
        {products.map((p) => {
          const edited = !!overrides.products[p.slug];
          const originalStock = getProduct(p.slug)?.stock ?? 0;
          return (
            <li key={p.slug} className="rounded-2xl border border-border bg-surface p-3 sm:p-4">
              <Link
                href={`/admin/products/${p.slug}`}
                className="flex min-h-16 items-center gap-3 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                <Image
                  src={p.image}
                  alt=""
                  width={160}
                  height={120}
                  unoptimized
                  className="h-16 w-20 shrink-0 rounded-lg bg-accent-soft object-cover"
                />
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold leading-snug text-brand">{p.name}</span>
                  <span className="mt-0.5 block text-sm text-muted">
                    {formatPrice(p.priceXaf)} · {p.stock <= 0 ? <span className="font-semibold text-red-700">Sold out</span> : `${p.stock} in stock`}
                  </span>
                  <span className="mt-1 flex flex-wrap gap-1.5">
                    {p.hidden && (
                      <span className="rounded-full bg-border px-2 py-0.5 text-xs font-medium text-foreground">Hidden from website</span>
                    )}
                    {edited && <span className="rounded-full bg-warm/15 px-2 py-0.5 text-xs font-medium text-warm">Edited</span>}
                  </span>
                </span>
                <span className="shrink-0 rounded-lg border border-border px-3 py-2 text-sm font-semibold text-brand">Edit</span>
              </Link>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <Toggle
                  label="Visible on website"
                  checked={!p.hidden}
                  onChange={(visible) =>
                    save(
                      updateProduct(p.slug, { hidden: visible ? undefined : true }),
                      visible ? `${p.name} is back on the website.` : `${p.name} is now hidden from the website.`,
                    )
                  }
                />
                <Toggle
                  label="Sold out"
                  description={p.stock <= 0 ? "Customers cannot order it" : undefined}
                  checked={p.stock <= 0}
                  onChange={(soldOut) =>
                    save(
                      updateProduct(p.slug, { stock: soldOut ? 0 : originalStock > 0 ? undefined : 10 }),
                      soldOut ? `${p.name} is marked sold out.` : `${p.name} is back in stock.`,
                    )
                  }
                />
              </div>
            </li>
          );
        })}
      </ul>
      {toast}
    </div>
  );
}
