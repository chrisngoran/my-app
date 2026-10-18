"use client";

import Image from "next/image";
import Link from "next/link";
import { useId, useRef, useState } from "react";
import { type CatalogProduct, resetProduct, updateProduct, useCatalogOverrides, useProductView } from "@/lib/catalog-overrides";
import { formatFcfaText, formatPrice } from "@/lib/currency";
import { getProduct } from "@/lib/data";
import type { Product } from "@/lib/types";
import { LiveVersionNote } from "./product-list";
import { resizeImage } from "./resize-image";
import {
  AdminLoading,
  CheckMark,
  ChevronLeftMark,
  ConfirmButton,
  errorText,
  AlertMark,
  FieldHint,
  hintText,
  inputClass,
  labelClass,
  primaryButton,
  secondaryButton,
  Spinner,
  STORAGE_BLOCKED,
  Toggle,
  useToast,
} from "./ui";

/** Limits that keep one product readable on a phone-sized shop card and in a WhatsApp line. */
const NAME_MAX = 80;
const DESCRIPTION_MAX = 600;
const PRICE_MAX = 10_000_000;
const STOCK_MAX = 100_000;

/** "100 000": the site's number style, with non-breaking spaces so it never wraps inside the number. */
function formatCount(n: number) {
  return n.toLocaleString("fr-FR").replace(/[\s\u202f]/g, "\u00a0");
}

/** Field names as the labels show them, for the "Check … fields" message. */
const FIELD_NAMES: Record<keyof Errors, string> = { name: "Name", price: "Price", stock: "Stock" };

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
  const { mode } = useCatalogOverrides();
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
    else if (name.trim().length > NAME_MAX) next.name = `Keep the name to ${NAME_MAX} characters or fewer.`;
    if (price.trim() === "" || !Number.isFinite(priceValue) || priceValue <= 0) next.price = "Enter a price above 0 FCFA.";
    else if (!Number.isInteger(priceValue)) next.price = "FCFA prices are whole numbers, e.g. 4500.";
    else if (priceValue > PRICE_MAX) next.price = `Enter a price up to ${formatFcfaText(PRICE_MAX)}.`;
    if (stock.trim() === "" || !Number.isInteger(stockValue) || stockValue < 0) next.stock = "Enter a whole number, 0 or more.";
    else if (stockValue > STOCK_MAX) next.stock = `Enter a stock up to ${formatCount(STOCK_MAX)} bags.`;
    setErrors(next);
    const wrong = (Object.keys(next) as (keyof Errors)[]).map((k) => FIELD_NAMES[k]);
    if (wrong.length) {
      show(wrong.length === 1 ? `Check the ${wrong[0]} field.` : `Check ${wrong.length} fields: ${wrong.join(", ")}.`, "error");
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
      show(mode === "shared" ? "Saved. The website shows your change to everyone." : "Saved. The website shows your change in this browser.");
    } else {
      show("Not saved. The photo may be too large for this browser. Try a smaller photo.", "error");
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
      <Link
        href="/admin/products"
        className="-ml-1 inline-flex min-h-11 items-center gap-1 rounded-lg px-1 text-sm font-semibold text-accent underline underline-offset-[3px] hover:decoration-2"
      >
        <ChevronLeftMark />
        All products
      </Link>
      <h1 className="mt-1 text-2xl leading-tight font-bold text-brand [font-stretch:88%]">Edit product</h1>
      <p className="mt-1 text-muted [overflow-wrap:anywhere]">{original.name}</p>
      <LiveVersionNote />

      <form noValidate onSubmit={onSubmit} className="mt-6 space-y-6 rounded-2xl border border-border bg-surface p-4 sm:p-6">
        <section aria-labelledby={`${ids}-photo`} aria-busy={photoBusy}>
          <h2 id={`${ids}-photo`} className={labelClass}>
            Photo
          </h2>
          <div className="mt-2 overflow-hidden rounded-2xl bg-accent-soft">
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
            {photo ? "Your uploaded photo." : "Original demo photo."} Photos are cropped to the 4:3 shape the shop shows and made smaller (max 800 px wide) before saving.
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
              <AlertMark />
              {photoError}
            </p>
          )}
        </section>

        <label className={labelClass}>
          Name
          <input
            className={inputClass}
            value={name}
            maxLength={NAME_MAX}
            onChange={(e) => {
              setName(e.target.value);
              touch();
            }}
            aria-invalid={!!errors.name}
            aria-describedby={`${ids}-name-err ${ids}-name-count`}
          />
          <span className="flex items-start justify-between gap-3">
            <FieldHint id={`${ids}-name-err`} error={errors.name} />
            <span id={`${ids}-name-count`} className="mt-1.5 ml-auto shrink-0 text-sm font-normal tracking-normal text-muted tabular-nums">
              <span className="sr-only">Characters used: </span>
              {name.length}/{NAME_MAX}
            </span>
          </span>
        </label>

        <div className="grid grid-cols-[minmax(0,1fr)] gap-5 sm:grid-cols-[repeat(2,minmax(0,1fr))]">
          <label className={labelClass}>
            Price (FCFA)
            <input
              className={`${inputClass} tabular-nums`}
              type="number"
              inputMode="numeric"
              min={1}
              max={PRICE_MAX}
              step={1}
              value={price}
              onChange={(e) => {
                setPrice(e.target.value);
                touch();
              }}
              aria-invalid={!!errors.price}
              aria-describedby={`${ids}-price-hint`}
            />
            <FieldHint id={`${ids}-price-hint`} error={errors.price}>
              <span className="[overflow-wrap:anywhere]">
                {Number(price) > 0 && Number(price) <= PRICE_MAX ? `Shown as ${formatPrice(Number(price))}` : `Price in FCFA, up to ${formatCount(PRICE_MAX)}`}
              </span>
            </FieldHint>
          </label>
          <label className={labelClass}>
            Stock (bags)
            <input
              className={`${inputClass} tabular-nums`}
              type="number"
              inputMode="numeric"
              min={0}
              max={STOCK_MAX}
              step={1}
              value={stock}
              onChange={(e) => {
                setStock(e.target.value);
                touch();
              }}
              aria-invalid={!!errors.stock}
              aria-describedby={`${ids}-stock-hint`}
            />
            <FieldHint id={`${ids}-stock-hint`} error={errors.stock}>
              0 shows “Sold out” on the website
            </FieldHint>
          </label>
        </div>

        <label className={labelClass}>
          Description
          <textarea
            className={`${inputClass} min-h-32`}
            value={description}
            maxLength={Math.max(DESCRIPTION_MAX, product.description.length)}
            aria-describedby={`${ids}-desc-count`}
            onChange={(e) => {
              setDescription(e.target.value);
              touch();
            }}
          />
          <span id={`${ids}-desc-count`} className={`${hintText} text-right tabular-nums`}>
            <span className="sr-only">Characters used: </span>
            {description.length}/{DESCRIPTION_MAX}
          </span>
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
        <div className="sticky bottom-0 z-10 -mx-4 border-t border-border bg-background/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[var(--shadow-float)] sm:static sm:mx-0 sm:bg-transparent sm:px-0 sm:pt-5 sm:pb-0 sm:shadow-none">
          <div className="flex flex-wrap items-center gap-2">
            <button type="submit" className={`${primaryButton} flex-1 whitespace-nowrap max-sm:px-3 sm:flex-none`} disabled={photoBusy}>
              {/* "Save changes" turns into a certain "Saved" until the next edit. */}
              <span key={saved && !dirty ? "saved" : "save"} className={`inline-flex items-center gap-2 ${saved && !dirty ? "anim-swap" : ""}`}>
                {saved && !dirty ? (
                  <>
                    <CheckMark />
                    Saved
                  </>
                ) : (
                  "Save changes"
                )}
              </span>
            </button>
            <Link href={`/shop/${original.slug}`} className={`${secondaryButton} flex-1 whitespace-nowrap max-sm:px-3 sm:flex-none`}>
              View on website
            </Link>
            {!saved && dirty && (
              <span
                aria-hidden="true"
                className="order-first inline-flex w-full items-center gap-2 text-sm font-medium text-cherry sm:order-none sm:ml-1 sm:w-auto"
              >
                <span className="h-2 w-2 rounded-full bg-cherry" />
                Unsaved changes
              </span>
            )}
            <span className="sr-only" aria-live="polite">
              {!saved && dirty ? "Unsaved changes" : ""}
            </span>
          </div>
        </div>
        {/* A quiet fade only: the button's "Saved" and the toast already carry the motion. */}
        {saved && (
          <p className="flex flex-wrap items-center gap-x-2 rounded-lg bg-accent-soft px-4 py-1 text-sm font-semibold text-accent transition-opacity duration-(--dur-ui) ease-out starting:opacity-0">
            <CheckMark />
            Saved.
            <Link href={`/shop/${original.slug}`} className="inline-flex min-h-11 items-center underline underline-offset-[3px]">
              See it on the shop
            </Link>
          </p>
        )}
      </form>

      <div className="mt-6">
        <ConfirmButton
          label="Undo my changes"
          question={`Put ${original.name} back to the original demo details and photo?`}
          confirmLabel="Yes, undo changes"
          onConfirm={() => {
            if (!resetProduct(original.slug)) {
              show(`Not reset. ${STORAGE_BLOCKED}`, "error");
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
            show("Changes undone.");
          }}
        />
      </div>
      {toast}
    </div>
  );
}
