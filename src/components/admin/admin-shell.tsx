"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Suspense, useEffect } from "react";
import { signOut, useAdminSession } from "@/lib/admin-session";
import { resetAllOverrides } from "@/lib/catalog-overrides";
import { cooperative } from "@/lib/data";
import { AdminLoading, ConfirmButton, useToast } from "./ui";

const NAV = [
  { href: "/admin/products", label: "Products" },
  { href: "/admin/lots", label: "Coffee lots" },
  { href: "/admin/farmers", label: "Farmers" },
];

const navItem =
  "flex min-h-11 items-center justify-center whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";

function AdminNavView({ pathname, onSignOut }: { pathname: string | null; onSignOut: () => void }) {
  return (
    <nav aria-label="Admin">
      <ul className="grid grid-cols-3 gap-1.5 sm:flex sm:flex-wrap">
        {NAV.map((item) => {
          const active = !!pathname && (pathname === item.href || pathname.startsWith(`${item.href}/`));
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`${navItem} ${active ? "bg-surface text-brand" : "bg-white/10 text-brand-contrast hover:bg-white/20"}`}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
        <li className="col-span-2 sm:col-span-1 sm:ml-auto">
          <Link href="/" className={`${navItem} border border-white/30 text-brand-contrast hover:bg-white/10`}>
            View website
          </Link>
        </li>
        <li>
          <button type="button" onClick={onSignOut} className={`${navItem} w-full border border-white/30 text-brand-contrast hover:bg-white/10`}>
            Sign out
          </button>
        </li>
      </ul>
    </nav>
  );
}

function AdminNav({ onSignOut }: { onSignOut: () => void }) {
  return <AdminNavView pathname={usePathname()} onSignOut={onSignOut} />;
}

/** Layout for signed-in staff pages. Signed-out visitors are sent to the sign-in screen. */
export function AdminShell({ children }: { children: React.ReactNode }) {
  const { email, loaded } = useAdminSession();
  const router = useRouter();
  const { toast, show } = useToast();
  const signedOut = loaded && !email;

  useEffect(() => {
    if (signedOut) router.replace("/admin");
  }, [signedOut, router]);

  const handleSignOut = () => {
    signOut();
    router.replace("/admin");
  };

  return (
    <div className="min-h-screen bg-background">
      <p className="bg-warm px-4 py-2 text-center text-sm font-semibold text-white">
        Demo admin — changes are saved only in this browser
      </p>
      <header className="bg-brand text-brand-contrast">
        <div className="mx-auto max-w-3xl px-4 py-3">
          <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
            <p className="font-serif text-lg font-bold leading-tight">{cooperative.name}</p>
            <p className="text-xs text-brand-contrast/70">Staff admin{email ? ` · ${email}` : ""}</p>
          </div>
          {loaded && email && (
            <div className="mt-3">
              <Suspense fallback={<AdminNavView pathname={null} onSignOut={handleSignOut} />}>
                <AdminNav onSignOut={handleSignOut} />
              </Suspense>
            </div>
          )}
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 py-6">
        {(!loaded || !email) && <AdminLoading label={signedOut ? "Going to sign in" : "Loading admin"} />}
        {/* Always rendered (hidden until signed in) so server errors such as notFound() still set the right status. */}
        <div hidden={!loaded || !email}>
          {children}
          {loaded && email && (
            <section aria-labelledby="demo-tools-heading" className="mt-12 rounded-2xl border border-dashed border-border bg-surface p-4">
              <h2 id="demo-tools-heading" className="font-semibold text-brand">
                Demo tools
              </h2>
              <p className="mt-1 text-sm text-muted">
                Put every product, lot and farmer story back to the original sample data. This only affects this browser.
              </p>
              <div className="mt-3">
                <ConfirmButton
                  label="Reset demo data"
                  question="Remove all your changes and photos and go back to the original demo data?"
                  confirmLabel="Yes, reset everything"
                  onConfirm={() => {
                    if (resetAllOverrides()) show("Demo data reset. The website shows the original products again.");
                    else show("Could not reset: this browser is blocking storage.", "error");
                  }}
                />
              </div>
            </section>
          )}
        </div>
      </div>
      {toast}
    </div>
  );
}
