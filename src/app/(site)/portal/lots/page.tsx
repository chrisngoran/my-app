import type { Metadata } from "next";
import Link from "next/link";
import { formatDate, formatNumber } from "@/components/portal/metrics";
import { Card, PageHeader, Pill, rowClass, StatCard, TableWrap, tableClass, td, tdRight, th, theadClass, thRight } from "@/components/portal/ui";
import { getFarmer, lots, products } from "@/lib/data";

export const metadata: Metadata = { title: "Coffee lots" };

function scoreTone(score: number) {
  if (score >= 85) return "bg-accent text-brand-contrast";
  if (score >= 83) return "bg-accent-soft text-accent";
  return "bg-background text-foreground ring-1 ring-inset ring-border";
}

export default function LotsPage() {
  const totalKg = lots.reduce((n, l) => n + l.weightKg, 0);
  const avgScore = lots.reduce((n, l) => n + l.quality.cuppingScore, 0) / lots.length;
  const sorted = [...lots].sort((a, b) => b.harvestDate.localeCompare(a.harvestDate));

  return (
    <>
      <PageHeader
        title="Coffee lots"
        description="Every lot is traceable to its farmers. The code is printed as a QR on the bag and opens the public provenance page."
      />

      <div className="mb-6 grid grid-cols-1 gap-3 min-[420px]:grid-cols-3 sm:gap-4">
        <StatCard label="Lots this season" value={lots.length} />
        <StatCard label="Green coffee" value={`${formatNumber(totalKg)} kg`} tone="accent" />
        <StatCard label="Average cupping" value={formatNumber(avgScore, 2)} hint="SCA scale, 80+ is specialty" tone="warm" />
      </div>

      <Card id="lots" title="Lot register">
        <TableWrap label="Coffee lots">
          <table className={tableClass}>
            <caption className="sr-only">Coffee lots with quality data</caption>
            <thead className={theadClass}>
              <tr>
                <th scope="col" className={th}>Lot code</th>
                <th scope="col" className={th}>Harvest</th>
                <th scope="col" className={th}>Process</th>
                <th scope="col" className={th}>Variety</th>
                <th scope="col" className={th}>Farmers</th>
                <th scope="col" className={thRight}>Weight</th>
                <th scope="col" className={thRight}>Moisture</th>
                <th scope="col" className={th}>Screen</th>
                <th scope="col" className={thRight}>Defects / 300 g</th>
                <th scope="col" className={thRight}>Cupping</th>
                <th scope="col" className={th}><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((l) => {
                const q = l.quality;
                const moistureOk = q.moisturePercent >= 10 && q.moisturePercent <= 12;
                const used = products.filter((p) => p.lotCode === l.code).length;
                return (
                  <tr key={l.code} className={rowClass}>
                    <td className={td}>
                      <Link href={`/trace/${l.code}`} className="font-mono text-xs font-semibold text-accent hover:underline">
                        {l.code}
                      </Link>
                      <div className="text-xs text-muted">{used} product{used === 1 ? "" : "s"}</div>
                    </td>
                    <td className={td}>{formatDate(l.harvestDate)}</td>
                    <td className={td}><Pill>{l.processingMethod}</Pill></td>
                    <td className={`${td} text-xs`}>{l.variety}</td>
                    <td className={`${td} text-xs`}>
                      <ul className="space-y-0.5">
                        {l.farmerIds.map((id) => (
                          <li key={id}>
                            <Link href={`/portal/farmers/${id}`} className="hover:text-accent hover:underline">
                              {getFarmer(id)?.name ?? id}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td className={tdRight}>{formatNumber(l.weightKg)} kg</td>
                    <td className={tdRight}>
                      <span className={moistureOk ? "" : "font-semibold text-red-700"}>{q.moisturePercent}%</span>
                    </td>
                    <td className={td}>{q.screenSize}</td>
                    <td className={tdRight}>{q.defectsPer300g}</td>
                    <td className={tdRight}>
                      <span className={`inline-flex min-w-14 justify-center rounded-md px-2 py-0.5 text-sm font-bold ${scoreTone(q.cuppingScore)}`}>
                        {q.cuppingScore.toFixed(2)}
                      </span>
                    </td>
                    <td className={td}>
                      <Link
                        href={`/trace/${l.code}`}
                        className="inline-flex items-center gap-1 rounded-md border border-border px-2.5 py-1 text-xs font-medium hover:border-accent hover:text-accent"
                      >
                        Trace page<span className="sr-only"> for {l.code}</span>
                        <span aria-hidden="true">→</span>
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </TableWrap>
      </Card>
      <p className="mt-3 text-xs text-muted">Moisture outside 10–12% is highlighted in red. Cupping scores of 85+ are shown in solid green.</p>
    </>
  );
}
