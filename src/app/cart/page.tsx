import type { Metadata } from "next";
import { CartView } from "@/components/storefront/cart-view";

export const metadata: Metadata = {
  title: "Your cart",
  robots: { index: false },
};

export default function CartPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:py-12">
      <h1 className="font-serif text-3xl font-bold text-brand sm:text-4xl">Your cart</h1>
      <div className="mt-6">
        <CartView />
      </div>
    </div>
  );
}
