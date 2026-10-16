"use client";

import Link from "next/link";
import { useState } from "react";
import { Price } from "@/components/price";
import { useStore } from "@/components/store-provider";
import { formatPrice } from "@/lib/currency";
import { cooperative } from "@/lib/data";
import { phoneLink, whatsappLink } from "@/lib/whatsapp";
import { CartSkeleton, EmptyCart, useCartLines } from "./cart-view";
import { type DeliveryOption, deliveryFee, formatWeight } from "./catalog";

const inputClass =
  "mt-1 block min-h-11 w-full rounded-lg border border-border bg-surface px-3 py-2 text-base focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30";

export function WhatsAppOrderForm() {
  const { loaded, clearCart } = useStore();
  const { lines, unavailable, subtotalXaf } = useCartLines();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [delivery, setDelivery] = useState<DeliveryOption>("cameroon");
  const [notes, setNotes] = useState("");
  const [sent, setSent] = useState(false);

  if (!loaded) return <CartSkeleton />;
  if (lines.length === 0 && !sent) return <EmptyCart />;

  const feeXaf = deliveryFee(delivery, city);
  const totalXaf = subtotalXaf + feeXaf;
  const ready = name.trim() !== "" && city.trim() !== "";

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
            className="min-h-11 rounded-lg bg-brand px-5 py-2.5 font-semibold text-brand-contrast hover:bg-brand/90"
          >
            Start a new order
          </button>
          <Link href="/shop" className="min-h-11 rounded-lg border border-border px-5 py-2.5 font-semibold text-brand hover:bg-background">
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
      <form className="space-y-4 rounded-2xl border border-border bg-surface p-5" onSubmit={(e) => e.preventDefault()}>
        <h2 className="font-serif text-xl font-bold text-brand">Your details</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-medium">
            Full name *
            <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" required />
          </label>
          <label className="block text-sm font-medium">
            Town or city *
            <input
              className={inputClass}
              value={city}
              onChange={(e) => setCity(e.target.value)}
              autoComplete="address-level2"
              placeholder="e.g. Kumbo"
              required
            />
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
                className={`flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm ${
                  delivery === value ? "border-accent bg-accent-soft" : "border-border"
                }`}
              >
                <input type="radio" name="delivery" value={value} checked={delivery === value} onChange={() => setDelivery(value)} />
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
        {ready ? (
          <a
            href={whatsappLink(message)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setSent(true)}
            className="mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#1f8a4c] px-6 py-3 font-semibold text-white hover:bg-[#19733f]"
          >
            Send order on WhatsApp
          </a>
        ) : (
          <p className="mt-5 rounded-lg bg-background px-4 py-3 text-center text-sm text-muted">
            Add your name and town to send the order.
          </p>
        )}
        <a
          href={phoneLink()}
          className="mt-3 flex min-h-11 w-full items-center justify-center rounded-lg border border-border px-6 py-2.5 font-semibold text-brand hover:bg-background"
        >
          Or call us: {cooperative.phone}
        </a>
        <p className="mt-3 text-center text-xs text-muted">
          No payment now. We confirm your order, then you pay by MTN MoMo or Orange Money.
        </p>
      </aside>
    </div>
  );
}
