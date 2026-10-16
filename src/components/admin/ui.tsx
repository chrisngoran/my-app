"use client";

import { useCallback, useEffect, useState } from "react";

export const inputClass =
  "mt-1 block min-h-12 w-full rounded-lg border border-border bg-surface px-3 py-2 text-base text-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30 aria-[invalid=true]:border-red-600";

export const primaryButton =
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-brand px-5 py-2.5 font-semibold text-brand-contrast hover:bg-brand/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-50";

export const secondaryButton =
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-border bg-surface px-5 py-2.5 font-semibold text-brand hover:border-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

/** Large on/off switch with its label, easy to tap on a phone. */
export function Toggle({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  description?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex min-h-12 w-full items-center justify-between gap-3 rounded-lg border border-border bg-surface px-3 py-2 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
    >
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-foreground">{label}</span>
        {description && <span className="block text-xs text-muted">{description}</span>}
      </span>
      <span
        aria-hidden="true"
        className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors ${checked ? "bg-accent" : "bg-border"}`}
      >
        <span
          className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-6" : "translate-x-1"}`}
        />
      </span>
    </button>
  );
}

export interface ToastMessage {
  text: string;
  tone: "success" | "error";
}

/** A short-lived message at the bottom of the screen. Returns the element to render and a function to show a message. */
export function useToast() {
  const [message, setMessage] = useState<(ToastMessage & { id: number }) | null>(null);

  useEffect(() => {
    if (!message) return;
    const t = window.setTimeout(() => setMessage(null), message.tone === "error" ? 6000 : 3500);
    return () => window.clearTimeout(t);
  }, [message]);

  const show = useCallback((text: string, tone: ToastMessage["tone"] = "success") => {
    setMessage({ text, tone, id: Date.now() });
  }, []);

  const toast = (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex justify-center px-4" role="status" aria-live="polite">
      {message && (
        <p
          key={message.id}
          className={`pointer-events-auto max-w-md rounded-xl px-4 py-3 text-sm font-semibold shadow-lg ${
            message.tone === "error" ? "bg-red-700 text-white" : "bg-accent text-brand-contrast"
          }`}
        >
          {message.text}
        </p>
      )}
    </div>
  );

  return { toast, show };
}

/** A button that asks "Are you sure?" inline before running the action. */
export function ConfirmButton({
  label,
  question,
  confirmLabel,
  onConfirm,
  className = secondaryButton,
}: {
  label: string;
  question: string;
  confirmLabel: string;
  onConfirm: () => void;
  className?: string;
}) {
  const [asking, setAsking] = useState(false);
  if (!asking) {
    return (
      <button type="button" className={className} onClick={() => setAsking(true)}>
        {label}
      </button>
    );
  }
  return (
    <div role="alertdialog" aria-label={question} className="w-full rounded-xl border border-red-200 bg-red-50 p-3">
      <p className="text-sm font-semibold text-red-800">{question}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          className="inline-flex min-h-12 items-center justify-center rounded-lg bg-red-700 px-5 py-2.5 font-semibold text-white hover:bg-red-800"
          onClick={() => {
            setAsking(false);
            onConfirm();
          }}
        >
          {confirmLabel}
        </button>
        <button type="button" className={secondaryButton} onClick={() => setAsking(false)}>
          Cancel
        </button>
      </div>
    </div>
  );
}

export function AdminLoading({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="space-y-3" aria-busy="true" aria-label={label}>
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-24 animate-pulse rounded-2xl bg-border/50" />
      ))}
    </div>
  );
}

export function PageTitle({ title, intro }: { title: string; intro?: React.ReactNode }) {
  return (
    <div>
      <h1 className="font-serif text-2xl font-bold text-brand sm:text-3xl">{title}</h1>
      {intro && <p className="mt-1 text-sm text-muted">{intro}</p>}
    </div>
  );
}
