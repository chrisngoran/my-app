"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export const inputClass =
  "mt-1 block min-h-12 w-full rounded-lg border border-border bg-surface px-3 py-2 text-base text-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30 aria-[invalid=true]:border-danger";

/** Built from the shared `btn` recipes in globals.css. Staff controls stay 48px tall. */
export const primaryButton = "btn btn-primary min-h-12";

export const secondaryButton = "btn btn-secondary min-h-12";

/** Field-level error text. It fades in when it appears. */
export const errorText =
  "mt-1 block text-sm font-medium text-danger transition-[opacity,translate] duration-180 ease-out starting:-translate-y-1 starting:opacity-0 motion-reduce:transition-opacity motion-reduce:duration-150";

/** Small inline spinner for busy states. */
export function Spinner({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={`${className} shrink-0 animate-spin [animation-duration:700ms] motion-reduce:animate-none`}
    >
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="3" opacity="0.25" />
      <path d="M21 12a9 9 0 0 0-9-9" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

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
      className="group flex min-h-12 w-full touch-manipulation items-center justify-between gap-3 rounded-lg border border-border bg-surface px-3 py-2 text-left [transition:background-color_150ms_ease] hover:bg-background active:bg-background"
    >
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-foreground">{label}</span>
        {description && <span className="block text-xs text-muted">{description}</span>}
      </span>
      <span
        aria-hidden="true"
        className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full [transition:background-color_180ms_ease] ${checked ? "bg-accent" : "bg-border"}`}
      >
        <span
          className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-[translate,scale] duration-180 ease-out group-active:scale-92 motion-reduce:transition-none ${checked ? "translate-x-6" : "translate-x-1"}`}
        />
      </span>
    </button>
  );
}

export interface ToastMessage {
  text: string;
  tone: "success" | "error";
}

const TOAST_EXIT_MS = 160;

/**
 * A short-lived message at the bottom of the screen. Returns the element to render and a function to show a message.
 * `raised` lifts it on phones so it clears a sticky action bar.
 */
export function useToast({ raised = false }: { raised?: boolean } = {}) {
  const [message, setMessage] = useState<(ToastMessage & { id: number; leaving?: boolean }) | null>(null);

  useEffect(() => {
    if (!message) return;
    if (message.leaving) {
      const t = window.setTimeout(() => setMessage(null), TOAST_EXIT_MS);
      return () => window.clearTimeout(t);
    }
    const t = window.setTimeout(
      () => setMessage((m) => (m && m.id === message.id ? { ...m, leaving: true } : m)),
      message.tone === "error" ? 6000 : 3500,
    );
    return () => window.clearTimeout(t);
  }, [message]);

  const show = useCallback((text: string, tone: ToastMessage["tone"] = "success") => {
    setMessage({ text, tone, id: Date.now() });
  }, []);

  const toast = (
    <div
      className={`pointer-events-none fixed inset-x-0 z-50 flex justify-center px-4 ${
        raised ? "bottom-[calc(7rem+env(safe-area-inset-bottom))] sm:bottom-4" : "bottom-4"
      }`}
      role="status"
      aria-live="polite"
    >
      {message && (
        <p
          key={message.id}
          className={`pointer-events-auto max-w-md rounded-xl px-4 py-3 text-sm font-semibold shadow-lg transition-[opacity,translate] ease-out motion-reduce:transition-opacity ${
            message.tone === "error" ? "bg-danger text-white" : "bg-accent text-brand-contrast"
          } ${
            message.leaving
              ? "translate-y-2 opacity-0 duration-160 motion-reduce:translate-y-0"
              : "duration-240 starting:translate-y-full starting:opacity-0 motion-reduce:duration-150"
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
  const trigger = useRef<HTMLButtonElement>(null);
  const cancel = useRef<HTMLButtonElement>(null);
  const returnFocus = useRef(false);

  // Move focus into the question when it opens, and back to the trigger when it is cancelled.
  useEffect(() => {
    if (asking) cancel.current?.focus();
    else if (returnFocus.current) {
      returnFocus.current = false;
      trigger.current?.focus();
    }
  }, [asking]);

  if (!asking) {
    return (
      <button ref={trigger} type="button" className={className} onClick={() => setAsking(true)}>
        {label}
      </button>
    );
  }
  return (
    <div
      role="alertdialog"
      aria-label={question}
      className="w-full origin-top-left rounded-xl border border-danger/25 bg-danger-soft p-3 transition-[opacity,scale] duration-200 ease-out starting:scale-98 starting:opacity-0 motion-reduce:transition-opacity motion-reduce:duration-150"
    >
      <p className="text-sm font-semibold text-danger">{question}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          className="btn min-h-12 bg-danger text-white hover:bg-danger/90"
          onClick={() => {
            setAsking(false);
            onConfirm();
          }}
        >
          {confirmLabel}
        </button>
        <button
          ref={cancel}
          type="button"
          className={secondaryButton}
          onClick={() => {
            returnFocus.current = true;
            setAsking(false);
          }}
        >
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
        <div key={i} className="h-24 animate-pulse rounded-2xl bg-border/50 motion-reduce:animate-none" />
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
