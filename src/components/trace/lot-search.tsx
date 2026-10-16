"use client";

import { useRouter } from "next/navigation";
import { useId, useState, useTransition } from "react";
import { btnGo, btnOnDark } from "./buttons";
import { AlertIcon } from "./icons";
import { normaliseLotCode } from "./lot-utils";

/**
 * Lot-code finder. `tone="dark"` sits directly on a Volcanic Soil band (home
 * hero, /trace hero); the default sits on Highland Mist or white.
 */
export function LotSearch({
  codes,
  tone = "light",
  label = "Lot code",
}: {
  codes: string[];
  tone?: "light" | "dark";
  /** Visible label above the field. */
  label?: string;
}) {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  // Re-keys the error on every failed submit, so a repeat tap visibly checks again.
  const [attempt, setAttempt] = useState(0);
  // Keeps the button in a "Finding lot…" state until the lot page has loaded,
  // so a slow connection does not feel like a dead tap.
  const [isPending, startTransition] = useTransition();
  const inputId = useId();
  const listId = useId();
  const hintId = useId();
  const errorId = useId();
  const dark = tone === "dark";

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const code = normaliseLotCode(value);
    if (!code) {
      setError("Enter the lot code printed under the QR code on your bag.");
      setAttempt((n) => n + 1);
      return;
    }
    setError(null);
    startTransition(() => {
      router.push(`/trace/${encodeURIComponent(code)}`);
    });
  }

  return (
    <form onSubmit={onSubmit} noValidate aria-busy={isPending || undefined} className={`w-full ${dark ? "on-dark" : ""}`}>
      <label htmlFor={inputId} className={`type-label block ${dark ? "text-sand" : "text-foreground"}`}>
        {label}
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
          maxLength={40}
          list={listId}
          placeholder="e.g. GV-2026-014"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          aria-describedby={error ? `${hintId} ${errorId}` : hintId}
          aria-invalid={error ? true : undefined}
          className={`min-h-11 min-w-0 flex-1 rounded-lg border bg-surface px-3 py-2 font-mono text-base text-foreground uppercase tracking-wide placeholder:normal-case placeholder:tracking-normal placeholder:text-muted focus:ring-2 focus:outline-none ${
            dark
              ? "border-transparent focus:ring-offset-2 focus:ring-sand focus:ring-offset-brand aria-invalid:border-danger"
              : "border-field-border focus:border-accent focus:ring-accent aria-invalid:border-danger"
          }`}
        />
        <datalist id={listId}>
          {codes.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>
        <button
          type="submit"
          disabled={isPending}
          className={`${dark ? btnOnDark : btnGo} shrink-0 sm:min-w-40 disabled:cursor-wait disabled:opacity-90`}
        >
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
      <p id={hintId} className={`mt-2 text-sm ${dark ? "text-mist-on-soil" : "text-muted"}`}>
        It&apos;s printed under the QR code on the back of every Green Venture bag.
      </p>
      {error && (
        <p
          key={attempt}
          id={errorId}
          role="alert"
          className={`mt-1 flex items-start gap-1.5 text-sm font-semibold transition-[opacity,translate] duration-(--dur-ui) ease-(--ease-out) starting:-translate-y-1 starting:opacity-0 motion-reduce:starting:translate-y-0 ${
            dark ? "text-sand" : "text-danger"
          }`}
        >
          <AlertIcon className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </p>
      )}
    </form>
  );
}
