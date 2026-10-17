import Link from "next/link";
import { btnSecondary } from "@/components/trace/buttons";
import { cooperative } from "@/lib/data";

/*
 * Any address that matches no page. It sits outside the (site) group, and it
 * travels with every page's data (the admin's too), so it stays light: a name
 * that links home instead of the full site header and footer.
 */
export default function NotFound() {
  return (
    <>
      <header className="on-dark bg-brand px-4 py-4">
        <Link href="/" className="type-title text-sand underline-offset-4 hover:underline">
          {cooperative.name}
        </Link>
      </header>
      <main id="main" tabIndex={-1} className="flex-1 focus:outline-none">
        <div className="mx-auto max-w-2xl px-4 py-14 sm:py-20">
          <h1 className="type-h1 text-balance text-brand">This page isn&apos;t here</h1>
          <p className="type-lead mt-4 max-w-[60ch] text-pretty text-foreground">
            The link may be old or mistyped. Our coffee and the lot records are still a tap away.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/shop" className={btnSecondary}>
              See all coffee
            </Link>
            <Link href="/trace" className={btnSecondary}>
              Trace a bag
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
