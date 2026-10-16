import Link from "next/link";
import { btnPrimary } from "@/components/trace/buttons";
import { QrIcon } from "@/components/trace/icons";
import { lots } from "@/lib/data";

export default function LotNotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center">
      <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-accent-soft text-accent">
        <QrIcon className="h-8 w-8" />
      </span>
      <h1 className="mt-6 font-serif text-balance text-3xl font-bold text-brand">We couldn&apos;t find that lot</h1>
      <p className="mt-3 text-muted">
        Please check the code printed under the QR code on your bag — it looks like{" "}
        <span className="font-mono font-semibold text-foreground">GV-2026-014</span>. If the code is right, the lot may
        not be published yet.
      </p>
      <Link href="/trace" className={`${btnPrimary} mt-8`}>
        Back to traceability
      </Link>
      <div className="mt-10">
        <p className="text-sm font-semibold text-foreground">Recent lots</p>
        <ul className="mt-3 flex flex-wrap justify-center gap-2">
          {lots.map((l) => (
            <li key={l.code}>
              <Link
                href={`/trace/${l.code}`}
                className="inline-flex min-h-11 items-center rounded-full border border-border bg-surface px-4 font-mono text-sm text-brand transition-colors duration-150 hover:border-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                {l.code}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
