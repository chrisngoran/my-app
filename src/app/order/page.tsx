import type { Metadata } from "next";
import Link from "next/link";
import { WhatsAppOrderForm } from "@/components/storefront/whatsapp-order-form";

export const metadata: Metadata = {
  title: "Send your order",
  robots: { index: false },
};

export default function OrderPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:py-12">
      <Link href="/cart" className="-ml-1 inline-flex min-h-11 items-center rounded-lg px-1 text-sm font-medium text-accent hover:underline">
        ← Back to your order list
      </Link>
      <h1 className="mt-1 font-serif text-3xl font-bold text-brand sm:text-4xl">Send your order</h1>
      <p className="mt-2 text-muted">
        Your order opens in WhatsApp, ready to send. We confirm it, then you pay by MTN MoMo or Orange Money.
      </p>
      <div className="mt-6">
        <WhatsAppOrderForm />
      </div>
    </div>
  );
}
