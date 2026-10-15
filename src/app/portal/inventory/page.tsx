import type { Metadata } from "next";
import { formatNumber, inventoryTotals, LOW_STOCK_THRESHOLD } from "@/components/portal/metrics";
import { Card, PageHeader, Pill, rowClass, StatCard, TableWrap, tableClass, td, tdRight, th, theadClass, thRight } from "@/components/portal/ui";
import { Price } from "@/components/price";
import { products } from "@/lib/data";

export const metadata: Metadata = { title: "Inventory" };

const CATEGORY_LABEL = { roasted: "Roasted", green: "Green", "micro-lot": "Micro-lot", subscription: "Subscription" } as const;

export default function InventoryPage() {
  const totals = inventoryTotals();
  const maxStock = Math.max(...products.map((p) => p.stock));

  return (
    <>
      <PageHeader title="Inventory" description={`Packed stock ready to sell. Items under ${LOW_STOCK_THRESHOLD} units are flagged for re-packing.`} />

      <div className="mb-6 grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 xl:grid-cols-4 sm:gap-4">
        <StatCard label="Stock value" value={<Price xaf={totals.valueXaf} />} hint="At current retail prices" />
        <StatCard label="Units in stock" value={formatNumber(totals.units)} tone="accent" />
        <StatCard label="Weight" value={`${formatNumber(totals.kg, 1)} kg`} tone="warm" />
        <StatCard
          label="Low stock"
          value={totals.lowStock.length}
          hint={totals.lowStock.map((p) => p.name).join(", ") || "None"}
        />
      </div>

      <Card id="inventory" title="Stock by product">
        <TableWrap label="Stock by product">
          <table className={tableClass}>
            <caption className="sr-only">Stock levels and value by product</caption>
            <thead className={theadClass}>
              <tr>
                <th scope="col" className={th}>Product</th>
                <th scope="col" className={th}>Category</th>
                <th scope="col" className={th}>Lot</th>
                <th scope="col" className={thRight}>Unit price</th>
                <th scope="col" className={th}>Stock level</th>
                <th scope="col" className={thRight}>Weight</th>
                <th scope="col" className={thRight}>Stock value</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => {
                const low = p.stock < LOW_STOCK_THRESHOLD;
                return (
                  <tr key={p.slug} className={`${rowClass} ${low ? "bg-red-50/70 hover:bg-red-50" : ""}`}>
                    <td className={td}>
                      <div className="font-medium">{p.name}</div>
                      <div className="text-xs text-muted">{p.weightGrams >= 1000 ? `${p.weightGrams / 1000} kg` : `${p.weightGrams} g`} pack</div>
                    </td>
                    <td className={td}><Pill>{CATEGORY_LABEL[p.category]}</Pill></td>
                    <td className={`${td} font-mono text-xs`}>{p.lotCode}</td>
                    <td className={tdRight}><Price xaf={p.priceXaf} /></td>
                    <td className={td}>
                      <div className="flex items-center gap-3">
                        <div className="h-2 w-24 overflow-hidden rounded-full bg-background ring-1 ring-inset ring-border" aria-hidden="true">
                          <div className={`h-full rounded-full ${low ? "bg-red-600" : "bg-accent"}`} style={{ width: `${(p.stock / maxStock) * 100}%` }} />
                        </div>
                        <span className={`tabular-nums ${low ? "font-semibold text-red-700" : ""}`}>{p.stock}</span>
                        {low ? <Pill tone="warn">Low stock</Pill> : null}
                      </div>
                    </td>
                    <td className={tdRight}>{formatNumber((p.stock * p.weightGrams) / 1000, 1)} kg</td>
                    <td className={`${tdRight} font-semibold`}><Price xaf={p.stock * p.priceXaf} /></td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-border bg-background/70">
                <th scope="row" colSpan={4} className="px-4 py-3 text-left text-sm font-semibold">Total</th>
                <td className={`${td} tabular-nums font-semibold`}>{formatNumber(totals.units)} units</td>
                <td className={`${tdRight} font-semibold`}>{formatNumber(totals.kg, 1)} kg</td>
                <td className={`${tdRight} font-bold`}><Price xaf={totals.valueXaf} /></td>
              </tr>
            </tfoot>
          </table>
        </TableWrap>
      </Card>
    </>
  );
}
