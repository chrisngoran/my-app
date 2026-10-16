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

const tab =
  "press flex min-h-11 items-center justify-center whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold";

/** Small text actions on the brown header ("View website", "Sign out"). */
const headerAction =
  "press inline-flex min-h-11 items-center whitespace-nowrap rounded-lg px-2.5 text-sm font-medium text-brand-contrast/90 hover:bg-white/10 hover:text-brand-contrast";

function AdminTabs({ pathname }: { pathname: string | null }) {
  return (
    <nav aria-label="Admin">
      <ul className="grid grid-cols-3 gap-1.5 sm:flex">
        {NAV.map((item) => {
          const active = !!pathname && (pathname === item.href || pathname.startsWith(`${item.href}/`));
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`${tab} ${active ? "bg-surface text-brand" : "bg-white/10 text-brand-contrast hover:bg-white/20"}`}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function AdminNav() {
  return <AdminTabs pathname={usePathname()} />;
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
      <p className="bg-warm-ink px-4 py-2 text-center text-sm font-semibold text-white">
        Demo admin — changes are saved only in this browser
      </p>
      <header className="on-dark bg-brand text-brand-contrast">
        <div className="mx-auto max-w-3xl px-4 pt-3 pb-3">
          <p className="font-serif text-lg font-bold leading-tight">{cooperative.name}</p>
          {/* One compact row: who is signed in, then the two secondary actions. The section tabs stay the only large row. */}
          <div className="mt-0.5 flex items-center justify-between gap-2">
            <p className="min-w-0 truncate text-xs text-brand-contrast/75">Staff admin{email ? ` · ${email}` : ""}</p>
            {loaded && email && (
              <div className="-mr-2.5 flex shrink-0 items-center">
                <Link href="/" className={headerAction}>
                  View website
                </Link>
                <button type="button" onClick={handleSignOut} className={headerAction}>
                  Sign out
                </button>
              </div>
            )}
          </div>
          {loaded && email && (
            <div className="mt-1.5">
              <Suspense fallback={<AdminTabs pathname={null} />}>
                <AdminNav />
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
