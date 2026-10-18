"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Suspense, useEffect } from "react";
import { signOut, useAdminSession } from "@/lib/admin-session";
import { clearSaveError, resetAllOverrides, useCatalogOverrides } from "@/lib/catalog-overrides";
import { cooperative } from "@/lib/data";
import { signOutStaff } from "@/lib/staff-actions";
import { useStaffStatus } from "@/lib/staff-status";
import { AdminLoading, ConfirmButton, STORAGE_BLOCKED, useToast } from "./ui";

const NAV = [
  { href: "/admin/products", label: "Products" },
  { href: "/admin/lots", label: "Coffee lots" },
  { href: "/admin/farmers", label: "Farmers" },
];

/** One segment of the section control. Labels wrap (never clip) at large text sizes. */
const tab =
  "press flex min-h-12 w-full items-center justify-center rounded-lg px-3 py-2 text-center text-sm leading-tight";

/** Small text actions on the soil header ("View website", "Sign out"). */
const headerAction =
  "press inline-flex min-h-11 items-center whitespace-nowrap rounded-lg px-2.5 text-sm font-medium text-sand underline-offset-[3px] hover:bg-white/10 hover:underline";

function AdminTabs({ pathname }: { pathname: string | null }) {
  return (
    <nav aria-label="Admin">
      <ul className="flex flex-wrap gap-1.5">
        {NAV.map((item) => {
          const active = !!pathname && (pathname === item.href || pathname.startsWith(`${item.href}/`));
          return (
            <li key={item.href} className="flex min-w-0 flex-1 basis-[min(100%,6.5rem)]">
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`${tab} ${
                  active ? "bg-background font-semibold text-brand" : "bg-white/10 font-medium text-white pointer-fine:hover:bg-white/20"
                }`}
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
  const demoSession = useAdminSession();
  const staffStatus = useStaffStatus();
  const { saveError } = useCatalogOverrides();
  const router = useRouter();
  const { toast, show } = useToast();
  // With a database the staff password is the real sign-in; without one the demo sign-in stands in.
  const shared = staffStatus.shared;
  const loaded = staffStatus.loaded && (shared || demoSession.loaded);
  const email = shared ? (staffStatus.staff ? "cooperative staff" : null) : demoSession.email;
  const signedOut = loaded && !email;

  // A save the website refused has already been undone on screen; say why.
  useEffect(() => {
    if (!saveError) return;
    show(saveError, "error");
    clearSaveError();
  }, [saveError, show]);

  useEffect(() => {
    if (signedOut) router.replace("/admin");
  }, [signedOut, router]);

  const handleSignOut = () => {
    signOut();
    router.replace("/admin");
  };

  return (
    <div className="min-h-screen bg-background">
      <p className="bg-sand px-4 py-2 text-center text-sm font-semibold text-brand">
        {!staffStatus.loaded ? "\u00a0" : shared ? "Changes you save here go live on the website for every visitor" : "Demo admin — changes are saved only in this browser"}
      </p>
      <header className="on-dark bg-brand text-white">
        <div className="mx-auto max-w-3xl px-4 pt-3 pb-3">
          <p className="type-title text-sand">{cooperative.name}</p>
          {/*
            One compact row: who is signed in, then the two secondary actions. Its height is held (min-h-11)
            before the session is read, so the header does not grow when the actions arrive. It wraps at
            large text sizes instead of clipping.
          */}
          <div className="mt-0.5 flex min-h-11 flex-wrap items-center justify-between gap-x-2">
            <p className="min-w-0 flex-1 basis-40 truncate text-xs text-mist-on-soil" title={email ?? undefined}>
              {email ? `Signed in as ${email}` : "Staff admin"}
            </p>
            {loaded && email && (
              <div className="-mr-2.5 flex flex-wrap items-center">
                <Link href="/" className={headerAction}>
                  View website
                </Link>
                {shared ? (
                  <form action={signOutStaff}>
                    <button type="submit" className={headerAction}>
                      Sign out
                    </button>
                  </form>
                ) : (
                  <button type="button" onClick={handleSignOut} className={headerAction}>
                    Sign out
                  </button>
                )}
              </div>
            )}
          </div>
          {/* Always rendered: they are plain links, and drawing them late pushed the whole page down. */}
          <div className="mt-1.5">
            <Suspense fallback={<AdminTabs pathname={null} />}>
              <AdminNav />
            </Suspense>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 py-6">
        {(!loaded || !email) && <AdminLoading label={signedOut ? "Going to sign in" : "Loading admin"} />}
        {/* Always rendered (hidden until signed in) so server errors such as notFound() still set the right status. */}
        <div hidden={!loaded || !email}>
          {children}
          {loaded && email && !shared && (
            <section aria-labelledby="demo-tools-heading" className="mt-12 rounded-2xl border border-dashed border-field-border bg-surface p-4">
              <h2 id="demo-tools-heading" className="type-label text-brand">
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
                    else show(`Not reset. ${STORAGE_BLOCKED}`, "error");
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
