import { Price } from "@/components/price";

export interface BarDatum {
  key: string;
  label: string;
  valueXaf: number;
  detail?: string;
}

/** Horizontal bar chart drawn with CSS; values in FCFA shown in the chosen currency. */
export function BarChart({ data, caption }: { data: BarDatum[]; caption: string }) {
  const max = Math.max(1, ...data.map((d) => d.valueXaf));
  return (
    <figure className="p-4 sm:p-5">
      <figcaption className="sr-only">{caption}</figcaption>
      <ul className="space-y-4">
        {data.map((d) => {
          const pct = (d.valueXaf / max) * 100;
          return (
            <li key={d.key}>
              <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5 text-sm">
                <span className="min-w-0 font-medium text-foreground">{d.label}</span>
                <span className="tabular-nums text-foreground">
                  <Price xaf={d.valueXaf} />
                  {d.detail ? <span className="ml-1 text-xs text-muted">· {d.detail}</span> : null}
                </span>
              </div>
              <div className="mt-1.5 h-3 overflow-hidden rounded-full bg-background ring-1 ring-inset ring-border" aria-hidden="true">
                <div
                  className="h-full rounded-full bg-linear-to-r from-brand to-warm [print-color-adjust:exact]"
                  style={{ width: `${d.valueXaf > 0 ? Math.max(pct, 2) : 0}%` }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </figure>
  );
}
