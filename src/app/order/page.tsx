import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "@/components/storefront/cart-view";
import { WhatsAppOrderForm } from "@/components/storefront/whatsapp-order-form";

export const metadata: Metadata = {
  title: "Send your order",
  robots: { index: false },
};

export default function OrderPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:py-12">
      <Link
        href="/cart"
        className="-ml-1 inline-flex min-h-11 items-center gap-1 rounded-lg px-1 text-sm font-semibold text-accent underline underline-offset-[3px] hover:decoration-2"
      >
        <ChevronLeft />
        Back to your order
      </Link>
      <h1 className="type-h1 mt-2 text-brand">Send your order</h1>
      <p className="type-lead mt-3 max-w-[60ch] text-foreground">
        Add your name and town. Your order opens in WhatsApp, ready to send.
      </p>
      <div className="mt-8">
        <WhatsAppOrderForm />
      </div>
    </div>
  );
}
