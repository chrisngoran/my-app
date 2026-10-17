import type { Metadata } from "next";
import { BarChart } from "@/components/portal/bar-chart";
import { CsvButton } from "@/components/portal/csv-button";
import {
  paymentsPerFarmer,
  salesByCity,
  salesByPaymentMethod,
  salesByProduct,
  type SalesRow,
  totalFarmerPaymentsXaf,
  totalSalesXaf,
} from "@/components/portal/metrics";
import { PrintButton } from "@/components/portal/print-button";
import { Card, PageHeader, rowClass, StatCard, TableWrap, tableClass, td, tdRight, th, theadClass, thRight } from "@/components/portal/ui";
import { Price } from "@/components/price";
import { cooperative, orders } from "@/lib/data";

export const metadata: Metadata = { title: "Reports" };

function SalesTable({ rows, label, firstColumn, unitsLabel = "Units" }: { rows: SalesRow[]; label: string; firstColumn: string; unitsLabel?: string }) {
  const total = rows.reduce((n, r) => n + r.totalXaf, 0);
  return (
    <TableWrap label={label}>
      <table className={tableClass}>
        <caption className="sr-only">{label}</caption>
        <thead className={theadClass}>
          <tr>
            <th scope="col" className={th}>{firstColumn}</th>
            <th scope="col" className={thRight}>Orders</th>
            <th scope="col" className={thRight}>{unitsLabel}</th>
            <th scope="col" className={thRight}>Sales</th>
            <th scope="col" className={thRight}>Share</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.key} className={rowClass}>
              <th scope="row" className={`${td} text-left font-medium`}>{r.label}</th>
              <td className={tdRight}>{r.orders}</td>
              <td className={tdRight}>{r.units}</td>
              <td className={`${tdRight} font-semibold`}><Price xaf={r.totalXaf} /></td>
              <td className={`${tdRight} text-muted`}>{total ? Math.round((r.totalXaf / total) * 100) : 0}%</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t-2 border-border bg-background/70">
            <th scope="row" colSpan={3} className="px-4 py-3 text-left text-sm font-semibold">Total</th>
            <td className={`${tdRight} font-bold`}><Price xaf={total} /></td>
            <td className={tdRight}>100%</td>
          </tr>
        </tfoot>
      </table>
    </TableWrap>
  );
}

const SALES_HEADERS = ["Orders", "Units", "Sales (FCFA)"];
const salesCsv = (rows: SalesRow[]) => rows.map((r) => [r.label, r.orders, r.units, r.totalXaf]);

export default function ReportsPage() {
  const byProduct = salesByProduct();
  const byMethod = salesByPaymentMethod();
  const byCity = salesByCity();
  const perFarmer = paymentsPerFarmer();
  const farmerTotal = totalFarmerPaymentsXaf();
  const productTotal = byProduct.reduce((n, r) => n + r.totalXaf, 0);

  return (
    <>
      <PageHeader
        title="Season report 2026"
        description={`${cooperative.name} · ${cooperative.location}. Product sales exclude shipping; payment-method and city totals include it.`}
        actions={<PrintButton />}
      />

      <div className="mb-6 grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 xl:grid-cols-4 sm:gap-4 print:grid-cols-4">
        <StatCard label="Order value" value={<Price xaf={totalSalesXaf()} />} hint={`${orders.length} orders incl. shipping`} />
        <StatCard label="Product sales" value={<Price xaf={productTotal} />} hint="Excluding shipping" tone="accent" />
        <StatCard label="Paid to farmers" value={<Price xaf={farmerTotal} />} hint={`${perFarmer.filter((r) => r.count).length} farmers`} tone="warm" />
        <StatCard label="Top city" value={byCity[0]?.label ?? "—"} hint={byCity[0] ? <Price xaf={byCity[0].totalXaf} /> : undefined} />
      </div>

      <div className="grid gap-6">
        <Card
          id="by-product"
          title="Sales by product"
          action={<CsvButton filename="sales-by-product.csv" headers={["Product", ...SALES_HEADERS]} rows={salesCsv(byProduct)} />}
        >
          <BarChart
            caption="Sales by product"
            data={byProduct.map((r) => ({ key: r.key, label: r.label, valueXaf: r.totalXaf }))}
          />
          <div className="border-t border-border">
            <SalesTable rows={byProduct} label="Sales by product" firstColumn="Product" />
          </div>
        </Card>

        <div className="grid gap-6 xl:grid-cols-2">
          <Card
            id="by-method"
            title="Sales by payment method"
            action={<CsvButton filename="sales-by-payment-method.csv" headers={["Payment method", ...SALES_HEADERS]} rows={salesCsv(byMethod)} />}
          >
            <SalesTable rows={byMethod} label="Sales by payment method" firstColumn="Method" />
          </Card>
          <Card
            id="by-city"
            title="Sales by city"
            action={<CsvButton filename="sales-by-city.csv" headers={["City", ...SALES_HEADERS]} rows={salesCsv(byCity)} />}
          >
            <SalesTable rows={byCity} label="Sales by city" firstColumn="City" />
          </Card>
        </div>

        <Card
          id="farmer-payments"
          title="Farmer payments"
          action={
            <CsvButton
              filename="farmer-payments.csv"
              headers={["Farmer ID", "Farmer", "Village", "Payments", "Total paid (FCFA)"]}
              rows={perFarmer.map((r) => [r.farmer.id, r.farmer.name, r.farmer.village, r.count, r.totalXaf])}
            />
          }
        >
          <TableWrap label="Farmer payments">
            <table className={tableClass}>
              <caption className="sr-only">Total paid per farmer</caption>
              <thead className={theadClass}>
                <tr>
                  <th scope="col" className={th}>Farmer</th>
                  <th scope="col" className={th}>Village</th>
                  <th scope="col" className={thRight}>Payments</th>
                  <th scope="col" className={thRight}>Total paid</th>
                </tr>
              </thead>
              <tbody>
                {perFarmer.map((r) => (
                  <tr key={r.farmer.id} className={rowClass}>
                    <th scope="row" className={`${td} text-left font-medium`}>
                      {r.farmer.name} <span className="font-mono text-xs font-normal text-muted">{r.farmer.id}</span>
                    </th>
                    <td className={td}>{r.farmer.village}</td>
                    <td className={tdRight}>{r.count}</td>
                    <td className={`${tdRight} font-semibold`}><Price xaf={r.totalXaf} /></td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-border bg-background/70">
                  <th scope="row" colSpan={3} className="px-4 py-3 text-left text-sm font-semibold">Total farmer payments</th>
                  <td className={`${tdRight} font-bold`}><Price xaf={farmerTotal} /></td>
                </tr>
              </tfoot>
            </table>
          </TableWrap>
        </Card>
      </div>

      <p className="mt-6 text-xs text-muted">
        Amounts are recorded in FCFA; other currencies are converted for display only. CSV exports are always in FCFA.
      </p>
    </>
  );
}
