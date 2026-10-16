"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type IconProps = { className?: string };
const base = { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round" } as const;

const icons = {
  dashboard: (p: IconProps) => (
    <svg {...base} {...p} aria-hidden="true"><rect x="3" y="3" width="7" height="9" rx="1.5" /><rect x="14" y="3" width="7" height="5" rx="1.5" /><rect x="14" y="12" width="7" height="9" rx="1.5" /><rect x="3" y="16" width="7" height="5" rx="1.5" /></svg>
  ),
  farmers: (p: IconProps) => (
    <svg {...base} {...p} aria-hidden="true"><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20c.8-3.5 3.4-5.5 6.5-5.5s5.7 2 6.5 5.5" /><path d="M16 4.5a3.5 3.5 0 0 1 0 7M18 14.8c1.9.8 3.1 2.6 3.5 5.2" /></svg>
  ),
  lots: (p: IconProps) => (
    <svg {...base} {...p} aria-hidden="true"><ellipse cx="12" cy="12" rx="6" ry="8.5" transform="rotate(-30 12 12)" /><path d="M8.5 18.5c2-3 1-6 3-9s3.5-3 4-4" /></svg>
  ),
  inventory: (p: IconProps) => (
    <svg {...base} {...p} aria-hidden="true"><path d="M3 7.5 12 3l9 4.5v9L12 21l-9-4.5z" /><path d="M3 7.5 12 12l9-4.5M12 12v9" /></svg>
  ),
  orders: (p: IconProps) => (
    <svg {...base} {...p} aria-hidden="true"><path d="M6 3h12l1 18H5z" /><path d="M9 7a3 3 0 0 0 6 0" /></svg>
  ),
  payments: (p: IconProps) => (
    <svg {...base} {...p} aria-hidden="true"><rect x="2.5" y="6" width="19" height="13" rx="2" /><path d="M2.5 10h19M6.5 15h4" /></svg>
  ),
  reports: (p: IconProps) => (
    <svg {...base} {...p} aria-hidden="true"><path d="M4 20V4M4 20h16" /><path d="M8 16v-4M12 16V8M16 16v-6" /></svg>
  ),
};

export const PORTAL_NAV = [
  { href: "/portal", label: "Dashboard", icon: icons.dashboard },
  { href: "/portal/farmers", label: "Farmers", icon: icons.farmers },
  { href: "/portal/lots", label: "Coffee lots", icon: icons.lots },
  { href: "/portal/inventory", label: "Inventory", icon: icons.inventory },
  { href: "/portal/orders", label: "Orders", icon: icons.orders },
  { href: "/portal/payments", label: "Farmer payments", icon: icons.payments },
  { href: "/portal/reports", label: "Reports", icon: icons.reports },
];

function isActive(href: string, pathname: string | null) {
  if (!pathname) return false;
  if (href === "/portal") return pathname === "/portal";
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Pure view so it can also be the Suspense fallback (no active item). */
export function PortalNavView({ pathname }: { pathname: string | null }) {
  return (
    <nav aria-label="Portal">
      <ul className="-mx-4 flex gap-1 overflow-x-auto px-4 pb-1 [scrollbar-width:none] lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0 lg:pb-0">
        {PORTAL_NAV.map(({ href, label, icon: Icon }) => {
          const active = isActive(href, pathname);
          return (
            <li key={href} className="shrink-0">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                  active
                    ? "bg-brand text-brand-contrast shadow-sm"
                    : "text-foreground/80 hover:bg-surface hover:text-brand lg:hover:bg-accent-soft/60"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0 lg:h-5 lg:w-5" />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function PortalNav() {
  const pathname = usePathname();
  return <PortalNavView pathname={pathname} />;
}
