import type { Metadata } from "next";
import { Suspense } from "react";
import { OrderSuccess, OrderSuccessFallback } from "@/components/storefront/order-success";

export const metadata: Metadata = {
  title: "Order confirmed",
  robots: { index: false },
};

export default function CheckoutSuccessPage() {
  return (
    <div className="px-4 py-10 sm:py-16">
      <Suspense fallback={<OrderSuccessFallback />}>
        <OrderSuccess />
      </Suspense>
    </div>
  );
}
