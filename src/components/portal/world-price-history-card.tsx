import { Suspense } from "react";
import { CsvButton } from "@/components/portal/csv-button";
import { PriceLineChart } from "@/components/portal/price-line-chart";
import { Card } from "@/components/portal/ui";
import { worldPriceHistory } from "@/lib/world-price";

async function ChartContent() {
  const points = await worldPriceHistory();
  const first = points[0];
  const last = points.at(-1);
  const changePct =
    first && last ? (((last.centsPerLb - first.centsPerLb) / first.centsPerLb) * 100).toFixed(1) : null;
  const changeLabel = changePct
    ? `${Number(changePct) >= 0 ? "▲" : "▼"} ${Math.abs(Number(changePct))}% over this period`
    : "";

  return (
    <Card
      id="arabica-price-history"
      title="Arabica C world price — last 90 days"
      action={
        <CsvButton
          filename="arabica-c-price-history.csv"
          headers={["Date", "Price (USD/lb)"]}
          rows={points.map((p) => [p.date, (p.centsPerLb / 100).toFixed(4)])}
        />
      }
    >
      <div className="px-4 pt-4 pb-2 sm:px-5 sm:pt-5">
        <PriceLineChart points={points} />
      </div>
      <p className="border-t border-border px-4 py-2.5 text-xs text-muted sm:px-5">
        ICE New York Arabica C futures (KC=F) · US dollars per pound · Daily close
        {changeLabel ? <span className="ml-3 font-medium text-foreground">{changeLabel}</span> : null}
      </p>
    </Card>
  );
}

function ChartSkeleton() {
  return (
    <Card title="Arabica C world price — last 90 days">
      <div className="px-4 pt-4 pb-2 sm:px-5 sm:pt-5">
        <div className="h-[220px] animate-pulse rounded-lg bg-background" />
      </div>
      <p className="border-t border-border px-4 py-2.5 text-xs text-muted sm:px-5">
        ICE New York Arabica C futures (KC=F) · Loading…
      </p>
    </Card>
  );
}

export function WorldPriceHistoryCard() {
  return (
    <Suspense fallback={<ChartSkeleton />}>
      <ChartContent />
    </Suspense>
  );
}
