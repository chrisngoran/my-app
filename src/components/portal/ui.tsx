import Link from "next/link";
import type { OrderStatus } from "@/lib/types";

export function PageHeader({
  title,
  description,
  actions,
  eyebrow,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  eyebrow?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        {eyebrow ? <div className="mb-1 text-sm text-muted">{eyebrow}</div> : null}
        <h1 className="font-serif text-2xl font-bold text-brand sm:text-3xl">{title}</h1>
        {description ? <p className="mt-1 max-w-2xl text-sm text-muted">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2 print:hidden">{actions}</div> : null}
    </div>
  );
}

export function Card({
  title,
  action,
  children,
  className = "",
  id,
}: {
  title?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  const headingId = id ? `${id}-heading` : undefined;
  return (
    <section
      aria-labelledby={headingId}
      className={`min-w-0 rounded-xl border border-border bg-surface shadow-sm print:break-inside-avoid print:shadow-none ${className}`}
    >
      {title ? (
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-3 sm:px-5">
          <h2 id={headingId} className="font-semibold text-foreground">
            {title}
          </h2>
          {action ? <div className="print:hidden">{action}</div> : null}
        </div>
      ) : null}
      {children}
    </section>
  );
}

export function StatCard({
  label,
  value,
  hint,
  tone = "brand",
  icon,
}: {
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  tone?: "brand" | "accent" | "warm";
  icon?: React.ReactNode;
}) {
  const toneClass = {
    brand: "bg-brand/10 text-brand",
    accent: "bg-accent-soft text-accent",
    warm: "bg-warm/15 text-warm",
  }[tone];
  return (
    <div className="min-w-0 rounded-xl border border-border bg-surface p-4 shadow-sm sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted">{label}</p>
        {icon ? (
          <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${toneClass}`} aria-hidden="true">
            {icon}
          </span>
        ) : null}
      </div>
      <p className="mt-2 break-words text-2xl font-bold text-foreground tabular-nums">{value}</p>
      {hint ? <p className="mt-1 text-xs text-muted">{hint}</p> : null}
    </div>
  );
}

/** Wraps a table so it scrolls horizontally inside its container on phones. */
export function TableWrap({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <div className="overflow-x-auto" role="region" aria-label={label} tabIndex={0}>
      {children}
    </div>
  );
}

export const th = "whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted";
export const thRight = `${th} text-right`;
export const td = "whitespace-nowrap px-4 py-3 align-middle";
export const tdRight = `${td} text-right tabular-nums`;
export const tableClass = "w-full min-w-full border-collapse text-sm";
export const theadClass = "bg-background/70";
export const rowClass = "border-t border-border hover:bg-background/60";

const STATUS_STYLES: Record<OrderStatus, string> = {
  "Pending payment": "bg-amber-100 text-amber-900 ring-amber-300",
  Paid: "bg-sky-100 text-sky-900 ring-sky-300",
  Preparing: "bg-violet-100 text-violet-900 ring-violet-300",
  "Out for delivery": "bg-orange-100 text-orange-900 ring-orange-300",
  Delivered: "bg-accent-soft text-accent ring-accent/30",
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${STATUS_STYLES[status]}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
      {status}
    </span>
  );
}

export function Pill({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "accent" | "warn" }) {
  const cls = {
    neutral: "bg-background text-foreground ring-border",
    accent: "bg-accent-soft text-accent ring-accent/30",
    warn: "bg-red-50 text-red-800 ring-red-200",
  }[tone];
  return (
    <span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${cls}`}>
      {children}
    </span>
  );
}

export function TextLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="font-medium text-accent underline-offset-2 hover:underline">
      {children}
    </Link>
  );
}

export function Initials({ name, className = "" }: { name: string; className?: string }) {
  const text = name
    .split(/\s+/)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <span
      aria-hidden="true"
      className={`inline-flex shrink-0 items-center justify-center rounded-full bg-accent-soft font-semibold text-accent ${className || "h-8 w-8 text-xs"}`}
    >
      {text}
    </span>
  );
}
