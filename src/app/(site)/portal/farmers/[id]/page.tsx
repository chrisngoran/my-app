import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { farmerTotalPaidXaf, formatDate, formatNumber, lotsForFarmer } from "@/components/portal/metrics";
import {
  Card,
  Initials,
  PageHeader,
  Pill,
  rowClass,
  StatCard,
  TableWrap,
  tableClass,
  td,
  tdRight,
  th,
  theadClass,
  thRight,
} from "@/components/portal/ui";
import { Price } from "@/components/price";
import { farmerPayments, farmers, getFarmer } from "@/lib/data";

// Unknown params must wait for the full render so notFound() and redirect()
// set a real 404/307 status instead of streaming into a 200 response.
export const ensureStatic = "navigation";

export function generateStaticParams() {
  return farmers.map((f) => ({ id: f.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const farmer = getFarmer(id.toUpperCase());
  return { title: farmer ? farmer.name : "Farmer not found" };
}

export default async function FarmerProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const farmer = getFarmer(id.toUpperCase());
  if (!farmer) notFound();

  const farmerLots = lotsForFarmer(farmer.id);
  const payments = farmerPayments
    .filter((p) => p.farmerId === farmer.id)
    .sort((a, b) => b.paidOn.localeCompare(a.paidOn));
  const totalPaid = farmerTotalPaidXaf(farmer.id);

  return (
    <>
      <PageHeader
        eyebrow={
          <nav aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-1.5">
              <li>
                <Link href="/portal/farmers" className="hover:text-accent hover:underline">Farmers</Link>
              </li>
              <li aria-hidden="true">/</li>
              <li aria-current="page" className="font-mono">{farmer.id}</li>
            </ol>
          </nav>
        }
        title={farmer.name}
        description={`Member since ${farmer.joinedYear} · ${farmer.village}, Kumbo`}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card id="profile" title="Profile" className="lg:col-span-1">
          <div className="p-4 sm:p-5">
            <div className="flex items-center gap-3">
              <Initials name={farmer.name} className="h-14 w-14 text-lg" />
              <div className="min-w-0">
                <p className="font-semibold">{farmer.name}</p>
                <p className="text-sm text-muted">{farmer.phone}</p>
              </div>
            </div>
            <blockquote className="mt-4 border-l-4 border-accent/40 pl-3 font-serif text-sm italic text-foreground/85">
              {farmer.story}
            </blockquote>
            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
              {[
                ["Farmer ID", farmer.id],
                ["Village", farmer.village],
                ["Plot size", `${formatNumber(farmer.plotHectares, 1)} ha`],
                ["Altitude", `${formatNumber(farmer.altitudeMetres)} m`],
                ["Joined", String(farmer.joinedYear)],
                ["Lots", String(farmerLots.length)],
              ].map(([k, v]) => (
                <div key={k} className="rounded-lg bg-background p-2.5">
                  <dt className="text-xs text-muted">{k}</dt>
                  <dd className="font-medium">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </Card>

        <div className="grid min-w-0 gap-6 lg:col-span-2">
          <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 sm:gap-4">
            <StatCard label="Total paid" value={<Price xaf={totalPaid} />} hint={`${payments.length} payment${payments.length === 1 ? "" : "s"}`} tone="accent" />
            <StatCard
              label="Lots contributed"
              value={farmerLots.length}
              hint={farmerLots.length ? `Best cupping score ${Math.max(...farmerLots.map((l) => l.quality.cuppingScore))}` : "No lots yet"}
              tone="warm"
            />
          </div>

          <Card id="lots" title="Lots contributed to">
            {farmerLots.length === 0 ? (
              <p className="px-4 py-6 text-sm text-muted sm:px-5">No lots recorded for this farmer yet.</p>
            ) : (
              <TableWrap label="Lots contributed to">
                <table className={tableClass}>
                  <caption className="sr-only">Lots {farmer.name} contributed to</caption>
                  <thead className={theadClass}>
                    <tr>
                      <th scope="col" className={th}>Lot</th>
                      <th scope="col" className={th}>Harvest</th>
                      <th scope="col" className={th}>Process</th>
                      <th scope="col" className={thRight}>Weight</th>
                      <th scope="col" className={thRight}>Cupping</th>
                      <th scope="col" className={th}>Shared with</th>
                    </tr>
                  </thead>
                  <tbody>
                    {farmerLots.map((l) => (
                      <tr key={l.code} className={rowClass}>
                        <td className={td}>
                          <Link href={`/trace/${l.code}`} className="font-mono text-xs font-semibold text-accent hover:underline">
                            {l.code}
                          </Link>
                        </td>
                        <td className={td}>{formatDate(l.harvestDate)}</td>
                        <td className={td}>{l.processingMethod}</td>
                        <td className={tdRight}>{formatNumber(l.weightKg)} kg</td>
                        <td className={tdRight}><Pill tone="accent">{l.quality.cuppingScore}</Pill></td>
                        <td className={`${td} text-xs text-muted`}>
                          {l.farmerIds.length === 1
                            ? "Single-farm lot"
                            : `${l.farmerIds.length - 1} other farmer${l.farmerIds.length > 2 ? "s" : ""}`}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </TableWrap>
            )}
          </Card>

          <Card id="payments" title="Payment history">
            {payments.length === 0 ? (
              <p className="px-4 py-6 text-sm text-muted sm:px-5">No payments recorded yet.</p>
            ) : (
              <TableWrap label="Payment history">
                <table className={tableClass}>
                  <caption className="sr-only">Payments to {farmer.name}</caption>
                  <thead className={theadClass}>
                    <tr>
                      <th scope="col" className={th}>Date</th>
                      <th scope="col" className={th}>Lot</th>
                      <th scope="col" className={th}>Method</th>
                      <th scope="col" className={thRight}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((p) => (
                      <tr key={`${p.lotCode}-${p.paidOn}`} className={rowClass}>
                        <td className={td}>{formatDate(p.paidOn)}</td>
                        <td className={`${td} font-mono text-xs`}>{p.lotCode}</td>
                        <td className={td}>{p.method}</td>
                        <td className={`${tdRight} font-semibold`}><Price xaf={p.amountXaf} /></td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-border bg-background/70">
                      <th scope="row" colSpan={3} className="px-4 py-3 text-left text-sm font-semibold">Total</th>
                      <td className={`${tdRight} font-bold`}><Price xaf={totalPaid} /></td>
                    </tr>
                  </tfoot>
                </table>
              </TableWrap>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}
