"use client";

import Link from "next/link";
import { useId, useRef, useState } from "react";
import { Price } from "@/components/price";
import { useStore } from "@/components/store-provider";
import { formatPrice } from "@/lib/currency";
import { cooperative } from "@/lib/data";
import { phoneLink, whatsappLink } from "@/lib/whatsapp";
import { CartSkeleton, EmptyCart, useCartLines } from "./cart-view";
import { type DeliveryOption, deliveryFee, formatWeight } from "./catalog";

const inputClass =
  "mt-1 block min-h-11 w-full rounded-lg border border-border bg-surface px-3 py-2 text-base focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30 aria-[invalid=true]:border-danger";

/** Inline field error. It fades in when it appears. */
const errorClass =
  "mt-1 block text-sm font-medium text-danger transition-[opacity,translate] duration-180 ease-out starting:-translate-y-1 starting:opacity-0 motion-reduce:transition-opacity motion-reduce:duration-150";

/** Required-field marker: the word, not only an asterisk. */
function Required() {
  return <span className="font-normal text-muted"> (required)</span>;
}

function WhatsAppGlyph() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round">
      <path d="M12 3.5a8.5 8.5 0 0 0-7.33 12.8L3.5 20.5l4.3-1.13A8.5 8.5 0 1 0 12 3.5Z" />
      <path
        d="M9.2 8.3c.2-.4.5-.4.8-.4h.4c.2 0 .4.1.5.4l.6 1.4c.1.2 0 .5-.1.7l-.4.5c-.1.1-.1.3 0 .5a6 6 0 0 0 2.6 2.4c.2.1.4 0 .5-.1l.5-.6c.2-.2.4-.2.6-.1l1.4.7c.2.1.3.3.3.5v.4c0 .3-.1.6-.4.8-.5.4-1.2.6-1.9.5-2.6-.5-4.9-2.8-5.4-5.4-.1-.7.1-1.4.5-1.9Z"
        fill="currentColor"
        stroke="none"
      />
    </svg>
  );
}

export function WhatsAppOrderForm() {
  const { loaded, clearCart } = useStore();
  const { lines, unavailable, subtotalXaf } = useCartLines();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [delivery, setDelivery] = useState<DeliveryOption>("cameroon");
  const [notes, setNotes] = useState("");
  const [sent, setSent] = useState(false);
  /** Set when the visitor tried to send with fields missing; errors show from then on. */
  const [attempted, setAttempted] = useState(false);
  const nameInput = useRef<HTMLInputElement>(null);
  const cityInput = useRef<HTMLInputElement>(null);
  const ids = useId();

  if (!loaded) return <CartSkeleton />;
  if (lines.length === 0 && !sent) return <EmptyCart />;

  const feeXaf = deliveryFee(delivery, city);
  const totalXaf = subtotalXaf + feeXaf;
  const ready = name.trim() !== "" && city.trim() !== "";
  const nameError = attempted && name.trim() === "" ? "Enter your name so we know who is ordering." : null;
  const cityError = attempted && city.trim() === "" ? "Enter your town or city so we can work out delivery." : null;

  /** Shows what is missing and moves focus to the first missing field. Returns false when the order cannot be sent yet. */
  function checkFields() {
    if (ready) return true;
    setAttempted(true);
    (name.trim() === "" ? nameInput : cityInput).current?.focus();
    return false;
  }

  const message = [
    `Hello ${cooperative.shortName}, I would like to order:`,
    ...lines.map(
      (l) => `- ${l.quantity} × ${l.product.name} (${formatWeight(l.product.weightGrams)}): ${formatPrice(l.lineXaf)}`,
    ),
    `Subtotal: ${formatPrice(subtotalXaf)}`,
    `Delivery: ${delivery === "international" ? "Outside Cameroon" : "Within Cameroon"} (about ${formatPrice(feeXaf)})`,
    `Estimated total: ${formatPrice(totalXaf)}`,
    "",
    `Name: ${name.trim()}`,
    `City: ${city.trim()}`,
    phone.trim() ? `Phone: ${phone.trim()}` : null,
    notes.trim() ? `Notes: ${notes.trim()}` : null,
  ]
    .filter((line) => line !== null)
    .join("\n");

  if (sent) {
    return (
      <div className="rounded-2xl border border-border bg-surface px-6 py-12 text-center">
        <h2 className="font-serif text-2xl font-bold text-brand">Thank you, your order is on its way to us</h2>
        <p className="mx-auto mt-2 max-w-md text-muted">
          Send the message in WhatsApp if you haven&apos;t yet. We will confirm availability, the delivery fee and how to pay by MTN
          MoMo or Orange Money.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => {
              clearCart();
              setSent(false);
            }}
            className="btn btn-primary"
          >
            Start a new order
          </button>
          <Link href="/shop" className="btn btn-secondary">
            Back to the shop
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px] lg:items-start">
      {unavailable.length > 0 && (
        <p className="rounded-lg border border-dashed border-border bg-surface px-4 py-3 text-sm text-muted lg:col-span-2">
          Left out of this order because they are no longer available: {unavailable.map((p) => p.name).join(", ")}.
        </p>
      )}
      <form
        noValidate
        className="space-y-4 rounded-2xl border border-border bg-surface p-5"
        onSubmit={(e) => {
          e.preventDefault();
          checkFields();
        }}
      >
        <h2 className="font-serif text-xl font-bold text-brand">Your details</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-medium">
            Full name
            <Required />
            <input
              ref={nameInput}
              className={inputClass}
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              required
              aria-invalid={!!nameError}
              aria-describedby={nameError ? `${ids}-name-error` : undefined}
            />
            {nameError && (
              <span id={`${ids}-name-error`} className={errorClass}>
                {nameError}
              </span>
            )}
          </label>
          <label className="block text-sm font-medium">
            Town or city
            <Required />
            <input
              ref={cityInput}
              className={inputClass}
              value={city}
              onChange={(e) => setCity(e.target.value)}
              autoComplete="address-level2"
              placeholder="e.g. Kumbo"
              required
              aria-invalid={!!cityError}
              aria-describedby={cityError ? `${ids}-city-error` : undefined}
            />
            {cityError && (
              <span id={`${ids}-city-error`} className={errorClass}>
                {cityError}
              </span>
            )}
          </label>
          <label className="block text-sm font-medium sm:col-span-2">
            Phone (optional, if different from your WhatsApp number)
            <input className={inputClass} value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" autoComplete="tel" />
          </label>
        </div>
        <fieldset>
          <legend className="text-sm font-medium">Delivery</legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {(
              [
                ["cameroon", "Within Cameroon"],
                ["international", "Outside Cameroon"],
              ] as const
            ).map(([value, label]) => (
              <label
                key={value}
                className={`flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm [transition:background-color_150ms_ease,border-color_150ms_ease] has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ring ${
                  delivery === value ? "border-accent bg-accent-soft" : "border-border hover:border-accent/50"
                }`}
              >
                <input
                  type="radio"
                  name="delivery"
                  value={value}
                  checked={delivery === value}
                  onChange={() => setDelivery(value)}
                  className="h-4 w-4 shrink-0 focus-visible:outline-none"
                />
                {label}
              </label>
            ))}
          </div>
        </fieldset>
        <label className="block text-sm font-medium">
          Notes (optional)
          <textarea
            className={`${inputClass} min-h-24`}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Delivery address, preferred day, grind size…"
          />
        </label>
      </form>

      <aside className="rounded-2xl border border-border bg-surface p-5 lg:sticky lg:top-6" aria-labelledby="order-summary-heading">
        <h2 id="order-summary-heading" className="font-serif text-xl font-bold text-brand">
          Your order
        </h2>
        <ul className="mt-3 space-y-2 text-sm">
          {lines.map((l) => (
            <li key={l.product.slug} className="flex justify-between gap-3">
              <span>
                {l.quantity} × {l.product.name}
              </span>
              <Price xaf={l.lineXaf} className="shrink-0" />
            </li>
          ))}
        </ul>
        <dl className="mt-4 space-y-1 border-t border-border pt-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted">Subtotal</dt>
            <dd>
              <Price xaf={subtotalXaf} />
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted">Delivery (estimate)</dt>
            <dd>
              <Price xaf={feeXaf} />
            </dd>
          </div>
          <div className="flex justify-between pt-2 text-base font-bold text-brand">
            <dt>Estimated total</dt>
            <dd>
              <Price xaf={totalXaf} />
            </dd>
          </div>
        </dl>
        {/* Always shown. With fields missing, a tap points to them instead of opening WhatsApp. */}
        <a
          href={whatsappLink(message)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => {
            if (!checkFields()) {
              e.preventDefault();
              return;
            }
            setSent(true);
          }}
          aria-describedby={ready ? undefined : `${ids}-send-hint`}
          className="btn btn-whatsapp btn-lg mt-5 w-full"
        >
          <WhatsAppGlyph />
          Send order on WhatsApp
        </a>
        <p
          id={`${ids}-send-hint`}
          aria-live="polite"
          className={`mt-2 text-center text-sm ${attempted && !ready ? "font-medium text-danger" : "text-muted"} ${ready ? "sr-only" : ""}`}
        >
          {ready ? "" : "Add your name and town to send the order."}
        </p>
        <a href={phoneLink()} className="btn btn-secondary mt-3 w-full">
          Or call us: {cooperative.phone}
        </a>
        <p className="mt-3 text-center text-xs text-muted">
          No payment now. We confirm your order, then you pay by MTN MoMo or Orange Money.
        </p>
      </aside>
    </div>
  );
}
