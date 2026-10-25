import { Suspense } from "react";
import { CsvButton } from "@/components/portal/csv-button";
import { PriceLineChart } from "@/components/portal/price-line-chart";
import { Card } from "@/components/portal/ui";
import { worldPriceHistoryFor } from "@/lib/world-price";

function changePctLabel(points: { value: number }[]) {
  const first = points[0];
  const last = points.at(-1);
  if (!first || !last) return "";
  const pct = (((last.value - first.value) / first.value) * 100).toFixed(1);
  return `${Number(pct) >= 0 ? "▲" : "▼"} ${Math.abs(Number(pct))}% over this period`;
}

async function ChartContent() {
  const [arabicaRaw, robustaRaw] = await Promise.all([
    worldPriceHistoryFor("KC=F").catch(() => []),
    worldPriceHistoryFor("RC=F").catch(() => worldPriceHistoryFor("RM=F").catch(() => [])),
  ]);

  // KC=F is in US cents/lb → convert to USD/lb for display
  const arabicaPts = arabicaRaw.map((p) => ({ date: p.date, value: p.close / 100 }));
  // RC=F / RM=F is in USD/tonne — display as-is
  const robustaPts = robustaRaw.map((p) => ({ date: p.date, value: p.close }));

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <Card
        id="arabica-price-history"
        title="Arabica C — last 90 days"
        action={
          <CsvButton
            filename="arabica-c-price-history.csv"
            headers={["Date", "Price (USD/lb)"]}
            rows={arabicaPts.map((p) => [p.date, p.value.toFixed(4)])}
          />
        }
      >
        <div className="px-4 pt-4 pb-2 sm:px-5 sm:pt-5">
          <PriceLineChart
            points={arabicaPts}
            ariaLabel="Arabica C daily closing price over the last 90 days"
          />
        </div>
        <p className="border-t border-border px-4 py-2.5 text-xs text-muted sm:px-5">
          ICE New York Arabica C futures (KC=F) · USD per pound · Daily close
          {arabicaPts.length > 1 ? <span className="ml-3 font-medium text-foreground">{changePctLabel(arabicaPts)}</span> : null}
        </p>
      </Card>

      <Card
        id="robusta-price-history"
        title="Robusta — last 90 days"
        action={
          robustaPts.length > 0 ? (
            <CsvButton
              filename="robusta-price-history.csv"
              headers={["Date", "Price (USD/tonne)"]}
              rows={robustaPts.map((p) => [p.date, p.value.toFixed(0)])}
            />
          ) : undefined
        }
      >
        <div className="px-4 pt-4 pb-2 sm:px-5 sm:pt-5">
          <PriceLineChart
            points={robustaPts}
            precision={0}
            ariaLabel="Robusta daily closing price over the last 90 days"
          />
        </div>
        <p className="border-t border-border px-4 py-2.5 text-xs text-muted sm:px-5">
          ICE London Robusta futures (RC=F) · USD per tonne · Daily close
          {robustaPts.length > 1 ? <span className="ml-3 font-medium text-foreground">{changePctLabel(robustaPts)}</span> : null}
        </p>
      </Card>
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      {(["Arabica C — last 90 days", "Robusta — last 90 days"] as const).map((title) => (
        <Card key={title} title={title}>
          <div className="px-4 pt-4 pb-2 sm:px-5 sm:pt-5">
            <div className="h-[220px] animate-pulse rounded-lg bg-background" />
          </div>
          <p className="border-t border-border px-4 py-2.5 text-xs text-muted sm:px-5">Loading…</p>
        </Card>
      ))}
    </div>
  );
}

export function WorldPriceHistoryCard() {
  return (
    <Suspense fallback={<ChartSkeleton />}>
      <ChartContent />
    </Suspense>
  );
}
