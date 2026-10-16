import type { Metadata } from "next";
import Link from "next/link";
import { formatDate, paymentsPerFarmer, totalFarmerPaymentsXaf } from "@/components/portal/metrics";
import { Card, Initials, PageHeader, Pill, rowClass, StatCard, TableWrap, tableClass, td, tdRight, th, theadClass, thRight } from "@/components/portal/ui";
import { Price } from "@/components/price";
import { farmerPayments, getFarmer } from "@/lib/data";

export const metadata: Metadata = { title: "Farmer payments" };

export default function PaymentsPage() {
  const perFarmer = paymentsPerFarmer();
  const total = totalFarmerPaymentsXaf();
  const records = [...farmerPayments].sort((a, b) => b.paidOn.localeCompare(a.paidOn));
  const mobile = farmerPayments.filter((p) => p.method !== "Cash").reduce((n, p) => n + p.amountXaf, 0);

  return (
    <>
      <PageHeader title="Farmer payments" description="Payments made to member farmers for the coffee they delivered to each lot." />

      <div className="mb-6 grid grid-cols-1 gap-3 min-[420px]:grid-cols-3 sm:gap-4">
        <StatCard label="Total paid" value={<Price xaf={total} />} hint={`${farmerPayments.length} payments`} />
        <StatCard label="Farmers paid" value={`${perFarmer.filter((r) => r.count > 0).length} of ${perFarmer.length}`} tone="accent" />
        <StatCard label="Via mobile money" value={`${Math.round((mobile / total) * 100)}%`} hint={<Price xaf={mobile} />} tone="warm" />
      </div>

      <div className="grid gap-6 xl:grid-cols-5">
        <Card id="per-farmer" title="Totals per farmer" className="xl:col-span-2">
          <ul className="divide-y divide-border">
            {perFarmer.map(({ farmer, count, totalXaf }) => (
              <li key={farmer.id} className="px-4 py-3 sm:px-5">
                <div className="flex items-center gap-3">
                  <Initials name={farmer.name} />
                  <div className="min-w-0 flex-1">
                    <Link href={`/portal/farmers/${farmer.id}`} className="text-sm font-medium hover:text-accent hover:underline">
                      {farmer.name}
                    </Link>
                    <p className="text-xs text-muted">{farmer.village} · {count} payment{count === 1 ? "" : "s"}</p>
                  </div>
                  <span className="text-sm font-semibold tabular-nums"><Price xaf={totalXaf} /></span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-background" aria-hidden="true">
                  <div className="h-full rounded-full bg-accent" style={{ width: `${(totalXaf / Math.max(1, perFarmer[0].totalXaf)) * 100}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </Card>

        <Card id="records" title="Payment records" className="xl:col-span-3">
          <TableWrap label="Payment records">
            <table className={tableClass}>
              <caption className="sr-only">All farmer payment records</caption>
              <thead className={theadClass}>
                <tr>
                  <th scope="col" className={th}>Date</th>
                  <th scope="col" className={th}>Farmer</th>
                  <th scope="col" className={th}>Lot</th>
                  <th scope="col" className={th}>Method</th>
                  <th scope="col" className={thRight}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {records.map((p) => (
                  <tr key={`${p.farmerId}-${p.lotCode}-${p.paidOn}`} className={rowClass}>
                    <td className={td}>{formatDate(p.paidOn)}</td>
                    <td className={td}>
                      <Link href={`/portal/farmers/${p.farmerId}`} className="hover:text-accent hover:underline">
                        {getFarmer(p.farmerId)?.name ?? p.farmerId}
                      </Link>
                    </td>
                    <td className={`${td} font-mono text-xs`}>{p.lotCode}</td>
                    <td className={td}><Pill tone={p.method === "Cash" ? "neutral" : "accent"}>{p.method}</Pill></td>
                    <td className={`${tdRight} font-semibold`}><Price xaf={p.amountXaf} /></td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-border bg-background/70">
                  <th scope="row" colSpan={4} className="px-4 py-3 text-left text-sm font-semibold">Total</th>
                  <td className={`${tdRight} font-bold`}><Price xaf={total} /></td>
                </tr>
              </tfoot>
            </table>
          </TableWrap>
        </Card>
      </div>
    </>
  );
}
