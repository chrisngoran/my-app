import Link from "next/link";
import { cooperative } from "@/lib/data";

const footerLink = "inline-flex min-h-11 items-center text-muted hover:text-brand hover:underline";

export function SiteFooter() {
  return (
    <footer className="mt-8 border-t border-border bg-surface sm:mt-12 print:hidden">
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 text-sm sm:grid-cols-3 sm:py-10">
        <div>
          <p className="font-serif text-lg font-bold text-brand">{cooperative.name}</p>
          <p className="mt-2 text-muted">{cooperative.location}</p>
        </div>
        <div className="flex flex-col items-start">
          <p className="font-semibold">Shop</p>
          <Link href="/shop" className={footerLink}>
            All coffee
          </Link>
          <Link href="/trace" className={footerLink}>
            Trace a lot
          </Link>
        </div>
        <div className="flex flex-col items-start">
          <p className="font-semibold">Order &amp; pay</p>
          <p className="mt-1 text-muted">WhatsApp or phone · MTN Mobile Money · Orange Money</p>
          <a href={`mailto:${cooperative.email}`} className={`${footerLink} break-all`}>
            {cooperative.email}
          </a>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-5 px-4 py-1 text-xs text-muted">
          <span>Demo website</span>
          <Link href="/portal" className={footerLink}>
            Full platform preview
          </Link>
          <Link href="/admin" className={footerLink}>
            Staff login
          </Link>
        </div>
      </div>
    </footer>
  );
}
