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
import { AdminLoading, ConfirmButton, errorText, inputClass, primaryButton, secondaryButton, Spinner, Toggle, useToast } from "./ui";

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
  const { toast, show } = useToast({ raised: true });
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
  // Compared with what the website shows now, so it clears after a save.
  const dirty =
    name.trim() !== product.name ||
    Number(price) !== product.priceXaf ||
    stock.trim() !== String(product.stock) ||
    description.trim() !== product.description.trim() ||
    visible !== !product.hidden ||
    shownImage !== product.image;

  return (
    <div>
      <Link href="/admin/products" className="inline-flex min-h-11 items-center text-sm font-medium text-accent hover:underline">
        ← All products
      </Link>
      <h1 className="mt-1 font-serif text-2xl font-bold text-brand sm:text-3xl">Edit product</h1>
      <p className="mt-1 text-sm text-muted">{original.name}</p>
      <LiveVersionNote />

      <form noValidate onSubmit={onSubmit} className="mt-6 space-y-5 rounded-2xl border border-border bg-surface p-4 sm:p-5">
        <section aria-labelledby={`${ids}-photo`} aria-busy={photoBusy}>
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
            <label
              className={`${secondaryButton} cursor-pointer has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ring ${
                photoBusy ? "pointer-events-none opacity-70" : ""
              }`}
            >
              <input
                ref={fileInput}
                type="file"
                accept="image/*"
                className="sr-only"
                disabled={photoBusy}
                onChange={(e) => onPhotoChosen(e.target.files?.[0])}
              />
              {photoBusy && <Spinner />}
              <span aria-live="polite">{photoBusy ? "Preparing photo…" : photo ? "Choose another photo" : "Upload a photo"}</span>
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
            <p role="alert" className={`${errorText} mt-2`}>
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
            <span id={`${ids}-name-err`} className={errorText}>
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
            <span id={`${ids}-price-hint`} className={errors.price ? errorText : "mt-1 block text-sm text-muted"}>
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
            <span id={`${ids}-stock-hint`} className={errors.stock ? errorText : "mt-1 block text-sm text-muted"}>
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

        {/* On phones the actions stay at the bottom of the screen, so Save is always in reach on this long form. */}
        <div className="sticky bottom-0 z-10 -mx-4 border-t border-border bg-surface px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:static sm:mx-0 sm:px-0 sm:pt-5 sm:pb-0">
          <div className="flex flex-wrap items-center gap-2">
            <button type="submit" className={`${primaryButton} flex-1 whitespace-nowrap max-sm:px-3 sm:flex-none`} disabled={photoBusy}>
              Save changes
            </button>
            <Link href={`/shop/${original.slug}`} className={`${secondaryButton} flex-1 whitespace-nowrap max-sm:px-3 sm:flex-none`}>
              View on website
            </Link>
            {!saved && dirty && (
              <span
                aria-hidden="true"
                className="order-first inline-flex w-full items-center gap-2 text-sm font-medium text-warm-ink sm:order-none sm:ml-1 sm:w-auto"
              >
                <span className="h-2 w-2 rounded-full bg-warm" />
                Unsaved changes
              </span>
            )}
            <span className="sr-only" aria-live="polite">
              {!saved && dirty ? "Unsaved changes" : ""}
            </span>
          </div>
        </div>
        {saved && (
          <p className="rounded-lg bg-accent-soft px-4 py-3 text-sm font-semibold text-accent transition-[opacity,translate] duration-180 ease-out starting:-translate-y-1 starting:opacity-0 motion-reduce:transition-opacity motion-reduce:duration-150">
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
