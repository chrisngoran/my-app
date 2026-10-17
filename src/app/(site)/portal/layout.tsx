import type { Metadata } from "next";
import { Suspense } from "react";
import { PortalNav, PortalNavView } from "@/components/portal/portal-nav";

export const metadata: Metadata = {
  title: { default: "Cooperative portal", template: "%s · Cooperative portal" },
  description: "Staff dashboard for Green Venture Cooperative Coffee: farmers, lots, inventory, orders and payments.",
  robots: { index: false, follow: false },
};

// When printing a report, hide the public site chrome as well as the portal's own.
const PRINT_CSS = `@media print { body > header, body > footer { display: none !important; } }`;

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-full bg-background">
      <style>{PRINT_CSS}</style>
      <div className="border-b border-accent/20 bg-accent-soft print:hidden">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-3 gap-y-1 px-4 py-2 text-sm text-accent">
          <span className="inline-flex items-center gap-2 font-medium">
            <span className="relative flex h-2 w-2" aria-hidden="true">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60 motion-reduce:animate-none" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
            </span>
            Demo: signed in as Cooperative Manager
          </span>
          <span className="text-accent/80">· Kumbo office · sample data</span>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 lg:grid lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-8 lg:py-8">
        <aside className="sticky top-0 z-10 -mx-4 border-b border-border bg-background/95 px-4 py-2 backdrop-blur lg:top-6 lg:mx-0 lg:self-start lg:border-0 lg:bg-transparent lg:p-0 lg:backdrop-blur-none print:hidden">
          <p className="mb-3 hidden px-3 text-xs font-semibold uppercase tracking-wider text-muted lg:block">
            Management
          </p>
          <Suspense fallback={<PortalNavView pathname={null} />}>
            <PortalNav />
          </Suspense>
          <div className="mt-6 hidden rounded-xl border border-border bg-surface p-4 text-xs text-muted lg:block">
            <p className="font-semibold text-foreground">Green Venture Cooperative</p>
            <p className="mt-1">Kumbo, Bui Division, North West Cameroon</p>
          </div>
        </aside>
        <div className="min-w-0 py-6 lg:py-0">{children}</div>
      </div>
    </div>
  );
}
