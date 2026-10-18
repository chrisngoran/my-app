"use client";

import Image from "next/image";
import Link from "next/link";
import { updateProduct, useCatalog, useCatalogOverrides } from "@/lib/catalog-overrides";
import { formatPrice } from "@/lib/currency";
import { getProduct } from "@/lib/data";
import { EditedChip, InfoMark, PageTitle, STORAGE_BLOCKED, Toggle, useToast } from "./ui";
import { isUploadedImage } from "@/lib/catalog-clean";

export function LiveVersionNote() {
  return (
    <p className="mt-4 flex max-w-[65ch] items-start gap-2 rounded-lg bg-accent-soft p-3 text-sm text-foreground">
      <InfoMark className="mt-0.5 h-4 w-4 text-accent" />
      <span>In the live version these changes are saved securely online and appear for every customer.</span>
    </p>
  );
}

export function AdminProductList() {
  const { products } = useCatalog();
  const { overrides } = useCatalogOverrides();
  const { toast, show } = useToast();

  function save(ok: boolean, message: string) {
    show(ok ? message : `Not saved. ${STORAGE_BLOCKED}`, ok ? "success" : "error");
  }

  return (
    <div>
      <PageTitle title="Products" intro="Tap a product to change its name, price, photo, stock or description." />
      <LiveVersionNote />

      <ul className="mt-6 divide-y divide-border rounded-2xl border border-border bg-surface">
        {products.map((p) => {
          const edited = !!overrides.products[p.slug];
          const originalStock = getProduct(p.slug)?.stock ?? 0;
          return (
            <li key={p.slug} className="px-4 pt-4 pb-2">
              {/* The Edit link stretches over this whole top row, so the photo and name are a tap target too. */}
              <div className="relative flex items-start gap-3">
                <Image
                  src={p.image}
                  alt=""
                  width={112}
                  height={112}
                  unoptimized={isUploadedImage(p.image)}
                  className="h-14 w-14 shrink-0 rounded-lg bg-accent-soft object-cover"
                />
                <div className="min-w-0 flex-1">
                  <h2 className="type-title text-brand [overflow-wrap:anywhere]">{p.name}</h2>
                  <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted">
                    <span className="tabular-nums">{formatPrice(p.priceXaf)}</span>
                    {p.stock <= 0 ? (
                      <span className="rounded-md bg-danger-soft px-2 py-0.5 text-xs font-semibold text-danger">Sold out</span>
                    ) : (
                      <span className="tabular-nums">{p.stock.toLocaleString("en-GB")} in stock</span>
                    )}
                    {p.hidden && (
                      <span className="rounded-md bg-background px-2 py-0.5 text-xs font-semibold text-foreground">Hidden from website</span>
                    )}
                    {edited && <EditedChip />}
                  </p>
                </div>
                <Link
                  href={`/admin/products/${p.slug}`}
                  className="btn btn-secondary shrink-0 px-4 text-sm after:absolute after:inset-0 after:content-['']"
                >
                  Edit<span className="sr-only"> {p.name}</span>
                </Link>
              </div>
              {/* Each switch sits right after its own label; the rule between the halves keeps the pairs apart. */}
              <div className="mt-2 grid grid-cols-[repeat(2,minmax(0,1fr))] sm:grid-cols-[repeat(2,max-content)]">
                <div className="min-w-0 pr-4 sm:pr-6">
                  <Toggle
                    bare
                    label="Visible on website"
                    checked={!p.hidden}
                    onChange={(visible) =>
                      save(
                        updateProduct(p.slug, { hidden: visible ? undefined : true }),
                        visible ? `${p.name} is back on the website.` : `${p.name} is now hidden from the website.`,
                      )
                    }
                  />
                </div>
                <div className="min-w-0 border-l border-border pl-4 sm:pl-6">
                  <Toggle
                    bare
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
              </div>
            </li>
          );
        })}
      </ul>
      {toast}
    </div>
  );
}
