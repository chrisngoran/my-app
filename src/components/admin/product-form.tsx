"use client";

import Image from "next/image";
import Link from "next/link";
import { useId, useRef, useState } from "react";
import { type CatalogProduct, resetProduct, updateProduct, useCatalogOverrides, useProductView } from "@/lib/catalog-overrides";
import { formatPrice } from "@/lib/currency";
import { getProduct } from "@/lib/data";
import type { Product } from "@/lib/types";
import { LiveVersionNote } from "./product-list";
import { resizeImage } from "./resize-image";
import { AdminLoading, ConfirmButton, inputClass, primaryButton, secondaryButton, Toggle, useToast } from "./ui";

export function AdminProductEdit({ slug }: { slug: string }) {
  const { loaded, resets } = useCatalogOverrides();
  const product = useProductView(slug);
  const original = getProduct(slug);
  if (!loaded || !product || !original) return <AdminLoading label="Loading product" />;
  return <ProductForm key={resets} product={product} original={original} />;
}

interface Errors {
  name?: string;
  price?: string;
  stock?: string;
}

function ProductForm({ product, original }: { product: CatalogProduct; original: Product }) {
  const [name, setName] = useState(product.name);
  const [price, setPrice] = useState(String(product.priceXaf));
  const [stock, setStock] = useState(String(product.stock));
  const [description, setDescription] = useState(product.description);
  const [visible, setVisible] = useState(!product.hidden);
  /** Uploaded photo (data URL), or null to show the original photo. */
  const [photo, setPhoto] = useState<string | null>(product.image !== original.image ? product.image : null);
  const [photoBusy, setPhotoBusy] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Errors>({});
  const [saved, setSaved] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const { toast, show } = useToast();
  const ids = useId();

  const touch = () => setSaved(false);

  async function onPhotoChosen(file: File | undefined) {
    if (!file) return;
    setPhotoBusy(true);
    setPhotoError(null);
    try {
      setPhoto(await resizeImage(file));
      touch();
    } catch (err) {
      setPhotoError(err instanceof Error ? err.message : "This photo could not be used.");
    } finally {
      setPhotoBusy(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const next: Errors = {};
    const priceValue = Number(price);
    const stockValue = Number(stock);
    if (!name.trim()) next.name = "Enter a product name.";
    if (price.trim() === "" || !Number.isFinite(priceValue) || priceValue <= 0) next.price = "Enter a price above 0 FCFA.";
    else if (!Number.isInteger(priceValue)) next.price = "FCFA prices are whole numbers, e.g. 4500.";
    if (stock.trim() === "" || !Number.isInteger(stockValue) || stockValue < 0) next.stock = "Enter a whole number, 0 or more.";
    setErrors(next);
    if (Object.keys(next).length) {
      show("Please check the highlighted fields.", "error");
      return;
    }

    // Only keep what differs from the original, so "Edited" and reset stay accurate.
    const ok = updateProduct(original.slug, {
      name: name.trim() !== original.name ? name.trim() : undefined,
      priceXaf: priceValue !== original.priceXaf ? priceValue : undefined,
      stock: stockValue !== original.stock ? stockValue : undefined,
      description: description.trim() !== original.description ? description.trim() : undefined,
      hidden: visible ? undefined : true,
      image: photo ?? undefined,
    });
    if (ok) {
      setSaved(true);
      show("Saved. The website now shows your changes.");
    } else {
      show("Could not save. The photo may be too large for this browser. Try a smaller photo.", "error");
    }
  }

  const shownImage = photo ?? original.image;

  return (
    <div>
      <Link href="/admin/products" className="inline-flex min-h-11 items-center text-sm font-medium text-accent hover:underline">
        ← All products
      </Link>
      <h1 className="mt-1 font-serif text-2xl font-bold text-brand sm:text-3xl">Edit product</h1>
      <p className="mt-1 text-sm text-muted">{original.name}</p>
      <LiveVersionNote />

      <form noValidate onSubmit={onSubmit} className="mt-6 space-y-5 rounded-2xl border border-border bg-surface p-4 sm:p-5">
        <section aria-labelledby={`${ids}-photo`}>
          <h2 id={`${ids}-photo`} className="text-sm font-medium">
            Photo
          </h2>
          <div className="mt-2 overflow-hidden rounded-xl border border-border bg-accent-soft">
            <Image
              src={shownImage}
              alt={`Photo of ${name || original.name}`}
              width={800}
              height={600}
              unoptimized
              className="aspect-[4/3] h-auto w-full object-cover"
            />
          </div>
          <p className="mt-2 text-xs text-muted">
            {photo ? "Your uploaded photo." : "Original demo photo."} Photos are made smaller (max 800 px wide) before saving.
          </p>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <label className={`${secondaryButton} cursor-pointer focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-accent`}>
              <input
                ref={fileInput}
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(e) => onPhotoChosen(e.target.files?.[0])}
              />
              {photoBusy ? "Preparing photo…" : photo ? "Choose another photo" : "Upload a photo"}
            </label>
            {photo && (
              <button
                type="button"
                className={secondaryButton}
                onClick={() => {
                  setPhoto(null);
                  touch();
                }}
              >
                Remove uploaded photo
              </button>
            )}
          </div>
          {photoError && (
            <p role="alert" className="mt-2 text-sm font-medium text-red-700">
              {photoError}
            </p>
          )}
        </section>

        <label className="block text-sm font-medium">
          Name
          <input
            className={inputClass}
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              touch();
            }}
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? `${ids}-name-err` : undefined}
          />
          {errors.name && (
            <span id={`${ids}-name-err`} className="mt-1 block text-sm text-red-700">
              {errors.name}
            </span>
          )}
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-medium">
            Price (FCFA)
            <input
              className={inputClass}
              type="number"
              inputMode="numeric"
              min={1}
              step={1}
              value={price}
              onChange={(e) => {
                setPrice(e.target.value);
                touch();
              }}
              aria-invalid={!!errors.price}
              aria-describedby={`${ids}-price-hint`}
            />
            <span id={`${ids}-price-hint`} className={`mt-1 block text-sm ${errors.price ? "text-red-700" : "text-muted"}`}>
              {errors.price ?? (Number(price) > 0 ? `Shown as ${formatPrice(Number(price))}` : "Price in FCFA")}
            </span>
          </label>
          <label className="block text-sm font-medium">
            Stock (bags)
            <input
              className={inputClass}
              type="number"
              inputMode="numeric"
              min={0}
              step={1}
              value={stock}
              onChange={(e) => {
                setStock(e.target.value);
                touch();
              }}
              aria-invalid={!!errors.stock}
              aria-describedby={`${ids}-stock-hint`}
            />
            <span id={`${ids}-stock-hint`} className={`mt-1 block text-sm ${errors.stock ? "text-red-700" : "text-muted"}`}>
              {errors.stock ?? "0 shows “Sold out” on the website"}
            </span>
          </label>
        </div>

        <label className="block text-sm font-medium">
          Description
          <textarea
            className={`${inputClass} min-h-32`}
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              touch();
            }}
          />
        </label>

        <Toggle
          label="Visible on website"
          description={visible ? "Customers can see and order it" : "Hidden from the shop and home page"}
          checked={visible}
          onChange={(v) => {
            setVisible(v);
            touch();
          }}
        />

        <div className="flex flex-col gap-2 border-t border-border pt-5 sm:flex-row sm:items-center">
          <button type="submit" className={primaryButton} disabled={photoBusy}>
            Save changes
          </button>
          <Link href={`/shop/${original.slug}`} className={secondaryButton}>
            View on website
          </Link>
        </div>
        {saved && (
          <p className="rounded-lg bg-accent-soft px-4 py-3 text-sm font-semibold text-accent">
            Saved.{" "}
            <Link href={`/shop/${original.slug}`} className="underline">
              View on website
            </Link>
          </p>
        )}
      </form>

      <div className="mt-6">
        <ConfirmButton
          label="Undo all changes to this product"
          question={`Put ${original.name} back to the original demo details and photo?`}
          confirmLabel="Yes, undo changes"
          onConfirm={() => {
            if (!resetProduct(original.slug)) {
              show("Could not reset: this browser is blocking storage.", "error");
              return;
            }
            const fresh: CatalogProduct = { ...original, hidden: false };
            setName(fresh.name);
            setPrice(String(fresh.priceXaf));
            setStock(String(fresh.stock));
            setDescription(fresh.description);
            setVisible(true);
            setPhoto(null);
            setErrors({});
            setSaved(false);
            show("Product put back to the original.");
          }}
        />
      </div>
      {toast}
    </div>
  );
}
