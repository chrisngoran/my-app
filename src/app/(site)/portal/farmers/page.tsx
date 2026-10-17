import type { Metadata } from "next";
import Link from "next/link";
import { farmerTotalPaidXaf, formatNumber, lotsForFarmer } from "@/components/portal/metrics";
import { Card, Initials, PageHeader, rowClass, StatCard, TableWrap, tableClass, td, tdRight, th, theadClass, thRight } from "@/components/portal/ui";
import { Price } from "@/components/price";
import { farmers } from "@/lib/data";

export const metadata: Metadata = { title: "Farmers" };

export default function FarmersPage() {
  const hectares = farmers.reduce((n, f) => n + f.plotHectares, 0);
  const avgAlt = farmers.reduce((n, f) => n + f.altitudeMetres, 0) / farmers.length;
  const villages = new Set(farmers.map((f) => f.village)).size;

  return (
    <>
      <PageHeader title="Farmers" description="Registered member farmers, their plots and what the cooperative has paid them." />

      <div className="mb-6 grid grid-cols-1 gap-3 min-[420px]:grid-cols-3 sm:gap-4">
        <StatCard label="Members" value={farmers.length} hint={`${villages} villages`} />
        <StatCard label="Area under coffee" value={`${formatNumber(hectares, 1)} ha`} tone="accent" />
        <StatCard label="Average altitude" value={`${formatNumber(avgAlt)} m`} tone="warm" />
      </div>

      <Card id="farmers" title="Member register">
        <TableWrap label="Member farmers">
          <table className={tableClass}>
            <caption className="sr-only">Member farmers</caption>
            <thead className={theadClass}>
              <tr>
                <th scope="col" className={th}>ID</th>
                <th scope="col" className={th}>Name</th>
                <th scope="col" className={th}>Village</th>
                <th scope="col" className={thRight}>Hectares</th>
                <th scope="col" className={thRight}>Altitude</th>
                <th scope="col" className={thRight}>Joined</th>
                <th scope="col" className={thRight}>Lots</th>
                <th scope="col" className={thRight}>Total paid</th>
              </tr>
            </thead>
            <tbody>
              {farmers.map((f) => (
                <tr key={f.id} className={rowClass}>
                  <td className={`${td} font-mono text-xs text-muted`}>{f.id}</td>
                  <td className={td}>
                    <Link href={`/portal/farmers/${f.id}`} className="group flex items-center gap-2.5 font-medium text-foreground">
                      <Initials name={f.name} />
                      <span className="group-hover:text-accent group-hover:underline">{f.name}</span>
                    </Link>
                  </td>
                  <td className={td}>{f.village}</td>
                  <td className={tdRight}>{formatNumber(f.plotHectares, 1)}</td>
                  <td className={tdRight}>{formatNumber(f.altitudeMetres)} m</td>
                  <td className={tdRight}>{f.joinedYear}</td>
                  <td className={tdRight}>{lotsForFarmer(f.id).length}</td>
                  <td className={`${tdRight} font-semibold`}>
                    <Price xaf={farmerTotalPaidXaf(f.id)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableWrap>
      </Card>
    </>
  );
}
