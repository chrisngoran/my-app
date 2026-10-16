import Link from "next/link";
import type { CoffeeLot, Farmer } from "@/lib/types";
import { LiveLotNotesBlock, LiveLotScore } from "./live-catalog";

/*
 * The lot record as a parchment tag, the way it hangs on a sack of sun-dried
 * parchment coffee. Parchment fills only this tag and the small lot tags on
 * product images. The punched hole is the only skeuomorphic touch.
 */

function altitudeRange(growers: Farmer[]) {
  const alts = growers.map((f) => f.altitudeMetres);
  if (!alts.length) return "1,600–2,000 m";
  const lo = Math.min(...alts);
  const hi = Math.max(...alts);
  return lo === hi ? `${lo.toLocaleString("en-GB")} m` : `${lo.toLocaleString("en-GB")}–${hi.toLocaleString("en-GB")} m`;
}

/** Same QR glyph as before, drawn at 16px. */
function QrGlyph() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" className="h-4 w-4 shrink-0" fill="currentColor">
      <path d="M2 2h6v6H2zm2 2v2h2V4zm8-2h6v6h-6zm2 2v2h2V4zM2 12h6v6H2zm2 2v2h2v-2zm7-2h2v2h-2zm2 2h2v2h-2zm2-2h3v2h-3zm-4 4h2v2h-2zm4 0h3v2h-3z" />
    </svg>
  );
}

export function LotTag({
  lot,
  growers,
  headingLevel = "h2",
  action = "button",
  className = "",
}: {
  lot: CoffeeLot;
  growers: Farmer[];
  headingLevel?: "h2" | "h3";
  /** "button": a leaf "Trace this coffee" button. "link": an underlined link to the full record. */
  action?: "button" | "link";
  className?: string;
}) {
  const Heading = headingLevel;
  const headingId = `lot-tag-${lot.code}`;
  const harvested = new Date(lot.harvestDate).toLocaleDateString("en-GB", { month: "short", year: "numeric", timeZone: "UTC" });
  const rows: { label: string; value: React.ReactNode; hint?: string }[] = [
    { label: "Processing", value: lot.processingMethod },
    { label: "Variety", value: lot.variety },
    { label: "Altitude", value: altitudeRange(growers) },
    { label: "Harvested", value: harvested },
    {
      label: "Cupping score",
      value: (
        <>
          <LiveLotScore code={lot.code} fallback={lot.quality.cuppingScore} />
          <span className="text-sm font-normal text-muted"> / 100</span>
        </>
      ),
      hint: "A taste test by trained tasters. 80 or more is specialty grade.",
    },
  ];

  return (
    <section
      aria-labelledby={headingId}
      className={`relative min-w-0 rounded-2xl bg-sand p-5 text-foreground before:absolute before:left-4 before:top-4 before:h-2.5 before:w-2.5 before:rounded-full before:bg-background sm:p-6 ${className}`}
    >
      <Heading id={headingId} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 pl-5">
        <span className="type-stencil text-[1.75rem] text-cherry">{lot.code}</span>
        <span className="text-sm text-muted">Lot record</span>
      </Heading>

      <dl className="mt-5 grid grid-cols-[repeat(auto-fit,minmax(min(100%,8rem),1fr))] gap-x-4 gap-y-3">
        {rows.map((r) => (
          <div key={r.label} className={`min-w-0 ${r.hint ? "col-span-full" : ""}`}>
            <dt className="type-label text-muted [overflow-wrap:anywhere]">{r.label}</dt>
            <dd className="type-data mt-0.5 [overflow-wrap:anywhere]">{r.value}</dd>
            {r.hint && <dd className="mt-0.5 text-sm text-muted">{r.hint}</dd>}
          </div>
        ))}
      </dl>

      <LiveLotNotesBlock code={lot.code} fallback={lot.notes} className="mt-4 line-clamp-5 text-sm [overflow-wrap:anywhere]" />

      {growers.length > 0 && (
        <div className="mt-4 text-sm">
          <p className="type-label text-muted">Grown by</p>
          <ul className="mt-0.5">
            {growers.map((f) => (
              <li key={f.id}>
                {f.name}, {f.village}
              </li>
            ))}
          </ul>
        </div>
      )}

      {action === "button" ? (
        <Link href={`/trace/${lot.code}`} className="btn btn-go mt-5 w-full sm:w-auto">
          <QrGlyph />
          Trace this coffee
        </Link>
      ) : (
        <Link
          href={`/trace/${lot.code}`}
          className="mt-3 inline-flex min-h-11 items-center font-semibold text-accent underline decoration-1 underline-offset-4 hover:decoration-2"
        >
          <span>
            See the full record for <span className="whitespace-nowrap">{lot.code}</span>
          </span>
        </Link>
      )}
    </section>
  );
}
