import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { LiveLotScore } from "@/components/storefront/live-catalog";
import { PrintButton } from "@/components/trace/print-button";
import {
  altitudeRange,
  formatHarvestDate,
  lotFarmers,
  lotProducts,
  normaliseLotCode,
  safeDecode,
} from "@/components/trace/lot-utils";
import { LotQrCode } from "@/components/trace/qr-code";
import { cooperative, getLot, lots } from "@/lib/data";
import { siteUrl } from "@/lib/qr";

// Unknown params must wait for the full render so notFound() and redirect()
// set a real 404/307 status instead of streaming into a 200 response.
export const ensureStatic = "navigation";

export function generateStaticParams() {
  return lots.map((lot) => ({ code: lot.code }));
}

export async function generateMetadata({ params }: { params: Promise<{ code: string }> }): Promise<Metadata> {
  const { code } = await params;
  const lot = getLot(normaliseLotCode(safeDecode(code)));
  return {
    title: lot ? `Bag label · ${lot.code}` : "Lot not found",
    robots: { index: false },
  };
}

// Label is laid out in container-query units so the on-screen preview scales
// down on phones while the printed label is exactly 100 mm x 150 mm.
const LABEL_CSS = `
.gv-label {
  container-type: inline-size;
  width: min(100mm, 100%);
  aspect-ratio: 2 / 3;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}
.gv-label .l-xs { font-size: 2.6cqw; }
.gv-label .l-sm { font-size: 3.2cqw; }
.gv-label .l-md { font-size: 4cqw; }
.gv-label .l-lg { font-size: 5.6cqw; }
.gv-label .l-xl { font-size: 6.6cqw; }
.gv-label .l-pad { padding: 5cqw 6cqw; }
.gv-label .l-qr { width: 34cqw; height: 34cqw; }
@media print {
  @page { size: 100mm 150mm; margin: 0; }
  html, body { background: #fff !important; }
  body > header, body > footer, .no-print { display: none !important; }
  main { padding: 0 !important; margin: 0 !important; }
  .gv-print-area { padding: 0 !important; margin: 0 !important; display: block !important; }
  .gv-label {
    width: 100mm !important;
    height: 150mm !important;
    border: 0 !important;
    border-radius: 0 !important;
    box-shadow: none !important;
    break-inside: avoid;
  }
}
`;

export default async function LotLabelPage({ params }: { params: Promise<{ code: string }> }) {
  const { code: rawCode } = await params;
  const decoded = safeDecode(rawCode);
  const lot = getLot(normaliseLotCode(decoded));
  if (!lot) notFound();
  if (lot.code !== decoded) redirect(`/trace/${lot.code}/label`);

  const farmers = lotFarmers(lot);
  const product = lotProducts(lot)[0];
  const villages = [...new Set(farmers.map((f) => f.village))];
  const productName = product?.name ?? `${lot.processingMethod} Arabica`;
  const netWeight = product
    ? product.weightGrams >= 1000
      ? `${product.weightGrams / 1000} kg`
      : `${product.weightGrams} g`
    : null;
  const shortUrl = `${siteUrl().replace(/^https?:\/\//, "")}/trace/${lot.code}`;

  const rows: [string, string][] = [
    ["Origin", `${villages.join(", ")}, Kumbo, Cameroon`],
    ["Altitude", altitudeRange(farmers)],
    ["Variety", lot.variety],
    ["Process", lot.processingMethod],
    ["Harvest", formatHarvestDate(lot.harvestDate)],
    ...(product?.roast ? ([["Roast", product.roast]] as [string, string][]) : []),
  ];

  return (
    <div className="gv-print-area mx-auto flex max-w-3xl flex-col items-center px-4 py-8">
      <style dangerouslySetInnerHTML={{ __html: LABEL_CSS }} />

      <div className="no-print mb-6 w-full text-center">
        <p className="text-sm text-muted">
          <Link
            href={`/trace/${lot.code}`}
            className="inline-flex min-h-11 items-center rounded-lg px-2 underline-offset-[3px] hover:text-foreground hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            ← Back to lot {lot.code}
          </Link>
        </p>
        <h1 className="mt-1 font-serif text-2xl font-bold text-brand">Packaging label</h1>
        <p className="mx-auto mt-1 max-w-md text-sm text-muted">
          Printed at 10 × 15 cm. Use a label printer or A6 sticker paper and set margins to “None”.
        </p>
        <PrintButton className="mt-4" />
      </div>

      <section
        aria-label={`Printable label for lot ${lot.code}`}
        className="gv-label flex flex-col overflow-hidden rounded-md border border-border bg-white text-[#2a1d16] shadow-lg"
      >
        {/* Brand band */}
        <div className="l-pad flex items-center gap-[3cqw] bg-brand text-brand-contrast">
          <svg viewBox="0 0 40 40" aria-hidden="true" className="h-[10cqw] w-[10cqw] shrink-0">
            <circle cx="20" cy="20" r="19" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.6" />
            <ellipse cx="20" cy="20" rx="8" ry="12" transform="rotate(30 20 20)" fill="currentColor" />
            <path d="M16.5 10.5c4 4 -1.5 9 3.5 12.5s3.5 6 3.5 6" fill="none" stroke="#4a2c20" strokeWidth="1.6" />
          </svg>
          <div className="min-w-0 leading-tight">
            <p className="l-lg font-serif font-bold">{cooperative.shortName}</p>
            <p className="l-xs uppercase tracking-[0.15em] opacity-80">Cooperative Coffee · Kumbo</p>
          </div>
        </div>

        {/* Product */}
        <div className="l-pad pb-0">
          <p className="l-xs font-semibold uppercase tracking-[0.18em] text-[#2f6b3f]">100% Arabica · Bui Highlands</p>
          <h2 className="l-xl mt-[1cqw] font-serif font-bold leading-[1.1]">{productName}</h2>
          <dl className="mt-[3cqw] grid grid-cols-2 gap-x-[4cqw] gap-y-[1.6cqw]">
            {rows.map(([k, v], i) => (
              <div key={k} className={i === 0 ? "col-span-2" : undefined}>
                <dt className="l-xs uppercase tracking-wider text-[#7a6a5f]">{k}</dt>
                <dd className="l-sm font-semibold leading-snug">{v}</dd>
              </div>
            ))}
          </dl>
          <p className="l-sm mt-[2cqw] leading-snug">
            <span className="text-[#7a6a5f]">Grown by </span>
            <span className="font-semibold">{farmers.map((f) => f.name).join(", ")}</span>
          </p>
        </div>

        {/* QR */}
        <div className="l-pad mt-auto flex items-center gap-[4cqw]">
          <LotQrCode code={lot.code} className="l-qr shrink-0" />
          <div className="min-w-0">
            <p className="l-lg font-serif font-bold leading-tight">Scan to meet your farmer</p>
            <p className="l-xs mt-[1.5cqw] break-all text-[#7a6a5f]">{shortUrl}</p>
            <p className="l-xs mt-[2cqw] uppercase tracking-wider text-[#7a6a5f]">Lot code</p>
            <p className="l-md font-mono font-bold tracking-wide">{lot.code}</p>
          </div>
        </div>

        {/* Footer strip */}
        <div className="l-xs flex items-center justify-between gap-[2cqw] border-t border-[#e7ddd3] px-[6cqw] py-[2.5cqw]">
          <span>
            Cupping score{" "}
            <strong>
              <LiveLotScore code={lot.code} fallback={lot.quality.cuppingScore} />
            </strong>
          </span>
          {netWeight && (
            <span>
              Net wt <strong>{netWeight}</strong>
            </span>
          )}
          <span>Product of Cameroon</span>
        </div>
      </section>

      <p className="no-print mt-4 text-center text-xs text-muted">Preview scaled to fit your screen.</p>
    </div>
  );
}
