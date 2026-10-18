"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { Price } from "@/components/price";
import { useStore } from "@/components/store-provider";
import { formatPrice } from "@/lib/currency";
import { cooperative } from "@/lib/data";
import { phoneLink, whatsappLink } from "@/lib/whatsapp";
import { AlertMark, EmptyCart, useCartLines } from "./cart-view";
import { type DeliveryOption, deliveryFee, formatWeight, SHIPPING_XAF } from "./catalog";

const inputClass =
  "mt-1.5 block min-h-12 w-full rounded-lg border border-field-border bg-surface px-3 py-2 text-base font-normal tracking-normal text-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent aria-[invalid=true]:border-danger";

const labelClass = "type-label block text-foreground";

/** Inline field error, with an icon so it is not colour alone. It fades in when it appears. */
const errorClass =
  "mt-1.5 flex items-start gap-1.5 text-sm font-medium tracking-normal text-danger transition-[opacity,translate] duration-(--dur-ui) ease-out starting:-translate-y-1 starting:opacity-0 motion-reduce:transition-opacity motion-reduce:duration-150";

/** Required-field marker: the word, not only an asterisk. */
function Required() {
  return <span className="font-normal text-muted"> (required)</span>;
}

/** True when the town typed is Kumbo itself, where the route has no distance to draw. */
function isKumbo(town: string) {
  return /^kumbo\b/i.test(town.trim());
}

/**
 * True once the page is in front of the buyer. Tapping Send opens WhatsApp (an
 * app or a new tab) at the same moment the sent panel mounts, so a line drawn
 * straight away would finish behind WhatsApp. If the page hides before the
 * draw has had time to play, this turns false again, so the line remounts and
 * draws when the buyer comes back. After that it stays drawn.
 */
function useInFrontOnce(settleMs: number) {
  const [inFront, setInFront] = useState(() => typeof document === "undefined" || document.visibilityState === "visible");
  useEffect(() => {
    let settled = false;
    let timer: number | undefined;
    const arm = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        settled = true;
      }, settleMs);
    };
    const onChange = () => {
      if (settled) return;
      const visible = document.visibilityState === "visible";
      if (visible) arm();
      else window.clearTimeout(timer);
      setInFront(visible);
    };
    if (document.visibilityState === "visible") arm();
    document.addEventListener("visibilitychange", onChange);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("visibilitychange", onChange);
    };
  }, [settleMs]);
  return inFront;
}

/** 150ms delay + 400ms draw, plus a frame or two of margin. */
const ROUTE_SETTLE_MS = 650;

/**
 * Delight 3, "From your town to Kumbo": a leaf dot for the buyer's town joined
 * by a dashed Volcanic Soil line to a cherry dot for Kumbo. The line draws once
 * (clip-path, 400ms) when the page is in front; with reduced motion it is
 * already drawn and only fades in. The dots and labels hold their place, so
 * nothing moves when the line arrives.
 */
function RouteLine({ town, draw }: { town: string; draw: boolean }) {
  return (
    <div className="mt-6 w-full max-w-[240px]" aria-hidden="true">
      <div className="relative h-6">
        {draw && (
          <div className="absolute inset-y-0 right-3 left-3 [clip-path:inset(0)] transition-[clip-path] delay-150 duration-400 ease-out starting:[clip-path:inset(0_100%_0_0)] motion-reduce:transition-opacity motion-reduce:delay-0 motion-reduce:duration-150 motion-reduce:starting:opacity-0 motion-reduce:starting:[clip-path:inset(0)]">
            <svg viewBox="0 0 216 24" preserveAspectRatio="none" className="block h-6 w-full">
              <line x1="0" y1="12" x2="216" y2="12" stroke="var(--brand)" strokeWidth="1.5" strokeDasharray="4 4" vectorEffect="non-scaling-stroke" />
            </svg>
          </div>
        )}
        <span className="absolute top-1/2 left-0 h-3 w-3 -translate-y-1/2 rounded-full bg-accent" />
        <span className="absolute top-1/2 right-0 h-3 w-3 -translate-y-1/2 rounded-full bg-cherry" />
      </div>
      <div className="mt-1 flex justify-between gap-3 text-sm font-semibold">
        <span title={town} className="max-w-[10ch] truncate text-accent">
          {town}
        </span>
        <span className="text-cherry">Kumbo</span>
      </div>
    </div>
  );
}

/**
 * After Send: WhatsApp has opened with the order written, but nothing has
 * reached the cooperative until the buyer presses Send there, so the copy says
 * exactly that. Focus and scroll move to the heading, because the page has
 * just shrunk from the long form to this panel.
 */
function SentPanel({ town, orderRef, onNewOrder }: { town: string; orderRef: string | null; onNewOrder: () => void }) {
  const heading = useRef<HTMLHeadingElement>(null);
  const inFront = useInFrontOnce(ROUTE_SETTLE_MS);
  const route = town !== "" && !isKumbo(town);

  useEffect(() => {
    const h = heading.current;
    if (!h) return;
    h.focus({ preventScroll: true });
    // Instant on purpose: no smooth scroll on slow phones or with reduced motion.
    h.scrollIntoView({ block: "start" });
  }, []);

  return (
    <div className="anim-enter max-w-2xl rounded-2xl border border-border bg-surface p-6 sm:p-8">
      <h2 ref={heading} tabIndex={-1} className="type-h2 scroll-mt-6 text-brand outline-none">
        Thank you. Now press Send in WhatsApp.
      </h2>
      {route && <RouteLine town={town} draw={inFront} />}
      <p className="mt-6 max-w-[60ch] text-foreground [overflow-wrap:anywhere]">
        WhatsApp opened with your order {route ? `from ${town} to Kumbo ` : ""}already written. Once it reaches us, we confirm what is
        available, the delivery fee and how to pay by MTN MoMo or Orange Money.
      </p>
      {orderRef && (
        <p className="mt-4 text-foreground">
          Your order reference is <span className="font-bold tracking-wide">{orderRef}</span>.{" "}
          <Link
            href={`/track?ref=${orderRef}`}
            className="font-semibold text-accent underline underline-offset-[3px] hover:decoration-2"
          >
            Track this order
          </Link>
        </p>
      )}
      <div className="mt-6 flex flex-wrap gap-3">
        <button type="button" onClick={onNewOrder} className="btn btn-primary btn-lg">
          Start a new order
        </button>
        <Link href="/shop" className="btn btn-secondary btn-lg">
          Back to the shop
        </Link>
      </div>
      <p className="mt-4 text-sm text-muted">
        WhatsApp didn&apos;t open?{" "}
        <a
          href={phoneLink()}
          className="inline-flex min-h-11 items-center font-semibold text-accent underline underline-offset-[3px] hover:decoration-2"
        >
          <span className="whitespace-nowrap">
            Call <span className="tabular-nums">{cooperative.phone}</span>
          </span>
        </a>
      </p>
    </div>
  );
}

/** Stands in for the order card until the saved order is read, at about its real height so the page does not jump. */
function SummarySkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading your order" className="min-h-[22rem] space-y-3">
      <div className="h-6 w-32 animate-pulse rounded-md bg-border/50 motion-reduce:animate-none" />
      <div className="h-24 animate-pulse rounded-lg bg-border/50 motion-reduce:animate-none" />
      <div className="h-12 animate-pulse rounded-lg bg-border/50 motion-reduce:animate-none" />
    </div>
  );
}

/**
 * Saves the order request for the staff dashboard (coffees, town and delivery
 * only). It runs alongside opening WhatsApp and never holds it up; if it
 * fails, the WhatsApp order still goes through.
 */
function recordOrder(ref: string, city: string, delivery: DeliveryOption, lines: { product: { slug: string }; quantity: number }[]) {
  try {
    void fetch("/api/orders", {
      method: "POST",
      keepalive: true,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ref, city, delivery, lines: lines.map((l) => ({ slug: l.product.slug, quantity: l.quantity })) }),
    }).catch(() => {});
  } catch {
    // Old browsers without fetch: the order still goes by WhatsApp.
  }
}

/** Letters and digits that cannot be misread (no I, O, 0 or 1). */
const REF_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

/** A short reference such as GV-7K3PQ, shown in the WhatsApp message and on the staff orders page. */
function newOrderRef() {
  const bytes = new Uint8Array(5);
  crypto.getRandomValues(bytes);
  return `GV-${Array.from(bytes, (b) => REF_ALPHABET[b % REF_ALPHABET.length]).join("")}`;
}

/**
 * Before sending: signed-in buyers are told the order will be on their
 * account; others may sign in first (the order list is kept while they do).
 */
function AccountHint() {
  const [me, setMe] = useState<{ accounts: boolean; signedIn: boolean; name: string } | null>(null);
  useEffect(() => {
    let live = true;
    fetch("/api/me", { cache: "no-store" })
      .then((r) => r.json())
      .then((m) => live && setMe(m))
      .catch(() => {});
    return () => {
      live = false;
    };
  }, []);
  if (!me?.accounts) return null;
  if (me.signedIn) {
    return (
      <p className="mt-3 text-sm text-muted [overflow-wrap:anywhere]">
        Signed in as {me.name}. This order will appear in{" "}
        <Link href="/account" className="font-semibold text-accent underline underline-offset-[3px]">
          My account
        </Link>
        .
      </p>
    );
  }
  return (
    <p className="mt-3 text-sm text-muted">
      Want to follow this order later?{" "}
      <a href="/api/auth/google?as=customer&next=%2Forder" className="font-semibold text-accent underline underline-offset-[3px]">
        Sign in with Google
      </a>{" "}
      before sending. Optional.
    </p>
  );
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
  /** Made when Send is first tapped (a random value cannot be part of the prebuilt page), kept until a new order starts. */
  const orderRef = useRef<string | null>(null);
  /** The reference of the order just sent, for the "Track this order" link. */
  const [sentRef, setSentRef] = useState<string | null>(null);
  /** Set when the visitor tried to send with fields missing; errors show from then on. */
  const [attempted, setAttempted] = useState(false);
  const nameInput = useRef<HTMLInputElement>(null);
  const cityInput = useRef<HTMLInputElement>(null);
  const ids = useId();

  // The details form does not depend on the saved order, so it renders at once; only the order card waits.
  if (loaded && lines.length === 0 && !sent) return <EmptyCart />;

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

  const messageFor = (ref: string | null) => [
    `Hello ${cooperative.shortName}, I would like to order${ref ? ` (ref ${ref})` : ""}:`,
    ...lines.map(
      (l) => {
        const weight = formatWeight(l.product.weightGrams);
        // Skip the weight when the name already states it, e.g. "Green Coffee (1 kg)".
        const label = l.product.name.includes(weight) ? l.product.name : `${l.product.name} (${weight})`;
        return `- ${l.quantity} × ${label}: ${formatPrice(l.lineXaf)}`;
      },
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

  const town = city.trim();

  /** Enter in a one-line field checks the form, then moves to the send button (the form has no submit button). */
  function onFieldEnter(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key !== "Enter" || e.nativeEvent.isComposing) return;
    e.preventDefault();
    if (checkFields()) document.getElementById(`${ids}-send`)?.focus();
  }

  if (sent) {
    return (
      <SentPanel
        town={town}
        orderRef={sentRef}
        onNewOrder={() => {
          clearCart();
          orderRef.current = null;
          setSent(false);
        }}
      />
    );
  }

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start lg:gap-10">
      {unavailable.length > 0 && (
        <p className="rounded-lg bg-surface px-4 py-3 text-sm text-muted [overflow-wrap:anywhere] lg:col-span-2">
          Left out of this order because they are no longer available: {unavailable.map((p) => p.name).join(", ")}.
        </p>
      )}
      {lines.some((l) => l.capped) && (
        <p className="rounded-lg bg-surface px-4 py-3 text-sm text-muted [overflow-wrap:anywhere] lg:col-span-2">
          We only have{" "}
          {lines
            .filter((l) => l.capped)
            .map((l) => `${l.quantity.toLocaleString("en-GB")} of ${l.product.name}`)
            .join(", ")}{" "}
          in stock, so your order asks for that many.
        </p>
      )}
      <form
        noValidate
        className="min-w-0 space-y-5"
        onSubmit={(e) => {
          e.preventDefault();
          checkFields();
        }}
      >
        <h2 className="type-title text-brand">Your details</h2>
        <div className="grid grid-cols-[minmax(0,1fr)] gap-5 sm:grid-cols-[repeat(2,minmax(0,1fr))]">
          <label className={labelClass}>
            Full name
            <Required />
            <input
              ref={nameInput}
              className={inputClass}
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              enterKeyHint="next"
              onKeyDown={onFieldEnter}
              required
              aria-invalid={!!nameError}
              aria-describedby={nameError ? `${ids}-name-error` : undefined}
            />
            {nameError && (
              <span id={`${ids}-name-error`} className={errorClass}>
                <AlertMark className="mt-0.5 h-4 w-4" />
                {nameError}
              </span>
            )}
          </label>
          <label className={labelClass}>
            Town or city
            <Required />
            <input
              ref={cityInput}
              className={inputClass}
              value={city}
              onChange={(e) => setCity(e.target.value)}
              autoComplete="address-level2"
              placeholder="e.g. Kumbo"
              enterKeyHint="next"
              onKeyDown={onFieldEnter}
              required
              aria-invalid={!!cityError}
              aria-describedby={cityError ? `${ids}-city-error` : undefined}
            />
            {cityError && (
              <span id={`${ids}-city-error`} className={errorClass}>
                <AlertMark className="mt-0.5 h-4 w-4" />
                {cityError}
              </span>
            )}
          </label>
          <label className={`${labelClass} sm:col-span-2`}>
            Phone <span className="font-normal text-muted">(optional, if different from your WhatsApp number)</span>
            <input
              className={`${inputClass} tabular-nums`}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              onKeyDown={onFieldEnter}
              enterKeyHint="next"
              type="tel"
              autoComplete="tel"
            />
          </label>
        </div>
        <fieldset aria-describedby={`${ids}-delivery-hint`}>
          <legend className="type-label text-foreground">Delivery</legend>
          <div className="mt-2 grid grid-cols-[minmax(0,1fr)] gap-2 sm:grid-cols-[repeat(2,minmax(0,1fr))]">
            {(
              [
                ["cameroon", "Within Cameroon"],
                ["international", "Outside Cameroon"],
              ] as const
            ).map(([value, label]) => (
              <label
                key={value}
                className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 text-base [transition:background-color_150ms_ease,border-color_150ms_ease] has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ring ${
                  delivery === value ? "border-accent bg-accent-soft font-semibold text-brand" : "border-field-border bg-surface pointer-fine:hover:border-accent"
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
          <p id={`${ids}-delivery-hint`} className="mt-2 max-w-[60ch] text-sm text-muted">
            Kumbo and Bamenda: <Price xaf={SHIPPING_XAF.local} />. Elsewhere in Cameroon: <Price xaf={SHIPPING_XAF.national} />.
            Outside Cameroon: about <Price xaf={SHIPPING_XAF.international} />. We confirm the exact fee.
          </p>
        </fieldset>
        <label className={labelClass}>
          Notes <span className="font-normal text-muted">(optional)</span>
          <textarea
            className={`${inputClass} min-h-24`}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Delivery address, preferred day, grind size…"
          />
        </label>
      </form>

      <aside className="min-w-0 rounded-2xl border border-border bg-surface p-5 lg:sticky lg:top-6" aria-labelledby="order-summary-heading">
        <h2 id="order-summary-heading" className="type-title text-brand">
          Your order
        </h2>
        {!loaded ? (
          <div className="mt-3">
            <SummarySkeleton />
          </div>
        ) : (
          <>
            {/* A co-op docket: a dashed tear line, then each bag with the lot code stencilled on its sack. */}
            <ul className="mt-3 space-y-3 border-t border-dashed border-field-border pt-3 text-sm">
              {lines.map((l) => (
                <li key={l.product.slug}>
                  <div className="flex justify-between gap-3">
                    <span className="min-w-0 [overflow-wrap:anywhere]">
                      <span className="tabular-nums">{l.quantity.toLocaleString("en-GB")}</span> × {l.product.name}
                    </span>
                    <Price xaf={l.lineXaf} className="max-w-[55%] shrink-0 text-right [overflow-wrap:anywhere]" />
                  </div>
                  {l.product.category === "subscription" ? (
                    <p className="mt-1 text-sm text-muted">Rotating lots</p>
                  ) : (
                    <p className="mt-1.5">
                      <span className="sr-only">Lot </span>
                      <span className="type-stencil text-lg text-brand">{l.product.lotCode}</span>
                    </p>
                  )}
                </li>
              ))}
            </ul>
            <dl className="mt-4 space-y-1.5 border-t border-border pt-3 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-muted">Coffee total</dt>
                <dd className="min-w-0 text-right [overflow-wrap:anywhere]">
                  <Price xaf={subtotalXaf} />
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted">Delivery (estimate)</dt>
                <dd className="min-w-0 text-right [overflow-wrap:anywhere]">
                  <Price xaf={feeXaf} />
                </dd>
              </div>
              <div className="flex items-baseline justify-between gap-3 border-t border-border pt-3 text-brand">
                <dt className="type-label">Estimated total</dt>
                <dd className="min-w-0 text-right [overflow-wrap:anywhere]">
                  <Price xaf={totalXaf} className="type-data text-lg" />
                </dd>
              </div>
            </dl>
            {/* Always shown. With fields missing, a tap points to them instead of opening WhatsApp. */}
            <a
              href={whatsappLink(messageFor(orderRef.current))}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => {
                if (!checkFields()) {
                  e.preventDefault();
                  return;
                }
                orderRef.current ??= newOrderRef();
                // The link opens after this handler, so it carries the reference just made.
                e.currentTarget.href = whatsappLink(messageFor(orderRef.current));
                recordOrder(orderRef.current, town, delivery, lines);
                setSentRef(orderRef.current);
                setSent(true);
              }}
              id={`${ids}-send`}
              aria-describedby={ready ? undefined : `${ids}-send-hint`}
              className="btn btn-whatsapp btn-lg mt-5 w-full"
            >
              <WhatsAppGlyph />
              Send order on WhatsApp
            </a>
            <p
              id={`${ids}-send-hint`}
              aria-live="polite"
              className={`mt-2 text-sm ${attempted && !ready ? "font-medium text-danger" : "text-muted"} ${ready ? "sr-only" : ""}`}
            >
              {ready ? "" : "Add your name and town to send the order."}
            </p>
            <a href={phoneLink()} className="btn btn-secondary mt-3 w-full">
              <span className="whitespace-nowrap">
                Call <span className="tabular-nums">{cooperative.phone}</span>
              </span>
            </a>
            <p className="mt-3 text-sm text-muted">
              No payment now. We confirm your order, then you pay by MTN MoMo or Orange Money.
            </p>
            <AccountHint />
          </>
        )}
      </aside>
    </div>
  );
}
