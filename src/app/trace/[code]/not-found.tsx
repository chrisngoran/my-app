import Link from "next/link";
import { btnSecondary } from "@/components/trace/buttons";
import { LotSearch } from "@/components/trace/lot-search";
import { MissingLotCode } from "@/components/trace/missing-lot-code";
import { lots } from "@/lib/data";

export default function LotNotFound() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-14 sm:py-20">
      <h1 className="type-h1 text-balance text-brand [overflow-wrap:anywhere]">
        We couldn&apos;t find <MissingLotCode />
      </h1>
      <p className="type-lead mt-4 max-w-[60ch] text-pretty text-foreground">
        Check the code printed under the QR code on the back of your bag. It looks like{" "}
        <span className="type-stencil text-xl leading-none whitespace-nowrap text-brand">GV-2026-014</span>. If the code is right, the lot may not be published
        yet.
      </p>

      <div className="mt-8">
        <LotSearch codes={lots.map((l) => l.code)} label="Try the code again" />
      </div>

      <div className="mt-10 border-t border-border pt-8">
        <h2 className="type-label text-foreground">Lots recorded this season</h2>
        <ul className="mt-2 flex flex-wrap gap-x-6">
          {lots.map((l) => (
            <li key={l.code}>
              <Link
                href={`/trace/${l.code}`}
                className="type-stencil inline-flex min-h-11 items-center text-xl text-accent underline decoration-1 underline-offset-4 hover:decoration-2"
              >
                {l.code}
              </Link>
            </li>
          ))}
        </ul>
        <Link href="/trace" className={`${btnSecondary} mt-6`}>
          Back to Trace
        </Link>
      </div>
    </div>
  );
}
