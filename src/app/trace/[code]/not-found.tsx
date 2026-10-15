import Link from "next/link";
import { QrIcon } from "@/components/trace/icons";
import { lots } from "@/lib/data";

export default function LotNotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center">
      <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-accent-soft text-accent">
        <QrIcon className="h-8 w-8" />
      </span>
      <h1 className="mt-6 font-serif text-3xl font-bold text-brand">We couldn&apos;t find that lot</h1>
      <p className="mt-3 text-muted">
        Please check the code printed under the QR code on your bag — it looks like{" "}
        <span className="font-mono font-semibold text-foreground">GV-2026-014</span>. If the code is right, the lot may
        not be published yet.
      </p>
      <Link
        href="/trace"
        className="mt-8 inline-block rounded-md bg-brand px-5 py-2.5 text-sm font-semibold text-brand-contrast hover:opacity-90"
      >
        Back to traceability
      </Link>
      <div className="mt-10">
        <p className="text-sm font-semibold text-foreground">Recent lots</p>
        <ul className="mt-3 flex flex-wrap justify-center gap-2">
          {lots.map((l) => (
            <li key={l.code}>
              <Link
                href={`/trace/${l.code}`}
                className="inline-block rounded-full border border-border bg-surface px-3 py-1 font-mono text-sm text-brand hover:border-accent"
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
