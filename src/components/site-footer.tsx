import Link from "next/link";
import { cooperative } from "@/lib/data";

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-border bg-surface print:hidden">
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 text-sm sm:grid-cols-3">
        <div>
          <p className="font-serif text-lg font-bold text-brand">{cooperative.name}</p>
          <p className="mt-2 text-muted">{cooperative.location}</p>
        </div>
        <div className="space-y-1">
          <p className="font-semibold">Shop</p>
          <Link href="/shop" className="block text-muted hover:text-brand">
            All coffee
          </Link>
          <Link href="/trace" className="block text-muted hover:text-brand">
            Trace a lot
          </Link>
        </div>
        <div className="space-y-1">
          <p className="font-semibold">Order &amp; pay</p>
          <p className="text-muted">WhatsApp or phone · MTN Mobile Money · Orange Money</p>
          <p className="text-muted">{cooperative.email}</p>
        </div>
      </div>
    </footer>
  );
}
