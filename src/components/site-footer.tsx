import Link from "next/link";
import { BrandMark, BrandWordmark } from "@/components/brand-mark";
import { FollowOnFacebook } from "@/components/share-links";
import { cooperative } from "@/lib/data";

/*
 * The soil ground the page stands on: parchment links on Volcanic Soil (11.19:1).
 * Footer links never prefetch: they are on every page, and prefetching them
 * would spend a visitor's metered data on pages they rarely open.
 */
/** Fixed, not new Date(): the footer is prerendered, and the year changes only when the site is updated. */
const COPYRIGHT_YEAR = 2026;

const footerLink = "inline-flex min-h-11 items-center text-sand underline-offset-4 hover:underline";

export function SiteFooter() {
  return (
    <footer className="on-dark mt-12 bg-brand text-sand print:hidden">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 text-sm sm:grid-cols-3 sm:py-12">
        <div>
          <div className="mb-3 flex items-center gap-2">
            <BrandMark tone="dark" className="h-12 w-12 shrink-0" />
            <BrandWordmark tone="dark" className="text-3xl leading-none" />
          </div>
          <p className="type-title text-sand">{cooperative.name}</p>
          <p className="mt-2 text-mist-on-soil">{cooperative.location}</p>
        </div>
        <div>
          <p className="type-label text-sand">Browse</p>
          {/* One row: two stacked 44px targets read as a gap where something is missing. */}
          <div className="flex flex-wrap gap-x-6">
            <Link href="/shop" prefetch={false} className={footerLink}>
              All coffee
            </Link>
            <Link href="/trace" prefetch={false} className={footerLink}>
              Trace a bag
            </Link>
            <Link href="/our-story" prefetch={false} className={footerLink}>
              Our story
            </Link>
            <Link href="/farmers" prefetch={false} className={footerLink}>
              Our farmers
            </Link>
            <Link href="/track" prefetch={false} className={footerLink}>
              Track my order
            </Link>
            <Link href="/account" prefetch={false} className={footerLink}>
              My account
            </Link>
          </div>
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
          <FollowOnFacebook className={`${footerLink} gap-2`} />
        </div>
      </div>
      <div className="border-t border-white/15">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 px-4 py-1 text-xs text-mist-on-soil">
          <span>© {COPYRIGHT_YEAR} {cooperative.name}. All rights reserved.</span>
          <span>Demo website</span>
          <Link href="/portal" prefetch={false} className={footerLink}>
            Staff platform preview
          </Link>
          <Link href="/farmer" prefetch={false} className={footerLink}>
            Farmer login
          </Link>
          <Link href="/staff" prefetch={false} className={footerLink}>
            Staff login
          </Link>
        </div>
      </div>
    </footer>
  );
}
