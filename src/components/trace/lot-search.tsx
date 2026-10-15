"use client";

import { useRouter } from "next/navigation";
import { useId, useState } from "react";

function normaliseLotCode(input: string) {
  return input.trim().toUpperCase().replace(/\s+/g, "");
}

export function LotSearch({ codes }: { codes: string[] }) {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
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
    router.push(`/trace/${encodeURIComponent(code)}`);
  }

  return (
    <form onSubmit={onSubmit} noValidate className="w-full">
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
          className="min-w-0 flex-1 rounded-md border border-border bg-surface px-3 py-2.5 font-mono text-base uppercase tracking-wide placeholder:normal-case placeholder:tracking-normal placeholder:text-muted focus:border-accent focus:outline-2 focus:outline-accent/30"
        />
        <datalist id={listId}>
          {codes.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>
        <button
          type="submit"
          className="rounded-md bg-accent px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          Trace my coffee
        </button>
      </div>
      <p id={hintId} className="mt-2 text-xs text-muted">
        You&apos;ll find it printed beneath the QR code on the back of every Green Venture bag.
      </p>
      {error && (
        <p id={errorId} role="alert" className="mt-1 text-sm font-medium text-red-700">
          {error}
        </p>
      )}
    </form>
  );
}
