import Link from "next/link";
import { cooperative } from "@/lib/data";

/* The soil ground the page stands on: parchment links on Volcanic Soil (11.19:1). */
const footerLink = "inline-flex min-h-11 items-center text-sand underline-offset-4 hover:underline";

export function SiteFooter() {
  return (
    <footer className="on-dark mt-12 bg-brand text-sand print:hidden">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 text-sm sm:grid-cols-3 sm:py-12">
        <div>
          <p className="type-title text-sand">{cooperative.name}</p>
          <p className="mt-2 text-mist-on-soil">{cooperative.location}</p>
        </div>
        <div className="flex flex-col items-start">
          <p className="type-label text-sand">Shop</p>
          <Link href="/shop" className={footerLink}>
            All coffee
          </Link>
          <Link href="/trace" className={footerLink}>
            Trace a lot
          </Link>
        </div>
        <div className="flex min-w-0 flex-col items-start">
          <p className="type-label text-sand">Order &amp; pay</p>
          <ul className="mt-2 space-y-1 text-mist-on-soil">
            <li>WhatsApp or phone</li>
            <li>MTN Mobile Money</li>
            <li>Orange Money</li>
          </ul>
          <a href={`mailto:${cooperative.email}`} className={`${footerLink} mt-1 max-w-full [overflow-wrap:anywhere]`}>
            {cooperative.email}
          </a>
        </div>
      </div>
      <div className="border-t border-white/15">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 px-4 py-1 text-xs text-mist-on-soil">
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
