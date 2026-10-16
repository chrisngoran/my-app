import type { Metadata } from "next";
import { CartView } from "@/components/storefront/cart-view";

export const metadata: Metadata = {
  title: "Your order",
  robots: { index: false },
};

export default function CartPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
      <h1 className="type-h1 text-brand">Your order</h1>
      <div className="mt-8">
        <CartView />
      </div>
    </div>
  );
}
