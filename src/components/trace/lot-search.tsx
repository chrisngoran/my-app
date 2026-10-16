"use client";

import { useRouter } from "next/navigation";
import { useId, useState, useTransition } from "react";
import { btnGo } from "./buttons";

function normaliseLotCode(input: string) {
  return input.trim().toUpperCase().replace(/\s+/g, "");
}

export function LotSearch({ codes }: { codes: string[] }) {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  // Keeps the button in a "Finding lot…" state until the lot page has loaded,
  // so a slow connection does not feel like a dead tap.
  const [isPending, startTransition] = useTransition();
  const inputId = useId();
  const listId = useId();
  const hintId = useId();
  const errorId = useId();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const code = normaliseLotCode(value);
    if (!code) {
      setError("Enter the lot code printed under the QR code on your bag.");
      return;
    }
    setError(null);
    startTransition(() => {
      router.push(`/trace/${encodeURIComponent(code)}`);
    });
  }

  return (
    <form onSubmit={onSubmit} noValidate aria-busy={isPending || undefined} className="w-full">
      <label htmlFor={inputId} className="block text-sm font-semibold text-foreground">
        Lot code
      </label>
      <div className="mt-2 flex flex-col gap-2 sm:flex-row">
        <input
          id={inputId}
          name="code"
          type="text"
          inputMode="text"
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          list={listId}
          placeholder="e.g. GV-2026-014"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          aria-describedby={error ? `${hintId} ${errorId}` : hintId}
          aria-invalid={error ? true : undefined}
          className="min-h-11 min-w-0 flex-1 rounded-lg border border-border bg-surface px-3 py-2 font-mono text-base uppercase tracking-wide transition-[border-color,box-shadow] duration-150 ease-out placeholder:normal-case placeholder:tracking-normal placeholder:text-muted focus:border-accent focus:ring-2 focus:ring-accent/30 focus:outline-none aria-invalid:border-danger"
        />
        <datalist id={listId}>
          {codes.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>
        <button type="submit" disabled={isPending} className={`${btnGo} sm:min-w-40 disabled:cursor-wait disabled:opacity-90`}>
          {isPending ? (
            <>
              <svg
                viewBox="0 0 16 16"
                aria-hidden="true"
                className="h-4 w-4 shrink-0 animate-[spin_700ms_linear_infinite] motion-reduce:animate-none"
              >
                <circle cx="8" cy="8" r="6.5" fill="none" stroke="currentColor" strokeOpacity="0.3" strokeWidth="2" />
                <path d="M8 1.5a6.5 6.5 0 0 1 6.5 6.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              Finding lot…
            </>
          ) : (
            "Trace my coffee"
          )}
        </button>
      </div>
      <p id={hintId} className="mt-2 text-xs text-muted">
        You&apos;ll find it printed beneath the QR code on the back of every Green Venture bag.
      </p>
      {error && (
        <p
          id={errorId}
          role="alert"
          className="mt-1 text-sm font-medium text-danger transition-[opacity,translate] duration-180 ease-out starting:-translate-y-1 starting:opacity-0 motion-reduce:starting:translate-y-0"
        >
          {error}
        </p>
      )}
    </form>
  );
}
