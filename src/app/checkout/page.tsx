import type { Metadata } from "next";
import Link from "next/link";
import { CheckoutForm } from "@/components/storefront/checkout-form";

export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false },
};

export default function CheckoutPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:py-12">
      <Link href="/cart" className="text-sm font-medium text-accent hover:underline">
        ← Back to cart
      </Link>
      <h1 className="mt-2 font-serif text-3xl font-bold text-brand sm:text-4xl">Checkout</h1>
      <p className="mt-2 text-muted">Pay securely with MTN Mobile Money, Orange Money or card.</p>
      <div className="mt-6">
        <CheckoutForm />
      </div>
    </div>
  );
}
