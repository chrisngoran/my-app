"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { Price } from "@/components/price";
import { useStore } from "@/components/store-provider";
import { formatPrice } from "@/lib/currency";
import {
  CAMEROON_REGIONS,
  SHIPPING_XAF,
  deliveryFee,
  formatWeight,
  isInternationalPhone,
  isLocalCity,
  normaliseCameroonPhone,
  type DeliveryOption,
} from "./catalog";
import { CartSkeleton, EmptyCart, useCartLines } from "./cart-view";

type PayMethod = "mtn" | "orange" | "card";

interface FormValues {
  name: string;
  phone: string;
  email: string;
  delivery: DeliveryOption;
  city: string;
  region: string;
  country: string;
  address: string;
  payment: PayMethod;
  payerPhone: string;
  cardName: string;
  cardNumber: string;
  cardExpiry: string;
  cardCvc: string;
}

type Errors = Partial<Record<keyof FormValues, string>>;

const INITIAL: FormValues = {
  name: "",
  phone: "",
  email: "",
  delivery: "cameroon",
  city: "",
  region: "North West",
  country: "",
  address: "",
  payment: "mtn",
  payerPhone: "",
  cardName: "",
  cardNumber: "",
  cardExpiry: "",
  cardCvc: "",
};

const PAYMENT_OPTIONS: { id: PayMethod; label: string; hint: string; badge: string }[] = [
  { id: "mtn", label: "MTN Mobile Money", hint: "Pay from your MTN MoMo wallet", badge: "bg-[#ffcc00] text-[#1a1a1a]" },
  { id: "orange", label: "Orange Money", hint: "Pay from your Orange Money account", badge: "bg-[#ff7900] text-white" },
  { id: "card", label: "Visa / Mastercard", hint: "Debit or credit card", badge: "bg-[#1a1f71] text-white" },
];

function validate(v: FormValues): Errors {
  const e: Errors = {};
  if (v.name.trim().length < 2) e.name = "Please enter your full name.";
  if (!v.phone.trim()) e.phone = "Please enter a phone number so we can reach you about delivery.";
  else if (v.delivery === "cameroon" && !normaliseCameroonPhone(v.phone))
    e.phone = "Enter a Cameroonian mobile number: 9 digits starting with 6, e.g. 6 77 12 34 56 (optional +237).";
  else if (v.delivery === "international" && !normaliseCameroonPhone(v.phone) && !isInternationalPhone(v.phone))
    e.phone = "Enter a valid phone number including the country code, e.g. +49 151 2345 6789.";
  if (!v.email.trim()) e.email = "Please enter your email address for the order confirmation.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.email.trim())) e.email = "Enter a valid email address, e.g. name@example.com.";
  if (!v.city.trim()) e.city = "Please enter your town or city.";
  if (v.delivery === "international" && !v.country.trim()) e.country = "Please enter your country.";
  if (v.address.trim().length < 4) e.address = "Please enter a delivery address or a landmark (quarter, street, nearby building).";
  if (v.payment === "mtn" || v.payment === "orange") {
    if (!normaliseCameroonPhone(v.payerPhone))
      e.payerPhone = `Enter the ${v.payment === "mtn" ? "MTN" : "Orange"} number that will pay: 9 digits starting with 6 (optional +237).`;
  } else {
    if (v.cardName.trim().length < 2) e.cardName = "Enter the name shown on the card.";
    const digits = v.cardNumber.replace(/\D/g, "");
    if (digits.length < 13 || digits.length > 19) e.cardNumber = "Enter a valid card number.";
    const m = /^(\d{2})\s*\/\s*(\d{2})$/.exec(v.cardExpiry.trim());
    if (!m || Number(m[1]) < 1 || Number(m[1]) > 12) e.cardExpiry = "Use the format MM/YY.";
    if (!/^\d{3,4}$/.test(v.cardCvc.trim())) e.cardCvc = "Enter the 3 or 4 digit security code.";
  }
  return e;
}

const FIELD_ORDER: (keyof FormValues)[] = [
  "name",
  "phone",
  "email",
  "city",
  "country",
  "address",
  "payerPhone",
  "cardName",
  "cardNumber",
  "cardExpiry",
  "cardCvc",
];

const inputClass =
  "mt-1 block w-full min-h-11 rounded-lg border bg-surface px-3 py-2 text-base text-foreground placeholder:text-muted/70 focus:outline-2 focus:outline-offset-1 focus:outline-accent aria-[invalid=true]:border-red-600";

function Field({
  id,
  label,
  error,
  hint,
  children,
  className = "",
}: {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label htmlFor={id} className="block text-sm font-medium text-foreground">
        {label}
      </label>
      {children}
      {hint && !error && (
        <p id={`${id}-hint`} className="mt-1 text-xs text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="mt-1 text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}

type Stage = "form" | "processing" | "done";

export function CheckoutForm() {
  const router = useRouter();
  const { clearCart, loaded } = useStore();
  const { lines, subtotalXaf } = useCartLines();
  const [values, setValues] = useState<FormValues>(INITIAL);
  const [errors, setErrors] = useState<Errors>({});
  const [stage, setStage] = useState<Stage>("form");
  const [step, setStep] = useState(0);
  const uid = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach((t) => window.clearTimeout(t));
  }, []);

  const shippingXaf = deliveryFee(values.delivery, values.city);
  const totalXaf = subtotalXaf + shippingXaf;
  const id = (name: keyof FormValues) => `${uid}-${name}`;

  function set<K extends keyof FormValues>(key: K, value: FormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function inputProps(name: keyof FormValues, hint = false) {
    const err = errors[name];
    return {
      id: id(name),
      name,
      value: values[name] as string,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => set(name, e.target.value as never),
      "aria-invalid": err ? true : undefined,
      "aria-describedby": err ? `${id(name)}-error` : hint ? `${id(name)}-hint` : undefined,
      className: `${inputClass} ${err ? "border-red-600" : "border-border"}`,
    };
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const found = validate(values);
    setErrors(found);
    const first = FIELD_ORDER.find((k) => found[k]);
    if (first) {
      document.getElementById(id(first))?.focus();
      return;
    }

    // Simulated payment: no real payment provider is called in this demo.
    setStage("processing");
    setStep(0);
    const orderNumber = `GV-ORD-${String(Date.now()).slice(-6)}`;
    const params = new URLSearchParams({
      order: orderNumber,
      pay: values.payment,
      total: String(totalXaf),
      name: values.name.trim().split(/\s+/)[0],
    });
    timers.current.push(
      window.setTimeout(() => setStep(1), 1200),
      window.setTimeout(() => setStep(2), 2600),
      window.setTimeout(() => {
        setStage("done");
        router.push(`/checkout/success?${params.toString()}`);
        clearCart();
      }, 3400),
    );
  }

  if (!loaded) return <CartSkeleton />;
  if (stage !== "form") return <PaymentProgress method={values.payment} phone={values.payerPhone} step={step} totalXaf={totalXaf} />;
  if (lines.length === 0) return <EmptyCart />;

  const mobileMoney = values.payment === "mtn" || values.payment === "orange";
  const errorCount = Object.values(errors).filter(Boolean).length;
  const localHint = isLocalCity(values.city);

  return (
    <form ref={formRef} noValidate onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[1fr_360px] lg:items-start">
      <div className="space-y-6">
        {errorCount > 0 && (
          <div role="alert" className="rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-800">
            Please correct {errorCount === 1 ? "the highlighted field" : `the ${errorCount} highlighted fields`} below.
          </div>
        )}

        <fieldset className="rounded-2xl border border-border bg-surface p-4 sm:p-6">
          <legend className="px-1 font-serif text-xl font-bold text-brand">1. Your details</legend>
          <div className="mt-2 grid gap-4 sm:grid-cols-2">
            <Field id={id("name")} label="Full name" error={errors.name} className="sm:col-span-2">
              <input {...inputProps("name")} type="text" autoComplete="name" required />
            </Field>
            <Field
              id={id("phone")}
              label="Phone number"
              error={errors.phone}
              hint={values.delivery === "cameroon" ? "Cameroon mobile, e.g. 6 77 12 34 56" : "Include your country code"}
            >
              <input {...inputProps("phone", true)} type="tel" inputMode="tel" autoComplete="tel" placeholder="+237 6XX XXX XXX" required />
            </Field>
            <Field id={id("email")} label="Email" error={errors.email}>
              <input {...inputProps("email")} type="email" inputMode="email" autoComplete="email" placeholder="you@example.com" required />
            </Field>
          </div>
        </fieldset>

        <fieldset className="rounded-2xl border border-border bg-surface p-4 sm:p-6">
          <legend className="px-1 font-serif text-xl font-bold text-brand">2. Delivery</legend>
          <div className="mt-2 grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Delivery option">
            {(
              [
                {
                  id: "cameroon" as const,
                  label: "Within Cameroon",
                  detail: (
                    <>
                      <Price xaf={SHIPPING_XAF.local} /> in Kumbo &amp; Bamenda · <Price xaf={SHIPPING_XAF.national} /> elsewhere
                    </>
                  ),
                },
                {
                  id: "international" as const,
                  label: "International",
                  detail: (
                    <>
                      <Price xaf={SHIPPING_XAF.international} /> · tracked courier, 7–12 days
                    </>
                  ),
                },
              ]
            ).map((o) => (
              <label
                key={o.id}
                className={`flex cursor-pointer gap-3 rounded-xl border p-4 transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-accent ${
                  values.delivery === o.id ? "border-accent bg-accent-soft" : "border-border hover:border-accent"
                }`}
              >
                <input
                  type="radio"
                  name="delivery"
                  value={o.id}
                  checked={values.delivery === o.id}
                  onChange={() => set("delivery", o.id)}
                  className="mt-1 h-4 w-4 accent-[var(--accent)]"
                />
                <span>
                  <span className="block font-semibold">{o.label}</span>
                  <span className="block text-sm text-muted">{o.detail}</span>
                </span>
              </label>
            ))}
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field
              id={id("city")}
              label="Town / city"
              error={errors.city}
              hint={values.delivery === "cameroon" ? (localHint ? "Local delivery rate applies" : "e.g. Kumbo, Bamenda, Douala, Yaoundé") : undefined}
            >
              <input {...inputProps("city", values.delivery === "cameroon")} type="text" autoComplete="address-level2" required />
            </Field>
            {values.delivery === "cameroon" ? (
              <Field id={id("region")} label="Region">
                <select {...inputProps("region")} autoComplete="address-level1">
                  {CAMEROON_REGIONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </Field>
            ) : (
              <Field id={id("country")} label="Country" error={errors.country}>
                <input {...inputProps("country")} type="text" autoComplete="country-name" required />
              </Field>
            )}
            <Field
              id={id("address")}
              label="Address or landmark"
              error={errors.address}
              hint="Quarter, street and a nearby landmark help our riders find you."
              className="sm:col-span-2"
            >
              <textarea {...inputProps("address", true)} rows={2} autoComplete="street-address" required />
            </Field>
          </div>
        </fieldset>

        <fieldset className="rounded-2xl border border-border bg-surface p-4 sm:p-6">
          <legend className="px-1 font-serif text-xl font-bold text-brand">3. Payment</legend>
          <div className="mt-2 grid gap-3" role="radiogroup" aria-label="Payment method">
            {PAYMENT_OPTIONS.map((o) => (
              <label
                key={o.id}
                className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-accent ${
                  values.payment === o.id ? "border-accent bg-accent-soft" : "border-border hover:border-accent"
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  value={o.id}
                  checked={values.payment === o.id}
                  onChange={() => {
                    set("payment", o.id);
                    setErrors({});
                  }}
                  className="h-4 w-4 shrink-0 accent-[var(--accent)]"
                />
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold">{o.label}</span>
                  <span className="block text-sm text-muted">{o.hint}</span>
                </span>
                <span aria-hidden="true" className={`hidden rounded px-2 py-1 text-[10px] font-bold sm:inline ${o.badge}`}>
                  {o.id === "mtn" ? "MoMo" : o.id === "orange" ? "OM" : "CARD"}
                </span>
              </label>
            ))}
          </div>

          {mobileMoney ? (
            <div className="mt-4 rounded-xl bg-background p-4">
              <Field
                id={id("payerPhone")}
                label={`${values.payment === "mtn" ? "MTN Mobile Money" : "Orange Money"} number`}
                error={errors.payerPhone}
                hint="9 digits starting with 6, e.g. 6 77 12 34 56"
              >
                <input {...inputProps("payerPhone", true)} type="tel" inputMode="tel" autoComplete="tel" placeholder="6XX XXX XXX" />
              </Field>
              <p className="mt-3 flex gap-2 text-sm text-foreground">
                <svg aria-hidden="true" viewBox="0 0 20 20" className="mt-0.5 h-4 w-4 shrink-0 text-accent" fill="currentColor">
                  <path d="M6 1h8a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2zm0 2v12h8V3zm4 13a1 1 0 1 0 0 2 1 1 0 0 0 0-2z" />
                </svg>
                <span>
                  You will receive a prompt on your phone to confirm the payment of{" "}
                  <strong>{formatPrice(totalXaf, "XAF")}</strong>. Enter your PIN to approve it.
                </span>
              </p>
            </div>
          ) : (
            <div className="mt-4 grid gap-4 rounded-xl bg-background p-4 sm:grid-cols-2">
              <Field id={id("cardName")} label="Name on card" error={errors.cardName} className="sm:col-span-2">
                <input {...inputProps("cardName")} type="text" autoComplete="cc-name" />
              </Field>
              <Field id={id("cardNumber")} label="Card number" error={errors.cardNumber} className="sm:col-span-2">
                <input {...inputProps("cardNumber")} type="text" inputMode="numeric" autoComplete="cc-number" placeholder="1234 5678 9012 3456" />
              </Field>
              <Field id={id("cardExpiry")} label="Expiry (MM/YY)" error={errors.cardExpiry}>
                <input {...inputProps("cardExpiry")} type="text" inputMode="numeric" autoComplete="cc-exp" placeholder="MM/YY" />
              </Field>
              <Field id={id("cardCvc")} label="Security code (CVC)" error={errors.cardCvc}>
                <input {...inputProps("cardCvc")} type="text" inputMode="numeric" autoComplete="cc-csc" placeholder="123" />
              </Field>
              <p className="text-xs text-muted sm:col-span-2">
                Your card is charged in FCFA ({formatPrice(totalXaf, "XAF")}). Your bank may ask you to confirm with a one-time code.
              </p>
            </div>
          )}
        </fieldset>
      </div>

      <aside aria-labelledby="checkout-summary-heading" className="rounded-2xl border border-border bg-surface p-5 lg:sticky lg:top-6">
        <h2 id="checkout-summary-heading" className="font-serif text-xl font-bold text-brand">
          Order summary
        </h2>
        <ul className="mt-4 divide-y divide-border">
          {lines.map(({ product, quantity, lineXaf }) => (
            <li key={product.slug} className="flex items-center gap-3 py-3">
              <Image src={product.image} alt="" width={800} height={600} unoptimized className="h-12 w-16 shrink-0 rounded-md object-cover" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium leading-snug">{product.name}</p>
                <p className="text-xs text-muted">
                  {quantity} × {formatWeight(product.weightGrams)}
                </p>
              </div>
              <Price xaf={lineXaf} className="shrink-0 text-sm font-semibold" />
            </li>
          ))}
        </ul>
        <dl className="mt-2 space-y-2 border-t border-border pt-4 text-sm">
          <div className="flex justify-between gap-2">
            <dt className="text-muted">Subtotal</dt>
            <dd>
              <Price xaf={subtotalXaf} />
            </dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt className="text-muted">
              Delivery{" "}
              {values.delivery === "international" ? "(international)" : localHint ? "(Kumbo / Bamenda)" : "(Cameroon)"}
            </dt>
            <dd>
              <Price xaf={shippingXaf} />
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-2 border-t border-border pt-3">
            <dt className="font-semibold">Total</dt>
            <dd>
              <Price xaf={totalXaf} className="text-2xl font-bold text-brand" />
            </dd>
          </div>
        </dl>
        <button
          type="submit"
          className="mt-5 flex min-h-12 w-full items-center justify-center rounded-lg bg-accent px-6 py-3 font-semibold text-brand-contrast hover:bg-accent/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          {mobileMoney ? `Pay ${formatPrice(totalXaf, "XAF")} with ${values.payment === "mtn" ? "MoMo" : "Orange Money"}` : `Pay ${formatPrice(totalXaf, "XAF")}`}
        </button>
        <p className="mt-3 text-center text-xs text-muted">
          Demo checkout — no real payment is taken.{" "}
          <Link href="/cart" className="underline hover:text-brand">
            Edit cart
          </Link>
        </p>
      </aside>
    </form>
  );
}

function PaymentProgress({ method, phone, step, totalXaf }: { method: PayMethod; phone: string; step: number; totalXaf: number }) {
  const mobile = method !== "card";
  const provider = method === "mtn" ? "MTN Mobile Money" : method === "orange" ? "Orange Money" : "your bank";
  const steps = mobile
    ? [
        `Sending payment request to ${provider}…`,
        `Prompt sent to ${normaliseCameroonPhone(phone) ?? phone}. Waiting for you to approve with your PIN…`,
        "Payment confirmed. Creating your order…",
      ]
    : ["Contacting your bank…", "Authorising the card payment…", "Payment confirmed. Creating your order…"];

  return (
    <div className="mx-auto max-w-md rounded-2xl border border-border bg-surface p-6 text-center sm:p-8" role="status" aria-live="polite">
      <div className="mx-auto h-14 w-14 animate-spin rounded-full border-4 border-accent-soft border-t-accent" aria-hidden="true" />
      <h2 className="mt-5 font-serif text-2xl font-bold text-brand">Processing payment</h2>
      <p className="mt-1 text-muted">
        {formatPrice(totalXaf, "XAF")} via {mobile ? provider : "card"}
      </p>
      <ol className="mt-6 space-y-3 text-left text-sm">
        {steps.map((s, i) => (
          <li key={s} className={`flex gap-3 ${i > step ? "text-muted/60" : ""}`}>
            <span
              aria-hidden="true"
              className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
                i < step ? "bg-accent text-brand-contrast" : i === step ? "bg-warm text-white" : "bg-border text-muted"
              }`}
            >
              {i < step ? "✓" : i + 1}
            </span>
            <span>{s}</span>
          </li>
        ))}
      </ol>
      <p className="mt-6 text-xs text-muted">Please don&apos;t close this page.</p>
    </div>
  );
}
