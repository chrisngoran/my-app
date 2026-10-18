import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { OrderTimeline } from "@/components/order-timeline";
import { GoogleMark } from "@/components/staff-google-button";
import { signOutCustomer } from "@/lib/customer-actions";
import { customerId } from "@/lib/customer-session";
import { customerById, hasDatabase, ordersForCustomer } from "@/lib/db";
import { googleClientConfigured } from "@/lib/google-auth";

export const metadata: Metadata = {
  title: "My account",
  robots: { index: false, follow: false },
};

const SIGNIN_ERRORS: Record<string, string> = {
  "google-failed": "Google sign-in did not finish. Try again.",
  "google-off": "Signing in is not available yet. You can still track an order with its reference.",
};

export default function AccountPage({ searchParams }: { searchParams: Promise<{ signin?: string }> }) {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8">
      <h1 className="type-h2 text-brand">My account</h1>
      <Suspense fallback={<div className="mt-6 h-40 animate-pulse rounded-2xl bg-border/40 motion-reduce:animate-none" />}>
        <Account searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function Account({ searchParams }: { searchParams: Promise<{ signin?: string }> }) {
  const reason = (await searchParams).signin ?? "";
  const id = hasDatabase() ? await customerId() : null;
  const customer = id ? await customerById(id).catch(() => null) : null;

  if (!id || !customer) {
    const canSignIn = hasDatabase() && googleClientConfigured();
    return (
      <div className="mt-4 max-w-md">
        <p className="text-muted">Sign in to see every order you have sent, and where each one is.</p>
        {SIGNIN_ERRORS[reason] && (
          <p role="alert" className="mt-4 text-sm font-medium text-danger">
            {SIGNIN_ERRORS[reason]}
          </p>
        )}
        {canSignIn ? (
          <a
            href="/api/auth/google?as=customer&next=%2Faccount"
            className="press mt-5 flex min-h-12 w-full items-center justify-center gap-3 rounded-lg border border-field-border bg-surface px-4 font-semibold text-foreground pointer-fine:hover:bg-background"
          >
            <GoogleMark />
            Continue with Google
          </a>
        ) : (
          <p className="mt-5 text-sm text-muted">Accounts are not switched on yet.</p>
        )}
        <p className="mt-6 text-sm text-muted">
          No account needed to order or to follow one order:{" "}
          <Link href="/track" className="font-semibold text-accent underline underline-offset-[3px]">
            Track my order
          </Link>
          .
        </p>
      </div>
    );
  }

  let orders: Awaited<ReturnType<typeof ordersForCustomer>> = [];
  let failed = false;
  try {
    orders = await ordersForCustomer(id);
  } catch (e) {
    console.error("Could not read customer orders", e);
    failed = true;
  }

  return (
    <>
      <p className="mt-2 text-muted [overflow-wrap:anywhere]">
        Signed in as {customer.name ? `${customer.name} (${customer.email})` : customer.email}.
      </p>
      <h2 className="type-title mt-8 text-brand">My orders</h2>
      {failed ? (
        <p className="mt-3 text-sm text-muted">Your orders could not be loaded just now. Try again in a minute.</p>
      ) : orders.length === 0 ? (
        <p className="mt-3 text-muted">
          No orders yet. Orders you send on WhatsApp while signed in appear here.{" "}
          <Link href="/shop" className="font-semibold text-accent underline underline-offset-[3px]">
            Browse the coffee
          </Link>
        </p>
      ) : (
        <div className="mt-4 space-y-4">
          {orders.map((o) => (
            <OrderTimeline key={o.id} order={o} />
          ))}
        </div>
      )}
      <form action={signOutCustomer} className="mt-8">
        <button type="submit" className="btn btn-secondary w-full">
          Sign out
        </button>
      </form>
    </>
  );
}
