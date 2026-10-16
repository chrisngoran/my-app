"use client";

function Glyph({ plus }: { plus?: boolean }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M3 8h10" />
      {plus && <path d="M8 3v10" />}
    </svg>
  );
}

export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 99,
  label,
}: {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
  label: string;
}) {
  const btn =
    "press flex h-11 w-11 items-center justify-center text-brand pointer-fine:hover:bg-accent-soft disabled:cursor-not-allowed disabled:opacity-40";
  return (
    <div role="group" aria-label={label} className="inline-flex items-center overflow-hidden rounded-lg border border-field-border bg-surface">
      <button type="button" className={btn} onClick={() => onChange(value - 1)} disabled={value <= min} aria-label="Decrease quantity">
        <Glyph />
      </button>
      <span className="type-data w-10 text-center text-base tabular-nums" aria-live="polite">
        {value}
      </span>
      <button type="button" className={btn} onClick={() => onChange(value + 1)} disabled={value >= max} aria-label="Increase quantity">
        <Glyph plus />
      </button>
    </div>
  );
}
